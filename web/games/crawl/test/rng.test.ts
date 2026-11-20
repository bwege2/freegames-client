// The random numbers against the original: PCG32 and random.cc's helpers, checked with a C++ program
// built from pcg.cc (the first values are the original's for seed 7, stream GAMEPLAY).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng, Pcg } from '../src/game/rng.ts';

test('random2(100) for seed 7 is the original PCG output', () => {
  const r = new Rng(7n);
  const got = Array.from({ length: 20 }, () => r.int(100));
  assert.deepEqual(got, [38, 21, 97, 11, 40, 43, 57, 6, 97, 46, 97, 30, 10, 64, 67, 42, 75, 95, 18, 13]);
});

test('the helpers are random.cc', () => {
  const r = new Rng(7n);
  assert.equal(r.range(5, 9) >= 5 && r.range(5, 9) <= 9, true);
  assert.equal(r.dice(3, 4) >= 3 && r.dice(3, 4) <= 12, true);
  assert.equal(r.divRandRound(10, 3) >= 3 && r.divRandRound(10, 3) <= 4, true);
  assert.equal(r.xChanceInY(0, 10), false);
  assert.equal(r.xChanceInY(10, 10), true);
});

test('save and load keep the streams', () => {
  const r = new Rng(123n);
  for (let i = 0; i < 13; i++) r.int(20);
  const s = r.save();
  const next = [r.int(20), r.int(20), r.int(20)];
  const r2 = Rng.load(s);
  assert.deepEqual([r2.int(20), r2.int(20), r2.int(20)], next);
});

test('the PCG constructor and seeding are exact', () => {
  const p = new Pcg(7n, 2305843009213693951n);
  assert.equal(p.next32() >>> 0, 3953725276);
});
