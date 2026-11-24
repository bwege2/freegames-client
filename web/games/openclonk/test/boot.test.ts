// The page's boot path: the engine starts from the original's *packed* content groups (the files the page
// downloads), not from the planet folder the other tests mount. Needs re/openclonk/tools/pack.sh.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re } from './oracle.ts';
import { boot } from '../src/boot.ts';

const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Objects.ocd', 'Decoration.ocd', 'Missions.ocf'];
const pack = path.join(re, 'work/pack');
const missing = GROUPS.map((g) => path.join(pack, g)).find((p) => !fs.existsSync(p));
const skip = missing ? `packed groups missing (re/openclonk/tools/pack.sh): ${path.basename(missing)}` : false;

function groups() {
  return GROUPS.map((name) => ({ name, data: new Uint8Array(fs.readFileSync(path.join(pack, name))) }));
}

test('the engine boots from the packed content groups and runs a scenario', { skip }, () => {
  const lines: string[] = [];
  const game = boot({ groups: groups(), scenario: 'Missions.ocf/AcidDrilling.ocs', seed: 1793690358, log: (l) => lines.push(l) });
  const $ = game.engine;
  assert.equal($.Definitions.GetDefCount(), 481, 'definitions from the packed groups');
  assert.equal($.ScriptEngine.lineCnt, 93816, 'linked script lines');
  assert.equal($.ScriptEngine.errCnt, 0);
  assert.equal($.Landscape.GetWidth(), 2400, 'landscape size');
  assert.ok($.Objects.ObjectCount() > 0, 'scenario objects');
  // 20 frames of the real game loop, from the walk of the scenario's Initialize
  let frames = 0;
  for (let i = 0; i < 20 && $.Game.IsRunning; i++, frames++) $.Game.Execute();
  assert.equal(frames, 20, 'frames ran');
  assert.ok($.Game.FrameCounter >= 20, 'the frame counter advanced');
});
