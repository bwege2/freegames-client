// Port of src/engine/protocol.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// loop() is split: loop_init() is its initialisation, loop_step(string) handles one line (the caller
// reads it: the browser's worker from its messages, the tests from their script). event() reads the
// lines that arrive during a search from the host, as the original polls its pipe.

import { atoi, sprintf, type Arg } from '../libc.ts';
import { COLOUR_IS_WHITE } from './colour.ts';
import { book_open } from './book.ts';
import { eval_init } from './eval.ts';
import { board_from_fen, StartFen } from './fen.ts';
import { material_alloc, material_init } from './material.ts';
import { move_from_string, move_is_ok, move_to_string, MoveNone } from './move.ts';
import { move_do, undo_t } from './move_do.ts';
import { option_get_bool, option_get_int, option_get_string, option_list, option_set } from './option.ts';
import { pawn_alloc, pawn_init } from './pawn.ts';
import { input_available } from './posix.ts';
import { pst_init } from './pst.ts';
import { search, SearchBest, SearchCurrent, SearchInfo, SearchInput, search_clear, search_update_current } from './search.ts';
import { set_use_trans } from './search_full.ts';
import { Trans, trans_alloc, trans_clear, trans_free, trans_stats } from './trans.ts';
import { host, my_atoll, my_fatal, my_string_equal } from './util.ts';

const VERSION = '6.3.0'; // config.h

// constants
const NormalRatio = 1.0;
const PonderRatio = 1.25;

// variables
let Init = false;
let Searching = false; // search in progress?
let Infinite = false; // infinite or ponder mode?
let Delay = false; // postpone "bestmove" in infinite/ponder mode?

/** whether a search is running, and whether a finished infinite/ponder search waits for "stop"/"ponderhit" */
export function engine_state(): { searching: boolean; delay: boolean } {
  return { searching: Searching, delay: Delay };
}

// functions

// loop(): its initialisation
export function loop_init(): void {
  // init (to help debugging)
  Init = false;
  Searching = false;
  Infinite = false;
  Delay = false;
  search_clear();
  board_from_fen(SearchInput.board, StartFen);
}

// init()
function init(): void {
  if (!Init) {
    // late initialisation
    Init = true;
    if (option_get_bool('OwnBook')) {
      book_open(option_get_string('BookFile'));
    }
    trans_alloc(Trans);
    pawn_init();
    pawn_alloc();
    material_init();
    material_alloc();
    pst_init();
    eval_init();
  }
}

// event()
export function event(): void {
  while (!SearchInfo.stop && input_available()) {
    const string = get();
    if (string === null) break;
    loop_step(string);
  }
}

// loop_step()
export function loop_step(string: string): void {
  // parse
  if (string_start_with(string, 'debug ')) {
    // dummy
  } else if (string_start_with(string, 'go ')) {
    if (!Searching && !Delay) {
      init();
      parse_go(string);
    }
  } else if (string_equal(string, 'isready')) {
    if (!Searching && !Delay) {
      init();
    }
    send('readyok'); // no need to wait when searching (dixit SMK)
  } else if (string_equal(string, 'ponderhit')) {
    if (Searching) {
      SearchInput.infinite = false;
      Infinite = false;
    } else if (Delay) {
      send_best_move();
      Delay = false;
    }
  } else if (string_start_with(string, 'position ')) {
    if (!Searching && !Delay) {
      init();
      parse_position(string);
    }
  } else if (string_equal(string, 'quit')) {
    set_engine_to_quit();
  } else if (string_start_with(string, 'setoption ')) {
    if (!Searching && !Delay) {
      parse_setoption(string);
    }
  } else if (string_equal(string, 'stop')) {
    if (Searching) {
      SearchInfo.stop = true;
      Infinite = false;
    } else if (Delay) {
      send_best_move();
      Delay = false;
    }
  } else if (string_equal(string, 'uci')) {
    send('id name GNU Chess ' + VERSION);
    send('id author GNU Chess team');
    option_list();
    send('uciok');
  } else if (string_equal(string, 'ucinewgame')) {
    if (!Searching && !Delay && Init) {
      trans_clear(Trans);
    }
  } else if (string_equal(string, 'hashon')) {
    set_use_trans(true);
  } else if (string_equal(string, 'hashoff')) {
    set_use_trans(false);
  }
}

// parse_go()
function parse_go(string: string): void {
  // init
  let infinite = false;
  let ponder = false;
  let depth = -1;
  let mate = -1;
  let movestogo = -1;
  let binc = -1.0;
  let btime = -1.0;
  let movetime = -1.0;
  let winc = -1.0;
  let wtime = -1.0;
  // parse: strtok(string," ")
  const tokens = string.split(' ').filter((t) => t !== '');
  let t = 1; // skip "go"
  const next = (): string => {
    const ptr = t < tokens.length ? tokens[t++] : null;
    if (ptr === null) my_fatal('parse_go(): missing argument\n');
    return ptr;
  };
  for (; t < tokens.length;) {
    const ptr = tokens[t++];
    if (string_equal(ptr, 'binc')) {
      binc = atoi(next()) / 1000.0;
    } else if (string_equal(ptr, 'btime')) {
      btime = atoi(next()) / 1000.0;
    } else if (string_equal(ptr, 'depth')) {
      depth = atoi(next());
    } else if (string_equal(ptr, 'infinite')) {
      infinite = true;
    } else if (string_equal(ptr, 'mate')) {
      mate = atoi(next());
    } else if (string_equal(ptr, 'movestogo')) {
      movestogo = atoi(next());
    } else if (string_equal(ptr, 'movetime')) {
      movetime = atoi(next()) / 1000.0;
    } else if (string_equal(ptr, 'nodes')) {
      my_atoll(next());
    } else if (string_equal(ptr, 'ponder')) {
      ponder = true;
    } else if (string_equal(ptr, 'searchmoves')) {
      // dummy
    } else if (string_equal(ptr, 'winc')) {
      winc = atoi(next()) / 1000.0;
    } else if (string_equal(ptr, 'wtime')) {
      wtime = atoi(next()) / 1000.0;
    }
  }
  // init
  search_clear();
  // depth limit
  if (depth >= 0) {
    SearchInput.depth_is_limited = true;
    SearchInput.depth_limit = depth;
  } else if (mate >= 0) {
    SearchInput.depth_is_limited = true;
    SearchInput.depth_limit = mate * 2 - 1; // HACK: move -> ply
  }
  // time limit
  let time: number, inc: number;
  if (COLOUR_IS_WHITE(SearchInput.board.turn)) {
    time = wtime;
    inc = winc;
  } else {
    time = btime;
    inc = binc;
  }
  if (movestogo <= 0 || movestogo > 30) movestogo = 30; // HACK
  if (inc < 0.0) inc = 0.0;
  if (movetime >= 0.0) {
    // fixed time
    SearchInput.time_is_limited = true;
    SearchInput.time_limit_1 = movetime * 5.0; // HACK to avoid early exit
    SearchInput.time_limit_2 = movetime;
  } else if (time >= 0.0) {
    // dynamic allocation
    let time_max = time * 0.95 - 1.0;
    if (time_max < 0.0) time_max = 0.0;
    SearchInput.time_is_limited = true;
    let alloc = (time_max + inc * (movestogo - 1)) / movestogo;
    alloc *= (option_get_bool('Ponder') ? PonderRatio : NormalRatio);
    if (alloc > time_max) alloc = time_max;
    SearchInput.time_limit_1 = alloc;
    alloc = (time_max + inc * (movestogo - 1)) * 0.5;
    if (alloc < SearchInput.time_limit_1) alloc = SearchInput.time_limit_1;
    if (alloc > time_max) alloc = time_max;
    SearchInput.time_limit_2 = alloc;
  }
  if (infinite || ponder) SearchInput.infinite = true;
  // search
  Searching = true;
  Infinite = infinite || ponder;
  Delay = false;
  search();
  search_update_current();
  Searching = false;
  Delay = Infinite;
  if (!Delay) send_best_move();
}

// parse_position(): the string as C sees it ('\0' past its end)
function parse_position(string: string): void {
  // init
  const fen = string.indexOf('fen ');
  const moves = string.indexOf('moves ');
  // start position
  if (fen >= 0) { // "fen" present
    let end = string.length;
    if (moves >= 0) { // "moves" present
      end = moves - 1; // moves[-1] = '\0': dirty, but so is UCI
    }
    board_from_fen(SearchInput.board, string.slice(fen + 4, Math.max(end, fen + 4))); // CHANGE ME
  } else {
    // HACK: assumes startpos
    board_from_fen(SearchInput.board, StartFen);
  }
  // moves
  if (moves >= 0) { // "moves" present
    const at = (i: number): string => (i < string.length ? string[i] : '\0');
    let ptr = moves + 6;
    const undo = new undo_t();
    while (at(ptr) !== '\0') {
      let move_string = at(ptr) + at(ptr + 1) + at(ptr + 2) + at(ptr + 3);
      ptr += 4;
      if (at(ptr) === '\0' || at(ptr) === ' ') {
        // not a promotion
      } else { // promote
        move_string += at(ptr++);
      }
      const move = move_from_string(move_string.replace(/\0.*$/, ''), SearchInput.board);
      if (move === MoveNone) my_fatal('parse_position(): invalid move:%s\n', move_string.replace(/\0.*$/, ''));
      move_do(SearchInput.board, move, undo);
      while (at(ptr) === ' ') ptr++;
    }
  }
}

// parse_setoption()
function parse_setoption(string: string): void {
  // init
  const name = string.indexOf('name ');
  const value = string.indexOf('value ');
  if (name < 0 || value < 0 || name >= value) return; // ignore buttons
  // value[-1] = '\0': HACK
  const name_string = string.slice(name + 5, value - 1);
  const value_string = string.slice(value + 6);
  // update
  option_set(name_string, value_string);
  // update transposition-table size if needed
  if (Init && my_string_equal(name_string, 'Hash')) { // Init => already allocated
    if (option_get_int('Hash') >= 4) {
      trans_free(Trans);
      trans_alloc(Trans);
    }
  }
}

// send_best_move()
function send_best_move(): void {
  // info
  // HACK: should be in search.cpp
  const time = SearchCurrent.time;
  const speed = SearchCurrent.speed;
  const cpu = SearchCurrent.cpu;
  const node_nb = SearchCurrent.node_nb;
  send('info time %.0f nodes %lld nps %.0f cpuload %.0f', time * 1000.0, node_nb, speed, cpu * 1000.0);
  trans_stats(Trans);
  // pawn_stats();
  // material_stats();
  // best move
  const move = SearchBest.move;
  const pv = SearchBest.pv;
  const move_string = move_to_string(move);
  if (pv[0] === move && move_is_ok(pv[1])) {
    const ponder_string = move_to_string(pv[1]);
    send('bestmove %s ponder %s', move_string, ponder_string);
  } else {
    send('bestmove %s', move_string);
  }
}

// get(): null at EOF (the engine is then set to quit)
export function get(): string | null {
  const string = host.getLine();
  if (string === null) { // EOF
    set_engine_to_quit();
  }
  return string;
}

// send()
export function send(format: string, ...args: Arg[]): void {
  host.send(sprintf(format, ...args));
}

// string_equal()
function string_equal(s1: string, s2: string): boolean {
  return s1 === s2;
}

// string_start_with()
function string_start_with(s1: string, s2: string): boolean {
  return s1.startsWith(s2);
}

// set_engine_to_quit()
export function set_engine_to_quit(): void {
  host.quit();
}
