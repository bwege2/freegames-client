// Traps: traps.cc placement, trap-type.h types and the 0.34 trap effects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/game/rng.ts';
import { getLevel, makeWorld, randomTrapForPlace, trapRateForPlace } from '../src/game/world.ts';
import { Game } from '../src/game/game.ts';
import { HeadlessSurface } from '../src/ui.ts';
import { DIRS, H, TRAP_INFO, W, idx } from '../src/game/model.ts';
import { encodeGame, decodeGame } from '../src/game/save.ts';
import { createPlayer } from '../src/game/player.ts';
import { JOBS_BY_NAME, SPECIES_BY_NAME } from '../src/game/data.ts';

const tick = () => new Promise((r) => setTimeout(r, 2));

test('trap types are the 0.34 trap-type.h set and have feature names', () => {
  for (const t of ['TRAP_TELEPORT', 'TRAP_TELEPORT_PERMANENT', 'TRAP_DISPERSAL', 'TRAP_SHAFT',
    'TRAP_ALARM', 'TRAP_NET', 'TRAP_WEB', 'TRAP_ZOT', 'TRAP_TYRANT', 'TRAP_ARCHMAGE',
    'TRAP_HARLEQUIN', 'TRAP_DEVOURER', 'TRAP_PLATE', 'TRAP_GOLUBRIA']) {
    assert.ok(TRAP_INFO[t], t);
  }
  assert.equal(TRAP_INFO.TRAP_TELEPORT.name, 'teleport trap');
  assert.equal(TRAP_INFO.TRAP_SHAFT.name, 'shaft');
});

test('trap_rate_for_place is 1 + absdepth0 / 10 and Temple has none', () => {
  assert.equal(trapRateForPlace('BRANCH_DUNGEON', 1), 1);
  assert.equal(trapRateForPlace('BRANCH_DUNGEON', 9), 1);
  assert.equal(trapRateForPlace('BRANCH_DUNGEON', 10), 1);
  assert.equal(trapRateForPlace('BRANCH_DUNGEON', 11), 2);
  assert.equal(trapRateForPlace('BRANCH_DUNGEON', 21), 3);
  assert.equal(trapRateForPlace('BRANCH_TEMPLE', 1), 0);
});

test('random_trap_for_place on D:1 is dispersal, teleport or shaft', () => {
  const r = new Rng(7n);
  const seen = new Set<string>();
  for (let i = 0; i < 2000; i++) {
    const t = randomTrapForPlace(r, 'BRANCH_DUNGEON', 1);
    if (t) seen.add(t);
  }
  assert.deepEqual([...seen].sort(), ['TRAP_DISPERSAL', 'TRAP_SHAFT', 'TRAP_TELEPORT']);
  // Alarm traps need absdepth0 > 3 (D:5+), tyrant/archmage/etc. need their branches.
  for (let i = 0; i < 500; i++) {
    const t = randomTrapForPlace(r, 'BRANCH_DUNGEON', 4);
    assert.notEqual(t, 'TRAP_ALARM');
  }
});

test('deeper traps include alarm and Zot traps', () => {
  const r = new Rng(7n);
  let alarm = 0, zot = 0;
  for (let i = 0; i < 2000; i++) {
    const t = randomTrapForPlace(r, 'BRANCH_DUNGEON', 20);
    if (t === 'TRAP_ALARM') alarm++;
    if (t === 'TRAP_ZOT') zot++;
  }
  assert.ok(alarm > 0);
  assert.ok(zot > 0);
});

test('every generated level has valid traps, except the Temple', () => {
  for (const seed of [1, 2, 7, 12345]) {
    const r = new Rng(BigInt(seed));
    const w = makeWorld(r, String(seed));
    const l = getLevel(w, r, 'BRANCH_DUNGEON', 1);
    assert.ok(l.traps.length <= 2, `D:1 traps: ${l.traps.length}`);
    const stairs = new Set([...l.up, ...l.down, ...l.branches].map((s) => s.at));
    for (const t of l.traps) {
      assert.ok(TRAP_INFO[t.type], t.type);
      assert.ok(!stairs.has(t.at), 'no trap on a stair');
      assert.notEqual(t.at, l.entry);
      assert.equal(l.cells[t.at].feat, 'DNGN_FLOOR');
    }
    const temple = getLevel(w, r, 'BRANCH_TEMPLE', 1);
    assert.equal(temple.traps.length, 0);
  }
});

test('a trap is saved and loaded with the level', () => {
  const r = new Rng(7n);
  const w = makeWorld(r, '7');
  const l = getLevel(w, r, 'BRANCH_DUNGEON', 5);
  l.traps.push({ at: idx(10, 10), type: 'TRAP_NET', ammo: 0, known: true });
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  const data = encodeGame(w, p, [], false, false, false, r);
  const back = decodeGame(JSON.parse(JSON.stringify(data)));
  const traps = back.world.levels[l.key].traps!;
  assert.equal(traps.length, l.traps.length);
  assert.equal(traps.find((t) => t.type === 'TRAP_NET')?.at, idx(10, 10));
});

test('walking onto a teleport trap triggers it', async () => {
  const s = new HeadlessSurface();
  const g = new Game({ surface: s, seed: 7n, name: 'Test' });
  const done = g.start({ surface: s, seed: 7n, name: 'Test' });
  s.send('alaTest\r');
  for (let i = 0; i < 100 && !g.player; i++) await tick();
  assert.ok(g.player);
  // Put a teleport trap on a walkable neighbour and step on it.
  let spot: { x: number; y: number } | null = null;
  for (const [dx, dy] of DIRS) {
    const x = g.player.x + dx, y = g.player.y + dy;
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const c = g.level.cells[idx(x, y)];
    if (c.feat === 'DNGN_FLOOR' && !g.level.monsters.some((m) => m.x === x && m.y === y)) {
      spot = { x, y }; break;
    }
  }
  assert.ok(spot, 'a walkable neighbour');
  g.level.traps = [{ at: idx(spot!.x, spot!.y), type: 'TRAP_TELEPORT', ammo: 1, known: true }];
  const dx = spot!.x - g.player.x, dy = spot!.y - g.player.y;
  const key = dx < 0 && dy < 0 ? 'y' : dx > 0 && dy < 0 ? 'u' : dx < 0 && dy > 0 ? 'b' : dx > 0 && dy > 0 ? 'n'
    : dx < 0 ? 'h' : dx > 0 ? 'l' : dy < 0 ? 'k' : 'j';
  s.send(key);
  for (let i = 0; i < 20 && !g.log.some((m) => m.text.includes('teleport trap')); i++) await tick();
  assert.ok(g.log.some((m) => m.text.includes('You enter a teleport trap!')));
  s.send('S');
  await done;
});
