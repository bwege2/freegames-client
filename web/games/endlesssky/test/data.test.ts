// The port's data loader against the reference release's own data files:
// counts, and values the original's loaders compute (ship stats, outfit
// attributes, weapon values, prices, system links and orbits).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseData } from '../src/data/node.ts';
import { GameData, erf } from '../src/data/gamedata.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'data');
const files: { path: string; text: string }[] = [];
function walk(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.txt')) files.push({ path, text: readFileSync(path, 'utf8') });
  }
}
walk(root);

const data = new GameData();
const started = performance.now();
data.load(files, parseData);
const elapsed = performance.now() - started;

test('the whole data tree loads', () => {
  assert.ok(files.length > 195, `${files.length} data files`);
  assert.ok(data.systems.size > 650, `${data.systems.size} systems`);
  assert.ok(data.planets.size > 600, `${data.planets.size} planets`);
  assert.ok(data.ships.size > 900, `${data.ships.size} ships`);
  assert.ok(data.outfits.size > 900, `${data.outfits.size} outfits`);
  assert.ok(data.commodities.length >= 10, `${data.commodities.length} commodities`);
  assert.ok(elapsed < 5000, `loading took ${elapsed.toFixed(0)} ms`);
  // No missing references in the files the port uses.
  assert.deepEqual(data.warnings.filter((w) => w.includes('links missing system')), []);
});

test('a ship, its outfits and its computed stats', () => {
  const barge = data.ships.get('Star Barge')!;
  assert.equal(barge.base.cost, 190000);
  assert.equal(barge.base.mass, 80);
  assert.equal(barge.base.get('shields'), 600);
  assert.equal(barge.base.get('hull'), 1000);
  assert.equal(barge.base.get('drag'), 2.2);
  assert.equal(barge.base.get('cargo space'), 50);
  assert.equal(barge.base.get('outfit space'), 130);
  assert.equal(barge.defaultOutfits.get('Hyperdrive'), 1);
  const attrs = data.shipAttributes(barge);
  assert.equal(attrs.get('shields'), 600); // the ship's base shields; a generator only recharges them
  assert.equal(attrs.get('shield generation'), 0.2); // D14-RN Shield Generator
  assert.equal(data.shipCost(barge), data.shipCost(barge));
  // Ship::Cost is the chassis plus every installed outfit.
  const expected = 190000 + [...barge.defaultOutfits].reduce((sum, [name, count]) => sum + data.outfits.get(name)!.cost * count, 0);
  assert.equal(data.shipCost(barge), expected);
});

test('weapons keep the original units and values', () => {
  const blaster = data.outfits.get('Energy Blaster')!;
  assert.equal(blaster.category, 'Guns');
  assert.equal(blaster.cost, 16000);
  assert.equal(blaster.stats.get('mass'), 0);
  assert.equal(blaster.mass, 5);
  assert.equal(blaster.stats.get('outfit space'), -5);
  const weapon = blaster.weapon!;
  assert.equal(weapon.velocity, 10.625);
  assert.equal(weapon.lifetime, 48);
  assert.equal(weapon.reload, 12);
  assert.equal(weapon.shieldDamage, 10.6);
  assert.equal(weapon.hullDamage, 6.6);
  assert.equal(weapon.firingEnergy, 5.8);
  assert.equal(weapon.firingHeat, 18);
  assert.equal(weapon.inaccuracy, 3);
  assert.equal(weapon.sprite, 'projectile/blaster');
});

test('the galaxy, its links and its orbits come from the data', () => {
  const rutilicus = data.systems.get('Rutilicus')!;
  assert.deepEqual(rutilicus.position, { x: -535, y: 273 });
  assert.ok(rutilicus.links.includes('Arcturus'));
  assert.ok(rutilicus.links.includes('Cebalrai'));
  assert.ok(rutilicus.links.includes('Holeb'));
  assert.ok(rutilicus.links.includes('Menkent'));
  assert.equal(data.systems.get('Arcturus')!.links.includes('Rutilicus'), true);
  assert.equal(rutilicus.trade.get('Food')!.base, 335);
  assert.equal(rutilicus.objects.length, 9);
  assert.equal(rutilicus.objects.find((o) => o.planet === 'New Boston')!.distance, 513.86);
  assert.equal(rutilicus.objects[0].sprite, 'star/g5');
  assert.equal(rutilicus.objects[0].isStar, true);
  const boston = data.planets.get('New Boston')!;
  assert.equal(boston.system, 'Rutilicus');
  assert.equal(boston.landscapes[0].name, 'land/water2');
  assert.equal(boston.shipyards[0], 'Basic Ships');
});

test('prices follow System::Price::Update', () => {
  const system = data.systems.get('Rutilicus')!;
  data.setSupply(system, 'Food', 0);
  assert.equal(data.tradePrice(system, 'Food'), 335);
  data.setSupply(system, 'Food', 20000);
  assert.equal(data.tradePrice(system, 'Food'), 335 - 84);
  data.setSupply(system, 'Food', -20000);
  assert.equal(data.tradePrice(system, 'Food'), 335 + 84);
  // A supply of 5000: -100 * erf(0.25) = -27.63..., truncated toward zero.
  data.setSupply(system, 'Food', 5000);
  assert.equal(data.tradePrice(system, 'Food'), 335 + Math.trunc(-100 * erf(0.25)));
});

test('the default start is the original scenario', () => {
  const start = data.starts.get('default')!;
  assert.equal(start.displayName, 'Endless Sky');
  assert.deepEqual(start.date, { day: 16, month: 11, year: 3013 });
  assert.equal(start.system, 'Rutilicus');
  assert.equal(start.planet, 'New Boston');
  assert.equal(start.credits, 480000);
  assert.equal(start.mortgage!.principal, 480000);
  assert.equal(start.mortgage!.interest, 0.004);
  assert.equal(start.mortgage!.term, 365);
  assert.equal(start.conditions.get('start: default'), 1);
});
