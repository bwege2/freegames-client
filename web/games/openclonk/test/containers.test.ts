// The container runtime (src/rt/std.ts): std::sort against libstdc++'s, run by the oracle (the order of
// equal elements is what differs between sort algorithms), and the ordered map and set.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inputs, oracleMissing, runOracle } from './oracle.ts';
import { StdMap, StdSet, erase, insert, partial_sort, resize, sort, stable_sort } from '../src/rt/std.ts';

const missing = oracleMissing();
const skip = missing ? `the oracle is missing: ${missing}` : false;

test('std::sort leaves equal elements where libstdc++ leaves them', { skip }, () => {
  const g = inputs(777);
  const cases: number[][] = [];
  for (let i = 0; i < 400; i++) {
    const n = g.pick([1, 2, 3, 15, 16, 17, 33, g.int(1, 100), g.int(100, 1000)]);
    const range = g.pick([1, 2, 3, 5, 10, n, 1000000]);
    const shape = g.int(0, 4);
    cases.push(Array.from({ length: n }, (_, k) =>
      shape === 0 ? g.int(0, range) : shape === 1 ? k % (range + 1) : shape === 2 ? n - k : shape === 3 ? Math.min(k, n - k) % (range + 1) : (k * 7919) % (range + 1)));
  }
  const theirs = runOracle(cases.map((c) => `sort\t${c.join(',')}`));
  const bad: string[] = [];
  cases.forEach((keys, i) => {
    const idx = keys.map((_, k) => k);
    sort(idx, (a, b) => keys[a] < keys[b]);
    if (idx.join(',') !== theirs[i]) bad.push(`n=${keys.length} keys ${keys.slice(0, 20).join(',')}...`);
  });
  assert.deepEqual(bad.slice(0, 5), [], `${bad.length} of ${cases.length} sorts differ`);
});

test('partial_sort (the heap sort that sort falls back to) sorts', () => {
  const g = inputs(5);
  for (let n = 0; n < 200; n++) {
    const a = Array.from({ length: n }, () => g.int(0, 50));
    const b = a.slice();
    partial_sort(b, (x, y) => x < y, 0, n, n);
    assert.deepEqual(b, a.slice().sort((x, y) => x - y));
    const c = a.slice();
    const m = g.int(0, n);
    partial_sort(c, (x, y) => x < y, 0, m, n);
    assert.deepEqual(c.slice(0, m), a.slice().sort((x, y) => x - y).slice(0, m));
  }
});

test('stable_sort, vector helpers', () => {
  const a = [3, 1, 2, 1, 3, 0].map((k, i) => ({ k, i }));
  stable_sort(a, (x, y) => x.k < y.k);
  assert.deepEqual(a.map((x) => x.i), [5, 1, 3, 2, 0, 4]);
  const v = [1, 2, 3];
  resize(v, 5, () => 0);
  erase(v, 1);
  insert(v, 0, 9);
  assert.deepEqual(v, [9, 1, 3, 0, 0]);
});

test('std::map and std::set keep the comparator\'s order', () => {
  const m = new StdMap();
  for (const [k, v] of [['b', 2], ['a', 1], ['c', 3], ['a', 9]] as const) m.insert(k, v);
  assert.deepEqual([...m].map((p) => [p.first, p.second]), [['a', 1], ['b', 2], ['c', 3]]);
  m.entry('a', () => 0).second = 7;
  assert.equal(m.at('a'), 7);
  assert.equal(m.entry('d', () => 4).second, 4);
  assert.equal(m.erase('b'), 1);
  assert.deepEqual([...m].map((p) => p.first), ['a', 'c', 'd']);
  assert.equal(m.upper_bound('a').i, 1);
  assert.equal(m.find('x').i, m.size());
  const byLen = new StdSet((x: string, y: string) => x.length < y.length);
  for (const s of ['ccc', 'a', 'bb', 'x']) byLen.insert(s);
  assert.deepEqual([...byLen], ['a', 'bb', 'ccc'], 'x is the same key as a under this comparator');
});
