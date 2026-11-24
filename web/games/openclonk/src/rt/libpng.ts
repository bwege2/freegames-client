// OpenClonk in the browser: the libpng functions of the original's PNG file class (graphics/StdPNG.cpp, CPNGFile), for
// the translated code (re/openclonk/tools/png.txt lists them, each as png$<name>).
//
// Reading follows libpng's sequential reader as CPNGFile::DoLoad drives it: png_read_info reads the file through the
// original's read callback (CPNGReadFn), the transforms it asks for (expand palettes, low-bit gray and tRNS to 8 bits
// and an alpha channel, strip 16 bits, gray to RGB, BGR order) are applied as libpng applies them, and png_read_image
// fills the original's row pointers. Every image of the original's content is 8 bits per channel (RGB, RGBA, gray with
// alpha, palette, one 1-bit palette image; 26 interlaced), so these are the paths libpng takes for them; 16-bit files
// are reduced by dropping the low byte, as png_set_strip_16 does.
// Writing (CPNGFile::Save: screenshots) collects the rows and writes a PNG through the original's FILE (rt/fs.ts);
// libpng's filter choice and compression level are not reproduced (the pixels are the same).
import { unzlibSync, zlibSync } from 'fflate';
import { Ptr } from './ptr.ts';
import { c$fwrite } from './fs.ts';
import { c$longjmp } from './libc.ts';

const PNG_COLOR_TYPE_GRAY = 0, PNG_COLOR_TYPE_RGB = 2, PNG_COLOR_TYPE_PALETTE = 3, PNG_COLOR_TYPE_GRAY_ALPHA = 4, PNG_COLOR_TYPE_RGB_ALPHA = 6;
const PNG_INFO_tRNS = 0x0010;

interface PngStruct {
  write: boolean;
  ioPtr: unknown;
  readFn: ((png: PngStruct, data: Ptr, length: number) => void) | null;
  file: unknown;
  // the file's header and chunks
  width: number; height: number; depth: number; color: number; interlace: number;
  palette: Uint8Array | null; trns: Uint8Array | null; idat: Uint8Array[];
  // the transforms asked for
  expand: boolean; strip16: boolean; packing: boolean; grayToRgb: boolean; bgr: boolean;
  // the written image
  rows: Uint8Array[];
}
interface PngInfo { valid: number }

function store(p: unknown, v: number): void {
  if (p instanceof Ptr) p.a[p.o] = v;
}

export function png$png_sig_cmp(sig: Ptr, start: number, n: number): number {
  const magic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = start; i < start + n && i < 8; i++) if ((sig.a[sig.o + i] & 0xff) !== magic[i]) return i < 4 ? -1 : 1;
  return 0;
}

function create(write: boolean): PngStruct {
  return {
    write, ioPtr: null, readFn: null, file: null, width: 0, height: 0, depth: 0, color: 0, interlace: 0, palette: null,
    trns: null, idat: [], expand: false, strip16: false, packing: false, grayToRgb: false, bgr: false, rows: [],
  };
}
export function png$png_create_read_struct(_ver: unknown, _err: unknown, _efn: unknown, _wfn: unknown): PngStruct { return create(false); }
export function png$png_create_write_struct(_ver: unknown, _err: unknown, _efn: unknown, _wfn: unknown): PngStruct { return create(true); }
export function png$png_create_info_struct(_png: PngStruct): PngInfo { return { valid: 0 }; }
/** png_destroy_*_struct(&png_ptr, &info_ptr[, &end_info]): the pointers become null */
export function png$png_destroy_read_struct(png: unknown, info: unknown, end: unknown): void {
  for (const p of [png, info, end]) if (p instanceof Ptr) p.a[p.o] = null;
}
export function png$png_destroy_write_struct(png: unknown, info: unknown): void {
  for (const p of [png, info]) if (p instanceof Ptr) p.a[p.o] = null;
}
/** png_jmpbuf(png): the jump buffer setjmp is called with (rt/libc.ts: setjmp returns 0, longjmp throws) */
export function png$png_set_longjmp_fn(_png: PngStruct, _longjmp: unknown, _size: number): Ptr { return new Ptr([null], 0); }

export function png$png_set_read_fn(png: PngStruct, io: unknown, fn: PngStruct['readFn']): void {
  png.ioPtr = io;
  png.readFn = fn;
}
export function png$png_get_io_ptr(png: PngStruct): unknown { return png.ioPtr; }

function read(png: PngStruct, n: number): Uint8Array {
  const b = new Uint8Array(n);
  png.readFn!(png, new Ptr(b, 0), n);
  return b;
}
const u32 = (b: Uint8Array, o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;

/** the signature and every chunk up to IEND, through the read callback */
export function png$png_read_info(png: PngStruct, info: PngInfo): void {
  read(png, 8);
  for (;;) {
    const head = read(png, 8);
    const len = u32(head, 0);
    const type = String.fromCharCode(head[4], head[5], head[6], head[7]);
    const data = read(png, len);
    read(png, 4);
    if (type === 'IHDR') {
      png.width = u32(data, 0); png.height = u32(data, 4); png.depth = data[8]; png.color = data[9]; png.interlace = data[12];
    } else if (type === 'PLTE') png.palette = data;
    else if (type === 'tRNS') { png.trns = data; info.valid |= PNG_INFO_tRNS; }
    else if (type === 'IDAT') png.idat.push(data);
    else if (type === 'IEND') break;
    if (!png.width) c$longjmp(null, 1);
  }
}

/** the color type and depth after the transforms (png_read_update_info) */
function output(png: PngStruct): { color: number; depth: number; channels: number } {
  let color = png.color, depth = png.depth;
  const trns = !!png.trns && png.expand;
  if (color === PNG_COLOR_TYPE_PALETTE && png.expand) { color = trns ? PNG_COLOR_TYPE_RGB_ALPHA : PNG_COLOR_TYPE_RGB; depth = 8; }
  if (color === PNG_COLOR_TYPE_GRAY && png.expand) { if (depth < 8) depth = 8; if (trns) color = PNG_COLOR_TYPE_GRAY_ALPHA; }
  if (color === PNG_COLOR_TYPE_RGB && trns) color = PNG_COLOR_TYPE_RGB_ALPHA;
  if (depth === 16 && png.strip16) depth = 8;
  if (png.grayToRgb && color === PNG_COLOR_TYPE_GRAY) color = PNG_COLOR_TYPE_RGB;
  if (png.grayToRgb && color === PNG_COLOR_TYPE_GRAY_ALPHA) color = PNG_COLOR_TYPE_RGB_ALPHA;
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color] ?? 4;
  return { color, depth, channels };
}

export function png$png_read_update_info(_png: PngStruct, _info: PngInfo): void {}
export function png$png_get_IHDR(png: PngStruct, _info: PngInfo, w: unknown, h: unknown, depth: unknown, color: unknown,
  interlace: unknown, compression: unknown, filter: unknown): number {
  const o = png.write ? { color: png.color, depth: png.depth } : output(png);
  store(w, png.width); store(h, png.height); store(depth, o.depth); store(color, o.color);
  store(interlace, png.interlace); store(compression, 0); store(filter, 0);
  return 1;
}
export function png$png_get_valid(_png: PngStruct, info: PngInfo, flag: number): number { return info.valid & flag; }
export function png$png_set_expand(png: PngStruct): void { png.expand = true; }
export function png$png_set_strip_16(png: PngStruct): void { png.strip16 = true; }
export function png$png_set_packing(png: PngStruct): void { png.packing = true; }
export function png$png_set_gray_to_rgb(png: PngStruct): void { png.grayToRgb = true; }
export function png$png_set_bgr(png: PngStruct): void { png.bgr = true; }
export function png$png_get_rowbytes(png: PngStruct, _info: PngInfo): number {
  const o = png.write ? { depth: png.depth, channels: png.color === PNG_COLOR_TYPE_RGB_ALPHA ? 4 : 3 } : output(png);
  return Math.ceil((png.width * o.channels * o.depth) / 8);
}

const ADAM7 = [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]];

/** the file's samples, unfiltered and de-interlaced: one row of samples (each 0..2^depth-1) per line */
function samples(png: PngStruct): { rows: Uint16Array[]; perPixel: number } {
  const perPixel = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[png.color] ?? 4;
  const bits = perPixel * png.depth;
  const bpp = Math.max(1, bits >> 3);
  let total = 0;
  for (const c of png.idat) total += c.length;
  const z = new Uint8Array(total);
  let at = 0;
  for (const c of png.idat) { z.set(c, at); at += c.length; }
  const raw = unzlibSync(z);
  const rows = Array.from({ length: png.height }, () => new Uint16Array(png.width * perPixel));
  let pos = 0;
  const pass = (x0: number, y0: number, dx: number, dy: number) => {
    const w = Math.ceil((png.width - x0) / dx), h = Math.ceil((png.height - y0) / dy);
    if (w <= 0 || h <= 0) return;
    const stride = Math.ceil((w * bits) / 8);
    let prev = new Uint8Array(stride);
    for (let y = 0; y < h; y++) {
      const f = raw[pos++];
      const line = raw.slice(pos, pos + stride);
      pos += stride;
      for (let i = 0; i < stride; i++) {
        const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
        let p = 0;
        if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1;
        else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
        line[i] = (line[i] + p) & 0xff;
      }
      prev = line;
      const row = rows[y0 + y * dy];
      for (let x = 0; x < w; x++) {
        for (let s = 0; s < perPixel; s++) {
          let v: number;
          if (png.depth === 8) v = line[x * perPixel + s];
          else if (png.depth === 16) v = (line[(x * perPixel + s) * 2] << 8) | line[(x * perPixel + s) * 2 + 1];
          else {
            const bit = (x * perPixel + s) * png.depth;
            v = (line[bit >> 3] >> (8 - png.depth - (bit & 7))) & ((1 << png.depth) - 1);
          }
          row[(x0 + x * dx) * perPixel + s] = v;
        }
      }
    }
  };
  if (png.interlace) for (const [x0, y0, dx, dy] of ADAM7) pass(x0, y0, dx, dy);
  else pass(0, 0, 1, 1);
  return { rows, perPixel };
}

/** the image into the original's row pointers, with the transforms applied (8 bits per channel out) */
export function png$png_read_image(png: PngStruct, rowPtrs: Ptr): void {
  const { rows } = samples(png);
  const out = output(png);
  const trns = png.expand ? png.trns : null;
  const max = (1 << png.depth) - 1;
  const to8 = (v: number) => (png.depth === 16 ? v >> 8 : png.depth < 8 ? Math.round((v * 255) / max) : v);
  for (let y = 0; y < png.height; y++) {
    const dst: Ptr = rowPtrs.a[rowPtrs.o + y];
    const src = rows[y];
    for (let x = 0; x < png.width; x++) {
      let r: number, g: number, b: number, a = 255;
      switch (png.color) {
        case PNG_COLOR_TYPE_PALETTE: {
          const i = src[x];
          r = png.palette![i * 3]; g = png.palette![i * 3 + 1]; b = png.palette![i * 3 + 2];
          if (trns) a = i < trns.length ? trns[i] : 255;
          break;
        }
        case PNG_COLOR_TYPE_GRAY: {
          const v = src[x];
          if (trns && v === ((trns[0] << 8) | trns[1])) a = 0;
          r = g = b = to8(v);
          break;
        }
        case PNG_COLOR_TYPE_GRAY_ALPHA:
          r = g = b = to8(src[x * 2]); a = to8(src[x * 2 + 1]);
          break;
        case PNG_COLOR_TYPE_RGB:
          r = src[x * 3]; g = src[x * 3 + 1]; b = src[x * 3 + 2];
          if (trns && r === ((trns[0] << 8) | trns[1]) && g === ((trns[2] << 8) | trns[3]) && b === ((trns[4] << 8) | trns[5])) a = 0;
          r = to8(r); g = to8(g); b = to8(b);
          break;
        default:
          r = to8(src[x * 4]); g = to8(src[x * 4 + 1]); b = to8(src[x * 4 + 2]); a = to8(src[x * 4 + 3]);
      }
      if (png.bgr) [r, b] = [b, r];
      const px = out.channels === 1 ? [r] : out.channels === 2 ? [r, a] : out.channels === 3 ? [r, g, b] : [r, g, b, a];
      for (let s = 0; s < px.length; s++) dst.a[dst.o + x * px.length + s] = px[s];
    }
  }
}

// ---- writing (CPNGFile::Save)

export function png$png_init_io(png: PngStruct, file: unknown): void { png.file = file; }
export function png$png_set_filter(_png: PngStruct, _method: number, _filters: number): void {}
export function png$png_set_compression_level(_png: PngStruct, _level: number): void {}
export function png$png_set_compression_mem_level(_png: PngStruct, _level: number): void {}
export function png$png_set_compression_strategy(_png: PngStruct, _strategy: number): void {}
export function png$png_set_compression_window_bits(_png: PngStruct, _bits: number): void {}
export function png$png_set_compression_method(_png: PngStruct, _method: number): void {}
export function png$png_set_IHDR(png: PngStruct, _info: PngInfo, w: number, h: number, depth: number, color: number, interlace: number,
  _compression: number, _filter: number): void {
  Object.assign(png, { width: w, height: h, depth, color, interlace: 0 && interlace });
}
export function png$png_write_info(_png: PngStruct, _info: PngInfo): void {}
export function png$png_write_image(png: PngStruct, rowPtrs: Ptr): void {
  const channels = png.color === PNG_COLOR_TYPE_RGB_ALPHA ? 4 : 3;
  for (let y = 0; y < png.height; y++) {
    const src: Ptr = rowPtrs.a[rowPtrs.o + y];
    const row = new Uint8Array(1 + png.width * channels);
    for (let x = 0; x < png.width; x++) {
      const o = x * channels;
      const px = Array.from({ length: channels }, (_, s) => src.a[src.o + o + s] & 0xff);
      if (png.bgr) [px[0], px[2]] = [px[2], px[0]];
      row.set(px, 1 + o);
    }
    png.rows.push(row);
  }
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  let c = 0xffffffff;
  for (let i = 4; i < 8 + data.length; i++) c = CRC[(c ^ out[i]) & 0xff] ^ (c >>> 8);
  dv.setUint32(8 + data.length, (c ^ 0xffffffff) >>> 0);
  return out;
}
export function png$png_write_end(png: PngStruct, _info: PngInfo): void {
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, png.width); dv.setUint32(4, png.height);
  ihdr[8] = png.depth; ihdr[9] = png.color;
  let size = 0;
  for (const r of png.rows) size += r.length;
  const raw = new Uint8Array(size);
  let at = 0;
  for (const r of png.rows) { raw.set(r, at); at += r.length; }
  const parts = [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr),
    chunk('IDAT', zlibSync(raw, { level: 9 })), chunk('IEND', new Uint8Array(0))];
  for (const p of parts) c$fwrite(new Ptr(p, 0), 1, p.length, png.file as never);
}
