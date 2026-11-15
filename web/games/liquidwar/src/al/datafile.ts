// al/datafile.ts: reads an Allegro 4 datafile (src/datafile.c, src/file.c): the uncompressed "slh."
// packfile with "ALL." objects, each with its properties (NAME, ...), and the object types Liquid War's
// lw.dat holds: nested datafiles (FILE), 8-bit bitmaps (BMP), palettes (PAL), colour fonts (FONT),
// samples (SAMP), MIDI music (MIDI) and binary data (DATA, RAW).

import { Bitmap } from './bitmap.ts';
import type { Palette } from './palette.ts';

export interface Glyphs {
  begin: number;
  end: number;
  bitmaps: Bitmap[];
}

export interface Font {
  height: number;
  ranges: Glyphs[];
}

export interface Sample {
  bits: number;
  stereo: boolean;
  freq: number;
  len: number;
  data: Uint8Array;
  /** set by the player: an identifier for the trace */
  name?: string;
}

export interface Midi {
  divisions: number;
  tracks: Uint8Array[];
  name?: string;
}

export interface DataObject {
  type: string;
  name: string;
  props: Record<string, string>;
  dat: DataObject[] | Bitmap | Palette | Font | Sample | Midi | Uint8Array;
}

const MAGIC_NOPACK = 0x736c682e; // "slh."
const DAT_MAGIC = 0x414c4c2e; // "ALL."

function tag(n: number): string {
  return String.fromCharCode((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);
}

class Reader {
  p = 0;
  readonly b: Uint8Array;
  constructor(b: Uint8Array) {
    this.b = b;
  }
  u8(): number {
    return this.b[this.p++]!;
  }
  mw(): number {
    const v = (this.b[this.p]! << 8) | this.b[this.p + 1]!;
    this.p += 2;
    return v;
  }
  /** pack_mgetw as a signed short */
  smw(): number {
    const v = this.mw();
    return v >= 0x8000 ? v - 0x10000 : v;
  }
  ml(): number {
    const v = ((this.b[this.p]! << 24) | (this.b[this.p + 1]! << 16) | (this.b[this.p + 2]! << 8) | this.b[this.p + 3]!) | 0;
    this.p += 4;
    return v;
  }
  bytes(n: number): Uint8Array {
    const v = this.b.slice(this.p, this.p + n);
    this.p += n;
    return v;
  }
}

function readBitmap(r: Reader, bits: number): Bitmap {
  const w = r.mw();
  const h = r.mw();
  if (bits !== 8) throw new Error(`datafile: ${bits}-bit bitmap`);
  const bmp = new Bitmap(w, h);
  bmp.data.set(r.bytes(w * h));
  return bmp;
}

function readPaletteStruct(r: Reader, size: number): Palette {
  const p = new Uint8Array(768);
  const n = Math.min(256, size >> 2);
  for (let c = 0; c < n; c++) {
    p[c * 3] = r.u8();
    p[c * 3 + 1] = r.u8();
    p[c * 3 + 2] = r.u8();
    r.u8();
  }
  return p;
}

function readFont(r: Reader): Font {
  let ranges = r.mw();
  let height = 0;
  const out: Glyphs[] = [];
  while (ranges--) {
    let depth = r.u8();
    if (depth === 1 || depth === 255) throw new Error('datafile: mono font');
    if (depth === 0) depth = 8;
    const begin = r.ml();
    const end = r.ml() + 1;
    const bitmaps: Bitmap[] = [];
    for (let i = 0; i < end - begin; i++) {
      const g = readBitmap(r, depth);
      if (g.h > height) height = g.h;
      bitmaps.push(g);
    }
    out.push({ begin, end, bitmaps });
  }
  return { height, ranges: out };
}

function readSample(r: Reader): Sample {
  const bits = r.smw();
  const s: Sample = {
    bits: Math.abs(bits), stereo: bits < 0, freq: r.mw(), len: r.ml(), data: new Uint8Array(0),
  };
  if (s.bits !== 8) throw new Error('datafile: 16-bit sample');
  s.data = r.bytes(s.len * (s.stereo ? 2 : 1));
  return s;
}

function readMidi(r: Reader): Midi {
  const divisions = r.mw();
  const tracks: Uint8Array[] = [];
  for (let c = 0; c < 32; c++) {
    const len = r.ml();
    tracks.push(len > 0 ? r.bytes(len) : new Uint8Array(0));
  }
  return { divisions, tracks };
}

function readObject(r: Reader, type: number): DataObject['dat'] {
  const size = r.ml();
  const usize = r.ml();
  if (usize < 0) throw new Error('datafile: compressed object');
  const end = r.p + size;
  let dat: DataObject['dat'];
  switch (tag(type)) {
    case 'FILE':
      dat = readFile(r);
      break;
    case 'BMP ':
      dat = readBitmap(r, r.smw());
      break;
    case 'PAL ':
      // a V2 datafile has no reader for palettes: the object is the PALETTE array itself (RGB structs:
      // r, g, b, filler, 6 bits each), which Liquid War uses as it is
      dat = readPaletteStruct(r, size);
      break;
    case 'FONT':
      if (r.smw() !== 0) throw new Error('datafile: old style font');
      dat = readFont(r);
      break;
    case 'SAMP':
      dat = readSample(r);
      break;
    case 'MIDI':
      dat = readMidi(r);
      break;
    default:
      dat = r.bytes(size);
  }
  r.p = end;
  return dat;
}

function readFile(r: Reader): DataObject[] {
  const count = r.ml();
  const list: DataObject[] = [];
  let props: Record<string, string> = {};
  for (let c = 0; c < count;) {
    const type = r.ml();
    if (tag(type) === 'prop') {
      const ptype = tag(r.ml());
      const psize = r.ml();
      props[ptype] = String.fromCharCode(...r.bytes(psize));
    } else {
      const dat = readObject(r, type);
      list.push({ type: tag(type).trim(), name: props.NAME ?? '', props, dat });
      props = {};
      c++;
    }
  }
  return list;
}

/** the whole datafile's top level objects */
export function load_datafile(bytes: Uint8Array): DataObject[] {
  const r = new Reader(bytes);
  if (r.ml() !== MAGIC_NOPACK) throw new Error('datafile: not an uncompressed Allegro packfile');
  if (r.ml() !== DAT_MAGIC) throw new Error('datafile: not an Allegro datafile');
  return readFile(r);
}

/** load_datafile_object(file, name): the object of that name (case-insensitive), or null */
export function find_datafile_object(root: DataObject[], name: string): DataObject | null {
  const n = name.toLowerCase();
  return root.find((o) => o.name.toLowerCase() === n) ?? null;
}
