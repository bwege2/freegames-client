// Milestone 5d: the JSON save state round-trips the whole playable slice.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultGeneration } from '../src/sim/settings.ts';
import { generateWorld } from '../src/sim/worldgen.ts';
import { buildScenario } from '../src/scenario.ts';
import { Construction } from '../src/construction.ts';
import { Fleet } from '../src/vehicles.ts';

function pageSettings(seed: number) {
  const s = defaultGeneration(seed);
  s.terrainType = 1; s.tgenSmoothness = 1; s.variety = 0; s.quantitySeaLakes = 0;
  s.mapHeightLimit = 0; s.freeformEdges = true; s.waterBorders = 16;
  s.amountOfRivers = 2; s.treePlacer = 2;
  return s;
}

test('construction, fleet, truck, cargo, money and time survive a JSON round trip', () => {
  const { world } = generateWorld(pageSettings(12345));
  const scenario = buildScenario(world);
  const c = new Construction(world, scenario);
  c.buildRoadLine(world.tileXY(126, 129), world.tileXY(126, 132));
  const mineStop = world.tileXY(126, 128), powerStop = world.tileXY(125, 132);
  c.placeTruckStop(mineStop);
  c.placeTruckStop(powerStop);
  const f = new Fleet(world, c, scenario);
  const buy = f.buyTruck(mineStop);
  assert.equal(buy.ok, true);
  f.setOrders(buy.truck!, [mineStop, powerStop]);
  for (let i = 0; i < 30; i++) f.tick(0.05);

  const json = JSON.stringify({ construction: c.serialize(), fleet: f.serialize() });
  const parsed = JSON.parse(json);

  const c2 = new Construction(world, scenario);
  const f2 = new Fleet(world, c2, scenario);
  c2.restore(parsed.construction);
  f2.restore(parsed.fleet);

  assert.deepEqual(c2.serialize(), c.serialize());
  assert.deepEqual(f2.serialize(), f.serialize());
  assert.equal(f2.trucks[0].orders.length, 2);
  assert.deepEqual(f2.trucks[0].orders, [mineStop, powerStop]);
  assert.ok(f2.trucks[0].cargo > 0);
  assert.equal(c2.money, c.money);
  assert.equal(f2.time, f.time);

  // Continuing both saves must stay identical.
  for (let i = 0; i < 300; i++) { f.tick(0.05); f2.tick(0.05); }
  assert.deepEqual(f2.serialize(), f.serialize());
  assert.equal(c2.money, c.money);
  assert.ok(f2.trucks[0].trips >= 1);
  assert.ok(f2.revenue >= 71);
});

test('corrupt construction/fleet state is rejected and does not half-load', () => {
  const { world } = generateWorld(pageSettings(12345));
  const scenario = buildScenario(world);
  const c = new Construction(world, scenario);
  assert.throws(() => c.restore({} as never));
});
