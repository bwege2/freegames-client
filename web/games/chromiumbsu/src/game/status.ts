// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/StatusDisplay.cpp: score, lives,
// ammunition, shield and damage gauges, gun flashes, super shields and the tips.
import { cos, sin } from '../libm.ts';
import {
  GL_CLAMP_TO_EDGE, GL_LINEAR, GL_LINEAR_MIPMAP_LINEAR, GL_NEAREST, GL_QUADS, GL_REPEAT,
  IMG_ALPHA, IMG_BLEND1, IMG_BLEND2, IMG_NOMIPMAPS, IMG_SIMPLEMIPMAPS, type Texture,
} from '../gl.ts';
import { NUM_HERO_AMMO_TYPES } from './ammo.ts';
import { drawQuad } from './enemies.ts';
import { HERO_DAMAGE, HERO_SHIELDS, NUM_HERO_ITEMS, type HeroAircraft } from './hero.ts';
import type { Global } from './global.ts';

const f = Math.fround;

const statPosAmmo = new Float32Array([-10.5, 8.00, 25.0]);
const statPosShld = new Float32Array([-10.4, -7.80, 25.0]);
const statClrWarn = new Float32Array([1.1, 0.6, 0.1, 1.1]);
const statClrZero = new Float32Array([0.0, 0.0, 0.0, 0.0]);
const statClrAmmo = [
  new Float32Array([1.0, 0.7, 0.5, 0.6]),
  new Float32Array([0.0, 1.0, 0.5, 0.7]),
  new Float32Array([0.3, 0.0, 1.0, 0.7]),
];

export class StatusDisplay {
  statTex: Texture | null = null;
  shldTex: Texture | null = null;
  topTex: Texture | null = null;
  heroSuperTex: Texture | null = null;
  heroShieldTex: Texture | null = null;
  heroAmmoFlash: (Texture | null)[] = [];
  useFocus: Texture | null = null;
  useItem: (Texture | null)[] = [];
  ammoAlpha = 0;
  damageAlpha = 0;
  shieldAlpha = 0;
  blink = true;
  tipShipShow = 0;
  tipSuperShow = 0;
  enemyWarn = 0;
  /** the function's static rot */
  private rot = 0;
  private readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    this.loadTextures();
  }

  setAmmoAlpha(v: number): void { this.ammoAlpha = f(v); }
  setDamageAlpha(v: number): void { this.damageAlpha = f(v); }
  setShieldAlpha(v: number): void { this.shieldAlpha = f(v); }
  enemyWarning(v: number): void { if (v > this.enemyWarn) this.enemyWarn = v; }

  loadTextures(): void {
    const img = this.game.images;
    const clamp = GL_CLAMP_TO_EDGE;
    this.statTex = img.load('statBar.png', IMG_NOMIPMAPS, IMG_BLEND1, GL_REPEAT, GL_NEAREST, GL_NEAREST);
    this.shldTex = img.load('shields.png', IMG_SIMPLEMIPMAPS, IMG_BLEND1, clamp, GL_LINEAR_MIPMAP_LINEAR, GL_LINEAR);
    this.topTex = img.load('stat-top.png', IMG_NOMIPMAPS, IMG_BLEND1, clamp, GL_LINEAR, GL_NEAREST);
    this.heroSuperTex = img.load('heroSuper.png', IMG_NOMIPMAPS, IMG_ALPHA, clamp, GL_LINEAR, GL_LINEAR);
    this.heroShieldTex = img.load('heroShields.png', IMG_NOMIPMAPS, IMG_BLEND2, clamp, GL_LINEAR, GL_LINEAR);
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) this.heroAmmoFlash[i] = img.load(`heroAmmoFlash0${i}.png`, IMG_NOMIPMAPS, IMG_ALPHA, clamp, GL_LINEAR, GL_LINEAR);
    this.useFocus = img.load('useFocus.png', IMG_NOMIPMAPS, IMG_ALPHA, clamp, GL_LINEAR, GL_LINEAR);
    for (let i = 0; i < NUM_HERO_ITEMS; i++) this.useItem[i] = img.load(`useItem0${i}.png`, IMG_NOMIPMAPS, IMG_ALPHA, clamp, GL_LINEAR, GL_LINEAR);
  }

  darkenGL(): void {
    const gl = this.game.gl;
    gl.bindTexture(this.shldTex);
    gl.begin(GL_QUADS);
    gl.color4f(0.25, 0.2, 0.2, 0.6);
    gl.texCoord2f(0.0, 0.0); gl.vertex3f(-9.2, 8.5, 25.0);
    gl.texCoord2f(1.0, 0.0); gl.vertex3f(-11.5, 8.5, 25.0);
    gl.color4f(0.25, 0.25, 0.35, 0.6);
    gl.texCoord2f(1.0, 1.7); gl.vertex3f(-11.5, -8.5, 25.0);
    gl.texCoord2f(0.0, 1.7); gl.vertex3f(-9.2, -8.5, 25.0);
    gl.color4f(0.25, 0.2, 0.2, 0.6);
    gl.texCoord2f(1.0, 0.0); gl.vertex3f(11.5, 8.5, 25.0);
    gl.texCoord2f(0.0, 0.0); gl.vertex3f(9.2, 8.5, 25.0);
    gl.color4f(0.25, 0.25, 0.35, 0.6);
    gl.texCoord2f(0.0, 1.7); gl.vertex3f(9.2, -8.5, 25.0);
    gl.texCoord2f(1.0, 1.7); gl.vertex3f(11.5, -8.5, 25.0);
    gl.end();
  }

  drawGL(hero: HeroAircraft): void {
    const g = this.game;
    const gl = g.gl;
    const config = g.config;
    const text = g.text;
    let statClrWarnAmmo = false;
    const w = f(0.1);
    let x = 0.0;
    const size = new Float32Array(2);
    if (!(g.frame % 15)) this.blink = !this.blink;
    this.ammoAlpha = f(this.ammoAlpha * 0.96);
    let shields = hero.getShields();
    let superShields = 0.0;
    const damage = hero.getDamage();
    if (shields > HERO_SHIELDS) {
      superShields = f(HERO_SHIELDS - f(shields - HERO_SHIELDS));
      shields = HERO_SHIELDS;
    }
    // score
    gl.color4f(1.0, 1.0, 1.0, 0.4);
    gl.pushMatrix();
    gl.translatef(-9.0, -8.2, 25.0);
    gl.scalef(0.025, 0.02, 1.0);
    text.render(String(Math.trunc(hero.getScore())).padStart(7, '0'));
    gl.popMatrix();
    // fps
    if (config.showFPS()) {
      gl.pushMatrix();
      gl.translatef(7.75, 8.0, 25.0);
      gl.scalef(0.018, 0.015, 1.0);
      text.render(g.fps.toFixed(1).padStart(3, ' '));
      gl.popMatrix();
    }
    // ship lives
    gl.pushMatrix();
    gl.color4f(0.6, 0.6, 0.7, 1.0);
    gl.bindTexture(g.hero.heroTex);
    gl.translatef(10.2, 7.4, 25.0);
    size[0] = g.hero.getSize(0) * 0.5;
    size[1] = g.hero.getSize(1) * 0.5;
    for (let i = 0; i < g.hero.getLives(); i++) {
      drawQuad(gl, size[0], size[1]);
      gl.translatef(0.0, -size[1] * 2.0, 0.0);
    }
    gl.popMatrix();
    // usable items
    if (config.gfxLevel() > 1) {
      gl.pushMatrix();
      gl.color4f(1.0, 1.0, 1.0, 1.0);
      gl.translatef(8.5, -7.7, 25.0);
      size[0] = 0.4;
      size[1] = 0.5;
      for (let i = 0; i < NUM_HERO_ITEMS; i++) {
        if (i === g.hero.currentItem()) {
          const a = f(g.hero.itemArmed() * 0.8);
          gl.color4f(0.4 + a, 0.4, 0.4, 0.4 + a);
          gl.bindTexture(this.useFocus);
          drawQuad(gl, size[1], size[1]);
          gl.color4f(1.0, 1.0, 1.0, 1.0);
        }
        gl.bindTexture(this.useItem[i]);
        drawQuad(gl, size[0], size[0]);
        gl.translatef(-size[1] * 2.0, 0.0, 0.0);
      }
      gl.popMatrix();
    }
    // 'enemy-got-past' warning
    if (this.enemyWarn && g.hero.getLives() >= 0) {
      gl.pushMatrix();
      gl.color4f(1.0, 0.0, 0.0, this.enemyWarn + 0.15 * sin(g.gameFrame * 0.7));
      gl.translatef(0.0, -8.75, 25.0);
      gl.bindTexture(this.heroAmmoFlash[0]);
      drawQuad(gl, 12.0, 3.0);
      gl.popMatrix();
      this.enemyWarn = 0.0;
    }
    // AMMO
    gl.pushMatrix();
    gl.translatef(statPosAmmo[0], statPosAmmo[1], statPosAmmo[2]);
    gl.bindTexture(this.statTex);
    gl.begin(GL_QUADS);
    for (let i = 0; i < NUM_HERO_AMMO_TYPES; i++) {
      const c = statClrAmmo[i];
      gl.color4f(c[0], c[1], c[2], c[3]);
      const ammoStock = hero.getAmmoStock(i);
      if (ammoStock > 0.0) {
        x = f(i * 0.3);
        const y = f(ammoStock * 0.02);
        const y3 = f(y * 2.65);
        if (this.blink || ammoStock > 50.0) gl.color4f(c[0], c[1], c[2], c[3]);
        else {
          statClrWarnAmmo = true;
          gl.color4f(statClrWarn[0], statClrWarn[1], statClrWarn[2], statClrWarn[3]);
        }
        gl.texCoord2f(1.0, 0.00); gl.vertex3f(f(x + w), -y3, 0.0);
        gl.texCoord2f(1.0, y); gl.vertex3f(f(x + w), 0.0, 0.0);
        gl.texCoord2f(0.0, y); gl.vertex3f(f(x - w), 0.0, 0.0);
        gl.texCoord2f(0.0, 0.00); gl.vertex3f(f(x - w), -y3, 0.0);
      }
    }
    gl.end();
    gl.bindTexture(this.topTex);
    if (statClrWarnAmmo) gl.color4f(statClrWarn[0], statClrWarn[1], statClrWarn[2], 0.5 + this.ammoAlpha);
    else gl.color4f(0.5, 0.5, 0.5 + this.ammoAlpha, 0.2 + this.ammoAlpha);
    gl.begin(GL_QUADS);
    gl.texCoord2f(1.0, 1.0); gl.vertex3f(1.25, -1.85, 0.0);
    gl.texCoord2f(1.0, 0.0); gl.vertex3f(1.25, 0.47, 0.0);
    gl.texCoord2f(0.0, 0.0); gl.vertex3f(-0.75, 0.47, 0.0);
    gl.texCoord2f(0.0, 1.0); gl.vertex3f(-0.75, -2.85, 0.0);
    gl.end();
    gl.popMatrix();
    // Shields
    this.damageAlpha = f(this.damageAlpha * 0.94);
    this.shieldAlpha = f(this.shieldAlpha * 0.94);
    const dc = f(this.damageAlpha * 0.5);
    const sc = f(this.shieldAlpha * 0.5);
    let szx = f(0.5);
    let szy = f(6.0);
    this.rot = f(this.rot + 2.0 * g.speedAdj);
    const rot = this.rot;
    const rot2 = 2 * (Math.trunc(rot) % 180);
    let sls: number, dls: number;
    const sl = sls = f(shields / HERO_SHIELDS - 1.0);
    const dl = dls = f(damage / HERO_DAMAGE - 1.0);
    if (superShields) sls = dls = f(f(shields + superShields) / HERO_SHIELDS - 1.0);
    // Engine
    if (hero.isVisible() && config.gfxLevel() >= 1) {
      const c1f = f(1.0 + dl);
      const c2f = f(-dl);
      const c1 = new Float32Array([0.85, 0.65, 1.00, 0.7]);
      const c2 = new Float32Array([1.00, 0.20, 0.25, 0.7]);
      gl.color4f(f(c1[0] * c1f) + f(c2[0] * c2f), f(c1[1] * c1f) + f(c2[1] * c2f), f(c1[2] * c1f) + f(c2[2] * c2f), f(c1[3] * c1f) + f(c2[3] * c2f));
      gl.bindTexture(this.heroAmmoFlash[0]);
      gl.pushMatrix();
      gl.translatef(hero.pos[0], hero.pos[1] - 0.625, hero.pos[2]);
      const esz = f(1.0 + c2f);
      drawQuad(gl, 1.3, f(0.5 * esz));
      gl.translatef(0.0, -0.18, 0.0);
      gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
      drawQuad(gl, f(0.85 * esz), f(0.6 * esz));
      gl.popMatrix();
    }
    // Super Shields
    if (superShields) {
      gl.pushMatrix();
      const sz = f(hero.getSize(1) * 1.3);
      gl.color4f(1.0, 1.0, 1.0, 1.0 - f(sls * sls));
      gl.bindTexture(this.heroSuperTex);
      gl.translatef(hero.pos[0], hero.pos[1], hero.pos[2]);
      gl.rotatef(g.rand.I, 0.0, 0.0, 1.0);
      drawQuad(gl, sz, sz);
      gl.popMatrix();
      // a bit of Glitter...
      if (config.gfxLevel() > 1 && !g.gamePause) {
        const r = g.rand;
        const p = new Float32Array([0.0, 0.0, hero.pos[2]]);
        const v0 = f(0.01 * r.S);
        const v = new Float32Array([v0, 0.0, 0.0]);
        const c3 = f(1.0 - f(sls * sls));
        const c = new Float32Array([1.0, 1.0, 0.7, c3]);
        switch (g.gameFrame % 2) {
          case 0:
            v[1] = -0.3 + r.F * 0.05;
            p[0] = hero.pos[0];
            p[1] = hero.pos[1] - 0.8;
            g.explosions.addGlitter(p, v, c, 0, 0.4 + 0.4 * r.F);
            v[1] = -0.25 + r.F * 0.05;
            p[0] = hero.pos[0] + 0.95;
            p[1] = hero.pos[1] + 0.1;
            g.explosions.addGlitter(p, v, c, 0, 0.4 + 0.4 * r.F);
            p[0] = hero.pos[0] - 0.95;
            p[1] = hero.pos[1] + 0.1;
            g.explosions.addGlitter(p, v, c, 0, 0.4 + 0.4 * r.F);
            break;
          case 1:
            v[1] = -0.25 + r.F * 0.05;
            p[0] = hero.pos[0] + 0.95;
            p[1] = hero.pos[1] + 0.1;
            g.explosions.addGlitter(p, v, c, 0, 0.4 + 0.4 * r.F);
            p[0] = hero.pos[0] - 0.95;
            p[1] = hero.pos[1] + 0.1;
            g.explosions.addGlitter(p, v, c, 0, 0.4 + 0.4 * r.F);
            break;
        }
      }
    }
    // Ammo flash
    if (config.gfxLevel() > 1) {
      gl.pushMatrix();
      gl.translatef(hero.pos[0], hero.pos[1], hero.pos[2]);
      if (hero.gunFlash0[0]) {
        gl.bindTexture(this.heroAmmoFlash[0]);
        szx = hero.gunFlash0[0];
        szy = f(0.46 * szx);
        gl.color4f(0.75, 0.75, 0.75, szx);
        gl.translatef(0.275, 0.25, 0.0);
        drawQuad(gl, szy, szy);
        gl.translatef(-0.550, 0.00, 0.0);
        drawQuad(gl, szy, szy);
        gl.translatef(0.275, -0.25, 0.0);
        if (hero.gunFlash1[0]) {
          gl.translatef(0.45, -0.10, 0.0);
          drawQuad(gl, szy, szy);
          gl.translatef(-0.90, 0.00, 0.0);
          drawQuad(gl, szy, szy);
          gl.translatef(0.45, 0.10, 0.0);
        }
      }
      if (hero.gunFlash0[1]) {
        gl.bindTexture(this.heroAmmoFlash[1]);
        szx = hero.gunFlash0[1];
        szy = f(0.8 * szx);
        gl.color4f(1.0, 1.0, 1.0, szx);
        gl.translatef(0.0, 0.7, 0.0);
        drawQuad(gl, szy, szy);
        gl.translatef(0.0, -0.7, 0.0);
      }
      gl.bindTexture(this.heroAmmoFlash[2]);
      if (hero.gunFlash0[2]) {
        szx = hero.gunFlash0[2];
        szy = f(0.65 * szx);
        gl.color4f(1.0, 1.0, 1.0, szx);
        gl.translatef(-0.65, -0.375, 0.0);
        drawQuad(gl, szy, szy);
        gl.translatef(0.65, 0.375, 0.0);
      }
      if (hero.gunFlash1[2]) {
        szx = hero.gunFlash1[2];
        szy = f(0.65 * szx);
        gl.color4f(1.0, 1.0, 1.0, szx);
        gl.translatef(0.65, -0.375, 0.0);
        drawQuad(gl, szy, szy);
        gl.translatef(-0.65, 0.375, 0.0);
      }
      gl.popMatrix();
    }
    // shield indicator
    const sp = statPosShld;
    gl.bindTexture(this.shldTex);
    gl.color4f(0.2, 0.2, 0.2, 0.5);
    gl.begin(GL_QUADS);
    szx = f(0.6);
    szy = f(6.0);
    gl.texCoord2f(1.0, 1.0); gl.vertex3f(f(sp[0] + szx), f(sp[1] + szy), sp[2]);
    gl.texCoord2f(-2.5, 1.0); gl.vertex3f(sp[0] - 2.0, f(sp[1] + szy), sp[2]);
    gl.texCoord2f(-2.5, 0.0); gl.vertex3f(sp[0] - 2.0, sp[1] + 0.0, sp[2]);
    gl.texCoord2f(1.0, 0.0); gl.vertex3f(f(sp[0] + szx), sp[1] + 0.0, sp[2]);
    gl.texCoord2f(3.5, 1.0); gl.vertex3f(-sp[0] + 2.0, f(sp[1] + szy), sp[2]);
    gl.texCoord2f(0.0, 1.0); gl.vertex3f(f(-sp[0] - szx), f(sp[1] + szy), sp[2]);
    gl.texCoord2f(0.0, 0.0); gl.vertex3f(f(-sp[0] - szx), sp[1] + 0.0, sp[2]);
    gl.texCoord2f(3.5, 0.0); gl.vertex3f(-sp[0] + 2.0, sp[1] + 0.0, sp[2]);
    gl.end();
    if (config.gfxLevel() > 0) {
      // Shields
      if ((sl < -0.7 && this.blink && shields > 0.0) || superShields) gl.color4f(statClrWarn[0], statClrWarn[1], statClrWarn[2], statClrWarn[3]);
      else gl.color4f(0.7 + dc, 0.6 + dc, 0.8 + dc, 0.5 + this.damageAlpha);
      gl.pushMatrix();
      gl.translatef(sp[0], sp[1], sp[2]);
      gl.rotatef(-rot, 0.0, 1.0, 0.0);
      gl.begin(GL_QUADS);
      szx = f(0.5);
      box(gl, szx, szy, sls, false);
      if (shields) {
        gl.texCoord2f(1.0, 1.0);
        gl.color4f(0.3 + sc, 0.4 + sc, 1.0 + sc, 0.5);
        gl.vertex3f(szx, 0.0, szx);
        gl.vertex3f(szx, 0.0, -szx);
        gl.vertex3f(-szx, 0.0, -szx);
        gl.vertex3f(-szx, 0.0, szx);
      }
      gl.end();
      gl.rotatef(rot2, 0.0, 1.0, 0.0);
      gl.color4f(0.1 + sc, 0.15 + sc, 0.9 + sc, 0.6 + this.shieldAlpha);
      gl.begin(GL_QUADS);
      szx = f(0.4);
      box(gl, szx, szy, sl, true);
      gl.end();
      gl.popMatrix();
      if ((dl < -0.7 && this.blink) || superShields) {
        gl.color4f(statClrWarn[0], statClrWarn[1], statClrWarn[2], statClrWarn[3]);
        if (config.texBorder()) gl.texBorderColor(statClrWarn[0], statClrWarn[1], statClrWarn[2], statClrWarn[3]);
      } else {
        gl.color4f(0.9 + dc, 0.6 + dc, 0.7 + dc, 0.5 + this.damageAlpha);
        if (config.texBorder()) gl.texBorderColor(statClrZero[0], statClrZero[1], statClrZero[2], statClrZero[3]);
      }
      // Life
      gl.pushMatrix();
      gl.translatef(-sp[0], sp[1], sp[2]);
      gl.rotatef(rot, 0.0, 1.0, 0.0);
      gl.begin(GL_QUADS);
      szx = f(0.5);
      box(gl, szx, szy, dls, true);
      if (damage) {
        gl.texCoord2f(1.0, 1.0);
        gl.color4f(1.0 + dc, 0.0 + dc, 0.0 + dc, 0.5);
        gl.vertex3f(szx, 0.0, szx);
        gl.vertex3f(szx, 0.0, -szx);
        gl.vertex3f(-szx, 0.0, -szx);
        gl.vertex3f(-szx, 0.0, szx);
      }
      gl.end();
      gl.rotatef(-rot2, 0.0, 1.0, 0.0);
      gl.color4f(1.0 + dc, 0.0 + dc, 0.0 + dc, 0.6 + this.damageAlpha);
      gl.begin(GL_QUADS);
      szx = f(0.4);
      box(gl, szx, szy, dl, true);
      gl.end();
      gl.popMatrix();
    } else {
      szx = f(0.8);
      if ((sl < -0.7 && this.blink && shields > 0.0) || superShields) gl.color4f(statClrWarn[0], statClrWarn[1], statClrWarn[2], statClrWarn[3]);
      else gl.color4f(0.0 + sc, 0.35 + sc, 1.0 + sc, 0.7 + this.shieldAlpha);
      gl.begin(GL_QUADS);
      gl.texCoord2f(1.0, sl); gl.vertex3f(sp[0], f(sp[1] + szy), sp[2]);
      gl.texCoord2f(0.0, sl); gl.vertex3f(f(sp[0] - szx), f(sp[1] + szy), sp[2]);
      gl.texCoord2f(0.0, 1.0 + sl); gl.vertex3f(f(sp[0] - szx), sp[1], sp[2]);
      gl.texCoord2f(1.0, 1.0 + sl); gl.vertex3f(sp[0], sp[1], sp[2]);
      if (dl < -0.7 && this.blink) gl.color4f(statClrWarn[0], statClrWarn[1], statClrWarn[2], statClrWarn[3]);
      else gl.color4f(1.0 + dc, 0.0 + dc, 0.0 + dc, 0.7 + this.damageAlpha);
      gl.texCoord2f(1.0, dl); gl.vertex3f(-sp[0], f(sp[1] + szy), sp[2]);
      gl.texCoord2f(1.0, 1.0 + dl); gl.vertex3f(-sp[0], sp[1], sp[2]);
      gl.texCoord2f(0.0, 1.0 + dl); gl.vertex3f(f(-sp[0] + szx), sp[1], sp[2]);
      gl.texCoord2f(0.0, dl); gl.vertex3f(f(-sp[0] + szx), f(sp[1] + szy), sp[2]);
      gl.end();
    }
    // print message if we're paused...
    if (g.gamePause) {
      const off0 = f(2.0 * sin(g.frame * 0.01));
      const off1 = f(1.0 * cos(g.frame * 0.011));
      gl.pushMatrix();
      gl.translatef(-14.5, -3.0, 0.0);
      gl.scalef(0.21, 0.21, 1.0);
      gl.pushMatrix();
      gl.color4f(1.0, 1.0, 1.0, 0.10 * Math.abs(sin(g.frame * 0.05)));
      text.render(g.tr('p a u s e d'));
      gl.popMatrix();
      gl.color4f(1.0, 1.0, 1.0, 0.10 * Math.abs(sin(g.frame * 0.03)));
      gl.translatef(off0, off1, 0.0);
      text.render(g.tr('p a u s e d'));
      gl.popMatrix();
    }
    if (g.tipShipPast === 1 && g.gameLevel === 1) {
      g.tipShipPast++;
      this.tipShipShow = 200;
    }
    if (g.tipSuperShield === 1 && g.gameLevel === 1) {
      g.tipSuperShield++;
      this.tipSuperShow = 200;
    }
    if (this.tipShipShow > 0) {
      this.tipShipShow--;
      gl.pushMatrix();
      gl.translatef(-16, 13.0, 0.0);
      gl.scalef(0.035, 0.035, 1.0);
      gl.color4f(1.0, 1.0, 1.0, this.tipShipShow / 300.0);
      text.render(g.tr('do not let -any- ships past you! each one costs you a life!'));
      gl.popMatrix();
    }
    if (this.tipSuperShow > 0) {
      this.tipSuperShow--;
      gl.pushMatrix();
      gl.translatef(-16, 13.0, 0.0);
      gl.scalef(0.035, 0.035, 1.0);
      gl.color4f(1.0, 1.0, 1.0, this.tipSuperShow / 300.0);
      text.render(g.tr('let super shields pass by for an extra life!'));
      gl.popMatrix();
    }
  }
}

/**
 * the four sides of a rotating gauge, GL_QUADS, with the texture slid by `l`; `rightOrder` is the
 * corner order of the last side the inner shield bar and both life bars use (the outer shield bar
 * draws it the other way round)
 */
function box(gl: Global['gl'], szx: number, szy: number, l: number, rightOrder: boolean): void {
  const l1 = 1.0 + l;
  gl.texCoord2f(1.0, l); gl.vertex3f(szx, szy, szx);
  gl.texCoord2f(0.0, l); gl.vertex3f(-szx, szy, szx);
  gl.texCoord2f(0.0, l1); gl.vertex3f(-szx, 0.0, szx);
  gl.texCoord2f(1.0, l1); gl.vertex3f(szx, 0.0, szx);
  gl.texCoord2f(0.0, l); gl.vertex3f(szx, szy, -szx);
  gl.texCoord2f(0.0, l1); gl.vertex3f(szx, 0.0, -szx);
  gl.texCoord2f(1.0, l1); gl.vertex3f(-szx, 0.0, -szx);
  gl.texCoord2f(1.0, l); gl.vertex3f(-szx, szy, -szx);
  gl.texCoord2f(1.0, l); gl.vertex3f(szx, szy, szx);
  gl.texCoord2f(1.0, l1); gl.vertex3f(szx, 0.0, szx);
  gl.texCoord2f(0.0, l1); gl.vertex3f(szx, 0.0, -szx);
  gl.texCoord2f(0.0, l); gl.vertex3f(szx, szy, -szx);
  if (rightOrder) {
    gl.texCoord2f(0.0, l); gl.vertex3f(-szx, szy, szx);
    gl.texCoord2f(1.0, l); gl.vertex3f(-szx, szy, -szx);
    gl.texCoord2f(1.0, l1); gl.vertex3f(-szx, 0.0, -szx);
    gl.texCoord2f(0.0, l1); gl.vertex3f(-szx, 0.0, szx);
  } else {
    gl.texCoord2f(1.0, l); gl.vertex3f(-szx, szy, -szx);
    gl.texCoord2f(1.0, l1); gl.vertex3f(-szx, 0.0, -szx);
    gl.texCoord2f(0.0, l1); gl.vertex3f(-szx, 0.0, szx);
    gl.texCoord2f(0.0, l); gl.vertex3f(-szx, szy, szx);
  }
}
