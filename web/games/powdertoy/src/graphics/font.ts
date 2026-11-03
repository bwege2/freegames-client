// graphics/FontReader.h / FontReader.cpp: the game's bitmap font.
//
// The font is resources/font.bz2 of the original, decompressed unchanged into assets/font.bin by
// re/powdertoy/tools/build-font.py. The game loads it once before drawing any text:
//   import fontUrl from '../../assets/font.bin?url';
//   loadFont(new Uint8Array(await (await fetch(fontUrl)).arrayBuffer()));
// Tests read the file with fs and call loadFont the same way.
//
// Format: glyphs in ascending code point order, each 3 bytes code point (little endian), 1 byte width, then
// 3 * width bytes of 2-bit pixels (FONT_H rows of width pixels, 4 pixels per byte, low bits first).

export const FONT_H = 12;

let font_data: Uint8Array | null = null;
/** offset of each glyph's width byte in font_data, in code point order */
let font_ptrs: Int32Array | null = null;
/** [first, last] code point of each contiguous range, terminated by [0, 0] */
let font_ranges: Int32Array | null = null;

/** InitFontData on the decompressed bytes; returns false if the data is corrupt (as the C++) */
export function loadFont(bytes: Uint8Array): boolean {
  const fontPtrsBuf: number[] = [];
  const fontRangesBuf: number[] = [];
  let first = -1;
  let last = -1;
  let ptr = 0;
  const end = bytes.length;
  while (ptr !== end) {
    if (ptr + 4 > end) return false;
    const codePoint = (bytes[ptr] | (bytes[ptr + 1] << 8) | (bytes[ptr + 2] << 16)) >>> 0;
    if (codePoint >= 0x110000) return false;
    const width = bytes[ptr + 3];
    if (width > 64) return false;
    if (ptr + 4 + width * 3 > end) return false;
    const cp = codePoint | 0;
    if (last >= cp) return false;
    if (first !== -1 && last + 1 < cp) {
      fontRangesBuf.push(first, last);
      first = -1;
    }
    if (first === -1) first = cp;
    last = cp;
    fontPtrsBuf.push(ptr + 3);
    ptr += width * 3 + 4;
  }
  if (first !== -1) fontRangesBuf.push(first, last);
  fontRangesBuf.push(0, 0);
  font_data = bytes;
  font_ptrs = Int32Array.from(fontPtrsBuf);
  font_ranges = Int32Array.from(fontRangesBuf);
  return true;
}

export function fontLoaded(): boolean {
  return font_data !== null;
}

/** FontReader::lookupChar: the offset of the glyph's width byte in font_data */
function lookupChar(ch: number): number {
  if (!font_data) throw new Error('font data not loaded (call loadFont first)');
  const ranges = font_ranges!, ptrs = font_ptrs!;
  let offset = 0;
  for (let i = 0; ranges[i * 2 + 1]; i++) {
    if (ranges[i * 2] > ch) break;
    else if (ranges[i * 2 + 1] >= ch) return ptrs[offset + (ch - ranges[i * 2])];
    else offset += ranges[i * 2 + 1] - ranges[i * 2] + 1;
  }
  if (ch === 0xFFFD) return 0; // &font_data[0], as the original
  return lookupChar(0xFFFD);
}

export class FontReader {
  private data_: Uint8Array;
  private pointer: number;
  private width: number;
  private pixels = 0;
  private data = 0;

  /** FontReader(String::value_type ch) */
  constructor(ch: number) {
    const p = lookupChar(ch);
    this.data_ = font_data!;
    this.pointer = p + 1;
    this.width = this.data_[p];
  }

  /** reuse this reader for another character (no allocation in loops) */
  reset(ch: number): this {
    const p = lookupChar(ch);
    this.data_ = font_data!;
    this.pointer = p + 1;
    this.width = this.data_[p];
    this.pixels = 0;
    this.data = 0;
    return this;
  }

  GetWidth(): number {
    return this.width;
  }

  NextPixel(): number {
    if (!this.pixels) {
      this.data = this.data_[this.pointer++];
      this.pixels = 4;
    }
    const old = this.data;
    this.pixels--;
    this.data >>= 2;
    return old & 0x3;
  }
}

/** the width of a character without creating a reader */
export function fontCharWidth(ch: number): number {
  return font_data![lookupChar(ch)];
}
