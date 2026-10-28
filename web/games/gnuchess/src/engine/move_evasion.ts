// Port of src/engine/move_evasion.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { attack_t, is_attacked, is_pinned, PIECE_ATTACK } from './attack.ts';
import { board_t, Empty, KING_POS } from './board.ts';
import { COLOUR_FLAG, COLOUR_OPP } from './colour.ts';
import { list_t } from './list.ts';
import { MoveEnPassant } from './move.ts';
import { add_pawn_move } from './move_gen.ts';
import { KingInc, PAWN_MAKE, PAWN_MOVE_INC } from './piece.ts';
import { PAWN_RANK, Rank4, SquareNone, SquareTo64, SQUARE_EP_DUAL } from './square.ts';
import { IncNone } from './vector.ts';

// gen_legal_evasions()
export function gen_legal_evasions(list: list_t, board: board_t, attack: attack_t): void {
  gen_evasions(list, board, attack, true, false);
}

// gen_pseudo_evasions()
export function gen_pseudo_evasions(list: list_t, board: board_t, attack: attack_t): void {
  gen_evasions(list, board, attack, false, false);
}

// a scratch list, made on first use
let dummy_list: list_t | undefined;

// legal_evasion_exist()
export function legal_evasion_exist(board: board_t, attack: attack_t): boolean {
  const list = (dummy_list ??= new list_t()); // dummy
  return gen_evasions(list, board, attack, true, true);
}

// gen_evasions()
function gen_evasions(list: list_t, board: board_t, attack: attack_t, legal: boolean, stop: boolean): boolean {
  // init
  list.size = 0;
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const opp_flag = COLOUR_FLAG(opp);
  const king = KING_POS(board, me);
  let inc: number;
  for (let i = 0; (inc = KingInc[i]) !== IncNone; i++) {
    if (inc !== -attack.di[0] && inc !== -attack.di[1]) { // avoid escaping along a check line
      const to = king + inc;
      const piece = board.square[to];
      if (piece === Empty || (piece & opp_flag) !== 0) {
        if (!legal || !is_attacked(board, to, opp)) {
          if (stop) return true;
          list.move[list.size++] = (SquareTo64[king] << 6) | SquareTo64[to];
        }
      }
    }
  }
  if (attack.dn >= 2) return false; // double check, we are done
  // single check
  // capture the checking piece
  if (add_pawn_captures(list, board, attack.ds[0], legal, stop) && stop) return true;
  if (add_piece_moves(list, board, attack.ds[0], legal, stop) && stop) return true;
  // interpose a piece
  inc = attack.di[0];
  if (inc !== IncNone) { // line
    for (let to = king + inc; to !== attack.ds[0]; to += inc) {
      if (add_pawn_moves(list, board, to, legal, stop) && stop) return true;
      if (add_piece_moves(list, board, to, legal, stop) && stop) return true;
    }
  }
  return false;
}

// add_pawn_moves()
function add_pawn_moves(list: list_t, board: board_t, to: number, legal: boolean, stop: boolean): boolean {
  const me = board.turn;
  const inc = PAWN_MOVE_INC(me);
  const pawn = PAWN_MAKE(me);
  let from = to - inc;
  const piece = board.square[from];
  if (piece === pawn) { // single push
    if (!legal || !is_pinned(board, from, me)) {
      if (stop) return true;
      add_pawn_move(list, from, to);
    }
  } else if (piece === Empty && PAWN_RANK(to, me) === Rank4) { // double push
    from = to - (2 * inc);
    if (board.square[from] === pawn) {
      if (!legal || !is_pinned(board, from, me)) {
        if (stop) return true;
        list.move[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
      }
    }
  }
  return false;
}

// add_pawn_captures()
function add_pawn_captures(list: list_t, board: board_t, to: number, legal: boolean, stop: boolean): boolean {
  const me = board.turn;
  const inc = PAWN_MOVE_INC(me);
  const pawn = PAWN_MAKE(me);
  let from = to - (inc - 1);
  if (board.square[from] === pawn) {
    if (!legal || !is_pinned(board, from, me)) {
      if (stop) return true;
      add_pawn_move(list, from, to);
    }
  }
  from = to - (inc + 1);
  if (board.square[from] === pawn) {
    if (!legal || !is_pinned(board, from, me)) {
      if (stop) return true;
      add_pawn_move(list, from, to);
    }
  }
  if (board.ep_square !== SquareNone
    && to === SQUARE_EP_DUAL(board.ep_square)) {
    to = board.ep_square;
    from = to - (inc - 1);
    if (board.square[from] === pawn) {
      if (!legal || !is_pinned(board, from, me)) {
        if (stop) return true;
        list.move[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to] | MoveEnPassant;
      }
    }
    from = to - (inc + 1);
    if (board.square[from] === pawn) {
      if (!legal || !is_pinned(board, from, me)) {
        if (stop) return true;
        list.move[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to] | MoveEnPassant;
      }
    }
  }
  return false;
}

// add_piece_moves()
function add_piece_moves(list: list_t, board: board_t, to: number, legal: boolean, stop: boolean): boolean {
  const me = board.turn;
  let from: number;
  for (let p = me * 32 + 1; (from = board.piece[p]) !== SquareNone; p++) { // HACK: no king
    const piece = board.square[from];
    if (PIECE_ATTACK(board, piece, from, to)) {
      if (!legal || !is_pinned(board, from, me)) {
        if (stop) return true;
        list.move[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
      }
    }
  }
  return false;
}
