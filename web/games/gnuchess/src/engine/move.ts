// Port of src/engine/move.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { board_t, Empty } from './board.ts';
import { BlackFlag, WhiteFlag } from './colour.ts';
import { Bishop64, Knight64, PAWN_OPP, PIECE_IS_KING, PIECE_IS_PAWN, piece_to_char, Queen64, Rook64 } from './piece.ts';
import { Rank8, SquareFrom64, SquareNone, SquareTo64, SQUARE_RANK, square_from_string, square_to_string } from './square.ts';

// constants
export const MoveNone = 0; // HACK: a1a1 cannot be a legal move
export const MoveNull = 11; // HACK: a1d2 cannot be a legal move

export const MoveNormal = 0 << 14;
export const MoveCastle = 1 << 14;
export const MovePromote = 2 << 14;
export const MoveEnPassant = 3 << 14;
export const MoveFlags = 3 << 14;

export const MovePromoteKnight = MovePromote | (0 << 12);
export const MovePromoteBishop = MovePromote | (1 << 12);
export const MovePromoteRook = MovePromote | (2 << 12);
export const MovePromoteQueen = MovePromote | (3 << 12);

export const MoveAllFlags = 0xf << 12;

export const NullMoveString = 'null'; // "0000" in UCI

// macros
export const MOVE_MAKE = (from: number, to: number): number => (SquareTo64[from] << 6) | SquareTo64[to];
export const MOVE_MAKE_FLAGS = (from: number, to: number, flags: number): number =>
  (SquareTo64[from] << 6) | SquareTo64[to] | flags;
export const MOVE_FROM = (move: number): number => SquareFrom64[(move >> 6) & 0o77];
export const MOVE_TO = (move: number): number => SquareFrom64[move & 0o77];
export const MOVE_IS_SPECIAL = (move: number): boolean => (move & MoveFlags) !== MoveNormal;
export const MOVE_IS_PROMOTE = (move: number): boolean => (move & MoveFlags) === MovePromote;
export const MOVE_IS_EN_PASSANT = (move: number): boolean => (move & MoveFlags) === MoveEnPassant;
export const MOVE_IS_CASTLE = (move: number): boolean => (move & MoveFlags) === MoveCastle;
export const MOVE_PIECE = (move: number, board: board_t): number => board.square[MOVE_FROM(move)];

// constants
const PromotePiece = Int32Array.from([Knight64, Bishop64, Rook64, Queen64]);

// functions

// move_is_ok()
export function move_is_ok(move: number): boolean {
  if (move < 0 || move >= 65536) return false;
  if (move === MoveNone) return false;
  if (move === MoveNull) return false;
  return true;
}

// move_promote()
export function move_promote(move: number): number {
  const code = (move >> 12) & 3;
  let piece = PromotePiece[code];
  if (SQUARE_RANK(MOVE_TO(move)) === Rank8) {
    piece |= WhiteFlag;
  } else {
    piece |= BlackFlag;
  }
  return piece;
}

// move_order()
export function move_order(move: number): number {
  return ((move & 0o7777) << 2) | ((move >> 12) & 3);
}

// move_is_capture()
export function move_is_capture(move: number, board: board_t): boolean {
  return MOVE_IS_EN_PASSANT(move) || board.square[MOVE_TO(move)] !== Empty;
}

// move_is_under_promote()
export function move_is_under_promote(move: number): boolean {
  return MOVE_IS_PROMOTE(move) && (move & MoveAllFlags) !== MovePromoteQueen;
}

// move_is_tactical()
export function move_is_tactical(move: number, board: board_t): boolean {
  return (move & (1 << 15)) !== 0 || board.square[MOVE_TO(move)] !== Empty; // HACK
}

// move_capture()
export function move_capture(move: number, board: board_t): number {
  if (MOVE_IS_EN_PASSANT(move)) {
    return PAWN_OPP(board.square[MOVE_FROM(move)]);
  }
  return board.square[MOVE_TO(move)];
}

// move_to_string()
export function move_to_string(move: number): string {
  // null move
  if (move === MoveNull) {
    return NullMoveString;
  }
  // normal moves
  let string = square_to_string(MOVE_FROM(move)) + square_to_string(MOVE_TO(move));
  // promotes
  if (MOVE_IS_PROMOTE(move)) {
    string += piece_to_char(move_promote(move)).toLowerCase();
  }
  return string;
}

// move_from_string(): the string as C sees it ('\0' past its end)
export function move_from_string(string: string, board: board_t): number {
  const at = (i: number): string => (i < string.length ? string[i] : '\0');
  // from
  const from = square_from_string(at(0) + at(1));
  if (from === SquareNone) return MoveNone;
  // to
  const to = square_from_string(at(2) + at(3));
  if (to === SquareNone) return MoveNone;
  let move = MOVE_MAKE(from, to);
  // promote
  switch (at(4)) {
    case '\0': // not a promotion
      break;
    case 'n':
      move |= MovePromoteKnight;
      break;
    case 'b':
      move |= MovePromoteBishop;
      break;
    case 'r':
      move |= MovePromoteRook;
      break;
    case 'q':
      move |= MovePromoteQueen;
      break;
    default:
      return MoveNone;
  }
  // flags
  const piece = board.square[from];
  if (PIECE_IS_PAWN(piece)) {
    if (to === board.ep_square) move |= MoveEnPassant;
  } else if (PIECE_IS_KING(piece)) {
    const delta = to - from;
    if (delta === +2 || delta === -2) move |= MoveCastle;
  }
  return move;
}
