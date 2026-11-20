// Mutations: mutation-data.h weights/levels/messages and the original stat effects.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/game/rng.ts';
import { createPlayer, strength, intelligence, dexterity } from '../src/game/player.ts';
import { JOBS_BY_NAME, MUTATIONS, SPECIES_BY_NAME } from '../src/game/data.ts';
import { MUTATION_BY_ID, mutate, quaffMutationPotion, removeMutation } from '../src/game/mutation.ts';

test('the mutation table is mutation-data.h', () => {
  assert.equal(MUTATIONS.length, 213);
  const strong = MUTATION_BY_ID.get('MUT_STRONG')!;
  assert.equal(strong.weight, 7);
  assert.equal(strong.levels, 2);
  assert.equal(strong.flags.includes('good'), true);
  const frail = MUTATION_BY_ID.get('MUT_FRAIL')!;
  assert.equal(frail.weight, 10);
  assert.equal(frail.levels, 3);
  assert.equal(frail.flags.includes('bad'), true);
});

test('mutate raises a level and caps at the defined levels', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  const r = new Rng(7n);
  let seen = 0;
  for (let i = 0; i < 400; i++) {
    const m = mutate(p, r);
    if (m) seen++;
  }
  assert.ok(seen > 20, String(seen));
  for (const [id, lvl] of Object.entries(p.mutations)) {
    assert.ok(lvl <= (MUTATION_BY_ID.get(id)?.levels ?? 0), `${id} ${lvl}`);
  }
});

test('strong/clever/agile change stats as mutation-data.h says', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  const [str, int, dex] = [p.baseStats[0], p.baseStats[1], p.baseStats[2]];
  p.mutations.MUT_STRONG = 1;
  // +4 Str, -1 Int, -1 Dex.
  assert.equal(strength(p), str + 4);
  assert.equal(intelligence(p), int - 1);
  assert.equal(dexterity(p), dex - 1);
  p.mutations.MUT_CLEVER = 2;
  // +8 Int, -2 Str, -2 Dex on top of strong's -1.
  assert.equal(intelligence(p), int - 1 + 8);
  assert.equal(strength(p), str + 4 - 2);
  assert.equal(dexterity(p), dex - 1 - 2);
});

test('removing a mutation lowers its level', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  p.mutations.MUT_TOUGH_SKIN = 3;
  assert.equal(removeMutation(p, 'MUT_TOUGH_SKIN'), true);
  assert.equal(p.mutations.MUT_TOUGH_SKIN, 2);
  removeMutation(p, 'MUT_TOUGH_SKIN');
  removeMutation(p, 'MUT_TOUGH_SKIN');
  assert.equal(p.mutations.MUT_TOUGH_SKIN, undefined);
});

test('a potion of mutation removes 2-3 and adds 1-3 plus a good one', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  p.mutations.MUT_STRONG = 2;
  p.mutations.MUT_CLEVER = 2;
  p.mutations.MUT_TOUGH_SKIN = 3;
  const r = new Rng(7n);
  const messages = quaffMutationPotion(p, r);
  assert.ok(messages.length >= 2);
  assert.equal(messages[0], 'You feel extremely strange.');
  assert.ok(Object.keys(p.mutations).length >= 1);
});
