// The dungeon: the original's 80x70 grid, branch schedule, population, and a save/load round trip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/game/rng.ts';
import { getLevel, makeWorld, monsterAt } from '../src/game/world.ts';
import { DIRS, FEATURE, H, W, idx, xy } from '../src/game/model.ts';
import { MONSTER_BY_ID } from '../src/game/data.ts';
import { encodeGame, decodeGame, decodePlayer, encodePlayer } from '../src/game/save.ts';
import { createPlayer } from '../src/game/player.ts';
import { SPECIES_BY_NAME, JOBS_BY_NAME } from '../src/game/data.ts';

function reachable(level: ReturnType<typeof getLevel>, start: number): Set<number> {
  const seen = new Set<number>([start]);
  const q = [start];
  while (q.length) {
    const at = q.shift()!;
    const p = xy(at);
    for (const [dx, dy] of DIRS) {
      const nx = p.x + dx, ny = p.y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
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

test('a level is deterministic from the seed and connected', () => {
  for (const seed of [1, 2, 7, 12345]) {
    const a = new Rng(BigInt(seed));
    const b = new Rng(BigInt(seed));
    const wa = makeWorld(a, String(seed));
    const wb = makeWorld(b, String(seed));
    const la = getLevel(wa, a, 'BRANCH_DUNGEON', 1);
    const lb = getLevel(wb, b, 'BRANCH_DUNGEON', 1);
    assert.deepEqual(la.cells.map((c) => c.feat), lb.cells.map((c) => c.feat));
    assert.equal(la.cells.length, W * H);
    assert.equal(FEATURE[la.cells[la.entry].feat].solid, false, 'entry is floor');
    const seen = reachable(la, la.entry);
    for (const s of [...la.up, ...la.down, ...la.branches]) assert.ok(seen.has(s.at), 'stair reachable');
  }
});

test('the branch schedule is the original branch-data.h', () => {
  const r = new Rng(7n);
  const w = makeWorld(r, '7');
  const all = Object.values(w.schedule).flat();
  for (const b of ['BRANCH_TEMPLE', 'BRANCH_LAIR', 'BRANCH_ORC', 'BRANCH_VAULTS', 'BRANCH_DEPTHS', 'BRANCH_ZOT']) {
    assert.ok(all.includes(b), b);
  }
  assert.deepEqual(w.schedule['BRANCH_DUNGEON:15'], ['BRANCH_DEPTHS']);
  assert.deepEqual(w.schedule['BRANCH_DEPTHS:4'], ['BRANCH_ZOT']);
  assert.deepEqual(w.schedule['BRANCH_ORC:2'], ['BRANCH_ELF']);
});

test('the Temple returns to the depth it was entered from', () => {
  const r = new Rng(7n);
  const w = makeWorld(r, '7');
  const home = Object.entries(w.schedule).find(([, children]) => children.includes('BRANCH_TEMPLE'))!;
  const temple = getLevel(w, r, 'BRANCH_TEMPLE', 1);
  assert.equal(temple.up[0].branch, 'BRANCH_DUNGEON');
  assert.equal(temple.up[0].depth, Number(home[0].split(':')[1]));
});

test('D:1 monsters and items come from the original data', () => {
  const r = new Rng(7n);
  const w = makeWorld(r, '7');
  const l = getLevel(w, r, 'BRANCH_DUNGEON', 1);
  assert.ok(l.monsters.length >= 6);
  for (const m of l.monsters) assert.ok(MONSTER_BY_ID.has(m.def), m.def);
  assert.ok(l.items.length >= 1);
  for (const i of l.items) assert.ok(i.item.cls);
  assert.equal(monsterAt(l, l.monsters[0].x, l.monsters[0].y)?.uid, l.monsters[0].uid);
});

test('Zot:5 holds the Orb', () => {
  const r = new Rng(7n);
  const w = makeWorld(r, '7');
  const l = getLevel(w, r, 'BRANCH_ZOT', 5);
  assert.ok(l.items.some((i) => i.item.id === 'Orb of Zot'));
  assert.equal(l.down.length, 0, 'there is no D:6 behind Zot:5');
});

test('a player save is the same player', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  p.gold = 17;
  const back = decodePlayer(encodePlayer(p));
  assert.equal(back.name, p.name);
  assert.equal(back.species.name, p.species.name);
  assert.equal(back.job.name, p.job.name);
  assert.equal(back.gold, 17);
  assert.equal(back.gear.weapon?.id, 'WPN_RAPIER');
  assert.equal(back.inventory.length, p.inventory.length);
  assert.equal(back.hpMax, p.hpMax);
});

test('a whole game save round trip', () => {
  const r = new Rng(7n);
  const w = makeWorld(r, '7');
  const l = getLevel(w, r, 'BRANCH_DUNGEON', 1);
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  p.x = l.entry % W; p.y = Math.floor(l.entry / W);
  const data = encodeGame(w, p, [{ text: 'hello', colour: 'LIGHTGREY' }], true, false, false, r);
  const text = JSON.stringify(data);
  assert.ok(text.length < 512 * 1024, `save is ${text.length} bytes`);
  const back = decodeGame(JSON.parse(text));
  assert.equal(back.player.name, 'Test');
  assert.equal(back.hasOrb, true);
  assert.equal(back.world.current, w.current);
  assert.equal(back.world.levels[w.current].cells.length, W * H);
});
