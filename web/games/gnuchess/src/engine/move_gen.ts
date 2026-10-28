// Port of src/engine/move_gen.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { attack_set, attack_t, ATTACK_IN_CHECK, is_attacked } from './attack.ts';
import {
  board_t, Empty, FlagsBlackKingCastle, FlagsBlackQueenCastle, FlagsWhiteKingCastle, FlagsWhiteQueenCastle,
} from './board.ts';
import { Black, COLOUR_FLAG, COLOUR_IS_WHITE, COLOUR_OPP, White } from './colour.ts';
import { list_filter, list_t } from './list.ts';
import { MoveCastle, MoveEnPassant, MovePromoteBishop, MovePromoteKnight, MovePromoteQueen, MovePromoteRook } from './move.ts';
import { gen_legal_evasions } from './move_evasion.ts';
import { pseudo_is_legal } from './move_legal.ts';
import { Bishop64, King64, Knight64, PAWN_MAKE, PAWN_MOVE_INC, PieceInc, PIECE_IS_SLIDER, Queen64, Rook64 } from './piece.ts';
import {
  B1, B8, C1, C8, D1, D8, E1, E8, F1, F8, G1, G8, PAWN_RANK, Rank2, Rank7, SquareIsPromote, SquareNone,
  SquareTo64, SQUARE_RANK,
} from './square.ts';
import { IncNone } from './vector.ts';

// a scratch attack_t, made on first use
let legal_attack: attack_t | undefined;

// gen_legal_moves()
export function gen_legal_moves(list: list_t, board: board_t): void {
  const attack = (legal_attack ??= new attack_t());
  attack_set(attack, board);
  if (ATTACK_IN_CHECK(attack)) {
    gen_legal_evasions(list, board, attack);
  } else {
    gen_moves(list, board);
    list_filter(list, board, pseudo_is_legal, true);
  }
}

// gen_moves()
export function gen_moves(list: list_t, board: board_t): void {
  list.size = 0;
  add_moves(list, board);
  add_en_passant_captures(list, board);
  add_castle_moves(list, board);
}

// gen_captures()
export function gen_captures(list: list_t, board: board_t): void {
  list.size = 0;
  add_captures(list, board);
  add_en_passant_captures(list, board);
}

// gen_quiet_moves()
export function gen_quiet_moves(list: list_t, board: board_t): void {
  list.size = 0;
  add_quiet_moves(list, board);
  add_castle_moves(list, board);
}

// add_moves()
function add_moves(list: list_t, board: board_t): void {
  const square = board.square;
  const moves = list.move;
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const opp_flag = COLOUR_FLAG(opp);
  let from: number, to: number, capture: number, inc: number;
  // piece moves
  for (let p = me * 32; (from = board.piece[p]) !== SquareNone; p++) {
    const piece = square[from];
    const incs = PieceInc[piece];
    const f64 = SquareTo64[from] << 6;
    if (PIECE_IS_SLIDER(piece)) {
      for (let i = 0; (inc = incs[i]) !== IncNone; i++) {
        for (to = from + inc; (capture = square[to]) === Empty; to += inc) {
          moves[list.size++] = f64 | SquareTo64[to];
        }
        if ((capture & opp_flag) !== 0) {
          moves[list.size++] = f64 | SquareTo64[to];
        }
      }
    } else {
      for (let i = 0; (inc = incs[i]) !== IncNone; i++) {
        to = from + inc;
        capture = square[to];
        if (capture === Empty || (capture & opp_flag) !== 0) {
          moves[list.size++] = f64 | SquareTo64[to];
        }
      }
    }
  }
  // pawn moves
  inc = PAWN_MOVE_INC(me);
  for (let p = me * 16; (from = board.pawn[p]) !== SquareNone; p++) {
    to = from + (inc - 1);
    if ((square[to] & opp_flag) !== 0) {
      add_pawn_move(list, from, to);
    }
    to = from + (inc + 1);
    if ((square[to] & opp_flag) !== 0) {
      add_pawn_move(list, from, to);
    }
    to = from + inc;
    if (square[to] === Empty) {
      add_pawn_move(list, from, to);
      if (PAWN_RANK(from, me) === Rank2) {
        to = from + (2 * inc);
        if (square[to] === Empty) {
          moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
        }
      }
    }
  }
}

// add_captures()
function add_captures(list: list_t, board: board_t): void {
  const square = board.square;
  const moves = list.move;
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const opp_flag = COLOUR_FLAG(opp);
  let from: number, to: number, capture: number;
  // piece captures
  for (let p = me * 32; (from = board.piece[p]) !== SquareNone; p++) {
    const piece = square[from];
    const f64 = SquareTo64[from] << 6;
    switch (piece & ~3) {
      case Knight64:
        to = from - 33;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 31;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 18;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 14;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 14;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 18;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 31;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 33;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case Bishop64:
        for (to = from - 17; (capture = square[to]) === Empty; to -= 17);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 15; (capture = square[to]) === Empty; to -= 15);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 15; (capture = square[to]) === Empty; to += 15);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 17; (capture = square[to]) === Empty; to += 17);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case Rook64:
        for (to = from - 16; (capture = square[to]) === Empty; to -= 16);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 1; (capture = square[to]) === Empty; to -= 1);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 1; (capture = square[to]) === Empty; to += 1);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 16; (capture = square[to]) === Empty; to += 16);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case Queen64:
        for (to = from - 17; (capture = square[to]) === Empty; to -= 17);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 16; (capture = square[to]) === Empty; to -= 16);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 15; (capture = square[to]) === Empty; to -= 15);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 1; (capture = square[to]) === Empty; to -= 1);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 1; (capture = square[to]) === Empty; to += 1);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 15; (capture = square[to]) === Empty; to += 15);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 16; (capture = square[to]) === Empty; to += 16);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 17; (capture = square[to]) === Empty; to += 17);
        if ((capture & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case King64:
        to = from - 17;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 16;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 15;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 1;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 1;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 15;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 16;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 17;
        if ((square[to] & opp_flag) !== 0) moves[list.size++] = f64 | SquareTo64[to];
        break;
      default:
        break;
    }
  }
  // pawn captures
  if (COLOUR_IS_WHITE(me)) {
    for (let p = me * 16; (from = board.pawn[p]) !== SquareNone; p++) {
      to = from + 15;
      if ((square[to] & opp_flag) !== 0) add_pawn_move(list, from, to);
      to = from + 17;
      if ((square[to] & opp_flag) !== 0) add_pawn_move(list, from, to);
      // promote
      if (SQUARE_RANK(from) === Rank7) {
        to = from + 16;
        if (square[to] === Empty) {
          add_promote(list, (SquareTo64[from] << 6) | SquareTo64[to]);
        }
      }
    }
  } else { // black
    for (let p = me * 16; (from = board.pawn[p]) !== SquareNone; p++) {
      to = from - 17;
      if ((square[to] & opp_flag) !== 0) add_pawn_move(list, from, to);
      to = from - 15;
      if ((square[to] & opp_flag) !== 0) add_pawn_move(list, from, to);
      // promote
      if (SQUARE_RANK(from) === Rank2) {
        to = from - 16;
        if (square[to] === Empty) {
          add_promote(list, (SquareTo64[from] << 6) | SquareTo64[to]);
        }
      }
    }
  }
}

// add_quiet_moves()
function add_quiet_moves(list: list_t, board: board_t): void {
  const square = board.square;
  const moves = list.move;
  const me = board.turn;
  let from: number, to: number;
  // piece moves
  for (let p = me * 32; (from = board.piece[p]) !== SquareNone; p++) {
    const piece = square[from];
    const f64 = SquareTo64[from] << 6;
    switch (piece & ~3) {
      case Knight64:
        to = from - 33;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 31;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 18;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 14;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 14;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 18;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 31;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 33;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case Bishop64:
        for (to = from - 17; square[to] === Empty; to -= 17) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 15; square[to] === Empty; to -= 15) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 15; square[to] === Empty; to += 15) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 17; square[to] === Empty; to += 17) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case Rook64:
        for (to = from - 16; square[to] === Empty; to -= 16) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 1; square[to] === Empty; to -= 1) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 1; square[to] === Empty; to += 1) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 16; square[to] === Empty; to += 16) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case Queen64:
        for (to = from - 17; square[to] === Empty; to -= 17) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 16; square[to] === Empty; to -= 16) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 15; square[to] === Empty; to -= 15) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from - 1; square[to] === Empty; to -= 1) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 1; square[to] === Empty; to += 1) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 15; square[to] === Empty; to += 15) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 16; square[to] === Empty; to += 16) moves[list.size++] = f64 | SquareTo64[to];
        for (to = from + 17; square[to] === Empty; to += 17) moves[list.size++] = f64 | SquareTo64[to];
        break;
      case King64:
        to = from - 17;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 16;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 15;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from - 1;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 1;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 15;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 16;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        to = from + 17;
        if (square[to] === Empty) moves[list.size++] = f64 | SquareTo64[to];
        break;
      default:
        break;
    }
  }
  // pawn moves
  if (COLOUR_IS_WHITE(me)) {
    for (let p = me * 16; (from = board.pawn[p]) !== SquareNone; p++) {
      // non promotes
      if (SQUARE_RANK(from) !== Rank7) {
        to = from + 16;
        if (square[to] === Empty) {
          moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
          if (SQUARE_RANK(from) === Rank2) {
            to = from + 32;
            if (square[to] === Empty) {
              moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
            }
          }
        }
      }
    }
  } else { // black
    for (let p = me * 16; (from = board.pawn[p]) !== SquareNone; p++) {
      // non promotes
      if (SQUARE_RANK(from) !== Rank2) {
        to = from - 16;
        if (square[to] === Empty) {
          moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
          if (SQUARE_RANK(from) === Rank7) {
            to = from - 32;
            if (square[to] === Empty) {
              moves[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to];
            }
          }
        }
      }
    }
  }
}

// add_en_passant_captures()
function add_en_passant_captures(list: list_t, board: board_t): void {
  const to = board.ep_square;
  if (to !== SquareNone) {
    const me = board.turn;
    const inc = PAWN_MOVE_INC(me);
    const pawn = PAWN_MAKE(me);
    let from = to - (inc - 1);
    if (board.square[from] === pawn) {
      list.move[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to] | MoveEnPassant;
    }
    from = to - (inc + 1);
    if (board.square[from] === pawn) {
      list.move[list.size++] = (SquareTo64[from] << 6) | SquareTo64[to] | MoveEnPassant;
    }
  }
}

// add_castle_moves()
function add_castle_moves(list: list_t, board: board_t): void {
  const square = board.square;
  if (COLOUR_IS_WHITE(board.turn)) {
    if ((board.flags & FlagsWhiteKingCastle) !== 0
      && square[F1] === Empty
      && square[G1] === Empty
      && !is_attacked(board, F1, Black)) {
      list.move[list.size++] = (SquareTo64[E1] << 6) | SquareTo64[G1] | MoveCastle;
    }
    if ((board.flags & FlagsWhiteQueenCastle) !== 0
      && square[D1] === Empty
      && square[C1] === Empty
      && square[B1] === Empty
      && !is_attacked(board, D1, Black)) {
      list.move[list.size++] = (SquareTo64[E1] << 6) | SquareTo64[C1] | MoveCastle;
    }
  } else { // black
    if ((board.flags & FlagsBlackKingCastle) !== 0
      && square[F8] === Empty
      && square[G8] === Empty
      && !is_attacked(board, F8, White)) {
      list.move[list.size++] = (SquareTo64[E8] << 6) | SquareTo64[G8] | MoveCastle;
    }
    if ((board.flags & FlagsBlackQueenCastle) !== 0
      && square[D8] === Empty
      && square[C8] === Empty
      && square[B8] === Empty
      && !is_attacked(board, D8, White)) {
      list.move[list.size++] = (SquareTo64[E8] << 6) | SquareTo64[C8] | MoveCastle;
    }
  }
}

// add_pawn_move()
export function add_pawn_move(list: list_t, from: number, to: number): void {
  const move = (SquareTo64[from] << 6) | SquareTo64[to];
  if (SquareIsPromote[to] !== 0) {
    list.move[list.size++] = move | MovePromoteQueen;
    list.move[list.size++] = move | MovePromoteKnight;
    list.move[list.size++] = move | MovePromoteRook;
    list.move[list.size++] = move | MovePromoteBishop;
  } else {
    list.move[list.size++] = move;
  }
}

// add_promote()
export function add_promote(list: list_t, move: number): void {
  list.move[list.size++] = move | MovePromoteQueen;
  list.move[list.size++] = move | MovePromoteKnight;
  list.move[list.size++] = move | MovePromoteRook;
  list.move[list.size++] = move | MovePromoteBishop;
}
