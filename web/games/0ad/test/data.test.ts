// Real-data checks for the 0 A.D. slice: the original Farmland (2) PMP/scenario, the resolved templates
// the port reads and the compiled PMD/PSA assets. Every expected value is taken from the pinned release,
// not invented; the tests fail if the shipped subset changes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { parsePmp } from '../src/data/pmp.ts';
import { parseScenario } from '../src/data/map.ts';
import { TemplateDatabase } from '../src/data/template-db.ts';
import { parsePmd } from '../src/data/pmd.ts';
import { parsePsa } from '../src/data/psa.ts';

const ROOT = join(import.meta.dirname, '..', 'assets');
const templates = new Map<string, string>();
for (const path of walk(join(ROOT, 'templates'))) {
  if (!path.endsWith('.xml')) continue;
  templates.set(relative(join(ROOT, 'templates'), path).replace(/\.xml$/, ''), readFileSync(path, 'utf8'));
}
const db = new TemplateDatabase(templates);
const scenario = parseScenario(readFileSync(join(ROOT, 'maps/farmland_2p.xml'), 'utf8'));
const terrain = parsePmp(readFileSync(join(ROOT, 'maps/farmland_2p.pmp')).buffer.slice(0));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}


test('Farmland (2) PMP is the original 16-patch, 257-vertex terrain', () => {
  assert.equal(terrain.patchesPerSide, 16);
  assert.equal(terrain.verticesPerSide, 257);
  assert.equal(terrain.tilesPerSide, 256);
  assert.equal(terrain.size, 1024);
  assert.equal(terrain.tiles.length, 65536);
  assert.equal(terrain.textures.length, 23);
  assert.deepEqual(terrain.textures.slice(0, 3), ['temp_grass_01_mod', 'dirt_brown_a', 'tropic_farmland']);
  assert.equal(createHash('sha256').update(terrain.heights).digest('hex'),
    '39ae107b134d59ec74bf4216ade7c2e0593c69e676317feb77b6e0e7684a9fd2', 'height-map SHA-256 from the release');
  assert.equal(terrain.heightAt(0, 0), terrain.heights[0] / 92);
});

test('Farmland (2) scenario has the original 2,921 entities and owners', () => {
  assert.equal(scenario.settings.name, 'Farmland (2)');
  assert.equal(scenario.placements.length, 2921);
  const owners = new Map<number, number>();
  for (const p of scenario.placements) owners.set(p.player, (owners.get(p.player) ?? 0) + 1);
  assert.deepEqual([...owners.entries()].sort(), [[0, 2895], [1, 13], [2, 13]]);
  assert.deepEqual(scenario.camera, { x: 295.66, y: 328.24, z: 191.997, rotation: 0.53881, declination: 0.655811 });
  assert.equal(scenario.environment.water?.height, 5);
});

test('the Athenian templates keep the original stats and costs', () => {
  const cc = db.info('structures/athen/civil_centre');
  assert.equal(cc.health, 3000);
  assert.equal(cc.cost.buildTime, 500);
  assert.deepEqual(cc.cost.resources, { food: 0, wood: 300, stone: 300, metal: 250 });
  assert.ok(cc.trainer?.entities.includes('units/{civ}/infantry_spearman_b'));
  assert.equal(cc.populationBonus, 20);
  assert.ok(cc.classes.includes('ConquestCritical'));

  const hoplite = db.info('units/athen/infantry_spearman_b');
  assert.equal(hoplite.health, 100);
  assert.deepEqual(hoplite.cost.resources, { food: 50, wood: 50, stone: 0, metal: 0 });
  assert.equal(hoplite.cost.population, 1);
  assert.equal(hoplite.gatherer?.rates['wood.tree'], 0.75);
  assert.equal(hoplite.gatherer?.capacities.wood, 10);
  assert.equal(hoplite.attack.melee?.maxRange, 4);
  assert.equal(hoplite.attack.melee?.repeatTime, 1000);

  const artisan = db.info('units/athen/support_civilian');
  assert.equal(artisan.health, 25);
  assert.equal(artisan.gatherer?.rates['food.fruit'], 1);
  assert.ok(artisan.builder);
});

test('the Carthaginian templates keep the original stats and costs', () => {
  const cc = db.info('structures/cart/civil_centre');
  assert.equal(cc.health, 3000);
  assert.deepEqual(cc.cost.resources, { food: 0, wood: 300, stone: 300, metal: 250 });
  assert.equal(cc.populationBonus, 20);
  assert.ok(cc.trainer?.entities.includes('units/{civ}/infantry_archer_b'));
  assert.ok(cc.classes.includes('ConquestCritical'));

  // Carthage's ranged citizen soldier is the archer (simulation/data/civs/cart.json), not a slinger
  const archer = db.info('units/cart/infantry_archer_b');
  assert.equal(archer.health, 50);
  assert.deepEqual(archer.cost.resources, { food: 50, wood: 50, stone: 0, metal: 0 });
  assert.equal(archer.cost.buildTime, 10);
  assert.equal(archer.attack.ranged?.maxRange, 60);
  assert.equal(archer.attack.ranged?.repeatTime, 1250);
  assert.deepEqual(archer.attack.ranged?.damage, { Pierce: 7.2 });
  assert.equal(archer.walkSpeed, 10.3);
  assert.equal(archer.gatherer?.rates['wood.tree'], 0.75);

  const spearman = db.info('units/cart/infantry_spearman_b');
  assert.equal(spearman.health, 100);
  assert.equal(spearman.attack.melee?.maxRange, 4);
  assert.deepEqual(spearman.attack.melee?.damage, { Hack: 4.5, Pierce: 4 });
  assert.equal(spearman.walkSpeed, 9.5);

  const house = db.info('structures/cart/house');
  assert.equal(house.health, 1200);
  assert.equal(house.populationBonus, 10);
  assert.equal(house.cost.buildTime, 50);
  const tower = db.info('structures/cart/defense_tower');
  assert.equal(tower.attack.ranged?.maxRange, 60);
  assert.equal(tower.attack.ranged?.repeatTime, 3500);
  assert.equal(tower.health, 1000);
});

test('the PMD and PSA parsers read the shipped original files', () => {
  const pmd = parsePmd(readFileSync(join(ROOT, 'meshes/skeletal/new/m_tunic_short.pmd')).buffer.slice(0));
  assert.equal(pmd.version, 4);
  assert.equal(pmd.positions.length, 668 * 3);
  assert.equal(pmd.faces.length, 932 * 3);
  assert.equal(pmd.bones.length, 46);
  assert.ok(pmd.propPoints.some((p) => p.name === 'head'));
  const psa = parsePsa(readFileSync(join(ROOT, 'animations/biped/infantry/hoplite/idle_relax_01.psa')).buffer.slice(0));
  assert.equal(psa.numKeys, 46);
  assert.equal(psa.numFrames, 59);
  assert.ok(Math.abs(psa.frameTime - 33.333332) < 0.001);
});

test('the shipped subset keeps every template its map/actors need', () => {
  for (const name of [
    'structures/athen/civil_centre', 'structures/athen/house', 'structures/athen/storehouse',
    'structures/athen/farmstead', 'structures/athen/field', 'structures/athen/barracks',
    'units/athen/infantry_spearman_b', 'units/athen/infantry_slinger_b', 'units/athen/support_civilian',
    'structures/cart/civil_centre', 'structures/cart/house', 'structures/cart/storehouse',
    'structures/cart/farmstead', 'structures/cart/field', 'structures/cart/barracks',
    'units/cart/infantry_spearman_b', 'units/cart/infantry_archer_b', 'units/cart/support_civilian',
    'gaia/tree/temperate', 'gaia/tree/fir', 'gaia/tree/bush_temperate', 'gaia/rock/temperate_small',
    'gaia/fruit/berry_01', 'gaia/ore/temperate_01', 'gaia/fauna_deer',
  ]) assert.ok(db.has(name), name);
});
