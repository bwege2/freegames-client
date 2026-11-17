// The Lua 5.0 standard libraries Fish Fillets NG opens (ScriptState: base, string, math, table),
// following lbaselib.c, lstrlib.c, lmathlib.c and ltablib.c of Lua 5.0.
import { Lua, LuaError, LuaFunction, LuaTable, fmtG, tonum, tostr, truthy, typeName, type LuaValue } from './interp.ts';
import { GlibcRand, RAND_MAX } from '../glibcRand.ts';
import { fmtE, fmtF } from './numfmt.ts';

const argError = (n: number, fname: string, msg: string): LuaError => new LuaError(`bad argument #${n} to \`${fname}' (${msg})`);

function checkNum(a: LuaValue[], i: number, fname: string): number {
  const v = tonum(a[i]);
  if (v === undefined) throw argError(i + 1, fname, `number expected, got ${a[i] === undefined ? 'no value' : typeName(a[i])}`);
  return v;
}
function checkInt(a: LuaValue[], i: number, fname: string): number { return Math.trunc(checkNum(a, i, fname)); }
function optInt(a: LuaValue[], i: number, fname: string, d: number): number { return a[i] === undefined ? d : checkInt(a, i, fname); }
function checkStr(a: LuaValue[], i: number, fname: string): string {
  const v = tostr(a[i]);
  if (v === undefined) throw argError(i + 1, fname, `string expected, got ${a[i] === undefined ? 'no value' : typeName(a[i])}`);
  return v;
}
function checkTable(a: LuaValue[], i: number, fname: string): LuaTable {
  const v = a[i];
  if (!(v instanceof LuaTable)) throw argError(i + 1, fname, `table expected, got ${v === undefined ? 'no value' : typeName(v)}`);
  return v;
}

export interface LibHooks {
  print?: (s: string) => void;
  rand?: GlibcRand;
}

export function openLibs(L: Lua, hooks: LibHooks = {}): GlibcRand {
  const G = L.globals;
  const set = (t: LuaTable, name: string, f: (a: LuaValue[]) => LuaValue[] | LuaValue | void) => t.set(name, L.fn(name, f));
  const rand = hooks.rand ?? new GlibcRand(1);
  const tostringV = (v: LuaValue): string => {
    const h = L.metaOf(v)?.get('__tostring');
    if (h !== undefined) return tostr(L.call(h, [v])[0]) ?? '';
    if (v === undefined) return 'nil';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return fmtG(v);
    if (typeof v === 'string') return v;
    return `${typeName(v)}: 0x${(ids.get(v) ?? newId(v)).toString(16).padStart(8, '0')}`;
  };
  const ids = new WeakMap<object, number>();
  let nextId = 0x8050000;
  const newId = (o: object) => { nextId += 0x20; ids.set(o, nextId); return nextId; };

  // ---- base
  set(G, 'print', (a) => { (hooks.print ?? console.log)(a.map(tostringV).join('\t')); });
  set(G, 'type', (a) => { if (a.length === 0) throw argError(1, 'type', 'value expected'); return typeName(a[0]); });
  set(G, 'tostring', (a) => tostringV(a[0]));
  set(G, 'tonumber', (a) => {
    const base = a[1] === undefined ? 10 : checkInt(a, 1, 'tonumber');
    if (base === 10) return tonum(a[0]);
    const s = checkStr(a, 0, 'tonumber').trim().toLowerCase();
    const n = parseInt(s, base);
    return Number.isNaN(n) || !/^[0-9a-z]+$/.test(s) ? undefined : n;
  });
  set(G, 'assert', (a) => {
    if (!truthy(a[0])) throw new LuaError(a[1] !== undefined ? (tostr(a[1]) ?? 'assertion failed!') : 'assertion failed!');
    return a;
  });
  set(G, 'error', (a) => {
    const level = a[1] === undefined ? 1 : checkInt(a, 1, 'error');
    const e = new LuaError(a[0]);
    if (level === 0) e.traceback = 'nolocation';
    throw e;
  });
  set(G, 'pcall', (a) => {
    try {
      return [true, ...L.call(a[0], a.slice(1))];
    } catch (e) {
      if (e instanceof LuaError) return [false, e.value];
      if (e instanceof RangeError) return [false, 'stack overflow'];
      throw e;
    }
  });
  set(G, 'xpcall', (a) => {
    try {
      return [true, ...L.call(a[0], [])];
    } catch (e) {
      if (e instanceof LuaError) return [false, ...L.call(a[1], [e.value])];
      throw e;
    }
  });
  set(G, 'next', (a) => {
    const r = checkTable(a, 0, 'next').next(a[1]);
    return r ? [r[0], r[1]] : [undefined];
  });
  const nextFn = G.get('next') as LuaFunction;
  set(G, 'pairs', (a) => [nextFn, checkTable(a, 0, 'pairs'), undefined]);
  const ipairsIter = L.fn('ipairs_iter', (a) => {
    const i = (a[1] as number) + 1;
    const v = (a[0] as LuaTable).get(i);
    return v === undefined ? [undefined] : [i, v];
  });
  set(G, 'ipairs', (a) => [ipairsIter, checkTable(a, 0, 'ipairs'), 0]);
  set(G, 'unpack', (a) => {
    const t = checkTable(a, 0, 'unpack');
    const n = getn(t);
    const out: LuaValue[] = [];
    for (let i = 1; i <= n; i++) out.push(t.get(i));
    return out;
  });
  set(G, 'select', (a) => {
    if (a[0] === '#') return a.length - 1;
    const n = checkInt(a, 0, 'select');
    return n < 0 ? a.slice(n) : a.slice(n);
  });
  set(G, 'rawget', (a) => checkTable(a, 0, 'rawget').get(a[1]));
  set(G, 'rawset', (a) => { checkTable(a, 0, 'rawset').set(a[1], a[2]); return a[0]; });
  set(G, 'rawequal', (a) => a[0] === a[1]);
  set(G, 'setmetatable', (a) => {
    const t = checkTable(a, 0, 'setmetatable');
    if (a[1] !== undefined && !(a[1] instanceof LuaTable)) throw argError(2, 'setmetatable', 'nil or table expected');
    if (t.metatable?.get('__metatable') !== undefined) throw new LuaError('cannot change a protected metatable');
    t.metatable = (a[1] as LuaTable | undefined) ?? null;
    return t;
  });
  set(G, 'getmetatable', (a) => {
    const m = L.metaOf(a[0]);
    if (!m) return undefined;
    const p = m.get('__metatable');
    return p !== undefined ? p : m;
  });
  set(G, 'loadstring', (a) => {
    try {
      return L.load(checkStr(a, 0, 'loadstring'), a[1] !== undefined ? checkStr(a, 1, 'loadstring') : checkStr(a, 0, 'loadstring'));
    } catch (e) {
      return [undefined, (e as Error).message];
    }
  });
  set(G, 'collectgarbage', () => undefined);
  set(G, 'gcinfo', () => [0, 0]);
  set(G, 'getfenv', () => G);
  set(G, 'setfenv', (a) => a[0]);
  G.set('_VERSION', 'Lua 5.0.2');

  // ---- table
  const getn = (t: LuaTable): number => {
    const n = t.get('n');
    if (typeof n === 'number') return Math.trunc(n);
    return t.length();
  };
  const table = new LuaTable();
  G.set('table', table);
  set(table, 'getn', (a) => getn(checkTable(a, 0, 'getn')));
  set(table, 'setn', (a) => { const t = checkTable(a, 0, 'setn'); if (t.get('n') !== undefined) t.set('n', checkInt(a, 1, 'setn')); });
  set(table, 'insert', (a) => {
    const t = checkTable(a, 0, 'insert');
    const n = getn(t);
    let pos = n + 1;
    let v = a[1];
    if (a.length > 2) { pos = checkInt(a, 1, 'insert'); v = a[2]; }
    if (pos > n) { if (typeof t.get('n') === 'number') t.set('n', pos); } else if (typeof t.get('n') === 'number') t.set('n', n + 1);
    for (let i = n; i >= pos; i--) t.set(i + 1, t.get(i));
    t.set(pos, v);
  });
  set(table, 'remove', (a) => {
    const t = checkTable(a, 0, 'remove');
    const n = getn(t);
    const pos = optInt(a, 1, 'remove', n);
    if (n <= 0) return undefined;
    if (typeof t.get('n') === 'number') t.set('n', n - 1);
    const v = t.get(pos);
    for (let i = pos; i < n; i++) t.set(i, t.get(i + 1));
    t.set(n, undefined);
    return v;
  });
  set(table, 'concat', (a) => {
    const t = checkTable(a, 0, 'concat');
    const sep = a[1] === undefined ? '' : checkStr(a, 1, 'concat');
    const i = optInt(a, 2, 'concat', 1);
    const j = a[3] === undefined ? getn(t) : checkInt(a, 3, 'concat');
    const parts: string[] = [];
    for (let k = i; k <= j; k++) {
      const s = tostr(t.get(k));
      if (s === undefined) throw new LuaError('table contains non-strings');
      parts.push(s);
    }
    return parts.join(sep);
  });
  set(table, 'foreach', (a) => {
    const t = checkTable(a, 0, 'foreach');
    let k: LuaValue = undefined;
    for (;;) {
      const r = t.next(k);
      if (!r) return undefined;
      k = r[0];
      const res = L.call(a[1], [r[0], r[1]])[0];
      if (res !== undefined) return res;
    }
  });
  set(table, 'foreachi', (a) => {
    const t = checkTable(a, 0, 'foreachi');
    const n = getn(t);
    for (let i = 1; i <= n; i++) {
      const res = L.call(a[1], [i, t.get(i)])[0];
      if (res !== undefined) return res;
    }
    return undefined;
  });
  set(table, 'sort', (a) => {
    const t = checkTable(a, 0, 'sort');
    const n = getn(t);
    const cmp = a[1];
    const lt = (x: LuaValue, y: LuaValue) => (cmp !== undefined ? truthy(L.call(cmp, [x, y])[0]) : L.lt(x, y));
    // the quicksort of ltablib.c (auxsort), so that equal elements land as in the original
    const geti = (i: number) => t.get(i);
    const seti = (i: number, v: LuaValue) => t.set(i, v);
    const auxsort = (l: number, u: number): void => {
      while (l < u) {
        if (lt(geti(u), geti(l))) { const x = geti(l); seti(l, geti(u)); seti(u, x); }
        if (u - l === 1) break;
        let i = Math.floor((l + u) / 2);
        if (lt(geti(i), geti(l))) { const x = geti(i); seti(i, geti(l)); seti(l, x); } else if (lt(geti(u), geti(i))) { const x = geti(i); seti(i, geti(u)); seti(u, x); }
        if (u - l === 2) break;
        const P = geti(i);
        { const x = geti(i); seti(i, geti(u - 1)); seti(u - 1, x); }
        i = l;
        let j = u - 1;
        for (;;) {
          while (lt(geti(++i), P)) if (i > u) throw new LuaError('invalid order function for sorting');
          while (lt(P, geti(--j))) if (j < l) throw new LuaError('invalid order function for sorting');
          if (j < i) break;
          const x = geti(i); seti(i, geti(j)); seti(j, x);
        }
        { const x = geti(u - 1); seti(u - 1, geti(i)); seti(i, x); }
        if (i - l < u - i) { j = l; i = i - 1; l = i + 2; } else { j = i + 1; i = u; u = j - 2; }
        auxsort(j, i);
      }
    };
    auxsort(1, n);
  });

  // ---- math
  const math = new LuaTable();
  G.set('math', math);
  const m1 = (name: string, f: (x: number) => number) => set(math, name, (a) => f(checkNum(a, 0, name)));
  m1('abs', Math.abs); m1('sin', Math.sin); m1('cos', Math.cos); m1('tan', Math.tan);
  m1('asin', Math.asin); m1('acos', Math.acos); m1('atan', Math.atan);
  m1('ceil', Math.ceil); m1('floor', Math.floor); m1('sqrt', Math.sqrt); m1('exp', Math.exp);
  m1('log', Math.log); m1('log10', Math.log10);
  m1('deg', (x) => x * (180 / Math.PI)); m1('rad', (x) => x * (Math.PI / 180));
  set(math, 'atan2', (a) => Math.atan2(checkNum(a, 0, 'atan2'), checkNum(a, 1, 'atan2')));
  set(math, 'mod', (a) => { const x = checkNum(a, 0, 'mod'), y = checkNum(a, 1, 'mod'); return x % y; }); // fmod
  set(math, 'fmod', (a) => checkNum(a, 0, 'fmod') % checkNum(a, 1, 'fmod'));
  set(math, 'pow', (a) => Math.pow(checkNum(a, 0, 'pow'), checkNum(a, 1, 'pow')));
  set(math, 'min', (a) => { let m = checkNum(a, 0, 'min'); for (let i = 1; i < a.length; i++) { const d = checkNum(a, i, 'min'); if (d < m) m = d; } return m; });
  set(math, 'max', (a) => { let m = checkNum(a, 0, 'max'); for (let i = 1; i < a.length; i++) { const d = checkNum(a, i, 'max'); if (d > m) m = d; } return m; });
  set(math, 'frexp', (a) => {
    const x = checkNum(a, 0, 'frexp');
    if (x === 0 || !Number.isFinite(x)) return [x, 0];
    let e = Math.ceil(Math.log2(Math.abs(x)));
    let m = x / Math.pow(2, e);
    if (Math.abs(m) >= 1) { m /= 2; e++; }
    if (Math.abs(m) < 0.5) { m *= 2; e--; }
    return [m, e];
  });
  set(math, 'ldexp', (a) => checkNum(a, 0, 'ldexp') * Math.pow(2, checkInt(a, 1, 'ldexp')));
  // lmathlib.c 5.0: r = (rand() % RAND_MAX) / RAND_MAX
  set(math, 'random', (a) => {
    const r = (rand.next() % RAND_MAX) / RAND_MAX;
    if (a.length === 0) return r;
    if (a.length === 1) {
      const u = checkInt(a, 0, 'random');
      if (u < 1) throw argError(1, 'random', 'interval is empty');
      return Math.floor(r * u) + 1;
    }
    const l = checkInt(a, 0, 'random'), u = checkInt(a, 1, 'random');
    if (l > u) throw argError(2, 'random', 'interval is empty');
    return Math.floor(r * (u - l + 1)) + l;
  });
  set(math, 'randomseed', (a) => { rand.seed(checkInt(a, 0, 'randomseed')); });
  math.set('pi', Math.PI);
  math.set('huge', Infinity);

  // ---- string
  const string = new LuaTable();
  G.set('string', string);
  const smeta = new LuaTable();
  smeta.set('__index', string);
  L.stringMeta = smeta;
  const posrelat = (pos: number, len: number) => (pos >= 0 ? pos : len + pos + 1);
  set(string, 'len', (a) => checkStr(a, 0, 'len').length);
  set(string, 'sub', (a) => {
    const s = checkStr(a, 0, 'sub');
    let i = posrelat(checkInt(a, 1, 'sub'), s.length);
    let j = posrelat(optInt(a, 2, 'sub', -1), s.length);
    if (i < 1) i = 1;
    if (j > s.length) j = s.length;
    return i <= j ? s.slice(i - 1, j) : '';
  });
  set(string, 'lower', (a) => checkStr(a, 0, 'lower').replace(/[A-Z]/g, (c) => c.toLowerCase()));
  set(string, 'upper', (a) => checkStr(a, 0, 'upper').replace(/[a-z]/g, (c) => c.toUpperCase()));
  set(string, 'rep', (a) => { const n = checkInt(a, 1, 'rep'); return n > 0 ? checkStr(a, 0, 'rep').repeat(n) : ''; });
  set(string, 'reverse', (a) => checkStr(a, 0, 'reverse').split('').reverse().join(''));
  set(string, 'byte', (a) => {
    const s = checkStr(a, 0, 'byte');
    const i = posrelat(optInt(a, 1, 'byte', 1), s.length);
    return i >= 1 && i <= s.length ? s.charCodeAt(i - 1) : undefined;
  });
  set(string, 'char', (a) => a.map((_, i) => String.fromCharCode(checkInt(a, i, 'char') & 255)).join(''));
  set(string, 'format', (a) => format(a));
  set(string, 'find', (a) => strFind(a, true, 'find'));
  set(string, 'match', (a) => strFind(a, false, 'match'));
  const gmatch = (a: LuaValue[], fname: string) => {
    const s = checkStr(a, 0, fname), p = checkStr(a, 1, fname);
    let pos = 0;
    return L.fn('gfind_aux', () => {
      for (let src = pos; src <= s.length; src++) {
        const ms = new MatchState(s, p);
        const e = ms.match(src, 0);
        if (e !== -1) {
          pos = e === src ? e + 1 : e;
          return ms.captures(src, e, true);
        }
      }
      return undefined;
    });
  };
  set(string, 'gfind', (a) => gmatch(a, 'gfind'));
  set(string, 'gmatch', (a) => gmatch(a, 'gmatch'));
  set(string, 'gsub', (a) => {
    const src = checkStr(a, 0, 'gsub'), p = checkStr(a, 1, 'gsub');
    const repl = a[2];
    if (typeof repl !== 'string' && typeof repl !== 'number' && !(repl instanceof LuaTable) && !(repl instanceof LuaFunction)) throw argError(3, 'gsub', 'string or function expected');
    const maxN = a[3] === undefined ? src.length + 1 : checkInt(a, 3, 'gsub');
    const anchor = p[0] === '^';
    const pat = anchor ? p.slice(1) : p;
    let s = 0;
    let n = 0;
    let out = '';
    while (n < maxN) {
      const ms = new MatchState(src, pat);
      const e = ms.match(s, 0);
      if (e !== -1) {
        n++;
        const whole = src.slice(s, e);
        let rep: LuaValue;
        if (repl instanceof LuaFunction) {
          rep = L.call(repl, ms.captures(s, e, true))[0];
        } else if (repl instanceof LuaTable) {
          rep = L.index(repl, ms.captures(s, e, true)[0]);
        } else {
          const r = tostr(repl)!;
          let b = '';
          for (let i = 0; i < r.length; i++) {
            if (r[i] !== '%') { b += r[i]; continue; }
            i++;
            const c = r[i];
            if (c >= '0' && c <= '9') {
              const caps = ms.captures(s, e, true);
              const v = c === '0' ? whole : caps[c.charCodeAt(0) - 49];
              if (c !== '0' && c.charCodeAt(0) - 49 >= Math.max(1, ms.level)) throw new LuaError('invalid capture index');
              b += tostr(v) ?? '';
            } else b += c;
          }
          rep = b;
        }
        if (rep === undefined || rep === false) out += whole;
        else {
          const rs = tostr(rep);
          if (rs === undefined) throw new LuaError(`invalid replacement value (a ${typeName(rep)})`);
          out += rs;
        }
      }
      if (e !== -1 && e > s) s = e;
      else if (s < src.length) out += src[s++];
      else break;
      if (anchor) break;
    }
    return [out + src.slice(s), n];
  });

  function strFind(a: LuaValue[], find: boolean, fname: string): LuaValue[] {
    const s = checkStr(a, 0, fname), p = checkStr(a, 1, fname);
    let init = posrelat(optInt(a, 2, fname, 1), s.length) - 1;
    if (init < 0) init = 0;
    else if (init > s.length) init = s.length;
    if (find && (truthy(a[3]) || !/[\^$*+?.([%-]/.test(p))) {
      const i = s.indexOf(p, init);
      return i === -1 ? [undefined] : [i + 1, i + p.length];
    }
    const anchor = p[0] === '^';
    const pat = anchor ? p.slice(1) : p;
    let s1 = init;
    do {
      const ms = new MatchState(s, pat);
      const e = ms.match(s1, 0);
      if (e !== -1) {
        if (find) return [s1 + 1, e, ...ms.captures(s1, e, false)];
        return ms.captures(s1, e, true);
      }
      s1++;
    } while (s1 <= s.length && !anchor);
    return [undefined];
  }

  function format(a: LuaValue[]): string {
    const fmt = checkStr(a, 0, 'format');
    let arg = 0;
    let out = '';
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt[i];
      if (c !== '%') { out += c; continue; }
      if (fmt[i + 1] === '%') { out += '%'; i++; continue; }
      let j = i + 1;
      let flags = '';
      while ('-+ #0'.includes(fmt[j]) && j < fmt.length) flags += fmt[j++];
      let width = '';
      while (fmt[j] >= '0' && fmt[j] <= '9') width += fmt[j++];
      let prec: string | null = null;
      if (fmt[j] === '.') { j++; prec = ''; while (fmt[j] >= '0' && fmt[j] <= '9') prec += fmt[j++]; }
      const conv = fmt[j];
      i = j;
      arg++;
      let body: string;
      const left = flags.includes('-');
      const zero = flags.includes('0') && !left;
      const signed = (n: number, digits: string) => (n < 0 ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '') + digits;
      switch (conv) {
        case 'd': case 'i': {
          const n = Math.trunc(checkNum(a, arg, 'format'));
          let d = Math.abs(n).toString();
          if (prec !== null) d = d.padStart(Number(prec), '0');
          body = signed(n, d);
          break;
        }
        case 'u': body = (Math.trunc(checkNum(a, arg, 'format')) >>> 0).toString(); break;
        case 'c': body = String.fromCharCode(checkInt(a, arg, 'format')); break;
        case 'x': case 'X': case 'o': {
          const n = Math.trunc(checkNum(a, arg, 'format')) >>> 0;
          body = n.toString(conv === 'o' ? 8 : 16);
          if (conv === 'X') body = body.toUpperCase();
          if (prec !== null) body = body.padStart(Number(prec), '0');
          if (flags.includes('#') && n !== 0) body = (conv === 'o' ? '0' : conv === 'x' ? '0x' : '0X') + body;
          break;
        }
        case 'e': case 'E': case 'f': case 'g': case 'G': {
          const n = checkNum(a, arg, 'format');
          const p = prec === null ? 6 : Number(prec);
          let d: string;
          const ax = Math.abs(n);
          if (conv === 'f') d = fmtF(ax, p);
          else if (conv === 'e' || conv === 'E') d = fmtE(ax, p);
          else d = fmtG(ax, p, flags.includes('#'));
          if (conv === 'E' || conv === 'G') d = d.toUpperCase();
          body = signed(n < 0 || Object.is(n, -0) ? -1 : 1, d);
          break;
        }
        case 'q': {
          const s = checkStr(a, arg, 'format');
          body = '"' + s.replace(/[\\"\n\r\0]/g, (ch) => (ch === '\n' ? '\\\n' : ch === '\r' ? '\\r' : ch === '\0' ? '\\000' : '\\' + ch)) + '"';
          break;
        }
        case 's': {
          const v = a[arg];
          let s = tostr(v);
          if (s === undefined) throw argError(arg + 1, 'format', `string expected, got ${v === undefined ? 'no value' : typeName(v)}`);
          if (prec !== null) s = s.slice(0, Number(prec));
          body = s;
          break;
        }
        default:
          throw new LuaError(`invalid option to \`format'`);
      }
      const w = Number(width || 0);
      if (body.length < w) {
        if (left) body = body.padEnd(w, ' ');
        else if (zero && /[dieEfgGxXo]/.test(conv)) {
          const sign = /^[-+ ]/.test(body) ? body[0] : '';
          body = sign + body.slice(sign.length).padStart(w - sign.length, '0');
        } else body = body.padStart(w, ' ');
      }
      out += body;
    }
    return out;
  }

  return rand;
}

// ---------------------------------------------------------------- Lua patterns (lstrlib.c)

const CAP_UNFINISHED = -1;
const CAP_POSITION = -2;

function classMatch(c: number, cl: string): boolean {
  const lower = cl.toLowerCase();
  let res: boolean;
  const ch = String.fromCharCode(c);
  switch (lower) {
    case 'a': res = /[A-Za-z]/.test(ch); break;
    case 'c': res = c < 32 || c === 127; break;
    case 'd': res = c >= 48 && c <= 57; break;
    case 'l': res = c >= 97 && c <= 122; break;
    case 'p': res = /[!-\/:-@\[-`{-~]/.test(ch); break;
    case 's': res = c === 32 || (c >= 9 && c <= 13); break;
    case 'u': res = c >= 65 && c <= 90; break;
    case 'w': res = /[A-Za-z0-9]/.test(ch); break;
    case 'x': res = /[0-9A-Fa-f]/.test(ch); break;
    case 'z': res = c === 0; break;
    default: return cl.charCodeAt(0) === c;
  }
  return cl === lower ? res : !res;
}

class MatchState {
  level = 0;
  capture: { init: number; len: number }[] = [];
  src: string;
  pat: string;
  constructor(src: string, pat: string) { this.src = src; this.pat = pat; }

  private classEnd(p: number): number {
    const pat = this.pat;
    const c = pat[p++];
    if (c === '%') {
      if (p >= pat.length) throw new LuaError('malformed pattern (ends with `%\')');
      return p + 1;
    }
    if (c === '[') {
      if (pat[p] === '^') p++;
      do {
        if (p >= pat.length) throw new LuaError('malformed pattern (missing `]\')');
        const cc = pat[p++];
        if (cc === '%' && p < pat.length) p++;
      } while (pat[p] !== ']');
      return p + 1;
    }
    return p;
  }

  private matchBracket(c: number, p: number, ec: number): boolean {
    const pat = this.pat;
    let sig = true;
    if (pat[p + 1] === '^') { sig = false; p++; }
    while (++p < ec) {
      if (pat[p] === '%') {
        p++;
        if (classMatch(c, pat[p])) return sig;
      } else if (pat[p + 1] === '-' && p + 2 < ec) {
        p += 2;
        if (pat.charCodeAt(p - 2) <= c && c <= pat.charCodeAt(p)) return sig;
      } else if (pat.charCodeAt(p) === c) return sig;
    }
    return !sig;
  }

  private singleMatch(s: number, p: number, ep: number): boolean {
    if (s >= this.src.length) return false;
    const c = this.src.charCodeAt(s);
    switch (this.pat[p]) {
      case '.': return true;
      case '%': return classMatch(c, this.pat[p + 1]);
      case '[': return this.matchBracket(c, p, ep - 1);
      default: return this.pat.charCodeAt(p) === c;
    }
  }

  match(s: number, p: number): number {
    const pat = this.pat, src = this.src;
    for (;;) {
      if (p >= pat.length) return s;
      switch (pat[p]) {
        case '(':
          if (pat[p + 1] === ')') return this.startCapture(s, p + 2, CAP_POSITION);
          return this.startCapture(s, p + 1, CAP_UNFINISHED);
        case ')':
          return this.endCapture(s, p + 1);
        case '%':
          if (pat[p + 1] === 'b') return this.matchBalance(s, p + 2);
          if (pat[p + 1] === 'f') {
            p += 2;
            if (pat[p] !== '[') throw new LuaError('missing `[\' after `%f\' in pattern');
            const ep = this.classEnd(p);
            const prev = s === 0 ? 0 : src.charCodeAt(s - 1);
            const cur = s < src.length ? src.charCodeAt(s) : 0;
            if (!this.matchBracket(prev, p, ep - 1) && this.matchBracket(cur, p, ep - 1)) { p = ep; continue; }
            return -1;
          }
          if (pat[p + 1] >= '0' && pat[p + 1] <= '9') {
            const l = pat.charCodeAt(p + 1) - 49;
            if (l < 0 || l >= this.level || this.capture[l].len === CAP_UNFINISHED) throw new LuaError('invalid capture index');
            const cap = src.substr(this.capture[l].init, this.capture[l].len);
            if (src.startsWith(cap, s)) { s += cap.length; p += 2; continue; }
            return -1;
          }
          break;
        case '$':
          if (p + 1 === pat.length) return s === src.length ? s : -1;
          break;
      }
      const ep = this.classEnd(p);
      const m = this.singleMatch(s, p, ep);
      switch (pat[ep]) {
        case '?': {
          if (m) {
            const r = this.match(s + 1, ep + 1);
            if (r !== -1) return r;
          }
          p = ep + 1;
          continue;
        }
        case '*': return this.maxExpand(s, p, ep);
        case '+': return m ? this.maxExpand(s + 1, p, ep) : -1;
        case '-': return this.minExpand(s, p, ep);
        default:
          if (!m) return -1;
          s++;
          p = ep;
          continue;
      }
    }
  }

  private maxExpand(s: number, p: number, ep: number): number {
    let i = 0;
    while (this.singleMatch(s + i, p, ep)) i++;
    while (i >= 0) {
      const r = this.match(s + i, ep + 1);
      if (r !== -1) return r;
      i--;
    }
    return -1;
  }

  private minExpand(s: number, p: number, ep: number): number {
    for (;;) {
      const r = this.match(s, ep + 1);
      if (r !== -1) return r;
      if (this.singleMatch(s, p, ep)) s++;
      else return -1;
    }
  }

  private startCapture(s: number, p: number, what: number): number {
    this.capture[this.level] = { init: s, len: what };
    this.level++;
    const r = this.match(s, p);
    if (r === -1) this.level--;
    return r;
  }

  private endCapture(s: number, p: number): number {
    let l = -1;
    for (let i = this.level - 1; i >= 0; i--) if (this.capture[i].len === CAP_UNFINISHED) { l = i; break; }
    if (l < 0) throw new LuaError('invalid pattern capture');
    this.capture[l].len = s - this.capture[l].init;
    const r = this.match(s, p);
    if (r === -1) this.capture[l].len = CAP_UNFINISHED;
    return r;
  }

  private matchBalance(s: number, p: number): number {
    if (p + 1 >= this.pat.length) throw new LuaError('unbalanced pattern');
    if (this.src[s] !== this.pat[p]) return -1;
    const b = this.pat[p], e = this.pat[p + 1];
    let cont = 1;
    let i = s + 1;
    while (i < this.src.length) {
      const c = this.src[i];
      if (c === e) { if (--cont === 0) return this.match(i + 1, p + 2); } else if (c === b) cont++;
      i++;
    }
    return -1;
  }

  captures(s: number, e: number, wholeIfNone: boolean): LuaValue[] {
    const n = this.level === 0 && wholeIfNone ? 1 : this.level;
    const out: LuaValue[] = [];
    for (let i = 0; i < n; i++) {
      if (i >= this.level) { out.push(this.src.slice(s, e)); continue; }
      const c = this.capture[i];
      if (c.len === CAP_POSITION) out.push(c.init + 1);
      else out.push(this.src.substr(c.init, c.len));
    }
    return out;
  }
}
