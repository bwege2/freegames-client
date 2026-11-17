// The 50 levels against the original's level scripts: re/kiki/tools/levels.py ran py/levels/*.py (with
// Python 2 semantics) against a recording mock of the C++ world and wrote every call the scripts make
// while a level is built (test/golden/levels.json). The port's translated scripts, run through the
// port's KikiPyWorld.create against the real engine, must make the same calls in the same order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Headless } from './harness.ts';
import { LEVEL_LIST } from '../src/data/levels.gen.ts';

const golden = JSON.parse(readFileSync(join(import.meta.dirname, 'golden', 'levels.json'), 'utf8')) as Record<string, unknown[][]>;

/** object ids in the order they first appear */
function normalize(ops: unknown[][]): unknown[][] {
  const ids = new Map<unknown, number>();
  const id = (v: unknown): number => {
    if (!ids.has(v)) ids.set(v, ids.size + 1);
    return ids.get(v)!;
  };
  return ops.map((op) => {
    const [kind, ...rest] = op;
    if (['new', 'add', 'name', 'hook', 'remove', 'delete', 'random', 'orientation', 'setActive'].includes(kind as string)) {
      return [kind, id(rest[0]), ...rest.slice(1)];
    }
    return op;
  });
}

test('the level list is the original\'s (py/levels.py)', () => {
  assert.equal(LEVEL_LIST.length, 50);
  assert.deepEqual(Object.keys(golden), LEVEL_LIST);
});

for (const name of LEVEL_LIST) {
  test(`level ${name}: the same world calls as the original's script`, () => {
    const h = new Headless();
    h.game.recording = [];
    h.level(name);
    const got = normalize(JSON.parse(JSON.stringify(h.game.recording)));
    const want = normalize(golden[name]);
    for (let i = 0; i < Math.max(got.length, want.length); i++) {
      assert.deepEqual(got[i], want[i], `${name}: call ${i}`);
    }
  });
}
