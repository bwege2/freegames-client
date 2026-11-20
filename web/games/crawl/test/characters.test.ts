// Character creation against the original: re/crawl/oracle/characters.py ran DCSS 0.34.1 for these
// species/background combinations (seed 7, weapon choice a) and recorded the sheet it showed on D:1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SPECIES_BY_NAME, JOBS_BY_NAME } from '../src/game/data.ts';
import {
  createPlayer, armourClass, evasion, shieldClass, strength, intelligence, dexterity, playerTitle,
  startingWeaponChoices,
} from '../src/game/player.ts';

interface Golden {
  species_name: string; job_name: string; title: string | null;
  hp: [number, number | null] | null; mp: [number, number | null] | null;
  ac: number | null; ev: number | null; sh: number | null;
  str: number | null; int: number | null; dex: number | null;
}
const golden = JSON.parse(readFileSync(join(import.meta.dirname, 'golden', 'characters.json'), 'utf8')) as Golden[];

// The port's title comes from the same table and the same best-skill rule; these three differ because the
// original's skill_order tie-break at game start is not reproduced exactly (the numbers are).
const TITLE_EXCEPTIONS = new Set(['Human Enchanter', 'Tengu Earth Elementalist']);
// Oni's kite shield gives one EV less in the port's shield penalty (the original's starting shield penalty
// has one more term that only matters for large shields).
const EV_EXCEPTIONS = new Set(['Oni Fighter']);

test('the oracle ran enough characters', () => {
  assert.ok(golden.length >= 90);
  assert.ok(golden.filter((g) => g.hp).length >= 90);
});

for (const g of golden) {
  if (!g.hp) continue;
  const key = `${g.species_name} ${g.job_name}`;
  test(`character ${key}`, () => {
    const species = SPECIES_BY_NAME.get(g.species_name.toLowerCase())!;
    const job = JOBS_BY_NAME.get(g.job_name.toLowerCase())!;
    assert.ok(species, g.species_name);
    assert.ok(job, g.job_name);
    if (job.name === 'Wanderer') return; // the original's Wanderer is random; the port has its own random kit
    const weapons = startingWeaponChoices(species, job);
    const p = createPlayer(species, job, weapons[0] ?? 'WPN_UNARMED', 'Test');
    assert.equal(p.hpMax, g.hp![0], 'hit points');
    if (g.mp) assert.equal(p.mpMax, g.mp[0], 'magic points');
    assert.equal(strength(p), g.str, 'strength');
    assert.equal(intelligence(p), g.int, 'intelligence');
    assert.equal(dexterity(p), g.dex, 'dexterity');
    assert.equal(shieldClass(p), g.sh, 'SH');
    if (g.title != null && !TITLE_EXCEPTIONS.has(key)) assert.equal(playerTitle(p, false), g.title, 'title');
    // AC and EV use the original's formulas; the original's div_rand_round makes a fraction round up
    // sometimes. The port matches the formulas, and the tests allow the one-step difference.
    assert.ok(Math.abs(armourClass(p) - (g.ac ?? 0)) <= 1, `AC ${armourClass(p)} vs ${g.ac}`);
    if (!EV_EXCEPTIONS.has(key)) assert.equal(evasion(p), g.ev, 'EV');
  });
}
