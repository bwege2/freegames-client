// monstermove.cpp of HyperRogue 13.1o: monster movement. Package P6.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Overloads: angledist(cell *c, int d1, int d2) keeps the name, angledist(int t, int d1, int d2) is `angledist_n`.
// G.butterflies is vector<pair<cell*, int>>: [cell, number][]. movesofgood (grow_vector<vector<cell*>>) is a
// cell[][] grown by movesofgood_grow(n). The pathdata objects of C++ (destroyed at the end of their scope) are
// destroyed in finally blocks.
import { achievement_count, achievement_gain_once, specgeom_zebra } from './achievement.ts';
import {
  animate_item_throw, animateCorrectAttack, animateMovement, drawParticles, fallingFloorAnimation, LAYER_BIG,
  LAYER_BOAT, LAYER_SMALL,
} from './animations.ts';
import {
  attackJustStuns, attackMonster, canAttack, fallMonster, fightmessage, flashWouldKill, gun_targets, killThePlayerAt,
  pushMonster, stabbingAttack, tkills,
} from './attack.ts';
import { preventbarriers } from './barriers.ts';
import { addMessage } from './basegraph.ts';
import { celldistAlt, celldistance, createMov, getDistLimit, isNeighbor, neighborId } from './cell.ts';
import { printf } from './cfile.ts';
import { monstersnear } from './checkmove.ts';
import { closed_or_bounded, eubinary, euclid, hyperbolic, quotient, sphere } from './classes.ts';
import {
  dragon_move, heat_absheat, hive_movebugs, kraken_attacks, kraken_trymove, prairie_move, princess_getPrisonInfo,
  princess_move, sword_at, sword_isnear, tortoise_move_adult, tortoise_move_baby, whirlpool_move,
  whirlwind_jumpDestination, whirlwind_jumpFromWhereTo, whirlwind_move,
} from './complex.ts';
import {
  ambush_check_state, camelot_move_knight, dice_roll, mine_marked_mine, terracotta_check_around, westwall_move,
} from './complex2.ts';
import { princessgender } from './config.ts';
import {
  type eMonster, type flagtype, IC_ORB, IF_CURSE, itBabyTortoise, itFatigue, itHunting, itNone, itOrb37, itOrbAether,
  itOrbBeauty, itOrbDiscord, itOrbEmpathy, itOrbFire, itOrbFlash, itOrbGravity, itOrbLife, itOrbSafety, itOrbSlaying,
  itOrbSpeed, itOrbTime, itOrbUndeath, itOrbWater, itOrbWinter, itSpice, itTrollEgg, ittypes, laBurial, laClearing,
  laCocytus, laCursed, laDesert, laGraveyard, laHalloween, laOvergrown, laPalace, laRose, laTrollheim, laVolcano,
  linf, minf, moAirElemental, moAltDemon, moAnimatedDie, moBat, moBrownBug, moButterfly, moCrusher, moCrystalSage,
  moCShark, moCultist, moDeadBird, moDonkey, moDragonHead, moDraugr, moEagle, moEarthElemental, moEvilGolem,
  moFatGuard, moFireElemental, moFlailer, moFriendlyGhost, moFrog, moGadfly, moGhost, moGoblin, moGolem,
  moGolemMoved, moGreaterShark, moHexDemon, moHexer, moHexSnake, moHexSnakeTail, moHunterChanging, moHunterDog,
  moHunterGuard, moIllusion, moIvyBranch, moIvyDead, moIvyHead, moIvyRoot, moIvyWait, moKnight, moKnightMoved,
  moKrakenH, moKrakenT, moLancer, moLavaWolf, moMetalBeast, moMimic, moMonk, moMouse, moMouseMoved, moMutant,
  moNecromancer, moNone, moOutlaw, moPair, moPalace, moPhaser, moPirate, moPlayer, moPrincess, moPrincessArmed,
  moPrincessArmedMoved, moPrincessMoved, moPyroCultist, moRagingBull, moRatling, moRatlingAvenger, moReptile,
  moRoseBeauty, moSalamander, moShadow, moShark, moSkeleton, moSleepBull, moSlime, moTameBomberbird,
  moTameBomberbirdMoved, moTentacle, moTentacleEscaping, moTentacleGhost, moTentacletail, moTentaclewait,
  moTerraWarrior, moTortoise, moVampire, moVaulter, moViking, moVoidBeast, moWaterElemental, moWitch, moWitchFire,
  moWitchFlash, moWitchGhost, moWitchSpeed, moWitchWinter, moWolf, moWolfMoved, moWorldTurtle, moWorm, moWormtail,
  moWormwait, moYeti, moZombie, waAncientGrave, waArrowTrap, waBigStatue, waBigTree, waBoat, waBurningDock,
  waCamelotMoat, waCavefloor, waCavewall, waChasm, waClosedGate, waClosePlate, waCloud, waDeadTroll, waDeadTroll2,
  waDeadwall, waDock, waEternalFire, waExplosiveBarrel, waFireTrap, waFreshGrave, waFrozenLake, waGargoyle, waGlass,
  waIcewall, waLake, waMineUnknown, waMirror, waNone, waOpenPlate, waPetrified, waRed1, waRed2, waRed3, waReptile,
  waRose, waRuinWall, waSandstone, waSea, waShrub, waSmallTree, waStone, waStrandedBoat, waThumperOff, waThumperOn,
  waTower, waTrapdoor, waVinePlant,
} from './content.ts';
import { idiv, sortedKeys } from './cpp.ts';
import { raiseBuggyGeneration } from './debug.ts';
import {
  bfs, HF_AIR, HF_ALT, HF_BIRD, HF_BUG, HF_DICE, HF_DRAGON, HF_EAGLES, HF_EARTH, HF_FAILED_AMBUSH, HF_FAST, HF_HEX,
  HF_HEXD, HF_JUMP, HF_KRAKEN, HF_LEADER, HF_MONK, HF_MUTANT, HF_REPTILE, HF_RIVER, HF_ROSE, HF_SHARK, HF_SLOW,
  HF_VOID, HF_WATER, HF_WESTWALL, HF_WHIRLPOOL, HF_WHIRLWIND, in_line_of_sight, moverefresh, onpath_mark, pathdata,
} from './environment.ts';
import {
  cellHalfvine, cellUnstable, cellUnstableOrChasm, classflag, do_not_touch_this_wall, frog_power, ignoresPlates,
  ignoresSmell, isActiveEnemy, isBug, isBull, isDie, isDragon, isFire, isFriendly, isFriendlyOrBug, isFrog,
  isGhostMover, isIcyLand, isInactiveEnemy, isIvy, isLeader, isMagneticPole, isMetalBeast, isMimic, isMounted,
  isMutantIvy, isNonliving, isPowerMonster, isPrincess, isRatling, isShark, isSwitch, isThorny, isTroll, isWatery,
  isWitch, isWorm, itemclass, realred, slowMover, snakelevel, survivesFall, survivesThorns,
} from './flags.ts';
import { canPushThumperOn, haveMount, normal_gravity_at, pushThumper } from './game.ts';
import { G } from './globals.ts';
import { pick123 } from './hprint.ts';
import {
  AF_BULL, AF_CRUSH, AF_EAT, AF_FALL, AF_GETPLAYER, AF_GUN, AF_IGNORE_UNARMED, AF_LANCE, AF_MAGIC, AF_MSG,
  AF_MUSTKILL, AF_NORMAL, AF_NOSHIELD, AF_ONLY_ENEMY, AF_ONLY_FBUG, AF_ONLY_FRIEND, AF_SWORD_INTO, among, isize,
  MAXPLAYER, MF_MOUNT, MF_NOATTACKS, MF_NOFRIEND, MF_ONLYEAGLE, MF_PATHDIST, MF_STUNNED, PINFD, ROCKSNAKELENGTH,
  SAGEMELT, WORMLENGTH,
} from './hyper.ts';
import { notDippingForExtra, setdist } from './landgen.ts';
import { treasureType } from './landlock.ts';
import { spI, spM, spW, XLAT } from './language.ts';
import {
  cell, cellwalker, JUMP, jumpdata, manual_celllister, match, movei, moveimon, NODIR, proper, STRONGWIND,
} from './locations.ts';
import {
  activateArrowTrap, bird_disruption, cellDangerous, cellEdgeUnstable, destroyHalfvine, destroyWeakBranch,
  determinePush, earthFloor, earthMove, explodeAround, explodeBarrel, gravityLevelDiff, makeflame, mayExplodeMine,
  nonAdjacent, snakepile, toggleGates_w,
} from './mapeffects.ts';
import { wandering } from './monstergen.ts';
import {
  activateFlashFrom, checkStunKill, common_neighbor, empathyMove, markOrb, orbcharges, orboflava,
} from './orbs.ts';
import {
  againstRose, buildAirmap, buildRosemap, ghostmove, incline, ivy_passable, logical_adjacent, moveBoatIfUsingOne,
  movegroup, P_BLOW, P_CHAIN, P_DEADLY, P_FISH, P_MIRROR, P_MONSTER, P_ONPLAYER, P_WIND, passable, passable_for,
  placeWater,
} from './passable.ts';
import { pattern_threecolor, pseudohept } from './pattern2.ts';
import {
  afterplayermoved, allPlayersInBoats, changes, isPlayerOn, lmSkip, numplayers, player_indices, player_positions,
  playerInPower, playerpos, produceGhost, sideAttack, spread_plague,
} from './pcmove.ts';
import { hrand, hrand_elt, hrandom_permutation, hrandom_shuffle } from './rand.ts';
import { shmup_destroyBoats } from './shmup.ts';
import { playSeenSound, playSound } from './sound.ts';


/** monsters to move, ordered by the number of possible good moves */
const movesofgood: cell[][] = [];
function movesofgood_grow(index: number): cell[] {
  while (index >= movesofgood.length) movesofgood.push([]);
  return movesofgood[index];
}

export function addButterfly(c: cell): void {
  if (G.shmup_on) return;
  for (let i = 0; i < isize(G.butterflies); i++)
    if (G.butterflies[i][0] === c) {
      G.butterflies[i][1] = 0;
      return;
    }
  G.butterflies.push([c, 0]);
}

export function makeTrollFootprints(c: cell): void {
  if (c.land !== laTrollheim) return;
  if (c.item === itTrollEgg && c.landparam) return;
  c.landparam = G.turncount + 100;
}

export function hasPrincessWeapon(m: eMonster): boolean {
  return m === moPalace || m === moFatGuard;
}

export function sageheat(c: cell, v: number): void {
  c.LHU.heat += v;
  if (c.wall === waFrozenLake && c.LHU.heat > .6) c.wall = waLake;
}

let sagefresh = true;

/** effect of moving monster m from cf to ct
 *  this is called from moveMonster, or separately from moveIvy/moveWorm,
 *  or when a dead bird falls (then m == moDeadBird)
 */
export function moveEffect(mi: movei, m: eMonster): void {

  const cf = mi.s;
  const ct = mi.t;
  if (cf) destroyWeakBranch(cf, ct, m);

  mayExplodeMine(ct, m);

  // CAP_COMPLEX2
  if (!isNonliving(m)) terracotta_check_around(ct);

  if (ct.wall === waMineUnknown && !ct.item && !ignoresPlates(m) && normal_gravity_at(ct))
    ct.landparam |= 2; // mark as safe

  if ((ct.wall === waClosePlate || ct.wall === waOpenPlate) && !ignoresPlates(m) && normal_gravity_at(ct))
    toggleGates_w(ct, ct.wall);
  if (m === moDeadBird && cf === ct && cellUnstable(cf) && normal_gravity_at(ct)) {
    fallingFloorAnimation(cf);
    cf.wall = waChasm;
  }

  if (ct.wall === waReptile) ct.wparam = -1;

  if (ct.wall === waArrowTrap && !ignoresPlates(m) && normal_gravity_at(ct))
    activateArrowTrap(ct);

  if (ct.wall === waFireTrap && !ignoresPlates(m) && ct.wparam === 0 && normal_gravity_at(ct)) {
    playSound(ct, 'click');
    ct.wparam = 1;
  }

  if (cf && isPrincess(m)) princess_move(mi);

  // CAP_COMPLEX2
  if (cf && m === moKnight) camelot_move_knight(cf, ct);

  if (cf && m === moTortoise) {
    tortoise_move_adult(cf, ct);
  }

  if (cf && ct.item === itBabyTortoise && !cf.item) {
    cf.item = itBabyTortoise;
    ct.item = itNone;
    animateMovement(mi.rev(), LAYER_BOAT);
    tortoise_move_baby(cf, ct);
  }

  if (isFrog(m) && !isNeighbor(cf, ct)) {
    for (let i = 0; i < ct.type; i++) {
      const c1 = ct.move(i); if (!c1) continue;
      if (c1.monst && !isFrog(c1.monst) && !isFriendly(c1.monst)) {
        c1.stuntime = Math.min(c1.stuntime + 2, 7);
        checkStunKill(c1);
      }
    }
  }

  // CAP_COMPLEX2
  if (isDie(m) && mi.proper())
    dice_roll(mi);
}

export function check_beauty(ct: cell, cf: cell, m: eMonster): void {
  let adj = false;
  if (ct.cpdist === 1 && (G.items[itOrb37] || !nonAdjacent(cf, ct)) && markOrb(itOrbBeauty) && !isFriendly(ct))
    adj = true;

  if (!adj && G.items[itOrbEmpathy] && G.items[itOrbBeauty] && !isFriendly(ct)) {
    for (let i = 0; i < ct.type; i++) if (ct.move(i) && isFriendly(ct.move(i))) {
      adj = true; markOrb(itOrbEmpathy); markOrb(itOrbBeauty);
    }
  }

  if (adj && ct.stuntime === 0 && !isMimic(m)) {
    ct.stuntime = 2;
    checkStunKill(ct);
  }
}

export function moveMonster(mi: movei): void {
  const cf = mi.s;
  const ct = mi.t;
  let m = cf.monst;
  changes.ccell(cf);
  changes.ccell(ct);
  const fri = isFriendly(cf);
  if (isDragon(m)) {
    printf('called for Dragon\n');
    return;
  }
  if (m !== moMimic) animateMovement(mi, LAYER_SMALL);
  // the following line is necessary because otherwise plates disappear only inside the sight range
  if (cellUnstable(cf) && !ignoresPlates(m)) {
    fallingFloorAnimation(cf);
    changes.ccell(cf);
    cf.wall = waChasm;
  }
  moveEffect(mi, m);
  if (ct.wall === waCamelotMoat &&
    (m === moShark || m === moCShark || m === moGreaterShark))
    achievement_gain_once('MOATSHARK');
  if (m === moTentacleGhost) {
    changes.ccell(cf);
    cf.monst = moTentacletail;
    m = moGhost;
  }
  else cf.monst = moNone;
  if (ct.monst === moTentacletail && m === moGhost) {
    ct.monst = moTentacleGhost;
  }
  else {
    ct.monst = m;
    if (m === moWolf) ct.monst = moWolfMoved;
    if (m === moHunterChanging) ct.stuntime = 1;
    const d = neighborId(ct, cf);
    if (ct.monst !== moTentacleGhost)
      ct.mondir = d;
    if (d >= 0)
      ct.monmirror = cf.monmirror ^ (ct.c.mirror(d) ? 1 : 0);
  }
  ct.hitpoints = cf.hitpoints;
  ct.stuntime = cf.stuntime;

  if (isMagneticPole(m) || m === moPair) {
    if (cf.mondir === 15) {
      ct.monst = moPirate;
      return;
    }
    const other_pole = cf.move(cf.mondir);
    if (other_pole) {
      ct.mondir = neighborId(ct, other_pole);
      other_pole.mondir = neighborId(other_pole, ct);
    }
  }

  if (fri || isBug(m) || G.items[itOrbDiscord]) stabbingAttack(mi, m);

  if (mi.d === JUMP && m === moVaulter) {
    const cm = common_neighbor(cf, ct);
    changes.ccell(cm);
    if (cm.wall === waShrub) cm.wall = waNone;
    if (cm.wall === waSmallTree) cm.wall = waNone;
    if (cm.wall === waBigTree) cm.wall = waSmallTree;
    if (cm.wall === waExplosiveBarrel) explodeBarrel(cm);
    if (cm.monst)
      attackMonster(cm, AF_NORMAL | AF_MSG | AF_GETPLAYER, m);
    ct.mondir = JUMP;
  }

  if (isLeader(m)) {
    if (ct.wall === waBigStatue) {
      ct.wall = cf.wall;
      ct.wparam = cf.wparam;
      cf.wall = waBigStatue;
      animateMovement(mi.rev(), LAYER_BOAT);
    }

    moveBoatIfUsingOne(mi);
  }

  if (isTroll(m)) { makeTrollFootprints(ct); makeTrollFootprints(cf); }

  const inc = incline(cf, ct);

  if (m === moEarthElemental) {
    if (!passable(ct, cf, 0n)) earthFloor(ct);
    earthMove(mi);
  }

  if (m === moWaterElemental) {
    placeWater(ct, cf);
    for (let i = 0; i < ct.type; i++) {
      const c2 = ct.move(i);
      if (!c2) continue;
      if (c2.wall === waBoat && !(isPlayerOn(c2) && markOrb(itOrbWater))) {
        addMessage(XLAT('%The1 is washed away!', spW(c2.wall), spM(moWaterElemental)));
        placeWater(c2, ct);
      }
      else if (c2.wall === waStrandedBoat) {
        addMessage(XLAT('%The1 is washed away!', spW(c2.wall), spM(moWaterElemental)));
        c2.wall = waNone;
      }
      else if (c2.wall === waDeadTroll) {
        addMessage(XLAT('%The1 is washed away!', spW(c2.wall), spM(moWaterElemental)));
        c2.wall = waCavefloor;
      }
      else if (c2.wall === waDeadTroll2) {
        addMessage(XLAT('%The1 is washed away!', spW(c2.wall), spM(moWaterElemental)));
        c2.wall = waNone;
      }
      else if (isFire(c2) && c2.wall !== waEternalFire) {
        addMessage(XLAT('%The1 is extinguished!', spW(c2.wall), spM(moWaterElemental)));
        if (c2.wall === waBurningDock)
          c2.wall = waDock;
        else
          c2.wall = waNone;
      }
      if (G.shmup_on && isWatery(c2)) shmup_destroyBoats(c2);
    }
  }

  if (m === moGreaterShark) for (let i = 0; i < ct.type; i++) {
    const c3 = ct.move(i);
    if (c3 && c3.wall === waBoat)
      makeflame(c3, 5, false);
  }

  // lancers pierce our friends :(
  if (m === moLancer) {
    // printf("lancer stab?\n");
    for (let i = 0; i < ct.type; i++) {
      const c3 = ct.move(i); if (!c3) continue;
      if (!logical_adjacent(cf, m, c3)) {
        if (canAttack(ct, moLancer, c3, c3.monst, AF_LANCE | AF_GETPLAYER)) {
          attackMonster(c3, AF_LANCE | AF_MSG | AF_GETPLAYER, m);
        }
        // this looks the same as effect graphically as exploding right away,
        // except that it does not kill the lancer
        if (c3.wall === waExplosiveBarrel) {
          c3.wall = waFireTrap; c3.wparam = 2;
        }
      }
    }
  }

  if (m === moWitchFire) makeflame(cf, 10, false);
  if (m === moFireElemental) { makeflame(cf, 20, false); if (cf.wparam < 20) cf.wparam = 20; }

  check_beauty(ct, cf, m);

  if (!cellEdgeUnstable(ct)) {
    if (isMetalBeast(m)) ct.stuntime += 2;
    if (m === moTortoise) ct.stuntime += 3;
    if (m === moWorldTurtle) ct.stuntime += 3;
    if (m === moDraugr && ct.land !== laBurial && ct.land !== laHalloween) ct.stuntime += 2;
    if (m === moBrownBug && snakelevel(ct) < snakelevel(cf)) ct.stuntime += 2;
    if (m === moBrownBug && snakelevel(ct) < snakelevel(cf) - 1) ct.stuntime += 2;
    if (m === moBrownBug && isWatery(ct) && !isWatery(cf)) ct.stuntime += 2;
  }

  if (isWitch(m) && ct.item === itOrbLife && passable(cf, null!, P_MIRROR)) {
    // note that Fire Witches don't pick up Orbs of Life,
    addMessage(XLAT('%The1 picks up %the2!', spM(moWitch), spI(ct.item)));
    cf.monst = moEvilGolem; ct.item = itNone;
  }
  else if (m === moWitch) {
    let pickup = false;
    if (ct.item === itOrbFlash) { pickup = true; m = moWitchFlash; }
    if (ct.item === itOrbWinter) { pickup = true; m = moWitchWinter; }
    if (ct.item === itOrbAether) { pickup = true; m = moWitchGhost; }
    if (ct.item === itOrbFire) { pickup = true; m = moWitchFire; }
    if (ct.item === itOrbSpeed) { pickup = true; m = moWitchSpeed; }
    if (ct.item === itOrbLife) { pickup = true; cf.monst = moEvilGolem; }
    if (pickup) {
      addMessage(XLAT('%The1 picks up %the2!', spM(moWitch), spI(ct.item)));
      ct.monst = m; ct.item = itNone;
      // speedwitches are stunned to prevent them from making a move
      // immediately
      if (m === moWitchSpeed) ct.stuntime = 1;
    }
  }

  if (m === moAirElemental) G.airmap.push([ct, 0]);
  if (m === moWolf && ct.land === laVolcano) ct.monst = moLavaWolf;
  if (m === moLavaWolf && isIcyLand(ct)) ct.monst = moWolfMoved;

  if (m === moPair) ct.stuntime++;

  if (inc === -3 && ct.monst === moReptile)
    ct.stuntime = 3;
  else if (inc === 2 && ct.monst === moReptile)
    ct.stuntime = 2;
  else if (inc === 3 && ct.monst === moReptile)
    ct.stuntime = 3;
  else if (inc === -3 && !survivesFall(ct.monst) && !passable(cf, ct, P_MONSTER)) {
    addMessage(XLAT('%The1 falls!', spM(ct.monst)));
    fallMonster(ct, AF_FALL);
    if (isBull(m) && cf.wall === waRed3)
      ct.wall = waRed1;
  }
  if (isThorny(ct.wall) && !survivesThorns(ct.monst)) {
    addMessage(XLAT('%The1 is killed by thorns!', spM(ct.monst)));
    playSound(ct, 'hit-rose');
    if (isBull(ct.monst)) ct.wall = waNone;
    fallMonster(ct, AF_CRUSH);
  }
  if (sword_at(ct) && canAttack(null!, moPlayer, ct, m, AF_SWORD_INTO)) {
    attackMonster(ct, AF_SWORD_INTO | AF_MSG, moPlayer);
    achievement_gain_once('GOSWORD');
  }

  if (ct.mpdist === 7 && cf.mpdist > 7) {
    playSeenSound(ct);
  }
}

export function cannotGo(m: eMonster, c: cell): boolean {
  if (m === moCrystalSage && (c.land !== laCocytus || c.LHU.heat > SAGEMELT || allPlayersInBoats()))
    return true;
  return false;
}

export function wantsToStay(m: eMonster): boolean {
  return m === moCrystalSage && allPlayersInBoats();
}

export function batsAfraid(c: cell): boolean {
  // bats
  for (let i = 0; i < isize(G.targets); i++)
    if (c === G.targets[i] || isNeighbor(c, G.targets[i])) {
      if (!G.targets[i].monst && G.invismove) continue;
      let enear = false;
      const ti = G.targets[i];
      for (let a = 0; a < ti.type; a++) {
        const c = ti.move(a); if (!c) continue;
        for (let b = 0; b < c.type; b++) {
          const c2 = c.move(b); if (!c2) continue;
          for (let e = 0; e < c2.type; e++) {
            const c3 = c2.move(e); if (!c3) continue;
            if (isActiveEnemy(c3, G.targets[i].monst) && c3.monst !== moBat &&
              passable_for(c3.monst, c2, c3, 0n) &&
              passable_for(c3.monst, c, c2, 0n)
            )
              enear = true;
          }
        }
      }
      if (!enear) return true;
    }
  return false;
}

/** int angledist(int t, int d1, int d2) */
export function angledist_n(t: number, d1: number, d2: number): number {
  let dd = d1 - d2;
  while (dd < 0) dd += t;
  while (dd > idiv(t, 2)) dd -= t;
  if (dd < 0) dd = -dd;
  return dd;
}

export function angledistButterfly(t: number, d1: number, d2: number, mirrored: boolean): number {
  let dd = d1 - d2;
  if (mirrored) dd = -dd;
  while (dd < 0) dd += t;
  return dd;
}

export function angledist(c: cell, d1: number, d2: number): number {
  return angledist_n(c.type, d1, d2);
}

export function anglestraight(c: cell, d1: number, d2: number): boolean {
  return angledist_n(c.type, d1, d2) >= idiv(c.type, 2);
}

export function bulldist(c: cell): number {
  let low = 0;
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (c2.cpdist < c.cpdist) low++; }
  return 8 * c.cpdist - low;
}

export function bulldistance(c: cell, d: cell): number {
  let low = 0;
  const cd = celldistance(c, d);
  for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; if (celldistance(c2, d) < cd) low++; }
  return 8 * cd - low;
}

export function landheattype(c: cell): number {
  if (isIcyLand(c)) return 0;
  if (c.land === laVolcano) return 2;
  return 1;
}

/** for the monster at c1, evaluation of the move to c2
 *  @param mf what moves are allowed
 */
export function moveval(c1: cell, c2: cell, d: number, mf: flagtype): number {
  if (!c2) return -5000;

  const m = c1.monst;

  // Angry Beasts can only go forward
  if (m === moRagingBull && c1.mondir !== NODIR && !anglestraight(c1, c1.mondir, d)) return -1700;

  // never move against a rose
  if (againstRose(c1, c2) && !ignoresSmell(m)) return -1600;

  // worms cannot attack if they cannot move
  if (isWorm(m) && !passable_for(c1.monst, c2, c1, P_MONSTER)) return -1700;

  if (canAttack(c1, m, c2, c2.monst, AF_GETPLAYER | mf) && !(mf & MF_NOATTACKS)) {
    if (m === moRagingBull && c1.mondir !== NODIR) return -1700;
    if (mf & MF_MOUNT) {
      if (c2 === G.dragon_target) return 3000;
      else if (isFriendlyOrBug(c2)) return 500;
      else return 2000;
    }
    if (isPlayerOn(c2)) return G.peace_on ? -1700 : 2500;
    else if (isFriendlyOrBug(c2)) return G.peace_on ? -1600 : 2000;
    else return 500;
  }

  if (!passable_for(c1.monst, c2, c1, 0n))
    return (
      // never move into a wall
      (passable_for(c1.monst, c2, c1, P_DEADLY)) ? -1300 :
      -1700); // move impossible

  if (slowMover(m) && nogoSlow(c2, c1)) return -1300;

  if (isPlayerOn(c2)) return -1700; // probably shielded

  if ((mf & MF_MOUNT) && c2 === G.dragon_target) return 3000;

  // crystal sages would die out of Cocytus
  if (cannotGo(m, c2)) return -600;

  // Rose Beauties keep to the Rose Garden
  if (m === moRoseBeauty && c2.land !== laRose) return -600;

  if (wantsToStay(m)) return 750;

  if ((m === moRatling || m === moRatlingAvenger) && G.lastmovetype === lmSkip && !G.items[itFatigue]) return 650;

  if (m === moLancer) {
    let lancerok = true;
    for (let i = 0; i < c2.type; i++) {
      const c3 = c2.move(i); if (!c3) continue;
      if (c1 !== c3 && !logical_adjacent(c1, m, c3))
        if (canAttack(c2, moLancer, c3, c3.monst, AF_LANCE | AF_ONLY_ENEMY))
          lancerok = false;
    }
    if (!lancerok) return 750;
  }

  let hunt = true;

  if (m === moLavaWolf) {
    // prefers to keep to volcano
    const clht = landheattype(c1);
    const dlht = landheattype(c2);
    if (dlht > clht) return 1510;
    if (dlht < clht) return 700;
    // will not hunt the player if these rules do not allow it
    let onlava = false;
    for (const c of G.targets) {
      if (landheattype(c) >= clht) onlava = true;
      for (let i = 0; i < c.type; i++) { const cc = c.move(i); if (!cc) continue; if (landheattype(cc) >= clht) onlava = true; }
    }
    if (!onlava) hunt = false;
  }

  if (m === moWolf) {
    let val = 1500;
    if (c2.land === laVolcano) return 1510;
    if (heat_absheat(c2) <= heat_absheat(c1))
      return 900;
    for (let i = 0; i < c1.type; i++) {
      const c3 = c1.move(i);
      if (heat_absheat(c3) > heat_absheat(c2))
        val--;
    }
    return val;
  }

  if ((mf & MF_MOUNT) && G.dragon_target)
    return 1500 + celldistance(c1, G.dragon_target) - celldistance(c2, G.dragon_target);

  // Goblins avoid getting near the Sword
  if (m === moGoblin && sword_isnear(c2)) return 790;
  if (m === moBat && batsAfraid(c2)) return 790;

  if (m === moButterfly)
    return 1500 + angledistButterfly(c1.type, c1.mondir, d, c1.monmirror !== 0);

  if (m === moRagingBull && c1.mondir !== NODIR)
    return 1500 - bulldist(c2);

  // actually they just run away
  if (m === moHunterChanging && c2.pathdist > c1.pathdist) return 1600;

  if ((mf & MF_PATHDIST) && !G.pathlock) printf('using MF_PATHDIST without path\n');

  let bonus = 0;
  if (m === moBrownBug && snakelevel(c2) < snakelevel(c1)) bonus = -10;

  if (hunt && (mf & MF_PATHDIST) && c2.pathdist < c1.pathdist && !G.peace_on) return 1500 + bonus + (c1.pathdist - c2.pathdist); // good move

  // prefer straight direction when wandering
  let dd = angledist(c1, c1.mondir, d);

  // goblins blocked by anglophobia prefer to move around than to stay
  if (m === moGoblin) {
    let swn = false;
    for (let i = 0; i < c1.type; i++) { const c3 = c1.move(i); if (!c3) continue; if (sword_isnear(c3)) swn = true; }
    if (swn) dd += 210;
  }

  return 800 + dd;
}

// stay value
export function stayval(c: cell, _mf: flagtype): number {
  if (isShark(c.monst) && !isWatery(c))
    return 525;
  if (againstRose(c, null!) && !ignoresSmell(c.monst)) return -1500;
  if (!passable_for(c.monst, c, null!, P_MONSTER | P_MIRROR))
    return 525;
  if (cellEdgeUnstable(c))
    return -1500;
  if (isRatling(c.monst) && G.lastmovetype !== lmSkip)
    return 700;
  // Goblins avoid staying near the Sword (if there is no choice, movement is preferred)
  if (c.monst === moGoblin && sword_isnear(c)) return 780;
  // Vikings move in a roughly straight line even if they cannot detect you
  if (c.monst === moViking && c.wall === waBoat)
    return 750;
  // in peaceful, all monsters are wandering
  if (G.peace_on && c.monst !== moTortoise) return 750;
  if (isWorm(c.monst)) return 550;
  if (c.monst === moRagingBull) return -1690; // worse than to stay in place
  if (c.monst === moBat && batsAfraid(c)) return 575;
  if (c.monst === moHunterGuard) return 1600; // prefers to stay in place
  // Lava Wolves will wander if not hunting
  if (c.monst === moLavaWolf) return 750;
  return 1000;
}

/** shpos.resize(SHSIZE) */
function shpos_resize(): void {
  while (G.shpos.length < SHSIZE) G.shpos.push(new Array<cell>(MAXPLAYER).fill(null!));
  G.shpos.length = SHSIZE;
}

export function totalbulldistance(c: cell, k: number): number {
  shpos_resize();
  let tbd = 0;
  for (const p of player_indices()) {
    const c2 = G.shpos[(G.cshpos + SHSIZE - k - 1) % SHSIZE][p];
    if (c2) tbd += bulldistance(c, c2);
  }
  return tbd;
}

export function determinizeBull(c: cell, posdir: number[]): void {
  // determinize the Angry Beast movement:
  // use the previous PC's positions as the tiebreaker
  let nc = isize(posdir);
  for (let k = 0; k < SHSIZE && nc > 1; k++) {
    const pts: number[] = new Array<number>(nc).fill(0);
    for (let d = 0; d < nc; d++) pts[d] = totalbulldistance(c.cmove(posdir[d]), k);

    let bestpts = 1000;
    for (let d = 0; d < nc; d++) if (pts[d] < bestpts) bestpts = pts[d];
    let nc0 = 0;
    for (let d = 0; d < nc; d++) if (pts[d] === bestpts) posdir[nc0++] = posdir[d];
    nc = nc0;
  }
  posdir.length = nc;
}

export function determinizeBullPush(bull_: cellwalker): number {
  const bull = bull_.clone();
  const dirs: number[] = [0, 0];
  bull.addStep();
  const c2 = bull.at;
  if (!(c2.type & 1)) return 1; // irrelevant
  const d = idiv(c2.type, 2);
  bull.add(d); const positive = bull.spin; dirs[0] = positive;
  bull.sub(2 * d); dirs[1] = bull.spin;
  determinizeBull(c2, dirs);
  if (dirs[0] === positive) return -1;
  return 1;
}

let global_posdir: number[] = [];

export function pickMoveDirection(c: cell, mf: flagtype): number {
  let bestval = stayval(c, mf);
  global_posdir = [-1];

  // printf("stayval [%p, %s]: %d\n", c, dnameof(c->monst), bestval);
  for (let d = 0; d < c.type; d++) {
    const c2 = c.move(d);
    const val = moveval(c, c2, d, mf);
    // printf("[%d] %p: val=%5d pass=%d\n", d, c2, val, passable(c2,c,0));
    if (val > bestval) { global_posdir.length = 0; bestval = val; }
    if (val === bestval) global_posdir.push(d);
  }

  if (c.monst === moDonkey && isize(global_posdir) > 1)
    return -1;

  if (c.monst === moRagingBull)
    determinizeBull(c, global_posdir);

  return hrand_elt(global_posdir, -1);
}

export function pickDownDirection(c: cell, _mf: flagtype): number {
  const downs: number[] = [];
  let bestdif = -100;
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i); if (!c2) continue;
    if (gravityLevelDiff(c2, c) < 0 && passable_for(c.monst, c2, c, P_MIRROR) &&
      !isPlayerOn(c2)) {
      let cdif = i - c.mondir;
      if (cdif < 0) cdif += c.type;
      if (cdif > idiv(c.type, 2)) cdif = cdif - c.type;
      if (cdif < 0) cdif = -2 * cdif + 1; else cdif = 2 * cdif;
      // printf("i=%d md=%d dif=%d\n", i, c->mondir, cdif);
      if (c2.wall === waClosePlate || c.wall === waClosePlate)
        cdif += 20;
      if (cdif > bestdif) { bestdif = cdif; downs.length = 0; }
      if (cdif === bestdif) downs.push(i);
    }
  }
  return hrand_elt(downs, -1);
}

// Angry Beast attack
// note: this is done both before and after movement
export function beastAttack(c: cell, player: boolean, targetdir: boolean): void {
  if (c.mondir === NODIR) return;
  for (let d = 0; d < c.type; d++) {
    const c2 = c.move(d); if (!c2) continue;
    const opposite = targetdir ? (d === c.mondir) : anglestraight(c, d, c.mondir);
    let flags = AF_BULL;
    if (player) flags |= AF_GETPLAYER;
    if (!opposite) flags |= AF_ONLY_FBUG;
    if (canAttack(c, moRagingBull, c2, c2.monst, flags)) {
      attackMonster(c2, flags | AF_MSG, moRagingBull);
      if (c2.monst && c2.stuntime) {
        const bull = new cellwalker(c, d);
        const subdir = determinizeBullPush(bull);
        const mi = determinePush(bull, subdir, (mi: movei) => passable(mi.t, c2, P_BLOW) && !isPlayerOn(mi.t));
        if (mi.proper())
          pushMonster(mi);
      }
    }
    if (c2.wall === waThumperOff) {
      playSound(c2, 'click');
      c2.wall = waThumperOn;
      c2.wparam = 100;
    }
    if (c2.wall === waExplosiveBarrel) {
      playSound(c2, 'click');
      explodeBarrel(c2);
    }
    if (c2.wall === waThumperOn) {
      const bull = new cellwalker(c, d);
      const subdir = determinizeBullPush(bull);
      const mi = determinePush(bull, subdir, (mi: movei) => canPushThumperOn(mi, c));
      if (mi.proper())
        pushThumper(mi);
    }
  }
}

export function moveNormal(c: cell, mf: flagtype): cell {
  const m = c.monst;
  if (isPowerMonster(m) && !playerInPower()) return null!;

  let d: number;

  if (c.stuntime) {
    if (cellEdgeUnstable(c, MF_STUNNED)) { d = pickDownDirection(c, mf); global_posdir = [d]; }
    else return null!;
  }
  else {
    // Angry Beasts attack all neighbors first
    if (m === moRagingBull) beastAttack(c, true, false);
    d = pickMoveDirection(c, mf);
  }
  if (d === -1) {
    stayEffect(c);
    return c;
  }

  if (!G.quantum) {
    const mi = movei.sd(c, d);
    const c2 = mi.t;
    if (isPlayerOn(c2)) {
      if (m === moCrusher) {
        addMessage(XLAT('%The1 raises his weapon...', spM(m)));
        G.crush_next.push(c2);
        c.stuntime = 7;
        return c2;
      }
      killThePlayerAt(m, c2, 0n);
      return c2;
    }

    const m2 = c2.monst;

    if (m2 && m === moCrusher) {
      addMessage(XLAT('%The1 raises his weapon...', spM(m)));
      G.crush_next.push(c2);
      c.stuntime = 7;
      return c2;
    }
    else if (m2) {
      attackMonster(c2, AF_NORMAL | AF_MSG, m);
      animateCorrectAttack(mi, LAYER_SMALL, m);
      if (m === moFlailer && m2 === moIllusion)
        attackMonster(c, 0n, m2);
      return c2;
    }

    moveMonster(mi);
    if (m === moRagingBull) beastAttack(c2, false, false);
    return c2;
  }
  else {
    let attacking = false;
    for (const dir of global_posdir) {
      const c2 = c.move(dir);

      if (isPlayerOn(c2)) {
        killThePlayerAt(m, c2, 0n);
        attacking = true;
      }

      else {
        const m2 = c2.monst;
        if (m2) {
          attackMonster(c2, AF_NORMAL | AF_MSG, m);
          if (m === moFlailer && m2 === moIllusion)
            attackMonster(c, 0n, m2);
          attacking = true;
        }
      }
    }

    if (!attacking) for (const dir of global_posdir) {
      const mi = movei.sd(c, dir);
      if (!c.monst) c.monst = m;
      moveMonster(mi);
      if (m === moRagingBull) beastAttack(mi.t, false, false);
    }
    return c.move(d);
  }
}

export function mountmove(mi: movei, fp: boolean): void {
  for (let i = 0; i < numplayers(); i++) {
    if (playerpos(i) === mi.s) {
      animateMovement(mi, LAYER_SMALL);
      if (G.multi_players > 1) {
        G.multi_player[i].at = mi.t;
        G.multi_player[i].spin = mi.rev_dir_force();
        G.multi_flipped[i] = fp;
      }
      else {
        G.cwt.at = mi.t;
        G.cwt.spin = mi.rev_dir_force();
        G.flipplayer = fp;
      }
      afterplayermoved();
    }
    if (G.lastmountpos[i] === mi.s && mi.s) {
      G.lastmountpos[i] = mi.t;
    }
    else if (G.lastmountpos[i] === mi.t) {
      G.lastmountpos[i] = null!;
    }
  }
}

export function moveWorm(c: cell): void {

  const mounted = isMounted(c);

  if (c.monst === moWormwait) { c.monst = moWorm; return; }
  else if (c.monst === moTentaclewait) { c.monst = moTentacle; return; }
  else if (c.monst === moTentacleEscaping) {
    // explodeAround(c);
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i); if (!c2) continue;
      if (canAttack(c, c.monst, c2, c2.monst, mounted ? AF_ONLY_ENEMY : (AF_GETPLAYER | AF_ONLY_FBUG))) {
        attackMonster(c2, AF_NORMAL | AF_MSG | AF_GETPLAYER, c.monst);
      }
    }
    let c2 = c;
    const allcells: cell[] = [];
    while (c2.mondir !== NODIR) {
      allcells.push(c2);
      c2 = c2.move(c2.mondir);
      if (!c2) { allcells.pop(); break; }
    }
    allcells.push(c2);
    for (let i = isize(allcells) - 2; i >= 0; i--) {
      const cmt = allcells[i + 1];
      const cft = allcells[i];
      const mi = moveimon(cft);
      if (cft.monst !== moTentacleGhost && cmt.monst !== moTentacleGhost)
        mountmove(mi, false);
      animateMovement(mi, LAYER_BIG);
    }
    c.monst = moNone;
    if (c.mondir !== NODIR) c.move(c.mondir).monst = moTentacleEscaping;
    return;
  }
  else if (c.monst !== moWorm && c.monst !== moTentacle) return;

  const m = c.monst;
  const id = m - moWorm;

  let mf = MF_PATHDIST | AF_EAT;

  if (mounted) mf ^= (MF_MOUNT | MF_PATHDIST);

  // without this, in 3D geometries, Sandworms explode because no land around them is generated yet
  for (let i = 0; i < c.type; i++) { const c2 = c.cmove(i); setdist(c2, 8, c); }

  let dir = pickMoveDirection(c, mf);

  if (c.wall === waRose) {
    addMessage(XLAT('%The1 eats %the2!', spM(c.monst), spW(c.wall)));
    c.wall = waNone;
    dir = -1;
  }

  if (dir === -1) {
    let spices = 0;
    if (id) {
      addMessage(XLAT('Cthulhu withdraws his tentacle!'));
      G.kills[moTentacle]++;
      c.monst = moTentacleEscaping;
      moveWorm(c);
    }
    else {
      G.kills[moWorm]++;
      spices = 3;
    }
    const loc = treasureType(c.land);
    let spiceSeen = false;
    let cc = c;
    while (cc && (cc.monst === moWorm || cc.monst === moWormtail || cc.monst === moTentacle || cc.monst === moTentacletail)) {
      // if(!id)
      explodeAround(cc);
      drawParticles(cc, minf[cc.monst].color, 16);
      if (spices > 0 && cc.land === laDesert) {
        if (notDippingForExtra(itSpice, loc)) {
          cc.item = itSpice;
          if (cc.cpdist <= 6) spiceSeen = true;
        }
        spices--;
      }
      cc.monst = moNone;
      if (cc.mondir !== NODIR) cc = cc.move(cc.mondir);
    }
    if (!id) {
      if (spiceSeen)
        addMessage(XLAT('The sandworm explodes in a cloud of Spice!'));
      else
        addMessage(XLAT('The sandworm explodes!'));
      playSound(null!, 'explosion');
      achievement_gain_once('ZEBRAWORM', specgeom_zebra());
    }
    return;
  }

  const mi = movei.sd(c, dir);
  const goal = mi.t;

  if (isPlayerOn(goal) || goal.monst)
    attackMonster(goal, AF_EAT | AF_MSG | AF_GETPLAYER, c.monst);

  if (1) {
    goal.monst = moWormwait + id;
    moveEffect(mi, moWormwait + id);

    animateMovement(mi, LAYER_BIG);
    c.monst = moWormtail + id;
    goal.mondir = mi.rev_dir_or(NODIR);
    goal.monmirror = c.monmirror ^ (c.c.mirror(dir) ? 1 : 0);
    goal.stuntime = 0;
    setdist(goal, 6, null!);

    mountmove(mi, true);

    if (id) {
      let c2 = c, c3 = c2;
      while (c2.monst === moTentacletail || c2.monst === moTentacleGhost) {
        const mim = moveimon(c2).rev();
        if (!mim.proper()) return;
        c3 = c2; c2 = mim.s;
        if (c3.monst !== moTentacleGhost && c2.monst !== moTentacleGhost)
          mountmove(mim, true);
        animateMovement(mim, LAYER_BIG);
      }
    }

    let c2 = c, c3 = c2;
    for (let a = 0; a < WORMLENGTH; a++) {
      if (c2.monst === moWormtail) {
        const mim = moveimon(c2).rev();
        if (!mim.proper()) {
          drawParticles(c2, (linf[c2.land].color & 0xF0F0F0), 16);
          return;
        }
        c3 = c2; c2 = mim.s;
        mountmove(mim, true);
        animateMovement(mim, LAYER_BIG);
      }
    }

    if (c2.monst === moWormtail) { c2.monst = moNone; c3.mondir = NODIR; }
  }

}

export function ivynext(c: cell): void {
  const cw = new cellwalker(c, c.mondir, c.monmirror !== 0);

  // check the mirroring status
  let c2 = c;
  while (true) {
    if (c2.monst === moIvyRoot) break;
    if (!proper(c2, c2.mondir))
      return; /* incorrect data */
    if (!isIvy(c2.monst)) break;
    if (c2.c.mirror(c2.mondir)) cw.mirrored = !cw.mirrored;
    c2 = c2.move(c2.mondir);
  }

  cw.at.monst = moIvyWait;
  let findleaf = false;
  while (true) {
    cw.add(1);
    if (cw.spin === cw.at.mondir) {
      if (findleaf) {
        cw.at.monst = moIvyHead; break;
      }
      cw.at.monst = moIvyWait;
      cw.addStep();
      continue;
    }
    cw.addStep();
    if (cw.at.monst === moIvyWait && cw.at.mondir === cw.spin) {
      cw.at.monst = moIvyBranch;
      findleaf = true; continue;
    }
    cw.addStep();
  }
}

// this removes Ivy, but also potentially causes Vines to grow
export function removeIvy(c: cell): void {
  let m = c.monst;
  c.monst = moNone; // NEWYEARFIX
  for (let i = 0; i < c.type; i++)
    // note that semi-vines don't count
    if (c.move(i) && c.move(i).wall === waVinePlant) {
      destroyHalfvine(c);
      if (!do_not_touch_this_wall(c))
        c.wall = waVinePlant;
    }
  if (c.wall !== waVinePlant) {
    if (m === moIvyDead)
      m = moIvyWait;
    drawParticles(c, minf[m].color, 2);
  }
}

export function moveivy(): void {
  if (isize(G.ivies) === 0) return;
  if (G.racing_on) return;
  const pdo = new pathdata(moIvyRoot);
  try {
    for (let i = 0; i < isize(G.ivies); i++) {
      let c = G.ivies[i];
      const co = c;
      if (c.monst !== moIvyHead) continue;
      ivynext(c);

      let pd = c.pathdist;

      let mi = new movei(null!, null!, NODIR);

      while (c.monst !== moIvyRoot) {
        if (!isIvy(c.monst)) {
          raiseBuggyGeneration(c, "that's not an Ivy!");
          break;
        }
        if (c.mondir === NODIR) {
          raiseBuggyGeneration(c, 'wrong mondir!');
          break;
        }

        for (let j = 0; j < c.type; j++) {
          const c2 = c.move(j); if (!c2) continue;
          if (canAttack(c, c.monst, c2, c2.monst, AF_ONLY_FRIEND | AF_GETPLAYER)) {
            if (isPlayerOn(c2))
              killThePlayerAt(c.monst, c2, 0n);
            else {
              if (attackJustStuns(c2, 0n, c.monst))
                addMessage(XLAT('The ivy attacks %the1!', spM(c2.monst)));
              else if (isNonliving(c2.monst))
                addMessage(XLAT('The ivy destroys %the1!', spM(c2.monst)));
              else
                addMessage(XLAT('The ivy kills %the1!', spM(c2.monst)));
              attackMonster(c2, AF_NORMAL, c.monst);
            }
            continue;
          }
          if (c2 && c2.pathdist < pd && ivy_passable(c2, c)) {
            mi = movei.sd(c, j); pd = c2.pathdist;
          }
        }
        c = c.move(c.mondir);
      }

      const mto = mi.t;

      if (mto && mto.cpdist) {
        animateMovement(mi, LAYER_BIG);
        mto.monst = moIvyWait; mto.mondir = mi.rev_dir_or(NODIR); mto.stuntime = 0;
        mto.monmirror = mi.s.monmirror ^ (mi.mirror() ? 1 : 0);
        moveEffect(mi, moIvyWait);
        // if this is the only branch, we want to move the head immediately to mto instead
        if (mi.s.monst === moIvyHead) {
          mto.monst = moIvyHead; co.monst = moIvyBranch;
        }
      }
      else if (!proper(co, co.mondir) || !co.move(co.mondir)) { /* should not happen */ }
      else if (co.move(co.mondir).monst !== moIvyRoot) {
        // shrink useless branches, but do not remove them completely (at the root)
        if (co.monst === moIvyHead) co.move(co.mondir).monst = moIvyHead;
        removeIvy(co);
      }
    }
  } finally { pdo.destroy(); }
}

const gendfs: cell[] = [];

let targetcount = 0;

export function isTargetOrAdjacent(c: cell): boolean {
  for (let i = 0; i < targetcount; i++)
    if (gendfs[i] === c || isNeighbor(gendfs[i], c))
      return true;
  return false;
}

export function groupmove2(mi: movei, movtype: eMonster, mf: flagtype): void {
  const c = mi.s;
  const from = mi.t; // note: we are moving from 'c' to 'from'!'
  if (!c) return;

  if (c.pathdist === 0) return;

  if (movtype === moKrakenH && isTargetOrAdjacent(from)) { /* nothing */ }
  /*  else if(passable_for(movtype, from, c, P_ONPLAYER | P_CHAIN | P_MONSTER)) ;
  else if(canAttack(c, movtype, from, from->monst, AF_GETPLAYER)) ; */
  else if (from.wall === waThumperOn) { /* nothing */ }
  else if (passable_for(movtype, from, c, P_CHAIN | P_MONSTER)) { /* nothing */ }
  else if (canAttack(c, movtype, from, from.monst, AF_GETPLAYER | AF_NOSHIELD)) { /* nothing */ }
  else if (isMagneticPole(movtype)) {
    // a special case here -- we have to ignore the illegality of
    // the 'second' move due to an adjacent opposite pole
    for (let d = 0; d < c.type; d++) {
      const c2 = c.move(d); if (!c2) continue;
      if (c2.monst === movtype) {
        const c3 = c2.move(c2.mondir);
        const m2 = c3.monst;
        c3.monst = moNone;
        const ok =
          passable_for(movtype, from, c, P_CHAIN | P_MONSTER)
          && passable_for(movtype, c, c2, P_CHAIN | P_MONSTER);
        c3.monst = m2;
        if (ok) groupmove2(movei.sd(c, d).rev(), movtype, mf);
      }
    }
  }
  else return;

  if (from.monst) {
    if (mf & MF_MOUNT) {
      // don't go through friends
      if (isFriendlyOrBug(from)) return;
    }
    else {
      // go through the player (even mounted)
      if (isPlayerOn(from)) { /* nothing */ }
      // go through the mounted dragon
      else if (isDragon(from.monst) && isFriendlyOrBug(from)) { /* nothing */ }
      // but not through other worms
      else if (isWorm(from)) return;
      // go through other friends
      else if (isFriendlyOrBug(from)) { /* nothing */ }
      else return;
    }
  }

  // Kraken movement
  if (movtype === moKrakenH && c.monst === moKrakenT && c.stuntime === 0)
    kraken_trymove(c);

  if (movegroup(c.monst) === movtype) {

    let af = AF_ONLY_FBUG | AF_GETPLAYER;
    if (mf & MF_MOUNT) af = 0n;

    if (!passable_for(movtype, from, c, P_ONPLAYER | P_MONSTER)) return;
    if (!ignoresSmell(c.monst) && againstRose(c, from)) return;
    if ((mf & MF_ONLYEAGLE) && c.monst !== moEagle && c.monst !== moBat)
      return;
    if ((mf & MF_ONLYEAGLE) && bird_disruption(c) && markOrb(itOrbGravity)) return;
    // in the gravity lands, eagles cannot ascend in their second move
    if ((mf & MF_ONLYEAGLE) && gravityLevelDiff(c, from) < 0) {
      onpath_mark(c);
      return;
    }
    if ((mf & MF_NOFRIEND) && isFriendly(c)) return;
    if ((mf & MF_MOUNT) && !isMounted(c)) return;
    if (isRatling(c.monst) && G.lastmovetype === lmSkip) return;

    if (c.stuntime) return;
    if (c.monst === moBat && batsAfraid(from)) return;

    // note: move from 'c' to 'from'!
    if (!(mf & MF_NOATTACKS)) for (let j = 0; j < c.type; j++)
      if (c.move(j) && canAttack(c, c.monst, c.move(j), c.move(j).monst, af)) {
        attackMonster(c.move(j), AF_NORMAL | AF_GETPLAYER | AF_MSG, c.monst);
        animateCorrectAttack(movei.sd(c, j), LAYER_SMALL, c.monst);
        onpath_mark(c);
        // XLATC eagle
        return;
      }

    if (from.cpdist === 0 || from.monst) { onpath_mark(c); return; }

    if (movtype === moDragonHead) {
      dragon_move(mi);
      return;
    }

    moveMonster(mi);

    onpath_mark(from);

    if (isDie(mi.t.monst)) {
      /* other dice will not pathfind through the original cell */
      /* this makes it easier for the player to roll dice correctly */
      onpath_mark(c);
      return;
    }
  }
  onpath_mark(c);
  // MAXGCELL
  if (isize(gendfs) < 1000 || c.cpdist <= 6) gendfs.push(c);
}

export function groupmove(movtype: eMonster, mf: flagtype): void {
  const pd = pathdata.i(0);
  try {
    gendfs.length = 0;

    if (mf & MF_MOUNT) {
      if (G.dragon_target) gendfs.push(G.dragon_target);
      if (movtype === moDragonHead) {
        for (let i = 0; i < isize(G.dcal); i++) {
          const c = (i === 0 && G.dragon_target) ? G.dragon_target : G.dcal[i];
          if (!c.monst) continue;
          if (isFriendlyOrBug(c)) continue;
          for (let d = 0; d < c.type; d++) {
            const c2 = c.move(d); if (!c2) continue;
            if (c2.monst && isMounted(c2)) {
              groupmove2(movei.sd(c, d).rev(), movtype, mf);
            }
          }
        }
      }
    }
    else {
      if (!G.peace_on) for (let i = 0; i < isize(G.targets); i++) gendfs.push(G.targets[i]);

      if (G.invisfish && (movtype === moSlime || movtype === moShark || movtype === moKrakenH))
        for (const pc of player_positions())
          gendfs.push(pc);
    }

    targetcount = isize(gendfs);

    for (let i = 0; i < isize(gendfs); i++) {
      const c = gendfs[i];
      if (!in_line_of_sight(c)) continue;

      const dirtable: number[] = [];

      for (let t = 0; t < c.type; t++) dirtable.push(t);
      hrandom_shuffle(dirtable);

      for (const t of dirtable) {
        groupmove2(movei.sd(c, t).rev(), movtype, mf);
      }

      if (movtype === moEagle && c.monst === moNone && !isPlayerOn(c) && !bird_disruption(c)) {
        const jdata = new jumpdata();
        const c2 = whirlwind_jumpFromWhereTo(c, false, jdata);
        groupmove2(new movei(c2, c, STRONGWIND), movtype, mf);
      }

      if (frog_power(movtype) && c.monst === moNone && !isPlayerOn(c)) {
        for (let a = 0; a < c.type; a++) {
          const c2 = c.move(a); if (!c2) continue;
          for (let b = 0; b < c2.type; b++) {
            const c3 = c2.move(b); if (!c3) continue;
            groupmove2(new movei(c3, c, JUMP), movtype, mf);
          }
        }
      }
    }

    if (movtype !== moDragonHead) for (let i = 0; i < isize(G.dcal); i++) {
      const c = G.dcal[i];
      if ((mf & MF_ONLYEAGLE) && c.monst !== moEagle && c.monst !== moBat) return;
      if (movegroup(c.monst) === movtype && c.pathdist !== 0) {
        const c2 = moveNormal(c, mf);
        if (c2) onpath_mark(c2);
      }
    }
  } finally { pd.destroy(); }
}

// Hex monsters

const hexdfs: cell[] = [];

export function moveHexSnake(mi: movei, _mounted: boolean): void {
  // note: move from 'c' to 'from'!
  const from = mi.t;
  const c = mi.s;
  setdist(from, 6, null!);
  if (from.wall === waBoat) from.wall = waSea;
  moveEffect(mi, c.monst);
  from.monst = c.monst; from.mondir = mi.rev_dir_or(NODIR); from.hitpoints = c.hitpoints;
  from.stuntime = 0;
  c.monst = moHexSnakeTail;
  preventbarriers(from);

  animateMovement(mi, LAYER_BIG);
  mountmove(mi, true);

  let c2 = c, c3 = c2;
  for (let a = 0; ; a++) if (c2.monst === moHexSnakeTail) {
    if (a === ROCKSNAKELENGTH) { c2.monst = moNone; c3.mondir = NODIR; break; }
    const mim = moveimon(c2).rev();
    if (!mim.proper()) break;
    mountmove(mim, true);
    animateMovement(mim, LAYER_BIG);
    c3 = c2; c2 = mim.s;
  }
  else break;
}

export function snakeAttack(c: cell, mounted: boolean): void {
  for (let j = 0; j < c.type; j++)
    if (c.move(j) && canAttack(c, moHexSnake, c.move(j), c.move(j).monst,
      mounted ? AF_ONLY_ENEMY : (AF_ONLY_FBUG | AF_GETPLAYER))) {
      const m2 = c.move(j).monst;
      attackMonster(c.move(j), AF_NORMAL | AF_GETPLAYER | AF_MSG, moHexSnake);
      spread_plague(c, c.move(j), j, moHexSnake);
      produceGhost(c.move(j), moHexSnake, m2);
    }
}

export function goodmount(c: cell, mounted: boolean): boolean {
  if (mounted) return isMounted(c);
  else return !isMounted(c);
}

export function inpair(c: cell, colorpair: number): number {
  return (colorpair >> pattern_threecolor(c)) & 1;
}

export function snake_pair(c: cell): number {
  if (c.mondir === NODIR)
    return (1 << pattern_threecolor(c));
  else
    return (1 << pattern_threecolor(c)) | (1 << pattern_threecolor(c.move(c.mondir)));
}

// note: move from 'c' to 'from'!
export function hexvisit(c: cell, from: cell, d: number, mounted: boolean, colorpair: number): void {
  if (!c) return;
  if (cellUnstable(c) || cellEdgeUnstable(c)) return;
  if (c.pathdist === 0) return;

  if (cellUnstableOrChasm(c) || cellUnstableOrChasm(from)) return;

  /* if(c->monst == moHexSnake)
    printf("%p:%p %s %d\n", from, c, dnameof(from->monst), passable(from, c, true, false, false)); */

  if (from.cpdist && (!passable(from, c, P_MONSTER | P_WIND | P_FISH))) return;

  if (c.monst === moHexSnake && snake_pair(c) === colorpair) {
    // printf("got snake\n");

    if (!inpair(from, colorpair)) return;
    if (!goodmount(c, mounted)) return;

    if (canAttack(c, moHexSnake, from, from.monst, AF_EAT | (mounted ? AF_ONLY_ENEMY : AF_ONLY_FBUG | AF_GETPLAYER))) {
      attackMonster(from, AF_MSG | AF_EAT | AF_GETPLAYER, c.monst);
    }

    if (from.cpdist === 0 || from.monst) return;

    snakeAttack(c, mounted);
    moveHexSnake(movei.sd(from, d).rev(), mounted);
  }

  onpath_mark(c);

  // MAXGCELL
  if (isize(hexdfs) < 2000 || c.cpdist <= 6)
    hexdfs.push(c);
}

export function movehex(mounted: boolean, colorpair: number): void {
  const pd = pathdata.i(3);
  try {
    hexdfs.length = 0;

    if (mounted) {
      if (G.dragon_target && G.dragon_target.monst !== moHexSnake) {
        hexdfs.push(G.dragon_target);
        onpath_mark(G.dragon_target);
      }
    }
    else for (const c of G.targets) {
      hexdfs.push(c);
      onpath_mark(c);
    }
    //hexdfs.push_back(cwt.at);

    for (let i = 0; i < isize(hexdfs); i++) {
      const c = hexdfs[i];
      const dirtable: number[] = [];
      for (let t = 0; t < c.type; t++) if (c.move(t) && inpair(c.move(t), colorpair))
        dirtable.push(t);

      hrandom_shuffle(dirtable);
      for (const t of dirtable) {
        hexvisit(c.move(t), c, t, mounted, colorpair);
      }
    }
  } finally { pd.destroy(); }
}

export function movehex_rest(mounted: boolean): void {
  const pd = pathdata.i(4);
  try {
    for (let i = 0; i < isize(G.hexsnakes); i++) {
      const c = G.hexsnakes[i];
      let colorpair: number;
      if (c.monst === moHexSnake) {
        colorpair = snake_pair(c);
        if (!goodmount(c, mounted)) continue;
        const dirtable = hrandom_permutation(c.type);
        for (let u = 0; u < c.type; u++) {
          createMov(c, dirtable[u]);
          if (inpair(c.move(dirtable[u]), colorpair))
            hexvisit(c, c.move(dirtable[u]), c.c.spin(dirtable[u]), mounted, colorpair);
        }
      }
      if (c.monst === moHexSnake) {
        snakeAttack(c, mounted);
        G.kills[moHexSnake]++;
        playSound(c, 'die-troll');
        let c2 = c;
        while (c2.monst === moHexSnakeTail || c2.monst === moHexSnake) {
          if (c2.monst !== moHexSnake && c2.mondir !== NODIR)
            snakepile(c2, moHexSnake);
          snakepile(c2, moHexSnake);
          c2.monst = moNone;
          if (c2.mondir === NODIR) break;
          c2 = c2.move(c2.mondir);
        }
      }
    }
  } finally { pd.destroy(); }
}

export function movemutant(): void {
  const mcells = new manual_celllister();
  try {
    for (const c of G.currentmap.allcells()) mcells.add(c);
    if (!closed_or_bounded())
      for (let i = 0; i < isize(mcells.lst); i++) {
        const c = mcells.lst[i];
        if (c.land === laClearing && c.monst !== moMutant && !pseudohept(c))
          for (let a = 0; a < c.type; a++) {
            const c2 = c.move(a); if (!c2) continue;
            for (let b = 0; b < c2.type; b++) {
              const c3 = c2.move(b); if (!c3) continue;
              if (celldistAlt(c3) < celldistAlt(c))
                mcells.add(c3);
            }
          }
      }

    const young: cell[] = [];
    for (const c of mcells.lst)
      if (c.monst === moMutant && c.stuntime === G.mutantphase)
        young.push(c);

    for (let j = 1; j < isize(young); j++) {
      const k = hrand(j + 1);
      const t = young[j]; young[j] = young[k]; young[k] = t;
    }

    G.mutantphase++;
    G.mutantphase &= 15;

    for (let i = 0; i < isize(young); i++) {
      const c = young[i];
      for (let j = 0; j < c.type; j++) {
        const mi = movei.sd(c, j);
        const c2 = mi.t;
        if (!c2) continue;

        if (c2.monst !== moMutant && canAttack(c, moMutant, c2, c2.monst, AF_ONLY_FBUG | AF_GETPLAYER)) {
          attackMonster(c2, AF_NORMAL | AF_MSG | AF_GETPLAYER, moMutant);
          continue;
        }

        if (isPlayerOn(c2)) continue;

        if ((c2.land === laOvergrown || !pseudohept(c2)) && ivy_passable(c2, c)) {
          if (c2.land === laClearing && !closed_or_bounded() && c2.mpdist > 7) continue;
          c2.monst = moMutant;
          c2.mondir = c.c.spin(j);
          c2.stuntime = G.mutantphase;
          animateMovement(mi, LAYER_BIG);
        }
      }
    }
  } finally { mcells.destroy(); }
}

/** #define SHSIZE 16 */
export const SHSIZE = 16;

export function clearshadow(): void {
  shpos_resize();
  for (let i = 0; i < SHSIZE; i++) for (let p = 0; p < MAXPLAYER; p++)
    G.shpos[i][p] = null!;
}

/** \brief kill the shadow by clearing its history -- c is provided for multiplayer */
export function kill_shadow_at(c: cell): void {
  for (let p = 0; p < MAXPLAYER; p++)
    if (G.shpos[G.cshpos][p] === c)
      for (let i = 0; i < SHSIZE; i++)
        changes.value_set(G.shpos[i], p, null!);
}

export function moveshadow(): void {

  let shfrom: cell = null!;

  shpos_resize();
  for (const p of player_indices()) {
    const c = G.shpos[G.cshpos][p];
    if (c && c.monst === moShadow) {
      for (let j = 0; j < c.type; j++)
        if (c.move(j) && canAttack(c, moShadow, c.move(j), c.move(j).monst, AF_ONLY_FBUG | AF_GETPLAYER))
          attackMonster(c.move(j), AF_NORMAL | AF_MSG | AF_GETPLAYER, c.monst);
      c.monst = moNone;
      shfrom = c;
    }
    G.shpos[G.cshpos][p] = playerpos(p);
  }
  G.cshpos = (G.cshpos + 1) % SHSIZE;
  for (const p of player_indices()) {
    const where = G.shpos[G.cshpos][p];
    if (where && where.monst === moNone && where.cpdist && among(where.land, laGraveyard, laCursed)) {
      if (sword_at(where)) {
        kill_shadow_at(where);
        fightmessage(moShadow, moPlayer, false, AF_SWORD_INTO);
        continue;
      }
      if (shfrom) animateMovement(match(shfrom, where), LAYER_SMALL);
      where.monst = moShadow;
      where.hitpoints = p;
      where.stuntime = 0;
      // the Shadow sets off the mines and stuff
      moveEffect(new movei(where, where, NODIR), moShadow);
      // Beauty kills the Shadow
      check_beauty(where, where, moShadow);
    }
  }
}

export function moveghosts(): void {

  if (G.invismove) return;
  movesofgood.length = 0;

  for (let i = 0; i < isize(G.ghosts); i++) {
    const c = G.ghosts[i];

    if (c.stuntime) continue;
    if (isPowerMonster(c) && !playerInPower()) continue;

    if (isGhostMover(c.monst)) {
      let goodmoves = 0;

      for (let k = 0; k < c.type; k++) if (c.move(k) && c.move(k).cpdist < c.cpdist)
        if (ghostmove(c.monst, c.move(k), c, 0n) && !isPlayerOn(c.move(k)))
          goodmoves++;

      movesofgood_grow(goodmoves).push(c);
    }
  }

  for (const v of movesofgood) for (const c of v) {

    if (c.stuntime) continue;
    if (isPowerMonster(c) && !playerInPower()) continue;

    nextghost: if (isGhostMover(c.monst) && c.cpdist >= 1) {

      const mdir: number[] = [];

      for (const p of [0, 1]) for (let j = 0; j < c.type; j++) if (p === 1 || (c.move(j) && isPlayerOn(c.move(j))))
        if (c.move(j) && canAttack(c, c.monst, c.move(j), c.move(j).monst, AF_GETPLAYER | AF_ONLY_FBUG)) {
          // XLATC ghost/greater shark

          attackMonster(c.move(j), AF_NORMAL | AF_MSG | AF_GETPLAYER, c.monst);
          break nextghost;
        }

      for (let k = 0; k < c.type; k++) if (c.move(k) && c.move(k).cpdist < c.cpdist)
        if (ghostmove(c.monst, c.move(k), c, 0n))
          mdir.push(k);
      if (mdir.length === 0) continue;
      const d = hrand_elt(mdir);
      const c2 = c.move(d);
      if (c2.monst === moTortoise && c2.stuntime > 1) {
        addMessage(XLAT('%The1 scares %the2 a bit!', spM(c.monst), spM(c2.monst)));
        c2.stuntime = 1;
      }
      else moveMonster(movei.sd(c, d));

    }
  }
}

/** for an ally m at c, evaluate staying in place */
export function stayvalue(_m: eMonster, c: cell): number {
  if (!passable_for(c.monst, c, null!, P_MONSTER | P_MIRROR))
    return -1501;
  if (cellEdgeUnstable(c))
    return -1501;
  if (againstRose(c, null!) && !ignoresSmell(c.monst)) return -1500;
  return 100;
}

/** for an ally m at c, evaluate moving to c2 */
export function movevalue(m: eMonster, c: cell, dir: number, flags: flagtype): number {

  const mi = movei.sd(c, dir);
  const c2 = mi.t;
  let val = 0;

  if (isPlayerOn(c2)) val = -3000;
  else if (againstRose(c, c2) && !ignoresSmell(m)) return -1200;
  else if (m === moPrincess && c2.stuntime && hasPrincessWeapon(c2.monst) &&
    !cellDangerous(c) && !cellDangerous(c2) && canAttack(c, m, c2, c2.monst, AF_IGNORE_UNARMED | flags)) {
    val = 15000;
  }
  else if (canAttack(c, m, c2, c2.monst, flags))
    val =
      (!passable_for(c.monst, c, null!, P_MONSTER | P_MIRROR)) ? 100 :
      (m === moPrincessArmed && isPrincess(c2.monst)) ? 14000 : // jealousy!
      isActiveEnemy(c2, m) ? 12000 :
      among(c2.monst, moSkeleton, moMetalBeast, moReptile, moTortoise, moSalamander, moTerraWarrior, moBrownBug) ? -400 :
      isIvy(c2) ? 8000 :
      isInactiveEnemy(c2, m) ? 1000 :
      -500;

  else if (passable_for(m, c2, c, 0n)) {
    // CAP_COMPLEX2
    if (mine_marked_mine(c2) && !ignoresPlates(m))
      val = 50;
    else
      val = 4000;

    const tk = tkills();
    changes.init(true);
    moveMonster(mi);
    const tk2 = tkills();
    const b = monstersnear(mi.t, m);
    changes.rollback();
    if (b) val = 50;
    else if (tk2 > tk) val += 1000 + 200 * (tk2 - tk);
  }
  else if (passable_for(m, c2, c, P_DEADLY)) return -1100;
  else return -1750;

  if (c.monst === moGolem) {
    val -= c2.pathdist;
  }
  else if (c.monst === moFriendlyGhost)
    val += c2.cpdist - 40;
  else if (c.monst === moMouse) {
    let d: number;
    if (!euclid() && (c2.land !== laPalace || !c2.master.alt)) d = 200;
    else d = celldistAlt(c2);
    // first rule: suicide if the Princess is killed,
    // by monstersnear or jumping into a chasm
    const i = princess_getPrisonInfo(c);
    if (i && !i.princess) {
      if (val === 50 || c2.wall === waChasm) val = 20000;
    }
    // second rule: move randomly if the Princess is saved
    if (i && i.bestdist > 6) { /* nothing */ }
    // third rule: do not get too far from the Princess
    else if (d > 150)
      val -= (700 + d);
    // fourth rule: do not get too far from the Rogue
    // NOTE: since Mouse is not a target, we can use
    // the full pathfinding here instead of cpdist!
    else if (c2.pathdist > 3 && c2.pathdist <= 19)
      val -= (500 + c2.pathdist * 10);
    else if (c2.pathdist > 19)
      val -= (700);
    // fifth rule: get close to the Princess, to point the way
    else
      val -= (250 + d);
    /*
    // avoid stepping on trapdoors and plates
    // (REMOVED BECAUSE MICE NO LONGER ACTIVATE TRAPDOORS AND PLATES)
    */
  }
  if (isPrincess(c.monst)) {

    const d = c2.pathdist;
    if (d <= 3) val -= d;
    else val -= 10 * d;

    // the Princess also avoids stepping on pressure plates
    if (c2.wall === waClosePlate || c2.wall === waOpenPlate || c2.wall === waTrapdoor)
      val -= 5;
  }
  if (c.monst === moTameBomberbird) {
    let d = c2.pathdist;
    if (d === 1 && c.pathdist > 1) d = 5;
    if (d === 2 && c.pathdist > 2) d = 4;
    val -= d;
  }
  if (c.monst === moKnight && (eubinary() || c2.master.alt)) {
    val -= celldistAlt(c2);
    // don't go to external towers
    if (c2.wall === waTower && c2.wparam === 1 && !c2.monst)
      return 60;
  }
  return val;
}

export function movegolems(flags: flagtype): void {
  if (G.items[itOrbEmpathy] && G.items[itOrbSlaying])
    flags |= AF_CRUSH;
  let qg = 0;
  for (let i = 0; i < isize(G.golems); i++) {
    const c = G.golems[i];
    let m = c.monst;
    const pd = new pathdata(m, false);
    try {
      if (c.stuntime) continue;
      if (m === moGolem || m === moKnight || m === moTameBomberbird || m === moPrincess ||
        m === moPrincessArmed || m === moMouse || m === moFriendlyGhost) {
        if (m === moGolem) qg++;
        if (m === moFriendlyGhost) markOrb(itOrbUndeath);

        const recorduse = G.orbused.slice();

        // DEBB(debug_turn, ("stayval"));
        let bestv = stayvalue(m, c);
        const bdirs: number[] = [];

        // DEBB(debug_turn, ("moveval"));
        for (let k = 0; k < c.type; k++) if (c.move(k)) {
          const val = movevalue(m, c, k, flags);

          if (val > bestv) { bestv = val; bdirs.length = 0; }
          if (val === bestv) bdirs.push(k);
        }

        if (m === moTameBomberbird) {
          const c2 = whirlwind_jumpDestination(c);
          if (c2 && !c2.monst) {
            const val = movevalue(m, c, STRONGWIND, flags);
            // printf("val = %d bestv = %d\n",
            if (val > bestv) { bestv = val; bdirs.length = 0; }
            if (val === bestv) bdirs.push(STRONGWIND);
          }
        }

        // orbused = recorduse (array<bool, ittypes>: copied in place)
        for (let k = 0; k < recorduse.length; k++) G.orbused[k] = recorduse[k];

        //    printf("stayvalue = %d, result = %d, bq = %d\n", stayvalue(m,c), bestv, bq);

        if (bdirs.length === 0) continue;
        const dir = hrand_elt(bdirs);
        const mi = movei.sd(c, dir);
        const c2 = mi.t;
        if (c2.monst) {
          const revenge = (m === moPrincess);
          const jealous = (isPrincess(c.monst) && isPrincess(c2.monst));
          const m2 = c2.monst;
          if (revenge) {
            playSound(c2, princessgender() ? 'dzia-princess' : 'dzia-prince');
            addMessage(XLAT('%The1 takes %his1 revenge on %the2!', spM(m), spM(c2.monst)));
          }
          if (revenge || jealous) flags |= AF_CRUSH;
          else if ((flags & AF_CRUSH) && !canAttack(c, m, c2, c2.monst, flags ^ AF_CRUSH ^ AF_MUSTKILL)) {
            markOrb(itOrbEmpathy); markOrb(itOrbSlaying);
          }
          attackMonster(c2, flags | AF_MSG, m);
          animateCorrectAttack(movei.sd(c, dir), LAYER_SMALL, m);
          spread_plague(c, c2, dir, m);
          produceGhost(c2, m2, m);
          sideAttack(c, dir, m, 0);
          if (revenge) { c.monst = m = moPrincessArmed; }
          if (jealous) {
            playSound(c2, princessgender() ? 'dzia-princess' : 'dzia-prince');
            addMessage('"That should teach you to take me seriously!"');
          }
        }
        else {
          passable_for(m, c2, c, P_DEADLY);
          // DEBB(debug_turn, ("move"));
          moveMonster(mi);
          if (m !== moTameBomberbird && m !== moFriendlyGhost)
            moveBoatIfUsingOne(mi);

          if (c2.monst === m) {
            if (m === moGolem) c2.monst = moGolemMoved;
            if (m === moMouse) c2.monst = moMouseMoved;
            if (m === moPrincess) c2.monst = moPrincessMoved;
            if (m === moPrincessArmed) c2.monst = moPrincessArmedMoved;
            if (m === moTameBomberbird) c2.monst = moTameBomberbirdMoved;
            if (m === moKnight) c2.monst = moKnightMoved;
            if (m === moFriendlyGhost) c2.stuntime = 1;
          }

          empathyMove(mi);
        }
        // DEBB(debug_turn, ("other"));
      }
    } finally { pd.destroy(); }
  }
  achievement_count('GOLEM', qg, 0);
}

/** note: butterflies don't use moveNormal for two reasons:
 *  1) to make sure that they move AFTER bulls
 *  2) to make sure that they move offscreen
 */
export function moveButterflies(): void {
  let j = 0;
  for (let i = 0; i < isize(G.butterflies); i++) {
    const c = G.butterflies[i][0];
    if (c.monst === moButterfly) {
      /* // don't move if under attack of a bull ... */
      const c2 = moveNormal(c, 0n);
      if (G.butterflies[i][1] < 50 && c2)
        G.butterflies[j++] = [c2, G.butterflies[i][1] + 1];
    }
  }
  G.butterflies.length = j;
}

// assume pathdist
export function specialMoves(): void {
  for (let i = 0; i < isize(G.dcal); i++) {
    const c = G.dcal[i];

    if (c.stuntime) continue;

    let m = c.monst;

    if (m === moHunterGuard && G.items[itHunting] >= 10)
      c.monst = moHunterChanging;

    if ((G.havewhat & HF_FAILED_AMBUSH) && hyperbolic() && !quotient()) {
      if (m === moHunterDog)
        c.monst = moHunterChanging;
      for (let k = 0; k < c.type; k++) {
        const c2 = c.move(k); if (!c2) continue;
        if (c2.monst === moHunterDog)
          c2.monst = moHunterChanging;
      }
    }

    if (m === moSleepBull && !G.peace_on) {
      let wakeup = false;
      for (let k = 0; k < c.type; k++) {
        const c2 = c.move(k); if (!c2) continue;
        if (c2.monst === moGadfly) {
          addMessage(XLAT('%The1 wakes up %the2.', spM(c2.monst), spM(m)));
          wakeup = true;
        }
      }
      for (let i = 0; i < isize(G.targets); i++) {
        const t = G.targets[i];
        if (celldistance(c, t) <= 2) wakeup = true;
      }
      if (wakeup) {
        playSound(null!, 'bull');
        c.monst = m = moRagingBull;
        c.mondir = NODIR;
      }
    }

    if (m === moNecromancer) {
      const pd = new pathdata(moNecromancer);
      try {
        let gravenum = 0, zombienum = 0;
        const gtab: cell[] = [], ztab: cell[] = [];
        for (let j = 0; j < c.type; j++) if (c.move(j)) {
          if (c.move(j).wall === waFreshGrave) gtab[gravenum++] = c.move(j);
          if (passable(c.move(j), c, 0n) && c.move(j).pathdist < c.pathdist)
            ztab[zombienum++] = c.move(j);
        }
        if (gravenum && zombienum) {
          const gr = gtab[hrand(gravenum)];
          gr.wall = waAncientGrave;
          gr.monst = moGhost;
          gr.stuntime = 1;
          ztab[hrand(zombienum)].monst = moZombie;
          ztab[hrand(zombienum)].stuntime = 1;
          addMessage(XLAT('%The1 raises some undead!', spM(m)));
          playSound(c, 'necromancy');
        }
      } finally { pd.destroy(); }
    }

    else if (m === moOutlaw) {
      for (const c1 of gun_targets(c))
        if (canAttack(c, moOutlaw, c1, c1.monst, AF_GETPLAYER | AF_ONLY_FBUG | AF_GUN)) {
          attackMonster(c1, AF_GETPLAYER | AF_ONLY_FBUG | AF_GUN, moOutlaw);
          c.stuntime = 1;
          break;
        }
    }

    else if (m === moWitchFlash && flashWouldKill(c, AF_GETPLAYER | AF_ONLY_FBUG) && !flashWouldKill(c, 0n)) {
      addMessage(XLAT('%The1 activates her Flash spell!', spM(m)));
      m = moWitch;
      activateFlashFrom(c, moWitchFlash, AF_MAGIC | AF_GETPLAYER | AF_MSG);
      c.stuntime = 1;
    }

    else if (m === moCrystalSage && c.cpdist <= 4 && isIcyLand(G.cwt.at) && G.cwt.at.wall !== waBoat) {
      // only one sage attacks
      if (sagefresh) {
        sagefresh = false;
        if (G.sagephase === 0) {
          addMessage(XLAT('%The1 shows you two fingers.', spM(m)));
          addMessage(XLAT('You wonder what does it mean?'));
        }
        else if (G.sagephase === 1) {
          addMessage(XLAT('%The1 shows you a finger.', spM(m)));
          addMessage(XLAT('You think about possible meanings.'));
        }
        else {
          addMessage(XLAT('%The1 moves his finger downwards.', spM(m)));
          addMessage(XLAT('Your brain is steaming.'));
        }
        G.sagephase++;
        for (let i = 0; i < isize(G.targets); i++) {
          const t = G.targets[i];
          if (celldistance(c, t) > 4) continue;
          sageheat(t, .0);
          for (let i = 0; i < t.type; i++)
            sageheat(t.move(i), .3);
        }
      }
      c.stuntime = 1;
    }

    else if (m === moPyroCultist && !G.peace_on && in_line_of_sight(c)) {
      let shot = false;
      let dont_approach = false;
      // smaller range on the sphere
      const firerange = (sphere() || getDistLimit() < 5) ? 2 : 4;
      for (let i = 0; i < isize(G.targets); i++) {
        const t = G.targets[i];
        if (celldistance(c, t) <= firerange && makeflame(t, 20, true)) {
          if (isPlayerOn(t))
            addMessage(XLAT('%The1 throws fire at you!', spM(m)));
          else
            addMessage(XLAT('%The1 throws fire at %the2!', spM(m), spM(t.monst)));
          makeflame(t, 20, false);
          playSound(t, 'fire');
          c.monst = moCultist;
          shot = true;
        }
        if (celldistance(c, t) <= 3 && !sphere()) dont_approach = true;
      }
      if (shot || dont_approach) c.stuntime = 1;
    }

    else if (m === moHexer && c.item && (classflag(c.item) & IF_CURSE) && !G.peace_on && in_line_of_sight(c)) {
      // bool dont_approach = false;
      // smaller range on the sphere
      const firerange = (sphere() || getDistLimit() < 5) ? 2 : 4;

      let dont_approach = false;
      for (let i = 0; i < isize(G.targets); i++) {
        const t = G.targets[i];

        if (isPlayerOn(t)) {
          const d = celldistance(c, t);
          if (d <= firerange) {
            addMessage(XLAT('%The1 curses you with %the2!', spM(m), spI(c.item)));
            playSound(t, 'fire');
            animate_item_throw(c, t, c.item);
            G.items[c.item] += orbcharges(c.item);
            c.item = itNone;
            c.stuntime = 1;
          }
          if (d === firerange + 1) dont_approach = true;
        }
      }

      if (dont_approach) c.stuntime = 1;
    }

    else if (m === moVampire) {
      for (let i = 0; i < isize(G.targets); i++) {
        const t = G.targets[i];
        if (celldistance(c, t) <= 2) {
          let msg = false;
          for (let i = 0; i < ittypes; i++)
            if (itemclass(i) === IC_ORB && G.items[i] && G.items[itOrbTime] && !G.orbused[i]) {
              G.orbused[i] = true;
              msg = true;
            }
          if (msg) addMessage(XLAT('%The1 drains your powers!', spM(m)));
          c.stuntime = 1;
        }
      }
    }
  }
}

export function moveworms(): void {
  if (!isize(G.worms)) return;
  const pd = new pathdata(moWorm);
  try {
    const wrm = isize(G.worms);
    for (let i = 0; i < wrm; i++) {
      moveWorm(G.worms[i]);
    }
  } finally { pd.destroy(); }
}

export function refreshFriend(c: cell): void {
  if (c.monst === moGolemMoved) c.monst = moGolem;
  if (c.monst === moMouseMoved) c.monst = moMouse;
  if (c.monst === moPrincessMoved) c.monst = moPrincess;
  if (c.monst === moPrincessArmedMoved) c.monst = moPrincessArmed;
  if (c.monst === moKnightMoved) c.monst = moKnight;
  if (c.monst === moTameBomberbirdMoved) c.monst = moTameBomberbird;
}

export function consMove(c: cell, param: eMonster): void {
  const m = c.monst;

  if (movegroup(m) !== moYeti) return;

  if (m === moWitchSpeed) G.havewhat |= HF_FAST;
  const slow = slowMover(m);
  if (slow) G.havewhat |= HF_SLOW;

  if (param === moYeti && slow) return;
  if (param === moTortoise && !slow) return;
  if (param === moWitchSpeed && m !== moWitchSpeed) return;

  if (isActiveEnemy(c, moPlayer)) {
    let goodmoves = 0;
    for (let t = 0; t < c.type; t++) {
      const c2 = c.move(t);
      if (c2 && c2.pathdist < c.pathdist)
        goodmoves++;
    }
    movesofgood_grow(goodmoves).push(c);
  }
  else
    movesofgood_grow(0).push(c);
}

export function moveNormals(param: eMonster): void {
  const pd = new pathdata(param);
  try {
    movesofgood.length = 0;

    for (let i = 0; i < isize(G.pathqm); i++)
      consMove(G.pathqm[i], param);

    const dcs = isize(G.dcal);
    for (let i = 0; i < dcs; i++) {
      const c = G.dcal[i];
      if (c.pathdist === PINFD) consMove(c, param);
    }

    for (const v of movesofgood) for (const c of v) {
      if (minf[c.monst].mgroup === moYeti) {
        moveNormal(c, MF_PATHDIST);
      }
    }
  } finally { pd.destroy(); }
}

export function movehex_all(): void {
  for (const i of sortedKeys(G.snaketypes)) {
    movehex(false, i);
    if (!G.shmup_on && haveMount()) movehex(true, i);
  }
  movehex_rest(false);
  movehex_rest(true);
}

export function movemonsters(): void {
  // CAP_COMPLEX2
  G.ambush_distance = 0;

  // DEBB(debug_turn, ("lava1"));
  orboflava(1);

  // CAP_COMPLEX2
  ambush_check_state();

  sagefresh = true;
  G.turncount++;

  specialMoves();

  // DEBB(debug_turn, ("jumpers"));
  if (G.havewhat & HF_JUMP) {
    groupmove(moFrog, 0n);
    groupmove(moVaulter, 0n);
    groupmove(moPhaser, 0n);
  }

  // DEBB(debug_turn, ("ghosts"));
  moveghosts();

  // DEBB(debug_turn, ("butterflies"));
  moveButterflies();

  // DEBB(debug_turn, ("normal"));
  moveNormals(moYeti);

  // DEBB(debug_turn, ("slow"));
  if (G.havewhat & HF_SLOW) moveNormals(moTortoise);

  if (sagefresh) G.sagephase = 0;

  // DEBB(debug_turn, ("ivy"));
  moveivy();
  // DEBB(debug_turn, ("slimes"));
  groupmove(moSlime, 0n);
  // DEBB(debug_turn, ("sharks"));
  if (G.havewhat & HF_SHARK) groupmove(moShark, 0n);
  // DEBB(debug_turn, ("eagles"));
  if (G.havewhat & HF_BIRD) groupmove(moEagle, 0n);
  if (G.havewhat & HF_EAGLES) groupmove(moEagle, MF_NOATTACKS | MF_ONLYEAGLE);
  // DEBB(debug_turn, ("eagles"));
  if (G.havewhat & HF_REPTILE) groupmove(moReptile, 0n);
  // DEBB(debug_turn, ("air"));
  if (G.havewhat & HF_AIR) {
    G.airmap.length = 0;
    groupmove(moAirElemental, 0n);
    buildAirmap();
  }
  // DEBB(debug_turn, ("earth"));
  if (G.havewhat & HF_EARTH) groupmove(moEarthElemental, 0n);
  // DEBB(debug_turn, ("water"));
  if (G.havewhat & HF_WATER) groupmove(moWaterElemental, 0n);
  // DEBB(debug_turn, ("void"));
  if (G.havewhat & HF_VOID) groupmove(moVoidBeast, 0n);
  // DEBB(debug_turn, ("leader"));
  if (G.havewhat & HF_LEADER) groupmove(moPirate, 0n);
  // DEBB(debug_turn, ("mutant"));
  if ((G.havewhat & HF_MUTANT) || (closed_or_bounded() && among(G.specialland, laOvergrown, laClearing))) movemutant();
  // DEBB(debug_turn, ("bugs"));
  if (G.havewhat & HF_BUG) hive_movebugs();
  // DEBB(debug_turn, ("whirlpool"));
  if (G.havewhat & HF_WHIRLPOOL) whirlpool_move();
  // DEBB(debug_turn, ("whirlwind"));
  if (G.havewhat & HF_WHIRLWIND) whirlwind_move();
  // CAP_COMPLEX2
  // DEBB(debug_turn, ("westwall"));
  if (G.havewhat & HF_WESTWALL) westwall_move();
  for (const pc of player_positions())
    if (pc.item === itOrbSafety)
      return;
  // DEBB(debug_turn, ("river"));
  if (G.havewhat & HF_RIVER) prairie_move();
  /* DEBB(debug_turn, ("magnet"));
  if(havewhat & HF_MAGNET)
    groupmove(moSouthPole, 0),
    groupmove(moNorthPole, 0); */
  // DEBB(debug_turn, ("bugs"));
  if (G.havewhat & HF_HEXD) groupmove(moHexDemon, 0n);
  if (G.havewhat & HF_DICE) groupmove(moAnimatedDie, 0n);
  if (G.havewhat & HF_ALT) groupmove(moAltDemon, 0n);
  if (G.havewhat & HF_MONK) groupmove(moMonk, 0n);

  // DEBB(debug_turn, ("worm"));
  const savepos: cell[] = [];

  for (let i = 0; i < numplayers(); i++)
    savepos[i] = playerpos(i);

  moveworms();
  if (G.havewhat & HF_HEX)
    movehex_all();

  if (G.havewhat & HF_KRAKEN) { kraken_attacks(); groupmove(moKrakenH, 0n); }
  if (G.havewhat & HF_DRAGON) groupmove(moDragonHead, MF_NOFRIEND);
  if (haveMount()) groupmove(moDragonHead, MF_MOUNT);

  // DEBB(debug_turn, ("golems"));
  movegolems(0n);

  // DEBB(debug_turn, ("fresh"));
  moverefresh();

  // DEBB(debug_turn, ("lava2"));
  orboflava(2);

  // DEBB(debug_turn, ("shadow"));
  moveshadow();

  // DEBB(debug_turn, ("wandering"));
  wandering();

  // DEBB(debug_turn, ("rosemap"));
  if (G.havewhat & HF_ROSE) buildRosemap();

  for (let i = 0; i < numplayers(); i++)
    if (savepos[i] !== playerpos(i)) {
      bfs(); break;
    }
}

export function nogoSlow(to: cell, from: cell): boolean {
  if (cellEdgeUnstable(to) && gravityLevelDiff(to, from) >= 0) return true;
  if (cellUnstable(to)) return true;
  return false;
}

export function beastcrash(c: cell, beast: cell): void {
  if (c.wall === waPetrified || c.wall === waDeadTroll || c.wall === waDeadTroll2 ||
    c.wall === waGargoyle) {
    addMessage(XLAT('%The1 crashes into %the2!', spM(beast.monst), spW(c.wall)));
    c.wall = waNone;
  }
  else if (c.wall === waDeadwall || c.wall === waCavewall || c.wall === waSandstone ||
    c.wall === waVinePlant || c.wall === waIcewall ||
    c.wall === waMirror || c.wall === waCloud || c.wall === waBigTree || c.wall ===
    waSmallTree || c.wall === waGlass || c.wall === waClosedGate || c.wall === waStone || c.wall === waRuinWall) {
    addMessage(XLAT('%The1 crashes into %the2!', spM(beast.monst), spW(c.wall)));
    c.wall = waNone;
  }
  else if (cellHalfvine(c)) {
    addMessage(XLAT('%The1 crashes into %the2!', spM(beast.monst), spW(c.wall)));
    destroyHalfvine(c);
  }
  else if (c.wall === waThumperOff) {
    addMessage(XLAT('%The1 crashes into %the2!', spM(beast.monst), spW(c.wall)));
    c.wall = waThumperOn;
    c.wparam = 100;
  }
  else if (c.wall === waExplosiveBarrel) {
    addMessage(XLAT('%The1 crashes into %the2!', spM(beast.monst), spW(c.wall)));
    explodeBarrel(c);
  }
  else if (realred(c)) {
    addMessage(XLAT('%The1 crashes into %the2!', spM(beast.monst), spW(c.wall)));
    if (c.wall === waRed1) c.wall = waNone;
    else if (c.wall === waRed2) c.wall = waRed1;
    else if (c.wall === waRed3) c.wall = waRed2;
  }
  else if (isBull(c.monst) || isSwitch(c.monst)) {
    addMessage(XLAT('%The1 crashes into %the2!', spM(beast.monst), spM(c.monst)));
    if (c.monst === moSleepBull) { c.monst = moRagingBull; c.stuntime = 3; }
  }
}

export function stayEffect(c: cell): void {
  const m = c.monst;
  if (m === moAirElemental) G.airmap.push([c, 0]);
  if (m === moRagingBull && c.mondir !== NODIR) {
    playSound(null!, 'hit-axe' + pick123());
    for (let d = 0; d < c.type; d++) {
      const c2 = c.move(d); if (!c2) continue;
      const opposite = anglestraight(c, d, c.mondir);
      if (opposite) beastcrash(c2, c);
    }
    c.mondir = NODIR; c.stuntime = 3;
  }
}

export function realstuntime(c: cell): number {
  if (isMutantIvy(c)) return (c.stuntime - G.mutantphase) & 15;
  return c.stuntime;
}
