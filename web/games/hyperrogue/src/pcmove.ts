// pcmove.cpp of HyperRogue 13.1o: the player's movement. Package P7 (player).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names: struct pcmove is the class `pcmove` (its vmsg(moveissue) is `vmsg_mi`); the 5-argument
// sideAttack(mf, dir, who, bonus, eItem orb) is `sideAttack_i`; swordAttackStatic(int bb) and
// swordAttackStatic() are one function with bb optional, as are both isPlayerInBoatOn; the inline
// movepcto(const movedir&) is `movepcto_md`. The goto's of actual_move/after_escape are labeled blocks.
// changes.value_keep(cwt) and value_keep(bow::bowpath_map) keep copies (keep_cwt, keep_bowpath_map), since
// the TS objects are mutated in place. DEBB/println(hlog) debug output is left out; the warning dialog of
// warningprotection (pushScreen) is UI (a later stage), its state (warning_shown) is kept.
import {
  achievement_collection, achievement_final, achievement_gain, achievement_gain_once, check_total_victory,
} from './achievement.ts';
import {
  animate_item_throw, animateCorrectAttack, animateMovement, commitAnimations, drawDirectionalParticle,
  drawParticles, indAnimateMovement, LAYER_BOAT, LAYER_SMALL,
} from './animations.ts';
import {
  attackMonster, canAttack, conditional_flip_slime, do_swords, handle_switchplaces, killFriendlyIvy,
  killHardcorePlayer, killMonster, killThePlayer, monsterPushable, pushMonster, reset_spill, should_switchplace,
  stabbingAttack, switchplace_prevent, tkills,
} from './attack.ts';
import { addMessage } from './basegraph.ts';
import { newRoundTableRadius, pregen, roundTableRadius } from './bigstuff.ts';
import { celldist, celldistance, getDistLimit, neighborId } from './cell.ts';
import { printf } from './cfile.ts';
import {
  checkmove, miENTITY, miRESTRICTED, miTHREAT, miVALID, miWALL, monstersnear_add_pmi, moveissue, moveissue_copy,
  player_move_info, siCURRENT, siFATIGUE, siGRAVITY, siITEM, siMONSTER, siROSE, siUNKNOWN, siWALL, siWARP, siWIND,
} from './checkmove.ts';
import { gNormal, orbProtection } from './classes.ts';
import {
  mirror_act, mirror_ATTACK, mirror_GO, mirror_SPINMULTI, mirror_SPINSINGLE, prairie_treasures, princess_move,
  princess_playernear, sword_orbcount, sword_pos_n, sword_shift, tortoise_diff, tortoise_getb, tortoise_move_adult,
  tortoise_seek,
} from './complex.ts';
import {
  camelot_knightFlavorMessage, camelot_roundTableMessage, dice_chaos_swap, dice_data_at, dice_on, dice_roll_effect,
  dice_swap_forbidden, mine_marked_mine, mine_safe, mine_uncover_full,
} from './complex2.ts';
import { playergender } from './config.ts';
import {
  type eItem, type eLand, type eMonster, type eWall, type flagtype, IC_ORB, iinf, itBabyTortoise, itBarrow,
  itCrossbow, itCurseFatigue, itCurseWater, itCurseWeakness, itFatigue, itHolyGrail, itLotus, itOrbAether,
  itOrbBull, itOrbChaos, itOrbDigging, itOrbDomination, itOrbEmpathy, itOrbFire, itOrbFish, itOrbFlash,
  itOrbGravity, itOrbHorns, itOrbInvis, itOrbLightning, itOrbNature, itOrbPlague, itOrbShield, itOrbSide1,
  itOrbSide2, itOrbSide3, itOrbSlaying, itOrbSpeed, itOrbSword, itOrbSword2, itOrbThorns, itOrbUndeath, itOrbWater,
  itOrbWinter, itOrbWoods, itOrbYendor, itRevolver, itTerra, ittypes, itWarning, itWhirlpool, laBrownian, laBurial,
  laCaves, laCrossroads4, laDragon, laDual, laHalloween, laHaunted, laHauntedWall, laHive, laMinefield, laMotion,
  laOcean, laPalace, laPower, laTerracotta, laTortoise, laWarpCoast, laWarpSea, laWhirlpool, moAirball, moAngryDie,
  moAnimatedDie, moButterfly, moCrushball, moDraugr, moFireball, moFlailer, moFriendlyGhost, moFriendlyIvy,
  moGreater, moGreaterM, moHedge, moHexSnake, moHexSnakeTail, moKnight, moNone, moOutlaw, moPlayer, moRoseBeauty,
  moRusalka, moSalamander, moShadow, moTameBomberbird, moTentacle, moTentacleEscaping, moTentacleGhost,
  moTentacletail, moTentaclewait, moTerraWarrior, moTongue, moTortoise, moWarning, moWaterElemental, moWorm,
  moWormtail, moWormwait, waArrowTrap, waBarrowDig, waBarrowWall, waBigBush, waBigStatue, waBigTree, waBoat,
  waCamelotMoat, waCavewall, waChasm, waClosedGate, waClosePlate, waCTree, waDeepWater, waExplosiveBarrel,
  waFireTrap, waGlass, waIcewall, waLake, waMagma, waMirrorWall, waNone, waOpenPlate, waReptile, waRichDie, waRose,
  waRoundTable, waSea, waShallow, waShrub, waSmallBush, waSmallTree, waSolidBranch, waStone, waStrandedBoat,
  waVinePlant, waWeakBranch, winf,
} from './content.ts';
import { big_unlock } from './content-req.ts';
import { dynamicval, sortedKeys } from './cpp.ts';
import { bow_auto_path, bow_bpFIRST, bow_crossbow_mode, bow_loading_time, bow_shoot } from './crossbow.ts';
import { dialog_actual_display_keys } from './dialogs.ts';
import { bfs, create_los, monstersTurn } from './environment.ts';
import {
  cellHalfvine, cellUnstable, checkOrb, do_not_touch_this_wall, is_paired, isActivable, isAlch, isAnyIvy, isBull,
  isDie, isFire, isFriendly, isGhostable, isHaunted, isIcyLand, isIvy, isMountable, isMultitile, isPrincess,
  isPushable, isRaider, isStunnable, isSwitch, isWall, isWatery, isWorm, itemclass, snakelevel,
} from './flags.ts';
import { activateActiv, canPushThumperOn, normal_gravity_at, pushThumper, wormhead } from './game.ts';
import { G } from './globals.ts';
import { orb_auxiliary_color } from './graph.ts';
import { ranged_click_help } from './help.ts';
import { format, its, pick123 } from './hprint.ts';
import {
  AF_CRUSH, AF_FALL, AF_FAST, AF_MSG, AF_MUSTKILL, AF_NORMAL, AF_PLAGUE, AF_SIDE, AF_STAB, AF_SWORD, AF_WEAK, among,
  GEN_F, MAXPLAYER, MD_UNDECIDED, MD_USE_ORB, MF_IVY, movedir, ORBBASE, type reaction_t,
} from './hyper.ts';
import {
  collectItem, countLocalTreasure, doPickupItemsWithMagnetism, dropGreenStone, gold, itemHiddenFromSight, moveItem,
  updateHi,
} from './items.ts';
import { setdist } from './landgen.ts';
import { ls_any_chaos, ls_hv_structure } from './landlock.ts';
import { dnameof_i, spI, spL, spM, spW, XLAT } from './language.ts';
import { cell, type cellwalker, JUMP, movei, NO_SPACE, NODIR, STAY } from './locations.ts';
import {
  activateArrowTrap, cellEdgeUnstable, destroyHalfvine, destroyTrapsAround, destroyTrapsOn, destroyWeakBranch,
  determinePush, doesFallSound, doesnotFall, earthMove, explodeBarrel, get_move_gravity, get_static_gravity,
  gravityLevelDiff, gsNormal, in_gravity_zone, makeflame, makeshallow, nonAdjacentPlayer, thruVine, toggleGates_w,
} from './mapeffects.ts';
import { anglestraight } from './monstermove.ts';
import { multi_activePlayers, multi_playerActive } from './multi.ts';
import { dual_movepc } from './multigame.ts';
import { getOLR, olrDangerous } from './orbgen.ts';
import {
  activateFlash, activateLightning, checkStunKill, drainOrb, markEmpathy, markOrb, markOrb2, roCheck, roKeyboard,
  roMultiGo, targetRangedOrb,
} from './orbs.ts';
import {
  againstCurrent, againstRose, againstWind, airdist, anti_alchemy, boatGoesThrough, canPushStatueOn,
  logical_adjacent, moveBoat, P_BLOW, P_ISPLAYER, P_MIRROR, P_MONSTER, P_NOAETHER, P_USEBOAT, passable, placeWater,
  scentResistant, strictlyAgainstGravity,
} from './passable.ts';
import { geosupport_football, pseudohept } from './pattern2.ts';
import { hrand, hrngen, mt19937 } from './rand.ts';
import { save_memory } from './savemem.ts';
import { shmup_playerInBoat, shmup_playerpos, shmup_visibleFor } from './shmup.ts';
import { playSound } from './sound.ts';
import { tour_checkGoodLand } from './tour.ts';
import { yendor_check } from './yendor.ts';

/** a copy of the gcell fields copy_metadata restores (gcell a = *c) */
export interface gcell_copy {
  wall: number; monst: number; item: number; mondir: number; stuntime: number; hitpoints: number;
  monmirror: number; landpar: number; wparam: number;
}

export function gcell_snapshot(c: cell): gcell_copy {
  return {
    wall: c.wall, monst: c.monst, item: c.item, mondir: c.mondir, stuntime: c.stuntime, hitpoints: c.hitpoints,
    monmirror: c.monmirror, landpar: c.LHU.landpar, wparam: c.wparam,
  };
}


/** struct changes_t: the changes made during the player movement, to roll back or commit.
 *  C++ references become (object, key) pairs: `changes.value_set(x, v)` -> `changes.value_set(G, 'x', v)`;
 *  `value_keep(items)` (a whole array) -> `changes.value_keep_array(G.items)`; `value_keep(hrngen)` ->
 *  `changes.value_keep_rng(hrngen)`. */
export class changes_t {
  rollbacks: reaction_t[] = [];
  commits: reaction_t[] = [];
  on = false;
  checking = false;

  /** init(false) to commit the changes (if successful), init(true) to only check the move */
  init(ch: boolean): void {
    this.on = true;
    this.ccell(G.cwt.at);
    const c = G.cwt.at;
    for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (c1) this.ccell(c1); }
    this.value_keep_array(G.kills);
    this.value_keep_array(G.items);
    this.value_keep_array(G.orbused);
    this.value_keep_rng(hrngen);
    this.checking = ch;
  }

  commit(): void {
    this.on = false;
    for (const p of this.commits) p();
    this.rollbacks.length = 0;
    this.commits.length = 0;
  }

  rollback(_pos = 0): void {
    this.on = false;
    while (this.rollbacks.length) {
      this.rollbacks[this.rollbacks.length - 1]();
      this.rollbacks.pop();
    }
    this.rollbacks.length = 0;
    this.commits.length = 0;
  }

  /** the changes to cell c will be rolled back when rollback() is called */
  ccell(c: cell): void {
    if (!this.on) return;
    const a = gcell_snapshot(c);
    this.rollbacks.push(() => copy_metadata(c, a));
  }

  /** set what (= obj[key]) to value, to be rolled back if necessary */
  value_set<O, K extends keyof O>(obj: O, key: K, value: O[K]): void {
    if (!this.on) { obj[key] = value; return; }
    if (obj[key] === value) return;
    const old = obj[key];
    this.rollbacks.push(() => { obj[key] = old; });
    obj[key] = value;
  }

  /** add step to obj[key] (numbers) */
  value_add<O, K extends keyof O>(obj: O, key: K, step: number): void {
    this.value_keep(obj, key);
    (obj[key] as unknown as number) += step;
  }

  value_inc<O, K extends keyof O>(obj: O, key: K): void { this.value_add(obj, key, 1); }

  /** any change to obj[key] will be rolled back if necessary (a scalar, or a value replaced as a whole) */
  value_keep<O, K extends keyof O>(obj: O, key: K): void {
    if (!this.on) return;
    const old = obj[key];
    this.rollbacks.push(() => { obj[key] = old; });
  }

  /** value_keep of a std::array / vector: its contents are restored in place */
  value_keep_array<T>(arr: T[]): void {
    if (!this.on) return;
    const old = arr.slice();
    this.rollbacks.push(() => { arr.length = 0; arr.push(...old); });
  }

  /** value_keep(hrngen) */
  value_keep_rng(r: mt19937): void {
    if (!this.on) return;
    const old = r.clone();
    this.rollbacks.push(() => { r.copyFrom(old); });
  }

  /** like value_keep but for maps */
  map_value<K, V>(vmap: Map<K, V>, key: K): void {
    if (vmap.has(key)) {
      const val = vmap.get(key) as V;
      this.at_rollback(() => { vmap.set(key, val); });
    }
    else {
      this.at_rollback(() => { vmap.delete(key); });
    }
  }

  /** perform the given action on commit (see LATE) */
  at_commit(act: reaction_t): void {
    if (!this.on) act();
    else this.commits.push(act);
  }

  /** perform the given action on rollback */
  at_rollback(act: reaction_t): void {
    if (this.on) this.rollbacks.push(act);
  }

  push_push(tgt: cell): void {
    G.pushes.push(tgt);
    const v = (): void => { G.pushes.pop(); };
    this.rollbacks.push(v);
    this.commits.push(v);
  }
}

/** the only instance of changes_t */
export const changes = new changes_t();

/** hyper.h LATE(x): `if(changes.on) { changes.at_commit([=] { x; }); return; }`
 *  -> `if (changes.on) { changes.at_commit(() => f(args...)); return; }` written out at each use. */

/** changes.value_keep(cwt): cwt is a walker mutated in place, so the rollback keeps a copy and restores it in
 *  place, as C++ assigns the one global: code that holds G.cwt (pcmove::checkNeedMove's `cwt`) sees the restored
 *  walker. In the multiplayer mode a rollback inside a nested movepcto (multimove) restores an earlier player's
 *  cwt, and checkNeedMove's message then names the monster on that player's cell (oracle scenario multi4-jungle) */
export function keep_cwt(): void {
  if (!changes.on) return;
  const old = G.cwt.clone();
  changes.at_rollback(() => { G.cwt.set(old); });
}

/** changes.value_keep(bow::bowpath_map) (a copy of the map, which is cleared in place right after) */
function keep_bowpath_map(): void {
  if (!changes.on) return;
  const old = new Map(G.bow_bowpath_map);
  changes.at_rollback(() => { G.bow_bowpath_map = old; });
}

export function fail_survivalist(): void {
  changes.value_set(G, 'survivalist', false);
}

/** cell*& singlepos(): the reference is G.cwt.at (assign G.cwt.at to write) */
export function singlepos(): cell { return G.cwt.at; }
export function singleused(): boolean { return !(G.shmup_on || G.multi_players > 1); }

export function createNoise(t: number): void {
  G.noiseuntil = Math.max(G.noiseuntil, G.turncount + t);
  G.invismove = false;
  if (G.shmup_on) shmup_visibleFor(100 * t);
}

/** enum eLastmovetype { lmSkip, lmMove, lmAttack, lmPush, lmTree, lmInstant } */
export const lmSkip = 0, lmMove = 1, lmAttack = 2, lmPush = 3, lmTree = 4, lmInstant = 5;
export type eLastmovetype = number;
/** enum eForcemovetype { fmSkip, fmMove, fmAttack, fmInstant, fmActivate } */
export const fmSkip = 0, fmMove = 1, fmAttack = 2, fmInstant = 3, fmActivate = 4;
export type eForcemovetype = number;

// namespace orbbull
const orbbull_prev: cell[] = new Array<cell>(MAXPLAYER).fill(null!);
const orbbull_prevtype: eLastmovetype[] = new Array<number>(MAXPLAYER).fill(0);
let orbbull_count = 0;

function orbbull_is(c1: cell, c2: cell, c3: cell): boolean {
  const lp = neighborId(c2, c1);
  const ln = neighborId(c2, c3);
  return lp >= 0 && ln >= 0 && anglestraight(c2, lp, ln);
}

export function orbbull_gainBullPowers(): void {
  G.items[itOrbShield]++; G.orbused[itOrbShield] = true;
  G.items[itOrbThorns]++; G.orbused[itOrbThorns] = true;
  G.items[itOrbHorns]++; G.orbused[itOrbHorns] = true;
}

export function orbbull_check(): void {
  let cp = G.multi_cpid;
  if (cp < 0 || cp >= MAXPLAYER) cp = 0;

  if (!G.items[itOrbBull]) {
    orbbull_prev[cp] = null!;
    return;
  }

  let seq = false;

  if (orbbull_prev[cp] && orbbull_prevtype[cp] === lmMove && G.lastmovetype === lmMove)
    seq = orbbull_is(orbbull_prev[cp], G.lastmove, G.cwt.at);

  if (orbbull_prev[cp] && orbbull_prevtype[cp] === lmMove && G.lastmovetype === lmAttack)
    seq = orbbull_is(orbbull_prev[cp], G.cwt.at, G.lastmove);

  if (orbbull_prev[cp] && orbbull_prevtype[cp] === lmAttack && G.lastmovetype === lmAttack && orbbull_count)
    seq = G.lastmove === orbbull_prev[cp];

  if (orbbull_prev[cp] && orbbull_prevtype[cp] === lmAttack && G.lastmovetype === lmMove && orbbull_count)
    seq = G.cwt.at === orbbull_prev[cp];

  orbbull_prev[cp] = G.lastmove; orbbull_prevtype[cp] = G.lastmovetype;

  if (seq) {
    if (G.lastmovetype === lmMove) orbbull_count++;
    orbbull_gainBullPowers();
  }
  else orbbull_count = 0;
}

/** struct pcmove */
export class pcmove {
  switchplaces = false;
  checkonly = false;
  errormsgs = false;
  origd = 0;
  fmsMove = false; fmsAttack = false; fmsActivate = false;
  d = 0;
  subdir = 0;
  /** used to tell perform_actual_move() that this is a boat move and thus we should not pick up items */
  boatmove = false;
  good_tortoise = false;
  attackflags: flagtype = 0n;

  mi: movei = new movei(null!, null!, 0);
  mip: movei = new movei(null!, null!, 0);

  /** bool vmsg(moveissue mi) */
  vmsg_mi(mi: moveissue): boolean {
    G.checked_move_issue = moveissue_copy(mi);
    changes.rollback();
    return this.errormsgs && !this.checkonly;
  }

  vmsg(code: number, subissue_code: number, where: cell, m: eMonster): boolean {
    return this.vmsg_mi(new moveissue(code, subissue_code, m, where));
  }

  vmsg_threat(): boolean {
    return this.vmsg(miTHREAT, siMONSTER, G.who_kills_me_cell, G.who_kills_me);
  }

  checkNeedMove(checkonly: boolean, attacking: boolean): boolean {
    const cwt = G.cwt;
    if (G.items[itOrbDomination] > ORBBASE && cwt.at.monst)
      return false;
    let flags: flagtype = 0n;
    let drown = false;
    if (cwt.at.monst) {
      if (this.vmsg(miRESTRICTED, siMONSTER, cwt.at, cwt.at.monst)) {
        if (isMountable(cwt.at.monst))
          addMessage(XLAT('You need to dismount %the1!', spM(cwt.at.monst)));
        else
          addMessage(XLAT('You need to move to give space to %the1!', spM(cwt.at.monst)));
      }
    }
    else if (cwt.at.wall === waRoundTable) {
      if (markOrb2(itOrbAether)) return false;
      if (this.vmsg(miRESTRICTED, siWALL, cwt.at, moNone))
        addMessage(XLAT('It would be impolite to land on the table!'));
    }
    else if (cwt.at.wall === waLake) {
      drown = true;
      if (markOrb2(itOrbAether)) return false;
      if (markOrb2(itOrbFish)) return false;
      if (in_gravity_zone(cwt.at) && passable(cwt.at, null!, P_ISPLAYER)) return false;
      flags |= AF_FALL;
      if (this.vmsg(miWALL, siWALL, cwt.at, moNone)) addMessage(XLAT('Ice below you is melting! RUN!'));
    }
    else if (!attacking && cellEdgeUnstable(cwt.at)) {
      if (markOrb2(itOrbAether)) return false;
      if (in_gravity_zone(cwt.at) && passable(cwt.at, null!, P_ISPLAYER)) return false;
      if (this.vmsg(miRESTRICTED, siGRAVITY, cwt.at, moNone)) addMessage(XLAT('Nothing to stand on here!'));
      return true;
    }
    else if (among(cwt.at.wall, waSea, waCamelotMoat, waLake, waDeepWater)) {
      drown = true;
      if (markOrb(itOrbFish)) return false;
      if (markOrb2(itOrbAether)) return false;
      if (in_gravity_zone(cwt.at) && passable(cwt.at, null!, P_ISPLAYER)) return false;
      if (this.vmsg(miWALL, siWALL, cwt.at, moNone)) addMessage(XLAT('You have to run away from the water!'));
    }
    else if (cwt.at.wall === waClosedGate) {
      if (markOrb2(itOrbAether)) return false;
      if (this.vmsg(miWALL, siWALL, cwt.at, moNone)) addMessage(XLAT('The gate is closing right on you! RUN!'));
    }
    else if (isFire(cwt.at) && !markOrb(itOrbWinter) && !markOrb(itCurseWater) && !markOrb2(itOrbShield)) {
      if (markOrb2(itOrbAether)) return false;
      if (this.vmsg(miWALL, siWALL, cwt.at, moNone)) addMessage(XLAT('This spot will be burning soon! RUN!'));
    }
    else if (cwt.at.wall === waMagma && !markOrb(itOrbWinter) && !markOrb(itCurseWater) && !markOrb2(itOrbShield)) {
      if (markOrb2(itOrbAether)) return false;
      if (in_gravity_zone(cwt.at) && passable(cwt.at, cwt.at, P_ISPLAYER)) return false;
      if (this.vmsg(miWALL, siWALL, cwt.at, moNone)) addMessage(XLAT('Run away from the lava!'));
    }
    else if (cwt.at.wall === waChasm) {
      if (markOrb2(itOrbAether)) return false;
      if (in_gravity_zone(cwt.at) && passable(cwt.at, cwt.at, P_ISPLAYER)) return false;
      flags |= AF_FALL;
      if (this.vmsg(miWALL, siWALL, cwt.at, moNone)) addMessage(XLAT('The floor has collapsed! RUN!'));
    }
    else if (G.items[itOrbAether] > ORBBASE && !passable(cwt.at, null!, P_ISPLAYER | P_NOAETHER)) {
      if (markOrb2(itOrbAether)) return false;
      this.vmsg(miWALL, siWALL, cwt.at, moNone);
      return true;
    }
    else if (!passable(cwt.at, null!, P_ISPLAYER)) {
      if (isFire(cwt.at)) return false; // already checked: have Shield
      if (markOrb2(itOrbAether)) return false;
      if (this.vmsg(miWALL, siWALL, cwt.at, moNone)) addMessage(XLAT('Your Aether power has expired! RUN!'));
    }
    else return false;
    if (G.hardcore && !checkonly) {
      if (cwt.at.monst)
        G.yasc_message = XLAT('did not leave %the1', spM(cwt.at.monst));
      else if (cwt.at.wall === waChasm)
        G.yasc_message = XLAT('fell into a chasm');
      else if (cwt.at.wall === waRoundTable)
        G.yasc_message = XLAT('died by politeness');
      else if (cwt.at.wall === waClosedGate)
        G.yasc_message = XLAT('crushed by a gate');
      else if (drown)
        G.yasc_message = XLAT('drowned in %the1', spW(cwt.at.wall));
      else
        G.yasc_message = XLAT('did not leave %the1', spW(cwt.at.wall));
      killHardcorePlayer(G.multi_cpid, flags);
    }
    if (!checkonly) G.illegal_moves++;
    return true;
  }

  try_shooting(auto_target: boolean): boolean {
    G.hit_anything = false;
    if (auto_target) {
      const b = bow_auto_path();
      if (!b) {
        if (!isWall(G.cwt.peek())) {
          changes.rollback();
          if (!this.checkonly) addMessage(XLAT('Cannot hit anything by shooting this direction!'));
        }
        return false;
      }
      addMessage(XLAT('Fire!'));
    }
    G.items[itCrossbow] = bow_loading_time();
    let fst = G.cwt.peek();
    if (G.bow_bowpath.length >= 1) fst = G.bow_bowpath[1].prev.at;
    const blocked = fst.monst;
    bow_shoot();

    let v = -1; for (const p of G.bow_bowpath) if (p.next.at === G.cwt.at && (p.flags & bow_bpFIRST)) v = p.next.spin;

    if (v >= 0) sideAttack(G.cwt.at, v, moPlayer, 0);
    if (G.items[itOrbGravity]) {
      G.gravity_state = get_static_gravity(G.cwt.at);
      if (G.gravity_state) markOrb(itOrbGravity);
    }

    if (againstRose(G.cwt.at, null!) && !scentResistant() && (againstRose(G.cwt.at, fst) || blocked === fst.monst)) {
      if (this.vmsg(miRESTRICTED, siROSE, null!, moNone)) {
        addMessage(XLAT('You cannot stay in place and shoot, those roses smell too nicely.') + its(celldistance(G.cwt.at, fst)));
      }
      return false;
    }

    if (cellEdgeUnstable(G.cwt.at) || G.cwt.at.land === laWhirlpool) {
      if (this.checkonly) return true;
      if (changes.on) changes.commit();
      addMessage(XLAT('(shooting while unstable -- no turn passes)'));
      checkmove(false);
      return true;
    }

    if (this.checkNeedMove(this.checkonly, false))
      return false;
    swordAttackStatic();
    G.nextmovetype = G.hit_anything ? lmAttack : lmSkip;
    G.lastmovetype = G.hit_anything ? lmAttack : lmSkip; G.lastmove = null!;

    while (G.bow_rusalka_curses--) rusalka_curse();

    this.mi = movei.sd(G.cwt.at, STAY);
    if (G.last_gravity_state && !G.gravity_state)
      playerMoveEffects(this.mi);

    if (monstersnear_add_pmi(new player_move_info(this.mi))) {
      if (this.vmsg_threat()) wouldkill('%The1 would catch you!');
      return false;
    }
    if (this.checkonly) return true;
    if (changes.on) changes.commit();
    if (cellUnstable(G.cwt.at) && !markOrb(itOrbAether))
      doesFallSound(G.cwt.at);

    return this.after_move();
  }

  movepcto(): boolean {
    const d = this.d, subdir = this.subdir, checkonly = this.checkonly;
    reset_spill();
    if (G.dual_state === 1) return dual_movepc(d, subdir, checkonly);
    if (d >= 0 && !checkonly && subdir !== 1 && subdir !== -1) printf(format('subdir = %d\n', subdir));
    this.mip.t = null!;
    this.switchplaces = false;
    G.warning_shown = false;
    G.suicidal = false;

    if (d === MD_USE_ORB)
      return !!targetRangedOrb(G.multi_whereto[G.multi_cpid].tgt, roMultiGo);

    this.errormsgs = G.multi_players === 1 || G.multi_cpid === G.multi_players - 1;
    if (G.hardcore && !G.canmove) return false;
    if (!checkonly && d >= 0) {
      G.flipplayer = false;
      if (G.multi_players > 1) G.multi_flipped[G.multi_cpid] = false;
    }
    // DEBBI(checkonly ? 0 : debug_turn, ("movepc"));
    if (!checkonly) G.invismove = false;
    this.boatmove = false;

    if (G.multi_players > 1)
      G.lastmountpos[G.multi_cpid] = G.cwt.at;
    else
      G.lastmountpos[0] = G.cwt.at;

    let fatigued = false;

    if (againstRose(G.cwt.at, null!) && d < 0 && !scentResistant()) {
      fatigued = G.items[itFatigue] >= 8;
      if (!fatigued) {
        if (this.vmsg(miRESTRICTED, siROSE, null!, moNone))
          addMessage(XLAT('You just cannot stand in place, those roses smell too nicely.'));
        return false;
      }
    }

    G.gravity_state = gsNormal;

    this.fmsMove = G.forcedmovetype === fmSkip || G.forcedmovetype === fmMove;
    this.fmsAttack = G.forcedmovetype === fmSkip || G.forcedmovetype === fmAttack;
    this.fmsActivate = G.forcedmovetype === fmSkip || G.forcedmovetype === fmActivate;

    changes.init(checkonly);
    keep_bowpath_map();
    G.bow_bowpath_map.clear();
    if (fatigued) addMessage(XLAT('The roses smell nicely, but you are just too tired to care.'));
    let b = (d >= 0 && G.bow_fire_mode) ? false : (d >= 0) ? this.actual_move() : this.stay();
    if (checkonly || !b) {
      changes.rollback();
      if (!checkonly) G.flipplayer = false;

      if (!b && G.items[itCrossbow] === 0 && bow_crossbow_mode() && G.bow_bump_to_shoot && d >= 0 && !checkonly) {
        changes.init(checkonly);
        if (G.bow_fire_mode) {
          this.origd = d;
          G.cwt.add(d);
          mirror_act(d, mirror_SPINSINGLE);
        }
        keep_bowpath_map();
        b = this.try_shooting(true);
        if (checkonly || !b) changes.rollback();
      }
    }
    else if (changes.on) {
      // println(hlog, "error: not commited!");
      changes.commit();
    }
    if (b && !checkonly) G.bow_fire_mode = false;

    if (!b) {
      // bool try_instant = (forcedmovetype == fmInstant) || (forcedmovetype == fmSkip && !passable(c2, cwt.at, P_ISPLAYER | P_MIRROR | P_USEBOAT | P_FRIENDSWAP));

      if (G.items[itOrbFlash]) {
        if (checkonly) { G.nextmovetype = lmInstant; return true; }
        if (G.warning_shown || orbProtection(itOrbFlash)) return true;
        activateFlash();
        create_los();
        checkmove(false);
        return true;
      }

      if (G.items[itOrbLightning]) {
        if (checkonly) { G.nextmovetype = lmInstant; return true; }
        if (G.warning_shown || orbProtection(itOrbLightning)) return true;
        activateLightning();
        create_los();
        checkmove(false);
        return true;
      }

      if (G.who_kills_me === moOutlaw && G.items[itRevolver] && !checkonly) {
        const c2 = G.cwt.cpeek();
        for (let i = 0; i < c2.type; i++) {
          const c3 = c2.move(i); if (!c3) continue;
          for (let j = 0; j < c3.type; j++) {
            const c4 = c3.move(j); if (!c4) continue;
            if (c4.monst === moOutlaw) {
              const it = targetRangedOrb(c4, roCheck);
              if (it === itRevolver) {
                targetRangedOrb(c4, roKeyboard);
                return true;
              }
            }
          }
        }
      }

      if (G.checked_move_issue.type === miTHREAT && !checkonly) G.illegal_moves++;
    }

    return b;
  }

  after_move(): boolean {
    if (this.checkonly) return true;

    G.invisfish = false;
    if (G.items[itOrbFish]) {
      G.invisfish = true;
      for (const pc of player_positions())
        if (!isWatery(pc))
          G.invisfish = false;
      if (this.d < 0) G.invisfish = false; // no invisibility if staying still
      if (G.invisfish) G.invismove = true, markOrb(itOrbFish);
    }

    G.last_gravity_state = G.gravity_state;
    if (G.multi_players === 1) monstersTurn();

    save_memory();

    check_total_victory();

    if (G.items[itWhirlpool] && G.cwt.at.land !== laWhirlpool)
      achievement_gain_once('WHIRL1');

    if (G.items[itLotus] >= 25 && !isHaunted(G.cwt.at.land) && G.survivalist)
      achievement_gain_once('SURVIVAL');

    if (G.seenSevenMines && G.cwt.at.land !== laMinefield) {
      changes.value_set(G, 'seenSevenMines', false);
      achievement_gain('SEVENMINE');
    }

    // DEBB(debug_turn, ("done"));
    return true;
  }

  swing(): boolean {
    sideAttack(G.cwt.at, this.d, moPlayer, 0);

    mirror_act(this.origd, mirror_SPINMULTI | mirror_ATTACK);

    if (monstersnear_add_pmi(new player_move_info(movei.sd(G.cwt.at, STAY)))) {
      if (G.nextmovetype === lmAttack ? this.vmsg(miWALL, siWALL, this.mi.t, G.who_kills_me) : this.vmsg_threat())
        wouldkill('You would be killed by %the1!');
      return false;
    }
    if (this.checkonly) return true;
    if (changes.on) changes.commit();

    animateCorrectAttack(this.mi, LAYER_SMALL, moPlayer);
    if (G.survivalist && isHaunted(this.mi.t.land))
      G.survivalist = false;
    G.lastmovetype = lmTree; G.lastmove = this.mi.t;
    swordAttackStatic();

    return this.after_move();
  }

  after_instant(kl: boolean): boolean {
    changes.commit();
    G.keepLightning = kl;
    bfs();
    G.keepLightning = false;
    if (G.multi_players > 1) { G.multi_whereto[G.multi_cpid].d = MD_UNDECIDED; return false; }
    checkmove(false);
    return true;
  }

  actual_move(): boolean {
    let pushedMonster = moNone;

    this.origd = this.d;
    if (this.d >= 0) {
      G.cwt.add(this.d);
      const b = dynamicval(() => changes.on, (v) => { changes.on = v; }, false);
      try { mirror_act(this.d, mirror_SPINSINGLE); }
      finally { b.restore(); }
      this.d = G.cwt.spin;
    }
    if (this.d !== -1 && !this.checkonly) G.playermoved = true;

    this.mi = movei.sd(G.cwt.at, this.d);
    const c2 = this.mi.t;
    if (c2 === G.out_of_bounds) return false;
    this.good_tortoise = c2.monst === moTortoise && tortoise_seek() && !tortoise_diff(tortoise_getb(c2)) && !c2.item;

    if (G.items[itOrbGravity]) {
      if (c2.monst && !should_switchplace(G.cwt.at, c2))
        G.gravity_state = get_static_gravity(G.cwt.at);
      else
        G.gravity_state = get_move_gravity(G.cwt.at, c2);
      if (G.gravity_state) markOrb(itOrbGravity);
    }

    if (againstRose(G.cwt.at, c2) && !scentResistant()) {
      if (this.vmsg(miRESTRICTED, siROSE, null!, moNone)) addMessage('Those roses smell too nicely. You have to come towards them.');
      return false;
    }

    if (G.items[itOrbDomination] > ORBBASE && isMountable(c2.monst) && this.fmsMove) {
      if (this.checkonly) { G.nextmovetype = lmMove; return true; }
      if (!isMountable(G.cwt.at.monst)) G.dragon_target = null!;
      movecost(G.cwt.at, c2, 3);

      G.flipplayer = true; if (G.multi_players > 1) G.multi_flipped[G.multi_cpid] = true;
      G.invismove = (G.turncount >= G.noiseuntil) && G.items[itOrbInvis] > 0;
      killFriendlyIvy();
      return this.perform_move_or_jump();
    }

    if (isActivable(c2) && this.fmsActivate) {
      if (this.checkonly) { G.nextmovetype = lmInstant; return true; }
      activateActiv(c2, true);
      return this.after_instant(false);
    }

    // CAP_COMPLEX2
    after_die0: if (c2.monst === moAnimatedDie) {
      this.mip = determinePush(G.cwt, this.subdir, (mi) => canPushThumperOn(mi, G.cwt.at));
      if (this.mip.proper()) {
        const tgt = dice_roll_effect(this.mip, dice_data_at(c2));
        if (tgt.happy() > 0) {
          pushedMonster = c2.monst;
          changes.ccell(c2);
          c2.monst = moNone;
          c2.wall = waRichDie;
        }
        else {
          if (markOrb(itOrbSlaying)) break after_die0;
          if (this.vmsg(miWALL, siWALL, c2, c2.monst))
            addMessage(XLAT('You can only push this die if the highest number would be on the top!'));
          return false;
        }
      }
      else if (this.mip.d === NO_SPACE) {
        if (markOrb(itOrbSlaying)) break after_die0;
        if (this.vmsg(miWALL, siWALL, c2, c2.monst))
          addMessage(XLAT('No room to push %the1.', spM(c2.monst)));
        return false;
      }
    }
    // after_die:
    while (true) {
      if (isPushable(c2.wall) && !c2.monst && !nonAdjacentPlayer(c2, G.cwt.at) && this.fmsMove) {
        this.mip = determinePush(G.cwt, this.subdir, (mi) => canPushThumperOn(mi, G.cwt.at));
        if (this.mip.t) changes.ccell(this.mip.t);
        if (this.mip.d === NO_SPACE) {
          if (isDie(c2.wall) && markOrb(itOrbSlaying)) {
            changes.ccell(c2);
            c2.monst = moAngryDie;
            c2.wall = waNone;
            continue; // goto after_die
          }
          if (this.vmsg(miWALL, siWALL, c2, moNone)) addMessage(XLAT('No room to push %the1.', spW(c2.wall)));
          return false;
        }
        G.nextmovetype = lmMove;
        if (pushedMonster === moNone) addMessage(XLAT('You push %the1.', spW(c2.wall)));
        else addMessage(XLAT('You push %the1.', spM(pushedMonster)));
        G.lastmovetype = lmPush; G.lastmove = G.cwt.at;
        pushThumper(this.mip);
        changes.push_push(this.mip.t);
        return this.perform_actual_move();
      }
      break;
    }

    if (c2.item === itHolyGrail && roundTableRadius(c2) < newRoundTableRadius()) {
      if (this.vmsg(miRESTRICTED, siITEM, c2, moNone)) addMessage(XLAT('That was not a challenge. Find a larger castle!'));
      return false;
    }

    if (c2.item === itOrbYendor && !this.checkonly && !G.peace_on && !itemHiddenFromSight(c2) && yendor_check(c2)) {
      return false;
    }

    if (isWatery(c2) && !nonAdjacentPlayer(G.cwt.at, c2) && !c2.monst && G.cwt.at.wall === waBoat && this.fmsMove)
      return this.boat_move();

    if (!c2.monst && G.cwt.at.wall === waBoat && G.cwt.at.item !== itOrbYendor && boatGoesThrough(c2) && markOrb(itOrbWater) && !nonAdjacentPlayer(c2, G.cwt.at) && this.fmsMove) {
      if (c2.item && collectItem(c2, G.cwt.at)) return true;
      changes.ccell(c2);
      placeWater(c2, G.cwt.at);
      moveBoat(this.mi); this.boatmove = true;
      return this.perform_actual_move();
    }

    return this.after_escape();
  }

  boat_move(): boolean {

    const c2 = this.mi.t;

    if (againstWind(c2, G.cwt.at)) {
      if (this.vmsg(miRESTRICTED, siWIND, c2, moNone)) blowaway_message(c2);
      return false;
    }

    if (againstCurrent(c2, G.cwt.at) && !markOrb(itOrbWater)) {
      if (markOrb(itOrbFish) || markOrb(itOrbAether) || G.gravity_state)
        return this.after_escape();
      if (this.vmsg(miRESTRICTED, siCURRENT, c2, moNone)) addMessage(XLAT('You cannot go against the current!'));
      return false;
    }

    if (G.cwt.at.item === itOrbYendor) {
      if (markOrb(itOrbFish) || markOrb(itOrbAether) || G.gravity_state)
        return this.after_escape();
      if (this.vmsg(miRESTRICTED, siITEM, c2, moNone)) addMessage(XLAT('The Orb of Yendor is locked in with powerful magic.'));
      return false;
    }

    G.nextmovetype = lmMove;
    moveBoat(this.mi);
    this.boatmove = true;
    return this.perform_actual_move();
  }

  tell_why_cannot_attack(): void {
    const c2 = this.mi.t;
    const cwt = G.cwt;
    if (c2.monst === moWorm || c2.monst === moWormtail || c2.monst === moWormwait)
      addMessage(XLAT('You cannot attack Sandworms directly!'));
    else if (c2.monst === moHexSnake || c2.monst === moHexSnakeTail)
      addMessage(XLAT('You cannot attack Rock Snakes directly!'));
    else if (nonAdjacentPlayer(c2, cwt.at))
      addMessage(XLAT('You cannot attack diagonally!'));
    else if (thruVine(c2, cwt.at))
      addMessage(XLAT('You cannot attack through the Vine!'));
    else if (c2.monst === moTentacle || c2.monst === moTentacletail || c2.monst === moTentaclewait || c2.monst === moTentacleEscaping)
      addMessage(XLAT('You cannot attack Tentacles directly!'));
    else if (c2.monst === moHedge && !markOrb(itOrbThorns)) {
      addMessage(XLAT('You cannot attack %the1 directly!', spM(c2.monst)));
      if (bow_crossbow_mode())
        addMessage(XLAT('Stab them by shooting around them.'));
      else
        addMessage(XLAT('Stab them by walking around them.'));
    }
    else if (c2.monst === moRoseBeauty || isBull(c2.monst) || c2.monst === moButterfly)
      addMessage(XLAT('You cannot attack %the1!', spM(c2.monst)));
    else if (c2.monst === moFlailer && !c2.stuntime) {
      addMessage(XLAT('You cannot attack %the1 directly!', spM(c2.monst)));
      addMessage(XLAT('Make him hit himself by walking away from him.'));
    }
    else if (c2.monst === moShadow)
      addMessage(XLAT('You cannot defeat the Shadow!'));
    else if (c2.monst === moGreater || c2.monst === moGreaterM)
      addMessage(XLAT('You cannot defeat the Greater Demon yet!'));
    else if (c2.monst === moDraugr)
      addMessage(XLAT('Your mundane weapon cannot hurt %the1!', spM(c2.monst)));
    else if (isRaider(c2.monst))
      addMessage(XLAT('You cannot attack Raiders directly!'));
    else if (isSwitch(c2.monst))
      addMessage(XLAT('You cannot attack Jellies in their wall form!'));
    else if (c2.monst === moAngryDie)
      addMessage(XLAT('This die is really angry at you!'));
    else if ((this.attackflags & AF_WEAK) && isIvy(c2))
      addMessage(XLAT('You are too weakened to attack %the1!', spM(c2.monst)));
    else if (isWorm(cwt.at.monst) && isWorm(c2.monst) && wormhead(cwt.at) === wormhead(c2) && cwt.at.monst !== moTentacleGhost && c2.monst !== moTentacleGhost)
      addMessage(XLAT('You cannot attack your own mount!'));
    else if (checkOrb(c2.monst, itOrbShield))
      addMessage(XLAT('A magical shield protects %the1!', spM(c2.monst)));
    else if (bow_crossbow_mode() && !G.bow_bump_to_shoot)
      addMessage(XLAT('You have no melee weapon!'));
    else if (bow_crossbow_mode() && G.items[itCrossbow])
      addMessage(XLAT('Your crossbow is still reloading!'));
    else if (bow_crossbow_mode())
      addMessage(XLAT('Trying to fire.'));
    else
      addMessage(XLAT('For some reason... cannot attack!'));
  }

  after_escape(): boolean {
    const c2 = this.mi.t;
    const cwt = G.cwt;

    const woods_used = G.orbused[itOrbWoods];

    let push_behind = c2.wall === waBigStatue || (among(c2.wall, waCTree, waSmallTree, waBigTree, waShrub, waVinePlant) && !c2.monst && markOrb(itOrbWoods));

    if (thruVine(c2, cwt.at) && markOrb(itOrbWoods)) push_behind = true;

    normal_aether_movement: if (push_behind && !c2.monst && !nonAdjacentPlayer(c2, cwt.at) && this.fmsMove) {
      const what = c2.wall;
      if (!thruVine(c2, cwt.at) && !canPushStatueOn(cwt.at, P_ISPLAYER)) {
        if (markOrb(itOrbAether)) {
          G.orbused[itOrbWoods] = woods_used;
          break normal_aether_movement;
        }
        if (this.vmsg(miRESTRICTED, siWALL, c2, moNone)) {
          if (isFire(cwt.at))
            addMessage(XLAT('You have to escape first!'));
          else
            addMessage(XLAT('There is not enough space!'));
        }
        return false;
      }

      changes.ccell(c2);
      changes.ccell(cwt.at);

      c2.wall = cwt.at.wall;
      c2.wparam = cwt.at.wparam;
      if (doesnotFall(cwt.at)) {
        cwt.at.wall = what;
        if (cellHalfvine(what))
          c2.wall = waNone, cwt.at.wall = waVinePlant;
      }

      G.nextmovetype = lmMove;
      addMessage(XLAT('You push %the1 behind you!', spW(what)));
      animateMovement(this.mi.rev(), LAYER_BOAT);
      changes.push_push(cwt.at);
      return this.perform_actual_move();
    }

    // normal_aether_movement:
    let attackable =
      c2.wall === waBigTree ||
      c2.wall === waSmallTree ||
      (c2.wall === waShrub && !!G.items[itOrbSlaying]) ||
      (c2.wall === waMirrorWall && !bow_crossbow_mode());
    if (attackable && markOrb(itOrbAether) && c2.wall !== waMirrorWall)
      attackable = false;
    const nm = attackable;
    if (G.forcedmovetype === fmAttack) attackable = true;
    attackable = attackable && (!c2.monst || isFriendly(c2));
    attackable = attackable && !nonAdjacentPlayer(cwt.at, c2);

    const dont_attack = G.items[itOrbFlash] || G.items[itOrbLightning];

    if (attackable && this.fmsAttack && !dont_attack && !G.items[itCurseWeakness]) {
      if (this.checkNeedMove(this.checkonly, true)) return false;
      G.nextmovetype = nm ? lmAttack : lmSkip;
      if (c2.wall === waSmallTree || (c2.wall === waBigTree && markOrb(itOrbSlaying))) {
        drawParticles(c2, winf[c2.wall].color, 4);
        addMessage(XLAT('You chop down the tree.'));
        playSound(c2, 'hit-axe' + pick123());
        changes.ccell(c2);
        c2.wall = waNone;
        spread_plague(cwt.at, c2, this.mi.d, moPlayer);
        return this.swing();
      }
      else if (c2.wall === waShrub && markOrb(itOrbSlaying)) {
        drawParticles(c2, winf[c2.wall].color, 4);
        addMessage(XLAT('You chop down the shrub.'));
        playSound(c2, 'hit-axe' + pick123());
        changes.ccell(c2);
        c2.wall = waNone;
        spread_plague(cwt.at, c2, this.mi.d, moPlayer);
        return this.swing();
      }
      else if (c2.wall === waBigTree) {
        drawParticles(c2, winf[c2.wall].color, 8);
        addMessage(XLAT('You start chopping down the tree.'));
        playSound(c2, 'hit-axe' + pick123());
        changes.ccell(c2);
        c2.wall = waSmallTree;
        return this.swing();
      }
      if (!G.peace_on && !bow_crossbow_mode()) {
        if (c2.wall === waMirrorWall)
          addMessage(XLAT('You swing your sword at the mirror.'));
        else if (c2.wall)
          addMessage(XLAT('You swing your sword at %the1.', spW(c2.wall)));
        else
          addMessage(XLAT('You swing your sword.'));
        return this.swing();
      }
      return false;
    }
    else if (c2.monst === moKnight) {
      // CAP_COMPLEX2
      if (this.vmsg(miWALL, siMONSTER, c2, c2.monst)) camelot_knightFlavorMessage(c2);
      return false;
    }
    else if (c2.monst && (!isFriendly(c2) || c2.monst === moTameBomberbird || isMountable(c2.monst)) && !(G.peace_on && !this.good_tortoise))
      return this.attack();
    else if (!passable(c2, cwt.at, P_USEBOAT | P_ISPLAYER | P_MIRROR | P_MONSTER)) {
      this.tell_why_impassable();
      return false;
    }
    else if (markOrb(itCurseFatigue) && G.items[itFatigue] + fatigue_cost(this.mi) > 10) {
      if (this.vmsg(miRESTRICTED, siFATIGUE, null!, moNone))
        addMessage(XLAT('You are too fatigued!'));
      return false;
    }
    else if (this.fmsMove)
      return this.move_if_okay();

    else return false;
  }

  move_if_okay(): boolean {
    const c2 = this.mi.t;
    const cwt = G.cwt;
    // CAP_COMPLEX2
    if (mine_marked_mine(c2) && !mine_safe() && !this.checkonly && warningprotection(XLAT('Are you sure you want to step there?')))
      return false;

    if (snakelevel(c2) <= snakelevel(cwt.at) - 2) {
      let can_leave = false;
      for (let i = 0; i < c2.type; i++) {
        const c3 = c2.move(i); if (!c3) continue;
        if (passable(c3, c2, P_ISPLAYER | P_MONSTER)) can_leave = true;
      }
      if (!can_leave && !this.checkonly && warningprotection(XLAT('Are you sure you want to step there?')))
        return false;
    }

    if (getOLR(c2.item, c2.land) === olrDangerous && !this.checkonly && warningprotection(XLAT('Collecting %the1 in %the2 can be dangerous -- are you sure?', spI(c2.item), spL(c2.land))))
      return false;

    if (switchplace_prevent(cwt.at, c2, this))
      return false;
    if (!this.checkonly && warningprotection_hit(do_we_stab_a_friend(this.mi, moPlayer)))
      return false;

    G.nextmovetype = lmMove;
    return this.perform_actual_move();
  }

  tell_why_impassable(): void {
    const c2 = this.mi.t;
    const cwt = G.cwt;
    if (nonAdjacentPlayer(cwt.at, c2)) {
      if (this.vmsg(miRESTRICTED, siWARP, c2, moNone)) addMessage(geosupport_football() < 2 ?
        XLAT('You cannot move between the cells without dots here!') :
        XLAT('You cannot move between the triangular cells here!'),
      );
    }
    else if (againstWind(c2, cwt.at)) {
      if (this.vmsg(miRESTRICTED, siWIND, c2, moNone))
        blowaway_message(c2);
    }
    else if (anti_alchemy(c2, cwt.at)) {
      if (this.vmsg(miRESTRICTED, siWALL, c2, moNone))
        addMessage(XLAT('Wrong color!'));
    }
    else if (c2.wall === waRoundTable) {
      if (this.vmsg(miRESTRICTED, siWALL, c2, moNone))
        addMessage(XLAT('It would be impolite to land on the table!'));
    }
    else if (snakelevel(cwt.at) >= 3 && snakelevel(c2) === 0 && !isWall(c2)) {
      if (this.vmsg(miRESTRICTED, siWALL, cwt.at, moNone))
        addMessage(XLAT('You would get hurt!', spW(c2.wall)));
    }
    else if (cellEdgeUnstable(cwt.at) && cellEdgeUnstable(c2)) {
      if (this.vmsg(miRESTRICTED, siGRAVITY, c2, moNone))
        addMessage(XLAT('Gravity does not allow this!'));
    }
    else if (c2.land === laDual && pseudohept(c2)) {
      if (this.vmsg(miRESTRICTED, siWALL, c2, moNone))
        addMessage(XLAT('You cannot move there!'));
    }
    else if (!c2.wall) {
      if (this.vmsg(miRESTRICTED, siUNKNOWN, c2, moNone))
        addMessage(XLAT('You cannot move there!'));
    }
    else {
      if (this.vmsg(miWALL, siWALL, c2, moNone))
        addMessage(XLAT('You cannot move through %the1!', spW(c2.wall)));
    }
  }

  attack(): boolean {
    const c2 = this.mi.t;
    const cwt = G.cwt;
    if (!this.fmsAttack) return false;

    if ((G.items[itOrbFlash] || G.items[itOrbLightning]) && !this.good_tortoise)
      return false;

    this.attackflags = AF_NORMAL;
    if (G.items[itOrbSpeed] & 1) this.attackflags |= AF_FAST;
    if (G.items[itOrbSlaying]) this.attackflags |= AF_CRUSH;
    if (G.items[itCurseWeakness]) this.attackflags |= AF_WEAK;

    const ca = bow_crossbow_mode() ? this.good_tortoise : canAttack(cwt.at, moPlayer, c2, c2.monst, this.attackflags);

    if (!ca) {
      if (G.forcedmovetype === fmAttack) {
        if (monstersnear_add_pmi(new player_move_info(movei.sd(cwt.at, STAY)))) {
          if (this.vmsg_threat()) wouldkill('%The1 would get you!');
          return false;
        }
        G.nextmovetype = lmSkip;
        addMessage(XLAT('You swing your sword at %the1.', spM(c2.monst)));
        return this.swing();
      }
      if (this.vmsg(miENTITY, siMONSTER, c2, c2.monst)) this.tell_why_cannot_attack();
      return false;
    }

    // mip.t=c2 means that the monster is not destroyed and thus
    // still counts for lightning in monstersnear

    this.mip = new movei(c2, null!, NO_SPACE);

    if (G.items[itCurseWeakness] || (isStunnable(c2.monst) && c2.hitpoints > 1)) {
      if (monsterPushable(c2))
        this.mip = determinePush(cwt, this.subdir, (mi) => passable(mi.t, mi.s, P_BLOW));
      else
        this.mip.t = c2;
      if (this.mip.t) changes.ccell(this.mip.t);
      changes.push_push(this.mip.t);
    }

    if (!(isWatery(cwt.at) && c2.monst === moWaterElemental) && this.checkNeedMove(this.checkonly, true))
      return false;

    if (c2.monst === moTameBomberbird && warningprotection_hit(moTameBomberbird)) return false;

    G.nextmovetype = lmAttack;

    mirror_act(this.origd, mirror_SPINMULTI | mirror_ATTACK);

    const tk = tkills();
    G.plague_kills = 0;

    if (this.good_tortoise) {
      changes.ccell(c2);
      c2.stuntime = 2;
      changes.at_commit(() => {
        G.items[itBabyTortoise] += (ls_hv_structure() ? 9 : 4);
        updateHi(itBabyTortoise, G.items[itBabyTortoise]);
        c2.item = itBabyTortoise;
        G.tortoise_babymap.set(c2, G.tortoise_seekbits);
        tortoise_hero_message(c2);
        achievement_collection(itBabyTortoise);
      });
    }
    else {
      const m = c2.monst;
      if (m) {
        if ((this.attackflags & AF_CRUSH) && !canAttack(cwt.at, moPlayer, c2, c2.monst, this.attackflags ^ AF_CRUSH ^ AF_MUSTKILL))
          markOrb(itOrbSlaying);
        if (c2.monst === moTerraWarrior && hrand(100) > 2 * G.items[itTerra]) {
          if (hrand(2 + G.jiangshi_on_screen) < 2)
            changes.value_add(G, 'wandering_jiangshi', 1);
        }
        attackMonster(c2, this.attackflags | AF_MSG, moPlayer);
        if (m === moRusalka) rusalka_curse();
        changes.ccell(c2);
        // salamanders are stunned for longer time when pushed into a wall
        if (c2.monst === moSalamander && (this.mip.t === c2 || !this.mip.t)) c2.stuntime = 10;
        if (!c2.monst || isAnyIvy(m)) {
          spread_plague(cwt.at, c2, this.mi.d, moPlayer);
          produceGhost(c2, m, moPlayer);
        }
        if (this.mip.proper()) pushMonster(this.mip);
        animateCorrectAttack(this.mi, LAYER_SMALL, moPlayer);
      }
    }

    sideAttack(G.cwt.at, this.d, moPlayer, tkills() - tk - G.plague_kills);
    G.lastmovetype = lmAttack; G.lastmove = c2;
    swordAttackStatic();

    if (monstersnear_add_pmi(new player_move_info(movei.sd(G.cwt.at, STAY)))) {
      if (this.vmsg_threat()) wouldkill('You would be killed by %the1!');
      return false;
    }
    if (this.checkonly) return true;
    if (changes.on) changes.commit();

    return this.after_move();
  }

  perform_actual_move(): boolean {
    const c2 = this.mi.t;
    changes.at_commit(() => {
      G.flipplayer = true; if (G.multi_players > 1) G.multi_flipped[G.multi_cpid] = true;
    });
    if (c2.item && isAlch(c2)) {
      if (alchMayDuplicate(G.cwt.at.wall)) {
        c2.wall = conditional_flip_slime(this.mi.mirror(), G.cwt.at.wall);
        c2.wparam = G.cwt.at.wparam;
      }
      else
        c2.wall = waNone;
    }
    // CAP_COMPLEX2
    if (c2.wall === waRoundTable) {
      addMessage(XLAT('You jump over the table!'));
    }

    if (G.cwt.at.wall === waRoundTable)
      camelot_roundTableMessage(c2);

    G.invismove = (G.turncount >= G.noiseuntil) && G.items[itOrbInvis] > 0;

    if (G.items[itOrbFire]) {
      G.invismove = false;
      if (makeflame(G.cwt.at, 10, false)) markOrb(itOrbFire);
    }

    if (G.items[itCurseWater]) {
      G.invismove = false;
      if (makeshallow(this.mi.s, 10, false)) markOrb(itCurseWater);
    }

    if (markOrb(itCurseFatigue) && !markOrb(itOrbAether))
      G.items[itFatigue] += fatigue_cost(this.mi);

    this.handle_friendly_ivy();

    if (G.items[itOrbDigging]) {
      if (earthMove(this.mi)) {
        G.invismove = false;
        markOrb(itOrbDigging);
      }
    }

    movecost(G.cwt.at, c2, 1);

    if (!this.boatmove && collectItem(c2, G.cwt.at)) return true;
    if (doPickupItemsWithMagnetism(c2)) return true;

    if (isIcyLand(G.cwt.at) && G.cwt.at.wall === waNone && markOrb(itOrbWinter)) {
      G.invismove = false;
      G.cwt.at.wall = waIcewall;
    }

    if (winter_collect(c2)) return true;

    movecost(G.cwt.at, c2, 2);

    const sp = { v: this.switchplaces };
    handle_switchplaces(G.cwt.at, c2, sp);
    this.switchplaces = sp.v;

    return this.perform_move_or_jump();
  }

  handle_friendly_ivy(): void {
    const c2 = this.mi.t;
    const cwt = G.cwt;
    let haveIvy = false;
    for (let i = 0; i < cwt.at.type; i++) {
      const c3 = cwt.at.move(i); if (!c3) continue;
      if (c3.monst === moFriendlyIvy) haveIvy = true;
    }

    let killIvy = haveIvy;

    if (G.items[itOrbNature]) {
      if (c2.monst !== moFriendlyIvy && strictlyAgainstGravity(c2, cwt.at, false, MF_IVY)) {
        G.invismove = false;
      }
      else if (cwt.at.monst) G.invismove = false;
      else if (haveIvy || !cellEdgeUnstable(cwt.at, MF_IVY)) {
        cwt.at.monst = moFriendlyIvy;
        cwt.at.mondir = neighborId(cwt.at, c2);
        G.invismove = false;
        markOrb(itOrbNature);
        killIvy = false;
      }
    }

    if (killIvy) killFriendlyIvy();
  }

  perform_move_or_jump(): boolean {
    G.lastmovetype = lmMove; G.lastmove = G.cwt.at;
    apply_chaos();

    stabbingAttack(this.mi, moPlayer);
    keep_cwt();
    G.cwt.addStep();

    mirror_act(this.origd, mirror_SPINMULTI | mirror_ATTACK | mirror_GO);

    const pmi = new player_move_info(this.mi);
    playerMoveEffects(this.mi);

    if (this.mi.t.monst === moFriendlyIvy) changes.ccell(this.mi.t), this.mi.t.monst = moNone;

    if (monstersnear_add_pmi(pmi)) {
      if (this.vmsg_threat()) wouldkill('%The1 would kill you there!');
      return false;
    }

    if (this.checkonly) return true;
    if (changes.on) changes.commit();

    if (this.switchplaces) {
      indAnimateMovement(this.mi, LAYER_SMALL);
      indAnimateMovement(this.mi.rev(), LAYER_SMALL);
      commitAnimations(LAYER_SMALL);
    }
    else
      animateMovement(this.mi, LAYER_SMALL);
    // current_display->which_copy = current_display->which_copy * adj(mi);  (graphics)

    countLocalTreasure();
    G.landvisited[G.cwt.at.land] = true;
    afterplayermoved();

    return this.after_move();
  }

  stay(): boolean {
    if (G.items[itOrbGravity]) {
      G.gravity_state = get_static_gravity(G.cwt.at);
      if (G.gravity_state) markOrb(itOrbGravity);
    }
    G.lastmovetype = lmSkip; G.lastmove = null!;
    if (this.checkNeedMove(this.checkonly, false))
      return false;
    swordAttackStatic();
    G.nextmovetype = lmSkip;

    this.mi = movei.sd(G.cwt.at, STAY);
    if (G.last_gravity_state && !G.gravity_state)
      playerMoveEffects(this.mi);
    if (this.d === -2)
      dropGreenStone(G.cwt.at);

    G.items[itFatigue] -= 5;
    if (G.items[itFatigue] < 0)
      G.items[itFatigue] = 0;

    if (monstersnear_add_pmi(new player_move_info(this.mi))) {
      if (this.vmsg_threat()) wouldkill('%The1 would get you!');
      return false;
    }
    if (this.checkonly) return true;
    if (changes.on) changes.commit();
    if (cellUnstable(G.cwt.at) && !markOrb(itOrbAether))
      doesFallSound(G.cwt.at);

    return this.after_move();
  }
}

/** #define DEFAULTCONTROL (multi::players == 1 && !shmup::on && !multi::alwaysuse) (hyper.h) */
export function DEFAULTCONTROL(): boolean {
  // the online game (port only): each browser plays one player with the single-player controls
  return (G.multi_players === 1 || G.online_lockstep) && !G.shmup_on && !G.multi_alwaysuse;
}

/** movepcto(int d, int subdir IS(1), bool checkonly IS(false)) */
export function movepcto(d: number, subdir = 1, checkonly = false): boolean {
  // the online game (port only, ONLINE.md): the player's move becomes the local seat's decision
  if (G.online_input && !checkonly) return G.online_input(d, subdir, null);
  G.checked_move_issue.type = miVALID;
  const pcm = new pcmove();
  pcm.checkonly = checkonly;
  pcm.d = d;
  pcm.subdir = subdir;
  const b = pcm.movepcto();
  G.global_pushto = pcm.mip.t;
  if (!checkonly && !b && G.multi_players === 1) {
    G.attempts++;
    if (G.attempts === 3) {
      G.attempts = 0;
      checkmove(true);
      G.movehints_ticks = G.ticks + 1000;
      if (G.legalmoves[G.cwt.at.type]) {
        if (!DEFAULTCONTROL()) addMessage(XLAT('You can skip your turn.'));
        else if (G.vid.mobilecompasssize) addMessage(XLAT('Click the center of the compass to skip your turn.'));
        else if (G.dialog_display_keys === 3) addMessage(XLAT('Press Ⓐ to skip your turn.'));
        else if (dialog_actual_display_keys()) addMessage(XLAT('Press . or s to skip your turn.'));
        else addMessage(XLAT('Click the Rogue to skip your turn.'));
        if (among(G.cwt.at.land, laPalace, laCaves, laWarpCoast, laWarpSea))
          addMessage(XLAT('Wait about 100 turns to let the ghosts decide your fate.'));
      }
      if (G.orb_used_where.size === 1)
        addMessage(XLAT('You can use your %1.\n', spI(sortedKeys(G.orb_used_where)[0])));
      else if (G.orb_used_where.size > 1) {
        let txt = '';
        for (const x of sortedKeys(G.orb_used_where)) { if (txt !== '') txt += ', '; txt += dnameof_i(x); }
        addMessage(XLAT('You can use: %1.\n', txt));
      }
      if (G.orb_used_where.size) addMessage(ranged_click_help());
      if (G.bowtarget && G.bowtarget.cpdist >= 2) addMessage(XLAT('You have a bow target.'));
    }
  }
  return b;
}

/** inline bool movepcto(const movedir& md) */
export function movepcto_md(md: movedir): boolean { return movepcto(md.d, md.subdir); }

export function copy_metadata(x: cell, y: gcell_copy): void {
  x.wall = y.wall;
  x.monst = y.monst;
  x.item = y.item;
  x.mondir = y.mondir;
  x.stuntime = y.stuntime;
  x.hitpoints = y.hitpoints;
  x.monmirror = y.monmirror;
  x.LHU.landpar = y.landpar;
  // if(isIcyLand(x)) x->landparam = y->landparam;  -- the LHU assignment above already copied it
  x.wparam = y.wparam;
}

/** Auxiliary function for apply_chaos(). Returns whether the cell attribute LHU should be switched. */
function switch_lhu_in(l: eLand): boolean {
  return among(l, laBrownian, laMinefield, laTerracotta, laHive);
}

/** how should be the direction from 'src' be mirrored to 'dst' */
export function chaos_mirror_dir(dir: number, src: cellwalker, dst: cellwalker): number {
  if (dir >= dst.at.type) return dir;
  return dst.minus(src.to_spin(dir)).spin;
}

/** template<class T> void swap_data(T& data, cell *c1, cell *c2), for maps keyed by cell */
export function swap_data<V>(data: Map<cell, V>, c1: cell, c2: cell): void {
  changes.map_value(data, c1);
  changes.map_value(data, c2);
  if (data.has(c1) && data.has(c2)) {
    const t = data.get(c1)!; data.set(c1, data.get(c2)!); data.set(c2, t);
  }
  else if (data.has(c1)) { data.set(c2, data.get(c1)!); data.delete(c1); }
  else if (data.has(c2)) { data.set(c1, data.get(c2)!); data.delete(c2); }
}

/** Apply the Orb of Chaos. We assume that the player moves from cwt.peek, in the direction given by cwt.spin. */
function apply_chaos(): void {
  const wa = G.cwt.plus(1).addStep();
  const wb = G.cwt.minus(1).addStep();
  const ca = wa.at;
  const cb = wb.at;
  if (dice_swap_forbidden(ca, cb)) return;
  if (dice_swap_forbidden(cb, ca)) return;
  if (!G.items[itOrbChaos] || chaos_forbidden(ca) || chaos_forbidden(cb)) return;
  if (ca && is_paired(ca.monst)) killMonster(ca, moPlayer);
  if (cb && is_paired(cb.monst)) killMonster(cb, moPlayer);
  destroyTrapsOn(ca);
  destroyTrapsOn(cb);
  if (ca.wall === waStone) destroyTrapsAround(ca);
  if (cb.wall === waStone) destroyTrapsAround(cb);
  changes.ccell(ca);
  changes.ccell(cb);
  /* needs to be called separately for Shadows */
  if (ca.monst === moShadow) checkStunKill(ca);
  if (cb.monst === moShadow) checkStunKill(cb);
  const coa = gcell_snapshot(ca);
  const cob = gcell_snapshot(cb);
  if (ca.monst !== cb.monst)
    markOrb(itOrbChaos);
  if (ca.wall !== cb.wall)
    markOrb(itOrbChaos);
  if (ca.item !== cb.item)
    markOrb(itOrbChaos);
  copy_metadata(ca, cob);
  copy_metadata(cb, coa);

  ca.item = coa.item;
  cb.item = cob.item;
  moveItem(ca, cb, false);

  if (!switch_lhu_in(ca.land)) ca.LHU.landpar = coa.landpar;
  if (!switch_lhu_in(cb.land)) cb.LHU.landpar = cob.landpar;
  if (ca.monst && !(isFriendly(ca) && markOrb(itOrbEmpathy))) {
    ca.stuntime = Math.min(ca.stuntime + 3, 15), markOrb(itOrbChaos);
    checkStunKill(ca);
  }
  if (cb.monst && !(isFriendly(cb) && markOrb(itOrbEmpathy))) {
    cb.stuntime = Math.min(cb.stuntime + 3, 15), markOrb(itOrbChaos);
    checkStunKill(cb);
  }
  ca.monmirror = ca.monmirror ? 0 : 1;
  cb.monmirror = cb.monmirror ? 0 : 1;
  ca.mondir = chaos_mirror_dir(ca.mondir, wb, wa);
  cb.mondir = chaos_mirror_dir(cb.mondir, wa, wb);
  if (isPrincess(ca) && !isPrincess(cb))
    princess_move(new movei(cb, ca, JUMP));
  if (isPrincess(cb) && !isPrincess(ca))
    princess_move(new movei(ca, cb, JUMP));
  if (ca.monst === moTortoise || cb.monst === moTortoise) {
    tortoise_move_adult(ca, cb);
  }
  if (dice_on(ca) || dice_on(cb)) {
    dice_chaos_swap(wa, wb);
  }
}

function blowaway_message(c2: cell): void {
  addMessage(airdist(c2) < 3 ? XLAT('The Air Elemental blows you away!') : XLAT('You cannot go against the wind!'));
}

export function tortoise_hero_message(c2: cell): void {
  const fem = playergender() === GEN_F;
  playSound(c2, fem ? 'heal-princess' : 'heal-prince');
  addMessage(fem ? XLAT('You are now a tortoise heroine!') : XLAT('You are now a tortoise hero!'));
}

export function rusalka_curse(): void {
  changes.ccell(G.cwt.at);
  if (G.cwt.at.wall === waNone) G.cwt.at.wall = waShallow;
  else if (G.cwt.at.wall === waShallow || isAlch(G.cwt.at.wall)) G.cwt.at.wall = waDeepWater;
}

export function chaos_forbidden(c: cell): boolean {
  return do_not_touch_this_wall(c) || isMultitile(c.monst);
}

export function fatigue_cost(mi: movei): number {
  return gravityLevelDiff(mi.t, mi.s) +
    (snakelevel(mi.t) - snakelevel(mi.s)) +
    (againstWind(mi.s, mi.t) ? 0 : 1);
}

function alchMayDuplicate(w: eWall): boolean {
  return !isDie(w) && w !== waBoat && w !== waArrowTrap;
}

export function winter_collect(c2: cell): boolean {
  let qty = 0;
  if (G.items[itOrbWinter])
    for (let i = 0; i < c2.type; i++) {
      const c3 = c2.move(i); if (!c3) continue;
      if (c3.wall === waIcewall && c3.item) {
        changes.ccell(c3);
        markOrb(itOrbWinter);
        const it = c3.item;
        if (collectItem(c3, G.cwt.at)) qty++;
        if (!c3.item)
          animate_item_throw(c3, c2, it);
      }
    }
  return !!qty;
}

export function warningprotection(_s: string): boolean {
  if (G.hardcore) return false;
  if (multi_activePlayers() > 1) return false;
  if (G.items[itWarning]) return false;
  G.warning_shown = true;
  // pushScreen(the WARNING dialog with YES (items[itWarning] = 1) / NO): UI, a later stage
  return true;
}

export function warningprotection_hit(m: eMonster): boolean {
  if (G.warn_before_killing_friends < (m === moTameBomberbird ? 1 : 2)) return false;
  if (m && warningprotection(XLAT('Are you sure you want to hit %the1?', spM(m))))
    return true;
  return false;
}

export function playerInWater(): boolean {
  for (const i of player_indices())
    if (isWatery(playerpos(i)) && !playerInBoat(i))
      return true;
  return false;
}

export function numplayers(): number {
  return G.multi_players;
}

export function player_positions(): cell[] {
  const res: cell[] = [];
  for (let i = 0; i < numplayers(); i++)
    if (multi_playerActive(i))
      res.push(playerpos(i));
  return res;
}

export function player_indices(): number[] {
  const res: number[] = [];
  for (let i = 0; i < numplayers(); i++)
    if (multi_playerActive(i))
      res.push(i);
  return res;
}

export function playerpos(i: number): cell {
  if (G.shmup_on) return shmup_playerpos(i);
  if (G.multi_players > 1) return G.multi_player[i].at;
  return singlepos();
}

export function allPlayersInBoats(): boolean {
  for (const pc of player_positions())
    if (pc.wall !== waBoat) return true;
  return false;
}

export function whichPlayerOn(c: cell): number {
  if (singleused()) return c === singlepos() ? 0 : -1;
  for (const i of player_indices())
    if (playerpos(i) === c) return i;
  return -1;
}

export function isPlayerOn(c: cell): boolean {
  return whichPlayerOn(c) >= 0;
}

/** isPlayerInBoatOn(cell *c, int i) and isPlayerInBoatOn(cell *c): one function, i optional */
export function isPlayerInBoatOn(c: cell, i?: number): boolean {
  if (i === undefined) {
    for (let i = 0; i < numplayers(); i++) if (isPlayerInBoatOn(c, i)) return true;
    return false;
  }
  return (playerpos(i) === c && (
    c.wall === waBoat || c.wall === waStrandedBoat || (G.shmup_on && shmup_playerInBoat(i))
  ));
}

export function playerInBoat(i: number): boolean {
  return isPlayerInBoatOn(playerpos(i), i);
}

export function playerInPower(): boolean {
  if (singleused())
    return singlepos().land === laPower || singlepos().land === laHalloween;
  for (const pc of player_positions())
    if (pc.land === laPower || pc.land === laHalloween)
      return true;
  return false;
}

export function playerMoveEffects(mi: movei): void {
  const c1 = mi.s;
  const c2 = mi.t;

  if (G.peace_on) G.items[itOrbSword] = c2.land === laBurial ? 100 : 0;

  const cpid = G.multi_cpid;
  changes.value_keep(G.sword_dir, cpid);
  G.sword_dir[cpid] = sword_shift(mi, G.sword_dir[cpid]);

  destroyWeakBranch(c1, c2, moPlayer);

  // CAP_COMPLEX2
  mine_uncover_full(c2);

  if ((c2.wall === waClosePlate || c2.wall === waOpenPlate) && normal_gravity_at(c2) && !markOrb(itOrbAether))
    toggleGates_w(c2, c2.wall);

  if (c2.wall === waArrowTrap && c2.wparam === 0 && normal_gravity_at(c2) && !markOrb(itOrbAether))
    activateArrowTrap(c2);

  if (c2.wall === waFireTrap && c2.wparam === 0 && normal_gravity_at(c2) && !markOrb(itOrbAether)) {
    playSound(c2, 'click');
    changes.ccell(c2);
    c2.wparam = 1;
  }

  if (c2.wall === waReptile)
    c2.wparam = -1;

  princess_playernear(c2);

  if (c2.wall === waGlass && G.items[itOrbAether] > ORBBASE + 1) {
    addMessage(XLAT('Your Aether powers are drained by %the1!', spW(c2.wall)));
    drainOrb(itOrbAether, 2);
  }

  if (cellUnstable(c2) && !markOrb(itOrbAether)) {
    doesFallSound(c2);
    if (c2.land === laMotion && c2.wall === waChasm) c2.mondir = mi.rev_dir_or(NODIR);
  }

  if (c2.wall === waStrandedBoat && markOrb(itOrbWater))
    c2.wall = waBoat;

  if (c2.land === laOcean && c2.wall === waBoat && c2.landparam < 30 && markOrb(itOrbWater))
    c2.landparam = 40;

  if ((c2.land === laHauntedWall || c2.land === laHaunted) && !G.hauntedWarning) {
    changes.value_set(G, 'hauntedWarning', true);
    addMessage(XLAT('You become a bit nervous...'));
    addMessage(XLAT('Better not to let your greed make you stray from your path.'));
    playSound(c2, 'nervous');
  }
}

export function afterplayermoved(): void {
  pregen();
  if (!G.racing_on)
    setdist(G.cwt.at, 7 - getDistLimit() - G.genrange_bonus, G.cwt.peek());
  prairie_treasures();
  if (G.generatingEquidistant) {
    printf('Warning: generatingEquidistant set to true\n');
    G.generatingEquidistant = false;
  }
}

export function produceGhost(c: cell, victim: eMonster, who: eMonster): void {
  if (who !== moPlayer && !G.items[itOrbEmpathy]) return;
  if (markOrb(itOrbUndeath) && !c.monst && isGhostable(victim)) {
    changes.ccell(c);
    c.monst = moFriendlyGhost, c.stuntime = 0;
    if (who !== moPlayer) markOrb(itOrbEmpathy);
  }
}

export function swordAttack(mt: cell, who: eMonster, c: cell, bb: number): boolean {
  const m = c.monst;
  if (c.wall === waCavewall) markOrb(bb ? itOrbSword2 : itOrbSword);
  if (among(c.wall, waSmallTree, waBigTree, waRose, waCTree, waVinePlant, waBigBush, waSmallBush, waSolidBranch, waWeakBranch, waShrub)
    || thruVine(mt, c)) {
    changes.ccell(c);
    playSound(null!, 'hit-axe' + pick123());
    markOrb(bb ? itOrbSword2 : itOrbSword);
    drawParticles(c, winf[c.wall].color, 16);
    addMessage(XLAT('You chop down %the1.', spW(c.wall)));
    destroyHalfvine(c);
    c.wall = waNone;
  }
  if (c.wall === waBarrowDig) {
    changes.ccell(c);
    playSound(null!, 'hit-axe' + pick123());
    markOrb(bb ? itOrbSword2 : itOrbSword);
    drawParticles(c, winf[c.wall].color, 16);
    c.wall = waNone;
  }
  if (c.wall === waBarrowWall && G.items[itBarrow] >= 25) {
    changes.ccell(c);
    playSound(null!, 'hit-axe' + pick123());
    markOrb(bb ? itOrbSword2 : itOrbSword);
    drawParticles(c, winf[c.wall].color, 16);
    c.wall = waNone;
  }
  if (c.wall === waExplosiveBarrel)
    explodeBarrel(c);
  if (!G.peace_on && isPlayerOn(c) && whichPlayerOn(c) !== G.multi_cpid && !markOrb(itOrbEmpathy)) killThePlayer(moPlayer, whichPlayerOn(mt), 0n);
  if (!G.peace_on && mt === c && !markOrb(itOrbEmpathy)) killThePlayer(moPlayer, G.multi_cpid, 0n);
  if (!G.peace_on && canAttack(mt, who, c, m, AF_SWORD)) {
    changes.ccell(c);
    markOrb(bb ? itOrbSword2 : itOrbSword);
    const k = tkills();
    attackMonster(c, AF_NORMAL | AF_MSG | AF_SWORD, who);
    if (c.monst === moShadow) c.monst = moNone;
    produceGhost(c, m, who);
    if (tkills() > k) return true;
  }
  return false;
}

/** swordAttackStatic(int bb) and swordAttackStatic(): one function, bb optional */
export function swordAttackStatic(bb?: number): void {
  if (bb === undefined) {
    for (let bb = 0; bb < 2; bb++)
      if (sword_orbcount(bb !== 0))
        swordAttackStatic(bb);
    return;
  }
  swordAttack(G.cwt.at, moPlayer, sword_pos_n(G.multi_cpid, bb !== 0), bb);
}

export function spread_plague(mf: cell, mt: cell, dir: number, who: eMonster): void {
  if (!G.items[itOrbPlague]) return;
  if (who !== moPlayer && !G.items[itOrbEmpathy]) return;
  for (let i = 0; i < mt.type; i++) {
    const mx = mt.move(i); if (!mx) continue;
    if (celldistance(mx, mf) > celldistance(mx, mf.modmove(dir)) && celldistance(mx, mf) <= 4) {
      sideAttackAt(mf, dir, mx, who, itOrbPlague, mt);
    }
  }
}

export function sideAttackAt(mf: cell, dir: number, mt: cell, who: eMonster, orb: eItem, pf: cell): void {
  const m = mt.monst;
  let f = AF_SIDE;
  if (orb === itOrbPlague) f |= AF_PLAGUE;
  if (G.items[itOrbSlaying]) f |= AF_CRUSH;
  if (!G.items[orb]) return;
  const plague_particles = (): void => {
    if (orb === itOrbPlague) {
      for (let i = 0; i < 16; i++)
        drawDirectionalParticle(pf, neighborId(pf, mt), (i & 1) ? orb_auxiliary_color(orb) : iinf[orb].color);
    }
  };
  if (canAttack(mf, who, mt, m, f)) {
    if ((f & AF_CRUSH) && !canAttack(mf, who, mt, m, AF_SIDE | AF_MUSTKILL))
      markOrb(itOrbSlaying);
    markOrb(orb);
    changes.ccell(mt);
    plague_particles();
    if (who !== moPlayer) markOrb(itOrbEmpathy);
    let kk = 0;
    if (orb === itOrbPlague) kk = tkills();
    if (attackMonster(mt, AF_NORMAL | f | AF_MSG, who) || isAnyIvy(m)) {
      G.hit_anything = true;
      if (orb === itOrbPlague && kk < tkills())
        G.plague_kills++;
      if (mt.monst !== m) spread_plague(mf, mt, dir, who);
      produceGhost(mt, m, who);
    }
  }
  else if (mt.wall === waSmallTree) {
    changes.ccell(mt);
    plague_particles();
    markOrb(orb);
    mt.wall = waNone;
    spread_plague(mf, mt, dir, who);
    G.hit_anything = true;
  }
  else if (mt.wall === waShrub && markEmpathy(itOrbSlaying)) {
    changes.ccell(mt);
    plague_particles();
    markOrb(orb);
    mt.wall = waNone;
    spread_plague(mf, mt, dir, who);
    G.hit_anything = true;
  }
  else if (mt.wall === waBigTree) {
    changes.ccell(mt);
    plague_particles();
    markOrb(orb);
    mt.wall = waSmallTree;
    G.hit_anything = true;
  }
  else if (mt.wall === waExplosiveBarrel && orb !== itOrbPlague) {
    changes.ccell(mt);
    explodeBarrel(mt);
    G.hit_anything = true;
  }
}

/** sideAttack(cell *mf, int dir, eMonster who, int bonus, eItem orb) */
export function sideAttack_i(mf: cell, dir: number, who: eMonster, bonus: number, orb: eItem): void {
  if (!G.items[orb]) return;
  if (who !== moPlayer && !G.items[itOrbEmpathy]) return;
  for (const k of [-1, 1]) {
    let dir1 = dir + k * bonus;
    dir1 = mf.c.fix(dir1);
    const mt = mf.move(dir1);
    sideAttackAt(mf, dir1, mt, who, orb, mf);
  }
}

/** sideAttack(cell *mf, int dir, eMonster who, int bonuskill) */
export function sideAttack(mf: cell, dir: number, who: eMonster, bonuskill: number): void {

  let k = tkills();
  G.plague_kills = 0;
  sideAttack_i(mf, dir, who, 1, itOrbSide1);
  sideAttack_i(mf, dir, who, 2, itOrbSide2);
  sideAttack_i(mf, dir, who, 3, itOrbSide3);
  k += G.plague_kills;

  if (who === moPlayer) {
    const kills = tkills() - k + bonuskill;
    if (kills >= 5) achievement_gain_once('MELEE5');
  }
}

export function do_we_stab_a_friend(mi: movei, who: eMonster): eMonster {
  let m = moNone;
  do_swords(mi, who, (c: cell, _bb: number) => {
    if (!G.peace_on && canAttack(mi.t, who, c, c.monst, AF_SWORD) && c.monst && isFriendly(c)) m = c.monst;
  });

  for (let t = 0; t < mi.s.type; t++) {
    const c = mi.s.move(t);
    if (!c) continue;

    let stabthere = false;
    if (logical_adjacent(mi.t, who, c)) stabthere = true;

    if (stabthere && canAttack(mi.t, who, c, c.monst, AF_STAB) && isFriendly(c))
      return c.monst;
  }

  return m;
}

export function wouldkill(msg: string): void {
  if (G.who_kills_me === moWarning)
    addMessage(XLAT('This move appears dangerous -- are you sure?'));
  else if (G.who_kills_me === moFireball)
    addMessage(XLAT('Cannot move into the current location of another player!'));
  else if (G.who_kills_me === moAirball)
    addMessage(XLAT('Players cannot get that far away!'));
  else if (G.who_kills_me === moTongue)
    addMessage(XLAT('Cannot push into another player!'));
  else if (G.who_kills_me === moCrushball)
    addMessage(XLAT('Cannot push into the same location!'));
  else
    addMessage(XLAT(msg, spM(G.who_kills_me)));
}

export function movecost(from: cell, to: cell, phase: number): void {
  if (from.land === laPower && to.land !== laPower && (phase & 1)) {
    let n = 0;
    for (let i = 0; i < ittypes; i++)
      if (itemclass(i) === IC_ORB && G.items[i] >= 2 && i !== itOrbFire)
        G.items[i] = 2, n++;
    if (n)
      addMessage(XLAT('As you leave, your powers are drained!'));
  }

  // CAP_TOUR
  if (from.land !== to.land && G.tour_on && (phase & 2)) {
    changes.at_commit(() => { tour_checkGoodLand(to.land); });
  }

  if (to.land === laCrossroads4 && !G.geometry && (phase & 2) && !G.cheater) {
    achievement_gain_once('CR4');
    changes.value_set(G, 'chaosUnlocked', true);
  }

  if (isHaunted(from.land) && !isHaunted(to.land) && (phase & 2)) {
    updateHi(itLotus, G.truelotus = G.items[itLotus]);
    if (G.items[itLotus] >= 1) achievement_gain_once('LOTUS1');
    if (G.items[itLotus] >= (big_unlock() ? 25 : 10)) achievement_gain_once('LOTUS2');
    if (G.items[itLotus] >= (big_unlock() ? 50 : 25)) achievement_gain_once('LOTUS3');
    if (G.items[itLotus] >= 50 && !big_unlock()) achievement_gain_once('LOTUS4');
    achievement_final(false);
  }

  if (G.geometry === gNormal && celldist(to) === 0 && !G.usedSafety && gold() >= 100 && (phase & 2))
    achievement_gain_once('COMEBACK');

  const tortoiseOK =
    to.land === from.land || to.land === laTortoise ||
    (to.land === laDragon && from.land !== laTortoise) ||
    ls_any_chaos();

  if (tortoise_seek() && !from.item && !tortoiseOK && passable(from, null!, 0n) && (phase & 2)) {
    changes.ccell(from);
    changes.map_value(G.tortoise_babymap, from);
    from.item = itBabyTortoise;
    G.tortoise_babymap.set(from, G.tortoise_seekbits);
    addMessage(XLAT('You leave %the1.', spI(itBabyTortoise)));
    G.items[itBabyTortoise]--;
  }
}
