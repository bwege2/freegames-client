// Lua 5.1 lexer and parser (llex.c, lparser.c of Enigma's bundled Lua 5.1.4) producing an AST for
// interp.ts. Strings are byte strings (one char per byte, 0..255), as Lua sees them.
// Enigma's lexer proxy (lib-src/lua/lexerproxy.c) drops calls to assert_type and assert_bool.

export type Expr =
  | { k: 'nil' } | { k: 'true' } | { k: 'false' } | { k: 'vararg' }
  | { k: 'num'; v: number } | { k: 'str'; v: string }
  | { k: 'func'; f: FuncBody }
  | { k: 'local'; slot: number; boxed: boolean; name: string }
  | { k: 'upval'; idx: number; name: string }
  | { k: 'global'; name: string }
  | { k: 'index'; obj: Expr; key: Expr }
  | { k: 'call'; fn: Expr; args: Expr[]; line: number }
  | { k: 'method'; obj: Expr; name: string; args: Expr[]; line: number }
  | { k: 'bin'; op: string; a: Expr; b: Expr; line: number }
  | { k: 'and'; a: Expr; b: Expr } | { k: 'or'; a: Expr; b: Expr }
  | { k: 'un'; op: string; a: Expr; line: number }
  | { k: 'paren'; e: Expr }
  | { k: 'table'; items: Expr[]; fields: { key: Expr; val: Expr }[]; order: ('i' | 'f')[]; na: number; nh: number; line: number };

export type Stat =
  | { k: 'local'; slots: { slot: number; boxed: boolean }[]; exprs: Expr[]; line: number }
  | { k: 'localfunc'; slot: number; boxed: boolean; f: FuncBody; line: number }
  | { k: 'assign'; targets: Expr[]; exprs: Expr[]; line: number }
  | { k: 'call'; e: Expr; line: number }
  | { k: 'do'; body: Stat[] }
  | { k: 'while'; cond: Expr; body: Stat[]; line: number }
  | { k: 'repeat'; body: Stat[]; cond: Expr; line: number }
  | { k: 'if'; conds: Expr[]; blocks: Stat[][]; orelse: Stat[] | null; line: number }
  | { k: 'fornum'; slot: number; boxed: boolean; start: Expr; limit: Expr; step: Expr | null; body: Stat[]; line: number }
  | { k: 'forin'; slots: { slot: number; boxed: boolean }[]; exprs: Expr[]; body: Stat[]; line: number }
  | { k: 'return'; exprs: Expr[]; line: number }
  | { k: 'break' };

export interface FuncBody {
  nparams: number; params: { slot: number; boxed: boolean }[]; vararg: boolean; body: Stat[];
  nslots: number; upvals: { fromParentLocal: boolean; idx: number; name: string }[]; name: string; line: number; source: string;
  needsArg: boolean;
}

const KEYWORDS = new Set(['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in',
  'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while']);

interface Tok { t: string; v?: string | number; line: number }

export class LuaSyntaxError extends Error {}

function isAlpha(c: string) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'; }
function isDigit(c: string) { return c >= '0' && c <= '9'; }
function isAlnum(c: string) { return isAlpha(c) || isDigit(c); }

/** strtod-like conversion used by the lexer and tonumber (luaO_str2d) */
export function str2number(s: string): number | null {
  const t = s.replace(/^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g, '');
  if (t === '') return null;
  if (/^[+-]?0[xX][0-9a-fA-F]+$/.test(t)) {
    const neg = t[0] === '-';
    const v = parseInt(t.replace(/^[+-]/, '').slice(2), 16);
    return neg ? -v : v;
  }
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return Number(t);
  if (/^[+-]?(inf|infinity|nan)$/i.test(t)) return /nan/i.test(t) ? NaN : (t[0] === '-' ? -Infinity : Infinity);
  return null;
}

class Lexer {
  private i = 0; line = 1;
  private src: string; private chunk: string;
  constructor(src: string, chunk: string) {
    this.src = src; this.chunk = chunk;
    if (src.startsWith('#')) { while (this.i < src.length && src[this.i] !== '\n') this.i++; }
  }
  err(msg: string): never { throw new LuaSyntaxError(`${this.chunk}:${this.line}: ${msg}`); }
  private longBracket(): number {
    // at '[': returns level or -1
    let j = this.i + 1, lvl = 0;
    while (this.src[j] === '=') { lvl++; j++; }
    return this.src[j] === '[' ? lvl : -1;
  }
  private readLong(lvl: number): string {
    this.i += lvl + 2;
    if (this.src[this.i] === '\r') { this.i++; if (this.src[this.i] === '\n') this.i++; this.line++; }
    else if (this.src[this.i] === '\n') { this.i++; if (this.src[this.i] === '\r') this.i++; this.line++; }
    const close = ']' + '='.repeat(lvl) + ']';
    let out = '';
    for (;;) {
      if (this.i >= this.src.length) this.err('unfinished long string');
      if (this.src.startsWith(close, this.i)) { this.i += close.length; return out; }
      const c = this.src[this.i++];
      if (c === '\n') this.line++;
      out += c;
    }
  }
  next(): Tok {
    const s = this.src;
    for (;;) {
      if (this.i >= s.length) return { t: '<eof>', line: this.line };
      const c = s[this.i];
      if (c === '\n') { this.line++; this.i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v') { this.i++; continue; }
      if (c === '-' && s[this.i + 1] === '-') {
        this.i += 2;
        if (s[this.i] === '[') { const l = this.longBracket(); if (l >= 0) { this.readLong(l); continue; } }
        while (this.i < s.length && s[this.i] !== '\n') this.i++;
        continue;
      }
      break;
    }
    const line = this.line;
    const c = s[this.i];
    if (isAlpha(c)) {
      let j = this.i; while (j < s.length && isAlnum(s[j])) j++;
      const w = s.slice(this.i, j); this.i = j;
      return KEYWORDS.has(w) ? { t: w, line } : { t: 'name', v: w, line };
    }
    if (isDigit(c) || (c === '.' && isDigit(s[this.i + 1] ?? ''))) {
      let j = this.i;
      // llex read_numeral: digits, '.', then exponent, then alnum/_ chars
      while (j < s.length && (isDigit(s[j]) || s[j] === '.')) j++;
      if (s[j] === 'e' || s[j] === 'E') { j++; if (s[j] === '+' || s[j] === '-') j++; }
      while (j < s.length && (isAlnum(s[j]) || s[j] === '_')) j++;
      const txt = s.slice(this.i, j); this.i = j;
      const v = str2number(txt);
      if (v === null) this.err(`malformed number near '${txt}'`);
      return { t: 'num', v, line };
    }
    if (c === '"' || c === "'") return { t: 'str', v: this.readString(c), line };
    if (c === '[') { const l = this.longBracket(); if (l >= 0) return { t: 'str', v: this.readLong(l), line }; }
    const three = s.substr(this.i, 3);
    if (three === '...') { this.i += 3; return { t: '...', line }; }
    const two = s.substr(this.i, 2);
    if (['==', '~=', '<=', '>=', '..'].includes(two)) { this.i += 2; return { t: two, line }; }
    this.i++;
    if ('+-*/%^#<>=(){}[];:,.'.includes(c)) return { t: c, line };
    this.err(`unexpected symbol near '${c}'`);
  }
  private readString(q: string): string {
    const s = this.src; this.i++;
    let out = '';
    for (;;) {
      if (this.i >= s.length) this.err('unfinished string');
      const c = s[this.i];
      if (c === q) { this.i++; return out; }
      if (c === '\n') this.err('unfinished string');
      if (c === '\\') {
        const d = s[this.i + 1];
        this.i += 2;
        switch (d) {
          case 'a': out += '\x07'; break; case 'b': out += '\b'; break; case 'f': out += '\f'; break;
          case 'n': out += '\n'; break; case 'r': out += '\r'; break; case 't': out += '\t'; break;
          case 'v': out += '\v'; break;
          case '\n': out += '\n'; this.line++; break;
          case '\r': out += '\n'; this.line++; if (s[this.i] === '\n') this.i++; break;
          default:
            if (isDigit(d)) {
              let n = Number(d), k = 0;
              while (k < 2 && isDigit(s[this.i] ?? '')) { n = n * 10 + Number(s[this.i]); this.i++; k++; }
              if (n > 255) this.err('escape sequence too large');
              out += String.fromCharCode(n);
            } else out += d;
        }
        continue;
      }
      out += c; this.i++;
    }
  }
}

interface LocalVar { name: string; slot: number; info: { boxed: boolean } }
class FuncState {
  actives: LocalVar[] = [];
  nslots = 0;
  upvals: { fromParentLocal: boolean; idx: number; name: string }[] = [];
  upvalNames = new Map<string, number>();
  blockStarts: number[] = [];
  usesVararg = false;
  parent: FuncState | null; vararg: boolean;
  constructor(parent: FuncState | null, vararg: boolean) { this.parent = parent; this.vararg = vararg; }
}

const BINPRI: Record<string, [number, number]> = {
  '+': [6, 6], '-': [6, 6], '*': [7, 7], '/': [7, 7], '%': [7, 7], '^': [10, 9], '..': [5, 4],
  '==': [3, 3], '~=': [3, 3], '<': [3, 3], '<=': [3, 3], '>': [3, 3], '>=': [3, 3], 'and': [2, 2], 'or': [1, 1],
};
const UNARY_PRI = 8;

export interface ParseOptions { dropAsserts?: boolean }

export class Parser {
  private lx: Lexer; private tok: Tok; private ahead: Tok | null = null;
  private fs!: FuncState;
  // boxed infos must be patched after the whole function is parsed: we keep references
  private chunk: string; private opts: ParseOptions;
  constructor(src: string, chunk: string, opts: ParseOptions = {}) {
    this.chunk = chunk; this.opts = opts;
    this.lx = new Lexer(src, chunk);
    this.tok = this.rawNext();
  }
  private rawNext(): Tok {
    const t = this.lx.next();
    if (this.opts.dropAsserts !== false && t.t === 'name' && (t.v === 'assert_type' || t.v === 'assert_bool')) {
      const n = this.lx.next();
      if (n.t !== '(') { this.ahead = n; return t; }
      let depth = 1;
      while (depth > 0) {
        const x = this.lx.next();
        if (x.t === '<eof>') return x;
        if (x.t === '(') depth++;
        if (x.t === ')') depth--;
      }
      return this.rawNext();
    }
    return t;
  }
  private advance() {
    if (this.ahead) { this.tok = this.ahead; this.ahead = null; } else this.tok = this.rawNext();
  }
  private err(msg: string): never { throw new LuaSyntaxError(`${this.chunk}:${this.tok.line}: ${msg} near '${this.tok.v ?? this.tok.t}'`); }
  private check(t: string) { if (this.tok.t !== t) this.err(`'${t}' expected`); }
  private expect(t: string) { this.check(t); this.advance(); }
  private test(t: string) { if (this.tok.t === t) { this.advance(); return true; } return false; }
  private name(): string { this.check('name'); const v = this.tok.v as string; this.advance(); return v; }

  parseChunk(): FuncBody {
    this.fs = new FuncState(null, true);
    const body = this.block();
    this.check('<eof>');
    return { nparams: 0, params: [], vararg: true, body, nslots: this.fs.nslots, upvals: [], name: 'main chunk', line: 0, source: this.chunk, needsArg: false };
  }

  // ---- scoping
  private declareLocal(name: string, offset = 0): LocalVar {
    const fs = this.fs;
    const slot = fs.actives.length + offset;
    const v = { name, slot, info: { boxed: false } };
    fs.nslots = Math.max(fs.nslots, slot + 1);
    return v;
  }
  private activate(v: LocalVar) { this.fs.actives.push(v); }
  private enterBlock() { this.fs.blockStarts.push(this.fs.actives.length); }
  private leaveBlock() { this.fs.actives.length = this.fs.blockStarts.pop()!; }

  private resolve(name: string): Expr {
    const r = this.findVar(this.fs, name);
    if (!r) return { k: 'global', name };
    return r;
  }
  private findVar(fs: FuncState, name: string): Expr | null {
    for (let i = fs.actives.length - 1; i >= 0; i--) {
      const a = fs.actives[i];
      if (a.name === name) return { k: 'local', slot: a.slot, get boxed() { return a.info.boxed; }, name } as Expr;
    }
    const known = fs.upvalNames.get(name);
    if (known !== undefined) return { k: 'upval', idx: known, name };
    if (!fs.parent) return null;
    // look in the parent function
    const p = fs.parent;
    for (let i = p.actives.length - 1; i >= 0; i--) {
      const a = p.actives[i];
      if (a.name === name) {
        a.info.boxed = true;
        const idx = fs.upvals.length;
        fs.upvals.push({ fromParentLocal: true, idx: a.slot, name });
        fs.upvalNames.set(name, idx);
        return { k: 'upval', idx, name };
      }
    }
    const pu = this.findVar(p, name);
    if (!pu) return null;
    if (pu.k !== 'upval') throw new Error('internal');
    const idx = fs.upvals.length;
    fs.upvals.push({ fromParentLocal: false, idx: pu.idx, name });
    fs.upvalNames.set(name, idx);
    return { k: 'upval', idx, name };
  }

  // ---- statements
  private blockFollow() { return ['else', 'elseif', 'end', 'until', '<eof>'].includes(this.tok.t); }
  private block(): Stat[] {
    const out: Stat[] = [];
    while (!this.blockFollow()) {
      if (this.tok.t === 'return') { out.push(this.retstat()); break; }
      if (this.tok.t === 'break') { this.advance(); out.push({ k: 'break' }); this.test(';'); break; }
      out.push(this.statement());
      this.test(';');
    }
    return out;
  }
  private retstat(): Stat {
    const line = this.tok.line; this.advance();
    const exprs = (this.blockFollow() || this.tok.t === ';') ? [] : this.exprlist();
    this.test(';');
    return { k: 'return', exprs, line };
  }
  private statement(): Stat {
    const line = this.tok.line;
    switch (this.tok.t) {
      case 'if': {
        this.advance();
        const conds: Expr[] = [], blocks: Stat[][] = [];
        conds.push(this.expr()); this.expect('then');
        this.enterBlock(); blocks.push(this.block()); this.leaveBlock();
        let orelse: Stat[] | null = null;
        for (;;) {
          if ((this.tok.t as string) === 'elseif') {
            this.advance(); conds.push(this.expr()); this.expect('then');
            this.enterBlock(); blocks.push(this.block()); this.leaveBlock();
          } else if ((this.tok.t as string) === 'else') {
            this.advance(); this.enterBlock(); orelse = this.block(); this.leaveBlock();
            this.expect('end'); break;
          } else { this.expect('end'); break; }
        }
        return { k: 'if', conds, blocks, orelse, line };
      }
      case 'while': {
        this.advance(); const cond = this.expr(); this.expect('do');
        this.enterBlock(); const body = this.block(); this.leaveBlock(); this.expect('end');
        return { k: 'while', cond, body, line };
      }
      case 'do': { this.advance(); this.enterBlock(); const body = this.block(); this.leaveBlock(); this.expect('end'); return { k: 'do', body }; }
      case 'for': {
        this.advance();
        const n1 = this.name();
        if ((this.tok.t as string) === '=') {
          this.advance();
          const start = this.expr(); this.expect(',');
          const limit = this.expr();
          const step = this.test(',') ? this.expr() : null;
          this.expect('do');
          this.enterBlock();
          // three hidden control slots then the variable (as in lparser.c)
          const hidden = [this.declareLocal('(for index)')]; this.activate(hidden[0]);
          const h2 = this.declareLocal('(for limit)'); this.activate(h2);
          const h3 = this.declareLocal('(for step)'); this.activate(h3);
          const v = this.declareLocal(n1); this.activate(v);
          const body = this.block();
          this.leaveBlock(); this.expect('end');
          return { k: 'fornum', get slot() { return v.slot; }, get boxed() { return v.info.boxed; }, start, limit, step, body, line } as Stat;
        }
        const names = [n1];
        while (this.test(',')) names.push(this.name());
        this.expect('in');
        const exprs = this.exprlist();
        this.expect('do');
        this.enterBlock();
        for (const h of ['(for generator)', '(for state)', '(for control)']) this.activate(this.declareLocal(h));
        const vars = names.map((n) => { const v = this.declareLocal(n); this.activate(v); return v; });
        const body = this.block();
        this.leaveBlock(); this.expect('end');
        return { k: 'forin', slots: vars.map((v) => ({ get slot() { return v.slot; }, get boxed() { return v.info.boxed; } })), exprs, body, line } as Stat;
      }
      case 'repeat': {
        this.advance(); this.enterBlock();
        const body = this.block(); this.expect('until');
        const cond = this.expr(); // the condition sees the block's locals
        this.leaveBlock();
        return { k: 'repeat', body, cond, line };
      }
      case 'function': {
        this.advance();
        let target: Expr = this.resolve(this.name());
        let fname = (target as { name: string }).name;
        let method = false;
        while ((this.tok.t as string) === '.' || (this.tok.t as string) === ':') {
          const sep = this.tok.t; this.advance();
          const key = this.name();
          fname += sep + key;
          target = { k: 'index', obj: target, key: { k: 'str', v: key } };
          if ((sep as string) === ':') { method = true; break; }
        }
        const f = this.funcbody(method, fname, line);
        return { k: 'assign', targets: [target], exprs: [{ k: 'func', f }], line };
      }
      case 'local': {
        this.advance();
        if (this.test('function')) {
          const nm = this.name();
          const v = this.declareLocal(nm); this.activate(v);
          const f = this.funcbody(false, nm, line);
          return { k: 'localfunc', get slot() { return v.slot; }, get boxed() { return v.info.boxed; }, f, line } as Stat;
        }
        const names = [this.name()];
        while (this.test(',')) names.push(this.name());
        const exprs = this.test('=') ? this.exprlist() : [];
        const vars = names.map((n, i) => this.declareLocal(n, i));
        vars.forEach((v) => this.activate(v));
        return { k: 'local', slots: vars.map((v) => ({ get slot() { return v.slot; }, get boxed() { return v.info.boxed; } })), exprs, line } as Stat;
      }
      default: {
        const e = this.suffixedexp();
        if (this.tok.t === '=' || this.tok.t === ',') {
          const targets = [e];
          while (this.test(',')) targets.push(this.suffixedexp());
          this.expect('=');
          const exprs = this.exprlist();
          for (const t of targets) if (t.k !== 'local' && t.k !== 'upval' && t.k !== 'global' && t.k !== 'index') this.err('syntax error');
          return { k: 'assign', targets, exprs, line };
        }
        if (e.k !== 'call' && e.k !== 'method') this.err('syntax error');
        return { k: 'call', e, line };
      }
    }
  }
  private funcbody(method: boolean, name: string, line: number): FuncBody {
    const parentFs = this.fs;
    const fs = new FuncState(parentFs, false);
    this.fs = fs;
    const params: LocalVar[] = [];
    if (method) { const v = this.declareLocal('self'); this.activate(v); params.push(v); }
    this.expect('(');
    if (this.tok.t !== ')') {
      for (;;) {
        if (this.tok.t === '...') { this.advance(); fs.vararg = true; break; }
        const v = this.declareLocal(this.name()); this.activate(v); params.push(v);
        if (!this.test(',')) break;
      }
    }
    if (fs.vararg) { const v = this.declareLocal('arg'); this.activate(v); params.push(v); } // LUA_COMPAT_VARARG
    this.expect(')');
    const body = this.block();
    this.expect('end');
    this.fs = parentFs;
    const nparams = params.length - (fs.vararg ? 1 : 0);
    return {
      nparams, params: params.map((p) => ({ get slot() { return p.slot; }, get boxed() { return p.info.boxed; } })),
      vararg: fs.vararg, body, nslots: fs.nslots, upvals: fs.upvals, name, line, source: this.chunk,
      needsArg: fs.vararg && !fs.usesVararg,
    };
  }

  // ---- expressions
  private exprlist(): Expr[] { const l = [this.expr()]; while (this.test(',')) l.push(this.expr()); return l; }
  private primaryexp(): Expr {
    if (this.tok.t === 'name') return this.resolve(this.name());
    if (this.tok.t === '(') { this.advance(); const e = this.expr(); this.expect(')'); return { k: 'paren', e }; }
    this.err('unexpected symbol');
  }
  private suffixedexp(): Expr {
    let e = this.primaryexp();
    for (;;) {
      const line = this.tok.line;
      switch (this.tok.t) {
        case '.': { this.advance(); e = { k: 'index', obj: e, key: { k: 'str', v: this.name() } }; break; }
        case '[': { this.advance(); const key = this.expr(); this.expect(']'); e = { k: 'index', obj: e, key }; break; }
        case ':': { this.advance(); const name = this.name(); const args = this.callargs(); e = { k: 'method', obj: e, name, args, line }; break; }
        case '(': case 'str': case '{': { e = { k: 'call', fn: e, args: this.callargs(), line }; break; }
        default: return e;
      }
    }
  }
  private callargs(): Expr[] {
    if (this.tok.t === 'str') { const v = this.tok.v as string; this.advance(); return [{ k: 'str', v }]; }
    if (this.tok.t === '{') return [this.table()];
    this.expect('(');
    if (this.test(')')) return [];
    const l = this.exprlist(); this.expect(')');
    return l;
  }
  private table(): Expr {
    const line = this.tok.line;
    this.expect('{');
    const items: Expr[] = [], fields: { key: Expr; val: Expr }[] = [], order: ('i' | 'f')[] = [];
    while (this.tok.t !== '}') {
      if (this.tok.t === 'name') {
        // lookahead for '='
        const save = this.tok;
        this.advance();
        if ((this.tok.t as string) === '=') {
          this.advance();
          fields.push({ key: { k: 'str', v: save.v as string }, val: this.expr() }); order.push('f');
        } else {
          // put back: re-parse as expression starting with the name
          this.ahead = this.tok; this.tok = save;
          items.push(this.expr()); order.push('i');
        }
      } else if (this.tok.t === '[') {
        this.advance(); const key = this.expr(); this.expect(']'); this.expect('=');
        fields.push({ key, val: this.expr() }); order.push('f');
      } else { items.push(this.expr()); order.push('i'); }
      if (!this.test(',') && !this.test(';')) break;
    }
    this.expect('}');
    let na = items.length;
    const last = items[items.length - 1];
    if (last && (last.k === 'call' || last.k === 'method' || last.k === 'vararg')) na--;
    return { k: 'table', items, fields, order, na, nh: fields.length, line };
  }
  private simpleexp(): Expr {
    const t = this.tok;
    switch (t.t) {
      case 'num': this.advance(); return { k: 'num', v: t.v as number };
      case 'str': this.advance(); return { k: 'str', v: t.v as string };
      case 'nil': this.advance(); return { k: 'nil' };
      case 'true': this.advance(); return { k: 'true' };
      case 'false': this.advance(); return { k: 'false' };
      case '...': if (!this.fs.vararg) this.err("cannot use '...' outside a vararg function"); this.fs.usesVararg = true; this.advance(); return { k: 'vararg' };
      case '{': return this.table();
      case 'function': { this.advance(); return { k: 'func', f: this.funcbody(false, 'anonymous', t.line) }; }
      default: return this.suffixedexp();
    }
  }
  expr(limit = 0): Expr {
    let e: Expr;
    const t = this.tok.t;
    if (t === 'not' || t === '-' || t === '#') {
      const line = this.tok.line; this.advance();
      const a = this.expr(UNARY_PRI);
      if (t === '-' && a.k === 'num') e = { k: 'num', v: -a.v };
      else e = { k: 'un', op: t, a, line };
    } else e = this.simpleexp();
    for (;;) {
      const op = this.tok.t;
      const pri = BINPRI[op];
      if (!pri || pri[0] <= limit) break;
      const line = this.tok.line;
      this.advance();
      const b = this.expr(pri[1]);
      if (op === 'and') e = { k: 'and', a: e, b };
      else if (op === 'or') e = { k: 'or', a: e, b };
      else e = { k: 'bin', op, a: e, b, line };
    }
    return e;
  }
}

export function parseLua(src: string, chunk: string, opts?: ParseOptions): FuncBody {
  return new Parser(src, chunk, opts).parseChunk();
}
