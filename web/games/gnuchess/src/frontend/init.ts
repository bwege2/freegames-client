// Port of src/frontend/init.cc of GNU Chess 6.3.0: the bitboard tables and the variables of a new game.
import {
  A1, A2, A3, A4, A5, A6, A7, A8, B1, B2, B7, B8, C3, C6, D4, D5, E1, E4, E5, E8, F3, F6, G1, G2, G7, G8, H1, H2, H7, H8,
  B_FILE, H_FILE,
  BCASTLE, BitCount, BitPosArray, Bishop315Atak, Bishop45Atak, ExchCnt, FileBit, FromToRay, Game, MoveArray,
  NULLBITBOARD, NotBitPosArray, PHASE, Rook00Atak, Rook90Atak, Ray, RankBit, TreePtr, USEHASH, USENULL,
  ValueB, ValueN, ValueP, ValueQ, ValueR, WCASTLE, ENDED, black, bishop, board, bpawn, cboard, clearBoard,
  directions, g, king, knight, lzArray, pawn, queen, r315, r45, r90, range, rook, white, SETBIT, MASK64,
  type BitBoard,
} from './common.ts';
import { UpdateCBoard, UpdateFriends, UpdateMvboard } from './util.ts';
import { pgn } from './lexpgn.ts';

export function Initialize(): void {
  InitLzArray();
  InitBitPosArray();
  InitMoveArray();
  InitRay();
  InitFromToRay();
  InitRankFileBit();
  InitBitCount();
  InitRotAtak();
  InitVars();
}

const NBITS = 16;

export function InitLzArray(): void {
  let s = 1, n = 1;
  for (let i = 0; i < NBITS; i++) {
    for (let j = s; j < s + n; j++) lzArray[j] = NBITS - 1 - i;
    s += n;
    n += n;
  }
}

export function InitBitPosArray(): void {
  let b: BitBoard = 1n;
  for (let i = 63; i >= 0; i--, b = (b << 1n) & MASK64) {
    BitPosArray[i] = b;
    NotBitPosArray[i] = b ^ MASK64;
  }
}

/*  Data used for generating MoveArray  */
const dir = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [9, 11, 0, 0, 0, 0, 0, 0],
  [-21, -19, -12, -8, 8, 12, 19, 21],
  [-11, -9, 9, 11, 0, 0, 0, 0],
  [-10, -1, 1, 10, 0, 0, 0, 0],
  [-11, -10, -9, -1, 1, 9, 10, 11],
  [-11, -10, -9, -1, 1, 9, 10, 11],
  [-9, -11, 0, 0, 0, 0, 0, 0],
];
const ndir = [0, 2, 8, 4, 4, 8, 8, 2];
// prettier-ignore
const map = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1,  0,  1,  2,  3,  4,  5,  6,  7, -1,
  -1,  8,  9, 10, 11, 12, 13, 14, 15, -1,
  -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
  -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
  -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
  -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
  -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
  -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
];

export function InitMoveArray(): void {
  for (let piece = pawn; piece <= bpawn; piece++) {
    for (let fsq = 0; fsq < 120; fsq++) {
      const f = map[fsq];
      if (f === -1) continue;
      let b: BitBoard = NULLBITBOARD;
      for (let n = 0; n < ndir[piece]; n++) {
        let tsq = fsq;
        let t: number;
        do {
          tsq += dir[piece][n];
          t = map[tsq];
          if (t !== -1) b = SETBIT(b, t);
        } while (range[piece] && t !== -1);
      }
      MoveArray[piece][f] = b;
    }
  }
}

export function InitRay(): void {
  for (let f = 0; f < 64; f++) directions[f].fill(-1);
  for (let fsq = 0; fsq < 120; fsq++) {
    const f = map[fsq];
    if (f === -1) continue;
    let ray = -1;
    for (let piece = bishop; piece <= rook; piece++) {
      for (let n = 0; n < ndir[piece]; n++) {
        ++ray;
        let b: BitBoard = NULLBITBOARD;
        let tsq = fsq;
        let t: number;
        do {
          tsq += dir[piece][n];
          t = map[tsq];
          if (t !== -1) {
            b = SETBIT(b, t);
            directions[f][t] = ray;
          }
        } while (t !== -1);
        Ray[f][ray] = b;
      }
    }
  }
}

export function InitFromToRay(): void {
  for (let f = 0; f < 64; f++) FromToRay[f].fill(0n);
  for (let piece = bishop; piece <= rook; piece++) {
    for (let fsq = 0; fsq < 120; fsq++) {
      const f = map[fsq];
      if (f === -1) continue;
      for (let n = 0; n < ndir[piece]; n++) {
        let tsq = fsq;
        let t = map[tsq];
        do {
          const prev = t; // b = &FromToRay[f][t]
          tsq += dir[piece][n];
          t = map[tsq];
          if (t !== -1) {
            FromToRay[f][t] = SETBIT(FromToRay[f][t], t);
            FromToRay[f][t] |= FromToRay[f][prev];
          }
        } while (t !== -1);
      }
    }
  }
}

export function InitRankFileBit(): void {
  let i = 8;
  let b: BitBoard = 255n;
  while (i--) {
    RankBit[i] = b;
    b = (b << 8n) & MASK64;
  }
  i = 8;
  b = 0x0101010101010101n;
  while (i--) {
    FileBit[i] = b;
    b = (b << 1n) & MASK64;
  }
}

export function InitBitCount(): void {
  BitCount[0] = 0;
  BitCount[1] = 1;
  let i = 1;
  for (let n = 2; n <= 16; n++) {
    i <<= 1;
    for (let j = i; j <= i + (i - 1); j++) BitCount[j] = 1 + BitCount[j - i];
  }
}

export function InitRotAtak(): void {
  const cmap = [128, 64, 32, 16, 8, 4, 2, 1];
  const rot1 = [A1, A2, A3, A4, A5, A6, A7, A8];
  const rot2 = [A1, B2, C3, D4, E5, F6, G7, H8];
  const rot3 = [A8, B7, C6, D5, E4, F3, G2, H1];
  for (let sq = A1; sq <= H1; sq++) {
    for (let mp = 0; mp < 256; mp++) {
      Rook00Atak[sq][mp] = 0n;
      Rook90Atak[rot1[sq]][mp] = 0n;
      Bishop45Atak[rot2[sq]][mp] = 0n;
      Bishop315Atak[rot3[sq]][mp] = 0n;
      let sq1 = sq, sq2 = sq;
      while (sq1 > 0) {
        if (cmap[--sq1] & mp) break;
      }
      while (sq2 < 7) {
        if (cmap[++sq2] & mp) break;
      }
      Rook00Atak[sq][mp] = FromToRay[sq][sq1] | FromToRay[sq][sq2];
      Rook90Atak[rot1[sq]][mp] = FromToRay[rot1[sq]][rot1[sq1]] | FromToRay[rot1[sq]][rot1[sq2]];
      Bishop45Atak[rot2[sq]][mp] = FromToRay[rot2[sq]][rot2[sq1]] | FromToRay[rot2[sq]][rot2[sq2]];
      Bishop315Atak[rot3[sq]][mp] = FromToRay[rot3[sq]][rot3[sq1]] | FromToRay[rot3[sq]][rot3[sq2]];
    }
  }
  for (let mp = 0; mp < 256; mp++) {
    for (let sq = A2; sq <= H8; sq++) {
      Rook00Atak[sq][mp] = Rook00Atak[sq - 8][mp] >> 8n;
    }
    for (let sq1 = B_FILE; sq1 <= H_FILE; sq1++) {
      for (let sq2 = 0; sq2 < 64; sq2 += 8) {
        const sq = sq2 + sq1;
        Rook90Atak[sq][mp] = Rook90Atak[sq - 1][mp] >> 1n;
      }
    }
    for (let sq1 = B1, sq2 = H7; sq1 <= H1; sq1++, sq2 -= 8) {
      for (let sq = sq1; sq <= sq2; sq += 9) {
        Bishop45Atak[sq][mp] = (Bishop45Atak[sq + 8][mp] << 8n) & MASK64;
      }
    }
    for (let sq1 = A2, sq2 = G8; sq1 <= A8; sq1 += 8, sq2--) {
      for (let sq = sq1; sq <= sq2; sq += 9) {
        Bishop45Atak[sq][mp] = ((Bishop45Atak[sq + 1][mp] & NotBitPosArray[sq1 - 8]) << 1n) & MASK64;
      }
    }
    for (let sq1 = H2, sq2 = B8; sq1 <= H8; sq1 += 8, sq2++) {
      for (let sq = sq1; sq <= sq2; sq += 7) {
        Bishop315Atak[sq][mp] = Bishop315Atak[sq - 8][mp] >> 8n;
      }
    }
    for (let sq1 = G1, sq2 = A7; sq1 >= A1; sq1--, sq2 -= 8) {
      for (let sq = sq1; sq <= sq2; sq += 7) {
        Bishop315Atak[sq][mp] = ((Bishop315Atak[sq + 1][mp] & NotBitPosArray[sq2 + 8]) << 1n) & MASK64;
      }
    }
  }
}

export function InitVars(): void {
  /* Initialize board */
  clearBoard(board);
  for (let i = 8; i < 16; i++) board.b[white][pawn] = SETBIT(board.b[white][pawn], i);
  board.b[white][rook] = SETBIT(board.b[white][rook], 0);
  board.b[white][knight] = SETBIT(board.b[white][knight], 1);
  board.b[white][bishop] = SETBIT(board.b[white][bishop], 2);
  board.b[white][queen] = SETBIT(board.b[white][queen], 3);
  board.b[white][king] = SETBIT(board.b[white][king], 4);
  board.b[white][bishop] = SETBIT(board.b[white][bishop], 5);
  board.b[white][knight] = SETBIT(board.b[white][knight], 6);
  board.b[white][rook] = SETBIT(board.b[white][rook], 7);
  for (let i = 48; i < 56; i++) board.b[black][pawn] = SETBIT(board.b[black][pawn], i);
  board.b[black][rook] = SETBIT(board.b[black][rook], 56);
  board.b[black][knight] = SETBIT(board.b[black][knight], 57);
  board.b[black][bishop] = SETBIT(board.b[black][bishop], 58);
  board.b[black][queen] = SETBIT(board.b[black][queen], 59);
  board.b[black][king] = SETBIT(board.b[black][king], 60);
  board.b[black][bishop] = SETBIT(board.b[black][bishop], 61);
  board.b[black][knight] = SETBIT(board.b[black][knight], 62);
  board.b[black][rook] = SETBIT(board.b[black][rook], 63);
  board.flag |= WCASTLE | BCASTLE;
  g.RealSide = board.side = white;
  board.ep = -1;
  board.king[white] = E1;
  board.king[black] = E8;
  g.RealGameCnt = g.GameCnt = -1;
  g.Game50 = 0;
  g.computer = black;
  Game[0].hashkey = g.HashKey;
  board.pmaterial[white] = board.pmaterial[black] = 2 * ValueR + 2 * ValueN + 2 * ValueB + ValueQ;
  board.material[white] = board.material[black] = board.pmaterial[white] + 8 * ValueP;

  /* Initialize pgn values */
  pgn.initial_comments = null;
  pgn.pgn_event = pgn.pgn_site = pgn.pgn_date = pgn.pgn_round = pgn.pgn_white = pgn.pgn_black = null;
  pgn.pgn_whiteELO = pgn.pgn_blackELO = pgn.pgn_result = pgn.pgn_othertags = null;

  UpdateFriends();
  UpdateCBoard();
  UpdateMvboard();

  for (let i = A1; i <= H8; i++) {
    if (cboard[i]) {
      board.blockerr90 = SETBIT(board.blockerr90, r90[i]);
      board.blockerr45 = SETBIT(board.blockerr45, r45[i]);
      board.blockerr315 = SETBIT(board.blockerr315, r315[i]);
    }
  }

  /* TreePtr[0] is practically unused.  TreePtr[1] points to the base of the tree. */
  TreePtr[0] = TreePtr[1] = 0;

  /* Initialize some of the game flags */
  g.flags |= USEHASH;
  g.flags |= USENULL;

  g.SearchTime = 5;
  board.castled[white] = board.castled[black] = 0;
  g.phase = PHASE();
}

export function NewPosition(): void {
  g.flags &= ~ENDED;
  g.Game50 = 0;
  g.RealGameCnt = g.GameCnt = -1;
  Game[0].hashkey = g.HashKey;
  ExchCnt[white] = ExchCnt[black] = 0;
}

