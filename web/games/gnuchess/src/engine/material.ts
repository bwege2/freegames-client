// Port of src/engine/material.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// The material hash table is struct-of-arrays; material_info_t keeps the original's field widths.

import type { board_t } from './board.ts';
import { Black, ColourNb, White } from './colour.ts';
import { option_get_int } from './option.ts';
import {
  BlackBishop12, BlackKnight12, BlackPawn12, BlackQueen12, BlackRook12, WhiteBishop12, WhiteKnight12, WhitePawn12,
  WhiteQueen12, WhiteRook12,
} from './piece.ts';

// constants
export const MAT_NONE = 0;
export const MAT_KK = 1;
export const MAT_KBK = 2, MAT_KKB = 3;
export const MAT_KNK = 4, MAT_KKN = 5;
export const MAT_KPK = 6, MAT_KKP = 7;
export const MAT_KQKQ = 8, MAT_KQKP = 9, MAT_KPKQ = 10;
export const MAT_KRKR = 11, MAT_KRKP = 12, MAT_KPKR = 13;
export const MAT_KBKB = 14, MAT_KBKP = 15, MAT_KPKB = 16, MAT_KBPK = 17, MAT_KKBP = 18;
export const MAT_KNKN = 19, MAT_KNKP = 20, MAT_KPKN = 21, MAT_KNPK = 22, MAT_KKNP = 23;
export const MAT_KRPKR = 24, MAT_KRKRP = 25;
export const MAT_KBPKB = 26, MAT_KBKBP = 27;
export const MAT_NB = 28;

export const DrawNodeFlag = 1 << 0;
export const DrawBishopFlag = 1 << 1;

export const MatRookPawnFlag = 1 << 0;
export const MatBishopFlag = 1 << 1;
export const MatKnightFlag = 1 << 2;
export const MatKingFlag = 1 << 3;

const UseTable = true;
const TableSize = 256; // 4kB

const PawnPhase = 0;
const KnightPhase = 1;
const BishopPhase = 1;
const RookPhase = 2;
const QueenPhase = 4;

const TotalPhase = PawnPhase * 16 + KnightPhase * 4 + BishopPhase * 4 + RookPhase * 4 + QueenPhase * 2;

// constants and variables
let MaterialWeight = 256; // 100%

const PawnOpening = 80; // was 100
const PawnEndgame = 90; // was 100
const KnightOpening = 325;
const KnightEndgame = 325;
const BishopOpening = 325;
const BishopEndgame = 325;
const RookOpening = 500;
const RookEndgame = 500;
const QueenOpening = 1000;
const QueenEndgame = 1000;

const BishopPairOpening = 50;
const BishopPairEndgame = 50;

// types
export class material_info_t {
  lock = 0;
  recog = 0; // uint8
  flags = 0; // uint8
  cflags = new Uint8Array(ColourNb);
  mul = new Uint8Array(ColourNb);
  phase = 0; // sint16
  opening = 0; // sint16
  endgame = 0; // sint16
}

const s16 = (x: number): number => (x << 16) >> 16;

// material_t: the table
const Material = {
  size: 0,
  mask: 0,
  used: 0,
  read_nb: 0,
  read_hit: 0,
  write_nb: 0,
  write_collision: 0,
  lock: new Int32Array(0),
  recog: new Uint8Array(0),
  flags: new Uint8Array(0),
  cflags: new Uint8Array(0),
  mul: new Uint8Array(0),
  phase: new Int16Array(0),
  opening: new Int16Array(0),
  endgame: new Int16Array(0),
};

// functions

// material_init()
export function material_init(): void {
  // UCI options
  MaterialWeight = ((option_get_int('Material') * 256 + 50) / 100) | 0;
  // material table
  Material.size = 0;
  Material.mask = 0;
}

// material_alloc()
export function material_alloc(): void {
  if (UseTable) {
    Material.size = TableSize;
    Material.mask = TableSize - 1;
    Material.lock = new Int32Array(Material.size);
    Material.recog = new Uint8Array(Material.size);
    Material.flags = new Uint8Array(Material.size);
    Material.cflags = new Uint8Array(Material.size * ColourNb);
    Material.mul = new Uint8Array(Material.size * ColourNb);
    Material.phase = new Int16Array(Material.size);
    Material.opening = new Int16Array(Material.size);
    Material.endgame = new Int16Array(Material.size);
    material_clear();
  }
}

// material_clear()
export function material_clear(): void {
  Material.lock.fill(0);
  Material.recog.fill(0);
  Material.flags.fill(0);
  Material.cflags.fill(0);
  Material.mul.fill(0);
  Material.phase.fill(0);
  Material.opening.fill(0);
  Material.endgame.fill(0);
  Material.used = 0;
  Material.read_nb = 0;
  Material.read_hit = 0;
  Material.write_nb = 0;
  Material.write_collision = 0;
}

// material_get_info()
export function material_get_info(info: material_info_t, board: board_t): void {
  let entry = 0;
  // probe
  if (UseTable) {
    Material.read_nb++;
    entry = board.material_key_lo & Material.mask;
    if (Material.lock[entry] === board.material_key_hi) {
      // found
      Material.read_hit++;
      info.lock = Material.lock[entry];
      info.recog = Material.recog[entry];
      info.flags = Material.flags[entry];
      info.cflags[0] = Material.cflags[entry * 2];
      info.cflags[1] = Material.cflags[entry * 2 + 1];
      info.mul[0] = Material.mul[entry * 2];
      info.mul[1] = Material.mul[entry * 2 + 1];
      info.phase = Material.phase[entry];
      info.opening = Material.opening[entry];
      info.endgame = Material.endgame[entry];
      return;
    }
  }
  // calculation
  material_comp_info(info, board);
  // store
  if (UseTable) {
    Material.write_nb++;
    if (Material.lock[entry] === 0) { // HACK: assume free entry
      Material.used++;
    } else {
      Material.write_collision++;
    }
    Material.recog[entry] = info.recog;
    Material.flags[entry] = info.flags;
    Material.cflags[entry * 2] = info.cflags[0];
    Material.cflags[entry * 2 + 1] = info.cflags[1];
    Material.mul[entry * 2] = info.mul[0];
    Material.mul[entry * 2 + 1] = info.mul[1];
    Material.phase[entry] = info.phase;
    Material.opening[entry] = info.opening;
    Material.endgame[entry] = info.endgame;
    Material.lock[entry] = board.material_key_hi;
  }
}

// material_comp_info()
function material_comp_info(info: material_info_t, board: board_t): void {
  // init
  const wp = board.number[WhitePawn12];
  const wn = board.number[WhiteKnight12];
  const wb = board.number[WhiteBishop12];
  const wr = board.number[WhiteRook12];
  const wq = board.number[WhiteQueen12];
  const bp = board.number[BlackPawn12];
  const bn = board.number[BlackKnight12];
  const bb = board.number[BlackBishop12];
  const br = board.number[BlackRook12];
  const bq = board.number[BlackQueen12];
  const wt = wq + wr + wb + wn + wp; // no king
  const bt = bq + br + bb + bn + bp; // no king
  const wm = wb + wn;
  const bm = bb + bn;
  // recogniser
  let recog = MAT_NONE;
  if (wt === 0 && bt === 0) {
    recog = MAT_KK;
  } else if (wt === 1 && bt === 0) {
    if (wb === 1) recog = MAT_KBK;
    if (wn === 1) recog = MAT_KNK;
    if (wp === 1) recog = MAT_KPK;
  } else if (wt === 0 && bt === 1) {
    if (bb === 1) recog = MAT_KKB;
    if (bn === 1) recog = MAT_KKN;
    if (bp === 1) recog = MAT_KKP;
  } else if (wt === 1 && bt === 1) {
    if (wq === 1 && bq === 1) recog = MAT_KQKQ;
    if (wq === 1 && bp === 1) recog = MAT_KQKP;
    if (wp === 1 && bq === 1) recog = MAT_KPKQ;
    if (wr === 1 && br === 1) recog = MAT_KRKR;
    if (wr === 1 && bp === 1) recog = MAT_KRKP;
    if (wp === 1 && br === 1) recog = MAT_KPKR;
    if (wb === 1 && bb === 1) recog = MAT_KBKB;
    if (wb === 1 && bp === 1) recog = MAT_KBKP;
    if (wp === 1 && bb === 1) recog = MAT_KPKB;
    if (wn === 1 && bn === 1) recog = MAT_KNKN;
    if (wn === 1 && bp === 1) recog = MAT_KNKP;
    if (wp === 1 && bn === 1) recog = MAT_KPKN;
  } else if (wt === 2 && bt === 0) {
    if (wb === 1 && wp === 1) recog = MAT_KBPK;
    if (wn === 1 && wp === 1) recog = MAT_KNPK;
  } else if (wt === 0 && bt === 2) {
    if (bb === 1 && bp === 1) recog = MAT_KKBP;
    if (bn === 1 && bp === 1) recog = MAT_KKNP;
  } else if (wt === 2 && bt === 1) {
    if (wr === 1 && wp === 1 && br === 1) recog = MAT_KRPKR;
    if (wb === 1 && wp === 1 && bb === 1) recog = MAT_KBPKB;
  } else if (wt === 1 && bt === 2) {
    if (wr === 1 && br === 1 && bp === 1) recog = MAT_KRKRP;
    if (wb === 1 && bb === 1 && bp === 1) recog = MAT_KBKBP;
  }
  // draw node (exact-draw recogniser)
  let flags = 0; // TODO: MOVE ME
  const cflags = [0, 0];
  if (wq + wr + wp === 0 && bq + br + bp === 0) { // no major piece or pawn
    if (wm + bm <= 1 // at most one minor => KK, KBK or KNK
      || recog === MAT_KBKB) {
      flags |= DrawNodeFlag;
    }
  } else if (recog === MAT_KPK || recog === MAT_KKP
    || recog === MAT_KBPK || recog === MAT_KKBP) {
    flags |= DrawNodeFlag;
  }
  // bishop endgame
  if (wq + wr + wn === 0 && bq + br + bn === 0) { // only bishops
    if (wb === 1 && bb === 1) {
      if (wp - bp >= -2 && wp - bp <= +2) { // pawn diff <= 2
        flags |= DrawBishopFlag;
      }
    }
  }
  // multipliers
  const mul = [16, 16]; // 1
  // white multiplier
  if (wp === 0) { // white has no pawns
    const w_maj = wq * 2 + wr;
    const w_min = wb + wn;
    const w_tot = w_maj * 2 + w_min;
    const b_maj = bq * 2 + br;
    const b_min = bb + bn;
    const b_tot = b_maj * 2 + b_min;
    if (w_tot === 1) {
      // KBK* or KNK*, always insufficient
      mul[White] = 0;
    } else if (w_tot === 2 && wn === 2) {
      // KNNK*, usually insufficient
      if (b_tot !== 0 || bp === 0) {
        mul[White] = 0;
      } else { // KNNKP+, might not be draw
        mul[White] = 1; // 1/16
      }
    } else if (w_tot === 2 && wb === 2 && b_tot === 1 && bn === 1) {
      // KBBKN*, barely drawish (not at all?)
      mul[White] = 8; // 1/2
    } else if (w_tot - b_tot <= 1 && w_maj <= 2) {
      // no more than 1 minor up, drawish
      mul[White] = 2; // 1/8
    }
    void b_min;
  } else if (wp === 1) { // white has one pawn
    const w_maj = wq * 2 + wr;
    const w_min = wb + wn;
    const w_tot = w_maj * 2 + w_min;
    let b_maj = bq * 2 + br;
    let b_min = bb + bn;
    let b_tot = b_maj * 2 + b_min;
    if (b_min !== 0) {
      // assume black sacrifices a minor against the lone pawn
      b_min--;
      b_tot--;
      if (w_tot === 1) {
        // KBK* or KNK*, always insufficient
        mul[White] = 4; // 1/4
      } else if (w_tot === 2 && wn === 2) {
        // KNNK*, usually insufficient
        mul[White] = 4; // 1/4
      } else if (w_tot - b_tot <= 1 && w_maj <= 2) {
        // no more than 1 minor up, drawish
        mul[White] = 8; // 1/2
      }
    } else if (br !== 0) {
      // assume black sacrifices a rook against the lone pawn
      b_maj--;
      b_tot -= 2;
      if (w_tot === 1) {
        // KBK* or KNK*, always insufficient
        mul[White] = 4; // 1/4
      } else if (w_tot === 2 && wn === 2) {
        // KNNK*, usually insufficient
        mul[White] = 4; // 1/4
      } else if (w_tot - b_tot <= 1 && w_maj <= 2) {
        // no more than 1 minor up, drawish
        mul[White] = 8; // 1/2
      }
    }
    void b_maj;
    void b_min;
  }
  // black multiplier
  if (bp === 0) { // black has no pawns
    const w_maj = wq * 2 + wr;
    const w_min = wb + wn;
    const w_tot = w_maj * 2 + w_min;
    const b_maj = bq * 2 + br;
    const b_min = bb + bn;
    const b_tot = b_maj * 2 + b_min;
    if (b_tot === 1) {
      // KBK* or KNK*, always insufficient
      mul[Black] = 0;
    } else if (b_tot === 2 && bn === 2) {
      // KNNK*, usually insufficient
      if (w_tot !== 0 || wp === 0) {
        mul[Black] = 0;
      } else { // KNNKP+, might not be draw
        mul[Black] = 1; // 1/16
      }
    } else if (b_tot === 2 && bb === 2 && w_tot === 1 && wn === 1) {
      // KBBKN*, barely drawish (not at all?)
      mul[Black] = 8; // 1/2
    } else if (b_tot - w_tot <= 1 && b_maj <= 2) {
      // no more than 1 minor up, drawish
      mul[Black] = 2; // 1/8
    }
    void w_min;
  } else if (bp === 1) { // black has one pawn
    let w_maj = wq * 2 + wr;
    let w_min = wb + wn;
    let w_tot = w_maj * 2 + w_min;
    const b_maj = bq * 2 + br;
    const b_min = bb + bn;
    const b_tot = b_maj * 2 + b_min;
    if (w_min !== 0) {
      // assume white sacrifices a minor against the lone pawn
      w_min--;
      w_tot--;
      if (b_tot === 1) {
        // KBK* or KNK*, always insufficient
        mul[Black] = 4; // 1/4
      } else if (b_tot === 2 && bn === 2) {
        // KNNK*, usually insufficient
        mul[Black] = 4; // 1/4
      } else if (b_tot - w_tot <= 1 && b_maj <= 2) {
        // no more than 1 minor up, drawish
        mul[Black] = 8; // 1/2
      }
    } else if (wr !== 0) {
      // assume white sacrifices a rook against the lone pawn
      w_maj--;
      w_tot -= 2;
      if (b_tot === 1) {
        // KBK* or KNK*, always insufficient
        mul[Black] = 4; // 1/4
      } else if (b_tot === 2 && bn === 2) {
        // KNNK*, usually insufficient
        mul[Black] = 4; // 1/4
      } else if (b_tot - w_tot <= 1 && b_maj <= 2) {
        // no more than 1 minor up, drawish
        mul[Black] = 8; // 1/2
      }
    }
    void w_maj;
    void w_min;
    void b_min;
  }
  // potential draw for white
  if (wt === wb + wp && wp >= 1) cflags[White] |= MatRookPawnFlag;
  if (wt === wb + wp && wb <= 1 && wp >= 1 && bt > bp) cflags[White] |= MatBishopFlag;
  if (wt === 2 && wn === 1 && wp === 1 && bt > bp) cflags[White] |= MatKnightFlag;
  // potential draw for black
  if (bt === bb + bp && bp >= 1) cflags[Black] |= MatRookPawnFlag;
  if (bt === bb + bp && bb <= 1 && bp >= 1 && wt > wp) cflags[Black] |= MatBishopFlag;
  if (bt === 2 && bn === 1 && bp === 1 && wt > wp) cflags[Black] |= MatKnightFlag;
  // draw leaf (likely draw)
  if (recog === MAT_KQKQ || recog === MAT_KRKR) {
    mul[White] = 0;
    mul[Black] = 0;
  }
  // king safety
  if (bq >= 1 && bq + br + bb + bn >= 2) cflags[White] |= MatKingFlag;
  if (wq >= 1 && wq + wr + wb + wn >= 2) cflags[Black] |= MatKingFlag;
  // phase (0: opening -> 256: endgame)
  let phase = TotalPhase;
  phase -= wp * PawnPhase;
  phase -= wn * KnightPhase;
  phase -= wb * BishopPhase;
  phase -= wr * RookPhase;
  phase -= wq * QueenPhase;
  phase -= bp * PawnPhase;
  phase -= bn * KnightPhase;
  phase -= bb * BishopPhase;
  phase -= br * RookPhase;
  phase -= bq * QueenPhase;
  if (phase < 0) phase = 0;
  phase = ((phase * 256 + ((TotalPhase / 2) | 0)) / TotalPhase) | 0;
  // material
  let opening = 0;
  let endgame = 0;
  opening += wp * PawnOpening;
  opening += wn * KnightOpening;
  opening += wb * BishopOpening;
  opening += wr * RookOpening;
  opening += wq * QueenOpening;
  opening -= bp * PawnOpening;
  opening -= bn * KnightOpening;
  opening -= bb * BishopOpening;
  opening -= br * RookOpening;
  opening -= bq * QueenOpening;
  endgame += wp * PawnEndgame;
  endgame += wn * KnightEndgame;
  endgame += wb * BishopEndgame;
  endgame += wr * RookEndgame;
  endgame += wq * QueenEndgame;
  endgame -= bp * PawnEndgame;
  endgame -= bn * KnightEndgame;
  endgame -= bb * BishopEndgame;
  endgame -= br * RookEndgame;
  endgame -= bq * QueenEndgame;
  // bishop pair
  if (wb >= 2) { // HACK: assumes different colours
    opening += BishopPairOpening;
    endgame += BishopPairEndgame;
  }
  if (bb >= 2) { // HACK: assumes different colours
    opening -= BishopPairOpening;
    endgame -= BishopPairEndgame;
  }
  // store info
  info.recog = recog & 0xff;
  info.flags = flags & 0xff;
  for (let colour = 0; colour < ColourNb; colour++) info.cflags[colour] = cflags[colour];
  for (let colour = 0; colour < ColourNb; colour++) info.mul[colour] = mul[colour];
  info.phase = s16(phase);
  info.opening = s16(((opening * MaterialWeight) / 256) | 0);
  info.endgame = s16(((endgame * MaterialWeight) / 256) | 0);
}
