// Milestone 5b: road and truck-stop construction. Prices are the original
// price bases from src/table/pricebase.h:
// PR_BUILD_ROAD 95, PR_CLEAR_ROAD 40, PR_BUILD_STATION_TRUCK 200,
// PR_CLEAR_STATION_TRUCK 50.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Construction, PRICE } from '../src/construction.ts';
import { World, ClearGround } from '../src/sim/world.ts';
import { defaultGeneration } from '../src/sim/settings.ts';
import { generateWorld } from '../src/sim/worldgen.ts';
import { buildScenario } from '../src/scenario.ts';

function flatWorld(size = 16): World {
  const w = new World(size, size);
  for (let i = 0; i < w.size; i++) {
    w.makeClear(i, ClearGround.Grass, 3);
    w.setTileHeight(i, 0);
  }
  return w;
}

function pageSettings(seed: number) {
  const s = defaultGeneration(seed);
  s.terrainType = 1; s.tgenSmoothness = 1; s.variety = 0; s.quantitySeaLakes = 0;
  s.mapHeightLimit = 0; s.freeformEdges = true; s.waterBorders = 16;
  s.amountOfRivers = 2; s.treePlacer = 2;
  return s;
}

test('original construction prices are used', () => {
  assert.equal(PRICE.buildRoad, 95);
  assert.equal(PRICE.clearRoad, 40);
  assert.equal(PRICE.buildTruckStop, 200);
  assert.equal(PRICE.clearTruckStop, 50);
  assert.equal(PRICE.startingMoney, 100000);
});

test('roads cost, occupy tiles and cannot be built twice for money', () => {
  const w = flatWorld();
  const c = new Construction(w, null);
  const tile = w.tileXY(5, 5);
  let r = c.buildRoad(tile);
  assert.deepEqual(r, { ok: true, cost: 95 });
  assert.equal(c.money, 100000 - 95);
  assert.equal(c.roads.get(tile)?.owner, 'player');
  r = c.buildRoad(tile);
  assert.deepEqual(r, { ok: true, cost: 0 });
  assert.equal(c.money, 100000 - 95);
});

test('roads need flat clear land', () => {
  const w = flatWorld();
  const c = new Construction(w, null);
  const water = w.tileXY(2, 2);
  w.makeSea(water);
  assert.equal(c.buildRoad(water).ok, false);
  const sloped = w.tileXY(4, 4);
  w.setTileHeight(w.tileXY(5, 4), 1);
  assert.equal(c.buildRoad(sloped).ok, false);
});

test('truck stops need an adjacent road, cost 200 and demolish for 50', () => {
  const w = flatWorld();
  const c = new Construction(w, null);
  const stopTile = w.tileXY(6, 5);
  assert.equal(c.canPlaceTruckStop(stopTile).ok, false);
  c.buildRoad(w.tileXY(5, 5));
  const placed = c.placeTruckStop(stopTile);
  assert.deepEqual(placed, { ok: true, cost: 200 });
  assert.equal(c.money, 100000 - 95 - 200);
  const stop = c.stops.get(stopTile);
  assert.ok(stop);
  assert.equal(stop!.sprite, 2708); // road is NE of the stop: NE ground sprite
  assert.equal(c.canPlaceTruckStop(stopTile).ok, false);
  const demo = c.demolish(stopTile);
  assert.deepEqual(demo, { ok: true, cost: 50 });
  assert.equal(c.money, 100000 - 95 - 200 - 50);
});

test('a road line charges each new tile and demolition charges the clear cost', () => {
  const w = flatWorld();
  const c = new Construction(w, null);
  const line = c.buildRoadLine(w.tileXY(2, 3), w.tileXY(5, 3));
  assert.deepEqual(line, { ok: true, cost: 4 * 95 });
  assert.equal(c.roads.size, 4);
  assert.deepEqual(c.demolish(w.tileXY(3, 3)), { ok: true, cost: 40 });
  assert.equal(c.roads.size, 3);
});

test('the scenario town roads are free town roads and buildings are occupied', () => {
  const { world } = generateWorld(pageSettings(12345));
  const scenario = buildScenario(world);
  const c = new Construction(world, scenario);
  const townRoad = scenario.town.roads[0].tile;
  assert.equal(c.isTownRoad(townRoad), true);
  assert.equal(c.buildRoad(townRoad).cost, 0);
  const house = scenario.town.houses[0].tile;
  assert.equal(c.canBuildRoad(house).ok, false);
  assert.equal(c.demolish(townRoad).ok, false);
  const mineTile = world.tileXY(scenario.industries[0].x, scenario.industries[0].y);
  assert.equal(c.canBuildRoad(mineTile).ok, false);
});
