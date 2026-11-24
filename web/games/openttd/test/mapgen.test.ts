// The port's new-game map against the pinned OpenTTD 15.3 binary.
//
// Fixtures were produced by re/openttd/tools/oracle.mjs: the dedicated 15.3
// server generated a map from a seed with the settings in fixtures/oracle.json
// and saved it. Town, industry, object and tree generation are later stages;
// their tiles (and their terraforming) are masked, computed from the *native*
// tile types only. Every other tile's height and type must match exactly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultGeneration, Landscape, type GenerationSettings } from '../src/sim/settings.ts';
import { generateWorld } from '../src/sim/worldgen.ts';
import { TileType } from '../src/sim/world.ts';

const dir = join(import.meta.dirname, 'fixtures');
const oracle = JSON.parse(readFileSync(join(dir, 'oracle.json'), 'utf8'));

function settingsFor(seed: number): GenerationSettings {
  const s = defaultGeneration(seed);
  const o = oracle.settings;
  s.landscape = Landscape[o.landscape[0].toUpperCase() + o.landscape.slice(1) as keyof typeof Landscape];
  s.mapXLog = o.map_x;
  s.mapYLog = o.map_y;
  s.tgenSmoothness = o.tgen_smoothness;
  s.variety = o.variety;
  s.quantitySeaLakes = o.quantity_sea_lakes;
  s.amountOfRivers = o.amount_of_rivers;
  s.treePlacer = o.tree_placer;
  s.freeformEdges = o.freeform_edges === 'true';
  s.waterBorders = o.water_borders;
  s.mapHeightLimit = o.map_height_limit;
  return s;
}

for (const seed of [1, 2, 12345]) {
  test(`map generated from seed ${seed} matches the native 15.3 map`, () => {
    const fixture = JSON.parse(readFileSync(join(dir, `seed-${seed}.json`), 'utf8'));
    assert.equal(fixture.seed, seed);
    const size = fixture.mapSize;
    assert.equal(size, 256);
    const nativeH = Buffer.from(fixture.height, 'base64');
    const nativeT = Buffer.from(fixture.type, 'base64');
    const nativeM5 = Buffer.from(fixture.m5, 'base64');
    const nativeM1 = Buffer.from(fixture.m1, 'base64');
    assert.equal(nativeH.length, size * size);
    assert.equal(nativeT.length, size * size);
    assert.equal(nativeM5.length, size * size);
    assert.equal(nativeM1.length, size * size);

    const { world } = generateWorld(settingsFor(seed));
    assert.equal(world.size, size * size);

    // Mask the tiles of the stages not ported yet, from the native map:
    // roads, houses, trees, stations, industries, objects, and their
    // terraforming within four tiles.
    let mask = new Uint8Array(world.size);
    const unported = new Set<number>([TileType.Road, TileType.House, TileType.Trees, TileType.Station, TileType.Industry, TileType.Object]);
    for (let i = 0; i < world.size; i++) if (unported.has(nativeT[i] >> 4)) mask[i] = 1;
    for (let step = 0; step < 4; step++) {
      const next = mask.slice();
      for (let i = 0; i < world.size; i++) {
        if (!mask[i]) continue;
        const x = i % size, y = Math.floor(i / size);
        if (x > 0) next[i - 1] = 1;
        if (x < size - 1) next[i + 1] = 1;
        if (y > 0) next[i - size] = 1;
        if (y < size - 1) next[i + size] = 1;
      }
      mask = next;
    }

    let compared = 0, masked = 0;
    const heightErrors: string[] = [];
    const typeErrors: string[] = [];
    const groundErrors: string[] = [];
    for (let i = 0; i < world.size; i++) {
      if (mask[i]) { masked++; continue; }
      compared++;
      if (world.height[i] !== nativeH[i]) {
        if (heightErrors.length < 8) heightErrors.push(`${i % size},${Math.floor(i / size)}: port ${world.height[i]} native ${nativeH[i]}`);
      }
      if ((world.type[i] >> 4) !== (nativeT[i] >> 4)) {
        if (typeErrors.length < 8) typeErrors.push(`${i % size},${Math.floor(i / size)}: port ${world.type[i] >> 4} native ${nativeT[i] >> 4}`);
      }
      if (world.m5[i] !== nativeM5[i] || world.m1[i] !== nativeM1[i]) {
        if (groundErrors.length < 8) groundErrors.push(`${i % size},${Math.floor(i / size)}: m5 ${world.m5[i]}/${nativeM5[i]} m1 ${world.m1[i]}/${nativeM1[i]}`);
      }
    }
    assert.deepEqual(heightErrors, [], 'tile heights differ');
    assert.deepEqual(typeErrors, [], 'tile types differ');
    assert.deepEqual(groundErrors, [], 'tile ground/water bytes differ');
    assert.ok(compared > 63000, `compared ${compared} tiles`);
    assert.ok(masked < 1500, `masked ${masked} tiles`);
  });
}
