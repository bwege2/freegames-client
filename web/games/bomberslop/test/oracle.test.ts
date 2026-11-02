// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The rules against the original: every scenario of test/scenarios/ played by the port gives, frame by frame, the
// state, the sounds and the rounds that ClanBomber 2.2.0's own code gave for it (test/golden/, written by
// re/bomberslop/oracle/build.sh from the original's GameObject, Bomber, Bomb, Explosion, Extra*, Disease*,
// MapTile*, Map, Bomber_Corpse, Corpse_Part and Observer compiled unchanged, with glibc's rand()).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CRand } from '../src/rand.ts';
import { GAME_DIR, runScenario } from './trace.ts';

const scenarios = readdirSync(join(GAME_DIR, 'test', 'scenarios')).filter((f) => f.endsWith('.txt')).sort();

test('glibc rand(): the first numbers after srand(1) and srand(42)', () => {
  // printf("%d", rand()) after srand(n), glibc 2.x
  const r = new CRand(1);
  assert.deepEqual([r.rand(), r.rand(), r.rand()], [1804289383, 846930886, 1681692777]);
  const s = new CRand(42);
  assert.deepEqual([s.rand(), s.rand(), s.rand()], [71876166, 708592740, 1483128881]);
});

for (const f of scenarios) {
  test(`the original's game, frame by frame: ${f}`, () => {
    const golden = readFileSync(join(GAME_DIR, 'test', 'golden', f), 'utf8').trimEnd().split('\n');
    const ours = runScenario(readFileSync(join(GAME_DIR, 'test', 'scenarios', f), 'utf8'));
    // the first line that differs, with the last full state of the original before it
    for (let i = 0; i < Math.max(golden.length, ours.length); i++) {
      if (golden[i] === ours[i]) continue;
      let lastFull = '';
      for (let j = i; j >= 0; j--) {
        if (golden[j]?.startsWith('F ')) {
          lastFull = `original ${golden[j]}\nport     ${ours[j]}`;
          break;
        }
      }
      assert.fail(`line ${i + 1}: original "${golden[i]?.slice(0, 300)}", port "${ours[i]?.slice(0, 300)}"\n${lastFull.slice(0, 3000)}`);
    }
    assert.ok(golden.length > 100);
  });
}
