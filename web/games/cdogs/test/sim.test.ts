// The simulation against the original: re/cdogs/oracle (oracle.c, linked with the original's own objects) loads
// the data, a campaign and players and runs C-Dogs SDL 2.5.0's game loop with scripted commands; this test does
// the same with the port. Every 10 frames the state must be the original's: the number of rand() calls since the
// start (data loading included), the mission, and every actor (position and velocity as floats, health, state
// flags, gun, command), object, bullet, pickup and the number of particles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { nodeFS } from './nodefs.ts';
import { runScenario, type Scenario } from './scenario.ts';

const golden = fileURLToPath(new URL('../../../../re/cdogs/oracle/golden/', import.meta.url));
const scenarios = readFileSync(fileURLToPath(new URL('../../../../re/cdogs/oracle/scenarios.txt', import.meta.url)), 'utf8')
  .split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/));

const fs = nodeFS(fileURLToPath(new URL('../assets/', import.meta.url)));

for (const [name, campaign, mode, mission, players, ai, frames, every, seed, scriptSeed, ...config] of scenarios) {
  test(`simulation: ${name} (${campaign} mission ${mission})`, async () => {
    const want = readFileSync(`${golden}${name}.jsonl`, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const music = want.shift().music;
    const sc: Scenario = {
      campaign, mode: +mode, mission: +mission, players: +players, ai: +ai, frames: +frames, every: +every, seed: +seed,
      scriptSeed: +scriptSeed, config: config.map((c) => c.split('=') as [string, string]), music,
    };
    const got = await runScenario(fs, sc);
    assert.equal(got.length, want.length, 'number of dumps');
    for (let i = 0; i < want.length; i++) {
      const w = want[i];
      const g = got[i];
      const where = `${name} frame ${w.frame}`;
      assert.equal(g.rand, w.rand, `${where}: rand() calls`);
      assert.deepEqual(g.mission, w.mission, `${where}: mission`);
      assert.deepEqual(g.players, w.players, `${where}: players`);
      assert.equal(g.actors.length, w.actors.length, `${where}: number of actors`);
      for (let j = 0; j < w.actors.length; j++) {
        const wa = w.actors[j];
        const ga = g.actors[j];
        for (const k of Object.keys(wa)) {
          const wv = typeof wa[k] === 'number' && !Number.isInteger(wa[k]) ? Math.fround(wa[k]) : wa[k];
          assert.equal(ga[k], wv, `${where}: actor ${wa.uid} ${k}`);
        }
      }
      assert.deepEqual(g.objs, w.objs, `${where}: objects`);
      assert.equal(g.bullets.length, w.bullets.length, `${where}: number of bullets`);
      for (let j = 0; j < w.bullets.length; j++) {
        for (const k of Object.keys(w.bullets[j])) {
          const wv = w.bullets[j][k];
          assert.equal(g.bullets[j][k], Number.isInteger(wv) ? wv : Math.fround(wv), `${where}: bullet ${w.bullets[j].uid} ${k}`);
        }
      }
      assert.deepEqual(g.pickups, w.pickups, `${where}: pickups`);
      assert.equal(g.particles, w.particles, `${where}: particles`);
    }
  });
}
