// The frontend's <stdio.h>: printf and friends on the process's stdout, and the files it opens (EPD,
// PGN, the log and game files of `name`, players.dat). The process (../main.ts) sets the streams.
import { sprintf, bytes, bstr, type Arg } from '../libc.ts';
import type { Files, Clock } from '../host.ts';
import type { Stream } from './common.ts';

export const stdio = {
  /** the bytes the program writes to stdout (a byte string) */
  stdout: (_s: string): void => {},
  stderr: (_s: string): void => {},
  files: null as unknown as Files,
  clock: null as unknown as Clock,
};

export const stdoutStream: Stream = { write: (s) => stdio.stdout(s) };

export function printf(fmt: string, ...args: Arg[]): number {
  const s = sprintf(fmt, ...args);
  stdio.stdout(s);
  return s.length;
}
/** puts(): the string and a newline */
export function puts(s: string): void {
  stdio.stdout(s + '\n');
}
export function putchar(c: string): void {
  stdio.stdout(c);
}
export function fprintf(fp: Stream, fmt: string, ...args: Arg[]): void {
  fp.write(sprintf(fmt, ...args));
}
export function fprintf_stderr(fmt: string, ...args: Arg[]): void {
  stdio.stderr(sprintf(fmt, ...args));
}

/** A FILE * opened for writing ("w" truncates, "a" appends); the data reaches the file on each write. */
export class WFile implements Stream {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
  }
  write(s: string): void {
    stdio.files.append(this.name, bytes(s));
  }
}

/** fopen(name, "w") / fopen(name, "a"): null when the file cannot be created */
export function fopenWrite(name: string, mode: 'w' | 'a'): WFile | null {
  if (mode === 'w') {
    if (!stdio.files.write(name, new Uint8Array(0))) return null;
  } else if (!stdio.files.exists(name)) {
    if (!stdio.files.write(name, new Uint8Array(0))) return null;
  }
  return new WFile(name);
}

/** A FILE * opened for reading, with fgets() and feof() as stdio has them. */
export class RFile {
  private data: string;
  private pos = 0;
  private eof = false;
  constructor(data: string) {
    this.data = data;
  }
  /**
   * fgets(buf, size, fp): at most size-1 chars, up to and including '\n'. Returns null at end of file
   * (and sets the EOF flag); reading the last line without a '\n' also sets it.
   */
  fgets(size: number): string | null {
    if (this.pos >= this.data.length) {
      this.eof = true;
      return null;
    }
    let end = this.pos;
    const max = this.pos + size - 1;
    while (end < this.data.length && end < max) {
      if (this.data[end++] === '\n') break;
    }
    const line = this.data.slice(this.pos, end);
    this.pos = end;
    if (this.pos >= this.data.length && !line.endsWith('\n')) this.eof = true;
    return line;
  }
  feof(): boolean {
    return this.eof;
  }
  /** the rest of the file (fread until EOF) */
  readAll(): string {
    const s = this.data.slice(this.pos);
    this.pos = this.data.length;
    this.eof = true;
    return s;
  }
}

/** fopen(name, "r"): null when it cannot be opened */
export function fopenRead(name: string): RFile | null {
  const b = stdio.files.read(name);
  return b ? new RFile(bstr(b)) : null;
}

/** access(name, F_OK) == 0 */
export const access = (name: string): boolean => stdio.files.exists(name);
