// The world loop: launching, flying, fleet spawns, AI and projectiles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from './load.ts';
import { createPilot } from '../src/sim/pilot.ts';
import { World } from '../src/sim/world.ts';
import { Random } from '../src/sim/rng.ts';
import { noCommands } from '../src/sim/ship.ts';

const data = loadData();

test('a launched ship flies and stays finite', () => {
  const pilot = createPilot(data, 'default', 'Ada', 'Lovelace', 'Sparrow', 'Test Sparrow');
  const world = new World({
    data, player: pilot.ship, system: pilot.system, date: pilot.date, random: new Random(7),
    spriteSize: () => null,
  });
  world.launchFrom('New Boston');
  const start = world.player.position;
  for (let i = 0; i < 240; ++i) world.update({ ...noCommands(), forward: true });
  assert.ok(world.player.position.distance(start) > 50);
  assert.ok(Number.isFinite(world.player.position.x) && Number.isFinite(world.player.position.y));
  assert.ok(world.player.shields > 0);
});

test('a pirate fleet spawns and fights without exceptions', () => {
  const pilot = createPilot(data, 'default', 'Ada', 'Lovelace', 'Sparrow', 'Test Sparrow');
  const world = new World({
    data, player: pilot.ship, system: pilot.system, date: pilot.date, random: new Random(11),
    spriteSize: () => null,
  });
  world.launchFrom('New Boston');
  world.spawnFleet(data.fleets.get('Small Southern Pirates')!);
  assert.ok(world.ships.length > 1);
  for (let i = 0; i < 900; ++i) world.update({ ...noCommands(), firePrimary: true });
  assert.ok(Number.isFinite(world.player.hull));
  assert.ok(world.projectiles.length >= 0);
  assert.ok(world.ships.length >= 1);
});
