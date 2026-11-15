// The files the program opens, and the stdio calls it makes on them (fopen, fgetc, fgets, fscanf, feof,
// fseek/ftell, fprintf). The installed data (LIBDIR) is read-only; the home directory (~/.lincityrc and
// ~/.lincity, the save directory) is written, and every change is reported to the platform.
import { gunzipSync, gzipSync } from 'fflate';
import { sprintf, sscanf } from './c.ts';
import { platform } from './platform.ts';

export const LIBDIR = '/usr/local/share/lincity';
export const HOME = '/home/lincity';

const files = new Map<string, Uint8Array>();
const dirs = new Set<string>();

/** puts a file into the file system (the data before the program starts) */
export function vfsPut(path: string, data: Uint8Array): void {
  files.set(path, data);
  for (let d = path.slice(0, path.lastIndexOf('/')); d; d = d.slice(0, d.lastIndexOf('/'))) dirs.add(d);
}
export function vfsGet(path: string): Uint8Array | undefined { return files.get(path); }
export function vfsList(dir: string): string[] {
  const pre = `${dir}/`;
  return [...files.keys()].filter((p) => p.startsWith(pre) && !p.slice(pre.length).includes('/')).map((p) => p.slice(pre.length));
}
export function vfsClear(): void { files.clear(); dirs.clear(); }
export const fileExists = (p: string): boolean => files.has(p);
export const directoryExists = (p: string): boolean => dirs.has(p);
export function mkdir(p: string): void { dirs.add(p); }

function written(path: string, data: Uint8Array | null): void {
  if (data) vfsPut(path, data); else files.delete(path);
  if (path.startsWith(`${HOME}/`)) platform().fileChanged(path, data);
}
export function remove(path: string): number {
  if (!files.has(path)) return -1;
  written(path, null);
  return 0;
}

const latin1 = (b: Uint8Array): string => { let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return s; };
const bytesOf = (s: string): Uint8Array => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
export { latin1, bytesOf };

export class CFile {
  pos = 0;
  eof = false;
  data: Uint8Array;
  readonly path: string;
  readonly writing: boolean;
  private out = '';
  constructor(path: string, data: Uint8Array, writing: boolean) { this.path = path; this.data = data; this.writing = writing; }
  fgetc(): number {
    if (this.pos >= this.data.length) { this.eof = true; return -1; }
    return this.data[this.pos++];
  }
  /** fgets(buf, n): up to n - 1 characters, through the newline; null at end of file */
  fgets(n: number): string | null {
    if (this.pos >= this.data.length) { this.eof = true; return null; }
    let s = '';
    while (s.length < n - 1) {
      if (this.pos >= this.data.length) { this.eof = true; break; }
      const c = this.data[this.pos++];
      s += String.fromCharCode(c);
      if (c === 10) break;
    }
    return s;
  }
  feof(): boolean { return this.eof; }
  /** fscanf for a single conversion: %d, %f or %Ns; null when it fails */
  fscanf1(fmt: string): number | string | null {
    // skip white space, read one token
    const d = this.data;
    while (this.pos < d.length && (d[this.pos] === 32 || (d[this.pos] >= 9 && d[this.pos] <= 13))) this.pos++;
    if (this.pos >= d.length) { this.eof = true; return null; }
    const start = this.pos;
    let tok = '';
    const max = /^%(\d+)s$/.exec(fmt);
    const limit = max ? parseInt(max[1], 10) : Infinity;
    if (fmt === '%d') {
      if (d[this.pos] === 45 || d[this.pos] === 43) tok += String.fromCharCode(d[this.pos++]);
      while (this.pos < d.length && d[this.pos] >= 48 && d[this.pos] <= 57) tok += String.fromCharCode(d[this.pos++]);
      if (!/\d/.test(tok)) { this.pos = start; return null; }
    } else if (fmt === '%f') {
      while (this.pos < d.length && /[0-9eE.+-]/.test(String.fromCharCode(d[this.pos]))) tok += String.fromCharCode(d[this.pos++]);
    } else {
      while (this.pos < d.length && !(d[this.pos] === 32 || (d[this.pos] >= 9 && d[this.pos] <= 13)) && tok.length < limit) tok += String.fromCharCode(d[this.pos++]);
      return tok;
    }
    const v = sscanf(tok, fmt);
    return v.length ? v[0] : null;
  }
  fseekEnd(): void { this.pos = this.data.length; }
  fseekSet(p: number): void { this.pos = p; this.eof = false; }
  ftell(): number { return this.pos; }
  fprintf(fmt: string, ...args: (number | string)[]): void { this.out += sprintf(fmt, ...args); }
  fputs(s: string): void { this.out += s; }
  /** the bytes written so far */
  written(): Uint8Array { return bytesOf(this.out); }
  fclose(): void {
    if (this.writing) written(this.path, bytesOf(this.out));
  }
}

export function fopen(path: string, mode: string): CFile | null {
  if (mode.startsWith('w')) return new CFile(path, new Uint8Array(0), true);
  const d = files.get(path);
  if (!d) return null;
  return new CFile(path, d, false);
}

/** fileutil.c's fopen_read_gzipped: the output of `gzip -d -c < fn` */
export function fopenReadGzipped(path: string): CFile {
  const d = files.get(path);
  let out: Uint8Array = new Uint8Array(0);
  if (d) {
    try { out = gunzipSync(d); } catch { out = new Uint8Array(0); }
  }
  return new CFile(path, out, false);
}

/** `gzip -f src` then `mv src.gz dst` (ldsvguts.c's save_city) */
export function gzipMove(src: string, dst: string): void {
  const d = files.get(src) ?? new Uint8Array(0);
  files.delete(src);
  // gzip keeps the file's name in its header (here the scene's, the original's says "tmp-save")
  written(dst, gzipSync(d, { level: 6, mtime: 0, filename: dst.slice(dst.lastIndexOf('/') + 1) }));
}
