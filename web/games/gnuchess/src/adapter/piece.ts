// Port of src/adapter/piece.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { Black, White } from './colour.ts';

// constants

export const BlackPawnFlag = 1 << 2;
export const WhitePawnFlag = 1 << 3;
export const KnightFlag = 1 << 4;
export const BishopFlag = 1 << 5;
export const RookFlag = 1 << 6;
export const KingFlag = 1 << 7;

export const PawnFlags = BlackPawnFlag | WhitePawnFlag;
export const QueenFlags = BishopFlag | RookFlag;

export const PieceNone64 = 0;
export const BlackPawn64 = BlackPawnFlag;
export const WhitePawn64 = WhitePawnFlag;
export const Knight64 = KnightFlag;
export const Bishop64 = BishopFlag;
export const Rook64 = RookFlag;
export const Queen64 = QueenFlags;
export const King64 = KingFlag;

export const PieceNone256 = 0;
export const BlackPawn256 = BlackPawn64 | Black;
export const WhitePawn256 = WhitePawn64 | White;
export const BlackKnight256 = Knight64 | Black;
export const WhiteKnight256 = Knight64 | White;
export const BlackBishop256 = Bishop64 | Black;
export const WhiteBishop256 = Bishop64 | White;
export const BlackRook256 = Rook64 | Black;
export const WhiteRook256 = Rook64 | White;
export const BlackQueen256 = Queen64 | Black;
export const WhiteQueen256 = Queen64 | White;
export const BlackKing256 = King64 | Black;
export const WhiteKing256 = King64 | White;

export const BlackPawn12 = 0;
export const WhitePawn12 = 1;
export const BlackKnight12 = 2;
export const WhiteKnight12 = 3;
export const BlackBishop12 = 4;
export const WhiteBishop12 = 5;
export const BlackRook12 = 6;
export const WhiteRook12 = 7;
export const BlackQueen12 = 8;
export const WhiteQueen12 = 9;
export const BlackKing12 = 10;
export const WhiteKing12 = 11;

// "constants"

const MakePawn: readonly number[] = [PieceNone256, BlackPawn256, WhitePawn256]; // -BW

const PieceFrom12: readonly number[] = [
   BlackPawn256, WhitePawn256,
   BlackKnight256, WhiteKnight256,
   BlackBishop256, WhiteBishop256,
   BlackRook256, WhiteRook256,
   BlackQueen256, WhiteQueen256,
   BlackKing256, WhiteKing256,
];

const PieceString = 'pPnNbBrRqQkK';

// variables

const PieceTo12 = new Int8Array(256);

// functions

// piece_init()

export function piece_init(): void {
   let piece: number;
   for (piece = 0; piece < 256; piece++) PieceTo12[piece] = -1;
   for (piece = 0; piece < 12; piece++) {
      PieceTo12[PieceFrom12[piece]] = piece;
   }
}

// piece_is_ok()

export function piece_is_ok(piece: number): boolean {
   if (piece < 0 || piece >= 256) return false;
   if (PieceTo12[piece] < 0) return false;
   return true;
}

// piece_make_pawn()

export function piece_make_pawn(colour: number): number {
   return MakePawn[colour];
}

// piece_pawn_opp()

export function piece_pawn_opp(piece: number): number {
   return piece ^ 15;
}

// piece_colour()

export function piece_colour(piece: number): number {
   return piece & 3;
}

// piece_type()

export function piece_type(piece: number): number {
   return piece & ~3;
}

// piece_is_pawn()

export function piece_is_pawn(piece: number): boolean {
   return (piece & PawnFlags) !== 0;
}

// piece_is_knight()

export function piece_is_knight(piece: number): boolean {
   return (piece & KnightFlag) !== 0;
}

// piece_is_bishop()

export function piece_is_bishop(piece: number): boolean {
   return (piece & QueenFlags) === BishopFlag;
}

// piece_is_rook()

export function piece_is_rook(piece: number): boolean {
   return (piece & QueenFlags) === RookFlag;
}

// piece_is_queen()

export function piece_is_queen(piece: number): boolean {
   return (piece & QueenFlags) === QueenFlags;
}

// piece_is_king()

export function piece_is_king(piece: number): boolean {
   return (piece & KingFlag) !== 0;
}

// piece_is_slider()

export function piece_is_slider(piece: number): boolean {
   return (piece & QueenFlags) !== 0;
}

// piece_to_12()

export function piece_to_12(piece: number): number {
   return PieceTo12[piece & 255];
}

// piece_from_12()

export function piece_from_12(piece: number): number {
   return PieceFrom12[piece];
}

// piece_to_char()

export function piece_to_char(piece: number): string {
   // PieceString[-1] for a non-piece reads the byte before the array in C; never reached by the callers
   return PieceString[piece_to_12(piece)] ?? '\0';
}

// piece_from_char()

export function piece_from_char(c: string): number {
   // strchr() also finds the terminating NUL
   if (c === '\0') return PieceNone256;
   const i = PieceString.indexOf(c);
   if (i < 0) return PieceNone256;
   return piece_from_12(i);
}

// char_is_piece()

export function char_is_piece(c: string): boolean {
   return c === '\0' || 'PNBRQK'.includes(c);
}
