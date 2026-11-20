// The data converted from DCSS 0.34.1: counts and spot checks against the original's headers and YAML.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SPECIES, JOBS, MONSTERS, SPELLS, WEAPONS, ARMOUR, SKILLS, POPULATION, PLAYABLE,
  MONSTER_BY_NAME, SPELL_BY_ID, WEAPON_BY_NAME, ARMOUR_BY_NAME,
} from '../src/game/data.ts';

test('the data of 0.34.1 is there', () => {
  assert.equal(SPECIES.length, 35);
  assert.equal(JOBS.length, 26);
  assert.equal(MONSTERS.length, 671);
  assert.ok(SPELLS.length >= 390);
  assert.ok(WEAPONS.length >= 50);
  assert.ok(ARMOUR.length >= 20);
  assert.equal(SKILLS.length, 29);
  assert.ok(PLAYABLE.combos.length > 650);
});

test('species: the original stats and aptitudes', () => {
  const human = SPECIES.find((s) => s.name === 'Human')!;
  assert.deepEqual(human.stats, [8, 8, 8]);
  assert.deepEqual(human.mods, { xp: 0, hp: 0, mp: 0, wl: 3 });
  assert.equal(human.apt.fighting ?? 0, 0);
  assert.equal(human.apt.ranged_weapons ?? 0, 0);
  const mino = SPECIES.find((s) => s.name === 'Minotaur')!;
  assert.deepEqual(mino.stats, [12, 5, 5]);
  assert.equal(mino.mods.hp, 1);
  assert.equal(mino.apt.fighting, 2);
  const felid = SPECIES.find((s) => s.name === 'Felid')!;
  assert.equal(felid.apt.armour, -99); // False in dat/species/felid.yaml: UNUSABLE_SKILL
});

test('backgrounds: the original starting kits and spells', () => {
  const fighter = JOBS.find((j) => j.name === 'Fighter')!;
  assert.deepEqual(fighter.stats, [8, 0, 4]);
  assert.deepEqual(fighter.skills, { fighting: 3, armour: 3, shields: 3, weapon: 2 });
  assert.equal(fighter.weaponChoice, 'good');
  const conjurer = JOBS.find((j) => j.name === 'Conjurer')!;
  assert.deepEqual(conjurer.spells, ['SPELL_MAGIC_DART', 'SPELL_SEARING_RAY', 'SPELL_FULMINANT_PRISM', 'SPELL_ISKENDERUNS_MYSTIC_BLAST']);
  assert.ok(conjurer.description.includes('Conjurers'));
});

test('monsters: monster-data values', () => {
  const rat = MONSTER_BY_NAME.get('rat')!;
  assert.equal(rat.glyph, 'r');
  assert.equal(rat.hd, 1);
  assert.equal(rat.hp, 2.5);
  assert.equal(rat.ac, 1);
  assert.equal(rat.ev, 10);
  assert.equal(rat.exp, 1);
  assert.deepEqual(rat.attacks, [{ type: 'bite', damage: 3 }]);
  const wolf = MONSTER_BY_NAME.get('wolf')!;
  assert.equal(wolf.speed, 17);
  assert.equal(wolf.genus, 'hound');
  const sigmund = MONSTER_BY_NAME.get('sigmund')!;
  assert.equal(sigmund.unique, true);
  assert.ok(sigmund.spellList.length > 0);
  assert.ok(sigmund.spellList.some((s) => s.spell === 'SPELL_MAGIC_DART'));
});

test('items: weapon and armour numbers', () => {
  const longSword = WEAPON_BY_NAME.get('long sword')!;
  assert.equal(longSword.damage, 10);
  assert.equal(longSword.hit, 1);
  assert.equal(longSword.speed, 14);
  const scale = ARMOUR_BY_NAME.get('scale mail')!;
  assert.equal(scale.ac, 6);
  assert.equal(scale.ev, -100);
  assert.equal(scale.slot, 'SLOT_BODY_ARMOUR');
  const animal = ARMOUR_BY_NAME.get('animal skin')!;
  assert.equal(animal.ac, 2);
});

test('spells: spl-data.h', () => {
  const dart = SPELL_BY_ID.get('SPELL_MAGIC_DART')!;
  assert.equal(dart.name, 'Magic Dart');
  assert.deepEqual(dart.schools, ['conjuration']);
  assert.equal(dart.level, 1);
  assert.equal(dart.rangeMax, 8);
  const fireball = SPELL_BY_ID.get('SPELL_FIREBALL')!;
  assert.equal(fireball.level, 5);
  assert.deepEqual(fireball.schools, ['conjuration', 'fire']);
});

test('the Dungeon population is the original table', () => {
  const dungeon = POPULATION.dungeon;
  assert.ok(dungeon.length > 100);
  const rat = dungeon.find((e) => e.mons === 'MONS_RAT');
  assert.deepEqual(rat, { min: 1, max: 3, weight: 1000, type: 'FLAT', mons: 'MONS_RAT' });
  const ogre = dungeon.find((e) => e.mons === 'MONS_OGRE');
  assert.equal(ogre?.min, 4);
  assert.equal(ogre?.max, 7);
});
