// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/core/camera/camera.cpp
// and camera_math.cpp: the camera and the view frustum, computed from the same OpenGL matrices the
// original builds (gluPerspective, glRotatef, glTranslatef), since the frustum test decides when
// objects are deleted. Changed for the browser by the freegames project, 2026.
import { Vec3, rotatePoint, rotatePointInv, vwSqrtf } from './math.ts';
import { particleCamera } from './particles.ts';

export const cam = {
  Location: new Vec3(),
  Rotation: new Vec3(),
  Deviation: new Vec3(),
  FocusPoint: new Vec3(),
  updated: true,
  /** the projection of vw_ResizeScene: field of view, aspect, near, far */
  fov: 45,
  aspect: 1228.0 / 768.0,
  near: 1,
  far: 2000,
  /** the audio listener (core/audio) follows the camera */
  onListener: null as ((loc: Vec3, at: Vec3, up: Vec3) => void) | null,
};

const frustum: number[][] = Array.from({ length: 6 }, () => [0, 0, 0, 0]);

function updateAudioListenerPosition(): void {
  particleCamera.Location = cam.Location;
  if (!cam.onListener) return;
  const at = new Vec3(0, 0, -1);
  rotatePoint(at, cam.Rotation);
  const up = new Vec3(0, 1, 0);
  rotatePoint(up, cam.Rotation);
  cam.onListener(cam.Location, at, up);
}

export function setCameraLocation(l: Vec3): void {
  cam.Location = l.clone();
  cam.updated = true;
  updateAudioListenerPosition();
}

export function incCameraLocation(d: Vec3): void {
  cam.Location = cam.Location.add(d);
  cam.FocusPoint = cam.FocusPoint.add(d);
  cam.updated = true;
  updateAudioListenerPosition();
}

export function getCameraLocation(): Vec3 {
  return cam.Location.clone();
}

export function getCameraRotation(): Vec3 {
  return cam.Rotation.clone();
}

export function setCameraMove(newRotation: Vec3, changeDistance: number, point: Vec3): void {
  const l = cam.Location.sub(point);
  rotatePointInv(l, cam.Rotation);
  l.z += changeDistance;
  cam.Rotation = cam.Rotation.add(newRotation);
  rotatePoint(l, cam.Rotation.mul(-1));
  cam.Location = l.add(point);
  cam.updated = true;
  updateAudioListenerPosition();
}

export function setCameraMoveAroundPoint(point: Vec3, changeDistance: number, changeRotation: Vec3): void {
  const DEG = 0.0174532925;
  cam.FocusPoint = point.clone();
  setCameraMove(changeRotation, changeDistance, point);
  let exV = new Vec3();
  const V = point.sub(cam.Location);
  V.Normalize();
  if (V.x * V.x + V.y * V.y + V.z * V.z !== 0) exV = V;
  let newrotY = 0;
  if (exV.z !== 0) {
    if ((0 > exV.x && 0 > -exV.z) || (0 < exV.x && 0 < -exV.z)) newrotY = Math.atan(Math.abs(exV.x / exV.z)) / DEG;
    else newrotY = -Math.atan(Math.abs(exV.x / exV.z)) / DEG;
  }
  let newrotX = 0;
  let kat = exV.z * exV.z + exV.x * exV.x;
  if (kat !== 0) {
    kat = Math.sqrt(kat);
    if (0 < exV.y) newrotX = -Math.atan(Math.abs(exV.y) / kat) / DEG;
    else newrotX = Math.atan(Math.abs(exV.y) / kat) / DEG;
  }
  if (0 > -exV.z) newrotY += 180;
  cam.Rotation.x = -newrotX;
  cam.Rotation.y = -newrotY;
  cam.updated = true;
  updateAudioListenerPosition();
}

export function setCameraDeviation(d: Vec3): void {
  cam.Deviation = d.clone();
}

/** vw_ResizeScene */
export function resizeScene(fov: number, aspect: number, near: number, far: number): void {
  cam.fov = fov;
  cam.aspect = aspect;
  cam.near = near;
  cam.far = far;
  cam.updated = true;
}

// column-major 4x4 matrices as OpenGL keeps them
type M = Float64Array;
function mult(a: M, b: M): M {
  const r = new Float64Array(16);
  for (let c = 0; c < 4; c++) {
    for (let rr = 0; rr < 4; rr++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + rr] * b[c * 4 + k];
      r[c * 4 + rr] = s;
    }
  }
  return r;
}
function identity(): M {
  return new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
/** glRotatef */
export function rotationMatrix(angle: number, x: number, y: number, z: number): M {
  const a = angle * Math.PI / 180;
  const c = Math.cos(a), s = Math.sin(a);
  const l = Math.sqrt(x * x + y * y + z * z);
  x /= l; y /= l; z /= l;
  return new Float64Array([
    x * x * (1 - c) + c, y * x * (1 - c) + z * s, x * z * (1 - c) - y * s, 0,
    x * y * (1 - c) - z * s, y * y * (1 - c) + c, y * z * (1 - c) + x * s, 0,
    x * z * (1 - c) + y * s, y * z * (1 - c) - x * s, z * z * (1 - c) + c, 0,
    0, 0, 0, 1,
  ]);
}
export function translationMatrix(x: number, y: number, z: number): M {
  const m = identity();
  m[12] = x; m[13] = y; m[14] = z;
  return m;
}
/** gluPerspective */
export function projectionMatrix(): M {
  const f = 1 / Math.tan((cam.fov * Math.PI / 180) / 2);
  const { near: n, far: fa, aspect } = cam;
  return new Float64Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, (2 * fa * n) / (n - fa), 0]);
}
/** the modelview of vw_CameraLookAt */
export function viewMatrix(): M {
  let m = rotationMatrix(-cam.Rotation.x, 1, 0, 0);
  m = mult(m, rotationMatrix(-cam.Rotation.y, 0, 1, 0));
  m = mult(m, rotationMatrix(-cam.Rotation.z, 0, 0, 1));
  const t = cam.Location.mul(-1).sub(cam.Deviation);
  return mult(m, translationMatrix(t.x, t.y, t.z));
}

/** vw_CameraLookAt's frustum part: the frustum is recalculated when the camera moved */
export function cameraLookAt(): void {
  if (cam.updated) {
    calculateFrustum(projectionMatrix(), viewMatrix());
    cam.updated = false;
  }
}

function calculateFrustum(proj: M, modl: M): void {
  const clip = new Float64Array(16);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      clip[r * 4 + c] = modl[r * 4] * proj[c] + modl[r * 4 + 1] * proj[4 + c] + modl[r * 4 + 2] * proj[8 + c] + modl[r * 4 + 3] * proj[12 + c];
    }
  }
  const set = (side: number, sign: number, col: number): void => {
    const p = frustum[side];
    p[0] = clip[3] + sign * clip[col];
    p[1] = clip[7] + sign * clip[4 + col];
    p[2] = clip[11] + sign * clip[8 + col];
    p[3] = clip[15] + sign * clip[12 + col];
    const mag = vwSqrtf(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
    p[0] /= mag; p[1] /= mag; p[2] /= mag; p[3] /= mag;
  };
  set(0, -1, 0); // right
  set(1, 1, 0); // left
  set(2, 1, 1); // bottom
  set(3, -1, 1); // top
  set(4, -1, 2); // back
  set(5, 1, 2); // front
}

export function sphereInFrustum(p: Vec3, r: number): boolean {
  for (const f of frustum) if (f[0] * p.x + f[1] * p.y + f[2] * p.z + f[3] <= -r) return false;
  return true;
}

export function boxInFrustum(mn: Vec3, mx: Vec3): boolean {
  for (const f of frustum) {
    const d = (x: number, y: number, z: number): boolean => f[0] * x + f[1] * y + f[2] * z + f[3] <= 0;
    if (d(mn.x, mn.y, mn.z) && d(mx.x, mn.y, mn.z) && d(mn.x, mx.y, mn.z) && d(mx.x, mx.y, mn.z)
      && d(mn.x, mn.y, mx.z) && d(mx.x, mn.y, mx.z) && d(mn.x, mx.y, mx.z) && d(mx.x, mx.y, mx.z)) return false;
  }
  return true;
}
