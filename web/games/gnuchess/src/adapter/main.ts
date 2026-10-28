// Port of src/adapter/main.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
//
// The adapter thread of GNU Chess, driven by the data that arrives on its two input pipes:
//   main_adapter(host)          the thread starts: main_adapter(0, 0) as components.cc calls it
//   adapter_frontend_data(data) bytes the frontend wrote to pipefd_f2a
//   adapter_engine_data(data)   bytes the engine wrote to pipefd_e2a
// The whole thread is one generator (adapter_main): where the original blocks in read() or select()
// it yields, and the next data resumes it. So uci_open()'s wait for "uciok" and the SyncStop waits
// behave as in C: lines from the frontend stay in their pipe meanwhile.
//
// GNU Chess calls main_adapter(0, 0): its argv branches ("make-book", "merge-book", "epd-test",
// an option file as argv[1]) are never taken, so book_merge.cpp, epd.cpp's epd_test() and search.cpp
// (only used by epd_test()) are not ported. "book add" calls book_make() directly (adapter.cpp).

import { adapter_loop_init, adapter_reset, engine_step, XBoard, xboard_step } from './adapter.ts';
import { attack_init } from './attack.ts';
import { book_clear, book_open, BookReadOnly, BookReadWrite } from './book.ts';
import { Engine, engine_open, engine_reset, engine_send } from './engine.ts';
import { game_reset } from './game.ts';
import { hash_init } from './hash.ts';
import { io_get_update, io_line_ready, io_readable } from './io.ts';
import { option_get_bool, option_get_string, option_init, option_set } from './option.ts';
import { piece_init } from './piece.ts';
import { square_init } from './square.ts';
import { Hash, Uci, uci_open, uci_reset, uci_send_isready, uci_send_option, uci_send_stop, uci_send_stop_sync } from './uci.ts';
import { errno, ExitSignal, fclose, H, fopen, my_fatal, my_file_read_line, my_log, my_log_open, my_random_init, my_string_case_equal, my_string_equal, set_host, set_quit_hook, strerror, util_init, type AdapterProcess } from './util.ts';
import { sscanf } from '../libc.ts';

// constants

// static const char * const Version = "1.4";
// static const bool BlockSignal = false; // true on Windows
// static const int SearchDepth = 63;
// static const double SearchTime = 3600.0;

type Task = Generator<void, void, void>;

// variables

let Init = false;

/** the running thread, and whether it is running right now (data written from inside it) */
let Thread: Task | null = null;
let Running = false;
let Again = false;

// functions

/**
 * main_adapter(): the adapter thread starts. Everything of a previous run is reset first. It runs
 * until it waits for input: host.initialized() is called once its initialisation is done (after the
 * engine's "uciok").
 */
export function main_adapter(host: AdapterProcess): void {
   set_host(host);
   set_quit_hook(quit_now);
   adapter_reset();
   engine_reset();
   uci_reset();
   game_reset();
   Init = false;
   Thread = adapter_main();
   Running = false;
   Again = false;
   run();
}

/** bytes arrived on the frontend's pipe to the adapter (pipefd_f2a) */
export function adapter_frontend_data(data: string): void {
   XBoard.io.in_fd.data += data;
   run();
}

/** bytes arrived on the engine's pipe to the adapter (pipefd_e2a) */
export function adapter_engine_data(data: string): void {
   Engine[0].io.in_fd.data += data;
   run();
}

/** has the adapter exited (my_fatal's second error, or a crash)? */
export function adapter_exited(): boolean {
   return Thread === null;
}

function run(): void {
   if (Thread === null) return;
   if (Running) {
      Again = true;
      return;
   }
   Running = true;
   try {
      do {
         Again = false;
         Thread.next();
      } while (Again && Thread !== null);
   } catch (e) {
      Thread = null;
      if (!(e instanceof ExitSignal)) throw e;
   } finally {
      Running = false;
   }
}

// main()

function* adapter_main(): Task {
   // init
   Init = false;
   util_init();
   option_init();
   square_init();
   piece_init();
   attack_init();
   hash_init();
   my_random_init();
   // build book: only with argv[1] "make-book" / "merge-book"
   // read options
   yield* parse_option(); // HACK: also launches the engine
   // EPD test: only with argv[1] "epd-test"
   // opening book
   book_clear();
   if (option_get_bool('Book')) {
      let mode = BookReadOnly;
      if (option_get_bool('BookLearn')) {
         mode = BookReadWrite;
      }
      book_open(option_get_string('BookFile'), mode);
   }
   // flag adapter initialized
   H.initialized();
   // adapter
   adapter_loop_init();
   while (true) {
      yield* adapter_step();
      // sleep( 0 );
   }
   // engine_send(Engine,"quit"); engine_close(Engine); (never reached)
}

// adapter_step() of adapter.cpp: the loop's body

function* adapter_step(): Task {
   // process buffered lines
   while (io_line_ready(XBoard.io)) yield* xboard_step(); // process available xboard lines
   while (io_line_ready(Engine[0].io)) yield* engine_step(); // process available engine lines
   // wait for something to read (no timeout)
   while (!io_readable(XBoard.io) && !io_readable(Engine[0].io)) yield;
   if (io_readable(XBoard.io)) io_get_update(XBoard.io); // read some xboard input
   if (io_readable(Engine[0].io)) io_get_update(Engine[0].io); // read some engine input
}

// parse_option()

function* parse_option(): Task {
   let line: string | null = '';
   let nv: { name: string; value: string } | null;
   const file_name = option_get_string('OptionFile');
   const file = fopen(file_name, 'r');
   if (file === null) my_fatal("Can't open file \"%s\": %s - using defaults\n", file_name, strerror(errno));
   // PolyGlot options (assumed first)
   if (file !== null) {
      while (true) {
         const next = my_file_read_line(file, 256);
         if (next === null) {
            my_fatal('parse_option(): missing [Engine] section\n');
         } else {
            line = next; // at EOF the buffer keeps the last line, as fgets() leaves it
         }
         if (my_string_case_equal(line, '[engine]')) break;
         if ((nv = parse_line(line)) !== null) option_set(nv.name, nv.value);
      }
   }
   if (option_get_bool('Log')) {
      my_log_open(option_get_string('LogFile') ?? '');
   }
   my_log('POLYGLOT *** START ***\n');
   my_log('POLYGLOT INI file "%s"\n', file_name);
   // engine options (assumed second and last)
   engine_open(Engine[0]);
   Init = true; // engine has been launched
   yield* uci_open(Uci[0], Engine[0]);
   if (file !== null) {
      while ((line = my_file_read_line(file, 256)) !== null) {
         if (line[0] === '[') my_fatal('parse_option(): unknown section %s\n', line);
         if ((nv = parse_line(line)) !== null) {
            if (nv.name === 'Hash') {
               const r = sscanf(nv.value, '%d');
               if (r.count === 1) Hash.HashSize = (r.values[0] as number) >>> 0;
            }
            uci_send_option(Uci[0], nv.name, '%s', nv.value);
         }
      }
   }
   uci_send_isready(Uci[0]);
   if (file !== null) {
      fclose(file);
   }
   if (my_string_equal(option_get_string('EngineName') ?? '', '<empty>')) {
      option_set('EngineName', Uci[0].name);
   }
}

// parse_line()

function parse_line(line: string): { name: string; value: string } | null {
   let ptr: number;
   // remove comments
   ptr = line.indexOf(';');
   if (ptr >= 0) line = line.slice(0, ptr);
   ptr = line.indexOf('#');
   if (ptr >= 0) line = line.slice(0, ptr);
   // split at '='
   ptr = line.indexOf('=');
   if (ptr < 0) return null;
   let name = line.slice(0, ptr);
   let value = line.slice(ptr + 1);
   // cleanup name
   let a = 0, b = name.length;
   while (name[a] === ' ') a++; // remove leading spaces
   while (b > a && name[b - 1] === ' ') b--; // remove trailing spaces
   name = name.slice(a, b);
   if (name === '') return null;
   // cleanup value
   a = 0;
   b = value.length;
   while (value[a] === ' ') a++; // remove leading spaces
   while (b > a && value[b - 1] === ' ') b--; // remove trailing spaces
   value = value.slice(a, b);
   if (value === '') return null;
   // end
   return { name, value };
}

// quit()

export function* quit(): Task {
   my_log('POLYGLOT *** QUIT ***\n');
   if (Init) {
      yield* stop_search();
      engine_send(Engine[0], 'quit');
   }
}

/** quit() as my_fatal() calls it: it cannot wait, so a SyncStop stop does not wait for "bestmove" */
function quit_now(): void {
   my_log('POLYGLOT *** QUIT ***\n');
   if (Init) {
      if (Uci[0].searching) {
         my_log('POLYGLOT STOP SEARCH\n');
         uci_send_stop(Uci[0]);
      }
      engine_send(Engine[0], 'quit');
   }
}

// stop_search()

function* stop_search(): Task {
   if (Init && Uci[0].searching) {
      my_log('POLYGLOT STOP SEARCH\n');
      /*
      engine_send(Engine,"stop");
      Uci->searching = false;
      */
      if (option_get_bool('SyncStop')) {
         yield* uci_send_stop_sync(Uci[0]);
      } else {
         uci_send_stop(Uci[0]);
      }
   }
}
