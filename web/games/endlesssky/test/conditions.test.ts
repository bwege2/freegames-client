// Conditions, planet text and the world: the start-specific paragraphs and
// the hyperspace route the map draws.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from './load.ts';
import { createPilot, pilotConditions } from '../src/sim/pilot.ts';
import { paragraphsText } from '../src/data/conditions.ts';
import { World } from '../src/sim/world.ts';
import { Ship } from '../src/sim/ship.ts';
import { Random } from '../src/sim/rng.ts';

const data = loadData();

test('the default start shows the start-specific New Boston text only', () => {
  const pilot = createPilot(data, 'default', 'Ada', 'Lovelace', 'Star Barge', 'Test');
  const conditions = pilotConditions(pilot);
  const planet = data.planets.get('New Boston')!;
  const description = paragraphsText(planet.description, conditions);
  assert.match(description, /except, of course, for the fact that you happen to have been born here/);
  assert.doesNotMatch(description, /Most of its land is wet and marshy, and the coastal regions are prone to flooding\. The planet's economy/);
  const spaceport = paragraphsText(planet.spaceport, conditions);
  assert.match(spaceport, /Someday New Boston may be a prosperous enough planet/);
  assert.doesNotMatch(spaceport, /New Boston's shabby spaceport/);
  assert.doesNotMatch(spaceport, /A smaller tent has been set up/);
});

test('a Star Barge has the data\'s turret hardpoint', () => {
  const model = data.ships.get('Star Barge')!;
  const ship = new Ship(data, model, model.defaultOutfits, 'Test', true);
  assert.equal(ship.hardpoints.length, 1);
  assert.equal(ship.hardpoints[0].turret, true);
  assert.equal(ship.hardpoints[0].outfit, 'Anti-Missile Turret');
});

test('the map can route from Rutilicus to Sol through hyperlinks', () => {
  const pilot = createPilot(data, 'default', 'Ada', 'Lovelace', 'Star Barge', 'Test');
  const world = new World({
    data, player: pilot.ship, system: pilot.system, date: pilot.date, random: new Random(1),
    spriteSize: () => null,
  });
  const route = world.route(pilot.system, data.systems.get('Sol')!);
  assert.ok(route && route.length >= 2);
  assert.equal(route![route!.length - 1].name, 'Sol');
  for (let i = 0; i < route!.length; ++i) {
    const from = i === 0 ? pilot.system : route![i - 1];
    assert.ok(from.links.includes(route![i].name), `${from.name} -> ${route![i].name}`);
  }
});
