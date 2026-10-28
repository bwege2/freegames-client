// Port of src/engine/pv.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// A PV is a Uint16Array (mv_t[]) ending with MoveNone.

import { move_is_ok, move_to_string, MoveNone } from './move.ts';

// macros
export const PV_CLEAR = (pv: Uint16Array): void => {
  pv[0] = MoveNone;
};

// functions

// pv_is_ok()
export function pv_is_ok(pv: Uint16Array): boolean {
  for (let pos = 0; true; pos++) {
    if (pos >= 256) return false;
    const move = pv[pos];
    if (move === MoveNone) return true;
    if (!move_is_ok(move)) return false;
  }
}

// pv_copy()
export function pv_copy(dst: Uint16Array, src: Uint16Array): void {
  let i = 0;
  while ((dst[i] = src[i]) !== MoveNone) i++;
}

// pv_cat()
export function pv_cat(dst: Uint16Array, src: Uint16Array, move: number): void {
  dst[0] = move;
  let i = 0;
  while ((dst[i + 1] = src[i]) !== MoveNone) i++;
}

// pv_to_string()
export function pv_to_string(pv: Uint16Array): string {
  let string = '';
  let move: number;
  for (let i = 0; (move = pv[i]) !== MoveNone; i++) {
    if (i !== 0) string += ' ';
    string += move_to_string(move);
  }
  return string;
}
