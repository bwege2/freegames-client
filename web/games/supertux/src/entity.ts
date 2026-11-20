// Common state of everything that moves in a sector.
import type { Sprite } from './sprite.ts';
import type { Sector } from './sector.ts';
import { Rect, type CollisionHit, type Vec } from './physics.ts';

export type CollisionGroup = 'moving' | 'static' | 'touchable' | 'disabled';

export abstract class Entity {
  bbox: Rect;
  velocity: Vec = { x: 0, y: 0 };
  acceleration: Vec = { x: 0, y: 0 };
  movement: Vec = { x: 0, y: 0 };
  gravityEnabled = true;
  gravityModifier = 1;
  group: CollisionGroup = 'moving';
  active = true;
  removed = false;
  sprite: Sprite | null = null;
  z = 0;
  name = '';

  constructor(x: number, y: number, w: number, h: number) {
    this.bbox = new Rect(x, y, x + w, y + h);
  }

  get pos(): Vec { return { x: this.bbox.left, y: this.bbox.top }; }
  setPos(x: number, y: number): void { this.bbox.setPos({ x, y }); }

  /** Physic::get_movement (semi-implicit Euler) */
  getMovement(dt: number, gravity: number): Vec {
    const g = this.gravityEnabled ? gravity * this.gravityModifier * 100 : 0;
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += (this.acceleration.y + g) * dt;
    return { x: this.velocity.x * dt, y: this.velocity.y * dt };
  }

  abstract update(dt: number, sector: Sector): void;
  draw(_ctx: CanvasRenderingContext2D): void { this.sprite?.draw(_ctx, this.bbox.left, this.bbox.top); }
  onSolid(_hit: CollisionHit, _sector: Sector): void {}
  onTile(_attributes: number, _sector: Sector): void {}
  onRemoved(): void {}
}

/** A controller's state for one player; Controls are the original's Control enum values we use. */
export type Control = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'JUMP' | 'ACTION' | 'PEEK_LEFT' | 'PEEK_RIGHT' | 'PEEK_UP' | 'PEEK_DOWN';

export class Controller {
  private held = new Set<Control>();
  private wasHeld = new Set<Control>();

  hold(c: Control): boolean { return this.held.has(c); }
  pressed(c: Control): boolean { return this.held.has(c) && !this.wasHeld.has(c); }
  released(c: Control): boolean { return !this.held.has(c) && this.wasHeld.has(c); }
  set(c: Control, down: boolean): void { if (down) this.held.add(c); else this.held.delete(c); }
  clear(): void { this.held.clear(); }
  /** call once per logical step, after the world update */
  snapshot(): void {
    this.wasHeld = new Set(this.held);
  }
}
