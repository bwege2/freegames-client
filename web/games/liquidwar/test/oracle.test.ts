// The port against the original. Every session in sessions/ (keys and mouse at given times on the virtual
// clock, the settings file to start with) was run by Liquid War 5.6.6 itself, built from its source with
// Allegro 4.4.3.1 and instrumented (re/liquidwar/oracle/), and its trace and the settings file it left
// are kept next to the session (<name>.trace, <name>.cfg, written by re/liquidwar/oracle/record.sh). The
// port runs the same session headless (harness.ts) and must give the same trace line for line: every
// screen and palette (hashes, sampled every 20 ms), every sound, music and volume call, each battle's
// size, and the full state after every logic round (all fighters, the mesh's gradients and directions for
// every team, the cursors, the number of random numbers drawn), and the same settings file byte for byte.
// When the oracle is built (re/liquidwar/fetch.sh, then re/liquidwar/oracle/build.sh) the kept traces
// are checked against a fresh run of the original too.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const here = dirname(new URL(import.meta.url).pathname);
const sessions = join(here, 'sessions');
const names = readdirSync(sessions).filter((f) => f.endsWith('.txt')).map((f) => f.slice(0, -4)).sort();
const oracleDir = join(here, '../../../../re/liquidwar');
const haveOracle = existsSync(join(oracleDir, 'work/liquidwar-oracle'));
const tmp = mkdtempSync(join(tmpdir(), 'lw-test-'));
test.after(() => rmSync(tmp, { recursive: true, force: true }));

function lines(t: string): string[] {
  return t.replace(/\n$/, '').split('\n');
}

export function firstDifference(a: string[], b: string[]): string | null {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return `line ${i + 1}:\n  original: ${a[i] ?? '(end)'}\n  port:     ${b[i] ?? '(end)'}`;
  }
  return null;
}

function runPort(name: string, extra: string[] = []): { trace: string[]; cfg: string } {
  const cfg = join(tmp, `${name}.port.cfg`);
  const out = execFileSync(process.execPath, [join(here, 'run-port.ts'), join(sessions, `${name}.txt`), cfg, ...extra], {
    maxBuffer: 1 << 28, encoding: 'latin1',
  });
  return { trace: lines(out), cfg: existsSync(cfg) ? readFileSync(cfg, 'latin1') : '' };
}

for (const name of names) {
  test(`session ${name}: the port plays, draws and sounds as Liquid War 5.6.6`, { timeout: 600000 }, () => {
    const expected = lines(readFileSync(join(sessions, `${name}.trace`), 'latin1'));
    const p = runPort(name);
    assert.ok(expected.length > 10, 'the recorded trace is there');
    assert.equal(firstDifference(expected, p.trace), null, 'screens, sounds, rounds');
    assert.equal(p.cfg, readFileSync(join(sessions, `${name}.cfg`), 'latin1'), 'the settings file');
  });
  test(`session ${name}: the recorded trace is what the original gives`, {
    skip: haveOracle ? false : 'the oracle is not built (re/liquidwar/fetch.sh, re/liquidwar/oracle/build.sh)', timeout: 600000,
  }, () => {
    const out = join(tmp, `${name}.oracle`);
    const cfg = join(tmp, `${name}.oracle.cfg`);
    execFileSync('bash', [join(oracleDir, 'oracle/run.sh'), join(sessions, `${name}.txt`), out, cfg]);
    assert.equal(firstDifference(lines(readFileSync(join(sessions, `${name}.trace`), 'latin1')), lines(readFileSync(out, 'latin1'))), null);
    assert.equal(readFileSync(cfg, 'latin1'), readFileSync(join(sessions, `${name}.cfg`), 'latin1'));
  });
}

test('mutation: a port with one rule changed (the side attack as strong as the front attack) fails', { timeout: 600000 }, () => {
  const name = 'battle-to-the-end';
  const expected = lines(readFileSync(join(sessions, `${name}.trace`), 'latin1'));
  const p = runPort(name, ['--mutate=side-attack']);
  assert.notEqual(firstDifference(expected, p.trace), null);
});
