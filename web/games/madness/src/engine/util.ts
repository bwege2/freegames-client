// Madness Interactive Reloaded port (GPL-3.0). Walgelijk's Utilities (Walgelijk/Shared/Utilities.cs),
// Easings (Shared/Easings.cs), Curve<T> (Shared/Curve.cs) and System.Numerics.Vector2 as plain functions.
// World space is Walgelijk's: x to the right, y up, angles in degrees counter-clockwise.

export interface Vec2 { x: number; y: number }
export const v2 = (x = 0, y = 0): Vec2 => ({ x, y });
export const ZERO: Readonly<Vec2> = Object.freeze(v2());
export const ONE: Readonly<Vec2> = Object.freeze(v2(1, 1));
export const add = (a: Vec2, b: Vec2): Vec2 => v2(a.x + b.x, a.y + b.y);
export const sub = (a: Vec2, b: Vec2): Vec2 => v2(a.x - b.x, a.y - b.y);
export const mul = (a: Vec2, s: number): Vec2 => v2(a.x * s, a.y * s);
export const mulv = (a: Vec2, b: Vec2): Vec2 => v2(a.x * b.x, a.y * b.y);
export const divv = (a: Vec2, b: Vec2): Vec2 => v2(a.x / b.x, a.y / b.y);
export const neg = (a: Vec2): Vec2 => v2(-a.x, -a.y);
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const len = (a: Vec2): number => Math.hypot(a.x, a.y);
export const lenSq = (a: Vec2): number => a.x * a.x + a.y * a.y;
export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
export const distSq = (a: Vec2, b: Vec2): number => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const copy = (a: Vec2): Vec2 => v2(a.x, a.y);
/** Vector2.Normalize: (0,0) gives NaN like .NET */
export const normalize = (a: Vec2): Vec2 => { const l = len(a); return v2(a.x / l, a.y / l); };
export const nanFallback = (n: number, fb = 0): number => (Number.isNaN(n) ? fb : n);
export const nanFallbackV = (a: Vec2): Vec2 => v2(nanFallback(a.x), nanFallback(a.y));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const lerpV = (a: Vec2, b: Vec2, t: number): Vec2 => v2(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
export const clamp = (x: number, min = 0, max = 1): number => Math.max(min, Math.min(x, max));
export const mod = (a: number, b: number): number => a - Math.floor(a / b) * b;
export const deltaAngle = (source: number, target: number): number => mod(target - source + 180, 360) - 180;
export const lerpAngle = (a: number, b: number, t: number): number => a + deltaAngle(a, b) * t;
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
export const angleToVector = (deg: number): Vec2 => v2(Math.cos(deg * DEG2RAD), Math.sin(deg * DEG2RAD));
export const vectorToAngle = (a: Vec2): number => Math.atan2(a.y, a.x) * RAD2DEG;
export function rotatePoint(p: Vec2, deg: number, origin: Vec2 = ZERO): Vec2 {
  const r = deg * DEG2RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const x = p.x - origin.x;
  const y = p.y - origin.y;
  return v2(x * c - y * s + origin.x, x * s + y * c + origin.y);
}
export const mapRange = (a1: number, a2: number, b1: number, b2: number, s: number): number => b1 + (s - a1) * (b2 - b1) / (a2 - a1);
/** Utilities.SmoothApproach(past, target, speed, dt) */
export function smoothApproach(past: number, target: number, speed: number, dt: number): number {
  const t = dt * speed;
  return nanFallback(target + (past - target) * Math.exp(-t));
}
export const smoothApproachV = (past: Vec2, target: Vec2, speed: number, dt: number): Vec2 =>
  v2(smoothApproach(past.x, target.x, speed, dt), smoothApproach(past.y, target.y, speed, dt));
export const sign = (x: number): number => (x > 0 ? 1 : x < 0 ? -1 : 0);
/** Utilities.SmoothAngleApproach(past, target, speed, dt) */
export const smoothAngleApproach = (past: number, target: number, speed: number, dt: number): number =>
  nanFallback(target + deltaAngle(target, past) * Math.exp(-dt * speed));
/** float.Round: to even */
export function roundEven(x: number): number {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}
/** Utilities.Snap */
export const snap = (x: number, size: number): number => roundEven(x / size) * size;
/** Vector2.Reflect */
export const reflect = (v: Vec2, n: Vec2): Vec2 => { const d = 2 * (v.x * n.x + v.y * n.y); return { x: v.x - d * n.x, y: v.y - d * n.y }; };

export const Easings = {
  quadInOut(x: number): number { const a = -2 * x + 2; return x < 0.5 ? 2 * x * x : 1 - (a * a) / 2; },
  quadIn: (x: number): number => x * x,
  quadOut: (x: number): number => 1 - (1 - x) * (1 - x),
  cubicInOut(x: number): number { const a = -2 * x + 2; return x < 0.5 ? 4 * x * x * x : 1 - (a * a * a) / 2; },
  cubicIn: (x: number): number => x * x * x,
  cubicOut: (x: number): number => 1 - (1 - x) ** 3,
  circInOut(x: number): number {
    if (x < 0.5) return (1 - Math.sqrt(1 - (2 * x * 2 * x))) / 2;
    return (Math.sqrt(1 - ((-2 * x + 2) * (-2 * x + 2))) + 1) / 2;
  },
  circIn: (x: number): number => 1 - Math.sqrt(1 - x * x),
  circOut: (x: number): number => Math.sqrt(1 - (1 - x) * (1 - x)),
  expoOut: (x: number): number => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
};

/** Curve<T>.Evaluate with keys in file order (AnimationDeserialiser.AppendKey does not sort) */
export interface Key<T> { value: T; position: number }
export function evalCurve<T>(keys: Key<T>[], t: number, lerpFn: (a: T, b: T, t: number) => T, dflt: T): T {
  if (keys.length === 0) return dflt;
  if (keys.length === 1) return keys[0].value;
  if (keys[0].position > t) return keys[0].value;
  if (keys[keys.length - 1].position < t) return keys[keys.length - 1].value;
  let prev: Key<T> | null = null;
  let next: Key<T> | null = null;
  for (const k of keys) {
    if (Math.abs(t - k.position) <= 1.401298464324817e-45) return k.value;
    if (k.position <= t) { prev = k; next = k; } else if (k.position >= t) { next = k; break; }
  }
  if (prev && !next) return prev.value;
  if (!prev && next) return next.value;
  if (!prev || !next) return dflt;
  return lerpFn(prev.value, next.value, mapRange(prev.position, next.position, 0, 1, t));
}

/** A Rect as Walgelijk has it (MinX, MinY, MaxX, MaxY) */
export interface Rect { minX: number; minY: number; maxX: number; maxY: number }
export const rect = (minX: number, minY: number, maxX: number, maxY: number): Rect => ({ minX, minY, maxX, maxY });
export const rectCenter = (r: Rect): Vec2 => v2((r.minX + r.maxX) / 2, (r.minY + r.maxY) / 2);
export const rectContains = (r: Rect, p: Vec2): boolean => p.x >= r.minX && p.x <= r.maxX && p.y >= r.minY && p.y <= r.maxY;
export const rectWidth = (r: Rect): number => r.maxX - r.minX;
export const rectHeight = (r: Rect): number => r.maxY - r.minY;

/** The game's random numbers (Walgelijk's Utilities share one System.Random); seedable for the tests */
export class Rng {
  private s: number;
  constructor(seed = (Math.random() * 2 ** 32) >>> 0) { this.s = seed >>> 0 || 1; }
  /** xorshift32 in [0, 1) */
  next(): number {
    let x = this.s;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    this.s = x;
    return x / 4294967296;
  }
  seed(s: number): void { this.s = s >>> 0 || 1; }
}
export const rng = new Rng();
/** Utilities.RandomFloat(min, max) */
export const randomFloat = (min = 0, max = 1): number => lerp(min, max, rng.next());
/** Utilities.RandomInt(min, max): max exclusive */
export const randomInt = (min: number, max: number): number => min + Math.floor(rng.next() * (max - min));
export const pickRandom = <T>(items: readonly T[]): T => items[randomInt(0, items.length)];
export const pickRandom2 = <T>(a: T, b: T): T => (randomFloat() > 0.5 ? a : b);
export function randomPointInCircle(minR = 0, maxR = 1): Vec2 {
  const p = normalize(v2(randomFloat(-1, 1), randomFloat(-1, 1)));
  return mul(p, randomFloat(minR, maxR));
}
