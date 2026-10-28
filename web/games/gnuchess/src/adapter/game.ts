// Port of src/adapter/game.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { is_in_check } from './attack.ts';
import { board_can_play, board_copy, board_disp, board_t } from './board.ts';
import { Black, White } from './colour.ts';
import { board_from_fen, StartFen } from './fen.ts';
import { move_disp } from './move.ts';
import { move_do } from './move_do.ts';
import { BlackBishop12, BlackKnight12, BlackPawn12, BlackQueen12, BlackRook12, WhiteBishop12, WhiteKnight12, WhitePawn12, WhiteQueen12, WhiteRook12 } from './piece.ts';
import { square_colour } from './square.ts';
import { my_fatal, my_log } from './util.ts';

// constants

export const GameSize = 4096;

export const PLAYING = 0;
export const WHITE_MATES = 1;
export const BLACK_MATES = 2;
export const STALEMATE = 3;
export const DRAW_MATERIAL = 4;
export const DRAW_FIFTY = 5;
export const DRAW_REPETITION = 6;

// types

export class game_t {
   start_board = new board_t();
   board = new board_t();
   size = 0; // sint16
   pos = 0; // sint16
   status = 0; // sint8
   move = new Uint16Array(GameSize);
   key: bigint[] = new Array<bigint>(GameSize).fill(0n);
}

// variables

export const Game: game_t[] = []; // Game[0], made by game_reset()

/** reset for a new process (main_adapter) */
export function game_reset(): void {
   Game[0] = new game_t();
}

// functions

// game_is_ok()

export function game_is_ok(game: game_t): boolean {
   if (game.size < 0 || game.size > GameSize) return false;
   if (game.pos < 0 || game.pos > game.size) return false;
   return true; // UseSlowDebug is false
}

// game_clear()

export function game_clear(game: game_t): void {
   game_init(game, StartFen);
}

// game_init()

export function game_init(game: game_t, fen: string): boolean {
   if (!board_from_fen(game.start_board, fen)) return false;
   game.size = 0;
   board_copy(game.board, game.start_board);
   game.pos = 0;
   game_update(game);
   return true;
}

// game_status()

export function game_status(game: game_t): number {
   return game.status;
}

// game_size()

export function game_size(game: game_t): number {
   return game.size;
}

// game_pos()

export function game_pos(game: game_t): number {
   return game.pos;
}

// game_move()

export function game_move(game: game_t, pos: number): number {
   return game.move[pos];
}

// game_get_board()

export function game_get_board(game: game_t, board: board_t, pos = -1): void {
   let start: number;
   if (pos < 0) pos = game.pos;
   if (pos >= game.pos) { // forward from current position
      start = game.pos;
      board_copy(board, game.board);
   } else { // backward => replay the whole game
      start = 0;
      board_copy(board, game.start_board);
   }
   for (let i = start; i < pos; i++) move_do(board, game.move[i]);
}

// game_turn()

export function game_turn(game: game_t): number {
   return game.board.turn;
}

// game_move_nb()

export function game_move_nb(game: game_t): number {
   return game.board.move_nb;
}

// game_add_move()

export function game_add_move(game: game_t, move: number): void {
   if (game.pos >= GameSize) my_fatal('game_add_move(): game overflow\n');
   game.move[game.pos] = move;
   game.key[game.pos] = game.board.key;
   move_do(game.board, move);
   game.pos++;
   game.size = game.pos; // truncate game, HACK: before calling game_is_ok() in game_update()
   game_update(game);
}

// game_rem_move()

export function game_rem_move(game: game_t): void {
   game_goto(game, game.pos - 1);
   game.size = game.pos; // truncate game
}

// game_goto()

export function game_goto(game: game_t, pos: number): void {
   let i: number;
   if (pos < game.pos) { // going backward => replay the whole game
      board_copy(game.board, game.start_board);
      game.pos = 0;
   }
   for (i = game.pos; i < pos; i++) move_do(game.board, game.move[i]);
   game.pos = pos;
   game_update(game);
}

// game_disp()

export function game_disp(game: game_t): void {
   const board = new board_t();
   board_copy(board, game.start_board);
   board_disp(board);
   for (let i = 0; i < game.pos; i++) {
      const move = game.move[i];
      move_disp(move, board);
      move_do(board, move);
   }
   my_log('POLYGLOT\n');
   board_disp(board);
}

// game_update()

function game_update(game: game_t): void {
   game.status = game_comp_status(game);
}

// game_comp_status()

function game_comp_status(game: game_t): number {
   let i: number, n: number;
   let wb: number, bb: number;
   let start: number;
   // init
   const board = game.board;
   // mate and stalemate
   if (!board_can_play(board)) {
      if (is_in_check(board, Black)) { // HACK
         return WHITE_MATES;
      } else if (is_in_check(board, White)) { // HACK
         return BLACK_MATES;
      } else {
         return STALEMATE;
      }
   }
   // insufficient material
   if (board.number[WhitePawn12] === 0
    && board.number[BlackPawn12] === 0
    && board.number[WhiteQueen12] === 0
    && board.number[BlackQueen12] === 0
    && board.number[WhiteRook12] === 0
    && board.number[BlackRook12] === 0) {
      if (board.number[WhiteBishop12]
        + board.number[BlackBishop12]
        + board.number[WhiteKnight12]
        + board.number[BlackKnight12] <= 1) { // KK, KBK and KNK
         return DRAW_MATERIAL;
      } else if (board.number[WhiteBishop12] === 1
              && board.number[BlackBishop12] === 1
              && board.number[WhiteKnight12] === 0
              && board.number[BlackKnight12] === 0) {
         wb = board.list[White * 32 + 1]; // HACK
         bb = board.list[Black * 32 + 1]; // HACK
         if (square_colour(wb) === square_colour(bb)) { // KBKB
            return DRAW_MATERIAL;
         }
      }
   }
   // 50-move rule
   if (board.ply_nb >= 100) return DRAW_FIFTY;
   // position repetition
   const key = board.key;
   n = 0;
   start = game.pos - board.ply_nb;
   if (start < 0) start = 0;
   for (i = game.pos - 4; i >= start; i -= 2) {
      if (game.key[i] === key) {
         if (++n === 2) return DRAW_REPETITION;
      }
   }
   return PLAYING;
}
