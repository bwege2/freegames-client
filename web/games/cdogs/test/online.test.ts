// Online play (src/online.ts) without a server: the way from the lobby into the round's game screen must not run
// the main menu's OnEnter (which leaves the room), and the lockstep must keep the words of a client that is ahead.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { GameContext, GameMessage, RoundStart } from '../../../src/sdk/index.ts';
import { encodeInput, enterRound, Lockstep, shakeRandom } from '../src/online.ts';
import { GameLoopDataNew, LoopRunner, UPDATE_RESULT_DRAW } from '../src/ui/loop.ts';
import { mainMenuHooks } from '../src/ui/mainmenu.ts';
import { runGameHooks } from '../src/ui/rungame.ts';

test('online: loading the round keeps the room; the main menu after the round leaves it', () => {
  let leaves = 0;
  // as setupOnline: back on the main menu from an online round, the seat is given up
  mainMenuHooks.onMainMenu = () => {
    if (!runGameHooks.online) return;
    runGameHooks.online = null;
    leaves++;
  };
  const menu = GameLoopDataNew({
    label: 'menu', OnEnter: () => mainMenuHooks.onMainMenu?.(), UpdateFunc: () => UPDATE_RESULT_DRAW, DrawFunc: () => {},
  });
  const lobby = GameLoopDataNew({ label: 'lobby', UpdateFunc: () => UPDATE_RESULT_DRAW, DrawFunc: () => {} });
  const game = GameLoopDataNew({ label: 'game', UpdateFunc: () => UPDATE_RESULT_DRAW, DrawFunc: () => {} });
  const l = new LoopRunner();
  l.reset(menu);
  l.tick(34);
  l.push(lobby);
  l.tick(34);
  // startRound has set the round's hooks, then the lobby screen hands over to the game
  runGameHooks.online = { exchange: () => null, pvpSeed: () => 1, shakeRand: () => 0 };
  enterRound(l, game);
  for (let i = 0; i < 120; i++) l.tick(34);
  assert.equal(leaves, 0, 'the room is not left while the round loads and runs');
  assert.deepEqual(l.stack().map((s) => String(s).split(':')[1]), ['menu', 'game']);
  assert.notEqual(runGameHooks.online, null);
  // the round's screens are done: back on the main menu, which leaves the room once
  l.pop();
  for (let i = 0; i < 3; i++) l.tick(34);
  assert.equal(leaves, 1);
  runGameHooks.online = null;
  mainMenuHooks.onMainMenu = null;
});

/** a room with two seats and no server: the messages are handed to the lockstep by hand */
function fakeRoom(): { ctx: GameContext; deliver: (m: GameMessage) => void; sent: Uint8Array[] } {
  const handlers: Record<string, ((x: unknown) => void)[]> = {};
  const sent: Uint8Array[] = [];
  const ctx = {
    rooms: {
      on: (ev: string, fn: (x: unknown) => void) => { (handlers[ev] ??= []).push(fn); },
      send: (data: Uint8Array) => { sent.push(data); },
    },
  } as unknown as GameContext;
  return { ctx, deliver: (m) => handlers.message?.forEach((f) => f(m)), sent };
}

test('online: the words of a client ahead of this one are kept until this one gets there', () => {
  const round = {
    seats: [{ seat: 0, name: 'anna' }, { seat: 1, name: 'bert' }], you: 0, seed: 7n, options: new Uint8Array(0),
  } as unknown as RoundStart;
  const room = fakeRoom();
  const lock = new Lockstep(room.ctx, round);
  // seat 1 already sent its words for frames 4..12 (its own frames 0..8) before this client stepped once
  for (let f = 4; f <= 12; f++) room.deliver({ from: 1, data: encodeInput(f, f) } as unknown as GameMessage);
  const steps: number[][] = [];
  for (let i = 0; i < 13; i++) {
    const out = lock.exchange([100 + i]);
    assert.notEqual(out, null, `frame ${i} has every word`);
    steps.push(out!);
  }
  // frames 0..3 are the input delay's idle frames; from frame 4 on: this seat's word of 4 frames earlier, seat 1's own
  for (let f = 0; f < 4; f++) assert.deepEqual(steps[f], [0, 0], `frame ${f}`);
  for (let f = 4; f <= 12; f++) assert.deepEqual(steps[f], [100 + f - 4, f], `frame ${f}`);
  // the next frame waits for seat 1
  assert.equal(lock.exchange([0]), null);
  room.deliver({ from: 1, data: encodeInput(13, 5) } as unknown as GameMessage);
  assert.deepEqual(lock.exchange([0]), [109, 5]);
  // a repeat of a stepped frame changes nothing
  room.deliver({ from: 1, data: encodeInput(4, 99) } as unknown as GameMessage);
  assert.equal(lock.exchange([0]), null);
});

test('online: the camera shake has its own generator, the same from the same seed, in rand()\'s range', () => {
  const a = shakeRandom(42);
  const b = shakeRandom(42);
  const xs = Array.from({ length: 1000 }, () => a());
  assert.deepEqual(Array.from({ length: 1000 }, () => b()), xs);
  for (const x of xs) assert.ok(Number.isInteger(x) && x >= 0 && x <= 2147483647);
  assert.ok(new Set(xs).size > 990, 'not constant');
});
