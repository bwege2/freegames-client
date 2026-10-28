// Port of src/adapter/move_gen.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { BishopInc, IncNone, is_attacked, is_in_check, KingInc, KnightInc, QueenInc, RookInc } from './attack.ts';
import { king_pos, SideA, SideH, SideNb, type board_t } from './board.ts';
import { colour_equal, colour_is_white, colour_opp } from './colour.ts';
import { list_add, list_clear, type list_t } from './list.ts';
import { move_make, MovePromoteBishop, MovePromoteKnight, MovePromoteQueen, MovePromoteRook } from './move.ts';
import { filter_legal } from './move_legal.ts';
import { Bishop64, BlackPawn64, King64, Knight64, piece_type, Queen64, Rook64, WhitePawn64 } from './piece.ts';
import { FileC, FileD, FileF, FileG, Rank1, Rank2, Rank7, Rank8, SquareNone, square_is_promote, square_make, square_rank } from './square.ts';

// functions

// gen_legal_moves()

export function gen_legal_moves(list: list_t, board: board_t): void {
   gen_moves(list, board);
   filter_legal(list, board);
}

// gen_moves()

export function gen_moves(list: list_t, board: board_t): void {
   list_clear(list);
   add_all_moves(list, board);
   if (!is_in_check(board, board.turn)) add_castle_moves(list, board);
}

// add_all_moves()

function add_all_moves(list: list_t, board: board_t): void {
   let from: number, to: number;
   let inc: number;
   let piece: number, capture: number;
   const me = board.turn;
   const opp = colour_opp(me);
   for (let p = me * 32; (from = board.list[p]) !== SquareNone; p++) {
      piece = board.square[from];
      switch (piece_type(piece)) {
         case WhitePawn64:
            to = from + 15;
            if (to === board.ep_square || colour_equal(board.square[to], opp)) {
               add_pawn_move(list, from, to);
            }
            to = from + 17;
            if (to === board.ep_square || colour_equal(board.square[to], opp)) {
               add_pawn_move(list, from, to);
            }
            to = from + 16;
            if (board.square[to] === 0) {
               add_pawn_move(list, from, to);
               if (square_rank(from) === Rank2) {
                  to = from + 32;
                  if (board.square[to] === 0) {
                     list_add(list, move_make(from, to));
                  }
               }
            }
            break;
         case BlackPawn64:
            to = from - 17;
            if (to === board.ep_square || colour_equal(board.square[to], opp)) {
               add_pawn_move(list, from, to);
            }
            to = from - 15;
            if (to === board.ep_square || colour_equal(board.square[to], opp)) {
               add_pawn_move(list, from, to);
            }
            to = from - 16;
            if (board.square[to] === 0) {
               add_pawn_move(list, from, to);
               if (square_rank(from) === Rank7) {
                  to = from - 32;
                  if (board.square[to] === 0) {
                     list_add(list, move_make(from, to));
                  }
               }
            }
            break;
         case Knight64:
            for (let i = 0; (inc = KnightInc[i]) !== IncNone; i++) {
               to = from + inc;
               capture = board.square[to];
               if (capture === 0 || colour_equal(capture, opp)) {
                  list_add(list, move_make(from, to));
               }
            }
            break;
         case Bishop64:
            for (let i = 0; (inc = BishopInc[i]) !== IncNone; i++) {
               for (to = from + inc; (capture = board.square[to]) === 0; to += inc) {
                  list_add(list, move_make(from, to));
               }
               if (colour_equal(capture, opp)) {
                  list_add(list, move_make(from, to));
               }
            }
            break;
         case Rook64:
            for (let i = 0; (inc = RookInc[i]) !== IncNone; i++) {
               for (to = from + inc; (capture = board.square[to]) === 0; to += inc) {
                  list_add(list, move_make(from, to));
               }
               if (colour_equal(capture, opp)) {
                  list_add(list, move_make(from, to));
               }
            }
            break;
         case Queen64:
            for (let i = 0; (inc = QueenInc[i]) !== IncNone; i++) {
               for (to = from + inc; (capture = board.square[to]) === 0; to += inc) {
                  list_add(list, move_make(from, to));
               }
               if (colour_equal(capture, opp)) {
                  list_add(list, move_make(from, to));
               }
            }
            break;
         case King64:
            for (let i = 0; (inc = KingInc[i]) !== IncNone; i++) {
               to = from + inc;
               capture = board.square[to];
               if (capture === 0 || colour_equal(capture, opp)) {
                  list_add(list, move_make(from, to));
               }
            }
            break;
         default:
            break;
      }
   }
}

// add_castle_moves()

function add_castle_moves(list: list_t, board: board_t): void {
   let king_from: number, king_to: number;
   let rook_from: number, rook_to: number;
   let legal: boolean;
   let inc: number;
   let sq: number;
   const me = board.turn;
   const opp = colour_opp(me);
   const rank = colour_is_white(me) ? Rank1 : Rank8;
   // h-side castling
   if (board.castle[me * SideNb + SideH] !== SquareNone) {
      king_from = king_pos(board, me);
      king_to = square_make(FileG, rank);
      rook_from = board.castle[me * SideNb + SideH];
      rook_to = square_make(FileF, rank);
      legal = true;
      if (king_to !== king_from) {
         inc = king_to > king_from ? +1 : -1;
         for (sq = king_from + inc; true; sq += inc) {
            if (sq !== rook_from && board.square[sq] !== 0) legal = false;
            if (is_attacked(board, sq, opp)) legal = false;
            if (sq === king_to) break;
         }
      }
      if (rook_to !== rook_from) {
         inc = rook_to > rook_from ? +1 : -1;
         for (sq = rook_from + inc; true; sq += inc) {
            if (sq !== king_from && board.square[sq] !== 0) legal = false;
            if (sq === rook_to) break;
         }
      }
      if (legal) list_add(list, move_make(king_from, rook_from));
   }
   // a-side castling
   if (board.castle[me * SideNb + SideA] !== SquareNone) {
      king_from = king_pos(board, me);
      king_to = square_make(FileC, rank);
      rook_from = board.castle[me * SideNb + SideA];
      rook_to = square_make(FileD, rank);
      legal = true;
      if (king_to !== king_from) {
         inc = king_to > king_from ? +1 : -1;
         for (sq = king_from + inc; true; sq += inc) {
            if (sq !== rook_from && board.square[sq] !== 0) legal = false;
            if (is_attacked(board, sq, opp)) legal = false;
            if (sq === king_to) break;
         }
      }
      if (rook_to !== rook_from) {
         inc = rook_to > rook_from ? +1 : -1;
         for (sq = rook_from + inc; true; sq += inc) {
            if (sq !== king_from && board.square[sq] !== 0) legal = false;
            if (sq === rook_to) break;
         }
      }
      if (legal) list_add(list, move_make(king_from, rook_from));
   }
}

// add_pawn_move()

function add_pawn_move(list: list_t, from: number, to: number): void {
   const move = move_make(from, to);
   if (square_is_promote(to)) {
      list_add(list, move | MovePromoteKnight);
      list_add(list, move | MovePromoteBishop);
      list_add(list, move | MovePromoteRook);
      list_add(list, move | MovePromoteQueen);
   } else {
      list_add(list, move);
   }
}
