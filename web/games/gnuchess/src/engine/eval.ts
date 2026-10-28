// Port of src/engine/eval.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// The *opening/*endgame pointer arguments are the module's accumulators EvOpening/EvEndgame.

import { DeltaIncAll, DeltaIncLine, DeltaMask, piece_attack_king } from './attack.ts';
import {
  BB, BK, BN, BP, BQ, BR, board_t, Empty, FlagsBlackKingCastle, FlagsBlackQueenCastle, FlagsWhiteKingCastle,
  FlagsWhiteQueenCastle, KING_POS, WB, WK, WN, WP, WQ, WR,
} from './board.ts';
import { Black, ColourNb, COLOUR_IS_BLACK, COLOUR_IS_WHITE, COLOUR_OPP, White } from './colour.ts';
import {
  DrawBishopFlag, MatBishopFlag, MatKingFlag, MatKnightFlag, MatRookPawnFlag, MAT_KBKBP, MAT_KBKP, MAT_KBPKB,
  MAT_KKNP, MAT_KNKP, MAT_KNPK, MAT_KPKB, MAT_KPKN, MAT_KPKQ, MAT_KPKR, MAT_KQKP, MAT_KRKP, MAT_KRKRP, MAT_KRPKR,
  material_get_info, material_info_t,
} from './material.ts';
import { option_get_int } from './option.ts';
import { BackRankFlag, BitFirst, BitGE, BitLast, pawn_get_info, pawn_info_t, quad } from './pawn.ts';
import { Bishop64, Knight64, PAWN_MOVE_INC, PieceNb, PIECE_IS_BISHOP, Queen64, Rook64 } from './piece.ts';
import {
  A1, A2, A3, A6, A7, A8, B1, B3, B4, B5, B6, B7, B8, C1, C2, C7, C8, D2, D3, D6, D7, D8, E2, E3, E6, E7, E8, F1, F2, F7, F8, FileA,
  FileB, FileD, FileE, FileH, FileNb, G1, G3, G4, G5, G6, G7, G8, H1, H2, H3, H6, H7, H8, PAWN_PROMOTE, PAWN_RANK,
  Rank2, Rank3, Rank4, Rank5, Rank6, Rank7, Rank8, SquareNone, SquareTo64, SQUARE_COLOUR, SQUARE_FILE,
  SQUARE_FILE_MIRROR, SQUARE_MAKE, SQUARE_RANK, SQUARE_RANK_MIRROR,
} from './square.ts';
import { see_move } from './see.ts';
import { ValueDraw, ValueEvalInf } from './value.ts';
import { DeltaOffset, DISTANCE } from './vector.ts';

// constants and variables
let PieceActivityWeight = 256; // 100%
let KingSafetyWeight = 256; // 100%
let PassedPawnWeight = 256; // 100%

const KnightUnit = 4;
const BishopUnit = 6;
const RookUnit = 7;
const QueenUnit = 13;

const MobMove = 1;
const MobAttack = 1;
const MobDefense = 0;

const KnightMobOpening = 4;
const KnightMobEndgame = 4;
const BishopMobOpening = 5;
const BishopMobEndgame = 5;
const RookMobOpening = 2;
const RookMobEndgame = 4;
const QueenMobOpening = 1;
const QueenMobEndgame = 2;

const UseOpenFile = true;
const RookSemiOpenFileOpening = 10;
const RookSemiOpenFileEndgame = 10;
const RookOpenFileOpening = 20;
const RookOpenFileEndgame = 20;
const RookSemiKingFileOpening = 10;
const RookKingFileOpening = 20;

const UseKingAttack = true;
const KingAttackOpening = 20;

const UseShelter = true;
const ShelterOpening = 256; // 100%
const UseStorm = true;
const StormOpening = 10;

const Rook7thOpening = 20;
const Rook7thEndgame = 40;
const Queen7thOpening = 10;
const Queen7thEndgame = 20;

const TrappedBishop = 100;

const BlockedBishop = 50;
const BlockedRook = 50;

const PassedOpeningMin = 10;
const PassedOpeningMax = 70;
const PassedEndgameMin = 20;
const PassedEndgameMax = 140;

const UnstoppablePasser = 800;
const FreePasser = 60;

const AttackerDistance = 5;
const DefenderDistance = 20;

const TempoBonus = 10;

// "constants"
const KingAttackWeight = Int32Array.from([
  0, 0, 128, 192, 224, 240, 248, 252, 254, 255, 256, 256, 256, 256, 256, 256,
]);

// variables
const MobUnit = new Int32Array(ColourNb * PieceNb); // MobUnit[colour][piece] at colour*256+piece
const KingAttackUnit = new Int32Array(PieceNb);

// the *opening and *endgame of eval()
let EvOpening = 0;
let EvEndgame = 0;

// functions

// eval_init()
export function eval_init(): void {
  // UCI options
  PieceActivityWeight = ((option_get_int('Piece Activity') * 256 + 50) / 100) | 0;
  KingSafetyWeight = ((option_get_int('King Safety') * 256 + 50) / 100) | 0;
  PassedPawnWeight = ((option_get_int('Passed Pawns') * 256 + 50) / 100) | 0;
  // mobility table
  MobUnit.fill(0);
  const W = White * PieceNb, B = Black * PieceNb;
  MobUnit[W + Empty] = MobMove;
  MobUnit[W + BP] = MobAttack;
  MobUnit[W + BN] = MobAttack;
  MobUnit[W + BB] = MobAttack;
  MobUnit[W + BR] = MobAttack;
  MobUnit[W + BQ] = MobAttack;
  MobUnit[W + BK] = MobAttack;
  MobUnit[W + WP] = MobDefense;
  MobUnit[W + WN] = MobDefense;
  MobUnit[W + WB] = MobDefense;
  MobUnit[W + WR] = MobDefense;
  MobUnit[W + WQ] = MobDefense;
  MobUnit[W + WK] = MobDefense;
  MobUnit[B + Empty] = MobMove;
  MobUnit[B + WP] = MobAttack;
  MobUnit[B + WN] = MobAttack;
  MobUnit[B + WB] = MobAttack;
  MobUnit[B + WR] = MobAttack;
  MobUnit[B + WQ] = MobAttack;
  MobUnit[B + WK] = MobAttack;
  MobUnit[B + BP] = MobDefense;
  MobUnit[B + BN] = MobDefense;
  MobUnit[B + BB] = MobDefense;
  MobUnit[B + BR] = MobDefense;
  MobUnit[B + BQ] = MobDefense;
  MobUnit[B + BK] = MobDefense;
  // KingAttackUnit[]
  KingAttackUnit.fill(0);
  KingAttackUnit[WN] = 1;
  KingAttackUnit[WB] = 1;
  KingAttackUnit[WR] = 2;
  KingAttackUnit[WQ] = 4;
  KingAttackUnit[BN] = 1;
  KingAttackUnit[BB] = 1;
  KingAttackUnit[BR] = 2;
  KingAttackUnit[BQ] = 4;
}

// scratch objects, made on first use
let mat_info_scratch: material_info_t | undefined;
let pawn_info_scratch: pawn_info_t | undefined;
const mul = new Int32Array(ColourNb);

// eval() (eval is not a function name in JavaScript)
export function evaluate(board: board_t): number {
  const mat_info = (mat_info_scratch ??= new material_info_t());
  const pawn_info = (pawn_info_scratch ??= new pawn_info_t());
  // init
  EvOpening = 0;
  EvEndgame = 0;
  // material
  material_get_info(mat_info, board);
  EvOpening += mat_info.opening;
  EvEndgame += mat_info.endgame;
  mul[White] = mat_info.mul[White];
  mul[Black] = mat_info.mul[Black];
  // PST
  EvOpening += board.opening;
  EvEndgame += board.endgame;
  // pawns
  pawn_get_info(pawn_info, board);
  EvOpening += pawn_info.opening;
  EvEndgame += pawn_info.endgame;
  // draw
  eval_draw(board, mat_info, pawn_info, mul);
  if (mat_info.mul[White] < mul[White]) mul[White] = mat_info.mul[White];
  if (mat_info.mul[Black] < mul[Black]) mul[Black] = mat_info.mul[Black];
  if (mul[White] === 0 && mul[Black] === 0) return ValueDraw;
  // eval
  eval_piece(board, mat_info, pawn_info);
  eval_king(board, mat_info);
  eval_passer(board, pawn_info);
  eval_pattern(board);
  // phase mix
  const phase = mat_info.phase;
  let ev = ((EvOpening * (256 - phase)) + (EvEndgame * phase)) / 256 | 0;
  // tempo bonus
  if (COLOUR_IS_WHITE(board.turn)) {
    ev += TempoBonus;
  } else {
    ev -= TempoBonus;
  }
  // drawish bishop endgames
  if ((mat_info.flags & DrawBishopFlag) !== 0) {
    const wb = board.piece[White * 32 + 1];
    const bb = board.piece[Black * 32 + 1];
    if (SQUARE_COLOUR(wb) !== SQUARE_COLOUR(bb)) {
      if (mul[White] === 16) mul[White] = 8; // 1/2
      if (mul[Black] === 16) mul[Black] = 8; // 1/2
    }
  }
  // draw bound
  if (ev > ValueDraw) {
    ev = (ev * mul[White]) / 16 | 0;
  } else if (ev < ValueDraw) {
    ev = (ev * mul[Black]) / 16 | 0;
  }
  // value range
  if (ev < -ValueEvalInf) ev = -ValueEvalInf;
  if (ev > +ValueEvalInf) ev = +ValueEvalInf;
  // turn
  if (COLOUR_IS_BLACK(board.turn)) ev = -ev;
  return ev;
}

const list = new Int32Array(7 + 1);

// eval_draw()
function eval_draw(board: board_t, mat_info: material_info_t, pawn_info: pawn_info_t, mul: Int32Array): void {
  // draw patterns
  for (let colour = 0; colour < ColourNb; colour++) {
    const me = colour;
    const opp = COLOUR_OPP(me);
    // KB*P+K* draw
    if ((mat_info.cflags[me] & MatRookPawnFlag) !== 0) {
      const pawn = pawn_info.single_file[me];
      if (pawn !== SquareNone) { // all pawns on one file
        const pawn_file = SQUARE_FILE(pawn);
        if (pawn_file === FileA || pawn_file === FileH) {
          const king = KING_POS(board, opp);
          const prom = PAWN_PROMOTE(pawn, me);
          if (DISTANCE(king, prom) <= 1 && !bishop_can_attack(board, prom, me)) {
            mul[me] = 0;
          }
        }
      }
    }
    // K(B)P+K+ draw
    if ((mat_info.cflags[me] & MatBishopFlag) !== 0) {
      const pawn = pawn_info.single_file[me];
      if (pawn !== SquareNone) { // all pawns on one file
        const king = KING_POS(board, opp);
        if (SQUARE_FILE(king) === SQUARE_FILE(pawn)
          && PAWN_RANK(king, me) > PAWN_RANK(pawn, me)
          && !bishop_can_attack(board, king, me)) {
          mul[me] = 1; // 1/16
        }
      }
    }
    // KNPK* draw
    if ((mat_info.cflags[me] & MatKnightFlag) !== 0) {
      const pawn = board.pawn[me * 16];
      const king = KING_POS(board, opp);
      if (SQUARE_FILE(king) === SQUARE_FILE(pawn)
        && PAWN_RANK(king, me) > PAWN_RANK(pawn, me)
        && PAWN_RANK(pawn, me) <= Rank6) {
        mul[me] = 1; // 1/16
      }
    }
  }
  // recognisers, only heuristic draws here!
  const recog = mat_info.recog;
  if (recog === MAT_KPKQ) {
    // KPKQ (white)
    draw_init_list(list, board, White);
    if (draw_kpkq(list, board.turn)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KQKP) {
    // KPKQ (black)
    draw_init_list(list, board, Black);
    if (draw_kpkq(list, COLOUR_OPP(board.turn))) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KPKR) {
    // KPKR (white)
    draw_init_list(list, board, White);
    if (draw_kpkr(list, board.turn)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KRKP) {
    // KPKR (black)
    draw_init_list(list, board, Black);
    if (draw_kpkr(list, COLOUR_OPP(board.turn))) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KPKB) {
    // KPKB (white)
    draw_init_list(list, board, White);
    if (draw_kpkb(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KBKP) {
    // KPKB (black)
    draw_init_list(list, board, Black);
    if (draw_kpkb(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KPKN) {
    // KPKN (white)
    draw_init_list(list, board, White);
    if (draw_kpkn(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KNKP) {
    // KPKN (black)
    draw_init_list(list, board, Black);
    if (draw_kpkn(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KNPK) {
    // KNPK (white)
    draw_init_list(list, board, White);
    if (draw_knpk(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KKNP) {
    // KNPK (black)
    draw_init_list(list, board, Black);
    if (draw_knpk(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KRPKR) {
    // KRPKR (white)
    draw_init_list(list, board, White);
    if (draw_krpkr(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KRKRP) {
    // KRPKR (black)
    draw_init_list(list, board, Black);
    if (draw_krpkr(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KBPKB) {
    // KBPKB (white)
    draw_init_list(list, board, White);
    if (draw_kbpkb(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  } else if (recog === MAT_KBKBP) {
    // KBPKB (black)
    draw_init_list(list, board, Black);
    if (draw_kbpkb(list)) {
      mul[White] = 1; // 1/16;
      mul[Black] = 1; // 1/16;
    }
  }
}

const op = new Int32Array(ColourNb), eg = new Int32Array(ColourNb);

// eval_piece()
function eval_piece(board: board_t, mat_info: material_info_t, pawn_info: pawn_info_t): void {
  const square = board.square;
  // init
  op[0] = op[1] = 0;
  eg[0] = eg[1] = 0;
  // eval
  for (let colour = 0; colour < ColourNb; colour++) {
    const me = colour;
    const opp = COLOUR_OPP(me);
    const unit = me * PieceNb; // MobUnit[me]
    let from: number, to: number, capture: number, mob: number;
    // piece loop
    for (let p = me * 32 + 1; (from = board.piece[p]) !== SquareNone; p++) { // HACK: no king
      const piece = square[from];
      switch (piece & ~3) {
        case Knight64:
          // mobility
          mob = -KnightUnit;
          mob += MobUnit[unit + square[from - 33]];
          mob += MobUnit[unit + square[from - 31]];
          mob += MobUnit[unit + square[from - 18]];
          mob += MobUnit[unit + square[from - 14]];
          mob += MobUnit[unit + square[from + 14]];
          mob += MobUnit[unit + square[from + 18]];
          mob += MobUnit[unit + square[from + 31]];
          mob += MobUnit[unit + square[from + 33]];
          op[me] += mob * KnightMobOpening;
          eg[me] += mob * KnightMobEndgame;
          break;
        case Bishop64:
          // mobility
          mob = -BishopUnit;
          for (to = from - 17; (capture = square[to]) === Empty; to -= 17) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from - 15; (capture = square[to]) === Empty; to -= 15) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 15; (capture = square[to]) === Empty; to += 15) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 17; (capture = square[to]) === Empty; to += 17) mob += MobMove;
          mob += MobUnit[unit + capture];
          op[me] += mob * BishopMobOpening;
          eg[me] += mob * BishopMobEndgame;
          break;
        case Rook64:
          // mobility
          mob = -RookUnit;
          for (to = from - 16; (capture = square[to]) === Empty; to -= 16) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from - 1; (capture = square[to]) === Empty; to -= 1) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 1; (capture = square[to]) === Empty; to += 1) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 16; (capture = square[to]) === Empty; to += 16) mob += MobMove;
          mob += MobUnit[unit + capture];
          op[me] += mob * RookMobOpening;
          eg[me] += mob * RookMobEndgame;
          // open file
          if (UseOpenFile) {
            op[me] -= (RookOpenFileOpening / 2) | 0;
            eg[me] -= (RookOpenFileEndgame / 2) | 0;
            const rook_file = SQUARE_FILE(from);
            if (board.pawn_file[me * FileNb + rook_file] === 0) { // no friendly pawn
              op[me] += RookSemiOpenFileOpening;
              eg[me] += RookSemiOpenFileEndgame;
              if (board.pawn_file[opp * FileNb + rook_file] === 0) { // no enemy pawn
                op[me] += RookOpenFileOpening - RookSemiOpenFileOpening;
                eg[me] += RookOpenFileEndgame - RookSemiOpenFileEndgame;
              }
              if ((mat_info.cflags[opp] & MatKingFlag) !== 0) {
                const king = KING_POS(board, opp);
                const king_file = SQUARE_FILE(king);
                const delta = Math.abs(rook_file - king_file); // file distance
                if (delta <= 1) {
                  op[me] += RookSemiKingFileOpening;
                  if (delta === 0) op[me] += RookKingFileOpening - RookSemiKingFileOpening;
                }
              }
            }
          }
          // 7th rank
          if (PAWN_RANK(from, me) === Rank7) {
            if ((pawn_info.flags[opp] & BackRankFlag) !== 0 // opponent pawn on 7th rank
              || PAWN_RANK(KING_POS(board, opp), me) === Rank8) {
              op[me] += Rook7thOpening;
              eg[me] += Rook7thEndgame;
            }
          }
          break;
        case Queen64:
          // mobility
          mob = -QueenUnit;
          for (to = from - 17; (capture = square[to]) === Empty; to -= 17) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from - 16; (capture = square[to]) === Empty; to -= 16) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from - 15; (capture = square[to]) === Empty; to -= 15) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from - 1; (capture = square[to]) === Empty; to -= 1) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 1; (capture = square[to]) === Empty; to += 1) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 15; (capture = square[to]) === Empty; to += 15) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 16; (capture = square[to]) === Empty; to += 16) mob += MobMove;
          mob += MobUnit[unit + capture];
          for (to = from + 17; (capture = square[to]) === Empty; to += 17) mob += MobMove;
          mob += MobUnit[unit + capture];
          op[me] += mob * QueenMobOpening;
          eg[me] += mob * QueenMobEndgame;
          // 7th rank
          if (PAWN_RANK(from, me) === Rank7) {
            if ((pawn_info.flags[opp] & BackRankFlag) !== 0 // opponent pawn on 7th rank
              || PAWN_RANK(KING_POS(board, opp), me) === Rank8) {
              op[me] += Queen7thOpening;
              eg[me] += Queen7thEndgame;
            }
          }
          break;
      }
    }
  }
  // update
  EvOpening += ((op[White] - op[Black]) * PieceActivityWeight) / 256 | 0;
  EvEndgame += ((eg[White] - eg[Black]) * PieceActivityWeight) / 256 | 0;
}

// eval_king()
function eval_king(board: board_t, mat_info: material_info_t): void {
  // init
  op[0] = op[1] = 0;
  eg[0] = eg[1] = 0;
  // king attacks
  if (UseKingAttack) {
    for (let colour = 0; colour < ColourNb; colour++) {
      if ((mat_info.cflags[colour] & MatKingFlag) !== 0) {
        const me = colour;
        const opp = COLOUR_OPP(me);
        const king = KING_POS(board, me);
        // piece attacks
        let attack_tot = 0;
        let piece_nb = 0;
        let from: number;
        for (let p = opp * 32 + 1; (from = board.piece[p]) !== SquareNone; p++) { // HACK: no king
          const piece = board.square[from];
          if (piece_attack_king(board, piece, from, king)) {
            piece_nb++;
            attack_tot += KingAttackUnit[piece];
          }
        }
        // scoring
        op[colour] -= (attack_tot * KingAttackOpening * KingAttackWeight[piece_nb]) / 256 | 0;
      }
    }
  }
  // white pawn shelter
  if (UseShelter && (mat_info.cflags[White] & MatKingFlag) !== 0) {
    const me = White;
    // king
    const penalty_1 = shelter_square(board, KING_POS(board, me), me);
    // castling
    let penalty_2 = penalty_1;
    if ((board.flags & FlagsWhiteKingCastle) !== 0) {
      const tmp = shelter_square(board, G1, me);
      if (tmp < penalty_2) penalty_2 = tmp;
    }
    if ((board.flags & FlagsWhiteQueenCastle) !== 0) {
      const tmp = shelter_square(board, B1, me);
      if (tmp < penalty_2) penalty_2 = tmp;
    }
    // penalty
    const penalty = (penalty_1 + penalty_2) / 2 | 0;
    op[me] -= (penalty * ShelterOpening) / 256 | 0;
  }
  // black pawn shelter
  if (UseShelter && (mat_info.cflags[Black] & MatKingFlag) !== 0) {
    const me = Black;
    // king
    const penalty_1 = shelter_square(board, KING_POS(board, me), me);
    // castling
    let penalty_2 = penalty_1;
    if ((board.flags & FlagsBlackKingCastle) !== 0) {
      const tmp = shelter_square(board, G8, me);
      if (tmp < penalty_2) penalty_2 = tmp;
    }
    if ((board.flags & FlagsBlackQueenCastle) !== 0) {
      const tmp = shelter_square(board, B8, me);
      if (tmp < penalty_2) penalty_2 = tmp;
    }
    // penalty
    const penalty = (penalty_1 + penalty_2) / 2 | 0;
    op[me] -= (penalty * ShelterOpening) / 256 | 0;
  }
  // update
  EvOpening += ((op[White] - op[Black]) * KingSafetyWeight) / 256 | 0;
  EvEndgame += ((eg[White] - eg[Black]) * KingSafetyWeight) / 256 | 0;
}

// eval_passer()
function eval_passer(board: board_t, pawn_info: pawn_info_t): void {
  // init
  op[0] = op[1] = 0;
  eg[0] = eg[1] = 0;
  // passed pawns
  for (let colour = 0; colour < ColourNb; colour++) {
    const att = colour;
    const def = COLOUR_OPP(att);
    for (let bits = pawn_info.passed_bits[att]; bits !== 0; bits &= bits - 1) {
      const file = BitFirst[bits];
      const rank = BitLast[board.pawn_file[att * FileNb + file]];
      let sq = SQUARE_MAKE(file, rank);
      if (COLOUR_IS_BLACK(att)) sq = SQUARE_RANK_MIRROR(sq);
      // opening scoring
      op[att] += quad(PassedOpeningMin, PassedOpeningMax, rank);
      // endgame scoring init
      const min = PassedEndgameMin;
      const max = PassedEndgameMax;
      let delta = max - min;
      // "dangerous" bonus
      if (board.piece_size[def] <= 1 // defender has no piece
        && (unstoppable_passer(board, sq, att) || king_passer(board, sq, att))) {
        delta += UnstoppablePasser;
      } else if (free_passer(board, sq, att)) {
        delta += FreePasser;
      }
      // king-distance bonus
      delta -= pawn_att_dist(sq, KING_POS(board, att), att) * AttackerDistance;
      delta += pawn_def_dist(sq, KING_POS(board, def), att) * DefenderDistance;
      // endgame scoring
      eg[att] += min;
      if (delta > 0) eg[att] += quad(0, delta, rank);
    }
  }
  // update
  EvOpening += ((op[White] - op[Black]) * PassedPawnWeight) / 256 | 0;
  EvEndgame += ((eg[White] - eg[Black]) * PassedPawnWeight) / 256 | 0;
}

// eval_pattern()
function eval_pattern(board: board_t): void {
  const square = board.square;
  // trapped bishop (7th rank)
  if ((square[A7] === WB && square[B6] === BP)
    || (square[B8] === WB && square[C7] === BP)) {
    EvOpening -= TrappedBishop;
    EvEndgame -= TrappedBishop;
  }
  if ((square[H7] === WB && square[G6] === BP)
    || (square[G8] === WB && square[F7] === BP)) {
    EvOpening -= TrappedBishop;
    EvEndgame -= TrappedBishop;
  }
  if ((square[A2] === BB && square[B3] === WP)
    || (square[B1] === BB && square[C2] === WP)) {
    EvOpening += TrappedBishop;
    EvEndgame += TrappedBishop;
  }
  if ((square[H2] === BB && square[G3] === WP)
    || (square[G1] === BB && square[F2] === WP)) {
    EvOpening += TrappedBishop;
    EvEndgame += TrappedBishop;
  }
  // trapped bishop (6th rank)
  if (square[A6] === WB && square[B5] === BP) {
    EvOpening -= TrappedBishop / 2;
    EvEndgame -= TrappedBishop / 2;
  }
  if (square[H6] === WB && square[G5] === BP) {
    EvOpening -= TrappedBishop / 2;
    EvEndgame -= TrappedBishop / 2;
  }
  if (square[A3] === BB && square[B4] === WP) {
    EvOpening += TrappedBishop / 2;
    EvEndgame += TrappedBishop / 2;
  }
  if (square[H3] === BB && square[G4] === WP) {
    EvOpening += TrappedBishop / 2;
    EvEndgame += TrappedBishop / 2;
  }
  // blocked bishop
  if (square[D2] === WP && square[D3] !== Empty && square[C1] === WB) {
    EvOpening -= BlockedBishop;
  }
  if (square[E2] === WP && square[E3] !== Empty && square[F1] === WB) {
    EvOpening -= BlockedBishop;
  }
  if (square[D7] === BP && square[D6] !== Empty && square[C8] === BB) {
    EvOpening += BlockedBishop;
  }
  if (square[E7] === BP && square[E6] !== Empty && square[F8] === BB) {
    EvOpening += BlockedBishop;
  }
  // blocked rook
  if ((square[C1] === WK || square[B1] === WK)
    && (square[A1] === WR || square[A2] === WR || square[B1] === WR)) {
    EvOpening -= BlockedRook;
  }
  if ((square[F1] === WK || square[G1] === WK)
    && (square[H1] === WR || square[H2] === WR || square[G1] === WR)) {
    EvOpening -= BlockedRook;
  }
  if ((square[C8] === BK || square[B8] === BK)
    && (square[A8] === BR || square[A7] === BR || square[B8] === BR)) {
    EvOpening += BlockedRook;
  }
  if ((square[F8] === BK || square[G8] === BK)
    && (square[H8] === BR || square[H7] === BR || square[G8] === BR)) {
    EvOpening += BlockedRook;
  }
}

// unstoppable_passer()
function unstoppable_passer(board: board_t, pawn: number, colour: number): boolean {
  const me = colour;
  const opp = COLOUR_OPP(me);
  const file = SQUARE_FILE(pawn);
  let rank = PAWN_RANK(pawn, me);
  const king = KING_POS(board, opp);
  // clear promotion path?
  let sq: number;
  for (let p = me * 32; (sq = board.piece[p]) !== SquareNone; p++) {
    if (SQUARE_FILE(sq) === file && PAWN_RANK(sq, me) > rank) {
      return false; // "friendly" blocker
    }
  }
  // init
  if (rank === Rank2) {
    pawn += PAWN_MOVE_INC(me);
    rank++;
  }
  const prom = PAWN_PROMOTE(pawn, me);
  let dist = DISTANCE(pawn, prom);
  if (board.turn === opp) dist++;
  if (DISTANCE(king, prom) > dist) return true; // not in the square
  return false;
}

// king_passer()
function king_passer(board: board_t, pawn: number, colour: number): boolean {
  const me = colour;
  const king = KING_POS(board, me);
  const file = SQUARE_FILE(pawn);
  const prom = PAWN_PROMOTE(pawn, me);
  if (DISTANCE(king, prom) <= 1
    && DISTANCE(king, pawn) <= 1
    && (SQUARE_FILE(king) !== file
      || (file !== FileA && file !== FileH))) {
    return true;
  }
  return false;
}

// free_passer()
function free_passer(board: board_t, pawn: number, colour: number): boolean {
  const me = colour;
  const inc = PAWN_MOVE_INC(me);
  const sq = pawn + inc;
  if (board.square[sq] !== Empty) return false;
  const move = (SquareTo64[pawn] << 6) | SquareTo64[sq];
  if (see_move(move, board) < 0) return false;
  return true;
}

// pawn_att_dist()
function pawn_att_dist(pawn: number, king: number, colour: number): number {
  const me = colour;
  const inc = PAWN_MOVE_INC(me);
  const target = pawn + inc;
  return DISTANCE(king, target);
}

// pawn_def_dist()
function pawn_def_dist(pawn: number, king: number, colour: number): number {
  const me = colour;
  const inc = PAWN_MOVE_INC(me);
  const target = pawn + inc;
  return DISTANCE(king, target);
}

// draw_init_list()
function draw_init_list(list: Int32Array, board: board_t, pawn_colour: number): void {
  // init
  let pos = 0;
  const att = pawn_colour;
  const def = COLOUR_OPP(att);
  let sq: number;
  // att
  for (let p = att * 32; (sq = board.piece[p]) !== SquareNone; p++) {
    list[pos++] = sq;
  }
  for (let p = att * 16; (sq = board.pawn[p]) !== SquareNone; p++) {
    list[pos++] = sq;
  }
  // def
  for (let p = def * 32; (sq = board.piece[p]) !== SquareNone; p++) {
    list[pos++] = sq;
  }
  for (let p = def * 16; (sq = board.pawn[p]) !== SquareNone; p++) {
    list[pos++] = sq;
  }
  // end marker
  list[pos] = SquareNone;
  // file flip?
  const pawn = board.pawn[att * 16];
  if (SQUARE_FILE(pawn) >= FileE) {
    for (let i = 0; i < pos; i++) {
      list[i] = SQUARE_FILE_MIRROR(list[i]);
    }
  }
  // rank flip?
  if (COLOUR_IS_BLACK(pawn_colour)) {
    for (let i = 0; i < pos; i++) {
      list[i] = SQUARE_RANK_MIRROR(list[i]);
    }
  }
}

// draw_kpkq()
function draw_kpkq(list: Int32Array, turn: number): boolean {
  // load
  const wk = list[0];
  const wp = list[1];
  const bk = list[2];
  const bq = list[3];
  // test
  if (wp === A7) {
    const prom = A8;
    let dist = 4;
    if (wk === B7 || wk === B8) { // best case
      if (COLOUR_IS_WHITE(turn)) dist--;
    } else if (wk === A8 || ((wk === C7 || wk === C8) && bq !== A8)) { // white loses a tempo
      if (COLOUR_IS_BLACK(turn) && SQUARE_FILE(bq) !== FileB) return false;
    } else {
      return false;
    }
    if (DISTANCE(bk, prom) > dist) return true;
  } else if (wp === C7) {
    const prom = C8;
    let dist = 4;
    if (wk === C8) { // dist = 0
      dist++; // self-blocking penalty
      if (COLOUR_IS_WHITE(turn)) dist--; // right-to-move bonus
    } else if (wk === B7 || wk === B8) { // dist = 1, right side
      dist--; // right-side bonus
      if (DeltaIncLine[DeltaOffset + wp - bq] === wk - wp) dist++; // pinned-pawn penalty
      if (COLOUR_IS_WHITE(turn)) dist--; // right-to-move bonus
    } else if (wk === D7 || wk === D8) { // dist = 1, wrong side
      if (DeltaIncLine[DeltaOffset + wp - bq] === wk - wp) dist++; // pinned-pawn penalty
      if (COLOUR_IS_WHITE(turn)) dist--; // right-to-move bonus
    } else if ((wk === A7 || wk === A8) && bq !== C8) { // dist = 2, right side
      if (COLOUR_IS_BLACK(turn) && SQUARE_FILE(bq) !== FileB) return false;
      dist--; // right-side bonus
    } else if ((wk === E7 || wk === E8) && bq !== C8) { // dist = 2, wrong side
      if (COLOUR_IS_BLACK(turn) && SQUARE_FILE(bq) !== FileD) return false;
    } else {
      return false;
    }
    if (DISTANCE(bk, prom) > dist) return true;
  }
  return false;
}

// draw_kpkr()
function draw_kpkr(list: Int32Array, turn: number): boolean {
  // load
  const wk = list[0];
  const wp = list[1];
  const bk = list[2];
  const br = list[3];
  // init
  const wk_file = SQUARE_FILE(wk);
  const wk_rank = SQUARE_RANK(wk);
  const wp_file = SQUARE_FILE(wp);
  const wp_rank = SQUARE_RANK(wp);
  const br_file = SQUARE_FILE(br);
  const br_rank = SQUARE_RANK(br);
  const inc = PAWN_MOVE_INC(White);
  const prom = PAWN_PROMOTE(wp, White);
  // conditions
  if (DISTANCE(wk, wp) === 1) {
    // no-op
  } else if (DISTANCE(wk, wp) === 2 && Math.abs(wk_rank - wp_rank) <= 1) {
    if (COLOUR_IS_BLACK(turn) && br_file !== ((wk_file + wp_file) / 2 | 0)) return false;
  } else {
    return false;
  }
  // white features
  let dist = DISTANCE(wk, prom) + DISTANCE(wp, prom);
  if (wk === prom) dist++;
  if (wk === wp + inc) { // king on pawn's "front square"
    if (wp_file === FileA) return false;
    dist++; // self-blocking penalty
  }
  // black features
  if (br_file !== wp_file && br_rank !== Rank8) {
    dist--; // misplaced-rook bonus
  }
  // test
  if (COLOUR_IS_WHITE(turn)) dist--; // right-to-move bonus
  if (DISTANCE(bk, prom) > dist) return true;
  return false;
}

// draw_kpkb()
function draw_kpkb(list: Int32Array): boolean {
  // load
  const wp = list[1];
  const bk = list[2];
  const bb = list[3];
  // blocked pawn?
  const inc = PAWN_MOVE_INC(White);
  const end = PAWN_PROMOTE(wp, White) + inc;
  for (let to = wp + inc; to !== end; to += inc) {
    if (to === bb) return true; // direct blockade
    const delta = to - bb;
    if ((BB & DeltaMask[DeltaOffset + delta]) !== 0) {
      const inc_2 = DeltaIncAll[DeltaOffset + delta];
      let sq = bb;
      do {
        sq += inc_2;
        if (sq === to) return true; // indirect blockade
      } while (sq !== bk);
    }
  }
  return false;
}

// draw_kpkn()
function draw_kpkn(list: Int32Array): boolean {
  // load
  const wp = list[1];
  const bn = list[3];
  // blocked pawn?
  const inc = PAWN_MOVE_INC(White);
  let end = PAWN_PROMOTE(wp, White) + inc;
  const file = SQUARE_FILE(wp);
  if (file === FileA || file === FileH) end -= inc;
  for (let sq = wp + inc; sq !== end; sq += inc) {
    if (sq === bn || (BN & DeltaMask[DeltaOffset + sq - bn]) !== 0) return true; // blockade
  }
  return false;
}

// draw_knpk()
function draw_knpk(list: Int32Array): boolean {
  // load
  const wp = list[2];
  const bk = list[3];
  // test
  if (wp === A7 && DISTANCE(bk, A8) <= 1) return true;
  return false;
}

// draw_krpkr()
function draw_krpkr(list: Int32Array): boolean {
  // load
  const wk = list[0];
  const wr = list[1];
  const wp = list[2];
  const bk = list[3];
  const br = list[4];
  // test
  const wp_file = SQUARE_FILE(wp);
  const wp_rank = SQUARE_RANK(wp);
  const bk_file = SQUARE_FILE(bk);
  const bk_rank = SQUARE_RANK(bk);
  const br_file = SQUARE_FILE(br);
  const br_rank = SQUARE_RANK(br);
  const prom = PAWN_PROMOTE(wp, White);
  if (bk === prom) {
    // TODO: rook near Rank1 if wp_rank == Rank6?
    if (br_file > wp_file) return true;
  } else if (bk_file === wp_file && bk_rank > wp_rank) {
    return true;
  } else if (wr === prom && wp_rank === Rank7 && (bk === G7 || bk === H7) && br_file === wp_file) {
    if (br_rank <= Rank3) {
      if (DISTANCE(wk, wp) > 1) return true;
    } else { // br_rank >= Rank4
      if (DISTANCE(wk, wp) > 2) return true;
    }
  }
  return false;
}

// draw_kbpkb()
function draw_kbpkb(list: Int32Array): boolean {
  // load
  const wb = list[1];
  const wp = list[2];
  const bk = list[3];
  const bb = list[4];
  // opposit colour?
  if (SQUARE_COLOUR(wb) === SQUARE_COLOUR(bb)) return false; // TODO
  // blocked pawn?
  const inc = PAWN_MOVE_INC(White);
  const end = PAWN_PROMOTE(wp, White) + inc;
  for (let to = wp + inc; to !== end; to += inc) {
    if (to === bb) return true; // direct blockade
    const delta = to - bb;
    if ((BB & DeltaMask[DeltaOffset + delta]) !== 0) {
      const inc_2 = DeltaIncAll[DeltaOffset + delta];
      let sq = bb;
      do {
        sq += inc_2;
        if (sq === to) return true; // indirect blockade
      } while (sq !== bk);
    }
  }
  return false;
}

// shelter_square()
function shelter_square(board: board_t, square: number, colour: number): number {
  let penalty = 0;
  const file = SQUARE_FILE(square);
  const rank = PAWN_RANK(square, colour);
  penalty += shelter_file(board, file, rank, colour) * 2;
  if (file !== FileA) penalty += shelter_file(board, file - 1, rank, colour);
  if (file !== FileH) penalty += shelter_file(board, file + 1, rank, colour);
  if (penalty === 0) penalty = 11; // weak back rank
  if (UseStorm) {
    penalty += storm_file(board, file, colour);
    if (file !== FileA) penalty += storm_file(board, file - 1, colour);
    if (file !== FileH) penalty += storm_file(board, file + 1, colour);
  }
  return penalty;
}

// shelter_file()
function shelter_file(board: board_t, file: number, rank: number, colour: number): number {
  let dist = BitFirst[board.pawn_file[colour * FileNb + file] & BitGE[rank]];
  dist = Rank8 - dist;
  return 36 - dist * dist;
}

// storm_file()
function storm_file(board: board_t, file: number, colour: number): number {
  const dist = BitLast[board.pawn_file[COLOUR_OPP(colour) * FileNb + file]];
  let penalty = 0;
  switch (dist) {
    case Rank4:
      penalty = StormOpening * 1;
      break;
    case Rank5:
      penalty = StormOpening * 3;
      break;
    case Rank6:
      penalty = StormOpening * 6;
      break;
  }
  return penalty;
}

// bishop_can_attack()
function bishop_can_attack(board: board_t, to: number, colour: number): boolean {
  let from: number;
  for (let p = colour * 32 + 1; (from = board.piece[p]) !== SquareNone; p++) { // HACK: no king
    const piece = board.square[from];
    if (PIECE_IS_BISHOP(piece) && SQUARE_COLOUR(from) === SQUARE_COLOUR(to)) {
      return true;
    }
  }
  return false;
}
