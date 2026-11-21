// The animation player against the original frame speeds: loops, one-shot attacks, the
// hit labels (5) and the interpolated joints.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asset, rabbitSkeleton } from './helpers.ts';
import { parseAnimation, type AnimationData } from '../src/data/animation.ts';
import { AnimationPlayer } from '../src/sim/animation-player.ts';

const set = new Map<string, AnimationData>([
  ['idle', parseAnimation(asset('Animations/Idle'))],
  ['upunch', parseAnimation(asset('Animations/Upunch'))],
]);
const get = (id: string): AnimationData => set.get(id)!;

test('Idle loops through its 16 frames and keeps the original frame speed', () => {
  const p = new AnimationPlayer(get, 'idle');
  p.play('idle', { loop: true });
  p.update(0.1);
  // frame += dt * frame.speed * 2; Idle frame 0 speed 3.856961
  assert.ok(Math.abs(p.frame - 0.1 * 3.856961 * 2) < 1e-6, `frame ${p.frame}`);
  for (let i = 0; i < 100; i++) p.update(0.1);
  assert.ok(p.frame >= 0 && p.frame < 15.0001);
  assert.equal(p.done, false);
});

test('Upunch is a one-shot attack that reaches label 5 and then holds its last frame', () => {
  const p = new AnimationPlayer(get, 'idle');
  p.play('upunch', { loop: false, speed: 1 });
  const labels = new Set<number>();
  for (let i = 0; i < 60; i++) {
    labels.add(p.label);
    p.update(0.02);
  }
  assert.ok(labels.has(5), `labels seen: ${[...labels]}`);
  assert.equal(p.done, true);
  assert.equal(p.frame, 6);
  assert.equal(p.label, 0); // the last Upunch frame's label is 0
});

test('joints interpolate between the two surrounding frames', () => {
  const skeleton = rabbitSkeleton();
  const idle = parseAnimation(asset('Animations/Idle'));
  const p = new AnimationPlayer(get, 'idle');
  p.play('idle', { loop: true });
  p.frame = 0.5;
  const joints = p.joints(skeleton);
  assert.equal(joints.length, 20);
  const a = idle.frames[0].joints[0].position;
  const b = idle.frames[1].joints[0].position;
  assert.ok(Math.abs(joints[0].position.x - (a.x + b.x) / 2) < 1e-6);
  assert.ok(Math.abs(joints[0].position.y - (a.y + b.y) / 2) < 1e-6);
});
