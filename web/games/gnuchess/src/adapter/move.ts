// Port of src/adapter/move.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { board_copy, board_is_check, board_is_mate, board_t, SideA, SideH, SideNb } from './board.ts';
import { Black, colour_equal } from './colour.ts';
import { move_do } from './move_do.ts';
import { option_get_bool } from './option.ts';
import { Bishop64, Knight64, PieceNone64, piece_is_king, piece_is_pawn, piece_pawn_opp, piece_to_char, Queen64, Rook64 } from './piece.ts';
import { A1, A8, C1, C8, E1, E8, G1, G8, H1, H8, Rank8, SquareNone, square_from_64, square_from_string, square_rank, square_side_rank, square_to_64, square_to_string } from './square.ts';
import { my_log } from './util.ts';

// constants

export const MoveNone = 0; // HACK: a1a1 cannot be a legal move

export const MovePromoteKnight = 1 << 12;
export const MovePromoteBishop = 2 << 12;
export const MovePromoteRook = 3 << 12;
export const MovePromoteQueen = 4 << 12;

export const MoveFlags = 7 << 12;

// "constants"

const PromotePiece: readonly number[] = [PieceNone64, Knight64, Bishop64, Rook64, Queen64];

// functions

// move_is_ok()

export function move_is_ok(move: number): boolean {
   if (move < 0 || move >= 65536) return false;
   if (move === MoveNone) return false;
   return true;
}

// move_make()

export function move_make(from: number, to: number): number {
   return (square_to_64(from) << 6) | square_to_64(to);
}

// move_make_flags()

export function move_make_flags(from: number, to: number, flags: number): number {
   return (square_to_64(from) << 6) | square_to_64(to) | flags;
}

// move_from()

export function move_from(move: number): number {
   const from_64 = (move >> 6) & 0o77;
   return square_from_64(from_64);
}

// move_to()

export function move_to(move: number): number {
   const to_64 = move & 0o77;
   return square_from_64(to_64);
}

// move_promote_hack()

export function move_promote_hack(move: number): number {
   const code = move >> 12;
   return PromotePiece[code] ?? 0; // codes 5..7 read past the array in C
}

// move_is_capture()

export function move_is_capture(move: number, board: board_t): boolean {
   if (move_is_en_passant(move, board)) return true;
   if (board.square[move_to(move)] !== 0) return true;
   return false;
}

// move_is_promote()

export function move_is_promote(move: number): boolean {
   return (move & MoveFlags) !== 0;
}

// move_is_en_passant()

export function move_is_en_passant(move: number, board: board_t): boolean {
   return piece_is_pawn(move_piece(move, board))
      && move_to(move) === board.ep_square;
}

// move_is_castle()

export function move_is_castle(move: number, board: board_t): boolean {
   return colour_equal(board.square[move_to(move)], board.turn);
}

// move_piece()

export function move_piece(move: number, board: board_t): number {
   return board.square[move_from(move)];
}

// move_capture()

export function move_capture(move: number, board: board_t): number {
   if (move_is_en_passant(move, board)) {
      return piece_pawn_opp(move_piece(move, board));
   }
   return board.square[move_to(move)];
}

// move_promote()

export function move_promote(move: number, board: board_t): number {
   if (move_is_promote(move)) {
      const code = move >> 12;
      return (PromotePiece[code] ?? 0) | board.turn;
   }
   return 0; // Empty
}

// move_is_check()

export function move_is_check(move: number, board: board_t): boolean {
   const new_board = new board_t();
   board_copy(new_board, board);
   move_do(new_board, move);
   return board_is_check(new_board);
}

// move_is_mate()

export function move_is_mate(move: number, board: board_t): boolean {
   const new_board = new board_t();
   board_copy(new_board, board);
   move_do(new_board, move);
   return board_is_mate(new_board);
}

// move_to_can()

export function move_to_can(move: number, board: board_t): string {
   // init
   const from = move_from(move);
   let to = move_to(move);
   // king-slide castling
   if (move_is_castle(move, board) && !option_get_bool('Chess960')) {
      if (from === E1 && to === H1) {
         to = G1;
      } else if (from === E1 && to === A1) {
         to = C1;
      } else if (from === E8 && to === H8) {
         to = G8;
      } else if (from === E8 && to === A8) {
         to = C8;
      }
   }
   // normal moves
   let string = square_to_string(from) + square_to_string(to);
   // promotes
   if (move_is_promote(move)) {
      string += piece_to_char(move_promote_hack(move) | Black); // HACK: black => lower-case
   }
   return string;
}

// move_from_can()

export function move_from_can(string: string, board: board_t): number {
   let from: number, to: number;
   let side: number;
   let move: number;
   const at = (i: number): string => (i < string.length ? string[i] : '\0');
   // from
   from = square_from_string(at(0) + at(1));
   if (from === SquareNone) return MoveNone;
   // to
   to = square_from_string(at(2) + at(3));
   if (to === SquareNone) return MoveNone;
   // convert "king slide" castling to KxR
   if (piece_is_king(board.square[from])
    && square_rank(to) === square_rank(from)
    && Math.abs(to - from) > 1) {
      side = to > from ? SideH : SideA;
      to = board.castle[board.turn * SideNb + side];
      if (to === SquareNone) return MoveNone;
   }
   // move
   move = move_make(from, to);
   // promote
   switch (at(4)) {
      case '\0': // not a promotion
         if (piece_is_pawn(board.square[from])
          && square_side_rank(to, board.turn) === Rank8
          && option_get_bool('PromoteWorkAround')) {
            move |= MovePromoteQueen;
         }
         break;
      case 'N':
      case 'n':
         move |= MovePromoteKnight;
         break;
      case 'B':
      case 'b':
         move |= MovePromoteBishop;
         break;
      case 'R':
      case 'r':
         move |= MovePromoteRook;
         break;
      case 'Q':
      case 'q':
         move |= MovePromoteQueen;
         break;
      default:
         return MoveNone;
   }
   return move;
}

// move_order()

export function move_order(move: number): number {
   return ((move & 0o7777) << 3) | (move >> 12); // from, to, promote
}

// move_disp()

export function move_disp(move: number, board: board_t): void {
   const string = move_to_can(move, board);
   my_log('POLYGLOT %s\n', string);
}
