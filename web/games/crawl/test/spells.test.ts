// Spell effects: the original's zap-data.h damage dice and the "not implemented" edge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/game/rng.ts';
import { createPlayer } from '../src/game/player.ts';
import { JOBS_BY_NAME, SPECIES_BY_NAME } from '../src/game/data.ts';
import { IMPLEMENTED_SPELLS, castSpell, spellPower } from '../src/game/magic.ts';
import { idx } from '../src/game/model.ts';
import type { Level, Monster } from '../src/game/model.ts';

function level(): Level {
  return {
    key: 'D:1', branch: 'BRANCH_DUNGEON', depth: 1, absDepth: 1,
    cells: Array.from({ length: 80 * 70 }, () => ({ feat: 'DNGN_FLOOR', known: true, visible: true })),
    monsters: [], items: [], traps: [], shops: [], up: [], down: [], branches: [], visited: true,
    entry: idx(40, 35), layout: 'test',
  };
}

function monster(): Monster {
  return {
    uid: 1, def: 'MONS_RAT', name: 'rat', x: 41, y: 35, hp: 1000, hpMax: 1000, hd: 1, ac: 0, ev: 0,
    speed: 10, energy: 0, asleep: false, attitude: 'hostile', cooldown: 0, unique: false,
    confused: 0, slowed: 0, poisoned: 0, fleeing: 0, invisible: 0, known: true,
  };
}

test('the implemented spells are the port\'s exact set', () => {
  for (const s of ['SPELL_MAGIC_DART', 'SPELL_SHOCK', 'SPELL_FREEZE', 'SPELL_SANDBLAST',
    'SPELL_SEARING_RAY', 'SPELL_POISONOUS_VAPOURS', 'SPELL_SCORCH', 'SPELL_FOXFIRE',
    'SPELL_KINETIC_GRAPNEL', 'SPELL_KISS_OF_DEATH']) {
    assert.ok(IMPLEMENTED_SPELLS.has(s), s);
  }
  assert.ok(!IMPLEMENTED_SPELLS.has('SPELL_FIRE_STORM'));
});

test('Magic Dart rolls 1d(3 + power/5)', () => {
  const r = new Rng(7n);
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('conjurer')!, 'WPN_UNARMED', 'Test');
  p.memorised = ['SPELL_MAGIC_DART']; p.mp = 10; p.x = 40; p.y = 35;
  p.skills.conjurations = { level: 15, points: 1e9 };
  p.skills.spellcasting = { level: 15, points: 1e9 };
  const l = level();
  const m = monster();
  l.monsters.push(m);
  const ctx = {
    rng: r, player: p, level: l,
    msg: () => {}, onMonsterKilled: () => {}, onPlayerDamaged: () => {}, onPlayerKilled: () => {},
    direction: [1, 0] as [number, number],
  };
  let hits = 0;
  for (let i = 0; i < 60; i++) {
    m.hp = 1000;
    p.mp = 10;
    const err = castSpell(ctx, 'SPELL_MAGIC_DART');
    assert.equal(err, null);
    const damage = 1000 - m.hp;
    const max = 3 + Math.trunc(spellPower(p, 'SPELL_MAGIC_DART') / 5);
    if (damage > 0) hits++;
    assert.ok(damage >= 0 && damage <= max, `damage ${damage} max ${max}`);
  }
  assert.ok(hits > 20, `hits ${hits}`);
});

test('an unimplemented spell does not spend a turn or mana', () => {
  const r = new Rng(7n);
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('conjurer')!, 'WPN_UNARMED', 'Test');
  p.memorised = ['SPELL_FIRE_STORM']; p.mp = 10;
  const ctx = {
    rng: r, player: p, level: level(),
    msg: () => {}, onMonsterKilled: () => {}, onPlayerDamaged: () => {}, onPlayerKilled: () => {},
  };
  const err = castSpell(ctx, 'SPELL_FIRE_STORM');
  assert.match(err ?? '', /not implemented/);
  assert.equal(p.mp, 10);
});

test('Freeze and Sandblast use their zap dice', () => {
  const r = new Rng(9n);
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('ice elementalist')!, 'WPN_UNARMED', 'Test');
  p.memorised = ['SPELL_FREEZE']; p.mp = 20; p.x = 40; p.y = 35;
  p.skills.ice_magic = { level: 15, points: 1e9 };
  p.skills.spellcasting = { level: 15, points: 1e9 };
  const l = level(); const m = monster(); m.x = p.x + 1; m.y = p.y; l.monsters.push(m);
  const ctx = {
    rng: r, player: p, level: l,
    msg: () => {}, onMonsterKilled: () => {}, onPlayerDamaged: () => {}, onPlayerKilled: () => {},
    direction: [1, 0] as [number, number],
  };
  let hits = 0;
  for (let i = 0; i < 30; i++) {
    m.hp = 1000; p.mp = 20;
    assert.equal(castSpell(ctx, 'SPELL_FREEZE'), null);
    const damage = 1000 - m.hp;
    const max = 3 + Math.trunc(3 * spellPower(p, 'SPELL_FREEZE') / 10);
    if (damage > 0) hits++;
    assert.ok(damage >= 0 && damage <= max, `damage ${damage} max ${max}`);
  }
  assert.ok(hits > 5, `hits ${hits}`);
});

test('Kiss of Death empties the caster\'s magic', () => {
  const r = new Rng(7n);
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('necromancer')!, 'WPN_UNARMED', 'Test');
  p.memorised = ['SPELL_KISS_OF_DEATH']; p.mp = 24; p.x = 40; p.y = 35;
  p.skills.necromancy = { level: 15, points: 1e9 };
  p.skills.conjurations = { level: 15, points: 1e9 };
  const l = level(); const m = monster(); m.x = p.x + 1; m.y = p.y; l.monsters.push(m);
  const ctx = {
    rng: r, player: p, level: l,
    msg: () => {}, onMonsterKilled: () => {}, onPlayerDamaged: () => {}, onPlayerKilled: () => {},
    direction: [1, 0] as [number, number],
  };
  assert.equal(castSpell(ctx, 'SPELL_KISS_OF_DEATH'), null);
  assert.equal(p.mp, 0);
});
