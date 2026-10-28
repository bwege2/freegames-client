// imlib/specs.cpp: files (bFILE, jFILE) and SPEC archives (spec_directory), on the virtual file
// system (rt/vfs.ts). The original's buffering is left out: it changes nothing a reader sees.
import { dprintf } from './dprint.ts';
import { normalize, vfsGet, vfsPut, vfsSaved } from '../rt/vfs.ts';

export const SPEC_INVALID_TYPE = 0, SPEC_COLOR_TABLE = 1, SPEC_PALETTE = 2, SPEC_IMAGE = 4, SPEC_FORETILE = 5,
  SPEC_BACKTILE = 6, SPEC_CHARACTER = 7, SPEC_MORPH_POINTS_8 = 8, SPEC_MORPH_POINTS_16 = 9, SPEC_GRUE_OBJS = 10,
  SPEC_EXTERN_SFX = 11, SPEC_DMX_MUS = 12, SPEC_PATCHED_MORPH = 13, SPEC_NORMAL_FILE = 14, SPEC_COMPRESS1_FILE = 15,
  SPEC_VECTOR_IMAGE = 16, SPEC_LIGHT_LIST = 17, SPEC_GRUE_FGMAP = 18, SPEC_GRUE_BGMAP = 19, SPEC_DATA_ARRAY = 20,
  SPEC_CHARACTER2 = 21, SPEC_PARTICLE = 22, SPEC_EXTERNAL_LCACHE = 23;

export const spec_types = [
  'Invalid type', 'Color table', 'Palette', 'Invalid Type', 'Image', 'Fore Tile', 'Back Tile', 'Character',
  '8 Morph', '16 Morph', 'Grue objs', 'Extern WAV', 'DMX MUS', 'Patched morph', 'Normal file', 'Compress1 file',
  'Vector Image', 'Light list', 'Grue fgmap', 'Grue bgmap', 'Data array', 'Character2', 'Particle', 'Extern lcache',
];

export const SPEC_SIGNATURE = 'SPEC1.0';
export const SPEC_SIG_SIZE = 8;
export const SPEC_SEARCH_INSIDE_OUTSIDE = 1, SPEC_SEARCH_OUTSIDE_INSIDE = 2, SPEC_SEARCH_INSIDE_ONLY = 3;
export const SEEK_SET = 0, SEEK_CUR = 1, SEEK_END = 2;

let spec_prefix: string | null = null;
let save_spec_prefix: string | null = null;
let search_order = SPEC_SEARCH_OUTSIDE_INSIDE;
let no_space_handle_fun: (() => void) | null = null;
export let total_files_open = 0;

export function set_filename_prefix(prefix: string | null): void {
  if (prefix) {
    spec_prefix = prefix;
    const c = prefix[prefix.length - 1];
    if (c !== '\\' && c !== '/') spec_prefix += '/';
  } else spec_prefix = null;
}
export function get_filename_prefix(): string | null { return spec_prefix; }
export function set_save_filename_prefix(p: string | null): void { save_spec_prefix = p; }
export function get_save_filename_prefix(): string { return save_spec_prefix ?? ''; }
export function set_no_space_handler(f: () => void): void { no_space_handle_fun = f; }

const latin1 = (b: Uint8Array): string => {
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return s;
};
export function bytesOf(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
  return b;
}
export { latin1 };

export abstract class bFILE {
  abstract open_failure(): boolean;
  abstract read(buf: Uint8Array, count?: number, at?: number): number;
  abstract write(buf: Uint8Array | ArrayLike<number>, count?: number): number;
  abstract seek(offset: number, whence: number): number;
  abstract tell(): number;
  abstract file_size(): number;
  close(): void { /* the destructor */ }

  read_uint8(): number {
    const b = new Uint8Array(1);
    this.read(b, 1);
    return b[0];
  }
  read_uint16(): number {
    const b = new Uint8Array(2);
    this.read(b, 2);
    return b[0] | (b[1] << 8);
  }
  read_uint32(): number {
    const b = new Uint8Array(4);
    this.read(b, 4);
    return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
  }
  /** count bytes as a new array (fewer at the end of the file) */
  read_bytes(count: number): Uint8Array {
    const b = new Uint8Array(count);
    const n = this.read(b, count);
    return n === count ? b : b.subarray(0, n);
  }
  write_uint8(x: number): void { this.write([x & 0xff], 1); }
  write_uint16(x: number): void { this.write([x & 0xff, (x >> 8) & 0xff], 2); }
  write_uint32(x: number): void { this.write([x & 0xff, (x >> 8) & 0xff, (x >> 16) & 0xff, (x >>> 24) & 0xff], 4); }
  write_double(x: number): void {
    const a = x < 0 ? Math.ceil(x) : Math.floor(x); // modf
    this.write_uint32(Math.trunc((x - a) * 2147483648) | 0);
    this.write_uint32(a | 0);
  }
  read_double(): number {
    const a = this.read_uint32(), b = this.read_uint32();
    // long a, b = uint32 values (zero-extended into a 64-bit long)
    return b + a / 2147483648;
  }
}

/** a file of the virtual file system, read from memory or written to it (jFILE) */
export class jFILE extends bFILE {
  private data: Uint8Array | null = null;
  private pos = 0;
  private writing = false;
  private out: number[] = [];
  private path = '';
  private failed = true;

  constructor(filename: string, access_string: string) {
    super();
    let r = false, w = false, a = false;
    for (const c of access_string.toUpperCase()) {
      if (c === 'R') r = true;
      if (c === 'W') w = true;
      if (c === 'A') a = true;
    }
    if (search_order === SPEC_SEARCH_OUTSIDE_INSIDE || search_order === SPEC_SEARCH_INSIDE_OUTSIDE) this.open_external(filename, r, w, a);
    total_files_open++;
  }

  private open_external(filename: string, r: boolean, w: boolean, a: boolean): void {
    const tmp = spec_prefix && filename[0] !== '/' ? spec_prefix + filename : filename;
    this.path = normalize(tmp);
    if (w || a) {
      this.writing = true;
      this.failed = false;
      if (a) {
        const old = vfsGet(this.path);
        if (old) this.out = Array.from(old);
      } else if (r) {
        const old = vfsGet(this.path);
        if (old) this.out = Array.from(old);
      }
      return;
    }
    const d = vfsGet(this.path);
    if (d) {
      this.data = d;
      this.failed = false;
    }
  }

  open_failure(): boolean { return this.failed; }
  file_size(): number { return this.writing ? 0 : this.data ? this.data.length : 0; }

  read(buf: Uint8Array, count = buf.length, at = 0): number {
    if (!this.data) return 0;
    const n = Math.max(0, Math.min(count, this.data.length - this.pos));
    buf.set(this.data.subarray(this.pos, this.pos + n), at);
    this.pos += n;
    return n;
  }

  write(buf: Uint8Array | ArrayLike<number>, count = buf.length): number {
    if (!this.writing) return 0;
    for (let i = 0; i < count; i++) {
      if (this.pos < this.out.length) this.out[this.pos] = buf[i] & 0xff;
      else this.out.push(buf[i] & 0xff);
      this.pos++;
    }
    return count;
  }

  seek(offset: number, whence: number): number {
    const size = this.writing ? 0 : this.file_size();
    if (whence === SEEK_CUR) offset += this.pos;
    else if (whence === SEEK_END) offset = size - offset;
    this.pos = offset;
    return 1;
  }

  tell(): number { return this.pos; }

  close(): void {
    if (this.writing && !this.failed) {
      vfsPut(this.path, Uint8Array.from(this.out));
      vfsSaved(this.path);
      this.writing = false;
      this.failed = true;
    }
    if (!this.failed) total_files_open--;
  }
}

/** a file kept in memory (the original's equivalent is reading a whole file first) */
export class MemFILE extends bFILE {
  data: Uint8Array;
  pos = 0;
  constructor(data: Uint8Array) {
    super();
    this.data = data;
  }
  open_failure(): boolean { return false; }
  file_size(): number { return this.data.length; }
  read(buf: Uint8Array, count = buf.length, at = 0): number {
    const n = Math.max(0, Math.min(count, this.data.length - this.pos));
    buf.set(this.data.subarray(this.pos, this.pos + n), at);
    this.pos += n;
    return n;
  }
  write(): number { return 0; }
  seek(offset: number, whence: number): number {
    if (whence === SEEK_CUR) offset += this.pos;
    else if (whence === SEEK_END) offset = this.data.length - offset;
    this.pos = offset;
    return 1;
  }
  tell(): number { return this.pos; }
}

class null_file extends bFILE {
  open_failure(): boolean { return true; }
  read(): number { return 0; }
  write(): number { return 0; }
  seek(): number { return 0; }
  tell(): number { return 0; }
  file_size(): number { return 0; }
}

let open_file_fun: ((name: string, mode: string) => bFILE) | null = null;
export function set_file_opener(f: ((name: string, mode: string) => bFILE) | null): void { open_file_fun = f; }

export function open_file(filename: string, mode: string): bFILE {
  if (open_file_fun) return open_file_fun(filename, mode);
  return new jFILE(filename, mode);
}
export { null_file };

export function set_spec_main_file(filename: string, order = SPEC_SEARCH_OUTSIDE_INSIDE): void {
  dprintf(`Specs : main file set to ${filename}\n`);
  search_order = order;
  // abuse.spe is not part of the data: the main file stays closed, as in the original
}

export class spec_entry {
  type: number;
  name: string;
  data: Uint8Array | null = null;
  size: number;
  offset: number;
  constructor(type: number, name: string, _link: string | null, size: number, offset: number) {
    this.type = type;
    this.name = name;
    this.size = size;
    this.offset = offset;
  }
}

export class spec_directory {
  total = 0;
  entries: spec_entry[] = [];

  constructor(fp?: bFILE) {
    if (fp) this.startup(fp);
  }

  startup(fp: bFILE): void {
    const buf = new Uint8Array(8);
    fp.read(buf, 8);
    let sig = '';
    for (let i = 0; i < 8 && buf[i]; i++) sig += String.fromCharCode(buf[i]);
    if (sig === SPEC_SIGNATURE) {
      this.total = fp.read_uint16();
      this.entries = [];
      for (let i = 0; i < this.total; i++) {
        const type = fp.read_uint8();
        const len = fp.read_uint8();
        const nb = fp.read_bytes(len);
        let name = '';
        for (let j = 0; j < nb.length && nb[j]; j++) name += String.fromCharCode(nb[j]);
        fp.read_uint8(); // flags
        const size = fp.read_uint32();
        const offset = fp.read_uint32();
        this.entries.push(new spec_entry(type, name, null, size, offset));
      }
    } else {
      this.total = 0;
      this.entries = [];
    }
  }

  FullyLoad(fp: bFILE): void {
    for (const se of this.entries) {
      fp.seek(se.offset, SEEK_SET);
      se.data = fp.read_bytes(se.size);
    }
  }

  find(name: string, type?: number): spec_entry | null {
    for (const e of this.entries) if (e.name === name && (type === undefined || e.type === type)) return e;
    return null;
  }

  find_type(type: number): spec_entry | null {
    for (const e of this.entries) if (e.type === type) return e;
    return null;
  }

  find_number(name: string): number {
    for (let i = 0; i < this.total; i++) if (this.entries[i].name === name) return i;
    return -1;
  }

  find_number_type(type: number): number {
    for (let i = 0; i < this.total; i++) if (this.entries[i].type === type) return i;
    return -1;
  }

  type_total(type: number): number {
    let x = 0;
    for (const e of this.entries) if (e.type === type) x++;
    return x;
  }

  calc_offsets(): void {
    let o = SPEC_SIG_SIZE + 2;
    for (const e of this.entries) o += 1 + 1 + e.name.length + 1 + 1 + 8;
    for (const e of this.entries) {
      e.offset = o;
      o += e.size;
    }
  }

  add_by_hand(e: spec_entry): void {
    this.total++;
    this.entries.push(e);
  }

  remove(e: spec_entry): void {
    const i = this.entries.indexOf(e);
    if (i >= 0) {
      this.entries.splice(i, 1);
      this.total--;
    } else dprintf('Spec_directory::remove bad entry pointer\n');
  }

  data_start_offset(): number { return this.total ? this.entries[0].offset : SPEC_SIG_SIZE + 2; }
  data_end_offset(): number { return this.total ? this.entries[0].offset + this.entries[0].size : SPEC_SIG_SIZE + 2; }

  write(fp: bFILE): number {
    const sig = new Uint8Array(8);
    sig.set(bytesOf(SPEC_SIGNATURE));
    if (fp.write(sig, 8) !== 8) return 0;
    fp.write_uint16(this.total);
    for (const e of this.entries) {
      if (fp.write([e.type], 1) !== 1) return 0;
      if (!write_string(fp, e.name)) return 0;
      if (fp.write([0], 1) !== 1) return 0;
      fp.write_uint32(e.size);
      fp.write_uint32(e.offset);
    }
    return 1;
  }

  /** spec_directory::write(char const *filename) */
  write_file(filename: string): jFILE | null {
    const fp = new jFILE(filename, 'wb');
    if (fp.open_failure()) return null;
    if (!this.write(fp)) {
      fp.close();
      return null;
    }
    return fp;
  }
}

export function write_string(fp: bFILE, st: string): number {
  const length = (st.length + 1) & 0xff;
  if (fp.write([length], 1) !== 1) return 0;
  const b = new Uint8Array(length);
  b.set(bytesOf(st).subarray(0, length - 1));
  if (fp.write(b, length) !== length) return 0;
  return 1;
}

export function call_no_space(): void { if (no_space_handle_fun) no_space_handle_fun(); }
