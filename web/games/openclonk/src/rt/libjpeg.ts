// OpenClonk in the browser: the libjpeg functions of the original's JPEG loader (graphics/C4SurfaceLoaders.cpp,
// C4Surface::ReadJPEG: the material textures, the sky's clouds, the loader screens), for the translated code
// (re/openclonk/tools/jpeg.txt lists them, each as jpeg$<name>).
//
// The decoder follows the path libjpeg(-turbo) takes for ReadJPEG's settings (the defaults plus out_color_space =
// JCS_RGB): baseline and progressive Huffman decoding, the "islow" integer IDCT (jidctint.c, which libjpeg-turbo's SIMD
// versions reproduce bit for bit), "fancy" upsampling of subsampled chroma (jdsample.c: h2v1, h2v2, h1v2 with their
// rounding biases, the image's first and last rows repeated as context) and YCbCr to RGB with jdcolor.c's fixed-point
// tables. The original's content has 3-component JPEGs with 1x1, 2x2 (h2v2) and 1x2 (h1v2) luma sampling, baseline and
// progressive. Progressive images are decoded after all their scans (jpeg_start_decompress reads the whole file in
// non-buffered mode), so libjpeg's block smoothing of incomplete coefficients does not apply.
import { Ptr } from './ptr.ts';

const JPEG_HEADER_OK = 1;

// ---- the decoder

interface Component {
  id: number; h: number; v: number; tq: number;
  td: number; ta: number;
  bw: number; bh: number;          // blocks per line and column (padded to whole MCUs)
  coefs: Int32Array;               // 64 per block
  pred: number;
  dw: number; dh: number;          // downsampled size (ceil(image * h / hmax))
}
interface Huffman { lookup: Map<number, number>[]; maxLen: number }

class Decoder {
  d: Uint8Array;
  pos = 0;
  width = 0; height = 0; progressive = false;
  comps: Component[] = [];
  qt: Int32Array[] = [];
  dc: Huffman[] = []; ac: Huffman[] = [];
  restart = 0;
  hmax = 1; vmax = 1; mcusX = 0; mcusY = 0;
  eobrun = 0;
  // bit reader
  bits = 0; nbits = 0; marker = 0;

  constructor(d: Uint8Array) { this.d = d; }

  u16(): number { const v = (this.d[this.pos] << 8) | this.d[this.pos + 1]; this.pos += 2; return v; }

  /** the markers up to the first scan (jpeg_read_header) */
  header(): void {
    if (this.d[0] !== 0xff || this.d[1] !== 0xd8) throw new Error('not a JPEG');
    this.pos = 2;
    for (;;) {
      const m = this.nextMarker();
      if (m === 0xda) { this.pos -= 2; return; }
      this.segment(m);
    }
  }
  nextMarker(): number {
    while (this.pos < this.d.length && this.d[this.pos] !== 0xff) this.pos++;
    while (this.pos < this.d.length && this.d[this.pos] === 0xff) this.pos++;
    if (this.pos >= this.d.length) return 0xd9;
    return this.d[this.pos++];
  }
  segment(m: number): void {
    const len = this.u16();
    const end = this.pos + len - 2;
    if (m === 0xdb) {
      while (this.pos < end) {
        const pq = this.d[this.pos] >> 4, tq = this.d[this.pos] & 15;
        this.pos++;
        const t = new Int32Array(64);
        for (let i = 0; i < 64; i++) t[ZIGZAG[i]] = pq ? this.u16() : this.d[this.pos++];
        this.qt[tq] = t;
      }
    } else if (m === 0xc4) {
      while (this.pos < end) {
        const tc = this.d[this.pos] >> 4, th = this.d[this.pos] & 15;
        this.pos++;
        const counts = this.d.subarray(this.pos, this.pos + 16);
        this.pos += 16;
        const lookup: Map<number, number>[] = [];
        let code = 0, k = 0, maxLen = 0;
        for (let l = 1; l <= 16; l++) {
          const map = new Map<number, number>();
          for (let i = 0; i < counts[l - 1]; i++) { map.set(code++, this.d[this.pos + k++]); maxLen = l; }
          lookup[l] = map;
          code <<= 1;
        }
        this.pos += k;
        (tc ? this.ac : this.dc)[th] = { lookup, maxLen };
      }
    } else if (m === 0xc0 || m === 0xc1 || m === 0xc2) {
      this.progressive = m === 0xc2;
      this.pos++;
      this.height = this.u16();
      this.width = this.u16();
      const n = this.d[this.pos++];
      for (let i = 0; i < n; i++) {
        const id = this.d[this.pos], h = this.d[this.pos + 1] >> 4, v = this.d[this.pos + 1] & 15, tq = this.d[this.pos + 2];
        this.pos += 3;
        this.comps.push({ id, h, v, tq, td: 0, ta: 0, bw: 0, bh: 0, coefs: new Int32Array(0), pred: 0, dw: 0, dh: 0 });
      }
      this.hmax = Math.max(...this.comps.map((c) => c.h));
      this.vmax = Math.max(...this.comps.map((c) => c.v));
      this.mcusX = Math.ceil(this.width / (8 * this.hmax));
      this.mcusY = Math.ceil(this.height / (8 * this.vmax));
      for (const c of this.comps) {
        c.bw = this.mcusX * c.h;
        c.bh = this.mcusY * c.v;
        c.coefs = new Int32Array(c.bw * c.bh * 64);
        c.dw = Math.ceil((this.width * c.h) / this.hmax);
        c.dh = Math.ceil((this.height * c.v) / this.vmax);
      }
    } else if (m === 0xdd) {
      this.restart = this.u16();
    } else if (m >= 0xc3 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      throw new Error('unsupported JPEG process (lossless or arithmetic coding)');
    }
    this.pos = end;
  }

  /** every scan up to EOI (jpeg_start_decompress in non-buffered mode) */
  scans(): void {
    for (;;) {
      const m = this.nextMarker();
      if (m === 0xd9) return;
      if (m === 0xda) this.scan();
      else if (m >= 0xd0 && m <= 0xd7) continue;
      else this.segment(m);
    }
  }

  bit(): number {
    if (this.nbits === 0) {
      if (this.marker) { this.bits = 0; this.nbits = 8; }
      else {
        let b = this.d[this.pos];
        if (b === 0xff) {
          const n = this.d[this.pos + 1];
          if (n === 0) this.pos += 2;
          else { this.marker = n; b = 0; }       // a marker: zeros from here, as libjpeg pads
        } else this.pos++;
        if (this.pos > this.d.length) b = 0;
        this.bits = b; this.nbits = 8;
      }
    }
    this.nbits--;
    return (this.bits >> this.nbits) & 1;
  }
  receive(n: number): number { let v = 0; for (let i = 0; i < n; i++) v = (v << 1) | this.bit(); return v; }
  extend(v: number, n: number): number { return n && v < 1 << (n - 1) ? v - (1 << n) + 1 : v; }
  decodeHuff(h: Huffman): number {
    let code = 0;
    for (let l = 1; l <= 16; l++) {
      code = (code << 1) | this.bit();
      const v = h.lookup[l].get(code);
      if (v !== undefined) return v;
    }
    return 0;      // corrupt data: libjpeg warns and uses 0
  }
  resetBits(): void { this.bits = 0; this.nbits = 0; this.marker = 0; }

  scan(): void {
    const len = this.u16();
    const end = this.pos + len - 2;
    const n = this.d[this.pos++];
    const comps: Component[] = [];
    for (let i = 0; i < n; i++) {
      const c = this.comps.find((x) => x.id === this.d[this.pos])!;
      c.td = this.d[this.pos + 1] >> 4; c.ta = this.d[this.pos + 1] & 15;
      comps.push(c);
      this.pos += 2;
    }
    const ss = this.d[this.pos], se = this.d[this.pos + 1], ah = this.d[this.pos + 2] >> 4, al = this.d[this.pos + 2] & 15;
    this.pos = end;
    this.resetBits();
    for (const c of this.comps) c.pred = 0;
    this.eobrun = 0;
    const decode = (c: Component, off: number) => {
      if (!this.progressive) this.baseline(c, off);
      else if (ss === 0) {
        if (ah === 0) { const t = this.decodeHuff(this.dc[c.td]); const diff = t ? this.extend(this.receive(t), t) : 0; c.pred += diff; c.coefs[off] = c.pred * (1 << al); }
        else if (this.bit()) c.coefs[off] |= 1 << al;
      } else if (ah === 0) this.acFirst(c, off, ss, se, al);
      else this.acRefine(c, off, ss, se, al);
    };
    let mcu = 0;
    const restartCheck = () => {
      if (this.restart && mcu > 0 && mcu % this.restart === 0) {
        // the RSTn marker: byte-align, find it, reset the predictions
        this.nbits = 0;
        if (this.marker) { this.marker = 0; this.pos += 2; }
        else {
          while (this.pos < this.d.length && !(this.d[this.pos] === 0xff && this.d[this.pos + 1] >= 0xd0 && this.d[this.pos + 1] <= 0xd7)) this.pos++;
          this.pos += 2;
        }
        this.resetBits();
        for (const c of this.comps) c.pred = 0;
        this.eobrun = 0;
      }
    };
    if (comps.length === 1) {
      // a non-interleaved scan: the component's blocks in raster order, only those inside its own size
      const c = comps[0];
      const w = Math.ceil(Math.ceil((this.width * c.h) / this.hmax) / 8), h = Math.ceil(Math.ceil((this.height * c.v) / this.vmax) / 8);
      for (let by = 0; by < h; by++) {
        for (let bx = 0; bx < w; bx++) {
          restartCheck();
          decode(c, (by * c.bw + bx) * 64);
          mcu++;
        }
      }
    } else {
      for (let my = 0; my < this.mcusY; my++) {
        for (let mx = 0; mx < this.mcusX; mx++) {
          restartCheck();
          for (const c of comps) {
            for (let v = 0; v < c.v; v++) for (let h = 0; h < c.h; h++) decode(c, ((my * c.v + v) * c.bw + mx * c.h + h) * 64);
          }
          mcu++;
        }
      }
    }
    // the scan's end: past the entropy-coded data to the next marker
    if (this.marker) { this.pos -= 0; }
    this.resetBits();
  }

  baseline(c: Component, off: number): void {
    const t = this.decodeHuff(this.dc[c.td]);
    c.pred += t ? this.extend(this.receive(t), t) : 0;
    c.coefs[off] = c.pred;
    for (let k = 1; k < 64;) {
      const rs = this.decodeHuff(this.ac[c.ta]);
      const r = rs >> 4, s = rs & 15;
      if (s === 0) { if (r !== 15) break; k += 16; continue; }
      k += r;
      if (k > 63) break;
      c.coefs[off + ZIGZAG[k]] = this.extend(this.receive(s), s);
      k++;
    }
  }
  acFirst(c: Component, off: number, ss: number, se: number, al: number): void {
    if (this.eobrun > 0) { this.eobrun--; return; }
    for (let k = ss; k <= se;) {
      const rs = this.decodeHuff(this.ac[c.ta]);
      const r = rs >> 4, s = rs & 15;
      if (s === 0) {
        if (r < 15) { this.eobrun = (1 << r) - 1; if (r) this.eobrun += this.receive(r); break; }
        k += 16;
        continue;
      }
      k += r;
      if (k > 63) break;
      c.coefs[off + ZIGZAG[k]] = this.extend(this.receive(s), s) * (1 << al);
      k++;
    }
  }
  /** jdphuff.c decode_mcu_AC_refine */
  acRefine(c: Component, off: number, ss: number, se: number, al: number): void {
    const p1 = 1 << al, m1 = -1 << al;
    let k = ss;
    if (this.eobrun === 0) {
      for (; k <= se;) {
        const rs = this.decodeHuff(this.ac[c.ta]);
        let r = rs >> 4;
        const s = rs & 15;
        let value = 0;
        if (s) { value = this.bit() ? p1 : m1; }
        else if (r !== 15) { this.eobrun = 1 << r; if (r) this.eobrun += this.receive(r); break; }
        while (k <= se) {
          const z = off + ZIGZAG[k];
          if (c.coefs[z] !== 0) {
            if (this.bit() && (c.coefs[z] & p1) === 0) c.coefs[z] += c.coefs[z] >= 0 ? p1 : m1;
          } else {
            if (r === 0) { if (value) c.coefs[z] = value; k++; break; }
            r--;
          }
          k++;
        }
      }
    }
    if (this.eobrun > 0) {
      for (; k <= se; k++) {
        const z = off + ZIGZAG[k];
        if (c.coefs[z] !== 0 && this.bit() && (c.coefs[z] & p1) === 0) c.coefs[z] += c.coefs[z] >= 0 ? p1 : m1;
      }
      this.eobrun--;
    }
  }

  /** the image as RGB rows (the component planes after the IDCT, upsampled and converted) */
  output(): Uint8Array {
    const planes = this.comps.map((c) => {
      const w = c.bw * 8, h = c.bh * 8;
      const out = new Uint8Array(w * h);
      const q = this.qt[c.tq];
      for (let by = 0; by < c.bh; by++) for (let bx = 0; bx < c.bw; bx++) idctIslow(c.coefs, (by * c.bw + bx) * 64, q, out, by * 8 * w + bx * 8, w);
      return { c, w, h, data: out };
    });
    const W = this.width, H = this.height;
    const full = planes.map(({ c, w, data }) => upsample(data, w, c, this.hmax, this.vmax, W, H));
    const rgb = new Uint8Array(W * H * 3);
    if (full.length === 3) {
      const [Y, Cb, Cr] = full;
      for (let i = 0; i < W * H; i++) {
        const y = Y[i], cb = Cb[i], cr = Cr[i];
        rgb[i * 3] = RANGE[y + CR_R[cr] + 256];
        rgb[i * 3 + 1] = RANGE[y + ((CB_G[cb] + CR_G[cr]) >> 16) + 256];
        rgb[i * 3 + 2] = RANGE[y + CB_B[cb] + 256];
      }
    } else {
      for (let i = 0; i < W * H; i++) rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = full[0][i];
    }
    return rgb;
  }
}

const ZIGZAG = new Int32Array([0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7,
  14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55,
  62, 63]);

// jdcolor.c build_ycc_rgb_table (SCALEBITS 16) and the sample range limit (jdmaster.c prepare_range_limit_table)
const FIX = (x: number) => Math.floor(x * 65536 + 0.5);
const CR_R = new Int32Array(256), CB_B = new Int32Array(256), CR_G = new Int32Array(256), CB_G = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  const x = i - 128;
  CR_R[i] = (FIX(1.402) * x + 32768) >> 16;
  CB_B[i] = (FIX(1.772) * x + 32768) >> 16;
  CR_G[i] = -FIX(0.71414) * x;
  CB_G[i] = -FIX(0.34414) * x + 32768;
}
/** range_limit[x] for x in -256..511 (offset 256) */
const RANGE = new Uint8Array(768);
for (let i = 0; i < 768; i++) RANGE[i] = Math.max(0, Math.min(255, i - 256));
/** the IDCT's range limit: idct_limit[x & 1023] */
const IDCT_LIMIT = new Uint8Array(1024);
for (let v = 0; v < 1024; v++) IDCT_LIMIT[v] = v < 128 ? v + 128 : v < 512 ? 255 : v < 896 ? 0 : v - 896;

// jidctint.c jpeg_idct_islow
const CONST_BITS = 13, PASS1_BITS = 2;
const F_0_298 = 2446, F_0_390 = 3196, F_0_541 = 4433, F_0_765 = 6270, F_0_899 = 7373, F_1_175 = 9633, F_1_501 = 12299,
  F_1_847 = 15137, F_1_961 = 16069, F_2_053 = 16819, F_2_562 = 20995, F_3_072 = 25172;
const ws = new Int32Array(64);
const descale = (x: number, n: number) => (x + (1 << (n - 1))) >> n;
function idctIslow(coefs: Int32Array, off: number, q: Int32Array, out: Uint8Array, at: number, stride: number): void {
  for (let col = 0; col < 8; col++) {
    const c = (k: number) => coefs[off + k * 8 + col] * q[k * 8 + col];
    if (coefs[off + 8 + col] === 0 && coefs[off + 16 + col] === 0 && coefs[off + 24 + col] === 0 && coefs[off + 32 + col] === 0 &&
        coefs[off + 40 + col] === 0 && coefs[off + 48 + col] === 0 && coefs[off + 56 + col] === 0) {
      const dc = c(0) * (1 << PASS1_BITS);
      for (let k = 0; k < 8; k++) ws[k * 8 + col] = dc;
      continue;
    }
    let z2 = c(2), z3 = c(6);
    let z1 = (z2 + z3) * F_0_541;
    let tmp2 = z1 + z3 * -F_1_847;
    let tmp3 = z1 + z2 * F_0_765;
    z2 = c(0); z3 = c(4);
    let tmp0 = (z2 + z3) * (1 << CONST_BITS);
    let tmp1 = (z2 - z3) * (1 << CONST_BITS);
    const tmp10 = tmp0 + tmp3, tmp13 = tmp0 - tmp3, tmp11 = tmp1 + tmp2, tmp12 = tmp1 - tmp2;
    tmp0 = c(7); tmp1 = c(5); tmp2 = c(3); tmp3 = c(1);
    z1 = tmp0 + tmp3; z2 = tmp1 + tmp2; z3 = tmp0 + tmp2; let z4 = tmp1 + tmp3;
    const z5 = (z3 + z4) * F_1_175;
    tmp0 *= F_0_298; tmp1 *= F_2_053; tmp2 *= F_3_072; tmp3 *= F_1_501;
    z1 *= -F_0_899; z2 *= -F_2_562; z3 *= -F_1_961; z4 *= -F_0_390;
    z3 += z5; z4 += z5;
    tmp0 += z1 + z3; tmp1 += z2 + z4; tmp2 += z2 + z3; tmp3 += z1 + z4;
    const n = CONST_BITS - PASS1_BITS;
    ws[col] = descale(tmp10 + tmp3, n); ws[56 + col] = descale(tmp10 - tmp3, n);
    ws[8 + col] = descale(tmp11 + tmp2, n); ws[48 + col] = descale(tmp11 - tmp2, n);
    ws[16 + col] = descale(tmp12 + tmp1, n); ws[40 + col] = descale(tmp12 - tmp1, n);
    ws[24 + col] = descale(tmp13 + tmp0, n); ws[32 + col] = descale(tmp13 - tmp0, n);
  }
  const n = CONST_BITS + PASS1_BITS + 3;
  for (let row = 0; row < 8; row++) {
    const w = row * 8, o = at + row * stride;
    if (ws[w + 1] === 0 && ws[w + 2] === 0 && ws[w + 3] === 0 && ws[w + 4] === 0 && ws[w + 5] === 0 && ws[w + 6] === 0 && ws[w + 7] === 0) {
      const v = IDCT_LIMIT[descale(ws[w], PASS1_BITS + 3) & 1023];
      for (let k = 0; k < 8; k++) out[o + k] = v;
      continue;
    }
    let z2 = ws[w + 2], z3 = ws[w + 6];
    let z1 = (z2 + z3) * F_0_541;
    let tmp2 = z1 + z3 * -F_1_847;
    let tmp3 = z1 + z2 * F_0_765;
    let tmp0 = (ws[w] + ws[w + 4]) * (1 << CONST_BITS);
    let tmp1 = (ws[w] - ws[w + 4]) * (1 << CONST_BITS);
    const tmp10 = tmp0 + tmp3, tmp13 = tmp0 - tmp3, tmp11 = tmp1 + tmp2, tmp12 = tmp1 - tmp2;
    tmp0 = ws[w + 7]; tmp1 = ws[w + 5]; tmp2 = ws[w + 3]; tmp3 = ws[w + 1];
    z1 = tmp0 + tmp3; z2 = tmp1 + tmp2; z3 = tmp0 + tmp2; let z4 = tmp1 + tmp3;
    const z5 = (z3 + z4) * F_1_175;
    tmp0 *= F_0_298; tmp1 *= F_2_053; tmp2 *= F_3_072; tmp3 *= F_1_501;
    z1 *= -F_0_899; z2 *= -F_2_562; z3 *= -F_1_961; z4 *= -F_0_390;
    z3 += z5; z4 += z5;
    tmp0 += z1 + z3; tmp1 += z2 + z4; tmp2 += z2 + z3; tmp3 += z1 + z4;
    out[o] = IDCT_LIMIT[descale(tmp10 + tmp3, n) & 1023]; out[o + 7] = IDCT_LIMIT[descale(tmp10 - tmp3, n) & 1023];
    out[o + 1] = IDCT_LIMIT[descale(tmp11 + tmp2, n) & 1023]; out[o + 6] = IDCT_LIMIT[descale(tmp11 - tmp2, n) & 1023];
    out[o + 2] = IDCT_LIMIT[descale(tmp12 + tmp1, n) & 1023]; out[o + 5] = IDCT_LIMIT[descale(tmp12 - tmp1, n) & 1023];
    out[o + 3] = IDCT_LIMIT[descale(tmp13 + tmp0, n) & 1023]; out[o + 4] = IDCT_LIMIT[descale(tmp13 - tmp0, n) & 1023];
  }
}

/** a component plane at the image's size (jdsample.c with do_fancy_upsampling; jdmainct.c's context rows) */
function upsample(data: Uint8Array, stride: number, c: Component, hmax: number, vmax: number, W: number, H: number): Uint8Array {
  const out = new Uint8Array(W * H);
  const hf = hmax / c.h, vf = vmax / c.v;
  const dw = c.dw, dh = c.dh;
  // the row above the first and below the last: the image's own first and last rows (jdmainct.c)
  const row = (y: number) => Math.max(0, Math.min(dh - 1, y)) * stride;
  if (hf === 1 && vf === 1) {
    for (let y = 0; y < H; y++) out.set(data.subarray(y * stride, y * stride + W), y * W);
    return out;
  }
  const line = new Uint8Array(dw * hf + 2);
  for (let y = 0; y < H; y++) {
    if (hf === 2 && vf === 1 && dw > 2) {
      // h2v1_fancy_upsample
      const r = row(y);
      line[0] = data[r]; line[1] = (data[r] * 3 + data[r + 1] + 2) >> 2;
      for (let x = 1; x < dw - 1; x++) {
        const v = data[r + x] * 3;
        line[2 * x] = (v + data[r + x - 1] + 1) >> 2;
        line[2 * x + 1] = (v + data[r + x + 1] + 2) >> 2;
      }
      const v = data[r + dw - 1];
      line[2 * dw - 2] = (v * 3 + data[r + dw - 2] + 1) >> 2;
      line[2 * dw - 1] = v;
    } else if (hf === 2 && vf === 2 && dw > 2) {
      // h2v2_fancy_upsample: output row 2i uses input rows i and i-1, row 2i+1 rows i and i+1
      const i = y >> 1, r0 = row(i), r1 = row(y & 1 ? i + 1 : i - 1);
      const sum = (x: number) => data[r0 + x] * 3 + data[r1 + x];
      let last = sum(0), cur = sum(0), next = sum(1);
      line[0] = (cur * 4 + 8) >> 4;
      line[1] = (cur * 3 + next + 7) >> 4;
      last = cur; cur = next;
      for (let x = 1; x < dw - 1; x++) {
        next = sum(x + 1);
        line[2 * x] = (cur * 3 + last + 8) >> 4;
        line[2 * x + 1] = (cur * 3 + next + 7) >> 4;
        last = cur; cur = next;
      }
      line[2 * dw - 2] = (cur * 3 + last + 8) >> 4;
      line[2 * dw - 1] = (cur * 4 + 7) >> 4;
    } else if (hf === 1 && vf === 2) {
      // h1v2_fancy_upsample (libjpeg-turbo)
      const i = y >> 1, r0 = row(i), r1 = row(y & 1 ? i + 1 : i - 1), bias = y & 1 ? 2 : 1;
      for (let x = 0; x < dw; x++) line[x] = (data[r0 + x] * 3 + data[r1 + x] + bias) >> 2;
    } else {
      // the plain replicating upsampler (int_upsample), for other factors
      const r = row(Math.floor(y / vf));
      for (let x = 0; x < W; x++) line[x] = data[r + Math.floor(x / hf)];
    }
    out.set(line.subarray(0, W), y * W);
  }
  return out;
}

// ---- the libjpeg API as C4Surface::ReadJPEG calls it

interface ErrorMgr { error_exit?: unknown; output_message?: unknown; format_message?: unknown; [k: string]: unknown }
interface Source { next_input_byte: Ptr; bytes_in_buffer: number }
interface Cinfo {
  err: ErrorMgr; src: Source; mem: { alloc_sarray: (c: Cinfo, pool: number, w: number, h: number) => Ptr };
  out_color_space: number; output_width: number; output_height: number; output_components: number; output_scanline: number;
  image_width: number; image_height: number; num_components: number;
  $dec?: Decoder; $rgb?: Uint8Array;
}

export function jpeg$jpeg_std_error(err: ErrorMgr): ErrorMgr {
  err.format_message = (_c: unknown, buf: Ptr) => {
    const t = 'JPEG decoding failed';
    for (let i = 0; i < t.length; i++) buf.a[buf.o + i] = t.charCodeAt(i);
    buf.a[buf.o + t.length] = 0;
  };
  return err;
}
export function jpeg$jpeg_CreateDecompress(cinfo: Cinfo, _version: number, _size: number): void {
  cinfo.mem = {
    // (*cinfo.mem->alloc_sarray)(cinfo, JPOOL_IMAGE, samplesperrow, numrows): numrows rows of samples
    alloc_sarray: (_c, _pool, w, h) => new Ptr(Array.from({ length: h }, () => new Ptr(new Uint8Array(w), 0)), 0),
  };
  cinfo.output_scanline = 0;
}
export function jpeg$jpeg_destroy_decompress(cinfo: Cinfo): void {
  cinfo.$dec = undefined;
  cinfo.$rgb = undefined;
}
function fail(cinfo: Cinfo): never {
  const exit = cinfo.err?.error_exit as ((c: Cinfo) => never) | undefined;
  if (exit) exit(cinfo);
  throw new Error('libjpeg: error');
}
/** reads the data the source manager holds (ReadJPEG gives the whole file at once) */
export function jpeg$jpeg_read_header(cinfo: Cinfo, _require: boolean): number {
  const p = cinfo.src.next_input_byte;
  const n = Number(cinfo.src.bytes_in_buffer);
  const bytes = new Uint8Array(n);
  for (let i = 0; i < n; i++) bytes[i] = p.a[p.o + i] & 0xff;
  const dec = new Decoder(bytes);
  try { dec.header(); } catch { fail(cinfo); }
  cinfo.$dec = dec;
  cinfo.image_width = dec.width;
  cinfo.image_height = dec.height;
  cinfo.num_components = dec.comps.length;
  cinfo.out_color_space = dec.comps.length === 3 ? 3 : 1;       // JCS_YCbCr, JCS_GRAYSCALE
  return JPEG_HEADER_OK;
}
export function jpeg$jpeg_start_decompress(cinfo: Cinfo): boolean {
  const dec = cinfo.$dec!;
  try {
    dec.scans();
    cinfo.$rgb = dec.output();
  } catch { fail(cinfo); }
  cinfo.output_width = dec.width;
  cinfo.output_height = dec.height;
  cinfo.output_components = 3;          // ReadJPEG asks for JCS_RGB
  cinfo.output_scanline = 0;
  return true;
}
export function jpeg$jpeg_read_scanlines(cinfo: Cinfo, rows: Ptr, max: number): number {
  let n = 0;
  const w = cinfo.output_width * 3;
  while (n < max && cinfo.output_scanline < cinfo.output_height) {
    const row: Ptr = rows.a[rows.o + n];
    const src = cinfo.$rgb!.subarray(cinfo.output_scanline * w, (cinfo.output_scanline + 1) * w);
    if (row.a instanceof Uint8Array) row.a.set(src, row.o);
    else for (let i = 0; i < w; i++) row.a[row.o + i] = src[i];
    cinfo.output_scanline++;
    n++;
  }
  return n;
}
export function jpeg$jpeg_finish_decompress(_cinfo: Cinfo): boolean { return true; }
/** the source manager's resync_to_restart (only called on corrupt data, which the decoder does not ask for) */
export function jpeg$jpeg_resync_to_restart(_cinfo: Cinfo, _desired: number): boolean { return true; }
