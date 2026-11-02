// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The match around the original's game: deterministic (the same seed and keys give the same match, which online play
// relies on), the computer players draw no numbers from the game's rand() (their keys replayed give the same match),
// the score board between rounds holds the game for its 4 s, and the six maps are complete.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Brain } from '../src/ai.ts';
import { Match, SCORE_FRAMES } from '../src/match.ts';
import { MAP_HEIGHT, MAP_WIDTH, type Keys } from '../src/sim.ts';
import { loadMaps } from './trace.ts';

function played(seed: number, frames: number): { match: Match; keys: Keys[][] } {
  const match = new Match(loadMaps(), 4, seed, { points_to_win: 2 });
  const brains = [0, 1, 2, 3].map((i) => new Brain(i, seed + i));
  const keys: Keys[][] = [];
  for (let f = 0; f < frames; f++) {
    const k = brains.map((b) => b.think(match.game));
    keys.push(k);
    match.step(k);
  }
  return { match, keys };
}

test('the same seed and keys give the same match; another seed another', () => {
  const a = played(7, 3000);
  const b = new Match(loadMaps(), 4, 7, { points_to_win: 2 });
  for (const k of a.keys) b.step(k);
  assert.equal(b.hash(), a.match.hash(), 'the computer players\' keys alone replay the match: they take nothing from its rand()');
  assert.equal(b.game.rand.calls, a.match.game.rand.calls);
  const c = played(8, 3000);
  assert.notEqual(c.match.hash(), a.match.hash());
});

test('the score board holds the game for its 4 s, then the next round starts', () => {
  const m = new Match(loadMaps(), 2, 3, { round_time: 30 });
  const brains = [0, 1].map((i) => new Brain(i, 50 + i));
  let f = 0;
  while (m.board === 0 && f < 64 * 400) {
    m.step(brains.map((b) => b.think(m.game)));
    f++;
  }
  assert.ok(m.board > 0 && m.lastRound, 'a round ended');
  assert.equal(m.board, SCORE_FRAMES);
  const frame = m.game.frame_count;
  for (let i = 0; i < SCORE_FRAMES - 1; i++) m.step([]);
  assert.equal(m.game.frame_count, frame, 'nothing moves under the board');
  m.step([]);
  assert.equal(m.board, 0);
  m.step([]);
  assert.equal(m.game.frame_count, frame + 1, 'then the game goes on');
  assert.notEqual(m.game.map.current.name, m.lastRound!.map, 'on the next map');
});

test('the six maps: 17 x 13, walls round them, four start positions on floor', () => {
  const maps = loadMaps();
  assert.deepEqual(maps.map((m) => m.name).sort(), ['Canteen', 'Conveyor', 'Drain', 'Fridge', 'Grease_Trap', 'Pantry']);
  for (const m of maps) {
    assert.equal(m.max_players, 4, m.name);
    for (let x = 0; x < MAP_WIDTH; x++) {
      assert.equal(m.data[x][0], '*', `${m.name}: top wall`);
      assert.equal(m.data[x][MAP_HEIGHT - 1], '*', `${m.name}: bottom wall`);
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
      assert.equal(m.data[0][y], '*', `${m.name}: left wall`);
      assert.equal(m.data[MAP_WIDTH - 1][y], '*', `${m.name}: right wall`);
    }
    for (let p = 0; p < 4; p++) {
      const { x, y } = m.bomber_pos[p];
      assert.equal(m.data[x][y], String(p), `${m.name}: start ${p}`);
      // a way out of the corner that a first bomb does not reach: two free tiles at a right angle
      const free = (dx: number, dy: number) => m.data[x + dx]?.[y + dy] === ' ';
      assert.ok((free(1, 0) || free(-1, 0)) && (free(0, 1) || free(0, -1)), `${m.name}: start ${p} has its L of free tiles`);
    }
  }
});
