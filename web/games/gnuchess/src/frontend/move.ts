// Port of src/frontend/move.cc of GNU Chess 6.3.0: making and unmaking moves, SAN, and reading the
// moves the player types. MakeMove(side, &move) adds the captured piece to *move: here it returns the
// new move, and callers store it where the C code's pointer pointed.
import {
  A1, A8, H1, H8, BCASTLE, BKINGCASTLE, BQUEENCASTLE, BitPosArray, CAPTURE, CAPTUREPIECE, CASTLING, CLEARBIT,
  ENPASSANT, ExchCnt, FROMSQ, FileBit, Game, newGameRec, MAXSTR, MOVE, Mvboard, PROMOTEPIECE, PROMOTION, RANK, ROW, RankBit, SETBIT,
  TOSQ, Tree, TreePtr, Value, ValueP, WCASTLE, WKINGCASTLE, WQUEENCASTLE, XBOARD, algbr, algbrfile, algbrrank,
  bishop, board, cboard, empty, ephash, g, hashcode, king, knight, leadz, lnotation, nbits, notation, pawn, queen,
  rook, shl64, white, BKCastlehash, BQCastlehash, Sidehash, WKCastlehash, WQCastlehash, r315, r45, r90,
  type BitBoard,
} from './common.ts';
import { SqAtakd } from './atak.ts';
import { FilterIllegalMoves, GenCheckEscapes, GenMoves } from './genmove.ts';
import { UpdateFriends } from './util.ts';
import { ShowBoard } from './output.ts';
import { printf } from './stdio.ts';
import { isspace, toupper } from '../libc.ts';

/** To make a move on the board and update the various game information. Returns *move. */
export function MakeMove(side: number, move: number): number {
  const xside = 1 ^ side;
  const f = FROMSQ(move);
  const t = TOSQ(move);
  const fpiece = cboard[f];
  const tpiece = cboard[t];
  const a = board.b[side];
  a[fpiece] = CLEARBIT(a[fpiece], f);
  a[fpiece] = SETBIT(a[fpiece], t);
  board.blockerr90 = SETBIT(CLEARBIT(board.blockerr90, r90[f]), r90[t]);
  board.blockerr45 = SETBIT(CLEARBIT(board.blockerr45, r45[f]), r45[t]);
  board.blockerr315 = SETBIT(CLEARBIT(board.blockerr315, r315[f]), r315[t]);
  cboard[f] = empty;
  cboard[t] = fpiece;
  g.GameCnt++;
  // Game[MAXGAMEDEPTH] ends after 600 half-moves: the C program then writes past it; here it grows
  while (g.GameCnt + 1 >= Game.length) Game.push(newGameRec());
  const gr = Game[g.GameCnt];
  gr.epsq = board.ep;
  gr.bflag = board.flag;
  gr.Game50 = g.Game50;
  gr.hashkey = g.HashKey;
  gr.phashkey = g.PawnHashKey;
  gr.mvboard = Mvboard[t];
  gr.comments = null;
  Mvboard[t] = Mvboard[f] + 1;
  Mvboard[f] = 0;
  if (board.ep > -1) g.HashKey ^= ephash[board.ep];
  g.HashKey ^= hashcode[side][fpiece][f];
  g.HashKey ^= hashcode[side][fpiece][t];
  if (fpiece === king) board.king[side] = t;
  if (fpiece === pawn) {
    g.PawnHashKey ^= hashcode[side][pawn][f];
    g.PawnHashKey ^= hashcode[side][pawn][t];
  }

  if (tpiece !== 0) {
    /* Capture */
    ExchCnt[side]++;
    board.b[xside][tpiece] = CLEARBIT(board.b[xside][tpiece], t);
    move |= tpiece << 15;
    g.HashKey ^= hashcode[xside][tpiece][t];
    if (tpiece === pawn) g.PawnHashKey ^= hashcode[xside][pawn][t];
    board.material[xside] -= Value[tpiece];
    if (tpiece !== pawn) board.pmaterial[xside] -= Value[tpiece];
  }

  if (move & PROMOTION) {
    /* Promotion */
    board.b[side][PROMOTEPIECE(move)] = SETBIT(board.b[side][PROMOTEPIECE(move)], t);
    a[fpiece] = CLEARBIT(a[fpiece], t);
    cboard[t] = PROMOTEPIECE(move);
    g.HashKey ^= hashcode[side][pawn][t];
    g.HashKey ^= hashcode[side][cboard[t]][t];
    g.PawnHashKey ^= hashcode[side][pawn][t];
    board.material[side] += Value[cboard[t]] - ValueP;
    board.pmaterial[side] += Value[cboard[t]];
  }

  if (move & ENPASSANT) {
    /* En passant */
    ExchCnt[side]++;
    const epsq = board.ep + (side === white ? -8 : 8);
    board.b[xside][pawn] = CLEARBIT(board.b[xside][pawn], epsq);
    board.blockerr90 = CLEARBIT(board.blockerr90, r90[epsq]);
    board.blockerr45 = CLEARBIT(board.blockerr45, r45[epsq]);
    board.blockerr315 = CLEARBIT(board.blockerr315, r315[epsq]);
    cboard[epsq] = empty;
    g.HashKey ^= hashcode[xside][pawn][epsq];
    g.PawnHashKey ^= hashcode[xside][pawn][epsq];
    board.material[xside] -= ValueP;
  }
  if (move & (CAPTURE | CASTLING) || fpiece === pawn) g.Game50 = g.GameCnt;

  if (move & CASTLING) {
    /* Castling */
    let rookf: number, rookt: number;
    if (t & 0x04) {
      /* King side */
      rookf = t + 1;
      rookt = t - 1;
    } else {
      /* Queen side */
      rookf = t - 2;
      rookt = t + 1;
    }
    const r = board.b[side];
    r[rook] = SETBIT(CLEARBIT(r[rook], rookf), rookt);
    board.blockerr90 = SETBIT(CLEARBIT(board.blockerr90, r90[rookf]), r90[rookt]);
    board.blockerr45 = SETBIT(CLEARBIT(board.blockerr45, r45[rookf]), r45[rookt]);
    board.blockerr315 = SETBIT(CLEARBIT(board.blockerr315, r315[rookf]), r315[rookt]);
    cboard[rookf] = empty;
    cboard[rookt] = rook;
    Mvboard[rookf] = 0;
    Mvboard[rookt] = 1;
    g.HashKey ^= hashcode[side][rook][rookf];
    g.HashKey ^= hashcode[side][rook][rookt];
    board.castled[side] = 1;
  }

  /* If king or rook move, clear castle flag. */
  if (side === white) {
    if (fpiece === king && board.flag & WCASTLE) {
      if (board.flag & WKINGCASTLE) g.HashKey ^= WKCastlehash;
      if (board.flag & WQUEENCASTLE) g.HashKey ^= WQCastlehash;
      board.flag &= ~WCASTLE;
    } else if (fpiece === rook) {
      if (f === H1) {
        if (board.flag & WKINGCASTLE) g.HashKey ^= WKCastlehash;
        board.flag &= ~WKINGCASTLE;
      } else if (f === A1) {
        if (board.flag & WQUEENCASTLE) g.HashKey ^= WQCastlehash;
        board.flag &= ~WQUEENCASTLE;
      }
    }
    if (tpiece === rook) {
      if (t === H8) {
        if (board.flag & BKINGCASTLE) g.HashKey ^= BKCastlehash;
        board.flag &= ~BKINGCASTLE;
      } else if (t === A8) {
        if (board.flag & BQUEENCASTLE) g.HashKey ^= BQCastlehash;
        board.flag &= ~BQUEENCASTLE;
      }
    }
  } else {
    if (fpiece === king && board.flag & BCASTLE) {
      if (board.flag & BKINGCASTLE) g.HashKey ^= BKCastlehash;
      if (board.flag & BQUEENCASTLE) g.HashKey ^= BQCastlehash;
      board.flag &= ~BCASTLE;
    } else if (fpiece === rook) {
      if (f === H8) {
        if (board.flag & BKINGCASTLE) g.HashKey ^= BKCastlehash;
        board.flag &= ~BKINGCASTLE;
      } else if (f === A8) {
        if (board.flag & BQUEENCASTLE) g.HashKey ^= BQCastlehash;
        board.flag &= ~BQUEENCASTLE;
      }
    }
    if (tpiece === rook) {
      if (t === H1) {
        if (board.flag & WKINGCASTLE) g.HashKey ^= WKCastlehash;
        board.flag &= ~WKINGCASTLE;
      } else if (t === A1) {
        if (board.flag & WQUEENCASTLE) g.HashKey ^= WQCastlehash;
        board.flag &= ~WQUEENCASTLE;
      }
    }
  }

  /* If pawn move 2 squares, set ep passant square. */
  if (fpiece === pawn && Math.abs(f - t) === 16) {
    const sq = Math.trunc((f + t) / 2);
    board.ep = sq;
    g.HashKey ^= ephash[sq];
  } else board.ep = -1;

  board.side = xside;
  g.HashKey ^= Sidehash;
  UpdateFriends();

  /* Update game record */
  gr.move = move;
  return move;
}

/** To unmake a move on the board. Note that if side is black, then black is about to move, but we will be undoing a move by white. */
export function UnmakeMove(side: number, move: number): void {
  side = 1 ^ side;
  const xside = 1 ^ side;
  const f = FROMSQ(move);
  const t = TOSQ(move);
  const fpiece = cboard[t];
  const cpiece = CAPTUREPIECE(move);
  const a = board.b[side];
  a[fpiece] = SETBIT(CLEARBIT(a[fpiece], t), f);
  board.blockerr90 = SETBIT(CLEARBIT(board.blockerr90, r90[t]), r90[f]);
  board.blockerr45 = SETBIT(CLEARBIT(board.blockerr45, r45[t]), r45[f]);
  board.blockerr315 = SETBIT(CLEARBIT(board.blockerr315, r315[t]), r315[f]);
  cboard[f] = cboard[t];
  cboard[t] = empty;
  const gr = Game[g.GameCnt];
  Mvboard[f] = Mvboard[t] - 1;
  Mvboard[t] = gr.mvboard;
  if (fpiece === king) board.king[side] = f;

  /* if capture, put back the captured piece */
  if (move & CAPTURE) {
    ExchCnt[side]--;
    board.b[xside][cpiece] = SETBIT(board.b[xside][cpiece], t);
    board.blockerr90 = SETBIT(board.blockerr90, r90[t]);
    board.blockerr45 = SETBIT(board.blockerr45, r45[t]);
    board.blockerr315 = SETBIT(board.blockerr315, r315[t]);
    cboard[t] = cpiece;
    board.material[xside] += Value[cpiece];
    if (cpiece !== pawn) board.pmaterial[xside] += Value[cpiece];
  }

  /* Undo promotion */
  if (move & PROMOTION) {
    a[fpiece] = CLEARBIT(a[fpiece], f);
    board.b[side][pawn] = SETBIT(board.b[side][pawn], f);
    cboard[f] = pawn;
    board.material[side] += ValueP - Value[PROMOTEPIECE(move)];
    board.pmaterial[side] -= Value[PROMOTEPIECE(move)];
  }

  /* Undo enpassant */
  if (move & ENPASSANT) {
    ExchCnt[side]--;
    const epsq = side === white ? gr.epsq - 8 : gr.epsq + 8;
    board.b[xside][pawn] = SETBIT(board.b[xside][pawn], epsq);
    board.blockerr90 = SETBIT(board.blockerr90, r90[epsq]);
    board.blockerr45 = SETBIT(board.blockerr45, r45[epsq]);
    board.blockerr315 = SETBIT(board.blockerr315, r315[epsq]);
    cboard[epsq] = pawn;
    board.material[xside] += ValueP;
  }

  /* if castling, undo rook move */
  if (move & CASTLING) {
    let rookf: number, rookt: number;
    if (t & 0x04) {
      /* King side */
      rookf = t + 1;
      rookt = t - 1;
    } else {
      /* Queen side */
      rookf = t - 2;
      rookt = t + 1;
    }
    const r = board.b[side];
    r[rook] = SETBIT(CLEARBIT(r[rook], rookt), rookf);
    board.blockerr90 = SETBIT(CLEARBIT(board.blockerr90, r90[rookt]), r90[rookf]);
    board.blockerr45 = SETBIT(CLEARBIT(board.blockerr45, r45[rookt]), r45[rookf]);
    board.blockerr315 = SETBIT(CLEARBIT(board.blockerr315, r315[rookt]), r315[rookf]);
    cboard[rookf] = rook;
    cboard[rookt] = empty;
    Mvboard[rookf] = 0;
    Mvboard[rookt] = 0;
    board.castled[side] = 0;
  }

  UpdateFriends();
  board.side = side;
  board.ep = gr.epsq;
  board.flag = gr.bflag;
  g.HashKey = gr.hashkey;
  g.PawnHashKey = gr.phashkey;
  g.Game50 = gr.Game50;
  g.GameCnt--;
}

/** Convert the move to a SAN format (into g.SANmv). GenMoves (ply) needs to be called by the calling routine for this to work. */
export function SANMove(move: number, ply: number): void {
  let side = board.side;
  let s = '';
  const f = FROMSQ(move);
  const t = TOSQ(move);
  /* Check some special moves like castling */
  if (move & CASTLING) {
    if (t === 6 || t === 62) g.SANmv = 'O-O';
    else g.SANmv = 'O-O-O';
    return;
  }

  /*  AMBIGUITY CHECK  */
  const piece = cboard[f];
  side = board.side;
  const b = board.b[side][piece];
  let ambiguous = false;
  let node1 = TreePtr[ply];
  if (nbits(b) > 1) {
    /* Scan the movelist to see if another same-type piece is also moving to that particular to-square. */
    for (node1 = TreePtr[ply]; node1 < TreePtr[ply + 1]; node1++) {
      if (FROMSQ(Tree.move[node1]) === f) continue; /* original piece, skip */
      if (TOSQ(Tree.move[node1]) !== t) continue; /* diff to-square, skip */
      if (cboard[FROMSQ(Tree.move[node1])] !== piece) continue; /* diff piece   */
      ambiguous = true;
      break;
    }
  }

  if (piece === pawn) {
    /* Capture or enpassant */
    if (cboard[t] !== 0 || board.ep === t) {
      s += algbrfile[ROW(f)];
      s += 'x';
    }
    s += algbr[t];
    /* Promotion */
    if (move & PROMOTION) {
      s += '=';
      s += notation[PROMOTEPIECE(move)];
    }
  } else {
    /* its not pawn */
    s += notation[piece];
    if (ambiguous) {
      if (ROW(f) === ROW(FROMSQ(Tree.move[node1]))) s += algbrrank[RANK(f)];
      else s += algbrfile[ROW(f)];
    }
    if (cboard[t] !== 0) s += 'x'; /* capture */
    s += algbr[t];
  }

  /* See if it is a checking or mating move */
  move = MakeMove(side, move);
  if (SqAtakd(board.king[1 ^ side], side)) {
    TreePtr[ply + 2] = TreePtr[ply + 1];
    GenCheckEscapes(ply + 1);
    if (TreePtr[ply + 1] === TreePtr[ply + 2]) s += '#';
    else s += '+';
    g.GenCnt -= TreePtr[ply + 2] - TreePtr[ply + 1];
  }
  UnmakeMove(1 ^ side, move);
  g.SANmv = s;
}

const code = (c: string): number => c.charCodeAt(0);
const ASCIITOFILE = (a: string): number => code(a) - code('a');
const ASCIITORANK = (a: string): number => code(a) - code('1');
const ASCIITOSQ = (a: string, b: string): number => ASCIITOFILE(a) + ASCIITORANK(b) * 8;
const ATOH = (a: string): boolean => a >= 'a' && a <= 'h';
const ITO8 = (a: string): boolean => a >= '1' && a <= '8';

/** Given c, what is the piece id. */
function piece_id(c: string | number): number {
  switch (c) {
    case 'N':
      return knight;
    case 'B':
      return bishop;
    case 'R':
      return rook;
    case 'Q':
      return queen;
    case 'K':
      return king;
    case 'P':
      return pawn;
  }
  return empty;
}

/**
 * This routine takes a string and check to see if it is a legal move. At the moment, we accept 2 types
 * of moves notation: 1. e2e4 format. 2. SAN format (e4). Returns the leaf (an index into Tree) or -1;
 * cleanMove, if given, receives the cleaned-up move string; after is the C string that follows s in
 * memory (see "Ambiguous move").
 */
export function ValidateMove(s: string, cleanMove?: { value: string }, after = ''): number {
  /* User input could be longer than MAXSTR */
  if (s.length >= MAXSTR) {
    after = s.slice(MAXSTR);
    s = s.slice(0, MAXSTR - 1);
  }
  // the loop below leaves s just past the string's NUL: "Ambiguous move" prints what follows it in
  // memory (the caller says what that is: the rest of the input buffer, of the PGN file, ...)
  const sfull = after;

  TreePtr[2] = TreePtr[1];
  GenMoves(1);
  FilterIllegalMoves(1);
  const side = board.side;

  /* Clean up the move string. This gets rid of things like 'x', '+', '=' and so forth. */
  let mvstr = '';
  for (const ch of s) if (ch !== 'x' && ch !== '+' && ch !== '=' && !isspace(ch)) mvstr += ch;

  /* Flush castles that check */
  if (mvstr.length > 0 && mvstr[mvstr.length - 1] === '#') mvstr = mvstr.slice(0, -1);

  if (cleanMove) cleanMove.value = mvstr;
  const m = (i: number): string => (i < mvstr.length ? mvstr[i] : '\0');
  let f: number, t: number;

  /* Check for castling */
  if (mvstr === 'O-O' || mvstr === 'o-o' || mvstr === '0-0') {
    if (cleanMove) cleanMove.value = 'O-O';
    if (side === white) {
      f = 4;
      t = 6;
    } else {
      f = 60;
      t = 62;
    }
    return IsInMoveList(1, f, t, ' ');
  }
  if (mvstr === 'O-O-O' || mvstr === 'o-o-o' || mvstr === '0-0-0') {
    if (cleanMove) cleanMove.value = 'O-O-O';
    if (side === white) {
      f = 4;
      t = 2;
    } else {
      f = 60;
      t = 58;
    }
    return IsInMoveList(1, f, t, ' ');
  }

  /*  Test to see if it is e2e4 type notation */
  if (ATOH(m(0)) && ITO8(m(1)) && ATOH(m(2)) && ITO8(m(3))) {
    f = ASCIITOSQ(m(0), m(1));
    t = ASCIITOSQ(m(2), m(3));
    const piece = mvstr.length === 5 ? m(4) : ' ';
    return IsInMoveList(1, f, t, piece);
  }

  /* Its a SAN notation move. */
  if (ATOH(m(0))) {
    /* pawn move */
    if (ITO8(m(1))) {
      /* e4 type */
      t = ASCIITOSQ(m(0), m(1));
      f = t + (side === white ? -8 : 8);
      /* Add Sanity Check */
      if (f > 0 && f < 64) {
        if (BitPosArray[f] & board.b[side][pawn]) {
          if (m(2) !== '\0') return IsInMoveList(1, f, t, m(2));
          else return IsInMoveList(1, f, t, ' ');
        }
        f = t + (side === white ? -16 : 16);
        if (f > 0 && f < 64) {
          if (BitPosArray[f] & board.b[side][pawn]) return IsInMoveList(1, f, t, ' ');
        } /* End bound check +/- 16 */
      } /* End bound check +/- 8 */
    } else if (ATOH(m(1)) && ITO8(m(2))) {
      /* ed4 type */
      t = ASCIITOSQ(m(1), m(2));
      const rank = ASCIITORANK(m(2)) + (side === white ? -1 : 1);
      f = rank * 8 + ASCIITOFILE(m(0));
      const piece = mvstr.length === 4 ? m(3) : ' ';
      return IsInMoveList(1, f, t, piece);
    } else if (ATOH(m(1))) {
      /* ed type */
      const file = ASCIITOFILE(m(0));
      const fileto = ASCIITOFILE(m(1));
      let b: BitBoard = board.b[side][pawn] & FileBit[file];
      if (side === white) b = b >> BigInt(fileto < file ? 7 : 9);
      else b = shl64(b, fileto < file ? 9 : 7);
      if (board.ep > -1) b = b & (board.friends[1 ^ side] | BitPosArray[board.ep]);
      else b = b & board.friends[1 ^ side];
      switch (nbits(b)) {
        case 0:
          return -1;
        case 1: {
          t = leadz(b);
          f = t - (side === white ? 8 : -8) + (file - fileto);
          const piece = mvstr.length === 3 ? m(2) : ' ';
          return IsInMoveList(1, f, t, piece);
        }
        default:
          printf('Ambiguous move: %s %s\n', sfull, mvstr);
          ShowBoard();
          return -1;
      }
    }
  } else {
    let piece = piece_id(m(0));
    if (piece !== empty && piece_id(m(1)) === empty) {
      /* Is a piece move. Since piece_id accepts P as pawns, this will correctly handle malformed commands like Pe4 */
      let b = board.b[side][piece];
      t = -1;
      if (ITO8(m(1))) {
        /* N1d2 type move */
        const rank = ASCIITORANK(m(1));
        b &= RankBit[rank];
        t = ASCIITOSQ(m(2), m(3));
      } else if (ATOH(m(1)) && ATOH(m(2))) {
        /* Nbd2 type move */
        const file = ASCIITOFILE(m(1));
        b &= FileBit[file];
        t = ASCIITOSQ(m(2), m(3));
      } else if (ATOH(m(1)) && ITO8(m(2))) {
        /* Nd2 type move */
        t = ASCIITOSQ(m(1), m(2));
      }
      let kount = 0;
      let n1 = -1, n2 = -1;
      while (b) {
        f = leadz(b);
        b = CLEARBIT(b, f);
        if ((n1 = IsInMoveList(1, f, t, ' ')) !== -1) {
          n2 = n1;
          kount++;
        }
      }
      if (kount > 1) {
        printf('Ambiguous move: %s %s\n', sfull, mvstr);
        ShowBoard();
        return -1;
      } else if (kount === 0) return -1;
      else return n2;
    }
    piece = piece_id(m(0));
    let piece2: number;
    if (piece !== empty && (piece2 = piece_id(m(1))) !== empty && (m(2) === '\0' || (piece_id(m(2)) !== empty && m(3) === '\0'))) {
      /* KxP format */
      let promote = ' ';
      // if (piece_id(mvstr[2] != empty)): piece_id of a bool, never a piece
      if (piece_id(Number(m(2) !== '\0')) !== empty) promote = m(2);
      let kount = 0;
      let n1 = -1, n2 = -1;
      let b = board.b[side][piece];
      while (b) {
        f = leadz(b);
        b = CLEARBIT(b, f);
        let b2 = board.b[1 ^ side][piece2];
        while (b2) {
          t = leadz(b2);
          b2 = CLEARBIT(b2, t);
          printf('Trying %s: ', AlgbrMove(MOVE(f, t)));
          if ((n1 = IsInMoveList(1, f, t, promote)) !== -1) {
            n2 = n1;
            kount++;
            printf('Y  ');
          } else printf('N  ');
        }
      }
      if (kount > 1) {
        printf('Ambiguous move: %s %s\n', sfull, mvstr);
        ShowBoard();
        return -1;
      } else if (kount === 0) return -1;
      else return n2;
    }
  }

  /* Fall through.  Nothing worked, return that no move was performed. */
  return -1;
}

/** Checks to see if from and to square can be found in the movelist and is legal. */
export function IsInMoveList(ply: number, f: number, t: number, piece: string): number {
  for (let node = TreePtr[ply]; node < TreePtr[ply + 1]; node++) {
    if ((Tree.move[node] & 0x0fff) === MOVE(f, t) && toupper(piece) === notation[PROMOTEPIECE(Tree.move[node])]) return node;
  }
  return -1;
}

/** Convert an int move format to algebraic format of g1f3. */
export function AlgbrMove(move: number): string {
  const f = FROMSQ(move);
  const t = TOSQ(move);
  let s = algbr[f] + algbr[t];
  if (move & PROMOTION) {
    if (g.flags & XBOARD) s += lnotation[PROMOTEPIECE(move)];
    else s += notation[PROMOTEPIECE(move)];
  }
  return s;
}
