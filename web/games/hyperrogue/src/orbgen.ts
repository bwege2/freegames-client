// orbgen.cpp of HyperRogue 13.1o: orb generation (which orbs in which lands, prize/local/crossroads orbs).
// Package P2. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// EX vector<orbinfo> orbinfos and EX string olrDescriptions[] are G.orbinfos / G.olrDescriptions; their initial
// contents are the tables orbinfos_table / olrDescriptions_table here, which register_orbgen() (static
// initialization, called by hyper-main in include order) puts into G.
import { G } from './globals.ts';
import { among, PRIZEMUL } from './hyper.ts';
import { itrunc, idiv } from './cpp.ts';
import type { cell } from './locations.ts';
import {
  type eItem, type eLand, ittypes, IC_TREASURE,
  laGraveyard, laJungle, laIce, laCaves, laAlchemist, laDesert, laHell, laRlyeh, laMotion, laDragon, laDryForest,
  laCocytus, laDeadCaves, laEmerald, laWineyard, laHive, laPower, laMinefield, laTemple, laCaribbean, laRedRock,
  laCamelot, laOcean, laPalace, laZebra, laLivefjord, laPrincessQuest, laIvoryTower, laElementalWall, laStorms,
  laOvergrown, laWhirlwind, laHaunted, laClearing, laRose, laWarpCoast, laTortoise, laEndorian, laKraken, laBurial,
  laTrollheim, laMountain, laDungeon, laReptile, laBull, laPrairie, laWhirlpool, laVolcano, laHunting, laBlizzard,
  laTerracotta, laDual, laSnakeNest, laDocks, laSwitch, laMagnetic, laRuins, laWestWall, laVariant, laBrownian,
  laFrog, laEclectic, laWet, laCursed, laDice, laMirror, laMirrorOld, laCrossroads5, laMercuryRiver, laWarpSea,
  laHauntedWall, laHauntedBorder,
  itNone, itGreenStone, itOrbLightning, itOrbFlash, itOrbLife, itOrbSpeed, itOrbShield, itOrbYendor, itOrbTeleport,
  itOrbSafety, itOrbWinter, itOrbMorph, itOrbDigging, itOrbThorns, itOrbPsi, itOrbAether, itOrbInvis, itOrbFire,
  itOrbFriend, itOrbDragon, itOrbTime, itOrbSpace, itOrbIllusion, itOrbEmpathy, itOrbAir, itOrbDiscord, itOrbFrog,
  itOrbFish, itOrbLove, itOrbMatter, itOrbSummon, itOrbStunning, itOrbWoods, itOrbLuck, itOrbUndeath, itOrbFreedom,
  itOrbBeauty, itOrb37, itOrbDomination, itOrbShell, itOrbEnergy, itOrbSword, itOrbSword2, itOrbStone, itOrbNature,
  itOrbRecall, itOrbDash, itOrbHorns, itOrbBull, itOrbLava, itOrbSide3, itOrbSide1, itOrbSide2, itOrbPhasing,
  itOrbMagnetism, itOrbSlaying, itOrbGravity, itOrbIntensity, itOrbChoice, itOrbImpact, itOrbChaos, itOrbPlague,
  itOrbPurity, itOrbWater, itOrbMirror, itShard, itHyperstone,
  waTrapdoor, waStrandedBoat,
} from './content.ts';
import { isElemental, isHaunted, itemBurns, isGravityLand, cellHalfvine, itemclass } from './flags.ts';
import { hrand } from './rand.ts';
import { isCrossroads, treasureType, landMultiplier, in_full_game, ls_any_chaos, ls_single } from './landlock.ts';
import { mirror_build, princess_dist, OUT_OF_PRISON } from './complex.ts';
import { cellEdgeUnstable } from './mapeffects.ts';
import { R10 } from './content-req.ts';
import { hyperbolic, S3, quotient } from './classes.ts';
import { arcm_in } from './archimedean.ts';

// enum eOrbLandRelation
export const olrForbidden = 0; // never appears: forbidden
export const olrDangerous = 1; // never appears: would be dangerous
export const olrUseless = 2;   // never appears: useless here
export const olrNoPrizes = 3;  // no prizes in this land
export const olrNoPrizeOrb = 4;// orb not allowed as a prize
export const olrPrize25 = 5;   // prize for collecting 25
export const olrPrize3 = 6;    // prize for collecting 3
export const olrNative = 7;    // native orb in this land
export const olrNative1 = 8;   // native orb in this land (1)
export const olrGuest = 9;     // extra orb in this land
export const olrPNative = 10;  // Land of Power: native
export const olrPBasic = 11;   // Land of Power: basic orbs
export const olrPPrized = 12;  // Land of Power: prized orbs
export const olrPNever = 13;   // Land of Power: foreign orbs
export const olrHub = 14;      // hub lands
export const olrMonster = 15;  // available from a monster
export const olrAlways = 16;   // always available
export const olrBurns = 17;    // burns
export type eOrbLandRelation = number;

// namespace orbgenflags
/** generates in the given land from 10 treasures, in the classic mode */
export const orbgenflags_LOCAL10 = 1;
/** generates in the Crossroads from 10 treasures, in the classic mode */
export const orbgenflags_CROSS10 = 2;
/** generates in other places from 25 treasures, in the classic mode */
export const orbgenflags_GLOBAL25 = 4;
/** in OSM you get it once at 10 treasures */
export const orbgenflags_OSM_AT10 = 8;
/** 'native' functions return this */
export const orbgenflags_NATIVE = 64;
/** 'local' orb will be also placed in OSM (at 25 treasures); needs LOCAL10 */
export const orbgenflags_OSM_LOCAL25 = 128;
/** 'crossroads' orb will be also placed in OSM (at 50 treasures) */
export const orbgenflags_OSM_CROSS50 = 256;
/** 'crossroads' orb will be also placed in OSM (at 25 treasures) */
export const orbgenflags_OSM_CROSS25 = 512;
/** 'global' orb will be also placed in OSM (at 100 treasures) */
export const orbgenflags_OSM_GLOBAL100 = 1024;
/** do not create in the Crossroads in the tactics mode */
export const orbgenflags_NO_TACTIC = (1 << 11);
/** guest Orb */
export const orbgenflags_GUEST = (1 << 12);
// typical combinations
export const orbgenflags_S_NATIVE = orbgenflags_LOCAL10 | orbgenflags_CROSS10 | orbgenflags_GLOBAL25 | orbgenflags_NATIVE;
export const orbgenflags_S_GUEST = orbgenflags_LOCAL10 | orbgenflags_OSM_AT10 | orbgenflags_GUEST;
export const orbgenflags_S_YENDOR = orbgenflags_S_NATIVE | orbgenflags_OSM_LOCAL25 | orbgenflags_OSM_CROSS50 | orbgenflags_OSM_GLOBAL100 | orbgenflags_NO_TACTIC;
export const orbgenflags_S_NAT_NT = orbgenflags_S_NATIVE | orbgenflags_NO_TACTIC;
export const orbgenflags_S_NA_O25 = orbgenflags_S_NATIVE | orbgenflags_OSM_CROSS25;

/** struct orbinfo */
export class orbinfo {
  flags: number;
  l: eLand;
  lchance: number;
  gchance: number;
  orb: eItem;
  constructor(flags = 0, l: eLand = 0, lchance = 0, gchance = 0, orb: eItem = 0) {
    this.flags = flags; this.l = l; this.lchance = lchance; this.gchance = gchance; this.orb = orb;
  }
  is_native(): boolean { return (this.flags & orbgenflags_NATIVE) !== 0; }
}

const N = orbgenflags_S_NATIVE, GU = orbgenflags_S_GUEST, NT = orbgenflags_S_NAT_NT;
const o = (f: number, l: eLand, lc: number, gc: number, it: eItem): orbinfo => new orbinfo(f, l, lc, gc, it);

/** EX vector<orbinfo> orbinfos (G.orbinfos is this array) */
export const orbinfos_table: orbinfo[] = [
  o(N, laGraveyard, 200, 200, itGreenStone), // must be first so that it does not reduce
  o(N, laJungle, 1200, 1500, itOrbLightning),
  o(N, laIce, 2000, 1500, itOrbFlash),
  o(N, laCaves, 1800, 2000, itOrbLife),
  o(N, laAlchemist, 800, 800, itOrbSpeed),
  o(N, laDesert, 2500, 1500, itOrbShield),
  o(orbgenflags_S_YENDOR, laHell, 2000, 1000, itOrbYendor),
  o(N, laRlyeh, 1500, 1500, itOrbTeleport),
  o(orbgenflags_S_NA_O25, laMotion, 2000, 700, itOrbSafety),
  o(GU, laIce, 1500, 0, itOrbWinter),
  o(GU, laDragon, 2500, 0, itOrbWinter),
  o(GU, laDryForest, 2500, 0, itOrbWinter),
  o(N, laCocytus, 1500, 1500, itOrbMorph),
  o(GU, laCocytus, 1500, 0, itOrbWinter),
  o(GU, laCaves, 1200, 0, itOrbDigging),
  o(N, laDryForest, 500, 4500, itOrbThorns),
  o(GU, laDeadCaves, 1800, 0, itGreenStone),
  o(NT, laDeadCaves, 1800, 1500, itOrbDigging),
  o(N, laEmerald, 1500, 3500, itOrbPsi),
  o(N, laWineyard, 900, 1200, itOrbAether),
  o(N, laHive, 800, 1200, itOrbInvis),
  o(N, laPower, 0, 3000, itOrbFire),
  o(N, laMinefield, 0, 3500, itOrbFriend),
  o(N, laTemple, 0, 3000, itOrbDragon),
  o(N, laCaribbean, 0, 3500, itOrbTime),
  o(N, laRedRock, 0, 2500, itOrbSpace),
  o(N, laCamelot, 1000, 1500, itOrbIllusion),
  o(N, laOcean, 0, 1500, itOrbEmpathy),
  o(GU, laOcean, 0, 0, itOrbAir),
  o(N, laPalace, 0, 4000, itOrbDiscord),
  o(GU, laPalace, 0, 0, itOrbFrog),
  o(N, laZebra, 500, 2100, itOrbFrog),
  o(NT, laLivefjord, 0, 1800, itOrbFish),
  o(NT, laPrincessQuest, 0, 200, itOrbLove),
  o(N, laIvoryTower, 500, 4000, itOrbMatter),
  o(NT, laElementalWall, 1500, 4000, itOrbSummon),
  o(N, laStorms, 1000, 2500, itOrbStunning),
  o(N, laOvergrown, 1000, 800, itOrbWoods),
  o(GU, laOvergrown, 1000, 0, itOrbLuck),
  o(N, laWhirlwind, 1250, 3000, itOrbAir),
  o(N, laHaunted, 1000, 5000, itOrbUndeath),
  o(N, laClearing, 5000, 5000, itOrbFreedom),
  o(N, laRose, 2000, 8000, itOrbBeauty),
  o(N, laWarpCoast, 2000, 8000, itOrb37),
  o(N, laDragon, 500, 5000, itOrbDomination),
  o(N, laTortoise, 2500, 1500, itOrbShell),
  o(N, laEndorian, 150, 2500, itOrbEnergy),
  o(GU, laEndorian, 450, 0, itOrbTeleport),
  o(N, laKraken, 500, 2500, itOrbSword),
  o(N, laBurial, 500, 2500, itOrbSword2),
  o(N, laTrollheim, 750, 1800, itOrbStone),
  o(N, laMountain, 400, 3500, itOrbNature),
  o(N, laDungeon, 120, 2500, itOrbRecall),
  o(N, laReptile, 500, 2100, itOrbDash),
  o(N, laBull, 720, 3000, itOrbHorns),
  o(N, laPrairie, 0, 3500, itOrbBull),
  o(GU, laWhirlpool, 0, 0, itOrbSafety),
  o(N, laVolcano, 0, 7000, itOrbLava),
  o(N, laHunting, 0, 2500, itOrbSide3),
  o(N, laBlizzard, 0, 2000, itOrbWinter),
  o(N, laTerracotta, 800, 2500, itOrbSide1),
  o(N, laDual, 600, 2500, itOrbSide2),
  o(GU, laSnakeNest, 2000, 0, itOrbDomination),
  o(GU, laDocks, 3000, 0, itOrbFish),
  o(GU, laDocks, 3000, 0, itOrbDragon),
  o(GU, laDocks, 3000, 0, itOrbDash),
  o(GU, laSwitch, 2000, 0, itOrbSpace),
  o(N, laSwitch, 2000, 3000, itOrbPhasing),
  o(N, laMagnetic, 2000, 3000, itOrbMagnetism),
  o(N, laRuins, 1200, 2500, itOrbSlaying),
  o(N, laWestWall, 2000, 4200, itOrbGravity),
  o(N, laVariant, 900, 4200, itOrbIntensity),
  o(GU, laVariant, 4000, 0, itOrbFire),
  o(GU, laVariant, 4000, 0, itOrbWinter),
  o(GU, laVariant, 4000, 0, itOrbPhasing),
  o(GU, laVariant, 4000, 0, itOrbDash),
  o(N, laBrownian, 900, 4200, itOrbChoice),
  o(GU, laBrownian, 1000, 0, itOrbAir),
  o(GU, laBrownian, 1000, 0, itOrbDash),
  o(GU, laBrownian, 1000, 0, itOrbSafety),
  o(N, laFrog, 1000, 1500, itOrbImpact),
  o(N, laEclectic, 1000, 1000, itOrbChaos),
  o(GU, laEclectic, 4000, 0, itOrbWinter),
  o(GU, laEclectic, 2000, 0, itOrbLightning),
  o(N, laWet, 800, 2500, itOrbPlague),
  o(GU, laWet, 1200, 0, itOrbFish),
  o(GU, laWet, 1200, 0, itOrbAether),
  o(GU, laWet, 1200, 0, itOrbFrog),
  o(N, laCursed, 400, 1500, itOrbPurity),
  o(NT, laDice, 500, 800, itOrbLuck),
  o(GU, laDice, 750, 0, itOrbAir),
  o(N, laWhirlpool, 0, 2000, itOrbWater), // needs to be last
];

/** the static initializers of orbgen.cpp */
export function register_orbgen(): void {
  G.orbinfos = orbinfos_table;
  G.olrDescriptions = olrDescriptions_table;
}

export function nativeOrbType(l: eLand): eItem {
  if (isElemental(l)) l = laElementalWall;
  if (G.inv_on && (l === laMirror || l === laMirrorOld || isCrossroads(l)))
    return itOrbMirror;
  if (l === laMirror || l === laMirrorOld) return itShard;
  for (const oi of G.orbinfos)
    if (oi.l === l && oi.is_native())
      return oi.orb;
  return itNone;
}

let getNativityOrbInfo_oi: orbinfo | null = null;

export function getNativityOrbInfo(orb: eItem): orbinfo {
  for (const oi of G.orbinfos)
    if (oi.orb === orb && oi.is_native())
      return oi;
  if (!getNativityOrbInfo_oi) getNativityOrbInfo_oi = new orbinfo();
  getNativityOrbInfo_oi.l = laMirror;
  return getNativityOrbInfo_oi;
}

/** EX string olrDescriptions[18] */
export const olrDescriptions_table: string[] = [
  'forbidden to find in %the1',
  'too dangerous to use in %the1',
  'useless in %the1',
  'only native Orbs allowed in %the1',
  'this Orb is never unlocked globally (only hubs)',
  'collect 25 %2 to unlock it in %the1',
  'collect 3 %2 to unlock it in %the1',
  'native to %the1 (collect 10 %2)',
  'native to %the1 (collect 1 %2)',
  'secondary in %the1 (collect 10 %3, or 25 %2)',
  'the native Orb of %the1',
  'this Orb appears on floors and is used by witches',
  'a prized Orb, it appears only in cabinets',
  'this Orb never appears in %the1',
  'Hub Land: orbs appear here if unlocked in their native land',
  'kill a monster, or collect 25 %2',
  'always available',
  'would be destroyed in %the1',
];

export function getOLR(it: eItem, l: eLand): eOrbLandRelation {

  if (l === laMotion && it === itOrbChoice && !G.inv_on) return olrUseless;

  if (l === laPower) {
    if (it === itOrbFire) return olrPNative;

    if (
      it === itOrbFlash || it === itOrbSpeed || it === itOrbWinter || it === itOrbAether ||
      it === itOrbLife) return olrPBasic;

    if (
      it === itOrbLightning || it === itOrbThorns || it === itOrbInvis ||
      it === itOrbShield || it === itOrbTeleport || it === itOrbPsi ||
      it === itOrbDragon || it === itOrbIllusion || it === itOrbTime)
      return olrPPrized;

    return olrPNever;
  }

  if (it === itOrbWater && l === laWestWall) return olrUseless;
  if (it === itOrbSafety && l === laCrossroads5) return olrDangerous;
  if (it === itOrbFire && l === laKraken) return olrUseless;
  if (it === itOrbDragon && l === laKraken) return olrUseless;
  if (it === itOrbDigging && l === laKraken) return olrUseless;
  if (it === itOrbIllusion && l === laKraken) return olrUseless;

  if (it === itOrbYendor && among(l, laWhirlwind, laWestWall)) return olrUseless;

  if (it === itOrbLife && (l === laKraken)) return olrUseless;

  if (l === laVolcano && it === itOrbSafety) return olrDangerous;
  if (l === laVariant && it === itOrbSafety) return olrDangerous;
  if (l === laVolcano && itemBurns(it)) return olrBurns;

  if (it === itOrbAir && l === laAlchemist) return olrUseless;
  // if(it == itOrbShield && l == laMotion) return olrUseless;

  if (it === itOrbIllusion && l === laCamelot) return olrNative1;
  if (it === itOrbLove) return olrNoPrizeOrb;
  if (nativeOrbType(l) === it) return olrNative;

  for (const oi of G.orbinfos)
    if ((oi.flags & orbgenflags_GUEST) && oi.l === l && oi.orb === it)
      return olrGuest;

  if (it === itOrbLuck && l === laIvoryTower)
    return olrUseless;
  if (it === itOrbLuck && l === laEndorian)
    return olrUseless;
  if (it === itOrbLuck && l === laDungeon)
    return olrUseless;
  if (it === itOrbWater && l === laRedRock)
    return olrUseless;
  if (it === itOrbLuck && l === laTortoise)
    return olrUseless;
  if (it === itOrbLuck && l === laMountain)
    return olrUseless;
  if (it === itOrbLuck && l === laWestWall)
    return olrUseless;
  if (it === itOrbLuck && l === laCamelot)
    return olrUseless;
  if (it === itOrbLuck && l === laHaunted)
    return olrUseless;
  if (it === itOrbNature && l === laWineyard)
    return olrDangerous;
  if ((it === itOrbFrog || it === itOrbDiscord) && l === laPrincessQuest)
    return olrGuest;
  if (it === itOrbDragon && l === laRlyeh)
    return olrMonster;

  if (it === itOrbSafety && l === laWhirlpool)
    return olrAlways;
  if (it === itOrbSafety && l === laPrairie)
    return olrAlways;
  if (it === itGreenStone && isHaunted(l))
    return olrAlways;
  if (it === itOrbWater && l === laLivefjord)
    return olrMonster;
  if (isCrossroads(l) || l === laOcean)
    return olrHub;

  if (it === itOrbSlaying && !among(l,
    laMirror, laHell, laEmerald, laDryForest, laCamelot, laPalace, laStorms, laRose, laTortoise, laBurial, laDungeon, laReptile,
    laPrairie, laBull, laVolcano, laTerracotta, laRuins, laVariant, laEclectic, laBrownian, laCursed))
    return olrUseless;

  if (l === laCocytus)
    if (it === itOrbDragon || it === itOrbFire || it === itOrbFlash || it === itOrbLightning)
      return olrDangerous;

  if (it === itOrbSafety) {
    if (l === laCaves || l === laLivefjord || l === laRedRock || l === laCocytus || l === laHell ||
      l === laDesert || l === laAlchemist || l === laDeadCaves || l === laMinefield ||
      l === laDragon || l === laWet || l === laCursed)
      return olrDangerous;
    if (isHaunted(l))
      return olrForbidden;
  }

  if (it === itOrbMatter)
    if (among(l, laCaves, laEmerald, laAlchemist, laCaribbean, laMinefield, laCocytus, laWestWall))
      return olrUseless;

  if (l === laPrincessQuest)
    if (among(it, itOrbAether, itOrbFlash, itOrbTeleport, itOrbSummon, itOrbFreedom, itOrbFriend, itOrbPhasing, itOrbChaos))
      return olrForbidden;

  if (l === laTemple)
    return olrNoPrizes;

  if (it === itOrbDigging) {
    if (among(l, laCaves, laOcean, laLivefjord, laEmerald, laDesert, laDeadCaves, laRedRock, laCaribbean, laGraveyard,
      laMountain, laHunting, laWarpSea, laWarpCoast, laCursed, laWet))
      return olrPrize25;
    return olrUseless;
  }

  if (it === itOrbWoods && (l === laWarpSea || l === laWarpCoast))
    return olrDangerous;

  if (it === itOrbWoods && !among(l,
    laDryForest, laWineyard, laCaribbean, laOvergrown, laHaunted, laHauntedWall, laHauntedBorder, laTortoise, laFrog, laEclectic,
    laVariant, laBull))
    return olrUseless;

  if (it === itShard) {
    if (l === laDesert || l === laIce || l === laJungle || l === laGraveyard ||
      l === laRlyeh || l === laHell || l === laDryForest || l === laWineyard ||
      l === laHive || l === laCamelot || l === laRedRock || l === laPalace ||
      l === laLivefjord || l === laZebra || isElemental(l) || l === laPrincessQuest ||
      l === laDragon || l === laTortoise || l === laBurial || l === laTrollheim ||
      l === laOcean || l === laHaunted || l === laWarpCoast || l === laRose)
      return olrPrize25;
    return olrForbidden;
  }

  if (it === itOrbWater)
    if (l === laMotion || l === laZebra || l === laIvoryTower || l === laEndorian ||
      l === laMountain || l === laReptile || l === laDungeon)
      return olrUseless;

  if (it === itOrbWinter && l === laMinefield)
    return olrForbidden;

  if (it === itOrbWinter && !among(l, laRlyeh, laTemple, laVolcano, laCursed))
    return olrUseless;

  if (it === itOrbLife && l === laMotion)
    return olrUseless;

  if (it === itOrbFish && l === laKraken)
    return olrAlways;

  if (it === itOrbSword && l === laBurial)
    return olrAlways;

  if (it === itOrbFish && !among(l, laOcean, laLivefjord, laWhirlpool, laCamelot, laTortoise, laWarpCoast, laWarpSea, laCocytus, laBrownian, laVariant, laWet, laFrog))
    return olrUseless;

  if (it === itOrbDomination && l !== laOcean && l !== laRedRock && l !== laDesert &&
    l !== laRlyeh && l !== laDragon)
    return olrUseless;

  if (it === itOrbIllusion) return olrPrize3;

  if (l === laTortoise)
    if (it === itOrbFlash || it === itOrbLightning || it === itOrbFreedom ||
      it === itOrbPsi || it === itOrbFriend || it === itOrbDragon)
      return olrForbidden;

  if (l === laEndorian)
    if (it === itOrbDragon || it === itOrbFire || it === itOrbLightning || it === itOrbLava)
      return olrDangerous;

  if (isHaunted(l) && it === itOrbLava)
    return olrUseless;

  if (l === laGraveyard && it === itOrbLava)
    return olrUseless;

  if (l === laDryForest)
    if (it === itOrbFire || it === itOrbLightning || it === itOrbLava)
      return olrDangerous;

  if (l === laWet && among(it, itOrbDragon, itOrbLava, itOrbFire))
    return olrUseless;

  if (l === laDungeon) {
    if (it === itOrbSafety || it === itOrbFrog ||
      it === itOrbTeleport || it === itOrbMatter || it === itOrbNature ||
      it === itOrbAether || it === itOrbSummon || it === itOrbStone || it === itOrbChaos)
      return olrForbidden;
  }

  if (l === laTerracotta && it === itOrbFriend)
    return olrDangerous;

  return olrPrize25;
}

export function orbsUnlocked(): number {
  let i = 0;
  for (let t = 0; t < ittypes; t++)
    if (itemclass(t) === IC_TREASURE && G.items[t] >= R10())
      i++;
  return i;
}

export function orbprizefun(tr: number): number {
  if (G.tactic_on) return 1;
  if (tr < 10) return 0;
  return .6 + .4 * Math.log(tr / 25.) / Math.log(2);
}

export function orbcrossfun(tr: number): number {
  if (G.tactic_on || (ls_single() && isCrossroads(G.specialland))) return 1;
  if (tr < 10) return 0;
  if (tr > 25) return 1;
  return (tr * 2 + 50) / 100.;
}

export function buildPrizeMirror(c: cell, freq: number): boolean {
  if (G.inv_on) return false;
  if (G.items[itShard] < 25) return false;
  // hrand(int): the double argument is truncated
  if (freq && hrand(itrunc(freq * 100 / orbprizefun(G.items[itShard]))) >= 100)
    return false;
  return mirror_build(c);
}

export function getPrizeLand(c: cell = G.cwt.at): eLand {
  let l = c.land;
  if (isElemental(l)) l = laElementalWall;
  if (isHaunted(l)) l = laHaunted;
  if (l === laMercuryRiver) l = laTerracotta;
  if (l === laWarpSea) l = laWarpCoast;
  if (l === laPalace && princess_dist(c) < OUT_OF_PRISON)
    l = laPrincessQuest;
  return l;
}

export function placePrizeOrb(c: cell): void {
  if (G.peace_on) return;
  // CAP_DAILY=0: if(daily::on) return;

  const l = getPrizeLand(c);

  // these two lands would have too much orbs according to normal rules
  if (l === laPalace && hrand(100) >= 20) return;
  if (l === laPrincessQuest && hrand(100) >= 20) return;
  if (l === laGraveyard && hrand(100) >= 15) return;
  if (l === laBurial && hrand(100) >= 10) return;
  if (l === laLivefjord && hrand(100) >= 35) return;
  if (l === laMinefield && hrand(100) >= 25) return;
  if (l === laElementalWall && hrand(100) >= 25) return;

  for (const oi of G.orbinfos) {
    if (!(oi.flags & orbgenflags_GLOBAL25)) continue;

    let mintreas = 25;
    if (G.inv_on) {
      if (oi.flags & orbgenflags_OSM_GLOBAL100) mintreas = 100;
      else continue;
    }

    const olr = getOLR(oi.orb, l);
    if (olr !== olrPrize25 && olr !== olrPrize3) continue;
    let treas = G.items[treasureType(oi.l)];
    if (olr === olrPrize3) treas *= 10;
    if (olr === olrPrize25 || olr === olrPrize3 || olr === olrGuest || olr === olrMonster || olr === olrAlways) {
      if (treas < mintreas) continue;
    }
    else continue;

    let gch = oi.gchance;
    if (!gch) continue;
    gch = itrunc(gch / orbprizefun(treas));
    if (hrand(gch) >= 60) continue;
    if (oi.orb === itOrbWater && c.land !== laOcean && c.land !== laKraken) {
      if (cellHalfvine(c)) continue;
      c.item = oi.orb;
      c.wall = waStrandedBoat;
      return;
    }
    c.item = oi.orb;
  }

  // printf("land: %s orb: %s\n", dnameof(l), dnameof(c->item));
}

// 10 not in chaos, less in chaos
export function treasureForLocal(): number {
  return (ls_any_chaos() ? 1 + hrand(10) : 10);
}

export function extra_safety_for_memory(c: cell): boolean {
  if (hyperbolic() && (arcm_in() || S3() > 3) && !quotient() && !G.tactic_on && in_full_game()) {
    if (hrand(1000) < 1) {
      c.item = itOrbSafety;
      return true;
    }
  }
  return false;
}

export function placeLocalOrbs(c: cell): void {
  let l = c.land;
  if (l === laZebra && c.wall === waTrapdoor) return;
  if (isGravityLand(l) && l !== laWestWall && cellEdgeUnstable(c)) return;
  if (isElemental(l)) l = laElementalWall;
  // CAP_DAILY=0: if(daily::on) return;

  if (extra_safety_for_memory(c)) return;

  if (G.peace_on) return;

  for (const oi of G.orbinfos) {
    if (!(oi.flags & orbgenflags_LOCAL10)) continue;
    if (oi.l !== l) continue;
    if (G.yendor_on && (oi.orb === itOrbSafety || oi.orb === itOrbYendor))
      continue;
    if (!oi.lchance) continue;
    let ch = hrand(oi.lchance);
    if (ch === 1 && ls_any_chaos() && hrand(2) === 0 && G.items[treasureType(oi.l)] * landMultiplier(oi.l) >= (11 + hrand(15)))
      ch = 0;
    let tc = G.items[treasureType(oi.l)] * landMultiplier(oi.l);
    let tcmin = treasureForLocal();
    if (G.inv_on) {
      if (!(oi.flags & orbgenflags_OSM_LOCAL25))
        tc = 0;
      else
        tcmin = 25;
    }
    if (ch === 0 && tc >= tcmin) {
      // printf("local orb\n");
      c.item = oi.orb;
      if (oi.orb === itOrbWater && c.land !== laOcean) c.wall = waStrandedBoat;
      return;
    }
    else if (oi.gchance && (ch >= 1 && ch < 11) && getOLR(itShard, l) === olrPrize25 && l !== laRedRock && l !== laWhirlwind)
      buildPrizeMirror(c, 10);
    else if (oi.gchance && (ch >= 11 && ch < 11 + PRIZEMUL))
      placePrizeOrb(c);
  }
}

export function placeLocalSpecial(c: cell, outof: number, loc = 1, priz = 1): void {
  if (G.safety || extra_safety_for_memory(c) || G.peace_on) return; // CAP_DAILY=0: daily::on dropped
  const i = hrand(outof);
  if (i < loc && G.items[treasureType(c.land)] >= treasureForLocal() && !G.inv_on)
    c.item = nativeOrbType(c.land);
  else if (i >= loc && i < loc + PRIZEMUL * priz)
    placePrizeOrb(c);
}

export function placeCrossroadOrbs(c: cell): void {
  if (G.racing_on) return;
  if (G.peace_on) return;
  // CAP_DAILY=0: if(daily::on) return;
  for (const oi of G.orbinfos) {
    if (!(oi.flags & orbgenflags_CROSS10)) continue;
    if (!oi.gchance) continue;

    const treas = G.items[treasureType(oi.l)] * landMultiplier(oi.l);
    let mintreas = 10;

    if (G.inv_on) {
      if (oi.flags & orbgenflags_OSM_CROSS25)
        mintreas = 25;
      else if (oi.flags & orbgenflags_OSM_CROSS50)
        mintreas = 50;
      else continue;
    }

    if (ls_single() && isCrossroads(G.specialland)) {
      if (oi.flags & orbgenflags_NO_TACTIC)
        continue;
      else mintreas = 0;
    }
    if (treas < mintreas) continue;

    if (oi.orb === itOrbSafety && c.land === laCrossroads5) continue;
    const mul = c.land === laCrossroads5 ? 10 : 1;
    let gch = oi.gchance;
    // int gch; gch /= double: converted back to int by truncation
    if (!G.inv_on) gch = itrunc(gch / orbcrossfun(treas)); else gch = idiv(gch, 2);

    if (hrand(gch) >= mul) continue;
    if (hrand(50 + G.items[itHyperstone]) >= 50) continue;

    c.item = oi.orb;
    if (oi.orb === itOrbWater && c.land !== laOcean) c.wall = waStrandedBoat;
  }
}

export function placeOceanOrbs(c: cell): void {
  if (G.peace_on) return;
  for (const oi of G.orbinfos) {
    if (!(oi.flags & orbgenflags_CROSS10)) continue;

    const treas = G.items[treasureType(oi.l)] * landMultiplier(oi.l);
    let mintreas = 10;

    if (G.inv_on) {
      if (oi.flags & orbgenflags_OSM_CROSS25)
        mintreas = 25;
      else if (oi.flags & orbgenflags_OSM_CROSS50)
        mintreas = 50;
      else continue;
    }

    if (treas < mintreas) continue;
    if (!oi.gchance) continue;
    if (oi.orb === itOrbLife) continue; // useless
    if (hrand(oi.gchance) >= 20) continue;
    c.item = oi.orb;
  }
}
