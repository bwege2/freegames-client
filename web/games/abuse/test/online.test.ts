// Online play in lockstep: two (or three) clients of the port play one round, each with its own input,
// through a relay that does what the room does (every tick message to everyone, in one order). Their
// games must stay equal: at every game tick both have the same players (position, health, state,
// frame, speed, weapon), the same random position and the same objects. The pictures differ (each
// shows its own player's view).
import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { DATA_DIR } from './harness.ts';

const here = dirname(new URL(import.meta.url).pathname);
const skip = existsSync(DATA_DIR) ? false : 'no data (re/abuse/fetch.sh, then re/abuse/oracle/build.sh)';
const dir = mkdtempSync(join(tmpdir(), 'abuse-online-'));
test.after(() => rmSync(dir, { recursive: true, force: true }));

/** runs the clients; returns each one's trace lines */
async function round(sessions: string[], names: string[], seed: number): Promise<string[][]> {
  const kids = sessions.map((s, seat) => fork(join(here, 'run-online.ts'),
    [join(here, 'sessions', 'online', s), join(dir, `seat${seat}.txt`), String(seat), names.join(','), String(seed)],
    { stdio: ['ignore', 'ignore', 'inherit', 'ipc'], env: { ...process.env, TZ: 'UTC' } }));
  const done = kids.map((k) => new Promise<void>((r) => k.on('exit', () => r())));
  kids.forEach((k, seat) => k.on('message', (m: { to: string; data: number[] }) => {
    if (m.to !== 'all') return;
    for (const other of kids) if (other.connected) other.send({ t: 'msg', from: seat, data: m.data });
  }));
  // a client that ends stops the others' lockstep: they get a little time to write their traces
  await Promise.race(done);
  await new Promise((r) => setTimeout(r, 1500));
  for (const k of kids) if (k.exitCode === null) k.kill();
  await Promise.all(done);
  return sessions.map((_, seat) => existsSync(join(dir, `seat${seat}.txt`)) ? readFileSync(join(dir, `seat${seat}.txt`), 'latin1').split('\n') : []);
}

/** game tick -> the game state of that frame (players, random position, objects) */
function states(lines: string[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const l of lines) {
    const t = / tick=(\d+) (rand=\d+.*objs=\S+)/.exec(l);
    if (t) m.set(t[1], t[2]);
  }
  return m;
}

test('two players: both games stay equal, tick by tick', { skip, timeout: 600000 }, async () => {
  const [a, b] = await round(['seat0.txt', 'seat1.txt'], ['anna', 'bert'], 4711);
  const sa = states(a), sb = states(b);
  let compared = 0;
  for (const [tick, s] of sa) {
    if (!sb.has(tick)) continue;
    assert.equal(sb.get(tick), s, `tick ${tick}`);
    compared++;
  }
  assert.ok(compared > 150, `compared ${compared} ticks`);
  const last = [...sa.values()].pop()!;
  assert.match(last, / p0=.* p1=/, 'both players are in the game');
});
