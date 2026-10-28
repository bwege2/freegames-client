// Port of src/engine/see.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { DeltaIncAll, DeltaIncLine, DeltaMask, SLIDER_ATTACK } from './attack.ts';
import { board_t, Empty } from './board.ts';
import { COLOUR_OPP } from './colour.ts';
import { MoveEnPassant, MoveFlags, MovePromote, move_promote, MOVE_FROM, MOVE_TO } from './move.ts';
import { PAWN_MAKE, PAWN_MOVE_INC, PIECE_COLOUR } from './piece.ts';
import { SquareIsPromote, SquareNone, SQUARE_EP_DUAL } from './square.ts';
import { ValueKing, ValuePawn, ValuePiece, ValueQueen } from './value.ts';
import { DeltaOffset, IncNone } from './vector.ts';

// types
class alist_t {
  size = 0;
  square = new Int32Array(15);
}

// the attacker lists of see_move()/see_square() (alists_t alists[1] in the original; neither is re-entered)
const alists: alist_t[] = [new alist_t(), new alist_t()];

// functions

// see_move()
export function see_move(move: number, board: board_t): number {
  // init
  const from = MOVE_FROM(move);
  const to = MOVE_TO(move);
  // move the piece
  let piece_value = 0;
  let piece = board.square[from];
  const att = PIECE_COLOUR(piece);
  const def = COLOUR_OPP(att);
  // promote
  if ((move & MoveFlags) === MovePromote) {
    piece = move_promote(move);
  }
  piece_value += ValuePiece[piece];
  // clear attacker lists
  alists[1].size = 0;
  alists[0].size = 0;
  // find hidden attackers
  alists_hidden(board, from, to);
  // capture the piece
  let value = 0;
  const capture = board.square[to];
  if (capture !== Empty) {
    value += ValuePiece[capture];
  }
  // promote
  if ((move & MoveFlags) === MovePromote) {
    value += ValuePiece[piece] - ValuePawn;
  }
  // en-passant
  if ((move & MoveFlags) === MoveEnPassant) {
    value += ValuePawn;
    alists_hidden(board, SQUARE_EP_DUAL(to), to);
  }
  // build defender list
  let alist = alists[def];
  alist_build(alist, board, to, def);
  if (alist.size === 0) return value; // no defender => stop SEE
  // build attacker list
  alist = alists[att];
  alist_build(alist, board, to, att);
  // remove the moved piece (if it's an attacker)
  let pos: number;
  for (pos = 0; pos < alist.size && alist.square[pos] !== from; pos++)
    ;
  if (pos < alist.size) alist_remove(alist, pos);
  // SEE search
  value -= see_rec(board, def, to, piece_value);
  return value;
}

// see_square()
export function see_square(board: board_t, to: number, colour: number): number {
  // build attacker list
  const att = colour;
  let alist = alists[att];
  alist.size = 0;
  alist_build(alist, board, to, att);
  if (alist.size === 0) return 0; // no attacker => stop SEE
  // build defender list
  const def = COLOUR_OPP(att);
  alist = alists[def];
  alist.size = 0;
  alist_build(alist, board, to, def);
  // captured piece
  const piece = board.square[to];
  const piece_value = ValuePiece[piece];
  // SEE search
  return see_rec(board, att, to, piece_value);
}

// see_rec()
function see_rec(board: board_t, colour: number, to: number, piece_value: number): number {
  // find the least valuable attacker
  const from = alist_pop(alists[colour]);
  if (from === SquareNone) return 0; // no more attackers
  // find hidden attackers
  alists_hidden(board, from, to);
  // calculate the capture value
  let value = +piece_value; // captured piece
  if (value === ValueKing) return value; // do not allow an answer to a king capture
  const piece = board.square[from];
  piece_value = ValuePiece[piece];
  // promote
  if (piece_value === ValuePawn && SquareIsPromote[to] !== 0) { // HACK: PIECE_IS_PAWN(piece)
    piece_value = ValueQueen;
    value += ValueQueen - ValuePawn;
  }
  value -= see_rec(board, COLOUR_OPP(colour), to, piece_value);
  if (value < 0) value = 0;
  return value;
}

// alist_build()
function alist_build(alist: alist_t, board: board_t, to: number, colour: number): void {
  const square = board.square;
  let from: number;
  // piece attacks
  for (let p = colour * 32; (from = board.piece[p]) !== SquareNone; p++) {
    const piece = square[from];
    const delta = to - from;
    if ((piece & DeltaMask[DeltaOffset + delta]) !== 0) {
      const inc = DeltaIncAll[DeltaOffset + delta];
      let sq = from;
      do {
        sq += inc;
        if (sq === to) { // attack
          alist_add(alist, from, board);
          break;
        }
      } while (square[sq] === Empty);
    }
  }
  // pawn attacks
  const inc = PAWN_MOVE_INC(colour);
  const pawn = PAWN_MAKE(colour);
  from = to - (inc - 1);
  if (square[from] === pawn) alist_add(alist, from, board);
  from = to - (inc + 1);
  if (square[from] === pawn) alist_add(alist, from, board);
}

// alists_hidden()
function alists_hidden(board: board_t, from: number, to: number): void {
  const inc = DeltaIncLine[DeltaOffset + to - from];
  if (inc !== IncNone) { // line
    let sq = from;
    let piece: number;
    do sq -= inc; while ((piece = board.square[sq]) === Empty);
    if (SLIDER_ATTACK(piece, inc)) {
      alist_add(alists[PIECE_COLOUR(piece)], sq, board);
    }
  }
}

// alist_add()
function alist_add(alist: alist_t, square: number, board: board_t): void {
  // insert in MV order
  const piece = board.square[square];
  const size = ++alist.size; // HACK
  let pos: number;
  for (pos = size - 1; pos > 0 && piece > board.square[alist.square[pos - 1]]; pos--) { // HACK
    alist.square[pos] = alist.square[pos - 1];
  }
  alist.square[pos] = square;
}

// alist_remove()
function alist_remove(alist: alist_t, pos: number): void {
  const size = alist.size--; // HACK
  for (let i = pos; i < size - 1; i++) {
    alist.square[i] = alist.square[i + 1];
  }
}

// alist_pop()
function alist_pop(alist: alist_t): number {
  let sq = SquareNone;
  let size = alist.size;
  if (size !== 0) {
    size--;
    sq = alist.square[size];
    alist.size = size;
  }
  return sq;
}
