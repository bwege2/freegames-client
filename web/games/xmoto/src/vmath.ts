// X-Moto's Vector2f (helpers/VMath.h, a Vector2<float>) and the intersection helpers of helpers/VMath.cpp,
// with C++'s float/double rules: every float result is rounded with Math.fround, expressions that the
// original computes in double (mixed with double constants or variables) are left in double.
export const f = Math.fround;

export interface Vec2 { x: number; y: number }

export const v2 = (x: number, y: number): Vec2 => ({ x: f(x), y: f(y) });
export const vadd = (a: Vec2, b: Vec2): Vec2 => ({ x: f(a.x + b.x), y: f(a.y + b.y) });
export const vsub = (a: Vec2, b: Vec2): Vec2 => ({ x: f(a.x - b.x), y: f(a.y - b.y) });
/** operator*(float): the scalar is converted to float first */
export const vmul = (a: Vec2, s: number): Vec2 => { const k = f(s); return { x: f(a.x * k), y: f(a.y * k) }; };
export const vdot = (a: Vec2, b: Vec2): number => f(f(a.x * b.x) + f(a.y * b.y));
/** length(): sqrt(float) in float */
export const vlen = (a: Vec2): number => f(Math.sqrt(f(f(a.x * a.x) + f(a.y * a.y))));
/** normalize(): returns the length; throws on a null vector like the original */
export function vnormalize(a: Vec2): number {
  const v = vlen(a);
  if (v === 0) throw new Error('null vector normalize');
  a.x = f(a.x / v);
  a.y = f(a.y / v);
  return v;
}
export const VECTOR_COMPARE_EPSILON = f(0.001);
export function almostEqual(a: Vec2, b: Vec2): boolean {
  if (Math.abs(f(b.x - a.x)) >= VECTOR_COMPARE_EPSILON) return false;
  if (Math.abs(f(b.y - a.y)) >= VECTOR_COMPARE_EPSILON) return false;
  return true;
}

const EPS4 = f(0.0001);

/** intersectLineCircle2f (VMath.cpp): 0, 1 or 2 intersections, written to res1/res2 */
export function intersectLineCircle2f(Cp: Vec2, Cr: number, A0: Vec2, A1: Vec2, res1: Vec2, res2: Vec2): number {
  let line0 = A1, line1 = A0;
  const c0x = f(Cp.x - Cr), c0y = f(Cp.y - Cr), c1x = f(Cp.x + Cr), c1y = f(Cp.y + Cr);
  let inversed = true;
  if (A0.x < A1.x) { line0 = A0; line1 = A1; inversed = false; }
  if (line1.x < c0x || line0.x > c1x) return 0;
  if (A0.y < A1.y) {
    if (inversed) { line0 = A0; line1 = A1; }
  } else if (!inversed) { line0 = A1; line1 = A0; }
  if (line1.y < c0y || line0.y > c1y) return 0;

  const rd = vsub(A1, A0);
  if (almostEqual(A1, A0)) return 0;
  const rl = vnormalize(rd);
  const v = vsub(A0, Cp);
  const b = -vdot(v, rd);
  let det = b * b - vdot(v, v) + f(Cr * Cr);
  if (det < 0 && det > -EPS4) det = 0;
  if (det >= 0) {
    det = Math.sqrt(det);
    const i1 = b - det;
    const i2 = b + det;
    const hi = rl + EPS4;
    if (i1 > -EPS4 && i1 < hi && i2 > -EPS4 && i2 < hi) {
      const p1 = vadd(A0, vmul(rd, i1)), p2 = vadd(A0, vmul(rd, i2));
      res1.x = p1.x; res1.y = p1.y; res2.x = p2.x; res2.y = p2.y;
      return 2;
    } else if (i1 > -EPS4 && i1 < hi) {
      const p1 = vadd(A0, vmul(rd, i1));
      res1.x = p1.x; res1.y = p1.y;
      return 1;
    } else if (i2 > -EPS4 && i2 < hi) {
      const p1 = vadd(A0, vmul(rd, i2));
      res1.x = p1.x; res1.y = p1.y;
      return 1;
    }
  }
  return 0;
}

/** intersectLineLine2f (VMath.cpp) */
export function intersectLineLine2f(A0: Vec2, A1: Vec2, B0: Vec2, B1: Vec2, res: Vec2): number {
  if (almostEqual(A0, A1) || almostEqual(B0, B1)) return 0;
  let l10 = A1, l11 = A0, l20 = B1, l21 = B0;
  let ainv = true, binv = true;
  if (A0.x < A1.x) { l10 = A0; l11 = A1; ainv = false; }
  if (B0.x < B1.x) { l20 = B0; l21 = B1; binv = false; }
  if (l11.x < l20.x || l10.x > l21.x) return 0;
  if (A0.y < A1.y) { if (ainv) { l10 = A0; l11 = A1; } } else if (!ainv) { l10 = A1; l11 = A0; }
  if (B0.y < B1.y) { if (binv) { l20 = B0; l21 = B1; } } else if (!binv) { l20 = B1; l21 = B0; }
  if (l11.y < l20.y || l10.y > l21.y) return 0;

  let P = B0;
  let N = v2(-f(B1.y - B0.y), f(B1.x - B0.x));
  let den = vdot(N, vsub(A1, A0));
  if (Math.abs(den) < EPS4) return 0;
  let t = f(f(vdot(P, N) - vdot(A0, N)) / den);
  if (t < 0 || t > 1) return 0;
  P = A0;
  N = v2(-f(A1.y - A0.y), f(A1.x - A0.x));
  den = vdot(N, vsub(B1, B0));
  if (Math.abs(den) < EPS4) return 0;
  t = f(f(vdot(P, N) - vdot(B0, N)) / den);
  if (t < 0 || t > 1) return 0;
  const r = vadd(B0, vmul(vsub(B1, B0), t));
  res.x = r.x; res.y = r.y;
  return 1;
}

/** circleTouchCircle2f (VMath.h) */
export function circleTouchCircle2f(c1: Vec2, r1: number, c2: Vec2, r2: number): boolean {
  let xs = f(c2.x - c1.x); xs = f(xs * xs);
  let ys = f(c2.y - c1.y); ys = f(ys * ys);
  let rr = f(r1 + r2); rr = f(rr * rr);
  return f(xs + ys) <= rr;
}

const BIG_VALUE = f(99999999.0);

/** AABB (VMath.cpp) */
export class AABB {
  minX = BIG_VALUE; minY = BIG_VALUE; maxX = -BIG_VALUE; maxY = -BIG_VALUE;
  reset(): void { this.minX = this.minY = BIG_VALUE; this.maxX = this.maxY = -BIG_VALUE; }
  addPoint(x: number, y: number): void {
    if (x < this.minX) this.minX = x;
    if (y < this.minY) this.minY = y;
    if (x > this.maxX) this.maxX = x;
    if (y > this.maxY) this.maxY = y;
  }
  translate(x: number, y: number): void {
    this.minX = f(this.minX + x); this.maxX = f(this.maxX + x);
    this.minY = f(this.minY + y); this.maxY = f(this.maxY + y);
  }
}

/** BoundingCircle (VMath.cpp) */
export class BoundingCircle {
  cx = 0; cy = 0; r = 0;
  xmin = BIG_VALUE; ymin = BIG_VALUE; xmax = -BIG_VALUE; ymax = -BIG_VALUE;
  aabb = new AABB();
  reset(): void {
    this.cx = this.cy = this.r = 0;
    this.xmin = this.ymin = BIG_VALUE; this.xmax = this.ymax = -BIG_VALUE;
  }
  init(cx: number, cy: number, r: number): void {
    this.cx = cx; this.cy = cy; this.r = r;
    this.aabb.reset();
    this.aabb.addPoint(f(cx + r), f(cy + r));
    this.aabb.addPoint(f(cx - r), f(cy - r));
  }
  translate(x: number, y: number): void {
    this.cx = f(this.cx + x); this.cy = f(this.cy + y);
    this.aabb.translate(x, y);
  }
  addPoint(x: number, y: number): void {
    if (x < this.xmin) this.xmin = x;
    if (x > this.xmax) this.xmax = x;
    if (y < this.ymin) this.ymin = y;
    if (y > this.ymax) this.ymax = y;
  }
  calculate(): void {
    const cx = f(f(this.xmin + this.xmax) / 2.0);
    const cy = f(f(this.ymin + this.ymax) / 2.0);
    const tx = f(f(this.xmax - this.xmin) / 2.0);
    const ty = f(f(this.ymax - this.ymin) / 2.0);
    const radius = f(f(tx + ty) - Math.min(tx, ty) / 2.0);
    this.init(cx, cy, radius);
  }
}
