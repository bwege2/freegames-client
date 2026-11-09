// landgen.cpp of HyperRogue 13.1o: land generation (giantLandSwitch: the contents of each land; setdist: the
// generation steps by distance). Package P3. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Macros of giantLandSwitch (ONEMPTY, PT, hrand_monster, RANDPAT*, PIU) are written out inline. The file-local
// helpers buildRedWall, blizzard_no_escape, out_ruin are exported (used across the module). EX hookset
// hooks_cellgen and the EX variables are in G.
import { G } from './globals.ts';
import { NUMWITCH, PRIZEMUL, among, callhandlers, gdiv, gmod, isize } from './hyper.ts';
import { idiv, itrunc } from './cpp.ts';
import {
  NOBARRIERS, NODIR, cell, cellwalker, global_distance_limit, manual_celllister, type heptagon,
} from './locations.ts';
import {
  itAmethyst, itApple, itBabyTortoise, itBarrow, itBlizzard, itBombEgg, itBone, itBounty, itBuggy2, itBull, itCoast,
  itCompass, itCoral, itCurseDraining, itCurseFatigue, itCurseGluttony, itCurseRepulsion, itCurseWater,
  itCurseWeakness, itCursed, itDiamond, itDice, itDock, itDodeca, itDragon, itEclectic, itElemental, itElixir,
  itEmerald, itFeather, itFernFlower, itFjord, itFrog, itFulgurite, itGlowCrystal, itGold, itGreenGrass,
  itGreenStone, itGrimoire, itHell, itHolyGrail, itHunting, itHyperstone, itIvory, itKraken, itLavaLily, itLotus,
  itMutant, itMutant2, itNone, itOrbAether, itOrbAir, itOrbDiscord, itOrbDragon, itOrbFire, itOrbFish, itOrbFlash,
  itOrbFrog, itOrbIllusion, itOrbInvis, itOrbLife, itOrbLightning, itOrbLuck, itOrbPsi, itOrbSafety, itOrbShield,
  itOrbSpeed, itOrbSword, itOrbTeleport, itOrbThorns, itOrbTime, itOrbWater, itOrbWinter, itPalace, itPirate,
  itPower, itRedGem, itRevolver, itRose, itRuby, itRuins, itSapphire, itShard, itSilver, itSlime, itSnake, itSpice,
  itStatue, itSwitch, itTerra, itTreat, itTrollEgg, itVarTreasure, itWest, itWet, itWindstone, itWine, itZebra,
  laAlchemist, laAsteroids, laBarrier, laBlizzard, laBrownian, laBull, laBurial, laCA, laCamelot, laCanvas,
  laCaribbean, laCaves, laClearing, laCocytus, laCrossroads, laCrossroads2, laCrossroads3, laCrossroads4,
  laCrossroads5, laCrossroads6, laCursed, laDeadCaves, laDesert, laDice, laDocks, laDragon, laDryForest, laDual,
  laDungeon, laEAir, laEEarth, laEFire, laEWater, laEclectic, laElementalWall, laEmerald, laEndorian, laFrog,
  laGraveyard, laHalloween, laHaunted, laHauntedBorder, laHauntedWall, laHell, laHive, laHunting, laIce,
  laIvoryTower, laJungle, laKraken, laLivefjord, laMagnetic, laMasterCrossroads, laMemory, laMercuryRiver,
  laMinefield, laMirror, laMirrorOld, laMirrorWall, laMirrorWall2, laMirrored, laMirrored2, laMotion, laMountain,
  laNone, laOcean, laOceanWall, laOvergrown, laPalace, laPower, laPrairie, laPrincessQuest, laRedRock, laReptile,
  laRlyeh, laRose, laRuins, laSnakeNest, laStorms, laSwitch, laTemple, laTerracotta, laTortoise, laTrollheim,
  laVariant, laVolcano, laWarpCoast, laWarpSea, laWestWall, laWet, laWhirlpool, laWhirlwind, laWildWest, laWineyard,
  laZebra, landtypes, moAirElemental, moAlbatross, moAltDemon, moBat, moBomberbird, moButterfly, moCShark, moCrusher,
  moCrystalSage, moCultist, moCultistLeader, moDarkTroll, moDesertman, moDragonHead, moDragonTail, moDraugr, moEagle,
  moEarthElemental, moEvilGolem, moFallingDog, moFalsePrincess, moFamiliar, moFatGuard, moFireFairy, moFjordTroll,
  moFlailer, moForestTroll, moFrog, moGadfly, moGargoyle, moGhost, moGoblin, moGreater, moGreaterShark, moHedge,
  moHexDemon, moHexSnake, moHexer, moHunterDog, moHunterGuard, moIceGolem, moIvyRoot, moJiangshi, moKrakenH,
  moKrakenT, moLancer, moLavaWolf, moLesser, moMetalBeast, moMetalBeast2, moMiner, moMirrorSpirit, moMonk, moMonkey,
  moMouse, moMutant, moNarciss, moNecromancer, moNone, moNorthPole, moOrangeDog, moOutlaw, moPair, moPalace,
  moParrot, moPhaser, moPike, moPirate, moPrincess, moPyroCultist, moRanger, moRatling, moRedFox, moRedTroll,
  moResearcher, moRoseBeauty, moRoseLady, moRunDog, moRusalka, moSalamander, moSeep, moShark, moSkeleton,
  moSleepBull, moSlime, moSouthPole, moSparrowhawk, moStormTroll, moSwitch1, moSwitch2, moTentacle, moTortoise,
  moTroll, moVariantWarrior, moVaulter, moViking, moVineBeast, moVineSpirit, moVizier, moVoidBeast, moWaterElemental,
  moWestHawk, moWindCrow, moWitch, moWitchGhost, moWitchWinter, moWolf, moWorldTurtle, moWorm, moYeti, moZombie,
  waAncientGrave, waArrowTrap, waBarrier, waBarrowDig, waBarrowWall, waBigBush, waBigStatue, waBigTree, waBoat,
  waBonfireOff, waCTree, waCanopy, waCavefloor, waCavewall, waCharged, waChasm, waChasmD, waClosePlate, waClosedGate,
  waColumn, waDeadfloor, waDeadfloor2, waDeadwall, waDeepWater, waDock, waDune, waEarthD, waElementalD,
  waEternalFire, waFan, waFloorA, waFloorB, waFreshGrave, waFrozenLake, waGiantRug, waGlass, waGrounded, waIcewall,
  waInvisibleFloor, waLake, waMercury, waMineMine, waMineOpen, waMineUnknown, waMirrorWall, waNone, waOpenGate,
  waOpenPlate, waPalace, waPlatform, waRed1, waRed2, waRed3, waReptile, waRose, waRubble, waRuinWall, waSaloon,
  waSandstone, waSea, waShallow, waShrub, waSmallBush, waSmallTree, waStone, waStrandedBoat, waSulphur, waSulphurC,
  waTerraWarrior, waThumperOff, waTower, waTrapdoor, waVineHalfA, waVineHalfB, waVinePlant, waWarpGate, waWaxWall,
  type eItem, type eLand, type eMonster,
} from './content.ts';
import { drawBigFlash } from './animations.ts';
import { hat_get_hat_id, hat_in } from './aperiodic-hat.ts';
import { arb_current_have_line, arb_in, arb_linespattern } from './arbitrile.ts';
import { arcm_current_have_line, arcm_in, arcm_linespattern } from './archimedean.ts';
import { tkills } from './attack.ts';
import { apply_precision_policy } from './backed-map.ts';
import { hasbardir, preventbarriers, setland } from './barriers.ts';
import { addMessage } from './basegraph.ts';
import {
  beCIsland, buildBigStuff, buildEquidistant, checkInTree, coastval, generateTreasureIsland, getHauntedDepth,
  masterAlt, moreBigStuff, openplains, quickfind, roundTableRadius, setLandEuclid, setLandHybrid, setLandNil,
  setLandQuotient, setLandSol, setLandSphere, setLandWeird, temple_layer_size,
} from './bigstuff.ts';
import { bt_expansion, bt_in, bt_updir } from './binary-tiling.ts';
import {
  BARLEV, RANDITER, celldist, celldistAlt, celldistance, createMov, fractal_rep, geometry_supports_cdata, getBits,
  getCdata, getDistLimit, isNeighbor, isNeighborCM, is_in_disk, is_in_fractal, neighborId, randpattern,
  randpatternMajority, valence, type hrmap,
} from './cell.ts';
import {
  BITRUNCATED, GDIM, GOLDBERG, NONSTDVAR, OINF, PURE, S3, S7, WDIM, a38, a4, aperiodic, cgflags, closed_or_bounded,
  cryst, elliptic, embedded_plane, eubinary, euclid, gHoroHex, gOctagon, gSpace435, gSpace534, gSpace535,
  gZebraQuotient, gproduct, hyperbolic, hyperbolic_37, hyperbolic_not37, mhybrid, mproduct, nil, qFRACTAL, quotient,
  smallbounded, sol, sphere, stdeuc, weirdhyperbolic,
} from './classes.ts';
import {
  ca_list_adj, clearing_generate, dungeon_all, hive_createBugArmy, hive_hivehard, hive_randomHyperbug, mirror_build,
  prairie_generateBeast, prairie_generateTreasure, prairie_isriver, prairie_nearriver, prairie_spread,
  princess_getPrisonInfo, tortoise_getRandomBits, tortoise_getb, tortoise_mask, tortoise_seek, whirlpool_generate,
  whirlwind_fzebra3, whirlwind_switchTreasure, windmap_NOWINDBELOW, windmap_at,
} from './complex.ts';
import {
  brownian_apply_futures, brownian_build, dice_generate_full, terracotta_randterra, westwall_switchTreasure,
} from './complex2.ts';
import { crystal_may_place_compass, crystal_set_land } from './crystal.ts';
import { raiseBuggyGeneration } from './debug.ts';
import { geom3_in_flipped } from './embeddings.ts';
import { HF_DRAGON, HF_MOUSE } from './environment.ts';
import { euc2_coordinates, euc_at, euc_get_emerald, euc_in, euc_sdxy, euc_set_land, type loc } from './euclid.ts';
import { fake_in, fake_in_underlying_geometry } from './fake.ts';
import {
  cellHalfvine, do_not_touch_this_wall, elementalOf, inmirror, isFire, isGravityLand, isMultitile, isWarpedType,
  localshardof,
} from './flags.ts';
import {
  hyperstonesUnlocked, isCrossroads, lsChaosRW, lsLandscape, lsTotalChaos, lsVineWalls, ls_any_chaos, ls_any_order,
  ls_chaoticity, ls_horodisk_structure, ls_hv_structure, ls_ls_mul, ls_ls_mul_big, ls_patched_chaos, ls_single,
  ls_tame_chaos, ls_voronoi_structure, ls_wall_chaos, randomElementalLandWeighted,
} from './landlock.ts';
import { XLAT } from './language.ts';
import { mapeditor_applyModelcell } from './mapeditor.ts';
import { cellEdgeUnstable, earthFloor, toggleGates } from './mapeffects.ts';
import {
  buildIvy, canReachPlayer, chasmify, chasmifyEarth, chasmifyElemental, crossroadsMonster, dieTroll, generateSnake,
  hardness_empty, palaceHP, pickTroll, reptilemax,
} from './monstergen.ts';
import { hybrid_get_where, hybrid_in_underlying_geometry, in_s2xe, sn_in } from './nonisotropic.ts';
import {
  buildPrizeMirror, orbcrossfun, placeCrossroadOrbs, placeLocalOrbs, placeLocalSpecial, placeOceanOrbs,
  placePrizeOrb, treasureForLocal,
} from './orbgen.ts';
import { againstWind, passable } from './passable.ts';
import {
  ccolor_generateCanvas, cdist50, ctof, emeraldval, fiftyval049, getHemisphere, ishept, kraken_pseudohept,
  patterns_PAT_COLORING, patterns_SPF_DOCKS, patterns_patterninfo, patterns_val38, polarb50, pseudohept,
  pseudohept_r, zebra3, zebra40,
} from './pattern2.ts';
import { player_positions } from './pcmove.ts';
import { hrand, hrand_elt, pick } from './rand.ts';
import { reg3_exact_rules } from './reg3.ts';
import { playSeenSound, playSound } from './sound.ts';
import { wfc_invoke, wfc_schedule } from './wfcgen.ts';
import { YF_NEAR_TENT, yendor_clev, yendor_hardness } from './yendor.ts';

// land generation routines

// EX int explore[10], exploreland[10][landtypes], landcount[landtypes]: G.explore, G.exploreland, G.landcount
// EX bool safety, lastland, lastexplore: G.*

export function update_lastexplore(): void {
  G.lastexplore = G.shmup_on ? G.shmup_curtime : G.turncount;
}

// EX bool randomPatternsMode, randompattern[landtypes], genrange_bonus, chaosUnlocked, chaosAchieved: G.*

export function doOvergenerate(): void {
  for (const pc of player_positions())
    setdist(pc, 7 - getDistLimit() - G.genrange_bonus, null!);
}

export function notDippingFor(i: eItem): boolean {
  if (G.peace_on) return false;
  if (ls_chaoticity() >= 60) return true;
  const v = G.items[i] - G.currentLocalTreasure;
  if (v <= 10) return true;
  if (v >= 20) return false;
  return v < hrand(10) + 10;
}

export function notDippingForExtra(i: eItem, x: eItem): boolean {
  if (G.peace_on) return false;
  if (ls_chaoticity() >= 60) return true;
  const v = G.items[i] - Math.min(G.items[x], G.currentLocalTreasure);
  if (v <= 10) return true;
  if (v >= 20) return false;
  return v < hrand(10) + 10;
}

/** #define PT(x, y) rebalance_treasure(x, y, c->land) (hyper.h) */
export function buildRedWall(c: cell, gemchance: number): void {
  if (c.monst) return;
  const ki = rebalance_treasure(G.kills[moHexSnake] + G.kills[moRedTroll], 50, c.land);
  c.wall = waRed3;
  if (hrand(100 + ki) < gemchance + ki)
    c.item = itRedGem;
  else if (gemchance) placeLocalSpecial(c, 8000, gemchance, gemchance);
}

// #define RANDPATC(c) (randpattern(c,randompattern[c->land])) and the other RANDPAT macros: inline at their uses

// EX bool reptilecheat: G.reptilecheat

function blizzard_no_escape1(c: cell, cl: manual_celllister): boolean {
  if (!cl.add(c)) return true;
  if (c.item === itOrbSafety)
    return false;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (c2.land === laBarrier)
      continue;
    if (c2.land !== laBlizzard && passable(c2, null!, 0n))
      return false;
    if (!againstWind(c2, c) && !blizzard_no_escape1(c2, cl))
      return false;
  }
  return true;
}

export function blizzard_no_escape(c: cell): boolean {
  const cl = new manual_celllister();
  try {
    return blizzard_no_escape1(c, cl);
  } finally { cl.destroy(); }
}

export function out_ruin(c: cell): boolean {
  if (sphere())
    return getHemisphere(c, 0) > 0;
  else if (geometry_supports_cdata()) {
    let cd = getCdata(c, 3);
    cd &= 31;
    return cd >= 16;
  }
  else // CAP_FIELD
    return windmap_at(c) >= 128;
}

export function genRuinMonster(c: cell): eMonster {
  const m = pick(moHexDemon, moHexDemon, moHexDemon, moAltDemon, moAltDemon, moMonk, moMonk, moSkeleton, moSkeleton, moCrusher);
  if (m === moHexDemon && pseudohept(c))
    return genRuinMonster(c);
  if (m === moMonk) {
    if (c.item) return genRuinMonster(c);
    for (let i = 0; i < c.type; i++) { const c2 = createMov(c, i); if (c2.item) return genRuinMonster(c); }
  }
  return m;
}

// the giant switch generating most of the lands...

// void gen_brownian(cell *c); (forward declaration)

export function createArrowTrapAt(c: cell, land: eLand): void {
  const cw = new cellwalker(c, hrand(c.type));
  const cc: cell[] = new Array<cell>(5);
  cc[2] = c;
  const cw2 = cw.clone();
  cw.addStep(); cc[3] = cw.at; cw.addRevStep(); cc[4] = cw.at;
  cw2.addRevStep(); cc[1] = cw2.at; cw2.addRevStep(); cc[0] = cw2.at;
  let ok = true;
  for (let i = 0; i < 5; i++) {
    if (cc[i].land !== laNone && cc[i].land !== land) ok = false;
    if (cc[i].bardir !== NODIR) ok = false;
  }
  for (let i = 1; i < 4; i++) {
    for (let k = 0; k < cc[i].type; k++) { const c2 = cc[i].move(k); if (!c2) continue; if (!among(c2.wall, waNone, waStone)) ok = false; }
  }
  if (ok) {
    if (!G.racing_on) for (let i = 1; i < 4; i++) {
      cc[i].wall = waArrowTrap;
      cc[i].wparam = 0;
    }
    for (let i = 0; i < 5; i++)
      cc[i].bardir = NOBARRIERS;
    cc[0].wall = waStone;
    cc[4].wall = waStone;
  }
}

const emeraldmonsters: eMonster[] = [moHedge, moLancer, moFlailer, moMiner];

export function emerald_monster(): eMonster {
  let m = emeraldmonsters[hrand(4)];
  if (m === moHedge && (S3() !== 3 || (mhybrid() && !mproduct())))
    m = moFlailer;
  return m;
}

export function build_pool(c: cell, with_boat: boolean): void {
  let vacant = true;
  if (c.monst || !among(c.wall, waNone, waDeepWater, waBoat)) vacant = false;
  for (let i = 0; i < c.type; i++) {
    const c1 = createMov(c, i);
    if (!among(c1.land, laNone, laVariant) || c1.monst || !among(c1.wall, waNone, waDeepWater, waBoat)) vacant = false;
  }
  if (vacant) {
    c.wall = waDeepWater;
    for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (c1.wall !== waBoat) c1.wall = waDeepWater; }
    if (with_boat) c.move(hrand(c.type)).wall = waBoat;
  }
}

export function place_elemental_wall(c: cell): void {
  if (c.land === laEFire) c.wall = waEternalFire;
  else if (c.land === laEWater) c.wall = waDeepWater;
  else if (c.land === laEAir) c.wall = waChasm;
  else if (c.land === laEEarth) c.wall = waStone;
}

// automatically adjust monster generation for 3D geometries and custom difficulty
export function hrand_monster_in(l: eLand, x: number): number {
  // dual geometry mode is much harder, so generate less monsters to balance it
  if (G.dual_state) x = Math.imul(x, 3);
  // in 3D monster generation depends on the sight range
  if (WDIM() === 3 && !sphere()) {
    const t = isize(G.current_display.cellmatrices);
    if (t > 500) x = itrunc(Math.trunc(x * t / 500));
  }
  if (G.use_custom_land_list) {
    const diff = G.custom_land_difficulty[l];
    if (!diff) return 1000000000;
    x = idiv(Math.imul(x, 100), diff);
    if (x === 0) x = 1;
  }
  return hrand(x);
}

// #define hrand_monster(x) hrand_monster_in(c->land, x)

export function is_zebra_trapdoor(c: cell): boolean {
  if (euclid() && closed_or_bounded()) return false;
  // CAP_ARCM
  else if (arcm_in() && arcm_current_have_line())
    return arcm_linespattern(c);
  else if (arb_in() && arb_current_have_line())
    return arb_linespattern(c);
  // MAXMDIM >= 4
  else if (PURE() && reg3_exact_rules()) switch (G.geometry) {
    case gSpace534: {
      if (c.master.fieldval === 0) return true;
      return false;
    }
    case gSpace435: {
      for (let i = 0; i < c.type; i++) {
        const cw = new cellwalker(c, i);
        for (let a = 0; a < 3; a++) {
          if (cw.at.master.fieldval === 0) return true;
          cw.addStep();
          cw.addRev();
        }
      }
      return false;
    }
    case gSpace535: {
      return (c.master.fieldval % 5) % 2 === 1;
    }
    default:
      return false;
  }
  else if (euclid() && !arcm_in()) {
    const co = euc2_coordinates(c);
    const y = co[1];
    return (y & 1) !== 0;
  }
  // CAP_ARCM
  else
    if (arcm_in()) return hrand(2) !== 0;
  else
    if (arb_in()) return hrand(2) !== 0;
  else
    if (S3() >= OINF) return hrand(2) !== 0;
  // CAP_BT
  else
    if (bt_in()) return (c.master.distance & 1) !== 0;
  else
    return (G.randomPatternsMode ? randpattern(c, G.randompattern[c.land]) : (zebra40(c) & 2) !== 0);
}

export function gen_eclectic_monster(c: cell): void {
  const c2 = c.move(hrand(c.type));
  if (c2.wall === waRed1 || c2.wall === waRed2 || c2.wall === waRed3)
    c.monst = moRedTroll;

  else if (c2.wall === waDeadwall)
    c.monst = pick(moMiner, moTroll);

  else if (c2.wall === waSmallTree || c2.wall === waBigTree)
    c.monst = moFireFairy;

  else if (c2.wall === waSandstone || c2.wall === waCharged) {
    c.monst = moMetalBeast; c.hitpoints = 2;
  }

  else if (c2.wall === waPalace) {
    c.monst = moPalace; c.hitpoints = 2;
  }

  else if (c2.wall === waIcewall)
    c.monst = pick(moWolf, moIceGolem);

  else if (c2.wall === waNone && !c2.monst && hrand(100) < 5 && !G.shmup_on) {
    const c1 = c;
    c1.monst = moPair;
    c2.monst = moPair;
    c1.stuntime = 0;
    c2.stuntime = 0;
    c1.mondir = neighborId(c1, c2);
    c2.mondir = neighborId(c2, c1);
  }

  else {

    /* more wolves! */
    for (let i = 0; i < c.type; i++) {
      const c3 = c.move(i); if (!c3) continue;
      if (c3.wall === waIcewall) {
        c.monst = moWolf;
        return;
      }
    }
  }
}

export function place_random_gate_continuous(c: cell): void {
  c.wall = pick(waClosedGate, waOpenGate);
  if (c.wall === waClosedGate) toggleGates(c, waClosePlate, 1);
  else toggleGates(c, waOpenPlate, 1);
}

export function gen_baby_tortoise(c: cell): void {
  c.item = itBabyTortoise;
  G.tortoise_babymap.set(c, tortoise_getb(c) ^ tortoise_getRandomBits());
}

export function rebalance_treasure(x: number, y: number, l: eLand): number {
  // quotient == 2: the macro quotient is (cgflags & qANYQ), qANYQ = 2, so this is 'quotient'
  let res = ((G.tactic_on || quotient() || G.daily_on) ? (y) : G.inv_on ? Math.min(2 * (y), x) : (x));
  if (G.use_custom_land_list) res = idiv(res * G.custom_land_treasure[l] + 50, 100);
  res *= ls_ls_mul();
  return res;
}

export function random_curse(): eItem {
  return pick(itCurseWeakness, itCurseDraining, itCurseWater, itCurseFatigue, itCurseRepulsion, itCurseGluttony);
}

export function clear_item(c: cell): void {
  if (c.item === itOrbWater && c.wall === waStrandedBoat)
    c.wall = waNone;
  c.item = itNone;
}

/** giantLandSwitch: the land-specific part of setdist.
 *  Macros: ONEMPTY = `if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat)`;
 *  PT(x, y) = rebalance_treasure(x, y, c.land); hrand_monster(x) = hrand_monster_in(c.land, x);
 *  RANDPAT = randpattern(c, G.randompattern[c.land]); RANDPAT3(i) = randpatternMajority(c, i, RANDITER);
 *  RANDPATV(x) = randpattern(c, G.randompattern[x]); PIU(x) = hybrid_in_underlying_geometry(() => x) */
export function giantLandSwitch(c: cell, d: number, from: cell): void {
  const fargen = d === 9 || (d === 8 && BARLEV() === 8);
  switch (c.land) {

    case laPrairie: // -------------------------------------------------------------

      if (d === 7 && ls_any_chaos()) {
        if (hrand_monster_in(c.land, 9000) < G.items[itGreenGrass] - (prairie_isriver(G.cwt.at) ? 40 : 0) && !G.safety)
          c.monst = moGadfly;
        if (hrand_monster_in(c.land, 100) < 5) c.monst = moSleepBull;
        if (hrand(800) < 10) {
          c.item = itGreenGrass;
        }
        return;
      }

      // CAP_FIELD
      if (d === 7) {
        if (prairie_isriver(c)) {
          if (G.shmup_on) G.prairie_beaststogen.push(c);
          else prairie_generateBeast(c);
        }
        else if (!prairie_nearriver(c) && c.LHU.fi.flowerdist > 7 && !G.safety) {
          if (hrand_monster_in(c.land, 9000) < G.items[itGreenGrass] - (prairie_isriver(G.cwt.at) ? 40 : 0))
            c.monst = moGadfly;
          else buildPrizeMirror(c, 1000);
        }
        prairie_generateTreasure(c);
      }
      break;

    case laDungeon: // -------------------------------------------------------------
    case laIvoryTower:
      dungeon_all(c, d);
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (c.land === laIvoryTower) {
          if (hrand_monster_in(c.land, 20000) < 20 + G.items[itIvory] + yendor_hardness()) {
            if (cellEdgeUnstable(c))
              c.monst = moGargoyle;
            else
              c.monst = moFamiliar;
          }
          else if (c.landparam >= 14 && hrand(2000) < rebalance_treasure(50 + G.kills[moGargoyle] + G.kills[moFamiliar], 150, c.land) && !cellEdgeUnstable(c) && !G.peace_on) {
            c.item = itIvory;
          }
        }

        if (c.land === laDungeon) {
          let lp = Math.imul(c.landparam, c.landparam);
          if (lp > 100) lp = 100;
          if (c.landparam >= 10 && hrand_monster_in(c.land, 20000) < 5 * lp + G.items[itSlime] + yendor_hardness() && !cellEdgeUnstable(c) && !G.peace_on) {
            c.monst = moSkeleton, c.hitpoints = 3;
          }
          else if (c.landparam >= 10 && hrand_monster_in(c.land, 50000) < idiv(lp, 2) + G.items[itSlime] + yendor_hardness()) {
            c.monst = moGhost;
          }
          else if (c.landparam >= 10 && hrand_monster_in(c.land, 50000) < 3 * (100 - lp) + 80 + idiv(G.items[itSlime], 3) + yendor_hardness()) {
            c.monst = moBat;
          }
          else if (c.landparam >= 15 && hrand(800) < Math.min(rebalance_treasure(150 + 2 * G.kills[moBat], 250, c.land), 250) && !cellEdgeUnstable(c) && c.wall !== waOpenGate) {
            c.item = itSlime;
          }
        }
      }
      break;

    case laPalace: { // -------------------------------------------------------------

      if (hat_in()) {
        if (fargen) {
          const hs = new Set<heptagon>();
          for (let i = 0; i < c.type; i++) { const c1 = createMov(c, i); if (c1.master !== c.master) hs.add(c1.master); }
          if (hs.size === 3)
            c.wall = waPalace;
          else if (hs.size === 2 && hrand(100) < 30)
            c.wall = waPalace;
          else if (hs.size === 2 && hrand(100) < 50)
            place_random_gate_continuous(c);
          else {
            const i = hrand(100);
            if (i < 10)
              c.wall = waTrapdoor;
            else if (i < 15)
              c.wall = waClosePlate;
            else if (i < 20)
              c.wall = waOpenPlate;
          }
        }
      }
      else if (nil()) {
        if (fargen) {
          const i = hrand(100);
          if (c.master.zebraval % 4 === 2 || c.master.emeraldval % 4 === 2) {
            if (i < 85)
              c.wall = waPalace;
            else if (i < 95)
              c.wall = waClosedGate;
            else
              c.wall = waOpenGate;
          }
          else {
            if (i < 10)
              c.wall = waTrapdoor;
            else if (i < 15)
              c.wall = waClosePlate;
            else if (i < 20)
              c.wall = waOpenPlate;
          }
        }
      }
      else if (hybrid_in_underlying_geometry(() => hyperbolic_not37() || (euclid() && closed_or_bounded()) || S7() < 5 || arcm_in() || WDIM() === 3)) {
        if (fargen) {
          const i = hrand(100);
          if (i < 10)
            c.wall = waPalace;
          else if (i < 15)
            c.wall = waClosePlate;
          else if (i < 20)
            c.wall = waOpenPlate;
          else if (i < 25)
            c.wall = waTrapdoor;
          else if (i < 30)
            c.wall = waClosedGate;
          else if (i < 35)
            c.wall = waOpenGate;
        }
      }
      else {

        if (d === 9) {
          const c2 = NONSTDVAR() ? c.master.c7 : c;
          if (cdist50(c2) === 3 && polarb50(c2))
            c.wall = waPalace;
        }

        if (d === 8 && (sphere() || in_s2xe())) {
          const gs = getHemisphere(c, 0);
          if (NONSTDVAR()) {
            let v = 1;
            for (let i = 0; i < c.type; i++) {
              const c2 = c.move(i); if (!c2) continue;
              if (getHemisphere(c2, 0) !== gs)
                v = 2;
            }
            if (v === 2)
              c.wall = pick(waClosedGate, waOpenGate, waPalace);
            else if (hrand(100) < 10)
              c.wall = pick(waClosePlate, waOpenPlate, waTrapdoor);
          }
          else
          if (gs === 1)
            c.wall = waPalace;
          if (gs === 3) {
            if (mhybrid()) place_random_gate_continuous(c);
            else
              c.wall = PURE() ? waOpenGate : waClosedGate;
          }
          if (gs === 4 && hrand(100) < 40 && !G.reptilecheat)
            c.wall = waClosePlate;
          if (gs === 6 && !G.reptilecheat)
            c.wall = waOpenPlate;
          if (gs === -3 && !G.reptilecheat)
            c.wall = pick(waClosePlate, waOpenPlate);
          if (gs === -6 && !G.reptilecheat)
            c.wall = waTrapdoor;
          if (mhybrid()) {
            const l = hybrid_get_where(c)[1];
            if (gs >= 3 && (l % 4) === 0) c.wall = waPalace;
            if (gs < 3 && (l % 4) === 2) c.wall = waPalace;
          }
        }

        else if (d === 8 && !sphere()) {

          if (mproduct() && polarb50(c) && (hybrid_get_where(c)[1] & 3) === 2) {
            c.wall = waPalace;
            break;
          }

          // note: Princess Challenge brings back the normal Palace generation
          const lookingForPrincess = !euclid() && !!c.master.alt && !G.princess_challenge && !ls_hv_structure();

          let pgate = false;
          if (PURE() || GOLDBERG()) {
            const i = fiftyval049(c.master.c7);
            if (i >= 8 && i <= 14 && !polarb50(c.master.c7)) pgate = true;
            if (GOLDBERG()) {
              let good = false;
              for (let k = 0; k < c.type; k++) {
                const c2 = c.move(k); if (!c2) continue;
                const i2 = fiftyval049(c2.master.c7);
                if ((i2 < 8) && polarb50(c2.master.c7)) good = true;
              }
              pgate = pgate && good;
            }
          }

          if (pgate) {
            switch (G.princess_generating ? 0 : hrand(2)) {
              case 0:
                c.wall = waClosedGate;
                toggleGates(c, waClosePlate, 1);
                break;
              case 1:
                c.wall = waOpenGate;
                toggleGates(c, waOpenPlate, 1);
                break;
            }
          }
          else if (cdist50(c) === 3 && polarb50(c) && !ishept(c)) {
            if (GOLDBERG()) { }
            else {
              let q = 0, s = 0;
              if (!ishept(c)) for (let i = 0; i < c.type - (mhybrid() ? 2 : 0); i++)
                if (cdist50(c.move(i)) === 3 && polarb50(c.move(i)) && !ishept(c.move(i)))
                  q++, s += i;
              if (q === 1 && c.move(s).land === laPalace) {
                switch (G.princess_generating ? 0 : hrand(2)) {
                  case 0:
                    c.wall = waClosedGate;
                    if (mhybrid()) toggleGates(c, waClosePlate, 1);
                    c.move(s).wall = waClosedGate;
                    break;
                  case 1:
                    c.wall = waOpenGate;
                    if (mhybrid()) toggleGates(c, waOpenPlate, 1);
                    c.move(s).wall = waOpenGate;
                    break;
                }
              }
            }
          }
          else if (c.wall === waPalace) { }
          else if ((hrand(100) < (lookingForPrincess ? (PURE() ? 11 : 7) : 5) && cdist50(c)) ||
            (cdist50(c) === 0 && polarb50(c) && hrand(100) < 60)) {
            c.wall = hrand(100) < (lookingForPrincess ? (PURE() ? 25 : 30) : 50) ? waClosePlate : waOpenPlate;
          }
          else if (hrand(100) < (lookingForPrincess ? 3 : 5))
            c.wall = waTrapdoor;

          if (cdist50(c) === 0 && G.yendor_path) {
            const c2 = c.move(hrand(c.type));
            if (c2.wall === waNone) c2.wall = waTrapdoor;
          }

          if ((c.wall === waClosePlate || c.wall === waTrapdoor) && G.peace_on) c.wall = waNone;
        }

        if (G.princess_generating) {
          // no Opening Plates nearby
          if (d <= 7 && c.wall === waOpenPlate && BITRUNCATED())
            c.wall = waNone;
          if (d <= 7 && c.wall === waClosePlate && PURE())
            c.wall = waOpenPlate;
          // no monsters nearby
          if (d > 0) c.monst = moNone;
          // no Plates or Trapdoors in the Princess cell
          if (d < 3 && (c.wall === waClosePlate || c.wall === waOpenPlate || c.wall === waTrapdoor))
            c.wall = waNone;
          if (d > 1) clear_item(c);
          // the Princess herself
          if (d === 0) {
            c.monst = moPrincess;
            c.hitpoints = palaceHP();
            c.wall = waGiantRug;
            let c2: cell = null!;
            for (let i = 0; i < c.type; i++) {
              let cw = new cellwalker(c, i);
              cw = cw.plusStep().plus(4).plusStep().plus(2).plusStep().plus(4).plusStep().plus(2 + hrand(3)).plusStep();
              if (!c2) c2 = cw.at;
              else if (celldist(cw.at) > celldist(c2)) c2 = cw.at;
              cw.at.monst = moMouse;
            }
            c2.wall = waOpenPlate;
          }
        }
      }

      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        const lookingForPrincess0 = !euclid() && !!c.master.alt && !ls_hv_structure();
        const lookingForPrincess = lookingForPrincess0 && !G.princess_challenge;
        const hardness = lookingForPrincess ? 5 : G.items[itPalace] + yendor_hardness();

        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moPalace] + G.kills[moFatGuard] + G.kills[moVizier] + G.kills[moSkeleton]), 200, c.land) && notDippingFor(itPalace) &&
          c.wall !== waOpenGate && !lookingForPrincess0)
          c.item = itPalace;
        if (G.items[itPalace] >= treasureForLocal() && hrand(5000) < 16 && c.wall !== waOpenGate && !G.inv_on && !G.peace_on)
          c.item = hrand(100) < 80 ? itOrbFrog : itOrbDiscord;
        if (hrand(5000) < 20 * PRIZEMUL && c.wall !== waOpenGate)
          placePrizeOrb(c);
        if (c.wall === waNone && buildPrizeMirror(c, 250)) { }
        else if (c.land === laPalace && (eubinary() || c.master.alt) && celldistAlt(c) <= 150 && (G.havewhat & HF_MOUSE) === 0n && !G.princess_generating &&
          princess_getPrisonInfo(c) &&
          (eubinary() || (princess_getPrisonInfo(c)!.bestdist < 6 && princess_getPrisonInfo(c)!.princess))) {
          c.monst = moMouse;
          if (!G.princess_squeaked) {
            addMessage(XLAT('You hear a distant squeak!'));
            playSound(c, 'mousesqueak');
            drawBigFlash(c);
            G.princess_squeaked = true;
          }
          G.havewhat |= HF_MOUSE;
        }
        else if (hrand_monster_in(c.land, 15000) < 10 + hardness) {
          c.monst = moPalace;
          c.hitpoints = palaceHP();
          if (hrand(10 + G.items[itPalace] + yendor_hardness()) >= 14 && !lookingForPrincess)
            c.monst = moSkeleton;
        }
        else if (hrand_monster_in(c.land, 20000) < hardness) {
          c.monst = moFatGuard;
          c.hitpoints = palaceHP();
        }
        else if (hrand_monster_in(c.land, 20000) < hardness - 7) {
          c.monst = moVizier;
          c.hitpoints = palaceHP();
        }
        else if (G.princess_forceVizier && hrand(100) < 10 && canReachPlayer(c, moVizier)) {
          c.monst = moVizier;
          c.hitpoints = palaceHP();
          G.princess_forceVizier = false;
        }
      }
      break;
    }

    case laEmerald: { // -------------------------------------------------------------

      if (d === 8) {
        if (G.randomPatternsMode)
          c.wall = randpatternMajority(c, 0, RANDITER) ? waCavewall : waCavefloor;
        else if (euclid() && closed_or_bounded()) {
          c.wall = waCavefloor;
        }
        else if (nil()) {
          const a = c.master.zebraval % 7;
          const b = c.master.emeraldval % 7;
          c.wall = (a - 3.5) * (a - 3.5) + (b - 3.5) * (b - 3.5) <= 12 ? waCavewall : waCavefloor;
        }
        else if (sol())
          c.wall = (c.master.zebraval % 7 >= 5 || c.master.emeraldval % 7 >= 5) ? waCavewall : waCavefloor;
        else if (WDIM() === 3 && hyperbolic() && !bt_in())
          c.wall = (c.master.zebraval & 1) ? waCavewall : waCavefloor;
        // MAXMDIM >= 4
        else if (euc_in(3))
          c.wall = euc_get_emerald(c) ? waCavewall : waCavefloor;
        else if (euclid()) {
          const co = euc2_coordinates(c);
          const y = co[1];
          if (((y - 2) & 7) < 4) c.wall = waCavewall;
          else c.wall = waCavefloor;
        }
        else if (sphere()) {
          if (getHemisphere(c, 0) < 0)
            c.wall = waCavewall;
          else c.wall = waCavefloor;
        }
        else if (a4() || arcm_in() || cryst() || bt_in() || S3() >= OINF)
          c.wall = hrand(100) < 50 ? waCavefloor : waCavewall;
        else if (!BITRUNCATED() && G.geometry !== gOctagon) {
          if (polarb50(c))
            c.wall = waCavewall;
          else c.wall = waCavefloor;
        }
        else {
          const v = emeraldval(c);
          if (v === 0)
            c.wall = waStone;
          else if ((v & 3) >= 2)
            c.wall = waCavewall;
          else c.wall = waCavefloor;
        }
      }

      if (d === 7 && c.wall === waCavewall && hrand_monster_in(c.land, GDIM() === 2 ? 5000 : 40000) < G.items[itEmerald] + yendor_hardness() && !G.safety && !G.reptilecheat)
        c.monst = moSeep;

      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(PURE() ? 400 : 1000) < rebalance_treasure(100 + 2 * (G.kills[moMiner] + G.kills[moLancer] + G.kills[moFlailer]), 200, c.land) && notDippingFor(itEmerald)) {
          // do not destroy walls!
          let ok = true;
          for (let i = 0; i < c.type; i++) if (c.move(i).wall === waCavewall) ok = false;
          if (ok) c.item = itEmerald;
        }
        if (hrand_monster_in(c.land, 8000) < 50 + 10 * (G.items[itEmerald] + yendor_hardness()))
          c.monst = emerald_monster();
        if (sphere() && c.type !== 6 && c.master.fiftyval === 5) {
          c.monst = moMiner;
          c.stuntime = 7;
        }
      }
      break;
    }

    case laDryForest:
      if (fargen) {
        if (G.randomPatternsMode)
          c.wall = randpattern(c, G.randompattern[c.land]) ? waNone : randpattern(c, G.randompattern[laHell]) ? waBigTree : waSmallTree;
        else
          c.wall =
            (hrand(100) < 50) ? (hrand(100) < 50 ? waBigTree : waSmallTree) : waNone;
      }
      if (d === 8) c.landparam = 0;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moFireFairy] * 2 + G.kills[moHedge]), 160, c.land) && notDippingFor(itFernFlower))
          c.item = itFernFlower;
        if (hrand_monster_in(c.land, 4000) < 40 + G.items[itFernFlower] + yendor_hardness())
          c.monst = moHedge;
        else if (hrand_monster_in(c.land, 8000) < 2 * G.items[itFernFlower] + yendor_hardness() && !G.peace_on)
          c.monst = moFireFairy;
      }
      break;

    case laPower: {
      if (d === 8) {
        let v: number;
        if (G.randomPatternsMode)
          v = randpattern(c, G.randompattern[c.land]) ? 24 : 1;
        else if (sphere()) {
          const gs = getHemisphere(c, 0);
          if (GOLDBERG()) {
            v = 6;
            if (gs === 0) v = 24;
            for (let i = 0; i < c.type; i++) {
              const c2 = c.move(i); if (!c2) continue;
              if (getHemisphere(c2, 0) * gs < 0)
                v = 24;
            }
          }
          else if (gs === -3 || gs === -1 || gs === 1 || gs === 3)
            v = 24;
          else
            v = 6;
        }
        // CAP_ARCM
        else if (arcm_in() && arcm_current_have_line())
          v = arcm_linespattern(c) ? 24 : 16;
        else if (arb_in() && arb_current_have_line())
          v = arb_linespattern(c) ? 24 : 16;
        else if ((euclid() && closed_or_bounded()) || hyperbolic_not37() || quotient() || arcm_in()) {
          v = hrand(100) < 25 ? 24 : 16;
        }
        else if (euclid()) {
          const co = euc2_coordinates(c);
          const y = co[1];
          const y0 = gmod(y, 6);
          if (y0 === 3 || y0 === 4) v = 24; else v = 0;
        }
        else v = emeraldval(c);
        if (v === 0 && !euclid()) c.wall = waStone;
        else {
          v &= ~3;
          c.landparam = (v === 24 || v === 32 || v === 56) ? 1 : 0;
          if (c.landparam)
            c.wall = waEternalFire;
          else if (hrand(100) < 10) {
            c.wall = waGlass;
            const protectedItems = [
              itPower, itPower, itPower, itPower, itPower, itPower,
              itOrbLightning, itOrbLightning, itOrbThorns, itOrbThorns,
              itOrbInvis, itOrbInvis,
              itOrbShield, itOrbTeleport, itOrbPsi,
              itOrbDragon, itOrbIllusion, itOrbTime,
            ];
            c.item = protectedItems[hrand(18)];
          }
        }
      }
      // seal entrances to the Land of Power.
      if (d === 7 && ctof(c) && G.land_structure !== lsLandscape) {
        let onwall = false;
        for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).land === laBarrier)
          onwall = true;
        if (!onwall) for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i);
          if (!c2) continue;
          const c3 = c2.modmove(c.c.spin(i) + 3);
          if (!c3) continue;
          if (c3.land !== laPower && c3.land !== laBarrier)
          if (c2.wall !== waEternalFire && c2.wall !== waGlass) {
            if (isFire(c)) c.monst = moWitchWinter;
            else if (c.wall === waGlass) c.monst = moWitchGhost;
            else c.monst = moEvilGolem;
          }
        }
      }
      if (d === 7 && G.land_structure === lsLandscape) {
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i); if (!c2) continue;
          if (c2.land !== laPower) c.wall = waEternalFire;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000 + 50 * G.items[itPower]) < 1200) {
          const powerorbs = [
            itOrbFlash, itOrbSpeed, itOrbFire, itOrbWinter, itOrbAether, itOrbLife];
          c.item = powerorbs[hrand(6)];
        }
        else if (hrand(5000) < 10 && mirror_build(c)) { }
        else if (hrand_monster_in(c.land, 1000) < 10 + (G.items[itPower] ? 10 : 0) + (G.items[itPower] + yendor_hardness()))
          c.monst = (moWitch + hrand(NUMWITCH)) as eMonster;
      }
      break;
    }

    case laZebra:
      if (d === 8)
        c.wall = (G.randomPatternsMode ? randpattern(c, G.randompattern[c.land]) : is_zebra_trapdoor(c)) ? waTrapdoor : waNone;

      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (c.wall === waNone && hrand(2500) < rebalance_treasure(100 + 2 * (G.kills[moOrangeDog]), 300, c.land) && notDippingFor(itZebra))
          c.item = itZebra;
        if (hrand_monster_in(c.land, 10000) < 40 + 2 * (G.items[itZebra] + yendor_hardness()))
          c.monst = moOrangeDog;
      }
      break;

    case laWineyard: {
      if (d === 8) {
        if (G.randomPatternsMode)
          c.wall = randpattern(c, G.randompattern[c.land]) ? waVinePlant : waNone;
        else if (euclid() && closed_or_bounded()) { }
        // CAP_ARCM
        else if (arcm_in() && arcm_current_have_line())
          c.wall = arcm_linespattern(c) ? waVinePlant : waNone;
        else if (arb_in() && arb_current_have_line())
          c.wall = arb_linespattern(c) ? waVinePlant : waNone;
        else if (nil()) {
          if ((c.master.emeraldval & 1) === 1)
            c.wall = waVinePlant;
        }
        else if (sol()) {
          if ((c.master.distance & 1) === 1 && (c.master.emeraldval % 3))
            c.wall = waVinePlant;
        }
        else if (euclid() && !arcm_in()) {
          const co = euc2_coordinates(c);
          const y = co[1];
          const dy = gmod(y, 3);
          if (dy === 1) c.wall = waVinePlant;
        }
        else if (WDIM() === 3 && hyperbolic() && !bt_in())
          c.wall = (c.master.zebraval & 2) ? waVinePlant : waNone;
        else if (a4() || sphere() || arcm_in() || bt_in() || arb_in() || S3() >= OINF)
          c.wall = hrand(100) < 50 ? waNone : waVinePlant;
        else {
          const v = emeraldval(c);
          if (v === 0) c.wall = waStone;
          else {
            const w = idiv(v, 4);
            if (w === 9 || w === 10 || w === 7 || w === 8) {
              c.wall = waVinePlant;
            }
            else if (v === 24 || v === 58 || v === 26 || v === 56)
              c.wall = waVineHalfA;
            else if (v === 25 || v === 59 || v === 27 || v === 57)
              c.wall = waVineHalfB;
            else c.wall = waNone;
            if (mhybrid() && cellHalfvine(c)) c.wall = waNone;
            if (NONSTDVAR() && cellHalfvine(c)) {
              c.wall = waNone;
              for (let i = 0; i < c.type; i++) {
                const c2 = createMov(c, i);
                if (emeraldval(c2) === (v ^ 1))
                  c.wall = waVinePlant;
              }
            }
            if (weirdhyperbolic() && cellHalfvine(c)) c.wall = waNone;
          }
        }
      }
      if (d === 7 && c.wall === waVinePlant && hrand(GDIM() === 2 ? 100 : 5000) < (G.randomPatternsMode ? 2 : 10) && !G.peace_on && !G.reptilecheat)
        c.monst = moVineSpirit;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moVineBeast] + G.kills[moVineSpirit]), 200, c.land) && notDippingFor(itWine) && !G.reptilecheat)
          c.item = itWine;
        if (hrand_monster_in(c.land, 8000) < 12 * (G.items[itWine] + yendor_hardness()) && !G.reptilecheat && !G.safety)
          c.monst = moVineBeast;
      }
      break;
    }

    case laReptile: {
      if (fargen) {
        if (G.randomPatternsMode) {
          const ch = hrand(200);
          if (randpattern(c, G.randompattern[c.land])) c.wall = waChasm;
          else c.wall = ch < (50 + G.items[itDodeca] + yendor_hardness()) ? waReptile : waNone;
          c.wparam = 1 + hrand(reptilemax());
          if (c.wall === waNone && hrand(5000) < 25)
            c.item = itDodeca;
        }
        else {
          const i = arcm_in() ? hrand(50) : zebra40(c);
          if (i < 40) {
            let cd = geometry_supports_cdata() ? getCdata(c, 3) : hrand(16);
            cd &= 15;
            if (cd >= 4 && cd < 12) c.wall = waChasm;
            else {
              const ch = hrand(200);
              c.wall = ch < (50 + G.items[itDodeca] + yendor_hardness()) ? waReptile :
                waNone;
            }
            c.wparam = 1 + hrand(reptilemax());
          }
          if (G.reptilecheat) {
            c.wall = waReptile; c.wparam = 100;
          }
        }
      }
      if (d === 7 && c.wall !== waChasm) {
        let nonchasm = false;
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i); if (!c2) continue;
          if (c2.wall !== waChasm) nonchasm = true;
        }
        if (!nonchasm) c.item = itDodeca;
      }
      break;
    }

    case laBurial: {
      if (fargen) {
        if (hrand(5000) < 25 && celldist(c) >= 5 && !G.safety) {
          let goodland = true;
          const c2 = createMov(c, hrand(c.type));
          if (!ls_any_chaos() && !ls_hv_structure()) for (const cx of [c, c2])
            for (let i = 0; i < cx.type; i++) {
              const c3 = createMov(cx, i);
              if (c3.land !== laNone && c3.land !== laBurial)
                goodland = false;
              if (c3.bardir !== NODIR && c3.bardir !== NOBARRIERS)
                goodland = false;
            }
          if (goodland) {
            c.item = itBarrow;
            c.landparam = 2 + hrand(2);
            c.wall = waBarrowDig;
            for (let i = 0; i < c.type; i++) {
              const c3 = createMov(c, i);
              c3.wall = waBarrowWall, c3.item = itNone,
              c3.bardir = NOBARRIERS;
            }
            c2.wall = waBarrowDig;
            for (let i = 0; i < c2.type; i++) {
              const c3 = createMov(c2, i);
              if (c3 === c || isNeighbor(c3, c)) continue;
              c3.bardir = NOBARRIERS;
              let adj = false;
              for (let k = 0; k < c.type; k++) {
                const c4 = c.move(k); if (!c4) continue;
                if (c4 !== c2 && isNeighborCM(c3, c4)) adj = true;
              }
              if (adj)
                c3.wall = waBarrowDig;
              else
                c3.wall = waBarrowWall, c3.item = itNone;
            }
          }
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) if (!G.peace_on) {
        if (hrand_monster_in(c.land, 15000) < 5 + 3 * G.items[itBarrow] + 4 * yendor_hardness())
          c.monst = moDraugr;
        else if (hrand(5000) < 20 + (quickfind(laBurial) ? 40 : 0))
          c.item = itOrbSword;
      }
      break;
    }

    case laTrollheim: {
      if (fargen) {
        const freq =
          G.land_structure === lsVineWalls ? 10000 :
          ls_wall_chaos() ? 2500 :
          ls_tame_chaos() ? 1000 :
          ls_any_chaos() ? 50 :
          5;
        if (hrand(50000) < freq && c.wall !== waBarrier && celldist(c) >= 7 && !G.safety && !G.peace_on) {
          let okay = true;
          for (let i2 = 0; i2 < c.type; i2++) { const c2 = createMov(c, i2);
            for (let i3 = 0; i3 < c2.type; i3++) { const c3 = createMov(c2, i3);
              for (let i4 = 0; i4 < c3.type; i4++) { const c4 = createMov(c3, i4);
                for (let i5 = 0; i5 < c4.type; i5++) { const c5 = createMov(c4, i5);
                  const cx = ls_any_chaos() ? c3 : c5;
                  if (cx.land !== laTrollheim && cx.land !== laNone && !ls_hv_structure())
                    okay = false;
                  if (cx.bardir !== NODIR) okay = false;
                } } } }
          if (okay) {
            for (let i2 = 0; i2 < c.type; i2++) { const c2 = createMov(c, i2);
              for (let i3 = 0; i3 < c2.type; i3++) { const c3 = createMov(c2, i3);
                for (let i4 = 0; i4 < c3.type; i4++) { const c4 = createMov(c3, i4);
                  for (let i5 = 0; i5 < c4.type; i5++) { const c5 = createMov(c4, i5);
                    const cx = ls_any_chaos() ? c3 : c5;
                    cx.bardir = NOBARRIERS;
                    setland(cx, laTrollheim);
                  } } } }
            c.item = itTrollEgg;
            for (let i2 = 0; i2 < c.type; i2++) { const c2 = createMov(c, i2);
              for (let i3 = 0; i3 < c2.type; i3++) { const c3 = createMov(c2, i3);
                c3.monst = pickTroll(c);
                c3.stuntime = 0;
                c2.item = itTrollEgg;
              } }
          }
        }
      }
      if (d === 7 && !c.monst && !c.item && celldist(c) >= 3) {
        let cd = getCdata(c, 3);
        cd %= 16;
        if (cd < 0) cd += 16;
        if (cd >= 4 && cd < 10 && hrand(100) < 40)
          dieTroll(c, pickTroll(c));
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand_monster_in(c.land, 8000) < G.items[itTrollEgg] + hardness_empty())
          c.monst = pickTroll(c);
      }
      break;
    }

    case laIce:
      if (d === 9) {
        if (G.randomPatternsMode) c.wall = randpattern(c, G.randompattern[c.land]) ? waIcewall : waNone;
        else if (hrand(100) < 5 && c.wall !== waBarrier && (WDIM() === 3 || !G.reptilecheat)) {
          c.wall = waIcewall;
          for (let i = 0; i < c.type; i++) if (hrand(100) < 50) {
            const c2 = createMov(c, i);
            setdist(c2, d + 1, c);
            if (c2.wall === waBarrier || c2.land !== laIce) continue;
            c2.wall = waIcewall;
            for (let j = 0; j < c2.type; j++) if (hrand(100) < 20) {
              const c3 = createMov(c2, j);
              setdist(c.move(i), d + 2, c);
              if (c3.wall === waBarrier || c3.land !== laIce) continue;
              c3.wall = waIcewall;
            }
          }
        }
        if (c.wall === waIcewall && G.items[itDiamond] >= 5 && hrand(G.items[itOrbLuck] ? 50 : 200) === 1)
          c.wall = waBonfireOff;
      }
      if (d === 8 && BARLEV() === 8) {
        if (hrand(100) < 10 && c.wall !== waBarrier) {
          c.wall = waIcewall;
          for (let i = 0; i < c.type; i++) if (hrand(100) < 50) {
            const c2 = createMov(c, i);
            if (c2.wall === waBarrier || c2.land !== laIce) continue;
            c2.wall = waIcewall;
          }
        }
      }
      if (d === 8) c.landparam = 0;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moYeti] + G.kills[moWolf]), 200, c.land) && notDippingFor(itDiamond))
          c.item = itDiamond;
        if (hrand_monster_in(c.land, 8000) < 2 * (G.items[itDiamond] + yendor_hardness()))
          c.monst = hrand(2) ? moYeti : moWolf;
      }
      break;

    case laSwitch:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moSwitch1] + G.kills[moSwitch2]), 200, c.land) && notDippingFor(itSwitch))
          c.item = itSwitch;
        if (hrand_monster_in(c.land, 8000) < 40 + 5 * (G.items[itSwitch] + yendor_hardness()))
          c.monst = hrand(2) ? moSwitch1 : moSwitch2;
      }
      break;

    case laDragon: {
      if (fargen) {
        if (G.randomPatternsMode) {
          if (randpattern(c, G.randompattern[c.land])) c.wall = waChasm;
        }
        else {
          let cd = getCdata(c, 3);
          cd &= 31;
          if (cd >= 6 && cd < 12) c.wall = waChasm;
          else if (hrand(1000) === 0) c.wall = waEternalFire;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        // 40 is the usual rate of dragon generation
        let dchance = 40;
        // but it grows to 400 if no Dragons in sight, to make it faster
        if (G.cwt.at.land === laDragon && (G.havewhat & HF_DRAGON) === 0n)
          dchance = 400;
        // also, don't generate additional Dragons for newbies
        else if ((G.havewhat & HF_DRAGON) !== 0n && G.items[itDragon] < 10)
          dchance = 5;

        if (hrand_monster_in(c.land, 150000) < dchance && !c.monst && (!c.wall || c.wall === waChasm) && !G.peace_on) {
          G.havewhat |= HF_DRAGON;
          // printf("dragon generated with dchance = %d\n", dchance);
          const possi: number[] = [];
          for (let t = 0; t < c.type; t++) if (c.move(t).mpdist > c.mpdist) possi.push(t);
          if (possi.length) {
            let i = possi[hrand(possi.length)];
            const dragonlength = 6 + idiv(G.items[itDragon], 2);
            c.monst = moDragonHead; c.hitpoints = 1;
            preventbarriers(c);
            let c2 = c;
            let len = dragonlength;
            const dragon: cell[] = [];
            while (--len) {
              dragon.push(c2);
              preventbarriers(c2);
              c2.mondir = i;
              createMov(c2, i);
              const j = c2.c.spin(i);
              const c3 = c2.move(i);
              setdist(c3, 9, c2);
              if (c3.monst || (ls_hv_structure() ? c3.land !== laDragon : c3.bardir !== NODIR) || c3.wall || c3.mpdist <= 7) break;
              c2 = c3;
              c2.monst = moDragonTail;
              c2.hitpoints = 1;
              i = j + (c2.type <= 3 ? 1 : 2 + hrand(c2.type - 3));
              i %= c2.type;
            }
            if (dragon.length < 5 || dragon.length < idiv(dragonlength, 2)) {
              for (let i = 0; i < dragon.length; i++)
                dragon[i].monst = moNone;
            }
            else c2.mondir = NODIR;
          }
        }
        if (!c.monst && !ls_single() && !G.racing_on && !G.yendor_on && !G.randomPatternsMode && !G.peace_on && !euclid() && hrand(4000) < 10 && !G.safety)
          gen_baby_tortoise(c);
      }
      break;
    }

    case laCaves:
      if (fargen)
        c.wall = (G.randomPatternsMode ? randpatternMajority(c, 1, RANDITER) : hrand(100) < 55) ? waCavewall : waCavefloor;
      if (d === 7 && c.wall === waCavewall && hrand(GDIM() === 2 ? 5000 : 40000) < G.items[itGold] + yendor_hardness() && !G.safety && !G.reptilecheat)
        c.monst = moSeep;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000) < rebalance_treasure(100 + 2 * Math.min(G.kills[moTroll] + G.kills[moGoblin], 150), 200, c.land) && notDippingFor(itGold))
          c.item = itGold;
        if (hrand_monster_in(c.land, 8000) < 10 + 2 * (G.items[itGold] + yendor_hardness()))
          c.monst = hrand(2) ? moTroll : moGoblin;
      }
      break;

    case laCA:
      if (fargen) {
        c.wall = (hrand(1000000) < G.ca_prob * 1000000) ? G.ca_wlive : waNone;
        if (c.wall === G.ca_wlive)
          ca_list_adj(c);
      }
      break;

    case laLivefjord: {
      if (fargen) {
        const die = (G.randomPatternsMode ? (randpatternMajority(c, 2, RANDITER) ? 100 : 0) : hrand(100));
        if (die < 50)
          c.wall = waSea;
        else
          c.wall = waNone;
      }

      if (d === 7) {
        if (c.wall === waSea && hrand_monster_in(c.land, 5000) < 15 + G.items[itFjord] + yendor_hardness() && !G.safety) {
          if (G.items[itFjord] >= 5 && hrand(100) < 20 && !G.peace_on)
            c.monst = moWaterElemental;
          else {
            c.monst = moViking;
            c.wall = waBoat;
          }
        }

        else if (G.yendor_path && c.wall === waSea && hrand_monster_in(c.land, 5000) < 20) {
          c.monst = moViking;
          c.wall = waBoat;
        }

        if (hrand(2000) < rebalance_treasure(50 + G.kills[moViking], 100, c.land) && notDippingFor(itFjord) && !G.safety) {
          c.item = itFjord;
        }

        placeLocalSpecial(c, 1000);

        buildPrizeMirror(c, 1000);
      }

      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand_monster_in(c.land, 16000) < 10 + 2 * (G.items[itFjord] + yendor_hardness()) + (G.yendor_path ? 90 : 0))
          c.monst = moFjordTroll;
      }
      break;
    }

    case laDeadCaves: {
      if (fargen) {
        const die = (G.randomPatternsMode ? (randpattern(c, G.randompattern[c.land]) ? 100 : 0) : hrand(100));
        if (die < (G.items[itOrbLuck] ? 48 : 50)) c.wall = waDeadwall;
        else if (die < 55) c.wall = waDeadfloor2;
        else c.wall = waDeadfloor;
      }

      if (d === 7 && c.wall === waDeadwall && hrand_monster_in(c.land, GDIM() === 2 ? 1000 : 10000) < G.items[itSilver] + yendor_hardness() && !G.safety && !G.reptilecheat)
        c.monst = moSeep;

      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moDarkTroll] + G.kills[moEarthElemental]), 200, c.land) && notDippingFor(itSilver))
          c.item = itSilver;
        if (hrand_monster_in(c.land, 16000) < (G.items[itSilver] + yendor_hardness())) {
          c.monst = moEarthElemental;
          for (let i = 0; i < c.type; i++) {
            const c2 = c.move(i);
            earthFloor(c2);
          }
          for (let i = 0; i < c.type; i++) if (c.move(i).mpdist < c.mpdist) c.mondir = i;
          chasmifyEarth(c); c.wall = waDeadfloor2;
        }
        else if (hrand_monster_in(c.land, 8000) < 60 + 8 * (G.items[itSilver] + yendor_hardness())) {
          if (hrand(100) < 25) {
          }
          else c.monst = hrand(2) ? moDarkTroll : moGoblin;
        }
      }
      break;
    }

    case laAlchemist:
      if (fargen)
        c.wall = (G.randomPatternsMode ? randpattern(c, G.randompattern[c.land]) : hrand(2)) ? waFloorA : waFloorB;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand(5000) < rebalance_treasure(25 + Math.min(G.kills[moSlime], 200), 100, c.land) && notDippingFor(itElixir))
          c.item = itElixir;
        else if (hrand_monster_in(c.land, 3500) < 10 + G.items[itElixir] + yendor_hardness())
          c.monst = moSlime;
      }
      break;

    case laVolcano:
      // CAP_FIELD
      if (fargen) {
        c.wall = waNone;
        if (hrand_monster_in(c.land, 20000) < (G.items[itLavaLily] + yendor_hardness()))
          c.monst = moSalamander,
          c.hitpoints = 3;
        if (hrand(8000) < rebalance_treasure(100 + 2 * G.kills[moLavaWolf], 200, c.land) && notDippingFor(itLavaLily))
          c.item = itLavaLily;
        else placeLocalSpecial(c, 1000, 2, 10);
        // prize orbs get a bonus, because most of them are not allowed anyway
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand_monster_in(c.land, 8000) < (G.items[itLavaLily] + yendor_hardness()))
          c.monst = moLavaWolf;
      }
      break;

    case laBlizzard: {
      // CAP_FIELD
      if (fargen) {
        let windless = true;
        const w = windmap_at(c);
        for (let i = 0; i < c.type; i++) {
          const c2 = createMov(c, i);
          const w2 = windmap_at(c2);
          if (((w2 - w) & 255) >= windmap_NOWINDBELOW)
          if (((w - w2) & 255) >= windmap_NOWINDBELOW)
            windless = false;
        }
        if (windless) {
          c.wall = waIcewall;
          if (G.safety) return;
          else if (hrand(500) < rebalance_treasure(100 + 2 * G.kills[moVoidBeast] + 2 * G.kills[moIceGolem], 200, c.land) && notDippingFor(itBlizzard))
            c.item = itBlizzard;
          else placeLocalSpecial(c, 100);
        }
      }
      if (d === 8) c.landparam = 0;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand_monster_in(c.land, 8000) < 10 + (G.items[itBlizzard] + yendor_hardness()))
          c.monst = pick(moVoidBeast, moIceGolem);
      }
      if ((d === 7 || d === 6) && blizzard_no_escape(c))
        c.item = itOrbSafety, c.monst = moNone;
      break;
    }

    case laTerracotta: {
      // CAP_COMPLEX2
      if (fargen) {
        if (hrand(500) < 15)
          createArrowTrapAt(c, laTerracotta);
        if (pseudohept_r(c) && hrand(100) < 40 && c.wall === waNone && !G.racing_on) {
          c.wall = waTerraWarrior;
          c.wparam = terracotta_randterra ? 0 : 3 + hrand(3);
          if (hrand(100) < G.items[itTerra] - 10)
            c.wparam--;
          if (hrand(100) < G.items[itTerra] - 10)
            c.wparam--;
        }
      }
      if (d === 7) {
        let nearriver = 0;
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i); if (!c2) continue;
          if (c2.wall === waMercury && pseudohept(c2))
            nearriver++;
        }
        if (nearriver === 2) c.land = laMercuryRiver;
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        let nearwarrior = false;
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i); if (!c2) continue;
          if (c2.wall === waTerraWarrior) nearwarrior = true;
        }
        if (nearwarrior && hrand(5000) < rebalance_treasure(130 + 2 * G.kills[moJiangshi], 260, c.land) && notDippingFor(itTerra))
          c.item = itTerra;
        let t = 2 * (G.items[itTerra] + yendor_hardness());
        if (t < 60) t += idiv((60 - t) * (60 - t), 120);
        if (hrand_monster_in(c.land, 20000) < t)
          c.monst = moJiangshi;
      }
      break;
    }

    case laOvergrown: {
      if (fargen) {
        // 0: 60%
        // 10: 50%
        if (G.randomPatternsMode)
          c.wall = randpattern(c, G.randompattern[c.land]) ? waNone : randpattern(c, G.randompattern[laWineyard]) ? waBigTree : waSmallTree;
        else
          c.wall =
            (hrand(50 + idiv(G.items[itMutant], 2) + yendor_hardness() - (G.items[itOrbLuck] ? 10 : 0)) < 30) ? (hrand(100) < 50 ? waBigTree : waSmallTree) : waNone;
      }
      if (d === 8) {
        let ok = c.landparam === 0;
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i); if (!c2) continue;
          if (c2.landparam) ok = false;
        }
        if (ok && hrand(G.doCross ? 450 : 15000) < (20 + (2 * G.items[itMutant] + yendor_hardness())) * ls_ls_mul_big() && !G.safety) {
          if (!G.peace_on) c.item = itMutant;
          c.landparam = G.items[itMutant] + 5 + hrand(11);
          c.wall = waNone;
          for (let i = 0; i < c.type; i++)
            if (c.move(i) && (c.move(i).wall === waBigTree || c.move(i).wall === waSmallTree))
              c.move(i).wall = waNone;
        }
        else if (hrand_monster_in(c.land, 15000) < 20 + (2 * G.items[itMutant] + yendor_hardness()) && ok && !G.safety) {
          // for the Yendor Challenge, use only Mutants
          if (!(G.yendor_on && yendor_clev().l === laMirror)) {
            c.monst = moForestTroll;
            c.wall = waNone;
          }
        }
      }
      if (d === 7 && c.item === itMutant) {
        if (c.monst !== moMutant && isMultitile(c.monst))
          c.item = itNone;
        else {
          c.stuntime = G.mutantphase;
          c.monst = moMutant;
          c.mondir = NODIR;
        }
      }
      break;
    }

    case laHalloween:
      if (!closed_or_bounded()) {
        if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
          if (hrand(1000) < rebalance_treasure(20, 20, c.land)) c.item = itTreat;
          if (hrand(1000) < 20) c.wall = waChasm;
        }
      }
      break;

    case laWildWest:
      if (fargen) {
        if (G.randomPatternsMode)
          c.wall = randpattern(c, G.randompattern[c.land]) ? waNone : waSaloon;
        else if (hyperbolic_37() ? cdist50(c) <= 2 : hrand(100) < 20) c.wall = waSaloon;
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand_monster_in(c.land, 25000) < 2 + (2 * G.items[itBounty] + yendor_hardness()) + (G.items[itRevolver] ? 150 : 0))
          c.monst = moOutlaw;
        if (hrand(1000) < rebalance_treasure(20 + G.kills[moOutlaw], 40, c.land))
          c.item = itRevolver;
      }
      break;

    case laWestWall:
      // CAP_COMPLEX2
      if (fargen)
        westwall_switchTreasure(c);
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand_monster_in(c.land, 6000) < 5 + G.items[itWest] + yendor_hardness())
          c.monst = hrand(100) < 20 ? moWestHawk : moFallingDog;
      }
      break;

    case laWhirlwind:
      if (fargen) {
        if (S7() === 5)
          c.wall = (pseudohept(c) && (c.master.fiftyval === 0 || c.master.fiftyval === 6)) ?
            waFan : waNone;
        else if (sphere()) {
          if (whirlwind_fzebra3(c) === 0) c.wall = waFan;
          if (S7() === 4 && celldistance(c, (G.currentmap as hrmap).gamestart()) === 2 && ctof(c))
            c.wall = waChasm;
        }
        else if (arcm_in()) { }
        else if (!euclid() && zebra3(c) === 0) c.wall = waFan;
        else if (pseudohept(c) && hrand(2000) < 150 && !G.reptilecheat)
          c.wall = waChasm;
        else if (c.type === 6 && buildPrizeMirror(c, 1000))
          { }
        else if (!G.reptilecheat)
          whirlwind_switchTreasure(c);
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) {
        if (hrand_monster_in(c.land, 4500) < G.items[itWindstone] + yendor_hardness())
          c.monst = moWindCrow;
        if (hrand_monster_in(c.land, G.doCross ? 3000 : 30000) < G.items[itWindstone] + yendor_hardness() - 5)
          c.monst = moAirElemental;
      }
      break;
    case laStorms: {
      const randstorm = (!mhybrid() && !gproduct()) ? (hyperbolic_not37() || NONSTDVAR() || (quotient() && G.geometry !== gZebraQuotient && !euc_in(2)))
        : hybrid_in_underlying_geometry(() => hyperbolic_not37() || NONSTDVAR() || (quotient() && G.geometry !== gZebraQuotient && !euc_in(2))); // PIU(...)
      if (fargen) {

        if (hat_in()) {
          const id = hat_get_hat_id(c);
          if (id === 0) c.wall = pick(waCharged, waGrounded);
          if (id === 1 && hrand(100) < 50) c.wall = waSandstone;
        }
        if (euc_in(2) && smallbounded()) {
          const s = euc_sdxy();
          const st: loc = [idiv(s[0], 3), idiv(s[1], 3)];
          if (c === euc_at(st)) c.wall = waCharged;
          if (c === euc_at([s[0] - st[0], s[1] - st[1]])) c.wall = waGrounded;
        }
        else if (euc_in(2)) {
          const co = euc2_coordinates(c);
          const x = co[0], y = co[1];
          if ((x + 1) % 3 === 0 && y % 3 === 0) {
            if (hrand(100) < 50)
              c.wall = hrand(2) ? waCharged : waGrounded;
          }
          else if (ishept(c)) {
            let sand = false;
            for (let i = 0; i < c.type; i++) {
              createMov(c, i);
              const co = euc2_coordinates(c.move(i));
              const x = co[0], y = co[1];
              if ((x + 1) % 3 === 0 && (y) % 3 === 0) sand = true;
            }
            if (sand && hrand(100) < 20)
              c.wall = waSandstone;
          }
        }
        else if (sphere()) {
          if (S7() === 5) {
            if (ctof(c)) {
              const id = c.master.fiftyval;
              if (id === 1) c.wall = waCharged;
              if (id === (elliptic() && BITRUNCATED() ? 3 : 9)) c.wall = waGrounded;
            }
          }
          else if (S7() === 4) {
            if (ctof(c)) {
              const id = c.master.fiftyval;
              if (id === 1) c.wall = waCharged;
              if (id === 3) c.wall = waGrounded;
            }
          }
          else if (S7() === 3) {
            if (ctof(c)) {
              const id = c.master.fiftyval;
              if (id === 1) c.wall = waCharged;
            }
            else {
              c.wall = waGrounded;
              for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (ctof(c2) && c2.master.fiftyval === 1)
                c.wall = waNone; }
            }
          }
        }
        else if (randstorm) { /* nothing */ }
        else if (PURE()) {
          const i = zebra40(c);
          if ((i === 5 || i === 8) && hrand(100) < 20) c.wall = hrand(2) ? waCharged : waGrounded;
          else if (i === 15) c.wall = waSandstone;
        }
        else if (S3() > 3) {
          const z = zebra40(c);
          let i = z;
          let b = 0;
          while (i) { if (i & 1) b++; i >>= 1; }
          if (ctof(c) && (b & 1) && hrand(100) < 20) c.wall = (z & 2) ? waCharged : waGrounded;
        }
        else if (mhybrid()) {
          const c1 = hybrid_get_where(c)[0];
          if (among(c1.wall, waCharged, waGrounded))
            c.wall = c1.wall;
          else if (hrand(100) < 15)
            c.wall = waSandstone;
        }
        else {
          const i = zebra40(c);
          if (c.wall) { /* nothing */ }
          else if (i >= 40 && hrand(100) < 50)
            c.wall = hrand(2) ? waCharged : waGrounded;
          else if (ishept(c) && hrand(100) < 20)
            c.wall = waSandstone;
        }

        if (ls_horodisk_structure()) {
          if (celldistAlt(c) >= G.horodisk_from) c.wall = waNone;
        }
        else if (!ls_voronoi_structure()) {
          for (let i = 0; i < c.type; i++)
            if (c.move(i) && c.move(i).land !== laStorms && c.move(i).land !== laNone)
              c.wall = waNone;
        }
      }
      if (d === BARLEV() && randstorm) {
        c.landparam = hrand(1000000);
      }
      if (d === 7 && ls_voronoi_structure()) {
        for (let i = 0; i < c.type; i++)
          if (c.move(i) && c.move(i).land !== laStorms)
            c.wall = waNone;
      }
      if (d === BARLEV() - 1 && randstorm) {
        for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.land === laStorms && c2.mpdist >= BARLEV() && c2.landparam > c.landparam) {
          setdist(c2, BARLEV() - 1, c);
        } }
        let bad = false;
        for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.land !== laStorms) bad = true; }
        if (!bad) {
          let wallsnow = 0;
          let slp = 0;
          for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue;
            if (c2.wall) wallsnow++;
            if (c2.landparam === 1) slp++;
          }
          if (wallsnow === 0) {
            if (hrand(100) < 10)
              c.wall = pick(waCharged, waGrounded, waSandstone, waSandstone);
            else c.landparam = 1;
          }
          else if (wallsnow === 1 && slp === 0) {
            c.wall = waSandstone;
          }
          else if (wallsnow)
            c.landparam = 1;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand_monster_in(c.land, 7500) < 25 + (G.items[itFulgurite] + yendor_hardness()))
          c.monst = (hrand(5) ? moMetalBeast : moMetalBeast2),
          c.hitpoints = 3;
        if (hrand_monster_in(c.land, 10000) < 20 + (G.items[itFulgurite] + yendor_hardness()) && !ishept(c)) {
          c.monst = moStormTroll;
        }
      }
      break;
    }

    case laGraveyard:
      if (fargen) {
        if (G.randomPatternsMode)
          c.wall = randpattern(c, G.randompattern[c.land]) ? ((randpattern(c, G.randompattern[laCrossroads]) || randpattern(c, G.randompattern[laCrossroads2])) ? waAncientGrave : waFreshGrave) : waNone;
        else if (pseudohept_r(c))
          c.wall = hrand(5) ? waAncientGrave : waFreshGrave;
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(5000) < rebalance_treasure(30 + 4 * G.kills[moZombie] + 6 * G.kills[moNecromancer], 120, c.land) && notDippingFor(itBone))
          c.item = itBone;
        if (hrand_monster_in(c.land, 20000) < 10 + G.items[itBone] + yendor_hardness()) {
          const grm = [moZombie, moZombie, moZombie, moGhost, moGhost, moNecromancer];
          c.monst = grm[hrand(6)];
        }
      }
      break;

    case laRlyeh:
      if (fargen) {
        if (G.randomPatternsMode) {
          c.wall = randpattern(c, G.randompattern[c.land]) ? waColumn : waNone;
        }
        else {
          if (hrand(500) < 5) {
            for (let i = 0; i < c.type; i++) {
              const c2 = createMov(c, i);
              setdist(c2, d + 1, c);
              if (c2 && c2.land === laRlyeh)
                c2.wall = waColumn;
            }

            for (let j = 0; j < 2; j++) {
              const i = hrand(c.type);
              if (c.move(i) && c.move(i).land === laRlyeh)
                c.move(i).wall = waNone;
            }
          }
          if (pseudohept_r(c) && hrand(2)) c.wall = waColumn;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(5000) < rebalance_treasure(30 + 2 * (G.kills[moCultist] + G.kills[moTentacle] + G.kills[moPyroCultist]), 100, c.land) && notDippingFor(itStatue))
          c.item = itStatue;
        if (hrand_monster_in(c.land, 8000) < 5 + G.items[itStatue] + yendor_hardness() && !c.monst && !G.peace_on)
          c.monst = moTentacle, c.item = itStatue, c.mondir = NODIR;
        else if (hrand_monster_in(c.land, 12000) < 5 + G.items[itStatue] + yendor_hardness())
          c.monst = hrand(3) ? ((hrand(40) < G.items[itStatue] - 25) ? moCultistLeader : moCultist) : moPyroCultist;
        else if (hrand(8000) < 5 + G.items[itStatue] + yendor_hardness() && c.type === 6 && !(G.yendor_on && (yendor_clev().flags & YF_NEAR_TENT)) && celldist(c) >= 3) {
          for (let t = 0; t < c.type; t++) {
            if (c.move(t) && c.move(t).monst === moNone && (c.wall === waNone || c.wall === waColumn))
              c.move(t).wall = ishept(c.move(t)) ? waColumn : waNone;
            if (c.move(t).wall === waColumn)
              c.move(t).item = itNone;
          }
          if (buildIvy(c, 0, 3) && !G.peace_on) c.item = itStatue;
        }
      }
      if (c.mpdist >= 7) {
        if (c.wall === waColumn) c.landparam = 1;
        else {
          let i = 0, j = 0;
          for (let k = 0; k < c.type; k++)
            if (c.move(k) && c.move(k).wall === waColumn) {
              i++;
              if (c.modmove(k + 1) && c.modmove(k + 1).wall === waColumn) j++;
              if (c.modmove(k + 2) && c.modmove(k + 2).wall === waColumn) j++;
            }
          if (i > 2 || (i === 2 && !j)) c.landparam = 1;
          else c.landparam = 2;
        }
      }
      break;

    case laTemple:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        // depth!
        const d =
          ls_any_chaos() ? -15 * G.items[itGrimoire] :
          (eubinary() || c.master.alt) ? celldistAlt(c) : 10;
        // remember: d is negative
        if (ls_any_chaos() ? hrand(100) < 25 : d % temple_layer_size() === 0) {
          if (hrand_monster_in(c.land, 5000) < 20 - 2 * d && !c.monst && !G.peace_on)
            c.monst = moTentacle, c.mondir = NODIR;
        }
        else {
          // int d0 = d % temple_layer_size();
          // if(d0<0) d0=-d0;
          if (hrand(100) < (G.peace_on ? 15 : 30) && WDIM() === 2)
            c.wall = waBigStatue;
          else if (hrand_monster_in(c.land, 20000) < -d)
            c.monst = hrand(3) ? moCultist : moPyroCultist;
          else if (hrand_monster_in(c.land, 100000) < -d)
            c.monst = moCultistLeader;
          else if (hrand(5000) < 250 && !G.peace_on)
            c.item = itGrimoire;
          else if (hrand(5000) < 10 && (ls_any_chaos() ? G.items[itGrimoire] >= treasureForLocal() : -d > temple_layer_size() * 10) && !G.peace_on && !G.inv_on)
            c.item = itOrbDragon;
        }
      }
      break;

    case laHell:
      if (fargen) {
        if (hrand(1000) < (PURE() ? 16 : 36) && celldist(c) >= 3) {
          for (let i = 0; i < c.type; i++) {
            const c2 = createMov(c, i);
            setdist(c2, d + 1, c);
            if (c2 && c2.land === laHell)
              if (c2.wall !== waSulphurC)
                c2.wall = waSulphur;
          }
          c.wall = waSulphurC;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(6000) < rebalance_treasure(120 + (G.kills[moLesser]), 240, c.land) && notDippingFor(itHell))
          c.item = itHell;
        if (hrand_monster_in(c.land, 8000) < 40 + G.items[itHell] * (ls_any_chaos() ? 4 : 1) + yendor_hardness())
          c.monst = moLesser;
        else if (hrand_monster_in(c.land, 24000) < 40 + G.items[itHell] * (ls_any_chaos() ? 4 : 1) + yendor_hardness())
          c.monst = moGreater;
      }
      break;

    case laCocytus:
      if (fargen) {
        if (c.wall === waNone) c.wall = waFrozenLake;
        if (hrand(100) < 5 && !G.safety && celldist(c) >= 3) {
          for (let i = 0; i < c.type; i++) {
            const c2 = createMov(c, i);
            setdist(c2, d + 1, c);
            if (c2 && c2.land === laCocytus)
              c2.wall = waLake;
          }

          c.wall = waLake;

          if (hrand_monster_in(c.land, 500) < 100 + 2 * (G.items[itSapphire] + yendor_hardness()))
            c.monst = moShark;
        }
      }
      if (d === 8) c.landparam = 0;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moShark] + G.kills[moGreaterShark] + G.kills[moCrystalSage]), 200, c.land) && notDippingFor(itSapphire))
          c.item = itSapphire;
        if (hrand_monster_in(c.land, 5000) < 2 * (G.items[itSapphire] + yendor_hardness())) {
          const ms = [moYeti, moGreaterShark, moCrystalSage];
          c.monst = ms[hrand(3)];
          if (c.monst === moGreaterShark) c.wall = waLake;
        }
      }
      break;

    case laHive:
      if (fargen) {
        if (hrand(2000) < (ls_tame_chaos() ? 1000 : (PURE() && !ls_any_chaos()) ? 200 : ls_any_chaos() ? 10 : ls_horodisk_structure() ? 50 : ls_hv_structure() ? 10 : 2) && !G.safety)
          hive_createBugArmy(c);
        if (hrand_monster_in(c.land, 20000) < 10 && ls_horodisk_structure()) c.monst = moPirate;
        if (hrand(2000) < 100 && !c.wall && !c.item && !c.monst) {
          let nww = 0;
          for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).wall === waWaxWall)
            nww++;
          if (nww === 0) {
            c.wall = waWaxWall;
            c.monst = moNone;
            c.landparam = hrand(0xFFFFFF + 1);
          }
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand_monster_in(c.land, 6000) < (hive_hivehard() - 15))
          c.monst = hive_randomHyperbug();

        /* if(hrand(1500) < 30 + (kills[moBug0] + kills[moBug1] + kills[moBug2]) && notDippingFor(itRoyalJelly))
          c->item = itRoyalJelly; */
        /* if(hrand(2000) < 2)
          c->monst = eMonster(moBug0 + hrand(3)); */
      }
      break;

    case laKraken:
      if (fargen) c.wall = waSea;

      if (d === 8 && c.land === laKraken && kraken_pseudohept(c) && hrand(1000) <= 2) {
        c.wall = waNone;
        for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; c2.wall = waNone; }
      }

      if (d === 8 && !kraken_pseudohept(c) && hrand_monster_in(c.land, 20000) < 10 + 3 * G.items[itKraken] + 2 * yendor_hardness() && c.wall === waSea && !c.item && !c.monst && !G.safety) {
        let ok = true;
        for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue;
          if (c2.wall !== waSea || c2.item || c2.monst)
            ok = false; }

        if (ok) {
          c.monst = moKrakenH;
          for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue;
            c2.monst = moKrakenT;
            c2.hitpoints = 1;
            c2.stuntime = 0;
            c2.mondir = c.c.spin(i);
          }
          if (!G.peace_on) playSound(c, 'seen-kraken');
        }
      }

      if (d === 7 && c.wall === waSea && !c.item && !c.monst && !G.safety) {
        if (hrand_monster_in(c.land, 2000) < 3) {
          c.wall = waBoat;
          c.item = itOrbFish;
          c.monst = moViking;
        }
        else if (hrand(2000) < 16) c.item = itOrbFish;
        else if (hrand(500) < G.kills[moKrakenH]) c.item = itKraken;
        else placeLocalOrbs(c);
      }
      break;

    case laCaribbean:
      if (fargen) {
        if (!eubinary()) {
          if (c.master.alt && masterAlt(c) <= 2) {
            if (!eubinary()) G.currentmap.extend_altmap(c.master);
            preventbarriers(c);
            const d = celldistAlt(c);
            if (d <= 0)
              // c->wall = waChasm;
              generateTreasureIsland(c);
            else
              c.wall = waSea;
          }
          else c.wall = waSea;
        }
        else {
          const d = celldistAlt(c);
          if (d <= 0)
            generateTreasureIsland(c);
          else
            c.wall = waSea;
        }
      }
      if (d === 8 && !eubinary()) {
        let mindist = 9;
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i);
          if (c2 && (eubinary() || c2.master.alt) && celldistAlt(c2) < mindist)
            mindist = celldistAlt(c2);
        }
        if (mindist === 0) beCIsland(c);
      }
      if (d === 7 && c.wall === waSea) {
        let coast = false;
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i);
          if (passable(c2, c, 0n) && c2.wall !== waBoat) coast = true;
        }
        if (coast && hrand(10) < 5) {
          c.wall = waBoat;

          placeLocalSpecial(c, 50);
        }
      }
      if (d === 7 && c.wall === waSea && hrand_monster_in(c.land, 10000) < 20 + G.items[itPirate] + 2 * yendor_hardness() && !G.safety)
        c.monst = moCShark;
      if (d === 7 && c.wall === waCTree && hrand_monster_in(c.land, GDIM() === 2 ? 5000 : 50000) < 100 + G.items[itPirate] + yendor_hardness() && !G.safety)
        c.monst = moParrot;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(1500) < 4 && celldistAlt(c) <= -5 && G.peace_on && !cryst())
          c.item = itCompass;
        if (hrand_monster_in(c.land, 16000) < 40 + (G.items[itPirate] + yendor_hardness()))
          c.monst = moPirate;
      }
      break;

    case laTortoise:
      if (fargen) {
        // using namespace tortoise; enum tflag (complex.cpp)
        const tfShell = 0, tfLongNeck = 8, tfFront = 9, tfRear = 10, tfTail = 11,
          tfShellHue = 13, tfScuteHue = 14, tfSkinHue = 15, tfShellSat = 16;
        const f = hrand(30);
        if (f < 21 && ((getBits(c) >> f) & 1)) {
          let tf = f;
          // long neck and saddleback shell help with big trees
          // #define PSH(x,y) if(tf == x || tf == y) tf = pseudohept(c) ? x : y;
          if (tf === tfLongNeck || tf === tfShell) tf = pseudohept(c) ? tfLongNeck : tfShell;
          if (tf === tfLongNeck) c.wall = waBigTree;
          if (tf === tfShell) c.wall = waBigTree;
          // brown body elements help with (small) trees
          if (tf === tfShellHue || tf === tfScuteHue) tf = pseudohept(c) ? tfShellHue : tfScuteHue;
          if (tf === tfShellHue) c.wall = waSmallTree;
          if (tf === tfScuteHue) c.wall = waSmallTree;
          if (tf === tfSkinHue) c.wall = waSmallTree;
          // long legs help with rocks
          if (tf === tfFront || tf === tfRear) tf = pseudohept(c) ? tfFront : tfRear;
          if (tf === tfFront) c.wall = waStone;
          if (tf === tfRear) c.wall = waStone;
          // broad tail and desaturated shell helps with water
          if (tf === tfTail || tf === tfShellSat) tf = pseudohept(c) ? tfTail : tfShellSat;
          if (tf === tfTail) c.wall = waDeepWater;
          if (tf === tfShellSat) c.wall = waDeepWater;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        const mk21tor = (tortoise_seek() && !((tortoise_getb(c) ^ G.tortoise_seekbits) & tortoise_mask) && (G.turncount > G.tortoise_last21tort + 100));
        if ((mk21tor || hrand_monster_in(c.land, ls_hv_structure() ? 8000 : 4000) < (G.peace_on ? 750 : 50 + G.items[itBabyTortoise] * 2 + yendor_hardness() * 6)) && !G.safety) {
          c.monst = moTortoise;
          c.hitpoints = 3;
          const val = tortoise_getb(c);
          G.tortoise_emap.set(c, val);
          if (mk21tor) G.tortoise_last21tort = G.turncount;
        }
        else if (ls_hv_structure() && hrand(10000) <= 250) {
          c.item = itCompass;
        }
        else if (ls_hv_structure() && hrand_monster_in(c.land, 10000) <= 15) {
          c.monst = moPirate;
        }

        let chance = 50 + G.items[itBabyTortoise] * 2;
        if (quickfind(laTortoise)) chance += 150;
        if ((ls_single() || euclid() || G.peace_on) && hrand(4000) < chance && !G.safety) {
          c.item = itBabyTortoise;
          G.tortoise_babymap.set(c, tortoise_getb(c) ^ tortoise_getRandomBits());
        }
      }
      break;

    case laDesert:
      if (fargen) {
        if (G.randomPatternsMode)
          c.wall = randpattern(c, G.randompattern[c.land]) ? waDune : waNone;
        else {
          if (hrand(100) < 5) {
            for (let i = 0; i < c.type; i++) {
              const c2 = createMov(c, i);
              setdist(c2, d + 1, c);
              if (c2 && c2.land === laDesert)
                c2.wall = waDune;
            }

            for (let j = 0; j < 2; j++) {
              const i = hrand(c.type);
              if (c.move(i) && c.move(i).land === laDesert)
                c.move(i).wall = waNone;
            }
          }
        }

        if (hrand(G.items[itOrbLuck] ? 100 : 300) === 1 && G.items[itSpice] >= 5) c.wall = waThumperOff;
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(5000) < rebalance_treasure(100 + 2 * (G.kills[moWorm] + G.kills[moDesertman]), 200, c.land) && notDippingFor(itSpice))
          c.item = itSpice;
        if (hrand_monster_in(c.land, 8000) < 10 + 2 * (G.items[itSpice] + yendor_hardness()) && !c.monst)
          c.monst = (hrand(2) && !G.peace_on) ? moWorm : moDesertman,
          c.mondir = NODIR;
      }
      break;

    case laRedRock:
      if (fargen) {
        if (G.randomPatternsMode) {
          c.wall = waNone;
          if (!ishept(c)) { if (randpattern(c, G.randompattern[c.land])) buildRedWall(c, 20); }
          else {
            let k = 0;
            for (let i = 0; i < 20; i++)
              if (randpattern(createMov(c, i % 7), laRedRock) && !randpattern(createMov(c, (i + 1) % 7), laRedRock))
                k++;
            if (k >= 4) buildRedWall(c, 20);
          }
        }
        else if (ishept(c) && hrand(100) < (G.doCross ? 20 : 8) && !c.monst) {
          buildRedWall(c, 80);
          const cw = new cellwalker(c, hrand(S7()));
          buildRedWall(cw.cpeek(), 33);
          if (hrand(2) === 0)
            buildRedWall(cw.plusStep().add(hrand(2) ? 2 : 4).cpeek(), 20);
          cw.addRev();
          if (hrand(6) < 4)
            buildRedWall(cw.cpeek(), 33);
          if (hrand(2) === 0)
            buildRedWall(cw.plusStep().add(hrand(2) ? 2 : 4).cpeek(), 20);
        }
      }
      if (d === 7 && c.wall === waNone)
        buildPrizeMirror(c, 1000);
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand_monster_in(c.land, (G.doCross && celldist(c) <= 5) ? 450 : 16000) < 30 + G.items[itRedGem] + yendor_hardness() && !pseudohept(c) && !c.monst && !c.wall && !(!BITRUNCATED() && S3() === 4)) {
          let i = -1;
          for (let t = 0; t < c.type; t++) if (c.move(t).mpdist > c.mpdist && !pseudohept(c.move(t)))
            i = t;
          if (i !== -1 && !G.peace_on)
            generateSnake(c, i, 1);
        }
        else if (hrand_monster_in(c.land, 16000) < 50 + G.items[itRedGem] + yendor_hardness() && (PURE() ? hrand(10) < 3 : !ishept(c)) && !c.monst)
          c.monst = moRedTroll,
          c.mondir = NODIR;
      }
      break;

    case laSnakeNest:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand_monster_in(c.land, 30000) < 30 + G.items[itSnake] + yendor_hardness() && !c.monst && !c.wall && !G.peace_on) {
          const gooddir: number[] = [];
          for (let t = 0; t < c.type; t++) if (c.move(t).mpdist > c.mpdist)
            gooddir.push(t);
          if (isize(gooddir))
            generateSnake(c, gooddir[hrand(isize(gooddir))], 2);
        }
        else if (hrand_monster_in(c.land, 10000) < G.items[itSnake] - 10 + yendor_hardness() && !c.monst && !c.wall && !G.peace_on) {
          c.monst = pick(moRedTroll, moMiner, moSkeleton, moBomberbird);
          c.hitpoints = 3;
        }
        else if (hrand(16000) < Math.sqrt(G.kills[moHexSnake] * 10000) && c.wall === waNone) {
          c.item = itSnake;
          if (hrand(30) >= G.items[itSnake] - 10) c.wall = waRed3;
        }
      }
      break;

    case laWarpSea:
    case laWarpCoast:
      if (fargen && G.randomPatternsMode)
        setland(c, randpattern(c, G.randompattern[c.land]) ? laWarpCoast : laWarpSea);

      if (d === 8) {
        if (c.land === laWarpCoast) {
          if (hrand(1000) < 150 && celldist(c) >= 3 && !pseudohept(c))
            c.wall = waSmallTree;
          let q = 0;
          if (BITRUNCATED() && !ls_any_chaos() && !weirdhyperbolic()) for (let i = 0; i < c.type; i++)
            if (c.move(i) && !isWarpedType(c.move(i).land) && c.move(i).land !== laCrossroads4)
              q++;
          if (q === 1) c.wall = waWarpGate;
        }

        if (c.land === laWarpSea) {
          c.wall = waSea;
          let q = 0;
          if (BITRUNCATED() && !ls_any_chaos()) for (let i = 0; i < c.type; i++)
            if (c.move(i) && !isWarpedType(c.move(i).land)) q++;
          if (q === 1) c.wall = waWarpGate;
        }
      }

      if (d === 7 && c.land === laWarpSea && c.wall === waSea && !G.safety) {
        if (sphere() && c.type !== 6 && c.master.fiftyval === 6) {
          c.wall = waBoat;
          c.monst = moRatling;
        }
        if (hrand_monster_in(c.land, 12000) < 30 + 2 * G.items[itCoral] + yendor_hardness()) {
          c.wall = waBoat;
          c.monst = moRatling;
        }
        else if (hrand(6000) < rebalance_treasure(120 + Math.min(G.kills[moRatling], 250), 240, c.land) && notDippingFor(itCoral)) {
          c.wall = waBoat;
          c.item = itCoral;
        }
        else if (hrand(6000) < 1000 && ls_hv_structure()) {
          /* somehow there were not enough boats in hv_structure... */
          for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (c1.land === laWarpCoast) c.wall = waBoat; }
        }
      }

      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) if (c.land === laWarpCoast) { // ONEMPTY
        if (hrand_monster_in(c.land, 12000) < 20 + 2 * G.items[itCoral] + yendor_hardness()) {
          c.monst = moRatling;
          c.stuntime = hrand(2);
        }
      }
      break;

    case laBull:
      if (d === 8 && !c.monst && !c.item && celldist(c) >= 3) {
        /* int cd = getCdata(c, 3);
        cd &= 15;
        int ce = getCdata(c, 2);
        ce &= 15;
        if(cd >= 8 && ce >= 8) */

        if (G.randomPatternsMode) {
          const i = (randpattern(c, G.randompattern[c.land]) ? 1 : 0) + (randpattern(c, G.randompattern[laHell]) ? 2 : 0);
          const w = [waNone, waSmallTree, waBigTree, waStone];
          c.wall = w[i];
        }
        else if (hrand(100) < 25)
          c.wall = G.safety ? pick(waBigTree, waSmallTree) : pick(waStone, waBigTree, waSmallTree);
      }

      if (d === 7 && c.wall === waNone && !G.safety) {
        if (hrand(1000) < 20) c.monst = moSleepBull;
        else if (hrand_monster_in(c.land, 2500) < G.items[itBull] + yendor_hardness() - 10) c.monst = moGadfly;
        else if (hrand(1000) < 50) {
          let nearwall = 0;
          const walls: number[] = new Array<number>(8).fill(0);
          for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.wall) walls[nearwall++] = i; }
          if (nearwall && nearwall < c.type) {
            c.monst = moButterfly;
            c.mondir = walls[hrand(nearwall)];
          }
        }
      }
      break;

    case laRose:
      if (d === 8 && c.land === laRose && hrand(2000) < 100 && !c.wall && !c.item && !c.monst) {
        let nww = 0;
        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i);
          if (c2 && c2.wall === waRose) nww++;
          if (c2 && !ls_any_chaos() && !ls_hv_structure()) for (let j = 0; j < c2.type; j++) {
            const c3 = c2.move(j);
            // note: c3->land is required for Android --
            // not strictly equivalent since another land there might be not yet generated
            if (c3 && c3.land !== laRose && c3.land) nww++;
          }
        }

        if (nww === 0) {
          c.wall = waRose;
          c.monst = moNone;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(2000) < rebalance_treasure(25 + Math.min(G.kills[moFalsePrincess] + G.kills[moRoseBeauty] + G.kills[moRoseLady], 200), 100, c.land) && notDippingFor(itRose)) {
          if (G.land_structure === lsTotalChaos)
            c.item = itRose;
          else for (let t = 0; t < c.type; t++) if (c.move(t) && c.move(t).wall === waRose)
            c.item = itRose;
        }
        else {
          const p = hrand_monster_in(c.land, 10000);
          if (p >= 10 + G.items[itRose] + yendor_hardness()) { /* nothing */ }
          else if (p < 10) c.monst = moFalsePrincess;
          else if (p < 13) c.monst = moRoseBeauty;
          else if (p < 18) c.monst = moRoseLady;
          else if (p < 20) c.monst = moRoseBeauty;
          else if (p < 30) c.monst = moFalsePrincess;
          else if (p < 35) c.monst = moRoseLady;
          else if (p < 60) c.monst = moFalsePrincess;
          else if (p < 65) c.monst = moRoseBeauty;
          else c.monst = moFalsePrincess;
        }
      }
      break;

    case laHunting:
      if (d === 7 && c.land === laHunting && !G.racing_on && !G.safety && !G.reptilecheat) {
        if (hrand(1000) < 20 * ls_ls_mul_big()) {
          if (openplains(c)) {
            if (hrand(2) === 0) {
              if (!G.items[itHunting]) {
                const next: [cell, cell][] = [];
                const bonus = c.type - 4;
                for (let i = 0; i < c.type; i++) {
                  const ci = new cellwalker(c, i);
                  const cw0 = ci.plusStep().addRevStep();
                  const cw1 = ci.plus(bonus).addStep().addRevStep();
                  if (cw0.at.mpdist > 7)
                    if (cw1.at.mpdist > 7)
                      next.push([cw0.at, cw1.at]);
                }
                if (isize(next)) {
                  c.item = itHunting;
                  const p = next[hrand(isize(next))];
                  p[0].monst = moHunterGuard;
                  p[0].stuntime = 0;
                  p[1].monst = moHunterGuard;
                  p[1].stuntime = 0;
                }
              }
              else if (G.items[itHunting] < 10) {
                const next: cell[] = [];
                for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.mpdist > 7 && (!BITRUNCATED() || !ctof(c2))) next.push(c2); }
                if (isize(next)) {
                  c.item = itHunting;
                  const c3 = next[hrand(isize(next))];
                  const dogcells: cell[] = [];
                  for (let i = 0; i < c3.type; i++) { const c4 = c3.move(i); if (!c4) continue; if (c4.mpdist > 7 && !isNeighbor(c4, c))
                    dogcells.push(c4); }
                  if (G.items[itHunting] < 10 && isize(dogcells) >= 2) {
                    for (let t = 0; ; t++) {
                      if (t === 50) { c.item = itNone; break; }
                      const dog1 = dogcells[hrand(isize(dogcells))];
                      const dog2 = dogcells[hrand(isize(dogcells))];
                      if (valence() !== 3 || isNeighbor(dog1, dog2)) {
                        dog1.monst = moHunterGuard;
                        dog1.stuntime = 0;
                        if (dog1.land === laHunting) dog1.landparam = 0;
                        dog2.monst = moHunterGuard;
                        dog2.stuntime = 0;
                        if (dog2.land === laHunting) dog2.landparam = 1;
                        break;
                      }
                    }
                  }
                  else if (isize(dogcells)) {
                    c.item = itHunting;
                    const dog = dogcells[hrand(isize(dogcells))];
                    dog.monst = moHunterGuard;
                    dog.stuntime = 0;
                  }
                }
              }
              else c.item = itHunting;
            }
            else placeLocalSpecial(c, 10);
          }
        }
        if (hrand_monster_in(c.land, 5000) < G.items[itHunting] - 17 + yendor_hardness())
          c.monst = moHunterDog;
      }
      break;

    case laOcean:
      if (d >= 8 && d <= 9) c.wall = waSea;
      if (d === 7 && !G.safety) {

        if (ls_hv_structure() && c.master.alt) {
          // hv_land[c->master->alt->alt] (std::map operator[] inserts the default)
          const k = c.master.alt.alt;
          if (!G.hv_land.has(k)) G.hv_land.set(k, laNone);
          if (G.hv_land.get(k) === laWhirlpool) {
            if (hrand(100) < 10) c.wall = waBoat;
            return;
          }
        }

        let placecolumn = false;
        if (c.landparam % temple_layer_size() === 0 && c.landparam <= 24) {
          let q = 0;
          for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue;
            if (c2.landparam % temple_layer_size() === 0 && !pseudohept(c2)) q++; }
          placecolumn = q === 2;
          if (placecolumn && weirdhyperbolic() && !BITRUNCATED() && hrand(100) >= 50)
            placecolumn = false;
          if (placecolumn) {
            placecolumn = false;
            let c2 = c;
            seek: for (;;) {
              for (let i = 0; i < c2.type; i++) { const c3 = c2.move(i); if (!c3) continue; if (c3.landparam < c2.landparam) {
                c2 = c3; continue seek;
              } }
              break;
            }
            for (let i = 0; i < c2.type; i++) { const c3 = c2.move(i); if (!c3) continue; for (let j = 0; j < c3.type; j++) { const c4 = c3.move(j); if (!c4) continue;
              if (c4.barleft === laRlyeh || c4.barright === laRlyeh || c4.land === laRlyeh)
                placecolumn = true; } }
          }
        }

        if (placecolumn)
          c.wall = waColumn;
        else if ((c.landparam >= 1 && c.landparam <= 25) || ls_any_chaos()) {
          if (hrand(1000) < 5)
            c.wall = waBoat;
          if (hrand(1000) < rebalance_treasure(50 + idiv(G.kills[moAlbatross], 2), 150, c.land) && !G.peace_on)
            c.item = itCoast;
          if (hrand_monster_in(c.land, 15000) < 10 + 2 * G.items[itCoast] + 2 * yendor_hardness())
            c.monst = moAlbatross;
          if (G.items[itCoast] >= treasureForLocal() && hrand(10000) < 5 && !G.peace_on && !G.inv_on)
            c.item = itOrbAir;
          else placeLocalSpecial(c, 10000, 6, 5);
          buildPrizeMirror(c, 2000);
        }
        else if (c.landparam > 25) {
          const amberbonus = G.items[itCoast] - 50;
          // 50 => 10
          if (hrand_monster_in(c.land, 15000) < 10 + amberbonus + 2 * yendor_hardness())
            c.monst = moAlbatross;
          if (hrand_monster_in(c.land, 30000) < 20 + 2 * yendor_hardness()) {
            c.wall = waBoat;
            c.monst = moPirate;
            // orbs are possible!
            placeOceanOrbs(c);
          }
          else if (hrand_monster_in(c.land, 30000) < 10 + 2 * yendor_hardness())
            c.monst = moCShark;
        }
      }
      break;

    case laMinefield:
      if (d === 7 && closed_or_bounded()) c.wall = waMineUnknown;
      else if (d === 7) {
        c.wall = waMineUnknown;
        // 250: rare mines
        // 1250: at 25
        let minefreq = 0;
        const treas = G.items[itBombEgg];
        // if(treas <= 10) minefreq = 250 + 30 * treas;
        if (treas <= 110) minefreq = 550 + 10 * (treas - 10);
        else minefreq = 1550 + (treas - 110);

        // experimentation says that 600 is slightly too hard to find the Orb of Yendor
        if (G.yendor_generating || G.yendor_path)
          if (minefreq < 550)
            minefreq = 550;

        const tfreq =
          G.reptilecheat ? 0 :
          treas < 10 ? 50 + 5 * treas :
          treas < 25 ? 100 + (treas - 10) * 2 :
          treas < 50 ? 150 + (treas - 25) :
          175;

        if (hrand(5000) < minefreq)
          c.wall = waMineMine;
        else if (hrand(5000) < tfreq && !G.safety && !G.peace_on) {
          c.item = itBombEgg;
          c.landparam = G.items[itBombEgg] + 5 + hrand(11);
        }
        else if (hrand_monster_in(c.land, 5000) < treas - 20 + yendor_hardness() && !G.safety && !G.reptilecheat)
          c.monst = moBomberbird;
        else placeLocalSpecial(c, 500);
      }
      if (d === 3 && G.safety && (c.wall === waMineMine || c.wall === waMineUnknown) && !closed_or_bounded())
        c.wall = waMineOpen;
      break;

    case laWhirlpool:
      if (d === 7)
        whirlpool_generate(c);
      break;

    case laMountain:
      if (d === 7) {
        if (hrand_monster_in(c.land, 50000) < 100 && !G.safety)
          buildIvy(c, 0, 3);
        else if (hrand_monster_in(c.land, 125000) < 100 - celldistAlt(c) && !G.safety)
          c.monst = moMonkey;
        else if (hrand_monster_in(c.land, 200000) < Math.min(100, -10 * celldistAlt(c)) - celldistAlt(c) && !G.safety)
          c.monst = moEagle;
        else if (hrand(100) < 5)
          c.wall = waPlatform;
        else if (hrand(100) < 20)
          c.wall = waBigBush;
        else if (hrand(100) < 12)
          c.wall = waSmallBush;
        else if (hrand(500) < idiv(-celldistAlt(c), 5) - G.items[itAmethyst])
          c.item = itAmethyst;
      }
      break;

    case laEndorian:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (c.wall === waNone && coastval(c, laEndorian) >= 10 && hrand_monster_in(c.land, 5000) < 10 + 2 * (G.items[itApple] + yendor_hardness()) && (WDIM() === 2 || hrand(100) < 25))
          c.monst = moSparrowhawk;
        else if (c.wall !== waNone && hrand_monster_in(c.land, WDIM() === 3 ? 25000 : 5000) < 10 + 2 * (G.items[itApple] + yendor_hardness()))
          c.monst = moResearcher;
        else if (c.wall === waCanopy && !checkInTree(c, 3) && hrand(5000) < rebalance_treasure(300 + 5 * (G.kills[moSparrowhawk] + G.kills[moResearcher]), 750, c.land))
          c.item = itApple;
      }
      break;

    case laJungle:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(5000) < rebalance_treasure(25 + 2 * (G.kills[moIvyRoot] + G.kills[moMonkey]), 40, c.land) && notDippingFor(itRuby))
          c.item = itRuby;
        if (hrand_monster_in(c.land, 15000) < 5 + 1 * (G.items[itRuby] + yendor_hardness()))
          c.monst = moMonkey;
        else if (hrand_monster_in(c.land, 80000) < 5 + G.items[itRuby] + yendor_hardness())
          c.monst = moEagle;
        else if (pseudohept_r(c) && c !== G.currentmap.gamestart() && hrand_monster_in(c.land, 4000) < (300 + G.items[itRuby]) * ls_ls_mul_big() && !c.monst) {
          let hardchance = G.items[itRuby] + yendor_hardness();
          if (hardchance > 25) hardchance = 25;
          const hardivy = hrand(100) < hardchance;
          // note the precedence: `&& !peace::on` binds to the last alternative only
          if (G.land_structure === lsVineWalls ? buildIvy(c, 0, 2) : (cgflags() & qFRACTAL) !== 0n ? buildIvy(c, 0, 2) : hat_in() ? buildIvy(c, 0, 4) : ((hardivy ? buildIvy(c, 1, 9) : buildIvy(c, 0, c.type)) && !G.peace_on))
            c.item = itRuby;
        }
      }
      break;

    case laMirrorOld:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(5000) < 120 && (G.peace_on || notDippingFor(itShard)) && mirror_build(c)) { /* nothing */ }
        else if (ishept(c) && hrand(5000) < 10 * PRIZEMUL)
          placePrizeOrb(c);
        else if (hrand_monster_in(c.land, 12000) < 8 + G.items[itShard] + yendor_hardness())
          c.monst = moRanger;
        else if (hrand_monster_in(c.land, 60000) < 8 + G.items[itShard] + yendor_hardness())
          c.monst = moEagle;
      }
      break;

    case laMirror:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(1250) < 120 && (G.peace_on || notDippingFor(itShard)) && mirror_build(c)) { /* nothing */ }
        else if (ishept(c) && hrand(5000) < 10 * PRIZEMUL)
          placePrizeOrb(c);
        else if (hrand_monster_in(c.land, G.cwt.at.land === laMirror ? 600 : 2400) < 8 + G.items[itShard] + yendor_hardness()) {
          if (G.items[itShard] >= 5 && hrand(120) <= 20)
            c.monst = moMirrorSpirit;
          else
            c.monst = moNarciss;
        }
      }
      break;

    case laClearing:
      if (d === 7) {
        clearing_generate(c);
        if (ls_hv_structure() && celldistAlt(c) >= -1) c.monst = moNone;
        if (pseudohept(c)) {
          const d = -celldistAlt(c);
          if (hrand_monster_in(c.land, 2500) < G.items[itMutant2] + yendor_hardness() - 10 && !G.reptilecheat)
            c.monst = moRedFox;
          else if (d > 0 && hrand(100 + d) < d && !G.reptilecheat)
            c.item = itMutant2;
        }
      }
      break;

    case laMotion:
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(1500) < rebalance_treasure(30 + G.kills[moRunDog], 100, c.land) && notDippingFor(itFeather))
          c.item = itFeather;
        if (hrand_monster_in(c.land, 20000) < 25 + G.items[itFeather] + yendor_hardness()) {
          c.monst = moRunDog;
          // preset the movement direction
          // this will make the dog go in the direction of the center,
          // if the player is unreachable/invisible
          for (let d = 0; d < c.type; d++) if (c.move(d) === from) {
            c.mondir = (d + 3) % c.type;
          }
          chasmify(c);
          c.wall = G.shmup_on ? waNone : waChasm;
        }
        // int cmf[10]: land_structure >= 10 reads past the array in C++ (undefined); here it gives undefined (false)
        const cmf = [0, 1, 3, 5, 10, 0, 0, 0, 0, 0];
        if (G.inv_on && ls_any_chaos() && G.items[itFeather] && hrand(1000) < cmf[G.land_structure] && !c.item && !c.monst)
          c.item = itOrbSafety;
      }
      break;

    case laMagnetic:
      if (d === 8) {
        if (hrand(10000) < 30 && !c.monst && !c.wall) {
          let c1 = c;
          let c2 = createMov(c1, hrand(c1.type));
          if (c2.monst || c2.wall) return;
          if (hrand(2)) { const t = c1; c1 = c2; c2 = t; }
          for (let i = 0; i < c1.type; i++) { const c3 = c1.move(i); if (!c3) continue; if (c3.monst === moNorthPole) return; }
          for (let i = 0; i < c2.type; i++) { const c3 = c2.move(i); if (!c3) continue; if (c3.monst === moSouthPole) return; }
          c1.monst = moNorthPole;
          c2.monst = moSouthPole;
          c1.mondir = neighborId(c1, c2);
          c2.mondir = neighborId(c2, c1);
        }
      }
      break;

    case laRuins: {
      const kf = 10 + G.items[itRuins] + yendor_hardness();
      if (d === 8) {
        if (G.randomPatternsMode) {
          c.wall = randpattern(c, G.randompattern[c.land]) ? waRuinWall : waNone;
        }
        else {
          c.landparam = 2;
          if (out_ruin(c)) {
            c.landparam = 0;
            if (hrand(100) < 3)
              c.wall = waRuinWall;
          }
          else if (hrand(100) < 75) {
            for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (out_ruin(c2))
              c.wall = waRuinWall, c.landparam = 1; }
          }
        }
        if (hrand_monster_in(c.land, 40000) < kf && !c.monst && !c.wall && !G.shmup_on && !G.safety) {
          const c1 = c;
          const c2 = createMov(c1, hrand(c1.type));
          if (c2.monst || c2.wall) return;
          c1.monst = moPair;
          c2.monst = moPair;
          c1.stuntime = 0;
          c2.stuntime = 0;
          c1.mondir = neighborId(c1, c2);
          c2.mondir = neighborId(c2, c1);
        }
      }
      if (d === 7 && c.landparam === 2) for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.land === laRuins && out_ruin(c2)) c.landparam = 1; }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(1500) < rebalance_treasure(30 + G.kills[moHexDemon] + G.kills[moAltDemon] + G.kills[moMonk] + G.kills[moPair] + G.kills[moCrusher], 100, c.land) && notDippingFor(itRuins)) {
          c.item = itRuins;
          for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.monst === moMonk)
            clear_item(c); }
        }
        if (hrand_monster_in(c.land, 7000) < kf && !c.monst) {
          c.monst = genRuinMonster(c);
          c.hitpoints = 3;
        }
      }
      break;
    }

    case laDocks: {
      if (d === 8) {
        if (G.randomPatternsMode) {
          c.wall = randpattern(c, G.randompattern[c.land]) ? waDock : waSea;
          if (c.wall === waSea && randpattern(c, G.randompattern[laEAir]))
            c.wall = waBoat;
        }
        else {
          const si = new patterns_patterninfo();
          if (a38())
            patterns_val38(c, si, patterns_SPF_DOCKS, patterns_PAT_COLORING);
          else
            si.id = arcm_in() ? (hrand(6) * 4) : (zebra40(c) & 2) ? 0 : zebra40(c) === 4 ? 8 : 1;
          c.wall = waSea;
          if (among(si.id, 0, 4, 16, PURE() ? -1 : 24))
            c.wall = waDock;
          if (si.id === 8 && hrand(100) < 75) {
            c.wall = waBoat;
            if (a38()) for (let i = 0; i < c.type; i++) {
              patterns_val38(createMov(c, i), si, patterns_SPF_DOCKS, patterns_PAT_COLORING);
              if ((si.id as number) === 0) c.mondir = i; // val38 sets si.id
            }
          }
        }
      }
      if (d === 7 && !G.safety) {
        if (G.randomPatternsMode) {
          if (hrand(2000) < rebalance_treasure(30 + G.kills[moRatling] + G.kills[moCShark] + G.kills[moAlbatross] + G.kills[moPirate] + G.kills[moFireFairy], 100, c.land)) c.item = itDock;
        }
        else {
          const si = new patterns_patterninfo();
          if (a38())
            patterns_val38(c, si, patterns_SPF_DOCKS, patterns_PAT_COLORING);
          else
            si.id = hrand(20);
          if (si.id === 16 && hrand(250) < rebalance_treasure(30 + G.kills[moRatling] + G.kills[moCShark] + G.kills[moAlbatross] + G.kills[moPirate] + G.kills[moFireFairy], 100, c.land))
            c.item = itDock;
        }
        if (c.wall === waDock && hrand_monster_in(c.land, 6000) < 25 + G.items[itDock] + yendor_hardness())
          c.monst = pick(moPirate, moRatling, moFireFairy);
        if (c.wall === waSea && hrand_monster_in(c.land, 6000) < 25 + G.items[itDock] + yendor_hardness())
          c.monst = pick(moCShark, moAlbatross);
      }
      break;
    }

    case laEAir:
    case laEWater:
    case laEEarth:
    case laEFire:
    // but not case laElementalWall:
      if (d === 8) {
        if (hrand(c.land === laEAir ? 6 : 25) === 0)
          place_elemental_wall(c);
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        const localshard = localshardof(c.land);
        const danger = 5 * G.items[localshard] * G.items[localshard];
        const elof = elementalOf(c.land);
        const elkills = rebalance_treasure(G.kills[elof], 25, c.land);

        if (hrand_monster_in(c.land, 8000) < 12 + (G.items[itElemental] + danger + yendor_hardness())) {
          c.monst = elof;
          if (c.land !== laEAir) chasmifyElemental(c);
          c.wall = waNone;
          if (c.land === laEWater) c.wall = waDeepWater;
        }
        else if (hrand(5000) < 100 + elkills * 3 && notDippingFor(itElemental))
          c.item = localshard;
        else placeLocalSpecial(c, 500);
      }
      break;

    case laBrownian:
      // #if CAP_COMPLEX2
      brownian_build(c, d);
      break;

    case laMirrored:
    case laMirrorWall:
    case laMirrorWall2:
    case laMirrored2:
      c.wall = waMirrorWall;
      break;

    case laCrossroads:
    case laCrossroads2:
    case laCrossroads3:
    case laCrossroads4:
    case laCrossroads5:
    case laCrossroads6:
    case laMasterCrossroads:
      if (c.wall === waTower) c.land = laCamelot;
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (!BITRUNCATED() && c.land === laCrossroads5 && hrand(100) < 60)
          c.wall = waBarrier;
        else if (!G.inv_on && G.items[itShard] >= 10 && hrand(8000) < 120 * orbcrossfun(G.items[itShard]) && mirror_build(c)) { /* nothing */ }
        else if (hyperstonesUnlocked() && !G.racing_on && hrand(8000) < 100 && mirror_build(c)) { /* nothing */ }
        else if (G.tactic_on && isCrossroads(G.specialland) && hrand(8000) < 120 && mirror_build(c)) { /* nothing */ }
        else if (c.land === laCrossroads4 && hrand(24000) < 10 && G.tactic_on)
          c.wall = waRose;
        else {
          if (hyperstonesUnlocked() && !G.racing_on && hrand(25000) < Math.min(rebalance_treasure(tkills(), 2000, c.land), 5000) && notDippingFor(itHyperstone))
            c.item = itHyperstone;
          let freq = 4000;
          if (ls_single() && G.specialland === laCrossroads5 && !G.racing_on)
            freq = 250;
          if (ls_hv_structure() && hrand(10000) < 10 && !c.monst) { c.monst = moPirate; }
          if (ls_horodisk_structure() && !c.item && hrand(10000) < 10 && !G.safety)
            gen_baby_tortoise(c);
          if (hrand_monster_in(c.land, freq) < G.items[itHyperstone] && !c.monst) {
            // only interesting monsters here!
            const cm = crossroadsMonster();
            if (cm === moIvyRoot) buildIvy(c, 0, c.type);
            else c.monst = cm;
            if (cm === moWorm || cm === moTentacle)
              c.mondir = NODIR;
            c.hitpoints = palaceHP();
          }
        }
      }
      break;

    case laHaunted:
    case laHauntedBorder:
    case laHauntedWall:
      if (d === 7) {
        c.wall = waNone;

        clear_item(c); c.monst = moNone;

        if (hrand(100) < 25)
          c.wall = hrand(2) ? waBigTree : waSmallTree;

        else if (hrand(500) < 2 && ishept(c))
          c.wall = hrand(10) < 3 ? waFreshGrave : waAncientGrave;

        else {
          if (hrand(5000) < 30)
            c.item = itGreenStone;

          if (hrand_monster_in(c.land, 4000) < 10 + G.items[itLotus] + yendor_hardness() && !G.safety)
            c.monst = moGhost;

          const depth = getHauntedDepth(c);

          if (hrand(500 + depth) < depth - G.items[itLotus] && !G.safety && !G.peace_on)
            c.item = itLotus;
        }
      }
      break;

    case laCamelot:
      // generated mostly in moreBigStuff
      if (ls_single() && d === 0) {
        const r = roundTableRadius(c);
        if (r > 28 + 3 * G.items[itHolyGrail])
          G.items[itHolyGrail]++;
      }
      break;

    case laVariant: {
      // #if CAP_COMPLEX2
      const b = getBits(c);
      if (fargen) {
        let treasure_rate = 2;
        for (let i = 0; i < 21; i++) if ((b >> i) & 1) {
          treasure_rate += G.variant_features[i].rate_change;
          G.variant_features[i].build(c);
        }
        if (hrand(Math.max(100, 2000 - rebalance_treasure(G.kills[moVariantWarrior] * 5, 250, c.land))) < treasure_rate && !c.wall && !c.monst)
          c.item = itVarTreasure;
      }
      if (d === 7 && c.wall === waTrapdoor) {
        for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (among(c1.wall, waDeepWater, waBoat))
          c.wall = waNone; }
      }
      break;
      // #endif
    }

    case laEclectic: {

      if (d === 9) c.wall = waChasm;

      if (d === 8) wfc_schedule(c);

      if (d === 7) {
        // auto ce = wfc::centers;
        wfc_invoke();

        if (c.wall === waRose) c.wall = waNone;

        if (among(c.wall, waCharged, waSandstone)) {
          for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (c1.land !== laEclectic)
            c.wall = waNone; }
        }

        // (experiment: replace Roses with Ivy -- commented out in the original)

        if (c.wall === waPalace && hrand(100) < 50) {
          let ok = true;
          for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (among(c2.wall, waClosedGate, waOpenGate))
            ok = false; }
          if (ok) c.wall = waNone;
        }

        let locked = true;
        for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (!c1.wall) locked = false; }
        if (locked && !G.safety) c.item = itEclectic;

        if (c.wall === waNone && hrand_monster_in(c.land, 2500) < 30 + G.items[itEclectic] + yendor_hardness() && !G.safety)
          gen_eclectic_monster(c);
      }

      break;
    }

    case laDice: {
      // #if CAP_COMPLEX2
      if (fargen && !c.monst && !c.wall) {
        dice_generate_full(c, G.items[itDice] + yendor_hardness());
      }
      break;
    }

    case laCursed: {
      if (fargen && c.wall !== waRubble) {
        c.wall = waStone;
        for (let i = 0; i < 3; i++) {
          const ew = (c1: cell): number => {
            return getCdata(c1, i) & 64;
          };
          const val = ew(c);
          for (let k = 0; k < c.type; k++) { const c1 = createMov(c, k); if (ew(c1) !== val)
            c.wall = waNone; }
        }
      }
      if (d === 8) {
        if (c.wall === waNone) {
          let wals = 0;
          for (let k = 0; k < c.type; k++) { const c1 = createMov(c, k); if (c1.wall === waStone || c1.wall === waRubble || c1.land !== laCursed)
            wals++; }
          if (!wals) c.wall = waDeepWater;
        }
        if (c.wall === waStone && hrand(100) < 20)
          c.wall = waRubble;
      }
      if (d === 7 && c.wall === waDeepWater) {
        let lone = true;
        for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (c1.wall === waDeepWater) lone = false; }
        if (lone) c.wall = waEternalFire;
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        /* turrets */
        if (c.wall === waRubble) {
          let turret = true;
          for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (c1.wall !== waStone) turret = false; }
          if (turret) {
            if (hrand(100) < 80)
              c.wall = waStone;
            else {
              c.monst = moHexer;
              c.item = random_curse();
            }
            break;
          }
        }

        /* place curses on chokepoints */
        if (c.wall === waNone && !c.item) {
          let last_wall = true;
          let switches = 0;
          let border = false;
          for (let a = 0; a < 3; a++) for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue;
            if (c1.land !== laCursed) border = true;
            const wa = among(c1.wall, waStone, waRubble, waDeepWater, waEternalFire);
            if (wa !== last_wall) switches++;
            last_wall = wa;
          }
          switches = idiv(switches + 1, 3);

          if ((border || switches > 2) && hrand(100) < 50)
            c.item = pick(itCurseWeakness, itCurseDraining, itCurseWater, itCurseFatigue, itCurseRepulsion, itCurseGluttony);
        }

        if (!c.item && c.wall === waNone && hrand(2000) < 100 + rebalance_treasure(G.kills[moHexer], 50, c.land) && notDippingFor(itCursed))
          c.item = itCursed;

        if (hrand_monster_in(c.land, 2500) < 25 + G.items[itCursed] + yendor_hardness() && !G.safety)
          c.monst = moHexer;
      }
      break;
    }

    case laNone:
    case laBarrier:
    case laOceanWall:
    case laElementalWall:
    case laCanvas:
    case laPrincessQuest:
    case laMercuryRiver:
      // do nothing!
      break;

    case laDual:
      if (d === 7) {
        if (pseudohept(c))
          c.wall = waChasm;
        else {
          c.landparam = 1;
          if (S7() % 2 === 0) {
            c.landparam = 2;
            for (let i = 0; i < c.type; i++) { const c2 = createMov(c, i);
              if (c2.landparam === 2) c.landparam = 3;
              if (!pseudohept(c2)) for (let j = 0; j < c2.type; j++) { const c3 = createMov(c2, j); if (c3.landparam === 3) c.landparam = 3; }
            }
          }
          const hr = idiv(hrand(100), 5);
          if (hr === 0)
            c.wall = waTrapdoor;
          else if (hr === 1)
            c.wall = waSmallTree;
          else if (hr === 2)
            c.wall = waStone;
        }
      }
      if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) { // ONEMPTY
        if (hrand(5000) < rebalance_treasure(100 + 2 * G.kills[moRatling], 200, c.land) && notDippingFor(itGlowCrystal))
          c.item = itGlowCrystal;
        if (hrand_monster_in(c.land, 2000) < 2 * (G.items[itGlowCrystal] + yendor_hardness()))
          c.monst = moRatling;
      }
      break;

    case laMemory:
      if (d >= 7 && d <= 9) c.wall = waChasm;
      if (d === 7 && !c.monst && hrand(2000) < 4)
        if (!G.racing_on) // #if CAP_RACING
          c.monst = moGhost;
      break;

    case laAsteroids:
      if (d >= 7 && d <= 9) c.wall = waInvisibleFloor;
      break;

    case laWet:
      if (d === 7) {
        // if(wet::wetdata.empty()) wet::build_data();
        const wetwalls = [waNone, waNone, waDeepWater, waDeepWater, waDeepWater, waShallow, waShallow, waShallow, waStone, waStone];
        c.wall = wetwalls[hrand(10)]; // wet::wetdata[windmap::getId(c)]];
        if (G.randomPatternsMode) {
          let a = 0;
          if (randpattern(c, G.randompattern[c.land])) a++;
          if (randpattern(c, G.randompattern[laAsteroids])) a += 2;
          const wetwalls = [waNone, waShallow, waStone, waDeepWater];
          c.wall = wetwalls[a];
        }
        let border = false;
        if (ls_any_order()) for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (c1.land !== laWet) border = true; }
        if (border) {
          if (pseudohept(c)) c.wall = waDeepWater;
          else c.wall = waShallow;
        }
        if (among(c.wall, waDeepWater, waShallow) && hrand_monster_in(c.land, 4000) < 2 * (G.items[itWet] + yendor_hardness() + 5) && !G.safety)
          c.monst = hrand(100) >= 90 ? moRusalka : moPike;
        if (c.wall === waShallow && hrand(2000) < Math.min(rebalance_treasure(100 + G.kills[moPike] + G.kills[moRusalka], 150, c.land), 150) && notDippingFor(itWet) && !border && !G.safety)
          c.item = itWet;
      }
      break;

    case laFrog:
      if (d === 9) {
        if (G.randomPatternsMode ? randpattern(c, G.randompattern[c.land]) : !is_zebra_trapdoor(c)) {
          if (hrand(2000) < rebalance_treasure(100 + 2 * G.kills[moFrog] + 2 * G.kills[moPhaser] + 2 * G.kills[moVaulter], 100, c.land) && notDippingFor(itFrog)) {
            let ok = true;
            for (let i = 0; i < c.type; i++) { const c1 = createMov(c, i); if (c1.item) ok = false; }
            if (ok) {
              c.item = itFrog;
            }
          }
        }
        else if (!c.wall) {
          const i = hrand(10);
          if (i < 4) c.wall = waShrub;
          else if (i < 7) c.wall = waStone;
          else c.wall = waDeepWater;
        }
      }

      if (d === 7 && !G.safety) {
        if (c.wall === waNone) {
          if (hrand_monster_in(c.land, 2000) < ((G.cwt.at.land === laFrog || G.items[itFrog]) ? 20 : 0) + (G.items[itFrog] + yendor_hardness()))
            c.monst = pick(moFrog, moPhaser, moVaulter);
        }
      }
      break;

    case landtypes: break;
  }
}


// repair the buggy walls flowing in from another land, like ice walls flowing into the Caves

export function repairLandgen(c: cell): void {
  if (c.land === laCaves && c.wall !== waCavewall && c.wall !== waCavefloor)
    c.wall = waCavefloor;

  if (c.land === laDeadCaves && c.wall !== waDeadwall &&
    c.wall !== waDeadfloor && c.wall !== waDeadfloor2 && c.wall !== waEarthD)
    c.wall = waDeadfloor2;

  if (c.land === laCocytus && c.wall !== waFrozenLake && c.wall !== waLake && c.wall !== waIcewall)
    c.wall = waFrozenLake;

  if (c.land === laAlchemist && c.wall !== waFloorA && c.wall !== waFloorB)
    c.wall = waFloorA;

  if (c.wall === waIcewall && !among(c.land, laIce, laCocytus, laBlizzard, laEclectic))
    c.wall = waNone;

  if (c.wall === waRed3 && c.land !== laRedRock && c.land !== laSnakeNest && c.land !== laBrownian && c.land !== laEclectic)
    c.wall = waNone;

  if (c.item === itRedGem && c.land !== laRedRock)
    c.item = itNone;

  if (c.item === itRose && c.land !== laRose)
    c.item = itNone;

  if (c.wall === waChasmD) {
    chasmify(c);
  }

  if (c.wall === waEarthD) {
    chasmifyEarth(c);
  }

  if (c.wall === waElementalD) {
    chasmifyElemental(c);
  }

  if (passable(c, null!, 0n)) {
    if (c.land === laBarrier && WDIM() !== 3) c.wall = waBarrier;
    if (c.land === laOceanWall)
      c.wall = c.type === 7 ? waBarrier : waSea;
  }

  if (cellHalfvine(c)) {
    let i = -1;
    for (let k = 0; k < c.type; k++) if (c.move(k) && c.move(k).wall === c.wall)
      i = 0;
    if (i === -1) c.wall = waNone;
  }
}

// EX int randomwalk_size = 10: G.randomwalk_size

export function setland_randomwalk(c: cell): void {
  if (c.land) return;
  if (hrand(G.randomwalk_size) === 0) setland(c, random_land());
  else {
    let c2: cell | null = null;
    for (let i = 0; i < 10 && !(c2 && (!G.disksize || is_in_disk(c2)) && is_in_fractal(c2)); i++)
      c2 = c.cmove(hrand(c.type));
    setland_randomwalk(c2!);
    c.land = c2!.land;
  }
}

export function random_land(): eLand {
  let l = hrand_elt(isize(G.cheatdest_list) ? G.cheatdest_list : G.currentlands);
  if (l === laElementalWall) l = randomElementalLandWeighted();
  return l;
}

export function share_land(c: cell, c2: cell): void {
  if (!c2.land) setland(c2, random_land());
  c.land = c2.land;
}

// odd landscape_div are better
// EX int landscape_div = 25: G.landscape_div

export function set_land_for_geometry(c: cell): void {
  if (!c.land && isize(G.currentlands)) {
    if (G.land_structure === lsTotalChaos) {
      setland(c, random_land());
      return;
    }
    if (G.land_structure === lsLandscape) {
      if (G.landscape_div <= 0) G.landscape_div = 1;
      const a: number[] = [0, 0, 0];
      for (let i = 0; i < 3; i++) a[i] = getCdata(c, i);
      const ld = G.landscape_div;
      const ld2 = ld * 2;
      let sh = 0;
      for (let i = 0; i < 3; i++) {
        let x = a[i];
        x = gmod(x, ld2);
        if (x >= ld) sh += x - ld;
        else sh += ld - 1 - x;
      }
      for (let i = 0; i < 3; i++) {
        if (sh * 2 < ld * 3) a[i] = gdiv(a[i], ld2) * 2 + 1;
        else a[i] = gdiv(a[i] + ld, ld2) * 2;
      }
      // eLand& l = landscape_lands[make_array(a[0], a[1], a[2])]: map<array<int,3>, eLand> keyed by "a0,a1,a2"
      const key = `${a[0]},${a[1]},${a[2]}`;
      let l: eLand = G.landscape_lands.get(key) ?? laNone;
      if (l === laNone) l = random_land();
      G.landscape_lands.set(key, l);
      setland(c, l);
      return;
    }
    /* note: Nil patched chaos done in setLandNil */
    if (ls_patched_chaos() && (cgflags() & qFRACTAL) !== 0n) {
      share_land(c, fractal_rep(c));
    }
    else if (ls_patched_chaos() && stdeuc()) {
      let c2 = c;
      while (true) {
        let again = false;
        for (let i = 0; i < c2.type; i++) {
          const c3 = createMov(c2, i);
          if (cdist50(c3) < cdist50(c2)) { c2 = c3; again = true; break; }
        }
        if (again) continue;
        break;
      }
      share_land(c, c2);
      return;
    }
    if (ls_patched_chaos() && aperiodic()) {
      let c2: cell;
      if (hat_in())
        c2 = c.master.cmove(0).cmove(0).cmove(1).cmove(1).c7;
      else
        c2 = c.master.cmove(0).cmove(0).cmove(0).cmove(0).cmove(0).cmove(1).cmove(1).cmove(1).cmove(1).cmove(1).c7;
      share_land(c, c2);
      return;
    }
    if (G.land_structure === lsChaosRW) {
      setland_randomwalk(c);
      return;
    }
  }
  else if (ls_chaoticity() >= 60) { /* nothing */ }
  // CAP_CRYSTAL
  else if (cryst()) crystal_set_land(c);
  // MAXMDIM == 4
  else if (euc_in(3)) euc_set_land(c);
  else if (mhybrid()) setLandHybrid(c);
  else if (sphere() || (euclid() && closed_or_bounded())) setLandSphere(c);
  else if ((cgflags() & qFRACTAL) !== 0n) setland(c, G.specialland);
  else if (euclid()) setLandEuclid(c);
  else if (quotient()) { setland(c, G.specialland); setLandQuotient(c); }
  else if (sol()) setLandSol(c);
  else if (nil()) setLandNil(c);
  else if (weirdhyperbolic()) setLandWeird(c);
}

// EX hookset<bool(cell *c, int d, cell *from)> hooks_cellgen: G.hooks_cellgen

export function setdist(c: cell, d: number, from: cell): void {

  if (c === G.out_of_bounds) return;
  if (fake_in()) return fake_in_underlying_geometry(() => setdist(c, d, from));
  if (embedded_plane()) return geom3_in_flipped(() => setdist(c, d, from));

  if (d < -64) d = -64; /* otherwise it will underflow */
  if (c.mpdist <= d) return;
  if (c.mpdist > d + 1 && d < BARLEV()) setdist(c, d + 1, from);
  c.mpdist = d;

  // this fixes the following problem:
  // http://steamcommunity.com/app/342610/discussions/0/1470840994970724215/
  if (!G.generatingEquidistant && from && d >= 7 && c.land && !bt_in() && !arcm_in() && !cryst() && WDIM() === 2 && hyperbolic() && !arb_in()) {
    const cdi = celldist(c);
    if (celldist(from) > cdi) {
      for (let i = 0; i < c.type; i++) {
        const c2 = createMov(c, i);
        if (celldist(c2) < cdi) {
          setdist(c2, d, c);
          from = c2;
          break;
        }
      }
    }
  }

  if (d <= 10 - getDistLimit()) update_lastexplore();

  if (mhybrid()) {
    const wc = hybrid_get_where(c)[0];
    const wf = from ? hybrid_get_where(from)[0] : null!;
    if (c.land && !wc.land) wc.land = c.land;
    hybrid_in_underlying_geometry(() => setdist(wc, d, wf));
  }

  if (G.buggyGeneration) {
    if (d < BARLEV()) for (let i = 0; i < c.type; i++) {
      setdist(createMov(c, i), d + 1, c);
    }
    if (d >= BARLEV()) c.item = itBuggy2;
    return;
  }

  if (d >= BARLEV()) {

    // CAP_BT
    if (bt_in() && WDIM() === 3 && !c.land && !sn_in() && !mhybrid()) {
      let z = G.vid.binary_width;
      let cseek = c;
      const step = 0;
      if (G.geometry === gHoroHex) z *= 2;
      const scale = bt_expansion();
      while (z < 3.999 && step < 10) { cseek = cseek.cmove(bt_updir()); z *= scale; }
      if (cseek.master.emeraldval) setland(c, cseek.master.emeraldval);
    }

    if (!c.land && from && (WDIM() === 3 || !among(from.land, laBarrier, laElementalWall, laHauntedWall, laOceanWall)) && !quotient() && ls_chaoticity() < 60 && G.land_structure !== lsLandscape) {
      if (!hasbardir(c)) setland(c, from.land);
    }
    if (c.land === laTemple && ls_any_order()) setland(c, laRlyeh);

    if (!ls_single()) {
      if (c.land === laMountain) setland(c, laJungle);
      if (c.land === laClearing) setland(c, laOvergrown);
      if (c.land === laWhirlpool) setland(c, laOcean);
      if (c.land === laCamelot) setland(c, laCrossroads);
      if (c.land === laBrownian) setland(c, laOcean);
    }

    // CAP_DAILY = 0: if(true)
    {
      set_land_for_geometry(c);
    }
  }

  if (d === BARLEV() && c.land === laCanvas) {
    const col = ccolor_generateCanvas(c);
    c.landparam = col;
    c.wall = G.canvas_default_wall;
    if (col & 0x1000000) c.wall = waWaxWall;
  }

  // CAP_FIELD
  if (d >= BARLEV() - 1 && c.land === laPrairie && !ls_any_chaos() && !ls_hv_structure())
    prairie_spread(c, from);

  if (d < BARLEV() && c.land === laPrairie && !c.landparam && !ls_any_chaos() && !ls_hv_structure()) {
    // printf("d=%d/%d\n", d, BARLEV);
    raiseBuggyGeneration(c, "No landparam set");
    return;
  }

  let reduced_barlev = BARLEV();
  if (BARLEV() === 8 && G.cwt.at.master.alt)
    reduced_barlev = 7;

  if (d === reduced_barlev && !euclid() && c !== G.cwt.at)
    buildBigStuff(c, from);

  if (G.buggyGeneration) return;

  if (d < 10) {
    if (d >= 0) {
      G.explore[d]++;
      G.exploreland[d][c.land]++;
    }

    if (d < BARLEV()) {
      apply_precision_policy(c, from);
      const rev = (G.precision_policy & 1) !== 0 && !!G.currentmap.get_backmap() && hrand(2) !== 0;
      for (let i = 0; i < c.type; i++) {
        setdist(createMov(c, rev ? (c.type - 1 - i) : i), d + 1, c);
        if (G.buggyGeneration) return;
      }
    }

    const eqlevel = Math.max(BARLEV() - 2, 7);

    if (d === eqlevel && c.land === laOcean)
      buildEquidistant(c);

    if (d === eqlevel && inmirror(c))
      buildEquidistant(c);

    if (d === eqlevel && (c.land === laGraveyard || c.land === laHauntedBorder || c.land === laHaunted) && !G.tactic_on)
      buildEquidistant(c);
  }

  if (d <= 7 && (c.land === laGraveyard || c.land === laHauntedBorder) && !in_s2xe()) {
    // #define HAUNTED_RADIUS getDistLimit()
    c.land = (c.landparam >= 1 && c.landparam <= getDistLimit()) ? laHauntedBorder : laGraveyard;
  }

  if (d === 8 && isGravityLand(c.land)) {
    buildEquidistant(c);
  }

  // CAP_COMPLEX2
  if (d < BARLEV()) brownian_apply_futures(c);

  if (!c.monst) c.stuntime = 0;

  const big_first = ls_hv_structure();
  if (!big_first) giantLandSwitch(c, d, from);

  if (d === Math.min(reduced_barlev, 9)) moreBigStuff(c);

  if (big_first) giantLandSwitch(c, d, from);

  if (d === 7) repairLandgen(c);

  // the number of tiles in the standard geometry has about 7553 digits!
  let gdist = Math.abs(c.master.distance);
  if (gdist > global_distance_limit && hyperbolic() && !quotient()) {
    gdist -= global_distance_limit;
    if (d === 8 && hrand(100) < gdist) {
      if (!isMultitile(c)) c.monst = moNone;
      if (!do_not_touch_this_wall(c)) {
        setland(c, laMemory);
        c.wall = waChasm;
        c.item = itNone;
      }
    }
    if (d === 7 && c.land === laMemory) {
      if (hrand(100) < 5) {
        c.wall = waTrapdoor; c.item = itOrbSafety;
      }
      else if (hrand(100) < 2) {
        c.monst = moWorldTurtle; c.wall = waNone; c.hitpoints = 5;
      }
    }
  }

  if ((G.disksize && !is_in_disk(c)) || ((cgflags() & qFRACTAL) !== 0n && !is_in_fractal(c))) {
    setland(c, laMemory);
    if (!isMultitile(c)) c.monst = moNone;
    c.item = itNone;
    c.wall = waChasm;
  }

  // ONEMPTY: if(d == 7 && passable(c, NULL, 0) && !safety && !reptilecheat)
  if (d === 7 && passable(c, null!, 0n) && !G.safety && !G.reptilecheat) if (!c.item) {
    if (isCrossroads(c.land))
      placeCrossroadOrbs(c);
    else
      placeLocalOrbs(c);
    // CAP_CRYSTAL
    if (cryst() && c.land !== laMinefield)
      crystal_may_place_compass(c);
  }

  callhandlers(false, G.hooks_cellgen, c, d, from);

  if (PURE() && c.wall === waMirrorWall && c.land === laMirror)
    c.land = laMirrorWall; // , c->item = itPirate; // not really a proper bugfix

  if (d === 7) playSeenSound(c);

  // CAP_EDIT
  if (d >= 7 && G.patterns_whichPattern)
    mapeditor_applyModelcell(c);
}

// #undef hrand_monster
