// orbs.cpp of HyperRogue 13.1o: the Orb effects, and their properties such as default and maximum charges.
// Package P7 (player). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Overloads: reflectingBarrierAt(cell*) keeps the name, reflectingBarrierAt(cellwalker&, int) is
// `reflectingBarrierAt_cw`. enum orbAction (hyper.h) is here: roMouse, roKeyboard, ... The macros CHK, CHKV,
// INI, CHK_ROLLBACK of targetRangedOrb are local functions (their message argument is evaluated eagerly: it
// has no side effects). println(hlog, ...) is left out.
import { achievement_count } from './achievement.ts';
import {
  animate_item_throw, animateMovement, drawBigFlash, drawFlash, drawLightning, drawParticles, LAYER_BIG, LAYER_BOAT,
  LAYER_SMALL,
} from './animations.ts';
import {
  attackMonster, canAttack, do_swords, fallMonster, gun_targets, killFriendlyIvy, killMonster, pushMonster,
  record_spillinfo, stabbingAttack, tkills,
} from './attack.ts';
import { addMessage } from './basegraph.ts';
import { getBits, getDistLimit, isNeighbor, neighborId } from './cell.ts';
import { localtime } from './cfile.ts';
import { checkmove, monstersnear } from './checkmove.ts';
import { sphere } from './classes.ts';
import {
  elec_act, kraken_head, mirror_createMirages, mirror_createMirrors, mirror_destroyAll, mirror_LIGHTNING,
  mirror_reflect, princess_bringBack, sword_reset, sword_shift, whirlwind_calcdirs, whirlwind_jumpFromWhereTo,
} from './complex.ts';
import {
  dice_can_roll_mi, dice_data_at, dice_on, mine_auto_teleport_charges, mine_in_minesweeper,
} from './complex2.ts';
import {
  type eItem, type eMonster, type eWall, type flagtype, IC_ORB, itBabyTortoise, itBarrow, itCrossbow,
  itCurseDraining, itCurseFatigue, itCurseGluttony, itCurseRepulsion, itCurseWater, itCurseWeakness, itDice,
  itFulgurite, itHolyGrail, itNone, itOrb37, itOrbAether, itOrbAir, itOrbBeauty, itOrbBull, itOrbChaos, itOrbChoice,
  itOrbDash, itOrbDigging, itOrbDiscord, itOrbDomination, itOrbDragon, itOrbEmpathy, itOrbEnergy, itOrbFire,
  itOrbFish, itOrbFlash, itOrbFreedom, itOrbFriend, itOrbFrog, itOrbGravity, itOrbHorns, itOrbIllusion, itOrbImpact,
  itOrbIntensity, itOrbInvis, itOrbLava, itOrbLife, itOrbLightning, itOrbLove, itOrbLuck, itOrbMagnetism,
  itOrbMatter, itOrbMorph, itOrbNature, itOrbPhasing, itOrbPlague, itOrbPsi, itOrbPurity, itOrbRecall, itOrbSafety,
  itOrbShell, itOrbShield, itOrbSide1, itOrbSide2, itOrbSide3, itOrbSlaying, itOrbSpace, itOrbSpeed, itOrbStone,
  itOrbStunning, itOrbSummon, itOrbSword, itOrbSword2, itOrbTeleport, itOrbThorns, itOrbTime, itOrbUndeath,
  itOrbWater, itOrbWinter, itOrbWoods, itOrbYendor, itRevolver, itSavedPrincess, itStrongWind, ittypes, itWarning,
  laAlchemist, laBlizzard, laBrownian, laBull, laBurial, laCaribbean, laClearing, laDesert, laDice, laDocks,
  laDragon, laDryForest, laDungeon, laEAir, laEEarth, laEFire, laEmerald, laEndorian, laEWater, laFrog, laGraveyard,
  laHell, laHive, laHunting, laIce, laIvoryTower, laJungle, laKraken, laLivefjord, laMirror, laMotion, laMountain,
  laOcean, laOvergrown, laPalace, laPower, laPrairie, laRedRock, laRlyeh, laRose, laRuins, laSnakeNest, laStorms,
  laSwitch, laTemple, laTerracotta, laTortoise, laVariant, laVolcano, laWarpCoast, laWestWall, laWhirlwind,
  laWildWest, laWineyard, laZebra, moAcidBird, moAirElemental, moAngryDie, moAnimatedDie, moBat, moBomberbird,
  moBug0, moBug1, moCultist, moDeadBird, moEarthElemental, moFallingDog, moFalsePrincess, moFamiliar, moFatGuard,
  moFireElemental, moFireFairy, moFjordTroll, moForestTroll, moFriendlyIvy, moFrog, moGargoyle, moGhost,
  moGreaterShark, moIllusion, moKrakenH, moLightningBolt, moMetalBeast2, moMimic, moMiner, moMonkey, moNarciss,
  moNone, moOrangeDog, moOutlaw, moPalace, moParrot, moPhaser, moPirate, moPlayer, moPyroCultist, moRagingBull,
  moRanger, moRatling, moRedFox, moRedTroll, moReptile, moResearcher, moRoseLady, moRunDog, moRusalka, moSeep,
  moShadow, moSlime, moStormTroll, moTerraWarrior, moTortoise, moTroll, moVariantWarrior, moVaulter, moViking,
  moVineBeast, moVineSpirit, moVizier, moVoidBeast, moWaterElemental, moWitchFire, moYeti, moZombie, waAncientGrave,
  waArrowTrap, waBarrier, waBarrowDig, waBarrowWall, waBigBush, waBigStatue, waBigTree, waBoat, waCamelot,
  waCamelotMoat, waCanopy, waCavefloor, waCavewall, waCharged, waChasm, waCIsland, waCIsland2, waClosedGate,
  waClosePlate, waCloud, waColumn, waCTree, waDeadfloor, waDeadfloor2, waDeadTroll, waDeadTroll2, waDeadwall,
  waDeepWater, waDock, waDune, waExplosiveBarrel, waFan, waFire, waFloorA, waFloorB, waFreshGrave, waFrozenLake,
  waGargoyle, waGargoyleBridge, waGargoyleFloor, waGiantRug, waGlass, waGrounded, waHappyDie, waIcewall, waLadder,
  waLake, waMagma, waMetal, waMineMine, waMineOpen, waMineUnknown, waMirror, waNone, waOpenGate, waOpenPlate,
  waPalace, waPartialFire, waPetrified, waPlatform, waRed1, waRed2, waRed3, waRichDie, waRose, waRubble, waRuinWall,
  waSaloon, waSandstone, waSea, waShallow, waShrub, waSmallBush, waSmallTree, waStone, waStrandedBoat, waTempBridge,
  waTempBridgeBlocked, waTempFloor, waTempWall, waTerraWarrior, waThumperOff, waTrapdoor, waTrunk, waVineHalfA,
  waVineHalfB, waVinePlant, waWarpGate, winf,
} from './content.ts';
import { idiv, type Ref, time } from './cpp.ts';
import { advance_tides, bfs, in_line_of_sight_for_player, monstersTurn } from './environment.ts';
import {
  cellHalfvine, frog_power, hasHitpoints, hasTimeout, haveRangedOrb, inmirror, is_paired, isActivable, isAlch,
  isAlchAny, isBird, isBlowableMonster, isBoat, isDragon, isElemental, isFire, isFriendly, isHaunted, isIcyLand,
  isKraken, isMultitile, isNonliving, isPushable, isReptile, isShark, isWall, isWatery, isWorm, itemclass,
  survivesFire,
} from './flags.ts';
import {
  activateActiv, checkSwitch, haveMount, map_index, multiRevival, pushThumper, saved_tortoise_on,
} from './game.ts';
import { G } from './globals.ts';
import {
  AF_CRUSH, AF_GUN, AF_MAGIC, AF_MSG, AF_MUSTKILL, AF_NORMAL, AF_PSI, among, gmod, isize, MF_IVY,
} from './hyper.ts';
import { fix_whichcopy } from './hypgraph.ts';
import {
  cantGetGrimoire, collectItem, countLocalTreasure, itemHidden, itemHiddenFromSight, moveItem,
} from './items.ts';
import { setdist } from './landgen.ts';
import { spI, spM, spW, XLAT } from './language.ts';
import {
  cell, cellwalker, FALL, JUMP, jumpdata, manual_celllister, match, movei, NO_SPACE, NODIR, TELEPORT,
} from './locations.ts';
import {
  activateArrowTrap, destroyHalfvine, destroyTrapsAround, doesFall, earthMove, explodeBarrel, isWarped, makeflame,
  makeshallow, nonAdjacent, toggleGates_w,
} from './mapeffects.ts';
import { palaceHP } from './monstergen.ts';
import { moveEffect } from './monstermove.ts';
import { multi_activePlayers, multi_checklastmove } from './multi.ts';
import {
  againstRose, become_water, canPushStatueOn, moveBoat, P_BLOW, P_ISFRIEND, P_ISPLAYER, P_IVY, P_JUMP1, P_JUMP2,
  P_LEADER, P_MIRROR, P_MONSTER, P_PHASE, P_TELE, passable, placeWater, rosedist, scentResistant,
  strictlyAgainstGravity,
} from './passable.ts';
import { pseudohept } from './pattern2.ts';
import {
  afterplayermoved, changes, createNoise, fail_survivalist, isPlayerOn, keep_cwt, lmSkip, movecost, numplayers,
  player_positions, playerMoveEffects, swordAttack, wouldkill,
} from './pcmove.ts';
import { hrand, hrand_elt } from './rand.ts';
import {
  shmup_popmonsters, shmup_pushmonsters, shmup_targetRangedOrb, shmup_teleported, shmup_verifyTeleport,
} from './shmup.ts';
import { playSound } from './sound.ts';

/** enum orbAction { roMouse, roKeyboard, roCheck, roMouseForce, roMultiCheck, roMultiGo } (hyper.h) */
export const roMouse = 0, roKeyboard = 1, roCheck = 2, roMouseForce = 3, roMultiCheck = 4, roMultiGo = 5;
export type orbAction = number;

export function markOrb(it: eItem): boolean {
  if (!G.items[it]) return false;
  G.orbused[it] = true;
  return true;
}

export function markEmpathy(it: eItem): boolean {
  if (!G.items[itOrbEmpathy]) return false;
  if (!markOrb(it)) return false;
  markOrb(itOrbEmpathy);
  return true;
}

export function markEmpathy2(it: eItem): boolean {
  if (G.items[itOrbEmpathy] < 2) return false;
  if (!markOrb2(it)) return false;
  markOrb2(itOrbEmpathy);
  return true;
}

export function markOrb2(it: eItem): boolean {
  return markOrb(it);
  /* if(!items[it]) return false;
  orbused[it] = true;
  return items[it] > 1; */
}

export function fixpower(qty: number, checking: boolean): number {
  if (checking ? G.items[itOrbEnergy] : markOrb(itOrbEnergy)) qty = idiv(qty + 1, 2);
  return qty;
}

export function useupOrb(it: eItem, qty: number): void {
  G.items[it] -= fixpower(qty, false);
  if (G.items[it] < 0) G.items[it] = 0;
}

/** drainOrb(eItem it, int target IS(0)) */
export function drainOrb(it: eItem, target = 0): void {
  if (!G.cheat_items_enabled && G.items[it] > target) useupOrb(it, G.items[it] - target);
}

export function empathyMove(mi: movei): void {
  if (!G.items[itOrbEmpathy]) return;

  if (G.items[itOrbFire]) {
    G.invismove = false;
    if (makeflame(mi.s, 10, false)) markEmpathy(itOrbFire);
  }

  if (G.items[itCurseWater]) {
    G.invismove = false;
    if (makeshallow(mi.s, 10, false)) markEmpathy(itCurseWater);
  }

  if (G.items[itOrbDigging]) {
    if (mi.proper() && earthMove(mi))
      markEmpathy(itOrbDigging), G.invismove = false;
  }

  if (G.items[itOrbWinter] && isIcyLand(mi.s) && mi.s.wall === waNone) {
    G.invismove = false;
    mi.s.wall = waIcewall;
    markEmpathy(itOrbWinter);
  }
}

export function intensify(val: number): number {
  return G.inv_on ? 2 * val : idiv(val * 6, 5);
}

let orbs_drained = 0;

export function reduceOrbPower(it: eItem, cap: number): boolean {
  if (G.items[it] && markOrb(itCurseDraining)) {
    orbs_drained++;
    G.items[it] -= (markOrb(itOrbEnergy) ? 1 : 2) * multi_activePlayers();
    if (G.items[it] < 0) G.items[it] = 0;
    if (G.items[it] === 0 && it === itOrbLove)
      princess_bringBack();
  }
  if (G.items[it] && (G.lastorbused[it] || (it === itOrbShield && G.items[it] > 3) || !markOrb(itOrbTime))) {
    orbs_drained++;
    G.items[it] -= multi_activePlayers();
    if (isHaunted(G.cwt.at.land))
      fail_survivalist();
    if (G.items[it] < 0) G.items[it] = 0;
    if (G.items[it] > cap && markOrb(itOrbIntensity)) cap = intensify(cap);
    if (G.items[it] > cap && G.timerghost) G.items[it] = cap;
    if (G.items[it] === 0 && it === itOrbLove)
      princess_bringBack();
    return true;
  }
  if (G.items[it] > cap && G.timerghost) G.items[it] = cap;
  return false;
}

export function reduceOrbPowerAlways(it: eItem): void {
  if (G.items[it]) {
    orbs_drained++;
    G.items[it] -= multi_activePlayers();
    if (G.items[it] < 0) G.items[it] = 0;
  }
}

export function reverse_curse(curse: eItem, orb: eItem, cancel: boolean): void {
  if (G.items[curse] && markOrb(itOrbPurity)) {
    G.items[orb] += G.items[curse];
    if (curse === itCurseWater) G.items[itOrbWinter] += G.items[curse];
    G.items[curse] = 0;
  }
  if (cancel && G.items[curse] && G.items[orb]) {
    const m = Math.min(G.items[curse], G.items[orb]);
    G.items[curse] -= m;
    G.items[orb] -= m;
  }
}

export function reduceOrbPowers(): void {

  orbs_drained = 0;

  reverse_curse(itCurseWeakness, itOrbSlaying, true);
  reverse_curse(itCurseFatigue, itOrbSpeed, false); // OK
  reverse_curse(itCurseRepulsion, itOrbMagnetism, true); // OK
  reverse_curse(itCurseWater, itOrbFire, true); // OK
  reverse_curse(itCurseDraining, itOrbTime, false); // OK
  reverse_curse(itCurseGluttony, itOrbChoice, true); // OK

  if (haveMount()) markOrb(itOrbDomination);
  for (let i = 0; i < ittypes; i++)
    G.lastorbused[i] = G.orbused[i], G.orbused[i] = false;
  if (G.items[itOrbShield]) G.orbused[itOrbShield] = G.lastorbused[itOrbShield];
  reduceOrbPower(itOrbTime, G.cwt.at.land === laCaribbean ? 777 : 150);
  if (G.invismove && !G.invisfish) markOrb(itOrbInvis);
  reduceOrbPower(itOrbLightning, 777);
  if (multi_activePlayers() % 2 === 0 && G.items[itOrbSpeed] && !G.shmup_on) G.items[itOrbSpeed] ^= 1;
  reduceOrbPower(itOrbSpeed, 67);
  reduceOrbPower(itOrbShield, 77);
  reduceOrbPower(itOrbShell, 150);
  reduceOrbPower(itOrbFlash, 777);
  reduceOrbPower(itOrbWinter, 77);
  reduceOrbPower(itOrbFire, 77);
  reduceOrbPower(itOrbIllusion, 111);
  reduceOrbPower(itOrbDragon, 111);
  reduceOrbPower(itOrbPsi, 111);
  reduceOrbPower(itOrbInvis, 77);
  reduceOrbPower(itOrbAether, 77);
  reduceOrbPower(itOrbWoods, 100);
  reduceOrbPower(itOrbDigging, 100);
  reduceOrbPower(itOrbTeleport, 200);
  reduceOrbPower(itOrbSpace, 150);
  reduceOrbPower(itOrbMagnetism, 150);
  reduceOrbPowerAlways(itOrbSafety);
  reduceOrbPower(itOrbThorns, 150);
  reduceOrbPower(itOrbWater, 150);
  reduceOrbPower(itOrbAir, 150);
  reduceOrbPower(itOrbFrog, 77);
  reduceOrbPower(itOrbDash, 77);
  reduceOrbPower(itOrbPhasing, 77);
  reduceOrbPower(itOrbDiscord, 67);
  reduceOrbPower(itOrbSummon, 333);
  reduceOrbPower(itOrbMatter, 333);
  reduceOrbPower(itOrbFish, 57 + 20 * multi_activePlayers());
  if (!G.items[itSavedPrincess]) G.items[itOrbLove] = 0;
  reduceOrbPower(itOrbLove, 777);
  reduceOrbPower(itOrbStunning, 100);
  reduceOrbPower(itOrbLuck, 333);
  reduceOrbPower(itOrbUndeath, 77);
  reduceOrbPower(itOrbFreedom, 77);
  reduceOrbPower(itOrbEmpathy, 77);
  markOrb(itOrb37); reduceOrbPower(itOrb37, 333);
  reduceOrbPower(itOrbBeauty, 77);
  reduceOrbPower(itOrbEnergy, 77);
  reduceOrbPower(itOrbDomination, 120);
  reduceOrbPower(itOrbSword, 100 + 20 * multi_activePlayers());
  reduceOrbPower(itOrbSword2, 100 + 20 * multi_activePlayers());
  reduceOrbPower(itOrbStone, 120);
  reduceOrbPower(itOrbNature, 120);
  reduceOrbPower(itOrbBull, 120);
  reduceOrbPower(itOrbHorns, 77);
  reduceOrbPower(itOrbLava, 80);
  reduceOrbPower(itOrbMorph, 80);
  reduceOrbPower(itOrbSlaying, 120);
  reduceOrbPower(itOrbGravity, 120);
  reduceOrbPower(itOrbChoice, 120);
  reduceOrbPower(itOrbIntensity, 120);
  reduceOrbPower(itOrbImpact, 120);
  reduceOrbPower(itOrbChaos, 120);
  reduceOrbPower(itOrbPlague, 120);

  reduceOrbPower(itOrbSide1, 120);
  reduceOrbPower(itOrbSide2, 120);
  reduceOrbPower(itOrbSide3, 120);
  if (G.cwt.at.land !== laWildWest)
    reduceOrbPower(itRevolver, 6);

  reduceOrbPower(itOrbPurity, 30);
  reduceOrbPower(itCurseWeakness, 199);
  reduceOrbPower(itCurseDraining, 199);
  reduceOrbPower(itCurseWater, 199);
  reduceOrbPower(itCurseFatigue, 199);
  reduceOrbPower(itCurseRepulsion, 199);
  reduceOrbPower(itCurseGluttony, 199);

  // CAP_COMPLEX2
  mine_auto_teleport_charges();

  if (orbs_drained && G.items[itOrbRecall] && G.items[itOrbRecall] <= 10)
    G.items[itOrbRecall] = 11;
  reduceOrbPower(itOrbRecall, 77);

  whirlwind_calcdirs(G.cwt.at);
  G.items[itStrongWind] = (!G.items[itOrbAether] && G.whirlwind_qdirs === 1) ? 1 : 0;
  G.items[itWarning] = 0;
  if (G.items[itCrossbow]) {
    if (G.lastmovetype === lmSkip && isWarped(G.cwt.at))
      addMessage(XLAT('The warped space distracts you from reloading while staying in place!'));
    else
      G.items[itCrossbow]--;
  }
  if (G.cheat_items_enabled)
    for (let i = 0; i < ittypes; i++) {
      if (i === itOrbSpeed) {
        if (G.items[i] < G.cheat_items[i]) G.items[i] = G.cheat_items[i] + 1; // Orb of Speed always needs to alternate between an odd and even number to work right
      }
      else if (itemclass(i) === IC_ORB && i !== itOrbSafety)
        G.items[i] = G.cheat_items[i];
    }
}

let orig_wall: eWall = 0;

export function flashAlchemist(c: cell): void {
  if (isAlch(c) && isAlch(orig_wall)) {
    record_spillinfo(c, orig_wall);
    c.wall = orig_wall;
  }
}

export function flashCell(c: cell, killer: eMonster, flags: flagtype): void {
  changes.ccell(c);
  const ow = c.wall;
  flashAlchemist(c);
  if ((flags & AF_MSG) && c.monst && !isWorm(c) && c.monst !== moShadow)
    addMessage(XLAT('%The1 is destroyed by the Flash.', spM(c.monst)));
  if (c.monst || isPlayerOn(c))
    if (canAttack(null!, killer, c, c.monst, flags))
      attackMonster(c, flags, killer);
  if (isIcyLand(c))
    c.LHU.heat += 2;
  if (c.land === laDryForest)
    c.landparam += 2;
  if (c.wall === waCavewall) c.wall = waCavefloor;
  if (c.wall === waDeadTroll) c.wall = waCavefloor;
  if (c.wall === waDeadTroll2) c.wall = waNone;
  if (c.wall === waPetrified) c.wall = waNone;
  if (c.wall === waDeadfloor2) c.wall = waDeadfloor;
  if (c.wall === waGargoyleFloor) c.wall = waChasm;
  if (c.wall === waGargoyleBridge) placeWater(c, c);
  if (c.wall === waGargoyle) c.wall = waNone;
  if (c.wall === waTerraWarrior) c.wall = waNone, G.kills[moTerraWarrior]++;
  if (c.wall === waPlatform) c.wall = waNone;
  if (c.wall === waStone) c.wall = waNone, destroyTrapsAround(c);
  if (c.wall === waRubble) c.wall = waNone;
  if (c.wall === waDeadwall) c.wall = waDeadfloor2;
  if (c.wall === waGiantRug) c.wall = waNone;
  if (c.wall === waMirror) c.wall = waNone;
  if (c.wall === waCloud) c.wall = waNone;
  if (c.wall === waExplosiveBarrel) explodeBarrel(c);
  if (c.wall === waRuinWall) c.wall = waNone;
  if (c.wall === waDune) c.wall = waNone;
  if (c.wall === waSaloon) c.wall = waNone;
  if (c.wall === waSandstone) c.wall = waNone;
  if (c.wall === waAncientGrave) c.wall = waNone;
  if (c.wall === waFreshGrave) c.wall = waNone;
  if (c.wall === waColumn) c.wall = waNone;
  if (c.wall === waGlass) c.wall = waNone;
  if (c.wall === waBigTree || c.wall === waSmallTree) c.wall = waNone;
  if (c.wall === waBigStatue) c.wall = waNone;
  if (c.wall === waCTree) c.wall = waCIsland2;
  if (c.wall === waPalace) c.wall = waRubble;
  if (c.wall === waRose) c.wall = waNone;
  if (c.wall === waOpenGate || c.wall === waClosedGate) {
    const w = c.wall;
    c.wall = waNone;
    for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).wall === w)
      flashCell(c.move(i), killer, flags);
  }
  if (c.wall === waRed1) c.wall = waNone;
  else if (c.wall === waRed2) c.wall = waRed1;
  else if (c.wall === waRed3) c.wall = waRed2;

  if (c.wall === waBarrowWall) c.wall = waBarrowDig;
  else if (c.wall === waBarrowDig) c.wall = waNone;

  if (c.wall !== ow && ow) drawParticles(c, winf[ow].color, 16);

  if (hasTimeout(c) && c.wparam < 77) c.wparam = 77;
  if (isActivable(c))
    activateActiv(c, false);
}

export function activateFlashFrom(cf: cell, who: eMonster, flags: flagtype): void {
  drawFlash(cf);
  orig_wall = G.cwt.at.wall;
  playSound(cf, 'storm');
  for (let i = 0; i < isize(G.dcal); i++) {
    const c = G.dcal[i];
    if (c === cf) continue;
    nexti: for (let t = 0; t < c.type; t++)
      for (let u = 0; u < cf.type; u++)
        if (c.move(t) === cf.move(u) && c.move(t) !== null) {
          flashCell(c, who, flags);
          break nexti;
        }
  }
}

export function distanceBound(c1: cell, c2: cell, d: number): boolean {
  if (!c1 || !c2) return false;
  if (d === 0) return c1 === c2;
  for (let i = 0; i < c2.type; i++)
    if (distanceBound(c1, c2.move(i), d - 1)) return true;
  return false;
}

export function checkFreedom(cf: cell): void {
  const cl = new manual_celllister();
  const d = G.orbused.slice();
  try {
    cl.add(cf);
    for (let i = 0; i < isize(cl.lst); i++) {
      const c = cl.lst[i];
      if (c.cpdist >= 5) return;
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        // todo leader
        if (cl.listed(c2)) continue;
        if (!passable(c2, c, P_ISPLAYER | P_MIRROR | P_LEADER)) continue;
        if (againstRose(c, c2) && !scentResistant()) continue;
        if (c2.wall === waArrowTrap && c2.wparam === 2) continue;
        let monsterhere = false;
        for (let j = 0; j < c2.type; j++) {
          const c3 = c2.move(j);
          if (c3 && c3.monst && !isFriendly(c3))
            monsterhere = true;
        }
        if (!monsterhere) cl.add(c2);
      }
    }
    addMessage(XLAT('Your %1 activates!', spI(itOrbFreedom)));
    drainOrb(itOrbFreedom);
    orig_wall = G.cwt.at.wall;
    for (const pc of player_positions())
      drawBigFlash(pc);
    for (let i = 0; i < isize(G.dcal); i++) {
      const c = G.dcal[i];
      if (c === cf && !G.shmup_on) continue;
      if (c.cpdist > 5) break;
      flashCell(c, moPlayer, AF_MAGIC);
    }
  }
  finally {
    for (let i = 0; i < d.length; i++) G.orbused[i] = d[i];
    cl.destroy();
  }
}

export function activateFlash(): void {
  const tk = tkills();

  for (const pc of player_positions())
    drawFlash(pc);

  addMessage(XLAT('You activate the Flash spell!'));
  orig_wall = G.cwt.at.wall;
  playSound(G.cwt.at, 'storm');
  drainOrb(itOrbFlash);
  for (let i = 0; i < isize(G.dcal); i++) {
    const c = G.dcal[i];
    if (c.cpdist > 2) break;
    flashCell(c, moPlayer, AF_MAGIC);
  }
  achievement_count('FLASH', tkills(), tk);
}

export function reflectingBarrierAt(c: cell): boolean {
  return c.wall === waBarrier || c.wall === waCamelot ||
    c.wall === waPalace || c.wall === waPlatform ||
    c.wall === waTempWall || c.wall === waWarpGate || c.wall === waBarrowDig || c.wall === waBarrowWall;
}

/** reflectingBarrierAt(cellwalker& c, int d) */
export function reflectingBarrierAt_cw(c: cellwalker, d: number): boolean {
  if (d >= 3) return true;
  if (d <= -3) return true;
  d = gmod(c.spin + d, c.at.type);
  if (!c.at.move(d)) return true;

  return reflectingBarrierAt(c.at.move(d));
}

export function killAdjacentSharks(c: cell): void {
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i);
    if (!c2) continue;
    if (isShark(c2.monst)) {
      changes.ccell(c2);
      c2.ligon = 1;
      killMonster(c2, moLightningBolt);
      killAdjacentSharks(c2);
    }
    if (isKraken(c2.monst) && isWatery(c2)) {
      changes.ccell(c2);
      const c3 = kraken_head(c2);
      changes.ccell(c3);
      c3.ligon = 1;
      for (let j = 0; j < c3.type; j++) {
        const c4 = c3.move(j); if (!c4) continue;
        changes.ccell(c4), killMonster(c4, moLightningBolt); // kill-all
      }
      for (let j = 0; j < c3.type; j++) {
        const c4 = c3.move(j); if (!c4) continue;
        if (isWatery(c4)) {
          c4.ligon = 1;
          killAdjacentSharks(c4);
        }
      }
    }
  }
}

export function castLightningBolt(lig: cellwalker): void {
  lig = lig.clone();
  let bnc = 0;
  let counter = 1000;
  while (true) {
    counter--; if (counter < 0) break;

    killAdjacentSharks(lig.at);

    if (lig.peek() === null) break;

    lig.addStep();
    if (inmirror(lig.at)) lig = mirror_reflect(lig);

    const c = lig.at;
    changes.ccell(c);

    const ow = c.wall;

    flashAlchemist(c);
    if (c.monst === moMetalBeast2 && !c.item) c.item = itFulgurite;
    if (c.monst)
      if (canAttack(null!, moPlayer, c, c.monst, AF_MAGIC))
        attackMonster(c, AF_MAGIC, moLightningBolt);
    if (isIcyLand(c)) c.LHU.heat += 2;
    if (c.land === laDryForest) c.landparam += 2;
    const first = !c.ligon;
    c.ligon = 1;

    let brk = false, spin = false;

    if (c.wall === waGargoyle) brk = true;
    if (c.wall === waExplosiveBarrel) explodeBarrel(c), brk = true;
    if (c.wall === waCavewall) c.wall = waCavefloor, brk = true;
    if (c.wall === waDeadTroll) c.wall = waCavefloor, brk = true;
    if (c.wall === waDeadTroll2) c.wall = waNone, brk = true;
    if (c.wall === waPetrified) c.wall = waNone, brk = true;
    if (c.wall === waDeadfloor2) c.wall = waDeadfloor;
    if (c.wall === waRubble) c.wall = waNone;
    if (c.wall === waDeadwall) c.wall = waDeadfloor2, brk = true;
    if (c.wall === waGlass) c.wall = waNone, spin = true;
    if (c.wall === waDune) c.wall = waNone, brk = true;
    if (c.wall === waRuinWall) c.wall = waNone;
    if (c.wall === waIcewall) c.wall = waNone, brk = true;
    if (c.wall === waAncientGrave) c.wall = waNone, spin = true;
    if (c.wall === waFreshGrave) c.wall = waNone, spin = true;

    if (c.wall === waFreshGrave) c.wall = waNone, spin = true;

    if (c.wall === waBigStatue) c.wall = waNone, spin = true;
    if (c.wall === waColumn) c.wall = waNone, spin = true;
    if (c.wall === waStone) c.wall = waNone, brk = true, destroyTrapsAround(c);
    if (c.wall === waArrowTrap) activateArrowTrap(c);
    if (c.wall === waTerraWarrior) c.wall = waNone, G.kills[moTerraWarrior]++;

    if (c.wall === waCanopy || c.wall === waTrunk || c.wall === waBigBush || c.wall === waSmallBush) {
      makeflame(c, 12, false); brk = true;
    }

    if (c.wall === waGrounded) brk = true;
    if (c.wall === waFan) spin = true;
    if (c.wall === waMetal) c.wall = waCharged, brk = true;
    if (c.wall === waSandstone) {
      c.wall = waNone, brk = true;
      if (c.land === laStorms) c.item = itFulgurite;
    }

    if (c.wall === waCharged && first) {
      for (let i = 0; i < c.type; i++)
        // do not do strange things in horocyclic spires
        if (c.move(i) && c.move(i).wall !== waCharged) {
          const lig2 = new cellwalker(c, i);
          castLightningBolt(lig2);
        }
      brk = true;
    }

    if (c.wall === waBoat && c !== G.cwt.at) become_water(c), spin = true;
    if (c.wall === waStrandedBoat && c !== G.cwt.at) c.wall = waNone, spin = true;

    if ((c.wall === waNone || c.wall === waSea) && c.land === laLivefjord)
      c.wall = c.wall ^ waSea ^ waNone;

    if (c.wall === waRed1) c.wall = waNone;
    if (c.wall === waRed2) c.wall = waRed1;
    if (c.wall === waRed3) c.wall = waRed2, brk = true;

    if (isActivable(c)) activateActiv(c, false);
    if (c.wall === waBigTree || c.wall === waSmallTree || c.wall === waVinePlant ||
      c.wall === waSaloon) {
      makeflame(c, 4, false);
      brk = true;
    }
    if (c.wall === waDock) makeflame(c, 5, false);
    if (c.wall === waCTree) makeflame(c, 12, false);
    if (c.wall === waRose) makeflame(c, 60, false);
    if (cellHalfvine(c) && c.wall === lig.peek().wall) {
      destroyHalfvine(c, waPartialFire, 4);
      brk = true;
    }

    if (c.wall !== ow && ow)
      drawParticles(c, winf[ow].color, 16);

    if (c === G.cwt.at) { bnc++; if (bnc > 10) break; }
    if (spin) lig.add(hrand(lig.at.type));

    if (brk) break;

    if (reflectingBarrierAt(c)) {
      let left = -1;
      let right = 1;
      while (!reflectingBarrierAt_cw(lig, left)) left--;
      while (!reflectingBarrierAt_cw(lig, right)) right++;
      lig.add(right + left);
      if (c.wall === waBarrowWall) c.wall = waBarrowDig;
      else if (c.wall === waBarrowDig) c.wall = waNone;
      bnc++; if (bnc > 10) break;
    }
    else
      lig.addRev();

    if (lig.at.wall === waCloud) {
      lig.at.wall = waNone;
      mirror_createMirages(lig, mirror_LIGHTNING);
    }
    if (lig.at.wall === waMirror) {
      lig.at.wall = waNone;
      mirror_createMirrors(lig, mirror_LIGHTNING);
    }
  }
}

export function castLightningBoltFrom(c: cell): void {
  orig_wall = c.wall;
  for (let i = 0; i < c.type; i++) castLightningBolt(new cellwalker(c, i));
}

export function activateLightning(): void {
  const tk = tkills();
  drawLightning();
  addMessage(XLAT('You activate the Lightning spell!'));

  for (let i = 0; i < isize(G.dcal); i++) if (G.dcal[i]) G.dcal[i].ligon = 0;

  drainOrb(itOrbLightning);

  for (const pc of player_positions())
    castLightningBoltFrom(pc);

  G.elec_afterOrb = true;
  elec_act();
  G.elec_afterOrb = false;

  achievement_count('LIGHTNING', tkills(), tk);
  playSound(G.cwt.at, 'storm');
}

// roCheck: return orb type if successful, 0 otherwise
// roMouse/roKeyboard:
//    return orb type if successful, eItem(-1) if do nothing, 0 otherwise

export function haveRangedTarget(complete: boolean): boolean {
  G.orb_used_where.clear();
  if (!haveRangedOrb())
    return false;
  for (let i = 0; i < isize(G.dcal); i++) {
    const c = G.dcal[i];
    const it = targetRangedOrb(c, roCheck);
    if (it) {
      if (complete && !G.orb_used_where.has(it)) G.orb_used_where.set(it, c);
      else return true;
    }
  }
  if (complete) return G.orb_used_where.size > 0;
  return false;
}

function checkmoveO(): void {
  G.bow_bowpath_map.clear();
  if (G.multi_players > 1 && multi_activePlayers() === 1)
    multi_checklastmove();
  if (G.multi_players === 1) checkmove(false);
}

function teleportAction(): number {
  // normal teleport
  if (G.shmup_on || numplayers() === 1) return 1;
  // multi-player, but all in -- do nothing
  else if (numplayers() === multi_activePlayers()) return 0;
  // otherwise teleport to the game
  else return 2;
}

export function teleportTo(dest: cell): void {
  playSound(dest, 'other-teleport');
  if (dest.monst) {
    G.cwt.at.monst = dest.monst;
    G.cwt.at.stuntime = dest.stuntime;
    dest.monst = moNone;
  }

  if (teleportAction() === 2) {
    const b = multiRevival(dest, null!);
    if (b) {
      killFriendlyIvy();
      drainOrb(itOrbTeleport);
      movecost(G.cwt.at, dest, 3);
      playerMoveEffects(new movei(G.cwt.at, dest, TELEPORT));
      afterplayermoved();
      bfs();
      advance_tides();
    }
    return;
  }

  addMessage(XLAT('You teleport to a new location!'));

  killFriendlyIvy();
  const from = G.cwt.at;
  movecost(from, dest, 1);
  playerMoveEffects(new movei(G.cwt.at, dest, TELEPORT));
  fix_whichcopy(dest);
  G.cwt.at = dest; G.cwt.spin = hrand(dest.type); G.flipplayer = !!(hrand(2));
  drainOrb(itOrbTeleport);

  mirror_destroyAll();

  afterplayermoved();
  bfs();
  advance_tides();

  sword_reset();
  G.items[itOrbSword2] = 0;
  if (G.shmup_on)
    shmup_teleported();
  else
    checkmoveO();

  movecost(from, dest, 2);
  // CAP_COMPLEX2
  mine_auto_teleport_charges();
}

/** calls changes.rollback or changes.commit */
export function jumpTo(a: orbAction, dest: cell, byWhat: eItem, bonuskill: number, jdata: jumpdata): boolean {
  if (byWhat !== itStrongWind) playSound(dest, 'orb-frog');
  let from = G.cwt.at;
  keep_cwt();
  changes.ccell(dest);
  changes.ccell(G.cwt.at);
  changes.value_keep_array(G.sword_dir);

  if (byWhat === itOrbFrog) {
    useupOrb(itOrbFrog, 5);
    addMessage(XLAT('You jump!'));
  }

  if (byWhat === itOrbDash) {
    useupOrb(itOrbDash, 5);
    if (jdata.dashmon) addMessage(XLAT('You vault over %the1!', spM(jdata.dashmon)));
  }

  if (byWhat === itOrbPhasing) {
    useupOrb(itOrbPhasing, 5);
    const phasecell = jdata.jumpthru;
    if (phasecell.monst)
      addMessage(XLAT('You phase through %the1!', spM(phasecell.monst)));
    else
      addMessage(XLAT('You phase through %the1!', spW(phasecell.wall)));
  }

  movecost(from, dest, 1);

  killFriendlyIvy();

  const c1 = G.cwt.at;
  animateMovement(match(G.cwt.at, dest), LAYER_SMALL);
  G.cwt.at = dest;
  for (let i = 0; i < dest.type; i++) {
    const c2 = dest.move(i); if (!c2) continue;
    if (c2.cpdist < dest.cpdist) {
      G.cwt.spin = i;
      changes.value_keep(G, 'flipplayer');
      G.flipplayer = true;
    }
  }

  if (jdata.uniq) {
    const numbb = [0, 0];
    // println(hlog, "moves = ", isize(jdata.moves));
    for (let a = 0; a < 2; a++) numbb[a] = 0;
    for (let a = 0; a < 2; a++) {
      const mt = jdata.moves[a].t;
      do_swords(jdata.moves[a], moPlayer,
        (c: cell, bb: number) => { if (swordAttack(mt, moPlayer, c, bb)) numbb[bb]++; });
      G.sword_dir[G.multi_cpid] = sword_shift(jdata.moves[a], G.sword_dir[G.multi_cpid]);
    }
    for (let bb = 0; bb < 2; bb++) achievement_count('SLASH', numbb[bb], 0);
  }
  else {
    sword_reset();
  }

  const mi = new movei(c1, dest, JUMP);
  stabbingAttack(mi, moPlayer, bonuskill);
  playerMoveEffects(mi);

  if (itemclass(byWhat) === IC_ORB)
    apply_impact(dest);

  // do not apply movecost later, when from no longer exists
  if (G.cwt.at.item === itOrbSafety) {
    movecost(from, dest, 2);
    from = null!;
  }
  if (G.cwt.at.item !== itOrbYendor && G.cwt.at.item !== itHolyGrail && !cantGetGrimoire(G.cwt.at, true)) {
    const c = collectItem(G.cwt.at, from, true);
    if (c) {
      return true;
    }
  }

  mirror_destroyAll();

  if (monstersnearO(a, dest)) {
    changes.rollback();
    return false;
  }

  if (isCheck(a)) {
    changes.rollback();
    return true;
  }

  changes.commit();

  fix_whichcopy(dest);
  countLocalTreasure();

  const low = 7 - getDistLimit() - G.genrange_bonus;
  for (let i = 9; i >= low; i--)
    setdist(G.cwt.at, i, null!);

  if (from) movecost(from, dest, 2);

  createNoise(1);
  G.bow_bowpath_map.clear();

  if (G.shmup_on)
    shmup_teleported();
  else
    monstersTurn();

  return true;
}

/** calls changes.rollback or changes.commit */
function growIvyTo(a: orbAction, mi: movei): boolean {
  const dest = mi.t;
  let f = AF_NORMAL | AF_MSG;
  if (G.items[itOrbEmpathy] && G.items[itOrbSlaying]) {
    if (!canAttack(mi.s, moFriendlyIvy, mi.t, mi.t.monst, AF_MUSTKILL)) {
      markOrb(itOrbEmpathy); markOrb(itOrbSlaying);
    }
    f |= AF_CRUSH;
  }

  changes.ccell(dest);

  if (dest.monst)
    attackMonster(dest, f, moFriendlyIvy);
  else {
    dest.monst = moFriendlyIvy;
    dest.mondir = mi.rev_dir_or(NODIR);
    animateMovement(mi, LAYER_BIG);
    moveEffect(mi, moFriendlyIvy);
    empathyMove(mi);
  }

  apply_impact(dest);
  markOrb(itOrbNature);

  if (monstersnearO(a, G.cwt.at)) {
    changes.rollback();
    return false;
  }

  if (isCheck(a)) {
    changes.rollback();
    return true;
  }

  changes.commit();
  createNoise(1);
  monstersTurn();
  return true;
}

function spacedrain(c: cell): [number, boolean] {
  let d = c.cpdist;
  const usemagnet = !!G.items[itOrbMagnetism] && d > 0;
  if (usemagnet) d--;
  return [d * d, usemagnet];
}

function telekinesis(dest: cell): void {

  const cost = spacedrain(dest);

  if (dest.land === laAlchemist && isAlchAny(dest) && isAlchAny(G.cwt.at))
    dest.wall = G.cwt.at.wall;

  if (dest.land === laPower && G.cwt.at.land !== laPower && dest.item !== itOrbFire && dest.item !== itOrbLife) {
    if (itemclass(dest.item) !== IC_ORB)
      G.items[dest.item]++;
    else
      G.items[dest.item] += 2;
    addMessage(XLAT('The Orb loses its power as it leaves the Land of Power!'));
    dest.item = itNone;
  }

  if (dest.wall === waGlass) {
    drainOrb(itOrbSpace);
    addMessage(XLAT('Your power is drained by %the1!', spW(dest.wall)));
  }

  moveItem(dest, G.cwt.at, true);
  const it = G.cwt.at.item;
  const saf = it === itOrbSafety;
  collectItem(G.cwt.at, G.cwt.at, true);
  if (saf) { /* */ }
  else if (G.cwt.at.item === it)
    animateMovement(match(dest, G.cwt.at), LAYER_BOAT);
  else
    animate_item_throw(dest, G.cwt.at, it);

  useupOrb(itOrbSpace, cost[0]);
  if (cost[1])
    markOrb(itOrbMagnetism);

  createNoise(3);
  checkSwitch();
  bfs();
  if (!G.shmup_on) checkmoveO();
}

export function summonedAt(dest: cell): eMonster {
  if (dest.monst) return moNone;
  if (dest.wall === waVineHalfA || dest.wall === waVineHalfB || dest.wall === waVinePlant)
    return moVineSpirit;
  if (dest.wall === waCTree)
    return moParrot;
  if (dest.wall === waLake)
    return moGreaterShark;
  if (dest.wall === waAncientGrave || dest.wall === waFreshGrave)
    return moGhost;
  if (dest.wall === waClosePlate || dest.wall === waOpenPlate)
    return dest.land === laPalace ? moPalace : moBat;
  if (dest.wall === waFloorA || dest.wall === waFloorB)
    return moSlime;
  if (dest.wall === waCavefloor)
    return moTroll;
  if (dest.wall === waDeadfloor)
    return moEarthElemental;
  if (dest.wall === waDeadfloor2)
    return moMiner;
  if (dest.wall === waMineOpen || dest.wall === waMineMine || dest.wall === waMineUnknown)
    return moBomberbird;
  if (dest.wall === waRichDie)
    return moAnimatedDie;
  if (dest.wall === waHappyDie)
    return moAngryDie;
  if (dest.wall === waTrapdoor)
    return dest.land === laPalace ? moFatGuard : moOrangeDog;
  if (dest.land === laFrog && dest.wall === waNone) {
    for (let i = 0; i < dest.type; i++) { const c1 = dest.move(i); if (c1 && c1.wall === waShrub) return moVaulter; }
    for (let i = 0; i < dest.type; i++) { const c1 = dest.move(i); if (c1 && c1.wall === waDeepWater) return moFrog; }
    for (let i = 0; i < dest.type; i++) { const c1 = dest.move(i); if (c1 && c1.wall === waStone) return moPhaser; }
  }
  if (dest.wall === waSea)
    return isElemental(dest.land) ? moWaterElemental :
      dest.land === laLivefjord ? moViking :
      dest.land === laKraken ? moViking :
      dest.land === laWarpCoast ? moRatling :
      dest.land === laDocks ? moWaterElemental :
      moPirate;
  if (among(dest.wall, waDeepWater, waShallow))
    return moRusalka;
  if (dest.wall === waCamelotMoat)
    return moWaterElemental;
  if (isReptile(dest.wall))
    return moReptile;
  if (dest.wall === waChasm)
    return moAirElemental;
  if (isFire(dest) || dest.wall === waMagma)
    return moFireElemental;
  if (dest.wall === waCavewall || dest.wall === waDeadwall)
    return moSeep;
  if (dest.wall === waRed1 || dest.wall === waRed2 || dest.wall === waRed3)
    return moRedTroll;
  if (dest.wall === waFrozenLake)
    return moFireElemental;
  if (dest.wall === waCIsland || dest.wall === waCIsland2)
    return moWaterElemental;
  if (dest.wall === waRubble || dest.wall === waGargoyleFloor || dest.wall === waGargoyleBridge || dest.wall === waLadder)
    return moGargoyle;
  if (dest.wall === waStrandedBoat)
    return moWaterElemental;
  if (dest.wall === waBoat)
    return moAirElemental;
  if (dest.wall === waStone || dest.wall === waRuinWall)
    return moEarthElemental;
  if (dest.wall === waGiantRug)
    return moVizier;
  if (dest.wall === waNone) {
    if (dest.land === laHunting) return moAirElemental;
    if (dest.land === laBull) return moRagingBull;
    if (dest.land === laPrairie) return moAirElemental;
    if (dest.land === laZebra) return moAirElemental;
    if (dest.land === laMirror) return moAirElemental;
    if (dest.land === laMountain) return moAirElemental; // unfortunately Ivies are too large
    if (dest.land === laDungeon) return moBat;
    if (dest.land === laIce) return moFireElemental;
    if (dest.land === laDesert) return moEarthElemental;
    if (dest.land === laJungle) return moWaterElemental;
    if (dest.land === laGraveyard) return moZombie;
    if (dest.land === laRlyeh || dest.land === laTemple) return moPyroCultist;
    if (dest.land === laHell) return moWaterElemental;
    if (dest.land === laPower) return moWitchFire;
    if (dest.land === laWineyard) return moVineBeast;
    if (dest.land === laEmerald) return moMiner;
    if (dest.land === laHive) return dest.type === 7 ? moBug1 : moBug0;
    if (dest.land === laRedRock) return moRedTroll;
    if (dest.land === laOcean) return moEarthElemental;
    if (dest.land === laDryForest) return moFireFairy;
    if (dest.land === laLivefjord) return moFjordTroll;
    if (dest.land === laStorms) return moStormTroll;
    if (dest.land === laOvergrown) return moForestTroll;
    if (dest.land === laIvoryTower) return moAirElemental;
    if (dest.land === laEndorian) return moAirElemental;
    if (dest.land === laEAir) return moAirElemental;
    if (dest.land === laEWater) return moWaterElemental;
    if (dest.land === laEEarth) return moEarthElemental;
    if (dest.land === laEFire) return moFireElemental;
    if (dest.land === laMotion) return moRunDog;
    if (dest.land === laWildWest) return moOutlaw;
    if (dest.land === laClearing) return moForestTroll;
    if (dest.land === laWhirlwind) return moAirElemental;
    if (dest.land === laWarpCoast) return moRatling;
    if (dest.land === laRose) return moRoseLady;
    if (dest.land === laDragon) return moFireElemental;
    if (dest.land === laTortoise) return moTortoise;
    if (dest.land === laBurial) return moEarthElemental;
    if (dest.land === laVolcano) return moFireElemental;
    if (dest.land === laBlizzard) return moAirElemental;
    if (dest.land === laTerracotta) return moEarthElemental;
    if (dest.land === laRuins) return moEarthElemental;
    if (dest.land === laSwitch) return G.passive_switch;
    if (dest.land === laSnakeNest) return moEarthElemental;
    if (dest.land === laBrownian) return moAcidBird;
    if (dest.land === laVariant) return moFireElemental;
    if (dest.land === laWestWall) return moAirElemental;
    if (isHaunted(dest.land)) return moGhost;
  }
  return moNone;
}

function summonAt(dest: cell): void {
  playSound(dest, 'orb-ranged');
  dest.monst = summonedAt(dest);
  dest.stuntime = 3;
  if (dest.monst === moPirate || dest.monst === moViking || (dest.monst === moRatling && dest.wall === waSea))
    dest.wall = waBoat, dest.item = itNone;
  if (dest.monst === moAnimatedDie)
    dest.wall = waNone;
  if (dest.monst === moAngryDie)
    dest.wall = waNone;
  if (dest.monst === moViking && dest.land === laKraken)
    dest.item = itOrbFish;
  if (dest.wall === waStrandedBoat)
    dest.wall = waBoat;
  else if (dest.monst === moWaterElemental)
    placeWater(dest, dest);
  if (dest.wall === waStone)
    dest.wall = waNone;
  if (dest.monst === moFireElemental && isFire(dest))
    dest.wall = waNone;
  if (dest.monst === moTortoise)
    G.tortoise_emap.set(dest, getBits(dest)), dest.hitpoints = 3;
  addMessage(XLAT('You summon %the1!', spM(dest.monst)));
  moveEffect(movei.sd(dest, FALL), dest.monst);
  if (dest.wall === waClosePlate || dest.wall === waOpenPlate)
    toggleGates_w(dest, dest.wall);

  if (hasHitpoints(dest.monst))
    dest.hitpoints = palaceHP();

  useupOrb(itOrbSummon, 20);
  createNoise(2);
  bfs();
  checkmoveO();
}

function tempWallPossibleAt(dest: cell): boolean {
  if (dest.land === laWestWall) return false;
  if (dest.monst || (dest.item && !itemHidden(dest))) return false;
  return dest.wall === waChasm || isWatery(dest) || dest.wall === waNone ||
    dest.wall === waTempBridge;
}

function tempWallAt(dest: cell): void {
  if (dest.wall === waChasm)
    dest.wall = waTempFloor;
  else if (dest.wall === waNone)
    dest.wall = waTempWall;
  else if (dest.wall === waTempBridge) {
    dest.wall = waTempBridgeBlocked;
    return;
  }
  else if (isWatery(dest))
    dest.wall = waTempBridge;
  const len = idiv(G.items[itOrbMatter] + 1, 2);
  dest.wparam = len;
  useupOrb(itOrbMatter, len);
  dest.item = itNone; // underwater items are destroyed by this
  createNoise(2);
  bfs();
  checkmoveO();
}

function psi_attack(dest: cell): void {
  playSound(dest, 'other-mind');
  if (isNonliving(dest.monst))
    addMessage(XLAT('You destroy %the1 with a mental blast!', spM(dest.monst)));
  else if (isDragon(dest.monst) || isKraken(dest.monst))
    addMessage(XLAT('You damage %the1 with a mental blast!', spM(dest.monst)));
  else
    addMessage(XLAT('You kill %the1 with a mental blast!', spM(dest.monst)));
  // note: psi attack works with Petrify!
  attackMonster(dest, AF_PSI, moPlayer);
  useupOrb(itOrbPsi, 30);
  createNoise(2);
  bfs();
  checkmoveO();
}

function gun_attack(a: orbAction, dest: cell): boolean {
  playSound(dest, 'orb-ranged');
  addMessage(XLAT('You shoot %the1!', spM(dest.monst)));
  changes.ccell(dest);
  attackMonster(dest, AF_GUN, moNone);
  apply_impact(dest);

  if (monstersnearO(a, G.cwt.at)) {
    changes.rollback();
    return false;
  }
  if (isCheck(a)) {
    changes.rollback();
    return true;
  }
  changes.commit();
  G.items[itRevolver]--;
  bfs();
  checkmoveO();
  createNoise(5);
  monstersTurn();
  return true;
}

export function checkStunKill(dest: cell): void {
  if (isBird(dest.monst)) {
    moveEffect(movei.sd(dest, FALL), moDeadBird);
    doesFall(dest);
    if (isWatery(dest) || dest.wall === waChasm || isFire(dest)) {
      addMessage(XLAT('%The1 falls!', spM(dest.monst)));
      fallMonster(dest);
      return;
    }
  }
  if (dest.monst === moShadow) {
    addMessage(XLAT('%The1 is destroyed!', spM(dest.monst)));
    killMonster(dest, moNone);
  }
  /* if(!isPermanentFlying(dest->monst) && cellEdgeUnstable(dest)) {
    addMessage(XLAT("%The1 falls!", dest->monst));
    fallMonster(dest);
    } */
}

function stun_attack(dest: cell): void {
  playSound(dest, 'orb-ranged');
  addMessage(XLAT('You stun %the1!', spM(dest.monst)));
  dest.stuntime += 5;
  checkStunKill(dest);
  useupOrb(itOrbStunning, 10);
  createNoise(3);
  bfs();
  checkmoveO();
}

export function pick_poly_monster(orig: eMonster): eMonster {
  const polymonsters = [
    moYeti, moRunDog, moRanger,
    moMonkey, moCultist,
    moFallingDog, moVariantWarrior, moFamiliar, moOrangeDog,
    moRedFox, moFalsePrincess, moResearcher,
    moNarciss,
  ];
  let ssf = 0;
  let target = polymonsters[hrand(isize(polymonsters))];
  for (const m of polymonsters)
    if (G.kills[m] && m !== orig) {
      ssf += G.kills[m];
      if (hrand(ssf) < G.kills[m])
        target = m;
    }
  return target;
}

function poly_attack(dest: cell): void {
  playSound(dest, 'orb-ranged');
  const orig = dest.monst;
  const target = pick_poly_monster(orig);
  addMessage(XLAT('You polymorph %the1 into %the2!', spM(dest.monst), spM(target)));
  dest.monst = target;
  if (!dest.stuntime) dest.stuntime = 1;

  if (is_paired(orig)) {
    const dest2 = dest.move(dest.mondir);
    if (is_paired(dest2.monst)) {
      dest2.monst = dest.monst;
      if (!dest2.stuntime) dest2.stuntime = 1;
    }
  }

  checkStunKill(dest);
  useupOrb(itOrbMorph, 3);
  createNoise(3);
  bfs();
  checkmoveO();
}

function placeIllusion(c: cell): void {
  c.monst = moIllusion;
  c.stuntime = 0;
  useupOrb(itOrbIllusion, 5);
  addMessage(XLAT('You create an Illusion!'));
  bfs();
  checkmoveO();
}

function blowoff(mi: movei): void {
  const cf = mi.s;
  const ct = mi.t;
  const die = cf.wall === waRichDie;
  playSound(ct, 'orb-ranged');
  if (cf.monst === moVoidBeast)
    addMessage(XLAT('You blow %the1 closer!', spM(cf.monst)));
  else if (cf.monst)
    addMessage(XLAT('You blow %the1 away!', spM(cf.monst)));
  if (cf.wall === waThumperOff) activateActiv(cf, false);
  if (isPushable(cf.wall) || cf.wall === waBigStatue)
    pushThumper(mi);
  else if (isBoat(cf) && !cf.monst) {
    const was_stranded = cf.wall === waStrandedBoat;
    const willbe_stranded = ct.wall === waNone;
    if (was_stranded) cf.wall = waBoat;
    if (willbe_stranded) become_water(ct);
    moveBoat(mi);
    if (was_stranded) cf.wall = waNone;
    if (willbe_stranded) ct.wall = waStrandedBoat;
  }
  else
    pushMonster(mi);
  if (cf.item === itBabyTortoise) {
    if (ct.item) ct.item = itNone;
    moveItem(cf, ct, true);
  }
  // CAP_COMPLEX2
  if (ct.monst === moAnimatedDie && dice_data_at(ct).happy() > 0) {
    ct.monst = moNone;
    ct.wall = waHappyDie;
    if (ct.land === laDice && cf.land === laDice) {
      cf.item = itDice;
      addMessage(XLAT('The die is now happy, and you are rewarded!'));
    }
  }
  if (die && ct.wall === waHappyDie) {
    /* pushMonster already awarded us -- place the reward on cf instead */
    cf.item = itDice;
    G.items[itDice]--;
  }
  if (ct.wall === waHappyDie && dice_data_at(ct).happy() <= 0) {
    ct.monst = moAngryDie;
    ct.wall = waNone;
    ct.stuntime = 5;
    addMessage(XLAT('You have made a Happy Die angry!'));
  }
  G.items[itOrbAir]--;
  createNoise(2);
  bfs();
  checkmoveO();
}

function useOrbOfDragon(c: cell): void {
  makeflame(c, 20, false);
  playSound(c, 'fire');
  addMessage(XLAT('You throw fire!'));
  useupOrb(itOrbDragon, 5);
  createNoise(3);
  bfs();
  checkmoveO();
}

export function monstersnearO(a: orbAction, c: cell): boolean {
  if (G.shmup_on) return false;
  if (a === roCheck && G.multi_players > 1)
    return true;
  else if (a === roMultiCheck) return false;
  else return monstersnear(c, moPlayer);
}

export function isCheck(a: orbAction): boolean { return a === roCheck || a === roMultiCheck; }
export function isWeakCheck(a: orbAction): boolean { return a === roCheck || a === roMultiCheck || a === roMouse; }

/** movei blowoff_destination_dir(cell *c, int& di, int rev): di is never written (the loop's di shadows it) */
export function blowoff_destination_dir(c: cell, _di: Ref<number>, rev: number): movei {
  let d = 0;
  for (; d < c.type; d++) if (c.move(d) && rev * c.move(d).cpdist < rev * c.cpdist) break;
  if (d < c.type) for (let e = d; e < d + c.type; e++) {
    const di = e % c.type;
    const c2 = c.move(di);
    // CAP_COMPLEX2
    if (dice_on(c) && !dice_can_roll_mi(movei.sd(c, di)))
      continue;
    if (c2 && rev * c2.cpdist > rev * c.cpdist && passable(c2, c, P_BLOW)) return new movei(c, c2, di);
  }
  return new movei(c, c, NO_SPACE);
}

export function blowoff_destination(c: cell, di: Ref<number>): movei {
  const rev = c.monst === moVoidBeast ? -1 : 1;
  return blowoff_destination_dir(c, di, rev);
}

export function check_jump(cf: cell, ct: cell, flags: flagtype, jdata: jumpdata): number {
  let partial = 1; jdata.uniq = false;
  for (let i = 0; i < cf.type; i++) {
    const c2 = cf.cmove(i);
    if (isNeighbor(c2, ct)) {
      jdata.jumpthru = c2;
      if (passable(c2, cf, flags | P_JUMP1)) {
        partial = 2;
        if (passable(ct, c2, flags | P_JUMP2)) {
          return 3;
        }
      }
    }
  }
  return partial;
}

export function check_phase(cf: cell, ct: cell, flags: flagtype, jdata: jumpdata): number {
  let partial = 1; jdata.uniq = false;
  for (let i = 0; i < cf.type; i++) {
    const c2 = cf.cmove(i);
    if (isNeighbor(c2, ct) && !nonAdjacent(cf, c2) && !nonAdjacent(c2, ct)) {
      jdata.jumpthru = c2;
      if (passable(ct, cf, flags | P_PHASE)) {
        partial = 2;
        if (c2.monst || (isWall(c2) && c2.wall !== waShrub)) {
          return 3;
        }
      }
    }
  }
  return partial;
}

export function common_neighbor(cf: cell, ct: cell): cell {
  for (let i = 0; i < cf.type; i++) {
    const cc = cf.cmove(i);
    if (isNeighbor(cc, ct)) return cc;
  }
  return null!;
}

export function apply_impact(c: cell): void {
  if (markOrb(itOrbImpact))
    for (let i = 0; i < c.type; i++) {
      const c1 = c.move(i); if (!c1) continue;
      if (!c1.monst) continue;
      if (c1.monst === moMimic) continue;
      if (isMultitile(c1.monst)) continue;
      addMessage(XLAT('You stun %the1!', spM(c1.monst)));
      changes.ccell(c1);
      c1.stuntime = Math.min(c1.stuntime + 5, 7);
      checkStunKill(c1);
    }
}

export function check_vault(cf: cell, ct: cell, flags: flagtype, jdata: jumpdata): number {
  let c2: cell = null!, c3: cell = null!;
  for (let i = 0; i < cf.type; i++) {
    const cc = cf.cmove(i);
    if (isNeighbor(cc, ct) && c2 !== cc) c3 = c2, c2 = cc;
  }
  if (!c2) return 0;
  if (c3) return 1;
  jdata.moves.push(new movei(cf, c2, neighborId(cf, c2)));
  jdata.moves.push(new movei(c2, ct, neighborId(c2, ct)));
  jdata.jumpthru = c2;
  jdata.uniq = true;
  const cutwall = among(c2.wall, waShrub, waExplosiveBarrel, waSmallTree, waBigTree);
  if (!c2.monst && !cutwall) return 2;
  const for_monster = !(flags & P_ISPLAYER);
  if (for_monster && c2.monst && frog_power(c2.monst) && !G.items[itOrbDiscord]) return 2;
  if (!cutwall && !passable(c2, G.cwt.at, flags | P_JUMP1 | P_MONSTER)) return 3;
  if (!passable(ct, c2, flags | P_JUMP2)) return 4;
  if (!cutwall && !canAttack(G.cwt.at, moPlayer, c2, c2.monst, 0n)) return 5;
  return 6;
}

export function targetRangedOrb(c: cell, a: orbAction): eItem {
  // the online game (port only, ONLINE.md): a ranged Orb aimed with the keys or the mouse becomes the local seat's
  // decision (MD_USE_ORB, as multi::handleMulti makes it with roMultiCheck); the rules use it with roMultiGo
  const online = G.online_input;
  if (online && (a === roMouse || a === roKeyboard || a === roMouseForce)) {
    G.online_input = null;
    let it: eItem;
    try { it = targetRangedOrb(c, roMultiCheck); }
    finally { G.online_input = online; }
    if (it && !online(-4 /* MD_USE_ORB */, 1, c)) return itNone;
    return it;
  }

  if (!haveRangedOrb()) {
    if (!isWeakCheck(a))
      addMessage(XLAT('You have no ranged Orbs!'));
    return itNone;
  }

  if (rosedist(G.cwt.at) === 1) {
    const r = map_index(G.rosemap, G.cwt.at, 0);
    const r2 = map_index(G.rosemap, c, 0);
    if (r2 <= r && !markOrb(itOrbBeauty)) {
      if (a === roKeyboard || a === roMouseForce)
        addMessage(XLAT('Those roses smell too nicely. You can only target cells closer to them!'));
      return itNone;
    }
  }

  // (-2) shmup variants
  const shmupEffect = shmup_targetRangedOrb(a);

  if (shmupEffect) return shmupEffect;

  // (-1) distance

  if (!G.disable_orb_range && !mine_in_minesweeper()) {
    if (c === G.cwt.at || isNeighbor(G.cwt.at, c)) {
      if (!isWeakCheck(a))
        addMessage(XLAT('You cannot target that close!'));
      return itNone;
    }
    if (c.cpdist > 7) {
      if (!isWeakCheck(a))
        addMessage(XLAT('You cannot target that far away!'));
      return itNone;
    }
    if (!in_line_of_sight_for_player(c)) {
      if (!isWeakCheck(a))
        addMessage(XLAT('You cannot target what you cannot see!'));
      return itNone;
    }
  }

  const orb_error_messages: string[] = [];

  const CHK = (b: boolean, s: string): boolean => {
    if (b) return true;
    orb_error_messages.push(s);
    return false;
  };
  const INI = (): boolean => { changes.init(isCheck(a)); return true; };
  const CHK_ROLLBACK = (b: boolean, s: string): boolean => {
    if (b) return true;
    orb_error_messages.push(s); changes.rollback();
    return false;
  };

  let wouldkill_there = false;
  let wouldkill_here = false;

  const jdata = new jumpdata();

  // (0-) strong wind
  if (G.items[itStrongWind]
    && CHK(c.cpdist === 2 && G.cwt.at === whirlwind_jumpFromWhereTo(c, true, jdata), XLAT('Strong wind can only take you to a specific place!'))) {
    changes.init(isCheck(a));
    if (jumpTo(a, c, itStrongWind, 0, jdata)) return itStrongWind;
  }

  // (0x) control
  if (G.items[itOrbDomination] && haveMount() && G.dragon_whichturn !== G.turncount) {
    if (!isCheck(a)) {
      G.dragon_target = c;
      G.dragon_whichturn = G.turncount;
      addMessage(XLAT('Commanded %the1!', spM(haveMount())));
      checkmoveO();
    }
    return itOrbDomination;
  }

  // (0) telekinesis

  if (G.items[itOrbSpace]
    && CHK(!!c.item && !itemHiddenFromSight(c), XLAT('%The1 can only be used on items!', spI(itOrbSpace)))
    && CHK(!G.cwt.at.item, XLAT('Cannot use %the1 here!', spI(itOrbSpace)))
    && CHK(!saved_tortoise_on(c), XLAT('No, that would be heartless!'))
    && CHK(G.items[itOrbSpace] >= fixpower(spacedrain(c)[0], isCheck(a)), XLAT('Not enough power for telekinesis!'))
    && CHK(!cantGetGrimoire(c, !isCheck(a)), XLAT('Cannot use %the1 here!', spI(itOrbSpace)))
    && CHK(c.item !== itBarrow, XLAT('%The1 is protected from this kind of magic!', spI(c.item)))
  ) {
    if (!isCheck(a)) {
      const saf = c.item === itOrbSafety;
      telekinesis(c);
      if (!saf) apply_impact(c);
    }
    return itOrbSpace;
  }

  // (0') air blow
  if (G.items[itOrbAir]
    && CHK(isBlowableMonster(c.monst) || isPushable(c.wall) || c.wall === waBigStatue || isBoat(c),
      c.monst ? XLAT('%The1 is immune to wind!', spM(c.monst)) : XLAT('Nothing to blow here!'))
  ) {
    const di = { v: NODIR };
    const mi = blowoff_destination(c, di);
    const c2 = mi.t;
    let nowhereToBlow = false;
    if (!mi.op()) nowhereToBlow = true;
    else if (isBoat(c) && !isWatery(c2) && c2.wall !== waNone) nowhereToBlow = true;
    else if (c.wall === waBigStatue && !canPushStatueOn(c2, P_BLOW)) nowhereToBlow = true;
    else {
      if (!isCheck(a)) blowoff(mi), apply_impact(c);
      return itOrbAir;
    }
    CHK(!nowhereToBlow, isBlowableMonster(c.monst) ? XLAT('Nowhere to blow %the1!', spM(c.monst)) : XLAT('Nowhere to blow %the1!', spW(c.wall)));
  }

  // nature
  if (G.items[itOrbNature]
    && CHK(numplayers() === 1, XLAT('Cannot be used in multiplayer'))
    && CHK(c.monst !== moFriendlyIvy, XLAT('You cannot grow on yourself!'))
  ) {
    changes.init(isCheck(a));
    const dirs: number[] = [];
    for (let d = 0; d < c.type; d++) {
      const cf = c.cmove(d);
      if (cf.monst === moFriendlyIvy) {

        let f = 0n;
        if (G.items[itOrbEmpathy] && G.items[itOrbSlaying]) f |= AF_CRUSH;

        if (c.monst ? (
          CHK(canAttack(cf, moFriendlyIvy, c, c.monst, f), XLAT('Cannot attack there!'))
        ) : (
          CHK(passable(c, cf, P_ISFRIEND | P_MONSTER | P_IVY), XLAT('Cannot grow there!')) &&
          CHK(!strictlyAgainstGravity(c, cf, false, MF_IVY), XLAT('Cannot grow against gravity!'))
        ))
          dirs.push(d);
      }
    }

    const di = hrand_elt(dirs, -1);
    if (CHK(di !== -1, XLAT('You cannot grow there from any adjacent cell!'))) {
      if (growIvyTo(a, movei.sd(c, di).rev()))
        return itOrbNature;
      else
        wouldkill_here = true;
    }
    else changes.rollback();
  }

  // orb of vaulting
  if (!G.shmup_on && G.items[itOrbDash] && CHK(c.cpdist === 2, XLAT('Cannot vault that far!'))) {
    changes.init(isCheck(a));
    let vaultstate = check_vault(G.cwt.at, c, P_ISPLAYER, jdata);

    if (vaultstate === 0) orb_error_messages.push(XLAT('ERROR: No common neighbor to vault through!'));
    if (vaultstate === 1) orb_error_messages.push(XLAT('Can only vault in a roughly straight line!'));
    if (vaultstate === 2) orb_error_messages.push(XLAT('Nothing to vault over!'));
    if (vaultstate === 3) orb_error_messages.push(XLAT('Cannot pass through %the1 while vaulting!', spW(jdata.jumpthru.wall)));
    if (vaultstate === 4 && c.monst) orb_error_messages.push(XLAT('Cannot vault onto %the1!', spM(c.monst)));
    if (vaultstate === 4 && !c.monst) orb_error_messages.push(XLAT('Cannot vault to %the1!', spW(c.wall)));
    if (vaultstate === 5) orb_error_messages.push(XLAT('Cannot attack %the1 while vaulting!', spM(jdata.jumpthru.monst)));

    if (vaultstate === 6) {
      let k = tkills();
      const jumpthru = jdata.jumpthru;
      jdata.dashmon = jumpthru.monst;
      if (jumpthru.wall === waShrub) {
        addMessage(XLAT('You chop down the shrub.'));
        jumpthru.wall = waNone;
      }
      if (jumpthru.wall === waSmallTree) {
        addMessage(XLAT('You chop down the tree.'));
        jumpthru.wall = waNone;
      }
      if (jumpthru.wall === waBigTree) {
        addMessage(XLAT('You start chopping down the tree.'));
        jumpthru.wall = waSmallTree;
      }
      if (jumpthru.wall === waExplosiveBarrel) {
        explodeBarrel(jumpthru);
      }
      if (jdata.dashmon)
        attackMonster(jumpthru, AF_NORMAL | AF_MSG, moPlayer);
      k = tkills() - k;
      if (jumpTo(a, c, itOrbDash, k, jdata)) vaultstate = 7;
      else wouldkill_there = true;
      if (vaultstate === 7) return itOrbDash;
    }
    else changes.rollback();
  }

  if (G.items[itOrbFrog] && CHK(c.cpdist === 2, XLAT('Cannot jump that far!'))) {
    changes.init(isCheck(a));
    let frogstate = check_jump(G.cwt.at, c, P_ISPLAYER, jdata);
    if (frogstate === 1 && jdata.jumpthru && jdata.jumpthru.monst) {
      orb_error_messages.push(XLAT('Cannot jump through %the1!', spM(jdata.jumpthru.monst)));
    }
    else if (frogstate === 1 && jdata.jumpthru) {
      orb_error_messages.push(XLAT('Cannot jump through %the1!', spW(jdata.jumpthru.wall)));
    }
    else if (frogstate === 2 && c.monst) {
      orb_error_messages.push(XLAT('Cannot jump onto %the1!', spM(c.monst)));
    }
    else if (frogstate === 2 && c.wall) {
      orb_error_messages.push(XLAT('Cannot jump on %the1!', spW(c.wall)));
    }

    if (frogstate === 3) {
      if (jumpTo(a, c, itOrbFrog, 0, jdata)) frogstate = 4;
      else wouldkill_there = true;
      if (frogstate === 4) return itOrbFrog;
    }
    else changes.rollback();
  }

  if (G.items[itOrbPhasing] && CHK(c.cpdist === 2, XLAT('Cannot phase that far!'))) {
    if (G.shmup_on) shmup_pushmonsters();
    changes.init(isCheck(a));
    let phasestate = check_phase(G.cwt.at, c, P_ISPLAYER, jdata);
    if (phasestate === 1 && c.monst) {
      orb_error_messages.push(XLAT('Cannot phase onto %the1!', spM(c.monst)));
    }
    else if (phasestate === 1) {
      orb_error_messages.push(XLAT('Cannot phase to %the1!', spW(c.wall)));
    }
    else if (phasestate === 2) {
      orb_error_messages.push(XLAT('Nothing to phase through!'));
    }

    if (phasestate === 3) {
      if (jumpTo(a, c, itOrbPhasing, 0, jdata)) phasestate = 4;
      else wouldkill_there = true;
    }
    else changes.rollback();
    if (G.shmup_on) shmup_popmonsters();
    if (phasestate === 4) return itOrbPhasing;
  }

  // (1) switch with an illusion
  if (G.items[itOrbTeleport] && c.monst === moIllusion
    && CHK(!G.cwt.at.monst, XLAT('You need to move to give space to %the1!', spM(G.cwt.at.monst)))
    && CHK(teleportAction() === 1, XLAT('All players are in the game!'))) {
    if (!isCheck(a)) teleportTo(c), apply_impact(c);
    return itOrbTeleport;
  }

  // (2) place illusion
  if (!G.shmup_on && G.items[itOrbIllusion]
    && CHK(c.monst === moNone, XLAT('Cannot cast illusion on a monster!'))
    && CHK(c.item === itNone || itemHidden(c), XLAT('Cannot cast illusion on an item!'))
    && INI() && CHK_ROLLBACK(passable(c, null!, P_MIRROR), XLAT('Cannot cast illusion here!'))) {
    if (!isCheck(a)) {
      changes.commit(), placeIllusion(c), apply_impact(c);
    }
    else changes.rollback();
    return itOrbIllusion;
  }

  // (3) teleport
  if (G.items[itOrbTeleport]
    && CHK(c.monst === moNone, XLAT('Cannot teleport on a monster!'))
    && CHK(c.item === itNone || itemHidden(c), XLAT('Cannot teleport on an item!'))
    && CHK(!!teleportAction(), XLAT('All players are in the game!'))
    && shmup_verifyTeleport()
    && INI() && CHK_ROLLBACK(passable(c, null!, P_ISPLAYER | P_TELE), XLAT('Cannot teleport here!'))
  ) {
    if (!isCheck(a)) {
      changes.commit(), teleportTo(c), apply_impact(c); // println(hlog, "commiting teleport ", items[itOrbTeleport]);
    }
    else changes.rollback();
    return itOrbTeleport;
  }

  // (4) remove an illusion
  if (!G.shmup_on && G.items[itOrbIllusion] && c.monst === moIllusion) {
    if (!isCheck(a)) {
      addMessage(XLAT('You take the Illusion away.'));
      G.items[itOrbIllusion] += 3; // 100% effective with the Orb of Energy!
      apply_impact(c);
      c.monst = moNone;
    }
    return itOrbIllusion;
  }

  // (4a) colt
  if (G.items[itRevolver] && !G.shmup_on
    && CHK(!!c.monst, XLAT('Can only use %the1 on a monster!', spI(itRevolver)))
    && CHK(canAttack(G.cwt.at, moPlayer, c, c.monst, AF_GUN), XLAT('%The1 is immune to %the2!', spM(c.monst), spI(itRevolver)))
  ) {
    let inrange = false;
    for (const c1 of gun_targets(G.cwt.at)) if (c1 === c) inrange = true;
    if (inrange) {
      changes.init(isCheck(a));
      if (gun_attack(a, c)) return itRevolver;
    }
  }

  // (5) psi blast (non-shmup variant)
  if (!G.shmup_on && G.items[itOrbPsi]
    && CHK(!!c.monst, XLAT('Can only use %the1 on a monster!', spI(itOrbPsi)))
    && CHK((isDragon(c.monst) || !isWorm(c)) && c.monst !== moShadow && c.monst !== moKrakenH, XLAT('%The1 is immune to mental blasts!', spM(c.monst)))
  ) {
    if (!isCheck(a)) psi_attack(c), apply_impact(c);
    return itOrbPsi;
  }

  // (5a) summoning
  if (G.items[itOrbSummon]
    && CHK(!!summonedAt(c), c.monst ? XLAT('Cannot summon on a monster!') : XLAT('No summoning possible here!'))
  ) {
    if (!isCheck(a)) summonAt(c), apply_impact(c);
    return itOrbSummon;
  }

  // (5b) matter
  if (G.items[itOrbMatter]
    && CHK(tempWallPossibleAt(c),
      c.monst ? XLAT('Cannot create temporary matter on a monster!') :
      c.item ? XLAT('Cannot create temporary matter on an item!') :
      XLAT('Cannot create temporary matter here!'))
  ) {
    if (!isCheck(a)) tempWallAt(c), apply_impact(c);
    return itOrbMatter;
  }

  // (5c) stun
  if (G.items[itOrbStunning] && !G.shmup_on
    && CHK(!!c.monst, XLAT('%The1 can only be used on monsters.', spI(itOrbStunning)))
    && CHK(!isMultitile(c.monst), XLAT('%The1 cannot be used on big monsters.', spI(itOrbStunning)))
    && CHK(c.monst !== moMimic, XLAT('%The1 cannot be used on %the2.', spI(itOrbStunning), spM(c.monst)))
    && CHK(c.stuntime < 3, XLAT('%The1 is already stunned!', spM(c.monst)))
  ) {
    if (!isCheck(a)) stun_attack(c), apply_impact(c);
    return itOrbStunning;
  }

  // (5d) poly
  if (G.items[itOrbMorph] && !G.shmup_on
    && CHK(!!c.monst, XLAT('%The1 can only be used on monsters.', spI(itOrbMorph)))
    && CHK(!isMultitile(c.monst), XLAT('%The1 cannot be used on big monsters.', spI(itOrbMorph)))
  ) {
    if (!isCheck(a)) poly_attack(c), apply_impact(c);
    return itOrbMorph;
  }

  // (6) place fire (non-shmup variant)
  if (G.items[itOrbDragon] && !G.shmup_on
    && CHK(makeflame(c, 20, true), XLAT('Cannot throw fire there!'))
  ) {
    if (!isCheck(a)) useOrbOfDragon(c), apply_impact(c);
    return itOrbDragon;
  }

  if (isWeakCheck(a)) return itNone;

  for (const s of orb_error_messages) addMessage(s);

  if (wouldkill_there)
    wouldkill('%The1 would get you there!');
  if (wouldkill_here)
    wouldkill('%The1 would get you if you grew there!');

  return itNone;
}

function isValentines(): boolean {
  const now = time();
  const datetime = localtime(now);

  // 0-indexed tm_mon, 1-indexed tm_mday
  // So this is February (2nd month), and the 14th day.
  return datetime.tm_mon === 1 && datetime.tm_mday === 14;
}

export function orbcharges(it: eItem): number {
  switch (it) {
    case itRevolver: //pickup-key
      return 6 - G.items[itRevolver];
    case itOrbShield:
      return G.inv_on ? 30 : 20;
    case itOrbDiscord:
      return G.inv_on ? 46 : 23;
    case itOrbLove:
      return isValentines() ? 31 : 30;
    case itOrbUndeath:
    case itOrbSpeed: //"pickup-speed");
    case itOrbInvis:
    case itOrbAether:
      return 30;
    case itOrbGravity:
      return 45;
    case itOrbChoice:
      return 60;
    case itOrbIntensity:
      return G.inv_on ? 150 : 50;
    case itOrbWinter: // "pickup-winter"
      return G.inv_on ? 45 : 30;
    case itOrbBeauty:
    case itOrbEmpathy:
    case itOrbFreedom:
      return 40;
    case itOrbFrog:
    case itOrbDash:
    case itOrbPhasing:
    case itOrbWoods:
      return 45;
    case itOrb37:
    case itOrbEnergy:
      return 50;
    case itOrbRecall:
    case itOrbNature:
    case itOrbStone:
    case itOrbStunning:
    case itOrbLuck:
      return 60;
    case itOrbWater:
    case itOrbMatter:
    case itOrbHorns:
    case itOrbBull:
    case itOrbShell:
    case itOrbAir:
    case itOrbSlaying:
      return 66;
    case itOrbTime:
    case itOrbSpace:
    case itOrbThorns:
    case itOrbLightning:
    case itOrbFlash:
    case itOrbIllusion:
    case itOrbPsi:
    case itOrbDigging:
    case itOrbTeleport:
    case itOrbMagnetism:
      return 77;
    case itOrbDomination:
      return 90;
    case itOrbSummon:
      return 120;

    case itOrbSword:
      return 60 + 30 * multi_activePlayers();
    case itOrbSword2:
      return 40 + 20 * multi_activePlayers();
    case itOrbFish:
      return 20 + 10 * multi_activePlayers();
    case itOrbFire:
      return sphere() ? 3 : 30;
    case itOrbDragon:
      return sphere() ? 10 : 77;

    case itOrbMorph:
      return 60;

    case itOrbLava:
      return 50;

    case itOrbSide1:
    case itOrbSide2:
    case itOrbSide3:
      return 50;

    case itOrbImpact:
      return 50;

    case itOrbChaos:
      return 60;

    case itOrbPlague:
      return 30;

    case itOrbPurity:
      return 15;

    case itCurseWeakness:
      return 20;

    case itCurseDraining:
      return 30;

    case itCurseWater:
      return 20;

    case itCurseFatigue:
      return 30;

    case itCurseRepulsion:
      return 30;

    case itCurseGluttony:
      return 30;

    default:
      return 0;
  }
}

export function isShmupLifeOrb(it: eItem): boolean {
  return among(it,
    itOrbLife, itOrbFriend, itOrbNature, itOrbEmpathy,
    itOrbUndeath, itOrbLove, itOrbDomination, itOrbGravity,
    itOrbWoods, itOrbChaos, itOrbImpact, itOrbPlague,
  );
}

export function makelava(c: cell, i: number): void {
  if (!pseudohept(c)) return;
  if (isPlayerOn(c)) return;
  if (c.wall === waFire && c.wparam < i)
    c.wparam = i, G.orbused[itOrbLava] = true;
  else if (makeflame(c, i, false)) G.orbused[itOrbLava] = true;
}

export function orboflava(i: number): void {
  if (G.items[itOrbLava])
    for (const c of G.dcal) {
      if (c.cpdist > 5) break;
      if (!c.monst || isFriendly(c) || survivesFire(c.monst)) continue;
      for (let j = 0; j < c.type; j++) {
        const c2 = c.move(j); if (!c2) continue;
        makelava(c2, i);
      }
    }
}
