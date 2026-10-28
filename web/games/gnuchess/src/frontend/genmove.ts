// Port of src/frontend/genmove.cc of GNU Chess 6.3.0: the frontend's bitboard move generator (it checks
// the moves the player types and those the engine sends, and prints `show moves`).
import {
  A1, A2, A8, B1, B8, C1, C8, D1, D8, E1, E8, F1, F8, G1, G8, H1, H2, H7, H8, BKINGCASTLE, BQUEENCASTLE,
  BISHOPPRM, BitPosArray, CASTLING, CLEARBIT, ENPASSANT, FileBit, FromToRay, KNIGHTPRM, MOVE, MoveArray, NULLBITBOARD,
  NotBitPosArray, QUEENPRM, RANK, ROOKPRM, RankBit, Ray, TOSQ, Tree, TreePtr, WKINGCASTLE, WQUEENCASTLE,
  BishopAttack, QueenAttack, RookAttack, bishop, black, board, cboard, directions, empty, g, king, knight, leadz,
  nbits, not64, pawn, ptype, queen, rook, shl64, slider, white, type BitBoard,
} from './common.ts';
import { AttackTo, PinnedOnKing, SqAtakd } from './atak.ts';
import { MakeMove, UnmakeMove } from './move.ts';

let node = 0;

function ADDMOVE(a: number, b: number, c: number): void {
  Tree.move[node] = MOVE(a, b) | c;
  node++;
}
function ADDPROMOTE(a: number, b: number): void {
  ADDMOVE(a, b, QUEENPRM);
  ADDMOVE(a, b, KNIGHTPRM);
  ADDMOVE(a, b, ROOKPRM);
  ADDMOVE(a, b, BISHOPPRM);
}

/** Convert a bitboard into a list of moves. These are stored into the tree. f is the origin square. */
function BitToMove(f: number, b: BitBoard): void {
  while (b) {
    const t = leadz(b);
    b = CLEARBIT(b, t);
    ADDMOVE(f, t, 0);
  }
}

/** My bitboard move generator. This routine generates pseudo-legal moves. */
export function GenMoves(ply: number): void {
  const side = board.side;
  const a = board.b[side];
  const friends = board.friends[side];
  const notfriends = not64(friends);
  const blocker = board.blocker;
  const notblocker = not64(blocker);
  node = TreePtr[ply + 1];
  const ep = board.ep;
  let b: BitBoard, c: BitBoard, d: BitBoard;

  /* Knight & King */
  for (let piece = knight; piece <= king; piece += 4) {
    b = a[piece];
    while (b) {
      const sq = leadz(b);
      b = CLEARBIT(b, sq);
      BitToMove(sq, MoveArray[piece][sq] & notfriends);
    }
  }
  /* Bishops */
  b = a[bishop];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    d = BishopAttack(sq);
    BitToMove(sq, d & notfriends);
  }
  /* Rooks */
  b = a[rook];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    d = RookAttack(sq);
    BitToMove(sq, d & notfriends);
  }
  /* Queen */
  b = a[queen];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    d = QueenAttack(sq);
    BitToMove(sq, d & notfriends);
  }

  /*  White pawn moves  */
  const e = board.friends[1 ^ side] | (ep > -1 ? BitPosArray[ep] : NULLBITBOARD);
  if (side === white) {
    c = (a[pawn] >> 8n) & notblocker; /* 1 square forward */
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t >= 56) ADDPROMOTE(t - 8, t);
      else ADDMOVE(t - 8, t, 0);
    }
    b = a[pawn] & RankBit[1]; /* all pawns on 2nd rank */
    c = (b >> 8n) & notblocker;
    c = (c >> 8n) & notblocker; /* 2 squares forward */
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      ADDMOVE(t - 16, t, 0);
    }
    b = a[pawn] & not64(FileBit[0]); /* captures to the left */
    c = (b >> 7n) & e;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t >= 56) ADDPROMOTE(t - 7, t);
      else if (ep === t) ADDMOVE(t - 7, t, ENPASSANT);
      else ADDMOVE(t - 7, t, 0);
    }
    b = a[pawn] & not64(FileBit[7]); /* captures to the right */
    c = (b >> 9n) & e;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t >= 56) ADDPROMOTE(t - 9, t);
      else if (ep === t) ADDMOVE(t - 9, t, ENPASSANT);
      else ADDMOVE(t - 9, t, 0);
    }
  }

  /*  Black pawn forward moves   */
  if (side === black) {
    c = shl64(a[pawn], 8) & notblocker;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t <= 7) ADDPROMOTE(t + 8, t);
      else ADDMOVE(t + 8, t, 0);
    }
    b = a[pawn] & RankBit[6]; /* all pawns on 7th rank */
    c = shl64(b, 8) & notblocker;
    c = shl64(c, 8) & notblocker;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      ADDMOVE(t + 16, t, 0);
    }
    b = a[pawn] & not64(FileBit[7]); /* captures to the left */
    c = shl64(b, 7) & e;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t <= 7) ADDPROMOTE(t + 7, t);
      else if (ep === t) ADDMOVE(t + 7, t, ENPASSANT);
      else ADDMOVE(t + 7, t, 0);
    }
    b = a[pawn] & not64(FileBit[0]); /* captures to the right */
    c = shl64(b, 9) & e;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t <= 7) ADDPROMOTE(t + 9, t);
      else if (ep === t) ADDMOVE(t + 9, t, ENPASSANT);
      else ADDMOVE(t + 9, t, 0);
    }
  }

  /* Castling code */
  b = board.b[side][rook];
  if (side === white && board.flag & WKINGCASTLE && b & BitPosArray[H1] && !(FromToRay[E1][G1] & blocker) &&
    !SqAtakd(E1, black) && !SqAtakd(F1, black) && !SqAtakd(G1, black)) {
    ADDMOVE(E1, G1, CASTLING);
  }
  if (side === white && board.flag & WQUEENCASTLE && b & BitPosArray[A1] && !(FromToRay[E1][B1] & blocker) &&
    !SqAtakd(E1, black) && !SqAtakd(D1, black) && !SqAtakd(C1, black)) {
    ADDMOVE(E1, C1, CASTLING);
  }
  if (side === black && board.flag & BKINGCASTLE && b & BitPosArray[H8] && !(FromToRay[E8][G8] & blocker) &&
    !SqAtakd(E8, white) && !SqAtakd(F8, white) && !SqAtakd(G8, white)) {
    ADDMOVE(E8, G8, CASTLING);
  }
  if (side === black && board.flag & BQUEENCASTLE && b & BitPosArray[A8] && !(FromToRay[E8][B8] & blocker) &&
    !SqAtakd(E8, white) && !SqAtakd(D8, white) && !SqAtakd(C8, white)) {
    ADDMOVE(E8, C8, CASTLING);
  }

  /* Update tree pointers and count */
  TreePtr[ply + 1] = node;
  g.GenCnt += TreePtr[ply + 1] - TreePtr[ply];
}

/** Here I generate only non-captures. Promotions are considered as captures and are not generated. */
export function GenNonCaptures(ply: number): void {
  const side = board.side;
  const a = board.b[side];
  const blocker = board.blocker;
  const notblocker = not64(blocker);
  node = TreePtr[ply + 1];
  let b: BitBoard, c: BitBoard, d: BitBoard;

  /* Knight & King */
  for (let piece = knight; piece <= king; piece += 4) {
    b = a[piece];
    while (b) {
      const sq = leadz(b);
      b = CLEARBIT(b, sq);
      BitToMove(sq, MoveArray[piece][sq] & notblocker);
    }
  }
  /* Bishops */
  b = a[bishop];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    d = BishopAttack(sq);
    BitToMove(sq, d & notblocker);
  }
  /* Rooks */
  b = a[rook];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    d = RookAttack(sq);
    BitToMove(sq, d & notblocker);
  }
  /* Queen */
  b = a[queen];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    d = QueenAttack(sq);
    BitToMove(sq, d & notblocker);
  }

  /*  White pawn moves  */
  if (side === white) {
    c = (a[pawn] >> 8n) & notblocker; /* 1 square forward */
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t < 56) ADDMOVE(t - 8, t, 0);
    }
    b = a[pawn] & RankBit[1]; /* all pawns on 2nd rank */
    c = (b >> 8n) & notblocker;
    c = (c >> 8n) & notblocker; /* 2 squares forward */
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      ADDMOVE(t - 16, t, 0);
    }
  }

  /*  Black pawn forward moves   */
  if (side === black) {
    c = shl64(a[pawn], 8) & notblocker;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t > 7) ADDMOVE(t + 8, t, 0);
    }
    b = a[pawn] & RankBit[6]; /* all pawns on 7th rank */
    c = shl64(b, 8) & notblocker;
    c = shl64(c, 8) & notblocker;
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      ADDMOVE(t + 16, t, 0);
    }
  }

  /* Castling code */
  b = board.b[side][rook];
  if (side === white && board.flag & WKINGCASTLE && b & BitPosArray[7] && !(FromToRay[4][6] & blocker) &&
    !SqAtakd(4, black) && !SqAtakd(5, black) && !SqAtakd(6, black)) {
    ADDMOVE(4, 6, CASTLING);
  }
  if (side === white && board.flag & WQUEENCASTLE && b & BitPosArray[0] && !(FromToRay[4][1] & blocker) &&
    !SqAtakd(4, black) && !SqAtakd(3, black) && !SqAtakd(2, black)) {
    ADDMOVE(4, 2, CASTLING);
  }
  if (side === black && board.flag & BKINGCASTLE && b & BitPosArray[63] && !(FromToRay[60][62] & blocker) &&
    !SqAtakd(60, white) && !SqAtakd(61, white) && !SqAtakd(62, white)) {
    ADDMOVE(60, 62, CASTLING);
  }
  if (side === black && board.flag & BQUEENCASTLE && b & BitPosArray[56] && !(FromToRay[60][57] & blocker) &&
    !SqAtakd(60, white) && !SqAtakd(59, white) && !SqAtakd(58, white)) {
    ADDMOVE(60, 58, CASTLING);
  }

  /* Update tree pointers and count */
  TreePtr[ply + 1] = node;
  g.GenCnt += TreePtr[ply + 1] - TreePtr[ply];
}

/** This routine generates captures. En passant and pawn promotions are included. */
export function GenCaptures(ply: number): void {
  const side = board.side;
  const a = board.b[side];
  const enemy = board.friends[1 ^ side];
  const blocker = board.blocker;
  node = TreePtr[ply + 1];
  const ep = board.ep;
  let b: BitBoard, c: BitBoard;

  /* Knight  & King */
  for (let piece = knight; piece <= king; piece += 4) {
    b = a[piece];
    while (b) {
      const sq = leadz(b);
      b = CLEARBIT(b, sq);
      BitToMove(sq, MoveArray[piece][sq] & enemy);
    }
  }
  /* Bishop */
  b = a[bishop];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    c = BishopAttack(sq);
    BitToMove(sq, c & enemy);
  }
  /* Rook */
  b = a[rook];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    c = RookAttack(sq);
    BitToMove(sq, c & enemy);
  }
  /* Queen */
  b = a[queen];
  while (b) {
    const sq = leadz(b);
    b = CLEARBIT(b, sq);
    c = QueenAttack(sq);
    BitToMove(sq, c & enemy);
  }

  const epbit = ep > -1 ? BitPosArray[ep] : 0n;
  /*  White pawn moves  */
  if (side === white) {
    b = a[pawn] & RankBit[6]; /* all pawns on 7 rank */
    c = (b >> 8n) & not64(blocker); /* 1 square forward */
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      ADDPROMOTE(t - 8, t);
    }
    b = a[pawn] & not64(FileBit[0]); /* captures to the left */
    c = (b >> 7n) & (board.friends[1 ^ side] | epbit);
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t >= 56) ADDPROMOTE(t - 7, t);
      else if (ep === t) ADDMOVE(t - 7, t, ENPASSANT);
      else ADDMOVE(t - 7, t, 0);
    }
    b = a[pawn] & not64(FileBit[7]); /* captures to the right */
    c = (b >> 9n) & (board.friends[1 ^ side] | epbit);
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t >= 56) ADDPROMOTE(t - 9, t);
      else if (ep === t) ADDMOVE(t - 9, t, ENPASSANT);
      else ADDMOVE(t - 9, t, 0);
    }
  }

  /*  Black pawn forward moves   */
  if (side === black) {
    b = a[pawn] & RankBit[1]; /* all pawns on 2nd rank */
    c = shl64(b, 8) & not64(blocker);
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      ADDPROMOTE(t + 8, t);
    }
    b = a[pawn] & not64(FileBit[7]); /* captures to the left */
    c = shl64(b, 7) & (board.friends[1 ^ side] | epbit);
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t <= 7) ADDPROMOTE(t + 7, t);
      else if (ep === t) ADDMOVE(t + 7, t, ENPASSANT);
      else ADDMOVE(t + 7, t, 0);
    }
    b = a[pawn] & not64(FileBit[0]); /* captures to the right */
    c = shl64(b, 9) & (board.friends[1 ^ side] | epbit);
    while (c) {
      const t = leadz(c);
      c = CLEARBIT(c, t);
      if (t <= 7) ADDPROMOTE(t + 9, t);
      else if (ep === t) ADDMOVE(t + 9, t, ENPASSANT);
      else ADDMOVE(t + 9, t, 0);
    }
  }

  /* Update tree pointers and count */
  TreePtr[ply + 1] = node;
  g.GenCnt += TreePtr[ply + 1] - TreePtr[ply];
}

/** The king is in check, so generate only moves which get the king out of check. */
export function GenCheckEscapes(ply: number): void {
  let escapes: BitBoard = NULLBITBOARD;
  const side = board.side;
  const xside = 1 ^ side;
  node = TreePtr[ply + 1];
  const kingsq = board.king[side];
  let checkers = AttackTo(kingsq, xside);
  const p = board.b[side][pawn];
  let b: BitBoard, c: BitBoard;

  if (nbits(checkers) === 1) {
    /*  Captures of checking pieces (except by king) */
    const chksq = leadz(checkers);
    b = AttackTo(chksq, side);
    b &= not64(board.b[side][king]);
    while (b) {
      const sq = leadz(b);
      b = CLEARBIT(b, sq);
      if (!PinnedOnKing(sq, side)) {
        if (cboard[sq] === pawn && (chksq <= H1 || chksq >= A8)) ADDPROMOTE(sq, chksq);
        else ADDMOVE(sq, chksq, 0);
      }
    }

    /*  Maybe enpassant can help  */
    if (board.ep > -1) {
      const epsq = board.ep;
      if (epsq + (side === white ? -8 : 8) === chksq) {
        b = MoveArray[ptype[1 ^ side]][epsq] & p;
        while (b) {
          const sq = leadz(b);
          b = CLEARBIT(b, sq);
          if (!PinnedOnKing(sq, side)) ADDMOVE(sq, epsq, ENPASSANT);
        }
      }
    }

    /* Lets block/capture the checking piece */
    if (slider[cboard[chksq]]) {
      c = FromToRay[kingsq][chksq] & NotBitPosArray[chksq];
      while (c) {
        const sq = leadz(c);
        c = CLEARBIT(c, sq);
        b = AttackTo(sq, side);
        b &= not64(board.b[side][king] | p);

        /* Add in pawn advances */
        if (side === white && sq > H2) {
          if (BitPosArray[sq - 8] & p) b |= BitPosArray[sq - 8];
          if (RANK(sq) === 3 && cboard[sq - 8] === empty && BitPosArray[sq - 16] & p) b |= BitPosArray[sq - 16];
        }
        if (side === black && sq < H7) {
          if (BitPosArray[sq + 8] & p) b |= BitPosArray[sq + 8];
          if (RANK(sq) === 4 && cboard[sq + 8] === empty && BitPosArray[sq + 16] & p) b |= BitPosArray[sq + 16];
        }
        while (b) {
          const sq1 = leadz(b);
          b = CLEARBIT(b, sq1);
          if (!PinnedOnKing(sq1, side)) {
            if (cboard[sq1] === pawn && (sq > H7 || sq < A2)) ADDPROMOTE(sq1, sq);
            else ADDMOVE(sq1, sq, 0);
          }
        }
      }
    }
  }

  /* If more than one checkers, move king to get out of check */
  if (checkers) escapes = MoveArray[king][kingsq] & not64(board.friends[side]);
  while (checkers) {
    const chksq = leadz(checkers);
    checkers = CLEARBIT(checkers, chksq);
    const dir = directions[chksq][kingsq];
    if (slider[cboard[chksq]]) escapes &= not64(Ray[chksq][dir]);
  }
  while (escapes) {
    const sq = leadz(escapes);
    escapes = CLEARBIT(escapes, sq);
    if (!SqAtakd(sq, xside)) ADDMOVE(kingsq, sq, 0);
  }

  /* Update tree pointers and count */
  TreePtr[ply + 1] = node;
  g.GenCnt += TreePtr[ply + 1] - TreePtr[ply];
}

/** All the illegal moves in the current ply is removed. */
export function FilterIllegalMoves(ply: number): void {
  const side = board.side;
  const xside = 1 ^ side;
  const sq = board.king[side];
  for (let p = TreePtr[ply]; p < TreePtr[ply + 1]; p++) {
    Tree.move[p] = MakeMove(side, Tree.move[p]);
    let check: boolean;
    if (cboard[TOSQ(Tree.move[p])] !== king) check = SqAtakd(sq, xside);
    else check = SqAtakd(TOSQ(Tree.move[p]), xside);
    UnmakeMove(xside, Tree.move[p]);
    if (check) {
      /* its an illegal move */
      --TreePtr[ply + 1];
      Tree.move[p] = Tree.move[TreePtr[ply + 1]];
      Tree.score[p] = Tree.score[TreePtr[ply + 1]];
      --p;
      g.GenCnt--;
    }
  }
}
