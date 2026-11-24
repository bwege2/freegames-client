// The synchronized random calls of the original's AcidDrilling run, from its debug record
// (CtrlRec.ocb, RCT_Random chunks). The port matches the first 381 calls; the test guards the
// landscape, definition order and the skeleton animation lengths (the call at Bat.Decay where
// the original creates its mosquitoes still differs, see re/openclonk/NOTES.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initGlobals } from '../src/sim/index.ts';
import { $ } from '../src/rt/registry.ts';
import { S, $cs } from '../src/rt/ptr.ts';
import { resetFs, mountHost } from '../src/rt/fs.ts';
import { prepareHeadless } from '../src/rt/headless.ts';
import { setRandomRecorder } from '../src/rt/random.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const planet = path.resolve(here, '../../../../re/openclonk/orig/openclonk/planet');
const missing = !fs.existsSync(path.join(planet, 'Missions.ocf', 'AcidDrilling.ocs', 'Scenario.txt'));

test('the synchronized random calls match the original debug record', { skip: missing ? 'original planet folder not fetched (re/openclonk/fetch.sh)' : false }, () => {
  initGlobals(true);
  prepareHeadless();
  for (const n of ['Log', 'LogF', 'LogFatal', 'LogSilentF', 'DebugLog', 'DebugLogF']) ($ as any)[n] = () => {};

  resetFs();
  mountHost('/planet', planet, {
    list(p: string) {
      try { return fs.readdirSync(p, { withFileTypes: true }).map((d) => ({ name: d.name, dir: d.isDirectory() })); }
      catch { return null; }
    },
    read(p: string) {
      try { return new Uint8Array(fs.readFileSync(p)); }
      catch { return null; }
    },
  });

  const G = $.Config.General;
  G.ExePath = new $.StdCopyStrBuf().init$pi8$b(S('/'), true);
  G.SystemDataPath = $cs(S('/planet/'), 4096);
  G.ModsDataPath = $cs(S('/planet/mods/'), 4096);
  G.UserDataPath = $cs(S('/planet/user/'), 4096);
  G.LanguageEx = $cs(S('US'), 32);

  $.Reloc.Init();
  $.Application.OpenSystemGroup();
  $.Game.InitPlayerControlSettings();
  $.Game.SetScenarioFilename(S('/planet/Missions.ocf/AcidDrilling.ocs'));
  $.Game.OpenScenario();
  $.Game.InitNetworkHost();
  $.Game.Extra.Init();

  const calls: number[][] = [];
  setRandomRecorder((range, val) => calls.push([$.RandomCount, range >>> 0, val >>> 0]));

  // the original run's Head.RandomSeed (the record's saved Scenario.txt)
  $.Game.RandomSeed = 1793690358;
  const numbers = new $.C4ValueNumbers().init();
  assert.equal($.Game.InitGame($.Game.ScenarioFile, 0, true, numbers), true);
  // the original's C4Game::Init synchronizes a non-network game before the players (and with it restarts the
  // synchronized random generator: C4Game::Synchronize -> FixRandom, the debug record's counts restart at 1)
  $.Game.SyncClearance();
  $.Game.Synchronize(false);
  assert.equal($.Game.InitPlayers(numbers), true);
  assert.equal($.Game.InitGameFinal(0), true);

  const expected: number[][] = JSON.parse(fs.readFileSync(path.join(here, 'data', 'acid-drilling-rand.json'), 'utf8'));
  // the recorded round's first frames continue the stream (the fixture starts with the 565 initialization calls)
  $.Game.IsRunning = true;
  for (let frame = 0; frame < 35 && calls.length < expected.length; frame++) $.Game.Execute();
  assert.ok(calls.length >= expected.length, `only ${calls.length} random calls`);
  for (let i = 0; i < expected.length; i++) assert.deepEqual(calls[i], expected[i], `random call ${i}`);
});
