// Port of src/engine/board.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// board_t's arrays are typed arrays; piece[colour][i] is piece[colour*32+i], pawn[colour][i] is
// pawn[colour*16+i], pawn_file[colour][file] is pawn_file[colour*16+file]; the uint64 keys are
// (hi, lo) pairs of int32 and the key stack is two arrays of halves.

import { attack_set, attack_t, ATTACK_IN_CHECK, IS_IN_CHECK } from './attack.ts';
import { ColourNb, COLOUR_IS, COLOUR_IS_WHITE, COLOUR_OPP } from './colour.ts';
import { hash_key, hash_material_key, hash_pawn_key, KeyOut } from './hash.ts';
import { list_t, LIST_MOVE, LIST_SIZE } from './list.ts';
import { legal_evasion_exist } from './move_evasion.ts';
import { gen_moves } from './move_gen.ts';
import { pseudo_is_legal } from './move_legal.ts';
import { BIT } from './pawn.ts';
import {
  BlackBishop256, BlackKing12, BlackKing256, BlackKnight256, BlackPawn256, BlackQueen256, BlackRook256,
  Knight64, piece_is_ok, PIECE_IS_PAWN, PIECE_ORDER, PIECE_TO_12, WhiteBishop256, WhiteKing12, WhiteKing256,
  WhiteKnight256, WhitePawn256, WhiteQueen256, WhiteRook256,
} from './piece.ts';
import { Endgame, Opening, Pst } from './pst.ts';
import { FileNb, PAWN_RANK, SquareNb, SquareNone, SQUARE_FILE, SQUARE_FROM_64, SQUARE_IS_PROMOTE, SQUARE_TO_64 } from './square.ts';
import { my_fatal } from './util.ts';

// constants
export const Empty = 0;
export const Edge = Knight64; // HACK: uncoloured knight

export const WP = WhitePawn256;
export const WN = WhiteKnight256;
export const WB = WhiteBishop256;
export const WR = WhiteRook256;
export const WQ = WhiteQueen256;
export const WK = WhiteKing256;

export const BP = BlackPawn256;
export const BN = BlackKnight256;
export const BB = BlackBishop256;
export const BR = BlackRook256;
export const BQ = BlackQueen256;
export const BK = BlackKing256;

export const FlagsNone = 0;
export const FlagsWhiteKingCastle = 1 << 0;
export const FlagsWhiteQueenCastle = 1 << 1;
export const FlagsBlackKingCastle = 1 << 2;
export const FlagsBlackQueenCastle = 1 << 3;

export const StackSize = 4096;

// types
export class board_t {
  square = new Int32Array(SquareNb);
  pos = new Int32Array(SquareNb);
  piece = new Int32Array(ColourNb * 32); // only 17 are needed
  piece_size = new Int32Array(ColourNb);
  pawn = new Int32Array(ColourNb * 16); // only 9 are needed
  pawn_size = new Int32Array(ColourNb);
  piece_nb = 0;
  number = new Int32Array(16); // only 12 are needed
  pawn_file = new Int32Array(ColourNb * FileNb);
  turn = 0;
  flags = 0;
  ep_square = 0;
  ply_nb = 0;
  sp = 0; // TODO: MOVE ME?
  cap_sq = 0;
  opening = 0;
  endgame = 0;
  key_hi = 0;
  key_lo = 0;
  pawn_key_hi = 0;
  pawn_key_lo = 0;
  material_key_hi = 0;
  material_key_lo = 0;
  stack_hi = new Int32Array(StackSize);
  stack_lo = new Int32Array(StackSize);
}

// macros
export const KING_POS = (board: board_t, colour: number): number => board.piece[colour * 32];

// functions

// board_is_ok(): the original's checks run only with UseSlowDebug (false)
export function board_is_ok(_board: board_t): boolean {
  return true;
}

// board_clear()
export function board_clear(board: board_t): void {
  // edge squares
  for (let sq = 0; sq < SquareNb; sq++) {
    board.square[sq] = Edge;
  }
  // empty squares
  for (let sq_64 = 0; sq_64 < 64; sq_64++) {
    const sq = SQUARE_FROM_64(sq_64);
    board.square[sq] = Empty;
  }
  // misc
  board.turn = -1; // ColourNone
  board.flags = FlagsNone;
  board.ep_square = SquareNone;
  board.ply_nb = 0;
}

// board_copy()
export function board_copy(dst: board_t, src: board_t): void {
  dst.square.set(src.square);
  dst.pos.set(src.pos);
  dst.piece.set(src.piece);
  dst.piece_size.set(src.piece_size);
  dst.pawn.set(src.pawn);
  dst.pawn_size.set(src.pawn_size);
  dst.piece_nb = src.piece_nb;
  dst.number.set(src.number);
  dst.pawn_file.set(src.pawn_file);
  dst.turn = src.turn;
  dst.flags = src.flags;
  dst.ep_square = src.ep_square;
  dst.ply_nb = src.ply_nb;
  dst.sp = src.sp;
  dst.cap_sq = src.cap_sq;
  dst.opening = src.opening;
  dst.endgame = src.endgame;
  dst.key_hi = src.key_hi;
  dst.key_lo = src.key_lo;
  dst.pawn_key_hi = src.pawn_key_hi;
  dst.pawn_key_lo = src.pawn_key_lo;
  dst.material_key_hi = src.material_key_hi;
  dst.material_key_lo = src.material_key_lo;
  dst.stack_hi.set(src.stack_hi);
  dst.stack_lo.set(src.stack_lo);
}

// board_init_list()
export function board_init_list(board: board_t): void {
  // init
  for (let sq = 0; sq < SquareNb; sq++) {
    board.pos[sq] = -1;
  }
  board.piece_nb = 0;
  for (let piece = 0; piece < 12; piece++) board.number[piece] = 0;
  // piece lists
  for (let colour = 0; colour < ColourNb; colour++) {
    // piece list
    let pos = 0;
    for (let sq_64 = 0; sq_64 < 64; sq_64++) {
      const sq = SQUARE_FROM_64(sq_64);
      const piece = board.square[sq];
      if (piece !== Empty && !piece_is_ok(piece)) my_fatal('board_init_list(): illegal position\n');
      if (COLOUR_IS(piece, colour) && !PIECE_IS_PAWN(piece)) {
        if (pos >= 16) my_fatal('board_init_list(): illegal position\n');
        board.pos[sq] = pos;
        board.piece[colour * 32 + pos] = sq;
        pos++;
        board.piece_nb++;
        board.number[PIECE_TO_12(piece)]++;
      }
    }
    if (board.number[COLOUR_IS_WHITE(colour) ? WhiteKing12 : BlackKing12] !== 1) my_fatal('board_init_list(): illegal position\n');
    board.piece[colour * 32 + pos] = SquareNone;
    board.piece_size[colour] = pos;
    // MV sort
    const size = board.piece_size[colour];
    for (let i = 1; i < size; i++) {
      const square = board.piece[colour * 32 + i];
      const piece = board.square[square];
      const order = PIECE_ORDER(piece);
      let sq: number;
      for (pos = i; pos > 0 && order > PIECE_ORDER(board.square[(sq = board.piece[colour * 32 + pos - 1])]); pos--) {
        board.piece[colour * 32 + pos] = sq;
        board.pos[sq] = pos;
      }
      board.piece[colour * 32 + pos] = square;
      board.pos[square] = pos;
    }
    // pawn list
    for (let file = 0; file < FileNb; file++) {
      board.pawn_file[colour * 16 + file] = 0;
    }
    pos = 0;
    for (let sq_64 = 0; sq_64 < 64; sq_64++) {
      const sq = SQUARE_FROM_64(sq_64);
      const piece = board.square[sq];
      if (COLOUR_IS(piece, colour) && PIECE_IS_PAWN(piece)) {
        if (pos >= 8 || SQUARE_IS_PROMOTE(sq)) my_fatal('board_init_list(): illegal position\n');
        board.pos[sq] = pos;
        board.pawn[colour * 16 + pos] = sq;
        pos++;
        board.piece_nb++;
        board.number[PIECE_TO_12(piece)]++;
        board.pawn_file[colour * 16 + SQUARE_FILE(sq)] |= BIT(PAWN_RANK(sq, colour));
      }
    }
    board.pawn[colour * 16 + pos] = SquareNone;
    board.pawn_size[colour] = pos;
    if (board.piece_size[colour] + board.pawn_size[colour] > 16) my_fatal('board_init_list(): illegal position\n');
  }
  // last square
  board.cap_sq = SquareNone;
  // PST
  board.opening = board_opening(board);
  board.endgame = board_endgame(board);
  // hash key
  for (let i = 0; i < board.ply_nb; i++) {
    board.stack_hi[i] = 0; // HACK
    board.stack_lo[i] = 0;
  }
  board.sp = board.ply_nb;
  hash_key(board);
  board.key_hi = KeyOut[0];
  board.key_lo = KeyOut[1];
  hash_pawn_key(board);
  board.pawn_key_hi = KeyOut[0];
  board.pawn_key_lo = KeyOut[1];
  hash_material_key(board);
  board.material_key_hi = KeyOut[0];
  board.material_key_lo = KeyOut[1];
  // legality
  if (!board_is_legal(board)) my_fatal('board_init_list(): illegal position\n');
}

// board_is_legal()
export function board_is_legal(board: board_t): boolean {
  return !IS_IN_CHECK(board, COLOUR_OPP(board.turn));
}

// board_is_check()
export function board_is_check(board: board_t): boolean {
  return IS_IN_CHECK(board, board.turn);
}

// scratch objects, made on first use (not while the modules load: they import each other)
let mate_attack: attack_t | undefined;

// board_is_mate()
export function board_is_mate(board: board_t): boolean {
  const attack = (mate_attack ??= new attack_t());
  attack_set(attack, board);
  if (!ATTACK_IN_CHECK(attack)) return false; // not in check => not mate
  if (legal_evasion_exist(board, attack)) return false; // legal move => not mate
  return true; // in check and no legal move => mate
}

let stalemate_list: list_t | undefined;

// board_is_stalemate()
export function board_is_stalemate(board: board_t): boolean {
  const list = (stalemate_list ??= new list_t());
  // init
  if (IS_IN_CHECK(board, board.turn)) return false; // in check => not stalemate
  // move loop
  gen_moves(list, board);
  for (let i = 0; i < LIST_SIZE(list); i++) {
    const move = LIST_MOVE(list, i);
    if (pseudo_is_legal(move, board)) return false; // legal move => not stalemate
  }
  return true; // in check and no legal move => mate
}

// board_is_repetition()
export function board_is_repetition(board: board_t): boolean {
  // 50-move rule
  if (board.ply_nb >= 100) { // potential draw
    if (board.ply_nb > 100) return true;
    return !board_is_mate(board);
  }
  // position repetition
  const sp = board.sp, hi = board.key_hi, lo = board.key_lo;
  for (let i = 4; i <= board.ply_nb; i += 2) {
    if (board.stack_lo[sp - i] === lo && board.stack_hi[sp - i] === hi) return true;
  }
  return false;
}

// board_opening()
export function board_opening(board: board_t): number {
  let opening = 0;
  for (let colour = 0; colour < ColourNb; colour++) {
    for (let p = colour * 32, sq: number; (sq = board.piece[p]) !== SquareNone; p++) {
      opening += Pst[(((PIECE_TO_12(board.square[sq]) << 6) | SQUARE_TO_64(sq)) << 1) | Opening];
    }
    for (let p = colour * 16, sq: number; (sq = board.pawn[p]) !== SquareNone; p++) {
      opening += Pst[(((PIECE_TO_12(board.square[sq]) << 6) | SQUARE_TO_64(sq)) << 1) | Opening];
    }
  }
  return opening;
}

// board_endgame()
export function board_endgame(board: board_t): number {
  let endgame = 0;
  for (let colour = 0; colour < ColourNb; colour++) {
    for (let p = colour * 32, sq: number; (sq = board.piece[p]) !== SquareNone; p++) {
      endgame += Pst[(((PIECE_TO_12(board.square[sq]) << 6) | SQUARE_TO_64(sq)) << 1) | Endgame];
    }
    for (let p = colour * 16, sq: number; (sq = board.pawn[p]) !== SquareNone; p++) {
      endgame += Pst[(((PIECE_TO_12(board.square[sq]) << 6) | SQUARE_TO_64(sq)) << 1) | Endgame];
    }
  }
  return endgame;
}

