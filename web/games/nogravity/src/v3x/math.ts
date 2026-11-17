// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the V3X maths (rlx32/include/v3xmaths.h, v3xtrig.h,
// src/v3x_3.c). Vectors and matrices are Float32Arrays, as the original keeps them in floats:
// a V3XVECTOR is 3 floats, a V3XMATRIX 16 (rows I = 0..2, J = 3..5, K = 6..8, Pos = 9..11).
// Sub-vectors are views (subarray), so they behave like the original's pointers into a matrix.

export type Vec = Float32Array;
export type Mtx = Float32Array;

export const vec = (x = 0, y = 0, z = 0): Vec => Float32Array.of(x, y, z);
export const mtx = (): Mtx => new Float32Array(16);
export const CST_EPSILON = 1e-5; // v3xfloat.h
export const CST_MAX = 3.4e38;

export const I = (m: Mtx): Vec => m.subarray(0, 3);
export const J = (m: Mtx): Vec => m.subarray(3, 6);
export const K = (m: Mtx): Vec => m.subarray(6, 9);
export const Pos = (m: Mtx): Vec => m.subarray(9, 12);

const f = Math.fround;

/** TRG_Generate (v3x_2.c): cos table of 4096 floats */
export const TRG = new Float32Array(4096);
for (let i = 0; i < 4096; i++) {
  const a = f(f(f(Math.PI) * i) / 2048);
  TRG[i] = Math.cos(a);
}
/** cos16 / sin16: angles in 1/4096 turns */
export const cos16 = (x: number): number => TRG[(x | 0) & 4095];
export const sin16 = (x: number): number => TRG[((x | 0) - 1024) & 4095];

export function set(p: Vec, x: number, y: number, z: number): void { p[0] = x; p[1] = y; p[2] = z; }
export function cpy(r: Vec, b: Vec): void { r[0] = b[0]; r[1] = b[1]; r[2] = b[2]; }
export const dot = (a: Vec, b: Vec): number => f(f(f(a[0] * b[0]) + f(a[1] * b[1])) + f(a[2] * b[2]));
export const lengthSq = (a: Vec): number => dot(a, a);
export const length = (a: Vec): number => f(Math.sqrt(lengthSq(a)));
export function cross(r: Vec, a: Vec, b: Vec): void {
  const x = f(a[1] * b[2]) - f(a[2] * b[1]), y = f(a[2] * b[0]) - f(a[0] * b[2]), z = f(a[0] * b[1]) - f(a[1] * b[0]);
  r[0] = x; r[1] = y; r[2] = z;
}
export function neg(r: Vec): void { r[0] = -r[0]; r[1] = -r[1]; r[2] = -r[2]; }
export function sum(r: Vec, a: Vec, b: Vec): void { r[0] = a[0] + b[0]; r[1] = a[1] + b[1]; r[2] = a[2] + b[2]; }
export function dif(r: Vec, a: Vec, b: Vec): void { r[0] = a[0] - b[0]; r[1] = a[1] - b[1]; r[2] = a[2] - b[2]; }
export function inc(r: Vec, a: Vec): void { r[0] += a[0]; r[1] += a[1]; r[2] += a[2]; }
export function dec(r: Vec, a: Vec): void { r[0] -= a[0]; r[1] -= a[1]; r[2] -= a[2]; }
export function avg(r: Vec, a: Vec, b: Vec): void { r[0] = (a[0] + b[0]) / 2; r[1] = (a[1] + b[1]) / 2; r[2] = (a[2] + b[2]) / 2; }
export function scl(r: Vec, a: Vec, k: number): void { r[0] = a[0] * k; r[1] = a[1] * k; r[2] = a[2] * k; }
/** r = a*k + b */
export function madd(r: Vec, a: Vec, b: Vec, k: number): void {
  const x = f(a[0] * k) + b[0], y = f(a[1] * k) + b[1], z = f(a[2] * k) + b[2];
  r[0] = x; r[1] = y; r[2] = z;
}
export function polarSet(a: Vec, b: Vec, r: number, al: number, bl: number): void {
  a[0] = b[0] + f(f(sin16(al) * cos16(bl)) * r);
  a[1] = b[1] + f(f(cos16(al) * cos16(bl)) * r);
  a[2] = b[2] + f(sin16(bl) * r);
}
export function slerp(r: Vec, a: Vec, b: Vec, k: number): void {
  r[0] = a[0] - f(f(a[0] - b[0]) * k);
  r[1] = a[1] - f(f(a[1] - b[1]) * k);
  r[2] = a[2] - f(f(a[2] - b[2]) * k);
}
export function projectOnVector(r: Vec, V: Vec, N: Vec): void { madd(r, N, V, -dot(V, N)); }
export function distanceSq(a: Vec, b: Vec): number { const t = vec(); dif(t, a, b); return lengthSq(t); }
export function distance(a: Vec, b: Vec): number { const t = vec(); dif(t, a, b); return length(t); }
/** V3XVector_Normalize: returns the length */
export function normalize(a: Vec, b: Vec): number {
  const N = lengthSq(b);
  if (N < CST_EPSILON) {
    if (!b[0] && !b[1]) set(a, 0, 0, 1);
    else if (!b[0] && !b[2]) set(a, 0, 1, 0);
    else set(a, 1, 0, 0);
    return 1;
  }
  const n = f(1 / f(Math.sqrt(N))); // rsqrtf: 1.f / (float)sqrt((double)x)
  scl(a, b, n);
  return f(N * n);
}

// ---- matrices (3x3 part row-major in 0..8, position 9..11)
export function setScale(M: Mtx, s: number): void {
  M[0] = s; M[1] = 0; M[2] = 0; M[3] = 0; M[4] = s; M[5] = 0; M[6] = 0; M[7] = 0; M[8] = s;
}
export const setIdentity = (M: Mtx): void => setScale(M, 1);
export function transpose(R: Mtx, A: Mtx): void {
  const a0 = A[0], a1 = A[1], a2 = A[2], a3 = A[3], a4 = A[4], a5 = A[5], a6 = A[6], a7 = A[7], a8 = A[8];
  R[0] = a0; R[3] = a1; R[6] = a2; R[1] = a3; R[4] = a4; R[7] = a5; R[2] = a6; R[5] = a7; R[8] = a8;
}
/** R = A * B (3x3), V3XMatrix_Multiply3x3 */
export function multiply3x3(R: Mtx, A: Mtx, B: Mtx): void {
  const t = new Float32Array(9);
  for (let c = 0; c < 3; c++) {
    t[c] = f(f(A[0] * B[c]) + f(A[1] * B[c + 3])) + f(A[2] * B[c + 6]);
    t[c + 3] = f(f(A[3] * B[c]) + f(A[4] * B[c + 3])) + f(A[5] * B[c + 6]);
    t[c + 6] = f(f(A[6] * B[c]) + f(A[7] * B[c + 3])) + f(A[8] * B[c + 6]);
  }
  R.set(t);
}
/** V3XMatrix_Multiply3x4(R, A, B): R = A*B, R.Pos = A*B.Pos + A.Pos */
export function multiply3x4(R: Mtx, A: Mtx, B: Mtx): void {
  const p = vec();
  applyMatrixTrans(p, Pos(B), A);
  multiply3x3(R, A, B);
  R[9] = p[0]; R[10] = p[1]; R[11] = p[2];
}
/** R = M * A */
export function applyMatrix(R: Vec, A: Vec, M: Mtx): void {
  const x = f(f(M[0] * A[0]) + f(M[1] * A[1])) + f(M[2] * A[2]);
  const y = f(f(M[3] * A[0]) + f(M[4] * A[1])) + f(M[5] * A[2]);
  const z = f(f(M[6] * A[0]) + f(M[7] * A[1])) + f(M[8] * A[2]);
  R[0] = x; R[1] = y; R[2] = z;
}
export function applyMatrixTrans(R: Vec, A: Vec, M: Mtx): void {
  const x = f(f(f(M[0] * A[0]) + f(M[1] * A[1])) + f(M[2] * A[2])) + M[9];
  const y = f(f(f(M[3] * A[0]) + f(M[4] * A[1])) + f(M[5] * A[2])) + M[10];
  const z = f(f(f(M[6] * A[0]) + f(M[7] * A[1])) + f(M[8] * A[2])) + M[11];
  R[0] = x; R[1] = y; R[2] = z;
}
/** R = transpose(M) * A */
export function applyTransposeMatrix(R: Vec, A: Vec, M: Mtx): void {
  const x = f(f(M[0] * A[0]) + f(M[3] * A[1])) + f(M[6] * A[2]);
  const y = f(f(M[1] * A[0]) + f(M[4] * A[1])) + f(M[7] * A[2]);
  const z = f(f(M[2] * A[0]) + f(M[5] * A[1])) + f(M[8] * A[2]);
  R[0] = x; R[1] = y; R[2] = z;
}
/** V3XMatrix_Rot_XYZ */
export function rotXYZ(M: Mtx, rot: Vec): void {
  const cx = cos16(rot[1]), cy = cos16(rot[2]), cz = cos16(rot[0]);
  const sx = sin16(rot[1]), sy = sin16(rot[2]), sz = sin16(rot[0]);
  M[0] = cy * cx; M[1] = cy * sx; M[2] = -sy;
  M[3] = f(sz * f(sy * cx)) - f(cz * sx); M[4] = f(sx * f(sy * sz)) + f(cz * cx); M[5] = cy * sz;
  M[6] = f(cz * f(sy * cx)) + f(sz * sx); M[7] = f(cz * f(sy * sx)) - f(sz * cx); M[8] = cy * cz;
}
export function rotX(M: Mtx, a: number): void {
  const c = cos16(a), s = sin16(a);
  M[0] = 1; M[1] = 0; M[2] = 0; M[3] = 0; M[4] = c; M[5] = -s; M[6] = 0; M[7] = s; M[8] = c;
}
export function rotY(M: Mtx, a: number): void {
  const c = cos16(a), s = sin16(a);
  M[0] = c; M[1] = 0; M[2] = s; M[3] = 0; M[4] = 1; M[5] = 0; M[6] = -s; M[7] = 0; M[8] = c;
}
export function rotZ(M: Mtx, a: number): void {
  const c = cos16(a), s = sin16(a);
  M[0] = c; M[1] = -s; M[2] = 0; M[3] = s; M[4] = c; M[5] = 0; M[6] = 0; M[7] = 0; M[8] = 1;
}

// v3x_3.c rotations: rows (global) and columns (local)
function rowRot(a: number, M: Mtx, p: number, q: number): void {
  const s = sin16(a), c = cos16(a);
  for (let k = 0; k < 3; k++) {
    const u = M[p + k], v = M[q + k];
    M[p + k] = f(c * u) - f(s * v);
    M[q + k] = f(s * u) + f(c * v);
  }
}
function colRot(a: number, M: Mtx, p: number, q: number): void {
  const s = sin16(a), c = cos16(a);
  for (let k = 0; k < 9; k += 3) {
    const u = M[p + k], v = M[q + k];
    M[p + k] = f(c * u) - f(s * v);
    M[q + k] = f(s * u) + f(c * v);
  }
}
export const rotateX = (t: number, M: Mtx): void => rowRot(t, M, 3, 6);
export const rotateY = (t: number, M: Mtx): void => rowRot(t, M, 0, 6);
export const rotateZ = (t: number, M: Mtx): void => rowRot(t, M, 0, 3);
export const rotateXLocal = (t: number, M: Mtx): void => colRot(t, M, 1, 2);
export const rotateYLocal = (t: number, M: Mtx): void => colRot(t, M, 0, 2);
export const rotateZLocal = (t: number, M: Mtx): void => colRot(t, M, 0, 1);

/** V3XMatrix_BuildFromVector / BuildFromNVector (identical but for the epsilon test's form) */
export function buildFromVector(M0: Mtx, v: Vec, roll: number): void {
  const k = K(M0), j = J(M0);
  normalize(k, v);
  const src = vec(0, 0, 1);
  projectOnVector(j, src, k);
  if (lengthSq(j) < CST_EPSILON) set(j, 0, 1, 0); else normalize(j, j);
  cross(I(M0), j, k);
  if (roll) rotateZ(roll | 0, M0);
}
export function buildFromNVector(M0: Mtx, v: Vec, roll: number): void {
  const k = K(M0), j = J(M0);
  normalize(k, v);
  const src = vec(0, 0, 1);
  projectOnVector(j, src, k);
  if (lengthSq(j) > CST_EPSILON) normalize(j, j); else set(j, 0, 1, 0);
  cross(I(M0), j, k);
  if (roll) rotateZ(roll | 0, M0);
}
export function buildFromVectorUP(M0: Mtx, v: Vec, source: Vec): void {
  normalize(K(M0), v);
  projectOnVector(J(M0), source, K(M0));
  normalize(J(M0), J(M0));
  cross(I(M0), J(M0), K(M0));
}
/** V3XVector_ProjectPointLine */
export function projectPointLine(res: Vec, u: Vec, e0: Vec, e1: Vec): number {
  const v = vec(), w = vec();
  dif(v, u, e0); dif(w, e1, e0);
  const wl = normalize(w, w);
  const vl = normalize(v, v);
  if (wl > CST_EPSILON) {
    if (vl > CST_EPSILON) {
      let cosa = dot(w, v);
      if (Math.abs(cosa) <= 1) {
        const sina = f(Math.sqrt(1 - cosa * cosa));
        cosa = f(cosa * vl);
        madd(res, v, e0, cosa);
        return f(vl * sina);
      }
      cpy(res, u);
      return 0;
    }
    cpy(res, e0);
    return vl;
  }
  return 0;
}
export function intersectSphereSegment(radius: number, center: Vec, a: Vec, b: Vec): boolean {
  const res = vec();
  return projectPointLine(res, center, a, b) <= radius;
}
