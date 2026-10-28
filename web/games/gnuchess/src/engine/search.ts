// Port of src/engine/search.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// setjmp()/longjmp() of SearchInfo->buf: search_check() throws SearchAbort, search() catches it.

import { board_copy, board_t } from './board.ts';
import { book_move } from './book.ts';
import { list_copy, list_t } from './list.ts';
import { move_to_string, MoveNone } from './move.ts';
import { gen_legal_moves } from './move_gen.ts';
import { option_get_bool } from './option.ts';
import { event, send } from './protocol.ts';
import { pv_to_string, PV_CLEAR } from './pv.ts';
import { search_full_init, search_full_root } from './search_full.ts';
import { sort_init } from './sort.ts';
import { Trans, trans_inc_date, trans_stats } from './trans.ts';
import { my_timer_cpu_usage, my_timer_elapsed_cpu, my_timer_elapsed_real, my_timer_reset, my_timer_start, my_timer_t } from './util.ts';
import { value_to_mate } from './value.ts';

// constants
export const DepthMax = 64;
export const HeightMax = 256;

export const SearchNormal = 0;
export const SearchShort = 1;

export const SearchUnknown = 0;
export const SearchUpper = 1;
export const SearchLower = 2;
export const SearchExact = 3;

const UseCpuTime = false; // false
const UseEvent = true; // true

const UseShortSearch = true;
const ShortSearchDepth = 1;

const DispBest = true; // true
const DispDepthStart = true; // true
const DispDepthEnd = true; // true
const DispRoot = true; // true
const DispStat = true; // true

const UseEasy = true; // singular move
const EasyThreshold = 150;
const EasyRatio = 0.20;

const UseEarly = true; // early iteration end
const EarlyRatio = 0.60;

const UseBad = true;
const BadThreshold = 50; // 50
const UseExtension = true;

// types
export class search_input_t {
  board = new board_t();
  list = new list_t();
  infinite = false;
  depth_is_limited = false;
  depth_limit = 0;
  time_is_limited = false;
  time_limit_1 = 0.0;
  time_limit_2 = 0.0;
}

export class search_info_t {
  // jmp_buf buf: see SearchAbort
  can_stop = false;
  stop = false;
  check_nb = 0;
  check_inc = 0;
  last_time = 0.0;
}

export class search_root_t {
  list = new list_t();
  depth = 0;
  move = 0;
  move_pos = 0;
  move_nb = 0;
  last_value = 0;
  bad_1 = false;
  bad_2 = false;
  change = false;
  easy = false;
  flag = false;
}

export class search_best_t {
  move = 0;
  value = 0;
  flags = 0;
  depth = 0;
  pv = new Uint16Array(HeightMax);
}

export class search_current_t {
  board = new board_t();
  timer = new my_timer_t();
  max_depth = 0;
  node_nb = 0;
  time = 0.0;
  speed = 0.0;
  cpu = 0.0;
}

/** longjmp(SearchInfo->buf,1) */
export const SearchAbort = { longjmp: true };

// variables (made by search_alloc(), which main_engine() calls: the modules import each other)
export let SearchInput: search_input_t;
export let SearchInfo: search_info_t;
export let SearchRoot: search_root_t;
export let SearchCurrent: search_current_t;
export let SearchBest: search_best_t;

export function search_alloc(): void {
  SearchInput = new search_input_t();
  SearchInfo = new search_info_t();
  SearchRoot = new search_root_t();
  SearchCurrent = new search_current_t();
  SearchBest = new search_best_t();
}

// functions

// depth_is_ok()
export function depth_is_ok(depth: number): boolean {
  return depth > -128 && depth < DepthMax;
}

// height_is_ok()
export function height_is_ok(height: number): boolean {
  return height >= 0 && height < HeightMax;
}

// search_clear()
export function search_clear(): void {
  // SearchInput
  SearchInput.infinite = false;
  SearchInput.depth_is_limited = false;
  SearchInput.depth_limit = 0;
  SearchInput.time_is_limited = false;
  SearchInput.time_limit_1 = 0.0;
  SearchInput.time_limit_2 = 0.0;
  // SearchInfo
  SearchInfo.can_stop = false;
  SearchInfo.stop = false;
  SearchInfo.check_nb = 10000; // was 100000
  SearchInfo.check_inc = 10000; // was 100000
  SearchInfo.last_time = 0.0;
  // SearchBest
  SearchBest.move = MoveNone;
  SearchBest.value = 0;
  SearchBest.flags = SearchUnknown;
  PV_CLEAR(SearchBest.pv);
  // SearchRoot
  SearchRoot.depth = 0;
  SearchRoot.move = MoveNone;
  SearchRoot.move_pos = 0;
  SearchRoot.move_nb = 0;
  SearchRoot.last_value = 0;
  SearchRoot.bad_1 = false;
  SearchRoot.bad_2 = false;
  SearchRoot.change = false;
  SearchRoot.easy = false;
  SearchRoot.flag = false;
  // SearchCurrent
  SearchCurrent.max_depth = 0;
  SearchCurrent.node_nb = 0;
  SearchCurrent.time = 0.0;
  SearchCurrent.speed = 0.0;
  SearchCurrent.cpu = 0.0;
}

// search()
export function search(): void {
  // opening book
  if (option_get_bool('OwnBook') && !SearchInput.infinite) {
    const move = book_move(SearchInput.board);
    if (move !== MoveNone) {
      // play book move
      SearchBest.move = move;
      SearchBest.value = 1;
      SearchBest.flags = SearchExact;
      SearchBest.depth = 1;
      SearchBest.pv[0] = move;
      SearchBest.pv[1] = MoveNone;
      search_update_best();
      return;
    }
  }
  // SearchInput
  gen_legal_moves(SearchInput.list, SearchInput.board);
  if (SearchInput.list.size <= 1) {
    SearchInput.depth_is_limited = true;
    SearchInput.depth_limit = 4; // was 1
  }
  // SearchInfo: setjmp(SearchInfo->buf)
  try {
    // SearchRoot
    list_copy(SearchRoot.list, SearchInput.list);
    // SearchCurrent
    board_copy(SearchCurrent.board, SearchInput.board);
    my_timer_reset(SearchCurrent.timer);
    my_timer_start(SearchCurrent.timer);
    // init
    trans_inc_date(Trans);
    sort_init();
    search_full_init(SearchRoot.list, SearchCurrent.board);
    // iterative deepening
    for (let depth = 1; depth < DepthMax; depth++) {
      if (DispDepthStart) send('info depth %d', depth);
      SearchRoot.bad_1 = false;
      SearchRoot.change = false;
      board_copy(SearchCurrent.board, SearchInput.board);
      if (UseShortSearch && depth <= ShortSearchDepth) {
        search_full_root(SearchRoot.list, SearchCurrent.board, depth, SearchShort);
      } else {
        search_full_root(SearchRoot.list, SearchCurrent.board, depth, SearchNormal);
      }
      search_update_current();
      if (DispDepthEnd) {
        send('info depth %d seldepth %d time %.0f nodes %lld nps %.0f', depth, SearchCurrent.max_depth, SearchCurrent.time * 1000.0, SearchCurrent.node_nb, SearchCurrent.speed);
      }
      // update search info
      if (depth >= 1) SearchInfo.can_stop = true;
      if (depth === 1
        && SearchRoot.list.size >= 2
        && SearchRoot.list.value[0] >= SearchRoot.list.value[1] + EasyThreshold) {
        SearchRoot.easy = true;
      }
      if (UseBad && depth > 1) {
        SearchRoot.bad_2 = SearchRoot.bad_1;
        SearchRoot.bad_1 = false;
      }
      SearchRoot.last_value = SearchBest.value;
      // stop search?
      if (SearchInput.depth_is_limited
        && depth >= SearchInput.depth_limit) {
        SearchRoot.flag = true;
      }
      if (SearchInput.time_is_limited
        && SearchCurrent.time >= SearchInput.time_limit_1
        && !SearchRoot.bad_2) {
        SearchRoot.flag = true;
      }
      if (UseEasy
        && SearchInput.time_is_limited
        && SearchCurrent.time >= SearchInput.time_limit_1 * EasyRatio
        && SearchRoot.easy) {
        SearchRoot.flag = true;
      }
      if (UseEarly
        && SearchInput.time_is_limited
        && SearchCurrent.time >= SearchInput.time_limit_1 * EarlyRatio
        && !SearchRoot.bad_2
        && !SearchRoot.change) {
        SearchRoot.flag = true;
      }
      if (SearchInfo.can_stop
        && (SearchInfo.stop || (SearchRoot.flag && !SearchInput.infinite))) {
        break;
      }
    }
  } catch (e) {
    if (e !== SearchAbort) throw e;
    search_update_current();
  }
}

// search_update_best()
export function search_update_best(): void {
  search_update_current();
  if (DispBest) {
    const value = SearchBest.value;
    const flags = SearchBest.flags;
    const depth = SearchBest.depth;
    const pv = SearchBest.pv;
    const max_depth = SearchCurrent.max_depth;
    const time = SearchCurrent.time;
    const node_nb = SearchCurrent.node_nb;
    const pv_string = pv_to_string(pv);
    const mate = value_to_mate(value);
    if (mate === 0) {
      // normal evaluation
      if (flags === SearchExact) {
        send('info depth %d seldepth %d score cp %d time %.0f nodes %lld pv %s', depth, max_depth, value, time * 1000.0, node_nb, pv_string);
      } else if (flags === SearchLower) {
        send('info depth %d seldepth %d score cp %d lowerbound time %.0f nodes %lld pv %s', depth, max_depth, value, time * 1000.0, node_nb, pv_string);
      } else if (flags === SearchUpper) {
        send('info depth %d seldepth %d score cp %d upperbound time %.0f nodes %lld pv %s', depth, max_depth, value, time * 1000.0, node_nb, pv_string);
      }
    } else {
      // mate announcement
      if (flags === SearchExact) {
        send('info depth %d seldepth %d score mate %d time %.0f nodes %lld pv %s', depth, max_depth, mate, time * 1000.0, node_nb, pv_string);
      } else if (flags === SearchLower) {
        send('info depth %d seldepth %d score mate %d lowerbound time %.0f nodes %lld pv %s', depth, max_depth, mate, time * 1000.0, node_nb, pv_string);
      } else if (flags === SearchUpper) {
        send('info depth %d seldepth %d score mate %d upperbound time %.0f nodes %lld pv %s', depth, max_depth, mate, time * 1000.0, node_nb, pv_string);
      }
    }
  }
  // update time-management info
  if (UseBad && SearchBest.depth > 1) {
    if (SearchBest.value <= SearchRoot.last_value - BadThreshold) {
      SearchRoot.bad_1 = true;
      SearchRoot.easy = false;
      SearchRoot.flag = false;
    } else {
      SearchRoot.bad_1 = false;
    }
  }
}

// search_update_root()
export function search_update_root(): void {
  if (DispRoot) {
    search_update_current();
    if (SearchCurrent.time >= 1.0) {
      const move = SearchRoot.move;
      const move_pos = SearchRoot.move_pos;
      const move_string = move_to_string(move);
      send('info currmove %s currmovenumber %d', move_string, move_pos + 1);
    }
  }
}

// search_update_current()
export function search_update_current(): void {
  const timer = SearchCurrent.timer;
  const node_nb = SearchCurrent.node_nb;
  const time = (UseCpuTime) ? my_timer_elapsed_cpu(timer) : my_timer_elapsed_real(timer);
  const speed = (time >= 1.0) ? node_nb / time : 0.0;
  const cpu = my_timer_cpu_usage(timer);
  SearchCurrent.time = time;
  SearchCurrent.speed = speed;
  SearchCurrent.cpu = cpu;
}

// search_check()
export function search_check(): void {
  search_send_stat();
  if (UseEvent) event();
  if (SearchInput.depth_is_limited
    && SearchRoot.depth > SearchInput.depth_limit) {
    SearchRoot.flag = true;
  }
  if (SearchInput.time_is_limited
    && SearchCurrent.time >= SearchInput.time_limit_2) {
    SearchRoot.flag = true;
  }
  if (SearchInput.time_is_limited
    && SearchCurrent.time >= SearchInput.time_limit_1
    && !SearchRoot.bad_1
    && !SearchRoot.bad_2
    && (!UseExtension || SearchRoot.move_pos === 0)) {
    SearchRoot.flag = true;
  }
  if (SearchInfo.can_stop
    && (SearchInfo.stop || (SearchRoot.flag && !SearchInput.infinite))) {
    throw SearchAbort; // longjmp(SearchInfo->buf,1)
  }
}

// search_send_stat()
function search_send_stat(): void {
  search_update_current();
  if (DispStat && SearchCurrent.time >= SearchInfo.last_time + 1.0) { // at least one-second gap
    SearchInfo.last_time = SearchCurrent.time;
    const time = SearchCurrent.time;
    const speed = SearchCurrent.speed;
    const cpu = SearchCurrent.cpu;
    const node_nb = SearchCurrent.node_nb;
    send('info time %.0f nodes %lld nps %.0f cpuload %.0f', time * 1000.0, node_nb, speed, cpu * 1000.0);
    trans_stats(Trans);
  }
}
