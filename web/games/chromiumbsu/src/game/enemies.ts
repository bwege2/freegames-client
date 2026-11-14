// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/EnemyAircraft*.cpp and
// src/EnemyFleet.cpp. C float arithmetic is kept: f() where the original rounds to a float.
import { cos, sin } from '../libm.ts';
import { GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA, GL_TRIANGLE_STRIP, type GL, type Texture } from '../gl.ts';
import type { ActiveAmmo } from './ammo.ts';
import * as X from './explosions.ts';
import { ScreenItem, ItemEnemy } from './item.ts';
import * as A from './audio.ts';
import { HeroDead, LevelOver, type Global } from './global.ts';

const f = Math.fround;

export const EnemyStraight = 0, EnemyOmni = 1, EnemyRayGun = 2, EnemyTank = 3, EnemyGnat = 4,
  EnemyBoss00 = 5, EnemyBoss01 = 6, NumEnemyTypes = 7;

export abstract class EnemyAircraft extends ScreenItem {
  type: number;
  size = new Float32Array(2);
  damage = 0;
  baseDamage = 0;
  collisionMove = 0;
  secondaryMove = new Float32Array(2);
  preFire = 0;
  /** if set, the fleet inserts this aircraft after that one */
  over: EnemyAircraft | null = null;
  shootVec = new Float32Array(3);
  shootInterval = 1;
  shootSwap = 0;
  randMoveX = 0;
  lastMoveX = 0;
  lastMoveY = 0;
  target: ScreenItem | null = null;
  protected readonly game: Global;

  /** EnemyAircraft::EnemyAircraft: the base init, the clamp, then the subclass's init (which sets pos again) */
  constructor(game: Global, et: number, p: ArrayLike<number>, randFact = 1.0) {
    super(ItemEnemy);
    this.type = et;
    this.game = game;
    this.baseInit(p, randFact);
    const xBound = f(game.config.screenBoundX() - 2.0);
    if (this.pos[0] < -xBound) this.pos[0] = -xBound;
    if (this.pos[0] > xBound) this.pos[0] = xBound;
    this.init(p, randFact);
  }

  /** EnemyAircraft::init(p, randFact) */
  protected baseInit(p: ArrayLike<number>, randFact: number): void {
    this.initItem();
    this.over = null;
    this.pos[0] = p[0]; this.pos[1] = p[1]; this.pos[2] = p[2];
    this.shootInterval = 1;
    this.shootSwap = 0;
    this.randMoveX = f(randFact * this.game.rand.F);
    this.lastMoveX = 0.0;
    this.lastMoveY = 0.0;
    this.preFire = 0.0;
    this.target = this.game.hero;
    this.secondaryMove[0] = this.secondaryMove[1] = 0.0;
    this.shootVec[0] = 0.0; this.shootVec[1] = -0.2; this.shootVec[2] = 0.0;
    this.vel[0] = 0.0; this.vel[1] = 0.0; this.vel[2] = 0.0;
  }

  /** the subclass's virtual init(p, randFact = 1.0) */
  abstract init(p: ArrayLike<number>, randFact?: number): void;
  abstract update(): void;
  protected abstract move(): void;
  protected calcShootInterval(): void { this.shootInterval = 1; }

  setTarget(t: ScreenItem | null): void { this.target = t; }

  checkHit(ammo: ActiveAmmo): boolean {
    if (ammo.pos[1] > this.pos[1] - this.size[1]) {
      if (ammo.pos[1] < this.pos[1] + this.size[1] && ammo.pos[0] > this.pos[0] - this.size[0] && ammo.pos[0] < this.pos[0] + this.size[0])
        return true;
    }
    return false;
  }

  /** the start of every update(): age, the push of a collision, decaying */
  protected stepSecondary(): void {
    const S = this.game.speedAdj;
    this.age++;
    this.shootInterval--;
    this.pos[0] += f(this.secondaryMove[0] * S);
    this.pos[1] += f(this.secondaryMove[1] * S);
    const s = f((1.0 - S) + S * 0.7);
    this.secondaryMove[0] *= s;
    this.secondaryMove[1] *= s;
  }

  protected clampX(): void {
    const b = this.game.config.screenBoundX();
    if (this.pos[0] < -b) this.pos[0] = -b;
    if (this.pos[0] > b) this.pos[0] = b;
  }

  /** target ? target->getPos() : pos (the hero hands out a copy, which is the same here) */
  protected targetPos(): Float32Array {
    return this.target ? this.target.getPos() : this.pos;
  }

  static makeNewEnemy(game: Global, et: number, p: ArrayLike<number>, randFact = 1.0): EnemyAircraft | null {
    switch (et) {
      case EnemyStraight: return new EnemyStraightAircraft(game, et, p, randFact);
      case EnemyOmni: return new EnemyOmniAircraft(game, et, p, randFact);
      case EnemyRayGun: return new EnemyRayGunAircraft(game, et, p, randFact);
      case EnemyTank: return new EnemyTankAircraft(game, et, p, randFact);
      case EnemyGnat: return new EnemyGnatAircraft(game, et, p, randFact);
      case EnemyBoss00: return new EnemyBoss00Aircraft(game, et, p, randFact);
      case EnemyBoss01: return new EnemyBoss01Aircraft(game, et, p, randFact);
      default: return null;
    }
  }
}

// ---- src/EnemyAircraft_Straight.cpp --------------------------------------------------------------
class EnemyStraightAircraft extends EnemyAircraft {
  init(p: ArrayLike<number>, randFact = 1.0): void {
    this.baseInit(p, randFact);
    const frand = f(this.game.rand.F * randFact);
    this.damage = this.baseDamage = f(-110.0 * this.game.gameSkill);
    this.size[0] = 0.75;
    this.size[1] = 1.02;
    this.collisionMove = f(0.5);
    this.vel[1] = -0.046 - frand * 0.04;
  }
  update(): void {
    this.stepSecondary();
    this.move();
    const p = new Float32Array(this.pos);
    if (this.shootInterval < 10) this.preFire = f((10 - this.shootInterval) / 10.0);
    else this.preFire = 0.0;
    if (!this.shootInterval) {
      this.calcShootInterval();
      p[1] -= 0.9;
      this.game.enemyAmmo.addAmmo(0, p, this.shootVec);
    }
  }
  protected calcShootInterval(): void {
    this.shootInterval = Math.trunc((30.0 + this.game.rand.F * 90.0) / this.game.speedAdj);
  }
  protected move(): void {
    this.pos[1] += f(this.game.speedAdj * f(this.vel[1] * this.game.gameSkill));
    this.clampX();
  }
}

// ---- src/EnemyAircraft_Omni.cpp ------------------------------------------------------------------
class EnemyOmniAircraft extends EnemyAircraft {
  init(p: ArrayLike<number>, randFact = 1.0): void {
    this.baseInit(p, randFact);
    const frand = f(this.game.rand.F * randFact);
    this.damage = this.baseDamage = -45.0;
    this.size[0] = 0.7;
    this.size[1] = 0.7;
    this.collisionMove = f(0.7);
    this.vel[1] = -0.071 - frand * 0.04;
  }
  update(): void {
    const g = this.game;
    const v = new Float32Array([0.0, -0.2, 0.0]);
    const hpos = g.hero.getPos();
    const a = f(hpos[0] - this.pos[0]);
    const b = f(hpos[1] - this.pos[1]);
    let ammoSpeed = f(0.35 * g.speedAdj);
    const omniSwap = 108;
    this.stepSecondary();
    this.move();
    const p = new Float32Array(this.pos);
    this.shootSwap = this.shootSwap % omniSwap;
    if (this.shootSwap < 18) {
      if (!(this.shootSwap % 6)) {
        ammoSpeed = f(0.3 * g.gameSkill * g.speedAdj);
        const dist = f(Math.abs(a) + Math.abs(b));
        v[0] = a / dist;
        v[1] = b / dist;
        this.shootVec[0] = ammoSpeed * v[0];
        this.shootVec[1] = ammoSpeed * v[1];
      }
      g.enemyAmmo.addAmmo(1, p, this.shootVec);
    }
    if (this.pos[1] < g.config.screenBoundY()) this.shootSwap++;
  }
  protected move(): void {
    const g = this.game;
    const hpos = this.targetPos();
    const diff0 = f(hpos[0] - this.pos[0]);
    this.lastMoveX = f(0.9 * this.lastMoveX + 0.1 * (0.01 * diff0));
    this.pos[0] += f(g.speedAdj * f(this.randMoveX * this.lastMoveX));
    this.pos[1] += f(g.speedAdj * f(this.vel[1] * g.gameSkill));
    this.clampX();
  }
}

// ---- src/EnemyAircraft_RayGun.cpp ----------------------------------------------------------------
class EnemyRayGunAircraft extends EnemyAircraft {
  init(p: ArrayLike<number>, randFact = 1.0): void {
    this.baseInit(p, randFact);
    this.damage = this.baseDamage = f(-1000.0 * this.game.gameSkill);
    this.size[0] = 1.2;
    this.size[1] = 1.2;
    this.collisionMove = f(0.2);
    this.vel[1] = 0.03;
    this.randMoveX = f(0.5 + 0.5 * this.randMoveX);
  }
  update(): void {
    const v = new Float32Array([0.0, -0.2, 0.0]);
    const hpos = this.game.hero.getPos();
    const a = f(hpos[0] - this.pos[0]);
    this.stepSecondary();
    this.move();
    const p = new Float32Array(this.pos);
    if (Math.abs(a) < 1.5) {
      v[1] = -0.6;
      p[1] = this.pos[1] - 0.5;
      this.game.enemyAmmo.addAmmo(3, p, v);
    }
  }
  protected move(): void {
    const g = this.game;
    const hpos = this.targetPos();
    const diff = new Float32Array([hpos[0] - this.pos[0], hpos[1] - this.pos[1]]);
    let tmpd = 0.0;
    let tmps = 0.0;
    if ((tmpd = Math.abs(diff[0])) < 3.0) tmps = f(((3.0 - tmpd) / 3.0) * (0.1 * sin(this.age * 0.25)));
    if (Math.abs(diff[1]) < 7.0) diff[1] *= 0.1;
    this.lastMoveX = f(0.975 * this.lastMoveX + 0.0020 * diff[0]);
    this.lastMoveY = f(0.90 * this.lastMoveY + 0.001 * diff[1]);
    this.pos[0] += g.speedAdj * (f(this.randMoveX * this.lastMoveX) * (g.gameSkill + 0.1) + tmps);
    this.pos[1] += g.speedAdj * (this.lastMoveY + this.vel[1] * (g.gameSkill + 0.1));
    this.clampX();
  }
}

// ---- src/EnemyAircraft_Tank.cpp ------------------------------------------------------------------
class EnemyTankAircraft extends EnemyAircraft {
  init(p: ArrayLike<number>, randFact = 1.0): void {
    this.baseInit(p, randFact);
    this.damage = this.baseDamage = f(-2000.0 * this.game.gameSkill);
    this.size[0] = 1.9;
    this.size[1] = 2.1;
    this.collisionMove = f(0.1);
    this.vel[1] = 0.03;
  }
  update(): void {
    const g = this.game;
    const v = new Float32Array([0.0, -0.2, 0.0]);
    const hpos = g.hero.getPos();
    let a = f(hpos[0] - this.pos[0]);
    let b = f(hpos[1] - this.pos[1]);
    const ammoSpeed = f(0.35 * g.speedAdj);
    this.stepSecondary();
    this.move();
    const p = new Float32Array(this.pos);
    p[1] = this.pos[1] - 1.7;
    if (Math.abs(a) < 4.0) {
      if (this.shootSwap === 0 || this.shootSwap === 8 || this.shootSwap === 16) {
        v[1] = -0.2;
        p[0] = this.pos[0] + 1.5;
        g.enemyAmmo.addAmmo(0, p, v);
        p[0] = this.pos[0] - 1.5;
        g.enemyAmmo.addAmmo(0, p, v);
      }
      this.shootSwap++;
      this.shootSwap %= 100;
    }
    if (!(Math.trunc(this.age / 200) % 2)) {
      const tmpInt = this.age % 200;
      if (tmpInt < 100) {
        this.preFire = f(tmpInt / 100.0);
      } else if (tmpInt < 170) {
        if (!(this.age % 10)) {
          p[1] = this.pos[1] - 0.45;
          b = f(hpos[1] - p[1]);
          p[0] = this.pos[0];
          a = f(hpos[0] - p[0]);
          const dist = f(Math.abs(a) + Math.abs(b));
          this.shootVec[0] = (2.0 * ammoSpeed * a) / dist;
          this.shootVec[1] = (2.0 * ammoSpeed * b) / dist;
          this.secondaryMove[0] -= this.shootVec[0] * 0.1;
          this.secondaryMove[1] -= this.shootVec[1] * 0.1;
          g.enemyAmmo.addAmmo(2, p, this.shootVec);
          this.preFire = f(this.preFire - 0.4);
          if (this.preFire < 0.0) this.preFire = 0.0;
        } else this.preFire = f(this.preFire + 0.035);
      } else this.preFire = 0.0;
    }
  }
  protected move(): void {
    const g = this.game;
    const hpos = this.targetPos();
    const diff0 = f(hpos[0] - this.pos[0]);
    let v1: number;
    if (Math.abs(diff0) > 8.0) v1 = f(0.04);
    else v1 = f(0.04 * (Math.abs(diff0) / 8.0));
    this.vel[1] = 0.99 * this.vel[1] + 0.01 * v1;
    if (this.pos[1] < -3.0) this.vel[1] = -0.1;
    else if (this.pos[1] < 0.0) this.vel[1] *= 0.99;
    const bx = g.config.screenBoundX();
    if (this.pos[0] < 0.0) this.pos[0] = g.speedAdj * (0.998 * this.pos[0] + 0.002 * (-bx + 2.85));
    else this.pos[0] = g.speedAdj * (0.998 * this.pos[0] + 0.002 * (bx - 2.85));
    switch (Math.trunc(this.age / 50) % 8) {
      case 2: this.pos[1] += g.speedAdj * 0.05; break;
      default: this.pos[1] -= f(g.speedAdj * this.vel[1]); break;
    }
    this.clampX();
  }
}

// ---- src/EnemyAircraft_Gnat.cpp ------------------------------------------------------------------
class EnemyGnatAircraft extends EnemyAircraft {
  init(p: ArrayLike<number>, randFact = 1.0): void {
    this.baseInit(p, randFact);
    this.damage = this.baseDamage = -10.0;
    this.size[0] = 0.45;
    this.size[1] = 0.45;
    this.collisionMove = 0.0;
    this.randMoveX = f(0.5 + 0.5 * this.randMoveX);
    this.vel[0] = 0.2;
    this.vel[1] = 0.1;
  }
  update(): void {
    const v = new Float32Array([0.0, -0.2, 0.0]);
    const hpos = this.game.hero.getPos();
    const a = f(hpos[0] - this.pos[0]);
    const b = f(hpos[1] - this.pos[1]);
    this.stepSecondary();
    this.move();
    const p = new Float32Array(this.pos);
    if (!this.shootInterval) {
      this.calcShootInterval();
      if (Math.abs(a) < 2.0 && b < 0.0) {
        v[1] = -0.39;
        p[1] = this.pos[1] - 0.5;
        this.game.enemyAmmo.addAmmo(4, p, v);
      }
    }
  }
  protected calcShootInterval(): void {
    this.shootInterval = Math.trunc((1.0 + this.game.rand.F * 5.0) / this.game.speedAdj);
  }
  protected move(): void {
    const g = this.game;
    const hpos = this.targetPos();
    const d0 = f(hpos[0] - this.pos[0]);
    const d1 = f(hpos[1] - this.pos[1]);
    let randX: number;
    if (this.target === g.hero) randX = this.randMoveX;
    else randX = f(0.75 + g.rand.F * 0.15);
    const tmps = f(3.8);
    // sqrt() of a float here is the C library's double sqrt (the object code calls sqrtsd)
    const dist = f(Math.sqrt(f(f(d0 * d0) + f(d1 * d1))) * randX);
    let tmpd = f(0.4 + 0.6 * ((dist + 0.2 * sin(this.age * 0.001)) / tmps));
    const speed = f(tmpd * 0.25 * randX);
    let tmp = f(d0 / dist);
    let x = f(speed * tmp);
    tmp = f(d1 / dist);
    let y = f(speed * tmp);
    let tmpX: number, tmpY: number;
    if (dist < tmps) {
      tmpX = x;
      tmpY = y;
      x = f(f(tmpd * tmpX) + (-(1.0 - tmpd) * d1) / tmpd);
      y = f(f(tmpd * tmpY) + ((1.0 - tmpd) * d0) / tmpd);
      y = f(y + 0.01 * sin(g.gameFrame * 0.001));
    } else {
      tmpd = f(0.97);
      tmpX = x;
      tmpY = y;
      if (randX < 0.65) {
        x = f(f(tmpd * tmpX) + ((1.0 - tmpd) * d1) / tmpd);
        y = f(f(tmpd * tmpY) + (-(1.0 - tmpd) * d0) / tmpd);
      } else {
        x = f(f(tmpd * tmpX) + (-(1.0 - tmpd) * d1) / tmpd);
        y = f(f(tmpd * tmpY) + ((1.0 - tmpd) * d0) / tmpd);
      }
    }
    tmp = f(randX * 0.2);
    let v0: number;
    if (Math.trunc(this.age / 8) % 2) v0 = f(this.vel[0] * (0.85 - tmp) + (0.2 + tmp) * (randX - 0.2) * x);
    else v0 = this.vel[0];
    const v1 = f(this.vel[1] * (0.85 - tmp) + (0.2 + tmp) * (randX - 0.2) * y);
    if (this.age < 50) {
      let amt: number;
      if (this.age > 20) amt = f((this.age - 20) / 30.0);
      else amt = 0.0;
      this.vel[0] = (1.0 - amt) * this.vel[0] + f(amt * v0);
      this.vel[1] = (1.0 - amt) * this.vel[1] + f(amt * v1);
    } else {
      this.vel[0] = v0;
      this.vel[1] = v1;
    }
    this.pos[0] += f(g.speedAdj * this.vel[0]);
    this.pos[1] += f(g.speedAdj * this.vel[1]);
    if (this.pos[1] < -10.0) this.pos[1] = -10.0;
    this.clampX();
  }
}

// ---- src/EnemyAircraft_Boss00.cpp ----------------------------------------------------------------
class EnemyBoss00Aircraft extends EnemyAircraft {
  init(p: ArrayLike<number>, randFact = 1.0): void {
    this.baseInit(p, randFact);
    this.damage = this.baseDamage = f(-10000.0 * this.game.gameSkill);
    this.size[0] = 3.5;
    this.size[1] = 2.275;
    this.collisionMove = f(0.05);
    this.vel[1] = 0.02;
  }
  update(): void {
    const g = this.game;
    const v = new Float32Array([0.0, -0.2, 0.0]);
    const hpos = g.hero.getPos();
    let a = f(hpos[0] - this.pos[0]);
    let b = f(hpos[1] - this.pos[1]);
    let dist: number;
    const ammoSpeed = f(0.35 * g.speedAdj);
    this.stepSecondary();
    this.move();
    const p = new Float32Array(this.pos);
    if (Math.abs(a) < 1.6) {
      v[1] = -0.6;
      p[1] = this.pos[1] - 1.7;
      g.enemyAmmo.addAmmo(3, p, v);
    }
    if (!(this.age % 5)) {
      this.shootSwap++;
      this.shootSwap %= 15;
      if (this.shootSwap < 6) {
        v[1] = -0.2;
        p[1] = this.pos[1] - 1.9;
        p[0] = this.pos[0] + 2.0 + (this.shootSwap % 3) * 0.4;
        g.enemyAmmo.addAmmo(0, p, v);
        p[0] = this.pos[0] - 2.0 - (this.shootSwap % 3) * 0.4;
        g.enemyAmmo.addAmmo(0, p, v);
      }
    }
    if (!((this.age - 1) % 7)) {
      dist = f(Math.abs(a) + Math.abs(b));
      this.shootVec[0] = f(ammoSpeed * a) / dist;
      this.shootVec[1] = f(ammoSpeed * b) / dist;
    }
    if (!(Math.trunc(this.age / 200) % 2)) {
      if (!(Math.trunc(this.age / 100) % 2)) {
        if (!(Math.trunc(this.age / 50) % 2)) {
          p[1] = this.pos[1] - 0.45;
          p[0] = this.pos[0] - 1.1;
          g.enemyAmmo.addAmmo(1, p, this.shootVec);
          p[0] = this.pos[0] + 1.1;
          g.enemyAmmo.addAmmo(1, p, this.shootVec);
        }
        this.preFire = f((this.age % 100) / 100.0);
      } else if (!(this.age % 10)) {
        p[1] = this.pos[1] - 0.45;
        b = f(hpos[1] - p[1]);
        p[0] = this.pos[0] - 1.1;
        a = f(hpos[0] - p[0]);
        dist = f(Math.abs(a) + Math.abs(b));
        this.shootVec[0] = (2.0 * ammoSpeed * a) / dist;
        this.shootVec[1] = (2.0 * ammoSpeed * b) / dist;
        g.enemyAmmo.addAmmo(2, p, this.shootVec);
        p[0] = this.pos[0] + 1.1;
        a = f(hpos[0] - p[0]);
        dist = f(Math.abs(a) + Math.abs(b));
        this.shootVec[0] = (2.0 * ammoSpeed * a) / dist;
        this.shootVec[1] = (2.0 * ammoSpeed * b) / dist;
        g.enemyAmmo.addAmmo(2, p, this.shootVec);
        this.preFire = f(this.preFire - 0.4);
        if (this.preFire < 0.0) this.preFire = 0.0;
      } else this.preFire = f(this.preFire + 0.035);
    } else this.preFire = 0.0;
  }
  protected move(): void {
    const g = this.game;
    const hpos = this.targetPos();
    let d0 = f(hpos[0] - this.pos[0]);
    let d1 = f(hpos[1] - this.pos[1]);
    const approachDist = f(7.0 * (2.0 - g.gameSkill));
    if (Math.abs(d1) < approachDist + 0.0 * sin(g.frame * 0.05)) d1 = f(f(d1 * d1) / approachDist);
    d0 = f(d0 + 5.0 * sin(this.age * 0.1));
    this.lastMoveX = f(0.98 * this.lastMoveX + 0.0005 * g.gameSkill * d0);
    this.lastMoveY = f(0.90 * this.lastMoveY + 0.001 * g.gameSkill * d1);
    this.pos[0] += f(g.speedAdj * this.lastMoveX);
    this.pos[1] += f(g.speedAdj * f(this.lastMoveY + this.vel[1]));
    this.clampX();
  }
}

// ---- src/EnemyAircraft_Boss01.cpp ----------------------------------------------------------------
class EnemyBoss01Aircraft extends EnemyAircraft {
  init(p: ArrayLike<number>, randFact = 1.0): void {
    this.baseInit(p, randFact);
    this.damage = this.baseDamage = f(-10000.0 * this.game.gameSkill);
    this.size[0] = 2.6;
    this.size[1] = 2.3;
    this.collisionMove = f(0.1);
    this.vel[1] = 0.02;
    this.age = 600;
  }
  update(): void {
    const g = this.game;
    const hpos = g.hero.getPos();
    const a = f(hpos[0] - this.pos[0]);
    this.stepSecondary();
    this.move();
    const p = new Float32Array(this.pos);
    if (Math.abs(a) < 5.0) {
      this.shootVec[1] = -0.65;
      this.preFire = f((this.age % 6) / 6.0);
      if (!(this.age % 6)) {
        this.shootSwap = this.shootSwap ? 0 : 1;
        if (this.shootSwap) {
          p[0] = this.pos[0] + 0.55;
          p[1] = this.pos[1] - 1.7;
          g.enemyAmmo.addAmmo(0, p, this.shootVec);
          p[1] += 0.5;
          g.enemyAmmo.addAmmo(0, p, this.shootVec);
        } else {
          p[0] = this.pos[0] - 1.22;
          p[1] = this.pos[1] - 1.22;
          g.enemyAmmo.addAmmo(0, p, this.shootVec);
          p[1] += 0.5;
          g.enemyAmmo.addAmmo(0, p, this.shootVec);
        }
      }
    } else {
      if (this.preFire > 0.0) this.preFire = f(this.preFire - 0.05);
      else this.preFire = 0.0;
    }
    // add Gnats
    if (!(Math.trunc(this.age / 512) % 2)) {
      if (!(Math.trunc(this.age / 64) % 2) && !(this.age % 5)) {
        p[0] += 1.7;
        p[1] += 1.2;
        const gnat = g.itemAdd.dynamicEnemyAdd(EnemyGnat, p, g.gameFrame + 2);
        gnat.over = this;
        gnat.setTarget(this);
      }
    }
  }
  protected move(): void {
    const g = this.game;
    const hpos = this.targetPos();
    let d0 = f(hpos[0] - this.pos[0]);
    let d1 = f(hpos[1] - this.pos[1]);
    let approachDist: number;
    if (Math.trunc((this.age + 25) / 512) % 2) approachDist = f(9.0 * (2.0 - g.gameSkill));
    else approachDist = f(12.0 * (2.0 - g.gameSkill));
    if (Math.abs(d1) < approachDist + 2.0 * sin(g.frame * 0.05)) d1 = f(f(d1 * d1) / approachDist);
    d0 = f(d0 + 5.0 * sin(this.age * 0.1));
    if (Math.trunc(this.age / 512) % 2) {
      this.lastMoveX = f(0.98 * this.lastMoveX + 0.0010 * g.gameSkill * d0);
      this.lastMoveY = f(0.90 * this.lastMoveY + 0.0020 * g.gameSkill * d1);
    } else {
      this.lastMoveX = f(0.90 * this.lastMoveX + 0.0003 * g.gameSkill * d0);
      this.lastMoveY = f(0.90 * this.lastMoveY + 0.0010 * g.gameSkill * d1);
    }
    this.pos[0] += f(g.speedAdj * this.lastMoveX);
    this.pos[1] += f(g.speedAdj * f(this.lastMoveY + this.vel[1]));
    this.clampX();
  }
}

// ---- src/EnemyFleet.cpp --------------------------------------------------------------------------
export class EnemyFleet {
  /** squadRoot->next ...: the enemies on screen, in list order */
  ships: EnemyAircraft[] = [];
  shipTex: (Texture | null)[] = [];
  extraTex: (Texture | null)[] = [];
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    this.loadTextures();
    // the list head is an aircraft too (and draws its random numbers)
    EnemyAircraft.makeNewEnemy(game, EnemyStraight, [0.0, 0.0, 0.0]);
  }

  loadTextures(): void {
    const img = this.game.images;
    for (let i = 0; i < NumEnemyTypes; i++) {
      this.shipTex[i] = img.load(`enemy0${i}.png`);
      this.extraTex[i] = null;
    }
    this.extraTex[EnemyStraight] = img.load('enemyAmmo00.png');
    this.extraTex[EnemyOmni] = img.load('enemy01-extra.png');
    this.extraTex[EnemyTank] = img.load('enemy03-extra.png');
    this.extraTex[EnemyBoss00] = this.extraTex[EnemyTank];
    this.extraTex[EnemyBoss01] = this.extraTex[EnemyStraight];
  }

  clear(): void {
    const list = this.ships;
    this.ships = [];
    for (const e of list) this.killEnemy(e);
  }

  drawGL(): void {
    const g = this.game;
    const gl = g.gl;
    gl.color4f(1.0, 1.0, 1.0, 1.0);
    for (let k = 0; k < this.ships.length; k++) {
      const e = this.ships[k];
      const p = e.pos;
      let szx = e.size[0];
      const szy = e.size[1];
      gl.bindTexture(this.shipTex[e.type]);
      gl.color4f(1.0, 1.0, 1.0, 1.0);
      gl.pushMatrix();
      gl.translatef(p[0], p[1], p[2]);
      drawQuad(gl, szx, szy);
      gl.popMatrix();
      switch (e.type) {
        case EnemyStraight:
          if (e.preFire) {
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
            gl.bindTexture(this.extraTex[EnemyStraight]);
            gl.color4f(1.0, 1.0, 1.0, e.preFire);
            szx = f(0.55 * e.preFire);
            gl.pushMatrix();
            gl.translatef(p[0], p[1] - 0.9, p[2]);
            gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
            drawQuad(gl, szx, szx + 0.1);
            gl.popMatrix();
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            gl.color4f(1.0, 1.0, 1.0, 1.0);
          }
          if (!((e.age - 192) % 256)) this.retarget(EnemyGnat, g.hero);
          break;
        case EnemyOmni:
          gl.color4f(1.0, 0.0, 0.0, 1.0);
          gl.bindTexture(this.extraTex[EnemyOmni]);
          gl.pushMatrix();
          gl.translatef(p[0], p[1], p[2]);
          gl.rotatef(-(e.age * 8), 0.0, 0.0, 1.0);
          drawQuad(gl, szx, szy);
          gl.popMatrix();
          gl.color4f(1.0, 1.0, 1.0, 1.0);
          break;
        case EnemyTank:
          if (e.preFire) {
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
            gl.bindTexture(this.extraTex[EnemyTank]);
            gl.color4f(1.0, 1.0, 1.0, e.preFire);
            gl.pushMatrix();
            gl.translatef(p[0], p[1] - 0.63, p[2]);
            gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
            szx = f(0.4 + 0.6 * e.preFire);
            drawQuad(gl, szx, szx);
            gl.popMatrix();
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            gl.color4f(1.0, 1.0, 1.0, 1.0);
          }
          break;
        case EnemyBoss00:
          if (e.preFire) {
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
            gl.bindTexture(this.extraTex[EnemyBoss00]);
            gl.color4f(1.0, 1.0, 1.0, e.preFire);
            szx = f(0.4 + 0.6 * e.preFire);
            gl.pushMatrix();
            gl.translatef(p[0] + 1.1, p[1] - 0.4, p[2]);
            gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
            drawQuad(gl, szx, szx);
            gl.popMatrix();
            gl.pushMatrix();
            gl.translatef(p[0] - 1.1, p[1] - 0.4, p[2]);
            gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
            drawQuad(gl, szx, szx);
            gl.popMatrix();
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            gl.color4f(1.0, 1.0, 1.0, 1.0);
          }
          break;
        case EnemyBoss01:
          if (e.preFire) {
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
            gl.bindTexture(this.extraTex[EnemyBoss01]);
            gl.color4f(1.0, 1.0, 1.0, e.preFire);
            szx = f(0.9 * e.preFire);
            if (e.shootSwap) {
              gl.pushMatrix();
              gl.translatef(p[0] - 1.22, p[1] - 1.22, p[2]);
              gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
              drawQuad(gl, szx, szx);
              drawQuad(gl, szx + 0.2, szx + 0.2);
              gl.popMatrix();
            } else {
              gl.pushMatrix();
              gl.translatef(p[0] + 0.55, p[1] - 1.7, p[2]);
              gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
              drawQuad(gl, szx, szx);
              drawQuad(gl, szx + 0.3, szx + 0.3);
              gl.popMatrix();
            }
            gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            gl.color4f(1.0, 1.0, 1.0, 1.0);
          }
          if (!((e.age - 272) % 256)) this.retarget(EnemyGnat, g.hero);
          break;
        default:
          break;
      }
    }
  }

  retarget(et: number, newTarget: ScreenItem): void {
    for (const e of this.ships) if (e.type === et) e.target = newTarget;
  }

  update(): void {
    const g = this.game;
    for (let k = 0; k < this.ships.length; k++) {
      const e = this.ships[k];
      e.update();
      const p = new Float32Array(e.pos);
      // damage explosions on the bosses, so we know when they're hurting
      if (e.type >= EnemyBoss00) {
        const size = f(e.size[0] * 0.7);
        const s = [size, size];
        const boom = (every: number) => {
          if (!(g.gameFrame % every)) {
            p[0] = e.pos[0] + f(g.rand.S * s[0]);
            p[1] = e.pos[1] + f(g.rand.S * s[1]);
            p[2] = e.pos[2];
            g.explosions.addExplo(X.EnemyDamage, p, 0, 1.0);
          }
        };
        if (e.damage > e.baseDamage * 0.7) boom(18);
        if (e.damage > e.baseDamage * 0.5) boom(10);
        if (e.damage > e.baseDamage * 0.3) boom(4);
      }
      // enemies that got through
      if (e.pos[1] < -8.0 && e.type !== EnemyGnat) g.statusDisplay.enemyWarning(f(1.0 - (e.pos[1] + 14.0) / 6.0));
      if (e.pos[1] < -14.0) {
        e.damage = 1;
        e.age = 0;
        g.hero.loseLife();
        g.tipShipPast++;
      }
      // critically damaged: destroyed
      if (e.damage > 0) {
        this.ships.splice(k, 1);
        k--;
        if (e.age) {
          switch (e.type) {
            case EnemyBoss01:
            case EnemyBoss00:
              this.destroyAll();
              this.bossExplosion(e);
              if (g.gameMode !== HeroDead) {
                // TRIGGER END OF LEVEL
                g.hero.addScore(5000.0);
                g.gameMode = LevelOver;
                g.heroSuccess = 0;
              }
              break;
            case EnemyOmni:
              g.hero.addScore(25.0);
              g.explosions.addExplo(X.EnemyDamage, e.pos);
              g.explosions.addExplo(X.EnemyDamage, e.pos, -3, 0.7);
              g.explosions.addExplo(X.EnemyAmmo04, e.pos);
              g.audio.playSound(A.ExploPop, e.pos);
              break;
            case EnemyRayGun:
              g.hero.addScore(1000.0);
              g.explosions.addExplo(X.EnemyDestroyed, p);
              p[0] = e.pos[0] + 0.55;
              g.explosions.addExplo(X.EnemyDestroyed, p, -5, 1.5);
              p[0] = e.pos[0] - 0.5;
              p[1] = e.pos[1] + 0.2;
              g.explosions.addExplo(X.EnemyDestroyed, p, -15);
              p[0] = e.pos[0];
              g.explosions.addExplo(X.EnemyDestroyed, p, -20, 2.0);
              g.explosions.addExplo(X.EnemyDamage, p, -30, 2.0);
              g.audio.playSound(A.Explosion, e.pos);
              g.audio.playSound(A.ExploBig, e.pos);
              break;
            case EnemyTank:
              g.hero.addScore(1500.0);
              p[0] = e.pos[0]; p[1] = e.pos[1];
              g.explosions.addExplo(X.EnemyDestroyed, p, -5, 2.5);
              p[0] = e.pos[0] - 0.9; p[1] = e.pos[1] - 1.0;
              g.explosions.addExplo(X.EnemyDestroyed, p, -0, 1.5);
              p[0] = e.pos[0] + 1.0; p[1] = e.pos[1] - 0.8;
              g.explosions.addExplo(X.EnemyDestroyed, p, -13, 2.0);
              g.explosions.addExplo(X.EnemyDestroyed, p, -2, 1.0);
              p[0] = e.pos[0] + 0.7; p[1] = e.pos[1] + 0.7;
              g.explosions.addExplo(X.EnemyDestroyed, p, -20, 1.7);
              p[0] = e.pos[0] - 0.7; p[1] = e.pos[1] + 0.9;
              g.explosions.addExplo(X.EnemyDestroyed, p, -8, 1.5);
              g.audio.playSound(A.Explosion, e.pos);
              g.audio.playSound(A.ExploBig, e.pos);
              break;
            case EnemyGnat:
              g.hero.addScore(10.0);
              g.explosions.addExplo(X.EnemyAmmo04, e.pos);
              g.audio.playSound(A.ExploPop, e.pos);
              break;
            default:
              g.hero.addScore(75.0);
              g.explosions.addExplo(X.EnemyDestroyed, e.pos);
              g.explosions.addExplo(X.EnemyDamage, e.pos, -15);
              g.audio.playSound(A.Explosion, e.pos);
              break;
          }
        }
        this.killEnemy(e);
      }
    }
  }

  private bossExplosion(e: EnemyAircraft): void {
    const g = this.game;
    const r = g.rand;
    let a: number, b: number, c: number, d: number;
    const p = new Float32Array(e.pos);
    for (let i = 4; i > 0; i--) {
      a = e.size[0] * (i * 0.2);
      b = e.size[1] * (i * 0.2);
      const corner = (sx: number, sy: number) => {
        p[0] = e.pos[0] + sx * a * r.F;
        p[1] = e.pos[1] + sy * b * r.F;
        const randval = Math.trunc(-r.F * 8.0);
        g.explosions.addExplo(X.EnemyDestroyed, p, randval, 1.5 + r.F);
      };
      corner(1, 1);
      corner(-1, 1);
      corner(1, -1);
      corner(-1, -1);
    }
    let scaleX: number, scaleY: number;
    switch (e.type) {
      case EnemyBoss00: a = 1.55; b = 1.56; c = 1.58; d = 1.50; scaleX = 4.0; scaleY = 2.0; break;
      case EnemyBoss01: a = 1.0; b = 1.0; c = 1.75; d = 1.75; scaleX = f(3.5); scaleY = f(4.2); break;
      default: a = b = c = d = 1.0; scaleX = scaleY = 1.0; break;
    }
    // Boss Visual Explosion
    for (let i = 0; i < 100; i++) {
      const ii = f(i * 0.5);
      const rr = f(ii / 40.0);
      let xsin = f(f(rr * scaleX) * sin(ii * a));
      let ycos = f(f(rr * scaleY) * cos(ii * b));
      p[0] = e.pos[0] + xsin;
      p[1] = e.pos[1] + ycos;
      if (!(i % 4)) g.explosions.addExplo(X.EnemyDestroyed, p, Math.trunc(f(-ii * 2.0)), 1.5 + r.F);
      xsin = f(f(rr * scaleX) * sin(i * c));
      ycos = f(f(rr * scaleY) * cos(i * d));
      p[0] = e.pos[0] + xsin * 1.5;
      p[1] = e.pos[1] - ycos * 1.5;
      if (!(i % 5)) {
        g.explosions.addExplo(X.EnemyDestroyed, p, Math.trunc(f(-40.0 - f(ii * 3.0))), 1.5 + r.F);
        g.explosions.addExplo(X.EnemyDamage, p, Math.trunc(f(-60.0 - f(ii * 3.0))), 1.5 + r.F);
      }
      p[0] = e.pos[0] + xsin * 1.5;
      p[1] = e.pos[1] + ycos * 1.0;
      if (!(i % 3)) g.explosions.addExplo(X.EnemyDestroyed, p, Math.trunc(-ii), 1.5 + r.F);
      p[0] = f(e.pos[0] - ycos);
      p[1] = f(e.pos[1] + xsin);
      if (!(i % 3)) g.explosions.addExplo(X.EnemyDestroyed, p, Math.trunc(-ii), 1.5 + r.F);
    }
    // Boss Audio Explosion
    p[0] = -10.0; p[1] = -5.0;
    g.audio.playSound(A.Explosion, p);
    g.audio.playSound(A.Explosion, p, -27);
    g.audio.playSound(A.ExploPop, p, -45);
    p[0] = 10.0;
    g.audio.playSound(A.Explosion, p, -3);
    g.audio.playSound(A.Explosion, p, -25);
    g.audio.playSound(A.ExploPop, p, -40);
    p[0] = 0.0;
    g.audio.playSound(A.ExploBig, p, 0);
    g.audio.playSound(A.ExploBig, p, -60);
    g.audio.playSound(A.ExploPop, p, -55);
    g.audio.playSound(A.ExploPop, p, -80);
    g.audio.playSound(A.ExploPop, p, -120);
    g.audio.playSound(A.ExploPop, p, -160);
  }

  destroyAll(): void {
    for (const e of this.ships) e.damage = 1;
  }

  addEnemy(e: EnemyAircraft): void {
    if (e.over) {
      // after the 'over' aircraft; if it is gone, the new one is lost (as in the original)
      const k = this.ships.indexOf(e.over);
      if (k >= 0) this.ships.splice(k + 1, 0, e);
    } else this.ships.unshift(e);
  }

  killEnemy(e: EnemyAircraft): void {
    this.game.itemAdd.killScreenItem(e);
  }
}

export function drawQuad(gl: GL, szx: number, szy: number): void {
  gl.begin(GL_TRIANGLE_STRIP);
  gl.texCoord2f(1.0, 0.0); gl.vertex3f(szx, szy, 0.0);
  gl.texCoord2f(0.0, 0.0); gl.vertex3f(-szx, szy, 0.0);
  gl.texCoord2f(1.0, 1.0); gl.vertex3f(szx, -szy, 0.0);
  gl.texCoord2f(0.0, 1.0); gl.vertex3f(-szx, -szy, 0.0);
  gl.end();
}
