// Port of src/frontend/cmd.cc of GNU Chess 6.3.0: every command of the GNU Chess prompt, the help text,
// and parse_input(), which runs a command or plays a move. The input is split into tokens as the C code
// does: token[k] points into the input line, so a token is the rest of the line from there (tokeneq()
// compares up to the next space); the line is cut after its last non-space character.
import {
  ANALYZE, ENDED, Game, MANUAL, MAXNAMESZ, MAXSTR, MoveLimit, POST, QUIT, THINK, TIMEOUT, TimeLimit, TreePtr, USEHASH,
  USENULL, XBOARD, Tree, black, board, g, white,
} from './common.ts';
import { InitVars, NewPosition } from './init.ts';
import { MakeMove, SANMove, UnmakeMove, ValidateMove } from './move.ts';
import { ShowBoard, ShowGame, ShowMoveList, ShowTime } from './output.ts';
import { FilterIllegalMoves, GenCaptures, GenCheckEscapes, GenMoves, GenNonCaptures } from './genmove.ts';
import { EPD2str, LoadEPD, ParseEPD, SaveEPD } from './epd.ts';
import { PGNReadFromFile, PGNSaveToFile } from './pgn.ts';
import { DBListPlayer, DBUpdatePlayer } from './players.ts';
import { Solve } from './solve.ts';
import { ValidateBoard } from './util.ts';
import {
  ChangeColor, ExpectAnswerFromEngine, SetAutoGo, SetDataToEngine, SetUserInputValidMove, fe, parser, type Wait,
} from './engine.ts';
import { PACKAGE_NAME, PACKAGE_STRING } from './version.ts';
import { access, fopenRead, fopenWrite, fprintf, fprintf_stderr, printf, putchar, puts, stdoutStream } from './stdio.ts';
import { atoi, isspace, sprintf, sscanf } from '../libc.ts';

const TOKENS = 3;

/** where the tokens start in the input buffer (fe.inputmem) */
const tok = [0, 0, 0];
/** the C string at index i of the input buffer */
const cstrAt = (i: number): string => {
  const m = fe.inputmem;
  const z = m.indexOf('\0', i);
  return m.slice(i, z < 0 ? m.length : z);
};
/** token[k]: the C string token[k] points to */
const token = (k: number): string => cstrAt(tok[k]);
/** the C string after the NUL that ends token[k]'s string */
const afterToken = (k: number): string => cstrAt(tok[k] + token(k).length + 1);

let logfile = '';
let gamefile = '';
let hardFlag = 0;
let postFlag = 0;

const setboard_cmd = 'setboard ';

export function cmdReset(): void {
  tok[0] = tok[1] = tok[2] = 0;
  logfile = '';
  gamefile = '';
  hardFlag = 0;
  postFlag = 0;
}

function split_input(): void {
  const s0 = cstrAt(0);
  const at = (i: number): string => (i < s0.length ? s0[i] : '\0');
  /* r points to the last non-space character */
  let s = 0, r = 0;
  for (let k = 0; k < TOKENS; ++k) {
    /* Skip leading whitespace */
    while (isspace(at(s))) s++;
    tok[k] = s;
    /* Skip token */
    while (at(s) !== '\0' && !isspace(at(s))) r = s++;
  }
  while (at(s) !== '\0') {
    while (isspace(at(s))) s++;
    while (at(s) !== '\0' && !isspace(at(s))) r = s++;
  }
  // r[1] = '\0'
  const m = fe.inputmem;
  fe.inputmem = m.slice(0, r + 1) + '\0' + m.slice(r + 2);
  fe.inputstr = cstrAt(0);
}

/** Compares two tokens, returns 1 on equality. Tokens are separated by whitespace. */
function tokeneq(s: string, t: string): boolean {
  let i = 0;
  while (i < s.length && i < t.length && !isspace(s[i]) && !isspace(t[i])) {
    if (s[i] !== t[i]) return false;
    i++;
  }
  return (i >= s.length || isspace(s[i])) && (i >= t.length || isspace(t[i]));
}

/** Remove a trailing \n and return NULL if last character is not \n. */
function trim_newline(l: string | null): string | null {
  if (l === null) return null;
  if (l.length <= 0 || l[l.length - 1] !== '\n') return null;
  return l.slice(0, -1);
}

/** Takes an EPD filename as input and returns the contents as a 'setboard <epd-position>' command. */
function build_setboard_cmd_from_epd_file(epd_filename: string, data_len: number): string | null {
  const epdfile = fopenRead(epd_filename);
  if (epdfile === null) return null;
  const first = epdfile.fgets(data_len);
  const epdline = trim_newline(first);
  if (first !== null && epdline !== null && setboard_cmd.length + epdline.length < data_len) return setboard_cmd + epdline;
  return null;
}

/** Takes a PGN filename as input and returns the contents as a 'setboard <epd-position>' command. */
function build_setboard_cmd_from_pgn_file(pgn_filename: string, data_len: number): string | null {
  PGNReadFromFile(pgn_filename, 0);
  const epdline = EPD2str('');
  if (setboard_cmd.length + epdline.length < data_len) return setboard_cmd + epdline;
  return null;
}

/** Loads a PGN file. Returns 1 on success, 0 on error. */
function pgnload(pgn_filename: string): number {
  const data = build_setboard_cmd_from_pgn_file(pgn_filename, MAXSTR);
  if (data !== null) {
    SetDataToEngine(data);
    SetAutoGo(true);
    return 1;
  }
  printf("Error loading PGN file '%s'.\n", pgn_filename);
  return 0;
}

function cmd_accepted(): void {
  SetDataToEngine(token(0));
}

function cmd_activate(): void {
  printf("Command 'activate' is currently not supported.\n");
}

function cmd_analyze(): void {
  /* "analyze" mode is similar to force, hard and post together */
  g.flags |= ANALYZE;
  SetDataToEngine('hard\npost\nanalyze');
}

function cmd_bk(): void {
  SetDataToEngine('bk');
}

function cmd_black(): void {
  printf("Command 'black' is currently not supported.\n");
}

function cmd_book(): void {
  let data = 'book ';
  if (tokeneq(token(1), 'add')) {
    if (!access(token(2))) {
      printf('The syntax to add a new book is:\n\n\tbook add file.pgn\n');
    } else {
      data += 'add ';
      data += token(2);
    }
  } else if (tokeneq(token(1), 'on') || tokeneq(token(1), 'prefer')) {
    data = 'book on';
    printf('Book is now on.\n');
  } else if (tokeneq(token(1), 'off')) {
    data = 'book off';
    printf('Book is now off.\n');
  } else if (tokeneq(token(1), 'best')) {
    data = 'book best';
    printf('Book is now best.\n');
  } else if (tokeneq(token(1), 'worst')) {
    data = 'book worst';
    printf('Book is now worst.\n');
  } else if (tokeneq(token(1), 'random')) {
    data = 'book random';
    printf('Book is now random.\n');
  } else {
    printf("Incorrect book option: '%s'.\n", token(1));
    return;
  }
  SetDataToEngine(data);
}

function cmd_depth(): void {
  const searchDepth = atoi(token(1));
  SetDataToEngine(sprintf('sd %d', searchDepth));
  printf('Search to a depth of %d.\n', searchDepth);
}

function cmd_easy(): void {
  SetDataToEngine(token(0));
}

/* Predecessor to setboard */
function cmd_edit(): void {
  if (g.flags & XBOARD) printf("tellusererror command 'edit' not implemented\n");
}

function cmd_exit(): void {
  /* "exit" is a synonym for quit except in engine mode when it means leave analyze mode */
  if (g.flags & ANALYZE) {
    g.flags = g.preanalyze_flags; /* this implicitly clears ANALYZE flag */
    SetDataToEngine(token(0));
  } else {
    cmd_quit();
  }
}

function cmd_force(): void {
  g.flags |= MANUAL;
  SetDataToEngine(token(0));
}

function cmd_go(): void {
  g.flags |= THINK;
  g.flags &= ~MANUAL;
  g.flags &= ~TIMEOUT;
  g.flags &= ~ENDED;
  g.computer = board.side;
  ExpectAnswerFromEngine(true);
  ChangeColor(true);
  SetDataToEngine(token(0));
  g.pgnloaded = 0;
}

function cmd_hard(): void {
  SetDataToEngine(token(0));
}

function cmd_hash(): void {
  if (tokeneq(token(1), 'off')) {
    g.flags &= ~USEHASH;
    SetDataToEngine('hashoff');
  } else if (tokeneq(token(1), 'on')) {
    g.flags |= USEHASH;
    SetDataToEngine('hashon');
  }
  if (g.flags & USEHASH) printf('Hashing is on.\n');
  else printf('Hashing is off.\n');
}

/* Give a possible move for the player to play */
function cmd_hint(): void {
  /* An answer is received only if book on - TODO change this in adapter */
  SetDataToEngine(token(0));
}

function cmd_ics(): void {
  SetDataToEngine(token(0));
}

function cmd_level(): void {
  SetDataToEngine(token(0));
  const r = sscanf(token(1), '%d %f %d');
  if (r.values.length >= 1) g.TCMove = r.values[0] as number;
  if (r.values.length >= 2) g.TCTime = r.values[1] as number;
  if (r.values.length >= 3) g.TCinc = r.values[2] as number;
  if (g.TCMove === 0) {
    g.TCMove = 35; /* MIN((5*(GameCnt+1)/2)+1,60) */
    printf('TCMove = %d\n', g.TCMove);
  }
  if (g.TCTime === 0) {
    g.SearchTime = Math.fround(g.TCinc / 2.0);
    printf('Fischer increment of %d seconds.\n', g.TCinc);
  } else {
    MoveLimit[white] = MoveLimit[black] = g.TCMove - Math.trunc((g.GameCnt + 1) / 2);
    TimeLimit[white] = TimeLimit[black] = Math.fround(g.TCTime * 60);
    if (!(g.flags & XBOARD)) {
      printf('Time control: %d moves in %.2f secs.\n', MoveLimit[white], TimeLimit[white]);
      printf('Fischer increment of %d seconds.\n', g.TCinc);
    }
  }
}

function cmd_list(): void {
  const t = token(1);
  if (t[0] === '?') {
    printf('name    - list known players alphabetically\n');
    printf('score   - list by GNU best result first\n');
    printf('reverse - list by GNU worst result first\n');
  } else {
    if (t === '') DBListPlayer('rscore');
    else DBListPlayer(t);
  }
}

function cmd_load(): void {
  const epd_filename = token(1);
  LoadEPD(epd_filename);
  g.pgnloaded = 0;
  check_board();
  if (!ValidateBoard()) {
    g.flags |= ENDED;
    printf('Board is wrong!\n');
  } else {
    /* Read EPD file and send contents to engine */
    const data = build_setboard_cmd_from_epd_file(epd_filename, MAXSTR);
    if (data !== null) {
      SetDataToEngine(data);
      SetAutoGo(true);
    } else {
      printf("Error loading EPD file '%s'.\n", epd_filename);
    }
  }
}

function cmd_manual(): void {
  g.flags |= MANUAL;
  ExpectAnswerFromEngine(false);
  SetDataToEngine('force');
}

function cmd_memory(): void {
  if (token(1) === '') {
    ExpectAnswerFromEngine(true);
    SetDataToEngine('memory');
  } else {
    const r = sscanf(token(1), '%d');
    if (r.count === 1) SetDataToEngine(sprintf('memory %d\nmemory', r.values[0] as number));
    /* TODO Handle error */
  }
}

/* Move now, not applicable */
function cmd_movenow(): void {
  SetDataToEngine('?');
}

function cmd_name(): void {
  SetDataToEngine(token(0));
  /* name[sizeof name - 1] should always be 0 */
  g.name = token(1).slice(0, MAXNAMESZ - 1);
  for (let suffix = 0; suffix < 1000; suffix++) {
    logfile = sprintf('log.%03d', suffix);
    gamefile = sprintf('game.%03d', suffix);
    if (!access(logfile)) {
      const f = fopenWrite(logfile, 'w');
      if (f === null) {
        g.ofp = stdoutStream;
        fprintf_stderr('Failed to open %s for writing: %s\n', logfile, 'Permission denied');
      } else g.ofp = f;
      return;
    }
  }
  fprintf_stderr('Could not create logfile, all slots occupied.\n');
  fprintf_stderr('You may consider deleting or renaming your existing logfiles.\n');
}

function cmd_new(): void {
  InitVars();
  NewPosition();
  /* Protocol specification for ANALYZE says "new" does not end analysis */
  if (!(g.flags & ANALYZE)) g.flags &= ~MANUAL;
  g.flags &= ~THINK;
  g.myrating = g.opprating = 0;
  SetDataToEngine(token(0));
}

function cmd_nopost(): void {
  g.flags &= ~POST;
  postFlag = 0;
  ExpectAnswerFromEngine(false);
  SetDataToEngine(token(0));
}

function cmd_null(): void {
  if (tokeneq(token(1), 'off')) {
    g.flags &= ~USENULL;
    SetDataToEngine('nulloff');
  } else if (tokeneq(token(1), 'on')) {
    g.flags |= USENULL;
    SetDataToEngine('nullon');
  }
  if (g.flags & USENULL) printf('Null-move heuristic is on.\n');
  else printf('Null-move heuristic is off.\n');
}

function cmd_otim(): void {
  SetDataToEngine(token(0));
}

/* Load a file containing a game in PGN format: the adapter gets its final position (setboard). */
function cmd_pgnload(): void {
  pgnload(token(1));
}

/** UnmakeMove(board.side, &Game[GameCnt].move) */
const unmakeLast = (): void => UnmakeMove(board.side, Game[g.GameCnt].move);
/** MakeMove(board.side, &Game[GameCnt+1].move) */
const remakeNext = (): void => {
  const i = g.GameCnt + 1;
  Game[i].move = MakeMove(board.side, Game[i].move);
};

function cmd_pgnreplay(): void {
  if (!pgnload(token(1))) return;
  g.pgnloaded = 1;
  g.pgncnt = g.GameCnt;
  while (g.GameCnt >= 0) {
    if (g.GameCnt >= 0) {
      g.flags &= ~ENDED;
      g.flags &= ~TIMEOUT;
      ChangeColor(true);
      SetAutoGo(true);
      unmakeLast();
      if (g.GameCnt >= 0) unmakeLast();
    }
  }
  cmd_first();
}

function cmd_next(): void {
  if (!g.pgnloaded) {
    printf('Error: PGN file not loaded!\n');
    return;
  }
  if (g.GameCnt + 1 <= g.pgncnt) {
    ChangeColor(true);
    SetAutoGo(true);
    remakeNext();
  } else {
    printf('No more moves. Game reached the end.\n');
    return;
  }
  printf('%d. ', Math.trunc(g.GameCnt / 2) + 1);
  printf('%s\n', Game[g.GameCnt].SANmv);
  ShowBoard();
}

function cmd_previous(): void {
  if (!g.pgnloaded) {
    printf('Error: PGN file not loaded!\n');
    return;
  }
  if (g.GameCnt >= 0) {
    ChangeColor(true);
    SetAutoGo(true);
    unmakeLast();
  } else {
    printf('Initial position reached. There are no earlier moves.\n');
    return;
  }
  printf('%d. ', Math.trunc(g.GameCnt / 2) + 1);
  printf('%s\n', g.GameCnt >= 0 ? Game[g.GameCnt].SANmv : lastBeforeStart());
  ShowBoard();
}

/**
 * Game[-1].SANmv: with no move made the C code prints the 8 bytes before Game[]. In the reference
 * build (re/gnuchess/oracle) those are the ints RealGameCnt and GameCnt (little-endian), and zeros follow.
 */
const lastBeforeStart = (): string => {
  let s = '';
  for (const v of [g.RealGameCnt, g.GameCnt]) for (let i = 0; i < 4; i++) s += String.fromCharCode((v >>> (8 * i)) & 255);
  const z = s.indexOf('\0');
  return z < 0 ? s : s.slice(0, z);
};

function cmd_last(): void {
  if (!g.pgnloaded) {
    printf('Error: PGN file not loaded!\n');
    return;
  }
  while (g.GameCnt + 1 <= g.pgncnt) {
    ChangeColor(true);
    SetAutoGo(true);
    remakeNext();
  }
  printf('%d. ', Math.trunc(g.GameCnt / 2) + 1);
  printf('%s\n', g.GameCnt >= 0 ? Game[g.GameCnt].SANmv : lastBeforeStart());
  ShowBoard();
}

function cmd_first(): void {
  if (!g.pgnloaded) {
    printf('Error: PGN file not loaded!\n');
    return;
  }
  while (g.GameCnt >= 0) {
    if (g.GameCnt >= 0) {
      g.flags &= ~ENDED;
      g.flags &= ~TIMEOUT;
      ChangeColor(true);
      SetAutoGo(true);
      unmakeLast();
      if (g.GameCnt >= 0) unmakeLast();
    }
  }
  ShowBoard();
}

function cmd_pgnsave(): void {
  if (token(1).length > 0) PGNSaveToFile(token(1), '');
  else printf('Invalid filename.\n');
}

function cmd_graphic(): void {
  g.graphicmodeoutput = 1;
  printf('Graphic mode is enabled.\n');
}

function cmd_nographic(): void {
  g.graphicmodeoutput = 0;
  printf('Graphic mode is disabled.\n');
}

function cmd_ping(): void {
  SetDataToEngine(token(0));
  printf('pong %s\n', token(1));
}

function cmd_post(): void {
  g.flags |= POST;
  postFlag = 1;
  if (hardFlag && postFlag) ExpectAnswerFromEngine(true);
  if (g.flags & XBOARD) ExpectAnswerFromEngine(true);
  else ExpectAnswerFromEngine(false);
  SetDataToEngine(token(0));
}

function cmd_protover(): void {
  SetDataToEngine(token(0));
}

function cmd_quit(): void {
  g.flags |= QUIT;
}

function cmd_random(): void {
  printf("Command 'random' is currently not supported.\n");
}

function cmd_rating(): void {
  g.myrating = atoi(token(1));
  g.opprating = atoi(token(2));
  fprintf(g.ofp, 'my rating = %d, opponent rating = %d\n', g.myrating, g.opprating);
  /* Change randomness of book based on opponent rating. */
  g.bookfirstlast = 2;
}

function cmd_rejected(): void {}

function cmd_remove(): void {
  SetDataToEngine(token(0));
  if (g.GameCnt >= 0) {
    g.flags &= ~ENDED;
    g.flags &= ~TIMEOUT;
    unmakeLast();
    if (g.GameCnt >= 0) {
      unmakeLast();
      if (!(g.flags & XBOARD)) ShowBoard();
    }
    PGNSaveToFile('game.log', '');
  } else printf('No moves to undo!\n');
}

function cmd_result(): void {
  /* TODO Do not send to engine */
  SetDataToEngine(token(0));
  if (g.ofp !== stdoutStream) {
    fprintf(g.ofp, 'result: %s\n', token(1));
    g.ofp = stdoutStream;
    printf('Save to %s\n', gamefile);
    PGNSaveToFile(gamefile, token(1));
    DBUpdatePlayer(g.name, token(1));
  }
}

function cmd_save(): void {
  if (token(1).length > 0) SaveEPD(token(1));
  else printf('Invalid filename.\n');
}

function cmd_setboard(): void {
  /* setboard uses FEN, not EPD, but ParseEPD will accept FEN too */
  ParseEPD(token(1));
  NewPosition();
  check_board();
  SetDataToEngine(('setboard ' + token(1)).slice(0, MAXSTR - 1));
}

function* cmd_solve(): Generator<Wait, void, void> {
  yield* Solve(token(1));
}

/* Set total time for move to be N seconds is "st N" */
function cmd_st(): void {
  /* Approximately level 1 0 N */
  const r = sscanf(token(1), '%d');
  if (r.count === 1) g.TCinc = r.values[0] as number;
  /* Allow a little fussiness for failing low etc */
  g.SearchTime = Math.fround(g.TCinc * Math.fround(0.9));
  SetDataToEngine(sprintf('st %d', atoi(token(1))));
}

function cmd_switch(): void {
  printf("Command 'switch' is currently not supported.\n");
}

function cmd_time(): void {
  SetDataToEngine(token(0));
  TimeLimit[1 ^ board.side] = Math.fround(atoi(token(1)) / 100.0);
}

function cmd_undo(): void {
  SetDataToEngine('force\nundo');
  ChangeColor(true);
  SetAutoGo(!(g.flags & MANUAL));
  if (g.GameCnt >= 0) unmakeLast();
  else printf('No moves to undo!\n');
  MoveLimit[board.side]++;
  TimeLimit[board.side] = Math.fround(TimeLimit[board.side] + Game[g.GameCnt + 1].et);
  if (!(g.flags & XBOARD)) ShowBoard();
}

export function cmd_usage(): void {
  printf('\n');
  printf('Usage: %s [OPTION]...\n\n', g.progname);
  printf('Play the game of chess.\n\n');
  printf('Options:\n');
  printf(' -h, --help                        display this help and exit\n');
  printf(' -v, --version                     display version information and exit\n');
  printf(' -q, --quiet                       make the program silent on startup\n');
  printf('     --silent                      same as -q\n');
  printf('\n');
  printf(' -x, --xboard                      start in engine mode\n');
  printf(' -p, --post                        start up showing thinking\n');
  printf(' -e, --easy                        disable thinking in opponents time\n');
  printf(' -m, --manual                      enable manual mode\n');
  printf(' -u, --uci                         enable UCI protocol (that is: behave like an\n                                   UCI engine); incompatible with other options\n');
  printf(' -M SIZE, --memory=SIZE            specify memory usage in MB for hashtable\n');
  printf(' -a FILENAME, --addbook=FILENAME   compile book.bin from pgn book FILENAME\n');
  printf(' -g, --graphic                     enable graphic mode\n');
  printf('\n');
  printf('Options xboard and post are accepted without leading dashes\nfor backward compatibility.\n\n');
  printf('Moves are accepted either in standard algebraic notation (SAN) or\nin coordinate algebraic notation.\n\n');
  printf(
    "The file 'gnuchess.ini' allows setting configuration options, but it is\n" +
      "ignored if the --uci option is used. See 'info gnuchess' for details\n" +
      "about the options. The program will look for 'gnuchess.ini' in\n" +
      '$XDG_CONFIG_HOME/gnuchess/ and $HOME/.config/gnuchess/ in that order,\n' +
      'and it will use the first one it finds, if any.\n\n',
  );
  printf('Report bugs to: <bug-gnu-chess@gnu.org>.\n');
  printf('%s home page: <https://www.gnu.org/software/chess/>\n', PACKAGE_NAME);
  printf('General help using GNU software: <https://www.gnu.org/gethelp/>\n\n');
}

/* Play variant, we instruct interface in protover we play normal */
function cmd_variant(): void {}

/** the part of parse_input() and cmd_usermove() that plays the player's move */
function play_user_move(ptr: number, shown: string, toEngine: string): void {
  /* Since the user entered a move: 1. The move must be sent to the engine. 2. A reply is expected from the engine. */
  SetUserInputValidMove(1);
  SetDataToEngine(toEngine);
  g.pgnloaded = 0;
  ExpectAnswerFromEngine(true);
  SANMove(treeMove(ptr), 1);
  setTreeMove(ptr, MakeMove(board.side, treeMove(ptr)));
  Game[g.GameCnt].SANmv = g.SANmv;
  printf('%d. ', Math.trunc(g.GameCnt / 2) + 1);
  printf('%s', shown);
  if (g.ofp !== stdoutStream) {
    fprintf(g.ofp, '%d. ', Math.trunc(g.GameCnt / 2) + 1);
    fprintf(g.ofp, '%s', shown);
  }
  putchar('\n');
  if (g.ofp !== stdoutStream) fprintf(g.ofp, '\n');
  if (!(g.flags & XBOARD)) ShowBoard();
  g.flags |= THINK;
}

const treeMove = (p: number): number => Tree.move[p];
const setTreeMove = (p: number, m: number): void => {
  Tree.move[p] = m;
};

function cmd_usermove(): void {
  const ptr = ValidateMove(token(1), undefined, afterToken(1));
  if (ptr !== -1) {
    play_user_move(ptr, token(1), token(0));
  } else {
    /* Must Output Illegal move to prevent Xboard accepting illegal en passant captures and other subtle mistakes */
    printf('Invalid move: %s\n', token(1));
  }
}

function cmd_version(): void {
  printf('%s\n', PACKAGE_STRING);
  printf(
    'Copyright (C) %s Free Software Foundation, Inc.\n' +
      'License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>\n' +
      'This is free software: you are free to change and redistribute it.\n' +
      'There is NO WARRANTY, to the extent permitted by law.\n',
    '2025',
  );
}
export { cmd_version };

function cmd_coords(): void {
  printf('Coordinate display enabled.\n');
  g.coords = 1;
}

function cmd_nocoords(): void {
  printf('Coordinate display disabled.\n');
  g.coords = 0;
}

function cmd_white(): void {
  printf("Command 'white' is currently not supported.\n");
}

function cmd_xboard(): void {
  SetDataToEngine('xboard');
  if (tokeneq(token(1), 'off')) g.flags &= ~XBOARD;
  else if (tokeneq(token(1), 'on')) g.flags |= XBOARD;
  else if (!(g.flags & XBOARD)) {
    /* set if unset and only xboard called */
    g.flags |= XBOARD; /* like in xboard/winboard usage */
  }
}

/** The show command driver section. */
function cmd_show(): void {
  if (tokeneq(token(1), 'board')) ShowBoard();
  else if (tokeneq(token(1), 'rating')) {
    printf('My rating = %d\n', g.myrating);
    printf('Opponent rating = %d\n', g.opprating);
  } else if (tokeneq(token(1), 'time')) ShowTime();
  else if (tokeneq(token(1), 'moves')) {
    g.GenCnt = 0;
    TreePtr[2] = TreePtr[1];
    GenMoves(1);
    ShowMoveList(1);
    printf('No. of moves generated = %ld\n', g.GenCnt);
  } else if (tokeneq(token(1), 'escape')) {
    g.GenCnt = 0;
    TreePtr[2] = TreePtr[1];
    GenCheckEscapes(1);
    ShowMoveList(1);
    printf('No. of moves generated = %ld\n', g.GenCnt);
  } else if (tokeneq(token(1), 'noncapture')) {
    g.GenCnt = 0;
    TreePtr[2] = TreePtr[1];
    GenNonCaptures(1);
    FilterIllegalMoves(1);
    ShowMoveList(1);
    printf('No. of moves generated = %ld\n', g.GenCnt);
  } else if (tokeneq(token(1), 'capture')) {
    g.GenCnt = 0;
    TreePtr[2] = TreePtr[1];
    GenCaptures(1);
    FilterIllegalMoves(1);
    ShowMoveList(1);
    printf('No. of moves generated = %ld\n', g.GenCnt);
  } else if (tokeneq(token(1), 'eval') || tokeneq(token(1), 'score')) {
    printf("Command 'show eval/score' is currently not supported.\n");
    return;
  } else if (tokeneq(token(1), 'game')) ShowGame();
  else if (tokeneq(token(1), 'pin')) {
    printf("Command 'show pin' is currently not supported.\n");
    return;
  }
}

/** The test command driver section. */
function cmd_test(): void {
  printf("Command 'test' is currently not supported.\n");
}

/*
 * The help text: lines with command names are not indented, the explanations following them are.
 * The array is terminated by a null.
 */
const helpstr: (string | null)[] = [
  'quit',
  ' Quits the program.',
  'exit',
  ' In analysis mode this stops analysis, otherwise it quits the program.',
  'help',
  ' Produces a help blurb corresponding to this list of commands.',
  'book',
  ' add FILENAME - compiles book.bin from pgn book FILENAME',
  ' on - enables use of book (default)',
  ' off - disables use of book',
  ' worst - plays worst move from book',
  ' best - plays best move from book',
  " prefer - same as 'book on' (default)",
  ' random - plays any move from book',
  'version',
  ' Prints out the version of this program.',
  'previous',
  'p',
  ' Backs up one move in pgn loaded game.',
  'pgnsave FILENAME',
  ' Saves the game so far from memory to the file.',
  'pgnload FILENAME',
  ' Loads the game in the file into memory.',
  'pgnreplay FILENAME',
  " Loads the game in the file into memory, and enables\n the commands 'first', 'last', 'next', 'previous'.",
  'next',
  'n',
  ' Advances one move in pgn loaded game.',
  'first',
  ' Goes to begin position of pgn loaded game.',
  'last',
  ' Goes to end position of pgn loaded game.',
  'force',
  'manual',
  ' Makes the program stop moving. You may now enter moves\n to reach some position in the future.',
  ' ',
  'white',
  ' Program plays white.',
  'black',
  ' Program plays black.',
  'go',
  ' Computer takes whichever side is on move and begins its\n thinking immediately.',
  'post',
  ' Arranges for verbose thinking output showing variation, score,\n time, depth, etc.',
  'nopost',
  ' Turns off verbose thinking output.',
  'name NAME',
  ' Lets you input your name. Also writes the log.nnn and\n corresponding game.nnn files. For details please see\n the auxiliary file format sections.',
  'result',
  ' Mostly used by Internet Chess Server.',
  'activate',
  ' This command reactivates a game that has been terminated automatically\n due to checkmate or no more time on the clock. However, it does not\n alter those conditions. So you would have to undo a move or two, or\n add time to the clock with \'level\' or \'time\'.',
  'rating COMPUTERRATING OPPONENTRATING',
  ' Inputs the estimated rating for computer and for its opponent.',
  'new',
  ' Sets up a new game (i.e. pieces in original positions).',
  'time',
  ' Inputs time left in game for computer in hundredths of a second.\n Mostly used by Internet Chess Server.',
  'hash',
  ' on - enables using the memory hash table to speed up search',
  ' off - disables the memory hash table',
  'memory N',
  ' Sets the hash table to permit storage of N MB.',
  'null',
  ' on - enables using the null-move heuristic to speed up search',
  ' off - disables using the null-move heuristic',
  'xboard',
  ' on - enables use of xboard/winboard',
  ' off - disables use of xboard/winboard',
  'depth N',
  ' Sets the program to look N ply (half-moves) deep for every\n search it performs. If there is a checkmate or other condition\n that does not allow that depth, then it will not be.',
  'level MOVES MINUTES INCREMENT',
  ' Sets time control to be MOVES in MINUTES, with each move giving\n an INCREMENT (in seconds, i.e. a Fischer-style clock).',
  'load',
  'epdload',
  ' Loads a position in EPD format from disk into memory.',
  'save',
  'epdsave',
  ' Saves game position into EPD format from memory to disk.',
  'switch',
  ' Switches side to move.',
  'solve FILENAME',
  'solveepd FILENAME',
  ' Solves the positions in FILENAME.',
  'remove',
  ' Backs up two moves in game history.',
  'undo',
  ' Backs up one move in game history.',
  'usage',
  ' Displays command line syntax.',
  'show',
  ' board - displays the current board',
  ' time - displays the time settings',
  ' moves - shows all moves using one call to routine',
  ' escape - shows moves that escape from check using one call to routine',
  ' noncapture - shows non-capture moves',
  ' capture - shows capture moves',
  ' eval [or score] - shows the evaluation per piece and overall',
  ' game - shows moves in game history',
  ' pin - shows pinned pieces',
  'test',
  ' movelist - reads in an epd file and shows legal moves for its entries',
  ' capture - reads in an epd file and shows legal captures for its entries',
  ' movegenspeed - tests speed of move generator',
  ' capturespeed - tests speed of capture move generator',
  ' eval - reads in an epd file and shows evaluation for its entries',
  ' evalspeed - tests speed of the evaluator',
  'bk',
  ' Shows moves from opening book.',
  'graphic',
  ' Enables display board in graphic mode.',
  'nographic',
  ' Disables graphic mode and display classical view.',
  'coords',
  ' Displays the chessboard rank and file in both graphic and classical views.',
  'nocoords',
  ' Does not display the chessboard rank nor file in either mode (graphic nor classical).',
  null,
  null,
];

/** Display all the help commands. */
function cmd_help(): void {
  const t1 = token(1);
  if (t1.length > 0) {
    for (let p = 0; helpstr[p] !== null; p++) {
      const entry = helpstr[p] as string;
      if (entry.startsWith(t1)) {
        puts(entry);
        while (helpstr[++p] !== null && (helpstr[p] as string)[0] !== ' ') /* Skip aliases */;
        for (; helpstr[p] !== null && (helpstr[p] as string)[0] === ' '; p++) puts(helpstr[p] as string);
        return;
      }
    }
    printf("Help for command '%s' not found.\n\n", t1);
  }
  printf('List of commands: (help COMMAND to get more help)\n');
  let count = 0;
  for (let p = 0; helpstr[p] !== null; p++) {
    const entry = helpstr[p] as string;
    let len = entry.indexOf(' ');
    if (len < 0) len = entry.length;
    if (len > 0) {
      count += printf('%.*s  ', len, entry);
      if (count > 60) {
        count = 0;
        puts('');
      }
    }
  }
  puts('');
}

type Method = () => void | Generator<Wait, void, void>;
/* List commands we don't implement to avoid illegal moving them */
const commands: [string, Method][] = [
  ['?', cmd_movenow],
  ['accepted', cmd_accepted],
  ['activate', cmd_activate],
  ['analyze', cmd_analyze],
  ['bk', cmd_bk],
  ['black', cmd_black],
  ['book', cmd_book],
  ['depth', cmd_depth],
  ['easy', cmd_easy],
  ['edit', cmd_edit],
  ['epdload', cmd_load],
  ['epdsave', cmd_save],
  ['exit', cmd_exit],
  ['force', cmd_force],
  ['go', cmd_go],
  ['graphic', cmd_graphic],
  ['hard', cmd_hard],
  ['hash', cmd_hash],
  ['help', cmd_help],
  ['hint', cmd_hint],
  ['ics', cmd_ics],
  ['last', cmd_last],
  ['level', cmd_level],
  ['list', cmd_list],
  ['load', cmd_load],
  ['manual', cmd_manual],
  ['memory', cmd_memory],
  ['name', cmd_name],
  ['new', cmd_new],
  ['next', cmd_next],
  ['n', cmd_next],
  ['nographic', cmd_nographic],
  ['nopost', cmd_nopost],
  ['null', cmd_null],
  ['otim', cmd_otim],
  ['pgnload', cmd_pgnload],
  ['pgnreplay', cmd_pgnreplay],
  ['pgnsave', cmd_pgnsave],
  ['ping', cmd_ping],
  ['post', cmd_post],
  ['previous', cmd_previous],
  ['p', cmd_previous],
  ['first', cmd_first],
  ['protover', cmd_protover],
  ['quit', cmd_quit],
  ['random', cmd_random],
  ['rating', cmd_rating],
  ['rejected', cmd_rejected],
  ['remove', cmd_remove],
  ['result', cmd_result],
  ['save', cmd_save],
  ['setboard', cmd_setboard],
  ['show', cmd_show],
  ['solve', cmd_solve],
  ['solveepd', cmd_solve],
  ['st', cmd_st],
  ['switch', cmd_switch],
  ['test', cmd_test],
  ['time', cmd_time],
  ['undo', cmd_undo],
  ['usage', cmd_usage],
  ['usermove', cmd_usermove],
  ['variant', cmd_variant],
  ['version', cmd_version],
  ['white', cmd_white],
  ['xboard', cmd_xboard],
  ['coords', cmd_coords],
  ['nocoords', cmd_nocoords],
];

/** the commands that the online game does not let through (index.ts), by their names in the table */
export const commandNames = commands.map(([n]) => n);

/** This is the main user command interface driver. */
export function* parse_input(): Generator<Wait, void, void> {
  /* Initialize variables used to send messages to the engine */
  SetDataToEngine('');
  ExpectAnswerFromEngine(false);
  SetUserInputValidMove(0);
  ChangeColor(false);

  split_input();

  for (const [name, method] of commands) {
    if (tokeneq(token(0), name)) {
      const r = method();
      if (r) yield* r;
      return;
    }
  }

  /* OK, no known command, this should be a move */
  const cleanMove = { value: '' };
  const ptr = ValidateMove(token(0), cleanMove, afterToken(0));
  if (ptr !== -1) {
    play_user_move(ptr, token(0), cleanMove.value);
  } else {
    /* Must Output Illegal move to prevent Xboard accepting illegal en passant captures and other subtle mistakes */
    printf('Invalid move: %s\n', token(0));
  }
}
parser.parse_input = parse_input;

/**
 * When the board is changed by commands, call the Validation routine, and if it fails set flags to
 * prevent the analysis of illegal positions.
 */
export function check_board(): void {
  if (!ValidateBoard()) {
    g.flags |= ENDED;
    if (g.flags & XBOARD) printf('telluser Board is wrong!\n');
    else printf('Board is wrong!\n');
  }
}
