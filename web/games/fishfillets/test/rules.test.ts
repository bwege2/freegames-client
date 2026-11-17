// The rules of the fish (src/level/Rules.cpp, Room.cpp, Landslip.cpp of fillets-ng 1.0.1) on small rooms
// built with the game's own script functions. Each case states the rule of the C++ source it checks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Env, type DataFiles } from '../src/engine/env.ts';
import { Level, LevelStatus, type LevelHost } from '../src/engine/level.ts';
import { GameState, StateManager } from '../src/engine/state.ts';
import { rng } from '../src/engine/random.ts';
import { RecordingSound, dataFiles } from './harness.ts';

class Null extends GameState { readonly name = 'null'; }

/** a level whose init.lua is `body`, with models made by game_addModel; returns the level and its model indexes */
function room(body: string): Level {
  rng.init(1);
  const real = dataFiles();
  const data: DataFiles = {
    has: (p) => p === 'script/t/init.lua' || real.has(p),
    text: (p) => (p === 'script/t/init.lua' ? `function script_update() end\nfunction script_saveUndo() end\n${body}` : real.text(p)),
  };
  const env = new Env(data, new RecordingSound(), { width: (t) => t.length * 9 });
  env.options.setParam('lang', 'en');
  const host: LevelHost = { findDesc: (c) => c, findLevelName: (c) => c, createDemo: () => new Null(env), setScreenSize: () => {} };
  const level = new Level(env, host, 't', 'script/t/init.lua', 1);
  const status = new LevelStatus(env);
  status.prepareRun('t', '', -1, '');
  level.fillStatus(status);
  const m = new StateManager();
  const base = new Null(env);
  m.pushState(null, base);
  base.pushState(level);
  return level;
}

/** let everything fall until it rests (Room::loadMove without a move) */
function settle(level: Level): void {
  for (let i = 0; i < 100 && level.room.beginFall(false); i++) level.room.finishRound(false);
  level.room.beginFall(false);
  level.room.finishRound(false);
}

/** one move as LevelLoading does it (Room::loadMove: fall until rest, then the move); false for a bad move */
function move(level: Level, symbol: string): boolean {
  let ok = true;
  try {
    level.room.loadMove(symbol);
  } catch {
    ok = false;
  }
  settle(level);
  return ok;
}

const FLOOR = `wall = game_addModel("item_fixed", 0, 7, "XXXXXXXXXXXX")\n`;
const at = (level: Level, i: number) => `${level.room.models[i].loc.x},${level.room.models[i].loc.y}`;

test('a small fish cannot push steel, a big fish can (Rules::canDir: power >= weight)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 1, 6, "XXX")
    steel = game_addModel("item_heavy", 4, 6, "X")`);
  settle(l);
  // the small fish looks left at the start: the first 'r' turns it, the second pushes
  assert.equal(move(l, 'r'), true, 'turning is a move');
  assert.equal(move(l, 'r'), false, 'the small fish cannot push steel');
  assert.equal(at(l, 2), '4,6');
  const b = room(`level_createRoom(12, 8, "")\n${FLOOR}
    steel = game_addModel("item_heavy", 4, 6, "X")
    big = game_addModel("fish_big", 5, 5, "XXXX\\nXXXX")`);
  settle(b);
  assert.equal(move(b, 'L'), true, 'the big fish pushes steel');
  assert.equal(at(b, 1), '3,6');
  assert.equal(at(b, 2), '4,5');
});

test('a fish cannot push another fish (Rules::canDir: live models are not moved)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 1, 6, "XXX")
    big = game_addModel("fish_big", 4, 5, "XXXX\\nXXXX")`);
  settle(l);
  assert.equal(move(l, 'L'), false);
  assert.equal(at(l, 2), '4,5');
});

test('a falling object kills the fish it falls on (Rules::checkDeadFall)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 2, 6, "XXX")
    stone = game_addModel("item_light", 3, 1, "X")`);
  settle(l);
  assert.equal(l.room.models[1].alive, false, 'the fish under the falling stone is dead');
});

test('a light object put down on a fish does not kill it (only a falling one does)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 2, 6, "XXX")
    stone = game_addModel("item_light", 3, 5, "X")`);
  settle(l);
  assert.equal(l.room.models[1].alive, true);
  assert.equal(at(l, 2), '3,5', 'the stone lies on the fish');
});

test('steel on a small fish kills it, a big fish carries it (Rules::checkDeadStress)', () => {
  const s = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 2, 6, "XXX")
    steel = game_addModel("item_heavy", 3, 5, "X")`);
  settle(s);
  assert.equal(s.room.models[1].alive, false, 'the small fish under steel dies');
  const b = room(`level_createRoom(12, 8, "")\n${FLOOR}
    big = game_addModel("fish_big", 2, 5, "XXXX\\nXXXX")
    steel = game_addModel("item_heavy", 3, 4, "X")`);
  settle(b);
  assert.equal(b.room.models[1].alive, true, 'the big fish carries steel');
});

test('pushing an object that lies only on a fish kills that fish (Rules::checkDeadMove, strict rules)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 3, 6, "XXX")
    stone = game_addModel("item_light", 4, 5, "X")
    big = game_addModel("fish_big", 5, 4, "XXXX\\nXXXX")`);
  settle(l);
  assert.equal(l.room.models[1].alive, true);
  assert.equal(move(l, 'L'), true, 'the big fish pushes the stone');
  assert.equal(at(l, 2), '3,5');
  assert.equal(l.room.models[1].alive, false, 'the small fish under the pushed stone dies');
});

test('an object lying on a wall too may be pushed off a fish (Rules::isOnHolderBacks)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    block = game_addModel("item_fixed", 1, 6, "X")
    small = game_addModel("fish_small", 2, 6, "XXX")
    stone = game_addModel("item_light", 1, 5, "XX")
    big = game_addModel("fish_big", 3, 4, "XXXX\\nXXXX")`);
  settle(l);
  assert.equal(at(l, 3), '1,5');
  assert.equal(move(l, 'L'), true);
  assert.equal(at(l, 3), '0,5');
  assert.equal(l.room.models[2].alive, true, 'the stone also lay on the wall: the fish lives');
});

test('pushing the only support away: the stone falls on the fish that pushed out from under it (Landslip)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 2, 6, "XXX")
    stone = game_addModel("item_light", 2, 5, "X")`);
  settle(l);
  assert.equal(at(l, 2), '2,5');
  // the fish swims right: the stone falls to the floor next to it, the fish lives
  move(l, 'r');
  move(l, 'r');
  move(l, 'r');
  assert.equal(l.room.models[1].alive, true);
  assert.equal(at(l, 2), '2,6', 'the stone fell to the floor');
});

test('a fish with goal_escape swims out of the room and the room is solved (Rules::actionOut, Room::isSolved)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 8, 6, "XXX")
    model_setGoal(small, "goal_escape")`);
  settle(l);
  assert.equal(l.room.isSolved(), false);
  move(l, 'r');
  move(l, 'r');
  move(l, 'r');
  for (let i = 0; i < 10; i++) settle(l);
  assert.equal(l.room.models[1].out, true);
  assert.equal(l.room.isSolved(), true);
});

test('a dead fish with goal_escape makes the room unsolvable (Goal::isWrong)', () => {
  const l = room(`level_createRoom(12, 8, "")\n${FLOOR}
    small = game_addModel("fish_small", 2, 6, "XXX")
    model_setGoal(small, "goal_escape")
    stone = game_addModel("item_heavy", 3, 1, "X")`);
  settle(l);
  assert.equal(l.room.isSolvable(), false);
  assert.equal(l.room.cannotMove(), true);
});
