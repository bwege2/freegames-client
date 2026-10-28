// Port of src/adapter/io.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// A file descriptor is a pipe_t here: the bytes written to it that its reader has not read yet. The
// reader's read() takes what is there (at most what fits in its buffer); writing goes to a function.

import { my_fatal, my_log } from './util.ts';
import { sprintf, type Arg } from '../libc.ts';

// constants

export const BufferSize = 16384;

const UseDebug = false;
const UseCR = false; // true on Windows

const LF = '\n';
const CR = '\r';

// types

/** the read end of a pipe: bytes written to it and not read yet */
export class pipe_t {
   data = '';
}

export class io_t {
   /** in_fd: the pipe this io reads */
   in_fd: pipe_t = new pipe_t();
   /** out_fd: write() on the pipe this io writes */
   out_fd: ((data: string) => void) | null = null;
   name = '';
   in_eof = false;
   in_buffer = '';
   out_buffer = '';
}

// functions

// io_is_ok()

export function io_is_ok(io: io_t): boolean {
   if (io.in_buffer.length > BufferSize) return false;
   if (io.out_buffer.length > BufferSize) return false;
   return true;
}

// io_init()

export function io_init(io: io_t): void {
   io.in_eof = false;
   io.in_buffer = '';
   io.out_buffer = '';
}

// io_close()

export function io_close(io: io_t): void {
   my_log('> %s EOF\n', io.name);
   io.out_fd = null;
}

/** select(): is there something to read on io's pipe? */
export function io_readable(io: io_t): boolean {
   return io.in_fd.data.length > 0;
}

// io_get_update(): the caller has made sure there is something to read (select(), or it waits)

export function io_get_update(io: io_t): void {
   // init
   const pos = io.in_buffer.length;
   const size = BufferSize - pos;
   if (size <= 0) my_fatal('io_get_update(): buffer overflow\n');
   // read as many data as possible
   const n = Math.min(Math.max(size, 0), io.in_fd.data.length);
   if (UseDebug) my_log('POLYGLOT read %d byte%s from %s\n', n, n > 1 ? 's' : '', io.name);
   if (n > 0) { // at least one character was read
      io.in_buffer += io.in_fd.data.slice(0, n);
      io.in_fd.data = io.in_fd.data.slice(n);
   }
}

// io_line_ready()

export function io_line_ready(io: io_t): boolean {
   if (io.in_eof) return true;
   if (io.in_buffer.includes(LF)) return true; // buffer contains LF
   return false;
}

// io_get_line(): the line, or null at EOF

export function io_get_line(io: io_t, size: number): string | null {
   let src = 0;
   let string = '';
   while (true) {
      // test for end of buffer
      if (src >= io.in_buffer.length) {
         if (io.in_eof) {
            my_log('< %s EOF\n', io.name);
            return null;
         } else {
            my_fatal('io_get_line(): no EOL in buffer\n');
            return null;
         }
      }
      // test for end of string
      if (string.length >= size) my_fatal('io_get_line(): buffer overflow\n');
      // copy the next character
      const c = io.in_buffer[src++];
      if (c === LF) { // LF => line complete
         break;
      } else if (c !== CR) { // skip CRs
         string += c;
      }
   }
   // shift the buffer
   io.in_buffer = io.in_buffer.slice(src);
   // return
   my_log('< %s %s\n', io.name, string);
   return string;
}

// io_send()

export function io_send(io: io_t, format: string, ...args: Arg[]): void {
   // format
   const string = sprintf(format, ...args);
   // append string to buffer
   const len = string.length;
   if (io.out_buffer.length + len > BufferSize - 2) my_fatal('io_send(): buffer overflow\n');
   io.out_buffer += string;
   // log
   my_log('> %s %s\n', io.name, io.out_buffer);
   // append EOL to buffer
   if (UseCR) io.out_buffer += CR;
   io.out_buffer += LF;
   // flush buffer
   if (UseDebug) my_log('POLYGLOT writing %d byte%s to %s\n', io.out_buffer.length, io.out_buffer.length > 1 ? 's' : '', io.name);
   my_write(io.out_fd, io.out_buffer);
   io.out_buffer = '';
}

// io_send_queue()

export function io_send_queue(io: io_t, format: string, ...args: Arg[]): void {
   // format
   const string = sprintf(format, ...args);
   // append string to buffer
   const len = string.length;
   if (io.out_buffer.length + len > BufferSize - 2) my_fatal('io_send_queue(): buffer overflow\n');
   io.out_buffer += string;
}

// my_write()

function my_write(fd: ((data: string) => void) | null, string: string): void {
   if (fd !== null) fd(string);
}
