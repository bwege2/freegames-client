// Port of src/adapter/util.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// Also what the adapter takes from its process: the host (AdapterHost from ../host.ts, plus stdout,
// which book.cpp's book_disp() and book_make.cpp print to directly), exit(), errno/strerror and a
// stdio FILE over the host's files.

import type { AdapterHost } from '../host.ts';
import { rand, RAND_MAX, sprintf, srand, strtoll, tolower, type Arg } from '../libc.ts';
import { now_cpu, now_real } from './posix.ts';

/** The adapter's process: AdapterHost plus the process's stdout (printf() in book.cpp, book_make.cpp). */
export type AdapterProcess = AdapterHost & {
   /** printf(): bytes to the process's stdout (shared with the frontend's printf) */
   stdout(s: string): void;
};

// constant variables

export const MaxFileNameSize = 256;

export const EXIT_SUCCESS = 0;
export const EXIT_FAILURE = 1;

// types

export class my_timer_t {
   start_real = 0.0;
   start_cpu = 0.0;
   elapsed_real = 0.0;
   elapsed_cpu = 0.0;
   running = false;
}

// the process

export let H: AdapterProcess;

export function set_host(host: AdapterProcess): void {
   H = host;
}

/** exit(code) unwinds the adapter: the host is told, the adapter stops for good */
export class ExitSignal extends Error {
   code: number;
   constructor(code: number) {
      super(`exit ${code}`);
      this.code = code;
   }
}

export function my_exit(code: number): never {
   H.exit(code);
   throw new ExitSignal(code);
}

// errno and strerror() for the errors the adapter reports

export const ENOENT = 2;
export const EACCES = 13;
export const EFAULT = 14;
export let errno = 0;

export function set_errno(e: number): void {
   errno = e;
}

export function strerror(e: number): string {
   switch (e) {
      case 0: return 'Success';
      case ENOENT: return 'No such file or directory';
      case EACCES: return 'Permission denied';
      case EFAULT: return 'Bad address';
      default: return `Unknown error ${e}`;
   }
}

/**
 * A stdio FILE on one of the host's files: the whole file is read at fopen() and written back at
 * fflush()/fclose() (modes with 'w', 'a' or '+').
 */
export class FILE {
   name: string;
   data: string; // the bytes (Latin-1)
   pos = 0;
   eof = false;
   writable: boolean;
   append: boolean;
   dirty = false;

   constructor(name: string, data: string, writable: boolean, append: boolean) {
      this.name = name;
      this.data = data;
      this.writable = writable;
      this.append = append;
   }
}

function to_bytes(s: string): Uint8Array {
   const b = new Uint8Array(s.length);
   for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
   return b;
}

function from_bytes(b: Uint8Array): string {
   let s = '';
   for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
   return s;
}

/** fopen(): null (and errno) when the file cannot be opened; a null name fails with EFAULT as in glibc */
export function fopen(name: string | null, mode: string): FILE | null {
   if (name === null) {
      errno = EFAULT;
      return null;
   }
   const read = mode[0] === 'r';
   const plus = mode.includes('+');
   if (read) {
      const data = H.files.read(name);
      if (data === null) {
         errno = ENOENT;
         return null;
      }
      return new FILE(name, from_bytes(data), plus, false);
   }
   if (mode[0] === 'w') {
      if (!H.files.write(name, new Uint8Array(0))) {
         errno = EACCES;
         return null;
      }
      return new FILE(name, '', true, false);
   }
   // 'a'
   const old = H.files.read(name);
   if (old === null && !H.files.write(name, new Uint8Array(0))) {
      errno = EACCES;
      return null;
   }
   const f = new FILE(name, old === null ? '' : from_bytes(old), true, true);
   f.pos = f.data.length;
   return f;
}

export function fflush(file: FILE): number {
   if (file.writable && file.dirty) {
      if (!H.files.write(file.name, to_bytes(file.data))) return -1;
      file.dirty = false;
   }
   return 0;
}

export function fclose(file: FILE): number {
   return fflush(file);
}

export const EOF = -1;

/** fgetc(): a byte, or EOF */
export function fgetc(file: FILE): number {
   if (file.pos >= file.data.length) {
      file.eof = true;
      return EOF;
   }
   return file.data.charCodeAt(file.pos++);
}

/** fputc() */
export function fputc(c: number, file: FILE): number {
   const ch = String.fromCharCode(c & 255);
   if (file.append) file.pos = file.data.length;
   if (file.pos >= file.data.length) file.data += ch;
   else file.data = file.data.slice(0, file.pos) + ch + file.data.slice(file.pos + 1);
   file.pos++;
   file.dirty = true;
   return c & 255;
}

/** fputs() */
export function fputs(s: string, file: FILE): void {
   if (file.append) file.pos = file.data.length;
   if (file.pos >= file.data.length) file.data += s;
   else file.data = file.data.slice(0, file.pos) + s + file.data.slice(file.pos + s.length);
   file.pos += s.length;
   file.dirty = true;
}

/** fgets(): at most size-1 bytes, up to and including '\n'; null at EOF before any byte */
export function fgets(size: number, file: FILE): string | null {
   if (file.pos >= file.data.length) {
      file.eof = true;
      return null;
   }
   let end = file.data.indexOf('\n', file.pos);
   end = end < 0 ? file.data.length : end + 1;
   if (end - file.pos > size - 1) end = file.pos + size - 1;
   const s = file.data.slice(file.pos, end);
   file.pos = end;
   if (file.pos >= file.data.length && !s.endsWith('\n')) file.eof = true;
   return s;
}

export function feof(file: FILE): boolean {
   return file.eof;
}

export const SEEK_SET = 0;
export const SEEK_END = 2;

export function fseek(file: FILE, offset: number, whence: number): number {
   file.pos = whence === SEEK_END ? file.data.length + offset : offset;
   file.eof = false;
   return 0;
}

export function ftell(file: FILE): number {
   return file.pos;
}

/** C strings end at the first NUL */
export function c_str(s: string): string {
   const i = s.indexOf('\0');
   return i < 0 ? s : s.slice(0, i);
}

/** strchr(set, c) != NULL, with C's quirk that the terminating NUL is found too ((char) c == 0) */
export function c_strchr(set: string, c: number): boolean {
   const ch = c & 255;
   if (ch === 0) return true;
   return set.includes(String.fromCharCode(ch));
}

// variables

let Error_ = false; // Error
let LogFile: FILE | null = null;

/** quit() of main.cpp, called by my_fatal() (set by main.ts) */
let quit_hook: () => void = () => {};

export function set_quit_hook(f: () => void): void {
   quit_hook = f;
}

// functions

// util_init()

export function util_init(): void {
   Error_ = false;
   // init log file
   LogFile = null;
}

// my_random_init()

export function my_random_init(): void {
   srand(H.clock.time() >>> 0); // srand(time(NULL))
}

// my_random_int()

export function my_random_int(n: number): number {
   return Math.floor(my_random_double() * n) | 0;
}

// my_random_double()

export function my_random_double(): number {
   return rand() / (RAND_MAX + 1.0);
}

// my_atoll()

export function my_atoll(string: string): bigint {
   // sscanf(string, "%lld", &n): n stays uninitialised when there is no number; 0 here
   return strtoll(string).value;
}

// my_round()

export function my_round(x: number): number {
   return Math.floor(x + 0.5) | 0;
}

// my_log_open()

export function my_log_open(file_name: string): void {
   LogFile = fopen(file_name, 'a');
}

// my_log_close()

export function my_log_close(): void {
   if (LogFile !== null) fclose(LogFile);
}

// my_log()

export function my_log(format: string, ...args: Arg[]): void {
   if (LogFile !== null) {
      fputs(sprintf(format, ...args), LogFile);
      fflush(LogFile); // line buffering
   }
}

// my_fatal()

export function my_fatal(format: string, ...args: Arg[]): void {
   const s = sprintf(format, ...args);
   H.stderr(s);
   if (LogFile !== null) {
      fputs(s, LogFile);
      fflush(LogFile);
   }
   if (Error_) { // recursive error
      my_log('POLYGLOT *** RECURSIVE ERROR ***\n');
      my_exit(EXIT_FAILURE);
      // abort();
   } else {
      Error_ = true;
      quit_hook();
   }
}

// my_file_read_line()

export function my_file_read_line(file: FILE, size: number): string | null {
   const string = fgets(size, file);
   if (string === null) {
      return null; // feof (no read errors on these files)
   }
   // remove CRs and LFs
   let out = '';
   for (const c of c_str(string)) {
      if (c !== '\r' && c !== '\n') out += c;
   }
   return out;
}

// my_string_empty()

export function my_string_empty(string: string | null): boolean {
   return string === null || string === '';
}

// my_string_equal()

export function my_string_equal(string_1: string, string_2: string): boolean {
   return string_1 === string_2;
}

// my_string_case_equal()

export function my_string_case_equal(string_1: string, string_2: string): boolean {
   if (string_1.length !== string_2.length) return false;
   for (let i = 0; i < string_1.length; i++) {
      if (tolower(string_1[i]) !== tolower(string_2[i])) return false;
   }
   return true;
}

// my_timer_reset()

export function my_timer_reset(timer: my_timer_t): void {
   timer.start_real = 0.0;
   timer.start_cpu = 0.0;
   timer.elapsed_real = 0.0;
   timer.elapsed_cpu = 0.0;
   timer.running = false;
}

// my_timer_start()

export function my_timer_start(timer: my_timer_t): void {
   timer.running = true;
   timer.start_real = now_real();
   timer.start_cpu = now_cpu();
}

// my_timer_stop()

export function my_timer_stop(timer: my_timer_t): void {
   timer.elapsed_real += now_real() - timer.start_real;
   timer.elapsed_cpu += now_cpu() - timer.start_cpu;
   timer.start_real = 0.0;
   timer.start_cpu = 0.0;
   timer.running = false;
}

// my_timer_elapsed_real()

export function my_timer_elapsed_real(timer: my_timer_t): number {
   let elapsed = timer.elapsed_real;
   if (timer.running) elapsed += now_real() - timer.start_real;
   if (elapsed < 0.0) elapsed = 0.0;
   return elapsed;
}

// my_timer_elapsed_cpu()

export function my_timer_elapsed_cpu(timer: my_timer_t): number {
   let elapsed = timer.elapsed_cpu;
   if (timer.running) elapsed += now_cpu() - timer.start_cpu;
   if (elapsed < 0.0) elapsed = 0.0;
   return elapsed;
}

// my_timer_cpu_usage()

export function my_timer_cpu_usage(timer: my_timer_t): number {
   const real = my_timer_elapsed_real(timer);
   const cpu = my_timer_elapsed_cpu(timer);
   if (real <= 0.0 || cpu <= 0.0) return 0.0;
   let usage = cpu / real;
   if (usage >= 1.0) usage = 1.0;
   return usage;
}

