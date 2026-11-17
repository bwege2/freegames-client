// No Gravity port (GPL-3.0-or-later; LICENSE.md): headless tests of the port against the original.
// With re/nogravity/oracle/nogravity-oracle (built by its build.sh from the original's v3x_3.c and
// sysini.c) the maths, the random numbers and the parser of the mission files are compared with the
// original's code; the rest runs the original's data through the ported game: every scene file, every
// mission of the five episodes and the training, the roster's file format and a recorded demo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import * as m from '../src/v3x/math.ts';
import { parseVmx } from '../src/v3x/vmx.ts';
import { readConfig } from '../src/sys/ini.ts';
import { rand, srand, s as SC } from '../src/sys/sys.ts';
import { packSaves, unpackSaves, SAVE_SIZE } from '../src/game/data.ts';
import { G, g_SGGame, g_SGSettings, newSave, GAMESTATE_PLAY } from '../src/game/state.ts';
import { NG_GameStart, NG_GamePlay, NG_GameStop } from '../src/game/start.ts';
import { boot, run, untilAbort, ASSETS, hold } from './harness.ts';
import { host } from '../src/sys/sys.ts';

const ORACLE = new URL('../../../../re/nogravity/oracle/nogravity-oracle', import.meta.url).pathname;
const hasOracle = existsSync(ORACLE);
const oracle = (...args: string[]): string[] => execFileSync(ORACLE, args, { encoding: 'latin1', maxBuffer: 1 << 26 }).trim().split('\n');
const bits = (f: number): string => { const b = new DataView(new ArrayBuffer(4)); b.setFloat32(0, f); return b.getUint32(0).toString(16).padStart(8, '0'); };

test('the cos table is TRG_Generate\'s', { skip: !hasOracle && 'no oracle' }, () => {
  const o = oracle('trg');
  for (let i = 0; i < 4096; i++) assert.equal(bits(m.TRG[i]), o[i], `TRG[${i}]`);
});

test('rand() is glibc\'s, seed 1', { skip: !hasOracle && 'no oracle' }, () => {
  const o = oracle('rand', '2000');
  srand(1);
  for (let i = 0; i < 2000; i++) assert.equal(String(rand()), o[i]);
  srand(1);
});

test('matrix maths: V3XMatrix_BuildFromVector, BuildFromNVector, the rotations', { skip: !hasOracle && 'no oracle' }, () => {
  let x = 12345;
  const r = (): number => { x = (x * 1103515245 + 12345) & 0x7fffffff; return (x % 20001) / 100 - 100; };
  for (let k = 0; k < 60; k++) {
    const v = m.vec(r(), r(), r()), roll = Math.trunc(r() * 20);
    for (const which of ['bfv', 'bfnv']) {
      const M = m.mtx();
      (which === 'bfv' ? m.buildFromVector : m.buildFromNVector)(M, v, roll);
      const o = oracle(which, String(v[0]), String(v[1]), String(v[2]), String(roll))[0].split(' ');
      // single precision, every operation rounded to a float as the original's code does (SSE)
      for (let i = 0; i < 9; i++) assert.equal(bits(M[i]), o[i], `${which} ${v.join(' ')} ${roll} [${i}]`);
    }
  }
  for (const axis of ['x', 'y', 'z', 'X', 'Y', 'Z']) {
    for (const th of [0, 100, 1024, 2900, -300]) {
      const M = m.mtx();
      for (let i = 0; i < 9; i++) M[i] = Math.fround((i + 1) / 7);
      ({ x: m.rotateXLocal, y: m.rotateYLocal, z: m.rotateZLocal, X: m.rotateX, Y: m.rotateY, Z: m.rotateZ } as Record<string, (t: number, M: Float32Array) => void>)[axis](th, M);
      const o = oracle('rotl', axis, String(th))[0].split(' ');
      for (let i = 0; i < 9; i++) assert.equal(bits(M[i]), o[i], `rot ${axis} ${th} [${i}]`);
    }
  }
});

test('the mission and briefing files parse as ReadConfig parses them', { skip: !hasOracle && 'no oracle' }, () => {
  const dir = `${ASSETS}cmx/`;
  const list = readdirSync(dir).filter((n) => n.endsWith('.cmx'));
  assert.ok(list.length > 100);
  for (const n of list) {
    const c = readConfig(readFileSync(dir + n, 'latin1'));
    const mine: string[] = [];
    for (const k of c.classes) { mine.push(`[${k.name}]`); for (const it of k.items) mine.push(`${it.name}=${it.data}`); }
    const o = oracle('ini', dir + n);
    assert.deepEqual(mine, o.length === 1 && o[0] === '' ? [] : o, n);
  }
});

test('every scene file (.vmx) reads to its end', () => {
  let scenes = 0;
  for (const ep of ['ep_1', 'ep_2', 'ep_3', 'ep_4', 'ep_5']) {
    for (const n of readdirSync(`${ASSETS}${ep}`).filter((f) => f.endsWith('.vmx'))) {
      const sc = parseVmx(readFileSync(`${ASSETS}${ep}/${n}`));
      assert.equal(sc.signature, 'REA');
      const names = sc.ORI.map((o) => o.name.toLowerCase());
      for (const need of ['sky_', 'shield_', 'viper_#', 'raiden_#', 'raptor_#']) assert.ok(names.includes(need), `${ep}/${n} has ${need}`);
      scenes++;
    }
  }
  assert.equal(scenes, 56);
});

test('the pilots\' file keeps the original\'s 72-byte records', () => {
  const list = Array.from({ length: 10 }, newSave);
  list[3] = { ...newSave(), name: 'Ace', level: [3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], episode: 1, score: 123456, life: 0, rank: 5, last_time: 1700000000, active: 1, ship: 2 };
  const b = packSaves(list);
  assert.equal(SAVE_SIZE, 72);
  assert.equal(b.length, 4 + 72 * 10);
  assert.deepEqual(Array.from(b.subarray(0, 4)), [72, 0, 0, 0]);
  assert.equal(String.fromCharCode(...b.subarray(4 + 72 * 3, 4 + 72 * 3 + 3)), 'Ace');
  const back = unpackSaves(b)!;
  assert.deepEqual(back[3], list[3]);
  b[0] = 71;
  assert.equal(unpackSaves(b), null, 'a wrong version is refused (and reset by the game)');
});

test('every mission loads and flies (episodes 1-5 and the training)', async () => {
  await boot();
  let missions = 0;
  for (const ep of [0, 1, 2, 3, 4, 7]) {
    for (let lv = 0; lv < G.g_pGameItem[ep].numLevel; lv++) {
      const cg = G.g_pSaveGames[0];
      cg.active = 1; cg.episode = ep; cg.level[ep] = lv; cg.ship = lv % 3;
      G.g_pCurrentGame = cg;
      g_SGSettings.Ctrl = 1;
      run.maxFrames = 1e9;
      await NG_GameStart();
      assert.ok(G.g_pPlayer.J.OVI, `${ep}/${lv}: the player's ship`);
      assert.equal(G.g_SGObjects.FinCode, GAMESTATE_PLAY);
      const start = Float32Array.from(G.g_pPlayer.Mat.subarray(9, 12));
      run.maxFrames = run.frames + 160;
      run.onFrame = (n) => { if (n % 40 === 1) hold(SC.alt, true); if (n % 40 === 20) hold(SC.alt, false); };
      await untilAbort(NG_GamePlay(async () => {}));
      host.quit = false;
      run.onFrame = () => {};
      const moved = m.distance(start, G.g_pPlayer.Mat.subarray(9, 12));
      assert.ok(moved > 100, `${ep}/${lv}: the ship flies (${moved})`);
      NG_GameStop();
      missions++;
    }
  }
  assert.equal(missions, 55);
});

test('the recorded demo record0.dem plays: the ship follows the recording', async () => {
  await boot();
  G.g_pCurrentGame = G.g_pSaveGames[0];
  g_SGSettings.DemoMode = 2;
  g_SGGame.Demo = 0;
  run.maxFrames = 1e9;
  await NG_GameStart();
  assert.equal(G.rec.version, 3);
  assert.ok(G.rec.maxstep > 100);
  run.maxFrames = run.frames + 200;
  await untilAbort(NG_GamePlay(async () => {}));
  host.quit = false;
  const step = G.rec.step;
  assert.ok(step > 10, `steps played: ${step}`);
  const rec = G.rec.pos[step - 1].Mat;
  for (let i = 0; i < 12; i++) assert.ok(Math.abs(rec[i] - G.g_pPlayer.Mat[i]) < 1e-3 * Math.max(1, Math.abs(rec[i])), `Mat[${i}]`);
  NG_GameStop();
  g_SGSettings.DemoMode = 0;
});
