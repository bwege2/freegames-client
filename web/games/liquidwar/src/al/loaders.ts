// al/loaders.ts: Allegro 4.4's load_bitmap for the BMP files of Liquid War's custom directory (src/bmp.c:
// Windows and OS/2 headers, uncompressed 1, 4 and 8 bits; the palette's components divided by 4; lines
// read 32 bits at a time) and load_midi for its .mid files (src/midi.c: format 0 or 1, up to 32 tracks).

import { Bitmap } from './bitmap.ts';
import type { Midi } from './datafile.ts';
import { newPalette, type Palette } from './palette.ts';

export function load_bmp(b: Uint8Array): { bmp: Bitmap; pal: Palette } | null {
  let p = 0;
  const igetw = (): number => {
    const v = b[p]! | (b[p + 1]! << 8);
    p += 2;
    return v;
  };
  const igetl = (): number => {
    const v = (b[p]! | (b[p + 1]! << 8) | (b[p + 2]! << 16) | (b[p + 3]! << 24)) | 0;
    p += 4;
    return v;
  };
  const getc = (): number => (p < b.length ? b[p++]! : (p++, -1));
  if (igetw() !== 0x4d42) return null;
  igetl();
  igetw();
  igetw();
  const bfOffBits = igetl();
  const biSize = igetl();
  let width, height, bitCount, compression;
  const pal = newPalette();
  const readColors = (bytes: number, win: boolean): void => {
    let i = 0, j = 0;
    for (; i + 3 <= bytes && j < 256; j++) {
      pal[j * 3 + 2] = Math.trunc(getc() / 4) & 0xff;
      pal[j * 3 + 1] = Math.trunc(getc() / 4) & 0xff;
      pal[j * 3] = Math.trunc(getc() / 4) & 0xff;
      i += 3;
      if (win && i < bytes) {
        getc();
        i++;
      }
    }
    for (; i < bytes; i++) getc();
  };
  if (biSize === 40) {
    width = igetl();
    height = igetl();
    igetw();
    bitCount = igetw();
    compression = igetl();
    igetl();
    igetl();
    igetl();
    igetl();
    igetl();
    if (compression !== 3) readColors(bfOffBits - 54, true);
  } else if (biSize === 12) {
    width = igetw();
    height = igetw();
    igetw();
    bitCount = igetw();
    compression = 0;
    readColors(bfOffBits - 26, false);
  } else return null;
  if (compression !== 0 || (bitCount !== 1 && bitCount !== 4 && bitCount !== 8)) return null;
  const h = Math.abs(height);
  const bmp = new Bitmap(width, h);
  let line = height < 0 ? 0 : height - 1;
  const dir = height < 0 ? 1 : -1;
  for (let i = 0; i < h; i++, line += dir) {
    const o = line * width;
    if (bitCount === 8) {
      for (let x = 0; x < width; x += 4) {
        for (let k = 0; k < 4; k++) {
          const v = getc() & 0xff;
          if (x + k < width) bmp.data[o + x + k] = v;
        }
      }
    } else if (bitCount === 4) {
      for (let x = 0; x < width; x += 8) {
        for (let k = 0; k < 4; k++) {
          const v = getc() & 0xff;
          if (x + k * 2 < width) bmp.data[o + x + k * 2] = (v >> 4) & 15;
          if (x + k * 2 + 1 < width) bmp.data[o + x + k * 2 + 1] = v & 15;
        }
      }
    } else {
      for (let x = 0; x < width; x += 32) {
        for (let k = 0; k < 4; k++) {
          const v = getc() & 0xff;
          for (let bit = 0; bit < 8; bit++) {
            const xx = x + k * 8 + bit;
            if (xx < width) bmp.data[o + xx] = (v >> (7 - bit)) & 1;
          }
        }
      }
    }
  }
  return { bmp, pal };
}

export function load_midi(b: Uint8Array): Midi | null {
  let p = 0;
  const tag = (): string => {
    const s = String.fromCharCode(b[p]!, b[p + 1]!, b[p + 2]!, b[p + 3]!);
    p += 4;
    return s;
  };
  const mgetl = (): number => {
    const v = ((b[p]! << 24) | (b[p + 1]! << 16) | (b[p + 2]! << 8) | b[p + 3]!) | 0;
    p += 4;
    return v;
  };
  const mgetw = (): number => {
    const v = (b[p]! << 8) | b[p + 1]!;
    p += 2;
    return v;
  };
  if (tag() !== 'MThd') return null;
  mgetl();
  const type = mgetw();
  if (type !== 0 && type !== 1) return null;
  const num = mgetw();
  if (num < 1 || num > 32) return null;
  let div = mgetw();
  if (div >= 0x8000) div -= 0x10000;
  const tracks: Uint8Array[] = [];
  for (let c = 0; c < num; c++) {
    if (tag() !== 'MTrk') return null;
    const len = mgetl();
    if (p + len > b.length) return null;
    tracks.push(b.slice(p, p + len));
    p += len;
  }
  while (tracks.length < 32) tracks.push(new Uint8Array(0));
  return { divisions: Math.abs(div), tracks };
}
