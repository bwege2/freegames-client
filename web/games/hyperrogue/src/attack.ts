// attack.cpp of HyperRogue 13.1o: routines related to attacking and killing. Package P6.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// killtable[] holds pointers into kills[] (and one into items[]): here a list of [array, index] read at call time.
// The HDR template do_swords(mi, who, f) is exported as `do_swords` (f: (c: cell, bb: number) => void).
// spillinfos (map<cell*, spillinfo>) is iterated in key order. handle_switchplaces(c1, c2, bool& switchplaces)
// takes a Ref<boolean>. The bignum arithmetic of ivy_total uses bignum.plus/minus; value_keep(clearing::imputed)
// keeps a copy (the bignum is mutated in place).
import { achievement_count, achievement_final, achievement_gain_once } from './achievement.ts';
import {
  drawBubble, drawFireParticles, drawParticle, drawParticles, fallingFloorAnimation, fallingMonsterAnimation,
} from './animations.ts';
import { addMessage } from './basegraph.ts';
import { adj_minefield_cells_full, celldistAlt, getDistLimit, isNeighbor, neighborId } from './cell.ts';
import { printf } from './cfile.ts';
import { miRESTRICTED, siMONSTER } from './checkmove.ts';
import { BITRUNCATED, cryst, eubinary, S3 } from './classes.ts';
import {
  clearing_imput, dragon_findhead, dragon_kill, dragon_totalhp, heat_affect, kraken_head, kraken_kill,
  kraken_totalhp, mirror_reflect, OUT_OF_PALACE, princess_getPrincessInfo, princess_info, princess_line,
  princess_mouseSqueak, princess_move, sword_orbcount, sword_pos, sword_shift,
} from './complex.ts';
import { ambush_guard_attack, brownian_dissolve, brownian_dissolve_brownian } from './complex2.ts';
import { getcs, princessgender } from './config.ts';
import {
  type eMonster, type eWall, type flagtype, itAsteroid, itBounty, itBull, itCompass, itCurseWeakness, itFulgurite,
  itMutant, itNone, itOrbAether, itOrbBeauty, itOrbDomination, itOrbDragon, itOrbEmpathy, itOrbFire, itOrbFlash,
  itOrbHorns, itOrbLove, itOrbLuck, itOrbSafety, itOrbShell, itOrbShield, itOrbSlaying, itOrbSpeed, itOrbStone,
  itOrbThorns, itOrbWater, itOrbWinter, itRevolver, itSavedPrincess, laAsteroids, laClearing, laDragon,
  laElementalWall, laEmerald, laGraveyard, laHalloween, laMinefield, laPalace, laTrollheim, laWestWall, laWhirlpool,
  minf, moAcidBird, moAirElemental, moAlbatross, moAltDemon, moAngryDie, moAnimatedDie, moArrowTrap, moAsteroid,
  moBat, moBomberbird, moBrownBug, moBug0, moBug1, moBug2, moButterfly, moCrusher, moCrystalSage, moCShark,
  moCultist, moCultistLeader, moDarkTroll, moDeadBird, moDesertman, moDonkey, moDragonHead, moDragonTail, moDraugr,
  moEagle, moEarthElemental, moEvilGolem, moFallingDog, moFalsePrincess, moFamiliar, moFatGuard, moFireElemental,
  moFireFairy, moFjordTroll, moFlailer, moForestTroll, moFriendlyGhost, moFriendlyIvy, moFrog, moGadfly, moGargoyle,
  moGhost, moGoblin, moGolem, moGolemMoved, moGreater, moGreaterM, moGreaterShark, moHedge, moHerdBull, moHexDemon,
  moHexer, moHexSnake, moHunterChanging, moHunterDog, moHunterGuard, moIceGolem, moIllusion, moIvyBranch, moIvyDead,
  moIvyHead, moIvyNext, moIvyRoot, moIvyWait, moJiangshi, moKnight, moKnightMoved, moKrakenH, moKrakenT, moLancer,
  moLavaWolf, moLesser, moLesserM, moLightningBolt, moMetalBeast, moMetalBeast2, moMimic, moMiner, moMirrorSpirit,
  moMonk, moMonkey, moMouse, moMutant, moNarciss, moNecromancer, moNone, moNorthPole, moOrangeDog, moOutlaw, moPair,
  moPalace, moParrot, moPhaser, moPike, moPirate, moPlayer, moPrincess, moPyroCultist, moRagingBull, moRanger,
  moRatling, moRatlingAvenger, moRedFox, moRedTroll, moReptile, moResearcher, moRoseBeauty, moRoseLady, moRunDog,
  moRusalka, moSalamander, moSeep, moShadow, moShark, moSkeleton, moSleepBull, moSlime, moSlimeNextTurn, moSouthPole,
  moSparrowhawk, moStormTroll, moSwitch1, moSwitch2, moTameBomberbird, moTentacle, moTentacleGhost, moTentacletail,
  moTerraWarrior, moTortoise, moTroll, moVariantWarrior, moVaulter, moViking, moVineBeast, moVineSpirit, moVizier,
  moVoidBeast, moWaterElemental, moWestHawk, moWindCrow, moWitch, moWitchFire, moWitchFlash, moWitchGhost,
  moWitchSpeed, moWitchWinter, moWolf, moWolfMoved, moWorldTurtle, moWorm, moYeti, moZombie, waAncientGrave,
  waBarrier, waBarrowDig, waBarrowWall, waBigStatue, waBigTree, waBoat, waBonfireOff, waCamelot, waCamelotMoat,
  waCavefloor, waCavewall, waCharged, waChasm, waCIsland, waCIsland2, waClosedGate, waColumn, waCTree, waDeadfloor,
  waDeadfloor2, waDeadTroll, waDeadTroll2, waDeadwall, waDeepWater, waDune, waExplosiveBarrel, waFan, waFireTrap,
  waFloorA, waFloorB, waFreshGrave, waFrozenLake, waGargoyle, waGargoyleBridge, waGargoyleFloor, waGiantRug,
  waGrounded, waIcewall, waLake, waMagma, waMetal, waMineMine, waMineOpen, waMineUnknown, waMirrorWall, waNone,
  waOpenGate, waPalace, waPartialFire, waPetrified, waPetrifiedBridge, waPlatform, waRed1, waRed2, waRed3, waReptile,
  waReptileBridge, waRose, waRoundTable, waRubble, waRuinWall, waSaloon, waSandstone, waSea, waShallow, waSmallTree,
  waStone, waStrandedBoat, waSulphur, waSulphurC, waTempBridge, waTempBridgeBlocked, waTempFloor, waTemporary,
  waTempWall, waTerraWarrior, waThumperOff, waThumperOn, waTower, waTrapdoor, waTrunk, waVineHalfA, waVineHalfB,
  waVinePlant, waWarpGate, waWaxWall, winf,
} from './content.ts';
import { big_unlock, R100, R20 } from './content-req.ts';
import { idiv, type Ref, sortedKeys } from './cpp.ts';
import { bow_crossbow_mode } from './crossbow.ts';
import {
  cellUnstable, cellUnstableOrChasm, checkOrb, checkOrb2, do_not_touch_this_wall, frog_power, hornStuns,
  ignoresSmell, inmirror, isAlchAny, isAnyIvy, isBird, isBug, isBull, isBulletType, isDie, isDragon, isFire,
  isFriendly, isFriendlyOrBug, isGhost, isGravityLand, isHaunted, isIcyLand, isIvy, isMagneticPole, isMetalBeast,
  isMimic, isMultitile, isMutantIvy, isNonliving, isOnCIsland, isPrincess, isRatling, isReptile, isSlimeMover,
  isStunnable, isUnarmed, isWarpedType, isWatery, isWateryOrBoat, isWitch, isWorm, itemBurns, mirrorcolor,
  snakelevel,
} from './flags.ts';
import { otherpole, placeGolem, saved_tortoise_on, wormhead } from './game.ts';
import { G } from './globals.ts';
import { its, pick12, pick123 } from './hprint.ts';
import {
  AF_APPROACH, AF_BACK, AF_BOW, AF_BULL, AF_CRUSH, AF_EAT, AF_FALL, AF_GETPLAYER, AF_GUN, AF_HORNS,
  AF_IGNORE_UNARMED, AF_LANCE, AF_MAGIC, AF_MSG, AF_MUSTKILL, AF_NEXTTURN, AF_NORMAL, AF_NOSHIELD, AF_ONLY_ENEMY,
  AF_ONLY_FBUG, AF_ONLY_FRIEND, AF_PLAGUE, AF_PSI, AF_SIDE, AF_STAB, AF_SWORD, AF_SWORD_INTO, AF_TOUGH, AF_WEAK,
  among, isize,
} from './hyper.ts';
import { gold, NO_LOVE } from './items.ts';
import { in_full_game, isLandIngame, landUnlocked, ls_hv_structure } from './landlock.ts';
import { spM, XLAT } from './language.ts';
import { cell, cellwalker, FALL, manual_celllister, match, movei, NODIR, proper } from './locations.ts';
import {
  destroyHalfvine, destroyTrapsOn, doesFall, doesnotFall, earthWall, explodeBarrel, explodeMine, makeflame,
  snakepile,
} from './mapeffects.ts';
import { anglestraight, kill_shadow_at, moveEffect, moveMonster, removeIvy } from './monstermove.ts';
import { multi_activePlayers, multi_leaveGame } from './multi.ts';
import { checkStunKill, markOrb, markOrb2, useupOrb } from './orbs.ts';
import {
  againstRose, againstWind, buildAirmap, logical_adjacent, P_BULLET, P_CLIMBDOWN, P_CLIMBUP, P_FLYING, P_ISFRIEND,
  P_MIRROR, P_MONSTER, passable, placeWater, withRose,
} from './passable.ts';
import {
  changes, isPlayerOn, lmAttack, pcmove, player_indices, playerpos, produceGhost, spread_plague, swordAttack,
  warningprotection_hit,
} from './pcmove.ts';
import { showMissionScreen } from './quit.ts';
import { shmup_degradeDemons, shmup_killThePlayer } from './shmup.ts';
import { playSound } from './sound.ts';
import { bignum } from './util.ts';


type killref = [() => number[], number];
const K = (m: eMonster): killref => [() => G.kills, m];

const killtable: killref[] = [
  K(moYeti), K(moWolf),
  K(moRanger), K(moTroll), K(moGoblin),
  K(moWorm), K(moDesertman), K(moIvyRoot),
  K(moMonkey), K(moEagle), K(moSlime), K(moSeep),
  K(moRunDog),
  K(moCultist), K(moTentacle), K(moPyroCultist),
  K(moLesser), K(moGreater),
  K(moZombie), K(moGhost), K(moNecromancer),
  K(moHedge), K(moFireFairy),
  K(moCrystalSage), K(moShark), K(moGreaterShark),
  K(moMiner), K(moFlailer), K(moLancer),
  K(moVineSpirit), K(moVineBeast),
  K(moBug0), K(moBug1), K(moBug2),
  K(moDarkTroll), K(moEarthElemental),
  K(moWitch), K(moEvilGolem), K(moWitchFlash), K(moWitchFire),
  K(moWitchWinter), K(moWitchSpeed),
  K(moCultistLeader),
  K(moPirate), K(moCShark), K(moParrot),
  K(moHexSnake), K(moRedTroll),
  K(moPalace), K(moSkeleton), K(moFatGuard), K(moVizier),
  K(moViking), K(moFjordTroll), K(moWaterElemental),
  K(moAlbatross), K(moBomberbird),
  K(moAirElemental), K(moFireElemental),
  K(moGargoyle), K(moFamiliar), K(moOrangeDog),
  [() => G.items, itMutant], K(moMetalBeast), K(moMetalBeast2),
  K(moOutlaw), K(moForestTroll), K(moStormTroll),
  K(moRedFox), K(moWindCrow),
  K(moFalsePrincess), K(moRoseLady),
  K(moRoseBeauty),
  K(moRatling), K(moRatlingAvenger),
  K(moDragonHead),
  K(moGadfly), K(moSparrowhawk), K(moResearcher),
  K(moKrakenH), K(moDraugr),
  K(moBat), K(moReptile),
  K(moHerdBull), K(moSleepBull), K(moRagingBull),
  K(moButterfly),
  K(moNarciss), K(moMirrorSpirit),
  K(moHunterDog), K(moIceGolem), K(moVoidBeast),
  K(moJiangshi), K(moTerraWarrior),
  K(moSalamander), K(moLavaWolf),
  K(moSwitch1), K(moSwitch2),
  K(moMonk), K(moCrusher), K(moHexDemon), K(moAltDemon), K(moPair),
  K(moBrownBug), K(moAcidBird),
  K(moFallingDog), K(moVariantWarrior), K(moWestHawk),
  K(moPike), K(moRusalka), K(moFrog), K(moPhaser), K(moVaulter),
  K(moHexer), K(moAnimatedDie), K(moAngryDie),
  K(moDonkey),
];

export function tkills(): number {
  let res = 0;
  for (const [a, i] of killtable) res += a()[i];
  return res;
}

export function killtypes(): number {
  let res = 0;
  for (const [a, i] of killtable) if (a()[i]) res++;
  return res;
}

export function arrow_stuns(m: eMonster): boolean {
  return among(m, moCrusher, moMonk, moAltDemon, moHexDemon, moGreater, moGreaterM, moHedge);
}

export function canAttack(c1: cell, m1: eMonster, c2: cell, m2: eMonster, flags: flagtype): boolean {

  // cannot eat worms
  if ((flags & AF_EAT) && isWorm(m2)) return false;

  if (m1 === G.passive_switch || m2 === G.passive_switch) return false;

  if ((flags & AF_GETPLAYER) && isPlayerOn(c2)) m2 = moPlayer;

  if (!m2) return false;

  if (m2 === moPlayer && G.peace_on) return false;

  if ((flags & AF_WEAK) && isIvy(c2)) return false;

  if ((flags & AF_MUSTKILL) && attackJustStuns(c2, flags, m1))
    return false;

  if ((flags & AF_ONLY_FRIEND) && m2 !== moPlayer && !isFriendly(c2)) return false;
  if ((flags & AF_ONLY_FBUG) && m2 !== moPlayer && !isFriendlyOrBug(c2)) return false;
  if ((flags & AF_ONLY_ENEMY) && (m2 === moPlayer || isFriendlyOrBug(c2))) return false;

  if (isFriendly(c2) && markOrb(itOrbEmpathy) && (flags & (AF_STAB | AF_MAGIC | AF_HORNS | AF_SWORD | AF_SWORD_INTO | AF_SIDE | AF_PLAGUE)))
    return false;

  if (m1 === moArrowTrap && arrow_stuns(m2)) return true;

  if (isDie(m2) && !(flags & (AF_MAGIC | AF_CRUSH))) return false;

  if (among(m2, moAltDemon, moHexDemon, moPair, moCrusher, moNorthPole, moSouthPole, moMonk) && !(flags & (AF_EAT | AF_MAGIC | AF_BULL | AF_CRUSH)))
    return false;

  if (m2 === moHedge && !(flags & (AF_STAB | AF_TOUGH | AF_EAT | AF_MAGIC | AF_LANCE | AF_SWORD_INTO | AF_HORNS | AF_BULL | AF_CRUSH)))
    if (!checkOrb(m1, itOrbThorns)) return false;

  // krakens do not try to fight even with Discord
  if ((m1 === moKrakenT || m1 === moKrakenH) &&
    (m2 === moKrakenT || m2 === moKrakenH))
    return false;

  if (m2 === moDraugr && !(flags & (AF_SWORD | AF_MAGIC | AF_SWORD_INTO | AF_HORNS | AF_CRUSH))) return false;

  // if(m2 == moHerdBull && !(flags & AF_MAGIC)) return false;
  if (isBull(m2) && !(flags & (AF_MAGIC | AF_HORNS | AF_SWORD_INTO | AF_CRUSH))) return false;
  if (m2 === moButterfly && !(flags & (AF_MAGIC | AF_BULL | AF_HORNS | AF_SWORD_INTO | AF_CRUSH))) return false;

  if (!(flags & AF_NOSHIELD) && ((flags & AF_NEXTTURN) ? checkOrb2 : checkOrb)(m2, itOrbShield)) return false;

  if ((flags & AF_STAB) && m2 !== moHedge) {
    if (!checkOrb(m1, itOrbThorns)) return false;
    else flags |= AF_IGNORE_UNARMED;
  }

  if (flags & AF_BACK) {
    if (m2 === moFlailer && !c2.stuntime) flags |= AF_IGNORE_UNARMED;
    else if (m2 === moVizier && !isUnarmed(m1)) { /* nothing */ }
    else return false;
  }

  if (flags & (AF_APPROACH | AF_HORNS)) {
    if (m2 === moLancer && (flags & AF_APPROACH)) { /* nothing */ }
    else if ((flags & AF_HORNS) && checkOrb(m1, itOrbHorns)) { flags |= AF_IGNORE_UNARMED; }
    else return false;
  }

  if (!(flags & AF_IGNORE_UNARMED) && isUnarmed(m1)) return false;

  if (m2 === moGreater || m2 === moGreaterM)
    if (!(flags & (AF_MAGIC | AF_SWORD_INTO | AF_HORNS | AF_CRUSH))) return false;

  if (!(flags & (AF_GUN | AF_SWORD | AF_SWORD_INTO | AF_MAGIC | AF_PLAGUE)))
    if (c1 !== c2 && !logical_adjacent(c1, m1, c2)) return false;

  if (!(flags & (AF_LANCE | AF_STAB | AF_BACK | AF_APPROACH | AF_GUN | AF_MAGIC | AF_PLAGUE | AF_SIDE | AF_BOW)))
    if (c1 && c2 && againstRose(c1, c2) && !ignoresSmell(m1))
      return false;

  if (m2 === moShadow && !(flags & (AF_SWORD | AF_SWORD_INTO | AF_CRUSH))) return false;
  if (isWorm(m2) && m2 !== moTentacleGhost && !isDragon(m2)) return false;

  // dragon can't attack itself, or player who mounted it
  const cp = (flags & AF_BOW) ? G.cwt.at : c1;
  if (cp && c2 && isWorm(cp.monst) && isWorm(c2.monst) && wormhead(cp) === wormhead(c2)
    && m1 !== moTentacleGhost && m2 !== moTentacleGhost)
    return false;

  // if(m2 == moTortoise && !(flags & AF_MAGIC)) return false;

  if (m2 === moRoseBeauty)
    if (!(flags & (AF_MAGIC | AF_LANCE | AF_GUN | AF_SWORD_INTO | AF_BULL | AF_CRUSH)))
      if (!isMimic(m1))
        if (!checkOrb(m1, itOrbBeauty) && !checkOrb(m1, itOrbAether) && !checkOrb(m1, itOrbShield))
          if (!c1 || !c2 || !withRose(c1, c2))
            return false;

  if (m2 === moFlailer && !c2.stuntime)
    if (!(flags & (AF_MAGIC | AF_TOUGH | AF_EAT | AF_HORNS | AF_LANCE | AF_BACK | AF_SWORD_INTO | AF_BULL | AF_CRUSH))) return false;

  return true;
}

export function petrify(c: cell, walltype: eWall, m: eMonster): boolean {
  destroyHalfvine(c);
  destroyTrapsOn(c);
  playSound(c, 'die-troll');

  if (walltype === waIcewall && !isIcyLand(c.land))
    return false;

  if (c.land === laWestWall) return false;

  if (do_not_touch_this_wall(c)) return false;

  if (isWateryOrBoat(c) && c.land === laWhirlpool) {
    c.wall = waSea;
    return false;
  }

  if (walltype === waGargoyle && cellUnstableOrChasm(c))
    walltype = waGargoyleFloor;
  else if (walltype === waGargoyle && isWatery(c))
    walltype = waGargoyleBridge;
  else if (walltype === waPetrified && isWatery(c))
    walltype = waPetrifiedBridge;
  else if ((c.wall === waTempBridge || c.wall === waTempBridgeBlocked) && c.land === laWhirlpool) {
    c.wall = waTempBridgeBlocked;
    return true;
  }
  else if (!doesnotFall(c)) {
    fallingFloorAnimation(c, walltype, m);
    return true;
  }

  if (isReptile(c.wall)) G.kills[moReptile]++;
  destroyHalfvine(c);
  c.wall = walltype;
  c.wparam = m;
  c.item = itNone;
  return true;
}

export function killIvy(c: cell, who: eMonster): void {
  if (c.monst === moIvyDead) return;
  changes.ccell(c);
  if (checkOrb(who, itOrbStone)) petrify(c, waPetrified, c.monst);
  c.monst = moIvyDead; // NEWYEARFIX
  for (let i = 0; i < c.type; i++) if (c.move(i))
    if (isIvy(c.move(i)) && c.move(i).mondir === c.c.spin(i)) {
      killIvy(c.move(i), who); G.kills[moIvyDead]++;
    }
}

class spillinfo {
  orig: eWall = 0;
  spill_a = 0;
  spill_b = 0;
}

const spillinfos = new Map<cell, spillinfo>();

/** spillinfos[c] (inserts a default spillinfo) */
function spillinfo_at(c: cell): spillinfo {
  let si = spillinfos.get(c);
  if (!si) { si = new spillinfo(); spillinfos.set(c, si); }
  return si;
}

export function reset_spill(): void {
  spillinfos.clear();
}

export function record_spillinfo(c: cell, t: eWall): void {
  if (!isAlchAny(t)) return;
  const si = spillinfo_at(c);
  if (si.spill_a === 0 && si.spill_b === 0) si.orig = c.wall;
  if (si.spill_a === 0 && si.spill_b === 0) si.orig = c.wall;
  if (t === waFloorA) si.spill_a++;
  if (t === waFloorB) si.spill_b++;
}

export function prespill(c: cell, t: eWall, rad: number, from: cell): void {
  if (againstWind(c, from)) return;
  changes.ccell(c);
  // these monsters block spilling
  if (c.monst === moSeep || c.monst === moVineSpirit || c.monst === moShark ||
    c.monst === moGreaterShark || c.monst === moParrot || c.monst === moCShark)
    return;
  // turn statues into Slimes!
  if (among(c.wall, waBigStatue, waTerraWarrior) && t !== waNone) {
    c.wall = waNone;
    c.monst = moSlimeNextTurn;
  }
  // slimedeath spill
  if ((c.monst === moSlime || c.monst === moSlimeNextTurn) && t === waNone) {
    c.wall = waNone; attackMonster(c, 0n, moNone);
  }
  if (c.wall === waClosedGate) {
    c.wall = waPalace;
    return;
  }
  // no slime in Whirlpool
  if (c.land === laWhirlpool) return;
  // these walls block spilling completely
  if (c.wall === waIcewall || c.wall === waBarrier || c.wall === waWarpGate ||
    c.wall === waDeadTroll || c.wall === waDeadTroll2 ||
    c.wall === waDune || c.wall === waAncientGrave ||
    c.wall === waThumperOff || c.wall === waThumperOn ||
    c.wall === waFreshGrave || c.wall === waColumn || c.wall === waPartialFire ||
    c.wall === waDeadwall || c.wall === waWaxWall || c.wall === waCamelot || c.wall === waRoundTable ||
    c.wall === waBigStatue || c.wall === waRed1 || c.wall === waRed2 || c.wall === waRed3 ||
    c.wall === waTower ||
    c.wall === waPalace ||
    c.wall === waPlatform || c.wall === waStone || c.wall === waTempWall ||
    c.wall === waTempFloor || c.wall === waTempBridge || c.wall === waPetrifiedBridge || c.wall === waTempBridgeBlocked ||
    c.wall === waSandstone || c.wall === waCharged || c.wall === waGrounded ||
    c.wall === waMetal || c.wall === waSaloon || c.wall === waFan ||
    c.wall === waBarrowDig || c.wall === waBarrowWall ||
    c.wall === waMirrorWall)
    return;
  if (c.wall === waFireTrap) {
    if (c.wparam === 0) c.wparam = 1;
    return;
  }
  if (c.wall === waExplosiveBarrel)
    explodeBarrel(c);
  destroyTrapsOn(c);
  // these walls block further spilling
  if (c.wall === waCavewall || cellUnstable(c) || c.wall === waSulphur ||
    c.wall === waSulphurC || c.wall === waLake || c.wall === waChasm ||
    c.wall === waBigTree || c.wall === waSmallTree || c.wall === waTemporary ||
    c.wall === waVinePlant || isFire(c) || c.wall === waBonfireOff || c.wall === waVineHalfA || c.wall === waVineHalfB ||
    c.wall === waCamelotMoat || c.wall === waSea || c.wall === waCTree ||
    c.wall === waRubble || c.wall === waGargoyleFloor || c.wall === waGargoyle ||
    c.wall === waRose || c.wall === waPetrified || c.wall === waPetrifiedBridge || c.wall === waRuinWall ||
    among(c.wall, waDeepWater, waShallow)) {
    record_spillinfo(c, t);
    t = waTemporary;
  }

  if (c.wall === waSulphur) {
    // remove the center as it would not look good
    for (let i = 0; i < c.type; i++) if (c.move(i) && c.move(i).wall === waSulphurC)
      c.move(i).wall = waSulphur;
  }

  if (isReptile(c.wall)) {
    if (c.monst || isPlayerOn(c)) G.kills[moReptile]++;
    else { c.monst = moReptile; c.stuntime = 3; c.hitpoints = 3; }
  }

  destroyHalfvine(c);
  if (c.wall === waTerraWarrior) G.kills[waTerraWarrior]++;
  record_spillinfo(c, t);
  c.wall = t;
  // destroy items...
  c.item = itNone;
  // block spill
  if (t === waTemporary) return;
  // cwt.at->item = itNone;
  if (rad) for (const p of adj_minefield_cells_full(c)) {
    prespill(p.c, conditional_flip_slime(p.mirrored, t), rad - 1, c);
  }
}

export function conditional_flip_slime(flip: boolean, t: eWall): eWall {
  if (flip && t === waFloorA) return waFloorB;
  if (flip && t === waFloorB) return waFloorA;
  return t;
}

export function chainspill(c: cell): void {
  if (c.wall === waMagma && c.monst === moSlimeNextTurn) killMonster(c, moNone, 0n);
}

export function spillfix(c: cell, t: eWall, rad: number): void {
  if (c.wall === waTemporary) {
    changes.ccell(c);
    c.wall = t;
  }
  if (rad) for (const p of adj_minefield_cells_full(c)) {
    spillfix(p.c, conditional_flip_slime(p.mirrored, t), rad - 1);
  }
  chainspill(c);
}

export function spill(c: cell, t: eWall, rad: number): void {
  if (isAlchAny(c) && (spillinfo_at(c).spill_a || spillinfo_at(c).spill_b) && isAlchAny(spillinfo_at(c).orig))
    t = spillinfo_at(c).orig;
  prespill(c, t, rad, c);
  spillfix(c, t, rad);
  for (const k of sortedKeys(spillinfos)) {
    const si = spillinfos.get(k)!;
    if (si.spill_a && si.spill_b)
      k.wall =
        si.spill_a > si.spill_b ? waFloorA :
        si.spill_b > si.spill_a ? waFloorB :
        isAlchAny(si.orig) ? si.orig :
        waNone;
    chainspill(c);
  }
}

export function degradeDemons(): void {
  addMessage(XLAT('You feel more experienced in demon fighting!'));
  playSound(G.cwt.at, 'levelup');
  const dcs = isize(G.dcal);
  for (let i = 0; i < dcs; i++) {
    const c = G.dcal[i];
    if (c.monst === moGreaterM || c.monst === moGreater) {
      changes.ccell(c);
      achievement_gain_once('DEMONSLAYER');
      if (c.monst === moGreaterM) c.monst = moLesserM;
      if (c.monst === moGreater) c.monst = moLesser;
    }
  }
  shmup_degradeDemons();
}

export function stunMonster(c2: cell, killer: eMonster, flags: flagtype): void {
  let newtime = (
    c2.monst === moFatGuard ? 2 :
    c2.monst === moSkeleton && c2.land !== laPalace && c2.land !== laHalloween ? 7 :
    c2.monst === moTerraWarrior ? Math.min(c2.stuntime + 8 - c2.hitpoints, 7) :
    isMetalBeast(c2.monst) ? 7 :
    c2.monst === moTortoise ? 7 :
    c2.monst === moWorldTurtle ? 7 :
    c2.monst === moReptile ? 7 :
    isPrincess(c2.monst) ? 6 :
    // spear stunning
    isBull(c2.monst) ? 3 :
    (c2.monst === moGreater || c2.monst === moGreaterM) ? 5 :
    c2.monst === moButterfly ? 2 :
    c2.monst === moDraugr ? 1 :
    c2.monst === moVizier ? 0 :
    c2.monst === moHedge ? 1 :
    c2.monst === moFlailer ? 1 :
    c2.monst === moSalamander ? 6 :
    c2.monst === moBrownBug ? 3 :
    ((flags & AF_WEAK) && !attackJustStuns(c2, flags & ~AF_WEAK, killer)) ? Math.min(5 + c2.stuntime, 15) :
    3);
  if (killer === moArrowTrap) newtime = Math.min(newtime + 3, 7);
  if (!(flags & AF_WEAK) && !isMetalBeast(c2.monst) && !among(c2.monst, moSkeleton, moReptile, moSalamander, moTortoise, moWorldTurtle, moBrownBug)) {
    c2.hitpoints--;
    if (c2.monst === moPrincess)
      playSound(c2, princessgender() ? 'hit-princess' : 'hit-prince');
  }
  if (c2.stuntime < newtime) c2.stuntime = newtime;
  if (isBull(c2.monst)) c2.mondir = NODIR;
  checkStunKill(c2);
}

export function attackJustStuns(c2: cell, f: flagtype, attacker: eMonster): boolean {
  if (f & AF_WEAK)
    return true;
  if (f & AF_HORNS)
    return hornStuns(c2);
  else if (attacker === moArrowTrap && arrow_stuns(c2.monst))
    return true;
  else if ((f & AF_SWORD) && c2.monst === moSkeleton)
    return false;
  else if (f & (AF_CRUSH | AF_MAGIC | AF_FALL | AF_EAT | AF_GUN | AF_PSI))
    return false;
  else
    return isStunnable(c2.monst) && c2.hitpoints > 1;
}

export function minerEffect(c: cell): void {
  changes.ccell(c);
  let ow = c.wall;
  if (c.wall === waOpenGate || c.wall === waFrozenLake || c.wall === waBoat ||
    c.wall === waStrandedBoat ||
    c.wall === waCIsland || c.wall === waCIsland2 || c.wall === waTrapdoor ||
    c.wall === waGiantRug) { /* nothing */ }
  else if (c.wall === waMineUnknown || c.wall === waMineMine || c.wall === waMineOpen)
    c.wall = waMineOpen;
  else if (c.wall === waRed2) c.wall = waRed1;
  else if (c.wall === waRed3) c.wall = waRed2;
  else if (isReptile(c.wall))
    c.wparam = 1; // wake up next turn
  else if (c.wall === waTempFloor) c.wall = waChasm;
  else if (c.wall === waTempBridge || c.wall === waPetrifiedBridge || c.wall === waTempBridgeBlocked)
    placeWater(c, null!);
  else if (doesFall(c))
    ow = waNone;
  else
    c.wall = waNone;
  if (c.wall !== ow && ow) drawParticles(c, winf[ow].color, 16);
}

export function killMutantIvy(c: cell, who: eMonster): void {
  if (checkOrb(who, itOrbStone)) petrify(c, waPetrified, moMutant);
  changes.ccell(c);
  removeIvy(c);
  for (let i = 0; i < c.type; i++)
    if (c.move(i) && c.move(i).mondir === c.c.spin(i) && (isMutantIvy(c.move(i)) || c.move(i).monst === moFriendlyIvy)) {
      G.kills[c.move(i).monst]++; killMutantIvy(c.move(i), who);
    }
  if (c.land === laClearing) clearing_imput(c);
}

export function ivy_total(): bignum {
  return bignum.plus(new bignum(G.kills[moMutant] + G.kills[moFriendlyIvy] +
    G.kills[moIvyRoot] + G.kills[moIvyHead] + G.kills[moIvyBranch] + G.kills[moIvyWait] + G.kills[moIvyDead]),
  G.clearing_imputed);
}

export function killMonster(c: cell, who: eMonster, deathflags: flagtype = 0n): void {
  let m = c.monst;
  // DEBBI(debug_turn, ("killmonster ", dnameof(m)));

  if (!m) return;

  if (m === moKrakenH) return;
  if (m === moKrakenT) {
    if (c.hitpoints && m === moKrakenT) G.kills[moKrakenT]++;
    c.hitpoints = 0;
    c.stuntime = 1;
    const head = kraken_head(c);
    if (kraken_totalhp(head) === 0) {
      kraken_kill(head, who);
      playSound(head, 'die-kraken');
    }
    return;
  }

  if (isDragon(m)) {
    if (c.hitpoints && m !== moDragonHead) G.kills[moDragonTail]++;
    c.hitpoints = 0;
    c.stuntime = 1;
    const head = dragon_findhead(c);
    if (dragon_totalhp(head) === 0) dragon_kill(head, who);
    return;
  }
  if (isWorm(c) && m !== moTentacleGhost) return;

  const fallanim = (deathflags & AF_FALL) !== 0n && m !== moMimic;

  let pcount = fallanim ? 0 : 16;
  if (m === moShadow)
    kill_shadow_at(c);

  // CAP_HISTORY
  if (!isBug(m) && !isAnyIvy(m)) {
    G.history_killhistory.push([c, m]);
  }

  // CAP_COMPLEX2
  if (m === moHunterGuard) ambush_guard_attack();

  if (m === moGolemMoved) m = moGolem;
  if (m === moKnightMoved) m = moKnight;
  if (m === moSlimeNextTurn) m = moSlime;
  if (m === moLesserM) m = moLesser;
  if (m === moGreater) m = moLesser;
  if (m === moGreaterM) m = moLesser;
  if (isPrincess(m)) m = moPrincess;
  if (m === moTentacleGhost) m = moGhost;
  if (m === moHunterGuard) m = moHunterDog;
  if (m === moHunterChanging) m = moHunterDog;
  if (m === moWolfMoved) m = moWolf;
  if (!isBulletType(m) && m !== moIvyDead) G.kills[m]++;

  if (saved_tortoise_on(c)) c.item = itNone;

  if (!c.item) if (m === moButterfly && (deathflags & AF_BULL))
    c.item = itBull;

  if (isRatling(m) && c.wall === waBoat) {
    let avenge = false;
    for (let i = 0; i < c.type; i++) if (!isWarpedType(c.move(i).land))
      avenge = true;
    if (avenge)
      changes.value_add(G, 'avengers', 2);
  }

  if (m === moMirrorSpirit && who !== moMimic && !(deathflags & (AF_MAGIC | AF_CRUSH))) {
    G.kills[m]--;
    changes.value_inc(G, 'mirrorspirits');
  }

  if (isMutantIvy(m) || m === moFriendlyIvy) {
    pcount = 0;
    if (isMutantIvy(m)) changes.at_commit(() => { G.clearing_direct++; });
    if (changes.on) { // changes.value_keep(clearing::imputed): a copy of the bignum
      const old = G.clearing_imputed.clone();
      changes.at_rollback(() => { G.clearing_imputed = old; });
    }
    let s = bignum.minus(ivy_total(), new bignum(1));
    killMutantIvy(c, who);
    s = bignum.minus(ivy_total(), s);
    if (G.vid.bubbles_special && s.gt(new bignum(1)))
      drawBubble(c, 0xFFFF00, s.get_str(100), .5);
    if (isize(G.clearing_imputed.digits) > 11)
      achievement_gain_once('KILLMUTANT');
  }

  if (m === moPrincess) {
    const i = princess_getPrincessInfo(c);
    if (i) {
      changes_value_keep_info(i);
      i.princess = null!;
      if (i.bestdist === OUT_OF_PALACE) {
        G.items[itSavedPrincess]--;
        if (G.items[itSavedPrincess] < 0) {
          printf('princess below 0\n');
          G.items[itSavedPrincess] = 0;
        }
        if (G.items[itSavedPrincess] === 0 && !G.inv_on) {
          G.items[itOrbLove] = 0;
          changes.value_keep(G, 'princess_reviveAt');
          G.princess_reviveAt = gold(NO_LOVE) + 20;
        }
      }
      if (G.princess_challenge) changes.at_commit(() => { showMissionScreen(true); });
    }
  }

  if (m === moGargoyle && c.wall !== waMineMine) {
    let connected = false;

    if (isGravityLand(c.land)) {
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        if (c2.wall === waPlatform || c2.wall === waGargoyle || c2.wall === waBarrier ||
          c2.wall === waDeadTroll || c2.wall === waDeadTroll2 || c2.wall === waTrunk ||
          c2.wall === waPetrified || isAlchAny(c2.wall))
          connected = true;
      }
    }
    else {
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        if (!cellUnstableOrChasm(c2) && !isWatery(c2)) connected = true;
      }
    }

    if (connected) { petrify(c, waGargoyle, m); pcount = 0; }
  }

  if (m === moIceGolem) {
    if (petrify(c, waIcewall, m)) pcount = 0;
    heat_affect(c, -1);
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i); if (!c2) continue;
      changes.ccell(c2);
      heat_affect(c2, -.5);
    }
  }

  if (m === moTroll) {
    petrify(c, waDeadTroll, m); pcount = 0;
    for (let i = 0; i < c.type; i++) {
      const c1 = c.move(i); if (!c1) continue;
      changes.ccell(c1);
      c1.item = itNone;
      if (c1.wall === waDeadwall) c1.wall = waCavewall;
      if (c1.wall === waDeadfloor2 && !c1.monst && !isPlayerOn(c1)) c1.wall = waCavewall;
      if (c1.wall === waDeadfloor) c1.wall = waCavefloor;
    }
  }
  if (m === moFjordTroll || m === moForestTroll || m === moStormTroll) {
    petrify(c, waDeadTroll2, m);
  }
  if (m === moMiner) {
    pcount = 32;
    playSound(c, 'splash' + pick12());
    destroyHalfvine(c);
    minerEffect(c);
    // CAP_COMPLEX2
    brownian_dissolve_brownian(c, 1);
    for (let i = 0; i < c.type; i++) {
      const c1 = c.move(i); if (!c1) continue;
      if (passable(c1, c, P_MONSTER | P_MIRROR | P_CLIMBUP | P_CLIMBDOWN)) {
        changes.ccell(c1);
        destroyHalfvine(c1);
        minerEffect(c1);
        // CAP_COMPLEX2
        brownian_dissolve_brownian(c1, 1);
        if (c1.monst === moSlime || c1.monst === moSlimeNextTurn)
          killMonster(c1, who);
      }
    }
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i); if (!c2) continue;
      changes.ccell(c2);
      if (c2.wall === waPalace) c2.wall = waRubble;
      if (c2.wall === waDeadwall) c2.wall = waDeadfloor2;
      if (c2.wall === waExplosiveBarrel) explodeBarrel(c2);
    }
  }
  if (m === moOrangeDog) {
    if (pcount) for (let i = 0; i < 8; i++) {
      drawParticle(c, 0xFFFFFF);
      drawParticle(c, 0x202020);
    }
    pcount = 0;
  }
  if (m === moDraugr) {
    if (pcount) drawParticles(c, 0x804000, 8);
    pcount = 0;
  }
  if (m === moPalace) {
    if (pcount) {
      pcount = 4;
      for (let i = 0; i < 12; i++) drawParticle(c, 0x20C020);
    }
  }
  if (m === moPrincess) {
    playSound(c, princessgender() ? 'die-princess' : 'die-prince');
  }
  if (m === moVineBeast) {
    petrify(c, waVinePlant, m); pcount = 0;
  }
  if (isBird(m)) moveEffect(movei.sd(c, FALL), moDeadBird);
  if (m === moAcidBird) {
    playSound(c, 'die-bomberbird');
    pcount = 64;
    // CAP_COMPLEX2
    brownian_dissolve(c, 1);
  }
  if (m === moBomberbird || m === moTameBomberbird) {
    pcount = 0;
    playSound(c, 'die-bomberbird');
    if (c.wall === waNone || c.wall === waMineUnknown || c.wall === waMineOpen ||
      c.wall === waCavefloor || c.wall === waDeadfloor || c.wall === waDeadfloor2 ||
      c.wall === waRubble || c.wall === waGargoyleFloor ||
      c.wall === waCIsland || c.wall === waCIsland2 ||
      c.wall === waStrandedBoat || c.wall === waRed1 || c.wall === waGiantRug) {
      c.wall = waMineMine;
      if (c.item) explodeMine(c);
      else if (c.land === laMinefield) c.landparam = 1;
    }
    else if (c.wall === waFrozenLake)
      c.wall = waLake;
    else if (c.wall === waGargoyleBridge)
      placeWater(c, c);
    else if (c.wall === waRed3 || c.wall === waRed2) {
      c.wall = waRed1;
      for (let i = 0; i < c.type; i++) if (c.move(i).wall === waRed3)
        c.move(i).wall = waRed2;
      c.item = itNone;
    }
    const w = c.wall;
    if (isFire(c) || c.wall === waRose || isReptile(c.wall)) {
      c.wall = waMineMine;
      explodeMine(c);
      if (isReptile(w)) G.kills[moReptile]++;
      if (w === waReptile) c.wall = waChasm;
      if (w === waReptileBridge) placeWater(c, null!);
    }
  }
  if (m === moVineSpirit) {
    pcount = 32;
    playSound(c, 'die-vinespirit');
    destroyHalfvine(c);
    if (!isFire(c)) c.wall = waNone;
  }
  if (m === moRedTroll) {
    playSound(c, 'die-troll');
    if (doesFall(c)) { fallingFloorAnimation(c, waRed1, m); pcount = 0; }
    else if (snakepile(c, m)) pcount = 0;
  }
  if (m === moBrownBug) {
    if (doesFall(c)) { /* nothing */ }
    else if (snakepile(c, m)) pcount = 0;
  }
  if (m === moDarkTroll) {
    playSound(c, 'die-troll');
    if (doesFall(c)) { fallingFloorAnimation(c, waDeadwall, m); pcount = 0; }
    else if (c.wall === waRed1 || c.wall === waRed2 || c.wall === waRed3) {
      c.wall = waDeadwall; pcount = 0;
    }
    else if (snakepile(c, m))
      pcount = 0;
  }
  if (isWitch(m) && (isFire(c) || passable(c, null!, P_MONSTER)) && !c.item) {
    if (m === moWitchFire) c.item = itOrbFire;
    if (m === moWitchFlash) c.item = itOrbFlash;
    if (m === moWitchGhost) c.item = itOrbAether;
    if (m === moWitchWinter) c.item = itOrbWinter;
    if (m === moWitchSpeed) c.item = itOrbSpeed;
    if (isFire(c) && itemBurns(c.item))
      c.item = itNone;
  }
  if (who === moPlayer || (isFriendly(who) && G.items[itOrbEmpathy])) {
    const o = frog_power(m);
    if (o && who !== moPlayer) markOrb2(itOrbEmpathy);
    if (o) G.items[o] += 5;
  }
  if (checkOrb(who, itOrbStone)) {
    petrify(c, waPetrified, m); pcount = 0;
  }
  if (m === moFireFairy) {
    drawFireParticles(c, 16); pcount = 0;
    playSound(c, 'die-fairy');
    playSound(c, 'fire');
    makeflame(c, 50, false);
  }
  if (c.monst === moMetalBeast2 && !c.item && who === moLightningBolt && c.wall !== waPetrified && c.wall !== waChasm)
    c.item = itFulgurite; // this is actually redundant in many cases
  if (m === moPyroCultist && c.item === itNone && c.wall !== waChasm && c.wall !== waPetrified) {
    // a reward for killing him before he shoots!
    c.item = itOrbDragon;
  }
  if (m === moAsteroid && !G.shmup_on && c.item === itNone && c.wall !== waChasm && c.land === laAsteroids) {
    c.item = itAsteroid;
    changes.value_add(G, 'splitrocks', 2);
  }

  if (m === moOutlaw && (c.item === itNone || c.item === itRevolver) && c.wall !== waChasm)
    c.item = itBounty;
  // note: an Orb appears underwater!
  if (m === moWaterElemental && c.item === itNone)
    c.item = itOrbWater;

  if (m === moPirate && (isOnCIsland(c) || ls_hv_structure()) && c.item === itNone && (
    eubinary() ||
    (c.master.alt && celldistAlt(c) <= 2 - getDistLimit()) ||
    isHaunted(c.land)) && !cryst()) {
    let toomany = false;
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i);
      if (c2 && c2.item === itCompass) toomany = true;
      if (c2 && BITRUNCATED()) for (let j = 0; j < c2.type; j++)
        if (c2.move(j) && c2.move(j).item === itCompass)
          toomany = true;
    }
    if (!toomany) c.item = itCompass;
  }
  if (m === moSlime) {
    pcount = 0;
    drawParticles(c, winf[c.wall].color, 80, 200);
    playSound(c, 'splash' + pick12());
    c.monst = moNone;
    spill(c, c.wall, 2);
  }
  // if(c->monst == moShark) c->heat += 1;
  // if(c->monst == moGreaterShark) c->heat += 10;
  if (isIcyLand(c)) {
    if (m === moCultist) c.LHU.heat += 3;
    if (m === moPyroCultist) c.LHU.heat += 6;
    if (m === moLesser) c.LHU.heat += 10;
  }
  if (m === moLesser && !(G.kills[m] % 10))
    degradeDemons();
  if (m === moLesser) {
    if (G.kills[m] % 10) {
      if (G.vid.bubbles_special)
        drawBubble(c, 0xFF0000, its(G.kills[m] % 10), 1);
    }
    else {
      if (G.vid.bubbles_special)
        drawBubble(c, 0xFF8000, '+1 XP', .8);
      degradeDemons();
    }
  }
  if (isIvy(c)) {
    pcount = 0;
    const m = c.monst;
    let s = bignum.minus(ivy_total(), new bignum(1));
    /*if((m == moIvyBranch || m == moIvyHead) && c->move(c->mondir)->monst == moIvyRoot)
      ivynext(c, moIvyNext); */
    killIvy(c, who);
    s = bignum.minus(ivy_total(), s);
    if (s.gt(new bignum(1)) && G.vid.bubbles_special)
      drawBubble(c, 0xFFFF00, s.get_str(100), .5);
    if (m === moIvyBranch || m === moIvyHead || m === moIvyNext) {
      let qty = 0;
      let c2 = proper(c, c.mondir) ? c.move(c.mondir) : null!;
      if (!c2) c2 = c; /* should not happen */
      for (let i = 0; i < c2.type; i++)
        if (c2.move(i).monst === moIvyWait && c2.move(i).mondir === c2.c.spin(i))
          qty++;
      if (c2.monst === moIvyRoot || qty) {
        c.monst = moIvyNext;
        /* c->monst = moIvyHead;
        ivynext(c);
        if(c->monst == moIvyHead) c->monst = moIvyNext;
        else c->monst = moNone; */
      }
      else {
        changes.ccell(c2);
        c2.monst = moIvyHead;
      }
    }
  }
  else if (c.monst === moTentacleGhost)
    c.monst = moTentacletail;
  else c.monst = moNone;

  if (m === moPair && c.move(c.mondir).monst === moPair) {
    changes.ccell(c.move(c.mondir));
    killMonster(c.move(c.mondir), who, deathflags);
  }

  if (isMagneticPole(m) && c.move(c.mondir).monst === otherpole(m)) {
    changes.ccell(c.move(c.mondir));
    killMonster(c.move(c.mondir), who, deathflags);
  }

  if (m === moEarthElemental) earthWall(c);
  if (m === moAlbatross && G.items[itOrbLuck])
    useupOrb(itOrbLuck, idiv(G.items[itOrbLuck], 2));

  if (m === moAirElemental) {
    changes.value_keep_array(G.airmap);
    G.airmap.length = 0;
    for (let i = 0; i < isize(G.dcal); i++)
      if (G.dcal[i].monst === moAirElemental)
        G.airmap.push([G.dcal[i], 0]);
    buildAirmap();
  }
  if (m === moMimic) {
    for (const mp of G.mirror_mirrors) if (c === mp[1].at) {
      drawParticles(c, mirrorcolor(mp[1].mirrored), pcount);
      if (c.wall === waMirrorWall)
        drawParticles(c, mirrorcolor(!mp[1].mirrored), pcount);
    }
    pcount = 0;
  }

  drawParticles(c, minf[m].color, pcount);
  if (fallanim) {
    fallingMonsterAnimation(c, m);
  }
}

/** changes.value_keep(*i) for a princess::info */
function changes_value_keep_info(i: princess_info): void {
  if (!changes.on) return;
  const old = i.clone();
  changes.at_rollback(() => { Object.assign(i, old); });
}

export function fightmessage(victim: eMonster, attacker: eMonster, stun: boolean, flags: flagtype): void {

  if (isBird(attacker)) {
    playSound(null!, 'hit-axe' + pick123());
    addMessage(XLAT('%The1 claws %the2!', spM(attacker), spM(victim)));
  }

  else if (isGhost(attacker))
    addMessage(XLAT('%The1 scares %the2!', spM(attacker), spM(victim)));

  else if (isSlimeMover(attacker) && !stun) {
    playSound(null!, 'hit-crush' + pick123());
    addMessage(XLAT('%The1 eats %the2!', spM(attacker), spM(victim)));
  }

  else if (flags & AF_EAT) {
    playSound(null!, 'hit-crush' + pick123());
    addMessage(XLAT('%The1 eats %the2!', spM(attacker), spM(victim)));
  }

  else if (attacker === moLancer) {
    playSound(null!, 'hit-rose');
    addMessage(XLAT('%The1 pierces %the2!', spM(attacker), spM(victim)));
  }

  else if (attacker === moEarthElemental) {
    playSound(null!, 'hit-crush' + pick123());
    addMessage(XLAT('%The1 punches %the2!', spM(attacker), spM(victim)));
  }

  else if (attacker === moPlayer) {
    if (flags & (AF_SWORD | AF_SWORD_INTO)) {
      playSound(null!, 'hit-axe' + pick123());
      addMessage(XLAT('You slash %the1.', spM(victim)));
      if (victim === moGoblin)
        achievement_gain_once('GOBLINSWORD');
    }
    else if (victim === moKrakenT || victim === moDragonTail || victim === moDragonHead) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('You hit %the1.', spM(victim))); // normal
    }
    else if (stun && victim === moVizier) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('You hit %the1.', spM(victim))); // normal
    }
    else if (stun) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('You stun %the1.', spM(victim))); // normal
    }
    else if (isNonliving(victim)) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('You destroy %the1.', spM(victim))); // normal
    }
    else if (flags & AF_STAB) {
      playSound(null!, 'hit-axe' + pick123());
      addMessage(XLAT('You stab %the1.', spM(victim))); // normal
    }
    else if (flags & AF_APPROACH) {
      playSound(null!, 'hit-sword' + pick123());
      if (victim === moLancer)
        addMessage(XLAT('You trick %the1.', spM(victim))); // normal
      else
        addMessage(XLAT('You pierce %the1.', spM(victim))); // normal
    }
    else if (G.items[itOrbSlaying]) {
      playSound(null!, 'hit-crush' + pick123());
      addMessage(XLAT('You crush %the1!', spM(victim))); // normal
    }
    else if (stun && G.items[itCurseWeakness]) {
      playSound(null!, 'click');
      addMessage(XLAT('You punch %the1.', spM(victim))); // normal
    }
    else if (!G.peace_on) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('You kill %the1.', spM(victim))); // normal
    }
  }

  else {
    if (victim === moKrakenT || victim === moDragonTail || victim === moDragonHead) {
      playSound(null!, 'hit-crush' + pick123());
      addMessage(XLAT('%The1 hits %the2.', spM(attacker), spM(victim))); // normal
    }
    else if (stun && victim === moVizier) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('%The1 hits %the2.', spM(attacker), spM(victim))); // normal
    }
    else if (stun) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('%The1 attacks %the2!', spM(attacker), spM(victim))); // normal
    }
    else if (isNonliving(victim)) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('%The1 destroys %the2!', spM(attacker), spM(victim))); // normal
    }
    else if (flags & AF_STAB) {
      playSound(null!, 'hit-axe' + pick123());
      addMessage(XLAT('%The1 stabs %the2.', spM(attacker), spM(victim)));
    }
    else if (flags & AF_APPROACH) {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('%The1 tricks %the2.', spM(attacker), spM(victim)));
    }
    else {
      playSound(null!, 'hit-sword' + pick123());
      addMessage(XLAT('%The1 kills %the2!', spM(attacker), spM(victim)));
    }
  }
}

export function notthateasy(m: eMonster): boolean {
  return (
    isMultitile(m) || isStunnable(m) || m === moDraugr);
}

export function attackMonster(c: cell, flags: flagtype, killer: eMonster): boolean {

  if ((flags & AF_GETPLAYER) && isPlayerOn(c)) {
    killThePlayerAt(killer, c, flags);
    return true;
  }

  const m = c.monst;
  const tk = tkills();

  const tkt = killtypes();

  let dostun = attackJustStuns(c, flags, killer);

  if ((flags & AF_BULL) && c.monst === moVizier && c.hitpoints > 1) {
    dostun = true;
    c.stuntime = 2;
  }

  const eu = landUnlocked(laElementalWall);
  const tu = landUnlocked(laTrollheim);

  if (flags & AF_MSG) fightmessage(m, killer, dostun, flags);
  if (dostun)
    stunMonster(c, killer, flags);
  else
    killMonster(c, killer, flags);

  if (G.peace_on) return false;

  const ntk = tkills();
  const ntkt = killtypes();

  if (tkt < R20() && ntkt >= R20() && in_full_game() && isLandIngame(laDragon)) {
    addMessage(XLAT('You hear a distant roar!'));
    playSound(null!, 'message-roar');
  }

  if (tk === 0 && ntk > 0 && in_full_game() && !G.cheater) {
    if (notthateasy(m))
      addMessage(XLAT('Quite tough, for your first fight.'));
    else {
      let more = false;
      const cw = G.cwt.at;
      for (let i = 0; i < cw.type; i++) {
        const c2 = cw.move(i); if (!c2) continue;
        for (let j = 0; j < c2.type; j++) {
          const c3 = c2.move(j); if (!c3) continue;
          if (c3.monst) more = true;
        }
      }
      if (!more)
        addMessage(XLAT('That was easy, but groups could be dangerous.'));
    }
  }

  if (tk < 10 && ntk >= 10 && in_full_game() && !big_unlock())
    addMessage(XLAT('Good to know that your fighting skills serve you well in this strange world.'));

  if (tk < idiv(R100(), 2) && ntk >= idiv(R100(), 2) && in_full_game() && isLandIngame(laGraveyard))
    addMessage(XLAT('You wonder where all these monsters go, after their death...'));

  if (tk < R100() && ntk >= R100() && in_full_game() && isLandIngame(laGraveyard))
    addMessage(XLAT('You feel that the souls of slain enemies pull you to the Graveyard...'));

  if (!tu && landUnlocked(laTrollheim) && in_full_game() && isLandIngame(laTrollheim)) {
    playSound(c, 'message-troll');
    addMessage(XLAT('%The1 says, "I die, but my clan in Trollheim will avenge me!"', spM(m)));
  }

  if (!eu && landUnlocked(laElementalWall) && in_full_game() && isLandIngame(laElementalWall))
    addMessage(XLAT('After killing %the1, you feel able to reach the Elemental Planes!', spM(m)));

  if (m === moVizier && c.monst !== moVizier && G.kills[moVizier] === 1 && in_full_game()) {
    if (isLandIngame(laEmerald))
      addMessage(XLAT('Hmm, he has been training in the Emerald Mine. Interesting...'));
    G.princess_forceMouse = true;
  }

  if (m === moIvyRoot && ntk > tk)
    achievement_gain_once('IVYSLAYER');

  return ntk > tk;
}

export function pushMonster(mi: movei): void {
  if (mi.s.monst === moPair || isMagneticPole(mi.s)) {
    const other = mi.s.move(mi.s.mondir);
    const id = neighborId(mi.t, other);
    if (id === -1) {
      killMonster(mi.s, moPlayer);
      killMonster(other, moPlayer);
      return;
    }
    else {
      moveMonster(mi);
      if (mi.t.monst) {
        mi.t.mondir = id;
        other.mondir = mi.t.c.spin(id);
      }
    }
  }
  else
    moveMonster(mi);
  const cf = mi.s;
  const ct = mi.t;
  if (ct.monst === moBrownBug) {
    const t = snakelevel(ct) - snakelevel(cf);
    if (t > 0)
      ct.stuntime = Math.min(ct.stuntime + 2 * t, 7);
  }
  if (isBull(ct.monst)) ct.monst = moRagingBull;
}

export function killFriendlyIvy(): void {
  const cw = G.cwt.at;
  for (let i = 0; i < cw.type; i++) {
    const c2 = cw.move(i); if (!c2) continue;
    if (c2.monst === moFriendlyIvy)
      killMonster(c2, moPlayer, 0n);
  }
}

export function monsterPushable(c2: cell): boolean {
  if (markOrb(itCurseWeakness) && (c2.stuntime < 2 || attackJustStuns(c2, 0n, moPlayer))) return false;
  if (isMultitile(c2.monst)) return false;
  return (c2.monst !== moFatGuard && !(isMetalBeast(c2.monst) && c2.stuntime < 2) && c2.monst !== moTortoise && c2.monst !== moTerraWarrior && c2.monst !== moVizier && c2.monst !== moWorldTurtle);
}

export function should_switchplace(_c1: cell, c2: cell): boolean {
  if (isPrincess(c2.monst) || among(c2.monst, moGolem, moIllusion, moMouse, moFriendlyGhost))
    return true;

  if (G.peace_on) return c2.monst !== 0;
  return false;
}

export function switchplace_prevent(c1: cell, c2: cell, m: pcmove): boolean {
  if (!should_switchplace(c1, c2)) return false;
  if (G.peace_on && (isMultitile(c2.monst) || saved_tortoise_on(c2) || isDie(c2.monst))) {
    if (m.vmsg(miRESTRICTED, siMONSTER, c2, c2.monst)) addMessage(XLAT('Cannot switch places with %the1!', spM(c2.monst)));
    return true;
  }
  if (c1.monst && c1.monst !== moFriendlyIvy) {
    if (m.vmsg(miRESTRICTED, siMONSTER, c1, c1.monst)) addMessage(XLAT('There is no room for %the1!', spM(c2.monst)));
    return true;
  }
  if (passable(c1, c2, P_ISFRIEND | (c2.monst === moTameBomberbird ? P_FLYING : 0n))) return false;
  if (warningprotection_hit(c2.monst)) return true;
  return false;
}

export function handle_switchplaces(c1: cell, c2: cell, switchplaces: Ref<boolean>): void {
  if (should_switchplace(c1, c2)) {
    let pswitch = false;
    if (c2.monst === moMouse)
      princess_mouseSqueak(c2);
    else if (isPrincess(c2.monst)) {
      princess_line(c2);
      princess_move(match(c2, c1));
    }
    else
      pswitch = true;
    c1.hitpoints = c2.hitpoints;
    c1.stuntime = c2.stuntime;
    placeGolem(c1, c2, c2.monst);
    if (G.cwt.at.monst !== moNone && pswitch)
      addMessage(XLAT('You switch places with %the1.', spM(c2.monst)));
    c2.monst = moNone;
    switchplaces.v = true;
  }
}

export function flashWouldKill(c: cell, extra: flagtype): boolean {
  for (let t = 0; t < c.type; t++) {
    const c2 = c.cmove(t);
    for (let u = 0; u < c2.type; u++) {
      const c3 = c2.cmove(u);
      if (isWorm(c3)) continue; // immune to Flash
      if (isFriendly(c3)) continue; // player's allies and mounts don't count
      if (c3.monst === moEvilGolem) continue; // evil golems don't count
      if (c3 !== c && (c3.monst || isPlayerOn(c3))) {
        const b = canAttack(null!, moWitchFlash, c3, c3.monst, AF_MAGIC | extra);
        if (b) return true;
      }
    }
  }
  return false;
}

export function gun_targets(c: cell): cell[] {
  const cl = new manual_celllister();
  try {
    const dists: number[] = [];
    cl.add(c); dists.push(0);
    for (let i = 0; i < isize(dists); i++) {
      const c1 = cl.lst[i];
      if (dists[i] <= 2)
        for (let k = 0; k < c1.type; k++) {
          const c2 = c1.move(k); if (!c2) continue;
          if (passable(c2, c1, P_BULLET | P_FLYING | P_MONSTER))
            if (cl.add(c2)) dists.push(dists[i] + 1);
        }
    }
    cl.remove(c);
    return [...cl.lst];
  } finally { cl.destroy(); }
}

export function fallMonster(c: cell, flags: flagtype = 0n): void {
  attackMonster(c, flags, moNone);
}

export function killHardcorePlayer(id: number, flags: flagtype): void {
  const cs = getcs(id);
  const c = playerpos(id);
  if (flags & AF_FALL)
    fallingMonsterAnimation(c, moPlayer);
  else for (let i = 0; i < 6; i++) {
    drawParticle(c, cs.skincolor >>> 8, 100);
    drawParticle(c, cs.haircolor >>> 8, 125);
    if (cs.charid)
      drawParticle(c, cs.dresscolor >>> 8, 150);
    else
      drawParticle(c, cs.skincolor >>> 8, 150);
    if (cs.charid === 3)
      drawParticle(c, cs.dresscolor2 >>> 8, 175);
    else
      drawParticle(c, cs.skincolor >>> 8, 150);
    drawParticle(c, cs.swordcolor >>> 8, 200);
  }

  if (G.multi_players > 1 && multi_activePlayers() > 1) {
    multi_leaveGame(id);
  }
  else {
    G.canmove = false;
    achievement_final(true);
  }
}

export function killThePlayer(m: eMonster, id: number, flags: flagtype): void {
  if (markOrb(itOrbShield)) return;
  if (G.shmup_on) {
    G.multi_cpid = id;
    shmup_killThePlayer(m);
  }
  else if (G.items[itOrbDomination] && playerpos(id).monst) {
    addMessage(XLAT('%The1 tries to dismount you!', spM(m)));
    attackMonster(playerpos(id), AF_NORMAL, m);
    useupOrb(itOrbDomination, idiv(G.items[itOrbDomination], 2));
  }
  else if (G.items[itOrbShell] && !(flags & AF_EAT)) {
    addMessage(XLAT('%The1 attacks your shell!', spM(m)));
    useupOrb(itOrbShell, 10);
    if (G.items[itOrbShell] < 1) { G.items[itOrbShell] = 1; G.orbused[itOrbShell] = true; }
  }
  else if (G.hardcore) {
    addMessage(XLAT('You are killed by %the1!', spM(m)));
    G.yasc_message = XLAT('killed by %the1', spM(m));
    killHardcorePlayer(id, flags);
  }
  else if (m === moLightningBolt && G.lastmovetype === lmAttack && isAlchAny(playerpos(id))) {
    addMessage(XLAT('You are killed by %the1!', spM(m)));
    addMessage(XLAT("Don't play with slime and electricity next time, okay?"));
    G.yasc_message = XLAT('killed by %the1', spM(m));
    G.kills[moPlayer]++;
    G.items[itOrbSafety] = 0;
  }
  else {
    //  printf("confused!\n");
    addMessage(XLAT('%The1 is confused!', spM(m)));
    changes.value_set(G, 'suicidal', true);
  }
}

export function killThePlayerAt(m: eMonster, c: cell, flags: flagtype): void {
  for (const i of player_indices())
    if (playerpos(i) === c)
      killThePlayer(m, i, flags);
}

export function do_swords(mi: movei, who: eMonster, f: (c: cell, bb: number) => void): void {
  for (let bb = 0; bb < 2; bb++) if (who === moPlayer && sword_orbcount(bb !== 0)) {
    const sf = sword_pos(mi.s, G.sword_dir[G.multi_cpid], bb !== 0);
    const st = sword_pos(mi.t, sword_shift(mi, G.sword_dir[G.multi_cpid]), bb !== 0);
    f(st, bb);
    if (sf !== st && !isNeighbor(sf, st)) {
      // also attack the in-transit cell
      if (S3() === 3) {
        for (let i = 0; i < sf.type; i++) {
          const sb = sf.move(i); if (!sb) continue;
          if (isNeighbor(sb, st) && sb !== mi.s && sb !== mi.t) f(sb, bb);
        }
      }
      else {
        for (let i = 0; i < mi.s.type; i++) {
          const sb = mi.s.move(i); if (!sb) continue;
          if (isNeighbor(sb, st) && sb !== mi.t) f(sb, bb);
        }
        for (let i = 0; i < mi.t.type; i++) {
          const sb = mi.t.move(i); if (!sb) continue;
          if (isNeighbor(sb, sf) && sb !== mi.s) f(sb, bb);
        }
      }
    }
  }
}

const lastdouble = { v: -3 };

export function stabbingAttack(mi: movei, who: eMonster, bonuskill = 0): void {
  let numsh = 0, numflail = 0, numlance = 0, numslash = 0;
  const numbb = [0, 0];

  const mf = mi.s;
  const mt = mi.t;
  const backdir = mi.rev_dir_mirror();

  do_swords(mi, who, (c: cell, bb: number) => { if (swordAttack(mt, who, c, bb)) { numbb[bb]++; numslash++; } });

  for (let bb = 0; bb < 2; bb++) achievement_count('SLASH', numbb[bb], 0);

  if (G.peace_on) return;
  const out = who === moPlayer && bow_crossbow_mode();

  for (let t = 0; t < mf.type; t++) {
    let c = mf.move(t);
    if (!c) continue;

    let stabthere = false, away = true;
    if (logical_adjacent(mt, who, c)) { stabthere = true; away = false; }
    if (inmirror(c)) c = mirror_reflect(new cellwalker(c)).at;

    if (stabthere && c.wall === waExplosiveBarrel && markOrb(itOrbThorns))
      explodeBarrel(c);

    if (stabthere && (G.items[itOrbThorns] || !out) && canAttack(mt, who, c, c.monst, AF_STAB)) {
      changes.ccell(c);
      if (c.monst !== moHedge || out) {
        markOrb(itOrbThorns); if (who !== moPlayer) markOrb(itOrbEmpathy);
      }
      const m = c.monst;
      const k = tkills();
      if (attackMonster(c, AF_STAB | AF_MSG, who)) {
        spread_plague(mt, c, t, who);
        produceGhost(c, m, who);
      }
      if (tkills() > k) numsh++;
    }

    if (away && c !== mt && canAttack(mf, who, c, c.monst, AF_BACK)) {
      changes.ccell(c);
      if (c.monst === moVizier && c.hitpoints > 1) {
        fightmessage(c.monst, who, true, AF_BACK);
        c.hitpoints--;
        // c->stuntime = 1;
      }
      else {
        const m = c.monst;
        if (c.monst !== moFlailer) {
          playSound(null!, 'hit-sword' + pick123());
          fightmessage(c.monst, who, false, AF_BACK);
        }
        else {
          playSound(null!, 'hit-sword' + pick123());
          if (who !== moPlayer)
            addMessage(XLAT('%The1 tricks %the2.', spM(who), spM(c.monst)));
          else
            addMessage(XLAT('You trick %the1.', spM(c.monst)));
        }
        if (c.monst === moFlailer && isPrincess(who) && isUnarmed(who))
          achievement_gain_once('PRINCESS_PACIFIST');

        if (attackMonster(c, 0n, who)) {
          numflail++;
          spread_plague(mf, c, t, who);
          produceGhost(c, m, who);
        }
      }
    }
  }

  for (let t = 0; t < mt.type; t++) {
    const c = mt.move(t); if (!c) continue;
    if (!logical_adjacent(mt, who, c)) continue;
    const mm = c.monst;
    let flag = 0n;
    if (!isUnarmed(who) && !out) flag |= AF_APPROACH;
    if (proper(mt, backdir) && anglestraight(mt, backdir, t)) flag |= AF_HORNS;
    if (!flag) continue;
    if (canAttack(mt, who, c, c.monst, flag)) {
      changes.ccell(c);
      if (attackMonster(c, flag | AF_MSG, who)) numlance++;
      spread_plague(mt, c, t, who);
      produceGhost(c, mm, who);
    }
  }

  if (who === moPlayer && !bow_crossbow_mode()) {
    if (numsh) achievement_count('STAB', numsh, 0);

    if (numlance && numflail && numsh) achievement_gain_once('MELEE3');

    if (numlance + numflail + numsh + numslash + bonuskill >= 5) achievement_gain_once('MELEE5');

    if (numsh === 2) {
      if (lastdouble.v === G.turncount - 1) achievement_count('STAB', 4, 0);
      changes.value_set(lastdouble, 'v', G.turncount);
    }
  }
}
