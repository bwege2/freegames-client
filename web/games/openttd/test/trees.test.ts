// Trees against the pinned OpenTTD 15.3 binary: the fixtures were generated
// with OTTD_ORACLE_STAGES=landscape,trees and tree_placer=2. The oracle sets
// extra_tree_placement=3 so the savegame is the generated map and not a map
// that has been ticking; every tile byte must match, including m2 (tree
// ground/density) and m5 (count/growth).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultGeneration, Landscape } from '../src/sim/settings.ts';
import { generateWorld } from '../src/sim/worldgen.ts';

const dir = join(import.meta.dirname, 'fixtures');
for (const name of ['trees-temperate-12345.json', 'trees-tropic-12345.json']) {
  test(`${name} matches the native 15.3 tree map`, () => {
    const fixture = JSON.parse(readFileSync(join(dir, name), 'utf8'));
    const size = fixture.mapSize;
    assert.equal(size, 256);
    const nativeH = Buffer.from(fixture.height, 'base64');
    const nativeT = Buffer.from(fixture.type, 'base64');
    const nativeM1 = Buffer.from(fixture.m1, 'base64');
    const nativeM2 = Buffer.from(fixture.m2, 'base64');
    const nativeM3 = Buffer.from(fixture.m3, 'base64');
    const nativeM4 = Buffer.from(fixture.m4, 'base64');
    const nativeM5 = Buffer.from(fixture.m5, 'base64');
    assert.equal(nativeM2.length, size * size * 2);

    const settings = defaultGeneration(fixture.seed);
    settings.landscape = Landscape[fixture.landscape[0].toUpperCase() + fixture.landscape.slice(1) as keyof typeof Landscape];
    settings.terrainType = 1;
    settings.tgenSmoothness = 1;
    settings.variety = 0;
    settings.quantitySeaLakes = 0;
    settings.mapHeightLimit = 0;
    settings.freeformEdges = true;
    settings.waterBorders = 16;
    settings.amountOfRivers = fixture.amountOfRivers;
    settings.treePlacer = 2;
    settings.extraTreePlacement = 3;
    const { world } = generateWorld(settings);

    const errors: string[] = [];
    for (let i = 0; i < world.size; i++) {
      const m2 = (nativeM2[i * 2] << 8) | nativeM2[i * 2 + 1];
      if (world.height[i] !== nativeH[i] || world.type[i] !== nativeT[i] ||
          world.m1[i] !== nativeM1[i] || world.m2[i] !== m2 ||
          world.m3[i] !== nativeM3[i] || world.m4[i] !== nativeM4[i] ||
          world.m5[i] !== nativeM5[i]) {
        errors.push(`${i % size},${Math.floor(i / size)}: port h${world.height[i]} t${world.type[i]} m1 ${world.m1[i]} m2 ${world.m2[i]} m3 ${world.m3[i]} m5 ${world.m5[i]} native h${nativeH[i]} t${nativeT[i]} m1 ${nativeM1[i]} m2 ${m2} m3 ${nativeM3[i]} m5 ${nativeM5[i]}`);
      }
      if (errors.length >= 8) break;
    }
    assert.deepEqual(errors, [], `${name}: tiles differ from the native tree map`);
  });
}
