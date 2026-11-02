// The Tux Racer port's data and rules: the course loader (the original's elevation/terrain/trees
// decoding, object placement and mirroring), the save file's 512-byte records, and a deterministic
// physics run. The physics is a direct translation of src/phys_sim.c and src/nmrcl.c (re/tuxracer/
// NOTES.md explains the oracle situation); this test pins its data and a straight run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Course, decodeImage } from '../src/course.ts';
import type { CourseConfig } from '../src/course.ts';
import { Physics } from '../src/physics.ts';
import { SaveGame } from '../src/save.ts';
import { formatTime } from '../src/race.ts';

const assets = join(import.meta.dirname, '..', 'assets');
const courses = JSON.parse(readFileSync(join(assets, 'courses.json'), 'utf8')) as Record<string, CourseConfig>;

function image(file: string) {
  const b = readFileSync(file);
  return decodeImage(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
}

function bunnyHill(mirror = false): Course {
  const dir = join(assets, 'courses', 'bunny_hill');
  return new Course(courses.bunny_hill,
    image(join(dir, 'elev.bin')), image(join(dir, 'terrain.bin')), image(join(dir, 'trees.bin')),
    () => 0.5, { mirror });
}

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('Bunny Hill: the original bitmaps decode into the course the game plays', () => {
  const c = bunnyHill();
  assert.equal(c.nx, 90);
  assert.equal(c.ny, 240);
  assert.equal(c.cfg.width, 90);
  assert.equal(c.cfg.length, 480);
  assert.equal(c.cfg.angle, 25);
  assert.ok(Math.abs(c.findY(45, -3.5) - -1.22723726784146) < 1e-9, 'the start height');
  const w = c.surfaceWeights(45, -3.5);
  assert.ok(w[2] > 0.99, `the start is snow (${w})`);
  const n = c.findNormal(45, -10);
  assert.ok(n.y > 0.8 && Math.abs(n.x) < 0.1, `the normal points up (${JSON.stringify(n)})`);
  assert.equal(c.trees.length, 731, 'the trees of trees.rgb');
  const start = c.items.find((i) => i.type === 3);
  const finish = c.items.find((i) => i.type === 2);
  assert.ok(start && finish, 'start and finish markers');
  assert.ok(start.z > -20 && start.z < 0, `the start banner is at the top (${start.z})`);
  assert.ok(finish.z < -400, `the finish banner is at the end (${finish.z})`);
  assert.ok(c.items.some((i) => i.type === 0), 'herring');
  assert.ok(c.items.filter((i) => i.type === 0).every((i) => i.collectable), 'herring are collectable');
});

test('mirroring flips the course and its objects, as the original mirror_course does', () => {
  const c = bunnyHill();
  const m = bunnyHill(true);
  assert.equal(m.startX, c.cfg.width - c.startX);
  for (const [x, y] of [[0, 0], [45, 100], [89, 239], [20, 7]] as const) {
    assert.equal(m.elevationAt(x, y), c.elevationAt(c.nx - 1 - x, y), `elevation ${x},${y}`);
    assert.equal(m.terrain[x + c.nx * y], c.terrain[(c.nx - 1 - x) + c.nx * y], `terrain ${x},${y}`);
  }
  assert.ok(Math.abs(m.normals[10].x + c.normals[c.nx - 1 - 10].x) < 1e-12, 'normals x flips');
  assert.ok(Math.abs(m.normals[10].y - c.normals[c.nx - 1 - 10].y) < 1e-12, 'normal y unchanged');
  const tree = c.trees[0];
  const mirroredTree = m.trees[0];
  assert.ok(Math.abs(mirroredTree.x - (c.cfg.width - tree.x)) < 1e-9);
  const start = c.items.find((i) => i.type === 3)!;
  const mStart = m.items.find((i) => i.type === 3)!;
  assert.ok(Math.abs(mStart.x - (c.cfg.width - start.x)) < 1e-9);
});

test('a straight run moves downhill, stays on the course and is deterministic', () => {
  const run = (): { z: number; speed: number; y: number; plane: number } => {
    const c = bunnyHill();
    const p = new Physics(c, seeded(1));
    p.init();
    for (let i = 0; i < 180; i++) {
      p.time += 1 / 60;
      p.update(1 / 60);
    }
    const v = p.player.vel;
    return {
      z: p.player.pos.z, speed: Math.hypot(v.x, v.y, v.z), y: p.player.pos.y,
      plane: p.course.findY(p.player.pos.x, p.player.pos.z),
    };
  };
  const a = run();
  const b = run();
  assert.deepEqual(a, b, 'same inputs, same state');
  assert.ok(Number.isFinite(a.z) && Number.isFinite(a.speed) && Number.isFinite(a.y), 'finite state');
  assert.ok(a.z < -8, `moved downhill (${a.z})`);
  assert.ok(a.speed > 5, `gained speed (${a.speed})`);
  assert.ok(Math.abs(a.y - a.plane) < 1.0, `Tux stays on the terrain (${a.y} vs ${a.plane})`);
});

test('the save file is the original fish format: 512-byte records', () => {
  const save = new SaveGame();
  save.setLastCompletedCup('Herring Run', 1, 'Canadian Cup');
  save.setResult({ event: 'Herring Run', cup: 'Canadian Cup', race: 'Bunny Hill', difficulty: 1, time: 35.25, herring: 23, score: 4900 });
  save.setResult({ event: '__Practice_Event__', cup: '__Practice_Cup__', race: 'Bunny Hill', difficulty: 1, time: 34, herring: 20, score: 4600 });
  const bytes = save.toBytes();
  assert.equal(String.fromCharCode(...bytes.slice(0, 4)), 'fish');
  assert.equal(bytes.length, 4 + 3 * 512);
  const view = new DataView(bytes.buffer);
  assert.equal(view.getInt32(4, true), 0, 'the progress record');
  assert.equal(view.getInt32(4 + 512, true), 1, 'a result record');
  const again = SaveGame.parse(bytes);
  assert.equal(again.lastCompletedCup('Herring Run', 1), 'Canadian Cup');
  const r = again.result('Herring Run', 'Canadian Cup', 'Bunny Hill', 1)!;
  assert.equal(r.time, 35.25);
  assert.equal(r.herring, 23);
  assert.equal(r.score, 4900);
  assert.equal(again.result('__Practice_Event__', '__Practice_Cup__', 'Bunny Hill', 1)!.score, 4600);
  assert.equal(again.isCupComplete('Herring Run', 'Canadian Cup', ['Canadian Cup'], 1), true);
  assert.equal(again.isFirstIncompleteCup('Herring Run', 'Canadian Cup', ['Canadian Cup'], 1), false);
  assert.equal(SaveGame.parse(new Uint8Array(0)).lastCompletedCup('x', 1), null);
});

test('times and scores use the original formats', () => {
  assert.equal(formatTime(0), '00:00.00');
  assert.equal(formatTime(35.5), '00:35.50');
  assert.equal(formatTime(80), '01:20.00');
  assert.equal(formatTime(59.999), '00:59.00', 'hundredths round like get_time_components (the 60th second is not carried)');
});
