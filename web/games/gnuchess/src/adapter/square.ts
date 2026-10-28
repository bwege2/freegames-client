// Port of src/adapter/square.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { colour_is_black } from './colour.ts';

// constants

export const SquareNb = 16 * 12;

export const FileA = 0;
export const FileB = 1;
export const FileC = 2;
export const FileD = 3;
export const FileE = 4;
export const FileF = 5;
export const FileG = 6;
export const FileH = 7;

export const Rank1 = 0;
export const Rank2 = 1;
export const Rank3 = 2;
export const Rank4 = 3;
export const Rank5 = 4;
export const Rank6 = 5;
export const Rank7 = 6;
export const Rank8 = 7;

export const SquareNone = 0;

export const A1 = 0x24, B1 = 0x25, C1 = 0x26, D1 = 0x27, E1 = 0x28, F1 = 0x29, G1 = 0x2A, H1 = 0x2B;
export const A2 = 0x34, B2 = 0x35, C2 = 0x36, D2 = 0x37, E2 = 0x38, F2 = 0x39, G2 = 0x3A, H2 = 0x3B;
export const A3 = 0x44, B3 = 0x45, C3 = 0x46, D3 = 0x47, E3 = 0x48, F3 = 0x49, G3 = 0x4A, H3 = 0x4B;
export const A4 = 0x54, B4 = 0x55, C4 = 0x56, D4 = 0x57, E4 = 0x58, F4 = 0x59, G4 = 0x5A, H4 = 0x5B;
export const A5 = 0x64, B5 = 0x65, C5 = 0x66, D5 = 0x67, E5 = 0x68, F5 = 0x69, G5 = 0x6A, H5 = 0x6B;
export const A6 = 0x74, B6 = 0x75, C6 = 0x76, D6 = 0x77, E6 = 0x78, F6 = 0x79, G6 = 0x7A, H6 = 0x7B;
export const A7 = 0x84, B7 = 0x85, C7 = 0x86, D7 = 0x87, E7 = 0x88, F7 = 0x89, G7 = 0x8A, H7 = 0x8B;
export const A8 = 0x94, B8 = 0x95, C8 = 0x96, D8 = 0x97, E8 = 0x98, F8 = 0x99, G8 = 0x9A, H8 = 0x9B;

export const Dark = 0;
export const Light = 1;

// "constants"

const SquareFrom64: readonly number[] = [
   A1, B1, C1, D1, E1, F1, G1, H1,
   A2, B2, C2, D2, E2, F2, G2, H2,
   A3, B3, C3, D3, E3, F3, G3, H3,
   A4, B4, C4, D4, E4, F4, G4, H4,
   A5, B5, C5, D5, E5, F5, G5, H5,
   A6, B6, C6, D6, E6, F6, G6, H6,
   A7, B7, C7, D7, E7, F7, G7, H7,
   A8, B8, C8, D8, E8, F8, G8, H8,
];

// variables

const SquareTo64 = new Int8Array(SquareNb);

// functions

// square_init()

export function square_init(): void {
   let sq: number;
   for (sq = 0; sq < SquareNb; sq++) SquareTo64[sq] = -1;
   for (sq = 0; sq < 64; sq++) {
      SquareTo64[SquareFrom64[sq]] = sq;
   }
}

// square_is_ok()

export function square_is_ok(square: number): boolean {
   if (square < 0 || square >= SquareNb) return false;
   if (SquareTo64[square] < 0) return false;
   return true;
}

// square_make()

export function square_make(file: number, rank: number): number {
   const sq_64 = (rank << 3) | file;
   return square_from_64(sq_64);
}

// square_file()

export function square_file(square: number): number {
   return (square - 4) & 7;
}

// square_rank()

export function square_rank(square: number): number {
   return (square >> 4) - 2;
}

// square_side_rank()

export function square_side_rank(square: number, colour: number): number {
   let rank = square_rank(square);
   if (colour_is_black(colour)) rank = 7 - rank;
   return rank;
}

// square_from_64()

export function square_from_64(square: number): number {
   return SquareFrom64[square];
}

// square_to_64()

export function square_to_64(square: number): number {
   return SquareTo64[square];
}

// square_is_promote()

export function square_is_promote(square: number): boolean {
   const rank = square_rank(square);
   return rank === Rank1 || rank === Rank8;
}

// square_ep_dual()

export function square_ep_dual(square: number): number {
   return square ^ 16;
}

// square_colour()

export function square_colour(square: number): number {
   return (square ^ (square >> 4)) & 1;
}

// file_from_char()

export function file_from_char(c: string): number {
   return c.charCodeAt(0) - 97; // 'a'
}

// rank_from_char()

export function rank_from_char(c: string): number {
   return c.charCodeAt(0) - 49; // '1'
}

// file_to_char()

export function file_to_char(file: number): string {
   return String.fromCharCode(97 + file);
}

// rank_to_char()

export function rank_to_char(rank: number): string {
   return String.fromCharCode(49 + rank);
}

// char_is_file()

export function char_is_file(c: string): boolean {
   return c >= 'a' && c <= 'h';
}

// char_is_rank()

export function char_is_rank(c: string): boolean {
   return c >= '1' && c <= '8';
}

// square_to_string(): the two characters (the C version writes them into a buffer of size >= 3)

export function square_to_string(square: number): string {
   return String.fromCharCode(97 + square_file(square), 49 + square_rank(square));
}

// square_from_string()

export function square_from_string(string: string): number {
   const c0 = string[0] ?? '\0', c1 = string[1] ?? '\0', c2 = string[2] ?? '\0';
   if (c0 < 'a' || c0 > 'h') return SquareNone;
   if (c1 < '1' || c1 > '8') return SquareNone;
   if (c2 !== '\0') return SquareNone;
   const file = file_from_char(c0);
   const rank = rank_from_char(c1);
   return square_make(file, rank);
}
