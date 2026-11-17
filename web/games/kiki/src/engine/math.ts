// kodilib's KVector and KQuaternion (kodilib/src/types/KVector.h, KQuaternion.h) and kiki's KikiPos
// (src/base/KikiPos.h). Same operations and the same formulas; doubles instead of the original's floats.

export const DEG2RAD = (d: number): number => (d * Math.PI) / 180;
export const RAD2DEG = (r: number): number => (r * 180) / Math.PI;

/** C rint(): round half to even (the default rounding mode) */
export function rint(v: number): number {
  const f = Math.floor(v);
  const d = v - f;
  if (d > 0.5) return f + 1;
  if (d < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}

export class KVector {
  public x: number;
  public y: number;
  public z: number;
  public w: number;
  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static of(v: { x: number; y: number; z: number }): KVector { return new KVector(v.x, v.y, v.z); }

  clone(): KVector { return new KVector(this.x, this.y, this.z, this.w); }
  reset(): this { this.x = this.y = this.z = this.w = 0; return this; }
  set(v: KVector): this { this.x = v.x; this.y = v.y; this.z = v.z; this.w = v.w; return this; }
  add(v: KVector | KikiPos): KVector { return new KVector(this.x + v.x, this.y + v.y, this.z + v.z, this.w + ((v as KVector).w ?? 0)); }
  sub(v: KVector | KikiPos): KVector { return new KVector(this.x - v.x, this.y - v.y, this.z - v.z, this.w - ((v as KVector).w ?? 0)); }
  mul(f: number): KVector { return new KVector(this.x * f, this.y * f, this.z * f, this.w * f); }
  div(f: number): KVector { return new KVector(this.x / f, this.y / f, this.z / f, this.w / f); }
  neg(): KVector { return new KVector(-this.x, -this.y, -this.z, -this.w); }
  /** operator* (dot product, w included) */
  dot(v: KVector): number { return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w; }
  cross(v: KVector): KVector {
    return new KVector(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
  }
  length(): number { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w); }
  normalize(): this {
    let l = this.length();
    if (l !== 0) {
      l = 1 / l;
      this.x *= l; this.y *= l; this.z *= l; this.w *= l;
    }
    return this;
  }
  normal(): KVector { return this.clone().normalize(); }
  round(): KVector { return new KVector(rint(this.x), rint(this.y), rint(this.z), this.w); }
  /** `v != KVector()` and `v == u` in the original compare as KQuaternions (w = 0, x, y, z) */
  isZero(): boolean { return this.x === 0 && this.y === 0 && this.z === 0; }
  equals(v: KVector): boolean { return this.x === v.x && this.y === v.y && this.z === v.z; }
  perpendicular(n: KVector): KVector {
    const dot = this.x * n.x + this.y * n.y + this.z * n.z;
    return new KVector(this.x - dot * n.x, this.y - dot * n.y, this.z - dot * n.z);
  }
}

export class KQuaternion {
  public w: number;
  public x: number;
  public y: number;
  public z: number;
  constructor(w = 1, x = 0, y = 0, z = 0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static fromVector(v: KVector): KQuaternion { return new KQuaternion(0, v.x, v.y, v.z); }

  static rotationAroundVector(theta: number, vector: KVector): KQuaternion {
    const v = vector.clone().normalize();
    const t = DEG2RAD(theta) / 2;
    const s = Math.sin(t);
    return new KQuaternion(Math.cos(t), v.x * s, v.y * s, v.z * s).normalize();
  }

  clone(): KQuaternion { return new KQuaternion(this.w, this.x, this.y, this.z); }
  set(q: KQuaternion): this { this.w = q.w; this.x = q.x; this.y = q.y; this.z = q.z; return this; }
  reset(): this { this.w = 1; this.x = this.y = this.z = 0; return this; }
  normalize(): this {
    const l = Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
    if (l !== 0) { this.w /= l; this.x /= l; this.y /= l; this.z /= l; }
    return this;
  }
  conjugate(): this { this.x = -this.x; this.y = -this.y; this.z = -this.z; return this; }
  getConjugate(): KQuaternion { return this.clone().conjugate(); }

  /** operator*= (the original's eight-multiplication form) */
  mulSelf(q: KQuaternion): this {
    const { w, x, y, z } = this;
    const A = (w + x) * (q.w + q.x);
    const B = (z - y) * (q.y - q.z);
    const C = (w - x) * (q.y + q.z);
    const D = (y + z) * (q.w - q.x);
    const E = (x + z) * (q.x + q.y);
    const F = (x - z) * (q.x - q.y);
    const G = (w + y) * (q.w - q.z);
    const H = (w - y) * (q.w + q.z);
    this.w = B + (-E - F + G + H) / 2;
    this.x = A - (E + F + G + H) / 2;
    this.y = C + (E - F + G - H) / 2;
    this.z = D + (E - F - G + H) / 2;
    return this;
  }
  mul(q: KQuaternion): KQuaternion { return this.clone().mulSelf(q); }

  rotate(v: KVector): KVector {
    const r = this.mul(KQuaternion.fromVector(v)).mulSelf(this.getConjugate());
    return new KVector(r.x, r.y, r.z);
  }
}

export class KikiPos {
  public x: number;
  public y: number;
  public z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /** KikiPos(const KVector &): rint of each component */
  static fromVector(v: KVector): KikiPos { return new KikiPos(rint(v.x), rint(v.y), rint(v.z)); }

  clone(): KikiPos { return new KikiPos(this.x, this.y, this.z); }
  add(p: KikiPos): KikiPos { return new KikiPos(this.x + p.x, this.y + p.y, this.z + p.z); }
  sub(p: KikiPos): KikiPos { return new KikiPos(this.x - p.x, this.y - p.y, this.z - p.z); }
  equals(p: KikiPos): boolean { return this.x === p.x && this.y === p.y && this.z === p.z; }
  toVector(): KVector { return new KVector(this.x, this.y, this.z); }
  toString(): string { return `[${this.x} ${this.y} ${this.z}]`; }
}

// kodilib's macros (KVector.h)
export const kMin = (a: number, b: number): number => (a <= b ? a : b);
export const kMax = (a: number, b: number): number => (a >= b ? a : b);
export const kMinMax = (a: number, b: number, c: number): number => kMax(a, kMin(b, c));
export const kAbs = (d: number): number => (d >= 0 ? d : -d);
export const kAbsMin = (a: number, b: number): number => (kAbs(a) < kAbs(b) ? a : b);

/** src/base/KikiTools.cpp kRayPlaneIntersectionFactor (division by zero gives ±Infinity, as in C) */
export function kRayPlaneIntersectionFactor(rayPos: KVector, rayDir: KVector, planePos: KVector, planeNormal: KVector): number {
  return planePos.sub(rayPos).dot(planeNormal) / rayDir.dot(planeNormal);
}
