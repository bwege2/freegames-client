// The original's data, converted by re/crawl/tools/extract.py from Dungeon Crawl Stone Soup 0.34.1
// (crawl-ref/source/dat/{species,jobs,mons}/, spl-data.h, item-prop.cc, branch-data.h, dat/descript/).
// Every name, number and text here is the original's; see web/games/crawl/LICENSE.md.
import speciesJson from '../data/species.json' with { type: 'json' };
import jobsJson from '../data/jobs.json' with { type: 'json' };
import monstersJson from '../data/monsters.json' with { type: 'json' };
import spellsJson from '../data/spells.json' with { type: 'json' };
import itemsJson from '../data/items.json' with { type: 'json' };
import featuresJson from '../data/features.json' with { type: 'json' };
import branchesJson from '../data/branches.json' with { type: 'json' };
import skillsJson from '../data/skills.json' with { type: 'json' };
import populationJson from '../data/population.json' with { type: 'json' };
import descriptJson from '../data/descript.json' with { type: 'json' };
import tutorialJson from '../data/tutorial.json' with { type: 'json' };
import playableJson from '../data/playable.json' with { type: 'json' };
import mutationsJson from '../data/mutations.json' with { type: 'json' };

export interface SpeciesDef {
  id: string; name: string; abbr: string; derives?: string | null;
  stats: [number, number, number];
  mods: { xp: number; hp: number; mp: number; wl: number };
  apt: Record<string, number>;
  mutations: Record<string, number>;
  levelup: string[]; levelupFrequency: number;
  flags: string[]; habitat: string; size: string;
  recommendedJobs: string[]; description: string;
}
export interface JobDef {
  id: string; name: string; abbr: string; category: string;
  stats: [number, number, number];
  equipment: string[]; spells: string[]; skills: Record<string, number>;
  weaponChoice: string; recommendedSpecies: string[]; description: string;
}
export interface AttackDef { type: string; damage: number; flavour?: string }
export interface MonsterDef {
  id: string; name: string; glyph: string; colour: string;
  flags: string[]; holiness?: string[]; attacks: AttackDef[]; hd: number; hp: number; ac: number; ev: number;
  will: number; exp: number; speed: number; size: string; shape: string;
  intelligence: string; habitat: string; genus?: string | null; species?: string | null;
  uses?: string | null; unique: boolean; hasCorpse: boolean; shout?: string | null;
  spells: string; spellList: { spell: string; weight: number; flags: string }[];
  resists: string[]; description: string;
}
export interface SpellDef {
  id: string; name: string; schools: string[]; flags: string[]; level: number;
  powerCap: number; rangeMin: number; rangeMax: number; noise: number; description: string;
}
export interface WeaponDef {
  id: string; name: string; damage: number; hit: number; speed: number; skill: string;
  min2h: string; min1h: string; damType: string; commonness: number; acquire: number;
  price: number; description: string;
}
export interface MutationDef { id: string; weight: number; levels: number; flags: string[]; short: string; have: string[]; gain: string[]; lose: string[] }

export interface BookDef { name: string; title: string; spells: string[] }

export interface MissileDef { id: string; name: string; damage: number; mulch: number; price: number; description: string }

export interface ArmourDef {
  id: string; name: string; ac: number; ev: number; price: number; slot: string;
  fitMin: string; fitMax: string; mundane: boolean; acquire: number; description: string;
}
export interface FeatureDef {
  id: string; name: string; vaultName: string; glyph: string; colour: string;
  seenColour: string; flags: string; minimap: string;
}
export interface BranchDef {
  id: string; parent: string; minDepth: number; maxDepth: number; depth: number;
  absDepth: number; flags: string[]; short: string; long: string; abbr: string;
}
export interface SkillDef { name: string; titles: string[]; abbr: string; key: string }

export const SPECIES = speciesJson as unknown as SpeciesDef[];
export const JOBS = jobsJson as unknown as JobDef[];
export const MONSTERS = monstersJson as unknown as MonsterDef[];
export const SPELLS = spellsJson as unknown as SpellDef[];
export const WEAPONS = (itemsJson as unknown as { weapons: WeaponDef[] }).weapons;
export const ARMOUR = (itemsJson as unknown as { armour: ArmourDef[] }).armour;
export const MISSILES = (itemsJson as unknown as { missiles: MissileDef[] }).missiles;
export const BOOKS = (itemsJson as unknown as { books: BookDef[] }).books;
export const MUTATIONS = (mutationsJson as unknown as MutationDef[]);
export const ITEM_NAMES = (itemsJson as unknown as { names: Record<string, string> }).names;
export const FEATURES = featuresJson as unknown as FeatureDef[];
export const BRANCHES = branchesJson as unknown as BranchDef[];
export const RAW_SKILLS = skillsJson as unknown as SkillDef[];
export const POPULATION = populationJson as unknown as Record<string, { min: number; max: number; weight: number; type: string; mons: string }[]>;
export const DESCRIPT = descriptJson as unknown as Record<string, Record<string, string>>;
export const TUTORIAL = tutorialJson as unknown as { name: string; map: string; kfeat: [string, string][]; markers: [string, string][] }[];
export const PLAYABLE = playableJson as unknown as {
  species: { name: string; abbr: string; apts: Record<string, number>; modifiers: Record<string, number>; recommended_jobs: string[]; derives?: string }[];
  jobs: { name: string; abbr: string; recommended_species: string[] }[];
  combos: string[];
};

export const SPECIES_BY_NAME = new Map(SPECIES.map((s) => [s.name.toLowerCase(), s]));
export const SPECIES_BY_ID = new Map(SPECIES.map((s) => [s.id, s]));
export const JOBS_BY_NAME = new Map(JOBS.map((j) => [j.name.toLowerCase(), j]));
export const JOBS_BY_ID = new Map(JOBS.map((j) => [j.id, j]));
export const MONSTER_BY_ID = new Map(MONSTERS.map((m) => [m.id, m]));
export const MONSTER_BY_NAME = new Map(MONSTERS.map((m) => [m.name.toLowerCase(), m]));
export const SPELL_BY_ID = new Map(SPELLS.map((s) => [s.id, s]));
export const SPELL_BY_NAME = new Map(SPELLS.map((s) => [s.name.toLowerCase(), s]));
export const WEAPON_BY_ID = new Map(WEAPONS.map((w) => [w.id, w]));
export const WEAPON_BY_NAME = new Map(WEAPONS.map((w) => [w.name, w]));
export const ARMOUR_BY_ID = new Map(ARMOUR.map((a) => [a.id, a]));
export const MISSILE_BY_ID = new Map(MISSILES.map((m) => [m.id, m]));
export const ARMOUR_BY_NAME = new Map(ARMOUR.map((a) => [a.name, a]));
export const BRANCH_BY_ID = new Map(BRANCHES.map((b) => [b.id, b]));

const REMOVED = new Set(['Slings', 'Crossbows', 'Stabbing', 'Traps', 'Charms']);
function skillKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
export const SKILLS: SkillDef[] = RAW_SKILLS.filter((s) => !REMOVED.has(s.name)).map((s) => ({ ...s, key: skillKey(s.name) }));
export const SKILL_BY_KEY = new Map(SKILLS.map((s) => [s.key, s]));
export const SKILL_ORDER = SKILLS.map((s) => s.key);
// The aptitude keys of the species data are the same skill keys (dat/species/*.yaml).
export function skillKeyOf(id: string): string {
  return id.replace(/^SK_/, '').toLowerCase();
}

export const COLOURS: Record<string, string> = {
  BLACK: '#000000', BLUE: '#0000ee', GREEN: '#00cd00', CYAN: '#00cdcd', RED: '#cd0000',
  MAGENTA: '#cd00cd', BROWN: '#cd7f32', LIGHTGREY: '#bebebe', DARKGREY: '#7f7f7f',
  LIGHTBLUE: '#5c5cff', LIGHTGREEN: '#90ee90', LIGHTCYAN: '#a0ffff', LIGHTRED: '#ff6a6a',
  LIGHTMAGENTA: '#ff8cff', YELLOW: '#ffff00', WHITE: '#ffffff',
  ETC_FLOOR: '#7f7f7f', ETC_ROCK: '#8b5a2b', ETC_TREE: '#2e8b57', ETC_MANGROVE: '#2e8b57',
  ETC_SHIMMER_BLUE: '#5c5cff', ETC_SHIMMER_RED: '#ff6a6a', ETC_SHIMMER_GREEN: '#90ee90',
  ETC_UNHOLY: '#8b008b', ETC_RANDOM: '#ff8cff', ETC_VEHUMET: '#ff6a6a', ETC_FIRE: '#ff4500',
  ETC_SLIME: '#00cd00', ETC_BEOGH: '#cd7f32', ETC_DITHMENOS: '#4b0082', ETC_GOLD: '#ffd700',
  ETC_ELEMENTAL: '#a0ffff', ETC_DARK: '#4f4f4f', ETC_INCARNADINE: '#b03060', ETC_CANDLES: '#ffb90f',
  ETC_POISON: '#6b8e23', ETC_WU_JIAN: '#d8bfd8', ETC_ELVEN_BRICK: '#cd9b9b', ETC_BLOOD: '#8b0000',
  ETC_MUTAGENIC: '#7fff00', ETC_LIQUEFIED: '#daa520', ETC_FOG: '#bebebe', ETC_MIST: '#bebebe',
  ETC_WALL: '#7f7f7f', ETC_CRYSTAL: '#00ffff', ETC_UNSEEN: '#000000',
};

export function colourOf(name: string): string {
  return COLOURS[name] ?? COLOURS[name.replace(/^ETC_/, '')] ?? '#bebebe';
}

/** The original's branch indices in `branch-type.h` (0.34: tag 34), for the levelgen RNG stream. */
export const BRANCH_INDEX: Record<string, number> = {
  BRANCH_DUNGEON: 0, BRANCH_TEMPLE: 1, BRANCH_ORC: 2, BRANCH_ELF: 3, BRANCH_DWARF: 4,
  BRANCH_LAIR: 5, BRANCH_SWAMP: 6, BRANCH_SHOALS: 7, BRANCH_SNAKE: 8, BRANCH_SPIDER: 9,
  BRANCH_SLIME: 10, BRANCH_VAULTS: 11, BRANCH_BLADE: 12, BRANCH_CRYPT: 13, BRANCH_TOMB: 14,
  BRANCH_VESTIBULE: 16, BRANCH_DIS: 17, BRANCH_GEHENNA: 18, BRANCH_COCYTUS: 19, BRANCH_TARTARUS: 20,
  BRANCH_ZOT: 21, BRANCH_FOREST: 22, BRANCH_ABYSS: 23, BRANCH_PANDEMONIUM: 24, BRANCH_ZIGGURAT: 25,
  BRANCH_LABYRINTH: 26, BRANCH_BAZAAR: 27, BRANCH_TROVE: 28, BRANCH_SEWER: 29, BRANCH_OSSUARY: 30,
  BRANCH_BAILEY: 31, BRANCH_GAUNTLET: 32, BRANCH_ICE_CAVE: 33, BRANCH_VOLCANO: 34, BRANCH_WIZLAB: 35,
  BRANCH_DEPTHS: 36, BRANCH_DESOLATION: 37, BRANCH_ARENA: 39, BRANCH_CRUCIBLE: 40, BRANCH_NECROPOLIS: 41,
};
