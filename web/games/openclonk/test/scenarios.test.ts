// More than one scenario: the engine's setup and first frames must work for the whole mission set, not just the one
// every other test uses. Each scenario is booted from the packed groups and ticked for 60 frames.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re } from './oracle.ts';
import { boot } from '../src/boot.ts';

const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Objects.ocd', 'Decoration.ocd', 'Missions.ocf'];
const SCENARIOS = ['Missions.ocf/TreasureHunt.ocs', 'Missions.ocf/MineRescue.ocs', 'Missions.ocf/FrostySummit.ocs', 'Missions.ocf/Skylands.ocs'];
const pack = path.join(re, 'work/pack');
const missing = GROUPS.map((g) => path.join(pack, g)).find((p) => !fs.existsSync(p));
const skip = missing ? `packed groups missing (re/openclonk/tools/pack.sh): ${path.basename(missing)}` : false;

for (const scenario of SCENARIOS) {
  test(`${scenario} boots and runs 60 frames`, { skip }, () => {
    const groups = GROUPS.map((name) => ({ name, data: new Uint8Array(fs.readFileSync(path.join(pack, name))) }));
    const $ = boot({ groups, scenario, seed: 12345, playerName: 'Clonk' }).engine;
    $.Game.IsRunning = true;
    for (let i = 0; i < 60; i++) {
      try {
        $.Game.Execute();
      } catch (e) {
        assert.fail(`frame ${i}: ${(e as Error).message}\n${(e as Error).stack}`);
      }
    }
    assert.ok($.Game.FrameCounter >= 60, 'the frame counter advanced');
    assert.ok($.Objects.ObjectCount() > 0, 'the scenario has objects');
    assert.ok($.Landscape.GetWidth() > 0 && $.Landscape.GetHeight() > 0, 'the landscape exists');
  });
}
