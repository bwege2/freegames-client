// The levels of the original data running in the port: every level's scripts load and run, the same
// seed gives the same game, and undo, save/load and replay give back the positions the moves made
// (Level.cpp: action_undo/script_loadUndo of prog_save.lua, action_save/action_load, loadReplay).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ASSETS, runLevel, snapshot, type Run } from './harness.ts';
import { parseMap, type LevelNode } from '../src/engine/menus.ts';

const scripts = JSON.parse(readFileSync(join(ASSETS, 'scripts.json'), 'utf8')) as Record<string, string>;
const LEVELS = Object.keys(scripts).filter((k) => /^script\/[^/]+\/init\.lua$/.test(k)).map((k) => k.split('/')[1]).sort();

/** waits until the level takes input again (no animation phases locked, no show) */
function idle(r: Run, max = 200): void {
  for (let i = 0; i < max; i++) {
    r.cycle();
    // nothing locks the next round, nothing is acting, nothing fell or moved in the last round
    if (r.level.locker.getLocked() === 0 && !r.level.isActing() && r.level.room.isFresh()) return;
  }
}

/** a key stroke as LevelInput gets it, once the fish are not busy talking, then the cycles of the move */
function press(r: Run, key: string): void {
  for (let i = 0; i < 3000 && r.level.room.models.some((m) => m.alive && m.busy); i++) r.cycle();
  r.level.keyDown(key);
  idle(r);
  idle(r);
}

/** plays until the fish made n moves: tries the keys in a fixed order (the same game every run) */
function play(r: Run, n: number, after: () => void = () => {}): void {
  const keys = ['up', 'left', 'up', 'right', 'down', ' ', 'left', 'left', 'up', 'right'];
  for (let i = 0; i < 300 && r.level.room.controls.moves.length < n; i++) {
    press(r, keys[i % keys.length]);
    after();
  }
  assert.equal(r.level.room.controls.moves.length >= n, true, `moves: ${r.level.room.controls.moves}`);
}

test('every level of the data loads and runs 300 cycles without a script error', () => {
  assert.ok(LEVELS.length >= 80, `levels: ${LEVELS.length}`);
  for (const name of LEVELS) {
    const r = runLevel(name, { seed: 7 });
    for (let i = 0; i < 300; i++) r.cycle();
    assert.deepEqual(r.errors, [], name);
    assert.ok(r.level.room.models.length > 0, `${name} has models`);
  }
});

test('the levels in every language load', () => {
  for (const lang of ['cs', 'de', 'fr', 'ru']) {
    for (const name of ['start', 'briefcase', 'library']) {
      const r = runLevel(name, { lang });
      for (let i = 0; i < 100; i++) r.cycle();
      assert.deepEqual(r.errors, [], `${name} ${lang}`);
    }
  }
});

test('the same seed gives the same game: dialogues, sounds and positions', () => {
  const play = (seed: number) => {
    const r = runLevel('start', { seed });
    for (let i = 0; i < 600; i++) r.cycle();
    return [...r.sound.log, ...snapshot(r.level)].join('\n');
  };
  assert.equal(play(3), play(3));
});

test('the first level: its room and models as the level script makes them', () => {
  const r = runLevel('start');
  r.cycle();
  assert.equal(r.level.room.w, 29);
  assert.equal(r.level.room.h, 27);
  assert.equal(r.level.room.bg, 'images/start/prvni-p.png');
  assert.deepEqual(r.level.room.models.map((m) => `${m.loc.x},${m.loc.y},${m.weight},${m.alive}`), [
    '0,0,3,false', '7,17,1,false', '20,17,1,false', '12,18,1,false', '15,0,2,false', '8,17,1,true', '19,17,1,true', '8,18,1,false',
  ]);
});

test('moves, undo and redo give back the earlier positions', () => {
  const r = runLevel('start');
  idle(r, 400);
  const seen = new Map<number, string>();
  const record = () => seen.set(r.level.room.controls.moves.length, snapshot(r.level).join('|'));
  record();
  play(r, 8, record);
  const n = r.level.room.controls.moves.length;
  // undo one step: hold minus for one round, release
  r.level.keyDown('-');
  r.cycle();
  r.level.keyUp('-');
  idle(r);
  const m = r.level.room.controls.moves.length;
  assert.ok(m < n, `undone: ${m} < ${n}`);
  assert.equal(snapshot(r.level).join('|'), seen.get(m));
  // redo
  r.level.keyDown('+');
  r.cycle();
  r.level.keyUp('+');
  idle(r);
  assert.equal(r.level.room.controls.moves.length, n);
  assert.equal(snapshot(r.level).join('|'), seen.get(n));
});

test('save (F2) and load (F3) restore the moves and positions; the save file is the original format', () => {
  const r = runLevel('start');
  idle(r, 400);
  play(r, 6);
  const moves = r.level.room.controls.moves;
  const pos = snapshot(r.level).join('|');
  r.level.keyDown('F2');
  const save = r.env.vfs.user.get('saves/start.lua');
  assert.ok(save, 'saves/start.lua written');
  assert.match(save!, new RegExp(`^\\nsaved_moves = '${moves}'\\n\\nsaved_models = `));
  r.level.keyDown('Backspace');
  idle(r, 50);
  assert.equal(r.level.room.controls.moves, '');
  r.level.keyDown('F3');
  for (let i = 0; i < 200 && r.level.isLoading(); i++) r.cycle();
  idle(r);
  assert.equal(r.level.room.controls.moves, moves);
  assert.equal(snapshot(r.level).join('|'), pos);
});

test('a replay (Pedometer) moves the fish as the player did', () => {
  const r = runLevel('start');
  idle(r, 400);
  play(r, 10);
  const moves = r.level.room.controls.moves;
  const pos = snapshot(r.level).join('|');
  const p = runLevel('start');
  p.level.loadReplay(moves);
  for (let i = 0; i < 400 && p.level.isLoading(); i++) p.cycle();
  assert.equal(p.level.room.controls.moves, moves);
  assert.equal(snapshot(p.level).join('|'), pos);
});

test('the world map: script/worldmap.lua gives the branches; a solved level opens the next', () => {
  const r = runLevel('start');
  const all = (n: LevelNode): number => 1 + n.children.reduce((s, c) => s + all(c), 0);
  let m = parseMap(r.env, 'script/worldmap.lua');
  assert.equal(m.root.codename, 'start');
  assert.equal(all(m.root), 80);
  assert.equal(m.ending?.codename, 'ending');
  assert.deepEqual(m.root.findOpenNodes().map((n) => n.codename), ['start']);
  r.env.vfs.write('solved/start.lua', "\nsaved_moves = 'rrr'\n");
  m = parseMap(r.env, 'script/worldmap.lua');
  assert.deepEqual(m.root.findOpenNodes().map((n) => n.codename), ['briefcase']);
  assert.equal(m.root.findNamed('start')?.bestMoves, 54);
});

test('a solved level writes solved/<codename>.lua and keeps the shortest solution (LevelStatus)', () => {
  const r = runLevel('start');
  r.status.writeSolvedMoves('rrrr');
  r.status.writeSolvedMoves('rrrrrr');
  assert.equal(r.status.readSolvedMoves(), 'rrrr');
  r.status.writeSolvedMoves('rr');
  assert.equal(r.env.vfs.user.get('solved/start.lua'), "\nsaved_moves = 'rr'\n");
});
