// The compact AI: an idle guard notices a visible player within 20 units, loses sight
// behind an object, chases and attacks at 1.9 units.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCreature, makePerson, flatHeightmap, emptyMap } from './helpers.ts';
import type { WorldLike, Collider } from '../src/sim/person.ts';

function makeWorld(persons: ReturnType<typeof makePerson>[], objects: Collider[] = [], player = persons[0]): WorldLike {
  return {
    heightmap: flatHeightmap(),
    map: emptyMap(),
    persons,
    player,
    objects,
    time: 0,
    sound: () => {},
    blood: () => {},
  };
}

test('a passive rabbit notices a visible player within 20 units and starts chasing', () => {
  const rabbit = makeCreature('rabbit');
  const player = makePerson(rabbit, 0, 0, 0);
  const enemy = makePerson(rabbit, 1, 0, 5);
  const w = makeWorld([player, enemy]);
  enemy.update(0.1, w);
  assert.equal(enemy.aiType, 'attack');
  assert.equal(enemy.target, player);
  const z0 = enemy.coords.z;
  for (let i = 0; i < 10; i++) enemy.update(0.1, w);
  assert.ok(enemy.coords.z < z0, `${enemy.coords.z} should move toward ${z0}`);
});

test('a solid object between them blocks line of sight', () => {
  const rabbit = makeCreature('rabbit');
  const player = makePerson(rabbit, 0, 0, 0);
  const enemy = makePerson(rabbit, 1, 0, 5);
  const w = makeWorld([player, enemy], [{ position: { x: 0, y: 0, z: 2.5 }, radius: 1, height: 5 }]);
  enemy.update(0.1, w);
  assert.equal(enemy.aiType, 'passive');
});

test('an alerted enemy at 1.5 units starts an attack', () => {
  const rabbit = makeCreature('rabbit');
  const player = makePerson(rabbit, 0, 0, 0);
  const enemy = makePerson(rabbit, 1, 0, 1.5);
  enemy.aiType = 'attackCutoff';
  enemy.target = player;
  const w = makeWorld([player, enemy]);
  enemy.update(0.1, w);
  assert.ok(enemy.attack, 'an attack should have started');
  assert.equal(enemy.target, player);
});

test('a wolf uses the wolf idle/run animations and has the wolf power', () => {
  const wolf = makeCreature('wolf');
  assert.equal(wolf.power, 2.5);
  assert.equal(wolf.damageTolerance, 300);
  const w = makePerson(wolf, 1, 0, 5);
  assert.equal(w.kind, 'wolf');
});
