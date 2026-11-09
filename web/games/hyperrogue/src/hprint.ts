// hprint.cpp of HyperRogue 13.1o: the string formatting the rules and the save code use (its, fts, itsh,
// hr::format, ...). The stream classes (hstream, fhstream, shstream, logger hlog) and the debug output are not
// ported in stage 1: `println(hlog, ...)` and DEBB lines are left out (PORTING.md, "Macros").
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Strings: the original's strings are byte strings. as_hexstring / from_hexstring / as_cstring /
// as_nice_cstring work on "binary" JS strings (one char per byte, char codes 0..255); other chars are taken
// & 0xFF.
import { G } from './globals.ts';
import { fmtG } from './cpp.ts';
import { rand } from './rand.ts';
import { SDL_GetTicks } from './util.ts';

export function its(i: number): string { return format('%d', i); }

export function itsh8(i: number): string { return format('%08X', i); }
export function itsh6(i: number): string { return format('%06X', i); }

/** ostream << x with precision prec (the default float format, i.e. %.<prec>g) */
export function fts(x: number, prec = 6): string {
  return fmtG(x, prec);
}

export function index_pointer_int(v: object | null): number {
  if (v === null) return 0;
  if (!G.pointer_indices.has(v)) {
    const s = G.pointer_indices.size + 1;
    G.pointer_indices.set(v, s);
  }
  return G.pointer_indices.get(v)!;
}

export function index_pointer(v: object | null): string {
  let i = index_pointer_int(v);
  if (!i) return '0';
  let res = '';
  while (true) { res += String.fromCharCode(65 + (i % 26)); i = Math.trunc(i / 26); if (!i) break; i--; }
  return res;
}

export function get_stamp(): string {
  if (G.stamplen === 0) return '';
  let t = SDL_GetTicks();
  let pow10 = 1;
  for (let i = 0; i < G.stamplen; i++) pow10 *= 10;
  if (t < 0) t = pow10 - 1;
  t %= pow10;
  let s = its(t);
  while (s.length < G.stamplen) s = '0' + s;
  return s;
}

/** inline string ONOFF(bool b) (the XLAT is applied by the caller's module: language.ts) */

/** hr::format(fmt, ...): vsnprintf into a 1000-byte buffer. Supports the conversions the game uses:
 *  flags `-+ #0`, width, precision (also `*`), length modifiers (ignored), d i u x X o c s f F e E g G p %. */
export function format(fmt: string, ...args: unknown[]): string {
  let out = '';
  let ai = 0;
  for (let i = 0; i < fmt.length; i++) {
    const ch = fmt[i];
    if (ch !== '%') { out += ch; continue; }
    i++;
    if (fmt[i] === '%') { out += '%'; continue; }
    let flags = '';
    while ('-+ #0'.includes(fmt[i])) flags += fmt[i++];
    let width = 0;
    if (fmt[i] === '*') { width = Number(args[ai++]); i++; if (width < 0) { flags += '-'; width = -width; } }
    else while (fmt[i] >= '0' && fmt[i] <= '9') width = width * 10 + (fmt.charCodeAt(i++) - 48);
    let prec = -1;
    if (fmt[i] === '.') {
      i++; prec = 0;
      if (fmt[i] === '*') { prec = Number(args[ai++]); i++; }
      else while (fmt[i] >= '0' && fmt[i] <= '9') prec = prec * 10 + (fmt.charCodeAt(i++) - 48);
    }
    while ('hlLqjzt'.includes(fmt[i])) i++;
    const conv = fmt[i];
    const arg = args[ai++];
    let body = '';
    let sign = '';
    switch (conv) {
      case 'd': case 'i': {
        let n = Math.trunc(Number(arg));
        if (n < 0) { sign = '-'; n = -n; } else if (flags.includes('+')) sign = '+'; else if (flags.includes(' ')) sign = ' ';
        body = String(n);
        if (prec >= 0) { body = body.padStart(prec, '0'); if (prec === 0 && n === 0) body = ''; }
        break;
      }
      case 'u': body = String(Number(arg) >>> 0); if (prec >= 0) body = body.padStart(prec, '0'); break;
      case 'x': case 'X': case 'o': {
        const n = typeof arg === 'bigint' ? arg : BigInt(Number(arg) >>> 0);
        body = n.toString(conv === 'o' ? 8 : 16);
        if (conv === 'X') body = body.toUpperCase();
        if (prec >= 0) body = body.padStart(prec, '0');
        if (flags.includes('#') && n !== 0n) body = (conv === 'o' ? '0' : conv === 'x' ? '0x' : '0X') + body;
        break;
      }
      case 'c': body = String.fromCharCode(Number(arg) & 0xFF); break;
      case 's': body = String(arg); if (prec >= 0) body = body.slice(0, prec); break;
      case 'p': body = '0x' + index_pointer_int(arg as object).toString(16); break;
      case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
        let x = Number(arg);
        if (x < 0 || Object.is(x, -0)) { sign = '-'; x = -x; } else if (flags.includes('+')) sign = '+'; else if (flags.includes(' ')) sign = ' ';
        const p = prec < 0 ? 6 : prec;
        if (!isFinite(x)) body = isNaN(x) ? 'nan' : 'inf';
        else if (conv === 'f' || conv === 'F') body = x.toFixed(p);
        else if (conv === 'e' || conv === 'E') body = expForm(x, p);
        else {
          body = fmtG(x, p);
          if (flags.includes('#') && !body.includes('.')) body += '.';
        }
        if (conv === 'E' || conv === 'G' || conv === 'F') body = body.toUpperCase();
        break;
      }
      default: body = '%' + flags + conv; break;
    }
    let s = sign + body;
    if (s.length < width) {
      if (flags.includes('-')) s = s.padEnd(width, ' ');
      else if (flags.includes('0') && !'sc'.includes(conv) && !(prec >= 0 && 'diuxXo'.includes(conv)))
        s = sign + body.padStart(width - sign.length, '0');
      else s = s.padStart(width, ' ');
    }
    out += s;
  }
  // vsnprintf(buf, 1000, ...): at most 999 characters
  return out.length > 999 ? out.slice(0, 999) : out;
}

function expForm(x: number, p: number): string {
  const e = x.toExponential(p);
  const k = e.indexOf('e');
  const n = parseInt(e.slice(k + 1), 10);
  return e.slice(0, k) + 'e' + (n < 0 ? '-' : '+') + String(Math.abs(n)).padStart(2, '0');
}

/** print(hstream& hs, cld x): the complex number as text (the stream is the returned string) */
export function print_cld(re: number, im: number): string {
  let s = '';
  let parts = 0;
  if (kz(re)) {
    s += fts(re, 6);
    parts++;
  }
  if (kz(im)) {
    if (parts && im > 0) s += '+';
    parts++;
    s += fts(im, 6) + 'i';
  }
  if (!parts) s += its(0);
  return s;
}

export function fts_fixed(x: number, prec = 6): string {
  return x.toFixed(prec);
}

/** scanline_noblank(fhstream&): on a line already read (file reading is the save code's, a later stage) */
export function scanline_noblank_s(s: string): string {
  while (s.length && [9, 13, 32, 10].includes(s.charCodeAt(s.length - 1))) s = s.slice(0, -1);
  while (s.length && [9, 13, 32, 10].includes(s.charCodeAt(0))) s = s.slice(1);
  return s;
}

export function cts(c: string | number): string {
  const ch = typeof c === 'number' ? String.fromCharCode(c & 0xFF) : c[0];
  // char buf[8]; buf[0] = c; buf[1] = 0: a NUL char gives the empty string
  return ch === '\0' ? '' : ch;
}

export function llts(i: number): string {
  // sprintf does not work on Windows IIRC
  if (i < 0) return '-' + llts(-i);
  if (i < 10) return its(i);
  return llts(Math.trunc(i / 10)) + its(i % 10);
}

/** itsh(unsigned int) / itsh(int) */
export function itsh(i: number): string { return format('%03X', i); }
export function itsh2(i: number): string { return format('%02X', i); }

/** itsh(unsigned long long) */
export function itsh_ll(i: bigint): string {
  const i0 = Number(BigInt.asIntN(32, i));
  const i1 = Number(BigInt.asIntN(32, i >> 32n));
  if (i1) return itsh(i1) + itsh8(i0);
  else return itsh(i0);
}

// kz: utility for printing
// if it is close to 0, assume it is floating errors

export function kz(x: number): number {
  if (Math.abs(x) < 1e-6) return 0;
  return x;
}

export function pick123(): string { return cts(49 + rand() % 3); }
export function pick12(): string { return cts(49 + rand() % 2); }

export function as_hexstring(o: string): string {
  let res = '';
  for (let i = 0; i < o.length; i++) {
    res += format('%02X', o.charCodeAt(i) & 0xFF);
  }
  return res;
}

export function from_hexstring(o: string): string {
  let res = '';
  for (let i = 0; i < o.length; i += 2) {
    const buf = o.slice(i, i + 2);
    // sscanf(buf, "%02X", &x): leading hex digits; x stays uninitialized (0 here) when none
    const m = /^[0-9a-fA-F]+/.exec(buf);
    const x = m ? parseInt(m[0], 16) : 0;
    res += String.fromCharCode(x & 0xFF);
  }
  return res;
}

export function as_cstring(o: string): string {
  let s = 'string("';
  for (let i = 0; i < o.length; i++)
    s += format('\\x%02x', o.charCodeAt(i) & 0xFF);
  s += format('", %d)', o.length);
  return s;
}

export function as_nice_cstring(o: string): string {
  let s = '"';
  for (let i = 0; i < o.length; i++) {
    const c = (o.charCodeAt(i) << 24) >> 24; // char is signed
    if (c >= 32 && c < 126)
      s += o[i];
    else if (c === 10)
      s += '\\n';
    else
      s += format('\\x%02x', c & 0xFF);
  }
  s += '"';
  return s;
}

/** template lalign(len, t...): the printed values (as strings) padded with spaces to len */
export function lalign(len: number, ...t: unknown[]): string {
  let s = t.map((x) => String(x)).join('');
  while (s.length < len) s += ' ';
  return s;
}

const last = new Map<string, string>();

export function debug_view(context: string, s: string): void {
  const old = last.get(context) ?? '';
  if (s !== old) { last.set(context, s); /* println(hlog, s) */ }
}

export function split_string(s: string, sep: string): string[] {
  const res: string[] = [];
  let next = '';
  for (const c of s) if (c === sep) { res.push(next); next = ''; } else next += c;
  res.push(next);
  return res;
}

const last_rlerr = new Map<string, number>();
const err_freq = 10000;

export function rate_limited_error(s: string, _t = ''): void {
  const lastv = last_rlerr.get(s) ?? 0;
  if (!lastv || G.ticks > lastv + err_freq) {
    last_rlerr.set(s, G.ticks);
    // println(hlog, s, t)
  }
}
