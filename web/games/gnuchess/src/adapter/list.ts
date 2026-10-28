// Port of src/adapter/list.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import type { board_t } from './board.ts';
import { move_order, move_to_can } from './move.ts';
import { my_log } from './util.ts';

// constants

export const ListSize = 256;

// types

export class list_t {
   size = 0; // sint16
   move = new Uint16Array(ListSize);
   value = new Int16Array(ListSize);
}

// functions

// list_is_ok()

export function list_is_ok(list: list_t): boolean {
   if (list.size >= ListSize) return false;
   return true;
}

// list_clear()

export function list_clear(list: list_t): void {
   list.size = 0;
}

// list_add()

export function list_add(list: list_t, move: number, value = 0): void {
   list.move[list.size] = move;
   list.value[list.size] = value;
   list.size++;
}

// list_remove()

export function list_remove(list: list_t, index: number): void {
   for (let i = index; i < list.size - 1; i++) {
      list.move[i] = list.move[i + 1];
      list.value[i] = list.value[i + 1];
   }
   list.size--;
}

// list_is_empty()

export function list_is_empty(list: list_t): boolean {
   return list.size === 0;
}

// list_size()

export function list_size(list: list_t): number {
   return list.size;
}

// list_move()

export function list_move(list: list_t, index: number): number {
   return list.move[index];
}

// list_value()

export function list_value(list: list_t, index: number): number {
   return list.value[index];
}

// list_copy()

export function list_copy(dst: list_t, src: list_t): void {
   dst.size = src.size;
   for (let i = 0; i < src.size; i++) {
      dst.move[i] = src.move[i];
      dst.value[i] = src.value[i];
   }
}

// list_move_to_front()

export function list_move_to_front(list: list_t, index: number): void {
   if (index !== 0) {
      const move = list.move[index];
      const value = list.value[index];
      for (let i = index; i > 0; i--) {
         list.move[i] = list.move[i - 1];
         list.value[i] = list.value[i - 1];
      }
      list.move[0] = move;
      list.value[0] = value;
   }
}

// list_note()

export function list_note(list: list_t): void {
   for (let i = 0; i < list.size; i++) {
      const move = list.move[i];
      list.value[i] = -move_order(move);
   }
}

// list_sort()

export function list_sort(list: list_t): void {
   let i: number, j: number;
   let best_index: number, best_move: number, best_value: number;
   for (i = 0; i < list.size - 1; i++) {
      best_index = i;
      best_value = list.value[i];
      for (j = i + 1; j < list.size; j++) {
         if (list.value[j] > best_value) {
            best_index = j;
            best_value = list.value[j];
         }
      }
      if (best_index !== i) {
         best_move = list.move[best_index];
         for (j = best_index; j > i; j--) {
            list.move[j] = list.move[j - 1];
            list.value[j] = list.value[j - 1];
         }
         list.move[i] = best_move;
         list.value[i] = best_value;
      }
   }
}

// list_contain()

export function list_contain(list: list_t, move: number): boolean {
   for (let i = 0; i < list.size; i++) {
      if (list.move[i] === move) return true;
   }
   return false;
}

// list_equal()

export function list_equal(list_1: list_t, list_2: list_t): boolean {
   const copy_1 = new list_t(), copy_2 = new list_t();
   if (list_1.size !== list_2.size) return false;
   list_copy(copy_1, list_1);
   list_note(copy_1);
   list_sort(copy_1);
   list_copy(copy_2, list_2);
   list_note(copy_2);
   list_sort(copy_2);
   for (let i = 0; i < copy_1.size; i++) {
      if (copy_1.move[i] !== copy_2.move[i]) return false;
   }
   return true;
}

// list_disp()

export function list_disp(list: list_t, board: board_t): void {
   for (let i = 0; i < list.size; i++) {
      const move = list.move[i];
      const value = list.value[i];
      const string = move_to_can(move, board);
      my_log('POLYGLOT %-5s %04X %+4d\n', string, move, value);
   }
   my_log('POLYGLOT\n');
}
