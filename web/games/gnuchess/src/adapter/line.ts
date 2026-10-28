// Port of src/adapter/line.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// A line is a Uint16Array of moves ended by MoveNone.

import { board_copy, board_disp, board_t } from './board.ts';
import { move_from_can, move_is_ok, move_to_can, MoveNone } from './move.ts';
import { move_is_legal } from './move_legal.ts';
import { move_do } from './move_do.ts';
import { move_to_san } from './san.ts';
import { my_fatal, my_log } from './util.ts';

// constants

export const LineSize = 256;

const Strict = false; // false
const UseDebug = false; // false

// functions

export function line_new(): Uint16Array {
   return new Uint16Array(LineSize);
}

// line_is_ok()

export function line_is_ok(line: Uint16Array): boolean {
   let move: number;
   for (let i = 0; (move = line[i]) !== MoveNone; i++) {
      if (!move_is_ok(move)) return false;
   }
   return true;
}

// line_clear()

export function line_clear(line: Uint16Array): void {
   line[0] = MoveNone;
}

// line_copy()

export function line_copy(dst: Uint16Array, src: Uint16Array): void {
   let i = 0;
   while ((dst[i] = src[i]) !== MoveNone) i++;
}

// line_from_can()

export function line_from_can(line: Uint16Array, board: board_t, string: string, size: number): boolean {
   let pos = 0;
   const new_board = new board_t();
   // init
   board_copy(new_board, board);
   // loop
   for (const p of string.split(' ').filter((t) => t !== '')) { // strtok(new_string," ")
      const move = move_from_can(p, new_board);
      if (move === MoveNone || !move_is_legal(move, new_board)) break; // HACK: ignore illegal moves
      if (pos >= size) return false;
      line[pos++] = move;
      move_do(new_board, move);
   }
   if (pos >= size) return false;
   line[pos] = MoveNone;
   return true;
}

// line_to_can()

export function line_to_can(line: Uint16Array, board: board_t): string {
   const new_board = new board_t();
   let move: number;
   let string = '';
   // init
   board_copy(new_board, board);
   // loop
   for (let i = 0; (move = line[i]) !== MoveNone; i++) {
      if (i !== 0) string += ' ';
      string += move_to_can(move, new_board);
      move_do(new_board, move);
   }
   return string;
}

// line_to_san()

export function line_to_san(line: Uint16Array, board: board_t): string {
   const new_board = new board_t();
   let move: number;
   let string = '';
   // init
   board_copy(new_board, board);
   // loop
   for (let i = 0; (move = line[i]) !== MoveNone; i++) {
      if (string.length !== 0) string += ' ';
      if (!move_is_legal(move, new_board)) {
         if (Strict || UseDebug) {
            const move_string = move_to_can(move, new_board);
            my_log('POLYGLOT ILLEGAL MOVE IN LINE %s\n', move_string);
            board_disp(new_board);
         }
         if (Strict) my_fatal('line_to_san(): illegal move\n');
         break;
      }
      string += move_to_san(move, new_board);
      move_do(new_board, move);
   }
   return string;
}
