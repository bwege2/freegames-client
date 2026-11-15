// engine/unconditional.c of GNU Go 3.8: strings that cannot be captured even if the opponent may play
// any number of moves in a row, the territory they make, and the moves that are meaningless because
// of it.
import {
  BOARDMAX, BOARDMIN, EMPTY, MAXLIBS, NO_MOVE, OTHER_COLOR, I, J, ON_BOARD, delta, board,
  approxlib, countlib, countstones, find_origin, findlib, findstones, popgo, same_string, trymove, tryko,
} from './board.ts';

export const meaningless_black_moves = new Int32Array(BOARDMAX).fill(-1);
export const meaningless_white_moves = new Int32Array(BOARDMAX).fill(-1);

function capture_non_invincible_strings(
  color: number, exceptions: Int32Array | null, out: { none_invincible: boolean } | null,
): number {
  const other = OTHER_COLOR(color);
  let something_captured = true;
  let string_found = false;
  let moves_played = 0;
  const libs: number[] = [];
  while (something_captured) {
    something_captured = false;
    string_found = false;
    for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
      if (board[pos] !== color || find_origin(pos) !== pos) continue;
      if (exceptions && exceptions[pos]) continue;
      string_found = true;
      const liberties = findlib(pos, MAXLIBS, libs);
      const save_moves = moves_played;
      for (let k = 0; k < liberties; k++) if (trymove(libs[k], other)) moves_played++;
      if (board[pos] === EMPTY) something_captured = true;
      else if (findlib(pos, 2, libs) === 1) {
        tryko(libs[0], other);
        moves_played++;
        something_captured = true;
      } else
        while (moves_played > save_moves) {
          popgo();
          moves_played--;
        }
    }
  }
  if (out) out.none_invincible = !string_found;
  return moves_played;
}

export function unconditional_life(unconditional_territory: Int32Array, color: number): void {
  const other = OTHER_COLOR(color);
  const libs: number[] = [];
  let moves_played;
  const potential_sekis = new Int32Array(BOARDMAX);
  unconditional_territory.fill(0, 0, BOARDMAX);

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    let isolated = true;
    const stones = [0, 0];
    if (board[pos] !== color || find_origin(pos) !== pos || countstones(pos) !== 2) continue;
    findstones(pos, 2, stones);
    for (let k = 0; k < 2 && isolated; k++) {
      for (let r = 0; r < 8 && isolated; r++) {
        const pos2 = stones[k] + delta[r];
        if (!ON_BOARD(pos2) || (board[pos2] === color && !same_string(pos, pos2))) isolated = false;
      }
    }
    if (isolated) {
      potential_sekis[stones[0]] = 1;
      potential_sekis[stones[1]] = 1;
    }
  }

  const ni = { none_invincible: false };
  moves_played = capture_non_invincible_strings(color, potential_sekis, ni);
  if (ni.none_invincible) {
    while (moves_played > 0) {
      popgo();
      moves_played--;
    }
    return;
  }

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (board[pos] !== color || potential_sekis[pos] || find_origin(pos) !== pos) continue;
    const liberties = findlib(pos, MAXLIBS, libs);
    for (let k = 0; k < liberties; k++) if (trymove(libs[k], other)) moves_played++;
  }

  let found_one = true;
  while (found_one) {
    found_one = false;
    for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
      if (board[pos] !== other || countlib(pos) > 1) continue;
      findlib(pos, 1, libs);
      if (trymove(libs[0], other)) {
        moves_played++;
        found_one = true;
      }
    }
  }

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!potential_sekis[pos] || board[pos] === EMPTY || find_origin(pos) !== pos) continue;
    for (let r = 0; r < 4; r++) {
      const up = delta[r];
      let right = delta[(r + 1) % 4];
      let locally_played_moves = 0;
      if (board[pos + up] !== color || board[pos + up + up] !== EMPTY || board[pos - up] !== EMPTY) continue;
      for (let k = 0; k < 2; k++) {
        if (k === 1) right = -right;
        if (board[pos + right] !== EMPTY || board[pos + up - right] !== EMPTY) continue;
        if (board[pos - right] === EMPTY && trymove(pos - right, other)) locally_played_moves++;
        if (board[pos + up + right] === EMPTY && trymove(pos + up + right, other)) locally_played_moves++;
        if (board[pos - right] === other && board[pos + up + right] === other && same_string(pos - right, pos + up + right)) {
          while (locally_played_moves > 0) {
            popgo();
            locally_played_moves--;
          }
          trymove(pos - up, color);
          moves_played++;
          break;
        } else {
          while (locally_played_moves > 0) {
            popgo();
            locally_played_moves--;
          }
        }
      }
      if (countstones(pos) > 2) break;
    }
  }

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!potential_sekis[pos] || board[pos] === EMPTY) continue;
    const liberties = findlib(pos, MAXLIBS, libs);
    for (let k = 0; k < liberties; k++) if (trymove(libs[k], other)) moves_played++;
  }

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (board[pos] !== other || countlib(pos) !== 2) continue;
    findlib(pos, 2, libs);
    const apos = libs[0];
    const bpos = libs[1];
    if (Math.abs(I(apos) - I(bpos)) + Math.abs(J(apos) - J(bpos)) !== 1) continue;
    const aopen = approxlib(apos, color, 4, null);
    const bopen = approxlib(bpos, color, 4, null);
    const alib = approxlib(apos, other, 4, null);
    const blib = approxlib(bpos, other, 4, null);
    if (aopen > bopen || (aopen === bopen && alib >= blib)) {
      trymove(apos, other);
      moves_played++;
    } else {
      trymove(bpos, other);
      moves_played++;
    }
  }

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (board[pos] === color && !potential_sekis[pos]) {
      unconditional_territory[pos] = 1;
      if (find_origin(pos) === pos) {
        const liberties = findlib(pos, MAXLIBS, libs);
        for (let k = 0; k < liberties; k++) unconditional_territory[libs[k]] = 2;
      }
    } else if (board[pos] === other && countlib(pos) === 1) {
      unconditional_territory[pos] = 2;
      findlib(pos, 1, libs);
      unconditional_territory[libs[0]] = 2;
    }
  }

  while (moves_played > 0) {
    popgo();
    moves_played--;
  }
}

export function find_unconditionally_meaningless_moves(unconditional_territory: Int32Array, color: number): void {
  const other = OTHER_COLOR(color);
  const friendly_unconditional = new Int32Array(BOARDMAX);
  const opponent_unconditional = new Int32Array(BOARDMAX);
  const meaningless_moves = color === 2 ? meaningless_black_moves : meaningless_white_moves;

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
    if (board[pos] === EMPTY) meaningless_moves[pos] = unconditional_territory[pos] ? NO_MOVE : -1;

  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (board[pos] !== EMPTY || meaningless_moves[pos] !== -1) continue;
    if (!tryko(pos, color)) continue;
    unconditional_life(opponent_unconditional, other);
    if (opponent_unconditional[pos]) meaningless_moves[pos] = NO_MOVE;
    else {
      unconditional_life(friendly_unconditional, color);
      if (friendly_unconditional[pos])
        for (let pos2 = BOARDMIN; pos2 < BOARDMAX; pos2++)
          if (board[pos2] === EMPTY && meaningless_moves[pos2] === -1 && friendly_unconditional[pos2])
            meaningless_moves[pos2] = pos;
    }
    popgo();
  }
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
    if (board[pos] === EMPTY && meaningless_moves[pos] > 0)
      while (meaningless_moves[meaningless_moves[pos]] > 0) meaningless_moves[pos] = meaningless_moves[meaningless_moves[pos]];
}

/** returns the replacement move, or -1 when the move is not meaningless (the C return value 0) */
export function unconditionally_meaningless_move(pos: number, color: number): number {
  if (color === 1 && meaningless_white_moves[pos] !== -1) return meaningless_white_moves[pos];
  if (color === 2 && meaningless_black_moves[pos] !== -1) return meaningless_black_moves[pos];
  return -1;
}

export function clear_unconditionally_meaningless_moves(): void {
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
    if (ON_BOARD(pos)) {
      meaningless_black_moves[pos] = -1;
      meaningless_white_moves[pos] = -1;
    }
}
