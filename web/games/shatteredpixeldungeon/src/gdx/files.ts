// @ts-nocheck
// libGDX 1.14.0's files (com.badlogic.gdx.Files, files.FileHandle; Apache-2.0, see core.ts) over file stores:
// a FileHandle names a path of a file type (Internal: the game's assets, read only; Local, External, Absolute:
// files the game writes), and the Files object of the backend maps each type to a FileStore.
import { $J, JObject, JString, defineLib, IOException } from '../jre/lang.ts';
import { ByteArrayInputStream, BufferedInputStream, InputStreamReader, BufferedReader, OutputStream, OutputStreamWriter, utf8DecodeJava } from '../jre/io.ts';
import { Files_FileType, GdxRuntimeException } from './core.ts';

/** Where the files of one file type are: a backend's storage (memory, a directory in node, assets over HTTP). */
export interface FileStore {
  /** The file's bytes, or null when there is no such file (or it is a directory). */
  read(path: string): Uint8Array | null;
  /** The names in a directory, or null when it is not one. */
  list(path: string): string[] | null;
  isDirectory(path: string): boolean;
  /** Writes a file (a store that cannot be written throws). */
  write?(path: string, data: Uint8Array, append: boolean): void;
  delete?(path: string): boolean;
  lastModified?(path: string): number;
}

/** java.io.File's normal form of a path: no repeated or trailing separators. */
export function normalPath(p: string): string {
  let s = p.replace(/\\/g, '/').replace(/\/+/g, '/');
  if (s.length > 1 && s.endsWith('/')) s = s.substring(0, s.length - 1);
  return s;
}

/** A writable store in memory (what the game writes in tests; a browser backend persists it). */
export class MemoryFileStore implements FileStore {
  files = new Map<string, { data: Uint8Array; time: number }>();
  read(path: string) { const f = this.files.get(normalPath(path)); return f ? f.data : null; }
  list(path: string) {
    const dir = normalPath(path);
    const pre = dir === '' ? '' : dir === '/' ? '/' : dir + '/';
    const names = new Set<string>();
    for (const k of this.files.keys()) if (k.startsWith(pre)) names.add(k.substring(pre.length).split('/')[0]);
    return names.size || this.isDirectory(path) ? [...names] : null;
  }
  isDirectory(path: string) {
    const dir = normalPath(path);
    const pre = dir === '/' ? '/' : dir + '/';
    for (const k of this.files.keys()) if (k.startsWith(pre)) return true;
    return false;
  }
  write(path: string, data: Uint8Array, append: boolean) {
    const p = normalPath(path);
    const old = this.files.get(p);
    let d = data;
    if (append && old) {
      d = new Uint8Array(old.data.length + data.length);
      d.set(old.data);
      d.set(data, old.data.length);
    }
    this.files.set(p, { data: d, time: Number($J.system_currentTimeMillis()) });
  }
  delete(path: string) {
    const p = normalPath(path);
    if (this.files.delete(p)) return true;
    let any = false;
    for (const k of [...this.files.keys()]) if (k.startsWith(p + '/')) { this.files.delete(k); any = true; }
    return any;
  }
  lastModified(path: string) { const f = this.files.get(normalPath(path)); return f ? f.time : 0; }
}

/** An output stream that writes its bytes to a store when it is flushed or closed. */
class StoreOutputStream extends OutputStream {
  store: FileStore;
  path: string;
  append: boolean;
  constructor(store: FileStore, path: string, append: boolean) {
    super();
    this.store = store;
    this.path = path;
    this.append = append;
    if (!append) store.write(path, new Uint8Array(0), false);
  }
  flush() {
    if (this.chunks.length) {
      this.store.write(this.path, this.bytes(), true);
      this.chunks = [];
    }
  }
  close() { this.flush(); }
}

/** com.badlogic.gdx.files.FileHandle. */
export class FileHandle extends JObject {
  p: string;
  t: any;
  constructor(path: string = '', type: any = Files_FileType.Absolute) {
    super();
    this.p = normalPath(path);
    this.t = type;
  }
  _FileHandle(path: string): this { this.p = normalPath(path); this.t = Files_FileType.Absolute; return this; }
  store(): FileStore {
    const files = $J.load('com.badlogic.gdx.Gdx').files;
    return files.store(this.t);
  }
  path() { return this.p; }
  name() { return this.p.substring(this.p.lastIndexOf('/') + 1); }
  extension() { const n = this.name(); const i = n.lastIndexOf('.'); return i < 0 ? '' : n.substring(i + 1); }
  nameWithoutExtension() { const n = this.name(); const i = n.lastIndexOf('.'); return i < 0 ? n : n.substring(0, i); }
  pathWithoutExtension() { const i = this.p.lastIndexOf('.'); return i < 0 ? this.p : this.p.substring(0, i); }
  type() { return this.t; }
  parentPath(): string | null {
    const i = this.p.lastIndexOf('/');
    if (i < 0) return null;
    return i === 0 ? '/' : this.p.substring(0, i);
  }
  child(name: string) { return new FileHandle(this.p.length === 0 ? name : this.p + '/' + name, this.t); }
  sibling(name: string) {
    if (this.p.length === 0) throw new GdxRuntimeException('Cannot get the sibling of the root.');
    const parent = this.parentPath();
    return new FileHandle(parent == null ? name : parent + '/' + name, this.t);
  }
  parent() {
    const parent = this.parentPath();
    return new FileHandle(parent ?? (this.t === Files_FileType.Absolute ? '/' : ''), this.t);
  }
  bytesOrThrow(): Uint8Array {
    const d = this.store().read(this.p);
    if (d == null) {
      if (this.store().isDirectory(this.p)) throw new GdxRuntimeException('Cannot open a stream to a directory: ' + this.p + ' (' + this.t + ')');
      throw new GdxRuntimeException('File not found: ' + this.p + ' (' + this.t + ')');
    }
    return d;
  }
  read(bufferSize?: number) {
    const s = new ByteArrayInputStream(this.bytesOrThrow());
    return bufferSize === undefined ? s : new BufferedInputStream(s, bufferSize);
  }
  reader(a?: any, _b?: any) {
    const r = new InputStreamReader(this.read());
    return typeof a === 'number' ? new BufferedReader(r, a) : r;
  }
  readString(_charset?: string) { return utf8DecodeJava(this.bytesOrThrow()); }
  readBytes() { return Array.from(this.bytesOrThrow(), (b) => (b << 24) >> 24); }
  /** map(): the file's bytes as a ByteBuffer (libGDX maps the file; here it is read). */
  map(_mode?: any) {
    const d = this.bytesOrThrow();
    return $J.load('java.nio.ByteBuffer').wrap(new Int8Array(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength)));
  }
  checkWritable() {
    if (this.t === Files_FileType.Classpath) throw new GdxRuntimeException('Cannot write to a classpath file: ' + this.p);
    if (this.t === Files_FileType.Internal) throw new GdxRuntimeException('Cannot write to an internal file: ' + this.p);
  }
  write(append: any, _size?: number) {
    if (typeof append !== 'boolean') {
      // write(InputStream input, boolean append)
      this.checkWritable();
      this.store().write(this.p, append.readAllBytes(), _size as any);
      return;
    }
    this.checkWritable();
    return new StoreOutputStream(this.store(), this.p, append);
  }
  writer(append: boolean, _charset?: string) { return new OutputStreamWriter(this.write(append)); }
  writeString(s: string, append: boolean, _charset?: string) {
    this.checkWritable();
    this.store().write(this.p, new TextEncoder().encode(s), append);
  }
  writeBytes(bytes: any, a: any, b?: any, c?: any) {
    this.checkWritable();
    let data: Uint8Array, append: boolean;
    if (typeof a === 'boolean') { data = Uint8Array.from(bytes, (x: number) => x & 0xff); append = a; }
    else { data = Uint8Array.from(bytes.slice(a, a + b), (x: number) => x & 0xff); append = c; }
    this.store().write(this.p, data, append);
  }
  list(filter?: any) {
    const names = this.store().list(this.p) ?? [];
    let hs = names.map((n) => this.child(n));
    if (typeof filter === 'string') hs = hs.filter((h) => h.name().endsWith(filter));
    return hs;
  }
  isDirectory() { return this.t !== Files_FileType.Classpath && this.store().isDirectory(this.p); }
  exists() { const s = this.store(); return s.read(this.p) != null || s.isDirectory(this.p); }
  mkdirs() {}
  delete() { this.checkWritable(); const s = this.store(); return s.read(this.p) != null && s.delete(this.p); }
  deleteDirectory() { this.checkWritable(); const s = this.store(); return s.delete(this.p); }
  emptyDirectory() { for (const h of this.list()) h.isDirectory() ? h.deleteDirectory() : h.delete(); }
  copyTo(dest: FileHandle) { dest.writeBytes(this.readBytes(), false); }
  moveTo(dest: FileHandle) {
    if (this.t === Files_FileType.Classpath || this.t === Files_FileType.Internal) throw new GdxRuntimeException('Cannot move a ' + this.t + ' file: ' + this.p);
    this.copyTo(dest);
    this.delete();
  }
  length(): bigint { const d = this.store().read(this.p); return BigInt(d ? d.length : 0); }
  lastModified(): bigint { const s = this.store(); return BigInt(s.lastModified ? s.lastModified(this.p) : 0); }
  equals(o: any) { return o instanceof FileHandle && o.t === this.t && o.p === this.p; }
  hashCode() { let h = 1; h = (h * 37 + this.t.hashCode()) | 0; h = (h * 67 + JString.hashCode(this.p)) | 0; return h; }
  toString() { return this.p; }
}
defineLib(FileHandle, 'com.badlogic.gdx.files.FileHandle');

/**
 * com.badlogic.gdx.Files: file handles by type, each type's files in a store. Internal files are the game's
 * assets (read only); Local, External and Absolute files share one writable store unless given their own.
 */
export class StoreFiles extends JObject {
  stores = new Map<any, FileStore>();
  constructor(internal: FileStore, writable: FileStore = new MemoryFileStore()) {
    super();
    this.stores.set(Files_FileType.Internal, internal);
    this.stores.set(Files_FileType.Classpath, internal);
    for (const t of [Files_FileType.Local, Files_FileType.External, Files_FileType.Absolute]) this.stores.set(t, writable);
  }
  store(t: any): FileStore {
    const s = this.stores.get(t);
    if (!s) throw new IOException('no store for ' + t);
    return s;
  }
  getFileHandle(path: string, type: any) { return new FileHandle(path, type); }
  classpath(p: string) { return new FileHandle(p, Files_FileType.Classpath); }
  internal(p: string) { return new FileHandle(p, Files_FileType.Internal); }
  external(p: string) { return new FileHandle(p, Files_FileType.External); }
  absolute(p: string) { return new FileHandle(p, Files_FileType.Absolute); }
  local(p: string) { return new FileHandle(p, Files_FileType.Local); }
  getExternalStoragePath() { return ''; }
  isExternalStorageAvailable() { return true; }
  getLocalStoragePath() { return ''; }
  isLocalStorageAvailable() { return true; }
}
defineLib(StoreFiles, 'com.badlogic.gdx.Files', { kind: 'interface' });
