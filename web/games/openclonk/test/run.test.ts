// A longer real run: Acid Drilling's first 400 frames without an exception. The material reactions of the lava
// particles take their position and material by reference (the particle system passes values), which used to throw
// at frame 339 and abort the rest of that frame; this keeps the simulation running.
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

test('400 frames of Acid Drilling run without an exception', { skip }, () => {
  const $ = boot({
    groups: GROUPS.map((name) => ({ name, data: new Uint8Array(fs.readFileSync(path.join(pack, name))) })),
    scenario: 'Missions.ocf/AcidDrilling.ocs',
    seed: 1793690358,
    playerName: 'Clonk',
  }).engine;
  $.Game.IsRunning = true;
  for (let i = 0; i < 400; i++) {
    try {
      $.Game.Execute();
    } catch (e) {
      assert.fail(`frame ${i}: ${(e as Error).message}\n${(e as Error).stack}`);
    }
  }
  assert.ok($.Game.FrameCounter >= 400, 'the frame counter advanced');
  assert.ok($.Objects.ObjectCount() > 100, 'the scenario still has its objects');
});
