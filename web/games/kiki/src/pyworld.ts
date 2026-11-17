// The original's Python half (py/*.py of kiki 1.0.2), translated: the world builder KikiPyWorld
// (py/world.py), the highscore and configuration files (py/highscore.py, py/config.py, ConfigParser
// format), the languages (py/lang.py), and every menu: main menu, story, statistics, about
// (py/intro.py), setup and keyboard setup (py/setup.py), level selection (py/levelselection.py),
// the in-game escape menu and help pages (py/world.py) and the outro (py/levels.py).
import { KikiPyAction, type PyTarget, type KikiAction } from './engine/action.ts';
import { applyColorScheme } from './engine/colors.ts';
import { KikiController } from './engine/controller.ts';
import { KikiMenu, KikiPageText, KikiScreenText, KikiScrollMenu, continuous, once } from './engine/gui.ts';
import { KikiPos, KQuaternion, KVector } from './engine/math.ts';
import {
  CAMERA_BEHIND, CAMERA_FOLLOW, CAMERA_INSIDE, KikiBomb, KikiCellText, KikiFace, KikiGate, KikiGear, KikiGenerator,
  KikiLight, KikiMotorCylinder, KikiMotorGear, KikiMutant, KikiObject, KikiPlayer, KikiSpikes, KikiStone, KikiSwitch,
  KikiValve, KikiWall, KikiWire, KikiWireStone,
} from './engine/objects.ts';
import { KIKI_HSC } from './data/hsc.gen.ts';
import { LANG } from './data/lang.gen.ts';
import { LEVELS, LEVEL_LIST } from './data/levels.gen.ts';
import { SCHEMES } from './data/schemes.gen.ts';

// ---------------------------------------------------------------------------------------- level data
export type Made = { name: string } | { angle: number; axis: number[] } | { mul: Made[] } | { identity: true };
export interface PlayerDef {
  position?: number[]; coordinates?: number[]; orientation?: Made; nostatus?: number;
  'reset orientation'?: Made; 'reset position'?: number[];
}
export interface ExitDef { name?: string; active: number; position?: number[]; coordinates?: number[]; world?: string }
export interface LevelDef {
  scheme?: string; size: number[]; intro?: string; help?: string | string[]; border?: number;
  player: PlayerDef; exits?: ExitDef[]; create?: (k: LevelApi) => void;
}

const ROTATIONS: Record<string, () => KQuaternion> = {
  rot0: () => new KQuaternion(),
  rotz180: () => KQuaternion.rotationAroundVector(180, new KVector(0, 0, 1)),
  rotz90: () => KQuaternion.rotationAroundVector(90, new KVector(0, 0, 1)),
  roty270: () => KQuaternion.rotationAroundVector(270, new KVector(0, 1, 0)),
  roty180: () => KQuaternion.rotationAroundVector(180, new KVector(0, 1, 0)),
  roty90: () => KQuaternion.rotationAroundVector(90, new KVector(0, 1, 0)),
  roty0: () => KQuaternion.rotationAroundVector(0, new KVector(0, 1, 0)),
  rotx180: () => KQuaternion.rotationAroundVector(180, new KVector(1, 0, 0)),
  rotx90: () => KQuaternion.rotationAroundVector(90, new KVector(1, 0, 0)),
};

export function quaternion(m: Made): KQuaternion {
  if ('name' in m) return ROTATIONS[m.name]();
  if ('mul' in m) return m.mul.map(quaternion).reduce((a, b) => a.mul(b));
  if ('angle' in m) return KQuaternion.rotationAroundVector(m.angle, new KVector(m.axis[0], m.axis[1], m.axis[2]));
  return new KQuaternion();
}

// ------------------------------------------------------------------------------------ ConfigParser
/** Python's ConfigParser, as far as kiki uses it (option names lower case, "name = value") */
export class ConfigFile {
  sections = new Map<string, Map<string, string>>();

  readString(text: string): void {
    let cur: Map<string, string> | null = null;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.replace(/\s+$/, '');
      if (line === '' || line[0] === '#' || line[0] === ';') continue;
      const sec = /^\[([^\]]+)\]/.exec(line);
      if (sec) {
        if (!this.sections.has(sec[1])) this.sections.set(sec[1], new Map());
        cur = this.sections.get(sec[1])!;
        continue;
      }
      const kv = /^([^:=]+?)\s*[:=]\s*(.*)$/.exec(line);
      if (kv && cur) cur.set(kv[1].trim().toLowerCase(), kv[2].trim());
    }
  }
  write(): string {
    let out = '';
    for (const [name, opts] of this.sections) {
      out += `[${name}]\n`;
      for (const [k, v] of opts) out += `${k} = ${v.replace(/\n/g, '\n\t')}\n`;
      out += '\n';
    }
    return out;
  }
  has_section(s: string): boolean { return this.sections.has(s); }
  add_section(s: string): void { if (!this.sections.has(s)) this.sections.set(s, new Map()); }
  has_option(s: string, o: string): boolean { return !!this.sections.get(s)?.has(o.toLowerCase()); }
  get(s: string, o: string): string {
    const v = this.sections.get(s)?.get(o.toLowerCase());
    if (v === undefined) throw new Error(`No option '${o}' in section: '${s}'`);
    return v;
  }
  set(s: string, o: string, v: string): void {
    const sec = this.sections.get(s);
    if (!sec) throw new Error(`No section: '${s}'`);
    sec.set(o.toLowerCase(), v);
  }
  getboolean(s: string, o: string): boolean {
    const v = this.get(s, o).toLowerCase();
    if (['1', 'yes', 'true', 'on'].includes(v)) return true;
    if (['0', 'no', 'false', 'off'].includes(v)) return false;
    throw new Error(`Not a boolean: ${v}`);
  }
  options(s: string): string[] { return [...(this.sections.get(s)?.keys() ?? [])]; }
}

/** the files the original keeps in the user's home directory; the port keeps them in the account */
export interface KikiStorage {
  load(name: string): string | null;
  save(name: string, text: string): void;
}

/** the user name in the highscore file (getpass.getuser() in the original) */
export const HIGHSCORE_USER = 'player';

export class KikiHighscore extends ConfigFile {
  private storage: KikiStorage;
  constructor(storage: KikiStorage) {
    super();
    this.storage = storage;
    this.readString(KIKI_HSC);
    const user = storage.load('kiki.hsc');
    if (user !== null) this.readString(user);
    this.save();
  }
  levelUserMoves(level_name: string): number {
    if (!this.has_section(level_name)) this.add_section(level_name);
    if (this.has_option(level_name, HIGHSCORE_USER)) return Math.trunc(Number(this.get(level_name, HIGHSCORE_USER)));
    return 0;
  }
  levelParMoves(level_name: string): number {
    if (!this.has_section(level_name)) this.add_section(level_name);
    if (this.has_option(level_name, 'moves')) return Math.trunc(Number(this.get(level_name, 'moves')));
    this.set(level_name, 'moves', '1000');
    return 1000;
  }
  levelFinished(level_name: string, moves: number): void {
    const level_num = LEVEL_LIST.indexOf(level_name);
    if (!this.has_section(level_name)) this.add_section(level_name);
    if (this.has_option(level_name, HIGHSCORE_USER)) {
      const old = Math.trunc(Number(this.get(level_name, HIGHSCORE_USER)));
      if (moves < old) this.set(level_name, HIGHSCORE_USER, String(Math.trunc(moves)));
    } else {
      this.set(level_name, HIGHSCORE_USER, String(Math.trunc(moves)));
      const available = this.getLastAvailableLevel();
      this.set('main', 'last_level', LEVEL_LIST[Math.min(available + 2, LEVEL_LIST.length - 1)]);
    }
    // level_list[min(level_num+1, len-1)]; level_num is -1 for a level that is not listed
    const next = Math.min(level_num + 1, LEVEL_LIST.length - 1);
    this.set('main', 'current_level', LEVEL_LIST.at(next)!);
    this.save();
  }
  getLastAvailableLevel(): number { return LEVEL_LIST.indexOf(this.get('main', 'last_level')); }
  getLastLevel(): number { return LEVEL_LIST.indexOf(this.get('main', 'current_level')); }
  save(): void { this.storage.save('kiki.hsc', this.write()); }
}

const KIKI_CFG = `[sound]
volume = 7
mute = no

[game]
speed = 7

[display]
fov = 90
window_size = 800x600
fullscreen_size = 1600x1280
fullscreen = off
language = english
gamma = 5

[keyboard]
shoot = SPACE
change_view = PAGEDOWN
move_backward = DOWN
turn_right = RIGHT
jump = CTRL
turn_left = LEFT
look_up = HOME
move_forward = UP
push = SHIFT
look_down = END
`;

/** py/config.py KikiConfig */
export class KikiConfig extends ConfigFile {
  private game: KikiGame;
  constructor(game: KikiGame) {
    super();
    this.game = game;
    this.readString(KIKI_CFG);
    const user = game.storage.load('kiki.cfg');
    if (user !== null) this.readString(user);
    for (const section of [...this.sections.keys()]) {
      for (const option of this.options(section)) this.apply(section, option, this.get(section, option));
    }
  }
  apply(section: string, option: string, value: string | number | boolean): void {
    const C = this.game.C;
    this.set(section, option, value);
    if (section === 'sound') {
      if (option === 'volume') C.sound.setSoundVolume(Math.trunc(Math.trunc(Number(value)) * Math.trunc(128 / 9)));
      else if (option === 'mute') C.sound.setMute(this.getboolean(section, option));
    } else if (section === 'display') {
      if (option === 'fov') C.getPlayer().projection.setFov(Math.trunc(Number(value)));
      else if (option === 'gamma') C.setGamma(Math.trunc(Number(value)));
      else if (option === 'fullscreen') {
        const fullscreen = this.getboolean(section, option);
        if (fullscreen !== this.game.getFullscreen()) this.game.setFullscreen(fullscreen);
      }
    } else if (section === 'keyboard') {
      KikiPlayer.setKeyForAction(String(value), option.replace(/_/g, ' '));
    } else if (section === 'game') {
      if (option === 'speed') C.setSpeed(Math.trunc(Number(value)));
      else if (option === 'language') C.language = String(value);
    }
  }
  /** overwritten to allow spaces in option names */
  set(section: string, option: string, value: string | number | boolean): void {
    super.set(section, String(option).replace(/ /g, '_'), pyStr(value));
  }
  get(section: string, option: string): string { return super.get(section, String(option).replace(/ /g, '_')); }
  save(): void { this.game.storage.save('kiki.cfg', this.write()); }
}

/** Python's str() of the values kiki writes */
export function pyStr(v: unknown): string {
  if (v === true) return 'True';
  if (v === false) return 'False';
  return String(v);
}

// ------------------------------------------------------------------------------------- the level API
/** the world as the Python scripts see it: KikiWorld plus py/world.py's extensions, and the scripts'
 * own attributes on it (world.switch_counter, world.level_index, ...) in `v` */
export class LevelWorld {
  v: Record<string, any> = {};
  readonly CAMERA_INSIDE = CAMERA_INSIDE;
  readonly CAMERA_BEHIND = CAMERA_BEHIND;
  readonly CAMERA_FOLLOW = CAMERA_FOLLOW;
  private game: KikiGame;
  constructor(game: KikiGame) {
    this.game = game;
  }
  private get w() { return this.game.C.world; }
  private api<T>(op: unknown[] | null, f: () => T): T { return this.game.apiCall(op, f); }

  getSize(): KikiPos { return this.w.getSize(); }
  getProjection() { return this.w.getProjection(); }
  setCameraMode(m: number): void { this.api(['camera', m], () => this.w.setCameraMode(m)); }
  getOccupantAtPos(p: KikiPos): any { return this.api(null, () => this.w.getOccupantAtPos(p)); }
  isUnoccupiedPos(p: KikiPos): boolean { return this.api(null, () => this.w.isUnoccupiedPos(p)); }
  getObjectWithName(n: string): any { return this.api(null, () => this.w.getObjectWithName(n)); }
  addObjectAtPos(o: KikiObject, pos: KikiPos | number[]): void {
    const p = Array.isArray(pos) ? KikiPos_(pos[0], pos[1], pos[2]) : pos;
    this.api(['add', this.game.idOf(o), [p.x, p.y, p.z]], () => this.w.addObjectAtPos(o, p));
  }
  removeObject(o: KikiObject): void { this.api(['remove', this.game.idOf(o)], () => this.w.removeObject(o)); }
  deleteObject(o: KikiObject): void { this.api(['delete', this.game.idOf(o)], () => this.w.deleteObject(o)); }

  /** toggles object with name objectName */
  toggle(objectName: string): void {
    this.game.record(['toggle', objectName]);
    this.api(null, () => this.game.C.startTimedAction(this.w.getObjectWithName(objectName)!.getActionWithName('toggle')!));
  }
  /** activates object with name objectName */
  activate(objectName: string): void {
    const object = this.getObjectWithName(objectName)!;
    this.game.record(['activate', objectName]);
    this.api(null, () => { if (object instanceof KikiSwitch) object.setActive(1); });
  }
  decenter(...args: (number | number[])[]): KikiPos {
    const s = this.getSize();
    const [x, y, z] = args.length === 3 ? (args as number[]) : (args[0] as number[]);
    return KikiPos_(x + Math.floor(s.x / 2), y + Math.floor(s.y / 2), z + Math.floor(s.z / 2));
  }
  /** `object()`: a Python callable, which may be a class */
  private make(object: () => KikiObject): KikiObject {
    return this.game.apiClasses.has(object) ? new (object as unknown as new () => KikiObject)() : object();
  }
  /** adds a line of objects; start and end are 3-tuples or KikiPos objects */
  addObjectLine(object: () => KikiObject, start: KikiPos | number[], end: KikiPos | number[]): void {
    const s = start instanceof KikiPos ? [start.x, start.y, start.z] : start;
    const e = end instanceof KikiPos ? [end.x, end.y, end.z] : end;
    const diff = e.map((a, i) => a - s[i]);
    const maxdiff = Math.max(...diff.map(Math.abs));
    const deltas = diff.map((a) => a / maxdiff);
    for (let i = 0; i < maxdiff; i++) {
      const pos = KikiPos_(...(s.map((a, j) => Math.trunc(a + i * deltas[j])) as [number, number, number]));
      if (this.isUnoccupiedPos(pos)) this.addObjectAtPos(this.make(object), pos);
    }
  }
  addObjectPoly(object: () => KikiObject, points: (KikiPos | number[])[], close: number | undefined = 1): void {
    if (close) points.push(points[0]);
    for (let index = 1; index < points.length; index++) this.addObjectLine(object, points[index - 1], points[index]);
  }
  addObjectRandom(object: () => KikiObject, number: number): void {
    for (let i = 0; i < number; i++) this.setObjectRandom(this.make(object));
  }
  /** adds the object at a random free position (Python's random module) */
  setObjectRandom(object: KikiObject): void {
    const size = this.getSize();
    for (;;) {
      const p = KikiPos_(this.game.pyRandom(size.x), this.game.pyRandom(size.y), this.game.pyRandom(size.z));
      if (!object.isSpaceEgoistic() || this.isUnoccupiedPos(p)) {
        this.game.record(['random', this.game.idOf(object)]);
        this.api(null, () => this.w.addObjectAtPos(object, p));
        return;
      }
    }
  }
}

/** KikiPos(x, y, z): the SWIG wrapper takes ints only */
function KikiPos_(x: number, y: number, z = 0): KikiPos {
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) throw new TypeError(`KikiPos needs int, got ${x} ${y} ${z}`);
  return new KikiPos(x, y, z);
}

export interface LevelApi {
  world: LevelWorld;
  KikiPos: typeof KikiPos_;
  KColor: (r: number, g: number, b: number, a?: number) => [number, number, number, number];
  KikiFace: typeof KikiFace;
  KVector: (x?: number, y?: number, z?: number) => KVector;
  KQuaternion: { rotationAroundVector: (a: number, v: KVector) => KQuaternion };
  continuous: (fn: () => unknown) => KikiPyAction;
  once: (fn: () => unknown) => KikiPyAction;
  range: (...a: number[]) => number[];
  pmod: (a: number, b: number) => number;
  pyStr: (v: unknown) => string;
  applyColorScheme: (s: Record<string, Record<string, number[]>>) => void;
  kikiObjectToGate: <T>(o: T) => T;
  kikiObjectToSwitch: <T>(o: T) => T;
  schemes: typeof SCHEMES;
  KikiWall: typeof KikiWall; KikiStone: typeof KikiStone; KikiWireStone: typeof KikiWireStone;
  KikiBomb: typeof KikiBomb; KikiSwitch: typeof KikiSwitch; KikiGate: typeof KikiGate; KikiLight: typeof KikiLight;
  KikiMutant: typeof KikiMutant; KikiWire: typeof KikiWire; KikiGear: typeof KikiGear; KikiValve: typeof KikiValve;
  KikiGenerator: typeof KikiGenerator; KikiMotorGear: typeof KikiMotorGear; KikiMotorCylinder: typeof KikiMotorCylinder;
  KikiSpikes: typeof KikiSpikes; KikiCellText: typeof KikiCellText;
}

/** Python's range() (ints only here; the translator truncates floats as Python 2.4 did) */
function range(a: number, b?: number, step = 1): number[] {
  if (b === undefined) { b = a; a = 0; }
  const out: number[] = [];
  if (step > 0) for (let i = a; i < b; i += step) out.push(i);
  else for (let i = a; i > b; i += step) out.push(i);
  return out;
}
const pmod = (a: number, b: number): number => ((a % b) + b) % b;

/** Python's random.randrange (Mersenne Twister, seeded from the clock in the original) */
export class PyRandom {
  private next: () => number;
  constructor(next: () => number = Math.random) {
    this.next = next;
  }
  randrange(n: number): number { return Math.floor(this.next() * n); }
}

// --------------------------------------------------------------------------------------- KikiPyWorld
class KikiPyActionObject implements PyTarget {
  performAction(_name: string, _time: number): void {}
  finishAction(_name: string): void {}
  actionFinished(_name: string): void {}
}

export class KikiPyWorld extends KikiPyActionObject {
  preview = false;
  dict!: LevelDef;
  private game: KikiGame;
  constructor(game: KikiGame) { super();
    this.game = game;
  }

  /** creates the world from a level name or a dictionary */
  create(world_dict: string | LevelDef | null = null): void {
    const g = this.game;
    const C = g.C;
    const world = C.world;
    const W = g.levelWorld;
    if (world_dict) {
      if (typeof world_dict === 'string') {
        W.v.level_index = LEVEL_LIST.indexOf(world_dict);
        W.v.level_name = world_dict;
        this.dict = LEVELS[world_dict];
      } else {
        this.dict = world_dict;
      }
    }
    const d = this.dict;
    // ...................................................... appearance
    const [x, y, z] = d.size;
    g.record(['size', [x, y, z]]);
    world.setSize(x, y, z);
    const scheme = d.scheme ?? 'default_scheme';
    g.record(['scheme', scheme]);
    applyColorScheme(SCHEMES[scheme]);
    world.setDisplayBorder(d.border ?? 1);
    // ...................................................... intro text
    if (d.intro !== undefined) {
      if (!this.preview) {
        const intro_text = new KikiScreenText();
        intro_text.addText(d.intro);
        intro_text.show();
      }
      world.setName(d.intro);
    } else {
      world.setName('noname');
    }
    if (this.preview) world.getProjection().setViewport(0.0, 0.4, 1.0, 0.6);
    else world.getProjection().setViewport(0.0, 0.0, 1.0, 1.0);
    // ...................................................... escape
    const escape_event = C.getEventWithName('escape')!;
    escape_event.removeAllActions();
    escape_event.addAction(continuous(() => this.escape(), 'escape'));
    // ...................................................... exits
    if (d.exits) {
      let exit_id = 0;
      for (const entry of d.exits) {
        const exit_gate = g.apiNew(KikiGate, [entry.active]);
        const name = entry.name ?? 'exit ' + exit_id;
        g.record(['name', g.idOf(exit_gate), name]);
        exit_gate.setName(name);
        const exit_action = once(this, 'exit ' + exit_id);
        const delay_action = once(() => C.timer_event.addAction(exit_action));
        exit_gate.getEventWithName('enter')!.addAction(delay_action);
        const pos = entry.position ? W.decenter(entry.position) : KikiPos_(entry.coordinates![0], entry.coordinates![1], entry.coordinates![2]);
        W.addObjectAtPos(exit_gate, pos);
        exit_id++;
      }
    }
    // ...................................................... creation
    if (d.create) d.create(g.levelApi);
    // ...................................................... player
    const player = C.player;
    const pd = d.player;
    g.record(['new', g.idOf(player), 'KikiPlayer', []]);
    const orientation = pd.orientation ?? { name: 'roty90' };
    g.record(['orientation', g.idOf(player), orientation]);
    player.setOrientation(quaternion(orientation));
    if (pd.position) W.addObjectAtPos(player, W.decenter(pd.position));
    else if (pd.coordinates) W.addObjectAtPos(player, KikiPos_(pd.coordinates[0], pd.coordinates[1], pd.coordinates[2]));
    if (pd.nostatus !== undefined) {
      if (pd.nostatus || this.preview) C.player_status.hide();
      else C.player_status.show();
    } else if (this.preview) C.player_status.hide();
    else C.player_status.show();
    world.getProjection().setPosition(new KVector());
    C.player.getStatus().setMinMoves(g.highscore.levelParMoves(W.v.level_name));
    C.player.getStatus().setMoves(0);
    // ...................................................... init
    world.init(); // tell the world that we are finished
  }

  /** restores the player status and restarts the current level */
  restart(): void {
    const C = this.game.C;
    C.player.getStatus().setMoves(0);
    C.player.reborn();
    this.create();
  }

  /** saves the current level status in the highscore file */
  finish(): void {
    this.game.highscore.levelFinished(this.game.levelWorld.v.level_name, this.game.C.player.getStatus().getMoves());
  }

  /** action callback, used to exit the current world */
  performAction(name: string, _time: number): void {
    if (name.indexOf('exit') === 0) {
      this.finish();
      this.game.C.player.getStatus().setMoves(0);
      const exit = this.dict.exits![Number(name.substring(5))];
      if (exit.world !== undefined) {
        if (exit.world === 'outro') this.game.outro();
      } else {
        new KikiPyWorld(this.game).create(LEVEL_LIST[this.game.levelWorld.v.level_index + 1]);
      }
    }
  }

  /** displays help messages */
  help(index = 0): void {
    const C = this.game.C;
    const text_list = this.dict.help!;
    const more_text = index < text_list.length - 1;
    const less_text = index > 0;
    const list = text_list[index].split('$key(');
    for (let i = 1; i < list.length; i++) {
      const close = list[i].indexOf(')');
      list[i] = KikiPlayer.getKeyForAction(list[i].substring(0, close)) + list[i].substring(close + 1);
    }
    list.push(`\n\n$scale(0.5)(${index + 1}/${text_list.length})`);
    const help_text = new KikiPageText(list.join(''), more_text, less_text);
    if (more_text) help_text.getEventWithName('next')!.addAction(once(() => this.help(index + 1)));
    if (less_text) help_text.getEventWithName('previous')!.addAction(once(() => this.help(index - 1)));
    void C;
  }

  resetProjection(): void { this.game.C.world.getProjection().setViewport(0.0, 0.0, 1.0, 1.0); }

  /** handles an ESC key event */
  escape(): void {
    const g = this.game;
    const C = g.C;
    this.resetProjection();
    const menu = new KikiMenu();
    menu.getEventWithName('hide')!.addAction(once(() => this.resetProjection()));
    if (C.isDebugVersion()) menu.addItem(g.tr('next level'), once(() => this.performAction('exit 0', 0)));
    if (this.dict.help !== undefined) menu.addItem(g.tr('help'), once(() => this.help()));
    menu.addItem(g.tr('restart'), once(() => this.restart()));
    const esc_menu_action = once(() => this.escape());
    const i = g.levelWorld.v.level_index;
    menu.addItem(g.tr('load level'), once(() => g.levelSelection(i, esc_menu_action)));
    menu.addItem(g.tr('setup'), once(() => g.quickSetup()));
    menu.addItem(g.tr('about'), once(() => g.display_about()));
    menu.addItem(g.tr('quit'), once(() => C.quit()));
  }
}

// ----------------------------------------------------------------------------------------- the game
export interface GameHooks {
  storage: KikiStorage;
  getFullscreen(): boolean;
  setFullscreen(b: boolean): void;
  /** Python's random module (setObjectRandom) */
  random?: () => number;
}

export class KikiGame {
  C: KikiController;
  storage: KikiStorage;
  levelWorld: LevelWorld;
  levelApi: LevelApi;
  highscore!: KikiHighscore;
  config!: KikiConfig;
  private rng: PyRandom;
  /** recording of the level scripts' world calls (tests) */
  recording: unknown[][] | null = null;
  private apiDepth = 0;
  private ids = new Map<KikiObject, number>();
  /** the classes the scripts see (Python calls a class to make an object) */
  apiClasses = new Set<unknown>();

  private hooks: GameHooks;
  constructor(C: KikiController, hooks: GameHooks) {
    this.hooks = hooks;
    this.C = C;
    this.storage = hooks.storage;
    this.rng = new PyRandom(hooks.random);
    this.levelWorld = new LevelWorld(this);
    this.levelApi = this.makeApi();
    C.getLocalizedString = (t) => this.tr(t);
  }

  getFullscreen(): boolean { return this.hooks.getFullscreen(); }
  setFullscreen(b: boolean): void { this.hooks.setFullscreen(b); }
  pyRandom(n: number): number { return this.rng.randrange(n); }

  /** py/lang.py getLocalizedString */
  tr(text: string): string {
    const l = LANG[this.C.language];
    return l && Object.prototype.hasOwnProperty.call(l, text) ? l[text] : text;
  }

  // ...................................................................... recording (for the tests)
  idOf(o: KikiObject): number {
    if (!this.ids.has(o)) this.ids.set(o, this.ids.size + 1);
    return this.ids.get(o)!;
  }
  record(op: unknown[]): void {
    if (this.recording && this.apiDepth === 0) this.recording.push(op);
  }
  /** a call into the C++ side: recorded when the script made it, not when C++ made it */
  apiCall<T>(op: unknown[] | null, f: () => T): T {
    if (op) this.record(op);
    this.apiDepth++;
    try { return f(); } finally { this.apiDepth--; }
  }
  apiNew<T extends KikiObject, A extends unknown[]>(cls: new (...a: A) => T, args: A): T {
    const top = this.recording && this.apiDepth === 0;
    const o = this.apiCall(null, () => new cls(...args));
    if (top) {
      const a = args.map((x) => (Array.isArray(x) ? { color: [...x] } : x));
      this.recording!.push(['new', this.idOf(o), (cls as unknown as typeof KikiObject).className, a]);
      this.instrument(o);
    }
    return o;
  }
  /** records the scripts' calls on an object they made (event hooks, setActive) */
  private instrument(o: KikiObject): void {
    const game = this;
    const getEvent = o.getEventWithName.bind(o);
    o.getEventWithName = (name: string) => {
      const e = getEvent(name);
      if (e && game.apiDepth === 0) {
        const add = e.addAction.bind(e);
        return Object.assign(Object.create(e), {
          addAction(a: KikiAction) {
            game.record(['hook', game.idOf(o), name, (a as KikiPyAction).mode === 1 ? 'continuous' : 'once']);
            game.apiCall(null, () => add(a));
          },
        });
      }
      return e;
    };
    const anyO = o as unknown as { setActive?: (b: unknown) => void };
    if (anyO.setActive) {
      const setActive = anyO.setActive.bind(o);
      anyO.setActive = (b: unknown = true) => {
        game.apiCall(game.apiDepth === 0 ? ['setActive', game.idOf(o), !!b] : null, () => setActive(b));
      };
    }
  }

  private makeApi(): LevelApi {
    const game = this;
    const wrap = <C extends new (...a: any[]) => KikiObject>(cls: C): C => {
      const p = new Proxy(cls, { construct: (t, args) => game.apiNew(t as any, args) as object }) as C;
      game.apiClasses.add(p);
      return p;
    };
    return {
      world: this.levelWorld,
      KikiPos: KikiPos_,
      KColor: (r, g, b, a = 1.0) => [r, g, b, a],
      KikiFace,
      KVector: (x = 0, y = 0, z = 0) => new KVector(x, y, z),
      KQuaternion: { rotationAroundVector: KQuaternion.rotationAroundVector },
      continuous: (fn) => continuous(fn),
      once: (fn) => once(fn),
      range,
      pmod,
      pyStr,
      applyColorScheme: (s) => {
        const name = Object.entries(SCHEMES).find(([, v]) => v === s)?.[0] ?? '?';
        game.record(['scheme', name]);
        applyColorScheme(s);
      },
      kikiObjectToGate: (o) => o,
      kikiObjectToSwitch: (o) => o,
      schemes: SCHEMES,
      KikiWall: wrap(KikiWall), KikiStone: wrap(KikiStone), KikiWireStone: wrap(KikiWireStone), KikiBomb: wrap(KikiBomb),
      KikiSwitch: wrap(KikiSwitch), KikiGate: wrap(KikiGate), KikiLight: wrap(KikiLight), KikiMutant: wrap(KikiMutant),
      KikiWire: wrap(KikiWire), KikiGear: wrap(KikiGear), KikiValve: wrap(KikiValve), KikiGenerator: wrap(KikiGenerator),
      KikiMotorGear: wrap(KikiMotorGear), KikiMotorCylinder: wrap(KikiMotorCylinder), KikiSpikes: wrap(KikiSpikes),
      KikiCellText: wrap(KikiCellText),
    };
  }

  /** what KikiPython::initPython runs: env.py, world.py, config.py, setup.py, levels, highscore, intro */
  start(): void {
    this.C.init();
    this.config = new KikiConfig(this);
    this.highscore = new KikiHighscore(this.storage);
    this.levelWorld.v.max_level_index = 0;
    this.display_main_menu();
  }

  // ...................................................................................... menus
  /** py/levels.py outro */
  outro(index = 0): void {
    const outro_text = [
      '$scale(1.5)congratulations!\n\n$scale(1)you rescued\nthe nano world!\n\n' +
        'the last dumb mutant bot\nhas been destroyed.\n\nthe maker is functioning again.\n' +
        'kiki will go now\nand see all his new friends.\n\nyou should maybe\ndo the same?',
      "the maker wants to thank you!\n\n(btw.: you thought\nyou didn't see\nkiki's maker in the game?\n" +
        'you are wrong!\nyou saw him\nall the time,\nbecause kiki\nlives inside him!)\n\n$scale(1.5)the end',
      'p.s.: the maker of the game\nwants to thank you as well!\n\ni definitely want your feedback:\n' +
        'please send me a mail (monsterkodi@users.sf.net)\nwith your experiences,\n' +
        'which levels you liked, etc.\n\nthanks in advance and have a nice day,\n\nyours kodi'];
    const more_text = index < outro_text.length - 1;
    const less_text = index > 0;
    const page_text = outro_text[index] + `\n\n$scale(0.5)(${index + 1}/${outro_text.length})`;
    const page = new KikiPageText(page_text, more_text, less_text);
    page.getEventWithName('hide')!.addAction(once(() => this.display_main_menu()));
    if (more_text) page.getEventWithName('next')!.addAction(once(() => this.outro(index + 1)));
    if (less_text) page.getEventWithName('previous')!.addAction(once(() => this.outro(index - 1)));
  }

  /** py/levelselection.py */
  levelSelection(level_index = -1, escapeAction: KikiPyAction | null = null): void {
    const C = this.C;
    const world = C.world;
    // the original crashes here while no level is solved (last_level -1: an empty menu, Debian bug #503389);
    // the port lists the first level then
    const last_level = Math.max(0, this.highscore.getLastAvailableLevel());
    // (level_index >= 0) and level_index or last_level: index 0 is false in Python
    const current = level_index >= 0 && level_index ? level_index : last_level;
    this.levelWorld.v.max_level_index = last_level;
    const menu = new KikiScrollMenu(5, 3, current);
    const startLevel = (): void => {
      world.setCameraMode(CAMERA_BEHIND);
      new KikiPyWorld(this).create(LEVEL_LIST[menu.getCurrentIndex()]);
    };
    const displayLevel = (index: number): void => {
      const w = new KikiPyWorld(this);
      w.preview = true;
      world.setCameraMode(CAMERA_FOLLOW);
      w.create(LEVEL_LIST[index]);
    };
    menu.circular = false;
    if (escapeAction) menu.getEventWithName('hide')!.addAction(escapeAction);
    else menu.setEscapeActive(false);
    menu.getEventWithName('changed')!.addAction(continuous(() => displayLevel(menu.getCurrentIndex())));
    menu.getProjection().setViewport(0.0, 0.0, 1.0, 0.4);
    for (let index = 0; index < last_level + 1; index++) {
      const level_name = LEVELS[LEVEL_LIST[index]].intro!;
      const user_moves = this.highscore.levelUserMoves(level_name);
      const par_moves = this.highscore.levelParMoves(level_name);
      const result = user_moves ? String(par_moves - user_moves) : 'new';
      menu.addItem(`${index + 1} |${level_name}|${result}    `, once(startLevel));
    }
    displayLevel(current);
    menu.show();
  }

  /** py/intro.py display_story */
  display_story(index = 0): void {
    const story = [this.tr('STORY_PAGE_1'), this.tr('STORY_PAGE_2'), this.tr('STORY_PAGE_3')];
    const more_text = index < story.length - 1;
    const less_text = index > 0;
    const story_text = story[index] + `\n\n$scale(0.5)(${index + 1}/${story.length})`;
    const page = new KikiPageText(story_text, more_text, less_text);
    page.getEventWithName('hide')!.addAction(once(() => this.display_main_menu()));
    if (more_text) page.getEventWithName('next')!.addAction(once(() => this.display_story(index + 1)));
    if (less_text) page.getEventWithName('previous')!.addAction(once(() => this.display_story(index - 1)));
  }

  /** py/intro.py display_statistics */
  display_statistics(escape_action: KikiPyAction): void {
    let score = 0;
    let solved_levels = 0;
    const all_levels = LEVEL_LIST.length;
    for (const level_name of LEVEL_LIST) {
      const user_moves = this.highscore.levelUserMoves(level_name);
      const par_moves = this.highscore.levelParMoves(level_name);
      if (user_moves) {
        score += par_moves - user_moves;
        solved_levels += 1;
      }
    }
    const values = [solved_levels, all_levels, score];
    const statistics = this.tr('STATISTICS_TEXT').replace(/%d/g, () => String(values.shift()));
    const page = new KikiScreenText();
    page.addText(statistics);
    page.getEventWithName('hide')!.addAction(escape_action);
    this.C.getEventWithName('escape')!.removeAllActions();
    page.show();
  }

  /** py/intro.py display_about */
  display_about(): void {
    const t = (s: string): string => this.tr(s);
    const m = new KikiMenu();
    m.getEventWithName('hide')!.addAction(once(() => this.display_main_menu()));
    m.addItem('$no_item' + t('kiki the nano bot'));
    m.addItem('$no_item$scale(0.7)' + t('version') + ' 1.0.0');
    m.addItem('$no_item');
    m.addItem('$no_item' + '|' + t('programmed by'));
    m.addItem('$no_item');
    m.addItem('$no_item kodi: |monsterkodi@users.sf.net');
    m.addItem('$no_item');
    m.addItem('$no_item' + '|' + t('levels'));
    m.addItem('$no_item');
    m.addItem('$no_item' + 'Michael Abel: |blocks, borg, circuit, conductor, cube, edge,');
    m.addItem('$no_item' + ' |entropy, flower, gamma, machine, maze, mesh,');
    m.addItem('$no_item' + ' |mini, neutron, nice, plate, pool, random,');
    m.addItem('$no_item' + ' |sandbox, slick, throw, walls');
    m.addItem('$no_item' + 'Niko Boehm: |captured');
    m.addItem('$no_item' + 'Ben Griffin: |towers');
    m.addItem('$no_item');
    m.addItem('$no_item' + '|' + t('translations'));
    m.addItem('$no_item');
    m.addItem('$no_item' + 'Arthur Langereis: |dutch');
    m.addItem('$no_item' + '3ARRANO.com: |euskara');
    m.addItem('$no_item' + 'F.C.Covett: |portuguese');
    m.addItem('$no_item' + 'jay traveller: |spanish');
    m.addItem('$no_item' + 'Ivan aka Fenris: |swedish');
    m.addItem('$no_item');
    m.addItem(t('main menu'), once(() => this.display_main_menu()));
  }

  /** py/intro.py display_main_menu */
  display_main_menu(): void {
    const C = this.C;
    const m = new KikiMenu(2);
    m.getProjection().setViewport(0.0, 0.0, 1.0, 0.4);
    m.setEscapeActive(C.isDebugVersion());
    const main_menu_action = once(() => this.display_main_menu());
    m.addItem('$no_item$scale(2)' + this.tr('kiki the nano bot'));
    m.addItem('$no_item');
    let last_level = this.highscore.getLastLevel();
    if (last_level >= 0) {
      const ll = last_level;
      m.addItem(this.tr('continue'), once(() => new KikiPyWorld(this).create(LEVEL_LIST[ll])));
      m.addItem(this.tr('load level'), once(() => this.levelSelection(ll, main_menu_action)));
      m.addItem(this.tr('statistics'), once(() => this.display_statistics(main_menu_action)));
    } else {
      last_level = 0;
    }
    m.addItem(this.tr('new game'), once(() => new KikiPyWorld(this).create(LEVEL_LIST[0])));
    m.addItem(this.tr('setup'), once(() => this.quickSetup(0, () => this.display_main_menu())));
    m.addItem(this.tr('story'), once(() => this.display_story()));
    m.addItem(this.tr('about'), once(() => this.display_about()));
    m.addItem(this.tr('quit'), once(() => C.quit()));
    const w = new KikiPyWorld(this);
    w.preview = true;
    C.world.setCameraMode(CAMERA_FOLLOW);
    C.world.getProjection().setPosition(new KVector(0, 0, 0));
    w.create(LEVEL_LIST[Math.min(last_level, LEVEL_LIST.length - 1)]);
  }

  /** py/setup.py quickSetup */
  quickSetup(itemIndex = 0, escapeAction: (() => void) | null = null): void {
    const C = this.C;
    const sound = C.sound;
    const menu = new KikiMenu(itemIndex);
    const config = this.config;
    const lang_list = ['dutch', 'english', 'euskara', 'german', 'portuguese', 'spanish', 'swedish'];
    const setupOption = (option: string): KikiPyAction => {
      let idx = 0;
      let option_func: () => void = () => {};
      if (option === 'language') {
        idx = 2;
        let langIndex = lang_list.indexOf(C.language) + 1;
        if (langIndex >= lang_list.length) langIndex = 0;
        option_func = () => config.apply('game', 'language', lang_list[langIndex]);
      } else if (option === 'mute') {
        idx = 3;
        option_func = () => config.apply('sound', 'mute', !C.sound.isMute());
      } else if (option === 'volume') {
        idx = 4;
        let volume = Math.floor(sound.getSoundVolume() / Math.trunc(128 / 9)) + 1;
        if (volume > 10) volume = 1;
        option_func = () => config.apply('sound', 'volume', volume);
      } else if (option === 'fullscreen') {
        idx = 5;
        option_func = () => config.apply('display', 'fullscreen', !this.getFullscreen());
      } else if (option === 'fov') {
        idx = 6;
        let fov = Math.trunc(C.world.getProjection().getFov()) + 10;
        if (fov > 120) fov = 60;
        option_func = () => config.apply('display', 'fov', fov);
      } else if (option === 'gamma') {
        idx = 7;
        let gamma = C.getGamma() + 1;
        if (gamma > 10) gamma = 0;
        option_func = () => config.apply('display', 'gamma', gamma);
      } else if (option === 'speed') {
        idx = 8;
        let speed = C.getSpeed() + 1;
        if (speed > 10) speed = 1;
        option_func = () => config.apply('game', 'speed', speed);
      }
      return once(() => { option_func(); this.quickSetup(idx, escapeAction); });
    };
    const t = (s: string): string => this.tr(s);
    menu.addItem('$no_item' + t('setup'));
    menu.addItem('$no_item');
    menu.addItem(t('language') + ': |' + C.language, setupOption('language'), true);
    menu.addItem(t('sound') + ': |' + (sound.isMute() ? t('off') : t('on')), setupOption('mute'), true);
    menu.addItem(t('volume') + ': |' + Math.trunc(sound.getSoundVolume() / Math.trunc(128 / 9)), setupOption('volume'), true);
    menu.addItem(t('fullscreen') + ': |' + (this.getFullscreen() ? t('on') : t('off')), setupOption('fullscreen'), true);
    menu.addItem(t('fov') + ': |' + Math.trunc(C.world.getProjection().getFov()), setupOption('fov'), true);
    menu.addItem('gamma: |' + Math.trunc(C.getGamma()), setupOption('gamma'), true);
    menu.addItem(t('speed') + ': |' + C.getSpeed(), setupOption('speed'), true);
    let saveAction: KikiPyAction;
    if (escapeAction) {
      menu.getEventWithName('hide')!.addAction(once(escapeAction));
      saveAction = once(() => { config.save(); escapeAction(); });
    } else {
      saveAction = once(() => config.save());
    }
    menu.addItem('$no_item');
    menu.addItem(t('keyboard setup'), once(() => this.quickKeySetup(0, () => this.quickSetup(0, escapeAction))));
    menu.addItem(t('save'), saveAction);
  }

  /** py/setup.py quickKeySetup */
  quickKeySetup(item_index = 0, escapeAction: (() => void) | null = null): void {
    const C = this.C;
    const menu = new KikiMenu(item_index);
    const action_names = ['$no_itemkeyboard setup', '$no_item', 'move forward', 'move backward', 'turn left',
      'turn right', '$no_item', 'jump', 'push', 'shoot', '$no_item', 'change view', 'look up', 'look down'];
    const player = C.player;
    const t = (s: string): string => this.tr(s);
    const changeKey = (action_index: number): void => {
      const tmp_menu = new KikiMenu(action_index);
      action_names.forEach((action_name, idx) => {
        if (action_name.indexOf('$no_item') >= 0) tmp_menu.addItem(t(action_name));
        else {
          const action_key = action_index !== idx ? KikiPlayer.getKeyForAction(action_name) : '';
          tmp_menu.addItem(t(action_name) + ': |' + action_key);
        }
      });
      tmp_menu.addItem('$no_item');
      tmp_menu.addItem('$no_item$scale(0.75)' + t('press the new key'));
      const hideTmpMenu = (): void => C.timer_event.addAction(tmp_menu.getActionWithName('delete')!);
      const keyset_event = player.getEventWithName('keyset')!;
      keyset_event.removeAllActions();
      keyset_event.addAction(once(() => { hideTmpMenu(); this.quickKeySetup(action_index, escapeAction); }));
      player.recordKeyForAction(action_names[action_index]);
    };
    let undefined_keys = false;
    action_names.forEach((action_name, action_index) => {
      if (action_name.indexOf('$no_item') >= 0) menu.addItem(t(action_name));
      else {
        const action_key = KikiPlayer.getKeyForAction(action_name);
        if (!action_key) undefined_keys = true;
        menu.addItem(t(action_name) + ': |' + action_key, once(() => changeKey(action_index)));
      }
    });
    menu.addItem('$no_item');
    if (undefined_keys) {
      menu.addItem('$no_item$scale(0.75)' + t('action without key') + '!');
      menu.setEscapeActive(false);
    } else if (escapeAction) {
      menu.addItem('$scale(0.75)' + t('back to setup'), once(escapeAction));
    } else {
      menu.addItem('$scale(0.75)' + t('back to setup'), once(() => this.quickSetup()));
    }
    if (escapeAction) menu.getEventWithName('hide')!.addAction(once(escapeAction));
  }
}
