// euclid.cpp of HyperRogue 13.1o: Euclidean geometry, including 2D, 3D, and quotient spaces (stage 3, package
// G1). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names: namespace euc -> euc_x. coord (array<int,3>) is a [x, y, z] array; std::map<coord, ...> is a Map keyed
// by `coordkey` ("x,y,z"); map<heptagon*, coord> a Map by heptagon. std::array's operator< (lexicographic) is
// `coord_lt`. gp::loc is [first, second] (goldberg.ts). The 3D cell shapes (euc::generate) need 3D graphics:
// NotPorted (STAGE3-STUB, the 3D package).
import { NotPorted, hr_exception, isize, among } from './hyper.ts';
import { G } from './globals.ts';
import { idiv } from './cpp.ts';
import { gmod } from './hyper.ts';
import {
  gCubeTiling, gMengerSponge, gRhombic3, gSierpinskiTet, gBitrunc3, gEuclid, gSierpinski3, gSixFlake, gEuclidSquare,
  gSierpinski4, gOctTet3, PURE, BITRUNCATED, GOLDBERG, INVERSE, IRREGULAR, cgflags, qEXPERIMENTAL, qPORTALSPACE, qANYQ,
  qCLOSED, qSMALL, qNONORIENTABLE, euclid, WDIM, GDIM, S7, S3, a4, ginf, closed_manifold, quotient, embedded_plane,
} from './classes.ts';
import { laCamelot } from './content.ts';
import { fake_in } from './fake.ts';
import { standard_tiling, hrmap_standard, newCell, type hrmap } from './cell.ts';
import { init_heptagon } from './heptagon.ts';
import { celllister, cellwalker, type cell, type heptagon, cdata } from './locations.ts';
import {
  type transmatrix, type hyperpoint, type shiftmatrix, Id, tcopy, tmul, tmulh, C0, C03, eupush3, hdist, tC0, rspintox,
  spintox, MirrorX, MirrorY, Zero, smul, build_matrix, inverse, inverse_shift, hsub, hdiv, hpxy3, cpush0, hadd, hmul,
  project_on_triangle, xpush, hdist0,
} from './hyperpoint.ts';
import { cgi } from './geometry.ts';
import { gp_univ_param, gp_loc_mul, gp_loc_add, gp_loc_sub, gp_loc_muli, gp_eudir, gp_get_local_info, gp_get_mapped, gp_in_underlying_geometry, type loc } from './goldberg.ts';
import { dq_clear_all, dq_enqueue_by_matrix, drawcell_subs, master_to_c7_angle, optimized_shift } from './hypgraph.ts';
import { in_wallopt } from './graph.ts';
import { isWall3 } from './graph-wall.ts';
import { setland } from './barriers.ts';
import { set_euland3, euclidAlt, roundTableRadius } from './bigstuff.ts';
import { hrand } from './rand.ts';
import { addMessage } from './basegraph.ts';
import { XLAT } from './language.ts';
import { spin } from './embeddings.ts';
import { kz, fts } from './hprint.ts';
import { ggmatrix } from './geometry2.ts';
import { exit } from './cfile.ts';
import { dont_inverse } from './geometry2.ts';

export type { loc } from './goldberg.ts';

/** struct coord : array<int, 3> */
export type coord = [number, number, number];
/** typedef array<coord, 3> intmatrix */
export type intmatrix = [coord, coord, coord];

export const coordkey = (c: coord): string => c[0] + ',' + c[1] + ',' + c[2];
export const coord_add = (a: coord, b: coord): coord => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const coord_sub = (a: coord, b: coord): coord => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const coord_neg = (a: coord): coord => [-a[0], -a[1], -a[2]];
export const coord_muli = (a: coord, x: number): coord => [x * a[0], x * a[1], x * a[2]];
export const coord_eq = (a: coord, b: coord): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
/** std::array operator< */
export function coord_lt(a: coord, b: coord): boolean {
  for (let i = 0; i < 3; i++) { if (a[i] < b[i]) return true; if (a[i] > b[i]) return false; }
  return false;
}
const intmatrix_eq = (a: intmatrix, b: intmatrix): boolean => coord_eq(a[0], b[0]) && coord_eq(a[1], b[1]) && coord_eq(a[2], b[2]);
const intmatrix_copy = (a: intmatrix): intmatrix => [[...a[0]], [...a[1]], [...a[2]]];
const new_intmatrix = (): intmatrix => [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

export const euc_euzero: coord = [0, 0, 0];
export const euc_eutester: coord = [3, 7, 0];
export function euc_euzeroall(): intmatrix { return new_intmatrix(); }

const main_axes: intmatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

export function euc_octtet_shvid(at: coord): number {
  if (at[0] % 2 === 0) return 0;
  return ((at[0] + at[1] + at[2]) & 2) ? 2 : 1;
}

export function euc_octtet_valid(at: coord): boolean {
  const b = (at[0] & 1) === (at[1] & 1) && (at[0] & 1) === (at[2] & 1);
  if (!b) return false;
  if ((at[0] & 1) === 0) return ((at[0] + at[1] + at[2]) & 2) === 0;
  return true;
}

export function euc_get_shifttable(): coord[] {
  const D0 = main_axes[0];
  const D1 = main_axes[1];
  const D2 = main_axes[2];
  let shifttable: coord[] = [];

  /* for portal spaces... */
  let g = G.geometry;
  if (S7() === 6 && WDIM() === 3) g = gCubeTiling;

  const a = coord_add, s = coord_sub, m = coord_muli, n = coord_neg;
  switch (g) {
    case gCubeTiling:
    case gMengerSponge:
      shifttable = [D0, D1, D2];
      break;

    case gRhombic3:
    case gSierpinskiTet:
      shifttable = [a(D0, D1), a(D0, D2), a(D1, D2), s(D1, D2), s(D0, D2), s(D0, D1)];
      break;

    case gBitrunc3:
      shifttable = [m(D0, 2), m(D1, 2), m(D2, 2), a(a(D0, D1), D2), s(a(D0, D1), D2), s(s(D0, D1), D2), a(s(D0, D1), D2)];
      break;

    case gEuclid:
    case gSierpinski3:
    case gSixFlake:
      shifttable = [D0, D1, s(D1, D0), n(D0), n(D1), s(D0, D1)];
      break;

    case gEuclidSquare:
    case gSierpinski4:
      shifttable = [D0, D1, n(D0), n(D1)];
      break;

    case gOctTet3:
      shifttable = [
        a(a(D0, D1), D2), s(s(D0, D1), D2), s(a(n(D0), D1), D2), a(s(n(D0), D1), D2),
        s(s(n(D0), D1), D2), a(a(n(D0), D1), D2), a(s(D0, D1), D2), s(a(D0, D1), D2),
      ];
      break;

    default:
      throw new hr_exception('euc::get_shifttable() called in geometry that is not euclid3');
  }

  // reverse everything
  const sz = isize(shifttable);
  for (let i = 0; i < sz; i++) shifttable.push(n(shifttable[i]));
  return shifttable.map(c => [...c] as coord);
}

/** struct torus_config */
export class torus_config {
  /** periods entered by the user */
  user_axes: intmatrix = new_intmatrix();
  /** OR'ed flags: 1 -- flip X in 3D, 2 -- flip Y in 3D, 4 -- flip X/Y in 3D, 8 -- Klein bottle in 2D, 16 -- third turn in 3D, 32 -- Hantzsche-Wendt in 3D */
  twisted = 0;
  constructor(user_axes?: intmatrix, twisted?: number) {
    if (user_axes) this.user_axes = intmatrix_copy(user_axes);
    if (twisted !== undefined) this.twisted = twisted;
  }
  clone(): torus_config { return new torus_config(this.user_axes, this.twisted); }
}

/** struct torus_config_full : torus_config */
export class torus_config_full extends torus_config {
  /** optimal representation of the periods */
  optimal_axes: intmatrix = new_intmatrix();
  /** regular axes (?) */
  regular_axes: intmatrix = new_intmatrix();
  /** in 2D: the period vector which is reflected */
  twisted_vec: loc = [0, 0];
  /** in 2D: a vector orthogonal to twisted_vec */
  ortho_vec: loc = [0, 0];
  /** determinant */
  det = 0;
  /** the number of infinite dimensions */
  infinite_dims = 0;
  inverse_axes: intmatrix = new_intmatrix();
  /** for canonicalization on tori */
  hash = new Map<string, number>();
  seq: coord[] = [];
  index = 0;

  override clone(): torus_config_full {
    const r = new torus_config_full(this.user_axes, this.twisted);
    r.optimal_axes = intmatrix_copy(this.optimal_axes);
    r.regular_axes = intmatrix_copy(this.regular_axes);
    r.twisted_vec = [...this.twisted_vec];
    r.ortho_vec = [...this.ortho_vec];
    r.det = this.det;
    r.infinite_dims = this.infinite_dims;
    r.inverse_axes = intmatrix_copy(this.inverse_axes);
    r.hash = new Map(this.hash);
    r.seq = this.seq.map(c => [...c] as coord);
    r.index = this.index;
    return r;
  }

  reset(): void { this.index = 0; this.hash.clear(); this.seq.length = 0; }

  /** find the equivalence class of coo */
  compute_cat(coo: coord): coord {
    let cat: coord = [...euc_euzero];
    const T2 = this.inverse_axes;
    for (let i = 0; i < 3; i++) {
      let val = T2[0][i] * coo[0] + T2[1][i] * coo[1] + T2[2][i] * coo[2];
      if (i < WDIM() - this.infinite_dims) val = gmod(val, this.det);
      cat = coord_add(cat, coord_muli(main_axes[i], val));
    }
    return cat;
  }

  /** add to the tori canonicalization list */
  add(val: coord): void {
    const cat = coordkey(this.compute_cat(val)); if (this.hash.has(cat)) return; this.hash.set(cat, isize(this.seq)); this.seq.push(val);
  }

  /** get the representative on the tori canonicalization list */
  get(x: coord): coord {
    const cat = coordkey(this.compute_cat(x));
    const st = cubemap().shifttable;
    while (!this.hash.has(cat)) {
      if (this.index === isize(this.seq)) throw new hr_exception('no cat in hash');
      const v = this.seq[this.index++];
      for (const s of st) this.add(coord_add(v, s));
    }
    return this.seq[this.hash.get(cat)!];
  }

  /** canonicalize coord x; in case of twisting, adjust d, M, and mirr accordingly (x, d are changed in place;
   *  M and mirr are Refs) */
  canonicalize(x: coord, d: coord, M: { v: transmatrix }, mirr: { v: boolean }): void {
    if (!this.twisted) {
      if (this.infinite_dims === WDIM()) return;
      if (this.infinite_dims === WDIM() - 1) {
        const o = this.optimal_axes;
        while (euc_celldistance_co(coord_add(x, o[0])) <= euc_celldistance_co(x)) set3(x, coord_add(x, o[0]));
        while (euc_celldistance_co(coord_sub(x, o[0])) < euc_celldistance_co(x)) set3(x, coord_sub(x, o[0]));
        return;
      }
      set3(x, this.get(x));
      return;
    }
    const T0 = this.user_axes;
    if (this.twisted & 32) {
      const period = T0[0][0];
      const coo = x;

      for (;;) {
        let restart = false;
        /* These coordinates cause the algorithm below to go in circles. We simply break if they are detected */
        if (coo[0] >= 0 && coo[1] === period - coo[0] && coo[2] === -coo[1] && coo[0] * 2 > period && coo[0] < period) return;
        if (coo[0] * 2 <= -period && coo[0] >= -period && coo[2] === period + coo[0] && coo[2] === -coo[1]) return;

        /* apply periods */
        for (let i = 0; i < 3; i++) {
          const j = (i + 1) % 3;
          const k = (i + 2) % 3;
          const v1 = coo[i] + coo[j];
          const v2 = coo[i] - coo[j];
          if (v1 >= period) {
            coo[i] -= period; coo[j] -= period;
          }
          else if (v1 < -period) {
            coo[i] += period; coo[j] += period;
          }
          else if (v2 >= period) {
            coo[i] -= period; coo[j] += period;
          }
          else if (v2 < -period) {
            coo[i] += period; coo[j] -= period;
          }
          else continue;
          d[j] = -d[j]; d[k] = -d[k];
          coo[j] = -coo[j]; coo[k] = -coo[k];
          const S = tcopy(Id);
          S[j][j] = -1; S[k][k] = -1;
          M.v = tmul(M.v, S);
          restart = true;
          break;
        }
        if (!restart) return;
      }
    }
    // MAXMDIM >= 4
    if (this.twisted & 16) {
      const period = T0[2][2];
      const RotYZX = tcopy(Zero);
      RotYZX[1][0] = 1;
      RotYZX[2][1] = 1;
      RotYZX[0][2] = 1;
      RotYZX[3][3] = 1;
      const coo = x;
      for (;;) {
        const coosum = coo[0] + coo[1] + coo[2];
        if (coosum >= 3 * period) {
          coo[0] -= period; coo[1] -= period; coo[2] -= period;
          [d[0], d[1], d[2]] = [d[1], d[2], d[0]];
          [coo[0], coo[1], coo[2]] = [coo[1], coo[2], coo[0]];
          M.v = tmul(M.v, RotYZX);
        }
        else if (coosum < 0) {
          coo[0] += period; coo[1] += period; coo[2] += period;
          [d[0], d[1], d[2]] = [d[2], d[0], d[1]];
          [coo[0], coo[1], coo[2]] = [coo[2], coo[0], coo[1]];
          M.v = tmul(tmul(M.v, RotYZX), RotYZX);
        }
        else break;
      }
      if (!coord_eq(T0[0], euc_euzero)) {
        while (diagonal_cross(coo, T0[1]) < 0) set3(coo, coord_sub(coo, T0[0]));
        while (diagonal_cross(coo, T0[1]) > 0) set3(coo, coord_add(coo, T0[0]));
        while (diagonal_cross(coo, T0[0]) > 0) set3(coo, coord_sub(coo, T0[1]));
        while (diagonal_cross(coo, T0[0]) < 0) set3(coo, coord_add(coo, T0[1]));
      }
      return;
    }
    if (WDIM() === 3) {
      const coo = x;
      while (coo[2] >= T0[2][2]) {
        coo[2] -= T0[2][2];
        if (this.twisted & 1) { coo[0] *= -1; d[0] *= -1; M.v = tmul(M.v, MirrorX); }
        if (this.twisted & 2) { coo[1] *= -1; d[1] *= -1; M.v = tmul(M.v, MirrorY); }
        if (this.twisted & 4) { [coo[0], coo[1]] = [coo[1], coo[0]]; swap01(M.v); [d[0], d[1]] = [d[1], d[0]]; }
      }
      while (coo[2] < 0) {
        coo[2] += T0[2][2];
        if (this.twisted & 4) { [coo[0], coo[1]] = [coo[1], coo[0]]; [d[0], d[1]] = [d[1], d[0]]; swap01(M.v); }
        if (this.twisted & 1) { coo[0] *= -1; d[0] *= -1; M.v = tmul(M.v, MirrorX); }
        if (this.twisted & 2) { coo[1] *= -1; d[1] *= -1; M.v = tmul(M.v, MirrorY); }
      }
      for (const i of [0, 1])
        if (T0[i][i]) coo[i] = gmod(coo[i], T0[i][i]);
      return;
    }
    else {
      let coo = euc_to_loc(x);
      const ort = gp_loc_mul(ort1(), this.twisted_vec);
      const dsc = euc_dscalar(this.twisted_vec, this.twisted_vec);
      let d0: loc = [d[0], d[1]];
      const h = tmulh(euc_eumove(euc_to_coord(this.twisted_vec)), C0());
      for (;;) {
        const dsx = euc_dscalar(coo, this.twisted_vec);
        if (dsx >= dsc) coo = gp_loc_sub(coo, this.twisted_vec);
        else if (dsx < 0) coo = gp_loc_add(coo, this.twisted_vec);
        else break;
        M.v = tmul(tmul(tmul(M.v, rspintox(h)), MirrorY), spintox(h));
        let s = gp_loc_muli(gp_loc_muli(ort, euc_dscalar(d0, ort)), 2);
        const v = euc_dscalar(ort, ort);
        s = [idiv(s[0], v), idiv(s[1], v)];
        d0 = gp_loc_sub(d0, s);
        s = gp_loc_muli(gp_loc_muli(ort, euc_dscalar(coo, ort)), 2);
        s = [idiv(s[0], v), idiv(s[1], v)];
        coo = gp_loc_sub(coo, s);
        mirr.v = !mirr.v;
      }
      if (!(this.ortho_vec[0] === 0 && this.ortho_vec[1] === 0)) {
        const osc = euc_dscalar(this.ortho_vec, this.ortho_vec);
        for (;;) {
          const dsx = euc_dscalar(coo, this.ortho_vec);
          if (dsx >= osc) coo = gp_loc_sub(coo, this.ortho_vec);
          else if (dsx < 0) coo = gp_loc_add(coo, this.ortho_vec);
          else break;
        }
      }
      d[0] = d0[0]; d[1] = d0[1];
      set3(x, euc_to_coord(coo));
      return;
    }
  }
}

function set3(x: coord, v: coord): void { x[0] = v[0]; x[1] = v[1]; x[2] = v[2]; }

/** EX torus_config eu_input, eu_edit; EX torus_config_full eu (module state: `euc_state.eu_input` ...; the
 *  torus_config_full is replaced by dynamicval in floorshapes.cpp, hence an object with fields) */
export const euc_state = {
  eu_input: new torus_config(),
  eu_edit: new torus_config(),
  eu: new torus_config_full(),
};

/** struct hrmap_euclidean : hrmap_standard */
/** hrmap_euclidean is made on first use (its base class lives in cell.ts, which is not a leaf module) */
function make_hrmap_euclidean() {
  class hrmap_euclidean extends hrmap_standard {
    shifttable: coord[] = [];
    tmatrix: transmatrix[] = [];
    spacemap = new Map<string, heptagon>();
    ispacemap = new Map<heptagon, coord>();
    camelot_center: cell | null = null;

    /** map<gp::loc, struct cdata> eucdata, keyed "x,y" */
    eucdata = new Map<string, cdata>();

    compute_tmatrix(): void {
      cgi().require_basics();
      this.shifttable = euc_get_shifttable();
      this.tmatrix.length = S7();
      for (let i = 0; i < S7(); i++) this.tmatrix[i] = euc_eumove(this.shifttable[i]);
    }

    override on_dim_change(): void {
      this.compute_tmatrix();
    }

    toruscells: cell[] = [];
    override allcells(): cell[] {
      if (closed_manifold() && !G.disksize) {
        if (isize(this.toruscells) === 0) {
          const cl = new celllister(this.getOrigin().c7, 1000, 1000000, null);
          this.toruscells = [...cl.lst];
          cl.destroy();
        }
        return this.toruscells;
      }
      return super.allcells();
    }

    constructor() {
      super();
      this.compute_tmatrix();
      this.camelot_center = null;
      euc_build_torus3_g(G.geometry);
      // CAP_IRR
      if (!euc_valid_irr_torus()) {
        addMessage(XLAT('Error: period mismatch'));
        throw new NotPorted('hrmap_euclidean: eu_input = irr::base_config'); // STAGE3-STUB (irregular.cpp)
      }
    }

    override getOrigin(): heptagon {
      return this.get_at(euc_euzero);
    }

    get_at(at: coord): heptagon {
      const k = coordkey(at);
      const found = this.spacemap.get(k);
      if (found) return found;
      else {
        let type = S7();
        if (G.geometry === gOctTet3 && euc_octtet_shvid(at)) type = 4;
        const h = init_heptagon(type);
        if (!IRREGULAR())
          h.c7 = newCell(type, h);
        // CAP_IRR
        else {
          throw new NotPorted('hrmap_euclidean::get_at: irr::link_to_base'); // STAGE3-STUB (irregular.cpp)
        }
        if (S7() !== 14)
          h.zebraval = gmod(at[0] + at[1] * 2 + at[2] * 4, 5);
        else
          h.zebraval = at[0] & 1;
        this.spacemap.set(k, h);
        this.ispacemap.set(h, [...at]);

        return h;
      }
    }

    override create_step(parent: heptagon, d: number): heptagon {
      let d1 = (d + (S7() >> 1)) % S7();
      const mirr = { v: false };
      const I = { v: tcopy(Id) };
      let dx = d;
      const at = this.ispacemap.get(parent)!;
      const d2 = d1;
      if (G.geometry === gOctTet3) {
        const id = euc_octtet_shvid(at);
        if (id === 2) { dx += 4; d1 &= 3; }
        if (id === 0) { d1 &= 3; }
      }
      const v = coord_add(at, this.shifttable[dx]);
      const st: coord = [...this.shifttable[d2]];
      euc_state.eu.canonicalize(v, st, I, mirr);
      if (euc_state.eu.twisted)
        for (let i = 0; i < S7(); i++) if (coord_eq(this.shifttable[i], st)) d1 = i;

      const h = this.get_at(v);
      h.c.connect(d1, parent, d, mirr.v);
      return h;
    }

    override adj_h(h: heptagon, i: number): transmatrix {
      if (G.geometry === gOctTet3 && euc_octtet_shvid(this.ispacemap.get(h)!) === 2) i += 4;
      if (!euc_state.eu.twisted) return this.tmatrix[i];
      const res = { v: this.tmatrix[i] };
      const id = coord_add(this.ispacemap.get(h)!, this.shifttable[i]);
      const dummy: coord = [...euc_euzero];
      const dm = { v: false };
      euc_state.eu.canonicalize(id, dummy, res, dm);

      return res.v;
    }

    override adj(c: cell, i: number): transmatrix {
      if (dont_inverse()) return this.adj_h(c.master, i);
      if (WDIM() === 3) return this.adj_h(c.master, i);
      else return super.adj(c, i);
    }

    override draw_at(at: cell, where: shiftmatrix): void {
      dq_clear_all();
      dq_enqueue_by_matrix(at.master, smul(where, this.master_relative(G.current_display.precise_center, true)));

      while (G.dq_drawqueue.length) {
        const p = G.dq_drawqueue[0];
        const h = p[0];
        const V = p[1];
        G.dq_drawqueue.shift();

        const c = h.c7;

        const draw = drawcell_subs(c, smul(V, spin(master_to_c7_angle())));
        if (in_wallopt() && isWall3(c) && isize(G.dq_drawqueue) > 1000 && !G.hybrid_pmap) continue;

        if (draw) for (let i = 0; i < h.type; i++) {
          const V1 = smul(V, this.adj_h(h, i));
          // geom3::apply_break_cylinder && cgi.emb->break_cylinder(V, V1): false without an embedding (3D)
          dq_enqueue_by_matrix(h.move(i), optimized_shift(V1));
        }
      }
    }

    protected override relative_matrixh(h2: heptagon, h1: heptagon, hint: hyperpoint): transmatrix {
      const eu = euc_state.eu;
      if (eu.twisted) {
        if (h1 === h2) return Id;
        for (let s = 0; s < S7(); s++) if (h2 === h1.move(s)) return this.adj_h(h1, s);
        const c1 = this.ispacemap.get(h1)!;
        const c2 = this.ispacemap.get(h2)!;
        let T = euc_eumove(coord_sub(c2, c1));

        const I = { v: tcopy(Id) };
        const cs: coord = [...c1];
        for (let s = 0; s < 4; s++) {
          for (let a = -1; a <= 1; a++)
            for (let b = -1; b <= 1; b++) {
              if (b && WDIM() === 2) continue;
              const T1 = tmul(I.v, euc_eumove(coord_add(coord_add(coord_sub(c2, cs), coord_muli(eu.user_axes[0], a)), coord_muli(eu.user_axes[1], b))));
              if (hdist(tC0(T1), hint) < hdist(tC0(T), hint))
                T = T1;
            }
          const co = eu.user_axes[WDIM() - 1];
          set3(cs, coord_add(cs, co));
          I.v = tmul(I.v, euc_eumove(co));
          const dummy: coord = [...euc_euzero];
          const dm = { v: false };
          eu.canonicalize(cs, dummy, I, dm);
        }
        return T;
      }
      let d = coord_sub(this.ispacemap.get(h2)!, this.ispacemap.get(h1)!);
      d = euc_basic_canonicalize(d);
      return euc_eumove(d);
    }

    override get_cellshape(c: cell): unknown {
      if (G.geometry !== gOctTet3) return cgi().heptshape;
      return (cgi().subshapes as unknown[])[this.shvid(c)];
    }

    override pattern_value(c: cell): number {
      if (WDIM() === 2) {
        const p = euc2_coordinates(c);
        if (closed_manifold()) return p[0] + p[1] * (1 << 16);
        return gmod(p[0] - 22 * p[1], 3 * 127);
      }
      else {
        const co = this.ispacemap.get(c.master)!;
        if (closed_manifold()) return co[0] + (co[1] << 10) + (co[2] << 20);
        return gmod(co[0] + 3 * co[1] + 9 * co[2], 3 * 127);
      }
    }

    override shvid(c: cell): number {
      if (G.geometry === gOctTet3)
        return euc_octtet_shvid(this.ispacemap.get(c.master)!);
      return super.shvid(c);
    }

    override ray_iadj(c: cell, i: number): transmatrix {
      if (G.geometry !== gOctTet3) return super.ray_iadj(c, i);
      const v = (this.get_cellshape(c) as { faces_local: hyperpoint[][] }).faces_local[i];
      const h = project_on_triangle(v[0], v[1], v[2]);
      const T = rspintox(h);
      return tmul(tmul(T, xpush(-2 * hdist0(h))), spintox(h));
    }
  }
  return hrmap_euclidean;
}
let hrmap_euclidean_class: ReturnType<typeof make_hrmap_euclidean> | null = null;
function hrmap_euclidean_cls(): ReturnType<typeof make_hrmap_euclidean> { return hrmap_euclidean_class ??= make_hrmap_euclidean(); }
export type hrmap_euclidean = InstanceType<ReturnType<typeof make_hrmap_euclidean>>;

function cubemap(): hrmap_euclidean {
  if (fake_in()) throw new NotPorted('euc::cubemap (fake)'); // FPIU(cubemap()): fake.cpp, a later package
  return G.currentmap as hrmap_euclidean;
}

function eucmap(): hrmap_euclidean {
  return cubemap();
}

export function euc_get_current_shifttable(): coord[] { return cubemap().shifttable; }
export function euc_get_spacemap(): Map<string, heptagon> { return cubemap().spacemap; }
export function euc_get_ispacemap_map(): Map<heptagon, coord> { return cubemap().ispacemap; }
/** get_ispacemap()[h] */
export function euc_get_ispacemap(h: heptagon): coord { return cubemap().ispacemap.get(h) ?? [0, 0, 0]; }
export function euc_get_camelot_center(): { get v(): cell | null; set v(x: cell | null) } {
  const m = cubemap();
  return { get v() { return m.camelot_center; }, set v(x: cell | null) { m.camelot_center = x; } };
}

export function euc_get_at(co: coord): heptagon { return cubemap().get_at(co); }

export function euc_new_map(): hrmap {
  return new (hrmap_euclidean_cls())();
}

export function euc_move_matrix(h: heptagon, i: number): transmatrix {
  return cubemap().adj_h(h, i);
}

export function euc_pseudohept(c: cell): boolean {
  if (cgflags() & qPORTALSPACE) return false;
  const co = euc_get_ispacemap(c.master);
  if (S7() === 12) {
    for (let i = 0; i < 3; i++) if ((co[i] & 1)) return false;
  }
  else {
    for (let i = 0; i < 3; i++) if (!(co[i] & 1)) return false;
  }
  return true;
}

export function euc_dist_alt(c: cell): number {
  if (WDIM() === 2) {
    const v = euc_full_coords2(c);
    return euclidAlt(v[0], v[1]);
  }
  if (G.specialland === laCamelot) return euc_dist_relative(c) + roundTableRadius(c);
  const v = euc_get_ispacemap(c.master);
  if (S7() === 6) return v[2];
  else if (S7() === 12) return idiv(v[0] + v[1] + v[2], 2);
  else return idiv(v[2], 2);
}

export function euc_get_emerald(c: cell): boolean {
  const v: coord = [...euc_get_ispacemap(c.master)];
  let s0 = 0, s1 = 0;
  for (let i = 0; i < 3; i++) {
    v[i] = gmod(v[i], 6);
    const d = Math.min(v[i], 6 - v[i]);
    s0 += Math.min(v[i], 6 - v[i]);
    s1 += 3 - d;
  }
  // if(s0 == s1) println(hlog, "equality");
  return s0 > s1;
}

export function euc_cellvalid(v: coord): boolean {
  if (S7() === 6) return true;
  if (S7() === 12) return (v[0] + v[1] + v[2]) % 2 === 0;
  if (S7() === 14) return v[0] % 2 === v[1] % 2 && v[0] % 2 === v[2] % 2;
  return false;
}

/** celldistance(coord v) */
export function euc_celldistance_co(v0: coord): number {
  const v: coord = [...v0];
  if (S7() === 6)
    return Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]);
  else {
    for (let i = 0; i < 3; i++) v[i] = Math.abs(v[i]);
    v.sort((a, b) => a - b);
    let dist = 0;
    if (S7() === 12) {
      const d = v[1] - v[0]; v[1] -= d; v[2] -= d;
      dist += d;
      const m = Math.min((v[2] - v[0]), v[0]);
      dist += 2 * m;
      v[0] -= m; v[1] -= m; v[2] -= m * 2;
      if (v[0])
        dist += idiv(v[0] + v[1] + v[2], 2);
      else
        dist += v[2];
    }
    else {
      dist = v[0] + idiv(v[1] - v[0], 2) + idiv(v[2] - v[0], 2);
    }
    return dist;
  }
}

export function euc_celldistance(c1: cell, c2: cell): number {
  const cm = cubemap();
  if (GDIM() === 2)
    return euc_dist(euc_full_coords2(c1), euc_full_coords2(c2));
  return euc_celldistance_co(euc_basic_canonicalize(coord_sub(cm.ispacemap.get(c1.master)!, cm.ispacemap.get(c2.master)!)));
}

export function euc_set_land(c: cell): void {
  if (cgflags() & qPORTALSPACE) return;
  setland(c, G.specialland);
  const co = euc_get_ispacemap(c.master);

  let dv = 1;
  if (G.geometry !== gCubeTiling) dv = 2;

  let hash = 0;
  for (let a = 0; a < 3; a++) hash = (Math.imul(1317, hash) + idiv(co[a], 4)) | 0;

  set_euland3(c, co[0] * 120, co[1] * 120, idiv(co[1] + co[2], dv), hash);
}

export function euc_dist_relative(c: cell): number {
  const m = cubemap();
  const r = roundTableRadius(null!);
  const start = m.gamestart();
  if (!m.camelot_center) {
    m.camelot_center = start;
    while (euc_celldistance(m.camelot_center, start) < r + 5)
      m.camelot_center = m.camelot_center.cmove(hrand(m.camelot_center.type));
  }

  return euc_celldistance(m.camelot_center, c) - r;
}

/* quotient spaces */

function determinant(T: intmatrix): number {
  let det = 0;
  for (let i = 0; i < 3; i++)
    det += T[0][i] * T[1][(i + 1) % 3] * T[2][(i + 2) % 3];
  for (let i = 0; i < 3; i++)
    det -= T[0][i] * T[1][(i + 2) % 3] * T[2][(i + 1) % 3];
  return det;
}

function scaled_inverse(T: intmatrix): intmatrix {
  const T2 = new_intmatrix();
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      T2[j][i] = (T[(i + 1) % 3][(j + 1) % 3] * T[(i + 2) % 3][(j + 2) % 3] - T[(i + 1) % 3][(j + 2) % 3] * T[(i + 2) % 3][(j + 1) % 3]);
  return T2;
}

export function euc_torus3(x: number, y: number, z: number): torus_config {
  const T0 = euc_euzeroall();
  T0[0][0] = x; T0[1][1] = y; T0[2][2] = z;
  return new torus_config(T0, 0);
}

export function euc_clear_torus3(): torus_config {
  return new torus_config(euc_euzeroall(), 0);
}

export function euc_valid_third_turn(m: intmatrix): boolean {
  if (m[0][2] !== -m[0][0] - m[0][1]) return false;
  if (m[1][0] !== m[0][1]) return false;
  if (m[1][1] !== m[0][2]) return false;
  if (m[1][2] !== m[0][0]) return false;
  if (m[2][0] !== m[2][1]) return false;
  if (m[2][0] !== m[2][2]) return false;
  return true;
}

export function euc_make_hantzsche_wendt(v: number): torus_config {
  const im = new_intmatrix();
  for (let i = 0; i < 3; i++) {
    im[i][i] = v;
    im[i][(i + 1) % 3] = v;
  }
  return new torus_config(im, 32);
}

export function euc_valid_hantzsche_wendt(m: intmatrix): boolean {
  return m[0][0] > 0 && intmatrix_eq(m, euc_make_hantzsche_wendt(m[0][0]).user_axes);
}

export function euc_make_third_turn(a: number, b: number, c: number): torus_config {
  const T0 = new_intmatrix();
  T0[0][0] = a;
  T0[0][1] = b;
  T0[2][0] = c;
  T0[0][2] = -T0[0][0] - T0[0][1];
  T0[1][0] = T0[0][1];
  T0[1][1] = T0[0][2];
  T0[1][2] = T0[0][0];
  T0[2][1] = T0[2][2] = c;
  return new torus_config(T0, 8);
}

export function euc_make_quarter_turn(a: number, b: number, c: number): torus_config {
  const T0 = euc_euzeroall();
  T0[0][0] = a;
  T0[0][1] = b;
  T0[2][0] = c;
  return new torus_config(T0, 5);
}

export function euc_valid_irr_torus(): boolean {
  // CAP_IRR
  if (!IRREGULAR()) return true;
  if (euc_state.eu.twisted) return false;
  throw new NotPorted('valid_irr_torus: irr::base_config'); // STAGE3-STUB (irregular.cpp)
}

/** build_torus3(eGeometry g) */
export function euc_build_torus3_g(g: number): void {
  const eu = euc_state.eu, eu_input = euc_state.eu_input;

  const dim = ginf[g].g.gameplay_dimension;

  eu.user_axes = intmatrix_copy(eu_input.user_axes);
  if (dim === 2) eu.user_axes[2] = [...euc_euzero];

  eu.optimal_axes = intmatrix_copy(eu.user_axes);

  const oa = eu.optimal_axes;
  const swap = (i: number, j: number): void => { const t = oa[i]; oa[i] = oa[j]; oa[j] = t; };
  again: for (;;) {
    for (let i = 0; i < dim; i++) if (coord_lt(oa[i], euc_euzero)) oa[i] = coord_neg(oa[i]);
    if (coord_lt(oa[0], oa[1])) swap(0, 1);
    if (coord_lt(oa[1], oa[dim - 1])) swap(1, dim - 1);
    if (coord_lt(oa[0], oa[1])) swap(0, 1);
    for (let i = 0; i < 3; i++) {
      const i1 = (i + 1) % 3;
      const i2 = (i + 2) % 3;
      for (let a = -10; a <= 10; a++)
        for (let b = -10; b <= 10; b++) {
          const cand = coord_add(coord_add(oa[i], coord_muli(oa[i1], a)), coord_muli(oa[i2], b));
          if (euc_celldistance_co(cand) < euc_celldistance_co(oa[i])) {
            oa[i] = cand;
            continue again;
          }
        }
    }
    break;
  }

  eu.regular_axes = intmatrix_copy(eu.optimal_axes);
  eu.infinite_dims = dim;
  for (let i = 0; i < dim; i++) if (!coord_eq(eu.optimal_axes[i], euc_euzero)) eu.infinite_dims--;

  let attempt = 0;
  for (;;) {
    for (let i = dim - eu.infinite_dims; i < 3; i++)
      eu.regular_axes[i] = [...main_axes[(attempt + i) % 3]];

    eu.det = determinant(eu.regular_axes);
    if (eu.det === 0) {
      attempt++;
      if (attempt === 3) {
        // println(hlog, "weird singular!\n");
        exit(1);
      }
      continue;
    }
    break;
  }

  if (eu.det < 0) eu.det = -eu.det;

  eu.inverse_axes = scaled_inverse(eu.regular_axes);
  eu.reset();
  eu.add([...euc_euzero]);

  eu.twisted = eu_input.twisted;
  if (dim === 3) {
    const T0 = eu.user_axes;
    // for OctTet3 just force all divisible by 4, for simplicity
    if (g === gOctTet3)
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
        if (T0[a][b] & 3)
          eu.twisted = 0;
    if (euc_valid_third_turn(eu.user_axes)) {
      eu.twisted &= 16;
      if (g === gRhombic3 && (T0[2][2] & 1)) eu.twisted = 0;
      if (g === gBitrunc3 && (T0[0][0] & 1)) eu.twisted = 0;
      if (g === gBitrunc3 && (T0[1][1] & 1)) eu.twisted = 0;
    }
    else if (euc_valid_hantzsche_wendt(eu.user_axes)) {
      eu.twisted &= 32;
      if (g === gBitrunc3 && (T0[0][0] & 1)) eu.twisted = 0;
    }
    else {
      eu.twisted &= 7;
      if (g !== gCubeTiling && ((T0[0][0] + T0[2][2]) & 1)) eu.twisted &= ~1;
      if (g !== gCubeTiling && ((T0[1][1] + T0[2][2]) & 1)) eu.twisted &= ~2;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
        if (i !== j && T0[i][j]) eu.twisted = 0;
      if (T0[2][2] === 0) eu.twisted = 0;
      if (T0[0][0] !== T0[1][1]) eu.twisted &= 3;
    }
  }
  else {
    eu.twisted &= 8;
    eu.twisted_vec = euc_to_loc(eu.user_axes[1]);
    eu.ortho_vec = euc_to_loc(eu.user_axes[0]);
    if (eu.twisted_vec[0] === 0 && eu.twisted_vec[1] === 0) eu.twisted = 0;
    if (euc_chiral(eu.twisted_vec)) eu.twisted = 0;
    if (euc_dscalar(eu.twisted_vec, eu.ortho_vec))
      eu.twisted = 0;
  }

  const set_flag = (f: bigint, b: boolean): void => { if (b) ginf[g].flags |= f; else ginf[g].flags &= ~f; };
  set_flag(qANYQ, eu.infinite_dims < dim);
  set_flag(qCLOSED, eu.infinite_dims === 0);
  set_flag(qSMALL, eu.infinite_dims === 0 && eu.det <= 4096);
  let nonori = false;
  if (eu.twisted & 1) nonori = !nonori;
  if (eu.twisted & 2) nonori = !nonori;
  if (eu.twisted & 4) nonori = !nonori;
  if (eu.twisted & 8) nonori = !nonori;
  set_flag(qNONORIENTABLE, nonori);
}

/** build_torus3() */
export function euc_build_torus3(): void {
  for (const g of [gEuclid, gEuclidSquare, gCubeTiling, gRhombic3, gBitrunc3, gOctTet3])
    euc_build_torus3_g(g);
}

function swap01(M: transmatrix): void {
  for (let i = 0; i < 4; i++) { const t = M[i][0]; M[i][0] = M[i][1]; M[i][1] = t; }
}

function ort1(): loc { return (S3() === 3 ? [1, -2] : [0, 1]); }

function diagonal_cross(a: coord, b: coord): number {
  return a[0] * b[1] + a[1] * b[2] + a[2] * b[0]
    - b[0] * a[1] - b[1] * a[2] - b[2] * a[0];
}

export function euc_basic_canonicalize(x0: coord): coord {
  const x: coord = [...x0];
  const M = { v: tcopy(Id) };
  const dummy: coord = [...euc_euzero];
  const dm = { v: false };
  euc_state.eu.canonicalize(x, dummy, M, dm);
  return x;
}

export function euc_prepare_torus3(): void {
  euc_state.eu_edit = euc_state.eu_input.clone();
}

function on_periods(a: loc, b: loc): intmatrix {
  const res = new_intmatrix();
  res[0][0] = a[0];
  res[0][1] = a[1];
  res[1][0] = b[0];
  res[1][1] = b[1];
  res[2][2] = 1;
  return res;
}

export function euc_single_row_torus(qty: number, dy: number): torus_config {
  return new torus_config(on_periods([dy, -1], [qty, 0]), 0);
}

export function euc_regular_torus(p: loc): torus_config {
  return new torus_config(on_periods(p, gp_loc_mul([0, 1], p)), 0);
}

export function euc_rectangular_torus(x: number, y: number, klein: boolean): torus_config {
  if (S3() === 3) y = idiv(y, 2);
  return new torus_config(on_periods(gp_loc_mul(ort1(), [y, 0]), [x, 0]), klein ? 8 : 0);
}

export function euc_torus_config_eq(a: torus_config, b: torus_config): boolean {
  return intmatrix_eq(a.user_axes, b.user_axes) && a.twisted === b.twisted;
}

/** EX int quotient_size = 2 */
export const euc_quotient = { size: 2 };

// CAP_COMMANDLINE: euArgs, registered by register_euclid (prio 100)
import { arg_argis, arg_shift, arg_argi, PHASEFROM } from './commandline.ts';
import { stop_game } from './system.ts';
import { addHook } from './hyper.ts';

function euArgs(): number {
  const eu_input = (): torus_config => euc_state.eu_input;
  if (arg_argis('-t3')) {
    if (PHASEFROM(2)) return 2;
    stop_game();
    const T0 = eu_input().user_axes;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        arg_shift(); T0[i][j] = arg_argi();
      }
    euc_build_torus3();
  }
  else if (arg_argis('-t2')) {
    if (PHASEFROM(2)) return 2;
    stop_game();
    const T0 = eu_input().user_axes;
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        arg_shift(); T0[i][j] = arg_argi();
      }
    arg_shift(); eu_input().twisted = arg_argi();
    euc_build_torus3();
  }
  else if (arg_argis('-twistthird')) {
    if (PHASEFROM(2)) return 2;
    stop_game();
    arg_shift(); const a = arg_argi();
    arg_shift(); const b = arg_argi();
    arg_shift(); const c = arg_argi();
    euc_state.eu_input = euc_make_third_turn(a, b, c);
    euc_build_torus3();
  }
  else if (arg_argis('-twist3')) {
    if (PHASEFROM(2)) return 2;
    stop_game();
    const T0 = eu_input().user_axes;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) T0[i][j] = 0;

    for (let i = 0; i < 3; i++) {
      arg_shift(); T0[i][i] = arg_argi();
    }
    arg_shift(); eu_input().twisted = arg_argi();
    euc_build_torus3();
  }
  else if (arg_argis('-hw')) {
    if (PHASEFROM(2)) return 2;
    stop_game();
    arg_shift();
    euc_state.eu_input = euc_make_hantzsche_wendt(arg_argi());
    euc_build_torus3();
  }
  else if (arg_argis('-twisttest')) {
    throw new NotPorted('-twisttest (a debugging check)');
  }
  else return 1;
  return 0;
}

export function register_euclid(): void {
  addHook(G.hooks_args, 100, euArgs);
}

export function euc_dscalar(e1: loc, e2: loc): number {
  return 2 * (e1[0] * e2[0] + e1[1] * e2[1]) + (S3() === 3 ? e1[0] * e2[1] + e2[0] * e1[1] : 0);
}

export function euc_dsquare(e: loc): number { return idiv(euc_dscalar(e, e), 2); }

export function euc_dcross(e1: loc, e2: loc): number {
  return e1[0] * e2[1] - e1[1] * e2[0];
}

export function euc_full_coords2(c: cell): loc {
  if (INVERSE()) {
    const c1 = gp_get_mapped(c);
    return gp_in_underlying_geometry(() => euc_full_coords2(c1));
  }
  const ans = euc_get_ispacemap(c.master);
  if (S7() === 4 && BITRUNCATED()) {
    if (c === c.master.c7) return gp_loc_mul(euc_to_loc(ans), [1, 1]);
    else {
      const res = gp_loc_add(euc_full_coords2(c.cmove(0)), euc_full_coords2(c.cmove(4)));
      return [idiv(res[0], 2), idiv(res[1], 2)];
    }
  }
  if (BITRUNCATED())
    return gp_loc_add(gp_loc_mul(euc_to_loc(ans), [1, 1]), (c === c.master.c7 ? [0, 0] : gp_eudir((c.c.spin(0) + 4) % 6)));
  if (GOLDBERG()) {
    const li = gp_get_local_info(c);
    let shift: loc = [0, 0];
    if (li.first_dir >= 0) shift = gp_loc_mul(gp_eudir(li.last_dir), li.relative);
    return gp_loc_add(gp_loc_mul(euc_to_loc(ans), G.gp_param), shift);
  }
  return euc_to_loc(ans);
}

/** this is slow, but we use it only for small p's */
export function euc_at(p: loc): cell {
  const cw = new cellwalker(G.currentmap.gamestart(), 0, false);
  let a = p[0], b = p[1];
  while (a--) cw.addRevStep();
  cw.add(1);
  while (b--) cw.addRevStep();
  return cw.at;
}

export function euc_to_coord(p: loc): coord { return [p[0], p[1], 0]; }

export function euc_sdxy(): loc { return gp_loc_mul(euc_to_loc(euc_state.eu.user_axes[1]), gp_univ_param()); }

export function euc_coord_display(V: shiftmatrix, c: cell): [boolean, string] {
  if (c !== c.master.c7) return [false, ''];
  const hx = tmulh(euc_eumove(main_axes[0]), C0());
  const hy = tmulh(euc_eumove(main_axes[1]), C0());
  const hz = WDIM() === 2 ? C0() : tmulh(euc_eumove(main_axes[2]), C0());
  const h = (tmulh(tmul(inverse(build_matrix(hx, hy, hz, C03)), inverse_shift(ggmatrix(G.cwt.at.master.c7), V)), C0()));

  if (WDIM() === 3)
    return [true, fts(kz(h[0])) + ',' + fts(kz(h[1])) + ',' + fts(kz(h[2]))];
  else
    return [true, fts(kz(h[0])) + ',' + fts(kz(h[1]))];
}

export function euc_to_loc(v: coord): loc { return [v[0], v[1]]; }

export function euc_get_cdata(): Map<string, cdata> { return eucmap().eucdata; }

export function euc_eumove(co: coord): transmatrix {
  const q3 = Math.sqrt(3);
  if (WDIM() === 3) {
    return eupush3(co[0], co[1], co[2]);
  }
  const Mat = tcopy(Id);
  if (a4()) {
    Mat[0][2] += co[0] * cgi().tessf;
    Mat[1][2] += co[1] * cgi().tessf;
  }
  else {
    Mat[0][2] += (co[0] + co[1] * .5) * cgi().tessf;
    Mat[1][2] += co[1] * q3 / 2 * cgi().tessf;
  }
  if (embedded_plane()) throw new NotPorted('eumove: cgi.emb->base_to_actual (embedded plane)'); // STAGE3-STUB (3D)
  return Mat;
}

export function euc_eumove_loc(co: loc): transmatrix { return euc_eumove(euc_to_coord(co)); }

export function euc_chiral(g: loc): boolean {
  const x = g[0];
  const y = g[1];
  if (x === 0) return false;
  if (y === 0) return false;
  if (x + y === 0) return false;
  if (x === y) return false;
  if (S3() === 3 && y === -2 * x) return false;
  if (S3() === 3 && x === -2 * y) return false;
  return true;
}

/** twist_once(gp::loc coo): takes coo by value, so it changes nothing (kept as in the original) */
export function euc_twist_once(coo: loc): void {
  coo = gp_loc_sub(coo, gp_loc_mul(euc_state.eu.twisted_vec, gp_univ_param()));
  if (euc_state.eu.twisted & 8) {
    const ort = gp_loc_mul(gp_loc_mul(ort1(), euc_state.eu.twisted_vec), gp_univ_param());
    let s = gp_loc_muli(gp_loc_muli(ort, euc_dscalar(coo, ort)), 2);
    const v = euc_dscalar(ort, ort);
    s = [idiv(s[0], v), idiv(s[1], v)];
    coo = gp_loc_sub(coo, s);
  }
}

/** dist(int sx, int sy, bool reduce = true) */
export function euc_dist_xy(sx: number, sy: number, reduce = true): number {
  const z0 = Math.abs(sx);
  const z1 = Math.abs(sy);
  if (a4() && BITRUNCATED())
    return (z0 === z1 && z0 > 0 && !reduce) ? z0 + 1 : Math.max(z0, z1);
  if (a4()) return z0 + z1;
  const z2 = Math.abs(sx + sy);
  return Math.max(Math.max(z0, z1), z2);
}

/** dist(gp::loc a, gp::loc b) */
export function euc_dist(a: loc, b: loc): number {
  return euc_dist_xy(a[0] - b[0], a[1] - b[1], ((a[0] ^ a[1]) & 1) !== 0);
}

export function euc_cyldist(a: loc, b: loc): number {
  a = euc_to_loc(euc_basic_canonicalize(euc_to_coord(a)));
  b = euc_to_loc(euc_basic_canonicalize(euc_to_coord(b)));

  if (!quotient()) return euc_dist(a, b);

  let best = 0;
  for (let sa = 0; sa < 16; sa++) {
    let _a = a, _b = b;
    if (sa & 1) euc_twist_once(_a);
    if (sa & 2) euc_twist_once(_b);
    if (sa & 4) _a = gp_loc_add(_a, gp_loc_mul(euc_state.eu.ortho_vec, gp_univ_param()));
    if (sa & 8) _b = gp_loc_add(_b, gp_loc_mul(euc_state.eu.ortho_vec, gp_univ_param()));
    const val = euc_dist(_a, _b);
    if (sa === 0 || val < best) best = val;
  }

  return best;
}

/** generate(): the 3D cell shapes (MAXMDIM >= 4) */
export function euc_generate(): void {
  throw new NotPorted('euc::generate (3D cell shapes)'); // STAGE3-STUB (the 3D package)
}

/** @brief returns true if the current geometry is based on this module
 *  (For example, Archimedean, kite, or fake with underlying non-Euclidean geometry returns false) */
export function euc_in(dim?: number, s7?: number): boolean {
  if (dim !== undefined) {
    if (s7 !== undefined) return euc_in(dim) && S7() === s7;
    return euc_in() && WDIM() === dim;
  }
  if (fake_in()) throw new NotPorted('euc::in (fake)'); // FPIU(in()): fake.cpp
  if (G.geometry === gCubeTiling && (/* reg3::cubes_reg3 */ false || !PURE())) return false;
  if ((cgflags() & qEXPERIMENTAL) !== 0n) return false;
  return euclid() && standard_tiling();
}

export function euc2_coordinates(c: cell): loc {
  if (euc_in()) return euc_full_coords2(c);
  const h = tmulh(calc_relative_matrix(c, G.currentmap.gamestart(), C0()), C0());
  return [Math.floor(h[0]), Math.floor(h[1])];
}
import { calc_relative_matrix } from './geometry2.ts';

// unused helpers kept for the 3D package (euc::generate)
void hsub; void hdiv; void hpxy3; void cpush0; void hadd; void hmul; void among;

// --- stage 3, package G1: the Euclidean quotient menu (show_fundamental, show_torus3) ---
import { initquickqueue, quickqueue, queueline } from './drawing.ts';
import { gamescreen, sm } from './graph.ts';
import {
  dialog_init_t, dialog_addBreak, dialog_addInfo, dialog_addBoolItem, dialog_add_action, dialog_addItem,
  dialog_editNumber, dialog_get_di, dialog_addBack, dialog_display, dialog_add_key_action, diBreak,
} from './dialogs.ts';
import { displayfr } from './basegraph.ts';
import { its } from './hprint.ts';
import { set_geometry, set_variation, start_game } from './system.ts';
import { eVariation as eVariationT } from './classes.ts';
import { rotate_view } from './hypgraph.ts';
import { eqmatrix } from './hyperpoint.ts';
import { smulh, hsub as hsub1, hadd as hadd1, hmul as hmul1, hdiv as hdiv1, type shiftpoint } from './hyperpoint.ts';
import { ginf as ginf1, gCubeTiling as gCube, gRhombic3 as gRh, gBitrunc3 as gBi, gOctTet3 as gOT } from './classes.ts';
import { XLAT as XL } from './language.ts';

const chE = (c: string): number => c.charCodeAt(0);

export function euc_show_fundamental(): void {
  initquickqueue();
  const M = ggmatrix(G.cwt.at);
  const h0 = smulh(M, C0());
  const T_edit = euc_state.eu_edit.user_axes;
  const ha = tmulh(M.T, hdiv1(hsub1(tmulh(euc_eumove(T_edit[0]), C0()), C0()), 2));
  const hb = tmulh(M.T, hdiv1(hsub1(tmulh(euc_eumove(T_edit[1]), C0()), C0()), 2));
  const sp = (h: hyperpoint): shiftpoint => ({ h, shift: h0.shift });
  const P = (a: number, b: number, _c: number, hc: hyperpoint): shiftpoint =>
    sp(hadd1(hadd1(hadd1(h0.h, hmul1(ha, a)), hmul1(hb, b)), hc));
  if (WDIM() === 3) {
    const hc = tmulh(M.T, hdiv1(hsub1(tmulh(euc_eumove(T_edit[2]), C0()), C0()), 2));
    const pt = (x: hyperpoint[]): shiftpoint => sp(x.reduce((s, v) => hadd1(s, v), h0.h));
    for (const d of [-1, 1]) for (const e of [-1, 1]) {
      queueline(pt([hmul1(ha, d), hmul1(hb, e), hmul1(hc, -1)]), pt([hmul1(ha, d), hmul1(hb, e), hc]), 0xFFFFFFFF);
      queueline(pt([hmul1(hb, d), hmul1(hc, e), hmul1(ha, -1)]), pt([hmul1(hb, d), hmul1(hc, e), ha]), 0xFFFFFFFF);
      queueline(pt([hmul1(hc, d), hmul1(ha, e), hmul1(hb, -1)]), pt([hmul1(hc, d), hmul1(ha, e), hb]), 0xFFFFFFFF);
    }
  }
  else {
    const z = [0, 0, 0, 0];
    queueline(P(1, 1, 0, z), P(1, -1, 0, z), 0xFFFFFFFF);
    queueline(P(-1, 1, 0, z), P(-1, -1, 0, z), 0xFFFFFFFF);
    queueline(P(1, 1, 0, z), P(-1, 1, 0, z), 0xFFFFFFFF);
    queueline(P(1, -1, 0, z), P(-1, -1, 0, z), 0xFFFFFFFF);
  }

  quickqueue();
}

function torus_config_option(name: string, key: number, tc: torus_config): void {
  dialog_addBoolItem(name, euc_torus_config_eq(euc_state.eu_edit, tc) && PURE(), key);
  dialog_add_action(() => {
    stop_game();
    euc_state.eu_input = tc.clone(); euc_state.eu_edit = tc.clone();
    set_variation(eVariationT.pure);
    start_game();
  });
}

export function euc_show_torus3(): void {
  const dim = WDIM();
  const T_edit = euc_state.eu_edit.user_axes;
  G.cmode = sm.SIDE | sm.MAYDARK | sm.TORUSCONFIG;
  gamescreen();
  dialog_init_t(XL('Euclidean quotient spaces'));

  for (let y = 0; y < dim + 1; y++)
    dialog_addBreak(100);

  dialog_addInfo(XL('columns specify periods'));
  dialog_addInfo(XL('(vectors you need to take to get back to start)'));

  dialog_addBreak(50);

  euc_show_fundamental();
  if (dim === 3) {
    let nondiag = false;
    for (let i = 0; i < dim; i++)
      for (let j = 0; j < dim; j++)
        if (T_edit[i][j] && i !== j) nondiag = true;

    if (euc_valid_third_turn(T_edit)) {
      const g = G.geometry;
      if (g === gCube ||
        (g === gRh && T_edit[2][2] % 2 === 0) ||
        (g === gBi && T_edit[0][0] % 2 === 0 && T_edit[1][1] % 2 === 0))
        dialog_addBoolItem(XL('third-turn space'), !!(euc_state.eu_edit.twisted & 16), chE('x'));
      else
        dialog_addBoolItem(XL('make it even'), !!(euc_state.eu_edit.twisted & 16), chE('x'));
      dialog_add_action(() => { euc_state.eu_edit.twisted ^= 16; });
    }

    if (euc_valid_hantzsche_wendt(T_edit)) {
      const g = G.geometry;
      if (g === gCube || g === gRh || (g === gBi && T_edit[0][0] % 2 === 0))
        dialog_addBoolItem(XL('Hantzsche-Wendt space'), !!(euc_state.eu_edit.twisted & 32), chE('x'));
      else
        dialog_addBoolItem(XL('make it even'), !!(euc_state.eu_edit.twisted & 32), chE('x'));
      dialog_add_action(() => { euc_state.eu_edit.twisted ^= 32; });
    }

    if (nondiag) {
      dialog_addInfo(XL('twisting implemented only for diagonal matrices'));
      dialog_addInfo(XL('or for columns : (A,B,C), (B,C,A), (D,D,D) where A+B+C=0'));
      dialog_addBreak(200);
    }
    else if (T_edit[dim - 1][dim - 1] === 0) {
      dialog_addInfo(XL('nothing to twist'));
      dialog_addInfo(XL('change the bottom left corner'));
      dialog_addBreak(100);
    }
    else {
      const g = G.geometry;
      if (g === gCube || (T_edit[0][0] + T_edit[2][2]) % 2 === 0)
        dialog_addBoolItem(XL('flip X coordinate'), !!(euc_state.eu_edit.twisted & 1), chE('x'));
      else
        dialog_addBoolItem(XL('flipping X impossible'), !!(euc_state.eu_edit.twisted & 1), chE('x'));
      dialog_add_action(() => { euc_state.eu_edit.twisted ^= 1; });

      if (g === gCube || (T_edit[1][1] + T_edit[2][2]) % 2 === 0)
        dialog_addBoolItem(XL('flip Y coordinate'), !!(euc_state.eu_edit.twisted & 2), chE('y'));
      else
        dialog_addBoolItem(XL('flipping Y impossible'), !!(euc_state.eu_edit.twisted & 2), chE('y'));
      dialog_add_action(() => { euc_state.eu_edit.twisted ^= 2; });

      if (T_edit[0][0] === T_edit[1][1])
        dialog_addBoolItem(XL('swap X and Y'), !!(euc_state.eu_edit.twisted & 4), chE('z'));
      else
        dialog_addBoolItem(XL('swapping impossible'), !!(euc_state.eu_edit.twisted & 4), chE('z'));
      dialog_add_action(() => { euc_state.eu_edit.twisted ^= 4; });
    }
    dialog_addBreak(50);
    dialog_addItem('special manifolds', chE('S'));
    dialog_add_action(() => {
      dialog_editNumber({ get v() { return euc_quotient.size; }, set v(x: number) { euc_quotient.size = x; } }, 1, 12, 1, 2, 'special manifold size', '');
      dialog_get_di().extra_options = () => {
        const q = euc_quotient.size;
        torus_config_option(XL('third-turn space'), chE('A'), euc_make_third_turn(q, 0, q));
        torus_config_option(XL('quarter-turn space'), chE('B'), euc_make_quarter_turn(q, 0, q));
        torus_config_option(XL('Hantzsche-Wendt space'), chE('C'), euc_make_hantzsche_wendt(q));
      };
    });
  }
  else {
    if (T_edit[1][0] === 0 && T_edit[1][1] === 0)
      dialog_addInfo(XL('change the second column for Möbius bands and Klein bottles'));
    else if (euc_chiral(euc_to_loc(T_edit[1])))
      dialog_addInfo(XL('second period is chiral -- cannot be mirrored'));
    else if (euc_dscalar(euc_to_loc(T_edit[1]), euc_to_loc(T_edit[0])))
      dialog_addInfo(XL('periods must be orthogonal for mirroring'));
    else {
      dialog_addBoolItem(XL('mirror flip in the second period'), !!(euc_state.eu_edit.twisted & 8), chE('x'));
      dialog_add_action(() => { euc_state.eu_edit.twisted ^= 8; });
    }

    dialog_addBreak(50);
    torus_config_option(XL('single-cell torus'), chE('A'), euc_regular_torus([1, 0]));
    torus_config_option(XL('large regular torus'), chE('B'), euc_regular_torus([12, 0]));
    torus_config_option(XL('Klein bottle'), chE('C'), euc_rectangular_torus(12, 6, true));
    torus_config_option(XL('cylinder'), chE('D'), euc_rectangular_torus(6, 0, false));
    torus_config_option(XL('Möbius band'), chE('E'), euc_rectangular_torus(6, 0, true));
    if (S3() === 3) torus_config_option(XL('seven-colorable torus'), chE('F'), euc_regular_torus([1, 2]));
    if (S3() === 3) torus_config_option(XL('HyperRogue classic torus'), chE('G'), euc_single_row_torus(381, -22));
    torus_config_option(XL('no quotient'), chE('H'), euc_rectangular_torus(0, 0, false));
  }

  dialog_addBreak(50);
  dialog_addBoolItem(XL('standard rotation'), eqmatrix(G.models_euclidean_spin, Id), chE('s'));
  dialog_add_action(() => { rotate_view(G.models_euclidean_spin); });

  // CAP_RUG
  if (GDIM() === 2) {
    dialog_addBoolItem(XL('hypersian rug mode'), G.rug_rugged, chE('u'));
    dialog_add_action(() => { addMessage(XL('not available in this version yet')); }); // rug::select (rug.cpp: a later package; deviation)
  }

  dialog_addBreak(50);

  let xch = chE('p');
  for (let g of [gCube, gRh, gBi, gOT]) {
    if (dim === 2) g = G.geometry;
    dialog_addItem(XL(ginf1[g].menu_displayed_name), xch++);
    const gg = g;
    dialog_add_action(() => {
      stop_game();
      set_geometry(gg);
      euc_state.eu_input = euc_state.eu_edit.clone();
      start_game();
    });
    if (dim === 2) break;
  }

  dialog_addBreak(50);
  dialog_addBack();
  dialog_display();

  let i = -1;
  for (const v of G.dialog_items) if (v.type === diBreak) {
    if (i >= 0 && i < dim) {
      for (let j = 0; j < dim; j++) {
        const c = chE('a') + i * 3 + j;
        if (displayfr(G.dialog_dcenter + G.dialog_dfspace * 4 * (j - (dim - 1.) / 2), v.position, 2, G.dialog_dfsize, its(T_edit[j][i]), 0xFFFFFF, 8))
          G.getcstat = c;
        const ii = i, jj = j;
        dialog_add_key_action(c, () => {
          const T = euc_state.eu_edit.user_axes;
          dialog_editNumber({ get v() { return T[jj][ii]; }, set v(x: number) { T[jj][ii] = x; } }, -10, +10, 1, 0, '', XL(
            'This matrix lets you play on the quotient spaces of three-dimensional. ' +
            'Euclidean space. Every column specifies a translation vector which ' +
            'takes you back to the starting point. For example, if you put ' +
            'set 2, 6, 0 on the diagonal, you get back to the starting point ' +
            'if you move 2 steps in the X direction, 6 steps in the Y direction ' +
            '(the quotient space is infinite in the Z direction).\n\n' +
            'You can also introduce twists for diagonal matrices: after going ' +
            'the given number of steps in the Z direction, the space is also ' +
            "mirrored or rotated. (More general 'twisted' spaces are currently " +
            'not implemented.)',
          ),
          );
          dialog_get_di().extra_options = euc_show_fundamental;
        });
      }
    }
    i++;
  }
}
