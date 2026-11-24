// OpenClonk port: the file system the translated engine sees through the C library (open, read, stat, opendir,
// fopen, ...). It is a tree in memory: the game's content (the original's packed groups, downloaded by the page,
// or in tests read from a folder on disk through a host reader) and the files the engine writes (its config,
// logs, savegames), which the page may keep in storage. Paths are absolute, '/' separated.
import { Ptr } from './ptr.ts';

const enc = new TextEncoder();
const dec = new TextDecoder();

export const S_IFDIR = 0o040000;
export const S_IFREG = 0o100000;

/** errno values (glibc) the engine looks at */
export const ENOENT = 2, EEXIST = 17, ENOTDIR = 20, EISDIR = 21, EINVAL = 22, ENOTEMPTY = 39, EBADF = 9, EAGAIN = 11;

interface FileNode { kind: 'file'; data: Uint8Array; size: number; mtime: number }
interface DirNode { kind: 'dir'; items: Map<string, Node>; mtime: number; host?: string; listed?: boolean }
type Node = FileNode | DirNode;

/** reads a folder of the host (tests: node's fs); the browser has none */
export interface HostReader {
  list(path: string): { name: string; dir: boolean }[] | null;
  read(path: string): Uint8Array | null;
}
let host: HostReader | null = null;

const root: DirNode = { kind: 'dir', items: new Map(), mtime: 0 };
/** errno: one cell, which the C library's functions set and __errno_location points to (CreatePath reads it) */
const errnoCell = new Int32Array(1);
export const fsState = {
  get errno(): number { return errnoCell[0]; },
  set errno(v: number) { errnoCell[0] = v; },
  cwd: '/',
  /** the paths the engine changed since the page last looked (opened for writing, removed, renamed, made): the page
   *  keeps the player's files in storage (src/storage.ts) */
  changed: new Set<string>(),
};

/** forgets the changes below a folder (the page's own temporary files) */
export function takeChangesOf(prefix: string): void {
  for (const p of fsState.changed) if (p.startsWith(prefix)) fsState.changed.delete(p);
}

/** the paths changed since the last call */
export function takeChanges(): string[] {
  const out = [...fsState.changed];
  fsState.changed.clear();
  return out;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function split(path: string): string[] {
  const out: string[] = [];
  for (const p of path.split('/')) {
    if (!p || p === '.') continue;
    if (p === '..') out.pop();
    else out.push(p);
  }
  return out;
}

export function absolute(path: string): string {
  return '/' + split(path.startsWith('/') ? path : fsState.cwd + '/' + path).join('/');
}

function fill(d: DirNode): void {
  if (d.listed || !d.host || !host) return;
  d.listed = true;
  for (const it of host.list(d.host) ?? []) {
    if (d.items.has(it.name)) continue;
    const p = d.host + '/' + it.name;
    if (it.dir) d.items.set(it.name, { kind: 'dir', items: new Map(), mtime: 0, host: p });
    else d.items.set(it.name, { kind: 'file', data: null as any, size: -1, mtime: 0, host: p } as any);
  }
}

function load(f: FileNode): FileNode {
  const h = (f as any).host;
  if (f.data === null && h && host) {
    f.data = host.read(h) ?? new Uint8Array(0);
    f.size = f.data.length;
  }
  return f;
}

function lookup(path: string): Node | null {
  let n: Node = root;
  for (const p of split(absolute(path))) {
    if (n.kind !== 'dir') return null;
    fill(n);
    const c = n.items.get(p);
    if (!c) return null;
    n = c;
  }
  return n.kind === 'file' ? load(n) : n;
}

function parent(path: string): [DirNode | null, string] {
  const parts = split(absolute(path));
  const name = parts.pop() ?? '';
  const d = lookup('/' + parts.join('/'));
  return [d && d.kind === 'dir' ? d : null, name];
}

function mkdirs(path: string): DirNode {
  let n: DirNode = root;
  for (const p of split(absolute(path))) {
    fill(n);
    let c = n.items.get(p);
    if (!c) {
      c = { kind: 'dir', items: new Map(), mtime: now() };
      n.items.set(p, c);
    }
    if (c.kind !== 'dir') throw new Error(`fs: ${path}: not a folder`);
    n = c;
  }
  return n;
}

// ---- setting up (the page, the tests)

/** puts a file into the tree (creating its folders) */
export function addFile(path: string, data: Uint8Array): void {
  const parts = split(absolute(path));
  const name = parts.pop()!;
  mkdirs('/' + parts.join('/')).items.set(name, { kind: 'file', data, size: data.length, mtime: 0 });
}

/** makes a folder of the host appear at path (read lazily; writes stay in memory) */
export function mountHost(path: string, hostPath: string, reader: HostReader): void {
  host = reader;
  const parts = split(absolute(path));
  const name = parts.pop()!;
  mkdirs('/' + parts.join('/')).items.set(name, { kind: 'dir', items: new Map(), mtime: 0, host: hostPath });
}

export function readFile(path: string): Uint8Array | null {
  const n = lookup(path);
  return n && n.kind === 'file' ? n.data.subarray(0, n.size) : null;
}

export function isDir(path: string): boolean {
  const n = lookup(path);
  return !!n && n.kind === 'dir';
}

/** removes a file or a folder with everything in it (the page, when storage says a file is gone) */
export function removePath(path: string): void {
  const [d, name] = parent(path);
  d?.items.delete(name);
}

export function listDir(path: string): string[] | null {
  const n = lookup(path);
  if (!n || n.kind !== 'dir') return null;
  fill(n);
  return [...n.items.keys()];
}

/** empties the tree (tests) */
export function resetFs(): void {
  root.items.clear();
  fsState.cwd = '/';
  fsState.errno = 0;
}

// ---- the C library

function str(p: Ptr | null): string {
  if (!p) return '';
  const a = p.a as Int8Array;
  let e = p.o;
  while (e < a.length && a[e]) e++;
  return dec.decode(new Uint8Array(a.buffer, a.byteOffset + p.o, e - p.o));
}

function fail(errno: number): number {
  fsState.errno = errno;
  return -1;
}

interface Timer { interval: number; next: number }
interface Fd { node: FileNode; pos: number; read: boolean; write: boolean; append: boolean; path: string; event?: { count: bigint }; timer?: Timer }
const fds: (Fd | null)[] = [null, null, null];

const O_WRONLY = 1, O_RDWR = 2, O_CREAT = 0o100, O_EXCL = 0o200, O_TRUNC = 0o1000, O_APPEND = 0o2000;

export function c$open(path: Ptr, flags: number, _mode = 0): number {
  const p = str(path);
  let n = lookup(p);
  if (n && n.kind === 'dir') return (flags & 3) ? fail(EISDIR) : fail(EISDIR);
  if (!n) {
    if (!(flags & O_CREAT)) return fail(ENOENT);
    const [d, name] = parent(p);
    if (!d) return fail(ENOENT);
    n = { kind: 'file', data: new Uint8Array(0), size: 0, mtime: now() };
    d.items.set(name, n);
  } else if ((flags & O_CREAT) && (flags & O_EXCL)) {
    return fail(EEXIST);
  }
  const f = n as FileNode;
  const acc = flags & 3;
  if ((flags & O_TRUNC) && acc !== 0) {
    f.data = new Uint8Array(0);
    f.size = 0;
  }
  if (acc !== 0) fsState.changed.add(absolute(p));
  fds.push({ node: f, pos: 0, read: acc !== O_WRONLY, write: acc !== 0, append: !!(flags & O_APPEND), path: absolute(p) });
  return fds.length - 1;
}

/**
 * eventfd(initval, flags) (platform/StdSchedulerPoll.cpp: the scheduler's CStdNotifyProc, which wakes the main loop):
 * a counter that write adds to and read takes
 */
export function c$eventfd(initval: number, _flags: number): number {
  fds.push({ node: { kind: 'file', data: new Uint8Array(0), size: 0, mtime: 0 } as FileNode, pos: 0, read: true, write: true,
    append: false, path: '', event: { count: BigInt(initval) } });
  return fds.length - 1;
}
/**
 * poll(fds, n, timeout) over the scheduler's descriptors (StdScheduler::DoScheduleProcs): an eventfd is readable when
 * its counter is not 0; nothing else becomes readable in the page (no network, no pipes). It never waits: the page
 * calls the scheduler once per animation frame with a timeout of 0.
 */
export function c$poll(list: any, n: number, _timeout: number): number {
  const POLLIN = 1;
  let ready = 0;
  for (let i = 0; i < n; i++) {
    const p = list instanceof Ptr ? list.a[list.o + i] : list[i];
    if (!p) continue;
    const f = fds[p.fd];
    const readable = f?.event ? f.event.count !== 0n : f?.timer ? f.timer.next !== 0 && monotonic() >= f.timer.next : false;
    p.revents = readable && (p.events & POLLIN) ? POLLIN : 0;
    if (p.revents) ready++;
  }
  return ready;
}

/** the uint64_t an eventfd or timerfd reads or writes: a 64-bit local (a box) or 8 bytes */
function put64(buf: Ptr, v: bigint): void {
  const a = buf.a;
  if (a instanceof BigUint64Array || a instanceof BigInt64Array) a[buf.o] = v;
  else if (ArrayBuffer.isView(a) && (a as Uint8Array).BYTES_PER_ELEMENT === 1) new DataView(view(buf).buffer, view(buf).byteOffset, 8).setBigUint64(0, v, true);
  else a[buf.o] = typeof a[buf.o] === 'number' ? Number(v) : v;
}
function get64(buf: Ptr): bigint {
  const a = buf.a;
  if (a instanceof BigUint64Array || a instanceof BigInt64Array) return BigInt.asUintN(64, a[buf.o]);
  if (ArrayBuffer.isView(a) && (a as Uint8Array).BYTES_PER_ELEMENT === 1) return new DataView(view(buf).buffer, view(buf).byteOffset, 8).getBigUint64(0, true);
  return BigInt(a[buf.o]);
}

/** CLOCK_MONOTONIC in milliseconds */
const monotonic = () => performance.now();
/** the expirations of a timer up to now, which are taken (read): a periodic timer goes on from its schedule */
function expirations(t: Timer): number {
  const now = monotonic();
  if (!t.next || now < t.next) return 0;
  if (!t.interval) { t.next = 0; return 1; }
  const k = Math.floor((now - t.next) / t.interval) + 1;
  t.next += k * t.interval;
  return k;
}
const ms = (ts: any) => Number(ts.tv_sec) * 1000 + Number(ts.tv_nsec) / 1e6;
/**
 * timerfd_create/settime/gettime (platform/StdSchedulerPoll.cpp: CStdMultimediaTimerProc, the game timer of the
 * original's Linux build, C4ApplicationGameTimer): a timer on CLOCK_MONOTONIC (performance.now()) that becomes readable
 * at its expiry and then every interval, as the kernel's; read takes the expirations
 */
export function c$timerfd_create(_clock: number, _flags: number): number {
  fds.push({ node: { kind: 'file', data: new Uint8Array(0), size: 0, mtime: 0 } as FileNode, pos: 0, read: true, write: false,
    append: false, path: '', timer: { interval: 0, next: 0 } });
  return fds.length - 1;
}
export function c$timerfd_settime(fd: number, _flags: number, nv: any, old: any): number {
  const t = fds[fd]?.timer;
  if (!t) return fail(EINVAL);
  if (old) c$timerfd_gettime(fd, old);
  const value = ms(nv.it_value);
  t.interval = ms(nv.it_interval);
  t.next = value ? monotonic() + value : 0;
  return 0;
}
export function c$timerfd_gettime(fd: number, cur: any): number {
  const t = fds[fd]?.timer;
  if (!t) return fail(EINVAL);
  const left = t.next ? Math.max(0, t.next - monotonic()) : 0;
  const set = (ts: any, v: number) => { ts.tv_sec = Math.floor(v / 1000); ts.tv_nsec = Math.round((v % 1000) * 1e6); };
  set(cur.it_value, left);
  set(cur.it_interval, t.interval);
  return 0;
}

export function c$close(fd: number): number {
  if (!fds[fd]) return fail(EBADF);
  fds[fd] = null;
  return 0;
}

function view(p: Ptr): Uint8Array {
  const a = p.a as Int8Array;
  return new Uint8Array(a.buffer, a.byteOffset + p.o * (a.BYTES_PER_ELEMENT ?? 1));
}

export function c$read(fd: number, buf: Ptr, n: number): number {
  const f = fds[fd];
  if (f?.timer) {
    // a timerfd: the number of expirations since the last read (EAGAIN if none: the game timer's is non-blocking)
    const k = expirations(f.timer);
    if (!k || n < 8) return fail(EAGAIN);
    put64(buf, BigInt(k));
    return 8;
  }
  if (f?.event) {
    // an eventfd: its 8-byte counter, then 0 (EAGAIN while it is 0: the scheduler's are non-blocking)
    if (f.event.count === 0n || n < 8) return fail(EAGAIN);
    put64(buf, f.event.count);
    f.event.count = 0n;
    return 8;
  }
  if (!f || !f.read) return fail(EBADF);
  const k = Math.max(0, Math.min(n, f.node.size - f.pos));
  view(buf).set(f.node.data.subarray(f.pos, f.pos + k));
  f.pos += k;
  return k;
}

function grow(node: FileNode, size: number): void {
  if (size <= node.data.length) return;
  const d = new Uint8Array(Math.max(size, node.data.length * 2, 256));
  d.set(node.data.subarray(0, node.size));
  node.data = d;
}

function put(f: Fd, b: Uint8Array): number {
  if (f.append) f.pos = f.node.size;
  grow(f.node, f.pos + b.length);
  f.node.data.set(b, f.pos);
  f.pos += b.length;
  if (f.pos > f.node.size) f.node.size = f.pos;
  f.node.mtime = now();
  if (f.path) fsState.changed.add(f.path);
  return b.length;
}

export function c$write(fd: number, buf: Ptr, n: number): number {
  const f = fds[fd];
  if (f?.event) {
    if (n < 8) return fail(EINVAL);
    f.event.count += get64(buf);
    return 8;
  }
  if (!f || !f.write) return fail(EBADF);
  return put(f, view(buf).subarray(0, n));
}

export function c$lseek(fd: number, off: number, whence: number): number {
  const f = fds[fd];
  if (!f) return fail(EBADF);
  const p = whence === 0 ? off : whence === 1 ? f.pos + off : f.node.size + off;
  if (p < 0) return fail(EINVAL);
  f.pos = p;
  return p;
}

export function fdBytes(fd: number): Uint8Array | null {
  const f = fds[fd];
  return f ? f.node.data.subarray(0, f.node.size) : null;
}

// stat: the engine reads st_mode, st_size, st_mtime of the struct it passes

function statOf(n: Node, st: any): number {
  st.st_mode = n.kind === 'dir' ? S_IFDIR | 0o755 : S_IFREG | 0o644;
  st.st_size = n.kind === 'file' ? n.size : 4096;
  st.st_mtime = n.mtime;
  // glibc's struct stat has the times as timespecs (st_mtime is a macro for st_mtim.tv_sec: StdFile.cpp FileTime)
  st.st_mtim = { tv_sec: Math.floor(n.mtime), tv_nsec: 0 };
  return 0;
}

export function c$stat(path: Ptr, st: any): number {
  const n = lookup(str(path));
  return n ? statOf(n, st) : fail(ENOENT);
}
export const c$lstat = c$stat;

export function c$fstat(fd: number, st: any): number {
  const f = fds[fd];
  return f ? statOf(f.node, st) : fail(EBADF);
}

export function c$access(path: Ptr, _mode: number): number {
  return lookup(str(path)) ? 0 : fail(ENOENT);
}

export function c$mkdir(path: Ptr, _mode = 0): number {
  const p = str(path);
  if (lookup(p)) return fail(EEXIST);
  const [d, name] = parent(p);
  if (!d) return fail(ENOENT);
  d.items.set(name, { kind: 'dir', items: new Map(), mtime: now() });
  fsState.changed.add(absolute(p));
  return 0;
}

export function c$rmdir(path: Ptr): number {
  const p = str(path);
  const n = lookup(p);
  if (!n) return fail(ENOENT);
  if (n.kind !== 'dir') return fail(ENOTDIR);
  fill(n);
  if (n.items.size) return fail(ENOTEMPTY);
  const [d, name] = parent(p);
  d!.items.delete(name);
  fsState.changed.add(absolute(p));
  return 0;
}

export function c$unlink(path: Ptr): number {
  const p = str(path);
  const n = lookup(p);
  if (!n) return fail(ENOENT);
  if (n.kind === 'dir') return fail(EISDIR);
  const [d, name] = parent(p);
  d!.items.delete(name);
  fsState.changed.add(absolute(p));
  return 0;
}
export const c$remove = (path: Ptr): number => {
  const n = lookup(str(path));
  return n && n.kind === 'dir' ? c$rmdir(path) : c$unlink(path);
};

export function c$rename(from: Ptr, to: Ptr): number {
  const a = str(from), b = str(to);
  const n = lookup(a);
  if (!n) return fail(ENOENT);
  const [da, na] = parent(a);
  const [db, nb] = parent(b);
  if (!db) return fail(ENOENT);
  da!.items.delete(na);
  db.items.set(nb, n);
  fsState.changed.add(absolute(a));
  fsState.changed.add(absolute(b));
  return 0;
}

function cstr(s: string): Ptr {
  const b = enc.encode(s);
  const a = new Int8Array(b.length + 1);
  a.set(b);
  return new Ptr(a, 0);
}

function copyTo(dst: Ptr, s: string): Ptr {
  const b = enc.encode(s);
  for (let i = 0; i < b.length; i++) dst.a[dst.o + i] = (b[i] << 24) >> 24;
  dst.a[dst.o + b.length] = 0;
  return dst;
}

export function c$chmod(_path: Ptr, _mode: number): number { return 0; }
export function c$flock(): number { return 0; }
export function c$fork(): number { return -1; }
export function c$pthread_self(): number { return 0; }
export function c$pthread_create(): number { return 0; }
export function c$pthread_join(): number { return 0; }
export function c$gethostname(): number { return -1; }
/**
 * readlink("/proc/self/exe") (C4ConfigGeneral::DeterminePaths: ExePath): the installed game's binary, where the
 * original's Linux build (CMAKE_INSTALL_PREFIX /usr/local) puts it; the file system has no other symbolic links
 */
export function c$readlink(path?: Ptr, buf?: Ptr, size = 0): number {
  if (!path || !buf || str(path) !== '/proc/self/exe') return fail(EINVAL);
  const exe = '/usr/local/bin/openclonk';
  const n = Math.min(exe.length, size);
  for (let i = 0; i < n; i++) buf.a[buf.o + i] = exe.charCodeAt(i);
  return n;
}
export function c$__errno_location(): Ptr { return new Ptr(errnoCell, 0); }

export function c$realpath(path: Ptr, out: Ptr | null): Ptr | null {
  const p = absolute(str(path));
  if (!lookup(p)) {
    fsState.errno = ENOENT;
    return null;
  }
  return out ? copyTo(out, p) : cstr(p);
}

export function c$getcwd(buf: Ptr, _n: number): Ptr {
  return copyTo(buf, fsState.cwd);
}

export function c$chdir(path: Ptr): number {
  const p = absolute(str(path));
  const n = lookup(p);
  if (!n || n.kind !== 'dir') return fail(ENOENT);
  fsState.cwd = p;
  return 0;
}

// directories: DIR* and struct dirent* are objects

export function c$opendir(path: Ptr): any {
  const n = lookup(str(path));
  if (!n || n.kind !== 'dir') {
    fsState.errno = n ? ENOTDIR : ENOENT;
    return null;
  }
  fill(n);
  return { names: ['.', '..', ...n.items.keys()], i: 0, ent: { d_name: null as any, d_type: 0 } };
}

export function c$readdir(d: any): any {
  if (!d || d.i >= d.names.length) return null;
  d.ent.d_name = cstr(d.names[d.i++]).a;
  return d.ent;
}

export function c$closedir(_d: any): number {
  return 0;
}

// FILE*: an object over a descriptor

export interface CFile { fd: number; eof: boolean; err: boolean; ungot: number }

export function c$fopen(path: Ptr, mode: Ptr): CFile | null {
  const m = str(mode);
  let flags = 0;
  if (m[0] === 'r') flags = m.includes('+') ? O_RDWR : 0;
  else if (m[0] === 'w') flags = (m.includes('+') ? O_RDWR : O_WRONLY) | O_CREAT | O_TRUNC;
  else if (m[0] === 'a') flags = (m.includes('+') ? O_RDWR : O_WRONLY) | O_CREAT | O_APPEND;
  const fd = c$open(path, flags);
  return fd < 0 ? null : { fd, eof: false, err: false, ungot: -1 };
}

export function c$fdopen(fd: number, _mode: Ptr): CFile | null {
  return fds[fd] ? { fd, eof: false, err: false, ungot: -1 } : null;
}

export function c$fileno(f: CFile): number {
  return f.fd;
}

export function c$fclose(f: CFile | null): number {
  if (!f) return -1;
  return c$close(f.fd);
}

export function c$fread(buf: Ptr, size: number, n: number, f: CFile): number {
  const want = size * n;
  if (!want) return 0;
  const k = c$read(f.fd, buf, want);
  if (k < want) f.eof = true;
  return size ? Math.floor(Math.max(k, 0) / size) : 0;
}

export function c$fwrite(buf: Ptr, size: number, n: number, f: CFile): number {
  if (f.fd <= 2) {
    fileWrite(f, view(buf).subarray(0, size * n));
    return n;
  }
  const k = c$write(f.fd, buf, size * n);
  return size ? Math.floor(Math.max(k, 0) / size) : 0;
}

/** writes bytes to a FILE (the standard streams are handled by libc.ts) */
export function fileWrite(f: CFile, b: Uint8Array): boolean {
  const fd = fds[f.fd];
  if (!fd) return false;
  put(fd, b);
  return true;
}

export function c$fseek(f: CFile, off: number, whence: number): number {
  f.eof = false;
  return c$lseek(f.fd, off, whence) < 0 ? -1 : 0;
}

export function c$ftell(f: CFile): number {
  const d = fds[f.fd];
  return d ? d.pos : -1;
}

export function c$rewind(f: CFile): void {
  c$fseek(f, 0, 0);
}

export function c$feof(f: CFile): number {
  return f.eof ? 1 : 0;
}

export function c$ferror(f: CFile): number {
  return f.err ? 1 : 0;
}

export function c$fgetc(f: CFile): number {
  const d = fds[f.fd];
  if (!d || d.pos >= d.node.size) {
    f.eof = true;
    return -1;
  }
  return d.node.data[d.pos++];
}

export function c$fgets(buf: Ptr, n: number, f: CFile): Ptr | null {
  let i = 0;
  while (i < n - 1) {
    const c = c$fgetc(f);
    if (c < 0) break;
    buf.a[buf.o + i++] = (c << 24) >> 24;
    if (c === 10) break;
  }
  if (!i) return null;
  buf.a[buf.o + i] = 0;
  return buf;
}

export function c$ftruncate(fd: number, size: number): number {
  const d = fds[fd];
  if (!d) return fail(EBADF);
  grow(d.node, size);
  if (size < d.node.size) d.node.data.fill(0, size, d.node.size);
  d.node.size = size;
  return 0;
}
