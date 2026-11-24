// The random number generator is the foundation of every map and of online
// lockstep. The expected values are the first outputs of the pinned source's
// Randomizer, printed by re/openttd/tools/rng-probe.c.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Randomizer, rotr32, scaleToLimit } from '../src/sim/random.ts';

const fixture = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'rng.json'), 'utf8'));

test('rotr32', () => {
  assert.equal(rotr32(0x12345678, 7) >>> 0, 0xf02468ac);
  assert.equal(rotr32(1, 1) >>> 0, 0x80000000);
  assert.equal(rotr32(0x80000000, 31) >>> 0, 1);
});

test('ScaleToLimit is the 64-bit multiply the original uses', () => {
  assert.equal(scaleToLimit(0xffffffff, 100), 99);
  assert.equal(scaleToLimit(0x80000000, 2), 1);
  assert.equal(scaleToLimit(0, 100), 0);
});

const seeds = fixture.seeds as Record<string, { next: number[]; range100: number[] }>;
for (const [seed, expected] of Object.entries(seeds)) {
  test(`Randomizer seed ${seed}`, () => {
    const r = new Randomizer();
    r.setSeed(Number(seed));
    const next = expected.next.map(() => r.next());
    assert.deepEqual(next, expected.next);
    r.setSeed(Number(seed));
    const range = expected.range100.map(() => r.nextRange(100));
    assert.deepEqual(range, expected.range100);
  });
}
