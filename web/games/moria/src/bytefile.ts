// C's FILE*, as Umoria uses it: fopen/fclose, getc/putc, fgets, fputs/fprintf, fseek/ftell, feof,
// ferror, fflush, on a file of the platform's working directory (platform().files) or, for paths
// under data/, on a read-only data file of the installation (platform().data). The file's bytes are
// in memory; fflush() and fclose() write them back.
import { platform } from './platform.ts';

export const EOF = -1;
export const SEEK_SET = 0;
export const SEEK_CUR = 1;
export const SEEK_END = 2;

const latin1 = (s: string): Uint8Array => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

export class ByteFile {
  readonly name: string;
  private data: Uint8Array;
  private size: number;
  private pos = 0;
  private eofFlag = false;
  private errorFlag = false;
  private readonly writable: boolean;
  private readonly readable: boolean;
  private readonly append: boolean;
  private dirty = false;

  private constructor(name: string, data: Uint8Array, mode: string) {
    this.name = name;
    this.data = data;
    this.size = data.length;
    const m = mode.replace('b', '');
    this.readable = m.startsWith('r') || m.includes('+');
    this.writable = m.startsWith('w') || m.startsWith('a') || m.includes('+');
    this.append = m.startsWith('a');
    if (this.append) this.pos = this.size;
  }

  /**
   * fopen(): "r" needs the file, "w" creates it empty, "a" appends, "+" also reads/writes. Files under
   * data/ are the installation's and can only be read. Returns null where fopen returns NULL.
   */
  static open(name: string, mode: string): ByteFile | null {
    const m = mode.replace('b', '');
    if (name.startsWith('data/')) {
      if (m !== 'r') return null;
      const text = platform().data(name);
      return text === null ? null : new ByteFile(name, latin1(text), mode);
    }
    const fs = platform().files;
    if (m.startsWith('r')) {
      const d = fs.read(name);
      return d === null ? null : new ByteFile(name, d.slice(), mode);
    }
    if (m.startsWith('w')) {
      const f = new ByteFile(name, new Uint8Array(0), mode);
      if (!fs.write(name, new Uint8Array(0))) return null;
      return f;
    }
    if (m.startsWith('a')) {
      const d = fs.read(name) ?? new Uint8Array(0);
      const f = new ByteFile(name, d.slice(), mode);
      if (!fs.write(name, d)) return null;
      return f;
    }
    return null;
  }

  /** getc(): the next byte or EOF */
  getc(): number {
    if (!this.readable) {
      this.errorFlag = true;
      return EOF;
    }
    if (this.pos >= this.size) {
      this.eofFlag = true;
      return EOF;
    }
    return this.data[this.pos++];
  }

  /** putc(): writes a byte; returns it, or EOF */
  putc(c: number): number {
    if (!this.writable) {
      this.errorFlag = true;
      return EOF;
    }
    if (this.append) this.pos = this.size;
    if (this.pos >= this.data.length) {
      const grown = new Uint8Array(Math.max(64, this.data.length * 2, this.pos + 1));
      grown.set(this.data.subarray(0, this.size));
      this.data = grown;
    }
    if (this.pos > this.size) this.data.fill(0, this.size, this.pos);
    this.data[this.pos++] = c & 0xff;
    if (this.pos > this.size) this.size = this.pos;
    this.dirty = true;
    return c & 0xff;
  }

  /** fputs()/fprintf(): writes the characters of `s` (latin-1) */
  puts(s: string): number {
    for (let i = 0; i < s.length; i++) if (this.putc(s.charCodeAt(i)) === EOF) return EOF;
    return 0;
  }

  /** fgets(buf, size): at most size - 1 bytes, up to and with the first '\n'; null at end of file */
  gets(size: number): string | null {
    let s = '';
    while (s.length < size - 1) {
      const c = this.getc();
      if (c === EOF) break;
      s += String.fromCharCode(c);
      if (c === 10) break;
    }
    return s.length === 0 ? null : s;
  }

  /** fseek(): 0 or -1 */
  seek(offset: number, whence: number): number {
    const base = whence === SEEK_SET ? 0 : whence === SEEK_CUR ? this.pos : this.size;
    const p = base + offset;
    if (p < 0) return -1;
    this.pos = p;
    this.eofFlag = false;
    return 0;
  }

  /** ftell() */
  tell(): number {
    return this.pos;
  }

  /** feof() */
  eof(): boolean {
    return this.eofFlag;
  }

  /** ferror() */
  error(): boolean {
    return this.errorFlag;
  }

  /** fflush(): 0, or EOF if the file cannot be written back */
  flush(): number {
    if (!this.dirty) return 0;
    if (!platform().files.write(this.name, this.data.slice(0, this.size))) {
      this.errorFlag = true;
      return EOF;
    }
    this.dirty = false;
    return 0;
  }

  /** fclose(): 0, or EOF if the file cannot be written back */
  close(): number {
    return this.flush();
  }

  /** The file's bytes (tests). */
  bytes(): Uint8Array {
    return this.data.slice(0, this.size);
  }
}
