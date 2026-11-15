// The computer player: engine/genmove.c's monte_carlo_genmove() of GNU Go 3.8 with what it needs from
// the rest of do_genmove() (reset_engine's random seed, the unconditionally meaningless moves of
// worm.c at level 10 and above, the moves allowed by is_allowed_move), and the port's replacement
// for the parts of the full engine that are not ported: when to pass, and the score estimate with
// the dead stones (README, "The engine").
import {
  BLACK, BOARDMAX, BOARDMIN, EMPTY, IS_STONE, OTHER_COLOR, ON_BOARD, PASS_MOVE, WHITE, black_captured, board,
  board_hash, board_ko_pos, delta, g, get_last_move, hashdata_recalc, is_allowed_move, white_captured,
} from './board.ts';
import {
  clear_unconditionally_meaningless_moves, find_unconditionally_meaningless_moves, unconditional_life,
  unconditionally_meaningless_move,
} from './unconditional.ts';
import { mc_ownership, uct_genmove } from './montecarlo.ts';
import { reuse_random_seed } from './random.ts';

export const engine = {
  /** clock.c: level, level_offset */
  level: 10,
  /** globals.c: mc_games_per_level */
  mc_games_per_level: 8000,
  chinese_rules: false,
};

export function get_level(): number {
  return engine.level;
}
export function set_level(n: number): void {
  engine.level = n;
}

function forbidden_moves(): Int32Array {
  const ub = new Int32Array(BOARDMAX);
  const uw = new Int32Array(BOARDMAX);
  const forbidden = new Int32Array(BOARDMAX);
  unconditional_life(ub, BLACK);
  unconditional_life(uw, WHITE);
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
    if (!ON_BOARD(pos)) continue;
    else if (ub[pos]) forbidden[pos] = BLACK;
    else if (uw[pos]) forbidden[pos] = WHITE;
    else forbidden[pos] = 0;
  return forbidden;
}

/**
 * The number of simulations: monte_carlo_genmove()'s mc_games_per_level * max(level, 1). The original
 * runs the Monte Carlo module on boards up to 9x9 only; on a larger board, where it plays with its full
 * engine (not ported), the port scales this by 81 / (size * size), so that a move takes about as long.
 */
export function number_of_simulations(): number {
  const n = engine.mc_games_per_level * Math.max(get_level(), 1);
  const bs = g.board_size;
  return bs <= 9 ? n : Math.max(100, Math.round((n * 81) / (bs * bs)));
}

export interface GenmoveResult {
  move: number;
  value: number;
  resign: boolean;
}

export function genmove(color: number, progress?: (done: number, total: number) => void): GenmoveResult {
  // reset_engine()
  reuse_random_seed();
  hashdata_recalc(board_hash, board, board_ko_pos());
  clear_unconditionally_meaningless_moves();
  if (get_level() >= 10) {
    const t = new Int32Array(BOARDMAX);
    for (let c = WHITE; c <= BLACK; c++) {
      unconditional_life(t, c);
      find_unconditionally_meaningless_moves(t, c);
    }
  }

  // monte_carlo_genmove(), with the moves is_allowed_move() permits
  const allowed = new Int32Array(BOARDMAX);
  let num_allowed = 0;
  let only = PASS_MOVE;
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
    if (ON_BOARD(pos) && board[pos] === EMPTY && is_allowed_move(pos, color)) {
      allowed[pos] = 1;
      num_allowed++;
      only = pos;
    }
  if (num_allowed === 0) return { move: PASS_MOVE, value: 0, resign: false };
  const forbidden = forbidden_moves();
  let move = only;
  if (num_allowed > 1) {
    const total = number_of_simulations();
    const r = uct_genmove(color, forbidden, allowed, total, null, progress ? (d) => progress(d, total) : undefined);
    move = r.move;
  }
  const replacement = unconditionally_meaningless_move(move, color);
  if (replacement !== -1) move = replacement;
  if (move !== PASS_MOVE && !is_allowed_move(move, color)) move = PASS_MOVE;

  // not in the original: pass when nothing is left to play (README)
  if (move !== PASS_MOVE) {
    const games = Math.min(OWNERSHIP_GAMES, Math.max(100, Math.trunc(number_of_simulations() / 8)));
    const est = estimate(color, forbidden, games);
    const opponent_passed = g.move_history_pointer > 0 && get_last_move() === PASS_MOVE;
    const sign = color === WHITE ? 1 : -1;
    if (est.settled && opponent_passed && sign * est.score > 0) move = PASS_MOVE;
    else if (est.settled && sign * est.ownership[move] >= SURE) move = PASS_MOVE;
  }
  return { move, value: 1.0, resign: false };
}

const SURE = 0.9;
const OWNERSHIP_GAMES = 400;

export interface Estimate {
  /** white_score + black_score) / 2 of the original: positive when White is ahead */
  score: number;
  /** per point: +1 White's, -1 Black's */
  ownership: Float32Array;
  /** stones the estimate takes for dead */
  dead: Uint8Array;
  /** every point is decided */
  settled: boolean;
}

/** the port's score estimate (the original's comes from its influence function, not ported) */
export function estimate(color: number, forbidden = forbidden_moves(), games = OWNERSHIP_GAMES): Estimate {
  const ownership = mc_ownership(color, forbidden, games);
  const dead = new Uint8Array(BOARDMAX);
  let settled = true;
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!ON_BOARD(pos)) continue;
    const o = ownership[pos];
    if (board[pos] === WHITE && o < 0) dead[pos] = 1;
    else if (board[pos] === BLACK && o > 0) dead[pos] = 1;
    if (Math.abs(o) < SURE) settled = false;
  }
  return { score: score_with_dead(dead), ownership, dead, settled };
}

/**
 * The score with the given stones removed as dead: Japanese counting (territory and prisoners) or,
 * with --chinese-rules, area counting; komi added. Positive: White ahead.
 */
export function score_with_dead(dead: Uint8Array): number {
  const owner = new Int8Array(BOARDMAX);
  const seen = new Uint8Array(BOARDMAX);
  let white = 0;
  let black = 0;
  const isEmpty = (p: number): boolean => board[p] === EMPTY || (IS_STONE(board[p]) && dead[p] === 1);
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!ON_BOARD(pos) || seen[pos] || !isEmpty(pos)) continue;
    const region: number[] = [];
    const stack = [pos];
    seen[pos] = 1;
    let borders = 0;
    while (stack.length) {
      const p = stack.pop()!;
      region.push(p);
      for (let k = 0; k < 4; k++) {
        const q = p + delta[k];
        if (!ON_BOARD(q)) continue;
        if (isEmpty(q)) {
          if (!seen[q]) {
            seen[q] = 1;
            stack.push(q);
          }
        } else borders |= board[q];
      }
    }
    if (borders === WHITE || borders === BLACK) for (const p of region) owner[p] = borders;
  }
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!ON_BOARD(pos)) continue;
    if (engine.chinese_rules) {
      if (IS_STONE(board[pos]) && !dead[pos]) board[pos] === WHITE ? white++ : black++;
      else if (owner[pos] === WHITE) white++;
      else if (owner[pos] === BLACK) black++;
    } else {
      if (board[pos] === EMPTY || dead[pos]) {
        if (owner[pos] === WHITE) white++;
        else if (owner[pos] === BLACK) black++;
      }
      // a dead stone is a prisoner of the other side
      if (dead[pos] && board[pos] === BLACK) white++;
      if (dead[pos] && board[pos] === WHITE) black++;
    }
  }
  if (!engine.chinese_rules) {
    white += black_captured();
    black += white_captured();
  }
  return white - black + g.komi;
}

/**
 * The stones that toggle together at the end of the game (the original toggles a dragon): stones of
 * the same colour that touch, also diagonally, or stand one empty point apart in a line.
 */
export function dead_group(pos: number): number[] {
  const color = board[pos];
  const group: number[] = [];
  const seen = new Uint8Array(BOARDMAX);
  const stack = [pos];
  seen[pos] = 1;
  while (stack.length) {
    const p = stack.pop()!;
    group.push(p);
    const next: number[] = [];
    for (let k = 0; k < 8; k++) next.push(p + delta[k]);
    for (let k = 0; k < 4; k++) if (board[p + delta[k]] === EMPTY) next.push(p + 2 * delta[k]);
    for (const q of next) {
      if (q < 0 || q >= board.length || seen[q] || board[q] !== color) continue;
      seen[q] = 1;
      stack.push(q);
    }
  }
  return group;
}

export { OTHER_COLOR };
