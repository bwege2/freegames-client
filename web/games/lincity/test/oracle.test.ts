// The port against the original: every session in sessions/ (written by sessions/make.py) is played by
// the port, and every state dump (the window's pixels, the whole map, the globals, the power grids,
// the palette) and every file left in the home directory must be what xlincity 1.13.1 itself produced
// with the same seed, clock and input: sessions/expected.json holds the original's digests (recorded by
// record.ts with the oracle, re/lincity/oracle: the original program on a fake Xlib with a virtual
// clock). The port plays with the original's data files (re/lincity/orig, from re/lincity/fetch.sh) or,
// without them, with the shipped data pack (the same files byte for byte), so these tests run on a clean
// checkout. When the original and the oracle are there (re/lincity/fetch.sh, then
// re/lincity/oracle/build.sh) the oracle plays the sessions too: then its dumps must still match
// expected.json, and a difference of the port is shown in detail (which pixels, map fields or globals);
// without them that part is skipped.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EXPECTED, digest, haveOracle, runOracle, runPort, sessionNames, type Digest } from './sessions.ts';
import { haveOriginal } from './harness.ts';
import { compareDumps } from './compare.ts';

const expected = JSON.parse(readFileSync(EXPECTED, 'utf8')) as Record<string, Digest>;
/** the oracle needs the original's tree and the built oracle */
const withOracle = haveOriginal() && haveOracle();
const noOracle = withOracle ? false : 'the original or the oracle is missing (re/lincity/fetch.sh, then re/lincity/oracle/build.sh)';
const dir = mkdtempSync(join(tmpdir(), 'lincity-test-'));
test.after(() => rmSync(dir, { recursive: true, force: true }));

test('every session has the original\'s digests', () => {
  assert.deepEqual(sessionNames(), Object.keys(expected).sort());
});

for (const name of sessionNames()) {
  test(`session ${name}: the port does what the original did`, () => {
    const out = join(dir, name);
    const port = runPort(name, out);
    const got = digest(port.dumps, port.home);
    const want = expected[name];
    let oracle: { dumps: string; home: string } | null = null;
    if (withOracle) {
      oracle = runOracle(name, out);
      assert.deepEqual(digest(oracle.dumps, oracle.home), want, `${name}: the original no longer gives sessions/expected.json (node games/lincity/test/record.ts)`);
    }
    for (const dump of Object.keys(want.dumps)) {
      if (got.dumps[dump] === want.dumps[dump]) continue;
      let detail = '';
      if (oracle) {
        detail = '\n  ' + compareDumps(readFileSync(join(oracle.dumps, `${dump}.bin`)), readFileSync(join(port.dumps, `${dump}.bin`))).join('\n  ');
      }
      assert.fail(`${name}: dump ${dump} differs from the original's${detail}`);
    }
    assert.deepEqual(got, want);
  });
}

// without the original and the oracle the sessions above compare the port with sessions/expected.json only:
// this shows as a skipped test, so a run says whether the original took part
test('the original (the oracle) played the sessions too', { skip: noOracle }, () => {
  assert.ok(withOracle);
});
