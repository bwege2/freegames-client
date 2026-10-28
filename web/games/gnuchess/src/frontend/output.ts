// Port of src/frontend/output.cc of GNU Chess 6.3.0: the board display (classical, and the "graphic"
// one with Unicode pieces on ANSI-coloured squares), the move list and the game record.
import {
  BKINGCASTLE, BQUEENCASTLE, BitPosArray, Game, Mvboard, Tree, TreePtr, WKINGCASTLE, WQUEENCASTLE, algbr, bishop,
  black, board, cboard, g, king, knight, notation, pawn, queen, rook, white,
} from './common.ts';
import { SANMove } from './move.ts';
import { SwapOff } from './swap.ts';
import { fprintf, printf } from './stdio.ts';
import { bstr } from '../libc.ts';

const MAX_BOARD_RANGE = 65;

/** a C string literal of the UTF-8 source as the bytes it compiles to */
const utf8 = (s: string): string => bstr(new TextEncoder().encode(s));
const w_pieces = ['♔ ', '♕ ', '♖ ', '♗ ', '♘ ', '♙ '].map(utf8);
const b_pieces = ['♚ ', '♛ ', '♜ ', '♝ ', '♞ ', '♟ '].map(utf8);
const ui_king = 0;
const ui_queen = 1;
const ui_rook = 2;
const ui_bishop = 3;
const ui_knight = 4;
const ui_pawn = 5;
const white_square = '\x1b[7;37m';
const black_square = '\x1b[7;35m';
const default_console = '\x1b[0m';
const blank_place = '  ';

/** Print out the time settings. */
export function ShowTime(): void {}

/** Print out the move list. */
export function ShowMoveList(ply: number): void {
  let i = 0;
  for (let node = TreePtr[ply]; node < TreePtr[ply + 1]; node++) {
    SANMove(Tree.move[node], ply);
    printf('%5s %3d\t', g.SANmv, SwapOff(Tree.move[node]));
    if (++i === 5) {
      printf('\n');
      i = 0;
    }
  }
  printf('\n');
}

/** Display the board, and whether enpassant is legal and the castling state. */
export function ShowBoard(): void {
  const ofp = g.ofp;
  fprintf(ofp, '\n');
  if (g.coords === 1) fprintf(ofp, '  ');
  if (board.side === white) fprintf(ofp, 'white  ');
  else fprintf(ofp, 'black  ');
  if (board.flag & WKINGCASTLE) fprintf(ofp, 'K');
  if (board.flag & WQUEENCASTLE) fprintf(ofp, 'Q');
  if (board.flag & BKINGCASTLE) fprintf(ofp, 'k');
  if (board.flag & BQUEENCASTLE) fprintf(ofp, 'q');
  if (board.ep > -1) fprintf(ofp, '  %s', algbr[board.ep]);
  fprintf(ofp, '\n');

  let arr_board = '';
  for (let r = 56; r >= 0; r -= 8) {
    for (let c = 0; c < 8; c++) {
      const sq = r + c;
      const bit = BitPosArray[sq];
      if (board.b[white][pawn] & bit) arr_board += 'P';
      else if (board.b[white][knight] & bit) arr_board += 'N';
      else if (board.b[white][bishop] & bit) arr_board += 'B';
      else if (board.b[white][rook] & bit) arr_board += 'R';
      else if (board.b[white][queen] & bit) arr_board += 'Q';
      else if (board.b[white][king] & bit) arr_board += 'K';
      else if (board.b[black][pawn] & bit) arr_board += 'p';
      else if (board.b[black][knight] & bit) arr_board += 'n';
      else if (board.b[black][bishop] & bit) arr_board += 'b';
      else if (board.b[black][rook] & bit) arr_board += 'r';
      else if (board.b[black][queen] & bit) arr_board += 'q';
      else if (board.b[black][king] & bit) arr_board += 'k';
      else arr_board += '.';
    }
  }
  if (g.graphicmodeoutput === 1) ShowStylishBoard(arr_board);
  else ShowClassicalBoard(arr_board);
  fprintf(ofp, '\n');
}

/** boardmap[i] of the C array (64 chars and a NUL) */
const at = (m: string, i: number): string => (i < m.length ? m[i] : '\0');

function ShowStylishBoard(boardmap: string): void {
  const ofp = g.ofp;
  let row = 8;
  const column = 'abcdefgh';
  let b_white = 1;
  let tmp_piece = '';
  if (g.coords === 1) fprintf(ofp, '%d ', row);
  row--;
  for (let i = 0; i < MAX_BOARD_RANGE; ++i) {
    fprintf(ofp, '%s', default_console);
    if (i > 0 && i % 8 === 0) {
      fprintf(ofp, '\n');
      b_white = b_white ? 0 : 1;
      if (row >= 1) {
        if (g.coords === 1) fprintf(ofp, '%d ', row);
        row--;
      } else break;
    }
    tmp_piece = GetPiece(at(boardmap, i), tmp_piece);
    if (b_white) fprintf(ofp, '%s%s', white_square, tmp_piece);
    else fprintf(ofp, '%s%s', black_square, tmp_piece);
    b_white = b_white ? 0 : 1;
  }
  fprintf(ofp, '%s  ', default_console);
  if (g.coords === 1) {
    for (let i = 0; i < 8; ++i) fprintf(ofp, '%c ', column[i]);
  }
}

/** The new style piece for orig_piece; the old one stays when orig_piece is none (strcpy is not called). */
function GetPiece(orig_piece: string, piece: string): string {
  if (orig_piece === 'p') return b_pieces[ui_pawn];
  else if (orig_piece === 'P') return w_pieces[ui_pawn];
  else if (orig_piece === 'n') return b_pieces[ui_knight];
  else if (orig_piece === 'N') return w_pieces[ui_knight];
  else if (orig_piece === 'b') return b_pieces[ui_bishop];
  else if (orig_piece === 'B') return w_pieces[ui_bishop];
  else if (orig_piece === 'r') return b_pieces[ui_rook];
  else if (orig_piece === 'R') return w_pieces[ui_rook];
  else if (orig_piece === 'q') return b_pieces[ui_queen];
  else if (orig_piece === 'Q') return w_pieces[ui_queen];
  else if (orig_piece === 'k') return b_pieces[ui_king];
  else if (orig_piece === 'K') return w_pieces[ui_king];
  else if (orig_piece === '.') return blank_place;
  return piece;
}

function ShowClassicalBoard(boardmap: string): void {
  const ofp = g.ofp;
  const column = 'abcdefgh';
  let row = 8;
  for (let i = 0; i < MAX_BOARD_RANGE; ++i) {
    if (i >= 0 && i % 8 === 0) {
      fprintf(ofp, '\n');
      if (g.coords === 1) {
        if (row >= 1) fprintf(ofp, '%d ', row--);
        else break;
      }
    }
    fprintf(ofp, '%c ', at(boardmap, i));
  }
  if (g.coords === 1) {
    fprintf(ofp, '  ');
    for (let i = 0; i < 8; ++i) fprintf(ofp, '%c ', column[i]);
  }
}

export function ShowCBoard(): void {
  for (let r = 56; r >= 0; r -= 8) {
    for (let c = 0; c < 8; c++) printf('%2c ', cboard[r + c] ? notation[cboard[r + c]] : '.');
    printf('\n');
  }
  printf('\n');
}

/** Print the Mvboard[] array. */
export function ShowMvboard(): void {
  for (let r = 56; r >= 0; r -= 8) {
    for (let c = 0; c < 8; c++) printf('%2d ', Mvboard[r + c]);
    printf('\n');
  }
  printf('\n');
}

export function ShowGame(): void {
  /* We must handle the special case of an EPD game where the first move is by black */
  if (g.GameCnt >= 0) {
    printf('      White   Black\n');
    if ((board.side === white && g.GameCnt % 2 === 1) || (board.side === black && g.GameCnt % 2 === 0)) {
      for (let i = 0; i <= g.GameCnt; i += 2) printf('%3d.  %-7s %-7s\n', Math.trunc(i / 2) + 1, Game[i].SANmv, Game[i + 1].SANmv);
    } else {
      printf('  1.          %-7s\n', Game[0].SANmv);
      for (let i = 1; i <= g.GameCnt; i += 2) printf('%3d.  %-7s %-7s\n', Math.trunc(i / 2) + 2, Game[i].SANmv, Game[i + 1].SANmv);
    }
    printf('\n');
  }
}
