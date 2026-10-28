// advent.h of Open Adventure 1.22: dungeon types and macros, the game state, the settings.
// SPDX-FileCopyrightText: (C) 1977, 2005 by Will Crowther and Don Woods
// SPDX-License-Identifier: BSD-2-Clause
//
// The C program's globals (game, save, settings) are module state here; main() resets them, so the
// program can run many times in one page or test process. Its contact with the world (stdout, stdin,
// files, the clock) goes through `host` (end of this file), so the same code runs on the website's
// teletype and in the tests against the original's regression transcripts. Strings in the program are
// byte strings, as in C: one character per byte (the host encodes and decodes UTF-8 at the edge).
import {
  BOTTLE, COND_ABOVE, COND_DEEP, COND_FLUID, COND_FOREST, COND_FORCED, COND_LIT, COND_OILY, EMERALD,
  AMBER, LAMP, LAMP_DARK, LOC_BUILDING, LOC_MAZEEND12, LOC_DEADEND13, LOC_NOWHERE, LOC_NUGGET, LOC_START,
  NDWARVES, NHINTS, NLOCATIONS, NOBJECTS, NO_OBJECT, OIL, OIL_BOTTLE, RUBY, SAPPH, WATER, WATER_BOTTLE,
  conditions, MAX_STATE,
} from './dungeon.ts';
// misc.c's routines that the macros use (the modules import each other, as the C files share advent.h)
import { move, randrange, tstbit, bug } from './misc.ts';

/* LCG PRNG parameters tested against
 * Knuth vol. 2. by the original authors */
export const LCG_A = 1093;
export const LCG_C = 221587;
export const LCG_M = 1048576;

export const LINESIZE = 1024;
export const TOKLEN = 5; // # outputting characters in a token */
export const PIRATE = NDWARVES;
export const DALTLC = LOC_NUGGET; // alternate dwarf location
export const INVLIMIT = 7; // inventory limit (# of objects)
export const INTRANSITIVE = -1; // illegal object number
export const GAMELIMIT = 330; // base limit of turns
export const NOVICELIMIT = 1000; // limit of turns for novice
export const WARNTIME = 30; // late game starts at game.limit-this
export const FLASHTIME = 50; // turns from first warning till blinding flash
export const PANICTIME = 15; // time left after closing
export const BATTERYLIFE = 2500; // turn limit increment from batteries
export const WORD_NOT_FOUND = -1; // "Word not found" flag value for the vocab hash functions.
export const WORD_EMPTY = 0; // "Word empty" flag value for the vocab hash functions
export const PIT_KILL_PROB = 35; // Percentage probability of dying from fall in pit.
export const CARRIED = -1; // Player is toting it
export const READ_MODE = 'rb'; // b is not needed for POSIX but harmless
export const WRITE_MODE = 'wb'; // b is not needed for POSIX but harmless

/* Special object-state values - integers > 0 are object-specific */
export const STATE_NOTFOUND = -1; // 'Not found" state of treasures
export const STATE_FOUND = 0; // After discovered, before messed with
export const STATE_IN_CAVITY = 1; // State value common to all gemstones

/* Special fixed object-state values - integers > 0 are location */
export const IS_FIXED = -1;
export const IS_FREE = 0;

/* (ESR) It is fitting that translation of the original ADVENT should
 * have left us a maze of twisty little conditionals that resists all
 * understanding. [...] All tests of the prop member are done with either these macros or ==. */
export const OBJECT_IS_NOTFOUND = (obj: number) => game.objects[obj].prop === STATE_NOTFOUND;
export const OBJECT_IS_FOUND = (obj: number) => game.objects[obj].prop === STATE_FOUND;
export const OBJECT_SET_FOUND = (obj: number) => { game.objects[obj].prop = STATE_FOUND; };
export const OBJECT_SET_NOT_FOUND = (obj: number) => { game.objects[obj].prop = STATE_NOTFOUND; };
export const OBJECT_IS_NOTFOUND2 = (g: game_t, o: number) => g.objects[o].prop === STATE_NOTFOUND;
export const PROP_IS_INVALID = (val: number) => val < -MAX_STATE - 1 || val > MAX_STATE;
export const PROP_STASHIFY = (n: number) => (-1 - n) | 0;
export const OBJECT_STASHIFY = (obj: number, pval: number) => { game.objects[obj].prop = PROP_STASHIFY(pval); };
export const OBJECT_IS_STASHED = (obj: number) => game.objects[obj].prop < STATE_NOTFOUND;
export const OBJECT_STATE_EQUALS = (obj: number, pval: number) =>
  game.objects[obj].prop === pval || game.objects[obj].prop === PROP_STASHIFY(pval);

export const PROMPT = '> ';

/*
 * DESTROY(N)     = Get rid of an item by putting it in LOC_NOWHERE
 * MOD(N,M)       = Arithmetic modulus
 * TOTING(OBJ)    = true if the OBJ is being carried
 * AT(OBJ)        = true if on either side of two-placed object
 * HERE(OBJ)      = true if the OBJ is at "LOC" (or is being carried)
 * CNDBIT(L,N)    = true if COND(L) has bit n set (bit 0 is units bit)
 * LIQUID()       = object number of liquid in bottle
 * LIQLOC(LOC)    = object number of liquid (if any) at LOC
 * FORCED(LOC)    = true if LOC moves without asking for input (COND=2)
 * IS_DARK_HERE() = true if location "LOC" is dark
 * PCT(N)         = true N% of the time (N integer from 0 to 100)
 * GSTONE(OBJ)    = true if OBJ is a gemstone
 * FOREST(LOC)    = true if LOC is part of the forest
 * OUTSIDE(LOC)   = true if location not in the cave
 * INSIDE(LOC)    = true if location is in the cave or the building at the
 *                  beginning of the game
 * INDEEP(LOC)    = true if location is in the Hall of Mists or deeper
 * BUG(X)         = report bug and exit
 *
 * (port) The macros are functions of the same names. HERE, OUTSIDE and INSIDE are also motion words
 * in dungeon.h (C tells a macro call from the enum by the parenthesis); the modules that need the
 * motions import them as HERE_MOTION, OUTSIDE_MOTION and INSIDE_MOTION.
 */
export const DESTROY = (N: number) => move(N, LOC_NOWHERE);
export const MOD = (N: number, M: number) => (N % M) | 0;
export const TOTING = (OBJ: number) => game.objects[OBJ].place === CARRIED;
export const AT = (OBJ: number) => game.objects[OBJ].place === game.loc || game.objects[OBJ].fixed === game.loc;
export const HERE = (OBJ: number) => AT(OBJ) || TOTING(OBJ);
export const CNDBIT = (L: number, N: number) => tstbit(conditions[L], N);
export const LIQUID = () =>
  game.objects[BOTTLE].prop === WATER_BOTTLE ? WATER : game.objects[BOTTLE].prop === OIL_BOTTLE ? OIL : NO_OBJECT;
export const LIQLOC = (LOC: number) => (CNDBIT(LOC, COND_FLUID) ? (CNDBIT(LOC, COND_OILY) ? OIL : WATER) : NO_OBJECT);
export const FORCED = (LOC: number) => CNDBIT(LOC, COND_FORCED);
export const IS_DARK_HERE = () => !CNDBIT(game.loc, COND_LIT) && (game.objects[LAMP].prop === LAMP_DARK || !HERE(LAMP));
export const PCT = (N: number) => randrange(100) < N;
export const GSTONE = (OBJ: number) => OBJ === EMERALD || OBJ === RUBY || OBJ === AMBER || OBJ === SAPPH;
export const FOREST = (LOC: number) => CNDBIT(LOC, COND_FOREST);
export const OUTSIDE = (LOC: number) => CNDBIT(LOC, COND_ABOVE) || FOREST(LOC);
export const INSIDE = (LOC: number) => !OUTSIDE(LOC) || LOC === LOC_BUILDING;
export const INDEEP = (LOC: number) => CNDBIT(LOC, COND_DEEP);
export function BUG(x: number, name: string): never {
  return bug(x, name);
}

/* enum bugtype */
export const SPECIAL_TRAVEL_500_GT_L_GT_300_EXCEEDS_GOTO_LIST = 0;
export const VOCABULARY_TYPE_N_OVER_1000_NOT_BETWEEN_0_AND_3 = 1;
export const INTRANSITIVE_ACTION_VERB_EXCEEDS_GOTO_LIST = 2;
export const TRANSITIVE_ACTION_VERB_EXCEEDS_GOTO_LIST = 3;
export const CONDITIONAL_TRAVEL_ENTRY_WITH_NO_ALTERATION = 4;
export const LOCATION_HAS_NO_TRAVEL_ENTRIES = 5;
export const HINT_NUMBER_EXCEEDS_GOTO_LIST = 6;
export const SPEECHPART_NOT_TRANSITIVE_OR_INTRANSITIVE_OR_UNKNOWN = 7;
export const ACTION_RETURNED_PHASE_CODE_BEYOND_END_OF_SWITCH = 8;

/* enum speaktype */
export const touch = 0, look = 1, hear = 2, study = 3, change = 4;

/* enum termination */
export const endgame = 0, quitgame = 1, scoregame = 2;

/* enum speechpart */
export const unknown = 0, intransitive = 1, transitive = 2;

/* word_type_t */
export const NO_WORD_TYPE = 0, MOTION = 1, OBJECT = 2, ACTION = 3, NUMERIC = 4;

/* score_t */
export const none = 0, splatter = 1, defeat = 2, victory = 3;

/* Phase codes for action returns.
 * These were at one time FORTRAN line numbers. */
export const GO_TERMINATE = 0;
export const GO_MOVE = 1;
export const GO_TOP = 2;
export const GO_CLEAROBJ = 3;
export const GO_CHECKHINT = 4;
export const GO_WORD2 = 5;
export const GO_UNKNOWN = 6;
export const GO_DWARFWAKE = 7;
export type phase_codes_t = number;

/* Use fixed-lwength types to make the save format moore portable: every member of game_t is an
 * int32_t (bool32_t included: 0 or 1, as C's true and false), except zzword. */
export interface game_t {
  lcg_x: number;
  abbnum: number; // How often to print int descriptions
  bonus: number; // What kind of finishing bonus we are getting
  chloc: number; // pirate chest location
  chloc2: number; // pirate chest alternate location
  clock1: number; // # turns from finding last treasure to close
  clock2: number; // # turns from warning till blinding flash
  clshnt: number; // has player read the clue in the endgame?
  closed: number; // whether we're all the way closed
  closng: number; // whether it's closing time yet
  lmwarn: number; // has player been warned about lamp going dim?
  novice: number; // asked for instructions at start-up?
  panic: number; // has player found out he's trapped?
  wzdark: number; // whether the loc he's leaving was dark
  blooded: number; // has player drunk of dragon's blood?
  conds: number; // min value for cond[loc] if loc has any hints
  detail: number; // level of detail in descriptions
  /*  dflag controls the level of activation of dwarves:
   *	0	No dwarf stuff yet (wait until reaches Hall Of Mists)
   *	1	Reached Hall Of Mists, but hasn't met first dwarf
   *	2	Met 1t dwarf, others start moving, no knives thrown yet
   *      3	A knife has been thrown (first set always misses) 3+
   * Dwarves are mad (increases their accuracy) */
  dflag: number;
  dkill: number; // dwarves killed
  dtotal: number; // total dwarves (including pirate) in loc
  foobar: number; // progress in saying "FEE FIE FOE FOO".
  holdng: number; // number of objects being carried
  igo: number; // # uses of "go" instead of a direction
  iwest: number; // # times he's said "west" instead of "w"
  knfloc: number; // knife location; LOC_NOWERE if none, -1 after caveat
  limit: number; // lifetime of lamp
  loc: number; // where player is now
  newloc: number; // where player is going
  numdie: number; // number of times killed so far
  oldloc: number; // where player was
  oldlc2: number; // where player was two moves ago
  oldobj: number; // last object player handled
  saved: number; // point penalty for saves
  tally: number; // count of treasures gained
  thresh: number; // current threshold for endgame scoring tier
  seenbigwords: number; // have we red the graffiti in the Giant's Room?
  trnluz: number; // # points lost so far due to turns used
  turns: number; // counts commands given (ignores yes/no)
  /** char zzword[TOKLEN + 1]: randomly generated magic word from bird; [6] and [7] are the struct's
   * padding before locs, kept so that a save file is written back as it was read */
  zzword: Uint8Array;
  locs: { abbrev: number; atloc: number }[]; // has location been seen?, head of object linked list per location
  dwarves: { seen: number; loc: number; oldloc: number }[]; // true if dwarf has seen him, location, prior loc
  objects: { fixed: number; prop: number; place: number }[]; // fixed location (if not IS_FREE), state, location
  hints: { used: number; lc: number }[]; // hint i has been used, show int at LOC with cond bit i
  link: Int32Array; // object-list links
}

/** A game_t as C's static initializer leaves it (advent.h `struct game_t game = {...}` in init.c). */
export function new_game(): game_t {
  return {
    lcg_x: 0, abbnum: 5, bonus: 0, chloc: LOC_MAZEEND12, chloc2: LOC_DEADEND13, clock1: WARNTIME, clock2: FLASHTIME,
    clshnt: 0, closed: 0, closng: 0, lmwarn: 0, novice: 0, panic: 0, wzdark: 0, blooded: 0, conds: 0, detail: 0,
    dflag: 0, dkill: 0, dtotal: 0, foobar: WORD_EMPTY, holdng: 0, igo: 0, iwest: 0, knfloc: 0, limit: GAMELIMIT,
    loc: LOC_START, newloc: LOC_START, numdie: 0, oldloc: 0, oldlc2: 0, oldobj: 0, saved: 0, tally: 0, thresh: 0,
    seenbigwords: 0, trnluz: 0, turns: 0,
    zzword: new Uint8Array(8),
    locs: Array.from({ length: NLOCATIONS }, () => ({ abbrev: 0, atloc: 0 })),
    dwarves: Array.from({ length: NDWARVES + 1 }, () => ({ seen: 0, loc: 0, oldloc: 0 })),
    objects: Array.from({ length: NOBJECTS }, () => ({ fixed: 0, prop: 0, place: 0 })),
    hints: Array.from({ length: NHINTS }, () => ({ used: 0, lc: 0 })),
    link: new Int32Array(NOBJECTS * 2),
  };
}

/** C's struct assignment `dst = src` (a deep copy). */
export function copy_game(dst: game_t, src: game_t): void {
  for (const k of Object.keys(src) as (keyof game_t)[]) {
    const v = src[k];
    if (typeof v === 'number') (dst as unknown as Record<string, number>)[k] = v;
  }
  dst.zzword.set(src.zzword);
  dst.link.set(src.link);
  src.locs.forEach((l, i) => Object.assign(dst.locs[i], l));
  src.dwarves.forEach((d, i) => Object.assign(dst.dwarves[i], d));
  src.objects.forEach((o, i) => Object.assign(dst.objects[i], o));
  src.hints.forEach((h, i) => Object.assign(dst.hints[i], h));
}

/** zzword as the C string it is (up to its NUL). */
export function zzword_str(g: game_t = game): string {
  let s = '';
  for (let i = 0; i < g.zzword.length && g.zzword[i] !== 0; i++) s += String.fromCharCode(g.zzword[i]);
  return s;
}

/** A FILE the program reads lines from (script arguments, fgets). */
export interface FILE {
  data: string;
  pos: number;
  eof: boolean;
  /** isatty(fileno(fp)) */
  tty: boolean;
  /** stdin */
  stdin?: boolean;
}

/** A FILE the program writes (the -l log). */
export interface WFILE {
  name: string;
  data: string;
}

/*
 * Game application settings - settings, but not state of the game, per se.
 * This data is not saved in a saved game.
 */
export interface settings_t {
  logfp: WFILE | null;
  oldstyle: boolean;
  prompt: boolean;
  argv: string[];
  argc: number;
  optind: number;
  scriptfp: FILE | null;
  debug: number;
}

export interface command_word_t {
  raw: string;
  id: number;
  type: number;
}

/* command_state_t */
export const EMPTY = 0, RAW = 1, TOKENIZED = 2, GIVEN = 3, PREPROCESSED = 4, PROCESSING = 5, EXECUTED = 6;

export interface command_t {
  part: number;
  word: [command_word_t, command_word_t];
  verb: number;
  obj: number;
  state: number;
}

/** C's struct copy of a command (action() and friends get theirs by value). */
export function copy_command(c: command_t): command_t {
  return { part: c.part, word: [{ ...c.word[0] }, { ...c.word[1] }], verb: c.verb, obj: c.obj, state: c.state };
}

/*
 * Bump on save format change.
 *
 * Note: Verify that the tests run clean before bumping this, then
 * rebuild the check files afterwards with "make -B buildchexks".
 * Otherwise you will get a spurious failure due to the old version
 * having been generated into a check file.
 */
export const SAVE_VERSION = 32;

/*
 * Goes at start of file so saves can be identified by file(1) and the like.
 */
export const ADVENT_MAGIC = 'open-adventure\n';

/* represent an empty command word */
export const empty_command_word: Readonly<command_word_t> = { raw: '', id: WORD_EMPTY, type: NO_WORD_TYPE };

// ---------------------------------------------------------------------------------------------- globals

/** struct game_t game */
export const game: game_t = new_game();

/** struct settings_t settings (init.c: {.logfp = NULL, .oldstyle = false, .prompt = true}) */
export const settings: settings_t = {
  logfp: null, oldstyle: false, prompt: true, argv: [], argc: 0, optind: 0, scriptfp: null, debug: 0,
};

/** Everything back to the state the C program starts in (its static initializers). */
export function reset_globals(): void {
  copy_game(game, new_game());
  Object.assign(settings, { logfp: null, oldstyle: false, prompt: true, argv: [], argc: 0, optind: 0, scriptfp: null, debug: 0 });
}

// ---------------------------------------------------------------------------------------------- the world

/** What the C program gets from its process: stdio, files, the clock. */
export interface Host {
  /** stdout: bytes as a string of char codes 0-255 */
  stdout(s: string): void;
  stderr(s: string): void;
  /** isatty(0) */
  isatty: boolean;
  /** libedit's readline(prompt) on stdin: the line without its newline, null at end of input. On a
   * terminal it prints the prompt and echoes what is typed; on other input it prints nothing. */
  readline(prompt: string): Promise<string | null>;
  /** fgets(buf, n, stdin) for the script argument "-" (a line with its newline, null at end of input) */
  fgets_stdin(n: number): Promise<string | null>;
  /** fopen(name, "r") + reading it all: the file's bytes, or null if it cannot be opened */
  read_file(name: string): Promise<Uint8Array | null>;
  /** fopen(name, "w") + fwrite + fclose: false if the file cannot be opened (written) */
  write_file(name: string, data: Uint8Array): Promise<boolean>;
  /** time(NULL) */
  time(): number;
}

export let host: Host;

export function set_host(h: Host): void {
  host = h;
}

/** exit(status): ends the program (main's caller catches it). */
export class Exit extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`exit(${status})`);
    this.status = status;
  }
}

export const EXIT_SUCCESS = 0, EXIT_FAILURE = 1;

export function exit(status: number): never {
  if (settings.logfp) void host.write_file(settings.logfp.name, bytes(settings.logfp.data)); // fclose at exit
  throw new Exit(status);
}

/** printf/fputs to stdout (a byte string) */
export function out(s: string): void {
  host.stdout(s);
}

/** A byte string as bytes. */
export function bytes(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff;
  return b;
}

/** Bytes as a byte string. */
export function bstr(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
  return s;
}

// ---------------------------------------------------------------------------------------------- libc

/** <ctype.h> in the C locale */
export const isspace = (c: string | undefined) => c === ' ' || c === '\t' || c === '\n' || c === '\v' || c === '\f' || c === '\r';
export const isdigit = (c: string | undefined) => c !== undefined && c >= '0' && c <= '9';
export const tolower = (c: string) => (c >= 'A' && c <= 'Z' ? String.fromCharCode(c.charCodeAt(0) + 32) : c);
export const toupper = (c: string) => (c >= 'a' && c <= 'z' ? String.fromCharCode(c.charCodeAt(0) - 32) : c);

/** strncasecmp(a, b, n) == 0 */
export function strncaseeq(a: string, b: string, n: number): boolean {
  for (let k = 0; k < n; k++) {
    const ca = tolower(a[k] ?? '\0'), cb = tolower(b[k] ?? '\0');
    if (ca !== cb) return false;
    if (ca === '\0') return true;
  }
  return true;
}

/** strcasecmp(a, b) == 0 */
export const strcaseeq = (a: string, b: string) => strncaseeq(a, b, Math.max(a.length, b.length) + 1);

/** sscanf(s, "%s%s...") : the first `n` whitespace-separated words ("" for those missing) */
export function scan_words(s: string, n: number): string[] {
  const words: string[] = [];
  let i = 0;
  while (words.length < n) {
    while (i < s.length && isspace(s[i])) i++;
    if (i >= s.length) break;
    const start = i;
    while (i < s.length && !isspace(s[i])) i++;
    words.push(s.slice(start, i));
  }
  while (words.length < n) words.push('');
  return words;
}

/** strtol(s, NULL, 10) as a 64-bit long, then converted to int32_t (as gcc does: modulo 2^32). */
export function strtol_int32(s: string): number {
  let i = 0;
  while (isspace(s[i])) i++;
  let neg = false;
  if (s[i] === '+' || s[i] === '-') neg = s[i++] === '-';
  let v = 0n;
  const max = (1n << 63n) - (neg ? 0n : 1n);
  while (isdigit(s[i])) {
    v = v * 10n + BigInt(s.charCodeAt(i++) - 48);
    if (v > max) v = max; // ERANGE: LONG_MAX or LONG_MIN
  }
  return Number(BigInt.asIntN(32, neg ? -v : v));
}
