// floorshapes.cpp of HyperRogue 13.1o: adjusting the floor shapes to various geometries.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port (stage 2, package D2).
//
// The floor shapes of a cell (plain: shFloor, shFullFloor, shTriheptaFloor, ...; Escher: shStarFloor, ...) are
// generated when a cell of that shape id (shvid) is first drawn: ensure_floorshape_generated ->
// generate_floorshapes_for, then the new vertices go to ourshape (extra_vertices). The member functions of
// geometry_information take `this` (geometry.ts binds them). Ported: the standard geometry, pure and
// bitruncated (STDVAR && standard_tiling), and the general branch for other 2D tilings as far as it uses
// generic code; the branches of other geometries (Archimedean, irregular, arbitrary tilings, binary tilings,
// Goldberg, embedded planes) throw NotPorted. The floor textures (make_floor_textures, draw_shape_for_texture,
// add_texture_params: GL and 3D only) are stage 3.
// Names: set_floor(floorshape) / set_floor_h(hpcshape) / set_floor_t(spin, hpcshape); `qfi` is the export `qfi`;
// draw_qfi's `tab` (a pointer to member) is the field name 'b' | 'shadow'.
import { G } from './globals.ts';
import { NotPorted, PPR, gmod, callhandlers, isize } from './hyper.ts';
import { itrunc, dynamicval } from './cpp.ts';
import {
  S7, S3, S6, OINF, cgflags, qIDEAL, gNormal, gBinary4, gTernary, gBinaryTiling, IRREGULAR, GOLDBERG_INV, GOLDBERG,
  INVERSE, PURE, BITRUNCATED, STDVAR, aperiodic, a4, embedded_plane, hyperbolic, WDIM,
} from './classes.ts';
import {
  type hyperpoint, type transmatrix, type shiftmatrix, TAU, M_PI, Id, C02, C03, hpxy, hpxyz, hadd, tmul, tmulh,
  inverse, build_matrix, kleinize, xpush, xpush0, hdist0, mid, mid_at, rspintox, spintox, set_column, transpose,
  dot_d, smul, tcopy,
} from './hyperpoint.ts';
import { spin, spin180, xspinpush0 } from './embeddings.ts';
import type { cell } from './locations.ts';
import { hrmap_standard } from './cell.ts';
import { standard_tiling } from './cell.ts';
import { get_corner_position, nearcorner, farcorner, midcorner } from './geometry2.ts';
import { ishept, ctof, pseudohept, geosupport_football, geosupport_chessboard, patterns_getpatterninfo, patterns_PAT_COLORING } from './pattern2.ts';
import { arcm_in } from './archimedean.ts';
import { gp_get_local_info, gp_get_mapped, gp_in_underlying_geometry, gp_variation_for, GOLDBERG_MASK, pshid_index } from './goldberg.ts';
import { geosupport_threecolor, ishex1, chessvalue, patterns_SPF_NO_SUBCODES } from './pattern2.ts';
import { eVariation, sphere } from './classes.ts';
import { arb_in } from './arbitrile.ts';
import { bt_in } from './binary-tiling.ts';
import { fake_in } from './fake.ts';
import { inforder_mixed } from './inforder.ts';
import {
  type geometry_information, type floorshape, type hpcshape, type basic_textureinfo, hpcshape as hpcshape_c,
  type escher_floorshape, allsides, cgi,
} from './geometry.ts';
import { NEWSHAPE, polydata, SHADMUL } from './polygons.ts';
import { queuepolyat, type dqi_poly, POLY_APEIROGONAL } from './drawing.ts';

/** struct qfloorinfo */
export class qfloorinfo {
  spin: transmatrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]; // Id (qfi is made at load time: no non-leaf imports)
  shape: hpcshape | null = null;
  fshape: floorshape | null = null;
  tinf: unknown = null;
  usershape = 0;
}

/** vector<basic_textureinfo> floor_texture_vertices (GL only) */
export const floor_texture_vertices: basic_textureinfo[] = [];

export function get_floor_texture_vertices(index: number): basic_textureinfo | null {
  if (G.noGUI || !G.vid.usingGL) return null;
  return floor_texture_vertices[index];
}

// int floorshapes_level = 2, ld global_boundary_ratio = 1: G

/** sizeto(t, n): t.resize(n+1) if it is shorter (with make() for the new elements) */
function sizeto<T>(t: T[], n: number, make: () => T): void {
  while (t.length <= n) t.push(make());
}

export function init_floorshapes(this: geometry_information): void {
  if (G.floorshapes_level === 0) return;
  this.all_escher_floorshapes.length = 0;
  this.all_plain_floorshapes = [
    this.shFloor, this.shMFloor, this.shMFloor2, this.shMFloor3, this.shMFloor4,
    this.shFullFloor, this.shBigTriangle, this.shTriheptaFloor, this.shBigHepta,
  ];

  for (const s of this.all_plain_floorshapes) s.is_plain = true;

  const init_escher = (sh: escher_floorshape, s0: number, s1: number, noft: number, s2: number): void => {
    if (G.floorshapes_level === 1) return;
    sh.shapeid0 = s0;
    sh.shapeid1 = s1;
    sh.noftype = noft;
    sh.shapeid2 = s2;
    sh.scale = 1;
    sh.is_plain = false;
    this.all_escher_floorshapes.push(sh);
  };

  init_escher(this.shStarFloor, 1, 2, 0, 0);
  init_escher(this.shCloudFloor, 3, 4, 0, 0);
  init_escher(this.shCrossFloor, 5, 6, 2, 54);
  init_escher(this.shChargedFloor, 7, 385, 1, 10);
  init_escher(this.shSStarFloor, 11, 12, 0, 0);
  init_escher(this.shOverFloor, 13, 15, 1, 14);
  init_escher(this.shTriFloor, 17, 18, 0, 385);
  init_escher(this.shFeatherFloor, 19, 21, 1, 20);
  init_escher(this.shBarrowFloor, 23, 24, 1, 25);
  init_escher(this.shNewFloor, 26, 27, 2, 54);
  init_escher(this.shTrollFloor, 28, 29, 0, 0);
  init_escher(this.shButterflyFloor, 325, 326, 1, 178);
  init_escher(this.shLavaFloor, 359, 360, 1, 178);
  init_escher(this.shLavaSeabed, 386, 387, 1, 178);
  init_escher(this.shSeabed, 334, 335, 0, 0);
  init_escher(this.shCloudSeabed, 336, 337, 0, 0);
  init_escher(this.shCaveSeabed, 338, 339, 2, 54);
  init_escher(this.shPalaceFloor, 45, 46, 0, 385);
  init_escher(this.shDemonFloor, 51, 50, 1, 178);
  init_escher(this.shCaveFloor, 52, 53, 2, 54);
  init_escher(this.shDesertFloor, 55, 56, 0, 4);
  init_escher(this.shPowerFloor, 57, 58, 0, 12); /* dragon */
  init_escher(this.shRoseFloor, 174, 175, 1, 173);
  init_escher(this.shSwitchFloor, 377, 378, 1, 379);
  init_escher(this.shTurtleFloor, 176, 177, 1, 178);
  for (const i of [0, 1, 2])
    init_escher(this.shRedRockFloor[i], 55, 56, 0, 0);
  init_escher(this.shDragonFloor, 181, 182, 2, 183); /* dragon */

  let ids = 0;
  for (const sh of this.all_plain_floorshapes) sh.id = ids++;
  for (const sh of this.all_escher_floorshapes) sh.id = ids++;
}

/** matrixitem::second[2][2] == APEIROGONAL_INVALID is used to denote a matrix that uses fake apeirogon vertices and
 *  thus should not be used */
const APEIROGONAL_INVALID = -2;

/** typedef pair<transmatrix, vector<transmatrix>> matrixitem */
interface matrixitem { first: transmatrix; second: transmatrix[]; }

/** struct mesher */
class mesher {
  g = 0;
  sym = 0;
  bspi = 0;
  lcorner: hyperpoint = [0, 0, 0, 0]; rcorner: hyperpoint = [0, 0, 0, 0];
  mfar: hyperpoint[] = [[0, 0, 0, 0], [0, 0, 0, 0]];
  vfar: hyperpoint[] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
}

function msh(g: number, sym: number, main: number, v0: number, v1: number, bspi: number, scale: number): mesher {
  main *= scale; v0 *= scale; v1 *= scale;
  const m = new mesher();
  m.sym = sym;
  m.bspi = bspi;
  const dg = dynamicval(() => G.geometry, (v) => { G.geometry = v; }, g);
  try {
    const rot = tmulh(xpush(v0), xspinpush0(M_PI - M_PI / sym, main));
    const R = rspintox(rot), S = spintox(rot);
    const bnlfar = tmulh(tmul(tmul(tmul(tmul(xpush(v0), spin180()), R), R), R), xpush0(hdist0(rot)));
    const bnrfar = tmulh(tmul(tmul(tmul(tmul(xpush(v0), spin180()), S), S), S), xpush0(hdist0(rot)));

    m.lcorner = xspinpush0(bspi - M_PI / sym, main);
    m.rcorner = xspinpush0(bspi + M_PI / sym, main);
    m.mfar[0] = xspinpush0(bspi, v0);
    m.mfar[1] = xspinpush0(bspi, v1);
    m.vfar[0] = tmulh(spin(bspi), bnlfar);
    m.vfar[2] = tmulh(spin(bspi), bnrfar);
    m.vfar[1] = tmulh(spin(-TAU / sym), m.vfar[2]);
    m.vfar[3] = tmulh(spin(+TAU / sym), m.vfar[0]);
  }
  finally { dg.restore(); }

  return m;
}

/** struct matrixlist */
export class matrixlist {
  o = new mesher(); n = new mesher();
  v: matrixitem[] = [];
}

function genitem(m1: transmatrix, m2: transmatrix, nsym: number): matrixitem {
  const mi: matrixitem = { first: m1, second: [] };
  mi.second.length = nsym;
  for (let i = 0; i < nsym; i++)
    mi.second[i] = tmul(spin(TAU * i / nsym), m2);
  return mi;
}

function do_kleinize(): boolean { return S3() >= OINF || (cgflags() & qIDEAL) !== 0n; }

export function may_kleinize(h: hyperpoint): hyperpoint {
  if (do_kleinize()) return kleinize(h);
  else return h;
}

function addmatrix(matrices: matrixlist, o0: hyperpoint, o1: hyperpoint, o2: hyperpoint, n0: hyperpoint, n1: hyperpoint, n2: hyperpoint, d: number, osym: number, nsym: number): void {
  if (do_kleinize()) { o0 = kleinize(o0); o1 = kleinize(o1); o2 = kleinize(o2); n0 = kleinize(n0); n1 = kleinize(n1); n2 = kleinize(n2); }
  matrices.v.push(genitem(inverse(tmul(spin(TAU * d / osym), build_matrix(o0, o1, o2, C02))), tmul(spin(TAU * d / nsym), build_matrix(n0, n1, n2, C02)), nsym));
}

const hex_matrices = new matrixlist(), hept_matrices = new matrixlist();

function generate_matrices(matrices: matrixlist, o: mesher, n: mesher): void {
  matrices.v.length = 0;
  matrices.o = o;
  matrices.n = n;

  for (let d = 0; d < o.sym; d++) {
    const center = hpxy(0, 0);
    const d1 = d & 1;
    addmatrix(matrices, center, o.lcorner, o.rcorner, center, n.lcorner, n.rcorner, d, o.sym, n.sym);
    addmatrix(matrices, o.mfar[d1], o.lcorner, o.rcorner, n.mfar[d1], n.lcorner, n.rcorner, d, o.sym, n.sym);
    addmatrix(matrices, o.mfar[d1], o.lcorner, o.vfar[d1], n.mfar[d1], n.lcorner, n.vfar[d1], d, o.sym, n.sym);
    addmatrix(matrices, o.mfar[d1], o.rcorner, o.vfar[d1 + 2], n.mfar[d1], n.rcorner, n.vfar[d1 + 2], d, o.sym, n.sym);
  }
}

// int nsym0: unused

function generate_matrices_scale(scale: number, noft: number): void {
  const c = cgi();
  const hexf7 = 0.378077, hcrossf7 = 0.620672;
  const ohex = msh(gNormal, 6, 0.329036, 0.566256, 0.620672, 0, 1);
  const ohept = msh(gNormal, 7, hexf7, hcrossf7, hcrossf7, M_PI / 7, 1);
  if (!BITRUNCATED()) {
    const nall = msh(G.geometry, S7(), c.rhexf, c.tessf, c.tessf, -M_PI, scale);
    const use = geosupport_football() < 2;
    if (use && noft === 1) {
      const opure = msh(gNormal, 7, 0.620672, 1.090550, 1.090550, M_PI / 7, 1);
      generate_matrices(hept_matrices, opure, nall);
    }
    else if (use && noft === 2) {
      const oeuc = msh(gNormal, 6, Math.sqrt(3) / 6, .5, .5, 0, 1);
      generate_matrices(hept_matrices, oeuc, nall);
    }
    else if (use && noft === 3) {
      generate_matrices(hept_matrices, ohex, nall);
    }
    else {
      generate_matrices(hex_matrices, ohex, nall);
      generate_matrices(hept_matrices, ohept, nall);
    }
  }
  else {
    generate_matrices(hex_matrices, ohex, msh(G.geometry, S6(), c.hexvdist, c.hexhexdist, c.hcrossf, (S3() - 3) * M_PI / S3(), scale));
    generate_matrices(hept_matrices, ohept, msh(G.geometry, S7(), c.rhexf, c.hcrossf, c.hcrossf, M_PI / S7(), scale));
  }
}

export function bshape2(this: geometry_information, sh: hpcshape, prio: PPR, shapeid: number, m: matrixlist): void {
  const matrices = m.v;
  const osym = m.o.sym;
  const nsym = m.n.sym;

  let whereis = 0;
  while (polydata[whereis] !== NEWSHAPE || polydata[whereis + 1] !== shapeid) whereis++;
  let rots = polydata[whereis + 2]; const sym = polydata[whereis + 3];
  whereis += 4;
  let qty = 0;
  while (polydata[whereis + 2 * qty] !== NEWSHAPE) qty++;

  const in_normal = <T>(f: () => T): T => {
    const dg = dynamicval(() => G.geometry, (v) => { G.geometry = v; }, gNormal);
    try { return f(); } finally { dg.restore(); }
  };

  let lst: hyperpoint[] = [];
  for (let i = 0; i < qty; i++)
    lst.push(in_normal(() => hpxy(polydata[whereis + 2 * i], polydata[whereis + 2 * i + 1])));
  if (sym === 2)
    for (let i = qty - 1; i >= 0; i--)
      lst.push(in_normal(() => hpxy(polydata[whereis + 2 * i], -polydata[whereis + 2 * i + 1])));

  let lstmid = hpxyz(0, 0, 0);
  for (const pp of lst) lstmid = hadd(lstmid, pp);
  let T = spin(-m.o.bspi);
  while (tmulh(tmul(spin(TAU / rots), T), lstmid)[0] < tmulh(T, lstmid)[0])
    T = tmul(spin(TAU / rots), T);
  while (tmulh(tmul(spin(-TAU / rots), T), lstmid)[0] < tmulh(T, lstmid)[0])
    T = tmul(spin(-TAU / rots), T);
  T = tmul(spin(m.o.bspi), T);
  lst = lst.map((pp) => tmulh(T, pp));

  // if(osym % rots && rots % osym && debug_geometry) printf("warning: rotation oddity ...")

  if (rots > osym && rots % osym === 0) {
    const rep = rots / osym;
    const s = lst.length;
    for (let i = 0; i < s * (rep - 1); i++)
      lst.push(tmulh(spin(TAU / rots), lst[i]));
    rots /= rep;
  }

  this.bshape(sh, prio);

  /* in case of apeirogonal shapes, we may need to cyclically rotate */
  let apeirogonal = false;
  const tail: hyperpoint[] = [], head: hyperpoint[] = [];

  for (let r = 0; r < nsym; r += Math.trunc(osym / rots)) {
    for (const h of lst) {
      let nh = may_kleinize(h);
      let mapped = 0;
      let invalid = 0;
      for (const mi of matrices) {
        const z = tmulh(mi.first, h);
        if (z[0] > -1e-5 && z[1] > -1e-5 && z[2] > -1e-5) {
          if (mi.second[r][2][2] === APEIROGONAL_INVALID) invalid++;
          nh = tmulh(mi.second[r], z); mapped++;
        }
      }
      void mapped; // if(mapped == 0 && debug_geometry) println(hlog, "warning: not mapped shapeid = ", shapeid);
      if (invalid) {
        apeirogonal = true;
        for (const hh of head) tail.push(hh);
        head.length = 0;
      }
      if (!invalid) head.push(nh);
    }
  }

  for (const h of head) this.hpcpush(h);
  for (const h of tail) this.hpcpush(h);
  if (!apeirogonal) this.hpcpush(this.starting_point);
}

// #if CAP_BT: bshape_bt (binary tilings): not ported

export function finish_apeirogon(this: geometry_information, center: hyperpoint): void {
  this.last!.flags |= POLY_APEIROGONAL;
  this.last!.she = this.hpc.length;
  // if(arb::apeirogon_simplified_display) ...: arbitrary tilings (not ported)
  this.hpcpush(center);
  this.hpcpush(this.starting_point);
}

export function get_circumscribed_corner(c: cell, t: number, h: hyperpoint): hyperpoint {
  const map = G.currentmap as hrmap_standard;
  const h0 = tmulh(map.adjmod(c, t), h);
  const h1 = tmulh(map.adjmod(c, t - 1), h);
  let T: transmatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const hs = [h, h0, h1];
  set_column(T, 3, C03);
  const res = [...C03];
  for (let i = 0; i < 3; i++) {
    const ahs = [...hs[i]];
    if (hyperbolic()) ahs[3] *= -1;
    set_column(T, i, ahs);
    res[i] = dot_d(4, hs[i], ahs);
  }
  T = transpose(T);
  return tmulh(inverse(T), res);
}

// hookset<bool(cell*, int)> hooks_floorshapes_for: G.hooks_floorshapes_for

// !siid equals pseudohept(c)

export function generate_floorshapes_for(this: geometry_information, id: number, c: cell): void {

  if (callhandlers(false, G.hooks_floorshapes_for, c, id)) return;

  let siid = 0, sidir = 0;

  if (false) { /* if(0) */ }

  // #if CAP_ARCM
  else if (arcm_in()) {
    throw new NotPorted('generate_floorshapes_for: arcm');
  }

  // #if CAP_IRR
  else if (IRREGULAR()) {
    throw new NotPorted('generate_floorshapes_for: irregular');
  }

  else if (arb_in()) {
    throw new NotPorted('generate_floorshapes_for: arb');
  }

  else if (G.geometry === gBinary4) {
    siid = 1;
  }

  else if (G.geometry === gTernary) {
    siid = 1;
  }

  else if (GOLDBERG_INV()) {
    const data = cgi().gpdata!;
    if (fake_in()) throw new NotPorted('generate_floorshapes_for: fake (FPIU(cgi.gpdata))');
    siid = data.id_to_params[id][0] === 1 ? 1 : 0;
    sidir = data.id_to_params[id][1];
  }

  else if (PURE() && G.geometry !== gBinaryTiling && geosupport_football() < 2) {
    siid = 1;
  }

  else if (PURE() && !(S7() & 1) && !aperiodic() && !a4()) {
    siid = id & 1; sidir = id >> 1;
  }

  else if (BITRUNCATED()) {
    siid = ishept(c) ? 1 : 0; sidir = 0;
  }

  // #if CAP_BT
  else if (bt_in()) {
    siid = id;
  }

  // DEBBI(debug_poly, ("generate_floorshapes_for ", id));

  const gbr = G.global_boundary_ratio;

  for (const fsh of this.all_plain_floorshapes) {

    // #if CAP_BT
    if (bt_in()) throw new NotPorted('generate_floorshapes_for: bshape_bt');

    // special
    const sca = 3 * this.shFullFloor.rad0 / fsh.rad0;

    const cornerlist: hyperpoint[] = [];

    const cor = c.type;
    const apeirogonal = false;

    if (fsh === this.shTriheptaFloor) {
      if (siid) {
        for (let i = 0; i < cor; i++)
          cornerlist.push(midcorner(c, i, .5 - .01 * gbr));
      }
      else {
        for (let i = 0; i < cor; i++) {
          let ri = i;
          if ((i & 1) === ((sidir + siid) & 1)) ri--;
          ri = c.c.fix(ri);
          const val = 3 + 0.1 * gbr;
          cornerlist.push(mid(get_corner_position(c, ri, val), get_corner_position(c, c.c.fix(ri + 1), val)));
        }
      }
    }

    else if (fsh === this.shBigTriangle) {
      const val = 1 - 0.06 * gbr;
      if (siid) {
        for (let i = 0; i < cor; i++) cornerlist.push(hpxy(0, 0));
      }
      else if (geosupport_chessboard()) {
        for (let i = 0; i < cor; i++) {
          const nc = nearcorner(c, i);
          cornerlist.push(mid_at(hpxy(0, 0), nc, val));
        }
      }
      else {
        for (let i = 0; i < cor; i++) {
          let ri = i;
          if ((i & 1) !== ((sidir + siid) & 1)) ri--;
          ri = c.c.fix(ri);
          const nc = nearcorner(c, ri);
          cornerlist.push(mid_at(hpxy(0, 0), nc, val));
        }
      }
    }

    else if (fsh === this.shBigHepta) {
      const val = 1 - 0.06 * gbr;
      if (siid) {
        for (let i = 0; i < cor; i++) {
          const nc = nearcorner(c, i);
          cornerlist.push(mid_at(hpxy(0, 0), nc, val));
        }
      }
      else {
        for (let i = 0; i < cor; i++) cornerlist.push(hpxy(0, 0));
      }
    }

    else if (arb_in() || aperiodic() || arcm_in() || IRREGULAR()) {
      throw new NotPorted('generate_floorshapes_for: the corners of arb / aperiodic / arcm / irregular tiles');
    }

    else {
      for (let j = 0; j < cor; j++)
        cornerlist.push(get_corner_position(c, j, sca));
    }

    sizeto(fsh.b, id, () => new hpcshape_c());

    this.bshape(fsh.b[id], fsh.prio);
    if (cor === 2) {
      /* give digons some width */
      for (let i = 0; i < cor; i++) { this.hpcpush(tmulh(spin(-.1), cornerlist[i])); this.hpcpush(tmulh(spin(+.1), cornerlist[i])); }
      this.hpcpush(tmulh(spin(-.1), cornerlist[0]));
    }
    else if (fsh === this.shTriheptaFloor && cor === 4 && siid)
      /* trihepta floors generate digons too */
      for (let i = 0; i <= cor; i++) this.hpcpush(tmulh(spin((i & 1) ? .1 : -.1), cornerlist[i % cor]));
    else if (apeirogonal) {
      for (let i = 0; i <= cor - 2; i++) this.hpcpush(cornerlist[i]);
      this.finish_apeirogon(cornerlist[cornerlist.length - 1]);
    }
    else
      for (let i = 0; i <= cor; i++) this.hpcpush(cornerlist[i % cor]);

    sizeto(fsh.shadow, id, () => new hpcshape_c());
    this.bshape(fsh.shadow[id], fsh.prio);
    for (let i = 0; i <= cor; i++)
      this.hpcpush(mid_at(hpxy(0, 0), cornerlist[i % cor], SHADMUL()));

    for (const p of allsides) {
      while (fsh.side[p].length < cor) fsh.side[p].push([]);
      for (let cid = 0; cid < cor; cid++) {
        sizeto(fsh.side[p][cid], id, () => new hpcshape_c());
        this.bshape(fsh.side[p][cid][id], fsh.prio);
        this.hpcpush(cornerlist[cid]);
        this.hpcpush(cornerlist[(cid + 1) % cor]);
        this.chasmifyPoly(this.dlow_table[p], this.dhi_table[p], p);
      }
    }
  }

  for (const fsh of this.all_escher_floorshapes) {

    sizeto(fsh.b, id, () => new hpcshape_c());
    sizeto(fsh.shadow, id, () => new hpcshape_c());

    if (STDVAR() && standard_tiling()) {
      for (const ii of [0, 1]) {
        const tgt = (ii ? fsh.shadow : fsh.b)[id];
        // generate_matrices_scale takes an int: noftype * SHADMUL is truncated
        generate_matrices_scale(fsh.scale, itrunc(fsh.noftype * (ii ? SHADMUL() : 1)));
        if (sidir & 1)
          for (const m of hex_matrices.v) for (let k = 0; k < m.second.length; k++) m.second[k] = tmul(spin180(), m.second[k]);
        if (PURE() && geosupport_football() < 2) {
          this.bshape2(tgt, fsh.prio, fsh.shapeid2 ? fsh.shapeid2 : fsh.shapeid1, hept_matrices);
        }
        else {
          if (siid === 0) this.bshape2(tgt, fsh.prio, fsh.shapeid0, hex_matrices);
          if (siid === 1) this.bshape2(tgt, fsh.prio, fsh.shapeid1, hept_matrices);
        }
      }
    }

    else {
      generate_matrices_scale(fsh.scale, fsh.noftype);

      const m = (!siid && geosupport_football() === 2) ? hex_matrices : hept_matrices;

      const cor = c.type;
      // bool apeirogonal = arb::is_apeirogonal(c): only arbitrary tilings have apeirogons
      if (arb_in()) throw new NotPorted('generate_floorshapes_for: arb::is_apeirogonal');
      const apeirogonal = false;

      m.n.sym = cor;

      const v = sidir + siid;
      for (const mvi of m.v) {
        while (mvi.second.length < cor) mvi.second.push(tcopy(Id));
        mvi.second.length = cor;
      }

      for (let ii = 0; ii < 2; ii++) {
        let i = 0;
        for (let d = 0; d < m.o.sym; d++) {
          const center = hpxy(0, 0);

          for (let cid = 0; cid < cor; cid++) {
            let dcidv = d + cid + v;
            if (apeirogonal) dcidv--;
            const dcidv1 = gmod(dcidv + 1, cor);
            const dcidv2 = gmod(dcidv + 2, cor);

            if (apeirogonal && dcidv1 >= cor - 2) {
              for (const j of [0, 1, 2, 3])
                m.v[i + j].second[cid][2][2] = APEIROGONAL_INVALID;
              continue;
            }

            const nlcorner = get_corner_position(c, dcidv1, 3 / fsh.scale * (ii ? 1 / SHADMUL() : 1));
            const nrcorner = get_corner_position(c, dcidv2, 3 / fsh.scale * (ii ? 1 / SHADMUL() : 1));

            const nfar = nearcorner(c, dcidv1);

            const nlfar = farcorner(c, dcidv1, 0);
            const nrfar = farcorner(c, dcidv1, 1);
            m.v[i].second[cid] = build_matrix(center, nlcorner, nrcorner, C02);
            m.v[i + 1].second[cid] = build_matrix(nfar, nlcorner, nrcorner, C02);
            m.v[i + 2].second[cid] = build_matrix(nfar, nlcorner, nlfar, C02);
            m.v[i + 3].second[cid] = build_matrix(nfar, nrcorner, nrfar, C02);
          }

          i += 4;
        }

        // if(i != isize(m.v)) printf("warning: i=%d sm=%d\n", i, isize(m.v));
        this.bshape2((ii ? fsh.shadow : fsh.b)[id], fsh.prio, (fsh.shapeid2 && geosupport_football() < 2) ? fsh.shapeid2 : siid ? fsh.shapeid1 : fsh.shapeid0, m);

        // if(apeirogonal && !first) { ... arb::get_adj ...; finish_apeirogon(...) }: arbitrary tilings
      }
    }
  }

  // #if MAXMDIM >= 4
  if (embedded_plane()) {
    throw new NotPorted('generate_floorshapes_for: embedded plane (the 3D levels, cones and sides)');
  }
}

// --- #if CAP_GP: namespace gp (stage 3, package G2) ---

export function gp_clear_plainshapes(): void {
  cgi().gpdata!.pshid.fill(-1);
}

export function gp_get_plainshape_data(c: cell): number[] {
  if (G.gp_li_for !== c) {
    G.gp_li_for = c;
    G.gp_current_li = gp_get_local_info(c);
  }
  let siid = 0, sidir = 0;
  // note: this siid can equal 2! it should be treated as 0 by floorshapes
  let c1 = c;
  const f = (): void => {
    if (geosupport_threecolor() === 2) {
      const si = patterns_getpatterninfo(c1, patterns_PAT_COLORING, patterns_SPF_NO_SUBCODES);
      siid = si.id >> 2; siid++; if (siid === 3) siid = 0;
      if ((si.id >> 2) === 1) si.dir++;
      sidir = c1.c.fix(si.dir);
    }
    else if (geosupport_football() === 2) {
      siid = pseudohept(c1) ? 1 : 0;
      sidir = ishex1(c1) ? 1 : 0;
    }
    else if (geosupport_chessboard()) {
      siid = !chessvalue(c1) ? 1 : 0;
      sidir = 0;
    }
    else {
      siid = 1;
      sidir = 0;
    }
  };
  if (INVERSE() && gp_variation_for(G.gp_param) === eVariation.goldberg) {
    c1 = gp_get_mapped(c);
    gp_in_underlying_geometry(f);
    siid = 1; sidir = 0;
  }
  else if (INVERSE()) {
    siid = 1;
    sidir = 0;
  }
  else f();
  const res = [0, 0, 0, 0, 0];
  res[0] = siid; res[1] = sidir;
  res[2] = G.gp_current_li.relative[0] & GOLDBERG_MASK; res[3] = G.gp_current_li.relative[1] & GOLDBERG_MASK;
  res[4] = gmod(G.gp_current_li.total_dir, S6());
  return res;
}

export function gp_get_plainshape_id(c: cell): number {
  const res = gp_get_plainshape_data(c);
  const gd = cgi().gpdata!;
  const k = pshid_index(res[0], res[1], res[2], res[3], res[4]);
  let id = gd.pshid[k];
  if (id === -1 && sphere() && isize(cgi().shFloor.b) > 0) {
    for (let i = 0; i < c.type; i++) { const c1 = c.move(i); if (!c1) continue; if (!G.current_display.old_cellmatrices.has(c1)) return 0; }
  }
  if (id === -1) {
    id = gd.pshid[k] = gd.id_to_params.length;
    gd.id_to_params.push(res);
  }
  return id;
}

/** qfloorinfo qfi */
export const qfi = new qfloorinfo();

export function set_no_floor(): void {
  qfi.fshape = null;
  qfi.shape = null;
  qfi.tinf = null;
  qfi.usershape = -1;
}

/** set_floor(floorshape& sh) */
export function set_floor(sh: floorshape): void {
  qfi.fshape = sh;
  qfi.shape = null;
  qfi.tinf = null;
  qfi.usershape = -1;
}

/** set_floor(hpcshape& sh) */
export function set_floor_h(sh: hpcshape): void {
  qfi.shape = sh;
  qfi.fshape = null;
  qfi.spin = Id;
  qfi.tinf = null;
  qfi.usershape = -1;
}

/** set_floor(const transmatrix& spin, hpcshape& sh) */
export function set_floor_t(spin_: transmatrix, sh: hpcshape): void {
  qfi.shape = sh;
  qfi.fshape = null;
  qfi.spin = spin_;
  qfi.usershape = -1;
}

export function ensure_floorshape_generated(id: number, c: cell): void {
  const gi = cgi();
  sizeto(gi.shFloor.b, id, () => { const nul = new hpcshape_c(); nul.s = -1; return nul; });
  if (gi.shFloor.b[id].s === -1) {
    gi.require_shapes();
    gi.generate_floorshapes_for(id, c);
    gi.finishshape();
    gi.extra_vertices();
  }
}

export function shvid(c: cell): number {
  return (G.currentmap as hrmap_standard).shvid(c);
}

/** hrmap_standard::shvid */
export function hrmap_standard_shvid(c: cell): number {
  if (GOLDBERG() || (INVERSE() && fake_in()))
    return gp_get_plainshape_id(c);
  // #if CAP_IRR
  else if (IRREGULAR())
    throw new NotPorted('shvid: irr::cellindex');
  else if (PURE() && !(S7() & 1) && !aperiodic() && !a4()) {
    const si = patterns_getpatterninfo(c, patterns_PAT_COLORING, 0);
    if (si.id === 8) si.dir++;
    return (pseudohept(c) ? 1 : 0) + (si.dir & 1) * 2;
  }
  else if (geosupport_football() === 2)
    return pseudohept(c) ? 1 : 0;
  else if (inforder_mixed()) return c.type;
  else if (PURE())
    return 0;
  else
    return ctof(c);
}

export function draw_shapevec(c: cell | null, V: shiftmatrix, shv: hpcshape[], col: number, prio: PPR = PPR.DEFAULT): dqi_poly | null {
  if (G.no_wall_rendering) return null;
  if (!c) return queuepolyat(V, shv[0], col, prio);
  if (WDIM() === 3) return null;
  const id = shvid(c);
  ensure_floorshape_generated(id, c);
  if (id < 0) return null;
  if (id >= shv.length) return null;
  return queuepolyat(V, shv[shvid(c)], col, prio);
}

export function draw_floorshape(c: cell | null, V: shiftmatrix, fsh: floorshape, col: number, prio: PPR = PPR.DEFAULT): void {
  if (G.no_wall_rendering) return;
  draw_shapevec(c, V, fsh.b, col, prio);
}

/** draw_qfi(c, V, col, prio = PPR::DEFAULT, tab = &floorshape::b) */
export function draw_qfi(c: cell, V: shiftmatrix, col: number, prio: PPR = PPR.DEFAULT, tab: 'b' | 'shadow' = 'b'): void {
  if (G.no_wall_rendering) return;
  if (qfi.shape)
    queuepolyat(smul(V, qfi.spin), qfi.shape, col, prio);
  else if (qfi.usershape >= 0) {
    throw new NotPorted('draw_qfi: mapeditor::drawUserShape (the map editor)');
  }
  else if (!qfi.fshape) { /* nothing */ }
  // #if CAP_TEXTURE
  else if (qfi.tinf) {
    throw new NotPorted('draw_qfi: texture mode');
  }
  else draw_shapevec(c, V, qfi.fshape[tab], col, prio);
}

// bool floorshape_debug, viewmat() ("-floordebug"): a debug view (queues corner labels), left out

// MAXMDIM >= 4 && CAP_GL: the floor textures (3D, GL): stage 3
export function ensure_vertex_number(_sh: hpcshape): void {
  if (!_sh.tinf) return;
  throw new NotPorted('ensure_vertex_number: floor textures (3D)');
}

export function bind_floor_texture(li: hpcshape, id: number): void {
  li.tinf = get_floor_texture_vertices(id);
  ensure_vertex_number(li);
}

/** register_floorshapes: hrmap_standard::shvid is defined here (cell.ts's class leaves it to this module) */
export function register_floorshapes(): void {
  hrmap_standard.prototype.shvid = function (this: hrmap_standard, c: cell): number { return hrmap_standard_shvid(c); };
}
