// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/Ammo.cpp, src/HeroAmmo.cpp,
// src/EnemyAmmo.cpp. Lists keep the original's order (a new shot goes first).
import { GL_QUADS, type Texture } from '../gl.ts';
import * as X from './explosions.ts';
import type { EnemyFleet } from './enemies.ts';
import type { HeroAircraft } from './hero.ts';
import type { Global } from './global.ts';

const f = Math.fround;
export const NUM_HERO_AMMO_TYPES = 3;
export const NUM_ENEMY_AMMO_TYPES = 5;

export class ActiveAmmo {
  pos = new Float32Array(3);
  vel = new Float32Array(3);
  damage = 0;
  init(p: ArrayLike<number>, v: ArrayLike<number>, d: number): void {
    this.pos[0] = p[0]; this.pos[1] = p[1]; this.pos[2] = p[2];
    this.vel[0] = v[0]; this.vel[1] = v[1]; this.vel[2] = v[2];
    this.damage = f(d);
  }
  updatePos(): void {
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];
    this.pos[2] += this.vel[2];
  }
}

export class HeroAmmo {
  roots: ActiveAmmo[][] = [];
  ammoSize: Float32Array[] = [];
  ammoDamage = new Float32Array(NUM_HERO_AMMO_TYPES);
  ammoTex: (Texture | null)[] = [];
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      this.roots[i] = [];
      this.ammoSize[i] = new Float32Array([0.5, 0]);
      this.ammoDamage[i] = 2.5;
    }
    this.loadTextures();
    this.ammoSize[0][0] = 0.05; this.ammoSize[0][1] = 0.65;
    this.ammoSize[1][0] = 0.11; this.ammoSize[1][1] = 1.5;
    this.ammoSize[2][0] = 0.3; this.ammoSize[2][1] = 1.5;
    this.ammoDamage[0] = 3.5;
    this.ammoDamage[1] = 6.0;
    this.ammoDamage[2] = 40.0;
  }

  loadTextures(): void {
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) this.ammoTex[i] = this.game.images.load(`heroAmmo0${i}.png`);
  }

  clear(): void {
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) this.roots[i] = [];
  }

  addAmmo(type: number, pos: ArrayLike<number>): void {
    const vel = new Float32Array(3);
    const speedAdj = this.game.speedAdj;
    switch (type) {
      case 0: vel[1] = 0.5 * speedAdj; break;
      case 1: vel[1] = 0.2 * speedAdj; break;
      case 2: vel[1] = 0.3 * speedAdj; break;
      default: break;
    }
    if (type >= 0 && type < NUM_HERO_AMMO_TYPES) {
      const a = new ActiveAmmo();
      a.init(pos, vel, this.ammoDamage[type]);
      this.roots[type].unshift(a);
    }
  }

  updateAmmo(): void {
    const bound = this.game.config.screenBoundY();
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      const list = this.roots[i];
      for (let k = 0; k < list.length;) {
        const a = list[k];
        if (a.pos[1] > bound) list.splice(k, 1);
        else { a.updatePos(); k++; }
      }
    }
  }

  checkForHits(fleet: EnemyFleet): void {
    let minShipY = f(100.0);
    const ships = fleet.ships;
    if (!ships.length) return;
    for (const e of ships) if (e.pos[1] - 3.0 < minShipY) minShipY = f(e.pos[1] - 3.0);
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      const list = this.roots[i];
      for (let k = 0; k < list.length;) {
        const a = list[k];
        if (a.pos[1] < minShipY) { k++; continue; }
        let killed = false;
        for (let j = 0; j < ships.length; j++) {
          const enemy = ships[j];
          if (enemy.checkHit(a)) {
            if (i === 1) enemy.damage = f(enemy.damage + f(this.ammoDamage[i] * this.game.speedAdj));
            else enemy.damage = f(enemy.damage + this.ammoDamage[i]);
            this.game.explosions.addExplo(X.HeroAmmo00 + i, a.pos);
            if (i !== 1) {
              list.splice(k, 1);
              killed = true;
              break;
            }
          }
        }
        if (!killed) k++;
      }
    }
  }

  drawGL(): void {
    const gl = this.game.gl;
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      gl.color4f(1.0, 1.0, 1.0, 1.0);
      gl.bindTexture(this.ammoTex[i]);
      gl.begin(GL_QUADS);
      const sx = this.ammoSize[i][0], sy = this.ammoSize[i][1];
      for (const a of this.roots[i]) {
        const p = a.pos;
        gl.texCoord2f(0.0, 0.0); gl.vertex3f(f(p[0] - sx), p[1], p[2]);
        gl.texCoord2f(0.0, 1.0); gl.vertex3f(f(p[0] - sx), f(p[1] - sy), p[2]);
        gl.texCoord2f(1.0, 1.0); gl.vertex3f(f(p[0] + sx), f(p[1] - sy), p[2]);
        gl.texCoord2f(1.0, 0.0); gl.vertex3f(f(p[0] + sx), p[1], p[2]);
      }
      gl.end();
    }
  }
}

export class EnemyAmmo {
  roots: ActiveAmmo[][] = [];
  ammoSize: Float32Array[] = [];
  ammoDamage = new Float32Array(NUM_ENEMY_AMMO_TYPES);
  ammoTex: (Texture | null)[] = [];
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    for (let i = 0; i < NUM_ENEMY_AMMO_TYPES; i++) {
      this.roots[i] = [];
      this.ammoSize[i] = new Float32Array([0.13, 0.13]);
      this.ammoDamage[i] = 510.0;
    }
    this.loadTextures();
    const set = (i: number, d: number, x: number, y: number) => { this.ammoDamage[i] = d; this.ammoSize[i][0] = x; this.ammoSize[i][1] = y; };
    set(0, 75.0, 0.25, 0.55);
    set(1, 6.0, 0.225, 0.225);
    set(2, 100.0, 0.45, 0.45);
    set(3, 20.0, 0.3, 0.5);
    set(4, 8.5, 0.12, 0.5);
  }

  loadTextures(): void {
    for (let i = 0; i < NUM_ENEMY_AMMO_TYPES; i++) this.ammoTex[i] = this.game.images.load(`enemyAmmo0${i}.png`);
  }

  clear(): void {
    for (let i = 0; i < NUM_ENEMY_AMMO_TYPES; i++) this.roots[i] = [];
  }

  addAmmo(type: number, pos: ArrayLike<number>, vel: ArrayLike<number>): void {
    if (type >= 0 && type < NUM_ENEMY_AMMO_TYPES) {
      const s = this.game.speedAdj;
      const v = [f(vel[0] * s), f(vel[1] * s), f(vel[2] * s)];
      const a = new ActiveAmmo();
      a.init(pos, v, this.ammoDamage[type]);
      this.roots[type].unshift(a);
    }
  }

  updateAmmo(): void {
    const bx = this.game.config.screenBoundX(), by = this.game.config.screenBoundY();
    for (let i = 0; i < NUM_ENEMY_AMMO_TYPES; i++) {
      const list = this.roots[i];
      for (let k = 0; k < list.length;) {
        const a = list[k];
        if (a.pos[0] > bx || a.pos[0] < -bx || a.pos[1] > by || a.pos[1] < -by) list.splice(k, 1);
        else { a.updatePos(); k++; }
      }
    }
  }

  checkForHits(hero: HeroAircraft): void {
    const minDist = f(f(hero.getSize(0) + hero.getSize(1)) * 0.5);
    if (!hero.isVisible()) return;
    for (let i = 0; i < NUM_ENEMY_AMMO_TYPES; i++) {
      const list = this.roots[i];
      for (let k = 0; k < list.length;) {
        const a = list[k];
        const p = a.pos;
        const dist = f(Math.abs(f(p[0] - hero.pos[0])) + Math.abs(f(p[1] - hero.pos[1])));
        if (dist < minDist) {
          hero.ammoDamage(this.ammoDamage[i], a.vel);
          let explo = this.game.explosions.addExplo(X.EnemyAmmo00 + i, a.pos);
          if (i > 1) explo = this.game.explosions.addExplo(X.EnemyAmmo00 + i, a.pos, -5);
          else if (explo) explo.vel[1] = -0.1;
          list.splice(k, 1);
        } else k++;
      }
    }
  }

  drawGL(): void {
    const gl = this.game.gl;
    for (let i = 0; i < NUM_ENEMY_AMMO_TYPES; i++) {
      gl.color4f(1.0, 1.0, 1.0, 1.0);
      gl.bindTexture(this.ammoTex[i]);
      gl.begin(GL_QUADS);
      const sx = this.ammoSize[i][0], sy = this.ammoSize[i][1];
      for (const a of this.roots[i]) {
        const p = a.pos;
        const x0 = f(p[0] - sx), x1 = f(p[0] + sx), y0 = f(p[1] + sy), y1 = f(p[1] - sy);
        // the four orientations of the texture: [s,t] of the corners top-left, bottom-left, bottom-right, top-right
        const c = TEX_TURNS[this.game.rand.I % 4];
        gl.texCoord2f(c[0], c[1]); gl.vertex3f(x0, y0, p[2]);
        gl.texCoord2f(c[2], c[3]); gl.vertex3f(x0, y1, p[2]);
        gl.texCoord2f(c[4], c[5]); gl.vertex3f(x1, y1, p[2]);
        gl.texCoord2f(c[6], c[7]); gl.vertex3f(x1, y0, p[2]);
      }
      gl.end();
    }
  }
}

const TEX_TURNS = [
  [0, 0, 0, 1, 1, 1, 1, 0],
  [1, 0, 1, 1, 0, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 1, 1],
  [1, 1, 1, 0, 0, 0, 0, 1],
];
