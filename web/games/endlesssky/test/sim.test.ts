// Flight, trading, the mortgage and the save file against the original's
// formulas and the reference data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from './load.ts';
import { Ship, noCommands } from '../src/sim/ship.ts';
import { Point } from '../src/sim/math.ts';
import { GameDate } from '../src/sim/date.ts';
import { createPilot, loadPilot, mortgagePayment, savePilot, stepDay } from '../src/sim/pilot.ts';
import { Random } from '../src/sim/rng.ts';

const data = loadData();
const bargeModel = data.ships.get('Star Barge')!;

test('a ship is its hull plus its installed outfits', () => {
  const ship = new Ship(data, bargeModel, bargeModel.defaultOutfits, 'Test', true);
  const expectedMass = bargeModel.base.mass
    + [...bargeModel.defaultOutfits].reduce((sum, [name, count]) => sum + (data.outfits.get(name)!.mass * count), 0);
  assert.equal(ship.stats.mass, expectedMass);
  assert.equal(ship.maxShields(), 600);
  assert.equal(ship.maxHull(), 1000);
  assert.equal(ship.maxEnergy(), 4000); // LP036a Battery Pack
  assert.equal(ship.maxFuel(), 300);
  assert.equal(ship.drag(), 2.2);
  assert.equal(ship.accelerationRate(), 13.545 / expectedMass);
  assert.equal(ship.turnRate(), 288 / expectedMass);
  assert.equal(ship.maxVelocity(), 13.545 / 2.2);
});

test('one frame of thrust moves the ship like Ship::DoMovement', () => {
  const ship = new Ship(data, bargeModel, bargeModel.defaultOutfits, 'Test', true);
  ship.position = new Point(0, 0);
  const command = { ...noCommands(), forward: true };
  ship.commands = command;
  ship.move();
  // No drag on the first frame: velocity is the acceleration, position is velocity.
  assert.ok(Math.abs(ship.velocity.y + ship.accelerationRate()) < 1e-9);
  assert.ok(Math.abs(ship.position.y + ship.accelerationRate()) < 1e-9);
  assert.equal(ship.velocity.x, 0);
  // Thrusting consumes the engine's energy and heat.
  assert.ok(ship.energy < ship.maxEnergy());
  assert.ok(ship.heat > 0);
});

test('turning uses TurnRate and the quantized Angle', () => {
  const ship = new Ship(data, bargeModel, bargeModel.defaultOutfits, 'Test', true);
  ship.commands = { ...noCommands(), turn: 1 };
  const before = ship.angle.steps;
  ship.move();
  const expected = Math.round(ship.turnRate() * (0x10000 / 360)) & 0xffff;
  assert.equal((ship.angle.steps - before + 0x10000) & 0xffff, expected);
  assert.ok(ship.energy < ship.maxEnergy());
});

test('a ship accelerates to thrust / drag, the original terminal velocity', () => {
  const ship = new Ship(data, bargeModel, bargeModel.defaultOutfits, 'Test', true);
  ship.energy = 1e9;
  ship.fuel = 1e9;
  ship.heat = 0;
  for (let i = 0; i < 2000 && ship.velocity.length() < ship.maxVelocity() * 0.999; ++i) {
    ship.energy = 1e9;
    ship.heat = 0;
    ship.commands = { ...noCommands(), forward: true };
    ship.move();
  }
  assert.ok(Math.abs(ship.velocity.length() - ship.maxVelocity()) < 0.01,
    `${ship.velocity.length()} vs ${ship.maxVelocity()}`);
});

test('the date epoch and weekdays are Date.cpp', () => {
  const date = new GameDate(16, 11, 3013);
  assert.equal(date.daysSinceEpoch(), 1100430);
  assert.equal(date.toString(), 'Tue, 16 Nov 3013');
  assert.equal(date.long(), 'the 16th of November');
  date.next();
  assert.equal(date.day, 17);
});

test('the mortgage payment is Mortgage::Payment', () => {
  // 480,000 at 0.4% daily for 365 days.
  const payment = mortgagePayment({ type: 'Mortgage', principal: 480000, interest: 0.004, term: 365 });
  // ln(1.004) * 365 = 1.457; the exact payment from the formula is about 2,542.
  const power = Math.pow(1.004, 365);
  assert.equal(payment, Math.max(1, Math.round(480000 * 0.004 * power / (power - 1))));
  assert.ok(payment > 2500 && payment < 2600, String(payment));
});

test('a pilot save round trip keeps the ship, cargo, conditions and economy', () => {
  const pilot = createPilot(data, 'default', 'Ada', 'Lovelace', 'Star Barge', 'Test Barge');
  pilot.credits = 12345;
  pilot.ship.cargo.set('Food', 7);
  pilot.ship.fuel = 123;
  pilot.ship.shields = 456;
  pilot.ship.hull = 789;
  pilot.conditions.set('test condition', 3);
  pilot.visited.add('Sol');
  pilot.economy.set('Rutilicus', new Map([['Food', 4321]]));
  pilot.mortgage = { type: 'Mortgage', principal: 400000, interest: 0.004, term: 300 };
  const text = savePilot(pilot);
  const loaded = loadPilot(text, data);
  assert.ok(loaded);
  assert.equal(loaded.firstName, 'Ada');
  assert.equal(loaded.lastName, 'Lovelace');
  assert.equal(loaded.credits, 12345);
  assert.equal(loaded.system.name, 'Rutilicus');
  assert.equal(loaded.date.day, 16);
  assert.equal(loaded.ship.model.name, 'Star Barge');
  assert.equal(loaded.ship.cargo.get('Food'), 7);
  assert.equal(loaded.ship.fuel, 123);
  assert.equal(loaded.ship.shields, 456);
  assert.equal(loaded.ship.hull, 789);
  assert.equal(loaded.conditions.get('test condition'), 3);
  assert.equal(loaded.visited.has('Sol'), true);
  assert.equal(loaded.economy.get('Rutilicus')?.get('Food'), 4321);
  assert.equal(loaded.mortgage?.principal, 400000);
});

test('a day pays the mortgage and steps the economy', () => {
  const pilot = createPilot(data, 'default', 'Ada', 'Lovelace', 'Shuttle', 'Test Shuttle');
  pilot.credits = 100000;
  const payment = mortgagePayment(pilot.mortgage!);
  const day = pilot.date.day;
  stepDay(pilot, data, new Random(1), []);
  assert.equal(pilot.date.day, day + 1);
  assert.equal(pilot.credits, 100000 - payment);
  assert.ok(pilot.economy.get('Rutilicus')!.size > 0);
});
