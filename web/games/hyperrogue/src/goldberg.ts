// goldberg.cpp of HyperRogue 13.1o: the Goldberg-Coxeter construction GP(x,y) (`extend_map`: the local triangle
// mapping, `compute_geometry`, `prepare_matrices`, the corner positions, distances), the inverse variations
// (unrectified, untruncated, warped: `hrmap_inverse`), the Goldberg field patterns and the variations menu.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port (stage 3, packages G1 (the menu) and G2 (the rest)).
//
// Names: `gp::x` is `gp_x`; the overloads get_corner_position(li, ...) / get_corner_position(c, ...) are
// gp_get_corner_position_li / gp_get_corner_position. The struct `loc` is a pair `[x, y]` with the operators
// gp_loc_*. `gp::param`, `current_li`, `li_for`, `do_adjm`, `pmap`, `next`, `gp_style`, `su` (goldberg-sub.cpp)
// are in G (gp_param, gp_current_li, gp_li_for, gp_do_adjm, gp_pmap, gp_next, gp_gp_style, gp_su).
// `cgi.gpdata` is gpdata_t below. hrmap_inverse is made on first use (cell.ts is no leaf module).
// Debug output (DEBB, debug_gp) is left out.
import { NotPorted, hr_exception, gmod, isize, callhooks, callhandlers } from './hyper.ts';
import { G } from './globals.ts';
import type { Ref } from './cpp.ts';
import { dynamicval } from './cpp.ts';
import {
  BITRUNCATED, PURE, GOLDBERG_INV, S3, S7, SG2, SG3, SG6, MDIM, eVariation, IRREGULAR, DUAL, GOLDBERG, UNRECTIFIED,
  UNTRUNCATED, WARPED, INVERSE, quotient, sphere, nonorientable, embedded_plane,
} from './classes.ts';
import { XLAT } from './language.ts';
import { its } from './hprint.ts';
import { euc_dist_xy } from './euclid.ts';
import { cellwalker, heptspin, type cell, type heptagon } from './locations.ts';
import type { hrmap, hrmap_standard } from './cell.ts';
import {
  type hyperpoint, type transmatrix, type shiftmatrix, Id, Hypc, C02, C03, M_PI, TAU, point3, hpt, hcopy, tcopy, tnew,
  hadd, hdiv, hmul, tmul, tmulh, inverse, build_matrix, set_column, normalize, rgpushxto0, gpushxto0, rspintox, hypot_d,
  mid, mid_at_actual, tC0, smul,
} from './hyperpoint.ts';
import { spin, spin180, lxpush0, tile_center } from './embeddings.ts';
import { cgi, special_fake } from './geometry.ts';
import { fake_in } from './fake.ts';
import { hrmap as hrmap_value, newCell, initcells, destroy_cell } from './cell.ts';
import { createStep } from './heptagon.ts';
import { drawcell } from './celldrawer.ts';
import { do_draw_T, optimized_shift, dq_clear_all, dq_enqueue_c, dq_enqueue_by_matrix_c } from './hypgraph.ts';
import { rate_limited_error } from './hprint.ts';
import { gp_clear_plainshapes, gp_get_plainshape_id as get_plainshape_id } from './floorshapes.ts';
import { nearcorner } from './geometry2.ts';
import { pseudohept } from './pattern2.ts';

/** gp::loc */
export type loc = [number, number];

/** loc::operator*(loc e2) */
export function gp_loc_mul(a: loc, e2: loc): loc {
  return [a[0] * e2[0] - a[1] * e2[1], a[0] * e2[1] + e2[0] * a[1] + (S3() === 3 ? a[1] * e2[1] : 0)];
}

/** loc::operator+, operator-, operator*(int), operator/(int), conj() */
export function gp_loc_add(a: loc, b: loc): loc { return [a[0] + b[0], a[1] + b[1]]; }
export function gp_loc_sub(a: loc, b: loc): loc { return [a[0] - b[0], a[1] - b[1]]; }
export function gp_loc_muli(a: loc, i: number): loc { return [a[0] * i, a[1] * i]; }
export function gp_loc_div(a: loc, i: number): loc { return [Math.trunc(a[0] / i), Math.trunc(a[1] / i)]; }
export function gp_loc_conj(a: loc): loc { if (S3() === 4) return [a[0], -a[1]]; return [a[0] + a[1], -a[1]]; }
/** int operator %(int i) */
export function gp_loc_mod(a: loc, i: number): number { return gmod(a[0], i) + gmod(a[1], i); }
export const gp_loc_eq = (a: loc, b: loc): boolean => a[0] === b[0] && a[1] === b[1];

/** struct local_info */
export interface gp_local_info { last_dir: number; relative: loc; first_dir: number; total_dir: number; }
export function gp_new_li(): gp_local_info { return { last_dir: 0, relative: [0, 0], first_dir: 0, total_dir: 0 }; }

export function gp_eudir(d: number): loc {
  if (S3() === 3) {
    d %= 6; if (d < 0) d += 6;
    switch (d) {
      case 0: return [1, 0];
      case 1: return [0, 1];
      case 2: return [-1, 1];
      case 3: return [-1, 0];
      case 4: return [0, -1];
      case 5: return [1, -1];
      default: return [0, 0];
    }
  }
  else switch (d & 3) {
    case 0: return [1, 0];
    case 1: return [0, 1];
    case 2: return [-1, 0];
    case 3: return [0, -1];
    default: return [0, 0];
  }
}

/** EX int length(loc p) */
export function gp_length(p: loc): number {
  return euc_dist_xy(p[0], p[1]);
}

/** EX loc gp::param = loc(1, 0) (the variable is G.gp_param) */
export function gp_param(): loc { return G.gp_param; }

// --- the Goldberg data of a geometry_information (geometry.cpp: struct gpdata_t) ---

const GOLDBERG_BITS = 5;
export const GOLDBERG_LIMIT = (1 << GOLDBERG_BITS);
export const GOLDBERG_MASK = (GOLDBERG_LIMIT - 1);

/** struct geometry_information::gpdata_t */
export class gpdata_t {
  /** vector<array<array<array<transmatrix, 6>, GOLDBERG_LIMIT>, GOLDBERG_LIMIT>> Tf: Tf[i][x][y][d] */
  Tf: transmatrix[][][][] = [];
  corners: transmatrix = tnew();
  corners_for_triangle: transmatrix = tnew();
  rotator: transmatrix = tnew();
  alpha = 0;
  scale = 0;
  area = 0;
  /** int pshid[3][8][GOLDBERG_LIMIT][GOLDBERG_LIMIT][8] */
  pshid = new Int32Array(3 * 8 * GOLDBERG_LIMIT * GOLDBERG_LIMIT * 8);
  id_to_params: number[][] = [];
  /** map<vector<int>, int> field_data (keys joined with ',') */
  field_data = new Map<string, number>();
}
export function pshid_index(a: number, b: number, c: number, d: number, e: number): number {
  return (((a * 8 + b) * GOLDBERG_LIMIT + c) * GOLDBERG_LIMIT + d) * 8 + e;
}
function gpd(): gpdata_t { return cgi().gpdata!; }

// --- the local triangle mapping ---

/** EX int fixg6(int x) */
export function gp_fixg6(x: number): number { return gmod(x, SG6()); }

const GOLDBERG_LIMIT_HALF = GOLDBERG_LIMIT / 2;
const GOLDBERG_MASK_HALF = GOLDBERG_MASK / 2 | 0;

export function gp_get_code(li: gp_local_info): number {
  return (
    ((li.relative[0] & GOLDBERG_MASK_HALF) << 0) +
    ((li.relative[1] & GOLDBERG_MASK_HALF) << (GOLDBERG_BITS - 1)) +
    ((gp_fixg6(li.total_dir)) << (2 * GOLDBERG_BITS - 2)) +
    ((li.last_dir & 15) << (2 * GOLDBERG_BITS + 2))) | 0;
}

export function gp_get_local_info(c: cell): gp_local_info {
  if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return gp_in_underlying_geometry(() => gp_get_local_info(c1));
  }
  const li = gp_new_li();
  if (c === c.master.c7) {
    li.relative = [0, 0];
    li.first_dir = -1;
    li.last_dir = -1;
    li.total_dir = -1;
  }
  else {
    const dirs: number[] = [];
    while (c !== c.master.c7) {
      dirs.push(c.c.spin(0));
      c = c.move(0);
    }
    li.first_dir = dirs[0];
    li.last_dir = dirs[dirs.length - 1];

    let at: loc = [0, 0];
    let dir = 0;
    at = gp_loc_add(at, gp_eudir(dir));
    dirs.pop();
    while (dirs.length) {
      dir += dirs[dirs.length - 1] + SG3();
      dirs.pop();
      at = gp_loc_add(at, gp_eudir(dir));
    }
    li.relative = at;
    li.total_dir = dir + SG3();
  }
  return li;
}

export function gp_last_dir(c: cell): number {
  return gp_get_local_info(c).last_dir;
}

export function gp_get_coord(c: cell): loc {
  return gp_get_local_info(c).relative;
}

export function gp_pseudohept_val(c: cell): number {
  const v = gp_get_coord(c);
  return gmod(v[0] - v[1], 3);
}

/** struct goldberg_mapping_t */
class goldberg_mapping_t {
  cw = new cellwalker(null!, 0, false);
  rdir = 0;
  mindir = 0;
  start: loc = [0, 0];
  adjm: transmatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  rdir1 = 0;
}

// mapping of the local equilateral triangle
// goldberg_map[y][x].cw is the cellwalker in this triangle at position (x,y)
// facing local direction 0
const goldberg_map: goldberg_mapping_t[][] = [];
function make_goldberg_map(): void {
  for (let y = 0; y < GOLDBERG_LIMIT; y++) {
    goldberg_map.push([]);
    for (let x = 0; x < GOLDBERG_LIMIT; x++) goldberg_map[y].push(new goldberg_mapping_t());
  }
}

function clear_mapping(): void {
  if (!goldberg_map.length) make_goldberg_map();
  for (let y = 0; y < GOLDBERG_LIMIT; y++) for (let x = 0; x < GOLDBERG_LIMIT; x++) {
    goldberg_map[y][x].cw.at = null!;
    goldberg_map[y][x].rdir = -1;
    goldberg_map[y][x].mindir = 0;
    goldberg_map[y][x].rdir1 = -1;
  }
}

function get_mapping(c: loc): goldberg_mapping_t {
  return goldberg_map[c[1] & GOLDBERG_MASK][c[0] & GOLDBERG_MASK];
}

/** int spawn */
let spawn = 0;
void spawn;

function peek(cw: cellwalker): cell { return cw.at.move(cw.spin); }
function set_peek(cw: cellwalker, c: cell): void { cw.at.setMove(cw.spin, c); }

function get_localwalk(wc: goldberg_mapping_t, dir: number): cellwalker {
  if (dir < wc.mindir) dir += SG6();
  if (dir >= wc.mindir + SG6()) dir -= SG6();
  return wc.cw.plus(dir);
}

function set_localwalk(wc: goldberg_mapping_t, dir: number, cw: cellwalker): void {
  if (dir < wc.mindir) dir += SG6();
  if (dir >= wc.mindir + SG6()) dir -= SG6();
  wc.cw = cw.minus(dir);
}

function pull(at: loc, dir: number): boolean {
  const wc = get_mapping(at);
  const at1 = gp_loc_add(at, gp_eudir(dir));
  const dir1 = gp_fixg6(dir + SG3());
  const wcw = get_localwalk(wc, dir);
  const wc1 = get_mapping(at1);
  if (wc1.cw.at) {
    if (peek(wcw)) {
      const wcw1 = get_localwalk(wc1, dir1);
      if (wcw.plusStep().ne(wcw1)) {
        // DEBB(debug_gp, (at1, " : ", (wcw+wstep), " / ", wcw1, " (pull error from ", at, " :: ", wcw, ")") );
        throw new hr_exception('gp::pull: pull error (exit(1) in the original)');
      }
      if (G.gp_do_adjm) wc1.adjm = tmul(wc.adjm, gp_get_adj(wcw.at, wcw.spin));
    }
    return false;
  }
  if (peek(wcw)) {
    set_localwalk(wc1, dir1, wcw.plusStep());
    if (G.gp_do_adjm) wc1.adjm = tmul(wc.adjm, gp_get_adj(wcw.at, wcw.spin));
    return true;
  }
  return false;
}

function conn1(at: loc, dir: number, dir1: number): void {
  const wc = get_mapping(at);
  const wcw = get_localwalk(wc, dir);
  const wc1 = get_mapping(gp_loc_add(at, gp_eudir(dir)));
  if (!wc1.cw.at) {
    wc1.start = wc.start;
    if (peek(wcw)) {
      set_localwalk(wc1, dir1, wcw.plusStep());
      if (G.gp_do_adjm) wc1.adjm = tmul(wc.adjm, gp_get_adj(wcw.at, wcw.spin));
    }
    else {
      set_peek(wcw, newCell(SG6(), wc.cw.at.master));
      wcw.at.c.setspin(wcw.spin, 0, false);
      set_localwalk(wc1, dir1, wcw.plusStep());
      if (G.gp_do_adjm) wc1.adjm = wc.adjm;
      spawn++;
    }
  }
  const wcw1 = get_localwalk(wc1, dir1);
  if (peek(wcw)) {
    if (wcw.plusStep().ne(wcw1)) {
      // DEBB(debug_gp, ("FAIL: ", wcw, " connected to ", wcw+wstep, " not to ", wcw1); exit(1); )
    }
  }
  else {
    set_peek(wcw, wcw1.at);
    wcw.at.c.setspin(wcw.spin, wcw1.spin, wcw.mirrored !== wcw1.mirrored);
    if (wcw.plusStep().ne(wcw1))
      throw new hr_exception('assertion failed in gp::conn1');
  }
  if (G.gp_do_adjm) {
    gp_set_adj(wcw.at, wcw.spin, tmul(inverse(wc.adjm), wc1.adjm));
    gp_set_adj(wcw1.at, wcw1.spin, tmul(inverse(wc1.adjm), wc.adjm));
    // if(geom3::flipped) gp_swapped.emplace(...): geom3::flipped is false without an embedded plane
  }
}

function conn(at: loc, dir: number): void {
  conn1(at, gp_fixg6(dir), gp_fixg6(dir + SG3()));
  conn1(gp_loc_add(at, gp_eudir(dir)), gp_fixg6(dir + SG3()), gp_fixg6(dir));
}

/** map<pair<cell*, int>, transmatrix> gp::gp_adj (keyed by the cell, then the direction) and set gp::gp_swapped
 *  (only with geom3::flipped: never filled here) */
export const gp_gp_adj = new Map<cell, Map<number, transmatrix>>();
export const gp_gp_swapped = new Set<string>();

/** transmatrix& get_adj(cell *c, int i): reading (an absent entry is created as a zero matrix, as operator[]) */
export function gp_get_adj(c: cell, i: number): transmatrix {
  let m = gp_gp_adj.get(c);
  if (!m) { m = new Map(); gp_gp_adj.set(c, m); }
  let T = m.get(i);
  if (!T) { T = tnew(); m.set(i, T); }
  return T;
}
/** get_adj(c, i) = T */
export function gp_set_adj(c: cell, i: number, T: transmatrix): void {
  let m = gp_gp_adj.get(c);
  if (!m) { m = new Map(); gp_gp_adj.set(c, m); }
  m.set(i, T);
}
/** gp_adj.count(make_pair(c, i)) */
export function gp_has_adj(c: cell, i: number): boolean {
  return gp_gp_adj.get(c)?.has(i) ?? false;
}

function set_heptspin(at: loc, hs: heptspin): goldberg_mapping_t {
  const ac0 = get_mapping(at);
  ac0.cw = new cellwalker(hs.at.c7, hs.spin, hs.mirrored);
  ac0.start = at;
  return ac0;
}


export function gp_extend_map(c: cell, d: number): void {
  // DEBB(debug_gp, ("EXTEND ",c, " ", d)); indenter ind(2);
  if (c.master.c7 !== c) {
    const c1 = c;
    const d1 = d;
    while (c.master.c7 !== c) {
      d = c.c.spin(0);
      c = c.move(0);
    }
    // c move 0 equals c' move spin(0)
    gp_extend_map(c, d);
    gp_extend_map(c, c.c.fix(d - 1));
    gp_extend_map(c, c.c.fix(d + 1));
    if (S3() === 4 && !c1.move(d1)) {
      for (let i = 0; i < S7(); i++)
        for (let j = 0; j < S7(); j++)
          gp_extend_map(createStep(c.master, i).c7, j);
    }
    if (S3() === 4 && !c1.move(d1)) {
      for (let i = 0; i < S7(); i++)
        for (let i1 = 0; i1 < S7(); i1++)
          for (let j = 0; j < S7(); j++)
            gp_extend_map(createStep(createStep(c.master, i), i1).c7, j);
    }
    return;
  }

  const param = G.gp_param;
  if (S3() === 4 && param[0] <= param[1]) { d--; if (d < 0) d += S7(); }
  clear_mapping();

  // we generate a local map from an Euclidean grid to the
  // hyperbolic grid we build.

  // we fill the equilateral triangle with the following vertices:

  const vc: loc[] = [[0, 0], [0, 0], [0, 0], [0, 0]];
  vc[0] = [0, 0];
  vc[1] = [param[0], param[1]];
  if (S3() === 3)
    vc[2] = gp_loc_mul(param, [0, 1]);
  else {
    vc[2] = gp_loc_mul(param, [1, 1]);
    vc[3] = gp_loc_mul(param, [0, 1]);
  }

  const hs = new heptspin(c.master, d, false);

  const ac0 = set_heptspin(vc[0], hs);
  ac0.mindir = -1;
  const ac1 = set_heptspin(vc[1], hs.plusStep().add(-SG3()));
  ac1.mindir = 0;
  const ac2 = set_heptspin(vc[S3() - 1], S3() === 3 ? hs.plus(1).addStep().add(-4) : hs.plus(1).addStep().add(1));
  ac2.mindir = S3() === 3 ? 1 : -2;
  if (S3() === 4) {
    set_heptspin(vc[2], hs.plusStep().add(-1).addStep().add(1)).mindir = -3;
  }

  G.gp_do_adjm = quotient() || sphere();
  if (G.gp_do_adjm) {
    const m = G.currentmap as hrmap_standard;
    get_mapping(vc[0]).adjm = Id;
    get_mapping(vc[1]).adjm = m.adj_h(c.master, d);
    get_mapping(vc[S3() - 1]).adjm = m.adj_h(c.master, (d + 1) % c.master.type);
    if (S3() === 4) {
      const hs1 = hs.plusStep().add(-1);
      get_mapping(vc[2]).adjm = tmul(m.adj_h(c.master, d), m.adj_h(hs1.at, hs1.spin));
    }
  }

  const fix_mirrors = (): void => {
    if (ac1.cw.mirrored !== hs.mirrored) ac1.cw.dec();
    if (ac2.cw.mirrored !== hs.mirrored) ac2.cw.dec();
    if (S3() === 4) {
      const ac3 = get_mapping(vc[2]);
      if (ac3.cw.mirrored !== hs.mirrored) ac3.cw.dec();
    }
  };

  if (S3() === 4 && gp_loc_eq(param, [1, 1])) {
    fix_mirrors();
    conn([0, 0], 1);
    conn([0, 1], 0);
    conn([0, 1], 1);
    conn([0, 1], 2);
    conn([0, 1], 3);
    return;
  }

  if (S3() === 4 && param[0] === param[1] && nonorientable()) {
    fix_mirrors();

    const size = param[0];

    // go along the boundary of the 'diamond'

    for (let dir = 0; dir < 4; dir++) {
      const dir_orth = (dir + 1) & 3;

      let at = vc[dir];

      for (let i = 0; i < size; i++) {
        if (!pull(at, dir)) break;
        at = gp_loc_add(at, gp_eudir(dir));

        if (!pull(at, dir_orth)) break;
        at = gp_loc_add(at, gp_eudir(dir_orth));
      }
    }

    // build the skeleton

    for (let dir = 0; dir < 4; dir++) {
      const dir_orth = (dir + 1) & 3;
      for (let i = 0; i < size; i++) {
        conn(gp_loc_add(vc[dir], gp_loc_muli(gp_eudir(dir_orth), i)), dir_orth);
      }
    }

    // fill everything

    for (let y = 0; y < 2 * size; y++) {
      const xdist = Math.min(y, 2 * size - y);
      for (let x = 0; x < xdist; x++)
        for (let d = 0; d < 4; d++) {
          conn([x, y], d);
          conn([-x, y], d);
        }
    }

    return;
  }

  if (nonorientable() && param[0] === param[1]) {
    const x = param[0];
    fix_mirrors();

    for (let d = 0; d < 3; d++) for (let k = 0; k < 3; k++)
      for (let i = 0; i < x; i++) {
        const dd = (2 * d + k);
        const cx = gp_loc_add(vc[d], gp_loc_muli(gp_eudir(dd), i));
        if (!pull(cx, dd)) break;
      }

    for (let i = 0; i <= 2 * x; i++)
      for (let d = 0; d < 3; d++) {
        const cx = gp_loc_add(vc[d], gp_loc_muli(gp_eudir(1 + 2 * d), i));
        if (i < 2 * x) conn(cx, 1 + 2 * d);
        let jmax = x - i, drev = 2 * d;
        if (jmax < 0) { drev += 3; jmax = -jmax; }
        for (let j = 0; j < jmax; j++) {
          const cy = gp_loc_add(cx, gp_loc_muli(gp_eudir(drev), j));
          conn(cy, drev);
          conn(cy, drev + 1);
          conn(cy, drev + 2);
        }
      }

    return;
  }

  // then we set the edges of our big equilateral triangle (in a symmetric way)
  // rdir describes a loop on the boundary of that triangle, and rdir1 is the same loop in reverse direction
  for (let i = 0; i < S3(); i++) {
    let start = vc[i];
    let end = vc[(i + 1) % S3()];
    let rel: loc = [param[0], param[1]];
    const build = (which: 0 | 1, dx: number, forward: boolean): void => {
      const at = which ? end : start;
      const dx0 = gp_fixg6(dx + SG2() * i);
      const at1 = gp_loc_add(at, gp_eudir(dx0));
      const dx1 = gp_fixg6(dx0 + SG3());
      conn(at, dx0);
      if (forward) { get_mapping(at).rdir = dx0; get_mapping(at1).rdir1 = dx1; }
      else { get_mapping(at).rdir1 = dx0; get_mapping(at1).rdir = dx1; }
      if (which) end = gp_loc_add(at, gp_eudir(dx0)); else start = gp_loc_add(at, gp_eudir(dx0));
    };
    while (rel[0] >= 2 && (S3() === 3 ? rel[0] >= 2 - rel[1] : true)) {
      build(0, 0, true);
      build(1, SG3(), false);
      rel[0] -= 2;
    }
    while (rel[1] >= 2) {
      build(0, 1, true);
      build(1, 1 + SG3(), false);
      rel[1] -= 2;
    }
    while (rel[1] <= -2 && S3() === 3) {
      build(0, 5, true);
      build(1, 2, false);
      rel[1] += 2;
      rel[0] -= 2;
    }
    if (S3() === 3) while ((rel[0] > 0 && rel[1] > 0) || (rel[0] > 1 && rel[1] < 0)) {
      build(0, 0, true);
      build(1, 3, false);
      rel[0] -= 2;
    }
    if (S3() === 4 && gp_loc_eq(rel, [1, 1])) {
      build(0, 1, true);
      build(1, 2, false);
      rel[0]--;
      rel[1]--;
    }
    for (let k = 0; k < SG6(); k++)
      if (gp_loc_eq(gp_loc_add(start, gp_eudir(k + SG2() * i)), end))
        build(0, k, true);
    if (!gp_loc_eq(start, end)) {
      // DEBB(debug_gp || debug_errors, ("assertion failed: start ", start, " == end ", end));
      throw new hr_exception('assertion failed in extend_map');
    }
  }

  // now we can fill the interior of our big equilateral triangle
  const all_locations: loc[] = [];
  const visited = new Set<string>();
  const visit = (x: loc): void => {
    const k = x[0] + ',' + x[1];
    if (visited.has(k)) return;
    visited.add(k);
    all_locations.push(x);
  };
  for (let i = 0; i < S3(); i++) visit(vc[i]);

  for (let i = 0; i < isize(all_locations); i++) {
    const at = all_locations[i];
    const m = get_mapping(at);
    for (let j = 0; j < SG6(); j++) {
      if (m.rdir >= 0) {
        if (m.rdir1 > m.rdir && !(j >= m.rdir && j <= m.rdir1)) continue;
        if (m.rdir1 < m.rdir && !(j >= m.rdir || j <= m.rdir1)) continue;
      }
      const at1 = gp_loc_add(at, gp_eudir(j));
      conn(at, j);
      visit(at1);
    }
  }
  // DEBB(debug_gp, ("DONE"))
}

export function gp_loctoh_ort(at: loc): hyperpoint {
  return point3(at[0], at[1], 1);
}

const corner_coords6: hyperpoint[] = [
  [2, -1, 0, 0],
  [1, 1, 0, 0],
  [-1, 2, 0, 0],
  [-2, 1, 0, 0],
  [-1, -1, 0, 0],
  [1, -2, 0, 0],
  [0, 0, 0, 0], // center, not a corner
];

const corner_coords4: hyperpoint[] = [
  [1.5, -1.5, 0, 0],
  //    point3(1, 0, 0),
  [1.5, 1.5, 0, 0],
  //    point3(0, 1, 0),
  [-1.5, 1.5, 0, 0],
  //    point3(-1, 0, 0),
  [-1.5, -1.5, 0, 0],
  //    point3(0, -1, 0),
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

/** #define corner_coords (S3==3 ? corner_coords6 : corner_coords4) */
function corner_coords(): hyperpoint[] { return S3() === 3 ? corner_coords6 : corner_coords4; }

// hookset<bool(const transmatrix& corners, const hyperpoint& c, hyperpoint& h)> hooks_cornmul: G.gp_hooks_cornmul
// hookset<void(const transmatrix& corners)> hooks_init_cornmul: G.gp_hooks_init_cornmul

export function gp_cornmul(corners: transmatrix, c: hyperpoint): hyperpoint {

  const h: Ref<hyperpoint> = { v: [0, 0, 0, 0] };
  if (callhandlers(false, G.gp_hooks_cornmul, corners, c, h)) return h.v;

  if (sphere() && S3() === 3) {
    const cmin = c[0] * c[1] * c[2] * (6 - S7());
    return tmulh(corners, point3(c[0] + cmin, c[1] + cmin, c[2] + cmin));
  }
  else return tmulh(corners, c);
}

// bool gp_style = true: G.gp_gp_style (disable for the old implementation which did not support fake)

/** for h in corner cordinates, rotate until it is in the correct triangle, and return the number of rotations
 *  needed (h is changed: h.v) */
function rotate_to_correct(h: Ref<hyperpoint>): number {
  let sp = 0;
  while (h.v[1] < -1e-6 || h.v[2] < -1e-6) {
    h.v = tmulh(gpd().rotator, h.v);
    sp++;
  }
  if (sp > SG3()) sp -= SG6();
  return sp;
}

function atz(T: transmatrix, corners: transmatrix, at: loc, cornerid = 6, cf = 3): hyperpoint {

  const corner: Ref<hyperpoint> = { v: tmulh(corners, hadd(gp_loctoh_ort(at), hdiv(corner_coords()[cornerid], cf))) };
  const sp = rotate_to_correct(corner);

  if (G.gp_gp_style && corner.v[0] < -1e-6) {
    const ac: Ref<hyperpoint> = { v: hcopy(corner.v) }; ac.v[1] = 1 - corner.v[1]; ac.v[2] = 1 - corner.v[2]; ac.v[0] = -ac.v[0];
    const ctr = normalize(gp_cornmul(T, hpt(0, 0.5, 0.5, 0)));
    const sp2 = rotate_to_correct(ac);
    return tmulh(tmul(tmul(tmul(spin(TAU * sp / S7()),
      rgpushxto0(ctr)), rgpushxto0(ctr)), spin(M_PI + TAU * sp2 / S7())),
    normalize(gp_cornmul(T, ac.v)));
  }

  return normalize(tmulh(spin(TAU * sp / S7()), gp_cornmul(T, corner.v)));
}

export function gp_dir_matrix(i: number): transmatrix {
  const ddspin = (d: number): transmatrix => {
    return spin(M_PI - d * TAU / S7() - cgi().hexshift);
  };
  // geom3::flipped is false without an embedded plane: gxpush0 = lxpush0, tile_center()
  const gxpush0 = lxpush0;
  return tmul(spin(-gpd().alpha), build_matrix(
    tile_center(),
    G.gp_gp_style ? tmulh(tmul(ddspin(i), spin(-M_PI / S7())), gxpush0(cgi().hcrossf)) : tmulh(ddspin(i), gxpush0(cgi().tessf)),
    G.gp_gp_style ? tmulh(tmul(ddspin(i), spin(M_PI / S7())), gxpush0(cgi().hcrossf)) : tmulh(ddspin(i + 1), gxpush0(cgi().tessf)),
    C03,
  ));
}

export function gp_prepare_matrices(inv: boolean): void {
  if (!(GOLDBERG_INV() || inv)) return;
  if (embedded_plane()) throw new NotPorted('gp::prepare_matrices: embedded plane (geom3::light_flip)');
  const gd = gpd();
  const param = G.gp_param;
  gd.corners_for_triangle = inverse(build_matrix(
    gp_loctoh_ort([0, 0]),
    gp_loctoh_ort(param),
    gp_loctoh_ort(gp_loc_mul(param, [0, 1])),
    C03,
  ));
  gd.corners = (!G.gp_gp_style) ? gd.corners_for_triangle : inverse(build_matrix(
    gp_loctoh_ort([0, 0]),
    S3() === 4 ? hdiv(hadd(gp_loctoh_ort(gp_loc_mul(param, [1, 1])), C02), 2) : hdiv(hadd(hadd(gp_loctoh_ort([0, 0]), gp_loctoh_ort(param)), gp_loctoh_ort(gp_loc_mul(param, [0, 1]))), 3),
    S3() === 4 ? hdiv(hadd(gp_loctoh_ort(gp_loc_mul(param, [1, -1])), C02), 2) : hdiv(hadd(hadd(gp_loctoh_ort([0, 0]), gp_loctoh_ort(param)), gp_loctoh_ort(gp_loc_mul(gp_loc_mul(gp_loc_mul(gp_loc_mul(gp_loc_mul(param, [0, 1]), [0, 1]), [0, 1]), [0, 1]), [0, 1]))), 3),
    C03,
  ));
  for (let i = 0; i < MDIM(); i++) {
    let ac = hcopy(Hypc); ac[i] = 1;
    let xac = tmulh(inverse(gd.corners), ac);
    xac = hadd(hmul(gp_loctoh_ort(gp_eudir(1)), xac[0]), hmul(gp_loctoh_ort(gp_eudir(2)), xac[1])); xac[2] = 1; xac[3] = 0;
    ac = tmulh(gd.corners, xac);
    set_column(gd.rotator, i, ac);
  }

  callhooks(G.gp_hooks_init_cornmul, gp_dir_matrix(0));

  gd.Tf.length = S7();

  /* should work directly without flipping but it does not... flipping for now */

  const nd = S3() === 3 ? 6 : 4;
  for (let i = 0; i < S7(); i++) {
    const T = gp_dir_matrix(i);
    const Ti: transmatrix[][][] = [];
    for (let x = 0; x < GOLDBERG_LIMIT; x++) {
      const row: transmatrix[][] = [];
      for (let y = 0; y < GOLDBERG_LIMIT; y++) {
        const cellv: transmatrix[] = [];
        for (let d = 0; d < 6; d++) cellv.push(Zero6);
        row.push(cellv);
      }
      Ti.push(row);
    }
    gd.Tf[i] = Ti;
    for (let x = -GOLDBERG_LIMIT_HALF; x < GOLDBERG_LIMIT_HALF; x++)
      for (let y = -GOLDBERG_LIMIT_HALF; y < GOLDBERG_LIMIT_HALF; y++)
        for (let d = 0; d < nd; d++) {
          const at: loc = [x, y];

          const h = atz(T, gd.corners, at, 6);
          const hl = atz(T, gd.corners, gp_loc_add(at, gp_eudir(d)), 6);
          Ti[x & GOLDBERG_MASK][y & GOLDBERG_MASK][d] = tmul(tmul(rgpushxto0(h), rspintox(tmulh(gpushxto0(h), hl))), spin180());
        }
  }

  // if(geom3::flipped) { ... cgi.emb->base_to_actual(T) }: an embedded plane (thrown above)
}
/** the entries of Tf that prepare_matrices does not fill (d = 4, 5 when S3 == 4): zero, as vector::resize makes them */
const Zero6: transmatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

export function gp_get_corner_position_li(li: gp_local_info, cid: number, cf = 3): hyperpoint {
  const i = li.last_dir;
  if (i === -1)
    return atz(gp_dir_matrix(cid), gpd().corners, li.relative, 0, cf);
  else {
    const cellmatrix = gpd().Tf[i][li.relative[0] & GOLDBERG_MASK][li.relative[1] & GOLDBERG_MASK][gp_fixg6(li.total_dir)];
    return tmulh(inverse(cellmatrix), atz(gp_dir_matrix(i), gpd().corners, li.relative, gp_fixg6(cid + li.total_dir), cf));
  }
}

export function gp_get_corner_position(c: cell, cid: number, cf = 3): hyperpoint {
  return gp_get_corner_position_li(gp_get_local_info(c), cid, cf);
}

/** map<pair<int, int>, loc> center_locs */
const center_locs = new Map<string, loc>();

export function gp_compute_geometry(inv: boolean): void {
  center_locs.clear();
  if (GOLDBERG_INV() || inv) {
    const g = cgi();
    if (!g.gpdata) g.gpdata = new gpdata_t();
    const gd = g.gpdata;
    gp_clear_plainshapes();
    const x = G.gp_param[0];
    const y = G.gp_param[1];
    if (S3() === 3)
      gd.area = Math.trunc(((2 * x + y) * (2 * x + y) + y * y * 3) / 4);
    else
      gd.area = x * x + y * y;
    G.gp_next = point3(x + y / 2, -y * Math.sqrt(3) / 2, 0);
    gd.scale = 1 / hypot_d(2, G.gp_next);
    if (!GOLDBERG()) gd.scale = 1;
    if (special_fake()) gd.scale = 1;
    const scale = gd.scale;
    g.crossf *= scale;
    g.hexhexdist *= scale;
    g.hexvdist *= scale;
    g.rhexf *= scale;
    //    spin = spintox(next);
    //    ispin = rspintox(next);
    gd.alpha = -Math.atan2(G.gp_next[1], G.gp_next[0]) * 6 / S7();
    // DEBB(debug_geometry, ("scale = ", scale));
  }
}

// --- the variations menu (stage 3, package G1) ---
import { a4, UNTRUNCATED as UNTRUNC } from './classes.ts';
import { stop_game, start_game, set_variation } from './system.ts';
import { addMessage } from './basegraph.ts';
import { pushScreen } from './control.ts';
import { gamescreen, sm } from './graph.ts';
import {
  dialog_init_t, dialog_addBoolItem, dialog_lastItem, dialog_add_action_confirmed, dialog_addBreak, dialog_addSelItem,
  dialog_add_action, dialog_editNumber, dialog_addInfo, dialog_addItem, dialog_addHelp, dialog_addBack, dialog_display,
  ONOFF,
} from './dialogs.ts';
import { geosupport_football, geosupport_chessboard } from './pattern2.ts';
import { gotoHelp } from './help.ts';
import { variation_ported } from './geom-exp.ts';
import { add_edit, P } from './config.ts';
import { irr_supports } from './irregular.ts';

/** loc config (the x, y of the menu) */
let config: loc = [1, 0];

export function gp_rotate_and_check_limits(v: loc): [boolean, loc] {
  while (v[0] < 0 || v[1] < 0 || (v[0] === 0 && v[1] > 0))
    v = gp_loc_mul(v, [0, 1]);
  return [2 * (v[0] + v[1]) < (1 << GOLDBERG_BITS), v];
}

export function gp_check_limits(v: loc): boolean {
  return gp_rotate_and_check_limits(v)[0];
}

function internal_representation(v: loc): loc {
  for (;;) {
    const [ok, w] = gp_rotate_and_check_limits(v);
    v = w;
    if (ok) break;
    if (v[0] > v[1]) v = [v[0] - 1, v[1]]; else v = [v[0], v[1] - 1];
  }
  if (S3() === 3 && v[1] > v[0]) v = gp_loc_mul(v, [1, -1]);
  return v;
}

/** EX loc human_representation(loc v) */
export function gp_human_representation(v: loc): loc {
  if (S3() === 3) while (v[0] < 0 || v[1] < 0 || (v[0] === 0 && v[1] > 0))
    v = gp_loc_mul(v, [0, 1]);
  return v;
}

export function gp_variation_for(xy: loc): number {
  if (xy[0] === 1 && xy[1] === 0)
    return eVariation.pure;
  if (xy[0] === 1 && xy[1] === 1 && S3() === 3)
    return eVariation.bitruncated;
  return eVariation.goldberg;
}

export function gp_whirl_set(xy: loc): void {
  xy = internal_representation(xy);
  if (xy[1] && xy[1] !== xy[0] && nonorientable()) {
    addMessage(XLAT('This does not work in non-orientable geometries'));
    xy = [xy[0], 0];
  }
  config = gp_human_representation(xy);
  const g = [...G.screens];
  if (xy[0] === 0 && xy[1] === 0) xy = [1, xy[1]];
  // stage 3 deviation: the variations not ported yet
  if (!variation_ported(gp_variation_for(xy))) { addMessage(XLAT('not available in this version yet')); return; }
  stop_game();
  G.gp_param = [xy[0], xy[1]];
  if (xy[0] === 1 && xy[1] === 0) {
    set_variation(eVariation.pure);
  }
  else if (xy[0] === 1 && xy[1] === 1 && S3() === 3) {
    set_variation(eVariation.bitruncated);
  }
  else
    set_variation(eVariation.goldberg);
  start_game();
  G.screens = g;
}

export function gp_check_whirl_set(xy: loc): boolean {
  if (!gp_check_limits(xy)) {
    addMessage(XLAT('Outside of the supported limits'));
    return false;
  }
  gp_whirl_set(xy);
  return true;
}

function helptext(): string {
  return XLAT(
    'Goldberg polyhedra are obtained by adding extra hexagons to a dodecahedron. ' +
    'GP(x,y) means that, to get to a nearest non-hex from any non-hex, you should move x ' +
    'cells in any direction, turn right 60 degrees, and move y cells. ' +
    'HyperRogue generalizes this to any tesselation with 3 faces per vertex. ' +
    'By default HyperRogue uses bitruncation, which corresponds to GP(1,1).',
  );
}

export function gp_dual_of_current(): void {
  const p = gp_univ_param();
  if (S3() === 3 && !UNTRUNCATED()) {
    // println(hlog, "set param to ", p * loc(1,1));
    if (!gp_check_whirl_set(gp_loc_mul(p, [1, 1]))) return;
    set_variation(eVariation.untruncated);
    start_game();
    config = gp_human_representation(gp_univ_param());
  }
  else if (S3() === 4 && !UNRECTIFIED()) {
    if (!gp_check_whirl_set(gp_loc_mul(p, [1, 1]))) return;
    set_variation(eVariation.unrectified);
    start_game();
    config = gp_human_representation(gp_univ_param());
  }
  else if (S3() === 3 && UNTRUNCATED()) {
    // println(hlog, "whirl_set to ", (p * loc(1,1)) / 3);
    if (!gp_check_whirl_set(gp_loc_div(gp_loc_mul(p, [1, 1]), 3))) return;
    config = gp_human_representation(gp_univ_param());
  }
  else if (S3() === 4 && UNRECTIFIED()) {
    if (!gp_check_whirl_set(gp_loc_div(gp_loc_mul(p, [1, 1]), 2))) return;
    config = gp_human_representation(gp_univ_param());
  }
}

const not_available_v = (): void => { addMessage(XLAT('not available in this version yet')); };

const chc = (c: string): number => c.charCodeAt(0);
const loceq = gp_loc_eq;

/** void gp::show() */
export function gp_show(): void {
  G.cmode = sm.SIDE | sm.MAYDARK;
  gamescreen();
  dialog_init_t(XLAT('variations'));

  const min_quality_chess = 0;

  const min_quality = 0;
  // CAP_TEXTURE: texture::config.tstate == tsActive (the textures: a later package; never active)
  if (min_quality === 0 && min_quality_chess === 0) {
    dialog_addBoolItem(XLAT('pure'), PURE() || (GOLDBERG() && loceq(gp_univ_param(), [1, 0])), chc('a'));
    dialog_lastItem().value = 'GP(1,0)';
    dialog_add_action_confirmed(() => { gp_whirl_set([1, 0]); });
  }

  if (min_quality_chess === 0) {
    dialog_addBoolItem(XLAT('bitruncated'), BITRUNCATED(), chc('b'));
    dialog_add_action_confirmed(() => {
      if (S3() === 4) {
        if (!BITRUNCATED()) {
          stop_game();
          set_variation(eVariation.bitruncated);
          start_game();
        }
      }
      else
        gp_whirl_set([1, 1]);
    });
  }

  dialog_lastItem().value = S3() === 3 ? 'GP(1,1)' : ONOFF(BITRUNCATED());

  if (min_quality === 0 || min_quality_chess) {
    dialog_addBoolItem(S3() === 3 ? XLAT('chamfered') : XLAT('expanded'), loceq(gp_univ_param(), [2, 0]) && GOLDBERG(), chc('c'));
    dialog_lastItem().value = 'GP(2,0)';
    dialog_add_action_confirmed(() => {
      gp_whirl_set([2, 0]);
    });
  }

  if (S3() === 3) {
    dialog_addBoolItem(XLAT('2x bitruncated'), GOLDBERG() && loceq(gp_univ_param(), [3, 0]), chc('d'));
    dialog_lastItem().value = 'GP(3,0)';
    dialog_add_action_confirmed(() => {
      gp_whirl_set([3, 0]);
    });
  }
  else {
    dialog_addBoolItem(XLAT('rectified'), loceq(G.gp_param, [1, 1]) && GOLDBERG(), chc('d'));
    dialog_lastItem().value = 'GP(1,1)';
    dialog_add_action_confirmed(() => {
      gp_whirl_set([1, 1]);
    });
  }

  dialog_addBreak(100);
  const max_goldberg = (1 << GOLDBERG_BITS) / 2 - 1;
  dialog_addSelItem('x', its(config[0]), chc('x'));
  dialog_add_action(() => { dialog_editNumber({ get v() { return config[0]; }, set v(x: number) { config = [x, config[1]]; } }, 0, max_goldberg, 1, 1, 'x', helptext()); });
  dialog_addSelItem('y', its(config[1]), chc('y'));
  dialog_add_action(() => { dialog_editNumber({ get v() { return config[1]; }, set v(x: number) { config = [config[0], x]; } }, 0, max_goldberg, 1, 1, 'y', helptext()); });

  if (!gp_check_limits(config))
    dialog_addInfo(XLAT('Outside of the supported limits'));
  if (config[1] && config[1] !== config[0] && nonorientable()) {
    dialog_addInfo(XLAT('This does not work in non-orientable geometries'));
  }
  else if ((config[0] - config[1]) % 3 && min_quality)
    dialog_addInfo(XLAT('This pattern needs x-y divisible by 3'));
  else if ((config[0] - config[1]) % 2 && min_quality_chess)
    dialog_addInfo(XLAT('This pattern needs x-y divisible by 2'));
  else {
    dialog_addBoolItem(XLAT('select'), loceq(G.gp_param, internal_representation(config)) && !IRREGULAR() && !INVERSE(), chc('f'));
    dialog_lastItem().value = 'GP(x,y)';
  }
  dialog_add_action_confirmed(() => { gp_whirl_set(config); });

  dialog_addBreak(100);

  // CAP_IRR: irr::supports(geometry): the irregular variation (a later package)
  if (irr_supports(G.geometry)) {
    dialog_addBoolItem(XLAT('irregular'), IRREGULAR(), chc('i'));
    dialog_add_action(not_available_v); // irr::visual_creator (deviation)
  }

  dialog_addBreak(100);
  let style = 0;
  const v0 = gp_variation_for(G.gp_param);
  const bad_bi = BITRUNCATED() && a4();
  if (!bad_bi) {
    const old = G.variation;
    G.variation = v0;
    try {
      if (geosupport_football() === 2) style = 3;
      if (geosupport_chessboard()) style = 2;
    }
    finally { G.variation = old; }
  }
  if (style === 2) {
    dialog_addBoolItem(XLAT('inverse rectify'), UNRECTIFIED(), chc('r'));
    dialog_add_action_confirmed(() => {
      G.gp_param = gp_univ_param();
      if (UNRECTIFIED()) set_variation(v0);
      else set_variation(eVariation.unrectified);
      start_game();
      config = gp_human_representation(gp_univ_param());
    });
  }
  else if (style === 3) {
    dialog_addBoolItem(XLAT('inverse truncate'), UNTRUNC(), chc('t'));
    dialog_add_action_confirmed(() => {
      G.gp_param = gp_univ_param();
      if (UNTRUNCATED()) set_variation(v0);
      else set_variation(eVariation.untruncated);
      start_game();
    });
    dialog_addBoolItem(XLAT('warped version'), WARPED(), chc('w'));
    dialog_add_action_confirmed(() => {
      G.gp_param = gp_univ_param();
      if (WARPED()) set_variation(v0);
      else set_variation(eVariation.warped);
      start_game();
    });
  }

  dialog_addBreak(100);
  dialog_addItem(XLAT('swap x and y'), chc('z'));
  dialog_add_action(() => { config = [config[1], config[0]]; });

  let have_dual = !bad_bi && !IRREGULAR() && !WARPED();
  if (S3() === 3 && UNTRUNC() && gp_loc_mod(gp_loc_mul(gp_univ_param(), [1, 1]), 3)) have_dual = false;
  if (S3() === 4 && UNRECTIFIED() && gp_loc_mod(gp_loc_mul(gp_univ_param(), [1, 1]), 2)) have_dual = false;

  if (have_dual) {
    dialog_addItem(XLAT('dual of current'), chc('D'));
    dialog_add_action(gp_dual_of_current);
  }

  if (GOLDBERG_INV()) add_edit(P('gp_su'));
  else dialog_addBreak(100);

  dialog_addBreak(100);
  dialog_addHelp();
  dialog_add_action(() => { gotoHelp(helptext()); });
  dialog_addBack();
  dialog_display();
}

export function gp_univ_param(): loc {
  if (GOLDBERG_INV()) return [G.gp_param[0], G.gp_param[1]];
  else if (PURE()) return [1, 0];
  else return [1, 1];
}

export function gp_configure(): void {
  const l = gp_univ_param();
  G.gp_param = [l[0], l[1]];
  config = gp_human_representation(l);
  pushScreen(gp_show);
}

export function gp_be_in_triangle(li: gp_local_info): void {
  let sp = 0;
  for (;;) {
    const corner = tmulh(gpd().corners_for_triangle, gp_loctoh_ort(li.relative));
    if (corner[1] < -1e-6 || corner[2] < -1e-6) {
      li.relative = gp_loc_mul(li.relative, gp_eudir(1));
      sp++;
      continue;
    }
    break;
  }
  if (sp > SG3()) sp -= SG6();
  li.last_dir = gmod(li.last_dir - sp, S7());
}

// from some point X, (0,0) is in distance dmain, param is in distance d0, and param*z is in distance d1
// what is the distance of at from X?

export function gp_solve_triangle(dmain: number, d0: number, d1: number, at: loc): number {
  let centerloc: loc = [0, 0];
  const rel = (d0 - dmain) + ',' + (d1 - dmain);
  const param = G.gp_param;
  if (center_locs.has(rel))
    centerloc = center_locs.get(rel)!;
  else {
    let found = false;
    for (let y = -20; y <= 20; y++)
      for (let x = -20; x <= 20; x++) {
        const c: loc = [x, y];
        const cc = gp_length(c);
        const c0 = gp_length(gp_loc_sub(c, param));
        const c1 = gp_length(gp_loc_sub(c, gp_loc_mul(param, [0, 1])));
        if (c0 - cc === d0 - dmain && c1 - cc === d1 - dmain) {
          found = true; centerloc = c;
        }
      }
    if (!found && !quotient()) {
      // println(hlog, "Warning: centerloc not found: ", make_tuple(dmain, d0, d1));
    }
    center_locs.set(rel, centerloc);
  }

  return dmain + gp_length(gp_loc_sub(centerloc, at)) - gp_length(centerloc);
}

function solve_quad(dmain: number, d0: number, d1: number, dx: number, at: loc): number {
  let centerloc: loc = [0, 0];
  const rel = (d0 - dmain) + ',' + ((d1 - dmain) + 1000 * (dx - dmain) + 1000000);
  const param = G.gp_param;
  if (center_locs.has(rel))
    centerloc = center_locs.get(rel)!;
  else {
    let found = false;
    for (let y = -20; y <= 20; y++)
      for (let x = -20; x <= 20; x++) {
        const c: loc = [x, y];
        const cc = gp_length(c);
        const c0 = gp_length(gp_loc_sub(c, param));
        const c1 = gp_length(gp_loc_sub(c, gp_loc_mul(param, [0, 1])));
        const c2 = gp_length(gp_loc_sub(c, gp_loc_mul(param, [1, 1])));
        if (c0 - cc === d0 - dmain && c1 - cc === d1 - dmain && c2 - cc === dx - dmain) {
          found = true; centerloc = c;
        }
      }
    if (!found && !quotient()) {
      // println(hlog, "Warning: centerloc not found: ", make_tuple(dmain, d0, d1, dx));
    }
    center_locs.set(rel, centerloc);
  }

  return dmain + gp_length(gp_loc_sub(centerloc, at)) - gp_length(centerloc);
}

export function gp_get_master_coordinates(c: cell): hyperpoint {
  const li = gp_get_local_info(c);
  gp_be_in_triangle(li);
  return tmulh(gpd().corners, gp_loctoh_ort(li.relative));
}

export function gp_compute_dist(c: cell, master_function: (c: cell) => number): number {
  if (!GOLDBERG()) return master_function(c);
  const li = gp_get_local_info(c);
  gp_be_in_triangle(li);

  const cm = c.master.c7;

  const i = li.last_dir;
  const at = li.relative;

  const dmain = master_function(cm);
  const d0 = master_function(createStep(cm.master, i).c7);
  const d1 = master_function(createStep(cm.master, cm.c.fix(i + 1)).c7);

  if (S3() === 4) {
    const hs = new heptspin(cm.master, i);
    hs.addStep(); hs.add(-1); hs.addStep();
    const d2 = master_function(hs.at.c7);
    return solve_quad(dmain, d0, d1, d2, at);
  }

  return gp_solve_triangle(dmain, d0, d1, at);
}

export function gp_dist_2(): number {
  return gp_length(gp_univ_param());
}
export function gp_dist_3(): number {
  return gp_length(gp_loc_mul(gp_univ_param(), [1, 1]));
}
export function gp_dist_1(): number { return gp_dist_3() - gp_dist_2(); }

export function gp_get_masters(c: cell): [heptagon, heptagon, heptagon] {
  if (false) { /* if(0) */ }
  // CAP_GP
  else if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return gp_in_underlying_geometry(() => gp_get_masters(c1));
  }
  else if (GOLDBERG()) {
    const li = gp_get_local_info(c);
    gp_be_in_triangle(li);
    const cm = c.master;
    const i = li.last_dir;
    return [cm, cm.cmove(i), cm.cmodmove(i + 1)];
  }
  // CAP_IRR
  else if (IRREGULAR())
    throw new NotPorted('gp::get_masters: irr::get_masters (irregular)');
  return [c.cmove(0).master, c.cmove(2).master, c.cmove(4).master];
}

/** EX string operation_name() (stage 3, package G1) */
export function gp_operation_name(): string {
  const param = G.gp_param;
  const is = (a: number, b: number): boolean => param[0] === a && param[1] === b;
  if (IRREGULAR())
    return XLAT('irregular');
  else if (DUAL())
    return XLAT('dual');
  else if (PURE())
    return XLAT('pure');
  else if (BITRUNCATED())
    return XLAT('bitruncated');
  // CAP_GP
  else if (GOLDBERG() && is(1, 0))
    return XLAT('pure');
  else if (GOLDBERG() && is(1, 1) && S3() === 3)
    return XLAT('bitruncated');
  else if (GOLDBERG() && is(1, 1) && S3() === 4)
    return XLAT('rectified');
  else if (UNRECTIFIED() && is(1, 1) && S3() === 4)
    return XLAT('dual');
  else if (UNTRUNCATED() && is(1, 1) && S3() === 3)
    return XLAT('dual');
  else if (GOLDBERG() && is(2, 0))
    return S3() === 3 ? XLAT('chamfered') : XLAT('expanded');
  else if (GOLDBERG() && is(3, 0) && S3() === 3)
    return XLAT('2x bitruncated');
  // MAXMDIM >= 4
  else if (G.variation === eVariation.subcubes || G.variation === eVariation.dual_subcubes || G.variation === eVariation.bch || G.variation === eVariation.coxeter)
    throw new NotPorted('gp::operation_name: 3D variations'); // STAGE3-STUB (the 3D package: reg3::subcube_count)
  else {
    const p = gp_human_representation(param);
    const s = 'GP(' + its(p[0]) + ',' + its(p[1]) + ')';
    if (UNRECTIFIED()) return XLAT('unrectified') + ' ' + s;
    if (WARPED()) return XLAT('warped') + ' ' + s;
    if (UNTRUNCATED()) return XLAT('untruncated') + ' ' + s;
    return s;
  }
}

// --- the inverse map ---

// EX hrmap *pmap: G.gp_pmap

function hrmap_base(): typeof hrmap_value { return hrmap_value; }

function make_hrmap_inverse() {
  const base = hrmap_base();
  class hrmap_inverse extends base {
    underlying_map: hrmap = null!;

    mapping = new Map<cell, cell>();
    shift = new Map<cell, number>();

    in_underlying<T>(t: () => T): T {
      const gpm = dynamicval(() => G.gp_pmap, (v) => { G.gp_pmap = v; }, this as unknown);
      const gva = dynamicval(() => G.variation, (v) => { G.variation = v; }, gp_variation_for(G.gp_param));
      const gu = dynamicval(() => G.currentmap, (v) => { G.currentmap = v; }, this.underlying_map as unknown as typeof G.currentmap);
      try { return t(); }
      finally { gu.restore(); gva.restore(); gpm.restore(); }
    }

    get_mapped(underlying_cell: cell, set_shift: number): cell {
      const m = this.mapping.get(underlying_cell);
      if (m !== undefined) return m;
      let d = underlying_cell.type;
      if (UNTRUNCATED()) d = Math.trunc(d / 2);
      if (WARPED() && set_shift < 2) d = Math.trunc(d / 2);
      const c = newCell(d, underlying_cell.master);
      this.mapping.set(underlying_cell, c);
      if (!UNRECTIFIED()) this.shift.set(c, set_shift);
      this.mapping.set(c, underlying_cell);
      return c;
    }

    protected override relative_matrixh(h2: heptagon, h1: heptagon, hint: hyperpoint): transmatrix {
      return this.in_underlying(() => (G.currentmap as hrmap).relative_matrix_h(h2, h1, hint));
    }

    protected override relative_matrixc(c2: cell, c1: cell, hint: hyperpoint): transmatrix {
      if (!this.mapping.has(c1)) { rate_limited_error('c1 is bad'); return Id; }
      if (!this.mapping.has(c2)) { rate_limited_error('c2 is bad'); return Id; }
      const u1 = this.mapping.get(c1)!;
      const u2 = this.mapping.get(c2)!;
      return this.in_underlying(() => (G.currentmap as hrmap).relative_matrix(u2, u1, hint));
    }

    /** ~hrmap_inverse() */
    override destroy(): void {
      this.in_underlying(() => { this.underlying_map.destroy(); });
    }

    override getOrigin(): heptagon { return this.in_underlying(() => this.underlying_map.getOrigin()); }

    gs: cell = null!;

    override gamestart(): cell {
      return this.gs;
    }

    constructor() {
      super();
      this.underlying_map = null!;
      // if(0) { ... underlying_cgip ... }
      const warped = WARPED();
      this.in_underlying(() => {
        initcells();
        this.underlying_map = G.currentmap as hrmap;
        this.gs = (G.currentmap as hrmap).gamestart();
        if (!warped) this.gs = this.gs.cmove(0);
      });
      if (UNTRUNCATED()) this.gs = this.get_mapped(this.gs, 1);
      else this.gs = this.get_mapped(this.gs, 2);
      for (let i = 0; i < G.allmaps.length; i++) if (G.allmaps[i] === this.underlying_map) G.allmaps[i] = null!;
    }

    create_move(parent: cell, d: number): cell {
      if (UNRECTIFIED()) {
        const cw = new cellwalker(this.mapping.get(parent) ?? null!, d);
        const b = cw.mirrored;
        this.in_underlying(() => {
          cw.addStep();
          cw.dec();
          cw.addStep();
          cw.dec();
          if (cw.mirrored !== b) cw.inc();
        });
        cw.at = this.get_mapped(cw.at, 0);
        parent.c.connect(d, cw.at, cw.spin, cw.mirrored);
        return cw.at;
      }
      if (UNTRUNCATED()) {
        const cw = new cellwalker(this.mapping.get(parent) ?? null!, 2 * d + this.shiftv(parent));
        this.in_underlying(() => {
          cw.addStep();
        });
        cw.at = this.get_mapped(cw.at, cw.spin & 1);
        parent.c.connect(d, cw.at, Math.trunc(cw.spin / 2), cw.mirrored);
        return cw.at;
      }
      if (WARPED()) {
        const sh = this.shiftv(parent);
        if (sh === 2) {
          const cw = new cellwalker(this.mapping.get(parent) ?? null!, d);
          this.in_underlying(() => { cw.addStep(); });
          cw.at = this.get_mapped(cw.at, cw.spin & 1);
          parent.c.connect(d, cw.at, Math.trunc(cw.spin / 2), cw.mirrored);
          return cw.at;
        }
        else {
          const cw = new cellwalker(this.mapping.get(parent) ?? null!, 2 * d + sh);
          this.in_underlying(() => {
            cw.addStep();
          });
          cw.at = this.get_mapped(cw.at, 2);
          parent.c.connect(d, cw.at, cw.spin, cw.mirrored);
          return cw.at;
        }
      }
      throw new hr_exception('unimplemented');
    }

    /** shift[c] (operator[]: an absent entry is created as 0) */
    shiftv(c: cell): number {
      const s = this.shift.get(c);
      if (s !== undefined) return s;
      this.shift.set(c, 0);
      return 0;
    }

    override adj(c: cell, d: number): transmatrix {
      let T: transmatrix = tnew();
      if (UNRECTIFIED()) {
        const cw = new cellwalker(this.mapping.get(c) ?? null!, d);
        this.in_underlying(() => {
          T = (G.currentmap as hrmap).adj(cw.at, cw.spin);
          cw.addStep();
          cw.dec();
          T = tmul(T, (G.currentmap as hrmap).adj(cw.at, cw.spin));
        });
      }
      if (UNTRUNCATED()) {
        const cw = new cellwalker(this.mapping.get(c) ?? null!, 2 * d + this.shiftv(c));
        this.in_underlying(() => { T = (G.currentmap as hrmap).adj(cw.at, cw.spin); });
      }
      if (WARPED()) {
        const sh = this.shiftv(c);
        if (sh === 2) {
          const c1 = this.mapping.get(c) ?? null!;
          this.in_underlying(() => { T = (G.currentmap as hrmap).adj(c1, d); });
        }
        else {
          const cw = new cellwalker(this.mapping.get(c) ?? null!, 2 * d + this.shiftv(c));
          this.in_underlying(() => { T = (G.currentmap as hrmap).adj(cw.at, cw.spin); });
        }
      }
      return T;
    }

    override draw_at(at: cell, where: shiftmatrix): void {

      dq_clear_all();

      const enqueue = (quotient() ? dq_enqueue_by_matrix_c : dq_enqueue_c);
      enqueue(at, where);

      while (G.dq_drawqueue_c.length) {
        const p = G.dq_drawqueue_c[0];
        const c = p[0];
        const V = p[1];
        const c1 = this.get_mapped(c, 0);

        this.in_underlying(() => {
          if (GOLDBERG()) {
            G.gp_current_li = gp_get_local_info(c1);
          }
          else {
            G.gp_current_li.relative = [(G.currentmap as hrmap).shvid(c1), this.shiftv(c)];
          }
        });

        G.dq_drawqueue_c.shift();

        if (!do_draw_T(c, V)) continue;
        drawcell(c, V);

        for (let i = 0; i < c.type; i++) if (c.cmove(i))
          enqueue(c.move(i), optimized_shift(smul(V, this.adj(c, i))));
      }
    }

    override find_cell_connection(c: cell, d: number): void {
      gp_inverse_move(c, d);
    }

    override shvid(c: cell): number {
      return get_plainshape_id(c);
    }

    override get_corner(c: cell, cid: number, cf = 3): hyperpoint {
      if (UNTRUNCATED()) {
        const c1 = gp_get_mapped(c);
        const cw = new cellwalker(c1, cid * 2);
        if (!gp_untruncated_shift(c)) cw.dec();
        const h = gp_in_underlying_geometry(() => nearcorner(c1, cw.spin));
        return mid_at_actual(h, 3 / cf);
      }
      if (UNRECTIFIED()) {
        const c1 = gp_get_mapped(c);
        const h = gp_in_underlying_geometry(() => nearcorner(c1, cid));
        return mid_at_actual(h, 3 / cf);
      }
      if (WARPED()) {
        const sh = gp_untruncated_shift(c);
        const c1 = gp_get_mapped(c);
        if (sh === 2) {
          const cw = new cellwalker(c, cid);
          const h1 = gp_in_underlying_geometry(() => tC0((G.currentmap as hrmap).adj(c1, cid)));
          cw.dec();
          const h2 = gp_in_underlying_geometry(() => tC0((G.currentmap as hrmap).adj(c1, cw.spin)));
          const h = mid(h1, h2);
          return mid_at_actual(h, 3 / cf);
        }
        else {
          const cw = new cellwalker(c1, cid * 2);
          if (!gp_untruncated_shift(c)) cw.dec();
          let h = gp_in_underlying_geometry(() => nearcorner(c1, cw.spin));
          h = mid(h, C0v());
          return mid_at_actual(h, 3 / cf);
        }
      }
      return C0v();
    }

    override pattern_value(c: cell): number {
      const c1 = this.get_mapped(c, 0);
      return gp_in_underlying_geometry(() => (G.currentmap as hrmap).pattern_value(c1));
    }
  }
  return hrmap_inverse;
}
function C0v(): hyperpoint { return MDIM() === 3 ? hcopy(C02) : hcopy(C03); }

let hrmap_inverse_class: ReturnType<typeof make_hrmap_inverse> | null = null;
function hrmap_inverse_cls(): ReturnType<typeof make_hrmap_inverse> { return hrmap_inverse_class ??= make_hrmap_inverse(); }
export type hrmap_inverse = InstanceType<ReturnType<typeof make_hrmap_inverse>>;

export function gp_new_inverse(): hrmap { return new (hrmap_inverse_cls())(); }

function inv_map(): hrmap_inverse {
  if (fake_in()) throw new NotPorted('gp::inv_map: fake (FPIU)');
  return G.currentmap as unknown as hrmap_inverse;
}

export function gp_inverse_pseudohept(c: cell): boolean {
  const m = inv_map().mapping;
  let c1 = m.get(c);
  if (c1 === undefined) { m.set(c, null!); c1 = null!; } // operator[]
  if (!c1) return false;
  return gp_in_underlying_geometry(() => pseudohept(c1));
}

export function gp_get_underlying_map(): hrmap { return inv_map().underlying_map; }
export function gp_get_mapped(c: cell): cell { return inv_map().get_mapped(c, 0); }
export function gp_untruncated_shift(c: cell): number { return inv_map().shiftv(c); }

/** delete_mapped(c): `if(!pmap) return;` */
export function gp_delete_mapped(c: cell): void {
  if (!G.gp_pmap) return;
  const i = G.gp_pmap as hrmap_inverse;
  const m = i.mapping.get(c);
  if (m !== undefined)
    destroy_cell(m);
  else if (i.mapping.has(c)) destroy_cell(m!);
}

export function gp_inverse_move(c: cell, d: number): cell { return inv_map().create_move(c, d); }

/** #define UIU(x) hr::gp::in_underlying_geometry([&] { return (x); }) */
export function gp_in_underlying_geometry<T>(f: () => T): T {
  if (!INVERSE()) return f();
  const gpm = dynamicval(() => G.gp_pmap, (v) => { G.gp_pmap = v; }, G.currentmap as unknown);
  const gva = dynamicval(() => G.variation, (v) => { G.variation = v; }, gp_variation_for(G.gp_param));
  const und = gp_get_underlying_map();
  const gu = dynamicval(() => G.currentmap, (v) => { G.currentmap = v; }, und as unknown as typeof G.currentmap);
  try { return f(); }
  finally { gu.restore(); gva.restore(); gpm.restore(); }
}

export function gp_get_pattern_value(c: cell): number {
  if (!c) return 0;
  if (G.gp_li_for !== c) {
    G.gp_li_for = c;
    G.gp_current_li = gp_get_local_info(c);
  }
  let data: number[] = [];
  const param = G.gp_param;
  const cur = G.gp_current_li;
  const S7v = S7();
  const v = gp_loc_mul(cur.relative, gp_loc_conj(param));
  if (cur.relative[0] === 0 && cur.relative[1] === 0) {
    data = [Math.trunc(c.master.fieldval / S7v)];
  }
  else if (v[1] === 0) {
    const v1 = gp_loc_mul(param, gp_loc_conj(param));
    const h1 = c.master.cmodmove(cur.last_dir);
    if (c.master.fieldval < h1.fieldval)
      data = [Math.trunc(c.master.fieldval / S7v), Math.trunc(h1.fieldval / S7v), v[0]];
    else
      data = [Math.trunc(h1.fieldval / S7v), Math.trunc(c.master.fieldval / S7v), v1[0] - v[0]];
  }
  else if (S3() === 3) {
    let h0 = c.master;
    let d = cur.last_dir;
    if (v[1] < 0) d--;
    let h1 = h0.cmodmove(d);
    let h2 = h0.cmodmove(d + 1);
    let t = cur.relative; if (v[1] < 0) t = gp_loc_mul([0, 1], t);
    while (h1.fieldval > h0.fieldval || h2.fieldval > h0.fieldval) {
      [h0, h1, h2] = [h1, h2, h0];
      t = gp_loc_add(gp_loc_mul(t, [0, -1]), gp_loc_mul(param, [0, 1]));
    }
    data = [Math.trunc(h0.fieldval / S7v), Math.trunc(h1.fieldval / S7v), t[0], t[1]];
  }
  else {
    let h0 = c.master;
    let d = cur.last_dir;
    if (v[1] < 0) d--; d = gmod(d, h0.type);
    let h1 = h0.cmodmove(d);
    let h3 = h0.cmodmove(d + 1);
    let h2 = new heptspin(h0, d).addStep().add(-1).addStep().at;
    let t = cur.relative; if (v[1] < 0) t = gp_loc_mul([0, 1], t);
    while (h1.fieldval > h0.fieldval || h2.fieldval > h0.fieldval || h3.fieldval > h0.fieldval) {
      [h0, h1, h2, h3] = [h1, h2, h3, h0];
      t = gp_loc_add(gp_loc_mul(t, [0, -1]), gp_loc_mul(param, [0, 1]));
    }
    data = [Math.trunc(h0.fieldval / S7v), Math.trunc(h1.fieldval / S7v), t[0], t[1]];
  }
  // if(ldebug) println(hlog, c, " = ", data);
  const fd = gpd().field_data;
  const key = data.join(',');
  let res = fd.get(key);
  if (res === undefined) { fd.set(key, 0); res = 0; }
  if (res === 0) { res = fd.size; fd.set(key, res); }
  return res;
}

/** the static initializers of goldberg.cpp: hooksw = addHook(hooks_swapdim, 100, ...) */
export function register_goldberg(): void {
  G.hooks_swapdim.add(100, () => {
    for (const m of gp_gp_adj.values()) for (const _p of m.values()) throw new NotPorted('gp: swapmatrix (an embedded plane)');
  });
}

void tcopy;
