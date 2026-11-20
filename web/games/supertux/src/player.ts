// Tux, from SuperTux 0.6.3 src/object/player.cpp. Movement, jumping, ducking, wall jumps,
// power-ups, fire/ice bullets, swimming and damage follow the original's constants and order.
import { loadSprite, type Sprite } from './sprite.ts';
import { Entity, type Controller } from './entity.ts';
import { type CollisionHit, type Vec } from './physics.ts';
import type { Sector } from './sector.ts';
import { Timer } from './timer.ts';

export const TUX_WIDTH = 31.8;
export const RUNNING_TUX_WIDTH = 34;
export const SMALL_TUX_HEIGHT = 30.8;
export const BIG_TUX_HEIGHT = 62.8;
export const DUCKED_TUX_HEIGHT = 31.8;

const TUX_SAFE_TIME = 1.8;
const TUX_INVINCIBLE_TIME = 14.0;
const TUX_BACKFLIP_TIME = 2.1;
const BUTTJUMP_MIN_VELOCITY_Y = 400;
const SHOOTING_TIME = 0.15;
const WALK_ACCELERATION_X = 300;
const RUN_ACCELERATION_X = 400;
const SKID_XM = 200;
const SKID_TIME = 0.3;
const MAX_WALK_XM = 230;
const MAX_RUN_XM = 320;
const BONUS_RUN_XM = 80;
const WALK_SPEED = 100;
const BOOST_DECREASE_RATE = 500;
const OVERSPEED_DECELERATION = 100;
const NORMAL_FRICTION_MULTIPLIER = 1.5;
const ICE_FRICTION_MULTIPLIER = 0.1;
const ICE_ACCELERATION_MULTIPLIER = 0.25;
const UNDUCK_HURT_TIME = 0.25;
const JUMP_EARLY_APEX_FACTOR = 3;
const JUMP_GRACE_TIME = 0.25;
const COYOTE_TIME = 0.1;

export const Bonus = { NONE: 0, GROWUP: 1, FIRE: 2, ICE: 3, AIR: 4, EARTH: 5 } as const;
export type Bonus = typeof Bonus[keyof typeof Bonus];

export class PlayerStatus {
  coins = 100;
  bonus: Bonus = Bonus.NONE;
  maxFireBullets = 0;
  maxIceBullets = 0;

  reset(): void { this.coins = 100; this.bonus = Bonus.NONE; }
  addCoins(n: number): void { this.coins = Math.min(9999, this.coins + n); }
  hasHatSprite(): boolean { return this.bonus > Bonus.GROWUP; }
}

export class Player extends Entity {
  readonly controller: Controller;
  readonly status: PlayerStatus;
  playerIndex = 0;
  dir: -1 | 1 = 1;
  oldDir: -1 | 1 = 1;
  duck = false;
  dying = false;
  dead = false;
  winning = false;
  deactivated = false;
  growing = false;
  backflipping = false;
  stone = false;
  swimming = false;
  waterJump = false;
  climbing = false;
  onIce = false;
  iceThisFrame = false;
  onLeftWall = false;
  onRightWall = false;
  canWalljump = false;
  inWalljumpTile = false;
  jumpEarlyApex = false;
  onGroundFlag = false;
  canJump = true;
  jumping = false;
  fallMode: 0 | 1 | 2 | 3 = 0; // ON_GROUND, JUMPING, TRAMPOLINE, FALLING
  lastGroundY = 0;
  boost = 0;
  speedLimit = 0;
  floorNormal: Vec = { x: 0, y: 0 };
  safeTimer = new Timer();
  invincibleTimer = new Timer();
  skiddingTimer = new Timer();
  kickTimer = new Timer();
  shootingTimer = new Timer();
  dyingTimer = new Timer();
  backflipTimer = new Timer();
  jumpButtonTimer = new Timer();
  coyoteTimer = new Timer();
  unduckHurtTimer = new Timer();
  private secondGrowupSound = new Timer();
  private backflipDirection = 0;
  private stageSprite = '';
  private swimmingAngle = 0;
  private swimmingAccel = 100;

  constructor(x: number, y: number, index: number, controller: Controller, status: PlayerStatus) {
    super(x, y, TUX_WIDTH, SMALL_TUX_HEIGHT);
    this.playerIndex = index;
    this.controller = controller;
    this.status = status;
    this.z = 1;
    this.bbox.setSize(TUX_WIDTH, status.bonus === Bonus.NONE ? SMALL_TUX_HEIGHT : BIG_TUX_HEIGHT);
    void loadSprite('images/creatures/tux/tux.sprite').then((s) => {
      this.sprite = s;
      this.sprite.setAction('small-stand-right');
    });
  }

  get isBig(): boolean { return this.status.bonus !== Bonus.NONE; }
  get velocityX(): number { return this.velocity.x; }
  get velocityY(): number { return this.velocity.y; }
  onGround(): boolean { return this.onGroundFlag; }

  setSprite(): Sprite | null { return this.sprite; }

  private adjustHeight(newHeight: number, bottomOffset = 0, sector?: Sector): boolean {
    const box = this.bbox.clone();
    box.move({ x: 0, y: this.bbox.height - newHeight - bottomOffset });
    box.setHeight(newHeight);
    if (newHeight > this.bbox.height) {
      if (!sector || !sector.isFreeOfStatics(box, this, true)) return false;
    }
    this.setPos(box.left, box.top);
    this.bbox.setSize(box.width, box.height);
    return true;
  }

  private applyFriction(): void {
    const on = this.onGround();
    const velx = this.velocity.x;
    if (on && Math.abs(velx) < WALK_SPEED) {
      this.velocity.x = 0; this.acceleration.x = 0; return;
    }
    let friction = WALK_ACCELERATION_X;
    if (this.onIce && on) friction *= ICE_FRICTION_MULTIPLIER;
    else friction *= NORMAL_FRICTION_MULTIPLIER;
    if (velx < 0) this.acceleration.x = friction;
    else if (velx > 0) this.acceleration.x = -friction;
  }

  private handleHorizontalInput(): void {
    let vx = this.velocity.x;
    let vy = this.velocity.y;
    let ax = this.acceleration.x;
    const ay = this.acceleration.y;
    let dirsign = 0;
    if (!this.duck || this.velocity.y !== 0) {
      if (this.controller.hold('LEFT') && !this.controller.hold('RIGHT')) {
        this.oldDir = this.dir;
        if (!this.waterJump) this.dir = -1;
        dirsign = -1;
      } else if (!this.controller.hold('LEFT') && this.controller.hold('RIGHT')) {
        this.oldDir = this.dir;
        if (!this.waterJump) this.dir = 1;
        dirsign = 1;
      }
    }
    if (vx * dirsign < MAX_WALK_XM) ax = dirsign * WALK_ACCELERATION_X;
    else ax = dirsign * RUN_ACCELERATION_X;
    const bonusRun = this.status.bonus === Bonus.AIR ? BONUS_RUN_XM : 0;
    if (vx >= MAX_RUN_XM + bonusRun) ax = Math.min(ax, -OVERSPEED_DECELERATION);
    else if (vx <= -MAX_RUN_XM - bonusRun) ax = Math.max(ax, OVERSPEED_DECELERATION);
    if (dirsign !== 0 && Math.abs(vx) < WALK_SPEED) vx = dirsign * WALK_SPEED;
    if (this.speedLimit > 0 && vx * dirsign >= this.speedLimit) { vx = dirsign * this.speedLimit; ax = 0; }
    if ((vx < 0 && dirsign > 0) || (vx > 0 && dirsign < 0)) {
      if (this.onGround()) {
        if (Math.abs(vx) > SKID_XM && !this.skiddingTimer.started()) {
          this.skiddingTimer.start(SKID_TIME);
          ax *= 2.5;
        } else ax *= 2;
      } else ax *= 2;
    }
    if (this.onIce && this.onGround()) ax *= ICE_ACCELERATION_MULTIPLIER;
    this.velocity.x = vx; this.velocity.y = vy;
    this.acceleration.x = ax; this.acceleration.y = ay;
    if (dirsign === 0) this.applyFriction();
  }

  private doJump(yspeed: number): void {
    if (!this.canWalljump && !this.inWalljumpTile && !this.onGround() && !this.coyoteTimer.started()) return;
    if (this.velocity.y > yspeed) {
      this.velocity.y = yspeed;
      this.jumping = true;
      this.onGroundFlag = false;
      this.canJump = false;
    }
  }

  private doDuck(sector: Sector): void {
    if (this.duck || !this.isBig) return;
    if (!this.swimming && !this.waterJump && this.velocity.y !== 0) return;
    if (!this.onGround()) return;
    if (this.adjustHeight(DUCKED_TUX_HEIGHT, 0, sector)) {
      this.duck = true;
      this.growing = false;
      this.unduckHurtTimer.stop();
    }
  }

  private doStandup(force: boolean, sector: Sector): void {
    if (!this.duck || !this.isBig || this.backflipping || this.stone) return;
    const h = this.swimming ? TUX_WIDTH : BIG_TUX_HEIGHT;
    if (this.adjustHeight(h, 0, sector)) {
      this.duck = false;
      this.unduckHurtTimer.stop();
    } else if (force) {
      if (this.unduckHurtTimer.get_period() === 0) this.unduckHurtTimer.start(UNDUCK_HURT_TIME);
      else if (this.unduckHurtTimer.check()) this.kill(false, sector);
    }
  }

  private doBackflip(): void {
    if (!this.duck || !this.onGround()) return;
    this.backflipDirection = this.dir === -1 ? 1 : -1;
    this.backflipping = true;
    this.doJump(this.status.bonus === Bonus.AIR ? -720 : -580);
    this.backflipTimer.start(TUX_BACKFLIP_TIME);
  }

  private handleVerticalInput(): void {
    if (this.controller.pressed('JUMP')) this.jumpButtonTimer.start(JUMP_GRACE_TIME);
    if (this.controller.hold('JUMP') && this.jumpButtonTimer.started() && (this.canJump || this.coyoteTimer.started())) {
      this.jumpButtonTimer.stop();
      if (this.duck) {
        if (this.velocity.x !== 0 || this.controller.hold('LEFT') || this.controller.hold('RIGHT')) this.doJump(-300);
        else this.doBackflip();
      } else {
        if (this.status.bonus === Bonus.AIR) this.doJump(Math.abs(this.velocity.x) > MAX_WALK_XM ? -620 : -580);
        else this.doJump(Math.abs(this.velocity.x) > MAX_WALK_XM ? -580 : -520);
      }
      this.coyoteTimer.stop();
    } else if (!this.controller.hold('JUMP')) {
      if (!this.backflipping && this.jumping && this.velocity.y < 0) {
        this.jumping = false;
        if (!this.jumpEarlyApex) { this.jumpEarlyApex = true; this.gravityModifier = JUMP_EARLY_APEX_FACTOR; }
      }
    }
    if (this.jumpEarlyApex && this.velocity.y >= 0) {
      this.jumpEarlyApex = false;
      this.gravityModifier = 1;
    }
    if (this.controller.hold('DOWN') && !this.duck && this.isBig && !this.onGround()) {
      this.wantsButtjump = true;
      if (this.velocity.y >= BUTTJUMP_MIN_VELOCITY_Y) this.doesButtjump = true;
    }
    if (!this.controller.hold('DOWN')) { this.wantsButtjump = false; this.doesButtjump = false; }
    if (this.controller.pressed('JUMP') && this.canWalljump && !this.backflipping) {
      this.velocity.x = this.onLeftWall ? (this.status.bonus === Bonus.AIR ? 480 : 380) : (this.status.bonus === Bonus.AIR ? -480 : -380);
      this.doJump(-520);
    }
    this.acceleration.y = 0;
  }

  wantsButtjump = false;
  doesButtjump = false;

  private handleClimbing(_dt: number, sector: Sector): boolean {
    const ladder = sector.climbableAt(this.bbox);
    if (!ladder) { this.climbing = false; return false; }
    if (this.controller.pressed('JUMP')) {
      this.climbing = false;
      this.velocity.y = -520;
      this.gravityModifier = 1;
      this.acceleration.y = 0;
      return true;
    }
    if (!this.controller.hold('UP') && !this.controller.hold('DOWN') && !this.climbing) return false;
    this.climbing = true;
    this.velocity.x = 0;
    this.velocity.y = this.controller.hold('UP') ? -128 : this.controller.hold('DOWN') ? 128 : 0;
    this.gravityModifier = 0;
    this.onGroundFlag = false;
    if (this.bbox.bottom > sector.height) this.setPos(this.pos.x, sector.height - this.bbox.height);
    return true;
  }

  private handleInput(sector: Sector): void {
    if (this.swimming) this.handleInputSwimming();
    else if (this.waterJump) this.swim(0, 0, false);

    if (!this.swimming) {
      if (!this.waterJump && !this.backflipping) this.sprite?.setAngle?.(0);
      this.gravityModifier = this.jumpEarlyApex ? JUMP_EARLY_APEX_FACTOR : 1;
    }

    if (!this.backflipping && !this.stone && !this.swimming) this.handleHorizontalInput();
    if (this.onGround()) this.canJump = true;
    if (!this.stone && !this.swimming) this.handleVerticalInput();

    if (this.controller.pressed('ACTION') && (this.status.bonus === Bonus.FIRE || this.status.bonus === Bonus.ICE)) {
      const max = this.status.bonus === Bonus.FIRE ? this.status.maxFireBullets : this.status.maxIceBullets;
      if (sector.bullets < max) {
        const pos = { x: this.bbox.left + this.bbox.width / 2, y: this.bbox.top + this.bbox.height / 2 };
        sector.addBullet(pos, { x: (this.dir === 1 ? 600 : -600) + this.velocity.x, y: 0 }, this.dir, this.status.bonus);
        this.shootingTimer.start(SHOOTING_TIME);
        sector.playSound('sounds/shoot.wav');
      }
    }
    if (this.controller.hold('DOWN') && !this.stone && !this.swimming) this.doDuck(sector);
    else this.doStandup(false, sector);
  }

  private handleInputSwimming(): void {
    const pointx = (this.controller.hold('RIGHT') ? 1 : 0) - (this.controller.hold('LEFT') ? 1 : 0);
    const pointy = (this.controller.hold('DOWN') ? 1 : 0) - (this.controller.hold('UP') ? 1 : 0);
    this.swim(pointx, pointy, this.controller.hold('JUMP'));
  }

  private swim(pointx: number, pointy: number, boost: boolean): void {
    if (this.swimming) this.gravityModifier = 0;
    const defined = pointx !== 0 || pointy !== 0;
    const pointed = Math.atan2(pointy, pointx);
    let delta = 0;
    if (defined) {
      delta = pointed - this.swimmingAngle;
      if (Math.abs(delta) > Math.PI) delta += delta > 0 ? -Math.PI * 2 : Math.PI * 2;
      this.swimmingAngle += (boost ? 0.3 : 0.15) * delta;
      if (this.swimmingAngle > Math.PI) this.swimmingAngle -= Math.PI * 2;
      if (this.swimmingAngle <= -Math.PI) this.swimmingAngle += Math.PI * 2;
    }
    let vx = this.velocity.x;
    let vy = this.velocity.y;
    if (this.swimming && !this.waterJump) {
      if (defined && Math.abs(delta) < 0.01) this.swimmingAngle = pointed;
      this.swimmingAccel = defined ? 600 : 0;
      const sx = Math.cos(pointed) * this.swimmingAccel;
      const sy = Math.sin(pointed) * this.swimmingAccel;
      this.acceleration.x = (sx - vx) * 2;
      this.acceleration.y = (sy - vy) * 2;
      if (Math.hypot(vx, vy) > 300) { this.acceleration.x = -vx; this.acceleration.y = -vy; }
      if (!defined) { this.acceleration.x = -3 * vx; this.acceleration.y = -3 * vy; }
      if (!boost && defined && Math.hypot(vx, vy) > 310) { this.acceleration.x = -5 * vx; this.acceleration.y = -5 * vy; }
      if (!defined && Math.hypot(vx, vy) < 100) { vx = 0; vy = 0; }
      if (boost && Math.hypot(vx, vy) > 100) {
        if (Math.hypot(vx, vy) < 600) {
          if (defined) { vx += 30 * pointx; vy += 30 * pointy; }
        } else { this.acceleration.x = -vx; this.acceleration.y = -vy; }
        this.velocity.x = vx; this.velocity.y = vy;
      }
    }
    this.sprite?.setAngle((Math.abs(this.swimmingAngle) <= Math.PI / 2 ? this.swimmingAngle : Math.PI + this.swimmingAngle) * 180 / Math.PI);
  }

  private checkWater(sector: Sector): void {
    const swimBox = this.bbox.clone();
    swimBox.setBottom(this.bbox.bottom - 16);
    const canSwimHere = !sector.isFreeOfTiles(swimBox, true, 'water');
    if (this.swimming) {
      if (!canSwimHere) {
        this.swimming = false;
        this.waterJump = true;
        if (this.velocity.y > -350 && this.controller.hold('UP')) this.velocity.y = -350;
      }
    } else if (canSwimHere && !this.stone) {
      this.waterJump = false;
      this.swimming = true;
      this.swimmingAngle = Math.atan2(this.velocity.y, this.velocity.x);
      if (this.isBig) this.adjustHeight(TUX_WIDTH, 0, sector);
      this.wantsButtjump = this.doesButtjump = this.backflipping = false;
      sector.playSound('sounds/splash.wav');
    }
  }

  update(dt: number, sector: Sector): void {
    this.checkBounds(sector);
    if (!this.dying) this.checkWater(sector);

    if (this.dying && this.dyingTimer.check()) {
      this.dead = true;
      this.status.bonus = Bonus.NONE;
      return;
    }
    if (!this.dying && !this.deactivated) {
      if (!this.handleClimbing(dt, sector)) this.handleInput(sector);
    }

    const leftBox = this.bbox.clone(); leftBox.setLeft(leftBox.left - 8);
    const rightBox = this.bbox.clone(); rightBox.setRight(rightBox.right + 8);
    this.onLeftWall = !sector.isFreeOfStatics(leftBox, this);
    this.onRightWall = !sector.isFreeOfStatics(rightBox, this);
    this.canWalljump = (this.onLeftWall || this.onRightWall) && !this.onGround() && !this.swimming && this.inWalljumpTile;
    if (this.canWalljump && (this.controller.hold('LEFT') || this.controller.hold('RIGHT')) && this.velocity.y >= 0 && !this.controller.pressed('JUMP')) {
      this.velocity.y = 64;
      this.acceleration.y = 0;
    }
    this.inWalljumpTile = false;

    if (Math.abs(this.velocity.x) > MAX_WALK_XM) this.bbox.setWidth(RUNNING_TUX_WIDTH);
    else this.bbox.setWidth(TUX_WIDTH);

    if (this.onGround() && !this.swimming && !this.dying) {
      if (this.floorNormal.y !== 0 && this.floorNormal.x * this.velocity.x >= 0) this.velocity.y = 250;
    }

    if (this.backflipping && !this.dying) {
      this.dir = this.backflipDirection === 1 ? -1 : 1;
      if (this.backflipTimer.started()) this.velocity.x = 100 * this.backflipDirection;
    }

    if (this.onGround()) this.coyoteTimer.start(COYOTE_TIME);
    if (this.onGround()) {
      this.fallMode = 0;
      this.lastGroundY = this.pos.y;
    } else if (this.pos.y > this.lastGroundY) this.fallMode = 3;
    else if (this.fallMode === 0) this.fallMode = 1;

    if (this.onGround()) {
      this.jumping = false;
      if (this.backflipping && this.backflipTimer.get_timegone() > 0.15) {
        this.backflipping = false;
        this.backflipDirection = 0;
        this.velocity.x = 0;
        if (this.deactivated) this.doStandup(false, sector);
      }
    }

    if (this.secondGrowupSound.check()) this.secondGrowupSound.stop();
    if (this.boost !== 0) {
      const sign = this.boost < 0 ? -1 : 1;
      this.boost = sign * (Math.abs(this.boost) - dt * BOOST_DECREASE_RATE);
      if ((this.boost < 0 ? -1 : 1) !== sign) this.boost = 0;
    }

    if (this.climbing) {
      this.movement = { x: 0, y: this.velocity.y * dt };
      this.acceleration.x = this.acceleration.y = 0;
      this.gravityModifier = 0;
    } else {
      const move = this.getMovement(dt, sector.gravity);
      this.movement = { x: move.x + this.boost * dt, y: move.y };
    }
    if (!this.iceThisFrame && this.onGround()) this.onIce = false;
    this.onGroundFlag = false;
    this.iceThisFrame = false;
    if (this.growing && this.sprite?.animationDone()) this.growing = false;
  }

  onSolid(hit: CollisionHit, sector: Sector): void {
    if (hit.bottom) {
      if (this.velocity.y > 0) this.velocity.y = 0;
      if (!this.swimming) this.onGroundFlag = true;
      this.floorNormal = hit.slopeNormal;
      if (this.doesButtjump) {
        this.doesButtjump = false;
        this.velocity.y = -300;
        this.onGroundFlag = false;
        void sector;
      }
    } else if (hit.top) {
      if (this.velocity.y < 0) this.velocity.y = 0.2;
    }
    if ((hit.left || hit.right) && hit.slopeNormal.x === 0) this.velocity.x = 0;
    if (hit.crush) this.kill(hit.left || hit.right, sector);
    if ((hit.left && this.boost < 0) || (hit.right && this.boost > 0)) this.boost = 0;
  }

  onTile(attributes: number, sector: Sector): void {
    if (attributes & 0x0400) {
      if (attributes & 0x0002) this.kill(false, sector);
      else {
        const hurtbox = this.bbox.grown(-6);
        if (!sector.isFreeOfTiles(hurtbox, false, 'hurts')) this.kill(false, sector);
      }
    }
    if (attributes & 0x1000) this.inWalljumpTile = true;
    if (attributes & 0x0100) { this.iceThisFrame = true; this.onIce = true; }
  }

  private checkBounds(sector: Sector): void {
    if (this.pos.x < 0) this.setPos(0, this.pos.y);
    if (this.bbox.right > sector.width) this.setPos(sector.width - this.bbox.width, this.bbox.top);
    if (this.swimming) {
      if (this.pos.y > sector.height - 1) this.setPos(this.pos.x, sector.height - 1);
    } else if (this.pos.y > sector.height) this.kill(true, sector);
  }

  bounce(): void {
    if (this.status.bonus !== Bonus.AIR) this.velocity.y = this.controller.hold('JUMP') ? -520 : -300;
    else this.velocity.y = this.controller.hold('JUMP') ? -580 : -340;
  }

  addBonus(bonus: Bonus, sector: Sector): boolean {
    if (bonus <= this.status.bonus) return true;
    const newHeight = this.duck ? DUCKED_TUX_HEIGHT : BIG_TUX_HEIGHT;
    if (!this.isBig) {
      if (!this.adjustHeight(newHeight, 0, sector)) return false;
      this.growing = true;
    } else if (this.duck && !this.adjustHeight(DUCKED_TUX_HEIGHT, 0, sector)) return false;
    this.status.bonus = bonus;
    this.status.maxFireBullets = bonus === Bonus.FIRE ? 3 : 0;
    this.status.maxIceBullets = bonus === Bonus.ICE ? 3 : 0;
    sector.playSound('sounds/grow.wav');
    return true;
  }

  setBonus(bonus: Bonus, sector: Sector, animate = false): void {
    const wasBig = this.isBig;
    this.status.bonus = bonus;
    const newHeight = bonus === Bonus.NONE ? SMALL_TUX_HEIGHT : (this.duck ? DUCKED_TUX_HEIGHT : BIG_TUX_HEIGHT);
    this.adjustHeight(newHeight, 0, sector);
    this.duck = false;
    if (animate && wasBig && bonus === Bonus.GROWUP) this.secondGrowupSound.start(0.5);
  }

  kill(completely: boolean, sector: Sector): void {
    if (this.dying || this.deactivated || this.winning) return;
    if (!completely && (this.safeTimer.started() || this.invincibleTimer.started() || this.stone)) return;
    this.growing = false;
    this.velocity.x = 0;
    this.sprite?.setAngle?.(0);
    if (!completely && this.isBig) {
      sector.playSound('sounds/hurt.wav');
      if (this.status.bonus >= Bonus.FIRE) {
        this.safeTimer.start(TUX_SAFE_TIME);
        this.setBonus(Bonus.GROWUP, sector, true);
      } else {
        this.safeTimer.start(TUX_SAFE_TIME);
        this.duck = false;
        this.backflipping = false;
        this.setBonus(Bonus.NONE, sector, true);
      }
    } else {
      sector.playSound('sounds/kill.wav');
      this.velocity.x = 0;
      this.velocity.y = -700;
      this.gravityModifier = 1;
      this.safeTimer.stop();
      this.invincibleTimer.stop();
      this.acceleration.x = this.acceleration.y = 0;
      this.setBonus(Bonus.NONE, sector, true);
      this.dying = true;
      this.dyingTimer.start(3);
      this.group = 'disabled';
      sector.onPlayerDied(this);
    }
  }

  makeInvincible(): void {
    this.invincibleTimer.start(TUX_INVINCIBLE_TIME);
  }

  setSpriteAction(): void {
    if (!this.sprite) return;
    let prefix = 'small';
    if (this.status.bonus === Bonus.GROWUP) prefix = 'big';
    else if (this.status.bonus === Bonus.FIRE) prefix = 'fire';
    else if (this.status.bonus === Bonus.ICE) prefix = 'ice';
    else if (this.status.bonus === Bonus.AIR) prefix = 'air';
    else if (this.status.bonus === Bonus.EARTH) prefix = 'earth';
    const post = this.swimming ? (Math.abs(this.swimmingAngle) <= Math.PI / 2 ? '-right' : '-left') : (this.dir === 1 ? '-right' : '-left');
    let action: string;
    if (this.dying) action = 'gameover';
    else if (this.growing) action = 'grow' + post;
    else if (this.duck && this.isBig && !this.swimming) action = `${prefix}-duck${post}`;
    else if (this.skiddingTimer.started() && !this.skiddingTimer.check() && !this.swimming) action = `${prefix}-skid${post}`;
    else if (this.kickTimer.started() && !this.kickTimer.check() && !this.swimming) action = `${prefix}-kick${post}`;
    else if ((this.wantsButtjump || this.doesButtjump) && this.isBig) action = `${prefix}-buttjump${post}`;
    else if (this.swimming || this.waterJump) {
      if (Math.hypot(this.velocity.x, this.velocity.y) < 50) action = `${prefix}-floating${post}`;
      else if (this.waterJump) action = `${prefix}-swimjump${post}`;
      else action = `${prefix}-swimming${post}`;
    } else if (!this.onGround()) {
      action = `${prefix}-fall${post}`;
      if (this.velocity.y <= 0) action = `${prefix}-jump${post}`;
    } else if (Math.abs(this.velocity.x) < 1) action = `${prefix}-stand${post}`;
    else if (Math.abs(this.velocity.x) > MAX_WALK_XM && !this.isBig) action = `${prefix}-run${post}`;
    else action = `${prefix}-walk${post}`;
    if (action !== this.stageSprite) {
      if (this.sprite.setAction(action)) this.stageSprite = action;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.setSpriteAction();
    this.sprite?.draw(ctx, this.bbox.left, this.bbox.top);
  }

  /** used by tests and the HUD */
  get stateForTest(): { x: number; y: number; vx: number; vy: number; onGround: boolean } {
    return { x: this.bbox.left, y: this.bbox.top, vx: this.velocity.x, vy: this.velocity.y, onGround: this.onGroundFlag };
  }
}
