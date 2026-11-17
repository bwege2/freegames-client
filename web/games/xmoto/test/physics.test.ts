// The port's bike, rider, collision system and ODE step against the original's: each golden file of
// test/golden/ is an input script and the trace the original code wrote for it (re/xmoto/oracle: the
// release's BikePlayer.cpp, Bike.cpp, Collision.cpp, VMath.cpp and vendored ODE, built unchanged). The
// port runs the same script on the same level and must produce the same floats, bit for bit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { parseLevel, generateLevel } from '../src/level.ts';
import { CollisionSystem } from '../src/collision.ts';
import { PlayerBiker, PHYS } from '../src/bike.ts';
import { v2 } from '../src/vmath.ts';
import { dRandSetSeed } from '../src/ode.ts';

const levels: Record<string, string> = JSON.parse(gunzipSync(readFileSync(new URL('../assets/levels.json.gz', import.meta.url))).toString('utf8'));

const hex = (x: number): string => {
  const b = new DataView(new ArrayBuffer(4));
  b.setFloat32(0, x);
  return b.getUint32(0).toString(16).padStart(8, '0');
};

function run(script: string): string[] {
  let level = '', steps = 0;
  const inputs = new Map<number, number[]>();
  for (const line of script.split('\n')) {
    const w = line.trim().split(/\s+/);
    if (w[0] === 'level') level = w[1];
    else if (w[0] === 'steps') steps = +w[1];
    else if (w[0] === 'input') inputs.set(+w[1], w.slice(2).map(Number));
  }
  const lvl = parseLevel(levels[level]);
  const col = new CollisionSystem();
  generateLevel(lvl, col, PHYS);
  dRandSetSeed(0); // a fresh process, like the oracle
  const gravity = v2(0, -PHYS.worldGravity);
  const biker = new PlayerBiker(PHYS, lvl.playerStart, 0, gravity);
  let head = false;
  biker.hooks = { onHeadTouches: () => { head = true; }, onWheelTouches: () => {}, onSomersaultDone: () => {} };
  const out: string[] = [];
  let time = 0;
  for (let step = 0; step < steps; step++) {
    const inp = inputs.get(step);
    if (inp && !biker.isDead()) {
      biker.ctrl.setThrottle(inp[0]);
      biker.ctrl.setBreak(inp[1]);
      biker.ctrl.setPull(inp[2]);
      if (inp[3] !== 0) biker.ctrl.setChangeDir(true);
    }
    time += 1;
    head = false;
    biker.updateToTime(time, 1, col, gravity);
    if (head && !biker.isDead()) {
      biker.setDead(true, time);
      biker.setBodyDetach(true);
      biker.ctrl.stopControls();
    }
    const s = biker.state;
    out.push([time, biker.isDead() ? 1 : 0, s.Dir, ...[s.CenterP.x, s.CenterP.y, s.FrontWheelP.x, s.FrontWheelP.y,
      s.RearWheelP.x, s.RearWheelP.y, s.fFrameRot[0], s.fFrameRot[1], s.HeadP.x, s.HeadP.y, s.Head2P.x, s.Head2P.y,
      s.fFrontWheelRot[0], s.fFrontWheelRot[1]].map(hex)].join(' '));
  }
  return out;
}

const dir = new URL('./golden/', import.meta.url);
for (const name of readdirSync(dir).filter((f) => f.endsWith('.txt'))) {
  test(`bike physics: ${name} is the original's trace`, () => {
    const text = readFileSync(new URL(name, dir), 'utf8');
    const [script, trace] = text.split('\ntrace\n');
    const want = trace.trim().split('\n');
    const got = run(script);
    assert.equal(got.length, want.length);
    for (let i = 0; i < want.length; i++) {
      if (got[i] !== want[i]) assert.fail(`${name}: first difference at step ${i + 1}\n  original: ${want[i]}\n  port:     ${got[i]}`);
    }
  });
}
