// Lugaru's vector and rotation math, translated from Source/Math/XYZ.hpp. The original's
// DoRotation applies Y, then Z, then X (degrees), and that order is kept everywhere.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const vec3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });

export const vadd = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const vsub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const vmul = (a: Vec3, s: number): Vec3 => ({ x: a.x * s, y: a.y * s, z: a.z * s });
export const vdiv = (a: Vec3, s: number): Vec3 => ({ x: a.x / s, y: a.y / s, z: a.z / s });
export const vdot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
export const vcross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
export const vlen = (a: Vec3): number => Math.sqrt(vdot(a, a));
export const distsq = (a: Vec3, b: Vec3): number => {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
};
export const distsqflat = (a: Vec3, b: Vec3): number => {
  const dx = a.x - b.x, dz = a.z - b.z;
  return dx * dx + dz * dz;
};
export const distance = (a: Vec3, b: Vec3): number => Math.sqrt(distsq(a, b));
export const distanceflat = (a: Vec3, b: Vec3): number => Math.sqrt(distsqflat(a, b));

export function normalize(a: Vec3): Vec3 {
  const l = vlen(a);
  if (!l) return vec3();
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}

export function vlerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/** Source/Math/XYZ.hpp DoRotation: rotate around Y, then Z, then X, all in degrees. */
export function doRotation(p: Vec3, xang: number, yang: number, zang: number): Vec3 {
  let { x, y, z } = p;
  if (yang) {
    const a = (yang * Math.PI) / 180;
    const c = Math.cos(a), s = Math.sin(a);
    const nz = z * c - x * s;
    const nx = z * s + x * c;
    z = nz;
    x = nx;
  }
  if (zang) {
    const a = (zang * Math.PI) / 180;
    const c = Math.cos(a), s = Math.sin(a);
    const nx = x * c - y * s;
    const ny = y * c + x * s;
    x = nx;
    y = ny;
  }
  if (xang) {
    const a = (xang * Math.PI) / 180;
    const c = Math.cos(a), s = Math.sin(a);
    const ny = y * c - z * s;
    const nz = y * s + z * c;
    y = ny;
    z = nz;
  }
  return { x, y, z };
}

export function stepToward(current: number, target: number, step: number): number {
  if (Math.abs(target - current) <= step) return target;
  return current + Math.sign(target - current) * step;
}

/** Source/Math/XYZ.hpp roughDirectionTo. */
export function roughDirectionTo(from: Vec3, to: Vec3): number {
  const dx = to.x - from.x, dz = to.z - from.z;
  if (!dx && !dz) return 0;
  let yaw = (Math.atan2(dx, dz) * 180) / Math.PI;
  if (yaw < 0) yaw += 360;
  return yaw;
}

/** Source/Math/XYZ.hpp ReflectVector (terrain normal reflection). */
export function reflectVector(v: Vec3, n: Vec3): Vec3 {
  const d = vdot(v, n);
  return { x: v.x - 2 * d * n.x, y: v.y - 2 * d * n.y, z: v.z - 2 * d * n.z };
}
