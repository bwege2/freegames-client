// environment.cpp of HyperRogue 13.1o: game environment, routines related to the game that affect all the map.
// Monsters to move are detected here, but their moves are implemented in monstermove.cpp. Package P6.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// struct pathdata: `new pathdata(m, include_allies)` = pathdata(eMonster, bool); `pathdata.i(n)` = pathdata(int);
// the destructor is destroy(), call it in a finally block.
// enum class los: los_none, los_geodesic, los_geometric. current_fov[c] (an inserting read in C++; the inserted
// zeros are never iterated) is read with get() ?? 0.
import { achievement_gain_once } from './achievement.ts';
import { drawParticles } from './animations.ts';
import { attackMonster, canAttack, fallMonster, reset_spill } from './attack.ts';
import { addMessage } from './basegraph.ts';
import { getHauntedDepth } from './bigstuff.ts';
import { celldistAlt, celldistance, getDistLimit, neighborId } from './cell.ts';
import { printf } from './cfile.ts';
import { checkmove } from './checkmove.ts';
import { sphere, WDIM } from './classes.ts';
import {
  ca_simulate, dragon_totalhp, elec_act, elec_checklightningfast, heat_processfires, heat_processheat, kraken_kill,
  livecaves, mirror_breakAll, mirror_reflect, prairie_no_worms,
} from './complex.ts';
import { terracotta_check } from './complex2.ts';
import {
  type eMonster, IC_TREASURE, itAmethyst, itBabyTortoise, itBarrow, itBombEgg, itBrownian, itDragon, itIvory,
  itLotus, itMutant, itMutant2, itNone, itOrbAether, itOrbDash, itOrbDomination, itOrbEmpathy, itOrbFish,
  itOrbFreedom, itOrbFrog, itOrbIllusion, itOrbInvis, itOrbLava, itOrbPhasing, itOrbSafety, itOrbSpeed, itTrollEgg,
  itWest, laClearing, laHive, laMinefield, laMirror, laMotion, laMountain, laPrairie, laTemple, laTrollheim,
  laWestWall, laWet, laWhirlpool, laWhirlwind, moAirElemental, moAltDemon, moAngryDie, moAnimatedDie, moBat,
  moBomberbird, moButterfly, moCrusher, moCShark, moDeadBird, moDragonHead, moDragonTail, moEagle, moEarthElemental,
  moFriendlyGhost, moFrog, moGhost, moGolem, moGreater, moGreaterM, moGreaterShark, moHexDemon, moHexSnake,
  moHexSnakeTail, moHunterDog, moIllusion, moIvyBranch, moIvyDead, moIvyHead, moIvyNext, moIvyRoot, moIvyWait,
  moJiangshi, moKnight, moKrakenH, moKrakenT, moLesser, moLesserM, moMonk, moMouse, moMutant, moNecromancer, moNone,
  moOutlaw, moPair, moPhaser, moPike, moPrincess, moPrincessArmed, moReptile, moRunDog, moRusalka, moSalamander,
  moShark, moSlime, moSlimeNextTurn, moTameBomberbird, moTentacle, moTentacleEscaping, moTentaclewait, moTortoise,
  moVaulter, moVineSpirit, moVoidBeast, moWaterElemental, moWitchSpeed, moWolf, moWolfMoved, moWorm, moWormtail,
  moWormwait, moZombie, waAncientGrave, waBarrowDig, waBigStatue, waBoat, waCharged, waChasm, waClosedGate, waCloud,
  waColumn, waExplosiveBarrel, waFreshGrave, waMagma, waMercury, waMirror, waMirrorWall, waNone, waOpenPlate,
  waPalace, waReptile, waReptileBridge, waRose, waRoundTable, waRuinWall, waSea, waShallow, waShrub, waSmallTree,
  waStone, waSulphur, waSulphurC, waThumperOff, waThumperOn, waTrunk, waVinePlant, waWaxWall, winf,
} from './content.ts';
import { idiv } from './cpp.ts';
import {
  cellHalfvine, cellUnstable, ignoresPlates, inmirror, isAlch, isAngryBird, isBug, isBull, isChasmy, isElectricLand,
  isFire, isFriendly, isGhostMover, isHaunted, isIvy, isLeader, isMagneticPole, isMounted, isMutantIvy, isNonliving,
  isPrincess, isReptile, isWall, isWarpedType, isWatery, isWateryOrBoat, isWorm, itemBurns, itemclass, snakelevel,
  survivesChasm, survivesFire, survivesPoison, survivesWall, survivesWater,
} from './flags.ts';
import { checkSwitch, normal_gravity_at, saved_tortoise_on } from './game.ts';
import { G } from './globals.ts';
import { pick12, pick123 } from './hprint.ts';
import {
  AF_CRUSH, AF_FALL, AF_FAST, AF_GETPLAYER, AF_MSG, among, Flag, hr_exception, INFD, isize, NotPorted, PINFD,
} from './hyper.ts';
import { collectItem } from './items.ts';
import { ls_any_chaos } from './landlock.ts';
import { spI, spM, spW, XLAT } from './language.ts';
import { cell, cellwalker, FALL, JUMP, movei, NODIR } from './locations.ts';
import {
  calcTidalPhase, cellEdgeUnstable, checkTide, destroyBoats, destroyHalfvine, doesFallSound, explodeBarrel, isWarped,
  makeflame, mayExplodeMine, nonAdjacent, thruVine, toggle_radius,
} from './mapeffects.ts';
import { getGhostcount, reptilemax } from './monstergen.ts';
import {
  addButterfly, ivynext, moveEffect, movegolems, movemonsters, moveNormals, nogoSlow, refreshFriend, removeIvy,
  snake_pair,
} from './monstermove.ts';
import { multi_playerActive } from './multi.ts';
import { checkFreedom, markEmpathy, markOrb, reduceOrbPowers } from './orbs.ts';
import {
  buildAirmap, ivy_passable, P_CHAIN, P_FLYING, P_ISFRIEND, P_IVY, P_MONSTER, P_USEBOAT, passable, placeWater,
} from './passable.ts';
import { pseudohept } from './pattern2.ts';
import {
  changes, fail_survivalist, isPlayerOn, numplayers, orbbull_check, player_positions, playerInPower,
} from './pcmove.ts';
import { hrand, hrand_elt } from './rand.ts';
import { shmup_dragonbreath } from './shmup.ts';
import { playSound } from './sound.ts';
import { yendor_onpath } from './yendor.ts';


export const HF_BUG = Flag(0);
export const HF_EARTH = Flag(1);
export const HF_BIRD = Flag(2);
export const HF_LEADER = Flag(3);
export const HF_HEX = Flag(4);
export const HF_WHIRLPOOL = Flag(5);
export const HF_WATER = Flag(6);
export const HF_AIR = Flag(7);
export const HF_MUTANT = Flag(8);
export const HF_OUTLAW = Flag(9);
export const HF_WHIRLWIND = Flag(10);
export const HF_ROSE = Flag(11);
export const HF_DRAGON = Flag(12);
export const HF_KRAKEN = Flag(13);
export const HF_SHARK = Flag(14);
export const HF_BATS = Flag(15);
export const HF_REPTILE = Flag(16);
export const HF_EAGLES = Flag(17);
export const HF_SLOW = Flag(18);
export const HF_FAST = Flag(19);
export const HF_WARP = Flag(20);
export const HF_MOUSE = Flag(21);
export const HF_RIVER = Flag(22);
export const HF_MIRROR = Flag(23);
export const HF_VOID = Flag(24);
export const HF_HUNTER = Flag(25);
export const HF_FAILED_AMBUSH = Flag(26);
export const HF_MAGNET = Flag(27);
export const HF_HEXD = Flag(28);
export const HF_ALT = Flag(29);
export const HF_MONK = Flag(30);
export const HF_WESTWALL = Flag(31);
export const HF_JUMP = Flag(32);
export const HF_DICE = Flag(33);

/** temporary changes during bfs */
const tempmonsters: [cell, eMonster][] = [];

export function gamerange(): number { return getDistLimit() + G.gamerange_bonus; }

// pathdist begin

/** The pathdata is used to keep a list of visited cells (see the comment in environment.cpp).
 *  The variable 'pathlock' ensures that we do not use two pathdata objects at once. */
export class pathdata {
  /** pathdata(eMonster m, bool include_allies IS(true)) */
  constructor(m: eMonster, include_allies = true, _int_ctor = false) {
    this.checklock();
    if (_int_ctor) return;
    // if(isize(pathq)) println(hlog, "! we got tiles on pathq: ", isize(pathq));
    computePathdist(m, include_allies);
  }
  /** pathdata(int i) */
  static i(_i: number): pathdata { return new pathdata(0, true, true); }
  checklock(): void {
    if (G.pd_from) { G.pd_from = null!; clear_pathdata(); }
    if (G.pathlock) printf('path error\n');
    G.pathlock++;
  }
  /** ~pathdata() */
  destroy(): void {
    G.pathlock--;
    clear_pathdata();
  }
}

/** using pathdata, record a cell (together with direction) as visited */
export function onpath_with_dir(cw: cellwalker, d: number): void {
  if (!G.pathlock) {
    // println(hlog, "onpath(", cw, ", ", d, ") without pathlock");
  }
  cw.at.pathdist = d;
  G.pathq.push(cw.clone());
}

/** using pathdata, record a cell as visited, with random direction */
export function onpath_random_dir(c: cell, d: number): void {
  // cellwalker(c, hrand(c->type), hrand(2)): the oracle's g++ evaluates the arguments right to left
  // (disassembly of hr::onpath_random_dir: hrand(2) is called first; NOTES.md)
  const b = hrand(2);
  const a = hrand(c.type);
  onpath_with_dir(new cellwalker(c, a, b !== 0), d);
}

export function onpath(c: cell, d: number): void {
  onpath_with_dir(new cellwalker(c, 0, false), d);
}

export function onpath_mark(c: cell): void {
  onpath_with_dir(new cellwalker(c, 0, false), 0);
}

export function clear_pathdata(): void {
  for (const c of G.pathq) c.at.pathdist = PINFD;
  G.pathq.length = 0;
  G.pathqm.length = 0;
}

/** compute_graphical_distance determines the distance of every cell from the current FOV center (graphics:
 *  called by graph.cpp and history.cpp only; it reads centerover) */
export function compute_graphical_distance(): void {
  // ported by D3 (stage 2): centerover = current_display->precise_center
  if (G.pathlock) { cfs_printf_path_error(); }
  const centerover = G.current_display.precise_center;
  const c1 = centerover ? centerover : G.pd_from ? G.pd_from : G.cwt.at;
  const sr = get_sightrange_ambush_env();
  if (G.pd_from === c1 && G.pd_range === sr) return;
  clear_pathdata();

  G.pathlock++;
  G.pd_from = c1;
  G.pd_range = sr;
  onpath(c1, 0);

  for (let qb = 0; qb < isize(G.pathq); qb++) {
    const c = G.pathq[qb].at;
    if (c.pathdist === G.pd_range) break;
    if (qb === 0) for (let i = 0; i < c.type; i++) c.cmove(i); // forCellCM(c1, c) ;
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i);
      if (!c2) continue;
      if (c2.pathdist === PINFD)
        onpath(c2, c.pathdist + 1);
    }
  }
  G.pathlock--;
}

/** printf("path error: compute_graphical_distance\n") */
function cfs_printf_path_error(): void { printf('path error: compute_graphical_distance\n'); }

/** get_sightrange_ambush() (basegraph.cpp): max(get_sightrange(), ambush::distance) */
function get_sightrange_ambush_env(): number { return Math.max(getDistLimit() + G.sightrange_bonus, G.ambush_distance); }

const max_radius = 16;

class visit_set {
  visited = new Set<cell>();
  q: cell[] = [];
  qh = 0;
  visit(c: cell): void {
    if (this.visited.has(c)) return;
    this.visited.add(c);
    this.q.push(c);
  }
  empty(): boolean { return this.qh >= this.q.length; }
}

class princess_ai {
  info: visit_set[] = Array.from({ length: max_radius + 1 }, () => new visit_set());
  visit_gate(g: cell): void { this.info[0].visit(g); }
  run(): void {
    const radius = toggle_radius(waOpenPlate);
    if (G.pathq.length === 0) return;
    let d = G.pathq[G.pathq.length - 1].at.pathdist;
    if (d === PINFD - 1) return;
    d++;
    if (d < 5) d = 5; /* the Princess AI avoids plates when too close to the player */
    if (!(radius <= max_radius)) throw new hr_exception('hassert');

    for (let k = 0; k <= radius; k++) while (!this.info[k].empty()) {
      const c = this.info[k].q[this.info[k].qh++];
      if (k < radius) for (let i = 0; i < c.type; i++) {
        const c1 = c.move(i); if (!c1) continue;
        this.info[k + 1].visit(c1);
        if (k === 0 && c1.wall === waClosedGate)
          this.info[0].visit(c1);
      }
      if (k === radius && c.wall === waOpenPlate && c.pathdist === PINFD)
        onpath_random_dir(c, d);
    }
  }
}

export function computePathdist(param: eMonster, include_allies = true): void {

  for (const c of G.targets)
    if (include_allies || isPlayerOn(c))
      onpath_random_dir(c, isPlayerOn(c) ? 0 : 1);

  const qtarg = isize(G.targets);

  const limit = gamerange();

  let qb = 0;

  const princess = isPrincess(param);
  const gd = new princess_ai();
  for (;;) { // princess_retry:

    for (; qb < isize(G.pathq); qb++) {
      const cw = G.pathq[qb].clone();
      /* The opposite cell will be added to the queue first, which helps the AI. */
      cw.add(idiv(cw.at.type, 2));
      const c = cw.at;
      if (c.monst && !isBug(c) && !(isFriendly(c) && !c.stuntime)) {
        G.pathqm.push(c);
        continue; // no paths going through monsters
      }
      if (isMounted(c) && !isPlayerOn(c)) {
        // don't treat the Worm you are riding as passable
        G.pathqm.push(c);
        continue;
      }
      if (c.cpdist > limit && !(c.land === laTrollheim && G.turncount < c.landparam) && c.wall !== waThumperOn) continue;
      const d = c.pathdist;
      if (d === PINFD - 1) continue;
      for (let j = 0; j < c.type; j++) {
        const cw1 = cw.plus(j);
        // printf("i=%d cd=%d\n", i, c->move(i)->cpdist);
        const c2 = cw1.peek();
        if (!in_line_of_sight(c2)) continue;

        let f = P_MONSTER;
        if (param === moIvyRoot) f |= P_IVY;
        if (param === moTameBomberbird) f |= P_FLYING | P_ISFRIEND;
        if (isPrincess(param)) f |= P_ISFRIEND | P_USEBOAT | P_CHAIN;
        if (param === moGolem) f |= P_ISFRIEND;
        let pass = !!c2 && c2.pathdist === PINFD;
        if (pass && qb < qtarg && !nonAdjacent(c, c2) && !thruVine(c, c2)) pass = passable(c2, null!, f);
        else pass = pass && passable(c, c2, f);

        if (pass) {

          if (qb >= qtarg) {
            if (param === moTortoise && nogoSlow(c, c2)) continue;
            if (param === moIvyRoot && !ivy_passable(c, c2)) continue;
            if (param === moWorm && (cellUnstable(c) || cellEdgeUnstable(c) || prairie_no_worms(c))) continue;
            if (!isFriendly(param) && G.items[itOrbLava] && c2.cpdist <= 5 && pseudohept(c) && makeflame(c2, 1, true))
              continue;
          }

          onpath_with_dir(cw1.plusStep(), d + 1);
        }

        else if (c2 && c2.wall === waClosedGate && princess)
          gd.visit_gate(c2);
      }
    }

    if (princess) {
      gd.run();
      if (qb < isize(G.pathq)) continue; // goto princess_retry
    }
    break;
  }
}

// pathdist end

/** calculate cpdist, 'have' flags, and do general fixings */
export function bfs(): void {

  yendor_onpath();

  const dcs = isize(G.dcal);
  for (let i = 0; i < dcs; i++) G.dcal[i].cpdist = INFD;
  G.worms.length = 0; G.ivies.length = 0; G.ghosts.length = 0; G.golems.length = 0;
  tempmonsters.length = 0; G.targets.length = 0;
  G.statuecount = 0;
  G.wetslime = 0;
  G.hexsnakes.length = 0;

  G.hadwhat = G.havewhat;
  G.havewhat = 0n; G.jiangshi_on_screen = 0;
  G.snaketypes.clear();
  if (!(G.hadwhat & HF_WARP)) { G.avengers = 0; }
  if (!(G.hadwhat & HF_MIRROR)) { G.mirrorspirits = 0; }

  G.elec_havecharge = false;
  G.elec_afterOrb = false;
  G.elec_haveelec = false;
  G.airmap.length = 0;
  if (!(G.hadwhat & HF_ROSE)) G.rosemap.clear();

  G.dcal.length = 0; G.bfs_reachedfrom.length = 0;

  for (const c of player_positions()) {
    if (c.cpdist === 0) continue;
    c.cpdist = 0;
    G.dcal.push(c);
    G.bfs_reachedfrom.push(hrand(c.type));
    if (!G.invismove) G.targets.push(c);
  }

  const distlimit = gamerange();

  for (const c of player_positions()) {
    if (G.items[itOrbDomination])
      if (c.monst === moTentacle || c.monst === moTentaclewait || c.monst === moTentacleEscaping)
        G.worms.push(c);
  }

  let qb = 0;
  G.first7 = 0;
  while (true) {
    if (qb === isize(G.dcal)) break;
    let i: number;
    const fd = G.bfs_reachedfrom[qb] + idiv(G.dcal[qb].type, 2);
    const c = G.dcal[qb++];

    const d = c.cpdist;

    if (WDIM() === 2 && d === distlimit) { G.first7 = qb; break; }

    for (let j = 0; j < c.type; j++) if (i = (fd + j) % c.type, c.move(i)) {
      // printf("i=%d cd=%d\n", i, c->move(i)->cpdist);
      const c2 = c.move(i);
      if (!c2) continue;

      if (isWarpedType(c2.land)) G.havewhat |= HF_WARP;
      if (c2.land === laMirror) G.havewhat |= HF_MIRROR;

      if ((c.wall === waBoat || c.wall === waSea) &&
        (c2.wall === waSulphur || c2.wall === waSulphurC))
        c2.wall = waSea;

      if (c2 && c2.cpdist > d + 1) {
        if (WDIM() === 3 && (d > 2 && !G.current_display.cellmatrices.has(c2))) {
          if (!G.first7) G.first7 = qb;
          continue;
        }
        c2.cpdist = d + 1;

        // remove treasures
        if (!G.peace_on && c2.item && c2.cpdist === distlimit && itemclass(c2.item) === IC_TREASURE &&
          !among(c2.item, itBrownian, itBabyTortoise) && WDIM() !== 3 &&
          (G.items[c2.item] >= (ls_any_chaos() ? 10 : 20) + G.currentLocalTreasure || getGhostcount() >= 2)) {
          c2.item = itNone;
          if (c2.land === laMinefield) { c2.landparam &= ~3; }
        }

        if (c2.item === itBombEgg && c2.cpdist === distlimit && G.items[itBombEgg] >= c2.landparam) {
          c2.item = itNone;
          c2.landparam |= 2;
          c2.landparam &= ~1;
          if (!c2.monst) { c2.monst = moBomberbird; c2.stuntime = 0; }
        }

        if (c2.item === itBarrow && c2.cpdist === distlimit && c2.wall !== waBarrowDig) {
          c2.item = itNone;
        }

        if (c2.item === itLotus && c2.cpdist === distlimit && G.items[itLotus] >= getHauntedDepth(c2)) {
          c2.item = itNone;
        }

        if (c2.item === itMutant2 && G.timerghost) {
          let rotten = true;
          for (let i = 0; i < c2.type; i++)
            if (c2.move(i) && c2.move(i).monst === moMutant)
              rotten = false;
          if (rotten) c2.item = itNone;
        }

        if (c2.item === itDragon && (G.shmup_on ? G.shmup_curtime - c2.landparam > 300000 :
          G.turncount - c2.landparam > 500))
          c2.item = itNone;

        if (c2.item === itTrollEgg && c2.cpdist === distlimit && !G.shmup_on && c2.landparam && G.turncount - c2.landparam > 650)
          c2.item = itNone;

        if (c2.item === itWest && c2.cpdist === distlimit && G.items[itWest] >= c2.landparam + 4)
          c2.item = itNone;

        if (c2.item === itMutant && c2.cpdist === distlimit && G.items[itMutant] >= c2.landparam) {
          c2.item = itNone;
        }

        if (c2.item === itIvory && c2.cpdist === distlimit && G.items[itIvory] >= c2.landparam) {
          c2.item = itNone;
        }

        if (c2.item === itAmethyst && c2.cpdist === distlimit && G.items[itAmethyst] >= idiv(-celldistAlt(c2), 5)) {
          c2.item = itNone;
        }

        if (!G.keepLightning) c2.ligon = 0;
        G.dcal.push(c2);
        G.bfs_reachedfrom.push(c.c.spin(i));

        if (c2.wall === waBigStatue && c2.land !== laTemple)
          G.statuecount++;

        if (isAlch(c2.wall) && c2.land === laWet)
          G.wetslime++;

        if (cellHalfvine(c2) && isWarped(c2)) {
          addMessage(XLAT('%The1 is destroyed!', spW(c2.wall)));
          destroyHalfvine(c2);
        }

        if (c2.wall === waCharged) G.elec_havecharge = true;
        if (isElectricLand(c2)) G.elec_haveelec = true;

        if (c2.land === laWhirlpool) G.havewhat |= HF_WHIRLPOOL;
        if (c2.land === laWhirlwind) G.havewhat |= HF_WHIRLWIND;
        if (c2.land === laWestWall) G.havewhat |= HF_WESTWALL;
        if (c2.land === laPrairie) G.havewhat |= HF_RIVER;
        if (c2.land === laClearing) G.havewhat |= HF_MUTANT;

        if (c2.wall === waRose) G.havewhat |= HF_ROSE;

        if ((G.hadwhat & HF_ROSE)) {
          // rosemap[c2] (inserts a 0)
          let r = G.rosemap.get(c2);
          if (r === undefined) { r = 0; G.rosemap.set(c2, 0); }
          if (r & 3) G.havewhat |= HF_ROSE;
        }

        if (c2.monst) {
          if (isHaunted(c2.land) &&
            c2.monst !== moGhost && c2.monst !== moZombie && c2.monst !== moNecromancer)
            fail_survivalist();
          if (c2.monst === moHexSnake || c2.monst === moHexSnakeTail) {
            G.havewhat |= HF_HEX;
            if (c2.mondir !== NODIR)
              G.snaketypes.add(snake_pair(c2));
            if (c2.monst === moHexSnake) G.hexsnakes.push(c2);
            else findWormIvy(c2);
          }
          else if (c2.monst === moKrakenT || c2.monst === moKrakenH) {
            G.havewhat |= HF_KRAKEN;
          }
          else if (c2.monst === moDragonHead || c2.monst === moDragonTail) {
            G.havewhat |= HF_DRAGON;
          }
          else if (c2.monst === moWitchSpeed)
            G.havewhat |= HF_FAST;
          else if (c2.monst === moMutant)
            G.havewhat |= HF_MUTANT;
          else if (c2.monst === moJiangshi)
            G.jiangshi_on_screen++;
          else if (c2.monst === moOutlaw)
            G.havewhat |= HF_OUTLAW;
          else if (isGhostMover(c2.monst))
            G.ghosts.push(c2);
          else if (isWorm(c2) || isIvy(c2)) findWormIvy(c2);
          else if (isBug(c2)) {
            G.havewhat |= HF_BUG;
            G.targets.push(c2);
          }
          else if (isFriendly(c2)) {
            if (c2.monst !== moMouse && !markEmpathy(itOrbInvis) && !(isWatery(c2) && markEmpathy(itOrbFish)) &&
              !c2.stuntime) G.targets.push(c2);
            if (c2.monst === moGolem) G.golems.push(c2);
            if (c2.monst === moFriendlyGhost) G.golems.push(c2);
            if (c2.monst === moKnight) G.golems.push(c2);
            if (c2.monst === moTameBomberbird) G.golems.push(c2);
            if (c2.monst === moMouse) { G.golems.push(c2); G.havewhat |= HF_MOUSE; }
            if (c2.monst === moPrincess || c2.monst === moPrincessArmed) G.golems.push(c2);
            if (c2.monst === moIllusion) {
              if (G.items[itOrbIllusion]) G.items[itOrbIllusion]--;
              else c2.monst = moNone;
            }
          }
          else if (c2.monst === moButterfly) {
            addButterfly(c2);
          }
          else if (isAngryBird(c2.monst)) {
            G.havewhat |= HF_BIRD;
            if (c2.monst === moBat) G.havewhat |= HF_BATS | HF_EAGLES;
            if (c2.monst === moEagle) G.havewhat |= HF_EAGLES;
          }
          else if (among(c2.monst, moFrog, moVaulter, moPhaser))
            G.havewhat |= HF_JUMP;
          else if (c2.monst === moReptile) G.havewhat |= HF_REPTILE;
          else if (isLeader(c2.monst)) G.havewhat |= HF_LEADER;
          else if (c2.monst === moEarthElemental) G.havewhat |= HF_EARTH;
          else if (c2.monst === moWaterElemental) G.havewhat |= HF_WATER;
          else if (c2.monst === moVoidBeast) G.havewhat |= HF_VOID;
          else if (c2.monst === moHunterDog) G.havewhat |= HF_HUNTER;
          else if (isMagneticPole(c2.monst)) G.havewhat |= HF_MAGNET;
          else if (c2.monst === moAltDemon) G.havewhat |= HF_ALT;
          else if (c2.monst === moHexDemon) G.havewhat |= HF_HEXD;
          else if (among(c2.monst, moAnimatedDie, moAngryDie)) G.havewhat |= HF_DICE;
          else if (c2.monst === moMonk) G.havewhat |= HF_MONK;
          else if (c2.monst === moShark || c2.monst === moCShark || among(c2.monst, moRusalka, moPike)) G.havewhat |= HF_SHARK;
          else if (c2.monst === moAirElemental) {
            G.havewhat |= HF_AIR; G.airmap.push([c2, 0]);
          }
        }
        // pheromones!
        if (c2.land === laHive && c2.landparam >= 50 && c2.wall !== waWaxWall)
          G.havewhat |= HF_BUG;
        if (c2.wall === waThumperOn)
          G.targets.push(c2);

      }
    }
  }

  for (let i = G.first7; i < isize(G.dcal); i++) {
    const ci = G.dcal[i];
    for (let k = 0; k < ci.type; k++) {
      const c2 = ci.move(k); if (!c2) continue;
      if (c2.wall === waThumperOn) {
        G.targets.push(c2);
      }
    }
  }

  for (const t of tempmonsters) t[0].monst = t[1];

  buildAirmap();

  create_los();
}

export function moverefresh(turn = true): void {
  const dcs = isize(G.dcal);

  for (let i = 0; i < dcs; i++) {
    const c = G.dcal[i];

    if (c.monst === moWolfMoved) c.monst = moWolf;
    if (c.monst === moIvyNext) {
      c.monst = moIvyHead; ivynext(c);
    }
    if (c.monst === moIvyDead)
      removeIvy(c);
    refreshFriend(c);
    if (c.monst === moSlimeNextTurn) c.monst = moSlime;
    if (c.monst === moLesser && !cellEdgeUnstable(c)) c.monst = moLesserM;
    else if (c.monst === moLesserM) c.monst = moLesser;
    if (c.monst === moGreater && !cellEdgeUnstable(c)) c.monst = moGreaterM;
    else if (c.monst === moGreaterM) c.monst = moGreater;

    if (c.monst === moPair && !c.stuntime) {
      const c2 = c.move(c.mondir);
      if (c2.monst !== moPair) continue;
      if (true) for (const i of [-1, 1]) {
        const c3 = c.modmove(c.mondir + i);
        if (among(c3.wall, waRuinWall, waColumn, waStone, waVinePlant, waPalace)) {
          drawParticles(c3, winf[c3.wall].color, 30);
          c3.wall = waNone;
        }
      }
    }

    if (c.stuntime && !isMutantIvy(c)) {
      if (turn) c.stuntime--;
      const breathrange = sphere() ? 2 : 3;
      if (c.stuntime === 0 && c.monst === moDragonHead) {
        // if moDragonHead is renamed to "Dragon Head", we might need to change this
        const subject = c.monst;
        if (!c.hitpoints) c.hitpoints = 1;
        else if (G.shmup_on && dragon_totalhp(c) > 2 && shmup_dragonbreath(c)) {
          c.hitpoints = 0;
        }
        else if (dragon_totalhp(c) <= 2) { /* nothing */ }
        else if (isMounted(c)) {
          if (G.dragon_target && celldistance(c, G.dragon_target) <= breathrange && makeflame(G.dragon_target, 5, true)) {
            addMessage(XLAT('%The1 breathes fire!', spM(subject)));
            makeflame(G.dragon_target, 5, false);
            playSound(G.dragon_target, 'fire');
            c.hitpoints = 0;
          }
        }
        else {
          for (let i = 0; i < isize(G.targets); i++) {
            const t = G.targets[i];
            if (celldistance(c, t) <= breathrange && makeflame(t, 5, true)) {
              if (isPlayerOn(t)) addMessage(XLAT('%The1 breathes fire at you!', spM(subject)));
              else if (t.monst)
                addMessage(XLAT('%The1 breathes fire at %the2!', spM(subject), spM(t.monst)));
              else
                addMessage(XLAT('%The1 breathes fire!', spM(subject)));
              makeflame(t, 5, false);
              playSound(t, 'fire');
              c.hitpoints = 0;
            }
          }
        }
      }
    }

    // tortoises who have found their children no longer move
    if (saved_tortoise_on(c))
      c.stuntime = 2;

    if (c.monst === moReptile) {
      if (c.wall === waChasm || cellUnstable(c)) {
        c.monst = moNone;
        c.wall = waReptile;
        c.wparam = reptilemax();
        playSound(c, 'click');
      }
      else if (isChasmy(c) || isWatery(c)) {
        if (c.wall === waMercury) {
          fallMonster(c, AF_FALL);
          c.wall = waNone;
        }
        else {
          c.wall = waReptileBridge;
          c.wparam = reptilemax();
          c.monst = moNone;
        }
        c.item = itNone;
        playSound(c, 'click');
      }
    }

    if (c.wall === waChasm) {
      if (c.land !== laWhirlwind) c.item = itNone;

      if (c.monst && !survivesChasm(c.monst) && c.monst !== moReptile && normal_gravity_at(c)) {
        if (c.monst !== moRunDog && c.land === laMotion)
          achievement_gain_once('FALLDEATH1');
        addMessage(XLAT('%The1 falls!', spM(c.monst)));
        fallMonster(c, AF_FALL);
      }
    }

    else if (isReptile(c.wall) && turn) {
      if (c.monst || isPlayerOn(c)) c.wparam = -1;
      else if (c.cpdist <= 7) {
        c.wparam--;
        if (c.wparam === 0) {
          if (c.wall === waReptile) c.wall = waChasm;
          else placeWater(c, null!);
          c.monst = moReptile;
          c.hitpoints = 3;
          c.stuntime = 0;
          const gooddirs: number[] = [];
          // in the peace mode, a reptile will
          // prefer to walk on the ground, rather than the chasm
          for (let i = 0; i < c.type; i++) {
            const i0 = (i + 3) % c.type;
            const i1 = (i + c.type - 3) % c.type;
            if (c.move(i0) && passable(c.move(i0), c, 0n))
              if (c.move(i1) && passable(c.move(i1), c, 0n))
                gooddirs.push(i);
          }
          c.mondir = hrand_elt(gooddirs, c.mondir);
          playSound(c, 'click');
        }
      }
    }

    else if (isFire(c)) {
      if (c.monst === moSalamander) c.stuntime = Math.max(c.stuntime, 1);
      else if (c.monst === moVaulter && c.mondir === JUMP)
        c.mondir = NODIR;
      else if (c.monst && !survivesFire(c.monst) && !isWorm(c.monst)) {
        addMessage(XLAT('%The1 burns!', spM(c.monst)));
        if (isBull(c.monst)) {
          addMessage(XLAT('Fire is extinguished!'));
          c.wall = waNone;
        }
        fallMonster(c, AF_CRUSH);
      }
      if (c.item && itemBurns(c.item)) {
        addMessage(XLAT('%The1 burns!', spI(c.item)));
        c.item = itNone;
      }
    }

    else if (isWatery(c)) {
      if (c.monst === moLesser || c.monst === moLesserM || c.monst === moGreater || c.monst === moGreaterM)
        c.monst = moGreaterShark;
      if (c.monst && !survivesWater(c.monst) && normal_gravity_at(c)) {
        playSound(c, 'splash' + pick12());
        if (isNonliving(c.monst))
          addMessage(XLAT('%The1 sinks!', spM(c.monst)));
        else
          addMessage(XLAT('%The1 drowns!', spM(c.monst)));
        if (isBull(c.monst)) {
          addMessage(XLAT('%The1 is filled!', spW(c.wall)));
          c.wall = waShallow;
        }
        fallMonster(c, AF_FALL);
      }
    }
    else if (c.wall === waSulphur || c.wall === waSulphurC || c.wall === waMercury) {
      if (c.monst && !survivesPoison(c.monst, c.wall) && normal_gravity_at(c)) {
        playSound(c, 'splash' + pick12());
        if (isNonliving(c.monst))
          addMessage(XLAT('%The1 sinks!', spM(c.monst)));
        else
          addMessage(XLAT('%The1 drowns!', spM(c.monst)));
        if (isBull(c.monst)) {
          addMessage(XLAT('%The1 is filled!', spW(c.wall)));
          c.wall = waNone;
        }
        fallMonster(c, AF_FALL);
      }
    }
    else if (c.wall === waMagma) {
      if (c.monst === moSalamander) c.stuntime = Math.max(c.stuntime, 1);
      else if (c.monst && !survivesPoison(c.monst, c.wall) && normal_gravity_at(c)) {
        if (isNonliving(c.monst))
          addMessage(XLAT('%The1 is destroyed by lava!', spM(c.monst)));
        else
          addMessage(XLAT('%The1 is killed by lava!', spM(c.monst)));
        playSound(c, 'steamhiss', 70);
        fallMonster(c, AF_FALL);
      }
    }
    else if (!isWateryOrBoat(c) && c.wall !== waShallow) {
      if (c.monst === moGreaterShark)
        c.monst = moGreaterM;
      else if (c.monst === moShark || c.monst === moCShark) {
        addMessage(XLAT('%The1 suffocates!', spM(c.monst)));
        fallMonster(c, AF_CRUSH);
      }
      else if (c.monst === moKrakenH) {
        addMessage(XLAT('%The1 suffocates!', spM(c.monst)));
        kraken_kill(c, moNone);
      }
    }

    if (c.monst === moVineSpirit && !cellHalfvine(c) && c.wall !== waVinePlant) {
      addMessage(XLAT('%The1 is destroyed!', spM(c.monst)));
      fallMonster(c, AF_CRUSH);
    }

    if (c.monst) mayExplodeMine(c, c.monst);

    if (c.monst && c.wall === waClosedGate && !survivesWall(c.monst)) {
      playSound(c, 'hit-crush' + pick123());
      addMessage(XLAT('%The1 is crushed!', spM(c.monst)));
      fallMonster(c, AF_CRUSH);
    }

    if (c.monst && cellUnstable(c) && !ignoresPlates(c.monst) && !G.shmup_on)
      doesFallSound(c);
  }
}

// find worms and ivies
export function settemp(c: cell): void {
  tempmonsters.push([c, c.monst]);
  c.monst = moNone;
}

export function findWormIvy(c: cell): void {
  while (true) {
    if (c.monst === moWorm || c.monst === moTentacle || c.monst === moWormwait || c.monst === moTentaclewait ||
      c.monst === moTentacleEscaping) {
      G.worms.push(c); settemp(c);
      break;
    }
    else if (c.monst === moHexSnake) {
      G.hexsnakes.push(c); settemp(c);
    }
    else if (c.monst === moWormtail || c.monst === moHexSnakeTail) {
      let bug = true;
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        if (c2 && isWorm(c2) && c2.mondir !== NODIR && c2.move(c2.mondir) === c) {
          settemp(c);
          c = c2;
          bug = false;
        }
      }
      if (bug) break;
    }
    else if (c.monst === moIvyWait) {
      const c2 = c.move(c.mondir);
      settemp(c); c = c2;
    }
    else if (c.monst === moIvyHead) {
      G.ivies.push(c); settemp(c);
      break;
    }
    else if (c.monst === moIvyBranch || c.monst === moIvyRoot) {
      let bug = true;
      for (let i = 0; i < c.type; i++) {
        const c2 = c.move(i);
        if (c2 && (c2.monst === moIvyHead || c2.monst === moIvyBranch) && c2.move(c2.mondir) === c) {
          settemp(c);
          c = c2;
          bug = false;
        }
      }
      if (bug) break;
    }
    else break;
  }
}

export function advance_tides(): void {
  calcTidalPhase();
  G.recalcTide = true;
  while (G.recalcTide) {
    G.recalcTide = false;
    for (let i = 0; i < isize(G.dcal); i++) checkTide(G.dcal[i]);
  }
}

export function monstersTurn(): void {
  reset_spill();
  checkSwitch();
  mirror_breakAll();
  // DEBB(debug_turn, ("bfs"));
  bfs();
  // DEBB(debug_turn, ("charge"));
  if (G.elec_havecharge) elec_act();
  // DEBB(debug_turn, ("mmo"));
  const phase2 = (1 & G.items[itOrbSpeed]);
  if (!phase2) movemonsters();

  for (const pc of player_positions()) if (pc.item === itOrbSafety) {
    collectItem(pc, pc, true);
    return;
  }

  if (playerInPower() && (phase2 || !G.items[itOrbSpeed]) && (G.havewhat & HF_FAST))
    moveNormals(moWitchSpeed);

  if (phase2 && markOrb(itOrbEmpathy)) {
    bfs();
    movegolems(AF_FAST);
    for (let i = 0; i < isize(G.dcal); i++) {
      if (G.dcal[i].monst === moFriendlyGhost && G.dcal[i].stuntime)
        G.dcal[i].stuntime--;
      refreshFriend(G.dcal[i]);
    }
  }
  // DEBB(debug_turn, ("rop"));
  if (!G.dual_state) reduceOrbPowers();
  let phase1 = (1 & G.items[itOrbSpeed]);
  if (G.dual_state && G.items[itOrbSpeed]) phase1 = phase1 ? 0 : 1;
  // DEBB(debug_turn, ("lc"));
  if (!phase1) livecaves();
  if (!phase1) ca_simulate();
  if (!phase1) heat_processfires();
  // this depends on turncount, so we do it always
  advance_tides();

  for (const c of G.crush_now) {
    changes.ccell(c);
    playSound(null!, 'closegate');
    if (canAttack(c, moCrusher, c, c.monst, AF_GETPLAYER | AF_CRUSH)) {
      attackMonster(c, AF_MSG | AF_GETPLAYER | AF_CRUSH, moCrusher);
    }
    moveEffect(movei.sd(c, FALL), moDeadBird);
    destroyBoats(c, null!, true);
    explodeBarrel(c);
  }

  changes.value_keep(G, 'crush_now');
  changes.value_keep(G, 'crush_next');
  G.crush_now = G.crush_next;
  G.crush_next = [];

  // DEBB(debug_turn, ("heat"));
  heat_processheat();
  // if(elec::havecharge) elec::drawcharges();

  orbbull_check();

  // CAP_COMPLEX2
  if (!phase1) terracotta_check();

  if (G.items[itOrbFreedom])
    for (const pc of player_positions())
      checkFreedom(pc);

  // DEBB(debug_turn, ("check"));
  checkmove(false);
  if (G.canmove) elec_checklightningfast();

  // CAP_HISTORY
  for (const pc of player_positions())
    G.history_movehistory.push(pc);

  if (G.recompute_los) create_los();
}

/** check if whirlline is looped, if yes, remove the repeat; may not detect loops immediately */
let looped_once = true;
export function looped(whirlline: cell[]): boolean {
  if (isize(whirlline) === 1)
    return false;
  if (whirlline[whirlline.length - 1] === whirlline[0]) {
    whirlline.pop();
    return true;
  }
  const pos = idiv(isize(whirlline), 2);
  if (isize(whirlline) > 2 && whirlline[whirlline.length - 1] === whirlline[pos]) {
    while (pos && whirlline[whirlline.length - 1] === whirlline[pos])
      whirlline.pop();
    /* something weird must have happened... */
    if (looped_once) addMessage('warning: a looped line');
    looped_once = false;
    return true;
  }
  return false;
}

/*-- lineofsight --*/

/** enum class los { none, geodesic, geometric } */
export const los_none = 0, los_geodesic = 1, los_geometric = 2;
export const PURELOS_LEVEL = 10;

function fov_at(c: cell): number { return G.current_fov.get(c) ?? 0; }

export function blocks_sight(c: cell, last: cell): boolean {
  if (inmirror(c)) {
    const cw = new cellwalker(c, neighborId(c, last));
    const cw2 = mirror_reflect(cw);
    return blocks_sight(cw2.at, cw2.cpeek());
  }
  if (G.invisfish && !isWateryOrBoat(c)) return true;
  if (c.monst === G.passive_switch) return true;
  if (among(c.wall, waBigStatue, waMirror, waCloud, waThumperOff, waThumperOn, waExplosiveBarrel)) return c.cpdist > 1;
  if (snakelevel(c) === 3 && !(c.cpdist === 1 && snakelevel(G.cwt.at) >= 2)) return true;
  if (c.wall === waTrunk && last && last.wall !== waTrunk && c.cpdist > 1) return true;
  if (c.land === laMountain && last.land === laMountain) {
    const d = celldistAlt(last);
    if (celldistAlt(c) > d && (G.cwt.at.land !== laMountain || celldistAlt(G.cwt.at) > d)) return true;
  }
  return (isWall(c) && !among(c.wall, waFreshGrave, waAncientGrave, waClosedGate, waMirrorWall, waSmallTree, waShrub, waRoundTable)) || thruVine(c, last);
}

export function in_line_of_sight(c: cell): boolean {
  if (G.lineofsight === los_none) return true;
  return fov_at(c) !== 0;
}

export function in_line_of_sight_for_player(c: cell): boolean {
  if (in_line_of_sight(c)) return true;
  if (G.cheater && G.lineofsight_cheat) return true;
  let range = 0;
  if (G.items[itOrbAether]) range = 2;
  if (G.items[itOrbDash] || G.items[itOrbFrog] || G.items[itOrbPhasing]) range = 3;
  if (G.items[itOrbInvis]) range = 999999;
  return c.cpdist <= range;
}

export function create_los(): void {
  G.current_fov.clear();
  if (G.lineofsight === los_geodesic) {
    for (const c of G.dcal) {
      if (c.cpdist === 0) G.current_fov.set(c, fov_at(c) | 3);
      for (let i = 0; i < c.type; i++) {
        const c1 = c.move(i); if (!c1) continue;
        if (c1.cpdist < c.cpdist && (fov_at(c1) & 2))
          G.current_fov.set(c, fov_at(c) | (blocks_sight(c, c1) ? 1 : 3));
      }
    }
  }
  if (G.lineofsight === los_geometric) for (let p = 0; p < numplayers(); p++) if (multi_playerActive(p)) {
    // the geometric line of sight walks the hyperbolic matrices (currentmap->relative_matrix, spintox, adj)
    throw new NotPorted('create_los (los::geometric)');
  }
  let magicrange = 0;
  for (const c of G.dcal) if (!in_line_of_sight(c) && in_line_of_sight_for_player(c)) magicrange = c.cpdist;
  if (magicrange > 3) markOrb(itOrbInvis);
  else if (magicrange > 2) { markOrb(itOrbFrog); markOrb(itOrbDash); markOrb(itOrbPhasing); }
  else markOrb(itOrbAether);
  G.recompute_los = false;
}
