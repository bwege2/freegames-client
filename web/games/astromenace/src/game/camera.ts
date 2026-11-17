// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/game/camera.cpp:
// the camera flies along the level at 10 units a second and carries the player's ship with it.
// Changed for the browser by the freegames project, 2026.
import { Vec3, fRand0 } from '../core/math.ts';
import { incCameraLocation, setCameraDeviation } from '../core/camera.ts';
import { playerFighter } from '../object3d/world.ts';

const MaxInfluenceDistance2 = 100 * 100;
const c = {
  LastUpdate: 0,
  Speed: 10,
  CoveredDistance: new Vec3(),
  MovementDirection: new Vec3(0, 0, 1),
  CurrentShake: 0,
  NeedShake: 0,
  ShakeTimeLeft: 0,
  ShakeInitialTime: 0,
  ShakePower: 0,
};

export function ResetCamera(): void {
  c.CoveredDistance = new Vec3();
  c.LastUpdate = 0;
  c.CurrentShake = 0;
  c.NeedShake = 0;
  c.ShakeTimeLeft = 0;
  c.ShakeInitialTime = 0;
  c.ShakePower = 0;
  setCameraDeviation(new Vec3());
}

export function InitCamera(time: number): void {
  ResetCamera();
  c.LastUpdate = time;
}

export function SetupCameraShake(loc: Vec3, power: number): void {
  const p = playerFighter();
  if (!p) return;
  let d2 = (p.Location.x - loc.x) ** 2 + (p.Location.y - loc.y) ** 2 + (p.Location.z - loc.z) ** 2;
  if (d2 > MaxInfluenceDistance2) return;
  if (d2 <= p.Radius * p.Radius) d2 = p.Radius * p.Radius;
  c.ShakeInitialTime = c.ShakeTimeLeft = (MaxInfluenceDistance2 - d2) / MaxInfluenceDistance2;
  if (power > 1) c.ShakeInitialTime = c.ShakeTimeLeft = c.ShakeTimeLeft * 3;
  c.ShakePower = power * (MaxInfluenceDistance2 - d2) / (MaxInfluenceDistance2 * 2);
  c.NeedShake = c.ShakePower * fRand0();
}

function UpdateCameraShake(dt: number): void {
  c.ShakeTimeLeft -= dt;
  if (c.ShakeTimeLeft < 0) c.ShakeTimeLeft = 0;
  let stop = false;
  if (c.ShakeTimeLeft <= 0 && c.CurrentShake !== 0) {
    stop = true;
    c.NeedShake = 0;
  }
  if (c.ShakeTimeLeft > 0 || stop) {
    const sign = c.NeedShake < c.CurrentShake ? -1 : 1;
    const inc = sign * 5 * dt;
    if ((sign > 0 && c.NeedShake <= c.CurrentShake + inc) || (sign < 0 && c.NeedShake >= c.CurrentShake + inc)) {
      c.CurrentShake = c.NeedShake;
      c.ShakePower *= c.ShakeTimeLeft / c.ShakeInitialTime;
      c.NeedShake = c.ShakePower * fRand0();
    } else {
      c.CurrentShake += inc;
    }
  }
  setCameraDeviation(new Vec3(c.CurrentShake * 2, c.CurrentShake, 0));
}

export function CameraUpdate(time: number): void {
  const dt = time - c.LastUpdate;
  c.LastUpdate = time;
  const d = c.MovementDirection.mul(c.Speed * dt);
  c.CoveredDistance.addTo(d);
  incCameraLocation(d);
  const p = playerFighter();
  if (p) p.SetLocationArcadePlayer(p.Location.add(d));
  UpdateCameraShake(dt);
}

export const GetCameraShake = (): number => c.CurrentShake;
export const GetCameraSpeed = (): number => c.Speed;
export const GetCameraCoveredDistance = (): Vec3 => c.CoveredDistance;
export const GetCameraMovementDirection = (): Vec3 => c.MovementDirection;
