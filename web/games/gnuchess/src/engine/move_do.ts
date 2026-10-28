// Port of src/engine/move_do.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import {
  board_t, Empty, FlagsBlackKingCastle, FlagsBlackQueenCastle, FlagsWhiteKingCastle,
  FlagsWhiteQueenCastle,
} from './board.ts';
import { COLOUR_FLAG, COLOUR_OPP } from './colour.ts';
import { Castle64Hi, Castle64Lo, RandomEnPassant, RandomPiece, RandomTurn } from './hash.ts';
import { MoveFlags, MoveCastle, MoveEnPassant, MovePromote, move_promote, MOVE_FROM, MOVE_TO } from './move.ts';
import { BIT } from './pawn.ts';
import { PAWN_MAKE, PIECE_COLOUR, PIECE_IS_PAWN, PIECE_TO_12, Rook64 } from './piece.ts';
import { Pst } from './pst.ts';
import { Random64Hi, Random64Lo } from './random.ts';
import {
  A1, A8, C1, C8, D1, D8, E1, E8, F1, F8, FileA, G1, G8, H1, H8, PAWN_RANK, SquareNb, SquareNone, SQUARE_EP_DUAL,
  SQUARE_FILE, SQUARE_TO_64,
} from './square.ts';

// types
export class undo_t {
  capture = false;
  capture_square = 0;
  capture_piece = 0;
  capture_pos = 0;
  pawn_pos = 0;
  turn = 0;
  flags = 0;
  ep_square = 0;
  ply_nb = 0;
  cap_sq = 0;
  opening = 0;
  endgame = 0;
  key_hi = 0;
  key_lo = 0;
  pawn_key_hi = 0;
  pawn_key_lo = 0;
  material_key_hi = 0;
  material_key_lo = 0;
}

// variables
const CastleMask = new Int32Array(SquareNb);

// functions

// move_do_init()
export function move_do_init(): void {
  for (let sq = 0; sq < SquareNb; sq++) CastleMask[sq] = 0xf;
  CastleMask[E1] &= ~FlagsWhiteKingCastle;
  CastleMask[H1] &= ~FlagsWhiteKingCastle;
  CastleMask[E1] &= ~FlagsWhiteQueenCastle;
  CastleMask[A1] &= ~FlagsWhiteQueenCastle;
  CastleMask[E8] &= ~FlagsBlackKingCastle;
  CastleMask[H8] &= ~FlagsBlackKingCastle;
  CastleMask[E8] &= ~FlagsBlackQueenCastle;
  CastleMask[A8] &= ~FlagsBlackQueenCastle;
}

// move_do()
export function move_do(board: board_t, move: number, undo: undo_t): void {
  // initialise undo
  undo.capture = false;
  undo.turn = board.turn;
  undo.flags = board.flags;
  undo.ep_square = board.ep_square;
  undo.ply_nb = board.ply_nb;
  undo.cap_sq = board.cap_sq;
  undo.opening = board.opening;
  undo.endgame = board.endgame;
  undo.key_hi = board.key_hi;
  undo.key_lo = board.key_lo;
  undo.pawn_key_hi = board.pawn_key_hi;
  undo.pawn_key_lo = board.pawn_key_lo;
  undo.material_key_hi = board.material_key_hi;
  undo.material_key_lo = board.material_key_lo;
  // init
  const me = board.turn;
  const opp = COLOUR_OPP(me);
  const from = MOVE_FROM(move);
  const to = MOVE_TO(move);
  let piece = board.square[from];
  // update key stack
  board.stack_hi[board.sp] = board.key_hi;
  board.stack_lo[board.sp] = board.key_lo;
  board.sp++;
  // update turn
  board.turn = opp;
  board.key_hi ^= Random64Hi[RandomTurn];
  board.key_lo ^= Random64Lo[RandomTurn];
  // update castling rights
  const old_flags = board.flags;
  const new_flags = old_flags & CastleMask[from] & CastleMask[to];
  board.flags = new_flags;
  board.key_hi ^= Castle64Hi[new_flags ^ old_flags]; // HACK
  board.key_lo ^= Castle64Lo[new_flags ^ old_flags];
  // update en-passant square
  let sq: number;
  if ((sq = board.ep_square) !== SquareNone) {
    board.key_hi ^= Random64Hi[RandomEnPassant + SQUARE_FILE(sq) - FileA];
    board.key_lo ^= Random64Lo[RandomEnPassant + SQUARE_FILE(sq) - FileA];
    board.ep_square = SquareNone;
  }
  if (PIECE_IS_PAWN(piece)) {
    const delta = to - from;
    if (delta === +32 || delta === -32) {
      const pawn = PAWN_MAKE(opp);
      if (board.square[to - 1] === pawn || board.square[to + 1] === pawn) {
        board.ep_square = (from + to) >> 1;
        board.key_hi ^= Random64Hi[RandomEnPassant + SQUARE_FILE(to) - FileA];
        board.key_lo ^= Random64Lo[RandomEnPassant + SQUARE_FILE(to) - FileA];
      }
    }
  }
  // update move number (captures are handled later)
  board.ply_nb++;
  if (PIECE_IS_PAWN(piece)) board.ply_nb = 0; // conversion
  // update last square
  board.cap_sq = SquareNone;
  // remove the captured piece
  sq = to;
  if ((move & MoveFlags) === MoveEnPassant) sq = SQUARE_EP_DUAL(sq);
  let capture: number;
  if ((capture = board.square[sq]) !== Empty) {
    undo.capture = true;
    undo.capture_square = sq;
    undo.capture_piece = capture;
    undo.capture_pos = board.pos[sq];
    square_clear(board, sq, capture, true);
    board.ply_nb = 0; // conversion
    board.cap_sq = to;
  }
  // move the piece
  if ((move & MoveFlags) === MovePromote) {
    // promote
    undo.pawn_pos = board.pos[from];
    square_clear(board, from, piece, true);
    piece = move_promote(move);
    // insert the promote piece in MV order
    let pos: number;
    for (pos = board.piece_size[me]; pos > 0 && piece > board.square[board.piece[me * 32 + pos - 1]]; pos--) // HACK
      ;
    square_set(board, to, piece, pos, true);
    board.cap_sq = to;
  } else {
    // normal move
    square_move(board, from, to, piece, true);
  }
  // move the rook in case of castling
  if ((move & MoveFlags) === MoveCastle) {
    const rook = Rook64 | COLOUR_FLAG(me); // HACK
    if (to === G1) {
      square_move(board, H1, F1, rook, true);
    } else if (to === C1) {
      square_move(board, A1, D1, rook, true);
    } else if (to === G8) {
      square_move(board, H8, F8, rook, true);
    } else if (to === C8) {
      square_move(board, A8, D8, rook, true);
    }
  }
}

// move_undo()
export function move_undo(board: board_t, move: number, undo: undo_t): void {
  // init
  const me = undo.turn;
  const from = MOVE_FROM(move);
  const to = MOVE_TO(move);
  let piece = board.square[to];
  // castle
  if ((move & MoveFlags) === MoveCastle) {
    const rook = Rook64 | COLOUR_FLAG(me); // HACK
    if (to === G1) {
      square_move(board, F1, H1, rook, false);
    } else if (to === C1) {
      square_move(board, D1, A1, rook, false);
    } else if (to === G8) {
      square_move(board, F8, H8, rook, false);
    } else if (to === C8) {
      square_move(board, D8, A8, rook, false);
    }
  }
  // move the piece backward
  if ((move & MoveFlags) === MovePromote) {
    // promote
    square_clear(board, to, piece, false);
    piece = PAWN_MAKE(me);
    const pos = undo.pawn_pos;
    square_set(board, from, piece, pos, false);
  } else {
    // normal move
    square_move(board, to, from, piece, false);
  }
  // put the captured piece back
  if (undo.capture) {
    square_set(board, undo.capture_square, undo.capture_piece, undo.capture_pos, false);
  }
  // update board info
  board.turn = undo.turn;
  board.flags = undo.flags;
  board.ep_square = undo.ep_square;
  board.ply_nb = undo.ply_nb;
  board.cap_sq = undo.cap_sq;
  board.opening = undo.opening;
  board.endgame = undo.endgame;
  board.key_hi = undo.key_hi;
  board.key_lo = undo.key_lo;
  board.pawn_key_hi = undo.pawn_key_hi;
  board.pawn_key_lo = undo.pawn_key_lo;
  board.material_key_hi = undo.material_key_hi;
  board.material_key_lo = undo.material_key_lo;
  // update key stack
  board.sp--;
}

// move_do_null()
export function move_do_null(board: board_t, undo: undo_t): void {
  // initialise undo
  undo.turn = board.turn;
  undo.ep_square = board.ep_square;
  undo.ply_nb = board.ply_nb;
  undo.cap_sq = board.cap_sq;
  undo.key_hi = board.key_hi;
  undo.key_lo = board.key_lo;
  // update key stack
  board.stack_hi[board.sp] = board.key_hi;
  board.stack_lo[board.sp] = board.key_lo;
  board.sp++;
  // update turn
  board.turn = COLOUR_OPP(board.turn);
  board.key_hi ^= Random64Hi[RandomTurn];
  board.key_lo ^= Random64Lo[RandomTurn];
  // update en-passant square
  const sq = board.ep_square;
  if (sq !== SquareNone) {
    board.key_hi ^= Random64Hi[RandomEnPassant + SQUARE_FILE(sq) - FileA];
    board.key_lo ^= Random64Lo[RandomEnPassant + SQUARE_FILE(sq) - FileA];
    board.ep_square = SquareNone;
  }
  // update move number
  board.ply_nb = 0; // HACK: null move is considered as a conversion
  // update last square
  board.cap_sq = SquareNone;
}

// move_undo_null()
export function move_undo_null(board: board_t, undo: undo_t): void {
  // update board info
  board.turn = undo.turn;
  board.ep_square = undo.ep_square;
  board.ply_nb = undo.ply_nb;
  board.cap_sq = undo.cap_sq;
  board.key_hi = undo.key_hi;
  board.key_lo = undo.key_lo;
  // update key stack
  board.sp--;
}

// square_clear()
function square_clear(board: board_t, square: number, piece: number, update: boolean): void {
  // init
  const pos = board.pos[square];
  const piece_12 = PIECE_TO_12(piece);
  const colour = PIECE_COLOUR(piece);
  // square
  board.square[square] = Empty;
  // piece list
  if (!PIECE_IS_PAWN(piece)) {
    // init
    let size = board.piece_size[colour];
    const list = board.piece, base = colour * 32;
    // stable swap
    board.pos[square] = -1;
    for (let i = pos; i < size - 1; i++) {
      const sq = list[base + i + 1];
      list[base + i] = sq;
      board.pos[sq] = i;
    }
    // size
    size--;
    list[base + size] = SquareNone;
    board.piece_size[colour] = size;
  } else {
    // init
    let size = board.pawn_size[colour];
    const list = board.pawn, base = colour * 16;
    // stable swap
    board.pos[square] = -1;
    for (let i = pos; i < size - 1; i++) {
      const sq = list[base + i + 1];
      list[base + i] = sq;
      board.pos[sq] = i;
    }
    // size
    size--;
    list[base + size] = SquareNone;
    board.pawn_size[colour] = size;
    // pawn "bitboard"
    board.pawn_file[colour * 16 + SQUARE_FILE(square)] ^= BIT(PAWN_RANK(square, colour));
  }
  // material
  board.piece_nb--;
  board.number[piece_12]--;
  // update
  if (update) {
    // init
    const sq_64 = SQUARE_TO_64(square);
    // PST
    board.opening -= Pst[(((piece_12 << 6) | sq_64) << 1) | 0];
    board.endgame -= Pst[(((piece_12 << 6) | sq_64) << 1) | 1];
    // hash key
    const index = RandomPiece + (piece_12 ^ 1) * 64 + sq_64; // HACK: ^1 for PolyGlot book
    const hash_hi = Random64Hi[index], hash_lo = Random64Lo[index];
    board.key_hi ^= hash_hi;
    board.key_lo ^= hash_lo;
    if (PIECE_IS_PAWN(piece)) {
      board.pawn_key_hi ^= hash_hi;
      board.pawn_key_lo ^= hash_lo;
    }
    // material key
    const m = piece_12 * 16 + board.number[piece_12];
    board.material_key_hi ^= Random64Hi[m];
    board.material_key_lo ^= Random64Lo[m];
  }
}

// square_set()
function square_set(board: board_t, square: number, piece: number, pos: number, update: boolean): void {
  // init
  const piece_12 = PIECE_TO_12(piece);
  const colour = PIECE_COLOUR(piece);
  // square
  board.square[square] = piece;
  // piece list
  if (!PIECE_IS_PAWN(piece)) {
    // init
    let size = board.piece_size[colour];
    const list = board.piece, base = colour * 32;
    // size
    size++;
    list[base + size] = SquareNone;
    board.piece_size[colour] = size;
    // stable swap
    for (let i = size - 1; i > pos; i--) {
      const sq = list[base + i - 1];
      list[base + i] = sq;
      board.pos[sq] = i;
    }
    list[base + pos] = square;
    board.pos[square] = pos;
  } else {
    // init
    let size = board.pawn_size[colour];
    const list = board.pawn, base = colour * 16;
    // size
    size++;
    list[base + size] = SquareNone;
    board.pawn_size[colour] = size;
    // stable swap
    for (let i = size - 1; i > pos; i--) {
      const sq = list[base + i - 1];
      list[base + i] = sq;
      board.pos[sq] = i;
    }
    list[base + pos] = square;
    board.pos[square] = pos;
    // pawn "bitboard"
    board.pawn_file[colour * 16 + SQUARE_FILE(square)] ^= BIT(PAWN_RANK(square, colour));
  }
  // material
  board.piece_nb++;
  board.number[piece_12]++;
  // update
  if (update) {
    // init
    const sq_64 = SQUARE_TO_64(square);
    // PST
    board.opening += Pst[(((piece_12 << 6) | sq_64) << 1) | 0];
    board.endgame += Pst[(((piece_12 << 6) | sq_64) << 1) | 1];
    // hash key
    const index = RandomPiece + (piece_12 ^ 1) * 64 + sq_64; // HACK: ^1 for PolyGlot book
    const hash_hi = Random64Hi[index], hash_lo = Random64Lo[index];
    board.key_hi ^= hash_hi;
    board.key_lo ^= hash_lo;
    if (PIECE_IS_PAWN(piece)) {
      board.pawn_key_hi ^= hash_hi;
      board.pawn_key_lo ^= hash_lo;
    }
    // material key
    const m = piece_12 * 16 + (board.number[piece_12] - 1);
    board.material_key_hi ^= Random64Hi[m];
    board.material_key_lo ^= Random64Lo[m];
  }
}

// square_move()
function square_move(board: board_t, from: number, to: number, piece: number, update: boolean): void {
  // init
  const colour = PIECE_COLOUR(piece);
  const pos = board.pos[from];
  // from
  board.square[from] = Empty;
  board.pos[from] = -1; // not needed
  // to
  board.square[to] = piece;
  board.pos[to] = pos;
  // piece list
  if (!PIECE_IS_PAWN(piece)) {
    board.piece[colour * 32 + pos] = to;
  } else {
    board.pawn[colour * 16 + pos] = to;
    // pawn "bitboard"
    board.pawn_file[colour * 16 + SQUARE_FILE(from)] ^= BIT(PAWN_RANK(from, colour));
    board.pawn_file[colour * 16 + SQUARE_FILE(to)] ^= BIT(PAWN_RANK(to, colour));
  }
  // update
  if (update) {
    // init
    const from_64 = SQUARE_TO_64(from);
    const to_64 = SQUARE_TO_64(to);
    const piece_12 = PIECE_TO_12(piece);
    // PST
    board.opening += Pst[(((piece_12 << 6) | to_64) << 1) | 0] - Pst[(((piece_12 << 6) | from_64) << 1) | 0];
    board.endgame += Pst[(((piece_12 << 6) | to_64) << 1) | 1] - Pst[(((piece_12 << 6) | from_64) << 1) | 1];
    // hash key
    const piece_index = RandomPiece + (piece_12 ^ 1) * 64; // HACK: ^1 for PolyGlot book
    const hash_hi = Random64Hi[piece_index + to_64] ^ Random64Hi[piece_index + from_64];
    const hash_lo = Random64Lo[piece_index + to_64] ^ Random64Lo[piece_index + from_64];
    board.key_hi ^= hash_hi;
    board.key_lo ^= hash_lo;
    if (PIECE_IS_PAWN(piece)) {
      board.pawn_key_hi ^= hash_hi;
      board.pawn_key_lo ^= hash_lo;
    }
  }
}
