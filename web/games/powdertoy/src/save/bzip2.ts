// bzip2/bz2wrap.cpp (BZ2WCompress / BZ2WDecompress) and the parts of libbzip2 they use, written anew in TypeScript.
//
// The decompressor reads any non-randomised bzip2 stream (block sizes 1..9, any number of blocks, Huffman code
// lengths up to 20, 2..6 tables); like BZ2_bzDecompress it stops after the first stream. The compressor writes
// valid streams at the game's settings (BZ2_bzCompressInit(&stream, 9, 0, 0): 900k blocks); deviation: its output
// is not bit-identical to libbzip2's (the BWT, MTF and stream layout are the format's, but the Huffman table choice
// and code lengths differ), so a save's compressed bytes differ while the data inside is the same. Randomised
// blocks (only written by bzip2 0.9.0) are rejected as BZ2WDecompressBad.

// BZ2WCompressResult
export const BZ2WCompressOk = 0, BZ2WCompressNomem = 1, BZ2WCompressLimit = 2;
// BZ2WDecompressResult
export const BZ2WDecompressOk = 0, BZ2WDecompressNomem = 1, BZ2WDecompressLimit = 2, BZ2WDecompressType = 3,
  BZ2WDecompressBad = 4, BZ2WDecompressEof = 5;

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i << 24;
    for (let k = 0; k < 8; k++) c = c & 0x80000000 ? (c << 1) ^ 0x04C11DB7 : c << 1;
    t[i] = c >>> 0;
  }
  return t;
})();

function crcUpdate(crc: number, b: number): number {
  return ((crc << 8) ^ CRC_TABLE[((crc >>> 24) ^ b) & 0xFF]) >>> 0;
}

// ---------------------------------------------------------------- decompression

class EofError extends Error {}
class BadError extends Error {}
class LimitError extends Error {}

class BitReader {
  private pos = 0;
  private buf = 0;
  private live = 0;
  private readonly data: Uint8Array;
  constructor(data: Uint8Array) { this.data = data; }
  /** n <= 24 */
  bits(n: number): number {
    if (n > 24) return ((this.bits(16) * 65536) + this.bits(n - 16)) >>> 0;
    while (this.live < n) {
      if (this.pos >= this.data.length) throw new EofError();
      this.buf = ((this.buf << 8) | this.data[this.pos++]) >>> 0;
      this.live += 8;
    }
    const v = (this.buf >>> (this.live - n)) & ((1 << n) - 1);
    this.live -= n;
    this.buf &= (1 << this.live) - 1;
    return v;
  }
  bit(): number { return this.bits(1); }
}

class Output {
  data: Uint8Array;
  len = 0;
  private readonly maxSize: number;
  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.data = new Uint8Array(Math.min(maxSize || 0x100000, 0x100000));
  }
  push(b: number): void {
    if (this.len === this.data.length) {
      let n = this.data.length * 2;
      if (this.maxSize && n > this.maxSize) n = this.maxSize;
      if (n === this.data.length) throw new LimitError();
      const d = new Uint8Array(n);
      d.set(this.data);
      this.data = d;
    }
    this.data[this.len++] = b;
  }
}

function decodeBlock(br: BitReader, blockSize100k: number, out: Output): number {
  const blockCRC = br.bits(32);
  if (br.bit()) throw new BadError('randomised blocks are not supported');
  const origPtr = br.bits(24);
  // symbol map
  const inUse16 = br.bits(16);
  const seqToUnseq: number[] = [];
  for (let i = 0; i < 16; i++) {
    if (inUse16 & (0x8000 >>> i)) {
      const m = br.bits(16);
      for (let j = 0; j < 16; j++) if (m & (0x8000 >>> j)) seqToUnseq.push(i * 16 + j);
    }
  }
  if (seqToUnseq.length === 0) throw new BadError();
  const alphaSize = seqToUnseq.length + 2;
  const nGroups = br.bits(3);
  if (nGroups < 2 || nGroups > 6) throw new BadError();
  const nSelectors = br.bits(15);
  if (nSelectors < 1) throw new BadError();
  const selectorMtf = new Uint8Array(nSelectors);
  for (let i = 0; i < nSelectors; i++) {
    let j = 0;
    while (br.bit()) { j++; if (j >= nGroups) throw new BadError(); }
    selectorMtf[i] = j;
  }
  const pos = [0, 1, 2, 3, 4, 5].slice(0, nGroups);
  const selectors = new Uint8Array(nSelectors);
  for (let i = 0; i < nSelectors; i++) {
    let v = selectorMtf[i];
    const tmp = pos[v];
    while (v > 0) { pos[v] = pos[v - 1]; v--; }
    pos[0] = tmp;
    selectors[i] = tmp;
  }
  // coding tables
  const limits: Int32Array[] = [], bases: Int32Array[] = [], perms: Int32Array[] = [], minLens: number[] = [];
  for (let t = 0; t < nGroups; t++) {
    const len = new Uint8Array(alphaSize);
    let curr = br.bits(5);
    for (let i = 0; i < alphaSize; i++) {
      for (;;) {
        if (curr < 1 || curr > 20) throw new BadError();
        if (!br.bit()) break;
        if (!br.bit()) curr++; else curr--;
      }
      len[i] = curr;
    }
    let minLen = 32, maxLen = 0;
    for (let i = 0; i < alphaSize; i++) { if (len[i] > maxLen) maxLen = len[i]; if (len[i] < minLen) minLen = len[i]; }
    // BZ2_hbCreateDecodeTables
    const perm = new Int32Array(258), base = new Int32Array(23), limit = new Int32Array(23).fill(0);
    let pp = 0;
    for (let i = minLen; i <= maxLen; i++) for (let j = 0; j < alphaSize; j++) if (len[j] === i) perm[pp++] = j;
    for (let i = 0; i < alphaSize; i++) base[len[i] + 1]++;
    for (let i = 1; i < 23; i++) base[i] += base[i - 1];
    let vec = 0;
    for (let i = minLen; i <= maxLen; i++) {
      vec += (base[i + 1] - base[i]);
      limit[i] = vec - 1;
      vec <<= 1;
    }
    for (let i = minLen + 1; i <= maxLen; i++) base[i] = ((limit[i - 1] + 1) << 1) - base[i];
    for (let i = maxLen + 1; i < 23; i++) limit[i] = 0x7FFFFFFF;
    limits.push(limit); bases.push(base); perms.push(perm); minLens.push(minLen);
  }
  // MTF / RLE2 decoding
  const EOB = alphaSize - 1;
  const nblockMAX = 100000 * blockSize100k;
  const tt = new Uint8Array(nblockMAX);
  const unzftab = new Int32Array(256);
  const mtf = seqToUnseq.slice();
  let nblock = 0;
  let groupNo = -1, groupPos = 0;
  let limit = limits[0], base = bases[0], perm = perms[0], minLen = minLens[0];
  const nextSym = (): number => {
    if (groupPos === 0) {
      groupNo++;
      if (groupNo >= nSelectors) throw new BadError();
      groupPos = 50;
      const s = selectors[groupNo];
      limit = limits[s]; base = bases[s]; perm = perms[s]; minLen = minLens[s];
    }
    groupPos--;
    let zn = minLen;
    let zvec = br.bits(zn);
    for (;;) {
      if (zn > 20) throw new BadError();
      if (zvec <= limit[zn]) break;
      zn++;
      zvec = (zvec << 1) | br.bit();
    }
    const idx = zvec - base[zn];
    if (idx < 0 || idx >= 258) throw new BadError();
    return perm[idx];
  };
  let sym = nextSym();
  for (;;) {
    if (sym === EOB) break;
    if (sym <= 1) {
      let es = 0, N = 1;
      do {
        es += sym === 0 ? N : 2 * N;
        N *= 2;
        if (N >= 2 * 1024 * 1024) throw new BadError();
        sym = nextSym();
      } while (sym <= 1);
      const uc = mtf[0];
      unzftab[uc] += es;
      if (nblock + es > nblockMAX) throw new BadError();
      tt.fill(uc, nblock, nblock + es);
      nblock += es;
    } else {
      if (nblock >= nblockMAX) throw new BadError();
      const nn = sym - 1;
      const uc = mtf[nn];
      for (let k = nn; k > 0; k--) mtf[k] = mtf[k - 1];
      mtf[0] = uc;
      unzftab[uc]++;
      tt[nblock++] = uc;
      sym = nextSym();
    }
  }
  if (origPtr >= nblock && nblock > 0) throw new BadError();
  if (nblock === 0) throw new BadError();
  // inverse BWT
  const cftab = new Int32Array(257);
  for (let i = 0; i < 256; i++) cftab[i + 1] = cftab[i] + unzftab[i];
  const T = new Int32Array(nblock);
  for (let i = 0; i < nblock; i++) T[cftab[tt[i]]++] = i;
  // undo RLE1 while computing the CRC
  let crc = 0xFFFFFFFF;
  let p = T[origPtr];
  let last = -1, run = 0;
  for (let k = 0; k < nblock; k++) {
    const b = tt[p];
    p = T[p];
    if (run === 4) {
      for (let r = 0; r < b; r++) { out.push(last); crc = crcUpdate(crc, last); }
      run = 0;
      last = -1;
      continue;
    }
    if (b === last) run++; else { last = b; run = 1; }
    out.push(b);
    crc = crcUpdate(crc, b);
  }
  crc = (~crc) >>> 0;
  if (crc !== blockCRC) throw new BadError('block CRC');
  return crc;
}

/**
 * BZ2WDecompress(dest, srcData, maxSize): returns the status and, when it is BZ2WDecompressOk, the data.
 * maxSize 0 means no limit.
 */
export function BZ2WDecompress(srcData: Uint8Array, maxSize = 0): { status: number; data: Uint8Array } {
  const br = new BitReader(srcData);
  const out = new Output(maxSize);
  try {
    let magic: number;
    try {
      magic = br.bits(24);
    } catch (e) {
      if (e instanceof EofError) return { status: BZ2WDecompressEof, data: new Uint8Array(0) };
      throw e;
    }
    if (magic !== 0x425A68) return { status: BZ2WDecompressType, data: new Uint8Array(0) };
    const level = br.bits(8) - 0x30;
    if (level < 1 || level > 9) return { status: BZ2WDecompressType, data: new Uint8Array(0) };
    let combined = 0;
    for (;;) {
      const hi = br.bits(24), lo = br.bits(24);
      if (hi === 0x314159 && lo === 0x265359) {
        const crc = decodeBlock(br, level, out);
        combined = (((combined << 1) | (combined >>> 31)) ^ crc) >>> 0;
      } else if (hi === 0x177245 && lo === 0x385090) {
        const stored = br.bits(32);
        if (stored !== combined) throw new BadError('stream CRC');
        break;
      } else {
        throw new BadError();
      }
    }
  } catch (e) {
    if (e instanceof EofError) return { status: BZ2WDecompressEof, data: new Uint8Array(0) };
    if (e instanceof BadError) return { status: BZ2WDecompressBad, data: new Uint8Array(0) };
    if (e instanceof LimitError) return { status: BZ2WDecompressLimit, data: new Uint8Array(0) };
    throw e;
  }
  return { status: BZ2WDecompressOk, data: out.data.slice(0, out.len) };
}

// ---------------------------------------------------------------- compression

class BitWriter {
  data = new Uint8Array(1 << 16);
  len = 0;
  private buf = 0;
  private live = 0;
  private byte(b: number): void {
    if (this.len === this.data.length) {
      const d = new Uint8Array(this.data.length * 2);
      d.set(this.data);
      this.data = d;
    }
    this.data[this.len++] = b;
  }
  bits(n: number, v: number): void {
    // n <= 24
    this.buf = (this.buf << n) | (v & ((1 << n) - 1));
    this.live += n;
    while (this.live >= 8) {
      this.live -= 8;
      this.byte((this.buf >>> this.live) & 0xFF);
    }
    this.buf &= (1 << this.live) - 1;
  }
  u32(v: number): void {
    this.bits(16, (v >>> 16) & 0xFFFF);
    this.bits(16, v & 0xFFFF);
  }
  flush(): Uint8Array {
    if (this.live > 0) this.bits(8 - this.live, 0);
    return this.data.slice(0, this.len);
  }
}

/** sorts the cyclic rotations of block[0..n) (prefix doubling); returns the sorted start positions */
function sortRotations(block: Uint8Array, n: number): Int32Array {
  const p = new Int32Array(n), pn = new Int32Array(n);
  let c = new Int32Array(n), cn = new Int32Array(n);
  const cnt = new Int32Array(Math.max(256, n));
  for (let i = 0; i < n; i++) cnt[block[i]]++;
  for (let i = 1; i < 256; i++) cnt[i] += cnt[i - 1];
  for (let i = n - 1; i >= 0; i--) p[--cnt[block[i]]] = i;
  c[p[0]] = 0;
  let classes = 1;
  for (let i = 1; i < n; i++) {
    if (block[p[i]] !== block[p[i - 1]]) classes++;
    c[p[i]] = classes - 1;
  }
  for (let h = 1; h < n && classes < n; h <<= 1) {
    for (let i = 0; i < n; i++) {
      let v = p[i] - h;
      if (v < 0) v += n;
      pn[i] = v;
    }
    cnt.fill(0, 0, classes);
    for (let i = 0; i < n; i++) cnt[c[pn[i]]]++;
    for (let i = 1; i < classes; i++) cnt[i] += cnt[i - 1];
    for (let i = n - 1; i >= 0; i--) p[--cnt[c[pn[i]]]] = pn[i];
    cn[p[0]] = 0;
    classes = 1;
    for (let i = 1; i < n; i++) {
      let a = p[i] + h; if (a >= n) a -= n;
      let b = p[i - 1] + h; if (b >= n) b -= n;
      if (c[p[i]] !== c[p[i - 1]] || c[a] !== c[b]) classes++;
      cn[p[i]] = classes - 1;
    }
    const t = c; c = cn; cn = t;
  }
  return p;
}

/** BZ2_hbMakeCodeLengths: Huffman code lengths limited to maxLen (by flattening the frequencies, as libbzip2) */
function makeCodeLengths(freq: Int32Array, alphaSize: number, maxLen: number): Uint8Array {
  const len = new Uint8Array(alphaSize);
  const weight = new Float64Array(alphaSize);
  for (let i = 0; i < alphaSize; i++) weight[i] = freq[i] === 0 ? 1 : freq[i];
  for (;;) {
    // heap-free O(n^2) Huffman over at most 258 symbols
    const nodesW: number[] = [], parent: number[] = [];
    const active: number[] = [];
    for (let i = 0; i < alphaSize; i++) { nodesW.push(weight[i]); parent.push(-1); active.push(i); }
    while (active.length > 1) {
      active.sort((a, b) => nodesW[a] - nodesW[b] || a - b);
      const a = active.shift()!, b = active.shift()!;
      const id = nodesW.length;
      nodesW.push(nodesW[a] + nodesW[b]);
      parent.push(-1);
      parent[a] = id; parent[b] = id;
      active.push(id);
    }
    let tooLong = false;
    for (let i = 0; i < alphaSize; i++) {
      let d = 0;
      for (let k = i; parent[k] !== -1; k = parent[k]) d++;
      len[i] = Math.max(d, 1);
      if (d > maxLen) tooLong = true;
    }
    if (!tooLong) return len;
    for (let i = 0; i < alphaSize; i++) weight[i] = 1 + Math.floor(weight[i] / 2);
  }
}

/** BZ2_hbAssignCodes */
function assignCodes(len: Uint8Array, alphaSize: number): Int32Array {
  const code = new Int32Array(alphaSize);
  let minLen = 32, maxLen = 0;
  for (let i = 0; i < alphaSize; i++) { if (len[i] > maxLen) maxLen = len[i]; if (len[i] < minLen) minLen = len[i]; }
  let vec = 0;
  for (let n = minLen; n <= maxLen; n++) {
    for (let i = 0; i < alphaSize; i++) if (len[i] === n) code[i] = vec++;
    vec <<= 1;
  }
  return code;
}

function compressBlock(bw: BitWriter, block: Uint8Array, nblock: number, blockCRC: number): void {
  const ptr = sortRotations(block, nblock);
  let origPtr = -1;
  const last = new Uint8Array(nblock);
  for (let i = 0; i < nblock; i++) {
    const j = ptr[i];
    if (j === 0) origPtr = i;
    last[i] = block[j === 0 ? nblock - 1 : j - 1];
  }
  // symbol map
  const inUse = new Uint8Array(256);
  for (let i = 0; i < nblock; i++) inUse[block[i]] = 1;
  const unseqToSeq = new Int32Array(256);
  let nInUse = 0;
  for (let i = 0; i < 256; i++) if (inUse[i]) unseqToSeq[i] = nInUse++;
  const EOB = nInUse + 1;
  const alphaSize = nInUse + 2;
  // MTF + RLE2 (generateMTFValues)
  const mtfv = new Uint16Array(nblock + 1);
  let nMTF = 0;
  const mtfFreq = new Int32Array(258);
  const yy = new Uint8Array(256);
  for (let i = 0; i < nInUse; i++) yy[i] = i;
  let zPend = 0;
  const flushZeros = (): void => {
    zPend--;
    for (;;) {
      if (zPend & 1) { mtfv[nMTF++] = 1; mtfFreq[1]++; } else { mtfv[nMTF++] = 0; mtfFreq[0]++; }
      if (zPend < 2) break;
      zPend = (zPend - 2) >> 1;
    }
    zPend = 0;
  };
  for (let i = 0; i < nblock; i++) {
    const llI = unseqToSeq[last[i]];
    if (yy[0] === llI) {
      zPend++;
    } else {
      if (zPend > 0) flushZeros();
      let j = 1;
      let rtmp = yy[1];
      yy[1] = yy[0];
      while (llI !== rtmp) {
        j++;
        const rtmp2 = rtmp;
        rtmp = yy[j];
        yy[j] = rtmp2;
      }
      yy[0] = rtmp;
      mtfv[nMTF++] = j + 1;
      mtfFreq[j + 1]++;
    }
  }
  if (zPend > 0) flushZeros();
  mtfv[nMTF++] = EOB;
  mtfFreq[EOB]++;

  // choose the tables (sendMTFValues)
  const nGroups = nMTF < 200 ? 2 : nMTF < 600 ? 3 : nMTF < 1200 ? 4 : nMTF < 2400 ? 5 : 6;
  const lens: Uint8Array[] = [];
  for (let t = 0; t < nGroups; t++) lens.push(new Uint8Array(alphaSize).fill(15));
  {
    let nPart = nGroups, remF = nMTF, gs = 0;
    while (nPart > 0) {
      const tFreq = remF / nPart;
      let ge = gs - 1, aFreq = 0;
      while (aFreq < tFreq && ge < alphaSize - 1) { ge++; aFreq += mtfFreq[ge]; }
      if (ge > gs && nPart !== nGroups && nPart !== 1 && ((nGroups - nPart) % 2 === 1)) { aFreq -= mtfFreq[ge]; ge--; }
      for (let v = 0; v < alphaSize; v++) lens[nPart - 1][v] = v >= gs && v <= ge ? 0 : 15;
      nPart--; gs = ge + 1; remF -= aFreq;
    }
  }
  const nSelectors = Math.ceil(nMTF / 50);
  const selector = new Uint8Array(nSelectors);
  for (let iter = 0; iter < 4; iter++) {
    const rfreq: Int32Array[] = [];
    for (let t = 0; t < nGroups; t++) rfreq.push(new Int32Array(alphaSize));
    let sel = 0;
    for (let gs = 0; gs < nMTF; gs += 50) {
      const ge = Math.min(gs + 50, nMTF);
      let bt = 0, bc = Infinity;
      for (let t = 0; t < nGroups; t++) {
        let cost = 0;
        const l = lens[t];
        for (let i = gs; i < ge; i++) cost += l[mtfv[i]];
        if (cost < bc) { bc = cost; bt = t; }
      }
      selector[sel++] = bt;
      for (let i = gs; i < ge; i++) rfreq[bt][mtfv[i]]++;
    }
    for (let t = 0; t < nGroups; t++) lens[t] = makeCodeLengths(rfreq[t], alphaSize, 17);
  }
  const codes = lens.map((l) => assignCodes(l, alphaSize));

  // write the block
  bw.bits(24, 0x314159); bw.bits(24, 0x265359);
  bw.u32(blockCRC);
  bw.bits(1, 0);
  bw.bits(24, origPtr);
  const inUse16 = new Uint8Array(16);
  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if (inUse[i * 16 + j]) inUse16[i] = 1;
  for (let i = 0; i < 16; i++) bw.bits(1, inUse16[i]);
  for (let i = 0; i < 16; i++) if (inUse16[i]) for (let j = 0; j < 16; j++) bw.bits(1, inUse[i * 16 + j]);
  bw.bits(3, nGroups);
  bw.bits(15, nSelectors);
  const pos = [0, 1, 2, 3, 4, 5].slice(0, nGroups);
  for (let i = 0; i < nSelectors; i++) {
    const v = selector[i];
    let j = 0;
    while (pos[j] !== v) j++;
    for (let k = j; k > 0; k--) pos[k] = pos[k - 1];
    pos[0] = v;
    for (let k = 0; k < j; k++) bw.bits(1, 1);
    bw.bits(1, 0);
  }
  for (let t = 0; t < nGroups; t++) {
    let curr = lens[t][0];
    bw.bits(5, curr);
    for (let i = 0; i < alphaSize; i++) {
      while (curr < lens[t][i]) { bw.bits(2, 2); curr++; }
      while (curr > lens[t][i]) { bw.bits(2, 3); curr--; }
      bw.bits(1, 0);
    }
  }
  let sel = 0;
  for (let gs = 0; gs < nMTF; gs += 50) {
    const ge = Math.min(gs + 50, nMTF);
    const t = selector[sel++];
    const l = lens[t], c = codes[t];
    for (let i = gs; i < ge; i++) bw.bits(l[mtfv[i]], c[mtfv[i]]);
  }
}

/**
 * BZ2WCompress(dest, srcData, maxSize): returns the status and the compressed stream (block size 900k, as
 * BZ2_bzCompressInit(&stream, 9, 0, 0)). maxSize 0 means no limit.
 */
export function BZ2WCompress(srcData: Uint8Array, maxSize = 0): { status: number; data: Uint8Array } {
  const blockSize100k = 9;
  const nblockMAX = 100000 * blockSize100k - 19;
  const bw = new BitWriter();
  bw.bits(8, 0x42); bw.bits(8, 0x5A); bw.bits(8, 0x68); bw.bits(8, 0x30 + blockSize100k);
  let combined = 0;
  const block = new Uint8Array(nblockMAX + 2);
  let at = 0;
  const n = srcData.length;
  while (at < n) {
    // ADD_CHAR_TO_BLOCK with the initial run-length encoding (runs of 4..255)
    let nblock = 0;
    let crc = 0xFFFFFFFF;
    while (at < n && nblock < nblockMAX - 4) {
      const ch = srcData[at];
      let run = 1;
      while (run < 255 && at + run < n && srcData[at + run] === ch) run++;
      for (let k = 0; k < run; k++) crc = crcUpdate(crc, ch);
      at += run;
      if (run < 4) {
        for (let k = 0; k < run; k++) block[nblock++] = ch;
      } else {
        block[nblock++] = ch; block[nblock++] = ch; block[nblock++] = ch; block[nblock++] = ch;
        block[nblock++] = run - 4;
      }
    }
    crc = (~crc) >>> 0;
    combined = (((combined << 1) | (combined >>> 31)) ^ crc) >>> 0;
    compressBlock(bw, block, nblock, crc);
  }
  bw.bits(24, 0x177245); bw.bits(24, 0x385090);
  bw.u32(combined);
  const data = bw.flush();
  if (maxSize && data.length > maxSize) return { status: BZ2WCompressLimit, data: new Uint8Array(0) };
  return { status: BZ2WCompressOk, data };
}
