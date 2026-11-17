// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/core/math/math.cpp,
// matrix33.cpp, matrix44.cpp and rand.cpp. Changed for the browser by the freegames project, 2026.
// The original keeps everything in float; the port computes in double (README.md, "Deviations").

const f32 = new Float32Array(1);
const i32 = new Int32Array(f32.buffer);

/** InvSqrt of math.cpp: the "0x5f3759df" fast inverse square root on a float */
export function invSqrt(x: number): number {
  f32[0] = x;
  i32[0] = 0x5f3759df - (i32[0] >> 1);
  const y = f32[0];
  return y * (1.5 - (0.5 * x * y * y));
}

/** vw_sqrtf */
export function vwSqrtf(x: number): number {
  return x * invSqrt(x);
}

export class Vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x: number, y: number, z: number): this {
    this.x = x; this.y = y; this.z = z;
    return this;
  }
  copy(a: Vec3): this {
    this.x = a.x; this.y = a.y; this.z = a.z;
    return this;
  }
  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }
  equals(a: Vec3): boolean {
    return a.x === this.x && a.y === this.y && a.z === this.z;
  }
  /** operator * (dot product) */
  dot(b: Vec3): number {
    return this.x * b.x + this.y * b.y + this.z * b.z;
  }
  /** operator ^ (scale, new vector) */
  mul(c: number): Vec3 {
    return new Vec3(this.x * c, this.y * c, this.z * c);
  }
  div(c: number): Vec3 {
    return new Vec3(this.x / c, this.y / c, this.z / c);
  }
  /** operator *= */
  scale(c: number): this {
    this.x *= c; this.y *= c; this.z *= c;
    return this;
  }
  add(a: Vec3): Vec3 {
    return new Vec3(this.x + a.x, this.y + a.y, this.z + a.z);
  }
  addTo(a: Vec3): this {
    this.x += a.x; this.y += a.y; this.z += a.z;
    return this;
  }
  sub(a: Vec3): Vec3 {
    return new Vec3(this.x - a.x, this.y - a.y, this.z - a.z);
  }
  subFrom(a: Vec3): this {
    this.x -= a.x; this.y -= a.y; this.z -= a.z;
    return this;
  }
  Length(): number {
    return vwSqrtf(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  Normalize(): this {
    const l2 = this.x * this.x + this.y * this.y + this.z * this.z;
    const inv = invSqrt(l2);
    this.x *= inv; this.y *= inv; this.z *= inv;
    return this;
  }
  NormalizeHi(): this {
    const l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (l < 0.001) return this;
    this.x /= l; this.y /= l; this.z /= l;
    return this;
  }
  /** Multiply: cross product in place */
  Multiply(a: Vec3): this {
    const tx = this.y * a.z - this.z * a.y;
    const ty = this.z * a.x - this.x * a.z;
    const tz = this.x * a.y - this.y * a.x;
    this.x = tx; this.y = ty; this.z = tz;
    return this;
  }
}

export const v3 = (x = 0, y = 0, z = 0): Vec3 => new Vec3(x, y, z);

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

const DEG2RAD = 0.0174532925;

/** vw_GetPlaneABCD: returns [A, B, C, D] */
export function getPlaneABCD(p1: Vec3, p2: Vec3, p3: Vec3): [number, number, number, number] {
  const A = (p2.y - p1.y) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.y - p1.y);
  const B = (p2.z - p1.z) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.z - p1.z);
  const C = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  const D = -p1.x * (p2.y - p1.y) * (p3.z - p1.z)
    - p1.y * (p2.z - p1.z) * (p3.x - p1.x)
    - p1.z * (p2.x - p1.x) * (p3.y - p1.y)
    + p1.z * (p2.y - p1.y) * (p3.x - p1.x)
    + p1.y * (p2.x - p1.x) * (p3.z - p1.z)
    + p1.x * (p2.z - p1.z) * (p3.y - p1.y);
  return [A, B, C, D];
}

/** vw_RotatePoint */
export function rotatePoint(p: Vec3, angle: Vec3): void {
  let tx = p.x, ty = p.y, tz = p.z;
  if (angle.x !== 0) {
    const a = -angle.x * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    p.y = ty * c + tz * s;
    p.z = -ty * s + tz * c;
    tx = p.x; ty = p.y; tz = p.z;
  }
  if (angle.y !== 0) {
    const a = angle.y * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    p.x = tx * c + tz * s;
    p.z = -tx * s + tz * c;
    tx = p.x; ty = p.y;
  }
  if (angle.z !== 0) {
    const a = -angle.z * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    p.x = tx * c + ty * s;
    p.y = -tx * s + ty * c;
  }
}

/** vw_RotatePointInv */
export function rotatePointInv(p: Vec3, angle: Vec3): void {
  let tx = p.x, ty = p.y, tz = p.z;
  if (angle.z !== 0) {
    const a = -angle.z * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    p.x = tx * c + ty * s;
    p.y = -tx * s + ty * c;
    tx = p.x; ty = p.y; tz = p.z;
  }
  if (angle.y !== 0) {
    const a = angle.y * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    p.x = tx * c + tz * s;
    p.z = -tx * s + tz * c;
    ty = p.y; tz = p.z;
  }
  if (angle.x !== 0) {
    const a = -angle.x * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    p.y = ty * c + tz * s;
    p.z = -ty * s + tz * c;
  }
}

export type Mat33 = Float64Array;
export type Mat44 = Float64Array;

export const mat33 = (): Mat33 => new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
export const mat44 = (): Mat44 => new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

export function m33Identity(m: Mat33): void {
  m.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
}

/** vw_Matrix33Mult: Dst = Src * Dst */
export function m33Mult(d: Mat33, s: Mat33): void {
  const t0 = d[0], t1 = d[1], t2 = d[2], t3 = d[3], t4 = d[4], t5 = d[5], t6 = d[6], t7 = d[7], t8 = d[8];
  d[0] = s[0] * t0 + s[1] * t3 + s[2] * t6;
  d[1] = s[0] * t1 + s[1] * t4 + s[2] * t7;
  d[2] = s[0] * t2 + s[1] * t5 + s[2] * t8;
  d[3] = s[3] * t0 + s[4] * t3 + s[5] * t6;
  d[4] = s[3] * t1 + s[4] * t4 + s[5] * t7;
  d[5] = s[3] * t2 + s[4] * t5 + s[5] * t8;
  d[6] = s[6] * t0 + s[7] * t3 + s[8] * t6;
  d[7] = s[6] * t1 + s[7] * t4 + s[8] * t7;
  d[8] = s[6] * t2 + s[7] * t5 + s[8] * t8;
}

export function m33CreateRotate(m: Mat33, angle: Vec3): void {
  if (angle.z !== 0 && angle.x === 0 && angle.y === 0) {
    const a = -angle.z * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    m[0] = c; m[1] = -s; m[3] = s; m[4] = c;
    m[2] = m[5] = m[6] = m[7] = 0; m[8] = 1;
  } else if (angle.y !== 0 && angle.x === 0 && angle.z === 0) {
    const a = -angle.y * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    m[0] = c; m[2] = s; m[6] = -s; m[8] = c;
    m[1] = m[3] = m[5] = m[7] = 0; m[4] = 1;
  } else if (angle.x !== 0 && angle.y === 0 && angle.z === 0) {
    const a = -angle.x * DEG2RAD, c = Math.cos(a), s = Math.sin(a);
    m[4] = c; m[5] = -s; m[7] = s; m[8] = c;
    m[1] = m[2] = m[3] = m[6] = 0; m[0] = 1;
  } else {
    let a = -angle.x * DEG2RAD;
    const A = Math.cos(a), B = Math.sin(a);
    a = -angle.y * DEG2RAD;
    const C = Math.cos(a), D = Math.sin(a);
    a = -angle.z * DEG2RAD;
    const E = Math.cos(a), F = Math.sin(a);
    const AD = A * D, BD = B * D;
    m[0] = C * E; m[1] = -C * F; m[2] = D;
    m[3] = BD * E + A * F; m[4] = -BD * F + A * E; m[5] = -B * C;
    m[6] = -AD * E + B * F; m[7] = AD * F + B * E; m[8] = A * C;
  }
}

export function m33InverseRotate(m: Mat33): void {
  const t1 = m[1], t2 = m[2], t5 = m[5];
  m[1] = m[3]; m[2] = m[6]; m[3] = t1; m[5] = m[7]; m[6] = t2; m[7] = t5;
}

export function m33CalcPoint(p: Vec3, m: Mat33): void {
  const x = p.x, y = p.y, z = p.z;
  p.x = m[0] * x + m[3] * y + m[6] * z;
  p.y = m[1] * x + m[4] * y + m[7] * z;
  p.z = m[2] * x + m[5] * y + m[8] * z;
}

export function m44Identity(m: Mat44): void {
  m.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function m44Mult(d: Mat44, s: Mat44): void {
  const t = Float64Array.from(d);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      d[r * 4 + c] = s[r * 4] * t[c] + s[r * 4 + 1] * t[4 + c] + s[r * 4 + 2] * t[8 + c] + s[r * 4 + 3] * t[12 + c];
    }
  }
}

export function m44Translate(m: Mat44, l: Vec3): void {
  m[12] += l.x; m[13] += l.y; m[14] += l.z;
}

export function m44CreateRotate(m: Mat44, angle: Vec3): void {
  const r = mat33();
  m33CreateRotate(r, angle);
  m[0] = r[0]; m[1] = r[1]; m[2] = r[2]; m[3] = 0;
  m[4] = r[3]; m[5] = r[4]; m[6] = r[5]; m[7] = 0;
  m[8] = r[6]; m[9] = r[7]; m[10] = r[8]; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
}

export function m44InverseRotate(m: Mat44): void {
  const t = Float64Array.from(m);
  m[1] = t[4]; m[2] = t[8]; m[4] = t[1]; m[6] = t[9]; m[8] = t[2]; m[9] = t[6];
  m[12] = -t[12] * t[0] - t[13] * t[1] - t[14] * t[2];
  m[13] = -t[12] * t[4] - t[13] * t[5] - t[14] * t[6];
  m[14] = -t[12] * t[8] - t[13] * t[9] - t[14] * t[10];
}

export function m44CalcPoint(p: Vec3, m: Mat44): void {
  const x = p.x, y = p.y, z = p.z;
  p.x = m[0] * x + m[4] * y + m[8] * z + m[12];
  p.y = m[1] * x + m[5] * y + m[9] * z + m[13];
  p.z = m[2] * x + m[6] * y + m[10] * z + m[14];
}

/** hash_djb2a / constexpr_hash_djb2a (32-bit unsigned) */
export function hashDjb2a(str: string): number {
  const b = new TextEncoder().encode(str);
  let h = 5381;
  for (let i = b.length - 1; i >= 0; i--) {
    // the char is signed on x86 (static_cast<unsigned>(char) sign-extends)
    const c = b[i] >= 128 ? (b[i] - 256) >>> 0 : b[i];
    h = ((Math.imul(h, 33) >>> 0) ^ c) >>> 0;
  }
  return h;
}

/*
 * Random numbers (rand.cpp): std::default_random_engine is libstdc++'s minstd_rand0 (16807 mod
 * 2^31-1), seeded by std::random_device in the original; vw_fRand is
 * std::generate_canonical<float, 10>, one draw: (g - 1) / 2147483646, rounded to float, and
 * nextafter(1, 0) if that rounds up to 1.
 */
export class Minstd0 {
  state: number;
  constructor(seed = 1) {
    this.state = 0;
    this.seed(seed);
  }
  seed(s: number): void {
    let v = s % 2147483647;
    if (v < 0) v += 2147483647;
    this.state = v === 0 ? 1 : v;
  }
  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return this.state;
  }
}

const ONE_BELOW = Math.fround(1 - 2 ** -24);

export const rng = new Minstd0((Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0);

export function fRand(): number {
  const r = Math.fround(Math.fround(rng.next() - 1) / 2147483648);
  return r >= 1 ? ONE_BELOW : r;
}

export function fRandNum(max: number): number {
  return fRand() * max;
}

export function uRandNum(max: number): number {
  return Math.floor(fRand() * (max + 1));
}

export function fRand0(): number {
  return fRand() - fRand();
}
