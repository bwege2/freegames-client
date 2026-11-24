// The commands of the lockstep (src/sim/commands.ts), on the real Farmland (2) data: one executor for
// single-player and online, ownership checked rather than trusted, every command surviving the schema,
// and two Worlds fed the same commands staying bit-for-bit alike.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as $ from 'capnp-es';
import { TemplateDatabase } from '../src/data/template-db.ts';
import { parseScenario } from '../src/data/map.ts';
import { parsePmp } from '../src/data/pmp.ts';
import { World } from '../src/sim/world.ts';
import { applyCommand, readTurn, writeCommand, type PlayerCommand } from '../src/sim/commands.ts';
import { Turn } from '../src/proto/0ad.ts';

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

function world(): World { return new World(options); }
const own = (w: World, p: number): number[] => w.entitiesOf(p).filter((e) => e.kind === 'unit').map((e) => e.id);
const cc = (w: World, p: number) => w.entitiesOf(p).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'))!;

test('a command only touches its own player\'s units and buildings', () => {
  const w = world();
  const mine = own(w, 1), theirs = own(w, 2);
  const theirCc = cc(w, 2);
  const before = theirs.map((id) => `${w.entity(id)!.x},${w.entity(id)!.z}`);
  assert.equal(applyCommand(w, 1, { type: 'move', units: theirs, x: 300, z: 300 }), false);
  assert.deepEqual(theirs.map((id) => `${w.entity(id)!.x},${w.entity(id)!.z}`), before, 'enemy units did not move');
  assert.equal(applyCommand(w, 1, { type: 'move', units: mine, x: 300, z: 300 }), true);
  assert.ok(w.entity(mine[0])!.order?.type === 'move');
  // an enemy building cannot be trained from, a rally point cannot be set on it
  assert.equal(applyCommand(w, 1, { type: 'train', building: theirCc.id, template: 'units/athen/infantry_spearman_b' }), false);
  assert.equal(applyCommand(w, 1, { type: 'rally', building: theirCc.id, x: 100, z: 100 }), false);
  assert.equal(theirCc.rally, null);
  // an attack order naming our own unit is refused by the world's own check
  assert.equal(applyCommand(w, 1, { type: 'attack', units: mine, target: mine[0] }), false);
});

test('move, gather, build, train, place, stop, stance and rally reach the simulation', () => {
  const w = world();
  const units = own(w, 1);
  const civilians = units.filter((id) => w.entity(id)!.role === 'civilian');
  const soldiers = units.filter((id) => w.entity(id)!.role === 'soldier');
  const civic = cc(w, 1);

  assert.equal(applyCommand(w, 1, { type: 'stop', units: soldiers }), true);
  assert.equal(applyCommand(w, 1, { type: 'stance', units: soldiers, stance: 2 }), true);
  assert.ok(soldiers.every((id) => w.entity(id)!.stance === 'standground'));
  assert.equal(applyCommand(w, 1, { type: 'stance', units: soldiers, stance: 9 }), false);

  let tree: number | null = null;
  for (const e of w.entities.values()) if (e.alive && e.player === 0 && e.info.supply?.type === 'wood.tree') { tree = e.id; break; }
  assert.ok(tree);
  assert.equal(applyCommand(w, 1, { type: 'gather', units: civilians, target: tree }), true);
  assert.ok(w.entity(civilians[0])!.order?.type === 'gather');

  // a house placed with its builders gets the foundation and the build order in the same command
  let spot: { x: number; z: number } | null = null;
  for (let r = 18; r < 70 && !spot; r += 4) {
    for (let a = 0; a < 24 && !spot; a++) {
      const x = civic.x + Math.cos(a / 24 * Math.PI * 2) * r;
      const z = civic.z + Math.sin(a / 24 * Math.PI * 2) * r;
      if (w.canPlace('structures/athen/house', x, z)) spot = { x, z };
    }
  }
  assert.ok(spot);
  const next = w.nextId;
  assert.equal(applyCommand(w, 1, { type: 'place', template: 'structures/athen/house', x: spot.x, z: spot.z, yaw: 1, builders: civilians }), true);
  const house = w.entity(next)!;
  assert.ok(house.construction, 'a foundation');
  assert.ok(civilians.some((id) => {
    const order = w.entity(id)!.order;
    return order?.type === 'build' && order.target === house.id;
  }));
  assert.equal(applyCommand(w, 2, { type: 'place', template: 'structures/athen/house', x: spot.x, z: spot.z, yaw: 1, builders: [] }), false, 'the spot is taken');

  assert.equal(applyCommand(w, 1, { type: 'rally', building: civic.id, x: 200, z: 200 }), true);
  assert.deepEqual(civic.rally, { x: 200, z: 200 });

  // train with what the Civic Centre offers, then finish the building quickly for the test
  const hoplite = 'units/athen/infantry_spearman_b';
  assert.equal(applyCommand(w, 1, { type: 'train', building: civic.id, template: hoplite }), true);
  assert.equal(w.entity(civic.id)!.production[0].template, hoplite);
  assert.equal(applyCommand(w, 2, { type: 'train', building: civic.id, template: hoplite }), false);
});

test('every command survives the packed schema', () => {
  const commands: PlayerCommand[] = [
    { type: 'move', units: [3, 4, 5], x: 123.5, z: 456.25 },
    { type: 'gather', units: [6], target: 77 },
    { type: 'attack', units: [8, 9], target: 88 },
    { type: 'build', units: [10], target: 99 },
    { type: 'train', building: 11, template: 'units/athen/infantry_slinger_b' },
    { type: 'place', template: 'structures/athen/house', x: 1, z: 2, yaw: 3.5, builders: [12, 13] },
    { type: 'stop', units: [14] },
    { type: 'stance', units: [15, 16], stance: 1 },
    { type: 'rally', building: 17, x: 5, z: 6 },
  ];
  const m = new $.Message();
  const t = m.initRoot(Turn);
  t.turn = 42;
  const list = t._initCommands(commands.length);
  commands.forEach((c, i) => writeCommand(c, list.get(i)));
  const back = readTurn(m.getRoot(Turn));
  assert.equal(back.turn, 42);
  assert.deepEqual(back.commands, commands);
});

test('two worlds fed the same commands agree on every turn, before and after a save', () => {
  const a = world(), b = world();
  const script: { turn: number; seat: number; command: PlayerCommand }[] = [];
  for (let seat = 1; seat <= 2; seat++) {
    const w = a;
    const units = own(w, seat);
    const civilians = units.filter((id) => w.entity(id)!.role === 'civilian');
    const soldiers = units.filter((id) => w.entity(id)!.role === 'soldier');
    const civic = cc(w, seat);
    const home = w.entity(civilians[0])!;
    const trees = [...w.entities.values()].filter((e) => e.alive && e.player === 0 && e.info.supply?.type === 'wood.tree');
    const tree = trees.reduce((best, t) => Math.hypot(t.x - home.x, t.z - home.z) < Math.hypot(best.x - home.x, best.z - home.z) ? t : best);
    script.push({ turn: 2, seat, command: { type: 'gather', units: civilians, target: tree.id } });
    script.push({ turn: 6, seat, command: { type: 'move', units: soldiers, x: 500, z: 500 } });
    script.push({ turn: 10, seat, command: { type: 'stance', units: soldiers, stance: 3 } });
    script.push({ turn: 14, seat, command: { type: 'train', building: civic.id, template: 'units/athen/infantry_spearman_b' } });
  }
  for (let turn = 0; turn < 120; turn++) {
    for (const entry of script) if (entry.turn === turn) assert.equal(applyCommand(a, entry.seat, entry.command), true, `turn ${turn} seat ${entry.seat}`);
    for (const entry of script) if (entry.turn === turn) applyCommand(b, entry.seat, entry.command);
    a.update();
    b.update();
    assert.equal(b.stateHash(), a.stateHash(), `turn ${turn}`);
  }
  const restored = World.restore(a.serialize(), options);
  assert.equal(restored.stateHash(), a.stateHash(), 'the serialized state is the same state');
  assert.equal(restored.turn, 120);
});
