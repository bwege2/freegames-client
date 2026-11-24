// The ground sprite selection against the original's draw tables
// (src/clear_cmd.cpp, src/water_cmd.cpp, src/table/clear_land.h, sprites.h)
// and the generated map's tiles against the extracted sprite table.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ClearGround, SLOPE_W, World } from '../src/sim/world.ts';
import { groundSpriteId, tileHash } from '../src/render/scene.ts';
import { defaultGeneration, Landscape } from '../src/sim/settings.ts';
import { generateWorld } from '../src/sim/worldgen.ts';

function flatWorld(): World {
  const w = new World(8, 8);
  for (let i = 0; i < w.size; i++) { w.setTileHeight(i, 1); w.makeClear(i, ClearGround.Grass, 3); }
  return w;
}

test('flat grass and its slope variants', () => {
  const w = flatWorld();
  const t = w.tileXY(3, 3);
  assert.equal(groundSpriteId(w, t), 3981); // SPR_FLAT_GRASS_TILE
  // The height at x+1 is the west corner: SLOPE_W, offset 1.
  w.setTileHeight(w.tileXY(4, 3), 2);
  assert.equal(w.tileSlope(t), SLOPE_W);
  assert.equal(groundSpriteId(w, t), 3981 + 1);
  // The height at y+1 is the east corner: SLOPE_W|SLOPE_E, offset 5.
  w.setTileHeight(w.tileXY(3, 4), 2);
  assert.equal(w.tileSlope(t), SLOPE_W | 4);
  assert.equal(groundSpriteId(w, t), 3981 + 5);
});

test('rough land uses the tile hash, rocks and water use their tables', () => {
  const w = flatWorld();
  w.makeClear(w.tileXY(2, 2), ClearGround.Rough, 3);
  const rough = groundSpriteId(w, w.tileXY(2, 2));
  assert.equal(rough, [4000, 4019, 4020, 4021, 4022, 4000, 4019, 4020][tileHash(2, 2) & 7]);
  w.makeClear(w.tileXY(2, 3), ClearGround.Rocks, 3);
  assert.equal(groundSpriteId(w, w.tileXY(2, 3)), 4023);
  w.makeSea(w.tileXY(4, 4));
  assert.equal(groundSpriteId(w, w.tileXY(4, 4)), 4061);
  w.makeShore(w.tileXY(4, 5));
  assert.equal(groundSpriteId(w, w.tileXY(4, 5)), 5936);
  w.makeVoid(w.tileXY(0, 0));
  assert.equal(groundSpriteId(w, w.tileXY(0, 0)), null);
});

test('every ground sprite of a generated map is in the extracted atlas', () => {
  const assets = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'assets', 'sprites', 'sprites.json'), 'utf8'));
  const table = assets.sprites.temperate as Record<string, unknown[]>;
  const s = defaultGeneration(12345);
  s.terrainType = 1; s.tgenSmoothness = 1; s.variety = 0; s.quantitySeaLakes = 0;
  s.mapHeightLimit = 0; s.freeformEdges = true; s.waterBorders = 16; s.amountOfRivers = 0;
  s.treePlacer = 0; s.landscape = Landscape.Temperate;
  const { world } = generateWorld(s);
  const seen = new Set<number>();
  for (let i = 0; i < world.size; i++) {
    const id = groundSpriteId(world, i);
    if (id === null) continue;
    seen.add(id);
    assert.ok(table[String(id)], `sprite ${id} is missing from the asset table`);
  }
  for (const id of [3981, 4061]) assert.ok(seen.has(id), `the map uses sprite ${id}`);
  assert.ok([...seen].some((id) => id >= 5936 && id <= 5953), 'the map uses a shore sprite');
  assert.ok(seen.size > 20);
});
