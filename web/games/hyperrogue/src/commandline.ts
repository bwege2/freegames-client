// commandline.cpp of HyperRogue 13.1o (package P8): the command line options (CAP_COMMANDLINE). The browser
// passes its options through hyper_init(argv) as well (the oracle's harness does: `-nogui -fixx <seed> -W <land>`).
// Options of later-stage files (graphics, other geometries) are read by their own hooks_args handlers, which those
// stages register; until then such an option is "Unknown option" (exit(3)), as in a build without them.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G } from './globals.ts';
import { isize, callhooks, callhandlers, addHook, hr_exception, VER, NotPorted } from './hyper.ts';
import { dynamicval } from './cpp.ts';
import { printf, exit, getenv, file_exists } from './cfile.ts';
import { conffile_ref } from './config.ts';
import {
  type eLand, type eItem, type eMonster, landtypes, ittypes, motypes, walltypes, linf, iinf, minf, winf,
  laNone, laCrossroads2, laCrossroads3, laCrossroads4, laCrossroads5, itNone, moNone, moPike, IC_TREASURE, IC_ORB,
  IC_OTHER,
} from './content.ts';
import { appears, parseld, hr_parse_exception, SDL_GetTicks } from './util.ts';
import { itemclass } from './flags.ts';
import { addMessage, clearMessages } from './basegraph.ts';
import { start_game, save_mode_to_file, load_mode_from_file } from './system.ts';
import { popScreenAll, pushScreen, mainloop } from './control.ts';

// EX string rsrcdir; EX bool delayed_start; EX string scorefile = "hyperrogue.log": G

/** template<class T> T read_index(T fallback, int max, const string& ss) */
function read_index(fallback: number, max: number, ss: string): number {
  if (ss.charCodeAt(0) < 48 && ss.charCodeAt(0) > 57) return fallback; // (never true, as in the original)
  const val = atoi(ss);
  if (val < 0 || val >= max) return fallback;
  return val;
}

/** atoi: leading whitespace, sign, digits (0 if none) */
function atoi(s: string): number {
  const m = /^[ \t\n\v\f\r]*([+-]?\d+)/.exec(s);
  if (!m) return 0;
  return Number(BigInt.asIntN(32, BigInt(m[1])));
}

export function arg_readland(ss: string): eLand {
  if (ss === 'II') return laCrossroads2;
  if (ss === 'III') return laCrossroads3;
  if (ss === 'IV') return laCrossroads4;
  if (ss === 'V') return laCrossroads5;
  for (let l = 0; l < landtypes; l++) if (appears(linf[l].name, ss)) {
    return l;
  }
  return read_index(laNone, landtypes, ss);
}

export function arg_readItem(ss: string): eItem {
  for (let i = 0; i < ittypes; i++) if (appears(iinf[i].name, ss)) {
    return i;
  }
  return read_index(itNone, ittypes, ss);
}

export function arg_readMonster(ss: string): eMonster {
  if (ss === 'Pike') return moPike;
  for (let i = 0; i < motypes; i++) if (appears(minf[i].name, ss)) {
    return i;
  }
  return read_index(moNone, motypes, ss);
}

export function initializeCLI(): void {
  printf('HyperRogue by Zeno Rogue <zeno@attnam.com>, version ' + VER + '\n');

  // !NOLICENSE
  printf('released under GNU General Public License version 2 and thus\n');
  printf('comes with absolutely no warranty; see COPYING for details\n');

  // FHS: the score and config files go to $HOME/.<name>, $XDG_DATA_HOME/hyperrogue, ... The browser has no
  // environment (cfs.env is empty), so they keep their plain names in the in-memory file system.
  const try_place = (env: string, suffix: string, which: { v: string }, only_file: boolean): boolean => {
    const res = getenv(env);
    if (res === null) return false;
    const buf = res + suffix + '/hyperrogue';
    if (only_file && file_exists(buf + '/' + which.v)) {
      which.v = buf + '/' + which.v;
      return true;
    }
    // if(!file_exists(buf)) system(("mkdir -p " +buf).c_str()); -- directories do not exist in cfs
    which.v = buf + '/' + which.v;
    return true;
  };

  const try_dot = (which: { v: string }): boolean => {
    const res = getenv('HOME');
    if (res === null) return false; // (the original reads a null HOME: undefined behaviour)
    const buf = res + '/.' + which.v;
    if (!file_exists(buf)) return false;
    which.v = buf;
    return true;
  };

  const sf = { v: G.scorefile };
  if (try_dot(sf)) { /* */ }
  else if (try_place('XDG_DATA_HOME', '', sf, true)) { /* */ }
  else if (try_place('HOME', '/.local/share', sf, false)) { /* */ }
  else if (try_place('XDG_DATA_HOME', '', sf, false)) { /* */ }
  G.scorefile = sf.v;

  const cf = conffile_ref;
  if (try_dot(cf)) { /* */ }
  else if (try_place('XDG_CONFIG_HOME', '', cf, true)) { /* */ }
  else if (try_place('HOME', '/.config', cf, true)) { /* */ }
  else if (try_place('XDG_CONFIG_HOME', '', cf, false)) { /* */ }
}

// namespace arg: EX int curphase; EX vector<string> argument; EX int pos: G.arg_*

export function arg_lshift(): void { G.arg_pos++; }
export function arg_unshift(): void { G.arg_pos--; }

export function arg_shift(): void {
  arg_lshift(); if (G.arg_pos >= isize(G.arg_argument)) { printf('Missing parameter\n'); exit(1); }
}

export function arg_nomore(): boolean { return G.arg_pos >= isize(G.arg_argument); }

export function arg_args(): string { return G.arg_argument[G.arg_pos]; }
export function arg_argcs(): string { return arg_args(); }
export function arg_argi(): number { return atoi(arg_argcs()); }
/** atoll: as a JS number (exact up to 2^53) */
export function arg_argll(): number {
  const m = /^[ \t\n\v\f\r]*([+-]?\d+)/.exec(arg_argcs());
  return m ? Number(BigInt.asIntN(64, BigInt(m[1]))) : 0;
}

export function arg_shift_argi(): number { arg_shift(); return arg_argi(); }
export function arg_shift_args(): string { arg_shift(); return arg_args(); }

/** strtoll(argcs(), NULL, 16) as unsigned */
export function arg_arghex(): number {
  const m = /^[ \t\n\v\f\r]*([+-]?)(0[xX])?([0-9a-fA-F]+)/.exec(arg_argcs());
  if (!m) return 0;
  const v = BigInt('0x' + m[3]);
  return Number(BigInt.asUintN(32, m[1] === '-' ? -v : v));
}
export function arg_argf(): number {
  try {
    return parseld(arg_args());
  }
  catch (ex) {
    if (ex instanceof hr_parse_exception) {
      // println(hlog, "error parsing commandline parameters: ", ex.s);
      exit(1);
    }
    throw ex;
  }
}
export function arg_argis(s: string): boolean {
  const a = arg_args();
  if (a[0] === '-' && a[1] === '-') return a.substring(1) === s;
  return a === s;
}

/** argcolor(int bits) (real since U4) */
export function arg_argcolor(bits: number): number { return parsecolor(arg_args(), bits === 32); }

/** int parameter_id (file-local) */
let parameter_id = 0;

/** shift_arg_formula(ld& x, const reaction_t& r) (real since U4): x is a reference (config.ts pref) */
export function arg_shift_arg_formula(x: pref<number>, r?: () => void): void {
  arg_shift();
  let par = find_edit_noncheck(x); // anims::find_param(&x)
  if (!par) { par = param_f(x, 'tmp_parameter_' + its(parameter_id++)); if (r) par.set_reaction(r); }
  par.load_as_animation(arg_args());
}
import { parsecolor } from './util.ts';
import { its } from './hprint.ts';
import { type pref, param_f, anims_find_param as find_edit_noncheck } from './config.ts';

// #define PHASE(x) { if(arg::curphase > x) arg::phaseerror(x); else if(arg::curphase < x) return 2; }
// #define PHASEFROM(x) { if(arg::curphase < x) return 2; }
// In the port: `if (PHASE(x)) return 2;` and `if (PHASEFROM(x)) return 2;`
/** PHASE(x): true when the caller must return 2 (the option belongs to a later phase) */
export function PHASE(x: number): boolean {
  if (G.arg_curphase > x) arg_phaseerror(x);
  else if (G.arg_curphase < x) return true;
  return false;
}
/** PHASEFROM(x): true when the caller must return 2 */
export function PHASEFROM(x: number): boolean { return G.arg_curphase < x; }

export function arg_cheat(): void { G.autocheat = true; G.cheater++; G.timerghost = false; }

export function arg_run_arguments(vec: string[]): void {
  const p = dynamicval(() => G.arg_pos, (v) => { G.arg_pos = v; }, 0);
  const orig = dynamicval(() => G.arg_argument, (v) => { G.arg_argument = v; }, [...vec]);
  try {
    arg_read(3);
  }
  finally { orig.restore(); p.restore(); }
}

export function arg_init(argv: string[]): void { for (let i = 0; i < argv.length; i++) G.arg_argument.push(argv[i]); arg_lshift(); }

export function arg_phaseerror(x: number): void {
  printf(`Command line error: cannot read command '${arg_args()}' from phase ${x} in phase ${G.arg_curphase}\n`);
  exit(1);
}

let dialog_launched = false;

export function arg_launch_dialog(r?: () => void): void {
  if (!dialog_launched) {
    popScreenAll();
    G.showstartmenu = false;
    dialog_launched = true;
  }
  if (r) pushScreen(r);
}

function readCommon(): number {

// first phase options

  if (arg_argis('-s')) { if (PHASE(2)) return 2; arg_shift(); G.scorefile = arg_args(); G.savefile_selection = false; }
  else if (arg_argis('-no-s')) { if (PHASE(2)) return 2; G.scorefile = ''; G.savefile_selection = false; }
  else if (arg_argis('-rsrc')) { if (PHASE(1)) return 2; arg_shift(); G.rsrcdir = arg_args(); }
  else if (arg_argis('-nogui')) { if (PHASE(1)) return 2; G.noGUI = true; }
  // CAP_SDLTTF: -font (fonts are a later stage)
  else if (arg_argis('-font')) { if (PHASE(1)) return 2; arg_shift(); throw new NotPorted('-font'); }

  else if (arg_argis('-test-ach'))
    G.test_achievements = true;

  else if (arg_argis('-test'))
    callhooks(G.hooks_tests);
  else if (arg_argis('-offline')) {
    if (PHASE(1)) return 2;
    G.offlineMode = true;
  }
  else if (arg_argis('-run')) {
    if (PHASE(3)) return 2;
    start_game();
    mainloop(); G.quitmainloop = false;
  }
  else if (arg_argis('-msg')) {
    arg_shift(); addMessage(arg_args());
  }
  else if (arg_argis('-msg0')) {
    clearMessages();
  }
  // CAP_TOUR
  else if (arg_argis('-tour') || arg_argis('-presentation') || arg_argis('-print-tour')) {
    throw new NotPorted(arg_args() + ' (tour.cpp)');
  }
  else if (arg_argis('-draw') || arg_argis('-sview') || arg_argis('-rotate-up') || arg_argis('-face-vertex') ||
    arg_argis('-face-face') || arg_argis('-center-vertex')) {
    // graphics: drawscreen, View
    throw new NotPorted(arg_args() + ' (graphics)');
  }
  else if (arg_argis('-exit')) {
    if (PHASE(3)) return 2;
    const t = SDL_GetTicks();
    if (t > 1800 * 1000)
      void 0; // println(hlog, "Great Success!\n");
    else
      void 0; // println(hlog, "Success.\n");
    exit(0);
  }

// graphical options
  else if (arg_argis('-noscr')) {
    if (PHASE(3)) return 2;
    popScreenAll();
    G.showstartmenu = false;
  }

  else if (arg_argis('-viz')) {
    if (PHASE(3)) return 2;
    G.showstartmenu = false;
    start_game();
    popScreenAll();
    clearMessages();
    G.nohud = true;
    G.mapeditor_drawplayer = false;
    G.no_find_player = true;
  }

  else if (arg_argis('-vizs') || arg_argis('-vizhr')) {
    throw new NotPorted(arg_args() + ' (graphics)');
  }

  else if (arg_argis('-save-mode')) {
    if (PHASEFROM(2)) return 2;
    save_mode_to_file(arg_shift_args());
  }

  else if (arg_argis('-load-mode')) {
    if (PHASEFROM(2)) return 2;
    try {
      load_mode_from_file(arg_shift_args());
    }
    catch (e) {
      if (!(e instanceof hr_exception) || e instanceof NotPorted) throw e;
      // println(hlog, "exception!");
    }
  }

// informational
  else if (arg_argis('-version') || arg_argis('-v')) {
    printf('HyperRogue version ' + VER + '\n');
    exit(0);
  }
  else if (arg_argis('-L')) {
    printf('+ Treasures:\n');
    let qty = 0;
    for (let i = 1; i < ittypes; i++)
      if (itemclass(i) === IC_TREASURE) { printf(`    ${iinf[i].name}\n`); qty++; }
    printf(`    total = ${qty}\n`); qty = 0;
    printf('\n');
    printf('+ Orbs:\n');
    for (let i = 1; i < ittypes; i++)
      if (itemclass(i) === IC_ORB) { printf(`    ${iinf[i].name}\n`); qty++; }
    printf(`    total = ${qty}\n`); qty = 0;
    printf('\n');
    printf('+ Other items:\n');
    for (let i = 1; i < ittypes; i++)
      if (itemclass(i) === IC_OTHER) { printf(`    ${iinf[i].name}\n`); qty++; }
    printf(`    total = ${qty}\n`); qty = 0;
    printf('\n');
    printf('+ Monsters:\n');
    for (let i = 1; i < motypes; i++) { printf(`    ${minf[i].name}\n`); qty++; }
    printf(`    total = ${qty}\n`); qty = 0;
    printf('\n');
    printf('+ Lands:\n');
    for (let i = 1; i < landtypes; i++) { printf(`    ${linf[i].name}\n`); qty++; }
    printf(`    total = ${qty}\n`); qty = 0;
    printf('\n');
    printf('+ Walls:\n');
    for (let i = 0; i < walltypes; i++) { printf(`    ${winf[i].name}\n`); qty++; }
    printf(`    total = ${qty}\n`); qty = 0;
    printf('\n');
    exit(0);
  }
  else if (arg_argis('')) { /* */ }
  else if (arg_argis('-deck')) {
    // detect_deck / running_on_deck (config.cpp, a later stage)
    arg_shift();
  }
  else if (arg_argis('-help') || arg_argis('-h')) {
    printf(HELP);
    exit(0);
  }
  else return 1;
  return 0;
}

const HELP = `
Commandline help follows. If you meant in-game help, press F1 while playing.

Some commadline options automatically enable the cheat mode.
ID is a part of the name of the chosen option; indices are also allowed.
You can change various configuration settings using the [name]=[value] format, e.g. , \`unlock_all=1\`.
The names are as in the config file, and formulae are allowed.
HyperRogue has lots of options; only the basic ones are documented here.

Basic options:
  --version, -v      - show the version number
  --help, -h         - show the commandline options
  -offline           - do not connect to Steam (for Steam versions)
  -L                 - list of features
  -fix               - fix the RNG seed (cheat)
  -fixx SEED         - fix the RNG seed to the given value (cheat)
  -noscr             - skip the start menu
  -viz               - visualization mode: do not display the game elements
  -vizs              - visualization mode with smooth control
  -g                 - debug mode: do not use scorefile, fix seed, enable cheat mode
  -nogui             - do not start the GUI
  -run               - run (before handling other options) until the user presses F10
  -exit              - exit the program
  -deck n            - disable SteamDeck auto-detection (\`-deck 0\` sets not deck, \`-deck 1\` sets deck)

File options:
  -c FILE            - use the specified configuration file
  -s FILE            - use the specified highscore file
  -m FILE            - use the specified soundtrack (music)
  -se DIR            - the directory containing sound effects
  -rsrc DIR          - the directory containing resources
  -font FILE         - use the specified font file

Logging:
  -log PATTERN       - log events matching the pattern
  -no-log PATTERN    - do not log events matching the pattern
  -log-to FILE       - log to the given file
  -log-append FILE   - append log to the given file

Quick testing:
  -load FILE         - load a level file created using the map editor
  -geo ID            - choose the geometry
  -PM ID             - choose the projection/model
  -W ID              - start in the given land
  -W2 ID             - make the given land easy to find (cheat)
  -W3 ID             - like -W2 but can be used multiple times (cheat)
  -I ID n            - start with n of item ID nearby (cheat)
  -M ID n            - start with n of monster ID nearby (cheat)
  -MK ID n           - start with n of kills of monster ID (cheat)
  -canvas ID         - set background color or pattern code for the canvas

Troubleshooting suggestions:
  -c test1 -s test2              - to check if config/score files are responsible
  -noshaders -o0 -wm 3 -mm 2     - to disable complex graphics (-o0 disables OpenGL, -wm and -mm disable 3D walls/monsters)
  -log-all -log-to error.txt     - to log everything to a file error.txt
  -offline                       - to troubleshoot online connection issues
`;

// EX purehookset hooks_config; EX hookset<int()> hooks_args; EX map<...> *added_commands: G

function read_added_commands(): number {
  if (!G.added_commands) return 1;
  if (G.added_commands.has(arg_args())) {
    const ac = G.added_commands.get(arg_args())!;
    if (ac[0] === 2)
      if (PHASEFROM(2)) return 2;
    if (ac[0] === 3)
      if (PHASE(3)) return 2;
    ac[1]();
    return 0;
  }
  return 1;
}

export function arg_add_at(s: string, at: number, r: () => void): number {
  if (!G.added_commands) G.added_commands = new Map();
  if (G.added_commands.has(s)) throw new hr_exception('arg::add conflict');
  G.added_commands.set(s, [at, r]);
  return 1;
}

export function arg_add1(s: string, r: () => void): number { return arg_add_at(s, 1, r); }
export function arg_add2(s: string, r: () => void): number { return arg_add_at(s, 2, r); }
export function arg_add3(s: string, r: () => void): number { return arg_add_at(s, 3, r); }

export function arg_read(phase: number): void {
  G.arg_curphase = phase;
  callhooks(G.hooks_config);
  const ds = dynamicval(() => G.delayed_start, (v) => { G.delayed_start = v; }, true);
  try {
    while (G.arg_pos < isize(G.arg_argument)) {
      const r: number = callhandlers(1 as number, G.hooks_args);
      switch (r) {
        case 0: arg_lshift(); break;
        case 1: printf(`Unknown option: ${arg_argcs()}\n`); exit(3); break;
        case 2: return;
        default: throw new Error('assert(false)');
      }
    }
  }
  finally { ds.restore(); }
}

/** the static initializer: auto ah = addHook(hooks_args, 0, readCommon) + addHook(hooks_args, 200, read_added_commands) */
export function register_commandline(): void {
  addHook(G.hooks_args, 0, readCommon);
  addHook(G.hooks_args, 200, read_added_commands);
}

