// Port of src/adapter/engine.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// engine_get() blocks until the engine has sent a line: here it is a generator that yields while it
// waits (main.ts resumes it when the engine's data arrives).

import { io_close, io_get_line, io_get_update, io_init, io_line_ready, io_readable, io_send, io_send_queue, io_t } from './io.ts';
import { EXIT_SUCCESS, H, my_exit } from './util.ts';
import { sprintf, type Arg } from '../libc.ts';

// types

export class engine_t {
   io = new io_t();
}

// variables

export const Engine: engine_t[] = []; // Engine[0], made by engine_reset()

/** reset for a new process (main_adapter) */
export function engine_reset(): void {
   Engine[0] = new engine_t();
}

// functions

// engine_open()

export function engine_open(engine: engine_t): void {
   // engine->io->in_fd = pipefd_e2a[0]: the pipe main.ts fills with adapter_engine_data()
   engine.io.out_fd = (data: string) => H.toEngine(data); // pipefd_a2e[1]
   engine.io.name = 'ENGINE';
   io_init(engine.io);
}

// engine_close()

export function engine_close(engine: engine_t): void {
   io_close(engine.io);
}

// engine_get()

export function* engine_get(engine: engine_t, size: number): Generator<void, string, void> {
   while (!io_line_ready(engine.io)) {
      if (io_readable(engine.io)) io_get_update(engine.io);
      else yield; // read() blocks
   }
   const string = io_get_line(engine.io, size);
   if (string === null) { // EOF
      my_exit(EXIT_SUCCESS);
   }
   return string;
}

// engine_send()

export function engine_send(engine: engine_t, format: string, ...args: Arg[]): void {
   // format
   const string = sprintf(format, ...args);
   // send
   io_send(engine.io, '%s', string);
}

// engine_send_queue()

export function engine_send_queue(engine: engine_t, format: string, ...args: Arg[]): void {
   // format
   const string = sprintf(format, ...args);
   // send
   io_send_queue(engine.io, '%s', string);
}
