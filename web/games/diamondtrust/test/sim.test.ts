// Diamond Trust rules: the source's start values, movement costs, loyalty,
// bid resolution and the eight-month end.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWANCE, DiamondGame, MARKET_POOL, START_DIAMONDS, START_MONEY, START_MONTHS,
  emptyChoices, moveCost,
} from '../src/sim.ts';

test('the source start values and map layout', () => {
  const g = new DiamondGame(123);
  assert.equal(g.money[0], START_MONEY);
  assert.equal(g.money[1], START_MONEY);
  assert.equal(g.diamonds[0], START_DIAMONDS);
  assert.equal(g.diamonds[1], START_DIAMONDS);
  assert.equal(g.monthsLeft, START_MONTHS);
  assert.ok(g.inspector >= 2 && g.inspector <= 7);
  assert.equal(g.units.length, 6);
  assert.equal(g.unit(0, 0).region, 0);
  assert.equal(g.unit(1, 0).region, 1);
});

test('movement costs follow getMoveCost', () => {
  assert.equal(moveCost(2, 2), 0);
  assert.equal(moveCost(2, 3), 1);
  assert.equal(moveCost(2, 0), 2);
  assert.equal(moveCost(1, 4), 2);
  assert.equal(moveCost(7, 6), 1);
});

test('salary and bribe limits follow the source', () => {
  const g = new DiamondGame(1);
  assert.equal(g.canSalary(0, 0), true);
  assert.equal(g.canBribe(0, 0), false);
  const home = g.unit(0, 0), away = g.unit(1, 0);
  home.region = 2; away.region = 2;
  assert.equal(g.canSalary(0, 0), false);
  assert.equal(g.canBribe(0, 0), true);
  home.salary = 5; home.bribe = 5;
  assert.equal(g.isBribed(home), false);
  home.bribe = 6;
  assert.equal(g.isBribed(home), true);
});

test('a bribe goes to the chosen opponent agent in the same region', () => {
  const g = new DiamondGame(1);
  g.unit(0, 0).region = 2;
  g.unit(1, 0).region = 2;
  g.unit(1, 1).region = 2;
  const c = emptyChoices(0);
  c.bribe[0] = 3; c.bribeTarget[0] = 1;
  g.setChoices(0, c);
  assert.equal(g.submitSalary(0), true);
  g.setChoices(1, emptyChoices(1));
  assert.equal(g.submitSalary(1), true);
  assert.equal(g.unit(1, 0).bribe, 0);
  assert.equal(g.unit(1, 1).bribe, 3);
  assert.equal(g.unit(1, 1).bribedBy, 0);
});

test('the highest unique bid gets the region and ties leave the diamonds', () => {
  const g = new DiamondGame(1);
  g.regions[2] = 5;
  g.unit(0, 0).region = 2; g.unit(1, 0).region = 2;
  g.pending[0].moves[0] = { dest: 2, bid: 4, bribe: 0 };
  g.pending[1].moves[0] = { dest: 2, bid: 2, bribe: 0 };
  g.sellDiamonds();
  assert.equal(g.unit(0, 0).carrying, 5);
  assert.equal(g.regions[2], 0);
  // a tie leaves the diamonds
  g.regions[3] = 3;
  g.unit(0, 1).region = 3; g.unit(1, 1).region = 3;
  g.pending[0].moves[1] = { dest: 3, bid: 2, bribe: 0 };
  g.pending[1].moves[1] = { dest: 3, bid: 2, bribe: 0 };
  g.sellDiamonds();
  assert.equal(g.regions[3], 3);
});

test('the inspector blocks sales in its region', () => {
  const g = new DiamondGame(1);
  g.inspector = 2;
  g.regions[2] = 5;
  g.unit(0, 0).region = 2;
  g.pending[0].moves[0] = { dest: 2, bid: 4, bribe: 0 };
  g.sellDiamonds();
  assert.equal(g.regions[2], 5);
  assert.equal(g.unit(0, 0).carrying, 0);
});

test('the market splits 24 by sale quantity and pays 18 for no sale', () => {
  const g = new DiamondGame(1);
  g.phase = 'market';
  g.diamonds[0] = 1; g.diamonds[1] = 2;
  g.pending[0].sale = 1; g.pending[1].sale = 2;
  const m0 = g.money[0], m1 = g.money[1];
  g.applyMarket();
  assert.equal(g.money[0], m0 + Math.floor(MARKET_POOL / 3));
  assert.equal(g.money[1], m1 + Math.floor((MARKET_POOL * 2) / 3));
  assert.equal(g.diamonds[0], 0); assert.equal(g.diamonds[1], 0);
  const h = new DiamondGame(1);
  h.phase = 'market'; h.pending[0].sale = 0; h.pending[1].sale = 0;
  const n0 = h.money[0];
  h.applyMarket();
  assert.equal(h.money[0], n0 + ALLOWANCE);
});

test('a snapshot round-trips through the online state format', () => {
  const g = new DiamondGame(42);
  g.money[0] = 99; g.regions[3] = 7;
  const copy = DiamondGame.fromSnapshot(JSON.stringify(g));
  assert.equal(copy.money[0], 99);
  assert.equal(copy.regions[3], 7);
  assert.equal(copy.phase, g.phase);
  assert.equal(copy.unit(0, 0).region, 0);
});

test('the empty choices are valid and cost nothing', () => {
  const g = new DiamondGame(1);
  const c = emptyChoices(0);
  assert.equal(g.cost(0, c), 0);
  assert.equal(g.affordable(0, c), true);
});
