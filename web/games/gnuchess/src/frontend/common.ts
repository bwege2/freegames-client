// Port of src/frontend/common.h of GNU Chess 6.3.0 (the frontend of GNU Chess 5 by Chua Kong Sian and
// Stuart Cracraft): its types, constants, macros and global variables (defined in src/main.cc).
// BitBoard is uint64: a bigint here, always kept in 0 .. 2^64-1. The C globals live in `g` and the
// board in `board`, so every module can assign them as the C code does.

export type BitBoard = bigint;

export const MASK64 = (1n << 64n) - 1n;
/** ~b for a uint64 */
export const not64 = (b: BitBoard): BitBoard => b ^ MASK64;
/** b << n for a uint64 */
export const shl64 = (b: BitBoard, n: number): BitBoard => (b << BigInt(n)) & MASK64;
export const shr64 = (b: BitBoard, n: number): BitBoard => b >> BigInt(n);

// Piece and square names (enum Piece, enum Square, enum File)
export const empty = 0, pawn = 1, knight = 2, bishop = 3, rook = 4, queen = 5, king = 6, bpawn = 7;
export const A1 = 0, B1 = 1, C1 = 2, D1 = 3, E1 = 4, F1 = 5, G1 = 6, H1 = 7;
export const A2 = 8, B2 = 9, C2 = 10, D2 = 11, E2 = 12, F2 = 13, G2 = 14, H2 = 15;
export const A3 = 16, B3 = 17, C3 = 18, D3 = 19, E3 = 20, F3 = 21, G3 = 22, H3 = 23;
export const A4 = 24, B4 = 25, C4 = 26, D4 = 27, E4 = 28, F4 = 29, G4 = 30, H4 = 31;
export const A5 = 32, B5 = 33, C5 = 34, D5 = 35, E5 = 36, F5 = 37, G5 = 38, H5 = 39;
export const A6 = 40, B6 = 41, C6 = 42, D6 = 43, E6 = 44, F6 = 45, G6 = 46, H6 = 47;
export const A7 = 48, B7 = 49, C7 = 50, D7 = 51, E7 = 52, F7 = 53, G7 = 54, H7 = 55;
export const A8 = 56, B8 = 57, C8 = 58, D8 = 59, E8 = 60, F8 = 61, G8 = 62, H8 = 63;
export const A_FILE = 0, B_FILE = 1, C_FILE = 2, D_FILE = 3, E_FILE = 4, F_FILE = 5, G_FILE = 6, H_FILE = 7;

export const SANSZ = 8; /* longest move is "exf8=Q+" so 7+1 */

export const RANK = (i: number): number => i >> 3;
export const ROW = (i: number): number => i & 7;

/* Move Descriptions (moves) are represented internally as integers. */
export const PROMOTEPIECE = (a: number): number => (a >> 12) & 0x0007;
export const CAPTUREPIECE = (a: number): number => (a >> 15) & 0x0007;
export const TOSQ = (a: number): number => a & 0x003f;
export const FROMSQ = (a: number): number => (a >> 6) & 0x003f;
export const MOVE = (a: number, b: number): number => (a << 6) | b;

/* constants for move description */
export const KNIGHTPRM = 0x00002000;
export const BISHOPPRM = 0x00003000;
export const ROOKPRM = 0x00004000;
export const QUEENPRM = 0x00005000;
export const PROMOTION = 0x00007000;
export const PAWNCAP = 0x00008000;
export const KNIGHTCAP = 0x00010000;
export const BISHOPCAP = 0x00018000;
export const ROOKCAP = 0x00020000;
export const QUEENCAP = 0x00028000;
export const CAPTURE = 0x00038000;
export const NULLMOVE = 0x00100000;
export const CASTLING = 0x00200000;
export const ENPASSANT = 0x00400000;
export const MOVEMASK = CASTLING | ENPASSANT | PROMOTION | 0x0fff;

export const white = 0;
export const black = 1;
export const ks = 0;
export const qs = 1;
export const MATE = 32767;

/* constants for Board */
export const WKINGCASTLE = 0x0001;
export const WQUEENCASTLE = 0x0002;
export const BKINGCASTLE = 0x0004;
export const BQUEENCASTLE = 0x0008;
export const WCASTLE = WKINGCASTLE | WQUEENCASTLE;
export const BCASTLE = BKINGCASTLE | BQUEENCASTLE;

/* Material values */
export const ValueP = 100;
export const ValueN = 350;
export const ValueB = 350;
export const ValueR = 550;
export const ValueQ = 1100;
export const ValueK = 2000;

/*  Some special BitBoards  */
export const NULLBITBOARD = 0n;

/*  Game flags */
export const QUIT = 0x0001;
export const TESTT = 0x0002;
export const THINK = 0x0004;
export const MANUAL = 0x0008;
export const TIMEOUT = 0x0010;
export const UCI = 0x0020;
export const WEAK = 0x0020;
export const ENDED = 0x0040;
export const USEHASH = 0x0080;
export const SOLVE = 0x0100;
export const USENULL = 0x0200;
export const XBOARD = 0x0400;
export const TIMECTL = 0x0800;
export const POST = 0x1000;
export const PONDER = 0x2000; /* We are in pondering (during search) */
export const HARD = 0x4000; /* Pondering is turned on */
export const ANALYZE = 0x8000; /* In ANALYZE mode */

export const MAXTREEDEPTH = 2000;
export const MAXPLYDEPTH = 65;
export const MAXGAMEDEPTH = 600;

export const R_WHITE_WINS = 1;
export const R_BLACK_WINS = 2;
export const R_DRAW = 3;
export const R_NORESULT = 4;

export const BUF_SIZE = 4096;
export const MAXSTR = 128;
export const MAXNAMESZ = 50;

/** Board: an entire board's state */
export interface Board {
  b: BitBoard[][]; /* piece/pawn positions by side (0=white, 1=black) and then by piece (1=pawn..6=king) */
  friends: BitBoard[]; /* Friendly (this side's) pieces */
  blocker: BitBoard;
  blockerr90: BitBoard; /* rotated 90 degrees */
  blockerr45: BitBoard; /* rotated 45 degrees */
  blockerr315: BitBoard; /* rotated 315 degrees */
  ep: number; /* Location of en passant square (short) */
  flag: number; /* Flags related to castle privileges */
  side: number; /* Color of side on move: 0=white, 1=black */
  material: number[]; /* Total material by side not inc. king */
  pmaterial: number[]; /* Total pawn material by side not inc. king */
  castled: number[]; /* True (1) if side is castled */
  king: number[]; /* Location of king 0 - a1 .. 63 - h8 */
}

export function newBoard(): Board {
  return {
    b: [new Array<BitBoard>(7).fill(0n), new Array<BitBoard>(7).fill(0n)],
    friends: [0n, 0n],
    blocker: 0n,
    blockerr90: 0n,
    blockerr45: 0n,
    blockerr315: 0n,
    ep: 0,
    flag: 0,
    side: 0,
    material: [0, 0],
    pmaterial: [0, 0],
    castled: [0, 0],
    king: [0, 0],
  };
}

/** memset (&board, 0, sizeof (board)) */
export function clearBoard(b: Board): void {
  for (let s = 0; s < 2; s++) for (let p = 0; p < 7; p++) b.b[s][p] = 0n;
  b.friends[0] = b.friends[1] = 0n;
  b.blocker = b.blockerr90 = b.blockerr45 = b.blockerr315 = 0n;
  b.ep = 0;
  b.flag = 0;
  b.side = 0;
  b.material[0] = b.material[1] = 0;
  b.pmaterial[0] = b.pmaterial[1] = 0;
  b.castled[0] = b.castled[1] = 0;
  b.king[0] = b.king[1] = 0;
}

/** GameRec: an individual move made in the game */
export interface GameRec {
  move: number; /* The actual move made; this is NOT the move count! */
  epsq: number; /* en passant square */
  bflag: number; /* Flags for castle privs, see Board.flag */
  Game50: number; /* The last value of GameCnt (a count of half-moves) that castled, captured, or moved a pawn */
  mvboard: number;
  et: number; /* elapsed time */
  hashkey: bigint;
  phashkey: bigint;
  SANmv: string; /* The move in SAN notation */
  comments: string | null;
}

/** an output stream: stdout, or a file opened for writing (the log file of `name`) */
export interface Stream {
  write(s: string): void;
}

/** leaf: the move list Tree[] is two arrays; a leaf * is an index into them, null is -1 */
export const Tree = {
  move: new Int32Array(MAXTREEDEPTH + 1),
  score: new Int32Array(MAXTREEDEPTH + 1),
};
/** TreePtr[ply]: indices into Tree */
export const TreePtr = new Int32Array(MAXPLYDEPTH);

export const board: Board = newBoard();

export const Game: GameRec[] = Array.from({ length: MAXGAMEDEPTH }, () => newGameRec());
export function newGameRec(): GameRec {
  return { move: 0, epsq: 0, bflag: 0, Game50: 0, mvboard: 0, et: 0, hashkey: 0n, phashkey: 0n, SANmv: '', comments: null };
}

/** The globals of src/main.cc (and a few file-level ones of other frontend files) */
export const g = {
  GameCnt: 0,
  RealGameCnt: 0,
  RealSide: 0,
  computer: 0,
  flags: 0,
  preanalyze_flags: 0,
  HashKey: 0n,
  PawnHashKey: 0n,
  Game50: 0,
  GenCnt: 0,
  SANmv: '',
  id: '',
  solution: '',
  SearchTime: 0, // float
  TCMove: 0,
  TCinc: 0,
  TCTime: 0, // float
  phase: 0,
  bookfirstlast: 0,
  graphicmodeoutput: 0,
  coords: 0,
  pgnloaded: 0,
  pgncnt: 0,
  progname: 'gnuchess',
  myrating: 0,
  opprating: 0,
  name: '',
  computerplays: 0,
  n: 0,
  ofp: null as unknown as Stream,
};
export const MoveLimit = [0, 0];
export const TimeLimit = [0, 0]; // float
export const ExchCnt = [0, 0];
export const cboard = new Int32Array(64);
export const Mvboard = new Int32Array(64);

// The tables of src/main.cc
export const lzArray = new Uint8Array(65536);
export const BitPosArray: BitBoard[] = new Array(64).fill(0n);
export const NotBitPosArray: BitBoard[] = new Array(64).fill(0n);
export const MoveArray: BitBoard[][] = Array.from({ length: 8 }, () => new Array<BitBoard>(64).fill(0n));
export const Ray: BitBoard[][] = Array.from({ length: 64 }, () => new Array<BitBoard>(8).fill(0n));
export const FromToRay: BitBoard[][] = Array.from({ length: 64 }, () => new Array<BitBoard>(64).fill(0n));
export const RankBit: BitBoard[] = new Array(8).fill(0n);
export const FileBit: BitBoard[] = new Array(8).fill(0n);
export const Rook00Atak: BitBoard[][] = Array.from({ length: 64 }, () => new Array<BitBoard>(256).fill(0n));
export const Rook90Atak: BitBoard[][] = Array.from({ length: 64 }, () => new Array<BitBoard>(256).fill(0n));
export const Bishop45Atak: BitBoard[][] = Array.from({ length: 64 }, () => new Array<BitBoard>(256).fill(0n));
export const Bishop315Atak: BitBoard[][] = Array.from({ length: 64 }, () => new Array<BitBoard>(256).fill(0n));
export const directions: Int16Array[] = Array.from({ length: 64 }, () => new Int16Array(64));
export const BitCount = new Uint8Array(65536);
/** hashcode[2][7][64] etc.: never initialized by GNU Chess 6 (InitHashCode is not called), so all 0 */
export const hashcode: bigint[][][] = Array.from({ length: 2 }, () => Array.from({ length: 7 }, () => new Array<bigint>(64).fill(0n)));
export const ephash: bigint[] = new Array(64).fill(0n);
export const WKCastlehash = 0n;
export const WQCastlehash = 0n;
export const BKCastlehash = 0n;
export const BQCastlehash = 0n;
export const Sidehash = 0n;

export const slider = [0, 0, 0, 1, 1, 1, 0, 0];
export const Value = [0, ValueP, ValueN, ValueB, ValueR, ValueQ, ValueK];
export const range = [0, 0, 0, 1, 1, 1, 0, 0];
export const ptype = [pawn, bpawn];
export const algbr = [
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
];
export const algbrfile = 'abcdefgh';
export const algbrrank = '12345678';
export const notation = ' PNBRQK';
export const lnotation = ' pnbrqk';

export const Shift00 = [
  56, 56, 56, 56, 56, 56, 56, 56, 48, 48, 48, 48, 48, 48, 48, 48, 40, 40, 40, 40, 40, 40, 40, 40,
  32, 32, 32, 32, 32, 32, 32, 32, 24, 24, 24, 24, 24, 24, 24, 24, 16, 16, 16, 16, 16, 16, 16, 16,
  8, 8, 8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0,
];
export const r90 = [
  A8, A7, A6, A5, A4, A3, A2, A1, B8, B7, B6, B5, B4, B3, B2, B1,
  C8, C7, C6, C5, C4, C3, C2, C1, D8, D7, D6, D5, D4, D3, D2, D1,
  E8, E7, E6, E5, E4, E3, E2, E1, F8, F7, F6, F5, F4, F3, F2, F1,
  G8, G7, G6, G5, G4, G3, G2, G1, H8, H7, H6, H5, H4, H3, H2, H1,
];
export const Shift90 = [
  0, 8, 16, 24, 32, 40, 48, 56, 0, 8, 16, 24, 32, 40, 48, 56, 0, 8, 16, 24, 32, 40, 48, 56,
  0, 8, 16, 24, 32, 40, 48, 56, 0, 8, 16, 24, 32, 40, 48, 56, 0, 8, 16, 24, 32, 40, 48, 56,
  0, 8, 16, 24, 32, 40, 48, 56, 0, 8, 16, 24, 32, 40, 48, 56,
];
export const r45 = [
  E4, F3, H2, C2, G1, D1, B1, A1, E5, F4, G3, A3, D2, H1, E1, C1,
  D6, F5, G4, H3, B3, E2, A2, F1, B7, E6, G5, H4, A4, C3, F2, B2,
  G7, C7, F6, H5, A5, B4, D3, G2, C8, H7, D7, G6, A6, B5, C4, E3,
  F8, D8, A8, E7, H6, B6, C5, D4, H8, G8, E8, B8, F7, A7, C6, D5,
];
export const Shift45 = [
  28, 36, 43, 49, 54, 58, 61, 63, 21, 28, 36, 43, 49, 54, 58, 61, 15, 21, 28, 36, 43, 49, 54, 58,
  10, 15, 21, 28, 36, 43, 49, 54, 6, 10, 15, 21, 28, 36, 43, 49, 3, 6, 10, 15, 21, 28, 36, 43,
  1, 3, 6, 10, 15, 21, 28, 36, 0, 1, 3, 6, 10, 15, 21, 28,
];
export const Mask45 = [
  0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01, 0x7f, 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03,
  0x3f, 0x7f, 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x1f, 0x3f, 0x7f, 0xff, 0x7f, 0x3f, 0x1f, 0x0f,
  0x0f, 0x1f, 0x3f, 0x7f, 0xff, 0x7f, 0x3f, 0x1f, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff, 0x7f, 0x3f,
  0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff, 0x7f, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff,
];
export const r315 = [
  A1, C1, F1, B2, G2, E3, D4, D5, B1, E1, A2, F2, D3, C4, C5, C6,
  D1, H1, E2, C3, B4, B5, B6, A7, G1, D2, B3, A4, A5, A6, H6, F7,
  C2, A3, H3, H4, H5, G6, E7, B8, H2, G3, G4, G5, F6, D7, A8, E8,
  F3, F4, F5, E6, C7, H7, D8, G8, E4, E5, D6, B7, G7, C8, F8, H8,
];
export const Shift315 = [
  63, 61, 58, 54, 49, 43, 36, 28, 61, 58, 54, 49, 43, 36, 28, 21, 58, 54, 49, 43, 36, 28, 21, 15,
  54, 49, 43, 36, 28, 21, 15, 10, 49, 43, 36, 28, 21, 15, 10, 6, 43, 36, 28, 21, 15, 10, 6, 3,
  36, 28, 21, 15, 10, 6, 3, 1, 28, 21, 15, 10, 6, 3, 1, 0,
];
export const Mask315 = [
  0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff, 0x7f,
  0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff, 0x7f, 0x3f, 0x0f, 0x1f, 0x3f, 0x7f, 0xff, 0x7f, 0x3f, 0x1f,
  0x1f, 0x3f, 0x7f, 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x3f, 0x7f, 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07,
  0x7f, 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01,
];

/* Draw score can be used to penalise draws if desired */
export const PHASE = (): number => 8 - Math.trunc((board.material[white] + board.material[black]) / 1150);

/*  Attack MACROS */
export const BishopAttack = (sq: number): BitBoard =>
  Bishop45Atak[sq][Number((board.blockerr45 >> BigInt(Shift45[sq])) & BigInt(Mask45[sq]))] |
  Bishop315Atak[sq][Number((board.blockerr315 >> BigInt(Shift315[sq])) & BigInt(Mask315[sq]))];
export const RookAttack = (sq: number): BitBoard =>
  Rook00Atak[sq][Number((board.blocker >> BigInt(Shift00[sq])) & 0xffn)] |
  Rook90Atak[sq][Number((board.blockerr90 >> BigInt(Shift90[sq])) & 0xffn)];
export const QueenAttack = (sq: number): BitBoard => BishopAttack(sq) | RookAttack(sq);

/** inlines.h leadz(): the leading bit, leftmost bit is 0 and rightmost bit is 63 */
export function leadz(b: BitBoard): number {
  if (b >> 48n) return lzArray[Number(b >> 48n)];
  if (b >> 32n) return lzArray[Number(b >> 32n)] + 16;
  if (b >> 16n) return lzArray[Number(b >> 16n)] + 32;
  return lzArray[Number(b)] + 48;
}
/** inlines.h nbits(): the number of bits in b */
export function nbits(b: BitBoard): number {
  return (
    BitCount[Number(b >> 48n)] +
    BitCount[Number((b >> 32n) & 0xffffn)] +
    BitCount[Number((b >> 16n) & 0xffffn)] +
    BitCount[Number(b & 0xffffn)]
  );
}
/** #define trailz(b) (leadz ((b) & ((~b) + 1))) */
export const trailz = (b: BitBoard): number => leadz(b & ((not64(b) + 1n) & MASK64));

export const SETBIT = (b: BitBoard, i: number): BitBoard => b | BitPosArray[i];
export const CLEARBIT = (b: BitBoard, i: number): BitBoard => b & NotBitPosArray[i];

/** Error codes for ParseEPD */
export const EPD_SUCCESS = 0;
export const EPD_ERROR = 1;

/** enum { INPUT_NONE, INPUT_AVAILABLE } */
export const INPUT_NONE = 0;
export const INPUT_AVAILABLE = 1;
