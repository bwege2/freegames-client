// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: base/vmath.h and base/math.h of Teeworlds 0.7.5 in TypeScript.
//
// The original computes in IEEE single precision (float, SSE without FMA). JavaScript numbers are doubles, so
// every float operation is rounded with f() (Math.fround) right where C rounds: a double result of one +, -, *,
// / or sqrt rounded to float is the float result, so f(f(a) * f(b)) is exactly C's a*b in float. Values that
// C keeps in a float are always stored rounded. The libm float functions are the double ones rounded (FMath in
// the Java port does the same; re/teeworlds/NOTES.md has the check against glibc), but for powf, which is
// glibc's own algorithm (powf.ts).

export const f = Math.fround;

/** vector2_base<float>, immutable; its components are floats */
export class vec2 {
  readonly x: number;
  readonly y: number;
  constructor(x: number, y: number) {
    this.x = f(x);
    this.y = f(y);
  }
  neg(): vec2 { return new vec2(-this.x, -this.y); }
  sub(v: vec2): vec2 { return new vec2(this.x - v.x, this.y - v.y); }
  add(v: vec2): vec2 { return new vec2(this.x + v.x, this.y + v.y); }
  /** vec*float (s must be a float value) */
  mul(s: number): vec2 { return new vec2(this.x * s, this.y * s); }
  mulv(v: vec2): vec2 { return new vec2(this.x * v.x, this.y * v.y); }
  div(s: number): vec2 { return new vec2(this.x / s, this.y / s); }
  withX(x: number): vec2 { return new vec2(x, this.y); }
  withY(y: number): vec2 { return new vec2(this.x, y); }
  equals(v: vec2): boolean { return this.x === v.x && this.y === v.y; }
}

export const ZERO = new vec2(0, 0);

export function sqrtf(x: number): number { return f(Math.sqrt(x)); }
export function atan2f(y: number, x: number): number { return f(Math.atan2(y, x)); }
export function sinf(x: number): number { return f(Math.sin(x)); }
export function cosf(x: number): number { return f(Math.cos(x)); }
export { powf } from './powf.ts';
export function floorf(x: number): number { return f(Math.floor(x)); }

export function length(a: vec2): number { return sqrtf(f(f(a.x * a.x) + f(a.y * a.y))); }
export function distance(a: vec2, b: vec2): number { return length(a.sub(b)); }
export function dot(a: vec2, b: vec2): number { return f(f(a.x * b.x) + f(a.y * b.y)); }
export function angle(a: vec2): number { return atan2f(a.y, a.x); }
export function normalize(v: vec2): vec2 {
  const l = f(1 / sqrtf(f(f(v.x * v.x) + f(v.y * v.y))));
  return new vec2(v.x * l, v.y * l);
}
export function direction(a: number): vec2 { return new vec2(cosf(a), sinf(a)); }
/** mix(vec2, vec2, float) */
export function mixv(a: vec2, b: vec2, amount: number): vec2 { return a.add(b.sub(a).mul(amount)); }
/** mix(float, float, float) */
export function mix(a: number, b: number, amount: number): number { return f(a + f(f(b - a) * amount)); }
export function closest_point_on_line(p0: vec2, p1: vec2, t: vec2): vec2 {
  const c = t.sub(p0);
  let v = p1.sub(p0);
  v = normalize(v);
  const d = length(p0.sub(p1));
  const tt = f(dot(v, c) / d);
  return mixv(p0, p1, clamp(tt, 0, 1));
}
/** rotate(vec2, float degrees) */
export function rotate(a: vec2, ang: number): vec2 {
  ang = f(f(f(ang * pi) / 180));
  const s = sinf(ang);
  const c = cosf(ang);
  return new vec2(f(c * a.x) - f(s * a.y), f(s * a.x) + f(c * a.y));
}

// ---------------------------------------------------------------- base/math.h

export function clamp(v: number, min: number, max: number): number { return v < min ? min : v > max ? max : v; }
export function sign(v: number): number { return v < 0 ? -1 : 1; }
/** (int) of a float: C's truncation toward zero */
export function toInt(v: number): number {
  if (v !== v) return 0;
  return Math.trunc(v) | 0;
}
export function round_to_int(v: number): number {
  if (v > 0) return toInt(f(v + 0.5));
  return toInt(f(v - 0.5));
}
export function absolute(a: number): number { return a < 0 ? -a : a; }
export function f2fx(v: number): number { return toInt(f(v * 1024)); }
export function fx2f(v: number): number { return f(v * f(1 / 1024)); }
export function i2fx(v: number): number { return v << 10; }
export function fx2i(v: number): number { return v >> 10; }
/** C's integer division (truncating) of ints */
export function idiv(a: number, b: number): number { return Math.trunc(a / b) | 0; }
/** C's % of ints */
export function imod(a: number, b: number): number { return a % b | 0; }

export const pi = f(3.1415926535897932384626433);

/** bezier(p0..p3, amount) for floats */
export function bezier(p0: number, p1: number, p2: number, p3: number, amount: number): number {
  const c10 = mix(p0, p1, amount);
  const c11 = mix(p1, p2, amount);
  const c12 = mix(p2, p3, amount);
  const c20 = mix(c10, c11, amount);
  const c21 = mix(c11, c12, amount);
  return mix(c20, c21, amount);
}

/** vector3/vector4 helpers the client uses (colors) */
export interface vec3 { x: number; y: number; z: number }
export interface vec4 { r: number; g: number; b: number; a: number }
