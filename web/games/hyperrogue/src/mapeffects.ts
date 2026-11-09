// mapeffects.cpp of HyperRogue 13.1o: the routines handling the map effects. Package P5.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Overloads: toggleGates(cell *c, eWall type, int rad) keeps the name; toggleGates(cell *ct, eWall type) is
// `toggleGates_w`. The HDR template determinePush(cellwalker who, int subdir, const T& valid) is `determinePush`
// with valid a (movei) => boolean. HEAT(c) is c.LHU.heat; SEADIST/LANDDIST/CHAOSPARAM are LHU.bytes[0..2].
import { drawFireParticles, drawParticles, fallingFloorAnimation } from './animations.ts';
import { hat_in } from './aperiodic-hat.ts';
import { killMonster } from './attack.ts';
import { addMessage } from './basegraph.ts';
import { coastval } from './bigstuff.ts';
import { bt_in } from './binary-tiling.ts';
import { celldistAlt, neighborId, reverse_directions } from './cell.ts';
import { a4, closed_manifold, GOLDBERG, PURE, sphere, WDIM } from './classes.ts';
import { MELTCOLOR, windmap_at } from './complex.ts';
import {
  brownian_dissolve, brownian_dissolve_brownian, brownian_level, mine_auto_teleport_charges,
} from './complex2.ts';
import {
  caflWarp, type eMonster, type eWall, type flagtype, itCompass, itNone, itOrb37, itOrbDomination, itOrbGravity,
  itOrbWinter, laAlchemist, laBarrier, laBrownian, laBurial, laCanvas, laCaribbean, laCaves, laCocytus, laCursed,
  laDeadCaves, laDesert, laDocks, laDual, laDungeon, laEclectic, laEmerald, laEndorian, laFrog, laHunting,
  laIvoryTower, laKraken, laLivefjord, laMercuryRiver, laMinefield, laMotion, laMountain, laNone, laOcean,
  laOceanWall, laRedRock, laRuins, laSnakeNest, laTerracotta, laVariant, laVolcano, laWarpSea, laWestWall, laWet,
  laWhirlpool, laWildWest, laZebra, moBrownBug, moDarkTroll, moHexSnake, moNone, moPlayer, moPrincess, moReptile,
  waAncientGrave, waArrowTrap, waBarrier, waBarrowDig, waBarrowWall, waBigBush, waBigStatue, waBigTree, waBoat,
  waBurningDock, waCanopy, waCavefloor, waCavewall, waChasm, waCIsland, waCIsland2, waClosedGate, waClosePlate,
  waColumn, waCTree, waDeadfloor, waDeadfloor2, waDeadTroll, waDeadTroll2, waDeadwall, waDeepWater, waDock, waDune,
  waEarthD, waEternalFire, waExplosiveBarrel, waFan, waFire, waFireTrap, waFloorA, waFloorB, waFreshGrave,
  waFrozenLake, waGargoyle, waGargoyleBridge, waGargoyleFloor, waGiantRug, waIcewall, waInvisibleFloor, waLadder,
  waLake, waMagma, waMercury, waMetal, waMineMine, waMineOpen, waMineUnknown, waNone, waOpenGate, waOpenPlate,
  waPalace, waPartialFire, waPetrified, waPetrifiedBridge, waPlatform, waRed1, waRed2, waRed3, waReptileBridge,
  waRose, waRoundTable, waRubble, waRuinWall, waSaloon, waSandstone, waSea, waShallow, waSmallBush, waSmallTree,
  waSolidBranch, waStone, waStrandedBoat, waTempBridge, waTempBridgeBlocked, waTempFloor, waThumperOff, waThumperOn,
  waTower, waTrapdoor, waTrunk, waVineHalfA, waVineHalfB, waVinePlant, waWaxWall, waWeakBranch, winf,
} from './content.ts';
import { i8, idiv } from './cpp.ts';
import { parent_id } from './expansion.ts';
import {
  cellHalfvine, cellUnstable, cellUnstableOrChasm, eternalFire, ignoresPlates, inmirrororwall, is_paired, isAlch,
  isAlchAny, isAnyIvy, isChasmy, isElemental, isFire, isGravityLand, isIcyLand, isMultitile, isReptile, isSealand,
  isWall, isWarpedType, isWatery, isWateryOrBoat, isWorm, itemBurns, snakelevel,
} from './flags.ts';
import { G } from './globals.ts';
import { gp_dist_3 } from './goldberg.ts';
import { its, pick123 } from './hprint.ts';
import { among, gmod, INFD, MF_IVY, MF_STUNNED, PINFD } from './hyper.ts';
import { ls_any_chaos, ls_hv_structure } from './landlock.ts';
import { spI, XLAT } from './language.ts';
import { cell, celllister, cellwalker, movei, NO_SPACE, NODIR } from './locations.ts';
import { reptilemax } from './monstergen.ts';
import { angledist_n } from './monstermove.ts';
import { markOrb } from './orbs.ts';
import {
  againstCurrent, againstWind, anti_alchemy, P_DEADLY, P_MIRROR, P_MONSTER, passable, placeWater,
} from './passable.ts';
import { ccolor_generateCanvas, warptype } from './pattern2.ts';
import { changes, isPlayerOn } from './pcmove.ts';
import { shmup_activateArrow, shmup_destroyBoats } from './shmup.ts';
import { playSound } from './sound.ts';

export function initcell(c: cell): void {
  c.mpdist = INFD; // minimum distance from the player, ever
  c.cpdist = INFD; // current distance from the player
  c.pathdist = PINFD;// current distance from the player, along paths (used by yetis)
  c.landparam = 0; c.landflags = 0; c.wparam = 0;
  c.listindex = -1;
  c.wall = waNone;
  c.item = itNone;
  c.monst = moNone;
  c.bardir = NODIR;
  c.mondir = NODIR;
  c.barleft = c.barright = laNone;
  c.land = laNone;
  c.ligon = 0;
  c.stuntime = 0;
  c.monmirror = 0;
}

export function doesnotFall(c: cell): boolean {
  changes.ccell(c);
  if (c.wall === waChasm) return false;
  else if (cellUnstable(c) && !in_gravity_zone(c)) {
    fallingFloorAnimation(c);
    c.wall = waChasm;
    return false;
  }
  return true;
}

export function doesFall(c: cell): boolean { return !doesnotFall(c); }

export function doesFallSound(c: cell): boolean {
  if (c.land !== laMotion && c.land !== laZebra)
    playSound(c, 'trapdoor');
  return !doesnotFall(c);
}

export function destroyBoats(c: cell, c2: cell, strandedToo: boolean): void {
  changes.ccell(c);
  if (c.wall === waBoat) placeWater(c, c2);
  if (strandedToo && c.wall === waStrandedBoat) c.wall = waNone;
  shmup_destroyBoats(c);
}

/** enum eGravity */
export const gsNormal = 0, gsLevitation = 1, gsAnti = 2;
export type eGravity = number;

export function bird_disruption(c: cell): boolean {
  return c.cpdist <= 5 && !!G.items[itOrbGravity];
}

export function in_gravity_zone(c: cell): boolean {
  return !!G.gravity_state && c.cpdist <= 5;
}

export function gravity_zone_diff(c: cell): number {
  if (in_gravity_zone(c)) {
    if (G.gravity_state === gsLevitation) return 0;
    if (G.gravity_state === gsAnti) return -1;
  }
  return 1;
}

export function isJWall(c: cell): boolean {
  return isWall(c) || c.monst === G.passive_switch;
}

export function get_static_gravity(c: cell): eGravity {
  if (isGravityLand(c.land))
    return gsLevitation;
  if (among(c.wall, waArrowTrap, waFireTrap, waClosePlate, waOpenPlate, waTrapdoor))
    return gsNormal;
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (isJWall(c2)) return gsAnti; }
  if (isWatery(c) || isChasmy(c) || among(c.wall, waMagma, waMineUnknown, waMineMine, waMineOpen))
    return gsLevitation;
  return gsNormal;
}

export function get_move_gravity(c: cell, c2: cell): eGravity {
  if (isGravityLand(c.land) && isGravityLand(c2.land)) {
    const d = gravityLevelDiff(c, c2);
    if (d > 0) return gsNormal;
    if (d === 0) return gsLevitation;
    if (d < 0) return gsAnti;
    return gsNormal;
  }
  else {
    if (snakelevel(c) !== snakelevel(c2)) {
      const d = snakelevel(c2) - snakelevel(c);
      if (d > 0) return gsAnti;
      if (d === -3) return gsLevitation;
      return gsNormal;
    }
    for (let i = 0; i < c.type; i++) { const c3 = c.move(i); if (!c3) continue; if (isJWall(c3)) return gsAnti; }
    for (let i = 0; i < c2.type; i++) { const c3 = c2.move(i); if (!c3) continue; if (isJWall(c3)) return gsAnti; }
    if (isWatery(c2) && c.wall === waBoat && !againstCurrent(c2, c))
      return gsNormal;
    if (isWatery(c2) || isChasmy(c2) || among(c2.wall, waMagma, waMineUnknown, waMineMine, waMineOpen) || anti_alchemy(c2, c))
      return gsLevitation;
    return gsNormal;
  }
}

export function isWarped(c: cell): boolean {
  return isWarpedType(c.land) || (c.land === laCanvas && G.canvasfloor === caflWarp) || (!inmirrororwall(c.land) && (!!G.items[itOrb37] && c.cpdist <= 4));
}

export function nonAdjacent(c: cell, c2: cell): boolean {
  if (isWarped(c) && isWarped(c2) && warptype(c) === warptype(c2)) {
    return true;
  }
  return false;
}

export function nonAdjacentPlayer(c: cell, c2: cell): boolean {
  return nonAdjacent(c, c2) && !markOrb(itOrb37);
}

export function thruVine(c: cell, c2: cell): boolean {
  return (cellHalfvine(c) && c2.wall === c.wall && c2 !== c);
}

export function useup(c: cell): void {
  changes.ccell(c);
  c.wparam--;
  if (c.wparam === 0) {
    drawParticles(c, c.wall === waFire ? 0xC00000 : winf[c.wall].color, 10, 50);
    if (c.wall === waTempFloor)
      c.wall = waChasm;
    else if (c.wall === waTempBridge || c.wall === waTempBridgeBlocked || c.wall === waBurningDock || c.land === laBrownian)
      placeWater(c, c);
    else {
      c.wall = c.land === laCaribbean ? waCIsland2 : waNone;
    }
  }
}

export function earthFloor(c: cell): boolean {
  changes.ccell(c);
  if (c.monst) return false;
  if (c.wall === waDeadwall) { c.wall = waDeadfloor; return true; }
  if (c.wall === waDune) { c.wall = waNone; return true; }
  if (c.wall === waStone && !among(c.land, laTerracotta, laMercuryRiver, laVariant)) { c.wall = waNone; return true; }
  if (c.wall === waAncientGrave || c.wall === waFreshGrave || c.wall === waRuinWall) {
    c.wall = waNone;
    return true;
  }
  if (c.land === laWet && among(c.wall, waDeepWater, waShallow, waStone)) {
    c.wall = waNone;
    return true;
  }
  if ((c.wall === waSea || c.wall === waNone) && c.land === laOcean) {
    c.wall = waCIsland;
    return true;
  }
  if (c.wall === waSea && c.land === laCaribbean) {
    c.wall = waCIsland;
    return true;
  }
  if (c.wall === waSea && c.land === laWarpSea)
    c.wall = waNone;
  if (c.wall === waBoat && c.land === laWarpSea)
    c.wall = waStrandedBoat;
  if (c.wall === waMercury) {
    c.wall = waNone;
    return true;
  }
  if ((c.wall === waBarrowDig || c.wall === waBarrowWall) && c.land === laBurial) {
    c.item = itNone;
    c.wall = waNone;
    return true;
  }
  if (c.wall === waPlatform && c.land === laMountain) {
    c.wall = waNone;
    return true;
  }
  if (c.wall === waChasm && c.land === laHunting) {
    c.wall = waNone;
    return true;
  }
  if (c.land === laCursed && among(c.wall, waDeepWater, waShallow)) {
    c.wall = waNone;
    return true;
  }
  return false;
}

export function earthWall(c: cell): boolean {
  changes.ccell(c);
  if (c.wall === waDeadfloor || c.wall === waDeadfloor2 || c.wall === waEarthD) {
    c.item = itNone;
    c.wall = waDeadwall;
    return true;
  }
  if (c.land === laWet && among(c.wall, waDeepWater, waShallow, waNone)) {
    c.wall = waStone;
    return true;
  }
  if (c.wall === waNone && c.land === laFrog)
    c.wall = waStone;
  if (c.wall === waNone && c.land === laEclectic)
    c.wall = waDeadwall;
  if (c.wall === waNone && c.land === laMountain) {
    c.wall = waPlatform;
    return true;
  }
  if (c.wall === waNone && c.land === laDesert) {
    c.item = itNone;
    c.wall = waDune;
    return true;
  }
  if (c.wall === waNone && c.land === laRuins) {
    c.item = itNone;
    c.wall = waRuinWall;
    return true;
  }
  if (c.wall === waNone && isElemental(c.land)) {
    c.item = itNone;
    c.wall = waStone;
    return true;
  }
  if (c.wall === waNone && c.land === laRedRock) {
    c.item = itNone;
    c.wall = waRed3;
    return true;
  }
  if (c.wall === waNone && c.land === laSnakeNest) {
    c.item = itNone;
    c.wall = waRed3;
    return true;
  }
  if (c.wall === waNone && c.land === laBurial) {
    c.item = itNone;
    c.wall = waBarrowDig;
    return true;
  }
  if (c.wall === waNone && c.land === laHunting) {
    c.item = itNone;
    c.wall = waChasm;
    return true;
  }
  if (c.wall === waNone && among(c.land, laTerracotta, laMercuryRiver)) {
    c.wall = waMercury;
    return true;
  }
  if (c.wall === waArrowTrap && among(c.land, laTerracotta, laMercuryRiver)) {
    destroyTrapsOn(c);
    c.wall = waMercury;
    return true;
  }
  if (c.land === laCursed && among(c.wall, waNone, waShallow)) {
    c.wall = waSea;
    return true;
  }
  if (c.wall === waCIsland || c.wall === waCIsland2 || (c.wall === waNone && c.land === laOcean)) {
    c.item = itNone;
    c.wall = waSea;
    if (c.land === laOcean) c.landparam = 40;
    return true;
  }
  return false;
}

export function snakepile(c: cell, m: eMonster): boolean {
  changes.ccell(c);
  if (c.wall === waSea && c.land === laOcean) {
    c.land = laBrownian; c.landparam = 0;
  }
  if (c.land === laWestWall) return false;
  if (c.land === laBrownian) {
    if (c.wall === waNone) {
      c.landparam += brownian_level;
      return true;
    }
    if (c.wall === waSea || c.wall === waBoat) {
      c.wall = waNone;
      c.landparam++;
      return true;
    }
  }
  if (c.item && c.wall !== waRed3) c.item = itNone;
  if (c.wall === waRed1 || c.wall === waOpenGate) c.wall = waRed2;
  else if (c.wall === waRed2) c.wall = waRed3;
  else if (doesFall(c)) return false;
  else if ((c.wall === waSea && c.land === laLivefjord))
    c.wall = waNone;
  else if ((c.wall === waSea && isWarpedType(c.land)))
    c.wall = waShallow;
  else if (isGravityLand(c.land)) {
    if (m === moHexSnake)
      c.wall = waPlatform;
    else
      c.wall = waDeadTroll2;
  }
  else if (c.wall === waNone || isAlchAny(c) ||
    c.wall === waCIsland || c.wall === waCIsland2 ||
    c.wall === waOpenPlate || c.wall === waClosePlate ||
    c.wall === waMineUnknown || c.wall === waMineOpen || isReptile(c.wall)) {
    if (isReptile(c.wall)) G.kills[moReptile]++;
    c.wall = waRed1;
    if (among(m, moDarkTroll, moBrownBug)) c.wall = waDeadfloor2;
  }
  else if (c.wall === waDeadfloor)
    c.wall = waDeadfloor2;
  else if (c.wall === waDeadfloor2) {
    if (m === moDarkTroll && c.land === laDeadCaves) return false;
    else
      c.wall = waDeadwall;
  }
  else if (c.wall === waRubble || c.wall === waGargoyleFloor || c.wall === waGargoyleBridge ||
    c.wall === waTempFloor || c.wall === waTempBridge || c.wall === waPetrifiedBridge) {
    if (c.land === laWhirlpool) return false;
    c.wall = waRed2;
    if (m === moDarkTroll) c.wall = waDeadwall;
  }
  else if (c.wall === waCavefloor) c.wall = waCavewall;
  else if (c.wall === waSea && c.land === laCaribbean) c.wall = waShallow;
  else if (c.wall === waSea && c.land === laWhirlpool) return false;
  else if (c.wall === waSea) c.wall = waShallow;
  else if (c.wall === waDeepWater) c.wall = waShallow;
  else if (c.wall === waShallow) c.wall = waNone;
  else if (c.wall === waLake) c.wall = waShallow;
  else if (isWateryOrBoat(c) || c.wall === waFrozenLake) c.wall = waNone;
  else if (isWateryOrBoat(c) || c.wall === waFrozenLake) c.wall = waNone;
  else if (cellHalfvine(c)) {
    destroyHalfvine(c, waRed1);
    if (c.wall === waRed1 && m === moDarkTroll) c.wall = waDeadfloor2;
  }
  else return false;
  return true;
}

export function makeflame(c: cell, timeout: number, checkonly: boolean): boolean {
  changes.ccell(c);
  if (!checkonly) destroyTrapsOn(c);
  if (itemBurns(c.item) && !isWatery(c) && c.wall !== waShallow) {
    if (checkonly) return true;
    if (c.cpdist <= 7)
      addMessage(XLAT('%The1 burns!', spI(c.item)));
    c.item = itNone;
  }
  if (cellUnstable(c)) {
    if (checkonly) return true;
    doesFall(c);
  }
  else if (c.wall === waChasm || c.wall === waOpenGate || c.wall === waRed2 || c.wall === waRed3 ||
    c.wall === waTower)
    return false;
  else if (c.wall === waBoat) {
    if (isPlayerOn(c) && markOrb(itOrbWinter)) {
      if (!checkonly) addMessage(XLAT('%the1 protects your boat!', spI(itOrbWinter)));
      return true;
    }
    if (checkonly) return true;
    if (c.cpdist <= 7)
      addMessage(XLAT('%The1 burns!', winf[c.wall].name));
    drawFireParticles(c, 24);
    placeWater(c, c);
    if (isIcyLand(c)) c.LHU.heat = c.LHU.heat + 1;
  }
  else if (c.wall === waNone && c.land === laCocytus) {
    if (checkonly) return true;
    c.wall = waLake; c.LHU.heat = c.LHU.heat + 1;
  }
  else if (c.wall === waFireTrap) {
    if (checkonly) return true;
    if (c.wparam === 0) c.wparam = 1;
  }
  else if (c.wall === waFrozenLake) {
    if (checkonly) return true;
    drawParticles(c, MELTCOLOR, 8, 8);
    c.wall = waLake; c.LHU.heat = c.LHU.heat + 1;
  }
  else if (c.wall === waIcewall) {
    if (checkonly) return true;
    drawParticles(c, MELTCOLOR, 8, 8);
    c.wall = waNone;
  }
  else if (c.wall === waMineMine) {
    if (checkonly) return true;
    explodeMine(c);
  }
  else if (c.wall !== waCTree && c.wall !== waBigTree && c.wall !== waSmallTree &&
    c.wall !== waVinePlant && !passable(c, null!, P_MONSTER | P_MIRROR) &&
    c.wall !== waSaloon && c.wall !== waRose) return false;
  // reptiles are able to use the water to put the fire off
  else if (c.wall === waReptileBridge) return false;
  else if (c.wall === waDock) {
    if (checkonly) return true;
    c.wall = waBurningDock;
    c.wparam = 3;
    return false;
  }
  else {
    const w = eternalFire(c) ? waEternalFire : waFire;
    if (!checkonly) drawFireParticles(c, 10);
    if (w === c.wall) return false;
    if (checkonly) return true;
    if (isReptile(c.wall)) G.kills[moReptile]++;
    destroyHalfvine(c);
    if (!isFire(c)) c.wparam = 0;
    c.wall = w;
    c.wparam = Math.max(c.wparam, i8(timeout));
    if (c.land === laBrownian) c.landparam = 0;
  }
  return true;
}

export function makeshallow(c: cell, _timeout: number, checkonly: boolean): boolean {
  changes.ccell(c);
  if (!checkonly) destroyTrapsOn(c);
  if (c.land === laBrownian) {
    if (checkonly) return true;
    brownian_dissolve(c, 1);
  }
  if (c.wall === waChasm || c.wall === waOpenGate || c.wall === waRed2 || c.wall === waRed3 ||
    c.wall === waTower)
    return false;
  else if (c.wall === waNone && c.land === laCocytus) {
    if (checkonly) return true;
    c.wall = waLake;
  }
  else if (c.wall === waFireTrap) {
    if (checkonly) return true;
    c.wall = waShallow;
  }
  else if (c.wall === waFrozenLake) {
    if (checkonly) return true;
    drawParticles(c, MELTCOLOR, 8, 8);
    c.wall = waLake;
  }
  else if (isFire(c)) {
    if (checkonly) return true;
    c.wall = waNone;
  }
  else if (c.wall === waMineMine) {
    if (checkonly) return true;
    c.wall = waShallow;
  }
  else if (among(c.wall, waNone, waRubble, waDeadfloor2, waCavefloor, waDeadfloor, waFloorA, waFloorB) && !cellUnstable(c) && !isGravityLand(c)) {
    if (checkonly) return true;
    c.wall = waShallow;
  }
  else if (c.wall === waDock) {
    if (checkonly) return true;
    c.wall = waSea;
    c.wparam = 3;
    return false;
  }
  return true;
}

export function explosion(c: cell, power: number, central: number): void {
  changes.ccell(c);
  playSound(c, 'explosion');
  drawFireParticles(c, 30, 150);

  brownian_dissolve_brownian(c, 2);
  makeflame(c, central, false);

  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    changes.ccell(c2);
    destroyTrapsOn(c2);
    brownian_dissolve_brownian(c2, 1);
    if (c2.wall === waRed2 || c2.wall === waRed3)
      c2.wall = waRed1;
    else if (c2.wall === waDeadTroll || c2.wall === waDeadTroll2 || c2.wall === waPetrified || c2.wall === waGargoyle) {
      c2.wall = waNone;
      makeflame(c2, idiv(power, 2), false);
    }
    else if (c2.wall === waPetrifiedBridge || c2.wall === waGargoyleBridge) {
      placeWater(c, c);
    }
    else if (c2.wall === waPalace || c2.wall === waOpenGate || c2.wall === waClosedGate ||
      c2.wall === waSandstone || c2.wall === waMetal || c2.wall === waSaloon || c2.wall === waRuinWall) {
      c2.wall = waNone;
      makeflame(c2, idiv(power, 2), false);
    }
    else if (c2.wall === waTower)
      c2.wall = waRubble;
    else if (c2.wall === waBarrowWall)
      c2.wall = waBarrowDig;
    else if (c2.wall === waBarrowDig)
      c2.wall = waNone;
    else if (c2.wall === waFireTrap) {
      if (c2.wparam === 0)
        c2.wparam = 1;
    }
    else if (c2.wall === waExplosiveBarrel)
      explodeBarrel(c2);
    else makeflame(c2, power, false);
  }
}

export function explodeMine(c: cell): void {
  if (c.wall !== waMineMine)
    return;

  changes.ccell(c);
  c.wall = waMineOpen;
  explosion(c, 20, 20);
  changes.at_commit(mine_auto_teleport_charges);
}

export function explodeBarrel(c: cell): void {
  if (c.wall !== waExplosiveBarrel)
    return;

  changes.ccell(c);
  c.wall = waNone;
  explosion(c, 20, 20);
}

export function mayExplodeMine(c: cell, who: eMonster): boolean {
  if (c.wall !== waMineMine) return false;
  if (ignoresPlates(who)) return false;
  explodeMine(c);
  return true;
}

export function flameHalfvine(c: cell, val: number): void {
  changes.ccell(c);
  if (itemBurns(c.item)) {
    addMessage(XLAT('%The1 burns!', spI(c.item)));
    c.item = itNone;
  }
  c.wall = waPartialFire;
  c.wparam = val;
}

export function destroyHalfvine(c: cell, newwall: eWall = waNone, tval = 6): boolean {
  if (cellHalfvine(c)) {
    changes.ccell(c);
    for (let i = 0; i < c.type; i++) {
      const c1 = c.move(i); if (!c1) continue;
      if (c1.wall === c.wall) {
        changes.ccell(c1);
        if (newwall === waPartialFire) flameHalfvine(c1, tval);
        else if (newwall === waRed1) c1.wall = waVinePlant;
        else c1.wall = newwall;
      }
    }
    if (newwall === waPartialFire) flameHalfvine(c, tval);
    else c.wall = newwall;
    return true;
  }
  return false;
}

export function coastvalEdge(c: cell): number { return coastval(c, laIvoryTower); }
export function coastvalWest(c: cell): number { return coastval(c, laWestWall); }

export function gravityLevel(c: cell): number {
  if (c.land === laIvoryTower && ls_hv_structure())
    return celldistAlt(c);
  if (c.land === laDungeon && ls_hv_structure())
    return -celldistAlt(c);
  if (c.land === laIvoryTower || c.land === laEndorian)
    return coastval(c, laIvoryTower);
  if (c.land === laDungeon)
    return -coastval(c, laIvoryTower);
  if (c.land === laMountain)
    return 1 - celldistAlt(c);
  return 0;
}

export function gravityLevelDiff(c: cell, d: cell): number {
  if (c.land !== laWestWall || d.land !== laWestWall) {
    const res = gravityLevel(c) - gravityLevel(d);
    if (res > 1) return 1;
    if (res < -1) return -1;
    return res;
  }

  if (G.shmup_on) return 0;

  const nid = neighborId(c, d);
  const id1 = parent_id(c, 1, coastvalWest) + 1;
  const di1 = angledist_n(c.type, id1, nid);

  const id2 = parent_id(c, -1, coastvalWest) - 1;
  const di2 = angledist_n(c.type, id2, nid);

  if (di1 < di2) return 1;
  if (di1 > di2) return -1;
  return 0;
}

export function canUnstable(w: eWall, flags: flagtype): boolean {
  return w === waNone || w === waCanopy || w === waOpenPlate || w === waClosePlate ||
    w === waOpenGate || (((flags & MF_STUNNED) !== 0n) && (w === waLadder || w === waTrunk || w === waSolidBranch || w === waWeakBranch
    || w === waBigBush || w === waSmallBush));
}

export function cellEdgeUnstable(c: cell, flags: flagtype = 0n): boolean {
  if (!isGravityLand(c.land) || !canUnstable(c.wall, flags)) return false;
  if (G.shmup_on && c.land === laWestWall) return false;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (isAnyIvy(c2.monst) &&
      c.land === laMountain && !(flags & MF_IVY)) return false;
    const d = gravityLevelDiff(c, c2);
    if (d === gravity_zone_diff(c)) {
      if (againstWind(c2, c)) return false;
      if (!passable(c2, null!, P_MONSTER | P_DEADLY))
        return false;
      if (isWorm(c2))
        return false;
    }
    if (WDIM() === 3) {
      if (d === 0 && !passable(c2, null!, P_MONSTER | P_DEADLY)) return false;
      if (d === -1 && !passable(c2, null!, P_MONSTER | P_DEADLY)) for (let j = 0; j < c2.type; j++) {
        const c3 = c2.move(j); if (!c3) continue;
        if (c3 !== c && gravityLevelDiff(c3, c) === 0) return false;
      }
    }
  }
  return true;
}

export function calcTidalPhase(): void {
  const tide = G.tide;
  if (!G.tidalsize) {
    for (let i = 0; i < 5; i++) tide[G.tidalsize++] = 1;

    for (let i = 1; i < 4; i++) for (let j = 0; j < 3; j++)
      tide[G.tidalsize++] = i;

    for (let i = 4; i < 7; i++) for (let j = 0; j < 2; j++)
      tide[G.tidalsize++] = i;

    for (let i = 7; i < 20; i++)
      tide[G.tidalsize++] = i;

    for (let i = 20; i < 23; i++) for (let j = 0; j < 2; j++)
      tide[G.tidalsize++] = i;

    for (let i = 23; i < 26; i++) for (let j = 0; j < 3; j++)
      tide[G.tidalsize++] = i;

    for (let i = 0; i + i < G.tidalsize; i++) tide[G.tidalsize++] = 27 - tide[i];
  }
  const t = G.shmup_on ? idiv(G.shmup_curtime, 600) : G.turncount;
  G.tidalphase = tide[t % G.tidalsize];
  G.tidalphase2 = G.tidalphase;
  if (tide[gmod(t - 1, G.tidalsize)] < G.tidalphase) G.tidalphase2 = G.tidalphase - 1;
  if (tide[gmod(t + 1, G.tidalsize)] < G.tidalphase) G.tidalphase2 = G.tidalphase - 1;
  if (G.peace_on)
    G.tidalphase2 = G.tidalphase = 5 + idiv(G.tidalphase, 6);
}

export function tidespeed(): number {
  return G.tide[(G.turncount + 6) % G.tidalsize] - G.tidalphase;
}

/** #define SEADIST LHU.bytes[0], LANDDIST LHU.bytes[1], CHAOSPARAM LHU.bytes[2] */
const SEADIST = 0, LANDDIST = 1, CHAOSPARAM = 2;

export function lavatide(c: cell, t: number): number {
  const tc = (G.shmup_on ? idiv(G.shmup_curtime, 400) : G.turncount);
  return (windmap_at(c) + (tc + t) * 4) & 255;
}

export function checkTide(c: cell): void {
  if (c.land === laOcean) {
    let t = c.landparam;

    if (ls_any_chaos()) {
      const L = c.LHU;
      if (L.byte(SEADIST) === 0) L.setByte(SEADIST, 7);
      if (L.byte(LANDDIST) === 0) L.setByte(LANDDIST, 7);
      let seadist = L.byte(SEADIST), landdist = L.byte(LANDDIST);
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        if (!c2) continue;
        if (c2.land === laBarrier || c2.land === laOceanWall) { /* */ }
        else if (c2.land === laOcean) {
          seadist = Math.min(seadist, c2.LHU.byte(SEADIST) >= 1 ? c2.LHU.byte(SEADIST) + 1 : 7);
          landdist = Math.min(landdist, c2.LHU.byte(LANDDIST) >= 1 ? c2.LHU.byte(LANDDIST) + 1 : 7);
        }
        else if (isSealand(c2.land)) seadist = 1;
        else landdist = 1;
      }
      if (seadist < L.byte(SEADIST)) { L.setByte(SEADIST, seadist); G.recalcTide = true; }
      if (landdist < L.byte(LANDDIST)) { L.setByte(LANDDIST, landdist); G.recalcTide = true; }
      if (seadist === 1 && landdist === 1) t = 15;
      else {
        L.setByte(CHAOSPARAM, 1 + idiv(29 * (landdist - 1), seadist + landdist - 2));
        t = L.byte(CHAOSPARAM);
      }
    }

    if (c.wall === waStrandedBoat || c.wall === waBoat)
      c.wall = t >= G.tidalphase ? waBoat : waStrandedBoat;
    if (c.wall === waSea || c.wall === waNone || c.wall === waShallow)
      c.wall = t >= G.tidalphase ? waSea : t >= G.tidalphase2 ? waShallow : waNone;
    if (isFire(c) && t >= G.tidalphase)
      c.wall = waSea;
  }
  if (c.land === laVolcano) {
    const id = lavatide(c, 0);
    if (id < 96) {
      if (c.wall === waNone || isWateryOrBoat(c) || c.wall === waVinePlant || isAlch(c)) {
        if (isWateryOrBoat(c) || isAlch(c))
          playSound(c, 'steamhiss');
        c.wall = waMagma;
        if (itemBurns(c.item)) {
          addMessage(XLAT('%The1 burns!', spI(c.item))); c.item = itNone;
          playSound(c, 'steamhiss', 30);
        }
      }
    }
    else if (c.wall === waMagma) c.wall = waNone;
  }
  if (c.land === laCanvas && G.ccolor_live_canvas) {
    const col = ccolor_generateCanvas(c);
    c.landparam = col;
    c.wall = G.canvas_default_wall;
    if (col & 0x1000000) c.wall = waWaxWall;
  }
}

export function makeNoMonster(c: cell): boolean {
  changes.ccell(c);
  if (isAnyIvy(c.monst)) killMonster(c, moPlayer, 0n);
  else if (is_paired(c.monst)) {
    changes.ccell(c.move(c.mondir));
    if (is_paired(c.move(c.mondir).monst))
      c.move(c.mondir).monst = moNone;
  }
  else if (isWorm(c.monst)) {
    if (!G.items[itOrbDomination]) return false;
  }
  else if (isMultitile(c.monst)) {
    return false;
  }
  else c.monst = moNone;
  return true;
}

export function makeEmpty(c: cell): boolean {
  if (c.monst !== moPrincess) {
    if (!makeNoMonster(c)) return false;
  }

  if (c.land === laCanvas) { /* */ }
  else if (c.land === laCocytus)
    c.wall = waFrozenLake;
  else if (c.land === laAlchemist || c.land === laCanvas) { /* */ }
  else if (c.land === laDual) { /* */ }
  else if (c.land === laCaves || c.land === laEmerald)
    c.wall = waCavefloor;
  else if (c.land === laDeadCaves)
    c.wall = waDeadfloor2;
  else if (c.land === laCaribbean || c.land === laOcean || c.land === laWhirlpool || c.land === laLivefjord || c.land === laWarpSea || c.land === laKraken || c.wall === waBoat)
    c.wall = waBoat; // , c->item = itOrbYendor;
  else if (c.land === laMinefield)
    c.wall = waMineOpen;
  else if (c.wall === waFan && closed_manifold()) { /* */ }
  else if (c.wall === waOpenPlate && closed_manifold()) { /* */ }
  else if (c.wall === waTrunk || c.wall === waSolidBranch || c.wall === waWeakBranch) { /* */ }
  else if (c.wall === waGiantRug) { /* */ }
  else if (c.wall === waInvisibleFloor) { /* */ }
  else if (c.wall === waDock) { /* */ }
  else if (c.wall === waLadder) { /* */ }
  else if (c.land === laDocks)
    c.wall = waBoat;
  else if (c.wall === waFreshGrave && closed_manifold()) { /* */ }
  else if (c.wall === waBarrier && sphere() && WDIM() === 3) { /* */ }
  else if (isReptile(c.wall))
    c.wparam = reptilemax();
  else if (c.wall === waAncientGrave && closed_manifold()) { /* */ }
  else if (c.wall !== waRoundTable)
    c.wall = waNone;

  if (c.land === laBrownian && c.wall === waNone && c.landparam === 0)
    c.landparam = 1;

  if (c.item !== itCompass)
    c.item = itNone;

  if (c.land === laEclectic) {
    c.wall = waNone;
    for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; c1.wall = waNone; }
  }

  if (c.land === laWildWest) {
    const cl = new celllister(G.cwt.at, 100, 1000000, null);
    try {
      for (const c1 of cl.lst) {
        if (c1 === G.cwt.at) continue;
        if (c1.wall !== waSaloon && !c1.item) break;
        c1.wall = waNone;
      }
    }
    finally { cl.destroy(); }
  }

  return true;
}

let numgates = 0;

export function toggleGates(c: cell, type: eWall, rad: number): void {
  if (!c) return;
  const cl = new celllister(c, rad, 1000000, null);
  try {
    for (const ct of cl.lst) {
      if (ct.wall === waOpenGate && type === waClosePlate) {
        let onWorm = false;
        if (isWorm(ct)) onWorm = true;
        for (let i = 0; i < ct.type; i++)
          if (ct.move(i) && ct.move(i).wall === waOpenGate && isWorm(ct.move(i))) onWorm = true;
        if (!onWorm) {
          changes.ccell(ct);
          ct.wall = waClosedGate; numgates++;
          if (ct.item) {
            playSound(ct, 'hit-crush' + pick123());
            addMessage(XLAT('%The1 is crushed!', spI(ct.item)));
            ct.item = itNone;
          }
          toggleGates(ct, type, 1);
        }
      }
      if (ct.wall === waClosedGate && type === waOpenPlate) {
        changes.ccell(ct);
        ct.wall = waOpenGate; numgates++;
        toggleGates(ct, type, 1);
      }
    }
  }
  finally { cl.destroy(); }
}

export function toggle_radius(type: eWall): number {
  if (type === waClosePlate && PURE())
    return 2;
  else
    return (GOLDBERG() && !sphere() && !a4()) ? gp_dist_3() : 3;
}

/** void toggleGates(cell *ct, eWall type) */
export function toggleGates_w(ct: cell, type: eWall): void {
  playSound(ct, 'click');
  numgates = 0;
  toggleGates(ct, type, toggle_radius(type));
  if (numgates && type === waClosePlate)
    playSound(ct, 'closegate');
  if (numgates && type === waOpenPlate)
    playSound(ct, 'opengate');
}

export function destroyTrapsOn(c: cell): void {
  if (c.wall === waArrowTrap) {
    changes.ccell(c);
    c.wall = waNone;
    drawParticles(c, 0xFF0000, 4);
    destroyTrapsAround(c);
  }
}

export function destroyTrapsAround(c: cell): void {
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; destroyTrapsOn(c2); }
}

export function destroyWeakBranch(cf: cell, ct: cell, who: eMonster): void {
  if (cf && ct && cf.wall === waWeakBranch && cellEdgeUnstable(ct) &&
    gravityLevelDiff(ct, cf) >= 0 && !ignoresPlates(who)) {
    changes.ccell(cf);
    cf.wall = waCanopy;
    if (!cellEdgeUnstable(cf)) { cf.wall = waWeakBranch; return; }
    playSound(cf, 'trapdoor');
    drawParticles(cf, winf[waWeakBranch].color, 4);
  }
  if (cf && ct && cf.wall === waSmallBush && cellEdgeUnstable(ct) &&
    gravityLevelDiff(ct, cf) >= 0 && !ignoresPlates(who)) {
    changes.ccell(cf);
    cf.wall = waNone;
    if (!cellEdgeUnstable(cf)) { cf.wall = waSmallBush; return; }
    playSound(cf, 'trapdoor');
    drawParticles(cf, winf[waWeakBranch].color, 4);
  }
}

export function isCentralTrap(c: cell): boolean {
  if (c.wall !== waArrowTrap) return false;
  let i = 0;
  if (hat_in()) {
    for (let d = 0; d < c.type; d++)
      if (c.cmove(d).wall === waArrowTrap && c.cmodmove(d + idiv(c.type, 2)).wall === waArrowTrap)
        return true;
  }
  for (let d = 0; d < c.type; d++) { const c2 = c.move(d); if (!c2) continue; if (c2.wall === waArrowTrap) i++; }
  return i === 2;
}

/** array<cell*, 5> traplimits(cell *c) */
export function traplimits(c: cell): cell[] {
  const res: cell[] = [null!, null!, null!, null!, null!];
  let q = 0;
  res[2] = c;
  for (let d = 0; d < c.type; d++) {
    const cw = new cellwalker(c, d);
    cw.addStep();
    if (cw.at.wall !== waArrowTrap) continue;
    if (q && cw.at === res[1]) continue;
    res[1 + q * 2] = cw.at;
    cw.add(idiv(cw.at.type, 2));
    if ((cw.at.type & 1) && cw.plusStep().at.wall !== waStone) cw.add(1);
    if (cw.plusStep().at.wall !== waStone) continue;
    cw.addStep();
    res[(q++) * 4] = cw.at;
  }
  while (q < 2) { res[q * 4] = res[1 + q * 2] = null!; q++; }
  return res;
}

export function activateArrowTrap(c: cell): void {
  if (c.wall === waArrowTrap && c.wparam === 0) {
    changes.ccell(c);
    playSound(c, 'click');
    c.wparam = G.shmup_on ? 2 : 1;
    for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; activateArrowTrap(c2); }
    if (G.shmup_on) shmup_activateArrow(c);
  }
}

/** static bool first (in determinePush) */
let determinePush_first = true;

/** template<class T> movei determinePush(cellwalker who, int subdir, const T& valid) (HDR) */
export function determinePush(who: cellwalker, subdir: number, valid: (mi: movei) => boolean): movei {
  if (subdir !== 1 && subdir !== -1) {
    subdir = 1;
    if (determinePush_first) {
      determinePush_first = false;
      addMessage('bad push: ' + its(subdir));
    }
  }
  let push = who.clone();
  push.addStep();
  const c2 = push.at;
  if (bt_in()) {
    const rd = reverse_directions(push.at, push.spin);
    for (const i of rd) {
      push.spin = i;
      const mi = movei.sd(push.at, i);
      if (valid(mi)) return mi;
    }
    return movei.sd(c2, NO_SPACE);
  }
  const pd = idiv(push.at.type, 2);
  push.add(pd * -subdir);
  const mi = movei.sd(push.at, push.spin);
  push.addStep();
  if (valid(mi)) return mi;
  if (c2.type & 1) {
    push = push.plusStep().add(-subdir).addStep();
    if (valid(mi)) return mi;
  }
  if (gravityLevelDiff(push.at, c2) < 0) {
    push = push.plusStep().add(1).addStep();
    if (gravityLevelDiff(push.at, c2) < 0) {
      push = push.plusStep().add(-2).addStep();
    }
    if (gravityLevelDiff(push.at, c2) < 0) {
      push = push.plusStep().add(1).addStep();
    }
    const mi2 = movei.sd(c2, push.plusStep().spin);
    if (valid(mi2)) return mi2;
  }
  return movei.sd(c2, NO_SPACE);
}

// for sandworms
export function explodeAround(c: cell): void {
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (isIcyLand(c2)) c2.LHU.heat = c2.LHU.heat + 0.5;
    const ow = c2.wall;
    changes.ccell(c2);
    if ((c2.wall === waDune || c2.wall === waIcewall ||
      c2.wall === waAncientGrave || c2.wall === waFreshGrave ||
      c2.wall === waColumn || c2.wall === waThumperOff || c2.wall === waThumperOn ||
      (isFire(c2) && !eternalFire(c2)) ||
      c2.wall === waBigTree || c2.wall === waSmallTree ||
      c2.wall === waVinePlant || c2.wall === waVineHalfA || c2.wall === waVineHalfB)) {
      destroyHalfvine(c2);
      c2.wall = waNone;
    }
    if (c2.wall === waExplosiveBarrel) explodeBarrel(c2);
    if (c2.wall === waCavewall || c2.wall === waDeadTroll) c2.wall = waCavefloor;
    if (c2.wall === waDeadTroll2) c2.wall = waNone;
    if (c2.wall === waPetrified) c2.wall = waNone;
    if (c2.wall === waDeadfloor2) c2.wall = waDeadfloor;
    if (c2.wall === waGargoyleFloor) c2.wall = waChasm;
    if (c2.wall === waGargoyleBridge || c2.wall === waPetrifiedBridge) placeWater(c2, c2);
    if (c2.wall === waRubble) c2.wall = waNone;
    if (c2.wall === waPlatform) c2.wall = waNone;
    if (c2.wall === waStone) { c2.wall = waNone; destroyTrapsAround(c2); }
    if (c2.wall === waRose) c2.wall = waNone;
    if (c2.wall === waRuinWall) c2.wall = waNone;
    if (c2.wall === waLadder) c2.wall = waNone;
    if (c2.wall === waGargoyle) c2.wall = waNone;
    if (c2.wall === waSandstone) c2.wall = waNone;
    if (c2.wall === waSaloon) c2.wall = waNone;
    if (c2.wall === waDeadwall) c2.wall = waDeadfloor2;
    if (c2.wall === waBigStatue) c2.wall = waNone;
    if (c2.wall === waPalace || c2.wall === waOpenGate || c2.wall === waClosedGate)
      c2.wall = waNone;
    if (isAlch(c2) && isAlch(c))
      c2.wall = c.wall;
    if (c2.wall !== ow && ow) drawParticles(c2, winf[ow].color, 16);
  }
}

export function earthMove(mi: movei): boolean {
  const from = mi.s;
  let b = false;
  const c2 = mi.t;
  b = earthWall(from) || b;
  if (!mi.proper()) return b;
  const d = mi.rev_dir_or(0);
  if (c2) for (let u = 2; u <= c2.type - 2; u++) {
    const c3 = c2.modmove(d + u);
    if (c3) b = earthFloor(c3) || b;
  }
  return b;
}

export function cellDangerous(c: cell): boolean {
  return cellUnstableOrChasm(c) || isFire(c) || c.wall === waClosedGate;
}
