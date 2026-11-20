// Madness Interactive Reloaded port (GPL-3.0). System.Numerics.Matrix3x2 (row vectors: p' = p * M) and
// Walgelijk's TransformComponent.RecalculateModelMatrix (Walgelijk/Built-in/TransformComponent.cs).
import { DEG2RAD, v2, type Vec2 } from './util.ts';

/** [m11, m12, m21, m22, m31, m32] */
export type Mat = [number, number, number, number, number, number];
export const IDENTITY: Readonly<Mat> = Object.freeze([1, 0, 0, 1, 0, 0]) as Readonly<Mat>;
export const identity = (): Mat => [1, 0, 0, 1, 0, 0];

export function mmul(a: Readonly<Mat>, b: Readonly<Mat>): Mat {
  return [
    a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}
export const translation = (x: number, y: number): Mat => [1, 0, 0, 1, x, y];
export function scaling(sx: number, sy: number, c?: Vec2): Mat {
  const tx = c ? c.x * (1 - sx) : 0;
  const ty = c ? c.y * (1 - sy) : 0;
  return [sx, 0, 0, sy, tx, ty];
}
export function rotation(rad: number, c?: Vec2): Mat {
  const cs = Math.cos(rad);
  const sn = Math.sin(rad);
  const tx = c ? c.x * (1 - cs) + c.y * sn : 0;
  const ty = c ? c.y * (1 - cs) - c.x * sn : 0;
  return [cs, sn, -sn, cs, tx, ty];
}
export const transformPoint = (p: Vec2, m: Readonly<Mat>): Vec2 => v2(p.x * m[0] + p.y * m[2] + m[4], p.x * m[1] + p.y * m[3] + m[5]);
export const transformNormal = (p: Vec2, m: Readonly<Mat>): Vec2 => v2(p.x * m[0] + p.y * m[2], p.x * m[1] + p.y * m[3]);
export function invert(m: Readonly<Mat>): Mat {
  const det = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(det) < 1e-30) return identity();
  const id = 1 / det;
  return [
    m[3] * id, -m[1] * id, -m[2] * id, m[0] * id,
    (m[2] * m[5] - m[4] * m[3]) * id, (m[4] * m[1] - m[0] * m[5]) * id,
  ];
}

/** A TransformComponent: position, rotation (degrees), scale, local pivot, local rotation pivot, parent */
export class Transform {
  position = v2();
  rotation = 0;
  scale = v2(1, 1);
  localPivot = v2();
  localRotationPivot = v2();
  parent: Transform | null = null;
  localToWorld: Mat = identity();
  worldToLocal: Mat = identity();
  /** TransformComponent.RecalculateModelMatrix */
  recalc(): void {
    let m: Mat = identity();
    if (this.localPivot.x !== 0 || this.localPivot.y !== 0) m = translation(-this.localPivot.x, -this.localPivot.y);
    if (this.scale.x !== 1 || this.scale.y !== 1) m = mmul(m, scaling(this.scale.x, this.scale.y));
    if (this.rotation !== 0) m = mmul(m, rotation(this.rotation * DEG2RAD, v2(this.localRotationPivot.x * this.scale.x, this.localRotationPivot.y * this.scale.y)));
    if (this.position.x !== 0 || this.position.y !== 0) m = mmul(m, translation(this.position.x, this.position.y));
    if (this.parent) m = mmul(m, this.parent.localToWorld);
    this.localToWorld = m;
    this.worldToLocal = invert(m);
  }
}
