// kodilib's KLightingProjection (KMatrix + KProjection + KPerspectiveProjection + the light it carries):
// a camera frame (X, Y, Z axes and position; the camera looks along -Z), field of view, near and far
// plane, viewport as fractions of the screen, and a positional light at the camera (+ light_offset).
import { KVector } from './math.ts';

/** the window size, for getCurrentAspectRatio (set by the game when the window changes) */
export const screen = { w: 800, h: 600 };

export class KikiProjection {
  x = new KVector(1, 0, 0);
  y = new KVector(0, 1, 0);
  z = new KVector(0, 0, 1);
  pos = new KVector(0, 0, 0);
  fov: number;
  eye_distance: number;
  viewport: [number, number, number, number] = [0, 0, 1, 1];
  light_offset = new KVector();
  lightCutoff = 90.0;
  lightAttenuation: [number, number, number] = [1, 0, 0];

  public znear: number;
  public zfar: number;
  constructor(f = 60.0, znear = 0.1, zfar = 300.0) {
    this.znear = znear;
    this.zfar = zfar;
    // KPerspectiveProjection::reset
    this.fov = 60.0;
    this.eye_distance = znear;
    this.reset();
    this.translate(0, 0, this.eye_distance);
    this.fov = f;
  }

  /** KMatrix::reset */
  reset(): void {
    this.x = new KVector(1, 0, 0);
    this.y = new KVector(0, 1, 0);
    this.z = new KVector(0, 0, 1);
    this.pos = new KVector(0, 0, 0);
  }

  /** KMatrix::translate: along the frame's own axes */
  translate(x: number, y: number, z: number): void {
    this.pos = this.pos.add(this.x.mul(x)).add(this.y.mul(y)).add(this.z.mul(z));
  }

  getPosition(): KVector { return this.pos.clone(); }
  setPosition(p: KVector): void { this.pos = new KVector(p.x, p.y, p.z); }
  getXVector(): KVector { return this.x.clone(); }
  getYVector(): KVector { return this.y.clone(); }
  getZVector(): KVector { return this.z.clone(); }
  setXVector(v: KVector): void { this.x = new KVector(v.x, v.y, v.z); }
  setYVector(v: KVector): void { this.y = new KVector(v.x, v.y, v.z); }
  setZVector(v: KVector): void { this.z = new KVector(v.x, v.y, v.z); }
  getFov(): number { return this.fov; }
  setFov(f: number): void { this.fov = f; }
  setZFar(f: number): void { this.zfar = f; }
  setZNear(n: number): void { this.znear = n; }
  setLightOffset(v: KVector): void { this.light_offset = v.clone(); }
  setViewport(l: number, b: number, w: number, h: number): void { this.viewport = [l, b, w, h]; }

  /** the viewport in pixels (KProjection::updateViewport) */
  getViewportPixels(): [number, number, number, number] {
    const [l, b, w, h] = this.viewport;
    return [Math.trunc(l * screen.w), Math.trunc(b * screen.h), Math.trunc(w * screen.w), Math.trunc(h * screen.h)];
  }

  getCurrentAspectRatio(): number {
    const vp = this.getViewportPixels();
    return vp[2] / vp[3];
  }
}
