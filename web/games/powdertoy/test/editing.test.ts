// Editing (simulation/Editing.cpp), brushes (gui/game/*Brush.h), simulation tools, Air and Newtonian gravity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EllipseBrush, RectangleBrush, TriangleBrush, type Brush } from '../src/sim/brush.ts';
import { Air } from '../src/sim/air.ts';
import { Gravity } from '../src/sim/gravity.ts';
import { CELL, M_GRAV, NCELL, TYP, WL_WALL, XCELLS, YCELLS } from '../src/sim/config.ts';
import { f } from '../src/sim/cpp.ts';
import { PT_DUST, TOOL_HEAT, TOOL_NAMES } from '../src/sim/numbers.ts';
import { GetTools } from '../src/sim/simTool.ts';
import { GravityInput, GravityOutput, Simulation } from '../src/sim/simulation.ts';
import {
  CreateBox, CreateLine, CreateParts, CreateSnapshot, CreateWallBox, CreateWallLine, FloodParts, Restore,
} from '../src/sim/editing.ts';

function picture(brush: Brush): string[] {
  const size = brush.GetSize(), r = brush.GetRadius();
  const rows: string[] = [];
  for (let y = 0; y < size.Y; y++) {
    let s = '';
    for (let x = 0; x < size.X; x++) s += brush.bitmap.get(x, y) ? '#' : '.';
    rows.push(s);
  }
  // the iterator yields exactly the set pixels, bottom row first
  const offs = [...brush];
  assert.equal(offs.length, rows.join('').split('#').length - 1);
  assert.deepEqual(offs[0].Y, r.Y);
  return rows;
}

// reference pictures: EllipseBrush::GenerateBitmap compiled from the original's code (C transliteration, gcc)
test('circle brush radius 4 has the original pixel set', () => {
  const b = new EllipseBrush(true);
  b.SetRadius({ X: 4, Y: 4 });
  assert.deepEqual(picture(b), [
    '..#####..',
    '.#######.',
    '#########',
    '#########',
    '#########',
    '#########',
    '#########',
    '.#######.',
    '..#####..',
  ]);
  assert.equal([...b].length, 69);
  const nb = new EllipseBrush(false);
  nb.SetRadius({ X: 4, Y: 4 });
  assert.deepEqual(picture(nb), [
    '....#....',
    '..#####..',
    '.#######.',
    '.#######.',
    '#########',
    '.#######.',
    '.#######.',
    '..#####..',
    '....#....',
  ]);
  const e = new EllipseBrush(true);
  e.SetRadius({ X: 3, Y: 6 });
  assert.deepEqual(picture(e), [
    '..###..', '.#####.', '.#####.', '.#####.', '#######', '#######', '#######', '#######', '#######',
    '.#####.', '.#####.', '.#####.', '..###..',
  ]);
});

test('rectangle and triangle brushes, radius clamps', () => {
  const r = new RectangleBrush();
  r.SetRadius({ X: 2, Y: 1 });
  assert.equal([...r].length, 15);
  r.SetRadius({ X: -3, Y: 500 });
  assert.deepEqual(r.GetRadius(), { X: 0, Y: 200 });
  const t = new TriangleBrush();
  t.SetRadius({ X: 2, Y: 2 });
  assert.deepEqual(picture(t), ['..#..', '..#..', '.###.', '.###.', '#####']);
});

test('Air kernel is normalised and update_air spreads a pressure blob symmetrically', () => {
  const sim = new Simulation();
  const air = new Air(sim);
  sim.air = air;
  let s = 0;
  for (const k of air.kernel) s += k;
  assert.ok(Math.abs(s - 1) < 1e-6);
  const cx = 70, cy = 40;
  sim.pv[cy][cx] = 100;
  for (let i = 0; i < 5; i++) air.update_air();
  assert.ok(sim.pv[cy][cx] < 100 && sim.pv[cy][cx] > 0);
  // (float sums run left to right, so the mirror images agree up to rounding)
  const near = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-4 * Math.max(1, Math.abs(a));
  assert.ok(sim.pv[cy][cx - 3] > 0 && near(sim.pv[cy][cx - 3], sim.pv[cy][cx + 3]));
  assert.ok(near(sim.pv[cy - 3][cx], sim.pv[cy + 3][cx]));
  assert.ok(sim.vx[cy][cx + 2] > 0 && near(sim.vx[cy][cx - 2], -sim.vx[cy][cx + 2]));
});

test('Newtonian gravity: one-step latency and the direct sum', () => {
  const grav = Gravity.Create();
  const gin = new GravityInput();
  const gout = new GravityOutput();
  const mx = 60, my = 50;
  gin.mass[my * XCELLS + mx] = 10;
  grav.Exchange(gout, gin, false);
  // the result of this input comes with the next exchange
  assert.equal(gout.forceX.some((v) => v !== 0), false);
  gin.mass.fill(0);
  gin.mass[my * XCELLS + mx] = 10;
  grav.Exchange(gout, gin, false);
  for (const [x, y] of [[mx + 10, my], [mx - 7, my + 3], [5, 90], [150, 2]]) {
    const dx = x - mx, dy = y - my;
    const d3 = Math.pow(Math.hypot(dx, dy), 3);
    const ex = -M_GRAV * 10 * dx / d3, ey = -M_GRAV * 10 * dy / d3;
    const p = y * XCELLS + x;
    assert.ok(Math.abs(gout.forceX[p] - ex) < 1e-5 + Math.abs(ex) * 1e-4, `forceX at ${x},${y}: ${gout.forceX[p]} vs ${ex}`);
    assert.ok(Math.abs(gout.forceY[p] - ey) < 1e-5 + Math.abs(ey) * 1e-4, `forceY at ${x},${y}: ${gout.forceY[p]} vs ${ey}`);
  }
  assert.equal(gout.forceX.length, NCELL);
});

// ---- these need Simulation.cpp (agent C1) and the elements ----

function newSim(): Simulation {
  const sim = new Simulation();
  if (!sim.air) sim.air = new Air(sim);
  return sim;
}

function countParts(sim: Simulation, t = PT_DUST): number {
  let n = 0;
  for (let i = 0; i < sim.parts.length; i++) if (sim.parts[i].type == t) n++;
  return n;
}

test('CreateParts / CreateLine / CreateBox counts', () => {
  const sim = newSim();
  const b = new EllipseBrush(true);
  b.SetRadius({ X: 4, Y: 4 });
  CreateParts(sim, -2, 100, 100, PT_DUST, b, 0);
  assert.equal(countParts(sim), 69);
  // a second stroke on the same place adds nothing
  CreateParts(sim, -2, 100, 100, PT_DUST, b, 0);
  assert.equal(countParts(sim), 69);

  const sim2 = newSim();
  const dot = new EllipseBrush(true);
  dot.SetRadius({ X: 0, Y: 0 });
  CreateLine(sim2, 200, 200, 210, 200, PT_DUST, dot, 0);
  assert.equal(countParts(sim2), 11);
  // a diagonal one-pixel line also fills the step pixels
  CreateLine(sim2, 300, 100, 305, 105, PT_DUST, dot, 0);
  assert.equal(countParts(sim2), 11 + 11);
  CreateBox(sim2, -2, 50, 50, 59, 54, PT_DUST, 0);
  assert.equal(countParts(sim2), 22 + 50);
  assert.equal(TYP(sim2.pmap[54][59]), PT_DUST);
});

test('wall line and FloodParts inside a wall box', () => {
  const sim = newSim();
  CreateWallLine(sim, 40, 40, 80, 40, 1, 1, WL_WALL, null);
  let walls = 0;
  for (let y = 0; y < YCELLS; y++) for (let x = 0; x < XCELLS; x++) if (sim.bmap[y][x] == WL_WALL) walls++;
  assert.equal(walls, 11);
  for (let x = 10; x <= 20; x++) assert.equal(sim.bmap[10][x], WL_WALL);

  const sim2 = newSim();
  // a hollow box of wall cells 30..40 (pixel corners of the cells)
  CreateWallBox(sim2, 30 * CELL, 30 * CELL, 40 * CELL, 30 * CELL, WL_WALL);
  CreateWallBox(sim2, 30 * CELL, 40 * CELL, 40 * CELL, 40 * CELL, WL_WALL);
  CreateWallBox(sim2, 30 * CELL, 30 * CELL, 30 * CELL, 40 * CELL, WL_WALL);
  CreateWallBox(sim2, 40 * CELL, 30 * CELL, 40 * CELL, 40 * CELL, WL_WALL);
  FloodParts(sim2, 35 * CELL, 35 * CELL, PT_DUST, -1, 0);
  assert.equal(countParts(sim2), (9 * CELL) * (9 * CELL));
});

test('HEAT tool on one particle', () => {
  assert.equal(GetTools().length, TOOL_NAMES.length);
  assert.deepEqual(GetTools().map((t) => t.Name), TOOL_NAMES);
  const sim = newSim();
  const i = sim.create_part(-1, 20, 20, PT_DUST);
  assert.ok(i >= 0);
  sim.parts[i].temp = 300.15;
  const t0 = sim.parts[i].temp;
  const dot = new EllipseBrush(true);
  dot.SetRadius({ X: 0, Y: 0 });
  const heat = GetTools()[TOOL_HEAT];
  heat.Draw(sim, dot, { X: 20, Y: 20 });
  assert.equal(sim.parts[i].temp, f(t0 + 2.0));
});

test('snapshot / restore round trip', () => {
  const sim = newSim();
  const b = new RectangleBrush();
  b.SetRadius({ X: 3, Y: 2 });
  CreateParts(sim, -2, 150, 150, PT_DUST, b, 0);
  sim.pv[10][10] = 1.5;
  sim.bmap[5][5] = WL_WALL;
  sim.signs.push({ x: 10, y: 10, ju: 1, text: 'hi' });
  const rng = sim.rng.state();
  const snap = CreateSnapshot(sim);
  const before = sim.parts.slice(0, sim.parts.active).map((p) => p.clone());

  CreateParts(sim, -2, 300, 300, PT_DUST, b, 0);
  sim.pv[10][10] = -4;
  sim.bmap[5][5] = 0;
  sim.signs.length = 0;
  sim.rng.gen();

  Restore(sim, snap);
  assert.equal(countParts(sim), 35);
  assert.equal(sim.pv[10][10], 1.5);
  assert.equal(sim.bmap[5][5], WL_WALL);
  assert.equal(sim.signs.length, 1);
  assert.deepEqual(sim.rng.state(), rng);
  for (let k = 0; k < before.length; k++) assert.deepEqual(sim.parts[k], before[k]);
});
