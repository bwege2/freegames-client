// engine/montecarlo.c of GNU Go 3.8: the Monte Carlo board, the pattern-weighted random games
// (simulation policy from patterns/mc_montegnu_classic.db, read by mc_load_patterns_from_db) and the
// UCT search uct_genmove().
//
// struct mc_game (with its struct mc_board) is one Int32Array here, so that `tree.game =
// starting_position` stays one copy. Unsigned fields are read through a Uint32Array on the same
// memory. Floats are rounded to single precision (Math.fround) wherever the C code stores a float.
import {
  BLACK, BOARDMAX, BOARDMIN, BOARDSIZE, EMPTY, GRAY, NE, NO_MOVE, NORTH, NW, PASS_MOVE, SE, SOUTH, SW,
  WEST, EAST, WHITE, IS_STONE, OTHER_COLOR, ON_BOARD, board, board_hash, board_ko_pos, countlib, countstones,
  delta, findstones, g, get_last_move, hashdata_invert_ko, hashdata_invert_stone, is_self_atari, is_suicide,
} from './board.ts';
import { gg_drand } from './random.ts';

const NUM_MOVE_PARTITIONS = 16;
const fr = Math.fround;

// ------------------------------------------------- struct mc_game layout (offsets into one Int32Array)
const O_BOARD = 0;
const O_LC = O_BOARD + BOARDSIZE;
const O_QUEUE = O_LC + BOARDSIZE;
const O_MVW = O_QUEUE + BOARDMAX;
const O_MVB = O_MVW + BOARDMAX;
const O_PSW = O_MVB + BOARDMAX;
const O_PSB = O_PSW + NUM_MOVE_PARTITIONS;
const O_PLW = O_PSB + NUM_MOVE_PARTITIONS;
const O_PLB = O_PLW + BOARDMAX;
const O_MSW = O_PLB + BOARDMAX;
const O_MSB = O_MSW + 1;
const O_KO = O_MSB + 1;
const O_REF = O_KO + 1;
const O_NEXT = O_REF + BOARDMAX;
const O_FLE = O_NEXT + BOARDMAX;
const O_PLE = O_FLE + BOARDMAX;
const O_NLE = O_PLE + 4 * BOARDMAX;
const O_HASH = O_NLE + 4 * BOARDMAX;
const O_HIST = O_HASH + 2;
const O_SETTLED = O_HIST + 600;
const O_CTM = O_SETTLED + BOARDMAX;
const O_LAST = O_CTM + 1;
const O_CPASS = O_LAST + 1;
const O_CKO = O_CPASS + 1;
const O_DEPTH = O_CKO + 1;
const GAME_SIZE = O_DEPTH + 1;

class McGame {
  buf = new ArrayBuffer(GAME_SIZE * 4);
  i = new Int32Array(this.buf);
  u = new Uint32Array(this.buf);
  copyFrom(other: McGame): void {
    this.i.set(other.i);
  }
}

// ------------------------------------------------- the pattern table
const NUM_GEOMETRIES = 1107;
const NUM_PROPERTIES = 256;
const geometry_table = new Uint16Array(65536);
const values = new Uint32Array((NUM_GEOMETRIES + 1) * NUM_PROPERTIES);

const ADD_TO_QUEUE = (m: Int32Array, pos: number): void => {
  if (!m[O_QUEUE + pos]) {
    m[O_QUEUE + pos] = m[O_QUEUE];
    m[O_QUEUE] = pos;
  }
};

function mc_add_liberty_edge(m: Int32Array, pos: number, lib: number, dir: number): void {
  const this_liberty_edge = (lib << 2) | dir;
  const reference = m[O_REF + pos];
  const first_liberty_edge = m[O_FLE + reference];
  if (first_liberty_edge) {
    const second_liberty_edge = m[O_NLE + first_liberty_edge];
    m[O_PLE + this_liberty_edge] = first_liberty_edge;
    m[O_NLE + this_liberty_edge] = second_liberty_edge;
    m[O_NLE + first_liberty_edge] = this_liberty_edge;
    m[O_PLE + second_liberty_edge] = this_liberty_edge;
  } else {
    m[O_FLE + reference] = this_liberty_edge;
    m[O_NLE + this_liberty_edge] = this_liberty_edge;
    m[O_PLE + this_liberty_edge] = this_liberty_edge;
  }
}

function mc_remove_liberty_edge(m: Int32Array, pos: number, lib: number, dir: number): number {
  const reference = m[O_REF + pos];
  const this_liberty_edge = (lib << 2) | dir;
  const next = m[O_NLE + this_liberty_edge];
  const previous = m[O_PLE + this_liberty_edge];
  if (next === this_liberty_edge) {
    m[O_FLE + reference] = 0;
    return 0;
  }
  m[O_NLE + previous] = next;
  m[O_PLE + next] = previous;
  if (m[O_FLE + reference] === this_liberty_edge) m[O_FLE + reference] = next;
  return next;
}

function mc_join_strings(m: Int32Array, str1: number, str2: number): void {
  const reference = m[O_REF + str2];
  const liberty_edge2 = m[O_FLE + reference];
  const liberty_edge1 = m[O_FLE + m[O_REF + str1]];
  let pos = str1;
  do {
    m[O_REF + pos] = reference;
    pos = m[O_NEXT + pos];
  } while (pos !== str1);
  let next1 = m[O_NEXT + str1];
  m[O_NEXT + str1] = m[O_NEXT + str2];
  m[O_NEXT + str2] = next1;
  if (liberty_edge1 !== 0) {
    next1 = m[O_NLE + liberty_edge1];
    const next2 = m[O_NLE + liberty_edge2];
    m[O_NLE + liberty_edge1] = next2;
    m[O_NLE + liberty_edge2] = next1;
    m[O_PLE + next1] = liberty_edge2;
    m[O_PLE + next2] = liberty_edge1;
  }
}

function mc_queue_max_two_liberties(m: Int32Array, str: number): void {
  const reference = m[O_REF + str];
  const first_liberty_edge = m[O_FLE + reference];
  const first_liberty = first_liberty_edge >> 2;
  let liberty_edge = m[O_NLE + first_liberty_edge];
  if (first_liberty === NO_MOVE) return;
  while (liberty_edge !== first_liberty_edge) {
    if (liberty_edge >> 2 !== first_liberty) {
      const second_liberty = liberty_edge >> 2;
      while (liberty_edge !== first_liberty_edge) {
        if (liberty_edge >> 2 !== first_liberty && liberty_edge >> 2 !== second_liberty) return;
        liberty_edge = m[O_NLE + liberty_edge];
      }
      ADD_TO_QUEUE(m, first_liberty);
      ADD_TO_QUEUE(m, second_liberty);
      return;
    }
    liberty_edge = m[O_NLE + liberty_edge];
  }
  ADD_TO_QUEUE(m, first_liberty);
}

function mc_remove_string(game: McGame, str: number): number {
  const m = game.i;
  const color = m[O_BOARD + str];
  const other = OTHER_COLOR(color);
  let pos = str;
  let num_removed_stones = 0;
  do {
    for (let k = 0; k < 8; k++) {
      if (k < 4 && m[O_BOARD + pos + delta[k]] === other) {
        mc_queue_max_two_liberties(m, pos + delta[k]);
        mc_add_liberty_edge(m, pos + delta[k], pos, k);
      }
      if (m[O_BOARD + pos + delta[k]] === EMPTY) ADD_TO_QUEUE(m, pos + delta[k]);
    }
    m[O_BOARD + pos] = EMPTY;
    m[O_LC + NW(pos)] ^= color << 14;
    m[O_LC + SW(pos)] ^= color << 12;
    m[O_LC + SE(pos)] ^= color << 10;
    m[O_LC + NE(pos)] ^= color << 8;
    m[O_LC + WEST(pos)] ^= color << 6;
    m[O_LC + SOUTH(pos)] ^= color << 4;
    m[O_LC + EAST(pos)] ^= color << 2;
    m[O_LC + NORTH(pos)] ^= color;
    hashdata_invert_stone(game.u, pos, color, O_HASH);
    ADD_TO_QUEUE(m, pos);
    num_removed_stones++;
    pos = m[O_NEXT + pos];
  } while (pos !== str);
  return num_removed_stones;
}

function mc_init_board_from_global_board(game: McGame): void {
  const m = game.i;
  const stones = new Int32Array(BOARDMAX);
  for (let p = 0; p < BOARDSIZE; p++) m[O_BOARD + p] = board[p];
  m[O_KO] = board_ko_pos();
  game.u[O_HASH] = board_hash[0];
  game.u[O_HASH + 1] = board_hash[1];
  m.fill(0, O_QUEUE, O_QUEUE + BOARDMAX);
  m[O_QUEUE] = 1;
  m.fill(0, O_NEXT, O_NEXT + BOARDMAX);
  const B = (p: number): number => m[O_BOARD + p];
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    const geometry =
      (B(SE(pos)) << 14) | (B(NE(pos)) << 12) | (B(NW(pos)) << 10) | (B(SW(pos)) << 8) |
      (B(EAST(pos)) << 6) | (B(NORTH(pos)) << 4) | (B(WEST(pos)) << 2) | B(SOUTH(pos));
    m[O_LC + pos] = geometry;
    if (board[pos] === EMPTY) {
      let captured_black_stones = 0;
      let captured_white_stones = 0;
      if (is_self_atari(pos, WHITE)) m[O_LC + pos] |= 1 << 20;
      if (is_self_atari(pos, BLACK)) m[O_LC + pos] |= 1 << 21;
      if (is_suicide(pos, WHITE)) m[O_LC + pos] |= 1 << 22;
      if (is_suicide(pos, BLACK)) m[O_LC + pos] |= 1 << 23;
      for (let s = 0; s < 4; s++) {
        const n = pos + delta[s];
        if (board[n] === BLACK && countlib(n) === 1) captured_black_stones += countstones(n);
        else if (board[n] === WHITE && countlib(n) === 1) captured_white_stones += countstones(n);
      }
      if (captured_black_stones > 3) captured_black_stones = 3;
      if (captured_white_stones > 3) captured_white_stones = 3;
      m[O_LC + pos] |= captured_black_stones << 16;
      m[O_LC + pos] |= captured_white_stones << 18;
    }
    if (IS_STONE(board[pos]) && m[O_NEXT + pos] === 0) {
      const num_stones = findstones(pos, BOARDMAX, stones);
      m[O_FLE + pos] = 0;
      for (let r = 0; r < num_stones; r++) {
        m[O_NEXT + stones[r]] = stones[(r + 1) % num_stones];
        m[O_REF + stones[r]] = pos;
        for (let k = 0; k < 4; k++) {
          if (board[stones[r] + delta[k]] === EMPTY) mc_add_liberty_edge(m, stones[r], stones[r] + delta[k], (k + 2) % 4);
        }
      }
    }
  }
}

function mc_countstones(m: Int32Array, str: number, maxstones: number): number {
  let stone = str;
  let num_stones = 0;
  do {
    num_stones++;
    stone = m[O_NEXT + stone];
  } while (stone !== str && num_stones < maxstones);
  return num_stones;
}

const mc_is_suicide = (m: Int32Array, pos: number, color: number): number => (m[O_LC + pos] >> (21 + color)) & 1;

function mc_is_in_atari(m: Int32Array, str: number): boolean {
  const reference = m[O_REF + str];
  const first_liberty_edge = m[O_FLE + reference];
  const liberty = first_liberty_edge >> 2;
  let liberty_edge = m[O_NLE + first_liberty_edge];
  while (liberty_edge !== first_liberty_edge) {
    if (liberty_edge >> 2 !== liberty) return false;
    liberty_edge = m[O_NLE + liberty_edge];
  }
  return true;
}

function mc_is_in_atari2(m: Int32Array, first_liberty: number, first_liberty_edge: number): boolean {
  let liberty_edge = m[O_NLE + first_liberty_edge];
  while (liberty_edge !== first_liberty_edge) {
    if (liberty_edge >> 2 !== first_liberty) return false;
    liberty_edge = m[O_NLE + liberty_edge];
  }
  return true;
}

function mc_stones_in_atari(m: Int32Array, move: number, color: number, maxstones: number): number {
  let stones_in_atari = 0;
  for (let k = 0; k < 4 && stones_in_atari < maxstones; k++) {
    const pos = move + delta[k];
    if (m[O_BOARD + pos] === OTHER_COLOR(color) && mc_is_in_atari(m, pos))
      stones_in_atari += mc_countstones(m, pos, maxstones - stones_in_atari);
  }
  return stones_in_atari;
}

/** returns the second liberty, or NO_MOVE when the string has not exactly two (the C 0) */
function mc_has_two_liberties_one_given(m: Int32Array, str: number, first_liberty: number): number {
  const reference = m[O_REF + str];
  const first_liberty_edge = m[O_FLE + reference];
  let liberty_edge = first_liberty_edge;
  let second_liberty = NO_MOVE;
  do {
    const liberty = liberty_edge >> 2;
    if (liberty !== first_liberty) {
      if (second_liberty === NO_MOVE) second_liberty = liberty;
      else if (liberty !== second_liberty) return NO_MOVE;
    }
    liberty_edge = m[O_NLE + liberty_edge];
  } while (liberty_edge !== first_liberty_edge);
  return second_liberty;
}

function mc_is_self_atari(m: Int32Array, pos: number, color: number): number {
  let captured = NO_MOVE;
  let liberty = NO_MOVE;
  if (
    (m[O_BOARD + SOUTH(pos)] === EMPTY ? 1 : 0) + (m[O_BOARD + WEST(pos)] === EMPTY ? 1 : 0) +
      (m[O_BOARD + NORTH(pos)] === EMPTY ? 1 : 0) + (m[O_BOARD + EAST(pos)] === EMPTY ? 1 : 0) > 1
  )
    return 0;
  for (let k = 0; k < 4; k++) {
    let additional_liberty = 0;
    const pos2 = pos + delta[k];
    const b2 = m[O_BOARD + pos2];
    if (b2 === EMPTY) {
      if (pos2 !== liberty) {
        if (liberty !== NO_MOVE) return 0;
        else liberty = pos2;
      }
    } else if (IS_STONE(b2)) {
      const first_liberty_edge = (pos << 2) | k;
      let liberty_edge = m[O_NLE + first_liberty_edge];
      while (liberty_edge !== first_liberty_edge) {
        const lib = liberty_edge >> 2;
        if (lib !== pos) {
          additional_liberty = 1;
          if (b2 === color) {
            if (lib !== liberty) {
              if (liberty !== NO_MOVE) return 0;
              else liberty = lib;
            }
          } else break;
        }
        liberty_edge = m[O_NLE + liberty_edge];
      }
      if (b2 !== color && additional_liberty === 0) {
        captured = pos2;
        if (pos2 !== liberty) {
          if (liberty !== NO_MOVE) return 0;
          else liberty = pos2;
        }
      }
    }
  }
  if (liberty === NO_MOVE || captured === NO_MOVE) return 1;
  const reference = m[O_REF + captured];
  const other = OTHER_COLOR(color);
  for (let k = 0; k < 4; k++) {
    if (m[O_BOARD + pos + delta[k]] === color) {
      let stone = pos + delta[k];
      do {
        for (let mm = 0; mm < 4; mm++) {
          const pos2 = stone + delta[mm];
          if (m[O_BOARD + pos2] === other && pos2 !== captured && m[O_REF + pos2] === reference) return 0;
        }
        stone = m[O_NEXT + stone];
      } while (stone !== pos + delta[k]);
    }
  }
  return 1;
}

function mc_update_local_context(m: Int32Array, pos: number): void {
  let min_white_liberties = 0;
  let min_black_liberties = 0;
  let white_liberty_through_stones = 0;
  let black_liberty_through_stones = 0;
  let min_white_captured_stones = 0;
  let min_black_captured_stones = 0;
  let white_suicide = 0;
  let black_suicide = 0;
  let white_self_atari = 0;
  let black_self_atari = 0;
  let white_captured_stones = 0;
  let black_captured_stones = 0;
  for (let k = 0; k < 4; k++) {
    const pos2 = pos + delta[k];
    switch (m[O_BOARD + pos2]) {
      case EMPTY:
        min_white_liberties++;
        min_black_liberties++;
        break;
      case WHITE:
        if (mc_is_in_atari2(m, pos, (pos << 2) | k)) {
          min_black_liberties++;
          min_white_captured_stones++;
        } else white_liberty_through_stones = 1;
        break;
      case BLACK:
        if (mc_is_in_atari2(m, pos, (pos << 2) | k)) {
          min_white_liberties++;
          min_black_captured_stones++;
        } else black_liberty_through_stones = 1;
        break;
    }
  }
  if (min_white_liberties + white_liberty_through_stones === 0) {
    white_suicide = 1;
    white_self_atari = 1;
  } else if (min_white_liberties <= 1) white_self_atari = mc_is_self_atari(m, pos, WHITE);
  if (min_black_liberties + black_liberty_through_stones === 0) {
    black_suicide = 1;
    black_self_atari = 1;
  } else if (min_black_liberties <= 1) black_self_atari = mc_is_self_atari(m, pos, BLACK);
  if (min_white_captured_stones >= 3) white_captured_stones = 3;
  else if (min_white_captured_stones > 0) white_captured_stones = mc_stones_in_atari(m, pos, BLACK, 3);
  if (min_black_captured_stones >= 3) black_captured_stones = 3;
  else if (min_black_captured_stones > 0) black_captured_stones = mc_stones_in_atari(m, pos, WHITE, 3);
  let lc = m[O_LC + pos] & 0xffff;
  lc |= black_captured_stones << 16;
  lc |= white_captured_stones << 18;
  lc |= white_self_atari << 20;
  lc |= black_self_atari << 21;
  lc |= white_suicide << 22;
  lc |= black_suicide << 23;
  m[O_LC + pos] = lc;
}

function mc_play_move(game: McGame, pos: number, color: number): boolean {
  const m = game.i;
  let captured_stones = 0;
  let num_direct_liberties = 0;
  let pos2;
  while (m[O_QUEUE] !== 1) {
    pos2 = m[O_QUEUE];
    m[O_QUEUE] = m[O_QUEUE + pos2];
    m[O_QUEUE + pos2] = 0;
  }
  if (pos === PASS_MOVE) {
    if (m[O_KO] !== NO_MOVE) hashdata_invert_ko(game.u, m[O_KO], O_HASH);
    m[O_KO] = NO_MOVE;
    return true;
  }
  if (pos === m[O_KO]) {
    if (m[O_BOARD + WEST(pos)] === OTHER_COLOR(color) || m[O_BOARD + EAST(pos)] === OTHER_COLOR(color)) return false;
  }
  if (mc_is_suicide(m, pos, color)) return false;
  if (m[O_KO] !== NO_MOVE) hashdata_invert_ko(game.u, m[O_KO], O_HASH);
  m[O_KO] = NO_MOVE;

  m[O_BOARD + pos] = color;
  hashdata_invert_stone(game.u, pos, color, O_HASH);
  m[O_NEXT + pos] = pos;
  m[O_LC + NW(pos)] |= color << 14;
  m[O_LC + SW(pos)] |= color << 12;
  m[O_LC + SE(pos)] |= color << 10;
  m[O_LC + NE(pos)] |= color << 8;
  m[O_LC + WEST(pos)] |= color << 6;
  m[O_LC + SOUTH(pos)] |= color << 4;
  m[O_LC + EAST(pos)] |= color << 2;
  m[O_LC + NORTH(pos)] |= color;
  m[O_REF + pos] = pos;
  m[O_FLE + pos] = 0;
  for (let k = 0; k < 4; k++) {
    pos2 = pos + delta[k];
    if (m[O_BOARD + pos2] === EMPTY) {
      mc_add_liberty_edge(m, pos, pos2, (k + 2) % 4);
      num_direct_liberties++;
      ADD_TO_QUEUE(m, pos2);
    }
  }
  for (let k = 0; k < 4; k++) {
    pos2 = pos + delta[k];
    if (m[O_BOARD + pos2] === color) {
      if (m[O_REF + pos] !== m[O_REF + pos2]) {
        const liberty = mc_has_two_liberties_one_given(m, pos2, pos);
        if (liberty !== NO_MOVE) ADD_TO_QUEUE(m, liberty);
        mc_join_strings(m, pos, pos2);
      }
      mc_remove_liberty_edge(m, pos2, pos, k);
    }
  }
  for (let k = 0; k < 4; k++) {
    pos2 = pos + delta[k];
    if (m[O_BOARD + pos2] === OTHER_COLOR(color)) {
      if (mc_remove_liberty_edge(m, pos2, pos, k) === 0) captured_stones += mc_remove_string(game, pos2);
      else mc_queue_max_two_liberties(m, pos2);
    }
  }
  if (captured_stones === 1 && m[O_NEXT + pos] === pos && num_direct_liberties === 0) {
    m[O_KO] = m[O_FLE + pos] >> 2;
    hashdata_invert_ko(game.u, m[O_KO], O_HASH);
  }
  mc_queue_max_two_liberties(m, pos);
  for (pos2 = m[O_QUEUE]; pos2 !== 1; pos2 = m[O_QUEUE + pos2]) if (pos2 !== pos) mc_update_local_context(m, pos2);
  ADD_TO_QUEUE(m, pos);
  for (let k = 0; k < 8; k++) if (m[O_BOARD + pos + delta[k]] === EMPTY) ADD_TO_QUEUE(m, pos + delta[k]);
  return true;
}

function mc_find_pattern_number(m: Int32Array, move: number, color: number, near_previous_move: number): number {
  const local_context = m[O_LC + move];
  let properties;
  let geometry;
  if (color === WHITE) {
    properties =
      ((local_context >> 16) & 0xa0) | ((local_context >> 14) & 0x40) | ((local_context >> 17) & 0x06) | ((local_context >> 13) & 0x18);
    geometry = local_context & 0xffff;
  } else {
    properties = (local_context >> 15) & 0xfe;
    geometry = ((local_context & 0x5555) << 1) | ((local_context & 0xaaaa) >> 1);
  }
  return (geometry_table[geometry] << 8) | properties | near_previous_move;
}

function mc_register_geometry_pattern(pattern: number, n: number): number {
  if (geometry_table[pattern] !== 0) return 0;
  for (let k = 0; k < 8; k++) {
    let transformed_pattern = pattern;
    if (k >= 4) {
      transformed_pattern =
        ((pattern & 0x0300) << 6) | ((pattern & 0x000c) << 4) | ((pattern & 0x0c00) << 2) | (pattern & 0x0033) |
        ((pattern & 0x3000) >> 2) | ((pattern & 0x00c0) >> 4) | ((pattern & 0xc000) >> 6);
    }
    for (let j = 0; j < k % 4; j++)
      transformed_pattern = ((transformed_pattern & 0xc0c0) >> 6) | ((transformed_pattern & 0x3f3f) << 2);
    geometry_table[transformed_pattern] = n;
  }
  return 1;
}

let geometries_initialized = false;
function mc_init_pattern_geometries(): void {
  if (geometries_initialized) return;
  geometries_initialized = true;
  geometry_table.fill(0);
  let n = 1;
  for (let pattern = 0; pattern < 65536; pattern++) {
    const off_board = pattern & (pattern >> 1) & 0x5555;
    if (off_board === 0x0 || off_board === 0x1410 || off_board === 0x5450) n += mc_register_geometry_pattern(pattern, n);
  }
  if (n !== NUM_GEOMETRIES + 1) throw new Error('mc_init_pattern_geometries: ' + n);
}

function mc_match_geometries(pattern: number[], matching_geometries: Uint8Array, n: number): void {
  if (n === 8) {
    let geometry = 0;
    for (let k = 0; k < 8; k++) {
      const c = String.fromCharCode(pattern[k]);
      if (c === 'O') geometry |= WHITE << (2 * k);
      else if (c === 'X') geometry |= BLACK << (2 * k);
      else if (c === '+' || c === '|' || c === '-') geometry |= (WHITE | BLACK) << (2 * k);
    }
    if (geometry_table[geometry] !== 0) matching_geometries[geometry_table[geometry]] = 1;
    return;
  }
  const np = pattern.slice();
  const c = String.fromCharCode(pattern[n]);
  const tryWith = (chars: string): void => {
    for (const ch of chars) {
      np[n] = ch.charCodeAt(0);
      mc_match_geometries(np, matching_geometries, n + 1);
    }
  };
  switch (c) {
    case '.': case 'O': case 'X': case '|': case '-': case '+':
      mc_match_geometries(np, matching_geometries, n + 1);
      break;
    case 'o': tryWith('.O'); break;
    case 'x': tryWith('.X'); break;
    case '?': tryWith('.OX'); break;
    case '%': tryWith('.OX+'); break;
  }
}

function mc_clear_properties(properties: Uint8Array, shift: number, mask: number, value: number): void {
  for (let k = 0; k < NUM_PROPERTIES; k++) if (((k >> shift) & mask) === value) properties[k] = 0;
}

function mc_analyze_properties(buf: string, properties: Uint8Array): void {
  properties.fill(1);
  const has = (s: string): boolean => buf.includes(s);
  const clr = (shift: number, mask: number, ...vals: number[]): void => {
    for (const v of vals) mc_clear_properties(properties, shift, mask, v);
  };
  if (has('near')) clr(0, 1, 0);
  if (has('far')) clr(0, 1, 1);
  if (has('xcap0')) clr(1, 3, 1, 2, 3);
  if (has('xcap1+')) clr(1, 3, 0);
  else if (has('xcap1-')) clr(1, 3, 2, 3);
  else if (has('xcap1')) clr(1, 3, 0, 2, 3);
  if (has('xcap2+')) clr(1, 3, 0, 1);
  else if (has('xcap2-')) clr(1, 3, 3);
  else if (has('xcap2')) clr(1, 3, 0, 1, 3);
  if (has('xcap3')) clr(1, 3, 0, 1, 2);
  if (has('ocap0')) clr(3, 3, 1, 2, 3);
  if (has('ocap1+')) clr(3, 3, 0);
  else if (has('ocap1-')) clr(3, 3, 2, 3);
  else if (has('ocap1')) clr(3, 3, 0, 2, 3);
  if (has('ocap2+')) clr(3, 3, 0, 1);
  else if (has('ocap2-')) clr(3, 3, 3);
  else if (has('ocap2')) clr(3, 3, 0, 1, 3);
  if (has('ocap3')) clr(3, 3, 0, 1, 2);
  if (has('xsafe')) clr(5, 1, 1);
  if (has('xunsafe')) clr(5, 1, 0);
  if (has('osafe')) clr(6, 1, 1);
  if (has('ounsafe')) clr(6, 1, 0);
  if (has('xsuicide')) clr(7, 1, 0);
  if (has('xnosuicide')) clr(7, 1, 1);
}

/** mc_load_patterns_from_db(): reads a .db file's text (lines as fgets(buf, 80) gives them) */
export function mc_load_patterns_from_db(text: string): void {
  mc_init_pattern_geometries();
  let pattern_line = 0;
  const current_pattern = [0, 0, 0, 0, 0, 0, 0, 0];
  let patterns_expanded = false;
  const matching_geometries = new Uint8Array(NUM_GEOMETRIES + 1);
  const properties = new Uint8Array(NUM_PROPERTIES);
  for (let k = 1; k <= NUM_GEOMETRIES; k++) for (let m = 0; m < NUM_PROPERTIES; m++) values[k * NUM_PROPERTIES + m] = 0xffffffff;
  const lines = text.split(/(?<=\n)/);
  for (const line of lines) {
    // fgets with an 80-byte buffer: longer lines come in pieces of 79
    for (let off = 0; off < line.length; off += 79) {
      const buf = line.slice(off, off + 79);
      const c0 = buf.charCodeAt(0);
      if ('.xXoO|+-?%'.includes(buf[0])) {
        patterns_expanded = false;
        const ch = (i: number): number => (i < buf.length ? buf.charCodeAt(i) : 0);
        if (pattern_line === 0) {
          current_pattern[5] = c0;
          current_pattern[2] = ch(1);
          current_pattern[6] = ch(2);
        } else if (pattern_line === 1) {
          current_pattern[1] = c0;
          current_pattern[3] = ch(2);
        } else if (pattern_line === 2) {
          current_pattern[4] = c0;
          current_pattern[0] = ch(1);
          current_pattern[7] = ch(2);
        }
        pattern_line++;
      } else {
        const mm = /^:(\d+)/.exec(buf);
        if (!mm) continue;
        const value = Number(mm[1]) >>> 0;
        if (!patterns_expanded) {
          matching_geometries.fill(0);
          mc_match_geometries(current_pattern, matching_geometries, 0);
          patterns_expanded = true;
        }
        mc_analyze_properties(buf, properties);
        for (let k = 1; k <= NUM_GEOMETRIES; k++)
          if (matching_geometries[k])
            for (let m = 0; m < NUM_PROPERTIES; m++)
              if (properties[m] && values[k * NUM_PROPERTIES + m] === 0xffffffff) values[k * NUM_PROPERTIES + m] = value;
        pattern_line = 0;
      }
    }
  }
  for (let k = 1; k <= NUM_GEOMETRIES; k++)
    for (let m = 0; m < NUM_PROPERTIES; m++) if (values[k * NUM_PROPERTIES + m] === 0xffffffff) values[k * NUM_PROPERTIES + m] = 1;
}

export function mc_pattern_values(): Uint32Array {
  return values;
}

function mc_init_move_values(game: McGame): void {
  const m = game.i;
  const u = game.u;
  m.fill(0, O_MVW, O_MVW + BOARDMAX);
  m.fill(0, O_MVB, O_MVB + BOARDMAX);
  m.fill(0, O_PSW, O_PSW + NUM_MOVE_PARTITIONS);
  m.fill(0, O_PSB, O_PSB + NUM_MOVE_PARTITIONS);
  m.fill(0, O_PLW, O_PLW + BOARDMAX);
  m.fill(0, O_PLB, O_PLB + BOARDMAX);
  u[O_MSW] = 0;
  u[O_MSB] = 0;
  for (let k = 0; k < NUM_MOVE_PARTITIONS; k++) {
    m[O_PLW + k] = 1;
    m[O_PLB + k] = 1;
  }
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (m[O_BOARD + pos] === EMPTY) {
      const partition = pos & (NUM_MOVE_PARTITIONS - 1);
      if (!mc_is_suicide(m, pos, WHITE)) {
        const value = values[mc_find_pattern_number(m, pos, WHITE, 0)];
        u[O_MVW + pos] = value;
        u[O_PSW + partition] += value;
        u[O_MSW] += value;
        m[O_PLW + pos] = m[O_PLW + partition];
        m[O_PLW + partition] = pos;
      }
      if (!mc_is_suicide(m, pos, BLACK)) {
        const value = values[mc_find_pattern_number(m, pos, BLACK, 0)];
        u[O_MVB + pos] = value;
        u[O_PSB + partition] += value;
        u[O_MSB] += value;
        m[O_PLB + pos] = m[O_PLB + partition];
        m[O_PLB + partition] = pos;
      }
    }
  }
}

function mc_update_move_values(game: McGame): void {
  const m = game.i;
  const u = game.u;
  for (let pos = m[O_QUEUE]; pos !== 1; pos = m[O_QUEUE + pos]) {
    const partition = pos & (NUM_MOVE_PARTITIONS - 1);
    for (const color of [WHITE, BLACK]) {
      const MV = color === WHITE ? O_MVW : O_MVB;
      const PL = color === WHITE ? O_PLW : O_PLB;
      const PS = color === WHITE ? O_PSW : O_PSB;
      const MS = color === WHITE ? O_MSW : O_MSB;
      if (m[O_BOARD + pos] !== EMPTY || mc_is_suicide(m, pos, color)) {
        if (m[PL + pos] !== 0) {
          // mc_remove_move
          let pos2;
          for (pos2 = partition; m[PL + pos2] !== 1; pos2 = m[PL + pos2]) if (m[PL + pos2] === pos) break;
          const pos3 = m[PL + pos2];
          m[PL + pos2] = m[PL + pos3];
          m[PL + pos3] = 0;
          u[PS + partition] -= u[MV + pos];
          u[MS] -= u[MV + pos];
          u[MV + pos] = 0;
        }
      } else if (m[PL + pos] === 0) {
        // mc_add_move
        const value = values[mc_find_pattern_number(m, pos, color, 0)];
        m[PL + pos] = m[PL + partition];
        m[PL + partition] = pos;
        u[MV + pos] = value;
        u[PS + partition] += value;
        u[MS] += value;
      } else {
        // mc_update_move
        const value = values[mc_find_pattern_number(m, pos, color, 0)];
        u[PS + partition] += value - u[MV + pos];
        u[MS] += value - u[MV + pos];
        u[MV + pos] = value;
      }
    }
  }
}

const near_moves = new Int32Array(BOARDMAX);
const saved_near_move_values = new Uint32Array(BOARDMAX);

function mc_generate_random_move(game: McGame): number {
  const m = game.i;
  const u = game.u;
  const last_move = m[O_LAST];
  const color = m[O_CTM];
  const depth = m[O_DEPTH];
  let saved_ko_value = 0;
  let move;
  if (depth > 600) return PASS_MOVE;
  const MV = color === WHITE ? O_MVW : O_MVB;
  const PS = color === WHITE ? O_PSW : O_PSB;
  const PL = color === WHITE ? O_PLW : O_PLB;
  const MS = color === WHITE ? O_MSW : O_MSB;

  let num_near_moves = 0;
  if (last_move !== PASS_MOVE) {
    for (let pos = m[O_QUEUE]; pos !== 1; pos = m[O_QUEUE + pos]) {
      if (m[O_BOARD + pos] === EMPTY && m[PL + pos] !== 0) {
        const old_value = u[MV + pos];
        const new_value = values[mc_find_pattern_number(m, pos, color, 1)];
        const partition = pos & (NUM_MOVE_PARTITIONS - 1);
        saved_near_move_values[num_near_moves] = old_value;
        near_moves[num_near_moves++] = pos;
        u[MV + pos] = new_value;
        u[PS + partition] += new_value - old_value;
        u[MS] += new_value - old_value;
      }
    }
  }

  const ko = m[O_KO];
  if (ko !== NO_MOVE) {
    if (m[O_BOARD + WEST(ko)] === OTHER_COLOR(color) || m[O_BOARD + EAST(ko)] === OTHER_COLOR(color)) {
      const partition = ko & (NUM_MOVE_PARTITIONS - 1);
      saved_ko_value = u[MV + ko];
      u[MV + ko] = 0;
      u[PS + partition] -= saved_ko_value;
      u[MS] -= saved_ko_value;
    }
  }

  if (u[MS] === 0) move = PASS_MOVE;
  else {
    let x = Math.trunc(gg_drand() * u[MS]) | 0;
    let k;
    for (k = 0; k < NUM_MOVE_PARTITIONS; k++) {
      x = (x - u[PS + k]) | 0;
      if (x < 0) break;
    }
    // (the C reads past the array when k reaches NUM_MOVE_PARTITIONS; that cannot happen)
    x = Math.trunc(gg_drand() * u[PS + k]) | 0;
    let pos;
    for (pos = m[PL + k]; pos !== 1; pos = m[PL + pos]) {
      x = (x - u[MV + pos]) | 0;
      if (x < 0) break;
    }
    move = pos;
  }

  if (saved_ko_value > 0) {
    const partition = ko & (NUM_MOVE_PARTITIONS - 1);
    u[PS + partition] += saved_ko_value - u[MV + ko];
    u[MS] += saved_ko_value - u[MV + ko];
    u[MV + ko] = saved_ko_value;
  }

  for (let k = 0; k < num_near_moves; k++) {
    const pos = near_moves[k];
    const partition = pos & (NUM_MOVE_PARTITIONS - 1);
    const old_value = u[MV + pos];
    const new_value = saved_near_move_values[k];
    u[MV + pos] = new_value;
    u[PS + partition] += new_value - old_value;
    u[MS] += new_value - old_value;
  }
  return move;
}

function mc_play_random_move(game: McGame, move: number): boolean {
  const m = game.i;
  const result = mc_play_move(game, move, m[O_CTM]);
  mc_update_move_values(game);
  if (result) {
    if (move === PASS_MOVE) m[O_CPASS]++;
    else m[O_CPASS] = 0;
    if (m[O_KO] !== NO_MOVE) m[O_CKO]++;
    else m[O_CKO] = 0;
    m[O_HIST + m[O_DEPTH]] = move;
    m[O_LAST] = move;
    m[O_CTM] = OTHER_COLOR(m[O_CTM]);
    m[O_DEPTH]++;
  }
  return result;
}

function mc_play_random_game(game: McGame): number {
  const m = game.i;
  let score = 0;
  while (m[O_CPASS] < 3) {
    const move = mc_generate_random_move(game);
    if (!mc_play_random_move(game, move)) throw new Error('mc_play_random_game: illegal move ' + move);
  }
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
    if (m[O_BOARD + pos] !== GRAY) {
      const settled = m[O_SETTLED + pos];
      if (settled === WHITE) score++;
      else if (settled === BLACK) score--;
      else {
        let pos2 = pos;
        if (m[O_BOARD + pos] === EMPTY)
          for (let k = 0; k < 4; k++) {
            pos2 = pos + delta[k];
            if (IS_STONE(m[O_BOARD + pos2])) break;
          }
        score += 2 * (m[O_BOARD + pos2] === WHITE ? 1 : 0) - 1;
      }
    }
  return score;
}

// ------------------------------------------------- UCT search

const BITWORDS = 1 + Math.trunc(BOARDMAX / 32);

class UctTree {
  num_nodes: number;
  wins: Int32Array;
  games: Int32Array;
  sum_scores: Float32Array;
  sum_scores2: Float32Array;
  child: Int32Array; // arc index, -1 for none
  untested: Int32Array;
  boardhash: Uint32Array;
  arc_move: Int32Array;
  arc_node: Int32Array;
  arc_next: Int32Array;
  hashtable_odd: Uint32Array;
  hashtable_even: Uint32Array;
  hashtable_size: number;
  num_used_nodes = 0;
  num_arcs: number;
  num_used_arcs = 0;
  forbidden_moves: Int32Array;
  game = new McGame();
  move_score = new Int32Array(BOARDSIZE);
  move_ordering = new Int32Array(BOARDSIZE);
  inverse_move_ordering = new Int32Array(BOARDSIZE);
  num_ordered_moves = 0;
  constructor(nodes: number, forbidden: Int32Array) {
    this.num_nodes = nodes;
    this.num_arcs = nodes;
    this.wins = new Int32Array(nodes);
    this.games = new Int32Array(nodes);
    this.sum_scores = new Float32Array(nodes);
    this.sum_scores2 = new Float32Array(nodes);
    this.child = new Int32Array(nodes);
    this.untested = new Int32Array(nodes * BITWORDS);
    this.boardhash = new Uint32Array(nodes * 2);
    this.arc_move = new Int32Array(nodes);
    this.arc_node = new Int32Array(nodes);
    this.arc_next = new Int32Array(nodes);
    this.hashtable_size = nodes;
    this.hashtable_odd = new Uint32Array(nodes);
    this.hashtable_even = new Uint32Array(nodes);
    this.forbidden_moves = forbidden;
  }
}

function uct_init_node(tree: UctTree, allowed_moves: Int32Array | null): number {
  const node = tree.num_used_nodes++;
  const m = tree.game.i;
  tree.wins[node] = 0;
  tree.games[node] = 0;
  tree.sum_scores[node] = 0;
  tree.sum_scores2[node] = 0;
  tree.child[node] = -1;
  const ub = node * BITWORDS;
  tree.untested.fill(0, ub, ub + BITWORDS);
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (m[O_BOARD + pos] === EMPTY && !tree.forbidden_moves[pos] && (!allowed_moves || allowed_moves[pos]))
      tree.untested[ub + (pos >> 5)] |= 1 << pos % 32;
  }
  tree.boardhash[2 * node] = tree.game.u[O_HASH];
  tree.boardhash[2 * node + 1] = tree.game.u[O_HASH + 1];
  return node;
}

function uct_find_node(tree: UctTree, parent: number, move: number): number {
  let node = -1;
  const h0 = tree.game.u[O_HASH];
  const h1 = tree.game.u[O_HASH + 1];
  let hash_index = h0 % tree.hashtable_size;
  const hashtable = tree.game.i[O_DEPTH] & 1 ? tree.hashtable_odd : tree.hashtable_even;
  while (hashtable[hash_index] !== 0) {
    const node_index = hashtable[hash_index];
    if (tree.boardhash[2 * node_index] === h0 && tree.boardhash[2 * node_index + 1] === h1) {
      node = node_index;
      break;
    }
    hash_index++;
    if (hash_index >= tree.hashtable_size) hash_index = 0;
  }
  if (node < 0) {
    node = uct_init_node(tree, null);
    hashtable[hash_index] = node;
  }
  if (parent >= 0) {
    const arc = tree.num_used_arcs++;
    tree.arc_move[arc] = move;
    tree.arc_node[arc] = node;
    tree.arc_next[arc] = tree.child[parent];
    tree.child[parent] = arc;
  }
  return node;
}

function uct_update_move_ordering(tree: UctTree, move: number): void {
  const score = ++tree.move_score[move];
  for (;;) {
    const n = tree.inverse_move_ordering[move];
    if (n === 0) return;
    const preceding_move = tree.move_ordering[n - 1];
    if (tree.move_score[preceding_move] >= score) return;
    tree.move_ordering[n - 1] = move;
    tree.move_ordering[n] = preceding_move;
    tree.inverse_move_ordering[move] = n - 1;
    tree.inverse_move_ordering[preceding_move] = n;
  }
}

/** potential_moves[] of the full engine: this port does not compute them, so they stay 0 */
function uct_init_move_ordering(tree: UctTree, potential_moves: Float32Array | null): void {
  let k = 0;
  tree.move_score.fill(0);
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
    if (ON_BOARD(pos)) {
      tree.move_ordering[k] = pos;
      tree.inverse_move_ordering[pos] = k;
      k++;
    }
  tree.num_ordered_moves = k;
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (ON_BOARD(pos)) {
      tree.move_score[pos] = Math.trunc(fr(10 * (potential_moves ? potential_moves[pos] : 0))) - 1;
      uct_update_move_ordering(tree, pos);
    }
  }
}

function uct_finish_and_score_game(game: McGame): number {
  return fr(g.komi + mc_play_random_game(game));
}

const play_out = { gamma: 0, move: 0 };

function uct_play_move(tree: UctTree, node: number, alpha: number): number {
  let next_arc = -1;
  let best_winrate_arc = -1;
  let best_uct_value = 0.0;
  let best_winrate = 0.0;
  const depth = tree.game.i[O_DEPTH];
  for (let child_arc = tree.child[node]; child_arc >= 0; child_arc = tree.arc_next[child_arc]) {
    const child_node = tree.arc_node[child_arc];
    const cg = tree.games[child_node];
    const winrate = fr(tree.wins[child_node] / cg);
    const log_games_ratio = fr(Math.log(tree.games[node]) / cg);
    let x = fr(winrate * (1.0 - winrate) + Math.sqrt(2.0 * log_games_ratio));
    if (x < 0.25) x = 0.25;
    const t = fr(fr(fr(2 * log_games_ratio) * x) / (1 + depth));
    const uct_value = fr(winrate + Math.sqrt(t));
    if (uct_value > best_uct_value) {
      next_arc = child_arc;
      best_uct_value = uct_value;
    }
    if (winrate > best_winrate) {
      best_winrate_arc = child_arc;
      best_winrate = winrate;
    }
  }
  play_out.gamma = best_winrate;
  if (best_winrate > alpha) next_arc = best_winrate_arc;
  else {
    for (let k = -1; k < tree.num_ordered_moves; k++) {
      let pos;
      if (k === -1 && best_uct_value > 0.0) continue;
      else if (k === -1) pos = mc_generate_random_move(tree.game);
      else pos = tree.move_ordering[k];
      const ub = node * BITWORDS;
      if (tree.untested[ub + (pos >> 5)] & (1 << pos % 32)) {
        let proper_small_eye = true;
        const m = tree.game.i;
        const ctm = m[O_CTM];
        play_out.move = pos;
        tree.untested[ub + (pos >> 5)] &= ~(1 << pos % 32);
        for (let r = 0; r < 4; r++) {
          const b = m[O_BOARD + pos + delta[r]];
          if (b === EMPTY || b === OTHER_COLOR(ctm)) {
            proper_small_eye = false;
            break;
          }
        }
        if (proper_small_eye) {
          let diagonal_value = 0;
          for (let r = 4; r < 8; r++) {
            const pos2 = pos + delta[r];
            if (m[O_BOARD + pos2] === GRAY) diagonal_value++;
            else if (m[O_BOARD + pos2] === OTHER_COLOR(ctm)) diagonal_value += 2;
          }
          if (diagonal_value > 3) proper_small_eye = false;
        }
        if (!proper_small_eye && mc_play_random_move(tree.game, pos)) return uct_find_node(tree, node, pos);
      }
    }
  }
  if (next_arc < 0) {
    mc_play_random_move(tree.game, PASS_MOVE);
    play_out.move = PASS_MOVE;
    return uct_find_node(tree, node, PASS_MOVE);
  }
  play_out.move = tree.arc_move[next_arc];
  mc_play_random_move(tree.game, tree.arc_move[next_arc]);
  return tree.arc_node[next_arc];
}

const UCT_MAX_SEARCH_DEPTH = BOARDMAX;

function uct_traverse_tree(tree: UctTree, node: number, alpha: number, beta: number): number {
  const m = tree.game.i;
  const color = m[O_CTM];
  const num_passes = m[O_CPASS];
  let result;
  let move = PASS_MOVE;
  if (num_passes === 3 || m[O_DEPTH] >= UCT_MAX_SEARCH_DEPTH || (tree.games[node] === 0 && node !== 0))
    result = uct_finish_and_score_game(tree.game);
  else {
    const next_node = uct_play_move(tree, node, alpha);
    let gamma = play_out.gamma;
    move = play_out.move;
    if (gamma > 0.8) gamma = fr(0.8);
    result = uct_traverse_tree(tree, next_node, beta, gamma);
  }
  tree.games[node]++;
  if (result > 0 !== (color === WHITE)) {
    tree.wins[node]++;
    if (move !== PASS_MOVE) uct_update_move_ordering(tree, move);
  }
  tree.sum_scores[node] = fr(tree.sum_scores[node] + result);
  tree.sum_scores2[node] = fr(tree.sum_scores2[node] + fr(result * result));
  return result;
}

export interface UctResult {
  move: number;
  move_values: Float32Array;
  move_frequencies: Int32Array;
}

/**
 * uct_genmove(): `nodes` simulations from the global board for `color`. forbidden_moves (the settled
 * points: BLACK or WHITE) and allowed_moves as in the C code; move_values and move_frequencies are
 * filled for the moves tried at the root. `progress` is called now and then with the simulations done.
 */
export function uct_genmove(
  color: number, forbidden_moves: Int32Array, allowed_moves: Int32Array | null, nodes: number,
  potential_moves: Float32Array | null = null, progress?: (done: number) => void,
): UctResult {
  const starting_position = new McGame();
  const sm = starting_position.i;
  mc_init_board_from_global_board(starting_position);
  mc_init_move_values(starting_position);
  sm[O_CTM] = color;
  sm[O_CPASS] = 0;
  sm[O_CKO] = 0;
  sm[O_LAST] = get_last_move();
  sm[O_DEPTH] = 0;
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) sm[O_SETTLED + pos] = forbidden_moves[pos] & 0xff;

  const tree = new UctTree(nodes, forbidden_moves);
  tree.game.copyFrom(starting_position);
  uct_init_node(tree, allowed_moves);
  uct_init_move_ordering(tree, potential_moves);

  let sims = 0;
  while (tree.num_used_arcs < tree.num_arcs - 10) {
    const last_used_arcs = tree.num_used_arcs;
    tree.game.copyFrom(starting_position);
    uct_traverse_tree(tree, 0, 1.0, fr(0.9));
    if (tree.num_used_arcs === last_used_arcs) break;
    if (progress && ++sims % 1000 === 0) progress(tree.num_used_arcs);
  }

  const move_values = new Float32Array(BOARDMAX);
  const move_frequencies = new Int32Array(BOARDMAX);
  let best_score = 0.0;
  let move = PASS_MOVE;
  for (let arc = tree.child[0]; arc >= 0; arc = tree.arc_next[arc]) {
    const node = tree.arc_node[arc];
    move_frequencies[tree.arc_move[arc]] = tree.games[node];
    move_values[tree.arc_move[arc]] = fr(tree.wins[node] / tree.games[node]);
    if (fr(best_score * tree.games[node]) < tree.wins[node]) {
      move = tree.arc_move[arc];
      best_score = fr(tree.wins[node] / tree.games[node]);
    }
  }
  return { move, move_values, move_frequencies };
}

/**
 * Not in the original: the share of `games` random games (the original's simulation policy, from the
 * global board, `color` to move) in which each point ends as WHITE's (+1) or BLACK's (-1): the port's
 * estimate of dead stones and territory at the end of a game (README).
 */
export function mc_ownership(color: number, forbidden_moves: Int32Array, games: number): Float32Array {
  const starting_position = new McGame();
  const sm = starting_position.i;
  mc_init_board_from_global_board(starting_position);
  mc_init_move_values(starting_position);
  sm[O_CTM] = color;
  sm[O_CPASS] = 0;
  sm[O_CKO] = 0;
  sm[O_LAST] = get_last_move();
  sm[O_DEPTH] = 0;
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) sm[O_SETTLED + pos] = forbidden_moves[pos] & 0xff;
  const own = new Float32Array(BOARDMAX);
  const game = new McGame();
  for (let n = 0; n < games; n++) {
    game.copyFrom(starting_position);
    mc_play_random_game(game);
    const m = game.i;
    for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
      if (m[O_BOARD + pos] === GRAY) continue;
      const settled = m[O_SETTLED + pos];
      let owner;
      if (settled === WHITE || settled === BLACK) owner = settled;
      else {
        let pos2 = pos;
        if (m[O_BOARD + pos] === EMPTY)
          for (let k = 0; k < 4; k++) {
            pos2 = pos + delta[k];
            if (IS_STONE(m[O_BOARD + pos2])) break;
          }
        owner = m[O_BOARD + pos2] === WHITE ? WHITE : BLACK;
      }
      own[pos] += owner === WHITE ? 1 / games : -1 / games;
    }
  }
  return own;
}
