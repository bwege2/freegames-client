// Combat, capture and the save container, against the original templates and the shipped save
// format. The numeric expectations are computed from the values in the pinned XML (0 A.D. reduces
// each damage type by 10% per armour point), not from the port's own code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TemplateDatabase } from '../src/data/template-db.ts';
import { parseScenario } from '../src/data/map.ts';
import { parsePmp } from '../src/data/pmp.ts';
import { World } from '../src/sim/world.ts';
import { attackBonus, attackDamage, totalDamage } from '../src/sim/combat.ts';
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
const worldOptions = {
  scenario, terrain,
  templates: { info: (n: string) => db.info(n), has: (n: string) => db.has(n) },
  seed: 0x5ead,
};

const camera = {
  camera: { position: { x: 12, y: 34, z: 56 }, rotation: { x: -0.82, y: 0.53, z: 0 } },
  distance: 90,
} as unknown as RtsCamera;

test('the hoplite damage against a slinger uses the original armour and bonus formula', () => {
  const hoplite = db.info('units/athen/infantry_spearman_b');
  const slinger = db.info('units/athen/infantry_slinger_b');
  const damage = totalDamage(attackDamage(hoplite.attack.melee!, slinger));
  // Hack 4.5 * 0.9^1 + Pierce 4 * 0.9^1; the slinger has Hack 1 / Pierce 1.
  assert.ok(Math.abs(damage - (4.5 * 0.9 + 4 * 0.9)) < 1e-9, `damage ${damage}`);
  // The spearman template's BonusCavMelee is 2.5 against Cavalry.
  assert.equal(attackBonus(hoplite.attack.melee!, { ...slinger, classes: ['Unit', 'Cavalry'], civ: 'athen' }), 2.5);
  assert.equal(attackBonus(hoplite.attack.melee!, slinger), 1);
});

test('the Civic Centre carries the original 2500 capture points and 10 capture resistance', () => {
  const cc = db.info('structures/athen/civil_centre');
  assert.equal(cc.capturePoints, 2500);
  assert.equal(cc.captureResistance, 10);
  const hoplite = db.info('units/athen/infantry_spearman_b');
  assert.equal(hoplite.attack.capture?.captureValue, 2.5);
  assert.equal(hoplite.attack.melee?.captureValue, 0);
});

test('a hoplite takes an enemy Civic Centre by capture and wins the conquest round', () => {
  const w = new World(worldOptions);
  const enemyCC = w.entitiesOf(2).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  // remove the defending units so this test isolates the capture mechanics
  for (const e of w.entitiesOf(2)) if (e.kind === 'unit') e.alive = false;
  enemyCC.capturePoints = 2;
  const info = db.info('units/athen/infantry_spearman_b');
  const attacker = w['makeEntity']('units/athen/infantry_spearman_b', info, 1, enemyCC.x + enemyCC.radius + 1, enemyCC.z, 0);
  attacker.id = w.nextId++;
  w.entities.set(attacker.id, attacker);
  assert.ok(w.orderAttack([attacker.id], enemyCC.id));
  for (let i = 0; i < 30; i++) w.update();
  assert.equal(enemyCC.player, 1, 'the Civic Centre changed owner');
  assert.equal(w.winner, 1, 'the old owner has no ConquestCritical building');
});

test('a slinger projectile crosses the range and damages a hoplite', () => {
  const w = new World(worldOptions);
  const slinger = w.entitiesOf(1).find((e) => e.template === 'units/athen/infantry_slinger_b')!;
  const target = w.entitiesOf(2).find((e) => e.template === 'units/athen/infantry_spearman_b')!;
  // put the target in clear space at 20 m, and remove the other units from the fight
  target.x = slinger.x + 20;
  target.z = slinger.z;
  for (const e of w.entitiesOf(2)) if (e.kind === 'unit' && e.id !== target.id) e.alive = false;
  assert.ok(w.orderAttack([slinger.id], target.id));
  for (let i = 0; i < 40; i++) w.update();
  assert.ok(target.hp < target.maxHp || !target.alive, `target ${target.hp}/${target.maxHp}`);
});

test('the browser save is a zip with 0 A.D. metadata and fits the storage limit', () => {
  const w = new World(worldOptions);
  const bytes = createSave(w, camera, 'test');
  assert.ok(bytes.length < 512 * 1024, `save is ${bytes.length} bytes`);
  const save = readSave(bytes);
  assert.equal(save.metadata.engine_version, '0.28.0');
  assert.equal(save.metadata.engine_serialization_version, '0.28.0');
  assert.equal(save.metadata.initAttributes.settings.map, 'farmland_2p');
  assert.equal(save.metadata.gui.camera.Zoom, 90);
  assert.equal(save.metadata.description, 'test');
  const restored = World.restore(save.snapshot, worldOptions);
  assert.equal(restored.entities.size, w.entities.size);
  assert.equal(restored.time, w.time);
});

test('a save keeps orders, construction, production and capture points', () => {
  const w = new World(worldOptions);
  const cc = w.entitiesOf(1).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  w.players[1].resources.food = 500;
  assert.ok(w.queueTraining(cc.id, 'units/athen/support_civilian'));
  const enemyCC = w.entitiesOf(2).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  enemyCC.capturePoints = 1234;
  const worker = w.entitiesOf(1).find((e) => e.role === 'civilian')!;
  let tree = null;
  let best = Infinity;
  for (const e of w.entities.values()) {
    if (!e.alive || e.info.supply?.type !== 'wood.tree') continue;
    const d = Math.hypot(e.x - worker.x, e.z - worker.z);
    if (d < best) { best = d; tree = e; }
  }
  assert.ok(tree);
  w.orderGather([worker.id], tree.id);
  const restored = World.restore(w.serialize(), worldOptions);
  assert.equal(restored.entity(cc.id)?.production.length, 1);
  assert.equal(restored.entity(enemyCC.id)?.capturePoints, 1234);
  assert.equal(restored.entity(worker.id)?.order?.type, 'gather');
});
