// geometry2.cpp of HyperRogue 13.1o: matrices that transform between the coordinates of cells, the coordinates
// of cell corners, virtualRebase, random paths (Yendor).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The methods of hrmap_standard / hrmap_hyperbolic that geometry2.cpp defines (master_relative, adj(heptagon),
// relative_matrixc, relative_matrixh, spin_angle, spacedist, adj(cell), get_corner, virtualRebase) are the
// functions `hrmap_standard_<name>(map, ...)` here; the classes in cell.ts call them.
//
// Names (PORTING.md, "Overloads"): fixelliptic(T) / fixelliptic_h(h) (both return the fixed value instead of
// changing a reference); virtualRebase(base: Ref<cell>, at: Ref<transmatrix>) / virtualRebase_h(base, h:
// Ref<hyperpoint>); horo_distance's constructors are horo_distance.of(h) / horo_distance.of_shift(h1, T).
// Not ported (graphics, a later stage): ggmatrix (it reads View and centerover); relative_matrix_recursive's
// shortcut through gmatrix0 (the matrices of the last drawn frame: empty without drawing).
import { c_asinh } from './cpp.ts';
import { G } from './globals.ts';
import { NotPorted, hr_exception, YDIST, isize } from './hyper.ts';
import type { Ref } from './cpp.ts';
import { type cell, type heptagon, cellwalker, heptspin } from './locations.ts';
import {
  S7, S6, WDIM, GDIM, NONSTDVAR, BITRUNCATED, PURE, IRREGULAR, GOLDBERG, GOLDBERG_INV, elliptic, hyperbolic,
  euclid, quotient, closed_manifold, mhybrid, mproduct, nil, sol, gSol, gMinimal, gFieldQuotient, gBring, gMacbeath,
  gBinary4, gTernary, aperiodic, a4, cryst, LDIM, MDIM, sl2, cgflags, qINFMIXED,
} from './classes.ts';
import { among } from './hyper.ts';
import {
  type hyperpoint, type transmatrix, type shiftpoint, type shiftmatrix, Id, Mirror, pispin, centralsym, C0,
  tmul, tmuls, tmulh, tC0, tC0_t, hdist, hdist0, intval, xpush, hpxy, hpxy3, rspintox, spintox,
  mid, mid_at, mid_at_actual, M_PI, TAU, edge_of_triangle_with_angles, hcopy, tcopy, hadd, hsub,
  bucketer_h, type buckethash_t, inverse_shift_sp, unshift, hypot_d,
} from './hyperpoint.ts';
import { spin, lxpush, lxpush0, lspinpush0, xspinpush0, tile_center } from './embeddings.ts';
import { cgi } from './geometry.ts';
import { randd, rand, hrand, hrand_elt } from './rand.ts';
import { ishept } from './pattern2.ts';
import { type hrmap, type hrmap_standard, celldistance, celldistAlt, permanent_long_distances, max_saved_distance, random_in_distance, createMov, valence } from './cell.ts';
import { arcm_in } from './archimedean.ts';
import { arb_in } from './arbitrile.ts';
import { bt_in } from './binary-tiling.ts';
import { sn_in } from './nonisotropic.ts';
import { asonov_in } from './asonov.ts';
import { reg3_in } from './reg3.ts';
import { fake_in } from './fake.ts';
import { bignum, gmod, hrand_bignum } from './util.ts';
import { get_expansion, type_in, trees_known } from './expansion.ts';
import { setdist } from './landgen.ts';
import { yendor_control } from './yendor.ts';
import { inmirror } from './flags.ts';
import { mirror_reflect } from './complex.ts';
import { laMirror } from './content.ts';
import { gp_get_local_info, gp_fixg6, GOLDBERG_MASK, gp_has_adj, gp_get_adj, gp_variation_for, gp_get_corner_position, gp_get_corner_position_li } from './goldberg.ts';
import { master_to_c7_angle } from './hypgraph.ts';
import { iso_inverse } from './hyperpoint.ts';
import { eVariation } from './classes.ts';

export { randd } from './rand.ts';

const notp = (what: string): never => { throw new NotPorted(what); };

/** inforder::mixed() (inforder.cpp, a later-stage stub module of P8; real) */
function inforder_mixed(): boolean { return (cgflags() & qINFMIXED) !== 0n; }

/** fixelliptic(transmatrix& at) */
export function fixelliptic(at: transmatrix): transmatrix {
  if (elliptic() && at[LDIM()][LDIM()] < 0) {
    at = tcopy(at);
    for (let i = 0; i < MDIM(); i++) for (let j = 0; j < MDIM(); j++)
      at[i][j] = -at[i][j];
  }
  return at;
}

/** fixelliptic(hyperpoint& h) */
export function fixelliptic_h(h: hyperpoint): hyperpoint {
  if (elliptic() && h[LDIM()] < 0) {
    h = hcopy(h);
    for (let i = 0; i < MDIM(); i++) h[i] = -h[i];
  }
  return h;
}

/** find relative_matrix via recursing the tree structure */
export function relative_matrix_recursive(h2: heptagon, h1: heptagon): transmatrix {
  // if(gmatrix0.count(h2->c7) && gmatrix0.count(h1->c7)) return inverse_shift(gmatrix0[h1->c7], gmatrix0[h2->c7]);
  // (gmatrix0 holds the matrices of the last drawn frame: empty without drawing)
  let gm = Id, where = Id;
  const cm = G.currentmap as hrmap;
  while (h1 !== h2) {
    for (let i = 0; i < h1.type; i++) {
      if (h1.move(i) === h2) {
        return tmuls(gm, cm.adj_h(h1, i), where);
      }
    }
    again: {
      if (h1.distance > h2.distance) {
        for (let i = 0; i < h1.type; i++) if (h1.move(i) && h1.move(i).distance < h1.distance) {
          gm = tmul(gm, cm.adj_h(h1, i));
          h1 = h1.move(i);
          break again;
        }
      }
      else {
        for (let i = 0; i < h2.type; i++) if (h2.move(i) && h2.move(i).distance < h2.distance) {
          where = tmul(cm.iadj_h(h2, i), where);
          h2 = h2.move(i);
          break again;
        }
      }
    }
  }
  return tmul(gm, where);
}

/** transmatrix hrmap_standard::master_relative(cell *c, bool get_inverse) */
export function hrmap_standard_master_relative(_m: hrmap_standard, c: cell, get_inverse: boolean): transmatrix {
  // if(0) ;
  // #if CAP_IRR
  if (IRREGULAR()) return notp('master_relative: irregular');
  // #if CAP_GP
  else if (GOLDBERG()) {
    if (c === c.master.c7) {
      return spin((get_inverse ? -1 : 1) * master_to_c7_angle());
    }
    else {
      const li = gp_get_local_info(c);
      let T = tmul(spin(master_to_c7_angle()), cgi().gpdata!.Tf[li.last_dir][li.relative[0] & GOLDBERG_MASK][li.relative[1] & GOLDBERG_MASK][gp_fixg6(li.total_dir)]);
      if (get_inverse) T = iso_inverse(T);
      return T;
    }
  }
  else if (BITRUNCATED()) {
    if (c === c.master.c7)
      return Id;
    return (get_inverse ? cgi().invhexmove : cgi().hexmove)[c.c.spin(0)];
  }
  else if (WDIM() === 3)
    return Id;
  else if (dont_inverse())
    return Id;
  else
    return tmul(pispin, Id);
  return Id;
}

export function calc_relative_matrix(c2: cell, c1: cell, hint: hyperpoint): transmatrix {
  return (G.currentmap as hrmap).relative_matrix(c2, c1, hint);
}

// target, source, direction from source to target

/** transmatrix hrmap_standard::adj(heptagon *h, int d) */
export function hrmap_standard_adj_h(m: hrmap_standard, h: heptagon, d: number): transmatrix {
  if (inforder_mixed()) {
    const t0 = h.type;
    const t1 = h.cmove(d).type;
    const sp = h.c.spin(d);
    return tmuls(spin(-d * TAU / t0), lxpush(m.spacedist(h.c7, d)), spin(M_PI + TAU * sp / t1));
  }
  let T = cgi().heptmove[d];
  if (h.c.mirror(d)) T = tmul(T, Mirror);
  const sp = h.c.spin(d);
  if (sp) T = tmul(T, spin(TAU * sp / S7()));
  return T;
}

export function relative_matrix_via_masters(c2: cell, c1: cell, hint: hyperpoint): transmatrix {
  const cm = G.currentmap as hrmap;
  const h1 = c1.master;
  const gm = cm.master_relative(c1, true);
  const h2 = c2.master;
  const where = cm.master_relative(c2);

  const U = cm.relative_matrix_h(h2, h1, hint);

  return tmuls(gm, U, where);
}

/** transmatrix hrmap_standard::relative_matrixc(cell *c2, cell *c1, const hyperpoint& hint) */
export function hrmap_standard_relative_matrixc(_m: hrmap_standard, c2: cell, c1: cell, hint: hyperpoint): transmatrix {
  return relative_matrix_via_masters(c2, c1, hint);
}

/** transmatrix hrmap_standard::relative_matrixh(heptagon *h2, heptagon *h1, const hyperpoint& hint) */
export function hrmap_standard_relative_matrixh(m: hrmap_standard, h2: heptagon, h1: heptagon, hint: hyperpoint): transmatrix {

  let gm = Id, where = Id;
  // always add to last!
  // bool hsol = false;
  // transmatrix sol;

  // set<heptagon*> visited; map<ld, vector<pair<heptagon*, transmatrix>>> hbdist: crystal only

  let steps = 0;
  while (h1 !== h2) {
    steps++; if (steps > 10000) {
      // println(hlog, "not found");
      return Id;
    }
    if (closed_manifold()) {
      let T: transmatrix = Id;
      let bestdist = 1e9;
      for (let d = 0; d < S7(); d++) {
        const hm = h1.move(d);
        if (!hm) continue;
        const S = m.adj_h(h1, d);
        if (hm === h2) {
          const T1 = tmuls(gm, S, where);
          const curdist = hdist(tC0(T1), hint);
          if (curdist < bestdist) { T = T1; bestdist = curdist; }
        }
        if (G.geometry !== gMinimal) for (let e = 0; e < S7(); e++) if (hm.move(e) === h2) {
          const T1 = tmuls(gm, S, m.adj_h(hm, e), where);
          const curdist = hdist(tC0(T1), hint);
          if (curdist < bestdist) { T = T1; bestdist = curdist; }
        }
      }
      if (bestdist < 1e8) return T;
    }
    for (let d = 0; d < h1.type; d++) if (h1.move(d) === h2) {
      return tmuls(gm, m.adj_h(h1, d), where);
    }
    if (among(G.geometry, gFieldQuotient, gBring, gMacbeath)) {
      let bestdist = 1000000, bestd = 0;
      for (let d = 0; d < S7(); d++) {
        const dist = celldistance(h1.cmove(d).c7, h2.c7);
        if (dist < bestdist) { bestdist = dist; bestd = d; }
      }
      gm = tmul(gm, m.adj_h(h1, bestd));
      h1 = h1.move(bestd);
    }
    // #if CAP_CRYSTAL
    else if (cryst()) {
      return notp('relative_matrixh: crystal');
    }
    else if (h1.distance < h2.distance) {
      where = tmul(m.iadj_h(h2, 0), where);
      h2 = h2.move(0);
    }
    else {
      gm = tmul(gm, m.adj_h(h1, 0));
      h1 = h1.move(0);
    }
  }
  return tmul(gm, where);
}

/** shiftmatrix &ggmatrix(cell *c): the matrix of c in the current view (gmatrix = current_display->cellmatrices;
 *  ported by D3, stage 2). Returns the stored object (a reference in C++). */
export function ggmatrix(c: cell): shiftmatrix {
  const gmatrix = G.current_display.cellmatrices;
  let t = gmatrix.get(c);
  if (!t) { t = { T: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], shift: 0, is_null: true }; gmatrix.set(c, t); }
  if (t.is_null) {
    if (sl2()) return notp('ggmatrix: twist::relative_shiftmatrix (sl2)'); // STAGE2-STUB
    t.is_null = false;
    t.T = tmuls(G.actual_view_transform, G.current_display.view_matrix, calc_relative_matrix(c, G.current_display.precise_center, C0()));
    t.shift = 0;
  }
  return t;
}

/** struct horo_distance */
export class horo_distance {
  a = 0; b = 0;

  become(h1: hyperpoint): void {
    // #if CAP_SOLV
    if (sn_in()) { notp('horo_distance: sn'); }
    // #if CAP_BT
    else if (bt_in()) { notp('horo_distance: bt::horo_level'); }
    else if (mhybrid() || sl2()) { this.a = 0; this.b = hdist(h1, C0()); }
    else if (cgi().emb.is_euc_in_product()) { this.a = 0; this.b = hdist(h1, C0()); }
    else if (cgi().emb.is_cylinder()) { this.a = 0; this.b = hdist(h1, tile_center()); }
    else { this.a = 0; this.b = intval(h1, tile_center()); }
  }
  /** horo_distance(hyperpoint h) */
  static of(h: hyperpoint): horo_distance { const r = new horo_distance(); r.become(h); return r; }
  /** horo_distance(shiftpoint h1, const shiftmatrix& T) */
  static of_shift(h1: shiftpoint, T: shiftmatrix): horo_distance {
    const r = new horo_distance();
    // #if CAP_BT
    if (bt_in()) r.become(inverse_shift_sp(T, h1));
    else
      if (sn_in() || mhybrid() || nil() || sl2()) r.become(inverse_shift_sp(T, h1));
      else if (cgi().emb.is_euc_in_product()) { r.a = 0; r.b = hdist(h1.h, unshift({ h: tmulh(T.T, tile_center()), shift: T.shift }, h1.shift)); }
      else if (cgi().emb.is_cylinder()) { r.a = 0; r.b = hdist(h1.h, unshift({ h: tmulh(T.T, tile_center()), shift: T.shift }, h1.shift)); }
      else { r.a = 0; r.b = intval(h1.h, unshift({ h: tmulh(T.T, tile_center()), shift: T.shift }, h1.shift)); }
    return r;
  }
  /** operator < */
  lt(z: horo_distance): boolean {
    // #if CAP_BT
    if (bt_in() || sn_in()) {
      if (this.a < z.a - 1e-6) return true;
      if (this.a > z.a + 1e-6) return false;
    }
    return this.b < z.b - 1e-4;
  }
}

/** template<class T, class U> void virtualRebase_cell(cell*& base, T& at, const U& check): T is transmatrix or
 *  hyperpoint, `mul(V, at)` is V * at */
function virtualRebase_cell<T>(base: Ref<cell>, at: Ref<T>, check: (t: T) => hyperpoint, mul: (V: transmatrix, t: T) => T): void {
  let currz = horo_distance.of(check(at.v));
  let best_at = at.v;
  const cm = G.currentmap as hrmap;
  while (true) {
    let newbase: cell = null!;
    // forCellIdCM(c2, i, base)
    for (let i = 0; i < base.v.type; i++) {
      const c2 = createMov(base.v, i);
      // if(c2 == &out_of_bounds) continue;: out_of_bounds is used only by the backed maps (a later stage)
      const V2 = cm.iadj(base.v, i);
      const cand_at = mul(V2, at.v);
      const newz = horo_distance.of(check(cand_at));
      if (newz.lt(currz)) {
        currz = newz;
        best_at = cand_at;
        newbase = c2;
      }
      if (arb_in()) notp('virtualRebase_cell: arb');
    }
    if (!newbase) break;
    base.v = newbase;
    at.v = best_at;
  }
  // #if MAXMDIM >= 4: if(reg3::ultra_mirror_in()) ...: 3D (a later stage)
  if (reg3_in()) notp('virtualRebase_cell: reg3::ultra_mirror_in');
}

function virtualRebase_t<T>(base: Ref<cell>, at: Ref<T>, check: (t: T) => hyperpoint, mul: (V: transmatrix, t: T) => T): void {

  if (nil() && WDIM() === 3 && !mhybrid()) notp('virtualRebase: nil');

  if (G.geometry === gSol) notp('virtualRebase: sol');
  /* todo variants of sol */

  if (mproduct()) notp('virtualRebase: product');

  virtualRebase_cell(base, at, check, mul);
}

/** virtualRebase(cell*& base, transmatrix& at) */
export function virtualRebase(base: Ref<cell>, at: Ref<transmatrix>): void {
  virtualRebase_t(base, at, tC0_t, tmul);
}

/** virtualRebase(cell*& base, hyperpoint& h) */
export function virtualRebase_h(base: Ref<cell>, h: Ref<hyperpoint>): void {
  // we perform fixing in check, so that it works with larger range
  virtualRebase_t(base, h, (h: hyperpoint) => {
    if (hyperbolic() && GDIM() === 2) return hpxy(h[0], h[1]);
    if (hyperbolic() && GDIM() === 3) return hpxy3(h[0], h[1], h[2]);
    return h;
  }, tmulh);
}

/** void hrmap_hyperbolic::virtualRebase(heptagon*& base, transmatrix& at) */
export function hrmap_hyperbolic_virtualRebase(m: hrmap_standard, base: Ref<heptagon>, at: Ref<transmatrix>): void {

  while (true) {

    let currz = at.v[LDIM()][LDIM()];

    const h = base.v;

    let newbase: heptagon = null!;

    let bestV: transmatrix = null!;

    for (let d = 0; d < S7(); d++) {
      const hs = new heptspin(h, d, false);
      const hs2 = hs.plusStep();
      const V2 = tmul(m.iadj_h(h, d), at.v);
      const newz = V2[LDIM()][LDIM()];
      if (newz < currz) {
        currz = newz;
        bestV = V2;
        newbase = hs2.at;
      }
    }

    if (newbase) {
      base.v = newbase;
      at.v = bestV;
      continue;
    }

    return;
  }
}

export function no_easy_spin(): boolean {
  return NONSTDVAR() || arcm_in() || WDIM() === 3 || bt_in() || aperiodic();
}

// never_invert: G

export function dont_inverse(): boolean { return G.never_invert || (PURE() && cgi().emb.is_euc_in_noniso()); }

/** ld hrmap_standard::spin_angle(cell *c, int d) */
export function hrmap_standard_spin_angle(_m: hrmap_standard, c: cell, d: number): number {
  if (WDIM() === 3) return SPIN_NOT_AVAILABLE;
  let hexshift = 0;
  if (c === c.master.c7 && (S7() % 2 === 0) && BITRUNCATED()) hexshift = cgi().hexshift + TAU / c.type;
  else if (cgi().hexshift && c === c.master.c7) hexshift = cgi().hexshift;
  // #if CAP_IRR
  if (IRREGULAR()) return notp('spin_angle: irregular');
  if (dont_inverse()) return - d * TAU / c.type;
  return M_PI - d * TAU / c.type - hexshift;
}
/** hrmap::SPIN_NOT_AVAILABLE */
const SPIN_NOT_AVAILABLE = 1e5;

export function ddspin(c: cell, d: number, bonus = 0): transmatrix { return (G.currentmap as hrmap).spin_to(c, d, bonus); }
export function iddspin(c: cell, d: number, bonus = 0): transmatrix { return (G.currentmap as hrmap).spin_from(c, d, bonus); }
export function cellgfxdist(c: cell, d: number): number { return (G.currentmap as hrmap).spacedist(c, d); }

export function ddspin_side(c: cell, d: number, bonus = 0): transmatrix {
  if (cgi().emb.is_in_noniso())
    return spin(bonus);
  if (aperiodic()) {
    // if(embedded_plane) return spin(bonus);
    const h1 = get_corner_position(c, gmod(d, c.type), 3);
    const h2 = get_corner_position(c, gmod(d + 1, c.type), 3);
    const hm = mid(h1, h2);
    return tmul(rspintox(hm), spin(bonus));
  }
  return (G.currentmap as hrmap).spin_to(c, d, bonus);
}

export function iddspin_side(c: cell, d: number, bonus = 0): transmatrix {
  if (cgi().emb.is_in_noniso())
    return spin(bonus);
  if (aperiodic()) {
    // if(embedded_plane) return spin(bonus);
    const h1 = get_corner_position(c, gmod(d, c.type), 3);
    const h2 = get_corner_position(c, gmod(d + 1, c.type), 3);
    const hm = mid(h1, h2);
    return tmul(spintox(hm), spin(bonus));
  }
  return (G.currentmap as hrmap).spin_from(c, d, bonus);
}

/** double hrmap_standard::spacedist(cell *c, int i) */
export function hrmap_standard_spacedist(m: hrmap_standard, c: cell, i: number): number {
  if (NONSTDVAR() || WDIM() === 3) return hrmap_spacedist(m, c, i);
  if (inforder_mixed()) {
    const t0 = c.type;
    const t1 = c.cmove(i).type;
    const halfmove = (i: number): number => {
      if (i === 1) return 0.0;
      if (i === 2) return 0.1;
      return edge_of_triangle_with_angles(0, M_PI / i, M_PI / i);
    };
    const tessf0 = halfmove(t0);
    const tessf1 = halfmove(t1);
    return (tessf0 + tessf1) / 2;
  }
  if (!BITRUNCATED()) return cgi().tessf;
  if (c.type === S6() && (i & 1)) return cgi().hexhexdist;
  return cgi().crossf;
}

/** int neighborId(heptagon *h1, heptagon *h2) (file-local) */
export function neighborId(h1: heptagon, h2: heptagon): number {
  for (let i = 0; i < h1.type; i++) if (h1.move(i) === h2) return i;
  return -1;
}

/** static bool first (in hrmap_standard::adj) */
let adj_first = true;

/** transmatrix hrmap_standard::adj(cell *c, int i) */
export function hrmap_standard_adj(m: hrmap_standard, c: cell, i: number): transmatrix {
  if (GOLDBERG()) {
    const T = m.master_relative(c, true);
    const U = m.master_relative(c.cmove(i), false);
    const h = c.master, h1 = c.cmove(i).master;
    if (h === h1)
      return tmul(T, U);
    else if (G.gp_do_adjm && !fake_in()) {
      if (gp_has_adj(c, i)) {
        return tmul(tmul(T, gp_get_adj(c, i)), U);
      }
      if (adj_first) { adj_first = false; /* println(hlog, "no gp_adj") */ }
    }
    else for (let i1 = 0; i1 < h.type; i1++) if (h.move(i1) === h1)
      return tmul(tmul(T, m.adj_h(h, i1)), U);
    if (adj_first) {
      adj_first = false;
      // println(hlog, "not adjacent");
    }
  }
  if (NONSTDVAR() || WDIM() === 3) {
    return calc_relative_matrix(c.cmove(i), c, C0());
  }
  const d = cellgfxdist(c, i);
  let T = tmul(ddspin(c, i), lxpush(d));
  if (c.c.mirror(i)) T = tmul(T, Mirror);
  const c1 = c.cmove(i);
  T = tmul(T, iddspin(c1, c.c.spin(i), M_PI));
  return T;
}

export function randomPointIn(t: number): hyperpoint {
  if (NONSTDVAR() || arcm_in() || aperiodic()) {
    // Let these geometries be less confusing.
    // Also easier to implement ;)
    return xspinpush0(TAU * randd(), c_asinh(randd() / 20));
  }
  while (true) {
    const h = xspinpush0(TAU * (randd() - .5) / t, c_asinh(randd()));
    const d =
      PURE() ? cgi().tessf : t === 6 ? cgi().hexhexdist : cgi().crossf;
    if (hdist0(h) < hdist0(tmulh(xpush(-d), h)))
      return tmulh(spin(TAU / t * (rand() % t)), h);
  }
}

/** get the coordinates of the vertex of cell c indexed with cid
 *  the two vertices c and c->move(cid) share are indexed cid and gmod(cid+1, c->type)
 *  cf=3 is the vertex itself; larger values are closer to the center */
export function get_corner_position(c: cell, cid: number, cf = 3): hyperpoint {
  return (G.currentmap as hrmap).get_corner(c, cid, cf);
}

/** hyperpoint hrmap_standard::get_corner(cell *c, int cid, ld cf) */
export function hrmap_standard_get_corner(m: hrmap_standard, c: cell, cid: number, cf: number): hyperpoint {
  // #if CAP_GP
  if (GOLDBERG()) return gp_get_corner_position(c, cid, cf);
  // #if CAP_IRR
  if (IRREGULAR()) return notp('get_corner: irregular');
  if (PURE()) {
    if (cgi().emb.is_euc_in_noniso()) {
      return lspinpush0(m.spin_angle(c, cid) + M_PI / S7(), cgi().hcrossf * 3 / cf);
    }
    return tmulh(ddspin(c, cid, M_PI / S7()), lxpush0(cgi().hcrossf * 3 / cf));
  }
  if (BITRUNCATED()) {
    if (!ishept(c))
      return tmulh(ddspin(c, cid, M_PI / S6()), lxpush0(cgi().hexvdist * 3 / cf));
    else
      return tmulh(ddspin(c, cid, M_PI / S7()), lxpush0(cgi().rhexf * 3 / cf));
  }
  return tile_center();
}

// approx_nearcorner: G

/** get the coordinates of the center of c->move(i) */
export function nearcorner(c: cell, i: number): hyperpoint {
  if (GOLDBERG_INV()) {
    i = gmod(i, c.type);
    const cw = new cellwalker(c, i);
    cw.addStep();
    let cwm = (G.currentmap as hrmap).adj(c, i);
    if (elliptic() && cwm[2][2] < 0) cwm = tmul(centralsym, cwm);
    return tmulh(cwm, C0());
  }
  // #if CAP_IRR
  if (IRREGULAR()) return notp('nearcorner: irregular');
  // #if CAP_ARCM
  if (arcm_in()) return notp('nearcorner: arcm');
  // #if CAP_BT
  if (G.geometry === gBinary4) return notp('nearcorner: binary4');
  if (G.geometry === gTernary) return notp('nearcorner: ternary');
  if (aperiodic()) {
    if (G.approx_nearcorner)
      return hsub(hadd((G.currentmap as hrmap).get_corner(c, i, 3), (G.currentmap as hrmap).get_corner(c, i + 1, 3)), C0());
    else
      return tmulh(calc_relative_matrix(c.cmove(i), c, C0()), C0());
  }
  if (bt_in()) return notp('nearcorner: bt');
  const d = cellgfxdist(c, i);
  return tmulh(ddspin(c, i), lxpush0(d));
}

/** get the coordinates of the another vertex of c->move(i)
 *  this is useful for tessellation remapping TODO COMMENT */
export function farcorner(c: cell, i: number, which: number): hyperpoint {
  // #if CAP_GP
  if (GOLDBERG_INV()) {
    const cw = new cellwalker(c, i);
    cw.addStep();
    if (!cw.mirrored) cw.add(which ? -1 : 2);
    else cw.add(which ? 2 : -1);
    const cwm = (G.currentmap as hrmap).adj(c, i);
    if (gp_variation_for(G.gp_param) === eVariation.goldberg) {
      const li1 = gp_get_local_info(cw.at);
      return tmulh(cwm, gp_get_corner_position_li(li1, cw.spin));
    }
    else {
      return tmulh(cwm, get_corner_position(cw.at, cw.spin, 3));
    }
  }
  // #if CAP_IRR
  if (IRREGULAR()) return notp('farcorner: irregular');
  // #if CAP_BT
  if (bt_in() || aperiodic())
    return nearcorner(c, (i + which) % c.type); // lazy
  // #if CAP_ARCM
  if (arcm_in()) return notp('farcorner: arcm');

  const cw = new cellwalker(c, i);
  cw.addStep();
  if (!cw.mirrored) cw.spin += (which ? -1 : 2);
  else cw.spin += (which ? 2 : -1);
  return tmulh((G.currentmap as hrmap).adj(c, i), get_corner_position(c.move(i), cw.spin));
}

export function midcorner(c: cell, i: number, v: number): hyperpoint {
  const hcor = farcorner(c, i, 0);
  const tcor = get_corner_position(c, i, 3);
  return mid_at(tcor, hcor, v);
}

export function get_warp_corner(c: cell, cid: number): hyperpoint {
  // midcorner(c, cid, .5) but sometimes easier versions exist
  // #if CAP_GP
  if (GOLDBERG()) return gp_get_corner_position(c, cid, 2);
  // #if CAP_IRR || CAP_ARCM
  if (IRREGULAR() || arcm_in()) return midcorner(c, cid, .5);
  return tmulh(ddspin(c, cid, M_PI / S7()), lxpush0(cgi().tessf / 2));
}

/** map<cell*, map<cell*, vector<transmatrix>>> brm_structure */
export const brm_structure = new Map<cell, Map<cell, transmatrix[]>>();

export function generate_brm(c1: cell): void {
  const visited_by_matrix = new Set<buckethash_t>();
  const q: [cell, transmatrix][] = [];
  let qh = 0;
  const cutoff = new Map<cell, number>();
  let res = brm_structure.get(c1);
  if (!res) { res = new Map(); brm_structure.set(c1, res); }

  const enqueue = (c: cell, T: transmatrix): void => {
    const b = bucketer_h(tC0(T));
    if (visited_by_matrix.has(b)) return;
    visited_by_matrix.add(b);
    q.push([c, T]);
  };

  enqueue(c1, Id);
  while (qh < q.length) {
    const [c2, T] = q[qh++];

    let mindist = Infinity, maxdist = 0;

    if (WDIM() === 2) {
      for (let i = 0; i < c1.type; i++)
        for (let j = 0; j < c2.type; j++) {
          const d = hdist(get_corner_position(c1, i), tmulh(T, get_corner_position(c2, j)));
          if (d < mindist) mindist = d;
          if (d > maxdist) maxdist = d;
        }
    }
    else notp('generate_brm: 3D (get_cellshape)');

    let cu = cutoff.get(c2) ?? 0;
    if (cu === 0 || cu > maxdist)
      cu = maxdist;
    cutoff.set(c2, cu);

    if (mindist >= cu) continue;
    let r = res.get(c2);
    if (!r) { r = []; res.set(c2, r); }
    r.push(T);

    for (let i = 0; i < c2.type; i++) { const c3 = createMov(c2, i); enqueue(c3, tmul(T, (G.currentmap as hrmap).adj(c2, i))); }
  }

  // vector<int> cts; for(auto& p: res) cts.push_back(isize(p.second)); (unused)
}

/** this function exhaustively finds the best transmatrix from (c1,h1) to (c2,h2) */
export function brm_get(c1: cell, h1: hyperpoint, c2: cell, h2: hyperpoint): transmatrix {
  if (!brm_structure.has(c1))
    generate_brm(c1);
  let result: transmatrix = null!;
  let best = Infinity;
  for (const t of brm_structure.get(c1)!.get(c2) ?? []) {
    const d = hdist(h1, tmulh(t, h2));
    if (d < best) { best = d; result = t; }
  }
  return result;
}

/** int brm_hook = addHook(hooks_clearmemory, 0, ...): called by hyper-main.ts in include order */
export function register_geometry2(): void {
  G.hooks_clearmemory.add(0, () => {
    brm_structure.clear();
  });
}

export function exhaustive_distance_appropriate(): boolean {
  if (euclid() && (aperiodic() || arcm_in() || arb_in() || quotient())) return true;
  // #if MAXMDIM >= 4
  if (nil() && quotient()) return true;
  // #if CAP_SOLV
  if (asonov_in()) return notp('exhaustive_distance_appropriate: asonov::period_xy');

  if (closed_manifold()) return true;

  return false;
}

/** struct pathgen */
export class pathgen {
  start = new cellwalker();
  last = new cellwalker();
  path: cell[] = [];
  full_id_0 = new bignum();
  last_id = 0;
}

export function generate_random_path_randomdir(start: cellwalker, length: number, for_yendor: boolean): pathgen {
  start = start.clone();
  start.spin = hrand(start.at.type);
  return generate_random_path(start, length, for_yendor, false);
}

export function generate_random_path(start: cellwalker, length: number, for_yendor: boolean, randomdir: boolean): pathgen {
  start = start.clone();
  const p = new pathgen();
  p.start = start.clone();
  p.path = new Array<cell>(length + 1).fill(null!);
  p.path[0] = start.at;
  p.last_id = 0;

  let turns = 0;

  if (exhaustive_distance_appropriate()) {
    permanent_long_distances(start.at);
    let dist = max_saved_distance(start.at);
    dist = Math.min(dist, length);
    let at = random_in_distance(start.at, dist);
    permanent_long_distances(at);
    for (let a = length - 1; a >= 0; a--) {
      p.path[a + 1] = at;
      const prev: cell[] = [];
      for (let i = 0; i < at.type; i++) { const c2 = createMov(at, i); if (celldistance(start.at, c2) === a) prev.push(c2); }
      if (isize(prev)) at = prev[hrand(isize(prev))];
    }
    p.path[0] = start.at;
    p.last = new cellwalker(p.path[p.path.length - 1], 0);
  }

  else if (mhybrid()) {
    /* I am lazy */
    for (let i = 1; i <= length; i++) p.path[i] = p.path[i - 1].cmove(p.path[i - 1].type - 1);
    p.last = new cellwalker(p.path[p.path.length - 1], 0);
  }

  else {
    let t = -1;
    const full_id = new bignum();
    let onlychild = true;
    // bool launched = false; (strict_tree_rules only)

    const ycw = start.clone();
    if (for_yendor) setdist(p.path[0], 7, null!);
    const expansion = get_expansion();

    for (let i = 0; i < length; i++) {

      if (for_yendor && yendor_control(p, i, ycw)) { }

      else if (bt_in()) {
        // make it challenging
        const ds: number[] = [];
        for (let d = 0; d < ycw.at.type; d++) {
          let increase: boolean;
          if (sol())
            increase = i < (YDIST >> 2) || i > ((3 * YDIST) >> 2);
          else
            increase = i < (YDIST >> 1);
          if (increase) {
            if (celldistAlt(ycw.plus(d).cpeek()) < celldistAlt(ycw.at))
              ds.push(d);
          }
          else {
            if (celldistAlt(ycw.plus(d).cpeek()) > celldistAlt(ycw.at) && ycw.plus(d).cpeek() !== p.path[i - 1])
              ds.push(d);
          }
        }
        if (isize(ds)) ycw.add(ds[hrand(isize(ds))]);
      }

      else if ((G.currentmap as hrmap).strict_tree_rules()) {
        // arb::current.yendor_backsteps, rulegen::treestates, the `goto stupid` when the subtree id is not an int
        notp('generate_random_path: strict_tree_rules (rulegen)');
      }

      else if (trees_known() && WDIM() === 2) {
        const sat = start.at;
        const sdist = (c: cell): number => celldistance(sat, c);
        if (i === 0) {
          t = type_in(expansion, randomdir ? start.at : start.cpeek(), sdist);
          ycw.add(-1);
          if (valence() === 3) ycw.add(-1);
          const b = get_expansion().get_descendants(randomdir ? length : length - 1, t);
          full_id.set(hrand_bignum(b));
          p.full_id_0 = full_id.clone();
        }

        // #if DEBUG_YENDORGEN ... #endif

        if (i === 1)
          onlychild = true;
        if (!onlychild) ycw.add(1);
        if (valence() === 3) ycw.add(1);

        onlychild = false;

        for (let tch of [...expansion.children[t]]) {
          ycw.add(1);
          if (i < 2) tch = type_in(expansion, ycw.cpeek(), sdist);
          const sub_id = expansion.get_descendants(length - 1 - i, tch);
          if (full_id.lt(sub_id)) { t = tch; break; }

          full_id.addmul(sub_id, -1);
          onlychild = true;
        }
      }

      else if (WDIM() === 3) {
        const prev = p.path[Math.max(i - 3, 0)];
        const d = celldistance(prev, ycw.at);
        const next: number[] = [];
        for (let j = 0; j < ycw.at.type; j++) { const c = createMov(ycw.at, j); if (celldistance(prev, c) > d) next.push(j); }
        if (!isize(next)) {
          // println(hlog, "error: no more cells for i=", i);
          ycw.spin = hrand(ycw.at.type);
        }
        else {
          ycw.spin = hrand_elt(next);
        }
      }

      else {
        // stupid:
        // stupid
        ycw.addRev();
        // well, make it a bit more clever on bitruncated a4 grids
        if (a4() && BITRUNCATED() && S7() <= 5) {
          if (ycw.at.type === 8 && ycw.cpeek().type !== 8)
            ycw.add(1);
          if (hrand(100) < 10) {
            if (euclid() ? (turns & 1) : (hrand(100) < 50))
              ycw.add(2);
            else
              ycw.add(-2);
            turns++;
          }
        }
      }

      if (for_yendor) while (p.last_id < i && (p.path[p.last_id].land === laMirror || inmirror(p.path[p.last_id]))) {
        p.last_id++;
        setdist(p.path[p.last_id], 7, null!);
      }

      if (for_yendor && inmirror(ycw.at)) ycw.set(mirror_reflect(ycw));
      ycw.addStep();
      p.path[i + 1] = ycw.at;
    }
    p.last = ycw.plusRev();
  }
  return p;
}

/** double hrmap::spacedist(cell *c, int i) (cell.cpp) */
export function hrmap_spacedist(m: hrmap, c: cell, i: number): number { return hdist(tile_center(), tmulh(m.adj(c, i), tile_center())); }

void hr_exception; void mid_at_actual; void hypot_d; void heptspin;
