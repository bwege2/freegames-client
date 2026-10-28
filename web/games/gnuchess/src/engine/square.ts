// Port of src/engine/square.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// 16x16 mailbox: the board is squares 0x44..0xBB, the rest is edge.


// constants
export const FileNb = 16;
export const RankNb = 16;

export const SquareNb = FileNb * RankNb;

export const FileInc = +1;
export const RankInc = +16;

export const FileNone = 0;

export const FileA = 0x4;
export const FileB = 0x5;
export const FileC = 0x6;
export const FileD = 0x7;
export const FileE = 0x8;
export const FileF = 0x9;
export const FileG = 0xa;
export const FileH = 0xb;

export const RankNone = 0;

export const Rank1 = 0x4;
export const Rank2 = 0x5;
export const Rank3 = 0x6;
export const Rank4 = 0x7;
export const Rank5 = 0x8;
export const Rank6 = 0x9;
export const Rank7 = 0xa;
export const Rank8 = 0xb;

export const SquareNone = 0;

export const A1 = 0x44, B1 = 0x45, C1 = 0x46, D1 = 0x47, E1 = 0x48, F1 = 0x49, G1 = 0x4a, H1 = 0x4b;
export const A2 = 0x54, B2 = 0x55, C2 = 0x56, D2 = 0x57, E2 = 0x58, F2 = 0x59, G2 = 0x5a, H2 = 0x5b;
export const A3 = 0x64, B3 = 0x65, C3 = 0x66, D3 = 0x67, E3 = 0x68, F3 = 0x69, G3 = 0x6a, H3 = 0x6b;
export const A4 = 0x74, B4 = 0x75, C4 = 0x76, D4 = 0x77, E4 = 0x78, F4 = 0x79, G4 = 0x7a, H4 = 0x7b;
export const A5 = 0x84, B5 = 0x85, C5 = 0x86, D5 = 0x87, E5 = 0x88, F5 = 0x89, G5 = 0x8a, H5 = 0x8b;
export const A6 = 0x94, B6 = 0x95, C6 = 0x96, D6 = 0x97, E6 = 0x98, F6 = 0x99, G6 = 0x9a, H6 = 0x9b;
export const A7 = 0xa4, B7 = 0xa5, C7 = 0xa6, D7 = 0xa7, E7 = 0xa8, F7 = 0xa9, G7 = 0xaa, H7 = 0xab;
export const A8 = 0xb4, B8 = 0xb5, C8 = 0xb6, D8 = 0xb7, E8 = 0xb8, F8 = 0xb9, G8 = 0xba, H8 = 0xbb;

export const Dark = 0;
export const Light = 1;

// "constants"
export const SquareFrom64 = Int32Array.from([
  A1, B1, C1, D1, E1, F1, G1, H1,
  A2, B2, C2, D2, E2, F2, G2, H2,
  A3, B3, C3, D3, E3, F3, G3, H3,
  A4, B4, C4, D4, E4, F4, G4, H4,
  A5, B5, C5, D5, E5, F5, G5, H5,
  A6, B6, C6, D6, E6, F6, G6, H6,
  A7, B7, C7, D7, E7, F7, G7, H7,
  A8, B8, C8, D8, E8, F8, G8, H8,
]);

export const RankMask = Int32Array.from([0, 0xf]);
export const PromoteRank = Int32Array.from([0xb0, 0x40]);

// variables
export const SquareTo64 = new Int32Array(SquareNb);
export const SquareIsPromote = new Uint8Array(SquareNb);

// macros
export const SQUARE_IS_OK = (square: number): boolean => ((square - 0x44) & ~0x77) === 0;
export const SQUARE_MAKE = (file: number, rank: number): number => (rank << 4) | file;
export const SQUARE_FILE = (square: number): number => square & 0xf;
export const SQUARE_RANK = (square: number): number => square >> 4;
export const SQUARE_FROM_64 = (square: number): number => SquareFrom64[square];
export const SQUARE_TO_64 = (square: number): number => SquareTo64[square];
export const SQUARE_IS_PROMOTE = (square: number): boolean => SquareIsPromote[square] !== 0;
export const SQUARE_EP_DUAL = (square: number): number => square ^ 16;
export const SQUARE_COLOUR = (square: number): number => (square ^ (square >> 4)) & 1;
export const SQUARE_FILE_MIRROR = (square: number): number => square ^ 0x0f;
export const SQUARE_RANK_MIRROR = (square: number): number => square ^ 0xf0;
export const FILE_OPP = (file: number): number => file ^ 0xf;
export const RANK_OPP = (rank: number): number => rank ^ 0xf;
export const PAWN_RANK = (square: number, colour: number): number => (square >> 4) ^ RankMask[colour];
export const PAWN_PROMOTE = (square: number, colour: number): number => PromoteRank[colour] | (square & 0xf);

// functions

// square_init()
export function square_init(): void {
  // SquareTo64[]
  for (let sq = 0; sq < SquareNb; sq++) SquareTo64[sq] = -1;
  for (let sq = 0; sq < 64; sq++) {
    SquareTo64[SquareFrom64[sq]] = sq;
  }
  // SquareIsPromote[]
  for (let sq = 0; sq < SquareNb; sq++) {
    SquareIsPromote[sq] = SQUARE_IS_OK(sq) && (SQUARE_RANK(sq) === Rank1 || SQUARE_RANK(sq) === Rank8) ? 1 : 0;
  }
}

// file_from_char()
export function file_from_char(c: string): number {
  return FileA + (c.charCodeAt(0) - 97);
}

// rank_from_char()
export function rank_from_char(c: string): number {
  return Rank1 + (c.charCodeAt(0) - 49);
}

// file_to_char()
export function file_to_char(file: number): string {
  return String.fromCharCode(97 + (file - FileA));
}

// rank_to_char()
export function rank_to_char(rank: number): string {
  return String.fromCharCode(49 + (rank - Rank1));
}

// square_to_string()
export function square_to_string(square: number): string {
  return file_to_char(SQUARE_FILE(square)) + rank_to_char(SQUARE_RANK(square));
}

// square_from_string(): the string's first three chars as C sees them ('\0' past the end)
export function square_from_string(string: string): number {
  const c0 = string.length > 0 ? string[0] : '\0';
  const c1 = string.length > 1 ? string[1] : '\0';
  const c2 = string.length > 2 ? string[2] : '\0';
  if (c0 < 'a' || c0 > 'h') return SquareNone;
  if (c1 < '1' || c1 > '8') return SquareNone;
  if (c2 !== '\0') return SquareNone;
  const file = file_from_char(c0);
  const rank = rank_from_char(c1);
  return SQUARE_MAKE(file, rank);
}
