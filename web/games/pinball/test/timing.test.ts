// The port's clock against the original's: the frame scenarios and the construction set's sessions on
// the port, its cycles per frame against the original's (test/golden/timing.txt.gz, recorded by
// gen-cycles.ts on the 6502 code). The port reaches each charge label (src/cycles.ts) exactly as often
// as the original reached it, and its clock stays close to the original's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { io } from '../src/machine.ts';
import { runPort } from './editor.ts';
import { SESSIONS } from './editor-sessions.ts';
import { Port } from './port.ts';
import { runScenario } from './run-scenario.ts';
import { SCENARIOS } from './scenarios.ts';

const golden = new Map<string, { frames: number[]; reached: Record<string, number> }>();
for (const line of gunzipSync(readFileSync(join(import.meta.dirname, 'golden/timing.txt.gz'))).toString('utf8').trimEnd().split('\n')) {
  const [kind, name, ...rest] = line.split(' ');
  const g = golden.get(name) ?? { frames: [], reached: {} };
  if (kind === 'frames') g.frames = rest.map(Number);
  else for (const r of rest) g.reached[r.split('=')[0]] = Number(r.split('=')[1]);
  golden.set(name, g);
}

for (const sc of SCENARIOS) {
  test(`the original's time: ${sc.name}`, () => {
    const want = golden.get(sc.name)!;
    const got: number[] = [];
    let mark = 0;
    io.charges = {};
    // up to the last WAIT (what comes after it, the way out, is not in the recording)
    let reached: Record<string, number> = {};
    try {
      runScenario(new Port(), sc, () => {
        got.push(io.cycles - mark);
        mark = io.cycles;
        reached = { ...io.charges };
      });
      assert.deepEqual(reached, want.reached, 'every charge label reached as often as on the original');
    } finally {
      io.charges = null;
    }
    assert.equal(got.length, want.frames.length);
    // the first frames set the table up (one-off work the charges do not follow closely)
    const from = 2;
    let a = 0;
    let b = 0;
    let off = 0;
    for (let i = from; i < got.length; i++) {
      a += want.frames[i];
      b += got[i];
      off += Math.abs(got[i] - want.frames[i]);
    }
    const ratio = b / a;
    assert.ok(Math.abs(ratio - 1) < 0.03, `the port's time is ${ratio.toFixed(3)} of the original's`);
    assert.ok(off / a < 0.06, `frame by frame the port is off by ${((off / a) * 100).toFixed(1)}%`);
  });
}

// The construction set's sessions (editor-sessions.ts): the same charge labels reached, and the
// time close (its loops that only wait for a button are counted roughly, see README).
for (const s of SESSIONS) {
  test(`the original's time: the construction set, ${s.name}`, () => {
    const want = golden.get(`editor-${s.name}`)!;
    const got: number[] = [];
    let reached: Record<string, number> = {};
    io.charges = {};
    try {
      let mark = 0;
      runPort(s, (robot) => {
        mark = io.cycles;
        const w = robot.wait.bind(robot);
        robot.wait = (n: number) => {
          reached = { ...io.charges };
          got.push(io.cycles - mark);
          mark = io.cycles;
          w(n);
        };
      });
      assert.deepEqual(reached, want.reached, 'every charge label reached as often as on the original');
    } finally {
      io.charges = null;
    }
    assert.equal(got.length, want.frames.length);
    const a = want.frames.reduce((t, v) => t + v, 0);
    const b = got.reduce((t, v) => t + v, 0);
    assert.ok(Math.abs(b / a - 1) < 0.05, `the port's time is ${(b / a).toFixed(3)} of the original's`);
  });
}
