// hypgraph.cpp of HyperRogue 13.1o: mapping hyperpoints to the screen (the models of applymodel), the view
// (View, centerover, centerpc, optimizeview, resetview, the shift_view family), the traversal that draws the map
// (hrmap::draw_all, hrmap::draw_at, hrmap_standard::draw_at, drawcell_subs, do_draw) and the model boundary.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Stage 2, package D1 (PORTING-STAGE2.md): the 2D models. The branches for 3D, nonisotropic and product
// geometries, VR (CAP_VR is 0 in the desktop build: vrhr::rendering() and vrhr::active() are false, those
// branches are dropped), the perspective models, the spiral and formula models, polygonal/polynomial and the
// Lie/relativistic logarithms throw NotPorted (marked STAGE2-STUB).
//
// Names (PORTING.md, "Overloads"): do_draw(c) / do_draw_T(c, T); mirrorif(h, b) / mirrorif_sm(V, b);
// behindsphere(h) / behindsphere_T(V) / behindsphere_sm(V); spherity(h) / spherity_T(V); actualV(hs, V) /
// actualV_sm(hs, V); invalid_point(h) / invalid_point_sp(h); change_shift(shiftpoint, by) / change_shift_sm(T,
// by); optimize_shift(shiftpoint) / optimize_shift_sm(T); inverse_shift_any(T1, T2) / inverse_shift_any_sp(T1,
// h); atscreenpos(x, y, size?) (the two overloads: one function); dq::x -> dq_x. unshift / unshift_sm /
// inverse_shift / inverse_shift_sp / atan2_h are in hyperpoint.ts (stage 1).
// In-place C++ (`hyperpoint& ret`, `transmatrix& V`): `ret` is filled in place (applymodel(H, ret)); a
// `transmatrix&` that the function reassigns is an `mref` ({ get, set }), as move_affected_matrices'
// `transmatrix*` list and get_view_orientation's `transmatrix&`. `ld& x` pairs (makeband's lambdas): an
// object { x, y }.
// hrmap::draw_all, hrmap::draw_at and hrmap_standard::draw_at are hrmap_draw_all(m), hrmap_draw_at(m, at,
// where), hrmap_standard_draw_at(m, at, where) here; the classes in cell.ts call them.
import { gp_fixg6, gp_eudir, gp_loc_add, GOLDBERG_MASK, type loc, type gp_local_info } from './goldberg.ts';
import { G, pconf, type videopar } from './globals.ts';
import { NotPorted, hr_exception, among, isize, PPR, PINFD, INF, callhandlers, callhooks } from './hyper.ts';
import { itrunc, dynamicval, c_sinh, c_cosh } from './cpp.ts';
import type { cell, heptagon, hstate } from './locations.ts';
import { heptspin, hsOrigin, hsError } from './locations.ts';
import {
  type hyperpoint, type transmatrix, type shiftpoint, type shiftmatrix,
  hpt, hnew, hcopy, tcopy, hmul, hdiv, hadd, hsub, hneg, hcross, hdot, tmulh, tmul, shiftless, shiftless_t, smulh,
  smul, Id, Hypc, Mirror, pispin, C0, hpxyz, point3, sqhypot_d, hypot_d, zlevel, zero_d,
  intval, mid, cspin, cspin90, cpush, cpush0, xpush, ypush, xpush0, ypush0, spintox, rspintox, gpushxto0,
  rgpushxto0, fixmatrix, inverse, iso_inverse, rot_inverse, view_inverse, iview_inverse, hdist0,
  hdist, tC0, tC0_sm, eqmatrix, det, det2, asin_auto, asin_auto_clamp, sin_auto, cos_auto, tan_auto, atan_auto,
  acos_auto, hypot_auto, volume_auto, curvature, deparabolic13, parabolic13_at, cyclefix, tangent_length,
  direct_exp, inverse_exp, shift_method, xtangent, unshift, unshift_sm, bucketer, bucketer_h, hpxy, cspin180, atan2_h,
  hashmix_to, type buckethash_t, M_PI, TAU, degree, deg, smProduct, smIsotropic, smEmbedded, smLie, smGeodesic,
  smaManualCamera, smaAutocenter, pNORMAL, pfNO_DISTANCE,
  lp_apply,
} from './hyperpoint.ts';
import {
  GDIM, WDIM, LDIM, sphere, euclid, hyperbolic, nonisotropic, gproduct, mproduct, mtwisted, mhybrid, nil, sol,
  nih, sl2, quotient, elliptic, embedded_plane, cgflags, cgclass, qAFFINE, qSTRETCHABLE, gcEuclid, gcHyperbolic,
  gcSphere, S3, SG3, OINF, BITRUNCATED, GOLDBERG, IRREGULAR, gNormal, eVariation,
  mdDisk, mdHalfplane, mdBand, mdPolygonal, mdFormula, mdEquidistant, mdEquiarea, mdBall, mdHyperboloid,
  mdHemisphere, mdBandEquidistant, mdBandEquiarea, mdSinusoidal, mdTwoPoint, mdFisheye, mdJoukowsky,
  mdJoukowskyInverted, mdRotatedHyperboles, mdSpiral, mdPerspective, mdEquivolume, mdCentralInversion,
  mdSimulatedPerspective, mdTwoHybrid, mdGeodesic, mdMollweide, mdCentralCyl, mdCollignon, mdHorocyclic,
  mdQuadrant, mdAxial, mdAntiAxial, mdWerner, mdAitoff, mdHammer, mdLoximuthal, mdMiller, mdGallStereographic,
  mdWinkelTripel, mdPoorMan, mdPanini, mdRetroCraig, mdRetroLittrow, mdRetroHammer, mdThreePoint,
  mdLiePerspective, mdLieOrthogonal, mdRelPerspective, mdRelOrthogonal, mdHorocyclicEqa, mdConformalSquare,
  mdFisheye2, mdPolar, mdConformalEgg, mdGUARD, mdPixel, mdHyperboloidFlat, mdPolynomial, mdManual,
  type eModel, mf, mdinf, qINFMIXED, cryst,
} from './classes.ts';
import {
  cgi, check_cgi, geom3_factor_to_lev, geom3_lev_to_factor, geom3_do_auto_eye, hcrossf7,
} from './geometry.ts';
import {
  spin, spin90, spin180, spin270, lzpush, xspinpush0, tile_center, lmirror, meuclid, mhyperbolic, geom3_apply_always3,
} from './embeddings.ts';
import { ggmatrix, virtualRebase, get_corner_position, iddspin, dont_inverse } from './geometry2.ts';
import { hrmap, hrmap_standard, hrmap_hyperbolic, is_boundary } from './cell.ts';
import { transition } from './heptagon.ts';
import { gmod } from './util.ts';
import { setdist } from './landgen.ts';
import { bfs } from './environment.ts';
import { isHaunted, isWorm, snakelevel, inmirror } from './flags.ts';
import { bt_in } from './binary-tiling.ts';
import { arcm_in } from './archimedean.ts';
import { kite_in } from './kite.ts';
import { fake_in } from './fake.ts';
import { hybrid_in_underlying_geometry } from './nonisotropic.ts';
import { dual_split } from './multigame.ts';
import {
  models_ori_to_scr, models_ori_to_scr_t, models_scr_to_ori, models_scr_to_ori_t, models_get_broken_coord,
  models_is_hyperboloid, models_is_perspective, models_product_model, mdBandAny,
} from './models.ts';
import {
  calcparam, in_perspective, decide_lpu, drawthemap, haveaura, allowChangeRange, cview, in_wallopt,
} from './graph.ts';
import { isWall3 } from './graph-wall.ts';
import { drawcell } from './celldrawer.ts';
import { ors_unrotate, ors_rerotate } from './control.ts';
import { racing_set_view } from './racing.ts';
import { crystal_centerrug } from './crystal.ts';
import { intra_apply_scale, walking_handle } from './intra.ts';
import { mapeditor_dt_in } from './mapeditor.ts';
import { subscreens_split, get_sightrange, display_data_eyewidth, display_data_separate_eyes } from './basegraph.ts';
import { anims_reflect_view } from './screenshot.ts';
import {
  queuecircle, queuereset, curvepoint, queuecurve, queuecurve_reuse, queuestr, queuestr_sp, queueline,
  queueaction, glflush, POLY_FORCE_INVERTED, POLY_ALWAYS_IN, POLY_FORCEWIDE,
} from './drawing.ts';
import { darkena } from './colors.ts';

const notp = (what: string): never => { throw new NotPorted(what); };

/** a `transmatrix&` / `transmatrix*` that C++ reassigns */
export interface mref { get(): transmatrix; set(T: transmatrix): void; }

/** ret = v (C++ assignment into a `hyperpoint&`) */
function hset(ret: hyperpoint, v: hyperpoint): void { ret[0] = v[0]; ret[1] = v[1]; ret[2] = v[2]; ret[3] = v[3]; }

/** models::scr_to_ori(hyperpoint& h) / models::ori_to_scr(hyperpoint& h), in place */
function scr_to_ori(h: hyperpoint): void { hset(h, models_scr_to_ori(h)); }
function ori_to_scr(h: hyperpoint): void { hset(h, models_ori_to_scr(h)); }

/** the views of current_display (basegraph.cpp: #define View, NLP, centerover, cwtV, gmatrix) */
const cd = () => G.current_display;
const refView: mref = { get: () => cd().view_matrix, set: (T) => { cd().view_matrix = T; } };
const refNLP: mref = { get: () => cd().local_perspective, set: (T) => { cd().local_perspective = T; } };
const refWhichCopy: mref = { get: () => cd().which_copy, set: (T) => { cd().which_copy = T; } };
const refCwtV: mref = { get: () => cd().player_matrix.T, set: (T) => { cd().player_matrix.T = T; } };

/** ld lerp (template<class T, class U> T lerp(const T& a0, const T& a1, const U& x)) */
function lerp_ld(a0: number, a1: number, x: number): number { return a0 + (a1 - a0) * x; }

/** std::abs */
const abs = Math.abs;

// file-local variables (non-EX)
let ghxy: hyperpoint = [0, 0, 0, 0];
let ghgxy: hyperpoint = [0, 0, 0, 0];
let ghpm: shiftpoint = { h: [0, 0, 1, 0], shift: 0 }; // shiftless(C02)
let twopoint_sphere_flips = 0;
let twopoint_do_flips = false;

export function flip_sphere(): boolean { return GDIM() === 2 && sphere() && pconf().alpha > G.flip_limit; }

function ghcheck(ret: hyperpoint, H: shiftpoint): void {
  if (hypot_d(2, hsub(ret, ghxy)) < hypot_d(2, hsub(ghgxy, ghxy))) {
    ghpm = { h: hcopy(H.h), shift: H.shift }; ghgxy = hcopy(ret);
  }
}

/** camrotate(ld& hx, ld& hy) */
export function camrotate(hxy: { x: number; y: number }): void {
  let p = hpt(hxy.x, hxy.y, 1, 1);
  p = tmulh(pconf().cam(), p);
  hxy.x = p[0] / p[2]; hxy.y = p[1] / p[2];
}

/** Does the current model support 3D */
export function non_spatial_model(): boolean {
  if (among(pconf().model, mdRotatedHyperboles, mdJoukowsky, mdJoukowskyInverted, mdPolygonal, mdPolynomial))
    return true;
  if (pconf().model === mdSpiral && euclid())
    return true;
  // CAP_GL: pmodel && vid.consider_shader_projection && (get_shader_flags() & SF_DIRECT) && (get_shader_flags() &
  // SF_NONSPATIAL): get_shader_flags() is 0 without GL (the port draws the non-GL path)
  return false;
}

export function perspective_to_space(h: hyperpoint, alpha = pconf().alpha, gc = cgclass()): hyperpoint {
  const hx = h[0], hy = h[1];

  if (gc === gcEuclid)
    return hpxy(hx * (1 + alpha), hy * (1 + alpha));

  let hr = hx * hx + hy * hy;
  if (LDIM() === 3) hr += h[2] * h[2];

  if (hr >= 1 && gc === gcHyperbolic) return hcopy(Hypc);

  let B, C;

  const curv = gc === gcSphere ? 1 : -1;

  const A = 1 + curv * hr;
  B = 2 * hr * alpha * -curv;
  C = 1 - curv * hr * alpha * alpha;

  B /= A; C /= A;

  let rootsign = 1;
  if (gc === gcSphere && alpha > 1) rootsign = -1;

  const hz = B / 2 + rootsign * Math.sqrt(C + B * B / 4);

  const H = hnew();
  H[0] = hx * (hz + alpha);
  H[1] = hy * (hz + alpha);
  if (LDIM() === 3) H[2] = h[2] * (hz + alpha);
  H[LDIM()] = hz;

  return H;
}


export function space_to_perspective(z0: hyperpoint, alpha = pconf().alpha): hyperpoint {
  const z = hcopy(z0);
  const s = 1 / (alpha + z[LDIM()]);
  z[0] *= s;
  z[1] *= s;
  if (GDIM() === 3) {
    z[2] *= s;
    z[3] = 0;
  }
  else
    z[2] = 0;
  return z;
}

export function pointable(): hyperpoint {
  return WDIM() === 2 && GDIM() === 3 ? notp('pointable: zpush0(cgi.FLOOR) (3D)') : C0();
}

/** find a shiftpoint which minimizes value -- we represent points by matrices to make things a bit simpler */
export function minimize_point_value(T: shiftmatrix, value: (T: shiftmatrix) => number): shiftmatrix {

  let best = value(T);

  for (let it = 0; it < 50; it++)
    for (let s = 0; s < 2 * WDIM(); s++) {
      const T1 = smul(T, cpush(s >> 1, ((s & 1) ? 1 : -1) * Math.pow(1.2, -it)));
      let dist = value(T1);
      if (dist < best) { best = dist; T = { T: tcopy(T1.T), shift: T1.shift }; }
      if (mdBandAny()) {
        T1.shift += TAU;
        dist = value(T1);
        if (dist < best) { best = dist; T = { T: tcopy(T1.T), shift: T1.shift }; }
        T1.shift -= deg(720);
        dist = value(T1);
        if (dist < best) { best = dist; T = { T: tcopy(T1.T), shift: T1.shift }; }
        T1.shift += TAU;
      }
    }

  return T;
}

export function find_on_screen(hxy: hyperpoint, T: shiftmatrix): shiftpoint {
  const rel = pointable();
  const distance_at = (T1: shiftmatrix): number => {
    const h1 = hnew();
    applymodel(smulh(T1, rel), h1);
    return sqhypot_d(2, hsub(hxy, h1));
  };
  return smulh(minimize_point_value(T, distance_at), rel);
}

export function gethyper(x: number, y: number): shiftpoint {

  const hx = (x - cd().xcenter) / cd().radius;
  const hy = (y - cd().ycenter) / cd().radius / pconf().stretch;
  const hxy = point3(hx, hy, 0);

  if (WDIM() === 2 && GDIM() === 3) {
    return G.mouseover ? find_on_screen(hxy, ggmatrix(G.mouseover)) : shiftless(hcopy(Hypc));
  }

  if (pconf().model) {
    ghxy = hxy;
    return find_on_screen(hxy, shiftless_t(rgpushxto0(ghpm.h), ghpm.shift)); // rgpushxto0(shiftpoint)
  }

  const r = { x: hx, y: hy };
  if (!G.models_camera_straight) camrotate(r);

  return shiftless(perspective_to_space(hpxyz(r.x, r.y, 0)));
}

function ballmodel(ret: hyperpoint, alpha: number, d: number, zl: number): void {
  const H = tmulh(tmul(tmul(ypush(G.vid.camera), xpush(d)), ypush(zl)), C0());
  const tzh = pconf().ballproj + H[LDIM()];
  const ax = H[0] / tzh;
  const ay = H[1] / tzh;

  const ca = Math.cos(alpha), sa = Math.sin(alpha);

  ret[0] = ax * ca;
  ret[1] = ay;
  ret[2] = ax * sa;

  hset(ret, tmulh(pconf().ball(), ret));
}

function use_z_coordinate(): boolean {
  // CAP_VR: vrhr::rendering() is false
  return display_data_separate_eyes(cd());
}

function apply_depth(f: hyperpoint, z: number): void {
  if (G.vid.usingGL)
    f[2] = z * pconf().depth_scaling;
  else {
    z = z * cd().radius * pconf().depth_scaling;
    const mul = cd().radius / (cd().radius + z);
    f[0] = f[0] * mul;
    f[1] = f[1] * mul;
    f[2] = G.vid.xres * display_data_eyewidth(cd()) / 2 / cd().radius + G.vid.ipd * mul / 2;
  }
}

/** bool hypot_zlev(ld zlev, ld& d, ld& df, ld& zf): r.d, r.df, r.zf in and out */
function hypot_zlev(zlev: number, r: { d: number; df: number; zf: number }): boolean {
  if (zlev === 1) {
    r.df = 1; r.zf = 0;
    return false;
  }
  else {
    // (0,0,1) -> (0, sin z, cos z) -> (sin d cos z, sin z, cos d cos z)
    const z = geom3_factor_to_lev(zlev);

    const tz = sin_auto(z);
    const td = sin_auto(abs(r.d)) * cos_auto(z);
    const h = Math.hypot(td, tz);
    r.zf = tz / h; r.df = td / h;

    if (r.d > 0)
      r.d = hypot_auto(r.d, z);
    else {
      r.d = -hypot_auto(-r.d, z);
      r.zf = -r.zf;
    }
    return true;
  }
}

/** ld find_zlev(hyperpoint& H) */
export function find_zlev(H: hyperpoint): number {

  if (G.spatial_graphics) {
    const zlev = zlevel(H);
    if (zlev > 1 - 1e-9 && zlev < 1 + 1e-9) return 1;
    hset(H, hdiv(H, zlev));
    return zlev;
  }

  return 1;
}

/** #define BEHIND_LIMIT 1e-6 (hyper.h) */
const BEHIND_LIMIT = 1e-6;

function get_tz(H: hyperpoint): number {
  let tz = pconf().alpha + H[LDIM()];
  if (tz < BEHIND_LIMIT && tz > -BEHIND_LIMIT) tz = BEHIND_LIMIT;
  return tz;
}

// EX ld atan2(hyperpoint h): atan2_h in hyperpoint.ts

function move_z_to_y(H: hyperpoint): [number, number] {
  if (GDIM() === 2) return [0, 0];
  const R = Math.hypot(H[1], H[2]);
  const res: [number, number] = [H[1] / R, H[2] / R];
  H[1] = R; H[2] = 0;
  return res;
}

function move_y_to_z(H: hyperpoint, coef: [number, number]): void {
  if (GDIM() === 3) {
    H[2] = H[1] * coef[1];
    H[1] = H[1] * coef[0];
    // MAXMDIM >= 4
    H[3] = 1;
  }
}

/** the `ld& x, ld& y` of makeband's lambdas */
export interface bandxy { x: number; y: number; }

/** template<class T> void makeband(shiftpoint H, hyperpoint& ret, const T& f) */
export function makeband(H0: shiftpoint, ret: hyperpoint, f: (p: bandxy) => void): void {
  const H = { h: hcopy(H0.h), shift: H0.shift };
  const zlev = find_zlev(H.h);
  scr_to_ori(H.h);
  const r = move_z_to_y(H.h);

  let x, y;
  y = asin_auto(H.h[1]);
  x = asin_auto_clamp(H.h[0] / cos_auto(y));
  if (sphere()) {
    if (H.h[LDIM()] < 0 && x > 0) x = M_PI - x;
    else if (H.h[LDIM()] < 0 && x <= 0) x = -M_PI - x;
  }
  x += H.shift;
  const z = { d: y, df: 0, zf: 0 };
  hypot_zlev(zlev, z);
  y = z.d;
  const yf = z.df, zf = z.zf;

  const p = { x, y };
  f(p);
  x = p.x; y = p.y;

  const yzf = y * zf; y *= yf;
  hset(ret, hpxyz(x / M_PI, y / M_PI, 0));
  move_y_to_z(ret, r);
  ori_to_scr(ret);
  if (zlev !== 1 && use_z_coordinate())
    apply_depth(ret, yzf / M_PI);
  return;
}

export function makeband_f(H: shiftpoint, ret: hyperpoint, f: (p: bandxy) => void): void {
  makeband(H, ret, f);
}

function band_conformal(p: bandxy): void {
  switch (cgclass()) {
    case gcSphere:
      p.y = Math.atanh(Math.sin(p.y));
      p.x *= 2; p.y *= 2;
      break;
    case gcHyperbolic:
      p.y = 2 * Math.atan(Math.tanh(p.y / 2));
      p.x *= 2; p.y *= 2;
      break;
    case gcEuclid:
    default:
      // y = y;
      p.y *= 2; p.x *= 2;
      break;
  }
}

function make_twopoint(q: bandxy): void {
  const p = pconf().twopoint_param;
  let dleft = hypot_auto(q.x - p, q.y);
  let dright = hypot_auto(q.x + p, q.y);
  if (sphere()) {
    let tss = twopoint_sphere_flips;
    if (tss & 1) {
      tss--;
      dleft = TAU - 2 * p - dleft;
      dright = TAU - 2 * p - dright;
      const t = dleft; dleft = dright; dright = t;
      q.y = -q.y;
    }
    while (tss) {
      tss -= 2;
      dleft = TAU - 4 * p + dleft;
      dright = TAU - 4 * p + dright;
    }
  }
  q.x = (dright * dright - dleft * dleft) / 4 / p;
  q.y = (q.y > 0 ? 1 : -1) * Math.sqrt(dleft * dleft - (q.x - p) * (q.x - p) + 1e-9);
}

function mobius(h: hyperpoint, angle: number, scale = 1): hyperpoint {
  h = perspective_to_space(hmul(h, scale), 1, gcSphere);
  h = tmulh(cspin(1, 2, angle * degree), h);
  return hdiv(space_to_perspective(h, 1), scale);
}

function compute_hybrid(H: hyperpoint, rootid: number): hyperpoint {
  const t = pconf().twopoint_param;
  const Hl = tmulh(xpush(+t), H);
  const Hr = tmulh(xpush(-t), H);
  const g = (Hl[0] + 1e-7) / (Hl[1] + 1e-8);
  const d = hdist0(Hr);

  let spinned = tmulh(spintox(Hl), xpush0(2 * t));
  if (Hl[0] < 0) spinned = tmulh(pispin, spinned);

  const y = asin_auto(spinned[1]);
  const x = asin_auto_clamp(spinned[0] / cos_auto(y));

  let sign = (Hl[0] > 0 ? 1 : -1) * hdist0(Hl) < x ? -1 : 1;

  switch (rootid & 3) {
    case 1: sign = -sign; break;
    case 2: sign = 1; break;
    case 3: sign = -1; break;
  }

  const b = t * (1 / g / g - 1) / (1 + 1 / g / g);
  const c = d * d / (1 + 1 / g / g) - t * t;

  const a = c + b * b;

  const ret = hnew();
  ret[0] = (a > 0 ? sign * Math.sqrt(a) : 0) - b;
  ret[1] = (ret[0] + t) / g;
  ret[2] = 0;

  return ret;
}

export function signed_sqrt(x: number): number { return x > 0 ? Math.sqrt(x) : -Math.sqrt(-x); }

/** in perspective projections, compute inverse_exp (or similar) on CPU, but perspective on GPU */
export function apply_perspective(H: hyperpoint, ret: hyperpoint): void {
  if (G.computing_semidirect) { hset(ret, H); ret[3] = 1; return; }
  if (H[2] === 0) { ret[0] = 1e6; ret[1] = 1e6; ret[2] = 0; return; }
  const ratio = G.vid.xres / cd().tanfov / cd().radius / 2;
  ret[0] = H[0] / H[2] * ratio;
  ret[1] = H[1] / H[2] * ratio;
  ret[2] = H[2];
  ret[3] = 1;
}

export function apply_nil_rotation(_H: hyperpoint): void {
  if (nil()) notp('apply_nil_rotation (nil)'); // STAGE2-STUB (nonisotropic)
}

/** void applymodel(shiftpoint H_orig, hyperpoint& ret): fills ret in place */
export function applymodel(H_orig: shiftpoint, ret: hyperpoint): void {
  apply_other_model(H_orig, ret, pconf().model);
}

export function vr_sphere(ret: hyperpoint, H: hyperpoint, md: eModel): void {
  hset(ret, H);
  let flip = 1;
  if (md === mdHalfplane) flip = -flip;
  if (pconf().alpha < 1) flip = -flip;
  hset(ret, hmul(ret, Math.pow(sqhypot_d(3, H), (flip * pconf().depth_scaling - 1) / 2)));
  ret[2] += pconf().alpha;
  if (md === mdHalfplane) {
    const d = sqhypot_d(3, ret);
    hset(ret, hdiv(ret, abs(d)));
  }
}

// vr_disk, threepoint_projection: VR and 3D (STAGE2-STUB)

/** EX vector<function<void(shiftpoint& H_orig, hyperpoint& H, hyperpoint& ret)>> extra_projections: G */

export function make_axial(H: hyperpoint, ret: hyperpoint, f: (h: hyperpoint) => number): void {
  H = hcopy(H);
  scr_to_ori(H);

  ret[0] = f(H);
  const axi = pconf().axial_angle;
  const ax = GDIM() === 3 || (axi / 180 - Math.floor(axi / 180)) === 0.5;

  if (ax) {
    ret[1] = f(tmulh(cspin90(0, 1), H));
    ret[2] = 0;
    if (GDIM() === 3) ret[2] = f(tmulh(cspin90(2, 1), H));
  }
  else {
    const alpha = axi * degree;
    const val = f(tmulh(cspin(0, 1, alpha), H));
    // ret[0] * cos(alpha) + ret[1] * sin(alpha) == val
    ret[1] = (val - ret[0] * Math.cos(alpha)) / Math.sin(alpha);
    ret[2] = 0;
  }

  ret[3] = 1;

  ori_to_scr(ret);
}

// according to https://github.com/cspersonal/peirce-quincuncial-projection/blob/master/peirceQuincuncialProjection.R

function ellRF(x: number, y: number, z: number): number {
  let delx = 1, dely = 1, delz = 1;
  const eps = 0.0025;
  let mean = 0;
  while (abs(delx) > eps || abs(dely) > eps || abs(delz) > eps) {
    const sx = Math.sqrt(x);
    const sy = Math.sqrt(y);
    const sz = Math.sqrt(z);
    const len = sx * (sy + sz) + sy * sz;
    x = .25 * (x + len);
    y = .25 * (y + len);
    z = .25 * (z + len);
    mean = (x + y + z) / 3;
    delx = (mean - x) / mean;
    dely = (mean - y) / mean;
    delz = (mean - z) / mean;
  }
  const e2 = delx * dely - delz * delz;
  const e3 = delx * dely * delz;
  return ((1.0 + (e2 / 24.0 - 0.1 - 3.0 * e3 / 44.0) * e2 + e3 / 14) / Math.sqrt(mean));
}

function ellFaux(cos_phi: number, sin_phi: number, k: number): number {
  const x = cos_phi * cos_phi;
  const y = 1 - k * k * sin_phi * sin_phi;
  return sin_phi * ellRF(x, y, 1);
}

function sqrt_clamp(x: number): number { if (x < 0) return 0; return Math.sqrt(x); }

export function to_square(H: hyperpoint): hyperpoint {

  const d = hypot_d(2, H);
  let x = d / (H[2] + 1);
  x *= pconf().model_transition;

  const cos_phiosqrt2 = Math.sqrt(2) / (x + 1 / x);
  const cos_lambda = -H[1] / d;
  const sin_lambda = H[0] / d;
  const cos_a = cos_phiosqrt2 * (sin_lambda + cos_lambda);
  const cos_b = cos_phiosqrt2 * (sin_lambda - cos_lambda);
  const sin_a = Math.sqrt(1 - cos_a * cos_a);
  const sin_b = Math.sqrt(1 - cos_b * cos_b);
  const cos_a_cos_b = cos_a * cos_b;
  const sin_a_sin_b = sin_a * sin_b;
  const sin2_m = 1.0 + cos_a_cos_b - sin_a_sin_b;
  const sin2_n = 1.0 - cos_a_cos_b - sin_a_sin_b;
  let sin_m = sqrt_clamp(sin2_m);
  const cos_m = sqrt_clamp(1 - sin2_m);
  if (sin_lambda < 0) sin_m = -sin_m;
  let sin_n = sqrt_clamp(sin2_n);
  const cos_n = sqrt_clamp(1.0 - sin2_n);
  if (cos_lambda > 0.0) sin_n = -sin_n;

  let res = hnew();
  const divby = 0.53935260118837935472;
  res[0] = ellFaux(cos_m, sin_m, Math.sqrt(2) / 2.) * divby;
  res[1] = ellFaux(cos_n, sin_n, Math.sqrt(2) / 2.) * divby;
  res[2] = 0; res[3] = 1;

  if (x > 1) {
    if (abs(res[0]) > abs(res[1])) {
      if (res[0] > 0) res[0] = 2 - res[0]; else res[0] = -2 - res[0];
    }
    else {
      if (res[1] > 0) res[1] = 2 - res[1]; else res[1] = -2 - res[1];
    }
  }

  res = hdiv(res, pconf().model_transition);
  return res;
}

export function hyperboloid_form(ret: hyperpoint): hyperpoint {
  ret = hdiv(tmulh(cspin90(2, 1), ret), 3);
  if (hyperbolic()) ret[1] += 1 / 3.;
  ret = tmulh(pconf().ball(), ret);
  return ret;
}

export function product_projection(_H: hyperpoint, _ret: hyperpoint, _proj: eModel): void {
  notp('product_projection (product geometries)'); // STAGE2-STUB
}

export function apply_other_model(H_orig: shiftpoint, ret: hyperpoint, md: eModel): void {

  let H = hcopy(H_orig.h);

  if (models_product_model(md)) {
    notp('apply_other_model: product model'); // STAGE2-STUB (product geometries)
  }

  switch (md) {
    case mdPerspective:
    case mdGeodesic:
    case mdLiePerspective:
    case mdRelPerspective:
      notp('apply_other_model: perspective models (3D)'); // STAGE2-STUB
      break;

    case mdPixel:
      hset(ret, hdiv(H, cd().radius));
      return;

    case mdBall: {
      // vrhr::rendering(): false (CAP_VR)
      const zlev = find_zlev(H);

      const zl = G.vid.depth - geom3_factor_to_lev(zlev) * pconf().depth_scaling;

      ballmodel(ret, atan2_h(H), hdist0(H), zl);
      break;
    }

    case mdDisk: {
      if (mproduct() && pconf().alpha === 1) {
        product_projection(H, ret, mdDisk);
        break;
      }
      if (nonisotropic()) {
        notp('apply_other_model: mdDisk in nonisotropic geometries'); // STAGE2-STUB
      }
      // vrhr::rendering() && WDIM == 2: false (CAP_VR)
      const tz = get_tz(H);
      if (G.models_camera_straight) {
        ret[0] = H[0] / tz;
        ret[1] = H[1] / tz;
        if (GDIM() === 3) ret[2] = H[2] / tz;
        else ret[2] = G.vid.xres * display_data_eyewidth(cd()) / 2 / cd().radius - G.vid.ipd / tz / 2;
        ret[3] = 1; // MAXMDIM == 4
      }
      else {
        const tx = H[0];
        const ty = H[1];

        let p = hpt(tx, ty, tz, 1);
        p = tmulh(rot_inverse(pconf().cam()), p);

        ret[0] = p[0] / p[2];
        ret[1] = p[1] / p[2];
        ret[2] = G.vid.xres * display_data_eyewidth(cd()) / 2 / cd().radius - G.vid.ipd / p[2] / 2;
      }
      return;
    }

    case mdCentralInversion: {
      const tz = get_tz(H);
      for (let d = 0; d < GDIM(); d++) ret[d] = H[d] / tz;
      for (let d = GDIM(); d < 4; d++) ret[d] = 1;
      let r = 0;
      for (let d = 0; d < GDIM(); d++) r += ret[d] * ret[d];
      for (let d = 0; d < GDIM(); d++) ret[d] /= r;
      return;
    }

    case mdConformalEgg: {
      H = hdiv(H, H[GDIM()] + 1);
      scr_to_ori(H);

      const mul = pconf().model_transition / 9;

      const a = H[0], b = H[1];
      const A = a * a;
      const B = b * b;
      ret[0] = a + a * (A - 3 * B) * mul;
      ret[1] = b + b * (3 * A - B) * mul;

      ori_to_scr(ret);
      if (GDIM() === 2) ret[2] = 0;
      ret[3] = 1; // MAXMDIM == 4
      return;
    }

    case mdHalfplane: {
      if (mproduct()) {
        product_projection(H, ret, mdHalfplane);
        break;
      }
      // sphere && vrhr::rendering(): false (CAP_VR)
      // Poincare to half-plane

      const zlev = find_zlev(H);
      H = space_to_perspective(H);

      scr_to_ori(H);

      H[1] += 1;
      const rad = sqhypot_d(GDIM(), H);
      H = hdiv(H, -rad);
      H[1] += .5;

      if (GDIM() === 3) {
        // a bit simpler when we do not care about 3D
        H = hmul(H, pconf().halfplane_scale);
        ret[0] = -H[0];
        ret[1] = 1 + H[1];
        ret[2] = H[2];
        ret[3] = 1;
        ori_to_scr(ret);
        break;
      }

      /* it was inverted, so we apply scr_to_ori again */
      scr_to_ori(H);
      H = hmul(H, pconf().halfplane_scale);
      const ocos = pconf().mori().get()[0][0];
      const osin = pconf().mori().get()[1][0];

      ret[0] = -osin - H[0];
      let height = 0;
      if (zlev !== 1) {
        if (abs(ocos) > 1e-9)
          height += H[1] * (Math.pow(zlev, ocos) - 1);
        if (abs(ocos) > 1e-9 && osin)
          height += H[0] * osin * (Math.pow(zlev, ocos) - 1) / ocos;
        else if (osin)
          height += H[0] * osin * Math.log(zlev);
      }
      ret[1] = ocos + H[1];
      ret[2] = GDIM() === 3 ? H[2] : 0;
      ret[3] = 1; // MAXMDIM == 4
      if (zlev !== 1 && use_z_coordinate())
        apply_depth(ret, height);
      else
        ret[1] += height * pconf().depth_scaling;
      break;
    }

    case mdAxial: {
      make_axial(H, ret, (H: hyperpoint): number => {
        const mt = pconf().model_transition;

        let z = H[LDIM()];
        if (mt !== 1) z += (1 - mt) * pconf().alpha;

        let res = H[0] / z;

        if (mt) {
          if (mt < 1) res *= mt;
          res = atan_auto(res * mt);
          if (mt > 1) res /= mt;
        }
        return res;
      });

      if (sphere()) { ret[0] += G.axial_x * M_PI; ret[1] += G.axial_y * M_PI; }

      break;
    }

    case mdAntiAxial: {
      make_axial(H, ret, (H: hyperpoint): number => asin_auto(H[0]));
      break;
    }

    case mdQuadrant: {
      H = space_to_perspective(H);
      scr_to_ori(H);

      {
        const a = (H[0] + H[1]) / Math.sqrt(2), b = (H[1] - H[0]) / Math.sqrt(2);
        H[0] = a; H[1] = b;
      }

      H[1] += 1;
      const rad = sqhypot_d(GDIM(), H);
      H = hdiv(H, -rad);
      H[1] += .5;

      H = hmul(H, 2);

      const x = Math.exp(-H[0] / 2);
      ret[0] = -H[1] * x - 1;
      ret[1] = H[1] / x + 1;

      ori_to_scr(ret);
      break;
    }

    case mdHorocyclic: {

      if (sl2()) {
        notp('apply_other_model: mdHorocyclic in sl2'); // STAGE2-STUB
      }
      find_zlev(H);

      apply_nil_rotation(H);

      if (hyperbolic()) scr_to_ori(H);

      hset(ret, hyperbolic() ? deparabolic13(H) : H);
      hset(ret, hmul(ret, .5));
      ret[LDIM()] = 1;

      if (hyperbolic()) ori_to_scr(ret);

      // !vrhr::rendering()
      hset(ret, lp_apply(ret));

      break;
    }

    case mdHorocyclicEqa: {

      if (hyperbolic()) scr_to_ori(H);

      hset(ret, hyperbolic() ? deparabolic13(H) : H);
      ret[0] = Math.exp(-ret[0]) - 1;
      hset(ret, hmul(ret, .5));
      ret[LDIM()] = 1;

      if (hyperbolic()) ori_to_scr(ret);

      break;
    }

    case mdConformalSquare: {
      find_zlev(H);
      scr_to_ori(H);
      if (euclid()) { H[0] /= pconf().fisheye_param; H[1] /= pconf().fisheye_param; }
      hset(ret, to_square(H));
      ori_to_scr(ret);
      break;
    }

    case mdLieOrthogonal:
    case mdRelOrthogonal:
      notp('apply_other_model: Lie/relativistic orthogonal'); // STAGE2-STUB (lie_log, rel_log)
      break;

    case mdHemisphere: {

      // CAP_VR is 0: dir = 1
      const dir = 1;

      switch (cgclass()) {
        case gcHyperbolic: {
          if (pconf().small_hyperboloid) H = mid(C0(), H);
          const zl = zlevel(H);
          hset(ret, hdiv(H, H[2]));
          ret[2] = Math.sqrt(1 - sqhypot_d(2, ret));
          // need to reverse in VR
          hset(ret, hmul(ret, 1 + (zl - 1) * ret[2] * pconf().depth_scaling * dir));
          break;
        }

        case gcEuclid: default: {
          // stereographic projection to a sphere
          const hd = hdist0(H) / pconf().euclid_to_sphere;
          if (hd === 0) hset(ret, hpxyz(0, 0, -1));
          else {
            const x = 2 * hd / (1 + hd * hd);
            const y = x / hd;
            hset(ret, hdiv(hdiv(hmul(H, x), hd), pconf().euclid_to_sphere));
            ret[2] = (1 - y);
            ret[2] *= dir;
            hset(ret, hmul(ret, 1 + (H[2] - 1) * y * pconf().depth_scaling * dir / pconf().euclid_to_sphere));
            if (pconf().small_hyperboloid) { hset(ret, hsub(ret, C0())); hset(ret, hdiv(ret, hypot_d(3, ret))); }
          }
          break;
        }

        case gcSphere: {
          if (pconf().small_hyperboloid) H = mid(C0(), H);
          // vrhr::rendering(): false
          const z = sqhypot_d(3, H);
          const s = H[2] > 0 ? 1 : -1;
          hset(ret, H);
          hset(ret, hdiv(ret, ret[2]));
          ret[2] = Math.sqrt(1 + ret[0] * ret[0] + ret[1] * ret[1]) * s;
          hset(ret, hmul(ret, z));
          const topz = pconf().top_z;
          if (abs(ret[2]) > topz || (G.hemi_side && s !== G.hemi_side)) {
            const scale = Math.sqrt(topz * topz - 1) / hypot_d(2, ret);
            hset(ret, hmul(ret, scale));
            ret[2] = topz * s;
          }
          if (pconf().depth_scaling !== 1) {
            const v = intval(H, Hypc);
            hset(ret, hmul(ret, Math.pow(v, (dir * pconf().depth_scaling - 1) / 2)));
          }
          hset(ret, hdiv(ret, 3));
          break;
        }
      }

      // vrhr::rendering(): false

      { const t = ret[1]; ret[1] = ret[2]; ret[2] = t; }

      hset(ret, tmulh(pconf().ball(), ret));

      break;
    }

    case mdHyperboloidFlat:
    case mdHyperboloid: {

      if (nonisotropic()) {
        // if(nisot::local_perspective_used()) H = NLP * H;
        hset(ret, lp_apply(H));
        break;
      }
      if (gproduct()) {
        hset(ret, H);
        break;
      }

      // CAP_VR: vrhr::rendering() is false

      if (pconf().small_hyperboloid) H = mid(H, C0());

      hset(ret, H);

      if (sphere() && pconf().model === mdHyperboloidFlat) {
        const s = H[2] > 0 ? 1 : -1;
        hset(ret, hdiv(ret, ret[2]));
        ret[2] = Math.sqrt(1 + ret[0] * ret[0] + ret[1] * ret[1]) * s;
      }

      if (pconf().depth_scaling !== 1) {
        const v = intval(ret, Hypc);
        hset(ret, hmul(ret, Math.pow(v, (pconf().depth_scaling - 1) / 2)));
      }

      if (pconf().model === mdHyperboloid) {
        const topz = pconf().top_z;
        if (ret[2] > topz) {
          const scale = Math.sqrt(topz * topz - 1) / hypot_d(2, ret);
          hset(ret, hmul(ret, scale));
          ret[2] = topz;
        }
      }
      else {
        hset(ret, space_to_perspective(ret, pconf().alpha));
        ret[2] = 1 - pconf().alpha;
        if (sphere()) ret[2] = -ret[2];
      }

      hset(ret, hyperboloid_form(ret));
      break;
    }

    case mdFisheye: {
      let zlev;
      if (nonisotropic()) {
        notp('apply_other_model: mdFisheye in nonisotropic geometries'); // STAGE2-STUB
      }
      else {
        zlev = find_zlev(H);
        H = space_to_perspective(H);
      }
      H = hdiv(H, pconf().fisheye_param);
      H[LDIM()] = zlev!;
      hset(ret, hdiv(H, Math.sqrt(1 + sqhypot_d(GDIM() + 1, H))));
      if (GDIM() === 3) ret[LDIM()] = zlev!;
      break;
    }

    case mdFisheye2: {
      let zlev;
      if (nonisotropic()) {
        notp('apply_other_model: mdFisheye2 in nonisotropic geometries'); // STAGE2-STUB
      }
      else {
        zlev = find_zlev(H);
        H = space_to_perspective(H);
      }
      H = hdiv(H, pconf().fisheye_param);
      let H1 = perspective_to_space(H, pconf().fisheye_alpha, gcSphere);
      const H2 = perspective_to_space(hpt(1e6, 0, 0, 0), pconf().fisheye_alpha, gcSphere);
      H1[2] += 1;
      H1 = hdiv(H1, H1[2]);
      H1 = hdiv(H1, H2[0] / (H2[2] + 1));
      hset(ret, H1);
      if (GDIM() === 3) ret[LDIM()] = zlev!;
      break;
    }

    case mdSimulatedPerspective: {
      scr_to_ori(H);
      const yz = move_z_to_y(H);
      const Hl = tmulh(xpush(-pconf().twopoint_param), H);
      const Hr = tmulh(xpush(+pconf().twopoint_param), H);
      const lyx = (Hl[1] + 1e-7) / (Hl[0] + 1e-8);
      const ryx = (Hr[1] + 1e-7) / (Hr[0] + 1e-8);

      ret[0] = -pconf().twopoint_param * (ryx + lyx) / (lyx - ryx);
      ret[1] = (ret[0] + pconf().twopoint_param) * lyx;
      ret[2] = 0;

      ret[0] = -ret[0]; ret[1] = -ret[1];

      move_y_to_z(ret, yz);
      ori_to_scr(ret);
      break;
    }

    case mdTwoHybrid: {
      scr_to_ori(H);
      const yz = move_z_to_y(H);

      hset(ret, compute_hybrid(H, G.whateveri[0]));

      move_y_to_z(ret, yz);
      ori_to_scr(ret);
      break;
    }

    case mdJoukowsky:
    case mdJoukowskyInverted: {
      scr_to_ori(H);
      // with equal speed skiprope: models::scr_to_orientation(H[1], H[0]);

      if (pconf().skiprope) {
        notp('apply_other_model: Joukowsky skiprope'); // STAGE2-STUB (complex sqrt)
      }

      H = space_to_perspective(H);
      const yz = move_z_to_y(H);
      const r = hypot_d(2, H);
      const c = H[0] / r;
      const s = H[1] / r;
      const mt = pconf().model_transition;
      let a = 1 - .5 * mt, b = .5 * mt;
      { const t = a; a = b; b = t; }

      ret[0] = (a * r + b / r) * c / 2;
      ret[1] = (a * r - b / r) * s / 2;
      ret[2] = 0;

      if (pconf().skiprope)
        hset(ret, mobius(ret, pconf().skiprope, 2));

      if (pconf().model === mdJoukowskyInverted) {
        const r2 = sqhypot_d(2, ret);
        if (pconf().dualfocus_autoscale)
          hset(ret, hmul(ret, (1 - pconf().model_transition) / 2));

        ret[0] = ret[0] / r2;
        ret[1] = -ret[1] / r2;
        move_y_to_z(ret, yz);
      }
      else {
        move_y_to_z(ret, yz);
      }
      ori_to_scr(ret);

      break;
    }

    case mdPolygonal: case mdPolynomial:
      notp('apply_other_model: polygonal/polynomial (polygonal::compute)'); // STAGE2-STUB (models.cpp)
      break;

    case mdBand:
      if (pconf().model_transition !== 1) {
        H = hcopy(unshift(H_orig));
        const mt = pconf().model_transition;

        H = space_to_perspective(H);

        scr_to_ori(H);

        H[0] += 1;
        const rad = H[0] * H[0] + H[1] * H[1];
        H[1] /= rad;
        H[0] /= rad;
        H[0] -= .5;

        let phi = atan2_h(H);
        let r = hypot_d(2, H);

        r = Math.pow(r, 1 - mt);
        phi *= (1 - mt);
        ret[0] = r * Math.cos(phi);
        ret[1] = r * Math.sin(phi);
        ret[2] = 0;

        ret[0] -= Math.pow(0.5, 1 - mt);
        ret[0] /= -(1 - mt) * deg(90);
        ret[1] /= (1 - mt) * deg(90);

        ori_to_scr(ret);
      }
      else
        makeband(H_orig, ret, band_conformal);
      break;

    case mdMiller:
      makeband(H_orig, ret, (p: bandxy) => {
        p.y *= pconf().miller_parameter;
        band_conformal(p);
        p.y /= pconf().miller_parameter;
      });
      break;

    case mdLoximuthal:
      makeband(H_orig, ret, (p: bandxy) => {
        let orig_y = p.y;
        band_conformal(p);
        const q = { x: 0, y: pconf().loximuthal_parameter }; band_conformal(q);
        p.y -= q.y;

        orig_y -= pconf().loximuthal_parameter;

        if (p.y) p.x = p.x * orig_y / p.y;
        p.y = orig_y;
      });
      break;

    case mdTwoPoint:
      makeband(H_orig, ret, make_twopoint);
      break;

    case mdThreePoint:
      notp('apply_other_model: three-point projection (3D)'); // STAGE2-STUB
      break;

    case mdMollweide:
      makeband(H_orig, ret, (p: bandxy) => {
        const y = p.y;
        let theta =
          hyperbolic() ? Math.min(y / 2 + 0.572365, y * 0.78509) :
          euclid() ? y :
          y > 0 ? Math.max(y * 0.012 / 0.015, deg(90) - (deg(90) - y) * 0.066262 / 0.015708) :
          Math.min(y * 0.012 / 0.015, -deg(90) + (deg(90) + y) * 0.066262 / 0.015708);

        if (sphere() && abs(theta) >= deg(90) - 1e-6) { /* nothing */ }
        else {
          for (let it = 0; it < 4; it++) {
            const a = (sin_auto(2 * theta) + 2 * theta - M_PI * sin_auto(y));
            const b = (2 + 2 * cos_auto(2 * theta));
            theta = theta - a / b;
          }
        }
        p.y = deg(90) * sin_auto(theta);
        p.x = p.x * cos_auto(theta);
      });
      break;

    case mdCentralCyl:
      makeband(H_orig, ret, (p: bandxy) => {
        p.y = tan_auto(p.y); const top = G.vid.yres * M_PI / cd().radius; if (p.y > top) p.y = top; if (p.y < -top) p.y = -top;
      });
      break;

    case mdGallStereographic:
      makeband(H_orig, ret, (p: bandxy) => {
        p.y = 2 * sin_auto(p.y) / (1 + cos_auto(p.y));
        const top = G.vid.yres * M_PI / cd().radius; if (p.y > top) p.y = top; if (p.y < -top) p.y = -top;
      });
      break;

    case mdAitoff: case mdHammer: case mdWinkelTripel:
      makeband(H_orig, ret, (p: bandxy) => {
        const ox = p.x, oy = p.y;
        p.x *= pconf().aitoff_parameter;

        const x0 = sin_auto(p.x) * cos_auto(p.y);
        const y0 = cos_auto(p.x) * cos_auto(p.y);
        const z0 = sin_auto(p.y);

        let d = acos_auto(y0);
        const d0 = Math.hypot(x0, z0);

        if (md === mdAitoff || md === mdWinkelTripel) { /* nothing */ }
        else if (sphere()) d = Math.sqrt(2 * (1 - Math.cos(d))) * deg(90);
        else d = Math.sqrt(2 * (Math.cosh(d) - 1)) / 1.5;

        p.x = x0 * d / d0 / pconf().aitoff_parameter; p.y = z0 * d / d0;
        if (md === mdWinkelTripel) {
          p.x = lerp_ld(p.x, ox, pconf().winkel_parameter);
          p.y = lerp_ld(p.y, oy, pconf().winkel_parameter);
        }
      });
      break;

    case mdWerner: {

      scr_to_ori(H);

      find_zlev(H); // ignored for now

      const r = hdist0(H);
      if (r === 0) { hset(ret, H); return; }
      let angle = Math.atan2(H[0], H[1]);
      angle *= sin_auto(r) / r;

      ret[0] = Math.sin(angle) * r;
      ret[1] = Math.cos(angle) * r;
      ret[2] = 0;
      ret[3] = 1;

      ori_to_scr(ret);
      break;
    }

    case mdCollignon:
      H_orig = { h: hcopy(H_orig.h), shift: H_orig.shift }; // (a by-value parameter in C++)
      find_zlev(H_orig.h);
      makeband(H_orig, ret, (p: bandxy) => {
        let sgn = 1;
        if (pconf().collignon_reflected && p.y > 0) { p.y = -p.y; sgn = -1; }
        p.y = signed_sqrt(sin_auto(p.y) + pconf().collignon_parameter);
        p.x *= p.y / 1.2;
        p.y -= signed_sqrt(pconf().collignon_parameter);
        p.y *= sgn;
        p.y *= M_PI;
      });
      break;

    case mdBandEquiarea:
      makeband(H_orig, ret, (p: bandxy) => { p.y = sin_auto(p.y); });
      break;

    case mdBandEquidistant:
      makeband(H_orig, ret, (_p: bandxy) => { });
      break;

    case mdSinusoidal:
      makeband(H_orig, ret, (p: bandxy) => { p.x *= cos_auto(p.y); });
      break;

    case mdPolar: {
      scr_to_ori(H);
      H = tmulh(xpush(pconf().offside), H);
      const zlev = find_zlev(H);
      const z = { d: hdist0(H), df: 0, zf: 0 };
      hypot_zlev(zlev, z);
      ret[0] = -atan2_h(H) / M_PI;
      ret[1] = (z.d - pconf().offside2) / M_PI;
      ret[2] = z.zf;
      ret[3] = 1;
      ori_to_scr(ret);
      break;
    }

    case mdEquidistant: case mdEquiarea: case mdEquivolume: {
      // vrhr::rendering() && GDIM == 3 && pmodel == mdEquidistant: false (CAP_VR)

      if (nonisotropic() || gproduct()) {
        notp('apply_other_model: azimuthal models in nonisotropic/product geometries'); // STAGE2-STUB
      }
      const zlev = find_zlev(H);

      let rad = hypot_d(GDIM(), H);
      if (rad === 0) rad = 1;
      const z = { d: hdist0(H), df: 0, zf: 0 };
      hypot_zlev(zlev, z);
      let d = z.d;
      const df = z.df, zf = z.zf;

      if (md === mdEquivolume)
        d = Math.pow(volume_auto(d), 1 / 3.) * Math.pow(deg(90), 1 / 3.);
      else if (md === mdEquiarea && sphere()) {
        d = Math.sqrt(2 * (1 - Math.cos(d))) * deg(90);
      }
      else if (pconf().model === mdEquiarea && hyperbolic())
        d = Math.sqrt(2 * (Math.cosh(d) - 1)) / 1.5;

      let factor = d * df / rad;
      factor /= M_PI; // !vrhr::rendering()

      hset(ret, hmul(H, factor));
      if (GDIM() === 2) ret[2] = 0;
      ret[3] = 1; // MAXMDIM == 4
      if (zlev !== 1 && use_z_coordinate())
        apply_depth(ret, d * zf / M_PI);

      break;
    }

    case mdRotatedHyperboles: {
      // ld zlev =  <- not implemented
      find_zlev(H); // + vid.depth;
      scr_to_ori(H);

      const y = asin_auto(H[1]);
      const x = asin_auto_clamp(H[0] / cos_auto(y));
      // ld z = zlev == 1 ? 0 : geom3::factor_to_lev(zlev);

      const factor = geom3_lev_to_factor(y + G.vid.depth);

      ret[0] = Math.sinh(x) * factor;
      ret[1] = Math.cosh(x) * factor;
      ret[2] = 0;

      if (pconf().use_atan) {
        ret[0] = Math.atan(ret[0]);
        ret[1] = Math.atan(ret[1]);
      }

      break;
    }

    case mdFormula:
      notp('apply_other_model: mdFormula (exp_parser)'); // STAGE2-STUB
      break;

    case mdSpiral:
      notp('apply_other_model: mdSpiral (complex numbers of models::spiral_multiplier)'); // STAGE2-STUB
      break;

    case mdRetroCraig: {
      makeband(H_orig, ret, (p: bandxy) => {
        if (p.x)
          p.y = p.x / sin_auto(p.x) * (sin_auto(p.y) * cos_auto(p.x) - tan_auto(pconf().loximuthal_parameter) * cos_auto(p.y));
        else
          p.y = sin_auto(p.y) - tan_auto(pconf().loximuthal_parameter) * cos_auto(p.y);
      });
      break;
    }

    case mdRetroLittrow: {
      makeband(H_orig, ret, (p: bandxy) => {
        const nx = sin_auto(p.x) / cos_auto(p.y);
        const ny = cos_auto(p.x) * tan_auto(p.y);
        p.x = nx; p.y = ny;
      });
      break;
    }

    case mdRetroHammer: {
      const d = hdist(H, ypush0(pconf().loximuthal_parameter));
      const Hc = hcopy(H);
      makeband(H_orig, ret, (p: bandxy) => {
        if (p.x === 0 && p.y === 0) return;

        if (p.x)
          p.y = p.x / sin_auto(p.x) * (sin_auto(p.y) * cos_auto(p.x) - tan_auto(pconf().loximuthal_parameter) * cos_auto(p.y));
        else
          p.y = sin_auto(p.y) - tan_auto(pconf().loximuthal_parameter) * cos_auto(p.y);

        let scale = d / Math.hypot(p.x, p.y);
        if (Hc[2] < 0) scale = -scale;
        p.x *= scale;
        p.y *= scale;
      });
      break;
    }

    case mdPanini: {
      find_zlev(H);
      scr_to_ori(H);

      const proh = Math.sqrt(H[2] * H[2] + curvature() * H[0] * H[0]);
      H = hdiv(H, proh);
      H = hdiv(H, H[2] + pconf().alpha);
      hset(ret, H);
      ret[2] = 0; ret[3] = 1;

      ori_to_scr(ret);
      break;
    }

    case mdPoorMan: {
      find_zlev(H);
      H = space_to_perspective(H);

      scr_to_ori(H);

      const u = H[0], v = H[1];
      if (abs(u) > 1e-3 && abs(v) > 1e-3) {
        const r2 = u * u + v * v;
        let scale = Math.sqrt((-r2 + Math.sqrt(r2 * (r2 + 4 * u * u * v * v * (r2 - 2)))) / (2 * (r2 - 2))) / u / v;
        if (u * v < 0) scale = -scale;
        H = hmul(H, scale);
      }
      hset(ret, H);
      ret[2] = 0;
      ret[3] = 1;

      ori_to_scr(ret);
      break;
    }

    case mdGUARD: case mdManual: break;

    default:
      if (md < isize(G.extra_projections) && G.extra_projections[md])
        G.extra_projections[md](H_orig, H, ret);
      break;
  }

  ghcheck(ret, H_orig);
}

// game-related graphics

export function outofmap(h: hyperpoint): boolean {
  if (GDIM() === 3)
    return false;
  else if (euclid())
    return h[2] < .5; // false; // h[0] * h[0] + h[1] * h[1] > 15 * cgi.crossf;
  else if (sphere())
    return h[2] < .1 && h[2] > -.1 && h[1] > -.1 && h[1] < .1 && h[0] > -.1 && h[0] < .1;
  else
    return h[2] < .5;
}

export function mirrorif(V: hyperpoint, b: boolean): hyperpoint {
  if (b) return tmulh(Mirror, V);
  else return V;
}

export function mirrorif_sm(V: shiftmatrix, b: boolean): shiftmatrix {
  if (b) return smul(V, Mirror);
  else return V;
}

/** -1 if away, 0 if not away */
export function away(V2: transmatrix): number {
  return (intval(C0(), tmulh(V2, xpush0(.1))) > intval(C0(), tC0(V2))) ? -1 : 0;
}

export function zgrad0(l1: number, l2: number, nom: number, den: number): number {
  return geom3_lev_to_factor(l1 + (l2 - l1) * nom / den);
}

export function behindsphere(h: hyperpoint): boolean {
  if (!sphere()) return false;

  if (mdBandAny()) return false;

  if (pconf().alpha > 1) {
    if (h[LDIM()] > -1 / pconf().alpha) return true;
  }

  if (pconf().alpha <= 1) {
    if (h[LDIM()] < .2 - pconf().alpha) return true;
  }

  return false;
}

function to01(a0: number, a1: number, x: number): number {
  if (x < a0) return 0;
  if (x > a1) return 1;
  return (x - a0) / (a1 - a0);
}

export function spherity(h: hyperpoint): number {
  if (!sphere()) return 1;

  if (pconf().alpha > 1) {
    return to01(1 / pconf().alpha, 1, abs(h[2]));
  }

  if (pconf().alpha <= 1) {
    return to01(-1.5, 1, h[2]);
  }

  return 1;
}

export function behindsphere_T(V: transmatrix): boolean {
  return behindsphere(tC0(V));
}

export function behindsphere_sm(V: shiftmatrix): boolean {
  return behindsphere(tC0(V.T));
}

export function spherity_T(V: transmatrix): number {
  return spherity(tC0(V));
}

export function confusingGeometry(): boolean {
  // MAXMDIM >= 4: reg3::ultra_mirror_in() is false in 2D
  if (WDIM() === 3) notp('confusingGeometry: reg3::ultra_mirror_in (3D)'); // STAGE2-STUB
  if (mproduct() || mtwisted()) return notp('confusingGeometry: product geometries'); // STAGE2-STUB
  return quotient() || elliptic() || (fake_in() && notp('confusingGeometry: fake::multiple'));
}

export function master_to_c7_angle(): number {
  if (dont_inverse()) return 0;
  if (mhybrid()) return hybrid_in_underlying_geometry(master_to_c7_angle);
  if (WDIM() === 3) return 0;
  let alpha = 0;
  // CAP_GP
  if (cgi().gpdata) alpha = cgi().gpdata!.alpha;
  return (!BITRUNCATED() && !bt_in() && !arcm_in()) ? M_PI + alpha : 0;
}

export function actualV(hs: heptspin, V: transmatrix): transmatrix {
  if (gproduct()) return notp('actualV: product geometries'); // STAGE2-STUB
  if (WDIM() === 3) return V;
  // CAP_IRR
  if (IRREGULAR())
    return notp('actualV: irregular'); // STAGE2-STUB (irr::periodmap)
  // CAP_ARCM
  if (arcm_in()) return notp('actualV: archimedean'); // STAGE2-STUB
  // CAP_BT
  if (bt_in()) return V;
  if (kite_in()) return V;
  return (hs.spin || !BITRUNCATED()) ? tmul(V, spin(hs.spin * TAU / hs.at.type + master_to_c7_angle())) : V;
}

export function actualV_sm(hs: heptspin, V: shiftmatrix): shiftmatrix {
  return shiftless_t(actualV(hs, V.T), V.shift);
}

export function point_behind(_h: shiftpoint): boolean {
  if (sphere()) return false;
  if (!in_perspective()) return false;
  return notp('point_behind: perspective models'); // STAGE2-STUB (3D)
}

export function invalid_matrix(T: transmatrix): boolean {
  const n = GDIM();
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
    if (Number.isNaN(T[i][j]) || T[i][j] > 1e8 || T[i][j] < -1e8 || !Number.isFinite(T[i][j]))
      return true;
  if (gproduct() || (cgflags() & qAFFINE)) {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (abs(T[i][j]) > 1e-60) return false;
  }
  else
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (T[i][j] > .5 || T[i][j] < -.5) return false;
  return true;
}

export function invalid_point(h: hyperpoint): boolean {
  const l = LDIM();
  return Number.isNaN(h[l]) || h[l] > 1e8 || h[l] === Infinity || h[l] === -Infinity;
}

export function invalid_point_sp(h: shiftpoint): boolean { return invalid_point(h.h); }

/** convert the result of applymodel to on-screen coordinates */
export function toscrcoord(h1: hyperpoint): hyperpoint {
  const h2 = hnew();
  h2[0] = cd().xcenter + cd().radius * h1[0];
  h2[1] = cd().ycenter + cd().radius * h1[1] * pconf().stretch;
  h2[2] = h1[2];
  return h2;
}

export function in_smart_range(T: shiftmatrix): boolean {
  const h = tC0_sm(T);
  if (invalid_point_sp(h)) return false;
  if (nil() || nih()) return true;
  // CAP_SOLV
  if (pconf().model === mdGeodesic) return notp('in_smart_range: nisot::in_table_range'); // STAGE2-STUB
  const h1 = hnew();
  applymodel(h, h1);
  if (invalid_point(h1)) return false;
  const hscr = toscrcoord(h1);
  const x = hscr[0], y = hscr[1];

  const inp = in_perspective();

  if (G.frustum_culling) {
    if (x > cd().xtop + cd().xsize * 2) return false;
    if (x < cd().xtop - cd().xsize * 1) return false;
    if (y > cd().ytop + cd().ysize * 2) return false;
    if (y < cd().ytop - cd().ysize * 1) return false;
    if (GDIM() === 3 && !inp) {
      if (-h1[2] < pconf().clip_min * 2 - pconf().clip_max) return false;
      if (-h1[2] > pconf().clip_max * 2 - pconf().clip_min) return false;
    }
  }

  const epsilon = 0.01;

  const ar: transmatrix = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

  let dx = 0, dy = 0, dz = 0;
  const dh = [0, 0, 0, 0];
  for (let i = 0; i < GDIM(); i++) {
    const h2 = hnew();
    applymodel(smulh(T, cpush0(i, epsilon)), h2);
    const x1 = cd().radius * abs(h2[0] - h1[0]) / epsilon;
    const y1 = cd().radius * abs(h2[1] - h1[1]) * pconf().stretch / epsilon;

    for (let j = 0; j < GDIM(); j++) ar[i][j] = cd().radius * (h2[j] - h1[j]) / epsilon;

    dx = Math.max(dx, x1); dy = Math.max(dy, y1);
    if (GDIM() === 3) dz = Math.max(dz, abs(h2[2] - h1[2]));
    dh[i] = Math.hypot(x1, y1);
  }

  if (GDIM() === 2 && G.vid.smart_area_based) {
    const area = det2(ar);
    const scale = Math.sqrt(area) * cgi().scalefactor * hcrossf7;
    if (scale <= G.vid.smart_range_detail) return false;
  }

  else if (GDIM() === 3) {
    if (!inp && (-h1[2] + 2 * dz < pconf().clip_min || -h1[2] - 2 * dz > pconf().clip_max)) return false;
    const s = dh.slice(0, 3).sort((a, b) => a - b);
    const scale = Math.sqrt(s[1] * s[2]) * cgi().scalefactor * hcrossf7;
    if (scale <= (WDIM() === 2 ? G.vid.smart_range_detail : G.vid.smart_range_detail_3)) return false;
  }
  else {
    const scale = Math.sqrt(dh[0] * dh[1]) * cgi().scalefactor * hcrossf7;
    if (scale <= G.vid.smart_range_detail) return false;
  }

  if (!G.frustum_culling) return true;

  return (
    x - 2 * dx < cd().xtop + cd().xsize &&
    x + 2 * dx > cd().xtop &&
    y - 2 * dy < cd().ytop + cd().ysize &&
    y + 2 * dy > cd().ytop);
}

// CAP_GP: namespace gp { drawrec } (stage 3, package G2)

function gp_drawrec_at(c: cell, V: shiftmatrix, at: loc, dir: number, maindir: number, li: gp_local_info): boolean {
  let res = false;
  const V1 = smul(V, cgi().gpdata!.Tf[li.last_dir][at[0] & GOLDBERG_MASK][at[1] & GOLDBERG_MASK][gp_fixg6(dir)]);
  if (do_draw_T(c, V1)) {
    li.relative = at;
    li.total_dir = gp_fixg6(dir);
    G.gp_current_li = { last_dir: li.last_dir, relative: [li.relative[0], li.relative[1]], first_dir: li.first_dir, total_dir: li.total_dir };
    G.gp_li_for = c;
    drawcell(c, V1);
    res = true;
  }
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i);
    if (!c2) continue;
    if (c2.move(0) !== c) continue;
    if (c2 === c2.master.c7) continue;
    res = drawrec_li(c2, V, gp_loc_add(at, gp_eudir(dir + i)), dir + i + SG3(), maindir, li) || res;
  }
  return res;
}
/** the local_info li is passed by value */
function drawrec_li(c: cell, V: shiftmatrix, at: loc, dir: number, maindir: number, li: gp_local_info): boolean {
  return gp_drawrec_at(c, V, at, dir, maindir, { last_dir: li.last_dir, relative: [li.relative[0], li.relative[1]], first_dir: li.first_dir, total_dir: li.total_dir });
}

function gp_drawrec(c: cell, V: shiftmatrix): boolean {
  const li: gp_local_info = { relative: [0, 0], total_dir: 0, last_dir: -1, first_dir: -1 };
  G.gp_li_for = c;
  G.gp_current_li = { last_dir: -1, relative: [0, 0], first_dir: -1, total_dir: 0 };
  let res = false;
  if (do_draw_T(c, V)) {
    drawcell(c, V); res = true;
  }
  for (let i = 0; i < c.type; i++) {
    const c2 = c.move(i);
    if (!c2) continue;
    if (c2.move(0) !== c) continue;
    if (c2 === c2.master.c7) continue;
    li.last_dir = i;
    res = drawrec_li(c2, V, [1, 0], SG3(), i, li) || res;
  }
  return res;
}

/** vector<tuple<heptspin, hstate, shiftmatrix> > drawn_cells */
let drawn_cells: [heptspin, hstate, shiftmatrix][] = [];

export function drawcell_subs(c: cell, V: shiftmatrix): boolean {

  // CAP_GP
  if (GOLDBERG()) {
    return gp_drawrec(c, V);
  }

  let draw = false;

  // CAP_IRR
  if (IRREGULAR()) {
    return notp('drawcell_subs: irregular'); // STAGE2-STUB
  }

  if (do_draw_T(c, V)) {
    draw = true;
    drawcell(c, V);
  }

  if (BITRUNCATED()) for (let d = 0; d < c.type; d++) {
    const c1 = c.move(d);
    if (!c1) continue;
    if (c.c.spin(d) === 0) {
      const V2 = smul(V, (G.currentmap as hrmap).adj(c, d));
      if (do_draw_T(c1, V2)) {
        draw = true;
        drawcell(c1, V2);
      }
    }
  }

  return draw;
}

/** void hrmap::draw_all() */
export function hrmap_draw_all(m: hrmap): void {
  if (sphere() && pconf().model === mdSpiral) {
    notp('hrmap::draw_all: the spiral model on the sphere'); // STAGE2-STUB
  }
  else
    m.draw_at(cd().precise_center, cview());
}

/** void hrmap::draw_at(cell *at, const shiftmatrix& where) */
export function hrmap_draw_at(m: hrmap, at: cell, where: shiftmatrix): void {
  dq_clear_all();
  const enq = confusingGeometry() ? dq_enqueue_by_matrix_c : dq_enqueue_c;

  enq(at, where);

  while (G.dq_drawqueue_c.length) {
    const p = G.dq_drawqueue_c[0];
    const c = p[0];
    const V = p[1];
    G.dq_drawqueue_c.shift();

    if (!do_draw_T(c, V)) continue;
    drawcell(c, V);
    if (in_wallopt() && isWall3(c) && isize(G.dq_drawqueue) > 1000) continue;

    // MAXMDIM >= 4: reg3::ultra_mirror_in() (3D)
    if (WDIM() === 3) notp('hrmap::draw_at: reg3::ultra_mirror_in (3D)'); // STAGE2-STUB

    for (let i = 0; i < c.type; i++) {
      // note: need do cmove before c.spin
      const c1 = c.cmove(i);
      if (c1 === G.out_of_bounds) continue;
      enq(c1, optimized_shift(smul(V, m.adj(c, i))));
    }
  }
}

/** void hrmap_standard::draw_at(cell *at, const shiftmatrix& where) */
export function hrmap_standard_draw_at(m: hrmap_standard, at: cell, where: shiftmatrix): void {
  if (S3() > 4) {
    hrmap_draw_at(m, at, where);
    return;
  }
  drawn_cells.length = 0;
  drawn_cells.push([new heptspin(at.master, 0, false), hsOrigin, smul(where, m.master_relative(at, true))]);
  for (let i = 0; i < isize(drawn_cells); i++) {
    // prevent reallocation due to insertion (C++ only)

    const dc = drawn_cells[i];
    const hs = dc[0];
    const s = dc[1];
    const V = dc[2];

    const c = hs.at.c7;

    const V1 = hs.mirrored ? smul(V, Mirror) : V;

    let draw = drawcell_subs(c, actualV_sm(hs, V1));

    if (sphere()) draw = true;

    if (draw) for (let d = 0; d < c.master.type; d++) {
      const s2 = transition(s, d);
      if (s2 === hsError) continue;
      const hs2 = hs.plus(d).addStep();
      let Vd: shiftmatrix;
      if (inforder_mixed()) {
        const d1 = gmod(hs.spin + d, c.type);
        Vd = smul(smul(smul(V, spin(-TAU * d / c.type)), xpush(m.spacedist(c, d1))), spin180());
      }
      else
        Vd = smul(V, cgi().heptmove[d]);
      optimize_shift_sm(Vd);
      drawn_cells.push([hs2, s2, Vd]);
    }
  }
}

/** inforder::mixed() (inforder.cpp): cgflags & qINFMIXED */
function inforder_mixed(): boolean { return (cgflags() & qINFMIXED) !== 0n; }

export function has_fixed_yz(): boolean {
  if (G.walking_on) return false;
  return (embedded_plane() || mhybrid() || nil() || (euclid() && WDIM() === 3) || sol() || nih() || (cgflags() & qSTRETCHABLE) !== 0n || (hyperbolic() && bt_in()));
}

export function keep_vertical(): boolean {
  if (G.vid.fixed_yz && has_fixed_yz()) return true; // !CAP_ORIENTATION
  if (G.downseek.qty) return true;
  return false;
}

export function vertical_vector(): hyperpoint {
  const ds = G.downseek;
  if (embedded_plane() && G.vid.fixed_yz) {
    return notp('vertical_vector: embedded plane'); // STAGE2-STUB (3D)
  }
  if (mproduct() && G.vid.fixed_yz) {
    return notp('vertical_vector: product'); // STAGE2-STUB
  }
  if (((cgflags() & qSTRETCHABLE) || mtwisted()) && G.vid.fixed_yz) {
    return notp('vertical_vector: stretch'); // STAGE2-STUB
  }
  if ((nil() || (euclid() && GDIM() === 3) || sol() || nih()) && G.vid.fixed_yz) {
    return notp('vertical_vector: lztangent (3D)'); // STAGE2-STUB
  }
  if (hyperbolic() && bt_in() && G.vid.fixed_yz) {
    const h = tmulh(inverse(cd().view_matrix), C0());
    return tmulh(tmul(cd().view_matrix, parabolic13_at(deparabolic13(h))), xtangent(1));
  }
  if (ds.qty && gproduct())
    return notp('vertical_vector: product::inverse_exp'); // STAGE2-STUB
  if (ds.qty)
    return hcopy(ds.point);
  return C0();
}

export function spinEdge(aspd: number): void {

  // CAP_VR: vrhr::active() is false

  let downspin = 0;
  const ds = G.downseek;
  if (G.dual_state === 2) {
    notp('spinEdge: dual mode'); // STAGE2-STUB (multigame.cpp)
  }
  else if (G.playerfound && G.vid.fixed_facing) {
    const pV = unshift_sm(G.playerV);
    const H = tmulh(tmul(gpushxto0(tmulh(pV, C0())), pV), xpush0(5));
    downspin = Math.atan2(H[1], H[0]);
    downspin += G.vid.fixed_facing_dir * degree;
    if (G.flipplayer) downspin += M_PI;
    downspin = cyclefix(downspin, 0);
    aspd = (1 + 2 * abs(downspin)) * aspd;
  }
  else if (keep_vertical()) {
    let h = vertical_vector();
    if (ds.qty && GDIM() === 2) {
      h = tmulh(rot_inverse(G.models_rotation ? G.models_rotation.get() : Id), h); // null: trans23() = Id
    }
    downspin = -Math.atan2(h[0], h[1]);
    if (ds.qty) {
      downspin = cyclefix(downspin, 0);
      downspin = downspin * Math.min(ds.speed, 1);
    }
    else aspd = 999999;
  }
  if (downspin > aspd) downspin = aspd;
  if (downspin < -aspd) downspin = -aspd;
  rotate_view(cspin(0, 1, downspin));
}

export function spinEdge_full(): void { spinEdge(999999); }

/** convert a shiftmatrix to the coordinate system of View; usually used to set which_copy */
export function back_to_view(V: shiftmatrix): transmatrix {
  // ortho_inverse does not work in 2.5D, iso_inverse does not work in Nil.
  // just use inverse
  return tmul(inverse(G.actual_view_transform), unshift_sm(V));
}

export function fix_whichcopy(c: cell): void {
  if (!cd().cellmatrices.has(G.cwt.at)) return;
  cd().which_copy = back_to_view(gmatrix_at(c));
}

/** gmatrix[c] (std::map::operator[] inserts a default value when missing) */
function gmatrix_at(c: cell): shiftmatrix {
  const g = cd().cellmatrices;
  let v = g.get(c);
  if (!v) { v = { T: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], shift: 0, is_null: true }; g.set(c, v); }
  return v;
}

export function fix_whichcopy_if_near(): void {
  if (!cd().cellmatrices.has(G.cwt.at)) return;
  const T = back_to_view(gmatrix_at(G.cwt.at));
  if (!eqmatrix(T, cd().which_copy)) return;
  cd().which_copy = T;
}

/** adjust_eye(transmatrix& T, cell *c, ld sign) */
export function adjust_eye(T: mref, c: cell, sign: number): void {
  if (!embedded_plane()) return;
  geom3_do_auto_eye();
  let sl = snakelevel(c);
  if (isWorm(c.monst) && sl < 3) sl++;
  const i = cgi().emb.center_z();
  if (sl || G.vid.eye || i)
    T.set(tmul(T.get(), lzpush(sign * (cgi().RED[sl] - cgi().FLOOR - G.vid.eye + i))));
}

export function shmup_inverted(): boolean {
  if (!embedded_plane()) return false;
  return G.vid.wall_height < 0;
}

/** create the list of matrices that are affected when we shift/rotate the view. Usually this is not only the
 *  View matrix, but also auxiliary ones such as which_copy.
 *  flag & 1 : spins, so return only NLP if get_view_orientation() is NLP
 *  flag & 2 : if rugged, only View */
export function move_affected_matrices(flag: number): mref[] {
  if (flag & 1) {
    if (gproduct()) return [refNLP]; // &get_view_orientation() == &NLP
  }

  if ((flag & 2) && G.rug_rugged) return [refView];
  const res: mref[] = [];
  res.push(refView);
  res.push(refWhichCopy);
  res.push(refCwtV);
  if (mapeditor_dt_in()) notp('move_affected_matrices: mapeditor::cfree_old'); // STAGE2-STUB (map editor)
  return res;
}

/** adjust_aspeed(ld& aspd, ld R): returns the new aspd */
export function adjust_aspeed(aspd: number, R: number): number {
  aspd *= euclid() ? (2 + 3 * R * R) : (1 + R + (G.shmup_on ? 1 : 0));
  return aspd;
}

export function centerpc(aspd: number): void {

  if (subscreens_split(() => { centerpc(aspd); })) return;
  if (dual_split(() => { centerpc(aspd); })) return;

  // CAP_CRYSTAL && CAP_RUG
  if (cryst())
    crystal_centerrug(aspd);

  // CAP_RACING
  if (G.racing_on && racing_set_view()) return;

  // MAXMDIM >= 4
  if (G.shmup_on && G.vid.sspeed > -5 && GDIM() === 3) {
    notp('centerpc: shmup in 3D'); // STAGE2-STUB
  }

  if (G.ors_mode === 2 && G.vid.sspeed < 5) return;
  if (G.vid.sspeed >= 4.99) aspd = 1000;

  const mam = move_affected_matrices(0);
  for (const pV of mam) pV.set(ors_unrotate(pV.get()));

  /* what should we center? */
  let T: transmatrix;
  if (G.multi_players > 1)
    T = tcopy(unshift_sm(cd().player_matrix)); /* do not even try */
  else {
    T = tcopy(cd().which_copy);
    if (G.shmup_on)
      notp('centerpc: shmup::pc[0]->at'); // STAGE2-STUB (shmup)
  }

  if (invalid_matrix(T)) return;

  const Tr: mref = { get: () => T, set: (v) => { T = v; } };
  adjust_eye(Tr, G.cwt.at, +1);

  const H = tC0(T);

  const R = (zero_d(GDIM(), H) && !gproduct()) ? 0 : hdist0(H);

  if (R < 1e-9) {
    // either already centered or direction unknown
    /* if(playerfoundL && playerfoundR) {

      } */

    spinEdge(aspd);
    fix_whichcopy(G.cwt.at);
    for (const pV of mam) fixmatrix(pV.get());
  }

  else {
    aspd = adjust_aspeed(aspd, R);

    if (R < aspd) fix_whichcopy_if_near();

    if (R < aspd)
      shift_view_to(shiftless(H), shift_method(smaAutocenter));
    else
      shift_view_towards(shiftless(H), aspd, shift_method(smaAutocenter));

    for (const pV of mam) fixmatrix(pV.get());
    spinEdge(aspd);
  }

  if (G.set_multi && G.multi_two_focus) {
    // pconf.mori() = spin(-atan2(multi_point)): a trans23 made of one matrix (v2 = v3)
    const mo = pconf().mori();
    const S = spin(-atan2_h(G.multi_point));
    mo.v2 = tcopy(S); mo.v3 = tcopy(S);
    pconf().twopoint_param = hdist0(G.multi_point);
    const d = pconf().twopoint_param;
    if (among(pconf().model, mdJoukowsky, mdJoukowskyInverted)) {
      // pconf.mori() = pconf.mori() * spin90() (trans23's product: each of v2, v3; a rotation of the XY plane,
      // the same in 3 and 4 homogeneous dimensions)
      mo.v2 = tmul(mo.v2, spin90()); mo.v3 = tmul(mo.v3, spin90());
      pconf().model_transition = c_sinh(d) / (1 + c_cosh(d));
      pconf().dualfocus_autoscale = true;
    }
  }

  for (const pV of mam) pV.set(ors_rerotate(pV.get()));
}

export function optimizeview(): void {

  if (subscreens_split(optimizeview)) return;
  if (dual_split(optimizeview)) return;
  if (G.dont_optimize) return;

  const c = cd().precise_center;
  const iView = { v: view_inverse(cd().view_matrix) };
  callhooks(G.hooks_preoptimize);
  const base = { v: cd().precise_center };
  virtualRebase(base, iView);
  cd().precise_center = base.v;
  if (c !== cd().precise_center && (sphere() || sl2())) {
    notp('optimizeview: stretch::mstretch_matrix (sphere/sl2)'); // STAGE2-STUB (nonisotropic.cpp stretch::)
  }

  cd().view_matrix = iview_inverse(iView.v);
  fixmatrix(cd().view_matrix);
  callhooks(G.hooks_postoptimize);

  // CAP_PORTALS
  intra_apply_scale();

  walking_handle();

  if (is_boundary(cd().precise_center)) {
    cd().precise_center = c; cd().view_matrix = tcopy(G.oView);
  }
  else
    G.oView = tcopy(cd().view_matrix);

  // CAP_ANIMATIONS
  if (cd().precise_center && inmirror(cd().precise_center)) {
    anims_reflect_view();
  }
}

function addball(a: number, b: number, c: number): void {
  const h = hnew();
  ballmodel(h, a, b, c);
  for (let i = 0; i < 3; i++) h[i] *= cd().radius;
  curvepoint(h);
}

function ballgeometry(): void {
  queuereset(mdPixel, PPR.CIRCLE);
  for (let i = 0; i < 60; i++)
    addball(TAU * i / 60, 10, 0);
  for (let d = 10; d >= -10; d -= .2)
    addball(0, d, 0);
  for (let d = -10; d <= 10; d += .2)
    addball(0, d, G.vid.depth);
  addball(0, 0, -G.vid.camera);
  addball(0, 0, G.vid.depth);
  addball(0, 0, -G.vid.camera);
  addball(0, -10, 0);
  addball(0, 0, -G.vid.camera);
  queuecurve(shiftless_t(tcopy(Id)), darkena(0xFF, 0, 0x80), 0, PPR.CIRCLE);
  queuereset(pconf().model, PPR.CIRCLE);
}

/** enum class eCentering { face, edge, vertex } (config.cpp) */
const eCentering_edge = 1;

export function resetview(): void {
  // indenter_finish dif(debug_graph, "resetview");
  // EUCLIDEAN
  decide_lpu();
  cd().local_perspective = tcopy(Id);
  G.stretch_mstretch_matrix = tcopy(Id);
  const vo = get_view_orientation();
  if (G.cwt.at) {
    cd().precise_center = G.cwt.at;
    cd().view_matrix = iddspin(G.cwt.at, G.cwt.spin);
    if (!G.flipplayer) vo.set(tmul(spin180(), vo.get()));
    if (G.cwt.mirrored) vo.set(tmul(lmirror(), vo.get()));

    if (G.centering) {
      const vl = tmulh(cd().view_matrix, get_corner_position(G.cwt.at, G.cwt.spin));
      const vr = tmulh(cd().view_matrix, get_corner_position(G.cwt.at, (G.cwt.spin + 1) % G.cwt.at.type));

      const vm = (G.centering === eCentering_edge) ? mid(vl, vr) : vl;

      const rm = gpushxto0(vm);

      cd().view_matrix = tmul(tmul(spintox(tmulh(rm, vr)), rm), cd().view_matrix);
    }
  }
  else if (G.currentmap) {
    cd().precise_center = (G.currentmap as hrmap).gamestart();
    cd().view_matrix = tcopy(Id);
  }

  adjust_eye(refView, G.cwt.at, -1);

  if (WDIM() === 2) vo.set(tmul(spin(M_PI + G.vid.fixed_facing_dir * degree), vo.get()));
  if (WDIM() === 3) vo.set(tmul(cspin90(0, 2), vo.get()));
  vo.set(tmul(cgi().emb.intermediate_to_logical_scaled, vo.get()));
  if (embedded_plane()) vo.set(tmul(cspin90(1, 2), vo.get()));
  if (embedded_plane() && G.vid.wall_height < 0) vo.set(tmul(cspin180(0, 1), vo.get()));

  cd().player_matrix = shiftless_t(tcopy(cd().view_matrix));
  cd().which_copy =
    nonisotropic() ? gpushxto0(tC0(view_inverse(cd().view_matrix))) :
    tcopy(cd().view_matrix);
  // SDL_LockSurface(s);
  // SDL_UnlockSurface(s);
}

export function panning(hf0: shiftpoint, ht0: shiftpoint): void {
  const hf = hf0.h;
  const ht = unshift(ht0, hf0.shift);
  cd().view_matrix =
    tmul(tmul(tmul(rgpushxto0(hf), rgpushxto0(tmulh(gpushxto0(hf), ht))), gpushxto0(hf)), cd().view_matrix);
  G.playermoved = false; G.currently_scrolling = true;
}

export function fullcenter(): void {
  if (G.history_saved_ends === 0)
    G.history_path_for_lineanimation.length = 0;
  if (G.playerfound && false) centerpc(INF);
  else {
    bfs();
    resetview();
    drawthemap();
    if (!G.centering) centerpc(INF);
    cd().precise_center = G.cwt.at;
  }
  G.playermoved = !G.centering;
}

export function screenpos(x: number, y: number): transmatrix {
  const V = tcopy(Id);
  V[0][2] += (x - cd().xcenter) / cd().radius * (1 + pconf().alpha);
  V[1][2] += (y - cd().ycenter) / cd().radius * (1 + pconf().alpha);
  return V;
}

/* In 3D, we use the standard translation matrices to place stuff on the screen.
   In 2D, this does not work (as HyperRogue reduces matrices to 3x3) so we use the native disk projection */

let backup_geometry = 0;
let backup_variation = 0;
let backup_vid: videopar = null!;
let backup_lpu = false;
let backup_cam: transmatrix = null!;

/** enable the 'flat' model for drawing HUD. See hr::flat_model_enabler */
export function enable_flat_model(val: number): void {
  if (G.flat_on < 1 && G.flat_on + val >= 1) {
    // CAP_GL: glClear(GL_DEPTH_BUFFER_BIT) (the port draws the non-GL path)
    backup_geometry = G.geometry;
    backup_variation = G.variation;
    backup_cam = tcopy(pconf().cam());
    backup_lpu = G.nisot_local_perspective_used;
    backup_vid = G.vid.clone();
    G.geometry = gNormal;
    G.variation = eVariation.bitruncated;
    G.nisot_local_perspective_used = false;

    pconf().model = mdDisk;
    pconf().alpha = 1;
    pconf().scale = 1;
    set_cam(Id);
    pconf().stretch = 1;

    G.vid.always3 = false;
    G.vid.wall_height = .3;
    G.vid.human_wall_ratio = .7;
    G.vid.camera = 1;
    G.vid.depth = 1;
    G.vid.creature_scale = 1;
    geom3_apply_always3();
    check_cgi();
    cgi().require_basics();
    cgi().require_shapes();
    if (cgi().shFloor.b.length === 0) {
      const cm = dynamicval(() => G.currentmap, (v) => { G.currentmap = v; });
      try {
        G.currentmap = new hrmap_hyperbolic();
        cgi().generate_floorshapes_for(1, (G.currentmap as hrmap).gamestart());
        cgi().generate_floorshapes_for(0, (G.currentmap as hrmap).gamestart().cmove(0));
        cgi().finishshape();
        cgi().extra_vertices();
      }
      finally { cm.restore(); }
    }
    calcparam();
  }
  if (G.flat_on >= 1 && G.flat_on + val < 1) {
    G.geometry = backup_geometry;
    G.variation = backup_variation;
    G.nisot_local_perspective_used = backup_lpu;
    set_cam(backup_cam);
    G.vid.assign(backup_vid);
    geom3_apply_always3();
    calcparam();
    check_cgi();
  }
  G.flat_on += val;
}

/** pconf.cam() = T (the camera matrix is shared by the copies of pconf: assign in place) */
function set_cam(T: transmatrix): void {
  const C = pconf().cam();
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) C[i][j] = T[i][j];
}

/** struct flat_model_enabler: `const f = flat_model_enabler(); try { ... } finally { f.restore(); }` */
export function flat_model_enabler(): { restore(): void } {
  enable_flat_model(+1);
  return { restore: () => enable_flat_model(-1) };
}

/** atscreenpos(x,y) * eupoint(x1,y1) renders at pixel coordinates (x+x1, y+y1); atscreenpos(x, y, size): here,
 *  size is relative to the 'standard size' */
export function atscreenpos(x: number, y: number, size?: number): shiftmatrix {
  if (size !== undefined) {
    const V = atscreenpos(x, y);
    const s = size * 2 * cgi().hcrossf / cgi().crossf;
    V.T[0][0] *= s;
    V.T[1][1] *= s;
    return V;
  }
  const V = tcopy(Id);

  if (pconf().model === mdPixel) {
    V[0][3] += (x - cd().xcenter);
    V[1][3] += (y - cd().ycenter);
    V[0][0] = 1;
    V[1][1] = 1;
    if (WDIM() === 3) V[2][2] = -1;
  }
  else if (pconf().model === mdHorocyclic) {
    V[0][3] += (x - cd().xcenter) * 2 / cd().radius;
    V[1][3] += (y - cd().ycenter) * 2 / cd().radius;
    V[0][0] = 1;
    V[1][1] = 1;
  }
  else {
    V[0][2] += (x - cd().xcenter);
    V[1][2] += (y - cd().ycenter);
    V[0][0] = 1;
    V[1][1] = 1;
    V[2][2] = cd().radius;
    if (S3() >= OINF) { V[0][0] /= 5; V[1][1] /= 5; }
  }

  return shiftless_t(V);
}

function circle_around_center(radius: number, linecol: number, fillcol: number, prio: PPR): void {
  // CAP_QUEUE
  const pmodel = pconf().model;
  if (among(pmodel, mdDisk, mdEquiarea, mdEquidistant, mdFisheye, mdFisheye2) && !(pmodel === mdDisk && hyperbolic() && pconf().alpha <= -1) && G.models_camera_straight) {
    const ret = hnew();
    applymodel(shiftless(xpush0(radius)), ret);
    const r = hypot_d(2, ret);
    queuecircle(cd().xcenter, cd().ycenter, itrunc(r * cd().radius), linecol, prio, fillcol);
    return;
  }
  // CAP_QUEUE
  let rad = 10;
  if (euclid()) rad = 1000;
  for (let i = 0; i <= 36000; i += 10) curvepoint(xspinpush0(i * degree / 100., rad));
  const c = queuecurve(shiftless_t(tcopy(Id)), linecol, fillcol, prio);
  if (pmodel === mdDisk && hyperbolic() && pconf().alpha <= -1)
    c.flags |= POLY_FORCE_INVERTED;
  if (pmodel === mdJoukowsky)
    c.flags |= POLY_FORCE_INVERTED;
  c.flags |= POLY_ALWAYS_IN;
  c.flags |= POLY_FORCEWIDE;
}

export function put_x(S: shiftmatrix, _col: number): void {
  switch (G.twopoint_xshape) {
    case 0:
      queuestr_sp(smulh(S, C0()), itrunc(G.twopoint_xscale * G.vid.xres / 100), 'X', G.ringcolor >>> 8);
      break;
    case 1:
      G.vid.linewidth *= G.twopoint_xwidth;
      queueline(smulh(S, xpush0(G.twopoint_xscale / 10.)), smulh(S, xpush0(-G.twopoint_xscale / 10.)), G.ringcolor, 3);
      queueline(smulh(S, ypush0(G.twopoint_xscale / 10.)), smulh(S, ypush0(-G.twopoint_xscale / 10.)), G.ringcolor, 3);
      G.vid.linewidth /= G.twopoint_xwidth;
      break;
  }
}

// CAP_QUEUE
export function draw_model_elements(): void {

  // CAP_VR: vrhr::active() is false

  if (sphere() && pconf().alpha <= 1 && pconf().model === mdDisk)
    queuecircle(cd().xcenter, cd().ycenter, itrunc(cd().xsize + cd().ysize), G.ringcolor, PPR.OUTCIRCLE, G.modelcolor);

  const lw = dynamicval(() => G.vid.linewidth, (v) => { G.vid.linewidth = v; }, G.vid.linewidth * G.vid.multiplier_ring);
  try {
    switch (pconf().model) {

      // MAXMDIM >= 4
      case mdRelOrthogonal:
      case mdRelPerspective:
        notp('draw_model_elements: relativistic models'); // STAGE2-STUB
        return;

      case mdRotatedHyperboles: {
        queuestr(cd().xcenter, itrunc(cd().ycenter + cd().radius * pconf().alpha), 0, G.vid.fsize, 'X', G.ringcolor, 1, 8);
        return;
      }

      case mdTwoHybrid: {
        queuereset(mdPixel, PPR.CIRCLE);

        for (let mode = 0; mode < 4; mode++) {
          for (let s = -200; s <= 200; s++) {
            const p = Math.tanh(s / 40.);
            const a = pconf().twopoint_param * (1 + p);
            const b = pconf().twopoint_param * (1 - p);
            const h = ((mode & 2) ? -1 : 1) * Math.sqrt(asin_auto(tan_auto(a) * tan_auto(b)));

            const H = tmulh(xpush(p * pconf().twopoint_param), ypush0(h));

            const res = compute_hybrid(H, 2 | mode);
            ori_to_scr(res);
            curvepoint(hmul(res, cd().radius));
          }
          queuecurve(shiftless_t(tcopy(Id)), G.ringcolor, 0, PPR.CIRCLE);
        }

        queuereset(pconf().model, PPR.CIRCLE);
        draw_model_elements_twopoint();
        return;
      }

      case mdTwoPoint: case mdSimulatedPerspective:
        draw_model_elements_twopoint();
        return;

      case mdThreePoint: {
        G.vid.linewidth *= 5;
        for (let i = 0; i <= 3; i++) {
          const h = xspinpush0(deg(120) * i, pconf().twopoint_param);
          ori_to_scr(h);
          curvepoint(h);
        }

        queuecurve(shiftless_t(tcopy(Id)), G.ringcolor, 0, PPR.SUPERLINE);
        G.vid.linewidth /= 5;
        return;
      }

      case mdBall: {
        queuecircle(cd().xcenter, cd().ycenter, itrunc(cd().radius), G.ringcolor, PPR.OUTCIRCLE, G.modelcolor);
        ballgeometry();
        return;
      }

      case mdHyperboloid:
      case mdHemisphere: {
        if (!pconf().show_hyperboloid_flat) return;
        if (models_is_hyperboloid(pconf().model)) {

          // CAP_QUEUE
          if (pconf().small_hyperboloid) queueaction(PPR.CIRCLE, () => { glflush(); pconf().small_hyperboloid = false; });
          curvepoint(point3(0, 0, 1));
          curvepoint(point3(0, 0, -pconf().alpha));
          queuecurve(shiftless_t(tcopy(Id)), G.ringcolor, 0, PPR.CIRCLE);

          const tz = pconf().top_z;
          const z = Math.acosh(tz);

          const a = xpush0(z);
          let cb = pconf().ball()[1][1];
          const sb = pconf().ball()[1][2];

          if (pconf().model === mdHemisphere && sphere()) cb = -cb;

          a[1] = sb * a[2] / cb;
          a[0] = Math.sqrt(-1 + a[2] * a[2] - a[1] * a[1]);

          curvepoint(point3(0, 0, -pconf().alpha));
          curvepoint(hcopy(a));
          curvepoint(point3(0, 0, 0));
          a[0] = -a[0];
          curvepoint(hcopy(a));
          curvepoint(point3(0, 0, -pconf().alpha));
          queuecurve(shiftless_t(tcopy(Id)), G.ringcolor, 0, PPR.CIRCLE);

          curvepoint(point3(-1, 0, 0));
          curvepoint(point3(1, 0, 0));
          queuecurve(shiftless_t(tcopy(Id)), G.ringcolor, 0, PPR.CIRCLE);

          a[1] = sb * tz / cb;
          a[0] = Math.sqrt(tz * tz - a[1] * a[1]);
          a[2] = tz - pconf().alpha;

          curvepoint(hcopy(a));
          curvepoint(point3(0, 0, -pconf().alpha));
          a[0] = -a[0];
          curvepoint(hcopy(a));
          queuecurve(shiftless_t(tcopy(Id)), G.ringcolor, 0, PPR.CIRCLE);
          if (pconf().small_hyperboloid) queueaction(PPR.CIRCLE, () => { glflush(); pconf().small_hyperboloid = true; });
        }
        return;
      }

      default: break;
    }
  }
  finally { lw.restore(); }
}

/** case mdTwoPoint: case mdSimulatedPerspective: fallthrough: (the goto target of mdTwoHybrid) */
function draw_model_elements_twopoint(): void {
  if (G.set_multi) return; /* no need */
  const T = rot_inverse(pconf().mori().get());
  put_x(shiftless_t(tmul(T, xpush(+pconf().twopoint_param))), G.ringcolor >>> 8);
  put_x(shiftless_t(tmul(T, xpush(-pconf().twopoint_param))), G.ringcolor >>> 8);
}

function queuestraight(X: hyperpoint, style: number, lc: number, fc: number, p: PPR): void {

  let H0 = hnew(), H1 = hnew();
  applymodel(shiftless(X), H0);
  H0 = hmul(H0, cd().radius);
  const mul0 = Math.hypot(G.vid.xres, G.vid.yres) / hypot_d(2, H0);

  if (style === 1) {
    H1 = hmul(H0, -mul0);
  }
  else {
    applymodel(shiftless(tmulh(pispin, X)), H1);
    H1 = hmul(H1, cd().radius);
  }

  const mul1 = Math.hypot(G.vid.xres, G.vid.yres) / hypot_d(2, H1);

  queuereset(mdPixel, p);
  curvepoint(hadd(H0, hmul(tmulh(spin90(), H0), mul0)));
  curvepoint(hsub(H0, hmul(tmulh(spin90(), H0), mul0)));
  curvepoint(hadd(H1, hmul(tmulh(spin90(), H1), mul1)));
  curvepoint(hsub(H1, hmul(tmulh(spin90(), H1), mul1)));
  curvepoint(hadd(H0, hmul(tmulh(spin90(), H0), mul0)));

  queuecurve(shiftless_t(tcopy(Id)), lc, fc, p).flags |= POLY_ALWAYS_IN | POLY_FORCEWIDE;
  queuereset(pconf().model, p);
}

/** ball is written as cspin(0, 1, alpha) * cspin(2, 1, beta) * cspin(0, 2, gamma) */
export class ball_deconstruct {
  alpha = 0; beta = 0; gamma = 0;
  talpha: transmatrix = tcopy(Id); tbeta: transmatrix = tcopy(Id); tgamma: transmatrix = tcopy(Id); igamma: transmatrix = tcopy(Id);
  cos_beta = 0; sin_beta = 0;
}

/** create a ball_deconstruct object */
export function deconstruct_ball(): ball_deconstruct {
  // (0,1,0) -> (0, cos beta, sin beta) -> (sin alpha, cos beta * cos alpha, sin beta)
  let h = tmulh(pconf().ball(), point3(0, 1, 0));
  const d = new ball_deconstruct();
  if (h[0] === 0 && h[1] === 0) { /* println(hlog, "gimbal lock"); */ return d; }
  d.alpha = Math.atan2(h[0], h[1]);
  d.beta = Math.atan2(h[2], Math.hypot(h[0], h[1]));
  d.cos_beta = Math.cos(d.beta);
  d.sin_beta = Math.sin(d.beta);
  d.talpha = cspin(0, 1, d.alpha);
  d.tbeta = cspin(2, 1, d.beta);
  d.tgamma = tmul(tmul(rot_inverse(d.tbeta), rot_inverse(d.talpha)), pconf().ball());
  h = tmulh(d.tgamma, point3(0, 0, 1));
  d.gamma = Math.atan2(h[0], h[2]);
  // if(!eqmatrix(d.tgamma, cspin(0, 2, d.gamma))) println(hlog, "deconstruction failed");
  d.igamma = cspin(1, 0, d.gamma);
  return d;
}

export function draw_boundary(w: number): void {

  if (callhandlers(false, G.hooks_draw_boundary, w)) return;

  const pmodel = pconf().model;

  if ((nonisotropic() || gproduct()) && pmodel === mdDisk) {
    queuecircle(cd().xcenter, cd().ycenter, itrunc(cd().radius), G.ringcolor, PPR.OUTCIRCLE, G.modelcolor);
    return;
  }

  if (w === 1) return;
  if (nonisotropic() || (euclid() && !among(pmodel, mdFisheye, mdFisheye2, mdConformalSquare, mdHemisphere)) || gproduct()) return;
  // CAP_VR: vrhr::active() is false

  const lw = dynamicval(() => G.vid.linewidth, (v) => { G.vid.linewidth = v; }, G.vid.linewidth * G.vid.multiplier_ring);
  try {

    let lc = G.ringcolor;
    let fc = G.modelcolor;
    let p = PPR.OUTCIRCLE;

    if (haveaura()) lc = 0;
    if (lc === 0 && fc === 0) return;
    if (pmodel === mdRotatedHyperboles) return;

    const fakeinf = sphere() ? M_PI - 1e-5 : hyperbolic() ? 10 : Math.exp(10);

    // CAP_SVG
    const dw = dynamicval(() => G.vid.linewidth, (v) => { G.vid.linewidth = v; }, G.vid.linewidth * (G.svg_in ? G.svg_divby : 1));
    try {

      if (elliptic() && !among(pmodel, mdBand, mdBandEquidistant, mdBandEquiarea, mdSinusoidal, mdMollweide, mdCollignon)) {
        const d = dynamicval(() => G.vid.linewidth, (v) => { G.vid.linewidth = v; }, G.vid.linewidth * G.periodwidth);
        try { circle_around_center(deg(90), G.periodcolor, 0, PPR.CIRCLE); }
        finally { d.restore(); }
      }

      const broken_coord = models_get_broken_coord(pmodel);
      if (broken_coord) {
        const d = dynamicval(() => G.vid.linewidth, (v) => { G.vid.linewidth = v; }, G.vid.linewidth * G.periodwidth);
        try {
          const unbroken_coord = 3 - broken_coord;
          const eps = 1e-3;
          const rem = Math.sqrt(1 - eps * eps);
          for (const s of [-1, 1]) {
            for (let a = 1; a < 180; a++) {
              const h = hcopy(Hypc);
              h[broken_coord] = -sin_auto(a * degree) * rem;
              h[0] = sin_auto(a * degree) * eps * s;
              h[unbroken_coord] = cos_auto(a * degree);
              ori_to_scr(h);
              curvepoint(h);
            }
            queuecurve(shiftless_t(tcopy(Id)), G.periodcolor, 0, PPR.CIRCLE).flags |= POLY_FORCEWIDE;
          }
        }
        finally { d.restore(); }
      }

      if (pmodel === mdWerner && hyperbolic()) return;

      switch (pmodel) {

        case mdTwoPoint: {
          if (twopoint_do_flips || display_data_separate_eyes(cd()) || !sphere()) return;
          queuereset(mdPixel, p);

          for (let b = -1; b <= 1; b += 2)
            for (let a = -90; a <= 90 + 1e-6; a += Math.pow(.5, G.vid.linequality)) {
              const x = Math.sin(a * pconf().twopoint_param * b / 90);
              const y = 0;
              const z = -Math.sqrt(1 - x * x);
              const h0 = hpxyz(x, y, z);
              ori_to_scr(h0);
              const h1 = hnew();
              applymodel(shiftless(h0), h1);

              scr_to_ori(h1);
              h1[1] = abs(h1[1]) * b;
              ori_to_scr(h1);
              curvepoint(h1);
            }

          queuecurve(shiftless_t(tcopy(Id)), lc, fc, p).flags |= POLY_FORCEWIDE;
          queuereset(pmodel, p);
          return;
        }

        case mdBand: case mdBandEquidistant: case mdBandEquiarea: case mdSinusoidal: case mdMollweide: case mdCentralCyl: case mdCollignon:
        case mdGallStereographic: case mdMiller:
        {
          if (GDIM() === 3) return;
          if (pmodel === mdBand && pconf().model_transition !== 1) return;
          const bndband = (among(pmodel, mdBand, mdMiller, mdGallStereographic, mdCentralCyl) ? hyperbolic() : sphere());
          const T = pconf().mori().get();
          const right = deg(90) - 1e-5;
          if (bndband)
            queuestraight(tmulh(T, ypush0(hyperbolic() ? 10 : right)), 2, lc, fc, p);
          const xperiod = elliptic() ? fakeinf / 2 : fakeinf;
          if (sphere() && !bndband) {
            const d = dynamicval(() => G.vid.linewidth, (v) => { G.vid.linewidth = v; }, G.vid.linewidth * G.periodwidth);
            try { queuestraight(tmulh(T, xpush0(xperiod)), 2, G.periodcolor, 0, PPR.CIRCLE); }
            finally { d.restore(); }
          }
          if (sphere() && bndband) {
            const d = dynamicval(() => G.vid.linewidth, (v) => { G.vid.linewidth = v; }, G.vid.linewidth * G.periodwidth);
            try {
              const adegree = degree - 1e-6;
              for (let a = -90; a < 90 + 1e-6; a += Math.pow(.5, G.vid.linequality)) {
                curvepoint(tmulh(tmul(tmul(T, xpush(xperiod)), ypush(a * adegree)), C0())); // T * xpush(xperiod) * ypush0(a * adegree)
              }
              for (let a = -90; a < 90 + 1e-6; a += Math.pow(.5, G.vid.linequality)) {
                curvepoint(tmulh(tmul(tmul(T, xpush(-xperiod)), ypush(-a * adegree)), C0()));
              }
              curvepoint(tmulh(tmul(tmul(T, xpush(xperiod)), ypush(-90 * adegree)), C0()));
              queuecurve(shiftless_t(tcopy(Id)), G.periodcolor, 0, PPR.CIRCLE).flags |= POLY_FORCEWIDE;
            }
            finally { d.restore(); }
          }
          return;
        }

        case mdHalfplane:
          if (hyperbolic() && GDIM() === 2) {
            const Ori = pconf().mori().get();
            queuestraight(tmulh(tmul(Ori, spin270()), xpush0(fakeinf)), 1, lc, fc, p);
            return;
          }
          break;

        case mdHemisphere: {
          const d = deconstruct_ball();
          if (hyperbolic()) {
            queuereset(mdPixel, p);
            for (let i = 0; i <= 360; i++) {
              const c1 = Math.cos(i * degree - d.gamma);
              const s1 = Math.sin(i * degree - d.gamma);
              curvepoint(point3(cd().radius * c1, cd().radius * s1 * (d.cos_beta * s1 >= 0 - 1e-6 ? 1 : abs(d.sin_beta)), 0));
            }
            queuecurve_reuse(shiftless_t(d.talpha), lc, fc, p);
            queuereset(pmodel, p);

            p = PPR.CIRCLE; fc = 0;
            queuereset(mdPixel, p);
            queuecurve(shiftless_t(d.talpha), lc, fc, p);

            for (let i = 0; i <= 360; i++) {
              const c = Math.cos(i * degree);
              const s = Math.sin(i * degree);
              curvepoint(point3(cd().radius * c, cd().radius * s * d.sin_beta, 0));
            }
            queuecurve(shiftless_t(d.talpha), lc, fc, p);
            queuereset(pmodel, p);
          }
          if (euclid()) {
            queuereset(mdPixel, p);
            for (let i = 0; i <= 360; i++) {
              curvepoint(point3(cd().radius * Math.cos(i * degree), cd().radius * Math.sin(i * degree), 0));
            }
            queuecurve_reuse(shiftless_t(tcopy(Id)), lc, fc, p);
            queuereset(pmodel, p);

            queuereset(mdPixel, PPR.CIRCLE);
            queuecurve(shiftless_t(tcopy(Id)), lc, 0, PPR.CIRCLE);
            queuereset(pmodel, PPR.CIRCLE);
          }
          if (sphere()) { as_hyperboloid(lc, fc, p); return; }
          return;
        }

        case mdHyperboloid: {
          if (hyperbolic()) {
            as_hyperboloid(lc, fc, p);
          }
          else if (sphere()) {
            queuereset(mdPixel, p);
            for (let i = 0; i <= 360; i++) {
              curvepoint(point3(cd().radius * Math.cos(i * degree) / 3, cd().radius * Math.sin(i * degree) / 3, 0));
            }
            queuecurve_reuse(shiftless_t(tcopy(Id)), lc, fc, p);
            queuereset(pmodel, p);

            queuereset(mdPixel, PPR.CIRCLE);
            queuecurve(shiftless_t(tcopy(Id)), lc, 0, PPR.CIRCLE);
            queuereset(pmodel, PPR.CIRCLE);
          }
          return;
        }

        case mdSpiral: {
          if (euclid()) return;
          notp('draw_boundary: mdSpiral'); // STAGE2-STUB (models::spiral_multiplier)
          return;
        }

        case mdBall:
          /* circle_around_center not wanted */
          return;

        default:
          if (models_is_perspective(pmodel)) return;
          break;
      }

      if (sphere() && pmodel === mdDisk && pconf().alpha > 1) {
        const rad = cd().radius / Math.sqrt(pconf().alpha * pconf().alpha - 1);
        queuecircle(cd().xcenter, cd().ycenter, itrunc(rad), lc, p, fc);
        return;
      }

      if (sphere() && !among(pmodel, mdEquidistant, mdEquiarea)) return;
      circle_around_center(fakeinf, lc, fc, p);
    }
    finally { dw.restore(); }
  }
  finally { lw.restore(); }
}

/** the `as_hyperboloid:` label of draw_boundary (mdHyperboloid in hyperbolic, mdHemisphere in sphere) */
function as_hyperboloid(lc: number, fc: number, p: PPR): void {
  const d = deconstruct_ball();
  const tz = pconf().top_z;
  const mz = Math.acosh(tz);

  for (let it = 0; it < (sphere() ? 2 : 1); it++) {
    let fc1 = fc;
    let p1 = p;

    if (abs(d.sin_beta) <= abs(d.cos_beta) + 1e-5) {
      queuereset(mdPixel, p1);
      const steps = 100 << G.vid.linequality;

      let a = hnew();

      const hpolar = (phi: number, r: number): hyperpoint => {
        const s = Math.sinh(r);
        return point3(Math.cos(phi) * s, -Math.sin(phi) * s, Math.cosh(r));
      };

      const hform = (h: hyperpoint): hyperpoint => {
        h = hyperboloid_form(tmulh(d.igamma, h));
        h[0] *= cd().radius; h[1] *= cd().radius; h[2] = 0;
        if (it) { h[0] *= -1; h[1] *= -1; }
        return h;
      };

      for (let ts = -steps; ts <= steps; ts++) {
        const t = ts * 1. / steps;
        a = hpolar(0, t * mz);
        if (t !== 0) {
          a[1] = d.sin_beta * a[2] / -d.cos_beta;
          const v = -1 + a[2] * a[2] - a[1] * a[1];
          if (v < 0) continue;
          a[0] = Math.sqrt(v);
          if (t < 0) a[0] = -a[0];
        }
        curvepoint(hform(a));
      }

      if ((d.sin_beta > 0) !== (d.cos_beta < 0)) {
        const alpha = (M_PI - Math.atan2(a[0], -a[1])) / steps;

        for (let ts = -steps; ts <= steps; ts++)
          curvepoint(hform(hpolar(-deg(90) - ts * alpha, mz)));
      }
      else {
        const alpha = -Math.atan2(a[0], -a[1]) / steps;

        for (let ts = -steps; ts <= steps; ts++)
          curvepoint(hform(hpolar(+deg(90) - ts * alpha, mz)));
      }

      queuecurve_reuse(shiftless_t(tcopy(Id)), lc, fc1, p1);
      queuereset(pconf().model, p1);
      fc1 = 0; p1 = PPR.CIRCLE;
      queuereset(mdPixel, p1);
      queuecurve(shiftless_t(tcopy(Id)), lc, fc1, p1);
      queuereset(pconf().model, p1);
    }

    const mul = pconf().small_hyperboloid ? 2 : 1;
    for (let t = 0; t <= 360; t++)
      curvepoint(xspinpush0(t * degree, it ? M_PI - mz * mul : mz * mul));

    if (p1 === PPR.OUTCIRCLE) { queuecurve_reuse(shiftless_t(tcopy(Id)), lc, fc1, p1); fc1 = 0; p1 = PPR.CIRCLE; }
    queuecurve(shiftless_t(tcopy(Id)), lc, fc1, p1);
  }
}

/** void change_shift(shiftpoint& h, ld by) */
export function change_shift(h: shiftpoint, by: number): void {
  if (!by) return;
  h.shift += by;
  const pmodel = pconf().model;
  if (sl2()) {
    const ca = Math.cos(by), sa = Math.sin(by);
    { const a = h.h[2] * ca - h.h[3] * sa, b = h.h[3] * ca + h.h[2] * sa; h.h[2] = a; h.h[3] = b; }
    { const a = h.h[0] * ca - h.h[1] * sa, b = h.h[1] * ca + h.h[0] * sa; h.h[0] = a; h.h[1] = b; }
  }
  else if ((mdinf[pmodel].flags & mf.uses_bandshift) || (sphere() && pmodel === mdSpiral)) {
    scr_to_ori(h.h);
    hset(h.h, tmulh(xpush(-by), h.h));
    ori_to_scr(h.h);
  }
}

/** void change_shift(shiftmatrix& T, ld by) */
export function change_shift_sm(T: shiftmatrix, by: number): void {
  if (!by) return;
  T.shift += by;
  const pmodel = pconf().model;
  if (sl2()) {
    const ca = Math.cos(by), sa = Math.sin(by);
    for (let a = 0; a < 4; a++) {
      { const u = T.T[2][a] * ca - T.T[3][a] * sa, v = T.T[3][a] * ca + T.T[2][a] * sa; T.T[2][a] = u; T.T[3][a] = v; }
      { const u = T.T[0][a] * ca - T.T[1][a] * sa, v = T.T[1][a] * ca + T.T[0][a] * sa; T.T[0][a] = u; T.T[1][a] = v; }
    }
  }
  else if ((mdinf[pmodel].flags & mf.uses_bandshift) || (sphere() && pmodel === mdSpiral)) {
    T.T = models_scr_to_ori_t(T.T);
    T.T = tmul(xpush(-by), T.T);
    fixmatrix(T.T);
    T.T = models_ori_to_scr_t(T.T);
  }
}

// unshift, unshift_sm, inverse_shift, inverse_shift_sp: hyperpoint.ts (stage 1)

export function inverse_shift_any(T1: shiftmatrix, T2: shiftmatrix): transmatrix {
  return tmul(inverse(T1.T), unshift_sm(T2, T1.shift));
}

export function inverse_shift_any_sp(T1: shiftmatrix, T2: shiftpoint): hyperpoint {
  return tmulh(inverse(T1.T), unshift(T2, T1.shift));
}

/** void optimize_shift(shiftpoint& h) */
export function optimize_shift(h: shiftpoint): void {
  if (sl2()) {
    change_shift(h, Math.atan2(h.h[2], h.h[3]));
  }
}

/** void optimize_shift(shiftmatrix& T) */
export function optimize_shift_sm(T: shiftmatrix): void {

  const pmodel = pconf().model;
  if (sl2()) {
    change_shift_sm(T, Math.atan2(T.T[2][3], T.T[3][3]));
    notp('optimize_shift: hybrid::csteps (sl2)'); // STAGE2-STUB
    return;
  }

  else if (((mdinf[pmodel].flags & mf.uses_bandshift) && T.T[LDIM()][LDIM()] > 30) || (sphere() && pmodel === mdSpiral)) {
    T.T = models_scr_to_ori_t(T.T);
    const H = tC0(T.T);
    find_zlev(H);

    const y = asin_auto(H[1]);
    let x = asin_auto_clamp(H[0] / cos_auto(y));
    if (sphere()) {
      if (H[LDIM()] < 0 && x > 0) x = M_PI - x;
      else if (H[LDIM()] < 0 && x <= 0) x = -M_PI - x;
    }
    T.shift += x;
    T.T = tmul(xpush(-x), T.T);
    fixmatrix(T.T);
    T.T = models_ori_to_scr_t(T.T);
  }
}

export function optimized_shift(T: shiftmatrix): shiftmatrix {
  const U = { T: tcopy(T.T), shift: T.shift };
  optimize_shift_sm(U);
  return U;
}

// --- namespace dq ---

export function dq_bucketer(T: shiftpoint): buckethash_t {
  if (cgi().emb.is_euc_in_sl2()) {
    const T1 = { h: hcopy(T.h), shift: T.shift }; optimize_shift(T1);
    return hashmix_to(bucketer_h(T1.h), bucketer(T1.shift));
  }
  return hashmix_to(bucketer_h(T.h), bucketer(T.shift));
}

export function dq_enqueue(h: heptagon, T: shiftmatrix): void {
  if (!h || G.dq_visited.has(h)) { return; }
  G.dq_visited.add(h);
  G.dq_drawqueue.push([h, T]);
}

export function dq_enqueue_by_matrix(h: heptagon, T: shiftmatrix): void {
  if (!h) return;
  const b = dq_bucketer(smulh(T, tile_center()));
  if (G.dq_visited_by_matrix.has(b)) { return; }
  G.dq_visited_by_matrix.add(b);
  G.dq_drawqueue.push([h, T]);
}

export function dq_enqueue_c(c: cell, T: shiftmatrix): void {
  if (!c || G.dq_visited_c.has(c)) { return; }
  G.dq_visited_c.add(c);
  G.dq_drawqueue_c.push([c, T]);
}

export function dq_enqueue_by_matrix_c(c: cell, T: shiftmatrix): void {
  if (!c) return;
  const b = dq_bucketer(smulh(T, tile_center()));
  if (G.dq_visited_by_matrix.has(b)) { return; }
  G.dq_visited_by_matrix.add(b);
  G.dq_drawqueue_c.push([c, T]);
}

export function dq_clear_all(): void {
  G.dq_visited.clear();
  G.dq_visited_by_matrix.clear();
  G.dq_visited_c.clear();
  G.dq_drawqueue_c.length = 0;
  G.dq_drawqueue.length = 0;
}

/** bool do_draw(cell *c) */
export function do_draw(c: cell): boolean {
  // do not display out of range cells, unless on torus
  if (c.pathdist === PINFD && !(meuclid() && quotient()) && G.vid.use_smart_range === 0)
    return false;
  // do not display not fully generated cells, unless changing range allowed
  if (c.mpdist > 7 && !allowChangeRange()) return false;
  // in the Yendor Challenge, scrolling back is forbidden
  if (c.cpdist > get_sightrange() && (G.yendor_on || isHaunted(G.cwt.at.land)) && !G.cheater && !G.autocheat) return false;

  return true;
}

/** returns false if limited */
export function limited_generation(c: cell): boolean {
  if (c.mpdist <= 7) return true;
  if (G.cells_generated > G.vid.cells_generated_limit) return false;
  setdist(c, 7, c);
  G.cells_generated++;
  return true;
}

/** bool do_draw(cell *c, const shiftmatrix& T) */
export function do_draw_T(c: cell, T: shiftmatrix): boolean {
  const h = callhandlers(0, G.hooks_do_draw, c, T);
  if (h) return h > 0;

  if (WDIM() === 3) {
    return notp('do_draw: 3D'); // STAGE2-STUB
  }

  // MAXMDIM >= 4: hybrid::drawing_underlying (only in product geometries)
  if (G.just_gmatrix && sphere()) return true;
  if (!do_draw(c)) return false;
  if (euclid() && pconf().model === mdSpiral) {
    notp('do_draw: the spiral model'); // STAGE2-STUB
  }
  if (pconf().model === mdSpiral && G.models_ring_not_spiral) {
    notp('do_draw: the ring model'); // STAGE2-STUB
  }
  if (G.cells_drawn > G.vid.cells_drawn_limit) return false;
  const usr = G.vid.use_smart_range || quotient();
  if (usr && G.cells_drawn >= G.min_cells_drawn && !in_smart_range(T) && !(WDIM() === 2 && GDIM() === 3 && hdist0(tC0(T.T)) < 2.5)) return false;
  if (G.vid.use_smart_range === 2 && !limited_generation(c)) return false;
  return true;
}

export function cone_side(_H: shiftpoint): number {
  return notp('cone_side: the spiral cone'); // STAGE2-STUB (complex numbers of models::spiral_multiplier)
}

/** get the current orientation of the view (transmatrix&) */
export function get_view_orientation(): mref {
  return gproduct() ? refNLP : refView;
}

/** rotate the view using the given rotation matrix */
export function rotate_view(T: transmatrix): void {
  if (callhandlers(false, G.hooks_rotate_view, T)) return;
  for (const pV of move_affected_matrices(3)) pV.set(tmul(T, pV.get()));
}

export function lie_exp(_h1: hyperpoint): shiftpoint {
  return notp('lie_exp (nonisotropic)'); // STAGE2-STUB
}

export function rel_log(_h: shiftpoint, _relativistic_length: boolean): hyperpoint {
  return notp('rel_log (sl2 / 3D hyperbolic)'); // STAGE2-STUB
}

/** Is Lie movement available? Depends on map geometry, not ambient geometry. */
export function lie_movement_available(): boolean {
  if (nonisotropic() && !embedded_plane()) return true;
  if (mhyperbolic() && bt_in()) return true;
  return false;
}

export function lie_log(_h1: shiftpoint): hyperpoint {
  return notp('lie_log (nonisotropic / binary tiling)'); // STAGE2-STUB
}

/** Like lie_log but includes orientation and level in hyperbolic space. May modify H */
export function lie_log_correct(_H_orig: shiftpoint, _H: hyperpoint): hyperpoint {
  return notp('lie_log_correct'); // STAGE2-STUB
}

/** Shift the view according to the given tangent vector. */
export function shift_v_by_vector(V: mref, H: hyperpoint, sm = shift_method(smaManualCamera)): void {
  switch (sm) {
    case smProduct:
      notp('shift_v_by_vector: smProduct (lp_iapply)'); // STAGE2-STUB
      return;
    case smIsotropic:
      V.set(tmul(rgpushxto0(direct_exp(H)), V.get()));
      return;
    case smEmbedded:
      return shift_v_embedded(V, rgpushxto0(direct_exp(H)));
    case smLie: {
      notp('shift_v_by_vector: smLie'); // STAGE2-STUB
      return;
    }
    case smGeodesic:
      notp('shift_v_by_vector: smGeodesic (nisot::parallel_transport)'); // STAGE2-STUB
      return;
    default:
      throw new hr_exception('unknown shift method (embedded not supported)');
  }
}

export function get_shift_view_of(H: hyperpoint, V: transmatrix, sm = shift_method(smaManualCamera)): transmatrix {
  let W = V;
  shift_v_by_vector({ get: () => W, set: (T) => { W = T; } }, H, sm);
  return W;
}

/** shift the view according to the given tangent vector */
export function shift_view(H: hyperpoint, sm = shift_method(smaManualCamera)): void {
  if (callhandlers(false, G.hooks_shift_view, H)) return;
  if (!shift_view_recursive && G.intra_in) {
    notp('shift_view: intra::shift_view_portal'); // STAGE2-STUB (portals)
    return;
  }
  for (const pV of move_affected_matrices(0)) pV.set(get_shift_view_of(H, pV.get(), sm));
}
/** static bool recursive (in shift_view) */
const shift_view_recursive = false;

/** works in embedded_plane (except embedded product where shift_view works, and euc_in_sl2) */
export function shift_v_embedded(_V: mref, _T: transmatrix): void {
  notp('shift_v_embedded: cgi.emb->map_relative_push (3D)'); // STAGE2-STUB
}

export function shift_v_by_matrix(V: mref, T: transmatrix, sm: number): void {
  switch (sm) {
    case smEmbedded:
      return shift_v_embedded(V, T);
    case smIsotropic:
    case smProduct:
      V.set(tmul(T, V.get()));
      return;
    default:
      throw new hr_exception('unsupported shift method in shift_view_by_matrix');
  }
}

export function shift_view_to(H: shiftpoint, sm = shift_method(smaManualCamera)): void {
  for (const pV of move_affected_matrices(0)) shift_v_to(pV, H, sm);
}

export function shift_v_to(V: mref, H: shiftpoint, sm = shift_method(smaManualCamera)): void {
  switch (sm) {
    case smIsotropic:
    case smEmbedded:
    case smProduct:
      return shift_v_by_matrix(V, gpushxto0(unshift(H)), sm);
    case smLie:
      return shift_v_by_vector(V, hneg(lie_log(H)), sm);
    case smGeodesic:
      return shift_v_by_vector(V, hneg(inverse_exp(H)), sm);
    default:
      throw new hr_exception('unsupported shift method in shift_view_to');
  }
}

export function shift_view_towards(H: shiftpoint, l: number, sm = shift_method(smaManualCamera)): void {
  for (const pV of move_affected_matrices(0)) shift_v_towards(pV, H, l, sm);
}

export function shift_v_towards(V: mref, H: shiftpoint, l: number, sm = shift_method(smaManualCamera)): void {
  switch (sm) {
    case smIsotropic:
    case smEmbedded:
      return shift_v_by_matrix(V, tmul(tmul(rspintox(unshift(H)), xpush(-l)), spintox(unshift(H))), sm);
    case smLie:
      return shift_v_by_vector(V, tangent_length(lie_log(H), -l), sm);
    case smGeodesic:
    case smProduct: {
      let ie = inverse_exp(H, pNORMAL | pfNO_DISTANCE);
      if (gproduct()) ie = lp_apply(ie);
      return shift_v_by_vector(V, tangent_length(ie, -l), sm);
    }
    default:
      throw new hr_exception('unsupported shift method in shift_view_towards');
  }
}

export function set_view(camera: hyperpoint, forward: hyperpoint, upward: hyperpoint): void {
  if (GDIM() === 2) {
    cd().view_matrix = gpushxto0(camera);
    cd().view_matrix = tmul(tmul(spin90(), spintox(tmulh(cd().view_matrix, upward))), cd().view_matrix);
    return;
  }

  const V = gpushxto0(camera);
  forward = tmulh(V, forward);
  upward = tmulh(V, upward);

  const pmodel = pconf().model;
  if (pmodel === mdGeodesic || hyperbolic() || sphere() || euclid() || mproduct()) {
    forward = inverse_exp(shiftless(forward));
  }
  else {
    // apply_nil_rotation(forward);
    forward = hsub(forward, C0());
  }

  if (hypot_d(3, forward) === 0) forward[0] = 1;

  forward = hdiv(forward, hypot_d(3, forward));

  if (pmodel === mdGeodesic || hyperbolic() || sphere() || euclid() || mproduct())
    upward = inverse_exp(shiftless(upward));
  else {
    // apply_nil_rotation(upward);
    upward = hsub(upward, C0());
  }

  upward = hsub(upward, hmul(forward, hdot(forward, upward)));
  if (hypot_d(3, upward) === 0) return;

  upward = hdiv(upward, hypot_d(3, upward));

  const rightward = hcross(forward, upward);

  const rotator = tcopy(Id);
  rotator[2] = hcopy(forward);
  rotator[1] = hneg(upward);
  rotator[0] = hneg(rightward);

  if (det(rotator) < 0) rotator[0] = hneg(rotator[0]);

  cd().view_matrix = iso_inverse(rgpushxto0(camera));
  if (gproduct())
    cd().local_perspective = rotator;
  else
    cd().view_matrix = tmul(rotator, cd().view_matrix);
}

