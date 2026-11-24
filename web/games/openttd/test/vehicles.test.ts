// Milestone 5c: the earning coal truck. Original values:
// Balogh Coal Truck ROV(1, 108, 90, ..., 96, 20, 38, 12)
// purchase 14000*108>>8 = 5906, running 1600*90>>8 = 562/year,
// coal payment dist*255*units*5916>>21 for a fast transit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultGeneration } from '../src/sim/settings.ts';
import { generateWorld } from '../src/sim/worldgen.ts';
import { buildScenario } from '../src/scenario.ts';
import { Construction, PRICE } from '../src/construction.ts';
import { COAL_TRUCK, Fleet, coalPayment } from '../src/vehicles.ts';
import { World, ClearGround } from '../src/sim/world.ts';

function pageSettings(seed: number) {
  const s = defaultGeneration(seed);
  s.terrainType = 1; s.tgenSmoothness = 1; s.variety = 0; s.quantitySeaLakes = 0;
  s.mapHeightLimit = 0; s.freeformEdges = true; s.waterBorders = 16;
  s.amountOfRivers = 2; s.treePlacer = 2;
  return s;
}

function flatWorld(size = 12): World {
  const w = new World(size, size);
  for (let i = 0; i < w.size; i++) { w.makeClear(i, ClearGround.Grass, 3); w.setTileHeight(i, 0); }
  return w;
}

test('the original coal truck and payment numbers are used', () => {
  assert.equal(COAL_TRUCK.purchaseCost, 5906);
  assert.equal(COAL_TRUCK.runningCostPerYear, 562);
  assert.equal(COAL_TRUCK.maxSpeed, 96);
  assert.equal(COAL_TRUCK.capacity, 20);
  assert.equal(coalPayment(20, 5, 1), Math.floor((5 * 255 * 20 * 5916) / 2 ** 21));
  assert.equal(coalPayment(20, 5, 1), 71);
  assert.equal(coalPayment(0, 5, 1), 0);
});

test('pathfinding follows only roads and stops, four ways', () => {
  const w = flatWorld();
  const c = new Construction(w, null);
  c.buildRoadLine(w.tileXY(1, 1), w.tileXY(5, 1));
  c.buildRoadLine(w.tileXY(5, 1), w.tileXY(5, 5));
  c.placeTruckStop(w.tileXY(1, 2));
  c.placeTruckStop(w.tileXY(6, 5));
  const f = new Fleet(w, c, { industries: [{ x: 0, y: 0, width: 1, height: 1 }, { x: 11, y: 11, width: 1, height: 1 }] } as never);
  const path = f.findPath(w.tileXY(1, 2), w.tileXY(6, 5));
  assert.ok(path);
  assert.equal(path![0], w.tileXY(1, 2));
  assert.equal(path![path!.length - 1], w.tileXY(6, 5));
  // The route must go through the corner, not diagonally.
  for (let i = 1; i < path!.length; i++) {
    const d: number = Math.abs(w.tileX(path![i]) - w.tileX(path![i - 1])) + Math.abs(w.tileY(path![i]) - w.tileY(path![i - 1]));
    assert.equal(d, 1);
  }
});

test('a truck buys, loads coal, delivers and earns money on the 5c route', () => {
  const { world } = generateWorld(pageSettings(12345));
  const scenario = buildScenario(world);
  assert.deepEqual([scenario.industries[1].x, scenario.industries[1].y], [124, 133]);
  const c = new Construction(world, scenario);
  assert.deepEqual(c.buildRoadLine(world.tileXY(126, 129), world.tileXY(126, 132)), { ok: true, cost: 4 * PRICE.buildRoad });
  const mineStop = world.tileXY(126, 128);
  const powerStop = world.tileXY(125, 132);
  assert.equal(c.placeTruckStop(mineStop).ok, true);
  assert.equal(c.placeTruckStop(powerStop).ok, true);
  const f = new Fleet(world, c, scenario);
  assert.equal(f.ratingFor(mineStop, 0), 100);
  assert.equal(f.ratingFor(powerStop, 1), 100);
  const buy = f.buyTruck(mineStop);
  assert.equal(buy.ok, true);
  assert.equal(c.money, 100000 - 4 * 95 - 2 * 200 - 5906);
  assert.equal(f.setOrders(buy.truck!, [mineStop, powerStop]).ok, true);
  assert.equal(buy.truck!.cargo, 20);

  const before = c.money;
  for (let i = 0; i < 2000 && buy.truck!.trips === 0; i++) f.tick(0.05);
  assert.equal(buy.truck!.trips, 1);
  assert.equal(buy.truck!.cargo, 0);
  assert.equal(f.revenue, 71);
  assert.ok(f.runningCosts > 0 && f.runningCosts < 20);
  assert.ok(Math.abs(c.money - (before + 71 - f.runningCosts)) < 1e-9);
  assert.ok(c.money > before, 'the delivery must increase the balance');
  assert.ok(buy.truck!.revenue > buy.truck!.running, 'the truck must be profitable');

  // Let it return to the mine; the balance only changes by running costs.
  const afterDelivery = c.money;
  const runningAtDelivery = f.runningCosts;
  for (let i = 0; i < 20; i++) f.tick(0.05);
  assert.ok(f.runningCosts > runningAtDelivery);
  assert.ok(c.money < afterDelivery);
  assert.equal(f.revenue, 71);
});

test('station catchment controls the coal available', () => {
  const { world } = generateWorld(pageSettings(12345));
  const scenario = buildScenario(world);
  const c = new Construction(world, scenario);
  // A stop far from every industry has no rating and cannot load coal.
  const far = world.tileXY(scenario.town.x, scenario.town.y + 1);
  const f = new Fleet(world, c, scenario);
  assert.equal(f.ratingFor(far, 0), 0);
  assert.equal(f.ratingFor(far, 1), 0);
});
