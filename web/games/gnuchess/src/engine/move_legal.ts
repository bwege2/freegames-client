// Port of src/engine/move_legal.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { DeltaIncLine, IS_IN_CHECK, is_attacked, is_pinned, PIECE_ATTACK } from './attack.ts';
import { board_t, Empty, KING_POS } from './board.ts';
import { COLOUR_IS, COLOUR_OPP } from './colour.ts';
import { list_contain, list_t } from './list.ts';
import { MoveCastle, MoveEnPassant, MoveFlags, MoveNormal, MOVE_FROM, MOVE_TO } from './move.ts';
import { move_do, move_undo, undo_t } from './move_do.ts';
import { gen_moves } from './move_gen.ts';
import { PAWN_MOVE_INC, PIECE_IS_KING, PIECE_IS_PAWN } from './piece.ts';
import { PAWN_RANK, Rank2, SquareIsPromote } from './square.ts';
import { DeltaOffset } from './vector.ts';

// move_is_pseudo()
export function move_is_pseudo(move: number, board: board_t): boolean {
  // special cases
  if ((move & MoveFlags) !== MoveNormal) {
    return move_is_pseudo_debug(move, board);
  }
  // init
  const me = board.turn;
  // from
  const from = MOVE_FROM(move);
  const piece = board.square[from];
  if (!COLOUR_IS(piece, me)) return false;
  // to
  const to = MOVE_TO(move);
  const capture = board.square[to];
  if (COLOUR_IS(capture, me)) return false;
  // move
  if (PIECE_IS_PAWN(piece)) {
    if (SquareIsPromote[to] !== 0) return false;
    const inc = PAWN_MOVE_INC(me);
    const delta = to - from;
    if (capture === Empty) {
      // pawn push
      if (delta === inc) return true;
      if (delta === (2 * inc)
        && PAWN_RANK(from, me) === Rank2
        && board.square[from + inc] === Empty) {
        return true;
      }
    } else {
      // pawn capture
      if (delta === (inc - 1) || delta === (inc + 1)) return true;
    }
  } else {
    if (PIECE_ATTACK(board, piece, from, to)) return true;
  }
  return false;
}

// quiet_is_pseudo()
export function quiet_is_pseudo(move: number, board: board_t): boolean {
  // special cases
  if ((move & MoveFlags) === MoveCastle) {
    return move_is_pseudo_debug(move, board);
  } else if ((move & MoveFlags) !== MoveNormal) {
    return false;
  }
  // init
  const me = board.turn;
  // from
  const from = MOVE_FROM(move);
  const piece = board.square[from];
  if (!COLOUR_IS(piece, me)) return false;
  // to
  const to = MOVE_TO(move);
  if (board.square[to] !== Empty) return false; // capture
  // move
  if (PIECE_IS_PAWN(piece)) {
    if (SquareIsPromote[to] !== 0) return false;
    const inc = PAWN_MOVE_INC(me);
    const delta = to - from;
    // pawn push
    if (delta === inc) return true;
    if (delta === (2 * inc)
      && PAWN_RANK(from, me) === Rank2
      && board.square[from + inc] === Empty) {
      return true;
    }
  } else {
    if (PIECE_ATTACK(board, piece, from, to)) return true;
  }
  return false;
}

// scratch objects, made on first use
let legal_undo: undo_t | undefined;

// pseudo_is_legal()
export function pseudo_is_legal(move: number, board: board_t): boolean {
  // init
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const from = MOVE_FROM(move);
  const to = MOVE_TO(move);
  const piece = board.square[from];
  // slow test for en-passant captures
  if ((move & MoveFlags) === MoveEnPassant) {
    const undo = (legal_undo ??= new undo_t());
    move_do(board, move, undo);
    const legal = !IS_IN_CHECK(board, me);
    move_undo(board, move, undo);
    return legal;
  }
  // king moves (including castle)
  if (PIECE_IS_KING(piece)) {
    return !is_attacked(board, to, opp);
  }
  // pins
  if (is_pinned(board, from, me)) {
    const king = KING_POS(board, me);
    return DeltaIncLine[DeltaOffset + king - to] === DeltaIncLine[DeltaOffset + king - from]; // does not discover the line
  }
  return true;
}

let debug_list: list_t | undefined;

// move_is_pseudo_debug()
function move_is_pseudo_debug(move: number, board: board_t): boolean {
  const list = (debug_list ??= new list_t());
  gen_moves(list, board);
  return list_contain(list, move);
}
