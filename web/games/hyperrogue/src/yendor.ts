// yendor.cpp of HyperRogue 13.1o: the Yendor Quest/Challenge, the Pure Tactics Mode, the Peace Mode and the mode
// codes. Package P2. (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The menus yendor::showMenu, tactic::showMenu, peace::showMenu and displayScore are package U2's (stage 2); the
// custom mode screens are still stubs (UI of a later stage) that throw NotPorted.
// Maps of the C++ (bestscore, recordsum, recordrun, lsc, scoreboard) use operator[], which inserts a zero
// value: the `*_at(xc)` helpers do the same.
// modecode's byte strings (shstream) are JS strings of char codes 0..255 (`modestream` below).
import { G } from './globals.ts';
import { among, isize, NotPorted, YDIST, hr_exception, addHook } from './hyper.ts';
import { dynamicval } from './cpp.ts';
import { cell, cellwalker, manual_celllister, NODIR, NOBARRIERS } from './locations.ts';
import {
  type eLand, type eItem, landtypes,
  laNone, laHell, laGraveyard, laDesert, laMinefield, laEmerald, laOvergrown, laMotion, laAlchemist, laIvoryTower,
  laMirrorOld, laWhirlpool, laIce, laHive, laCaribbean, laOcean, laPalace, laZebra, laWineyard, laStorms,
  laLivefjord, laJungle, laPower, laWildWest, laWhirlwind, laDragon, laReptile, laTortoise, laCocytus, laRuins,
  laCaves, laWestWall, laEclectic, laEndorian, laRlyeh, laCrossroads, laElementalWall, laRedRock, laEWater, laEAir,
  laCamelot, laDual, laCrossroads2, laDeadCaves, laBurial, laMirror, laDryForest, laWarpCoast, laTemple, laEFire,
  laMirrorWall,
  itOrbYendor, itElixir, itFeather, itOrbSpeed, itOrbWinter, itBone, itEmerald, itFjord, itGreenStone, itOrbRecall,
  itOrbTime, itOrbEnergy, itOrbTeleport, itOrbSpace, itOrbDash, itOrbFrog, itWaterShard, itRedGem, itPirate,
  itWhirlpool, itOrbWater, itElemental, itMutant, itStatue, itSlime, itOrbShield, itOrbLightning, itOrbFlash,
  itOrbDigging, itOrbThorns, itOrbInvis, itOrbPsi, itOrbAether, itOrbFire, itKey, itNone, itDodeca,
  waTrunk, waCavewall, waCavefloor, waDeadwall, waDeadfloor2, waLake, waFrozenLake, waCIsland, waRed3, waBoat,
  waNone, waReptile, waMineMine, waMineUnknown, waMineOpen, waTrapdoor, waGargoyleFloor, waSea, waPlatform, waChasm,
  moPirate,
} from './content.ts';
import { hrand, hrand_elt, pick } from './rand.ts';
import { changes } from './pcmove.ts';
import { addMessage } from './basegraph.ts';
import { XLAT, XLATT1, spI, spL } from './language.ts';
import { as_hexstring, from_hexstring } from './hprint.ts';
import { playSound } from './sound.ts';
import { euclid, hyperbolic, weirdhyperbolic, S3 } from './classes.ts';
import { isEquidLand, inmirror, isGravityLand, isElemental } from './flags.ts';
import { getPrizeLand, getOLR, olrDangerous, olrUseless, olrForbidden } from './orbgen.ts';
import { achievement_gain, achievement_gain_once, achievement_score, achievement_collection, achievement_victory,
  LB_YENDOR_CHALLENGE, LB_PURE_TACTICS, LB_PURE_TACTICS_SHMUP, LB_PURE_TACTICS_COOP } from './achievement.ts';
import { rg_global, rg_nothing, rg_yendor, rg_tactic, rg_peace, restart_game, stop_game, start_game,
  stop_game_and_switch_mode } from './system.ts';
import {
  treasureType, landMultiplier, isCrossroads, createOnSea, getNewSealand,
  lsNiceWalls, lsChaos, lsSingle, lsChaosRW, lsLandscape, type eLandStructure, ls_horodisk_structure,
} from './landlock.ts';
import { setdist, update_lastexplore } from './landgen.ts';
import { buildBarrierNowall, buildBarrier, extendBarrier } from './barriers.ts';
import { buildEquidistant } from './bigstuff.ts';
import { celldistance, celldistAlt, valence, BARLEV } from './cell.ts';
import { checkTide, makeNoMonster, makeEmpty, coastvalEdge } from './mapeffects.ts';
import { passable, P_MIRROR, P_MONSTER } from './passable.ts';
import { trees_known, get_expansion, type_in } from './expansion.ts';
import { generate_random_path_randomdir, type pathgen } from './geometry2.ts';
import { mirror_reflect } from './complex.ts';
import { saveRecall } from './game.ts';
import { is_cell_removed } from './savemem.ts';
import { legacy_modecode, UNKNOWN } from './legacy.ts';
import { mode_description1 } from './hud.ts';
import { mapstream_save_geometry, mapstream_load_geometry } from './mapeditor.ts';
import { popScreenAll, pushScreen } from './control.ts';
import { ishept } from './pattern2.ts';
import { bignum } from './util.ts';
import { PURELOS_LEVEL, los_none } from './environment.ts';
import { arg_argis, arg_shift, arg_argi, arg_args } from './commandline.ts';
import { land_tac, gNormal } from './classes.ts';
// package U2 (the menus: yendor::showMenu, tactic::showMenu, peace::showMenu, displayScore)
import { idiv } from './cpp.ts';
import { its } from './hprint.ts';
import { XLAT1 } from './language.ts';
import { displayfr } from './basegraph.ts';
import { get_sync_status, set_priority_board } from './achievement.ts';
import {
  dialog_init, dialog_init_t, dialog_start_list, dialog_end_list, dialog_addSelItem, dialog_addItem, dialog_addBreak,
  dialog_addBack, dialog_addHelp, dialog_display, dialog_handleNavigation, dialog_do_if_confirmed, dialog_addBoolItem,
  dialog_add_action, dialog_addTitle, dialog_addInfo, dialog_hasInfix, dialog_handlePage, dialog_zoom_displayfr,
  displayfrZH, dialog_display_bottom_buttons, dialog_handlePageButtons, dialog_editInfix, DB_BACK, DB_HELP, DB_EXIT,
  DB_MINIMAL, DB_MINIMAL_OFF,
} from './dialogs.ts';
import { sm, popScreen } from './graph.ts';
import { doexiton } from './control.ts';
import { gotoHelp } from './help.ts';
import { SDLK_ESCAPE, SDLK_F1 } from './sdl.ts';
import { lv_appears_in_ptm, generateLandList, land_validity } from './landlock.ts';
import { iinf, linf } from './content.ts';

export function hiitemsMax(it: eItem): number {
  let mx = 0;
  for (const a of G.hiitems.values()) if (a[it] > mx) mx = a[it];
  return mx;
}

// typedef vector<pair<int, string> > subscoreboard;
type subscoreboard = [number, string][];
/** void displayScore(subscoreboard& s, int x) (package U2) */
function displayScore(sb: subscoreboard, x: number): void {
  const vf = Math.min(idiv(G.vid.yres - 64, 70), idiv(G.vid.xres, 80));

  if (get_sync_status() === 1) {
    displayfr(x, 56, 1, vf, '(syncing)', 0xC0C0C0, 0);
  }
  else {
    // sort(s.begin(), s.end()): pairs (int, string)
    sb.sort((a, b) => (a[0] - b[0]) || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
    for (let i = 0; i < isize(sb); i++) {
      const i0 = 56 + i * vf;
      displayfr(x, i0, 1, vf, its(-sb[i][0]), 0xC0C0C0, 16);
      displayfr(x + 8, i0, 1, vf, sb[i][1], 0xC0C0C0, 0);
    }
  }
}

// --- namespace yendor ---

// EX bool on, generating, path, everwon, won: G.yendor_*
let yendor_easy = false;

// EX int challenge, lastchallenge: G.yendor_challenge, G.yendor_lastchallenge

export const YF_DEAD = 1;
export const YF_WALLS = 2;
export const YF_END = 4;
export const YF_DEAD5 = 8;
export const YF_NEAR_IVY = 16;
export const YF_NEAR_ELEM = 32;
export const YF_NEAR_OVER = 64;
export const YF_NEAR_RED = 128;
export const YF_REPEAT = 512;
export const YF_NEAR_TENT = 1024;
export const YF_START_AL = 2048;
export const YF_START_CR = 4096;
export const YF_CHAOS = 8192;
export const YF_RECALL = 16384;
export const YF_NEAR_FJORD = 32768;
export const YF_START_ANY = (YF_START_AL | YF_START_CR);

/** struct yendorlevel */
export interface yendorlevel { l: eLand; flags: number; }

export const YENDORLEVELS = 34;

/** bestscore[mc] (operator[]) */
export function yendor_bestscore_at(mc: number): number[] {
  let a = G.yendor_bestscore.get(mc);
  if (!a) { a = new Array<number>(YENDORLEVELS).fill(0); G.yendor_bestscore.set(mc, a); }
  return a;
}

// EX eLand nexttostart: G.yendor_nexttostart

export const yendor_levels: readonly yendorlevel[] = [
  { l: laNone, flags: 0 },
  { l: laHell, flags: YF_DEAD }, // FORCE BARRIERS?
  { l: laGraveyard, flags: YF_DEAD5 },
  { l: laDesert, flags: YF_NEAR_IVY }, // IVY OR TENTACLE?
  { l: laMinefield, flags: YF_END }, // NOT WON, SEEMS OKAY
  { l: laEmerald, flags: 0 }, // WON FINE
  { l: laOvergrown, flags: 0 }, // WON, TOO EASY?
  { l: laMotion, flags: YF_START_AL | YF_END }, // NOT WON, SEEMS OKAY
  { l: laAlchemist, flags: 0 }, // ALMOST WON
  { l: laIvoryTower, flags: YF_START_CR | YF_NEAR_ELEM | YF_REPEAT }, // won cool
  { l: laMirrorOld, flags: YF_NEAR_OVER }, // OK
  { l: laWhirlpool, flags: 0 }, // cool
  { l: laIce, flags: YF_NEAR_ELEM }, // OK
  { l: laHive, flags: YF_NEAR_RED }, // OK
  { l: laCaribbean, flags: 0 }, // seems OK
  { l: laOcean, flags: YF_WALLS }, // well... stupid, add Caribbean/Fjord
  { l: laPalace, flags: 0 }, // more trapdoors!
  { l: laZebra, flags: 0 }, // TOO HARD?
  { l: laWineyard, flags: 0 }, // hard-ish
  { l: laStorms, flags: 0 }, // ?
  { l: laLivefjord, flags: 0 },
  { l: laJungle, flags: 0 },
  { l: laPower, flags: YF_START_CR },
  { l: laWildWest, flags: 0 },
  { l: laWhirlwind, flags: YF_NEAR_TENT },
  { l: laHell, flags: YF_CHAOS | YF_DEAD },
  { l: laDragon, flags: YF_DEAD },
  { l: laReptile, flags: 0 },
  { l: laTortoise, flags: YF_RECALL },
  { l: laCocytus, flags: YF_NEAR_FJORD },
  { l: laRuins, flags: YF_DEAD },
  { l: laCaves, flags: YF_DEAD5 },
  { l: laWestWall, flags: YF_START_CR },
  { l: laEclectic, flags: 0 },
  // {laVariant,   YF_DEAD5}, (I do not think this works)
];

let yendor_tscorelast = 0;

export function yendor_compute_tscore(mc: number): number {
  if (!G.yendor_bestscore.has(mc)) return 0;
  let tscore = 0;
  for (let i = 1; i < YENDORLEVELS; i++)
    if (yendor_bestscore_at(mc)[i]) tscore += 999 + yendor_bestscore_at(0)[i];
  return tscore;
}

export function yendor_uploadScore(): void {
  const tscore = yendor_compute_tscore(0);

  if (tscore > yendor_tscorelast) {
    yendor_tscorelast = tscore;
    if (tscore >= 1000) achievement_gain('YENDC1', rg_global);
    if (tscore >= 5000) achievement_gain('YENDC2', rg_global);
    if (tscore >= 15000) achievement_gain('YENDC3', rg_global);
  }

  achievement_score(LB_YENDOR_CHALLENGE, tscore);
}

export function yendor_clev(): yendorlevel { return yendor_levels[G.yendor_challenge]; }

export function yendor_changeland(i: number, l: eLand): eLand {
  if (l === laIvoryTower) return laNone;
  if ((yendor_clev().flags & YF_START_ANY) && i < 20 && l !== yendor_clev().l) return yendor_clev().l;
  if ((yendor_clev().flags & YF_END) && i > 80 && l === yendor_clev().l) return laIce;
  return laNone;
}

// eLand first, second, last: unused in 13.1o

/** struct yendorinfo */
export class yendorinfo {
  path: cell[] = new Array<cell>(YDIST).fill(null!);
  actualKey: cell = null!;
  found = false;
  foundOrb = false;
  howfar = 0;
  howfar_back = 0;
  age: bignum = new bignum();
  key(): cell { return this.path[YDIST - 1]; }
  actual_key(): cell { return this.actualKey ? this.actualKey : this.key(); }
  orb(): cell { return this.path[0]; }
  clone(): yendorinfo {
    const y = new yendorinfo();
    y.path = [...this.path]; y.actualKey = this.actualKey; y.found = this.found; y.foundOrb = this.foundOrb;
    y.howfar = this.howfar; y.howfar_back = this.howfar_back; y.age = this.age.clone();
    return y;
  }
}

export const NOYENDOR = 999999;

export function yendor_hardness(): number {
  if (G.peace_on) return 15; // just to generate monsters
  if (!G.yendor_generating && !G.yendor_path && !G.yendor_on) return 0;
  let thf = 0;
  for (let i = 0; i < isize(G.yendor_yi); i++) {
    const ye = G.yendor_yi[i];
    if (!ye.foundOrb && ye.howfar > 25)
      thf += (ye.howfar - 25);
  }
  thf -= 2 * (YDIST - 25);
  if (thf < 0) thf = 0;
  return G.items[itOrbYendor] * 5 + Math.trunc((thf * 5) / (YDIST - 25));
}

// enum eState
export const ysUntouched = 0, ysLocked = 1, ysUnlocked = 2;
export type eState = number;

export function yendor_state(yendor: cell): eState {
  for (let i = 0; i < isize(G.yendor_yi); i++) if (G.yendor_yi[i].path[0] === yendor)
    return G.yendor_yi[i].found ? ysUnlocked : ysLocked;
  return ysUntouched;
}

export function yendor_control(p: pathgen, i: number, ycw: cellwalker): boolean {

  // change lands in the Challenge
  if (i > BARLEV() - 6) {
    p.last_id = i + 7 - BARLEV();
    setdist(p.path[p.last_id], 7, p.path[i + 6 - BARLEV()]);
    if (G.yendor_challenge && !euclid() && ycw.at.land !== laIvoryTower) {
      const ycl = yendor_changeland(i, ycw.at.land);
      if (ycl) {
        if (weirdhyperbolic()) {
          buildBarrierNowall(ycw.at, ycl);
        }
        else if (hyperbolic() && ishept(ycw.at)) {
          const bd = 2 + hrand(2) * 3;
          buildBarrier(ycw.at, bd, ycl);
          if (ycw.at.bardir !== NODIR && ycw.at.bardir !== NOBARRIERS)
            extendBarrier(ycw.at);
        }
      }
    }
  }

  // follow the branch in Yendorian
  if (ycw.at.land === laEndorian) {
    let bestval = -2000;
    let best = 0, qbest = 0;
    for (let d = 0; d < ycw.at.type; d++) {
      setdist(ycw.at, 7, ycw.peek());
      const c1 = ycw.plus(d).cpeek();
      let val = d * (ycw.at.type - d);
      if (c1.wall === waTrunk) val += (i < YDIST - 20 ? 1000 : -1000);
      if (val > bestval) qbest = 0, bestval = val;
      if (val === bestval) if (hrand(++qbest) === 0) best = d;
    }
    ycw.add(best);
    return true;
  }
  return false;
}

export function yendor_check(yendor: cell): boolean {
  const yi = G.yendor_yi;
  let byi = isize(yi);
  for (let i = 0; i < isize(yi); i++) if (yi[i].path[0] === yendor) byi = i;
  if (byi < isize(yi) && yi[byi].found) return false;
  if (byi === isize(yi)) {
    let nyi: yendorinfo;
    let p: pathgen;
    let key: cell;
    for (;;) { // retry:
      let creation_attempt = 0;
      nyi = new yendorinfo();
      nyi.howfar = 0;

      G.yendor_generating = true;

      p = generate_random_path_randomdir(new cellwalker(yendor), YDIST - 1, true);
      for (let i = 0; i < YDIST; i++) nyi.path[i] = p.path[i];

      nyi.found = false;
      nyi.foundOrb = false;
      nyi.howfar_back = 999;

      for (let i = 1; i < YDIST; i++) {
        setdist(nyi.path[i], 7, nyi.path[i - 1]);
        if (isEquidLand(nyi.path[i].land)) {
          // println(hlog, i, ": ", coastvalEdge(nyi.path[i]));
          buildEquidistant(nyi.path[i]);
        }
      }

      setdist(nyi.path[YDIST - 1], 7, nyi.path[YDIST - 2]);
      key = nyi.path[YDIST - 1];

      G.yendor_generating = false;

      for (let b = 10; b >= 5; b--) setdist(key, b, nyi.path[YDIST - 2]);

      if (inmirror(key) || (G.geometry === gNormal && celldistance(key, yendor) < Math.trunc(YDIST / 2))) {
        creation_attempt++;
        if (creation_attempt > 100) {
          yendor.item = itNone;
          addMessage(XLAT('%The1 turned out to be an illusion!', spI(itOrbYendor)));
          return false;
        }
        continue; // goto retry (creation_attempt is declared after the label: it restarts at 0)
      }
      break;
    }

    const rollbacks = changes.rollbacks; changes.rollbacks = []; // std::move
    for (let i = -1; i < key.type; i++) {
      const c2 = i >= 0 ? key.move(i) : key;
      checkTide(c2);
      makeNoMonster(c2);
      c2.item = itNone;
      if (!passable(c2, null!, P_MIRROR | P_MONSTER)) {
        if (c2.wall === waCavewall) c2.wall = waCavefloor;
        else if (c2.wall === waDeadwall) c2.wall = waDeadfloor2;
        else if (c2.wall === waLake) c2.wall = waFrozenLake;
        else if (c2.land === laCaribbean) c2.wall = waCIsland;
        else if (c2.land === laOcean) c2.wall = waCIsland;
        else if (c2.land === laRedRock) c2.wall = waRed3;
        else if (c2.land === laWhirlpool)
          c2.wall = waBoat, c2.monst = moPirate, c2.item = itOrbWater;
        else c2.wall = waNone;
      }
      if (c2.wall === waReptile) c2.wall = waNone;
      if (c2.wall === waMineMine || c2.wall === waMineUnknown)
        c2.wall = waMineOpen;
      if (c2.wall === waTrapdoor && i === -1)
        c2.wall = waGargoyleFloor;
      if (c2.land === laLivefjord) {
        c2.wall = waSea;
        for (let i = 0; i < c2.type; i++)
          c2.move(i).wall = waSea;
      }
      if (isGravityLand(c2.land) && key.land === c2.land && c2.land !== laWestWall &&
        c2.landparam < key.landparam && c2.wall !== waTrunk)
        c2.wall = waPlatform;
      if (c2.land === laReptile && i >= 0)
        c2.wall = waChasm;
      if (c2.land === laMirrorWall && i === -1)
        c2.wall = waNone;
    }
    changes.rollbacks = rollbacks;
    key.item = itKey;

    let split_found = false;

    if (key.land === laWestWall && trees_known()) {

      const expansion = get_expansion();
      let t = type_in(expansion, yendor, (c: cell) => celldistance(yendor, c));
      let maxage = 10;
      for (let i = 0; i < Math.min(G.items[itOrbYendor], 8); i++)
        maxage *= 10;

      nyi.age = new bignum(maxage - hrand(Math.trunc(maxage / 2)));
      const full_id = bignum.minus(p.full_id_0, nyi.age);
      let onlychild = true;

      const ycw = p.start.clone();
      ycw.dec(); if (S3() === 3) ycw.dec();

      for (let i = 0; i < YDIST - 1; i++) {

        if (i === 1) onlychild = true;
        if (!onlychild) ycw.inc();
        if (valence() === 3) ycw.inc();

        onlychild = false;

        for (let tch of expansion.children[t]) {
          ycw.inc();
          if (i === 1)
            tch = type_in(expansion, ycw.cpeek(), (c: cell) => celldistance(yendor, c));
          const sub_id = expansion.get_descendants(YDIST - i - 2, tch);
          if (full_id.lt(sub_id)) {
            if (!split_found && !(p.full_id_0.lt(sub_id))) {
              // ycw.at->item = itRuby;
              split_found = true;
              setdist(ycw.at, 6, null!);
              const tt = type_in(expansion, ycw.at, coastvalEdge);
              // println(hlog, "at split, ydist-type: ", t, " coast-type: ", tt);
              if (t !== tt) {
                // try again!
                key.item = itNone;
                return yendor_check(yendor);
              }
            }
            t = tch;
            break;
          }

          full_id.addmul(sub_id, -1);
          if (!split_found) p.full_id_0.addmul(sub_id, -1);
          onlychild = true;
        }

        if (inmirror(ycw.at)) ycw.set(mirror_reflect(ycw));
        ycw.addStep();
        setdist(ycw.at, 8, ycw.peek());
        buildEquidistant(ycw.at);
        // println(hlog, "actual key #", i, ": ", ycw.at->landparam);
      }

      nyi.actualKey = ycw.at;
      ycw.at.item = itKey;
      key.item = itNone;
    }

    yi.push(nyi);
  }
  const b = dynamicval(() => changes.on, (v) => { changes.on = v; }, false);
  try {
    addMessage(XLAT('You need to find the right Key to unlock this Orb of Yendor!'));
    if (yi[byi].actualKey)
      addMessage(XLAT('You feel that these directions are %1 turns old.', yi[byi].age.get_str(100)));
    if (G.yendor_yii !== byi) {
      G.yendor_yii = byi;
      achievement_gain_once('YENDOR1');
      playSound(yendor, 'pickup-yendor');
      return true;
    }
    return false;
  }
  finally { b.restore(); }
}

export function yendor_onpath(): void {
  G.yendor_path = false;
  const yi = G.yendor_yi, yii = G.yendor_yii;
  if (yii < isize(yi)) {
    for (let i = 0; i < YDIST; i++) if (yi[yii].path[i].cpdist <= 7) {
      if (i > yi[yii].howfar) yi[yii].howfar = i;
      if (yi[yii].found && i < yi[yii].howfar_back) {
        yi[yii].howfar_back = i;
        update_lastexplore();
      }
      G.yendor_path = true;
    }
  }
}

export function yendor_get_land_structure(): eLandStructure {
  if (yendor_clev().flags & YF_CHAOS)
    return lsChaos;
  if (yendor_clev().l === laWhirlpool)
    return lsSingle;
  return lsNiceWalls;
}

export function yendor_init(phase: number): void {
  if (!G.yendor_on) return;
  const items = G.items;

  if (phase === 1) {
    G.yendor_won = false;
    if (!yendor_easy) items[itOrbYendor] = yendor_bestscore_at(modecode())[G.yendor_challenge];
    G.land_structure = yendor_get_land_structure();
    G.specialland = yendor_clev().l;
    if (yendor_clev().flags & YF_START_AL) {
      G.specialland = laAlchemist;
      items[itElixir] = 50;
      items[itFeather] = 50;
    }
    if (G.specialland === laPower)
      items[itOrbSpeed] = 60, items[itOrbWinter] = 60;
    if (yendor_clev().flags & YF_START_CR) {
      G.specialland = laCrossroads;
    }
    if (G.specialland === laGraveyard) items[itBone] = 10;
    if (G.specialland === laEmerald) items[itEmerald] = 10;
    if (G.specialland === laCocytus) items[itFjord] = 10;
    if (!euclid()) {
      if (yendor_clev().flags & YF_DEAD) items[itGreenStone] = 100;
      if (yendor_clev().flags & YF_DEAD5) items[itGreenStone] = 5;
    }
    if (yendor_clev().flags & YF_RECALL) {
      const yq = items[itOrbYendor];
      items[itOrbRecall] = 60 - yq;
      items[itOrbTime] = 60 - yq;
      items[itOrbEnergy] = 60 - yq;
      items[itOrbTeleport] = 60 - yq;
      items[itOrbSpace] = 60 - yq;
      items[itOrbDash] = 60 - yq;
      items[itOrbFrog] = 60 - yq;
    }
    G.yendor_nexttostart = laNone;
  }

  if (phase === 2) {
    const c2 = G.cwt.at.move(0);
    c2.land = G.firstland;
    if (G.firstland === laRlyeh) c2.wall = waNone;
    yendor_check(c2);
    if (yendor_clev().flags & YF_NEAR_IVY)
      G.yendor_nexttostart = laJungle;
    if (yendor_clev().flags & YF_NEAR_FJORD)
      G.yendor_nexttostart = laLivefjord;
    if (yendor_clev().flags & YF_NEAR_TENT)
      G.yendor_nexttostart = laRlyeh;
    if (yendor_clev().flags & YF_NEAR_ELEM) {
      if (G.firstland === laIce) {
        G.yendor_nexttostart = laEWater;
        items[itWaterShard] = 10;
      }
      else G.yendor_nexttostart = laEAir;
    }
    if (yendor_clev().flags & YF_NEAR_OVER)
      G.yendor_nexttostart = laOvergrown;
    if (yendor_clev().flags & YF_NEAR_RED) {
      G.yendor_nexttostart = laRedRock;
      items[itRedGem] = 25;
    }
    if (yendor_clev().flags & YF_WALLS) {
      items[itPirate] += 25;
      items[itFjord] += 25;
    }
    if (yendor_clev().l === laWhirlpool) {
      items[itWhirlpool] += 10;
      items[itOrbWater] += 150;
    }
  }

  if (phase === 3) {
    const c2 = G.cwt.at.move(0);
    makeEmpty(c2);
    c2.item = itOrbYendor;
    G.yendor_nexttostart = laNone;
    if (yendor_clev().flags & YF_RECALL)
      saveRecall(G.cwt);
  }
}

export function yendor_levelUnlocked(i: number): boolean {
  if (G.unlock_all) return true;
  const ylev = yendor_levels[i];

  const t = treasureType(ylev.l);
  if (ylev.l !== laWildWest && hiitemsMax(t) < 10) return false;
  if ((ylev.flags & YF_NEAR_ELEM) && hiitemsMax(itElemental) < 10) return false;
  if ((ylev.flags & YF_NEAR_RED) && hiitemsMax(itRedGem) < 10) return false;
  if ((ylev.flags & YF_NEAR_OVER) && hiitemsMax(itMutant) < 10) return false;
  if ((ylev.flags & YF_NEAR_TENT) && hiitemsMax(itStatue) < 10) return false;
  if ((ylev.flags & YF_NEAR_FJORD) && hiitemsMax(itFjord) < 10) return false;
  if ((ylev.flags & YF_CHAOS) && !G.chaosUnlocked) return false;
  if ((ylev.flags & (YF_DEAD | YF_DEAD5)) && hiitemsMax(itBone) < 10) return false;
  if ((ylev.flags & YF_RECALL) && hiitemsMax(itSlime) < 10) return false;
  return true;
}

/** struct scoredata (the online scoreboard: always empty without CAP_ACHIEVE) */
export interface scoredata { username: string; scores: number[]; }
export const yendor_scoreboard: scoredata[] = [];

/** EX const char *chelp */
export const yendor_chelp =
  'There are many possible solutions to the Yendor Quest. In the Yendor ' +
  'Challenge, you will try many of them!\n\n' +

  'Each challenge takes part in a specific land, and you have to use what ' +
  'you have available.\n\n' +

  'You need to obtain an Orb of Yendor in the normal game to activate ' +
  'this challenge, and (ever) collect 10 treasures in one or two lands ' +
  'to activate a specific level.\n\n' +

  'After you complete each challenge, you can try it again, on a harder ' +
  'difficulty level.\n\n' +

  'All the solutions showcased in the Yendor Challenge work in the normal ' +
  'play too. However, passages to other lands, and (sometimes) some land features ' +
  'are disabled in the Yendor ' +
  'Challenge, so that you have to use the expected method. Also, ' +
  'the generation rules are changed slightly for the Palace ' +
  'and Minefield while you are looking for the Orb of Yendor, ' +
  'to make the challenge more balanced ' +
  '(but these changes are also active during the normal Yendor Quest).\n\n' +

  'You get 1000 points for each challenge won, and 1 extra point for ' +
  'each extra difficulty level.';

export function yendor_char_to_yendor(c: number): number {
  if (c >= 97 && c <= 122) // 'a'..'z'
    return c - 97 + 1;
  if (c >= 65 && c <= 90) // 'A'..'Z'
    return c - 65 + 1 + 26;
  return 0;
}

export function yendor_name(i: number): string {
  const ylev = yendor_levels[i];

  let s = XLATT1(spL(ylev.l));
  if (!euclid()) {
    if (ylev.flags & YF_CHAOS) { s = 'Chaos mode'; }
    if (ylev.flags & YF_NEAR_IVY) { s += '+'; s += XLATT1(spL(laJungle)); }
    if (ylev.flags & YF_NEAR_FJORD) { s += '+'; s += XLATT1(spL(laLivefjord)); }
    if (ylev.flags & YF_NEAR_TENT) { s += '+'; s += XLATT1(spL(laRlyeh)); }
    if (ylev.flags & YF_NEAR_ELEM) { s += '+'; s += XLATT1(spL(laElementalWall)); }
    if (ylev.flags & YF_NEAR_OVER) { s += '+'; s += XLATT1(spL(laOvergrown)); }
    if (ylev.flags & YF_NEAR_RED) { s += '+'; s += XLATT1(spL(laRedRock)); }
    if (ylev.flags & YF_START_AL) { s += '+'; s += XLATT1(spL(laAlchemist)); }
    if (ylev.flags & YF_DEAD) { s += '+'; s += XLATT1(spI(itGreenStone)); }
    if (ylev.flags & YF_RECALL) { s += '+'; s += XLATT1(spI(itOrbRecall)); }
  }

  return s;
}

/** void yendor::showMenu() (package U2) */
export function yendor_showMenu(): void {
  set_priority_board(LB_YENDOR_CHALLENGE);
  const sz = G.vid.fsize;
  G.vid.fsize = idiv(G.vid.fsize * 4, 5);
  dialog_init_t(XLAT('Yendor Challenge'), iinf[itOrbYendor].color, 150, 100);

  dialog_start_list(2000, 2000);

  for (let i = 1; i < YENDORLEVELS; i++) {
    let str: string;

    if (G.autocheat || yendor_levelUnlocked(i)) {
      str = yendor_name(i);
    }

    else {
      str = '(locked)';
    }

    let v = '';
    if (yendor_bestscore_at(modecode())[i] === 1)
      v = XLAT(' (won!)');
    else if (yendor_bestscore_at(modecode())[i])
      v = XLAT(' (won at level %1!)', its(yendor_bestscore_at(modecode())[i]));

    dialog_addSelItem(str, v, i > 26 ? 65 + i - 27 : 97 + i - 1);
  }

  dialog_end_list();

  dialog_addBreak(60);
  if (G.yendor_on)
    dialog_addItem(XLAT('Return to the normal game'), 48);
  dialog_addSelItem(
    yendor_easy ? XLAT('Challenges do not get harder') : XLAT('Each challenge gets harder after each victory'),
    ' ' + (yendor_easy ? XLAT('easy') : XLAT('challenge')), 49);

  dialog_addBack();
  dialog_addHelp();
  dialog_display();

  const yc = yendor_char_to_yendor((G.getcstat << 24) >> 24); // (char) getcstat

  if (yc > 0 && yc < YENDORLEVELS) {
    const scorehere: subscoreboard = [];

    for (let i = 0; i < isize(yendor_scoreboard); i++) {
      const sc = yendor_scoreboard[i].scores[yc];
      if (sc > 0)
        scorehere.push(
          [-sc, yendor_scoreboard[i].username]);
    }

    displayScore(scorehere, G.vid.fsize);
  }

  yendor_uploadScore();
  G.vid.fsize = sz;

  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;
    const new_challenge = yendor_char_to_yendor((uni << 24) >> 24); // (char) uni
    if (new_challenge && new_challenge < YENDORLEVELS) {
      if (yendor_levelUnlocked(new_challenge) || G.autocheat) dialog_do_if_confirmed(() => {
        G.yendor_challenge = new_challenge;
        restart_game(G.yendor_on ? rg_nothing : rg_yendor);
      });
      else
        addMessage('Collect 10 treasures in various lands to unlock the challenges there');
    }
    else if (uni === 48 /* '0' */) {
      if (G.yendor_on) restart_game(rg_yendor);
    }
    else if (uni === 49 /* '1' */) yendor_easy = !yendor_easy;
    else if (uni === 50 /* '2' */ || sym === SDLK_F1) gotoHelp(yendor_chelp);
    else if (doexiton(sym, uni)) popScreen();
  };
}

/** the game logic of yendor::showMenu's keyhandler: start challenge `new_challenge` (dialog::do_if_confirmed is
 *  the UI's) */
export function yendor_select_challenge(new_challenge: number): void {
  if (new_challenge && new_challenge < YENDORLEVELS) {
    if (yendor_levelUnlocked(new_challenge) || G.autocheat) {
      G.yendor_challenge = new_challenge;
      restart_game(G.yendor_on ? rg_nothing : rg_yendor);
    }
    else
      addMessage('Collect 10 treasures in various lands to unlock the challenges there');
  }
}

export function yendor_collected(c2: cell): void {
  if (changes.on) { changes.at_commit(() => yendor_collected(c2)); return; }
  const items = G.items;
  playSound(c2, 'tada');
  items[itOrbShield] += 31;
  for (let i = 0; i < isize(G.yendor_yi); i++)
    if (G.yendor_yi[i].path[0] === c2)
      changes.value_set(G.yendor_yi[i], 'foundOrb', true);
  // Shielding always, so that we know that it protects!
  let powers = 0;
  for (let i = 0; i < 1000 && powers < 4; i++) {
    const choices: [eItem, number][] = [
      [itOrbSpeed, 31],
      [itOrbLightning, 78],
      [itOrbFlash, 78],
      [itOrbTime, 78],
      [itOrbWinter, 151],
      [itOrbDigging, 151],
      [itOrbTeleport, 151],
      [itOrbThorns, 151],
      [itOrbInvis, 151],
      [itOrbPsi, 151],
      [itOrbAether, 151],
      [itOrbFire, 151],
      [itOrbSpace, 78],
    ];
    const p = hrand_elt(choices);
    const orb = p[0];
    if (items[orb] && i < 500) continue;
    if (among(getOLR(orb, getPrizeLand()), olrDangerous, olrUseless, olrForbidden)) continue;
    items[orb] += p[1];
    powers++;
  }
  items[itOrbYendor]++;
  items[itKey]--;
  changes.value_set(G, 'yendor_everwon', true);
  if (G.yendor_on) {
    changes.value_set(G, 'yendor_won', true);
    if (!G.cheater) {
      yendor_bestscore_at(modecode())[G.yendor_challenge] =
        Math.max(yendor_bestscore_at(modecode())[G.yendor_challenge], items[itOrbYendor]);
      yendor_uploadScore();
    }
  }
  addMessage(XLAT('CONGRATULATIONS!'));
  achievement_collection(itOrbYendor);
  achievement_victory(false);
}

/** template eliminate_if (hyper.h) */
function eliminate_if<T>(data: T[], pred: (x: T) => boolean): void {
  for (let i = 0; i < isize(data); i++)
    if (pred(data[i]))
      data[i] = data[data.length - 1], data.pop(), i--;
}

// --- namespace tactic ---

export const MAXTAC = 20;

// EX bool on; EX int id: G.tactic_on, G.tactic_id

export const tactic_recordsum = new Map<number, number[]>();
export const tactic_recordrun = new Map<number, number[]>();
export const tactic_lsc = new Map<number, number[][]>();

function recordsum_at(xc: number): number[] {
  let a = tactic_recordsum.get(xc);
  if (!a) { a = new Array<number>(landtypes).fill(0); tactic_recordsum.set(xc, a); }
  return a;
}
function recordrun_at(xc: number): number[] {
  let a = tactic_recordrun.get(xc);
  if (!a) { a = new Array<number>(landtypes).fill(0); tactic_recordrun.set(xc, a); }
  return a;
}
function lsc_at(xc: number): number[][] {
  let a = tactic_lsc.get(xc);
  if (!a) {
    a = [];
    for (let i = 0; i < landtypes; i++) a.push(new Array<number>(MAXTAC).fill(0));
    tactic_lsc.set(xc, a);
  }
  return a;
}

let tactic_lasttactic: eLand = 0;

export const tactic_scoreboard = new Map<number, scoredata[]>();

export function tactic_default_runs(l: eLand): number {
  return l === laCamelot ? 1 : 3;
}

export function tactic_default_mult(l: eLand): number {
  return l === laCamelot ? 3 : 1;
}

/** also called 'runs' */
export function tactic_chances(l: eLand, xc: number = modecode()): number {
  if (G.use_custom_land_list) return Math.max(Math.min(G.custom_land_ptm_runs[l], 10), 1);
  if (xc !== 0) return tactic_default_runs(l);
  for (const ti of land_tac)
    if (ti.l === l)
      return ti.tries;
  return 0;
}

function tactic_tacmultiplier(l: eLand): number {
  if (G.use_custom_land_list) return G.custom_land_ptm_mult[l];
  if (modecode() !== 0) return tactic_default_mult(l);
  for (const ti of land_tac)
    if (ti.l === l)
      return ti.multiplier;
  return 0;
}

export function tactic_tacticUnlocked(l: eLand): boolean {
  if (G.autocheat) return true;
  if (G.unlock_all) return true;
  if (l === laWildWest || l === laDual) return true;
  return hiitemsMax(treasureType(l)) * landMultiplier(l) >= 20;
}

/** record(eLand land, int score, modecode_t xc IS(modecode())) and record() (no arguments) */
export function tactic_record(...args: [] | [eLand, number] | [eLand, number, number]): void {
  if (args.length === 0) { tactic_record(tactic_lasttactic, G.items[treasureType(tactic_lasttactic)]); return; }
  const land = args[0], score = args[1];
  const xc = args.length === 3 ? args[2] : modecode();
  if (land >= 0 && land < landtypes) {
    for (let i = MAXTAC - 1; i; i--) lsc_at(xc)[land][i] = lsc_at(xc)[land][i - 1];
    lsc_at(xc)[land][0] = score;
  }
  const t = tactic_chances(land, xc);
  let csum = 0;
  for (let i = 0; i < t; i++) if (lsc_at(xc)[land][i] > 0) csum += lsc_at(xc)[land][i];
  if (csum > recordsum_at(xc)[land]) recordsum_at(xc)[land] = csum;
  if (score > recordrun_at(xc)[land]) recordrun_at(xc)[land] = score;
}

/** unrecord(eLand land, flagtype xc IS(modecode())) and unrecord() */
export function tactic_unrecord(...args: [] | [eLand] | [eLand, number]): void {
  if (args.length === 0) { tactic_unrecord(tactic_lasttactic); return; }
  const land = args[0];
  const xc = args.length === 2 ? args[1] : modecode();
  if (land >= 0 && land < landtypes) {
    for (let i = 0; i < MAXTAC - 1; i++) lsc_at(xc)[land][i] = lsc_at(xc)[land][i + 1];
    lsc_at(xc)[land][MAXTAC - 1] = -1;
  }
}

let tactic_tscorelast = 0;

export function tactic_compute_tscore(code: number): number {
  if (!tactic_recordsum.has(code)) return 0;
  let tscore = 0;
  for (let i = 0; i < landtypes; i++)
    tscore += recordsum_at(code)[i] * tactic_tacmultiplier(i);
  return tscore;
}

function tactic_uploadScoreCode(code: number, lb: number): void {
  const tscore = tactic_compute_tscore(code);

  if (code === 0 && tscore > tactic_tscorelast) {
    tactic_tscorelast = tscore;
    if (tscore >= 1000) achievement_gain('PTM1', 0x78 /* 'x' */);
    if (tscore >= 5000) achievement_gain('PTM2', 0x78);
    if (tscore >= 15000) achievement_gain('PTM3', 0x78);
  }
  achievement_score(lb, tscore);
}

export function tactic_uploadScore(): void {
  tactic_uploadScoreCode(0, LB_PURE_TACTICS);
  tactic_uploadScoreCode(2, LB_PURE_TACTICS_SHMUP);
  tactic_uploadScoreCode(4, LB_PURE_TACTICS_COOP);
}

// EX bool minimal_mode: G.tactic_minimal_mode

/** void tactic::showMenu() (package U2) */
export function tactic_showMenu(): void {

  const xc = modecode();

  if (xc === 0) set_priority_board(LB_PURE_TACTICS);
  if (xc === 2) set_priority_board(LB_PURE_TACTICS_SHMUP);
  if (xc === 4) set_priority_board(LB_PURE_TACTICS_COOP);

  G.cmode = sm.ZOOMABLE;
  if (G.mouseovers === '' || G.mouseovers === ' ')
    G.mouseovers = XLAT('pure tactics mode');
  else
    G.mouseovers = XLAT('pure tactics mode') + ' - ' + G.mouseovers;

  if (G.dialog_infix !== '') G.mouseovers = G.mouseovers + ' - ' + G.dialog_infix;
  else G.mouseovers = G.mouseovers + ' - ' + XLAT('press letters to search');

  {
    const t = G.tactic_on;
    G.tactic_on = true;
    try {
      generateLandList((l: eLand) => {
        if (G.dialog_infix !== '' && !dialog_hasInfix(linf[l].name)) return false;
        if (G.use_custom_land_list) return G.custom_land_list[l] && G.custom_land_ptm_runs[l] > 0;
        return !!(land_validity(l).flags & lv_appears_in_ptm);
      });
    }
    finally { G.tactic_on = t; }
  }

  let nl = isize(G.landlist);
  let nlm = nl;

  let ofs = 0;
  let numpages = 1;

  if (G.dialog_infix === '') {
    numpages = idiv(nl - 1, G.lands_per_page) + 1;

    if (numpages > 1) {
      const p = dialog_handlePage(nl, G.lands_per_page, numpages);
      ofs += p.ret; nl = p.nl; nlm = p.nlm;
    }
  }

  const vf = nlm ? Math.min(idiv(G.vid.yres - 4 * G.vid.fsize, nlm + 1), idiv(G.vid.xres, 40)) : idiv(G.vid.xres, 40);

  const xr = Math.min(idiv(G.vid.xres, 64), vf);

  if (G.tactic_on) tactic_record(G.specialland, G.items[treasureType(G.specialland)]);

  G.getcstat = SDLK_ESCAPE;

  const land_for = new Map<number, number>();

  if (G.tactic_minimal_mode) for (let i = 0; i < isize(G.landlist); i++) {
    const l = G.landlist[i];
    const y0 = 2 * G.vid.fsize + (i % nl + 1) * vf;
    const x0 = idiv(G.vid.xres * idiv(i, nl), numpages);

    const unlocked = tactic_tacticUnlocked(l);
    const col = linf[l].color;

    const keyhere = 1000 + i;
    land_for.set(keyhere, i);

    if (displayfrZH(x0 + xr, y0, 1, vf - 4, XLAT1(linf[l].name), col, 0) && unlocked)
      G.getcstat = keyhere;

    let sco = its(recordrun_at(xc)[l]);
    if (!unlocked) sco = 'L';

    if (displayfrZH(x0 + idiv(G.vid.xres, numpages) - xr, y0, 1, vf - 4, sco, col, 16) && unlocked) G.getcstat = keyhere;
    const gold_medal_at = (l === laCamelot) ? 8 : 50;
    if (recordrun_at(xc)[l] >= gold_medal_at)
      displayfrZH(x0 + idiv(G.vid.xres, numpages) - xr, y0, 1, vf - 4, '*', 0xFFD500, 0);
  }

  else for (let i = 0; i < nl; i++) {
    const i1 = i + ofs;
    const l = G.landlist[i1];

    const i0 = 2 * G.vid.fsize + (i + 1) * vf;
    let col: number;

    const chn = tactic_chances(l);

    if (!chn) continue;

    const unlocked = tactic_tacticUnlocked(l);

    if (unlocked) col = linf[l].color; else col = 0x202020;

    let keyhere: number;
    if (nlm <= 9) {
      keyhere = 49 /* '1' */ + i;
      if (displayfrZH(xr * 1, i0, 1, vf - 4, String.fromCharCode(keyhere & 0xFF), 0xFFFFFF, 0))
        G.getcstat = keyhere;
    }
    else
      keyhere = 1000 + i1;
    land_for.set(keyhere, i1);

    // xr*(nlm <= 9 ? 2.5 : 1): a double, passed as int
    if (displayfrZH(Math.trunc(xr * (nlm <= 9 ? 2.5 : 1)), i0, 1, vf - 4, XLAT1(linf[l].name), col, 0) && unlocked)
      G.getcstat = keyhere;

    if (unlocked || G.autocheat) {
      for (let ii = 0; ii < chn; ii++)
        if (displayfrZH(xr * (24 + 2 * ii), i0, 1, idiv((vf - 4) * 4, 5), lsc_at(xc)[l][ii] > 0 ? its(lsc_at(xc)[l][ii]) : '-', col, 16))
          G.getcstat = keyhere;

      if (displayfrZH(xr * (24 + 2 * 10), i0, 1, idiv((vf - 4) * 4, 5),
        its(recordsum_at(xc)[l]) + ' x' + its(tactic_tacmultiplier(l)), col, 0))
        G.getcstat = keyhere;
    }
    else {
      const m = landMultiplier(l);
      dialog_zoom_displayfr(xr * 26, i0, 1, idiv((vf - 4) * 4, 5),
        XLAT('Collect %1x %2 to unlock', its(idiv(20 + m - 1, m)), spI(treasureType(l))),
        col, 0);
    }
  }

  dialog_display_bottom_buttons(numpages, DB_BACK | DB_HELP | DB_EXIT | (G.tactic_minimal_mode ? DB_MINIMAL_OFF : DB_MINIMAL));

  tactic_uploadScore();
  if (G.tactic_on) tactic_unrecord(G.specialland);

  if (land_for.has(G.getcstat)) {
    const ld = G.landlist[land_for.get(G.getcstat)!];
    const scorehere: subscoreboard = [];
    // scoreboard[xc]: operator[] inserts an empty vector
    if (!tactic_scoreboard.has(xc)) tactic_scoreboard.set(xc, []);
    const sb = tactic_scoreboard.get(xc)!;
    for (let i = 0; i < isize(sb); i++) {
      const sc = sb[i].scores[ld];
      if (sc > 0)
        scorehere.push(
          [-sc, sb[i].username]);
    }
    displayScore(scorehere, xr * 50);
  }

  G.keyhandler = (sym: number, uni: number) => {
    if (land_for.has(uni)) {
      const ll = G.landlist[land_for.get(uni)!];
      dialog_do_if_confirmed(() => {
        stop_game();
        G.specialland = ll;
        restart_game(G.tactic_on ? rg_nothing : rg_tactic);
      });
    }
    else if (uni === 48 /* '0' */) {
      if (G.tactic_on) restart_game(rg_tactic);
      else popScreen();
    }
    else if (uni === 52 /* '4' */) G.tactic_minimal_mode = !G.tactic_minimal_mode;

    else if (sym === SDLK_F1) gotoHelp(
      'In the pure tactics mode, you concentrate on a specific land. ' +
      'Your goal to obtain as high score as possible, without using ' +
      'features of the other lands. You can then compare your score ' +
      'with your friends!\n\n' +

      'You need to be somewhat proficient in the normal game to ' +
      'unlock the given land in this challenge ' +
      '(collect 20 treasure in the given land, or 2 in case of Camelot).\n\n' +

      'Since getting high scores in some lands is somewhat luck dependent, ' +
      'you play each land N times, and your score is based on N consecutive ' +
      "plays. The value of N depends on how 'fast' the land is to play, and " +
      'how random it is.\n\n' +

      'In the Caribbean, you can access Orbs of Thorns, Aether, and ' +
      'Space if you have ever collected 25 treasure in their native lands.\n\n' +

      'The rate of treasure spawn is static in this mode. It is not ' +
      'increased by killing monsters.\n\n' +

      'Good luck, and have fun!',
    );
    else if (G.dialog_infix === '' && dialog_handlePageButtons(sym, uni, true, numpages)) { /* */ }
    else if (dialog_editInfix(sym, uni)) G.dialog_list_skip = 0;
    else if (doexiton(sym, uni)) popScreen();
  };
}

export function tactic_start(): void {
  // dialog::infix = "";
  popScreenAll();
  if (G.tactic_on) restart_game(rg_tactic);
  else pushScreen(tactic_showMenu);
}

// --- mode codes ---

const code_for = new Map<string, number>();
// EX map<modecode_t, string> meaning; EX map<modecode_t, modecode_t> identify_modes: G.meaning, G.identify_modes

let xcheat = 0;

/** hstream for the mode data (shstream: write<char>, write<int>, write<ld>, and the reading side). Bytes as a
 *  string of char codes 0..255, little endian like the x86 build. */
export class modestream {
  s = '';
  readpos = 0;
  vernum = 0xAA2F; // VERNUM_HEX
  write_char(c: number): void { this.s += String.fromCharCode(c & 0xFF); }
  write_int(i: number): void { for (let k = 0; k < 4; k++) this.write_char((i >>> (8 * k)) & 0xFF); }
  write_ld(x: number): void {
    const b = new Uint8Array(new Float64Array([x]).buffer);
    for (let k = 0; k < 8; k++) this.write_char(b[k]);
  }
  /** ss.write(ss.vernum): a short */
  write_short(i: number): void { this.write_char(i & 0xFF); this.write_char((i >> 8) & 0xFF); }
  get_char(): number {
    if (this.readpos >= this.s.length) throw new hr_exception('end of file');
    const c = this.s.charCodeAt(this.readpos++);
    return (c << 24) >> 24;
  }
  get_int(): number {
    let v = 0;
    for (let k = 0; k < 4; k++) v |= (this.get_char() & 0xFF) << (8 * k);
    return v | 0;
  }
  get_ld(): number {
    const b = new Uint8Array(8);
    for (let k = 0; k < 8; k++) b[k] = this.get_char() & 0xFF;
    return new Float64Array(b.buffer)[0];
  }
}

export function save_mode_data(f: modestream): void {
  mapstream_save_geometry(f);

  if (G.yendor_on || G.tactic_on)
    f.write_char(0);
  else
    f.write_char(G.land_structure);
  f.write_char(G.shmup_on ? 1 : 0);
  f.write_char(G.inv_on ? 1 : 0);
  // CAP_TOUR
  f.write_char(G.tour_on ? 1 : 0);
  f.write_char(G.peace_on ? 1 : 0);
  f.write_char(G.peace_otherpuzzles ? 1 : 0);
  f.write_char(G.peace_explore_other ? 1 : 0);
  f.write_char(G.multi_players);
  f.write_char(xcheat);
  if (G.casual) {
    f.write_char(1);
  }
  if (G.bow_weapon) {
    f.write_char(2);
    f.write_char(G.bow_weapon);
    f.write_char(G.bow_style);
  }
  if (G.use_custom_land_list) {
    f.write_char(3);
    f.write_int(landtypes);
    for (let i = 0; i < landtypes; i++) {
      f.write_char(G.custom_land_list[i] ? 1 : 0);
      f.write_int(G.custom_land_treasure[i]);
      f.write_int(G.custom_land_difficulty[i]);
      f.write_int(G.custom_land_wandering[i]);
    }
  }
  if (ls_horodisk_structure()) {
    f.write_char(4);
    f.write_int(G.horodisk_from);
  }
  if (G.land_structure === lsChaosRW) {
    f.write_char(5);
    f.write_int(G.randomwalk_size);
  }
  if (G.land_structure === lsLandscape) {
    f.write_char(6);
    f.write_int(G.landscape_div);
  }
  if (G.shmup_on && G.vid.creature_scale !== 1) {
    f.write_char(7);
    f.write_ld(G.vid.creature_scale);
  }
  if (G.use_custom_land_list) {
    let ptm_modified = false;
    for (let i = 0; i < landtypes; i++) if (G.custom_land_list[i]) {
      if (G.custom_land_ptm_runs[i] !== tactic_default_runs(i)) ptm_modified = true;
      if (G.custom_land_ptm_mult[i] !== tactic_default_mult(i)) ptm_modified = true;
    }
    if (ptm_modified) {
      f.write_char(8);
      f.write_int(landtypes);
      for (let i = 0; i < landtypes; i++) {
        f.write_char(G.custom_land_ptm_runs[i]);
        f.write_char(G.custom_land_ptm_mult[i]);
      }
    }
  }
  if (G.lineofsight !== los_none || G.lineofsightAt >= PURELOS_LEVEL) {
    f.write_char(9);
    f.write_char(G.lineofsight);
    f.write_char(G.lineofsightAt >= PURELOS_LEVEL ? 1 : 0);
  }
}

export function get_default_land_structure(): eLandStructure {
  return (
    (G.princess_challenge || G.tactic_on) ? lsSingle :
      G.racing_on ? lsSingle :
        G.yendor_on ? yendor_get_land_structure() :
          lsNiceWalls);
}

export function other_settings_default(): void {
  G.land_structure = get_default_land_structure();
  G.shmup_on = false;
  G.inv_on = false;
  // CAP_TOUR
  G.tour_on = false;
  G.peace_on = false;
  G.peace_otherpuzzles = false;
  G.peace_explore_other = false;
  G.multi_players = 1;
  xcheat = 0;
  G.casual = false;
  G.bow_weapon = 0; // bow::wBlade
  G.vid.creature_scale = 1;
  G.use_custom_land_list = false;
  G.horodisk_from = -2;
  G.randomwalk_size = 10;
  G.landscape_div = 25;
  G.lineofsight = los_none;
  G.lineofsightAt = 0;
}

export function load_mode_data_with_zero(f: modestream): void {
  mapstream_load_geometry(f);

  other_settings_default();

  G.land_structure = f.get_char();
  G.shmup_on = !!f.get_char();
  G.inv_on = !!f.get_char();
  // CAP_TOUR
  G.tour_on = !!f.get_char();
  G.peace_on = !!f.get_char();
  G.peace_otherpuzzles = !!f.get_char();
  G.peace_explore_other = !!f.get_char();
  G.multi_players = f.get_char();
  xcheat = f.get_char();

  for (;;) {
    const option = f.get_char();
    switch (option) {

      case 0:
        return;

      case 1:
        G.casual = true;
        break;

      case 2:
        G.bow_weapon = f.get_char();
        G.bow_style = f.get_char();
        break;

      case 3: {
        G.use_custom_land_list = true;
        const lt = f.get_int();
        if (lt > landtypes) throw new hr_exception('too many landtypes');
        for (let i = 0; i < lt; i++) {
          G.custom_land_list[i] = !!f.get_char();
          G.custom_land_treasure[i] = f.get_int();
          G.custom_land_difficulty[i] = f.get_int();
          G.custom_land_wandering[i] = f.get_int();
          G.custom_land_ptm_runs[i] = tactic_default_runs(i);
          G.custom_land_ptm_mult[i] = tactic_default_mult(i);
        }
        break;
      }

      case 4:
        G.horodisk_from = f.get_int();
        break;

      case 5:
        G.randomwalk_size = f.get_int();
        break;

      case 6:
        G.landscape_div = f.get_int();
        break;

      case 7:
        G.vid.creature_scale = f.get_ld();
      // falls through (as in the original: no break)

      case 8: {
        if (!G.use_custom_land_list) throw new hr_exception('PTM defined in a non-custom mode');
        const lt = f.get_int();
        for (let i = 0; i < lt; i++) {
          G.custom_land_ptm_runs[i] = f.get_char();
          G.custom_land_ptm_mult[i] = f.get_char();
        }
        break;
      }

      case 9: {
        G.lineofsight = f.get_char();
        G.lineofsightAt = f.get_char() ? PURELOS_LEVEL : 0;
        break;
      }

      default:
        throw new hr_exception('wrong option');
    }
  }
}

export const FIRST_MODECODE = 100000;

export function get_identify(xc: number): number {
  if (xc < FIRST_MODECODE && !G.meaning.has(xc)) {
    G.meaning.set(xc, 'LEGACY');
    G.identify_modes.set(xc, xc);
    return xc;
  }
  if (!G.identify_modes.has(xc)) G.identify_modes.set(xc, 0); // operator[]
  return G.identify_modes.get(xc)!;
}

// EX string expected_modecode; EX modecode_t current_modecode: G.expected_modecode, G.current_modecode

/** modecode(int mode IS(3)): 1 - just return UNKNOWN if id not assigned; 2 - assign without writing to file;
 *  3 - assign with writing to file */
export function modecode(mode = 3): number {
  const x = legacy_modecode();
  if (x !== UNKNOWN) return G.current_modecode = x;

  xcheat = (G.cheater ? 1 : 0);
  const ss = new modestream();
  ss.write_short(ss.vernum);
  save_mode_data(ss);
  const code = ss.s;
  const nover = ss.s.substring(2);

  if (code_for.has(nover)) return code_for.get(nover)!;

  if (mode === 1) return G.current_modecode = UNKNOWN;

  let next = FIRST_MODECODE;
  while (G.meaning.has(next)) next++;

  if (G.expected_modecode !== '' && G.expected_modecode !== nover && code_for.has(G.expected_modecode)) {
    next = code_for.get(G.expected_modecode)!;
    // fallthrough -- will make an alias with the current encoding
  }

  G.meaning.set(next, code);
  code_for.set(nover, next);
  G.identify_modes.set(next, next);

  if (mode === 2) {
    G.mode_description_of.set(next, mode_description1());
    return next;
  }

  if (G.scorefile === '') return next;

  // FILE *f = fopen(scorefile.c_str(), "at"); fprintf(f, "MODE %d %s\n", next, as_hexstring(ss.s)):
  // the score file is server storage in the browser (a later stage); the log line is left out.
  void as_hexstring;

  return G.current_modecode = next;
}

export function load_modecode_line(s: string): void {
  let code = parseInt(s.substring(5), 10) | 0;
  let pos = 5;
  while (pos < s.length && s[pos] !== ' ') pos++;
  if (pos >= s.length) return;
  pos++;
  const t = from_hexstring(s.substring(pos));
  const nover = t.substring(2);
  G.meaning.set(code, t);
  if (code_for.has(nover)) {
    code = code_for.get(nover)!;
    G.identify_modes.set(parseInt(s.substring(5), 10) | 0, code);
  }
  else G.identify_modes.set(code, code);
  code_for.set(nover, code);
}

export function load_modename_line(s: string): void {
  const code = parseInt(s.substring(5), 10) | 0;
  let pos = 5;
  while (pos < s.length && s[pos] !== ' ') pos++;
  if (pos >= s.length) { G.modename.delete(get_identify(code)); return; }
  pos++;
  G.modename.set(get_identify(code), s.substring(pos));
}

export function update_modename(newname: string): void {
  modecode();
  const old = G.modename.has(G.current_modecode) ? G.modename.get(G.current_modecode)! : '';
  if (old === newname) return;
  if (newname === '') G.modename.delete(G.current_modecode);
  else G.modename.set(G.current_modecode, newname);
  // fprintf(f, "NAME %d %s\n", ...): the score file (later stage)
}

// --- namespace peace ---

// EX bool on, hint, otherpuzzles, explore_other: G.peace_*

const peace_simonlevels: eLand[] = [
  laCrossroads, laCrossroads2, laRlyeh,
  laDesert, laCaves, laAlchemist, laEmerald,
  laWineyard, laDeadCaves, laRedRock, laPalace,
  laLivefjord, laDragon,
];

const peace_puzzlelevels: eLand[] = [
  laBurial, laTortoise, laCamelot, laPalace,
];

const peace_explorelevels: eLand[] = [
  laIce, laJungle, laMirror, laDryForest, laCaribbean, laOcean, laZebra,
  laOvergrown, laWhirlwind, laWarpCoast, laReptile,
  laElementalWall, laAlchemist,
];

let peace_levellist: eLand[] = [];

function peace_getNext(last: eLand): eLand {
  if (!G.peace_on) return laNone;
  if (peace_levellist.length === 0) peace_showMenu();
  if (isElemental(last) && hrand(100) < 90)
    return laNone;
  else if (createOnSea(last))
    return getNewSealand(last);
  else if (isCrossroads(last)) {
    while (isCrossroads(last) || last === laCaribbean || last === laCamelot)
      last = hrand_elt(peace_levellist);
    if (last === laElementalWall) last = laEFire;
    return last;
  }
  else return pick(laCrossroads, laCrossroads2);
}

export function peace_isAvailable(l: eLand): boolean {
  // for(int i=0; explorelevels[i]; i++): the vector has no terminating zero, the original reads past its end
  // until it finds laNone; here: the elements
  for (let i = 0; i < peace_explorelevels.length && peace_explorelevels[i]; i++) if (peace_explorelevels[i] === l) return true;
  return false;
}

// namespace simon
const simon_path: cell[] = [];
let simon_tobuild = 0;

function peace_simon_build(): void {
  if (G.peace_otherpuzzles || !G.peace_on) return;
  const path = simon_path;
  while (isize(path) < simon_tobuild) {
    const cp = path[isize(path) - 1];
    const cp2 = path[isize(path) - 2];
    const clister: [cell, cell][] = [];
    clister.push([cp, cp]);

    let id = 0;
    const cl = new manual_celllister();
    let found = false;
    try {
      outer:
      while (id < isize(clister)) {
        const c = clister[id][0];
        let fr = clister[id][1];
        setdist(c, 5, null!);

        for (let i = 0; i < c.type; i++) {
          const c2 = c.move(i); if (!c2) continue;
          if (!cl.listed(c2) && passable(c2, c, 0n) && (c2.land === G.specialland || c2.land === laTemple) && !c2.item) {
            if (!id) fr = c2;
            let next: boolean;
            if (G.specialland === laRlyeh)
              next = c2.land === laTemple && (cp2.land === laRlyeh || celldistAlt(c2) < celldistAlt(cp2) - 8);
            else
              next = celldistance(c2, cp2) === 8;
            if (next) {
              path.push(fr);
              fr.item = itDodeca;
              found = true;
              break outer; // goto again
            }
            clister.push([c2, fr]);
            cl.add(c2);
          }
        }
        id++;
      }
    }
    finally { cl.destroy(); }
    if (found) continue; // again: ;
    // printf("Path broken, searched = %d\n", id);
    for (const t of clister) t[0].item = itPirate;
    return;
  }
}

export function peace_simon_extend(): void {
  let i = 0;
  while (i < isize(simon_path) && simon_path[i].item !== itDodeca) i++;
  if (simon_tobuild === i + 9)
    addMessage('You must collect all the dodecahedra on the path!');
  simon_tobuild = i + 9;
  peace_simon_build();
}

export function peace_simon_init(): void {
  simon_tobuild = 0;
  if (!G.peace_on) return;
  if (G.peace_otherpuzzles) { G.items[itGreenStone] = 500; return; }
  const c2 = G.cwt.at.move(0);
  makeEmpty(c2);
  c2.item = itOrbYendor;

  simon_path.length = 0;
  simon_path.push(G.cwt.at);
  simon_path.push(c2);
  peace_simon_extend();
}

export function peace_simon_restore(): void {
  for (let i = 1; i < isize(simon_path); i++)
    if (simon_path[i].item === itNone && G.items[itDodeca])
      simon_path[i].item = itDodeca, G.items[itDodeca]--;
}

/** void peace::showMenu() (package U2). peace::getNext also calls it (when the level list is empty) for its effect
 *  on levellist, as the original does; peace_choose_levellist is that part alone. */
export function peace_showMenu(): void {
  dialog_init();

  let kind = 0;

  {
    dialog_addBreak(100);
    dialog_addBoolItem(XLAT('puzzles'), G.peace_otherpuzzles && !G.peace_explore_other, 49);
    dialog_add_action(() => { G.peace_otherpuzzles = true; G.peace_explore_other = false; });
    dialog_addBoolItem(XLAT('exploration'), G.peace_explore_other, 50);
    dialog_add_action(() => { G.peace_otherpuzzles = true; G.peace_explore_other = true; });
    dialog_addBoolItem(XLAT('memory game'), !G.peace_otherpuzzles && !G.peace_explore_other, 50);
    dialog_add_action(() => { G.peace_otherpuzzles = false; G.peace_explore_other = false; });
    dialog_addBreak(50);
  }

  const title =
    !G.peace_otherpuzzles ? XLAT('memory game') :
      G.peace_explore_other ? XLAT('exploration') :
        XLAT('puzzles');
  dialog_addBreak(100);
  dialog_addTitle(title, 0x40A040, 150);
  dialog_addBreak(100);

  if (!G.peace_otherpuzzles) {
    peace_levellist = peace_simonlevels, kind = 1;
    dialog_addInfo('Collect as many dodecahedra as you can!');
    dialog_addInfo('You have to return to the starting location!');
    dialog_addBreak(50);
  }
  else {
    dialog_addInfo('This mode removes roguelike elements,');
    dialog_addInfo('focusing on puzzles and exploration');
    dialog_addBreak(50);
    if (G.peace_explore_other)
      peace_levellist = peace_explorelevels, kind = 2;
    else
      peace_levellist = peace_puzzlelevels, kind = 0;
  }

  let key = 97; // 'a'
  for (const lev of peace_levellist) {
    dialog_addItem(XLAT1(linf[lev].name), key++);
    dialog_add_action(() => {
      dialog_do_if_confirmed(() => {
        peace_start_level(lev);
      });
    });
    if (kind === 0) {
      switch (lev) {
        case laBurial:
          dialog_addInfo('excavate the treasures using your magical shovel');
          break;
        case laTortoise:
          dialog_addInfo('find an adult tortoise matching the baby');
          break;
        case laCamelot:
          dialog_addInfo('find the center of the Round Table in Camelot');
          break;
        case laPalace:
          dialog_addInfo('follow the mouse');
          break;
        default:
      }
      dialog_addBreak(100);
    }
  }
  dialog_addBreak(1400 - 100 * isize(peace_levellist) * (kind === 0 ? 3 : 1));

  dialog_addBoolItem(XLAT('display hints'), G.peace_hint, 52);
  dialog_add_action(() => {
    G.peace_hint = !G.peace_hint; popScreen();
  });
  dialog_addItem(XLAT('Return to the normal game'), 48);
  dialog_add_action(() => {
    if (G.peace_on) {
      stop_game();
      if (G.peace_on) stop_game_and_switch_mode(rg_peace);
      start_game();
    }
  });

  dialog_addBack();
  dialog_display();
}

/** the level list part of peace::showMenu */
export function peace_choose_levellist(): void {
  if (!G.peace_otherpuzzles) {
    peace_levellist = peace_simonlevels;
  }
  else {
    if (G.peace_explore_other)
      peace_levellist = peace_explorelevels;
    else
      peace_levellist = peace_puzzlelevels;
  }
}

/** the game logic of a peace menu level entry */
export function peace_start_level(lev: eLand): void {
  stop_game();
  G.firstland = G.specialland = lev;
  if (!G.peace_on)
    stop_game_and_switch_mode(rg_peace);
  start_game();
  popScreenAll();
}

// EX map<modecode_t, string> mode_description_of: G.mode_description_of

// mode_screen_for_current, push_mode_screen_for, set_mode_sort_order, list_saved_custom_modes, prepare_custom: UI

export function enable_mode_by_code(_mf: number): void { throw new NotPorted('enable_mode_by_code (UI, mode screens)'); }

export function gscore(_xc: number): number { throw new NotPorted('gscore (qty_scores_for of scores.cpp, UI)'); }

export function prepare_custom(): void { throw new NotPorted('prepare_custom (UI)'); }

export function gen_mode_list(): void {
  G.mode_list.length = 0;
  for (const m of [...G.meaning.keys()].sort((a, b) => a - b))
    G.mode_list.push(m);
}

export function set_mode_sort_order(): void { throw new NotPorted('set_mode_sort_order (UI)'); }

export function list_saved_custom_modes(): void { throw new NotPorted('list_saved_custom_modes (UI)'); }

// CAP_COMMANDLINE
function read_mode_args(): number {
  if (arg_argis('-Y')) {
    G.yendor_on = true;
    arg_shift(); G.yendor_challenge = arg_argi();
  }
  else if (arg_argis('-peace')) {
    G.peace_otherpuzzles = true;
    stop_game_and_switch_mode(G.peace_on ? 0 : rg_peace);
  }
  else if (arg_argis('-pmem')) {
    G.peace_otherpuzzles = false;
    stop_game_and_switch_mode(G.peace_on ? 0 : rg_peace);
  }
  else if (arg_argis('-listmodes')) {
    throw new NotPorted('-listmodes');
  }
  // TOGGLE('T', tactic::on, stop_game_and_switch_mode(rg::tactic))
  else if (arg_args()[0] === '-' && arg_args()[1] === 'T' && arg_args().length === 2) {
    if (G.arg_curphase < 2) return 2; G.showstartmenu = false; stop_game_and_switch_mode(rg_tactic);
  }
  else if (arg_args()[0] === '-' && arg_args()[1] === 'T' && arg_args()[2] === '1') {
    if (G.arg_curphase < 2) return 2; G.showstartmenu = false; if (!G.tactic_on) stop_game_and_switch_mode(rg_tactic);
  }
  else if (arg_args()[0] === '-' && arg_args()[1] === 'T' && arg_args()[2] === '0') {
    if (G.arg_curphase < 2) return 2; G.showstartmenu = false; if (G.tactic_on) stop_game_and_switch_mode(rg_tactic);
  }
  else return 1;
  return 0;
}

/** the static initializers of yendor.cpp: the hooks, in source order */
export function register_yendor(): void {
  // auto hooks = addHook(hooks_clearmemory, 0, ...) + addHook(hooks_removecells, 0, ...);
  addHook(G.hooks_clearmemory, 0, () => {
    G.yendor_yii = NOYENDOR; G.yendor_yi.length = 0;
  });
  addHook(G.hooks_removecells, 0, () => {
    eliminate_if(G.yendor_yi, (i: yendorinfo) => {
      for (let j = 0; j < YDIST; j++) if (is_cell_removed(i.path[j])) {
        // DEBB(debug_memory, ("removing a Yendor"));
        if (G.yendor_yii < G.yendor_yi.length && G.yendor_yi[G.yendor_yii] === i) G.yendor_yii = NOYENDOR;
        return true;
      }
      return false;
    });
  });
  // peace: auto aNext = addHook(hooks_nextland, 100, getNext);
  addHook(G.hooks_nextland, 100, peace_getNext);
  // auto ah = addHook(hooks_args, 0, read_mode_args);
  addHook(G.hooks_args, 0, read_mode_args);
}
