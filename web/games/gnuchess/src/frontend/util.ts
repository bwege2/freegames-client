// Port of src/frontend/util.cc of GNU Chess 6.3.0 (leadz and nbits are in common.ts, as inlines.h).
import {
  A1, A8, E1, E8, H1, H8, BKINGCASTLE, BQUEENCASTLE, BitPosArray, NotBitPosArray, CLEARBIT, Mvboard, WKINGCASTLE, WQUEENCASTLE,
  bishop, black, board, cboard, empty, king, knight, leadz, nbits, pawn, queen, rook, white,
} from './common.ts';
import { SqAtakd } from './atak.ts';

export function UpdateFriends(): void {
  const w = board.b[white];
  const b = board.b[black];
  board.friends[white] = w[pawn] | w[knight] | w[bishop] | w[rook] | w[queen] | w[king];
  board.friends[black] = b[pawn] | b[knight] | b[bishop] | b[rook] | b[queen] | b[king];
  board.blocker = board.friends[white] | board.friends[black];
}

export function UpdateCBoard(): void {
  cboard.fill(0);
  for (let piece = pawn; piece <= king; piece++) {
    let b = board.b[white][piece] | board.b[black][piece];
    while (b) {
      const sq = leadz(b);
      b = CLEARBIT(b, sq);
      cboard[sq] = piece;
    }
  }
}

// prettier-ignore
const OrigCboard = [
  rook,  knight, bishop, queen, king,  bishop, knight, rook,
  pawn,  pawn,   pawn,   pawn,  pawn,  pawn,   pawn,   pawn,
  empty, empty,  empty,  empty, empty, empty,  empty,  empty,
  empty, empty,  empty,  empty, empty, empty,  empty,  empty,
  empty, empty,  empty,  empty, empty, empty,  empty,  empty,
  empty, empty,  empty,  empty, empty, empty,  empty,  empty,
  pawn,  pawn,   pawn,   pawn,  pawn,  pawn,   pawn,   pawn,
  rook,  knight, bishop, queen, king,  bishop, knight, rook,
];

export function UpdateMvboard(): void {
  for (let sq = 0; sq < 64; sq++) {
    if (cboard[sq] === empty || cboard[sq] === OrigCboard[sq]) Mvboard[sq] = 0;
    else Mvboard[sq] = 1;
  }
}

/** Check the board to make sure that its valid. */
export function ValidateBoard(): boolean {
  if (nbits(board.b[white][king]) !== 1) return false;
  if (nbits(board.b[black][king]) !== 1) return false;
  const side = board.side;
  const xside = 1 ^ side;
  if (SqAtakd(board.king[xside], side)) return false;
  if (board.ep > -1) {
    const sq = board.ep + (xside === white ? 8 : -8);
    // a1 as the en-passant square (an EPD without that field leaves board.ep 0) reads BitPosArray[-8]:
    // in the reference build (re/gnuchess/oracle) NotBitPosArray lies before it, so that is NotBitPosArray[56]
    const bit = sq >= 0 ? BitPosArray[sq] : NotBitPosArray[64 + sq];
    if (!(bit & board.b[xside][pawn])) return false;
  }
  if (board.flag & WKINGCASTLE) {
    if (!(BitPosArray[E1] & board.b[white][king])) return false;
    if (!(BitPosArray[H1] & board.b[white][rook])) return false;
  }
  if (board.flag & WQUEENCASTLE) {
    if (!(BitPosArray[E1] & board.b[white][king])) return false;
    if (!(BitPosArray[A1] & board.b[white][rook])) return false;
  }
  if (board.flag & BKINGCASTLE) {
    if (!(BitPosArray[E8] & board.b[black][king])) return false;
    if (!(BitPosArray[H8] & board.b[black][rook])) return false;
  }
  if (board.flag & BQUEENCASTLE) {
    if (!(BitPosArray[E8] & board.b[black][king])) return false;
    if (!(BitPosArray[A8] & board.b[black][rook])) return false;
  }
  return true;
}
