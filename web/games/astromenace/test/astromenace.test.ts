// Headless tests of the AstroMenace port (node --test): the original's RNG, the model files, the profile
// file format, the text table and whole missions run without a renderer (headless.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Minstd0, rng, fRand, fRand0, Vec3, rotatePoint } from '../src/core/math.ts';
import { models } from '../src/object3d/object3d.ts';
import { vw_GetText, vw_GetLanguageListCount } from '../src/engine/core.ts';
import { Config, Cur, GameConfig, LoadXMLConfigFile, PackWithXOR, PilotProfile, SavePilotProfiles, SaveXMLConfigFile, UnpackWithXOR } from '../src/game/config.ts';
import { MissionListInit, MS, cloneProfile } from '../src/menu/menus.ts';
import { InitTopScoresMenu } from '../src/menu/menu.ts';
import { haveAssets, loadAll, runMission } from './headless.ts';

const HEADLESS = join(dirname(fileURLToPath(import.meta.url)), 'headless.ts');

test('minstd_rand0 and generate_canonical<float> as libstdc++', () => {
  const r = new Minstd0(1);
  // std::minstd_rand0 with the default seed 1: 16807, 282475249, 1622650073, 984943658, 1144108930
  assert.deepEqual([r.next(), r.next(), r.next(), r.next(), r.next()], [16807, 282475249, 1622650073, 984943658, 1144108930]);
  // the 10000th value of a default-constructed minstd_rand0 is 1043618065 (C++ standard, [rand.predef])
  const s = new Minstd0();
  let v = 0;
  for (let i = 0; i < 10000; i++) v = s.next();
  assert.equal(v, 1043618065);
  rng.seed(1);
  // (float)(16806) / (float)2147483646 = 16806 / 2^31 in float
  assert.equal(fRand(), Math.fround(16806 / 2147483648));
  rng.seed(1);
  const a = fRand(), b = fRand();
  rng.seed(1);
  assert.equal(fRand0(), a - b);
});

test('rotatePoint turns as the original (degrees, x then y then z)', () => {
  const p = new Vec3(1, 0, 0);
  rotatePoint(p, new Vec3(0, 90, 0));
  assert.ok(Math.abs(p.x) < 1e-6 && Math.abs(p.z + 1) < 1e-6, `${p.x} ${p.z}`);
});

test('all 181 VW3D models load, with bounding boxes around their vertices', { skip: !haveAssets }, () => {
  loadAll();
  assert.equal(models.size, 181);
  for (const [name, m] of models) {
    assert.ok(m.Chunks.length > 0, name);
    assert.equal(m.Chunks[0].VertexStride, 8, name);
    const va = m.GlobalVertexArray;
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < m.GlobalVertexArrayCount; i++) {
      minX = Math.min(minX, va[i * 8]);
      maxX = Math.max(maxX, va[i * 8]);
    }
    for (const ch of m.Chunks) assert.ok(ch.VertexArrayWithSmallTrianglesCount >= ch.VertexQuantity, name);
    assert.ok(Number.isFinite(minX) && maxX >= minX, name);
  }
});

test('the pilot profile file: XOR packing and the 1940-byte records round-trip', () => {
  const data = new Uint8Array(300).map((_, i) => (i * 37) & 255);
  assert.deepEqual(UnpackWithXOR(300, PackWithXOR(data)), data);
  LoadXMLConfigFile(null, null);
  const p = new PilotProfile();
  p.Used = true;
  p.Name = 'Tester';
  p.Money = 12345;
  p.Experience = 678;
  p.Weapon = [1, 2, 3, 0, 0, 4];
  p.ByMissionExperience[3] = 99;
  p.MissionReplayCount[14] = 2;
  Config.Profile[2] = p;
  Config.LastProfile = 2;
  Config.WeaponPanelView = 1;
  const xml = SaveXMLConfigFile();
  const prof = SavePilotProfiles();
  LoadXMLConfigFile(xml, prof);
  const q = GameConfig().Profile[2];
  assert.equal(q.Name, 'Tester');
  assert.equal(q.Money, 12345);
  assert.equal(q.Experience, 678);
  assert.deepEqual(q.Weapon, [1, 2, 3, 0, 0, 4]);
  assert.equal(q.ByMissionExperience[3], 99);
  assert.equal(q.MissionReplayCount[14], 2);
  assert.equal(GameConfig().WeaponPanelView, 1);
  assert.equal(Cur.CurrentProfile, 2);
  assert.deepEqual(cloneProfile(q), q);
});

test('top scores: the defaults and the profiles\' experience, best ten', () => {
  LoadXMLConfigFile(null, null);
  const p = new PilotProfile();
  p.Used = true;
  p.Name = 'Ace';
  p.Experience = 75000;
  Config.Profile[0] = p;
  const t = InitTopScoresMenu();
  assert.equal(t.length, 10);
  assert.equal(t[0], 'Viewizard 100000');
  assert.equal(t[3], 'Ace 75000');
  assert.equal(t[9], 'Kelvin 5000');
});

test('the text table has the original languages and English texts', { skip: !haveAssets }, () => {
  loadAll();
  assert.ok(vw_GetLanguageListCount() >= 4);
  assert.equal(vw_GetText('START GAME'), 'START GAME');
  assert.equal(vw_GetText('lang/en/game/mission.tga'), 'lang/en/game/mission.tga');
  assert.equal(vw_GetText('START GAME', 1), 'SPIEL STARTEN');
});

test('the mission list has the 15 missions of script/list.xml', { skip: !haveAssets }, () => {
  loadAll();
  MissionListInit();
  assert.equal(MS.AllMission, 15);
  assert.equal(MS.MissionList[0].File, 'script/mission1.xml');
});

test('mission 1 runs headless: enemies come, the game time runs at speed 1.5, the same seed gives the same game', { skip: !haveAssets }, () => {
  // two fresh program starts with the same seed and the same clock give the same game
  const run = (): string => execFileSync(process.execPath, [HEADLESS, '12345', '0', '40'], { encoding: 'utf8' }).trim();
  const a = run();
  const b = run();
  assert.equal(a, b);
  const r = JSON.parse(a);
  // game time = elapsed ticks since the start (vw_InitTimeThread keeps DiffGetTicks 0, as the original) at speed 1.5
  assert.ok(Math.abs(Number(r.time) - (61 * 0.016 + 40 * 60 * 0.016 * 1.5)) < 0.05, r.time);
  assert.ok(r.maxShips > 1, a);
});

test('every mission script runs 20 seconds without errors', { skip: !haveAssets }, () => {
  for (let m = 0; m < 15; m++) {
    const r = JSON.parse(runMission(7 + m, m, 20));
    assert.ok(Number(r.time) > 20, `mission ${m + 1}`);
  }
});
