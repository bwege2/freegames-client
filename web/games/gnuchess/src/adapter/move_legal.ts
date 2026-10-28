// Port of src/adapter/move_legal.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { is_in_check } from './attack.ts';
import { board_copy, board_t } from './board.ts';
import { colour_opp } from './colour.ts';
import { list_contain, list_move, list_size, list_t, list_value } from './list.ts';
import { move_do } from './move_do.ts';
import { gen_moves } from './move_gen.ts';

// functions

// move_is_pseudo()

export function move_is_pseudo(move: number, board: board_t): boolean {
   const list = new list_t();
   gen_moves(list, board);
   return list_contain(list, move);
}

// pseudo_is_legal()

const scratch = { board: null as board_t | null };

export function pseudo_is_legal(move: number, board: board_t): boolean {
   const new_board = scratch.board ?? (scratch.board = new board_t());
   board_copy(new_board, board);
   move_do(new_board, move);
   return !is_in_check(new_board, colour_opp(new_board.turn));
}

// move_is_legal()

export function move_is_legal(move: number, board: board_t): boolean {
   return move_is_pseudo(move, board) && pseudo_is_legal(move, board);
}

// filter_legal()

export function filter_legal(list: list_t, board: board_t): void {
   let pos = 0;
   for (let i = 0; i < list_size(list); i++) {
      const move = list_move(list, i);
      const value = list_value(list, i);
      if (pseudo_is_legal(move, board)) {
         list.move[pos] = move;
         list.value[pos] = value;
         pos++;
      }
   }
   list.size = pos;
}
