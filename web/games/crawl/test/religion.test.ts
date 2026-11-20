// Gods: the original's piety breakpoints, ability costs, failure rates and starting piety.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ABILITIES, ABILITY_BY_ID, GODS, GOD_BY_ALTAR, MAX_PIETY, abilityAvailable, abilityFailChance,
  abilityHpCost, abilityMpCost, abilityPietyCost, gainKillPiety, gainPiety, pietyBreakpoint,
  pietyRank, startingPiety,
} from '../src/game/religion.ts';
import { createPlayer, recalc, skillExpNeeded, skillOf } from '../src/game/player.ts';
import { JOBS_BY_NAME, SPECIES_BY_NAME } from '../src/game/data.ts';
import { Rng } from '../src/game/rng.ts';

test('the six gods are the original god-type.h gods with their altars', () => {
  assert.deepEqual(GODS.map((g) => g.id), [
    'GOD_TROG', 'GOD_OKAWARU', 'GOD_MAKHLEB', 'GOD_SIF_MUNA', 'GOD_VEHUMET', 'GOD_ELYVILON',
  ]);
  assert.equal(GOD_BY_ALTAR.get('DNGN_ALTAR_TROG')?.name, 'Trog');
  assert.equal(GOD_BY_ALTAR.get('DNGN_ALTAR_ELYVILON')?.name, 'Elyvilon');
  assert.equal(GOD_BY_ALTAR.get('DNGN_ALTAR_ZIN'), undefined, 'Zin is not implemented in this round');
});

test('piety breakpoints and ranks are religion.cc', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(pietyBreakpoint), [30, 50, 75, 100, 120, 160]);
  assert.equal(pietyBreakpoint(6), 255);
  assert.equal(pietyRank(0), 0);
  assert.equal(pietyRank(29), 0);
  assert.equal(pietyRank(30), 1);
  assert.equal(pietyRank(74), 2);
  assert.equal(pietyRank(75), 3);
  assert.equal(pietyRank(160), 6);
  assert.equal(MAX_PIETY, 200);
});

test('ability tables are ability.cc values', () => {
  const berserk = ABILITY_BY_ID.get('ABIL_TROG_BERSERK')!;
  assert.equal(berserk.name, 'Berserk');
  assert.equal(berserk.piety, 1);
  assert.equal(berserk.fail.base, 45);
  const hand = ABILITY_BY_ID.get('ABIL_TROG_HAND')!;
  assert.equal(hand.fail.base, 75); // piety_breakpoint(2)
  const brothers = ABILITY_BY_ID.get('ABIL_TROG_BROTHERS_IN_ARMS')!;
  assert.equal(brothers.fail.base, 160); // piety_breakpoint(5)
  const heroism = ABILITY_BY_ID.get('ABIL_OKAWARU_HEROISM')!;
  assert.equal(heroism.mp, 2);
  assert.equal(heroism.fail.base, 30);
  assert.equal(heroism.fail.mult, 6);
  const channelling = ABILITY_BY_ID.get('ABIL_SIF_MUNA_CHANNEL_ENERGY')!;
  assert.equal(channelling.piety, 2);
  const vigour = ABILITY_BY_ID.get('ABIL_ELYVILON_DIVINE_VIGOUR')!;
  assert.equal(vigour.fail.base, 80);
  assert.equal(vigour.fail.mult, 4);
});

test('abilities appear at their religion.cc ranks', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('berserker')!, 'WPN_UNARMED', 'Test');
  assert.equal(p.god, 'GOD_TROG');
  assert.equal(p.piety, 35); // ng-setup.cc give_items_skills
  assert.equal(pietyRank(p.piety), 1);
  assert.ok(abilityAvailable(p, ABILITY_BY_ID.get('ABIL_TROG_BERSERK')!));
  assert.ok(!abilityAvailable(p, ABILITY_BY_ID.get('ABIL_TROG_HAND')!), 'rank 2 needs 50 piety');
  assert.ok(!abilityAvailable(p, ABILITY_BY_ID.get('ABIL_TROG_BROTHERS_IN_ARMS')!));
  p.piety = 50;
  assert.ok(abilityAvailable(p, ABILITY_BY_ID.get('ABIL_TROG_HAND')!));
  p.piety = 160;
  assert.ok(abilityAvailable(p, ABILITY_BY_ID.get('ABIL_TROG_BROTHERS_IN_ARMS')!));
});

test('failure chance is base - invo*mult - piety/denom', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('berserker')!, 'WPN_UNARMED', 'Test');
  p.piety = 100;
  const hero = ABILITY_BY_ID.get('ABIL_OKAWARU_HEROISM')!;
  p.god = 'GOD_OKAWARU';
  // invo 0: 30 - 0 - 100/20 = 25.
  assert.equal(abilityFailChance(p, hero), 25);
  p.skills.invocations = { points: 0, level: 0 };
  p.skills.invocations.level = 10;
  p.skills.invocations.points = skillExpNeeded(10, 0) + 1;
  // 30 - invocations*6 - 100/20.
  assert.equal(abilityFailChance(p, hero), 30 - skillOf(p, 'invocations', 6) - 5);
  assert.ok(abilityFailChance(p, hero) < -20);
});

test('ability piety costs are generic_cost(base)', () => {
  const rng = new Rng(7n);
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('berserker')!, 'WPN_UNARMED', 'Test');
  const hand = ABILITY_BY_ID.get('ABIL_TROG_HAND')!;
  // base 2, add (2+1)/2+1 = 2: 2 + random2(2) is 2 or 3.
  for (let i = 0; i < 20; i++) {
    const cost = abilityPietyCost(p, hand, rng);
    assert.ok(cost === 2 || cost === 3, String(cost));
  }
  const destruction = ABILITY_BY_ID.get('ABIL_MAKHLEB_DESTRUCTION')!;
  assert.equal(abilityPietyCost(p, destruction, rng), 0);
  // scaling_cost(65, 2): 2 + (65 * 18 + 500) / 1000 = 3.
  p.god = 'GOD_MAKHLEB';
  p.hpMax = 18;
  assert.equal(abilityHpCost(p, destruction), 3);
  p.hpMax = 40;
  assert.equal(abilityHpCost(p, destruction), 2 + Math.trunc((65 * 40 + 500) / 1000));
});

test('piety gain tapers at high ranks and pays penance first', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('berserker')!, 'WPN_UNARMED', 'Test');
  const rng = new Rng(7n);
  p.piety = 0; p.penance = 2;
  gainPiety(p, 5, 1, rng);
  assert.equal(p.piety, 3); // two points paid the penance, three remained
  assert.equal(p.penance, 0);
  p.piety = 160;
  let gained = 0;
  for (let i = 0; i < 600; i++) {
    const before = p.piety;
    gainPiety(p, 1, 1, rng);
    gained += p.piety - before;
  }
  // >= 5* piety gains only one time in three, and >= 3* one in three again.
  assert.ok(gained < 600, `gained ${gained}`);
  assert.ok(gained > 20, `gained ${gained}`);
});

test('kill piety uses god-conduct.cc holiness bonuses', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('berserker')!, 'WPN_UNARMED', 'Test');
  p.piety = 0;
  p.xl = 1;
  const rng = new Rng(7n);
  // natural: denom 18 - 1/2 = 18, gain 12, one point with chance 12/18.
  let total = 0;
  for (let i = 0; i < 1000; i++) {
    const before = p.piety;
    gainKillPiety(p, { natural: true, undead: false, demonic: false, holy: false, nonliving: false, plant: false }, 1, 1, rng);
    total += p.piety - before;
    p.piety = before;
  }
  assert.ok(total > 550 && total < 750, `total ${total}`);
});

test('Okawaru kill piety is get_fuzzied_monster_difficulty / 550', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('berserker')!, 'WPN_UNARMED', 'Test');
  p.god = 'GOD_OKAWARU';
  p.piety = 0;
  const rng = new Rng(7n);
  gainKillPiety(p, { natural: true, undead: false, demonic: false, holy: false, nonliving: false, plant: false }, 1, 1, rng);
  assert.ok(p.piety <= 1);
});

test('a Berserker starts with Trog and 35 piety; other jobs start godless', () => {
  assert.deepEqual(startingPiety('Berserker'), { god: 'GOD_TROG', piety: 35 });
  assert.deepEqual(startingPiety('Fighter'), { god: null, piety: 0 });
  const fighter = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  assert.equal(fighter.god, null);
  assert.equal(fighter.piety, 0);
});

test('Berserk and divine vigour change HP by the original multipliers', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('berserker')!, 'WPN_UNARMED', 'Test');
  const base = p.hpMax;
  p.status.DUR_BERSERK = 10;
  recalc(p);
  assert.equal(p.hpMax, Math.trunc(base * 3 / 2));
  p.status.DUR_BERSERK = 0;
  recalc(p);
  assert.equal(p.hpMax, base);
  p.divineVigour = 2; // 1 + invo/3 at invo 3
  recalc(p);
  assert.equal(p.hpMax, Math.trunc(base * 110 / 100));
  p.divineVigour = 0;
  recalc(p);
  assert.equal(p.hpMax, base);
});

test('Heroism adds five levels to mundane skills only', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  const before = skillOf(p, 'fighting', 10);
  p.status.DUR_HEROISM = 10;
  assert.equal(skillOf(p, 'fighting', 10), before + 50);
  const spellBefore = skillOf(p, 'spellcasting', 10);
  assert.equal(skillOf(p, 'spellcasting', 10), spellBefore);
});

test('all gods have exactly the abilities the port implements', () => {
  for (const g of GODS) {
    for (const id of g.abilities) assert.ok(ABILITY_BY_ID.has(id), `${g.id}: ${id}`);
  }
  assert.equal(ABILITIES.filter((a) => a.god === 'GOD_VEHUMET').length, 0);
  assert.equal(abilityMpCost(null as never, ABILITY_BY_ID.get('ABIL_OKAWARU_FINESSE')!), 5);
});
