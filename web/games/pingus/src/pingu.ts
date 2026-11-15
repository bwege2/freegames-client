// A pingu and what it does: pingu.cpp, pingu_action.cpp, the actions of src/pingus/actions/*.cpp, the
// LinearMover (movers/linear_mover.cpp) and the PinguCollider (colliders/pingu_collider.cpp). Positions and
// velocities are floats as in the original (every operation rounded with f32), pixels read through the
// collision map with C's truncating int casts.
import {
  type ActionName, DEADLY_VELOCITY, GP_BRIDGE, GP_GROUND, GP_LAVA, GP_NOTHING, GP_OUTOFSCREEN, GP_SOLID, GP_WATER,
  LEFT, PINGU_HEIGHT, RIGHT, TERMINAL_VELOCITY, Vec3, actionScreenName, f32, globals, playSound,
} from './common.ts';
import type { SceneContext } from './gfx.ts';
import { CollisionMask } from './res.ts';
import { Sprite, StateSprite } from './sprite.ts';
import type { World } from './world.ts';
import { getWorld } from './worldobj.ts';

const tr = Math.trunc;
const clamp = (lo: number, v: number, hi: number) => Math.max(lo, Math.min(v, hi));

export const PS_ALIVE = 0, PS_EXITED = 1, PS_DEAD = 2;
type ActivationMode = 'instant' | 'wall' | 'fall' | 'countdown';

export class Pingu {
  action: PinguAction;
  countdownAction: PinguAction | null = null;
  wallAction: PinguAction | null = null;
  fallAction: PinguAction | null = null;
  previousAction: ActionName = 'faller';
  readonly id: number;
  actionTime = -1;
  readonly owner: number;
  status = PS_ALIVE;
  x: number;
  y: number;
  velocity = new Vec3();
  direction = LEFT;

  constructor(id: number, pos: Vec3, owner: number) {
    this.id = id;
    this.owner = owner;
    this.x = pos.x;
    this.y = pos.y;
    this.action = this.createAction('faller');
  }

  get xi() { return tr(this.x); }
  get yi() { return tr(this.y); }
  getPos() { return new Vec3(this.x, this.y, 0); }
  setPos(x: number, y: number) { this.x = f32(x); this.y = f32(y); }
  setVelocity(v: Vec3) {
    this.velocity = new Vec3(clamp(-TERMINAL_VELOCITY, v.x, TERMINAL_VELOCITY), clamp(-TERMINAL_VELOCITY, v.y, TERMINAL_VELOCITY), v.z);
  }
  changeDirection() { this.direction = this.direction === LEFT ? RIGHT : LEFT; }
  get ownerStr() { return String(this.owner); }

  requestSetAction(name: ActionName): boolean {
    if (this.status === PS_DEAD) return false;
    switch (activationMode(name)) {
      case 'instant':
        if (name === this.action.type) return false;
        if (this.action.changeAllowed(name)) { this.setAction(name); return true; }
        return false;
      case 'wall':
        if (this.wallAction && this.wallAction.type === name) return false;
        this.wallAction = this.createAction(name);
        return true;
      case 'fall':
        if (this.fallAction && this.fallAction.type === name) return false;
        this.fallAction = this.createAction(name);
        return true;
      default: {
        if (this.countdownAction && this.countdownAction.type === name) return false;
        const act = this.createAction(name);
        this.actionTime = act.activationTime();
        this.countdownAction = act;
        return true;
      }
    }
  }

  setAction(a: ActionName | PinguAction): void {
    const act = typeof a === 'string' ? this.createAction(a) : a;
    this.previousAction = this.action.type;
    this.action = act;
  }
  requestFallAction(): boolean { if (this.fallAction) { this.setAction(this.fallAction); return true; } return false; }
  requestWallAction(): boolean { if (this.wallAction) { this.setAction(this.wallAction); return true; } return false; }

  isOver(x: number, y: number): boolean {
    const c = this.action.getCenterPos();
    return f32(c.x + 16) > x && f32(c.x - 16) < x && f32(c.y + 16) > y && f32(c.y - 16) < y;
  }
  isInside(x1: number, y1: number, x2: number, y2: number): boolean {
    return this.x > x1 && this.x < x2 && this.y > y1 && this.y < y2;
  }
  dist(x: number, y: number): number {
    const p = this.action.getCenterPos();
    const dx = f32(p.x - x), dy = f32(p.y - y);
    return f32(Math.sqrt(f32(f32(dx * dx) + f32(dy * dy))));
  }

  update(): void {
    if (this.status === PS_DEAD) return;
    if (this.relGetpixel(0, -1) === GP_OUTOFSCREEN) { this.status = PS_DEAD; return; }
    if (this.actionTime > -1) --this.actionTime;
    if (this.actionTime === 0 && this.countdownAction) {
      this.setAction(this.countdownAction);
      this.countdownAction = null;
      this.actionTime = -1;
      return;
    }
    this.action.update();
  }

  draw(gc: SceneContext): void {
    this.action.draw(gc);
    // the countdown (action_time) is never set in 0.7.6: no action is countdown triggered
  }

  relGetpixel(x: number, y: number): number {
    return getWorld().colmap.getpixel(tr(f32(this.x + f32(x * this.direction))), tr(f32(this.y - y)));
  }
  needCatch() { return this.status === PS_DEAD || this.status === PS_EXITED ? false : this.action.needCatch(); }
  isAlive() { return this.status !== PS_DEAD && this.status !== PS_EXITED; }
  getName() { return this.action.getName(); }
  get actionName(): ActionName { return this.action.type; }
  applyForce(v: Vec3) { this.velocity = this.velocity.add(v); this.y = f32(this.y - 1); }
  getCenterPos() { return this.action.getCenterPos(); }
  catchable() { return this.action.catchable(); }

  createAction(a: ActionName): PinguAction {
    switch (a) {
      case 'angel': return new Angel(this);
      case 'basher': return new Basher(this);
      case 'blocker': return new Blocker(this);
      case 'boarder': return new Boarder(this);
      case 'bomber': return new Bomber(this);
      case 'bridger': return new Bridger(this);
      case 'climber': return new Climber(this);
      case 'digger': return new Digger(this);
      case 'drown': return new Drown(this);
      case 'exiter': return new Exiter(this);
      case 'faller': return new Faller(this);
      case 'floater': return new Floater(this);
      case 'jumper': return new Jumper(this);
      case 'laserkill': return new LaserKill(this);
      case 'miner': return new Miner(this);
      case 'slider': return new Slider(this);
      case 'smashed': return new Smashed(this);
      case 'splashed': return new Splashed(this);
      case 'superman': return new Superman(this);
      case 'waiter': return new Waiter(this);
      case 'walker': return new Walker(this);
      default: throw new Error('Invalid action name provided');
    }
  }
}

export function activationMode(a: ActionName): ActivationMode {
  return a === 'climber' ? 'wall' : a === 'floater' ? 'fall' : 'instant';
}

export abstract class PinguAction {
  protected pingu: Pingu;
  abstract readonly type: ActionName;
  constructor(p: Pingu) { this.pingu = p; }
  changeAllowed(_a: ActionName): boolean { return true; }
  abstract update(): void;
  abstract draw(gc: SceneContext): void;
  getCenterPos(): Vec3 { return this.pingu.getPos().add(new Vec3(0, -16)); }
  getName(): string { return actionScreenName(this.type); }
  needCatch() { return false; }
  catchPingu(_p: Pingu) {}
  activationTime() { return -1; }
  catchable() { return true; }
  protected get world(): World { return getWorld(); }
  protected sprite(name: string) { return Sprite.load(`pingus/player${this.pingu.ownerStr}/${name}`); }
  protected stateSprite(name: string) {
    const s = new StateSprite();
    s.load(LEFT, this.sprite(`${name}/left`));
    s.load(RIGHT, this.sprite(`${name}/right`));
    return s;
  }
  relGetpixel(x: number, y: number): number {
    return this.world.colmap.getpixel(tr(f32(this.pingu.x + f32(x * this.pingu.direction))), tr(f32(this.pingu.y - y)));
  }
  headCollisionOnWalk(x: number, y: number): boolean {
    const p = this.relGetpixel(x, y + PINGU_HEIGHT);
    return p !== GP_NOTHING && !(p & GP_BRIDGE);
  }
  collisionOnWalk(x: number, y: number): boolean {
    for (let py = 0; py <= PINGU_HEIGHT; ++py) {
      const p = this.relGetpixel(x, y + py);
      if (p !== GP_NOTHING && p !== GP_BRIDGE) return true;
    }
    return false;
  }
  /** move_with_forces: unused by the actions of 0.7.6, kept with the class */
  protected drawAt(gc: SceneContext, s: Sprite, dx = 0, dy = 0) {
    gc.color().draw3(s, { x: f32(this.pingu.x + dx), y: f32(this.pingu.y + dy), z: 0 });
  }
}

/** Movers::LinearMover with Colliders::PinguCollider */
function linearMove(world: World, start: Vec3, move: Vec3, height: number): { pos: Vec3; collided: boolean } {
  let pos = start.clone();
  const step = move.clone();
  const len = tr(move.length());
  step.normalize();
  let collision = false;
  for (let i = 0; i < len && !collision; ++i) {
    collision = pinguCollider(world, pos, step, height);
    pos = pos.add(step);
  }
  if (collision) pos = pos.sub(step);
  return { pos, collided: collision };
}

function pinguCollider(world: World, cur: Vec3, step: Vec3, height: number): boolean {
  const np = cur.add(step);
  const falling = step.y > 0;
  const get = (x: number, y: number) => world.colmap.getpixel(tr(x), tr(y));
  if (tr(np.x) !== tr(cur.x)) {
    const top = f32(np.y - height);
    for (let y = np.y; y >= top; y = f32(y - 1)) {
      const p = get(np.x, y);
      if (p !== GP_NOTHING && !(p === GP_BRIDGE && !falling)) return true;
    }
    return false;
  }
  if (!falling) {
    const p = get(np.x, f32(np.y - height));
    return p !== GP_NOTHING && p !== GP_BRIDGE;
  }
  return get(np.x, np.y) !== GP_NOTHING;
}

// ---- the actions ----

class Angel extends PinguAction {
  readonly type = 'angel';
  private counter = 0;
  private xPos: number;
  private spr: Sprite;
  constructor(p: Pingu) { super(p); this.xPos = p.x; this.spr = this.sprite('angel'); }
  update() {
    this.spr.update();
    this.counter = f32(this.counter + globals.gameSpeed);
    this.pingu.setPos(f32(this.xPos + f32(20 * f32(Math.sin(f32(this.counter * 3))))), f32(this.pingu.y - f32(50 * f32(0.025))));
    if (this.pingu.y < -32) this.pingu.status = PS_DEAD;
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr); }
}

class Basher extends PinguAction {
  readonly type = 'basher';
  private spr: StateSprite;
  private radius = new CollisionMask('pingus/common/bash_radius_gfx', 'pingus/common/bash_radius');
  private basherC = 0;
  private firstBash = true;
  private reach: number;
  constructor(p: Pingu) {
    super(p);
    this.spr = this.stateSprite('basher');
    this.reach = this.radius.w;
    this.bash();
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
  update() {
    const s = this.spr.get(this.pingu.direction);
    s.update();
    ++this.basherC;
    if (this.basherC % 3 !== 0) return;
    if (!this.walkForward()) return;
    const below = this.relGetpixel(0, -1);
    if (below === GP_WATER || below === GP_LAVA) {
      this.pingu.setAction('drown');
    } else if (below !== GP_NOTHING) {
      if (this.relGetpixel(0, 0) === GP_SOLID || this.relGetpixel(0, PINGU_HEIGHT) === GP_SOLID) {
        playSound('chink');
        this.pingu.changeDirection();
        this.pingu.setAction('walker');
      } else if (this.haveSomethingToDig()) {
        if (this.basherC % 2 === 0) this.bash();
      } else if (f32(f32(s.frame) / f32(s.frameCount)) > f32(0.6)) {
        this.pingu.setAction('walker');
      }
    }
  }
  private bash() {
    this.world.remove(this.radius, this.pingu.xi - tr(this.radius.w / 2), this.pingu.yi - this.radius.h + 1);
  }
  private walkForward(): boolean {
    let yInc = 0;
    for (yInc = 0; yInc >= -3; --yInc) if (this.relGetpixel(0, yInc - 1) !== GP_NOTHING) break;
    if (yInc < -3) { this.pingu.setAction('faller'); return false; }
    this.pingu.setPos(f32(this.pingu.x + this.pingu.direction), f32(this.pingu.y - yInc));
    return true;
  }
  private haveSomethingToDig(): boolean {
    if (this.firstBash) { this.firstBash = false; return true; }
    for (let x = 0; x <= this.reach; ++x) for (let y = 5; y <= 33; ++y) if (this.relGetpixel(x, y) === GP_GROUND) return true;
    return false;
  }
}

class Blocker extends PinguAction {
  readonly type = 'blocker';
  private spr: StateSprite;
  constructor(p: Pingu) {
    super(p);
    this.spr = this.stateSprite('blocker');
    if (this.relGetpixel(0, -1) === GP_NOTHING && this.relGetpixel(0, -2) === GP_GROUND) {
      p.y = f32(p.y + 1);
    } else if (this.relGetpixel(0, -1) === GP_NOTHING && this.relGetpixel(0, -2) === GP_NOTHING && this.relGetpixel(0, -3) === GP_GROUND) {
      p.y = f32(p.y + 2);
    }
  }
  update() {
    if (this.relGetpixel(0, -1) === GP_NOTHING) { this.pingu.setAction('faller'); return; }
    for (const t of this.world.pingus.pingus) this.catchPingu(t);
    this.spr.update();
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
  catchPingu(t: Pingu) {
    const p = this.pingu;
    if (t !== p && t.x > f32(p.x - 16) && t.x < f32(p.x + 16) && t.y > f32(p.y - 32) && t.y < f32(p.y + 5)) {
      t.direction = t.x > p.x ? RIGHT : LEFT;
    }
  }
}

class Boarder extends PinguAction {
  readonly type = 'boarder';
  private speed = 0;
  private spr: StateSprite;
  constructor(p: Pingu) { super(p); this.spr = this.stateSprite('boarder'); }
  update() {
    const p = this.pingu;
    this.spr.get(p.direction).update();
    if (this.onGround()) {
      if (this.speed < 15) this.speed = f32(this.speed + f32(f32(15 * 25) / 1000));
      else this.speed = 15;
      const newX = f32(p.x + f32(p.direction * this.speed));
      // the original sets x to (old_x + (old_x < new_x)) ? 1.0f : -1.0f (an operator precedence slip) and loops
      // until it reaches new_x; where it never does, the original hangs: here the loop gives up after a while
      for (let guard = 0; newX !== p.x && guard < 100000; guard++) {
        const ox = p.x, oy = p.y;
        p.setPos(f32(ox + (ox < newX ? 1 : 0)) ? 1 : -1, oy);
        if (p.relGetpixel(1, 0)) {
          p.setPos(ox, oy);
          p.applyForce(new Vec3(f32(f32(this.speed * p.direction) * f32(0.5)), -f32(f32(this.speed * Math.abs(p.direction)) * f32(0.5))));
          p.setAction('walker');
          return;
        }
      }
    } else {
      p.applyForce(new Vec3(f32(this.speed * p.direction), 0));
      p.setAction('walker');
    }
  }
  private onGround() { return this.pingu.relGetpixel(0, -1) !== 0 || this.pingu.relGetpixel(0, -2) !== 0; }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
}

class Bomber extends PinguAction {
  readonly type = 'bomber';
  private particleThrown = false;
  private soundPlayed = false;
  private gfxExploded = false;
  private colmapExploded = false;
  private radius = new CollisionMask('other/bomber_radius_gfx', 'other/bomber_radius');
  private spr: StateSprite;
  private explo: Sprite;
  constructor(p: Pingu) {
    super(p);
    this.explo = this.sprite('explo');
    this.spr = this.stateSprite('bomber');
    this.world.playSound('ohno', p.getPos());
  }
  changeAllowed() { return false; }
  draw(gc: SceneContext) {
    const p = this.pingu;
    if (this.spr.get(p.direction).frame >= 13 && !this.gfxExploded) {
      gc.color().draw3(this.explo, { x: f32(p.x - 32), y: f32(p.y - 48), z: 0 });
      this.gfxExploded = true;
    }
    this.drawAt(gc, this.spr.get(p.direction));
  }
  update() {
    const p = this.pingu;
    this.spr.update();
    const velocity = p.velocity.clone();
    const m = linearMove(this.world, p.getPos(), velocity, PINGU_HEIGHT);
    p.setPos(m.pos.x, m.pos.y);
    const s = this.spr.get(p.direction);
    const below = this.relGetpixel(0, -1);
    if (s.frame <= 9 && (below === GP_WATER || below === GP_LAVA)) { p.setAction('drown'); return; }
    if (s.frame <= 9 && below !== GP_NOTHING && velocity.y > DEADLY_VELOCITY) { p.setAction('splashed'); return; }
    if (s.frame > 9 && !this.soundPlayed) { this.world.playSound('plop', p.getPos()); this.soundPlayed = true; }
    if (s.frame > 12 && !this.particleThrown) {
      this.particleThrown = true;
      this.world.pinguParticles.addParticle(p.xi, p.yi - 5);
    }
    if (s.frame >= 13 && !this.colmapExploded) {
      this.colmapExploded = true;
      this.world.remove(this.radius, p.xi - tr(this.radius.w / 2), p.yi - 16 - tr(this.radius.w / 2));
    }
    if (s.isFinished()) p.status = PS_DEAD;
  }
}

class Bridger extends PinguAction {
  readonly type = 'bridger';
  private mode: 'walking' | 'building' = 'building';
  private walkSprite: StateSprite;
  private buildSprite: StateSprite;
  private brickL = new CollisionMask('other/brick_left');
  private brickR = new CollisionMask('other/brick_right');
  private bricks = 15;
  private blockBuild = false;
  private name: string;
  constructor(p: Pingu) {
    super(p);
    this.name = `Bridger (${this.bricks})`;
    this.walkSprite = this.stateSprite('bridger_walk');
    this.buildSprite = this.stateSprite('bridger');
  }
  draw(gc: SceneContext) {
    let xo = 6, yo = 4;
    if (this.bricks === 15) { xo = -4; yo = 0; } else if (this.bricks === 14) { xo = 0; yo = 1; } else if (this.bricks === 13) { xo = 3; yo = 2; }
    const p = this.pingu;
    const s = this.mode === 'building' ? this.buildSprite.get(p.direction) : this.walkSprite.get(p.direction);
    gc.color().draw3(s, { x: f32(p.x - (xo * p.direction)), y: f32(p.y + yo), z: 0 });
  }
  update() { if (this.mode === 'building') this.updateBuild(); else this.updateWalk(); }
  private updateWalk() {
    const p = this.pingu;
    if (this.walkSprite.get(p.direction).isFinished()) {
      if (this.wayIsFree()) {
        this.mode = 'building';
        this.blockBuild = false;
        this.walkSprite.get(p.direction).restart();
        p.setPos(f32(p.x + f32(4 * p.direction)), f32(p.y - 2));
      } else {
        p.changeDirection();
        p.setAction('walker');
      }
    } else {
      this.walkSprite.update();
    }
  }
  private updateBuild() {
    const p = this.pingu;
    const b = this.buildSprite.get(p.direction);
    b.update();
    if (b.frame >= 7 && !this.blockBuild) {
      this.blockBuild = true;
      if (this.bricks > 0) {
        if (!this.headCollisionOnWalk(0, 2)) this.placeBrick();
        else { p.changeDirection(); p.setAction('walker'); return; }
      } else {
        p.setAction('waiter');
        return;
      }
    }
    if (b.isFinished()) { this.mode = 'walking'; b.restart(); }
  }
  private wayIsFree(): boolean {
    for (let x = 1; x <= 4; x++) if (this.relGetpixel(x, 2) !== GP_NOTHING || this.headCollisionOnWalk(x, 2)) return false;
    return true;
  }
  private placeBrick() {
    const p = this.pingu;
    this.bricks--;
    this.name = `Bridger (${this.bricks})`;
    if (this.bricks < 4) playSound('ting');
    if (p.direction === RIGHT) {
      this.world.put(this.brickR, tr(f32(f32(p.x + 10) - this.brickR.surface.w)), tr(p.y), GP_BRIDGE);
    } else {
      this.world.put(this.brickL, tr(f32(p.x - 10)), tr(p.y), GP_BRIDGE);
    }
  }
  getName() { return this.name; }
}

class Climber extends PinguAction {
  readonly type = 'climber';
  private spr: StateSprite;
  constructor(p: Pingu) { super(p); this.spr = this.stateSprite('climber'); }
  getCenterPos() { return this.pingu.getPos().add(new Vec3(this.pingu.direction === LEFT ? 16 : -16, 0)); }
  update() {
    const p = this.pingu;
    this.spr.get(p.direction).update();
    const above = this.relGetpixel(0, 1);
    if (above === GP_NOTHING || above === GP_BRIDGE) {
      if (this.relGetpixel(1, 1) !== GP_NOTHING) {
        p.setPos(p.x, f32(p.y - 1));
        return;
      }
      if (!this.headCollisionOnWalk(p.direction, 1)) p.setPos(f32(p.x + p.direction), f32(p.y - 1));
      else p.changeDirection();
      p.setAction('walker');
    } else {
      p.changeDirection();
      p.setAction('walker');
    }
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
  changeAllowed(a: ActionName) { return a === 'floater' || a === 'bomber' || a === 'jumper'; }
}

class Digger extends PinguAction {
  readonly type = 'digger';
  private radius = new CollisionMask('pingus/common/digger_radius_gfx', 'pingus/common/digger_radius');
  private radiusFinal = new CollisionMask('pingus/common/digger_radius_final_gfx', 'pingus/common/digger_radius_final_gfx');
  private spr: Sprite;
  private delay = 0;
  constructor(p: Pingu) { super(p); this.spr = this.sprite('digger/left'); }
  update() {
    this.spr.update();
    this.delay += 1;
    const below = this.relGetpixel(0, -1);
    if (below === GP_WATER || below === GP_LAVA) {
      this.pingu.setAction('drown');
    } else if (!this.haveSomethingToDig()) {
      this.dig(true);
      this.pingu.setAction('walker');
    } else if (this.delay % 4 === 0) {
      this.dig(false);
    }
  }
  private haveSomethingToDig(): boolean {
    const below = this.relGetpixel(0, -1);
    if (below === GP_NOTHING) return false;
    if (below === GP_SOLID) { playSound('chink'); return false; }
    return true;
  }
  private dig(final: boolean) {
    const p = this.pingu;
    this.world.remove(final ? this.radiusFinal : this.radius, p.xi - tr(this.radius.w / 2), p.yi - this.radius.h + 2);
    p.setPos(p.xi, p.yi + 1);
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr); }
}

class Drown extends PinguAction {
  readonly type = 'drown';
  private spr: StateSprite;
  constructor(p: Pingu) { super(p); this.spr = this.stateSprite('drownfall'); }
  update() {
    const s = this.spr.get(this.pingu.direction);
    s.update();
    if (s.isFinished()) this.pingu.status = PS_DEAD;
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
  catchable() { return false; }
}

class Exiter extends PinguAction {
  readonly type = 'exiter';
  private spr: StateSprite;
  private soundPlayed = false;
  constructor(p: Pingu) { super(p); this.spr = this.stateSprite('exit'); }
  update() {
    const s = this.spr.get(this.pingu.direction);
    s.update();
    if (!this.soundPlayed) { this.soundPlayed = true; playSound('yipee'); }
    if (s.isFinished() && this.pingu.status !== PS_EXITED) this.pingu.status = PS_EXITED;
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
}

class Faller extends PinguAction {
  readonly type = 'faller';
  private faller: StateSprite;
  private tumbler: StateSprite;
  constructor(p: Pingu) { super(p); this.faller = this.stateSprite('faller'); this.tumbler = this.stateSprite('tumbler'); }
  update() {
    const p = this.pingu;
    if (this.isTumbling()) this.tumbler.get(p.direction).update();
    else this.faller.get(p.direction).update();
    if (p.velocity.y > 5.0 && p.requestFallAction()) return;
    p.setVelocity(p.velocity.add(new Vec3(0, this.world.gravity)));
    const velocity = p.velocity.clone();
    const m = linearMove(this.world, p.getPos(), velocity, PINGU_HEIGHT);
    p.setPos(m.pos.x, m.pos.y);
    if (!m.collided) return;
    if (this.relGetpixel(0, -1) === GP_NOTHING && this.relGetpixel(0, -2) === GP_NOTHING && this.relGetpixel(0, -3) === GP_NOTHING
        && this.relGetpixel(1, 0) !== GP_NOTHING && this.relGetpixel(1, 0) !== GP_BRIDGE) {
      velocity.x = f32(-f32(velocity.x / 3));
      p.direction = velocity.x > 0 ? RIGHT : LEFT;
      p.setVelocity(velocity);
    } else if (velocity.y > 0) {
      const below = this.relGetpixel(0, -1);
      if (below === GP_WATER || below === GP_LAVA) p.setAction('drown');
      else if (Math.abs(p.velocity.y) > DEADLY_VELOCITY) p.setAction('splashed');
      else if (p.previousAction === 'blocker') p.setAction(p.previousAction);
      else p.setAction('walker');
    } else {
      velocity.y = 0;
      velocity.x = f32(velocity.x / 3);
      p.setVelocity(velocity);
    }
  }
  draw(gc: SceneContext) {
    const d = this.pingu.direction;
    this.drawAt(gc, this.isTumbling() ? this.tumbler.get(d) : this.faller.get(d));
  }
  private isTumbling() { return Math.abs(this.pingu.velocity.x) > DEADLY_VELOCITY || Math.abs(this.pingu.velocity.y) > DEADLY_VELOCITY; }
  changeAllowed(a: ActionName) { return a === 'floater' || a === 'climber' || a === 'bomber'; }
}

class Floater extends PinguAction {
  readonly type = 'floater';
  private step = 0;
  private spr: Sprite;
  constructor(p: Pingu) { super(p); this.spr = this.sprite('floater/left'); }
  update() {
    this.spr.update();
    this.pingu.setVelocity(new Vec3(0, 1));
    if (this.relGetpixel(0, -1) === GP_NOTHING) {
      ++this.step;
      if (this.step > 0) { this.pingu.y = f32(this.pingu.y + 1); this.step = 0; }
    } else {
      this.pingu.setAction('walker');
    }
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr); }
  changeAllowed(a: ActionName) { return a === 'bomber'; }
}

class Jumper extends PinguAction {
  readonly type = 'jumper';
  private spr: StateSprite;
  constructor(p: Pingu) { super(p); this.spr = this.stateSprite('jumper'); }
  update() {
    const p = this.pingu;
    if (p.previousAction === 'climber') p.changeDirection();
    const j = f32(4.58);
    p.setVelocity(p.velocity.add(new Vec3(p.direction === LEFT ? -j : j, -j)));
    p.y = f32(p.y - 1);
    p.setAction('faller');
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
}

class LaserKill extends PinguAction {
  readonly type = 'laserkill';
  private spr = new StateSprite();
  constructor(p: Pingu) { super(p); this.spr.load(LEFT, 'other/laser_kill/left'); this.spr.load(RIGHT, 'other/laser_kill/right'); }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction), 0, 2); }
  update() {
    const s = this.spr.get(this.pingu.direction);
    if (s.isFinished()) this.pingu.status = PS_DEAD;
    else s.update();
  }
  catchable() { return false; }
}

class Miner extends PinguAction {
  readonly type = 'miner';
  private radius = new CollisionMask('pingus/common/miner_radius_gfx', 'pingus/common/miner_radius');
  private radiusLeft = new CollisionMask('pingus/common/miner_radius_left_gfx', 'pingus/common/miner_radius_left');
  private radiusRight = new CollisionMask('pingus/common/miner_radius_right_gfx', 'pingus/common/miner_radius_right');
  private spr: StateSprite;
  private delay = 0;
  constructor(p: Pingu) { super(p); this.spr = this.stateSprite('miner'); }
  update() {
    const p = this.pingu;
    this.spr.get(p.direction).update();
    this.delay += 1;
    if (this.delay % 4 !== 0) return;
    if (this.relGetpixel(0, -1) === GP_NOTHING) {
      this.mine(true);
      p.setAction('walker');
    } else if (this.relGetpixel(0, -1) === GP_SOLID || this.relGetpixel(0, PINGU_HEIGHT) === GP_SOLID) {
      if (this.relGetpixel(0, -1) === GP_SOLID) playSound('chink');
      this.mine(true);
      p.changeDirection();
      p.setAction('walker');
    } else {
      this.mine(false);
      p.setPos(p.xi + p.direction, p.yi + 1);
    }
  }
  private mine(final: boolean) {
    const p = this.pingu;
    if (!final) {
      if (this.delay % 2 === 0) {
        this.world.remove(this.radius, p.xi - tr(this.radius.w / 2) + p.direction, p.yi - this.radius.h + 2);
      }
    } else {
      const r = p.direction === LEFT ? this.radiusLeft : this.radiusRight;
      this.world.remove(r, p.xi - tr(r.w / 2) + p.direction, p.yi - r.h + 2);
    }
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction)); }
}

class Slider extends PinguAction {
  readonly type = 'slider';
  private spr: StateSprite;
  private speed = 10;
  constructor(p: Pingu) { super(p); this.spr = this.stateSprite('slider'); }
  update() {
    const p = this.pingu;
    this.spr.get(p.direction).update();
    for (let i = 0; i < this.speed && this.relGetpixel(1, 0) === GP_NOTHING; ++i) {
      p.x = f32(p.x + p.direction);
      if (this.relGetpixel(0, -1) === GP_NOTHING) {
        this.speed = this.speed > 5 ? 5 : this.speed;
        p.setVelocity(p.velocity.add(new Vec3(p.direction === RIGHT ? this.speed : -this.speed, 0)));
        p.setAction('faller');
        return;
      }
    }
    this.speed = f32(this.speed - f32(7 * f32(0.025)));
    if (this.speed < 1) p.setAction('walker');
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr.get(this.pingu.direction), 0, -2); }
}

class Smashed extends PinguAction {
  readonly type = 'smashed';
  private spr: Sprite;
  constructor(p: Pingu) { super(p); this.spr = this.sprite('bomber'); }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr); }
  update() { this.spr.update(); if (this.spr.isFinished()) this.pingu.status = PS_DEAD; }
  catchable() { return false; }
}

class Splashed extends PinguAction {
  readonly type = 'splashed';
  private thrown = false;
  private spr: Sprite;
  constructor(p: Pingu) { super(p); this.spr = this.sprite('splat'); }
  update() {
    this.spr.update();
    if (!this.thrown) { this.thrown = true; this.world.playSound('splash', this.pingu.getPos()); }
    if (this.spr.isFinished()) this.pingu.status = PS_DEAD;
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr); }
  catchable() { return false; }
  changeAllowed() { return false; }
}

class Superman extends PinguAction {
  readonly type = 'superman';
  private counter = 0;
  private spr: Sprite;
  constructor(p: Pingu) { super(p); this.spr = this.sprite('superman'); }
  update() {
    this.spr.update();
    this.counter = f32(this.counter + f32(0.025));
    this.pingu.setPos(f32(this.pingu.x + f32(40 * f32(0.025))), f32(this.pingu.y - f32(200 * f32(0.025))));
    if (this.pingu.y < -32) this.pingu.status = PS_DEAD;
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr); }
}

class Waiter extends PinguAction {
  readonly type = 'waiter';
  private countdown = 2;
  private spr: Sprite;
  constructor(p: Pingu) { super(p); this.spr = this.sprite('waiter/left'); }
  update() {
    this.spr.update();
    if (this.countdown < 0) { this.pingu.setAction('walker'); return; }
    this.countdown = f32(this.countdown - f32(0.025));
  }
  draw(gc: SceneContext) { this.drawAt(gc, this.spr); }
}

class Walker extends PinguAction {
  readonly type = 'walker';
  private walker: StateSprite;
  private floaterlayer = new StateSprite();
  constructor(p: Pingu) {
    super(p);
    this.walker = this.stateSprite('walker');
    this.floaterlayer.load(LEFT, 'other/floaterlayer/left');
    this.floaterlayer.load(RIGHT, 'other/floaterlayer/right');
    p.setVelocity(new Vec3());
  }
  update() {
    const p = this.pingu;
    this.walker.get(p.direction).update(0.033);
    this.floaterlayer.get(p.direction).update(0.033);
    const lastX = p.x, lastY = p.y;
    if (this.relGetpixel(1, 0) === GP_OUTOFSCREEN) { p.x = f32(p.x + p.direction); return; }
    if (this.relGetpixel(0, -1) === GP_WATER) { p.setAction('drown'); return; }
    if (this.relGetpixel(0, -1) === GP_NOTHING) {
      let found = false, i: number;
      for (i = -2; i > -5; --i) if (this.relGetpixel(0, i) !== GP_NOTHING) { found = true; break; }
      if (found) p.y = f32(p.y - i);
      else { p.setAction('faller'); return; }
    }
    if (this.relGetpixel(1, 0) === GP_BRIDGE && !this.headCollisionOnWalk(1, 1)) {
      p.setPos(f32(p.x + p.direction), f32(p.y - 1));
    } else {
      let step = 0, found = false;
      for (let yInc = -5; yInc <= 5; ++yInc) {
        const a = this.relGetpixel(1, yInc);
        if ((a === GP_NOTHING || a === GP_BRIDGE) && this.relGetpixel(1, yInc - 1) !== GP_NOTHING) { found = true; step = yInc; }
      }
      if (found) {
        p.setPos(f32(p.x + p.direction), f32(p.y - step));
      } else if (this.relGetpixel(1, 0) !== GP_NOTHING) {
        if (p.requestWallAction()) return;
        p.changeDirection();
      } else {
        p.x = f32(p.x + p.direction);
        p.setAction('faller');
        return;
      }
    }
    if (this.headCollisionOnWalk(0, 0)) {
      p.changeDirection();
      p.setPos(lastX, lastY);
    }
  }
  draw(gc: SceneContext) {
    const d = this.pingu.direction;
    this.drawAt(gc, this.walker.get(d));
    if (this.pingu.fallAction && this.pingu.fallAction.type === 'floater') this.drawAt(gc, this.floaterlayer.get(d));
  }
}
