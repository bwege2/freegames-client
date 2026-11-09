// achievement.cpp of HyperRogue 13.1o: achievements and leaderboards. Package P2.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The oracle is built with CAP_ACHIEVE=0 (no Steam): achievement_gain is achievement_log, which records the
// achievement in achievementsReceived (and, with CAP_SAVE, in the score file: server storage in the browser, a
// later stage; the file line is left out). improve_score, achievement_score, achievement_final and
// achievement_victory keep only their checks before `#if CAP_ACHIEVE`. All the gating (wrongMode, the LATE,
// cheater/casual checks) is kept.
// `char flags` are numbers (char codes): the rg constants of system.ts.
import { G } from './globals.ts';
import { isize, NotPorted } from './hyper.ts';
import { isHaunted } from './flags.ts';
import { changes, numplayers } from './pcmove.ts';
import {
  type eItem,
  itTreat, itDiamond, itRuby, itHyperstone, itGold, itStatue, itShard, itBone, itSpice, itElixir, itHell, itFeather,
  itSapphire, itFernFlower, itRoyalJelly, itWine, itPower, itEmerald, itSilver, itGrimoire, itRedGem, itPirate,
  itCoast, itWhirlpool, itBombEgg, itPalace, itFjord, itIvory, itElemental, itZebra, itMutant, itFulgurite,
  itMutant2, itWindstone, itCoral, itRose, itBabyTortoise, itDragon, itApple, itKraken, itBarrow, itTrollEgg,
  itAmethyst, itSlime, itDodeca, itGreenGrass, itBull, itHunting, itBlizzard, itLavaLily, itTerra, itRuins, itSwitch, itLotus,
  itBrownian, itVarTreasure, itWest, itFrog, itEclectic, itWet, itCursed, itDice, itHolyGrail, itOrbYendor,
  linf, laMirrorOld, laDesert, laHalloween, laCamelot, laCanvas, laCA,
} from './content.ts';
import {
  BITRUNCATED, PURE, gNormal, gZebraQuotient, gKleinQuartic, gSphere, gElliptic, gEuclid, gCrystal,
  eVariation, cryst, ginf,
} from './classes.ts';
import { in_lovasz, gold } from './items.ts';
import { pureHardcore } from './checkmove.ts';
import { rg_global, rg_fail, rg_special_geometry, rg_special_geometry_nicewalls, rg_shmup, rg_racing, rg_dualmode,
  rg_princess, rg_chaos, rg_multi, remove_emergency_save } from './system.ts';
import { lsNiceWalls, lsSingle, lsChaos } from './landlock.ts';
import { los_none, PURELOS_LEVEL } from './environment.ts';
import { gp_param } from './goldberg.ts';
import { yendor_name } from './yendor.ts';
import { its } from './hprint.ts';
import { callhandlers, hookset } from './hyper.ts';
import { full_geometry_name } from './geom-exp.ts';
import { land_structure_name, default_land_structure } from './menus.ts';

export const NUMLEADER = 90;

// EX bool test_achievements, offlineMode: G.test_achievements, G.offlineMode

export const leadernames: readonly string[] = [
  'Score', 'Diamonds', 'Gold', 'Spice', 'Rubies', 'Elixirs',
  'Shards100', 'Totems', 'Daisies', 'Statues', 'Feathers', 'Sapphires',
  'Hyperstones', 'Time to Win-71', 'Turns to Win-71',
  'Time to 10 Hyperstones-120', 'Turns to 10 Hyperstones-120', 'Orbs of Yendor',
  'Fern Flowers',
  'Royal Jellies', 'Powerstones', 'Silver', 'Wine', 'Emeralds', 'Grimoires',
  'Holy Grails', 'Red Gems', 'Pirate Treasures',
  'Shmup Score', 'Shmup Time to Win', 'Shmup Knife to Win',
  'Bomberbird Eggs', // 31
  'Ambers', // 32
  'Pearls', // 33
  'Hypersian Rugs', // 34
  'Garnets', // 35
  'Princess Challenge', // 36
  'Ivory Figurines', // 37
  'Elemental Gems', // 38
  'Onyxes', // 39
  'Yendor Challenge', // 40
  'Pure Tactics Mode', // 41
  'Mutant Saplings', // 42
  'Fulgurites', // 43
  'Shmup Score 2p', // 44
  'Coop Shmup Time to Win', // 45
  'Black Lotuses', // 46
  'Mutant Fruits', // 47
  'White Dove Feathers', // 48
  'Pure Tactics Mode (shmup)', // 49
  'Pure Tactics Mode (2p)', // 50
  'Corals', // 51
  'Thornless Roses', // 52
  'Chaos Mode', // 53
  'Tortoise points', // 54
  'Dragon Scales', // 55
  'Apples', // 56
  'Heptagonal Mode', // 57
  'Sunken Treasures', // 58
  'Ancient Jewelry', // 59
  'Golden Eggs', // 60
  'Multiplayer Score', // 61
  'Statistics', // 62
  'Halloween', // 63
  'Amethysts', // 64
  'Slime Molds', // 65
  'Dodecahedra', // 66
  'Green Grass', // 67
  'Spinel', // 68
  'Orb Strategy Score', // 69
  'Real time to Win-OS', // 70
  'Turns to Win-OS', // 71
  'Ancient Weapons', // 72
  'Forgotten Relics', // 73
  'Lava Lilies', // 74
  'Turquoises', // 75
  'Chrysoberyls', // 76
  'Tasty Jellies', // 77
  'Tiger\'s Eyes', // 78
  'Torbernites', // 79
  'Meteorites', // 80
  'Racing Official Track', // 81
  'Gold Balls', // 82
  'Lazurite Figurines', // 83
  'Water Lilies', // 84
  'Capon Stones', // 85
  'Crystal Dice', // 86
  'Crossbow (bull)', // 87
  'Crossbow (geodesic)', // 88
  'Crossbow (geometric)', // 89
];

export const LB_PRINCESS = 36;
export const LB_STATISTICS = 62;
export const LB_HALLOWEEN = 63;
export const LB_YENDOR_CHALLENGE = 40;
export const LB_PURE_TACTICS = 41;
export const LB_PURE_TACTICS_SHMUP = 49;
export const LB_PURE_TACTICS_COOP = 50;
export const LB_RACING = 81;

// EX string achievementMessage[3]; EX int achievementTimer; EX vector<string> achievementsReceived: in G

/** Returns true if the given achievement cannot be obtained in the current mode.
 *  @param flags Mode requested by the achievement. */
export function wrongMode(flags: number): boolean {
  if (G.cheater) return true;
  if (G.casual) return true;
  if (flags === rg_global) return false;
  if (flags === rg_fail) return true;

  if (flags !== rg_special_geometry && flags !== rg_special_geometry_nicewalls) {
    if (!BITRUNCATED()) return true;
    if (G.geometry !== gNormal) return true;
    if (G.disksize) return true;
  }
  if (G.ineligible_starting_land && !flags) return true;
  if (G.use_custom_land_list) return true;
  if (G.lineofsight !== los_none || G.lineofsightAt >= PURELOS_LEVEL) return true;

  if (G.shmup_on !== (flags === rg_shmup || flags === rg_racing)) return true;
  if (G.racing_on !== (flags === rg_racing)) return true;
  if ((!!G.dual_state) !== (flags === rg_dualmode)) return true;
  // CAP_DAILY=0
  if (G.randomPatternsMode) return true;
  if (G.yendor_on) return true;
  if (G.peace_on) return true;
  if (G.tactic_on) return true;
  // CAP_TOUR
  if (G.tour_on) return true;
  let dls = lsNiceWalls;
  if (flags === rg_princess && !G.princess_challenge) return true;
  if (flags === rg_special_geometry || flags === rg_princess)
    dls = lsSingle;
  if (flags === rg_chaos)
    dls = lsChaos;
  /* in the official racing achievements, the tracks are saved maps anyway */
  if (flags === rg_racing)
    dls = G.land_structure;

  if (G.land_structure !== dls) return true;
  if (G.shmup_on && G.vid.creature_scale !== 1) return true;
  if (numplayers() > 1 && !G.multi_friendly_fire) return true;
  if (numplayers() > 1 && G.multi_pvp_mode) return true;
  if (numplayers() > 1 && G.multi_split_screen) return true;
  if ((numplayers() > 1) !== (flags === rg_multi)) return true;
  return false;
}

// EX set<string> got_achievements: G.got_achievements

export function achievement_gain_once(s: string, flags = 0): void {
  if (changes.on) { changes.at_commit(() => achievement_gain_once(s, flags)); return; }
  if (G.got_achievements.has(s)) return;
  if (wrongMode(flags)) {
    if (G.test_achievements) { /* println(hlog, "wrong mode for achievement: ", s); */ }
    else return;
  }
  G.got_achievements.add(s);
  achievement_gain(s, flags);
}

/** namespace rg { char check(bool b, char val = special_geometry) } */
function rg_check(b: boolean, val: number = rg_special_geometry): number { return b ? val : rg_fail; }

export function specgeom_zebra(): number { return rg_check(G.geometry === gZebraQuotient && !G.disksize && BITRUNCATED() && G.firstland === laDesert); }
export function specgeom_lovasz(): number { return rg_check(G.geometry === gKleinQuartic && G.variation === eVariation.untruncated && gp_param()[0] === 1 && gp_param()[1] === 1 && !G.disksize && in_lovasz()); }
export function specgeom_halloween(): number { return rg_check((G.geometry === gSphere || G.geometry === gElliptic) && BITRUNCATED() && !G.disksize && G.firstland === laHalloween); }
export function specgeom_heptagonal(): number { return rg_check(PURE() && G.geometry === gNormal && !G.disksize, rg_special_geometry_nicewalls); }
export function specgeom_euclid_gen(): number { return rg_check(G.geometry === gEuclid && !G.disksize && G.firstland === laMirrorOld); }
// CAP_CRYSTAL
export function specgeom_crystal1(): number { return rg_check(PURE() && cryst() && ginf[gCrystal].sides === 8 && ginf[gCrystal].vertex === 4 && !G.crystal_used_compass_inside && !G.disksize && G.firstland === laCamelot); }
export function specgeom_crystal2(): number { return rg_check(BITRUNCATED() && cryst() && ginf[gCrystal].sides === 8 && ginf[gCrystal].vertex === 3 && !G.crystal_used_compass_inside && !G.disksize && G.firstland === laCamelot); }

export function any_specgeom(): number {
  for (const chk of G.all_specgeom_checks) if (chk() !== rg_fail) return chk();
  return rg_fail;
}

export function achievement_log(s: string, flags: number): void {

  if (wrongMode(flags)) {
    // if(test_achievements) println(hlog, "wrong mode for achievement: ", s);
    return;
  }

  if (G.test_achievements) {
    // println(hlog, "got achievement:", s);
    return;
  }

  for (let i = 0; i < isize(G.achievementsReceived); i++)
    if (G.achievementsReceived[i] === s) return;
  G.achievementsReceived.push(s);

  // CAP_SAVE
  remove_emergency_save();

  // FILE *f = fopen(scorefile.c_str(), "at"); ... fprintf(f, "ACHIEVEMENT %s turns: %d time: %d at: %d ver: %s c: %d
  // date: %s\n", ...): the score file is server storage in the browser (a later stage); the line is left out.
}

// #if !CAP_ACHIEVE
export function myname(): string { return 'Rogue'; }
/** gain the achievement with the given name (achievement_gain(const char* s, char flags IS(0))) */
export function achievement_gain(s: string, flags = 0): void {
  achievement_log(s, flags);
}
export function get_sync_status(): number { return 0; }
export function set_priority_board(_id: number): void { /* nothing */ }
// #endif

// gain the achievement for collecting a number of 'it'.
export function achievement_collection(it: eItem): void {
  achievement_collection2(it, G.items[it]);
}

export function achievement_collection2(it: eItem, q: number): void {
  if (G.cheater && !G.test_achievements) return;
  if (G.casual && !G.test_achievements) return;
  if (G.randomPatternsMode) return;
  if (changes.on) { changes.at_commit(() => achievement_collection2(it, q)); return; }

  if (it === itTreat && q === 50)
    achievement_gain('HALLOWEEN1', specgeom_halloween());

  if (it === itTreat && q === 100)
    achievement_gain('HALLOWEEN2', specgeom_halloween());

  if (q === 1) {
    if (it === itDiamond) achievement_gain('DIAMOND1');
    if (it === itRuby) achievement_gain('RUBY1');
    if (it === itHyperstone) achievement_gain('HYPER1');
    if (it === itGold) achievement_gain('GOLD1');
    if (it === itStatue) achievement_gain('STATUE1');
    if (it === itShard) achievement_gain('MIRROR1');
    if (it === itBone) achievement_gain('TOTEM1');
    if (it === itSpice) achievement_gain('SPICE1');
    if (it === itElixir) achievement_gain('ELIXIR1');
    if (it === itHell) achievement_gain('DAISY1');
    if (it === itFeather) achievement_gain('FEATHER1');
    if (it === itSapphire) achievement_gain('SAPPHIRE1');
    if (it === itFernFlower) achievement_gain('FERN1');
    if (it === itRoyalJelly) achievement_gain('JELLY1');
    if (it === itWine) achievement_gain('WINE1');
    if (it === itPower) achievement_gain('POWER1');
    if (it === itEmerald) achievement_gain('EMERALD1');
    if (it === itSilver) achievement_gain('SILVER1');
    if (it === itGrimoire) achievement_gain('GRIMOIRE1');
    if (it === itRedGem) achievement_gain('REDGEM1');
    if (it === itPirate) achievement_gain('PIRATE1');
    if (it === itCoast) achievement_gain('COAST1');
    // if (it === itWhirlpool) achievement_gain('WHIRL1'); // requires escape
    if (it === itBombEgg) achievement_gain('MINE1');
    if (it === itPalace) achievement_gain('RUG1');
    if (it === itFjord) achievement_gain('GARNET1');

    if (it === itIvory) achievement_gain('TOWER1');
    if (it === itElemental) achievement_gain('ELEMENT1');
    if (it === itZebra) achievement_gain('ZEBRA1');

    if (it === itMutant) achievement_gain('MUTANT1');
    if (it === itFulgurite) achievement_gain('FULGUR1');

    if (it === itMutant2) achievement_gain('FRUIT1');
    if (it === itWindstone) achievement_gain('DOVE1');
    if (it === itCoral) achievement_gain('CORAL1');
    if (it === itRose) achievement_gain('ROSE1');
    
    if (it === itBabyTortoise) achievement_gain('TORTOISE1');
    if (it === itDragon) achievement_gain('DRAGON1');
    if (it === itApple) achievement_gain('APPLE1');

    if (it === itKraken) achievement_gain('KRAKEN1');
    if (it === itBarrow) achievement_gain('BARROW1');
    if (it === itTrollEgg) achievement_gain('TROLL1');

    if (it === itAmethyst) achievement_gain('MOUNT1');
    if (it === itSlime) achievement_gain('DUNG1');
    if (it === itDodeca) achievement_gain('DOD1');

    if (it === itGreenGrass) achievement_gain('PRAIR1');
    if (it === itBull) achievement_gain('BULL1');
    
    if (it === itHunting) achievement_gain('TURQ1');
    if (it === itBlizzard) achievement_gain('BLIZZ1');
    if (it === itLavaLily) achievement_gain('LILY1');
    if (it === itTerra) achievement_gain('TERRAC1');
    
    if (it === itRuins) achievement_gain('RUIN1');
    if (it === itSwitch) achievement_gain('JELLZ1');
    
    if (it === itBrownian) achievement_gain('BROWN1');
    if (it === itVarTreasure) achievement_gain('RADIO1');
    if (it === itWest) achievement_gain('FREEFALL1');
    
    if (it === itFrog) achievement_gain('FROG1');
    if (it === itEclectic) achievement_gain('ECLEC1');
    if (it === itWet) achievement_gain('WET1');

    if (it === itCursed) achievement_gain('CURSED1');
    if (it === itDice) achievement_gain('DICE1');
    }

  // 32
  if (it === itHolyGrail) {
    if (q === 1) achievement_gain('GRAIL2');
    achievement_gain('GRAILH', specgeom_heptagonal());
    achievement_gain('GRAIL4D', specgeom_crystal1());
    achievement_gain('GRAIL4D2', specgeom_crystal2());
    if (q === 3) achievement_gain('GRAIL3');
    if (q === 8) achievement_gain('GRAIL4');
    }
  
  if (q === (G.inv_on ? 25 : 10)) {
    if (it === itDiamond) achievement_gain('DIAMOND2');
    if (it === itRuby) achievement_gain('RUBY2');
    if (it === itHyperstone) achievement_gain('HYPER2');
    if (it === itGold) achievement_gain('GOLD2');
    if (it === itStatue) achievement_gain('STATUE2');
    if (it === itShard) achievement_gain('MIRROR2');
    if (it === itBone) achievement_gain('TOTEM2');
    if (it === itSpice) achievement_gain('SPICE2');
    if (it === itElixir) achievement_gain('ELIXIR2');
    if (it === itHell) achievement_gain('DAISY2');
    if (it === itFeather) achievement_gain('FEATHER2');
    if (it === itSapphire) achievement_gain('SAPPHIRE2');
    if (it === itFernFlower) achievement_gain('FERN2');
    if (it === itRoyalJelly) achievement_gain('JELLY2');
    if (it === itWine) achievement_gain('WINE2');
    if (it === itPower) achievement_gain('POWER2');
    if (it === itEmerald) achievement_gain('EMERALD2');
    if (it === itSilver) achievement_gain('SILVER2');
    if (it === itGrimoire) achievement_gain('GRIMOIRE2');
    if (it === itRedGem) achievement_gain('REDGEM2');
    if (it === itPirate) achievement_gain('PIRATE2');
    if (it === itCoast) achievement_gain('COAST2');
    if (it === itWhirlpool) achievement_gain('WHIRL2');
    if (it === itBombEgg) achievement_gain('MINE2');
    if (it === itPalace) achievement_gain('RUG2');
    if (it === itFjord) achievement_gain('GARNET2');

    if (it === itIvory) achievement_gain('TOWER2');
    if (it === itElemental) achievement_gain('ELEMENT2');
    if (it === itZebra) achievement_gain('ZEBRA2');

    if (it === itMutant) achievement_gain('MUTANT2');
    if (it === itFulgurite) achievement_gain('FULGUR2');

    if (it === itMutant2) achievement_gain('FRUIT2');
    if (it === itWindstone) achievement_gain('DOVE2');
    if (it === itCoral) achievement_gain('CORAL2');
    if (it === itRose) achievement_gain('ROSE2');

    if (it === itBabyTortoise) achievement_gain('TORTOISE2');
    if (it === itDragon) achievement_gain('DRAGON2');
    if (it === itApple) achievement_gain('APPLE2');

    if (it === itKraken) achievement_gain('KRAKEN2');
    if (it === itBarrow) achievement_gain('BARROW2');
    if (it === itTrollEgg) achievement_gain('TROLL2');

    if (it === itAmethyst) achievement_gain('MOUNT2');
    if (it === itSlime) achievement_gain('DUNG2');
    if (it === itDodeca) achievement_gain('DOD2');

    if (it === itGreenGrass) achievement_gain('PRAIR2');
    if (it === itBull) achievement_gain('BULL2');
    
    if (it === itHunting) achievement_gain('TURQ2');
    if (it === itBlizzard) achievement_gain('BLIZZ2');
    if (it === itLavaLily) achievement_gain('LILY2');
    if (it === itTerra) achievement_gain('TERRAC2');

    if (it === itRuins) achievement_gain('RUIN2');
    if (it === itSwitch) achievement_gain('JELLZ2');

    if (it === itBrownian) achievement_gain('BROWN2');
    if (it === itVarTreasure) achievement_gain('RADIO2');
    if (it === itWest) achievement_gain('FREEFALL2');
    
    if (it === itFrog) achievement_gain('FROG2');
    if (it === itEclectic) achievement_gain('ECLEC2');
    if (it === itWet) achievement_gain('WET2');

    if (it === itCursed) achievement_gain('CURSED2');
    if (it === itDice) achievement_gain('DICE2');
    }

  if (q === (G.inv_on ? 50 : 25)) {
    if (it === itDiamond) achievement_gain('DIAMOND3');
    if (it === itRuby) achievement_gain('RUBY3');
    if (it === itHyperstone) achievement_gain('HYPER3');
    if (it === itGold) achievement_gain('GOLD3');
    if (it === itStatue) achievement_gain('STATUE3');
    if (it === itShard) achievement_gain('MIRROR3');
    if (it === itBone) achievement_gain('TOTEM3');
    if (it === itSpice) achievement_gain('SPICE3');
    if (it === itElixir) achievement_gain('ELIXIR3');
    if (it === itHell) achievement_gain('DAISY3');
    if (it === itFeather) achievement_gain('FEATHER3');
    if (it === itSapphire) achievement_gain('SAPPHIRE3');
    if (it === itFernFlower) achievement_gain('FERN3');
    if (it === itRoyalJelly) achievement_gain('JELLY3');
    if (it === itWine) achievement_gain('WINE3');
    if (it === itPower) achievement_gain('POWER3');
    if (it === itEmerald) achievement_gain('EMERALD3');
    if (it === itSilver) achievement_gain('SILVER3');
    if (it === itGrimoire) achievement_gain('GRIMOIRE3');
    if (it === itRedGem) achievement_gain('REDGEM3');
    if (it === itPirate) achievement_gain('PIRATE3');
    if (it === itCoast) achievement_gain('COAST3');
    if (it === itWhirlpool) achievement_gain('WHIRL3');
    if (it === itBombEgg) achievement_gain('MINE3');
    if (it === itPalace) achievement_gain('RUG3');
    if (it === itFjord) achievement_gain('GARNET3');

    if (it === itIvory) achievement_gain('TOWER3');
    if (it === itElemental) achievement_gain('ELEMENT3');
    if (it === itZebra) achievement_gain('ZEBRA3');

    if (it === itMutant) achievement_gain('MUTANT3');
    if (it === itFulgurite) achievement_gain('FULGUR3');
    
    if (it === itMutant2) achievement_gain('FRUIT3');
    if (it === itWindstone) achievement_gain('DOVE3');
    if (it === itCoral) achievement_gain('CORAL3');
    if (it === itRose) achievement_gain('ROSE3');

    if (it === itFulgurite && pureHardcore() && G.elec_lightningfast === 0)
      achievement_gain('HARDMETAL');

    if (it === itBabyTortoise) achievement_gain('TORTOISE3');
    if (it === itDragon) achievement_gain('DRAGON3');
    if (it === itApple) achievement_gain('APPLE3');

    if (it === itKraken) achievement_gain('KRAKEN3');
    if (it === itBarrow) achievement_gain('BARROW3');
    if (it === itTrollEgg) achievement_gain('TROLL3');

    if (it === itAmethyst) achievement_gain('MOUNT3');
    if (it === itSlime) achievement_gain('DUNG3');
    if (it === itDodeca) achievement_gain('DOD3');

    if (it === itGreenGrass) achievement_gain('PRAIR3');
    if (it === itBull) achievement_gain('BULL3');
    
    if (it === itHunting) achievement_gain('TURQ3');
    if (it === itBlizzard) achievement_gain('BLIZZ3');
    if (it === itLavaLily) achievement_gain('LILY3');
    if (it === itTerra) achievement_gain('TERRAC3');

    if (it === itRuins) achievement_gain('RUIN3');
    if (it === itSwitch) achievement_gain('JELLZ3');

    if (it === itBrownian) achievement_gain('BROWN3');
    if (it === itVarTreasure) achievement_gain('RADIO3');
    if (it === itWest) achievement_gain('FREEFALL3');
    
    if (it === itFrog) achievement_gain('FROG3');
    if (it === itEclectic) achievement_gain('ECLEC3');
    if (it === itWet) achievement_gain('WET3');

    if (it === itCursed) achievement_gain('CURSED3');
    if (it === itDice) achievement_gain('DICE3');
    }

  if (q === 50 && !G.inv_on) {
    if (it === itDiamond) achievement_gain('DIAMOND4');
    if (it === itRuby) achievement_gain('RUBY4');
    if (it === itHyperstone) achievement_gain('HYPER4');
    if (it === itGold) achievement_gain('GOLD4');
    if (it === itStatue) achievement_gain('STATUE4');
    if (it === itShard) achievement_gain('MIRROR4');
    if (it === itBone) achievement_gain('TOTEM4');
    if (it === itSpice) achievement_gain('SPICE4');
    if (it === itElixir) achievement_gain('ELIXIR4');
    if (it === itHell) achievement_gain('DAISY4');
    if (it === itFeather) achievement_gain('FEATHER4');
    if (it === itSapphire) achievement_gain('SAPPHIRE4');
    if (it === itFernFlower) achievement_gain('FERN4');
    if (it === itRoyalJelly) achievement_gain('JELLY4');
    if (it === itWine) achievement_gain('WINE4');
    if (it === itPower) achievement_gain('POWER4');
    if (it === itEmerald) achievement_gain('EMERALD4');
    if (it === itSilver) achievement_gain('SILVER4');
    if (it === itGrimoire) achievement_gain('GRIMOIRE4');
    if (it === itRedGem) achievement_gain('REDGEM4');
    if (it === itPirate) achievement_gain('PIRATE4');
    if (it === itCoast) achievement_gain('COAST4');
    if (it === itWhirlpool) achievement_gain('WHIRL4');
    if (it === itBombEgg) achievement_gain('MINE4');
    if (it === itPalace) achievement_gain('RUG4');
    if (it === itFjord) achievement_gain('GARNET4');

    if (it === itIvory) achievement_gain('TOWER4');
    if (it === itElemental) achievement_gain('ELEMENT4');
    if (it === itZebra) achievement_gain('ZEBRA4');

    if (it === itMutant) achievement_gain('MUTANT4');
    if (it === itFulgurite) achievement_gain('FULGUR4');

    if (it === itMutant2) achievement_gain('FRUIT4');
    if (it === itWindstone) achievement_gain('DOVE4');
    if (it === itCoral) achievement_gain('CORAL4');
    if (it === itRose) achievement_gain('ROSE4');

    if (it === itBabyTortoise) achievement_gain('TORTOISE4');
    if (it === itDragon) achievement_gain('DRAGON4');
    if (it === itApple) achievement_gain('APPLE4');

    if (it === itKraken) achievement_gain('KRAKEN4');
    if (it === itBarrow) achievement_gain('BARROW4');
    if (it === itTrollEgg) achievement_gain('TROLL4');

    if (it === itAmethyst) achievement_gain('MOUNT4');
    if (it === itSlime) achievement_gain('DUNG4');
    if (it === itDodeca) achievement_gain('DOD4');

    if (it === itGreenGrass) achievement_gain('PRAIR4');
    if (it === itBull) achievement_gain('BULL4');
    
    if (it === itHunting) achievement_gain('TURQ4');
    if (it === itBlizzard) achievement_gain('BLIZZ4');
    if (it === itLavaLily) achievement_gain('LILY4');
    if (it === itTerra) achievement_gain('TERRAC4');

    if (it === itRuins) achievement_gain('RUIN4');
    if (it === itSwitch) achievement_gain('JELLZ4');

    if (it === itBrownian) achievement_gain('BROWN4');
    if (it === itVarTreasure) achievement_gain('RADIO4');
    if (it === itWest) achievement_gain('FREEFALL4');
    
    if (it === itFrog) achievement_gain('FROG4');
    if (it === itEclectic) achievement_gain('ECLEC4');
    if (it === itWet) achievement_gain('WET4');

    if (it === itCursed) achievement_gain('CURSED4');
    if (it === itDice) achievement_gain('DICE4');
    }
  
  if (it === itOrbYendor) {
    achievement_gain('YENDOR2');
    if (pureHardcore()) achievement_gain('HARDCORE');
    if (G.shmup_on) achievement_gain('SHMUP', rg_shmup);
  }
}

/** This function awards 'counting' achievements, such as kill 10 monsters at the same time.
 *  @param s name of the group of achievements, e.g. GOLEM.
 *  @param current our score, e.g., the the achievement GOLEM2 will be awared with current >= 5.
 *  @param prev previous value of the score. */
export function achievement_count(s: string, current: number, prev: number): void {
  if (G.cheater && !G.test_achievements) return;
  if (G.casual && !G.test_achievements) return;
  if (G.shmup_on) return;
  if (G.randomPatternsMode) return;
  if (changes.on) { changes.at_commit(() => achievement_count(s, current, prev)); return; }

  if (s === 'GOLEM' && current >= 5)
    achievement_gain('GOLEM2');
  if (s === 'GOLEM' && current >= 10)
    achievement_gain('GOLEM3');
  if (s === 'STAB' && current >= 1)
    achievement_gain('STABBER1');
  if (s === 'STAB' && current >= 2)
    achievement_gain('STABBER2');
  if (s === 'SLASH' && current >= 2)
    achievement_gain('SLASH2');
  if (s === 'STAB' && current >= 4)
    achievement_gain('STABBER3');
  if (s === 'MIRRORKILL' && current - prev >= 1)
    achievement_gain('MIRRORKILL1');
  if (s === 'MIRRORKILL' && current - prev >= 2)
    achievement_gain('MIRRORKILL2');
  if (s === 'MIRRORKILL' && current - prev >= 3)
    achievement_gain('MIRRORKILL3');
  if (s === 'FLASH' && current - prev >= 1)
    achievement_gain('FLASH1');
  if (s === 'FLASH' && current - prev >= 5)
    achievement_gain('FLASH2');
  if (s === 'FLASH' && current - prev >= 10)
    achievement_gain('FLASH3');
  if (s === 'LIGHTNING' && current - prev >= 1)
    achievement_gain('LIGHTNING1');
  if (s === 'LIGHTNING' && current - prev >= 5)
    achievement_gain('LIGHTNING2');
  if (s === 'LIGHTNING' && current - prev >= 10)
    achievement_gain('LIGHTNING3');
  if (s === 'MIRAGE' && current >= 35)
    achievement_gain('MIRAGE', specgeom_euclid_gen());
  if (s === 'ORB' && current >= 10)
    achievement_gain('ORB3');
  if (s === 'BUG' && current >= 1000)
    achievement_gain('BUG3');
  if (s === 'ELEC' && current >= 10)
    achievement_gain('ELEC3');
  if (s === 'BOWVARIETY' && current >= 2)
    achievement_gain('BOWVARIETY1');
  if (s === 'BOWVARIETY' && current >= 6)
    achievement_gain('BOWVARIETY2');
}

// int specific_improved, specific_what: used only under CAP_ACHIEVE

export function improve_score(i: number, what: eItem): void {
  if (G.offlineMode) return;
  if (changes.on) { changes.at_commit(() => improve_score(i, what)); return; }
  // #if CAP_ACHIEVE ... (dropped)
}

// scores for special challenges
export function achievement_score(_cat: number, _number: number): void {
  if (G.offlineMode) return;
  // #if CAP_ACHIEVE ... (dropped)
}

export function improveItemScores(): void {
  if (changes.on) { changes.at_commit(() => improveItemScores()); return; }
  for (let i = 1; i <= 12; i++) improve_score(i, i);
  improve_score(17, itOrbYendor);
  improve_score(18, itFernFlower);
  improve_score(19, itRoyalJelly);
  improve_score(20, itPower);
  improve_score(21, itSilver);
  improve_score(22, itWine);
  improve_score(23, itEmerald);
  improve_score(24, itGrimoire);
  improve_score(25, itHolyGrail);
  improve_score(26, itRedGem);
  improve_score(27, itPirate);
  improve_score(31, itBombEgg);
  improve_score(32, itCoast);
  improve_score(33, itWhirlpool);
  improve_score(34, itPalace);
  improve_score(35, itFjord);

  improve_score(37, itIvory);
  improve_score(38, itElemental);
  improve_score(39, itZebra);

  improve_score(42, itMutant);
  improve_score(43, itFulgurite);

  if (!isHaunted(G.cwt.at.land)) improve_score(46, itLotus);
  improve_score(47, itMutant2);
  improve_score(48, itWindstone);

  improve_score(51, itCoral);
  improve_score(52, itRose);

  improve_score(54, itBabyTortoise);
  improve_score(55, itDragon);
  improve_score(56, itApple);

  improve_score(58, itKraken);
  improve_score(59, itBarrow);
  improve_score(60, itTrollEgg);

  improve_score(64, itAmethyst);
  improve_score(65, itSlime);
  improve_score(66, itDodeca);

  improve_score(67, itGreenGrass);
  improve_score(68, itBull);

  improve_score(72, itTerra);
  improve_score(73, itBlizzard);
  improve_score(74, itLavaLily);
  improve_score(75, itHunting);

  improve_score(76, itRuins);
  improve_score(77, itSwitch);

  improve_score(78, itBrownian);
  improve_score(79, itVarTreasure);
  improve_score(80, itWest);

  improve_score(82, itFrog);
  improve_score(83, itEclectic);
  improve_score(84, itWet);

  improve_score(85, itCursed);
  improve_score(86, itDice);
}

// int next_stat_tick: used only under CAP_ACHIEVE

/** gain the final achievements.
 *  @param really_final false: the user is simply looking at the score; true: the game really ended. */
export function achievement_final(really_final: boolean): void {
  if (G.offlineMode) return;

  if (changes.on) { changes.at_commit(() => achievement_final(really_final)); return; }

  // #if CAP_ACHIEVE ... (dropped)
}

// EX bool hadtotalvictory: G.hadtotalvictory

export function check_total_victory(): void {
  if (!G.inv_on) return;
  if (G.hadtotalvictory) return;
  if (!G.items[itOrbYendor]) return;
  if (!G.items[itHolyGrail]) return;
  if (G.items[itHyperstone] < 50) return;
  if (!G.princess_reviveAt) return;
  if (changes.on) { changes.at_commit(() => check_total_victory()); return; }
  G.hadtotalvictory = true;
  achievement_gain('TOTALVICTORY');
}

// EX debugflag debug_achievements = {"steam_achievements"}: the debug log is left out

/** gain the victory achievements.
 *  @param hyper true for the Hyperstone victory, and false for the Orb of Yendor victory. */
export function achievement_victory(_hyper: boolean): void {
  // if(debug_achievements) println(hlog, "achievement_victory");
  if (G.offlineMode) return;
  // #if CAP_ACHIEVE ... (dropped)
}

/** EX hookset<string()> hooks_rich_presence */
export const hooks_rich_presence = new hookset<() => string>();

export function get_rich_presence_text(): string {

  const s = callhandlers('', hooks_rich_presence);
  if (s !== '') return s;

  // CAP_DAILY=0

  if (G.tour_on)
    return 'Guided Tour';

  let res = '';
  if (G.geometry !== gNormal || !BITRUNCATED() || G.disksize)
    res = res + full_geometry_name() + ' ';

  if (G.land_structure !== default_land_structure()) res += land_structure_name(false) + ' ';
  if (G.shmup_on) res += 'shmup ';
  if (G.dual_state) res += 'dual ';
  if (G.randomPatternsMode) res += 'random ';
  if (G.inv_on) res += 'OSM ';
  if (G.multi_players > 1) res += 'multi ';
  if (G.casual) res += 'casual ';
  if (G.bow_weapon) res += G.bow_style === 0 /* bow::cbBull */ ? 'bow/bull ' : 'bow/geo ';

  if (G.cheater || G.cwt.at.land === laCanvas || G.cwt.at.land === laCA)
    return res + '(?)';

  if (G.yendor_on) {
    res += 'Yendor Challenge: ' + yendor_name(G.yendor_challenge);
    if (G.items[itOrbYendor]) res += ' (level ' + its(G.items[itOrbYendor]) + ')';
    return res;
  }

  if (G.peace_on) return res + 'peaceful';

  if (G.tactic_on)
    return res + 'PTM: ' + linf[G.specialland].name + ' $' + its(gold());

  if (G.princess_challenge) return res + 'Princess Challenge';

  // CAP_RACING
  if (G.racing_on) {
    throw new NotPorted('get_rich_presence_text: racing');
  }

  res += linf[G.cwt.at.land].name;
  res += ', ' + its(gold()) + ' $$$';

  return res;
}

/** display the last achievement gained (CAP_ACHIEVE only: nothing) */
export function achievement_display(): void {
  // #if CAP_ACHIEVE ... (dropped)
}

export function isAscending(i: number): boolean {
  return i === 13 || i === 14 || i === 15 || i === 16 || i === 29 || i === 30 || i === 45;
}

export function score_default(i: number): number {
  if (isAscending(i)) return 1999999999;
  else return 0;
}

/** the static initializers of achievement.cpp */
export function register_achievement(): void {
  G.all_specgeom_checks = [specgeom_zebra, specgeom_lovasz, specgeom_halloween, specgeom_heptagonal,
    // CAP_CRYSTAL
    specgeom_crystal1, specgeom_crystal2,
    specgeom_euclid_gen];
}
