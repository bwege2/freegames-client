// The slice's simulation, checked against the original map/templates: starting army, gathering,
// foundation building, training and a save/restore round-trip. It uses the real Farmland (2) data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TemplateDatabase } from '../src/data/template-db.ts';
import { parseScenario } from '../src/data/map.ts';
import { parsePmp } from '../src/data/pmp.ts';
import { World } from '../src/sim/world.ts';
import { Ai } from '../src/sim/ai.ts';
import { attackDamage, totalDamage } from '../src/sim/combat.ts';

const ROOT = join(import.meta.dirname, '..', 'assets');
const files = new Map<string, string>();
for (const path of walk(join(ROOT, 'templates'))) {
  if (path.endsWith('.xml')) files.set(relative(join(ROOT, 'templates'), path).replace(/\.xml$/, ''), readFileSync(path, 'utf8'));
}
const db = new TemplateDatabase(files);
const scenario = parseScenario(readFileSync(join(ROOT, 'maps/farmland_2p.xml'), 'utf8'));
const terrain = parsePmp(readFileSync(join(ROOT, 'maps/farmland_2p.pmp')).buffer.slice(0));
const options = {
  scenario, terrain,
  templates: { info: (n: string) => db.info(n), has: (n: string) => db.has(n) },
  players: [
    { name: 'Player 1', civ: 'athen', color: [21 / 255, 55 / 255, 149 / 255] as [number, number, number] },
    { name: 'Player 2', civ: 'athen', color: [150 / 255, 20 / 255, 20 / 255] as [number, number, number] },
  ],
  seed: 0x5ead,
};

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function newWorld(): World { return new World(options); }

function withCivs(human: string, ai: string): typeof options {
  return {
    ...options,
    players: [
      { name: 'Player 1', civ: human, color: [21 / 255, 55 / 255, 149 / 255] as [number, number, number] },
      { name: 'Player 2', civ: ai, color: [150 / 255, 20 / 255, 20 / 255] as [number, number, number] },
    ],
  };
}

test('the map starts with the 11 supported Athenian entities per player', () => {
  const w = newWorld();
  assert.equal(w.entitiesOf(1).length, 11);
  assert.equal(w.entitiesOf(2).length, 11);
  assert.equal(w.entitiesOf(1).filter((e) => e.role === 'civilian').length, 5);
  assert.equal(w.entitiesOf(1).filter((e) => e.role === 'soldier').length, 5);
  assert.equal(w.entitiesOf(1).filter((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical')).length, 1);
  assert.equal(w.players[1].resources.wood, 300);
  assert.equal(w.players[1].popCap, 20);
});

test('a civilian gathers from the nearest tree and carries wood to the Civic Centre', () => {
  const w = newWorld();
  const worker = w.entitiesOf(1).find((e) => e.role === 'civilian')!;
  let tree: typeof worker | null = null;
  let best = Infinity;
  for (const e of w.entities.values()) {
    if (!e.alive || e.player !== 0 || e.info.supply?.type !== 'wood.tree') continue;
    const d = Math.hypot(e.x - worker.x, e.z - worker.z);
    if (d < best) { best = d; tree = e; }
  }
  assert.ok(tree);
  assert.ok(w.orderGather([worker.id], tree.id));
  const before = w.players[1].resources.wood;
  for (let i = 0; i < 700; i++) w.update();
  assert.ok(w.players[1].resources.wood > before, `wood ${before} -> ${w.players[1].resources.wood}`);
  assert.ok(tree.amount < 100, `tree amount ${tree.amount}`);
  assert.ok(worker.carry === null || worker.carry.amount >= 0);
});

test('a house foundation is built by civilians and raises the population cap', () => {
  const w = newWorld();
  const cc = w.entitiesOf(1).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  let spot: { x: number; z: number } | null = null;
  for (let r = 18; r < 70 && !spot; r += 4) {
    for (let a = 0; a < 24 && !spot; a++) {
      const x = cc.x + Math.cos(a / 24 * Math.PI * 2) * r;
      const z = cc.z + Math.sin(a / 24 * Math.PI * 2) * r;
      if (w.canPlace('structures/athen/house', x, z)) spot = { x, z };
    }
  }
  assert.ok(spot, 'a free house footprint near the Civic Centre');
  const house = w.placeBuilding(1, 'structures/athen/house', spot.x, spot.z, 0);
  assert.ok(house && house.construction, 'foundation placed');
  const builders = w.entitiesOf(1).filter((e) => e.role === 'civilian').slice(0, 2);
  assert.ok(w.orderBuild(builders.map((e) => e.id), house.id));
  for (let i = 0; i < 900; i++) w.update();
  assert.equal(house.construction, null, 'foundation completed');
  assert.ok(w.players[1].popCap > 20, `population cap ${w.players[1].popCap}`);
  assert.equal(house.hp, house.maxHp);
});

test('the Civic Centre trains a hoplite and the population is charged', () => {
  const w = newWorld();
  const cc = w.entitiesOf(1).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  w.players[1].resources.food = 500;
  w.players[1].resources.wood = 500;
  assert.ok(w.queueTraining(cc.id, 'units/athen/infantry_spearman_b'));
  assert.equal(cc.production.length, 1);
  const before = w.entitiesOf(1).length;
  for (let i = 0; i < 200; i++) w.update();
  assert.equal(w.entitiesOf(1).length, before + 1);
  assert.ok(w.entitiesOf(1).some((e) => e.template === 'units/athen/infantry_spearman_b' && e.id !== cc.id));
  assert.ok(w.players[1].popUsed >= 11);
});

test('combat uses the original armour formula and a unit can kill a target', () => {
  const w = newWorld();
  const attacker = w.entitiesOf(1).find((e) => e.info.attack.melee)!;
  const target = w.entitiesOf(2).find((e) => e.role === 'soldier')!;
  const attack = attacker.info.attack.melee!;
  const damage = attackDamage(attack, target.info);
  assert.ok(totalDamage(damage) > 0);
  const before = target.hp;
  target.x = attacker.x + 2;
  target.z = attacker.z;
  assert.ok(w.orderAttack([attacker.id], target.id));
  for (let i = 0; i < 60; i++) w.update();
  assert.ok(target.hp < before || !target.alive, `target hp ${before} -> ${target.hp}`);
});

test('serialize/restore keeps the turn, entities and resources', () => {
  const w = newWorld();
  w.players[1].resources.food = 423;
  for (let i = 0; i < 5; i++) w.update();
  const snapshot = w.serialize();
  const restored = World.restore(snapshot, options);
  assert.equal(restored.time, w.time);
  assert.equal(restored.entities.size, w.entities.size);
  assert.equal(restored.players[1].resources.food, w.players[1].resources.food);
  assert.equal(restored.winner, w.winner);
});

test('restore keeps both players’ civilisations, so a Carthaginian save loads as Carthage', () => {
  const w = new World(withCivs('cart', 'athen'));
  // restore into options for the other way round: the snapshot's civilisations must win
  const restored = World.restore(w.serialize(), withCivs('athen', 'cart'));
  assert.equal(restored.players[0].civ, 'gaia');
  assert.equal(restored.players[1].civ, 'cart');
  assert.equal(restored.players[2].civ, 'athen');
  assert.deepEqual(restored.buildOptions(1).map((b) => b.template), [
    'structures/cart/house', 'structures/cart/storehouse', 'structures/cart/farmstead',
    'structures/cart/field', 'structures/cart/barracks', 'structures/cart/defense_tower',
  ]);
  assert.ok(restored.entitiesOf(1).some((e) => e.template === 'structures/cart/civil_centre'));
  assert.ok(new Ai(restored, 2, 11).civ === 'athen');
});

test('a Carthaginian start has the Punic Civic Centre, spearmen, archers and citizens', () => {
  const w = new World(withCivs('cart', 'athen'));
  const units = w.entitiesOf(1).filter((e) => e.kind === 'unit');
  assert.equal(w.entitiesOf(1).length, 11);
  assert.equal(units.filter((e) => e.role === 'civilian').length, 5);
  assert.equal(units.filter((e) => e.role === 'soldier').length, 5);
  assert.equal(units.filter((e) => e.template === 'units/cart/infantry_spearman_b').length, 3);
  assert.equal(units.filter((e) => e.template === 'units/cart/infantry_archer_b').length, 2);
  assert.equal(units.filter((e) => e.template.includes('slinger')).length, 0);
  assert.ok(units.every((e) => e.template.startsWith('units/cart/')), 'no Athenian unit in a Carthaginian start');
  const cc = w.entitiesOf(1).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  assert.equal(cc.template, 'structures/cart/civil_centre');
  assert.deepEqual(w.buildOptions(1).map((b) => b.template), [
    'structures/cart/house', 'structures/cart/storehouse', 'structures/cart/farmstead',
    'structures/cart/field', 'structures/cart/barracks', 'structures/cart/defense_tower',
  ]);
  assert.ok(w.entitiesOf(2).every((e) => e.template.startsWith('structures/athen/') || e.template.startsWith('units/athen/')), 'the other side is Athenian');
});

test('the Carthaginian Civic Centre trains an archer with the original cost and time', () => {
  const w = new World(withCivs('cart', 'athen'));
  const cc = w.entitiesOf(1).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;
  assert.ok(w.trainOptions(cc).some((t) => t.template === 'units/cart/infantry_archer_b' && t.affordable));
  const food = w.players[1].resources.food, wood = w.players[1].resources.wood;
  const before = w.entitiesOf(1).filter((e) => e.template === 'units/cart/infantry_archer_b').length;
  assert.ok(w.queueTraining(cc.id, 'units/cart/infantry_archer_b'));
  assert.equal(w.players[1].resources.food, food - 50);
  assert.equal(w.players[1].resources.wood, wood - 50);
  for (let i = 0; i < 60; i++) w.update();
  assert.equal(w.entitiesOf(1).filter((e) => e.template === 'units/cart/infantry_archer_b').length, before + 1);
});

test('the opponent builds and trains its own civilisation', () => {
  const w = new World(withCivs('athen', 'cart'));
  const ai = new Ai(w, 2, 11);
  for (let i = 0; i < 700; i++) { w.update(); ai.update(); }
  const buildings = w.entitiesOf(2).filter((e) => e.kind === 'building').map((e) => e.template);
  assert.ok(buildings.includes('structures/cart/civil_centre'));
  assert.ok(buildings.includes('structures/cart/storehouse'), buildings.join(', '));
  assert.ok(buildings.includes('structures/cart/farmstead'), buildings.join(', '));
  assert.ok(buildings.every((t) => t.startsWith('structures/cart/')), 'no Athenian building for Carthage');
  const units = w.entitiesOf(2).filter((e) => e.kind === 'unit').map((e) => e.template);
  assert.ok(units.every((t) => t.startsWith('units/cart/')), 'no Athenian unit for Carthage');
  assert.ok(units.some((t) => t === 'units/cart/support_civilian'));
});
