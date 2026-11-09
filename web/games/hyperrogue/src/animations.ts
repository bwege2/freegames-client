// animations.cpp of HyperRogue 13.1o: movement, attack and hug animations (the `animations` layers, applyAnimation,
// the chains of worms and tentacles), falling floors and monsters (fallanims), flashes, bubbles and particles
// (flashes, drawFlashes), the animation clock (ptick, fractick, sintick, spintick). Stage 2, package D4
// (PORTING-STAGE2.md; stage 1 had the rand() calls of the particles). (C) Zeno Rogue, GPL-2.0-or-later;
// TypeScript port.
//
// The maps of cells iterate in `_id` order where the order is observable (PORTING.md "Pointer order").
// `celldrawer::draw_fallanims` is `celldrawer_draw_fallanims(cd)`. Not ported (STAGE2-STUB): the 3D branches
// (queueball), affine geometries (qAFFINE), cylinder embeddings, static_bubbles (always false).
import type { cell, movei } from './locations.ts';
import type { eItem, eMonster, eWall } from './content.ts';
import { iinf, minf, itNone, itOrbFlash, waNone, waVinePlant, moNone, moBullet } from './content.ts';
import { G } from './globals.ts';
import { rand } from './rand.ts';
import { changes } from './pcmove.ts';
import { euclid, sphere, GDIM, cgflags, qAFFINE } from './classes.ts';
import { gcd, NotPorted, PPR, isize } from './hyper.ts';
import {
  type transmatrix, type shiftmatrix, type hyperpoint, TAU, Id, C0, tcopy, tmul, tmulh, smul, inverse, iso_inverse,
  hdist, hdist0, rspintox, rgpushxto0, xpush, cpush, tC0, tC0_sm, fixmatrix, shiftless, shiftless_t, inverse_shift,
  shift_method, smaAnimation, atan2_h,
} from './hyperpoint.ts';
import { spin, lzpush, lxpush, lrspintox, lmirror, tile_center, xspinpush0 } from './embeddings.ts';
import { c_sin, c_exp, c_atan2 } from './cpp.ts';
import { cgi } from './geometry.ts';
import { adjust_aspeed, shift_v_towards, confusingGeometry as confusingGeometry_hg } from './hypgraph.ts';
import { lpispin, pushdown } from './graph.ts';
import { firegradient, gradient, darkena, apply_neon } from './colors.ts';
import { queuepoly, queuepolyat, queuestr_V, curvepoint, queuecurve, OUTLINE_DEFAULT } from './drawing.ts';
import { draw_qfi } from './floorshapes.ts';
import { calc_relative_matrix } from './geometry2.ts';
import { celldistance } from './cell.ts';
import { is_cell_removed } from './savemem.ts';
import { drawMonsterType } from './graph-monster.ts';
import { placeSidewall } from './graph-wall.ts';
import { SIDE_WALL } from './geometry.ts';
import { looks_like_player } from './flags.ts';
import { getcs } from './config.ts';
import { pshSpaceship, pshRatling } from './graph-player.ts';
import type { celldrawer } from './celldrawer.ts';

// drawLightning() is graph-player.cpp's (the rules import it from here)
export { drawLightning } from './graph-player.ts';

/** enum eLayer */
export const LAYER_BIG = 0, LAYER_SMALL = 1, LAYER_BOAT = 2, LAYER_THROW = 3, ANIMLAYERS = 4;

/** struct animation (std::map::operator[] value-initializes it: all zero) */
export class animation {
  ltick = 0;
  footphase = 0;
  wherenow: transmatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  /** 0 = no attack animation, 1 = first phase, 2 = second phase, 3 = hugging */
  attacking = 0;
  attackat: transmatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  mirrored = false;
  /** for thrown items */
  thrown_item: eItem = 0;
  /** for thrown monsters */
  thrown_monster: eMonster = 0;
  clone(): animation {
    const a = new animation();
    a.ltick = this.ltick; a.footphase = this.footphase; a.wherenow = tcopy(this.wherenow); a.attacking = this.attacking;
    a.attackat = tcopy(this.attackat); a.mirrored = this.mirrored; a.thrown_item = this.thrown_item;
    a.thrown_monster = this.thrown_monster;
    return a;
  }
  set(b: animation): void {
    this.ltick = b.ltick; this.footphase = b.footphase; this.wherenow = tcopy(b.wherenow); this.attacking = b.attacking;
    this.attackat = tcopy(b.attackat); this.mirrored = b.mirrored; this.thrown_item = b.thrown_item;
    this.thrown_monster = b.thrown_monster;
  }
}

/** EX array<map<cell*, animation>, ANIMLAYERS> animations */
export const animations: Map<cell, animation>[] = [new Map(), new Map(), new Map(), new Map()];

/** animations[layer][c] (std::map::operator[]: inserts a zero animation when missing) */
export function anim_at(layer: number, c: cell): animation {
  let a = animations[layer].get(c);
  if (!a) { a = new animation(); animations[layer].set(c, a); }
  return a;
}

const adjm = (c: cell, i: number): transmatrix => G.currentmap.adj(c, i);

export function revhint(c: cell, hint: number): number {
  if (hint >= 0 && hint < c.type) return c.c.spin(hint);
  else return hint;
}

export function adj(m: movei): transmatrix {
  if (m.proper()) return G.currentmap.adj(m.s, m.d);
  else return G.currentmap.relative_matrix(m.t, m.s, C0());
}

export function iadj(m: movei): transmatrix {
  if (m.proper()) return G.currentmap.iadj(m.s, m.d);
  else return G.currentmap.relative_matrix(m.s, m.t, C0());
}

export function animateMovement(m: movei, layer: number): void {
  if (G.vid.mspeed >= 5) return; // no animations!
  if (changes.on) { const mc = m.clone(); changes.at_commit(() => animateMovement(mc, layer)); return; }
  const T = iadj(m);
  const found_s = animations[layer].has(m.s);
  const a = anim_at(layer, m.t);
  if (found_s) {
    a.set(animations[layer].get(m.s)!);
    a.wherenow = tmul(T, a.wherenow);
    if (m.s !== m.t)
      animations[layer].delete(m.s);
    a.attacking = 0;
  }
  else {
    a.ltick = G.ticks;
    a.wherenow = T;
    a.footphase = 0;
    a.mirrored = false;
  }
  if (m.proper() && m.s.c.mirror(m.d))
    a.mirrored = !a.mirrored;
}

export function animate_item_throw(from: cell, to: cell, it: eItem, mo: eMonster = moNone): void {

  let steps = false;
  again: for (;;) {
    if (from !== to) {
      for (let i = 0; i < from.type; i++) {
        const c1 = from.move(i); if (!c1) continue;
        if (celldistance(c1, to) < celldistance(from, to)) {
          animateMovement(movei_make(from, i), LAYER_THROW);
          from = c1;
          steps = true;
          continue again;
        }
      }
    }
    break;
  }

  if (steps) {
    const a = anim_at(LAYER_THROW, to);
    a.thrown_item = it;
    a.thrown_monster = mo;
  }
}
import { movei as movei_c } from './locations.ts';
/** movei(cell *s, int d) */
function movei_make(s: cell, d: number): movei { return movei_c.sd(s, d); }

export function animateAttackOrHug(m: movei, layer: number, phase: number, ratio: number, delta: number): void {
  if (changes.on) { const mc = m.clone(); changes.at_commit(() => animateAttack(mc, layer)); return; }
  if (G.vid.mspeed >= 5) return; // no animations!
  const T = iadj(m);
  const newanim = !animations[layer].has(m.s);
  const a = anim_at(layer, m.s);
  a.attacking = phase;
  const TC0 = tile_center();
  a.attackat = tmul(lrspintox(tmulh(iso_inverse(T), TC0)), lxpush(hdist(TC0, tmulh(T, TC0)) * ratio + delta));
  if (newanim) { a.wherenow = tcopy(Id); a.ltick = G.ticks; a.footphase = 0; }
}

export function animateAttack(m: movei, layer: number): void {
  animateAttackOrHug(m, layer, 1, 1 / 3., 0);
}

export function animateCorrectAttack(m: movei, layer: number, who: eMonster): void {
  if (looks_like_player(who) && (getcs().charid >> 1) === pshSpaceship) {
    animate_item_throw(m.s, m.t, itNone, moBullet);
    return;
  }
  animateAttackOrHug(m, layer, 1, 1 / 3., 0);
}

export function animateHug(m: movei, layer: number): void {
  animateAttackOrHug(m, layer, 3, 0.5, ((getcs().charid >> 1) === pshRatling ? -0.15 : -0.0713828) * cgi().scalefactor);
}

const animstack: [cell, animation][] = [];

export function indAnimateMovement(m: movei, layer: number): void {
  if (G.vid.mspeed >= 5) return; // no animations!
  if (changes.on) { const mc = m.clone(); changes.at_commit(() => indAnimateMovement(mc, layer)); return; }
  if (animations[layer].has(m.t)) {
    const res = animations[layer].get(m.t)!.clone();
    animations[layer].delete(m.t);
    animateMovement(m, layer);
    if (animations[layer].has(m.t))
      animstack.push([m.t, animations[layer].get(m.t)!.clone()]);
    anim_at(layer, m.t).set(res);
  }
  else {
    animateMovement(m, layer);
    if (animations[layer].has(m.t)) {
      animstack.push([m.t, animations[layer].get(m.t)!.clone()]);
      animations[layer].delete(m.t);
    }
  }
}

export function commitAnimations(layer: number): void {
  if (changes.on) { changes.at_commit(() => commitAnimations(layer)); return; }
  for (let i = 0; i < isize(animstack); i++)
    anim_at(layer, animstack[i][0]).set(animstack[i][1]);
  animstack.length = 0;
}

/** cgi.emb->anim_center_z() (emb_none: center_z() = 0) */
function anim_center_z(): number { return cgi().emb.center_z(); }
/** cgi.emb->anim_tile_center() */
function anim_tile_center(): hyperpoint {
  const z = anim_center_z();
  if (z === 0) return C0();
  return tmulh(lzpush(z), C0());
}

/** bool applyAnimation(cell *c, shiftmatrix& V, double& footphase, int layer) */
export function applyAnimation(c: cell, V: { v: shiftmatrix }, footphase: { v: number }, layer: number): boolean {
  if (!animations[layer].has(c)) return false;
  const a = animations[layer].get(c)!;

  const td = G.ticks - a.ltick;
  let aspd = td / 1000.0 * c_exp(G.vid.mspeed);
  let R: number;
  let TC0: hyperpoint;
  for (;;) {
    TC0 = anim_tile_center();

    if (a.attacking === 1 || a.attacking === 3)
      R = hdist(tmulh(a.attackat, TC0), tmulh(a.wherenow, TC0));
    else
      R = hdist(tmulh(a.wherenow, TC0), TC0);
    aspd = adjust_aspeed(aspd, R);

    if (a.attacking === 3 && aspd > R) aspd = R;

    if ((R < aspd || isNaN(R) || isNaN(aspd) || R > 10) && a.attacking !== 3) {
      if (a.attacking === 1) { a.attacking = 2; continue; }
      animations[layer].delete(c);
      return false;
    }
    break;
  }
  {
    let T = inverse(a.wherenow);
    const z = anim_center_z();
    if (z) T = tmul(lzpush(-z), T);

    let wnow: hyperpoint;
    if (a.attacking === 1 || a.attacking === 3)
      wnow = tmulh(tmulh_t(T, a.attackat), TC0);
    else
      wnow = tmulh(T, TC0);

    const Tref = { get: () => T, set: (X: transmatrix) => { T = X; } };
    shift_v_towards(Tref, shiftless(wnow), aspd, shift_method(smaAnimation));
    if (z) T = tmul(lzpush(z), T);
    a.wherenow = inverse(T);
    fixmatrix(a.wherenow);

    if (cgflags() & qAFFINE) {
      throw new NotPorted('applyAnimation: affine geometries'); // STAGE2-STUB (other geometries)
    }

    a.footphase += a.attacking === 2 ? -aspd : aspd;
    if (a.attacking === 3 && aspd >= R) {
      a.footphase = 0;
      const h1 = tmulh(a.wherenow, C0());
      a.wherenow = tmul(rgpushxto0(h1), lrspintox(h1));
    }
    footphase.v = a.footphase;
    V.v = smul(smul(V.v, a.wherenow), lrspintox(wnow));
    if (cgi().emb.is_cylinder() && !gproduct_()) {
      throw new NotPorted('applyAnimation: cylinder embeddings'); // STAGE2-STUB (3D)
    }
    if (a.mirrored) V.v = smul(V.v, lmirror());
    if (a.attacking === 2) V.v = smul(V.v, lpispin());
    a.ltick = G.ticks;
    return true;
  }
}
import { gproduct as gproduct_ } from './classes.ts';
/** T * U for two matrices (C++: T * a.attackat * TC0 is (T * attackat) * TC0) */
function tmulh_t(T: transmatrix, U: transmatrix): transmatrix { return tmul(T, U); }

export function chainAngle(c: cell, V: { v: shiftmatrix }, c2: cell, dft: number, Vwhere: shiftmatrix): number {
  if (cgi().emb.no_spin()) return 0;
  if (!G.current_display.old_cellmatrices.has(c2)) return dft;
  let h = anim_tile_center();
  if (animations[LAYER_BIG].has(c2)) h = tmulh(animations[LAYER_BIG].get(c2)!.wherenow, h);
  h = tmulh(tmul(inverse_shift(V.v, Vwhere), calc_relative_matrix(c2, c, C0())), h);
  const z = anim_center_z();
  if (z) h = tmulh(lzpush(-z), h);
  return c_atan2(h[1], h[0]);
}

/** equivalent to V = V * spin(-chainAngle(c,V,c2,dft)); */
export function chainAnimation(_c: cell, c2: cell, V: { v: shiftmatrix }, Vwhere: shiftmatrix, length: { v: number }): boolean {
  if (cgi().emb.no_spin()) return false;
  let h = anim_tile_center();
  if (animations[LAYER_BIG].has(c2)) h = tmulh(animations[LAYER_BIG].get(c2)!.wherenow, h);
  h = tmulh(inverse_shift(V.v, Vwhere), h);
  length.v = hdist(h, tile_center());
  const z = cgi().emb.center_z();
  if (z) h = tmulh(lzpush(-z), h);
  V.v = smul(V.v, rspintox(h));
  return true;
}

/** struct fallanim */
class fallanim {
  t_mon = 0; t_floor = 0; pid = 0;
  walltype: eWall = waNone;
  m: eMonster = 0;
}

/** map<cell*, fallanim> fallanims */
const fallanims = new Map<cell, fallanim>();
function fallanim_at(c: cell): fallanim {
  let f = fallanims.get(c);
  if (!f) { f = new fallanim(); fallanims.set(c, f); }
  return f;
}

/** struct flashdata */
export class flashdata {
  t: number;
  size: number;
  where: cell;
  angle_matrix: transmatrix;
  bubblesize = 0;
  /** 0 for flashes, >0 for particles */
  spd: number;
  color: number;
  text = '';
  constructor(_t: number, _s: number, _w: cell, col: number, sped: number) {
    this.t = _t; this.size = _s; this.where = _w; this.color = col;
    this.spd = sped;
    this.angle_matrix = random_spin();
  }
}
import { random_spin } from './hyperpoint.ts';

/** EX vector<flashdata> flashes */
export const flashes: flashdata[] = [];

/** void confusingGeometry() (hypgraph.cpp) */
function confusingGeometry(): boolean { return confusingGeometry_hg(); }

export function drawBubble(c: cell, col: number, s: string, size: number): void {
  if (changes.on) { changes.at_commit(() => drawBubble(c, col, s, size)); return; }
  const fd = new flashdata(G.ticks, 1000, c, col, 0);
  fd.text = s;
  fd.bubblesize = size;
  flashes.push(fd);
}

export function drawFlash(c: cell): void {
  flashes.push(new flashdata(G.ticks, 1000, c, iinf[itOrbFlash].color, 0));
}
export function drawBigFlash(c: cell): void {
  flashes.push(new flashdata(G.ticks, 2000, c, 0xC0FF00, 0));
}

export function drawParticleSpeed(c: cell, col: number, speed: number): void {
  if (changes.on) { changes.at_commit(() => drawParticleSpeed(c, col, speed)); return; }
  if (G.vid.particles && !confusingGeometry()) {
    const s = rand() % 16;
    flashes.push(new flashdata(G.ticks, s, c, col, speed));
  }
}
export function drawParticle(c: cell, col: number, maxspeed = 100): void {
  drawParticleSpeed(c, col, 1 + rand() % maxspeed);
}

/** drawDirectionalParticle(cell *c, int dir, color_t col, int maxspeed IS(100)) */
export function drawDirectionalParticle(c: cell, dir: number, col: number, maxspeed = 100): void {
  if (changes.on) { changes.at_commit(() => drawDirectionalParticle(c, dir, col, maxspeed)); return; }
  if (G.vid.particles && !confusingGeometry()) {
    const speed = 1 + rand() % maxspeed;
    const s = rand() % 16;
    const fd = new flashdata(G.ticks, s, c, col, speed);
    let angle = -atan2_h(tC0(adjm(c, dir)));
    // rand() % 100 - rand() % 100: gcc evaluates the operands of `-` right to left (NOTES.md)
    const r2 = rand() % 100, r1 = rand() % 100;
    angle += TAU * Math.trunc(r1 - r2) / 100 / c.type;
    fd.angle_matrix = spin(angle);
    flashes.push(fd);
  }
}

export function drawParticles(c: cell, col: number, qty: number, maxspeed = 100): void {
  if (G.vid.particles)
    while (qty--) drawParticle(c, col, maxspeed);
}
export function drawFireParticles(c: cell, qty: number, maxspeed = 100): void {
  if (G.vid.particles)
    for (let i = 0; i < qty; i++)
      drawParticle(c, firegradient(i / (qty - 1.)), maxspeed);
}
export function fallingFloorAnimation(c: cell, w: eWall = waNone, m: eMonster = moNone): void {
  if (!G.wmspatial) return;
  if (changes.on) { changes.at_commit(() => fallingFloorAnimation(c, w, m)); return; }
  const fa = fallanim_at(c);
  fa.t_floor = G.ticks;
  fa.walltype = w; fa.m = m;
  // drawParticles(c, darkenedby(linf[c->land].color, 1), 4, 50);
}
/** fallingMonsterAnimation(cell *c, eMonster m, int id IS(multi::cpid)) */
export function fallingMonsterAnimation(c: cell, m: eMonster, id: number = G.multi_cpid): void {
  if (!G.mmspatial) return;
  if (changes.on) { changes.at_commit(() => fallingMonsterAnimation(c, m, id)); return; }
  const fa = fallanim_at(c);
  fa.t_mon = G.ticks;
  fa.m = m;
  fa.pid = id;
  // drawParticles(c, darkenedby(linf[c->land].color, 1), 4, 50);
}

/** void celldrawer::draw_fallanims() */
export function celldrawer_draw_fallanims(cd: celldrawer): void {
  const c = cd.c, V = cd.V;
  G.poly_outline = 0x000000FF; // OUTLINE_NONE
  if (fallanims.has(c)) {
    const q = { v: isize(G.ptds) };
    const maxtime = euclid() || sphere() ? 20000 : 1500;
    const fa = fallanims.get(c)!;
    let erase = true;
    if (fa.t_floor) {
      const t = (G.ticks - fa.t_floor);
      if (t <= maxtime) {
        erase = false;
        if (GDIM() === 3)
          throw new NotPorted('draw_fallanims: 3D'); // STAGE2-STUB (3D)
        else if (fa.walltype === waNone) {
          draw_qfi(c, V, darkena(cd.fcol, cd.fd, 0xFF), PPR.FLOOR);
        }
        else {
          const ddalt = new celldrawer_ctor();
          const w = c.wall; const p = c.wparam;
          c.wall = fa.walltype; c.wparam = fa.m;
          ddalt.c = c;
          ddalt.setcolors();
          const starcol = c.wall === waVinePlant ? 0x60C000 : ddalt.wcol;
          c.wall = w; c.wparam = p;
          const g = cgi();
          draw_qfi(c, omf(V, g.WALL), darkena(starcol, cd.fd, 0xFF), PPR.WALL_TOP);
          queuepolyat(omf(V, g.WALL), g.shWall[cd.ct6], darkena(ddalt.wcol, 0, 0xFF), PPR.WALL_DECO);
          for (let i = 0; i < c.type; i++) {
            const c2 = c.move(i); if (!c2) continue;
            if (placeSidewall(c, i, SIDE_WALL, V, darkena(ddalt.wcol, 1, 0xFF))) break;
          }
        }
        pushdown(c, q, V, t * t / 1000000. + t / 1000., true, true);
      }
    }
    if (fa.t_mon) {
      const d = G.multi_cpid;
      G.multi_cpid = fa.pid;
      try {
        const t = (G.ticks - fa.t_mon);
        if (t <= maxtime) {
          erase = false;
          c.stuntime = 0;
          const V2 = { v: V };
          const footphase = { v: t / 200.0 };
          applyAnimation(c, V2, footphase, LAYER_SMALL);
          drawMonsterType(fa.m, c, V2.v, minf[fa.m].color, footphase.v, 0 /* NOCOLOR */);
          pushdown(c, q, V2.v, t * t / 1000000. + t / 1000., true, true);
        }
      } finally { G.multi_cpid = d; }
    }
    if (erase) fallanims.delete(c);
  }
}
import { celldrawer as celldrawer_ctor } from './celldrawer.ts';
import { orthogonal_move_fol_t } from './hyperpoint.ts';
/** orthogonal_move_fol(const shiftmatrix& V, ld fol) */
function omf(V: shiftmatrix, fol: number): shiftmatrix { return shiftless_t(orthogonal_move_fol_t(V.T, fol), V.shift); }

// CAP_QUEUE
// always_false static_bubbles

export function draw_flash(f: flashdata, V: shiftmatrix, kill: { v: boolean }): void {
  const tim = G.ticks - f.t;

  if (tim <= f.size && !f.spd) kill.v = false;

  if (f.text !== '') {
    const col = { v: f.color };
    const p = G.poly_outline;
    try {
      const r = { v: 2 };
      apply_neon(col, r);
      if (GDIM() === 3 || sphere())
        queuestr_V(V, (1 - tim * 1. / f.size) * f.bubblesize * G.mapfontscale / 100, f.text, col.v, r.v);
      else if (!kill.v) {
        const h = tC0_sm(V);
        if (hdist0(h.h) > .1) {
          const V2 = tmul(rspintox(h.h), xpush(hdist0(h.h) * (1 / (1 - tim * 1. / f.size))));
          queuestr_V(shiftless_t(V2, h.shift), f.bubblesize * G.mapfontscale / 100, f.text, col.v, r.v);
        }
      }
    } finally { G.poly_outline = p; }
  }

  else if (f.spd) {
    // CAP_SHAPES
    if (tim <= 300) kill.v = false;
    const partcol = darkena(f.color, 0, GDIM() === 3 ? 255 : Math.max(255 - Math.trunc(tim * 255 / 300), 0));
    G.poly_outline = OUTLINE_DEFAULT();
    const t = f.spd * tim * cgi().scalefactor / 50000.;
    const T = smul(smul(V, f.angle_matrix), (GDIM() === 2 ? xpush(t) : cpush(2, t)));
    queuepoly(T, cgi().shParticle[f.size], partcol);
  }

  else if (f.size === 1000) {
    const g = cgi();
    for (let u = 0; u <= tim; u++) {
      if ((u - tim) % 50) continue;
      if (u < tim - 150) continue;
      let rad = u * 3 / 1000.;
      rad = rad * (5 - rad) / 2;
      rad *= g.hexf;
      let flashcol = f.color;
      if (u > 500) flashcol = gradient(flashcol, 0, 500, u, 1100);
      flashcol = darkena(flashcol, 0, 0xFF);
      // MAXMDIM >= 4
      if (GDIM() === 3) throw new NotPorted('draw_flash: queueball (3D)'); // STAGE2-STUB (3D)
      else {
        PRING((a) => curvepoint(xspinpush0(a * g.S_step, rad)));
        queuecurve(V, flashcol, 0x8080808, PPR.LINE);
      }
    }
  }
  else if (f.size === 2000) {
    const g = cgi();
    for (let u = 0; u <= tim; u++) {
      if ((u - tim) % 50) continue;
      if (u < tim - 250) continue;
      let rad = u * 3 / 2000.;
      rad = rad * (5 - rad) * 1.25;
      rad *= g.hexf;
      let flashcol = f.color;
      if (u > 1000) flashcol = gradient(flashcol, 0, 1000, u, 2200);
      flashcol = darkena(flashcol, 0, 0xFF);
      // MAXMDIM >= 4
      if (GDIM() === 3) throw new NotPorted('draw_flash: queueball (3D)'); // STAGE2-STUB (3D)
      else {
        PRING((a) => curvepoint(xspinpush0(a * g.S_step, rad)));
        queuecurve(V, flashcol, 0x8080808, PPR.LINE);
      }
    }
  }
}

/** #define PRING(i) for(double i=0; i<=cgi.S84+1e-6; i+= pow(.5, vid.linequality)) */
function PRING(f: (a: number) => void): void {
  const step = Math.pow(.5, G.vid.linequality);
  for (let i = 0; i <= cgi().S84 + 1e-6; i += step) f(i);
}

export function drawFlashes(): void {
  // CAP_QUEUE
  const adc = G.current_display.all_drawn_copies;
  for (let k = 0; k < isize(flashes); k++) {
    const kill = { v: true };
    const f = flashes[k];
    let copies = false;
    for (const V of adc.get(f.where) ?? []) {
      copies = true;
      draw_flash(f, V, kill);
    }
    for (let id = 0; id < f.where.type; id++) {
      const c2 = f.where.move(id); if (!c2) continue;
      if (!copies) {
        for (const V of adc.get(c2) ?? []) {
          draw_flash(f, smul(V, G.currentmap.iadj(f.where, id)), kill);
          copies = true;
        }
      }
    }
    if (f.t > G.ticks - 800 && !copies) {
      kill.v = false;
    }
    if (kill.v) {
      flashes[k] = flashes[isize(flashes) - 1];
      flashes.pop(); k--;
    }
  }
}

export function clearAnimations(): void {
  for (let i = 0; i < ANIMLAYERS; i++) animations[i].clear();
  flashes.length = 0;
  fallanims.clear();
}

// EX ld animation_factor = 1; EX int animation_lcm = 0: G.animation_factor, G.animation_lcm

/** ld ptick(int period, ld phase IS(0)) */
export function ptick(period: number, phase = 0): number {
  if (G.animation_lcm) G.animation_lcm = Math.imul(G.animation_lcm, (period / gcd(G.animation_lcm, period)) | 0);
  return (G.ticks * G.animation_factor * G.vid.ispeed) / period + phase * TAU;
}

/** ld fractick(int period, ld phase IS(0)) */
export function fractick(period: number, phase = 0): number {
  let t = ptick(period, phase) / TAU;
  t -= Math.floor(t);
  if (t < 0) t++;
  return t;
}

/** ld sintick(int period, ld phase IS(0)) */
export function sintick(period: number, phase = 0): number {
  return c_sin(ptick(period, phase));
}

/** transmatrix spintick(int period, ld phase IS(0)) */
export function spintick(period: number, phase = 0): transmatrix {
  return spin(ptick(period, phase));
}

/** the hooks of animations.cpp (static initializers, in source order) */
export function register_animations(): void {
  // auto ahgf = addHook(hooks_removecells, 1, ...)
  G.hooks_removecells.add(1, () => {
    // eliminate_if(flashes, ...) (hyper.h: the last element takes the removed one's place)
    for (let i = 0; i < isize(flashes); i++)
      if (is_cell_removed(flashes[i].where)) { flashes[i] = flashes[flashes.length - 1]; flashes.pop(); i--; }
  });
  // auto animcm = addHook(hooks_gamedata, 0, ...): memory statistics only
}

