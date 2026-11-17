// Every level of X-Moto 0.6.3's package loads in the port: the XML, the blocks, the collision grid, the
// level script (OnLoad, Tick, timers, moving blocks), and a few seconds of riding with the throttle open.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { parseLevel } from '../src/level.ts';
import { Scene } from '../src/scene.ts';

const files: Record<string, string> = JSON.parse(gunzipSync(readFileSync(new URL('../assets/levels.json.gz', import.meta.url))).toString('utf8'));
const lvls = Object.keys(files).filter((n) => n.endsWith('.lvl'));
const scripts: Record<string, string> = {};
for (const n of Object.keys(files)) if (n.endsWith('.lvs')) scripts[n] = files[n];

test('the package has the 307 levels and 3 scripts of X-Moto 0.6.3', () => {
  assert.equal(lvls.length, 307);
  assert.equal(Object.keys(scripts).length, 3);
});

test('the first level is the original "Over or under" with its strawberries and flower', () => {
  const l = parseLevel(files['i00.lvl']);
  assert.equal(l.name, 'Over or under');
  assert.equal(l.pack, 'Classical');
  assert.ok(l.entities.some((e) => e.typeId === 'EndOfLevel'));
  assert.ok(l.entities.filter((e) => e.typeId === 'Strawberry').length > 0);
  assert.equal(l.blocks.filter((b) => b.id.startsWith('LEVEL_')).length, 4);
});

test('every level loads, runs its script and can be ridden for 3 seconds', () => {
  const failures: string[] = [];
  for (const name of lvls) {
    try {
      const scene = new Scene(parseLevel(files[name]), {}, scripts);
      scene.addPlayer();
      scene.playInitLevel();
      scene.player.ctrl.setThrottle(1);
      for (let i = 0; i < 300; i++) scene.updateLevel(1);
      assert.ok(Number.isFinite(scene.state.CenterP.x) && Number.isFinite(scene.state.CenterP.y));
    } catch (e) {
      failures.push(`${name}: ${(e as Error).message}`);
    }
  }
  assert.deepEqual(failures, []);
});
