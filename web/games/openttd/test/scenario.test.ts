// Milestone 5a: the deterministic town/industry scenario. The placements are
// checked on the real generated map; the gameplay numbers are the original
// OpenTTD 15.3 table values (cargo_const.h, build_industry.h) and the sprite
// ids are original SpriteID constants from table/sprites.h.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultGeneration } from '../src/sim/settings.ts';
import { generateWorld } from '../src/sim/worldgen.ts';
import { TileType } from '../src/sim/world.ts';
import { buildScenario, scenarioAt, scenarioDescription, COAL, COAL_MINE, POWER_STATION, TOWN } from '../src/scenario.ts';

const dir = join(import.meta.dirname, '..', 'assets', 'sprites');
const sprites = JSON.parse(readFileSync(join(dir, 'sprites.json'), 'utf8'));

function pageSettings(seed: number) {
  const s = defaultGeneration(seed);
  s.terrainType = 1;
  s.tgenSmoothness = 1;
  s.variety = 0;
  s.quantitySeaLakes = 0;
  s.mapHeightLimit = 0;
  s.freeformEdges = true;
  s.waterBorders = 16;
  s.amountOfRivers = 2;
  s.treePlacer = 2;
  return s;
}

test('the 5a scenario is deterministic and on flat clear land', () => {
  const { world } = generateWorld(pageSettings(12345));
  const a = buildScenario(world);
  const b = buildScenario(world);
  assert.deepEqual(a, b);
  assert.equal(a.town.name, 'Barton');
  assert.equal(a.town.houses.length, 12);
  assert.equal(a.town.roads.length, 9);
  assert.deepEqual(a.industries.map((i) => [i.id, i.width, i.height]), [['coal-mine', 3, 2], ['power-station', 4, 2]]);

  const areas = [
    [a.town.x, a.town.y, a.town.width, a.town.height],
    [a.industries[0].x, a.industries[0].y, a.industries[0].width, a.industries[0].height],
    [a.industries[1].x, a.industries[1].y, a.industries[1].width, a.industries[1].height],
  ] as const;
  for (const [x, y, w, h] of areas) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
      const tile = world.tileXY(x + dx, y + dy);
      assert.equal(world.tileType(tile), TileType.Clear);
      assert.equal(world.tileSlope(tile), 0);
    }
  }
  assert.notDeepEqual([a.town.x, a.town.y], [a.industries[0].x, a.industries[0].y]);
});

test('the scenario uses the original cargo and industry numbers', () => {
  const { world } = generateWorld(pageSettings(12345));
  const s = buildScenario(world);
  assert.equal(COAL.cargoBit, 1);
  assert.equal(COAL.initialPayment, 5916);
  assert.deepEqual(COAL.transitPeriods, [7, 255]);
  assert.equal(COAL.weight, 16);
  assert.equal(s.cargo, COAL);
  assert.deepEqual(s.industries[0].produces, { cargo: 'Coal', rate: 15 });
  assert.deepEqual(s.industries[1].accepts, [{ cargo: 'Coal', multiplier: 256, tileAcceptance: 8 }]);
  assert.equal(COAL_MINE.produces.rate, 15);
  assert.equal(POWER_STATION.accepts[0].multiplier, 256);
});

test('the scenario sprites are original SpriteIDs and exist in the atlas', () => {
  // table/sprites.h: SPR_BUILD_TOWNHOUSE_06_V1 = 1446, SPR_ROAD_X = 1333,
  // SPR_IT_POWER_PLANT_TRANSFORMERS = 2054; 2050 is another industry sprite.
  assert.equal(TOWN.houseSprite, 1446);
  assert.equal(TOWN.roadSprite, 1333);
  assert.equal(POWER_STATION.sprite, 2054);
  assert.equal(COAL_MINE.sprite, 2050);
  for (const id of [1446, 1333, 2050, 2054]) {
    const variants = sprites.sprites.temperate[String(id)];
    assert.ok(Array.isArray(variants) && variants.length > 0, `sprite ${id} missing`);
    assert.ok(variants[0].w > 0 && variants[0].h > 0);
  }
});

test('town and industry tiles are selectable with their data', () => {
  const { world } = generateWorld(pageSettings(12345));
  const s = buildScenario(world);
  const townTile = world.tileXY(s.town.x + 2, s.town.y + 2);
  const town = scenarioAt(s, world, townTile);
  assert.equal(town?.kind, 'town');
  assert.match(scenarioDescription(town!), /Barton/);
  assert.match(scenarioDescription(town!), /Passengers, Mail/);
  const mineTile = world.tileXY(s.industries[0].x, s.industries[0].y);
  const mine = scenarioAt(s, world, mineTile);
  assert.equal(mine?.kind, 'industry');
  assert.match(scenarioDescription(mine!), /Coal Mine/);
  assert.match(scenarioDescription(mine!), /15\/month/);
  const powerTile = world.tileXY(s.industries[1].x, s.industries[1].y);
  const power = scenarioAt(s, world, powerTile);
  assert.match(scenarioDescription(power!), /Power Station/);
  assert.match(scenarioDescription(power!), /x256/);
});
