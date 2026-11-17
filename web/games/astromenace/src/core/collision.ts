// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/core/
// collision_detection/collision_detection.cpp. Changed for the browser by the freegames project, 2026.
import {
  Vec3, type Mat33, m33InverseRotate, m33CalcPoint, m33Mult, mat44, m44Identity, m44CreateRotate, m44Translate, m44Mult, m44CalcPoint,
} from './math.ts';
import type { BoundingBox, Chunk3D } from './model3d.ts';

const abs = Math.abs;

function pointInTriangle(point: Vec3, pa: Vec3, pb: Vec3, pc: Vec3): boolean {
  const v1 = point.sub(pa).NormalizeHi();
  const v2 = point.sub(pb).NormalizeHi();
  const v3 = point.sub(pc).NormalizeHi();
  const total = Math.acos(v1.dot(v2)) + Math.acos(v2.dot(v3)) + Math.acos(v3.dot(v1));
  return abs(total - 2 * 3.14159265) <= 0.005;
}

export function aabbAabbCollision(a1: BoundingBox, l1: Vec3, a2: BoundingBox, l2: Vec3): boolean {
  if (abs(l1.x - l2.x) > abs(a1[0].x + a2[0].x)) return false;
  if (abs(l1.y - l2.y) > abs(a1[0].y + a2[0].y)) return false;
  if (abs(l1.z - l2.z) > abs(a1[0].z + a2[0].z)) return false;
  return true;
}

export function obbObbCollision(o1: BoundingBox, o1l: Vec3, l1: Vec3, rm1: Mat33, o2: BoundingBox, o2l: Vec3, l2: Vec3, rm2: Mat33): boolean {
  const inv1 = Float64Array.from(rm1);
  m33InverseRotate(inv1);
  const a = o1[0].sub(o1[6]).mul(0.5);
  m33CalcPoint(a, inv1);
  const inv2 = Float64Array.from(rm2);
  m33InverseRotate(inv2);
  const b = o2[0].sub(o2[6]).mul(0.5);
  m33CalcPoint(b, inv2);
  const T = l2.add(o2l).sub(l1.add(o1l));
  m33CalcPoint(T, inv1);
  m33Mult(inv1, rm2);
  const R = [[inv1[0], inv1[3], inv1[6]], [inv1[1], inv1[4], inv1[7]], [inv1[2], inv1[5], inv1[8]]];
  if (abs(T.x) > a.x + b.x * abs(R[0][0]) + b.y * abs(R[0][1]) + b.z * abs(R[0][2])) return false;
  if (abs(T.y) > a.y + b.x * abs(R[1][0]) + b.y * abs(R[1][1]) + b.z * abs(R[1][2])) return false;
  if (abs(T.z) > a.z + b.x * abs(R[2][0]) + b.y * abs(R[2][1]) + b.z * abs(R[2][2])) return false;
  if (abs(T.x * R[0][0] + T.y * R[1][0] + T.z * R[2][0]) > b.x + a.x * abs(R[0][0]) + a.y * abs(R[1][0]) + a.z * abs(R[2][0])) return false;
  if (abs(T.x * R[0][1] + T.y * R[1][1] + T.z * R[2][1]) > b.y + a.x * abs(R[0][1]) + a.y * abs(R[1][1]) + a.z * abs(R[2][1])) return false;
  if (abs(T.x * R[0][2] + T.y * R[1][2] + T.z * R[2][2]) > b.z + a.x * abs(R[0][2]) + a.y * abs(R[1][2]) + a.z * abs(R[2][2])) return false;
  if (abs(T.z * R[1][0] - T.y * R[2][0]) > a.y * abs(R[2][0]) + a.z * abs(R[1][0]) + b.y * abs(R[0][2]) + b.z * abs(R[0][1])) return false;
  if (abs(T.z * R[1][1] - T.y * R[2][1]) > a.y * abs(R[2][1]) + a.z * abs(R[1][1]) + b.x * abs(R[0][2]) + b.z * abs(R[0][0])) return false;
  if (abs(T.z * R[1][2] - T.y * R[2][2]) > a.y * abs(R[2][2]) + a.z * abs(R[1][2]) + b.x * abs(R[0][1]) + b.y * abs(R[0][0])) return false;
  if (abs(T.x * R[2][0] - T.z * R[0][0]) > a.x * abs(R[2][0]) + a.z * abs(R[0][0]) + b.y * abs(R[1][2]) + b.z * abs(R[1][1])) return false;
  if (abs(T.x * R[2][1] - T.z * R[0][1]) > a.x * abs(R[2][1]) + a.z * abs(R[0][1]) + b.x * abs(R[1][2]) + b.z * abs(R[1][0])) return false;
  if (abs(T.x * R[2][2] - T.z * R[0][2]) > a.x * abs(R[2][2]) + a.z * abs(R[0][2]) + b.x * abs(R[1][1]) + b.y * abs(R[1][0])) return false;
  if (abs(T.y * R[0][0] - T.x * R[1][0]) > a.x * abs(R[1][0]) + a.y * abs(R[0][0]) + b.y * abs(R[2][2]) + b.z * abs(R[2][1])) return false;
  if (abs(T.y * R[0][1] - T.x * R[1][1]) > a.x * abs(R[1][1]) + a.y * abs(R[0][1]) + b.x * abs(R[2][2]) + b.z * abs(R[2][0])) return false;
  if (abs(T.y * R[0][2] - T.x * R[1][2]) > a.x * abs(R[1][2]) + a.y * abs(R[0][2]) + b.x * abs(R[2][1]) + b.y * abs(R[2][0])) return false;
  return true;
}

export function sphereSphereCollision(r1: number, l1: Vec3, r2: number, l2: Vec3, prev2: Vec3): boolean {
  let result = true;
  const d = l1.sub(l2);
  const rr = r1 + r2;
  if (abs(d.x) > rr || abs(d.y) > rr || abs(d.z) > rr) result = false;
  if (result) {
    if (d.x * d.x + d.y * d.y + d.z * d.z <= rr * rr) return true;
  }
  if (!result) {
    const ray = l2.sub(prev2);
    ray.Normalize();
    const point = ray.x * l1.x + ray.y * l1.y + ray.z * l1.z - ray.x * prev2.x - ray.y * prev2.y - ray.z * prev2.z;
    // NOTE the original multiplies the previous location by the projection (not prev + ray * point)
    const ip = new Vec3(prev2.x * point, prev2.y * point, prev2.z * point);
    if ((prev2.x - ip.x) * (l2.x - ip.x) + (prev2.y - ip.y) * (l2.y - ip.y) + (prev2.z - ip.z) * (l2.z - ip.z) >= 0) return false;
    const nd2 = (ip.x - l1.x) * (ip.x - l1.x) + (ip.y - l1.y) * (ip.y - l1.y) + (ip.z - l1.z) * (ip.z - l1.z);
    if (nd2 <= r1 * r1) return true;
  }
  return false;
}

function segmentBox(max: Vec3, l1: Vec3, l2: Vec3, prev2: Vec3): boolean {
  const mid = l2.add(prev2).div(2);
  const dir = l2.sub(prev2);
  const hl = dir.Length() / 2;
  dir.Normalize();
  const T = l1.sub(mid);
  if (abs(T.x) > max.x + hl * abs(dir.x) || abs(T.y) > max.y + hl * abs(dir.y) || abs(T.z) > max.z + hl * abs(dir.z)) return false;
  let r = max.y * abs(dir.z) + max.z * abs(dir.y);
  if (abs(T.y * dir.z - T.z * dir.y) > r) return false;
  r = max.x * abs(dir.z) + max.z * abs(dir.x);
  if (abs(T.z * dir.x - T.x * dir.z) > r) return false;
  r = max.x * abs(dir.y) + max.y * abs(dir.x);
  if (abs(T.x * dir.y - T.y * dir.x) > r) return false;
  return true;
}

export function sphereAabbCollision(aabb: BoundingBox, l1: Vec3, r2: number, l2: Vec3, prev2: Vec3): boolean {
  if (abs(l1.x - l2.x) > aabb[0].x + r2 || abs(l1.y - l2.y) > aabb[0].y + r2 || abs(l1.z - l2.z) > aabb[0].z + r2) {
    return segmentBox(aabb[0], l1, l2, prev2);
  }
  return true;
}

export function sphereObbCollision(obb: BoundingBox, obbl: Vec3, l1: Vec3, rm: Mat33, r2: number, l2: Vec3, prev2: Vec3): boolean {
  const max = obb[0].clone();
  const min = obb[6].clone();
  const p1 = l2.sub(l1.add(obbl));
  const p2 = prev2.sub(l1.add(obbl));
  const inv = Float64Array.from(rm);
  m33InverseRotate(inv);
  m33CalcPoint(max, inv);
  m33CalcPoint(min, inv);
  m33CalcPoint(p1, inv);
  m33CalcPoint(p2, inv);
  if (p1.x + r2 < min.x || p1.y + r2 < min.y || p1.z + r2 < min.z || p1.x - r2 > max.x || p1.y - r2 > max.y || p1.z - r2 > max.z) {
    return segmentBox(max, l1, l2, prev2);
  }
  return true;
}

/** returns the collision point or null */
export function sphereMeshCollision(l1: Vec3, ch: Chunk3D, rm: Mat33, r2: number, l2: Vec3, prev2: Vec3): Vec3 | null {
  const trans = new Float64Array([rm[0], rm[1], rm[2], 0, rm[3], rm[4], rm[5], 0, rm[6], rm[7], rm[8], 0, l1.x, l1.y, l1.z, 1]);
  const tmp = mat44();
  m44Identity(tmp);
  if (ch.Rotation.x !== 0 || ch.Rotation.y !== 0 || ch.Rotation.z !== 0) m44CreateRotate(tmp, ch.Rotation);
  m44Translate(tmp, ch.Location);
  m44Mult(trans, tmp);
  const va = ch.VertexArray, s = ch.VertexStride;
  const pt = (idx: number): Vec3 => {
    const vp = ch.IndexArray ? ch.IndexArray[idx] * s : idx * s;
    const p = new Vec3(va[vp], va[vp + 1], va[vp + 2]);
    m44CalcPoint(p, trans);
    return p;
  };
  const rr = r2 * r2;
  for (let i = 0; i < ch.VertexQuantity; i += 3) {
    const ip = ch.RangeStart + i;
    const p1 = pt(ip), p2 = pt(ip + 1), p3 = pt(ip + 2);
    const n = p2.sub(p1).Multiply(p3.sub(p1));
    n.Normalize();
    const dist = l2.sub(p1).dot(n);
    if (abs(dist) <= r2) {
      const ic = l2.sub(n.mul(dist));
      if (pointInTriangle(ic, p1, p2, p3)) return ic;
    }
    const d1 = l2.sub(p1);
    if (d1.x * d1.x + d1.y * d1.y + d1.z * d1.z <= rr) return p1;
    const d2 = l2.sub(p2);
    if (d2.x * d2.x + d2.y * d2.y + d2.z * d2.z <= rr) return p2;
    const d3 = l2.sub(p3);
    if (d3.x * d3.x + d3.y * d3.y + d3.z * d3.z <= rr) return p3;
    const vd = p1.sub(prev2);
    if (vd.dot(n) <= 0.001) {
      const od = n.dot(p1);
      const ld = l2.sub(prev2);
      const num = -(n.x * prev2.x + n.y * prev2.y + n.z * prev2.z - od);
      const den = n.dot(ld);
      if (den !== 0) {
        const ic = prev2.add(ld.mul(num / den));
        if (prev2.sub(ic).dot(l2.sub(ic)) < 0 && pointInTriangle(ic, p1, p2, p3)) return ic;
      }
    }
  }
  return null;
}
