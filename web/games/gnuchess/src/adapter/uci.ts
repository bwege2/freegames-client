// Port of src/adapter/uci.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// The functions that wait for the engine (uci_open(), the *_sync() ones) are generators: they yield
// while the engine has not answered yet.

import { board_copy, board_mobility, board_start, board_t } from './board.ts';
import { Engine, engine_get, engine_send, type engine_t } from './engine.ts';
import { line_clear, line_copy, line_from_can, line_new, LineSize } from './line.ts';
import { move_from_can, MoveNone } from './move.ts';
import { move_do } from './move_do.ts';
import { option_get_int } from './option.ts';
import { parse_add_keyword, parse_close, parse_get_string, parse_get_word, parse_open, parse_t } from './parse.ts';
import { my_atoll, my_fatal, my_log, my_string_case_equal, my_string_empty, my_string_equal } from './util.ts';
import { atoi, sprintf, sscanf, type Arg } from '../libc.ts';

// constants

export const OptionNb = 256;

const UseDebug = false;

const StringSize = 4096;

// types

interface option_t {
   name: string;
   value: string;
}

export class uci_t {
   engine: engine_t | null = null;
   name = '';
   author = '';
   option_nb = 0;
   option: option_t[] = [];
   ready = false;
   ready_nb = 0;
   searching = false;
   pending_nb = 0;
   board = new board_t();
   best_move = 0;
   ponder_move = 0;
   score = 0;
   depth = 0;
   sel_depth = 0;
   pv = line_new();
   best_score = 0;
   best_depth = 0;
   best_sel_depth = 0;
   best_pv = line_new();
   node_nb = 0n; // sint64
   time = 0.0;
   speed = 0.0;
   cpu = 0.0;
   hash = 0.0;
   current_line = line_new();
   root_move = 0;
   root_move_pos = 0;
   root_move_nb = 0;
}

export const EVENT_NONE = 0;
export const EVENT_UCI = 1 << 0;
export const EVENT_READY = 1 << 1;
export const EVENT_STOP = 1 << 2;
export const EVENT_MOVE = 1 << 3;
export const EVENT_PV = 1 << 4;
export const EVENT_DEPTH = 1 << 5;

// variables

export const Uci: uci_t[] = []; // Uci[0], made by uci_reset()

/** unsigned int HashSize: the engine's hash size in MB, as the adapter believes it */
export const Hash = { HashSize: 0 };

/** reset for a new process (main_adapter) */
export function uci_reset(): void {
   Uci[0] = new uci_t();
   Hash.HashSize = 0;
}

// functions

// uci_is_ok()

export function uci_is_ok(uci: uci_t): boolean {
   if (uci.engine === null) return false;
   if (uci.option_nb < 0 || uci.option_nb >= OptionNb) return false;
   return true;
}

// uci_open()

export function* uci_open(uci: uci_t, engine: engine_t): Generator<void, void, void> {
   let event: number;
   // init
   uci.engine = engine;
   uci.name = '<empty>';
   uci.author = '<empty>';
   uci.option_nb = 0;
   uci.option = [];
   uci.ready_nb = 0;
   uci.searching = false;
   uci.pending_nb = 0;
   board_start(uci.board);
   uci_clear(uci);
   // send "uci" and wait for "uciok"
   engine_send(uci.engine, 'uci');
   do {
      const string = yield* engine_get(uci.engine, StringSize);
      event = uci_parse(uci, string);
   } while ((event & EVENT_UCI) === 0);
}

// uci_close()

export function uci_close(uci: uci_t): void {
   uci.engine = null;
   uci.option = [];
   uci.option_nb = 0;
}

// uci_clear()

export function uci_clear(uci: uci_t): void {
   uci.best_move = MoveNone;
   uci.ponder_move = MoveNone;
   uci.score = 0;
   uci.depth = 0;
   uci.sel_depth = 0;
   line_clear(uci.pv);
   uci.best_score = 0;
   uci.best_depth = 0;
   uci.best_sel_depth = 0;
   line_clear(uci.best_pv);
   uci.node_nb = 0n;
   uci.time = 0.0;
   uci.speed = 0.0;
   uci.cpu = 0.0;
   uci.hash = 0.0;
   line_clear(uci.current_line);
   uci.root_move = MoveNone;
   uci.root_move_pos = 0;
   uci.root_move_nb = board_mobility(uci.board);
}

// uci_send_isready()

export function uci_send_isready(uci: uci_t): void {
   engine_send(uci.engine as engine_t, 'isready');
   uci.ready_nb++;
}

// uci_send_isready_sync()

export function* uci_send_isready_sync(uci: uci_t): Generator<void, void, void> {
   let event: number;
   // send "isready" and wait for "readyok"
   uci_send_isready(uci);
   do {
      const string = yield* engine_get(uci.engine as engine_t, StringSize);
      event = uci_parse(uci, string);
   } while ((event & EVENT_READY) === 0);
}

// uci_send_stop()

export function uci_send_stop(uci: uci_t): void {
   engine_send(Engine[0], 'stop');
   uci.searching = false;
}

// uci_send_stop_sync()

export function* uci_send_stop_sync(uci: uci_t): Generator<void, void, void> {
   let event: number;
   // send "stop" and wait for "bestmove"
   uci_send_stop(uci);
   do {
      const string = yield* engine_get(uci.engine as engine_t, StringSize);
      event = uci_parse(uci, string);
   } while ((event & EVENT_STOP) === 0);
}

// uci_send_ucinewgame()

export function uci_send_ucinewgame(uci: uci_t): void {
   if (option_get_int('UCIVersion') >= 2) {
      engine_send(uci.engine as engine_t, 'ucinewgame');
   }
}

// uci_option_exist()

export function uci_option_exist(uci: uci_t, option: string): boolean {
   // scan options
   for (let i = 0; i < uci.option_nb; i++) {
      const opt = uci.option[i];
      if (my_string_case_equal(opt.name, option)) return true;
   }
   return false;
}

// uci_send_option()

export function uci_send_option(uci: uci_t, option: string, format: string, ...args: Arg[]): void {
   // format
   const value = sprintf(format, ...args);
   if (UseDebug) my_log('POLYGLOT OPTION %s VALUE %s\n', option, value);
   // scan options
   for (let i = 0; i < uci.option_nb; i++) {
      const opt = uci.option[i];
      if (my_string_case_equal(opt.name, option) && !my_string_equal(opt.value, value)) {
         engine_send(uci.engine as engine_t, 'setoption name %s value %s', option, value);
         opt.value = value;
      }
   }
}

// uci_parse()

export function uci_parse(uci: uci_t, string: string): number {
   let event: number;
   const parse = new parse_t();
   // init
   event = EVENT_NONE;
   // parse
   parse_open(parse, string);
   const command = parse_get_word(parse, StringSize);
   if (command !== '') {
      const argument = parse_get_string(parse, StringSize);
      if (UseDebug) my_log('POLYGLOT COMMAND "%s" ARGUMENT "%s"\n', command, argument);
      if (my_string_equal(command, 'bestmove')) {
         // search end
         if (uci.searching && uci.pending_nb === 1) {
            // current search
            uci.searching = false;
            uci.pending_nb--;
            event = parse_bestmove(uci, argument); // updates uci->best_move and uci->ponder_move
         } else {
            // obsolete search
            if (uci.pending_nb > 0) {
               uci.pending_nb--;
               if (uci.pending_nb === 0) event = EVENT_STOP;
            }
         }
      } else if (my_string_equal(command, 'id')) {
         parse_id(uci, argument);
      } else if (my_string_equal(command, 'info')) {
         // search information
         if (uci.searching && uci.pending_nb === 1) { // current search
            event = parse_info(uci, argument);
         }
      } else if (my_string_equal(command, 'option')) {
         parse_option(uci, argument);
      } else if (my_string_equal(command, 'readyok')) {
         // engine is ready
         if (uci.ready_nb > 0) {
            uci.ready_nb--;
            if (uci.ready_nb === 0) event = EVENT_READY;
         }
      } else if (my_string_equal(command, 'uciok')) {
         event = EVENT_UCI;
      } else {
         if (UseDebug) my_log('POLYGLOT unknown command "%s"\n', command);
      }
   }
   parse_close(parse);
   return event;
}

// parse_bestmove()

function parse_bestmove(uci: uci_t, string: string): number {
   const parse = new parse_t();
   const command = 'bestmove';
   const board = new board_t();
   // init
   parse_open(parse, string);
   parse_add_keyword(parse, 'ponder');
   // bestmove
   let argument = parse_get_string(parse, StringSize);
   if (argument === '') {
      my_fatal('parse_bestmove(): missing argument\n');
   }
   uci.best_move = move_from_can(argument, uci.board);
   if (uci.best_move === MoveNone) my_fatal('parse_bestmove(): not a move "%s"\n', argument);
   // loop
   let option: string;
   while ((option = parse_get_word(parse, StringSize)) !== '') {
      argument = parse_get_string(parse, StringSize);
      if (UseDebug) my_log('POLYGLOT COMMAND "%s" OPTION "%s" ARGUMENT "%s"\n', command, option, argument);
      if (my_string_equal(option, 'ponder')) {
         board_copy(board, uci.board);
         move_do(board, uci.best_move);
         uci.ponder_move = move_from_can(argument, board);
         // if (uci->ponder_move == MoveNone) my_fatal("parse_bestmove(): not a move \"%s\"\n",argument);
      } else {
         my_log('POLYGLOT unknown option "%s" for command "%s"\n', option, command);
      }
   }
   parse_close(parse);
   return EVENT_MOVE;
}

// parse_id()

function parse_id(uci: uci_t, string: string): void {
   const parse = new parse_t();
   const command = 'id';
   // init
   parse_open(parse, string);
   parse_add_keyword(parse, 'author');
   parse_add_keyword(parse, 'name');
   // loop
   let option: string;
   while ((option = parse_get_word(parse, StringSize)) !== '') {
      const argument = parse_get_string(parse, StringSize);
      if (UseDebug) my_log('POLYGLOT COMMAND "%s" OPTION "%s" ARGUMENT "%s"\n', command, option, argument);
      if (my_string_equal(option, 'author')) {
         uci.author = argument;
      } else if (my_string_equal(option, 'name')) {
         uci.name = argument;
      } else {
         my_log('POLYGLOT unknown option "%s" for command "%s"\n', option, command);
      }
   }
   parse_close(parse);
   if (UseDebug) my_log('POLYGLOT engine name "%s" author "%s"\n', uci.name, uci.author);
}

// parse_info()

function parse_info(uci: uci_t, string: string): number {
   let event: number;
   const parse = new parse_t();
   const command = 'info';
   let n: number;
   let ln: bigint;
   // init
   event = EVENT_NONE;
   parse_open(parse, string);
   parse_add_keyword(parse, 'cpuload');
   parse_add_keyword(parse, 'currline');
   parse_add_keyword(parse, 'currmove');
   parse_add_keyword(parse, 'currmovenumber');
   parse_add_keyword(parse, 'depth');
   parse_add_keyword(parse, 'hashfull');
   parse_add_keyword(parse, 'multipv');
   parse_add_keyword(parse, 'nodes');
   parse_add_keyword(parse, 'nps');
   parse_add_keyword(parse, 'pv');
   parse_add_keyword(parse, 'refutation');
   parse_add_keyword(parse, 'score');
   parse_add_keyword(parse, 'seldepth');
   parse_add_keyword(parse, 'string');
   parse_add_keyword(parse, 'tbhits');
   parse_add_keyword(parse, 'time');
   // loop
   let option: string;
   while ((option = parse_get_word(parse, StringSize)) !== '') {
      const argument = parse_get_string(parse, StringSize);
      if (UseDebug) my_log('POLYGLOT COMMAND "%s" OPTION "%s" ARGUMENT "%s"\n', command, option, argument);
      if (my_string_equal(option, 'cpuload')) {
         n = atoi(argument);
         if (n >= 0) uci.cpu = n / 1000.0;
      } else if (my_string_equal(option, 'currline')) {
         line_from_can(uci.current_line, uci.board, argument, LineSize);
      } else if (my_string_equal(option, 'currmove')) {
         uci.root_move = move_from_can(argument, uci.board);
      } else if (my_string_equal(option, 'currmovenumber')) {
         n = atoi(argument);
         if (n >= 1 && n <= uci.root_move_nb) {
            uci.root_move_pos = n - 1;
         }
      } else if (my_string_equal(option, 'depth')) {
         n = atoi(argument);
         if (n >= 0) {
            if (n > uci.depth) event |= EVENT_DEPTH;
            uci.depth = n;
         }
      } else if (my_string_equal(option, 'hashfull')) {
         n = atoi(argument);
         if (n >= 0) uci.hash = n / 1000.0;
      } else if (my_string_equal(option, 'multipv')) {
         n = atoi(argument);
      } else if (my_string_equal(option, 'nodes')) {
         ln = my_atoll(argument);
         if (ln >= 0n) uci.node_nb = ln;
      } else if (my_string_equal(option, 'nps')) {
         n = atoi(argument);
         if (n >= 0) uci.speed = n;
      } else if (my_string_equal(option, 'pv')) {
         line_from_can(uci.pv, uci.board, argument, LineSize);
         event |= EVENT_PV;
      } else if (my_string_equal(option, 'refutation')) {
         line_from_can(uci.pv, uci.board, argument, LineSize);
      } else if (my_string_equal(option, 'score')) {
         parse_score(uci, argument);
      } else if (my_string_equal(option, 'seldepth')) {
         n = atoi(argument);
         if (n >= 0) uci.sel_depth = n;
      } else if (my_string_equal(option, 'string')) {
         // TODO: argument to EOS
      } else if (my_string_equal(option, 'tbhits')) {
         ln = my_atoll(argument);
      } else if (my_string_equal(option, 'time')) {
         n = atoi(argument);
         if (n >= 0) uci.time = n / 1000.0;
      } else {
         my_log('POLYGLOT unknown option "%s" for command "%s"\n', option, command);
      }
   }
   parse_close(parse);
   // update display
   if ((event & EVENT_PV) !== 0) {
      uci.best_score = uci.score;
      uci.best_depth = uci.depth;
      uci.best_sel_depth = uci.sel_depth;
      line_copy(uci.best_pv, uci.pv);
   }
   return event;
}

// parse_option()

function parse_option(uci: uci_t, string: string): void {
   const parse = new parse_t();
   const command = 'option';
   // init
   if (uci.option_nb >= OptionNb) return;
   const opt: option_t = { name: '<empty>', value: '<empty>' };
   uci.option[uci.option_nb] = opt;
   uci.option_nb++;
   parse_open(parse, string);
   parse_add_keyword(parse, 'default');
   parse_add_keyword(parse, 'max');
   parse_add_keyword(parse, 'min');
   parse_add_keyword(parse, 'name');
   parse_add_keyword(parse, 'type');
   parse_add_keyword(parse, 'var');
   // loop
   let option: string;
   while ((option = parse_get_word(parse, StringSize)) !== '') {
      const argument = parse_get_string(parse, StringSize);
      if (UseDebug) my_log('POLYGLOT COMMAND "%s" OPTION "%s" ARGUMENT "%s"\n', command, option, argument);
      if (my_string_equal(option, 'default')) {
         // ASSERT(!my_string_empty(argument)); // HACK for Pepito
         if (!my_string_empty(argument)) {
            opt.value = argument;
         }
         if (opt.name === 'Hash') {
            const r = sscanf(opt.value, '%d');
            if (r.count === 1) Hash.HashSize = (r.values[0] as number) >>> 0;
         }
      } else if (my_string_equal(option, 'max')) {
         // dummy
      } else if (my_string_equal(option, 'min')) {
         // dummy
      } else if (my_string_equal(option, 'name')) {
         if (!my_string_empty(argument)) {
            opt.name = argument;
         }
      } else if (my_string_equal(option, 'type')) {
         // dummy
      } else if (my_string_equal(option, 'var')) {
         // dummy
      } else {
         my_log('POLYGLOT unknown option "%s" for command "%s"\n', option, command);
      }
   }
   parse_close(parse);
   if (UseDebug) my_log('POLYGLOT option name "%s" value "%s"\n', opt.name, opt.value);
}

// parse_score()

function parse_score(uci: uci_t, string: string): void {
   const parse = new parse_t();
   const command = 'score';
   let n: number;
   // init
   parse_open(parse, string);
   parse_add_keyword(parse, 'cp');
   parse_add_keyword(parse, 'lowerbound');
   parse_add_keyword(parse, 'mate');
   parse_add_keyword(parse, 'upperbound');
   // loop
   let option: string;
   while ((option = parse_get_word(parse, StringSize)) !== '') {
      const argument = parse_get_string(parse, StringSize);
      if (UseDebug) my_log('POLYGLOT COMMAND "%s" OPTION "%s" ARGUMENT "%s"\n', command, option, argument);
      if (my_string_equal(option, 'cp')) {
         n = atoi(argument);
         uci.score = n;
      } else if (my_string_equal(option, 'lowerbound')) {
         // dummy
      } else if (my_string_equal(option, 'mate')) {
         n = atoi(argument);
         uci.score = mate_score(n);
      } else if (my_string_equal(option, 'upperbound')) {
         // dummy
      } else {
         my_log('POLYGLOT unknown option "%s" for command "%s"\n', option, command);
      }
   }
   parse_close(parse);
}

// mate_score()

function mate_score(dist: number): number {
   if (dist > 0) {
      return +option_get_int('MateScore') - (+dist) * 2 + 1;
   } else if (dist < 0) {
      return -option_get_int('MateScore') + (-dist) * 2;
   }
   return 0;
}
