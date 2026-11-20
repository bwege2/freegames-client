// Blocks, coins, power-ups, platforms, triggers and bullets: the objects Icy Island's levels place
// directly (src/object/*.cpp).
import { Entity } from './entity.ts';
import { loadSprite, type Sprite } from './sprite.ts';
import { imageReady } from './resources.ts';
import { type CollisionHit, type Vec } from './physics.ts';
import { Bonus, type Player } from './player.ts';
import type { Sector } from './sector.ts';

function spriteSize(s: Sprite | null, fallbackW = 32, fallbackH = 32): [number, number] {
  const hb = s?.hitbox();
  return [hb?.w || fallbackW, hb?.h || fallbackH];
}

/** a static, solid block that may react to being hit from below */
export class Block extends Entity {
  protected spritePath: string;
  readonly solid = true;
  constructor(spritePath: string, x: number, y: number, w = 32, h = 32) {
    super(x, y, w, h);
    this.spritePath = spritePath.replace(/^\/+/, '');
    this.group = 'static';
    this.z = 0;
    void loadSprite(this.spritePath).then((s) => {
      this.sprite = s;
      const [sw, sh] = spriteSize(s);
      if (this.bbox.width === 32 && this.bbox.height === 32) this.bbox.setSize(sw || 32, sh || 32);
      s.setAction('normal');
    });
  }
  hitFromBelow(_player: Player, _sector: Sector): void {}
  get isSolid(): boolean { return this.solid; }
  update(_dt?: number, _sector?: Sector): void { this.movement = { x: 0, y: 0 }; }
}

export class BonusBlock extends Block {
  count: number;
  used = false;
  private bump = 0;
  constructor(sprite: string, x: number, y: number, count: number) {
    super(sprite, x, y);
    this.count = count;
  }
  hitFromBelow(player: Player, sector: Sector): void {
    if (this.used) return;
    player.status.addCoins(1);
    player.velocity.y = 0.2;
    sector.playSound('sounds/coin.wav');
    this.bump = 0.2;
    this.count--;
    if (this.count <= 0) {
      this.used = true;
      this.sprite?.setAction('empty');
    }
    void this.sprite;
  }
  update(dt: number, _sector: Sector): void {
    this.movement = { x: 0, y: 0 };
    if (this.bump > 0) this.bump = Math.max(0, this.bump - dt);
  }
  draw(ctx: CanvasRenderingContext2D): void {
    const off = this.bump > 0 ? -Math.sin((0.2 - this.bump) / 0.2 * Math.PI) * 6 : 0;
    this.sprite?.draw(ctx, this.bbox.left, this.bbox.top + off);
  }
}

export class InfoBlock extends Block {
  message: string;
  constructor(x: number, y: number, message: string) {
    super('images/objects/bonus_block/infoblock.sprite', x, y);
    this.message = message;
  }
  hitFromBelow(_player: Player, sector: Sector): void {
    sector.showMessage(this.message);
    sector.playSound('sounds/phone.wav');
  }
  update(): void { this.movement = { x: 0, y: 0 }; }
}

export class WeakBlock extends Block {
  burning = 0;
  constructor(sprite: string, x: number, y: number) {
    super(sprite, x, y);
  }
  update(dt: number, sector: Sector): void {
    this.movement = { x: 0, y: 0 };
    if (this.burning > 0) {
      this.burning -= dt;
      if (this.burning <= 0) {
        sector.explode(this.bbox.middle, 20);
        this.removed = true;
        this.active = false;
      }
    }
  }
  ignite(sector: Sector): void {
    if (this.burning > 0) return;
    this.burning = 0.6;
    this.sprite?.setAction('burning', 1);
    sector.playSound('sounds/fire.ogg');
  }
  onBullet(type: Bonus, sector: Sector): boolean {
    if (type === Bonus.FIRE) { this.ignite(sector); return true; }
    return false;
  }
}

export class UnstableTile extends Block {
  state: 'normal' | 'shaking' | 'falling' = 'normal';
  timer = 0;
  constructor(x: number, y: number) {
    super('images/objects/unstable_tile/snow.sprite', x, y);
  }
  update(dt: number, sector: Sector): void {
    if (this.state === 'normal') { this.movement = { x: 0, y: 0 }; return; }
    if (this.state === 'shaking') {
      this.timer -= dt;
      this.movement = { x: 0, y: 0 };
      if (this.timer <= 0) { this.state = 'falling'; this.group = 'disabled'; this.movement = { x: 0, y: 0 }; }
      return;
    }
    this.velocity.y += sector.gravity * 100 * dt;
    this.bbox.move({ x: 0, y: this.velocity.y * dt });
    this.movement = { x: 0, y: 0 };
    if (this.bbox.top > sector.height + 100) { this.removed = true; this.active = false; }
  }
  playerTouched(): void {
    if (this.state === 'normal') { this.state = 'shaking'; this.timer = 0.5; this.sprite?.setAction('shake', 1); }
  }
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.state === 'shaking') {
      const dx = Math.sin(this.timer * 80) * 2;
      this.sprite?.draw(ctx, this.bbox.left + dx, this.bbox.top);
    } else this.sprite?.draw(ctx, this.bbox.left, this.bbox.top);
  }
}

export class Trampoline extends Block {
  constructor(x: number, y: number, sprite = 'images/objects/trampoline/trampoline.sprite') {
    super(sprite, x, y);
  }
  update(): void { this.movement = { x: 0, y: 0 }; }
}

export class Coin extends Entity {
  collected = false;
  constructor(x: number, y: number, moving = false) {
    super(x, y, 16, 16);
    this.group = 'touchable';
    this.z = 0;
    void loadSprite('images/objects/coin/coin.sprite').then((s) => {
      this.sprite = s;
      s.setAction(moving ? 'editor-path' : 'normal');
      this.bbox.setSize(16, 16);
    });
  }
  update(_dt: number, _sector: Sector): void { this.movement = { x: 0, y: 0 }; }
  collect(player: Player, sector: Sector): void {
    if (this.collected) return;
    this.collected = true;
    this.removed = true;
    this.active = false;
    player.status.addCoins(1);
    sector.playSound('sounds/coin.wav');
  }
}

export class PowerUp extends Entity {
  bonus: Bonus;
  constructor(x: number, y: number, bonus: Bonus) {
    super(x, y, 32, 32);
    this.bonus = bonus;
    this.group = 'touchable';
    const path = bonus === Bonus.FIRE ? 'images/powerups/fireflower/fireflower.sprite'
      : bonus === Bonus.ICE ? 'images/powerups/iceflower/iceflower.sprite'
      : bonus === Bonus.GROWUP ? 'images/powerups/egg/egg.sprite' : 'images/powerups/star/star.sprite';
    void loadSprite(path).then((s) => { this.sprite = s; const hb = s.hitbox(); this.bbox.setSize(hb.w || 32, hb.h || 32); });
  }
  update(): void { this.movement = { x: 0, y: 0 }; }
  collect(player: Player, sector: Sector): void {
    if (this.bonus === Bonus.GROWUP || this.bonus === Bonus.FIRE || this.bonus === Bonus.ICE) player.addBonus(this.bonus, sector);
    else player.makeInvincible();
    this.removed = true;
    this.active = false;
    sector.playSound('sounds/upgrade.wav');
  }
}

export class PathWalker {
  nodes: { x: number; y: number; time: number }[];
  mode: 'oneshot' | 'ping-pong' | 'circular';
  current = 0;
  next = 1;
  progress = 0;
  running = true;
  dir = 1;
  nodeTime: number;

  constructor(nodes: { x: number; y: number; time: number }[], mode: 'oneshot' | 'ping-pong' | 'circular') {
    this.nodes = nodes.length ? nodes : [{ x: 0, y: 0, time: 1 }];
    this.mode = mode;
    this.nodeTime = this.nodes[0].time;
    this.x = this.nodes[0].x;
    this.y = this.nodes[0].y;
    if (this.nodes.length === 1) this.running = false;
  }

  gotoNode(n: number): void {
    if (n < 0 || n >= this.nodes.length) return;
    this.current = n; this.next = Math.min(n + 1, this.nodes.length - 1);
    this.progress = 0; this.running = true;
  }
  startMoving(): void { this.running = true; }
  stopMoving(): void { this.running = false; }

  update(dt: number): void {
    if (!this.running || this.nodes.length < 2) return;
    this.progress += dt / Math.max(0.0001, this.nodeTime);
    while (this.progress >= 1) {
      this.progress -= 1;
      this.current = this.next;
      if (this.dir > 0) {
        if (this.next + 1 < this.nodes.length) this.next++;
        else if (this.mode === 'circular') this.next = 0;
        else if (this.mode === 'ping-pong') { this.dir = -1; this.next = Math.max(0, this.current - 1); }
        else { this.running = false; this.next = this.current; }
      } else {
        if (this.next - 1 >= 0) this.next--;
        else if (this.mode === 'circular') this.next = this.nodes.length - 1;
        else { this.dir = 1; this.next = Math.min(this.nodes.length - 1, this.current + 1); }
      }
      this.nodeTime = this.nodes[this.dir > 0 ? this.current : this.next].time;
    }
    const t = this.progress;
    const a = this.nodes[this.current], b = this.nodes[this.next];
    this.x = a.x + (b.x - a.x) * t;
    this.y = a.y + (b.y - a.y) * t;
  }
  x = 0;
  y = 0;
}

export class Platform extends Entity {
  walker: PathWalker;
  automatic: boolean;
  constructor(sprite: string, walker: PathWalker, startNode: number, automatic: boolean) {
    super(0, 0, 32, 32);
    this.walker = walker;
    this.automatic = automatic;
    this.group = 'static';
    this.z = -1;
    void loadSprite(sprite.replace(/^\/+/, '')).then((s) => {
      this.sprite = s;
      const [w, h] = spriteSize(s, 32, 32);
      this.bbox.setSize(w, h);
    });
    walker.gotoNode(startNode);
    walker.running = !automatic;
    this.setPos(walker.nodes[startNode].x, walker.nodes[startNode].y);
  }
  startMoving(): void { this.walker.startMoving(); }
  stopMoving(): void { this.walker.stopMoving(); }
  gotoNode(n: number): void { this.walker.gotoNode(n); }
  update(dt: number, _sector: Sector): void {
    const oldX = this.bbox.left, oldY = this.bbox.top;
    this.walker.update(dt);
    const nx = this.walker.x, ny = this.walker.y;
    this.movement = this.sprite ? { x: nx - oldX, y: ny - oldY } : { x: 0, y: 0 };
  }
  draw(ctx: CanvasRenderingContext2D): void {
    this.sprite?.draw(ctx, this.bbox.left, this.bbox.top);
  }
}

export class Bullet extends Entity {
  type: Bonus;
  dir: -1 | 1;
  lifetime = 4;
  constructor(pos: Vec, velocity: Vec, dir: -1 | 1, type: Bonus) {
    super(pos.x - 8, pos.y - 8, 16, 16);
    this.type = type; this.dir = dir;
    this.velocity = { ...velocity };
    this.gravityEnabled = false;
    this.group = 'moving';
    this.z = 1;
    const path = type === Bonus.FIRE ? 'images/objects/bullets/firebullet.sprite' : 'images/objects/bullets/icebullet.sprite';
    void loadSprite(path).then((s) => { this.sprite = s; s.setAction(dir === 1 ? 'right' : 'left'); const hb = s.hitbox(); this.bbox.setSize(hb.w || 16, hb.h || 16); });
  }
  update(dt: number, _sector: Sector): void {
    this.lifetime -= dt;
    if (this.lifetime <= 0) { this.removed = true; this.active = false; return; }
    this.movement = { x: this.velocity.x * dt, y: this.velocity.y * dt };
  }
  onSolid(_hit: CollisionHit, sector: Sector): void {
    this.removed = true; this.active = false;
    sector.playSound(this.type === Bonus.FIRE ? 'sounds/fizz.wav' : 'sounds/sizzle.ogg');
  }
}

export class Bomb extends Entity {
  fuse = 1.1;
  constructor(pos: Vec, dir: -1 | 1) {
    super(pos.x - 16, pos.y - 32, 32, 32);
    this.dir = dir;
    this.group = 'moving';
    this.velocity.x = dir * 100;
    this.z = 1;
    void loadSprite('images/creatures/mr_bomb/bomb.sprite').then((s) => { this.sprite = s; s.setAction('default'); });
  }
  dir: -1 | 1;
  update(dt: number, sector: Sector): void {
    this.fuse -= dt;
    this.movement = this.getMovement(dt, sector.gravity);
    if (this.fuse <= 0) {
      this.removed = true; this.active = false;
      sector.explode(this.bbox.middle, 100);
      sector.playSound('sounds/explosion.wav');
    }
  }
  onSolid(hit: CollisionHit): void {
    if (hit.bottom) this.velocity.y = 0;
    if (hit.left || hit.right) { this.dir = this.dir === -1 ? 1 : -1; this.velocity.x = -this.velocity.x; }
  }
}

export class Explosion {
  x: number; y: number; radius: number; life = 0.25;
  constructor(x: number, y: number, radius: number) { this.x = x; this.y = y; this.radius = radius; }
  update(dt: number): void { this.life -= dt; }
  draw(ctx: CanvasRenderingContext2D): void {
    const img = imageReady('images/objects/explosion/explosion-0.png');
    if (!img) return;
    ctx.globalAlpha = Math.max(0, this.life / 0.25);
    ctx.drawImage(img, this.x - 48, this.y - 48, 96, 96);
    ctx.globalAlpha = 1;
  }
}

export class Trigger extends Entity {
  script: string;
  sequence: string;
  once = true;
  fired = false;
  constructor(x: number, y: number, w: number, h: number, script: string, sequence: string) {
    super(x, y, w, h);
    this.script = script; this.sequence = sequence;
    this.group = 'touchable';
  }
  update(): void { this.movement = { x: 0, y: 0 }; }
  playerInside(player: Player): boolean {
    return player.bbox.right > this.bbox.left && player.bbox.left < this.bbox.right &&
      player.bbox.bottom > this.bbox.top && player.bbox.top < this.bbox.bottom;
  }
}

export class PushButton extends Entity {
  script: string;
  pressed = 0;
  constructor(x: number, y: number, script: string, sprite: string) {
    super(x, y, 32, 32);
    this.script = script;
    this.group = 'touchable';
    this.z = 0;
    if (sprite) void loadSprite(sprite.replace(/^\/+/, '')).then((s) => { this.sprite = s; const hb = s.hitbox(); this.bbox.setSize(hb.w || 32, hb.h || 32); });
  }
  update(dt: number): void {
    this.movement = { x: 0, y: 0 };
    if (this.pressed > 0) this.pressed -= dt;
  }
}

export class Dispenser extends Entity {
  cycle: number;
  timer: number;
  badguyType: string;
  constructor(x: number, y: number, cycle: number, badguyType: string) {
    super(x, y, 32, 32);
    this.cycle = Math.max(0.5, cycle);
    this.timer = this.cycle;
    this.badguyType = badguyType;
    this.group = 'static';
    void loadSprite('images/creatures/dispenser/dispenser.sprite').then((s) => { this.sprite = s; s.setAction('idle'); });
  }
  update(dt: number, sector: Sector): void {
    this.movement = { x: 0, y: 0 };
    this.timer -= dt;
    if (this.timer <= 0) { this.timer = this.cycle; sector.spawnBadGuy(this.badguyType, this.bbox.left + 8, this.bbox.top + 8, -1); }
  }
}

export class Firefly extends Entity {
  constructor(x: number, y: number) {
    super(x, y, 16, 16);
    this.group = 'disabled';
    this.z = 1;
    void loadSprite('images/objects/firefly/firefly.sprite').then((s) => { this.sprite = s; s.setAction('default'); this.bbox.setSize(16, 16); });
  }
  update(): void { this.movement = { x: 0, y: 0 }; }
}

export class Decal extends Entity {
  constructor(x: number, y: number, z: number, spritePath: string) {
    super(x, y, 32, 32);
    this.group = 'disabled';
    this.z = z;
    if (spritePath.endsWith('.sprite')) void loadSprite(spritePath.replace(/^\/+/, '')).then((s) => { this.sprite = s; });
    else this.imagePath = spritePath.replace(/^\/+/, '');
  }
  private imagePath = '';
  update(): void { this.movement = { x: 0, y: 0 }; }
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.sprite) { this.sprite.draw(ctx, this.bbox.left, this.bbox.top); return; }
    const img = imageReady(this.imagePath);
    if (img) ctx.drawImage(img, this.bbox.left, this.bbox.top);
  }
}

export class BouncyCoin extends Coin {
  vy: number;
  constructor(x: number, y: number) {
    super(x, y, true);
    this.vy = -300;
    this.gravityEnabled = true;
  }
  update(dt: number, sector: Sector): void {
    this.velocity.y += sector.gravity * 100 * dt;
    this.bbox.move({ x: 0, y: this.velocity.y * dt });
    this.movement = { x: 0, y: 0 };
    if (this.velocity.y > 300) { this.removed = true; this.active = false; }
  }
}

export { Bonus };

/** A ladder/climbable strip (src/trigger/climbable.cpp): Tux climbs while he overlaps it. */
export class Climbable extends Entity {
  constructor(x: number, y: number, w: number, h: number) {
    super(x, y, w || 32, h || 32);
    this.group = 'touchable';
  }
  update(): void { this.movement = { x: 0, y: 0 }; }
}
