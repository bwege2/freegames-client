// Port of src/adapter/adapter.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// The xboard side of the adapter: the commands the frontend sends, the state machine (wait, think,
// ponder, analyse) and what it tells the engine. The functions that can wait for the engine (via
// stop_search() when SyncStop is set) are generators; main.ts runs them.

import { board_copy, board_t } from './board.ts';
import { book_disp, book_flush, book_learn_move, book_move, book_open, BookReadOnly, BookReadWrite, is_in_book } from './book.ts';
import { book_make } from './book_make.ts';
import { Black, colour_is_white, colour_opp, White } from './colour.ts';
import { Engine, engine_get, engine_send, engine_send_queue } from './engine.ts';
import { board_to_fen, StartFen } from './fen.ts';
import { BLACK_MATES, DRAW_FIFTY, DRAW_MATERIAL, DRAW_REPETITION, Game, game_add_move, game_clear, game_get_board, game_goto, game_init, game_move, game_move_nb, game_pos, game_rem_move, game_status, game_turn, PLAYING, STALEMATE, WHITE_MATES } from './game.ts';
import { io_get_line, io_init, io_send, io_t } from './io.ts';
import { line_to_san } from './line.ts';
import { move_is_castle, move_to_can, MoveNone } from './move.ts';
import { move_is_legal } from './move_legal.ts';
import { move_do } from './move_do.ts';
import { option_get_bool, option_get_double, option_get_int, option_get_string, option_set } from './option.ts';
import { match, Star } from './parse.ts';
import { move_from_san, move_to_san } from './san.ts';
import { EVENT_MOVE, EVENT_PV, EVENT_READY, Hash, Uci, uci_clear, uci_option_exist, uci_send_isready, uci_send_option, uci_send_stop, uci_send_stop_sync, uci_send_ucinewgame, uci_parse } from './uci.ts';
import { ExitSignal, H, my_fatal, my_log, my_string_equal, my_timer_elapsed_real, my_timer_reset, my_timer_start, my_timer_stop, my_timer_t } from './util.ts';
import { quit } from './main.ts';
import { atoi, sprintf, sscanf, type Arg } from '../libc.ts';

// constants

const DelayPong = false;

const StringSize = 4096;

// types

class xboard_t {
   io = new io_t();
}

class state_t {
   state = 0;
   computer: boolean[] = [false, false, false];
   exp_move = 0;
   resign_nb = 0;
   timer = new my_timer_t();
}

class xb_t {
   analyse = false;
   computer = false;
   name = '';
   ics = false;
   new_hack = false; // "new" is a C++ keyword
   ponder = false;
   ping = 0;
   post = false;
   proto_ver = 0;
   result = false;
   mps = 0;
   base = 0.0;
   inc = 0.0;
   time_limit = false;
   time_max = 0.0;
   depth_limit = false;
   depth_max = 0;
   my_time = 0.0;
   opp_time = 0.0;
}

const WAIT = 0, THINK = 1, PONDER = 2, ANALYSE = 3;

// variables

export let XBoard: xboard_t; // made by adapter_reset()
let State: state_t;
let XB: xb_t;

/** reset for a new process (main_adapter) */
export function adapter_reset(): void {
   XBoard = new xboard_t();
   State = new state_t();
   XB = new xb_t();
}

type Task = Generator<void, void, void>;

// functions

// adapter_loop(): its initialisation; main.ts runs adapter_step() as the loop

export function adapter_loop_init(): void {
   // init
   game_clear(Game[0]);
   // state
   State.state = WAIT;
   State.computer[White] = false;
   State.computer[Black] = true;
   State.exp_move = MoveNone;
   State.resign_nb = 0;
   my_timer_reset(State.timer);
   // xboard
   // XBoard->io->in_fd = pipefd_f2a[0] (filled by main.ts), XBoard->io->out_fd = pipefd_a2f[1]
   XBoard.io.out_fd = (data: string) => H.toFrontend(data);
   XBoard.io.name = 'XBOARD';
   io_init(XBoard.io);
   XB.analyse = false;
   XB.computer = false;
   XB.name = '<empty>';
   XB.ics = false;
   XB.new_hack = true;
   XB.ping = -1;
   XB.ponder = true;
   XB.post = false;
   XB.proto_ver = 1;
   XB.result = false;
   XB.mps = 0;
   XB.base = 300.0;
   XB.inc = 0.0;
   XB.time_limit = false;
   XB.time_max = 5.0;
   XB.depth_limit = false;
   XB.depth_max = 127;
   XB.my_time = 300.0;
   XB.opp_time = 300.0;
}

// xboard_step()

export function* xboard_step(): Task {
   let move: number;
   let move_string: string;
   const board = new board_t();
   const string = yield* xboard_get(XBoard);
   if (string === null) return;
   if (match(string, 'accepted *')) {
      // ignore
   } else if (match(string, 'analyze')) {
      State.computer[White] = false;
      State.computer[Black] = false;
      XB.analyse = true;
      XB.new_hack = false;
      XB.result = false;
      yield* mess();
   } else if (match(string, 'bk')) {
      if (option_get_bool('Book')) {
         game_get_board(Game[0], board);
         book_disp(board);
      }
   } else if (match(string, 'black')) {
      if (game_turn(Game[0]) === Black) {
         State.computer[White] = true;
         State.computer[Black] = false;
         XB.new_hack = true;
         XB.result = false;
         yield* mess();
      }
   } else if (match(string, 'computer')) {
      XB.computer = true;
   } else if (match(string, 'draw')) {
      // ignore
   } else if (match(string, 'easy')) {
      XB.ponder = false;
      yield* mess();
   } else if (match(string, 'edit')) {
      // refuse
      xboard_send(XBoard, 'Error (unknown command): %s', string);
   } else if (match(string, 'exit')) {
      State.computer[White] = false;
      State.computer[Black] = false;
      XB.analyse = false;
      yield* mess();
   } else if (match(string, 'force')) {
      State.computer[White] = false;
      State.computer[Black] = false;
      yield* mess();
   } else if (match(string, 'go')) {
      State.computer[game_turn(Game[0])] = true;
      State.computer[colour_opp(game_turn(Game[0]))] = false;
      XB.new_hack = false;
      XB.result = false;
      yield* mess();
   } else if (match(string, 'hard')) {
      XB.ponder = true;
      yield* mess();
   } else if (match(string, 'hint')) {
      if (option_get_bool('Book')) {
         game_get_board(Game[0], board);
         move = book_move(board, false);
         if (move !== MoveNone && move_is_legal(move, board)) {
            move_string = move_to_san(move, board);
            xboard_send(XBoard, 'Hint: %s', move_string);
         }
      }
   } else if (match(string, 'ics *')) {
      XB.ics = true;
   } else if (match(string, 'level * *:* *')) {
      XB.mps = atoi(Star[0]);
      XB.base = atoi(Star[1]) * 60.0 + atoi(Star[2]);
      XB.inc = atoi(Star[3]);
   } else if (match(string, 'level * * *')) {
      XB.mps = atoi(Star[0]);
      XB.base = atoi(Star[1]) * 60.0;
      XB.inc = atoi(Star[2]);
   } else if (match(string, 'name *')) {
      XB.name = Star[0];
   } else if (match(string, 'new')) {
      my_log('POLYGLOT NEW GAME\n');
      option_set('Chess960', 'false');
      game_clear(Game[0]);
      if (XB.analyse) {
         State.computer[White] = false;
         State.computer[Black] = false;
      } else {
         State.computer[White] = false;
         State.computer[Black] = true;
      }
      XB.new_hack = true;
      XB.result = false;
      XB.depth_limit = false;
      XB.computer = false;
      XB.name = '<empty>';
      board_update();
      yield* mess();
      uci_send_ucinewgame(Uci[0]);
   } else if (match(string, 'nopost')) {
      XB.post = false;
   } else if (match(string, 'otim *')) {
      XB.opp_time = atoi(Star[0]) / 100.0;
      if (XB.opp_time < 0.0) XB.opp_time = 0.0;
   } else if (match(string, 'pause')) {
      // refuse
      xboard_send(XBoard, 'Error (unknown command): %s', string);
   } else if (match(string, 'ping *')) {
      // HACK; TODO: answer only after an engine move
      if (DelayPong) {
         if (XB.ping >= 0) xboard_send(XBoard, 'pong %d', XB.ping); // HACK: get rid of old ping
         XB.ping = atoi(Star[0]);
         uci_send_isready(Uci[0]);
      } else {
         xboard_send(XBoard, 'pong %s', Star[0]);
      }
   } else if (match(string, 'playother')) {
      State.computer[game_turn(Game[0])] = false;
      State.computer[colour_opp(game_turn(Game[0]))] = true;
      XB.new_hack = false;
      XB.result = false;
      yield* mess();
   } else if (match(string, 'post')) {
      XB.post = true;
   } else if (match(string, 'protover *')) {
      XB.proto_ver = atoi(Star[0]);
      xboard_send(XBoard, 'feature done=0');
      xboard_send(XBoard, 'feature analyze=1');
      xboard_send(XBoard, 'feature colors=0');
      xboard_send(XBoard, 'feature draw=1');
      xboard_send(XBoard, 'feature ics=1');
      xboard_send(XBoard, 'feature myname="%s"', option_get_string('EngineName'));
      xboard_send(XBoard, 'feature name=1');
      xboard_send(XBoard, 'feature pause=0');
      xboard_send(XBoard, 'feature ping=1');
      xboard_send(XBoard, 'feature playother=1');
      xboard_send(XBoard, 'feature reuse=1');
      xboard_send(XBoard, 'feature san=0');
      xboard_send(XBoard, 'feature setboard=1');
      xboard_send(XBoard, 'feature sigint=0');
      xboard_send(XBoard, 'feature sigterm=0');
      xboard_send(XBoard, 'feature time=1');
      xboard_send(XBoard, 'feature usermove=1');
      if (uci_option_exist(Uci[0], 'UCI_Chess960')) {
         xboard_send(XBoard, 'feature variants="normal,fischerandom"');
      } else {
         xboard_send(XBoard, 'feature variants="normal"');
      }
      if (Uci[0].ready) xboard_send(XBoard, 'feature done=1');
      // otherwise "feature done=1" will be sent when the engine is ready
   } else if (match(string, 'quit')) {
      my_log('POLYGLOT *** "quit" from XBoard ***\n');
      yield* quit();
   } else if (match(string, 'random')) {
      // ignore
   } else if (match(string, 'rating * *')) {
      // ignore
   } else if (match(string, 'remove')) {
      if (game_pos(Game[0]) >= 2) {
         game_goto(Game[0], game_pos(Game[0]) - 2);
         XB.new_hack = false; // HACK?
         XB.result = false;
         board_update();
         yield* mess();
      }
   } else if (match(string, 'rejected *')) {
      // ignore
   } else if (match(string, 'reset')) { // protover 3?
      // refuse
      xboard_send(XBoard, 'Error (unknown command): %s', string);
   } else if (false
      || match(string, 'result * {*}')
      || match(string, 'result * {* }')
      || match(string, 'result * { *}')
      || match(string, 'result * { * }')) {
      my_log('POLYGLOT GAME END\n');
      XB.result = true;
      yield* mess();
      // book learning
      if (option_get_bool('Book') && option_get_bool('BookLearn')) {
         if (my_string_equal(Star[0], '1-0')) {
            learn(+1);
         } else if (my_string_equal(Star[0], '0-1')) {
            learn(-1);
         } else if (my_string_equal(Star[0], '1/2-1/2')) {
            learn(0);
         }
      }
   } else if (match(string, 'resume')) {
      // refuse
      xboard_send(XBoard, 'Error (unknown command): %s', string);
   } else if (match(string, 'sd *')) {
      XB.depth_limit = true;
      XB.depth_max = atoi(Star[0]);
   } else if (match(string, 'setboard *')) {
      my_log('POLYGLOT FEN %s\n', Star[0]);
      if (!game_init(Game[0], Star[0])) my_fatal('xboard_step(): bad FEN "%s"\n', Star[0]);
      State.computer[White] = false;
      State.computer[Black] = false;
      XB.new_hack = true; // HACK?
      XB.result = false;
      board_update();
      yield* mess();
   } else if (match(string, 'st *')) {
      XB.time_limit = true;
      XB.time_max = atoi(Star[0]);
   } else if (match(string, 'time *')) {
      XB.my_time = atoi(Star[0]) / 100.0;
      if (XB.my_time < 0.0) XB.my_time = 0.0;
   } else if (match(string, 'undo')) {
      if (game_pos(Game[0]) >= 1) {
         game_goto(Game[0], game_pos(Game[0]) - 1);
         XB.new_hack = false; // HACK?
         XB.result = false;
         board_update();
         yield* mess();
      }
   } else if (match(string, 'usermove *')) {
      game_get_board(Game[0], board);
      move = move_from_san(Star[0], board);
      if (move !== MoveNone && move_is_legal(move, board)) {
         XB.new_hack = false;
         XB.result = false;
         move_step(move);
         yield* no_mess(move);
      } else {
         xboard_send(XBoard, 'Illegal move: %s', Star[0]);
      }
   } else if (match(string, 'variant *')) {
      if (my_string_equal(Star[0], 'fischerandom')) {
         option_set('Chess960', 'true');
      } else {
         option_set('Chess960', 'false');
      }
   } else if (match(string, 'white')) {
      if (colour_is_white(game_turn(Game[0]))) {
         State.computer[White] = false;
         State.computer[Black] = true;
         XB.new_hack = true;
         XB.result = false;
         yield* mess();
      }
   } else if (match(string, 'xboard')) {
      // ignore
   } else if (match(string, '.')) { // analyse info
      if (State.state === ANALYSE) {
         const uci = Uci[0];
         if (uci.root_move !== MoveNone && move_is_legal(uci.root_move, uci.board)) {
            move_string = move_to_san(uci.root_move, uci.board);
            xboard_send(XBoard, 'stat01: %.0f %lld %d %d %d %s', uci.time * 100.0, uci.node_nb, uci.depth, uci.root_move_nb - (uci.root_move_pos + 1), uci.root_move_nb, move_string);
         } else {
            xboard_send(XBoard, 'stat01: %.0f %lld %d %d %d', uci.time * 100.0, uci.node_nb, uci.depth, 0, 0); // HACK
         }
      }
   } else if (match(string, '?')) { // move now
      if (State.state === THINK) {
         // HACK: just send "stop" to the engine
         if (Uci[0].searching) {
            my_log('POLYGLOT STOP SEARCH\n');
            engine_send(Engine[0], 'stop');
         }
      }
   } else
   // Extended commands from GNU Chess frontend
   if (match(string, 'book *')) { // book command (from GNU Chess v5)
      // TODO Invoke Polyglot's book functionality
      // Subcommands: add, on, off, prefer, random, best, worst
      const tokens = Star[0].split(' ').filter((t) => t !== ''); // strtok(Star[0], " ")
      const token = tokens[0];
      if (token === 'add') {
         const file = tokens[1];
         if (file === undefined) { // strlen(NULL)
            H.stderr('Segmentation fault\n');
            H.exit(139);
            throw new ExitSignal(139);
         }
         const my_argv = ['g', 'make-book', '-pgn', file];
         book_make(4, my_argv);
      } else if (token === 'on') {
         option_set('Book', 'true');
         let mode = BookReadOnly;
         if (option_get_bool('BookLearn')) {
            mode = BookReadWrite;
         }
         book_open(option_get_string('BookFile'), mode);
      } else if (token === 'off') {
         option_set('Book', 'false');
         uci_send_option(Uci[0], 'OwnBook', '%s', 'false');
      } else if (token === 'best') {
         option_set('BookRandom', 'false');
         option_set('BookWorst', 'false');
      } else if (token === 'best') { // sic: "random" never matches
         option_set('BookRandom', 'true');
         option_set('BookWorst', 'false');
      } else if (token === 'worst') {
         option_set('BookWorst', 'true');
      }
   } else if (match(string, 'hashon')) { // hash on command (from GNU Chess v5)
      engine_send(Engine[0], 'hashon');
   } else if (match(string, 'hashoff')) { // hash off command (from GNU Chess v5)
      engine_send(Engine[0], 'hashoff');
   } else if (match(string, 'memory')) { // memory command (from GNU Chess v5)
      xboard_send(XBoard, 'Current HashSize is %d MB', Hash.HashSize | 0);
   } else if (match(string, 'memory *')) { // memory N command (from GNU Chess v5)
      const token = Star[0].split(' ').filter((t) => t !== '')[0] ?? '';
      const r = sscanf(token, '%d');
      if (r.count === 1) {
         Hash.HashSize = (r.values[0] as number) >>> 0;
         uci_send_option(Uci[0], 'Hash', '%d', Hash.HashSize | 0);
         //xboard_send(XBoard, "Current HashSize is %d MB", HashSize );
      }
      engine_send(Uci[0].engine ?? Engine[0], 'uci');
   } else if (match(string, 'nullon')) { // null on command (from GNU Chess v5)
      uci_send_option(Uci[0], 'NullMove Pruning', '%s', 'Always');
   } else if (match(string, 'nulloff')) { // null off command (from GNU Chess v5)
      uci_send_option(Uci[0], 'NullMove Pruning', '%s', 'Never');
   } else { // unknown command, maybe a move?
      game_get_board(Game[0], board);
      move = move_from_san(string, board);
      if (move !== MoveNone && move_is_legal(move, board)) {
         XB.new_hack = false;
         XB.result = false;
         move_step(move);
         yield* no_mess(move);
      } else if (move !== MoveNone) {
         xboard_send(XBoard, 'Illegal move: %s', string);
      } else {
         xboard_send(XBoard, 'Error (unknown command): %s', string);
      }
   }
}

// engine_step()

export function* engine_step(): Task {
   // parse UCI line
   const string = yield* engine_get(Engine[0], StringSize);
   const event = uci_parse(Uci[0], string);
   // react to events
   if ((event & EVENT_READY) !== 0) {
      // the engine is now ready
      if (!Uci[0].ready) {
         Uci[0].ready = true;
         if (XB.proto_ver >= 2) xboard_send(XBoard, 'feature done=1');
      }
      if (!DelayPong && XB.ping >= 0) {
         xboard_send(XBoard, 'pong %d', XB.ping);
         XB.ping = -1;
      }
   }
   if ((event & EVENT_MOVE) !== 0 && State.state === THINK) {
      // the engine is playing a move
      // MEGA HACK: estimate remaining time because XBoard won't send it!
      my_timer_stop(State.timer);
      XB.my_time -= my_timer_elapsed_real(State.timer);
      XB.my_time += XB.inc;
      if (XB.mps !== 0 && (game_move_nb(Game[0]) + 1) % XB.mps === 0) XB.my_time += XB.base;
      if (XB.my_time < 0.0) XB.my_time = 0.0;
      // play the engine move
      yield* comp_move(Uci[0].best_move);
   }
   if ((event & EVENT_PV) !== 0) {
      // the engine has sent a new PV
      send_pv();
   }
}

// comp_move()

function* comp_move(move: number): Task {
   const board = new board_t();
   let string: string;
   send_pv(); // to update time and nodes
   // send the move
   game_get_board(Game[0], board);
   if (move_is_castle(move, board) && option_get_bool('Chess960')) {
      string = move_to_san(move, board); // O-O/O-O-O
   } else {
      string = move_to_can(move, board);
   }
   xboard_send(XBoard, 'move %s', string);
   // resign?
   if (option_get_bool('Resign') && Uci[0].root_move_nb > 1) {
      if (Uci[0].best_score <= -Math.abs(option_get_int('ResignScore'))) {
         State.resign_nb++;
         my_log('POLYGLOT %d move%s with resign score\n', State.resign_nb, State.resign_nb > 1 ? 's' : '');
         if (State.resign_nb >= option_get_int('ResignMoves')) {
            my_log('POLYGLOT *** RESIGN ***\n');
            xboard_send(XBoard, 'resign');
         }
      } else {
         if (State.resign_nb > 0) my_log('POLYGLOT resign reset (State->resign_nb=%d)\n', State.resign_nb);
         State.resign_nb = 0;
      }
   }
   // play the move
   move_step(move);
   yield* no_mess(move);
}

// move_step()

function move_step(move: number): void {
   const board = new board_t();
   let move_string: string;
   // log
   game_get_board(Game[0], board);
   if (move !== MoveNone && move_is_legal(move, board)) {
      move_string = move_to_san(move, board);
      my_log('POLYGLOT MOVE %s\n', move_string);
   } else {
      move_string = move_to_can(move, board);
      my_log('POLYGLOT ILLEGAL MOVE "%s"\n', move_string);
      my_fatal('move_step(): illegal move "%s"\n', move_string);
   }
   // play the move
   game_add_move(Game[0], move);
   board_update();
}

// board_update()

function board_update(): void {
   // handle game end
   switch (game_status(Game[0])) {
      case PLAYING:
         break;
      case WHITE_MATES:
         xboard_send(XBoard, '1-0 {White mates}');
         break;
      case BLACK_MATES:
         xboard_send(XBoard, '0-1 {Black mates}');
         break;
      case STALEMATE:
         xboard_send(XBoard, '1/2-1/2 {Stalemate}');
         break;
      case DRAW_MATERIAL:
         xboard_send(XBoard, '1/2-1/2 {Draw by insufficient material}');
         break;
      case DRAW_FIFTY:
         xboard_send(XBoard, '1/2-1/2 {Draw by fifty-move rule}');
         break;
      case DRAW_REPETITION:
         xboard_send(XBoard, '1/2-1/2 {Draw by repetition}');
         break;
      default:
         break;
   }
}

// mess()

function* mess(): Task {
   // clear state variables
   State.resign_nb = 0;
   State.exp_move = MoveNone;
   my_timer_reset(State.timer);
   // abort a possible search
   yield* stop_search();
   // calculate the new state
   if (!active()) {
      State.state = WAIT;
      my_log('POLYGLOT WAIT\n');
   } else if (XB.analyse) {
      State.state = ANALYSE;
      my_log('POLYGLOT ANALYSE\n');
   } else if (State.computer[game_turn(Game[0])]) {
      State.state = THINK;
      my_log('POLYGLOT THINK\n');
   } else {
      State.state = WAIT;
      my_log('POLYGLOT WAIT\n');
   }
   yield* search_update();
}

// no_mess()

function* no_mess(move: number): Task {
   // just received a move, calculate the new state
   if (!active()) {
      yield* stop_search(); // abort a possible search
      State.state = WAIT;
      State.exp_move = MoveNone;
      my_log('POLYGLOT WAIT\n');
   } else if (State.state === WAIT) {
      my_log('POLYGLOT WAIT -> THINK\n');
      State.state = THINK;
      State.exp_move = MoveNone;
   } else if (State.state === THINK) {
      if (ponder() && ponder_move_is_ok(Uci[0].ponder_move)) {
         my_log('POLYGLOT THINK -> PONDER\n');
         State.state = PONDER;
         State.exp_move = Uci[0].ponder_move;
      } else {
         my_log('POLYGLOT THINK -> WAIT\n');
         State.state = WAIT;
         State.exp_move = MoveNone;
      }
   } else if (State.state === PONDER) {
      if (move === State.exp_move && Uci[0].searching) {
         my_timer_reset(State.timer);
         my_timer_start(State.timer);
         my_log('POLYGLOT PONDER -> THINK (*** HIT ***)\n');
         engine_send(Engine[0], 'ponderhit');
         State.state = THINK;
         State.exp_move = MoveNone;
         send_pv(); // update display
         return; // do not launch a new search
      } else {
         my_log('POLYGLOT PONDER -> THINK (miss)\n');
         yield* stop_search();
         State.state = THINK;
         State.exp_move = MoveNone;
      }
   } else if (State.state === ANALYSE) {
      my_log('POLYGLOT ANALYSE -> ANALYSE\n');
      yield* stop_search();
   }
   yield* search_update();
}

// search_update()

function* search_update(): Task {
   let move: number;
   let move_nb: number;
   const board = new board_t();
   const uci = Uci[0];
   // launch a new search if needed
   if (State.state === THINK || State.state === PONDER || State.state === ANALYSE) {
      // opening book
      if (State.state === THINK && option_get_bool('Book')) {
         game_get_board(Game[0], uci.board);
         move = book_move(uci.board, option_get_bool('BookRandom'), option_get_bool('BookWorst'));
         if (move !== MoveNone && move_is_legal(move, uci.board)) {
            my_log('POLYGLOT *BOOK MOVE*\n');
            search_clear(); // clears Uci->ponder_move
            uci.best_move = move;
            board_copy(board, uci.board);
            move_do(board, move);
            uci.ponder_move = book_move(board, false); // expected move = best book move
            uci.best_pv[0] = uci.best_move;
            uci.best_pv[1] = uci.ponder_move; // can be MoveNone
            uci.best_pv[2] = MoveNone;
            yield* comp_move(uci.best_move);
            return;
         }
      }
      // engine search
      my_log('POLYGLOT START SEARCH\n');
      // options
      uci_send_option(uci, 'UCI_Chess960', '%s', option_get_bool('Chess960') ? 'true' : 'false');
      if (option_get_int('UCIVersion') >= 2) {
         uci_send_option(uci, 'UCI_Opponent', 'none none %s %s', XB.computer ? 'computer' : 'human', XB.name);
         uci_send_option(uci, 'UCI_AnalyseMode', '%s', XB.analyse ? 'true' : 'false');
      }
      uci_send_option(uci, 'Ponder', '%s', ponder() ? 'true' : 'false');
      // position
      move = State.state === PONDER ? State.exp_move : MoveNone;
      send_board(move); // updates Uci->board global variable
      // search
      if (State.state === THINK || State.state === PONDER) {
         engine_send_queue(Engine[0], 'go');
         if (XB.time_limit) {
            // fixed time per move
            engine_send_queue(Engine[0], ' movetime %.0f', XB.time_max * 1000.0);
         } else {
            // time controls
            if (colour_is_white(uci.board.turn)) {
               engine_send_queue(Engine[0], ' wtime %.0f btime %.0f', XB.my_time * 1000.0, XB.opp_time * 1000.0);
            } else {
               engine_send_queue(Engine[0], ' wtime %.0f btime %.0f', XB.opp_time * 1000.0, XB.my_time * 1000.0);
            }
            if (XB.inc !== 0.0) engine_send_queue(Engine[0], ' winc %.0f binc %.0f', XB.inc * 1000.0, XB.inc * 1000.0);
            if (XB.mps !== 0) {
               move_nb = XB.mps - (uci.board.move_nb % XB.mps);
               engine_send_queue(Engine[0], ' movestogo %d', move_nb);
            }
         }
         if (XB.depth_limit) engine_send_queue(Engine[0], ' depth %d', XB.depth_max);
         if (State.state === PONDER) engine_send_queue(Engine[0], ' ponder');
         engine_send(Engine[0], ''); // newline
      } else if (State.state === ANALYSE) {
         engine_send(Engine[0], 'go infinite');
      }
      // init search info
      search_clear();
      uci.searching = true;
      uci.pending_nb++;
   }
}

// search_clear()

function search_clear(): void {
   uci_clear(Uci[0]);
   // TODO: MOVE ME
   my_timer_reset(State.timer);
   my_timer_start(State.timer);
}

// active()

function active(): boolean {
   // position state
   if (game_status(Game[0]) !== PLAYING) return false; // game ended
   // xboard state
   if (XB.analyse) return true; // analysing
   if (!State.computer[White] && !State.computer[Black]) return false; // force mode
   if (XB.new_hack || XB.result) return false; // unstarted or ended game
   return true; // playing
}

// ponder()

function ponder(): boolean {
   return XB.ponder && (option_get_bool('CanPonder') || uci_option_exist(Uci[0], 'Ponder'));
}

// ponder_move_is_ok()

function ponder_move_is_ok(move: number): boolean {
   const board = new board_t();
   // legal ponder move?
   if (move === MoveNone) return false;
   game_get_board(Game[0], board);
   if (!move_is_legal(move, board)) return false;
   // UCI-legal resulting position?
   game_add_move(Game[0], move);
   game_get_board(Game[0], board);
   const status = game_status(Game[0]);
   game_rem_move(Game[0]);
   if (status !== PLAYING) return false; // game ended
   if (option_get_bool('Book') && is_in_book(board)) {
      return false;
   }
   return true;
}

// stop_search()

function* stop_search(): Task {
   if (Uci[0].searching) {
      my_log('POLYGLOT STOP SEARCH\n');
      /*
      engine_send(Engine,"stop");
      Uci->searching = false;
      */
      if (option_get_bool('SyncStop')) {
         yield* uci_send_stop_sync(Uci[0]);
      } else {
         uci_send_stop(Uci[0]);
      }
   }
}

// send_board()

function send_board(extra_move: number): void {
   const board = new board_t();
   let move: number;
   let string: string;
   const uci = Uci[0];
   // init
   game_get_board(Game[0], uci.board);
   if (extra_move !== MoveNone) move_do(uci.board, extra_move);
   const fen = board_to_fen(uci.board);
   my_log('POLYGLOT FEN %s\n', fen);
   // more init
   const start = 0;
   const end = game_pos(Game[0]);
   // position
   game_get_board(Game[0], board, start);
   string = board_to_fen(board);
   engine_send_queue(Engine[0], 'position');
   if (my_string_equal(string, StartFen)) {
      engine_send_queue(Engine[0], ' startpos');
   } else {
      engine_send_queue(Engine[0], ' fen %s', string);
   }
   // move list
   if (end > start || extra_move !== MoveNone) engine_send_queue(Engine[0], ' moves');
   for (let pos = start; pos < end; pos++) { // game moves
      move = game_move(Game[0], pos);
      string = move_to_can(move, board);
      engine_send_queue(Engine[0], ' %s', string);
      move_do(board, move);
   }
   if (extra_move !== MoveNone) { // move to ponder on
      string = move_to_can(extra_move, board);
      engine_send_queue(Engine[0], ' %s', string);
   }
   // end
   engine_send(Engine[0], ''); // newline
}

// send_pv()

function send_pv(): void {
   let pv_string: string;
   const board = new board_t();
   let move: number;
   let move_string: string;
   const uci = Uci[0];
   if (uci.best_depth === 0) return;
   // xboard search information
   if (XB.post) {
      if (State.state === THINK || State.state === ANALYSE) {
         pv_string = line_to_san(uci.best_pv, uci.board);
         xboard_send(XBoard, '%d %+d %.0f %lld %s', uci.best_depth, uci.best_score, uci.time * 100.0, uci.node_nb, pv_string);
      } else if (State.state === PONDER && option_get_bool('ShowPonder')) {
         game_get_board(Game[0], board);
         move = State.exp_move;
         if (move !== MoveNone && move_is_legal(move, board)) {
            move_string = move_to_san(move, board);
            pv_string = line_to_san(uci.best_pv, uci.board);
            xboard_send(XBoard, '%d %+d %.0f %lld (%s) %s', uci.best_depth, uci.best_score, uci.time * 100.0, uci.node_nb, move_string, pv_string);
         }
      }
   }
   // kibitz
   if ((uci.searching && option_get_bool('KibitzPV') && uci.time >= option_get_double('KibitzDelay'))
    || (!uci.searching && option_get_bool('KibitzMove'))) {
      if (State.state === THINK || State.state === ANALYSE) {
         pv_string = line_to_san(uci.best_pv, uci.board);
         xboard_send(XBoard, '%s depth=%d time=%.2f node=%lld speed=%.0f score=%+.2f pv="%s"', option_get_string('KibitzCommand'), uci.best_depth, uci.time, uci.node_nb, uci.speed, uci.best_score / 100.0, pv_string);
      } else if (State.state === PONDER) {
         game_get_board(Game[0], board);
         move = State.exp_move;
         if (move !== MoveNone && move_is_legal(move, board)) {
            move_string = move_to_san(move, board);
            pv_string = line_to_san(uci.best_pv, uci.board);
            xboard_send(XBoard, '%s depth=%d time=%.2f node=%lld speed=%.0f score=%+.2f pv="(%s) %s"', option_get_string('KibitzCommand'), uci.best_depth, uci.time, uci.node_nb, uci.speed, uci.best_score / 100.0, move_string, pv_string);
         }
      }
   }
}

// xboard_get()

function* xboard_get(xboard: xboard_t): Generator<void, string | null, void> {
   const string = io_get_line(xboard.io, StringSize);
   if (string === null) { // EOF
      my_log('POLYGLOT *** EOF from XBoard ***\n');
      yield* quit();
      return null;
   }
   const nul = string.indexOf('\0'); // the C string ends at a NUL
   return nul < 0 ? string : string.slice(0, nul);
}

// xboard_send()

export function xboard_send(xboard: xboard_t, format: string, ...args: Arg[]): void {
   // format
   const string = sprintf(format, ...args);
   // send
   io_send(xboard.io, '%s', string);
}

// learn()

function learn(result: number): void {
   let pos: number;
   const board = new board_t();
   let move: number;
   // init
   pos = 0;
   if (State.computer[White]) {
      pos = 0;
   } else if (State.computer[Black]) {
      pos = 1;
      result = -result;
   } else {
      my_fatal('learn(): unknown side\n');
   }
   if (result > 0) {
      my_log('POLYGLOT *LEARN WIN*\n');
   } else if (result < 0) {
      my_log('POLYGLOT *LEARN LOSS*\n');
   } else {
      my_log('POLYGLOT *LEARN DRAW*\n');
   }
   // loop
   for (; pos < Game[0].size; pos += 2) {
      game_get_board(Game[0], board, pos);
      move = game_move(Game[0], pos);
      book_learn_move(board, move, result);
   }
   book_flush();
}
