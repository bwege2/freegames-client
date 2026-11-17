// A Lua 5.0 interpreter: the syntax tree is compiled into JS closures. Values: nil = undefined,
// booleans, numbers (doubles only, as Lua 5.0), strings (byte strings), LuaTable, LuaFunction.
import { parse, type Expr, type FuncBody, type Stat } from './parser.ts';
import { fmtGexact } from './numfmt.ts';

export type LuaValue = undefined | boolean | number | string | LuaTable | LuaFunction;
export type NativeFn = (args: LuaValue[]) => LuaValue[] | LuaValue | void;

export class LuaError extends Error {
  value: LuaValue;
  traceback: string;
  constructor(value: LuaValue, traceback = '') {
    super(typeof value === 'string' ? value : `(error object is a ${typeName(value)} value)`);
    this.value = value;
    this.traceback = traceback;
  }
}

export class LuaFunction {
  readonly call: (args: LuaValue[]) => LuaValue[];
  readonly name: string;
  constructor(call: (args: LuaValue[]) => LuaValue[], name = '?') {
    this.call = call;
    this.name = name;
  }
}

/** a Lua table: an array part 1..n and a hash part in insertion order */
export class LuaTable {
  arr: LuaValue[] = []; // arr[i] is key i+1
  hash = new Map<LuaValue, LuaValue>();
  metatable: LuaTable | null = null;

  get(key: LuaValue): LuaValue {
    if (typeof key === 'number') {
      const i = key - 1;
      if (i >= 0 && i < this.arr.length && Number.isInteger(key)) return this.arr[i];
      if (Object.is(key, -0)) key = 0;
    }
    return this.hash.get(key);
  }

  set(key: LuaValue, value: LuaValue): void {
    if (typeof key === 'number') {
      if (Number.isNaN(key)) throw new LuaError('table index is NaN');
      if (Object.is(key, -0)) key = 0;
      if (Number.isInteger(key) && key >= 1) {
        const i = key - 1;
        if (i < this.arr.length) {
          this.arr[i] = value;
          if (value === undefined && i === this.arr.length - 1) {
            // shrink trailing nils
            let n = this.arr.length - 1;
            while (n > 0 && this.arr[n - 1] === undefined) n--;
            this.arr.length = n;
          }
          return;
        }
        if (i === this.arr.length) {
          if (value === undefined) { this.hash.delete(key); return; }
          this.arr.push(value);
          this.hash.delete(key);
          // move following keys from the hash part
          for (let k = key + 1; this.hash.has(k); k++) {
            this.arr.push(this.hash.get(k));
            this.hash.delete(k);
          }
          return;
        }
      }
    } else if (key === undefined) {
      throw new LuaError('table index is nil');
    }
    if (value === undefined) this.hash.delete(key);
    else this.hash.set(key, value);
  }

  /** the border, as luaH_getn (table.getn without an "n" field) */
  length(): number {
    if (this.arr.length > 0) return this.arr.length;
    let n = 0;
    while (this.hash.get(n + 1) !== undefined) n++;
    return n;
  }

  /** next(key): array part first, then the hash part in insertion order */
  next(key: LuaValue): [LuaValue, LuaValue] | undefined {
    let i = 0;
    if (key !== undefined) {
      if (typeof key === 'number' && Number.isInteger(key) && key >= 1 && key <= this.arr.length) {
        i = key;
      } else {
        // continue in the hash part after `key`
        let found = false;
        for (const [k, v] of this.hash) {
          if (found && v !== undefined) return [k, v];
          if (k === key) found = true;
        }
        if (!found) throw new LuaError("invalid key to 'next'");
        return undefined;
      }
    }
    for (; i < this.arr.length; i++) if (this.arr[i] !== undefined) return [i + 1, this.arr[i]];
    for (const [k, v] of this.hash) if (v !== undefined) return [k, v];
    return undefined;
  }
}

export function typeName(v: LuaValue): string {
  if (v === undefined) return 'nil';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'string') return 'string';
  if (v instanceof LuaTable) return 'table';
  return 'function';
}

/** printf("%.14g"), LUA_NUMBER_FMT */
export function fmtG(x: number, prec = 14, alt = false): string {
  return fmtGexact(x, prec, alt);
}

export function tostr(v: LuaValue): string | undefined {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return fmtG(v);
  return undefined;
}

export function tonum(v: LuaValue): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = v.replace(/^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g, '');
    if (t === '') return undefined;
    if (/^[-+]?0[xX][0-9a-fA-F]+$/.test(t)) {
      const neg = t[0] === '-';
      const n = parseInt(t.replace(/^[-+]?0[xX]/, ''), 16);
      return neg ? -n : n;
    }
    if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(t)) return Number(t);
    if (/^[-+]?inf(inity)?$/i.test(t)) return t[0] === '-' ? -Infinity : Infinity;
    if (/^[-+]?nan$/i.test(t)) return NaN;
  }
  return undefined;
}

export const truthy = (v: LuaValue): boolean => v !== undefined && v !== false;

// ---------------------------------------------------------------- the interpreter

interface Box { v: LuaValue }
interface Frame { regs: Box[]; ups: Box[]; varargs: LuaValue[]; ret: LuaValue[] }

type Ev = (f: Frame) => LuaValue;
type EvM = (f: Frame) => LuaValue[];
type Ex = (f: Frame) => number; // 0 normal, 1 break, 2 return

/** compile-time scope of one function */
class FuncState {
  blocks: Map<string, number>[] = [new Map()];
  nregs = 0;
  upnames = new Map<string, number>();
  upsrc: { fromParentReg: boolean; idx: number }[] = [];
  parent: FuncState | null;
  constructor(parent: FuncState | null) { this.parent = parent; }

  declare(name: string): number {
    const r = this.nregs++;
    this.blocks[this.blocks.length - 1].set(name, r);
    return r;
  }

  findLocal(name: string): number | undefined {
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const r = this.blocks[i].get(name);
      if (r !== undefined) return r;
    }
    return undefined;
  }

  findUp(name: string): number | undefined {
    const u = this.upnames.get(name);
    if (u !== undefined) return u;
    if (!this.parent) return undefined;
    const r = this.parent.findLocal(name);
    if (r !== undefined) {
      this.upsrc.push({ fromParentReg: true, idx: r });
    } else {
      const pu = this.parent.findUp(name);
      if (pu === undefined) return undefined;
      this.upsrc.push({ fromParentReg: false, idx: pu });
    }
    const idx = this.upsrc.length - 1;
    this.upnames.set(name, idx);
    return idx;
  }
}

const BREAK = 1;
const RETURN = 2;

export class Lua {
  globals = new LuaTable();
  stringMeta: LuaTable | null = null;
  /** call depth, to stop runaway recursion with a Lua error instead of a JS stack overflow */
  private depth = 0;

  constructor() {
    this.globals.set('_G', this.globals);
  }

  setGlobal(name: string, v: LuaValue | NativeFn): void {
    this.globals.set(name, typeof v === 'function' ? this.fn(name, v) : v);
  }

  getGlobal(name: string): LuaValue { return this.globals.get(name); }

  fn(name: string, f: NativeFn): LuaFunction {
    return new LuaFunction((args) => {
      const r = f(args);
      if (r === undefined) return [];
      return Array.isArray(r) ? r : [r];
    }, name);
  }

  /** compile a chunk into a function (loadstring) */
  load(src: string, chunk = '?'): LuaFunction {
    const body = parse(src, chunk);
    const fs = new FuncState(null);
    const make = this.compileFunc(body, fs, chunk);
    return make({ regs: [], ups: [], varargs: [], ret: [] });
  }

  run(src: string, chunk = '?'): LuaValue[] {
    return this.load(src, chunk).call([]);
  }

  call(f: LuaValue, args: LuaValue[]): LuaValue[] {
    if (f instanceof LuaFunction) return f.call(args);
    const h = this.metaOf(f)?.get('__call');
    if (h !== undefined) return this.call(h, [f, ...args]);
    throw new LuaError(`attempt to call a ${typeName(f)} value`);
  }

  metaOf(v: LuaValue): LuaTable | null {
    if (v instanceof LuaTable) return v.metatable;
    if (typeof v === 'string') return this.stringMeta;
    return null;
  }

  index(o: LuaValue, k: LuaValue): LuaValue {
    for (let loop = 0; loop < 100; loop++) {
      let h: LuaValue;
      if (o instanceof LuaTable) {
        const v = o.get(k);
        if (v !== undefined) return v;
        h = o.metatable?.get('__index');
        if (h === undefined) return undefined;
      } else {
        h = this.metaOf(o)?.get('__index');
        if (h === undefined) throw new LuaError(`attempt to index a ${typeName(o)} value`);
      }
      if (h instanceof LuaFunction) return h.call([o, k])[0];
      o = h;
    }
    throw new LuaError('loop in gettable');
  }

  setIndex(o: LuaValue, k: LuaValue, v: LuaValue): void {
    for (let loop = 0; loop < 100; loop++) {
      let h: LuaValue;
      if (o instanceof LuaTable) {
        if (o.metatable === null || o.get(k) !== undefined) { o.set(k, v); return; }
        h = o.metatable.get('__newindex');
        if (h === undefined) { o.set(k, v); return; }
      } else {
        h = this.metaOf(o)?.get('__newindex');
        if (h === undefined) throw new LuaError(`attempt to index a ${typeName(o)} value`);
      }
      if (h instanceof LuaFunction) { h.call([o, k, v]); return; }
      o = h;
    }
    throw new LuaError('loop in settable');
  }

  private arith(op: string, a: LuaValue, b: LuaValue): LuaValue {
    const x = tonum(a), y = tonum(b);
    if (x !== undefined && y !== undefined) {
      switch (op) {
        case '+': return x + y;
        case '-': return x - y;
        case '*': return x * y;
        case '/': return x / y;
        case '%': return x - Math.floor(x / y) * y;
        case '^': return Math.pow(x, y);
      }
    }
    const ev = ({ '+': '__add', '-': '__sub', '*': '__mul', '/': '__div', '%': '__mod', '^': '__pow' } as Record<string, string>)[op];
    const h = this.metaOf(a)?.get(ev) ?? this.metaOf(b)?.get(ev);
    if (h !== undefined) return this.call(h, [a, b])[0];
    const bad = tonum(a) === undefined ? a : b;
    throw new LuaError(`attempt to perform arithmetic on a ${typeName(bad)} value`);
  }

  private concat(a: LuaValue, b: LuaValue): LuaValue {
    const x = tostr(a), y = tostr(b);
    if (x !== undefined && y !== undefined) return x + y;
    const h = this.metaOf(a)?.get('__concat') ?? this.metaOf(b)?.get('__concat');
    if (h !== undefined) return this.call(h, [a, b])[0];
    const bad = x === undefined ? a : b;
    throw new LuaError(`attempt to concatenate a ${typeName(bad)} value`);
  }

  eq(a: LuaValue, b: LuaValue): boolean {
    if (a === b) return true;
    if (a instanceof LuaTable && b instanceof LuaTable) {
      const h = a.metatable?.get('__eq');
      if (h !== undefined && h === b.metatable?.get('__eq')) return truthy(this.call(h, [a, b])[0]);
    }
    return false;
  }

  lt(a: LuaValue, b: LuaValue): boolean {
    if (typeof a === 'number' && typeof b === 'number') return a < b;
    if (typeof a === 'string' && typeof b === 'string') return a < b;
    const h = this.metaOf(a)?.get('__lt');
    if (h !== undefined) return truthy(this.call(h, [a, b])[0]);
    throw new LuaError(`attempt to compare ${typeName(a)} with ${typeName(b)}`);
  }

  le(a: LuaValue, b: LuaValue): boolean {
    if (typeof a === 'number' && typeof b === 'number') return a <= b;
    if (typeof a === 'string' && typeof b === 'string') return a <= b;
    const h = this.metaOf(a)?.get('__le');
    if (h !== undefined) return truthy(this.call(h, [a, b])[0]);
    const h2 = this.metaOf(a)?.get('__lt');
    if (h2 !== undefined) return !truthy(this.call(h2, [b, a])[0]);
    throw new LuaError(`attempt to compare ${typeName(a)} with ${typeName(b)}`);
  }

  // ------------------------------------------------------------ compiler

  private compileFunc(fb: FuncBody, fs: FuncState, chunk: string): (parent: Frame) => LuaFunction {
    const nparams = fb.params.length;
    const paramRegs = fb.params.map((p) => fs.declare(p));
    let argReg = -1;
    // Lua 5.0: a vararg function gets its extra arguments in the local table `arg` (with field n)
    const usesArg = fb.vararg && fb.name !== 'main chunk';
    if (usesArg) argReg = fs.declare('arg');
    const body = this.compileBlock(fb.body, fs, chunk, false);
    const upsrc = fs.upsrc;
    const vararg = fb.vararg;
    const name = fb.name;
    const self = this;
    return (parent: Frame) => {
      const ups: Box[] = upsrc.map((u) => (u.fromParentReg ? parent.regs[u.idx] : parent.ups[u.idx]));
      return new LuaFunction((args: LuaValue[]) => {
        const regs: Box[] = new Array(fs.nregs);
        for (let i = 0; i < nparams; i++) regs[paramRegs[i]] = { v: args[i] };
        let varargs: LuaValue[] = [];
        if (vararg) {
          varargs = args.length > nparams ? args.slice(nparams) : [];
          if (argReg >= 0) {
            const t = new LuaTable();
            varargs.forEach((v, i) => t.set(i + 1, v));
            t.set('n', varargs.length);
            regs[argReg] = { v: t };
          }
        }
        const f: Frame = { regs, ups, varargs, ret: [] };
        if (++self.depth > 180) { self.depth = 0; throw new LuaError('stack overflow'); }
        try {
          return body(f) === RETURN ? f.ret : [];
        } finally {
          self.depth--;
        }
      }, name);
    };
  }

  private compileBlock(stats: Stat[], fs: FuncState, chunk: string, newScope = true): Ex {
    if (newScope) fs.blocks.push(new Map());
    const list = stats.map((s) => this.compileStat(s, fs, chunk));
    if (newScope) fs.blocks.pop();
    const n = list.length;
    if (n === 0) return () => 0;
    if (n === 1) return list[0];
    return (f) => {
      for (let i = 0; i < n; i++) {
        const r = list[i](f);
        if (r !== 0) return r;
      }
      return 0;
    };
  }

  private withLine<T>(line: number, chunk: string, fnc: () => T): T {
    try {
      return fnc();
    } catch (e) {
      if (e instanceof LuaError && typeof e.value === 'string' && !e.traceback) {
        e.traceback = `${chunk}:${line}`;
        e.value = `${chunk}:${line}: ${e.value}`;
        e.message = e.value;
      }
      throw e;
    }
  }

  private compileStat(s: Stat, fs: FuncState, chunk: string): Ex {
    switch (s.k) {
      case 'local': {
        if (s.names.length === 1 && s.exprs.length === 1 && !isMulti(s.exprs[0])) {
          const e = this.compileExpr(s.exprs[0], fs, chunk);
          const r = fs.declare(s.names[0]);
          return (f) => { f.regs[r] = { v: e(f) }; return 0; };
        }
        const exprs = this.compileExprList(s.exprs, fs, chunk);
        const regs = s.names.map((nm) => fs.declare(nm)); // declared after the expressions
        const n = regs.length;
        return (f) => {
          const vals = exprs(f);
          for (let i = 0; i < n; i++) f.regs[regs[i]] = { v: vals[i] };
          return 0;
        };
      }
      case 'localfunc': {
        const r = fs.declare(s.name);
        const make = this.compileFunc(s.f, new FuncState(fs), chunk);
        return (f) => { const box: Box = { v: undefined }; f.regs[r] = box; box.v = make(f); return 0; };
      }
      case 'assign': {
        const line = s.line;
        if (s.targets.length === 1 && s.exprs.length === 1) {
          const set = this.compileSetter(s.targets[0], fs, chunk);
          const e = this.compileExpr(s.exprs[0], fs, chunk);
          return (f) => { const v = e(f); this.withLine(line, chunk, () => set(f, v)); return 0; };
        }
        const sets = s.targets.map((t) => this.compileSetter(t, fs, chunk));
        const exprs = this.compileExprList(s.exprs, fs, chunk);
        return (f) => {
          const vals = exprs(f);
          this.withLine(line, chunk, () => { for (let i = 0; i < sets.length; i++) sets[i](f, vals[i]); });
          return 0;
        };
      }
      case 'call': {
        const e = this.compileMulti(s.e, fs, chunk);
        return (f) => { e(f); return 0; };
      }
      case 'do':
        return this.compileBlock(s.body, fs, chunk);
      case 'while': {
        const cond = this.compileExpr(s.cond, fs, chunk);
        const body = this.compileBlock(s.body, fs, chunk);
        return (f) => {
          while (truthy(cond(f))) {
            const r = body(f);
            if (r === BREAK) break;
            if (r === RETURN) return r;
          }
          return 0;
        };
      }
      case 'repeat': {
        fs.blocks.push(new Map());
        const list = s.body.map((st) => this.compileStat(st, fs, chunk));
        const cond = this.compileExpr(s.cond, fs, chunk);
        fs.blocks.pop();
        return (f) => {
          for (;;) {
            for (const st of list) {
              const r = st(f);
              if (r === BREAK) return 0;
              if (r === RETURN) return r;
            }
            if (truthy(cond(f))) return 0;
          }
        };
      }
      case 'if': {
        const conds = s.conds.map((c) => this.compileExpr(c, fs, chunk));
        const blocks = s.blocks.map((b) => this.compileBlock(b, fs, chunk));
        const orelse = s.orelse ? this.compileBlock(s.orelse, fs, chunk) : null;
        const n = conds.length;
        return (f) => {
          for (let i = 0; i < n; i++) if (truthy(conds[i](f))) return blocks[i](f);
          return orelse ? orelse(f) : 0;
        };
      }
      case 'fornum': {
        const start = this.compileExpr(s.start, fs, chunk);
        const limit = this.compileExpr(s.limit, fs, chunk);
        const step = s.step ? this.compileExpr(s.step, fs, chunk) : () => 1;
        fs.blocks.push(new Map());
        const r = fs.declare(s.v);
        const body = this.compileBlock(s.body, fs, chunk);
        fs.blocks.pop();
        return (f) => {
          const a = tonum(start(f)), b = tonum(limit(f)), c = tonum(step(f));
          if (a === undefined) throw new LuaError("'for' initial value must be a number");
          if (b === undefined) throw new LuaError("'for' limit must be a number");
          if (c === undefined) throw new LuaError("'for' step must be a number");
          for (let i = a; c > 0 ? i <= b : i >= b; i += c) {
            f.regs[r] = { v: i };
            const res = body(f);
            if (res === BREAK) break;
            if (res === RETURN) return res;
          }
          return 0;
        };
      }
      case 'forin': {
        const exprs = this.compileExprList(s.exprs, fs, chunk);
        fs.blocks.push(new Map());
        const regs = s.names.map((nm) => fs.declare(nm));
        const body = this.compileBlock(s.body, fs, chunk);
        fs.blocks.pop();
        return (f) => {
          let [fn, state, ctl] = exprs(f);
          if (fn instanceof LuaTable && !(fn.metatable?.get('__call'))) {
            // Lua 5.0: `for k, v in t do` iterates with next
            state = fn;
            ctl = undefined;
            fn = this.fn('next', (a) => {
              const r = (a[0] as LuaTable).next(a[1]);
              return r ? [r[0], r[1]] : [undefined];
            });
          }
          for (;;) {
            const vals = this.call(fn, [state, ctl]);
            if (vals[0] === undefined) break;
            ctl = vals[0];
            for (let i = 0; i < regs.length; i++) f.regs[regs[i]] = { v: vals[i] };
            const res = body(f);
            if (res === BREAK) break;
            if (res === RETURN) return res;
          }
          return 0;
        };
      }
      case 'return': {
        if (s.exprs.length === 1 && (s.exprs[0].k === 'call' || s.exprs[0].k === 'method')) {
          const e = this.compileMulti(s.exprs[0], fs, chunk);
          return (f) => { f.ret = e(f); return RETURN; };
        }
        const exprs = this.compileExprList(s.exprs, fs, chunk);
        return (f) => { f.ret = exprs(f); return RETURN; };
      }
      case 'break':
        return () => BREAK;
    }
  }

  private compileSetter(t: Expr, fs: FuncState, chunk: string): (f: Frame, v: LuaValue) => void {
    if (t.k === 'name') {
      const r = fs.findLocal(t.name);
      if (r !== undefined) return (f, v) => { f.regs[r].v = v; };
      const u = fs.findUp(t.name);
      if (u !== undefined) return (f, v) => { f.ups[u].v = v; };
      const name = t.name;
      const g = this.globals;
      return (_f, v) => { g.set(name, v); };
    }
    if (t.k === 'index') {
      const o = this.compileExpr(t.obj, fs, chunk);
      const k = this.compileExpr(t.key, fs, chunk);
      return (f, v) => {
        const ov = o(f);
        const kv = k(f);
        if (ov instanceof LuaTable && ov.metatable === null) ov.set(kv, v);
        else this.setIndex(ov, kv, v);
      };
    }
    throw new LuaError('cannot assign');
  }

  private compileExprList(exprs: Expr[], fs: FuncState, chunk: string): EvM {
    if (exprs.length === 0) return () => [];
    const last = exprs[exprs.length - 1];
    const firsts = exprs.slice(0, -1).map((e) => this.compileExpr(e, fs, chunk));
    if (isMulti(last)) {
      const lm = this.compileMulti(last, fs, chunk);
      return (f) => {
        const out: LuaValue[] = [];
        for (const e of firsts) out.push(e(f));
        const rest = lm(f);
        for (const v of rest) out.push(v);
        return out;
      };
    }
    const le = this.compileExpr(last, fs, chunk);
    return (f) => {
      const out: LuaValue[] = [];
      for (const e of firsts) out.push(e(f));
      out.push(le(f));
      return out;
    };
  }

  /** an expression that may yield several values: calls and `...` */
  private compileMulti(e: Expr, fs: FuncState, chunk: string): EvM {
    if (e.k === 'vararg') return (f) => f.varargs;
    if (e.k === 'call') {
      const fn = this.compileExpr(e.fn, fs, chunk);
      const args = this.compileExprList(e.args, fs, chunk);
      const line = e.line;
      const fname = e.fn.k === 'name' ? e.fn.name : e.fn.k === 'index' && e.fn.key.k === 'str' ? e.fn.key.v : '?';
      return (f) => {
        const fv = fn(f);
        const av = args(f);
        if (fv instanceof LuaFunction) {
          try {
            return fv.call(av);
          } catch (err) {
            throw this.located(err, chunk, line);
          }
        }
        return this.withLine(line, chunk, () => {
          if (fv === undefined || !this.metaOf(fv)?.get('__call')) throw new LuaError(`attempt to call ${e.fn.k === 'name' ? 'global' : 'field'} \`${fname}' (a ${typeName(fv)} value)`);
          return this.call(fv, av);
        });
      };
    }
    if (e.k === 'method') {
      const o = this.compileExpr(e.obj, fs, chunk);
      const args = this.compileExprList(e.args, fs, chunk);
      const name = e.name;
      const line = e.line;
      return (f) => {
        const ov = o(f);
        const fv = this.withLine(line, chunk, () => this.index(ov, name));
        const av = args(f);
        av.unshift(ov);
        try {
          return this.withLine(line, chunk, () => {
            if (!(fv instanceof LuaFunction) && !this.metaOf(fv)?.get('__call')) throw new LuaError(`attempt to call method \`${name}' (a ${typeName(fv)} value)`);
            return this.call(fv, av);
          });
        } catch (err) {
          throw this.located(err, chunk, line);
        }
      };
    }
    const single = this.compileExpr(e, fs, chunk);
    return (f) => [single(f)];
  }

  private located(err: unknown, chunk: string, line: number): unknown {
    if (err instanceof RangeError) return new LuaError(`${chunk}:${line}: stack overflow`);
    return err;
  }

  private compileExpr(e: Expr, fs: FuncState, chunk: string): Ev {
    switch (e.k) {
      case 'nil': return () => undefined;
      case 'true': return () => true;
      case 'false': return () => false;
      case 'num': { const v = e.v; return () => v; }
      case 'str': { const v = e.v; return () => v; }
      case 'vararg': return (f) => f.varargs[0];
      case 'paren': return this.compileExpr(e.e, fs, chunk);
      case 'func': {
        const make = this.compileFunc(e.f, new FuncState(fs), chunk);
        return (f) => make(f);
      }
      case 'name': {
        const r = fs.findLocal(e.name);
        if (r !== undefined) return (f) => f.regs[r].v;
        const u = fs.findUp(e.name);
        if (u !== undefined) return (f) => f.ups[u].v;
        const name = e.name;
        const g = this.globals;
        return () => (g.metatable ? this.index(g, name) : g.get(name));
      }
      case 'index': {
        const o = this.compileExpr(e.obj, fs, chunk);
        const k = this.compileExpr(e.key, fs, chunk);
        const line = e.line;
        return (f) => {
          const ov = o(f);
          const kv = k(f);
          if (ov instanceof LuaTable) {
            const v = ov.get(kv);
            if (v !== undefined || ov.metatable === null) return v;
          }
          return this.withLine(line, chunk, () => this.index(ov, kv));
        };
      }
      case 'call': case 'method': {
        const m = this.compileMulti(e, fs, chunk);
        return (f) => m(f)[0];
      }
      case 'and': {
        const a = this.compileExpr(e.a, fs, chunk), b = this.compileExpr(e.b, fs, chunk);
        return (f) => { const v = a(f); return truthy(v) ? b(f) : v; };
      }
      case 'or': {
        const a = this.compileExpr(e.a, fs, chunk), b = this.compileExpr(e.b, fs, chunk);
        return (f) => { const v = a(f); return truthy(v) ? v : b(f); };
      }
      case 'un': {
        const a = this.compileExpr(e.a, fs, chunk);
        const line = e.line;
        if (e.op === 'not') return (f) => !truthy(a(f));
        if (e.op === '-') {
          return (f) => {
            const v = a(f);
            if (typeof v === 'number') return -v;
            return this.withLine(line, chunk, () => {
              const n = tonum(v);
              if (n !== undefined) return -n;
              const h = this.metaOf(v)?.get('__unm');
              if (h !== undefined) return this.call(h, [v, v])[0];
              throw new LuaError(`attempt to perform arithmetic on a ${typeName(v)} value`);
            });
          };
        }
        return (f) => {
          const v = a(f);
          if (typeof v === 'string') return v.length;
          if (v instanceof LuaTable) return v.length();
          return this.withLine(line, chunk, () => { throw new LuaError(`attempt to get length of a ${typeName(v)} value`); });
        };
      }
      case 'bin': {
        const a = this.compileExpr(e.a, fs, chunk), b = this.compileExpr(e.b, fs, chunk);
        const line = e.line;
        const op = e.op;
        const wl = <T>(fnc: () => T) => this.withLine(line, chunk, fnc);
        switch (op) {
          case '+': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x + y : wl(() => this.arith(op, x, y)); };
          case '-': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x - y : wl(() => this.arith(op, x, y)); };
          case '*': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x * y : wl(() => this.arith(op, x, y)); };
          case '/': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x / y : wl(() => this.arith(op, x, y)); };
          case '%': case '^': return (f) => { const x = a(f), y = b(f); return wl(() => this.arith(op, x, y)); };
          case '..': return (f) => { const x = a(f), y = b(f); return typeof x === 'string' && typeof y === 'string' ? x + y : wl(() => this.concat(x, y)); };
          case '==': return (f) => this.eq(a(f), b(f));
          case '~=': return (f) => !this.eq(a(f), b(f));
          case '<': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x < y : wl(() => this.lt(x, y)); };
          case '<=': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x <= y : wl(() => this.le(x, y)); };
          case '>': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x > y : wl(() => this.lt(y, x)); };
          case '>=': return (f) => { const x = a(f), y = b(f); return typeof x === 'number' && typeof y === 'number' ? x >= y : wl(() => this.le(y, x)); };
        }
        throw new LuaError(`unknown operator ${op}`);
      }
      case 'table': {
        const items = e.items;
        const n = items.length;
        const posCount = items.filter((it) => it.t === 'pos').length;
        const compiled = items.map((it, idx) => {
          if (it.t === 'key') return { t: 'key' as const, key: this.compileExpr(it.key, fs, chunk), v: this.compileExpr(it.v, fs, chunk) };
          const last = idx === n - 1 && isMulti(it.v);
          return { t: 'pos' as const, last, v: last ? null : this.compileExpr(it.v, fs, chunk), m: last ? this.compileMulti(it.v, fs, chunk) : null };
        });
        void posCount;
        return (f) => {
          const t = new LuaTable();
          let i = 1;
          for (const it of compiled) {
            if (it.t === 'key') {
              t.set(it.key(f), it.v(f));
            } else if (it.m) {
              for (const v of it.m(f)) t.set(i++, v);
            } else {
              t.set(i++, it.v!(f));
            }
          }
          return t;
        };
      }
    }
  }
}

function isMulti(e: Expr): boolean {
  return e.k === 'call' || e.k === 'method' || e.k === 'vararg';
}
