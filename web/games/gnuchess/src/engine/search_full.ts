// Port of src/engine/search_full.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// The local variables of the recursive functions that are arrays or structs (attack_t, sort_t, undo_t,
// new_pv[], played[]) live in a stack of frames that grows on demand and is reused between nodes; a
// search abort (search_check()'s longjmp) leaves frames pushed, and search_full_root() resets the stack.

import { attack_set, attack_t, ATTACK_IN_CHECK, is_attacked } from './attack.ts';
import { board_is_check, board_is_mate, board_is_repetition, board_t, Empty } from './board.ts';
import { COLOUR_FLAG, COLOUR_OPP } from './colour.ts';
import { evaluate } from './eval.ts';
import { list_note, list_sort, list_t } from './list.ts';
import { MoveEnPassant, MoveFlags, MoveNone, MoveNull, MovePromote, move_capture, move_is_tactical, MOVE_FROM, MOVE_TO } from './move.ts';
import { move_is_check } from './move_check.ts';
import { move_do, move_do_null, move_undo, move_undo_null, undo_t } from './move_do.ts';
import { option_get_bool, option_get_int, option_get_string } from './option.ts';
import { KingInc, PIECE_IS_PAWN, PIECE_IS_QUEEN } from './piece.ts';
import { pv_cat, pv_copy, PV_CLEAR } from './pv.ts';
import { recog_draw } from './recog.ts';
import {
  HeightMax, SearchBest, SearchCurrent, SearchExact, SearchInfo, SearchLower, SearchNormal, SearchRoot, SearchShort,
  SearchUpper, search_check, search_update_best, search_update_root,
} from './search.ts';
import { see_move } from './see.ts';
import { good_move, history_bad, history_good, note_moves, sort_init_node, sort_init_qs, sort_next, sort_next_qs, sort_t } from './sort.ts';
import { A1, A8, H1, H8, PAWN_RANK, Rank2, Rank7 } from './square.ts';
import { Trans, TransOut, trans_retrieve, trans_store } from './trans.ts';
import { my_string_equal } from './util.ts';
import {
  ValueDraw, ValueEvalInf, ValueInf, ValueNone, ValuePawn, ValuePiece, ValueQueen, VALUE_MATE, value_from_trans,
  value_is_mate, value_to_trans,
} from './value.ts';
import { IncNone } from './vector.ts';

// constants and variables

// main search
const UseDistancePruning = true;

// transposition table
export let UseTrans = true;
export function set_use_trans(on: boolean): void {
  UseTrans = on;
}
const TransDepth = 1;

const UseMateValues = true; // use mate values from shallower searches?

// null move
let UseNull = true;
let UseNullEval = true; // true
const NullDepth = 2;
let NullReduction = 3;

let UseVer = true;
let UseVerEndgame = true; // true
let VerReduction = 5; // was 3

// move ordering
const UseIID = true;
const IIDDepth = 3;
const IIDReduction = 2;

// extensions
const ExtendSingleReply = true; // true

// history pruning
let UseHistory = true;
const HistoryDepth = 3;
const HistoryMoveNb = 3;
let HistoryValue = 9830; // 60%
const HistoryReSearch = true;

// futility pruning
let UseFutility = false; // false
let FutilityMargin = 100;

// quiescence search
let UseDelta = false; // false
let DeltaMargin = 50;

let CheckNb = 1;
let CheckDepth = 0; // 1 - CheckNb

// misc
const NodeAll = -1;
const NodePV = 0;
const NodeCut = +1;

// macros
const NODE_OPP = (type: number): number => -type;
const DEPTH_MATCH = (d1: number, d2: number): boolean => d1 >= d2;

// the frames of the recursion
class frame_t {
  attack = new attack_t();
  sort = new sort_t();
  undo = new undo_t();
  new_pv = new Uint16Array(HeightMax);
  played = new Uint16Array(256);
}
const Frames: frame_t[] = [];
let FrameSp = 0;
function frame_push(): frame_t {
  let frame = Frames[FrameSp];
  if (frame === undefined) {
    frame = new frame_t();
    Frames[FrameSp] = frame;
  }
  FrameSp++;
  return frame;
}

/** reset by main_engine() so that a new engine starts with the original's static initialisers */
export function search_full_reset(): void {
  UseTrans = true;
  UseNull = true;
  UseNullEval = true;
  NullReduction = 3;
  UseVer = true;
  UseVerEndgame = true;
  VerReduction = 5;
  UseHistory = true;
  HistoryValue = 9830;
  UseFutility = false;
  FutilityMargin = 100;
  UseDelta = false;
  DeltaMargin = 50;
  CheckNb = 1;
  CheckDepth = 0;
  FrameSp = 0;
}

// functions

// search_full_init()
export function search_full_init(list: list_t, board: board_t): void {
  // null-move options
  let string = option_get_string('NullMove Pruning');
  if (my_string_equal(string, 'Always')) {
    UseNull = true;
    UseNullEval = false;
  } else if (my_string_equal(string, 'Fail High')) {
    UseNull = true;
    UseNullEval = true;
  } else if (my_string_equal(string, 'Never')) {
    UseNull = false;
    UseNullEval = false;
  } else {
    UseNull = true;
    UseNullEval = true;
  }
  NullReduction = option_get_int('NullMove Reduction');
  string = option_get_string('Verification Search');
  if (my_string_equal(string, 'Always')) {
    UseVer = true;
    UseVerEndgame = false;
  } else if (my_string_equal(string, 'Endgame')) {
    UseVer = true;
    UseVerEndgame = true;
  } else if (my_string_equal(string, 'Never')) {
    UseVer = false;
    UseVerEndgame = false;
  } else {
    UseVer = true;
    UseVerEndgame = true;
  }
  VerReduction = option_get_int('Verification Reduction');
  // history-pruning options
  UseHistory = option_get_bool('History Pruning');
  HistoryValue = ((option_get_int('History Threshold') * 16384 + 50) / 100) | 0;
  // futility-pruning options
  UseFutility = option_get_bool('Futility Pruning');
  FutilityMargin = option_get_int('Futility Margin');
  // delta-pruning options
  UseDelta = option_get_bool('Delta Pruning');
  DeltaMargin = option_get_int('Delta Margin');
  // quiescence-search options
  CheckNb = option_get_int('Quiescence Check Plies');
  CheckDepth = 1 - CheckNb;
  // standard sort
  list_note(list);
  list_sort(list);
  // basic sort
  let trans_move = MoveNone;
  if (UseTrans) {
    if (trans_retrieve(Trans, board.key_hi, board.key_lo)) trans_move = TransOut.move;
  }
  note_moves(list, board, 0, trans_move);
  list_sort(list);
}

// search_full_root()
export function search_full_root(list: list_t, board: board_t, depth: number, search_type: number): number {
  FrameSp = 0;
  return full_root(list, board, -ValueInf, +ValueInf, depth, 0, search_type);
}

// full_root()
function full_root(list: list_t, board: board_t, alpha: number, beta: number, depth: number, height: number, search_type: number): number {
  const frame = frame_push();
  const undo = frame.undo;
  const new_pv = frame.new_pv;
  // init
  SearchCurrent.node_nb++;
  SearchInfo.check_nb--;
  for (let i = 0; i < list.size; i++) list.value[i] = ValueNone;
  const old_alpha = alpha;
  let best_value = ValueNone;
  // move loop
  for (let i = 0; i < list.size; i++) {
    const move = list.move[i];
    SearchRoot.depth = depth;
    SearchRoot.move = move;
    SearchRoot.move_pos = i;
    SearchRoot.move_nb = list.size;
    search_update_root();
    const new_depth = full_new_depth(depth, move, board, board_is_check(board) && list.size === 1, true);
    move_do(board, move, undo);
    let value: number;
    if (search_type === SearchShort || best_value === ValueNone) { // first move
      value = -full_search(board, -beta, -alpha, new_depth, height + 1, new_pv, NodePV);
    } else { // other moves
      value = -full_search(board, -alpha - 1, -alpha, new_depth, height + 1, new_pv, NodeCut);
      if (value > alpha) { // && value < beta
        SearchRoot.change = true;
        SearchRoot.easy = false;
        SearchRoot.flag = false;
        search_update_root();
        value = -full_search(board, -beta, -alpha, new_depth, height + 1, new_pv, NodePV);
      }
    }
    move_undo(board, move, undo);
    if (value <= alpha) { // upper bound
      list.value[i] = old_alpha;
    } else if (value >= beta) { // lower bound
      list.value[i] = beta;
    } else { // alpha < value < beta => exact value
      list.value[i] = value;
    }
    if (value > best_value && (best_value === ValueNone || value > alpha)) {
      SearchBest.move = move;
      SearchBest.value = value;
      if (value <= alpha) { // upper bound
        SearchBest.flags = SearchUpper;
      } else if (value >= beta) { // lower bound
        SearchBest.flags = SearchLower;
      } else { // alpha < value < beta => exact value
        SearchBest.flags = SearchExact;
      }
      SearchBest.depth = depth;
      pv_cat(SearchBest.pv, new_pv, move);
      search_update_best();
    }
    if (value > best_value) {
      best_value = value;
      if (value > alpha) {
        if (search_type === SearchNormal) alpha = value;
        if (value >= beta) break;
      }
    }
  }
  list_sort(list);
  if (UseTrans && best_value > old_alpha && best_value < beta) {
    pv_fill(SearchBest.pv, 0, board);
  }
  FrameSp--;
  return best_value;
}

// full_search()
function full_search(board: board_t, alpha: number, beta: number, depth: number, height: number, pv: Uint16Array, node_type: number): number {
  // horizon?
  if (depth <= 0) return full_quiescence(board, alpha, beta, 0, height, pv);
  const frame = frame_push();
  const value = full_search_frame(frame, board, alpha, beta, depth, height, pv, node_type);
  FrameSp--;
  return value;
}

function full_search_frame(frame: frame_t, board: board_t, alpha: number, beta: number, depth: number, height: number, pv: Uint16Array, node_type: number): number {
  const attack = frame.attack;
  const sort = frame.sort;
  const undo = frame.undo;
  const new_pv = frame.new_pv;
  const played = frame.played;
  let value: number;
  // init
  SearchCurrent.node_nb++;
  SearchInfo.check_nb--;
  PV_CLEAR(pv);
  if (height > SearchCurrent.max_depth) SearchCurrent.max_depth = height;
  if (SearchInfo.check_nb <= 0) {
    SearchInfo.check_nb += SearchInfo.check_inc;
    search_check();
  }
  // draw?
  if (board_is_repetition(board) || recog_draw(board)) return ValueDraw;
  // mate-distance pruning
  if (UseDistancePruning) {
    // lower bound
    value = VALUE_MATE(height + 2); // does not work if the current position is mate
    if (value > alpha && board_is_mate(board)) value = VALUE_MATE(height);
    if (value > alpha) {
      alpha = value;
      if (value >= beta) return value;
    }
    // upper bound
    value = -VALUE_MATE(height + 1);
    if (value < beta) {
      beta = value;
      if (value <= alpha) return value;
    }
  }
  // transposition table
  let trans_move = MoveNone;
  if (UseTrans && depth >= TransDepth) {
    if (trans_retrieve(Trans, board.key_hi, board.key_lo)) {
      // trans_move is now updated
      trans_move = TransOut.move;
      let trans_min_depth = TransOut.min_depth;
      let trans_max_depth = TransOut.max_depth;
      const trans_min_value = TransOut.min_value;
      const trans_max_value = TransOut.max_value;
      if (node_type !== NodePV) {
        if (UseMateValues) {
          if (trans_min_value > +ValueEvalInf && trans_min_depth < depth) {
            trans_min_depth = depth;
          }
          if (trans_max_value < -ValueEvalInf && trans_max_depth < depth) {
            trans_max_depth = depth;
          }
        }
        let min_value = -ValueInf;
        if (DEPTH_MATCH(trans_min_depth, depth)) {
          min_value = value_from_trans(trans_min_value, height);
          if (min_value >= beta) return min_value;
        }
        let max_value = +ValueInf;
        if (DEPTH_MATCH(trans_max_depth, depth)) {
          max_value = value_from_trans(trans_max_value, height);
          if (max_value <= alpha) return max_value;
        }
        if (min_value === max_value) return min_value; // exact match
      }
    }
  }
  // height limit
  if (height >= HeightMax - 1) return evaluate(board);
  // more init
  const old_alpha = alpha;
  let best_value = ValueNone;
  let best_move = MoveNone;
  let played_nb = 0;
  attack_set(attack, board);
  const in_check = ATTACK_IN_CHECK(attack);
  cut: {
    // null-move pruning
    if (UseNull && depth >= NullDepth && node_type !== NodePV) {
      if (!in_check
        && !value_is_mate(beta)
        && do_null(board)
        && (!UseNullEval || depth <= NullReduction + 1 || evaluate(board) >= beta)) {
        // null-move search
        let new_depth = depth - NullReduction - 1;
        move_do_null(board, undo);
        value = -full_search(board, -beta, -beta + 1, new_depth, height + 1, new_pv, NODE_OPP(node_type));
        move_undo_null(board, undo);
        // verification search
        if (UseVer && depth > VerReduction) {
          if (value >= beta && (!UseVerEndgame || do_ver(board))) {
            new_depth = depth - VerReduction;
            value = full_no_null(board, alpha, beta, new_depth, height, new_pv, NodeCut, trans_move);
            const move = NoNullBestMove;
            if (value >= beta) {
              played[played_nb++] = move;
              best_move = move;
              best_value = value;
              pv_copy(pv, new_pv);
              break cut;
            }
          }
        }
        // pruning
        if (value >= beta) {
          if (value > +ValueEvalInf) value = +ValueEvalInf; // do not return unproven mates
          // pv_cat(pv,new_pv,MoveNull);
          best_move = MoveNone;
          best_value = value;
          break cut;
        }
      }
    }
    // Internal Iterative Deepening
    if (UseIID && depth >= IIDDepth && node_type === NodePV && trans_move === MoveNone) {
      const new_depth = depth - IIDReduction;
      value = full_search(board, alpha, beta, new_depth, height, new_pv, node_type);
      if (value <= alpha) value = full_search(board, -ValueInf, beta, new_depth, height, new_pv, node_type);
      trans_move = new_pv[0];
    }
    // move generation
    sort_init_node(sort, board, attack, depth, height, trans_move);
    let single_reply = false;
    if (in_check && sort.list.size === 1) single_reply = true; // HACK
    // move loop
    let opt_value = +ValueInf;
    let move: number;
    while ((move = sort_next(sort)) !== MoveNone) {
      // extensions
      let new_depth = full_new_depth(depth, move, board, single_reply, node_type === NodePV);
      // history pruning
      let reduced = false;
      if (UseHistory && depth >= HistoryDepth && node_type !== NodePV) {
        if (!in_check && played_nb >= HistoryMoveNb && new_depth < depth) {
          value = sort.value; // history score
          if (value < HistoryValue) {
            new_depth--;
            reduced = true;
          }
        }
      }
      // futility pruning
      if (UseFutility && depth === 1 && node_type !== NodePV) {
        if (!in_check && new_depth === 0 && !move_is_tactical(move, board) && !move_is_dangerous(move, board)) {
          // optimistic evaluation
          if (opt_value === +ValueInf) {
            opt_value = evaluate(board) + FutilityMargin;
          }
          value = opt_value;
          // pruning
          if (value <= alpha) {
            if (value > best_value) {
              best_value = value;
              PV_CLEAR(pv);
            }
            continue;
          }
        }
      }
      // recursive search
      move_do(board, move, undo);
      if (node_type !== NodePV || best_value === ValueNone) { // first move
        value = -full_search(board, -beta, -alpha, new_depth, height + 1, new_pv, NODE_OPP(node_type));
      } else { // other moves
        value = -full_search(board, -alpha - 1, -alpha, new_depth, height + 1, new_pv, NodeCut);
        if (value > alpha) { // && value < beta
          value = -full_search(board, -beta, -alpha, new_depth, height + 1, new_pv, NodePV);
        }
      }
      // history-pruning re-search
      if (HistoryReSearch && reduced && value >= beta) {
        new_depth++;
        value = -full_search(board, -beta, -alpha, new_depth, height + 1, new_pv, NODE_OPP(node_type));
      }
      move_undo(board, move, undo);
      played[played_nb++] = move;
      if (value > best_value) {
        best_value = value;
        pv_cat(pv, new_pv, move);
        if (value > alpha) {
          alpha = value;
          best_move = move;
          if (value >= beta) break cut;
        }
      }
      if (node_type === NodeCut) node_type = NodeAll;
    }
    // ALL node
    if (best_value === ValueNone) { // no legal move
      if (in_check) {
        return VALUE_MATE(height);
      } else {
        return ValueDraw;
      }
    }
  }
  // cut:
  // move ordering
  if (best_move !== MoveNone) {
    good_move(best_move, board, depth, height);
    if (best_value >= beta && !move_is_tactical(best_move, board)) {
      for (let i = 0; i < played_nb - 1; i++) {
        const move = played[i];
        history_bad(move, board);
      }
      history_good(best_move, board);
    }
  }
  // transposition table
  if (UseTrans && depth >= TransDepth) {
    const trans_move = best_move;
    const trans_depth = depth;
    const trans_min_value = (best_value > old_alpha) ? value_to_trans(best_value, height) : -ValueInf;
    const trans_max_value = (best_value < beta) ? value_to_trans(best_value, height) : +ValueInf;
    trans_store(Trans, board.key_hi, board.key_lo, trans_move, trans_depth, trans_min_value, trans_max_value);
  }
  return best_value;
}

/** full_no_null()'s *best_move */
let NoNullBestMove = MoveNone;

// full_no_null()
function full_no_null(board: board_t, alpha: number, beta: number, depth: number, height: number, pv: Uint16Array, node_type: number, trans_move: number): number {
  const frame = frame_push();
  const attack = frame.attack;
  const sort = frame.sort;
  const undo = frame.undo;
  const new_pv = frame.new_pv;
  // init
  SearchCurrent.node_nb++;
  SearchInfo.check_nb--;
  PV_CLEAR(pv);
  if (height > SearchCurrent.max_depth) SearchCurrent.max_depth = height;
  if (SearchInfo.check_nb <= 0) {
    SearchInfo.check_nb += SearchInfo.check_inc;
    search_check();
  }
  attack_set(attack, board);
  let best_move = MoveNone;
  let best_value = ValueNone;
  // move loop
  sort_init_node(sort, board, attack, depth, height, trans_move);
  let move: number;
  cut: {
    while ((move = sort_next(sort)) !== MoveNone) {
      const new_depth = full_new_depth(depth, move, board, false, false);
      move_do(board, move, undo);
      const value = -full_search(board, -beta, -alpha, new_depth, height + 1, new_pv, NODE_OPP(node_type));
      move_undo(board, move, undo);
      if (value > best_value) {
        best_value = value;
        pv_cat(pv, new_pv, move);
        if (value > alpha) {
          alpha = value;
          best_move = move;
          if (value >= beta) break cut;
        }
      }
    }
    // ALL node
    if (best_value === ValueNone) { // no legal move => stalemate
      best_value = ValueDraw;
    }
  }
  // cut:
  NoNullBestMove = best_move;
  FrameSp--;
  return best_value;
}

// full_quiescence()
function full_quiescence(board: board_t, alpha: number, beta: number, depth: number, height: number, pv: Uint16Array): number {
  const frame = frame_push();
  const value = full_quiescence_frame(frame, board, alpha, beta, depth, height, pv);
  FrameSp--;
  return value;
}

function full_quiescence_frame(frame: frame_t, board: board_t, alpha: number, beta: number, depth: number, height: number, pv: Uint16Array): number {
  const attack = frame.attack;
  const sort = frame.sort;
  const undo = frame.undo;
  const new_pv = frame.new_pv;
  let value: number;
  // init
  SearchCurrent.node_nb++;
  SearchInfo.check_nb--;
  PV_CLEAR(pv);
  if (height > SearchCurrent.max_depth) SearchCurrent.max_depth = height;
  if (SearchInfo.check_nb <= 0) {
    SearchInfo.check_nb += SearchInfo.check_inc;
    search_check();
  }
  // draw?
  if (board_is_repetition(board) || recog_draw(board)) return ValueDraw;
  // mate-distance pruning
  if (UseDistancePruning) {
    // lower bound
    value = VALUE_MATE(height + 2); // does not work if the current position is mate
    if (value > alpha && board_is_mate(board)) value = VALUE_MATE(height);
    if (value > alpha) {
      alpha = value;
      if (value >= beta) return value;
    }
    // upper bound
    value = -VALUE_MATE(height + 1);
    if (value < beta) {
      beta = value;
      if (value <= alpha) return value;
    }
  }
  // more init
  attack_set(attack, board);
  const in_check = ATTACK_IN_CHECK(attack);
  if (in_check) {
    depth++; // in-check extension
  }
  // height limit
  if (height >= HeightMax - 1) return evaluate(board);
  // more init
  const old_alpha = alpha;
  let best_value = ValueNone;
  /* if (UseDelta) */ let opt_value = +ValueInf;
  cut: {
    if (!in_check) {
      // lone-king stalemate?
      if (simple_stalemate(board)) return ValueDraw;
      // stand pat
      value = evaluate(board);
      best_value = value;
      if (value > alpha) {
        alpha = value;
        if (value >= beta) break cut;
      }
      if (UseDelta) {
        opt_value = value + DeltaMargin;
      }
    }
    // move loop
    sort_init_qs(sort, board, attack, depth >= CheckDepth);
    let move: number;
    while ((move = sort_next_qs(sort)) !== MoveNone) {
      // delta pruning
      if (UseDelta && beta === old_alpha + 1) {
        if (!in_check && !move_is_check(move, board) && !capture_is_dangerous(move, board)) {
          // optimistic evaluation
          value = opt_value;
          const to = MOVE_TO(move);
          const capture = board.square[to];
          if (capture !== Empty) {
            value += ValuePiece[capture];
          } else if ((move & MoveFlags) === MoveEnPassant) {
            value += ValuePawn;
          }
          if ((move & MoveFlags) === MovePromote) value += ValueQueen - ValuePawn;
          // pruning
          if (value <= alpha) {
            if (value > best_value) {
              best_value = value;
              PV_CLEAR(pv);
            }
            continue;
          }
        }
      }
      move_do(board, move, undo);
      value = -full_quiescence(board, -beta, -alpha, depth - 1, height + 1, new_pv);
      move_undo(board, move, undo);
      if (value > best_value) {
        best_value = value;
        pv_cat(pv, new_pv, move);
        if (value > alpha) {
          alpha = value;
          if (value >= beta) break cut;
        }
      }
    }
    // ALL node
    if (best_value === ValueNone) { // no legal move
      return VALUE_MATE(height);
    }
  }
  // cut:
  return best_value;
}

// full_new_depth()
function full_new_depth(depth: number, move: number, board: board_t, single_reply: boolean, in_pv: boolean): number {
  let new_depth = depth - 1;
  if ((single_reply && ExtendSingleReply)
    || (in_pv && MOVE_TO(move) === board.cap_sq // recapture
      && see_move(move, board) > 0)
    || (in_pv && PIECE_IS_PAWN(board.square[MOVE_FROM(move)])
      && PAWN_RANK(MOVE_TO(move), board.turn) === Rank7
      && see_move(move, board) >= 0)
    || move_is_check(move, board)) {
    new_depth++;
  }
  return new_depth;
}

// do_null()
function do_null(board: board_t): boolean {
  // use null move if the side-to-move has at least one piece
  return board.piece_size[board.turn] >= 2; // king + one piece
}

// do_ver()
function do_ver(board: board_t): boolean {
  // use verification if the side-to-move has at most one piece
  return board.piece_size[board.turn] <= 2; // king + one piece
}

// pv_fill(): pv+index is the rest of the PV
function pv_fill(pv: Uint16Array, index: number, board: board_t): void {
  const move = pv[index];
  if (move !== MoveNone && move !== MoveNull) {
    const frame = frame_push();
    const undo = frame.undo;
    move_do(board, move, undo);
    pv_fill(pv, index + 1, board);
    move_undo(board, move, undo);
    const trans_move = move;
    const trans_depth = -127; // HACK
    const trans_min_value = -ValueInf;
    const trans_max_value = +ValueInf;
    trans_store(Trans, board.key_hi, board.key_lo, trans_move, trans_depth, trans_min_value, trans_max_value);
    FrameSp--;
  }
}

// move_is_dangerous()
function move_is_dangerous(move: number, board: board_t): boolean {
  const piece = board.square[MOVE_FROM(move)];
  if (PIECE_IS_PAWN(piece)
    && PAWN_RANK(MOVE_TO(move), board.turn) >= Rank7) {
    return true;
  }
  return false;
}

// capture_is_dangerous()
function capture_is_dangerous(move: number, board: board_t): boolean {
  const piece = board.square[MOVE_FROM(move)];
  if (PIECE_IS_PAWN(piece)
    && PAWN_RANK(MOVE_TO(move), board.turn) >= Rank7) {
    return true;
  }
  const capture = move_capture(move, board);
  if (PIECE_IS_QUEEN(capture)) return true;
  if (PIECE_IS_PAWN(capture)
    && PAWN_RANK(MOVE_TO(move), board.turn) <= Rank2) {
    return true;
  }
  return false;
}

// simple_stalemate()
function simple_stalemate(board: board_t): boolean {
  // lone king?
  const me = board.turn;
  if (board.piece_size[me] !== 1 || board.pawn_size[me] !== 0) return false; // no
  // king in a corner?
  const king = board.piece[me * 32];
  if (king !== A1 && king !== H1 && king !== A8 && king !== H8) return false; // no
  // init
  const opp = COLOUR_OPP(me);
  const opp_flag = COLOUR_FLAG(opp);
  // king can move?
  const from = king;
  let inc: number;
  for (let i = 0; (inc = KingInc[i]) !== IncNone; i++) {
    const to = from + inc;
    const capture = board.square[to];
    if (capture === Empty || (capture & opp_flag) !== 0) {
      if (!is_attacked(board, to, opp)) return false; // legal king move
    }
  }
  // no legal move
  return true;
}
