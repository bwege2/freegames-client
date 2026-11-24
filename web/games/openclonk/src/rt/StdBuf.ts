// OpenClonk port: the engine's string buffer (src/lib/StdBuf.h, StdBuf.cpp: StdStrBuf) and the string helpers
// it relies on (platform/StdFile.cpp: WildcardMatch). Text is bytes, NUL-terminated as in C++: a buffer of
// size n holds n - 1 characters and the terminator; a null buffer has no data at all.
import { bytesOf, sprintf, type PrintfArg } from './printf.ts';

const dec = new TextDecoder();

/** C's isspace() in the "C" locale */
export function isspace(c: number): boolean {
  return c === 32 || (c >= 9 && c <= 13);
}

/** C's tolower() in the "C" locale */
export function tolower(c: number): number {
  return c >= 65 && c <= 90 ? c + 32 : c;
}

/** the bytes of s up to its first NUL */
function cstr(s: string | Uint8Array | StdStrBuf): Uint8Array {
  if (s instanceof StdStrBuf) return s.isNull() ? new Uint8Array(0) : s.d!.subarray(0, s.getLength());
  const b = bytesOf(s);
  const z = b.indexOf(0);
  return z >= 0 ? b.subarray(0, z) : b;
}

/**
 * Standard.cpp SSearch: the index just after the first match of needle in hay[from..] (up to a NUL), or -1.
 * It does not backtrack: after a partial match it goes on with the next character ("bb " has no "b ").
 */
export function SSearch(hay: Uint8Array, needle: Uint8Array, from: number): number {
  let match = 0;
  for (let i = from; i < hay.length && hay[i]; i++) {
    if (hay[i] === (match < needle.length ? needle[match] : 0)) match++; else match = 0;
    if (match >= needle.length) return i + 1;
  }
  return -1;
}

export class StdStrBuf {
  /** the bytes including the terminating NUL, or null */
  d: Uint8Array | null = null;

  constructor(s?: string | Uint8Array | StdStrBuf | null) {
    if (s != null) this.Copy(s);
  }

  isNull(): boolean { return this.d === null; }
  getSize(): number { return this.d ? this.d.length : 0; }
  getLength(): number { return this.d ? this.d.length - 1 : 0; }
  /** the characters (without the NUL) */
  getData(): Uint8Array | null { return this.d ? this.d.subarray(0, this.d.length - 1) : null; }
  at(i: number): number { return this.d![i]; }
  toString(): string { return this.d ? dec.decode(this.d.subarray(0, this.d.length - 1)) : ''; }

  Clear(): void { this.d = null; }
  Copy(s: string | Uint8Array | StdStrBuf | null): void {
    if (s === null || (s instanceof StdStrBuf && s.isNull())) { this.d = null; return; }
    const b = cstr(s);
    this.d = new Uint8Array(b.length + 1);
    this.d.set(b);
  }
  /** Ref: shares the other buffer's bytes */
  Ref(s: StdStrBuf): void { this.d = s.d; }
  Take(s: StdStrBuf): void { this.d = s.d; s.d = null; }
  Duplicate(): StdStrBuf { return new StdStrBuf(this); }

  Grow(n: number): void {
    const len = this.getLength();
    const nd = new Uint8Array(len + n + 1);
    if (this.d) nd.set(this.d.subarray(0, len));
    this.d = nd;
  }
  Shrink(n: number): void {
    const len = this.getLength() - n;
    const nd = new Uint8Array(len + 1);
    nd.set(this.d!.subarray(0, len));
    this.d = nd;
  }
  SetLength(n: number): void {
    if (n === this.getLength() && !this.isNull()) return;
    if (n >= this.getLength()) this.Grow(n - this.getLength()); else this.Shrink(this.getLength() - n);
  }

  Append(s: string | Uint8Array | StdStrBuf, chars?: number): void {
    let b = cstr(s);
    if (chars !== undefined) b = bytesOf(s instanceof StdStrBuf ? s.getData() ?? new Uint8Array(0) : s).subarray(0, chars);
    const len = this.getLength();
    this.Grow(b.length);
    this.d!.set(b, len);
  }
  AppendChars(c: number, n: number): void {
    const len = this.getLength();
    this.Grow(n);
    this.d!.fill(c & 0xff, len, len + n);
  }
  AppendChar(c: number): void { this.AppendChars(c, 1); }
  /** a Unicode code point as UTF-8 */
  AppendCharacter(u: number): void {
    if (u < 0x80) this.AppendChar(u);
    else if (u < 0x800) this.Append(Uint8Array.of(0xc0 | (u >> 6), 0x80 | (u & 0x3f)));
    else if (u < 0x10000) this.Append(Uint8Array.of(0xe0 | (u >> 12), 0x80 | ((u >> 6) & 0x3f), 0x80 | (u & 0x3f)));
    else if (u < 0x110000) this.Append(Uint8Array.of(0xf0 | (u >> 18), 0x80 | ((u >> 12) & 0x3f), 0x80 | ((u >> 6) & 0x3f), 0x80 | (u & 0x3f)));
  }
  InsertChar(c: number, before: number): void {
    this.Grow(1);
    const d = this.d!;
    for (let i = this.getLength() - 1; i > before; --i) d[i] = d[i - 1];
    d[before] = c;
  }

  Format(fmt: string | Uint8Array, ...args: PrintfArg[]): void { this.Clear(); this.AppendFormat(fmt, ...args); }
  AppendFormat(fmt: string | Uint8Array, ...args: PrintfArg[]): void {
    const r = sprintf(fmt, args);
    if (this.isNull()) { this.d = new Uint8Array(r.length + 1); this.d.set(r); } else this.Append(r);
  }

  /** memcmp of the common part, then the shorter one first */
  Compare(o: StdStrBuf, at = 0): number {
    const a = this.getData() ?? new Uint8Array(0), b = o.getData() ?? new Uint8Array(0);
    const n = Math.min(this.getLength() - at, o.getLength());
    for (let i = 0; i < n; i++) if (a[at + i] !== b[i]) return a[at + i] < b[i] ? -1 : 1;
    if (this.getLength() < o.getLength() + at) return -1;
    if (this.getLength() > o.getLength() + at) return 1;
    return 0;
  }
  op_eq(o: StdStrBuf | string): boolean {
    const b = o instanceof StdStrBuf ? o : new StdStrBuf(o);
    return this.getLength() === b.getLength() && !this.Compare(b);
  }
  /** operator<: shorter first, then strcmp (the order of std::map<StdStrBuf, ...>) */
  op_lt(o: StdStrBuf): boolean {
    const l1 = this.getLength(), l2 = o.getLength();
    if (l1 !== l2) return l1 < l2;
    return l1 ? this.Compare(o) < 0 : false;
  }
  BeginsWith(s: string | Uint8Array): boolean {
    const b = cstr(s);
    const d = this.d ?? new Uint8Array(1);
    for (let i = 0; i < b.length; i++) if (d[i] !== b[i]) return false;
    return true;
  }

  copyPart(start: number, size: number): StdStrBuf {
    const r = new StdStrBuf();
    if (!size) return r;
    r.d = new Uint8Array(size + 1);
    r.d.set(this.d!.subarray(start, start + size));
    return r;
  }
  SplitAtChar(c: number, split: StdStrBuf | null): boolean {
    if (!this.d) return false;
    const p = this.getData()!.indexOf(c);
    if (p < 0) return false;
    if (split) split.Take(this.copyPart(p + 1, this.getLength() - p - 1));
    this.Shrink(this.getLength() - p);
    return true;
  }

  /** StdStrBuf::Replace: every occurrence of old (searched from start on, not overlapping); the count */
  Replace(old: string | Uint8Array, nw: string | Uint8Array | null, start = 0): number {
    if (!this.d) return 0;
    const o = cstr(old), n = nw === null ? new Uint8Array(0) : cstr(nw);
    const s = this.getData()!;
    if (!o.length) return 0;
    // the ends of the matches, as SSearch finds them
    const ends: number[] = [];
    for (let p = SSearch(s, o, start); p >= 0; p = SSearch(s, o, p)) ends.push(p);
    if (o.length === n.length) {
      for (const p of ends) this.d.set(n, p - o.length);
      return ends.length;
    }
    if (!ends.length) return 0;
    const out = new Uint8Array(s.length + ends.length * (n.length - o.length) + 1);
    let r = 0, w = 0;
    for (const p of ends) {
      out.set(s.subarray(r, p - o.length), w); w += p - o.length - r;
      out.set(n, w); w += n.length;
      r = p;
    }
    out.set(s.subarray(r), w);
    this.d = out;
    return ends.length;
  }
  ReplaceChar(c: number, n: number): number {
    if (!this.d) return 0;
    c &= 0xff; n &= 0xff;
    if (!c) return 0;
    if (!n) n = 95;
    let cnt = 0;
    for (let i = 0; i < this.getLength(); i++) if (this.d[i] === c) { this.d[i] = n; cnt++; }
    return cnt;
  }
  ReplaceEnd(pos: number, end: string | Uint8Array): void {
    const len = this.getLength();
    if (pos > len) return;
    const e = cstr(end);
    if (len - pos !== e.length) this.SetLength(pos + e.length);
    this.d!.set(e, pos);
  }
  GetSection(idx: number, out: StdStrBuf, sep = 44): boolean {
    out.Clear();
    if (!this.d) return false;
    const s = this.getData()!;
    let start = 0, p = s.indexOf(sep, start);
    while (p >= 0 && idx) { start = p + 1; --idx; p = s.indexOf(sep, start); }
    if (idx) return false;
    const end = p >= 0 ? p : s.length;
    if (end !== start) out.Copy(s.subarray(start, end));
    return true;
  }
  ToLowerCase(): void {
    if (!this.d) return;
    for (let i = 0; i < this.getLength() && this.d[i]; i++) this.d[i] = tolower(this.d[i]);
  }
  /** TrimSpaces: true if something was cut */
  TrimSpaces(): boolean {
    const len = this.getLength();
    if (!len) return false;
    const s = this.d!;
    let l = 0;
    while (l < len && isspace(s[l])) ++l;
    if (l === len) { this.Clear(); return true; }
    let r = 0;
    while (isspace(s[len - 1 - r])) ++r;
    if (!l && !r) return false;
    this.d = this.copyPart(l, len - l - r).d;
    return true;
  }
  /** EnsureUnicode: text that is not valid UTF-8 is taken as Windows-1252 and converted; true if converted */
  EnsureUnicode(): boolean {
    const s = this.getData();
    if (!s || isValidUtf8(s)) return false;
    const out: number[] = [];
    // the original converts getSize() bytes: the terminating NUL becomes a character of the result
    for (const c of this.d!) {
      if (c < 0x80) out.push(c);
      else if (c === 0x81 || c === 0x8d || c === 0x8f || c === 0x90 || c === 0x9d || c >= 0xa0) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else out.push(...CP1252[c - 0x80]);
    }
    this.d = new Uint8Array(out.length + 1);
    this.d.set(out);
    return true;
  }
  ValidateChars(initial: string, mid: string): boolean {
    for (let i = 0; i < this.getLength(); i++) if (!(i ? mid : initial).includes(String.fromCharCode(this.d![i]))) return false;
    return true;
  }
  EscapeString(): void {
    this.Replace('\\', '\\\\');
    this.Replace('"', '\\"');
  }
  /** GetHash: zlib's crc32 of the bytes including the NUL, as int */
  GetHash(): number {
    if (!this.d) return 0;
    return crc32(0, this.d) | 0;
  }
}

/** FormatString(fmt, ...) */
export function FormatString(fmt: string | Uint8Array, ...args: PrintfArg[]): StdStrBuf {
  const b = new StdStrBuf();
  b.Format(fmt, ...args);
  return b;
}

const CP1252: number[][] = [
  [0xe2, 0x82, 0xac], [], [0xe2, 0x80, 0x9a], [0xc6, 0x92], [0xe2, 0x80, 0x9e], [0xe2, 0x80, 0xa6], [0xe2, 0x80, 0xa0], [0xe2, 0x80, 0xa1],
  [0xcb, 0x86], [0xe2, 0x80, 0xb0], [0xc5, 0xa0], [0xe2, 0x80, 0xb9], [0xc5, 0x92], [], [0xc5, 0xbd], [],
  [], [0xe2, 0x80, 0x98], [0xe2, 0x80, 0x99], [0xe2, 0x80, 0x9c], [0xe2, 0x80, 0x9d], [0xe2, 0x80, 0xa2], [0xe2, 0x80, 0x93], [0xe2, 0x80, 0x94],
  [0xcb, 0x9c], [0xe2, 0x84, 0xa2], [0xc5, 0xa1], [0xe2, 0x80, 0xba], [0xc5, 0x93], [], [0xc5, 0xbe], [0xc5, 0xb8],
];

/** Standard.cpp IsValidUtf8(text, length) */
export function isValidUtf8(s: Uint8Array): boolean {
  const len = s.length;
  for (let i = 0; i < len; ++i) {
    const c = s[i];
    const n = c < 0x80 ? 0 : c < 0xc2 ? -1 : c < 0xe0 ? 1 : c < 0xf0 ? 2 : c < 0xf5 ? 3 : -1;
    if (n < 0) return false;
    if (n === 0) continue;
    if (i + n >= len) return false;
    let v = c & (0xff >> (n + 1));
    for (let k = 0; k < n; ++k) {
      if ((s[i + k + 1] & 0xc0) !== 0x80) return false;
      v = (v << 6) | (s[i + k + 1] & 0x3f);
    }
    if (v < [0, 0x80, 0x800, 0x10000][n]) return false;
    if (v > 0x10ffff) return false;
    if (v >= 0xd800 && v <= 0xdfff) return false;
    i += n;
  }
  return true;
}

let crcTable: Int32Array | null = null;

/** zlib's crc32 */
export function crc32(crc: number, b: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let c = ~crc;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

/** WildcardMatch (platform/StdFile.cpp): * any run, ? one character, [a-z] classes, letters without case */
export function WildcardMatch(wild: string | Uint8Array, str: string | Uint8Array): boolean {
  const w = cstr(wild), s = cstr(str);
  const W = (i: number) => (i < w.length ? w[i] : 0), S = (i: number) => (i < s.length ? s[i] : 0);
  let pw = 0, ps = 0, lw = -1, ls = -1;   // -1: no backtracking position yet
  while (W(pw) || lw >= 0) {
    if (W(pw) === 42) { lw = ++pw; ls = ps; } else if (!S(ps)) break;
    else {
      let m = false;
      if (W(pw) === 91) {
        // WildcardMatchCharacterClass: moves the wildcard to the class's ']' whether it matches or not
        const r = charClass(w, pw, S(ps));
        pw = r.end;
        m = r.match;
      }
      if (m || W(pw) === 63 || tolower(W(pw)) === tolower(S(ps))) { pw++; ps++; } else if (ls >= 0) { pw = lw; ps = ++ls; } else return false;
    }
  }
  return !W(pw) && !S(ps);
}

/** WildcardMatchCharacterClass: [abc], [a-z] (chars compared as signed, as C's char); end: the ']' */
function charClass(w: Uint8Array, at: number, c: number): { match: boolean; end: number } {
  const W = (i: number) => (i < w.length ? w[i] : 0);
  const sc = (b: number) => (b << 24) >> 24;
  let cc = at + 1;
  let match = false;
  do {
    if (W(cc + 1) === 45 && W(cc + 2) !== 93) {
      if (sc(c) >= sc(W(cc)) && sc(c) <= sc(W(cc + 2))) match = true;
      cc += 2;
    } else if (W(cc) === c) match = true;
  } while (W(++cc) && W(cc) !== 93);
  return { match, end: cc };
}
