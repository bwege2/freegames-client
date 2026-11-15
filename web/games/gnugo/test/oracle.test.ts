// The engine against GNU Go 3.8 built natively (re/gnugo/oracle): the board (strings, liberties in
// the original's order, captures, ko, suicide, superko-free legality, the hash, undo, the move history
// past MAX_MOVE_HISTORY), unconditional life and meaningless moves, and the Monte Carlo search
// uct_genmove (every root move's number of simulations and win rate, the move chosen, and the state of
// the random number generator after it). Goldens: test/golden/*.txt (re/gnugo/oracle/goldens.sh).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { init, run } from './oracle-session.ts';

const golden = join(import.meta.dirname, 'golden');

for (const file of readdirSync(golden).filter((f) => f.endsWith('.txt')).sort()) {
  test(`oracle session ${file}`, () => {
    const want = readFileSync(join(golden, file), 'utf8').trimEnd().split('\n');
    init();
    const got = run(want.join('\n'));
    for (let i = 0; i < want.length; i++) assert.equal(got[i], want[i], `${file} line ${i + 1}`);
    assert.equal(got.length, want.length);
  });
}
