// hyper.h of HyperRogue 13.1o: the constants, macros and templates every file uses (the parts stage 1 needs; the
// geometry macros S7, PURE, euclid, ... are in classes.ts next to ginf). A leaf module (PORTING.md, "Modules").
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import type { flagtype } from './content.ts';
import type { cell } from './locations.ts';

export const VER = '13.1o';
export const VERNUM_HEX = 0xAA2F;

/** #define Flag(i) (flagtype(1ull<<i)) */
export function Flag(i: number): flagtype {
  return 1n << BigInt(i);
}

/** among(x, a, b, ...): x == a || x == b || ... */
export function among<T>(x: T, ...ys: T[]): boolean {
  for (const y of ys) if (x === y) return true;
  return false;
}

/** isize(x): x.size() as int */
export function isize(x: { length: number } | { size: number }): number {
  return 'length' in x ? x.length : x.size;
}

// util.cpp (here because the core types need them; util.ts re-exports them)
export function gcd(i: number, j: number): number {
  return i ? gcd(j % i, i) : j;
}
export function gmod(i: number, j: number): number {
  i %= j; if (i < 0) i += j;
  return i;
}
export function zgmod(a: number, b: number): number { return b ? gmod(a, b) : a; }
export function szgmod(a: number, b: number): number {
  if (!b) return a;
  a = gmod(a, b);
  if (2 * a >= b) return a - b;
  return a;
}
export function gdiv(i: number, j: number): number {
  return Math.trunc((i - gmod(i, j)) / j);
}

export const GEN_M = 0;
export const GEN_F = 1;
export const GEN_N = 2;
export const GEN_O = 3;
export const GEN_BASE_MASK = 7;
export const GENF_ELISION = (1 << 3);
export const GENF_PLURALONLY = (1 << 4);
export const GENF_PROPER = (1 << 5);

export const NUMWITCH = 7;
export const BUGCOLORS = 3;
export const HRANDMAX = 0x7FFFFFFF;

export const MD_WAIT = -1;
export const MD_DROP = -2;
export const MD_UNDECIDED = -3;
export const MD_USE_ORB = -4;

/** struct movedir (hyper.h): d >= 0 is 'rotate +d steps and act in this direction', or one of MD_*;
 *  subdir: for normal movement, turn left or right; tgt: for MD_USE_ORB, the target (added by P8) */
export class movedir {
  d = 0;
  subdir = 0;
  tgt: cell = null!;
  clone(): movedir { const m = new movedir(); m.d = this.d; m.subdir = this.subdir; m.tgt = this.tgt; return m; }
}

export const NOHINT = -1;
export const DISTANCE_UNKNOWN = 127;
export const DISTANCE_UNKNOWN_BIG = 99999999;

export const SAGEMELT = .1;
export const ROCKSNAKELENGTH = 50;
export const WORMLENGTH = 15;
export const PRIZEMUL = 7;
export const INF = 9999;
export const INFD = 60;
export const PINFD = 125;
// #define BARLEV ((ISANDROID||ISIOS||ISFAKEMOBILE||getDistLimit()<7)?(getDistLimit()<4?8:9):10): a function of
// getDistLimit() (cell.ts): BARLEV() there.
export const BUGLEV = 15;
export const YDIST = 101;
export const GUNRANGE = 3;
export const MAXPLAYER = 7;
/** #define ORBBASE 0 */
export const ORBBASE = 0;

// attack and move flags (flagtype)
export const AF_NORMAL: flagtype = 0n;
export const AF_TOUGH = Flag(0);
export const AF_MAGIC = Flag(1);
export const AF_STAB = Flag(2);
export const AF_LANCE = Flag(3);
export const AF_ONLY_ENEMY = Flag(4);
export const AF_ONLY_FRIEND = Flag(5);
export const AF_ONLY_FBUG = Flag(6);
export const AF_BACK = Flag(7);
export const AF_APPROACH = Flag(8);
export const AF_IGNORE_UNARMED = Flag(9);
export const AF_NOSHIELD = Flag(10);
export const AF_GETPLAYER = Flag(11);
export const AF_GUN = Flag(12);
export const AF_FAST = Flag(13);
export const AF_EAT = Flag(17);
export const MF_NOATTACKS = Flag(14);
export const MF_PATHDIST = Flag(15);
export const MF_ONLYEAGLE = Flag(16);
export const MF_MOUNT = Flag(18);
export const MF_NOFRIEND = Flag(19);
export const AF_SWORD = Flag(20);
export const AF_SWORD_INTO = Flag(21);
export const AF_MSG = Flag(22);
export const AF_MUSTKILL = Flag(23);
export const AF_NEXTTURN = Flag(24);
export const AF_FALL = Flag(25);
export const MF_STUNNED = Flag(26);
export const MF_IVY = Flag(27);
export const AF_HORNS = Flag(28);
export const AF_BULL = Flag(29);
export const AF_SIDE = Flag(30);
export const AF_CRUSH = Flag(31);
export const AF_PLAGUE = Flag(32);
export const AF_PSI = Flag(33);
export const AF_WEAK = Flag(34);
export const AF_BOW = Flag(35);

/** hookset<T>: hooks ordered by priority (std::map<int, function>); add() bumps a taken priority by one.
 *  Registration order matters for equal priorities, so modules register hooks in a function
 *  `register_<module>()` that hyper.ts's callers run in hyper.cpp's include order (see hyper-main.ts). */
export class hookset<F extends (...args: never[]) => unknown> {
  private map_: Map<number, F> | null = null;
  private sorted: number[] = [];

  add(prio: number, hook: F): number {
    if (this.map_ === null) this.map_ = new Map();
    while (this.map_.has(prio)) prio++;
    this.map_.set(prio, hook);
    this.sorted = [...this.map_.keys()].sort((a, b) => a - b);
    return prio;
  }

  del(prio: number): void {
    this.map_!.delete(prio);
    this.sorted = [...this.map_!.keys()].sort((a, b) => a - b);
  }

  callhooks(...args: Parameters<F>): void {
    if (this.map_ === null) return;
    for (const p of this.sorted) {
      const h = this.map_.get(p);
      if (h) h(...args);
    }
  }

  callhandlers<V>(zero: V, ...args: Parameters<F>): V {
    if (this.map_ === null) return zero;
    for (const p of this.sorted) {
      const h = this.map_.get(p);
      if (!h) continue;
      const z = h(...args) as V;
      if (z !== zero) return z;
    }
    return zero;
  }
}

export type purehookset = hookset<() => void>;
export type reaction_t = () => void;
export type bool_reaction_t = () => boolean;

export function addHook<F extends (...args: never[]) => unknown>(m: hookset<F>, prio: number, hook: F): number {
  return m.add(prio, hook);
}
export function delHook<F extends (...args: never[]) => unknown>(m: hookset<F>, prio: number): void {
  m.del(prio);
}
export function callhooks<F extends (...args: never[]) => unknown>(h: hookset<F>, ...args: Parameters<F>): void {
  h.callhooks(...args);
}
export function callhandlers<V, F extends (...args: never[]) => unknown>(zero: V, h: hookset<F>, ...args: Parameters<F>): V {
  return h.callhandlers(zero, ...args);
}

/** enum class PPR (hyper.h): the drawing priorities (added by stage 2 package D2; `PPR::X` -> `PPR.X`, the
 *  operators `PPR + int`, `PPR - PPR` are plain arithmetic) */
export type PPR = number;
export const PPR = ((): Readonly<Record<string, number>> => {
  const names = [
    'ZERO', 'EUCLIDEAN_SKY', 'OUTCIRCLE', 'MOVESTAR',
    'MINUSINF',
    'DEEP_ESCHER', 'DEEP_SIDE', 'DEEP_FALLANIM', 'DEEP_TOP', 'HELLSPIKE',
    'SHALLOW_ESCHER', 'SHALLOW_SIDE', 'SHALLOW_FALLANIM', 'SHALLOW_TOP',
    'WATERLEVEL_ESCHER', 'WATERLEVEL_SIDE', 'WATERLEVEL_TOP', 'BOATLEV', 'BOATLEV2', 'BOATLEV3',
    'FLOOR_ESCHER', 'FLOOR_SIDE', 'FLOOR_FALLANIM', 'FLOOR_TOWER', 'FLOOR', 'FLOOR_DRAGON',
    'FLOORa', 'FLOORb', 'FLOORc', 'FLOORd',
    'LIZEYE',
    'BFLOOR',
    'GFLOORa', 'GFLOORb', 'GFLOORc',
    'WALLSHADOW',
    'STRUCT0', 'STRUCT1', 'STRUCT2', 'STRUCT3',
    'THORNS', 'WALL',
    'RED1_ESCHER', 'RED1_SIDE', 'RED1_TOP',
    'RED2_ESCHER', 'RED2_SIDE', 'RED2_TOP',
    'RED3_ESCHER', 'RED3_SIDE', 'RED3_TOP',
    'HEPTAMARK',
    'ITEM_BELOW',
    'ITEM', 'ITEMa', 'ITEMb',
    'BIGSTATUE',
    'WALL_ESCHER', 'WALL_SIDE', 'WALL_TOP', 'WALL_DECO',
    'HIDDEN', 'GIANTSHADOW',
    'TENTACLE0', 'TENTACLE1',
    'ONTENTACLE', 'ONTENTACLE_EYES', 'ONTENTACLE_EYES2',
    'MONSTER_SHADOW',
    'MONSTER_FOOT', 'MONSTER_LEG', 'MONSTER_GROIN',
    'MONSTER_SUBWPN', 'MONSTER_WPN',
    'MONSTER_BODY', 'MONSTER_ARMOR0', 'MONSTER_ARMOR1',
    'MONSTER_CLOAK', 'MONSTER_NECK',
    'MONSTER_HEAD', 'MONSTER_FACE', 'MONSTER_EYE0', 'MONSTER_EYE1',
    'MONSTER_HAIR', 'MONSTER_HAT0', 'MONSTER_HAT1',
    'MONSTER_HOODCLOAK1', 'MONSTER_HOODCLOAK2',
    'STUNSTARS',
    'CARRIED', 'CARRIEDa', 'CARRIEDb',
    'PARTICLE', 'SWORDMARK', 'MAGICSWORD', 'MISSILE', 'SKY',
    'MINEMARK', 'ARROW',
    'MOBILE_ARROW',
    'LINE',
    'TRANSPARENT_LAKE', 'TRANSPARENT_SHADOW', 'TRANSPARENT_WALL',
    'SUPERLINE', 'TEXT', 'CIRCLE',
    'MAX',
  ];
  const r: Record<string, number> = { DEFAULT: -1 };
  names.forEach((n, i) => { r[n] = i; });
  return Object.freeze(r);
})() as Readonly<Record<
  'ZERO' | 'EUCLIDEAN_SKY' | 'OUTCIRCLE' | 'MOVESTAR' | 'MINUSINF' | 'DEEP_ESCHER' | 'DEEP_SIDE' | 'DEEP_FALLANIM' |
  'DEEP_TOP' | 'HELLSPIKE' | 'SHALLOW_ESCHER' | 'SHALLOW_SIDE' | 'SHALLOW_FALLANIM' | 'SHALLOW_TOP' |
  'WATERLEVEL_ESCHER' | 'WATERLEVEL_SIDE' | 'WATERLEVEL_TOP' | 'BOATLEV' | 'BOATLEV2' | 'BOATLEV3' | 'FLOOR_ESCHER' |
  'FLOOR_SIDE' | 'FLOOR_FALLANIM' | 'FLOOR_TOWER' | 'FLOOR' | 'FLOOR_DRAGON' | 'FLOORa' | 'FLOORb' | 'FLOORc' |
  'FLOORd' | 'LIZEYE' | 'BFLOOR' | 'GFLOORa' | 'GFLOORb' | 'GFLOORc' | 'WALLSHADOW' | 'STRUCT0' | 'STRUCT1' |
  'STRUCT2' | 'STRUCT3' | 'THORNS' | 'WALL' | 'RED1_ESCHER' | 'RED1_SIDE' | 'RED1_TOP' | 'RED2_ESCHER' | 'RED2_SIDE' |
  'RED2_TOP' | 'RED3_ESCHER' | 'RED3_SIDE' | 'RED3_TOP' | 'HEPTAMARK' | 'ITEM_BELOW' | 'ITEM' | 'ITEMa' | 'ITEMb' |
  'BIGSTATUE' | 'WALL_ESCHER' | 'WALL_SIDE' | 'WALL_TOP' | 'WALL_DECO' | 'HIDDEN' | 'GIANTSHADOW' | 'TENTACLE0' |
  'TENTACLE1' | 'ONTENTACLE' | 'ONTENTACLE_EYES' | 'ONTENTACLE_EYES2' | 'MONSTER_SHADOW' | 'MONSTER_FOOT' |
  'MONSTER_LEG' | 'MONSTER_GROIN' | 'MONSTER_SUBWPN' | 'MONSTER_WPN' | 'MONSTER_BODY' | 'MONSTER_ARMOR0' |
  'MONSTER_ARMOR1' | 'MONSTER_CLOAK' | 'MONSTER_NECK' | 'MONSTER_HEAD' | 'MONSTER_FACE' | 'MONSTER_EYE0' |
  'MONSTER_EYE1' | 'MONSTER_HAIR' | 'MONSTER_HAT0' | 'MONSTER_HAT1' | 'MONSTER_HOODCLOAK1' | 'MONSTER_HOODCLOAK2' |
  'STUNSTARS' | 'CARRIED' | 'CARRIEDa' | 'CARRIEDb' | 'PARTICLE' | 'SWORDMARK' | 'MAGICSWORD' | 'MISSILE' | 'SKY' |
  'MINEMARK' | 'ARROW' | 'MOBILE_ARROW' | 'LINE' | 'TRANSPARENT_LAKE' | 'TRANSPARENT_SHADOW' | 'TRANSPARENT_WALL' |
  'SUPERLINE' | 'TEXT' | 'CIRCLE' | 'MAX' | 'DEFAULT', number>>;

/** hr_exception */
export class hr_exception extends Error {}

/** marks code that stage 1 does not port (other geometries, graphics, UI): reaching it is a bug of the
 *  scenario or of the port */
export class NotPorted extends Error {
  constructor(what: string) { super(`not ported: ${what}`); }
}

// --- hyper.h: the outline colours (added by D1, stage 2; PPR is above, added by D2) ---
export const OUTLINE_NONE = 0x000000FF;
export const OUTLINE_FRIEND = 0x00FF00FF;
export const OUTLINE_ENEMY = 0xFF0000FF;
export const OUTLINE_TREASURE = 0xFFFF00FF;
export const OUTLINE_ORB = 0xFF8000FF;
export const OUTLINE_OTHER = 0xFFFFFFFF;
export const OUTLINE_DEAD = 0x800000FF;
export const OUTLINE_TRANS = 0;
// OUTLINE_DEFAULT ((bordcolor << 8) + 0xFF), OUTLINE_FORE, OUTLINE_BACK read G: drawing.ts exports them as functions
