// A small zlib/DEFLATE decoder (RFC 1950/1951), synchronous, the same in the page and in node tests.

class Huff {
  counts = new Uint16Array(16);
  symbols: Uint16Array;
  constructor(n: number) { this.symbols = new Uint16Array(n); }
}

function build(h: Huff, lengths: Uint8Array, off: number, n: number): void {
  h.counts.fill(0);
  for (let i = 0; i < n; i++) h.counts[lengths[off + i]]++;
  h.counts[0] = 0;
  const offs = new Uint16Array(16);
  for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + h.counts[i - 1];
  for (let i = 0; i < n; i++) if (lengths[off + i]) h.symbols[offs[lengths[off + i]]++] = i;
}

const LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073,
  4097, 6145, 8193, 12289, 16385, 24577];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const CL_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

const fixedLit = new Huff(288), fixedDist = new Huff(30);
{
  const l = new Uint8Array(288);
  for (let i = 0; i < 144; i++) l[i] = 8;
  for (let i = 144; i < 256; i++) l[i] = 9;
  for (let i = 256; i < 280; i++) l[i] = 7;
  for (let i = 280; i < 288; i++) l[i] = 8;
  build(fixedLit, l, 0, 288);
  const d = new Uint8Array(30).fill(5);
  build(fixedDist, d, 0, 30);
}

export function inflate(src: Uint8Array, zlib = true): Uint8Array {
  let pos = zlib ? 2 : 0;
  let bitbuf = 0, bitcnt = 0;
  let out = new Uint8Array(Math.max(1024, src.length * 4));
  let olen = 0;
  const need = (n: number): void => {
    if (olen + n <= out.length) return;
    let size = out.length * 2;
    while (size < olen + n) size *= 2;
    const o = new Uint8Array(size);
    o.set(out.subarray(0, olen));
    out = o;
  };
  const bits = (n: number): number => {
    while (bitcnt < n) {
      if (pos >= src.length) throw new Error('inflate: truncated');
      bitbuf |= src[pos++] << bitcnt;
      bitcnt += 8;
    }
    const v = bitbuf & ((1 << n) - 1);
    bitbuf >>>= n;
    bitcnt -= n;
    return v;
  };
  const decode = (h: Huff): number => {
    let code = 0, first = 0, index = 0;
    for (let len = 1; len < 16; len++) {
      code |= bits(1);
      const count = h.counts[len];
      if (code - count < first) return h.symbols[index + (code - first)];
      index += count;
      first += count;
      first <<= 1;
      code <<= 1;
    }
    throw new Error('inflate: bad code');
  };
  const lit = new Huff(288), dist = new Huff(30);
  for (;;) {
    const final = bits(1);
    const type = bits(2);
    if (type === 0) {
      bitbuf = 0; bitcnt = 0;
      const len = src[pos] | (src[pos + 1] << 8);
      pos += 4;
      need(len);
      out.set(src.subarray(pos, pos + len), olen);
      olen += len;
      pos += len;
    } else {
      let L = fixedLit, D = fixedDist;
      if (type === 2) {
        const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
        const cl = new Uint8Array(19);
        for (let i = 0; i < hclen; i++) cl[CL_ORDER[i]] = bits(3);
        const clh = new Huff(19);
        build(clh, cl, 0, 19);
        const lens = new Uint8Array(hlit + hdist);
        for (let i = 0; i < hlit + hdist;) {
          const sym = decode(clh);
          if (sym < 16) lens[i++] = sym;
          else {
            let rep = 0, val = 0;
            if (sym === 16) { val = lens[i - 1]; rep = 3 + bits(2); } else if (sym === 17) rep = 3 + bits(3); else rep = 11 + bits(7);
            while (rep--) lens[i++] = val;
          }
        }
        build(lit, lens, 0, hlit);
        build(dist, lens, hlit, hdist);
        L = lit; D = dist;
      } else if (type !== 1) throw new Error('inflate: bad block');
      for (;;) {
        const sym = decode(L);
        if (sym < 256) { need(1); out[olen++] = sym; } else if (sym === 256) break; else {
          const s = sym - 257;
          const len = LEN_BASE[s] + bits(LEN_EXTRA[s]);
          const ds = decode(D);
          const d = DIST_BASE[ds] + bits(DIST_EXTRA[ds]);
          need(len);
          for (let i = 0; i < len; i++, olen++) out[olen] = out[olen - d];
        }
      }
    }
    if (final) break;
  }
  return out.subarray(0, olen);
}
