// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/HeroAircraft.cpp, the player's ship.
import { cos, sin } from '../libm.ts';
import { GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA, type Texture } from '../gl.ts';
import { NUM_HERO_AMMO_TYPES } from './ammo.ts';
import { drawQuad, EnemyBoss00, type EnemyFleet } from './enemies.ts';
import * as X from './explosions.ts';
import { ScreenItem, ItemHero } from './item.ts';
import * as P from './powerups.ts';
import * as A from './audio.ts';
import { Game, HeroDead, type Global } from './global.ts';

const f = Math.fround;
export const HERO_Z = 25.0;
export const HERO_DAMAGE = -500.0;
export const HERO_SHIELDS = 500.0;
export const AMMO_REFILL = 150;
export const NUM_HERO_ITEMS = 1;
export const DEATH_SPIKES = 7;
export const DEATH_TIME = 50;

export class HeroAircraft extends ScreenItem {
  heroTex: Texture | null = null;
  bombTex: Texture | null = null;
  gunFlash0 = new Float32Array(NUM_HERO_AMMO_TYPES);
  gunFlash1 = new Float32Array(NUM_HERO_AMMO_TYPES);
  gunActive = [false, false, false];
  size = new Float32Array([0.7, 0.85]);
  bound = [new Float32Array([-10.0, 10.0]), new Float32Array([-7.5, 7.5])];
  deathCircle = [0, 0, 0, 0, 0, 0, 0].map(() => new Float32Array(2));
  deathStereo = 0;
  lives = 4;
  dontShow = 0;
  superBomb = 0;
  scoreStep = f(50000.0);
  scoreTarget = f(50000.0);
  ammoStock = new Float32Array(NUM_HERO_AMMO_TYPES);
  gunPause = new Float32Array(NUM_HERO_AMMO_TYPES);
  gunSwap = false;
  gunTrigger = false;
  damage = 0;
  shields = 0;
  score = 0;
  currentItemIndex = 0;
  useItemArmed = 0;
  secondaryMove = new Float32Array(2);
  private readonly game: Global;

  constructor(game: Global) {
    super(ItemHero);
    this.game = game;
    this.loadTextures();
    this.reset();
  }

  loadTextures(): void {
    this.heroTex = this.game.images.load('hero.png');
    this.bombTex = this.game.images.load('superBomb.png');
  }

  /** a copy of the position (epos) */
  getPos(): Float32Array {
    return new Float32Array(this.pos);
  }

  getLives(): number { return this.lives; }
  getScore(): number { return this.score; }
  getSize(i: number): number { return this.size[i]; }
  getAmmoStock(i: number): number { return this.ammoStock[i]; }
  getDamage(): number { return this.damage; }
  getShields(): number { return this.shields; }
  isVisible(): boolean { return !this.dontShow; }
  currentItem(): number { return this.currentItemIndex; }
  itemArmed(): number { return this.useItemArmed; }
  nextItem(): void { this.useItemArmed = 0.0; this.currentItemIndex = ++this.currentItemIndex % NUM_HERO_ITEMS; }

  newGame(): void {
    this.score = 0;
    this.superBomb = 0;
    this.reset();
  }

  reset(): void {
    this.pos[0] = 0.0;
    this.pos[1] = -3.0;
    this.pos[2] = HERO_Z;
    this.dontShow = 0;
    this.damage = HERO_DAMAGE;
    this.shields = HERO_SHIELDS;
    this.currentItemIndex = 0;
    this.secondaryMove[0] = this.secondaryMove[1] = 0.0;
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      this.gunPause[i] = -1;
      this.ammoStock[i] = 0;
      this.gunActive[i] = false;
      this.gunFlash0[i] = 0.0;
      this.gunFlash1[i] = 0.0;
    }
    this.gunTrigger = false;
    this.gunSwap = false;
  }

  fullHealth(): void {
    const x = this.game.explosions;
    this.damage = HERO_DAMAGE;
    this.shields = HERO_SHIELDS;
    const p0 = new Float32Array([10.4, -8.30, 25.0]);
    const v0 = new Float32Array([0.0, 0.08, 0.0]);
    const clr = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    p0[0] = -10.4;
    for (const a of [0, 0, -1, -3, -4]) x.addElectric(p0, v0, clr, a);
    p0[0] = 10.4;
    for (const a of [0, 0, -1, -3, -4]) x.addElectric(p0, v0, clr, a);
    this.secondaryMove[0] = this.secondaryMove[1] = 0.0;
    this.gunTrigger = false;
    this.gunSwap = false;
  }

  addScore(v: number): void {
    if (this.game.gameMode !== HeroDead) this.score = f(this.score + f(v));
  }

  addLife(score = false): void {
    const g = this.game;
    const p = new Float32Array([10.2, 0.0, 25.0]);
    p[1] = 7.4 - f(this.lives * g.hero.size[1]);
    g.audio.playSound(A.AddLife, p);
    g.explosions.addExplo(X.AddLife, p);
    g.explosions.addExplo(X.AddLife, p, -10);
    g.explosions.addExplo(X.AddLife, p, -13);
    if (score) {
      p[0] = -7.9;
      p[1] = -8.0;
      g.audio.playSound(A.AddLife, p);
      g.explosions.addExplo(X.PowerBurst, p);
      g.explosions.addExplo(X.ScoreLife, p, 0);
      g.explosions.addExplo(X.ScoreLife, p, -3);
      g.explosions.addExplo(X.ScoreLife, p, -9);
      g.explosions.addExplo(X.ScoreLife, p, -15);
    }
    if (this.lives < 9) this.lives++;
    else this.superBomb = 1;
  }

  loseLife(): void {
    const g = this.game;
    const p = new Float32Array([10.2, 0.0, 25.0]);
    this.lives--;
    p[1] = 7.4 - f(this.lives * g.hero.size[1]);
    if (this.lives > -2) {
      g.audio.playSound(A.LoseLife, p);
      g.explosions.addExplo(X.LoseLife, p, 0, 1.5);
      g.explosions.addExplo(X.LoseLife, p, -10, 1.5);
      g.explosions.addExplo(X.LoseLife, p, -13, 1.5);
      g.explosions.addExplo(X.PowerBurst, p);
    }
    if (this.lives < 0 && g.gameMode !== HeroDead) {
      this.damage = 0;
      this.shields = 0;
      this.startDeath();
    }
  }

  setLives(n: number): void {
    if (n > 9) n = 9;
    this.lives = n;
  }

  useItemIndex(index: number): void {
    if (this.currentItemIndex === index) {
      this.useItem();
    } else if (index < NUM_HERO_ITEMS && index >= 0) {
      this.currentItemIndex = index;
      this.useItemArmed = 0.0;
      this.useItem();
    }
  }

  useItem(): void {
    const g = this.game;
    if (g.gameMode === Game && !this.superBomb && !g.gamePause) {
      if (!this.useItemArmed) {
        this.useItemArmed = 1.0;
      } else {
        this.useItemArmed = 0.0;
        const v = new Float32Array([0.0, 0.7, 0.0]);
        switch (this.currentItemIndex) {
          case 0: // self destruct
            for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
              // eject all ammo - return remaining ammo to game->powerUps
              if (this.ammoStock[i] > 1.0) {
                v[0] = f(g.rand.S * 0.15);
                v[1] = f(0.1 + g.rand.F * 0.1);
                const pwrUp = new P.PowerUp(i + P.HeroAmmo00, this.pos, f(this.ammoStock[i] / AMMO_REFILL), v);
                g.powerUps.addPowerUp(pwrUp);
              }
            }
            this.damage = 0.0;
            this.shields = 0.0;
            this.lives--;
            this.startDeath();
            break;
          default:
            break;
        }
      }
    }
  }

  moveEvent(x: number, y: number): void {
    const g = this.game;
    const ms = g.config.movementSpeed();
    if (g.gameMode !== HeroDead && !g.gamePause) {
      this.pos[0] += f(x * ms);
      this.pos[1] += f(-y * ms);
      if (this.pos[0] < this.bound[0][0]) this.pos[0] = this.bound[0][0];
      else if (this.pos[0] > this.bound[0][1]) this.pos[0] = this.bound[0][1];
      if (this.pos[1] < this.bound[1][0]) this.pos[1] = this.bound[1][0];
      else if (this.pos[1] > this.bound[1][1]) this.pos[1] = this.bound[1][1];
    }
  }

  ammoDamage(d: number, vec: Float32Array): void {
    if (this.superBomb) return;
    const fd = f(d / 50.0);
    this.secondaryMove[0] = vec[0] * fd;
    this.secondaryMove[1] = vec[1] * fd;
    const a = 2.0;
    this.pos[0] += f(f(vec[0] * fd) * a);
    this.pos[1] += f(f(vec[1] * fd) * a);
    this.pos[2] += f(f(vec[2] * fd) * a);
    this.doDamage(d);
  }

  doDamage(d: number): void {
    const g = this.game;
    if (this.superBomb) return;
    if (this.shields > HERO_SHIELDS) {
      this.shields = f(this.shields - d * 0.25);
      g.explosions.addExplo(X.HeroShields, this.pos);
      g.statusDisplay.setShieldAlpha(1.0);
    } else if (this.shields > 0.0) {
      this.shields = f(this.shields - d * 0.8);
      this.damage = f(this.damage + d * 0.2);
      if (this.shields < 0.0) this.shields = 0.0;
      g.explosions.addExplo(X.HeroShields, this.pos);
      g.statusDisplay.setShieldAlpha(1.0);
      g.statusDisplay.setDamageAlpha(1.0);
    } else {
      this.damage = f(this.damage + d);
      g.statusDisplay.setDamageAlpha(1.0);
    }
    if (this.damage > 0.0) {
      this.damage = 0.0;
      this.lives--;
      this.startDeath();
    }
  }

  fireGun(status: boolean): void {
    if (this.dontShow) return;
    if (status && this.game.gameMode !== HeroDead) {
      this.gunTrigger = true;
      this.gunPause[0] = 0;
      if (this.gunActive[1] && this.gunPause[1] < 0) this.gunPause[1] = 0;
      if (this.gunActive[2] && this.gunPause[2] < 0) this.gunPause[2] = 0;
    } else {
      this.gunTrigger = false;
      this.gunPause[0] = -1;
    }
  }

  private shootGun(): void {
    const ammo = this.game.heroAmmo;
    const pos = this.pos;
    const p = new Float32Array([0.0, 0.0, pos[2]]);
    const doubleFire = this.currentItemIndex === 1 && this.useItemArmed;
    if (this.gunPause[0] <= 0) {
      this.gunPause[0] = 5;
      p[0] = pos[0] + 0.3;
      p[1] = pos[1] + 0.8;
      ammo.addAmmo(0, p);
      p[0] = pos[0] - 0.3;
      ammo.addAmmo(0, p);
      if (this.gunActive[0]) {
        p[0] = pos[0] + 0.45;
        p[1] = pos[1] + 0.2;
        ammo.addAmmo(0, p);
        p[0] = pos[0] - 0.45;
        ammo.addAmmo(0, p);
        this.ammoStock[0] -= 0.5;
      }
      if (doubleFire) {
        p[0] = pos[0] + 0.37;
        p[1] = pos[1] + 0.6;
        ammo.addAmmo(0, p);
        p[0] = pos[0] - 0.37;
        ammo.addAmmo(0, p);
        if (this.gunActive[0]) {
          p[0] = pos[0] + 0.52;
          p[1] = pos[1];
          ammo.addAmmo(0, p);
          p[0] = pos[0] - 0.52;
          ammo.addAmmo(0, p);
          this.ammoStock[0] -= 0.75;
        }
      }
    }
    if (this.gunActive[1] && this.gunPause[1] <= 0.0) {
      this.gunPause[1] = 25;
      p[0] = pos[0];
      p[1] = pos[1] + 1.1;
      ammo.addAmmo(1, p);
      this.ammoStock[1] -= 1.5;
      if (doubleFire) {
        p[1] -= 0.2;
        p[0] = pos[0] + 0.09;
        ammo.addAmmo(1, p);
        p[0] = pos[0] - 0.09;
        ammo.addAmmo(1, p);
        this.ammoStock[1] -= 4.5;
      }
    }
    if (this.gunActive[2] && this.gunPause[2] <= 0.0) {
      this.gunSwap = !this.gunSwap;
      this.gunPause[2] = 5;
      p[1] = pos[1] + 0.4;
      if (this.gunSwap) {
        p[0] = pos[0] + 0.7;
        ammo.addAmmo(2, p);
      } else {
        p[0] = pos[0] - 0.7;
        ammo.addAmmo(2, p);
      }
      this.ammoStock[2] -= 1.5;
      if (doubleFire) {
        p[0] = this.gunSwap ? pos[0] + 0.85 : pos[0] - 0.85;
        p[1] -= 0.75;
        ammo.addAmmo(2, p);
        this.ammoStock[2] -= 3.5;
      }
    }
    // clean up gun active
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      if (this.ammoStock[i] < 0.0) {
        this.ammoStock[i] = 0.0;
        this.gunActive[i] = false;
      }
    }
  }

  private setAmmoStock(index: number, value: number): void {
    if (index >= 0 && index < NUM_HERO_AMMO_TYPES) {
      this.game.statusDisplay.setAmmoAlpha(1.0);
      this.gunPause[index] = 1;
      this.gunActive[index] = true;
      this.ammoStock[index] = value;
    }
  }

  checkForCollisions(fleet: EnemyFleet): void {
    const g = this.game;
    const p = new Float32Array(3);
    for (const enemy of fleet.ships) {
      let diffX = f(this.pos[0] - enemy.pos[0]);
      let diffY = f(this.pos[1] - enemy.pos[1]);
      const dist = f(Math.abs(diffX) + Math.abs(diffY));
      if (!this.dontShow && dist < f(enemy.size[0] + this.size[0])) {
        let power = f(-enemy.damage * 0.5);
        if (power > 35.0) power = 35.0;
        this.doDamage(power);
        if (this.shields > HERO_SHIELDS) {
          power = f(power * 0.5);
          enemy.damage = f(enemy.damage + 70.0);
        } else enemy.damage = f(enemy.damage + 40.0);
        const r1 = f(g.rand.S * 0.3);
        const r2 = f(g.rand.S * 0.4);
        p[0] = enemy.pos[0] + r1;
        p[1] = enemy.pos[1] + r2;
        p[2] = enemy.pos[2];
        g.explosions.addExplo(X.EnemyDamage, p);
        p[0] = this.pos[0] + r1;
        p[1] = this.pos[1] + 0.2 + r2;
        p[2] = this.pos[2];
        if (this.shields > 0.0) g.explosions.addExplo(X.HeroShields, p);
        else g.explosions.addExplo(X.HeroDamage, p);
        this.secondaryMove[0] = f(diffX * power) * 0.03;
        this.secondaryMove[1] = f(diffY * power) * 0.03;
        enemy.secondaryMove[0] -= f(diffX * enemy.collisionMove);
        enemy.secondaryMove[1] -= diffY * (enemy.collisionMove * 0.5);
      }
      if (this.superBomb) {
        diffX = f(-enemy.pos[0]);
        diffY = f(-15.0 - enemy.pos[1]);
        const d = f(Math.sqrt(f(f(diffX * diffX) + f(diffY * diffY))));
        if ((d < this.superBomb * 0.1 && enemy.type < EnemyBoss00) || enemy.pos[1] < -11.0) enemy.damage = f(enemy.damage + 5000.0);
        if (this.superBomb > 300) this.superBomb = 0;
      }
    }
    if (this.superBomb) this.superBomb += 2;
  }

  checkForPowerUps(powerUps: P.PowerUps): void {
    const g = this.game;
    if (this.dontShow) return;
    if (this.score > this.scoreTarget) {
      this.scoreTarget = f(this.scoreTarget + this.scoreStep);
      this.addLife(true);
    }
    const p0 = new Float32Array([10.4, -8.30, 25.0]);
    const v0 = new Float32Array([0.0, 0.08, 0.0]);
    const clr = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    if (g.gameMode !== Game) return;
    const x = g.explosions;
    for (let k = 0; k < powerUps.list.length;) {
      const pwr = powerUps.list[k];
      const dist = f(Math.abs(f(this.pos[0] - pwr.pos[0])) + Math.abs(f(this.pos[1] - pwr.pos[1])));
      if (dist < this.size[1]) {
        g.audio.playSound(A.PowerUp, this.pos);
        let stock: number;
        switch (pwr.type) {
          case P.Shields:
            if (this.shields < HERO_SHIELDS) this.shields = HERO_SHIELDS;
            g.statusDisplay.setShieldAlpha(5.0);
            p0[0] = -10.4;
            for (const a of [0, -1, -3, -4]) x.addElectric(p0, v0, clr, a);
            break;
          case P.SuperShields:
            g.tipSuperShield++;
            this.damage = f(this.damage - this.shields);
            if (this.damage < HERO_DAMAGE) this.damage = HERO_DAMAGE;
            this.shields = HERO_SHIELDS * 2;
            g.statusDisplay.setDamageAlpha(5.0);
            g.statusDisplay.setShieldAlpha(5.0);
            p0[0] = -10.4;
            for (const a of [0, -1, -3, -4, -10, -11, -13, -14]) x.addElectric(p0, v0, clr, a);
            p0[0] = 10.4;
            for (const a of [0, -1, -3, -4, -10, -11, -13, -14]) x.addElectric(p0, v0, clr, a);
            break;
          case P.Repair:
            g.statusDisplay.setDamageAlpha(5.0);
            this.damage = HERO_DAMAGE;
            p0[0] = 10.4;
            for (const a of [0, -1, -3, -4]) x.addElectric(p0, v0, clr, a);
            break;
          case P.HeroAmmo00:
          case P.HeroAmmo01:
          case P.HeroAmmo02: {
            const i = pwr.type - P.HeroAmmo00;
            this.addScore(100.0);
            stock = f(this.ammoStock[i] + f(pwr.power * AMMO_REFILL));
            if (stock > AMMO_REFILL) stock = AMMO_REFILL;
            this.setAmmoStock(i, stock);
            break;
          }
          default:
            break;
        }
        x.addExplo(X.PowerBurst, pwr.pos);
        powerUps.list.splice(k, 1);
      } else k++;
    }
  }

  update(): void {
    const g = this.game;
    const S = g.speedAdj;
    if (this.dontShow > 1) {
      this.pos[0] = cos(g.frame * 0.02) * 9.0;
      this.pos[1] = 4.0 + sin(g.frame * 0.07) * 2.0;
    } else if (this.dontShow === 1) {
      this.pos[0] = 0.0;
      this.pos[1] = -3.0;
    }
    // Gun flashes are drawn in StatusDisplay
    if (this.gunTrigger) this.shootGun();
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      if (this.gunPause[i] >= 0) this.gunPause[i] -= S;
      if (this.gunTrigger) {
        let flash: number, pause: number;
        switch (i) {
          case 0:
            flash = f(5.0 / S);
            pause = f(this.gunPause[i] / S);
            this.gunFlash0[i] = f(flash - pause) / flash;
            if (this.gunActive[i]) this.gunFlash1[i] = f(flash - pause) / flash;
            else this.gunFlash1[i] = 0.0;
            break;
          case 1:
            flash = f(10.0 / S);
            pause = f(this.gunPause[i] / S);
            if (this.gunActive[i] && this.gunPause[i] < flash) this.gunFlash0[i] = f(flash - pause) / flash;
            else this.gunFlash0[i] = 0.0;
            break;
          case 2:
            flash = f(5.0 / S);
            pause = f(this.gunPause[i] / S);
            if (this.gunActive[i]) {
              if (this.gunPause[i] < flash) {
                if (this.gunSwap) {
                  this.gunFlash0[i] = f(flash - pause) / flash;
                  this.gunFlash1[i] = 0.0;
                } else {
                  this.gunFlash0[i] = 0.0;
                  this.gunFlash1[i] = f(flash - pause) / flash;
                }
              }
            } else {
              this.gunFlash0[i] = 0.0;
              this.gunFlash1[i] = 0.0;
            }
            break;
        }
      } else {
        if (this.gunFlash0[i] > 0.0) this.gunFlash0[i] -= 0.075 * S;
        else this.gunFlash0[i] = 0.0;
        if (this.gunFlash1[i] > 0.0) this.gunFlash1[i] -= 0.075 * S;
        else this.gunFlash1[i] = 0.0;
      }
    }
    // decrement item activation
    switch (this.currentItemIndex) {
      case 0: this.useItemArmed = f(this.useItemArmed - 0.02); break;
      case 1: if (this.useItemArmed) this.doDamage(1); break;
    }
    if (this.useItemArmed < 0.0) this.useItemArmed = 0.0;
    // decrement supershields
    if (this.shields >= HERO_SHIELDS) this.shields = f(this.shields - 0.15 * S);
    const s = f((1.0 - S) + S * 0.8);
    this.secondaryMove[0] *= s;
    this.secondaryMove[1] *= s;
    this.pos[0] += f(this.secondaryMove[0] * S);
    this.pos[1] += f(this.secondaryMove[1] * S);
    this.moveEvent(0, 0);
  }

  drawGL(): void {
    const g = this.game;
    const gl = g.gl;
    gl.pushMatrix();
    gl.translatef(this.pos[0], this.pos[1], this.pos[2]);
    if (!this.dontShow) {
      gl.color4f(1.0, 1.0, 1.0, 1.0);
      gl.bindTexture(this.heroTex);
      drawQuad(gl, this.size[0], this.size[1]);
    } else {
      this.dontShow--;
    }
    gl.popMatrix();
    if (this.superBomb) {
      const s = f(this.superBomb * 0.1);
      gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
      gl.bindTexture(this.bombTex);
      gl.pushMatrix();
      gl.translatef(0.0, -15.0, HERO_Z);
      gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
      drawQuad(gl, s, s);
      gl.popMatrix();
      gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    }
  }

  startDeath(): void {
    const g = this.game;
    this.deathExplosions();
    if (this.lives < 0) {
      this.fireGun(false);
      g.heroDeath = DEATH_TIME;
      g.gameMode = HeroDead;
      this.dontShow = -1;
    } else {
      this.superBomb = 1;
      this.reset();
      this.dontShow = 130;
    }
  }

  private deathExplosions(): void {
    const g = this.game;
    const r = g.rand;
    const pos = this.pos;
    const p = new Float32Array([0.0, -0.5, pos[2]]);
    this.deathStereo = 5.0;
    p[0] = -this.deathStereo;
    g.audio.playSound(A.Explosion, p);
    g.audio.playSound(A.Explosion, p, -45);
    p[0] = this.deathStereo;
    g.audio.playSound(A.Explosion, p);
    g.audio.playSound(A.Explosion, p, -20);
    p[0] = 0.0;
    g.audio.playSound(A.ExploBig, p);
    g.audio.playSound(A.ExploPop, p);
    // radius
    for (let i = 0; i < DEATH_SPIKES; i++) {
      const rnd = r.F;
      const a = rnd + 2.0 * Math.PI * (i / DEATH_SPIKES);
      const s = 0.5 + 0.5 * r.F;
      this.deathCircle[i][0] = sin(a) * s;
      this.deathCircle[i][1] = cos(a) * s;
      p[0] = pos[0] + this.deathCircle[i][0];
      p[1] = pos[1] + this.deathCircle[i][1];
      p[2] = pos[2];
      g.explosions.addExplo(X.EnemyDestroyed, p);
    }
    // explosions
    for (let i = 0; i < DEATH_TIME; i++) {
      const w = i % DEATH_SPIKES;
      const skip = 1 + Math.trunc(f(3.0 * r.F));
      p[2] = pos[2];
      if (i < DEATH_TIME - DEATH_SPIKES) {
        if (!(i % skip)) {
          const rr = f(1.25 + 4.0 * f(i / DEATH_TIME));
          p[0] = pos[0] + f(this.deathCircle[w][0] * rr);
          p[1] = pos[1] + f(this.deathCircle[w][1] * rr);
          g.explosions.addExplo(X.EnemyDestroyed, p, -i);
        }
      } else {
        p[0] = pos[0] + this.deathCircle[w][0];
        p[1] = pos[1] + this.deathCircle[w][1];
        g.explosions.addExplo(X.EnemyDestroyed, p, -i);
      }
      if (!(i % 21)) {
        this.deathStereo = f(-this.deathStereo * 1.5);
        p[0] = this.deathStereo;
        p[1] = -5.0;
        g.audio.playSound(A.Explosion, p, -i);
      }
    }
  }
}
