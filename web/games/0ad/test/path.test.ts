// Pathfinding and the compact opponent, on the real Farmland (2) grid. The slice's grid is 2 m
// (README.md records that 0 A.D.'s 1 m hierarchical pathfinder is not ported yet), so these tests
// verify the behaviour the port actually uses: passability, obstacle avoidance and AI progress.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TemplateDatabase } from '../src/data/template-db.ts';
import { parseScenario } from '../src/data/map.ts';
import { parsePmp } from '../src/data/pmp.ts';
import { World } from '../src/sim/world.ts';
import { Ai } from '../src/sim/ai.ts';
import { NAV_CELL } from '../src/sim/path.ts';

const ROOT = join(import.meta.dirname, '..', 'assets');
const files = new Map<string, string>();
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
for (const path of walk(join(ROOT, 'templates'))) {
  if (path.endsWith('.xml')) files.set(relative(join(ROOT, 'templates'), path).replace(/\.xml$/, ''), readFileSync(path, 'utf8'));
}
const db = new TemplateDatabase(files);
const scenario = parseScenario(readFileSync(join(ROOT, 'maps/farmland_2p.xml'), 'utf8'));
const terrain = parsePmp(readFileSync(join(ROOT, 'maps/farmland_2p.pmp')).buffer.slice(0));
const options = {
  scenario, terrain,
  templates: { info: (n: string) => db.info(n), has: (n: string) => db.has(n) },
  seed: 11,
};

test('the nav grid is the map size in 2 m cells with blocked buildings', () => {
  const w = new World(options);
  assert.equal(NAV_CELL, 2);
  assert.equal(w.nav.size, 512);
  const cc = w.entitiesOf(1).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  assert.equal(w.nav.isBlocked(cc.x, cc.z), true, 'the Civic Centre blocks its footprint');
  const free = w.nav.nearestFree(cc.x + 25, cc.z + 25, 8);
  assert.ok(free);
  assert.equal(w.nav.isBlocked(free!.x, free!.z), false);
});

test('A* returns a clear, smoothed path between two points', () => {
  const w = new World(options);
  const path = w.nav.findPath(187, 369, 235, 410);
  assert.ok(path && path.length > 0);
  let prev = { x: 187, z: 369 };
  for (const p of path!) {
    assert.equal(w.nav.lineClear(prev.x, prev.z, p.x, p.z), true, 'every smoothed segment is clear');
    prev = p;
  }
});

test('the opponent gathers, builds and trains without free resources', () => {
  const w = new World(options);
  const ai = new Ai(w, 2, 11);
  const start = { ...w.players[2].resources };
  for (let i = 0; i < 1200; i++) { w.update(); ai.update(); }
  const p2 = w.entitiesOf(2);
  assert.ok(p2.filter((e) => e.kind === 'building').length >= 3, 'AI built at least three buildings');
  assert.ok(p2.filter((e) => e.role === 'civilian').length >= 7, 'AI trained civilians');
  assert.ok(p2.filter((e) => e.role === 'soldier').length >= 3, 'AI trained soldiers');
  assert.notDeepEqual(w.players[2].resources, start, 'AI economy moved');
  assert.ok(w.players[2].popCap >= 20);
});
