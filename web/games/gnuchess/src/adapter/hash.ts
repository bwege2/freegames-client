// Port of src/adapter/hash.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// The PolyGlot key of a position (the book's key); 64-bit values are bigints.

import { board_flags, type board_t } from './board.ts';
import { colour_is_white } from './colour.ts';
import { piece_to_12 } from './piece.ts';
import { random_64 } from './random.ts';
import { SquareNone, square_file, square_to_64 } from './square.ts';

// constants

export const RandomPiece = 0; // 12 * 64
export const RandomCastle = 768; // 4
export const RandomEnPassant = 772; // 8
export const RandomTurn = 780; // 1

// variables

const Castle64: bigint[] = new Array<bigint>(16).fill(0n);

// functions

// hash_init()

export function hash_init(): void {
   for (let i = 0; i < 16; i++) Castle64[i] = hash_castle_key_debug(i);
}

// hash_key()

export function hash_key(board: board_t): bigint {
   let key = 0n;
   let sq: number, piece: number;
   // pieces
   for (let colour = 1; colour <= 2; colour++) { // HACK
      for (let p = colour * 32; (sq = board.list[p]) !== SquareNone; p++) {
         piece = board.square[sq];
         key ^= hash_piece_key(piece, sq);
      }
   }
   // castle flags
   key ^= hash_castle_key(board_flags(board));
   // en-passant square
   sq = board.ep_square;
   if (sq !== SquareNone) key ^= hash_ep_key(sq);
   // turn
   key ^= hash_turn_key(board.turn);
   return key;
}

// hash_piece_key()

export function hash_piece_key(piece: number, square: number): bigint {
   return random_64(RandomPiece + piece_to_12(piece) * 64 + square_to_64(square));
}

// hash_castle_key()

export function hash_castle_key(flags: number): bigint {
   return Castle64[flags];
}

// hash_castle_key_debug()

function hash_castle_key_debug(flags: number): bigint {
   let key = 0n;
   for (let i = 0; i < 4; i++) {
      if ((flags & (1 << i)) !== 0) key ^= random_64(RandomCastle + i);
   }
   return key;
}

// hash_ep_key()

export function hash_ep_key(square: number): bigint {
   return random_64(RandomEnPassant + square_file(square));
}

// hash_turn_key()

export function hash_turn_key(colour: number): bigint {
   return colour_is_white(colour) ? random_64(RandomTurn) : 0n;
}
