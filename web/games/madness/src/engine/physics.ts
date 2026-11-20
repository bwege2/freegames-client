// Madness Interactive Reloaded port (GPL-3.0). The queries of Walgelijk.Physics (PhysicsSystem.Raycast,
// QueryPoint, QueryCircle) over its three colliders: RectangleCollider (an oriented box through a transform),
// LineCollider (a segment with a width) and CircleCollider. The original walks its chunk grid; the result is the
// same nearest boundary intersection ahead of the origin, so this tests every body.
import { transformPoint, transformNormal, type Mat, invert } from './matrix.ts';
import { dot, normalize, sub, v2, type Vec2, add, mul, len } from './util.ts';

export const Layers = {
  None: 0,
  Default: 1,
  BlockPhysics: 2,
  BlockMovement: 4,
  BlockBullets: 8,
  DecalZone: 16,
  CharacterStart: 16,
  BlockAll: 2 | 4 | 8,
  All: 0xffffffff,
  AllCharacters: (0xffffffff & ~(2 | 4 | 8) & ~16) >>> 0,
} as const;

export interface Body {
  /** what this body belongs to (a wall, a body part); queries return it */
  owner: unknown;
  filterBits: number;
  collider: Collider;
}

export type Collider =
  | { kind: 'rect'; /** local unit square scaled by size, through this matrix */ matrix: () => Readonly<Mat>; size: number }
  | { kind: 'aabb'; minX: number; minY: number; maxX: number; maxY: number }
  | { kind: 'line'; a: Vec2; b: Vec2; radius: number }
  | { kind: 'circle'; center: () => Vec2; radius: number };

export interface RayHit { body: Body; position: Vec2; normal: Vec2; distance: number }

function rayAabb(o: Vec2, d: Vec2, minX: number, minY: number, maxX: number, maxY: number, out: { t: number; n: Vec2 }[]): void {
  // every boundary crossing (entry and exit), like Collider.GetLineIntersections
  const edges: [number, number, number, number, Vec2][] = [
    [minX, minY, maxX, minY, v2(0, -1)], [maxX, minY, maxX, maxY, v2(1, 0)],
    [maxX, maxY, minX, maxY, v2(0, 1)], [minX, maxY, minX, minY, v2(-1, 0)],
  ];
  for (const [ax, ay, bx, by, n] of edges) {
    const t = segIntersect(o, d, v2(ax, ay), v2(bx, by));
    if (t !== null) out.push({ t, n });
  }
}

/** ray o + t*d against segment a-b: t or null */
function segIntersect(o: Vec2, d: Vec2, a: Vec2, b: Vec2): number | null {
  const ex = b.x - a.x;
  const ey = b.y - a.y;
  const den = d.x * ey - d.y * ex;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((a.x - o.x) * ey - (a.y - o.y) * ex) / den;
  const u = ((a.x - o.x) * d.y - (a.y - o.y) * d.x) / den;
  if (u < 0 || u > 1) return null;
  return t;
}

function rayCircle(o: Vec2, d: Vec2, c: Vec2, r: number, out: { t: number; n: Vec2 }[]): void {
  const f = sub(o, c);
  const b = dot(f, d);
  const cc = dot(f, f) - r * r;
  const disc = b * b - cc;
  if (disc < 0) return;
  const s = Math.sqrt(disc);
  for (const t of [-b - s, -b + s]) {
    const p = add(o, mul(d, t));
    out.push({ t, n: normalize(sub(p, c)) });
  }
}

function intersections(c: Collider, o: Vec2, d: Vec2): { t: number; n: Vec2 }[] {
  const out: { t: number; n: Vec2 }[] = [];
  switch (c.kind) {
    case 'aabb': rayAabb(o, d, c.minX, c.minY, c.maxX, c.maxY, out); break;
    case 'rect': {
      const m = c.matrix();
      const inv = invert(m);
      const lo = transformPoint(o, inv);
      const ld = transformNormal(d, inv);
      const h = c.size / 2;
      const local: { t: number; n: Vec2 }[] = [];
      rayAabb(lo, ld, -h, -h, h, h, local);
      for (const it of local) {
        // the local ray parameter equals the world one (affine map)
        const wn = normalize(transformNormal(it.n, [m[3], -m[2], -m[1], m[0], 0, 0]));
        out.push({ t: it.t, n: Number.isNaN(wn.x) ? it.n : wn });
      }
      break;
    }
    case 'line': {
      const ab = sub(c.b, c.a);
      const l = len(ab);
      const n = l > 0 ? v2(-ab.y / l, ab.x / l) : v2(0, 1);
      for (const s of [1, -1]) {
        const off = mul(n, c.radius * s);
        const t = segIntersect(o, d, add(c.a, off), add(c.b, off));
        if (t !== null) out.push({ t, n: mul(n, s) });
      }
      rayCircle(o, d, c.a, c.radius, out);
      rayCircle(o, d, c.b, c.radius, out);
      break;
    }
    case 'circle': rayCircle(o, d, c.center(), c.radius, out); break;
  }
  return out;
}

export function containsPoint(c: Collider, p: Vec2): boolean {
  switch (c.kind) {
    case 'aabb': return p.x >= c.minX && p.x <= c.maxX && p.y >= c.minY && p.y <= c.maxY;
    case 'rect': {
      const l = transformPoint(p, invert(c.matrix()));
      const h = c.size / 2;
      return Math.abs(l.x) <= h && Math.abs(l.y) <= h;
    }
    case 'line': return distToSegment(p, c.a, c.b) <= c.radius;
    case 'circle': return len(sub(p, c.center())) <= c.radius;
  }
}

export function distToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const ab = sub(b, a);
  const l2 = dot(ab, ab);
  const t = l2 > 0 ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2)) : 0;
  return len(sub(p, add(a, mul(ab, t))));
}

/** nearest point on the collider's boundary (Collider.GetNearestPoint) */
export function nearestPoint(c: Collider, p: Vec2): Vec2 {
  switch (c.kind) {
    case 'aabb': {
      const inside = containsPoint(c, p);
      if (!inside) return v2(Math.max(c.minX, Math.min(p.x, c.maxX)), Math.max(c.minY, Math.min(p.y, c.maxY)));
      const dl = p.x - c.minX, dr = c.maxX - p.x, db = p.y - c.minY, dt = c.maxY - p.y;
      const m = Math.min(dl, dr, db, dt);
      if (m === dl) return v2(c.minX, p.y);
      if (m === dr) return v2(c.maxX, p.y);
      if (m === db) return v2(p.x, c.minY);
      return v2(p.x, c.maxY);
    }
    case 'rect': {
      const m = c.matrix();
      const l = transformPoint(p, invert(m));
      const h = c.size / 2;
      return transformPoint(nearestPoint({ kind: 'aabb', minX: -h, minY: -h, maxX: h, maxY: h }, l), m);
    }
    case 'line': {
      const ab = sub(c.b, c.a);
      const l2 = dot(ab, ab);
      const t = l2 > 0 ? Math.max(0, Math.min(1, dot(sub(p, c.a), ab) / l2)) : 0;
      const q = add(c.a, mul(ab, t));
      const dn = normalize(sub(p, q));
      return add(q, mul(Number.isNaN(dn.x) ? v2(0, 1) : dn, c.radius));
    }
    case 'circle': {
      const cc = c.center();
      const dn = normalize(sub(p, cc));
      return add(cc, mul(Number.isNaN(dn.x) ? v2(0, 1) : dn, c.radius));
    }
  }
}

/** Collider.SampleNormal: outward direction at the boundary point nearest to p */
export function sampleNormal(c: Collider, p: Vec2): Vec2 {
  const q = nearestPoint(c, p);
  const n = normalize(containsPoint(c, p) ? sub(q, p) : sub(p, q));
  return Number.isNaN(n.x) ? v2(0, 1) : n;
}

export class PhysicsWorld {
  bodies: Body[] = [];
  add(b: Body): Body { this.bodies.push(b); return b; }
  remove(b: Body): void { const i = this.bodies.indexOf(b); if (i >= 0) this.bodies.splice(i, 1); }
  /** PhysicsSystem.Raycast */
  raycast(origin: Vec2, direction: Vec2, maxDistance = Number.MAX_VALUE, filter: number = Layers.All, ignore?: ReadonlySet<unknown> | readonly unknown[]): RayHit | null {
    const dl = len(direction);
    if (!(dl > 0)) return null;
    const d = v2(direction.x / dl, direction.y / dl);
    let best: RayHit | null = null;
    const ign = ignore ? (Array.isArray(ignore) ? new Set(ignore) : ignore as ReadonlySet<unknown>) : null;
    for (const b of this.bodies) {
      if ((b.filterBits & filter) === 0) continue;
      if (ign && ign.has(b.owner)) continue;
      for (const it of intersections(b.collider, origin, d)) {
        if (it.t < 0 || it.t > maxDistance) continue;
        if (!best || it.t < best.distance) best = { body: b, position: add(origin, mul(d, it.t)), normal: it.n, distance: it.t };
      }
    }
    return best;
  }
  /** PhysicsSystem.QueryPoint */
  queryPoint(p: Vec2, filter: number = Layers.All, ignore?: ReadonlySet<unknown>): Body[] {
    return this.bodies.filter((b) => (b.filterBits & filter) !== 0 && !(ignore && ignore.has(b.owner)) && containsPoint(b.collider, p));
  }
  /** PhysicsSystem.QueryCircle */
  queryCircle(c: Vec2, r: number, filter: number = Layers.All, ignore?: ReadonlySet<unknown>): Body[] {
    return this.bodies.filter((b) => (b.filterBits & filter) !== 0 && !(ignore && ignore.has(b.owner))
      && (containsPoint(b.collider, c) || len(sub(nearestPoint(b.collider, c), c)) <= r));
  }
}
