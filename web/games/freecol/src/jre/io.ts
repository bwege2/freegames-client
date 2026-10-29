// @ts-nocheck
// java.io, java.nio.file, java.net and java.util.zip over a virtual file system: FreeCol's data files
// come from the platform (assets in the browser, the reference data in tests), everything FreeCol
// writes (options, saves) lives in memory and the platform persists it.
import { zipSync, unzipSync } from 'fflate';
import {
  $J, JObject, JString, defineLib, str, stringHash, utf8Decode,
  IOException, FileNotFoundException, EOFException, UnsupportedOperationException, IllegalArgumentException,
  NullPointerException, URISyntaxException,
} from './lang.ts';
import { ArrayList, Random } from './util.ts';

/* ------------------------------------------------------------------ the virtual file system */

export interface FileProvider {
  /** Bytes of a read-only file, or null. */
  read(path: string): Uint8Array | null;
  /** Names in a read-only directory, or null if it is not one. */
  list(path: string): string[] | null;
  isDir(path: string): boolean;
  /** Whether a read-only file exists, without reading it (else read() tells). */
  has?(path: string): boolean;
}

export const vfs = {
  files: new Map<string, Uint8Array>(),
  mtimes: new Map<string, number>(),
  dirs: new Set<string>(['/']),
  provider: null as FileProvider | null,
  /** Called after a file is written or deleted (the platform saves it). */
  onWrite: null as ((path: string, data: Uint8Array | null) => void) | null,
  norm(p: string): string {
    if (!p.startsWith('/')) p = '/' + p;
    const parts: string[] = [];
    for (const s of p.split('/')) {
      if (s === '' || s === '.') continue;
      if (s === '..') parts.pop();
      else parts.push(s);
    }
    return '/' + parts.join('/');
  },
  read(p: string): Uint8Array | null {
    p = vfs.norm(p);
    const f = vfs.files.get(p);
    if (f) return f;
    return vfs.provider ? vfs.provider.read(p) : null;
  },
  write(p: string, data: Uint8Array) {
    p = vfs.norm(p);
    vfs.files.set(p, data);
    vfs.mtimes.set(p, $J.clock());
    let d = p.substring(0, p.lastIndexOf('/')) || '/';
    while (d !== '/' && !vfs.dirs.has(d)) {
      vfs.dirs.add(d);
      d = d.substring(0, d.lastIndexOf('/')) || '/';
    }
    if (vfs.onWrite) vfs.onWrite(p, data);
  },
  remove(p: string): boolean {
    p = vfs.norm(p);
    if (vfs.files.delete(p)) {
      if (vfs.onWrite) vfs.onWrite(p, null);
      return true;
    }
    return vfs.dirs.delete(p);
  },
  isFile(p: string): boolean {
    p = vfs.norm(p);
    if (vfs.files.has(p)) return true;
    if (!vfs.provider || vfs.provider.isDir(p)) return false;
    return vfs.provider.has ? vfs.provider.has(p) : vfs.provider.read(p) != null;
  },
  isDir(p: string): boolean {
    p = vfs.norm(p);
    if (vfs.dirs.has(p)) return true;
    for (const k of vfs.files.keys()) if (k.startsWith(p + '/')) return true;
    return !!vfs.provider && vfs.provider.isDir(p);
  },
  list(p: string): string[] | null {
    p = vfs.norm(p);
    if (!vfs.isDir(p)) return null;
    const names = new Set<string>();
    const pre = p === '/' ? '/' : p + '/';
    for (const k of [...vfs.files.keys(), ...vfs.dirs]) {
      if (k.startsWith(pre) && k.length > pre.length) names.add(k.substring(pre.length).split('/')[0]);
    }
    if (vfs.provider) {
      const l = vfs.provider.list(p);
      if (l) for (const n of l) names.add(n);
    }
    return [...names].sort();
  },
  mkdir(p: string) {
    vfs.dirs.add(vfs.norm(p));
  },
};

/* ------------------------------------------------------------------ File, Path */

export class File extends JObject {
  path: string;
  static readonly separator = '/';
  static readonly separatorChar = 47;
  static readonly pathSeparator = ':';
  constructor(a: any, b?: any) {
    super();
    if (b !== undefined) {
      const parent = a instanceof File ? a.path : a;
      this.path = parent == null || parent === '' ? b : parent.endsWith('/') ? parent + b : parent + '/' + b;
    } else if (a && a.$uri) {
      this.path = a.getPath();
    } else {
      this.path = a;
    }
    if (this.path == null) throw new NullPointerException();
    if (this.path.length > 1 && this.path.endsWith('/')) this.path = this.path.replace(/\/+$/, '');
  }
  abs(): string {
    return vfs.norm(this.path.startsWith('/') ? this.path : $J.system_getProperty('user.dir') + '/' + this.path);
  }
  getPath() { return this.path; }
  toString() { return this.path; }
  getName() { return this.path.substring(this.path.lastIndexOf('/') + 1); }
  getAbsolutePath() { return this.abs(); }
  getAbsoluteFile() { return new File(this.abs()); }
  getCanonicalPath() { return this.abs(); }
  getCanonicalFile() { return new File(this.abs()); }
  getParent() {
    // as Java: the root has no parent
    if (this.path === '/') return null;
    const i = this.path.lastIndexOf('/');
    return i < 0 ? null : i === 0 ? '/' : this.path.substring(0, i);
  }
  getParentFile() {
    const p = this.getParent();
    return p == null ? null : new File(p);
  }
  exists() { return vfs.isFile(this.abs()) || vfs.isDir(this.abs()); }
  isFile() { return vfs.isFile(this.abs()); }
  isDirectory() { return vfs.isDir(this.abs()); }
  isAbsolute() { return this.path.startsWith('/'); }
  isHidden() { return this.getName().startsWith('.'); }
  canRead() { return this.exists(); }
  canWrite() { return true; }
  canExecute() { return this.isDirectory(); }
  length() { const d = vfs.read(this.abs()); return d ? d.length : 0; }
  lastModified() { return vfs.mtimes.get(this.abs()) ?? 0; }
  setLastModified() { return true; }
  mkdir() { vfs.mkdir(this.abs()); return true; }
  mkdirs() { vfs.mkdir(this.abs()); return true; }
  delete() { return vfs.remove(this.abs()); }
  deleteOnExit() {}
  createNewFile() {
    if (this.exists()) return false;
    vfs.write(this.abs(), new Uint8Array(0));
    return true;
  }
  renameTo(f: File) {
    const d = vfs.read(this.abs());
    if (!d) return false;
    vfs.write(f.abs(), d);
    vfs.remove(this.abs());
    return true;
  }
  list(filter?: any) {
    const l = vfs.list(this.abs());
    if (!l) return null;
    return filter ? l.filter((n) => filter(this, n)) : l;
  }
  listFiles(filter?: any) {
    const l = vfs.list(this.abs());
    if (!l) return null;
    const fs = l.map((n) => new File(this, n));
    if (!filter) return fs;
    // FileFilter (accept(File)) or FilenameFilter (accept(File, String)), a function or an object
    const named = typeof filter === 'function' ? filter.length === 2
      : $J.isa(filter, $J.load('java.io.FilenameFilter')) || !!filter.constructor.$meta?.ifaces?.includes('java.io.FilenameFilter');
    const accept = typeof filter === 'function' ? filter : (...a: any[]) => filter.accept(...a);
    return fs.filter((f) => (named ? accept(this, f.getName()) : accept(f)));
  }
  toPath() { return new Path(this.path); }
  toURI() { return new URI('file:' + this.abs()); }
  toURL() { return new URL('file:' + this.abs()); }
  equals(o: any) { return o instanceof File && o.path === this.path; }
  hashCode() { return stringHash(this.path) ^ 1234321; }
  compareTo(o: File) { return JString.compareTo(this.path, o.path); }
  static createTempFile(prefix: string, suffix: string, dir?: File) {
    return new File((dir ? dir.abs() : '/tmp') + '/' + prefix + Math.floor(Math.random() * 1e9) + (suffix ?? '.tmp'));
  }
  static listRoots() { return [new File('/')]; }
}
defineLib(File, 'java.io.File', { ifaces: ['java.lang.Comparable'] });

export class Path extends JObject {
  p: string;
  constructor(p: string) {
    super();
    this.p = p;
  }
  toString() { return this.p; }
  toFile() { return new File(this.p); }
  getFileName() { return new Path(this.p.substring(this.p.lastIndexOf('/') + 1)); }
  getParent() { const i = this.p.lastIndexOf('/'); return i <= 0 ? (i === 0 ? new Path('/') : null) : new Path(this.p.substring(0, i)); }
  resolve(o: any) { const s = str(o); return new Path(s.startsWith('/') ? s : this.p.replace(/\/$/, '') + '/' + s); }
  toAbsolutePath() { return new Path(new File(this.p).abs()); }
  normalize() { return new Path(vfs.norm(this.p)); }
  endsWith(s: any) { return this.p.endsWith(str(s)); }
  startsWith(s: any) { return this.p.startsWith(str(s)); }
  toUri() { return new URI('file:' + new File(this.p).abs()); }
  equals(o: any) { return o instanceof Path && o.p === this.p; }
  compareTo(o: any) { return JString.compareTo(this.p, o.p); }
  hashCode() { return stringHash(this.p); }
  getNameCount() { return this.p.split('/').filter((x) => x).length; }
  iterator() { return ArrayList.from(this.p.split('/').filter((x) => x).map((x) => new Path(x))).iterator(); }
}
defineLib(Path, 'java.nio.file.Path');

export class Paths {
  static get(first: string, ...more: string[]) {
    return new Path([first, ...more].join('/'));
  }
}
(Path as any).of = Paths.get;

export class StandardCharsets {
  static UTF_8 = { name: () => 'UTF-8', toString: () => 'UTF-8' };
  static ISO_8859_1 = { name: () => 'ISO-8859-1', toString: () => 'ISO-8859-1' };
  static US_ASCII = { name: () => 'US-ASCII', toString: () => 'US-ASCII' };
}
export class Charset {
  static forName(n: string) { return { name: () => n, toString: () => n }; }
  static defaultCharset() { return StandardCharsets.UTF_8; }
}
export const StandardOpenOption = { CREATE: 'CREATE', APPEND: 'APPEND', WRITE: 'WRITE', TRUNCATE_EXISTING: 'TRUNCATE_EXISTING', READ: 'READ', CREATE_NEW: 'CREATE_NEW' };
export const PosixFilePermission = { OWNER_READ: 'OWNER_READ', OWNER_WRITE: 'OWNER_WRITE', OWNER_EXECUTE: 'OWNER_EXECUTE' };

export class Files {
  static createTempFile(a: any, b?: any, c?: any, ..._attrs: any[]) {
    // (prefix, suffix, attrs...) or (dir, prefix, suffix, attrs...)
    const inDir = a != null && typeof a === 'object';
    const f = File.createTempFile(inDir ? b : a, inDir ? c : b, inDir ? new File(str(a)) : undefined);
    vfs.mkdir(f.getParent());
    vfs.write(f.abs(), new Uint8Array(0));
    return f.toPath();
  }
  static newInputStream(p: any, ..._opts: any[]) {
    return new FileInputStream(p.toFile ? p.toFile() : new File(str(p)));
  }
  static newOutputStream(p: any, ...opts: any[]) {
    return new FileOutputStream(p.toFile ? p.toFile() : new File(str(p)), opts.includes('APPEND'));
  }
  static newBufferedReader(p: any) {
    return new BufferedReader(new InputStreamReader(Files.newInputStream(p)));
  }
  static newBufferedWriter(p: any, ..._a: any[]) {
    return new OutputStreamWriter(Files.newOutputStream(p));
  }
  static exists(p: any) { return p.toFile().exists(); }
  static isDirectory(p: any) { return p.toFile().isDirectory(); }
  static isRegularFile(p: any) { return p.toFile().isFile(); }
  static isReadable(p: any) { return p.toFile().exists(); }
  static isWritable(_p: any) { return true; }
  static createDirectories(p: any) { p.toFile().mkdirs(); return p; }
  static createDirectory(p: any) { p.toFile().mkdir(); return p; }
  static delete(p: any) { p.toFile().delete(); }
  static deleteIfExists(p: any) { return p.toFile().delete(); }
  static readAllBytes(p: any) { const d = vfs.read(p.toFile().abs()); if (!d) throw new FileNotFoundException(str(p)); return d; }
  static readString(p: any) { return utf8Decode(Files.readAllBytes(p)); }
  static readAllLines(p: any) { return ArrayList.from(Files.readString(p).split(/\r?\n/).filter((_l, i, a) => i < a.length - 1 || a[i] !== '')); }
  static write(p: any, data: any, ..._o: any[]) { vfs.write(p.toFile().abs(), typeof data === 'string' ? new TextEncoder().encode(data) : data); return p; }
  static writeString(p: any, s: string) { return Files.write(p, s); }
  static size(p: any) { return p.toFile().length(); }
  static list(p: any) {
    const l = p.toFile().listFiles() || [];
    return $J.streamOfArray(l.map((f: File) => f.toPath()));
  }
  static walk(p: any) {
    const out: Path[] = [];
    const visit = (f: File) => {
      out.push(f.toPath());
      if (f.isDirectory()) for (const c of f.listFiles()) visit(c);
    };
    visit(p.toFile());
    return $J.streamOfArray(out);
  }
  static copy(a: any, b: any) {
    if (a instanceof InputStream) {
      vfs.write(b.toFile().abs(), a.readAllBytes());
      return 0;
    }
    vfs.write(b.toFile().abs(), Files.readAllBytes(a));
    return b;
  }
  static move(a: any, b: any) { Files.copy(a, b); Files.delete(a); return b; }
  static setPosixFilePermissions(p: any) { return p; }
  static getLastModifiedTime(p: any) { return { toMillis: () => p.toFile().lastModified() }; }
  static probeContentType(_p: any) { return null; }
}

export class FileSystems {
  static getDefault() { return { getPath: (...a: string[]) => Paths.get(a[0], ...a.slice(1)), getSeparator: () => '/' }; }
  static newFileSystem() { throw new UnsupportedOperationException('zip file systems'); }
}

/* ------------------------------------------------------------------ URI, URL */

export class URI extends JObject {
  $uri = true;
  s: string;
  constructor(s: string, ssp?: string, fragment?: string) {
    super();
    // URI(scheme, ssp, fragment) quotes what is illegal in a URI
    this.s = ssp === undefined ? s : s + ':' + encodeURI(ssp) + (fragment != null ? '#' + encodeURIComponent(fragment) : '');
  }
  static create(s: string) { return new URI(s); }
  getScheme() { const m = /^([a-zA-Z][\w+.-]*):/.exec(this.s); return m ? m[1] : null; }
  getSchemeSpecificPart() { const sc = this.getScheme(); return sc ? this.s.substring(sc.length + 1) : this.s; }
  getPath() { const sc = this.getScheme(); let p = sc ? this.s.substring(sc.length + 1) : this.s; if (p.startsWith('//')) p = p.substring(p.indexOf('/', 2)); return decodeURI(p); }
  getHost() { return null; }
  toURL() { return new URL(this.s); }
  toString() { return this.s; }
  equals(o: any) { return o instanceof URI && o.s === this.s; }
  hashCode() { return stringHash(this.s); }
  resolve(o: any) { return new URI(this.s.replace(/[^/]*$/, '') + str(o)); }
}
defineLib(URI, 'java.net.URI');

export class URL extends JObject {
  s: string;
  constructor(s: string) {
    super();
    this.s = s;
  }
  toString() { return this.s; }
  toExternalForm() { return this.s; }
  toURI() { return new URI(this.s); }
  getPath() { return new URI(this.s).getPath(); }
  getProtocol() { return new URI(this.s).getScheme(); }
  openStream() {
    // jar:file:/path/to.zip!/entry, or file:/path
    const m = /^jar:file:(.*?)!\/(.*)$/.exec(this.s);
    if (m) {
      const zf = new ZipFile(new File(decodeURI(m[1])));
      const e = zf.getEntry(decodeURI(m[2]));
      if (e == null) throw new FileNotFoundException('JAR entry ' + decodeURI(m[2]) + ' not found in ' + decodeURI(m[1]));
      return zf.getInputStream(e);
    }
    return new FileInputStream(new File(this.getPath()));
  }
  openConnection() { const u = this; return { getInputStream: () => u.openStream(), setDefaultUseCaches() {}, setUseCaches() {}, connect() {} }; }
}
defineLib(URL, 'java.net.URL');

/* ------------------------------------------------------------------ input streams and readers */

export class InputStream extends JObject {
  data: Uint8Array = new Uint8Array(0);
  pos = 0;
  markPos = 0;
  _InputStream(): this { return this; }
  read(b?: any, off = 0, len?: number): number {
    if (b === undefined) return this.pos < this.data.length ? this.data[this.pos++] : -1;
    if (len === undefined) len = b.length - off;
    if (len === 0) return 0;
    if (this.pos >= this.data.length) return -1;
    const n = Math.min(len, this.data.length - this.pos);
    for (let i = 0; i < n; i++) b[off + i] = (this.data[this.pos + i] << 24) >> 24;
    this.pos += n;
    return n;
  }
  readAllBytes(): Uint8Array {
    if (this.$byteRead()) {
      // a translated subclass that overrides read() only (the one-byte read, as FreeCol's filters do)
      const out: number[] = [];
      for (let c = this.read(); c >= 0; c = this.read()) out.push(c);
      return Uint8Array.from(out);
    }
    const r = this.data.subarray(this.pos);
    this.pos = this.data.length;
    return r;
  }
  /** A subclass with its own read(): Java's other reads go through it, one byte at a time. */
  $byteRead(): boolean {
    let p = Object.getPrototypeOf(this);
    while (p && p !== InputStream.prototype) {
      if (Object.prototype.hasOwnProperty.call(p, 'read')) return !(p.constructor as any).$meta?.lib;
      p = Object.getPrototypeOf(p);
    }
    return false;
  }
  readNBytes(n: number) { const r = this.data.subarray(this.pos, this.pos + n); this.pos += r.length; return r; }
  available() { return this.data.length - this.pos; }
  skip(n: number) { const k = Math.min(n, this.data.length - this.pos); this.pos += k; return k; }
  mark(_n: number) { this.markPos = this.pos; }
  reset() { this.pos = this.markPos; }
  markSupported() { return true; }
  close() {}
  transferTo(out: any) { const d = this.readAllBytes(); out.write(d); return d.length; }
  $readAllText(): string { return utf8Decode(this.readAllBytes()); }
}
defineLib(InputStream, 'java.io.InputStream', { ifaces: ['java.io.Closeable'] });

export class FileInputStream extends InputStream {
  constructor(f: any) {
    super();
    const file = f instanceof File ? f : new File(str(f));
    const d = vfs.read(file.abs());
    if (d == null || vfs.isDir(file.abs())) throw new FileNotFoundException(file.getPath() + ' (No such file or directory)');
    this.data = d;
  }
}
defineLib(FileInputStream, 'java.io.FileInputStream');

export class ByteArrayInputStream extends InputStream {
  constructor(b: any, off = 0, len?: number) {
    super();
    const u = b instanceof Uint8Array ? b : Uint8Array.from(b, (x: number) => x & 0xff);
    this.data = u.subarray(off, len === undefined ? undefined : off + len);
  }
}
defineLib(ByteArrayInputStream, 'java.io.ByteArrayInputStream');

/** A wrapper stream (Buffered, Data, ...) shares its source's bytes. */
export class FilterInputStream extends InputStream {
  src: InputStream;
  constructor(src: InputStream) {
    super();
    this.src = src;
    this.data = src.data.subarray(src.pos);
    src.pos = src.data.length;
  }
  _FilterInputStream(src: InputStream): this {
    this.src = src;
    this.data = src.data.subarray(src.pos);
    src.pos = src.data.length;
    return this;
  }
}
export class BufferedInputStream extends FilterInputStream {}
defineLib(BufferedInputStream, 'java.io.BufferedInputStream');
export class DataInputStream extends FilterInputStream {
  readInt() { const d = this.data, p = this.pos; if (p + 4 > d.length) throw new EOFException(); this.pos += 4; return (d[p] << 24) | (d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]; }
  readUTF() { const n = (this.data[this.pos] << 8) | this.data[this.pos + 1]; this.pos += 2; const s = utf8Decode(this.data.subarray(this.pos, this.pos + n)); this.pos += n; return s; }
  readFully(b: any) { this.read(b); }
}

export class Reader extends JObject {
  text = '';
  pos = 0;
  markPos = 0;
  _Reader(): this { return this; }
  read(buf?: any, off = 0, len?: number): number {
    if (buf === undefined) return this.pos < this.text.length ? this.text.charCodeAt(this.pos++) : -1;
    if (buf && buf.put) {
      // CharBuffer
      if (this.pos >= this.text.length) return -1;
      const n = Math.min(buf.remaining(), this.text.length - this.pos);
      buf.put(this.text.substring(this.pos, this.pos + n));
      this.pos += n;
      return n;
    }
    if (len === undefined) len = buf.length - off;
    if (this.pos >= this.text.length) return -1;
    const n = Math.min(len, this.text.length - this.pos);
    for (let i = 0; i < n; i++) buf[off + i] = this.text.charCodeAt(this.pos + i);
    this.pos += n;
    return n;
  }
  ready() { return this.pos < this.text.length; }
  skip(n: number) { const k = Math.min(n, this.text.length - this.pos); this.pos += k; return k; }
  mark() { this.markPos = this.pos; }
  reset() { this.pos = this.markPos; }
  markSupported() { return true; }
  close() {}
  $readAllText(): string { const r = this.text.substring(this.pos); this.pos = this.text.length; return r; }
  readLine(): string {
    if (this.pos >= this.text.length) return null;
    let i = this.pos;
    while (i < this.text.length && this.text[i] !== '\n' && this.text[i] !== '\r') i++;
    const line = this.text.substring(this.pos, i);
    if (i < this.text.length && this.text[i] === '\r' && this.text[i + 1] === '\n') i++;
    this.pos = i + 1;
    return line;
  }
  lines() { const ls: string[] = []; let l: string; while ((l = this.readLine()) != null) ls.push(l); return $J.streamOfArray(ls); }
  transferTo(w: any) { const t = this.$readAllText(); w.write(t); return t.length; }
}
defineLib(Reader, 'java.io.Reader', { ifaces: ['java.io.Closeable'] });

export class StringReader extends Reader {
  constructor(s: string) {
    super();
    this.text = s;
  }
}
defineLib(StringReader, 'java.io.StringReader');

export class InputStreamReader extends Reader {
  input: InputStream;
  decoder: TextDecoder = null;
  constructor(input: InputStream, _cs?: any) {
    super();
    this.input = input;
    if ((input as any).$streaming) {
      // a socket: text as it arrives
      this.decoder = new TextDecoder('utf-8');
      return;
    }
    const bytes = input.readAllBytes();
    this.text = utf8Decode(bytes).replace(/^﻿/, '');
  }
  /** A streaming reader: more text, waiting for it; false at the end of the stream. */
  $more(): boolean {
    const c = (this.input as any).$nextChunk();
    if (c == null) return false;
    this.text = this.text.substring(this.pos) + this.decoder.decode(c, { stream: true });
    this.pos = 0;
    return true;
  }
  getEncoding() { return 'UTF8'; }
}
defineLib(InputStreamReader, 'java.io.InputStreamReader');

export class BufferedReader extends Reader {
  src: any = null;
  constructor(r: Reader, _n?: number) {
    super();
    if ((r as any).decoder) {
      this.src = r; // a socket's reader: lines as they arrive
      return;
    }
    this.text = r.$readAllText();
  }
  readLine(): string {
    if (!this.src) return super.readLine();
    for (;;) {
      const t = this.src.text, i = t.indexOf('\n', this.src.pos);
      if (i >= 0) {
        const line = t.substring(this.src.pos, i > this.src.pos && t[i - 1] === '\r' ? i - 1 : i);
        this.src.pos = i + 1;
        return line;
      }
      if (!this.src.$more()) {
        if (this.src.pos >= this.src.text.length) return null;
        const rest = this.src.text.substring(this.src.pos);
        this.src.pos = this.src.text.length;
        return rest;
      }
    }
  }
  close() {
    if (this.src) this.src.input.close();
  }
}
defineLib(BufferedReader, 'java.io.BufferedReader');

export class FileReader extends InputStreamReader {
  constructor(f: any) {
    super(new FileInputStream(f));
  }
}

/* ------------------------------------------------------------------ output streams and writers */

export class OutputStream extends JObject {
  chunks: number[] = [];
  _OutputStream(): this { return this; }
  write(b: any, off = 0, len?: number) {
    if (typeof b === 'number') {
      this.chunks.push(b & 0xff);
      return;
    }
    if (len === undefined) len = b.length - off;
    for (let i = 0; i < len; i++) this.chunks.push(b[off + i] & 0xff);
  }
  bytes(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
  flush() {}
  close() {}
  $writeText(s: string) { this.write(new TextEncoder().encode(s)); }
}
defineLib(OutputStream, 'java.io.OutputStream', { ifaces: ['java.io.Closeable'] });

export class ByteArrayOutputStream extends OutputStream {
  constructor(_n?: number) {
    super();
  }
  toByteArray() { return this.bytes(); }
  size() { return this.chunks.length; }
  reset() { this.chunks = []; }
  toString() { return utf8Decode(this.bytes()); }
  writeTo(o: any) { o.write(this.bytes()); }
}
defineLib(ByteArrayOutputStream, 'java.io.ByteArrayOutputStream');

export class FileOutputStream extends OutputStream {
  closed = false;
  append: any;
  constructor(f: any, append = false) {
    super();
    this.append = append;
    this.file = f instanceof File ? f : new File(str(f));
    if (append) {
      const d = vfs.read(this.file.abs());
      if (d) this.chunks = Array.from(d);
    }
    vfs.write(this.file.abs(), this.bytes());
  }
  file: File;
  flush() {
    vfs.write(this.file.abs(), this.bytes());
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.flush();
  }
}
defineLib(FileOutputStream, 'java.io.FileOutputStream');

export class FilterOutputStream extends OutputStream {
  out: OutputStream;
  constructor(out: OutputStream) {
    super();
    this.out = out;
  }
  write(b: any, off?: number, len?: number) { this.out.write(b, off, len); }
  flush() { this.out.flush(); }
  close() { this.out.close(); }
}
export class BufferedOutputStream extends FilterOutputStream {}
defineLib(BufferedOutputStream, 'java.io.BufferedOutputStream');

export class Writer extends JObject {
  buf = '';
  _Writer(): this { return this; }
  write(x: any, off?: number, len?: number) {
    if (typeof x === 'number') this.buf += String.fromCharCode(x);
    else if (typeof x === 'string') this.buf += off === undefined ? x : x.substring(off, off + len);
    else if (Array.isArray(x)) this.buf += JString.fromChars(x, off ?? 0, len ?? x.length);
    else this.buf += str(x);
    this.$drain();
  }
  append(x: any) { this.write(x == null ? 'null' : typeof x === 'number' ? String.fromCharCode(x) : str(x)); return this; }
  $drain() {}
  flush() {}
  close() { this.flush(); }
}
defineLib(Writer, 'java.io.Writer', { ifaces: ['java.io.Closeable', 'java.lang.Appendable'] });

export class StringWriter extends Writer {
  constructor(_n?: number) {
    super();
  }
  getBuffer() {
    const self = this;
    return {
      length: () => self.buf.length,
      toString: () => self.buf,
      setLength: (n: number) => { self.buf = self.buf.substring(0, n); },
      delete: (a: number, b: number) => { self.buf = self.buf.substring(0, a) + self.buf.substring(b); },
    };
  }
  toString() { return this.buf; }
}
defineLib(StringWriter, 'java.io.StringWriter');

export class OutputStreamWriter extends Writer {
  out: OutputStream;
  constructor(out: OutputStream, _cs?: any) {
    super();
    this.out = out;
  }
  $drain() {}
  flush() {
    if (this.buf) {
      this.out.write(new TextEncoder().encode(this.buf));
      this.buf = '';
    }
    this.out.flush();
  }
  close() {
    this.flush();
    this.out.close();
  }
}
defineLib(OutputStreamWriter, 'java.io.OutputStreamWriter');

export class BufferedWriter extends Writer {
  w: Writer;
  constructor(w: Writer, _n?: number) {
    super();
    this.w = w;
  }
  newLine() { this.write('\n'); }
  flush() { if (this.buf) { this.w.write(this.buf); this.buf = ''; } this.w.flush(); }
  close() { this.flush(); this.w.close(); }
}
defineLib(BufferedWriter, 'java.io.BufferedWriter');

export class FileWriter extends OutputStreamWriter {
  constructor(f: any, append = false) {
    super(new FileOutputStream(f, append));
  }
}

export class PrintWriter extends Writer {
  w: any;
  constructor(w: any, _autoFlush?: any) {
    super();
    this.w = w instanceof Writer ? w : w instanceof OutputStream ? new OutputStreamWriter(w) : new OutputStreamWriter(new FileOutputStream(w));
  }
  print(x: any) { this.w.write(str(x)); }
  println(x?: any) { this.w.write((x === undefined ? '' : str(x)) + '\n'); }
  printf(fmt: string, ...a: any[]) { this.w.write(JString.format(fmt, ...a)); return this; }
  format(fmt: string, ...a: any[]) { return this.printf(fmt, ...a); }
  write(x: any, off?: number, len?: number) { this.w.write(x, off, len); }
  flush() { this.w.flush(); }
  close() { this.w.close(); }
}
defineLib(PrintWriter, 'java.io.PrintWriter');

/* ------------------------------------------------------------------ zip */

export class ZipEntry extends JObject {
  time = -1;
  size = -1;
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
  getName() { return this.name; }
  isDirectory() { return this.name.endsWith('/'); }
  getSize() { return this.size; }
  getTime() { return this.time; }
  setTime(t: number) { this.time = t; }
  toString() { return this.name; }
}
defineLib(ZipEntry, 'java.util.zip.ZipEntry');
export const JarEntry = ZipEntry;

export class ZipInputStream extends InputStream {
  entries: [string, Uint8Array][];
  idx = 0;
  constructor(input: InputStream) {
    super();
    const all = unzipSync(input.readAllBytes());
    this.entries = Object.entries(all);
  }
  getNextEntry() {
    if (this.idx >= this.entries.length) return null;
    const [name, data] = this.entries[this.idx++];
    this.data = data;
    this.pos = 0;
    const e = new ZipEntry(name);
    e.size = data.length;
    return e;
  }
  closeEntry() {}
}
defineLib(ZipInputStream, 'java.util.zip.ZipInputStream');

export class ZipFile extends JObject {
  files: Record<string, Uint8Array>;
  f: any;
  constructor(f: any) {
    super();
    this.f = f;
    const file = f instanceof File ? f : new File(str(f));
    const d = vfs.read(file.abs());
    if (!d) throw new FileNotFoundException(file.getPath());
    this.files = unzipSync(d);
  }
  getEntry(n: string) { return n in this.files ? Object.assign(new ZipEntry(n), { size: this.files[n].length }) : null; }
  getJarEntry(n: string) { return this.getEntry(n); }
  getInputStream(e: any) { return new ByteArrayInputStream(this.files[e.getName()]); }
  entries() {
    const names = Object.keys(this.files);
    let i = 0;
    return { hasMoreElements: () => i < names.length, nextElement: () => new ZipEntry(names[i++]) };
  }
  stream() { return $J.streamOfArray(Object.keys(this.files).map((n) => new ZipEntry(n))); }
  size() { return Object.keys(this.files).length; }
  getName() { return str(this.f); }
  close() {}
}
defineLib(ZipFile, 'java.util.zip.ZipFile');
export const JarFile = ZipFile;

export class ZipOutputStream extends OutputStream {
  files: [string, Uint8Array, number][] = [];
  current: ZipEntry = null;
  closed = false;
  level = 6;
  out: OutputStream;
  constructor(out: OutputStream) {
    super();
    this.out = out;
  }
  putNextEntry(e: ZipEntry) {
    this.closeEntry();
    this.current = e;
    this.chunks = [];
  }
  closeEntry() {
    if (this.current) {
      this.files.push([this.current.name, this.bytes(), this.current.time]);
      this.current = null;
      this.chunks = [];
    }
  }
  setLevel(l: number) { this.level = l; }
  setMethod() {}
  finish() {
    this.closeEntry();
    const obj: any = {};
    for (const [n, d, t] of this.files) obj[n] = [d, { level: this.level, mtime: t >= 0 ? t : $J.clock() }];
    const z = zipSync(obj);
    this.out.write(z);
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.finish();
    this.out.close();
  }
}
defineLib(ZipOutputStream, 'java.util.zip.ZipOutputStream');
export const JarOutputStream = ZipOutputStream;

/* ------------------------------------------------------------------ object streams: java.util.Random only */

const RANDOM_CLASSDESC = 'ACED0005737200106A6176612E7574696C2E52616E646F6D363296344BF00A530300035A0014686176654E6578744E657874476175737369616E4400106E6578744E657874476175737369616E4A000473656564787000';

/** Java serialization of the one object FreeCol serializes: the server's Random, in the savegame. */
export class ObjectOutputStream extends OutputStream {
  out: OutputStream;
  constructor(out: OutputStream) {
    super();
    this.out = out;
  }
  writeObject(o: any) {
    if (!(o instanceof Random)) throw new UnsupportedOperationException('serialize ' + str(o));
    const hex = RANDOM_CLASSDESC.substring(0, RANDOM_CLASSDESC.length - 2);
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
    bytes.push(o.haveNextNextGaussian ? 1 : 0);
    const dv = new DataView(new ArrayBuffer(8));
    dv.setFloat64(0, o.nextNextGaussian);
    for (let i = 0; i < 8; i++) bytes.push(dv.getUint8(i));
    let seed = o.getSeed();
    for (let i = 7; i >= 0; i--) bytes.push(Number((seed >> BigInt(i * 8)) & 0xffn));
    bytes.push(0x78);
    this.out.write(Uint8Array.from(bytes));
  }
  flush() { this.out.flush(); }
  close() { this.out.close(); }
}
defineLib(ObjectOutputStream, 'java.io.ObjectOutputStream');

export class ObjectInputStream extends InputStream {
  input: InputStream;
  constructor(input: InputStream) {
    super();
    this.input = input;
    this.data = input.readAllBytes();
  }
  readObject() {
    const d = this.data;
    const head = (RANDOM_CLASSDESC.length - 2) / 2;
    for (let i = 0; i < head; i++) {
      if (d[i] !== parseInt(RANDOM_CLASSDESC.substr(i * 2, 2), 16)) throw new IOException('not a serialized java.util.Random');
    }
    const r = new Random(0);
    r.haveNextNextGaussian = d[head] !== 0;
    const dv = new DataView(d.buffer, d.byteOffset + head + 1, 16);
    r.nextNextGaussian = dv.getFloat64(0);
    let seed = 0n;
    for (let i = 0; i < 8; i++) seed = (seed << 8n) | BigInt(d[head + 9 + i]);
    r.setState(seed);
    return r;
  }
}
defineLib(ObjectInputStream, 'java.io.ObjectInputStream');

export class RandomAccessFile extends JObject {
  f: any;
  constructor(f: any, _mode: string) {
    super();
    this.f = f;
  }
  readFully(b: any) { new FileInputStream(this.f).read(b); }
  close() {}
}

export class CharBuffer extends JObject {
  s = '';
  cap: number;
  constructor(cap: number) {
    super();
    this.cap = cap;
  }
  static allocate(n: number) { return new CharBuffer(n); }
  put(x: string) { this.s += x; return this; }
  remaining() { return this.cap - this.s.length; }
  flip() { return this; }
  toString() { return this.s; }
}

/** Class.getResource(AsStream): the JDK's resources in the virtual file system, /jdk/res/<path>. */
($J as any).classResource = (path: string, stream: boolean) => {
  const p = '/jdk/res/' + path;
  const b = vfs.read(p);
  if (!b) return null;
  return stream ? new ByteArrayInputStream(b) : new URL('file:' + p);
};
