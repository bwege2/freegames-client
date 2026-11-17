// The rules around the bike (Scene.cpp, GameEvents.cpp): strawberries are taken by touching them, the
// flower only finishes the level once none is left, a wrecker kills, the head on the ground kills; level
// scripts (the tutorials) talk through Game.Message; replays keep the original's .rpl format.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { parseLevel } from '../src/level.ts';
import { Scene } from '../src/scene.ts';
import { DD_RIGHT, PHYS } from '../src/bike.ts';
import { ReplayRecorder, parseReplay, encodeState, decodeState, timeToFloat, floatToTime } from '../src/replay.ts';
import { formatTime } from '../src/render.ts';
import { v2 } from '../src/vmath.ts';
import { Theme } from '../src/theme.ts';

const files: Record<string, string> = JSON.parse(gunzipSync(readFileSync(new URL('../assets/levels.json.gz', import.meta.url))).toString('utf8'));
const scripts: Record<string, string> = {};
for (const n of Object.keys(files)) if (n.endsWith('.lvs')) scripts[n] = files[n];

function scene(file: string, hooks = {}): Scene {
  const s = new Scene(parseLevel(files[file]), hooks, scripts);
  s.addPlayer();
  s.playInitLevel();
  return s;
}
/** puts the bike's ground point on an entity, like Game.SetPlayerPosition does */
function moveTo(s: Scene, x: number, y: number): void {
  s.setPlayerPosition(x, y - 0.3, true);
}

test('touching the strawberries takes them, then the flower finishes the level', () => {
  let wins = 0, berries = 0;
  const s = scene('i00.lvl', { onPlayerWins: () => wins++, onStrawberry: () => berries++ });
  const straw = s.level.entities.filter((e) => e.isToTake());
  const flower = s.level.entities.find((e) => e.doesMakeWin())!;
  assert.equal(s.level.nbEntitiesToTake, straw.length);
  // the flower first: nothing happens while strawberries are left
  moveTo(s, flower.dynamicPosition.x, flower.dynamicPosition.y);
  for (let i = 0; i < 5; i++) s.updateLevel(1);
  assert.equal(wins, 0);
  for (const e of straw) {
    moveTo(s, e.dynamicPosition.x, e.dynamicPosition.y);
    for (let i = 0; i < 3; i++) s.updateLevel(1);
  }
  assert.equal(berries, straw.length);
  assert.equal(s.level.nbEntitiesToTake, 0);
  assert.equal(s.level.entities.filter((e) => e.isToTake()).length, 0);
  moveTo(s, flower.dynamicPosition.x + 3, flower.dynamicPosition.y + 3);
  for (let i = 0; i < 3; i++) s.updateLevel(1);
  moveTo(s, flower.dynamicPosition.x, flower.dynamicPosition.y);
  for (let i = 0; i < 3; i++) s.updateLevel(1);
  assert.equal(wins, 1);
  assert.ok(s.player.isFinished());
  assert.ok(s.player.finishTime > 0);
});

test('a wrecker kills, and a dead rider falls apart (the body is detached)', () => {
  let deaths = 0;
  const name = Object.keys(files).find((n) => n.endsWith('.lvl') && parseLevel(files[n]).entities.some((e) => e.doesKill()))!;
  const s = scene(name, { onPlayerDies: () => deaths++ });
  const w = s.level.entities.find((e) => e.doesKill())!;
  moveTo(s, w.dynamicPosition.x, w.dynamicPosition.y);
  for (let i = 0; i < 3; i++) s.updateLevel(1);
  assert.equal(deaths, 1);
  assert.ok(s.player.isDead());
  assert.ok(s.player.bodyDetach);
  const t = s.player.deadTime;
  for (let i = 0; i < 50; i++) s.updateLevel(1);
  assert.equal(s.player.deadTime, t, 'the time stops at the death');
});

test('the tutorial script speaks through Game.Message', () => {
  const s = scene('Tutorial1.lvl');
  for (let i = 0; i < 1000; i++) s.updateLevel(1);
  const text = s.messages.map((m) => m.text).join('\n');
  assert.match(text, /user interface|strawberr|Tutorial|bike/i);
});

test('replays: the 44-byte state and the format 1 file round-trip, events included', () => {
  const s = scene('i01.lvl');
  const rec = new ReplayRecorder(s.level.id, 'Tester');
  s.recorder = rec;
  for (let i = 0; i < 600; i++) s.updateLevel(1);
  assert.ok(!s.player.isDead());
  rec.event({ type: 9, time: 123, s: 'hello', n: [] });
  rec.event({ type: 23, time: 200, s: 'Block1', n: [1.5, -2, 300, 0, 0] });
  rec.finish(true, s.time, encodeState(s.player.state, s.time, PHYS));
  const file = parseReplay(rec.toFile());
  assert.equal(file.version, 1);
  assert.equal(file.levelId, s.level.id);
  assert.equal(file.player, 'Tester');
  assert.equal(file.frameRate, 25);
  assert.ok(file.finished);
  assert.equal(file.finishTime, 600);
  assert.equal(file.states.length, 600 / 4 + 1);
  assert.deepEqual(file.events.map((e) => [e.type, e.time, e.s]), [[9, 123, 'hello'], [23, 200, 'Block1']]);
  assert.deepEqual(file.events[1].n, [1.5, -2, 300, 0, 0]);
  const last = decodeState(file.states[file.states.length - 1], PHYS);
  assert.equal(last.GameTime, 600);
  assert.equal(last.Dir, DD_RIGHT);
  assert.equal(last.CenterP.x, s.player.state.CenterP.x);
  assert.ok(Math.abs(last.FrontWheelP.x - s.player.state.FrontWheelP.x) < 0.02);
  assert.ok(Math.abs(last.KneeP.y - s.player.state.KneeP.y) < 0.02);
});

test('times as the original writes them', () => {
  assert.equal(formatTime(6543), '01:05:43');
  assert.equal(floatToTime(timeToFloat(100)), 100);
  assert.equal(floatToTime(timeToFloat(12345)), 12345);
});

test('the Classic theme names every file the levels and the bike use', () => {
  const theme = new Theme(readFileSync(new URL('../assets/Themes/original.xml', import.meta.url), 'utf8'));
  for (const n of ['PlayerBikerBody', 'PlayerBikerWheel', 'PlayerTorso']) assert.ok(theme.biker.get(n), n);
  for (const n of ['Strawberry', 'Flower', 'Wrecker', 'Checkpoint_0']) assert.ok(theme.anims.get(n)?.frames.length, n);
  assert.ok(theme.texture('default'));
  assert.ok(theme.edges.get('Grass'));
  assert.equal(theme.sounds.get('PickUpStrawberry'), 'Textures/Sounds/PickUpStrawberry.ogg');
  for (const f of [...theme.biker.values(), theme.texture('sky1')!, ...theme.anims.get('Strawberry')!.frames.map((x) => x.file)]) {
    assert.ok(readFileSync(new URL(`../assets/${f}`, import.meta.url)).length > 0, f);
  }
  void v2;
});
