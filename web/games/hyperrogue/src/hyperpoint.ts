// hyperpoint.cpp of HyperRogue 13.1o: points and isometries of the non-Euclidean plane (and space): rotations,
// translations, inverses, determinants, distances.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Representation: `hyperpoint` is a number[] of MAXMDIM = 4 coordinates, `transmatrix` a 4x4 number[][] (rows).
// Both are values in C++: every function here returns a fresh array and never changes its arguments, except
// those that take a reference in C++ (`fixmatrix(T&)`, `set_column`, `orthonormalize`, `fix4`). Copy with
// `hcopy` / `tcopy` where the C++ copies a value that is changed afterwards. The constants (`Id`, `C0`, ...)
// are shared arrays: never write into them. Loops run to MXDIM = MDIM as in the desktop build
// (CAP_MDIM_FIXED = 0): in 2D geometries the products are 3x3 and the fourth row/column stays as it is.
// C++ operators: `T * U` -> tmul(T, U), `T * h` -> tmulh(T, h), `h1 + h2` -> hadd, `h1 - h2` -> hsub,
// `h * d` -> hmul(h, d), `h / d` -> hdiv(h, d), `h1 | h2` -> hdot, `h1 ^ h2` -> hcross.
// shiftpoint / shiftmatrix: { h, shift } / { T, shift }; the rules only use shift 0 (shifts are for the
// SL(2,R) geometry and band models, both later stages).
//
// Names (PORTING.md, "Overloads"): mid(h1, h2) / mid_sp(shiftpoint); hdist0(h) / hdist0_sp; hdist / hdist_sp;
// rgpushxto0(h) / rgpushxto0_sp; scale_matrix / scale_matrix_sm; orthogonal_move_fol(h) /
// orthogonal_move_fol_t(T); orthogonal_move(T) (the hyperpoint version is embeddings.cpp's);
// xyzscale / mzscale for transmatrix only; rot_inverse for transmatrix; bucketer(x) / bucketer_h(h);
// circumscribe(a,b,c) / circumscribe4(a,b,c,d); eupush(x, y) / eupush_h(h, co); spin_towards (transmatrix);
// geo_dist (hyperpoint).
//
// Floating point: ld is double; sin/cos/cosh/sinh/tanh/acosh/asinh/atanh/atan/atan2/exp/log are cpp.ts's c_*
// (correctly rounded, as the oracle's glibc 2.44 nearly always is; stage 2, D2: V8's Math.* differ from glibc in
// the last bit often enough to change tessf and hexf). The rest of this note is stage 1's: Math.* may differ in the
// last bit. Where a game decision depends on a computed distance (hdist comparisons in relative_matrixh on
// closed manifolds, virtualRebase, the Yendor/Wind/crossbow geometry) a last-bit difference could only change
// the outcome for an exact tie; none is known (NOTES.md).
import { c_acosh, c_asinh, c_atan, c_atan2, c_atanh, c_cos, c_cosh, c_exp, c_log, c_sin, c_sinh, c_tanh } from './cpp.ts';
import { G, late_globals } from './globals.ts';
import { NotPorted, hr_exception } from './hyper.ts';
import {
  ginf, cgclass, MDIM, LDIM, GDIM, WDIM, gcEuclid, gcHyperbolic, gcSphere, gcProduct, gcSL2, gcNil,
  euclid, sphere, hyperbolic, nonisotropic, translatable, elliptic, gproduct, sl2, nil, cgflags, qAFFINE,
  embedded_plane, mtwisted, gSphere, sol,
} from './classes.ts';
import { randd } from './rand.ts';
import { spin, spin180, lzpush } from './embeddings.ts';
import { in_s2xe } from './nonisotropic.ts';

export const M_PI = 3.14159265358979323846; // <cmath> M_PI (hyperpoint.cpp's own #define is only for when it is missing)
/** static constexpr ld A_PI = M_PI */
export const A_PI = M_PI;
export const TAU = 2 * A_PI;
export const degree = A_PI / 180;
export const golden_phi = (Math.sqrt(5) + 1) / 2;
export const log_golden_phi = c_log(golden_phi);
/** x._deg */
export function deg(x: number): number { return x * A_PI / 180; }

/** struct hyperpoint : array<ld, MAXMDIM> */
export type hyperpoint = number[];
/** struct transmatrix { ld tab[MAXMDIM][MAXMDIM]; } */
export type transmatrix = number[][];
/** struct shiftpoint */
export interface shiftpoint { h: hyperpoint; shift: number; }
/** struct shiftmatrix */
export interface shiftmatrix { T: transmatrix; shift: number; }
/** struct shiftmatrix_or_null */
export interface shiftmatrix_or_null extends shiftmatrix { is_null: boolean; }

/** hyperpoint(x, y, z, w) */
export function hpt(x: number, y: number, z: number, w: number): hyperpoint { return [x, y, z, w]; }
/** a default-constructed hyperpoint (uninitialized in C++; zero here) */
export function hnew(): hyperpoint { return [0, 0, 0, 0]; }
/** a default-constructed transmatrix (uninitialized in C++; zero here) */
export function tnew(): transmatrix { return [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; }
export function hcopy(h: hyperpoint): hyperpoint { return [h[0], h[1], h[2], h[3]]; }
export function tcopy(T: transmatrix): transmatrix { return [hcopy(T[0]), hcopy(T[1]), hcopy(T[2]), hcopy(T[3])]; }

/** MXDIM: (CAP_MDIM_FIXED ? MAXMDIM : MDIM) with CAP_MDIM_FIXED = 0 */
export function MXDIM(): number { return MDIM(); }

// hyperpoint operators
export function hmul(h: hyperpoint, d: number): hyperpoint {
  const r = hcopy(h); const n = MXDIM();
  for (let i = 0; i < n; i++) r[i] *= d;
  return r;
}
export function hdiv(h: hyperpoint, d: number): hyperpoint {
  const r = hcopy(h); const n = MXDIM();
  for (let i = 0; i < n; i++) r[i] /= d;
  return r;
}
export function hadd(h: hyperpoint, h2: hyperpoint): hyperpoint {
  const r = hcopy(h); const n = MXDIM();
  for (let i = 0; i < n; i++) r[i] += h2[i];
  return r;
}
export function hsub(h: hyperpoint, h2: hyperpoint): hyperpoint {
  const r = hcopy(h); const n = MXDIM();
  for (let i = 0; i < n; i++) r[i] -= h2[i];
  return r;
}
/** -h */
export function hneg(h: hyperpoint): hyperpoint { return hmul(h, -1); }
/** cross product h1 ^ h2 */
export function hcross(h1: hyperpoint, h2: hyperpoint): hyperpoint {
  return hpt(
    h1[1] * h2[2] - h1[2] * h2[1],
    h1[2] * h2[0] - h1[0] * h2[2],
    h1[0] * h2[1] - h1[1] * h2[0],
    0,
  );
}
export function dot_d(c: number, h1: hyperpoint, h2: hyperpoint): number {
  let sum = 0;
  for (let i = 0; i < c; i++) sum += h1[i] * h2[i];
  return sum;
}
/** Euclidean inner product h1 | h2 */
export function hdot(h1: hyperpoint, h2: hyperpoint): number { return dot_d(MXDIM(), h1, h2); }

/** T * H */
export function tmulh(T: transmatrix, H: hyperpoint): hyperpoint {
  const n = MXDIM();
  // n = 3 and 4 unrolled (performance): the same sums, z[i] = 0, then += T[i][j] * H[j] for j = 0, 1, ...
  if (n === 3) {
    const h0 = H[0], h1 = H[1], h2 = H[2], T0 = T[0], T1 = T[1], T2 = T[2];
    return [
      0 + T0[0] * h0 + T0[1] * h1 + T0[2] * h2,
      0 + T1[0] * h0 + T1[1] * h1 + T1[2] * h2,
      0 + T2[0] * h0 + T2[1] * h1 + T2[2] * h2,
      0,
    ];
  }
  if (n === 4) {
    const h0 = H[0], h1 = H[1], h2 = H[2], h3 = H[3], T0 = T[0], T1 = T[1], T2 = T[2], T3 = T[3];
    return [
      0 + T0[0] * h0 + T0[1] * h1 + T0[2] * h2 + T0[3] * h3,
      0 + T1[0] * h0 + T1[1] * h1 + T1[2] * h2 + T1[3] * h3,
      0 + T2[0] * h0 + T2[1] * h1 + T2[2] * h2 + T2[3] * h3,
      0 + T3[0] * h0 + T3[1] * h1 + T3[2] * h2 + T3[3] * h3,
    ];
  }
  const z = hnew();
  for (let i = 0; i < n; i++) {
    z[i] = 0;
    for (let j = 0; j < n; j++) z[i] += T[i][j] * H[j];
  }
  return z;
}
/** a row of T * U for n = 3 (performance: the sums of tmul's loop, 0 + T[i][0] * U[0][j] + ...) */
function tmul_row3(Ti: hyperpoint, U0: hyperpoint, U1: hyperpoint, U2: hyperpoint): hyperpoint {
  const a = Ti[0], b = Ti[1], c = Ti[2];
  return [0 + a * U0[0] + b * U1[0] + c * U2[0], 0 + a * U0[1] + b * U1[1] + c * U2[1], 0 + a * U0[2] + b * U1[2] + c * U2[2], 0];
}
/** a row of T * U for n = 4 */
function tmul_row4(Ti: hyperpoint, U0: hyperpoint, U1: hyperpoint, U2: hyperpoint, U3: hyperpoint): hyperpoint {
  const a = Ti[0], b = Ti[1], c = Ti[2], d = Ti[3];
  return [
    0 + a * U0[0] + b * U1[0] + c * U2[0] + d * U3[0], 0 + a * U0[1] + b * U1[1] + c * U2[1] + d * U3[1],
    0 + a * U0[2] + b * U1[2] + c * U2[2] + d * U3[2], 0 + a * U0[3] + b * U1[3] + c * U2[3] + d * U3[3],
  ];
}
/** T * U */
export function tmul(T: transmatrix, U: transmatrix): transmatrix {
  const n = MXDIM();
  if (n === 3) {
    const U0 = U[0], U1 = U[1], U2 = U[2];
    return [tmul_row3(T[0], U0, U1, U2), tmul_row3(T[1], U0, U1, U2), tmul_row3(T[2], U0, U1, U2), [0, 0, 0, 0]];
  }
  if (n === 4) {
    const U0 = U[0], U1 = U[1], U2 = U[2], U3 = U[3];
    return [tmul_row4(T[0], U0, U1, U2, U3), tmul_row4(T[1], U0, U1, U2, U3), tmul_row4(T[2], U0, U1, U2, U3), tmul_row4(T[3], U0, U1, U2, U3)];
  }
  const R = tnew();
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    R[i][j] = 0;
    for (let k = 0; k < n; k++)
      R[i][j] += T[i][k] * U[k][j];
  }
  return R;
}
/** T1 * T2 * ... (left to right, as C++ evaluates a chain of operator*) */
export function tmuls(...Ts: transmatrix[]): transmatrix {
  let R = Ts[0];
  for (let i = 1; i < Ts.length; i++) R = tmul(R, Ts[i]);
  return R;
}

/** shiftless(h, shift) */
export function shiftless(h: hyperpoint, shift = 0): shiftpoint { return { h, shift }; }
/** shiftless(T, shift) */
export function shiftless_t(T: transmatrix, shift = 0): shiftmatrix { return { T, shift }; }
/** shiftmatrix * hyperpoint */
export function smulh(T: shiftmatrix, h: hyperpoint): shiftpoint { return { h: tmulh(T.T, h), shift: T.shift }; }
/** shiftmatrix * transmatrix */
export function smul(T: shiftmatrix, U: transmatrix): shiftmatrix { return { T: tmul(T.T, U), shift: T.shift }; }

/** returns a diagonal matrix */
export function diag(a: number, b: number, c: number, d: number): transmatrix {
  return [[a, 0, 0, 0], [0, b, 0, 0], [0, 0, c, 0], [0, 0, 0, d]];
}

export const Hypc: hyperpoint = hpt(0, 0, 0, 0);

/** identity matrix */
export const Id: transmatrix = diag(1, 1, 1, 1);

/** zero matrix */
export const Zero: transmatrix = diag(0, 0, 0, 0);

/** struct trans23: a transmatrix with 2D and 3D version (configuration; only built here) */
export class trans23 {
  v2: transmatrix;
  v3: transmatrix;
  constructor(T2: transmatrix = Id, T3: transmatrix = T2) { this.v2 = tcopy(T2); this.v3 = tcopy(T3); }
  get(): transmatrix { return MDIM() === 3 ? this.v2 : this.v3; }
  eq(b: trans23): boolean { return eqmatrix(this.v2, b.v2) && eqmatrix(this.v3, b.v3); }
}
// projection_configuration's `new trans23` (globals.ts is a leaf and cannot build one itself)
late_globals.new_trans23 = (): trans23 => new trans23();

/** mirror image */
export const Mirror: transmatrix = diag(1, -1, 1, 1);
/** mirror image: flip in the Y coordinate */
export const MirrorY: transmatrix = diag(1, -1, 1, 1);
/** mirror image: flip in the X coordinate */
export const MirrorX: transmatrix = diag(-1, 1, 1, 1);
/** mirror image: flip in the Z coordinate */
export const MirrorZ: transmatrix = diag(1, 1, -1, 1);
/** rotate by PI in the XY plane */
export const pispin: transmatrix = diag(-1, -1, 1, 1);
/** central symmetry matrix */
export const centralsym: transmatrix = diag(-1, -1, -1, -1);

export function hpxyz(x: number, y: number, z: number): hyperpoint { return MDIM() === 3 ? hpt(x, y, z, 0) : hpt(x, y, 0, z); }
export function hpxyz3(x: number, y: number, z: number, w: number): hyperpoint { return MDIM() === 3 ? hpt(x, y, w, 0) : hpt(x, y, z, w); }
export function point3(x: number, y: number, z: number): hyperpoint { return hpt(x, y, z, 0); }
export function point30(x: number, y: number, z: number): hyperpoint { return hpt(x, y, z, 0); }
export function point31(x: number, y: number, z: number): hyperpoint { return hpt(x, y, z, 1); }
export function point2(x: number, y: number): hyperpoint { return hpt(x, y, 0, 0); }

export const C02: hyperpoint = hpt(0, 0, 1, 0);
export const C03: hyperpoint = hpt(0, 0, 0, 1);

/** #define C0 (MDIM == 3 ? C02 : C03): C0 is the origin in our space */
export function C0(): hyperpoint { return MDIM() === 3 ? C02 : C03; }

// basic functions and types
//===========================

export function squar(x: number): number { return x * x; }

export function sig(z: number): number { return ginf[G.geometry].g.sig[z]; }

export function curvature(): number {
  switch (cgclass()) {
    case gcEuclid: return 0;
    case gcHyperbolic: return -1;
    case gcSphere: return 1;
    case gcProduct: throw new NotPorted('curvature: product (PIU)');
    default: return 0;
  }
}

export function sin_auto(x: number): number {
  switch (cgclass()) {
    case gcEuclid: return x;
    case gcHyperbolic: return c_sinh(x);
    case gcSphere: return c_sin(x);
    case gcProduct: throw new NotPorted('sin_auto: product (PIU)');
    case gcSL2: return c_sinh(x);
    default: return x;
  }
}

export function asin_auto(x: number): number {
  switch (cgclass()) {
    case gcEuclid: return x;
    case gcHyperbolic: return c_asinh(x);
    case gcSphere: return Math.asin(x);
    case gcProduct: throw new NotPorted('asin_auto: product (PIU)');
    case gcSL2: return c_asinh(x);
    default: return x;
  }
}

export function acos_auto(x: number): number {
  switch (cgclass()) {
    case gcHyperbolic: return c_acosh(x);
    case gcSphere: return Math.acos(x);
    case gcProduct: throw new NotPorted('acos_auto: product (PIU)');
    case gcSL2: return c_acosh(x);
    default: return x;
  }
}

/** volume of a three-dimensional ball of radius r in the current isotropic geometry */
export function volume_auto(r: number): number {
  switch (cgclass()) {
    case gcEuclid: return r * r * r * deg(240);
    case gcHyperbolic: return M_PI * (c_sinh(2 * r) - 2 * r);
    case gcSphere: return M_PI * (2 * r - c_sin(2 * r));
    default: return 0;
  }
}

/** area of a circle of radius r in the current isotropic geometry */
export function area_auto(r: number): number {
  switch (cgclass()) {
    case gcEuclid: return r * r * M_PI;
    case gcHyperbolic: return TAU * (c_cosh(r) - 1);
    case gcSphere: return TAU * (1 - c_cos(r));
    default: return 0;
  }
}

export function inverse_area_auto(vol: number): number {
  switch (cgclass()) {
    case gcEuclid: return Math.sqrt(vol / M_PI);
    case gcHyperbolic: return acosh_clamp(vol / TAU + 1);
    case gcSphere: return acos_clamp(1 - vol / TAU);
    default: return 0;
  }
}

export function inverse_volume_euc(vol: number): number {
  return Math.pow(vol * 3 / 4 / M_PI, 1 / 3.);
}

export function inverse_volume_auto(vol: number): number {
  switch (cgclass()) {
    case gcEuclid: return inverse_volume_euc(vol);
    case gcHyperbolic: {
      let r = vol < 10 ? inverse_volume_euc(vol) : c_asinh(vol / M_PI) / 2;
      if (r > 0) for (let i = 0; i < 5; i++) r += (vol - volume_auto(r)) / (4 * M_PI * Math.pow(c_sinh(r), 2));
      return r;
    }
    case gcSphere: {
      if (vol <= 0) return 0;
      if (vol >= TAU * M_PI) return M_PI;
      let r = vol < M_PI ? inverse_volume_euc(vol) : vol > TAU * M_PI - M_PI ? M_PI - inverse_volume_euc(TAU * M_PI - vol) : vol / TAU;
      if (c_sin(r)) for (let i = 0; i < 5; i++) r += (vol - volume_auto(r)) / (4 * M_PI * Math.pow(c_sin(r), 2));
      return r;
    }
    default: return 0;
  }
}

/** volume in 3D, area in 2D */
export function wvolarea_auto(r: number): number {
  if (WDIM() === 3) return volume_auto(r);
  else return area_auto(r);
}

/** volume in 3D, area in 2D -- inverse */
export function inverse_wvolarea_auto(r: number): number {
  if (WDIM() === 3) return inverse_volume_auto(r);
  else return inverse_area_auto(r);
}

export function asin_clamp(x: number): number { return x > 1 ? deg(90) : x < -1 ? -deg(90) : Number.isNaN(x) ? 0 : Math.asin(x); }

export function acos_clamp(x: number): number { return x > 1 ? 0 : x < -1 ? M_PI : Number.isNaN(x) ? 0 : Math.acos(x); }

export function asin_auto_clamp(x: number): number {
  switch (cgclass()) {
    case gcEuclid: return x;
    case gcHyperbolic: return c_asinh(x);
    case gcSL2: return c_asinh(x);
    case gcSphere: return asin_clamp(x);
    case gcProduct: throw new NotPorted('asin_auto_clamp: product (PIU)');
    default: return x;
  }
}

export function acosh_clamp(x: number): number { return x < 1 ? 0 : c_acosh(x); }

export function acos_auto_clamp(x: number): number {
  switch (cgclass()) {
    case gcHyperbolic: return acosh_clamp(x);
    case gcSL2: return acosh_clamp(x);
    case gcSphere: return acos_clamp(x);
    case gcProduct: throw new NotPorted('acos_auto_clamp: product (PIU)');
    default: return x;
  }
}

export function cos_auto(x: number): number {
  switch (cgclass()) {
    case gcEuclid: return 1;
    case gcHyperbolic: return c_cosh(x);
    case gcSL2: return c_cosh(x);
    case gcSphere: return c_cos(x);
    case gcProduct: throw new NotPorted('cos_auto: product (PIU)');
    default: return 1;
  }
}

export function tan_auto(x: number): number {
  switch (cgclass()) {
    case gcEuclid: return x;
    case gcHyperbolic: return c_tanh(x);
    case gcSphere: return Math.tan(x);
    case gcProduct: throw new NotPorted('tan_auto: product (PIU)');
    case gcSL2: return c_tanh(x);
    default: return 1;
  }
}

export function atan_auto(x: number): number {
  switch (cgclass()) {
    case gcEuclid: return x;
    case gcHyperbolic: return c_atanh(x);
    case gcSphere: return c_atan(x);
    case gcProduct: throw new NotPorted('atan_auto: product (PIU)');
    case gcSL2: return c_atanh(x);
    default: return x;
  }
}

export function atan2_auto(y: number, x: number): number {
  switch (cgclass()) {
    case gcEuclid: return y / x;
    case gcHyperbolic: return c_atanh(y / x);
    case gcSL2: return c_atanh(y / x);
    case gcSphere: return c_atan2(y, x);
    case gcProduct: throw new NotPorted('atan2_auto: product (PIU)');
    default: return y / x;
  }
}

/** This function returns the length of the edge opposite the angle alpha in
 *  a triangle with angles alpha, beta, gamma. This is called the cosine rule,
 *  and of course works only in non-Euclidean geometry. */
export function edge_of_triangle_with_angles(alpha: number, beta: number, gamma: number): number {
  return acos_auto((c_cos(alpha) + c_cos(beta) * c_cos(gamma)) / (c_sin(beta) * c_sin(gamma)));
}

export function hpxy(x: number, y: number): hyperpoint {
  if (embedded_plane()) throw new NotPorted('hpxy: embedded plane');
  if (sl2()) return hpt(x, y, 0, Math.sqrt(1 + x * x + y * y));
  if (mtwisted()) return hpt(x, y, 0, Math.sqrt(1 - x * x - y * y));
  if (gproduct()) throw new NotPorted('hpxy: product (PIU)');
  return hpxyz(x, y, translatable() ? 1 : sphere() ? Math.sqrt(1 - x * x - y * y) : Math.sqrt(1 + x * x + y * y));
}

export function hpxy3(x: number, y: number, z: number): hyperpoint {
  return hpxyz3(x, y, z, sl2() ? Math.sqrt(1 + x * x + y * y - z * z) : translatable() ? 1 : sphere() ? Math.sqrt(1 - x * x - y * y - z * z) : Math.sqrt(1 + x * x + y * y + z * z));
}

// a point (I hope this number needs no comments ;) )
export const Cx12: hyperpoint = hpt(1, 0, 1.41421356237, 0);
export const Cx13: hyperpoint = hpt(1, 0, 0, 1.41421356237);

/** #define Cx1 (GDIM==2?Cx12:Cx13) */
export function Cx1(): hyperpoint { return GDIM() === 2 ? Cx12 : Cx13; }

export function zero_d(d: number, h: hyperpoint): boolean {
  for (let i = 0; i < d; i++) if (h[i]) return false;
  return true;
}

/** inner product in the current geometry */
export function geo_inner(h1: hyperpoint, h2: hyperpoint): number {
  let res = 0;
  for (let i = 0; i < MDIM(); i++) res += h1[i] * h2[i] * sig(i);
  return res;
}

/** this function returns approximate square of distance between two points
 *  (in the spherical analogy, this would be the distance in the 3D space,
 *  through the interior, not on the surface)
 *  also used to verify whether a point h1 is on the hyperbolic plane by using Hypc for h2 */
export function intval(h1: hyperpoint, h2: hyperpoint): number {
  let res = 0;
  for (let i = 0; i < MDIM(); i++) res += squar(h1[i] - h2[i]) * sig(i);
  if (elliptic()) {
    let res2 = 0;
    for (let i = 0; i < MDIM(); i++) res2 += squar(h1[i] + h2[i]) * sig(i);
    return Math.min(res, res2);
  }
  return res;
}

export function quickdist(h1: hyperpoint, h2: hyperpoint): number {
  if (gproduct()) return hdist(h1, h2);
  return intval(h1, h2);
}

/** square Euclidean hypotenuse in the first d dimensions */
export function sqhypot_d(d: number, h: hyperpoint): number {
  let sum = 0;
  for (let i = 0; i < d; i++) sum += h[i] * h[i];
  return sum;
}

/** Euclidean hypotenuse in the first d dimensions */
export function hypot_d(d: number, h: hyperpoint): number {
  return Math.sqrt(sqhypot_d(d, h));
}

/** h1 and h2 define a line; to_other_side(h1,h2)*x is x moved orthogonally to this line, by double the distance from C0
 *  (I suppose it could be done better) */
export function to_other_side(h1: hyperpoint, h2: hyperpoint): transmatrix {

  // if(cgi.emb->is_sph_in_low() && !geom3::flipped): an embedded plane (3D graphics, a later stage)
  if (embedded_plane()) throw new NotPorted('to_other_side: embedded plane');

  if (sol() && euclid()) {
    /* works in 4x4... */
    return tmul(gpushxto0(h1), gpushxto0(h2));
  }

  const d = hdist(h1, h2);

  let v: hyperpoint;
  if (euclid())
    v = hdiv(hsub(h2, h1), d);
  else
    v = hdiv(hsub(hmul(h1, cos_auto(d)), h2), sin_auto(d));

  let d1: number;
  if (euclid())
    d1 = -hdot(v, h1) / hdot(v, v);
  else
    d1 = atan_auto(-v[LDIM()] / h1[LDIM()]);

  const hm = hadd(hmul(h1, cos_auto(d1)), hmul(hmul(v, sphere() ? -1 : 1), sin_auto(d1)));

  return tmuls(rspintox(hm), xpush(-hdist0(hm) * 2), spintox(hm));
}

/** positive for a material vertex, 0 for ideal vertex, negative for ultra-ideal vertex */
export function material(h: hyperpoint): number {
  if (sphere() || (gproduct() && in_s2xe())) return intval(h, Hypc);
  else if (hyperbolic() || (gproduct() && in_h2xe())) return -intval(h, Hypc);
  // #if MAXMDIM >= 4
  else if (sl2()) return h[2] * h[2] + h[3] * h[3] - h[0] * h[0] - h[1] * h[1];
  else return h[LDIM()];
}
/** in_h2xe() (nonisotropic.cpp): gproduct && hybrid::under_class() == gcHyperbolic; only reached in product */
function in_h2xe(): boolean { throw new NotPorted('in_h2xe'); }

export function safe_classify_ideals(h: hyperpoint): number {
  if (hyperbolic() || (gproduct() && in_h2xe())) {
    h = hdiv(h, h[LDIM()]);
    const x = MDIM() === 3 ? 1 - (h[0] * h[0] + h[1] * h[1]) : 1 - (h[0] * h[0] + h[1] * h[1] + h[2] * h[2]);
    if (x > 1e-6) return 1;
    if (x < -1e-6) return -1;
    return 0;
  }
  return 1;
}

// ideal_limit, ideal_each: G

export function safe_approximation_of_ideal(h: hyperpoint): hyperpoint {
  return towards_inf(C0(), h, G.ideal_limit);
}

/** the point on the line ab which is closest to zero. Might not be normalized. Works even if a and b are (ultra)ideal */
export function closest_to_zero(a: hyperpoint, b: hyperpoint): hyperpoint {
  if (sqhypot_d(MDIM(), hsub(a, b)) < 1e-9) return a;
  if (Number.isNaN(a[0])) return a;
  a = hdiv(a, a[LDIM()]);
  b = hdiv(b, b[LDIM()]);
  let mul_a = 0, mul_b = 0;
  for (let i = 0; i < LDIM(); i++) {
    const z = a[i] - b[i];
    mul_a += a[i] * z;
    mul_b -= b[i] * z;
  }

  return hdiv(hadd(hmul(a, mul_b), hmul(b, mul_a)), mul_a + mul_b);
}

/** should be called get_lof */
export function zlevel(h: hyperpoint): number {
  if (sl2()) return Math.sqrt(-intval(h, Hypc));
  else if (translatable()) return h[LDIM()];
  else if (sphere()) return Math.sqrt(intval(h, Hypc));
  else if (gproduct()) throw new NotPorted('zlevel: product');
  else return (h[LDIM()] < 0 ? -1 : 1) * Math.sqrt(-intval(h, Hypc));
}

export function hypot_auto(x: number, y: number): number {
  switch (cgclass()) {
    case gcEuclid:
      return Math.hypot(x, y);
    case gcHyperbolic:
      return c_acosh(c_cosh(x) * c_cosh(y));
    case gcSphere:
      return Math.acos(c_cos(x) * c_cos(y));
    default:
      return Math.hypot(x, y);
  }
}

/** normalize the homogeneous coordinates */
export function normalize(H: hyperpoint): hyperpoint {
  if (gproduct()) return H;
  const Z = zlevel(H);
  H = hcopy(H);
  for (let c = 0; c < MXDIM(); c++) H[c] /= Z;
  return H;
}

/** like normalize but makes (ultra)ideal points material */
export function ultra_normalize(H: hyperpoint): hyperpoint {
  if (material(H) <= 0) {
    H = hcopy(H);
    H[LDIM()] = hypot_d(LDIM(), H) + 1e-10;
  }
  return normalize(H);
}

/** get the center of the line segment from H1 to H2 */
export function mid(H1: hyperpoint, H2: hyperpoint): hyperpoint {
  if (gproduct()) throw new NotPorted('mid: product');
  return normalize(hadd(H1, H2));
}

export function mid_sp(H1: shiftpoint, H2: shiftpoint): shiftpoint {
  return shiftless(mid(H1.h, H2.h), (H1.shift + H2.shift) / 2);
}

/** like mid, but take 3D into account */
export function midz(H1: hyperpoint, H2: hyperpoint): hyperpoint {
  if (gproduct()) return mid(H1, H2);
  const H3 = hadd(H1, H2);

  let Z = 2;

  if (!euclid()) Z = zlevel(H3) * 2 / (zlevel(H1) + zlevel(H2));
  for (let c = 0; c < MXDIM(); c++) H3[c] /= Z;

  return H3;
}

// matrices
//==========

/** rotate by alpha degrees in the coordinates a, b */
export function cspin(a: number, b: number, alpha: number): transmatrix {
  const T = tcopy(Id);
  T[a][a] = +c_cos(alpha); T[a][b] = +c_sin(alpha);
  T[b][a] = -c_sin(alpha); T[b][b] = +c_cos(alpha);
  return T;
}

export function lorentz(a: number, b: number, v: number): transmatrix {
  const T = tcopy(Id);
  T[a][a] = T[b][b] = c_cosh(v);
  T[a][b] = T[b][a] = c_sinh(v);
  return T;
}

/** rotate by 90 degrees in the coordinates a, b */
export function cspin90(a: number, b: number): transmatrix {
  const T = tcopy(Id);
  T[a][a] = 0; T[a][b] = 1;
  T[b][a] = -1; T[b][b] = 0;
  return T;
}

/** rotate by 180 degrees in the coordinates a, b */
export function cspin180(a: number, b: number): transmatrix {
  const T = tcopy(Id);
  T[a][a] = T[b][b] = -1;
  return T;
}

export function random_spin3(): transmatrix {
  const alpha2 = Math.asin(randd() * 2 - 1);
  const alpha = randd() * TAU;
  const alpha3 = randd() * TAU;
  return tmuls(cspin(0, 1, alpha), cspin(0, 2, alpha2), cspin(1, 2, alpha3));
}

export function random_spin(): transmatrix {
  if (WDIM() === 2) return spin(randd() * TAU);
  else return random_spin3();
}

export function eupush(x: number, y: number): transmatrix {
  const T = tcopy(Id);
  T[0][LDIM()] = x;
  T[1][LDIM()] = y;
  return T;
}

export function euclidean_translate(x: number, y: number, z: number): transmatrix {
  const T = tcopy(Id);
  T[0][LDIM()] = x;
  T[1][LDIM()] = y;
  T[2][LDIM()] = z;
  return T;
}

export function euscalexx(x: number): transmatrix {
  const T = tcopy(Id);
  T[0][0] = x;
  T[1][1] = x;
  return T;
}

export function euscale(x: number, y: number): transmatrix {
  const T = tcopy(Id);
  T[0][0] = x;
  T[1][1] = y;
  return T;
}

export function euscale3(x: number, y: number, z: number): transmatrix {
  const T = tcopy(Id);
  T[0][0] = x;
  T[1][1] = y;
  T[2][2] = z;
  return T;
}

export function eupoint(x: number, y: number): hyperpoint {
  return hpt(x, y, MDIM() === 3 ? 1 : 0, 1);
}

/** eupush(hyperpoint h, ld co = 1) */
export function eupush_h(h: hyperpoint, co = 1): transmatrix {
  if (nonisotropic()) throw new NotPorted('eupush: nisot::translate');
  if (hyperbolic()) { return co ? parabolic13_at(deparabolic13(h)) : inverse(parabolic13_at(deparabolic13(h))); }
  const T = tcopy(Id);
  for (let i = 0; i < GDIM(); i++) T[i][LDIM()] = h[i] * co;
  return T;
}

export function eupush3(x: number, y: number, z: number): transmatrix {
  if (sl2()) throw new NotPorted('eupush3: slr::translate');
  return eupush_h(point3(x, y, z));
}

export function euscalezoom(h: hyperpoint): transmatrix {
  const T = tcopy(Id);
  T[0][0] = h[0];
  T[0][1] = -h[1];
  T[1][0] = h[1];
  T[1][1] = h[0];
  return T;
}

export function euaffine(h: hyperpoint): transmatrix {
  const T = tcopy(Id);
  T[0][1] = h[0];
  T[1][1] = c_exp(h[1]);
  return T;
}

export function cpush(cid: number, alpha: number): transmatrix {
  if (gproduct() && cid === 2)
    return scale_matrix(Id, c_exp(alpha));
  const T = tcopy(Id);
  if (nonisotropic())
    return eupush3(cid === 0 ? alpha : 0, cid === 1 ? alpha : 0, cid === 2 ? alpha : 0);
  const L = LDIM();
  T[L][L] = T[cid][cid] = cos_auto(alpha);
  T[cid][L] = sin_auto(alpha);
  T[L][cid] = -curvature() * sin_auto(alpha);
  return T;
}

export function cmirror(cid: number): transmatrix {
  const T = tcopy(Id);
  T[cid][cid] = -1;
  return T;
}

/** push alpha units to the right */
export function xpush(alpha: number): transmatrix { return cpush(0, alpha); }

export function eqmatrix(A: transmatrix, B: transmatrix, eps = .01): boolean {
  for (let i = 0; i < MXDIM(); i++)
    for (let j = 0; j < MXDIM(); j++)
      if (Math.abs(A[i][j] - B[i][j]) > eps)
        return false;
  return true;
}

/** push alpha units vertically */
export function ypush(alpha: number): transmatrix { return cpush(1, alpha); }

export function zpush(z: number): transmatrix { return cpush(2, z); }

export function matrix3(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number): transmatrix {
  if (GDIM() === 2 || MDIM() === 3)
    return [[a, b, c, 0], [d, e, f, 0], [g, h, i, 0], [0, 0, 0, 1]];
  else
    return [[a, b, 0, c], [d, e, 0, f], [0, 0, 1, 0], [g, h, 0, i]];
}

export function matrix4(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number,
  i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number): transmatrix {
  return [[a, b, c, d], [e, f, g, h], [i, j, k, l], [m, n, o, p]];
}

export function parabolic1(u: number): transmatrix {
  if (euclid())
    return ypush(u);
  // else if(cgi.emb->is_hyp_in_solnih() && !geom3::flipped): an embedded plane (later stage)
  else {
    const diag_ = u * u / 2;
    return matrix3(
      -diag_ + 1, u, diag_,
      -u, 1, u,
      -diag_, u, diag_ + 1,
    );
  }
}

/** parabolic13(ld u, ld v) */
export function parabolic13_uv(u: number, v: number): transmatrix {
  if (euclid())
    return eupush3(0, u, v);
  // else if(cgi.emb->is_euc_in_hyp()): an embedded plane (later stage)
  else {
    const diag_ = (u * u + v * v) / 2;
    return matrix4(
      -diag_ + 1, u, v, diag_,
      -u, 1, 0, u,
      -v, 0, 1, v,
      -diag_, u, v, diag_ + 1,
    );
  }
}

export function kleinize(h: hyperpoint): hyperpoint {
  if (GDIM() === 2) return point3(h[0] / h[2], h[1] / h[2], 1);
  else return point31(h[0] / h[3], h[1] / h[3], h[2] / h[3]);
}

export function deparabolic13(h: hyperpoint): hyperpoint {
  if (euclid()) return h;
  // if(cgi.emb->is_euc_in_hyp()): an embedded plane (later stage)
  h = hdiv(h, 1 + h[LDIM()]);
  h[0] -= 1;
  h = hdiv(h, sqhypot_d(LDIM(), h));
  h[0] += .5;
  return point3(c_log(2) + c_log(-h[0]), h[1] * 2, LDIM() === 3 ? h[2] * 2 : 0);
}

/** parabolic13(hyperpoint h) */
export function parabolic13(h: hyperpoint): hyperpoint {
  if (euclid()) return h;
  // else if(cgi.emb->is_euc_in_hyp()): an embedded plane (later stage)
  else if (LDIM() === 3)
    return tmulh(parabolic13_uv(h[1], h[2]), xpush0(h[0]));
  else
    return tmulh(parabolic1(h[1]), xpush0(h[0]));
}

export function parabolic13_at(h: hyperpoint): transmatrix {
  if (euclid()) return rgpushxto0(h);
  // else if(cgi.emb->is_euc_in_hyp()): an embedded plane (later stage)
  else if (LDIM() === 3)
    return tmul(parabolic13_uv(h[1], h[2]), xpush(h[0]));
  else
    return tmul(parabolic1(h[1]), xpush(h[0]));
}

export function spintoc(H: hyperpoint, t: number, f: number): transmatrix {
  const T = tcopy(Id);
  const R = Math.hypot(H[f], H[t]);
  if (R >= 1e-15) {
    T[t][t] = +H[t] / R; T[t][f] = +H[f] / R;
    T[f][t] = -H[f] / R; T[f][f] = +H[t] / R;
  }
  return T;
}

/** an Euclidean rotation in the axes (t,f) which rotates the point H to the positive 't' axis */
export function rspintoc(H: hyperpoint, t: number, f: number): transmatrix {
  const T = tcopy(Id);
  const R = Math.hypot(H[f], H[t]);
  if (R >= 1e-15) {
    T[t][t] = +H[t] / R; T[t][f] = -H[f] / R;
    T[f][t] = +H[f] / R; T[f][f] = +H[t] / R;
  }
  return T;
}

/** an isometry which takes the point H to the positive X axis (see rspintox) */
export function spintox(H: hyperpoint): transmatrix {
  if (GDIM() === 2 || gproduct()) return spintoc(H, 0, 1);
  const T1 = spintoc(H, 0, 1);
  return tmul(spintoc(tmulh(T1, H), 0, 2), T1);
}

/** inverse of spintox */
export function rspintox(H: hyperpoint): transmatrix {
  if (GDIM() === 2 || gproduct()) return rspintoc(H, 0, 1);
  const T1 = spintoc(H, 0, 1);
  return tmul(rspintoc(H, 0, 1), rspintoc(tmulh(T1, H), 0, 2));
}

/** for H on the X axis, this matrix pushes H to C0 (see gpushxto0) */
export function pushxto0(H: hyperpoint): transmatrix {
  const T = tcopy(Id); const L = LDIM();
  T[0][0] = +H[L]; T[0][L] = -H[0];
  T[L][0] = curvature() * H[0]; T[L][L] = +H[L];
  return T;
}

/** set the i-th column of T to H (in place) */
export function set_column(T: transmatrix, i: number, H: hyperpoint): void {
  for (let j = 0; j < MXDIM(); j++)
    T[j][i] = H[j];
}

export function get_column(T: transmatrix, i: number): hyperpoint {
  const h = hnew();
  for (let j = 0; j < MXDIM(); j++)
    h[j] = T[j][i];
  return h;
}

/** build a matrix using the given vectors as columns */
export function build_matrix(h1: hyperpoint, h2: hyperpoint, h3: hyperpoint, h4: hyperpoint): transmatrix {
  const T = tnew();
  for (let i = 0; i < MXDIM(); i++) {
    T[i][0] = h1[i];
    T[i][1] = h2[i];
    T[i][2] = h3[i];
    /* if(MAXMDIM == 4) */ T[i][3] = h4[i];
  }
  return T;
}

/** for H on the X axis, this matrix pushes C0 to H (see rgpushxto0) */
export function rpushxto0(H: hyperpoint): transmatrix {
  const T = tcopy(Id); const L = LDIM();
  T[0][0] = +H[L]; T[0][L] = H[0];
  T[L][0] = -curvature() * H[0]; T[L][L] = +H[L];
  return T;
}

export function ggpushxto0(H: hyperpoint, co: number): transmatrix {
  if (translatable())
    return eupush_h(H, co);
  if (gproduct()) throw new NotPorted('ggpushxto0: product');
  const res = tcopy(Id);
  if (sqhypot_d(GDIM(), H) < 1e-16) return res;
  const L = LDIM(), gd = GDIM();
  const fac = -curvature() / (H[L] + 1);
  for (let i = 0; i < gd; i++)
    for (let j = 0; j < gd; j++)
      res[i][j] += H[i] * H[j] * fac;

  for (let d = 0; d < gd; d++) {
    res[d][L] = co * H[d];
    res[L][d] = -curvature() * co * H[d];
  }
  res[L][L] = H[L];

  return res;
}

/** a translation matrix which takes H to 0 */
export function gpushxto0(H: hyperpoint): transmatrix {
  return ggpushxto0(H, -1);
}

/** a translation matrix which takes 0 to H */
export function rgpushxto0(H: hyperpoint): transmatrix {
  return ggpushxto0(H, 1);
}

export function rgpushxto0_sp(H: shiftpoint): shiftmatrix {
  return shiftless_t(rgpushxto0(H.h), H.shift);
}

// dont_fixmatrix: G

/** Fix the numerical inaccuracies in the isometry T (in place).
 *
 *  The nature of hyperbolic geometry makes the computations numerically unstable.
 *  The numerical errors tend to accumulate, eventually destroying the projection.
 *  This function fixes this problem by replacing T with a 'correct' isometry. */
export function fixmatrix(T: transmatrix): void {
  if (G.dont_fixmatrix) return;
  else if (nonisotropic()) { /* T may be inverse... do not do that */ }
  else if ((cgflags() & qAFFINE) !== 0n) { /* affine */ }
  else if (gproduct()) throw new NotPorted('fixmatrix: product');
  else if (euclid())
    fixmatrix_euclid(T);
  else
    orthonormalize(T);
}

export function fixmatrix_euclid(T: transmatrix): void {
  const gd = GDIM();
  for (let x = 0; x < gd; x++) for (let y = 0; y <= x; y++) {
    let dp = 0;
    for (let z = 0; z < gd; z++) dp += T[z][x] * T[z][y];

    if (y === x) dp = 1 - Math.sqrt(1 / dp);

    for (let z = 0; z < gd; z++) T[z][x] -= dp * T[z][y];
  }
  for (let x = 0; x < gd; x++) T[LDIM()][x] = 0;
  T[LDIM()][LDIM()] = 1;
}

export function orthonormalize(T: transmatrix): void {
  const md = MDIM(), mx = MXDIM();
  for (let x = 0; x < md; x++) for (let y = 0; y <= x; y++) {
    let dp = 0;
    for (let z = 0; z < mx; z++) dp += T[z][x] * T[z][y] * sig(z);

    if (y === x) dp = 1 - Math.sqrt(sig(x) / dp);

    for (let z = 0; z < mx; z++) T[z][x] -= dp * T[z][y];
  }
}

/** fix a 3D rotation matrix */
export function fix_rotation(rot: transmatrix): void {
  const g = G.geometry;
  G.geometry = gSphere;
  try {
    fixmatrix(rot);
    fix4(rot);
  } finally { G.geometry = g; }
}

/** determinant 2x2 */
export function det2(T: transmatrix): number {
  return T[0][0] * T[1][1] - T[0][1] * T[1][0];
}

/** determinant 3x3 */
export function det3(T: transmatrix): number {
  let det_ = 0;
  for (let i = 0; i < 3; i++)
    det_ += T[0][i] * T[1][(i + 1) % 3] * T[2][(i + 2) % 3];
  for (let i = 0; i < 3; i++)
    det_ -= T[0][i] * T[1][(i + 2) % 3] * T[2][(i + 1) % 3];
  return det_;
}

/** determinant */
export function det(T: transmatrix): number {
  if (MDIM() === 3)
    return det3(T);
  else {
    let det_ = 1;
    const M = tcopy(T);
    const md = MDIM();
    for (let a = 0; a < md; a++) {
      let max_at = a;
      for (let b = a; b < md; b++)
        if (Math.abs(M[b][a]) > Math.abs(M[max_at][a]))
          max_at = b;

      if (max_at !== a)
        for (let c = a; c < md; c++) { const t = M[a][c]; M[a][c] = M[max_at][c]; M[max_at][c] = -t; }

      if (!M[a][a]) return 0;
      for (let b = a + 1; b < md; b++) {
        const co = -M[b][a] / M[a][a];
        for (let c = a; c < md; c++) M[b][c] += M[a][c] * co;
      }
      det_ *= M[a][a];
    }
    return det_;
  }
}

/** warning about incorrect inverse: rate_limited_error (a log message), left out */
function inverse_error(_T: transmatrix): void { }

/** inverse of a 3x3 matrix */
export function inverse3(T: transmatrix): transmatrix {
  const d = det3(T);
  const T2 = tnew();
  if (d === 0) {
    inverse_error(T);
    return tcopy(Id);
  }

  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      T2[j][i] = (T[(i + 1) % 3][(j + 1) % 3] * T[(i + 2) % 3][(j + 2) % 3] - T[(i + 1) % 3][(j + 2) % 3] * T[(i + 2) % 3][(j + 1) % 3]) / d;
  return T2;
}

/** inverse of a 2x2 matrix */
export function inverse2(T: transmatrix): transmatrix {
  const d = det2(T);
  if (d === 0) {
    inverse_error(T);
    return tcopy(Id);
  }

  const T2 = tcopy(Id);
  T2[0][0] = T[1][1] / d;
  T2[1][1] = T[0][0] / d;
  T2[0][1] = -T[0][1] / d;
  T2[1][0] = -T[1][0] / d;
  return T2;
}

/** inverse of a general matrix */
export function inverse(T: transmatrix): transmatrix {
  if (MDIM() === 3)
    return inverse3(T);
  else {
    const T1 = tcopy(T);
    const T2 = tcopy(Id);
    const md = MDIM();

    for (let a = 0; a < md; a++) {
      let best = a;

      for (let b = a + 1; b < md; b++)
        if (Math.abs(T1[b][a]) > Math.abs(T1[best][a]))
          best = b;

      const b = best;

      if (b !== a)
        for (let c = 0; c < md; c++) {
          let t = T1[b][c]; T1[b][c] = T1[a][c]; T1[a][c] = t;
          t = T2[b][c]; T2[b][c] = T2[a][c]; T2[a][c] = t;
        }

      if (!T1[a][a]) { inverse_error(T); return tcopy(Id); }
      for (let b = a + 1; b <= GDIM(); b++) {
        const co = -T1[b][a] / T1[a][a];
        for (let c = 0; c < md; c++) { T1[b][c] += T1[a][c] * co; T2[b][c] += T2[a][c] * co; }
      }
    }

    for (let a = md - 1; a >= 0; a--) {
      for (let b = 0; b < a; b++) {
        const co = -T1[b][a] / T1[a][a];
        for (let c = 0; c < md; c++) { T1[b][c] += T1[a][c] * co; T2[b][c] += T2[a][c] * co; }
      }
      const co = 1 / T1[a][a];
      for (let c = 0; c < md; c++) { T1[a][c] *= co; T2[a][c] *= co; }
    }
    return T2;
  }
}

/** inverse of an orthogonal matrix, i.e., transposition */
export function ortho_inverse(T: transmatrix): transmatrix {
  T = tcopy(T);
  for (let i = 1; i < MDIM(); i++)
    for (let j = 0; j < i; j++) { const t = T[i][j]; T[i][j] = T[j][i]; T[j][i] = t; }
  return T;
}

/** inverse of an orthogonal matrix in Minkowski space */
export function pseudo_ortho_inverse(T: transmatrix): transmatrix {
  T = tcopy(T);
  for (let i = 1; i < MXDIM(); i++)
    for (let j = 0; j < i; j++) { const t = T[i][j]; T[i][j] = T[j][i]; T[j][i] = t; }
  const md = MDIM();
  for (let i = 0; i < md - 1; i++) {
    T[i][md - 1] = -T[i][md - 1];
    T[md - 1][i] = -T[md - 1][i];
  }
  return T;
}

/** inverse of an isometry -- in most geometries this can be done more efficiently than using inverse */
export function iso_inverse(T: transmatrix): transmatrix {
  if (hyperbolic())
    return pseudo_ortho_inverse(T);
  if (sphere())
    return ortho_inverse(T);
  if (nil()) throw new NotPorted('iso_inverse: nil');
  if (euclid() && !((cgflags() & qAFFINE) !== 0n)) {
    const U = tcopy(Id);
    const md = MDIM();
    for (let i = 0; i < md - 1; i++)
      for (let j = 0; j < md - 1; j++)
        U[i][j] = T[j][i];
    const h = tmulh(U, tC0(T));
    for (let i = 0; i < md - 1; i++)
      U[i][md - 1] = -h[i];
    return U;
  }
  return inverse(T);
}

/** inverse a guaranteed rotation */
export function rot_inverse(T: transmatrix): transmatrix {
  return transpose(T);
}

/** T inverse a matrix T = O*S, where O is isometry and S is a scaling matrix (todo optimize) */
export function z_inverse(T: transmatrix): transmatrix {
  return inverse(T);
}

/** T inverse a matrix T = O*P, where O is orthogonal and P is an isometry (todo optimize) */
export function view_inverse(T: transmatrix): transmatrix {
  if (nonisotropic()) return inverse(T);
  if (gproduct()) return z_inverse(T);
  return iso_inverse(T);
}

/** T inverse a matrix T = P*O, where O is orthogonal and P is an isometry (todo optimize) */
export function iview_inverse(T: transmatrix): transmatrix {
  if (nonisotropic()) return inverse(T);
  if (gproduct()) return z_inverse(T);
  return iso_inverse(T);
}

export function product_decompose(h: hyperpoint): [number, hyperpoint] {
  const z = zlevel(h);
  return [z, scale_point(h, c_exp(-z))];
}

/** distance from mh and 0 */
export function hdist0(mh: hyperpoint): number {
  switch (cgclass()) {
    case gcHyperbolic:
      if (mh[LDIM()] < 1) return 0;
      return c_acosh(mh[LDIM()]);
    case gcEuclid: {
      return hypot_d(GDIM(), mh);
    }
    case gcSphere: {
      const res = mh[LDIM()] >= 1 ? 0 : mh[LDIM()] <= -1 ? M_PI : Math.acos(mh[LDIM()]);
      return res;
    }
    case gcProduct: throw new NotPorted('hdist0: product');
    case gcSL2: {
      const cosh_r = Math.hypot(mh[2], mh[3]);
      const phi = c_atan2(mh[2], mh[3]);
      return Math.hypot(cosh_r < 1 ? 0 : c_acosh(cosh_r), phi);
    }
    case gcNil: {
      const bz = mh[0] * mh[1] / 2;
      return Math.hypot(mh[0], mh[1]) + Math.abs(mh[2] - bz);
    }
    default:
      return hypot_d(GDIM(), mh);
  }
}

export function hdist0_sp(mh: shiftpoint): number {
  return hdist0(unshift(mh));
}

/** length of a circle of radius r */
export function circlelength(r: number): number {
  switch (cgclass()) {
    case gcEuclid:
      return TAU * r;
    case gcHyperbolic:
      return TAU * c_sinh(r);
    case gcSphere:
      return TAU * c_sin(r);
    default:
      return TAU * r;
  }
}

/** distance between h1 and h2 */
export function hdist(h1: hyperpoint, h2: hyperpoint): number {
  const iv = intval(h1, h2);
  switch (cgclass()) {
    case gcEuclid:
      if (iv < 0) return 0;
      return Math.sqrt(iv);
    case gcHyperbolic:
      if (iv < 0) return 0;
      return 2 * c_asinh(Math.sqrt(iv) / 2);
    case gcSphere:
      return 2 * asin_auto_clamp(Math.sqrt(iv) / 2);
    case gcProduct: throw new NotPorted('hdist: product');
    case gcSL2: throw new NotPorted('hdist: SL2 (stretch::itranslate)');
    default:
      if (iv < 0) return 0;
      return Math.sqrt(iv);
  }
}

export function hdist_sp(h1: shiftpoint, h2: shiftpoint): number {
  return hdist(h1.h, unshift(h2, h1.shift));
}

export function precise_hdist(vi: hyperpoint, vj: hyperpoint): number {
  const n = MDIM() - 1;
  if (!(n === 2 || n === 3)) throw new hr_exception('hassert: n == 2 || n == 3');

  const da = c_acosh(vi[n]);
  const db = c_acosh(vj[n]);

  const rs = sqhypot_d(n, vi) * sqhypot_d(n, vj);
  if (!rs) return da + db;

  let cosphi = 0;
  for (let i = 0; i < n; i++) cosphi += vi[i] * vj[i];
  cosphi /= Math.sqrt(rs);

  const co = c_sinh(da) * c_sinh(db) * (1 - cosphi);

  const v = c_cosh(da - db) + co;
  if (v < 1) return 0;
  return c_acosh(v);
}

/** like orthogonal_move but fol may be factor (in 2D graphics) or level (elsewhere) */
export function orthogonal_move_fol(h: hyperpoint, fol: number): hyperpoint {
  if (GDIM() === 2) return scale_point(h, fol);
  else throw new NotPorted('orthogonal_move_fol: 3D (embeddings orthogonal_move)');
}

/** like orthogonal_move but fol may be factor (in 2D graphics) or level (elsewhere) */
export function orthogonal_move_fol_t(T: transmatrix, fol: number): transmatrix {
  if (GDIM() === 2) return scale_matrix(T, fol);
  else return orthogonal_move(T, fol);
}

/** the scaling matrix (Euclidean homogeneous scaling; also shift by log(scale) in product space */
export function scale_matrix(t: transmatrix, scale_factor: number): transmatrix {
  const res = tnew();
  for (let i = 0; i < MXDIM(); i++) {
    for (let j = 0; j < MDIM(); j++)
      res[i][j] = t[i][j] * scale_factor;
    for (let j = MDIM(); j < MXDIM(); j++)
      res[i][j] = t[i][j];
  }
  return res;
}

export function scale_matrix_sm(t: shiftmatrix, scale_factor: number): shiftmatrix {
  return shiftless_t(scale_matrix(t.T, scale_factor), t.shift);
}

/** the scaling matrix (Euclidean homogeneous scaling; also shift by log(scale) in product space */
export function scale_point(h: hyperpoint, scale_factor: number): hyperpoint {
  const res = hnew();
  for (let j = 0; j < MDIM(); j++)
    res[j] = h[j] * scale_factor;
  for (let j = MDIM(); j < MXDIM(); j++)
    res[j] = h[j];
  return res;
}

export function orthogonal_move(t: transmatrix, level: number): transmatrix {
  if (GDIM() === 3) return tmul(t, lzpush(level));
  throw new NotPorted('orthogonal_move: geom3::lev_to_factor (graphics)');
}

/** fix a 3x3 matrix into a 4x4 matrix, in place */
export function fix4(t: transmatrix): void {
  // if(ldebug) println(hlog, "fix4 performed");
  for (let i = 0; i < 4; i++) t[3][i] = t[i][3] = (i === 3 ? 1 : 0);
}

/** fix a 3x3 matrix into a 4x4 matrix, as a function */
export function fix4_f(t: transmatrix): transmatrix { t = tcopy(t); fix4(t); return t; }

export function xyscale(t: transmatrix, fac: number): transmatrix {
  const res = tnew();
  for (let i = 0; i < MXDIM(); i++) {
    for (let j = 0; j < GDIM(); j++)
      res[i][j] = t[i][j] * fac;
    for (let j = GDIM(); j < MXDIM(); j++)
      res[i][j] = t[i][j];
  }
  return res;
}

export function xyzscale(t: transmatrix, fac: number, facz: number): transmatrix {
  const res = tnew();
  const L = LDIM();
  for (let i = 0; i < MXDIM(); i++) {
    for (let j = 0; j < GDIM(); j++)
      res[i][j] = t[i][j] * fac;
    res[i][L] =
      t[i][L] * facz;
    for (let j = L + 1; j < MXDIM(); j++)
      res[i][j] = t[i][j];
  }
  return res;
}

export function mzscale(t: transmatrix, fac: number): transmatrix {
  if (GDIM() === 3) return tmul(t, cpush(2, fac));
  // take only the spin
  const tcentered = tmul(gpushxto0(tC0(t)), t);
  // tcentered = tcentered * spin(downspin_zivory);
  fac -= 1;
  const res = tmuls(t, inverse(tcentered), ypush(-fac), tcentered);
  fac *= .2;
  fac += 1;
  for (let i = 0; i < MXDIM(); i++) for (let j = 0; j < MXDIM(); j++)
    res[i][j] = res[i][j] * fac;
  return res;
}

export function mid3(h1: hyperpoint, h2: hyperpoint, h3: hyperpoint): hyperpoint {
  const s = hadd(hadd(h1, h2), h3);
  return mid(s, s);
}

export function mid_at(h1: hyperpoint, h2: hyperpoint, v: number): hyperpoint {
  const h = hadd(hmul(h1, 1 - v), hmul(h2, v));
  return mid(h, h);
}

export function mid_at_actual(h: hyperpoint, v: number): hyperpoint {
  return tmulh(rspintox(h), xpush0(hdist0(h) * v));
}

/** in 3D, an orthogonal projection of C0 on the given triangle */
export function orthogonal_of_C0(h0: hyperpoint, h1: hyperpoint, h2: hyperpoint): hyperpoint {
  h0 = hdiv(h0, h0[3]);
  h1 = hdiv(h1, h1[3]);
  h2 = hdiv(h2, h2[3]);
  const w = h0;
  const d1 = hsub(h1, h0);
  const d2 = hsub(h2, h0);
  const denom = hdot(d1, d1) * hdot(d2, d2) - hdot(d1, d2) * hdot(d1, d2);
  const a1 = hdot(d2, w) * hdot(d1, d2) - hdot(d1, w) * hdot(d2, d2);
  const a2 = hdot(d1, w) * hdot(d1, d2) - hdot(d2, w) * hdot(d1, d1);
  const h = hadd(hadd(hmul(w, denom), hmul(d1, a1)), hmul(d2, a2));
  return normalize(h);
}

export function hpxd(d: number, x: number, y: number, z: number): hyperpoint {
  let H = hpxyz(d * x, d * y, z);
  H = mid(H, H);
  return H;
}

export function signum(x: number): number { return x < 0 ? -1 : x > 0 ? 1 : 0; }

export function asign(y1: number, y2: number): boolean { return signum(y1) !== signum(y2); }

export function xcross(x1: number, y1: number, x2: number, y2: number): number { return x1 + (x2 - x1) * y1 / (y1 - y2); }

/** enum eShiftMethod */
export const smProduct = 0, smIsotropic = 1, smEmbedded = 2, smLie = 3, smGeodesic = 4;
/** enum eEmbeddedShiftMethodChoice */
export const smcNone = 0, smcBoth = 1, smcAuto = 2;
/** enum eShiftMethodApplication */
export const smaManualCamera = 0, smaAutocenter = 1, smaObject = 2, smaWallRadar = 3, smaAnimation = 4;

// embedded_shift_method_choice: G

export function use_embedded_shift(sma: number): boolean {
  switch (sma) {
    case smaAutocenter: case smaAnimation: return G.embedded_shift_method_choice !== smcNone;
    case smaManualCamera: return G.embedded_shift_method_choice === smcBoth;
    case smaObject: return true;
    case smaWallRadar: throw new NotPorted('use_embedded_shift: smaWallRadar (pmodel)');
    default: throw new hr_exception('unknown sma');
  }
}

export function shift_method(sma: number): number {
  if (gproduct()) return smProduct;
  if (embedded_plane() && sma === smaObject) return smEmbedded;
  if (embedded_plane() && use_embedded_shift(sma)) return smEmbedded;
  // !stretch::in() && !(!nisot::geodesic_movement && hyperbolic && bt::in()): both false in the standard geometry
  if (!nonisotropic()) return smIsotropic;
  throw new NotPorted('shift_method: nonisotropic');
}

export function shift_object(Position: transmatrix, _ori: transmatrix, direction: hyperpoint, sm = shift_method(smaObject)): transmatrix {
  switch (sm) {
    case smGeodesic: throw new NotPorted('shift_object: smGeodesic');
    case smLie: throw new NotPorted('shift_object: smLie');
    case smProduct: throw new NotPorted('shift_object: smProduct');
    case smIsotropic: {
      return tmul(Position, rgpushxto0(direct_exp(direction)));
    }
    case smEmbedded: throw new NotPorted('shift_object: smEmbedded');
    default: throw new hr_exception('unknown shift method in shift_object');
  }
}

/** apply_shift_object(transmatrix& Position, ...): returns the new Position */
export function apply_shift_object(Position: transmatrix, orientation: transmatrix, direction: hyperpoint, sm = shift_method(smaObject)): transmatrix {
  return shift_object(Position, orientation, direction, sm);
}

/** rotate_object(transmatrix& Position, transmatrix& orientation, transmatrix R): changes Position in place
 *  (the 2D case; orientation changes only in product geometries) */
export function rotate_object(Position: transmatrix, _orientation: transmatrix, R: transmatrix): void {
  if (gproduct()) throw new NotPorted('rotate_object: product');
  const P = tmul(Position, R);
  for (let i = 0; i < 4; i++) Position[i] = P[i];
}

/** spin_towards(Position, transmatrix& ori, goal, dir, back) (ori changes only in product geometries) */
export function spin_towards(Position: transmatrix, _ori: transmatrix, goal: hyperpoint, dir: number, back: number): transmatrix {
  let T: transmatrix;
  if (nonisotropic()) throw new NotPorted('spin_towards: nonisotropic');
  else {
    const U = tmulh(inverse(Position), goal);
    if (gproduct()) throw new NotPorted('spin_towards: product');
    T = rspintox(U);
  }
  if (back < 0) T = tmul(T, spin180());
  if (dir) T = tmul(T, cspin(dir, 0, -deg(90)));
  T = tmul(Position, T);
  return T;
}

export function ortho_error(T: transmatrix): number {

  let err = 0;

  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) {
    let s = 0;
    for (let z = 0; z < 3; z++) s += T[z][x] * T[z][y];

    s -= (x === y ? 1 : 0);
    err += s * s;
  }

  return err;
}

export function transpose(T: transmatrix): transmatrix {
  const result = tnew();
  for (let i = 0; i < MXDIM(); i++)
    for (let j = 0; j < MXDIM(); j++)
      result[j][i] = T[i][j];
  return result;
}

export function cpush0(c: number, x: number): hyperpoint {
  const h = hcopy(Hypc);
  if (sl2()) throw new NotPorted('cpush0: slr::xyz_point');
  if (c === 2 && gproduct()) {
    h[2] = c_exp(x);
    return h;
  }
  h[LDIM()] = cos_auto(x);
  h[c] = sin_auto(x);
  return h;
}

export function xpush0(x: number): hyperpoint { return cpush0(0, x); }
export function ypush0(x: number): hyperpoint { return cpush0(1, x); }
export function zpush0(x: number): hyperpoint { return cpush0(2, x); }

/** T * C0, optimized */
export function tC0(T: transmatrix): hyperpoint {
  const z = hnew();
  const L = LDIM();
  for (let i = 0; i < MXDIM(); i++) z[i] = T[i][L];
  return z;
}

export function tC0_t(T: transmatrix): hyperpoint { return tC0(T); }

export function tC0_sm(T: shiftmatrix): shiftpoint {
  return { h: tC0(T.T), shift: T.shift };
}

/** tangent vector in the given direction */
export function ctangent(c: number, x: number): hyperpoint { return point3(c === 0 ? x : 0, c === 1 ? x : 0, c === 2 ? x : 0); }

/** tangent vector in direction X */
export function xtangent(x: number): hyperpoint { return ctangent(0, x); }

/** tangent vector in direction Z */
export function ztangent(z: number): hyperpoint { return ctangent(2, z); }

/** change the length of the targent vector */
export function tangent_length(dir: hyperpoint, length: number): hyperpoint {
  const r = hypot_d(GDIM(), dir);
  if (!r) return dir;
  return hmul(dir, length / r);
}

/** exponential function: follow the geodesic given by v */
export function direct_exp(v: hyperpoint): hyperpoint {
  if (nonisotropic()) throw new NotPorted('direct_exp: nonisotropic');
  if (gproduct()) throw new NotPorted('direct_exp: product');
  v = hcopy(v);
  const d = hypot_d(GDIM(), v);
  if (d > 0) for (let i = 0; i < GDIM(); i++) v[i] = v[i] * sin_auto(d) / d;
  v[LDIM()] = cos_auto(d);
  return v;
}

export const pfNO_INTERPOLATION = 1n; /**< in tables (sol/nih geometries), do not use interpolations */
export const pfNO_DISTANCE = 2n; /**< we just need the directions -- this makes it a bit faster in sol/nih geometries */
export const pfLOW_BS_ITER = 4n; /**< low iterations in binary search (nil geometry, sl2 not affected currently) */
export const pQUICK = pfNO_INTERPOLATION | pfLOW_BS_ITER;
export const pNORMAL = 0n;

/** inverse exponential function (see direct_exp) */
export function inverse_exp(h: shiftpoint, _prec = pNORMAL): hyperpoint {
  if (nonisotropic()) throw new NotPorted('inverse_exp: nonisotropic');
  if (gproduct()) throw new NotPorted('inverse_exp: product');
  const d = acos_auto_clamp(h.h[GDIM()]);
  const v = hcopy(Hypc);
  if (d && sin_auto(d)) for (let i = 0; i < GDIM(); i++) v[i] = h.h[i] * d / sin_auto(d);
  v[3] = 0;
  return v;
}

export function geo_dist(h1: hyperpoint, h2: hyperpoint, _prec = pNORMAL): number {
  if (!nonisotropic()) return hdist(h1, h2);
  throw new NotPorted('geo_dist: nonisotropic');
}

export function geo_dist_q(h1: hyperpoint, h2: hyperpoint, prec = pNORMAL): number {
  const d = geo_dist(h1, h2, prec);
  if (elliptic() && d > deg(90)) return M_PI - d;
  return d;
}

/** hyperpoint lp_iapply(const hyperpoint h) (added by D1, stage 2) */
export function lp_iapply(h: hyperpoint): hyperpoint {
  return G.nisot_local_perspective_used ? tmulh(inverse(G.current_display.local_perspective), h) : h;
}

/** hyperpoint lp_apply(const hyperpoint h) (added by D1, stage 2) */
export function lp_apply(h: hyperpoint): hyperpoint {
  return G.nisot_local_perspective_used ? tmulh(G.current_display.local_perspective, h) : h;
}

export function smalltangent(): hyperpoint { return xtangent(.1); }

/** cyclefix(ld& a, ld b): returns the new a */
export function cyclefix(a: number, b: number): number {
  while (a > b + M_PI) a -= TAU;
  while (a < b - M_PI) a += TAU;
  return a;
}

export function raddif(a: number, b: number): number {
  let d = a - b;
  if (d < 0) d = -d;
  if (d > TAU) d -= TAU;
  if (d > M_PI) d = TAU - d;
  return d;
}

// bucket_scale: G

/** using buckethash_t = uint64_t: a bigint here */
export type buckethash_t = bigint;
const U64 = (1n << 64n) - 1n;

export function hashmix(seed: buckethash_t, i: buckethash_t): buckethash_t {
  // seed ^= i + 0x9e3779b9 + (seed << 6) + (seed >> 2);
  return (seed ^ ((i + 0x9e3779b9n + ((seed << 6n) & U64) + (seed >> 2n)) & U64)) & U64;
}
export function hashmix_to(seed: buckethash_t, i: buckethash_t): buckethash_t { return hashmix(seed, i); }

/** bucketer(ld x): (buckethash_t) (long long) floor(x * bucket_scale + .5) */
export function bucketer(x: number): buckethash_t {
  return BigInt.asUintN(64, BigInt(Math.floor(x * G.bucket_scale + .5)));
}

/** bucketer(hyperpoint h) */
export function bucketer_h(h: hyperpoint): buckethash_t {
  let seed = 0n;
  if (gproduct()) throw new NotPorted('bucketer: product');
  if (elliptic()) {
    // make_tuple(h[0], h[1], h[2], h[3]) < make_tuple(-h[0], -h[1], -h[2], -h[3])
    let less = false;
    for (let k = 0; k < 4; k++) {
      if (h[k] < -h[k]) { less = true; break; }
      if (-h[k] < h[k]) break;
    }
    if (less) h = hneg(h);
  }
  // With one pass, e.g., (-149,9999,10000) vs (-298,19998,10000) is a hash collision,
  // and that may happen during the rotation of a hex grid. So make two passes
  for (let a = 0; a < 2; a++) {
    seed = hashmix(seed, bucketer(h[0]));
    seed = hashmix(seed, bucketer(h[1]));
    seed = hashmix(seed, bucketer(h[2]));
    if (MDIM() === 4) seed = hashmix(seed, bucketer(h[3]));
  }
  return seed;
}

/** project the origin to the triangle [h1,h2,h3] */
export function project_on_triangle(h1: hyperpoint, h2: hyperpoint, h3: hyperpoint): hyperpoint {
  h1 = hdiv(h1, h1[3]);
  h2 = hdiv(h2, h2[3]);
  h3 = hdiv(h3, h3[3]);
  const T = tnew();
  T[0] = h1; T[1] = h2; T[2] = h3;
  T[3] = hcopy(C0());
  const det_orig = det3(T);
  const orthogonal = hcross(hsub(h2, h1), hsub(h3, h1));
  T[0] = orthogonal; T[1] = hsub(h2, h1); T[2] = hsub(h3, h1);
  const det_orth = det3(T);
  const result = hmul(orthogonal, det_orig / det_orth);
  result[3] = 1;
  return normalize(result);
}

export function lerp(a0: hyperpoint, a1: hyperpoint, x: number): hyperpoint {
  return hadd(a0, hmul(hsub(a1, a0), x));
}

export function linecross(a: hyperpoint, b: hyperpoint, c: hyperpoint, d: hyperpoint): hyperpoint {
  const L = LDIM();
  a = hdiv(a, a[L]);
  b = hdiv(b, b[L]);
  c = hdiv(c, c[L]);
  d = hdiv(d, d[L]);

  const bax = b[0] - a[0];
  const dcx = d[0] - c[0];
  const cax = c[0] - a[0];
  const bay = b[1] - a[1];
  const dcy = d[1] - c[1];
  const cay = c[1] - a[1];

  const res = hnew();
  res[0] = (cay * dcx * bax + a[0] * bay * dcx - c[0] * dcy * bax) / (bay * dcx - dcy * bax);
  res[1] = (cax * dcy * bay + a[1] * bax * dcy - c[1] * dcx * bay) / (bax * dcy - dcx * bay);
  res[2] = 0;
  res[3] = 0;
  res[GDIM()] = 1;
  return normalize(res);
}

export function inner2(h1: hyperpoint, h2: hyperpoint): number {
  const L = LDIM();
  return hyperbolic() ? h1[L] * h2[L] - h1[0] * h2[0] - h1[1] * h2[1] :
    sphere() ? h1[L] * h2[L] + h1[0] * h2[0] + h1[1] * h2[1] :
      h1[0] * h2[0] + h1[1] * h2[1];
}

export function circumscribe(a: hyperpoint, b: hyperpoint, c: hyperpoint): hyperpoint {
  let h = hcopy(C0());

  b = hsub(b, a);
  c = hsub(c, a);

  if (euclid()) {
    const b2 = inner2(b, b) / 2;
    const c2 = inner2(c, c) / 2;

    const det_ = c[1] * b[0] - b[1] * c[0];

    h = hcopy(a);

    h[1] += (c2 * b[0] - b2 * c[0]) / det_;
    h[0] += (c2 * b[1] - b2 * c[1]) / -det_;

    return h;
  }

  if (inner2(b, b) < 0) {
    b = hdiv(b, Math.sqrt(-inner2(b, b)));
    c = hadd(c, hmul(b, inner2(c, b)));
    h = hadd(h, hmul(b, inner2(h, b)));
  }
  else {
    b = hdiv(b, Math.sqrt(inner2(b, b)));
    c = hsub(c, hmul(b, inner2(c, b)));
    h = hsub(h, hmul(b, inner2(h, b)));
  }

  if (inner2(c, c) < 0) {
    c = hdiv(c, Math.sqrt(-inner2(c, c)));
    h = hadd(h, hmul(c, inner2(h, c)));
  }
  else {
    c = hdiv(c, Math.sqrt(inner2(c, c)));
    h = hsub(h, hmul(c, inner2(h, c)));
  }

  const L = LDIM();
  if (h[L] < 0) { h[0] = -h[0]; h[1] = -h[1]; h[L] = -h[L]; }

  const i = inner2(h, h);
  if (i > 0) h = hdiv(h, Math.sqrt(i));
  else h = hdiv(h, -Math.sqrt(-i));

  return h;
}

export function inner3(h1: hyperpoint, h2: hyperpoint): number {
  const L = LDIM();
  return hyperbolic() ? h1[L] * h2[L] - h1[0] * h2[0] - h1[1] * h2[1] - h1[2] * h2[2] :
    sphere() ? h1[L] * h2[L] + h1[0] * h2[0] + h1[1] * h2[1] + h1[2] * h2[2] :
      h1[0] * h2[0] + h1[1] * h2[1];
}

/** circumscribe for H3 and S3 (not for E3 yet!) */
export function circumscribe4(a: hyperpoint, b: hyperpoint, c: hyperpoint, d: hyperpoint): hyperpoint {

  const ds = [hsub(b, a), hsub(c, a), hsub(d, a), hcopy(C0())];

  for (let i = 0; i < 3; i++) {

    if (inner3(ds[i], ds[i]) < 0) {
      ds[i] = hdiv(ds[i], Math.sqrt(-inner3(ds[i], ds[i])));
      for (let j = i + 1; j < 4; j++)
        ds[j] = hadd(ds[j], hmul(ds[i], inner3(ds[i], ds[j])));
    }
    else {
      ds[i] = hdiv(ds[i], Math.sqrt(inner3(ds[i], ds[i])));
      for (let j = i + 1; j < 4; j++)
        ds[j] = hsub(ds[j], hmul(ds[i], inner3(ds[i], ds[j])));
    }
  }

  let h = ds[3];

  if (h[3] < 0) h = hneg(h);

  const i = inner3(h, h);
  if (i > 0) h = hdiv(h, Math.sqrt(i));
  else h = hdiv(h, -Math.sqrt(-i));

  return h;
}

/** the point in distance dist from 'material' to 'dir' (usually an (ultra)ideal point) */
export function towards_inf(material_: hyperpoint, dir: hyperpoint, dist = 1): hyperpoint {
  const T = gpushxto0(material_);
  const id = tmulh(T, dir);
  return tmulh(tmul(rgpushxto0(material_), rspintox(id)), xpush0(dist));
}

export function clockwise(h1: hyperpoint, h2: hyperpoint): boolean {
  return h1[0] * h2[1] > h1[1] * h2[0];
}

/** compute the area of a shape -- v.back() must equal v[0] */
export function compute_area(v: hyperpoint[]): number {
  let area = 0;
  for (let i = 0; i < v.length - 1; i++) {
    const h1 = v[i];
    const h2 = v[i + 1];
    if (euclid())
      area += (h2[1] + h1[1]) * (h2[0] - h1[0]) / 2;
    else {
      const rh2 = tmulh(gpushxto0(h1), h2);
      const rh1 = tmulh(gpushxto0(h2), h1);
      const b1 = c_atan2(rh1[1], rh1[0]);
      const b2 = c_atan2(rh2[1], rh2[0]);
      let x = b2 - b1 + M_PI;
      x = cyclefix(x, 0);
      area += x;
    }
  }
  return area;
}

// --- hypgraph.cpp (stage 1: what the rules use of the shifts; the shift is always 0 there) ---

/** change_shift: only sl2 and band models (later stages) change the coordinates; else the shift is set */
function change_shift_by(by: number): void {
  if (!by) return;
  if (sl2()) throw new NotPorted('change_shift: sl2');
  // (mdinf[pmodel].flags & mf::uses_bandshift) || (sphere && pmodel == mdSpiral): the disk model has neither
}

/** unshift(shiftpoint T, ld to = 0) */
export function unshift(T: shiftpoint, to = 0): hyperpoint {
  change_shift_by(to - T.shift);
  return T.h;
}

/** unshift(shiftmatrix T, ld to = 0) */
export function unshift_sm(T: shiftmatrix, to = 0): transmatrix {
  change_shift_by(to - T.shift);
  return T.T;
}

/** inverse_shift(const shiftmatrix& T1, const shiftmatrix& T2) */
export function inverse_shift(T1: shiftmatrix, T2: shiftmatrix): transmatrix {
  return tmul(iso_inverse(T1.T), unshift_sm(T2, T1.shift));
}

/** inverse_shift(const shiftmatrix& T1, const shiftpoint& T2) */
export function inverse_shift_sp(T1: shiftmatrix, T2: shiftpoint): hyperpoint {
  return tmulh(iso_inverse(T1.T), unshift(T2, T1.shift));
}

/** atan2(hyperpoint h) (hypgraph.cpp) */
export function atan2_h(h: hyperpoint): number {
  return c_atan2(h[1], h[0]);
}

