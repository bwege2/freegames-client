// Port of src/engine/piece.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { BlackFlag, WhiteFlag } from './colour.ts';

// constants
export const WhitePawnFlag = 1 << 2;
export const BlackPawnFlag = 1 << 3;
export const KnightFlag = 1 << 4;
export const BishopFlag = 1 << 5;
export const RookFlag = 1 << 6;
export const KingFlag = 1 << 7;

export const PawnFlags = WhitePawnFlag | BlackPawnFlag;
export const QueenFlags = BishopFlag | RookFlag;

export const PieceNone64 = 0;
export const WhitePawn64 = WhitePawnFlag;
export const BlackPawn64 = BlackPawnFlag;
export const Knight64 = KnightFlag;
export const Bishop64 = BishopFlag;
export const Rook64 = RookFlag;
export const Queen64 = QueenFlags;
export const King64 = KingFlag;

export const PieceNone256 = 0;
export const WhitePawn256 = WhitePawn64 | WhiteFlag;
export const BlackPawn256 = BlackPawn64 | BlackFlag;
export const WhiteKnight256 = Knight64 | WhiteFlag;
export const BlackKnight256 = Knight64 | BlackFlag;
export const WhiteBishop256 = Bishop64 | WhiteFlag;
export const BlackBishop256 = Bishop64 | BlackFlag;
export const WhiteRook256 = Rook64 | WhiteFlag;
export const BlackRook256 = Rook64 | BlackFlag;
export const WhiteQueen256 = Queen64 | WhiteFlag;
export const BlackQueen256 = Queen64 | BlackFlag;
export const WhiteKing256 = King64 | WhiteFlag;
export const BlackKing256 = King64 | BlackFlag;
export const PieceNb = 256;

export const WhitePawn12 = 0;
export const BlackPawn12 = 1;
export const WhiteKnight12 = 2;
export const BlackKnight12 = 3;
export const WhiteBishop12 = 4;
export const BlackBishop12 = 5;
export const WhiteRook12 = 6;
export const BlackRook12 = 7;
export const WhiteQueen12 = 8;
export const BlackQueen12 = 9;
export const WhiteKing12 = 10;
export const BlackKing12 = 11;

// "constants"
export const PawnMake = Int32Array.from([WhitePawn256, BlackPawn256]);

export const PieceFrom12 = Int32Array.from([
  WhitePawn256, BlackPawn256,
  WhiteKnight256, BlackKnight256,
  WhiteBishop256, BlackBishop256,
  WhiteRook256, BlackRook256,
  WhiteQueen256, BlackQueen256,
  WhiteKing256, BlackKing256,
]);

const PieceString = 'PpNnBbRrQqKk';

export const PawnMoveInc = Int32Array.from([+16, -16]);

export const KnightInc = Int32Array.from([-33, -31, -18, -14, +14, +18, +31, +33, 0]);
export const BishopInc = Int32Array.from([-17, -15, +15, +17, 0]);
export const RookInc = Int32Array.from([-16, -1, +1, +16, 0]);
export const QueenInc = Int32Array.from([-17, -16, -15, -1, +1, +15, +16, +17, 0]);
export const KingInc = Int32Array.from([-17, -16, -15, -1, +1, +15, +16, +17, 0]);

// variables
export const PieceTo12 = new Int32Array(PieceNb);
export const PieceOrder = new Int32Array(PieceNb);
/** PieceInc[piece]: the increments, ending with 0 (NULL in the original for non-pieces: an empty list here) */
const NoInc = Int32Array.from([0]);
export const PieceInc: Int32Array[] = new Array<Int32Array>(PieceNb).fill(NoInc);

// macros
export const PAWN_MAKE = (colour: number): number => PawnMake[colour];
export const PAWN_OPP = (pawn: number): number => pawn ^ (WhitePawn256 ^ BlackPawn256);
export const PIECE_COLOUR = (piece: number): number => (piece & 3) - 1;
export const PIECE_TYPE = (piece: number): number => piece & ~3;
export const PIECE_IS_PAWN = (piece: number): boolean => (piece & PawnFlags) !== 0;
export const PIECE_IS_KNIGHT = (piece: number): boolean => (piece & KnightFlag) !== 0;
export const PIECE_IS_BISHOP = (piece: number): boolean => (piece & QueenFlags) === BishopFlag;
export const PIECE_IS_ROOK = (piece: number): boolean => (piece & QueenFlags) === RookFlag;
export const PIECE_IS_QUEEN = (piece: number): boolean => (piece & QueenFlags) === QueenFlags;
export const PIECE_IS_KING = (piece: number): boolean => (piece & KingFlag) !== 0;
export const PIECE_IS_SLIDER = (piece: number): boolean => (piece & QueenFlags) !== 0;
export const PIECE_TO_12 = (piece: number): number => PieceTo12[piece];
export const PIECE_ORDER = (piece: number): number => PieceOrder[piece];
export const PAWN_MOVE_INC = (colour: number): number => PawnMoveInc[colour];
export const PIECE_INC = (piece: number): Int32Array => PieceInc[piece];

// functions

// piece_init()
export function piece_init(): void {
  // PieceTo12[]
  for (let piece = 0; piece < PieceNb; piece++) PieceTo12[piece] = -1;
  for (let piece_12 = 0; piece_12 < 12; piece_12++) {
    PieceTo12[PieceFrom12[piece_12]] = piece_12;
  }
  // PieceOrder[]
  for (let piece = 0; piece < PieceNb; piece++) PieceOrder[piece] = -1;
  for (let piece_12 = 0; piece_12 < 12; piece_12++) {
    PieceOrder[PieceFrom12[piece_12]] = piece_12 >> 1;
  }
  // PieceInc[]
  for (let piece = 0; piece < PieceNb; piece++) {
    PieceInc[piece] = NoInc;
  }
  PieceInc[WhiteKnight256] = KnightInc;
  PieceInc[WhiteBishop256] = BishopInc;
  PieceInc[WhiteRook256] = RookInc;
  PieceInc[WhiteQueen256] = QueenInc;
  PieceInc[WhiteKing256] = KingInc;
  PieceInc[BlackKnight256] = KnightInc;
  PieceInc[BlackBishop256] = BishopInc;
  PieceInc[BlackRook256] = RookInc;
  PieceInc[BlackQueen256] = QueenInc;
  PieceInc[BlackKing256] = KingInc;
}

// piece_is_ok()
export function piece_is_ok(piece: number): boolean {
  if (piece < 0 || piece >= PieceNb) return false;
  if (PieceTo12[piece] < 0) return false;
  return true;
}

// piece_from_12()
export function piece_from_12(piece_12: number): number {
  return PieceFrom12[piece_12];
}

// piece_to_char()
export function piece_to_char(piece: number): string {
  return PieceString[PIECE_TO_12(piece)];
}

// piece_from_char(): strchr(PieceString,c) (also finds the terminating NUL, as strchr does)
export function piece_from_char(c: string): number {
  if (c === '\0') return PieceNone256; // strchr finds the NUL at index 12: piece_from_12(12) reads past the table (0 in practice)
  const ptr = PieceString.indexOf(c);
  if (ptr < 0) return PieceNone256;
  return piece_from_12(ptr);
}
