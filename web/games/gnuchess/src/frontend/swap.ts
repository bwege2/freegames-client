// Port of src/frontend/swap.cc of GNU Chess 6.3.0: the static exchange evaluator `show moves` prints.
import {
  BitPosArray, CLEARBIT, ENPASSANT, FROMSQ, MAXPLYDEPTH, NULLBITBOARD, PROMOTEPIECE, PROMOTION, Ray, TOSQ, Value,
  ValueP, black, board, cboard, directions, king, leadz, pawn, queen, rook, bishop, trailz, white, type BitBoard,
} from './common.ts';
import { AttackTo } from './atak.ts';

const xray = [0, 1, 0, 1, 1, 1, 0];

export function SwapOff(move: number): number {
  const swaplist = new Int32Array(MAXPLYDEPTH);
  const f = FROMSQ(move);
  const t = TOSQ(move);
  const side = board.friends[white] & BitPosArray[f] ? white : black;
  const xside = 1 ^ side;

  /*  Squares attacking t for side and xside  */
  const bc = { b: AttackTo(t, side), c: AttackTo(t, xside) };
  bc.b = CLEARBIT(bc.b, f);
  if (xray[cboard[f]]) AddXrayPiece(t, f, side, bc, 'b', 'c');

  const d = board.b[side];
  const e = board.b[xside];
  let lastval: number;
  if (move & PROMOTION) {
    swaplist[0] = Value[PROMOTEPIECE(move)] - ValueP;
    lastval = -Value[PROMOTEPIECE(move)];
  } else {
    swaplist[0] = move & ENPASSANT ? ValueP : Value[cboard[t]];
    lastval = -Value[cboard[f]];
  }
  let n = 1;
  while (1) {
    if (bc.c === NULLBITBOARD) break;
    for (let piece = pawn; piece <= king; piece++) {
      const r = bc.c & e[piece];
      if (r) {
        const sq = leadz(r);
        bc.c = CLEARBIT(bc.c, sq);
        if (xray[piece]) AddXrayPiece(t, sq, xside, bc, 'c', 'b');
        swaplist[n] = swaplist[n - 1] + lastval;
        n++;
        lastval = Value[piece];
        break;
      }
    }
    if (bc.b === NULLBITBOARD) break;
    for (let piece = pawn; piece <= king; piece++) {
      const r = bc.b & d[piece];
      if (r) {
        const sq = leadz(r);
        bc.b = CLEARBIT(bc.b, sq);
        if (xray[piece]) AddXrayPiece(t, sq, side, bc, 'b', 'c');
        swaplist[n] = swaplist[n - 1] + lastval;
        n++;
        lastval = -Value[piece];
        break;
      }
    }
  }

  /* Mini-max the scores from the bottom up to the top of the list. */
  --n;
  while (n) {
    if (n & 1) {
      if (swaplist[n] <= swaplist[n - 1]) swaplist[n - 1] = swaplist[n];
    } else {
      if (swaplist[n] >= swaplist[n - 1]) swaplist[n - 1] = swaplist[n];
    }
    --n;
  }
  return swaplist[0];
}

/**
 * Find a piece which attack through another piece (e.g. two rooks, Q+B, B+P, etc.). Side is the side
 * attacking the square where the swapping is to be done. b and c (BitBoard * in C) name the fields of
 * `bc` that stand for side's and the other side's attackers.
 */
export function AddXrayPiece(t: number, sq: number, side: number, bc: { b: BitBoard; c: BitBoard }, b: 'b' | 'c', c: 'b' | 'c'): void {
  const dir = directions[t][sq];
  const a = Ray[sq][dir] & board.blocker;
  if (a === NULLBITBOARD) return;
  const nsq = t < sq ? leadz(a) : trailz(a);
  const piece = cboard[nsq];
  if (piece === queen || (piece === rook && dir > 3) || (piece === bishop && dir < 4)) {
    if (BitPosArray[nsq] & board.friends[side]) bc[b] |= BitPosArray[nsq];
    else bc[c] |= BitPosArray[nsq];
  }
}
