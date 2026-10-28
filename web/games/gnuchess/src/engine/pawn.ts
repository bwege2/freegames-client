// Port of src/engine/pawn.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// The pawn hash table is struct-of-arrays; pawn_info_t keeps the original's field widths.

import type { board_t } from './board.ts';
import { ColourNb, COLOUR_OPP, White, Black } from './colour.ts';
import { option_get_int } from './option.ts';
import { FileNb, PAWN_RANK, Rank1, Rank2, Rank4, Rank5, Rank6, Rank7, Rank8, RankNb, RANK_OPP, SquareNone, SQUARE_FILE, SQUARE_MAKE } from './square.ts';

// constants
export const BackRankFlag = 1 << 0;

const UseTable = true;
const TableSize = 16384; // 256kB

// types
export class pawn_info_t {
  lock = 0;
  opening = 0; // sint16
  endgame = 0; // sint16
  flags = new Uint8Array(ColourNb);
  passed_bits = new Uint8Array(ColourNb);
  single_file = new Uint8Array(ColourNb);
}

const s16 = (x: number): number => (x << 16) >> 16;

// constants and variables
let PawnStructureWeight = 256; // 100%

const DoubledOpening = 10;
const DoubledEndgame = 20;
const IsolatedOpening = 10;
const IsolatedOpeningOpen = 20;
const IsolatedEndgame = 20;
const BackwardOpening = 8;
const BackwardOpeningOpen = 16;
const BackwardEndgame = 10;
const CandidateOpeningMin = 5;
const CandidateOpeningMax = 55;
const CandidateEndgameMin = 10;
const CandidateEndgameMax = 110;

const Bonus = new Int32Array(RankNb);

// variables
export const BitEQ = new Int32Array(16);
export const BitLT = new Int32Array(16);
export const BitLE = new Int32Array(16);
export const BitGT = new Int32Array(16);
export const BitGE = new Int32Array(16);
export const BitFirst = new Int32Array(0x100);
export const BitLast = new Int32Array(0x100);
export const BitCount = new Int32Array(0x100);
export const BitRev = new Int32Array(0x100);

const BitRank1 = new Int32Array(RankNb);
const BitRank2 = new Int32Array(RankNb);
const BitRank3 = new Int32Array(RankNb);

// macros
export const BIT = (n: number): number => BitEQ[n];
export const BIT_FIRST = (b: number): number => BitFirst[b];
export const BIT_LAST = (b: number): number => BitLast[b];
export const BIT_COUNT = (b: number): number => BitCount[b];

// pawn_t: the table
const Pawn = {
  size: 0,
  mask: 0,
  used: 0,
  read_nb: 0,
  read_hit: 0,
  write_nb: 0,
  write_collision: 0,
  lock: new Int32Array(0),
  opening: new Int16Array(0),
  endgame: new Int16Array(0),
  flags: new Uint8Array(0),
  passed_bits: new Uint8Array(0),
  single_file: new Uint8Array(0),
};

// functions

// pawn_init_bit()
export function pawn_init_bit(): void {
  // rank-indexed Bit*[]
  for (let rank = 0; rank < RankNb; rank++) {
    BitEQ[rank] = 0;
    BitLT[rank] = 0;
    BitLE[rank] = 0;
    BitGT[rank] = 0;
    BitGE[rank] = 0;
    BitRank1[rank] = 0;
    BitRank2[rank] = 0;
    BitRank3[rank] = 0;
  }
  for (let rank = Rank1; rank <= Rank8; rank++) {
    BitEQ[rank] = 1 << (rank - Rank1);
    BitLT[rank] = BitEQ[rank] - 1;
    BitLE[rank] = BitLT[rank] | BitEQ[rank];
    BitGT[rank] = BitLE[rank] ^ 0xff;
    BitGE[rank] = BitGT[rank] | BitEQ[rank];
  }
  for (let rank = Rank1; rank <= Rank8; rank++) {
    BitRank1[rank] = BitEQ[rank + 1];
    BitRank2[rank] = BitEQ[rank + 1] | BitEQ[rank + 2];
    BitRank3[rank] = BitEQ[rank + 1] | BitEQ[rank + 2] | BitEQ[rank + 3];
  }
  // bit-indexed Bit*[]
  for (let b = 0; b < 0x100; b++) {
    let first = Rank8; // HACK for pawn shelter
    let last = Rank1; // HACK
    let count = 0;
    let rev = 0;
    for (let rank = Rank1; rank <= Rank8; rank++) {
      if ((b & BitEQ[rank]) !== 0) {
        if (rank < first) first = rank;
        if (rank > last) last = rank;
        count++;
        rev |= BitEQ[RANK_OPP(rank)];
      }
    }
    BitFirst[b] = first;
    BitLast[b] = last;
    BitCount[b] = count;
    BitRev[b] = rev;
  }
}

// pawn_init()
export function pawn_init(): void {
  // UCI options
  PawnStructureWeight = ((option_get_int('Pawn Structure') * 256 + 50) / 100) | 0;
  // bonus
  for (let rank = 0; rank < RankNb; rank++) Bonus[rank] = 0;
  Bonus[Rank4] = 26;
  Bonus[Rank5] = 77;
  Bonus[Rank6] = 154;
  Bonus[Rank7] = 256;
  // pawn hash-table
  Pawn.size = 0;
  Pawn.mask = 0;
}

// pawn_alloc()
export function pawn_alloc(): void {
  if (UseTable) {
    Pawn.size = TableSize;
    Pawn.mask = TableSize - 1;
    Pawn.lock = new Int32Array(Pawn.size);
    Pawn.opening = new Int16Array(Pawn.size);
    Pawn.endgame = new Int16Array(Pawn.size);
    Pawn.flags = new Uint8Array(Pawn.size * ColourNb);
    Pawn.passed_bits = new Uint8Array(Pawn.size * ColourNb);
    Pawn.single_file = new Uint8Array(Pawn.size * ColourNb);
    pawn_clear();
  }
}

// pawn_clear()
export function pawn_clear(): void {
  Pawn.lock.fill(0);
  Pawn.opening.fill(0);
  Pawn.endgame.fill(0);
  Pawn.flags.fill(0);
  Pawn.passed_bits.fill(0);
  Pawn.single_file.fill(0);
  Pawn.used = 0;
  Pawn.read_nb = 0;
  Pawn.read_hit = 0;
  Pawn.write_nb = 0;
  Pawn.write_collision = 0;
}

// pawn_get_info()
export function pawn_get_info(info: pawn_info_t, board: board_t): void {
  let entry = 0;
  // probe
  if (UseTable) {
    Pawn.read_nb++;
    entry = board.pawn_key_lo & Pawn.mask;
    if (Pawn.lock[entry] === board.pawn_key_hi) {
      // found
      Pawn.read_hit++;
      info.lock = Pawn.lock[entry];
      info.opening = Pawn.opening[entry];
      info.endgame = Pawn.endgame[entry];
      info.flags[0] = Pawn.flags[entry * 2];
      info.flags[1] = Pawn.flags[entry * 2 + 1];
      info.passed_bits[0] = Pawn.passed_bits[entry * 2];
      info.passed_bits[1] = Pawn.passed_bits[entry * 2 + 1];
      info.single_file[0] = Pawn.single_file[entry * 2];
      info.single_file[1] = Pawn.single_file[entry * 2 + 1];
      return;
    }
  }
  // calculation
  pawn_comp_info(info, board);
  // store
  if (UseTable) {
    Pawn.write_nb++;
    if (Pawn.lock[entry] === 0) { // HACK: assume free entry
      Pawn.used++;
    } else {
      Pawn.write_collision++;
    }
    Pawn.opening[entry] = info.opening;
    Pawn.endgame[entry] = info.endgame;
    Pawn.flags[entry * 2] = info.flags[0];
    Pawn.flags[entry * 2 + 1] = info.flags[1];
    Pawn.passed_bits[entry * 2] = info.passed_bits[0];
    Pawn.passed_bits[entry * 2 + 1] = info.passed_bits[1];
    Pawn.single_file[entry * 2] = info.single_file[0];
    Pawn.single_file[entry * 2 + 1] = info.single_file[1];
    Pawn.lock[entry] = board.pawn_key_hi;
  }
}

const opening = new Int32Array(ColourNb), endgame = new Int32Array(ColourNb);
const flags = new Int32Array(ColourNb), file_bits = new Int32Array(ColourNb);
const passed_bits = new Int32Array(ColourNb), single_file = new Int32Array(ColourNb);

// pawn_comp_info()
function pawn_comp_info(info: pawn_info_t, board: board_t): void {
  const pf = board.pawn_file;
  // init
  for (let colour = 0; colour < ColourNb; colour++) {
    opening[colour] = 0;
    endgame[colour] = 0;
    flags[colour] = 0;
    file_bits[colour] = 0;
    passed_bits[colour] = 0;
    single_file[colour] = SquareNone;
  }
  // features and scoring
  for (let colour = 0; colour < ColourNb; colour++) {
    const me = colour;
    const opp = COLOUR_OPP(me);
    const mf = me * FileNb, of = opp * FileNb;
    let sq: number;
    for (let p = me * 16; (sq = board.pawn[p]) !== SquareNone; p++) {
      // init
      const file = SQUARE_FILE(sq);
      const rank = PAWN_RANK(sq, me);
      // flags
      file_bits[me] |= BIT(file);
      if (rank === Rank2) flags[me] |= BackRankFlag;
      // features
      let backward = false;
      let candidate = false;
      let doubled = false;
      let isolated = false;
      let open = false;
      const t1 = pf[mf + file - 1] | pf[mf + file + 1];
      const t2 = pf[mf + file] | BitRev[pf[of + file]];
      // doubled
      if ((pf[mf + file] & BitLT[rank]) !== 0) {
        doubled = true;
      }
      // isolated and backward
      if (t1 === 0) {
        isolated = true;
      } else if ((t1 & BitLE[rank]) === 0) {
        backward = true;
        // really backward?
        if ((t1 & BitRank1[rank]) !== 0) {
          if (((t2 & BitRank1[rank])
            | ((BitRev[pf[of + file - 1]] | BitRev[pf[of + file + 1]]) & BitRank2[rank])) === 0) {
            backward = false;
          }
        } else if (rank === Rank2 && ((t1 & BitEQ[rank + 2]) !== 0)) {
          if (((t2 & BitRank2[rank])
            | ((BitRev[pf[of + file - 1]] | BitRev[pf[of + file + 1]]) & BitRank3[rank])) === 0) {
            backward = false;
          }
        }
      }
      // open, candidate and passed
      if ((t2 & BitGT[rank]) === 0) {
        open = true;
        if (((BitRev[pf[of + file - 1]] | BitRev[pf[of + file + 1]]) & BitGT[rank]) === 0) {
          passed_bits[me] |= BIT(file);
        } else {
          // candidate?
          let n = 0;
          n += BIT_COUNT(pf[mf + file - 1] & BitLE[rank]);
          n += BIT_COUNT(pf[mf + file + 1] & BitLE[rank]);
          n -= BIT_COUNT(BitRev[pf[of + file - 1]] & BitGT[rank]);
          n -= BIT_COUNT(BitRev[pf[of + file + 1]] & BitGT[rank]);
          if (n >= 0) {
            // safe?
            n = 0;
            n += BIT_COUNT(pf[mf + file - 1] & BitEQ[rank - 1]);
            n += BIT_COUNT(pf[mf + file + 1] & BitEQ[rank - 1]);
            n -= BIT_COUNT(BitRev[pf[of + file - 1]] & BitEQ[rank + 1]);
            n -= BIT_COUNT(BitRev[pf[of + file + 1]] & BitEQ[rank + 1]);
            if (n >= 0) candidate = true;
          }
        }
      }
      // score
      if (doubled) {
        opening[me] -= DoubledOpening;
        endgame[me] -= DoubledEndgame;
      }
      if (isolated) {
        if (open) {
          opening[me] -= IsolatedOpeningOpen;
          endgame[me] -= IsolatedEndgame;
        } else {
          opening[me] -= IsolatedOpening;
          endgame[me] -= IsolatedEndgame;
        }
      }
      if (backward) {
        if (open) {
          opening[me] -= BackwardOpeningOpen;
          endgame[me] -= BackwardEndgame;
        } else {
          opening[me] -= BackwardOpening;
          endgame[me] -= BackwardEndgame;
        }
      }
      if (candidate) {
        opening[me] += quad(CandidateOpeningMin, CandidateOpeningMax, rank);
        endgame[me] += quad(CandidateEndgameMin, CandidateEndgameMax, rank);
      }
    }
  }
  // store info
  info.opening = s16(((opening[White] - opening[Black]) * PawnStructureWeight) / 256 | 0);
  info.endgame = s16(((endgame[White] - endgame[Black]) * PawnStructureWeight) / 256 | 0);
  for (let colour = 0; colour < ColourNb; colour++) {
    const me = colour;
    const opp = COLOUR_OPP(me);
    // draw flags
    const bits = file_bits[me];
    if (bits !== 0 && (bits & (bits - 1)) === 0) { // one set bit
      const file = BIT_FIRST(bits);
      let rank = BIT_FIRST(pf[me * FileNb + file]);
      if (((BitRev[pf[opp * FileNb + file - 1]] | BitRev[pf[opp * FileNb + file + 1]]) & BitGT[rank]) === 0) {
        rank = BIT_LAST(pf[me * FileNb + file]);
        single_file[me] = SQUARE_MAKE(file, rank);
      }
    }
    info.flags[colour] = flags[colour];
    info.passed_bits[colour] = passed_bits[colour];
    info.single_file[colour] = single_file[colour];
  }
}

// quad()
export function quad(y_min: number, y_max: number, x: number): number {
  return y_min + ((((y_max - y_min) * Bonus[x] + 128) / 256) | 0);
}
