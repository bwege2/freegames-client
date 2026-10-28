// The files of the game: an in-memory file system (the installation's data files, the level files of
// the running game, the save file, bones, the record), with Unix's file descriptors and stdio on top.
// What must outlive the game (save file, bones) is handed to the platform when it changes.
import { Ptr, memBytes, memStore } from './ptr.ts';
import { jstr, putstr } from './cstring.ts';
import { format, scan, VaList } from './printf.ts';
import { platform } from './platform.ts';

export const R: any = {
  errno: 0,
  stdin: null as any,
  stdout: null as any,
  stderr: null as any,
  ospeed: 0,
};

const ENOENT = 2, EBADF = 9, EEXIST = 17;
const O_ACCMODE = 3, O_WRONLY = 1, O_RDWR = 2, O_CREAT = 0o100, O_EXCL = 0o200, O_TRUNC = 0o1000, O_APPEND = 0o2000;

class Node {
  data = new Uint8Array(64);
  size = 0;
  mtime = 0;
  bytes(): Uint8Array {
    return this.data.slice(0, this.size);
  }
  ensure(n: number): void {
    if (n <= this.data.length) return;
    let m = this.data.length * 2;
    while (m < n) m *= 2;
    const d = new Uint8Array(m);
    d.set(this.data.subarray(0, this.size));
    this.data = d;
  }
}

const files = new Map<string, Node>();
const dirty = new Set<string>();

export function normPath(p: string): string {
  const parts: string[] = [];
  for (const s of p.split('/')) {
    if (s === '' || s === '.') continue;
    if (s === '..') parts.pop();
    else parts.push(s);
  }
  return parts.join('/');
}

/** the file system's files (path -> contents) */
export function fsFiles(): Map<string, Uint8Array> {
  const m = new Map<string, Uint8Array>();
  for (const [k, v] of files) m.set(k, v.bytes());
  return m;
}

export function fsReset(init: Map<string, Uint8Array>): void {
  files.clear();
  dirty.clear();
  fds.clear();
  for (const [k, v] of init) {
    const n = new Node();
    n.ensure(v.length);
    n.data.set(v);
    n.size = v.length;
    files.set(normPath(k), n);
  }
  R.errno = 0;
  R.stdin = new CFile(null, 0, true, false);
  R.stdout = new CFile(null, 1, false, true);
  R.stderr = new CFile(null, 2, false, true);
}

export function fsRead(path: string): Uint8Array | null {
  return files.get(normPath(path))?.bytes() ?? null;
}

function changed(path: string): void {
  dirty.add(path);
  platform().fileChanged(path, files.get(path)?.bytes() ?? null);
}

// ---- file descriptors ----
interface Fd {
  node: Node;
  path: string;
  pos: number;
  read: boolean;
  write: boolean;
  append: boolean;
}
const fds = new Map<number, Fd>();

function newFd(f: Fd): number {
  let n = 3;
  while (fds.has(n)) n++;
  fds.set(n, f);
  return n;
}

export function open(path: Ptr, flags: number, _mode?: number): number {
  const p = normPath(jstr(path));
  if (TRACE) console.error(`open(${p}, ${flags.toString(8)}) ${files.has(p) ? 'exists' : 'new'}`);
  let node = files.get(p);
  if (node && (flags & O_CREAT) && (flags & O_EXCL)) {
    R.errno = EEXIST;
    return -1;
  }
  if (!node) {
    if (!(flags & O_CREAT)) {
      R.errno = ENOENT;
      return -1;
    }
    node = new Node();
    files.set(p, node);
    changed(p);
  }
  const acc = flags & O_ACCMODE;
  if (flags & O_TRUNC && acc !== 0) {
    node.size = 0;
    changed(p);
  }
  return newFd({ node, path: p, pos: 0, read: acc === 0 || acc === O_RDWR, write: acc === O_WRONLY || acc === O_RDWR, append: !!(flags & O_APPEND) });
}

export function creat(path: Ptr, mode: number): number {
  return open(path, O_WRONLY | O_CREAT | O_TRUNC, mode);
}

export function close(fd: number): number {
  if (!fds.delete(fd)) {
    R.errno = EBADF;
    return -1;
  }
  return 0;
}

const TRACE = typeof process !== 'undefined' && !!process.env?.NH_TRACE_IO;

export function read(fd: number, buf: any, n: number): number {
  const f = fds.get(fd);
  if (TRACE) console.error(`read(${fd} ${f?.path}@${f?.pos}, ${n}) of ${f?.node.size}`);
  if (!f || !f.read) {
    R.errno = EBADF;
    return -1;
  }
  const k = Math.max(0, Math.min(n, f.node.size - f.pos));
  if (k > 0) {
    const bytes = f.node.data.slice(f.pos, f.pos + k);
    if (k < n) {
      // a short read: only the bytes that are there
      const full = memBytes(buf, n);
      full.set(bytes);
      memStore(buf, full, n);
    } else memStore(buf, bytes, n);
  }
  f.pos += k;
  return k;
}

function writeBytes(fd: number, bytes: Uint8Array): number {
  if (fd === 1 || fd === 2) {
    if (fd === 1) termWrite(bytes);
    else platform().stderr(bytes);
    return bytes.length;
  }
  const f = fds.get(fd);
  if (!f || !f.write) {
    R.errno = EBADF;
    return -1;
  }
  if (f.append) f.pos = f.node.size;
  f.node.ensure(f.pos + bytes.length);
  f.node.data.set(bytes, f.pos);
  f.pos += bytes.length;
  if (f.pos > f.node.size) f.node.size = f.pos;
  changed(f.path);
  return bytes.length;
}

export function write(fd: number, buf: any, n: number): number {
  return writeBytes(fd, memBytes(buf, n));
}

export function lseek(fd: number, off: number, whence: number): number {
  const f = fds.get(fd);
  if (!f) {
    R.errno = EBADF;
    return -1;
  }
  f.pos = whence === 0 ? off : whence === 1 ? f.pos + off : f.node.size + off;
  return f.pos;
}

export function unlink(path: Ptr): number {
  const p = normPath(jstr(path));
  if (!files.delete(p)) {
    R.errno = ENOENT;
    return -1;
  }
  changed(p);
  return 0;
}

export function rename(a: Ptr, b: Ptr): number {
  const pa = normPath(jstr(a)), pb = normPath(jstr(b));
  const n = files.get(pa);
  if (!n) {
    R.errno = ENOENT;
    return -1;
  }
  files.delete(pa);
  files.set(pb, n);
  changed(pa);
  changed(pb);
  return 0;
}

export function link(a: Ptr, b: Ptr): number {
  const pa = normPath(jstr(a)), pb = normPath(jstr(b));
  const n = files.get(pa);
  if (!n) {
    R.errno = ENOENT;
    return -1;
  }
  if (files.has(pb)) {
    R.errno = EEXIST;
    return -1;
  }
  files.set(pb, n);
  changed(pb);
  return 0;
}

function isDir(p: string): boolean {
  if (p === '') return true;
  for (const k of files.keys()) if (k.startsWith(p + '/')) return true;
  return p === 'save';
}

export function access(path: Ptr, _mode: number): number {
  const p = normPath(jstr(path));
  if (files.has(p) || isDir(p)) return 0;
  R.errno = ENOENT;
  return -1;
}

function fillStat(st: any, node: Node | null, dir: boolean): void {
  if (!st) return;
  const set = (k: string, v: number) => {
    if (k in st) st[k] = v;
  };
  set('st_size', node ? node.size : 4096);
  set('st_mode', dir ? 0o40755 : 0o100644);
  set('st_nlink', 1);
  set('st_uid', 1000);
  set('st_gid', 1000);
  set('st_ino', 1);
  set('st_dev', 1);
  if (st.st_mtim) st.st_mtim.tv_sec = node ? node.mtime : 0;
}

export function stat(path: Ptr, st: any): number {
  const p = normPath(jstr(path));
  const n = files.get(p);
  if (!n && !isDir(p)) {
    R.errno = ENOENT;
    return -1;
  }
  fillStat(st, n ?? null, !n);
  return 0;
}

export function fstat(fd: number, st: any): number {
  const f = fds.get(fd);
  if (!f) {
    R.errno = EBADF;
    return -1;
  }
  fillStat(st, f.node, false);
  return 0;
}

export function chmod(_p: Ptr, _m: number): number {
  return 0;
}

export function umask(_m: number): number {
  return 0o022;
}

export function fcntl(_fd: number, _cmd: number, ..._a: any[]): number {
  return 0;
}

export function chdir(_p: Ptr): number {
  return 0;
}

export function getcwd(buf: Ptr, _n: number): Ptr {
  putstr(buf, '/nethack');
  return buf;
}

// ---- the terminal: what the program writes to standard output ----
let term: number[] = [];

export function termWrite(bytes: Uint8Array | number[]): void {
  for (let i = 0; i < bytes.length; i++) term.push(bytes[i] & 255);
}

/** the bytes written to the terminal since the last call */
export function termTake(): number[] {
  const t = term;
  term = [];
  return t;
}

// ---- stdio ----
export class CFile {
  node: Node | null;
  path: string;
  fd: number;
  private ownPos = 0;
  /** a stream on a file descriptor (fdopen, fileno) shares its position, as C's do */
  shared: { pos: number } | null = null;
  get pos(): number {
    return this.shared ? this.shared.pos : this.ownPos;
  }
  set pos(v: number) {
    if (this.shared) this.shared.pos = v;
    else this.ownPos = v;
  }
  readable: boolean;
  writable: boolean;
  append = false;
  eof = false;
  err = false;
  ungot: number[] = [];
  constructor(node: Node | null, fd: number, readable: boolean, writable: boolean, path = '') {
    this.node = node;
    this.fd = fd;
    this.readable = readable;
    this.writable = writable;
    this.path = path;
  }
  putBytes(bytes: Uint8Array | number[]): void {
    if (this.fd === 1) {
      termWrite(bytes);
      return;
    }
    if (this.fd === 2) {
      platform().stderr(Uint8Array.from(bytes));
      return;
    }
    const n = this.node!;
    if (this.append) this.pos = n.size;
    n.ensure(this.pos + bytes.length);
    for (let i = 0; i < bytes.length; i++) n.data[this.pos + i] = bytes[i];
    this.pos += bytes.length;
    if (this.pos > n.size) n.size = this.pos;
    changed(this.path);
  }
  getByte(): number {
    if (this.ungot.length) return this.ungot.pop()!;
    const n = this.node;
    if (!n || this.pos >= n.size) {
      this.eof = true;
      return -1;
    }
    return n.data[this.pos++];
  }
}

function strBytes(s: string): number[] {
  const out = new Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 255;
  return out;
}

export function fopen(path: Ptr, mode: Ptr): CFile | null {
  const p = normPath(jstr(path));
  const m = jstr(mode);
  let node = files.get(p);
  const plus = m.includes('+');
  if (m[0] === 'r') {
    if (!node) {
      R.errno = ENOENT;
      return null;
    }
    return new CFile(node, -1, true, plus, p);
  }
  if (!node) {
    node = new Node();
    files.set(p, node);
  }
  if (m[0] === 'w') node.size = 0;
  changed(p);
  const f = new CFile(node, -1, plus, true, p);
  if (m[0] === 'a') {
    f.append = true;
    f.pos = node.size;
  }
  return f;
}

export function fdopen(fd: number, mode: Ptr): CFile | null {
  const f = fds.get(fd);
  if (!f) return null;
  const m = jstr(mode);
  const c = new CFile(f.node, -1, m[0] === 'r' || m.includes('+'), m[0] !== 'r' || m.includes('+'), f.path);
  c.shared = f;
  return c;
}

export function freopen(path: Ptr, mode: Ptr, _f: CFile): CFile | null {
  return fopen(path, mode);
}

export function fclose(f: CFile | null): number {
  return f ? 0 : -1;
}

export function fflush(_f: CFile | null): number {
  return 0;
}

export function fileno(f: CFile): number {
  if (f.fd >= 0) return f.fd;
  const rec = { node: f.node!, path: f.path, pos: f.pos, read: f.readable, write: f.writable, append: f.append };
  f.fd = newFd(rec);
  f.shared = rec;
  return f.fd;
}

export function setbuf(_f: CFile, _b: any): void {}

export function clearerr(f: CFile): void {
  f.eof = false;
  f.err = false;
}

export function feof(f: CFile): number {
  return f.eof ? 1 : 0;
}

export function ferror(f: CFile): number {
  return f.err ? 1 : 0;
}

export function rewind(f: CFile): void {
  f.pos = 0;
  f.eof = false;
  f.ungot = [];
}

export function fseek(f: CFile, off: number, whence: number): number {
  const size = f.node ? f.node.size : 0;
  f.pos = whence === 0 ? off : whence === 1 ? f.pos + off : size + off;
  f.eof = false;
  f.ungot = [];
  return 0;
}

export function ftell(f: CFile): number {
  return f.pos - f.ungot.length;
}

export function fgets(buf: Ptr, n: number, f: CFile): Ptr | null {
  let i = 0;
  const a = buf.a;
  while (i < n - 1) {
    const c = f.getByte();
    if (c < 0) break;
    a[buf.o + i++] = c;
    if (c === 10) break;
  }
  if (i === 0) return null;
  a[buf.o + i] = 0;
  return buf;
}

export function fgetc_file(f: CFile): number {
  return f.getByte();
}

export function ungetc(c: number, f: CFile): number {
  f.ungot.push(c & 255);
  f.eof = false;
  return c;
}

export function fputs(s: Ptr, f: CFile): number {
  f.putBytes(strBytes(jstr(s)));
  return 1;
}

export function fputc(c: number, f: CFile): number {
  f.putBytes([c & 255]);
  return c & 255;
}

export function putc(c: number, f: CFile): number {
  return fputc(c, f);
}

export function putchar(c: number): number {
  term.push(c & 255);
  return c & 255;
}

export function puts(s: Ptr): number {
  termWrite(strBytes(jstr(s) + '\n'));
  return 1;
}

export function fread(p: any, size: number, n: number, f: CFile): number {
  const want = size * n;
  const node = f.node;
  if (!node) return 0;
  const k = Math.max(0, Math.min(want, node.size - f.pos));
  const bytes = new Uint8Array(want);
  bytes.set(node.data.subarray(f.pos, f.pos + k));
  if (k > 0) memStore(p, bytes, Math.floor(k / size) * size || k);
  f.pos += k;
  if (k < want) f.eof = true;
  return Math.floor(k / size);
}

export function fwrite(p: any, size: number, n: number, f: CFile): number {
  f.putBytes(memBytes(p, size * n));
  return n;
}

export function fprintf(f: CFile, fmt: Ptr, ...args: any[]): number {
  const s = format(jstr(fmt), args.length === 1 && args[0] instanceof VaList ? () => args[0].next() : (() => {
    let k = 0;
    return () => args[k++];
  })());
  f.putBytes(strBytes(s));
  return s.length;
}

export function vfprintf(f: CFile, fmt: Ptr, ap: VaList): number {
  return fprintf(f, fmt, ap);
}

export function printf(fmt: Ptr, ...args: any[]): number {
  return fprintf(R.stdout, fmt, ...args);
}

export function vprintf(fmt: Ptr, ap: VaList): number {
  return fprintf(R.stdout, fmt, ap);
}

export function perror(s: Ptr): void {
  platform().stderr(Uint8Array.from(strBytes(`${jstr(s)}: error ${R.errno}\n`)));
}

export function fscanf(f: CFile, fmt: Ptr, ...args: any[]): number {
  const node = f.node;
  if (!node) return -1;
  const format = jstr(fmt);
  // scan a window of the file, larger when the conversions run to its end
  for (let len = 1024; ; len *= 4) {
    const end = Math.min(node.size, f.pos + len);
    let rest = '';
    for (let i = f.pos; i < end; i++) rest += String.fromCharCode(node.data[i]);
    const [n, used] = scan(rest, format, args);
    if (used < rest.length || end === node.size) {
      f.pos += used;
      if (f.pos >= node.size) f.eof = true;
      return n;
    }
  }
}
