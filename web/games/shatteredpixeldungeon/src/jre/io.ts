// @ts-nocheck
// java.io, java.util.zip (GZIP) and java.nio's buffers as the translated Shattered Pixel Dungeon uses them.
// The streams and readers are FreeCol's (web/games/freecol/src/jre/io.ts) without its virtual file system:
// here files are libGDX's FileHandles (src/gdx/files.ts), whose read() and write() give these streams.
import { deflateSync, gunzipSync } from 'fflate';
import { $J, JObject, JString, defineLib, str, IOException, EOFException, IllegalArgumentException } from './lang.ts';

/** UTF-8 as Java decodes it: a byte order mark is a character (U+FEFF), malformed bytes are U+FFFD. */
export function utf8DecodeJava(a: Uint8Array): string {
  return new TextDecoder('utf-8', { ignoreBOM: true }).decode(a);
}

export class StandardCharsets {
  static UTF_8 = { name: () => 'UTF-8', toString: () => 'UTF-8' };
  static ISO_8859_1 = { name: () => 'ISO-8859-1', toString: () => 'ISO-8859-1' };
  static US_ASCII = { name: () => 'US-ASCII', toString: () => 'US-ASCII' };
}
defineLib(StandardCharsets, 'java.nio.charset.StandardCharsets');

/* ------------------------------------------------------------------ input streams and readers */

/** An input stream over bytes held in memory (every stream here is one: files are read whole). */
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
    const r = this.data.subarray(this.pos);
    this.pos = this.data.length;
    return r;
  }
  available() { return this.data.length - this.pos; }
  skip(n: any) { const k = Math.min(Number(n), this.data.length - this.pos); this.pos += k; return BigInt(k); }
  mark(_n: number) { this.markPos = this.pos; }
  reset() { this.pos = this.markPos; }
  markSupported() { return true; }
  close() {}
}
defineLib(InputStream, 'java.io.InputStream', { ifaces: ['java.io.Closeable'] });

export class ByteArrayInputStream extends InputStream {
  constructor(b: any, off = 0, len?: number) {
    super();
    const u = b instanceof Uint8Array ? b : Uint8Array.from(b, (x: number) => x & 0xff);
    this.data = u.subarray(off, len === undefined ? undefined : off + len);
  }
}
defineLib(ByteArrayInputStream, 'java.io.ByteArrayInputStream');

/** A wrapper stream (Buffered, GZIP) takes over its source's remaining bytes. */
export class FilterInputStream extends InputStream {
  src: InputStream;
  constructor(src: InputStream, _size?: number) {
    super();
    this.src = src;
    this.data = src.data.subarray(src.pos);
    src.pos = src.data.length;
  }
  close() { this.src.close(); }
}
export class BufferedInputStream extends FilterInputStream {}
defineLib(BufferedInputStream, 'java.io.BufferedInputStream');

/** GZIPInputStream: the source's bytes decompressed (all members, as Java reads them). */
export class GZIPInputStream extends FilterInputStream {
  constructor(src: InputStream, _size?: number) {
    super(src);
    try {
      this.data = gunzipSync(this.data);
    } catch (e) {
      throw new IOException('Not in GZIP format');
    }
  }
}
defineLib(GZIPInputStream, 'java.util.zip.GZIPInputStream');

export class Reader extends JObject {
  text = '';
  pos = 0;
  markPos = 0;
  _Reader(): this { return this; }
  read(buf?: any, off = 0, len?: number): number {
    if (buf === undefined) return this.pos < this.text.length ? this.text.charCodeAt(this.pos++) : -1;
    if (len === undefined) len = buf.length - off;
    if (this.pos >= this.text.length) return -1;
    const n = Math.min(len, this.text.length - this.pos);
    for (let i = 0; i < n; i++) buf[off + i] = this.text.charCodeAt(this.pos + i);
    this.pos += n;
    return n;
  }
  ready() { return this.pos < this.text.length; }
  mark() { this.markPos = this.pos; }
  reset() { this.pos = this.markPos; }
  markSupported() { return true; }
  close() {}
  $readAllText(): string { const r = this.text.substring(this.pos); this.pos = this.text.length; return r; }
  /** BufferedReader.readLine: a line ends at \n, \r or \r\n. */
  readLine(): string {
    if (this.pos >= this.text.length) return null;
    let i = this.pos;
    while (i < this.text.length && this.text[i] !== '\n' && this.text[i] !== '\r') i++;
    const line = this.text.substring(this.pos, i);
    if (i < this.text.length && this.text[i] === '\r' && this.text[i + 1] === '\n') i++;
    this.pos = i + 1;
    return line;
  }
}
defineLib(Reader, 'java.io.Reader', { ifaces: ['java.io.Closeable'] });

export class StringReader extends Reader {
  constructor(s: string) {
    super();
    this.text = s;
  }
}
defineLib(StringReader, 'java.io.StringReader');

/** InputStreamReader: the stream's bytes as UTF-8 (the only charset the game uses). */
export class InputStreamReader extends Reader {
  input: InputStream;
  constructor(input: InputStream, _cs?: any) {
    super();
    this.input = input;
    this.text = utf8DecodeJava(input.readAllBytes());
  }
  close() { this.input.close(); }
  getEncoding() { return 'UTF8'; }
}
defineLib(InputStreamReader, 'java.io.InputStreamReader');

export class BufferedReader extends Reader {
  src: Reader;
  constructor(r: Reader, _n?: number) {
    super();
    this.src = r;
    this.text = r.$readAllText();
  }
  close() { this.src.close(); }
}
defineLib(BufferedReader, 'java.io.BufferedReader');

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
}
defineLib(OutputStream, 'java.io.OutputStream', { ifaces: ['java.io.Closeable'] });

export class ByteArrayOutputStream extends OutputStream {
  constructor(_n?: number) {
    super();
  }
  toByteArray() { return this.bytes(); }
  size() { return this.chunks.length; }
  reset() { this.chunks = []; }
  toString() { return utf8DecodeJava(this.bytes()); }
}
defineLib(ByteArrayOutputStream, 'java.io.ByteArrayOutputStream');

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

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(d: Uint8Array): number {
  let c = -1;
  for (let i = 0; i < d.length; i++) c = CRC_TABLE[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/**
 * GZIPOutputStream: compresses what it is given when it is closed, framed as Java's (a header without a time,
 * OS "unknown": 1f 8b 08 00 00000000 00 ff; the CRC-32 and the length after). The deflate data itself is
 * fflate's at zlib's default level, not zlib's own bytes: Java's file and the port's hold the same JSON but
 * differ in size and bytes (re/shatteredpixeldungeon/NOTES.md, "The port's save test"); either reads the other's.
 */
export class GZIPOutputStream extends OutputStream {
  out: OutputStream;
  closed = false;
  constructor(out: OutputStream, _size?: number) {
    super();
    this.out = out;
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    const data = this.bytes();
    const body = deflateSync(data, { level: 6 });
    const n = data.length, c = crc32(data);
    const trailer = [c & 0xff, (c >>> 8) & 0xff, (c >>> 16) & 0xff, c >>> 24, n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
    this.out.write([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 0, 0xff]);
    this.out.write(body);
    this.out.write(trailer);
    this.out.close();
  }
}
defineLib(GZIPOutputStream, 'java.util.zip.GZIPOutputStream');

export class Writer extends JObject {
  buf = '';
  _Writer(): this { return this; }
  write(x: any, off?: number, len?: number) {
    if (typeof x === 'number') this.buf += String.fromCharCode(x);
    else if (typeof x === 'string') this.buf += off === undefined ? x : x.substring(off, off + len);
    else if (Array.isArray(x)) this.buf += JString.fromChars(x, off ?? 0, len ?? x.length);
    else this.buf += str(x);
  }
  append(x: any) { this.write(x == null ? 'null' : typeof x === 'number' ? String.fromCharCode(x) : str(x)); return this; }
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
    return { length: () => self.buf.length, toString: () => self.buf };
  }
  toString() { return this.buf; }
}
defineLib(StringWriter, 'java.io.StringWriter');

/** OutputStreamWriter: UTF-8. */
export class OutputStreamWriter extends Writer {
  out: OutputStream;
  constructor(out: OutputStream, _cs?: any) {
    super();
    this.out = out;
  }
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

export class PrintWriter extends Writer {
  w: any;
  constructor(w: any, _autoFlush?: any) {
    super();
    this.w = w instanceof Writer ? w : new OutputStreamWriter(w);
  }
  print(x: any) { this.w.write(str(x)); }
  println(x?: any) { this.w.write((x === undefined ? '' : str(x)) + '\n'); }
  write(x: any, off?: number, len?: number) { this.w.write(x, off, len); }
  flush() { this.w.flush(); }
  close() { this.w.close(); }
}
defineLib(PrintWriter, 'java.io.PrintWriter');

