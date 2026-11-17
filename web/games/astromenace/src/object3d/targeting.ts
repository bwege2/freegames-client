// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of the aiming functions:
// src/object3d/weapon/functions.cpp, space_ship/functions.cpp and projectile/functions.cpp.
// Changed for the browser by the freegames project, 2026.
import { Vec3, type Mat33, m33CalcPoint, getPlaneABCD, vwSqrtf, clamp } from '../core/math.ts';
import { type Object3D, ObjectStatus, ObjectType, needCheckCollision, objectsStatusFoe } from './object3d.ts';
import { world, Cycle, forEachManaged } from './world.ts';
import { GetProjectileSpeed } from './projectile_data.ts';
import { G } from '../game/globals.ts';
import { GetCameraMovementDirection, GetCameraSpeed } from '../game/camera.ts';

const RadToDeg = 180.0 / 3.14159;

function CalculateLocationWithPrediction(weaponStatus: number, weaponLocation: Vec3, weaponType: number, targetStatus: number,
  targetOrientation: Vec3, targetSpeed: number, targetLocation: Vec3): Vec3 {
  let dist = weaponLocation.sub(targetLocation);
  let projectileSpeed = GetProjectileSpeed(weaponType);
  if (weaponStatus === ObjectStatus.Enemy) projectileSpeed = projectileSpeed / G.GameEnemyWeaponPenalty;
  const curDist = dist.Length();
  const objTime = curDist / projectileSpeed;
  let future = targetOrientation.mul(targetSpeed * objTime);
  let cam = new Vec3();
  if (targetStatus === ObjectStatus.Player) cam = GetCameraMovementDirection().mul(GetCameraSpeed() * objTime);
  const possible = targetLocation.add(future).add(cam);
  dist = weaponLocation.sub(possible);
  const poprTime = dist.Length() / projectileSpeed;
  future = targetOrientation.mul(targetSpeed * poprTime);
  cam = new Vec3();
  if (targetStatus === ObjectStatus.Player) cam = GetCameraMovementDirection().mul(GetCameraSpeed() * poprTime);
  return targetLocation.add(future).add(cam);
}

/** FindTargetLocationWithPrediction: the target location, or null */
export function FindTargetLocationWithPrediction(weaponStatus: number, weaponLocation: Vec3, weaponType: number): Vec3 | null {
  let target: Vec3 | null = null;
  let d2Locked = 1000 * 1000;
  for (const ship of world.ShipList) {
    if (!needCheckCollision(ship) || !objectsStatusFoe(weaponStatus, ship.ObjectStatus)) continue;
    const l = ship.GeometryCenter.clone();
    m33CalcPoint(l, ship.CurrentRotationMat);
    let real = ship.Location.add(l);
    if (weaponType !== 110) real = CalculateLocationWithPrediction(weaponStatus, weaponLocation, weaponType, ship.ObjectStatus, ship.Orientation, ship.Speed, real);
    const d2 = (weaponLocation.x - real.x) ** 2 + (weaponLocation.y - real.y) ** 2 + (weaponLocation.z - real.z) ** 2;
    if (d2Locked > d2) {
      target = real;
      d2Locked = d2;
    }
  }
  return target;
}

/** GetTurretOnTargetOrientation: NeedAngle starts as the turret's rotation */
export function GetTurretOnTargetOrientation(turretLocation: Vec3, turretRotation: Vec3, rm: Mat33, targetLocation: Vec3, needAngle: Vec3): boolean {
  needAngle.copy(turretRotation);
  const target = targetLocation.clone();
  let dist = target.sub(turretLocation);
  let len = dist.Length();
  const orient = new Vec3(0, 0, 1);
  m33CalcPoint(orient, rm);
  const right = new Vec3(1, 0, 0);
  m33CalcPoint(right, rm);
  const [A, B, C, D] = getPlaneABCD(turretLocation, turretLocation.add(orient), turretLocation.add(right));
  const nl = vwSqrtf(A * A + B * B + C * C);
  if (len > 0 && nl > 0) {
    const s = clamp((A * dist.x + B * dist.y + C * dist.z) / (len * nl), -1, 1);
    needAngle.x = Math.asin(s) * RadToDeg;
  }
  if (nl > 0) {
    const dp = (A * target.x + B * target.y + C * target.z + D) / nl;
    target.x -= dp * A;
    target.y -= dp * B;
    target.z -= dp * C;
    dist = target.sub(turretLocation);
    len = dist.Length();
  }
  if (len === 0) return true;
  const up = new Vec3(0, 1, 0);
  m33CalcPoint(up, rm);
  const [A3, B3, C3] = getPlaneABCD(turretLocation, turretLocation.add(orient), turretLocation.add(up));
  const nl3 = vwSqrtf(A3 * A3 + B3 * B3 + C3 * C3);
  if (nl3 === 0) return true;
  const s = clamp((A3 * dist.x + B3 * dist.y + C3 * dist.z) / (len * nl3), -1, 1);
  const [A2, B2, C2, D2] = getPlaneABCD(turretLocation, turretLocation.add(right), turretLocation.add(up));
  if (A2 * target.x + B2 * target.y + C2 * target.z + D2 <= 0) needAngle.y = 180 - Math.asin(s) * RadToDeg;
  else needAngle.y = Math.asin(s) * RadToDeg;
  return true;
}

/** GetWeaponOnTargetOrientation (space_ship/functions.cpp); NeedAngle is changed in place */
export function GetWeaponOnTargetOrientation(weaponStatus: number, weaponLocation: Vec3, tcl: Vec3, currentWeaponRotation: Vec3,
  minTargetingDistance: number, rm: Mat33, needAngle: Vec3, needCenterOrientation: boolean, weaponType: number): void {
  let d2Locked = 1000 * 1000;
  let locked = false;
  const orient = new Vec3(0, 0, 1);
  m33CalcPoint(orient, rm);
  const up = new Vec3(0, 1, 0);
  m33CalcPoint(up, rm);
  const right = new Vec3(1, 0, 0);
  m33CalcPoint(right, rm);
  const [A, B, C, D] = getPlaneABCD(tcl, tcl.add(orient), tcl.add(up));
  const n2 = vwSqrtf(A * A + B * B + C * C);
  const [A2, B2, C2, D2] = getPlaneABCD(tcl, tcl.add(right), tcl.add(up));
  const [A3, B3, C3] = getPlaneABCD(tcl, tcl.add(orient), tcl.add(right));
  const n3 = vwSqrtf(A3 * A3 + B3 * B3 + C3 * C3);
  let factor = 1;
  const check = (o: Object3D & { Speed: number }): void => {
    const gc = o.GeometryCenter.clone();
    m33CalcPoint(gc, o.CurrentRotationMat);
    let real = o.Location.add(gc);
    if (o.Speed !== 0 && weaponType !== 0 && weaponType !== 11 && weaponType !== 12 && weaponType !== 14
      && weaponType !== 16 && weaponType !== 17 && weaponType !== 18 && weaponType !== 19) {
      const ps = GetProjectileSpeed(weaponType);
      const t = real.sub(tcl).Length() / ps;
      real = real.add(o.Orientation.mul(o.Speed * t));
    }
    if (Math.abs(A * real.x + B * real.y + C * real.z + D) <= o.Radius && A2 * real.x + B2 * real.y + C2 * real.z + D2 > minTargetingDistance) {
      const ta = currentWeaponRotation.clone();
      const dist = real.sub(weaponLocation);
      const l2 = dist.x * dist.x + dist.y * dist.y + dist.z * dist.z;
      const l = vwSqrtf(l2);
      if (l > 0 && n3 > 0) {
        const s = clamp((A3 * dist.x + B3 * dist.y + C3 * dist.z) / (l * n3), -1, 1);
        ta.x = currentWeaponRotation.x - Math.asin(s) * RadToDeg;
      }
      if (needCenterOrientation && l > 0 && n2 > 0) {
        const s = clamp((A * dist.x + B * dist.y + C * dist.z) / (l * n2), -1, 1);
        ta.y = currentWeaponRotation.y - Math.asin(s) * RadToDeg;
      }
      if (d2Locked / factor > l2 && Math.abs(ta.x) < 45) {
        needAngle.copy(ta);
        d2Locked = l2;
        locked = true;
        factor = 1;
      }
    }
  };
  for (const s of world.ShipList) if (needCheckCollision(s) && objectsStatusFoe(weaponStatus, s.ObjectStatus)) check(s);
  if (locked) factor = 5;
  for (const g of world.GroundObjectList) if (needCheckCollision(g) && objectsStatusFoe(weaponStatus, g.ObjectStatus)) check(g);
  if (locked) factor = 10;
  for (const o of world.SpaceObjectList) if (needCheckCollision(o) && objectsStatusFoe(weaponStatus, o.ObjectStatus)) check(o);
}

/** FindTargetAndInterceptCourse: the locked target (or null); NeedAngle is set in place */
export function FindTargetAndInterceptCourse(status: number, loc: Vec3, rot: Vec3, rm: Mat33, needAngle: Vec3, maxFly: number): Object3D | null {
  needAngle.copy(rot);
  let d2Locked = 1000 * 1000;
  let locked: Object3D | null = null;
  const orient = new Vec3(0, 0, 1);
  m33CalcPoint(orient, rm);
  const up = new Vec3(0, 1, 0);
  m33CalcPoint(up, rm);
  const right = new Vec3(1, 0, 0);
  m33CalcPoint(right, rm);
  const [A, B, C, D] = getPlaneABCD(loc, loc.add(right), loc.add(up));
  const [A2, B2, C2] = getPlaneABCD(loc, loc.add(right), loc.add(orient));
  const n2 = vwSqrtf(A2 * A2 + B2 * B2 + C2 * C2);
  const [A3, B3, C3] = getPlaneABCD(loc, loc.add(up), loc.add(orient));
  const n3 = vwSqrtf(A3 * A3 + B3 * B3 + C3 * C3);
  let factor = 1;
  const checkLocation = (t: Vec3): boolean => {
    if (A * t.x + B * t.y + C * t.z + D <= 0) return false;
    const dist = t.sub(loc);
    const l2 = dist.x * dist.x + dist.y * dist.y + dist.z * dist.z;
    if (d2Locked / factor <= l2) return false;
    const l = vwSqrtf(l2);
    if (l > maxFly) return false;
    if (l > 0 && n2 > 0) needAngle.x = rot.x + Math.asin(clamp((A2 * dist.x + B2 * dist.y + C2 * dist.z) / (l * n2), -1, 1)) * RadToDeg;
    if (l > 0 && n3 > 0) needAngle.y = rot.y + Math.asin(clamp((A3 * dist.x + B3 * dist.y + C3 * dist.z) / (l * n3), -1, 1)) * RadToDeg;
    d2Locked = l2;
    factor = 1;
    return true;
  };
  for (const p of world.ProjectileList) {
    if (p.ProjectileType === 3 && needCheckCollision(p) && objectsStatusFoe(status, p.ObjectStatus) && checkLocation(p.Location)) locked = p;
  }
  if (locked) factor = 3;
  for (const g of world.GroundObjectList) {
    if (!needCheckCollision(g) || !objectsStatusFoe(status, g.ObjectStatus)) continue;
    const t = g.GeometryCenter.clone();
    m33CalcPoint(t, g.CurrentRotationMat);
    if (checkLocation(t.add(g.Location))) locked = g;
  }
  if (locked) factor = 6;
  for (const s of world.ShipList) {
    if (needCheckCollision(s) && objectsStatusFoe(status, s.ObjectStatus) && checkLocation(s.Location)) locked = s;
  }
  if (locked) factor = 10;
  for (const o of world.SpaceObjectList) {
    if (needCheckCollision(o) && objectsStatusFoe(status, o.ObjectStatus) && o.ObjectType !== ObjectType.SpaceDebris && checkLocation(o.Location)) locked = o;
  }
  return locked;
}

export function CorrectTargetInterceptCourse(loc: Vec3, rot: Vec3, rm: Mat33, target: Object3D | null, needAngle: Vec3): boolean {
  if (!target || target.released) return false;
  const orient = new Vec3(0, 0, 1);
  m33CalcPoint(orient, rm);
  const up = new Vec3(0, 1, 0);
  m33CalcPoint(up, rm);
  const right = new Vec3(1, 0, 0);
  m33CalcPoint(right, rm);
  let [A, B, C, D] = getPlaneABCD(loc, loc.add(right), loc.add(up));
  if (A * target.Location.x + B * target.Location.y + C * target.Location.z + D <= 0) return false;
  needAngle.copy(rot);
  const gc = target.GeometryCenter.clone();
  m33CalcPoint(gc, target.CurrentRotationMat);
  const dist = target.Location.add(gc).sub(loc);
  const l = dist.Length();
  [A, B, C, D] = getPlaneABCD(loc, loc.add(right), loc.add(orient));
  let nl = vwSqrtf(A * A + B * B + C * C);
  if (l > 0 && nl > 0) needAngle.x = rot.x + Math.asin(clamp((A * dist.x + B * dist.y + C * dist.z) / (l * nl), -1, 1)) * RadToDeg;
  [A, B, C, D] = getPlaneABCD(loc, loc.add(up), loc.add(orient));
  nl = vwSqrtf(A * A + B * B + C * C);
  if (l > 0 && nl > 0) needAngle.y = rot.y + Math.asin(clamp((A * dist.x + B * dist.y + C * dist.z) / (l * nl), -1, 1)) * RadToDeg;
  return true;
}

function MissileTargetStayAhead(target: Object3D, loc: Vec3, rm: Mat33): boolean {
  const up = new Vec3(0, 1, 0);
  m33CalcPoint(up, rm);
  const right = new Vec3(1, 0, 0);
  m33CalcPoint(right, rm);
  const [A, B, C, D] = getPlaneABCD(loc, loc.add(right), loc.add(up));
  return !(A * target.Location.x + B * target.Location.y + C * target.Location.z + D <= 0);
}

export function CheckMissileTarget(target: Object3D | null, loc: Vec3, rm: Mat33): boolean {
  if (!target || target.released) return false;
  const lists: Object3D[][] = [world.ProjectileList, world.GroundObjectList, world.ShipList, world.SpaceObjectList];
  for (const list of lists) {
    let found = false;
    forEachManaged(list, (o) => {
      if (o === target) {
        found = true;
        return Cycle.Break;
      }
      return Cycle.Continue;
    });
    if (found) return MissileTargetStayAhead(target, loc, rm);
  }
  return false;
}

export function GetClosestTargetToMine(status: number, loc: Vec3): Object3D | null {
  let closest: Object3D | null = null;
  let min2 = -1;
  for (const s of world.ShipList) {
    if (!needCheckCollision(s) || !objectsStatusFoe(status, s.ObjectStatus)) continue;
    const d2 = (s.Location.x - loc.x) ** 2 + (s.Location.y - loc.y) ** 2 + (s.Location.z - loc.z) ** 2;
    if (min2 < 0 || d2 < min2) {
      min2 = d2;
      closest = s;
    }
  }
  return closest;
}
