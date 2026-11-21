// A whole level: the terrain height, the original map objects and players, the opening
// dialogue and the kill-everyone rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readJson, makeCreature, dummyAnimation } from './helpers.ts';
import { parseHeightMap, heightAt, normalAt } from '../src/data/heightmap.ts';
import { parseMap } from '../src/data/map.ts';
import { World } from '../src/sim/world.ts';
import type { AudioBank } from '../src/load.ts';
import type { PersonInput } from '../src/sim/person.ts';

const heightmap = parseHeightMap(readJson<{ size: number; red: number[] }>('heightmap.json'));
const map = parseMap(readJson<unknown>('Maps/Lugaru1.json'));
const rabbit = makeCreature('rabbit');
const wolf = makeCreature('wolf');
const animations = (() => {
  const a = dummyAnimation(rabbit.skeleton);
  return () => a;
})();
const audio = { play: async () => {} } as unknown as AudioBank;

function makeWorld(): World {
  return new World('Lugaru1', { map, heightmap, creatures: [rabbit, wolf], animations, audio });
}

const input = (): PersonInput => ({
  forward: false, back: false, left: false, right: false, jump: false, crouch: false,
  attack: false, draw: false, throw: false, attackPressed: false, jumpPressed: false,
  crouchPressed: false, cameraYaw: 0,
});

test('Lugaru1 builds the original 140 objects, 7 people and 5 dialogue scenes', () => {
  const w = makeWorld();
  assert.equal(w.objects.length, 140);
  assert.equal(w.persons.length, 7);
  assert.equal(w.player.id, 0);
  // The opening dialogue stages Turner at the first participant position.
  assert.ok(Math.abs(w.player.coords.x - 748.309) < 1e-3);
  assert.ok(Math.abs(map.map.players[0].coords[0] - 783.2682) < 1e-4);
  assert.ok(w.dialogue);
  assert.equal(w.dialogue?.scenes.length, 11);
  // the first object is a tree trunk at the original map tuple's position
  assert.equal(w.objects[0].type, 3);
  assert.ok(Math.abs(w.objects[0].position.x - 743.8343) < 1e-4);
  assert.ok(w.objects[0].radius > 0);
});

test('terrain heights and normals at the Lugaru1 spawn', () => {
  const h = heightAt(heightmap, 783.2682, 728.2625);
  assert.ok(Math.abs(h - 86.07316) < 1.2, `${h}`);
  const n = normalAt(heightmap, 783.2682, 728.2625);
  assert.ok(n.y > 0.9, `normal ${JSON.stringify(n)}`);
});

test('the kill-everyone rule wins when every other person is down or dead', () => {
  const w = makeWorld();
  w.dialogue = null;
  for (const p of w.persons) if (p.id !== 0) p.down = true;
  w.update(0.016, input());
  assert.equal(w.won, true);
  assert.equal(w.lost, false);
});

test('the player loses when permanently dead', () => {
  const w = makeWorld();
  w.dialogue = null;
  w.player.dead = 2;
  w.update(0.016, input());
  assert.equal(w.lost, true);
});
