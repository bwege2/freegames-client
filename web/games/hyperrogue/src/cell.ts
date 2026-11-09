// cell.cpp of HyperRogue 13.1o: maps (hrmap, hrmap_standard, hrmap_hyperbolic), cell creation, celldist,
// the cdata landscape, cell distances, reverse_directions, getDistLimit.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names (PORTING.md, "Overloads"): heptdistance(c1, c2) / heptdistance_h(h1, h2); reverse_directions(c, d) /
// reverse_directions_h(h, d); hrmap methods: adj(c, i) / adj_h(h, i), iadj / iadj_h, adjmod / adjmod_h,
// iadjmod / iadjmod_h, relative_matrix(c2, c1, hint) / relative_matrix_h(h2, h1, hint).
// Virtual methods of hrmap / hrmap_standard defined in other files (bigstuff.cpp: extend_altmap; geometry2.cpp:
// adj, relative_matrixh/c, master_relative, spin_angle, spacedist, get_corner, virtualRebase; floorshapes.cpp:
// shvid; graph-wall.cpp: wall_offset) throw NotPorted here: their package
// assigns them in its register function (`hrmap_standard.prototype.adj = function (c, i) { ... }`).
// hypgraph.cpp's draw_all / draw_at call hrmap_draw_all, hrmap_draw_at, hrmap_standard_draw_at of hypgraph.ts.
// The methods of hrmap_standard / hrmap_hyperbolic defined in geometry2.cpp call the functions
// hrmap_standard_<name>(this, ...) of geometry2.ts (P1b).
import { hrmap_draw_all, hrmap_draw_at, hrmap_standard_draw_at } from './hypgraph.ts';
import { G } from './globals.ts';
import {
  cell, heptagon, cdata, heptspin, cellwalker, celllister, manual_celllister, late, add_cellcount, hsOrigin,
  type hstate,
} from './locations.ts';
import { hr_exception, NotPorted, DISTANCE_UNKNOWN, among } from './hyper.ts';
import { hrand, hrandpos } from './rand.ts';
import { gmod } from './util.ts';
import { its } from './hprint.ts';
import {
  S7, S3, S6, PURE, BITRUNCATED, GOLDBERG, IRREGULAR, INVERSE, WARPED, GOLDBERG_INV, NONSTDVAR, WDIM, embedded_plane,
  sphere, euclid, hyperbolic, quotient, closed_manifold, mhybrid, nonisotropic, nil, sl2, cryst, experimental,
  aperiodic, cgflags, qHUGE_BOUNDED, qPORTALSPACE, OINF, SEE_ALL, ginf, gBinaryTiling, gSierpinski3, gSierpinski4,
  gSixFlake, gMengerSponge, gSierpinskiTet, gEuclid, gEuclidSquare, gNormal, gOctagon, g45, g46, g47, gFieldQuotient,
  gArnoldCat, gBinary3, gHoroTris, gHoroRec, gKiteDart3, gHoroHex, gCell5, gBitrunc3, gCell8, gECell8, gCell120,
  gECell120, a46, NOWALLSEP, NOWALLSEP_SWAP,
} from './classes.ts';
import { laCamelot, laCaves, laLivefjord, laEmerald, laVariant, type eLand } from './content.ts';
import { bt_in, bt_new_map, bt_updir, bt_mapside, bt_celldistance3 } from './binary-tiling.ts';
import { arcm_in, arcm_new_map, arcm_valence, arcm_cdata_of, arcm_get_cdata } from './archimedean.ts';
import { arb_in, arb_new_map, arb_current } from './arbitrile.ts';
import { rulegen_known, rulegen_new_hrmap_rulegen, rulegen_new_hrmap_rulegen_alt } from './rulegen.ts';
import { kite_in, kite_new_map } from './kite.ts';
import { hat_in, hat_new_map } from './aperiodic-hat.ts';
import { fake_in, fake_new_map, fake_in_underlying_geometry } from './fake.ts';
import { new_spherical_map } from './sphere.ts';
import { quotientspace_new_map } from './quotient.ts';
import { crystal_new_map, crystal_dist_alt, crystal_space_distance, crystal_precise_distance, crystal_build_shortest_path } from './crystal.ts';
import { asonov_in, asonov_new_map, asonov_get_at, asonov_get_coord } from './asonov.ts';
import { reg3_in, reg3_new_map, reg3_new_alt_map, reg3_in_hrmap_rule_or_subrule, reg3_altdist, reg3_celldistance } from './reg3.ts';
import {
  euc_in, euc_new_map, euc_full_coords2, euc_get_at, euc_to_coord, euc_get_ispacemap, euc_get_cdata, euc_cyldist,
  euc2_coordinates, euc_celldistance, euc_dist_alt, type loc, type coord,
} from './euclid.ts';
import {
  hybrid_will_link, hybrid_link, hybrid_celldistance, hybrid_get_where, hybrid_in_underlying_geometry,
  hybrid_altmap_height, hybrid_csteps, in_s2xe, nisot_new_map, sn_in, sn_approx_distance,
} from './nonisotropic.ts';
import {
  gp_get_masters, gp_get_mapped, gp_compute_dist, gp_in_underlying_geometry, gp_delete_mapped, gp_extend_map,
  gp_new_inverse, gp_get_pattern_value, gp_gp_adj, gp_gp_swapped, gp_univ_param,
} from './goldberg.ts';
import { irr_link_start, irr_link_cell, irr_clear_links, irr_celldist, irr_compute_scale } from './irregular.ts';
import { geom3_in_flipped } from './embeddings.ts';
import { intra_erase_all_maps } from './intra.ts';
import { inforder_new_map, inforder_celldistance } from './inforder.ts';
import { destroycellcontents } from './savemem.ts';
import { initcell } from './mapeffects.ts';
import { windmap_create } from './complex.ts';
import { ls_voronoi_structure, ls_single } from './landlock.ts';
import { fieldpattern_getcurrfp, fieldpattern_btspin, fieldpattern_field_celldistance } from './fieldpattern.ts';
import { zebra40, emeraldval, polara50, polarb50, fiftyval049, towerval, ctof } from './pattern2.ts';
import { cgi } from './geometry.ts';
import { init_heptagon, createStep, hrmap_standard_create_step } from './heptagon.ts';
import { hyperbolic_celldistance } from './expansion.ts';
import { isWall } from './flags.ts';
import { type transmatrix, type hyperpoint, type shiftmatrix, Id, C0, tC0, tmul, cspin, to_other_side, rspintox, xpush, hdist0 } from './hyperpoint.ts';
import { spin, lspintox, lrspintox } from './embeddings.ts';
import {
  hrmap_spacedist, hrmap_standard_relative_matrixh, hrmap_standard_relative_matrixc, hrmap_standard_adj,
  hrmap_standard_adj_h, hrmap_standard_spin_angle, hrmap_standard_spacedist, hrmap_standard_get_corner,
  hrmap_standard_master_relative, hrmap_hyperbolic_virtualRebase, calc_relative_matrix, virtualRebase,
} from './geometry2.ts';

// debugflag debug_map_warnings, debug_map_errors, debug_map_details, debug_map_numerical, debug_map_create,
// debug_init_cells, debug_memory_cell: debug output, left out (PORTING.md, "Macros")

export const PATTERN_INVALID = -1;

/** altmap::relspin(alt) (bigstuff.cpp's HDR inline): h->move(relspin(h->alt)) corresponds to h->alt->move(0) */
function altmap_relspin(alt: heptagon): number {
  return quotient() ? (G.altmap_quotient_relspins.get(alt) ?? 0) : alt.zebraval;
}
function altmap_set_relspin(alt: heptagon, v: number): void {
  if (quotient()) G.altmap_quotient_relspins.set(alt, (v << 16) >> 16);
  else alt.zebraval = v;
}

const notp = (what: string): never => { throw new NotPorted(what); };

export class hrmap {
  getOrigin(): heptagon { return null!; }
  gamestart(): cell { return this.getOrigin().c7; }
  /** virtual ~hrmap(): `delete map` -> map.destroy() */
  destroy(): void { }
  allcells(): cell[] {
    if (G.disksize) return G.all_disk_cells;
    if (closed_manifold() && !((cgflags() & qHUGE_BOUNDED) !== 0n) && !(mhybrid() && hybrid_csteps() === 0)) {
      const cl = new celllister(this.gamestart(), 1000000, 1000000, null);
      default_allcells = [...cl.lst];
      cl.destroy();
      return default_allcells;
    }
    if (G.dcal.length <= 1) {
      const cl = new celllister(G.cwt.at, 1, 1000, null);
      default_allcells = [...cl.lst];
      cl.destroy();
      return default_allcells;
    }
    return G.dcal;
  }
  verify(): void { }
  link_alt(_h: heptagon, _alt: heptagon, _firststate: hstate, _dir: number): boolean {
    return true;
  }
  /** extend_altmap(h, levs = default_levs(), link_cdata = true): bigstuff.cpp (P4 assigns it; levs undefined
   *  means default_levs()) */
  extend_altmap(_h: heptagon, _levs?: number, _link_cdata = true): void { notp('hrmap::extend_altmap (bigstuff.cpp)'); }
  may_create_step(h: heptagon, direction: number): heptagon {
    if (h.move(direction)) return h.move(direction);
    return this.create_step(h, direction);
  }
  create_step(_h: heptagon, _direction: number): heptagon {
    throw new hr_exception('create_step called unexpectedly');
  }
  /** reinitialize the map after swapping dimensions */
  reinit(): void { }
  protected relative_matrixh(_h2: heptagon, _h1: heptagon, _hint: hyperpoint): transmatrix {
    // println(hlog, "relative_matrixh called unexpectedly\n");
    return Id;
  }
  protected relative_matrixc(c2: cell, c1: cell, hint: hyperpoint): transmatrix {
    return this.relative_matrixh(c2.master, c1.master, hint);
  }
  relative_matrix_h(h2: heptagon, h1: heptagon, hint: hyperpoint): transmatrix { return this.relative_matrixh(h2, h1, hint); }
  relative_matrix(h2: cell, h1: cell, hint: hyperpoint): transmatrix { return this.relative_matrixc(h2, h1, hint); }

  adj(c: cell, i: number): transmatrix { return this.adj_h(c.master, i); }
  /** return relative_matrix(h->cmove(i), h, C0): P1b */
  adj_h(h: heptagon, i: number): transmatrix { return this.relative_matrix_h(h.cmove(i), h, C0()); }
  iadj(c: cell, i: number): transmatrix { const c1 = c.cmove(i); return this.adj(c1, c.c.spin(i)); }
  iadj_h(h: heptagon, d: number): transmatrix {
    const h1 = h.cmove(d); return this.adj_h(h1, h.c.spin(d));
  }
  /** hypgraph.cpp (stage 2, D1) */
  draw_all(): void { hrmap_draw_all(this); }
  draw_at(at: cell, where: shiftmatrix): void { hrmap_draw_at(this, at, where); }

  virtualRebase(_base: { v: heptagon }, _at: { v: transmatrix }): void {
    // printf("virtualRebase called unexpectedly\n");
    return;
  }

  static readonly SPIN_NOT_AVAILABLE = 1e5;
  spin_angle(_c: cell, _d: number): number { return hrmap.SPIN_NOT_AVAILABLE; }

  spin_to(c: cell, d: number, bonus = 0): transmatrix {
    const sa = this.spin_angle(c, d);
    if (sa !== hrmap.SPIN_NOT_AVAILABLE) { return spin(bonus + sa); }
    const T = lrspintox(tC0(this.adj(c, d)));
    if (WDIM() === 3) return tmul(T, cspin(2, 0, bonus));
    return tmul(T, spin(bonus));
  }
  spin_from(c: cell, d: number, bonus = 0): transmatrix {
    const sa = this.spin_angle(c, d);
    if (sa !== hrmap.SPIN_NOT_AVAILABLE) { return spin(bonus - sa); }
    const T = lspintox(tC0(this.adj(c, d)));
    if (WDIM() === 3) return tmul(T, cspin(2, 0, bonus));
    return tmul(T, spin(bonus));
  }

  spacedist(c: cell, i: number): number { return hrmap_spacedist(this, c, i); }

  strict_tree_rules(): boolean { return false; }

  find_cell_connection(c: cell, d: number): void {
    const h2 = createStep(c.master, d);
    c.c.connect(d, h2.c7, c.master.c.spin(d), c.master.c.mirror(d));
    hybrid_link();
  }
  shvid(_c: cell): number { return 0; }
  full_shvid(c: cell): number { return this.shvid(c); }
  get_corner(_c: cell, _cid: number, _cf = 3): hyperpoint { return C0(); }
  master_relative(_c: cell, _get_inverse = false): transmatrix { return Id; }
  wall_offset(_c: cell): number { return notp('hrmap::wall_offset (graph-wall.cpp)'); }

  ray_iadj(c: cell, i: number): transmatrix {
    if (WDIM() === 2) {
      return to_other_side(this.get_corner(c, i), this.get_corner(c, (i + 1)));
    }
    return (G.currentmap as hrmap).iadj(c, i);
  }

  get_cellshape(_c: cell): unknown {
    // if(cgi.heptshape) return *cgi.heptshape;
    throw new hr_exception('get_cellshape called unexpectedly');
  }

  /** in 3D honeycombs, returns a cellwalker res at cw->move(j) such that the face pointed at by cw and res share an edge */
  strafe(_cw: cellwalker, _j: number): cellwalker {
    throw new hr_exception('strafe called unexpectedly');
  }

  /** the sequence of heptagon movement direction to get from c->master to c->move(i)->master; implemented only for reg3 */
  get_move_seq(_c: cell, _i: number): number[] {
    throw new hr_exception('get_move_seq not implemented for this map class');
  }

  /** generate a new map that is disconnected from what we already have, disconnected from the map we have so far */
  gen_extra_origin(_fv: number): cell { throw new hr_exception('gen_extra_origin not supported on this map'); }

  adjmod(c: cell, i: number): transmatrix { return this.adj(c, gmod(i, c.type)); }
  adjmod_h(h: heptagon, i: number): transmatrix { return this.adj_h(h, gmod(i, h.type)); }
  iadjmod(c: cell, i: number): transmatrix { return this.iadj(c, gmod(i, c.type)); }
  iadjmod_h(h: heptagon, i: number): transmatrix { return this.iadj_h(h, gmod(i, h.type)); }

  /** this takes a large closed manifold M that is a quotient of this, and returns a unique identifier of the cell corresponding to M
   *  returns PATTERN_INVALID if not implemented or impossible */
  pattern_value(_c: cell): number { return PATTERN_INVALID; }

  get_backmap(): unknown { return null; }
}

/** static vector<cell*> default_allcells (in hrmap::allcells) */
let default_allcells: cell[] = [];

/** hrmaps which are based on regular non-Euclidean 2D tilings, possibly quotient.
 *  Operators can be applied to these maps. */
export class hrmap_standard extends hrmap {
  override draw_at(at: cell, where: shiftmatrix): void { hrmap_standard_draw_at(this, at, where); }
  protected override relative_matrixh(h2: heptagon, h1: heptagon, hint: hyperpoint): transmatrix { return hrmap_standard_relative_matrixh(this, h2, h1, hint); }
  protected override relative_matrixc(c2: cell, c1: cell, hint: hyperpoint): transmatrix { return hrmap_standard_relative_matrixc(this, c2, c1, hint); }
  override create_step(h: heptagon, direction: number): heptagon { return hrmap_standard_create_step(this, h, direction); }
  override adj(c: cell, d: number): transmatrix { return hrmap_standard_adj(this, c, d); }
  override adj_h(h: heptagon, d: number): transmatrix { return hrmap_standard_adj_h(this, h, d); }
  override spin_angle(c: cell, d: number): number { return hrmap_standard_spin_angle(this, c, d); }
  override spacedist(c: cell, i: number): number { return hrmap_standard_spacedist(this, c, i); }
  override find_cell_connection(c: cell, d: number): void {
    if (IRREGULAR()) {
      irr_link_cell(c, d);
    }
    // #if CAP_GP
    else if (GOLDBERG()) {
      gp_extend_map(c, d);
      if (!c.move(d)) {
        // println(hlog, "extend failed to create for ", cellwalker(c, d)); exit(1);
        throw new hr_exception('extend failed to create');
      }
      hybrid_link();
    }
    else if (PURE()) {
      super.find_cell_connection(c, d);
    }
    else if (c === c.master.c7) {

      const n = newCell(S6(), c.master);

      let hs = new heptspin(c.master, d, false);

      const alt3 = c.type >> 1;
      const alt4 = alt3 + 1;

      for (let u = 0; u < S6(); u += 2) {
        if (hs.mirrored && (S7() % 2 === 0)) hs.inc();
        hs.at.c7.c.connect(hs.spin, n, u, hs.mirrored);
        if (hs.mirrored && (S7() % 2 === 0)) hs.dec();
        hs = hs.plus(alt3).addStep().add(-alt4);
      }
      hybrid_link();
      verifycell(n);
    }

    else {
      const cw = new cellwalker(c, d, false);
      const cw2 = cw.minus(1).addStep().add(-1).addStep().add(-1);
      c.c.connectw(d, cw2);
      hybrid_link();
    }
  }
  override shvid(_c: cell): number { return notp('hrmap_standard::shvid (floorshapes.cpp)'); }
  override get_corner(c: cell, cid: number, cf = 3): hyperpoint { return hrmap_standard_get_corner(this, c, cid, cf); }
  override master_relative(c: cell, get_inverse = false): transmatrix { return hrmap_standard_master_relative(this, c, get_inverse); }
  override link_alt(_h: heptagon, alt: heptagon, _firststate: hstate, _dir: number): boolean {
    altmap_set_relspin(alt, 3);
    return true;
  }
  /** dim_listener::on_dim_change */
  on_dim_change(): void {
    for (const _p of gp_gp_swapped) notp('swapmatrix(gp::gp_adj[p]) (an embedded plane)');
    gp_gp_swapped.clear();
  }
  override pattern_value(c: cell): number {
    if (fieldpattern_getcurrfp() === G.fieldpattern_fp_invalid) return 0;
    if (NONSTDVAR()) return gp_get_pattern_value(c);
    if (ctof(c)) return Math.trunc(c.master.fieldval / S7());
    let z = 0;
    for (let u = 0; u < S6(); u += 2)
      z = Math.max(z, fieldpattern_btspin(createMov(c, u).master.fieldval, c.c.spin(u)));
    return -1 - z;
  }
}

export class hrmap_hyperbolic extends hrmap_standard {
  origin: heptagon;
  /** hrmap_hyperbolic() / hrmap_hyperbolic(heptagon *origin) */
  constructor(o?: heptagon) {
    super();
    this.origin = o ?? hyperbolic_origin();
  }
  override getOrigin(): heptagon { return this.origin; }
  override destroy(): void {
    // verifycells(origin);
    // printf("Deleting hyperbolic map: %p\n", hr::voidp(this));
    clearfrom(this.origin);
  }
  override verify(): void { verifycells(this.origin); }
  override virtualRebase(base: { v: heptagon }, at: { v: transmatrix }): void { hrmap_hyperbolic_virtualRebase(this, base, at); }
}

export function dirdiff(dd: number, t: number): number {
  dd %= t;
  if (dd < 0) dd += t;
  if (t - dd < dd) dd = t - dd;
  return dd;
}

// int cellcount: G.cellcount (and locations.ts's copy)

export function destroy_cell(_c: cell): void {
  // while(c->contents) c->contents->unlist_and_unref(); (shmup monsters: none in stage 1)
  // tailored_delete(c);
  G.cellcount--;
  add_cellcount(-1);
}

/** tailored_alloc<cell>(type): every field 0 (the oracle zero-fills), then type, master and initcell */
export function newCell(type: number, master: heptagon): cell {
  const c = new cell(type, master);
  c.type = type;
  c.master = master;
  initcell(c);
  hybrid_will_link(c);
  G.cellcount++;
  add_cellcount(1);
  return c;
}

// -- hrmap ---

// hrmap *currentmap, vector<hrmap*> allmaps: G.currentmap, G.allmaps

export function newAltMap(o: heptagon): hrmap {
  // #if MAXMDIM >= 4
  if (reg3_in_hrmap_rule_or_subrule())
    return reg3_new_alt_map(o);
  if ((G.currentmap as hrmap).strict_tree_rules())
    return rulegen_new_hrmap_rulegen_alt(o);
  return new hrmap_hyperbolic(o);
}
// --- hyperbolic geometry ---

export function hyperbolic_origin(): heptagon {
  const odegree = G.geometry === gBinaryTiling ? 6 : S7();
  const origin = init_heptagon(odegree);
  const h = origin;
  h.s = hsOrigin;
  h.emeraldval = a46() ? 0 : 98;
  h.zebraval = 40;
  // #if CAP_IRR
  if (IRREGULAR()) irr_link_start(origin);
  else
    h.c7 = newCell(odegree, origin);
  return origin;
}

/** very similar to createMove in heptagon.cpp */
export function createMov(c: cell, d: number): cell {
  if (d < 0 || d >= c.type)
    throw new hr_exception('ERROR createmov\n');
  if (c.move(d)) return c.move(d);
  (G.currentmap as hrmap).find_cell_connection(c, d);
  return c.move(d);
}

export function eumerge(c1: cell, s1: number, c2: cell, s2: number, mirror: boolean): void {
  if (!c2) return;
  c1.setMove(s1, c2); c1.c.setspin(s1, s2, mirror);
  c2.setMove(s2, c1); c2.c.setspin(s2, s1, mirror);
}

//  map<pair<eucoord, eucoord>, cell*> euclidean;

// hookset<hrmap*()> hooks_newmap: G.hooks_newmap

/** enum eDiskShape */
export const dshTiles = 0, dshVertices = 1, dshGeometric = 2;
export type eDiskShape = number;

// req_disksize, disksize, all_disk_cells, all_disk_cells_sorted, diskshape: G

export function init_disk_cells(): void {
  G.disksize = G.req_disksize;
  G.all_disk_cells.length = 0;
  G.all_disk_cells_sorted.length = 0;
  if (!G.disksize) return;
  if (G.diskshape === dshTiles) {
    const cl = new celllister((G.currentmap as hrmap).gamestart(), 1000000, G.disksize, null);
    G.all_disk_cells = [...cl.lst];
    cl.destroy();
  }
  else {
    // struct tileinfo { ld dist; cell *c; transmatrix T; bool operator < (t2) { return -dist < -t2.dist - 1e-6; } };
    interface tileinfo { dist: number; c: cell; T: transmatrix; }
    const less = (a: tileinfo, b: tileinfo): boolean => -a.dist < -b.dist - 1e-6;
    const seen = new Set<cell>();
    // std::priority_queue<tileinfo> tiles: a binary heap as libstdc++ keeps it (push_heap / pop_heap), so that
    // tiles of equal distance come out in the same order
    const tiles: tileinfo[] = [];
    pq_push(tiles, { dist: 0, c: (G.currentmap as hrmap).gamestart(), T: Id }, less);
    let last_dist = 0;
    const dmar = G.mine_adjacency_rule;
    G.mine_adjacency_rule = 1;
    try {
      while (tiles.length) {
        const ti = pq_pop(tiles, less);
        // println(hlog, "dist=", ti.dist, " for c=", ti.c, " T = ", kz(ti.T), " vs ", ok);
        if (seen.has(ti.c)) continue;
        seen.add(ti.c);
        if (ti.dist > last_dist + 1e-6 && G.all_disk_cells.length >= G.disksize) break;
        last_dist = ti.dist;
        G.all_disk_cells.push(ti.c);
        for (const p of [...adj_minefield_cells_full(ti.c)]) {
          const next: tileinfo = { dist: 0, c: p.c, T: tmul(ti.T, p.T) };
          if (G.diskshape === dshVertices) next.dist = ti.dist + 1;
          else next.dist = hdist0(tC0(next.T));
          // println(hlog, ti.c, " -> ", p.c, " at ", next.dist, " got T= ", kz(p.T));
          pq_push(tiles, next, less);
        }
      }
    } finally { G.mine_adjacency_rule = dmar; }
  }
  G.all_disk_cells_sorted = [...G.all_disk_cells];
  // sort by address: the creation serial (PORTING.md, "Pointer order")
  G.all_disk_cells_sorted.sort((a, b) => a._id - b._id);
}

// std::priority_queue (libstdc++): push = push_back + __push_heap, pop = __pop_heap (+ __adjust_heap) + pop_back
function pq_push_heap<T>(a: T[], hole: number, top: number, value: T, less: (x: T, y: T) => boolean): void {
  let parent = Math.floor((hole - 1) / 2);
  while (hole > top && less(a[parent], value)) {
    a[hole] = a[parent];
    hole = parent;
    parent = Math.floor((hole - 1) / 2);
  }
  a[hole] = value;
}
function pq_push<T>(a: T[], x: T, less: (x: T, y: T) => boolean): void {
  a.push(x);
  pq_push_heap(a, a.length - 1, 0, x, less);
}
function pq_pop<T>(a: T[], less: (x: T, y: T) => boolean): T {
  const top = a[0];
  const len = a.length;
  if (len > 1) {
    const value = a[len - 1];
    a[len - 1] = a[0];
    // __adjust_heap(first, 0, len - 1, value)
    const n = len - 1;
    let hole = 0, second = 0;
    while (second < Math.floor((n - 1) / 2)) {
      second = 2 * (second + 1);
      if (less(a[second], a[second - 1])) second--;
      a[hole] = a[second];
      hole = second;
    }
    if ((n & 1) === 0 && second === Math.floor((n - 2) / 2)) {
      second = 2 * (second + 1);
      a[hole] = a[second - 1];
      hole = second - 1;
    }
    pq_push_heap(a, hole, 0, value, less);
  }
  a.pop();
  return top;
}

/** lower_bound in all_disk_cells_sorted */
function disk_lower_bound(c: cell): number {
  const v = G.all_disk_cells_sorted;
  let lo = 0, hi = v.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (v[mid]._id < c._id) lo = mid + 1; else hi = mid;
  }
  return lo;
}

export function is_in_disk(c: cell): boolean {
  const it = disk_lower_bound(c);
  if (it === G.all_disk_cells_sorted.length) return false;
  return G.all_disk_cells_sorted[it] === c;
}

export function disk_index(c: cell): number {
  const it = disk_lower_bound(c);
  if (it === G.all_disk_cells_sorted.length || G.all_disk_cells_sorted[it] !== c) return G.all_disk_cells_sorted.length;
  return it;
}

function sierpinski3(g: loc): boolean {
  let x = g[0];
  let y = g[1];
  const visited = new Set<string>();
  while (true) {
    if (visited.has(x + ',' + y)) return false;
    visited.add(x + ',' + y);
    // if(x == -1 && y == -2) return false;
    // if(x == -2 && y == -3) return false;
    if (x === 0 && y === 0) return true;
    if ((x & 1) === 1 && (y & 1) === 1) return false;
    x >>= 1;
    y >>= 1;
    // x--; y++;
    [x, y] = [-x - y, x];
  }
}

function sierpinski46(g: loc): boolean {
  let x = g[0];
  let y = g[1];
  const visited = new Set<string>();
  if (S7() === 6) {
    x += 2785684; y += 289080;
  }
  else {
    x += 75239892; y += 7913772;
  }
  while (true) {
    if (visited.has(x + ',' + y)) return false;
    visited.add(x + ',' + y);
    if (x === 0 && y === 0) return true;
    const dx = gmod(x, 3);
    const dy = gmod(y, 3);
    if (dx === 1 && dy === 1) return false;
    if (S7() === 6 && dx === dy) return false;
    x = Math.trunc((x - dx) / 3);
    y = Math.trunc((y - dy) / 3);
  }
}

function menger_sponge(c: coord): boolean {
  c = [c[0] + 528120 * 9, c[1] + 438924 * 9, c[2] + 306712 * 9];
  const visited = new Set<string>();
  while (true) {
    if (visited.has(c.join(','))) return false;
    visited.add(c.join(','));
    if (c[0] === 0 && c[1] === 0 && c[2] === 0) return true;
    let ones = 0;
    for (let i = 0; i < 3; i++) {
      const d = gmod(c[i], 3);
      c[i] = Math.trunc((c[i] - d) / 3);
      if (d === 1) ones++;
    }
    if (ones >= 2) return false;
  }
}

function sierpinski_tet(c: coord): boolean {
  const visited = new Set<string>();
  c = [...c] as coord;
  c[0] += 16 * (1 + 8 + 64 + 512);
  c[1] += 16 * (1 + 8 + 64 + 512);
  c[1] += 32 * (1 + 8 + 64 + 512);
  c[2] += 32 * (1 + 8 + 64 + 512);
  c[0] += 64 * (1 + 8 + 64 + 512);
  c[1] += 64 * (1 + 8 + 64 + 512);
  while (true) {
    if (visited.has(c.join(','))) return false;
    visited.add(c.join(','));
    if (c[0] === 0 && c[1] === 0 && c[2] === 0) return true;
    let ones = 0;
    for (let i = 0; i < 3; i++) {
      const d = gmod(c[i], 2);
      c[i] = Math.trunc((c[i] - d) / 2);
      if (d === 1) ones++;
    }
    if (ones & 1) return false;
  }
}

export function is_in_fractal(c: cell): boolean {
  if (fake_in()) return fake_in_underlying_geometry(() => is_in_fractal(c));
  if (mhybrid()) { c = hybrid_get_where(c)[0]; return hybrid_in_underlying_geometry(() => is_in_fractal(c)); }
  switch (G.geometry) {
    case gSierpinski3:
      return sierpinski3(euc_full_coords2(c));
    case gSierpinski4:
    case gSixFlake:
      return sierpinski46(euc_full_coords2(c));
    case gMengerSponge:
      return menger_sponge(euc_get_ispacemap(c.master));
    case gSierpinskiTet: {
      return sierpinski_tet(euc_get_ispacemap(c.master));
    }
    default:
      return true;
  }
}

export function fractal_rep(c: cell): cell {
  switch (G.geometry) {
    case gSierpinski3: {
      const co = euc_full_coords2(c);
      co[0] += 4;
      co[0] &= ~15;
      co[0] -= 4;
      co[1] += 2;
      co[1] &= ~15;
      co[1] -= 2;
      if (co[0] === -4 && co[1] === -2) { co[0] = 0; co[1] = 0; }
      return euc_get_at(euc_to_coord(co)).c7;
    }
    case gSierpinski4:
    case gSixFlake: {
      const co = euc_full_coords2(c);
      if (S7() === 6) co[0] += 4;
      co[0] -= gmod(co[0], 9);
      co[1] -= gmod(co[1], 9);
      return euc_get_at(euc_to_coord(co)).c7;
    }
    case gSierpinskiTet: {
      const co = [...euc_get_ispacemap(c.master)] as coord;
      co[0] &= ~7;
      co[1] &= ~7;
      co[2] &= ~7;
      return euc_get_at(co).c7;
    }
    case gMengerSponge: {
      const co = [...euc_get_ispacemap(c.master)] as coord;
      for (let i = 0; i < 3; i++) co[i] = co[i] - gmod(co[i], 9);
      return euc_get_at(co).c7;
    }
    default:
      throw new hr_exception('unknown fractal');
  }
}

/** create a map in the current geometry */
export function initcells(): void {
  // indenter_finish dif(debug_init_cells, "initcells");

  if (embedded_plane()) {
    // geom3::swap_direction = -1; check_cgi(); swapmatrix(cgi.heptmove); IPF(initcells()); ...
    geom3_in_flipped(() => initcells());
    notp('initcells: embedded plane');
    return;
  }

  const res = G.hooks_newmap.callhandlers(null as hrmap | null);
  if (res) G.currentmap = res;
  // #if CAP_SOLV
  else if (asonov_in()) G.currentmap = asonov_new_map();
  else if (nonisotropic() || mhybrid()) G.currentmap = nisot_new_map();
  else if (INVERSE()) G.currentmap = gp_new_inverse();
  else if (fake_in()) G.currentmap = fake_new_map();
  // #if CAP_CRYSTAL
  else if (cryst()) G.currentmap = crystal_new_map();
  else if (arb_in() && rulegen_known()) G.currentmap = rulegen_new_hrmap_rulegen();
  else if (arb_in()) G.currentmap = arb_new_map();
  // #if CAP_ARCM
  else if (arcm_in()) G.currentmap = arcm_new_map();
  else if (euc_in()) G.currentmap = euc_new_map();
  else if (hat_in()) G.currentmap = hat_new_map();
  // #if CAP_BT
  else if (kite_in()) G.currentmap = kite_new_map();
  // #if MAXMDIM >= 4
  else if (WDIM() === 3 && !bt_in()) G.currentmap = reg3_new_map();
  else if (sphere()) G.currentmap = new_spherical_map();
  else if (quotient()) G.currentmap = quotientspace_new_map();
  // #if CAP_BT
  else if (bt_in()) G.currentmap = bt_new_map();
  else if (S3() >= OINF) G.currentmap = inforder_new_map();
  else G.currentmap = new hrmap_hyperbolic();

  G.allmaps.push(G.currentmap);

  // #if CAP_FIELD
  windmap_create();

  // origin->emeraldval =
}

export function clearcell(c: cell): void {
  if (!c) return;
  // indenter_finish(debug_memory_cell, ...)
  for (let t = 0; t < c.type; t++) if (c.move(t)) {
    // if(debug_memory_cell) println(...)
    if (c.move(t).move(c.c.spin(t)) !== null &&
      c.move(t).move(c.c.spin(t)) !== c) {
      // if(debug_errors || debug_memory_cell) println(hlog, "cell error: ...")
      if (G.worst_precision_error < 1e-3)
        throw new hr_exception('clearcell');
    }
    c.move(t).setMove(c.c.spin(t), null);
  }
  // if(debug_memory_cell) println(...)
  gp_delete_mapped(c);
  destroy_cell(c);
}

// heptagon deletion_marker: G.deletion_marker

function subcell(c: cell, t: (c: cell) => void): void {
  if (GOLDBERG()) {
    for (let i = 0; i < c.type; i++) {
      const c2 = c.move(i); if (!c2) continue;
      if (c2.move(0) === c && c2 !== c2.master.c7) {
        subcell(c2, t);
      }
    }
  }
  else if (BITRUNCATED() && !arcm_in() && !bt_in())
    for (let i = 0; i < c.type; i++) { const c2 = c.move(i); if (!c2) continue; t(c2); }
  t(c);
}

export function clearHexes(at: heptagon): void {
  if (at.c7 && at.cdata) {
    // delete at->cdata;
    at.cdata = null;
  }
  if (0) { /* empty */ }
  // #if CAP_IRR
  else if (IRREGULAR()) irr_clear_links(at);
  else if (at.c7) subcell(at.c7, clearcell);
}

/** for alternate structures, h->alt->cdata holds the original heptagon (the port's cdata_orig) */
function unlink_cdata(h: heptagon): void {
  if (h.alt && h.c7) {
    if (h.alt.cdata_orig === h)
      h.alt.cdata_orig = null;
  }
}

export function clear_heptagon(at: heptagon): void {
  clearHexes(at);
  // tailored_delete(at);
}

export function clearfrom(at: heptagon): void {
  if (!at) return;
  const q: heptagon[] = [];
  let qi = 0;
  unlink_cdata(at);
  q.push(at);
  at.alt = G.deletion_marker;
  //int maxq = 0;
  while (qi < q.length) {
    at = q[qi++];
    //  if(q.size() > maxq) maxq = q.size();
    // if(debug_memory_cell) println(hlog, "from %p", at);
    if (!at.c7 && !ls_voronoi_structure()) {
      const h = at.cdata_orig;
      if (h) {
        // if(h->alt != at && (debug_memory_cell || debug_errors)) println(hlog, "alt error :: ...");
        const c = h.c7;
        subcell(c, destroycellcontents);
        h.alt = null!;
        at.cdata_orig = null;
      }
    }
    let edges = at.degree();
    if (bt_in() && WDIM() === 2) edges = at.c7.type;
    for (let i = 0; i < edges; i++) if (at.move(i) && at.move(i) !== at) {
      if (at.move(i).alt !== G.deletion_marker)
        q.push(at.move(i));
      unlink_cdata(at.move(i));
      at.move(i).alt = G.deletion_marker;
      // if(debug_memory_cell) println(hlog, "!mov ", ...);
      if (at.move(i).move(at.c.spin(i)) !== null &&
        at.move(i).move(at.c.spin(i)) !== at)
        throw new hr_exception('hept error');
      at.move(i).setMove(at.c.spin(i), null);
      at.setMove(i, null);
    }
    clearHexes(at);
    // tailored_delete(at);
  }
  //printf("maxq = %d\n", maxq);
}

export function verifycell(c: cell): void {
  const t = c.type;
  for (let i = 0; i < t; i++) {
    const c2 = c.move(i);
    if (c2) {
      if (BITRUNCATED() && c === c.master.c7) verifycell(c2);
      if (c2.move(c.c.spin(i)) && c2.move(c.c.spin(i)) !== c) {
        // printf("cell error %p:%d [%d] %p:%d [%d]\n", ...)
        throw new hr_exception('error during verifycell');
      }
    }
  }
}

export function verifycells(at: heptagon): void {
  if (GOLDBERG() || IRREGULAR() || arcm_in()) return;
  for (let i = 0; i < at.type; i++) if (at.move(i) && at.move(i).move(at.c.spin(i)) && at.move(i).move(at.c.spin(i)) !== at) {
    // printf("hexmix error %p [%d s=%d] %p %p\n", ...)
  }
  if (!sphere() && !quotient())
    for (let i = 0; i < S7(); i++) if (at.move(i) && at.c.spin(i) === 0 && at.s !== hsOrigin)
      verifycells(at.move(i));
  verifycell(at.c7);
}

export function compdist(dx: number[]): number {
  let mi = dx[0];
  for (let u = 0; u < S3(); u++) mi = Math.min(mi, dx[u]);
  for (let u = 0; u < S3(); u++)
    if (dx[u] > mi + 2)
      return -1; // { printf("cycle error!\n"); exit(1); }
  for (let u = 0; u < S3(); u++)
    if (dx[u] === mi + 2)
      return mi + 1;
  let cnt = 0;
  for (let u = 0; u < S3(); u++)
    if (dx[u] === mi) cnt++;
  if (cnt < 2)
    return mi + 1;
  return mi;
}

export function celldist(c: cell): number {
  if (experimental()) return 0;
  if (mhybrid())
    return hybrid_celldistance(c, (G.currentmap as hrmap).gamestart());
  if (nil() && !quotient()) return DISTANCE_UNKNOWN;
  if (hat_in()) return clueless_celldistance((G.currentmap as hrmap).gamestart(), c);
  if (euc_in()) return celldistance((G.currentmap as hrmap).gamestart(), c);
  if (sphere() || bt_in() || WDIM() === 3 || cryst() || sn_in() || aperiodic() || closed_manifold()) return celldistance((G.currentmap as hrmap).gamestart(), c);
  // #if CAP_IRR
  if (IRREGULAR()) return irr_celldist(c, false);
  if (arcm_in() || ctof(c) || arb_in()) return c.master.distance;
  // #if CAP_GP
  if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return Math.trunc(gp_in_underlying_geometry(() => gp_compute_dist(c1, celldist)) / 2);
    /* TODO */
  }
  if (GOLDBERG()) return gp_compute_dist(c, celldist);
  const dx: number[] = [];
  for (let u = 0; u < S3(); u++)
    dx[u] = createMov(c, u + u).master.distance;
  return compdist(dx);
}

export const ALTDIST_BOUNDARY = 99999;
export const ALTDIST_UNKNOWN = 99998;
export const ALTDIST_ERROR = 90000;

export function celldistAlt(c: cell): number {
  if (experimental()) return 0;
  if (mhybrid()) {
    if (in_s2xe()) return hybrid_get_where(c)[1];
    const w = hybrid_get_where(c);
    let d = c.master.alt && c.master.alt.alt ? hybrid_altmap_height(c.master.alt.alt) : 0;
    d = sl2() ? 0 : Math.abs(w[1] - d);
    d += hybrid_in_underlying_geometry(() => celldistAlt(w[0]));
    return d;
  }
  // #if CAP_BT
  if (bt_in() || sn_in()) return c.master.distance + (G.specialland === laCamelot && !ls_single() ? 30 : 0);
  if (nil()) return c.master.zebraval + Math.abs(c.master.emeraldval) + (G.specialland === laCamelot && !ls_single() ? 30 : 0);
  // #if CAP_CRYSTAL
  if (cryst())
    return crystal_dist_alt(c);
  if (sphere() || quotient()) {
    return celldist(c) - 3;
  }
  // #if MAXMDIM >= 4
  if (euc_in()) return euc_dist_alt(c);
  if (hyperbolic() && WDIM() === 3 && !reg3_in_hrmap_rule_or_subrule())
    return reg3_altdist(c.master);
  if (!c.master.alt) return 0;
  // #if CAP_IRR
  if (IRREGULAR()) return irr_celldist(c, true);
  if (ctof(c)) return c.master.alt.distance;
  if (reg3_in()) return c.master.alt.distance;
  // #if CAP_GP
  if (GOLDBERG()) return gp_compute_dist(c, celldistAlt);
  if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return Math.trunc(gp_in_underlying_geometry(() => gp_compute_dist(c1, celldistAlt)) / 2);
    /* TODO */
  }
  const dx: number[] = []; dx[0] = 0;
  for (let u = 0; u < S3(); u++) if (createMov(c, u + u).master.alt === null)
    return ALTDIST_UNKNOWN;
  for (let u = 0; u < S3(); u++)
    dx[u] = createMov(c, u + u).master.alt.distance;
  // return compdist(dx); -> not OK because of boundary conditions
  let mi = dx[0];
  for (let i = 1; i < S3(); i++) mi = Math.min(mi, dx[i]);
  for (let i = 0; i < S3(); i++) if (dx[i] > mi + 2)
    return ALTDIST_BOUNDARY; // { printf("cycle error!\n"); exit(1); }
  for (let i = 0; i < S3(); i++) if (dx[i] === mi + 2)
    return mi + 1;
  return mi;
}


/** direction upwards in the tree */
export function updir(h: heptagon): number {
  // #if CAP_BT
  if (bt_in()) return bt_updir();
  // #if MAXMDIM >= 4
  if (WDIM() === 3 && reg3_in_hrmap_rule_or_subrule()) {
    for (let i = 0; i < h.type; i++) if (h.move(i) && h.move(i).distance < h.distance)
      return i;
    return -1;
  }
  if (h.s === hsOrigin) return -1;
  return 0;
}

/** direction upwards in the alt-tree */
export function updir_alt(h: heptagon): number {
  if (euclid() || !h.alt) return -1;
  // #if MAXMDIM >= 4
  if (WDIM() === 3 && reg3_in_hrmap_rule_or_subrule()) {
    for (let i = 0; i < S7(); i++) if (h.move(i) && h.move(i).alt && h.move(i).alt.distance < h.alt.distance)
      return i;
    return -1;
  }
  return gmod(updir(h.alt) + altmap_relspin(h.alt), h.type);
}

export const RPV_MODULO = 5;
export const RPV_RAND = 0;
export const RPV_ZEBRA = 1;
export const RPV_EMERALD = 2;
export const RPV_PALACE = 3;
export const RPV_CYCLE = 4;

// x mod 5 = pattern type
// x mod (powers of 2) = pattern type specific
// (x/5) mod 15 = picture for drawing floors
// x mod 7 = chance of pattern-specific pic
// whole = randomization

export function randpattern(c: cell, rval: number): boolean {
  let i: number, sw = 0;
  switch (rval % 5) {
    case 0:
      if (rval & 1) {
        return hrandpos() < rval;
      }
      else {
        const cd = getCdata(c, 0);
        return !((Math.trunc(cd / (((rval >> 1) & 15) + 1))) & 1);
      }
    case 1:
      i = zebra40(c);
      if (i & 1) { if (rval & 4) sw ^= 1; i &= ~1; }
      if (i & 2) { if (rval & 8) sw ^= 1; i &= ~2; }
      i >>= 2;
      i--; i = Math.trunc(i / 3);
      if (rval & (16 << i)) sw ^= 1;
      return !!sw;
    case 2:
      i = emeraldval(c);
      if (i & 1) { if (rval & 4) sw ^= 1; i &= ~1; }
      if (i & 2) { if (rval & 8) sw ^= 1; i &= ~2; }
      i >>= 2; i--;
      if (rval & (16 << i)) sw ^= 1;
      return !!sw;
    case 3:
      if (polara50(c)) { if (rval & 4) sw ^= 1; }
      if (polarb50(c)) { if (rval & 8) sw ^= 1; }
      i = fiftyval049(c); i += 6; i = Math.trunc(i / 7);
      if (rval & (16 << i)) sw ^= 1;
      return !!sw;
    case 4:
      i = (rval & 3);
      if (i === 1 && (celldist(c) & 1)) sw ^= 1;
      if (i === 2 && (celldist(c) & 2)) sw ^= 1;
      if (i === 3 && ((Math.trunc(celldist(c) / 3)) & 1)) sw ^= 1;
      if (rval & (4 << towerval(c, celldist))) sw ^= 1;
      return !!sw;
  }
  return false;
}

export function describeRPM(l: eLand): string {
  const rval = G.randompattern[l];
  switch (rval % 5) {
    case 0:
      if (rval & 1)
        return 'R:' + its(Math.trunc(rval / Math.trunc(0x7FFFFFFF / 100))) + '%';
      else
        return 'Landscape/' + its(((rval >> 1) & 15) + 1);
    case 1:
      return 'Z/' + its((rval >> 2) & 3) + '/' + its((rval >> 4) & 15);
    case 2:
      return 'E/' + its((rval >> 2) & 3) + '/' + its((rval >> 4) & 2047);
    case 3:
      return 'P/' + its((rval >> 2) & 3) + '/' + its((rval >> 4) & 255);
    case 4:
      return 'C/' + its(rval & 3) + '/' + its((rval >> 2) & 65535);
  }
  return '?';
}

export function randpatternCode(c: cell, rval: number): number {
  switch (rval % RPV_MODULO) {
    case 1:
      return zebra40(c);
    case 2:
      return emeraldval(c);
    case 3:
      return fiftyval049(c) + (polara50(c) ? 50 : 0) + (polarb50(c) ? 1000 : 0);
    case 4:
      return towerval(c, celldist) * 6 + celldist(c) % 6;
  }
  return 0;
}

export const RANDITER = 31;

/** char rpm_memoize[3][256][RANDITER+1], indexed flat as C++ addresses it: a code >= 256 (Palace codes reach
 *  ~1100) runs into the next ival's rows, as in the original; beyond the array (C++ would touch other globals)
 *  the port keeps extra zero-initialized room, which clearMemoRPM does not reset (it only clears 3x256 rows). */
const RPM_ROW = RANDITER + 1;
const rpm_memoize = new Int8Array(3 * 256 * RPM_ROW + 4096 * RPM_ROW);

export function clearMemoRPM(): void {
  for (let a = 0; a < 3; a++) for (let b = 0; b < 256; b++) for (let i = 0; i < RANDITER + 1; i++)
    rpm_memoize[(a * 256 + b) * RPM_ROW + i] = 2;
}

export function randpatternMajority(c: cell, ival: number, iterations: number): boolean {
  let rval = 0;
  if (ival === 0) rval = G.randompattern[laCaves];
  if (ival === 1) rval = G.randompattern[laLivefjord];
  if (ival === 2) rval = G.randompattern[laEmerald];
  if (rval % RPV_MODULO === RPV_RAND) return randpattern(c, rval);
  const code = randpatternCode(c, rval);
  const k = (ival * 256 + code) * RPM_ROW + iterations;
  if (rpm_memoize[k] < 2) return !!rpm_memoize[k];
  let z = 0;
  if (iterations) for (let i = 0; i < c.type; i++) {
    if (randpatternMajority(createMov(c, i), ival, iterations - 1))
      z++;
    else
      z--;
  }
  if (z !== 0) rpm_memoize[k] = (z > 0) ? 1 : 0;
  else rpm_memoize[k] = randpattern(c, rval) ? 1 : 0;
  // printf("%p] rval = %X code = %d iterations = %d result = %d\n", c, rval, code, iterations, memo);
  return !!rpm_memoize[k];
}

// #define RVAL_MASK 0x10000000
// #define DATA_MASK 0x20000000

/** cdata orig_cdata (zero) */
function new_cdata(src?: cdata): cdata {
  const d = new cdata();
  if (src) { d.val.set(src.val); d.bits = src.bits; }
  return d;
}

export function geometry_supports_cdata(): boolean {
  if (mhybrid()) return hybrid_in_underlying_geometry(() => geometry_supports_cdata());
  if (embedded_plane()) return geom3_in_flipped(() => geometry_supports_cdata());
  return among(G.geometry, gEuclid, gEuclidSquare, gNormal, gOctagon, g45, g46, g47, gBinaryTiling) || (arcm_in() && !sphere()) || (G.currentmap && (G.currentmap as hrmap).strict_tree_rules());
}

/** affect(cdata& d, short rv, signed char signum) */
function affect(d: cdata, rv: number, signum: number): void {
  if (rv & 1) d.val[0] += signum; else d.val[0] -= signum;
  if (rv & 2) d.val[1] += signum; else d.val[1] -= signum;
  if (rv & 4) d.val[2] += signum; else d.val[2] -= signum;
  if (rv & 8) d.val[3] += signum; else d.val[3] -= signum;
  const id = (rv >> 4) & 63;
  if (id < 32)
    d.bits = d.bits ^ (1 << id);
}

function setHeptagonRval(h: heptagon): void {
  if (!(h.rval0 || h.rval1)) {
    h.rval0 = hrand(0x10000);
    h.rval1 = hrand(0x10000);
  }
}

export function dmeq(a: number, b: number): boolean { return (a & 3) === (b & 3); }

/* kept for compatibility: Racing etc. */
function getHeptagonCdata_legacy(h: heptagon): cdata {
  if (h.cdata) return h.cdata;

  if (sphere() || quotient()) h = (G.currentmap as hrmap).gamestart().master;

  if (h === (G.currentmap as hrmap).getOrigin()) {
    h.cdata = new_cdata();
    for (let k = 0; k < 4; k++) h.cdata.val[k] = 0;
    h.cdata.bits = G.reptilecheat ? (1 << 21) - 1 : 0;
    if (G.yendor_on && G.specialland === laVariant) h.cdata.bits |= (1 << 8) | (1 << 9) | (1 << 12);
    return h.cdata;
  }

  const mydata = new_cdata(getHeptagonCdata_legacy(h.move(0)));

  for (let di = 3; di < 5; di++) {
    let hs = new heptspin(h, di, false);
    let signum = +1;
    while (true) {
      const hstab: heptspin[] = new Array(15);
      hstab[7] = hs.clone();

      for (let i = 8; i < 12; i++) {
        hstab[i] = hstab[i - 1].clone();
        hstab[i].add((i & 1) ? 4 : 3);
        hstab[i].addStep();
        hstab[i].add((i & 1) ? 3 : 4);
      }

      for (let i = 6; i >= 3; i--) {
        hstab[i] = hstab[i + 1].clone();
        hstab[i].add((i & 1) ? 3 : 4);
        hstab[i].addStep();
        hstab[i].add((i & 1) ? 4 : 3);
      }

      if (hstab[3].at.distance < hstab[7].at.distance) {
        hs = hstab[3].clone(); continue;
      }

      if (hstab[11].at.distance < hstab[7].at.distance) {
        hs = hstab[11].clone(); continue;
      }

      let jj = 7;
      for (let k = 3; k < 12; k++) if (hstab[k].at.distance < hstab[jj].at.distance) jj = k;

      let ties = 0, tiespos = 0;
      for (let k = 3; k < 12; k++) if (hstab[k].at.distance === hstab[jj].at.distance) {
        ties++; tiespos += (k - jj);
      }

      // printf("ties=%d tiespos=%d jj=%d\n", ties, tiespos, jj);
      if (ties === 2) jj += Math.trunc(tiespos / 2);

      if (jj & 1) signum = -1;
      hs = hstab[jj].clone();

      break;
    }
    hs = hs.plus(3).addStep();
    setHeptagonRval(hs.at);

    affect(mydata, hs.spin ? hs.at.rval0 : hs.at.rval1, signum);
  }

  return h.cdata = new_cdata(mydata);
}

function getHeptagonCdata(h: heptagon): cdata {
  if (mhybrid()) return hybrid_in_underlying_geometry(() => getHeptagonCdata(h));
  if (embedded_plane()) return geom3_in_flipped(() => getHeptagonCdata(h));
  if (G.geometry === gNormal && BITRUNCATED()) return getHeptagonCdata_legacy(h);
  if (h.cdata) return h.cdata;

  if (sphere() || quotient()) h = (G.currentmap as hrmap).gamestart().master;

  let starting = h.s === hsOrigin;
  // #if CAP_BT
  if (bt_in()) {
    if (bt_mapside(h) === 0) starting = true;
    for (let i = 0; i < h.type; i++) if (bt_mapside(h.cmove(i)) === 0) starting = true;
  }

  if ((G.currentmap as hrmap).strict_tree_rules()) starting = h.distance <= 0;

  if (starting) {
    h.cdata = new_cdata();
    for (let k = 0; k < 4; k++) h.cdata.val[k] = 0;
    h.cdata.bits = G.reptilecheat ? (1 << 21) - 1 : 0;
    if (G.yendor_on && G.specialland === laVariant) h.cdata.bits |= (1 << 8) | (1 << 9) | (1 << 12);
    return h.cdata;
  }

  const dir = updir(h);

  const mydata = new_cdata(getHeptagonCdata(h.cmove(dir)));

  if (S3() >= OINF) {
    setHeptagonRval(h);
    affect(mydata, h.rval0, 1);
  }
  else if ((G.currentmap as hrmap).strict_tree_rules()) {
    // for(eLand ws: {NOWALLSEP, NOWALLSEP_SWAP}) { ... general_barrier_advance (barriers.cpp) ... }: only on
    // the maps of rulegen.cpp (a later stage)
    void NOWALLSEP; void NOWALLSEP_SWAP;
    notp('getHeptagonCdata: strict_tree_rules (rulegen maps)');
  }
  else if (S3() === 4) {
    let hs = new heptspin(h, 0);
    while (dmeq(hs.plus(1).cpeek().dm4, (hs.at.dm4 - 1))) hs = hs.plus(1).addStep().add(1);
    while (dmeq(hs.minus(1).cpeek().dm4, (hs.at.dm4 - 1))) hs = hs.minus(1).addStep().add(-1);
    setHeptagonRval(hs.at);
    affect(mydata, hs.at.rval0, 1);
  }
  else for (const di of [0, 1]) {
    let hs = new heptspin(h, dir, false);
    hs.sub(di);
    while (true) {
      const hs2 = hs.plusStep().add(1).addStep().add(-1);
      if (dmeq(hs2.at.dm4, hs.at.dm4 + 1)) break;
      hs = hs2;
    }
    while (true) {
      const hs2 = hs.plus(1).addStep().add(-1).addStep();
      if (dmeq(hs2.at.dm4, hs.at.dm4 + 1)) break;
      hs = hs2;
    }
    setHeptagonRval(hs.at);
    affect(mydata, hs.spin === dir ? hs.at.rval0 : hs.at.rval1, 1);
  }

  return h.cdata = new_cdata(mydata);
}

function getEuclidCdata(h: loc): cdata | null {

  const x = h[0], y = h[1];

  // #if CAP_ARCM
  const data = arcm_in() ? (arcm_get_cdata() as Map<string, cdata>) : euc_get_cdata();

  // hrmap_euclidean* euc = dynamic_cast<hrmap_euclidean*> (currentmap);
  const key = x + ',' + y;
  if (data.has(key)) return data.get(key)!;

  if (x === 0 && y === 0) {
    const xx = new cdata();
    for (let i = 0; i < 4; i++) xx.val[i] = 0;
    xx.bits = 0;
    data.set(key, xx);
    return xx;
  }
  let ord = 1, bid = 0;
  while (!((x | y) & ord)) { ord <<= 1; bid++; }

  for (let k = 0; k < 3; k++) {
    const x1 = x + (k < 2 ? ord : 0);
    const y1 = y - (k > 0 ? ord : 0);
    if ((x1 & ord) || (y1 & ord)) continue;
    const x2 = x - (k < 2 ? ord : 0);
    const y2 = y + (k > 0 ? ord : 0);

    const d1 = getEuclidCdata([x1, y1])!;
    const d2 = getEuclidCdata([x2, y2])!;
    const xx = new cdata();
    const disp = Math.pow(2, bid / 2.) * 6;

    for (let i = 0; i < 4; i++) {
      // (d1->val[i] + d2->val[i])/2 is int division; hrand(1000) - hrand(1000): left operand first
      const r1 = hrand(1000);
      const r2 = hrand(1000);
      const dv = Math.trunc((d1.val[i] + d2.val[i]) / 2) + (r1 - r2) / 1000. * disp;
      xx.val[i] = Math.floor(dv);
      if (hrand(1000) / 1000. < dv - Math.floor(dv)) xx.val[i]++;
    }
    xx.bits = 0;

    for (let b = 0; b < 32; b++) {
      const gbit = (((hrand(2) ? d1 : d2).bits >> b) & 1) !== 0;
      let flipchance = (1 << bid);
      if (flipchance > 512) flipchance = 512;
      let g = gbit;
      if (hrand(1024) < flipchance) g = !g;
      if (g) xx.bits |= (1 << b);
    }

    data.set(key, xx);
    return xx;
  }

  // impossible!
  return null;
}

function ld_to_int(x: number): number {
  return Math.trunc(x + 1000000.5) - 1000000;
}
void ld_to_int;

// #if CAP_ARCM
/** pseudocoords(c): arcm::bm.where (archimedean.cpp, a later stage) */
export function pseudocoords(c: cell): loc {
  return arcm_cdata_of(c);
}

/** arcmCdata(c): arcm::bm (archimedean.cpp, a later stage) */
export function arcmCdata(c: cell): cdata {
  return arcm_cdata_of(c);
}

export function getCdata(c: cell, j: number): number {
  if (fake_in()) return fake_in_underlying_geometry(() => getCdata(c, j));
  if (embedded_plane()) return geom3_in_flipped(() => getCdata(c, j));
  if (experimental()) return 0;
  if (mhybrid()) { c = hybrid_get_where(c)[0]; return hybrid_in_underlying_geometry(() => getBits(c)); }
  else if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return gp_in_underlying_geometry(() => getCdata(c1, j));
  }
  else if (euc_in()) return getEuclidCdata(euc2_coordinates(c))!.val[j];
  // #if CAP_ARCM
  else if (arcm_in() && euclid())
    return getEuclidCdata(pseudocoords(c))!.val[j];
  else if (arcm_in() && (hyperbolic() || sl2()))
    return arcmCdata(c).val[j] * 3;
  else if (!geometry_supports_cdata()) return 0;
  else if (ctof(c)) return getHeptagonCdata(c.master).val[j] * 3;
  else {
    let jj = 0;
    const ar = gp_get_masters(c);
    for (let k = 0; k < 3; k++)
      jj += getHeptagonCdata(ar[k]).val[j];
    return jj;
  }
}

export function getBits(c: cell): number {
  if (fake_in()) return fake_in_underlying_geometry(() => getBits(c));
  if (embedded_plane()) return geom3_in_flipped(() => getBits(c));
  if (experimental()) return 0;
  if (mhybrid()) { c = hybrid_get_where(c)[0]; return hybrid_in_underlying_geometry(() => getBits(c)); }
  else if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return gp_in_underlying_geometry(() => getBits(c1));
  }
  else if (euc_in()) return getEuclidCdata(euc2_coordinates(c))!.bits;
  // #if CAP_ARCM
  else if (arcm_in() && euclid())
    return getEuclidCdata(pseudocoords(c))!.bits;
  else if (arcm_in() && (hyperbolic() || sl2()))
    return arcmCdata(c).bits;
  else if (!geometry_supports_cdata()) return 0;
  else if (c === c.master.c7) return getHeptagonCdata(c.master).bits;
  else {
    const ar = gp_get_masters(c);
    const b0 = getHeptagonCdata(ar[0]).bits;
    const b1 = getHeptagonCdata(ar[1]).bits;
    const b2 = getHeptagonCdata(ar[2]).bits;
    return (b0 & b1) | (b1 & b2) | (b2 & b0);
  }
}

export function heptatdir(c: cell, d: number): cell {
  if (d & 1) {
    const c2 = createMov(c, d);
    let s = c.c.spin(d);
    s += 3; s %= 6;
    return createMov(c2, s);
  }
  else return createMov(c, d);
}

/** heptdistance(heptagon *h1, heptagon *h2) */
export function heptdistance_h(h1: heptagon, h2: heptagon): number {
  // very rough distance
  let d = 0;
  // #if CAP_CRYSTAL
  if (cryst()) return crystal_space_distance(h1.c7, h2.c7);
  // #if CAP_SOLV
  if (sn_in()) return sn_approx_distance(h1, h2);
  while (true) {
    if (h1 === h2) return d;
    for (let i = 0; i < S7(); i++) if (h1.move(i) === h2) return d + 1;
    const d1 = h1.distance, d2 = h2.distance;
    if (d1 >= d2) { d++; h1 = createStep(h1, bt_updir()); }
    if (d2 > d1) { d++; h2 = createStep(h2, bt_updir()); }
  }
}

export function heptdistance(c1: cell, c2: cell): number {
  // #if CAP_CRYSTAL
  if (cryst()) return crystal_space_distance(c1, c2);
  if (!hyperbolic() || quotient() || WDIM() === 3) return celldistance(c1, c2);
  else return heptdistance_h(c1.master, c2.master);
}

/** map<pair<cell*, cell*>, int> saved_distances: by first cell, then second (counted for isize) */
const saved_distances = new Map<cell, Map<cell, number>>();
let saved_distances_size = 0;

function sd_get(c1: cell, c2: cell): number | undefined {
  return saved_distances.get(c1)?.get(c2);
}
function sd_set(c1: cell, c2: cell, v: number): void {
  let m = saved_distances.get(c1);
  if (!m) { m = new Map(); saved_distances.set(c1, m); }
  if (!m.has(c2)) saved_distances_size++;
  m.set(c2, v);
}
function sd_clear(): void { saved_distances.clear(); saved_distances_size = 0; }

// set<cell*> keep_distances_from: G.keep_distances_from

const dists_computed = new Set<cell>();

let perma_distances = 0;

export function compute_saved_distances(c1: cell, max_range: number, climit: number): void {

  const cl = new celllister(c1, max_range, climit, null);

  for (let i = 0; i < cl.lst.length; i++)
    sd_set(c1, cl.lst[i], cl.dists[i]);
  cl.destroy();
}

export function permanent_long_distances(c1: cell): void {
  G.keep_distances_from.add(c1);
  if (G.racing_on)
    compute_saved_distances(c1, 300, 1000000);
  else
    compute_saved_distances(c1, 120, 200000);
}

export function erase_saved_distances(): void {
  sd_clear(); dists_computed.clear();

  // set<cell*> iterates by address: the creation serial
  for (const c of [...G.keep_distances_from].sort((a, b) => a._id - b._id)) compute_saved_distances(c, 120, 200000);
  perma_distances = saved_distances_size;
}

export function max_saved_distance(c: cell): number {
  let maxsd = 0;
  const m = saved_distances.get(c);
  if (m) for (const v of m.values()) maxsd = Math.max(maxsd, v);
  return maxsd;
}

export function random_in_distance(c: cell, d: number): cell {
  const choices: cell[] = [];
  const m = saved_distances.get(c);
  // the map iterates by (address of c1, address of c2): the creation serial of the second cell
  if (m) for (const c2 of [...m.keys()].sort((a, b) => a._id - b._id)) if (m.get(c2) === d) choices.push(c2);
  // println(hlog, "choices = ", isize(choices));
  if (choices.length === 0) return null!;
  return choices[hrand(choices.length)];
}

export function bounded_celldistance(c1: cell, c2: cell): number {
  let limit = 14400;
  // #if CAP_SOLV
  if (G.geometry === gArnoldCat) {
    void asonov_get_at; void asonov_get_coord;
    c2 = notp('bounded_celldistance: Arnold cat (asonov::get_at(get_coord(c2) - get_coord(c1)))');
    c1 = (G.currentmap as hrmap).gamestart();
    limit = 100000000;
  }

  const v = sd_get(c1, c2);
  if (v !== undefined) return v;

  const cl = new celllister(c1, 100, limit, null);
  for (let i = 0; i < cl.lst.length; i++)
    sd_set(c1, cl.lst[i], cl.dists[i]);
  cl.destroy();

  const v2 = sd_get(c1, c2);
  if (v2 !== undefined) return v2;

  return DISTANCE_UNKNOWN;
}

export function clueless_celldistance(c1: cell, c2: cell): number {
  const v = sd_get(c1, c2);
  if (v !== undefined) return v;

  if (dists_computed.has(c1)) return DISTANCE_UNKNOWN;

  if (saved_distances_size > perma_distances + 1000000) erase_saved_distances();
  compute_saved_distances(c1, 64, 1000);

  dists_computed.add(c1);

  const v2 = sd_get(c1, c2);
  if (v2 !== undefined) return v2;

  return DISTANCE_UNKNOWN;
}

export function celldistance(c1: cell, c2: cell): number {

  if (embedded_plane()) return geom3_in_flipped(() => celldistance(c1, c2));

  if (fake_in()) return fake_in_underlying_geometry(() => celldistance(c1, c2));

  if (mhybrid()) return hybrid_celldistance(c1, c2);

  // #if CAP_FIELD
  if (G.geometry === gFieldQuotient && (PURE() || BITRUNCATED())) {
    const d = fieldpattern_field_celldistance(c1, c2);
    if (d !== DISTANCE_UNKNOWN) return d;
  }

  if (closed_manifold()) return bounded_celldistance(c1, c2);

  // #if CAP_CRYSTAL
  if (cryst()) return crystal_precise_distance(c1, c2);

  if (euc_in() && WDIM() === 2) {
    return euc_cyldist(euc2_coordinates(c1), euc2_coordinates(c2));
  }

  if (arcm_in() || quotient() || sn_in() || (aperiodic() && euclid()) || experimental() || sl2() || nil() || arb_in())
    return clueless_celldistance(c1, c2);

  if (S3() >= OINF) return inforder_celldistance(c1, c2);

  // #if CAP_BT && MAXMDIM >= 4
  if (bt_in() && WDIM() === 3)
    return bt_celldistance3(c1, c2);

  // #if MAXMDIM >= 4
  if (euc_in())
    return euc_celldistance(c1, c2);

  if (hyperbolic() && WDIM() === 3) return reg3_celldistance(c1, c2);

  /* if(INVERSE) { ... that does not seem to work } */

  if (euclid()) return clueless_celldistance(c1, c2);
  if (INVERSE()) return clueless_celldistance(c1, c2);

  return hyperbolic_celldistance(c1, c2);
}

export class hr_shortest_path_exception extends hr_exception {}

export function build_shortest_path(c1: cell, c2: cell): cell[] {
  // #if CAP_CRYSTAL
  if (cryst()) return crystal_build_shortest_path(c1, c2);
  let p: cell[] = [];
  if (euclid()) {
    p.push(c1);
    const h = tC0(calc_relative_matrix(c2, c1, C0()));
    const x = { v: c1 };
    const T1 = { v: rspintox(h) };
    const d = celldistance(c1, c2);
    const steps = d * 10;
    const step = hdist0(h) / steps;
    for (let i = 0; i < steps; i++) {
      T1.v = tmul(T1.v, xpush(step));
      virtualRebase(x, T1);
      // println(hlog, "x = ", x, "p length = ", isize(p), " dist = ", ...);
      while (x.v !== p[p.length - 1]) {
        const back = p[p.length - 1];
        for (let j = 0; j < back.type; j++) {
          const c = createMov(back, j);
          if (celldistance(x.v, c) < celldistance(x.v, back)) {
            p.push(c);
            break;
          }
        }
      }
    }
    // if(isize(p) != d + 1) println(hlog, "warning: path size ", isize(p), " should be ", d+1);
  }
  else if (c2 === (G.currentmap as hrmap).gamestart()) {
    while (c1 !== c2) {
      p.push(c1);
      let found = false;
      for (let i = 0; i < c1.type; i++) {
        const c = createMov(c1, i);
        if (celldist(c) < celldist(c1)) { c1 = c; found = true; break; }
      }
      if (!found) throw new hr_shortest_path_exception();
    }
    p.push(c1);
  }
  else if (c1 === (G.currentmap as hrmap).gamestart()) {
    p = build_shortest_path(c2, c1);
    p.reverse();
  }
  else {
    while (c1 !== c2) {
      p.push(c1);
      let found = false;
      for (let i = 0; i < c1.type; i++) {
        const c = createMov(c1, i);
        if (celldistance(c, c2) < celldistance(c1, c2)) { c1 = c; found = true; break; }
      }
      if (!found) throw new hr_shortest_path_exception();
    }
    p.push(c1);
  }
  return p;
}

export function clearCellMemory(): void {
  // #if CAP_PORTALS
  if (G.intra_in) {
    intra_erase_all_maps();
    return;
  }
  for (let i = 0; i < G.allmaps.length; i++)
    if (G.allmaps[i])
      G.allmaps[i].destroy();
  G.allmaps.length = 0;
  G.currentmap = null!; G.hybrid_pmap = null; G.fake_pmap = null; G.gp_pmap = null;
  G.last_cleared = null!;
  sd_clear();
  dists_computed.clear();
  G.keep_distances_from.clear(); perma_distances = 0;
  G.pd_from = null!;
  gp_gp_adj.clear();
}

export function isNeighbor(c1: cell, c2: cell): boolean {
  for (let i = 0; i < c1.type; i++) if (c1.move(i) === c2) return true;
  return false;
}

export function isNeighborCM(c1: cell, c2: cell): boolean {
  for (let i = 0; i < c1.type; i++) if (createMov(c1, i) === c2) return true;
  return false;
}

export function neighborId(ofWhat: cell, whichOne: cell): number {
  for (let i = 0; i < ofWhat.type; i++) if (ofWhat.move(i) === whichOne) return i;
  return -1;
}

// int mine_adjacency_rule: G.mine_adjacency_rule

/** struct adj_data */
export interface adj_data {
  c: cell;
  mirrored: boolean;
  T: transmatrix;
}

// array<map<cell*, vector<adj_data>>, 2> adj_memo: G.adj_memo

export function geometry_has_alt_mine_rule(): boolean {
  if (S3() >= OINF) return false;
  if (aperiodic()) return true;
  if (WDIM() === 2) return valence() > 3;
  if (WDIM() === 3) return !among(G.geometry, gHoroHex, gCell5, gBitrunc3, gCell8, gECell8, gCell120, gECell120);
  return true;
}

/** returns the memoized vector itself (C++ returns a copy: callers must not change it) */
export function adj_minefield_cells_full(c: cell): adj_data[] {
  const am = G.adj_memo[G.mine_adjacency_rule];
  const got = am.get(c);
  if (got) return got;
  if (am.size > 10000) am.clear();
  const res: adj_data[] = [];
  am.set(c, res);
  if (G.mine_adjacency_rule === 0 || !geometry_has_alt_mine_rule()) {
    for (let i = 0; i < c.type; i++) {
      const c2 = createMov(c, i);
      res.push({ c: c2, mirrored: c.c.mirror(i), T: (G.currentmap as hrmap).adj(c, i) });
    }
  }
  else if (WDIM() === 2) {
    const cm = G.currentmap as hrmap;
    const cw = new cellwalker(c, 0); cw.cpeek();
    let T: transmatrix = Id;
    T = tmul(T, cm.adj(c, 0));
    cw.addStep();
    cw.add(1);
    const cw1 = cw.clone();
    do {
      res.push({ c: cw.at, mirrored: cw.mirrored, T });
      cw.cpeek();
      T = tmul(T, cm.adj(cw.at, cw.spin));
      cw.addStep();
      cw.add(1);
      if (cw.cpeek() === c) cw.add(1);
    }
    while (cw.ne(cw1));
  }
  else {
    void manual_celllister;
    notp('adj_minefield_cells_full: 3D (cell shapes)');
  }
  return res;
}

export function adj_minefield_cells(c: cell): cell[] {
  const res: cell[] = [];
  const ori = adj_minefield_cells_full(c);
  for (const p of ori) res.push(p.c);
  if (hat_in()) {
    // reduce repetitions: sort by address (the creation serial) and unique
    res.sort((a, b) => a._id - b._id);
    for (let i = res.length - 1; i > 0; i--) if (res[i] === res[i - 1]) res.splice(i, 1);
  }
  return res;
}

export function reverse_directions(c: cell, dir: number): number[] {
  if (PURE() && !(aperiodic() && WDIM() === 2)) return reverse_directions_h(c.master, dir);
  const d = c.degree();
  if (d & 1)
    return [gmod(dir + (c.type >> 1), c.type), gmod(dir + ((c.type + 1) >> 1), c.type)];
  else
    return [gmod(dir + (c.type >> 1), c.type)];
}

export function reverse_directions_h(c: heptagon, dir: number): number[] {
  const d = c.degree();
  switch (G.geometry) {
    case gBinary3:
      if (dir < 4) return [8];
      else if (dir >= 8) return [0, 1, 2, 3];
      else return [dir ^ 1];

    case gHoroTris:
      if (dir < 4) return [7];
      else if (dir === 4) return [5, 6];
      else if (dir === 5) return [6, 4];
      else if (dir === 6) return [4, 5];
      else return [0, 1, 2, 3];

    case gHoroRec:
      if (dir < 2) return [6];
      else if (dir === 6) return [0, 1];
      else return [dir ^ 1];

    case gKiteDart3: {
      if (dir < 4) return [dir ^ 2];
      if (dir >= 6) return [4, 5];
      const res: number[] = [];
      for (let i = 6; i < c.type; i++) res.push(i);
      return res;
    }

    case gHoroHex: {
      if (dir < 6) return [12, 13];
      if (dir >= 12) return [0, 1, 2, 3, 4, 5];
      const dt = [0, 0, 0, 0, 0, 0, 10, 11, 9, 8, 6, 7, 0, 0];
      return [dt[dir]];
    }

    default:
      if (d & 1)
        return [gmod(dir + (c.type >> 1), c.type), gmod(dir + ((c.type + 1) >> 1), c.type)];
      else
        return [gmod(dir + (c.type >> 1), c.type)];
  }
}

export function standard_tiling(): boolean {
  return !arcm_in() && !aperiodic() && !bt_in() && !arb_in() && (WDIM() === 2 || !nonisotropic()) && !mhybrid();
}

export function valence(): number {
  if (BITRUNCATED() || IRREGULAR()) return 3;
  if (INVERSE()) return WARPED() ? 4 : Math.max(S3(), S7());
  // #if CAP_ARCM
  if (arcm_in()) return arcm_valence();
  if (arb_in()) return arb_current().min_valence;
  return S3();
}

/** portalspaces are not defined outside of a boundary */
export function is_boundary(c: cell): boolean {
  if (c === G.out_of_bounds) return true;
  return (((cgflags() & qPORTALSPACE) !== 0n) || G.intra_in) && isWall(c);
}

/** compute the distlimit for a tessellation automatically */
export function auto_compute_range(c: cell): number {
  if (sphere()) return SEE_ALL;
  cgi().base_distlimit = 0;
  const expected_count = 400;
  const cl = new celllister(c, 1000, expected_count, null);
  let z = cl.dists.length;
  let d = cl.dists[cl.dists.length - 1];
  while (cl.dists[z - 1] === d) z--;
  // if(debug_geometry) println(...)
  if (cl.dists.length * z > expected_count * expected_count) d--;
  if (d <= 0) d = 1;
  cl.destroy();
  return ginf[G.geometry].distlimit[0] = cgi().base_distlimit = d;
}

export function getDistLimit(): number {
  const g = cgi();
  if (g.base_distlimit) return g.base_distlimit;
  if (arb_in() && arb_current().range)
    return g.base_distlimit = arb_current().range;
  if (arcm_in() || arb_in()) {
    if (!G.currentmap) return 0;
    const c = (G.currentmap as hrmap).gamestart();
    if (!c) return 0;
    return g.base_distlimit = auto_compute_range(c);
  }
  if (mhybrid())
    return g.base_distlimit = hybrid_in_underlying_geometry(() => Math.max(getDistLimit() - 1, 0));
  g.base_distlimit = ginf[G.geometry].distlimit[!BITRUNCATED() ? 1 : 0];
  if (GOLDBERG_INV()) {
    if (!g.gpdata) return g.base_distlimit = 0;
    // println(hlog, "original = ", res);
    const param = G.gp_param;
    const scale = g.gpdata.scale;
    if (S3() === 3)
      g.base_distlimit = Math.trunc((g.base_distlimit + Math.log(scale) / Math.log(2.618)) / scale);
    else
      g.base_distlimit = 3 * Math.max(param[0], param[1]) + 2 * Math.min(param[0], param[1]);
    if (S7() === 12)
      g.base_distlimit = 2 * param[0] + 2 * param[1] + 1;
    if (g.base_distlimit > SEE_ALL)
      g.base_distlimit = SEE_ALL;
    void gp_univ_param;
  }
  if (IRREGULAR()) {
    const scale = irr_compute_scale();
    g.base_distlimit = Math.trunc((g.base_distlimit + Math.log(scale) / Math.log(2.618)) / scale);
    if (g.base_distlimit > 25) g.base_distlimit = 25;
  }
  return g.base_distlimit;
}

/** #define BARLEV ((ISANDROID||ISIOS||ISFAKEMOBILE||getDistLimit()<7)?(getDistLimit()<4?8:9):10) */
export function BARLEV(): number {
  return (getDistLimit() < 7) ? (getDistLimit() < 4 ? 8 : 9) : 10;
}

// cell out_of_bounds, heptagon oob: G.out_of_bounds, G.oob

/** ctof is pattern2.cpp's; re-exported here (test/trace.ts imports it from cell.ts) */
export { ctof };

/** the static initialization of cell.cpp: `auto cellhooks = addHook(hooks_clearmemory, 500, clearCellMemory);`
 *  and the late binding of createMov / reverse_directions for locations.ts */
export function register_cell(): void {
  G.hooks_clearmemory.add(500, clearCellMemory);
  late.createMov = createMov;
  late.reverse_directions_cell = reverse_directions;
  late.reverse_directions_hept = reverse_directions_h;
}
