// A real-time-strategy camera: the ground point it looks at, a yaw, a pitch and a distance.
// WASD/arrows pan relative to the view, the wheel zooms, the middle mouse button (or right-drag
// with Shift) rotates and tilts. The original 0 A.D. camera also has edge scrolling and a
// declination clamp; the port keeps the same idea without the GUI options screen.
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import type { Terrain } from '../data/pmp.ts';

export class RtsCamera {
  readonly camera: PerspectiveCamera;
  target = new Vector3(0, 0, 0);
  yaw = 0.6;
  pitch = 0.82;
  distance = 70;
  private readonly terrain: Terrain;

  constructor(terrain: Terrain, aspect: number) {
    this.terrain = terrain;
    this.camera = new PerspectiveCamera(48, aspect, 0.5, 2400);
    this.camera.up.set(0, 1, 0);
    this.recompute();
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  pan(dt: number, keys: Record<string, boolean>): void {
    const speed = this.distance * 0.9;
    let f = 0, r = 0;
    if (keys.KeyW || keys.ArrowUp) f += 1;
    if (keys.KeyS || keys.ArrowDown) f -= 1;
    if (keys.KeyD || keys.ArrowRight) r += 1;
    if (keys.KeyA || keys.ArrowLeft) r -= 1;
    if (f || r) {
      const len = Math.hypot(f, r);
      const forward = new Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      this.target.addScaledVector(forward, (f / len) * speed * dt);
      this.target.addScaledVector(right, (r / len) * speed * dt);
    }
    if (keys.KeyQ) this.yaw += dt * 1.6;
    if (keys.KeyE) this.yaw -= dt * 1.6;
    this.target.x = MathUtils.clamp(this.target.x, 0, this.terrain.size);
    this.target.z = MathUtils.clamp(this.target.z, 0, this.terrain.size);
    this.target.y = this.terrain.heightAt(this.target.x, this.target.z);
    this.recompute();
  }

  rotate(dx: number, dy: number): void {
    this.yaw -= dx * 0.005;
    this.pitch = MathUtils.clamp(this.pitch + dy * 0.004, 0.35, 1.35);
    this.recompute();
  }

  zoom(delta: number): void {
    this.distance = MathUtils.clamp(this.distance * Math.pow(1.0015, delta), 18, 220);
    this.recompute();
  }

  setView(yaw: number, pitch: number, distance: number): void {
    this.yaw = yaw;
    this.pitch = MathUtils.clamp(pitch, 0.35, 1.35);
    this.distance = MathUtils.clamp(distance, 18, 220);
    this.recompute();
  }

  reset(): void {
    this.yaw = 0.6;
    this.pitch = 0.82;
    this.distance = 70;
    this.recompute();
  }

  focus(x: number, z: number): void {
    this.target.set(x, this.terrain.heightAt(x, z), z);
    this.recompute();
  }

  private recompute(): void {
    const horizontal = Math.cos(this.pitch) * this.distance;
    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * horizontal,
      this.target.y + Math.sin(this.pitch) * this.distance,
      this.target.z + Math.cos(this.yaw) * horizontal,
    );
    this.camera.lookAt(this.target);
  }
}
