// Item appearances and identification: ng-init.cc appearance assignment and item-name.cc make_name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Rng } from '../src/game/rng.ts';
import { makeAppearances, makeName } from '../src/game/appearance.ts';
import { createPlayer } from '../src/game/player.ts';
import { JOBS_BY_NAME, ITEM_NAMES, SPECIES_BY_NAME } from '../src/game/data.ts';
import { displayItemName, makePotion, makeRing, makeScroll, makeWand, makeAmulet } from '../src/game/items.ts';

test('every potion, wand, ring, amulet and scroll has a unique appearance', () => {
  const a = makeAppearances(new Rng(7n));
  const potions = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('potion of '));
  const wands = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('wand of '));
  const rings = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('ring of '));
  const amulets = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('amulet of '));
  const scrolls = Object.keys(ITEM_NAMES).filter((k) => k.startsWith('scroll of '));
  assert.equal(Object.keys(a.potions).length, potions.length);
  assert.equal(Object.keys(a.wands).length, wands.length);
  assert.equal(Object.keys(a.rings).length, rings.length);
  assert.equal(Object.keys(a.amulets).length, amulets.length);
  assert.equal(Object.keys(a.scrolls).length, scrolls.length);
  assert.equal(new Set(Object.values(a.potions)).size, potions.length);
  assert.equal(new Set(Object.values(a.wands)).size, wands.length);
  assert.equal(new Set([...Object.values(a.rings), ...Object.values(a.amulets)]).size, rings.length + amulets.length);
  for (const v of Object.values(a.potions)) assert.match(v, / potion$/);
  for (const v of Object.values(a.wands)) assert.match(v, / wand$/);
  for (const v of Object.values(a.rings)) assert.match(v, / ring$/);
  for (const v of Object.values(a.amulets)) assert.match(v, / amulet$/);
  for (const v of Object.values(a.scrolls)) assert.match(v, /^labelled [A-Z]/);
});

test('the appearance lists are item-name.cc strings', () => {
  const a = makeAppearances(new Rng(11n));
  const v = Object.values(a.potions)[0];
  const colours = ['clear', 'blue', 'black', 'silvery', 'cyan', 'purple', 'orange', 'inky', 'red',
    'yellow', 'green', 'brown', 'ruby', 'white', 'emerald', 'grey', 'pink', 'coppery', 'golden',
    'dark', 'puce', 'amethyst', 'sapphire'];
  assert.ok(colours.some((c) => v.includes(c)), v);
  const w = Object.values(a.wands)[0];
  assert.ok(['iron', 'brass', 'bone', 'wooden', 'copper', 'gold', 'silver', 'bronze', 'ivory',
    'glass', 'lead', 'fluorescent'].some((m) => w.includes(m)), w);
});

test('unidentified items show their appearance; identified types show their name', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  const potion = makePotion('potion of might');
  assert.equal(p.identifiedTypes['potion of might'], undefined);
  const shown = displayItemName(potion, p);
  assert.match(shown, / potion$/);
  assert.notEqual(shown, 'potion of might');
  p.identifiedTypes['potion of might'] = true;
  assert.equal(displayItemName(potion, p), 'potion of might');
  // Jewellery is not identified from the start (item-name.cc).
  assert.match(displayItemName(makeRing('ring of protection'), p), / ring$/);
});

test('wands, rings, amulets and scrolls have appearances too', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  assert.match(displayItemName(makeWand('wand of flame', 4), p), / wand$/);
  assert.match(displayItemName(makeRing('ring of strength'), p), / ring$/);
  assert.match(displayItemName(makeAmulet('amulet of regeneration'), p), / amulet$/);
  assert.match(displayItemName(makeScroll('scroll of teleportation'), p), /^labelled /);
});

test('make_name is deterministic and scroll labels are long uppercase', () => {
  const a = makeName(7n, 12345n, true);
  const b = makeName(7n, 12345n, true);
  assert.equal(a, b);
  assert.ok(a.length >= 7, a);
  assert.equal(a, a.toUpperCase());
  const other = makeName(7n, 12346n, true);
  assert.notEqual(a, other);
});

test('appearances are part of a saved player', () => {
  const p = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  p.identifiedTypes['potion of might'] = true;
  assert.ok(Object.keys(p.appearances.potions).length > 0);
  assert.equal(p.appearances.potions['potion of might'] !== undefined, true);
});
