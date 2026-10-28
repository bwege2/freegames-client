// Port of src/engine/sort.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { attack_t, ATTACK_IN_CHECK } from './attack.ts';
import { board_t, Empty } from './board.ts';
import { list_copy, list_sort, list_t } from './list.ts';
import { MoveEnPassant, MoveFlags, MoveNone, MovePromote, move_is_tactical, move_is_under_promote, move_promote, MOVE_FROM, MOVE_TO } from './move.ts';
import { gen_quiet_checks } from './move_check.ts';
import { gen_legal_evasions, gen_pseudo_evasions } from './move_evasion.ts';
import { gen_captures, gen_quiet_moves } from './move_gen.ts';
import { move_is_pseudo, pseudo_is_legal, quiet_is_pseudo } from './move_legal.ts';
import { PieceOrder, PieceTo12 } from './piece.ts';
import { see_move } from './see.ts';
import { SquareTo64 } from './square.ts';
import { ValuePiece } from './value.ts';

// constants
const KillerNb = 2;

const HeightMax = 256; // search.h

const HistorySize = 12 * 64;
const HistoryMax = 16384;

const TransScore = +32766;
const GoodScore = +4000;
const KillerScore = +4;
const HistoryScore = -24000;
const BadScore = -28000;

const CODE_SIZE = 256;

// macros
const HISTORY_INC = (depth: number): number => depth * depth;

// types
const GEN_ERROR = 0;
const GEN_LEGAL_EVASION = 1;
const GEN_TRANS = 2;
const GEN_GOOD_CAPTURE = 3;
const GEN_BAD_CAPTURE = 4;
const GEN_KILLER = 5;
const GEN_QUIET = 6;
const GEN_EVASION_QS = 7;
const GEN_CAPTURE_QS = 8;
const GEN_CHECK_QS = 9;
const GEN_END = 10;

const TEST_ERROR = 0;
const TEST_NONE = 1;
const TEST_LEGAL = 2;
const TEST_TRANS_KILLER = 3;
const TEST_GOOD_CAPTURE = 4;
const TEST_BAD_CAPTURE = 5;
const TEST_KILLER = 6;
const TEST_QUIET = 7;
const TEST_CAPTURE_QS = 8;
const TEST_CHECK_QS = 9;

export class sort_t {
  depth = 0;
  height = 0;
  trans_killer = 0;
  killer_1 = 0;
  killer_2 = 0;
  gen = 0;
  test = TEST_ERROR;
  pos = 0;
  value = 0;
  board!: board_t;
  attack!: attack_t;
  list = new list_t();
  bad = new list_t();
}

// variables
let PosLegalEvasion = 0;
let PosSEE = 0;

let PosEvasionQS = 0;
let PosCheckQS = 0;
let PosCaptureQS = 0;

const Code = new Int32Array(CODE_SIZE);

const Killer = new Uint16Array(HeightMax * KillerNb); // Killer[height][i] at height*2+i

const History = new Uint16Array(HistorySize);
const HistHit = new Uint16Array(HistorySize);
const HistTot = new Uint16Array(HistorySize);

// functions

// sort_init()
export function sort_init(): void {
  // killer
  Killer.fill(MoveNone);
  // history
  for (let i = 0; i < HistorySize; i++) History[i] = 0;
  for (let i = 0; i < HistorySize; i++) {
    HistHit[i] = 1;
    HistTot[i] = 1;
  }
  // Code[]
  for (let pos = 0; pos < CODE_SIZE; pos++) Code[pos] = GEN_ERROR;
  let pos = 0;
  // main search
  PosLegalEvasion = pos;
  Code[pos++] = GEN_LEGAL_EVASION;
  Code[pos++] = GEN_END;
  PosSEE = pos;
  Code[pos++] = GEN_TRANS;
  Code[pos++] = GEN_GOOD_CAPTURE;
  Code[pos++] = GEN_KILLER;
  Code[pos++] = GEN_QUIET;
  Code[pos++] = GEN_BAD_CAPTURE;
  Code[pos++] = GEN_END;
  // quiescence search
  PosEvasionQS = pos;
  Code[pos++] = GEN_EVASION_QS;
  Code[pos++] = GEN_END;
  PosCheckQS = pos;
  Code[pos++] = GEN_CAPTURE_QS;
  Code[pos++] = GEN_CHECK_QS;
  Code[pos++] = GEN_END;
  PosCaptureQS = pos;
  Code[pos++] = GEN_CAPTURE_QS;
  Code[pos++] = GEN_END;
}

// sort_init() (the overload for a node)
export function sort_init_node(sort: sort_t, board: board_t, attack: attack_t, depth: number, height: number, trans_killer: number): void {
  sort.board = board;
  sort.attack = attack;
  sort.depth = depth;
  sort.height = height;
  sort.trans_killer = trans_killer;
  sort.killer_1 = Killer[sort.height * 2];
  sort.killer_2 = Killer[sort.height * 2 + 1];
  if (ATTACK_IN_CHECK(sort.attack)) {
    gen_legal_evasions(sort.list, sort.board, sort.attack);
    note_moves(sort.list, sort.board, sort.height, sort.trans_killer);
    list_sort(sort.list);
    sort.gen = PosLegalEvasion + 1;
    sort.test = TEST_NONE;
  } else { // not in check
    sort.list.size = 0;
    sort.gen = PosSEE;
  }
  sort.pos = 0;
}

// sort_next()
export function sort_next(sort: sort_t): number {
  const list = sort.list;
  while (true) {
    while (sort.pos < list.size) {
      // next move
      const move = list.move[sort.pos];
      sort.value = 16384; // default score
      sort.pos++;
      // test
      const test = sort.test;
      if (test === TEST_NONE) {
        // no-op
      } else if (test === TEST_TRANS_KILLER) {
        if (!move_is_pseudo(move, sort.board)) continue;
        if (!pseudo_is_legal(move, sort.board)) continue;
      } else if (test === TEST_GOOD_CAPTURE) {
        if (move === sort.trans_killer) continue;
        if (!capture_is_good(move, sort.board)) {
          sort.bad.move[sort.bad.size++] = move;
          continue;
        }
        if (!pseudo_is_legal(move, sort.board)) continue;
      } else if (test === TEST_BAD_CAPTURE) {
        if (!pseudo_is_legal(move, sort.board)) continue;
      } else if (test === TEST_KILLER) {
        if (move === sort.trans_killer) continue;
        if (!quiet_is_pseudo(move, sort.board)) continue;
        if (!pseudo_is_legal(move, sort.board)) continue;
      } else if (test === TEST_QUIET) {
        if (move === sort.trans_killer) continue;
        if (move === sort.killer_1) continue;
        if (move === sort.killer_2) continue;
        if (!pseudo_is_legal(move, sort.board)) continue;
        sort.value = history_prob(move, sort.board);
      } else {
        return MoveNone;
      }
      return move;
    }
    // next stage
    const gen = Code[sort.gen++];
    if (gen === GEN_TRANS) {
      list.size = 0;
      if (sort.trans_killer !== MoveNone) list.move[list.size++] = sort.trans_killer;
      sort.test = TEST_TRANS_KILLER;
    } else if (gen === GEN_GOOD_CAPTURE) {
      gen_captures(list, sort.board);
      note_mvv_lva(list, sort.board);
      list_sort(list);
      sort.bad.size = 0;
      sort.test = TEST_GOOD_CAPTURE;
    } else if (gen === GEN_BAD_CAPTURE) {
      list_copy(list, sort.bad);
      sort.test = TEST_BAD_CAPTURE;
    } else if (gen === GEN_KILLER) {
      list.size = 0;
      if (sort.killer_1 !== MoveNone) list.move[list.size++] = sort.killer_1;
      if (sort.killer_2 !== MoveNone) list.move[list.size++] = sort.killer_2;
      sort.test = TEST_KILLER;
    } else if (gen === GEN_QUIET) {
      gen_quiet_moves(list, sort.board);
      note_quiet_moves(list, sort.board);
      list_sort(list);
      sort.test = TEST_QUIET;
    } else {
      return MoveNone;
    }
    sort.pos = 0;
  }
}

// sort_init_qs()
export function sort_init_qs(sort: sort_t, board: board_t, attack: attack_t, check: boolean): void {
  sort.board = board;
  sort.attack = attack;
  if (ATTACK_IN_CHECK(sort.attack)) {
    sort.gen = PosEvasionQS;
  } else if (check) {
    sort.gen = PosCheckQS;
  } else {
    sort.gen = PosCaptureQS;
  }
  sort.list.size = 0;
  sort.pos = 0;
}

// sort_next_qs()
export function sort_next_qs(sort: sort_t): number {
  const list = sort.list;
  while (true) {
    while (sort.pos < list.size) {
      // next move
      const move = list.move[sort.pos];
      sort.pos++;
      // test
      const test = sort.test;
      if (test === TEST_LEGAL) {
        if (!pseudo_is_legal(move, sort.board)) continue;
      } else if (test === TEST_CAPTURE_QS) {
        if (!capture_is_good(move, sort.board)) continue;
        if (!pseudo_is_legal(move, sort.board)) continue;
      } else if (test === TEST_CHECK_QS) {
        if (see_move(move, sort.board) < 0) continue;
        if (!pseudo_is_legal(move, sort.board)) continue;
      } else {
        return MoveNone;
      }
      return move;
    }
    // next stage
    const gen = Code[sort.gen++];
    if (gen === GEN_EVASION_QS) {
      gen_pseudo_evasions(list, sort.board, sort.attack);
      note_moves_simple(list, sort.board);
      list_sort(list);
      sort.test = TEST_LEGAL;
    } else if (gen === GEN_CAPTURE_QS) {
      gen_captures(list, sort.board);
      note_mvv_lva(list, sort.board);
      list_sort(list);
      sort.test = TEST_CAPTURE_QS;
    } else if (gen === GEN_CHECK_QS) {
      gen_quiet_checks(list, sort.board);
      sort.test = TEST_CHECK_QS;
    } else {
      return MoveNone;
    }
    sort.pos = 0;
  }
}

// good_move()
export function good_move(move: number, board: board_t, depth: number, height: number): void {
  if (move_is_tactical(move, board)) return;
  // killer
  if (Killer[height * 2] !== move) {
    Killer[height * 2 + 1] = Killer[height * 2];
    Killer[height * 2] = move;
  }
  // history
  const index = history_index(move, board);
  History[index] += HISTORY_INC(depth);
  if (History[index] >= HistoryMax) {
    for (let i = 0; i < HistorySize; i++) {
      History[i] = (History[i] + 1) >> 1;
    }
  }
}

// history_good()
export function history_good(move: number, board: board_t): void {
  if (move_is_tactical(move, board)) return;
  // history
  const index = history_index(move, board);
  HistHit[index]++;
  HistTot[index]++;
  if (HistTot[index] >= HistoryMax) {
    HistHit[index] = (HistHit[index] + 1) >> 1;
    HistTot[index] = (HistTot[index] + 1) >> 1;
  }
}

// history_bad()
export function history_bad(move: number, board: board_t): void {
  if (move_is_tactical(move, board)) return;
  // history
  const index = history_index(move, board);
  HistTot[index]++;
  if (HistTot[index] >= HistoryMax) {
    HistHit[index] = (HistHit[index] + 1) >> 1;
    HistTot[index] = (HistTot[index] + 1) >> 1;
  }
}

// note_moves()
export function note_moves(list: list_t, board: board_t, height: number, trans_killer: number): void {
  const size = list.size;
  if (size >= 2) {
    for (let i = 0; i < size; i++) {
      const move = list.move[i];
      list.value[i] = move_value(move, board, height, trans_killer);
    }
  }
}

// note_quiet_moves()
function note_quiet_moves(list: list_t, board: board_t): void {
  const size = list.size;
  if (size >= 2) {
    for (let i = 0; i < size; i++) {
      const move = list.move[i];
      list.value[i] = quiet_move_value(move, board);
    }
  }
}

// note_moves_simple()
function note_moves_simple(list: list_t, board: board_t): void {
  const size = list.size;
  if (size >= 2) {
    for (let i = 0; i < size; i++) {
      const move = list.move[i];
      list.value[i] = move_value_simple(move, board);
    }
  }
}

// note_mvv_lva()
function note_mvv_lva(list: list_t, board: board_t): void {
  const size = list.size;
  if (size >= 2) {
    for (let i = 0; i < size; i++) {
      const move = list.move[i];
      list.value[i] = mvv_lva(move, board);
    }
  }
}

// move_value()
function move_value(move: number, board: board_t, height: number, trans_killer: number): number {
  let value: number;
  if (move === trans_killer) { // transposition table killer
    value = TransScore;
  } else if (move_is_tactical(move, board)) { // capture or promote
    value = capture_value(move, board);
  } else if (move === Killer[height * 2]) { // killer 1
    value = KillerScore;
  } else if (move === Killer[height * 2 + 1]) { // killer 2
    value = KillerScore - 1;
  } else { // quiet move
    value = quiet_move_value(move, board);
  }
  return value;
}

// capture_value()
function capture_value(move: number, board: board_t): number {
  let value = mvv_lva(move, board);
  if (capture_is_good(move, board)) {
    value += GoodScore;
  } else {
    value += BadScore;
  }
  return value;
}

// quiet_move_value()
function quiet_move_value(move: number, board: board_t): number {
  const index = history_index(move, board);
  return HistoryScore + History[index];
}

// move_value_simple()
function move_value_simple(move: number, board: board_t): number {
  let value = HistoryScore;
  if (move_is_tactical(move, board)) value = mvv_lva(move, board);
  return value;
}

// history_prob()
function history_prob(move: number, board: board_t): number {
  const index = history_index(move, board);
  return ((HistHit[index] * 16384) / HistTot[index]) | 0;
}

// capture_is_good()
function capture_is_good(move: number, board: board_t): boolean {
  // special cases
  if ((move & MoveFlags) === MoveEnPassant) return true;
  if (move_is_under_promote(move)) return false; // REMOVE ME?
  // captures and queen promotes
  const capture = board.square[MOVE_TO(move)];
  if (capture !== Empty) {
    // capture
    if ((move & MoveFlags) === MovePromote) return true; // promote-capture
    const piece = board.square[MOVE_FROM(move)];
    if (ValuePiece[capture] >= ValuePiece[piece]) return true;
  }
  return see_move(move, board) >= 0;
}

// mvv_lva()
function mvv_lva(move: number, board: board_t): number {
  let value: number;
  let capture: number;
  if ((move & MoveFlags) === MoveEnPassant) { // en-passant capture
    value = 5; // PxP
  } else if ((capture = board.square[MOVE_TO(move)]) !== Empty) { // normal capture
    const piece = board.square[MOVE_FROM(move)];
    value = PieceOrder[capture] * 6 - PieceOrder[piece] + 5;
  } else { // promote
    const promote = move_promote(move);
    value = PieceOrder[promote] - 5;
  }
  return value;
}

// history_index()
function history_index(move: number, board: board_t): number {
  return PieceTo12[board.square[MOVE_FROM(move)]] * 64 + SquareTo64[MOVE_TO(move)];
}

