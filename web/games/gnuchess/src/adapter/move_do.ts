// Port of src/adapter/move_do.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { board_flags, s16, SideA, SideH, SideNb, type board_t } from './board.ts';
import { Black, colour_equal, colour_is_white, colour_opp } from './colour.ts';
import { hash_castle_key, RandomEnPassant, RandomPiece, RandomTurn } from './hash.ts';
import { move_from, move_is_promote, move_promote_hack, move_to } from './move.ts';
import { piece_colour, piece_is_king, piece_is_pawn, piece_make_pawn, piece_to_12, Rook64 } from './piece.ts';
import { random_64 } from './random.ts';
import { FileC, FileD, FileF, FileG, Rank1, Rank8, SquareNone, square_ep_dual, square_file, square_make, square_to_64 } from './square.ts';

// functions

// move_do()

export function move_do(board: board_t, move: number): void {
   let pos: number, capture: number;
   let sq: number;
   // init
   const me = board.turn;
   const opp = colour_opp(me);
   const from = move_from(move);
   const to = move_to(move);
   let piece = board.square[from];
   pos = board.pos[from];
   // update turn
   board.turn = opp;
   board.key ^= random_64(RandomTurn);
   // update castling rights
   const old_flags = board_flags(board);
   if (piece_is_king(piece)) {
      board.castle[me * SideNb + SideH] = SquareNone;
      board.castle[me * SideNb + SideA] = SquareNone;
   }
   if (board.castle[me * SideNb + SideH] === from) board.castle[me * SideNb + SideH] = SquareNone;
   if (board.castle[me * SideNb + SideA] === from) board.castle[me * SideNb + SideA] = SquareNone;
   if (board.castle[opp * SideNb + SideH] === to) board.castle[opp * SideNb + SideH] = SquareNone;
   if (board.castle[opp * SideNb + SideA] === to) board.castle[opp * SideNb + SideA] = SquareNone;
   const new_flags = board_flags(board);
   board.key ^= hash_castle_key(new_flags ^ old_flags); // HACK
   // update en-passant square
   const ep_square = sq = board.ep_square;
   if (sq !== SquareNone) {
      board.key ^= random_64(RandomEnPassant + square_file(sq));
      board.ep_square = SquareNone;
   }
   if (piece_is_pawn(piece) && Math.abs(to - from) === 32) {
      const pawn = piece_make_pawn(opp);
      if (board.square[to - 1] === pawn || board.square[to + 1] === pawn) {
         board.ep_square = sq = (from + to) / 2;
         board.key ^= random_64(RandomEnPassant + square_file(sq));
      }
   }
   // update ply number (captures are handled later)
   board.ply_nb = s16(board.ply_nb + 1);
   if (piece_is_pawn(piece)) board.ply_nb = 0; // conversion
   // update move number
   if (me === Black) board.move_nb = s16(board.move_nb + 1);
   // castle
   if (colour_equal(board.square[to], me)) {
      let king_to: number, rook_to: number;
      const rank = colour_is_white(me) ? Rank1 : Rank8;
      const king_from = from;
      const rook_from = to;
      if (to > from) { // h side
         king_to = square_make(FileG, rank);
         rook_to = square_make(FileF, rank);
      } else { // a side
         king_to = square_make(FileC, rank);
         rook_to = square_make(FileD, rank);
      }
      // remove the rook
      pos = board.pos[rook_from];
      const rook = Rook64 | me; // HACK
      square_clear(board, rook_from, rook);
      // move the king
      square_move(board, king_from, king_to, piece);
      // put the rook back
      square_set(board, rook_to, rook, pos);
      return;
   }
   // remove the captured piece
   if (piece_is_pawn(piece) && to === ep_square) {
      // en-passant capture
      sq = square_ep_dual(to);
      capture = board.square[sq];
      square_clear(board, sq, capture);
      board.ply_nb = 0; // conversion
   } else {
      capture = board.square[to];
      if (capture !== 0) {
         // normal capture
         square_clear(board, to, capture);
         board.ply_nb = 0; // conversion
      }
   }
   // move the piece
   if (move_is_promote(move)) {
      // promote
      square_clear(board, from, piece);
      piece = move_promote_hack(move) | me; // HACK
      square_set(board, to, piece, pos);
   } else {
      // normal move
      square_move(board, from, to, piece);
   }
}

// square_clear()

function square_clear(board: board_t, square: number, piece: number): void {
   // init
   const pos = board.pos[square];
   const colour = piece_colour(piece);
   const piece_12 = piece_to_12(piece);
   // square
   board.square[square] = 0; // Empty
   board.pos[square] = -1; // not needed
   // piece list
   const size = --board.list_size[colour];
   if (pos !== size) {
      const sq = board.list[colour * 32 + size];
      board.pos[sq] = pos;
      board.list[colour * 32 + pos] = sq;
   }
   board.list[colour * 32 + size] = SquareNone;
   // material
   board.number[piece_12]--;
   // hash key
   board.key ^= random_64(RandomPiece + piece_12 * 64 + square_to_64(square));
}

// square_set()

function square_set(board: board_t, square: number, piece: number, pos: number): void {
   // init
   const colour = piece_colour(piece);
   const piece_12 = piece_to_12(piece);
   // square
   board.square[square] = piece;
   board.pos[square] = pos;
   // piece list
   const size = board.list_size[colour]++;
   if (pos !== size) {
      const sq = board.list[colour * 32 + pos];
      board.pos[sq] = size;
      board.list[colour * 32 + size] = sq;
   }
   board.list[colour * 32 + pos] = square;
   // material
   board.number[piece_12]++;
   // hash key
   board.key ^= random_64(RandomPiece + piece_12 * 64 + square_to_64(square));
}

// square_move()

function square_move(board: board_t, from: number, to: number, piece: number): void {
   // init
   const colour = piece_colour(piece);
   const pos = board.pos[from];
   // from
   board.square[from] = 0; // Empty
   board.pos[from] = -1; // not needed
   // to
   board.square[to] = piece;
   board.pos[to] = pos;
   // piece list
   board.list[colour * 32 + pos] = to;
   // hash key
   const piece_index = RandomPiece + piece_to_12(piece) * 64;
   board.key ^= random_64(piece_index + square_to_64(from))
      ^ random_64(piece_index + square_to_64(to));
}
