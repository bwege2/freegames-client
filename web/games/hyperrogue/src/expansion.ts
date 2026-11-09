// expansion.cpp of HyperRogue 13.1o: the expansion analyzer (types of cells by their children, the numbers of
// descendants, the growth rate), the tree helpers ts::*, hyperbolic_celldistance. The "size of the world"
// screens and the distance display (viewdist dialogs, celldrawer::do_viewdist) are UI, a later stage.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names: namespace ts -> ts_left_of, ts_right_of, ...; cellfunction = (c: cell) => number.
// map<vector<int>, int> codeid is a Map keyed by the vector joined with ','.
import { G } from './globals.ts';
import { type cell, cellwalker, celllister } from './locations.ts';
import { among, INF, INFD, NotPorted } from './hyper.ts';
import { bignum } from './util.ts';
import { SDL_GetTicks } from './util.ts';
import { its, fts } from './hprint.ts';
import { XLAT } from './language.ts';
import { closed_manifold, aperiodic, INVERSE, BITRUNCATED, a4, a45, S7, IRREGULAR, eubinary } from './classes.ts';
import { bt_in } from './binary-tiling.ts';
import { arcm_in } from './archimedean.ts';
import { arb_in } from './arbitrile.ts';
import { reg3_exact_rules, reg3_in } from './reg3.ts';
import { gp_univ_param } from './goldberg.ts';
import { celldist, celldistAlt, celldistance, valence, createMov, BARLEV, type hrmap } from './cell.ts';
import { patterns_getpatterninfo, patterns_PAT_NONE } from './pattern2.ts';
import { cgi } from './geometry.ts';
import { isCyclic, inmirror, isEquidLand } from './flags.ts';
import { lsHorodisks, lsVoronoi } from './landlock.ts';
import { setdist } from './landgen.ts';
import { laOcean, laIvoryTower, laEndorian, laDungeon, laTemple, laWhirlpool, laCanvas, laCaribbean, laStorms, laRlyeh } from './content.ts';

export type cellfunction = (c: cell) => number;

/** #define UNKNOWN 65535 (hyper.h) */
const UNKNOWN = 65535;

function subtype(c: cell): number {
  return patterns_getpatterninfo(c, patterns_PAT_NONE, 0).id;
}

/** std::rotate(t.begin()+1, t.begin()+i, t.end()) */
function rotate_from1(t: number[], i: number): void {
  const moved = t.splice(1, i - 1);
  t.push(...moved);
}

function canonicize(t: number[]): void {
  for (let i = 2; i < t.length; i++)
    if ((t[i] & 3) === 1 && (t[i - 1] & 3) !== 1)
      rotate_from1(t, i);
}

/** vector<int> < vector<int> (lexicographic) */
function vec_cmp(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return a.length - b.length;
}

function vec_eq(a: number[], b: number[]): boolean { return vec_cmp(a, b) === 0; }

/** the digits of a bignum's approx_ll() as an exact 64-bit value */
function approx_ll_big(b: bignum): bigint {
  if (b.digits.length > 2) return BigInt(bignum.BASE) * BigInt(bignum.BASE);
  if (b.digits.length === 0) return 0n;
  if (b.digits.length === 1) return BigInt(b.digits[0]);
  return BigInt(b.digits[0]) + BigInt(b.digits[1]) * BigInt(bignum.BASE);
}

export class expansion_analyzer {
  sibling_limit = 0;
  N = 0;
  samples: cell[] = [];
  codeid = new Map<string, number>();
  children: number[][] = [];
  rootid = 0;
  diskid = 0;
  coefficients_known = 0;
  /** vector<int> coef (CAP_GMP is 0 in the desktop build) */
  coef: number[] = [];
  valid_from = 0;
  tested_to = 0;
  growth = 0;
  descendants: bignum[][] = [];

  constructor() { this.reset(); }

  gettype(c: cell): number[] {
    const res: number[] = [];
    res.push(subtype(c) * 4 + 2);
    const d = celldist(c);
    for (let i = 0; i < c.type; i++) {
      const c1 = c.cmove(i);
      let bonus = 0;
      if (bt_in()) bonus += 16 * (celldistAlt(c1) - celldistAlt(c));
      res.push(bonus + subtype(c1) * 4 + celldist(c1) - d);
    }
    canonicize(res);
    return res;
  }

  sample_id(c: cell): number {
    const t = this.gettype(c).join(',');
    const got = this.codeid.get(t);
    if (got !== undefined) return got;
    const cit = this.samples.length;
    this.codeid.set(t, cit);
    this.samples.push(c);
    return cit;
  }

  preliminary_grouping(): void {
    this.samples.length = 0;
    this.codeid.clear();
    this.children.length = 0;
    if ((G.currentmap as hrmap).strict_tree_rules()) {
      throw new NotPorted('expansion_analyzer::preliminary_grouping: rulegen::treestates');
    }
    // #if MAXMDIM >= 4
    else if (reg3_exact_rules()) {
      throw new NotPorted('expansion_analyzer::preliminary_grouping: reg3 rules');
    }
    else {
      this.sample_id((G.currentmap as hrmap).gamestart());
      // queue for, do not change to range-based for
      for (let i = 0; i < this.samples.length; i++)
        this.children.push(get_children_codes(this.samples[i], celldist, (c) => this.sample_id(c)));
      this.N = this.samples.length;
      this.rootid = 0;
    }
    this.diskid = this.N;
    this.children.push([...this.children[this.rootid]]);
    this.children[this.diskid].push(this.diskid);
    this.N++;
  }

  reduce_grouping(): void {
    // #if MAXMDIM >= 4
    if (reg3_exact_rules()) return;
    if ((G.currentmap as hrmap).strict_tree_rules()) return;
    const old_N = this.N;
    const N = this.N;
    const grouping: number[] = new Array(N).fill(0);
    let nogroups = 1;
    for (let i = 0; i < N; i++) grouping[i] = 0;
    while (true) {
      const childgroups: [number[], number][] = [];
      for (let i = 0; i < N; i++) {
        const v: number[] = [];
        for (const j of this.children[i])
          v.push(grouping[j]);
        childgroups.push([v, i]);
        // sort(childgroups[i].first.begin(), childgroups[i].first.end());
      }
      // the pairs are distinct (second), so the order is total and any sort gives std::sort's result
      childgroups.sort((a, b) => vec_cmp(a[0], b[0]) || a[1] - b[1]);
      let newgroups = 0;
      for (let i = 0; i < N; i++) {
        if (i === 0 || !vec_eq(childgroups[i][0], childgroups[i - 1][0])) newgroups++;
        grouping[childgroups[i][1]] = newgroups - 1;
      }
      if (nogroups === newgroups) break;
      nogroups = newgroups;
    }

    const groupsample: number[] = new Array(nogroups).fill(-1);
    for (let i = 0; i < N; i++) {
      if (groupsample[grouping[i]] === -1) groupsample[grouping[i]] = i;
    }

    const reorder: number[] = [];
    for (let i = 0; i < nogroups; i++) reorder[i] = i;
    reorder.sort((i, j) => groupsample[i] - groupsample[j]);

    const inv_reorder: number[] = new Array(nogroups).fill(0);
    for (let i = 0; i < nogroups; i++) inv_reorder[reorder[i]] = i;

    for (let i = 0; i < N; i++) grouping[i] = inv_reorder[grouping[i]];

    for (let i = 0; i < N; i++) groupsample[grouping[i]] = i;

    const newchildren: number[][] = [];
    for (let i = 0; i < nogroups; i++) {
      newchildren.push([]);
      for (const j of this.children[groupsample[i]])
        newchildren[i].push(grouping[j]);
    }
    this.children = newchildren;
    for (const [k, v] of this.codeid) this.codeid.set(k, grouping[v]);
    this.N = nogroups;
    this.rootid = grouping[this.rootid];
    this.diskid = grouping[this.diskid];
    for (let g = 0; g < old_N; g++) if (grouping[g] !== g) this.descendants.length = 0;
  }

  /** get_descendants(level) / get_descendants(level, type): the returned bignum is the stored one (C++ returns
   *  a reference) */
  get_descendants(level: number, type?: number): bignum {
    if (!this.N) { this.preliminary_grouping(); this.reduce_grouping(); }
    if (type === undefined) return this.get_descendants(level, this.rootid);
    const pd = this.descendants;
    size_upto(pd, level + 1, () => []);
    for (let d = 0; d <= level; d++)
      for (let i = size_upto(pd[d], this.N, () => new bignum()); i < this.N; i++)
        if (d === 0) pd[d][i].be(1);
        else for (const j of this.children[i])
          pd[d][i].add(pd[d - 1][j]);
    return pd[level][type];
  }

  private verify(id: number): boolean {
    if (id < this.coef.length) return false;
    // long long res: 64-bit arithmetic, exact here with bigint
    let res = 0n;
    for (let t = 0; t < this.coef.length; t++)
      res = BigInt.asIntN(64, res + BigInt(this.coef[t]) * approx_ll_big(this.get_descendants(id - t - 1)));
    return res === approx_ll_big(this.get_descendants(id));
  }

  private valid(v: number, step: number): number {
    if (step < 0) return 0;
    // #if MAXMDIM >= 4
    const more = 5;
    // #if CAP_GMP == 0
    if (this.get_descendants(step + v + v + more).approx_int() >= bignum.BASE) return 0;
    const unit = 1;
    const matrix: number[][] = [];
    for (let i = 0; i < v; i++) {
      matrix.push([]);
      for (let j = 0; j < v + 1; j++)
        matrix[i][j] = Number(approx_ll_big(this.get_descendants(step + i + j)));
    }

    for (let k = 0; k < v; k++) {
      let nextrow = k;
      while (nextrow < v && Math.abs(matrix[nextrow][k]) < 1e-6)
        nextrow++;
      if (nextrow === v) return 1;
      if (nextrow !== k) {
        // printf("swap %d %d\n", k, nextrow);
        for (let l = 0; l <= v; l++) { const t = matrix[k][l]; matrix[k][l] = matrix[nextrow][l]; matrix[nextrow][l] = t; }
        // display();
      }
      const divv = unit / matrix[k][k];
      for (let k1 = k; k1 <= v; k1++) matrix[k][k1] *= divv;
      // printf("divide %d\n", k);
      for (let k1 = k + 1; k1 < v; k1++) if (matrix[k1][k] !== 0) {
        const coef = -matrix[k1][k];
        for (let k2 = k; k2 <= v; k2++) matrix[k1][k2] += matrix[k][k2] * coef;
      }
      // printf("zeros below %d\n", k);
    }

    for (let k = v - 1; k >= 0; k--)
      for (let l = k - 1; l >= 0; l--)
        if (matrix[l][k]) matrix[l][v] -= matrix[l][k] * matrix[k][v];

    this.coef.length = v;
    for (let i = 0; i < v; i++) this.coef[i] = Math.trunc(Math.floor(matrix[v - 1 - i][v] + .5)) | 0;

    for (let t = step + v; t < step + v + v + more; t++) if (!this.verify(t)) return 2;
    this.tested_to = step + v + v + more;
    const BASE2 = BigInt(bignum.BASE) * BigInt(bignum.BASE);
    while (this.tested_to < step + v + v + 100) {
      // #if !CAP_GMP
      if (approx_ll_big(this.get_descendants(this.tested_to)) >= BASE2) break;
      if (!this.verify(this.tested_to)) return 2;
      this.tested_to++;
    }

    this.valid_from = step + v;
    return 3;
  }

  find_coefficients(): void {
    if (this.coefficients_known) return;
    if (!this.N) { this.preliminary_grouping(); this.reduce_grouping(); }
    for (let v = 1; v < 25; v++)
      for (let step = 0; step < 3 * v; step++) {
        const val = this.valid(v, step);
        if (val === 0) break;
        if (val === 3) { this.coefficients_known = 2; return; }
      }
    this.coefficients_known = 1;
  }

  get_growth(): number {
    if (this.growth >= 1) return this.growth;
    if (!this.N) { this.preliminary_grouping(); this.reduce_grouping(); }
    const eigen: number[] = new Array(this.N).fill(1);
    let total = 0;

    for (let iter = 0; iter < 100000; iter++) {
      total = 0;
      const neweigen: number[] = new Array(this.N).fill(0);
      for (let i = 0; i < this.N; i++) {
        for (const j of this.children[i]) neweigen[i] += eigen[j];
        total += neweigen[i];
      }
      for (let i = 0; i < this.N; i++) eigen[i] = .1 * eigen[i] + .9 * neweigen[i] / total;
    }
    return this.growth = total;
  }

  reset(): void {
    this.N = 0;
    this.growth = 0;
    this.coefficients_known = 0;
    this.samples.length = 0;
    this.codeid.clear();
    this.children.length = 0;
    this.coef.length = 0;
    this.descendants.length = 0;
  }

  approximate_descendants(d: number, max_length: number): string {
    const t = SDL_GetTicks();
    while (this.descendants.length <= d && SDL_GetTicks() < t + 100)
      this.get_descendants(this.descendants.length);
    if (this.descendants.length > d)
      return this.get_descendants(d).get_str(max_length);
    const v = this.descendants.length - 1;
    const b = this.get_descendants(v);
    if (b.digits.length === 0) return '0';
    const log_10 = Math.log(b.digits[b.digits.length - 1]) / Math.log(10) + 9 * (b.digits.length - 1) + (d - v) * Math.log(this.get_growth()) / Math.log(10);
    const more_digits = Math.trunc(log_10);
    return XLAT('about ') + fts(Math.pow(10, log_10 - more_digits)) + 'E' + its(more_digits);
  }

  /** view_distances_dialog: UI (a later stage) */
  view_distances_dialog(): void { throw new NotPorted('expansion_analyzer::view_distances_dialog'); }
}

function get_children_codes(c: cell, distfun: cellfunction, typefun: (c: cell) => number): number[] {
  const res: number[] = [];
  const d = distfun(c);
  const cw = new cellwalker(c, 0);
  if (d > 0) {
    for (let i = 0; i < c.type; i++) { createMov(c, i); if (celldist(cw.peek()) < d) break; else cw.inc(); }
  }
  for (let k = 0; k < c.type; k++) {
    const c1 = cw.cpeek();
    cw.inc();
    if (distfun(c1) !== d + 1) continue;
    const c2 = cw.cpeek();
    if (distfun(c2) !== d + 1) continue;
    res.push(typefun(c1));
  }
  return res;
}

/** size_upto(v, s): the old size; grows v to s (new elements value-initialized by mk) */
function size_upto<T>(v: T[], s: number, mk: () => T): number {
  const res = v.length;
  while (v.length < s) v.push(mk());
  return res;
}

// ld growth: the file-scope `ld growth;` of expansion.cpp is unused (the member is used)

export function type_in(ea: expansion_analyzer, c: cell, f: cellfunction): number {
  if (!ea.N) { ea.preliminary_grouping(); ea.reduce_grouping(); }
  const res: number[] = [];
  res.push(subtype(c) * 4 + 2);
  const d = f(c);
  for (let i = 0; i < c.type; i++) {
    const c1 = c.cmove(i);
    let bonus = 0;
    if (bt_in()) bonus += 16 * (celldistAlt(c1) - celldistAlt(c));
    res.push(bonus + subtype(c1) * 4 + f(c1) - d);
  }

  canonicize(res);
  const key = res.join(',');
  const got = ea.codeid.get(key);
  if (got !== undefined) return got;
  const ret = ea.N++;
  ea.codeid.set(key, ret);

  ea.children.push([]);
  const ch = get_children_codes(c, f, (c1) => type_in(ea, c1, f));
  ea.children[ret] = ch;

  return ret;
}

export function type_in_quick(ea: expansion_analyzer, c: cell, f: cellfunction): number {
  const res: number[] = [];
  res.push(subtype(c) * 4 + 2);
  const d = f(c);
  for (let i = 0; i < c.type; i++) {
    const c1 = c.cmove(i);
    const dd = f(c1) - d;
    if (dd < -1 || dd > 1) return -1;
    res.push(subtype(c1) * 4 + dd);
  }

  canonicize(res);
  const got = ea.codeid.get(res.join(','));
  if (got !== undefined) return got;
  return -1;
}

export function sizes_known(): boolean {
  // #if MAXMDIM >= 4
  if (reg3_exact_rules()) return true;
  if (reg3_in()) return false;
  if (closed_manifold()) return false;
  // Castle Anthrax is infinite
  if (bt_in()) return false;
  // not implemented
  if (arcm_in()) return false;
  if (aperiodic()) return false;
  if ((G.currentmap as hrmap).strict_tree_rules()) return true;
  if (arb_in()) return false;
  if (INVERSE()) return false;
  return true;
}

export function trees_known(): boolean {
  return sizes_known() && !(BITRUNCATED() && a4() && S7() <= 5);
}

/** enum eDistanceFrom */
export const dfPlayer = 0, dfStart = 1, dfWorld = 2;
/** enum eNumberCoding */
export const ncNone = 0, ncDistance = 1, ncType = 2, ncDebug = 3, ncError = 4;
// dfnames, distance_from, ncnames, number_coding: G

export function mod_allowed(): boolean {
  return !!G.cheater || G.autocheat || arcm_in() || arb_in() || G.tour_on;
}

export function distances_legal(c: cell): boolean {
  if (mod_allowed()) return true;
  switch (G.distance_from) {
    case dfPlayer:
      return true;
    case dfStart:
      return bt_in();
    case dfWorld:
      return !!c && among(c.land, laOcean, laIvoryTower, laEndorian, laDungeon, laTemple, laWhirlpool, laCanvas);
  }
  return false;
}

export function curr_dist(c: cell): number {
  if (!distances_legal(c)) return 0;
  switch (G.distance_from) {
    case dfPlayer:
      return c.cpdist < INFD ? c.cpdist : celldistance(G.cwt.at, c);
    case dfStart:
      return celldist(c);
    case dfWorld:
      if ((isCyclic(c.land) || among(c.land, laCanvas, laCaribbean, laStorms, laRlyeh) || among(G.land_structure, lsHorodisks, lsVoronoi))) {
        if (eubinary() || c.master.alt) return celldistAlt(c);
        return UNKNOWN;
      }
      return inmirror(c) ? (c.landparam & 255) : isEquidLand(c) ? c.landparam : UNKNOWN;
  }
  return 0;
}

export function type_in_reduced(ea: expansion_analyzer, c: cell, f: cellfunction): number {
  const a = ea.N;
  let t = type_in(ea, c, f);
  const expansion = get_expansion();
  if (expansion.N !== a) {
    expansion.reduce_grouping();
    t = type_in(ea, c, f);
  }
  return t;
}

// which=1 => right, which=-1 => left

export function parent_id(c: cell, which: number, cf: cellfunction): number {
  const d = cf(c) - 1;
  for (let i = 0; i < c.type; i++) {

    if (cf(c.cmove(i)) === d) {
      let steps = 0;
      while (true) { // again:
        if (!which || steps === c.type) return i;
        const i2 = c.c.fix(i + which);
        if (cf(c.cmove(i2)) === d) {
          i = i2; steps++; continue;
        }
        else return i;
      }
    }
  }

  return -1;
}

// set which=1,bonus=1 to get right neighbor on level

export function generate_around(c: cell): void {
  for (let i = 0; i < c.type; i++) { const c2 = createMov(c, i); if (c2.mpdist > BARLEV()) setdist(c2, BARLEV(), c); }
}

export function ts_verified_add(c: cell, which: number, bonus: number, cf: cellfunction): cell {
  const id = parent_id(c, which, cf);
  if (id === -1) return null!;
  return c.cmodmove(id + bonus);
}

export function ts_verified_add_gen(c: cell, which: number, bonus: number, cf: cellfunction): cell {
  return ts_verified_add(c, which, bonus, cf);
}

export function ts_add(c: cell, which: number, bonus: number, cf: cellfunction): cell {
  let pid = parent_id(c, which, cf);
  if (pid === -1) pid = 0;
  return c.cmodmove(pid + bonus);
}

export function ts_left_of(c: cell, cf: cellfunction): cell {
  const pid = parent_id(c, 1, cf);
  if (pid === -1) return c;
  if (valence() === 3) return c.cmodmove(pid + 1);
  else return new cellwalker(c, pid).plusStep().add(-1).cpeek();
}

export function ts_right_of(c: cell, cf: cellfunction): cell {
  const pid = parent_id(c, -1, cf);
  if (pid === -1) return c;
  if (valence() === 3) return c.cmodmove(pid - 1);
  else return new cellwalker(c, pid).plusStep().add(1).cpeek();
}

export function ts_child_number(c: cell, id: number, cf: cellfunction): cell {
  const pid = parent_id(c, 1, cf);
  if (pid === -1) return c.cmove(id);
  return c.cmodmove(pid + (valence() === 3 ? 2 : 1) + id);
}

export function ts_get_child(c: cell, cf: cellfunction, v: number): cell {
  for (let i = 0; i < c.type; i++) if (cf(c.cmodmove(i + v)) <= cf(c) && cf(c.cmodmove(i)) > cf(c))
    return c.cmodmove(i);
  return null!;
}

export function ts_right_child(c: cell, cf: cellfunction): cell { return ts_get_child(c, cf, -1); }
export function ts_left_child(c: cell, cf: cellfunction): cell { return ts_get_child(c, cf, 1); }

export function ts_left_parent(c: cell, cf: cellfunction): cell { return ts_verified_add(c, 1, 0, cf); }
export function ts_right_parent(c: cell, cf: cellfunction): cell { return ts_verified_add(c, -1, 0, cf); }

// viewdists, use_color_codes, use_analyzer, show_distance_lists, expcolors, dist_label_colored,
// dist_label_color, auto_extend, use_sight_range_instead, count_max_cells, count_max_dist: G
// distribute_color, celldrawer::do_viewdist, viewdist_configure_dialog, is_descendant, produce_coef_formula,
// configure_counter, view_distances_dialog, enable_viewdists, expansion_handleKey, compute_coefficients,
// expansion_readArgs: drawing, menus and command line options of the "size of the world" screens (a later stage)

export function viewdist_configure_dialog(): void { throw new NotPorted('viewdist_configure_dialog'); }
export function enable_viewdists(): void { throw new NotPorted('enable_viewdists'); }

export function get_expansion(): expansion_analyzer {
  const g = cgi();
  if (!g.expansion) g.expansion = new expansion_analyzer();
  return g.expansion;
}

export function set_sibling_limit(): void {
  const ea = get_expansion();
  if (0) { /* empty */ }
  // #if CAP_IRR
  else if (IRREGULAR()) ea.sibling_limit = 3;
  // #if CAP_BT
  else if (bt_in()) ea.sibling_limit = 3;
  // #if CAP_GP
  else {
    const p = gp_univ_param();
    ea.sibling_limit = 2 * p[0] + p[1];
  }
}

function celldist0(c: cell): number {
  if (bt_in()) return celldistAlt(c);
  else return celldist(c);
}

function in_segment(left: cell, mid: cell, right: cell): boolean {
  while (true) {
    if (mid === left) return true;
    if (left === right) return false;
    left = ts_right_of(left, celldist0);
  }
}

function sibling_distance(a: cell, b: cell, limit: number): number {
  let counting = 0;
  while (true) {
    if (a === b) return counting;
    if (limit === 0) return INF;
    counting++; limit--;
    a = ts_right_of(a, celldist0);
  }
}

/** An algorithm for computing distance between two cells.
    This algorithm runs correctly in O(d) assuming that:
    - distances from the origin are known
    - the set of cells in distance d from the origin forms a cycle
    - the map is Gromov hyperbolic (with sibling_limit computed correctly) and planar
    - all vertices have valence <= 4
    - each vertex has at most two parents
    */
export function hyperbolic_celldistance(c1: cell, c2: cell): number {
  let found_distance = INF;

  let d = 0, d1 = celldist0(c1), d2 = celldist0(c2), sl_used = 0;
  const ea = get_expansion();

  let cl1 = c1, cr1 = c1, cl2 = c2, cr2 = c2;
  while (true) {

    if (a45() && BITRUNCATED()) {
      // some cells in this tiling have three parents,
      // making the usual algorithm fail
      if (d2 === d1 + 1) {
        [d1, d2] = [d2, d1]; [cl1, cl2] = [cl2, cl1]; [c1, c2] = [c2, c1]; [cr1, cr2] = [cr2, cr1];
      }
      const ccl1 = cl1, ccr1 = cr1, cd = d;
      const short_distances = (c: cell): void => {
        const cl = new celllister(c, 4, 1000, ccl1);
        try {
          if (cl.listed(ccl1)) found_distance = Math.min(found_distance, cd + cl.getdist(ccl1));
          if (cl.listed(ccr1)) found_distance = Math.min(found_distance, cd + cl.getdist(ccr1));
        }
        finally { cl.destroy(); }
      };

      if (d1 <= d2 + 1) {
        short_distances(cl2);
        if (cl2 !== cr2) short_distances(cr2);
      }
    }

    if (d >= found_distance) {
      if (sl_used === ea.sibling_limit && IRREGULAR()) {
        // printf("sibling_limit used: %d\n", sibling_limit);
        ea.sibling_limit++;
      }
      return found_distance;
    }

    if (d1 === d2) {
      if (cl1 === c1 && in_segment(cl2, c1, cr2)) return d;
      if (cl2 === c2 && in_segment(cl1, c2, cr1)) return d;
      if (valence() === 3) {
        const dx = Math.min(sibling_distance(cr1, cl2, ea.sibling_limit), sibling_distance(cr2, cl1, ea.sibling_limit));
        if (d + dx <= found_distance) {
          found_distance = d + dx;
          sl_used = dx;
        }
      }
      else {
        if (cl1 === cr2 || cr1 === cl2) found_distance = d;
      }
    }

    if (d >= found_distance) {
      if (sl_used === ea.sibling_limit && IRREGULAR()) {
        // printf("sibling_limit used: %d\n", sibling_limit);
        ea.sibling_limit++;
      }
      return found_distance;
    }

    if (d1 >= d2) {
      cl1 = ts_left_parent(cl1, celldist0);
      cr1 = ts_right_parent(cr1, celldist0);
      d++; d1--;
    }
    if (d1 < d2) {
      cl2 = ts_left_parent(cl2, celldist0);
      cr2 = ts_right_parent(cr2, celldist0);
      d++; d2--;
    }
  }
}
