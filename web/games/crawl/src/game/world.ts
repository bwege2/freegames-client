// The dungeon: rooms and corridors in the original's 80x70 grid, the branch schedule of
// branch-data.h (D:1-15, Temple, Lair, Orc, Elf, Vaults, Depths, Zot and the Lair's branches), the
// original's monster population tables (mon-pick-data.h) and its item generation.
import { BRANCHES, BRANCH_BY_ID, BRANCH_INDEX, MONSTER_BY_ID, MONSTERS, POPULATION, SPECIES_BY_NAME } from './data.ts';
import type { Rng } from './rng.ts';
import { LEVELGEN } from './rng.ts';
import {
  ALTARS, BRANCH_ENTRANCE_FEATURE, DIRS, FEATURE, H, LOS_RADIUS, W, idx, inBounds, type Cell, type ItemOnFloor,
  type Level, type Monster, type Stair, xy,
} from './model.ts';
import { randomItem } from './items.ts';

export interface World {
  seed: string;
  schedule: Record<string, string[]>;
  levels: Record<string, Level>;
  current: string;
  depthOf: Record<string, number>;
}

const DUNGEON = 'BRANCH_DUNGEON';
const branchInfo = (id: string) => BRANCH_BY_ID.get(id) ?? BRANCHES[0];

/** Branch entrances: parent -> depth -> children, as branch-data.h's min/max depths say. */
export function makeSchedule(rng: Rng): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const add = (parent: string, depth: number, child: string) => {
    const key = `${parent}:${depth}`;
    (out[key] ??= []).push(child);
  };
  const placed = new Set<string>();
  // The Dungeon's own branches: one entrance each, at a depth in the original's range.
  const dungeonBranches = ['BRANCH_TEMPLE', 'BRANCH_LAIR', 'BRANCH_ORC', 'BRANCH_VAULTS'];
  for (const id of dungeonBranches) {
    const b = branchInfo(id);
    const d = rng.range(Math.max(1, b.minDepth), Math.max(b.minDepth, b.maxDepth));
    add(DUNGEON, Math.min(15, d), id);
    placed.add(id);
  }
  add(DUNGEON, 15, 'BRANCH_DEPTHS');
  add('BRANCH_DEPTHS', 4, 'BRANCH_ZOT');
  add('BRANCH_ORC', 2, 'BRANCH_ELF');
  for (const id of ['BRANCH_SWAMP', 'BRANCH_SHOALS', 'BRANCH_SNAKE', 'BRANCH_SPIDER']) {
    const b = branchInfo(id);
    add('BRANCH_LAIR', rng.range(b.minDepth, b.maxDepth), id);
  }
  add('BRANCH_LAIR', 4, 'BRANCH_SLIME');
  for (const id of ['BRANCH_CRYPT', 'BRANCH_FOREST']) {
    const b = branchInfo(id);
    add('BRANCH_VAULTS', rng.range(Math.max(2, b.minDepth), Math.max(2, b.maxDepth)), id);
  }
  return out;
}

export function branchDepth(id: string): number {
  return branchInfo(id).depth || 1;
}

export function branchKey(branch: string, depth: number): string {
  return `${branch}:${depth}`;
}

export function branchName(branch: string): string {
  const b = branchInfo(branch);
  return b.short;
}

export function levelPlace(branch: string, depth: number): string {
  const b = branchInfo(branch);
  if (branch === DUNGEON) return `Dungeon:${depth}`;
  if (branch === 'BRANCH_TEMPLE') return 'Temple';
  return `${b.abbr}:${depth}`;
}

export function absDepth(branch: string, depth: number): number {
  const b = branchInfo(branch);
  return (b.absDepth || 0) + depth;
}

function floorCell(level: Level, i: number): boolean {
  const f = FEATURE[level.cells[i].feat];
  return !!f && !f.solid;
}
function carve(level: Level, x: number, y: number, feat = 'DNGN_FLOOR'): void {
  if (!inBounds(x, y)) return;
  level.cells[idx(x, y)].feat = feat;
}
function isFree(level: Level, x: number, y: number): boolean {
  return level.cells[idx(x, y)].feat === 'DNGN_ROCK_WALL';
}

interface Room { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number }

function roomsOverlap(a: Room, b: Room, gap = 1): boolean {
  return !(a.x2 + gap < b.x1 || b.x2 + gap < a.x1 || a.y2 + gap < b.y1 || b.y2 + gap < a.y1);
}

function makeRooms(rng: Rng, branch: string): Room[] {
  const rooms: Room[] = [];
  const attempts = branch === 'BRANCH_TEMPLE' ? 40 : 180;
  const target = branch === 'BRANCH_TEMPLE' ? 1 : 7 + rng.int(6);
  for (let i = 0; i < attempts && rooms.length < target; i++) {
    let w = rng.range(5, 12), h = rng.range(4, 10);
    if (branch === 'BRANCH_VAULTS' || branch === 'BRANCH_ZOT') { w = rng.range(6, 14); h = rng.range(5, 12); }
    if (branch === 'BRANCH_LAIR' || branch === 'BRANCH_SLIME') { w = rng.range(6, 15); h = rng.range(5, 12); }
    const x1 = 1 + rng.int(W - w - 2), y1 = 1 + rng.int(H - h - 2);
    const r: Room = { x1, y1, x2: x1 + w - 1, y2: y1 + h - 1, cx: x1 + Math.floor(w / 2), cy: y1 + Math.floor(h / 2) };
    if (rooms.some((o) => roomsOverlap(r, o))) continue;
    rooms.push(r);
  }
  if (!rooms.length) rooms.push({ x1: 30, y1: 30, x2: 49, y2: 39, cx: 40, cy: 35 });
  return rooms;
}

function carveRoom(level: Level, r: Room, branch: string, rng: Rng): void {
  for (let y = r.y1; y <= r.y2; y++) for (let x = r.x1; x <= r.x2; x++) carve(level, x, y);
  // rough edges for the cave-like branches
  if (['BRANCH_LAIR', 'BRANCH_SLIME', 'BRANCH_SWAMP', 'BRANCH_SPIDER'].includes(branch) && rng.oneChanceIn(2)) {
    for (let x = r.x1; x <= r.x2; x++) {
      if (rng.oneChanceIn(4) && isFree(level, x, r.y1 - 1)) carve(level, x, r.y1 - 1);
      if (rng.oneChanceIn(4) && isFree(level, x, r.y2 + 1)) carve(level, x, r.y2 + 1);
    }
  }
}

function corridor(level: Level, a: Room, b: Room, rng: Rng): void {
  let x = a.cx, y = a.cy;
  const hFirst = rng.coinflip();
  const stepTo = (tx: number, ty: number) => {
    while (x !== tx) { x += Math.sign(tx - x); carve(level, x, y); }
    while (y !== ty) { y += Math.sign(ty - y); carve(level, x, y); }
  };
  if (hFirst) { stepTo(b.cx, y); stepTo(b.cx, b.cy); }
  else { stepTo(x, b.cy); stepTo(b.cx, b.cy); }
}

function addDoors(level: Level, rooms: Room[], rng: Rng): void {
  for (const r of rooms) {
    for (let x = r.x1; x <= r.x2; x++) {
      for (const y of [r.y1 - 1, r.y2 + 1]) {
        if (!inBounds(x, y)) continue;
        const i = idx(x, y);
        if (level.cells[i].feat === 'DNGN_FLOOR' && rng.oneChanceIn(5)) {
          // a door only where the corridor enters a wall line
          const above = inBounds(x, y - 1) && level.cells[idx(x, y - 1)].feat === 'DNGN_ROCK_WALL';
          const below = inBounds(x, y + 1) && level.cells[idx(x, y + 1)].feat === 'DNGN_ROCK_WALL';
          if (above || below) level.cells[i].feat = rng.oneChanceIn(3) ? 'DNGN_CLOSED_DOOR' : 'DNGN_OPEN_DOOR';
        }
      }
    }
  }
}

function randomFloor(rng: Rng, level: Level, tries = 500, near?: { x: number; y: number; min: number; max: number }): number {
  for (let i = 0; i < tries; i++) {
    const x = 1 + rng.int(W - 2), y = 1 + rng.int(H - 2);
    if (!floorCell(level, idx(x, y))) continue;
    if (near) {
      const d = Math.max(Math.abs(x - near.x), Math.abs(y - near.y));
      if (d < near.min || d > near.max) continue;
    }
    return idx(x, y);
  }
  for (let i = 0; i < level.cells.length; i++) if (floorCell(level, i)) return i;
  return idx(1, 1);
}

function placeFeature(level: Level, at: number, feat: string): void { level.cells[at].feat = feat; }

function addStairs(level: Level, rng: Rng, branch: string, depth: number, schedule: Record<string, string[]>): void {
  const entryX = level.entry % W, entryY = Math.floor(level.entry / W);
  if (branch === DUNGEON && depth === 1) {
    level.cells[level.entry].feat = 'DNGN_EXIT_DUNGEON';
  } else {
    const up = randomFloor(rng, level, 600, { x: entryX, y: entryY, min: 1, max: 9 });
    let upBranch = branch, upDepth = depth - 1;
    if (depth === 1) {
      const parent = branchInfo(branch).parent;
      const parentSchedule = Object.entries(schedule).find(([, children]) => children.includes(branch));
      upBranch = parent === 'NUM_BRANCHES' ? DUNGEON : parent;
      upDepth = parentSchedule ? Number(parentSchedule[0].split(':')[1]) : 1;
    }
    level.up.push({ at: up, branch: upBranch, depth: upDepth, up: true });
    placeFeature(level, up, 'DNGN_STONE_STAIRS_UP_I');
  }
  const maxDepth = branchInfo(branch).depth || 1;
  const downs = branch === 'BRANCH_TEMPLE' || depth >= maxDepth ? 0 : 1 + (rng.oneChanceIn(4) ? 1 : 0);
  for (let i = 0; i < downs; i++) {
    const at = randomFloor(rng, level, 800, { x: level.entry % W, y: Math.floor(level.entry / W), min: 10, max: 70 });
    level.down.push({ at, branch, depth: depth + 1, up: false });
    placeFeature(level, at, i === 0 ? 'DNGN_STONE_STAIRS_DOWN_I' : 'DNGN_STONE_STAIRS_DOWN_II');
  }
  const children = schedule[`${branch}:${depth}`] ?? [];
  for (const child of children) {
    const b = branchInfo(child);
    const at = randomFloor(rng, level, 800, { x: level.entry % W, y: Math.floor(level.entry / W), min: 8, max: 70 });
    const feat = BRANCH_ENTRANCE_FEATURE[b.abbr.toUpperCase()] ?? BRANCH_ENTRANCE_FEATURE[b.id.replace('BRANCH_', '')] ?? 'DNGN_ENTER_LAIR';
    level.branches.push({ at, branch: child, depth: 1, up: false });
    placeFeature(level, at, feat);
    level.branches[level.branches.length - 1].at = at;
  }
}

function addPools(level: Level, rng: Rng, branch: string): void {
  const water = branch === 'BRANCH_SWAMP' || branch === 'BRANCH_SHOALS' || branch === 'BRANCH_SNAKE' || branch === 'BRANCH_LAIR';
  const lava = branch === 'BRANCH_ZOT' || branch === 'BRANCH_VOLCANO';
  if (!water && !lava) return;
  const pools = 2 + rng.int(4);
  for (let p = 0; p < pools; p++) {
    const cx = 3 + rng.int(W - 6), cy = 3 + rng.int(H - 6), rad = 1 + rng.int(3);
    for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) {
      if (!inBounds(x, y)) continue;
      if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) > rad) continue;
      const i = idx(x, y);
      if (level.cells[i].feat !== 'DNGN_FLOOR') continue;
      if (rng.oneChanceIn(4)) continue;
      level.cells[i].feat = lava ? 'DNGN_LAVA' : (rng.oneChanceIn(2) ? 'DNGN_DEEP_WATER' : 'DNGN_SHALLOW_WATER');
    }
  }
  if (branch === 'BRANCH_LAIR' || branch === 'BRANCH_SWAMP') {
    for (let i = 0; i < 60; i++) {
      const x = 1 + rng.int(W - 2), y = 1 + rng.int(H - 2);
      const c = level.cells[idx(x, y)];
      if (c.feat === 'DNGN_FLOOR' && rng.oneChanceIn(3)) c.feat = 'DNGN_TREE';
    }
  }
}

function placeTemple(level: Level, rng: Rng): void {
  // The Ecumenical Temple: a row of altars and the way back.
  const rooms = makeRooms(rng, 'BRANCH_TEMPLE');
  const r = rooms[0];
  for (let y = r.y1; y <= r.y2; y++) for (let x = r.x1; x <= r.x2; x++) carve(level, x, y);
  const altars = rng.shuffle([...ALTARS]);
  const n = Math.min(altars.length, Math.max(6, (r.x2 - r.x1) * (r.y2 - r.y1) / 8));
  for (let i = 0; i < n; i++) {
    const x = r.x1 + 1 + (i % (r.x2 - r.x1 - 1));
    const y = r.y1 + 2 + Math.floor(i / Math.max(1, r.x2 - r.x1 - 1)) * 2;
    if (y >= r.y2) break;
    level.cells[idx(x, y)].feat = altars[i];
  }
  level.entry = idx(r.cx, r.cy + 1);
  level.cells[level.entry].feat = 'DNGN_FLOOR';
  level.up.push({ at: level.entry, branch: 'BRANCH_DUNGEON', depth: 0, up: true });
  level.cells[level.entry].feat = 'DNGN_RETURN_FROM_TEMPLE';
}

function pickMonster(rng: Rng, branch: string, depth: number): string | null {
  const key = branch === DUNGEON ? 'dungeon'
    : branch === 'BRANCH_ORC' ? 'orcish mines'
    : branch === 'BRANCH_ELF' ? 'elven halls'
    : branch === 'BRANCH_LAIR' ? 'lair'
    : branch === 'BRANCH_SWAMP' ? 'swamp'
    : branch === 'BRANCH_SHOALS' ? 'shoals'
    : branch === 'BRANCH_SNAKE' ? 'snake pit'
    : branch === 'BRANCH_SPIDER' ? 'spider nest'
    : branch === 'BRANCH_SLIME' ? 'slime pits'
    : branch === 'BRANCH_VAULTS' ? 'the vaults'
    : branch === 'BRANCH_CRYPT' ? 'crypt'
    : branch === 'BRANCH_TOMB' ? 'tomb'
    : branch === 'BRANCH_DEPTHS' ? 'depths'
    : branch === 'BRANCH_ZOT' ? 'zot' : '';
  const pop = POPULATION[key];
  if (!pop) return null;
  const eligible = pop.filter((e) => e.mons !== 'MONS_NO_MONSTER' && depth >= e.min && depth <= e.max);
  if (!eligible.length) return null;
  const e = rng.weighted(eligible.map((x) => [x.weight, x] as [number, typeof x]));
  return e.mons;
}

function spawnMonster(rng: Rng, level: Level, branch: string, depth: number, at: number): void {
  const id = pickMonster(rng, branch, Math.min(27, absDepth(branch, depth)));
  if (!id) return;
  const def = MONSTER_BY_ID.get(id);
  if (!def) return;
  if (def.unique && level.monsters.some((m) => m.def === id)) return;
  const p = xy(at);
  const mon: Monster = {
    uid: level.monsters.length + 1,
    def: id, name: def.name, x: p.x, y: p.y,
    hp: Math.max(1, Math.round(def.hp)), hpMax: Math.max(1, Math.round(def.hp)),
    hd: def.hd, ac: def.ac, ev: def.ev, speed: def.speed, energy: 0,
    asleep: rng.oneChanceIn(3) && !def.unique && def.intelligence !== 'human',
    attitude: 'hostile', cooldown: 0, unique: def.unique,
    confused: 0, slowed: 0, poisoned: 0, fleeing: 0, invisible: 0, known: false,
  };
  level.monsters.push(mon);
}

function spawnItem(rng: Rng, level: Level, depth: number, at: number): void {
  const item = randomItem(rng, depth);
  const existing = level.items.find((x) => x.at === at && x.item.cls === item.cls && x.item.id === item.id && x.item.cls !== 'gold');
  if (existing && (item.cls === 'potion' || item.cls === 'scroll')) { existing.item.qty += item.qty; return; }
  level.items.push({ at, item });
}

function occupied(level: Level, at: number): boolean {
  if (level.items.some((i) => i.at === at)) return true;
  const p = xy(at);
  return level.monsters.some((m) => m.x === p.x && m.y === p.y);
}

function populate(level: Level, rng: Rng, branch: string, depth: number): void {
  const abs = absDepth(branch, depth);
  const count = branch === 'BRANCH_TEMPLE' ? 0 : Math.min(26, 6 + Math.floor(abs * 0.8) + rng.int(4));
  for (let i = 0; i < count; i++) {
    const at = randomFloor(rng, level);
    if (at === level.entry || occupied(level, at)) continue;
    if (Math.max(Math.abs((at % W) - (level.entry % W)), Math.abs(Math.floor(at / W) - Math.floor(level.entry / W))) < 6) continue;
    spawnMonster(rng, level, branch, depth, at);
  }
  const items = branch === 'BRANCH_TEMPLE' ? 0 : 3 + rng.int(5);
  for (let i = 0; i < items; i++) {
    const at = randomFloor(rng, level);
    if (at === level.entry || occupied(level, at)) continue;
    spawnItem(rng, level, abs, at);
  }
  // A unique or two in the early Dungeon, as the original's vaults do.
  if (branch === DUNGEON && depth >= 2 && depth <= 8 && rng.oneChanceIn(3)) {
    const pool = MONSTERS.filter((m) => m.unique && m.hd <= 4 + depth);
    const def = rng.choose(pool);
    if (def && !level.monsters.some((m) => m.def === def.id)) {
      const at = randomFloor(rng, level, 400, { x: level.entry % W, y: Math.floor(level.entry / W), min: 8, max: 70 });
      const p = xy(at);
      level.monsters.push({
        uid: level.monsters.length + 1, def: def.id, name: def.name, x: p.x, y: p.y,
        hp: Math.max(1, Math.round(def.hp)), hpMax: Math.max(1, Math.round(def.hp)),
        hd: def.hd, ac: def.ac, ev: def.ev, speed: def.speed, energy: 0, asleep: false,
        attitude: 'hostile', cooldown: 0, unique: true, confused: 0, slowed: 0, poisoned: 0,
        fleeing: 0, invisible: 0, known: false,
      });
    }
  }
}

function reachable(level: Level, start: number): Set<number> {
  const seen = new Set<number>();
  const q = [start];
  seen.add(start);
  while (q.length) {
    const at = q.shift()!;
    const p = xy(at);
    for (const [dx, dy] of DIRS) {
      const nx = p.x + dx, ny = p.y + dy;
      if (!inBounds(nx, ny)) continue;
      const n = idx(nx, ny);
      if (seen.has(n)) continue;
      const f = FEATURE[level.cells[n].feat];
      if (!f || f.solid || level.cells[n].feat === 'DNGN_LAVA' || level.cells[n].feat === 'DNGN_DEEP_WATER') continue;
      seen.add(n);
      q.push(n);
    }
  }
  return seen;
}

export function generateLevel(rng: Rng, branch: string, depth: number, schedule: Record<string, string[]>): Level {
  const key = branchKey(branch, depth);
  const index = LEVELGEN + (BRANCH_INDEX[branch] ?? 0);
  return rng.withStream(index, () => {
    const cells: Cell[] = Array.from({ length: W * H }, () => ({ feat: 'DNGN_ROCK_WALL', known: false, visible: false }));
    const level: Level = {
      key, branch, depth, absDepth: absDepth(branch, depth), cells, monsters: [], items: [],
      up: [], down: [], branches: [], visited: true, entry: 0, layout: branch === 'BRANCH_TEMPLE' ? 'temple' : 'rooms',
    };
    if (branch === 'BRANCH_TEMPLE') {
      placeTemple(level, rng);
      const home = Object.entries(schedule).find(([, children]) => children.includes('BRANCH_TEMPLE'));
      if (home) level.up[0].depth = Number(home[0].split(':')[1]);
      return level;
    }
    const rooms = makeRooms(rng, branch);
    for (const r of rooms) carveRoom(level, r, branch, rng);
    for (let i = 1; i < rooms.length; i++) corridor(level, rooms[i - 1], rooms[i], rng);
    // a loop or two, as DCSS's rooms layout joins some rooms twice
    if (rooms.length > 3) corridor(level, rooms[0], rooms[rooms.length - 1], rng);
    addDoors(level, rooms, rng);
    level.entry = idx(rooms[0].cx, rooms[0].cy);
    level.cells[level.entry].feat = 'DNGN_FLOOR';
    addPools(level, rng, branch);
    addStairs(level, rng, branch, depth, schedule);
    populate(level, rng, branch, depth);
    if (branch === 'BRANCH_ZOT' && depth === 5) {
      const at = randomFloor(rng, level, 800, { x: level.entry % W, y: Math.floor(level.entry / W), min: 10, max: 70 });
      level.items.push({ at, item: { uid: 1, cls: 'misc', id: 'Orb of Zot', qty: 1, plus: 0, ego: 'normal', charges: 0, identified: true } });
      level.cells[at].feat = 'DNGN_FLOOR';
      level.layout = 'orb';
    }
    // make sure the entry and every stair are floor
    for (const s of [...level.up, ...level.down, ...level.branches]) {
      if (s.at !== level.entry) level.cells[s.at].feat = level.cells[s.at].feat === 'DNGN_ROCK_WALL' ? 'DNGN_FLOOR' : level.cells[s.at].feat;
    }
    // pools can cut a stair off; move an unreachable stair to a reachable floor cell
    const seen = reachable(level, level.entry);
    for (const s of [...level.up, ...level.down, ...level.branches]) {
      if (seen.has(s.at)) continue;
      const at = [...seen.keys()].find((i) => seen.has(i) && i !== level.entry && level.cells[i].feat === 'DNGN_FLOOR');
      if (at === undefined) continue;
      const oldFeat = level.cells[s.at].feat;
      level.cells[s.at].feat = 'DNGN_FLOOR';
      level.cells[at].feat = oldFeat;
      s.at = at;
    }
    for (const entry of level.items) {
      if (seen.has(entry.at)) continue;
      const at = [...seen.keys()].find((i) => seen.has(i) && level.cells[i].feat === 'DNGN_FLOOR');
      if (at !== undefined) entry.at = at;
    }
    return level;
  });
}

export function makeWorld(rng: Rng, seed: string): World {
  const schedule = makeSchedule(rng);
  return { seed, schedule, levels: {}, current: '', depthOf: {} };
}

export function getLevel(world: World, rng: Rng, branch: string, depth: number): Level {
  const key = branchKey(branch, depth);
  let level = world.levels[key];
  if (!level) {
    level = generateLevel(rng, branch, depth, world.schedule);
    world.levels[key] = level;
  }
  world.current = key;
  return level;
}

/** The original's line of sight: a ray to each cell, blocked by opaque features. */
export function updateFov(level: Level, px: number, py: number): void {
  for (const c of level.cells) { c.visible = false; }
  const setVisible = (x: number, y: number) => {
    if (!inBounds(x, y)) return;
    const c = level.cells[idx(x, y)];
    c.visible = true;
    c.known = true;
  };
  setVisible(px, py);
  for (let y = py - LOS_RADIUS; y <= py + LOS_RADIUS; y++) {
    for (let x = px - LOS_RADIUS; x <= px + LOS_RADIUS; x++) {
      if (!inBounds(x, y)) continue;
      const d = Math.max(Math.abs(x - px), Math.abs(y - py));
      if (d > LOS_RADIUS) continue;
      // Bresenham from the player to the cell; the target itself does not block its own visibility.
      let cx = px, cy = py;
      const dx = Math.abs(x - px), dy = Math.abs(y - py);
      const sx = px < x ? 1 : -1, sy = py < y ? 1 : -1;
      let err = dx - dy;
      let blocked = false;
      for (let guard = 0; guard < 30; guard++) {
        if (cx === x && cy === y) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; cx += sx; }
        if (e2 < dx) { err += dx; cy += sy; }
        if (cx === x && cy === y) break;
        if (!inBounds(cx, cy) || FEATURE[level.cells[idx(cx, cy)].feat]?.opaque) { blocked = true; break; }
      }
      if (!blocked) setVisible(x, y);
    }
  }
  // walls adjacent to a visible floor are visible too (the original shows the room's outline)
  for (let y = py - LOS_RADIUS - 1; y <= py + LOS_RADIUS + 1; y++) {
    for (let x = px - LOS_RADIUS - 1; x <= px + LOS_RADIUS + 1; x++) {
      if (!inBounds(x, y)) continue;
      const c = level.cells[idx(x, y)];
      if (c.visible) continue;
      if (!FEATURE[c.feat]?.opaque) continue;
      for (const [dx, dy] of DIRS) {
        if (inBounds(x + dx, y + dy) && level.cells[idx(x + dx, y + dy)].visible) { c.visible = true; c.known = true; break; }
      }
    }
  }
}

export function monsterAt(level: Level, x: number, y: number): Monster | undefined {
  return level.monsters.find((m) => m.x === x && m.y === y && m.hp > 0);
}

export function itemsAt(level: Level, at: number): ItemOnFloor[] {
  return level.items.filter((i) => i.at === at);
}

export function removeItem(level: Level, entry: ItemOnFloor): void {
  const i = level.items.indexOf(entry);
  if (i >= 0) level.items.splice(i, 1);
}

export function walkable(level: Level, x: number, y: number): boolean {
  if (!inBounds(x, y)) return false;
  const f = FEATURE[level.cells[idx(x, y)].feat];
  return !!f && !f.solid;
}

export function stairsAt(level: Level, at: number): Stair | undefined {
  return [...level.up, ...level.down, ...level.branches].find((s) => s.at === at);
}

export function findLanding(level: Level, near: number): number {
  const p = xy(near);
  const options: number[] = [];
  for (let r = 0; r <= 8; r++) {
    for (let y = Math.max(0, p.y - r); y <= Math.min(H - 1, p.y + r); y++) {
      for (let x = Math.max(0, p.x - r); x <= Math.min(W - 1, p.x + r); x++) {
        if (Math.max(Math.abs(x - p.x), Math.abs(y - p.y)) !== r) continue;
        const at = idx(x, y);
        if (walkable(level, x, y) && !monsterAt(level, x, y)) options.push(at);
      }
    }
    if (options.length) return options[0];
  }
  return near;
}

export function placeAtEntry(level: Level): number {
  if (level.branch === 'BRANCH_TEMPLE') return level.entry;
  const up = level.up[0];
  if (up) return findLanding(level, up.at);
  return findLanding(level, level.entry);
}

export const speciesSizes = new Map([...SPECIES_BY_NAME.values()].map((s) => [s.name, s.size]));
