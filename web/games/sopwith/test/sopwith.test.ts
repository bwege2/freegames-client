// Sopwith's original data, the `.sop` mission parser and the flight/combat
// simulation, checked against the constants and formulas in the C source.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPRITES } from '../src/video.ts';
import { FONT_DATA } from '../src/assets/font.ts';
import { ORIGINAL_GROUND, ORIGINAL_OBJECTS } from '../src/assets/level.ts';
import { MISSION_FILES, buildMissions, missionFromSop } from '../src/mission.ts';
import {
  SopwithGame, K_ACCEL, K_FLAPU, K_SHOT, K_BOMB, MAXCRASH, MAX_Y,
  range, isrange,
} from '../src/sim.ts';

function missionFiles(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const f of MISSION_FILES) {
    files[f.file] = readFileSync(new URL(`../assets/maps/${f.file}`, import.meta.url), 'utf8');
  }
  return files;
}

test('the original sprite and font data were extracted', () => {
  assert.equal(SPRITES.plane[0].sym[0].w, 16);
  assert.equal(SPRITES.plane[0].sym[0].h, 16);
  assert.ok(SPRITES.plane[0].sym[0].data.some((v) => v !== 0));
  assert.equal(SPRITES.target.length, 20);
  assert.equal(SPRITES.debris.length, 8);
  assert.equal(SPRITES.medal[0].sym[0].w, 8);
  assert.equal(FONT_DATA.length, 2048);
  assert.equal(ORIGINAL_GROUND.length, 3000);
  assert.equal(ORIGINAL_OBJECTS.filter((o) => o.type === 'TARGET').length, 20);
  assert.equal(ORIGINAL_OBJECTS.filter((o) => o.type === 'PLANE').length, 8);
});

test('the .sop files parse: all seven missions and their overrides', () => {
  const missions = buildMissions(missionFiles());
  assert.deepEqual(missions.map((m) => m.id), MISSION_FILES.map((m) => m.id));
  const original = missions[0];
  assert.equal(original.ground.length, 3000);
  assert.equal(original.objects.length, 34);
  assert.equal(original.objects.filter((o) => o.type === 'TARGET').length, 20);
  assert.equal(original.objects.filter((o) => o.type === 'PLANE').length, 8);
  assert.equal(original.objects.filter((o) => o.type === 'FLOCK').length, 4);
  assert.equal(original.objects.filter((o) => o.type === 'OX').length, 2);
  assert.equal(original.sprites.target[3].sym[0].w, 16);
  assert.equal(original.tune?.length, 211);
  // original.sop and the C arrays in swgames.c describe the same level
  assert.deepEqual(Array.from(original.ground), Array.from(ORIGINAL_GROUND));
  assert.deepEqual(original.objects.map((o) => [o.type, o.x, o.orient, o.faction, o.territoryL, o.territoryR,
    (o.transform ?? 'TRANSFORM_NONE')]), ORIGINAL_OBJECTS.map((o) => [o.type, o.x, o.orient, o.faction,
    o.territoryL, o.territoryR, (o.transform ?? 'TRANSFORM_NONE')]));
  const empty = missions.find((m) => m.id === 'empty')!;
  assert.equal(empty.ground.length, 528);
  assert.equal(empty.objects.length, 1);
  const wide = missions.find((m) => m.id === 'tank_strike')!;
  assert.equal(wide.ground.length, 4538);
  assert.equal(wide.objects.length, 14);
  const triplane = missions.find((m) => m.id === 'triplane')!;
  assert.equal(triplane.hasLevel, false);
  assert.equal(triplane.ground.length, 3000);
  assert.equal(triplane.tune, original.tune);
  assert.notDeepEqual(triplane.sprites.plane[0].sym[0].data, original.sprites.plane[0].sym[0].data);
});

test('the Yocton reader handles string chunks, comments and enum values', () => {
  const m = missionFromSop(`
    // a tiny mission
    level {
      object { type: PLANE x: 100 faction: PLAYER1 orient: 0 }
      object { type: TARGET x: 300 orient: 18 faction: PLAYER2 transform: MIRROR }
      ground { _: 64 _: 64 _: 64 }
    }
    symbols { swplnsym { 0: "                                \\n"& "                                \\n" } }
  `, 'tiny', 'tiny');
  assert.equal(m.objects.length, 2);
  assert.equal(m.objects[1].type, 'TARGET');
  assert.equal(m.objects[1].transform, 'TRANSFORM_MIRROR');
  assert.equal(m.ground.length, 321);
  assert.equal(m.sprites.plane[0].sym[0].h, 2);
});

test('the plane starts on the runway, taxis, climbs and fires', () => {
  const missions = buildMissions(missionFiles());
  const g = new SopwithGame('expert', missions[0]);
  const p = g.players[0];
  assert.equal(p.x, 1270);
  assert.equal(p.y, 77);
  assert.equal(p.state, 'flying');
  assert.equal(p.athome, true);
  for (let i = 0; i < 10; i++) g.step([K_ACCEL]);
  assert.ok(p.x > 1270, `taxied to ${p.x}`);
  assert.equal(p.athome, false);
  for (let i = 0; i < 10; i++) g.step([K_ACCEL | K_FLAPU]);
  assert.ok(p.y > 77, `climbed to ${p.y}`);
  const before = p.rounds;
  g.step([K_ACCEL | K_SHOT]);
  assert.ok(p.rounds < before);
  assert.ok(g.objects.some((o) => o.type === 'shot'));
});

test('the versus-computer game has the original enemy planes and AI', () => {
  const missions = buildMissions(missionFiles());
  const g = new SopwithGame('computer', missions[0]);
  assert.equal(g.players.length, 1);
  assert.equal(g.planes.length, 8);
  assert.ok(g.planes.filter((p) => p.isComputer).length >= 7);
  const ai = g.planes.find((p) => p.isComputer)!;
  const human = g.players[0];
  human.x = 1000; human.y = 120; human.athome = false;
  const x0 = ai.x;
  for (let i = 0; i < 100; i++) g.step([0]);
  assert.notEqual(ai.x, x0);
  assert.equal(Number.isFinite(ai.x), true);
});

test('local and online games seat two humans', () => {
  const missions = buildMissions(missionFiles());
  const local = new SopwithGame('local', missions[0]);
  assert.equal(local.players.length, 2);
  assert.equal(local.humanSeats, 2);
  assert.notEqual(local.players[0].plrnum, local.players[1].plrnum);
  const online = new SopwithGame('online', missions[0]);
  assert.equal(online.players.length, 2);
});

test('five crashes end a single-player game', () => {
  const missions = buildMissions(missionFiles());
  const g = new SopwithGame('expert', missions[0]);
  const p = g.players[0];
  for (let n = 0; n < MAXCRASH; n++) {
    p.state = 'crashed';
    p.hitcount = 0;
    p.athome = false;
    g.step([]);
  }
  assert.equal(p.crashcnt, MAXCRASH);
  assert.equal(p.endstatus, 'loser');
  for (let n = 0; n < 25; n++) g.step([]);
  assert.equal(g.over, 'lose');
});

test('target ownership follows AddPlayerTarget', () => {
  const missions = buildMissions(missionFiles());
  const g = new SopwithGame('novice', missions[0]);
  assert.equal(g.numtarg[1], 3);
  assert.equal(g.numtarg[2], 17);
  assert.equal(g.numtarg[0], 0);
});

test('destroying every enemy target wins the mission', () => {
  const missions = buildMissions(missionFiles());
  const g = new SopwithGame('novice', missions[0]);
  const kill = (g as unknown as { swKill: (t: unknown, by: unknown, colls: unknown[]) => void }).swKill.bind(g);
  for (const t of g.objects.filter((o) => o.type === 'target' && o.faction === 2)) kill(t, null, []);
  assert.equal(g.numtarg[2], 0);
  assert.equal(g.players[0].endstatus, 'winner');
  for (let i = 0; i < 80; i++) g.step([]);
  assert.equal(g.over, 'win');
  assert.equal(g.winnerSeat, 0);
  g.awardWinner();
  assert.ok(g.players[0].ribbons.includes(2));
});

test('range and isrange match swauto.c', () => {
  assert.equal(range(0, 0, 100, 0), 10000);
  assert.equal(range(0, 0, 200, 0), -175);
  assert.equal(isrange(0, 0, 50, 0), 43);
  assert.equal(isrange(0, 0, 200, 0), -1);
});

test('the mission plane can drop bombs and the ground can be cratered', () => {
  const missions = buildMissions(missionFiles());
  const g = new SopwithGame('expert', missions[0]);
  const p = g.players[0];
  p.y = 120; p.x = 1270; p.angle = 0; p.speed = 6; p.athome = false;
  const bombs = p.bombs;
  g.step([K_BOMB | K_ACCEL]);
  assert.ok(p.bombs <= bombs);
  assert.ok(g.objects.some((o) => o.type === 'bomb'));
});

test('the computer pilot is deterministic for the same seed and inputs', () => {
  const missions = buildMissions(missionFiles());
  const a = new SopwithGame('computer', missions[0], { seed: 123 });
  const b = new SopwithGame('computer', missions[0], { seed: 123 });
  for (let i = 0; i < 200; i++) { a.step([0]); b.step([0]); }
  assert.deepEqual(a.planes.map((p) => [Math.round(p.x), Math.round(p.y), p.state]),
    b.planes.map((p) => [Math.round(p.x), Math.round(p.y), p.state]));
  assert.ok(a.objects.every((o) => o.x >= 0 && o.x < missions[0].ground.length));
  assert.ok(a.planes.every((p) => p.y <= MAX_Y + 50));
});
