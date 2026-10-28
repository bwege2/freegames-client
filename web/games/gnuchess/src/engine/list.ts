// Port of src/engine/list.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import type { board_t } from './board.ts';
import { move_order } from './move.ts';

// constants
export const ListSize = 256;

// types
export class list_t {
  size = 0;
  move = new Uint16Array(ListSize);
  value = new Int16Array(ListSize);
}

export type move_test_t = (move: number, board: board_t) => boolean;

// macros
export const LIST_CLEAR = (list: list_t): void => {
  list.size = 0;
};
export const LIST_ADD = (list: list_t, mv: number): void => {
  list.move[list.size++] = mv;
};
export const LIST_IS_EMPTY = (list: list_t): boolean => list.size === 0;
export const LIST_SIZE = (list: list_t): number => list.size;
export const LIST_MOVE = (list: list_t, pos: number): number => list.move[pos];
export const LIST_VALUE = (list: list_t, pos: number): number => list.value[pos];

// functions

// list_is_ok()
export function list_is_ok(list: list_t): boolean {
  if (list.size < 0 || list.size >= ListSize) return false;
  return true;
}

// list_remove()
export function list_remove(list: list_t, pos: number): void {
  for (let i = pos; i < list.size - 1; i++) {
    list.move[i] = list.move[i + 1];
    list.value[i] = list.value[i + 1];
  }
  list.size--;
}

// list_copy()
export function list_copy(dst: list_t, src: list_t): void {
  dst.size = src.size;
  for (let i = 0; i < src.size; i++) {
    dst.move[i] = src.move[i];
    dst.value[i] = src.value[i];
  }
}

// list_sort()
export function list_sort(list: list_t): void {
  const moves = list.move, values = list.value;
  // init
  const size = list.size;
  values[size] = -32768; // HACK: sentinel
  // insert sort (stable)
  for (let i = size - 2; i >= 0; i--) {
    const move = moves[i];
    const value = values[i];
    let j: number;
    for (j = i; value < values[j + 1]; j++) {
      moves[j] = moves[j + 1];
      values[j] = values[j + 1];
    }
    moves[j] = move;
    values[j] = value;
  }
}

// list_contain()
export function list_contain(list: list_t, move: number): boolean {
  for (let i = 0; i < list.size; i++) {
    if (list.move[i] === move) return true;
  }
  return false;
}

// list_note()
export function list_note(list: list_t): void {
  for (let i = 0; i < list.size; i++) {
    const move = list.move[i];
    list.value[i] = -move_order(move);
  }
}

// list_filter()
export function list_filter(list: list_t, board: board_t, test: move_test_t, keep: boolean): void {
  let pos = 0;
  for (let i = 0; i < LIST_SIZE(list); i++) {
    const move = LIST_MOVE(list, i);
    const value = LIST_VALUE(list, i);
    if (test(move, board) === keep) {
      list.move[pos] = move;
      list.value[pos] = value;
      pos++;
    }
  }
  list.size = pos;
}
