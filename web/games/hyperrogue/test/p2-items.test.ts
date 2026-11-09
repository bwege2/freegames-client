// Headless checks of package P2 (flags, items, orbgen, inventory, yendor, achievement, the message log) where
// the oracle cannot reach yet (the game scenarios need all packages). The expected values are read off the
// C++ source of 13.1o (re/hyperrogue/orig/hyperrogue-13.1o), cited per test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G } from '../src/globals.ts';
import {
  ittypes, IC_ORB, iinf,
  waSea, waBoat, waNone, waRichDie, waHappyDie, laIce, laEFire, laEWater, laEAir, laEEarth, laDice, laJungle, laHell,
  laMotion, laPower, laKraken, laCrossroads, laOcean, laCamelot, laMirror, laPrincessQuest, laVolcano, laWhirlpool,
  laTemple, laHaunted, moYeti, moGolem, moAnimatedDie, moFrog, moFireElemental, moNone, moIvyRoot,
  itFireShard, itEarthShard, itOrbFlash, itOrbLightning, itOrbWater, itShard, itOrbFire, itOrbSafety, itOrbChoice,
  itOrbLove, itOrbIllusion, itOrbYendor, itHolyGrail, itDiamond, itGold, itRuby, itOrbLife, itOrbLava, itOrbWinter,
  itOrbFrog, itNone, itInventory, itGreenStone, itOrbMirror, itHyperstone, itOrbSpeed,
} from '../src/content.ts';
import {
  isWatery, isWateryOrBoat, isFriendly, isIvy, elementalOf, localshardof, isLuckyLand, isDie, isDie_w, frog_power,
  itemclass, classflag_m,
} from '../src/flags.ts';
import { gold, maxgold, threshold_met, itemcounter, barrowCount, NO_YENDOR, NO_TREASURE, hiitems_at } from '../src/items.ts';
import {
  register_orbgen, nativeOrbType, getOLR, orbprizefun, orbcrossfun, olrNative, olrPNative, olrUseless, olrBurns,
  olrHub, olrNoPrizeOrb, olrNative1, olrNoPrizes, olrPrize25, olrGuest, olrDangerous, orbsUnlocked,
} from '../src/orbgen.ts';
import { inv_compute, inv_mirrorqty0, inv_mirrorqty, inv_osminfo } from '../src/inventory.ts';
import {
  yendor_levels, YENDORLEVELS, yendor_char_to_yendor, yendor_hardness, yendor_changeland, yendor_get_land_structure,
  modecode, tactic_record, tactic_unrecord, tactic_compute_tscore, tactic_chances, MAXTAC, modestream,
  hiitemsMax, get_identify, gen_mode_list, YF_START_AL, YF_END, YF_CHAOS,
} from '../src/yendor.ts';
import { lsChaos, lsSingle, lsNiceWalls } from '../src/landlock.ts';
import { wrongMode, achievement_gain_once, isAscending, score_default, leadernames, NUMLEADER } from '../src/achievement.ts';
import { rg_global, rg_fail, rg_shmup } from '../src/system.ts';
import { addMessage, fullmsg, clearMessages } from '../src/basegraph.ts';
import { cell } from '../src/locations.ts';

function resetItems(): void { G.items.fill(0); G.inv_on = false; }

test('flags: the FLAGCHECK functions take an enum or a cell', () => {
  assert.equal(isWatery(waSea), true);
  assert.equal(isWatery(waNone), false);
  assert.equal(isWateryOrBoat(waBoat), true); // (flag & WF_WATER) || w == waBoat
  const c = new cell(7, null!);
  c.wall = waSea;
  assert.equal(isWatery(c), true);
  c.monst = moIvyRoot;
  assert.equal(isIvy(c), true);
  assert.equal(isIvy(moYeti), false);
  assert.equal(isFriendly(moGolem), true); // isFriendly(eMonster) = isFriendlyType
  assert.equal(isFriendly(moYeti), false);
  assert.equal(classflag_m(moNone) & 1n, 1n); // CF_NOGHOST
});

test('flags: simple tables', () => {
  assert.equal(elementalOf(laEFire), moFireElemental);
  assert.equal(elementalOf(laIce), moNone);
  // eItem(itFireShard + (l - laEFire)): lands and shards are both in the order Fire, Air, Earth, Water
  assert.deepEqual([laEFire, laEAir, laEEarth, laEWater].map(localshardof), [itFireShard, itFireShard + 1, itEarthShard, itEarthShard + 1]);
  assert.equal(isLuckyLand(laDice), true);
  assert.equal(isLuckyLand(laJungle), false);
  assert.equal(isDie(moAnimatedDie), true);
  assert.equal(isDie_w(waRichDie) && isDie_w(waHappyDie), true);
  assert.equal(frog_power(moFrog), itOrbFrog);
  assert.equal(frog_power(moYeti), itNone);
  assert.equal(itemclass(itOrbFlash), IC_ORB);
});

test('items: gold, maxgold, thresholds', () => {
  resetItems();
  G.items[itDiamond] = 12; G.items[itGold] = 3; G.items[itOrbYendor] = 2; G.items[itHolyGrail] = 1;
  G.items[itOrbFlash] = 40; // orbs do not count
  assert.equal(gold(), 15 + 100 + 10);
  assert.equal(gold(NO_YENDOR), 25);
  assert.equal(gold(NO_TREASURE | NO_YENDOR), 10);
  G.items[itOrbLove] = 1;
  assert.equal(gold(), 15 + 100 + 10 + 30);
  assert.equal(maxgold(), 12);
  assert.deepEqual([0, 4, 5, 9, 10, 24, 25, 99, 100, 501].map(threshold_met), [0, 0, 5, 5, 10, 10, 25, 50, 100, 500]);
  assert.equal(itemcounter(7), ' (7)');
  const c = new cell(7, null!);
  c.landparam = 0; assert.equal(barrowCount(c), 1);
  c.landparam = 3; assert.equal(barrowCount(c), 3);
  c.landparam = 9; assert.equal(barrowCount(c), 4);
  resetItems();
});

test('orbgen: the orbinfos table and getOLR', () => {
  register_orbgen();
  assert.equal(G.orbinfos.length, 92);
  assert.equal(G.olrDescriptions.length, 18);
  assert.equal(nativeOrbType(laIce), itOrbFlash);
  assert.equal(nativeOrbType(laJungle), itOrbLightning);
  assert.equal(nativeOrbType(laMirror), itShard);
  assert.equal(nativeOrbType(laEAir), nativeOrbType(laEFire)); // elemental lands -> laElementalWall
  assert.equal(nativeOrbType(laWhirlpool), itOrbWater);
  G.inv_on = false;
  assert.equal(getOLR(itOrbFire, laPower), olrPNative);
  assert.equal(getOLR(itOrbChoice, laMotion), olrUseless);
  assert.equal(getOLR(itOrbFire, laKraken), olrUseless);
  assert.equal(getOLR(itOrbLava, laVolcano), olrNative);
  assert.equal(getOLR(itOrbFlash, laVolcano), olrBurns); // Flash is not IF_FIREPROOF
  assert.equal(getOLR(itOrbWinter, laVolcano), olrPrize25); // Winter is fireproof, and not useless in the Volcano
  assert.equal(getOLR(itOrbLove, laIce), olrNoPrizeOrb);
  assert.equal(getOLR(itOrbIllusion, laCamelot), olrNative1);
  assert.equal(getOLR(itOrbFlash, laIce), olrNative);
  assert.equal(getOLR(itOrbWinter, laIce), olrGuest);
  assert.equal(getOLR(itOrbLife, laCrossroads), olrHub);
  assert.equal(getOLR(itOrbLife, laOcean), olrHub);
  assert.equal(getOLR(itOrbLife, laTemple), olrNoPrizes);
  assert.equal(getOLR(itOrbLife, laHell), olrPrize25);
  assert.equal(getOLR(itOrbSafety, laHell), olrDangerous);
  assert.equal(getOLR(itOrbLife, laHaunted) === olrPrize25, true);
  assert.equal(getOLR(itOrbFrog, laPrincessQuest), olrGuest);
});

test('orbgen: prize and crossroads functions', () => {
  G.tactic_on = false; G.land_structure = lsNiceWalls;
  assert.equal(orbprizefun(9), 0);
  assert.equal(orbprizefun(25), .6);
  assert.equal(orbprizefun(50), .6 + .4 * Math.log(2) / Math.log(2));
  assert.equal(orbcrossfun(9), 0);
  assert.equal(orbcrossfun(10), .7);
  assert.equal(orbcrossfun(30), 1);
  G.tactic_on = true;
  assert.equal(orbprizefun(0), 1);
  G.tactic_on = false;
  resetItems();
  G.items[itDiamond] = 10; G.items[itRuby] = 9;
  assert.equal(orbsUnlocked(), 1); // R10 = 10 outside the OSM
  resetItems();
});

test('inventory: OSM orb counts are deterministic and follow the rules of compute()', () => {
  register_orbgen();
  resetItems();
  G.inv_on = true; G.inv_rseed = 12345; G.inv_usedup.fill(0); G.inv_extra_orbs.fill(0);
  G.princess_reviveAt = 0; G.shmup_on = false; G.land_structure = lsNiceWalls;
  inv_compute();
  // no treasure: nothing unlocked
  for (let i = 0; i < ittypes; i++) if (i !== itGreenStone) assert.equal(G.inv_remaining[i], 0, iinf[i].name);
  assert.equal(G.items[itInventory], 0);
  G.items[itDiamond] = 10; // the first Orb of Flash at 10
  inv_compute();
  assert.equal(G.inv_remaining[itOrbFlash] >= 1, true);
  const flash = G.inv_remaining[itOrbFlash];
  inv_compute();
  assert.equal(G.inv_remaining[itOrbFlash], flash); // same seed, same result
  G.items[itHyperstone] = 10; // Hyperstones give Orbs of Mirroring
  inv_compute();
  assert.equal(G.inv_remaining[itOrbMirror] >= 1, true);
  let sum = 0;
  for (let i = 0; i < ittypes; i++) if (i !== itGreenStone && i !== itOrbYendor) sum += G.inv_remaining[i];
  assert.equal(G.items[itInventory], sum);
  assert.equal(inv_mirrorqty0(itOrbWater), 10);
  assert.equal(inv_mirrorqty0(itOrbSpeed), 3);
  assert.equal(inv_mirrorqty(itOrbMirror), 1);
  assert.equal(inv_mirrorqty(itOrbSpeed), 3); // int(3 * sqrt(1.000001 + 0/20.))
  assert.equal(inv_osminfo(itOrbFlash), `Number of uses left: ${flash}`);
  G.inv_on = false;
  resetItems();
});

test('yendor: the challenge table', () => {
  assert.equal(yendor_levels.length, YENDORLEVELS);
  assert.equal(yendor_levels[7].l, laMotion);
  assert.equal(yendor_levels[7].flags, YF_START_AL | YF_END);
  assert.equal(yendor_levels[25].flags & YF_CHAOS, YF_CHAOS);
  assert.equal(yendor_char_to_yendor('a'.charCodeAt(0)), 1);
  assert.equal(yendor_char_to_yendor('A'.charCodeAt(0)), 27);
  assert.equal(yendor_char_to_yendor('1'.charCodeAt(0)), 0);
  G.yendor_challenge = 25;
  assert.equal(yendor_get_land_structure(), lsChaos);
  G.yendor_challenge = 11; // the Whirlpool
  assert.equal(yendor_get_land_structure(), lsSingle);
  G.yendor_challenge = 4; // Minefield, YF_END
  assert.equal(yendor_changeland(81, yendor_levels[4].l), laIce);
  assert.equal(yendor_changeland(79, yendor_levels[4].l), 0);
  G.yendor_challenge = 0;
});

test('yendor: hardness', () => {
  resetItems();
  G.peace_on = false; G.yendor_generating = false; G.yendor_path = false; G.yendor_on = false;
  assert.equal(yendor_hardness(), 0);
  G.yendor_on = true; G.items[itOrbYendor] = 2;
  assert.equal(yendor_hardness(), 10);
  G.yendor_on = false;
  G.peace_on = true;
  assert.equal(yendor_hardness(), 15);
  G.peace_on = false;
  resetItems();
});

test('yendor: legacy mode codes and hiitems', () => {
  G.land_structure = lsNiceWalls; G.multi_players = 1; G.hardcore = false; G.inv_on = false; G.peace_on = false;
  assert.equal(modecode(), 0); // softcore hyperbolic, 1 player
  G.inv_on = true;
  assert.equal(modecode(), 1 << 11);
  G.inv_on = false;
  G.land_structure = lsChaos;
  assert.equal(modecode(), 19); // softcore hyperbolic chaosmode
  G.land_structure = lsNiceWalls;
  hiitems_at(0)[itDiamond] = 12;
  hiitems_at(7)[itDiamond] = 30;
  assert.equal(hiitemsMax(itDiamond), 30);
  G.hiitems.clear();
  assert.equal(get_identify(5), 5);
  assert.equal(G.meaning.get(5), 'LEGACY');
  gen_mode_list();
  assert.deepEqual(G.mode_list, [5]);
  G.meaning.clear(); G.identify_modes.clear(); G.mode_list.length = 0;
});

test('tactic: record and unrecord', () => {
  G.use_custom_land_list = false;
  assert.equal(tactic_chances(laCamelot, 2), 1); // default_runs for xc != 0
  assert.equal(tactic_chances(laIce, 2), 3);
  tactic_record(laIce, 40, 2);
  tactic_record(laIce, 10, 2);
  tactic_record(laIce, 25, 2);
  assert.equal(tactic_compute_tscore(2), 75); // runs 3, multiplier 1 for xc != 0
  tactic_unrecord(laIce, 2);
  tactic_record(laIce, 30, 2);
  assert.equal(tactic_compute_tscore(2), 80); // record keeps the best sum
  assert.equal(MAXTAC, 20);
});

test('modestream: chars, ints and doubles round-trip', () => {
  const s = new modestream();
  s.write_short(0xAA2F); s.write_char(-3); s.write_int(-123456789); s.write_ld(1.25);
  assert.equal(s.s.length, 2 + 1 + 4 + 8);
  s.readpos = 2;
  assert.equal(s.get_char(), -3);
  assert.equal(s.get_int(), -123456789);
  assert.equal(s.get_ld(), 1.25);
});

test('achievements: gating', () => {
  G.cheater = 0; G.casual = false; G.land_structure = lsNiceWalls; G.multi_players = 1;
  G.yendor_on = false; G.tactic_on = false; G.peace_on = false; G.shmup_on = false;
  assert.equal(wrongMode(0), false);
  assert.equal(wrongMode(rg_fail), true);
  assert.equal(wrongMode(rg_shmup), true); // shmup::on != (flags == shmup)
  G.cheater = 1;
  assert.equal(wrongMode(rg_global), true);
  G.cheater = 0;
  G.achievementsReceived.length = 0; G.got_achievements.clear();
  achievement_gain_once('DIAMOND1');
  achievement_gain_once('DIAMOND1');
  assert.deepEqual(G.achievementsReceived, ['DIAMOND1']);
  G.yendor_on = true;
  achievement_gain_once('RUBY1');
  assert.equal(G.got_achievements.has('RUBY1'), false);
  G.yendor_on = false;
  assert.equal(isAscending(13) && !isAscending(12), true);
  assert.equal(score_default(14), 1999999999);
  assert.equal(leadernames.length, NUMLEADER);
});

test('message log: merging repeated messages, the 1000 limit', () => {
  G.gamelog.length = 0; clearMessages();
  addMessage('a'); addMessage('a'); addMessage('b');
  assert.deepEqual(G.gamelog.map((m) => [m.msg, m.quantity]), [['a', 2], ['b', 1]]);
  assert.equal(fullmsg(G.gamelog[0]), 'a (x2)');
  assert.equal(G.msgs.length, 2);
  for (let i = 0; i < 1100; i++) addMessage('m' + i);
  assert.equal(G.gamelog.length, 1000);
  assert.equal(G.gamelog[999].msg, 'm1099');
  assert.equal(G.gamelog[0].msg, 'm100');
  G.gamelog.length = 0; clearMessages();
});
