// Port of src/engine/vector.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { KingInc } from './piece.ts';

// "constants"
export const IncNone = 0;
export const IncNb = 2 * 17 + 1;
export const IncOffset = 17;

export const DeltaNone = 0;
export const DeltaNb = 2 * 119 + 1;
export const DeltaOffset = 119;

// variables
export const Distance = new Int32Array(DeltaNb);

// macros
export const DISTANCE = (square_1: number, square_2: number): number => Distance[DeltaOffset + (square_2 - square_1)];

// functions

// vector_init()
export function vector_init(): void {
  // Distance[]
  for (let delta = 0; delta < DeltaNb; delta++) Distance[delta] = -1;
  for (let y = -7; y <= +7; y++) {
    for (let x = -7; x <= +7; x++) {
      const delta = y * 16 + x;
      let dist = 0;
      let tmp = x;
      if (tmp < 0) tmp = -tmp;
      if (tmp > dist) dist = tmp;
      tmp = y;
      if (tmp < 0) tmp = -tmp;
      if (tmp > dist) dist = tmp;
      Distance[DeltaOffset + delta] = dist;
    }
  }
}

// delta_is_ok()
export function delta_is_ok(delta: number): boolean {
  if (delta < -119 || delta > +119) return false;
  if ((delta & 0xf) === 8) return false; // HACK: delta % 16 would be ill-defined for negative numbers
  return true;
}

// inc_is_ok()
export function inc_is_ok(inc: number): boolean {
  for (let dir = 0; dir < 8; dir++) {
    if (KingInc[dir] === inc) return true;
  }
  return false;
}
