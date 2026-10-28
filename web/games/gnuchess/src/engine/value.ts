// Port of src/engine/value.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { BB, BK, BN, BP, BQ, BR, Edge, Empty, WB, WK, WN, WP, WQ, WR } from './board.ts';
import { PieceNb } from './piece.ts';

// constants
export const ValuePawn = 100; // was 100
export const ValueKnight = 325; // was 300
export const ValueBishop = 325; // was 300
export const ValueRook = 500; // was 500
export const ValueQueen = 1000; // was 900
export const ValueKing = 10000; // was 10000

export const ValueNone = -32767;
export const ValueDraw = 0;
export const ValueMate = 30000;
export const ValueInf = ValueMate;
export const ValueEvalInf = ValueMate - 256; // handle mates upto 255 plies

// macros
export const VALUE_MATE = (height: number): number => -ValueMate + height;
export const VALUE_PIECE = (piece: number): number => ValuePiece[piece];

// variables
export const ValuePiece = new Int32Array(PieceNb);

// functions

// value_init()
export function value_init(): void {
  // ValuePiece[]
  for (let piece = 0; piece < PieceNb; piece++) ValuePiece[piece] = -1;
  ValuePiece[Empty] = 0; // needed?
  ValuePiece[Edge] = 0; // needed?
  ValuePiece[WP] = ValuePawn;
  ValuePiece[WN] = ValueKnight;
  ValuePiece[WB] = ValueBishop;
  ValuePiece[WR] = ValueRook;
  ValuePiece[WQ] = ValueQueen;
  ValuePiece[WK] = ValueKing;
  ValuePiece[BP] = ValuePawn;
  ValuePiece[BN] = ValueKnight;
  ValuePiece[BB] = ValueBishop;
  ValuePiece[BR] = ValueRook;
  ValuePiece[BQ] = ValueQueen;
  ValuePiece[BK] = ValueKing;
}

// value_is_ok()
export function value_is_ok(value: number): boolean {
  if (value < -ValueInf || value > +ValueInf) return false;
  return true;
}

// range_is_ok()
export function range_is_ok(min: number, max: number): boolean {
  if (!value_is_ok(min)) return false;
  if (!value_is_ok(max)) return false;
  if (min >= max) return false; // alpha-beta-like ranges cannot be null
  return true;
}

// value_is_mate()
export function value_is_mate(value: number): boolean {
  if (value < -ValueEvalInf || value > +ValueEvalInf) return true;
  return false;
}

// value_to_trans()
export function value_to_trans(value: number, height: number): number {
  if (value < -ValueEvalInf) {
    value -= height;
  } else if (value > +ValueEvalInf) {
    value += height;
  }
  return value;
}

// value_from_trans()
export function value_from_trans(value: number, height: number): number {
  if (value < -ValueEvalInf) {
    value += height;
  } else if (value > +ValueEvalInf) {
    value -= height;
  }
  return value;
}

// value_to_mate()
export function value_to_mate(value: number): number {
  if (value < -ValueEvalInf) {
    const dist = ((ValueMate + value) / 2) | 0;
    return -dist;
  } else if (value > +ValueEvalInf) {
    const dist = ((ValueMate - value + 1) / 2) | 0;
    return +dist;
  }
  return 0;
}
