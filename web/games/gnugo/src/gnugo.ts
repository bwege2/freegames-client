// The GNU Go 3.8 program as it runs with `gnugo --mode ascii`: interface/main.c (the options it
// takes), interface/play_ascii.c (the ASCII board, every command, the end of the game, counting,
// free handicap), engine/interface.c (gameinfo, loading SGF games), engine/handicap.c (fixed
// handicap), engine/sgffile.c and engine/printutils.c. It talks to its terminal and its files only
// through Io, so it runs in a worker on the page and headless in the tests.
//
// The C code reads its lines into fixed buffers and splits them with strtok(); what it does with
// pointers into those buffers (`command += 10`, overwriting the newline of a file name, the buffer
// reused by `comment`) is kept by working on the same buffers here (CBuf).
import {
  BLACK, BOARDMAX, BOARDMIN, EMPTY, GRAY, MAX_BOARD, MAX_HANDICAP, MIN_BOARD, NO_MOVE, NORTH, OTHER_COLOR,
  ON_BOARD, ON_BOARD1, PASS_MOVE, POS, SOUTH, WHITE, I, J, IS_STONE, add_stone, black_captured, board, clear_board,
  g, get_last_move, get_last_player, init_board, is_allowed_move, is_ko, play_move, remove_stone, stones_on_board,
  undo_move, white_captured, set_board_ko_pos, ALLOWED, ALL_ALLOWED, FORBIDDEN, NONE, PSK, SIMPLE, SSK,
} from './engine/board.ts';
import { engine, estimate, genmove, get_level, set_level, score_with_dead, dead_group } from './engine/genmove.ts';
import { get_random_seed, update_random_seed } from './engine/random.ts';
import {
  type SGFNode, type SGFTree, VERSION, SgfParseError, atoi, get_moveX, get_moveY, readsgf, sgfAddStone,
  sgfGetFloatProperty, sgfGetIntProperty, sgfOverwritePropertyInt, sgf_write_header, sgftreeAddComment,
  sgftreeAddPlay, sgftreeBack, sgftreeCreateHeaderNode, sgftreeForward, sgftreeWriteResult, sgftree_clear,
  writesgf,
} from './sgf/sgf.ts';
import { COPYRIGHT, USAGE } from './usage.ts';

export interface Io {
  /** stdout */
  out(s: string): void;
  /** stderr */
  err(s: string): void;
  /** the next line typed, with its '\n'; null at end of input */
  readLine(): Promise<string | null>;
  /** fopen(name, "r"): the file's bytes, or null */
  readFile(name: string): Uint8Array | null;
  /** fopen(name, "w") and write: false when the file cannot be written */
  writeFile(name: string, data: Uint8Array): boolean;
  /** whether fopen(name, "w") would succeed */
  canWrite?(name: string): boolean;
  /** called while the computer thinks (simulations done, of total) */
  progress?(done: number, total: number): void;
  /** the time for the random seed, seconds */
  time?(): number;
}

export class Exit extends Error {
  status: number;
  constructor(status: number) {
    super(`exit ${status}`);
    this.status = status;
  }
}

const latin1 = (s: string): Uint8Array => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
const fromLatin1 = (b: Uint8Array): string => {
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
  return s;
};

/** printf("%.Nf") with C's rounding of exact ties (to even) */
export function cfix(x: number, digits: number): string {
  const s = x.toFixed(digits);
  const scaled = x * 10 ** digits;
  if (Math.abs(scaled - Math.trunc(scaled)) === 0.5) {
    const lo = Math.trunc(scaled);
    const even = lo % 2 === 0 ? lo : lo + Math.sign(scaled);
    const v = even / 10 ** digits;
    return (x < 0 && v === 0 ? '-' : '') + v.toFixed(digits);
  }
  return s;
}

const COLOR_NAMES = ['empty', 'white', 'black', 'gray', 'gray_white', 'gray_black', 'weak_ko'];
export const color_to_string = (c: number): string => COLOR_NAMES[c];

/** %1m */
export function m1(pos: number): string {
  if (pos === NO_MOVE) return 'PASS';
  if (!ON_BOARD1(pos)) return `[${pos}]`;
  const n = J(pos);
  return String.fromCharCode(n < 8 ? n + 65 : n + 66) + (g.board_size - I(pos));
}

/** printutils.c string_to_location() */
export function string_to_location(boardsize: number, str: string): number {
  if (str.length === 0) return NO_MOVE;
  const c = str[0];
  if (!/[A-Za-z]/.test(c)) return NO_MOVE;
  const lc = c.toLowerCase();
  let n = lc.charCodeAt(0) - 97;
  if (lc >= 'i') --n;
  if (n < 0 || n > boardsize - 1) return NO_MOVE;
  if (!/[0-9]/.test(str[1] ?? '')) return NO_MOVE;
  const m = boardsize - atoi(str.slice(1));
  if (m < 0 || m > boardsize - 1) return NO_MOVE;
  return POS(m, n);
}

// ---------------------------------------------------------------- C strings in fixed buffers

/** a char buffer: fgets() fills it, strtok() splits it, pointers are indices */
class CBuf {
  b: Uint8Array;
  constructor(size: number) {
    this.b = new Uint8Array(size);
  }
  /** the C string at i */
  str(i: number): string {
    let s = '';
    for (let k = i; k < this.b.length && this.b[k] !== 0; k++) s += String.fromCharCode(this.b[k]);
    return s;
  }
  strlen(i: number): number {
    let k = i;
    while (k < this.b.length && this.b[k] !== 0) k++;
    return k - i;
  }
}

/** strtok's saved position (one for the whole program, as in C) */
let strtok_buf: CBuf | null = null;
let strtok_pos = -1;

function strtok(buf: CBuf | null, start: number, delim: string): number | null {
  if (buf) {
    strtok_buf = buf;
    strtok_pos = start;
  }
  // glibc's strtok: at the end of the string it keeps a pointer to the terminating NUL, so a later
  // call reads whatever has been written into the buffer since
  const b = strtok_buf;
  if (!b || strtok_pos < 0) return null;
  let p = strtok_pos;
  const at = (i: number): number => (i < b.b.length ? b.b[i] : 0);
  const isDelim = (c: number): boolean => delim.includes(String.fromCharCode(c));
  if (at(p) === 0) return null;
  while (at(p) !== 0 && isDelim(at(p))) p++;
  if (at(p) === 0) {
    strtok_pos = p;
    return null;
  }
  const tok = p;
  while (at(p) !== 0 && !isDelim(at(p))) p++;
  if (at(p) === 0) strtok_pos = p;
  else {
    b.b[p] = 0;
    strtok_pos = p + 1;
  }
  return tok;
}

// ---------------------------------------------------------------- the program

interface Gameinfo {
  handicap: number;
  to_move: number;
  computer_player: number;
}

// enum commands
const INVALID = -1, END = 0, EXIT = 1, QUIT = 2, RESIGN = 3, PASS = 4, MOVE = 5, FORCE = 6, SWITCH = 7,
  PLAY = 8, PLAYBLACK = 9, PLAYWHITE = 10, SETHANDICAP = 11, FREEHANDICAP = 12, SETBOARDSIZE = 13, SETKOMI = 14,
  SETDEPTH = 15, INFO = 16, DISPLAY = 17, SHOWBOARD = 18, HELP = 19, UNDO = 20, COMMENT = 21, SCORE = 22,
  CMD_DEAD = 23, CMD_BACK = 24, CMD_FORWARD = 25, CMD_LAST = 26, CMD_CAPTURE = 27, CMD_DEFEND = 28,
  CMD_HELPDEBUG = 29, CMD_SHOWAREA = 30, CMD_SHOWMOYO = 31, CMD_SHOWTERRI = 32, CMD_GOTO = 33, CMD_SAVE = 34,
  CMD_LOAD = 35, CMD_SHOWDRAGONS = 36, CMD_LISTDRAGONS = 37, SETLEVEL = 38, NEW = 39, COUNT = 40, CONTINUE = 41;

const DEBUG_COMMANDS =
  'capture <pos>    try to capture indicated group\n' +
  'dead             Toggle display of dead stones\n' +
  'defend <pos>     try to defend indicated group\n' +
  'listdragons      print dragon info \n' +
  'showarea         display area\n' +
  'showdragons      display dragons\n' +
  'showmoyo         display moyo\n' +
  'showterri        display territory\n';

const NO_SCORE = 4711;

/** sscanf(s, "%d"): the number, or null */
function scanInt(s: string): number | null {
  const m = /^\s*([+-]?\d+)/.exec(s);
  return m ? parseInt(m[1], 10) | 0 : null;
}
/** sscanf(s, "%f") */
function scanFloat(s: string): number | null {
  const m = /^\s*([+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?|[+-]?(inf|infinity|nan))/i.exec(s);
  return m ? Math.fround(parseFloat(m[1])) : null;
}

export class GnuGo {
  io: Io;
  // play_ascii.c statics
  opt_showboard = true;
  showdead = false;
  sgftree: SGFTree = { root: null, lastnode: null };
  resignation_allowed = true;
  current_score_estimate = NO_SCORE;
  sgf_initialized = false;
  hspot_size = 0;
  hspots: string[][] = [];
  // globals.c
  showscore = false;
  mandated_depth = -1;
  quiet = false;
  /** the game started (main() got as far as play_ascii) */
  played = false;
  /** the dead stones as the last count or estimate has them (the original's dragon statuses) */
  dead: Uint8Array = new Uint8Array(BOARDMAX);
  dead_position = -1;

  constructor(io: Io) {
    this.io = io;
  }

  printf(s: string): void {
    this.io.out(s);
  }

  // ------------------------------------------------ input
  private pending = '';
  private eof = false;

  /** fgets(buf, size, stdin): false at end of input */
  async fgets(buf: CBuf, size: number): Promise<boolean> {
    let s = '';
    while (s.length < size - 1) {
      if (this.pending.length === 0) {
        if (this.eof) break;
        const line = await this.io.readLine();
        if (line === null) {
          this.eof = true;
          break;
        }
        this.pending = line;
      }
      const ch = this.pending[0];
      this.pending = this.pending.slice(1);
      s += ch;
      if (ch === '\n') break;
    }
    if (s.length === 0) return false;
    for (let k = 0; k < s.length; k++) buf.b[k] = s.charCodeAt(k) & 0xff;
    buf.b[s.length] = 0;
    return true;
  }

  // ------------------------------------------------ main()
  async main(argv: string[]): Promise<number> {
    try {
      return await this.run(argv);
    } catch (e) {
      if (e instanceof Exit) return e.status;
      throw e;
    }
  }

  private async run(argv: string[]): Promise<number> {
    const gameinfo: Gameinfo = { handicap: 0, to_move: BLACK, computer_player: WHITE };
    let mandated_color = EMPTY;
    let infilename: string | null = null;
    let untilstring: string | null = null;
    let seed = 0;
    let seed_specified = false;
    let requested_boardsize = -1;
    const stderr = (s: string): void => this.io.err(s);
    const tryHelp = (): never => {
      stderr("Try `gnugo --help' for more information.\n");
      throw new Exit(1);
    };

    // engine/globals.c and clock.c defaults, gameinfo_clear()
    g.board_size = MAX_BOARD;
    g.komi = 0;
    g.suicide_rule = FORBIDDEN;
    g.ko_rule = SIMPLE;
    engine.level = 10;
    engine.mc_games_per_level = 8000;
    engine.chinese_rules = false;

    const takesArg = new Set([
      'boardsize', 'handicap', 'komi', 'color', 'level', 'seed', 'infile', 'until', 'mode', 'mc-games-per-level',
    ]);
    const shortArg: Record<string, string> = { l: 'infile', L: 'until', r: 'seed' };
    for (let k = 0; k < argv.length; k++) {
      const a = argv[k];
      let name: string;
      let value: string | null = null;
      if (a.startsWith('--')) {
        const eq = a.indexOf('=');
        name = eq >= 0 ? a.slice(2, eq) : a.slice(2);
        if (eq >= 0) value = a.slice(eq + 1);
        if (name === 'silent') name = 'quiet';
        if (name === 'help') name = 'h';
        if (name === 'version') name = 'v';
      } else if (a.startsWith('-') && a.length > 1) {
        const c = a[1];
        if (shortArg[c]) {
          name = shortArg[c];
          if (a.length > 2) value = a.slice(2);
        } else if (c === 'h' || c === 'v') name = c;
        else {
          stderr(`gnugo: invalid option -- '${c}'\n`);
          tryHelp();
          return 1;
        }
      } else {
        // a non-option argument is the file to load (getopt's 1)
        infilename = a;
        continue;
      }
      if (takesArg.has(name) && value === null) {
        if (k + 1 >= argv.length) {
          stderr(`gnugo: option \`--${name}' requires an argument\n`);
          tryHelp();
        }
        value = argv[++k];
      }
      const v = value ?? '';
      switch (name) {
        case 'boardsize':
          requested_boardsize = atoi(v);
          break;
        case 'handicap': {
          const h = atoi(v);
          if (h < 0 || h > MAX_HANDICAP) {
            stderr(`Unsupported handicap: ${h}.\n`);
            tryHelp();
          }
          gameinfo.handicap = h;
          break;
        }
        case 'komi': {
          const k2 = scanFloat(v);
          if (k2 === null) {
            stderr(`Invalid komi selection: ${v}\n`);
            tryHelp();
          }
          g.komi = k2!;
          break;
        }
        case 'color':
          if (v === 'white') mandated_color = WHITE;
          else if (v === 'black') mandated_color = BLACK;
          else {
            stderr(`Invalid color selection: ${v}\n`);
            tryHelp();
          }
          break;
        case 'level':
          set_level(atoi(v));
          break;
        case 'seed':
          seed = atoi(v);
          seed_specified = true;
          break;
        case 'infile':
          infilename = v;
          break;
        case 'until':
          untilstring = v;
          break;
        case 'mode':
          if (v !== 'ascii') {
            if (v === 'gtp' || v === 'gmp' || v === 'sgmp') {
              stderr(`gnugo: mode ${v} is not available in this port\n`);
              throw new Exit(1);
            }
            stderr(`Invalid mode selection: ${v}\n`);
            tryHelp();
          }
          break;
        case 'mc-games-per-level':
          engine.mc_games_per_level = atoi(v);
          break;
        case 'monte-carlo':
          break;
        case 'quiet':
          this.quiet = true;
          break;
        case 'chinese-rules':
          engine.chinese_rules = true;
          break;
        case 'japanese-rules':
          engine.chinese_rules = false;
          break;
        case 'forbid-suicide':
          g.suicide_rule = FORBIDDEN;
          break;
        case 'allow-suicide':
          g.suicide_rule = ALLOWED;
          break;
        case 'allow-all-suicide':
          g.suicide_rule = ALL_ALLOWED;
          break;
        case 'simple-ko':
          g.ko_rule = SIMPLE;
          break;
        case 'no-ko':
          g.ko_rule = NONE;
          break;
        case 'positional-superko':
          g.ko_rule = PSK;
          break;
        case 'situational-superko':
          g.ko_rule = SSK;
          break;
        case 'never-resign':
        case 'resign-allowed':
          break;
        case 'copyright':
          this.printf(COPYRIGHT);
          return 0;
        case 'v':
          this.printf(`GNU Go ${VERSION}\n`);
          this.printf(COPYRIGHT);
          return 0;
        case 'h':
          this.printf(`GNU Go ${VERSION}\n`);
          this.printf(USAGE);
          return 0;
        default:
          stderr(`gnugo: option \`--${name}' is not available in this port\n`);
          tryHelp();
      }
    }

    if (requested_boardsize !== -1) {
      if (!this.check_boardsize(requested_boardsize, stderr)) throw new Exit(1);
      g.board_size = requested_boardsize;
    }
    if (!seed_specified) seed = Math.trunc(this.io.time ? this.io.time() : Date.now() / 1000);
    init_board(seed);

    if (infilename) {
      if (!this.sgftree_readfile(this.sgftree, infilename)) {
        stderr(`Cannot open or parse '${infilename}'\n`);
        throw new Exit(1);
      }
      if (this.gameinfo_play_sgftree(gameinfo, this.sgftree, untilstring) === EMPTY) {
        stderr(`Cannot load '${infilename}'\n`);
        throw new Exit(1);
      }
    } else sgftreeCreateHeaderNode(this.sgftree, g.board_size, g.komi, g.handicap);

    if (mandated_color !== EMPTY) gameinfo.computer_player = OTHER_COLOR(mandated_color);
    if (!this.quiet) {
      this.printf(`GNU Go ${VERSION}\n`);
      this.printf(COPYRIGHT);
    }
    this.played = true;
    await this.play_ascii(gameinfo, infilename, untilstring);
    return 0;
  }

  /** engine/interface.c check_boardsize() */
  check_boardsize(boardsize: number, out: ((s: string) => void) | null): boolean {
    const max_board = MAX_BOARD;
    if (boardsize < MIN_BOARD || boardsize > max_board) {
      if (out) {
        out(`Unsupported board size: ${boardsize}. `);
        if (boardsize < MIN_BOARD) out(`Min size is ${MIN_BOARD}.\n`);
        else out(`Max size is ${max_board}.\n`);
        out("Try `gnugo --help' for more information.\n");
      }
      return false;
    }
    return true;
  }

  // ------------------------------------------------ sgf files
  sgftree_readfile(tree: SGFTree, name: string): boolean {
    const data = this.io.readFile(name);
    if (!data) return false;
    try {
      const r = readsgf(data);
      if (r.warnings) this.io.err(r.warnings);
      tree.root = r.root;
      tree.lastnode = null;
      return true;
    } catch (e) {
      if (e instanceof SgfParseError) {
        // parse_error(): the original prints the message and exits
        this.io.err(e.message + '\n');
        throw new Exit(1);
      }
      throw e;
    }
  }

  writesgf(root: SGFNode, name: string): boolean {
    // fopen() fails before anything is written (an empty name, a name the storage does not take)
    if (name === '' || (this.io.canWrite && !this.io.canWrite(name))) {
      this.io.err(`Can not open ${name}\n`);
      return false;
    }
    const text = writesgf(root);
    if (!this.io.writeFile(name, latin1(text))) {
      this.io.err(`Can not open ${name}\n`);
      return false;
    }
    return true;
  }

  // ------------------------------------------------ engine/interface.c
  gnugo_play_move(move: number, color: number): void {
    play_move(move, color);
  }

  gameinfo_clear(gameinfo: Gameinfo): void {
    clear_board();
    gameinfo.handicap = 0;
    gameinfo.to_move = BLACK;
    gameinfo.computer_player = WHITE;
  }

  gameinfo_print(gameinfo: Gameinfo): void {
    this.printf(`Board Size:   ${g.board_size}\n`);
    this.printf(`Handicap      ${gameinfo.handicap}\n`);
    this.printf(`Komi:         ${cfix(g.komi, 1)}\n`);
    this.printf(`Move Number:  ${g.movenum}\n`);
    this.printf(`To Move:      ${color_to_string(gameinfo.to_move)}\n`);
    this.printf('Computer player: ');
    if (gameinfo.computer_player === WHITE) this.printf('White\n');
    else if (gameinfo.computer_player === BLACK) this.printf('Black\n');
    else if (gameinfo.computer_player === EMPTY) this.printf('Both (solo)\n');
    else this.printf('Nobody\n');
  }

  get_sgfmove(prop: { value: string }): number {
    return POS(get_moveX(prop as never, g.board_size), get_moveY(prop as never, g.board_size));
  }

  gnugo_play_sgfnode(node: SGFNode, to_move: number): number {
    for (const prop of node.props) {
      switch (prop.name) {
        case 'AB':
          add_stone(this.get_sgfmove(prop), BLACK);
          break;
        case 'AW':
          add_stone(this.get_sgfmove(prop), WHITE);
          break;
        case 'PL':
          to_move = prop.value[0] === 'w' || prop.value[0] === 'W' ? WHITE : BLACK;
          break;
        case 'W ':
        case 'B ':
          to_move = prop.name === 'W ' ? WHITE : BLACK;
          this.gnugo_play_move(this.get_sgfmove(prop), to_move);
          to_move = OTHER_COLOR(to_move);
          break;
      }
    }
    return to_move;
  }

  gameinfo_play_sgftree(gameinfo: Gameinfo, tree: SGFTree, untilstr: string | null): number {
    let next = BLACK;
    let untilmove = -1;
    let until = 9999;
    let bs = sgfGetIntProperty(tree.root!, 'SZ');
    if (bs === null) bs = 19;
    if (!this.check_boardsize(bs, (s) => this.io.err(s))) return EMPTY;
    g.handicap = 0;
    const ha = sgfGetIntProperty(tree.root!, 'HA');
    if (ha !== null) {
      g.handicap = ha;
      if (ha > 1) next = WHITE;
    }
    gameinfo.handicap = g.handicap;
    if (g.handicap > bs * bs - 1 || g.handicap < 0) {
      this.io.err(` Handicap HA[${g.handicap}] is unreasonable.\n Modify SGF file.\n`);
      return EMPTY;
    }
    g.board_size = bs;
    clear_board();
    const km = sgfGetFloatProperty(tree.root!, 'KM');
    if (km === null) g.komi = gameinfo.handicap === 0 ? 5.5 : 0.5;
    else g.komi = km;
    if (untilstr) {
      if (untilstr[0] > '0' && untilstr[0] <= '9') until = atoi(untilstr);
      else untilmove = string_to_location(g.board_size, untilstr);
    }
    for (tree.lastnode = null; sgftreeForward(tree); ) {
      for (const prop of tree.lastnode!.props) {
        switch (prop.name) {
          case 'AB':
          case 'AW': {
            const move = this.get_sgfmove(prop);
            if (board[move] !== EMPTY)
              this.io.err(`Illegal SGF! attempt to add a stone at occupied point ${m1(move)}\n`);
            else add_stone(move, prop.name === 'AB' ? BLACK : WHITE);
            break;
          }
          case 'PL':
            if (prop.value[0] === 'w' || prop.value[0] === 'W' || prop.value[0] === '2') next = WHITE;
            else next = BLACK;
            if (stones_on_board(GRAY) === 0 && next === WHITE) {
              this.place_fixed_handicap(gameinfo.handicap);
              sgfOverwritePropertyInt(tree.root!, 'HA', g.handicap);
            }
            break;
          case 'W ':
          case 'B ': {
            next = prop.name === 'W ' ? WHITE : BLACK;
            if (stones_on_board(GRAY) === 0 && next === WHITE) {
              this.place_fixed_handicap(gameinfo.handicap);
              sgfOverwritePropertyInt(tree.root!, 'HA', g.handicap);
            }
            const move = this.get_sgfmove(prop);
            if (move === untilmove || g.movenum === until - 1) {
              gameinfo.to_move = next;
              sgftreeBack(tree);
              return next;
            }
            if (move === PASS_MOVE || board[move] === EMPTY) {
              this.gnugo_play_move(move, next);
              next = OTHER_COLOR(next);
            } else {
              this.io.err('WARNING: Move off board or on occupied position found in sgf-file.\n');
              this.io.err(`Move at ${m1(move)} ignored, trying to proceed.\n`);
              gameinfo.to_move = next;
              return next;
            }
            break;
          }
          case 'IL': {
            const move = this.get_sgfmove(prop);
            if (g.board_size > 1) {
              let move_color;
              if (ON_BOARD(NORTH(move))) move_color = OTHER_COLOR(board[NORTH(move)]);
              else move_color = OTHER_COLOR(board[SOUTH(move)]);
              if (IS_STONE(move_color) && is_ko(move, move_color)) set_board_ko_pos(move);
            }
            break;
          }
        }
      }
    }
    gameinfo.to_move = next;
    return next;
  }

  // ------------------------------------------------ engine/handicap.c
  place_fixed_handicap(desired_handicap: number): number {
    const places = [[2, -2], [-2, 2], [2, 2], [-2, -2], [0, 2], [0, -2], [2, 0], [-2, 0], [0, 0]];
    const bs = g.board_size;
    const three = bs > 11 ? 3 : 2;
    const mid = Math.trunc(bs / 2);
    if (desired_handicap < 2) {
      g.handicap = 0;
      return 0;
    }
    let max_handicap;
    if (bs % 2 === 1 && bs >= 9) max_handicap = 9;
    else if (bs >= 7) max_handicap = 4;
    else max_handicap = 0;
    g.handicap = desired_handicap > max_handicap ? max_handicap : desired_handicap;
    let remaining_stones = g.handicap;
    if (desired_handicap === 5 || desired_handicap === 7) {
      add_stone(POS(mid, mid), BLACK);
      remaining_stones--;
    }
    for (let r = 0; r < remaining_stones; r++) {
      let i = places[r][0];
      let j = places[r][1];
      if (i === 2) i = three;
      else if (i === 0) i = mid;
      else if (i === -2) i = bs - 1 - three;
      if (j === 2) j = three;
      else if (j === 0) j = mid;
      else if (j === -2) j = bs - 1 - three;
      add_stone(POS(i, j), BLACK);
    }
    return g.handicap;
  }

  /**
   * engine/handicap.c place_free_handicap(): the original places the stones with its handicap
   * patterns and the aftermath code (not ported); the port places them at the fixed points as far as
   * they go (README).
   */
  place_free_handicap(desired_handicap: number): number {
    if (desired_handicap === 0) {
      g.handicap = 0;
      return 0;
    }
    return this.place_fixed_handicap(desired_handicap);
  }

  // ------------------------------------------------ engine/sgffile.c
  sgffile_recordboard(node: SGFNode | null): void {
    if (node)
      for (let i = 0; i < g.board_size; i++)
        for (let j = 0; j < g.board_size; j++) if (board[POS(i, j)] === BLACK) sgfAddStone(node, BLACK, i, j);
  }

  // ------------------------------------------------ the score (README: the port's estimate)
  examine_dead(): void {
    if (this.dead_position === g.position_number) return;
    const est = estimate(BLACK);
    this.dead = est.dead;
    this.dead_position = g.position_number;
  }

  dragon_status_dead(pos: number): boolean {
    this.examine_dead();
    return this.dead[pos] === 1;
  }

  /** engine/utils.c who_wins(): "Result: W+3.5   " */
  who_wins(): number {
    this.examine_dead();
    const result = score_with_dead(this.dead);
    if (result === 0.0) this.printf('Result: jigo   ');
    else this.printf(`Result: ${result > 0.0 ? 'W' : 'B'}+${cfix(Math.abs(result), 1)}   `);
    return result;
  }

  // ------------------------------------------------ play_ascii.c
  make_letterbar(boardsize: number): string {
    let letterbar = '   ';
    for (let i = 0; i < boardsize; i++) {
      let letteroffset = 65;
      if (i + letteroffset >= 73) letteroffset++;
      letterbar += ' ' + String.fromCharCode(i + letteroffset);
    }
    return letterbar;
  }

  set_handicap_spots(boardsize: number): void {
    if (this.hspot_size === boardsize) return;
    this.hspot_size = boardsize;
    this.hspots = [];
    for (let i = 0; i < MAX_BOARD; i++) this.hspots.push(new Array(MAX_BOARD).fill('.'));
    const h = this.hspots;
    if (boardsize === 5) {
      h[1][1] = '+';
      h[boardsize - 2][1] = '+';
      h[1][boardsize - 2] = '+';
      h[boardsize - 2][boardsize - 2] = '+';
      h[Math.trunc(boardsize / 2)][Math.trunc(boardsize / 2)] = '+';
      return;
    }
    const mid = Math.trunc(boardsize / 2);
    if (!(boardsize % 2)) {
      if (boardsize > 2 && boardsize < 12) {
        h[2][2] = '+';
        h[boardsize - 3][2] = '+';
        h[2][boardsize - 3] = '+';
        h[boardsize - 3][boardsize - 3] = '+';
      } else {
        h[3][3] = '+';
        h[boardsize - 4][3] = '+';
        h[3][boardsize - 4] = '+';
        h[boardsize - 4][boardsize - 4] = '+';
      }
    } else {
      if (boardsize > 2 && boardsize < 12) {
        h[2][2] = '+';
        h[boardsize - 3][2] = '+';
        h[2][boardsize - 3] = '+';
        h[boardsize - 3][boardsize - 3] = '+';
        h[mid][mid] = '+';
      } else if (boardsize > 12) {
        h[3][3] = '+';
        h[boardsize - 4][3] = '+';
        h[3][boardsize - 4] = '+';
        h[boardsize - 4][boardsize - 4] = '+';
        h[3][mid] = '+';
        h[mid][3] = '+';
        h[mid][boardsize - 4] = '+';
        h[boardsize - 4][mid] = '+';
        h[mid][mid] = '+';
      }
    }
  }

  ascii_showboard(): void {
    const bs = g.board_size;
    const last_move = get_last_move();
    const letterbar = this.make_letterbar(bs);
    this.set_handicap_spots(bs);
    let o = '\n';
    o += `    White (O) has captured ${black_captured()} pieces\n`;
    o += `    Black (X) has captured ${white_captured()} pieces\n`;
    if (this.showscore) {
      if (this.current_score_estimate === NO_SCORE) o += '    No score estimate is available yet.\n';
      else if (this.current_score_estimate < 0) o += `    Estimated score: Black is ahead by ${-this.current_score_estimate}\n`;
      else if (this.current_score_estimate > 0) o += `    Estimated score: White is ahead by ${this.current_score_estimate}\n`;
      else o += '    Estimated score: Even!\n';
    }
    o += '\n';
    o += letterbar;
    if (get_last_player() !== EMPTY)
      o += `        Last move: ${get_last_player() === WHITE ? 'White' : 'Black'} ${m1(last_move)}`;
    o += '\n';
    const p2 = (n: number): string => String(n).padStart(2, ' ');
    for (let i = 0; i < bs; i++) {
      o += ' ' + p2(bs - i);
      let last_pos_was_move = 0;
      for (let j = 0; j < bs; j++) {
        const pos = POS(i, j);
        const pos_is_move = pos === last_move ? 128 : 0;
        const dead = this.showdead && IS_STONE(board[pos]) && this.dragon_status_dead(pos);
        switch (board[pos] + pos_is_move + last_pos_was_move) {
          case EMPTY + 128:
          case EMPTY:
            o += ' ' + this.hspots[i][j];
            last_pos_was_move = 0;
            break;
          case BLACK:
            o += ' ' + (dead ? 'x' : 'X');
            last_pos_was_move = 0;
            break;
          case WHITE:
            o += ' ' + (dead ? 'o' : 'O');
            last_pos_was_move = 0;
            break;
          case BLACK + 128:
            o += '(X)';
            last_pos_was_move = 256;
            break;
          case WHITE + 128:
            o += '(O)';
            last_pos_was_move = 256;
            break;
          case EMPTY + 256:
            o += this.hspots[i][j];
            last_pos_was_move = 0;
            break;
          case BLACK + 256:
            o += dead ? 'x' : 'X';
            last_pos_was_move = 0;
            break;
          case WHITE + 256:
            o += dead ? 'o' : 'O';
            last_pos_was_move = 0;
            break;
        }
      }
      if (last_pos_was_move === 0) o += bs > 10 ? ' ' + p2(bs - i) : ' ' + (bs - i);
      else o += bs > 10 ? p2(bs - i) : String(bs - i);
      o += '\n';
    }
    o += letterbar + '\n\n';
    this.printf(o);
  }

  show_commands(): void {
    this.printf(
      '\nCommands:\n' +
        ' back                Take back your last move\n' +
        ' boardsize           Set boardsize (on move 1 only)\n' +
        ' comment             Write a comment to outputfile\n' +
        ' depth <num>         Set depth for reading\n' +
        ' display             Display game board\n' +
        ' exit                Exit GNU Go\n' +
        ' force <move>        Force a move for current color\n' +
        ' forward             Go to next node in game tree\n' +
        ' goto <movenum>      Go to movenum in game tree\n' +
        ' level <amount>      Playing level (default = 10)\n' +
        ' handicap <num>      Set fixed handicap (on move 1 only)\n' +
        ' freehandicap <num>  Place free handicap (on move 1 only)\n' +
        '                     Omit <num> to place handicap yourself\n' +
        ' help                Display this help menu\n' +
        ' helpdebug           Display debug help menu\n' +
        ' info                Display program settings\n' +
        ' komi                Set komi (on move 1 only)\n' +
        ' last                Goto last node in game tree\n' +
        ' pass                Pass on your move\n' +
        ' play <num>          Play <num> moves\n' +
        ' playblack           Play as Black (switch if White)\n' +
        ' playwhite           Play as White (switch if Black)\n' +
        ' quit                Exit GNU Go\n' +
        ' resign              Resign the current game\n' +
        ' save <file>         Save the current game\n' +
        ' load <file>         Load a game from file\n' +
        ' score               Toggle display of score On/Off\n' +
        ' showboard           Toggle display of board On/Off\n' +
        ' switch              Switch the color you are playing\n' +
        ' undo                Take the last move back (same as back)\n' +
        ' <move>              A move of the format <letter><number>' +
        '\n',
    );
  }

  get_command(command: string): number {
    // sscanf(command, "%c%d", &c, &d) == 2 and c a letter other than I
    if (command.length >= 1 && /^\s*[+-]?\d/.test(command.slice(1))) {
      const c = command[0].toUpperCase();
      if (c >= 'A' && c <= 'Z' && c !== 'I') return MOVE;
    }
    if (command[0] === '?') return HELP;
    while (command[0] === ' ') command = command.slice(1);
    const is = (s: string, n: number): boolean => command.slice(0, n) === s.slice(0, n);
    if (is('playblack', 9)) return PLAYBLACK;
    if (is('playwhite', 9)) return PLAYWHITE;
    if (is('showboard', 9)) return SHOWBOARD;
    if (is('showdragons', 9)) return CMD_SHOWDRAGONS;
    if (is('listdragons', 9)) return CMD_LISTDRAGONS;
    if (is('boardsize', 9)) return SETBOARDSIZE;
    if (is('freehandicap', 9)) return FREEHANDICAP;
    if (is('handicap', 5)) return SETHANDICAP;
    if (is('display', 7)) return DISPLAY;
    if (is('helpdebug', 7)) return CMD_HELPDEBUG;
    if (is('resign', 6)) return RESIGN;
    if (is('showmoyo', 6)) return CMD_SHOWMOYO;
    if (is('showterri', 6)) return CMD_SHOWTERRI;
    if (is('showarea', 6)) return CMD_SHOWAREA;
    if (is('depth', 5)) return SETDEPTH;
    if (is('switch', 5)) return SWITCH;
    if (is('komi', 4)) return SETKOMI;
    if (is('play', 4)) return PLAY;
    if (is('info', 4)) return INFO;
    if (is('force', 4)) return FORCE;
    if (is('level', 5)) return SETLEVEL;
    if (is('pass', 4)) return PASS;
    if (is('save', 3)) return CMD_SAVE;
    if (is('load', 3)) return CMD_LOAD;
    if (is('end', 3)) return END;
    if (is('move', 3)) return MOVE;
    if (is('undo', 3)) return UNDO;
    if (is('comment', 3)) return COMMENT;
    if (is('score', 3)) return SCORE;
    if (is('dead', 3)) return CMD_DEAD;
    if (is('capture', 3)) return CMD_CAPTURE;
    if (is('defend', 3)) return CMD_DEFEND;
    if (is('exit', 4)) return EXIT;
    if (is('quit', 4)) return QUIT;
    if (is('help', 1)) return HELP;
    if (is('back', 2)) return CMD_BACK;
    if (is('forward', 2)) return CMD_FORWARD;
    if (is('last', 2)) return CMD_LAST;
    if (is('goto', 2)) return CMD_GOTO;
    if (is('game', 2)) return NEW;
    if (is('count', 3)) return COUNT;
    if (is('continue', 4)) return CONTINUE;
    return INVALID;
  }

  init_sgf(ginfo: Gameinfo): void {
    if (this.sgf_initialized) return;
    this.sgf_initialized = true;
    sgf_write_header(this.sgftree.root!, true, get_random_seed(), g.komi, ginfo.handicap, get_level(), engine.chinese_rules);
    if (ginfo.handicap > 0) this.sgffile_recordboard(this.sgftree.root);
  }

  computer_move(gameinfo: Gameinfo, passes: { n: number }): number {
    this.init_sgf(gameinfo);
    const r = genmove(gameinfo.to_move, this.io.progress);
    const move = r.move;
    if (this.showscore) {
      const est = estimate(gameinfo.to_move);
      this.current_score_estimate = Math.trunc(est.score);
    }
    this.printf(`${color_to_string(gameinfo.to_move)}(${g.movenum + 1}): ${m1(move)}\n`);
    if (move === PASS_MOVE) passes.n++;
    else passes.n = 0;
    this.gnugo_play_move(move, gameinfo.to_move);
    sgftreeAddPlay(this.sgftree, gameinfo.to_move, I(move), J(move));
    gameinfo.to_move = OTHER_COLOR(gameinfo.to_move);
    return 0;
  }

  do_move(gameinfo: Gameinfo, command: string, passes: { n: number }, force: boolean): number {
    const move = string_to_location(g.board_size, command);
    if (move === NO_MOVE) {
      this.printf(`\nInvalid move: ${command}\n`);
      return 0;
    }
    if (!is_allowed_move(move, gameinfo.to_move)) {
      this.printf(`\nIllegal move: ${command}`);
      return 0;
    }
    passes.n = 0;
    this.init_sgf(gameinfo);
    this.gnugo_play_move(move, gameinfo.to_move);
    sgftreeAddPlay(this.sgftree, gameinfo.to_move, I(move), J(move));
    if (this.opt_showboard) {
      this.ascii_showboard();
      this.printf('GNU Go is thinking...\n');
    }
    if (force) {
      gameinfo.computer_player = OTHER_COLOR(gameinfo.computer_player);
      gameinfo.to_move = OTHER_COLOR(gameinfo.to_move);
      sgftreeAddComment(this.sgftree, 'forced');
      return 0;
    }
    gameinfo.to_move = OTHER_COLOR(gameinfo.to_move);
    return this.computer_move(gameinfo, passes);
  }

  do_pass(gameinfo: Gameinfo, passes: { n: number }, force: boolean): number {
    passes.n++;
    this.init_sgf(gameinfo);
    this.gnugo_play_move(PASS_MOVE, gameinfo.to_move);
    sgftreeAddPlay(this.sgftree, gameinfo.to_move, -1, -1);
    gameinfo.to_move = OTHER_COLOR(gameinfo.to_move);
    if (force) {
      gameinfo.computer_player = OTHER_COLOR(gameinfo.computer_player);
      sgftreeAddComment(this.sgftree, 'forced');
      return 0;
    }
    return this.computer_move(gameinfo, passes);
  }

  async play_ascii(gameinfo: Gameinfo, filename: string | null, until: string | null): Promise<void> {
    if (filename) {
      this.gameinfo_play_sgftree(gameinfo, this.sgftree, until);
      this.sgf_initialized = true;
    } else {
      const sz = sgfGetIntProperty(this.sgftree.root!, 'SZ');
      if (sz !== null) {
        g.board_size = sz;
        clear_board();
      }
      if (gameinfo.handicap === 0) gameinfo.to_move = BLACK;
      else {
        gameinfo.handicap = this.place_fixed_handicap(gameinfo.handicap);
        gameinfo.to_move = WHITE;
      }
      this.sgf_initialized = false;
    }
    await this.do_play_ascii(gameinfo);
    this.printf('\nThanks! for playing GNU Go.\n\n');
  }

  async do_play_ascii(gameinfo: Gameinfo): Promise<void> {
    const passes = { n: 0 };
    const line = new CBuf(80);
    let state = 1;
    while (state === 1) {
      state = 0;
      this.current_score_estimate = NO_SCORE;
      this.resignation_allowed = true;
      this.printf('\nBeginning ASCII mode game.\n\n');
      this.gameinfo_print(gameinfo);
      if (gameinfo.computer_player === gameinfo.to_move) state = this.computer_move(gameinfo, passes);

      while (state === 0) {
        if (this.opt_showboard) this.ascii_showboard();
        this.printf(`${color_to_string(gameinfo.to_move)}(${g.movenum + 1}): `);
        if (!(await this.fgets(line, 80))) return;
        let first = true;
        while (state === 0) {
          const tok = first ? strtok(line, 0, ';') : strtok(null, 0, ';');
          first = false;
          if (tok === null) break;
          // `command` is a pointer into whichever buffer strtok works on
          const cb = strtok_buf!;
          const cmd = cb.str(tok);
          state = await this.command(gameinfo, passes, cb, tok, cmd, line);
          if (state === -2) return;
          if (passes.n >= 2) state = await this.ascii_endgame(gameinfo, 0);
        }
      }

      passes.n = 0;
      update_random_seed();
      sgftree_clear(this.sgftree);
      sgftreeCreateHeaderNode(this.sgftree, g.board_size, g.komi, gameinfo.handicap);
      this.sgf_initialized = false;
      this.gameinfo_clear(gameinfo);
    }
  }

  /** one command of the main loop; returns the new state, -2 for `return` */
  private async command(
    gameinfo: Gameinfo, passes: { n: number }, cb: CBuf, tok: number, command: string, line: CBuf,
  ): Promise<number> {
    let state = 0;
    const after = (n: number): string => (n <= command.length ? command.slice(n) : '');
    switch (this.get_command(command)) {
      case RESIGN:
        state = await this.ascii_endgame(gameinfo, 1);
        break;
      case END:
      case EXIT:
      case QUIT:
        return -2;
      case HELP:
        this.show_commands();
        break;
      case CMD_HELPDEBUG:
        this.printf(DEBUG_COMMANDS);
        break;
      case SHOWBOARD:
        this.opt_showboard = !this.opt_showboard;
        break;
      case INFO:
        this.printf('\n');
        this.gameinfo_print(gameinfo);
        break;
      case SETBOARDSIZE: {
        if (this.sgf_initialized) {
          this.printf('Boardsize cannot be changed after record is started!\n');
          break;
        }
        const num = scanInt(after(10));
        if (num === null) {
          this.printf('\nInvalid command syntax!\n');
          break;
        }
        if (!this.check_boardsize(num, (s) => this.printf(s))) break;
        g.board_size = num;
        clear_board();
        gameinfo.handicap = this.place_fixed_handicap(gameinfo.handicap);
        sgfOverwritePropertyInt(this.sgftree.root!, 'SZ', g.board_size);
        sgfOverwritePropertyInt(this.sgftree.root!, 'HA', gameinfo.handicap);
        break;
      }
      case SETHANDICAP: {
        if (this.sgf_initialized) {
          this.printf('Handicap cannot be changed after game is started!\n');
          break;
        }
        const num = scanInt(after(9));
        if (num === null) {
          this.printf('\nInvalid command syntax!\n');
          break;
        }
        if (num < 0 || num > MAX_HANDICAP) {
          this.printf(`\nInvalid handicap: ${num}\n`);
          break;
        }
        clear_board();
        gameinfo.handicap = this.place_fixed_handicap(num);
        this.printf(`\nSet handicap to ${gameinfo.handicap}\n`);
        gameinfo.to_move = gameinfo.handicap ? WHITE : BLACK;
        break;
      }
      case FREEHANDICAP: {
        if (this.sgf_initialized) {
          this.printf('Handicap cannot be changed after game is started!\n');
          break;
        }
        let k = 0;
        while (k < command.length && command[k] !== ' ') k++;
        await this.ascii_free_handicap(gameinfo, command.slice(k));
        break;
      }
      case SETKOMI: {
        if (this.sgf_initialized) {
          this.printf('Komi cannot be modified after game record is started!\n');
          break;
        }
        const f = scanFloat(after(5));
        if (f === null) {
          this.printf('\nInvalid command syntax!\n');
          break;
        }
        g.komi = f;
        this.printf(`\nSet Komi to ${cfix(g.komi, 1)}\n`);
        break;
      }
      case SETDEPTH: {
        const num = scanInt(after(6));
        if (num === null) {
          this.printf('\nInvalid command syntax!\n');
          break;
        }
        this.mandated_depth = num;
        this.printf(`\nSet depth to ${this.mandated_depth}\n`);
        break;
      }
      case SETLEVEL: {
        const num = scanInt(after(6));
        if (num === null) {
          this.printf('\nInvalid command syntax!\n');
          break;
        }
        set_level(num);
        this.printf(`\nSet level to ${num}\n`);
        break;
      }
      case DISPLAY:
        if (!this.opt_showboard) this.ascii_showboard();
        break;
      case FORCE: {
        const rest = after(6);
        switch (this.get_command(rest)) {
          case MOVE:
            state = this.do_move(gameinfo, rest, passes, true);
            break;
          case PASS:
            state = this.do_pass(gameinfo, passes, true);
            break;
          default:
            this.printf(`Illegal forced move: ${rest} ${this.get_command(rest)}\n`);
            break;
        }
        break;
      }
      case MOVE:
        state = this.do_move(gameinfo, command, passes, false);
        break;
      case PASS:
        state = this.do_pass(gameinfo, passes, false);
        break;
      case PLAY: {
        const num = scanInt(after(5));
        if (num === null) {
          this.printf('\nInvalid command syntax!\n');
          break;
        }
        if (num >= 0)
          for (let m = 0; m < num; m++) {
            gameinfo.computer_player = OTHER_COLOR(gameinfo.computer_player);
            state = this.computer_move(gameinfo, passes);
            if (state) break;
            if (passes.n >= 2) break;
          }
        else this.printf(`\nInvalid number of moves specified: ${num}\n`);
        break;
      }
      case PLAYBLACK:
        if (gameinfo.computer_player === WHITE) gameinfo.computer_player = BLACK;
        if (gameinfo.computer_player === gameinfo.to_move) state = this.computer_move(gameinfo, passes);
        break;
      case PLAYWHITE:
        if (gameinfo.computer_player === BLACK) gameinfo.computer_player = WHITE;
        if (gameinfo.computer_player === gameinfo.to_move) state = this.computer_move(gameinfo, passes);
        break;
      case SWITCH:
        gameinfo.computer_player = OTHER_COLOR(gameinfo.computer_player);
        state = this.computer_move(gameinfo, passes);
        break;
      case UNDO:
      case CMD_BACK:
        if (undo_move(1)) {
          sgftreeAddComment(this.sgftree, 'undone');
          sgftreeBack(this.sgftree);
          gameinfo.to_move = OTHER_COLOR(gameinfo.to_move);
        } else this.printf("\nCan't undo.\n");
        break;
      case CMD_FORWARD:
        if (sgftreeForward(this.sgftree)) gameinfo.to_move = this.gnugo_play_sgfnode(this.sgftree.lastnode!, gameinfo.to_move);
        else this.printf('\nEnd of game tree.\n');
        break;
      case CMD_LAST:
        while (sgftreeForward(this.sgftree))
          gameinfo.to_move = this.gnugo_play_sgfnode(this.sgftree.lastnode!, gameinfo.to_move);
        break;
      case COMMENT:
        this.printf('\nEnter comment. Press ENTER when ready.\n');
        await this.fgets(line, 80);
        sgftreeAddComment(this.sgftree, line.str(0));
        break;
      case SCORE:
        this.showscore = !this.showscore;
        if (!this.showscore) this.current_score_estimate = NO_SCORE;
        break;
      case CMD_DEAD:
        this.dead_position = -1;
        this.examine_dead();
        this.showdead = !this.showdead;
        break;
      case CMD_CAPTURE:
      case CMD_DEFEND:
      case CMD_SHOWMOYO:
      case CMD_SHOWTERRI:
      case CMD_SHOWAREA:
      case CMD_SHOWDRAGONS:
      case CMD_LISTDRAGONS:
        // the reading code, influence and dragons of the full engine are not ported (README)
        this.printf('\nThis debugging command needs the reading engine, which this port does not have.\n');
        break;
      case CMD_GOTO: {
        strtok(cb, tok, ' ');
        const arg = strtok(null, 0, ' ');
        this.ascii_goto(gameinfo, arg === null ? null : strtok_buf!.str(arg));
        break;
      }
      case CMD_SAVE: {
        strtok(cb, tok, ' ');
        const t = strtok(null, 0, ' ');
        if (t !== null) {
          const b = strtok_buf!;
          const len = b.strlen(t);
          if (len > 0) b.b[t + len - 1] = 0;
          const name = b.str(t);
          this.init_sgf(gameinfo);
          this.writesgf(this.sgftree.root!, name);
          this.printf('You may resume the game');
          this.printf(` with -l ${name} --mode ascii\n`);
          this.printf(`or load ${name}\n`);
        } else this.printf('Please specify filename\n');
        break;
      }
      case CMD_LOAD: {
        strtok(cb, tok, ' ');
        const t = strtok(null, 0, ' ');
        if (t !== null) {
          const b = strtok_buf!;
          const len = b.strlen(t);
          if (len > 0) b.b[t + len - 1] = 0;
          const name = b.str(t);
          if (!this.sgftree_readfile(this.sgftree, name)) {
            this.io.err(`Cannot open or parse '${name}'\n`);
            break;
          }
          if (this.gameinfo_play_sgftree(gameinfo, this.sgftree, null) === EMPTY) this.io.err(`Cannot load '${name}'\n`);
          else {
            this.sgf_initialized = true;
            sgfOverwritePropertyInt(this.sgftree.root!, 'HA', gameinfo.handicap);
          }
        } else this.printf('Please specify a filename\n');
        break;
      }
      default:
        this.printf(`\nInvalid command: ${command}`);
        break;
    }
    return state;
  }

  async ascii_endgame(gameinfo: Gameinfo, reason: number): Promise<number> {
    const line = new CBuf(80);
    let state = 0;
    if (reason === 0) {
      const result = this.who_wins();
      this.printf('\nIf you disagree, we may count the game together.\n');
      sgftreeWriteResult(this.sgftree, result, true);
    } else {
      const color = OTHER_COLOR(gameinfo.to_move);
      if (reason === 1) this.printf('GNU Go wins by resignation.\n');
      else this.printf('You win by resignation.\n');
      this.printf(`Result: ${color === WHITE ? 'W' : 'B'}+Resign\n\n`);
      sgftreeWriteResult(this.sgftree, color === WHITE ? 1000.0 : -1000.0, true);
    }
    while (state === 0) {
      this.printf('You may optionally save the game as an SGF file.\n\n');
      this.printf('Type "save <filename>" to save,\n');
      if (reason === 0) this.printf('     "count" to recount,\n');
      else if (reason === 2) this.printf('     "continue" to decline resignation and continue the game,\n');
      this.printf('     "quit" to quit\n');
      this.printf(' or  "game" to play again\n');
      if (!(await this.fgets(line, 80))) break;
      const tok = strtok(line, 0, '');
      if (tok === null) continue;
      const command = line.str(tok);
      switch (this.get_command(command)) {
        case CMD_SAVE: {
          strtok(line, tok, ' ');
          const t = strtok(null, 0, ' ');
          if (t !== null) {
            const b = strtok_buf!;
            const len = b.strlen(t);
            if (len > 0) b.b[t + len - 1] = 0;
            this.init_sgf(gameinfo);
            this.writesgf(this.sgftree.root!, b.str(t));
          } else this.printf('Please specify filename\n');
          break;
        }
        case COUNT:
          if (reason === 0) await this.ascii_count(gameinfo);
          break;
        case CONTINUE:
          state = -1;
          break;
        case NEW:
          state = 1;
          break;
        case QUIT:
          state = 2;
          break;
        default:
          state = 0;
      }
    }
    return state;
  }

  async ascii_count(gameinfo: Gameinfo): Promise<void> {
    void gameinfo;
    const buf = new CBuf(12);
    let done = false;
    let xyzzy = true;
    this.printf("\nGame over. Let's count!.\n");
    this.showdead = true;
    this.ascii_showboard();
    while (!done) {
      this.printf('Dead stones are marked with small letters (x,o).\n');
      this.printf('\nIf you don\'t agree, enter the location of a group\n');
      this.printf('to toggle its state or "done".\n');
      if (!(await this.fgets(buf, 12))) return;
      for (let i = 0; i < 12; i++) buf.b[i] = String.fromCharCode(buf.b[i]).toLowerCase().charCodeAt(0) & 0xff;
      const line = buf.str(0);
      if (line.startsWith('done')) done = true;
      else if (line.startsWith('quit')) return;
      else if (line.startsWith('xyzzy')) {
        if (xyzzy) {
          this.printf('\nYou are in a debris room filled with stuff washed in from the\n');
          this.printf('surface.  A low wide passage with cobbles becomes plugged\n');
          this.printf('with mud and debris here, but an awkward canyon leads\n');
          this.printf('upward and west.  A note on the wall says:\n');
          this.printf('   Magic Word "XYZZY"\n\n');
          xyzzy = false;
        } else {
          this.printf('You are inside a building, a well house for a large spring.\n\n');
          xyzzy = true;
        }
      } else if (line.startsWith('help')) {
        this.printf('\nIf there are dead stones on the board I will remove them.\n');
        this.printf('You must tell me where they are. Type the coordinates of a\n');
        this.printf('dead group, or type "done"\n');
      } else if (line.startsWith('undo')) {
        this.printf('UNDO not allowed anymore. The status of the stones now\n');
        this.printf('toggles after entering the location of it.\n');
        this.ascii_showboard();
      } else {
        const pos = string_to_location(g.board_size, line);
        if (pos === NO_MOVE || board[pos] === EMPTY) this.printf('\ninvalid!\n');
        else {
          this.examine_dead();
          const status = this.dead[pos] ? 0 : 1;
          for (const p of dead_group(pos)) this.dead[p] = status;
          this.ascii_showboard();
        }
      }
    }
    this.who_wins();
  }

  ascii_goto(gameinfo: Gameinfo, line: string | null): void {
    if (line === null) return;
    let movenumber = line;
    if (line.startsWith('last')) movenumber = '9999';
    else if (line.startsWith('firs')) movenumber = '1';
    this.printf(`goto ${movenumber}\n`);
    this.gameinfo_play_sgftree(gameinfo, this.sgftree, movenumber);
  }

  async ascii_free_handicap(gameinfo: Gameinfo, handicap_string: string): Promise<void> {
    let handi: number;
    const stones: number[] = [];
    const n = scanInt(handicap_string);
    if (n !== null) {
      handi = n;
      if (handi < 0 || handi === 1) {
        this.printf('\nInvalid command syntax!\n');
        return;
      }
      clear_board();
      handi = this.place_free_handicap(handi);
      this.printf(`\nPlaced ${handi} stones of free handicap.\n`);
    } else {
      clear_board();
      handi = 0;
      const buf = new CBuf(80);
      for (;;) {
        this.ascii_showboard();
        this.printf('\nType in coordinates of next handicap stone, or one of the following commands:\n');
        this.printf('  undo        take back the last stone placed\n');
        this.printf('  clear       remove all the stones placed so far\n');
        this.printf('  done        finish placing handicap\n\n');
        this.printf(`You have placed ${handi} handicap stone(s) so far.\n\n`);
        if (!(await this.fgets(buf, 80))) return;
        for (let i = 0; i < 80; i++) buf.b[i] = String.fromCharCode(buf.b[i]).toLowerCase().charCodeAt(0) & 0xff;
        const line = buf.str(0);
        if (line.startsWith('undo')) {
          if (!handi) this.printf('\nNothing to undo.\n');
          else {
            remove_stone(stones[--handi]);
            this.io.err(`\nRemoved the stone at ${m1(stones[handi])}.\n`);
          }
        } else if (line.startsWith('clear')) {
          clear_board();
          handi = 0;
        } else if (line.startsWith('done')) {
          if (handi === 1) this.printf('\nHandicap cannot be one stone. Either add some more, or delete the only stone.\n');
          else break;
        } else {
          const pos = string_to_location(g.board_size, line);
          if (pos !== NO_MOVE) {
            if (board[pos] !== EMPTY) this.printf("\nThere's already a stone there.\n");
            else {
              add_stone(pos, BLACK);
              stones[handi++] = pos;
            }
          } else this.printf(`\nInvalid command: ${line}`);
        }
      }
    }
    gameinfo.handicap = handi;
    gameinfo.to_move = handi ? WHITE : BLACK;
  }
}

export { fromLatin1, BOARDMIN };
