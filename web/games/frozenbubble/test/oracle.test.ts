// The port against the original: every session in sessions/ is run by Frozen Bubble 2.2.0 itself
// (re/frozenbubble/oracle/run.sh: SDL 1.2.15, SDL_perl 2.1.2, a virtual clock and the session's keys
// and mouse) and by the port under the same rules (harness.ts), and both traces must be equal line by
// line: every screen update's pixels (FNV hash), every sound and music call, every text drawn (its
// string, place and size), the window calls; and after every game frame the game's state (each
// player's bubbles, launcher angle, launched, next and coming bubbles, malus, falling and exploding
// bubbles, score, penguin, and how many random numbers were drawn), every srand and every print_.
// The files the game writes (~/.frozen-bubble: rc, highscores, levels, ...) must be equal too.
// Needs the oracle: re/frozenbubble/fetch.sh, then re/frozenbubble/oracle/build.sh. Without it the
// test skips.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { haveOracle, ORACLE_DIR, runPort } from './harness.ts';

const here = dirname(new URL(import.meta.url).pathname);
const sessions = readdirSync(join(here, 'sessions')).filter((f) => f.endsWith('.txt')).sort();
const skip = haveOracle() ? false : 'the oracle is not built (re/frozenbubble/fetch.sh, then re/frozenbubble/oracle/build.sh)';
const dir = mkdtempSync(join(tmpdir(), 'fb-test-'));
test.after(() => rmSync(dir, { recursive: true, force: true }));

function lines(path: string): string[] {
  if (!existsSync(path)) return [];
  const t = readFileSync(path, 'latin1');
  return t === '' ? [] : t.replace(/\n$/, '').split('\n');
}

export function runOracle(session: string, name: string): { trace: string[]; state: string[]; home: Map<string, string> } {
  const out = join(dir, `${name}.oracle`);
  const home = join(dir, `${name}.home`);
  try {
    execFileSync('bash', [join(ORACLE_DIR, 'run.sh'), session, out, home], {
      stdio: 'pipe', env: { ...process.env, ORACLE_PERL_MODULE: 'FBOracle' },
    });
  } catch {
    // the exit status is in the trace (X ... exit)
  }
  const files = new Map<string, string>();
  const walk = (d: string, prefix: string): void => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d, { withFileTypes: true })) {
      if (f.isDirectory()) walk(join(d, f.name), `${prefix}${f.name}/`);
      else files.set(`${prefix}${f.name}`, readFileSync(join(d, f.name), 'latin1'));
    }
  };
  walk(home, '');
  return { trace: lines(out), state: lines(`${out}.state`), home: files };
}

export function firstDifference(a: string[], b: string[]): string | null {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return `line ${i + 1}:\n  original: ${(a[i] ?? '(end)').slice(0, 300)}\n  port:     ${(b[i] ?? '(end)').slice(0, 300)}`;
  }
  return null;
}

for (const name of sessions) {
  test(`session ${name}: the port draws, plays, sounds and saves as the original`, { skip, timeout: 900000 }, async () => {
    const s = join(here, 'sessions', name);
    const o = runOracle(s, name);
    const p = await runPort(s);
    assert.ok(o.trace.length > 10, 'the oracle ran');
    assert.ok(!o.trace.some((l) => / stall$/.test(l)), 'the oracle did not stall');
    assert.equal(firstDifference(o.trace, p.trace), null, 'frames, sounds, texts');
    assert.equal(firstDifference(o.state, p.state), null, 'game state');
    const ph = new Map([...p.home.files].map(([k, v]) => [k, Buffer.from(v, 'utf8').toString('latin1')]));
    assert.deepEqual([...ph.keys()].sort(), [...o.home.keys()].sort(), 'the files in ~/.frozen-bubble');
    for (const [k, v] of o.home) assert.equal(ph.get(k), v, `~/.frozen-bubble/${k}`);
  });
}

test('mutation: a port that differs from the original in one rule fails the comparison', { skip, timeout: 900000 }, async () => {
  // the malus rule: one bubble more for every group that falls (stick_bubble's @will_destroy + @falling - 2)
  const s = join(here, 'sessions', '2p.txt');
  const o = runOracle(s, 'mutation');
  const p = await runPort(s, { mutate: (g) => { g.mutation = 'malus'; } });
  assert.notEqual(firstDifference(o.state, p.state), null);
});
