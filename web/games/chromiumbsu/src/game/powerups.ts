// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/PowerUps.cpp.
import { sin } from '../libm.ts';
import { GL_CLAMP, GL_LINEAR, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_QUADS, GL_SRC_ALPHA, IMG_BLEND3, IMG_NOMIPMAPS, type Texture } from '../gl.ts';
import { ScreenItem, ItemPowerUp } from './item.ts';
import { Game, type Global } from './global.ts';

const f = Math.fround;

export const Shields = 0, SuperShields = 1, Repair = 2, HeroAmmo00 = 3, HeroAmmo01 = 4, HeroAmmo02 = 5, NumPowerUps = 6;
const WOBBLE_0 = 45, WOBBLE_1 = 75;

export class PowerUp extends ScreenItem {
  type: number;
  power: number;
  constructor(t: number, p: ArrayLike<number>, pwr = 1.0, v: ArrayLike<number> | null = null) {
    super(ItemPowerUp);
    this.type = t;
    this.power = f(pwr);
    this.age = 0;
    this.pos[0] = p[0]; this.pos[1] = p[1]; this.pos[2] = p[2];
    if (v) { this.vel[0] = v[0]; this.vel[1] = v[1]; this.vel[2] = v[2]; }
  }
}

export class PowerUps {
  /** pwrUpRoot->next ...: newest first */
  list: PowerUp[] = [];
  pwrUpSize: Float32Array[] = [];
  pwrUpColor: Float32Array[] = [];
  tex: (Texture | null)[] = [];
  pwrTex: Texture | null = null;
  speed: number;
  wobble0 = new Float32Array(WOBBLE_0);
  wobble1 = new Float32Array(WOBBLE_1);
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    for (let i = 0; i < NumPowerUps; i++) {
      this.pwrUpSize[i] = new Float32Array([0.6, 0.6]);
      this.tex[i] = null;
    }
    this.speed = f(game.scrollSpeed * 0.8);
    this.loadTextures();
    this.pwrUpColor[Shields] = new Float32Array([0.5, 0.7, 1.0, 1.0]);
    this.pwrUpColor[SuperShields] = new Float32Array([1.0, 0.6, 0.0, 1.0]);
    this.pwrUpColor[Repair] = new Float32Array([1.0, 0.1, 0.0, 1.0]);
    this.pwrUpColor[HeroAmmo00] = new Float32Array([1.0, 0.8, 0.5, 0.8]);
    this.pwrUpColor[HeroAmmo01] = new Float32Array([0.0, 1.0, 0.5, 0.8]);
    this.pwrUpColor[HeroAmmo02] = new Float32Array([0.4, 0.2, 1.0, 1.0]);
    const twoPi = 2.0 * Math.PI;
    for (let i = 0; i < WOBBLE_0; i++) this.wobble0[i] = 0.1 * sin(twoPi * (i / WOBBLE_0));
    for (let i = 0; i < WOBBLE_1; i++) this.wobble1[i] = 0.3 * sin(twoPi * (i / WOBBLE_1));
  }

  loadTextures(): void {
    const img = this.game.images;
    this.pwrTex = img.load('powerUpTex.png', IMG_NOMIPMAPS, IMG_BLEND3, GL_CLAMP, GL_LINEAR, GL_LINEAR);
    this.tex[Shields] = img.load('powerUpShield.png');
    this.tex[SuperShields] = this.tex[Shields];
    this.tex[Repair] = this.tex[Shields];
    this.tex[HeroAmmo00] = img.load('powerUpAmmo.png');
    this.tex[HeroAmmo01] = this.tex[HeroAmmo00];
    this.tex[HeroAmmo02] = this.tex[HeroAmmo00];
  }

  clear(): void {
    this.list = [];
  }

  remove(p: PowerUp): void {
    const k = this.list.indexOf(p);
    if (k >= 0) this.list.splice(k, 1);
  }

  addPowerUp(p: PowerUp): void {
    this.list.unshift(p);
  }

  update(): void {
    const g = this.game;
    const S = g.speedAdj;
    for (let k = 0; k < this.list.length;) {
      const p = this.list[k];
      p.age++;
      p.pos[1] += f(this.speed * S);
      if (p.vel[0] || p.vel[1]) {
        const s = f((1.0 - S) + S * 0.982);
        p.vel[0] *= s;
        p.vel[1] *= s;
        p.pos[0] += p.vel[0];
        p.pos[1] += p.vel[1];
        if (p.vel[0] < 0.01) p.vel[0] = 0.0;
        if (p.vel[1] < 0.01) p.vel[1] = 0.0;
      }
      const b = f(g.config.screenBoundX() - 1.0);
      if (p.pos[0] < -b) p.pos[0] = -b;
      if (p.pos[0] > b) p.pos[0] = b;
      if (p.pos[1] < -12) {
        if (g.gameMode === Game) {
          switch (p.type) {
            case SuperShields:
              g.hero.addLife();
              g.hero.addScore(2500.0);
              break;
            case Shields:
            case Repair:
              g.hero.addScore(10000.0);
              break;
            default:
              g.hero.addScore(2500.0);
              break;
          }
        }
        this.list.splice(k, 1);
      } else k++;
    }
  }

  drawGL(): void {
    const g = this.game;
    const gl = g.gl;
    for (const p of this.list) {
      const sz = this.pwrUpSize[p.type];
      const szp = f(sz[0] * 2.5);
      const c = this.pwrUpColor[p.type];
      gl.color4f(c[0], c[1], c[2], c[3]);
      gl.bindTexture(this.pwrTex);
      gl.pushMatrix();
      gl.translatef(p.pos[0] + this.wobble0[p.age % WOBBLE_0], p.pos[1] + this.wobble1[p.age % WOBBLE_1], p.pos[2]);
      gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
      gl.begin(GL_QUADS);
      gl.texCoord2f(0.0, 0.0); gl.vertex3f(-szp, szp, 0.0);
      gl.texCoord2f(0.0, 1.0); gl.vertex3f(-szp, -szp, 0.0);
      gl.texCoord2f(1.0, 1.0); gl.vertex3f(szp, -szp, 0.0);
      gl.texCoord2f(1.0, 0.0); gl.vertex3f(szp, szp, 0.0);
      gl.end();
      gl.popMatrix();
    }
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    for (const p of this.list) {
      const sz = this.pwrUpSize[p.type];
      gl.color4f(1.0, 1.0, 1.0, 1.0);
      gl.bindTexture(this.tex[p.type]);
      gl.pushMatrix();
      gl.translatef(p.pos[0] + this.wobble0[p.age % WOBBLE_0], p.pos[1] + this.wobble1[p.age % WOBBLE_1], p.pos[2]);
      gl.begin(GL_QUADS);
      gl.texCoord2f(0.0, 0.0); gl.vertex3f(-sz[0], sz[1], 0.0);
      gl.texCoord2f(0.0, 1.0); gl.vertex3f(-sz[0], -sz[1], 0.0);
      gl.texCoord2f(1.0, 1.0); gl.vertex3f(sz[0], -sz[1], 0.0);
      gl.texCoord2f(1.0, 0.0); gl.vertex3f(sz[0], sz[1], 0.0);
      gl.end();
      gl.popMatrix();
    }
    gl.blendFunc(GL_SRC_ALPHA, GL_ONE);
  }
}
