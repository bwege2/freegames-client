// Port of src/engine/hash.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// 64-bit keys are pairs of 32-bit halves (int32): the functions that return a uint64 in the original
// leave it in KeyOut[0] (high half) and KeyOut[1] (low half).

import type { board_t } from './board.ts';
import { ColourNb, COLOUR_IS_WHITE } from './colour.ts';
import { PIECE_TO_12 } from './piece.ts';
import { Random64Hi, Random64Lo } from './random.ts';
import { FileA, SQUARE_FILE, SQUARE_TO_64, SquareNone } from './square.ts';

// macros: KEY_INDEX(key) is the low half, KEY_LOCK(key) the high half

// constants
export const RandomPiece = 0; // 12 * 64
export const RandomCastle = 768; // 4
export const RandomEnPassant = 772; // 8
export const RandomTurn = 780; // 1

// variables
export const Castle64Hi = new Int32Array(16);
export const Castle64Lo = new Int32Array(16);

/** the uint64 result of the last hash_*() call: [high, low] */
export const KeyOut = new Int32Array(2);

// functions

// hash_init()
export function hash_init(): void {
  for (let i = 0; i < 16; i++) {
    hash_castle_key(i);
    Castle64Hi[i] = KeyOut[0];
    Castle64Lo[i] = KeyOut[1];
  }
}

// hash_key()
export function hash_key(board: board_t): void {
  let hi = 0, lo = 0;
  // pieces
  for (let colour = 0; colour < ColourNb; colour++) {
    for (let p = colour * 32, sq: number; (sq = board.piece[p]) !== SquareNone; p++) {
      const index = RandomPiece + (PIECE_TO_12(board.square[sq]) ^ 1) * 64 + SQUARE_TO_64(sq); // HACK: ^1 for PolyGlot book
      hi ^= Random64Hi[index];
      lo ^= Random64Lo[index];
    }
    for (let p = colour * 16, sq: number; (sq = board.pawn[p]) !== SquareNone; p++) {
      const index = RandomPiece + (PIECE_TO_12(board.square[sq]) ^ 1) * 64 + SQUARE_TO_64(sq);
      hi ^= Random64Hi[index];
      lo ^= Random64Lo[index];
    }
  }
  // castle flags
  hash_castle_key(board.flags);
  hi ^= KeyOut[0];
  lo ^= KeyOut[1];
  // en-passant square
  const sq = board.ep_square;
  if (sq !== SquareNone) {
    hi ^= Random64Hi[RandomEnPassant + SQUARE_FILE(sq) - FileA];
    lo ^= Random64Lo[RandomEnPassant + SQUARE_FILE(sq) - FileA];
  }
  // turn
  if (COLOUR_IS_WHITE(board.turn)) {
    hi ^= Random64Hi[RandomTurn];
    lo ^= Random64Lo[RandomTurn];
  }
  KeyOut[0] = hi;
  KeyOut[1] = lo;
}

// hash_pawn_key()
export function hash_pawn_key(board: board_t): void {
  let hi = 0, lo = 0;
  // pawns
  for (let colour = 0; colour < ColourNb; colour++) {
    for (let p = colour * 16, sq: number; (sq = board.pawn[p]) !== SquareNone; p++) {
      const index = RandomPiece + (PIECE_TO_12(board.square[sq]) ^ 1) * 64 + SQUARE_TO_64(sq);
      hi ^= Random64Hi[index];
      lo ^= Random64Lo[index];
    }
  }
  KeyOut[0] = hi;
  KeyOut[1] = lo;
}

// hash_material_key()
export function hash_material_key(board: board_t): void {
  let hi = 0, lo = 0;
  // counters
  for (let piece_12 = 0; piece_12 < 12; piece_12++) {
    const count = board.number[piece_12];
    // hash_counter_key()
    const index = piece_12 * 16;
    for (let i = 0; i < count; i++) {
      hi ^= Random64Hi[index + i];
      lo ^= Random64Lo[index + i];
    }
  }
  KeyOut[0] = hi;
  KeyOut[1] = lo;
}

// hash_piece_key()
export function hash_piece_key(piece: number, square: number): void {
  const index = RandomPiece + (PIECE_TO_12(piece) ^ 1) * 64 + SQUARE_TO_64(square); // HACK: ^1 for PolyGlot book
  KeyOut[0] = Random64Hi[index];
  KeyOut[1] = Random64Lo[index];
}

// hash_castle_key()
export function hash_castle_key(flags: number): void {
  let hi = 0, lo = 0;
  for (let i = 0; i < 4; i++) {
    if ((flags & (1 << i)) !== 0) {
      hi ^= Random64Hi[RandomCastle + i];
      lo ^= Random64Lo[RandomCastle + i];
    }
  }
  KeyOut[0] = hi;
  KeyOut[1] = lo;
}

// hash_ep_key()
export function hash_ep_key(square: number): void {
  KeyOut[0] = Random64Hi[RandomEnPassant + SQUARE_FILE(square) - FileA];
  KeyOut[1] = Random64Lo[RandomEnPassant + SQUARE_FILE(square) - FileA];
}

// hash_turn_key()
export function hash_turn_key(colour: number): void {
  KeyOut[0] = COLOUR_IS_WHITE(colour) ? Random64Hi[RandomTurn] : 0;
  KeyOut[1] = COLOUR_IS_WHITE(colour) ? Random64Lo[RandomTurn] : 0;
}
