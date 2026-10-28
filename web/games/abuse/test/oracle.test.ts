// The port against the original: every session in sessions/ is run by the natively built Abuse 0.8
// (re/abuse/oracle/run.sh, the clock and input of hook.cpp) and by the port under the same rules
// (harness.ts), and the traces must be equal line by line: each frame's pixels and palette (FNV
// hashes), the virtual time in microseconds, the game state (players' position, health, state,
// frame, speed, weapon; a hash over every object), and every sound and music call.
// Needs the oracle: re/abuse/fetch.sh, then re/abuse/oracle/build.sh. Without it the test skips.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { ORACLE_DIR, DATA_DIR } from './harness.ts';

const here = dirname(new URL(import.meta.url).pathname);
const sessions = readdirSync(join(here, 'sessions')).filter((f) => f.endsWith('.txt')).sort();
const oracle = join(ORACLE_DIR, 'abuse-oracle');
const have = existsSync(oracle) && existsSync(DATA_DIR);
const skip = have ? false : 'the oracle is not built (re/abuse/fetch.sh, then re/abuse/oracle/build.sh)';

function runOracle(session: string, out: string, seed: number): string[] {
  execFileSync('bash', [join(ORACLE_DIR, 'run.sh'), session, out, String(seed)], { stdio: 'pipe' });
  return readFileSync(out, 'latin1').trimEnd().split('\n');
}

function runPortProc(session: string, out: string, seed: number, mutate = false): string[] {
  execFileSync(process.execPath, [join(here, 'run-port.ts'), session, out, String(seed)],
    { stdio: 'pipe', env: { ...process.env, TZ: 'UTC', ABUSE_MUTATE: mutate ? '1' : '' }, maxBuffer: 1 << 28 });
  return readFileSync(out, 'latin1').trimEnd().split('\n');
}

function firstDifference(a: string[], b: string[]): string | null {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++)
    if (a[i] !== b[i]) return `line ${i + 1}:\n  original: ${a[i] ?? '(end)'}\n  port:     ${b[i] ?? '(end)'}`;
  return null;
}

const dir = mkdtempSync(join(tmpdir(), 'abuse-test-'));
test.after(() => rmSync(dir, { recursive: true, force: true }));

for (const name of sessions) {
  test(`session ${name}: the port draws, plays and sounds as the original`, { skip, timeout: 600000 }, () => {
    const s = join(here, 'sessions', name);
    const o = runOracle(s, join(dir, `${name}.oracle`), 1);
    const p = runPortProc(s, join(dir, `${name}.port`), 1);
    assert.ok(!o.some((l) => l.startsWith('X ')), 'the oracle ran the session to its end (or quit)');
    assert.equal(firstDifference(o, p), null);
  });
}

test('mutation: a port that differs from the original in one bit of its state fails the comparison', { skip, timeout: 600000 }, () => {
  const s = join(here, 'sessions', 'play.txt');
  const o = runOracle(s, join(dir, 'mut.oracle'), 1);
  const p = runPortProc(s, join(dir, 'mut.port'), 1, true);
  assert.notEqual(firstDifference(o, p), null);
});
