// The pinned Lugaru data as the port reads it: skeleton, model, animation, heightmap,
// map and campaign. These are checks against the original files, not against the port itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asset, readJson, rabbitSkeleton } from './helpers.ts';
import { parseSolid } from '../src/data/model.ts';
import { parseAnimation } from '../src/data/animation.ts';
import { parseHeightMap, heightAt } from '../src/data/heightmap.ts';
import { parseMap } from '../src/data/map.ts';
import { parseCampaign } from '../src/data/campaign.ts';

test('BasicFigure has the original 20 joints and 45 muscles', () => {
  const sk = rabbitSkeleton();
  assert.equal(sk.joints.length, 20);
  assert.equal(sk.muscles.length, 45);
  assert.deepEqual(sk.forwardJoints, [11, 10, 9]);
  assert.deepEqual(sk.lowForwardJoints, [4, 3, 9]);
  // bodypart labels from Joint.hpp
  assert.equal(sk.joints[0].label, 0); // head
  assert.equal(sk.joints[9].label, 10); // abdomen
  assert.equal(sk.joints[18].label, 1); // neck
  assert.ok(Math.abs(sk.joints[0].position.y - 8.802938) < 1e-4);
  for (const j of sk.joints) assert.equal(j.hasParent, false);
});

test('Body.solid is the original 463-vertex, 904-triangle mesh with valid indices', () => {
  const model = parseSolid(asset('Models/Body.solid'));
  assert.equal(model.vertices.length, 463);
  assert.equal(model.triangles.length, 904);
  for (const t of model.triangles) {
    assert.ok(t.a >= 0 && t.a < 463);
    assert.ok(t.b >= 0 && t.b < 463);
    assert.ok(t.c >= 0 && t.c < 463);
    assert.ok(t.ua >= 0 && t.ua <= 1 && t.va >= 0 && t.va <= 1);
  }
});

test('Idle and Upunch keep the original frame counts, labels and speeds', () => {
  const idle = parseAnimation(asset('Animations/Idle'));
  assert.equal(idle.frames.length, 16);
  assert.equal(idle.numJoints, 20);
  assert.equal(idle.frames[0].label, 0);
  assert.ok(Math.abs(idle.frames[0].speed - 3.856961) < 1e-4);
  const upunch = parseAnimation(asset('Animations/Upunch'));
  assert.equal(upunch.frames.length, 7);
  assert.deepEqual(upunch.frames.map((f) => f.label), [0, 0, 4, 0, 5, 0, 0]);
  assert.ok(Math.abs(upunch.frames[4].speed - 8.0) < 1e-2);
});

test('heightmap.json has the original 256x256 red values and terrain heights', () => {
  const hm = parseHeightMap(readJson<{ size: number; red: number[] }>('heightmap.json'));
  assert.equal(hm.size, 256);
  assert.equal(hm.red.length, 256 * 256);
  assert.ok(Math.min(...hm.red) >= 0);
  assert.ok(Math.max(...hm.red) <= 255);
  // Turner's Lugaru1 spawn: (783.2682, 86.07316, 728.2625). The original terrain is
  // heightmap * 6, with heightmap = red / 10, i.e. red * 0.6.
  const h = heightAt(hm, 783.2682, 728.2625);
  assert.ok(Math.abs(h - 86.07316) < 1.2, `height ${h}`);
});

test('Lugaru1.json has the original 140 objects, 7 players and dialogue', () => {
  const map = parseMap(readJson<unknown>('Maps/Lugaru1.json'));
  assert.equal(map.map.environment, 1);
  assert.equal(map.map.hostile, 0);
  assert.equal(map.map.objects.length, 140);
  assert.equal(map.map.players.length, 7);
  assert.equal(map.map.dialogs?.length, 5);
  // Object::Object(Json) tuple: [type, yaw, pitch, scale, [x, y, z]]
  assert.deepEqual(map.map.objects[0], [3, 0, 0, 1.024835, [743.8343, 77.87482, 689.3736]]);
  assert.equal(map.map.players[0].coords[0], 783.2682);
  assert.equal(map.map.players[0].creature, 0);
  assert.equal(map.map.players[1].howactive, 1);
});

test('main campaign has the original 27 levels and their next links', () => {
  const c = parseCampaign(readJson<unknown>('campaign.json'));
  assert.equal(c.levels.length, 27);
  assert.equal(c.levels[0].name, 'Lugaru1');
  assert.equal(c.levels[0].description, 'Village_-_start_campaign!');
  assert.equal(c.levels[0].nextLevel, 2);
  assert.equal(c.levels[26].name, 'Lugaru27');
  assert.equal(c.levels[26].nextLevel, 0);
  assert.match(c.endText, /avenged your family/);
  for (const level of c.levels) assert.ok(level.locationX > 0 && level.locationY > 0);
});

test('the operator-approved asset set excludes music, Temple, the OFL font and HD additions', () => {
  const manifest = readJson<{ files: { path: string }[] }>('manifest.json');
  const paths = new Set(manifest.files.map((f) => f.path));
  for (const forbidden of [
    'Sounds/Music1Desert.ogg', 'Sounds/Music1Grass.ogg', 'Sounds/Music1Snow.ogg', 'Sounds/Music2.ogg', 'Sounds/Music3.ogg',
    'Textures/ClFeng.png', 'Textures/ClHuo.png', 'Textures/ClShan.png', 'Textures/ClShui.png',
    'Textures/FontMono.png', 'Textures/temple/World.png', 'Textures/empire/World.png',
    'Maps/svenalpha.json', 'Maps/jendraz1.json', 'Maps/task1.json',
  ]) {
    assert.ok(!paths.has(forbidden), `${forbidden} must not be shipped`);
  }
  for (const needed of [
    'Models/Body.solid', 'Models/Wolf.solid', 'Skeleton/BasicFigure', 'Skeleton/BasicFigureWolf',
    'Animations/Idle', 'Animations/Upunch', 'Textures/GrassDirt.jpg', 'Textures/Tree.png',
    'Sounds/HeavyImpact.ogg', 'Maps/Lugaru1.json', 'Campaigns/main.txt', 'Dialogues/turner.txt',
  ]) {
    assert.ok(paths.has(needed), `${needed} is missing`);
  }
  // 110 loadable animation ids, 109 distinct files: frontflipanim reuses Flip.
  assert.equal(manifest.files.filter((f) => f.path.startsWith('Animations/')).length, 109);
});
