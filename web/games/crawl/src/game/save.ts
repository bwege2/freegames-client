// Saves, morgue files and the score list. The original writes a binary save and text morgue files in
// its working directory; here they are JSON and text in the account's server storage (ctx.storage).
// The save is the port's own format; README.md says so.
import { FEATURE, type Cell, type Item, type ItemOnFloor, type Level, type Monster, type Stair, W, H } from './model.ts';
import { JOBS_BY_NAME, SPECIES_BY_NAME } from './data.ts';
import type { Gear, Player, SkillState } from './player.ts';
import { emptyGear, armourClass, evasion, shieldClass } from './player.ts';
import { itemName } from './items.ts';
import type { World } from './world.ts';
import { Rng as RngClass, type Rng } from './rng.ts';

const FEAT_KEYS = Object.keys(FEATURE);
const FEAT_INDEX = new Map(FEAT_KEYS.map((k, i) => [k, i]));
const FEAT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function rle(values: string[]): string {
  const out: string[] = [];
  let last = values[0], n = 0;
  for (const v of values) {
    if (v === last) n++;
    else { out.push(`${last}*${n}`); last = v; n = 1; }
  }
  out.push(`${last}*${n}`);
  return out.join(',');
}
function unrle(s: string, count: number): string[] {
  const out: string[] = [];
  for (const part of s.split(',')) {
    const [v, n] = part.split('*');
    const k = Number(n);
    for (let i = 0; i < k && out.length < count; i++) out.push(v);
  }
  while (out.length < count) out.push('0');
  return out;
}
function featChar(id: string): string {
  const i = FEAT_INDEX.get(id) ?? 0;
  return FEAT_CHARS[i] ?? 'A';
}
function charFeat(c: string): string {
  const i = FEAT_CHARS.indexOf(c);
  return FEAT_KEYS[i] ?? 'DNGN_ROCK_WALL';
}

interface SavedLevel {
  key: string; branch: string; depth: number; absDepth: number; layout: string;
  entry: number;
  feats: string; known: string; visible: string;
  monsters: Monster[]; items: ItemOnFloor[];
  up: Stair[]; down: Stair[]; branches: Stair[];
}

export interface SavedGame {
  version: number;
  seed: string;
  schedule: Record<string, string[]>;
  levels: SavedLevel[];
  current: string;
  player: unknown;
  log: { text: string; colour?: string }[];
  hasOrb: boolean;
  dead: boolean;
  won: boolean;
  savedAt: number;
  rng: { seed: string; streams: [string, string][]; current: number };
}

export function encodeCells(cells: Cell[]): { feats: string; known: string; visible: string } {
  return {
    feats: rle(cells.map((c) => featChar(c.feat))),
    known: rle(cells.map((c) => (c.known ? '1' : '0'))),
    visible: rle(cells.map((c) => (c.visible ? '1' : '0'))),
  };
}
export function decodeCells(s: { feats: string; known: string; visible: string }): Cell[] {
  const feats = unrle(s.feats, W * H);
  const known = unrle(s.known, W * H);
  const visible = unrle(s.visible, W * H);
  return feats.map((f, i) => ({ feat: charFeat(f), known: known[i] === '1', visible: visible[i] === '1' }));
}

function encodeLevel(l: Level): SavedLevel {
  const c = encodeCells(l.cells);
  return {
    key: l.key, branch: l.branch, depth: l.depth, absDepth: l.absDepth, layout: l.layout, entry: l.entry,
    feats: c.feats, known: c.known, visible: c.visible,
    monsters: l.monsters, items: l.items, up: l.up, down: l.down, branches: l.branches,
  };
}
function decodeLevel(s: SavedLevel): Level {
  return {
    key: s.key, branch: s.branch, depth: s.depth, absDepth: s.absDepth, layout: s.layout, entry: s.entry,
    cells: decodeCells({ feats: s.feats, known: s.known, visible: s.visible }),
    monsters: s.monsters, items: s.items, up: s.up, down: s.down, branches: s.branches, visited: true,
  };
}

interface SavedPlayer {
  name: string; species: string; job: string; x: number; y: number; hp: number; hpMax: number;
  mp: number; mpMax: number; gold: number; xl: number; xp: number; baseStats: [number, number, number];
  skills: Record<string, SkillState>; skillOrder: Record<string, number>; inventory: Item[];
  gear: Record<string, number | null>; knownSpells: string[]; memorised: string[];
  mutations: Record<string, number>; turns: number; elapsed: number; place: string; god: string | null;
  lives: number; status: Record<string, number>; nextUid: number;
}

export function encodePlayer(p: Player): SavedPlayer {
  const gear: Record<string, number | null> = {};
  for (const k of Object.keys(p.gear) as (keyof Gear)[]) gear[k] = p.gear[k]?.uid ?? null;
  return {
    name: p.name, species: p.species.name, job: p.job.name, x: p.x, y: p.y, hp: p.hp, hpMax: p.hpMax,
    mp: p.mp, mpMax: p.mpMax, gold: p.gold, xl: p.xl, xp: p.xp, baseStats: p.baseStats,
    skills: p.skills, skillOrder: p.skillOrder, inventory: p.inventory, gear,
    knownSpells: p.knownSpells, memorised: p.memorised, mutations: p.mutations, turns: p.turns,
    elapsed: p.elapsed, place: p.place, god: p.god, lives: p.lives, status: p.status, nextUid: p.nextUid,
  };
}
export function decodePlayer(s: SavedPlayer): Player {
  const species = SPECIES_BY_NAME.get(s.species.toLowerCase());
  const job = JOBS_BY_NAME.get(s.job.toLowerCase());
  if (!species || !job) throw new Error(`save has unknown species/job ${s.species}/${s.job}`);
  const gear = emptyGear();
  const byUid = new Map(s.inventory.map((i) => [i.uid, i] as [number, Item]));
  for (const k of Object.keys(gear) as (keyof Gear)[]) {
    const uid = (s.gear as Record<string, number | null>)[k];
    if (uid != null && byUid.has(uid)) gear[k] = byUid.get(uid)!;
  }
  return {
    ...s, species, job, gear,
  } as Player;
}

export function encodeGame(w: World, p: Player, log: { text: string; colour?: string }[], hasOrb: boolean, dead: boolean, won: boolean, rng: Rng): SavedGame {
  return {
    version: 1, seed: w.seed, schedule: w.schedule,
    levels: Object.values(w.levels).map(encodeLevel), current: w.current, player: encodePlayer(p),
    log, hasOrb, dead, won, savedAt: Date.now(), rng: rng.save(),
  };
}
export function decodeGame(s: SavedGame): { world: World; player: Player; log: { text: string; colour?: string }[]; hasOrb: boolean; dead: boolean; won: boolean; rng: Rng } {
  const levels: Record<string, Level> = {};
  for (const l of s.levels) levels[l.key] = decodeLevel(l);
  return {
    world: { seed: s.seed, schedule: s.schedule, levels, current: s.current, depthOf: {} },
    player: decodePlayer(s.player as SavedPlayer),
    log: s.log, hasOrb: s.hasOrb, dead: s.dead, won: s.won, rng: RngClass.load(s.rng),
  };
}

export function morgueText(p: Player, cause: string, won: boolean, when = new Date()): string {
  const date = when.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const shown = p.memorised.map((s) => s).join(', ');
  return [
    ` ${p.name} the ${p.species.name} ${p.job.name}`,
    ` ${won ? 'escaped with the Orb of Zot' : 'died'} on ${date}`,
    ` ${won ? 'Victory' : cause}`,
    '',
    ` Level ${p.xl}, ${p.place}`,
    ` Health ${p.hp}/${p.hpMax}   Magic ${p.mp}/${p.mpMax}`,
    ` Str ${p.baseStats[0]}  Int ${p.baseStats[1]}  Dex ${p.baseStats[2]}`,
    ` AC ${armourClass(p)}  EV ${evasion(p)}  SH ${shieldClass(p)}`,
    '',
    ' Inventory:',
    ...p.inventory.map((i) => `   ${itemName(i)}${i.qty > 1 ? ` (${i.qty})` : ''}`),
    '',
    ` Spells: ${shown || 'none'}`,
    ` Turns: ${p.turns}`,
    '',
    ' Best kill: none',
    ' The Dungeon Crawl Stone Soup dev team, 0.34.1',
  ].join('\n');
}

export interface ScoreEntry { name: string; species: string; job: string; xl: number; xp: number; place: string; won: boolean; when: number; cause: string }
export function addScore(list: ScoreEntry[], entry: ScoreEntry): ScoreEntry[] {
  const out = [...list, entry];
  out.sort((a, b) => (b.won ? 1 : 0) - (a.won ? 1 : 0) || b.xp - a.xp || b.xl - a.xl);
  return out.slice(0, 20);
}
