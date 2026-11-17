// Lua 5.1 semantics (lvm.c, ldo.c, lapi.c) for the AST of parse.ts: the AST is compiled to JS closures.
// Values: undefined = nil, boolean, number, byte string, LuaTable, LuaFunction, LuaUserdata.
import { parseLua, type Expr, type FuncBody, type Stat } from './parse.ts';
import { LuaTable, refId, type LuaValue } from './table.ts';

export { LuaTable, type LuaValue };

export type NativeFn = (args: LuaValue[]) => LuaValue[];

export class LuaFunction {
  fn: NativeFn; name: string; native: boolean; source: string; line: number;
  constructor(fn: NativeFn, name = '?', native = true, source = '=[C]', line = -1) {
    this.fn = fn; this.name = name; this.native = native; this.source = source; this.line = line;
  }
}

export class LuaUserdata {
  metatable: LuaTable | null = null;
  data: unknown;
  constructor(data: unknown) { this.data = data; }
}

export class LuaError extends Error {
  value: LuaValue; traceback: string;
  constructor(value: LuaValue, traceback = '') {
    super(typeof value === 'string' ? value : `(error object is a ${typeName(value)} value)`);
    this.value = value; this.traceback = traceback;
  }
}

interface Box { v: LuaValue }
interface CallInfo { source: string; line: number; what: 'Lua' | 'main' | 'C'; name: string; defined: number }

const BREAK = { brk: true };
interface Ret { ret: LuaValue[] }

export function typeName(v: LuaValue): string {
  if (v === undefined) return 'nil';
  switch (typeof v) {
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'string': return 'string';
  }
  if (v instanceof LuaTable) return 'table';
  if (v instanceof LuaFunction) return 'function';
  return 'userdata';
}

// ---------- number formatting (%.14g, LUAI_NUMFFORMAT)


// ---------- exact decimal conversion (glibc printf rounds the exact binary value, ties to even)

const cvBuf = new Float64Array(1), cvU = new Uint32Array(cvBuf.buffer);
/** |x| as exact decimal digits and the position of the decimal point (value = 0.digits * 10^point) */
function exactDecimal(x: number): { d: string; p: number } {
  cvBuf[0] = Math.abs(x);
  const hi = cvU[1], lo = cvU[0];
  const bexp = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let e: number;
  if (bexp === 0) e = -1074; else { mant |= 1n << 52n; e = bexp - 1075; }
  if (mant === 0n) return { d: '0', p: 1 };
  let digits: string; let point: number;
  if (e >= 0) { digits = (mant << BigInt(e)).toString(); point = digits.length; }
  else { digits = (mant * 5n ** BigInt(-e)).toString(); point = digits.length + e; }
  digits = digits.replace(/0+$/, '');
  return { d: digits || '0', p: point };
}
/** round digits to keep n digits (n may be <= 0), ties to even; returns new digits and point */
function roundDigits(d: string, p: number, n: number): { d: string; p: number } {
  if (n < 0) return { d: '0', p: p };
  if (d.length <= n) return { d: d.padEnd(n, '0'), p };
  const keep = d.slice(0, n);
  const rest = d.slice(n);
  let up = false;
  if (rest[0] > '5') up = true;
  else if (rest[0] === '5') {
    if (/[1-9]/.test(rest.slice(1))) up = true;
    else up = n > 0 ? (Number(keep[n - 1]) % 2 === 1) : false;
  }
  if (!up) return { d: keep.padEnd(n, '0') || '', p };
  // increment
  const arr = keep.split('').map(Number);
  let i = arr.length - 1;
  while (i >= 0) { if (arr[i] === 9) { arr[i] = 0; i--; } else { arr[i]++; break; } }
  if (i < 0) { arr.unshift(1); return { d: arr.slice(0, Math.max(n, 1)).join(''), p: p + 1 }; }
  return { d: arr.join(''), p };
}
/** %.{prec}e mantissa digits and exponent */
export function expDigits(x: number, prec: number): { d: string; e: number } {
  const ex = exactDecimal(x);
  const r = roundDigits(ex.d, ex.p, prec + 1);
  return { d: r.d.slice(0, prec + 1), e: r.p - 1 };
}
/** %.{prec}f of x, without sign */
export function fixedAbs(x: number, prec: number): string {
  if (x === 0) return prec > 0 ? '0.' + '0'.repeat(prec) : '0';
  const ex = exactDecimal(x);
  const n = ex.p + prec; // digits to keep
  let r = roundDigits(ex.d, ex.p, n);
  let d = r.d, p = r.p;
  if (n <= 0 && d === '0') { d = ''; p = ex.p; }
  if (n === 0 && r.p > ex.p) { /* rounded up to 10^p */ }
  // build integer and fraction
  let all = d;
  if (p <= 0) { all = '0'.repeat(-p + 1) + all; p = 1; }
  const intPart = all.slice(0, p).padEnd(p, '0') || '0';
  let frac = all.slice(p);
  frac = frac.padEnd(prec, '0').slice(0, prec);
  return (intPart.replace(/^0+(?=\d)/, '') || '0') + (prec > 0 ? '.' + frac : '');
}
export function fmtE(x: number, prec: number, upper = false, alt = false): string {
  const sign = x < 0 || Object.is(x, -0) ? '-' : '';
  if (x === 0) return sign + '0' + (prec > 0 || alt ? '.' + '0'.repeat(prec) : '') + (upper ? 'E' : 'e') + '+00';
  const { d, e } = expDigits(x, prec);
  const ae = Math.abs(e);
  return sign + d[0] + (prec > 0 || alt ? '.' + d.slice(1) : '') + (upper ? 'E' : 'e') + (e < 0 ? '-' : '+') + (ae < 10 ? '0' + ae : String(ae));
}
export function fmtF(x: number, prec: number): string {
  return (x < 0 || Object.is(x, -0) ? '-' : '') + fixedAbs(x, prec);
}
export function fmtG(n: number, prec = 14, alt = false, upper = false): string {
  if (n !== n) return upper ? 'NAN' : (negNaN(n) ? '-nan' : 'nan');
  if (n === Infinity) return upper ? 'INF' : 'inf';
  if (n === -Infinity) return upper ? '-INF' : '-inf';
  if (prec === 0) prec = 1;
  if (n === 0) return (Object.is(n, -0) ? '-' : '') + (alt ? '0.' + '0'.repeat(prec - 1) : '0');
  const X = expDigits(n, prec - 1).e;
  let out: string;
  if (X < -4 || X >= prec) {
    out = fmtE(n, prec - 1, upper, alt);
    if (!alt) out = out.replace(/\.?0+(?=[eE])/, '');
  } else {
    out = fmtF(n, prec - 1 - X);
    if (!alt && out.includes('.')) out = out.replace(/0+$/, '').replace(/\.$/, '');
  }
  return out;
}
const nanBuf = new Float64Array(1), nanU = new Uint32Array(nanBuf.buffer);
function negNaN(n: number) { nanBuf[0] = n; return (nanU[1] >>> 31) === 1; }

export function num2str(n: number): string { return fmtG(n, 14); }

export function tonumber(v: LuaValue): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = v.replace(/^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g, '');
    if (t === '') return undefined;
    if (/^[+-]?0[xX][0-9a-fA-F]+$/.test(t)) { const neg = t[0] === '-'; const x = parseInt(t.replace(/^[+-]/, '').slice(2), 16); return neg ? -x : x; }
    if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return Number(t);
    if (/^[+-]?(inf|infinity|nan)$/i.test(t)) return /nan/i.test(t) ? NaN : (t[0] === '-' ? -Infinity : Infinity);
  }
  return undefined;
}

// ---------- the interpreter

export class Lua {
  G = new LuaTable();
  stringMeta: LuaTable | null = null;
  registry = new Map<string, LuaValue>();
  stack: CallInfo[] = [];
  depth = 0;
  /** where print() and io.write() write to */
  write: (s: string) => void = (s) => { process.stdout.write(s); };

  // ----- basic operations
  rawget(t: LuaTable, k: LuaValue) { return t.get(k); }

  metatable(o: LuaValue): LuaTable | null {
    if (o instanceof LuaTable) return o.metatable;
    if (o instanceof LuaUserdata) return o.metatable;
    if (typeof o === 'string') return this.stringMeta;
    return null;
  }
  metamethod(o: LuaValue, event: string): LuaValue {
    const mt = this.metatable(o);
    return mt ? mt.getStr(event) : undefined;
  }

  index(o: LuaValue, k: LuaValue): LuaValue {
    for (let loop = 0; loop < 100; loop++) {
      let h: LuaValue;
      if (o instanceof LuaTable) {
        const v = o.get(k);
        if (v !== undefined) return v;
        if (!o.metatable) return undefined;
        h = o.metatable.getStr('__index');
        if (h === undefined) return undefined;
      } else {
        h = this.metamethod(o, '__index');
        if (h === undefined) this.typeError(o, 'index');
      }
      if (h instanceof LuaFunction) return this.call(h, [o, k])[0];
      o = h;
    }
    throw this.rtError('loop in gettable');
  }

  setindex(o: LuaValue, k: LuaValue, v: LuaValue): void {
    for (let loop = 0; loop < 100; loop++) {
      let h: LuaValue;
      if (o instanceof LuaTable) {
        if (!o.metatable || (h = o.metatable.getStr('__newindex')) === undefined) {
          try { o.set(k, v); } catch (e) { throw this.rtError((e as Error).message); }
          return;
        }
        let slot;
        try { slot = o.slot(k); } catch (e) { throw this.rtError((e as Error).message); }
        if (slot.val !== undefined) { slot.val = v; return; }
      } else {
        h = this.metamethod(o, '__newindex');
        if (h === undefined) this.typeError(o, 'index');
      }
      if (h instanceof LuaFunction) { this.call(h, [o, k, v]); return; }
      o = h;
    }
    throw this.rtError('loop in settable');
  }

  call(f: LuaValue, args: LuaValue[]): LuaValue[] {
    if (f instanceof LuaFunction) {
      if (f.native) {
        if (++this.depth > 190) { this.depth = 0; throw new LuaError('stack overflow'); }
        try { return f.fn(args); } finally { this.depth--; }
      }
      return f.fn(args);
    }
    const h = this.metamethod(f, '__call');
    if (h === undefined) this.typeError(f, 'call');
    return this.call(h, [f, ...args]);
  }

  tostring(v: LuaValue): string {
    const h = this.metamethod(v, '__tostring');
    if (h !== undefined) {
      const r = this.call(h, [v])[0];
      if (typeof r !== 'string') throw new LuaError("'__tostring' must return a string");
      return r;
    }
    return this.rawtostring(v);
  }
  rawtostring(v: LuaValue): string {
    switch (typeName(v)) {
      case 'nil': return 'nil';
      case 'boolean': return v ? 'true' : 'false';
      case 'number': return num2str(v as number);
      case 'string': return v as string;
      default: return `${typeName(v)}: 0x${(0x55550000 + refId(v as object)).toString(16).padStart(8, '0')}`;
    }
  }

  // ----- errors
  where(level = 1): string {
    const ci = this.stack[this.stack.length - level];
    if (!ci || ci.what === 'C' || ci.line < 0) return '';
    return `${shortSrc(ci.source)}:${ci.line}: `;
  }
  rtError(msg: string): LuaError { return new LuaError(this.where(1) + msg); }
  typeError(o: LuaValue, op: string): never {
    throw this.rtError(`attempt to ${op} a ${typeName(o)} value`);
  }

  // ----- arithmetic with metamethods (luaV_arith)
  arith(op: string, a: LuaValue, b: LuaValue): LuaValue {
    const x = tonumber(a), y = tonumber(b);
    if (x !== undefined && y !== undefined) return arithNum(op, x, y);
    const ev = ARITH_EVENTS[op];
    let h = this.metamethod(a, ev);
    if (h === undefined) h = this.metamethod(b, ev);
    if (h === undefined) {
      const bad = x === undefined ? a : b;
      if (op === '..') this.typeError(bad, 'concatenate');
      this.typeError(bad, 'perform arithmetic on');
    }
    return this.call(h, [a, b])[0];
  }
  concat(a: LuaValue, b: LuaValue): LuaValue {
    if ((typeof a === 'string' || typeof a === 'number') && (typeof b === 'string' || typeof b === 'number'))
      return (typeof a === 'number' ? num2str(a) : a) + (typeof b === 'number' ? num2str(b) : b);
    let h = this.metamethod(a, '__concat');
    if (h === undefined) h = this.metamethod(b, '__concat');
    if (h === undefined) this.typeError((typeof a === 'string' || typeof a === 'number') ? b : a, 'concatenate');
    return this.call(h, [a, b])[0];
  }
  eq(a: LuaValue, b: LuaValue): boolean {
    if (a === b) return true;
    if (typeName(a) !== typeName(b)) return false;
    if ((a instanceof LuaTable && b instanceof LuaTable) || (a instanceof LuaUserdata && b instanceof LuaUserdata)) {
      const h1 = this.metamethod(a, '__eq');
      if (h1 === undefined) return false;
      const h2 = this.metamethod(b, '__eq');
      if (h1 !== h2) return false; // get_compTM: both handlers must be the same
      return truthy(this.call(h1, [a, b])[0]);
    }
    return false;
  }
  lt(a: LuaValue, b: LuaValue): boolean {
    if (typeof a === 'number' && typeof b === 'number') return a < b;
    if (typeof a === 'string' && typeof b === 'string') return a < b;
    if (typeName(a) === typeName(b)) {
      const h1 = this.metamethod(a, '__lt');
      if (h1 !== undefined && h1 === this.metamethod(b, '__lt')) return truthy(this.call(h1, [a, b])[0]);
    }
    throw this.rtError(typeName(a) === typeName(b) ? `attempt to compare two ${typeName(a)} values` : `attempt to compare ${typeName(a)} with ${typeName(b)}`);
  }
  le(a: LuaValue, b: LuaValue): boolean {
    if (typeof a === 'number' && typeof b === 'number') return a <= b;
    if (typeof a === 'string' && typeof b === 'string') return a <= b;
    if (typeName(a) === typeName(b)) {
      const h1 = this.metamethod(a, '__le');
      if (h1 !== undefined && h1 === this.metamethod(b, '__le')) return truthy(this.call(h1, [a, b])[0]);
      const h2 = this.metamethod(a, '__lt');
      if (h2 !== undefined && h2 === this.metamethod(b, '__lt')) return !truthy(this.call(h2, [b, a])[0]);
    }
    throw this.rtError(typeName(a) === typeName(b) ? `attempt to compare two ${typeName(a)} values` : `attempt to compare ${typeName(a)} with ${typeName(b)}`);
  }
  len(a: LuaValue): LuaValue {
    if (typeof a === 'string') return a.length;
    if (a instanceof LuaTable) return a.length();
    const h = this.metamethod(a, '__len');
    if (h === undefined) this.typeError(a, 'get length of');
    return this.call(h, [a])[0];
  }
  unm(a: LuaValue): LuaValue {
    const x = tonumber(a);
    if (x !== undefined) return -x;
    const h = this.metamethod(a, '__unm');
    if (h === undefined) this.typeError(a, 'perform arithmetic on');
    return this.call(h, [a, a])[0];
  }

  // ----- loading
  load(src: string, chunk: string, opts?: { dropAsserts?: boolean }): LuaFunction {
    let body: FuncBody;
    try { body = parseLua(src, chunk, opts); } catch (e) { throw new LuaError((e as Error).message); }
    return new Compiler(this).closure(body, [], true);
  }
  doString(src: string, chunk: string): LuaValue[] {
    return this.call(this.load(src, chunk), []);
  }
  getGlobal(name: string): LuaValue { return this.G.get(name); }
  setGlobal(name: string, v: LuaValue) { this.G.set(name, v); }
  /** register a native function: f receives the arguments, returns the results */
  fn(name: string, f: NativeFn): LuaFunction { return new LuaFunction(f, name); }
}

const ARITH_EVENTS: Record<string, string> = { '+': '__add', '-': '__sub', '*': '__mul', '/': '__div', '%': '__mod', '^': '__pow', '..': '__concat' };

export function arithNum(op: string, x: number, y: number): number {
  switch (op) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': return x / y;
    case '%': return x - Math.floor(x / y) * y;
    case '^': return Math.pow(x, y);
  }
  throw new Error(op);
}

export function truthy(v: LuaValue): boolean { return v !== undefined && v !== false; }

export function shortSrc(source: string): string {
  if (source.startsWith('=') || source.startsWith('@')) return source.slice(1);
  const firstLine = source.split('\n')[0];
  const s = firstLine.length > 45 || source.includes('\n') ? firstLine.slice(0, 45) + '...' : firstLine;
  return `[string "${s}"]`;
}

// ---------- compiler

type Fr = { r: LuaValue[]; va: LuaValue[]; up: Box[]; ci: CallInfo };
type EFn = (f: Fr) => LuaValue;
type MFn = (f: Fr) => LuaValue[];
type SFn = (f: Fr) => undefined | typeof BREAK | Ret;

class Compiler {
  private L: Lua;
  constructor(L: Lua) { this.L = L; }

  closure(body: FuncBody, up: Box[], main = false): LuaFunction {
    const L = this.L;
    const block = this.block(body.body);
    const params = body.params.map((p) => ({ slot: p.slot, boxed: p.boxed }));
    const np = body.nparams, nslots = body.nslots, vararg = body.vararg, needsArg = body.needsArg;
    const what = main ? 'main' : 'Lua';
    const source = body.source, defined = body.line, name = body.name;
    const lf = new LuaFunction((args) => {
      const r: LuaValue[] = new Array(nslots);
      for (let i = 0; i < np; i++) {
        const p = params[i];
        r[p.slot] = p.boxed ? { v: args[i] } as unknown as LuaValue : args[i];
      }
      let va: LuaValue[] = [];
      if (vararg) {
        va = args.length > np ? args.slice(np) : [];
        if (!main) {
          let argT: LuaValue = undefined;
          if (needsArg) {
            const t = new LuaTable(va.length, 1);
            va.forEach((v, i) => t.set(i + 1, v));
            t.set('n', va.length);
            argT = t;
          }
          const p = params[np];
          r[p.slot] = p.boxed ? { v: argT } as unknown as LuaValue : argT;
        }
      }
      const ci: CallInfo = { source, line: defined, what, name, defined };
      if (L.stack.length > 180) throw new LuaError(L.where(1) + 'stack overflow');
      L.stack.push(ci);
      try {
        const res = block({ r, va, up, ci });
        if (res !== undefined && res !== BREAK) return (res as Ret).ret;
        return [];
      } finally {
        L.stack.pop();
      }
    }, name, false, source, defined);
    return lf;
  }

  block(stats: Stat[]): SFn {
    const fns = stats.map((s) => this.stat(s));
    if (fns.length === 0) return () => undefined;
    if (fns.length === 1) return fns[0];
    return (f) => {
      for (let i = 0; i < fns.length; i++) {
        const r = fns[i](f);
        if (r !== undefined) return r;
      }
      return undefined;
    };
  }

  private assignLocal(slot: number, boxed: boolean): (f: Fr, v: LuaValue) => void {
    return boxed ? (f, v) => { f.r[slot] = { v } as unknown as LuaValue; } : (f, v) => { f.r[slot] = v; };
  }

  stat(s: Stat): SFn {
    const L = this.L;
    switch (s.k) {
      case 'local': {
        const line = s.line;
        const setters = s.slots.map((x) => this.assignLocal(x.slot, x.boxed));
        const vals = this.exprList(s.exprs, setters.length);
        return (f) => { f.ci.line = line; const v = vals(f); for (let i = 0; i < setters.length; i++) setters[i](f, v[i]); return undefined; };
      }
      case 'localfunc': {
        const body = s.f; const slot = s.slot; const boxed = s.boxed; const line = s.line;
        const mk = this.funcExpr(body);
        if (boxed) return (f) => { f.ci.line = line; const b: Box = { v: undefined }; f.r[slot] = b as unknown as LuaValue; b.v = mk(f); return undefined; };
        return (f) => { f.ci.line = line; f.r[slot] = mk(f); return undefined; };
      }
      case 'assign': {
        const line = s.line;
        if (s.targets.length === 1 && s.exprs.length === 1) {
          const t = s.targets[0];
          const v = this.expr(s.exprs[0]);
          if (t.k === 'index') {
            const o = this.expr(t.obj), k = this.expr(t.key);
            return (f) => { f.ci.line = line; const ov = o(f), kv = k(f); L.setindex(ov, kv, v(f)); return undefined; };
          }
          const set = this.setter(t);
          return (f) => { f.ci.line = line; set(f, v(f)); return undefined; };
        }
        // evaluate table and key expressions first, then values, then assign (right to left like Lua)
        const prep = s.targets.map((t) => t.k === 'index' ? [this.expr(t.obj), this.expr(t.key)] as const : null);
        const sets = s.targets.map((t) => t.k === 'index' ? null : this.setter(t));
        const vals = this.exprList(s.exprs, s.targets.length);
        const n = s.targets.length;
        return (f) => {
          f.ci.line = line;
          const ok: LuaValue[][] = new Array(n);
          for (let i = 0; i < n; i++) { const p = prep[i]; if (p) ok[i] = [p[0](f), p[1](f)]; }
          const v = vals(f);
          for (let i = n - 1; i >= 0; i--) {
            if (prep[i]) L.setindex(ok[i][0], ok[i][1], v[i]); else sets[i]!(f, v[i]);
          }
          return undefined;
        };
      }
      case 'call': {
        const e = this.multi(s.e); const line = s.line;
        return (f) => { f.ci.line = line; e(f); return undefined; };
      }
      case 'do': return this.block(s.body);
      case 'while': {
        const c = this.expr(s.cond), b = this.block(s.body); const line = s.line;
        return (f) => {
          for (;;) {
            f.ci.line = line;
            if (!truthy(c(f))) return undefined;
            const r = b(f);
            if (r === BREAK) return undefined;
            if (r !== undefined) return r;
          }
        };
      }
      case 'repeat': {
        const c = this.expr(s.cond), b = this.block(s.body);
        return (f) => {
          for (;;) {
            const r = b(f);
            if (r === BREAK) return undefined;
            if (r !== undefined) return r;
            if (truthy(c(f))) return undefined;
          }
        };
      }
      case 'if': {
        const cs = s.conds.map((c) => this.expr(c)), bs = s.blocks.map((b) => this.block(b));
        const els = s.orelse ? this.block(s.orelse) : null; const line = s.line;
        return (f) => {
          f.ci.line = line;
          for (let i = 0; i < cs.length; i++) if (truthy(cs[i](f))) return bs[i](f);
          return els ? els(f) : undefined;
        };
      }
      case 'fornum': {
        const a = this.expr(s.start), b = this.expr(s.limit), c = s.step ? this.expr(s.step) : null;
        const body = this.block(s.body); const set = this.assignLocal(s.slot, s.boxed); const line = s.line;
        return (f) => {
          f.ci.line = line;
          const i0 = tonumber(a(f)), lim = tonumber(b(f)), st = c ? tonumber(c(f)) : 1;
          if (i0 === undefined) throw L.rtError("'for' initial value must be a number");
          if (lim === undefined) throw L.rtError("'for' limit must be a number");
          if (st === undefined) throw L.rtError("'for' step must be a number");
          // OP_FORPREP subtracts the step once, OP_FORLOOP adds it before each test
          for (let i = i0 - st; ;) {
            i += st;
            if (!(st > 0 ? i <= lim : lim <= i)) break;
            set(f, i);
            const r = body(f);
            if (r === BREAK) return undefined;
            if (r !== undefined) return r;
          }
          return undefined;
        };
      }
      case 'forin': {
        const ex = this.exprList(s.exprs, 3);
        const sets = s.slots.map((x) => this.assignLocal(x.slot, x.boxed));
        const body = this.block(s.body); const line = s.line;
        return (f) => {
          f.ci.line = line;
          const [gen, state, ctl] = ex(f);
          return runForIn(L, gen, state, ctl, sets, body, f);
        };
      }
      case 'return': {
        const line = s.line;
        if (s.exprs.length === 1 && (s.exprs[0].k === 'call' || s.exprs[0].k === 'method')) {
          const m = this.multi(s.exprs[0]);
          return (f) => { f.ci.line = line; return { ret: m(f) }; };
        }
        const vals = this.exprList(s.exprs, -1);
        return (f) => { f.ci.line = line; return { ret: vals(f) }; };
      }
      case 'break': return () => BREAK;
    }
  }

  setter(t: Expr): (f: Fr, v: LuaValue) => void {
    const L = this.L;
    switch (t.k) {
      case 'local': { const slot = t.slot; return t.boxed ? (f, v) => { (f.r[slot] as unknown as Box).v = v; } : (f, v) => { f.r[slot] = v; }; }
      case 'upval': { const i = t.idx; return (f, v) => { f.up[i].v = v; }; }
      case 'global': { const name = t.name; return (_f, v) => { L.setindex(L.G, name, v); }; }
      case 'index': { const o = this.expr(t.obj), k = this.expr(t.key); return (f, v) => { L.setindex(o(f), k(f), v); }; }
      default: throw new Error('cannot assign');
    }
  }

  /** a list of expressions, adjusted to n values (n = -1: all, the last one expanded) */
  exprList(es: Expr[], n: number): MFn {
    if (es.length === 0) return () => (n > 0 ? new Array(n).fill(undefined) : []);
    const last = es[es.length - 1];
    const multiLast = last.k === 'call' || last.k === 'method' || last.k === 'vararg';
    const singles = (multiLast ? es.slice(0, -1) : es).map((e) => this.expr(e));
    const lastM = multiLast ? this.multi(last) : null;
    return (f) => {
      const out: LuaValue[] = [];
      for (let i = 0; i < singles.length; i++) out.push(singles[i](f));
      if (lastM) { const m = lastM(f); for (let i = 0; i < m.length; i++) out.push(m[i]); }
      if (n >= 0) { if (out.length > n) out.length = n; while (out.length < n) out.push(undefined); }
      return out;
    };
  }

  multi(e: Expr): MFn {
    const L = this.L;
    switch (e.k) {
      case 'vararg': return (f) => f.va.slice();
      case 'call': {
        const fn = this.expr(e.fn), args = this.exprList(e.args, -1); const line = e.line;
        return (f) => { const fv = fn(f); const a = args(f); f.ci.line = line; return L.call(fv, a); };
      }
      case 'method': {
        const o = this.expr(e.obj), args = this.exprList(e.args, -1); const name = e.name; const line = e.line;
        return (f) => {
          const ov = o(f);
          f.ci.line = line;
          const fv = L.index(ov, name);
          const a = args(f);
          a.unshift(ov);
          f.ci.line = line;
          return L.call(fv, a);
        };
      }
      default: { const x = this.expr(e); return (f) => [x(f)]; }
    }
  }

  funcExpr(body: FuncBody): (f: Fr) => LuaValue {
    const ups = body.upvals;
    // compile once, create closures with fresh upvalue arrays
    let proto: ((up: Box[]) => LuaFunction) | null = null;
    return (f) => {
      if (!proto) {
        const c = this;
        // a function body compiles once: we keep a closure factory capturing compiled code
        const template = c.compileProto(body);
        proto = template;
      }
      const up: Box[] = ups.map((u) => u.fromParentLocal ? (f.r[u.idx] as unknown as Box) : f.up[u.idx]);
      return proto(up);
    };
  }

  private compileProto(body: FuncBody): (up: Box[]) => LuaFunction {
    // compile the body once; LuaFunction objects differ only by their upvalues
    const L = this.L;
    const block = this.block(body.body);
    const params = body.params.map((p) => ({ slot: p.slot, boxed: p.boxed }));
    const np = body.nparams, nslots = body.nslots, vararg = body.vararg, needsArg = body.needsArg;
    const source = body.source, defined = body.line, name = body.name;
    return (up) => new LuaFunction((args) => {
      const r: LuaValue[] = new Array(nslots);
      for (let i = 0; i < np; i++) {
        const p = params[i];
        r[p.slot] = p.boxed ? { v: args[i] } as unknown as LuaValue : args[i];
      }
      let va: LuaValue[] = [];
      if (vararg) {
        va = args.length > np ? args.slice(np) : [];
        let argT: LuaValue = undefined;
        if (needsArg) {
          const t = new LuaTable(va.length, 1);
          va.forEach((v, i) => t.set(i + 1, v));
          t.set('n', va.length);
          argT = t;
        }
        const p = params[np];
        r[p.slot] = p.boxed ? { v: argT } as unknown as LuaValue : argT;
      }
      const ci: CallInfo = { source, line: defined, what: 'Lua', name, defined };
      if (L.stack.length > 180) throw new LuaError(L.where(1) + 'stack overflow');
      L.stack.push(ci);
      try {
        const res = block({ r, va, up, ci });
        if (res !== undefined && res !== BREAK) return (res as Ret).ret;
        return [];
      } finally {
        L.stack.pop();
      }
    }, name, false, source, defined);
  }

  expr(e: Expr): EFn {
    const L = this.L;
    switch (e.k) {
      case 'nil': return () => undefined;
      case 'true': return () => true;
      case 'false': return () => false;
      case 'num': { const v = e.v; return () => v; }
      case 'str': { const v = e.v; return () => v; }
      case 'vararg': return (f) => f.va[0];
      case 'func': return this.funcExpr(e.f);
      case 'local': { const slot = e.slot; return e.boxed ? (f) => (f.r[slot] as unknown as Box).v : (f) => f.r[slot]; }
      case 'upval': { const i = e.idx; return (f) => f.up[i].v; }
      case 'global': {
        const name = e.name; const G = L.G;
        return () => { const v = G.getStr(name); return v !== undefined || !G.metatable ? v : L.index(G, name); };
      }
      case 'index': {
        const o = this.expr(e.obj);
        if (e.key.k === 'str') { const k = e.key.v; return (f) => { const ov = o(f); if (ov instanceof LuaTable) { const v = ov.getStr(k); if (v !== undefined || !ov.metatable) return v; } return L.index(ov, k); }; }
        const k = this.expr(e.key);
        return (f) => { const ov = o(f); return L.index(ov, k(f)); };
      }
      case 'call': case 'method': { const m = this.multi(e); return (f) => m(f)[0]; }
      case 'paren': return this.expr(e.e);
      case 'and': { const a = this.expr(e.a), b = this.expr(e.b); return (f) => { const x = a(f); return truthy(x) ? b(f) : x; }; }
      case 'or': { const a = this.expr(e.a), b = this.expr(e.b); return (f) => { const x = a(f); return truthy(x) ? x : b(f); }; }
      case 'un': {
        const a = this.expr(e.a); const line = e.line;
        switch (e.op) {
          case 'not': return (f) => !truthy(a(f));
          case '-': return (f) => { const x = a(f); if (typeof x === 'number') return -x; f.ci.line = line; return L.unm(x); };
          default: return (f) => { const x = a(f); f.ci.line = line; return L.len(x); };
        }
      }
      case 'bin': {
        const a = this.expr(e.a), b = this.expr(e.b); const op = e.op; const line = e.line;
        switch (op) {
          case '+': return (f) => { const x = a(f), y = b(f); if (typeof x === 'number' && typeof y === 'number') return x + y; f.ci.line = line; return L.arith(op, x, y); };
          case '-': return (f) => { const x = a(f), y = b(f); if (typeof x === 'number' && typeof y === 'number') return x - y; f.ci.line = line; return L.arith(op, x, y); };
          case '*': return (f) => { const x = a(f), y = b(f); if (typeof x === 'number' && typeof y === 'number') return x * y; f.ci.line = line; return L.arith(op, x, y); };
          case '/': case '%': case '^': return (f) => { const x = a(f), y = b(f); f.ci.line = line; return L.arith(op, x, y); };
          case '..': return (f) => { const x = a(f), y = b(f); f.ci.line = line; return L.concat(x, y); };
          case '==': return (f) => { const x = a(f), y = b(f); return x === y || L.eq(x, y); };
          case '~=': return (f) => { const x = a(f), y = b(f); return !(x === y || L.eq(x, y)); };
          case '<': return (f) => { const x = a(f), y = b(f); f.ci.line = line; return L.lt(x, y); };
          case '<=': return (f) => { const x = a(f), y = b(f); f.ci.line = line; return L.le(x, y); };
          case '>': return (f) => { const x = a(f), y = b(f); f.ci.line = line; return L.lt(y, x); };
          case '>=': return (f) => { const x = a(f), y = b(f); f.ci.line = line; return L.le(y, x); };
        }
        throw new Error(op);
      }
      case 'table': {
        const na = e.na, nh = e.nh; const line = e.line;
        const items = e.items, nItems = items.length;
        const lastMulti = nItems > 0 && (items[nItems - 1].k === 'call' || items[nItems - 1].k === 'method' || items[nItems - 1].k === 'vararg');
        const itemFns = items.map((it, i) => (i === nItems - 1 && lastMulti) ? null : this.expr(it));
        const lastM = lastMulti ? this.multi(items[nItems - 1]) : null;
        const fieldFns = e.fields.map((fl) => [this.expr(fl.key), this.expr(fl.val)] as const);
        const order = e.order;
        // OP_NEWTABLE sizes are "floating point bytes" (luaO_int2fb)
        const sa = fb2intRound(na), sh = fb2intRound(nh);
        return (f) => {
          const t = new LuaTable(sa, sh);
          // list items are kept in registers and flushed every 50 (LFIELDS_PER_FLUSH); hash fields are set at once
          let pending: LuaValue[] = [];
          let flushed = 0;
          let ii = 0, fi = 0;
          for (let i = 0; i < order.length; i++) {
            if (order[i] === 'f') {
              const [kf, vf] = fieldFns[fi++];
              const k = kf(f);
              f.ci.line = line;
              try { t.set(k, vf(f)); } catch (err) { throw L.rtError((err as Error).message); }
            } else {
              const fn = itemFns[ii++];
              if (fn) pending.push(fn(f));
              else {
                const m = lastM!(f);
                const last = flushed + pending.length + m.length;
                if (last > t.sizearray) t.resizearray(last);
                for (const v of pending) t.set(++flushed, v);
                for (const v of m) t.set(++flushed, v);
                pending = [];
              }
              if (pending.length === 50) { for (const v of pending) t.set(++flushed, v); pending = []; }
            }
          }
          for (const v of pending) t.set(++flushed, v);
          return t;
        };
      }
    }
  }
}

function fb2intRound(x: number): number {
  let e = 0;
  while (x >= 16) { x = (x + 1) >> 1; e++; }
  if (x < 8) return x;
  const fb = ((e + 1) << 3) | (x - 8);
  const ee = (fb >> 3) & 31;
  return ee === 0 ? fb : ((fb & 7) + 8) << (ee - 1);
}

function runForIn(L: Lua, gen: LuaValue, state: LuaValue, ctl: LuaValue, sets: ((f: Fr, v: LuaValue) => void)[], body: SFn, f: Fr) {
  for (;;) {
    const r = L.call(gen, [state, ctl]);
    const v0 = r[0];
    if (v0 === undefined) return undefined;
    ctl = v0;
    for (let i = 0; i < sets.length; i++) sets[i](f, r[i]);
    const res = body(f);
    if (res === BREAK) return undefined;
    if (res !== undefined) return res;
  }
}
