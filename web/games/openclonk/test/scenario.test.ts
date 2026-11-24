// A real scenario from the original's planet folder, loaded and ticked headlessly.
// Needs re/openclonk/fetch.sh (like the AUL corpus tests); skipped when the original is not there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initGlobals } from '../src/sim/index.ts';
import { $ } from '../src/rt/registry.ts';
import { S, $cs } from '../src/rt/ptr.ts';
import { resetFs, mountHost } from '../src/rt/fs.ts';
import { prepareHeadless } from '../src/rt/headless.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const planet = path.resolve(here, '../../../../re/openclonk/orig/openclonk/planet');
const missing = !fs.existsSync(path.join(planet, 'Missions.ocf', 'AcidDrilling.ocs', 'Scenario.txt'));

test('a real scenario loads and ticks headlessly', { skip: missing ? 'original planet folder not fetched (re/openclonk/fetch.sh)' : false }, () => {
  initGlobals(true);
  prepareHeadless();
  // the test reports its own result, not the engine's progress lines
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
  assert.equal($.Application.OpenSystemGroup(), true);
  assert.equal($.Game.InitPlayerControlSettings(), true);

  $.Game.SetScenarioFilename(S('/planet/Missions.ocf/AcidDrilling.ocs'));
  assert.equal($.Game.OpenScenario(), true, 'scenario group and C4S');
  assert.equal($.Game.InitNetworkHost(), true, 'local client');
  assert.equal($.Game.Extra.Init(), true);

  // the original run's Head.RandomSeed (from the record's saved Scenario.txt): MapToLandscape sets
  // MapSeed = Random(3133700) and draws the chunk roughness from it
  $.Game.RandomSeed = 1793690358;
  // the record's dumps are taken at the end of C4Landscape::Init (its "|---LANDSCAPE---|" block, progress 80),
  // before the scenario's objects are created and their solid masks touch the landscape
  const bytes = (s: any) => new Uint8Array(s.Bits.a.buffer, s.Bits.a.byteOffset + s.Bits.o, s.Pitch * s.Hgt);
  const sha = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
  const dump: Record<string, string> = {};
  const initLandscape = ($ as any).C4Landscape.prototype.Init;
  ($ as any).C4Landscape.prototype.Init = function (...a: any[]) {
    const r = initLandscape.apply(this, a);
    const p = this.p;
    dump.map = sha(bytes(p.Map));
    dump.landscape = sha(bytes(p.Surface8));
    dump.background = sha(bytes(p.Surface8Bkg));
    return r;
  };
  const numbers = new $.C4ValueNumbers().init();
  assert.equal($.Game.InitGame($.Game.ScenarioFile, 0, true, numbers), true, 'definitions, scripts, landscape');
  assert.equal($.Definitions.GetDefCount(), 481, 'definition list (433 + 46 + 2 like the original)');
  assert.equal($.ScriptEngine.lineCnt, 93816, 'linked script lines');
  assert.equal($.ScriptEngine.warnCnt, 0, 'script warnings');
  assert.equal($.ScriptEngine.errCnt, 0, 'script errors');
  assert.equal($.Landscape.GetWidth(), 300 * $.Game.C4S.Landscape.MapZoom.Evaluate(), 'landscape size');
  assert.equal(($.TextureMap as any).Textures.length, 47, 'textures loaded');
  assert.equal(($.TextureMap as any).Order.length, 35, 'texture map entries in file order');
  assert.equal(($.TextureMap as any).Textures.filter((t: any) => t.GetMaterialShape() != null).length, 9, 'material shapes');
  // the exact pixel dumps from the original's debug record (CtrlRec.ocb: the RCT_Map chunks after
  // |---MAP---|, |---LANDSCAPE---| and |---LANDSCAPE BKG---|, same scenario and RandomSeed)
  assert.equal(dump.map, '54ab61327c29347bae3e606373de07203720991e7dd2696258d2d8ee02f8e096', 'map pixels like the original');
  assert.equal(dump.landscape, '9a40ff944513c176942453c5f3f7c9f006fa9b78b8128367c8dc19264e0a301e', 'landscape pixels like the original');
  assert.equal(dump.background, '9be58dd410717ef25fc00c15adb48eb54a337127761f50d3afc56af34a20c3c5', 'background pixels like the original');
  assert.equal($.Game.InitPlayers(numbers), true, 'local players');
  assert.equal($.Game.InitGameFinal(0), true, 'scenario Initialize');
  assert.ok($.Objects.ObjectCount() > 0, 'scenario objects');

  // 35 real frames: control, objects, effects, PXS, mass movers, weather, landscape, players
  // (the original's debug record has the same 35 frames, then the empty round ends)
  $.Game.IsRunning = true;
  for (let i = 0; i < 35; i++) $.Game.Execute();
  assert.equal($.Game.FrameCounter, 35);
  assert.equal($.Game.GameOver, true, 'no joined players: the round ends at the 35th frame like the original');
});
