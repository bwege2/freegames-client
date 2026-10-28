// Port of src/engine/pst.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// Pst[piece_12][square_64][stage] is Pst[((piece_12 << 6) | square_64) << 1 | stage].

import { option_get_int } from './option.ts';
import { WhiteBishop12, WhiteKing12, WhiteKnight12, WhitePawn12, WhiteQueen12, WhiteRook12 } from './piece.ts';

// constants
export const Opening = 0;
export const Endgame = 1;
export const StageNb = 2;

const A1 = 0o00, H1 = 0o07;
const D3 = 0o23, E3 = 0o24;
const D4 = 0o33, E4 = 0o34;
const D5 = 0o43, E5 = 0o44;
const A8 = 0o70, H8 = 0o77;

// constants and variables
let PieceActivityWeight = 256; // 100%
let KingSafetyWeight = 256; // 100%
let PawnStructureWeight = 256; // 100%

const PawnFileOpening = 5;
const KnightCentreOpening = 5;
const KnightCentreEndgame = 5;
const KnightRankOpening = 5;
const KnightBackRankOpening = 0;
const KnightTrapped = 100;
const BishopCentreOpening = 2;
const BishopCentreEndgame = 3;
const BishopBackRankOpening = 10;
const BishopDiagonalOpening = 4;
const RookFileOpening = 3;
const QueenCentreOpening = 0;
const QueenCentreEndgame = 4;
const QueenBackRankOpening = 5;
const KingCentreEndgame = 12;
const KingFileOpening = 10;
const KingRankOpening = 10;

// "constants"
const PawnFile = [-3, -1, +0, +1, +1, +0, -1, -3];
const KnightLine = [-4, -2, +0, +1, +1, +0, -2, -4];
const KnightRank = [-2, -1, +0, +1, +2, +3, +2, +1];
const BishopLine = [-3, -1, +0, +1, +1, +0, -1, -3];
const RookFile = [-2, -1, +0, +1, +1, +0, -1, -2];
const QueenLine = [-3, -1, +0, +1, +1, +0, -1, -3];
const KingLine = [-3, -1, +0, +1, +1, +0, -1, -3];
const KingFile = [+3, +4, +2, +0, +0, +2, +4, +3];
const KingRank = [+1, +0, -2, -3, -4, -5, -6, -7];

// variables
export const Pst = new Int16Array(12 * 64 * StageNb);

// macros
const I = (piece_12: number, square_64: number, stage: number): number => (((piece_12 << 6) | square_64) << 1) | stage;
export const PST = (piece_12: number, square_64: number, stage: number): number => Pst[I(piece_12, square_64, stage)];

/** P(piece,sq,stage) op= value, storing into the sint16 table */
function add(piece: number, sq: number, stage: number, value: number): void {
  Pst[I(piece, sq, stage)] += value;
}
function weight(piece: number, sq: number, stage: number, w: number): void {
  Pst[I(piece, sq, stage)] = ((Pst[I(piece, sq, stage)] * w) / 256) | 0;
}

// functions

// pst_init()
export function pst_init(): void {
  // UCI options
  PieceActivityWeight = ((option_get_int('Piece Activity') * 256 + 50) / 100) | 0;
  KingSafetyWeight = ((option_get_int('King Safety') * 256 + 50) / 100) | 0;
  PawnStructureWeight = ((option_get_int('Pawn Structure') * 256 + 50) / 100) | 0;
  // init
  Pst.fill(0);
  let piece: number;
  // pawns
  piece = WhitePawn12;
  // file
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, PawnFile[square_file(sq)] * PawnFileOpening);
  }
  // centre control
  add(piece, D3, Opening, 10);
  add(piece, E3, Opening, 10);
  add(piece, D4, Opening, 20);
  add(piece, E4, Opening, 20);
  add(piece, D5, Opening, 10);
  add(piece, E5, Opening, 10);
  // weight
  for (let sq = 0; sq < 64; sq++) {
    weight(piece, sq, Opening, PawnStructureWeight);
    weight(piece, sq, Endgame, PawnStructureWeight);
  }
  // knights
  piece = WhiteKnight12;
  // centre
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, KnightLine[square_file(sq)] * KnightCentreOpening);
    add(piece, sq, Opening, KnightLine[square_rank(sq)] * KnightCentreOpening);
    add(piece, sq, Endgame, KnightLine[square_file(sq)] * KnightCentreEndgame);
    add(piece, sq, Endgame, KnightLine[square_rank(sq)] * KnightCentreEndgame);
  }
  // rank
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, KnightRank[square_rank(sq)] * KnightRankOpening);
  }
  // back rank
  for (let sq = A1; sq <= H1; sq++) { // HACK: only first rank
    add(piece, sq, Opening, -KnightBackRankOpening);
  }
  // "trapped"
  add(piece, A8, Opening, -KnightTrapped);
  add(piece, H8, Opening, -KnightTrapped);
  // weight
  for (let sq = 0; sq < 64; sq++) {
    weight(piece, sq, Opening, PieceActivityWeight);
    weight(piece, sq, Endgame, PieceActivityWeight);
  }
  // bishops
  piece = WhiteBishop12;
  // centre
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, BishopLine[square_file(sq)] * BishopCentreOpening);
    add(piece, sq, Opening, BishopLine[square_rank(sq)] * BishopCentreOpening);
    add(piece, sq, Endgame, BishopLine[square_file(sq)] * BishopCentreEndgame);
    add(piece, sq, Endgame, BishopLine[square_rank(sq)] * BishopCentreEndgame);
  }
  // back rank
  for (let sq = A1; sq <= H1; sq++) { // HACK: only first rank
    add(piece, sq, Opening, -BishopBackRankOpening);
  }
  // main diagonals
  for (let i = 0; i < 8; i++) {
    const sq = square_make(i, i);
    add(piece, sq, Opening, BishopDiagonalOpening);
    add(piece, square_opp(sq), Opening, BishopDiagonalOpening);
  }
  // weight
  for (let sq = 0; sq < 64; sq++) {
    weight(piece, sq, Opening, PieceActivityWeight);
    weight(piece, sq, Endgame, PieceActivityWeight);
  }
  // rooks
  piece = WhiteRook12;
  // file
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, RookFile[square_file(sq)] * RookFileOpening);
  }
  // weight
  for (let sq = 0; sq < 64; sq++) {
    weight(piece, sq, Opening, PieceActivityWeight);
    weight(piece, sq, Endgame, PieceActivityWeight);
  }
  // queens
  piece = WhiteQueen12;
  // centre
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, QueenLine[square_file(sq)] * QueenCentreOpening);
    add(piece, sq, Opening, QueenLine[square_rank(sq)] * QueenCentreOpening);
    add(piece, sq, Endgame, QueenLine[square_file(sq)] * QueenCentreEndgame);
    add(piece, sq, Endgame, QueenLine[square_rank(sq)] * QueenCentreEndgame);
  }
  // back rank
  for (let sq = A1; sq <= H1; sq++) { // HACK: only first rank
    add(piece, sq, Opening, -QueenBackRankOpening);
  }
  // weight
  for (let sq = 0; sq < 64; sq++) {
    weight(piece, sq, Opening, PieceActivityWeight);
    weight(piece, sq, Endgame, PieceActivityWeight);
  }
  // kings
  piece = WhiteKing12;
  // centre
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Endgame, KingLine[square_file(sq)] * KingCentreEndgame);
    add(piece, sq, Endgame, KingLine[square_rank(sq)] * KingCentreEndgame);
  }
  // file
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, KingFile[square_file(sq)] * KingFileOpening);
  }
  // rank
  for (let sq = 0; sq < 64; sq++) {
    add(piece, sq, Opening, KingRank[square_rank(sq)] * KingRankOpening);
  }
  // weight
  for (let sq = 0; sq < 64; sq++) {
    weight(piece, sq, Opening, KingSafetyWeight);
    weight(piece, sq, Endgame, PieceActivityWeight);
  }
  // symmetry copy for black
  for (piece = 0; piece < 12; piece += 2) { // HACK
    for (let sq = 0; sq < 64; sq++) {
      for (let stage = 0; stage < StageNb; stage++) {
        Pst[I(piece + 1, sq, stage)] = -Pst[I(piece, square_opp(sq), stage)]; // HACK
      }
    }
  }
}

// square_make()
function square_make(file: number, rank: number): number {
  return (rank << 3) | file;
}

// square_file()
function square_file(square: number): number {
  return square & 7;
}

// square_rank()
function square_rank(square: number): number {
  return square >> 3;
}

// square_opp()
function square_opp(square: number): number {
  return square ^ 0o70;
}
