// The combat numbers from Source/Objects/Person.cpp: the attack table, range/height tests,
// destruction (down, then dead) and the crouch reversal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeCreature, makePerson, emptyMap, flatHeightmap } from './helpers.ts';
import { ATTACKS, attackDamage, heightMatches, inAttackRange } from '../src/sim/combat.ts';
import type { WorldLike } from '../src/sim/person.ts';

const world = (persons: ReturnType<typeof makePerson>[], player = persons[0]): WorldLike => ({
  heightmap: flatHeightmap(),
  map: emptyMap(),
  persons,
  player,
  objects: [],
  time: 0,
  sound: () => {},
  blood: () => {},
});

test('attack damage follows power / tolerance / protection', () => {
  const rabbit = makeCreature('rabbit');
  const wolf = makeCreature('wolf');
  const a = makePerson(rabbit, 0, 0, 0);
  const b = makePerson(rabbit, 1, 0, -1);
  assert.equal(attackDamage(a, b, ATTACKS.punch), 60);
  assert.equal(attackDamage(a, b, ATTACKS.spinKick), 100);
  assert.equal(attackDamage(a, b, ATTACKS.sweep), 40);
  assert.equal(attackDamage(a, b, ATTACKS.swordSlash), 350);
  // a wolf's power (2.5) against a rabbit's 200 tolerance
  const w = makePerson(wolf, 2, 0, 0);
  assert.equal(attackDamage(w, b, ATTACKS.punch), 150);
  // protection divides the damage
  b.protection.head = 2;
  assert.equal(attackDamage(a, b, ATTACKS.spinKick), 50);
});

test('the original range and height rules', () => {
  const rabbit = makeCreature('rabbit');
  const a = makePerson(rabbit, 0, 0, 0);
  const b = makePerson(rabbit, 1, 0, -1.5);
  assert.equal(inAttackRange(a, b, ATTACKS.punch), true);
  assert.equal(inAttackRange(a, b, ATTACKS.punch), true);
  b.coords.z = -2.5;
  assert.equal(inAttackRange(a, b, ATTACKS.punch), false);
  b.coords.z = 1.5;
  assert.equal(inAttackRange(a, b, ATTACKS.punch), false);
  b.crouching = true;
  assert.equal(heightMatches(ATTACKS.spinKick, b), false);
  assert.equal(heightMatches(ATTACKS.sweep, b), true);
  assert.equal(heightMatches(ATTACKS.lowKick, b), true);
});

test('a knocked-down character can be finished, and permanent damage is death', () => {
  const rabbit = makeCreature('rabbit');
  const p = makePerson(rabbit, 1, 0, 0);
  p.takeDamage(250, undefined, undefined, world([p]));
  assert.equal(p.down, true);
  assert.equal(p.dead, 0);
  assert.equal(p.damage, 250);
  assert.equal(p.permanentDamage, 125);
  p.takeDamage(200, undefined, undefined, world([p]));
  assert.equal(p.dead, 2);
  assert.ok(p.permanentDamage > p.damageTolerance);
});

test('a crouching victim reverses a high attack instead of taking it', () => {
  const rabbit = makeCreature('rabbit');
  const attacker = makePerson(rabbit, 0, 0, 0);
  const victim = makePerson(rabbit, 1, 0, -1);
  victim.crouching = true;
  victim.reverse(attacker, ATTACKS.spinKick, world([attacker, victim], attacker));
  assert.ok(victim.attack);
  assert.equal(victim.attack?.kind, 'reversal');
  assert.equal(victim.target, attacker);
  assert.equal(victim.damage, 0);
  // the reversal cooldown stops a second reversal from the same crouch
  const before = victim.attack;
  victim.reverse(attacker, ATTACKS.punch, world([attacker, victim], attacker));
  assert.equal(victim.attack, before);
});
