// The ported program against GNU Go 3.8's ASCII mode (`gnugo --mode ascii`), session by session:
// stdout, stderr, the exit status and the SGF files written must be the original's
// (test/golden/ascii-*.json, written by re/gnugo/oracle/ascii-goldens.mjs). The sessions avoid the
// computer's own moves (two players with `force`); the score the original estimates at the end of a
// game comes from its full engine and is left out (normalize()).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Golden, normalize, runSession } from './ascii-session.ts';

const golden = join(import.meta.dirname, 'golden');

for (const file of readdirSync(golden).filter((f) => f.startsWith('ascii-') && f.endsWith('.json')).sort()) {
  test(`ascii session ${file}`, async () => {
    const g = JSON.parse(readFileSync(join(golden, file), 'utf8')) as Golden;
    const r = await runSession(g.args, g.input, g.files);
    const want = normalize(g.stdout).split('\n');
    const got = normalize(r.stdout).split('\n');
    for (let i = 0; i < Math.max(want.length, got.length); i++) assert.equal(got[i], want[i], `${file} stdout line ${i + 1}`);
    assert.equal(r.stderr, g.stderr, `${file} stderr`);
    assert.equal(r.status, g.status ?? 0, `${file} status`);
    assert.deepEqual(
      Object.fromEntries(Object.entries(r.written).map(([k, v]) => [k, normalize(v)])),
      Object.fromEntries(Object.entries(g.written).map(([k, v]) => [k, normalize(v)])),
      `${file} files`,
    );
  });
}
