// Port of src/adapter/fen.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// After a fen_fatal() that my_fatal() survives (the first error of the process), parsing goes on as in C.

import { board_clear, board_init_list, s16, SideA, SideH, SideNb, type board_t } from './board.ts';
import { Black, colour_is_white, White } from './colour.ts';
import { option_get_bool } from './option.ts';
import { BlackRook256, piece_colour, piece_from_char, piece_is_king, piece_to_char, PieceNone256, WhiteRook256 } from './piece.ts';
import { A1, A8, file_from_char, file_to_char, H1, H8, Rank1, Rank8, rank_from_char, SquareNone, square_file, square_make, square_to_string } from './square.ts';
import { atoi, isdigit, sprintf, tolower, toupper } from '../libc.ts';
import { my_fatal } from './util.ts';

// "constants"

// const char * StartFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w HAha - 0 1";
export const StartFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// variables

const Strict = false;

const at = (s: string, i: number): string => (i >= 0 && i < s.length ? s[i] : '\0');

// functions

// fen_fatal()

export function fen_fatal(format: string, pos: number, fen: string): void {
   let pointerStr = '';
   for (let i = 0; i < pos; ++i) {
      pointerStr += ' ';
   }
   pointerStr += '*';
   let errorMsg = sprintf(format, pos);
   errorMsg += fen;
   errorMsg += '\n';
   errorMsg += pointerStr;
   errorMsg += '\n';
   my_fatal(errorMsg); // the message is my_fatal()'s format
}

// board_from_fen()

export function board_from_fen(board: board_t, string: string): boolean {
   let pos: number;
   let file: number, rank: number, sq: number;
   let c: string;
   let i: number, len: number;
   let piece: number;
   const king_pos: number[] = [0, 0, 0];

   board_clear(board);

   king_pos[White] = SquareNone;
   king_pos[Black] = SquareNone;

   pos = 0;
   c = at(string, pos);

   // piece placement

   for (rank = 7; rank >= 0; rank--) {
      for (file = 0; file < 8;) {
         sq = square_make(file, rank);
         if (c >= '1' && c <= '8') { // empty square(s)
            len = c.charCodeAt(0) - 48;
            if (file + len > 8) fen_fatal('board_from_fen(): bad FEN (a file was expected at pos=%d)\n', pos, string);
            for (i = 0; i < len; i++) {
               board.square[sq++] = 0; // Empty
               file++;
            }
         } else { // piece
            piece = piece_from_char(c);
            if (piece === PieceNone256) fen_fatal('board_from_fen(): bad FEN (a piece was expected at pos=%d)\n', pos, string);
            if (piece_is_king(piece)) king_pos[piece_colour(piece)] = sq;
            board.square[sq++] = piece;
            file++;
         }
         c = at(string, ++pos);
      }
      if (rank > 0) {
         if (c !== '/') fen_fatal("board_from_fen(): bad FEN ('/' was expected at pos=%d)\n", pos, string);
         c = at(string, ++pos);
      }
   }

   // active colour

   if (c !== ' ') fen_fatal('board_from_fen(): bad FEN (a space was expected at pos=%d)\n', pos, string);
   c = at(string, ++pos);

   switch (c) {
      case 'w':
         board.turn = White;
         break;
      case 'b':
         board.turn = Black;
         break;
      default:
         fen_fatal("board_from_fen(): bad FEN (the active colour ('w' or 'b') was expected at pos=%d)\n", pos, string);
         break;
   }

   c = at(string, ++pos);

   // castling

   if (c !== ' ') fen_fatal('board_from_fen(): bad FEN (a space was expected at pos=%d)\n', pos, string);
   c = at(string, ++pos);

   board.castle[White * SideNb + SideH] = SquareNone;
   board.castle[White * SideNb + SideA] = SquareNone;
   board.castle[Black * SideNb + SideH] = SquareNone;
   board.castle[Black * SideNb + SideA] = SquareNone;

   if (c === '-') { // no castling rights
      c = at(string, ++pos);
   } else {
      // TODO: filter out illegal rights
      do {
         if (c === 'K') {
            for (sq = H1; sq > king_pos[White]; sq--) {
               if (board.square[sq] === WhiteRook256) {
                  board.castle[White * SideNb + SideH] = sq;
                  break;
               }
            }
         } else if (c === 'Q') {
            for (sq = A1; sq < king_pos[White]; sq++) {
               if (board.square[sq] === WhiteRook256) {
                  board.castle[White * SideNb + SideA] = sq;
                  break;
               }
            }
         } else if (c === 'k') {
            for (sq = H8; sq > king_pos[Black]; sq--) {
               if (board.square[sq] === BlackRook256) {
                  board.castle[Black * SideNb + SideH] = sq;
                  break;
               }
            }
         } else if (c === 'q') {
            for (sq = A8; sq < king_pos[Black]; sq++) {
               if (board.square[sq] === BlackRook256) {
                  board.castle[Black * SideNb + SideA] = sq;
                  break;
               }
            }
         } else if (c >= 'A' && c <= 'H') {
            // white castling right
            sq = square_make(file_from_char(tolower(c)), Rank1);
            if (sq > king_pos[White]) { // h side
               board.castle[White * SideNb + SideH] = sq;
            } else { // a side
               board.castle[White * SideNb + SideA] = sq;
            }
         } else if (c >= 'a' && c <= 'h') {
            // black castling right
            sq = square_make(file_from_char(tolower(c)), Rank8);
            if (sq > king_pos[Black]) { // h side
               board.castle[Black * SideNb + SideH] = sq;
            } else { // a side
               board.castle[Black * SideNb + SideA] = sq;
            }
         } else {
            fen_fatal('board_from_fen(): bad FEN (invalid castling availability at pos=%d)\n', pos, string);
         }
         c = at(string, ++pos);
      } while (c !== ' ');
   }

   // en-passant

   if (c !== ' ') fen_fatal('board_from_fen(): bad FEN (a space was expected at pos=%d)\n', pos, string);
   c = at(string, ++pos);

   if (c === '-') { // no en-passant
      sq = SquareNone;
      c = at(string, ++pos);
   } else {
      if (c < 'a' || c > 'h') fen_fatal('board_from_fen(): bad FEN (invalid en-passant rank at pos=%d)\n', pos, string);
      file = file_from_char(c);
      c = at(string, ++pos);
      if (c < '1' || c > '8') fen_fatal('board_from_fen(): bad FEN (invalid en-passant file at pos=%d)\n', pos, string);
      rank = rank_from_char(c);
      c = at(string, ++pos);
      sq = square_make(file, rank) ?? 0;
   }

   board.ep_square = sq;

   // halfmove clock

   board.ply_nb = 0;
   board.move_nb = 0; // HACK, in case of broken syntax

   update: {
      if (c !== ' ') {
         if (!Strict) break update;
         fen_fatal('board_from_fen(): bad FEN (a space was expected at pos=%d)\n', pos, string);
      }
      c = at(string, ++pos);

      if (!isdigit(c)) {
         if (!Strict) break update;
         fen_fatal('board_from_fen(): bad FEN (a digit for the halfmove clock was expected at pos=%d)\n', pos, string);
      }

      board.ply_nb = s16(atoi(string.slice(pos)));
      do c = at(string, ++pos); while (isdigit(c));

      // fullmove number

      board.move_nb = 0;

      if (c !== ' ') {
         if (!Strict) break update;
         fen_fatal('board_from_fen(): bad FEN (a space was expected at pos=%d)\n', pos, string);
      }
      c = at(string, ++pos);

      if (!isdigit(c)) {
         if (!Strict) break update;
         fen_fatal('board_from_fen(): bad FEN (a digit for the fullmove number was expected at pos=%d)\n', pos, string);
      }

      board.move_nb = s16(atoi(string.slice(pos)) - 1);
      do c = at(string, ++pos); while (isdigit(c));
   }

   // board update

   // update:
   board_init_list(board);

   return true;
}

// board_to_fen()

export function board_to_fen(board: board_t): string {
   let file: number, rank: number;
   let sq: number, piece: number;
   let len: number;
   let string = '';

   // piece placement

   for (rank = 7; rank >= 0; rank--) {
      for (file = 0; file < 8;) {
         sq = square_make(file, rank);
         piece = board.square[sq];
         if (piece === 0) { // Empty
            len = 0;
            for (; file < 8 && board.square[square_make(file, rank)] === 0; file++) {
               len++;
            }
            string += String.fromCharCode(48 + len);
         } else {
            string += piece_to_char(piece);
            file++;
         }
      }
      string += '/';
   }

   string = string.slice(0, -1) + ' '; // HACK: remove the last '/'

   // active colour

   string += colour_is_white(board.turn) ? 'w' : 'b';
   string += ' ';

   // castling

   const old_len = string.length;

   if (option_get_bool('Chess960')) {
      // FEN-960
      if (board.castle[White * SideNb + SideH] !== SquareNone) {
         string += toupper(file_to_char(square_file(board.castle[White * SideNb + SideH])));
      }
      if (board.castle[White * SideNb + SideA] !== SquareNone) {
         string += toupper(file_to_char(square_file(board.castle[White * SideNb + SideA])));
      }
      if (board.castle[Black * SideNb + SideH] !== SquareNone) {
         string += tolower(file_to_char(square_file(board.castle[Black * SideNb + SideH])));
      }
      if (board.castle[Black * SideNb + SideA] !== SquareNone) {
         string += tolower(file_to_char(square_file(board.castle[Black * SideNb + SideA])));
      }
   } else {
      // FEN
      if (board.castle[White * SideNb + SideH] !== SquareNone) string += 'K';
      if (board.castle[White * SideNb + SideA] !== SquareNone) string += 'Q';
      if (board.castle[Black * SideNb + SideH] !== SquareNone) string += 'k';
      if (board.castle[Black * SideNb + SideA] !== SquareNone) string += 'q';
   }

   if (string.length === old_len) string += '-';

   string += ' ';

   // en-passant

   if (board.ep_square === SquareNone) {
      string += '-';
   } else {
      string += square_to_string(board.ep_square);
   }

   string += ' ';

   // halfmove clock and fullmove number

   string += sprintf('%d %d', board.ply_nb, board.move_nb + 1);

   return string;
}
