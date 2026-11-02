// GLtron's drawing geometry (src/geometry.ts) against the numbers in the original's drawing code
// (src/video/graphics_world.c, trail_geometry.c, recognizer.c, camera.c). The first test is the
// regression for the broken port: its walls were planes rotated about the wrong axis, so they stood
// slanted and in the wrong places instead of upright along the four arena edges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  floorQuads, observerCamera, playerCamera, recognizerAngle, recognizerState, segmentEnd, shadowProject,
  trailLines, trailMesh, wallQuads, cycleAngle, cycleLean,
} from '../src/geometry.ts';
import { GltronGame } from '../src/sim.ts';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('the four walls are upright quads on the arena edges, 144 high, facing inward', () => {
  const walls = wallQuads(720);
  assert.equal(walls.length, 4);
  const expectEdge = [
    (p: number[]) => p[1] === 0, (p: number[]) => p[0] === 720,
    (p: number[]) => p[1] === 720, (p: number[]) => p[0] === 0,
  ];
  walls.forEach((w, i) => {
    assert.equal(w.pos.length, 12);
    const pts = [0, 3, 6, 9].map((k) => w.pos.slice(k, k + 3));
    for (const p of pts) assert.ok(expectEdge[i](p), `wall ${i} vertex ${p} is not on its edge`);
    assert.deepEqual(pts.map((p) => p[2]).sort((a, b) => a - b), [0, 0, 144, 144]);
    // the normal of (v1-v0) x (v2-v0) points into the arena (the original culls the back face)
    const a = pts[0], b = pts[1], c = pts[2];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const toCenter = [360 - a[0], 360 - a[1]];
    assert.ok(n[0] * toCenter[0] + n[1] * toCenter[1] > 0, `wall ${i} faces outward`);
    close(n[2], 0);
    assert.deepEqual(w.uv, [1, 0, 1, 1, 0, 1, 0, 0]); // stretch_textures: one texture per wall
  });
  assert.equal(wallQuads(240)[0].pos[5], 48); // wall height grid/240*48
});

test('the floor is 4x4 quads with the texture repeated l/12 = 15 times each (60 across)', () => {
  const q = floorQuads(720);
  assert.equal(q.length, 16);
  assert.deepEqual(q[0].pos, [0, 0, 0, 180, 0, 0, 180, 180, 0, 0, 180, 0]);
  assert.deepEqual(q[0].uv, [0, 0, 15, 0, 15, 15, 0, 15]);
  assert.equal(floorQuads(240).length, 16);
  assert.equal(floorQuads(240)[0].uv[2], 5);
});

test('shadow_matrix projects onto the floor along (1/2, 1/2, 1)', () => {
  assert.deepEqual(shadowProject(10, 20, 4), [8, 18, 0]);
  assert.deepEqual(shadowProject(10, 20, 0), [10, 20, 0]);
});

test('the trail ribbon has the original bow, the white tip and one segment per straight run', () => {
  const g = new GltronGame({ players: [0, 1, 1, 1] });
  const d = g.players[0].data;
  // start (180, 360) heading +x (dir 3); give it a 100 unit run
  d.trails[d.trailOffset].dx = 100;
  d.trailHeight = 3.5;
  const end0 = segmentEnd(d, 0), end1 = segmentEnd(d, 1), end2 = segmentEnd(d, 2);
  close(end0.x, 280 - 0.85 * 6); close(end1.x, 280 - 2 * 6); close(end2.x, 280 - 0.4 * 6);
  close(end0.y, 360);
  const m = trailMesh(d, [1, 0.85, 0.14], [1, 0.55, 0.14]);
  // 2 columns for the run up to the bow, 2 for the tip (the last one white), 11 for the bow
  assert.equal(m.pos.length / 6, 2 + 2 + 11);
  assert.equal(m.index.length, 6 * (1 + 1 + 10));
  assert.equal(m.uv.length / 4, m.pos.length / 6);
  assert.equal(m.color.length, m.pos.length);
  // every vertex pair stands on the floor and goes up to at most trail_height
  for (let i = 0; i < m.pos.length; i += 6) {
    assert.ok(m.pos[i + 2] >= 0 && m.pos[i + 5] <= 3.5 + 1e-9 && m.pos[i + 5] > m.pos[i + 2] - 1e-9);
  }
  // the last bow column is in the cycle's colour
  assert.deepEqual(m.color.slice(-3), [1, 0.55, 0.14]);
  const lines = trailLines(d);
  assert.deepEqual(lines.slice(0, 6), [180, 360, 3.5, end0.x, end0.y, 3.5]);
  assert.equal(lines.length, 6);
});

test('a corner starts a new ribbon column; a straight continuation does not', () => {
  const g = new GltronGame({ players: [0, 1, 1, 1] });
  const d = g.players[0].data;
  d.trailHeight = 3.5;
  d.trails[0] = { x: 0, y: 0, dx: 10, dy: 0 };
  d.trails[1] = { x: 10, y: 0, dx: 10, dy: 0 }; // same axis: shares the previous end columns
  d.trails[2] = { x: 20, y: 0, dx: 0, dy: 10 }; // corner
  d.trails[3] = { x: 20, y: 10, dx: 0, dy: 30 }; // the segment being drawn
  d.trailOffset = 3;
  d.dir = 2;
  const columns = trailMesh(d, [1, 1, 1], [1, 1, 1]).pos.length / 6;
  // seg 0: 2, seg 1: 1, seg 2 (corner): 2, then the two tip pieces 2 + 2 and 11 bow columns
  assert.equal(columns, 2 + 1 + 2 + 4 + 11);
});

test('the recognizer path and the original\'s angle quirk', () => {
  const r = recognizerState(0, 720, 80);
  const max = 80 * 0.25;
  const x = 0.5 * Math.sin(0.6) - 0.5 * Math.sin(-0.3), y = 0.8 * Math.cos(0) - 0.2 * Math.sin(0);
  close(r.x, (max + (x + 1) * (720 - max)) / 2);
  close(r.y, (max + (y + 1) * (720 - max)) / 2);
  // getRecognizerAngle() reads velocity->v[0] twice, so it only ever yields 135 or 315 degrees
  close(recognizerAngle(1), 135);
  close(recognizerAngle(-1), 315);
});

test('cameras: behind, circling, cockpit and the observer on the recognizer', () => {
  const p = { x: 100, y: 200, dir: 3, lastDir: 3, turnTime: 0 };
  // behind (follow) camera: r 18, chi pi/4, phi = pi/72 + camAngles[dir 3] = pi/72 + pi
  const b = playerCamera(1, p, 1000, Math.PI / 72, 0);
  const phi = Math.PI / 72 + Math.PI;
  close(b.cam[0], 100 + 18 * Math.cos(phi) * Math.sin(Math.PI / 4));
  close(b.cam[1], 200 + 18 * Math.sin(phi) * Math.sin(Math.PI / 4));
  close(b.cam[2], 18 * Math.cos(Math.PI / 4));
  assert.deepEqual(b.target, [100, 200, 0]);
  // circling: r 17, chi pi/3, height 8.5, does not follow the player's direction
  const c = playerCamera(0, p, 1000, 0, 0);
  close(c.cam[0], 100 + 17 * Math.sin(Math.PI / 3));
  close(c.cam[2], 8.5);
  // cockpit: eye 4 units ahead of the cycle at height 4.1, looking along the heading
  const k = playerCamera(2, p, 1000, Math.PI, 0);
  close(k.cam[2], 4.1);
  close(k.target[2], 4);
  assert.ok(k.cam[0] > 100 + 3.8);
  // turning interpolates camAngles over 200 ms
  const turning = playerCamera(1, { ...p, dir: 2, lastDir: 3, turnTime: 900 }, 1000, 0, 0);
  const half = playerCamera(1, { ...p, dir: 2, lastDir: 3, turnTime: 900 }, 1100, 0, 0);
  assert.notDeepEqual(turning.cam, half.cam);
  const o = observerCamera({ x: 10, y: 20, vx: 1, vy: 2 });
  assert.deepEqual(o, { cam: [10, 20, 50], target: [11, 22, 48] });
});

test('the cycle turns over 200 ms and leans while turning', () => {
  assert.equal(cycleAngle(3, 3, 1000), 90);
  close(cycleAngle(1, 0, 100), -45);
  close(cycleAngle(2, 3, 100), -225); // 3 -> 2 interpolates from -270 (the original's lastDir 5), not 90
  assert.equal(cycleLean(1, 1, 50), 0);
  assert.equal(cycleLean(1, 0, 300), 0);
  close(Math.abs(cycleLean(1, 0, 100)), 25);
});
