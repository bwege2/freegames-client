// engine/board.c, engine/hash.c and the board part of engine/board.h of GNU Go 3.8: the board, its
// incrementally kept strings (stones, liberties, neighbours), trymove/popgo with the change stacks,
// play_move with the move history, undo, legality (ko, suicide, superko) and the Zobrist hash.
//
// The C program keeps the strings in structs and records changes by address (PUSH_VALUE). Here every
// int of that state lives in one Int32Array M, so the change stack records (index, old value) just as
// the C stack records (address, old value). Orders (stones of a string, liberty lists) are the
// original's, as the Monte Carlo module depends on them.
import { gg_urand, set_random_seed } from './random.ts';

export const EMPTY = 0;
export const WHITE = 1;
export const BLACK = 2;
export const GRAY = 3;

export const MIN_BOARD = 1;
export const MAX_BOARD = 19;
export const MAX_HANDICAP = 9;
export const MAX_MOVE_HISTORY = 500;
export const DEFAULT_BOARD_SIZE = MAX_BOARD;
export const MAXLIBS = Math.trunc((2 * (MAX_BOARD * MAX_BOARD + 1)) / 3);
export const MAX_LIBERTIES = 8;
export const MAX_STRINGS = Math.trunc((4 * MAX_BOARD * MAX_BOARD) / 5);
export const MAXSTACK = MAX_BOARD * MAX_BOARD;
export const MAXCHAIN = 160;
export const HASH_RANDOM_SEED = 12345;

export const NS = MAX_BOARD + 1;
export const WE = 1;
export const BOARDSIZE = (MAX_BOARD + 2) * (MAX_BOARD + 1) + 1;
export const BOARDMIN = MAX_BOARD + 2;
export const BOARDMAX = (MAX_BOARD + 1) * (MAX_BOARD + 1);
export const PASS_MOVE = 0;
export const NO_MOVE = 0;

export const POS = (i: number, j: number): number => MAX_BOARD + 2 + i * (MAX_BOARD + 1) + j;
export const I = (pos: number): number => Math.trunc(pos / (MAX_BOARD + 1)) - 1;
export const J = (pos: number): number => (pos % (MAX_BOARD + 1)) - 1;
export const OTHER_COLOR = (color: number): number => WHITE + BLACK - color;
export const IS_STONE = (arg: number): boolean => arg === WHITE || arg === BLACK;
export const SOUTH = (pos: number): number => pos + NS;
export const WEST = (pos: number): number => pos - 1;
export const NORTH = (pos: number): number => pos - NS;
export const EAST = (pos: number): number => pos + 1;
export const SW = (pos: number): number => pos + NS - 1;
export const NW = (pos: number): number => pos - NS - 1;
export const NE = (pos: number): number => pos - NS + 1;
export const SE = (pos: number): number => pos + NS + 1;

export const deltai = [1, 0, -1, 0, 1, -1, -1, 1];
export const deltaj = [0, -1, 0, 1, -1, -1, 1, 1];
export const delta = [NS, -1, -NS, 1, NS - 1, -NS - 1, -NS + 1, NS + 1];

// enum suicide_rules, ko_rules (board.h)
export const FORBIDDEN = 0;
export const ALLOWED = 1;
export const ALL_ALLOWED = 2;
export const SIMPLE = 0;
export const NONE = 1;
export const PSK = 2;
export const SSK = 3;

// ---------------------------------------------------------------- globals (board.c, globals.c)

export const g = {
  board_size: DEFAULT_BOARD_SIZE,
  komi: 0.0,
  handicap: 0,
  movenum: 0,
  suicide_rule: FORBIDDEN,
  ko_rule: SIMPLE,
  stackp: 0,
  position_number: 0,
  initial_board_ko_pos: NO_MOVE,
  initial_white_captured: 0,
  initial_black_captured: 0,
  move_history_pointer: 0,
};

export const board = new Uint8Array(BOARDSIZE);
export const initial_board = new Uint8Array(BOARDSIZE);
export const move_history_color = new Int32Array(MAX_MOVE_HISTORY);
export const move_history_pos = new Int32Array(MAX_MOVE_HISTORY);
/** two 32-bit halves (low, high) of each 64-bit Hash_data */
export const move_history_hash = new Uint32Array(2 * MAX_MOVE_HISTORY);

// ---------------------------------------------------------------- hash.c

/** Hash_data: one unsigned long (64 bits) as [low, high] */
export const board_hash = new Uint32Array(2);
const white_hash = new Uint32Array(2 * BOARDMAX);
const black_hash = new Uint32Array(2 * BOARDMAX);
const ko_hash = new Uint32Array(2 * BOARDMAX);
const NUM_KOMASTER_STATES = 5;
let hash_initialized = false;

function hash_init_zobrist_array(array: Uint32Array, size: number): void {
  for (let i = 0; i < size; i++) {
    array[2 * i] = gg_urand();
    array[2 * i + 1] = gg_urand();
  }
}

export function hash_init(): void {
  if (hash_initialized) return;
  hash_init_zobrist_array(black_hash, BOARDMAX);
  hash_init_zobrist_array(white_hash, BOARDMAX);
  hash_init_zobrist_array(ko_hash, BOARDMAX);
  // komaster_hash, kom_pos_hash and goal_hash take their numbers after these; the port does not use them
  const rest = new Uint32Array(2 * (NUM_KOMASTER_STATES + 2 * BOARDMAX));
  hash_init_zobrist_array(rest, NUM_KOMASTER_STATES + 2 * BOARDMAX);
  hash_initialized = true;
}

export function hashdata_recalc(hd: Uint32Array, p: Uint8Array, ko_pos: number, off = 0): void {
  hd[off] = 0;
  hd[off + 1] = 0;
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (p[pos] === WHITE) {
      hd[off] ^= white_hash[2 * pos];
      hd[off + 1] ^= white_hash[2 * pos + 1];
    } else if (p[pos] === BLACK) {
      hd[off] ^= black_hash[2 * pos];
      hd[off + 1] ^= black_hash[2 * pos + 1];
    }
  }
  if (ko_pos !== 0) {
    hd[off] ^= ko_hash[2 * ko_pos];
    hd[off + 1] ^= ko_hash[2 * ko_pos + 1];
  }
}

export function hashdata_invert_ko(hd: Uint32Array, pos: number, off = 0): void {
  hd[off] ^= ko_hash[2 * pos];
  hd[off + 1] ^= ko_hash[2 * pos + 1];
}

export function hashdata_invert_stone(hd: Uint32Array, pos: number, color: number, off = 0): void {
  if (color === BLACK) {
    hd[off] ^= black_hash[2 * pos];
    hd[off + 1] ^= black_hash[2 * pos + 1];
  } else if (color === WHITE) {
    hd[off] ^= white_hash[2 * pos];
    hd[off + 1] ^= white_hash[2 * pos + 1];
  }
}

export function hashdata_to_string(hd: Uint32Array, off = 0): string {
  return hd[off + 1].toString(16).padStart(8, '0') + hd[off].toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------- the incremental board's state

const KO = 0; // board_ko_pos
const BCAP = 1; // black_captured
const WCAP = 2; // white_captured
const NEXT_STRING = 3;
const STR = 8; // struct string_data: color, size, origin, liberties, neighbors, mark
const F_COLOR = 0;
const F_SIZE = 1;
const F_ORIGIN = 2;
const F_LIBS = 3;
const F_NEIGH = 4;
const F_MARK = 5;
const SFIELDS = 6;
const LIBS = STR + MAX_STRINGS * SFIELDS;
const NEIGH = LIBS + MAX_STRINGS * MAX_LIBERTIES;
const SNUM = NEIGH + MAX_STRINGS * MAXCHAIN;
const NEXTST = SNUM + BOARDMAX;
const MSIZE = NEXTST + BOARDMAX;
const M = new Int32Array(MSIZE);

const sf = (s: number, f: number): number => STR + s * SFIELDS + f;
const sl = (s: number, k: number): number => LIBS + s * MAX_LIBERTIES + k;
const sn = (s: number, k: number): number => NEIGH + s * MAXCHAIN + k;

export const board_ko_pos = (): number => M[KO];
/** `board_ko_pos = move` (engine/interface.c, an IL property): no hash update, as in C */
export function set_board_ko_pos(pos: number): void {
  M[KO] = pos;
}
export const black_captured = (): number => M[BCAP];
export const white_captured = (): number => M[WCAP];
export function set_captures(white: number, black: number): void {
  M[WCAP] = white;
  M[BCAP] = black;
}
const next_stone = (pos: number): number => M[NEXTST + pos];
const LIBERTIES = (pos: number): number => M[sf(M[SNUM + pos], F_LIBS)];
const COUNTSTONES = (pos: number): number => M[sf(M[SNUM + pos], F_SIZE)];

const STACK_SIZE = 80 * MAXSTACK;
const change_addr = new Int32Array(STACK_SIZE);
const change_val = new Int32Array(STACK_SIZE);
let change_sp = 0;
const vertex_addr = new Int32Array(STACK_SIZE);
const vertex_val = new Int32Array(STACK_SIZE);
let vertex_sp = 0;

function CLEAR_STACKS(): void {
  change_sp = 0;
  vertex_sp = 0;
}
// address -1 marks the start of a change record (the C NULL)
function BEGIN_CHANGE_RECORD(): void {
  change_addr[change_sp++] = -1;
  vertex_addr[vertex_sp++] = -1;
}
function PUSH_VALUE(i: number): void {
  change_addr[change_sp] = i;
  change_val[change_sp++] = M[i];
}
function PUSH_VERTEX(pos: number): void {
  vertex_addr[vertex_sp] = pos;
  vertex_val[vertex_sp++] = board[pos];
}
function POP_MOVE(): void {
  while (change_addr[--change_sp] !== -1) M[change_addr[change_sp]] = change_val[change_sp];
}
function POP_VERTICES(): void {
  while (vertex_addr[--vertex_sp] !== -1) board[vertex_addr[vertex_sp]] = vertex_val[vertex_sp];
}

const ml = new Int32Array(BOARDMAX);
let liberty_mark = 0;
let string_mark = 0;
let trymove_counter = 0;

const LIBERTY = (pos: number): boolean => board[pos] === EMPTY;
const UNMARKED_LIBERTY = (pos: number): boolean => board[pos] === EMPTY && ml[pos] !== liberty_mark;
const MARK_LIBERTY = (pos: number): void => {
  ml[pos] = liberty_mark;
};
const UNMARKED_STRING = (pos: number): boolean => M[sf(M[SNUM + pos], F_MARK)] !== string_mark;
const UNMARKED_COLOR_STRING = (pos: number, color: number): boolean =>
  board[pos] === color && M[sf(M[SNUM + pos], F_MARK)] !== string_mark;
const MARKED_COLOR_STRING = (pos: number, color: number): boolean =>
  board[pos] === color && M[sf(M[SNUM + pos], F_MARK)] === string_mark;
const MARK_STRING = (pos: number): void => {
  M[sf(M[SNUM + pos], F_MARK)] = string_mark;
};
const STRING_AT_VERTEX = (pos: number, s: number, color: number): boolean =>
  board[pos] === color && M[SNUM + pos] === s;
const NEIGHBOR_OF_STRING = (pos: number, s: number, color: number): boolean =>
  STRING_AT_VERTEX(SOUTH(pos), s, color) ||
  STRING_AT_VERTEX(WEST(pos), s, color) ||
  STRING_AT_VERTEX(NORTH(pos), s, color) ||
  STRING_AT_VERTEX(EAST(pos), s, color);
const NON_SOUTH_NEIGHBOR_OF_STRING = (pos: number, s: number, color: number): boolean =>
  STRING_AT_VERTEX(SOUTH(pos), s, color) || STRING_AT_VERTEX(WEST(pos), s, color) || STRING_AT_VERTEX(EAST(pos), s, color);
const NON_WEST_NEIGHBOR_OF_STRING = (pos: number, s: number, color: number): boolean =>
  STRING_AT_VERTEX(WEST(pos), s, color) || STRING_AT_VERTEX(NORTH(pos), s, color) || STRING_AT_VERTEX(SOUTH(pos), s, color);
const NON_NORTH_NEIGHBOR_OF_STRING = (pos: number, s: number, color: number): boolean =>
  STRING_AT_VERTEX(NORTH(pos), s, color) || STRING_AT_VERTEX(EAST(pos), s, color) || STRING_AT_VERTEX(WEST(pos), s, color);
const NON_EAST_NEIGHBOR_OF_STRING = (pos: number, s: number, color: number): boolean =>
  STRING_AT_VERTEX(EAST(pos), s, color) || STRING_AT_VERTEX(SOUTH(pos), s, color) || STRING_AT_VERTEX(NORTH(pos), s, color);

function ADD_LIBERTY(s: number, pos: number): void {
  const n = M[sf(s, F_LIBS)];
  if (n < MAX_LIBERTIES) M[sl(s, n)] = pos;
  M[sf(s, F_LIBS)] = n + 1;
}
function ADD_AND_MARK_LIBERTY(s: number, pos: number): void {
  ADD_LIBERTY(s, pos);
  ml[pos] = liberty_mark;
}
function ADD_NEIGHBOR(s: number, pos: number): void {
  const n = M[sf(s, F_NEIGH)];
  M[sn(s, n)] = M[SNUM + pos];
  M[sf(s, F_NEIGH)] = n + 1;
}
function DO_ADD_STONE(pos: number, color: number): void {
  PUSH_VERTEX(pos);
  board[pos] = color;
  hashdata_invert_stone(board_hash, pos, color);
}
function DO_REMOVE_STONE(pos: number): void {
  PUSH_VERTEX(pos);
  hashdata_invert_stone(board_hash, pos, board[pos]);
  board[pos] = EMPTY;
}

export const ON_BOARD = (pos: number): boolean => board[pos] !== GRAY;
export const ON_BOARD1 = (pos: number): boolean => pos >= 0 && pos < BOARDSIZE && board[pos] !== GRAY;
export const ON_BOARD2 = (i: number, j: number): boolean => i >= 0 && j >= 0 && i < g.board_size && j < g.board_size;

// ---------------------------------------------------------------- clear, add, remove

export function clear_board(): void {
  board.fill(EMPTY);
  initial_board.fill(EMPTY);
  for (let k = 0; k < BOARDSIZE; k++) {
    if (!ON_BOARD2(I(k), J(k))) {
      board[k] = GRAY;
      initial_board[k] = GRAY;
    }
  }
  M[KO] = NO_MOVE;
  M[WCAP] = 0;
  M[BCAP] = 0;
  g.initial_board_ko_pos = NO_MOVE;
  g.initial_white_captured = 0;
  g.initial_black_captured = 0;
  g.move_history_pointer = 0;
  g.movenum = 0;
  g.handicap = 0;
  hashdata_recalc(board_hash, board, M[KO]);
  new_position();
}

const stack = new Int32Array(MAXSTACK);
const move_color = new Int32Array(MAXSTACK);
const board_hash_stack = new Uint32Array(2 * MAXSTACK);

export function trymove(pos: number, color: number): boolean {
  return do_trymove(pos, color, false);
}

export function tryko(pos: number, color: number): boolean {
  return do_trymove(pos, color, true);
}

function really_do_trymove(pos: number, color: number): void {
  BEGIN_CHANGE_RECORD();
  PUSH_VALUE(KO);
  board_hash_stack[2 * g.stackp] = board_hash[0];
  board_hash_stack[2 * g.stackp + 1] = board_hash[1];
  if (M[KO] !== NO_MOVE) hashdata_invert_ko(board_hash, M[KO]);
  M[KO] = NO_MOVE;
  g.stackp++;
  if (pos !== PASS_MOVE) {
    PUSH_VALUE(BCAP);
    PUSH_VALUE(WCAP);
    do_play_move(pos, color);
  }
}

function do_trymove(pos: number, color: number, ignore_ko: boolean): boolean {
  if (pos !== PASS_MOVE) {
    if (board[pos] !== EMPTY) return false;
    if (!ignore_ko && pos === M[KO]) {
      if (board[WEST(pos)] === OTHER_COLOR(color) || board[EAST(pos)] === OTHER_COLOR(color)) return false;
    }
    if (is_suicide(pos, color)) return false;
  }
  if (g.stackp >= MAXSTACK - 2) return false;
  trymove_counter++;
  stack[g.stackp] = pos;
  move_color[g.stackp] = color;
  really_do_trymove(pos, color);
  return true;
}

export function popgo(): void {
  undo_trymove();
}

function undo_trymove(): void {
  POP_MOVE();
  POP_VERTICES();
  g.stackp--;
  board_hash[0] = board_hash_stack[2 * g.stackp];
  board_hash[1] = board_hash_stack[2 * g.stackp + 1];
}

function reset_move_history(): void {
  initial_board.set(board);
  g.initial_board_ko_pos = M[KO];
  g.initial_white_captured = M[WCAP];
  g.initial_black_captured = M[BCAP];
  g.move_history_pointer = 0;
}

export function add_stone(pos: number, color: number): void {
  board[pos] = color;
  hashdata_invert_stone(board_hash, pos, color);
  reset_move_history();
  new_position();
}

export function remove_stone(pos: number): void {
  hashdata_invert_stone(board_hash, pos, board[pos]);
  board[pos] = EMPTY;
  reset_move_history();
  new_position();
}

function play_move_no_history(pos: number, color: number, update_internals: boolean): void {
  if (M[KO] !== NO_MOVE) hashdata_invert_ko(board_hash, M[KO]);
  M[KO] = NO_MOVE;
  if (pos !== PASS_MOVE) {
    if (!is_suicide(pos, color)) do_play_move(pos, color);
    else do_commit_suicide(pos, color);
  }
  if (update_internals || M[NEXT_STRING] === MAX_STRINGS) new_position();
  else CLEAR_STACKS();
}

function replay_move_history(n: number): void {
  board.set(initial_board);
  M[KO] = g.initial_board_ko_pos;
  M[WCAP] = g.initial_white_captured;
  M[BCAP] = g.initial_black_captured;
  new_position();
  for (let k = 0; k < n; k++) play_move_no_history(move_history_pos[k], move_history_color[k], false);
  new_position();
}

export function play_move(pos: number, color: number): void {
  if (g.move_history_pointer >= MAX_MOVE_HISTORY) {
    const number_collapsed_moves = 1 + Math.trunc(MAX_MOVE_HISTORY / 10);
    const saved_board = board.slice();
    const saved_board_ko_pos = M[KO];
    const saved_white_captured = M[WCAP];
    const saved_black_captured = M[BCAP];
    replay_move_history(number_collapsed_moves);
    initial_board.set(board);
    g.initial_board_ko_pos = M[KO];
    g.initial_white_captured = M[WCAP];
    g.initial_black_captured = M[BCAP];
    for (let k = number_collapsed_moves; k < g.move_history_pointer; k++) {
      move_history_color[k - number_collapsed_moves] = move_history_color[k];
      move_history_pos[k - number_collapsed_moves] = move_history_pos[k];
      move_history_hash[2 * (k - number_collapsed_moves)] = move_history_hash[2 * k];
      move_history_hash[2 * (k - number_collapsed_moves) + 1] = move_history_hash[2 * k + 1];
    }
    g.move_history_pointer -= number_collapsed_moves;
    board.set(saved_board);
    M[KO] = saved_board_ko_pos;
    M[WCAP] = saved_white_captured;
    M[BCAP] = saved_black_captured;
    new_position();
  }
  const p = g.move_history_pointer;
  move_history_color[p] = color;
  move_history_pos[p] = pos;
  move_history_hash[2 * p] = board_hash[0];
  move_history_hash[2 * p + 1] = board_hash[1];
  if (M[KO] !== NO_MOVE) hashdata_invert_ko(move_history_hash, M[KO], 2 * p);
  g.move_history_pointer++;
  play_move_no_history(pos, color, true);
  g.movenum++;
}

export function undo_move(n: number): boolean {
  if (g.move_history_pointer < n) return false;
  replay_move_history(g.move_history_pointer - n);
  g.move_history_pointer -= n;
  g.movenum -= n;
  return true;
}

export function get_last_opponent_move(color: number): number {
  for (let k = g.move_history_pointer - 1; k >= 0; k--)
    if (move_history_color[k] === OTHER_COLOR(color)) return move_history_pos[k];
  return PASS_MOVE;
}

export function get_last_move(): number {
  if (g.move_history_pointer === 0) return PASS_MOVE;
  return move_history_pos[g.move_history_pointer - 1];
}

export function get_last_player(): number {
  if (g.move_history_pointer === 0) return EMPTY;
  return move_history_color[g.move_history_pointer - 1];
}

export const is_pass = (pos: number): boolean => pos === 0;

export function is_legal(pos: number, color: number): boolean {
  if (pos === PASS_MOVE) return true;
  if (board[pos] !== EMPTY) return false;
  if (pos === M[KO]) {
    if (board[WEST(pos)] === OTHER_COLOR(color) || board[EAST(pos)] === OTHER_COLOR(color)) return false;
  }
  if (g.stackp >= MAXSTACK - 2) return false;
  if (is_suicide(pos, color)) return false;
  return true;
}

export function is_suicide(pos: number, color: number): boolean {
  for (const n of [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)]) {
    if (LIBERTY(n) || (ON_BOARD(n) && (board[n] === color) !== (LIBERTIES(n) === 1))) return false;
  }
  return true;
}

export function is_illegal_ko_capture(pos: number, color: number): boolean {
  return pos === M[KO] && (board[WEST(pos)] === OTHER_COLOR(color) || board[EAST(pos)] === OTHER_COLOR(color));
}

export function is_allowed_move(pos: number, color: number): boolean {
  if (pos === PASS_MOVE) return true;
  if (board[pos] !== EMPTY) return false;
  if (
    g.ko_rule !== NONE &&
    pos === M[KO] &&
    (board[WEST(pos)] === OTHER_COLOR(color) || board[EAST(pos)] === OTHER_COLOR(color))
  )
    return false;
  if (is_suicide(pos, color))
    if (g.suicide_rule === FORBIDDEN || (g.suicide_rule === ALLOWED && !has_neighbor(pos, color))) return false;
  if (is_superko_violation(pos, color, g.ko_rule)) return false;
  return true;
}

export function is_edge_vertex(pos: number): boolean {
  return !ON_BOARD(SW(pos)) || !ON_BOARD(NE(pos));
}

export function edge_distance(pos: number): number {
  const i = I(pos);
  const j = J(pos);
  const bs = g.board_size;
  return Math.min(Math.min(i, bs - 1 - i), Math.min(j, bs - 1 - j));
}

export function is_corner_vertex(pos: number): boolean {
  return (!ON_BOARD(WEST(pos)) || !ON_BOARD(EAST(pos))) && (!ON_BOARD(SOUTH(pos)) || !ON_BOARD(NORTH(pos)));
}

export function countlib(str: number): number {
  return M[sf(M[SNUM + str], F_LIBS)];
}

export function findlib(str: number, maxlib: number, libs: number[] | Int32Array): number {
  const s = M[SNUM + str];
  const liberties = M[sf(s, F_LIBS)];
  let k;
  if (liberties <= MAX_LIBERTIES || maxlib <= MAX_LIBERTIES) {
    for (k = 0; k < maxlib && k < liberties; k++) libs[k] = M[sl(s, k)];
  } else {
    liberty_mark++;
    k = 0;
    for (let pos = M[sf(s, F_ORIGIN)]; k < maxlib && k < liberties; pos = next_stone(pos)) {
      if (UNMARKED_LIBERTY(SOUTH(pos))) {
        libs[k++] = SOUTH(pos);
        MARK_LIBERTY(SOUTH(pos));
        if (k >= maxlib) break;
      }
      if (UNMARKED_LIBERTY(WEST(pos))) {
        libs[k++] = WEST(pos);
        MARK_LIBERTY(WEST(pos));
        if (k >= maxlib) break;
      }
      if (UNMARKED_LIBERTY(NORTH(pos))) {
        libs[k++] = NORTH(pos);
        MARK_LIBERTY(NORTH(pos));
        if (k >= maxlib) break;
      }
      if (UNMARKED_LIBERTY(EAST(pos))) {
        libs[k++] = EAST(pos);
        MARK_LIBERTY(EAST(pos));
        if (k >= maxlib) break;
      }
    }
  }
  return liberties;
}

function fastlib(pos: number, color: number, ignore_captures: boolean): number {
  let ally1 = -1;
  let ally2 = -1;
  let fast_liberties = 0;
  const sN = SOUTH(pos), wN = WEST(pos), nN = NORTH(pos), eN = EAST(pos);
  const snum = (p: number): number => M[SNUM + p];
  if (board[sN] === color) {
    ally1 = snum(sN);
    if (board[wN] === color && snum(wN) !== ally1) {
      ally2 = snum(wN);
      if (board[nN] === color && snum(nN) !== ally1 && snum(nN) !== ally2) return -1;
    } else if (board[nN] === color && snum(nN) !== ally1) ally2 = snum(nN);
    if (board[eN] === color && snum(eN) !== ally1) {
      if (ally2 < 0) ally2 = snum(eN);
      else if (snum(eN) !== ally2) return -1;
    }
  } else if (board[wN] === color) {
    ally1 = snum(wN);
    if (board[nN] === color && snum(nN) !== ally1) {
      ally2 = snum(nN);
      if (board[eN] === color && snum(eN) !== ally1 && snum(eN) !== ally2) return -1;
    } else if (board[eN] === color && snum(eN) !== ally1) ally2 = snum(eN);
  } else if (board[nN] === color) {
    ally1 = snum(nN);
    if (board[eN] === color && snum(eN) !== ally1) ally2 = snum(eN);
  } else if (board[eN] === color) ally1 = snum(eN);

  if (ignore_captures) {
    if (ally1 < 0) {
      if (LIBERTY(sN)) fast_liberties++;
      if (LIBERTY(wN)) fast_liberties++;
      if (LIBERTY(nN)) fast_liberties++;
      if (LIBERTY(eN)) fast_liberties++;
    } else if (ally2 < 0) {
      if (LIBERTY(sN) && !NON_SOUTH_NEIGHBOR_OF_STRING(sN, ally1, color)) fast_liberties++;
      if (LIBERTY(wN) && !NON_WEST_NEIGHBOR_OF_STRING(wN, ally1, color)) fast_liberties++;
      if (LIBERTY(nN) && !NON_NORTH_NEIGHBOR_OF_STRING(nN, ally1, color)) fast_liberties++;
      if (LIBERTY(eN) && !NON_EAST_NEIGHBOR_OF_STRING(eN, ally1, color)) fast_liberties++;
      fast_liberties += M[sf(ally1, F_LIBS)] - 1;
    } else {
      if (LIBERTY(sN) && !NON_SOUTH_NEIGHBOR_OF_STRING(sN, ally1, color) && !NON_SOUTH_NEIGHBOR_OF_STRING(sN, ally2, color))
        fast_liberties++;
      if (LIBERTY(wN) && !NON_WEST_NEIGHBOR_OF_STRING(wN, ally1, color) && !NON_WEST_NEIGHBOR_OF_STRING(wN, ally2, color))
        fast_liberties++;
      if (LIBERTY(nN) && !NON_NORTH_NEIGHBOR_OF_STRING(nN, ally1, color) && !NON_NORTH_NEIGHBOR_OF_STRING(nN, ally2, color))
        fast_liberties++;
      if (LIBERTY(eN) && !NON_EAST_NEIGHBOR_OF_STRING(eN, ally1, color) && !NON_EAST_NEIGHBOR_OF_STRING(eN, ally2, color))
        fast_liberties++;
      fast_liberties +=
        M[sf(ally1, F_LIBS)] +
        M[sf(ally2, F_LIBS)] -
        count_common_libs(M[sf(ally1, F_ORIGIN)], M[sf(ally2, F_ORIGIN)]) -
        1;
    }
  } else {
    for (let k = 0; k < 4; k++) {
      const neighbor = pos + delta[k];
      if (
        LIBERTY(neighbor) &&
        (ally1 < 0 || !NEIGHBOR_OF_STRING(neighbor, ally1, color)) &&
        (ally2 < 0 || !NEIGHBOR_OF_STRING(neighbor, ally2, color))
      )
        fast_liberties++;
      else if (board[neighbor] === OTHER_COLOR(color) && LIBERTIES(neighbor) === 1) {
        const neighbor_size = COUNTSTONES(neighbor);
        if (neighbor_size === 1 || (neighbor_size === 2 && ally1 < 0)) fast_liberties++;
        else return -1;
      }
    }
    if (ally1 >= 0) {
      fast_liberties += M[sf(ally1, F_LIBS)] - 1;
      if (ally2 >= 0)
        fast_liberties += M[sf(ally2, F_LIBS)] - count_common_libs(M[sf(ally1, F_ORIGIN)], M[sf(ally2, F_ORIGIN)]);
    }
  }
  return fast_liberties;
}

// struct board_cache_entry approxlib_cache[BOARDMAX][2], accuratelib_cache: threshold, liberties, hash
const approx_threshold = new Int32Array(BOARDMAX * 2);
const approx_libs = new Int32Array(BOARDMAX * 2);
const approx_hash = new Uint32Array(BOARDMAX * 4);
const accurate_threshold = new Int32Array(BOARDMAX * 2);
const accurate_libs = new Int32Array(BOARDMAX * 2);
const accurate_hash = new Uint32Array(BOARDMAX * 4);

export function clear_approxlib_cache(): void {
  approx_threshold.fill(0);
}
export function clear_accuratelib_cache(): void {
  accurate_threshold.fill(0);
}

export function approxlib(pos: number, color: number, maxlib: number, libs: number[] | null): number {
  let liberties;
  const e = pos * 2 + color - 1;
  if (!libs) {
    if (board_hash[0] === approx_hash[2 * e] && board_hash[1] === approx_hash[2 * e + 1] && maxlib <= approx_threshold[e])
      return approx_libs[e];
    liberties = fastlib(pos, color, true);
    if (liberties >= 0) {
      approx_threshold[e] = MAXLIBS;
      approx_libs[e] = liberties;
      approx_hash[2 * e] = board_hash[0];
      approx_hash[2 * e + 1] = board_hash[1];
      return liberties;
    }
  }
  approx_threshold[e] = maxlib;
  if (maxlib <= MAX_LIBERTIES) liberties = do_approxlib(pos, color, maxlib, libs);
  else liberties = slow_approxlib(pos, color, maxlib, libs);
  approx_libs[e] = liberties;
  approx_hash[2 * e] = board_hash[0];
  approx_hash[2 * e + 1] = board_hash[1];
  return liberties;
}

function do_approxlib(pos: number, color: number, maxlib: number, libs: number[] | null): number {
  let liberties = 0;
  liberty_mark++;
  MARK_LIBERTY(pos);
  const dirs = [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)];
  for (let d = 0; d < 4; d++) {
    const n = dirs[d];
    if (UNMARKED_LIBERTY(n)) {
      if (libs) libs[liberties] = n;
      liberties++;
      if (d < 3) {
        if (liberties >= maxlib) return liberties;
        MARK_LIBERTY(n);
      }
    } else if (board[n] === color) {
      const s = M[SNUM + n];
      for (let k = 0; k < M[sf(s, F_LIBS)]; k++) {
        const lib = M[sl(s, k)];
        if (UNMARKED_LIBERTY(lib)) {
          if (libs) libs[liberties] = lib;
          liberties++;
          if (liberties >= maxlib) return liberties;
          MARK_LIBERTY(lib);
        }
      }
    }
  }
  if (!libs) approx_threshold[pos * 2 + color - 1] = MAXLIBS;
  return liberties;
}

function slow_approxlib(pos: number, color: number, maxlib: number, libs: number[] | null): number {
  let liberties = 0;
  liberty_mark++;
  MARK_LIBERTY(pos);
  string_mark++;
  for (let k = 0; k < 4; k++) {
    const d = delta[k];
    if (UNMARKED_LIBERTY(pos + d)) {
      if (libs) libs[liberties] = pos + d;
      liberties++;
      if (liberties === maxlib) return liberties;
      MARK_LIBERTY(pos + d);
    } else if (board[pos + d] === color && UNMARKED_STRING(pos + d)) {
      const s = M[SNUM + pos + d];
      let pos2 = M[sf(s, F_ORIGIN)];
      do {
        for (let l = 0; l < 4; l++) {
          const d2 = delta[l];
          if (UNMARKED_LIBERTY(pos2 + d2)) {
            if (libs) libs[liberties] = pos2 + d2;
            liberties++;
            if (liberties === maxlib) return liberties;
            MARK_LIBERTY(pos2 + d2);
          }
        }
        pos2 = next_stone(pos2);
      } while (pos2 !== M[sf(s, F_ORIGIN)]);
      MARK_STRING(pos + d);
    }
  }
  if (!libs) approx_threshold[pos * 2 + color - 1] = MAXLIBS;
  return liberties;
}

export function accuratelib(pos: number, color: number, maxlib: number, libs: number[] | null): number {
  let liberties;
  const e = pos * 2 + color - 1;
  if (!libs) {
    if (
      board_hash[0] === accurate_hash[2 * e] &&
      board_hash[1] === accurate_hash[2 * e + 1] &&
      maxlib <= accurate_threshold[e]
    )
      return accurate_libs[e];
    liberties = fastlib(pos, color, false);
    if (liberties >= 0) {
      accurate_threshold[e] = MAXLIBS;
      accurate_libs[e] = liberties;
      accurate_hash[2 * e] = board_hash[0];
      accurate_hash[2 * e + 1] = board_hash[1];
      return liberties;
    }
  }
  liberties = do_accuratelib(pos, color, maxlib, libs);
  accurate_threshold[e] = liberties < maxlib ? MAXLIBS : maxlib;
  accurate_libs[e] = liberties;
  accurate_hash[2 * e] = board_hash[0];
  accurate_hash[2 * e + 1] = board_hash[1];
  return liberties;
}

function do_accuratelib(pos: number, color: number, maxlib: number, libs: number[] | null): number {
  let liberties = 0;
  const captured = [0, 0, 0, 0];
  let captures = 0;
  string_mark++;
  liberty_mark++;
  MARK_LIBERTY(pos);
  for (let k = 0; k < 4; k++) {
    const pos2 = pos + delta[k];
    if (UNMARKED_LIBERTY(pos2)) {
      if (libs) libs[liberties] = pos2;
      liberties++;
      if (liberties >= maxlib) return liberties;
      MARK_LIBERTY(pos2);
    } else if (UNMARKED_COLOR_STRING(pos2, color)) {
      const s = M[SNUM + pos2];
      const slibs = M[sf(s, F_LIBS)];
      if (slibs <= MAX_LIBERTIES || maxlib <= MAX_LIBERTIES - 1) {
        for (let l = 0; l < slibs; l++) {
          const lib = M[sl(s, l)];
          if (UNMARKED_LIBERTY(lib)) {
            if (libs) libs[liberties] = lib;
            liberties++;
            if (liberties >= maxlib) return liberties;
            MARK_LIBERTY(lib);
          }
        }
      } else {
        let stone = pos2;
        do {
          for (const n of [SOUTH(stone), WEST(stone), NORTH(stone), EAST(stone)]) {
            if (UNMARKED_LIBERTY(n)) {
              if (libs) libs[liberties] = n;
              liberties++;
              if (liberties >= maxlib) return liberties;
              MARK_LIBERTY(n);
            }
          }
          stone = next_stone(stone);
        } while (stone !== pos2);
      }
      MARK_STRING(pos2);
    } else if (board[pos2] === OTHER_COLOR(color) && M[sf(M[SNUM + pos2], F_LIBS)] === 1) {
      captured[captures++] = pos2;
    }
  }
  for (let k = 0; k < captures; k++) {
    let lib = captured[k];
    if (
      !MARKED_COLOR_STRING(SOUTH(lib), color) &&
      !MARKED_COLOR_STRING(WEST(lib), color) &&
      !MARKED_COLOR_STRING(NORTH(lib), color) &&
      !MARKED_COLOR_STRING(EAST(lib), color)
    ) {
      if (libs) libs[liberties] = lib;
      liberties++;
      if (liberties >= maxlib) return liberties;
    }
    let l;
    for (l = 0; l < k; l++) if (M[SNUM + captured[l]] === M[SNUM + lib]) break;
    if (l === k) {
      do {
        if (
          MARKED_COLOR_STRING(SOUTH(lib), color) ||
          MARKED_COLOR_STRING(WEST(lib), color) ||
          MARKED_COLOR_STRING(NORTH(lib), color) ||
          MARKED_COLOR_STRING(EAST(lib), color)
        ) {
          if (libs) libs[liberties] = lib;
          liberties++;
          if (liberties >= maxlib) return liberties;
        }
        lib = next_stone(lib);
      } while (lib !== captured[k]);
    }
  }
  return liberties;
}

export function count_common_libs(str1: number, str2: number): number {
  let commonlibs = 0;
  let n = M[SNUM + str1];
  let liberties1 = M[sf(n, F_LIBS)];
  if (liberties1 > M[sf(M[SNUM + str2], F_LIBS)]) {
    n = M[SNUM + str2];
    liberties1 = M[sf(n, F_LIBS)];
    const tmp = str1;
    str1 = str2;
    str2 = tmp;
  }
  let libs1: number[];
  if (liberties1 <= MAX_LIBERTIES) {
    libs1 = [];
    for (let k = 0; k < MAX_LIBERTIES; k++) libs1.push(M[sl(n, k)]);
    const n2 = M[SNUM + str2];
    const liberties2 = M[sf(n2, F_LIBS)];
    if (liberties2 <= MAX_LIBERTIES) {
      liberty_mark++;
      for (let k = 0; k < liberties1; k++) MARK_LIBERTY(libs1[k]);
      for (let k = 0; k < liberties2; k++) if (!UNMARKED_LIBERTY(M[sl(n2, k)])) commonlibs++;
      return commonlibs;
    }
  } else {
    libs1 = [];
    findlib(str1, MAXLIBS, libs1);
  }
  for (let k = 0; k < liberties1; k++)
    if (NEIGHBOR_OF_STRING(libs1[k], M[SNUM + str2], board[str2])) commonlibs++;
  return commonlibs;
}

export function countstones(str: number): number {
  return COUNTSTONES(str);
}

export function findstones(str: number, maxstones: number, stones: number[] | Int32Array): number {
  const s = M[SNUM + str];
  const size = M[sf(s, F_SIZE)];
  let pos = M[sf(s, F_ORIGIN)];
  for (let k = 0; k < maxstones && k < size; k++) {
    stones[k] = pos;
    pos = next_stone(pos);
  }
  return size;
}

export function find_origin(str: number): number {
  return M[sf(M[SNUM + str], F_ORIGIN)];
}

export function is_self_atari(pos: number, color: number): boolean {
  const other = OTHER_COLOR(color);
  let trivial_liberties = 0;
  let captures = 0;
  let far_liberties = 0;
  string_mark++;
  const dirs = [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)];
  for (let d = 0; d < 4; d++) {
    const n = dirs[d];
    if (LIBERTY(n)) trivial_liberties++;
    else if (board[n] === color) {
      if (LIBERTIES(n) > 2) return false;
      if (LIBERTIES(n) === 2) far_liberties++;
    } else if (board[n] === other && LIBERTIES(n) === 1 && UNMARKED_STRING(n)) {
      captures++;
      if (d < 3) MARK_STRING(n);
    }
  }
  if (trivial_liberties + captures >= 2) return false;
  if ((far_liberties > 0 ? 1 : 0) + captures >= 2) return false;
  if (captures === 0 && far_liberties + trivial_liberties <= 1) return true;
  return accuratelib(pos, color, 2, null) <= 1;
}

export function liberty_of_string(pos: number, str: number): boolean {
  if (IS_STONE(board[pos])) return false;
  return NEIGHBOR_OF_STRING(pos, M[SNUM + str], board[str]);
}

export function neighbor_of_string(pos: number, str: number): boolean {
  return NEIGHBOR_OF_STRING(pos, M[SNUM + str], board[str]);
}

export function has_neighbor(pos: number, color: number): boolean {
  return board[SOUTH(pos)] === color || board[WEST(pos)] === color || board[NORTH(pos)] === color || board[EAST(pos)] === color;
}

export function same_string(str1: number, str2: number): boolean {
  return M[SNUM + str1] === M[SNUM + str2];
}

export function is_ko(pos: number, color: number): number {
  // returns the ko position + 1 when it is a ko capture (the C *ko_pos), else 0
  const other = OTHER_COLOR(color);
  let captures = 0;
  let kpos = 0;
  for (const n of [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)]) {
    if (ON_BOARD(n)) {
      if (board[n] !== other) return 0;
      else if (LIBERTIES(n) === 1) {
        kpos = n;
        captures += COUNTSTONES(n);
        if (captures > 1) return 0;
      }
    }
  }
  return captures === 1 ? kpos + 1 : 0;
}

function is_superko_violation(pos: number, color: number, type: number): boolean {
  if (type === NONE || type === SIMPLE) return false;
  const this_board_hash = board_hash.slice();
  if (M[KO] !== NO_MOVE) hashdata_invert_ko(this_board_hash, M[KO]);
  really_do_trymove(pos, color);
  const new_board_hash = board_hash.slice();
  if (M[KO] !== NO_MOVE) hashdata_invert_ko(new_board_hash, M[KO]);
  undo_trymove();
  if (type === PSK && this_board_hash[0] === new_board_hash[0] && this_board_hash[1] === new_board_hash[1]) return true;
  for (let k = g.move_history_pointer - 1; k >= 0; k--)
    if (
      move_history_hash[2 * k] === new_board_hash[0] &&
      move_history_hash[2 * k + 1] === new_board_hash[1] &&
      (type === PSK || move_history_color[k] === OTHER_COLOR(color))
    )
      return true;
  return false;
}

export function does_capture_something(pos: number, color: number): boolean {
  const other = OTHER_COLOR(color);
  for (const n of [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)]) if (board[n] === other && LIBERTIES(n) === 1) return true;
  return false;
}

export function mark_string(str: number, mx: Int8Array | Int32Array, mark: number): void {
  let pos = str;
  do {
    mx[pos] = mark;
    pos = next_stone(pos);
  } while (pos !== str);
}

let stone_count_for_position = -1;
let white_stones = 0;
let black_stones = 0;
export function stones_on_board(color: number): number {
  if (stone_count_for_position !== g.position_number) {
    white_stones = 0;
    black_stones = 0;
    for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
      if (board[pos] === WHITE) white_stones++;
      else if (board[pos] === BLACK) black_stones++;
    }
    stone_count_for_position = g.position_number;
  }
  return (color & BLACK ? black_stones : 0) + (color & WHITE ? white_stones : 0);
}

export const get_trymove_counter = (): number => trymove_counter;

// ---------------------------------------------------------------- the incremental board

function new_position(): void {
  g.position_number++;
  M[NEXT_STRING] = 0;
  liberty_mark = 0;
  string_mark = 0;
  CLEAR_STACKS();
  M.fill(0, STR, SNUM);
  ml.fill(0);
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) if (ON_BOARD(pos)) M[SNUM + pos] = -1;
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!ON_BOARD(pos)) continue;
    if (IS_STONE(board[pos]) && M[SNUM + pos] === -1) {
      const s = M[NEXT_STRING];
      M[SNUM + pos] = s;
      M[sf(s, F_SIZE)] = propagate_string(pos, pos);
      M[sf(s, F_COLOR)] = board[pos];
      M[sf(s, F_ORIGIN)] = pos;
      M[sf(s, F_MARK)] = 0;
      M[NEXT_STRING]++;
    }
  }
  for (let s = 0; s < M[NEXT_STRING]; s++) find_liberties_and_neighbors(s);
}

function propagate_string(stone: number, str: number): number {
  let size = 1;
  if (stone === str) {
    M[NEXTST + stone] = stone;
  } else {
    M[SNUM + stone] = M[SNUM + str];
    M[NEXTST + stone] = M[NEXTST + str];
    M[NEXTST + str] = stone;
  }
  for (let k = 0; k < 4; k++) {
    const d = delta[k];
    if (ON_BOARD(stone + d) && board[stone + d] === board[stone] && M[SNUM + stone + d] === -1)
      size += propagate_string(stone + d, str);
  }
  return size;
}

function find_liberties_and_neighbors(s: number): void {
  const other = OTHER_COLOR(M[sf(s, F_COLOR)]);
  liberty_mark++;
  string_mark++;
  let pos = M[sf(s, F_ORIGIN)];
  do {
    for (const n of [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)]) {
      if (UNMARKED_LIBERTY(n)) ADD_AND_MARK_LIBERTY(s, n);
      else if (UNMARKED_COLOR_STRING(n, other)) {
        ADD_NEIGHBOR(s, n);
        MARK_STRING(n);
      }
    }
    pos = next_stone(pos);
  } while (pos !== M[sf(s, F_ORIGIN)]);
}

function update_liberties(s: number): void {
  PUSH_VALUE(sf(s, F_LIBS));
  for (let k = 0; k < M[sf(s, F_LIBS)] && k < MAX_LIBERTIES; k++) PUSH_VALUE(sl(s, k));
  M[sf(s, F_LIBS)] = 0;
  liberty_mark++;
  let pos = M[sf(s, F_ORIGIN)];
  do {
    for (const n of [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)]) if (UNMARKED_LIBERTY(n)) ADD_AND_MARK_LIBERTY(s, n);
    pos = next_stone(pos);
  } while (pos !== M[sf(s, F_ORIGIN)]);
}

function remove_neighbor(str_number: number, n: number): void {
  const cnt = M[sf(str_number, F_NEIGH)];
  for (let k = 0; k < cnt; k++)
    if (M[sn(str_number, k)] === n) {
      PUSH_VALUE(sn(str_number, cnt - 1));
      PUSH_VALUE(sn(str_number, k));
      PUSH_VALUE(sf(str_number, F_NEIGH));
      M[sn(str_number, k)] = M[sn(str_number, cnt - 1)];
      M[sf(str_number, F_NEIGH)]--;
      return;
    }
  throw new Error('remove_neighbor: not found');
}

function remove_liberty(str_number: number, pos: number): void {
  const libs = M[sf(str_number, F_LIBS)];
  if (libs > MAX_LIBERTIES) update_liberties(str_number);
  else {
    for (let k = 0; k < libs; k++)
      if (M[sl(str_number, k)] === pos) {
        PUSH_VALUE(sl(str_number, libs - 1));
        PUSH_VALUE(sl(str_number, k));
        PUSH_VALUE(sf(str_number, F_LIBS));
        M[sl(str_number, k)] = M[sl(str_number, libs - 1)];
        M[sf(str_number, F_LIBS)]--;
        break;
      }
  }
}

function add_lib_unrecorded(neighbor: number, pos: number): void {
  const n = M[sf(neighbor, F_LIBS)];
  if (n < MAX_LIBERTIES) M[sl(neighbor, n)] = pos;
  M[sf(neighbor, F_LIBS)] = n + 1;
}

function do_remove_string(s: number): number {
  const size = M[sf(s, F_SIZE)];
  let pos = M[sf(s, F_ORIGIN)];
  do {
    PUSH_VALUE(SNUM + pos);
    PUSH_VALUE(NEXTST + pos);
    DO_REMOVE_STONE(pos);
    pos = next_stone(pos);
  } while (pos !== M[sf(s, F_ORIGIN)]);

  if (size === 1) {
    for (let k = 0; k < M[sf(s, F_NEIGH)]; k++) {
      const neighbor = M[sn(s, k)];
      remove_neighbor(neighbor, s);
      PUSH_VALUE(sf(neighbor, F_LIBS));
      add_lib_unrecorded(neighbor, pos);
    }
  } else if (size === 2) {
    const other = OTHER_COLOR(M[sf(s, F_COLOR)]);
    const pos2 = next_stone(pos);
    for (let k = 0; k < M[sf(s, F_NEIGH)]; k++) {
      const neighbor = M[sn(s, k)];
      remove_neighbor(neighbor, s);
      PUSH_VALUE(sf(neighbor, F_LIBS));
      if (NEIGHBOR_OF_STRING(pos, neighbor, other)) add_lib_unrecorded(neighbor, pos);
      if (NEIGHBOR_OF_STRING(pos2, neighbor, other)) add_lib_unrecorded(neighbor, pos2);
    }
  } else {
    for (let k = 0; k < M[sf(s, F_NEIGH)]; k++) {
      remove_neighbor(M[sn(s, k)], s);
      update_liberties(M[sn(s, k)]);
    }
  }
  if (M[sf(s, F_COLOR)] === WHITE) M[WCAP] += size;
  else M[BCAP] += size;
  return size;
}

function create_new_string(pos: number): void {
  const color = board[pos];
  const other = OTHER_COLOR(color);
  PUSH_VALUE(NEXT_STRING);
  const s = M[NEXT_STRING]++;
  M[SNUM + pos] = s;
  M[NEXTST + pos] = pos;
  M[sf(s, F_COLOR)] = color;
  M[sf(s, F_SIZE)] = 1;
  M[sf(s, F_ORIGIN)] = pos;
  M[sf(s, F_LIBS)] = 0;
  M[sf(s, F_NEIGH)] = 0;
  M[sf(s, F_MARK)] = 0;
  string_mark++;
  const dirs = [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)];
  for (let d = 0; d < 4; d++) {
    const n = dirs[d];
    if (LIBERTY(n)) ADD_LIBERTY(s, n);
    else if (UNMARKED_COLOR_STRING(n, other)) {
      const s2 = M[SNUM + n];
      ADD_NEIGHBOR(s, n);
      PUSH_VALUE(sf(s2, F_NEIGH));
      ADD_NEIGHBOR(s2, pos);
      if (d < 3) MARK_STRING(n);
    }
  }
}

function extend_neighbor_string(pos: number, s: number): void {
  let liberties_updated = false;
  const color = board[pos];
  const other = OTHER_COLOR(color);
  const pos2 = M[sf(s, F_ORIGIN)];
  M[NEXTST + pos] = M[NEXTST + pos2];
  PUSH_VALUE(NEXTST + pos2);
  M[NEXTST + pos2] = pos;
  if (pos < pos2) {
    PUSH_VALUE(sf(s, F_ORIGIN));
    M[sf(s, F_ORIGIN)] = pos;
  }
  M[SNUM + pos] = s;
  PUSH_VALUE(sf(s, F_SIZE));
  M[sf(s, F_SIZE)]++;
  if (M[sf(s, F_LIBS)] > MAX_LIBERTIES) {
    update_liberties(s);
    liberties_updated = true;
  } else remove_liberty(s, pos);

  string_mark++;
  for (let k = 0; k < M[sf(s, F_NEIGH)]; k++) M[sf(M[sn(s, k)], F_MARK)] = string_mark;

  const dirs = [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)];
  const nonneighbor = [NON_SOUTH_NEIGHBOR_OF_STRING, NON_WEST_NEIGHBOR_OF_STRING, NON_NORTH_NEIGHBOR_OF_STRING, NON_EAST_NEIGHBOR_OF_STRING];
  for (let d = 0; d < 4; d++) {
    const n = dirs[d];
    if (LIBERTY(n)) {
      if (!liberties_updated && !nonneighbor[d](n, s, color)) ADD_LIBERTY(s, n);
    } else if (UNMARKED_COLOR_STRING(n, other)) {
      const s2 = M[SNUM + n];
      PUSH_VALUE(sf(s, F_NEIGH));
      ADD_NEIGHBOR(s, n);
      PUSH_VALUE(sf(s2, F_NEIGH));
      ADD_NEIGHBOR(s2, pos);
      if (d < 3) MARK_STRING(n);
    }
  }
}

function assimilate_string(s: number, pos: number): void {
  const s2 = M[SNUM + pos];
  M[sf(s, F_SIZE)] += M[sf(s2, F_SIZE)];
  let last = 0;
  pos = M[sf(s2, F_ORIGIN)];
  do {
    PUSH_VALUE(SNUM + pos);
    M[SNUM + pos] = s;
    last = pos;
    pos = next_stone(pos);
  } while (pos !== M[sf(s2, F_ORIGIN)]);
  {
    const pos2 = M[sf(s, F_ORIGIN)];
    PUSH_VALUE(NEXTST + last);
    PUSH_VALUE(NEXTST + pos2);
    M[NEXTST + last] = M[NEXTST + pos2];
    M[NEXTST + pos2] = M[sf(s2, F_ORIGIN)];
    if (M[sf(s2, F_ORIGIN)] < pos2) M[sf(s, F_ORIGIN)] = M[sf(s2, F_ORIGIN)];
  }
  if (M[sf(s2, F_LIBS)] <= MAX_LIBERTIES) {
    for (let k = 0; k < M[sf(s2, F_LIBS)]; k++) {
      const pos2 = M[sl(s2, k)];
      if (UNMARKED_LIBERTY(pos2)) ADD_AND_MARK_LIBERTY(s, pos2);
    }
  } else {
    liberty_mark++;
    M[sf(s, F_LIBS)] = 0;
    update_liberties(s);
  }
  for (let k = 0; k < M[sf(s2, F_NEIGH)]; k++) {
    const t = M[sn(s2, k)];
    remove_neighbor(t, s2);
    if (M[sf(t, F_MARK)] !== string_mark) {
      PUSH_VALUE(sf(t, F_NEIGH));
      M[sn(t, M[sf(t, F_NEIGH)]++)] = s;
      M[sn(s, M[sf(s, F_NEIGH)]++)] = t;
      M[sf(t, F_MARK)] = string_mark;
    }
  }
}

function assimilate_neighbor_strings(pos: number): void {
  const color = board[pos];
  const other = OTHER_COLOR(color);
  PUSH_VALUE(NEXT_STRING);
  const s = M[NEXT_STRING]++;
  M[SNUM + pos] = s;
  M[NEXTST + pos] = pos;
  M[sf(s, F_COLOR)] = color;
  M[sf(s, F_SIZE)] = 1;
  M[sf(s, F_ORIGIN)] = pos;
  M[sf(s, F_LIBS)] = 0;
  M[sf(s, F_NEIGH)] = 0;
  liberty_mark++;
  string_mark++;
  M[sf(s, F_MARK)] = string_mark;
  const dirs = [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)];
  for (let d = 0; d < 4; d++) {
    const n = dirs[d];
    if (UNMARKED_LIBERTY(n)) {
      if (d < 3) ADD_AND_MARK_LIBERTY(s, n);
      else ADD_LIBERTY(s, n);
    } else if (UNMARKED_COLOR_STRING(n, other)) {
      ADD_NEIGHBOR(s, n);
      PUSH_VALUE(sf(M[SNUM + n], F_NEIGH));
      ADD_NEIGHBOR(M[SNUM + n], pos);
      if (d < 3) MARK_STRING(n);
    } else if (UNMARKED_COLOR_STRING(n, color)) {
      assimilate_string(s, n);
    }
  }
}

function do_commit_suicide(pos: number, color: number): void {
  for (const n of [SOUTH(pos), WEST(pos), NORTH(pos), EAST(pos)]) if (board[n] === color) do_remove_string(M[SNUM + n]);
  if (color === WHITE) M[WCAP]++;
  else M[BCAP]++;
}

function do_play_move(pos: number, color: number): void {
  const other = OTHER_COLOR(color);
  let captured_stones = 0;
  let neighbor_allies = 0;
  let s = -1;
  string_mark++;
  DO_ADD_STONE(pos, color);
  M[SNUM + pos] = -1;

  const sN = SOUTH(pos);
  if (board[sN] === color) {
    neighbor_allies++;
    s = M[SNUM + sN];
    MARK_STRING(sN);
  } else if (board[sN] === other) {
    if (LIBERTIES(sN) > 1) {
      remove_liberty(M[SNUM + sN], pos);
      MARK_STRING(sN);
    } else captured_stones += do_remove_string(M[SNUM + sN]);
  }
  const rest = [WEST(pos), NORTH(pos), EAST(pos)];
  for (let d = 0; d < 3; d++) {
    const n = rest[d];
    if (UNMARKED_COLOR_STRING(n, color)) {
      neighbor_allies++;
      s = M[SNUM + n];
      if (d < 2) MARK_STRING(n);
    } else if (UNMARKED_COLOR_STRING(n, other)) {
      if (LIBERTIES(n) > 1) {
        remove_liberty(M[SNUM + n], pos);
        if (d < 2) MARK_STRING(n);
      } else captured_stones += do_remove_string(M[SNUM + n]);
    }
  }

  if (neighbor_allies === 0) create_new_string(pos);
  else if (neighbor_allies === 1) {
    extend_neighbor_string(pos, s);
    return;
  } else {
    assimilate_neighbor_strings(pos);
    return;
  }

  s = M[SNUM + pos];
  if (M[sf(s, F_LIBS)] === 1 && M[sf(s, F_SIZE)] === 1 && captured_stones === 1) {
    if (M[KO] !== NO_MOVE) hashdata_invert_ko(board_hash, M[KO]);
    M[KO] = M[sl(s, 0)];
    hashdata_invert_ko(board_hash, M[KO]);
  }
}

// ---------------------------------------------------------------- engine/interface.c: init_gnugo (board part)

/** init_gnugo(): the Zobrist numbers from HASH_RANDOM_SEED, then the game's seed */
export function init_board(seed: number): void {
  set_random_seed(HASH_RANDOM_SEED);
  hash_init();
  set_random_seed(seed);
  clear_board();
  clear_approxlib_cache();
  clear_accuratelib_cache();
}
