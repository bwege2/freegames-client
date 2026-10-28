// Port of src/adapter/attack.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import type { board_t } from './board.ts';
import { colour_opp } from './colour.ts';
import { BishopFlag, BlackPawnFlag, KingFlag, KnightFlag, piece_colour, piece_is_slider, RookFlag, WhitePawnFlag } from './piece.ts';
import { SquareNone, square_is_ok } from './square.ts';

// constants

export const IncNone = 0;

// macros

const DELTA_INC = (delta: number): number => DeltaInc[128 + delta];
const DELTA_MASK = (delta: number): number => DeltaMask[128 + delta];

// "constants"

export const KnightInc: readonly number[] = [-33, -31, -18, -14, +14, +18, +31, +33, 0];
export const BishopInc: readonly number[] = [-17, -15, +15, +17, 0];
export const RookInc: readonly number[] = [-16, -1, +1, +16, 0];
export const QueenInc: readonly number[] = [-17, -16, -15, -1, +1, +15, +16, +17, 0];
export const KingInc: readonly number[] = [-17, -16, -15, -1, +1, +15, +16, +17, 0];

// variables

const DeltaInc = new Int8Array(256);
const DeltaMask = new Uint8Array(256);

// functions

// attack_init()

export function attack_init(): void {
   let delta: number;
   let dir: number, inc: number, dist: number;
   for (delta = -128; delta < +128; delta++) {
      DeltaInc[128 + delta] = IncNone;
      DeltaMask[128 + delta] = 0;
   }
   DeltaMask[128 - 17] |= BlackPawnFlag;
   DeltaMask[128 - 15] |= BlackPawnFlag;
   DeltaMask[128 + 15] |= WhitePawnFlag;
   DeltaMask[128 + 17] |= WhitePawnFlag;
   for (dir = 0; dir < 8; dir++) {
      delta = KnightInc[dir];
      DeltaMask[128 + delta] |= KnightFlag;
   }
   for (dir = 0; dir < 4; dir++) {
      inc = BishopInc[dir];
      for (dist = 1; dist < 8; dist++) {
         delta = inc * dist;
         DeltaInc[128 + delta] = inc;
         DeltaMask[128 + delta] |= BishopFlag;
      }
   }
   for (dir = 0; dir < 4; dir++) {
      inc = RookInc[dir];
      for (dist = 1; dist < 8; dist++) {
         delta = inc * dist;
         DeltaInc[128 + delta] = inc;
         DeltaMask[128 + delta] |= RookFlag;
      }
   }
   for (dir = 0; dir < 8; dir++) {
      delta = KingInc[dir];
      DeltaMask[128 + delta] |= KingFlag;
   }
}

// is_in_check()

export function is_in_check(board: board_t, colour: number): boolean {
   return is_attacked(board, board.list[colour * 32], colour_opp(colour)); // king_pos()
}

// is_attacked()

export function is_attacked(board: board_t, to: number, colour: number): boolean {
   let from: number, piece: number;
   for (let p = colour * 32; (from = board.list[p]) !== SquareNone; p++) {
      piece = board.square[from];
      if (piece_attack(board, piece, from, to)) return true;
   }
   return false;
}

// piece_attack()

export function piece_attack(board: board_t, piece: number, from: number, to: number): boolean {
   const delta = to - from;
   if ((piece & DELTA_MASK(delta)) === 0) return false; // no pseudo-attack
   if (!piece_is_slider(piece)) return true;
   const inc = DELTA_INC(delta);
   for (let sq = from + inc; sq !== to; sq += inc) {
      if (board.square[sq] !== 0) return false; // blocker
   }
   return true;
}

// is_pinned()

export function is_pinned(board: board_t, from: number, to: number, colour: number): boolean {
   let piece: number;
   const king = board.list[colour * 32]; // king_pos()
   const inc = DELTA_INC(king - from);
   if (inc === IncNone) return false; // not a line
   let sq = from;
   do sq += inc; while (board.square[sq] === 0);
   if (sq !== king) return false; // blocker
   sq = from;
   do sq -= inc; while ((piece = board.square[sq]) === 0);
   return square_is_ok(sq)
      && (piece & DELTA_MASK(king - sq)) !== 0
      && piece_colour(piece) === colour_opp(colour)
      && DELTA_INC(king - to) !== inc;
}
