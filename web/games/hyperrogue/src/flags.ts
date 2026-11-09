// flags.cpp of HyperRogue 13.1o: simple flags of lands, items, monsters and walls. Package P2.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names (PORTING.md, "Overloads"):
// * the ANYFLAGCHECK macros define `name(enum)` and `name(cell*)`; here one function takes either
//   (`isWatery(w)` or `isWatery(c)`: a number is the enum, a cell reads its field). `isFriendly` likewise.
// * classflag(eItem) = `classflag`, classflag(eWall) = `classflag_w`, classflag(eMonster) = `classflag_m`,
//   classflag(eLand) = `classflag_l`.
// * isDie(eMonster) = `isDie`, isDie(eWall) = `isDie_w`.
import { G } from './globals.ts';
import { among } from './hyper.ts';
import type { cell } from './locations.ts';
import {
  type eItem, type eLand, type eMonster, type eWall, type flagtype, type eSlimegroup,
  iinf, winf, minf, linf,
  WF_WATER, WF_BOAT, WF_CHASM, WF_NOFLIGHT, WF_FIRE, WF_THUMPER, WF_ACTIVABLE, WF_TIMEOUT, WF_CISLAND,
  WF_HALFVINE, WF_ALCHEMY, WF_RED, WF_WALL, WF_NONBLOCK, WF_PUSHABLE, WF_CONE, WF_STDTREE, WF_GRAVE, WF_REPTILE,
  WF_HEATCOLOR, WF_THORNY,
  LF_GENERATE_ALL, LF_ICY, LF_GRAVITY, LF_EQUI, LF_WARPED, LF_CYCLIC, LF_TECHNICAL, LF_MIRROR, LF_SEA, LF_COASTAL,
  LF_PURESEA, LF_ELEMENTAL, LF_HAUNTED, LF_TROLL, LF_INMIRROR, LF_INMIRRORORWALL, LF_ELECTRIC,
  CF_NOGHOST, CF_RAIDER, CF_MIMIC, CF_PRINCESS, CF_GOK, CF_NONLIVING, CF_METAL, CF_STUNNABLE, CF_HP, CF_MOUNTABLE,
  CF_FRIENDLY, CF_PLAYER, CF_BUG, CF_IVY, CF_PART, CF_MUTANTIVY, CF_ANYIVY, CF_BULLET, CF_DEMON, CF_WORM, CF_WITCH,
  CF_BIRD, CF_SLOWMOVER, CF_MAGNETIC, CF_SWITCH, CF_GHOST, CF_SHARK, CF_SLIME, CF_DRAGON, CF_KRAKEN, CF_NOBLOW,
  CF_MULTITILE, CF_LEADER, CF_FLYING, CF_ATTACK_THRU_VINE, CF_ATTACK_NONADJACENT, CF_NOHIGHLIGHT, CF_INACTIVE,
  CF_UNARMED, CF_IGNORE_PLATE, CF_BULL, CF_TROLL, CF_IGNORE_SMELL, CF_RATLING, CF_GHOSTMOVER, CF_POWER, CF_FACING,
  CF_FROG, CF_HIGH_THREAT, CF_SPAM,
  IF_SHARD, IF_FIREPROOF, IF_PROTECTION, IF_EMPATHY, IF_RANGED, IF_REVIVAL,
  waBoat, waNone, waMagma, waMirror, waCloud, waTrapdoor, waChasm, waGlass, waBarrier, waMirrorWall, waEditStatue,
  waClosedGate, waInvisibleFloor, waReptile, waShallow, waReptileBridge, waGargoyleFloor, waGargoyleBridge,
  waTempFloor, waTempBridge, waPetrifiedBridge, waFrozenLake, waRose, waRoundTable, waWarpGate, waRichDie,
  waHappyDie, waMineMine, waFire,
  laLivefjord, laOcean, laMotion, laEFire, laEWater, laEAir, laEEarth, laBrownian, laDryForest, laPower,
  laMinefield, laElementalWall, laIce, laDesert, laDeadCaves, laOvergrown, laDice, laOceanWall,
  moNone, moTentacleGhost, moFireElemental, moWaterElemental, moAirElemental, moEarthElemental, moPlayer,
  moGreaterM, moLesserM, moGreater, moLesser, moCrystalSage, moCrusher, moShark, moGreaterShark, moCShark,
  moWitchGhost, moShadow, moMutant, moFriendlyIvy, moPike, moRusalka, moTortoise, moWitchWinter, moBomberbird,
  moTameBomberbird, moTameBomberbirdMoved, moSkeleton, moDraugr, moFrog, moPhaser, moVaulter, moRagingBull,
  moSleepBull, moHerdBull, moButterfly, moHedge, moFlailer, moVizier, moReptile, moSalamander, moPair, moAltDemon,
  moHexDemon, moMonk, moNorthPole, moSouthPole, moAnimatedDie, moAngryDie, moMimic, moIllusion,
  itNone, itFireShard, itOrbDiscord, itOrbAether, itOrbPsi, itOrbDragon, itOrbTeleport, itOrbIllusion, itOrbSpace,
  itOrbAir, itOrbFrog, itOrbSummon, itOrbMatter, itRevolver, itOrbStunning, itStrongWind, itOrbDomination,
  itOrbNature, itOrbDash, itOrbMorph, itOrbPhasing, itOrbFish, itOrbWinter, itOrbBeauty, itOrbShield,
} from './content.ts';
import { player_indices, playerpos } from './pcmove.ts';
import { sameMonster } from './game.ts';
import { markOrb, markEmpathy, markOrb2, markEmpathy2 } from './orbs.ts';
import { realstuntime } from './monstermove.ts';
import { attackJustStuns } from './attack.ts';
import { brownian_level } from './complex2.ts';
import { smallbounded } from './classes.ts';
import { AF_NORMAL } from './hyper.ts';
import { SIDE_INFDEEP, SIDE_DEEP, SIDE_SHALLOW, SIDE_WATERLEVEL, SIDE_FLOOR, SIDE_RED1, SIDE_RED2, SIDE_RED3, SIDE_WALL } from './geometry.ts';
import type { spatial_info } from './celldrawer.ts';

// --- #if HDR: classflag and the FLAGCHECK macros ---

export function classflag(it: eItem): flagtype { return iinf[it].flags; }
export function classflag_w(w: eWall): flagtype { return winf[w].flags; }
export function classflag_m(m: eMonster): flagtype { return minf[m].flags; }
export function classflag_l(l: eLand): flagtype { return linf[l].flags; }

function W(x: eWall | cell): eWall { return typeof x === 'number' ? x : x.wall; }
function L(x: eLand | cell): eLand { return typeof x === 'number' ? x : x.land; }
function M(x: eMonster | cell): eMonster { return typeof x === 'number' ? x : x.monst; }
function I(x: eItem | cell): eItem { return typeof x === 'number' ? x : x.item; }

function wf(x: eWall | cell, f: flagtype): boolean { return (winf[W(x)].flags & f) !== 0n; }
function lf(x: eLand | cell, f: flagtype): boolean { return (linf[L(x)].flags & f) !== 0n; }
function mf(x: eMonster | cell, f: flagtype): boolean { return (minf[M(x)].flags & f) !== 0n; }
function itf(x: eItem | cell, f: flagtype): boolean { return (iinf[I(x)].flags & f) !== 0n; }

// WALLFLAGCHECK
export function isWatery(w: eWall | cell): boolean { return wf(w, WF_WATER); }
export function isBoat(w: eWall | cell): boolean { return wf(w, WF_BOAT); }
export function isChasmy(w: eWall | cell): boolean { return wf(w, WF_CHASM); }
export function isWateryOrBoat(w: eWall | cell): boolean { return wf(w, WF_WATER) || W(w) === waBoat; }
export function isNoFlight(w: eWall | cell): boolean { return wf(w, WF_NOFLIGHT); }
export function isFire(w: eWall | cell): boolean { return wf(w, WF_FIRE); }
export function isThumper(w: eWall | cell): boolean { return wf(w, WF_THUMPER); }
export function isActivable(w: eWall | cell): boolean { return wf(w, WF_ACTIVABLE); }
export function hasTimeout(w: eWall | cell): boolean { return wf(w, WF_TIMEOUT); }
export function isOnCIsland(w: eWall | cell): boolean { return wf(w, WF_CISLAND); }
export function cellHalfvine(w: eWall | cell): boolean { return wf(w, WF_HALFVINE); }
export function isAlch(w: eWall | cell): boolean { return wf(w, WF_ALCHEMY); }
export function isAlchAny(w: eWall | cell): boolean { return wf(w, WF_ALCHEMY); }
export function realred(w: eWall | cell): boolean { return wf(w, WF_RED); }
export function isWall(w: eWall | cell): boolean { return wf(w, WF_WALL); }
export function isNonblock(w: eWall | cell): boolean { return wf(w, WF_NONBLOCK); }
export function isPushable(w: eWall | cell): boolean { return wf(w, WF_PUSHABLE); }
export function conegraphtype(w: eWall | cell): boolean { return wf(w, WF_CONE); }
export function isStandardTree(w: eWall | cell): boolean { return wf(w, WF_STDTREE); }
export function isGrave(w: eWall | cell): boolean { return wf(w, WF_GRAVE); }
export function isReptile(w: eWall | cell): boolean { return wf(w, WF_REPTILE); }
export function useHeatColoring(w: eWall | cell): boolean { return wf(w, WF_HEATCOLOR); }
export function isThorny(w: eWall | cell): boolean { return wf(w, WF_THORNY); }

// LANDFLAGCHECK
export function generateAll(l: eLand | cell): boolean { return lf(l, LF_GENERATE_ALL); }
export function isIcyLand(l: eLand | cell): boolean { return lf(l, LF_ICY); }
export function isGravityLand(l: eLand | cell): boolean { return lf(l, LF_GRAVITY); }
export function isEquidLand(l: eLand | cell): boolean { return lf(l, LF_EQUI); }
export function isWarpedType(l: eLand | cell): boolean { return lf(l, LF_WARPED); }
export function isCyclic(l: eLand | cell): boolean { return lf(l, LF_CYCLIC); }
export function isTechnicalLand(l: eLand | cell): boolean { return lf(l, LF_TECHNICAL); }
export function is_mirrorland(l: eLand | cell): boolean { return lf(l, LF_MIRROR); }
export function isSealand(l: eLand | cell): boolean { return lf(l, LF_SEA); }
export function isCoastal(l: eLand | cell): boolean { return lf(l, LF_COASTAL); }
export function isPureSealand(l: eLand | cell): boolean { return lf(l, LF_PURESEA); }
export function isElemental(l: eLand | cell): boolean { return lf(l, LF_ELEMENTAL); }
export function isHaunted(l: eLand | cell): boolean { return lf(l, LF_HAUNTED); }
export function isTrollLand(l: eLand | cell): boolean { return lf(l, LF_TROLL); }
export function inmirror(l: eLand | cell): boolean { return lf(l, LF_INMIRROR); }
export function inmirrororwall(l: eLand | cell): boolean { return lf(l, LF_INMIRRORORWALL); }
export function isElectricLand(l: eLand | cell): boolean { return lf(l, LF_ELECTRIC); }

// MONFLAGCHECK
export function isGhostable(m: eMonster | cell): boolean { return !mf(m, CF_NOGHOST); }
export function isRaider(m: eMonster | cell): boolean { return mf(m, CF_RAIDER); }
export function isMimic(m: eMonster | cell): boolean { return mf(m, CF_MIMIC); }
export function isPrincess(m: eMonster | cell): boolean { return mf(m, CF_PRINCESS); }
export function isGolemOrKnight(m: eMonster | cell): boolean { return mf(m, CF_GOK); }
export function isNonliving(m: eMonster | cell): boolean { return mf(m, CF_NONLIVING); }
export function isMetalBeast(m: eMonster | cell): boolean { return mf(m, CF_METAL); }
export function isStunnable(m: eMonster | cell): boolean { return mf(m, CF_STUNNABLE); }
export function hasHitpoints(m: eMonster | cell): boolean { return mf(m, CF_HP); }
export function isMountable(m: eMonster | cell): boolean { return mf(m, CF_MOUNTABLE); }
export function isFriendlyType(m: eMonster | cell): boolean { return mf(m, CF_FRIENDLY); }
export function isFriendlyOrPlayer(m: eMonster | cell): boolean { return mf(m, CF_FRIENDLY | CF_PLAYER); }
export function isBug(m: eMonster | cell): boolean { return mf(m, CF_BUG); }
export function isIvy(m: eMonster | cell): boolean { return mf(m, CF_IVY); }
export function isMonsterPart(m: eMonster | cell): boolean { return mf(m, CF_PART); }
export function isMutantIvy(m: eMonster | cell): boolean { return mf(m, CF_MUTANTIVY); }
export function isAnyIvy(m: eMonster | cell): boolean { return mf(m, CF_ANYIVY); }
export function isBulletType(m: eMonster | cell): boolean { return mf(m, CF_BULLET); }
export function isDemon(m: eMonster | cell): boolean { return mf(m, CF_DEMON); }
export function isWorm(m: eMonster | cell): boolean { return mf(m, CF_WORM); }
export function isWitch(m: eMonster | cell): boolean { return mf(m, CF_WITCH); }
export function isAngryBird(m: eMonster | cell): boolean { return mf(m, CF_BIRD) && !mf(m, CF_FRIENDLY); }
export function isBird(m: eMonster | cell): boolean { return mf(m, CF_BIRD); }
export function slowMover(m: eMonster | cell): boolean { return mf(m, CF_SLOWMOVER); }
export function isMagneticPole(m: eMonster | cell): boolean { return mf(m, CF_MAGNETIC); }
export function isSwitch(m: eMonster | cell): boolean { return mf(m, CF_SWITCH); }
export function isGhost(m: eMonster | cell): boolean { return mf(m, CF_GHOST); }
export function isShark(m: eMonster | cell): boolean { return mf(m, CF_SHARK); }
export function isSlimeMover(m: eMonster | cell): boolean { return mf(m, CF_SLIME); }
export function isDragon(m: eMonster | cell): boolean { return mf(m, CF_DRAGON); }
export function isKraken(m: eMonster | cell): boolean { return mf(m, CF_KRAKEN); }
export function isBlowableMonster(m: eMonster | cell): boolean { return !mf(m, CF_NOBLOW); }
export function isMultitile(m: eMonster | cell): boolean { return mf(m, CF_MULTITILE); }
export function isLeader(m: eMonster | cell): boolean { return mf(m, CF_LEADER); }
export function isFlyingType(m: eMonster | cell): boolean { return mf(m, CF_FLYING); }
export function attackThruVine(m: eMonster | cell): boolean { return mf(m, CF_ATTACK_THRU_VINE); }
export function attackNonAdjacent(m: eMonster | cell): boolean { return mf(m, CF_ATTACK_NONADJACENT); }
export function noHighlight(m: eMonster | cell): boolean { return mf(m, CF_NOHIGHLIGHT); }
export function isInactiveEnemyType(m: eMonster | cell): boolean { return mf(m, CF_INACTIVE); }
export function isUnarmed(m: eMonster | cell): boolean { return mf(m, CF_UNARMED); }
export function ignoresPlatesType(m: eMonster | cell): boolean { return mf(m, CF_IGNORE_PLATE); }
export function isBull(m: eMonster | cell): boolean { return mf(m, CF_BULL); }
export function isTroll(m: eMonster | cell): boolean { return mf(m, CF_TROLL); }
export function ignoresSmellType(m: eMonster | cell): boolean { return mf(m, CF_IGNORE_SMELL); }
export function isRatling(m: eMonster | cell): boolean { return mf(m, CF_RATLING); }
export function isGhostMover(m: eMonster | cell): boolean { return mf(m, CF_GHOSTMOVER); }
export function isPowerMonster(m: eMonster | cell): boolean { return mf(m, CF_POWER); }
export function hasFacing(m: eMonster | cell): boolean { return mf(m, CF_FACING); }
export function isFrog(m: eMonster | cell): boolean { return mf(m, CF_FROG); }

// ITEMFLAGCHECK
export function isElementalShard(i: eItem | cell): boolean { return itf(i, IF_SHARD); }
export function itemBurns(i: eItem | cell): boolean { return !itf(i, IF_FIREPROOF); }
export function isProtectionOrb(i: eItem | cell): boolean { return itf(i, IF_PROTECTION); }
export function isEmpathyOrb(i: eItem | cell): boolean { return itf(i, IF_EMPATHY); }
export function isRangedOrb(i: eItem | cell): boolean { return itf(i, IF_RANGED); }
export function isRevivalOrb(i: eItem | cell): boolean { return itf(i, IF_REVIVAL); }

// watery

export function boatStrandable(c: cell): boolean {
  return c.wall === waNone && (c.land === laLivefjord || c.land === laOcean);
}

// monster/wall types

export function isFireOrMagma(w: cell): boolean {
  return isFire(w) || w.wall === waMagma;
}

export function mirrorcolor(mirrored: boolean): number {
  return winf[mirrored ? waMirror : waCloud].color;
}

export function isMounted(c: cell): boolean {
  if (c && c.monst && c.monst !== moTentacleGhost && isMountable(c.monst)) {
    for (const i of player_indices()) {
      if (playerpos(i).monst && sameMonster(c, playerpos(i)))
        return true;
      if (G.lastmountpos[i] && G.lastmountpos[i].monst && sameMonster(c, G.lastmountpos[i]))
        return true;
    }
  }
  return false;
}

export function itemclass(it: eItem): number { return iinf[it].itemclass; }

/** isFriendly(eMonster m) and isFriendly(cell *c) */
export function isFriendly(x: eMonster | cell): boolean {
  if (typeof x === 'number') return isFriendlyType(x);
  const c = x;
  return isMounted(c) || isFriendly(c.monst);
}

// enum eThreatLevel (hyper.h)
export const tlNoThreat = 0, tlSpam = 1, tlNormal = 2, tlHighThreat = 3;
export type eThreatLevel = number;

export function get_threat_level(c: cell): eThreatLevel {
  if (!c.monst) return tlNoThreat;
  if (isFriendly(c)) return tlNoThreat;
  if ((classflag_m(c.monst) & CF_HIGH_THREAT) !== 0n) return tlHighThreat;
  if ((classflag_m(c.monst) & CF_SPAM) !== 0n) return tlSpam;
  return tlNormal;
}

export function isFriendlyOrBug(c: cell): boolean { // or killable discord!
  // do not attack the stunned Princess
  if (isPrincess(c.monst) && c.stuntime) return false;
  return isFriendly(c) || isBug(c) || (!!c.monst && markOrb(itOrbDiscord) && !c.stuntime);
}

export function cellUnstable(c: cell): boolean {
  return (c.land === laMotion && c.wall === waNone) || c.wall === waTrapdoor;
}

export function cellUnstableOrChasm(c: cell): boolean {
  return (c.land === laMotion && c.wall === waNone) ||
    c.wall === waChasm || c.wall === waTrapdoor;
}

export function elementalOf(l: eLand): eMonster {
  if (l === laEFire) return moFireElemental;
  if (l === laEWater) return moWaterElemental;
  if (l === laEAir) return moAirElemental;
  if (l === laEEarth) return moEarthElemental;
  return moNone;
}

export function localshardof(l: eLand): eItem {
  return itFireShard + (l - laEFire);
}

export function snakelevel(c: cell): number {
  // CAP_COMPLEX2
  if (c.land === laBrownian && among(c.wall, waNone, waMineMine, waFire))
    return Math.min(Math.trunc(c.landparam / brownian_level), 3);
  return winf[c.wall].snakelevel;
}

// from-to

export function slimegroup(c: cell): eSlimegroup {
  return winf[c.wall].sg;
}

export function isFlying(m: eMonster): boolean {
  return isFlyingType(m) || checkOrb(m, itOrbAether);
}

export function survivesChasm(m: eMonster): boolean {
  return isFlying(m) || isAnyIvy(m);
}

export function ignoresPlates(m: eMonster): boolean {
  return ignoresPlatesType(m) || isFlying(m);
}

export function isInactiveEnemy(w: cell, forwho: eMonster): boolean {
  if (forwho !== moPlayer) {
    if (w.monst === moGreaterM || w.monst === moLesserM) return false;
    if (w.monst === moGreater || w.monst === moLesser) return true;
  }
  if (isInactiveEnemyType(w.monst)) return true;
  if (w.monst && ((forwho === moPlayer) ? realstuntime(w) !== 0 : realstuntime(w) > 1) && !isFriendly(w))
    return true;
  return false;
}

// forpc = true (for PC), false (for golems)
export function isActiveEnemy(w: cell, forwho: eMonster): boolean {
  if (((forwho === moPlayer) ? realstuntime(w) !== 0 : realstuntime(w) > 1))
    return false;
  if (w.monst === G.passive_switch) return false;
  if (w.monst === moNone) return false;
  if (isFriendly(w)) return false;
  if (isInactiveEnemy(w, forwho)) return false;
  return true;
}

export function isArmedEnemy(w: cell, forwho: eMonster): boolean {
  return w.monst !== moCrystalSage && w.monst !== moCrusher && isActiveEnemy(w, forwho);
}

export function eternalFire(c: cell): boolean {
  return c.land === laDryForest || (c.land === laPower && !smallbounded()) || c.land === laMinefield ||
    c.land === laEFire || c.land === laElementalWall;
}

export function haveRangedOrb(): boolean {
  const items = G.items;
  return !!(
    items[itOrbPsi] || items[itOrbDragon] || items[itOrbTeleport] ||
    items[itOrbIllusion] || items[itOrbSpace] || items[itOrbAir] ||
    items[itOrbFrog] || items[itOrbSummon] || items[itOrbMatter] ||
    items[itRevolver] || items[itOrbStunning] || items[itStrongWind] ||
    items[itOrbDomination] || items[itOrbNature] || items[itOrbDash] ||
    items[itOrbMorph] || items[itOrbPhasing]);
}

export function isGhostAether(m: eMonster): boolean {
  return isGhost(m) || checkOrb(m, itOrbAether);
}

export function survivesWater(m: eMonster): boolean {
  return (
    m === moShark || m === moGreaterShark || m === moCShark ||
    isGhostAether(m) || m === moWitchGhost || m === moShadow ||
    isBird(m) || m === moWaterElemental || m === moAirElemental ||
    isWorm(m) || isIvy(m) || isDragon(m) || isKraken(m) ||
    m === moMutant || m === moFriendlyIvy ||
    checkOrb(m, itOrbFish) ||
    among(m, moPike, moRusalka) ||
    m === moTortoise); // Tortoises and Ivies survive, but don't go through water
}

// survives Mercury or Sulphur or Lava
export function survivesPoison(m: eMonster, _p: eWall): boolean {
  return (
    isGhostAether(m) || m === moWitchGhost || m === moShadow ||
    isBird(m) || m === moAirElemental || isDragon(m) || isWorm(m));
}

// flying even if stunned
export function isPermanentFlying(m: eMonster): boolean {
  return m === moAirElemental || isGhostAether(m);
}

export function isLuckyLand(l: eLand): boolean {
  return among(l, laIce, laDesert, laDeadCaves, laOvergrown, laDice);
}

export function survivesFire(m: eMonster): boolean {
  return (
    isGhostAether(m) || m === moWitchWinter || m === moWitchGhost ||
    m === moBomberbird || m === moTameBomberbird || m === moTameBomberbirdMoved ||
    checkOrb(m, itOrbWinter) || m === moFireElemental ||
    isDragon(m) || m === moShadow);
}

export function survivesWall(m: eMonster): boolean {
  return isGhostAether(m);
}

export function survivesThorns(m: eMonster): boolean {
  return isGhostAether(m) || m === moSkeleton || m === moDraugr;
}

export function survivesFall(m: eMonster): boolean {
  return isBird(m) || m === moAirElemental || m === moSkeleton || isDragon(m) || m === moShadow || isGhostAether(m);
}

export function checkOrb(m1: eMonster, orb: eItem): boolean {
  if (m1 === moPlayer) return markOrb(orb);
  if (isFriendly(m1)) return markEmpathy(orb);
  return false;
}

export function checkOrb2(m1: eMonster, orb: eItem): boolean {
  if (m1 === moPlayer) return markOrb2(orb);
  if (isFriendly(m1)) return markEmpathy2(orb);
  return false;
}

export function ignoresSmell(m: eMonster): boolean {
  return ignoresSmellType(m) || checkOrb(m, itOrbBeauty) || checkOrb(m, itOrbAether) || checkOrb(m, itOrbShield);
}

export function highwall(c: cell): boolean {
  if (c.wall === waGlass) return false;
  if (G.wmescher && G.wmspatial && c.wall === waBarrier && c.land === laOceanWall)
    return false;
  // if(wmspatial && isTree(c)) return false;
  if (isGrave(c.wall)) return true;
  if (c.wall === waMirrorWall) return false;
  if (c.wall === waEditStatue) return false;
  return winf[c.wall].glyph === 35 /* '#' */ || c.wall === waClosedGate;
}

export function get_spatial_info(c: cell): spatial_info {
  const F = (x: number): number => 1 << x; // #define F(x) Flag((int) SIDE::x), stored in int levels
  if (cellUnstable(c))
    return { top: SIDE_FLOOR, deep: SIDE_FLOOR, levels: 0, sl: 0 };
  if (c.wall === waChasm || c.wall === waInvisibleFloor)
    return { top: SIDE_INFDEEP, deep: SIDE_INFDEEP, levels: 0, sl: 0 };
  if (c.wall === waBarrier && G.wmescher && c.land === laOceanWall)
    return { top: SIDE_WATERLEVEL, deep: SIDE_DEEP, levels: F(SIDE_DEEP), sl: 0 };
  if (c.wall === waReptile)
    return { top: SIDE_FLOOR, deep: SIDE_FLOOR, levels: F(SIDE_FLOOR) | F(SIDE_DEEP), sl: 0 };
  if (c.wall === waShallow)
    return { top: SIDE_WATERLEVEL, deep: SIDE_SHALLOW, levels: F(SIDE_SHALLOW) | F(SIDE_DEEP), sl: 0 };
  if (isWateryOrBoat(c) || isChasmy(c))
    return { top: SIDE_WATERLEVEL, deep: SIDE_DEEP, levels: F(SIDE_DEEP), sl: 0 };
  if (among(c.wall, waReptileBridge, waGargoyleFloor, waGargoyleBridge, waTempFloor, waTempBridge, waPetrifiedBridge, waFrozenLake))
    return { top: SIDE_WATERLEVEL, deep: SIDE_DEEP, levels: F(SIDE_WATERLEVEL) | F(SIDE_DEEP), sl: 0 };
  const slev = snakelevel(c);
  if (slev === 1)
    return { top: SIDE_RED1, deep: SIDE_RED1, levels: F(SIDE_RED1) | F(SIDE_FLOOR) | F(SIDE_WATERLEVEL) | F(SIDE_SHALLOW) | F(SIDE_DEEP), sl: 1 };
  if (slev === 2)
    return { top: SIDE_RED2, deep: SIDE_RED2, levels: F(SIDE_RED1) | F(SIDE_RED2) | F(SIDE_FLOOR) | F(SIDE_WATERLEVEL) | F(SIDE_SHALLOW) | F(SIDE_DEEP), sl: 2 };
  if (slev === 3)
    return { top: SIDE_RED3, deep: SIDE_RED3, levels: F(SIDE_RED1) | F(SIDE_RED2) | F(SIDE_RED3) | F(SIDE_FLOOR) | F(SIDE_WATERLEVEL) | F(SIDE_SHALLOW) | F(SIDE_DEEP), sl: 3 };
  if (highwall(c) && !conegraph(c) && c.wall !== waRose && c.wall !== waClosedGate)
    return { top: SIDE_WALL, deep: SIDE_WALL, levels: F(SIDE_WALL) | F(SIDE_FLOOR) | F(SIDE_WATERLEVEL) | F(SIDE_SHALLOW) | F(SIDE_DEEP), sl: 0 };
  return { top: SIDE_FLOOR, deep: SIDE_FLOOR, levels: F(SIDE_FLOOR) | F(SIDE_WATERLEVEL) | F(SIDE_SHALLOW) | F(SIDE_DEEP), sl: 0 };
}

export function conegraph(c: cell): boolean {
  return ((G.wmescher && G.wmspatial) || G.wmascii3) && (conegraphtype(c) || (c.wall === waBarrier && c.land === laOceanWall));
}

/** Determine the power of a frog monster. Also used to determine whether monster is a frog. */
export function frog_power(m: eMonster): eItem {
  if (m === moFrog) return itOrbFrog;
  if (m === moPhaser) return itOrbPhasing;
  if (m === moVaulter) return itOrbDash;
  return itNone;
}

export function hornStuns(c: cell): boolean {
  const m = c.monst;
  return (
    m === moRagingBull || m === moSleepBull || m === moHerdBull ||
    m === moButterfly || m === moGreater || m === moGreaterM || m === moDraugr ||
    m === moHedge || m === moFlailer || m === moVizier || m === moReptile || m === moSalamander ||
    m === moPair || m === moAltDemon || m === moHexDemon || m === moMonk || m === moCrusher ||
    attackJustStuns(c, AF_NORMAL, moNone));
}

/** changing this wall for whatever reason may cause the game to crash */
export function do_not_touch_this_wall(c: cell): boolean {
  return among(c.wall, waMirrorWall, waBarrier, waRoundTable, waWarpGate);
}

export function is_paired(m: eMonster): boolean {
  return among(m, moPair, moNorthPole, moSouthPole);
}

export function isDie(m: eMonster): boolean {
  return among(m, moAnimatedDie, moAngryDie);
}

export function isDie_w(w: eWall): boolean {
  return among(w, waRichDie, waHappyDie);
}

export function looks_like_player(m: eMonster): boolean {
  return among(m, moPlayer, moMimic, moIllusion, moShadow);
}

export function halfvine_direction(c: cell): number {
  for (let t = 0; t < c.type; t++) if (c.move(t) && c.move(t).wall === c.wall) return t;
  return -1;
}
