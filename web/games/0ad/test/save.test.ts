// The slice save container: a .0adsave zip with the exact 0 A.D. metadata fields and the port's
// documented simulation.dat serializer, written and read through the same API the game uses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { unzipSync } from 'fflate';
import { TemplateDatabase } from '../src/data/template-db.ts';
import { parseScenario } from '../src/data/map.ts';
import { parsePmp } from '../src/data/pmp.ts';
import { World } from '../src/sim/world.ts';
import { createSave, readSave } from '../src/save/save.ts';
import type { RtsCamera } from '../src/render/camera.ts';

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
  seed: 0x5ead,
};
const camera = {
  camera: { position: { x: 12, y: 34, z: 56 }, rotation: { x: -0.82, y: 0.53, z: 0 } },
  distance: 90,
} as unknown as RtsCamera;

test('the save is a zip with metadata.json and simulation.dat', () => {
  const world = new World(options);
  const bytes = createSave(world, camera, 'round-trip');
  const files = unzipSync(bytes);
  assert.ok(files['metadata.json']);
  assert.ok(files['simulation.dat']);
  const metadata = JSON.parse(new TextDecoder().decode(files['metadata.json']));
  assert.equal(metadata.engine_version, '0.28.0');
  assert.equal(metadata.engine_serialization_version, '0.28.0');
  assert.equal(metadata.playerID, 1);
  assert.equal(metadata.initAttributes.settings.map, 'farmland_2p');
  assert.equal(metadata.gui.camera.Zoom, 90);
  assert.equal(metadata.gui.camera.PosX, 12);
  assert.equal(metadata.description, 'round-trip');
});

test('readSave restores the same world snapshot', () => {
  const world = new World(options);
  world.players[1].resources.wood = 321;
  for (let i = 0; i < 7; i++) world.update();
  const bytes = createSave(world, camera, 'round-trip');
  const save = readSave(bytes);
  assert.equal(save.metadata.description, 'round-trip');
  const restored = World.restore(save.snapshot, options);
  assert.equal(restored.time, world.time);
  assert.equal(restored.entities.size, world.entities.size);
  assert.equal(restored.players[1].resources.wood, 321);
});

test('a foreign or truncated file is refused', () => {
  assert.throws(() => readSave(new Uint8Array([1, 2, 3])), /save|invalid|zip|unexpected/i);
});
