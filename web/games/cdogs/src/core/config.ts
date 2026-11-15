// C-Dogs SDL 2.5.0, translated: config.c (the options, their defaults, limits and steps; ConfigDefault) and the
// enum string tables of config.h. GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
// The original keeps them in options.cnf (config_json.c); the port keeps them in the player's server storage
// (platform/storage.ts), in the same JSON layout.

export type ConfigValue = number | boolean | string;

export interface ConfigEntry {
  name: string;
  type: 'int' | 'bool' | 'enum' | 'float' | 'string';
  value: ConfigValue;
  def: ConfigValue;
  last: ConfigValue;
  min?: number;
  max?: number;
  inc?: number;
  /** int: value to string for menus (PercentStr, Div8Str); enum: index to string */
  str?: (v: number) => string;
  /** enum: string to index */
  fromStr?: (s: string) => number;
}

export const DIFFICULTY_VERYEASY = 0;
export const DIFFICULTY_EASY = 1;
export const DIFFICULTY_NORMAL = 2;
export const DIFFICULTY_HARD = 3;
export const DIFFICULTY_VERYHARD = 4;
export const FIREMOVE_STOP = 0;
export const FIREMOVE_NORMAL = 1;
export const FIREMOVE_STRAFE = 2;
export const SWITCHMOVE_SLIDE = 0;
export const SWITCHMOVE_STRAFE = 1;
export const SWITCHMOVE_NONE = 2;
export const ALLYCOLLISION_NORMAL = 0;
export const ALLYCOLLISION_REPEL = 1;
export const ALLYCOLLISION_NONE = 2;
export const LASER_SIGHT_NONE = 0;
export const LASER_SIGHT_PLAYERS = 1;
export const LASER_SIGHT_ALL = 2;
export const GORE_NONE = 0;
export const GORE_LOW = 1;
export const GORE_MEDIUM = 2;
export const GORE_HIGH = 3;
export const SCALE_MODE_NN = 0;
export const SCALE_MODE_BILINEAR = 1;
export const AICHATTER_NONE = 0;
export const AICHATTER_SELDOM = 1;
export const AICHATTER_OFTEN = 2;
export const AICHATTER_ALWAYS = 3;
export const SPLITSCREEN_NORMAL = 0;
export const SPLITSCREEN_ALWAYS = 1;
export const SPLITSCREEN_NEVER = 2;
export const QUICKPLAY_QUANTITY_ANY = 0;
export const QUICKPLAY_QUANTITY_SMALL = 1;
export const QUICKPLAY_QUANTITY_MEDIUM = 2;
export const QUICKPLAY_QUANTITY_LARGE = 3;

function enumStrs(names: string[]): { str: (v: number) => string; fromStr: (s: string) => number } {
  return { str: (v) => names[v] ?? '', fromStr: (s) => Math.max(0, names.indexOf(s)) };
}
export const DifficultyStrs = enumStrs(['Easiest', 'Easy', 'Normal', 'Hard', 'Very hard']);
export const FireMoveStyleStrs = enumStrs(['Stop', 'Normal', 'Strafe']);
export const SwitchMoveStyleStrs = enumStrs(['Slide', 'Strafe', 'None']);
export const AllyCollisionStrs = enumStrs(['Normal', 'Repel', 'None']);
export const LaserSightStrs = enumStrs(['None', 'Players only', 'All']);
export const GoreAmountStrs = enumStrs(['None', 'Trickle', 'Buckets', 'Torrents']);
export const ScaleModeStrs = enumStrs(['Nearest neighbor', 'Bilinear']);
export const AIChatterStrs = enumStrs(['None', 'Seldom', 'Often', 'Always']);
export const SplitscreenStyleStrs = enumStrs(['Normal', 'Always', 'Never']);
export const QuickPlayQuantityStrs = enumStrs(['Any', 'Small', 'Medium', 'Large']);

export const PercentStr = (p: number): string => `${p}%`;
export const Div8Str = (i: number): string => `${Math.trunc(i / 8)}`;

const INT_MAX = 2147483647;

// SDL scancodes of the defaults (SDL_scancode.h)
export const SDL_SCANCODE = {
  A: 4, S: 22, X: 27, Z: 29, RIGHT: 79, LEFT: 80, DOWN: 81, UP: 82, KP_ENTER: 88, KP_2: 90, KP_3: 91, KP_4: 92,
  KP_6: 94, KP_8: 96, KP_0: 98, KP_PERIOD: 99,
} as const;

const entries = new Map<string, ConfigEntry>();
const groups: string[] = [];

function add(name: string, e: Omit<ConfigEntry, 'name' | 'last' | 'value'>): void {
  entries.set(name, { ...e, name, value: e.def, last: e.def });
}
function int(name: string, def: number, min: number, max: number, inc: number, str?: (v: number) => string): void {
  add(name, { type: 'int', def, min, max, inc, str });
}
function bool(name: string, def: boolean): void {
  add(name, { type: 'bool', def });
}
function en(name: string, def: number, min: number, max: number, s: { str: (v: number) => string; fromStr: (s: string) => number }): void {
  add(name, { type: 'enum', def, min, max, inc: 1, str: s.str, fromStr: s.fromStr });
}

// ConfigDefault()
groups.push('Game');
bool('Game.FriendlyFire', false);
int('Game.RandomSeed', 0, 0, INT_MAX, 1);
en('Game.Difficulty', DIFFICULTY_NORMAL, DIFFICULTY_VERYEASY, DIFFICULTY_VERYHARD, DifficultyStrs);
int('Game.FPS', 70, 10, 120, 10);
bool('Game.Superhot(tm)Mode', false);
int('Game.EnemyDensity', 100, 25, 200, 25, PercentStr);
int('Game.NonPlayerHP', 100, 25, 200, 25, PercentStr);
int('Game.PlayerHP', 75, 25, 200, 25, PercentStr);
int('Game.Lives', 2, 1, 5, 1);
bool('Game.HealthPickups', true);
bool('Game.Fog', true);
int('Game.SightRange', 15, 8, 40, 1);
en('Game.FireMoveStyle', FIREMOVE_STOP, FIREMOVE_STOP, FIREMOVE_STRAFE, FireMoveStyleStrs);
en('Game.SwitchMoveStyle', SWITCHMOVE_SLIDE, SWITCHMOVE_SLIDE, SWITCHMOVE_NONE, SwitchMoveStyleStrs);
en('Game.AllyCollision', ALLYCOLLISION_REPEL, ALLYCOLLISION_NORMAL, ALLYCOLLISION_NONE, AllyCollisionStrs);
en('Game.LaserSight', LASER_SIGHT_NONE, LASER_SIGHT_NONE, LASER_SIGHT_ALL, LaserSightStrs);
bool('Game.NoFestiveHats', false);
groups.push('Deathmatch');
int('Deathmatch.Lives', 10, 1, 20, 1);
groups.push('Dogfight');
int('Dogfight.PlayerHP', 100, 25, 200, 25, PercentStr);
int('Dogfight.FirstTo', 5, 1, 10, 1);
groups.push('Graphics');
int('Graphics.Brightness', 0, -10, 10, 1);
bool('Graphics.Fullscreen', false);
int('Graphics.WindowWidth', 640, 320, 4096, 0);
int('Graphics.WindowHeight', 480, 200, 2160, 0);
int('Graphics.ScaleFactor', 2, 1, 16, 1);
bool('Graphics.DOSPAR', true);
int('Graphics.ShakeMultiplier', 1, 0, 10, 1);
bool('Graphics.ShowHUD', true);
en('Graphics.ScaleMode', SCALE_MODE_NN, SCALE_MODE_NN, SCALE_MODE_BILINEAR, ScaleModeStrs);
bool('Graphics.Shadows', true);
en('Graphics.Gore', GORE_LOW, GORE_NONE, GORE_HIGH, GoreAmountStrs);
bool('Graphics.Brass', true);
bool('Graphics.SecondWindow', false);
groups.push('Input');
for (const [p, keys] of [
  ['PlayerCodes0', [SDL_SCANCODE.LEFT, SDL_SCANCODE.RIGHT, SDL_SCANCODE.UP, SDL_SCANCODE.DOWN, SDL_SCANCODE.X, SDL_SCANCODE.Z,
    SDL_SCANCODE.S, SDL_SCANCODE.A]],
  ['PlayerCodes1', [SDL_SCANCODE.KP_4, SDL_SCANCODE.KP_6, SDL_SCANCODE.KP_8, SDL_SCANCODE.KP_2, SDL_SCANCODE.KP_ENTER,
    SDL_SCANCODE.KP_PERIOD, SDL_SCANCODE.KP_3, SDL_SCANCODE.KP_0]],
] as const) {
  const names = ['left', 'right', 'up', 'down', 'button1', 'button2', 'grenade', 'map'];
  names.forEach((n, i) => int(`Input.${p}.${n}`, keys[i], 0, 0, 0));
}
groups.push('Interface');
bool('Interface.ShowFPS', false);
bool('Interface.ShowTime', false);
bool('Interface.ShowHUDMap', true);
en('Interface.AIChatter', AICHATTER_SELDOM, AICHATTER_NONE, AICHATTER_ALWAYS, AIChatterStrs);
en('Interface.Splitscreen', SPLITSCREEN_NEVER, SPLITSCREEN_NORMAL, SPLITSCREEN_NEVER, SplitscreenStyleStrs);
bool('Interface.SplitscreenAI', false);
groups.push('Sound');
int('Sound.MusicVolume', 32, 0, 64, 8, Div8Str);
int('Sound.SoundVolume', 64, 0, 64, 8, Div8Str);
bool('Sound.Footsteps', true);
bool('Sound.Reloads', true);
groups.push('QuickPlay');
for (const n of ['MapSize', 'WallCount', 'WallLength', 'RoomCount', 'SquareCount', 'EnemyCount', 'EnemySpeed', 'EnemyHealth']) {
  en(`QuickPlay.${n}`, QUICKPLAY_QUANTITY_ANY, QUICKPLAY_QUANTITY_ANY, QUICKPLAY_QUANTITY_LARGE, QuickPlayQuantityStrs);
  if (n === 'EnemyHealth') bool('QuickPlay.EnemiesWithExplosives', true);
}
en('QuickPlay.ItemCount', QUICKPLAY_QUANTITY_ANY, QUICKPLAY_QUANTITY_ANY, QUICKPLAY_QUANTITY_LARGE, QuickPlayQuantityStrs);
bool('StartServer', false);
int('ListenPort', 34219, 0, 65535, 1);

export function ConfigGet(name: string): ConfigEntry {
  const e = entries.get(name);
  if (!e) throw new Error(`no config ${name}`);
  return e;
}
export const ConfigGetInt = (name: string): number => ConfigGet(name).value as number;
export const ConfigGetBool = (name: string): boolean => ConfigGet(name).value as boolean;
export const ConfigGetEnum = (name: string): number => ConfigGet(name).value as number;
export function ConfigSetInt(name: string, value: number): void {
  const e = ConfigGet(name);
  e.value = Math.max(e.min ?? -INT_MAX, Math.min(e.max ?? INT_MAX, value));
}
export function ConfigSet(name: string, value: ConfigValue): void {
  ConfigGet(name).value = value;
}
export function ConfigAll(): ConfigEntry[] {
  return [...entries.values()];
}
export function ConfigGroup(prefix: string): ConfigEntry[] {
  return ConfigAll().filter((e) => e.name.startsWith(prefix + '.'));
}
export function ConfigResetDefault(prefix: string): void {
  for (const e of ConfigAll()) if (prefix === '' || e.name === prefix || e.name.startsWith(prefix + '.')) e.value = e.def;
}
/** ConfigSetChanged: remember the values (the options menu compares against them) */
export function ConfigSetChanged(prefix = ''): void {
  for (const e of ConfigAll()) if (prefix === '' || e.name.startsWith(prefix)) e.last = e.value;
}
export function ConfigResetChanged(prefix = ''): void {
  for (const e of ConfigAll()) if (prefix === '' || e.name.startsWith(prefix)) e.value = e.last;
}
export function ConfigChanged(prefix = ''): boolean {
  return ConfigAll().some((e) => (prefix === '' || e.name.startsWith(prefix)) && e.value !== e.last);
}

/** config_json.c ConfigSave: a nested object of the values, the file's "Version" 9 */
export function ConfigToJSON(): string {
  const root: Record<string, unknown> = { Version: 9 };
  for (const e of ConfigAll()) {
    const parts = e.name.split('.');
    let o = root;
    for (let i = 0; i < parts.length - 1; i++) {
      o[parts[i]] = o[parts[i]] ?? {};
      o = o[parts[i]] as Record<string, unknown>;
    }
    o[parts[parts.length - 1]] = e.type === 'enum' ? e.str!(e.value as number) : e.value;
  }
  return JSON.stringify(root, null, '\t');
}
export function ConfigFromJSON(text: string): void {
  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    return;
  }
  for (const e of ConfigAll()) {
    let o: unknown = root;
    for (const p of e.name.split('.')) {
      if (typeof o !== 'object' || o === null) { o = undefined; break; }
      o = (o as Record<string, unknown>)[p];
    }
    if (o === undefined) continue;
    if (e.type === 'enum' && typeof o === 'string') e.value = e.fromStr!(o);
    else if (e.type === 'int' && typeof o === 'number') e.value = Math.trunc(o);
    else if (e.type === 'bool' && typeof o === 'boolean') e.value = o;
  }
  ConfigSetChanged();
}
