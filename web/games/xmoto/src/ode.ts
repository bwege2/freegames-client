// The part of the Open Dynamics Engine (ODE 0.13-era, as vendored by X-Moto 0.6.3 in vendor/ode, built
// with dDOUBLE) that X-Moto's bike uses: bodies with finite rotation, hinge joints with stops, contact
// joints, the island builder and the QuickStep (SOR-LCP) stepper. Translated line by line from
// vendor/ode/src/{ode,util,quickstep,mass,matrix,rotation,odemath,misc}.cpp and joints/{joint,hinge,
// contact}.cpp, keeping the order of every floating-point operation (re/xmoto/NOTES.md).
//
// ODE: Copyright (C) 2001-2003 Russell L. Smith, LGPL-2.1-or-later or BSD-3-Clause (web/games/xmoto/LICENSE.md).

import { xsin, xcos, xatan2 } from './xmath.ts';

export const dInfinity = Infinity;
const M_PI = Math.PI;
const M_SQRT1_2 = Math.SQRT1_2;

// misc.cpp: the global random seed, shared by every world of the process
let seed = 0;
export function dRandSetSeed(s: number): void { seed = s >>> 0; }
export function dRandGetSeed(): number { return seed; }
function dRand(): number {
  // (1664525*seed + 1013904223) & 0xffffffff, exact in 32-bit arithmetic
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  return seed;
}
export function dRandInt(n: number): number {
  const un = n >>> 0;
  let r = dRand();
  if (un <= 0x10) {
    r = (r ^ (r >>> 16)) >>> 0;
    r = (r ^ (r >>> 8)) >>> 0;
    r = (r ^ (r >>> 4)) >>> 0;
    if (un <= 0x2) {
      r = (r ^ (r >>> 2)) >>> 0;
      r = (r ^ (r >>> 1)) >>> 0;
    } else if (un <= 0x4) {
      r = (r ^ (r >>> 2)) >>> 0;
    }
  } else if (un <= 0x100) {
    r = (r ^ (r >>> 16)) >>> 0;
    r = (r ^ (r >>> 8)) >>> 0;
  } else if (un <= 0x10000) {
    r = (r ^ (r >>> 16)) >>> 0;
  }
  return r % un;
}

// ---------------------------------------------------------------------------------------------
// odemath / rotation helpers (vectors are arrays with an offset; matrices are 3x4 row-major)

type V = Float64Array;

function dot3(a: V, ao: number, b: V, bo: number): number {
  return a[ao] * b[bo] + a[ao + 1] * b[bo + 1] + a[ao + 2] * b[bo + 2];
}
function dot3_41(a: V, ao: number, b: V, bo: number): number {
  return a[ao] * b[bo] + a[ao + 4] * b[bo + 1] + a[ao + 8] * b[bo + 2];
}
function dot3_44(a: V, ao: number, b: V, bo: number): number {
  return a[ao] * b[bo] + a[ao + 4] * b[bo + 4] + a[ao + 8] * b[bo + 8];
}
function cross3(res: V, ro: number, a: V, ao: number, b: V, bo: number): void {
  const r0 = a[ao + 1] * b[bo + 2] - a[ao + 2] * b[bo + 1];
  const r1 = a[ao + 2] * b[bo] - a[ao] * b[bo + 2];
  const r2 = a[ao] * b[bo + 1] - a[ao + 1] * b[bo];
  res[ro] = r0; res[ro + 1] = r1; res[ro + 2] = r2;
}
/** dMultiply0_331: res = A*b */
function mul0_331(res: V, ro: number, a: V, ao: number, b: V, bo: number): void {
  const r0 = dot3(a, ao, b, bo);
  const r1 = dot3(a, ao + 4, b, bo);
  const r2 = dot3(a, ao + 8, b, bo);
  res[ro] = r0; res[ro + 1] = r1; res[ro + 2] = r2;
}
/** dMultiply1_331: res = A'*b */
function mul1_331(res: V, ro: number, a: V, ao: number, b: V, bo: number): void {
  const r0 = dot3_41(a, ao, b, bo);
  const r1 = dot3_41(a, ao + 1, b, bo);
  const r2 = dot3_41(a, ao + 2, b, bo);
  res[ro] = r0; res[ro + 1] = r1; res[ro + 2] = r2;
}
/** dMultiplyHelper0_133 = dMultiplyHelper1_331(res, b, a) */
function helper0_133(res: V, ro: number, a: V, ao: number, b: V, bo: number): void {
  const r0 = dot3_41(b, bo, a, ao);
  const r1 = dot3_41(b, bo + 1, a, ao);
  const r2 = dot3_41(b, bo + 2, a, ao);
  res[ro] = r0; res[ro + 1] = r1; res[ro + 2] = r2;
}
/** dMultiply0_333: res = A*B */
function mul0_333(res: V, a: V, b: V): void {
  helper0_133(res, 0, a, 0, b, 0);
  helper0_133(res, 4, a, 4, b, 0);
  helper0_133(res, 8, a, 8, b, 0);
}
/** dMultiply2_333: res = A*B' */
function mul2_333(res: V, a: V, b: V): void {
  mul0_331(res, 0, b, 0, a, 0);
  mul0_331(res, 4, b, 0, a, 4);
  mul0_331(res, 8, b, 0, a, 8);
}
void dot3_44;

function dPlaneSpace(n: V, no: number, p: V, po: number, q: V, qo: number): void {
  if (Math.abs(n[no + 2]) > M_SQRT1_2) {
    const a = n[no + 1] * n[no + 1] + n[no + 2] * n[no + 2];
    const k = 1.0 / Math.sqrt(a);
    p[po] = 0;
    p[po + 1] = (-n[no + 2]) * k;
    p[po + 2] = n[no + 1] * k;
    q[qo] = a * k;
    q[qo + 1] = (-n[no]) * p[po + 2];
    q[qo + 2] = n[no] * p[po + 1];
  } else {
    const a = n[no] * n[no] + n[no + 1] * n[no + 1];
    const k = 1.0 / Math.sqrt(a);
    p[po] = (-n[no + 1]) * k;
    p[po + 1] = n[no] * k;
    p[po + 2] = 0;
    q[qo] = (-n[no + 2]) * p[po + 1];
    q[qo + 1] = n[no + 2] * p[po];
    q[qo + 2] = a * k;
  }
}

/** _dSafeNormalize3 (via dNormalize3) */
function dNormalize3(a: V): void {
  const aa0 = Math.abs(a[0]), aa1 = Math.abs(a[1]), aa2 = Math.abs(a[2]);
  let idx: number;
  if (aa1 > aa0) {
    idx = aa2 > aa1 ? 2 : 1;
  } else if (aa2 > aa0) {
    idx = 2;
  } else {
    if (aa0 <= 0) { a[0] = 1; a[1] = 0; a[2] = 0; return; }
    idx = 0;
  }
  const d = idx === 0 ? aa0 : idx === 1 ? aa1 : aa2;
  a[0] /= d; a[1] /= d; a[2] /= d;
  const l = 1.0 / Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  a[0] *= l; a[1] *= l; a[2] *= l;
}
function dNormalize4(a: V): void {
  let l = dot3(a, 0, a, 0) + a[3] * a[3];
  if (l > 0) {
    l = 1.0 / Math.sqrt(l);
    a[0] *= l; a[1] *= l; a[2] *= l; a[3] *= l;
  } else {
    a[0] = 1; a[1] = 0; a[2] = 0; a[3] = 0;
  }
}
function dQMultiply0(qa: V, qb: V, qc: V): void {
  const a0 = qb[0] * qc[0] - qb[1] * qc[1] - qb[2] * qc[2] - qb[3] * qc[3];
  const a1 = qb[0] * qc[1] + qb[1] * qc[0] + qb[2] * qc[3] - qb[3] * qc[2];
  const a2 = qb[0] * qc[2] + qb[2] * qc[0] + qb[3] * qc[1] - qb[1] * qc[3];
  const a3 = qb[0] * qc[3] + qb[3] * qc[0] + qb[1] * qc[2] - qb[2] * qc[1];
  qa[0] = a0; qa[1] = a1; qa[2] = a2; qa[3] = a3;
}
function dQMultiply1(qa: V, qb: V, qc: V): void {
  const a0 = qb[0] * qc[0] + qb[1] * qc[1] + qb[2] * qc[2] + qb[3] * qc[3];
  const a1 = qb[0] * qc[1] - qb[1] * qc[0] - qb[2] * qc[3] + qb[3] * qc[2];
  const a2 = qb[0] * qc[2] - qb[2] * qc[0] - qb[3] * qc[1] + qb[1] * qc[3];
  const a3 = qb[0] * qc[3] - qb[3] * qc[0] - qb[1] * qc[2] + qb[2] * qc[1];
  qa[0] = a0; qa[1] = a1; qa[2] = a2; qa[3] = a3;
}
function dQMultiply2(qa: V, qb: V, qc: V): void {
  const a0 = qb[0] * qc[0] + qb[1] * qc[1] + qb[2] * qc[2] + qb[3] * qc[3];
  const a1 = -qb[0] * qc[1] + qb[1] * qc[0] - qb[2] * qc[3] + qb[3] * qc[2];
  const a2 = -qb[0] * qc[2] + qb[2] * qc[0] - qb[3] * qc[1] + qb[1] * qc[3];
  const a3 = -qb[0] * qc[3] + qb[3] * qc[0] - qb[1] * qc[2] + qb[2] * qc[1];
  qa[0] = a0; qa[1] = a1; qa[2] = a2; qa[3] = a3;
}
function dQMultiply3(qa: V, qb: V, qc: V): void {
  const a0 = qb[0] * qc[0] - qb[1] * qc[1] - qb[2] * qc[2] - qb[3] * qc[3];
  const a1 = -qb[0] * qc[1] - qb[1] * qc[0] + qb[2] * qc[3] - qb[3] * qc[2];
  const a2 = -qb[0] * qc[2] - qb[2] * qc[0] + qb[3] * qc[1] - qb[1] * qc[3];
  const a3 = -qb[0] * qc[3] - qb[3] * qc[0] + qb[1] * qc[2] - qb[2] * qc[1];
  qa[0] = a0; qa[1] = a1; qa[2] = a2; qa[3] = a3;
}
/** dRfromQ */
function dQtoR(q: V, R: V): void {
  const qq1 = 2 * q[1] * q[1];
  const qq2 = 2 * q[2] * q[2];
  const qq3 = 2 * q[3] * q[3];
  R[0] = 1 - qq2 - qq3;
  R[1] = 2 * (q[1] * q[2] - q[0] * q[3]);
  R[2] = 2 * (q[1] * q[3] + q[0] * q[2]);
  R[3] = 0;
  R[4] = 2 * (q[1] * q[2] + q[0] * q[3]);
  R[5] = 1 - qq1 - qq3;
  R[6] = 2 * (q[2] * q[3] - q[0] * q[1]);
  R[7] = 0;
  R[8] = 2 * (q[1] * q[3] - q[0] * q[2]);
  R[9] = 2 * (q[2] * q[3] + q[0] * q[1]);
  R[10] = 1 - qq1 - qq2;
  R[11] = 0;
}
/** dDQfromW */
function dWtoDQ(w: V, q: V, dq: V): void {
  dq[0] = 0.5 * (-w[0] * q[1] - w[1] * q[2] - w[2] * q[3]);
  dq[1] = 0.5 * (w[0] * q[0] + w[1] * q[3] - w[2] * q[2]);
  dq[2] = 0.5 * (-w[0] * q[3] + w[1] * q[0] + w[2] * q[1]);
  dq[3] = 0.5 * (w[0] * q[2] - w[1] * q[1] + w[2] * q[0]);
}

// matrix.cpp: Cholesky inversion (dInvertPDMatrix), n = 3, nskip = 4
function invertPD3(A: V, Ainv: V): boolean {
  const n = 3, nskip = 4;
  const L = new Float64Array(12);
  L.set(A.subarray(0, 12));
  const recip = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const aa = i * nskip;
    let cc = aa;
    for (let j = 0; j < i; j++, cc++) {
      let sum = L[cc];
      const bb = j * nskip;
      for (let k = 0; k < j; k++) sum -= L[aa + k] * L[bb + k];
      L[cc] = sum * recip[j];
    }
    let sum = L[cc];
    for (let k = 0; k < i; k++) sum -= L[aa + k] * L[aa + k];
    if (sum <= 0.0) return false;
    const s = Math.sqrt(sum);
    L[cc] = s;
    recip[i] = 1.0 / s;
  }
  Ainv.fill(0);
  const X = new Float64Array(n);
  const y = new Float64Array(n);
  for (let col = 0; col < n; col++) {
    X.fill(0);
    X[col] = 1.0;
    // _dSolveCholesky(L, X)
    for (let i = 0; i < n; i++) {
      let sum = 0.0;
      for (let k = 0; k < i; k++) sum += L[i * nskip + k] * y[k];
      y[i] = (X[i] - sum) / L[i * nskip + i];
    }
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0.0;
      for (let k = i + 1; k < n; k++) sum += L[k * nskip + i] * X[k];
      X[i] = (y[i] - sum) / L[i * nskip + i];
    }
    for (let r = 0; r < n; r++) Ainv[r * nskip + col] = X[r];
  }
  return true;
}

// ---------------------------------------------------------------------------------------------
// objects

export interface Mass { mass: number; I: Float64Array }

export function dMassSetSphereTotal(total: number, radius: number): Mass {
  const I = new Float64Array(12);
  const II = 0.4 * total * radius * radius;
  I[0] = II; I[5] = II; I[10] = II;
  return { mass: total, I };
}
export function dMassSetBoxTotal(total: number, lx: number, ly: number, lz: number): Mass {
  const I = new Float64Array(12);
  I[0] = total / 12.0 * (ly * ly + lz * lz);
  I[5] = total / 12.0 * (lx * lx + lz * lz);
  I[10] = total / 12.0 * (lx * lx + ly * ly);
  return { mass: total, I };
}

const FLAG_FINITE_ROTATION = 1;
const FLAG_FINITE_ROTATION_AXIS = 2;
const FLAG_DISABLED = 4;
const FLAG_GYROSCOPIC = 0x400;

class JointNode {
  joint: Joint;
  body: Body | null = null; // the other body
  next: JointNode | null = null;
  constructor(j: Joint) { this.joint = j; }
}

export class Body {
  world: World;
  next: Body | null = null;
  prev: Body | null = null;
  tag = 0;
  flags = FLAG_GYROSCOPIC;
  firstjoint: JointNode | null = null;
  mass: Mass = { mass: 1, I: Float64Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0) };
  invI = Float64Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0);
  invMass = 1;
  pos = new Float64Array(4);
  q = Float64Array.of(1, 0, 0, 0);
  R = Float64Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0);
  lvel = new Float64Array(4);
  avel = new Float64Array(4);
  facc = new Float64Array(4);
  tacc = new Float64Array(4);
  finiteRotAxis = new Float64Array(4);
  constructor(w: World) {
    this.world = w;
  }
  setPosition(x: number, y: number, z: number): void { this.pos[0] = x; this.pos[1] = y; this.pos[2] = z; }
  setMass(m: Mass): void {
    this.mass = { mass: m.mass, I: Float64Array.from(m.I) };
    if (!invertPD3(this.mass.I, this.invI)) {
      this.invI.fill(0); this.invI[0] = 1; this.invI[5] = 1; this.invI[10] = 1;
    }
    this.invMass = 1.0 / this.mass.mass;
  }
  setFiniteRotationMode(mode: number): void {
    this.flags &= ~(FLAG_FINITE_ROTATION | FLAG_FINITE_ROTATION_AXIS);
    if (mode) {
      this.flags |= FLAG_FINITE_ROTATION;
      const a = this.finiteRotAxis;
      if (a[0] !== 0 || a[1] !== 0 || a[2] !== 0) this.flags |= FLAG_FINITE_ROTATION_AXIS;
    }
  }
  setFiniteRotationAxis(x: number, y: number, z: number): void {
    const a = this.finiteRotAxis;
    a[0] = x; a[1] = y; a[2] = z;
    if (x !== 0 || y !== 0 || z !== 0) {
      dNormalize3(a);
      this.flags |= FLAG_FINITE_ROTATION_AXIS;
    } else {
      this.flags &= ~FLAG_FINITE_ROTATION_AXIS;
    }
  }
  addForce(fx: number, fy: number, fz: number): void { this.facc[0] += fx; this.facc[1] += fy; this.facc[2] += fz; }
  addTorque(fx: number, fy: number, fz: number): void { this.tacc[0] += fx; this.tacc[1] += fy; this.tacc[2] += fz; }
  addForceAtPos(fx: number, fy: number, fz: number, px: number, py: number, pz: number): void {
    this.facc[0] += fx; this.facc[1] += fy; this.facc[2] += fz;
    const f = Float64Array.of(fx, fy, fz);
    const q = Float64Array.of(px - this.pos[0], py - this.pos[1], pz - this.pos[2]);
    const tmp = new Float64Array(3);
    cross3(tmp, 0, q, 0, f, 0);
    // dAddVectors3
    const r0 = this.tacc[0] + tmp[0], r1 = this.tacc[1] + tmp[1], r2 = this.tacc[2] + tmp[2];
    this.tacc[0] = r0; this.tacc[1] = r1; this.tacc[2] = r2;
  }
  enable(): void { this.flags &= ~FLAG_DISABLED; }
  disable(): void { this.flags |= FLAG_DISABLED; }
  isEnabled(): boolean { return (this.flags & FLAG_DISABLED) === 0; }
}

export interface Info2 {
  fps: number; erp: number; rowskip: number;
  J: Float64Array; row: number; // J1l = J + row*12, J1a = +3, J2l = +6, J2a = +9
  c: Float64Array; cfm: Float64Array; lo: Float64Array; hi: Float64Array; findex: Int32Array; ofs: number;
}

const JOINT_REVERSE = 2;

export abstract class Joint {
  world: World;
  next: Joint | null = null;
  prev: Joint | null = null;
  tag = 0;
  flags = 0;
  node: [JointNode, JointNode];
  constructor(w: World) {
    this.world = w;
    this.node = [new JointNode(this), new JointNode(this)];
    w.addJoint(this);
  }
  isEnabled(): boolean {
    return this.node[0].body!.invMass > 0 || (this.node[1].body !== null && this.node[1].body.invMass > 0);
  }
  abstract getInfo1(): number;
  abstract getInfo2(info: Info2): void;
  setRelativeValues(): void { /* per type */ }
  body0(): Body { return this.node[0].body!; }
  body1(): Body | null { return this.node[1].body; }
}

// joint.cpp helpers -----------------------------------------------------------------------------

function setBall(j: Joint, info: Info2, anchor1: V, anchor2: V): void {
  const J = info.J, r = info.row * 12, s = 12;
  const J1l = r, J1a = r + 3, J2l = r + 6, J2a = r + 9;
  J[J1l] = 1; J[J1l + s + 1] = 1; J[J1l + 2 * s + 2] = 1;
  const a1 = new Float64Array(3), a2 = new Float64Array(3);
  const b0 = j.body0(), b1 = j.body1();
  mul0_331(a1, 0, b0.R, 0, anchor1, 0);
  // dSetCrossMatrixMinus(J1a, a1, s)
  J[J1a + 1] = +a1[2]; J[J1a + 2] = -a1[1];
  J[J1a + s] = -a1[2]; J[J1a + s + 2] = +a1[0];
  J[J1a + 2 * s] = +a1[1]; J[J1a + 2 * s + 1] = -a1[0];
  if (b1) {
    J[J2l] = -1; J[J2l + s + 1] = -1; J[J2l + 2 * s + 2] = -1;
    mul0_331(a2, 0, b1.R, 0, anchor2, 0);
    // dSetCrossMatrixPlus(J2a, a2, s)
    J[J2a + 1] = -a2[2]; J[J2a + 2] = +a2[1];
    J[J2a + s] = +a2[2]; J[J2a + s + 2] = -a2[0];
    J[J2a + 2 * s] = -a2[1]; J[J2a + 2 * s + 1] = +a2[0];
  }
  const k = info.fps * info.erp;
  const c = info.c, o = info.ofs;
  if (b1) {
    for (let i = 0; i < 3; i++) c[o + i] = k * (a2[i] + b1.pos[i] - a1[i] - b0.pos[i]);
  } else {
    for (let i = 0; i < 3; i++) c[o + i] = k * (anchor2[i] - a1[i] - b0.pos[i]);
  }
}

function setAnchors(j: Joint, x: number, y: number, z: number, anchor1: V, anchor2: V): void {
  const b0 = j.node[0].body, b1 = j.node[1].body;
  if (b0) {
    const q = Float64Array.of(x - b0.pos[0], y - b0.pos[1], z - b0.pos[2], 0);
    mul1_331(anchor1, 0, b0.R, 0, q, 0);
    if (b1) {
      q[0] = x - b1.pos[0]; q[1] = y - b1.pos[1]; q[2] = z - b1.pos[2]; q[3] = 0;
      mul1_331(anchor2, 0, b1.R, 0, q, 0);
    } else {
      anchor2[0] = x; anchor2[1] = y; anchor2[2] = z;
    }
  }
  anchor1[3] = 0;
  anchor2[3] = 0;
}

function setAxes(j: Joint, x: number, y: number, z: number, axis1: V, axis2: V): void {
  const b0 = j.node[0].body, b1 = j.node[1].body;
  if (b0) {
    const q = Float64Array.of(x, y, z, 0);
    dNormalize3(q);
    mul1_331(axis1, 0, b0.R, 0, q, 0);
    axis1[3] = 0;
    if (b1) {
      mul1_331(axis2, 0, b1.R, 0, q, 0);
    } else {
      axis2[0] = x; axis2[1] = y; axis2[2] = z;
    }
    axis2[3] = 0;
  }
}

function getAnchor(j: Joint, result: V, anchor1: V): void {
  const b0 = j.node[0].body;
  if (b0) {
    mul0_331(result, 0, b0.R, 0, anchor1, 0);
    result[0] += b0.pos[0]; result[1] += b0.pos[1]; result[2] += b0.pos[2];
  }
}
function getAnchor2(j: Joint, result: V, anchor2: V): void {
  const b1 = j.node[1].body;
  if (b1) {
    mul0_331(result, 0, b1.R, 0, anchor2, 0);
    result[0] += b1.pos[0]; result[1] += b1.pos[1]; result[2] += b1.pos[2];
  } else {
    result[0] = anchor2[0]; result[1] = anchor2[1]; result[2] = anchor2[2];
  }
}

function getHingeAngleFromRelativeQuat(qrel: V, axis: V): number {
  const cost2 = qrel[0];
  const sint2 = Math.sqrt(qrel[1] * qrel[1] + qrel[2] * qrel[2] + qrel[3] * qrel[3]);
  let theta = (qrel[1] * axis[0] + qrel[2] * axis[1] + qrel[3] * axis[2]) >= 0
    ? 2 * xatan2(sint2, cost2)
    : 2 * xatan2(sint2, -cost2);
  if (theta > M_PI) theta -= 2 * M_PI;
  theta = -theta;
  return theta;
}
function getHingeAngle(b1: Body, b2: Body | null, axis: V, qInitial: V): number {
  const qrel = new Float64Array(4);
  if (b2) {
    const qq = new Float64Array(4);
    dQMultiply1(qq, b1.q, b2.q);
    dQMultiply2(qrel, qq, qInitial);
  } else {
    dQMultiply3(qrel, b1.q, qInitial);
  }
  return getHingeAngleFromRelativeQuat(qrel, axis);
}

export const dParamLoStop = 0, dParamHiStop = 1, dParamStopERP = 7, dParamStopCFM = 8;

class LimitMotor {
  vel = 0; fmax = 0; lostop = -dInfinity; histop = dInfinity; fudge = 1;
  normalCfm: number; stopErp: number; stopCfm: number; bounce = 0; limit = 0; limitErr = 0;
  constructor(w: World) { this.normalCfm = w.globalCfm; this.stopErp = w.globalErp; this.stopCfm = w.globalCfm; }
  set(num: number, value: number): void {
    switch (num) {
      case dParamLoStop: this.lostop = value; break;
      case dParamHiStop: this.histop = value; break;
      case dParamStopERP: this.stopErp = value; break;
      case dParamStopCFM: this.stopCfm = value; break;
    }
  }
  testRotationalLimit(angle: number): boolean {
    if (angle <= this.lostop) { this.limit = 1; this.limitErr = angle - this.lostop; return true; }
    if (angle >= this.histop) { this.limit = 2; this.limitErr = angle - this.histop; return true; }
    this.limit = 0;
    return false;
  }
  /** addLimot for a rotational joint (the hinge) */
  addLimot(joint: Joint, info: Info2, row: number, ax1: V): boolean {
    let powered = this.fmax > 0;
    if (!(powered || this.limit)) return false;
    const J = info.J, r = (info.row + row) * 12;
    J[r + 3] = ax1[0]; J[r + 4] = ax1[1]; J[r + 5] = ax1[2];
    const b1 = joint.body1();
    if (b1) { J[r + 9] = -ax1[0]; J[r + 10] = -ax1[1]; J[r + 11] = -ax1[2]; }
    if (this.limit && this.lostop === this.histop) powered = false;
    const o = info.ofs + row;
    if (powered) {
      info.cfm[o] = this.normalCfm;
      if (!this.limit) { info.c[o] = this.vel; info.lo[o] = -this.fmax; info.hi[o] = this.fmax; }
      else {
        let fm = this.fmax;
        if (this.vel > 0 || (this.vel === 0 && this.limit === 2)) fm = -fm;
        if ((this.limit === 1 && this.vel > 0) || (this.limit === 2 && this.vel < 0)) fm *= this.fudge;
        joint.body0().addTorque(-fm * ax1[0], -fm * ax1[1], -fm * ax1[2]);
        if (b1) b1.addTorque(fm * ax1[0], fm * ax1[1], fm * ax1[2]);
      }
    }
    if (this.limit) {
      const k = info.fps * this.stopErp;
      info.c[o] = -k * this.limitErr;
      info.cfm[o] = this.stopCfm;
      if (this.lostop === this.histop) {
        info.lo[o] = -dInfinity; info.hi[o] = dInfinity;
      } else {
        if (this.limit === 1) { info.lo[o] = 0; info.hi[o] = dInfinity; }
        else { info.lo[o] = -dInfinity; info.hi[o] = 0; }
        if (this.bounce > 0) {
          let vel = dot3(joint.body0().avel, 0, ax1, 0);
          if (b1) vel -= dot3(b1.avel, 0, ax1, 0);
          if (this.limit === 1) {
            if (vel < 0) { const newc = -this.bounce * vel; if (newc > info.c[o]) info.c[o] = newc; }
          } else if (vel > 0) {
            const newc = -this.bounce * vel; if (newc < info.c[o]) info.c[o] = newc;
          }
        }
      }
    }
    return true;
  }
}

export class Hinge extends Joint {
  anchor1 = new Float64Array(4);
  anchor2 = new Float64Array(4);
  axis1 = Float64Array.of(1, 0, 0, 0);
  axis2 = Float64Array.of(1, 0, 0, 0);
  qrel = new Float64Array(4);
  limot: LimitMotor;
  constructor(w: World) {
    super(w);
    this.limot = new LimitMotor(w);
  }
  getInfo1(): number {
    let m = this.limot.fmax > 0 ? 6 : 5;
    const l = this.limot;
    if ((l.lostop >= -M_PI || l.histop <= M_PI) && l.lostop <= l.histop) {
      const angle = getHingeAngle(this.body0(), this.body1(), this.axis1, this.qrel);
      if (l.testRotationalLimit(angle)) m = 6;
    }
    return m;
  }
  getInfo2(info: Info2): void {
    setBall(this, info, this.anchor1, this.anchor2);
    const ax1 = new Float64Array(4), p = new Float64Array(4), q = new Float64Array(4);
    const b0 = this.body0(), b1 = this.body1();
    mul0_331(ax1, 0, b0.R, 0, this.axis1, 0);
    dPlaneSpace(ax1, 0, p, 0, q, 0);
    const J = info.J, r3 = (info.row + 3) * 12, r4 = (info.row + 4) * 12;
    J[r3 + 3] = p[0]; J[r3 + 4] = p[1]; J[r3 + 5] = p[2];
    J[r4 + 3] = q[0]; J[r4 + 4] = q[1]; J[r4 + 5] = q[2];
    if (b1) {
      J[r3 + 9] = -p[0]; J[r3 + 10] = -p[1]; J[r3 + 11] = -p[2];
      J[r4 + 9] = -q[0]; J[r4 + 10] = -q[1]; J[r4 + 11] = -q[2];
    }
    const ax2 = new Float64Array(4), b = new Float64Array(4);
    if (b1) mul0_331(ax2, 0, b1.R, 0, this.axis2, 0);
    else { ax2[0] = this.axis2[0]; ax2[1] = this.axis2[1]; ax2[2] = this.axis2[2]; }
    cross3(b, 0, ax1, 0, ax2, 0);
    const k = info.fps * info.erp;
    info.c[info.ofs + 3] = k * dot3(b, 0, p, 0);
    info.c[info.ofs + 4] = k * dot3(b, 0, q, 0);
    this.limot.addLimot(this, info, 5, ax1);
  }
  computeInitialRelativeRotation(): void {
    const b0 = this.node[0].body, b1 = this.node[1].body;
    if (b0) {
      if (b1) dQMultiply1(this.qrel, b0.q, b1.q);
      else { this.qrel[0] = b0.q[0]; this.qrel[1] = -b0.q[1]; this.qrel[2] = -b0.q[2]; this.qrel[3] = -b0.q[3]; }
    }
  }
  override setRelativeValues(): void {
    const vec = new Float64Array(4);
    this.getAnchor(vec);
    setAnchors(this, vec[0], vec[1], vec[2], this.anchor1, this.anchor2);
    // dJointGetHingeAxis
    const ax = new Float64Array(4);
    if (this.node[0].body) mul0_331(ax, 0, this.node[0].body.R, 0, this.axis1, 0);
    setAxes(this, ax[0], ax[1], ax[2], this.axis1, this.axis2);
    this.computeInitialRelativeRotation();
  }
  setAnchor(x: number, y: number, z: number): void {
    setAnchors(this, x, y, z, this.anchor1, this.anchor2);
    this.computeInitialRelativeRotation();
  }
  setAxis(x: number, y: number, z: number): void {
    setAxes(this, x, y, z, this.axis1, this.axis2);
    this.computeInitialRelativeRotation();
  }
  setParam(param: number, value: number): void { this.limot.set(param, value); }
  getAnchor(result: V): void {
    if (this.flags & JOINT_REVERSE) getAnchor2(this, result, this.anchor2);
    else getAnchor(this, result, this.anchor1);
  }
}

export interface ContactGeom { pos: [number, number, number]; normal: [number, number, number]; depth: number }
export interface Contact { geom: ContactGeom; mu: number; mode: number; slip1: number }
export const dContactApprox1_1 = 0x1000;
export const dContactSlip1 = 0x100;

export class ContactJoint extends Joint {
  contact: Contact;
  theM = 0;
  constructor(w: World, c: Contact) {
    super(w);
    this.contact = { geom: { pos: [...c.geom.pos], normal: [...c.geom.normal], depth: c.geom.depth }, mu: c.mu, mode: c.mode, slip1: c.slip1 };
  }
  getInfo1(): number {
    // no dContactMu2: m = 1, +2 with friction
    let m = 1;
    if (this.contact.mu < 0) this.contact.mu = 0;
    if (this.contact.mu > 0) m += 2;
    this.theM = m;
    return m;
  }
  getInfo2(info: Info2): void {
    const ct = this.contact, s = 12, J = info.J, r = info.row * 12, o = info.ofs;
    const normal = new Float64Array(4);
    if (this.flags & JOINT_REVERSE) {
      normal[0] = -ct.geom.normal[0]; normal[1] = -ct.geom.normal[1]; normal[2] = -ct.geom.normal[2];
    } else {
      normal[0] = ct.geom.normal[0]; normal[1] = ct.geom.normal[1]; normal[2] = ct.geom.normal[2];
    }
    normal[3] = 0;
    const b0 = this.body0(), b1 = this.body1();
    const c1 = new Float64Array(4), c2 = new Float64Array(4);
    c1[0] = ct.geom.pos[0] - b0.pos[0];
    c1[1] = ct.geom.pos[1] - b0.pos[1];
    c1[2] = ct.geom.pos[2] - b0.pos[2];
    J[r] = normal[0]; J[r + 1] = normal[1]; J[r + 2] = normal[2];
    cross3(J, r + 3, c1, 0, normal, 0);
    if (b1) {
      c2[0] = ct.geom.pos[0] - b1.pos[0];
      c2[1] = ct.geom.pos[1] - b1.pos[1];
      c2[2] = ct.geom.pos[2] - b1.pos[2];
      J[r + 6] = -normal[0]; J[r + 7] = -normal[1]; J[r + 8] = -normal[2];
      cross3(J, r + 9, c2, 0, normal, 0);
      J[r + 9] = -J[r + 9]; J[r + 10] = -J[r + 10]; J[r + 11] = -J[r + 11];
    }
    const erp = info.erp; // no dContactSoftERP
    const k = info.fps * erp;
    let depth = ct.geom.depth - this.world.contactMinDepth;
    if (depth < 0) depth = 0;
    const pushout = k * depth + 0;
    info.c[o] = pushout;
    if (info.c[o] > this.world.contactMaxVel) info.c[o] = this.world.contactMaxVel;
    info.lo[o] = 0;
    info.hi[o] = dInfinity;
    const t1 = new Float64Array(4), t2 = new Float64Array(4);
    if (this.theM >= 2) {
      dPlaneSpace(normal, 0, t1, 0, t2, 0);
      J[r + s] = t1[0]; J[r + s + 1] = t1[1]; J[r + s + 2] = t1[2];
      cross3(J, r + s + 3, c1, 0, t1, 0);
      if (b1) {
        J[r + s + 6] = -t1[0]; J[r + s + 7] = -t1[1]; J[r + s + 8] = -t1[2];
        cross3(J, r + s + 9, c2, 0, t1, 0);
        J[r + s + 9] = -J[r + s + 9]; J[r + s + 10] = -J[r + s + 10]; J[r + s + 11] = -J[r + s + 11];
      }
      info.lo[o + 1] = -ct.mu;
      info.hi[o + 1] = ct.mu;
      if (ct.mode & dContactApprox1_1) info.findex[o + 1] = 0;
      if (ct.mode & dContactSlip1) info.cfm[o + 1] = ct.slip1;
    }
    if (this.theM >= 3) {
      const s2 = 2 * s;
      J[r + s2] = t2[0]; J[r + s2 + 1] = t2[1]; J[r + s2 + 2] = t2[2];
      cross3(J, r + s2 + 3, c1, 0, t2, 0);
      if (b1) {
        J[r + s2 + 6] = -t2[0]; J[r + s2 + 7] = -t2[1]; J[r + s2 + 8] = -t2[2];
        cross3(J, r + s2 + 9, c2, 0, t2, 0);
        J[r + s2 + 9] = -J[r + s2 + 9]; J[r + s2 + 10] = -J[r + s2 + 10]; J[r + s2 + 11] = -J[r + s2 + 11];
      }
      info.lo[o + 2] = -ct.mu;
      info.hi[o + 2] = ct.mu;
    }
  }
}

/** dJointAttach */
export function jointAttach(joint: Joint, body1: Body | null, body2: Body | null): void {
  if (joint.node[0].body || joint.node[1].body) removeJointReferences(joint);
  if (body1 === null) {
    body1 = body2; body2 = null;
    joint.flags |= JOINT_REVERSE;
  } else {
    joint.flags &= ~JOINT_REVERSE;
  }
  joint.node[0].body = body1;
  joint.node[1].body = body2;
  if (body1) {
    joint.node[1].next = body1.firstjoint;
    body1.firstjoint = joint.node[1];
  } else joint.node[1].next = null;
  if (body2) {
    joint.node[0].next = body2.firstjoint;
    body2.firstjoint = joint.node[0];
  } else joint.node[0].next = null;
  if (body1 || body2) joint.setRelativeValues();
}

function removeJointReferences(j: Joint): void {
  for (let i = 0; i < 2; i++) {
    const body = j.node[i].body;
    if (body) {
      // the node in this body's list is node[1-i]
      const target = j.node[1 - i];
      let prev: JointNode | null = null;
      let n = body.firstjoint;
      while (n) {
        if (n === target) {
          if (prev) prev.next = n.next; else body.firstjoint = n.next;
          break;
        }
        prev = n;
        n = n.next;
      }
    }
  }
  j.node[0].body = null; j.node[0].next = null;
  j.node[1].body = null; j.node[1].next = null;
}

export class JointGroup {
  joints: Joint[] = [];
  empty(): void {
    for (let i = this.joints.length - 1; i >= 0; i--) {
      const j = this.joints[i];
      removeJointReferences(j);
      j.world.removeJoint(j);
    }
    this.joints.length = 0;
  }
}

export class World {
  firstbody: Body | null = null;
  firstjoint: Joint | null = null;
  nb = 0;
  nj = 0;
  gravity = new Float64Array(4);
  globalErp = 0.2;
  globalCfm = 1e-10;
  qsIterations = 20;
  qsW = 1.3;
  contactMaxVel = dInfinity;
  contactMinDepth = 0;

  createBody(): Body {
    const b = new Body(this);
    b.next = this.firstbody;
    if (this.firstbody) this.firstbody.prev = b;
    this.firstbody = b;
    this.nb++;
    return b;
  }
  addJoint(j: Joint): void {
    j.next = this.firstjoint;
    if (this.firstjoint) this.firstjoint.prev = j;
    this.firstjoint = j;
    this.nj++;
  }
  removeJoint(j: Joint): void {
    if (j.prev) j.prev.next = j.next; else this.firstjoint = j.next;
    if (j.next) j.next.prev = j.prev;
    j.next = j.prev = null;
    this.nj--;
  }
  createHinge(): Hinge { return new Hinge(this); }
  createContact(group: JointGroup, c: Contact): ContactJoint {
    const j = new ContactJoint(this, c);
    group.joints.push(j);
    return j;
  }
  setGravity(x: number, y: number, z: number): void { this.gravity[0] = x; this.gravity[1] = y; this.gravity[2] = z; }

  /** dWorldQuickStep */
  quickStep(stepsize: number): void {
    // islands (util.cpp BuildIslandsAndEstimateStepperMemoryRequirements), no auto-disabling
    for (let b = this.firstbody; b; b = b.next) b.tag = 0;
    for (let j = this.firstjoint; j; j = j.next) j.tag = 0;
    const islands: { bodies: Body[]; joints: Joint[] }[] = [];
    for (let bb = this.firstbody; bb; bb = bb.next) {
      if (bb.tag) continue;
      if (bb.flags & FLAG_DISABLED) { bb.tag = -1; continue; }
      bb.tag = 1;
      const bodies: Body[] = [bb];
      const joints: Joint[] = [];
      const stack: Body[] = [];
      let b = bb;
      for (;;) {
        for (let n = b.firstjoint; n; n = n.next) {
          const nj = n.joint;
          if (!nj.tag) {
            if (nj.isEnabled()) {
              nj.tag = 1;
              joints.push(nj);
              const nbody = n.body;
              if (nbody && nbody.tag <= 0) {
                nbody.tag = 1;
                nbody.flags &= ~FLAG_DISABLED;
                stack.push(nbody);
              }
            } else {
              nj.tag = -1;
            }
          }
        }
        if (stack.length === 0) break;
        b = stack.pop()!;
        bodies.push(b);
      }
      islands.push({ bodies, joints });
    }
    for (const isl of islands) quickStepper(this, isl.bodies, isl.joints, stepsize);
  }
}

/** util.cpp dxStepBody */
function stepBody(b: Body, h: number): void {
  for (let j = 0; j < 3; j++) b.pos[j] += h * b.lvel[j];
  if (b.flags & FLAG_FINITE_ROTATION) {
    const irv = new Float64Array(4);
    const q = new Float64Array(4);
    if (b.flags & FLAG_FINITE_ROTATION_AXIS) {
      const frv = new Float64Array(4);
      const k = dot3(b.finiteRotAxis, 0, b.avel, 0);
      frv[0] = b.finiteRotAxis[0] * k;
      frv[1] = b.finiteRotAxis[1] * k;
      frv[2] = b.finiteRotAxis[2] * k;
      irv[0] = b.avel[0] - frv[0];
      irv[1] = b.avel[1] - frv[1];
      irv[2] = b.avel[2] - frv[2];
      h *= 0.5;
      const theta = k * h;
      q[0] = xcos(theta);
      const s = sinc(theta) * h;
      q[1] = frv[0] * s; q[2] = frv[1] * s; q[3] = frv[2] * s;
    } else {
      const wlen = Math.sqrt(b.avel[0] * b.avel[0] + b.avel[1] * b.avel[1] + b.avel[2] * b.avel[2]);
      h *= 0.5;
      const theta = wlen * h;
      q[0] = xcos(theta);
      const s = sinc(theta) * h;
      q[1] = b.avel[0] * s; q[2] = b.avel[1] * s; q[3] = b.avel[2] * s;
    }
    const q2 = new Float64Array(4);
    dQMultiply0(q2, q, b.q);
    b.q.set(q2);
    if (b.flags & FLAG_FINITE_ROTATION_AXIS) {
      const dq = new Float64Array(4);
      dWtoDQ(irv, b.q, dq);
      for (let j = 0; j < 4; j++) b.q[j] += h * dq[j];
    }
  } else {
    const dq = new Float64Array(4);
    dWtoDQ(b.avel, b.q, dq);
    for (let j = 0; j < 4; j++) b.q[j] += h * dq[j];
  }
  dNormalize4(b.q);
  dQtoR(b.q, b.R);
}
function sinc(x: number): number {
  if (Math.abs(x) < 1.0e-4) return 1.0 - x * x * 0.166666666666666666667;
  return xsin(x) / x;
}

/** quickstep.cpp dxQuickStepper (without WARM_STARTING and REORDER_CONSTRAINTS, with RANDOMLY_REORDER_CONSTRAINTS) */
function quickStepper(world: World, body: Body[], joint: Joint[], stepsize: number): void {
  const nb = body.length;
  const stepsize1 = 1.0 / stepsize;
  for (let i = 0; i < nb; i++) body[i].tag = i;

  const invI = new Float64Array(12 * nb);
  const tmp = new Float64Array(12), I = new Float64Array(12), tmpv = new Float64Array(4);
  for (let i = 0; i < nb; i++) {
    const b = body[i];
    const row = invI.subarray(12 * i, 12 * i + 12);
    mul2_333(tmp, b.invI, b.R);
    mul0_333(row, b.R, tmp);
    if (b.flags & FLAG_GYROSCOPIC) {
      mul2_333(tmp, b.mass.I, b.R);
      mul0_333(I, b.R, tmp);
      mul0_331(tmpv, 0, I, 0, b.avel, 0);
      // dSubtractVectorCross3(tacc, avel, tmp)
      const c = new Float64Array(3);
      cross3(c, 0, b.avel, 0, tmpv, 0);
      const r0 = b.tacc[0] - c[0], r1 = b.tacc[1] - c[1], r2 = b.tacc[2] - c[2];
      b.tacc[0] = r0; b.tacc[1] = r1; b.tacc[2] = r2;
    }
  }
  const g = world.gravity;
  for (let ax = 0; ax < 3; ax++) {
    if (g[ax]) for (let i = 0; i < nb; i++) body[i].facc[ax] += body[i].mass.mass * g[ax];
  }

  // joint info 1
  const infos: { joint: Joint; m: number }[] = [];
  for (const j of joint) {
    const m = j.getInfo1();
    if (m > 0) infos.push({ joint: j, m });
  }
  let m = 0;
  for (const ji of infos) m += ji.m;

  if (m > 0) {
    const J = new Float64Array(m * 12);
    const cfm = new Float64Array(m).fill(world.globalCfm);
    const lo = new Float64Array(m).fill(-dInfinity);
    const hi = new Float64Array(m).fill(dInfinity);
    const findex = new Int32Array(m).fill(-1);
    const jb = new Int32Array(m * 2);
    const rhs = new Float64Array(m);
    const c = new Float64Array(m);
    {
      let ofsi = 0;
      for (const ji of infos) {
        const info: Info2 = { fps: stepsize1, erp: world.globalErp, rowskip: 12, J, row: ofsi, c, cfm, lo, hi, findex, ofs: ofsi };
        ji.joint.getInfo2(info);
        for (let k = 0; k < ji.m; k++) {
          const fival = findex[ofsi + k];
          if (fival !== -1) findex[ofsi + k] = fival + ofsi;
        }
        ofsi += ji.m;
      }
    }
    {
      let p = 0;
      for (const ji of infos) {
        const b1 = ji.joint.node[0].body ? ji.joint.node[0].body.tag : -1;
        const b2 = ji.joint.node[1].body ? ji.joint.node[1].body.tag : -1;
        for (let k = 0; k < ji.m; k++) { jb[p++] = b1; jb[p++] = b2; }
      }
    }
    {
      const tmp1 = new Float64Array(nb * 6);
      for (let i = 0; i < nb; i++) {
        const b = body[i], o = i * 6;
        const im = b.invMass;
        for (let k = 0; k < 3; k++) tmp1[o + k] = b.facc[k] * im + b.lvel[k] * stepsize1;
        mul0_331(tmp1, o + 3, invI, 12 * i, b.tacc, 0);
        for (let k = 0; k < 3; k++) tmp1[o + 3 + k] += b.avel[k] * stepsize1;
      }
      multiplyJ(m, J, jb, tmp1, rhs);
    }
    for (let i = 0; i < m; i++) rhs[i] = c[i] * stepsize1 - rhs[i];
    for (let i = 0; i < m; i++) cfm[i] *= stepsize1;

    const lambda = new Float64Array(m);
    const cforce = new Float64Array(nb * 6);
    sorLcp(m, nb, J, jb, body, invI, lambda, cforce, rhs, lo, hi, cfm, findex, world.qsIterations, world.qsW);

    for (let i = 0; i < nb; i++) {
      const b = body[i], o = i * 6;
      for (let k = 0; k < 3; k++) {
        b.lvel[k] += stepsize * cforce[o + k];
        b.avel[k] += stepsize * cforce[o + 3 + k];
      }
    }
  }

  for (let i = 0; i < nb; i++) {
    const b = body[i];
    const s = stepsize * b.invMass;
    for (let k = 0; k < 3; k++) {
      b.lvel[k] += s * b.facc[k];
      b.tacc[k] *= stepsize;
    }
    // dMultiplyAdd0_331(avel, invIrow, tacc)
    const t = new Float64Array(3);
    mul0_331(t, 0, invI, 12 * i, b.tacc, 0);
    const r0 = b.avel[0] + t[0], r1 = b.avel[1] + t[1], r2 = b.avel[2] + t[2];
    b.avel[0] = r0; b.avel[1] = r1; b.avel[2] = r2;
  }
  for (let i = 0; i < nb; i++) stepBody(body[i], stepsize);
  for (let i = 0; i < nb; i++) { body[i].facc.fill(0, 0, 3); body[i].tacc.fill(0, 0, 3); }
}

function multiplyJ(m: number, J: Float64Array, jb: Int32Array, inp: Float64Array, out: Float64Array): void {
  for (let i = 0; i < m; i++) {
    const b1 = jb[i * 2], b2 = jb[i * 2 + 1];
    let sum = 0;
    const r = i * 12;
    let ip = b1 * 6;
    for (let j = 0; j < 6; j++) sum += J[r + j] * inp[ip + j];
    if (b2 !== -1) {
      ip = b2 * 6;
      for (let j = 0; j < 6; j++) sum += J[r + 6 + j] * inp[ip + j];
    }
    out[i] = sum;
  }
}

function sorLcp(m: number, _nb: number, J: Float64Array, jb: Int32Array, body: Body[], invI: Float64Array,
  lambda: Float64Array, fc: Float64Array, b: Float64Array, lo: Float64Array, hi: Float64Array,
  cfm: Float64Array, findex: Int32Array, numIterations: number, sorW: number): void {
  lambda.fill(0);
  // compute_invM_JT
  const iMJ = new Float64Array(m * 12);
  for (let i = 0; i < m; i++) {
    const r = i * 12;
    const b1 = jb[i * 2], b2 = jb[i * 2 + 1];
    const k1 = body[b1].invMass;
    for (let j = 0; j < 3; j++) iMJ[r + j] = k1 * J[r + j];
    mul0_331(iMJ, r + 3, invI, 12 * b1, J, r + 3);
    if (b2 !== -1) {
      const k2 = body[b2].invMass;
      for (let j = 0; j < 3; j++) iMJ[r + j + 6] = k2 * J[r + j + 6];
      mul0_331(iMJ, r + 9, invI, 12 * b2, J, r + 9);
    }
  }
  fc.fill(0);
  const Ad = new Float64Array(m);
  for (let i = 0; i < m; i++) {
    const r = i * 12;
    let sum = 0;
    for (let j = 0; j < 6; j++) sum += iMJ[r + j] * J[r + j];
    if (jb[i * 2 + 1] !== -1) for (let k = 6; k < 12; k++) sum += iMJ[r + k] * J[r + k];
    Ad[i] = sorW / (sum + cfm[i]);
  }
  for (let i = 0; i < m; i++) {
    const r = i * 12;
    const Adi = Ad[i];
    for (let j = 0; j < 12; j++) J[r + j] *= Adi;
    b[i] *= Adi;
    Ad[i] = Adi * cfm[i];
  }
  // order: findex == -1 first (from the head), the others from the tail
  const order = new Int32Array(m);
  {
    let head = 0, tail = m - 1;
    for (let i = 0; i < m; i++) {
      if (findex[i] === -1) order[head++] = i;
      else order[tail--] = i;
    }
  }
  for (let iteration = 0; iteration < numIterations; iteration++) {
    if ((iteration & 7) === 0) {
      for (let i = 1; i < m; i++) {
        const swapi = dRandInt(i + 1);
        const t = order[i]; order[i] = order[swapi]; order[swapi] = t;
      }
    }
    for (let i = 0; i < m; i++) {
      const index = order[i];
      const b1 = jb[index * 2], b2 = jb[index * 2 + 1];
      const f1 = 6 * b1;
      const f2 = b2 !== -1 ? 6 * b2 : -1;
      const oldLambda = lambda[index];
      let delta = b[index] - oldLambda * Ad[index];
      const r = index * 12;
      delta -= fc[f1] * J[r] + fc[f1 + 1] * J[r + 1] + fc[f1 + 2] * J[r + 2] + fc[f1 + 3] * J[r + 3] +
        fc[f1 + 4] * J[r + 4] + fc[f1 + 5] * J[r + 5];
      if (f2 >= 0) {
        delta -= fc[f2] * J[r + 6] + fc[f2 + 1] * J[r + 7] + fc[f2 + 2] * J[r + 8] + fc[f2 + 3] * J[r + 9] +
          fc[f2 + 4] * J[r + 10] + fc[f2 + 5] * J[r + 11];
      }
      let hiAct: number, loAct: number;
      if (findex[index] !== -1) {
        hiAct = Math.abs(hi[index] * lambda[findex[index]]);
        loAct = -hiAct;
      } else {
        hiAct = hi[index];
        loAct = lo[index];
      }
      const newLambda = oldLambda + delta;
      if (newLambda < loAct) { delta = loAct - oldLambda; lambda[index] = loAct; }
      else if (newLambda > hiAct) { delta = hiAct - oldLambda; lambda[index] = hiAct; }
      else lambda[index] = newLambda;
      fc[f1] += delta * iMJ[r]; fc[f1 + 1] += delta * iMJ[r + 1]; fc[f1 + 2] += delta * iMJ[r + 2];
      fc[f1 + 3] += delta * iMJ[r + 3]; fc[f1 + 4] += delta * iMJ[r + 4]; fc[f1 + 5] += delta * iMJ[r + 5];
      if (f2 >= 0) {
        fc[f2] += delta * iMJ[r + 6]; fc[f2 + 1] += delta * iMJ[r + 7]; fc[f2 + 2] += delta * iMJ[r + 8];
        fc[f2 + 3] += delta * iMJ[r + 9]; fc[f2 + 4] += delta * iMJ[r + 10]; fc[f2 + 5] += delta * iMJ[r + 11];
      }
    }
  }
}
