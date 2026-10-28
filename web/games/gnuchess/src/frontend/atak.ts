// Port of src/frontend/atak.cc of GNU Chess 6.3.0: attacks on squares and pins.
import {
  BitPosArray, CLEARBIT, FromToRay, MoveArray, NULLBITBOARD, NotBitPosArray, Ray, bishop, board, directions, king,
  knight, leadz, not64, pawn, ptype, queen, rook, trailz, type BitBoard,
} from './common.ts';

/** To determine if sq is attacked by any pieces from side. */
export function SqAtakd(sq: number, side: number): boolean {
  const a = board.b[side];
  /* Knights */
  if (a[knight] & MoveArray[knight][sq]) return true;
  /* Kings */
  if (a[king] & MoveArray[king][sq]) return true;
  /* Pawns */
  if (a[pawn] & MoveArray[ptype[1 ^ side]][sq]) return true;
  const c = FromToRay[sq];
  const blocker = board.blocker;
  /* Bishops & Queen */
  let b = (a[bishop] | a[queen]) & MoveArray[bishop][sq];
  let d = not64(b) & blocker;
  while (b) {
    const t = leadz(b);
    if (!(c[t] & d)) return true;
    b = CLEARBIT(b, t);
  }
  /* Rooks & Queen */
  b = (a[rook] | a[queen]) & MoveArray[rook][sq];
  d = not64(b) & blocker;
  while (b) {
    const t = leadz(b);
    if (!(c[t] & d)) return true;
    b = CLEARBIT(b, t);
  }
  return false;
}

/** A bitboard of all squares with pieces belonging to side which attack sq. */
export function AttackTo(sq: number, side: number): BitBoard {
  const a = board.b[side];
  /* Knights */
  let e = a[knight] & MoveArray[knight][sq];
  /* Kings */
  e |= a[king] & MoveArray[king][sq];
  /* Pawns */
  e |= a[pawn] & MoveArray[ptype[1 ^ side]][sq];
  const c = FromToRay[sq];
  const blocker = board.blocker;
  /* Bishops & Queen */
  let b = (a[bishop] | a[queen]) & MoveArray[bishop][sq];
  while (b) {
    const t = leadz(b);
    b = CLEARBIT(b, t);
    if (!(c[t] & blocker & NotBitPosArray[t])) e |= BitPosArray[t];
  }
  /* Rooks & Queen */
  b = (a[rook] | a[queen]) & MoveArray[rook][sq];
  while (b) {
    const t = leadz(b);
    b = CLEARBIT(b, t);
    if (!(c[t] & blocker & NotBitPosArray[t])) e |= BitPosArray[t];
  }
  return e;
}

/** Determine if the piece on sq is pinned against the King. Side is the color of the piece. */
export function PinnedOnKing(sq: number, side: number): boolean {
  const KingSq = board.king[side];
  const dir = directions[KingSq][sq];
  if (dir === -1) return false;
  const xside = 1 ^ side;
  const blocker = board.blocker;
  /*  Path from piece to king is blocked, so no pin */
  if (FromToRay[KingSq][sq] & NotBitPosArray[sq] & blocker) return false;
  const b = (Ray[KingSq][dir] ^ FromToRay[KingSq][sq]) & blocker;
  if (b === NULLBITBOARD) return false;
  const sq1 = sq > KingSq ? leadz(b) : trailz(b);
  /*  If diagonal  */
  if (dir <= 3 && BitPosArray[sq1] & (board.b[xside][queen] | board.b[xside][bishop])) return true;
  /*  Rank / file  */
  if (dir >= 4 && BitPosArray[sq1] & (board.b[xside][queen] | board.b[xside][rook])) return true;
  return false;
}
