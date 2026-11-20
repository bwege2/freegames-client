// SuperTux 0.6.3 badguys used by Icy Island (src/badguy): Snowball and its variants,
// Mr Ice Block, Mr Bomb, Jumpy, Spiky, Stalactite, Snowman, Captain Snowball, Crystallo,
// Flame, Haywire, Gold Bomb, Ice Crusher and the Yeti.
import { Entity } from './entity.ts';
import { loadSprite } from './sprite.ts';
import { Rect, type CollisionHit } from './physics.ts';
import type { Player } from './player.ts';
import type { Sector } from './sector.ts';

const SQUISH_TIME = 2;
const FALL_TIME = 4;
const X_OFFSCREEN = 1280;
const Y_OFFSCREEN = 800;

export class BadGuy extends Entity {
  protected spritePath: string;
  protected spriteReady = false;
  protected pendingAction = '';
  dir: -1 | 1;
  startX: number;
  startY: number;
  state: 'init' | 'active' | 'inactive' | 'squished' | 'falling' | 'burning' | 'melting' = 'init';
  stateTimer = 0;
  frozen = false;
  ignited = false;
  inWater = false;
  countMe = true;
  deadScript = '';
  protected squishable = true;
  protected freezable = false;
  protected flammable = false;
  onGroundFlag = false;

  constructor(spritePath: string, x: number, y: number, dir: -1 | 1) {
    super(x, y, 32, 32);
    this.spritePath = spritePath.replace(/^\/+/, '');
    this.startX = x; this.startY = y;
    this.dir = dir;
    this.group = 'disabled';
    this.z = 0;
    void loadSprite(this.spritePath).then((s) => {
      this.sprite = s;
      this.spriteReady = true;
      const hb = s.hitbox();
      this.bbox.setSize(hb.w || 32, hb.h || 32);
      if (this.pendingAction) s.setAction(this.pendingAction);
    });
  }

  setAction(name: string, loops = -2): void {
    this.pendingAction = name;
    if (this.sprite) this.sprite.setAction(name, loops);
  }

  setDir(dir: -1 | 1): void { this.dir = dir; }
  onGround(): boolean { return this.onGroundFlag; }
  get isActive(): boolean { return this.state === 'active'; }

  /** Materialize (the original's activation) when the player comes within 1280x800. */
  tryActivate(sector: Sector): void {
    if (this.state !== 'init' && this.state !== 'inactive') return;
    const p = sector.getNearestPlayer(this.bbox);
    if (!p) return;
    const dx = Math.abs((p.bbox.middle.x) - this.bbox.middle.x);
    const dy = Math.abs((p.bbox.middle.y) - this.bbox.middle.y);
    const cam = sector.cameraCenter;
    const cdx = Math.abs(cam.x - this.bbox.middle.x);
    const cdy = Math.abs(cam.y - this.bbox.middle.y);
    if ((dx <= X_OFFSCREEN && dy <= Y_OFFSCREEN) || (cdx <= X_OFFSCREEN && cdy <= Y_OFFSCREEN)) {
      this.state = 'active';
      this.group = 'moving';
      this.initialize(sector);
    }
  }

  initialize(_sector: Sector): void {}

  update(dt: number, sector: Sector): void {
    if (this.removed) return;
    if (this.pos.y > sector.height + 200 || this.bbox.right < -200 || this.bbox.left > sector.width + 200) {
      this.remove();
      return;
    }
    if (this.state === 'init' || this.state === 'inactive') {
      this.tryActivate(sector);
      this.movement = { x: 0, y: 0 };
      return;
    }
    if (this.state === 'active') {
      this.activeUpdate(dt, sector);
      this.movement = this.getMovement(dt, sector.gravity);
      if (this.frozen) this.velocity.x = 0;
    } else if (this.state === 'squished' || this.state === 'burning') {
      this.stateTimer -= dt;
      this.movement = this.getMovement(dt, sector.gravity);
      if (this.stateTimer <= 0) this.remove();
    } else if (this.state === 'falling') {
      this.stateTimer -= dt;
      this.movement = this.getMovement(dt, sector.gravity);
      if (this.pos.y > sector.height + 200 || this.stateTimer <= 0) this.remove();
    }
    this.onGroundFlag = false;
  }

  protected activeUpdate(_dt: number, _sector: Sector): void {}

  onSolid(hit: CollisionHit, _sector: Sector): void {
    if (hit.bottom) {
      if (this.velocity.y > 0) this.velocity.y = 0;
      this.onGroundFlag = true;
    }
    if (hit.top) this.velocity.y = 0;
    this.collisionSolidExtra(hit);
  }

  protected collisionSolidExtra(_hit: CollisionHit): void {}

  onTile(attributes: number, sector: Sector): void {
    if (attributes & 0x0200 && !this.inWater) {
      this.inWater = true;
      sector.playSound('sounds/splash.wav');
    }
    if (!(attributes & 0x0200)) this.inWater = false;
    if ((attributes & 0x0400) && this.state === 'active') {
      if (attributes & 0x0800 && this.flammable) this.ignite(sector);
      else if (attributes & 0x0100 && this.freezable) this.freeze();
      else if (!(attributes & 0x0100)) this.killFall(sector);
    }
  }

  protected mightFall(height: number, sector: Sector): boolean {
    const x1 = this.dir === -1 ? this.bbox.left - 1 : this.bbox.right;
    const x2 = this.dir === -1 ? this.bbox.left : this.bbox.right + 1;
    const y1 = this.bbox.bottom + 1;
    const y2 = y1 + height;
    return sector.isFreeOfStatics(new Rect(x1, y1, x2, y2));
  }

  killSquished(player: Player | null, sector: Sector): void {
    if (this.state !== 'active') return;
    sector.playSound('sounds/squish.wav');
    this.state = 'squished';
    this.stateTimer = SQUISH_TIME;
    this.group = 'disabled';
    this.velocity.x = 0; this.velocity.y = 0;
    player?.bounce();
    void sector;
  }

  killFall(sector: Sector): void {
    if (!this.isActive) return;
    sector.playSound('sounds/fall.wav');
    this.state = 'falling';
    this.stateTimer = FALL_TIME;
    this.group = 'disabled';
    this.velocity.y = 0;
  }

  freeze(): void {
    if (this.frozen || !this.freezable) return;
    this.frozen = true;
    this.velocity.x = 0;
    this.setAction('iced');
  }

  unfreeze(): void {
    this.frozen = false;
    this.initialize(this.sector!);
  }

  ignite(sector: Sector): void {
    if (!this.flammable) return;
    void sector;
    this.ignited = true;
    this.killFall(sector);
  }

  boom(sector: Sector): void {
    this.killFall(sector);
  }

  /** player touches this badguy (called by the sector) */
  touchPlayer(player: Player, sector: Sector): void {
    if (this.state !== 'active') return;
    if (this.frozen) return;
    if (player.invincibleTimer.started() || player.stone) { this.killFall(sector); return; }
    player.kill(false, sector);
  }

  /** the player lands on top; return true when the badguy was squished (player bounces) */
  stomp(player: Player, sector: Sector): boolean {
    if (this.state !== 'active' || !this.squishable) return false;
    if (this.frozen) { this.killFall(sector); player.bounce(); return true; }
    return this.collisionSquished(player, sector);
  }

  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.killSquished(player, sector);
    return true;
  }

  protected remove(): void {
    this.removed = true;
    this.active = false;
  }

  protected sector: Sector | null = null;
  bindSector(s: Sector): void { this.sector = s; }
}

export class WalkingBadGuy extends BadGuy {
  walkSpeed: number;
  maxDropHeight: number;
  walkLeft: string;
  walkRight: string;

  constructor(spritePath: string, x: number, y: number, dir: -1 | 1, walkLeft = 'left', walkRight = 'right', speed = 80) {
    super(spritePath, x, y, dir);
    this.walkLeft = walkLeft; this.walkRight = walkRight;
    this.walkSpeed = speed;
    this.maxDropHeight = -1;
  }

  initialize(sector: Sector): void {
    void sector;
    if (this.frozen) return;
    this.setAction(this.dir === -1 ? this.walkLeft : this.walkRight);
    this.velocity.x = this.dir === -1 ? -this.walkSpeed : this.walkSpeed;
    this.acceleration.x = 0;
  }

  protected activeUpdate(dt: number, sector: Sector): void {
    void dt;
    if (this.frozen) { this.velocity.x = 0; return; }
    const target = this.dir === -1 ? -this.walkSpeed : this.walkSpeed;
    const cur = this.velocity.x;
    if (cur > target - 5 && cur < target + 5) { this.velocity.x = target; this.acceleration.x = 0; }
    else if ((target <= 0 && cur > target) || (target > 0 && cur < target)) this.acceleration.x = target;
    else this.acceleration.x = -target;
    if (this.maxDropHeight > -1 && this.onGround() && this.mightFall(this.maxDropHeight + 1, sector)) this.turnAround(sector);
    if (this.dir === -1 && this.velocity.x > 0) { this.dir = 1; this.setAction(this.walkRight); }
    else if (this.dir === 1 && this.velocity.x < 0) { this.dir = -1; this.setAction(this.walkLeft); }
  }

  turnAround(sector: Sector): void {
    void sector;
    if (this.frozen) return;
    this.dir = this.dir === -1 ? 1 : -1;
    this.setAction(this.dir === -1 ? this.walkLeft : this.walkRight);
    this.velocity.x = -this.velocity.x;
    this.acceleration.x = -this.acceleration.x;
  }

  protected collisionSolidExtra(hit: CollisionHit): void {
    if ((hit.left && this.dir === -1) || (hit.right && this.dir === 1)) this.turnAround(null as unknown as Sector);
  }
}

export class SnowBall extends WalkingBadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/snowball/snowball.sprite', x, y, dir);
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.setAction(this.dir === -1 ? 'squished-left' : 'squished-right');
    this.killSquished(player, sector);
    return true;
  }
}

export class SmartBall extends WalkingBadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/snowball/smart-snowball.sprite', x, y, dir);
    this.maxDropHeight = 16;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.setAction(this.dir === -1 ? 'squished-left' : 'squished-right');
    this.killSquished(player, sector);
    return true;
  }
}

export class Spiky extends WalkingBadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/spiky/spiky.sprite', x, y, dir);
    this.maxDropHeight = 600;
    this.squishable = false;
    this.freezable = true;
    this.flammable = true;
  }
}

export class MrIceBlock extends WalkingBadGuy {
  iceState: 'normal' | 'kicked' | 'flat' | 'waking' | 'grabbed' = 'normal';
  flatTimer = 0;
  nokickTimer = 0;
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/mr_iceblock/mr_iceblock.sprite', x, y, dir);
    this.maxDropHeight = 600;
  }
  protected activeUpdate(dt: number, sector: Sector): void {
    if (this.iceState === 'flat') {
      this.flatTimer -= dt;
      this.velocity.x = 0;
      if (this.flatTimer <= 0) { this.iceState = 'waking'; this.setAction('waking-left'); }
      return;
    }
    if (this.iceState === 'waking') {
      this.velocity.x = 0;
      if (this.sprite?.animationDone() || this.flatTimer <= 0) { this.iceState = 'normal'; this.initialize(sector); }
      this.flatTimer -= dt;
      return;
    }
    if (this.iceState === 'kicked') {
      this.velocity.y += sector.gravity * 100 * dt;
      this.movement = { x: this.velocity.x * dt, y: this.velocity.y * dt };
      return;
    }
    super.activeUpdate(dt, sector);
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    if (this.iceState !== 'normal') return false;
    this.iceState = 'flat';
    this.flatTimer = 2;
    this.setAction(this.dir === -1 ? 'flat-left' : 'flat-right');
    this.velocity.x = 0;
    this.acceleration.x = 0;
    sector.playSound('sounds/stomp.wav');
    player.bounce();
    return true;
  }
  /** the original: Tux kicks a flat ice block when he runs into it */
  kick(dir: -1 | 1, sector: Sector): void {
    if (this.iceState !== 'flat' && this.iceState !== 'waking') return;
    this.iceState = 'kicked';
    this.dir = dir;
    this.velocity.x = dir * 500;
    this.setAction(dir === -1 ? 'flat-left' : 'flat-right');
    sector.playSound('sounds/kick.wav');
  }
  protected collisionSolidExtra(hit: CollisionHit): void {
    if (this.iceState === 'kicked' && ((hit.left && this.dir === -1) || (hit.right && this.dir === 1))) {
      this.dir = this.dir === -1 ? 1 : -1;
      this.velocity.x = -this.velocity.x * 0.975;
      this.setAction(this.dir === -1 ? 'flat-left' : 'flat-right');
    }
  }
  touchPlayer(player: Player, sector: Sector): void {
    if (this.iceState === 'normal') { player.kill(false, sector); return; }
    if (this.iceState === 'flat' || this.iceState === 'waking') {
      if (player.onGround()) {
        if (Math.abs(player.velocity.x) > 100) this.kick(player.dir, sector);
        else player.kill(false, sector);
      }
    }
  }
}

export class MrBomb extends WalkingBadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/mr_bomb/mr_bomb.sprite', x, y, dir);
    this.maxDropHeight = 16;
    this.freezable = true;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.killSquished(player, sector);
    sector.explode(this.bbox.middle, 90);
    sector.playSound('sounds/explosion.wav');
    return true;
  }
}

export class Jumpy extends BadGuy {
  groundHitY = 0;
  groundHitSet = false;
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/snowjumpy/snowjumpy.sprite', x, y, dir);
    this.freezable = true;
  }
  initialize(sector: Sector): void { void sector; this.setAction(this.dir === -1 ? 'editor-left' : 'editor-right'); }
  protected activeUpdate(_dt: number, sector: Sector): void {
    const p = sector.getNearestPlayer(this.bbox);
    if (p) this.dir = p.bbox.left > this.bbox.left ? 1 : -1;
    if (!this.groundHitSet || this.onGround()) {
      if (!this.groundHitSet) { this.groundHitY = this.bbox.top; this.groundHitSet = true; }
      this.velocity.y = this.frozen ? 0 : -600;
      this.onGroundFlag = false;
    }
    const dy = this.bbox.top - this.groundHitY;
    this.setAction(`${this.dir === -1 ? 'left' : 'right'}-${dy < -4 ? 'up' : dy < -2 ? 'middle' : 'down'}`);
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.killSquished(player, sector);
    return true;
  }
}

export class BouncingSnowball extends BadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/bouncing_snowball/bouncing_snowball.sprite', x, y, dir);
    this.freezable = true;
    this.flammable = true;
  }
  initialize(_sector: Sector): void {
    this.velocity.x = this.dir === -1 ? -80 : 80;
    this.setAction(this.dir === -1 ? 'left' : 'right');
  }
  protected activeUpdate(_dt: number, _sector: Sector): void {}
  protected collisionSolidExtra(hit: CollisionHit): void {
    if (hit.bottom && this.state === 'active') {
      this.velocity.y = Math.min(-450, -this.velocity.y * 0.8);
      this.setAction(`${this.dir === -1 ? 'left' : 'right'}-up`, 1);
    }
    if ((hit.left && this.dir === -1) || (hit.right && this.dir === 1)) {
      this.dir = this.dir === -1 ? 1 : -1;
      this.setAction(this.dir === -1 ? 'left' : 'right');
      this.velocity.x = -this.velocity.x;
    }
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.setAction('squished');
    this.killSquished(player, sector);
    return true;
  }
}

export class FlyingSnowball extends BadGuy {
  elapsed = 0;
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/flying_snowball/flying_snowball.sprite', x, y, dir);
    this.gravityEnabled = false;
    this.velocity.x = dir * 100;
    this.freezable = true;
    this.flammable = true;
  }
  initialize(_sector: Sector): void { this.setAction(this.dir === -1 ? 'left' : 'right'); }
  protected activeUpdate(dt: number, sector: Sector): void {
    this.elapsed = (this.elapsed + dt) % (Math.PI * 2 / 0.8);
    const delta = this.elapsed * 0.8;
    const target = Math.pow(Math.sin(delta), 3) + Math.sin(3 * ((delta - Math.PI) / 3)) / 3;
    this.velocity.y = target * 100 + this.startY - this.bbox.top;
    this.movement = { x: this.velocity.x * dt, y: this.velocity.y * dt };
    const p = sector.getNearestPlayer(this.bbox);
    if (p) { this.dir = p.bbox.left > this.bbox.left ? 1 : -1; this.setAction(this.dir === -1 ? 'left' : 'right'); }
    this.velocity.x = this.dir * 100;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.setAction(this.dir === -1 ? 'squished-left' : 'squished-right');
    this.gravityEnabled = true;
    this.killSquished(player, sector);
    return true;
  }
}

export class Stalactite extends BadGuy {
  shaking = false;
  shakeTimer = 0;
  constructor(x: number, y: number) {
    super('images/creatures/stalactite/stalactite.sprite', x, y, -1);
    this.group = 'touchable';
    this.countMe = false;
    this.gravityEnabled = false;
    this.z = -1;
  }
  initialize(_sector: Sector): void { this.setAction('hanging'); }
  protected activeUpdate(dt: number, sector: Sector): void {
    if (!this.shaking) {
      const p = sector.getNearestPlayer(this.bbox);
      if (p && p.bbox.right > this.bbox.left - 40 && p.bbox.left < this.bbox.right + 40 &&
        p.bbox.bottom > this.bbox.top && p.bbox.top < this.bbox.bottom + 400 && sector.canSee(this.bbox.middle)) {
        this.shaking = true;
        this.shakeTimer = 0.8;
        sector.playSound('sounds/cracking.wav');
      }
      this.velocity.y = 0;
      this.setAction('hanging');
    } else {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) {
        this.gravityEnabled = true;
        this.group = 'moving';
        this.setAction('falling');
        this.velocity.y = 0;
      } else {
        this.velocity.y = 0;
      }
    }
  }
  onSolid(hit: CollisionHit, sector: Sector): void {
    if (hit.bottom && this.shaking) {
      this.state = 'squished';
      this.stateTimer = 2;
      this.velocity.x = 0; this.velocity.y = 0;
      this.setAction('squished');
      this.group = 'disabled';
      sector.playSound('sounds/icecrash.ogg');
    }
  }
  touchPlayer(player: Player, sector: Sector): void {
    if (this.state === 'active') player.kill(false, sector);
  }
}

export class Snowman extends WalkingBadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/snowman/snowman.sprite', x, y, dir, 'left', 'right', 40);
    this.flammable = true;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    sector.add(new SnowBall(this.bbox.left + 5, this.bbox.top + 1, this.dir));
    this.setAction(this.dir === -1 ? 'headless-left' : 'headless-right');
    this.state = 'falling';
    this.stateTimer = FALL_TIME;
    this.group = 'disabled';
    player.bounce();
    sector.playSound('sounds/pop.ogg');
    return true;
  }
}

export class CaptainSnowball extends WalkingBadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/snowball/cpt-snowball.sprite', x, y, dir, 'left', 'right', 200);
    this.maxDropHeight = -1;
  }
  initialize(sector: Sector): void {
    super.initialize(sector);
    this.velocity.y = -400;
  }
  protected activeUpdate(dt: number, sector: Sector): void {
    if (this.onGround() && this.mightClimb(8, 64, sector)) this.velocity.y = -400;
    super.activeUpdate(dt, sector);
  }
  private mightClimb(width: number, height: number, sector: Sector): boolean {
    const x1 = this.dir === -1 ? this.bbox.left - width : this.bbox.right + 1;
    const x2 = this.dir === -1 ? this.bbox.left - 1 : this.bbox.right + width;
    const a = sector.isFreeOfStatics(new Rect(x1, this.bbox.top + 1, x2, this.bbox.bottom - 1));
    const b = sector.isFreeOfStatics(new Rect(x1, this.bbox.top + 1 - height, x2, this.bbox.bottom - 1 - height));
    return !a && b;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.setAction(this.dir === -1 ? 'squished-left' : 'squished-right');
    this.killSquished(player, sector);
    return true;
  }
}

export class Crystallo extends WalkingBadGuy {
  radius: number;
  constructor(x: number, y: number, dir: -1 | 1, radius = 100) {
    super('images/creatures/crystallo/crystallo.sprite', x, y, dir);
    this.maxDropHeight = 16;
    this.radius = radius;
    this.freezable = true;
  }
  protected activeUpdate(dt: number, sector: Sector): void {
    let target = this.dir === -1 ? -80 : 80;
    if (this.dir !== -1 && this.bbox.left > this.startX + this.radius - 20) target = -80;
    if (this.dir !== 1 && this.bbox.left < this.startX - this.radius + 20) target = 80;
    this.setAction(Math.abs(this.velocity.x) < 80 ? (this.dir === -1 ? 'slowdown-left' : 'slowdown-right') : (this.dir === -1 ? 'left' : 'right'));
    void dt; void sector;
    this.acceleration.x = 0;
    this.velocity.x = target;
    this.dir = target < 0 ? -1 : 1;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.setAction(this.dir === -1 ? 'shattered-left' : 'shattered-right');
    this.killSquished(player, sector);
    return true;
  }
}

export class Flame extends BadGuy {
  angle = 0;
  radius: number;
  speed: number;
  constructor(x: number, y: number, radius = 100, speed = 2, sprite = 'images/creatures/flame/flame.sprite') {
    super(sprite, x, y, 1);
    this.radius = radius;
    this.speed = speed;
    this.group = 'touchable';
    this.countMe = false;
    this.freezable = true;
    this.gravityEnabled = false;
    this.z = -1;
  }
  initialize(_sector: Sector): void { this.setAction('default'); }
  protected activeUpdate(dt: number, _sector: Sector): void {
    this.angle = (this.angle + dt * this.speed) % (Math.PI * 2);
    const nx = this.startX + Math.cos(this.angle) * this.radius;
    const ny = this.startY + Math.sin(this.angle) * this.radius;
    this.bbox.move({ x: nx - this.bbox.left, y: ny - this.bbox.top });
    this.movement = { x: 0, y: 0 };
  }
  protected collisionSquished(player: Player, sector: Sector): boolean { void player; void sector; return false; }
  touchPlayer(player: Player, sector: Sector): void {
    if (this.state === 'active') player.kill(false, sector);
  }
  freeze(): void {
    this.state = 'burning';
    this.stateTimer = 0.4;
    this.setAction('fade', 1);
    this.group = 'disabled';
  }
}

export class GoldBomb extends WalkingBadGuy {
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/gold_bomb/gold_bomb.sprite', x, y, dir);
    this.maxDropHeight = 16;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    sector.explode(this.bbox.middle, 80);
    sector.spawnCoins(this.bbox.middle, 5);
    this.state = 'squished';
    this.stateTimer = 0.01;
    this.group = 'disabled';
    this.setAction('squished');
    player.bounce();
    sector.playSound('sounds/explosion.wav');
    return true;
  }
}

export class Haywire extends WalkingBadGuy {
  fuse = 0;
  constructor(x: number, y: number, dir: -1 | 1) {
    super('images/creatures/haywire/haywire.sprite', x, y, dir);
    this.maxDropHeight = 16;
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    sector.explode(this.bbox.middle, 80);
    this.state = 'squished';
    this.stateTimer = 0.01;
    this.group = 'disabled';
    this.setAction('squished');
    player.bounce();
    sector.playSound('sounds/explosion.wav');
    return true;
  }
}

export class IceCrusher extends BadGuy {
  triggered = false;
  constructor(x: number, y: number) {
    super('images/creatures/icecrusher/krosh.sprite', x, y, 1);
    this.gravityEnabled = false;
    this.group = 'static';
    this.countMe = false;
  }
  initialize(_sector: Sector): void { this.setAction('idle'); }
  protected activeUpdate(_dt: number, sector: Sector): void {
    if (!this.triggered) {
      const p = sector.getNearestPlayer(this.bbox);
      if (p && p.bbox.right > this.bbox.left && p.bbox.left < this.bbox.right && p.bbox.top > this.bbox.bottom) {
        this.triggered = true;
        this.gravityEnabled = true;
        this.group = 'moving';
      }
      this.velocity.y = 0;
    }
  }
  onSolid(hit: CollisionHit, sector: Sector): void {
    if (hit.bottom && this.triggered) {
      this.triggered = false;
      this.gravityEnabled = false;
      this.group = 'static';
      this.velocity.y = 0;
      sector.playSound('sounds/icecrash.ogg');
      sector.shake(0.2, 3);
    }
  }
  touchPlayer(player: Player, sector: Sector): void { player.kill(false, sector); }
}

export class Yeti extends WalkingBadGuy {
  hits = 0;
  constructor(x: number, y: number) {
    super('images/creatures/yeti/yeti.sprite', x, y, -1, 'walking-left', 'walking-right', 80);
    this.maxDropHeight = -1;
    this.z = 1;
  }
  initialize(sector: Sector): void {
    super.initialize(sector);
    this.setAction('stand-left');
  }
  protected collisionSquished(player: Player, sector: Sector): boolean {
    this.hits++;
    player.bounce();
    sector.playSound('sounds/yeti_gna.wav');
    if (this.hits >= 3) {
      this.state = 'squished';
      this.stateTimer = 2;
      this.group = 'disabled';
      this.velocity.x = 0;
      sector.finishLevel();
      return true;
    }
    this.velocity.x = -this.velocity.x;
    this.dir = this.dir === -1 ? 1 : -1;
    this.setAction('stand-left');
    return true;
  }
}

export function makeBadGuy(type: string, x: number, y: number, dir: -1 | 1, props: { radius?: number; speed?: number; sprite?: string } = {}): BadGuy | null {
  switch (type) {
    case 'snowball': return new SnowBall(x, y, dir);
    case 'smartball': return new SmartBall(x, y, dir);
    case 'jumpy': return new Jumpy(x, y, dir);
    case 'spiky': return new Spiky(x, y, dir);
    case 'mriceblock': return new MrIceBlock(x, y, dir);
    case 'mrbomb': return new MrBomb(x, y, dir);
    case 'bouncingsnowball': return new BouncingSnowball(x, y, dir);
    case 'flyingsnowball': return new FlyingSnowball(x, y, dir);
    case 'stalactite': return new Stalactite(x, y);
    case 'snowman': return new Snowman(x, y, dir);
    case 'captainsnowball': return new CaptainSnowball(x, y, dir);
    case 'crystallo': return new Crystallo(x, y, dir, props.radius ?? 100);
    case 'flame': return new Flame(x, y, props.radius ?? 100, props.speed ?? 2, props.sprite);
    case 'goldbomb': return new GoldBomb(x, y, dir);
    case 'haywire': return new Haywire(x, y, dir);
    case 'icecrusher': return new IceCrusher(x, y);
    case 'yeti': return new Yeti(x, y);
    case 'sspiky': return new Spiky(x, y, dir);
    default: return null;
  }
}

