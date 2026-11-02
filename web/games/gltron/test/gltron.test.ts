// GLtron's deterministic simulation, checked against the values in re/gltron/NOTES.md:
// the seed-42 spawn fixture (the original's trand()/randomPermutation), the exact segment
// intersection semantics, and a full AI round reaching a winner.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GltronGame, intersect, Rng } from '../src/sim.ts';

test('seed 42 produces the original round-1 spawns and directions', () => {
  const g = new GltronGame({ players: [0, 1, 1, 1] });
  assert.deepEqual(g.players.map((_, i) => g.position(i)), [
    { x: 180, y: 360 }, { x: 540, y: 360 }, { x: 360, y: 180 }, { x: 360, y: 540 },
  ]);
  assert.deepEqual(g.players.map((p) => p.data.dir), [3, 2, 1, 3]);
  assert.deepEqual(g.players.map((p) => p.kind), [0, 1, 1, 1]);
});

test('round 2 continues the original random stream', () => {
  const g = new GltronGame({ players: [0, 1, 1, 1] });
  g.resetRound();
  assert.deepEqual(g.players.map((_, i) => g.position(i)), [
    { x: 360, y: 180 }, { x: 180, y: 360 }, { x: 540, y: 360 }, { x: 360, y: 540 },
  ]);
  assert.deepEqual(g.players.map((p) => p.data.dir), [1, 1, 2, 0]);
});

test('the segment intersection keeps the original parallel failure and hit ranges', () => {
  const h = (x: number, y: number, dx: number, dy: number) => ({ x, y, dx, dy });
  assert.equal(intersect(h(0, 0, 10, 0), h(20, 0, 10, 0)), null);
  assert.equal(intersect(h(0, 0, 10, 0), h(5, 0, 10, 0))?.t1, 0.5);
  assert.equal(intersect(h(0, 0, 10, 0), h(-5, 0, 10, 0))?.t1, 0);
  const cross = intersect(h(0, 0, 10, 0), h(5, -5, 0, 10));
  assert.ok(cross);
  assert.equal(cross.t1, 0.5);
  assert.equal(cross.t2, 0.5);
  assert.equal(intersect(h(0, 0, 0, 0), h(0, 0, 10, 0))?.t1, 0);
});

test('four computer players finish a round with the original rules', () => {
  const g = new GltronGame({ players: [1, 1, 1, 1] }, new Rng(42));
  for (let i = 0; i < 3000 && !g.finished; i++) g.update(16);
  assert.ok(g.finished, `round finished (t=${g.time})`);
  assert.ok(g.winner >= 0 && g.winner < 4, `winner ${g.winner}`);
  const scores = g.players.reduce((n, p) => n + p.data.score, 0);
  assert.ok(scores > 0, 'a crash scores the other players');
});
