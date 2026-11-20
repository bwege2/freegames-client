// The game's model: coordinates, the map's cells, items and monsters. The values and names are DCSS
// 0.34.1's (feature-data.h, item-prop.cc, mon-data.h); the map is 80x70 like the original's.
import { SKILLS, skillKeyOf, WEAPON_BY_ID, ARMOUR_BY_ID, MONSTER_BY_ID, colourOf, type MonsterDef } from './data.ts';

export const W = 80;
export const H = 70;
export const VIEW_W = 35;
export const VIEW_H = 17;
export const SCREEN_W = 80;
export const SCREEN_H = 24;
export const LOS_RADIUS = 8;

export interface Coord { x: number; y: number }
export const idx = (x: number, y: number) => y * W + x;
export const xy = (i: number): Coord => ({ x: i % W, y: Math.floor(i / W) });
export const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H;
export const dist = (a: Coord, b: Coord) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
export const adj = (a: Coord, b: Coord) => dist(a, b) === 1;
export const DIRS: [number, number][] = [
  [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1],
];

export interface Feature { id: string; name: string; glyph: string; colour: string; opaque: boolean; solid: boolean }
const F = (id: string, name: string, glyph: string, colour: string, opaque = false, solid = false): Feature =>
  ({ id, name, glyph, colour, opaque, solid });

/** The features the port generates and draws; ids are feature-data.h's. */
export const FEATURE: Record<string, Feature> = {
  DNGN_UNSEEN: F('DNGN_UNSEEN', 'unseen', ' ', 'BLACK', true, true),
  DNGN_FLOOR: F('DNGN_FLOOR', 'floor', '.', 'ETC_FLOOR'),
  DNGN_ROCK_WALL: F('DNGN_ROCK_WALL', 'rock wall', '#', 'ETC_ROCK', true, true),
  DNGN_STONE_WALL: F('DNGN_STONE_WALL', 'stone wall', '#', 'LIGHTGREY', true, true),
  DNGN_OPEN_DOOR: F('DNGN_OPEN_DOOR', 'open door', "'", 'LIGHTGREY'),
  DNGN_CLOSED_DOOR: F('DNGN_CLOSED_DOOR', 'closed door', '+', 'LIGHTGREY', true, true),
  DNGN_STONE_STAIRS_DOWN_I: F('DNGN_STONE_STAIRS_DOWN_I', 'stone staircase leading down', '>', 'WHITE'),
  DNGN_STONE_STAIRS_UP_I: F('DNGN_STONE_STAIRS_UP_I', 'stone staircase leading up', '<', 'WHITE'),
  DNGN_STONE_STAIRS_DOWN_II: F('DNGN_STONE_STAIRS_DOWN_II', 'stone staircase leading down', '>', 'WHITE'),
  DNGN_STONE_STAIRS_UP_II: F('DNGN_STONE_STAIRS_UP_II', 'stone staircase leading up', '<', 'WHITE'),
  DNGN_STONE_STAIRS_DOWN_III: F('DNGN_STONE_STAIRS_DOWN_III', 'stone staircase leading down', '>', 'WHITE'),
  DNGN_STONE_STAIRS_UP_III: F('DNGN_STONE_STAIRS_UP_III', 'stone staircase leading up', '<', 'WHITE'),
  DNGN_RETURN_FROM_TEMPLE: F('DNGN_RETURN_FROM_TEMPLE', 'staircase back to the Dungeon', '>', 'WHITE'),
  DNGN_EXIT_DUNGEON: F('DNGN_EXIT_DUNGEON', 'staircase leading out of the dungeon', '<', 'WHITE'),
  DNGN_ENTER_TEMPLE: F('DNGN_ENTER_TEMPLE', 'staircase to the Ecumenical Temple', '>', 'YELLOW'),
  DNGN_ENTER_LAIR: F('DNGN_ENTER_LAIR', 'staircase to the Lair', '>', 'YELLOW'),
  DNGN_ENTER_ORC: F('DNGN_ENTER_ORC', 'staircase to the Orcish Mines', '>', 'YELLOW'),
  DNGN_ENTER_ELF: F('DNGN_ENTER_ELF', 'staircase to the Elven Halls', '>', 'YELLOW'),
  DNGN_ENTER_VAULTS: F('DNGN_ENTER_VAULTS', 'gate to the Vaults', '>', 'LIGHTGREEN'),
  DNGN_ENTER_DEPTHS: F('DNGN_ENTER_DEPTHS', 'staircase to the Depths', '>', 'YELLOW'),
  DNGN_ENTER_ZOT: F('DNGN_ENTER_ZOT', 'gate to the Realm of Zot', '>', 'MAGENTA'),
  DNGN_ENTER_SLIME: F('DNGN_ENTER_SLIME', 'staircase to the Slime Pits', '>', 'YELLOW'),
  DNGN_ENTER_SWAMP: F('DNGN_ENTER_SWAMP', 'staircase to the Swamp', '>', 'YELLOW'),
  DNGN_ENTER_SHOALS: F('DNGN_ENTER_SHOALS', 'staircase to the Shoals', '>', 'YELLOW'),
  DNGN_ENTER_SNAKE: F('DNGN_ENTER_SNAKE', 'staircase to the Snake Pit', '>', 'YELLOW'),
  DNGN_ENTER_SPIDER: F('DNGN_ENTER_SPIDER', 'hole to the Spider Nest', '>', 'YELLOW'),
  DNGN_ENTER_CRYPT: F('DNGN_ENTER_CRYPT', 'staircase to the Crypt', '>', 'YELLOW'),
  DNGN_ENTER_TOMB: F('DNGN_ENTER_TOMB', 'staircase to the Tomb', '>', 'YELLOW'),
  DNGN_LIQUEFACTION: F('DNGN_LIQUEFACTION', 'liquefied ground', '~', 'BROWN'),
  DNGN_LAVA: F('DNGN_LAVA', 'some lava', '≈', 'RED'),
  DNGN_DEEP_WATER: F('DNGN_DEEP_WATER', 'some deep water', '≈', 'BLUE'),
  DNGN_SHALLOW_WATER: F('DNGN_SHALLOW_WATER', 'some shallow water', '~', 'CYAN'),
  DNGN_TREE: F('DNGN_TREE', 'tree', '7', 'ETC_TREE', true, true),
  DNGN_FOUNTAIN: F('DNGN_FOUNTAIN', 'fountain', '{', 'LIGHTBLUE'),
  DNGN_ALTAR_ECUMENICAL: F('DNGN_ALTAR_ECUMENICAL', 'faded altar of an unknown god', '_', 'ETC_DARK'),
  DNGN_ALTAR_ZIN: F('DNGN_ALTAR_ZIN', 'glowing silver altar of Zin', '_', 'LIGHTGREY'),
  DNGN_ALTAR_SHINING_ONE: F('DNGN_ALTAR_SHINING_ONE', 'glowing golden altar of the Shining One', '_', 'YELLOW'),
  DNGN_ALTAR_KIKUBAAQUDGHA: F('DNGN_ALTAR_KIKUBAAQUDGHA', 'ancient bone altar of Kikubaaqudgha', '_', 'DARKGREY'),
  DNGN_ALTAR_YREDELEMNUL: F('DNGN_ALTAR_YREDELEMNUL', 'basalt altar of Yredelemnul', '_', 'ETC_UNHOLY'),
  DNGN_ALTAR_XOM: F('DNGN_ALTAR_XOM', 'shimmering altar of Xom', '_', 'ETC_RANDOM'),
  DNGN_ALTAR_VEHUMET: F('DNGN_ALTAR_VEHUMET', 'radiant altar of Vehumet', '_', 'ETC_VEHUMET'),
  DNGN_ALTAR_OKAWARU: F('DNGN_ALTAR_OKAWARU', 'iron altar of Okawaru', '_', 'CYAN'),
  DNGN_ALTAR_MAKHLEB: F('DNGN_ALTAR_MAKHLEB', 'burning altar of Makhleb', '_', 'ETC_FIRE'),
  DNGN_ALTAR_SIF_MUNA: F('DNGN_ALTAR_SIF_MUNA', 'shimmering blue altar of Sif Muna', '_', 'ETC_SHIMMER_BLUE'),
  DNGN_ALTAR_TROG: F('DNGN_ALTAR_TROG', 'bloodstained altar of Trog', '_', 'RED'),
  DNGN_ALTAR_NEMELEX_XOBEH: F('DNGN_ALTAR_NEMELEX_XOBEH', 'sparkling altar of Nemelex Xobeh', '_', 'LIGHTMAGENTA'),
  DNGN_ALTAR_ELYVILON: F('DNGN_ALTAR_ELYVILON', 'white marble altar of Elyvilon', '_', 'WHITE'),
  DNGN_ALTAR_LUGONU: F('DNGN_ALTAR_LUGONU', 'corrupted altar of Lugonu', '_', 'MAGENTA'),
  DNGN_ALTAR_BEOGH: F('DNGN_ALTAR_BEOGH', 'roughly hewn altar of Beogh', '_', 'ETC_BEOGH'),
  DNGN_ALTAR_JIYVA: F('DNGN_ALTAR_JIYVA', 'viscous altar of Jiyva', '_', 'ETC_SLIME'),
  DNGN_ALTAR_FEDHAS: F('DNGN_ALTAR_FEDHAS', 'blossoming altar of Fedhas', '_', 'GREEN'),
  DNGN_ALTAR_CHEIBRIADOS: F('DNGN_ALTAR_CHEIBRIADOS', 'snail-covered altar of Cheibriados', '_', 'LIGHTCYAN'),
  DNGN_ALTAR_ASHENZARI: F('DNGN_ALTAR_ASHENZARI', 'broken altar of Ashenzari', '_', 'LIGHTRED'),
  DNGN_ALTAR_DITHMENOS: F('DNGN_ALTAR_DITHMENOS', 'shadowy altar of Dithmenos', '_', 'ETC_DITHMENOS'),
  DNGN_ALTAR_GOZAG: F('DNGN_ALTAR_GOZAG', 'opulent altar of Gozag', '_', 'ETC_GOLD'),
  DNGN_ALTAR_QAZLAL: F('DNGN_ALTAR_QAZLAL', 'stormy altar of Qazlal', '_', 'ETC_ELEMENTAL'),
  DNGN_ALTAR_RU: F('DNGN_ALTAR_RU', 'sacrificial altar of Ru', '_', 'BROWN'),
};

export const ALTARS = Object.keys(FEATURE).filter((k) => k.startsWith('DNGN_ALTAR_'));

/** trap-type.h and feature-data.h TRAP() entries; the console glyph is DCHAR_TRAP. */
export const TRAP_INFO: Record<string, { name: string; colour: string }> = {
  TRAP_TELEPORT: { name: 'teleport trap', colour: 'LIGHTBLUE' },
  TRAP_TELEPORT_PERMANENT: { name: 'permanent teleport trap', colour: 'LIGHTBLUE' },
  TRAP_DISPERSAL: { name: 'dispersal trap', colour: 'MAGENTA' },
  TRAP_SHAFT: { name: 'shaft', colour: 'BROWN' },
  TRAP_ALARM: { name: 'alarm trap', colour: 'LIGHTRED' },
  TRAP_NET: { name: 'net trap', colour: 'LIGHTCYAN' },
  TRAP_WEB: { name: 'web', colour: 'LIGHTGREY' },
  TRAP_ZOT: { name: 'Zot trap', colour: 'LIGHTMAGENTA' },
  TRAP_TYRANT: { name: "tyrant's trap", colour: 'WHITE' },
  TRAP_ARCHMAGE: { name: "archmage's trap", colour: 'BLUE' },
  TRAP_HARLEQUIN: { name: "harlequin's trap", colour: 'YELLOW' },
  TRAP_DEVOURER: { name: "devourer's trap", colour: 'LIGHTGREEN' },
  TRAP_PLATE: { name: 'pressure plate', colour: 'LIGHTCYAN' },
  TRAP_GOLUBRIA: { name: 'passage of Golubria', colour: 'GREEN' },
};

export const BRANCH_ENTRANCE_FEATURE: Record<string, string> = {
  TEMPLE: 'DNGN_ENTER_TEMPLE', LAIR: 'DNGN_ENTER_LAIR', ORC: 'DNGN_ENTER_ORC',
  ELF: 'DNGN_ENTER_ELF', VAULTS: 'DNGN_ENTER_VAULTS', DEPTHS: 'DNGN_ENTER_DEPTHS',
  ZOT: 'DNGN_ENTER_ZOT', SLIME: 'DNGN_ENTER_SLIME', SWAMP: 'DNGN_ENTER_SWAMP',
  SHOALS: 'DNGN_ENTER_SHOALS', SNAKE: 'DNGN_ENTER_SNAKE', SPIDER: 'DNGN_ENTER_SPIDER',
  CRYPT: 'DNGN_ENTER_CRYPT', TOMB: 'DNGN_ENTER_TOMB',
};
export const FEATURE_BRANCH: Record<string, string> = Object.fromEntries(
  Object.entries(BRANCH_ENTRANCE_FEATURE).map(([b, f]) => [f, b]));

export interface Cell { feat: string; known: boolean; visible: boolean }
export interface Stair { at: number; branch: string; depth: number; up: boolean }

/** shopping.cc shop_struct: the keeper's greed and stock, placed on one cell. */
export interface Shop {
  at: number;
  type: string;
  greed: number;
  stock: Item[];
}

/** traps.cc trap_def: the type, its remaining ammo and whether the player has seen it. */
export interface Trap {
  at: number;
  type: string;
  ammo: number;
  known: boolean;
  /** dispersal traps go dormant for a few turns (traps.cc temp_change_terrain). */
  dormant?: number;
}

export interface Item {
  uid: number;
  cls: 'weapon' | 'armour' | 'missile' | 'potion' | 'scroll' | 'wand' | 'ring' | 'amulet' | 'book' | 'misc' | 'gold';
  id: string;
  qty: number;
  plus: number;
  ego: string;
  charges: number;
  identified: boolean;
  name?: string;
  /** The spells in a spellbook (book-data.h). */
  spells?: string[];
}

export interface Monster {
  uid: number;
  def: string;
  name: string;
  x: number; y: number;
  hp: number; hpMax: number;
  hd: number; ac: number; ev: number;
  speed: number; energy: number;
  asleep: boolean;
  attitude: 'hostile' | 'neutral' | 'friendly';
  cooldown: number;
  unique: boolean;
  summoned?: boolean;
  confused: number;
  slowed: number;
  poisoned: number;
  fleeing: number;
  invisible: number;
  known: boolean;
}

export interface ItemOnFloor { at: number; item: Item }

export interface Level {
  key: string;
  branch: string;
  depth: number;
  absDepth: number;
  cells: Cell[];
  monsters: Monster[];
  items: ItemOnFloor[];
  traps: Trap[];
  shops: Shop[];
  up: Stair[];
  down: Stair[];
  branches: Stair[];
  visited: boolean;
  entry: number;
  layout: string;
}

export const weaponDef = (id: string) => WEAPON_BY_ID.get(id);
export const armourDef = (id: string) => ARMOUR_BY_ID.get(id);
export const monsterDef = (id: string): MonsterDef | undefined => MONSTER_BY_ID.get(id);

export function monsterGlyph(m: Monster): { glyph: string; colour: string; name: string } {
  const d = MONSTER_BY_ID.get(m.def);
  return d ? { glyph: d.glyph, colour: d.colour, name: d.name } : { glyph: '?', colour: 'LIGHTGREY', name: 'thing' };
}

export function skillName(key: string): string {
  return SKILLS.find((s) => s.key === key)?.name ?? key;
}

export function weaponSkillKey(w: { skill: string }): string {
  return skillKeyOf(w.skill);
}

export function featureColour(f: Feature, seen = false): string {
  return colourOf(seen ? f.colour : (f.colour === 'ETC_FLOOR' ? 'ETC_FLOOR' : f.colour));
}

export function isWall(c: Cell): boolean {
  return FEATURE[c.feat]?.solid ?? true;
}
export function isOpaque(c: Cell): boolean {
  return FEATURE[c.feat]?.opaque ?? true;
}
export function isFloor(c: Cell): boolean {
  const f = FEATURE[c.feat];
  return !!f && !f.solid && f.id !== 'DNGN_LAVA' && f.id !== 'DNGN_DEEP_WATER';
}
