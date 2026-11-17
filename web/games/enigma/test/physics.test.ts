// The port against Enigma 1.30 itself: re/enigma/oracle/golden.mjs ran the original (built by
// re/enigma/oracle/build.sh, headless) on levels with a seed and scripted mouse forces and wrote the state
// after every 10 ms pass (test/physics/*.txt): every actor's position and velocity (17 digits) and state, and
// a hash of all floors, items and stones with their states. The port must produce the same lines.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runPort } from './physics.ts';

const dir = join(import.meta.dirname, 'physics');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.txt'))) {
  test(`the original's physics: ${f}`, () => {
    const lines = readFileSync(join(dir, f), 'utf8').trim().split('\n');
    const [, pack, file, , seed] = lines[0].split(' ');
    const forces = lines.filter((l) => l.startsWith('M ')).map((l) => l.split(' ').slice(1).map(Number) as [number, number]);
    const want = lines.slice(1).filter((l) => !l.startsWith('M '));
    const got = runPort(pack, file, Number(seed), forces);
    for (let i = 0; i < want.length; i++) {
      if (got[i] !== want[i]) {
        const tick = want.slice(0, i + 1).reverse().find((l) => l.startsWith('T ')) ?? '';
        assert.fail(`${f}: first difference at line ${i + 1} (${tick}):\n  original: ${want[i]}\n  port:     ${got[i]}`);
      }
    }
    assert.equal(got.length, want.length);
  });
}
