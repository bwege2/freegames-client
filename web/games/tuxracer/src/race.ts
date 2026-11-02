// One race: the original's racing.c control logic around the physics. The game's menus and HUD
// drive it; this class only turns keys into controls and advances the simulation.
import type { Physics } from './physics.ts';

export interface RaceResult {
  course: string;
  time: number;
  herring: number;
  finished: boolean;
  aborted: boolean;
  distance: number;
}

export type RaceKey = 'left' | 'right' | 'brake' | 'paddle' | 'trick' | 'jump';

export class Race {
  time = 0;
  aborted = false;
  readonly physics: Physics;
  private readonly keys: Record<RaceKey, boolean> = {
    left: false, right: false, brake: false, paddle: false, trick: false, jump: false,
  };
  private chargeStart = 0;

  constructor(physics: Physics) {
    this.physics = physics;
    this.physics.init();
  }

  key(name: RaceKey, down: boolean): void { this.keys[name] = down; }

  resetKeys(): void {
    for (const k of Object.keys(this.keys) as RaceKey[]) this.keys[k] = false;
  }

  /** One racing_loop() step. */
  step(dt: number): void {
    const plyr = this.physics.player;
    const c = plyr.control;
    const p = this.physics;
    const airborne = plyr.pos.y > p.course.findY(plyr.pos.x, plyr.pos.z) + 0.30;

    c.isBraking = this.keys.brake;
    if (airborne && this.keys.trick) {
      if (this.keys.left) c.barrelRollLeft = true;
      if (this.keys.right) c.barrelRollRight = true;
      if (this.keys.paddle) c.frontFlip = true;
      if (this.keys.brake) c.backFlip = true;
    }

    if (c.jumpCharging) c.jumpAmt = Math.min(1, p.time - this.chargeStart);
    else if (c.jumping) c.jumpAmt *= 1 - (p.time - c.jumpStartTime) / 0.2;
    else c.jumpAmt = 0;
    if (this.keys.jump && !c.jumpCharging && !c.jumping) { c.jumpCharging = true; this.chargeStart = p.time; }
    if (!this.keys.jump && c.jumpCharging) { c.jumpCharging = false; c.beginJump = true; }

    if (this.keys.left !== this.keys.right) {
      const turningLeft = this.keys.left;
      c.turnFact = turningLeft ? -1 : 1;
      c.turnAnimation += (turningLeft ? -1 : 1) * 0.15 * dt / 0.05;
      c.turnAnimation = Math.min(1, Math.max(-1, c.turnAnimation));
    } else {
      c.turnFact = 0;
      if (dt < 0.2) c.turnAnimation *= 1 - dt / 0.2;
      else c.turnAnimation = 0;
    }

    if (this.keys.paddle && !c.isPaddling) { c.isPaddling = true; c.paddleTime = p.time; }

    if (c.barrelRollLeft || c.barrelRollRight) {
      c.barrelRollFactor += (c.barrelRollLeft ? -1 : 1) * 0.15 * dt / 0.05;
      if (c.barrelRollFactor > 1 || c.barrelRollFactor < -1) {
        c.barrelRollFactor = 0; c.barrelRollLeft = c.barrelRollRight = false;
      }
    }
    if (c.frontFlip || c.backFlip) {
      c.flipFactor += (c.backFlip ? -1 : 1) * 0.15 * dt / 0.05;
      if (c.flipFactor > 1 || c.flipFactor < -1) {
        c.flipFactor = 0; c.frontFlip = c.backFlip = false;
      }
    }

    p.update(dt);
    this.time = p.time;
    p.time += dt;
  }

  /** src/reset.c: the nearest reset point behind the player, else 10 m uphill. */
  resetPosition(): void {
    const p = this.physics;
    const plyr = p.player;
    let best: { x: number; z: number } | null = null;
    for (const item of p.course.items) {
      if (item.type !== 4 || item.z <= plyr.pos.z) continue;
      if (!best || item.z < best.z) best = { x: item.x, z: item.z };
    }
    if (best) p.init(best);
    else p.init({ x: p.course.cfg.width / 2, z: Math.min(plyr.pos.z + 10, -1) });
  }

  get speedKmh(): number {
    const v = this.physics.player.vel;
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) * 3.6;
  }

  result(aborted = this.aborted): RaceResult {
    const p = this.physics.player;
    return {
      course: this.physics.course.cfg.id, time: this.time, herring: p.herring,
      finished: this.physics.finished, aborted, distance: -p.pos.z,
    };
  }
}

export function formatTime(t: number): string {
  const m = Math.floor(t / 60);
  const sec = Math.floor(t) % 60;
  const hundredths = Math.floor(t * 100 + 0.5) % 100;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}
