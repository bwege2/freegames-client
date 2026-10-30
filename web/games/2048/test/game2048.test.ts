// The port of 2048 against the original: re/2048/oracle/oracle.mjs runs the original's own
// js/grid.js, js/tile.js and js/game_manager.js in Node with a seeded Math.random and stub input,
// screen and storage, and writes every step of a scripted game to test/golden/*.jsonl. This replays
// the same seeds and scripts on the port; every step's grid, score, flags, best score, random-call
// count, "Keep going" clears, saved game state and storage writes must be the same.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { GameManager, type Actuator, type Direction, type GameState, type InputManager, type StorageManager } from '../src/game.ts';
import { keyAction, swipeDirection } from '../src/input.ts';
import { ServerStorage, type StorageFiles } from '../src/storage.ts';

/** The oracle's generator (mulberry32), so the same seeds give the same numbers in both. */
function mulberry32(seed: number): { random: () => number; calls: () => number } {
  let a = seed >>> 0;
  let calls = 0;
  return {
    random() {
      calls++;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    calls: () => calls,
  };
}

/** The original's LocalStorageManager, in memory, recording what was written and in which order. */
class TestStorage implements StorageManager {
  best: number;
  state: string | null;
  private events: unknown[][] = [];

  constructor(best: number, state: GameState | null) {
    this.best = best;
    this.state = state ? JSON.stringify(state) : null;
  }

  getBestScore(): number { return this.best; }

  setBestScore(score: number): void {
    this.best = score;
    this.events.push(['best', score]);
  }

  getGameState(): GameState | null {
    return this.state ? JSON.parse(this.state) as GameState : null;
  }

  setGameState(state: GameState): void {
    this.state = JSON.stringify(state);
    this.events.push(['state', this.state]);
  }

  clearGameState(): void {
    this.state = null;
    this.events.push(['clear']);
  }

  takeEvents(): unknown[][] {
    return this.events.splice(0);
  }
}

class TestInput implements InputManager {
  private readonly handlers = new Map<string, ((data?: Direction) => void)[]>();

  on(event: string, callback: (data?: Direction) => void): void {
    const list = this.handlers.get(event) ?? [];
    list.push(callback);
    this.handlers.set(event, list);
  }

  emit(event: string, data?: Direction): void {
    for (const callback of this.handlers.get(event) ?? []) callback(data);
  }
}

interface Scenario {
  name: string;
  seed: number;
  best: number;
  state: GameState | null;
  script: string;
}

const golden = join(import.meta.dirname, 'golden');

for (const file of readdirSync(golden).filter((f) => f.endsWith('.jsonl')).sort()) {
  test(`as the original: ${file}`, () => {
    const lines = readFileSync(join(golden, file), 'utf8').trimEnd().split('\n');
    const scenario = JSON.parse(lines[0]) as Scenario;
    const storage = new TestStorage(scenario.best, scenario.state);
    const rng = mulberry32(scenario.seed);
    const input = new TestInput();
    let continued = 0;
    let meta: unknown = null;
    const actuator: Actuator = { actuate(_grid, metadata) { meta = metadata; }, continueGame() { continued++; } };
    const manager = new GameManager(4, input, actuator, storage, rng.random);

    const snapshot = (key: string) => JSON.stringify({
      in: key,
      grid: manager.grid.cells.map((column) => column.map((tile) => (tile ? tile.value : 0))),
      score: manager.score,
      over: manager.over,
      won: manager.won,
      keepPlaying: manager.keepPlaying,
      best: storage.best,
      random: rng.calls(),
      continued,
      meta,
      state: storage.state,
      events: storage.takeEvents(),
    });

    assert.equal(snapshot('S'), lines[1], 'the state after setup');
    for (let i = 0; i < scenario.script.length; i++) {
      const key = scenario.script[i];
      if (key === 'U') input.emit('move', 0);
      else if (key === 'R') input.emit('move', 1);
      else if (key === 'D') input.emit('move', 2);
      else if (key === 'L') input.emit('move', 3);
      else if (key === 'N') input.emit('restart');
      else if (key === 'K') input.emit('keepPlaying');
      else throw new Error(`unknown script letter ${key}`);
      assert.equal(snapshot(key), lines[i + 2], `step ${i + 1} (${key})`);
    }
  });
}

test('the keys are the original map: arrows, vim keys and W A S D, R restarts', () => {
  for (const [which, direction] of [[38, 0], [39, 1], [40, 2], [37, 3], [75, 0], [76, 1], [74, 2], [72, 3],
    [87, 0], [68, 1], [83, 2], [65, 3]] as const) {
    assert.deepEqual(keyAction({ which, key: 'x' }), { type: 'move', direction }, `which ${which}`);
  }
  assert.deepEqual(keyAction({ key: 'ArrowUp' }), { type: 'move', direction: 0 }, 'by key name');
  assert.deepEqual(keyAction({ key: 'H' }), { type: 'move', direction: 3 }, 'capital letters too');
  assert.deepEqual(keyAction({ key: 'r' }), { type: 'restart' }, 'R');
  assert.equal(keyAction({ key: 'Enter' }), null, 'everything else does nothing');
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const) {
    assert.equal(keyAction({ key: 'ArrowUp', [modifier]: true }), null, `${modifier} blocks a move`);
    assert.equal(keyAction({ key: 'r', [modifier]: true }), null, `${modifier} blocks a restart`);
  }
});

test('a swipe moves by more than 10 px along its longer axis, as the original', () => {
  assert.equal(swipeDirection(10, 0), null, '10 px is not a swipe');
  assert.equal(swipeDirection(11, 0), 1, 'right');
  assert.equal(swipeDirection(-11, 5), 3, 'left');
  assert.equal(swipeDirection(5, 11), 2, 'down');
  assert.equal(swipeDirection(5, -11), 0, 'up');
  assert.equal(swipeDirection(11, 11), 2, 'a tie goes down: absDx > absDy is false');
  assert.equal(swipeDirection(4, -4), null, '4 px diagonally is not a swipe');
});

test('a fresh game starts with two tiles and saving returns the original JSON', () => {
  const storage = new TestStorage(0, null);
  const rng = mulberry32(1);
  const manager = new GameManager(4, new TestInput(), { actuate() {}, continueGame() {} }, storage, rng.random);
  assert.equal(manager.grid.availableCells().length, 14);
  assert.equal(rng.calls(), 4, 'two tiles, each value and position');
  const saved = JSON.parse(storage.state!);
  assert.deepEqual(Object.keys(saved), ['grid', 'score', 'over', 'won', 'keepPlaying']);
  assert.deepEqual(Object.keys(saved.grid), ['size', 'cells']);
});

test('the best score and the game state are files under the original localStorage names and formats', async () => {
  const files = new Map<string, Uint8Array>();
  const storageFiles: StorageFiles = {
    get: async (name) => files.get(name) ?? null,
    put: async (name, data) => { files.set(name, data); },
    delete: async (name) => files.delete(name),
  };
  const storage = await ServerStorage.load(storageFiles);
  assert.equal(storage.getBestScore(), 0);
  assert.equal(storage.getGameState(), null);

  const state: GameState = {
    grid: { size: 4, cells: [[null, { position: { x: 0, y: 1 }, value: 4 }, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]] },
    score: 42, over: false, won: false, keepPlaying: false,
  };
  storage.setBestScore(42);
  storage.setGameState(state);
  await storage.flush(1000);
  assert.equal(new TextDecoder().decode(files.get('bestScore')), '42', 'bestScore is a plain number');
  assert.deepEqual(JSON.parse(new TextDecoder().decode(files.get('gameState'))), state, 'gameState is the original JSON');

  const again = await ServerStorage.load(storageFiles);
  assert.equal(again.getBestScore(), 42, 'the best score comes back');
  assert.deepEqual(again.getGameState(), state, 'the state comes back');
  again.clearGameState();
  await again.flush(1000);
  assert.equal(files.has('gameState'), false, 'clearing deletes the file');

  files.set('gameState', new TextEncoder().encode('not json'));
  const broken = await ServerStorage.load(storageFiles);
  assert.equal(broken.getGameState(), null, 'a file that is not a state starts a new game');
});
