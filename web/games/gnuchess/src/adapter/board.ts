// Port of src/adapter/board.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// board_t's arrays of arrays are flat typed arrays: list[colour][pos] is list[colour*32+pos],
// castle[colour][side] is castle[colour*SideNb+side].

import { Black, ColourNb, colour_equal, colour_is_black, White } from './colour.ts';
import { board_from_fen, board_to_fen, StartFen } from './fen.ts';
import { hash_key } from './hash.ts';
import { list_move, list_size, list_t } from './list.ts';
import { gen_legal_moves, gen_moves } from './move_gen.ts';
import { pseudo_is_legal } from './move_legal.ts';
import { Knight64, piece_is_king, piece_to_12, piece_to_char } from './piece.ts';
import { is_in_check } from './attack.ts';
import { SquareNb, SquareNone, square_from_64, square_make } from './square.ts';
import { my_log } from './util.ts';

// constants

export const Empty = 0;

export const SideH = 0;
export const SideA = 1;
export const SideNb = 2;

// types

export class board_t {
   square = new Uint8Array(SquareNb);
   pos = new Int8Array(SquareNb);
   list = new Uint8Array(ColourNb * 32);
   list_size = new Int8Array(ColourNb);
   number = new Int8Array(12);
   turn = 0; // sint8
   castle = new Uint8Array(ColourNb * SideNb);
   ep_square = 0; // uint8
   ply_nb = 0; // sint16
   move_nb = 0; // sint16
   key = 0n; // uint64
}

export const s16 = (n: number): number => (n << 16) >> 16;

// functions

// board_is_ok()

export function board_is_ok(_board: board_t): boolean {
   return true; // UseSlowDebug is false
}

// board_clear()

export function board_clear(board: board_t): void {
   let file: number, rank: number, sq: number;
   let colour: number, pos: number;
   let piece: number;
   // edge squares
   for (sq = 0; sq < SquareNb; sq++) {
      board.square[sq] = Knight64; // HACK: uncoloured knight
      board.pos[sq] = -1;
   }
   // empty squares
   for (rank = 0; rank < 8; rank++) {
      for (file = 0; file < 8; file++) {
         sq = square_make(file, rank);
         board.square[sq] = Empty;
      }
   }
   // piece lists
   for (colour = 0; colour < 3; colour++) {
      for (pos = 0; pos < 32; pos++) { // HACK
         board.list[colour * 32 + pos] = SquareNone;
      }
      board.list_size[colour] = 0;
   }
   // material
   for (piece = 0; piece < 12; piece++) {
      board.number[piece] = 0;
   }
   // rest
   board.turn = 0; // ColourNone
   board.castle[White * SideNb + SideH] = SquareNone;
   board.castle[White * SideNb + SideA] = SquareNone;
   board.castle[Black * SideNb + SideH] = SquareNone;
   board.castle[Black * SideNb + SideA] = SquareNone;
   board.ep_square = SquareNone;
   board.ply_nb = 0;
   board.move_nb = 0;
   board.key = 0n;
}

// board_start()

export function board_start(board: board_t): void {
   board_from_fen(board, StartFen);
}

// board_copy()

export function board_copy(dst: board_t, src: board_t): void {
   dst.square.set(src.square);
   dst.pos.set(src.pos);
   dst.list.set(src.list);
   dst.list_size.set(src.list_size);
   dst.number.set(src.number);
   dst.turn = src.turn;
   dst.castle.set(src.castle);
   dst.ep_square = src.ep_square;
   dst.ply_nb = src.ply_nb;
   dst.move_nb = src.move_nb;
   dst.key = src.key;
}

// board_equal()

export function board_equal(board_1: board_t, board_2: board_t): boolean {
   let sq_64: number, sq: number;
   // fast comparison
   if (board_1.key !== board_2.key) return false;
   // slow comparison
   for (sq_64 = 0; sq_64 < 64; sq_64++) {
      sq = square_from_64(sq_64);
      if (board_1.square[sq] !== board_2.square[sq]) return false;
   }
   if (board_1.turn !== board_2.turn) return false;
   for (let i = 0; i < ColourNb * SideNb; i++) {
      if (board_1.castle[i] !== board_2.castle[i]) return false;
   }
   if (board_1.ep_square !== board_2.ep_square) return false;
   return true;
}

// board_init_list()

export function board_init_list(board: board_t): void {
   let sq_64: number, sq: number, piece: number;
   let colour: number, pos: number;
   // init
   for (sq_64 = 0; sq_64 < 64; sq_64++) {
      sq = square_from_64(sq_64);
      board.pos[sq] = -1;
   }
   for (piece = 0; piece < 12; piece++) board.number[piece] = 0;
   for (colour of [White, Black]) {
      // piece list: the king first, then the other pieces
      pos = 0;
      for (sq_64 = 0; sq_64 < 64; sq_64++) {
         sq = square_from_64(sq_64);
         piece = board.square[sq];
         if (colour_equal(piece, colour) && piece_is_king(piece)) {
            board.pos[sq] = pos;
            board.list[colour * 32 + pos] = sq;
            pos++;
            board.number[piece_to_12(piece)]++;
         }
      }
      for (sq_64 = 0; sq_64 < 64; sq_64++) {
         sq = square_from_64(sq_64);
         piece = board.square[sq];
         if (colour_equal(piece, colour) && !piece_is_king(piece)) {
            board.pos[sq] = pos;
            board.list[colour * 32 + pos] = sq;
            pos++;
            board.number[piece_to_12(piece)]++;
         }
      }
      board.list[colour * 32 + pos] = SquareNone;
      board.list_size[colour] = pos;
   }
   // hash key
   board.key = hash_key(board);
}

// board_flags()

export function board_flags(board: board_t): number {
   let flags = 0;
   if (board.castle[White * SideNb + SideH] !== SquareNone) flags |= 1 << 0;
   if (board.castle[White * SideNb + SideA] !== SquareNone) flags |= 1 << 1;
   if (board.castle[Black * SideNb + SideH] !== SquareNone) flags |= 1 << 2;
   if (board.castle[Black * SideNb + SideA] !== SquareNone) flags |= 1 << 3;
   return flags;
}

// board_can_play()

export function board_can_play(board: board_t): boolean {
   const list = new list_t();
   gen_moves(list, board);
   for (let i = 0; i < list_size(list); i++) {
      const move = list_move(list, i);
      if (pseudo_is_legal(move, board)) return true;
   }
   return false; // no legal move
}

// board_mobility()

export function board_mobility(board: board_t): number {
   const list = new list_t();
   gen_legal_moves(list, board);
   return list_size(list);
}

// board_is_check()

export function board_is_check(board: board_t): boolean {
   return is_in_check(board, board.turn);
}

// board_is_mate()

export function board_is_mate(board: board_t): boolean {
   if (!board_is_check(board)) return false;
   if (board_can_play(board)) return false;
   return true;
}

// board_is_stalemate()

export function board_is_stalemate(board: board_t): boolean {
   if (board_is_check(board)) return false;
   if (board_can_play(board)) return false;
   return true;
}

// king_pos()

export function king_pos(board: board_t, colour: number): number {
   return board.list[colour * 32];
}

// board_disp()

export function board_disp(board: board_t): void {
   let file: number, rank: number, sq: number;
   let piece: number, c: string;
   const fen = board_to_fen(board);
   my_log('POLYGLOT %s\n', fen);
   my_log('POLYGLOT\n');
   for (rank = 7; rank >= 0; rank--) {
      my_log('POLYGLOT ');
      for (file = 0; file < 8; file++) {
         sq = square_make(file, rank);
         piece = board.square[sq];
         c = piece !== Empty ? piece_to_char(piece) : '-';
         my_log('%c ', c);
      }
      my_log('\n');
   }
   my_log('POLYGLOT\n');
   my_log('POLYGLOT %s to play\n', colour_is_black(board.turn) ? 'black' : 'white');
   my_log('POLYGLOT\n');
}
