// The whole program against the original: every session of re/moria/oracle/sessions/ that the natively
// built Umoria 5.7.15 ran (re/moria/oracle: the seed fixed with -s, the keys typed one at a time, the
// clock and the login name fixed) is run through the port the same way (harness.ts). Every screen the
// program showed when it read a key must be the original's: the 24 rows, the cursor, the state of the
// random generator and the bells. So must every file the run left (game.sav, scores.dat, character
// records), the standard output and how the run ended.
//
// The goldens are re/moria/oracle/goldens.sh's; the long ones run with MORIA_LONG=1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { base64, expandFrames, firstDifference, loadGolden, runOnce } from './harness.ts';

const dir = join(import.meta.dirname, 'golden');
const LONG = new Set(['long']);
const files = readdirSync(dir).filter((f) => f.endsWith('.json.gz')).sort();

test('the goldens are there', () => {
  for (const name of ['create', 'town', 'save', 'roguelike', 'wizard', 'warrior', 'mage', 'priest', 'args']) {
    assert.ok(files.includes(`${name}.json.gz`), name);
  }
});

for (const f of files) {
  const name = f.replace(/\.json\.gz$/, '');
  const long = LONG.has(name);
  test(`session ${name}`, { skip: long && process.env.MORIA_LONG !== '1' ? 'MORIA_LONG=1 runs it' : false }, async () => {
    const g = loadGolden(join(dir, f));
    let files = new Map<string, Uint8Array>();
    for (let i = 0; i < g.runs.length; i++) {
      const run = g.runs[i];
      // every run starts with the files the run before left, and an empty scores.dat (drive.py)
      const start = new Map(files);
      start.set('scores.dat', files.get('scores.dat') ?? new Uint8Array(0));
      const r = await runOnce(run.args, run.keys, start, g.time, g.login);
      const diff = firstDifference(run, r.screens);
      assert.equal(diff, null, `run ${i} (${run.args.join(' ')}): ${diff}`);
      const want = expandFrames(run.frames);
      const usedUp = want.length > 0 && want[want.length - 1].kind === 'E';
      assert.equal(r.status, usedUp ? 'keys used up' : run.status, `run ${i}: how it ended`);
      assert.equal(r.stdout, run.stdout, `run ${i}: standard output`);
      const got: Record<string, string> = {};
      for (const [n, b] of r.files) got[n] = base64(b);
      assert.deepEqual(got, run.files, `run ${i}: the files after the run`);
      files = r.files;
    }
  });
}
