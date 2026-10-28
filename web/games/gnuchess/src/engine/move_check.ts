// Port of src/engine/move_check.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { DeltaIncLine, DeltaMask, IS_IN_CHECK, is_attacked, is_pinned, PIECE_ATTACK } from './attack.ts';
import {
  board_t, Empty, FlagsBlackKingCastle, FlagsBlackQueenCastle, FlagsWhiteKingCastle, FlagsWhiteQueenCastle,
  KING_POS,
} from './board.ts';
import { Black, COLOUR_IS, COLOUR_IS_WHITE, COLOUR_OPP, White } from './colour.ts';
import type { list_t } from './list.ts';
import { MoveCastle, MoveFlags, MoveNormal, MOVE_FROM, MOVE_TO } from './move.ts';
import { move_do, move_undo, undo_t } from './move_do.ts';
import { PAWN_MAKE, PAWN_MOVE_INC, PieceInc, PIECE_IS_PAWN, PIECE_IS_SLIDER } from './piece.ts';
import { B1, B8, C1, C8, D1, D8, E1, E8, F1, F8, G1, G8, PAWN_RANK, Rank2, Rank7, SquareNone, SquareTo64 } from './square.ts';
import { DeltaOffset, IncNone } from './vector.ts';

// gen_quiet_checks()
export function gen_quiet_checks(list: list_t, board: board_t): void {
  list.size = 0;
  add_quiet_checks(list, board);
  add_castle_checks(list, board);
}

const pin = new Int32Array(8 + 1);

// add_quiet_checks()
function add_quiet_checks(list: list_t, board: board_t): void {
  const square = board.square;
  const moves = list.move;
  let from: number, to: number, sq: number, inc: number;
  // init
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const king = KING_POS(board, opp);
  find_pins(pin, board);
  // indirect checks
  for (let p = 0; (from = pin[p]) !== SquareNone; p++) {
    const piece = square[from];
    if (PIECE_IS_PAWN(piece)) {
      inc = PAWN_MOVE_INC(me);
      const rank = PAWN_RANK(from, me);
      if (rank !== Rank7) { // promotes are generated with captures
        to = from + inc;
        if (square[to] === Empty) {
          if (DeltaIncLine[DeltaOffset + to - king] !== DeltaIncLine[DeltaOffset + from - king]) {
            moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
            if (rank === Rank2) {
              to = from + (2 * inc);
              if (square[to] === Empty) {
                moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
              }
            }
          }
        }
      }
    } else if (PIECE_IS_SLIDER(piece)) {
      const incs = PieceInc[piece];
      for (let i = 0; (inc = incs[i]) !== IncNone; i++) {
        for (to = from + inc; square[to] === Empty; to += inc) {
          moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
        }
      }
    } else {
      const incs = PieceInc[piece];
      for (let i = 0; (inc = incs[i]) !== IncNone; i++) {
        to = from + inc;
        if (square[to] === Empty) {
          if (DeltaIncLine[DeltaOffset + to - king] !== DeltaIncLine[DeltaOffset + from - king]) {
            moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
          }
        }
      }
    }
  }
  // piece direct checks
  next_piece:
  for (let p = me * 32 + 1; (from = board.piece[p]) !== SquareNone; p++) { // HACK: no king
    for (let p2 = 0; (sq = pin[p2]) !== SquareNone; p2++) {
      if (sq === from) continue next_piece;
    }
    const piece = square[from];
    const incs = PieceInc[piece];
    if (PIECE_IS_SLIDER(piece)) {
      for (let i = 0; (inc = incs[i]) !== IncNone; i++) {
        for (to = from + inc; square[to] === Empty; to += inc) {
          if (PIECE_ATTACK(board, piece, to, king)) {
            moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
          }
        }
      }
    } else {
      for (let i = 0; (inc = incs[i]) !== IncNone; i++) {
        to = from + inc;
        if (square[to] === Empty) {
          if ((piece & DeltaMask[DeltaOffset + king - to]) !== 0) {
            moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
          }
        }
      }
    }
  }
  // pawn direct checks
  inc = PAWN_MOVE_INC(me);
  const pawn = PAWN_MAKE(me);
  to = king - (inc - 1);
  from = to - inc;
  if (square[from] === pawn) {
    if (square[to] === Empty) {
      moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
    }
  } else {
    from = to - (2 * inc);
    if (square[from] === pawn) {
      if (PAWN_RANK(from, me) === Rank2
        && square[to] === Empty
        && square[from + inc] === Empty) {
        moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
      }
    }
  }
  to = king - (inc + 1);
  from = to - inc;
  if (square[from] === pawn) {
    if (square[to] === Empty) {
      moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
    }
  } else {
    from = to - (2 * inc);
    if (square[from] === pawn) {
      if (PAWN_RANK(from, me) === Rank2
        && square[to] === Empty
        && square[from + inc] === Empty) {
        moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
      }
    }
  }
}

// add_castle_checks()
function add_castle_checks(list: list_t, board: board_t): void {
  const square = board.square;
  if (COLOUR_IS_WHITE(board.turn)) {
    if ((board.flags & FlagsWhiteKingCastle) !== 0
      && square[F1] === Empty
      && square[G1] === Empty
      && !is_attacked(board, F1, Black)) {
      add_check(list, (SquareTo64[E1] << 6) | SquareTo64[G1] | MoveCastle, board);
    }
    if ((board.flags & FlagsWhiteQueenCastle) !== 0
      && square[D1] === Empty
      && square[C1] === Empty
      && square[B1] === Empty
      && !is_attacked(board, D1, Black)) {
      add_check(list, (SquareTo64[E1] << 6) | SquareTo64[C1] | MoveCastle, board);
    }
  } else { // black
    if ((board.flags & FlagsBlackKingCastle) !== 0
      && square[F8] === Empty
      && square[G8] === Empty
      && !is_attacked(board, F8, White)) {
      add_check(list, (SquareTo64[E8] << 6) | SquareTo64[G8] | MoveCastle, board);
    }
    if ((board.flags & FlagsBlackQueenCastle) !== 0
      && square[D8] === Empty
      && square[C8] === Empty
      && square[B8] === Empty
      && !is_attacked(board, D8, White)) {
      add_check(list, (SquareTo64[E8] << 6) | SquareTo64[C8] | MoveCastle, board);
    }
  }
}

// a scratch undo_t, made on first use
let check_undo: undo_t | undefined;

// add_check()
function add_check(list: list_t, move: number, board: board_t): void {
  const undo = (check_undo ??= new undo_t());
  move_do(board, move, undo);
  if (IS_IN_CHECK(board, board.turn)) list.move[list.size++] = move;
  move_undo(board, move, undo);
}

// move_is_check()
export function move_is_check(move: number, board: board_t): boolean {
  // slow test for complex moves
  if ((move & MoveFlags) !== MoveNormal) {
    const undo = (check_undo ??= new undo_t());
    move_do(board, move, undo);
    const check = IS_IN_CHECK(board, board.turn);
    move_undo(board, move, undo);
    return check;
  }
  // init
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const king = KING_POS(board, opp);
  const from = MOVE_FROM(move);
  const to = MOVE_TO(move);
  const piece = board.square[from];
  // direct check
  if (PIECE_ATTACK(board, piece, to, king)) return true;
  // indirect check
  if (is_pinned(board, from, opp)
    && DeltaIncLine[DeltaOffset + king - to] !== DeltaIncLine[DeltaOffset + king - from]) {
    return true;
  }
  return false;
}

// find_pins()
function find_pins(list: Int32Array, board: board_t): void {
  const square = board.square;
  let n = 0;
  let from: number;
  // init
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const king = KING_POS(board, opp);
  for (let p = me * 32 + 1; (from = board.piece[p]) !== SquareNone; p++) { // HACK: no king
    const piece = square[from];
    const delta = king - from;
    if ((piece & DeltaMask[DeltaOffset + delta]) !== 0) {
      const inc = DeltaIncLine[DeltaOffset + delta];
      let sq = from;
      let capture: number;
      do sq += inc; while ((capture = square[sq]) === Empty);
      if (COLOUR_IS(capture, me)) {
        const pin_sq = sq;
        do sq += inc; while (square[sq] === Empty);
        if (sq === king) list[n++] = pin_sq;
      }
    }
  }
  list[n] = SquareNone;
}
