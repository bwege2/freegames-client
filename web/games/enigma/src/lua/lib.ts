// Lua 5.1.4's standard library as Enigma opens it (lbaselib.c, lstrlib.c, ltablib.c, lmathlib.c; io/os
// are replaced by security.lua anyway): the same algorithms where results depend on them (table.sort's
// quicksort, the pattern matcher, string.format).
import { Lua, LuaError, LuaFunction, LuaTable, LuaUserdata, fmtG, fmtE, fmtF, num2str, tonumber, truthy, typeName, shortSrc, type LuaValue } from './interp.ts';

type Args = LuaValue[];

function argError(L: Lua, n: number, fname: string, msg: string): never {
  throw new LuaError(L.where(1) + `bad argument #${n} to '${fname}' (${msg})`);
}
export function checkNumber(L: Lua, a: Args, i: number, fname: string): number {
  const v = tonumber(a[i]);
  if (v === undefined) argError(L, i + 1, fname, `number expected, got ${a[i] === undefined ? 'no value' : typeName(a[i])}`);
  return v;
}
export function checkInt(L: Lua, a: Args, i: number, fname: string): number {
  const v = checkNumber(L, a, i, fname);
  return v < 0 ? Math.ceil(v) : Math.floor(v); // lua_Integer cast truncates
}
function optInt(L: Lua, a: Args, i: number, fname: string, d: number): number {
  return a[i] === undefined ? d : checkInt(L, a, i, fname);
}
export function checkString(L: Lua, a: Args, i: number, fname: string): string {
  const v = a[i];
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return num2str(v);
  argError(L, i + 1, fname, `string expected, got ${v === undefined ? 'no value' : typeName(v)}`);
}
export function checkTable(L: Lua, a: Args, i: number, fname: string): LuaTable {
  const v = a[i];
  if (!(v instanceof LuaTable)) argError(L, i + 1, fname, `table expected, got ${v === undefined ? 'no value' : typeName(v)}`);
  return v;
}

function setfuncs(_L: Lua, t: LuaTable, fns: Record<string, (a: Args) => LuaValue[]>) {
  for (const [k, f] of Object.entries(fns)) t.set(k, new LuaFunction(f, k));
}

// ---------------------------------------------------------------- base library

export function openBase(L: Lua) {
  const G = L.G;
  G.set('_G', G);
  G.set('_VERSION', 'Lua 5.1');
  const ipairsAux = new LuaFunction((a) => {
    const i = (a[1] as number) + 1;
    const v = (a[0] as LuaTable).getInt(i);
    return v === undefined ? [] : [i, v];
  }, 'ipairs_aux');
  const next = new LuaFunction((a) => {
    const t = checkTable(L, a, 0, 'next');
    let r;
    try { r = t.next(a[1]); } catch (e) { throw new LuaError(L.where(1) + (e as Error).message); }
    return r ? [r[0], r[1]] : [undefined];
  }, 'next');
  G.set('next', next);
  setfuncs(L, G, {
    assert: (a) => { if (!truthy(a[0])) throw new LuaError(a[1] !== undefined ? a[1] : L.where(1) + 'assertion failed!'); return a; },
    collectgarbage: () => [0],
    error: (a) => {
      const level = a[1] === undefined ? 1 : checkInt(L, a, 1, 'error');
      let msg = a[0];
      if (typeof msg === 'string' && level > 0) msg = L.where(level) + msg;
      throw new LuaError(msg);
    },
    gcinfo: () => [0],
    getfenv: () => [G],
    setfenv: (a) => [a[0]],
    getmetatable: (a) => {
      const mt = L.metatable(a[0]);
      if (!mt) return [undefined];
      const p = mt.getStr('__metatable');
      return [p !== undefined ? p : mt];
    },
    ipairs: (a) => { checkTable(L, a, 0, 'ipairs'); return [ipairsAux, a[0], 0]; },
    pairs: (a) => { checkTable(L, a, 0, 'pairs'); return [next, a[0], undefined]; },
    loadstring: (a) => {
      const s = checkString(L, a, 0, 'loadstring');
      const name = a[1] === undefined ? s : checkString(L, a, 1, 'loadstring');
      try { return [L.load(s, name)]; } catch (e) { return [undefined, (e as LuaError).value]; }
    },
    pcall: (a) => {
      const depth = L.stack.length;
      try { return [true, ...L.call(a[0], a.slice(1))]; } catch (e) {
        L.stack.length = depth;
        if (e instanceof LuaError) return [false, e.value];
        if (e instanceof RangeError) return [false, 'stack overflow'];
        throw e;
      }
    },
    xpcall: (a) => {
      const depth = L.stack.length;
      try { return [true, ...L.call(a[0], [])]; } catch (e) {
        if (!(e instanceof LuaError)) throw e;
        const r = L.call(a[1], [e.value]);
        L.stack.length = depth;
        return [false, r[0]];
      }
    },
    print: (a) => { L.write(a.map((v) => L.tostring(v)).join('\t') + '\n'); return []; },
    rawequal: (a) => [a[0] === a[1]],
    rawget: (a) => [checkTable(L, a, 0, 'rawget').get(a[1])],
    rawset: (a) => { try { checkTable(L, a, 0, 'rawset').set(a[1], a[2]); } catch (e) { if (e instanceof LuaError) throw e; throw new LuaError(L.where(1) + (e as Error).message); } return [a[0]]; },
    select: (a) => {
      if (a[0] === '#') return [a.length - 1];
      const n = checkInt(L, a, 0, 'select');
      if (n < 0) { const i = a.length + n; if (i < 1) argError(L, 1, 'select', 'index out of range'); return a.slice(i); }
      if (n === 0) argError(L, 1, 'select', 'index out of range');
      return a.slice(n);
    },
    setmetatable: (a) => {
      const t = checkTable(L, a, 0, 'setmetatable');
      const mt = a[1];
      if (mt !== undefined && !(mt instanceof LuaTable)) argError(L, 2, 'setmetatable', 'nil or table expected');
      if (t.metatable && t.metatable.getStr('__metatable') !== undefined) throw new LuaError(L.where(1) + 'cannot change a protected metatable');
      t.metatable = (mt as LuaTable) ?? null;
      return [t];
    },
    tonumber: (a) => {
      const base = a[1] === undefined ? 10 : checkInt(L, a, 1, 'tonumber');
      if (base === 10) return [tonumber(a[0])];
      const s = checkString(L, a, 0, 'tonumber').trim().toLowerCase();
      if (!/^-?[0-9a-z]+$/.test(s)) return [undefined];
      let v = 0; const neg = s[0] === '-';
      for (const ch of s.replace('-', '')) {
        const d = parseInt(ch, 36);
        if (d >= base) return [undefined];
        v = v * base + d;
      }
      return [neg ? -v : v];
    },
    tostring: (a) => [L.tostring(a[0])],
    type: (a) => { if (a.length === 0) argError(L, 1, 'type', 'value expected'); return [typeName(a[0])]; },
    unpack: (a) => {
      const t = checkTable(L, a, 0, 'unpack');
      const i = optInt(L, a, 1, 'unpack', 1);
      const e = a[2] === undefined ? t.length() : checkInt(L, a, 2, 'unpack');
      const out: LuaValue[] = [];
      for (let k = i; k <= e; k++) out.push(t.getInt(k));
      return out;
    },
    newproxy: () => [new LuaUserdata(null)],
  });
  // debug.getinfo for the "semi strict" global check of api2init.lua
  const debug = new LuaTable();
  setfuncs(L, debug, {
    getinfo: (a) => {
      const lvl = a[0];
      if (typeof lvl !== 'number') return [undefined];
      const ci = L.stack[L.stack.length - lvl];
      if (!ci) return [undefined];
      const t = new LuaTable();
      t.set('what', ci.what);
      t.set('source', ci.source);
      t.set('short_src', shortSrc(ci.source));
      t.set('currentline', ci.line);
      t.set('linedefined', ci.defined);
      return [t];
    },
    traceback: (a) => [a[0] ?? ''],
  });
  G.set('debug', debug);
  const pkg = new LuaTable();
  G.set('package', pkg);
  const io = new LuaTable();
  setfuncs(L, io, { write: (a) => { L.write(a.map((_v, i) => checkString(L, a, i, 'write')).join('')); return []; } });
  for (const name of ['stdin', 'stdout', 'stderr']) {
    const f = new LuaTable();
    setfuncs(L, f, { seek: () => [0], write: () => [], close: () => [], read: () => [undefined], lines: () => [] });
    io.set(name, f);
  }
  G.set('io', io);
  const os = new LuaTable();
  setfuncs(L, os, { time: () => [Math.floor(Date.now() / 1000)], clock: () => [performance.now() / 1000] });
  G.set('os', os);
}

// ---------------------------------------------------------------- string library

const L_ESC = '%';
const SPECIALS = '^$*+?.([%-';
const MAXCCALLS = 200;

interface MatchState { src: string; level: number; capture: { init: number; len: number }[]; L: Lua; depth: number }
const CAP_UNFINISHED = -1, CAP_POSITION = -2;

function isClass(c: number, cl: string): boolean {
  let res: boolean;
  switch (cl.toLowerCase()) {
    case 'a': res = (c >= 65 && c <= 90) || (c >= 97 && c <= 122); break;
    case 'c': res = c < 32 || c === 127; break;
    case 'd': res = c >= 48 && c <= 57; break;
    case 'l': res = c >= 97 && c <= 122; break;
    case 'p': res = (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126); break;
    case 's': res = c === 32 || (c >= 9 && c <= 13); break;
    case 'u': res = c >= 65 && c <= 90; break;
    case 'w': res = (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122); break;
    case 'x': res = (c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102); break;
    case 'z': res = c === 0; break;
    default: return cl.charCodeAt(0) === c;
  }
  const upper = cl >= 'A' && cl <= 'Z';
  return upper ? !res : res;
}

function classEnd(ms: MatchState, p: string, pi: number): number {
  const ch = p[pi++];
  if (ch === L_ESC) {
    if (pi >= p.length) throw new LuaError(ms.L.where(1) + 'malformed pattern (ends with \'%\')');
    return pi + 1;
  }
  if (ch === '[') {
    if (p[pi] === '^') pi++;
    do {
      if (pi >= p.length) throw new LuaError(ms.L.where(1) + "malformed pattern (missing ']')");
      const c = p[pi++];
      if (c === L_ESC && pi < p.length) pi++;
    } while (p[pi] !== ']');
    return pi + 1;
  }
  return pi;
}

function matchBracketClass(c: number, p: string, pi: number, ec: number): boolean {
  let sig = true;
  if (p[pi + 1] === '^') { sig = false; pi++; }
  while (++pi < ec) {
    if (p[pi] === L_ESC) { pi++; if (isClass(c, p[pi])) return sig; }
    else if (p[pi + 1] === '-' && pi + 2 < ec) {
      pi += 2;
      if (p.charCodeAt(pi - 2) <= c && c <= p.charCodeAt(pi)) return sig;
    } else if (p.charCodeAt(pi) === c) return sig;
  }
  return !sig;
}

function singleMatch(c: number, p: string, pi: number, ep: number): boolean {
  switch (p[pi]) {
    case '.': return true;
    case L_ESC: return isClass(c, p[pi + 1]);
    case '[': return matchBracketClass(c, p, pi, ep - 1);
    default: return p.charCodeAt(pi) === c;
  }
}

function doMatch(ms: MatchState, s: number, p: string, pi: number): number {
  if (++ms.depth > MAXCCALLS) throw new LuaError(ms.L.where(1) + 'pattern too complex');
  try {
    for (;;) {
      if (pi >= p.length) return s;
      switch (p[pi]) {
        case '(': {
          if (p[pi + 1] === ')') return startCapture(ms, s, p, pi + 2, CAP_POSITION);
          return startCapture(ms, s, p, pi + 1, CAP_UNFINISHED);
        }
        case ')': return endCapture(ms, s, p, pi + 1);
        case L_ESC: {
          const n = p[pi + 1];
          if (n === 'b') return matchBalance(ms, s, p, pi + 2);
          if (n === 'f') {
            pi += 2;
            if (p[pi] !== '[') throw new LuaError(ms.L.where(1) + "missing '[' after '%f' in pattern");
            const ep = classEnd(ms, p, pi);
            const prev = s === 0 ? 0 : ms.src.charCodeAt(s - 1);
            const cur = s < ms.src.length ? ms.src.charCodeAt(s) : 0;
            if (matchBracketClass(prev, p, pi, ep - 1) || !matchBracketClass(cur, p, pi, ep - 1)) return -1;
            pi = ep; continue;
          }
          if (n >= '0' && n <= '9') {
            s = matchCapture(ms, s, n.charCodeAt(0) - 48);
            if (s === -1) return -1;
            pi += 2; continue;
          }
          break;
        }
        case '$': if (pi + 1 === p.length) return s === ms.src.length ? s : -1; break;
      }
      const ep = classEnd(ms, p, pi);
      const m = s < ms.src.length && singleMatch(ms.src.charCodeAt(s), p, pi, ep);
      switch (p[ep]) {
        case '?': {
          if (m) { const res = doMatch(ms, s + 1, p, ep + 1); if (res !== -1) return res; }
          pi = ep + 1; continue;
        }
        case '*': return maxExpand(ms, s, p, pi, ep);
        case '+': return m ? maxExpand(ms, s + 1, p, pi, ep) : -1;
        case '-': return minExpand(ms, s, p, pi, ep);
        default: if (!m) return -1; s++; pi = ep; continue;
      }
    }
  } finally { ms.depth--; }
}

function maxExpand(ms: MatchState, s: number, p: string, pi: number, ep: number): number {
  let i = 0;
  while (s + i < ms.src.length && singleMatch(ms.src.charCodeAt(s + i), p, pi, ep)) i++;
  while (i >= 0) {
    const res = doMatch(ms, s + i, p, ep + 1);
    if (res !== -1) return res;
    i--;
  }
  return -1;
}
function minExpand(ms: MatchState, s: number, p: string, pi: number, ep: number): number {
  for (;;) {
    const res = doMatch(ms, s, p, ep + 1);
    if (res !== -1) return res;
    if (s < ms.src.length && singleMatch(ms.src.charCodeAt(s), p, pi, ep)) s++;
    else return -1;
  }
}
function startCapture(ms: MatchState, s: number, p: string, pi: number, what: number): number {
  ms.capture[ms.level] = { init: s, len: what };
  ms.level++;
  const res = doMatch(ms, s, p, pi);
  if (res === -1) ms.level--;
  return res;
}
function endCapture(ms: MatchState, s: number, p: string, pi: number): number {
  let l = -1;
  for (let i = ms.level - 1; i >= 0; i--) if (ms.capture[i].len === CAP_UNFINISHED) { l = i; break; }
  if (l < 0) throw new LuaError(ms.L.where(1) + 'invalid pattern capture');
  ms.capture[l].len = s - ms.capture[l].init;
  const res = doMatch(ms, s, p, pi);
  if (res === -1) ms.capture[l].len = CAP_UNFINISHED;
  return res;
}
function matchBalance(ms: MatchState, s: number, p: string, pi: number): number {
  if (pi + 1 >= p.length) throw new LuaError(ms.L.where(1) + 'unbalanced pattern');
  if (s >= ms.src.length || ms.src[s] !== p[pi]) return -1;
  const b = p[pi], e = p[pi + 1];
  let cont = 1;
  while (++s < ms.src.length) {
    if (ms.src[s] === e) { if (--cont === 0) return doMatch(ms, s + 1, p, pi + 2); }
    else if (ms.src[s] === b) cont++;
  }
  return -1;
}
function matchCapture(ms: MatchState, s: number, l: number): number {
  l -= 1;
  if (l < 0 || l >= ms.level || ms.capture[l].len === CAP_UNFINISHED) throw new LuaError(ms.L.where(1) + 'invalid capture index');
  const len = ms.capture[l].len;
  const cap = ms.src.substr(ms.capture[l].init, len);
  if (ms.src.length - s >= len && ms.src.substr(s, len) === cap) return s + len;
  return -1;
}
function getCapture(ms: MatchState, i: number, s: number, e: number): LuaValue {
  if (i >= ms.level) {
    if (i === 0) return ms.src.slice(s, e);
    throw new LuaError(ms.L.where(1) + 'invalid capture index');
  }
  const c = ms.capture[i];
  if (c.len === CAP_UNFINISHED) throw new LuaError(ms.L.where(1) + 'unfinished capture');
  if (c.len === CAP_POSITION) return c.init + 1;
  return ms.src.substr(c.init, c.len);
}
function pushCaptures(ms: MatchState, s: number, e: number, wholeIfNone: boolean): LuaValue[] {
  const n = ms.level === 0 && wholeIfNone ? 1 : ms.level;
  const out: LuaValue[] = [];
  for (let i = 0; i < n; i++) out.push(getCapture(ms, i, s, e));
  return out;
}

function posrelat(pos: number, len: number) { return pos >= 0 ? pos : (-pos > len ? 0 : len + pos + 1); }

function strFindAux(L: Lua, a: Args, find: boolean): LuaValue[] {
  const fname = find ? 'find' : 'match';
  const s = checkString(L, a, 0, fname), p = checkString(L, a, 1, fname);
  let init = posrelat(optInt(L, a, 2, fname, 1), s.length) - 1;
  if (init < 0) init = 0; else if (init > s.length) init = s.length;
  if (find && (truthy(a[3]) || ![...p].some((c) => SPECIALS.includes(c)))) {
    const i = s.indexOf(p, init);
    return i >= 0 ? [i + 1, i + p.length] : [undefined];
  }
  const ms: MatchState = { src: s, level: 0, capture: [], L, depth: 0 };
  const anchor = p[0] === '^';
  const pi = anchor ? 1 : 0;
  let s1 = init;
  do {
    ms.level = 0;
    const e = doMatch(ms, s1, p, pi);
    if (e !== -1) {
      if (find) return [s1 + 1, e, ...pushCaptures(ms, -1, -1, false)];
      return pushCaptures(ms, s1, e, true);
    }
  } while (s1++ < s.length && !anchor);
  return [undefined];
}

function addValue(L: Lua, ms: MatchState, s: number, e: number, repl: LuaValue): string {
  const src = ms.src;
  if (typeof repl === 'string' || typeof repl === 'number') {
    const r = typeof repl === 'number' ? num2str(repl) : repl;
    let out = '';
    for (let i = 0; i < r.length; i++) {
      if (r[i] !== L_ESC) out += r[i];
      else {
        i++;
        const d = r[i];
        if (!(d >= '0' && d <= '9')) out += d;
        else if (d === '0') out += src.slice(s, e);
        else {
          const v = getCapture(ms, d.charCodeAt(0) - 49, s, e);
          out += typeof v === 'number' ? num2str(v) : v;
        }
      }
    }
    return out;
  }
  let v: LuaValue;
  const first = getCapture(ms, 0, s, e);
  if (repl instanceof LuaFunction) v = L.call(repl, pushCaptures(ms, s, e, true))[0];
  else v = L.index(repl, first);
  if (!truthy(v)) return src.slice(s, e);
  if (typeof v === 'number') return num2str(v);
  if (typeof v !== 'string') throw new LuaError(L.where(1) + `invalid replacement value (a ${typeName(v)})`);
  return v;
}

export function fmtInt(n: number): number { return n < 0 ? Math.ceil(n) : Math.floor(n); }

function pad(s: string, flags: string, width: number, numeric: boolean): string {
  if (s.length >= width) return s;
  if (flags.includes('-')) return s + ' '.repeat(width - s.length);
  if (flags.includes('0') && numeric) {
    const sign = /^[+\- ]/.test(s) ? s[0] : '';
    const body = sign ? s.slice(1) : s;
    return sign + '0'.repeat(width - s.length) + body;
  }
  return ' '.repeat(width - s.length) + s;
}

export function strFormat(L: Lua, a: Args): string {
  const fmt = checkString(L, a, 0, 'format');
  let out = '';
  let arg = 0;
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (c !== '%') { out += c; continue; }
    if (fmt[i + 1] === '%') { out += '%'; i++; continue; }
    i++;
    let flags = '';
    while ('-+ #0'.includes(fmt[i]) && fmt[i] !== undefined) flags += fmt[i++];
    let w = '';
    while (fmt[i] >= '0' && fmt[i] <= '9') w += fmt[i++];
    let prec = -1;
    if (fmt[i] === '.') { i++; let pr = ''; while (fmt[i] >= '0' && fmt[i] <= '9') pr += fmt[i++]; prec = Number(pr || '0'); }
    const width = Number(w || '0');
    const conv = fmt[i];
    arg++;
    switch (conv) {
      case 'c': out += pad(String.fromCharCode(checkNumber(L, a, arg, 'format') & 255), flags, width, false); break;
      case 'd': case 'i': {
        const n = fmtInt(checkNumber(L, a, arg, 'format'));
        let s = Math.abs(n).toString();
        if (prec >= 0) s = s.padStart(prec, '0');
        s = (n < 0 ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '') + s;
        out += pad(s, prec >= 0 ? flags.replace('0', '') : flags, width, true); break;
      }
      case 'o': case 'u': case 'x': case 'X': {
        let n = fmtInt(checkNumber(L, a, arg, 'format'));
        if (n < 0) n = n + 2 ** 64;
        let s = n.toString(conv === 'o' ? 8 : conv === 'u' ? 10 : 16);
        if (conv === 'X') s = s.toUpperCase();
        if (prec >= 0) s = s.padStart(prec, '0');
        if (flags.includes('#') && n !== 0) s = (conv === 'o' ? '0' : conv === 'x' ? '0x' : conv === 'X' ? '0X' : '') + s;
        out += pad(s, flags, width, true); break;
      }
      case 'e': case 'E': case 'f': case 'g': case 'G': {
        const n = checkNumber(L, a, arg, 'format');
        const p = prec < 0 ? 6 : prec;
        let s: string;
        if (!isFinite(n)) s = n !== n ? 'nan' : n > 0 ? 'inf' : '-inf';
        else if (conv === 'f') s = fmtF(n, p);
        else if (conv === 'e' || conv === 'E') s = fmtE(n, p, conv === 'E', flags.includes('#'));
        else s = fmtG(n, p, flags.includes('#'), conv === 'G');
        if (n >= 0 && !Object.is(n, -0)) s = (flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '') + s;
        out += pad(s, flags, width, isFinite(n)); break;
      }
      case 'q': {
        const s = checkString(L, a, arg, 'format');
        let q = '"';
        for (const ch of s) {
          if (ch === '"' || ch === '\\' || ch === '\n') q += '\\' + ch;
          else if (ch === '\r') q += '\\r';
          else if (ch === '\0') q += '\\000';
          else q += ch;
        }
        out += q + '"'; break;
      }
      case 's': {
        let s = checkString(L, a, arg, 'format');
        if (prec >= 0) s = s.slice(0, prec);
        out += pad(s, flags, width, false); break;
      }
      default:
        throw new LuaError(L.where(1) + `invalid option '%${conv}' to 'format'`);
    }
  }
  return out;
}

export function openString(L: Lua) {
  const S = new LuaTable();
  L.G.set('string', S);
  const gmatch = (a: Args): LuaValue[] => {
    const s = checkString(L, a, 0, 'gmatch'), p = checkString(L, a, 1, 'gmatch');
    let pos = 0;
    return [new LuaFunction(() => {
      for (let src = pos; src <= s.length; src++) {
        const ms: MatchState = { src: s, level: 0, capture: [], L, depth: 0 };
        const e = doMatch(ms, src, p, 0);
        if (e !== -1) {
          pos = e === src ? e + 1 : e;
          return pushCaptures(ms, src, e, true);
        }
      }
      return [undefined];
    }, 'gmatch_aux')];
  };
  setfuncs(L, S, {
    byte: (a) => {
      const s = checkString(L, a, 0, 'byte');
      let i = posrelat(optInt(L, a, 1, 'byte', 1), s.length);
      let j = posrelat(a[2] === undefined ? i : checkInt(L, a, 2, 'byte'), s.length);
      if (i <= 0) i = 1;
      if (j > s.length) j = s.length;
      const out: LuaValue[] = [];
      for (let k = i; k <= j; k++) out.push(s.charCodeAt(k - 1));
      return out;
    },
    char: (a) => [a.map((_, i) => String.fromCharCode(checkInt(L, a, i, 'char') & 255)).join('')],
    find: (a) => strFindAux(L, a, true),
    match: (a) => strFindAux(L, a, false),
    format: (a) => [strFormat(L, a)],
    gmatch, gfind: gmatch,
    gsub: (a) => {
      const src = checkString(L, a, 0, 'gsub'); const p = checkString(L, a, 1, 'gsub');
      const repl = a[2];
      const tr = typeName(repl);
      if (!(tr === 'number' || tr === 'string' || tr === 'table' || tr === 'function')) argError(L, 3, 'gsub', 'string/function/table expected');
      const maxN = a[3] === undefined ? src.length + 1 : checkInt(L, a, 3, 'gsub');
      const anchor = p[0] === '^';
      const pi = anchor ? 1 : 0;
      let s = 0, n = 0, out = '';
      const ms: MatchState = { src, level: 0, capture: [], L, depth: 0 };
      while (n < maxN) {
        ms.level = 0;
        const e = doMatch(ms, s, p, pi);
        if (e !== -1) { n++; out += addValue(L, ms, s, e, repl); }
        if (e !== -1 && e > s) s = e;
        else if (s < src.length) out += src[s++];
        else break;
        if (anchor) break;
      }
      out += src.slice(s);
      return [out, n];
    },
    len: (a) => [checkString(L, a, 0, 'len').length],
    lower: (a) => [checkString(L, a, 0, 'lower').replace(/[A-Z]/g, (c) => c.toLowerCase())],
    upper: (a) => [checkString(L, a, 0, 'upper').replace(/[a-z]/g, (c) => c.toUpperCase())],
    rep: (a) => { const s = checkString(L, a, 0, 'rep'); const n = checkInt(L, a, 1, 'rep'); return [n > 0 ? s.repeat(n) : '']; },
    reverse: (a) => [checkString(L, a, 0, 'reverse').split('').reverse().join('')],
    sub: (a) => {
      const s = checkString(L, a, 0, 'sub');
      let i = posrelat(checkInt(L, a, 1, 'sub'), s.length);
      let j = posrelat(a[2] === undefined ? -1 : checkInt(L, a, 2, 'sub'), s.length);
      if (i < 1) i = 1;
      if (j > s.length) j = s.length;
      return [i <= j ? s.slice(i - 1, j) : ''];
    },
  });
  const meta = new LuaTable();
  meta.set('__index', S);
  L.stringMeta = meta;
}

// ---------------------------------------------------------------- table library

export function openTable(L: Lua) {
  const T = new LuaTable();
  L.G.set('table', T);
  setfuncs(L, T, {
    concat: (a) => {
      const t = checkTable(L, a, 0, 'concat');
      const sep = a[1] === undefined ? '' : checkString(L, a, 1, 'concat');
      const i = optInt(L, a, 2, 'concat', 1);
      const j = a[3] === undefined ? t.length() : checkInt(L, a, 3, 'concat');
      const parts: string[] = [];
      for (let k = i; k <= j; k++) {
        const v = t.getInt(k);
        if (typeof v === 'string') parts.push(v);
        else if (typeof v === 'number') parts.push(num2str(v));
        else throw new LuaError(L.where(1) + `invalid value (at index ${k}) in table for 'concat'`);
      }
      return [parts.join(sep)];
    },
    getn: (a) => [checkTable(L, a, 0, 'getn').length()],
    foreach: (a) => {
      const t = checkTable(L, a, 0, 'foreach');
      for (let r = t.next(undefined); r; r = t.next(r[0])) {
        const v = L.call(a[1], [r[0], r[1]])[0];
        if (v !== undefined) return [v];
      }
      return [];
    },
    foreachi: (a) => {
      const t = checkTable(L, a, 0, 'foreachi');
      const n = t.length();
      for (let i = 1; i <= n; i++) {
        const v = L.call(a[1], [i, t.getInt(i)])[0];
        if (v !== undefined) return [v];
      }
      return [];
    },
    setn: () => { throw new LuaError(L.where(1) + "'setn' is obsolete"); },
    maxn: (a) => {
      const t = checkTable(L, a, 0, 'maxn'); let max = 0; let k: LuaValue = undefined;
      for (let r = t.next(k); r; r = t.next(r[0])) if (typeof r[0] === 'number' && r[0] > max) max = r[0];
      return [max];
    },
    insert: (a) => {
      const t = checkTable(L, a, 0, 'insert');
      let e = t.length() + 1;
      let pos: number;
      if (a.length === 2) pos = e;
      else if (a.length === 3) {
        pos = checkInt(L, a, 1, 'insert');
        if (pos > e) e = pos;
        for (let i = e; i > pos; i--) t.set(i, t.getInt(i - 1));
      } else throw new LuaError(L.where(1) + "wrong number of arguments to 'insert'");
      t.set(pos, a[a.length - 1]);
      return [];
    },
    remove: (a) => {
      const t = checkTable(L, a, 0, 'remove');
      const e = t.length();
      let pos = optInt(L, a, 1, 'remove', e);
      if (e === 0) return [];
      const v = t.getInt(pos);
      for (; pos < e; pos++) t.set(pos, t.getInt(pos + 1));
      t.set(e, undefined);
      return [v];
    },
    sort: (a) => {
      const t = checkTable(L, a, 0, 'sort');
      const n = t.length();
      const cmp = a[1];
      const lt = (x: LuaValue, y: LuaValue) => cmp !== undefined ? truthy(L.call(cmp, [x, y])[0]) : L.lt(x, y);
      auxsort(L, t, 1, n, lt);
      return [];
    },
  });
}

function auxsort(L: Lua, t: LuaTable, l: number, u: number, lt: (a: LuaValue, b: LuaValue) => boolean) {
  const get = (i: number) => t.getInt(i);
  const set = (i: number, v: LuaValue) => t.set(i, v);
  while (l < u) {
    let i: number, j: number;
    {
      const al = get(l), au = get(u);
      if (lt(au, al)) { set(l, au); set(u, al); }
    }
    if (u - l === 1) break;
    i = Math.floor((l + u) / 2);
    {
      const ai = get(i), al = get(l);
      if (lt(ai, al)) { set(i, al); set(l, ai); }
      else {
        const au = get(u);
        if (lt(au, ai)) { set(i, au); set(u, ai); }
      }
    }
    if (u - l === 2) break;
    const P = get(i);
    { const au1 = get(u - 1); set(i, au1); set(u - 1, P); }
    i = l; j = u - 1;
    for (;;) {
      let ai: LuaValue, aj: LuaValue;
      while (ai = get(++i), lt(ai, P)) {
        if (i > u) throw new LuaError(L.where(1) + 'invalid order function for sorting');
      }
      while (aj = get(--j), lt(P, aj)) {
        if (j < l) throw new LuaError(L.where(1) + 'invalid order function for sorting');
      }
      if (j < i) break;
      set(i, aj); set(j, ai);
    }
    { const au1 = get(u - 1), ai = get(i); set(u - 1, ai); set(i, au1); }
    if (i - l < u - i) { j = l; i = i - 1; l = i + 2; }
    else { j = i + 1; i = u; u = j - 2; }
    auxsort(L, t, j, i, lt);
  }
}

// ---------------------------------------------------------------- math library

export function openMath(L: Lua) {
  const M = new LuaTable();
  L.G.set('math', M);
  const n = (a: Args, i = 0, f = 'math') => checkNumber(L, a, i, f);
  setfuncs(L, M, {
    abs: (a) => [Math.abs(n(a))], ceil: (a) => [Math.ceil(n(a))], floor: (a) => [Math.floor(n(a))],
    sqrt: (a) => [Math.sqrt(n(a))], sin: (a) => [Math.sin(n(a))], cos: (a) => [Math.cos(n(a))], tan: (a) => [Math.tan(n(a))],
    asin: (a) => [Math.asin(n(a))], acos: (a) => [Math.acos(n(a))], atan: (a) => [Math.atan(n(a))],
    atan2: (a) => [Math.atan2(n(a), n(a, 1))], exp: (a) => [Math.exp(n(a))], log: (a) => [Math.log(n(a))],
    log10: (a) => [Math.log10(n(a))], pow: (a) => [Math.pow(n(a), n(a, 1))],
    sinh: (a) => [Math.sinh(n(a))], cosh: (a) => [Math.cosh(n(a))], tanh: (a) => [Math.tanh(n(a))],
    fmod: (a) => [n(a) % n(a, 1)], mod: (a) => [n(a) % n(a, 1)],
    modf: (a) => { const x = n(a); const ip = x < 0 ? Math.ceil(x) : Math.floor(x); return [ip, isFinite(x) ? x - ip : 0]; },
    frexp: (a) => {
      const x = n(a);
      if (x === 0 || !isFinite(x)) return [x, 0];
      let e = Math.ceil(Math.log2(Math.abs(x)));
      let m = x / Math.pow(2, e);
      if (Math.abs(m) >= 1) { m /= 2; e++; }
      if (Math.abs(m) < 0.5) { m *= 2; e--; }
      return [m, e];
    },
    ldexp: (a) => [n(a) * Math.pow(2, checkInt(L, a, 1, 'ldexp'))],
    deg: (a) => [n(a) * (180 / Math.PI)], rad: (a) => [n(a) * (Math.PI / 180)],
    min: (a) => { let m = n(a); for (let i = 1; i < a.length; i++) { const v = n(a, i); if (v < m) m = v; } return [m]; },
    max: (a) => { let m = n(a); for (let i = 1; i < a.length; i++) { const v = n(a, i); if (v > m) m = v; } return [m]; },
    random: () => [Math.random()],
    randomseed: () => [],
  });
  M.set('pi', Math.PI);
  M.set('huge', Infinity);
}

export function newState(): Lua {
  const L = new Lua();
  openBase(L);
  openString(L);
  openTable(L);
  openMath(L);
  return L;
}

/** UTF-8 text -> Lua byte string, and back */
export function toBytes(s: string): string {
  const b = new TextEncoder().encode(s);
  let out = '';
  for (let i = 0; i < b.length; i += 8192) out += String.fromCharCode(...b.subarray(i, i + 8192));
  return out;
}
export function fromBytes(s: string): string {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
  return new TextDecoder().decode(b);
}
