// Port of src/engine/fen.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import {
  BK, BR, board_clear, board_init_list, board_t, Empty, FlagsBlackKingCastle, FlagsBlackQueenCastle, FlagsNone,
  FlagsWhiteKingCastle, FlagsWhiteQueenCastle, WK, WR,
} from './board.ts';
import { Black, COLOUR_IS_WHITE, COLOUR_OPP, White } from './colour.ts';
import { atoi, isdigit } from '../libc.ts';
import { PAWN_MAKE, PieceNone256, piece_from_char, piece_to_char } from './piece.ts';
import {
  A1, A8, E1, E8, FileA, FileH, file_from_char, H1, H8, Rank1, Rank8, rank_from_char, SquareNone, SQUARE_EP_DUAL,
  SQUARE_MAKE, square_to_string,
} from './square.ts';
import { my_fatal } from './util.ts';

// "constants"
export const StartFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// variables
const Strict = false;

// functions

// board_from_fen(): the string as C sees it ('\0' past its end)
export function board_from_fen(board: board_t, fen: string): void {
  const at = (i: number): string => (i < fen.length ? fen[i] : '\0');
  board_clear(board);
  let pos = 0;
  let c = at(pos);
  // piece placement
  for (let rank = Rank8; rank >= Rank1; rank--) {
    for (let file = FileA; file <= FileH;) {
      if (c >= '1' && c <= '8') { // empty square(s)
        const len = c.charCodeAt(0) - 48;
        for (let i = 0; i < len; i++) {
          if (file > FileH) my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
          board.square[SQUARE_MAKE(file, rank)] = Empty;
          file++;
        }
      } else { // piece
        const piece = piece_from_char(c);
        if (piece === PieceNone256) my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
        board.square[SQUARE_MAKE(file, rank)] = piece;
        file++;
      }
      c = at(++pos);
    }
    if (rank > Rank1) {
      if (c !== '/') my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
      c = at(++pos);
    }
  }
  // active colour
  if (c !== ' ') my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
  c = at(++pos);
  switch (c) {
    case 'w':
      board.turn = White;
      break;
    case 'b':
      board.turn = Black;
      break;
    default:
      my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
  }
  c = at(++pos);
  // castling
  if (c !== ' ') my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
  c = at(++pos);
  board.flags = FlagsNone;
  if (c === '-') { // no castling rights
    c = at(++pos);
  } else {
    if (c === 'K') {
      if (board.square[E1] === WK && board.square[H1] === WR) board.flags |= FlagsWhiteKingCastle;
      c = at(++pos);
    }
    if (c === 'Q') {
      if (board.square[E1] === WK && board.square[A1] === WR) board.flags |= FlagsWhiteQueenCastle;
      c = at(++pos);
    }
    if (c === 'k') {
      if (board.square[E8] === BK && board.square[H8] === BR) board.flags |= FlagsBlackKingCastle;
      c = at(++pos);
    }
    if (c === 'q') {
      if (board.square[E8] === BK && board.square[A8] === BR) board.flags |= FlagsBlackQueenCastle;
      c = at(++pos);
    }
  }
  // en-passant
  if (c !== ' ') my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
  c = at(++pos);
  let sq: number;
  if (c === '-') { // no en-passant
    sq = SquareNone;
    c = at(++pos);
  } else {
    if (c < 'a' || c > 'h') my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
    const file = file_from_char(c);
    c = at(++pos);
    if (c !== (COLOUR_IS_WHITE(board.turn) ? '6' : '3')) my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
    const rank = rank_from_char(c);
    c = at(++pos);
    sq = SQUARE_MAKE(file, rank);
    const pawn = SQUARE_EP_DUAL(sq);
    if (board.square[sq] !== Empty
      || board.square[pawn] !== PAWN_MAKE(COLOUR_OPP(board.turn))
      || (board.square[pawn - 1] !== PAWN_MAKE(board.turn)
        && board.square[pawn + 1] !== PAWN_MAKE(board.turn))) {
      sq = SquareNone;
    }
  }
  board.ep_square = sq;
  // halfmove clock
  board.ply_nb = 0;
  update: {
    if (c !== ' ') {
      if (!Strict) break update;
      my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
    }
    c = at(++pos);
    if (!isdigit(c)) {
      if (!Strict) break update;
      my_fatal('board_from_fen(): bad FEN (pos=%d)\n', pos);
    }
    board.ply_nb = atoi(fen.slice(pos));
  }
  // board update
  board_init_list(board);
}

// board_to_fen()
export function board_to_fen(board: board_t): string {
  let fen = '';
  // piece placement
  for (let rank = Rank8; rank >= Rank1; rank--) {
    for (let file = FileA; file <= FileH;) {
      const sq = SQUARE_MAKE(file, rank);
      const piece = board.square[sq];
      if (piece === Empty) {
        let len = 0;
        for (; file <= FileH && board.square[SQUARE_MAKE(file, rank)] === Empty; file++) {
          len++;
        }
        fen += String.fromCharCode(48 + len);
      } else {
        fen += piece_to_char(piece);
        file++;
      }
    }
    fen += '/';
  }
  fen = fen.slice(0, -1) + ' '; // HACK: remove the last '/'
  // active colour
  fen += COLOUR_IS_WHITE(board.turn) ? 'w' : 'b';
  fen += ' ';
  // castling
  if (board.flags === FlagsNone) {
    fen += '-';
  } else {
    if ((board.flags & FlagsWhiteKingCastle) !== 0) fen += 'K';
    if ((board.flags & FlagsWhiteQueenCastle) !== 0) fen += 'Q';
    if ((board.flags & FlagsBlackKingCastle) !== 0) fen += 'k';
    if ((board.flags & FlagsBlackQueenCastle) !== 0) fen += 'q';
  }
  fen += ' ';
  // en-passant
  if (board.ep_square === SquareNone) {
    fen += '-';
  } else {
    fen += square_to_string(board.ep_square);
  }
  fen += ' ';
  // halfmove clock
  fen += board.ply_nb + ' 1';
  return fen;
}
