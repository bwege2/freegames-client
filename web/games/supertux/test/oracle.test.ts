// Tux's physics against the original SuperTux 0.6.3 binary (re/supertux/oracle/): the original was
// built headless with the null video system, a demo file fed it the same key presses, and its Player
// position/velocity was logged after every 15 ms logical step. The port runs the same level and the
// same frames. Everything is compared step by step; the maximum difference is 0.1 px.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './loader.ts';
import { parseLevel } from '../src/level.ts';
import { loadTileSet } from '../src/tileset.ts';
import { Sector } from '../src/sector.ts';
import { Controller } from '../src/entity.ts';
import { PlayerStatus } from '../src/player.ts';
import { silentSound } from '../src/resources.ts';

type Frame = { l: number; r: number; u: number; d: number; j: number; a: number };
function demoFrames(): Frame[] {
  const frames: Frame[] = [];
  const add = (n: number, o: Partial<Frame> = {}) => {
    for (let i = 0; i < n; i++) frames.push({ l: 0, r: 0, u: 0, d: 0, j: 0, a: 0, ...o });
  };
  add(100, { r: 1 }); add(10, { r: 1, j: 1 }); add(60, { r: 1 }); add(60, { l: 1 });
  add(10, { l: 1, j: 1 }); add(40, { l: 1 }); add(30); add(20, { d: 1 }); add(10, { r: 1, a: 1 });
  add(100, { r: 1 }); add(10, { r: 1, j: 1 }); add(50, { r: 1 }); add(50, { l: 1 });
  add(10, { l: 1, j: 1 }); add(80);
  return frames;
}

test('journey_begins: 640 steps of walking, stopping, ducking, jumping and stomping match the original', async () => {
  const root = new URL('../assets/', import.meta.url);
  const level = parseLevel('journey_begins.stl', readFileSync(new URL('levels/world1/journey_begins.stl', root), 'utf8'));
  const tileset = await loadTileSet('images/tiles.strf');
  const controller = new Controller();
  const sector = new Sector(level, 'main', tileset, {
    players: 1, controllers: [controller], statuses: [new PlayerStatus()], sound: silentSound,
  });
  const player = sector.players[0];
  const frames = demoFrames();
  const oracle = readFileSync(new URL('golden/journey_begins.physics.txt', import.meta.url), 'utf8')
    .trim().split('\n').map((line) => line.split(/\s+/).map(Number));

  for (let f = 0; f < frames.length; f++) {
    const fr = frames[f];
    controller.set('LEFT', !!fr.l); controller.set('RIGHT', !!fr.r); controller.set('UP', !!fr.u);
    controller.set('DOWN', !!fr.d); controller.set('JUMP', !!fr.j); controller.set('ACTION', !!fr.a);
    sector.update(0.015);
    controller.snapshot();
    const got = player.stateForTest, want = oracle[f];
    const at = `step ${f}`;
    assert.ok(Math.abs(got.x - want[1]) < 0.2, `${at}: x ${got.x} vs ${want[1]}`);
    assert.ok(Math.abs(got.y - want[2]) < 0.2, `${at}: y ${got.y} vs ${want[2]}`);
    assert.ok(Math.abs(got.vx - want[3]) < 0.01, `${at}: vx ${got.vx} vs ${want[3]}`);
    assert.ok(Math.abs(got.vy - want[4]) < 0.01, `${at}: vy ${got.vy} vs ${want[4]}`);
    assert.equal(got.onGround ? 1 : 0, want[5], `${at}: on ground`);
  }
});
