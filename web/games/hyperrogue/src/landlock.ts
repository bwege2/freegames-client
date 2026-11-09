// landlock.cpp of HyperRogue 13.1o: unlocking lands, which lands could be found beyond the wall, validity of
// various lands depending on the settings. Package P3. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// isNative and the REQ/REQAS switches of landUnlocked/landAccessibleFromIngame are generated from content.cpp into
// content-req.ts (isNative is re-exported here). Names: namespace ls -> ls_*, namespace lv -> lv_* (the flags);
// count_at_level/countHyperstoneQuest take Ref<number> for the int& out-parameters. The land_validity_t values of
// namespace lv are module constants; land_validity returns them (C++ returns a reference to them: read only).
// customize_land_in_list/customize_land_list are menus (a later stage): NotPorted.
import { G } from './globals.ts';
import { among, isize, callhandlers, NotPorted } from './hyper.ts';
import { idiv, type Ref } from './cpp.ts';
import type { cell, cellwalker } from './locations.ts';
import {
  type eItem, type eLand, type eMonster, linf, iinf, landtypes, IC_TREASURE,
  moIvyDead, moDragonTail, moWolfMoved, moIvyNext, moAirElemental, moWaterElemental, moEarthElemental,
  moFireElemental, moVizier,
  itOrbLove, itPalace, itHyperstone, itHolyGrail, itSavedPrincess, itBabyTortoise, itHunting, itStatue, itGrimoire,
  itOrbLuck, itGold, itFernFlower, itHell, itBone,
  laNone, laEFire, laEWater, laEAir, laEEarth, laMirror, laMirrored, laMirrored2, laPrincessQuest, laCamelot,
  laCrossroads, laCrossroads2, laCrossroads3, laCrossroads4, laCrossroads5, laCrossroads6, laMasterCrossroads,
  laHell, laCocytus, laPower, laMirrorOld, laCA, laIce, laDesert, laCaves, laWildWest, laDocks, laRlyeh, laOcean,
  laWarpCoast, laLivefjord, laWhirlpool, laKraken, laWarpSea, laCaribbean, laJungle, laMotion, laWineyard,
  laDryForest, laVolcano, laDragon, laGraveyard, laDice, laRuins, laRedRock, laEmerald, laDeadCaves, laPrairie,
  laWet, laFrog, laBull, laTerracotta, laReptile, laMinefield, laZebra, laElementalWall, laMountain, laHaunted,
  laTemple, laPalace, laClearing, laOvergrown, laMirrorWall, laMirrorWall2, laBrownian, laTortoise, laHunting,
  laAlchemist, laSwitch, laBurial, laDungeon, laStorms, laWhirlwind, laBlizzard, laVariant, laHive, laTrollheim,
  laEclectic, laCursed, laRose, laIvoryTower, laEndorian, laWestWall, laHalloween, laAsteroids, laDual,
  laSnakeNest, laMagnetic, laMercuryRiver, laBarrier, laOceanWall, laCanvas,
} from './content.ts';
import { isNative, landUnlocked_switch, landAccessibleFromIngame_switch, R10, R30, R60, R90, U5, U10 } from './content-req.ts';
import {
  isElemental, elementalOf, isCyclic, isTechnicalLand, isTrollLand, isWarpedType, isEquidLand, inmirror as inmirror_l,
} from './flags.ts';
import {
  euclid, closed_or_bounded, closed_manifold, quotient, hyperbolic, sphere, elliptic, nil, sol, cryst, eubinary,
  aperiodic, nonisotropic, mhybrid, smallbounded, smallsphere, bigsphere, stdeuc, weirdhyperbolic, hyperbolic_37,
  hyperbolic_not37, a4, a38, a45, a46, a47, S3, S7, WDIM, cgflags, GOLDBERG, PURE, BITRUNCATED, STDVAR, NONSTDVAR,
  IRREGULAR, DUAL, INVERSE, gNormal, gZebraQuotient, gFieldQuotient, gBinary4, gBinaryTiling, gKiteDart3,
  gTwistedProduct, gBolza, gBolza2, gElliptic, gKleinQuartic, gMinimal, OINF, qANYQ, qFIELD, qFRACTAL,
} from './classes.ts';
import { hrand, pick, hrand_elt } from './rand.ts';
import { XLAT, XLATN, dnameof_l } from './language.ts';
import { hiitemsMax, yendor_get_land_structure, yendor_clev, YF_WALLS, YF_REPEAT } from './yendor.ts';
import { gold } from './items.ts';
import { tortoise_seek, princess_dist, OUT_OF_PRISON } from './complex.ts';
import { markOrb } from './orbs.ts';
import { addMessage } from './basegraph.ts';
import { geometry_supports_cdata, valence } from './cell.ts';
import { geosupport_football, geosupport_chessboard, geosupport_threecolor } from './pattern2.ts';
import { walls_not_implemented, nice_walls_available } from './bigstuff.ts';
import { hat_in } from './aperiodic-hat.ts';
import { arcm_in, arcm_support_dice, arcm_current_have_line } from './archimedean.ts';
import { arb_in, arb_support_dice, arb_current_have_line } from './arbitrile.ts';
import { bt_in } from './binary-tiling.ts';
import { euc_in, euc_sdxy } from './euclid.ts';
import { hybrid_actual_geometry, hybrid_underlying, hybrid_underlying_cgip, hybrid_in_underlying_geometry } from './nonisotropic.ts';
import { irr_bitruncations_performed } from './irregular.ts';
import { has_nice_dual } from './graph.ts';
import { legacy_racing } from './legacy.ts';
import { racing_race_lands } from './racing.ts';
import { dual_check_side } from './multigame.ts';
import { arg_add3 } from './commandline.ts';
import { printf } from './cfile.ts';

export { isNative };

export function in_full_game(): boolean {
  if (ls_single()) return false;
  return true;
}

export function nodisplay(m: eMonster): boolean {
  return (
    m === moIvyDead ||
    m === moDragonTail ||
    m === moWolfMoved ||
    m === moIvyNext ||
    m === moIvyDead);
}

export function treasureType(l: eLand): eItem { return linf[l].treasure; }

export function treasureTypeUnlock(l: eLand, u: eItem): eItem {
  if (u !== itOrbLove && l === laPrincessQuest)
    return itPalace;
  return treasureType(l);
}

export function landof(it: eItem): eLand {
  for (let i = 0; i < landtypes; i++) if (treasureType(i) === it) return i;
  return laNone;
}

export function landMultiplier(l: eLand): number {
  if (l === laCamelot || l === laPrincessQuest) return 10;
  return 1;
}

export function isCrossroads(l: eLand): boolean {
  return among(l, laCrossroads, laCrossroads2, laCrossroads3, laCrossroads4, laCrossroads5, laCrossroads6, laMasterCrossroads);
}

export function isCrossroadsNM(l: eLand): boolean {
  return isCrossroads(l) && l !== laMasterCrossroads;
}

export function bearsCamelot(l: eLand): boolean {
  return isCrossroads(l) && !among(l, laCrossroads2, laCrossroads5, laMasterCrossroads);
}

/** inmirror(const cellwalker& cw): inmirror_cw (the eLand/cell overload is flags.ts inmirror) */
export function inmirror_cw(cw: cellwalker): boolean {
  return inmirror_l(cw.at.land);
}

export function oppositeElement(l: eLand, l2: eLand): eLand {
  if (l === laEFire) return laEWater;
  if (l === laEWater) return laEFire;
  if (l === laEAir) return laEEarth;
  if (l === laEEarth) return laEAir;
  if (l === laMirror && l2 === laMirrored) return laMirrored2;
  if (l === laMirrored2 && l2 === laMirrored) return laMirror;
  return l;
}

// land unlocking

// EX eLand firstland = laIce, specialland = laIce: G.firstland, G.specialland

/** enum eLandStructure */
export type eLandStructure = number;
export const lsNiceWalls = 0, lsChaos = 1, lsPatchedChaos = 2, lsTotalChaos = 3, lsChaosRW = 4, lsWallChaos = 5,
  lsSingle = 6, lsNoWalls = 7, lsHorodisks = 8, lsVoronoi = 9, lsLandscape = 10, lsCrossWalls = 11, lsVineWalls = 12,
  lsCursedWalls = 13, lsGUARD = 14;

// EX eLandStructure land_structure: G.land_structure

// namespace ls
export function ls_single(): boolean { return G.land_structure === lsSingle; }

export function ls_any_chaos(): boolean { return among(G.land_structure, lsChaos, lsPatchedChaos, lsWallChaos, lsTotalChaos, lsChaosRW, lsCrossWalls, lsVineWalls, lsCursedWalls, lsLandscape); }
export function ls_std_chaos(): boolean { return G.land_structure === lsChaos; }
export function ls_wall_chaos(): boolean { return among(G.land_structure, lsWallChaos, lsCrossWalls, lsVineWalls, lsCursedWalls); }
export function ls_patched_chaos(): boolean { return G.land_structure === lsPatchedChaos; }

export function ls_any_order(): boolean { return among(G.land_structure, lsNiceWalls, lsNoWalls, lsHorodisks, lsVoronoi); }
export function ls_nice_walls(): boolean { return G.land_structure === lsNiceWalls; }
export function ls_no_walls(): boolean { return G.land_structure === lsNoWalls; }
export function ls_horodisk_structure(): boolean { return G.land_structure === lsHorodisks; }
export function ls_voronoi_structure(): boolean { return G.land_structure === lsVoronoi; }
export function ls_hv_structure(): boolean { return among(G.land_structure, lsHorodisks, lsVoronoi); }

export function ls_any_nowall(): boolean { return ls_no_walls() || ls_std_chaos(); }
export function ls_any_wall(): boolean { return ls_nice_walls() || ls_wall_chaos(); }

export function ls_chaoticity(): number {
  if (G.land_structure === lsTotalChaos) return 100;
  if (G.land_structure === lsChaosRW) return 80;
  if (G.land_structure === lsPatchedChaos) return 60;
  if (G.land_structure === lsChaos) return 40;
  if (G.land_structure === lsLandscape) return 35;
  if (G.land_structure === lsWallChaos) return 30;
  if (G.land_structure === lsCrossWalls) return 32;
  if (G.land_structure === lsCursedWalls) return 34;
  if (G.land_structure === lsVoronoi) return 20;
  if (G.land_structure === lsSingle) return 0;
  return 10;
}

/** a multiplier to make stuff more frequent in Wall Chaos and Cross Wall Chaos: treasure */
export function ls_ls_mul(): number {
  if (G.land_structure === lsWallChaos) return 2;
  if (G.land_structure === lsCrossWalls) return 3;
  if (G.land_structure === lsVineWalls) return 3;
  if (G.land_structure === lsCursedWalls) return 3;
  return 1;
}

/** a multiplier to make stuff more frequent in Wall Chaos and Cross Wall Chaos: even bigger */
export function ls_ls_mul_big(): number {
  if (G.land_structure === lsWallChaos) return 5;
  if (G.land_structure === lsCrossWalls) return 10;
  if (G.land_structure === lsVineWalls) return 10;
  if (G.land_structure === lsCursedWalls) return 10;
  return 1;
}

export function ls_tame_chaos(): boolean { return ls_any_chaos() && ls_chaoticity() < 35; }

export function land_structure_name(which: boolean): string {
  switch (G.land_structure) {
    case lsNiceWalls:
      return XLAT('standard');
    case lsChaos:
      return XLAT('Chaos mode');
    case lsPatchedChaos:
      return XLAT('patched Chaos');
    case lsWallChaos:
      return XLAT('excessive walls');
    case lsTotalChaos:
      return XLAT('total chaos');
    case lsChaosRW:
      return XLAT('random-walk chaos');
    case lsSingle:
      return which ? XLAT('single land: ') + XLATN(linf[G.specialland].name) : XLAT('single land');
    case lsHorodisks:
      return XLAT('horodisks');
    case lsVoronoi:
      return XLAT('ideal Voronoi');
    case lsLandscape:
      return XLAT('landscape');
    case lsNoWalls:
      return XLAT('wall-less');
    case lsCrossWalls:
      return XLAT('excessive crossing walls');
    case lsVineWalls:
      return XLAT('regular walls');
    case lsCursedWalls:
      return XLAT('cursed walls');
    default:
      return 'error structure';
  }
}

export function fix_land_structure_choice(): void {
  if (closed_or_bounded()) {
    if (G.land_structure !== lsTotalChaos && G.land_structure !== lsChaosRW)
      G.land_structure = lsSingle;
  }
  if (G.land_structure === lsLandscape && !geometry_supports_cdata())
    G.land_structure = lsChaosRW;
  if (G.tactic_on || G.princess_challenge)
    G.land_structure = lsSingle;
  if (G.yendor_on)
    G.land_structure = yendor_get_land_structure();
  if (!nice_walls_available() && G.land_structure === lsNiceWalls)
    G.land_structure = lsNoWalls;
  if (!nice_walls_available() && G.land_structure === lsWallChaos)
    G.land_structure = lsChaos;
  if (!nice_walls_available() && G.land_structure === lsCrossWalls)
    G.land_structure = lsChaos;
  if (G.land_structure === lsVineWalls && (G.geometry !== gNormal || !BITRUNCATED()))
    G.land_structure = lsNiceWalls;
  if (G.land_structure === lsCursedWalls && (G.geometry !== gNormal || !BITRUNCATED()))
    G.land_structure = lsNiceWalls;
  if (ls_hv_structure() && (!hyperbolic() || bt_in() || quotient()))
    G.land_structure = lsSingle;
  if (walls_not_implemented() && among(G.land_structure, lsChaos, lsNoWalls))
    G.land_structure = lsSingle;
  if (G.land_structure === lsPatchedChaos && !(stdeuc() || nil() || cryst() || (euclid() && WDIM() === 3) || aperiodic()))
    G.land_structure = lsSingle;
  if (closed_or_bounded() && !among(G.land_structure, lsChaosRW, lsTotalChaos, lsSingle))
    G.land_structure = lsSingle;
  if (aperiodic() && !among(G.land_structure, lsChaosRW, lsTotalChaos, lsPatchedChaos, lsSingle))
    G.land_structure = lsPatchedChaos;
  if ((cgflags() & qFRACTAL) !== 0n && !among(G.land_structure, lsChaosRW, lsTotalChaos, lsPatchedChaos, lsSingle))
    G.land_structure = lsPatchedChaos;
}

export function landUnlockedRPM(n: eLand): boolean {
  if (isRandland(n) === 2) return true;
  if (isRandland(n) === 1)
    return (G.autocheat || G.cheater !== 0 || hiitemsMax(treasureType(n)) >= 10);
  return false;
}

export function lands_for_hell(): number {
  const desired = G.casual ? 40 : 9;
  let available = 0;
  for (const l of G.land_over) if (!among(l, laHell, laCocytus, laPower) && !isCrossroads(l) && iinf[linf[l].treasure].itemclass === IC_TREASURE && isLandIngame(l)) available++;
  if (isLandIngame(laMirror) && isLandIngame(laMirrorOld)) --available;
  return Math.min(desired, available);
}

export function lands_for_cr3(): number {
  const desired = G.casual ? 20 : 9;
  let available = 0;
  for (const l of G.land_over) if (!isCrossroads(l) && iinf[linf[l].treasure].itemclass === IC_TREASURE && isLandIngame(l)) available++;
  if (isLandIngame(laMirror) && isLandIngame(laMirrorOld)) --available;
  return Math.min(desired, available);
}

export function variant_unlock_value(): number {
  return G.inv_on ? 75 : 30;
}

export function landAccessibleFromIngame(l: eLand): boolean {
  if (!ls_any_order()) return true;

  for (;;) { // back:
    const r = landAccessibleFromIngame_switch(l);
    if (typeof r === 'boolean') return r;
    l = r.reqas; // REQAS: l = x; goto back;
  }
}

export function landUnlocked(l: eLand): boolean {
  if (G.randomPatternsMode) {
    return landUnlockedRPM(l);
  }

  if (G.all_unlocked) {
    if (G.autocheat || hiitemsMax(treasureType(l)) >= 10) return true;
  }

  for (;;) { // back:
    if (G.princess_challenge) return among(l, laPalace, laPrincessQuest);

    if (ls_any_chaos() && isCrossroads(l)) {
      return hyperstonesUnlocked();
    }

    const r = landUnlocked_switch(l);
    if (typeof r === 'boolean') return r;
    l = r.reqas; // REQAS: l = x; goto back;
  }
}

export function required_for_hyperstones(ttype: eItem): boolean {
  if (ttype === itHyperstone)
    return false;
  if (among(ttype, itHolyGrail, itSavedPrincess))
    return false;
  if (euclid() && among(ttype, itBabyTortoise, itHunting))
    return false;
  return true;
}

export function count_at_level(i1: Ref<number>, i2: Ref<number>, level: number): void {
  i1.v = 0; i2.v = 0;
  generateLandList(isLandIngame);
  for (const l of G.landlist) {
    // no treasure
    if (l === laCA) continue;
    // same treasure, so count only once
    if (l === laMirrorOld && isLandIngame(laMirror)) continue;
    const ttype = treasureType(l);
    if (!required_for_hyperstones(ttype)) continue;
    i2.v++; if (G.items[ttype] >= level) i1.v++;
  }
}

export function countHyperstoneQuest(i1: Ref<number>, i2: Ref<number>): void {
  count_at_level(i1, i2, R10());
}

export function hyperstonesUnlocked(): boolean {
  const i1 = { v: 0 }, i2 = { v: 0 };
  if (ls_single() && isCrossroads(G.specialland)) return true;
  countHyperstoneQuest(i1, i2);
  return i1.v === i2.v;
}

/** 2 = always available, 1 = highscore required, 0 = never available */
export function isRandland(l: eLand): number {
  if (l === laIce || l === laDesert || l === laCaves || l === laWildWest || l === laDocks)
    return 2;
  for (const ll of G.randlands) if (l === ll) return 1;
  return 0;
}

export function voronoi_sea_category(l: eLand): number {
  if (l === laRlyeh) return rlyehComplete() ? 0 : 2;
  if (among(l, laOcean, laWarpCoast, laLivefjord, laDocks)) return 1;
  if (among(l, laWhirlpool, laKraken, laWarpSea, laCaribbean)) return 2;
  return 0;
}

export function voronoi_sea_incompatible(l1: eLand, l2: eLand): boolean {
  const c1 = voronoi_sea_category(l1);
  const c2 = voronoi_sea_category(l2);
  if (c1 + c2 === 2 && c1 !== c2) return true;
  return false;
}

export function incompatible1(l1: eLand, l2: eLand): boolean {
  if (l1 === laMasterCrossroads && !isCrossroads(l2)) return true;

  if (isCrossroadsNM(l1) && isCrossroadsNM(l2)) return true;
  if (l1 === laJungle && l2 === laMotion) return true;
  if (l1 === laMirrorOld && l2 === laMotion) return true;
  if (l1 === laPower && l2 === laWineyard) return true;
  if (l1 === laPower && l2 === laDryForest) return true;
  if (l1 === laVolcano && l2 === laDryForest) return true;
  if (l1 === laVolcano && l2 === laWineyard) return true;
  if (l1 === laDragon && l2 === laDryForest) return true;
  if (l1 === laEFire && l2 === laWineyard) return true;
  if (l1 === laEFire && l2 === laDryForest) return true;
  if (l1 === laGraveyard && l2 === laDryForest) return true;
  if (l1 === laGraveyard && l2 === laDice) return true;
  if (l1 === laGraveyard && l2 === laRuins) return true;
  if (l1 === laGraveyard && l2 === laRedRock) return true;
  if (l1 === laGraveyard && l2 === laEmerald) return true;
  if (l1 === laDeadCaves && l2 === laEmerald) return true;
  if (l1 === laDeadCaves && l2 === laCaves) return true;
  if (l1 === laWarpSea && l2 === laKraken) return true;
  if (l1 === laPrairie && l2 === laCrossroads3) return true;
  if (l1 === laPrairie && l2 === laCrossroads4) return true;
  if (l1 === laPrairie && l2 === laCrossroads6) return true;
  if (l1 === laWet && l2 === laDesert) return true;
  if (l1 === laFrog && l2 === laMotion) return true;
  if (l1 === laBull && l2 === laTerracotta) return true;
  if (l1 === laReptile && l2 === laTerracotta) return true;
  if (l1 === laBull && l2 === laDeadCaves) return true;
  if (l1 === laMinefield && l2 === laZebra) return true;
  if (isElemental(l1) && isElemental(l2)) return true;
  return false;
}

export function randomElementalLand(): eLand {
  const i = hrand(4);
  const t: eLand[] = [laEFire, laEWater, laEAir, laEEarth];
  return t[i];
}

export function elementalKills(): number {
  return (
    G.kills[moAirElemental] + G.kills[moWaterElemental] + G.kills[moEarthElemental] + G.kills[moFireElemental]);
}

export function randomElementalLandWeighted(): eLand {
  const ek = elementalKills();
  if (ek === 0 || G.all_unlocked) return pick(laEAir, laEWater, laEEarth, laEFire);
  let i = hrand(ek);
  i -= G.kills[moAirElemental]; if (i < 0) return laEAir;
  i -= G.kills[moWaterElemental]; if (i < 0) return laEWater;
  i -= G.kills[moEarthElemental]; if (i < 0) return laEEarth;
  i -= G.kills[moFireElemental]; if (i < 0) return laEFire;
  printf('elemental bug\n');
  return laElementalWall;
}

export function incompatible(nw: eLand, old: eLand): boolean {
  return (nw === old) || incompatible1(nw, old) || incompatible1(old, nw);
}

export function rlyehComplete(): boolean {
  if (ls_any_chaos()) return G.items[itStatue] >= 1;
  return G.items[itStatue] >= 10 || G.items[itGrimoire] >= 10;
}

function lchance(l: eLand): boolean {
  if (ls_single() || G.racing_on || ((G.geometry !== 0 || GOLDBERG()) && G.specialland === laElementalWall)) return true;
  if (ls_any_chaos()) return hrand(100) < 25;
  return hrand(100) >= idiv(40 * G.kills[elementalOf(l)], elementalKills() + 1);
}

export function pickLandRPM(old: eLand): eLand {
  while (true) {
    const n = G.randlands[hrand(isize(G.randlands))];
    if (incompatible(n, old)) continue;
    if (landUnlockedRPM(n)) return n;
  }
}

export function pickluck(l1: eLand, l2: eLand): eLand {
  const t1 = G.items[treasureType(l1)];
  const t2 = G.items[treasureType(l2)];
  if (t1 < t2) return l1;
  if (t2 < t1) return l2;
  if (isCrossroads(l1)) return l1;
  return l2;
}

// #define LIKELY for(int u=0; u<5; u++)
// #define LIKELY2 for(int u=0; u<2; u++)

export function get_superland(l: eLand): eLand {
  if (l === laMountain) return laJungle;
  if (l === laHaunted) return laGraveyard;
  if (l === laCamelot || isCrossroads(l)) return laCrossroads;
  if (l === laTemple) return laRlyeh;
  if (l === laPrincessQuest) return laPalace;
  if (l === laClearing) return laOvergrown;
  if (l === laMirrorWall || l === laMirrored || l === laMirrorWall2) return laMirror;
  if (l === laBrownian || l === laWhirlpool) return laOcean;
  return l;
}

export function getNewSealand(old: eLand): eLand {
  for (let it = 0; it < 100; it++) {
    // pick(laOcean, pick(...)): the inner pick is an argument, evaluated first
    const inner = pick(laCaribbean, laLivefjord, laWarpSea, laKraken, laDocks);
    const p = pick(laOcean, inner);
    if (p === laKraken && !landUnlocked(p)) continue;
    if (p === laKraken && G.peace_on) continue;
    if (incompatible(old, p)) continue;
    if (p === old) continue;
    if (!isLandIngame(p)) continue;
    return p;
  }
  return old;
}

export function createOnSea(old: eLand): boolean {
  return (
    old === laWarpSea || old === laCaribbean || old === laKraken ||
    (old === laLivefjord && hrand(2) !== 0) ||
    (old === laDocks && hrand(2) !== 0) ||
    (old === laOcean && (ls_any_chaos() ? hrand(2) !== 0 : !G.generatingEquidistant)));
}

// EX hookset<eLand(eLand)> hooks_nextland: G.hooks_nextland
// EX bool all_unlocked = false: G.all_unlocked
// EX vector<eLand> cheatdest_list: G.cheatdest_list

export function getNewLand(old: eLand): eLand {

  // CAP_LEGACY
  if (legacy_racing()) {
    if (old === laMirror && hrand(10) >= ((G.tactic_on || G.racing_on) ? 0 : markOrb(itOrbLuck) ? 5 : 2)) return laMirrored;
    if (old === laTerracotta && hrand(5) >= ((G.tactic_on || G.racing_on) ? 0 : markOrb(itOrbLuck) ? 2 : 1) && !weirdhyperbolic()) return laTerracotta;
  }

  const l0 = callhandlers(laNone, G.hooks_nextland, old);
  if (l0) return l0;

  if (G.cheatdest !== old && G.cheatdest !== laElementalWall) if (!isCyclic(G.cheatdest) && !isTechnicalLand(G.cheatdest)) return G.cheatdest;

  if (G.cheatdest_list.length) {
    const l = G.cheatdest_list[0];
    G.cheatdest_list.push(G.cheatdest_list.shift()!); // std::rotate by one
    return l;
  }

  if (old === laTortoise) return laDragon;

  if (G.yendor_on && ls_any_chaos()) {
    while (true) {
      const n = hrand(landtypes);
      if (n === old) continue;
      if (incompatible(n, old)) continue;
      if (!isLandIngame(n)) continue;
      if (n === laElementalWall || isTechnicalLand(n)) continue;
      if (n === laWildWest) continue;
      if (isElemental(n) && hrand(100) >= 25) continue;
      return n;
    }
  }

  if (markOrb(itOrbLuck)) {
    const i = G.items[itOrbLuck];
    G.items[itOrbLuck] = 0;
    let l1 = getNewLand(old);
    for (let i = 1; i < 3; i++)
      l1 = pickluck(l1, getNewLand(old));
    G.items[itOrbLuck] = i;
    return l1;
  }

  if (G.randomPatternsMode) return pickLandRPM(old);

  if (old === laEEarth && lchance(old)) return hrand(2) ? laEWater : laEFire;
  if (old === laEAir && lchance(old)) return hrand(2) ? laEWater : laEFire;
  if (old === laEWater && lchance(old)) return hrand(2) ? laEEarth : laEAir;
  if (old === laEFire && lchance(old)) return hrand(2) ? laEEarth : laEAir;

  // CAP_RACING
  if (G.racing_on && old !== laElementalWall) {
    let l = old;
    const race_lands = racing_race_lands();
    while (l === old) l = race_lands[hrand(16)]; // fixed at 16
    if (l === laElementalWall) l = randomElementalLand();
    if (l === laMirror) l = laCrossroads;
    return l;
  }

  if (G.tactic_on) return G.specialland;
  if (G.specialland !== old && G.easy_to_find_specialland && G.specialland !== laElementalWall) return G.specialland;

  if (G.specialland !== old && G.easy_specialland && G.specialland !== laElementalWall) {
    G.easy_specialland--;
    return G.specialland;
  }

  if (G.yendor_on && (yendor_clev().flags & YF_WALLS)) {
    if (old !== yendor_clev().l) return yendor_clev().l;
    else if (old === laOcean) return pick(laLivefjord, laCaribbean);
  }

  if (G.yendor_on && G.yendor_nexttostart) {
    const l = G.yendor_nexttostart;
    if (!(yendor_clev().flags & YF_REPEAT))
      G.yendor_nexttostart = laNone;
    return l;
  }

  if (old === laDragon && tortoise_seek() && hrand(100) < 50)
    return laTortoise;

  if (isWarpedType(old) && (hrand(100) < 25) && ls_std_chaos()) return (old ^ laWarpCoast ^ laWarpSea);

  if (createOnSea(old))
    return getNewSealand(old);

  if (old === laGraveyard && G.generatingEquidistant)
    return laHaunted;

  if (old === laOcean && gold() >= R60() && hrand(100) < 75 && !rlyehComplete() && !G.all_unlocked)
    return laRlyeh;

  if (old === laRlyeh && !rlyehComplete() && !G.all_unlocked)
    return laOcean;

  const tab: eLand[] = [];
  let cnt = 0;

  // return (hrand(2)) ? laMotion : laJungle;

  for (const l of [
    laCrossroads, laIce, laDesert, laJungle, laMotion, laHunting, laAlchemist, laCaves,
    laMinefield, laPalace, laReptile, laSwitch, laBurial, laDungeon, laRuins, laZebra,
    laStorms, laWhirlwind, laOvergrown, laBlizzard, laDryForest, laWineyard, laVolcano,
    laDeadCaves, laRedRock, laVariant, laHell, laCocytus, laPower,
    laBull, laTerracotta, laRose, laGraveyard, laHive, laDragon, laTrollheim,
    laWet, laFrog, laEclectic, laCursed, laDice,
    laCrossroads5, laCrossroads6, laMasterCrossroads,
  ])
    if (landUnlocked(l)) tab[cnt++] = l;

  for (const c of closs) {
    if (old === c[0] && landUnlocked(c[1])) for (let i = 0; i < c[2]; i++) tab[cnt++] = c[1];
    if (old === c[1] && landUnlocked(c[0])) for (let i = 0; i < c[3]; i++) tab[cnt++] = c[0];
  }

  // these lands tend to crash while generating equidistant
  for (const l of [laIvoryTower, laEndorian, laWestWall])
    if (landUnlocked(l) && !G.generatingEquidistant)
      tab[cnt++] = l;

  // the intermediate lands
  if (G.all_unlocked || gold() >= R30()) {
    tab[cnt++] = laCrossroads;
    tab[cnt++] = laMirrorOld;
    tab[cnt++] = laMirror;
    tab[cnt++] = laOcean;
    tab[cnt++] = laLivefjord;
    if (G.all_unlocked || G.kills[moVizier]) tab[cnt++] = laEmerald;
    tab[cnt++] = laWarpCoast;
    if (euclid()) tab[cnt++] = laWarpSea;
    tab[cnt++] = laDocks;
  }

  tab[cnt++] = laHalloween;
  tab[cnt++] = laWildWest;
  tab[cnt++] = laAsteroids;
  tab[cnt++] = laCA;

  // the advanced lands
  if (G.all_unlocked || gold() >= R60()) {
    tab[cnt++] = laCrossroads;
    if (!G.generatingEquidistant) tab[cnt++] = laCrossroads2;
    if (G.all_unlocked || rlyehComplete()) tab[cnt++] = laRlyeh;
    else if (ls_std_chaos() && (old === laWarpCoast || old === laLivefjord || old === laOcean))
      tab[cnt++] = laRlyeh;
    if ((G.all_unlocked || G.items[itStatue] >= U5()) && (ls_std_chaos() || ls_horodisk_structure()))
      tab[cnt++] = laTemple;
    if (old === laCrossroads || old === laCrossroads2) tab[cnt++] = laOcean;
    if (old === laOcean) tab[cnt++] = laCrossroads;
    if (G.items[itGold] >= U5() && G.items[itFernFlower] >= U5() && !G.kills[moVizier] && !G.all_unlocked)
      tab[cnt++] = laEmerald;
  }

  if (G.all_unlocked || gold() >= R90()) {
    if (!ls_std_chaos()) tab[cnt++] = laPrairie;
    if (old === laPrairie) for (let u = 0; u < 5; u++) tab[cnt++] = laBull;
    if (old === laBull && !ls_any_chaos()) for (let u = 0; u < 5; u++) tab[cnt++] = laPrairie;
    tab[cnt++] = laDual;
    tab[cnt++] = laSnakeNest;
  }

  if (ls_horodisk_structure()) {
    if (gold() >= R30()) {
      tab[cnt++] = laCaribbean;
      tab[cnt++] = laKraken;
      tab[cnt++] = laWhirlpool;
    }
    if (gold() >= R60()) {
      tab[cnt++] = laRlyeh;
      if (landUnlocked(laTemple)) tab[cnt++] = laTemple;
    }
    if (G.items[itBone] >= 10)
      tab[cnt++] = laHaunted;
  }

  if (ls_hv_structure() && landUnlocked(laMountain)) tab[cnt++] = laMountain;
  if (ls_hv_structure() && landUnlocked(laClearing)) tab[cnt++] = laClearing;
  if (ls_voronoi_structure() && landUnlocked(laRlyeh) && !rlyehComplete()) for (let u = 0; u < 5; u++) tab[cnt++] = laRlyeh;
  if (ls_hv_structure() && landUnlocked(laTemple)) tab[cnt++] = laTemple;

  if (landUnlocked(laTrollheim)) {
    if (isTrollLand(old)) for (let u = 0; u < 5; u++) tab[cnt++] = laTrollheim;
    if (old === laTrollheim) for (let i = 0; i < landtypes; i++) {
      const l2 = i;
      if (isTrollLand(l2) && landUnlocked(l2)) for (let u = 0; u < 5; u++) tab[cnt++] = l2;
    }
  }

  if (landUnlocked(laElementalWall)) {
    tab[cnt++] = randomElementalLandWeighted();
  }

  if (landUnlocked(laCrossroads3)) {
    if (!G.generatingEquidistant && old !== laPrairie) tab[cnt++] = laCrossroads3;
  }

  if (G.items[itHell] >= U10()) {
    if (old === laCrossroads || old === laCrossroads2) tab[cnt++] = laOcean;
    if (old === laOcean) tab[cnt++] = laCrossroads2;
  }

  if (ls_horodisk_structure() && tortoise_seek()) for (let u = 0; u < 5; u++) tab[cnt++] = laTortoise;

  let idx = 0;
  while (idx < cnt) {
    const n = tab[idx];
    if (incompatible(n, old) || !isLandIngame(n))
      tab[idx] = tab[--cnt];
    else
      idx++;
  }

  if (!cnt) {
    addMessage('No eligible land candidates!');
    return old;
  }

  let n = tab[hrand(cnt)];
  if (weirdhyperbolic() && G.specialland === laCrossroads4 && isCrossroads(n))
    n = laCrossroads4;

  return n;
}

/** struct clos { eLand l1, l2; int f1, f2; } of getNewLand */
const closs: [eLand, eLand, number, number][] = [
  [laZebra, laMotion, 2, 2], [laZebra, laHunting, 2, 2],
  [laDragon, laReptile, 5, 5],
  [laVariant, laRuins, 5, 5], [laVariant, laEmerald, 5, 5], [laVariant, laGraveyard, 5, 5],
  [laPalace, laDungeon, 5, 0],
  [laJungle, laOvergrown, 5, 5],
  [laIce, laBlizzard, 5, 5], [laCocytus, laBlizzard, 5, 5], [laHell, laCocytus, 5, 5], [laIce, laCocytus, 5, 5],
  [laWhirlwind, laBlizzard, 5, 5],
  [laAlchemist, laVolcano, 5, 5],
  [laDesert, laRedRock, 5, 5],
  [laFrog, laReptile, 2, 2], [laFrog, laSwitch, 2, 2], [laFrog, laZebra, 2, 2],
  [laEclectic, laStorms, 3, 3], [laEclectic, laIce, 3, 3], [laEclectic, laPalace, 3, 3], [laEclectic, laDeadCaves, 3, 3],
  [laCursed, laCrossroads6, 1, 1],

  [laEFire, laDragon, 5, 5], [laEWater, laLivefjord, 5, 5], [laEEarth, laDeadCaves, 5, 5], [laEAir, laWhirlwind, 5, 5],
];

export function getNewLand2(olds: eLand[]): eLand {
  for (let i = 0; ; i++) {
    const old = hrand_elt(olds);
    const l = getNewLand(old);
    // how bad it is
    let err = 0;
    for (const o of olds) if (l === o) err += 2000;
    for (const o of olds) if (incompatible(l, o)) err += 1000;
    for (const o of olds) if (voronoi_sea_incompatible(l, o)) err += 100;
    // we still allow bad choices if we cannot obtain a good one
    if (err <= i) return l;
  }
}

/** the initial value of EX vector<eLand> land_over (register_landlock puts it into G.land_over) */
export const land_over_table: eLand[] = [
  laIce, laCaves, laDesert, laHunting, laMotion, laJungle, laAlchemist,
  laCrossroads,
  laMirror, laMirrorOld, laMinefield, laPalace, laPrincessQuest, laZebra, laSwitch, laReptile, laWet,
  laOcean, laDocks, laWarpCoast, laLivefjord, laKraken, laCaribbean, laBrownian, laWhirlpool, laRlyeh, laTemple,
  laIvoryTower, laEndorian, laWestWall, laDungeon, laMountain,
  laCrossroads2,
  laDryForest, laWineyard, laDeadCaves, laGraveyard, laHaunted, laHive,
  laRedRock, laVolcano,
  laDragon, laTortoise, laDice,
  laOvergrown, laClearing, laStorms, laBurial, laWhirlwind,
  laBlizzard,
  laFrog, laEclectic, laCursed,
  laRuins, laEmerald, laVariant, laCamelot,
  laPrairie, laBull, laTerracotta, laRose,
  laElementalWall, laTrollheim,
  laHell, laCrossroads3, laCocytus, laPower, laCrossroads4,
  laCrossroads5, laCrossroads6, laMasterCrossroads,
  // EXTRA
  laWildWest, laHalloween, laDual, laSnakeNest, laMagnetic, laCA, laAsteroids,
];

// EX vector<eLand> landlist: G.landlist

/** template<class T> void generateLandList(T t) */
export function generateLandList(t: (l: eLand) => boolean): void {
  G.landlist.length = 0;
  for (const l of G.land_over) if (t(l)) G.landlist.push(l);
}

// namespace lv (the flags)
export const lv_appears_in_geom_exp = 1n, lv_display_error_message = 2n, lv_appears_in_full = 4n, lv_appears_in_ptm = 8n,
  lv_display_in_help = 16n, lv_one_and_half = 32n, lv_switch_to_single = 64n;

/** struct land_validity_t */
export interface land_validity_t {
  /** 0 (dont show), 1 (1/2), 2 (ok), 3(1!) */
  quality_level: number;
  flags: bigint;
  msg: string;
}

export function getLandForList(_c: cell): eLand {
  let l = _c.land;
  if (isElemental(l)) return laElementalWall;
  if (l === laWarpSea) return laWarpCoast;
  if (l === laMercuryRiver) return laTerracotta;
  if (l === laBarrier) return laCrossroads;
  if (l === laOceanWall) return laOcean;
  if (l === laPalace && princess_dist(G.cwt.at) < OUT_OF_PRISON)
    l = laPrincessQuest;
  // princess?
  return l;
}

// EX bool use_custom_land_list; EX array<...> custom_land_*: G.use_custom_land_list, G.custom_land_*

export function isLandIngame(l: eLand): boolean {
  if (isElemental(l)) l = laElementalWall;
  if (G.use_custom_land_list) return G.custom_land_list[l];
  if (G.dual_state === 2 && !dual_check_side(l)) return false;
  if ((eubinary() || sol()) && isCyclic(l) && l !== G.specialland) return false;
  if (l === laCamelot && hyperbolic() && WDIM() === 3) return false;
  if (!(land_validity(l).flags & lv_appears_in_full)) return false;
  if (among(l, laBlizzard, laVolcano) && G.windmap_wind_failed) return false;
  return landAccessibleFromIngame(l);
}

export function landUnlockedIngame(l: eLand): boolean {
  if (!G.peace_on && !landUnlocked(l)) return false;
  return isLandIngame(l);
}

// namespace lv (the validity values)
const q0 = lv_display_error_message | lv_display_in_help | lv_appears_in_geom_exp;
const q1 = lv_display_error_message | lv_appears_in_geom_exp | lv_appears_in_full | lv_display_in_help;
const q2 = lv_appears_in_geom_exp | lv_appears_in_full | lv_display_in_help | lv_appears_in_ptm;
const q3 = lv_appears_in_geom_exp | lv_appears_in_full | lv_display_in_help | lv_appears_in_ptm;
const qm2 = q2 | lv_display_error_message;
const qm3 = q3 | lv_display_error_message;
function lvt(quality_level: number, flags: bigint, msg: string): land_validity_t { return { quality_level, flags, msg }; }

const lv_hedgehogs = lvt(1, qm2 & ~lv_appears_in_full, 'Cannot kill Hedgehog Warriors in this geometry.');

const lv_no_randpattern_version = lvt(0, q0, 'No random pattern version.');
const lv_no_great_walls = lvt(0, q0, 'Great Walls not implemented.');
const lv_pattern_incompatibility = lvt(0, q0, 'Pattern incompatible.');
const lv_pattern_not_implemented_random = lvt(1, q1 | lv_one_and_half, 'Pattern not implemented -- using random.');
const lv_pattern_not_implemented_weird = lvt(1, q1, 'Pattern not implemented.');
const lv_pattern_not_implemented_exclude = lvt(1, q1 & ~lv_appears_in_full, 'Pattern not implemented.');
const lv_not_enough_space = lvt(0, q0, 'Not enough space.');
const lv_dont_work = lvt(0, q0, 'Does not work in this geometry.');
const lv_bounded_only = lvt(0, q0, 'This land is designed for bounded worlds.');
const lv_unbounded_only = lvt(0, q0, 'This land is designed for infinite worlds.');
const lv_unbounded_only_except_bigsphere = lvt(0, q0, 'This land is designed for infinite worlds or big spheres.');
const lv_out_of_theme = lvt(3, qm2 & ~lv_appears_in_full, 'Out of theme for the full game.');
const lv_no_game = lvt(2, q2 & ~lv_appears_in_full, 'No game here.');
const lv_not_in_chaos = lvt(0, q0, 'Does not work in chaos mode.');
const lv_not_in_landscape = lvt(0, q0, 'Does not work in landscape mode.');
const lv_not_in_full_game = lvt(2, qm2 & ~lv_appears_in_full, 'Not in the full game.');
const lv_not_in_full_game3 = lvt(3, qm2 & ~lv_appears_in_full, 'Not in the full game.');
const lv_special_chaos = lvt(2, qm2, 'Special construction in the Chaos mode.');
export const lv_special_euclidean = lvt(2, qm2, 'Special construction in the Euclidean mode.');
const lv_special_geo = lvt(2, qm2, 'Special construction in this geometry.');
const lv_special_geo3 = lvt(3, qm2, 'Special construction in this geometry.');
const lv_not_implemented = lvt(0, q0, 'Not implemented.');
export const lv_partially_implemented = lvt(1, q1 | lv_one_and_half, 'Partially implemented.');
const lv_ok = lvt(2, q2 & ~lv_display_in_help, 'No comments.');
const lv_not_in_ptm = lvt(0, q0, 'Does not work in pure tactics mode.');
const lv_technical = lvt(0, q0 & ~lv_appears_in_geom_exp, 'Technical.');
const lv_full_game = lvt(3, q3 & ~lv_display_in_help, 'Full game.');
const lv_inaccurate = lvt(1, q1, 'Somewhat inaccurate.');
const lv_great_walls_missing = lvt(1, q1 | lv_one_and_half, 'Mercury rivers not implemented (or could not work) in this geometry.');
const lv_pattern_compatibility = lvt(3, qm3, 'Patterns compatible.');
const lv_pattern_defined = lvt(3, qm3, 'Pattern defined.');
const lv_pattern_compatibility_notrec = lvt(2, qm2, 'Patterns compatible.');
const lv_specially_designed = lvt(3, qm3, 'This land is specially designed for this geometry.');
const lv_needs_threecolor = lvt(0, q0, 'Three-colorability required.');
const lv_land_not_implemented = lvt(0, q0 & ~lv_appears_in_geom_exp, 'Land not implemented.');
const lv_interesting = lvt(3, q3, 'Special interest.');
const lv_better_version_exists = lvt(0, q0, 'Better version exists.');
const lv_dont_work_but_ingame = lvt(1, q0 | lv_appears_in_full, 'Does not work in this geometry.');
const lv_ugly_version_infull = lvt(1, q1 | lv_appears_in_full, 'Grid does not work in this geometry.');
const lv_ugly_version_nofull = lvt(1, q1, 'Grid does not work in this geometry.');
const lv_bad_graphics = lvt(1, q1, 'Graphics not implemented in this geometry.');
const lv_some0 = lvt(0, q0, 'This land does not work in the current settings. Reason not available.');
const lv_some1 = lvt(1, q1, 'This land does not work well in the current settings. Reason not available.');
const lv_known_buggy = lvt(1, q1, 'This combination is known to be buggy at the moment.');
const lv_sloppy_pattern = lvt(1, q1 | lv_one_and_half, 'Somewhat sloppy pattern.');
const lv_no_fractal_landscapes = lvt(1, q1 | lv_one_and_half, 'Fractal landscapes not implemented in this geometry.');
const lv_simplified_walls = lvt(1, q1, 'Only simplified walls implemented.');
const lv_no_walls = lvt(0, q0, 'No walls implemented.');
export const lv_disabled = lvt(0, q0, 'This land has been disabled with compilation flags.');
const lv_pattern_special = lvt(3, qm3, 'Special pattern implemented for this geometry.');
const lv_not_3d = lvt(0, q0, 'This land does not make much sense in 3D.');
const lv_not_binary = lvt(0, q0, 'This land does not make much sense in binary tiling.');
const lv_shmup_only = lvt(0, q0, 'This land works only in the shmup mode.');
const lv_not_in_shmup = lvt(0, q0, 'This land is not available in the shmup mode.');
const lv_not_in_multi = lvt(0, q0, 'This land is not available in multiplayer.');
const lv_single_only = lvt(2, q0 | lv_switch_to_single, 'Available in single land mode only.');
const lv_not_in_hv = lvt(0, q0, 'Does not work in horodisk/Voronoi mode.');

// old Daily Challenges should keep their validity forever
// set this number for historical values of land_validity

// EX int old_daily_id = 1000000: G.old_daily_id

const landscapes_when = 177;

export const frog_when = 205;

export const cursed_when = 386;

export const walls_when = 388;

export function mark_tamper(): void { G.cheater++; }

/** the land customization menu (dialogs): a later stage */
export function customize_land_in_list(_l: eLand): void { throw new NotPorted('customize_land_in_list'); }
/** the custom land list menu (dialogs): a later stage */
export function customize_land_list(): void { throw new NotPorted('customize_land_list'); }

/** check if the given land should appear in lists */
export function land_validity(l: eLand): land_validity_t {

  let stdeucx = stdeuc();
  if (euclid() && quotient()) stdeucx = false;

  if (hat_in()) {
    if (l === laKraken) return lv_dont_work;
    if (l === laWineyard) return lv_dont_work;
    if (l === laReptile) return lv_bad_graphics;
    if (l === laBull) return lv_ok;
    if (l === laHaunted) return lv_dont_work;
    if (l === laHive) return lv_not_in_full_game;
    if (l === laRedRock) return lv_ok;
    if (l === laStorms) return lv_ok;
    if (l === laDice) return lv_dont_work;
    if (l === laVolcano) return lv_dont_work;
    if (l === laBlizzard) return lv_dont_work;
    if (l === laBurial) return lv_dont_work;
    if (l === laEclectic) return lv_dont_work;
    if (l === laCursed) return lv_dont_work;
    if (l === laElementalWall) return lv_dont_work;
    if (l === laDragon) return lv_not_in_full_game;
  }

  if (l === laDice && G.geometry === gNormal && PURE())
    return lv_dont_work;

  if (l === laDice && WDIM() === 3)
    return lv_dont_work;

  // CAP_ARCM
  if (l === laDice && arcm_in() && !arcm_support_dice(3) && !arcm_support_dice(4) && !arcm_support_dice(5))
    return lv_dont_work;

  if (l === laDice && arb_in() && !arb_support_dice(3) && !arb_support_dice(4) && !arb_support_dice(5))
    return lv_dont_work;

  if (G.old_daily_id < frog_when && among(l, laFrog, laEclectic, laWet))
    return lv_not_implemented;

  if (G.old_daily_id < cursed_when && among(l, laCursed, laDice))
    return lv_not_implemented;

  if (arb_in() && among(l, laWarpCoast, laDual, laEclectic, laReptile, laKraken))
    return lv_not_implemented;

  if (l === laEclectic && !(G.geometry === gNormal && BITRUNCATED()))
    return lv_pattern_not_implemented_weird;

  if (l === laFrog && G.shmup_on)
    return lv_not_in_shmup;

  if (walls_not_implemented() && isCrossroads(l))
    return lv_no_walls;

  if (mhybrid() || G.hybrid_pmap) {
    if (among(l, laPrincessQuest, laPrairie, laMirrorOld, laMirror, laDual, laWarpCoast, laKraken, laBrownian, laWhirlpool, laWestWall, laHive, laClearing, laWhirlwind, laBlizzard, laBull, laTerracotta, laCrossroads5,
      laEndorian, laDungeon, laMountain))
      return lv_not_implemented;
    if (among(l, laReptile, laDragon, laTortoise))
      return lv_bad_graphics;
    if ((hybrid_actual_geometry() === gTwistedProduct || G.geometry === gTwistedProduct) && l === laDryForest)
      return lv_hedgehogs;
    if (mhybrid() && hybrid_underlying() && hybrid_underlying_cgip()) {
      return hybrid_in_underlying_geometry(() => land_validity(l));
    }
  }

  // CAP_FIELD, CAP_COMPLEX2: the lands are not disabled

  if (l === laMinefield && closed_or_bounded())
    return lv_special_geo3;

  if (l === laAsteroids) {
    if (!G.shmup_on) return lv_shmup_only;
    if (!closed_manifold()) return lv_bounded_only;
    return lv_specially_designed;
  }

  if (nil()) {
    if (among(l, laCrossroads, laCrossroads2, laCrossroads3, laCrossroads4))
      return lv_full_game;
    if (among(l, laPalace, laGraveyard, laWineyard, laElementalWall))
      return lv_pattern_special;
    if (among(l, laEndorian, laCaribbean, laHaunted, laVolcano, laClearing, laStorms, laBlizzard))
      return lv_not_implemented;
  }

  if (WDIM() === 3) {
    if (l === laWarpCoast) return lv_ugly_version_nofull;
    if (l === laWineyard && hyperbolic() && !bt_in() && S7() === 6) return lv_pattern_special;
    if (l === laEmerald && hyperbolic() && !bt_in() && S7() === 12) return lv_pattern_special;
    if (l === laZebra) return lv_pattern_not_implemented_random;
    if (among(l, laWhirlpool, laPrairie, laWestWall, laBull)) return lv_not_3d;
    if (l === laEndorian && G.geometry === gKiteDart3) return lv_not_implemented;
    if (l === laEndorian && sol()) return lv_not_implemented;
    if (l === laEndorian && hyperbolic() && !quotient()) return lv_pattern_special;
    if (l === laIvoryTower && hyperbolic() && bt_in()) return lv_pattern_special;
    if (l === laDungeon || l === laBrownian) return lv_not_implemented;
    if (l === laKraken) return bt_in() ? lv_not_binary : lv_not_implemented;
    if (l === laBurial && !G.shmup_on) return lv_not_implemented;
    if (l === laMirrorOld && !G.shmup_on) return lv_not_implemented;
  }

  if (ls_hv_structure() && among(l, laDungeon, laEndorian, laBrownian, laPrincessQuest)) return lv_not_in_hv;
  if (ls_voronoi_structure() && among(l, laPrairie, laCamelot, laWhirlpool, laClearing, laHaunted, laWestWall)) return lv_not_in_hv;
  if (ls_horodisk_structure() && l !== laCrossroads && isCrossroads(l)) return lv_not_in_hv;

  if (l === laBrownian) {
    if (quotient() || !hyperbolic() || cryst()) return lv_dont_work;
  }

  if (bt_in()) {
    if (among(l, laMountain, laTemple)) return lv_pattern_compatibility;
    if (among(l, laDungeon, laIvoryTower, laOcean, laEndorian)) return lv_pattern_compatibility;
    if (among(l, laCaribbean, laCamelot)) return lv_pattern_compatibility_notrec;
    // Clearing -- does not generate
    /* laCamelot, laCaribbean -> they are OK but not recommended */
  }

  // CAP_ARCM
  if (arcm_in()) {
    if (among(l, laPower, laZebra, laFrog, laWineyard) && arcm_current_have_line()) return lv_pattern_defined;
    // horocycles not implemented
    if (isCyclic(l)) return lv_not_implemented;
  }

  if (arb_in()) {
    if (among(l, laPower, laZebra, laFrog, laWineyard) && arb_current_have_line()) return lv_pattern_defined;
  }

  // CAP_CRYSTAL
  if (cryst()) {
    if (l === laCamelot) return lv_interesting;
    if (isCrossroads(l)) return lv_full_game;
  }

  // Random Pattern allowed only in some specific lands
  if (G.randomPatternsMode && !isRandland(l))
    return lv_no_randpattern_version;

  if (isElemental(l)) {
    if (l !== laElementalWall)
      return lv_technical;
    // not good in Field quotient
    if (G.geometry === gZebraQuotient)
      return lv_special_geo3;
    if (quotient() || sol())
      return lv_no_great_walls;
    if (weirdhyperbolic())
      return lv_simplified_walls;
    // works nice on a big non-tetrahedron-based sphere
    if (sphere() && S3() !== 3 && GOLDBERG())
      return lv_special_geo3;
  }

  // not enough space
  if (l === laStorms && (G.old_daily_id < 35 ? !BITRUNCATED() : PURE()) && elliptic())
    return lv_not_enough_space;

  if (l === laStorms && WDIM() === 3)
    return lv_not_in_full_game; /* uses too much memory */

  if (l === laStorms && S7() === 3)
    return lv_not_enough_space;

  // does not agree with the pattern
  if (l === laStorms && quotient() && G.geometry !== gZebraQuotient)
    return lv_pattern_not_implemented_random;

  // pattern not implemented
  if (l === laStorms && S7() === 8)
    return lv_pattern_not_implemented_random;

  // mirrors do not work in gp
  if (among(l, laMirror, laMirrorOld) && (GOLDBERG() && G.old_daily_id < 33))
    return lv_dont_work;

  // mirrors do not work in kite and sol
  if (among(l, laMirror, laMirrorOld) && (aperiodic() || sol()))
    return lv_dont_work;

  if (isCrossroads(l) && G.geometry === gBinary4)
    return lv_not_implemented;

  if (bt_in() && among(l, laMirror, laMirrorOld))
    return lv_dont_work;

  if (l === laWhirlwind && hyperbolic_not37())
    return lv_pattern_incompatibility;

  const better_mirror = !G.geometry && STDVAR() && !ls_hv_structure() && !among(G.land_structure, lsTotalChaos, lsPatchedChaos, lsLandscape, lsVineWalls);

  // available only in non-standard geometries
  if (l === laMirrorOld && better_mirror)
    return lv_better_version_exists;

  // available only in standard geometry
  if (l === laMirror && !better_mirror)
    return lv_not_implemented;

  // Halloween needs bounded world (can be big bounded)
  if (l === laHalloween && !closed_or_bounded())
    return lv_bounded_only;

  // Crystal World is designed for nice_dual geometries
  if (l === laDual && (!has_nice_dual() || nonisotropic()))
    return lv_dont_work;

  if (l === laHaunted && ls_std_chaos())
    return lv_not_in_chaos;

  if (among(l, laHaunted, laElementalWall) && G.land_structure === lsLandscape)
    return lv_not_in_landscape;

  // standard, non-PTM specific
  if (l === laCrossroads5 && G.old_daily_id < 999 && G.tactic_on)
    return lv_not_in_ptm;

  // standard non-PTM non-chaos specific
  if ((l === laCrossroads5 || l === laCrossroads2) && (G.geometry || ls_any_chaos() || ls_no_walls()))
    return lv_some0;

  // special construction in the Chaos mode
  if (ls_any_chaos() && (l === laTemple || l === laHive || l === laOcean || l === laHaunted))
    return lv_special_chaos;

  if (l === laWhirlpool && a4())
    return lv_dont_work;

  if (isWarpedType(l) && a4() && GOLDBERG())
    return lv_dont_work;

  // CAP_IRR
  if ((isWarpedType(l) || l === laDual) && IRREGULAR() && !irr_bitruncations_performed())
    return lv_dont_work;

  if (IRREGULAR() && among(l, laPrairie, laMirror, laMirrorOld))
    return lv_dont_work;

  if ((arcm_in() || arb_in()) && l === laPrairie) return lv_dont_work;

  if ((IRREGULAR() || arcm_in() || arb_in()) && among(l, laBlizzard, laVolcano) && !sphere())
    return lv_dont_work;

  if (arcm_in() && DUAL() && l === laCrossroads4)
    return lv_not_implemented;

  if (G.geometry === gKiteDart3 && l === laGraveyard)
    return lv_pattern_special;

  // equidistant-based lands
  if (isEquidLand(l)) {
    // no equidistants supported in chaos mode
    if (ls_any_chaos())
      return lv_not_in_chaos;
    // the algorithm fails in Archimedean DUAL
    if (arcm_in() && DUAL())
      return lv_not_implemented;
    // the algorithm fails in Binary4
    if (G.geometry === gBinary4)
      return lv_not_implemented;
    // no equidistants supported in these geometries (big sphere is OK though)
    if (closed_or_bounded() && !bigsphere())
      return lv_unbounded_only_except_bigsphere;
    // Yendorian only implemented in standard
    if (l === laEndorian && G.geometry)
      return lv_not_implemented;
    // special Euclidean implementations
    if (euclid() && !ls_single() && G.old_daily_id > 9999) return lv_single_only;
    if (euclid() && (l === laIvoryTower || l === laMountain || l === laOcean || l === laMountain)) {
      return lv_special_geo;
    }
    // in other geometries, it works
    if (G.geometry)
      return lv_ok;
  }

  if (euclid() && l === laCaribbean && !ls_single() && G.old_daily_id > 9999) return lv_single_only;

  if (l === laPrincessQuest && ls_any_chaos())
    return lv_not_in_chaos;

  if (l === laPrincessQuest && G.tactic_on)
    return lv_not_in_ptm;

  if (l === laPrincessQuest && (!stdeucx || NONSTDVAR()))
    return lv_not_implemented;

  if (l === laPrincessQuest && G.shmup_on)
    return lv_not_in_shmup;

  if (l === laPrincessQuest && G.multi_players > 1)
    return lv_not_in_multi;

  if (l === laMountain && ls_any_chaos())
    return lv_not_in_chaos;

  if (l === laBrownian && ls_any_chaos())
    return lv_not_in_chaos;

  // works correctly only in some geometries
  if (l === laClearing && ls_any_chaos())
    return lv_not_in_chaos;

  if (l === laClearing)
    if (!(stdeucx || G.geometry === gBinaryTiling || a38() || (a45() && BITRUNCATED()) || (a47() && BITRUNCATED())) || NONSTDVAR())
      if (!closed_or_bounded())
        return lv_not_implemented;

  // does not work in non-bitrunc a4
  if (l === laOvergrown && a4() && !BITRUNCATED())
    return lv_some0;

  // does not work in bounded either
  if (l === laOvergrown && closed_or_bounded())
    return lv_some0;

  // horocycle-based lands, not available in bounded geometries nor in Chaos mode
  if (l === laWhirlpool || l === laCamelot || l === laCaribbean || l === laTemple) {
    if (ls_any_chaos()) {
      if (l === laTemple || (l as eLand) === laHive) // laHive cannot be here (as in C++)
        return lv_special_chaos;
      return lv_not_in_chaos;
    }
    if (arcm_in() || aperiodic()) return lv_not_implemented;
    if (closed_or_bounded()) return lv_unbounded_only;
    if (INVERSE()) return lv_not_implemented;
  }

  if (l === laHive) {
    if (ls_any_chaos()) return lv_special_chaos;
    if (closed_or_bounded()) return lv_unbounded_only;
  }

  // this pattern does not work on elliptic and small spheres
  if ((l === laBlizzard || l === laVolcano) && elliptic() && S7() < 5 && !arcm_in())
    return lv_not_enough_space;

  // Kraken does not really work on odd-sided cells;
  // a nice football pattern will solve the problem by forbidding the Kraken to go there
  // (but we do have to allow it in non-bitrunc standard)
  if (l === laKraken && (S7() & 1) && !has_nice_dual()) {
    return lv_dont_work_but_ingame;
  }

  // works in most spheres, Zebra quotient, and stdeucx
  if (l === laWhirlwind) {
    if (G.geometry === gZebraQuotient)
      return lv_pattern_compatibility;
    if (stdeucx) { /* ok */ }
    else if (S7() === 4 && BITRUNCATED()) return lv_special_geo;
    else if (bigsphere() && !BITRUNCATED() && !elliptic()) return lv_special_geo;
    else return lv_dont_work;
  }

  // needs standard/Euclidean (needs fractal landscape)
  if (among(l, laTortoise, laVariant) && !(G.old_daily_id < landscapes_when ? stdeucx : geometry_supports_cdata()))
    return lv_not_implemented;

  // technical lands do not count
  if (l !== laCA && isTechnicalLand(l))
    return lv_technical;

  // only in bounded geometry, and not in PTM
  if (l === laCA && !closed_or_bounded())
    return lv_bounded_only;

  if (l === laCA && G.tactic_on)
    return lv_not_in_ptm;

  if (l === laCA)
    return lv_no_game;

  // Dragon Chasm requires unbounded space [partial]
  if (l === laDragon && smallbounded())
    return lv_unbounded_only;

  // Graveyard pattern does not work on non-bitrunc weird geometries
  if ((l === laGraveyard && !G.randomPatternsMode) || l === laRuins || l === laRedRock) switch (geosupport_football()) {
    case 0:
      return lv_dont_work;
    case 1:
      return lv_sloppy_pattern;
    default: ;
  }

  // Warped Coast does not work on non-bitrunc S3s (except standard heptagonal where we have to keep it)
  if (l === laWarpCoast && (S3() === 3) && geosupport_football() !== 2 && !(G.old_daily_id >= 33 && geosupport_chessboard())) {
    return lv_ugly_version_infull;
  }

  if (l === laWarpCoast && quotient() && G.geometry !== gZebraQuotient && !G.randomPatternsMode)
    return lv_pattern_incompatibility;

  if (among(l, laEmerald, laCamelot, laDryForest) && valence() !== 3 && G.old_daily_id >= 65)
    return lv_hedgehogs;

  // laPower and laEmerald and laPalace -> [partial] in quotients and hyperbolic_non37
  if ((l === laPower || l === laEmerald || l === laPalace || l === laWildWest) && !G.randomPatternsMode) {
    if (euclid() || bigsphere()) { /* ok */ }
    else if (G.old_daily_id <= 65 && a45()) { /* ok */ }
    else if (!hyperbolic_37()) return l === laWildWest ? lv_some0 : lv_pattern_not_implemented_random;
    else if (quotient()) return lv_pattern_incompatibility;
  }

  if (among(l, laEmerald, laCamelot, laDryForest) && valence() !== 3)
    return lv_hedgehogs;

  if (l === laWineyard && sol())
    return lv_pattern_special;

  // ... wineyard pattern is GOOD only in the standard geometry or Euclidean
  if (l === laWineyard && (NONSTDVAR() || sphere()) && !G.randomPatternsMode)
    return lv_pattern_not_implemented_random;

  // quotient == qFIELD: the macro quotient is (cgflags & qANYQ), so this compares qANYQ-or-0 with qFIELD (never true)
  if (l === laTrollheim && (cgflags() & qANYQ) === qFIELD)
    return lv_not_enough_space;

  if (l === laStorms && hyperbolic_not37())
    return lv_pattern_not_implemented_random;

  if (l === laTrollheim && !stdeucx && !closed_or_bounded())
    return lv_some1;

  if (l === laReptile && sol()) return lv_ugly_version_nofull;

  if (l === laReptile) {
    if (G.old_daily_id <= 64) {
      if (l === laReptile && (a38() || a4() || sphere() || !BITRUNCATED() || (quotient() && !euclid() && G.geometry !== gZebraQuotient)))
        return lv_bad_graphics;
    }
    else {
      let reptile_good = false;
      if (hyperbolic_37() && BITRUNCATED()) reptile_good = true;
      if (euc_in(2, 6)) reptile_good = true;
      if (quotient() && G.geometry !== gZebraQuotient && !euclid())
        reptile_good = false;
      if (!reptile_good)
        return lv_bad_graphics;
    }
  }

  if ((l === laDragon || l === laReptile) && !stdeucx && !smallbounded() && !G.randomPatternsMode)
    return lv_no_fractal_landscapes;

  if (l === laCrossroads && smallsphere())
    return lv_not_enough_space;

  if (l === laCrossroads3 && !stdeucx && !bigsphere())
    return lv_not_enough_space;

  if (among(l, laCrossroads, laCrossroads2, laCrossroads3, laCrossroads5, laCrossroads6, laMasterCrossroads) && weirdhyperbolic() && G.old_daily_id < walls_when)
    return lv_no_great_walls;

  // Crossroads IV is great in weird hyperbolic
  if (l === laCrossroads4 && weirdhyperbolic() && !quotient())
    return lv_full_game;

  // OK in small bounded worlds, and in Euclidean
  if (l === laCrossroads4 && quotient())
    return lv_some0;

  if (among(l, laZebra, laFrog) && bt_in()) return lv_pattern_defined;

  if (among(l, laZebra, laFrog) && (S3() >= OINF || arcm_in() || arb_in())) return lv_pattern_not_implemented_random;

  if (among(l, laZebra, laFrog) && quotient() && G.geometry !== gZebraQuotient && !G.randomPatternsMode)
    return lv_pattern_incompatibility;

  if (among(l, laZebra, laFrog) && !(stdeucx || (a4() && !BITRUNCATED()) || a46() || (G.geometry === gZebraQuotient && G.old_daily_id > 106)) && !G.randomPatternsMode)
    return lv_pattern_not_implemented_weird;

  if (l === laCrossroads3 && euclid())
    return lv_inaccurate; // because it is not accurate

  if (l === laPrairie) {
    if (GOLDBERG()) return lv_not_implemented;
    else if (stdeucx || (bigsphere() && BITRUNCATED() && !elliptic()) || (G.geometry === gFieldQuotient)) { /* ok */ }
    else if (!closed_or_bounded()) return lv_not_implemented;
    else return lv_unbounded_only;
  }

  if (l === laTerracotta && !stdeucx && !(bigsphere()))
    return lv_great_walls_missing;

  // highlight Crossroads on Euclidean
  if (euclid() && !quotient() && (l === laCrossroads || l === laCrossroads4) && !aperiodic())
    return lv_full_game;

  if (sol() && among(l, laCrossroads, laCrossroads4))
    return lv_full_game;

  if (sol() && l === laCamelot)
    return lv_not_implemented;

  if (euclid() && quotient() && !closed_or_bounded() && l === laCrossroads && euc_sdxy()[1] === -2 * euc_sdxy()[0])
    return lv_full_game;

  if (euclid() && quotient() && !closed_or_bounded() && l === laCrossroads4 && euc_sdxy()[1] === 0)
    return lv_full_game;

  // highlight Zebra-based lands on Zebra Quotient!
  if (among(l, laZebra, laWhirlwind, laStorms, laWarpCoast, laWarpSea, laFrog) && G.geometry === gZebraQuotient)
    return lv_pattern_compatibility;

  // highlight FP-based lands on Field Quotient!
  if ((l === laPrairie || l === laVolcano || l === laBlizzard) && G.geometry === gFieldQuotient)
    return lv_pattern_compatibility;

  // highlight Docks-based lands on Bolza and Bolza x2!
  if (l === laDocks && among(G.geometry, gBolza, gBolza2))
    return lv_pattern_compatibility;

  // these are highlighted whenever allowed
  if (l === laHalloween)
    return lv_specially_designed;

  if (l === laDual && geosupport_threecolor() === 2)
    return lv_specially_designed;

  if (l === laDual && !G.geometry && !GOLDBERG())
    return hyperbolic_37() ? lv_not_in_full_game3 : lv_not_in_full_game;

  if (l === laSnakeNest && WDIM() === 2) {
    if (geosupport_threecolor() < 2)
      return lv_needs_threecolor;
    else return lv_specially_designed;
  }

  if (l === laDocks && !G.randomPatternsMode) {
    if (a38() && !GOLDBERG() && !nonisotropic()) return lv_specially_designed;
    if (a38() && !nonisotropic()) return lv_pattern_not_implemented_weird;
    return lv_pattern_not_implemented_exclude;
  }

  if (l === laStorms && euclid() && closed_manifold())
    return lv_interesting;

  if (l === laMagnetic)
    return lv_land_not_implemented;

  if (G.shmup_on && among(l, laMirror, laMirrorOld) && among(G.geometry, gElliptic, gZebraQuotient, gKleinQuartic, gBolza, gBolza2, gMinimal))
    return lv_known_buggy;

  // these don't appear in normal game, but do appear in special modes
  if (l === laWildWest && !G.randomPatternsMode)
    return lv_out_of_theme;

  if (l === laIce && STDVAR() && hyperbolic_37() && !quotient() && !arcm_in() && !bt_in())
    return lv_full_game;

  return lv_ok;
}

/** static initialization of landlock.cpp: EX vector<eLand> land_over = {...}; the -land-info option */
export function register_landlock(): void {
  G.land_over = [...land_over_table];
  arg_add3('-land-info',
    () => {
      for (let li = 0; li < landtypes; li++) {
        const l = li;
        printf(dnameof_l(l) + ' : ' + land_validity(l).msg + '\n'); // println(hlog, ...)
      }
    });
}

// unused-import guard for the canvas land (laCanvas is only named in customize_land_list)
void laCanvas;
