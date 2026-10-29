// @ts-nocheck
// Members of java.lang and java.util classes that only the translated Swing and AWT use.
import { Character, JString } from './lang.ts';
import { Collections } from './util.ts';

Object.assign(Collections, {
  emptyEnumeration: () => ({ hasMoreElements: () => false, nextElement: () => { throw new Error('NoSuchElementException'); }, asIterator: () => ({ hasNext: () => false }) }),
});

Object.assign(Character, {
  MIN_SUPPLEMENTARY_CODE_POINT: 0x10000,
  isHighSurrogate: (c: number) => c >= 0xd800 && c <= 0xdbff,
  isLowSurrogate: (c: number) => c >= 0xdc00 && c <= 0xdfff,
  isValidCodePoint: (c: number) => c >= 0 && c <= 0x10ffff,
  toCodePoint: (hi: number, lo: number) => ((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000,
  codePointAt(seq: any, i: number, limit?: number) {
    const at = (k: number) => (typeof seq === 'string' ? seq.charCodeAt(k) : Array.isArray(seq) ? seq[k] : seq.charAt(k));
    const len = limit ?? (typeof seq === 'string' ? seq.length : Array.isArray(seq) ? seq.length : seq.length());
    const hi = at(i);
    if (hi >= 0xd800 && hi <= 0xdbff && i + 1 < len) {
      const lo = at(i + 1);
      if (lo >= 0xdc00 && lo <= 0xdfff) return ((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
    }
    return hi;
  },
  /** Bidirectional classes: right-to-left letters for Hebrew and Arabic, left to right otherwise. */
  getDirectionality(c: number) {
    if ((c >= 0x590 && c <= 0x5ff) || (c >= 0xfb1d && c <= 0xfb4f)) return 1; // R
    if ((c >= 0x600 && c <= 0x6ff) || (c >= 0x750 && c <= 0x77f) || (c >= 0xfb50 && c <= 0xfdff) || (c >= 0xfe70 && c <= 0xfeff)) return 2; // AL
    if (c >= 0x30 && c <= 0x39) return 3; // EN
    if (c === 0x20) return 12; // WS
    return 0; // L
  },
});

Object.assign(JString, {
  getChars(s: string, begin: number, end: number, dst: number[], at: number) {
    for (let i = begin; i < end; i++) dst[at + i - begin] = s.charCodeAt(i);
  },
  stripTrailing: (s: string) => s.replace(/\s+$/u, ''),
});
