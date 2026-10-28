// Port of src/adapter/san.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { is_pinned, piece_attack } from './attack.ts';
import { king_pos, SideA, SideH, SideNb, type board_t } from './board.ts';
import { colour_is_white } from './colour.ts';
import { list_move, list_size, list_t } from './list.ts';
import { move_from, move_is_capture, move_is_castle, move_is_mate, move_is_check, move_is_promote, move_make, move_piece, move_promote, move_to, MoveNone, MovePromoteBishop, MovePromoteKnight, MovePromoteQueen, MovePromoteRook } from './move.ts';
import { gen_legal_moves } from './move_gen.ts';
import { char_is_piece, piece_is_king, piece_is_pawn, piece_make_pawn, piece_to_char } from './piece.ts';
import { char_is_file, char_is_rank, file_to_char, Rank4, rank_to_char, SquareNone, square_file, square_from_string, square_rank, square_side_rank, square_to_string } from './square.ts';
import { toupper } from '../libc.ts';

// constants

const AMBIGUITY_NONE = 0;
const AMBIGUITY_FILE = 1;
const AMBIGUITY_RANK = 2;
const AMBIGUITY_SQUARE = 3;

// functions

// move_to_san()

export function move_to_san(move: number, board: board_t): string {
   // init
   const from = move_from(move);
   const to = move_to(move);
   let string = '';
   check: {
      // castle
      if (move_is_castle(move, board)) {
         if (to > from) {
            string += 'O-O';
         } else {
            string += 'O-O-O';
         }
         break check;
      }
      // from
      const piece = board.square[from];
      if (piece_is_pawn(piece)) {
         // pawn
         if (move_is_capture(move, board)) {
            string += file_to_char(square_file(from));
         }
      } else {
         // piece
         string += toupper(piece_to_char(piece));
         // ambiguity
         switch (ambiguity(move, board)) {
            case AMBIGUITY_NONE:
               break;
            case AMBIGUITY_FILE:
               string += file_to_char(square_file(from));
               break;
            case AMBIGUITY_RANK:
               string += rank_to_char(square_rank(from));
               break;
            case AMBIGUITY_SQUARE:
               string += square_to_string(from);
               break;
            default:
               break;
         }
      }
      // capture
      if (move_is_capture(move, board)) string += 'x';
      // to
      string += square_to_string(to);
      // promote
      if (move_is_promote(move)) {
         string += '=' + toupper(piece_to_char(move_promote(move, board)));
      }
   }
   // check
   // check:
   if (move_is_mate(move, board)) {
      string += '#';
   } else if (move_is_check(move, board)) {
      string += '+';
   }
   return string;
}

// move_from_san()

export function move_from_san(string: string, board: board_t): number {
   const s = san_to_lan(string, board).string; // the result of san_to_lan() is not checked
   return move_from_lan(s, board);
}

// move_from_san_debug()

export function move_from_san_debug(string: string, board: board_t): number {
   const list = new list_t();
   gen_legal_moves(list, board);
   for (let i = 0; i < list_size(list); i++) {
      const move = list_move(list, i);
      if (move_to_san(move, board) === string) return move;
   }
   return MoveNone;
}

// san_to_lan()

function san_to_lan(san: string, board: board_t): { ok: boolean; string: string } {
   let c: string;
   const string = '???????'.split('');
   const done = (ok: boolean) => ({ ok, string: string.join('') });
   // init
   const len = san.length;
   let left = 0;
   let right = len;
   // skip trailing '+' or '#'
   if (left < right) {
      c = san[right - 1];
      if (c === '+' || c === '#') right--;
   }
   // castling
   if (right === 3 && san.startsWith('O-O')) {
      if (board.castle[board.turn * SideNb + SideH] === SquareNone) return done(false);
      const king = king_pos(board, board.turn);
      const rook = board.castle[board.turn * SideNb + SideH];
      return { ok: true, string: `K${square_to_string(king)}?${square_to_string(rook)}?` };
   } else if (right === 5 && san.startsWith('O-O-O')) {
      if (board.castle[board.turn * SideNb + SideA] === SquareNone) return done(false);
      const king = king_pos(board, board.turn);
      const rook = board.castle[board.turn * SideNb + SideA];
      return { ok: true, string: `K${square_to_string(king)}?${square_to_string(rook)}?` };
   } else {
      // moved piece
      if (left < right) {
         c = san[left];
         if (char_is_piece(c)) {
            string[0] = c;
            left++;
         }
      }
      // promotion
      if (left < right) {
         c = toupper(san[right - 1]);
         if (char_is_piece(c)) {
            string[6] = c;
            right--;
            // skip '='
            if (left < right && san[right - 1] === '=') right--;
         }
      }
      // to-square rank
      if (left < right) {
         c = san[right - 1];
         if (char_is_rank(c)) {
            string[5] = c;
            right--;
         }
      }
      // to-square file
      if (left < right) {
         c = san[right - 1];
         if (char_is_file(c)) {
            string[4] = c;
            right--;
         }
      }
      // captured piece
      if (left < right) {
         c = san[right - 1];
         if (char_is_piece(c)) {
            string[3] = c;
            right--;
         }
      }
      // skip middle '-' or 'x'
      if (left < right) {
         c = san[right - 1];
         if (c === '-' || c === 'x') right--;
      }
      // from-square file
      if (left < right) {
         c = san[left];
         if (char_is_file(c)) {
            string[1] = c;
            left++;
         }
      }
      // from-square rank
      if (left < right) {
         c = san[left];
         if (char_is_rank(c)) {
            string[2] = c;
            left++;
         }
      }
      if (left !== right) return done(false);
   }
   // end
   return done(true);
}

// move_from_lan()

function move_from_lan(string: string, board: board_t): number {
   let move: number;
   let promote: number;
   let from: number, to: number;
   let inc: number;
   let piece_char: string;
   let n: number;
   let piece: number;
   let side: number;
   // init
   const len = string.length;
   if (len !== 7) return MoveNone;
   move = MoveNone;
   const colour = board.turn;
   // promote
   promote = 0;
   switch (string[6]) {
      case '?': // not a promotion
         break;
      case 'N':
         promote = MovePromoteKnight;
         break;
      case 'B':
         promote = MovePromoteBishop;
         break;
      case 'R':
         promote = MovePromoteRook;
         break;
      case 'Q':
         promote = MovePromoteQueen;
         break;
      default:
         return MoveNone;
   }
   // to square
   to = square_from_string(string[4] + string[5]);
   if (to === SquareNone) return MoveNone;
   // known from square?
   if (string[1] !== '?' && string[2] !== '?') {
      // from square
      from = square_from_string(string[1] + string[2]);
      if (from === SquareNone) return MoveNone;
      // convert "king slide" castling to KxR
      if (piece_is_king(board.square[from])
       && square_rank(to) === square_rank(from)
       && Math.abs(to - from) > 1) {
         side = to > from ? SideH : SideA;
         to = board.castle[colour * SideNb + side];
         if (to === SquareNone) return MoveNone;
      }
      // move
      move = move_make(from, to) | promote;
      return move;
   }
   // pawn non-capture?
   if (string[0] === '?' && string[1] === '?') {
      if (board.square[to] !== 0) return MoveNone; // useful?
      inc = colour_is_white(colour) ? +16 : -16;
      from = to - inc;
      if (board.square[from] === 0 && square_side_rank(to, colour) === Rank4) {
         from -= inc;
      }
      if (board.square[from] !== piece_make_pawn(colour)) { // useful?
         return MoveNone;
      }
      // move
      move = move_make(from, to) | promote;
      return move;
   }
   // pawn capture?
   piece_char = string[0];
   if (piece_char === '?' && string[1] !== '?') {
      piece_char = 'P';
   }
   // attack loop
   n = 0;
   for (let p = colour * 32; (from = board.list[p]) !== SquareNone; p++) {
      piece = board.square[from];
      if (toupper(piece_to_char(piece)) === piece_char) {
         if (piece_attack(board, piece, from, to)) {
            if (true
             && (string[1] === '?' || file_to_char(square_file(from)) === string[1])
             && (string[2] === '?' || rank_to_char(square_rank(from)) === string[2])) {
               if (!is_pinned(board, from, to, colour)) {
                  move = move_make(from, to) | promote;
                  n++;
               }
            }
         }
      }
   }
   if (n !== 1) move = MoveNone;
   return move;
}

// ambiguity()

function ambiguity(move: number, board: board_t): number {
   const list = new list_t();
   let i: number, n: number, m: number;
   // init
   const from = move_from(move);
   const to = move_to(move);
   const piece = move_piece(move, board);
   gen_legal_moves(list, board);
   // no ambiguity?
   n = 0;
   for (i = 0; i < list_size(list); i++) {
      m = list_move(list, i);
      if (move_piece(m, board) === piece && move_to(m) === to) {
         n++;
      }
   }
   if (n === 1) return AMBIGUITY_NONE;
   // file ambiguity?
   n = 0;
   for (i = 0; i < list_size(list); i++) {
      m = list_move(list, i);
      if (move_piece(m, board) === piece && move_to(m) === to) {
         if (square_file(move_from(m)) === square_file(from)) n++;
      }
   }
   if (n === 1) return AMBIGUITY_FILE;
   // rank ambiguity?
   n = 0;
   for (i = 0; i < list_size(list); i++) {
      m = list_move(list, i);
      if (move_piece(m, board) === piece && move_to(m) === to) {
         if (square_rank(move_from(m)) === square_rank(from)) n++;
      }
   }
   if (n === 1) return AMBIGUITY_RANK;
   // square ambiguity
   return AMBIGUITY_SQUARE;
}
