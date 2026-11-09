// barriers.cpp of HyperRogue 13.1o: routines related to barriers (Great Walls and similar): checking and building
// the old 'nice' walls of {7,3}, the general (nowall) barriers of other tilings, mirror and cursed 6-fold walls,
// 4-fold crossings, Crossroads II, Crossroads V, and the 3D barriers.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names (PORTING.md, "Overloads"): setbarrier(c, l1, l2, setbar) / setbarrier_c(c) (the overload taking only the
// cell); buildBarrier6(cw, type) / buildBarrier6_l(cw, m0, m1) (the cursed variant); buildBarrierStrong(c, d,
// oldleft, newland?) (one function: newland undefined is the 3-argument overload, which calls getNewLand).
// `cellwalker& bb`, `int& dir`, `eLand& l1/l2/ws` (general_barrier_advance) and `bool& ok` (get_valence,
// surround_by) are Ref objects ({ v }) -- general_barrier_advance takes a gba_state object with fields bb, dir,
// l1, l2, ws. Cellwalker values are copied with clone() where C++ copies them.
// 3D (MAXMDIM >= 4): extend3D / buildBarrier3D need currentmap->dirdist and get_cellshape (reg3, a later stage):
// they are ported, the map calls throw NotPorted.
import { G } from './globals.ts';
import { NotPorted, among, isize } from './hyper.ts';
import { type Ref } from './cpp.ts';
import { type cell, cellwalker, NODIR, NOBARRIERS, NOBARRIERS2 } from './locations.ts';
import {
  type eLand, type eWall,
  laNone, laEAir, laEEarth, laEFire, laEWater, laKraken, laWarpSea, laWarpCoast, laOceanWall, laElementalWall,
  laHaunted, laHauntedWall, laMirrored2, laMirrorWall2, laMirrored, laMirrorWall, laTerracotta, laMercuryRiver,
  laBarrier, laCrossroads5, laCrossroads2, laCrossroads3, laMirror, laCrossroads6, laCursed, laAlchemist,
  waChasm, waStone, waEternalFire, waSea, waNone, waBarrier, waMercury, waMirrorWall, waRubble, waStrandedBoat,
  moHexer,
} from './content.ts';
import {
  PURE, BITRUNCATED, OINF, S3, S7, WDIM, hyperbolic, mhybrid, eVariation,
  NOWALLSEP, NOWALLSEP_SWAP, NOWALLSEP_USED, NOWALLSEP_WALL, NOWALLSEP_WALL_CPOS, NOWALLSEP_WALL_CNEG,
  NOWALLSEP_WALL_EPOS, NOWALLSEP_WALL_ENEG,
} from './classes.ts';
import { arb_in } from './arbitrile.ts';
import { arcm_in } from './archimedean.ts';
import { bt_in } from './binary-tiling.ts';
import { hybrid_get_where } from './nonisotropic.ts';
import { has_nice_dual } from './graph.ts';
import { createMov, BARLEV } from './cell.ts';
import { BUGLEV } from './hyper.ts';
import { hrand, hrandom_permutation } from './rand.ts';
import { ctof, pseudohept } from './pattern2.ts';
import { emeraldtable } from './patterns.ts';
import { isSealand, isElemental } from './flags.ts';
import {
  ls_single, ls_hv_structure, lsVineWalls, lsCrossWalls, lsCursedWalls, getNewLand, oppositeElement, isLandIngame,
} from './landlock.ts';
import { raiseBuggyGeneration, limitgen } from './debug.ts';
import { random_curse } from './landgen.ts';
import { dnameof_l } from './language.ts';
import { old_nice_walls } from './bigstuff.ts';

const notp = (what: string): never => { throw new NotPorted(what); };

/** PURE ? checkBarriersFront : checkBarriersBack */
function checkBarriersFB(bb: cellwalker, q: number, cross: boolean): boolean {
  return PURE() ? checkBarriersFront(bb, q, cross) : checkBarriersBack(bb, q, cross);
}

export function checkBarriersFront(bb: cellwalker, q = 5, cross = false): boolean {
  bb = bb.clone();

  if (!ctof(bb.at))
    return false;

  if (bb.at.mpdist < BARLEV()) return false;
  if (bb.at.mpdist === BUGLEV) return false;
  if (bb.at.bardir !== NODIR) return false;
  if (bb.spin === (PURE() ? 3 : 0)) { q--; if (!q) return true; }

  if (!cross) for (let i = 0; i < 7; i++) {
    let bb2 = bb.plus(i).addStep();
    if (bb2.at.bardir !== NODIR) return false;
    if (!PURE()) {
      bb2 = bb2.plus(4).addStep();
      if (bb2.at.bardir !== NODIR) return false;
    }
  }

  bb.addStep();
  if (!PURE()) { bb = bb.plus(3).addStep().add(3).addStep(); }
  return checkBarriersBack(bb, q);
}

/** return true if the cell c is not allowed to generate barriers because of other large things already existing nearby. */
export function hasbardir(c: cell): boolean {
  return c.bardir !== NODIR && c.bardir !== NOBARRIERS && c.bardir !== NOBARRIERS2;
}

export function preventbarriers(c: cell): void {
  if (mhybrid()) c = hybrid_get_where(c)[0];
  if (c && c.bardir === NODIR) c.bardir = NOBARRIERS;
}

export function checkBarriersBack(bb: cellwalker, q = 5, cross = false): boolean {
  bb = bb.clone();
  // printf("back, %p, s%d\n", hr::voidp(bb.at), bb.spin);

  // if(mark) { printf("mpdist = %d [%d] bardir = %d spin=%d q=%d cross=%d\n", bb.at->mpdist, BARLEV, bb.at->bardir, bb.spin, q, cross); }

  if (bb.at.mpdist < BARLEV()) return false;
  if (bb.at.mpdist === BUGLEV) return false;
  if (bb.at.bardir !== NODIR) return false;

  // if(bb.spin == 0 && bb.at->mpdist == INFD) return true;

  if (!cross) for (let i = 0; i < 7; i++) {
    let bb2 = bb.plus(i).addStep();
    if (bb2.at.bardir !== NODIR) return false;
    if (!PURE()) {
      bb2 = bb2.plus(4).addStep();
      if (bb2.at.bardir !== NODIR) return false;
    }
  }

  bb = bb.plus(3).addStep().add(PURE() ? 5 : 4).addStep().add(3);
  return checkBarriersFront(bb, q);
}

/** warp coasts use a different algorithm for nowall barriers when has_nice_dual() is on. Check whether we should use this different algorithm when the lands are l1 and l2 */
export function warped_version(l1: eLand, l2: eLand): boolean {
  return (has_nice_dual() && (l1 === laWarpCoast || l1 === laWarpSea || l2 === laWarpSea || l2 === laWarpCoast));
}

export function get_valence(bb: cellwalker, dir: number, _ok: Ref<boolean>): number {
  if (arb_in()) {
    // arb::current_or_slided().have_valence ... sh.vertex_valence
    notp('get_valence: arb::current_or_slided');
  }
  let steps = 0;
  const bb1 = bb.clone();
  while (bb1.ne(bb) || !steps) {
    bb1.add(dir);
    bb1.addStep();
    steps++;
  }
  return steps;
}

export function set_and_wall(c: cell, l: eLand): void {
  setland(c, l);
  if (c.bardir === NODIR) {
    c.bardir = NOBARRIERS;
  }
}

export function surround_by(setit: boolean, bb: cellwalker, dir: number, a: number, b: number, which: eLand, swapped: boolean, ok: Ref<boolean>): void {
  bb = bb.clone();
  for (let i = 0; i < a; i++) {
    bb.add(dir);
    bb.addStep();
  }
  for (let i = a; i < b; i++) {
    if (setit) set_and_wall(bb.at, which);
    else {
      if (bb.at.bardir !== NODIR) ok.v = false;
      if (swapped && bb.at.mpdist < BARLEV()) ok.v = false;
    }
    bb.add(dir);
    bb.addStep();
  }
}

/** spin_around_by(cellwalker& bb, int dir, int q): bb is changed in place */
export function spin_around_by(bb: cellwalker, dir: number, q: number): void {
  for (let i = 0; i < q; i++) {
    bb.add(dir);
    bb.addStep();
  }
}

export function on_wall(ws: eLand): boolean {
  return among(ws, NOWALLSEP_WALL_CPOS, NOWALLSEP_WALL_CNEG, NOWALLSEP_WALL_EPOS, NOWALLSEP_WALL_ENEG);
}

export function wsname(ws: eLand): string {
  if (ws === NOWALLSEP) return 'NO';
  if (ws === NOWALLSEP_SWAP) return 'SWAP';
  if (ws === NOWALLSEP_USED) return 'USED';
  if (ws === NOWALLSEP_WALL) return 'WALL';
  if (ws === NOWALLSEP_WALL_CPOS) return 'CPOS';
  if (ws === NOWALLSEP_WALL_CNEG) return 'CNEG';
  if (ws === NOWALLSEP_WALL_EPOS) return 'EPOS';
  if (ws === NOWALLSEP_WALL_ENEG) return 'ENEG';
  return dnameof_l(ws);
}

/** the reference parameters of general_barrier_advance: cellwalker& bb, int& dir, eLand& l1, l2, ws */
export class gba_state {
  bb: cellwalker;
  dir: number;
  l1: eLand;
  l2: eLand;
  ws: eLand;
  constructor(bb: cellwalker, dir: number, l1: eLand, l2: eLand, ws: eLand) {
    this.bb = bb; this.dir = dir; this.l1 = l1; this.l2 = l2; this.ws = ws;
  }
}

/** general_barrier_advance(cellwalker& bb, int& dir, eLand& l1, eLand& l2, eLand& ws, bool setit): st holds the
 *  reference parameters (st.bb is changed in place) */
export function general_barrier_advance(st: gba_state, setit: boolean): boolean {
  const ok: Ref<boolean> = { v: true };
  const bb = st.bb;
  let goto_again = false;
  if (st.ws === NOWALLSEP_WALL) {


    /*
    if(setit) bb.at->monst = moBug0;
    if(setit) bb.cpeek()->monst = moBug2;
    */

    const steps = get_valence(bb, st.dir, ok);
    if (steps % 2 === 0) goto_again = true;
    else {
      if (steps >= OINF) return ok.v;

      const s = (steps - 1) >> 1;
      surround_by(setit, bb, st.dir, 1, s, st.l1, false, ok);
      surround_by(setit, bb, st.dir, s + 1, steps - 1, st.l2, true, ok);
      spin_around_by(bb, st.dir, s);

      st.ws = st.dir > 0 ? NOWALLSEP_WALL_CPOS : NOWALLSEP_WALL_CNEG;
      // goto tile;
      return ok.v;
    }
  }

  if (goto_again) { /* goto again: falls to the else branch below */ }
  else if (on_wall(st.ws)) {

    const at_corner = among(st.ws, NOWALLSEP_WALL_CPOS, NOWALLSEP_WALL_CNEG);

    const current = bb.at;

    // if at_corner: bb is facing the tile 1 before the first inside
    const t = bb.at.type;

    const q = at_corner ? (t >> 1) : ((t - 1) >> 1);

    if (1) {
      const bb1 = bb.clone();
      if (at_corner) bb1.add(st.dir);
      bb1.sub(st.dir);
      for (let i = 1; i < q; i++) {
        const d = get_valence(bb1, -st.dir, ok);
        if (d >= OINF) return ok.v;
        surround_by(setit, bb1, -st.dir, 1, d, st.l1, false, ok);
        bb1.sub(st.dir);
      }
    }

    bb.add(st.dir);
    for (let i = 1; i < q; i++) {
      const d = get_valence(bb, st.dir, ok);
      if (d >= OINF) return ok.v;
      surround_by(setit, bb, st.dir, 1, d, st.l2, true, ok);
      bb.add(st.dir);
    }

    // bb is now facing the last neighbor inside

    if (t % 2 === (at_corner ? 1 : 0)) {
      if (setit) setbarrier(current, st.l1, st.l2, at_corner);
      let d = get_valence(bb, st.dir, ok);
      if (d >= OINF) return ok.v;
      surround_by(setit, bb, st.dir, 2, d, st.l2, true, ok);

      bb.add(st.dir);
      bb.addStep();

      d = get_valence(bb, -st.dir, ok);
      if (d >= OINF) return ok.v;
      surround_by(setit, bb, -st.dir, 2, d - 1, st.l1, false, ok);

      st.ws = st.dir > 0 ? NOWALLSEP_WALL_EPOS : NOWALLSEP_WALL_ENEG;
      return ok.v;
    }

    const steps1 = get_valence(bb, st.dir, ok);
    if (steps1 >= OINF) return ok.v;
    if (setit) setbarrier(current, st.l1, st.l2, true);

    if (steps1 % 2 === 0) {
      const s1 = steps1 >> 1;
      surround_by(setit, bb, st.dir, 1, s1, st.l1, false, ok);
      surround_by(setit, bb, st.dir, s1 + 1, steps1 - 1, st.l2, true, ok);
      spin_around_by(bb, st.dir, s1);
      st.ws = st.dir > 0 ? NOWALLSEP_WALL_CPOS : NOWALLSEP_WALL_CNEG;
      return ok.v;
    }

    const s1 = (steps1 - 1) >> 1;
    surround_by(setit, bb, st.dir, 1, s1, st.l1, false, ok);
    surround_by(setit, bb, st.dir, s1 + 2, steps1 - 1, st.l2, true, ok);
    spin_around_by(bb, st.dir, s1);
    bb.add(st.dir);
    st.ws = NOWALLSEP_WALL;
    return ok.v;
  }
  else if (warped_version(st.l1, st.l2)) {
    bb.set(bb.plusStep().add(2 * st.dir).addStep().add(st.dir));
    st.dir = -st.dir;
    const t = st.l1; st.l1 = st.l2; st.l2 = t;
    return ok.v;
  }

  // else { again: ... }
  while (true) {
    const bb1 = bb.clone();
    const steps = get_valence(bb, st.dir, ok);
    if (steps >= OINF) return ok.v;
    let s = 2;
    if (st.ws === NOWALLSEP_SWAP) s = 5 - s;
    if (st.dir === -1) s = 5 - s;
    s = Math.trunc((1 + steps - s) / 2);
    surround_by(setit, bb, st.dir, 1, s, st.l1, false, ok);
    surround_by(setit, bb, st.dir, s + 2, steps - 1, st.l2, true, ok);
    spin_around_by(bb, st.dir, s);
    bb.add(st.dir);
    if (steps & 1) st.ws = (st.ws === NOWALLSEP ? NOWALLSEP_SWAP : NOWALLSEP);
    if (bb.at === bb1.at) continue; // goto again
    break;
  }
  return ok.v;
}

export function general_barrier_check(bb: cellwalker, q: number, dir: number, ws: eLand, l1: eLand = laNone, l2: eLand = laNone): boolean {
  // the tail recursion of C++, as a loop (each level works on its own copies)
  bb = bb.clone();
  while (true) {
    if (l1 === l2) {
      if (bb.at.mpdist < BARLEV() || bb.cpeek().mpdist < BARLEV() || bb.cpeek().bardir !== NODIR || bb.at.bardir !== NODIR)
        return false;
      for (let i = 0; i < bb.at.type; i++) {
        const c1 = bb.at.move(i);
        if (!c1) continue;
        if (c1.bardir !== NODIR) return false;
      }
    }

    if (l1 !== l2 && bb.at.barleft !== NOWALLSEP_USED) {
      bb.at.bardir = bb.spin; bb.at.barright = l2; bb.at.barleft = ws;
      setland(bb.at, l1);
    }
    if (q <= 0) return true;

    const st = new gba_state(bb, dir, l1, l2, ws);
    const b = general_barrier_advance(st, l1 !== l2);
    dir = st.dir; l1 = st.l1; l2 = st.l2; ws = st.ws;
    if (l1 === l2 && !b) return false;
    q = q - 1;
  }
}

export function general_barrier_check_after(bb: cellwalker, steps: number, q: number, dir: number, ws: eLand, l1: eLand = laNone, l2: eLand = laNone): boolean {
  const st = new gba_state(bb.clone(), dir, l1, l2, ws);
  for (let i = 0; i < steps; i++) general_barrier_advance(st, st.l1 !== st.l2);
  return general_barrier_check(st.bb, q, st.dir, st.ws, st.l1, st.l2);
}

export function getElementalWall(l: eLand): eWall {
  if (l === laEAir) return waChasm;
  if (l === laEEarth) return waStone;
  if (l === laEFire) return waEternalFire;
  if (l === laEWater) return waSea;
  return waNone;
}

export function setbarrier(c: cell, l1: eLand, l2: eLand, setbar: boolean): void {
  if (isSealand(l1) && isSealand(l2)) {
    if (l1 === laKraken || l2 === laKraken)
      if (l1 !== laWarpSea && l2 !== laWarpSea)
        setbar = !setbar;
    c.wall = setbar ? waBarrier : waSea;
    c.land = laOceanWall;
  }
  else if (isElemental(l1) && isElemental(l2)) {
    c.land = laElementalWall;
    c.wall = getElementalWall(l1);
  }
  else if (l1 === laHaunted || l2 === laHaunted) {
    c.land = laHauntedWall;
  }
  else if (l1 === laMirrored2 || l2 === laMirrored2)
    c.land = laMirrorWall2;
  else if (l1 === laMirrored || l2 === laMirrored)
    c.land = laMirrorWall;
  else if (l1 === laTerracotta && l2 === laTerracotta) {
    c.land = laMercuryRiver;
    c.wall = waMercury;
  }
  else {
    c.wall = waBarrier;
    c.land = laBarrier;
  }
}

/** void setbarrier(cell *c) */
export function setbarrier_c(c: cell): void {
  setbarrier(c, c.barleft, c.barright, !!ctof(c));
}

// EX int setland_max = 5: G.setland_max

export function setland(c: cell, l: eLand): void {
  if (c.land !== l) {
    c.landparam = 0;
  }
  if (l === laNone && G.setland_max > 0) {
    G.setland_max--;
    // printf("error: set land to laNone\n"); // NONEDEBUG
  }
  c.land = l;
}

export function extendcheck(_c: cell): void {
  return;
  // if(BITRUNCATED && c->landparam == 0 && c->barleft != NOWALLSEP) {
  //   raiseBuggyGeneration(c, "extend error");
  //   }
}

export function mirrorwall(c: cell): boolean {
  return c.barleft === laMirrored || c.barright === laMirrored;
}

export function extendBarrierFront(c: cell): void {
  limitgen('extend front\n');
  if (G.buggyGeneration) return;
  const ht = c.landparam;
  extendcheck(c);

  let bb = new cellwalker(c, c.bardir); setbarrier_c(bb.at);
  bb.addStep();

  if (BITRUNCATED()) {
    bb.at.barleft = c.barleft;
    bb.at.barright = c.barright;
    setbarrier_c(bb.at);
    if (!mirrorwall(bb.at))
      bb.at.landparam = (ht - 4);
    //printf("[A heat %d]\n", ht-4);

    setland(bb.plus(2).cpeek(), c.barleft);
    setland(bb.plus(4).cpeek(), c.barright);

    bb = bb.plus(3).addStep();
    bb.at.barleft = c.barright;
    bb.at.barright = c.barleft;
    setbarrier_c(bb.at);
    if (!mirrorwall(bb.at))
      bb.at.landparam = (ht - 4) ^ 2;
    //printf("[B heat %d]\n", (ht-4)^2);

    bb = bb.plus(3).addStep();

    bb.at.barleft = c.barleft;
    bb.at.barright = c.barright;
    if (!mirrorwall(bb.at))
      bb.at.landparam = ht ^ 2;
  }

  //printf("[C heat %d]\n", (ht)^2);
  bb.at.bardir = bb.spin;
  bb.at.barleft = c.barright;
  bb.at.barright = c.barleft;
  // printf("#1\n");
  extendcheck(bb.at);
  extendBarrier(bb.at);

  for (let a = -3; a <= 3; a++) if (a) {
    bb.at = c; bb.spin = c.bardir; bb.add(PURE() ? -a : a); bb.addStep();
    setland(bb.at, a > 0 ? c.barright : c.barleft);
  }
}

export function extendBarrierBack(c: cell): void {
  limitgen('extend back\n');
  if (G.buggyGeneration) return;
  const ht = c.landparam;
  extendcheck(c);

  let bb = new cellwalker(c, c.bardir); setbarrier_c(bb.at);
  bb = bb.plus(3).addStep().add(PURE() ? 5 : 4);
  setland(bb.at, PURE() ? c.barleft : c.barright);
  bb = bb.plusStep().add(3);
  bb.at.bardir = bb.spin;
  bb.at.barleft = c.barright;
  bb.at.barright = c.barleft;
  if (!mirrorwall(bb.at))
    bb.at.landparam = ht ^ 11;
  extendcheck(bb.at);
  //printf("[D heat %d]\n", (ht^11));

  // needed for CR2 to work
  if (BITRUNCATED()) {
    const bb2 = bb.plusStep();
    bb2.at.barleft = c.barright;
    bb2.at.barright = c.barleft;
    if (!mirrorwall(bb2.at))
      bb2.at.landparam = (ht ^ 11) - 4;
  }
  //printf("[E heat %d]\n", (ht^11));

  // printf("#2\n");
  extendBarrier(bb.at);
}

export function barrier_land(l: eLand): boolean {
  return among(l, laBarrier, laElementalWall, laHauntedWall, laOceanWall, laMirrorWall, laMirrorWall2, laMercuryRiver);
}


export function general_barrier_extend(c: cell): void {

  const ws = c.barleft;
  const cw = new cellwalker(c, c.bardir);

  c.barleft = NOWALLSEP_USED;
  const l1 = c.land;
  const l2 = c.barright;
  if (!on_wall(ws)) {
    if (c.bardir === NODIR) {
      // println(hlog, "error: NODIR barrier at ", c);
      return;
    }
    setland(cw.cpeek(), l2);
    cw.cpeek().barleft = NOWALLSEP_USED;
  }

  if (ws === NOWALLSEP_WALL && barrier_cross(l1, l2)) {

    const p = new gba_state(cw.clone(), 1, l1, l2, ws);
    general_barrier_advance(p, false);

    const n = new gba_state(cw.clone(), -1, l1, l2, ws);
    general_barrier_advance(n, false);

    let dir = 0;

    // println(hlog, "left ", n_cw, " = ", n_cw.at->barleft, " right ", p_cw, " = ", p_cw.at->barleft, " USED = ", NOWALLSEP_USED);

    if (n.bb.at.barleft === NOWALLSEP_USED && p.bb.at.barleft !== NOWALLSEP_USED) dir = 1;
    if (p.bb.at.barleft === NOWALLSEP_USED && n.bb.at.barleft !== NOWALLSEP_USED) dir = -1;

    if (dir) {
      if (!general_barrier_check_after(cw, 2, 10, 1, NOWALLSEP_WALL_EPOS, l1, l1)) {
        // println(hlog, "failed to check 1");
        dir = 0;
      }
      if (!general_barrier_check_after(cw.plusStep(), 2, 10, 1, NOWALLSEP_WALL_EPOS, l1, l1)) {
        // println(hlog, "failed to check 2");
        dir = 0;
      }
    }

    if (dir) {
      const xl1 = oppositeElement(l1, l2);
      const xl2 = oppositeElement(l2, l1);

      if (dir === 1) {
        general_barrier_check_after(cw, 0, 10, 1, NOWALLSEP_WALL_EPOS, l1, xl2);
        general_barrier_check_after(cw.plusStep(), 0, 10, 1, NOWALLSEP_WALL_EPOS, xl1, l2);
      }
      else {
        general_barrier_check_after(cw, 0, 10, 1, NOWALLSEP_WALL_EPOS, xl2, l1);
        general_barrier_check_after(cw.plusStep(), 0, 10, 1, NOWALLSEP_WALL_EPOS, l2, xl1);
      }

      general_barrier_check(cw, 10, dir, ws, xl2, xl1);
      return;
    }
  }

  for (const i of [-1, 1]) {

    if (i === -1 && among(ws, NOWALLSEP_WALL_CPOS, NOWALLSEP_WALL_EPOS)) continue;
    if (i === +1 && among(ws, NOWALLSEP_WALL_CNEG, NOWALLSEP_WALL_ENEG)) continue;

    // general_barrier_check((cw, 10, i, ws, l1, l2);

    const st = new gba_state(cw.clone(), i, l1, l2, ws);
    general_barrier_advance(st, true);
    const cw0 = st.bb;

    if (cw0.at.barleft !== NOWALLSEP_USED) {
      setland(cw0.at, st.l1);
      cw0.at.barleft = st.ws;
      cw0.at.barright = st.l2;
      cw0.at.bardir = cw0.spin;
      extendcheck(cw0.at);
      extendBarrier(cw0.at);
    }
  }
}

let gotit = false;

export function extendCR5(c: cell): void {
  if (!BITRUNCATED()) return;
  // if(c->barright == laCrossroads5) extendCR5(c);
  const forbidden = c.barleft;
  let forbidden2 = laNone;
  let cw = new cellwalker(c, c.bardir);
  for (let u = 0; u < 2; u++) {
    // if(gotit) break;
    cw = cw.plus(2).addStep().add(2).addStep().add(5);
    if (cw.at.bardir === NODIR) {
      cw.at.landparam = 40;
      cw.at.bardir = cw.spin;
      cw.at.barright = laCrossroads5;
      let nland = forbidden;
      for (let i = 0; i < 10 && (nland === forbidden || nland === forbidden2); i++)
        nland = getNewLand(laCrossroads5);
      if (ls_single() && G.specialland === laCrossroads5)
        nland = laCrossroads5;
      cw.at.barleft = forbidden2 = nland;
      G.landcount[nland]++;
      extendBarrier(cw.at);
      gotit = true;
    }
    else forbidden2 = cw.at.barleft;
  }
}

export function isbar4(c: cell): boolean {
  return (
    c.wall === waBarrier || c.land === laElementalWall ||
    c.land === laMirrorWall || c.land === laMirrorWall2 ||
    c.land === laMercuryRiver);
}

export function barrier_cross(l: eLand, r: eLand): boolean {
  if (G.land_structure === lsVineWalls) return false;
  if (l === laCrossroads3 || r === laCrossroads3) return hrand(100) < 66;
  if (G.land_structure === lsCrossWalls && !among(laCrossroads2, l, r)) return hrand(100) < 90;
  if (isElemental(l) && isElemental(r)) return hrand(100) < 75;
  return false;
}

export function extendBarrier(c: cell): void {
  limitgen('extend barrier\n');
  if (G.buggyGeneration) return;

  if (c.barleft === NOWALLSEP_USED) return;

  extendcheck(c);

  if (barrier_land(c.land)) return;

  //  if(c->wall == waWaxWall) return;
  if (c.mpdist > BARLEV()) {
    // printf("-> too far\n");
    return; // == INFD) return;
  }

  if (c.barleft === NOWALLSEP || c.barleft === NOWALLSEP_SWAP || c.barleft === NOWALLSEP_WALL || on_wall(c.barleft)) {
    // #if MAXMDIM >= 4
    if (WDIM() === 3) extend3D(c);
    else
      general_barrier_extend(c);
    return;
  }

  const firstmirror =
    (c.barleft === laMirrored || c.barright === laMirrored) &&
      c.barleft !== laMirrored2 && c.barright !== laMirrored2;

  if (firstmirror && c.barleft === laMirror && hrand(100) < 60) {
    const cw = new cellwalker(c, c.bardir);
    if (BITRUNCATED()) cw.addStep();
    if (cw.at.land !== laMirrorWall)
      if (buildBarrier6(cw, 1)) return;
  }

  if (firstmirror && (PURE() ? c.barleft === laMirror : c.barright === laMirror) && hrand(100) < 60) {
    let cw = new cellwalker(c, c.bardir);
    if (PURE()) {
      cw = cw.minus(3).addStep().add(-3);
    }
    else {
      cw = cw.plusStep().add(3).addStep().add(-1); // check this
    }
    if (buildBarrier6(cw, 2)) return;
  }

  if (G.land_structure === lsCursedWalls && c.barleft !== laMirror && c.barright !== laMirror && hrand(100) < 80 && !among(laCrossroads2, c.barleft, c.barright)) {
    let cw = new cellwalker(c, c.bardir);
    cw = cw.plusStep().add(3).addStep().add(-1);
    if (buildBarrier6_l(cw, c.barright, c.barleft)) return;
  }

  if (among(laCrossroads6, c.barleft, c.barright) && hrand(100) < 80) {
    let cw = new cellwalker(c, c.bardir);
    cw = cw.plusStep().add(3).addStep().add(-1);
    if (buildBarrier6_l(cw, c.barright, c.barleft)) return;
  }

  if (barrier_cross(c.barleft, c.barright) || (firstmirror && hrand(100) < 60)) {

    let cw = new cellwalker(c, c.bardir);
    if (PURE()) {
      cw.addStep();
      if (isbar4(cw.at)) {
        cw = cw.plusStep().add(3).addStep().add(-1).addStep();
        const b = buildBarrier4(cw.at, cw.spin, 2, oppositeElement(c.barleft, c.barright), c.barright);
        if (b) return;
      }
      else {
        const b = buildBarrier4(c, c.bardir, 1, c.barleft, c.barright);
        if (b) return;
      }
    }
    else {
      cw = cw.plus(3).addStep();
      const cp = cw.plus(4).addStep().at;
      if (!isbar4(cp)) {
        cw = cw.plus(2).addStep();
        const b = buildBarrier4(cw.at, cw.spin, 2, oppositeElement(c.barleft, c.barright), c.barright);
        if (b) return;
      }
      else {
        const b = buildBarrier4(c, c.bardir, 1, c.barleft, c.barright);
        if (b) return;
      }
    }
  }

  extendBarrierFront(c);
  extendBarrierBack(c);

  if (c.barright === laCrossroads5) extendCR5(c);
}

export function buildBarrierForce(c: cell, d: number, l: eLand): void {
  c.bardir = d;
  const oldland = c.land;
  if (oldland === laNone) {
    raiseBuggyGeneration(c, 'oldland is NONE');
    return;
  }
  const newland = l ? l : getNewLand(oldland);
  G.landcount[newland]++;
  if (d === 4 || d === 5 || d === 6) { c.barleft = oldland; c.barright = newland; }
  else { c.barleft = newland; c.barright = oldland; }
  if (!mirrorwall(c)) c.landparam = 40;
  extendcheck(c);
}

export function buildBarrier(c: cell, d: number, l: eLand = laNone): void {

  if (!old_nice_walls()) {
    general_barrier_build(NOWALLSEP_WALL, c, l ? l : getNewLand(c.land), NODIR);
    return;
  }

  d %= 7;
  const bb = new cellwalker(c, d);

  if (checkBarriersFront(bb) && checkBarriersBack(bb))
    buildBarrierForce(c, d, l);
}

/** mirror variant of 6-fold walls */
export function buildBarrier6(cw: cellwalker, type: number): boolean {
  limitgen('build6\n');

  const b: cellwalker[] = [new cellwalker(), new cellwalker(), new cellwalker(), new cellwalker()];

  if (G.buggyGeneration) return true;

  if (BITRUNCATED()) {
    b[0] = cw.plusStep();
    b[1] = cw.plus(1).addStep().add(3).addStep();
    b[2] = cw.plus(4).addStep();
    b[3] = cw.plus(3).addStep().add(3).addStep();
  }
  else {
    b[0] = cw.clone();
    b[1] = cw.plus(3).addStep().add(3);
    b[2] = cw.minus(2).addStep().add(-3);
    b[3] = cw.minus(3).addStep().add(2).addStep().add(-3);

    if (type === 1 && b[3].at.land !== laMirrorWall) return false;
    if (type === 2 && b[1].plusStep().at.land !== laMirrorWall) return false;
    // if(type == 2 && b[2].at->land != laMirrorWall) return false;
  }

  if (false) {
    for (let z = 0; z < 4; z++) {
      // printf("%p/%d\n", hr::voidp(b[z].at), b[z].spin);
      b[z].at.wall = waStrandedBoat; b[z].at.land = laAlchemist;
      b[z].at.mondir = b[z].spin;
      b[z].at.mpdist = 7;
      b[z].at.item = 1 + z;
      G.buggyGeneration = true;
    }
    return true;
  }

  if (type === 1) {
    if (!checkBarriersFB(b[1], 6, true)) return false;
    if (!checkBarriersFB(b[2], 6, true)) return false;
  }
  else {
    if (!checkBarriersFB(b[0], 6, true)) return false;
    if (!checkBarriersFB(b[3], 6, true)) return false;
  }

  const m0 = laMirror;
  const m1 = laMirrored;
  const m2 = laMirrored2;
  const mw1 = laMirrorWall;
  const mw2 = laMirrorWall2;
  const w = waMirrorWall;

  for (let d = 0; d < 4; d++) {
    b[d].at.bardir = b[d].spin;

    if (PURE()) {
      b[0].at.barleft = m1; b[0].at.barright = m2;
      b[1].at.barleft = m0; b[1].at.barright = m1;
      b[2].at.barleft = m2; b[2].at.barright = m1;
      b[3].at.barleft = m1; b[3].at.barright = m0;
    }
    else {
      b[0].at.barleft = m0; b[0].at.barright = m1;
      b[1].at.barleft = m1; b[1].at.barright = m0;
      b[2].at.barleft = m1; b[2].at.barright = m2;
      b[3].at.barleft = m2; b[3].at.barright = m1;
    }

    (PURE() ? extendBarrierFront : extendBarrierBack)(b[d].at);
  }

  if (PURE() && false) {
    for (let z = 0; z < 4; z++)
      b[z].at.item = 1 + z + 4 * type;
    for (let a = 0; a < 4; a++)
      extendBarrierBack(b[a].plusStep().at);
  }

  if (BITRUNCATED()) {
    setland(cw.plus(1).cpeek(), mw1);
    setland(cw.plus(2).cpeek(), m1);
    setland(cw.plus(3).cpeek(), mw2);
    setland(cw.plus(4).cpeek(), mw2);
    setland(cw.plus(5).cpeek(), m1);
    setland(cw.plus(0).cpeek(), mw1);
    setland(b[0].plus(2).cpeek(), m1);
    setland(b[3].plus(6).cpeek(), m2);
    setland(b[3].plus(5).cpeek(), m2);
    setland(b[1].minus(1).cpeek(), m1);
    setland(b[2].minus(2).cpeek(), m1);
    setland(b[1].minus(2).cpeek(), m1);
    setland(b[0].minus(2).cpeek(), m0);
    cw.at.land = mw1;
    cw.at.wall = w;
    cw.at.landparam = 1;
  }
  else {
    setland(cw.at, mw2);
    setland(cw.plus(0).cpeek(), mw2);
    setland(cw.plus(1).cpeek(), m1);
    setland(cw.plus(2).cpeek(), m1);
    setland(cw.plus(3).cpeek(), mw1);
    setland(cw.plus(4).cpeek(), m1);
    setland(cw.plus(5).cpeek(), mw2);
    setland(cw.plus(6).cpeek(), m2);

    setland(b[1].cpeek(), mw1);
    setland(b[1].plus(1).cpeek(), m0);
    setland(b[1].plus(2).cpeek(), mw1);
    setland(b[1].plus(6).cpeek(), m1);

    setland(b[0].plusStep().add(-2).cpeek(), m1);
    setland(b[3].plusStep().add(-2).cpeek(), m1);
  }

  return true;
}

// EX int curse_percentage = 10: G.curse_percentage

/** cursed variant of 6-fold walls: bool buildBarrier6(cellwalker cw, eLand m0, eLand m1) */
export function buildBarrier6_l(cw: cellwalker, m0: eLand, m1: eLand): boolean {
  const b: cellwalker[] = [];
  if (G.buggyGeneration) return true;

  for (let i = 0; i < 6; i += 2)
    b[i] = cw.plus(i).addStep();
  for (let i = 1; i < 6; i += 2)
    b[i] = cw.plus(i).addStep().add(3).addStep();

  for (let i = 0; i < 6; i++) if (i !== 1) {
    if (!checkBarriersFB(b[i], 6, true)) return false;
  }

  for (let d = 0; d < 6; d++) {
    b[d].at.bardir = b[d].spin;
    b[d].at.barleft = (d & 1) ? m1 : m0;
    b[d].at.barright = (d & 1) ? m0 : m1;
    (PURE() ? extendBarrierFront : extendBarrierBack)(b[d].at);
  }

  cw.at.land = laBarrier;
  cw.at.wall = waBarrier;
  for (let i = 0; i < cw.at.type; i++) { const c = createMov(cw.at, i); c.land = laBarrier; c.wall = waBarrier; }
  for (let d = 0; d < 6; d += 2) {
    setland(b[d].minus(2).cpeek(), m0);
    setland(b[d].plus(2).cpeek(), m1);
    setland(b[d + 1].minus(2).cpeek(), m1);
    setland(b[d + 1].plus(2).cpeek(), m0);
  }
  if (isLandIngame(laCursed)) {
    let cp = G.curse_percentage;
    if (m0 === laCrossroads6 || m1 === laCrossroads6) {
      cp = 25;
      if (m0 === laCursed || m1 === laCursed) cp = 100;
    }
    if (hrand(100) < cp) {
      setland(cw.at, laCursed);
      cw.at.wall = waRubble;
      cw.at.monst = moHexer;
      cw.at.item = random_curse();
    }
  }

  return true;
}

export function buildBarrier4(c: cell, d: number, mode: number, ll: eLand, lr: eLand): boolean {
  limitgen('build4\n');
  if (G.buggyGeneration) return true;
  d %= 7;

  const cd = new cellwalker(c, d);

  const b1 = cd.clone();
  const b2 = PURE() ? cd.plusStep() : cd.plusStep().add(3).addStep().add(3).addStep();
  const b3 = PURE() ? cd.minus(1).addStep().add(3) : cd.plusStep().add(4).addStep().add(4);
  const b4 = PURE() ? cd.plus(1).addStep().add(-3) : cd.plusStep().add(-4).addStep().add(-4);

  if (mode === 0) {
    if (!((checkBarriersBack(b1) && checkBarriersBack(b2)))) return false;
    if (!((checkBarriersFront(b3) && checkBarriersFront(b4)))) return false;
  }

  if (mode === 1) {
    if (!(checkBarriersFront(b3, 5, true) && checkBarriersFront(b4, 5, true)))
      return false;
  }

  if (mode === 2) {
    if (!((checkBarriersBack(b1, 5, true) && checkBarriersBack(b2, 5, true))))
      return false;
  }

  const xl = oppositeElement(ll, lr);
  const xr = oppositeElement(lr, ll);

  c.bardir = d; c.barleft = ll; c.barright = lr; extendBarrierBack(c);

  c = b2.at; d = b2.spin;
  c.bardir = d; c.barleft = xl; c.barright = xr; extendBarrierBack(c);

  c = b3.at; d = b3.spin;
  c.bardir = d; c.barleft = xl; c.barright = lr; extendBarrierFront(c);

  c = b4.at; d = b4.spin;
  c.bardir = d; c.barleft = ll; c.barright = xr; extendBarrierFront(c);

  if (BITRUNCATED()) for (let a = -3; a <= 3; a++) if (a) {
    setland(b1.plus(a).cpeek(), a > 0 ? lr : ll);
    setland(b2.plus(a).cpeek(), a > 0 ? xr : xl);
    setland(b3.plus(a).cpeek(), a > 0 ? lr : xl);
    setland(b4.plus(a).cpeek(), a > 0 ? xr : ll);
  }

  if (PURE()) { setbarrier_c(b1.at); setbarrier_c(b2.at); setbarrier_c(b3.at); setbarrier_c(b4.at); }

  if (BITRUNCATED()) {
    let cp: cell;
    cp = b1.plusStep().at;
    cp.barleft = ll; cp.barright = lr; setbarrier_c(cp);
    cp = b2.plusStep().at;
    cp.barleft = xl; cp.barright = xr; setbarrier_c(cp);
  }

  return true;
}

/** buildBarrierStrong(cell *c, int d, bool oldleft, eLand newland) and buildBarrierStrong(cell *c, int d, bool
 *  oldleft) (newland undefined: getNewLand(c->land)) */
export function buildBarrierStrong(c: cell, d: number, oldleft: boolean, newland?: eLand): void {
  if (newland === undefined) { buildBarrierStrong(c, d, oldleft, getNewLand(c.land)); return; }
  d %= 7;
  const bb = new cellwalker(c, d);

  c.bardir = d;
  const oldland = c.land;
  G.landcount[newland]++;

  if (oldleft) { c.barleft = oldland; c.barright = newland; }
  else { c.barleft = newland; c.barright = oldland; }
  extendcheck(bb.at);
}

export function buildCrossroads2(c: cell): void {

  if (G.buggyGeneration) return;

  if (!c) return;
  if (ls_hv_structure()) return;

  for (let i = 0; i < c.type; i++)
    if (c.move(i) && !c.move(i).landparam && c.move(i).mpdist < c.mpdist)
      buildCrossroads2(c.move(i));

  if (hasbardir(c))
    extendBarrier(c);

  if (c.land !== laCrossroads2) return;

  if (!c.landparam) {
    for (let i = 0; i < c.type; i++) {
      const c2 = createMov(c, i);
      if (c2 && c2.landparam && (c2.land === laCrossroads2 || c2.land === laBarrier)) {
        for (let j = 0; j < c2.type; j++) {
          createMov(c2, j);
          const c3 = c2.move(j);
          if (c3 && c3.landparam && (c3.land === laCrossroads2 || c3.land === laBarrier)) {
            const h2 = c2.landparam;
            const h3 = c3.landparam;

            if (h2 > 100) { raiseBuggyGeneration(c2, 'bad c2 landparam'); return; }
            if (h3 > 100) { raiseBuggyGeneration(c3, 'bad c3 landparam'); return; }

            // ambiguous
            if (Math.trunc(h2 / 4) === 1 && Math.trunc(h3 / 4) === 3) continue;
            if (Math.trunc(h2 / 4) === 3 && Math.trunc(h3 / 4) === 1) continue;

            for (let d = 0; d < c2.type; d++)
              if (emeraldtable[h2][d] === h3) {
                const nh = emeraldtable[h2][(42 + d + c.c.spin(i) - j) % c2.type];
                if (c.landparam > 0 && c.landparam !== nh) {
                  // printf("CONFLICT\n");
                  raiseBuggyGeneration(c, 'CONFLICT');
                }
                c.landparam = nh;
              }

            // if(c->landparam == 0) printf("H2 = %d H3=%d\n", c2->landparam, c3->landparam);
          }
        }
        if (c.landparam === 0) {
          // printf("H2 = %d\n", c2->landparam);
          //        halted = true;
          //        c->heat = -1;
          raiseBuggyGeneration(c, 'buildCrossroads2x');
          return;
        }
      }
    }

    if (c.landparam) {
      //    for(int i=0; i<c->type; i++) {
      //      cell *c2 = c->move(i);
      //      buildCrossroads2(c2);
      //      }
    }
    else {
      raiseBuggyGeneration(c, 'buildCrossroads2');
      return;
    }
  }

  const h = c.landparam;

  if (Math.trunc(h / 4) >= 8 && Math.trunc(h / 4) <= 11) {
    for (let i = 0; i < c.type; i++) if ((c.land as eLand) !== laBarrier) {
      const c2 = createMov(c, i);
      if (c2.land === laBarrier) continue;
      c2.land = laCrossroads2;
      if (!c2.landparam) buildCrossroads2(c2);
    }
    if (Math.trunc(h / 4) === 8 || Math.trunc(h / 4) === 10)
      for (let i = 0; i < c.type; i++) {
        if (c.move(i) && c.move(i).landparam === h - 4) {
          let oldleft = true;
          for (let j = 1; j <= 3; j++)
            if (c.modmove(i + j) && c.modmove(i + j).mpdist < c.mpdist)
              oldleft = false;

          c.landparam = h;
          if (ls_single())
            buildBarrierStrong(c, i, oldleft, G.specialland);
          else
            buildBarrierStrong(c, i, oldleft);
          c.landparam = h;
          extendBarrier(c);
        }
      }
  }
}

// #if MAXMDIM >= 4
export function bufferzone(): boolean { return PURE() && S7() === 6; }
export function basic_tests(): number { return 50; }

export function valid_dir(ad: number[], j: number, _c: cell): boolean {
  const bch = G.variation === eVariation.bch;
  if (!bch) return ad[j] === 1;

  if (ad[j] !== 2) return false;
  return notp('valid_dir: currentmap->get_cellshape(c).dirdist');
}

/** currentmap->dirdist(cw) (3D maps, a later stage) */
function dirdist(_cw: cellwalker): number[] { return notp('hrmap::dirdist (3D)'); }

export function extend3D(c: cell): void {
  const l1 = c.land;
  c.barleft = NOWALLSEP_USED;

  const cw = new cellwalker(c, c.bardir);

  if (bufferzone()) {
    cw.addStep(); cw.addRev();
    cw.at.bardir = NOBARRIERS;
    setland(cw.at, laBarrier);
  }

  const cw1 = cw.plusStep();
  setland(cw1.at, c.barright);
  if (cw1.at.bardir === NODIR) {
    cw1.at.barleft = NOWALLSEP_USED;
    cw1.at.barright = l1;
    cw1.at.bardir = cw1.spin;
  }

  const bch = G.variation === eVariation.bch;

  const ad = dirdist(cw);
  for (let j = 0; j < cw.at.type; j++) {

    if (!valid_dir(ad, j, cw.at)) {
      if (bch && ad[j] === 1) {
        const c1 = cw.at.cmove(j);
        c1.bardir = NOBARRIERS;
        setland(c1, c.barright);
      }

      if (bch && ad[j] === 2) {
        const c1 = cw.at.cmove(j);
        c1.bardir = NOBARRIERS;
        setland(c1, l1);
      }

      continue;
    }

    const bb2 = G.currentmap.strafe(cw, j).clone();
    if (bufferzone()) { bb2.addRev(); bb2.addStep(); }

    if (bb2.at.bardir === NODIR) {
      bb2.at.bardir = bb2.spin;
      bb2.at.barleft = NOWALLSEP;
      bb2.at.barright = c.barright;
      bb2.at.land = l1;
      // bb2.at->item = itGold;
      extendBarrier(bb2.at);
    }
  }
}

let built = false;

export function buildBarrier3D(c: cell, l2: eLand, forced_dir: number): boolean {
  if (forced_dir === NODIR) {
    for (let t = 0; t < c.type; t++) if ((!c.move(t) || c.move(t).mpdist > c.mpdist) && buildBarrier3D(c, l2, t)) return true;
    return false;
  }
  const bch = G.variation === eVariation.bch;

  const cw = new cellwalker(c, forced_dir);

  if (bch) {
    const ad = dirdist(cw);
    let a = 0;
    for (const dd of ad) if (dd === 1) a++;
    if (a === 6) return false;
  }

  if (bufferzone()) { cw.addStep(); cw.addRev(); }
  const listed_cells = new Set<cell>([cw.at]);
  const to_test: cellwalker[] = [cw.clone()];
  const tc = basic_tests();
  for (let i = 0; i < isize(to_test); i++) {
    const bb = to_test[i].clone();
    if (bb.at.mpdist < BARLEV()) return false;
    if (bb.cpeek().mpdist < BARLEV()) return false;
    if (bb.cpeek().bardir !== NODIR) return false;
    if (bufferzone() && bb.plusRev().cpeek().mpdist < BARLEV()) return false;
    if (bufferzone() && bb.plusRev().cpeek().bardir !== NODIR) return false;
    if (bb.at.bardir !== NODIR) return false;
    const ad = dirdist(bb);
    for (let j = 0; j < bb.at.type; j++) {
      if (i < tc) bb.at.cmove(j);
      if (!bb.at.move(j)) continue;
      if (!valid_dir(ad, j, bb.at)) continue;
      const bb2 = G.currentmap.strafe(bb, j).clone();
      if (listed_cells.has(bb2.at)) continue;
      listed_cells.add(bb2.at);
      to_test.push(bb2);
    }
  }

  for (let i = 0; i < isize(to_test); i++) {
    const bb = to_test[i].clone();
    if (bufferzone()) { bb.at.bardir = NOBARRIERS; setland(bb.at, laBarrier); bb.addRev(); bb.addStep(); }
    bb.at.land = c.land;
    bb.at.bardir = bb.spin;
    bb.at.barleft = NOWALLSEP;
    bb.at.barright = l2;
    extendBarrier(bb.at);
  }

  built = true;
  return true;
}

export function buildBarrierNowall(c: cell, l2: eLand, forced_dir: number = NODIR): boolean {
  if (among(l2, laCrossroads2, laCrossroads5)) return false;
  return general_barrier_build(NOWALLSEP, c, l2, forced_dir);
}

export function general_barrier_build(ws: eLand, c: cell, l2: eLand, forced_dir: number = NODIR): boolean {

  if (S3() >= OINF) { c.land = l2; return true; }

  // #if MAXMDIM >= 4
  // 3D binary tilings create walls using their own methods
  if (WDIM() === 3 && bt_in()) return false;

  if (WDIM() === 3 && hyperbolic()) return buildBarrier3D(c, l2, forced_dir);

  if (c.land === laNone) {
    // printf("barrier nowall! [%p]\n", hr::voidp(c));
    raiseBuggyGeneration(c, 'barrier nowall!');
    return false;
  }

  const warpv = warped_version(c.land, l2);
  if (warpv && !arcm_in() && !pseudohept(c)) return false;

  const ds = hrandom_permutation(c.type);

  const wsx = warpv ? laWarpCoast : laNone;
  const l1 = c.land;

  if (forced_dir !== NODIR) {
    const cw = new cellwalker(c, forced_dir);
    general_barrier_check(cw, 20, -1, ws, l1, l2);
    general_barrier_check(cw, 20, 1, ws, l1, l2);
    extendBarrier(c);
    return true;
  }

  for (const d of ds) {
    if (c.move(d) && c.move(d).mpdist <= c.mpdist) continue;
    const cw = new cellwalker(c, d);
    if (general_barrier_check(cw, 20, -1, ws, wsx, wsx) && general_barrier_check(cw, 20, 1, ws, wsx, wsx)) {
      general_barrier_check(cw, 20, -1, ws, l1, l2);
      general_barrier_check(cw, 20, 1, ws, l1, l2);
      extendBarrier(c);
      return true;
    }
  }

  return false;
}

void gotit; void built;
