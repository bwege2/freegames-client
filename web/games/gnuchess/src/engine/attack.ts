// Port of src/engine/attack.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { BB, BN, BQ, BR, board_t, Empty, KING_POS, WB, WN, WQ, WR } from './board.ts';
import { COLOUR_IS, COLOUR_OPP } from './colour.ts';
import {
  BishopFlag, BishopInc, BlackPawnFlag, KingFlag, KingInc, KnightFlag, KnightInc, PAWN_MAKE, PAWN_MOVE_INC,
  PieceNb, PIECE_IS_SLIDER, QueenInc, RookFlag, RookInc, WhitePawnFlag,
} from './piece.ts';
import { SquareNb, SquareNone, SQUARE_IS_OK } from './square.ts';
import { DeltaNb, DeltaNone, DeltaOffset, DISTANCE, IncNb, IncNone, IncOffset } from './vector.ts';

// types
export class attack_t {
  dn = 0;
  ds = new Int32Array(2 + 1);
  di = new Int32Array(2 + 1);
}

// variables
export const DeltaIncLine = new Int32Array(DeltaNb);
export const DeltaIncAll = new Int32Array(DeltaNb);
export const DeltaMask = new Int32Array(DeltaNb);
export const IncMask = new Int32Array(IncNb);

const PieceCode = new Int32Array(PieceNb);
const PieceDeltaSize = new Int32Array(4 * 256); // 4kB
const PieceDeltaDelta = new Int32Array(4 * 256 * 4); // 16 kB: [piece][delta][i] at (piece*256+delta)*4+i

// macros
export const IS_IN_CHECK = (board: board_t, colour: number): boolean =>
  is_attacked(board, KING_POS(board, colour), COLOUR_OPP(colour));
export const DELTA_INC_LINE = (delta: number): number => DeltaIncLine[DeltaOffset + delta];
export const DELTA_INC_ALL = (delta: number): number => DeltaIncAll[DeltaOffset + delta];
export const DELTA_MASK = (delta: number): number => DeltaMask[DeltaOffset + delta];
export const INC_MASK = (inc: number): number => IncMask[IncOffset + inc];
export const PIECE_ATTACK = (board: board_t, piece: number, from: number, to: number): boolean =>
  PSEUDO_ATTACK(piece, to - from) && line_is_empty(board, from, to);
export const PSEUDO_ATTACK = (piece: number, delta: number): boolean => (piece & DeltaMask[DeltaOffset + delta]) !== 0;
export const SLIDER_ATTACK = (piece: number, inc: number): boolean => (piece & IncMask[IncOffset + inc]) !== 0;
export const ATTACK_IN_CHECK = (attack: attack_t): boolean => attack.dn !== 0;

// functions

// attack_init()
export function attack_init(): void {
  // clear
  for (let delta = 0; delta < DeltaNb; delta++) {
    DeltaIncLine[delta] = IncNone;
    DeltaIncAll[delta] = IncNone;
    DeltaMask[delta] = 0;
  }
  for (let inc = 0; inc < IncNb; inc++) {
    IncMask[inc] = 0;
  }
  // pawn attacks
  DeltaMask[DeltaOffset - 17] |= BlackPawnFlag;
  DeltaMask[DeltaOffset - 15] |= BlackPawnFlag;
  DeltaMask[DeltaOffset + 15] |= WhitePawnFlag;
  DeltaMask[DeltaOffset + 17] |= WhitePawnFlag;
  // knight attacks
  for (let dir = 0; dir < 8; dir++) {
    const delta = KnightInc[dir];
    DeltaIncAll[DeltaOffset + delta] = delta;
    DeltaMask[DeltaOffset + delta] |= KnightFlag;
  }
  // bishop/queen attacks
  for (let dir = 0; dir < 4; dir++) {
    const inc = BishopInc[dir];
    IncMask[IncOffset + inc] |= BishopFlag;
    for (let dist = 1; dist < 8; dist++) {
      const delta = inc * dist;
      DeltaIncLine[DeltaOffset + delta] = inc;
      DeltaIncAll[DeltaOffset + delta] = inc;
      DeltaMask[DeltaOffset + delta] |= BishopFlag;
    }
  }
  // rook/queen attacks
  for (let dir = 0; dir < 4; dir++) {
    const inc = RookInc[dir];
    IncMask[IncOffset + inc] |= RookFlag;
    for (let dist = 1; dist < 8; dist++) {
      const delta = inc * dist;
      DeltaIncLine[DeltaOffset + delta] = inc;
      DeltaIncAll[DeltaOffset + delta] = inc;
      DeltaMask[DeltaOffset + delta] |= RookFlag;
    }
  }
  // king attacks
  for (let dir = 0; dir < 8; dir++) {
    const delta = KingInc[dir];
    DeltaMask[DeltaOffset + delta] |= KingFlag;
  }
  // PieceCode[]
  for (let piece = 0; piece < PieceNb; piece++) {
    PieceCode[piece] = -1;
  }
  PieceCode[WN] = 0;
  PieceCode[WB] = 1;
  PieceCode[WR] = 2;
  PieceCode[WQ] = 3;
  PieceCode[BN] = 0;
  PieceCode[BB] = 1;
  PieceCode[BR] = 2;
  PieceCode[BQ] = 3;
  // PieceDeltaSize[][] & PieceDeltaDelta[][][]
  for (let piece = 0; piece < 4; piece++) {
    for (let delta = 0; delta < 256; delta++) {
      PieceDeltaSize[piece * 256 + delta] = 0;
    }
  }
  for (let king = 0; king < SquareNb; king++) {
    if (SQUARE_IS_OK(king)) {
      for (let from = 0; from < SquareNb; from++) {
        if (SQUARE_IS_OK(from)) {
          let inc: number;
          // knight
          for (let pos = 0; (inc = KnightInc[pos]) !== IncNone; pos++) {
            const to = from + inc;
            if (SQUARE_IS_OK(to) && DISTANCE(to, king) === 1) {
              add_attack(0, king - from, to - from);
            }
          }
          // bishop
          for (let pos = 0; (inc = BishopInc[pos]) !== IncNone; pos++) {
            for (let to = from + inc; SQUARE_IS_OK(to); to += inc) {
              if (DISTANCE(to, king) === 1) {
                add_attack(1, king - from, to - from);
                break;
              }
            }
          }
          // rook
          for (let pos = 0; (inc = RookInc[pos]) !== IncNone; pos++) {
            for (let to = from + inc; SQUARE_IS_OK(to); to += inc) {
              if (DISTANCE(to, king) === 1) {
                add_attack(2, king - from, to - from);
                break;
              }
            }
          }
          // queen
          for (let pos = 0; (inc = QueenInc[pos]) !== IncNone; pos++) {
            for (let to = from + inc; SQUARE_IS_OK(to); to += inc) {
              if (DISTANCE(to, king) === 1) {
                add_attack(3, king - from, to - from);
                break;
              }
            }
          }
        }
      }
    }
  }
  for (let piece = 0; piece < 4; piece++) {
    for (let delta = 0; delta < 256; delta++) {
      const size = PieceDeltaSize[piece * 256 + delta];
      PieceDeltaDelta[(piece * 256 + delta) * 4 + size] = DeltaNone;
    }
  }
}

// add_attack()
function add_attack(piece: number, king: number, target: number): void {
  const index = piece * 256 + DeltaOffset + king;
  let size = PieceDeltaSize[index];
  for (let i = 0; i < size; i++) {
    if (PieceDeltaDelta[index * 4 + i] === target) return; // already in the table
  }
  if (size < 2) {
    PieceDeltaDelta[index * 4 + size] = target;
    size++;
    PieceDeltaSize[index] = size;
  }
}

// is_attacked()
export function is_attacked(board: board_t, to: number, colour: number): boolean {
  const square = board.square;
  // pawn attack
  let inc = PAWN_MOVE_INC(colour);
  const pawn = PAWN_MAKE(colour);
  if (square[to - (inc - 1)] === pawn) return true;
  if (square[to - (inc + 1)] === pawn) return true;
  // piece attack
  const list = board.piece;
  for (let p = colour * 32, from: number; (from = list[p]) !== SquareNone; p++) {
    const piece = square[from];
    const delta = to - from;
    if ((piece & DeltaMask[DeltaOffset + delta]) !== 0) {
      inc = DeltaIncAll[DeltaOffset + delta];
      let sq = from;
      do {
        sq += inc;
        if (sq === to) return true;
      } while (square[sq] === Empty);
    }
  }
  return false;
}

// line_is_empty()
export function line_is_empty(board: board_t, from: number, to: number): boolean {
  const delta = to - from;
  const inc = DeltaIncAll[DeltaOffset + delta];
  const square = board.square;
  let sq = from;
  do {
    sq += inc;
    if (sq === to) return true;
  } while (square[sq] === Empty);
  return false; // blocker
}

// is_pinned()
export function is_pinned(board: board_t, square: number, colour: number): boolean {
  const from = square;
  const to = KING_POS(board, colour);
  const inc = DeltaIncLine[DeltaOffset + to - from];
  if (inc === IncNone) return false; // not a line
  const sqs = board.square;
  let sq = from;
  do sq += inc; while (sqs[sq] === Empty);
  if (sq !== to) return false; // blocker
  sq = from;
  let piece: number;
  do sq -= inc; while ((piece = sqs[sq]) === Empty);
  return COLOUR_IS(piece, COLOUR_OPP(colour)) && SLIDER_ATTACK(piece, inc);
}

// attack_set()
export function attack_set(attack: attack_t, board: board_t): void {
  const square = board.square;
  // init
  attack.dn = 0;
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const to = KING_POS(board, me);
  // pawn attacks
  let inc = PAWN_MOVE_INC(opp);
  const pawn = PAWN_MAKE(opp);
  let from = to - (inc - 1);
  if (square[from] === pawn) {
    attack.ds[attack.dn] = from;
    attack.di[attack.dn] = IncNone;
    attack.dn++;
  }
  from = to - (inc + 1);
  if (square[from] === pawn) {
    attack.ds[attack.dn] = from;
    attack.di[attack.dn] = IncNone;
    attack.dn++;
  }
  // piece attacks
  const list = board.piece;
  for (let p = opp * 32 + 1; (from = list[p]) !== SquareNone; p++) { // HACK: no king
    const piece = square[from];
    const delta = to - from;
    if ((piece & DeltaMask[DeltaOffset + delta]) !== 0) {
      inc = IncNone;
      if (PIECE_IS_SLIDER(piece)) {
        // check for blockers
        inc = DeltaIncLine[DeltaOffset + delta];
        let sq = from;
        do sq += inc; while (square[sq] === Empty);
        if (sq !== to) continue; // blocker => next attacker
      }
      attack.ds[attack.dn] = from;
      attack.di[attack.dn] = -inc; // HACK
      attack.dn++;
    }
  }
  attack.ds[attack.dn] = SquareNone;
  attack.di[attack.dn] = IncNone;
}

// piece_attack_king()
export function piece_attack_king(board: board_t, piece: number, from: number, king: number): boolean {
  const code = PieceCode[piece];
  const base = (code * 256 + DeltaOffset + (king - from)) * 4;
  let delta: number;
  if (PIECE_IS_SLIDER(piece)) {
    for (let d = base; (delta = PieceDeltaDelta[d]) !== DeltaNone; d++) {
      const inc = DeltaIncLine[DeltaOffset + delta];
      const to = from + delta;
      let sq = from;
      do {
        sq += inc;
        if (sq === to && SQUARE_IS_OK(to)) {
          return true;
        }
      } while (board.square[sq] === Empty);
    }
  } else { // non-slider
    for (let d = base; (delta = PieceDeltaDelta[d]) !== DeltaNone; d++) {
      const to = from + delta;
      if (SQUARE_IS_OK(to)) {
        return true;
      }
    }
  }
  return false;
}
