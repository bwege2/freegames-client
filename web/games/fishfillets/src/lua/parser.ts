// Lua 5.0 source to a syntax tree: the language Fish Fillets NG's scripts are written in (it links
// liblua50). Strings are byte strings: every JS char is one byte (0..255), as the C side saw them.
// Also accepts the few 5.1 forms (`...` as an expression, `#`, `%`) so a script using them still loads.

export type Expr =
  | { k: 'nil' } | { k: 'true' } | { k: 'false' } | { k: 'vararg' }
  | { k: 'num'; v: number } | { k: 'str'; v: string }
  | { k: 'func'; f: FuncBody }
  | { k: 'name'; name: string; line: number }
  | { k: 'index'; obj: Expr; key: Expr; line: number }
  | { k: 'call'; fn: Expr; args: Expr[]; line: number }
  | { k: 'method'; obj: Expr; name: string; args: Expr[]; line: number }
  | { k: 'bin'; op: string; a: Expr; b: Expr; line: number }
  | { k: 'un'; op: string; a: Expr; line: number }
  | { k: 'and'; a: Expr; b: Expr } | { k: 'or'; a: Expr; b: Expr }
  | { k: 'paren'; e: Expr }
  | { k: 'table'; items: ({ t: 'pos'; v: Expr } | { t: 'key'; key: Expr; v: Expr })[] };

export type Stat =
  | { k: 'local'; names: string[]; exprs: Expr[] }
  | { k: 'localfunc'; name: string; f: FuncBody }
  | { k: 'assign'; targets: Expr[]; exprs: Expr[]; line: number }
  | { k: 'call'; e: Expr }
  | { k: 'do'; body: Stat[] }
  | { k: 'while'; cond: Expr; body: Stat[] }
  | { k: 'repeat'; body: Stat[]; cond: Expr }
  | { k: 'if'; conds: Expr[]; blocks: Stat[][]; orelse: Stat[] | null }
  | { k: 'fornum'; v: string; start: Expr; limit: Expr; step: Expr | null; body: Stat[] }
  | { k: 'forin'; names: string[]; exprs: Expr[]; body: Stat[] }
  | { k: 'return'; exprs: Expr[] }
  | { k: 'break' };

export interface FuncBody { params: string[]; vararg: boolean; body: Stat[]; name: string; line: number }

export class LuaSyntaxError extends Error {}

interface Tok { t: string; v: string | number; line: number }

const KEYWORDS = new Set(['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in',
  'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while']);

function isDigit(c: string): boolean { return c >= '0' && c <= '9'; }
function isAlpha(c: string): boolean { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'; }

/** lua_str2number: strtod, plus 0x hex as strtoul */
export function str2number(s: string): number | undefined {
  const t = s.replace(/^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g, '');
  if (t === '') return undefined;
  if (/^[-+]?0[xX][0-9a-fA-F]+$/.test(t)) {
    const neg = t[0] === '-';
    const v = parseInt(t.replace(/^[-+]?0[xX]/, ''), 16);
    return neg ? -v : v;
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(t) && !/^[-+]?(inf|infinity|nan)$/i.test(t)) return undefined;
  const v = Number(t);
  if (/inf/i.test(t)) return t[0] === '-' ? -Infinity : Infinity;
  return Number.isNaN(v) && !/nan/i.test(t) ? undefined : v;
}

export function tokenize(src: string, chunk: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;
  const n = src.length;
  const err = (msg: string): never => { throw new LuaSyntaxError(`${chunk}:${line}: ${msg}`); };
  if (src.startsWith('#')) { while (i < n && src[i] !== '\n') i++; } // #! line
  // [[ ... ]] with nesting (Lua 5.0), and the 5.1 form [==[ ... ]==]
  const longString = (): string => {
    let level = 0;
    let j = i + 1;
    while (src[j] === '=') { level++; j++; }
    if (src[j] !== '[') err('invalid long string delimiter');
    j++;
    if (src[j] === '\r') { j++; if (src[j] === '\n') j++; line++; } else if (src[j] === '\n') { j++; if (src[j] === '\r') j++; line++; }
    let depth = 1;
    let out = '';
    const close = ']' + '='.repeat(level) + ']';
    for (;;) {
      if (j >= n) err('unfinished long string');
      if (level === 0 && src[j] === '[' && src[j + 1] === '[') { depth++; out += '[['; j += 2; continue; }
      if (src.startsWith(close, j)) {
        if (level > 0 || --depth === 0) { j += close.length; break; }
        out += ']]'; j += 2; continue;
      }
      if (src[j] === '\n') line++;
      out += src[j++];
    }
    i = j;
    return out;
  };
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f' || c === '\v') { i++; continue; }
    if (c === '-' && src[i + 1] === '-') {
      i += 2;
      if (src[i] === '[' && (src[i + 1] === '[' || src[i + 1] === '=')) {
        let j = i + 1;
        while (src[j] === '=') j++;
        if (src[j] === '[') { longString(); continue; }
      }
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    const tl = line;
    if (isAlpha(c)) {
      let j = i + 1;
      while (j < n && (isAlpha(src[j]) || isDigit(src[j]))) j++;
      const w = src.slice(i, j);
      i = j;
      toks.push(KEYWORDS.has(w) ? { t: w, v: w, line: tl } : { t: 'name', v: w, line: tl });
      continue;
    }
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1] ?? ''))) {
      let j = i;
      if (c === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) {
        j += 2;
        while (j < n && /[0-9a-fA-F]/.test(src[j])) j++;
      } else {
        while (j < n && (isDigit(src[j]) || src[j] === '.')) j++;
        if (src[j] === 'e' || src[j] === 'E') {
          j++;
          if (src[j] === '+' || src[j] === '-') j++;
          while (j < n && isDigit(src[j])) j++;
        }
        while (j < n && (isAlpha(src[j]) || isDigit(src[j]))) j++;
      }
      const v = str2number(src.slice(i, j));
      if (v === undefined) err(`malformed number near '${src.slice(i, j)}'`);
      toks.push({ t: 'num', v: v as number, line: tl });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let out = '';
      for (;;) {
        if (j >= n || src[j] === '\n') err('unfinished string');
        const d = src[j];
        if (d === c) { j++; break; }
        if (d === '\\') {
          j++;
          const e = src[j];
          const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', a: '\x07', b: '\b', f: '\f', v: '\v', '\\': '\\', '"': '"', "'": "'", '\n': '\n' };
          if (e in map) { if (e === '\n') line++; out += map[e]; j++; } else if (isDigit(e)) {
            let k = 0;
            let v = 0;
            while (k < 3 && isDigit(src[j])) { v = v * 10 + (src.charCodeAt(j) - 48); j++; k++; }
            if (v > 255) err('escape sequence too large');
            out += String.fromCharCode(v);
          } else { out += e; j++; }
          continue;
        }
        out += d;
        j++;
      }
      toks.push({ t: 'str', v: out, line: tl });
      i = j;
      continue;
    }
    if (c === '[' && (src[i + 1] === '[' || (src[i + 1] === '=' && /^\[=*\[/.test(src.slice(i, i + 20))))) {
      toks.push({ t: 'str', v: longString(), line: tl });
      continue;
    }
    const three = src.slice(i, i + 3);
    const two = src.slice(i, i + 2);
    if (three === '...') { toks.push({ t: '...', v: '...', line: tl }); i += 3; continue; }
    if (two === '..' || two === '==' || two === '~=' || two === '<=' || two === '>=') { toks.push({ t: two, v: two, line: tl }); i += 2; continue; }
    if ('+-*/^%#=<>(){}[];:,.'.includes(c)) { toks.push({ t: c, v: c, line: tl }); i++; continue; }
    err(`unexpected symbol near '${c}'`);
  }
  toks.push({ t: 'eof', v: '<eof>', line });
  return toks;
}

const BINPRI: Record<string, [number, number]> = {
  or: [1, 1], and: [2, 2],
  '<': [3, 3], '>': [3, 3], '<=': [3, 3], '>=': [3, 3], '~=': [3, 3], '==': [3, 3],
  '..': [5, 4], '+': [6, 6], '-': [6, 6], '*': [7, 7], '/': [7, 7], '%': [7, 7], '^': [10, 9],
};
const UNARY_PRI = 8;

export function parse(src: string, chunk = '?'): FuncBody {
  const toks = tokenize(src, chunk);
  let p = 0;
  const peek = (): Tok => toks[p];
  const next = (): Tok => toks[p++];
  const err = (msg: string): never => { throw new LuaSyntaxError(`${chunk}:${peek().line}: ${msg} near '${peek().v}'`); };
  const check = (t: string): Tok => { if (peek().t !== t) err(`'${t}' expected`); return next(); };
  const test = (t: string): boolean => { if (peek().t === t) { p++; return true; } return false; };
  const name = (): string => check('name').v as string;

  const blockEnd = (t: string) => t === 'end' || t === 'else' || t === 'elseif' || t === 'until' || t === 'eof';

  function block(): Stat[] {
    const out: Stat[] = [];
    while (!blockEnd(peek().t)) {
      if (peek().t === 'return') {
        next();
        const exprs = blockEnd(peek().t) || peek().t === ';' ? [] : exprList();
        test(';');
        out.push({ k: 'return', exprs });
        break;
      }
      if (peek().t === 'break') {
        next();
        test(';');
        out.push({ k: 'break' });
        break;
      }
      out.push(statement());
      test(';');
    }
    return out;
  }

  function funcBody(fname: string, isMethod: boolean): FuncBody {
    const line = peek().line;
    check('(');
    const params: string[] = isMethod ? ['self'] : [];
    let vararg = false;
    if (peek().t !== ')') {
      do {
        if (peek().t === '...') { next(); vararg = true; break; }
        params.push(name());
      } while (test(','));
    }
    check(')');
    const body = block();
    check('end');
    return { params, vararg, body, name: fname, line };
  }

  function statement(): Stat {
    const t = peek();
    switch (t.t) {
      case 'if': {
        next();
        const conds: Expr[] = [expr()];
        check('then');
        const blocks: Stat[][] = [block()];
        let orelse: Stat[] | null = null;
        for (;;) {
          if (test('elseif')) { conds.push(expr()); check('then'); blocks.push(block()); continue; }
          if (test('else')) { orelse = block(); }
          break;
        }
        check('end');
        return { k: 'if', conds, blocks, orelse };
      }
      case 'while': {
        next();
        const cond = expr();
        check('do');
        const body = block();
        check('end');
        return { k: 'while', cond, body };
      }
      case 'do': {
        next();
        const body = block();
        check('end');
        return { k: 'do', body };
      }
      case 'for': {
        next();
        const n1 = name();
        if (test('=')) {
          const start = expr();
          check(',');
          const limit = expr();
          const step = test(',') ? expr() : null;
          check('do');
          const body = block();
          check('end');
          return { k: 'fornum', v: n1, start, limit, step, body };
        }
        const names = [n1];
        while (test(',')) names.push(name());
        check('in');
        const exprs = exprList();
        check('do');
        const body = block();
        check('end');
        return { k: 'forin', names, exprs, body };
      }
      case 'repeat': {
        next();
        const body = block();
        check('until');
        return { k: 'repeat', body, cond: expr() };
      }
      case 'function': {
        next();
        const line = peek().line;
        let target: Expr = { k: 'name', name: name(), line };
        let fname = (target as { name: string }).name;
        let isMethod = false;
        while (peek().t === '.' || peek().t === ':') {
          const sep = next().t;
          const key = name();
          fname += sep + key;
          target = { k: 'index', obj: target, key: { k: 'str', v: key }, line };
          if (sep === ':') { isMethod = true; break; }
        }
        const f = funcBody(fname, isMethod);
        return { k: 'assign', targets: [target], exprs: [{ k: 'func', f }], line };
      }
      case 'local': {
        next();
        if (test('function')) {
          const n = name();
          return { k: 'localfunc', name: n, f: funcBody(n, false) };
        }
        const names = [name()];
        while (test(',')) names.push(name());
        const exprs = test('=') ? exprList() : [];
        return { k: 'local', names, exprs };
      }
      default: {
        const line = t.line;
        const e = suffixedExpr();
        if (peek().t === '=' || peek().t === ',') {
          const targets = [e];
          while (test(',')) targets.push(suffixedExpr());
          check('=');
          const exprs = exprList();
          for (const tg of targets) if (tg.k !== 'name' && tg.k !== 'index') err('syntax error');
          return { k: 'assign', targets, exprs, line };
        }
        if (e.k !== 'call' && e.k !== 'method') err('syntax error');
        return { k: 'call', e };
      }
    }
  }

  function exprList(): Expr[] {
    const out = [expr()];
    while (test(',')) out.push(expr());
    return out;
  }

  function primaryExpr(): Expr {
    const t = peek();
    if (t.t === 'name') { next(); return { k: 'name', name: t.v as string, line: t.line }; }
    if (t.t === '(') {
      next();
      const e = expr();
      check(')');
      return { k: 'paren', e };
    }
    return err('unexpected symbol');
  }

  function callArgs(): Expr[] {
    const t = peek();
    if (t.t === 'str') { next(); return [{ k: 'str', v: t.v as string }]; }
    if (t.t === '{') return [tableCons()];
    check('(');
    const args = peek().t === ')' ? [] : exprList();
    check(')');
    return args;
  }

  function suffixedExpr(): Expr {
    let e = primaryExpr();
    for (;;) {
      const t = peek();
      switch (t.t) {
        case '.': next(); e = { k: 'index', obj: e, key: { k: 'str', v: name() }, line: t.line }; break;
        case '[': {
          next();
          const key = expr();
          check(']');
          e = { k: 'index', obj: e, key, line: t.line };
          break;
        }
        case ':': {
          next();
          const n = name();
          e = { k: 'method', obj: e, name: n, args: callArgs(), line: t.line };
          break;
        }
        case '(': case 'str': case '{':
          e = { k: 'call', fn: e, args: callArgs(), line: t.line };
          break;
        default:
          return e;
      }
    }
  }

  function tableCons(): Expr {
    check('{');
    const items: ({ t: 'pos'; v: Expr } | { t: 'key'; key: Expr; v: Expr })[] = [];
    while (peek().t !== '}') {
      if (peek().t === '[') {
        next();
        const key = expr();
        check(']');
        check('=');
        items.push({ t: 'key', key, v: expr() });
      } else if (peek().t === 'name' && toks[p + 1].t === '=') {
        const key = name();
        next();
        items.push({ t: 'key', key: { k: 'str', v: key }, v: expr() });
      } else {
        items.push({ t: 'pos', v: expr() });
      }
      if (!test(',') && !test(';')) break;
    }
    check('}');
    return { k: 'table', items };
  }

  function simpleExpr(): Expr {
    const t = peek();
    switch (t.t) {
      case 'num': next(); return { k: 'num', v: t.v as number };
      case 'str': next(); return { k: 'str', v: t.v as string };
      case 'nil': next(); return { k: 'nil' };
      case 'true': next(); return { k: 'true' };
      case 'false': next(); return { k: 'false' };
      case '...': next(); return { k: 'vararg' };
      case '{': return tableCons();
      case 'function': next(); return { k: 'func', f: funcBody('anonymous', false) };
      default: return suffixedExpr();
    }
  }

  function expr(limit = 0): Expr {
    let e: Expr;
    const t = peek();
    if (t.t === 'not' || t.t === '-' || t.t === '#') {
      next();
      const a = expr(UNARY_PRI);
      if (t.t === '-' && a.k === 'num') e = { k: 'num', v: -a.v };
      else e = { k: 'un', op: t.t, a, line: t.line };
    } else {
      e = simpleExpr();
    }
    for (;;) {
      const op = peek();
      const pri = BINPRI[op.t];
      if (!pri || pri[0] <= limit) break;
      next();
      const b = expr(pri[1]);
      if (op.t === 'and') e = { k: 'and', a: e, b };
      else if (op.t === 'or') e = { k: 'or', a: e, b };
      else e = { k: 'bin', op: op.t, a: e, b, line: op.line };
    }
    return e;
  }

  const body = block();
  if (peek().t !== 'eof') err("'<eof>' expected");
  return { params: [], vararg: true, body, name: 'main chunk', line: 0 };
}
