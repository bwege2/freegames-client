// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/Explosions.cpp.
// Floats are C floats: every value the original keeps in a float is rounded with Math.fround (f) or
// lives in a Float32Array; arithmetic the original does in double stays double.
import { GL_CLAMP, GL_LINEAR, GL_NEAREST, GL_QUADS, GL_REPEAT, IMG_ALPHA, IMG_BLEND3, IMG_NOMIPMAPS, type Texture } from '../gl.ts';
import type { Global } from './global.ts';

const f = Math.fround;

export const EnemyDestroyed = 0, EnemyDamage = 1, EnemyAmmo00 = 2, EnemyAmmo01 = 3, EnemyAmmo02 = 4,
  EnemyAmmo03 = 5, EnemyAmmo04 = 6, HeroDestroyed = 7, HeroDamage = 8, HeroAmmo00 = 9, HeroAmmo01 = 10,
  HeroAmmo02 = 11, HeroShields = 12, PowerBurst = 13, AddLife = 14, LoseLife = 15, ScoreLife = 16,
  Electric = 17, Glitter = 18, NumExploTypes = 19;

export class Explo {
  pos = new Float32Array(3);
  vel = new Float32Array(3);
  clr = new Float32Array(4);
  age = 0;
  size = 1;

  private readonly game: Global;
  constructor(game: Global) { this.game = game; }

  /** Explo::init(p, a, s) */
  init(p: ArrayLike<number>, a = 0, s = 1.0): void {
    this.pos[0] = p[0]; this.pos[1] = p[1]; this.pos[2] = p[2];
    this.vel.fill(0);
    this.clr.fill(1);
    this.age = Math.trunc(f(a / this.game.speedAdj));
    this.size = f(s);
  }

  /** Explo::init(p, v, c, a, s) */
  initV(p: ArrayLike<number>, v: ArrayLike<number>, c: ArrayLike<number>, a = 0, s = 1.0): void {
    this.pos[0] = p[0]; this.pos[1] = p[1]; this.pos[2] = p[2];
    this.vel[0] = v[0]; this.vel[1] = v[1]; this.vel[2] = v[2];
    this.clr[0] = c[0]; this.clr[1] = c[1]; this.clr[2] = c[2]; this.clr[3] = c[3];
    this.age = Math.trunc(f(a / this.game.speedAdj));
    this.size = f(s);
  }
}

export class Explosions {
  /** the lists, newest first (exploRoot[t]->next...) */
  roots: Explo[][] = [];
  private pool: Explo[] = [];
  tex: (Texture | null)[] = [];
  exploSize: Float32Array[] = [];
  exploStay = new Float32Array(NumExploTypes);
  /** [0] = count, [1] = base, [2] = flag */
  exploPause: Float32Array[] = [];

  private readonly game: Global;
  constructor(game: Global) {
    this.game = game;
    for (let i = 0; i < NumExploTypes; i++) {
      this.tex[i] = null;
      this.roots[i] = [];
      this.exploSize[i] = new Float32Array([0.5, 0.5]);
      this.exploStay[i] = 20.0;
      this.exploPause[i] = new Float32Array(3);
    }
    this.loadTextures();
    const size = (t: number, x: number, y: number) => { this.exploSize[t][0] = x; this.exploSize[t][1] = y; };
    size(EnemyDestroyed, 1.35, 1.35); this.exploStay[EnemyDestroyed] = 30.0;
    size(EnemyDamage, 1.0, 1.0); this.exploStay[EnemyDamage] = 20.0; this.exploPause[EnemyDamage][1] = 3;
    size(EnemyAmmo00, 1.5, 1.5); this.exploStay[EnemyAmmo00] = 15.0; this.exploPause[EnemyAmmo00][1] = 1;
    size(EnemyAmmo01, 0.5, 0.5); this.exploStay[EnemyAmmo01] = 10.0; this.exploPause[EnemyAmmo01][1] = 3;
    size(EnemyAmmo02, 1.7, 1.7); this.exploStay[EnemyAmmo02] = 10.0; this.exploPause[EnemyAmmo02][1] = 2;
    size(EnemyAmmo03, 1.7, 1.7); this.exploStay[EnemyAmmo03] = 10.0; this.exploPause[EnemyAmmo03][1] = 2;
    size(EnemyAmmo04, 2.0, 1.5); this.exploStay[EnemyAmmo04] = 10.0; this.exploPause[EnemyAmmo04][1] = 5;
    size(HeroDestroyed, 1.5, 1.5); this.exploStay[HeroDestroyed] = 25.0;
    size(HeroDamage, 1.1, 1.1); this.exploStay[HeroDamage] = 25.0; this.exploPause[HeroDamage][1] = 3;
    size(HeroAmmo00, 0.25, 0.25); this.exploStay[HeroAmmo00] = 10.0;
    size(HeroAmmo01, 0.5, 1.0); this.exploStay[HeroAmmo01] = 15.0; this.exploPause[HeroAmmo01][1] = 1;
    size(HeroAmmo02, 0.9, 1.0); this.exploStay[HeroAmmo02] = 23.0;
    size(HeroShields, 1.6, 1.6); this.exploStay[HeroShields] = 25.0; this.exploPause[HeroShields][1] = 5;
    size(PowerBurst, 1.8, 1.8); this.exploStay[PowerBurst] = 35.0;
    size(AddLife, 2.5, 2.5); this.exploStay[AddLife] = 25.0;
    size(LoseLife, 3.5, 3.5); this.exploStay[LoseLife] = 35.0;
    size(ScoreLife, 3.5, 3.5); this.exploStay[ScoreLife] = 35.0;
    size(Electric, 1.7, 0.5); this.exploStay[Electric] = 43.0; this.exploPause[Electric][1] = 0;
    size(Glitter, 0.8, 1.0); this.exploStay[Glitter] = 20.0; this.exploPause[Glitter][1] = 0;
  }

  loadTextures(): void {
    const img = this.game.images;
    this.tex[EnemyDestroyed] = img.load('enemyExplo.png', IMG_NOMIPMAPS, IMG_ALPHA, GL_CLAMP, GL_NEAREST, GL_LINEAR);
    this.tex[EnemyDamage] = this.tex[EnemyDestroyed];
    this.tex[EnemyAmmo00] = img.load('enemyAmmoExplo00.png');
    this.tex[EnemyAmmo01] = img.load('enemyAmmoExplo01.png', IMG_NOMIPMAPS, IMG_ALPHA, GL_CLAMP, GL_NEAREST, GL_LINEAR);
    this.tex[EnemyAmmo02] = img.load('enemyAmmoExplo02.png');
    this.tex[EnemyAmmo03] = img.load('enemyAmmoExplo03.png');
    this.tex[EnemyAmmo04] = img.load('enemyAmmoExplo04.png');
    this.tex[HeroDestroyed] = img.load('enemyExplo.png', IMG_NOMIPMAPS, IMG_ALPHA, GL_CLAMP, GL_NEAREST, GL_LINEAR);
    this.tex[HeroDamage] = this.tex[HeroDestroyed];
    this.tex[HeroAmmo00] = img.load('heroAmmoExplo00.png', IMG_NOMIPMAPS, IMG_ALPHA, GL_CLAMP, GL_NEAREST, GL_NEAREST);
    this.tex[HeroAmmo01] = img.load('heroAmmoExplo01.png', IMG_NOMIPMAPS, IMG_ALPHA, GL_CLAMP, GL_NEAREST, GL_LINEAR);
    this.tex[HeroAmmo02] = img.load('heroAmmoExplo02.png', IMG_NOMIPMAPS, IMG_ALPHA, GL_CLAMP, GL_NEAREST, GL_LINEAR);
    this.tex[HeroShields] = img.load('heroShields.png', IMG_NOMIPMAPS, IMG_BLEND3, GL_CLAMP, GL_LINEAR, GL_LINEAR);
    this.tex[PowerBurst] = img.load('powerUpTex.png', IMG_NOMIPMAPS, IMG_BLEND3, GL_CLAMP, GL_LINEAR, GL_LINEAR);
    this.tex[AddLife] = img.load('life.png');
    this.tex[LoseLife] = this.tex[AddLife];
    this.tex[ScoreLife] = this.tex[AddLife];
    this.tex[Electric] = img.load('electric.png', IMG_NOMIPMAPS, IMG_BLEND3, GL_REPEAT, GL_LINEAR, GL_LINEAR);
    this.tex[Glitter] = img.load('glitter.png');
  }

  /** moves every explosion into the pool */
  clear(): void {
    for (let i = 0; i < NumExploTypes; i++) {
      for (const e of this.roots[i]) this.pool.unshift(e);
      this.roots[i] = [];
    }
  }

  private getNewExplo(): Explo {
    return this.pool.shift() ?? new Explo(this.game);
  }

  addExplo(t: number, p: ArrayLike<number>, a = 0, s = 1.0): Explo | null {
    let n: Explo | null = null;
    if (this.exploPause[t][0] <= 0) {
      this.exploPause[t][2] = 1;
      n = this.getNewExplo();
      n.init(p, a, s);
      this.roots[t].unshift(n);
    }
    return n;
  }

  addElectric(p: ArrayLike<number>, v: ArrayLike<number>, clr: ArrayLike<number>, age = 0, size = 1.0): Explo {
    this.exploPause[Electric][2] = 1;
    const n = this.getNewExplo();
    n.initV(p, v, clr, age, size);
    this.roots[Electric].unshift(n);
    return n;
  }

  addGlitter(p: ArrayLike<number>, v: ArrayLike<number>, clr: ArrayLike<number>, age = 0, size = 1.0): Explo {
    this.exploPause[Glitter][2] = 1;
    const n = this.getNewExplo();
    n.initV(p, v, clr, age, size);
    this.roots[Glitter].unshift(n);
    return n;
  }

  update(): void {
    const speedAdj = this.game.speedAdj;
    for (let i = 0; i < NumExploTypes; i++) {
      const pause = this.exploPause[i];
      if (pause[0] > 0.0) pause[0] -= speedAdj;
      else pause[0] = 0.0;
      if (pause[2]) {
        pause[0] = pause[1];
        pause[2] = 0.0;
      }
      const list = this.roots[i];
      for (let k = 0; k < list.length;) {
        const e = list[k];
        e.age++;
        if (e.age > 0) {
          e.pos[0] += f(e.vel[0] * speedAdj);
          e.pos[1] += f(e.vel[1] * speedAdj);
          e.pos[2] += f(e.vel[2] * speedAdj);
        }
        if (e.age > f(this.exploStay[i] / speedAdj)) {
          list.splice(k, 1);
          this.pool.unshift(e);
        } else k++;
      }
    }
  }

  drawGL(): void {
    const r = this.roots;
    if (r[EnemyDestroyed].length) this.drawExplo(EnemyDestroyed);
    if (r[EnemyDamage].length) this.drawExplo(EnemyDamage);
    if (r[EnemyAmmo00].length) this.drawAmmo(EnemyAmmo00);
    if (r[EnemyAmmo01].length) this.drawAmmo(EnemyAmmo01);
    if (r[EnemyAmmo02].length) this.drawAmmo(EnemyAmmo02);
    if (r[EnemyAmmo03].length) this.drawAmmo(EnemyAmmo03);
    if (r[EnemyAmmo04].length) this.drawAmmo(EnemyAmmo04);
    if (r[HeroDestroyed].length) this.drawExplo(HeroDestroyed);
    if (r[HeroDamage].length) this.drawExplo(HeroDamage);
    if (r[HeroAmmo00].length) this.drawAmmo(HeroAmmo00);
    if (r[HeroAmmo01].length) this.drawAmmo(HeroAmmo01);
    if (r[HeroAmmo02].length) this.drawAmmo(HeroAmmo02);
    if (r[HeroShields].length) this.drawShields(HeroShields);
    if (r[PowerBurst].length) this.drawBurst(PowerBurst);
    if (r[AddLife].length) this.drawLife(AddLife);
    if (r[LoseLife].length) this.drawLife(LoseLife);
    if (r[ScoreLife].length) this.drawLife(ScoreLife);
    if (r[Electric].length) this.drawElectric(Electric);
    if (r[Glitter].length) this.drawGlitter(Glitter);
  }

  private drawExplo(type: number): void {
    const gl = this.game.gl;
    gl.color4f(1.0, 1.0, 1.0, 1.0);
    gl.bindTexture(this.tex[type]);
    gl.begin(GL_QUADS);
    for (const e of this.roots[type]) {
      const age = f(e.age * this.game.speedAdj);
      if (age >= 0) {
        let clr = f(age / this.exploStay[type]);
        const ex = f(f(e.size * this.exploSize[type][0]) * clr);
        const ey = f(f(e.size * this.exploSize[type][1]) * clr);
        const exs = f(ex * 0.7);
        const eys = f(ey * 0.7);
        clr = f(1.2 - clr);
        const tmp = f(0.5 + clr * 0.5);
        gl.color4f(tmp, tmp, tmp, clr);
        const p = type === HeroDamage ? this.game.hero.pos : e.pos;
        let xoff: number, yoff: number;
        if (type === EnemyDestroyed) {
          xoff = f(0.1); yoff = f(0.3);
          quad(gl, f(f(p[0] - exs) + xoff), f(f(p[0] + exs) + xoff), f(f(p[1] + eys) + yoff), f(f(p[1] - eys) + yoff), p[2], true);
          xoff = f(-0.2); yoff = f(-0.4);
          quad(gl, f(f(p[0] - exs) + xoff), f(f(p[0] + exs) + xoff), f(f(p[1] + eys) + yoff), f(f(p[1] - eys) + yoff), p[2], true);
        }
        xoff = 0.0; yoff = f(-0.3);
        quad(gl, f(f(p[0] - ex) + xoff), f(f(p[0] + ex) + xoff), f(f(p[1] + ey) + yoff), f(f(p[1] - ey) + yoff), p[2], true);
      }
    }
    gl.end();
  }

  private drawAmmo(type: number): void {
    const gl = this.game.gl;
    gl.bindTexture(this.tex[type]);
    gl.begin(GL_QUADS);
    const stay = this.exploStay[type];
    for (const e of this.roots[type]) {
      const age = f(e.age * this.game.speedAdj);
      const ex = f(this.exploSize[type][0] * f(f(age + 5.0) / f(stay + 5.0)));
      const ey = f(this.exploSize[type][1] * f(f(age + 5.0) / f(stay + 5.0)));
      let clr = f(age / stay);
      if ((clr = f(1.2 - clr)) > 1.0) clr = 1.0;
      gl.color4f(1.0, 1.0, 1.0, clr);
      const pos = e.pos;
      quad(gl, f(pos[0] - ex), f(pos[0] + ex), f(pos[1] + ey), f(pos[1] - ey), pos[2], false);
    }
    gl.end();
  }

  private drawBurst(type: number): void {
    const gl = this.game.gl;
    gl.bindTexture(this.tex[type]);
    for (const e of this.roots[type]) {
      const age = f(e.age * this.game.speedAdj);
      const tmp = f(1.0 - f(age / this.exploStay[type]));
      let clr = tmp;
      const ex = f(f(e.size * this.exploSize[type][0]) * clr);
      const ey = f(f(e.size * this.exploSize[type][1]) * clr);
      clr = f(tmp * 0.75);
      gl.color4f(clr + 0.5, clr + 0.2, clr + 0.1, clr);
      gl.pushMatrix();
      gl.translatef(e.pos[0], e.pos[1], e.pos[2]);
      gl.rotatef(this.game.rand.I, 0.0, 0.0, 1.0);
      centered(gl, ex, ey);
      gl.rotatef(this.game.rand.I, 0.0, 0.0, 1.0);
      centered(gl, ex, ey);
      gl.popMatrix();
    }
  }

  private drawShields(type: number): void {
    const gl = this.game.gl;
    if (!this.game.hero.isVisible()) return;
    gl.bindTexture(this.tex[type]);
    for (const e of this.roots[type]) {
      const age = f(e.age * this.game.speedAdj);
      let tmp = f(age / this.exploStay[type]);
      const clr = f(1.0 - tmp);
      tmp = f(0.5 + clr * 0.5);
      const ex = f(this.exploSize[type][0] * tmp);
      const ey = f(this.exploSize[type][1] * tmp);
      gl.color4f(clr, clr, 1.0, clr * 0.7);
      const pos = this.game.hero.pos;
      gl.pushMatrix();
      gl.translatef(pos[0], pos[1], pos[2]);
      gl.rotatef(this.game.rand.I, 0.0, 0.0, 1.0);
      centered(gl, ex, ey);
      gl.popMatrix();
    }
  }

  private drawLife(type: number): void {
    const gl = this.game.gl;
    const clr = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    gl.bindTexture(this.tex[type]);
    gl.begin(GL_QUADS);
    for (const e of this.roots[type]) {
      const age = f(e.age * this.game.speedAdj);
      if (age >= 0) {
        const p = e.pos;
        let tmp = f(age / this.exploStay[type]);
        if (type === AddLife) {
          clr[0] = clr[1] = tmp;
          clr[2] = 1.0;
          clr[3] = tmp + 0.2;
          tmp = f(1.0 - tmp);
        } else if (type === LoseLife) {
          clr[0] = 1.0;
          clr[1] = clr[2] = 0.1;
          clr[3] = 1.0 - tmp;
        } else {
          clr[0] = clr[1] = clr[2] = 1.0;
          clr[3] = 1.0 - tmp;
        }
        const ex = f(f(e.size * this.exploSize[type][0]) * tmp);
        const ey = f(f(e.size * this.exploSize[type][1]) * tmp);
        gl.color4f(clr[0], clr[1], clr[2], clr[3]);
        quad(gl, f(p[0] - ex), f(p[0] + ex), f(p[1] + ey), f(p[1] - ey), p[2], true);
      }
    }
    gl.end();
  }

  private drawElectric(type: number): void {
    const gl = this.game.gl;
    gl.bindTexture(this.tex[type]);
    for (const e of this.roots[type]) {
      const age = f(e.age * this.game.speedAdj);
      if (age >= 0) {
        let tmp = f(age / this.exploStay[type]);
        let alpha = f(1.0 - tmp);
        alpha = f(5.0 * f(alpha * alpha));
        const clr = e.clr;
        gl.color4f(clr[0], clr[1], clr[2], f(clr[3] * alpha));
        const ex = this.exploSize[type][0];
        const ey = f(this.exploSize[type][1] * tmp);
        tmp = f((1.0 - this.game.speedAdj) + this.game.speedAdj * 1.075);
        e.vel[0] *= tmp;
        e.vel[1] *= tmp;
        e.vel[2] *= tmp;
        const pos = e.pos;
        const tOff = this.game.rand.F;
        gl.pushMatrix();
        gl.translatef(pos[0], pos[1], pos[2]);
        gl.begin(GL_QUADS);
        gl.texCoord2f(0.0, 0.0 + tOff); gl.vertex3f(-ex, ey, 0.0);
        gl.texCoord2f(0.0, 0.2 + tOff); gl.vertex3f(-ex, -ey, 0.0);
        gl.texCoord2f(1.0, 0.2 + tOff); gl.vertex3f(ex, -ey, 0.0);
        gl.texCoord2f(1.0, 0.0 + tOff); gl.vertex3f(ex, ey, 0.0);
        gl.end();
        gl.popMatrix();
      }
    }
  }

  private drawGlitter(type: number): void {
    const gl = this.game.gl;
    gl.bindTexture(this.tex[type]);
    for (const e of this.roots[type]) {
      const age = f(e.age * this.game.speedAdj);
      if (age >= 0) {
        let tmp = f(age / this.exploStay[type]);
        const alpha = f(1.0 - tmp);
        const clr = e.clr;
        gl.color4f(clr[0], clr[1], clr[2], f(clr[3] * alpha));
        tmp = f(alpha * alpha);
        const ex = f(f(tmp * e.size) * this.exploSize[type][0]);
        const ey = f(f(f(tmp * e.size) * this.exploSize[type][1]) + 0.02 * age);
        const pos = e.pos;
        gl.pushMatrix();
        gl.translatef(pos[0], pos[1], pos[2]);
        centered(gl, ex, ey);
        gl.popMatrix();
      }
    }
  }
}

/** the GL_QUADS corners of drawExplo/drawLife (tex t flipped: 1 at the top) or drawAmmo (0 at the top) */
function quad(gl: Global['gl'], x0: number, x1: number, yTop: number, yBot: number, z: number, flip: boolean): void {
  const t0 = flip ? 1.0 : 0.0, t1 = flip ? 0.0 : 1.0;
  gl.texCoord2f(0.0, t0); gl.vertex3f(x0, yTop, z);
  gl.texCoord2f(0.0, t1); gl.vertex3f(x0, yBot, z);
  gl.texCoord2f(1.0, t1); gl.vertex3f(x1, yBot, z);
  gl.texCoord2f(1.0, t0); gl.vertex3f(x1, yTop, z);
}

/** a GL_QUADS square around the origin, tex t 0 at the top */
function centered(gl: Global['gl'], ex: number, ey: number): void {
  gl.begin(GL_QUADS);
  gl.texCoord2f(0.0, 0.0); gl.vertex3f(-ex, ey, 0.0);
  gl.texCoord2f(0.0, 1.0); gl.vertex3f(-ex, -ey, 0.0);
  gl.texCoord2f(1.0, 1.0); gl.vertex3f(ex, -ey, 0.0);
  gl.texCoord2f(1.0, 0.0); gl.vertex3f(ex, ey, 0.0);
  gl.end();
}
