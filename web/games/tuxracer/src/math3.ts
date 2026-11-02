// The vector, matrix and quaternion arithmetic of Tux Racer, from src/alglib.c. The game's scalar
// is a C double, so this works in floats/numbers exactly as the original does; matrices are
// [row][column] like the original's matrixgl_t (OpenGL's column-major memory order).

export interface Vec3 { x: number; y: number; z: number }
export interface Point3 { x: number; y: number; z: number }
export interface Quat { x: number; y: number; z: number; w: number }
export type Mat4 = number[][];
export interface Plane { nml: Vec3; d: number }

export const EPS = 1e-13;
export const M_PI = Math.PI;
export const DEG = M_PI / 180;
export const RAD = 180 / M_PI;

export const vec = (x: number, y: number, z: number): Vec3 => ({ x, y, z });
export const point = (x: number, y: number, z: number): Point3 => ({ x, y, z });
export const cloneVec = (v: Vec3): Vec3 => ({ x: v.x, y: v.y, z: v.z });

export function dot(a: Vec3, b: Vec3): number { return a.x * b.x + a.y * b.y + a.z * b.z; }
export function scale(s: number, v: Vec3): Vec3 { return { x: s * v.x, y: s * v.y, z: s * v.z }; }
export function add(a: Vec3, b: Vec3): Vec3 { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
export function subtract(a: Vec3, b: Vec3): Vec3 { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
export function movePoint(p: Point3, v: Vec3): Point3 { return { x: p.x + v.x, y: p.y + v.y, z: p.z + v.z }; }
export function pointMinusVector(p: Point3, v: Vec3): Point3 { return { x: p.x - v.x, y: p.y - v.y, z: p.z - v.z }; }
export function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
export function magSqd(v: Vec3): number { return v.x * v.x + v.y * v.y + v.z * v.z; }
export function projectIntoPlane(nml: Vec3, v: Vec3): Vec3 { return subtract(v, scale(dot(nml, v), nml)); }

/** The original's normalize_vector: returns the old length and writes the unit vector. */
export function normalize(v: Vec3): number {
  let denom = 1;
  let x = v.x > 0 ? v.x : -v.x;
  let y = v.y > 0 ? v.y : -v.y;
  let z = v.z > 0 ? v.z : -v.z;
  if (x > y) {
    if (x > z) {
      if (1 + x > 1) { y = y / x; z = z / x; denom = 1 / (x * Math.sqrt(1 + y * y + z * z)); }
    } else {
      if (1 + z > 1) { y = y / z; x = x / z; denom = 1 / (z * Math.sqrt(1 + y * y + x * x)); }
    }
  } else {
    if (y > z) {
      if (1 + y > 1) { z = z / y; x = x / y; denom = 1 / (y * Math.sqrt(1 + z * z + x * x)); }
    } else {
      if (1 + z > 1) { y = y / z; x = x / z; denom = 1 / (z * Math.sqrt(1 + y * y + x * x)); }
    }
  }
  if (1 + x + y + z > 1) {
    v.x *= denom; v.y *= denom; v.z *= denom;
    return 1 / denom;
  }
  return 0;
}

export function transformVector(m: Mat4, v: Vec3): Vec3 {
  return {
    x: v.x * m[0][0] + v.y * m[1][0] + v.z * m[2][0],
    y: v.x * m[0][1] + v.y * m[1][1] + v.z * m[2][1],
    z: v.x * m[0][2] + v.y * m[1][2] + v.z * m[2][2],
  };
}
export function transformNormal(n: Vec3, m: Mat4): Vec3 {
  return {
    x: n.x * m[0][0] + n.y * m[0][1] + n.z * m[0][2],
    y: n.x * m[1][0] + n.y * m[1][1] + n.z * m[1][2],
    z: n.x * m[2][0] + n.y * m[2][1] + n.z * m[2][2],
  };
}
export function transformPoint(m: Mat4, p: Point3): Point3 {
  return {
    x: p.x * m[0][0] + p.y * m[1][0] + p.z * m[2][0] + m[3][0],
    y: p.x * m[0][1] + p.y * m[1][1] + p.z * m[2][1] + m[3][1],
    z: p.x * m[0][2] + p.y * m[1][2] + p.z * m[2][2] + m[3][2],
  };
}

export function identity(): Mat4 {
  return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
}

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const r: Mat4 = identity();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      r[j][i] = a[0][i] * b[j][0] + a[1][i] * b[j][1] + a[2][i] * b[j][2] + a[3][i] * b[j][3];
    }
  }
  return r;
}

export function transpose(m: Mat4): Mat4 {
  const r: Mat4 = identity();
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) r[j][i] = m[i][j];
  return r;
}

export function rotationMatrix(angleDeg: number, axis: 'x' | 'y' | 'z'): Mat4 {
  const s = Math.sin(DEG * angleDeg);
  const c = Math.cos(DEG * angleDeg);
  const m = identity();
  if (axis === 'x') {
    m[1][1] = c; m[2][1] = -s; m[1][2] = s; m[2][2] = c;
  } else if (axis === 'y') {
    m[0][0] = c; m[2][0] = s; m[0][2] = -s; m[2][2] = c;
  } else {
    m[0][0] = c; m[1][0] = -s; m[0][1] = s; m[1][1] = c;
  }
  return m;
}

export function translationMatrix(x: number, y: number, z: number): Mat4 {
  const m = identity();
  m[3][0] = x; m[3][1] = y; m[3][2] = z;
  return m;
}

export function scalingMatrix(x: number, y: number, z: number): Mat4 {
  const m = identity();
  m[0][0] = x; m[1][1] = y; m[2][2] = z;
  return m;
}

export function changeOfBasis(w1: Vec3, w2: Vec3, w3: Vec3): { mat: Mat4; inv: Mat4 } {
  const mat = identity();
  mat[0][0] = w1.x; mat[0][1] = w1.y; mat[0][2] = w1.z;
  mat[1][0] = w2.x; mat[1][1] = w2.y; mat[1][2] = w2.z;
  mat[2][0] = w3.x; mat[2][1] = w3.y; mat[2][2] = w3.z;
  const inv = identity();
  inv[0][0] = w1.x; inv[1][0] = w1.y; inv[2][0] = w1.z;
  inv[0][1] = w2.x; inv[1][1] = w2.y; inv[2][1] = w2.z;
  inv[0][2] = w3.x; inv[1][2] = w3.y; inv[2][2] = w3.z;
  return { mat, inv };
}

export function rotationAboutVector(axis: Vec3, angleDeg: number): Mat4 {
  const { x: a, y: b, z: c } = axis;
  const d = Math.sqrt(b * b + c * c);
  if (d < EPS) return rotationMatrix(a < 0 ? -angleDeg : angleDeg, 'x');
  const rx = identity(), irx = identity(), ry = identity(), iry = identity();
  rx[1][1] = c / d; rx[2][1] = -b / d; rx[1][2] = b / d; rx[2][2] = c / d;
  irx[1][1] = c / d; irx[2][1] = b / d; irx[1][2] = -b / d; irx[2][2] = c / d;
  ry[0][0] = d; ry[2][0] = -a; ry[0][2] = a; ry[2][2] = d;
  iry[0][0] = d; iry[2][0] = a; iry[0][2] = -a; iry[2][2] = d;
  let m = rotationMatrix(angleDeg, 'z');
  m = multiply(m, ry);
  m = multiply(m, rx);
  m = multiply(iry, m);
  m = multiply(irx, m);
  return m;
}

export const quat = (x: number, y: number, z: number, w: number): Quat => ({ x, y, z, w });

export function multiplyQuat(q: Quat, r: Quat): Quat {
  return {
    x: q.y * r.z - q.z * r.y + r.w * q.x + q.w * r.x,
    y: q.z * r.x - q.x * r.z + r.w * q.y + q.w * r.y,
    z: q.x * r.y - q.y * r.x + r.w * q.z + q.w * r.z,
    w: q.w * r.w - q.x * r.x - q.y * r.y - q.z * r.z,
  };
}
export function conjugate(q: Quat): Quat { return { x: -q.x, y: -q.y, z: -q.z, w: q.w }; }
export function quatFromMatrix(m: Mat4): Quat {
  const tr = m[0][0] + m[1][1] + m[2][2];
  if (tr > 0) {
    let s = Math.sqrt(tr + 1);
    const q: Quat = { w: 0.5 * s, x: 0, y: 0, z: 0 };
    s = 0.5 / s;
    q.x = (m[1][2] - m[2][1]) * s;
    q.y = (m[2][0] - m[0][2]) * s;
    q.z = (m[0][1] - m[1][0]) * s;
    return q;
  }
  const nxt = [1, 2, 0];
  let i = 0;
  if (m[1][1] > m[0][0]) i = 1;
  if (m[2][2] > m[i][i]) i = 2;
  const j = nxt[i], k = nxt[j];
  let s = Math.sqrt(m[i][i] - m[j][j] - m[k][k] + 1);
  const q = [0, 0, 0, 0];
  q[i] = s * 0.5;
  if (s !== 0) s = 0.5 / s;
  q[3] = (m[j][k] - m[k][j]) * s;
  q[j] = (m[i][j] + m[j][i]) * s;
  q[k] = (m[i][k] + m[k][i]) * s;
  return { x: q[0], y: q[1], z: q[2], w: q[3] };
}
export function matrixFromQuat(q: Quat): Mat4 {
  const m = identity();
  m[0][0] = 1 - 2 * (q.y * q.y + q.z * q.z);
  m[1][0] = 2 * (q.x * q.y - q.w * q.z);
  m[2][0] = 2 * (q.x * q.z + q.w * q.y);
  m[0][1] = 2 * (q.x * q.y + q.w * q.z);
  m[1][1] = 1 - 2 * (q.x * q.x + q.z * q.z);
  m[2][1] = 2 * (q.y * q.z - q.w * q.x);
  m[0][2] = 2 * (q.x * q.z - q.w * q.y);
  m[1][2] = 2 * (q.y * q.z + q.w * q.x);
  m[2][2] = 1 - 2 * (q.x * q.x + q.y * q.y);
  return m;
}
export function rotationQuaternion(s: Vec3, t: Vec3): Quat {
  const u = cross(s, t);
  const sin2phi = normalize(u);
  if (sin2phi < EPS) return quat(0, 0, 0, 1);
  const cos2phi = dot(s, t);
  const sinphi = Math.sqrt((1 - cos2phi) / 2);
  const cosphi = Math.sqrt((1 + cos2phi) / 2);
  return quat(sinphi * u.x, sinphi * u.y, sinphi * u.z, cosphi);
}
export function interpolateQuaternions(a: Quat, b: Quat, t: number): Quat {
  let cosphi = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  let r = b;
  if (cosphi < 0) { cosphi = -cosphi; r = { x: -b.x, y: -b.y, z: -b.z, w: -b.w }; }
  let s0: number, s1: number;
  if (1 - cosphi > EPS) {
    const phi = Math.acos(cosphi);
    const sinphi = Math.sin(phi);
    s0 = Math.sin(phi * (1 - t)) / sinphi;
    s1 = Math.sin(phi * t) / sinphi;
  } else {
    s0 = 1 - t; s1 = t;
  }
  return {
    x: s0 * a.x + s1 * r.x, y: s0 * a.y + s1 * r.y,
    z: s0 * a.z + s1 * r.z, w: s0 * a.w + s1 * r.w,
  };
}
export function rotateVector(q: Quat, v: Vec3): Vec3 {
  const p = quat(v.x, v.y, v.z, 1);
  const r = multiplyQuat(q, multiplyQuat(p, conjugate(q)));
  return { x: r.x, y: r.y, z: r.z };
}
export function distanceToPlane(pl: Plane, pt: Point3): number {
  return pl.nml.x * pt.x + pl.nml.y * pt.y + pl.nml.z * pt.z + pl.d;
}
export function min(a: number, b: number): number { return a < b ? a : b; }
export function max(a: number, b: number): number { return a > b ? a : b; }
