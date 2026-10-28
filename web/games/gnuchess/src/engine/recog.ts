// Port of src/engine/recog.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { board_t, KING_POS } from './board.ts';
import { Black, COLOUR_IS_WHITE, COLOUR_OPP, White } from './colour.ts';
import {
  DrawNodeFlag, MAT_KBK, MAT_KBKB, MAT_KBPK, MAT_KK, MAT_KKB, MAT_KKBP, MAT_KKN, MAT_KKP, MAT_KNK, MAT_KPK,
  material_get_info, material_info_t,
} from './material.ts';
import {
  A8, FileA, FileC, FileE, Rank2, Rank4, Rank5, Rank6, SQUARE_COLOUR, SQUARE_FILE, SQUARE_FILE_MIRROR, SQUARE_RANK,
  SQUARE_RANK_MIRROR,
} from './square.ts';
import { DISTANCE } from './vector.ts';

// a scratch material_info_t, made on first use
let mat_info_scratch: material_info_t | undefined;

// recog_draw()
export function recog_draw(board: board_t): boolean {
  // material
  if (board.piece_nb > 4) return false;
  const mat_info = (mat_info_scratch ??= new material_info_t());
  material_get_info(mat_info, board);
  if ((mat_info.flags & DrawNodeFlag) === 0) return false;
  // recognisers
  const recog = mat_info.recog;
  if (recog === MAT_KK) {
    // KK
    return true;
  } else if (recog === MAT_KBK) {
    // KBK (white)
    return true;
  } else if (recog === MAT_KKB) {
    // KBK (black)
    return true;
  } else if (recog === MAT_KNK) {
    // KNK (white)
    return true;
  } else if (recog === MAT_KKN) {
    // KNK (black)
    return true;
  } else if (recog === MAT_KPK) {
    // KPK (white)
    const me = White;
    const opp = COLOUR_OPP(me);
    let wp = board.pawn[me * 16];
    let wk = KING_POS(board, me);
    let bk = KING_POS(board, opp);
    if (SQUARE_FILE(wp) >= FileE) {
      wp = SQUARE_FILE_MIRROR(wp);
      wk = SQUARE_FILE_MIRROR(wk);
      bk = SQUARE_FILE_MIRROR(bk);
    }
    if (kpk_draw(wp, wk, bk, board.turn)) {
      return true;
    }
  } else if (recog === MAT_KKP) {
    // KPK (black)
    const me = Black;
    const opp = COLOUR_OPP(me);
    let wp = SQUARE_RANK_MIRROR(board.pawn[me * 16]);
    let wk = SQUARE_RANK_MIRROR(KING_POS(board, me));
    let bk = SQUARE_RANK_MIRROR(KING_POS(board, opp));
    if (SQUARE_FILE(wp) >= FileE) {
      wp = SQUARE_FILE_MIRROR(wp);
      wk = SQUARE_FILE_MIRROR(wk);
      bk = SQUARE_FILE_MIRROR(bk);
    }
    if (kpk_draw(wp, wk, bk, COLOUR_OPP(board.turn))) {
      return true;
    }
  } else if (recog === MAT_KBKB) {
    // KBKB
    const wb = board.piece[White * 32 + 1];
    const bb = board.piece[Black * 32 + 1];
    if (SQUARE_COLOUR(wb) === SQUARE_COLOUR(bb)) { // bishops on same colour
      return true;
    }
  } else if (recog === MAT_KBPK) {
    // KBPK (white)
    const me = White;
    const opp = COLOUR_OPP(me);
    let wp = board.pawn[me * 16];
    let wb = board.piece[me * 32 + 1];
    let bk = KING_POS(board, opp);
    if (SQUARE_FILE(wp) >= FileE) {
      wp = SQUARE_FILE_MIRROR(wp);
      wb = SQUARE_FILE_MIRROR(wb);
      bk = SQUARE_FILE_MIRROR(bk);
    }
    if (kbpk_draw(wp, wb, bk)) return true;
  } else if (recog === MAT_KKBP) {
    // KBPK (black)
    const me = Black;
    const opp = COLOUR_OPP(me);
    let wp = SQUARE_RANK_MIRROR(board.pawn[me * 16]);
    let wb = SQUARE_RANK_MIRROR(board.piece[me * 32 + 1]);
    let bk = SQUARE_RANK_MIRROR(KING_POS(board, opp));
    if (SQUARE_FILE(wp) >= FileE) {
      wp = SQUARE_FILE_MIRROR(wp);
      wb = SQUARE_FILE_MIRROR(wb);
      bk = SQUARE_FILE_MIRROR(bk);
    }
    if (kbpk_draw(wp, wb, bk)) return true;
  }
  return false;
}

// kpk_draw()
function kpk_draw(wp: number, wk: number, bk: number, turn: number): boolean {
  const wp_file = SQUARE_FILE(wp);
  let wp_rank = SQUARE_RANK(wp);
  const wk_file = SQUARE_FILE(wk);
  const bk_file = SQUARE_FILE(bk);
  const bk_rank = SQUARE_RANK(bk);
  if (bk === wp + 16) {
    if (wp_rank <= Rank6) {
      return true;
    } else {
      if (COLOUR_IS_WHITE(turn)) {
        if (wk === wp - 15 || wk === wp - 17) return true;
      } else {
        if (wk !== wp - 15 && wk !== wp - 17) return true;
      }
    }
  } else if (bk === wp + 32) {
    if (wp_rank <= Rank5) {
      return true;
    } else {
      if (COLOUR_IS_WHITE(turn)) {
        if (wk !== wp - 1 && wk !== wp + 1) return true;
      } else {
        return true;
      }
    }
  } else if (wk === wp - 1 || wk === wp + 1) {
    if (bk === wk + 32 && COLOUR_IS_WHITE(turn)) { // opposition
      return true;
    }
  } else if (wk === wp + 15 || wk === wp + 16 || wk === wp + 17) {
    if (wp_rank <= Rank4) {
      if (bk === wk + 32 && COLOUR_IS_WHITE(turn)) { // opposition
        return true;
      }
    }
  }
  // rook pawn
  if (wp_file === FileA) {
    if (DISTANCE(bk, A8) <= 1) return true;
    if (wk_file === FileA) {
      if (wp_rank === Rank2) wp_rank++; // HACK
      if (bk_file === FileC && bk_rank > wp_rank) return true;
    }
  }
  return false;
}

// kbpk_draw()
function kbpk_draw(wp: number, wb: number, bk: number): boolean {
  if (SQUARE_FILE(wp) === FileA
    && DISTANCE(bk, A8) <= 1
    && SQUARE_COLOUR(wb) !== SQUARE_COLOUR(A8)) {
    return true;
  }
  return false;
}
