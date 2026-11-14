// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/Ground.cpp, src/GroundMetal.cpp,
// src/GroundSegment.cpp, src/GroundMetalSegment.cpp: the scrolling metal floor. (GroundSea is never
// created by the game.) A segment's position is a double, as in the original.
import { sin } from '../libm.ts';
import { GL_CLAMP_TO_EDGE, GL_LINEAR, GL_REPEAT, GL_TRIANGLES, IMG_ALPHA, IMG_NOMIPMAPS, type Texture } from '../gl.ts';
import { Menu, type Global } from './global.ts';

const f = Math.fround;

class GroundMetalSegment {
  pos: number[];
  size: Float32Array;
  age = 0;
  back: GroundMetalSegment | null = null;
  next: GroundMetalSegment | null = null;
  readonly parent: GroundMetal;
  constructor(p: ArrayLike<number>, s: ArrayLike<number>, parent: GroundMetal) {
    this.parent = parent;
    this.pos = [p[0], p[1], p[2]];
    this.size = new Float32Array([s[0], s[1]]);
  }

  // the static colours of GroundMetalSegment::drawGL, shared by all segments
  static c0 = new Float32Array([0.65, 0.62, 0.53, 1.0]);
  static c1 = new Float32Array([0.79, 0.82, 0.69, 1.0]);
  static r0 = new Float32Array([0.07, 0.07, 0.13, 1.0]);
  static r1 = new Float32Array([0.31, 0.30, 0.30, 1.0]);
  static r2 = new Float32Array([0.31, 0.30, 0.30, 1.0]);

  drawGL(): void {
    const g = this.parent.game;
    const C = GroundMetalSegment;
    let S: number, rep: number, tilt: number;
    let blipMirrorT = false;
    this.age = f(this.age + 1.0);
    let clrSin = f(0.5 * sin(g.gameFrame * 0.001));
    C.r1[0] = 0.15 + clrSin;
    C.r2[0] = 0.15 + clrSin;
    clrSin = f(0.2 * sin(g.gameFrame * 0.0005));
    C.c0[0] = 0.28 + clrSin;
    C.c0[1] = 0.25 + clrSin;
    C.c0[2] = 0.16 + clrSin;
    C.c1[0] = 0.42 + clrSin;
    C.c1[1] = 0.45 + clrSin;
    C.c1[2] = 0.34 + clrSin;
    switch (this.parent.variation) {
      default:
      case 0:
        rep = f(0.26);
        tilt = f(0.1);
        S = f(-g.frame * 0.001);
        blipMirrorT = false;
        break;
      case 1:
        rep = f(0.4);
        tilt = f(0.2);
        S = f(-g.frame * 0.001);
        blipMirrorT = true;
        break;
      case 2: {
        S = f(-g.frame * 0.005);
        const tmp = f(sin(S));
        rep = f(0.7 + tmp);
        tilt = f(0.5 + tmp);
        blipMirrorT = true;
        break;
      }
    }
    if (g.config.gfxLevel() > 1) this.drawBlip(rep, S, tilt, blipMirrorT);
    this.drawSurface(C.c0, C.c1, C.r0, C.r1, C.r2);
  }

  private drawBlip(rep: number, S: number, tilt: number, blipMirrorT: boolean): void {
    const gl = this.parent.game.gl;
    const [px, py, pz] = this.pos;
    const sx = this.size[0], sy = this.size[1];
    let repA = 0.0;
    let repB = rep;
    const tA = () => f(repA + S), tB = () => f(repB + S);
    const tAt = () => f(f(repA + S) + tilt), tBt = () => f(f(repB + S) + tilt);
    gl.color4f(1.0, 1.0, 1.0, 1.0);
    gl.bindTexture(this.parent.tex[Blip]);
    gl.begin(GL_TRIANGLES);
    gl.texCoord2f(rep, tAt()); gl.vertex3f(px, py, pz);
    gl.texCoord2f(0.0, tA()); gl.vertex3f(-sx + px, py, pz);
    gl.texCoord2f(0.0, tB()); gl.vertex3f(-sx + px, -sy + py, pz);
    gl.texCoord2f(rep, tAt()); gl.vertex3f(px, py, pz);
    gl.texCoord2f(0.0, tB()); gl.vertex3f(-sx + px, -sy + py, pz);
    gl.texCoord2f(rep, tBt()); gl.vertex3f(px, -sy + py, pz);
    //--
    gl.texCoord2f(0.0, tA()); gl.vertex3f(sx + px, py, pz);
    gl.texCoord2f(rep, tAt()); gl.vertex3f(px, py, pz);
    gl.texCoord2f(rep, tBt()); gl.vertex3f(px, -sy + py, pz);
    gl.texCoord2f(0.0, tA()); gl.vertex3f(sx + px, py, pz);
    gl.texCoord2f(rep, tBt()); gl.vertex3f(px, -sy + py, pz);
    gl.texCoord2f(0.0, tB()); gl.vertex3f(sx + px, -sy + py, pz);
    if (blipMirrorT) { repA = rep; repB = 0.0; }
    gl.texCoord2f(0.0, tA()); gl.vertex3f(sx + px, sy + py, pz);
    gl.texCoord2f(rep, tAt()); gl.vertex3f(px, sy + py, pz);
    gl.texCoord2f(rep, tBt()); gl.vertex3f(px, py, pz);
    gl.texCoord2f(0.0, tA()); gl.vertex3f(sx + px, sy + py, pz);
    gl.texCoord2f(rep, tBt()); gl.vertex3f(px, py, pz);
    gl.texCoord2f(0.0, tB()); gl.vertex3f(sx + px, py, pz);
    //--
    gl.texCoord2f(rep, tAt()); gl.vertex3f(px, sy + py, pz);
    gl.texCoord2f(0.0, tA()); gl.vertex3f(-sx + px, sy + py, pz);
    gl.texCoord2f(0.0, tB()); gl.vertex3f(-sx + px, py, pz);
    gl.texCoord2f(rep, tAt()); gl.vertex3f(px, sy + py, pz);
    gl.texCoord2f(0.0, tB()); gl.vertex3f(-sx + px, py, pz);
    gl.texCoord2f(rep, tBt()); gl.vertex3f(px, py, pz);
    gl.end();
  }

  private drawSurface(c0: Float32Array, c1: Float32Array, r0: Float32Array, r1: Float32Array, r2: Float32Array): void {
    const g = this.parent.game;
    const gl = g.gl;
    const [px, py, pz] = this.pos;
    const sx = this.size[0], sy = this.size[1];
    const rep = 1.0;
    gl.bindTexture(this.parent.tex[Base]);
    gl.begin(GL_TRIANGLES);
    if (g.config.gfxLevel() > 0) {
      const v = (c: Float32Array, s: number, t: number, x: number, y: number) => {
        gl.color4f(c[0], c[1], c[2], c[3]);
        gl.texCoord2f(s, t);
        gl.vertex3f(x, y, pz);
      };
      v(c0, rep, rep, px, -sy + py);
      v(c1, rep, 0.0, px, py);
      v(r2, 0.0, 0.0, -sx + px, py);
      v(c0, rep, rep, px, -sy + py);
      v(r2, 0.0, 0.0, -sx + px, py);
      v(r0, 0.0, rep, -sx + px, -sy + py);
      v(r1, 0.0, rep, sx + px, -sy + py);
      v(r0, 0.0, 0.0, sx + px, py);
      v(c1, rep, 0.0, px, py);
      v(r1, 0.0, rep, sx + px, -sy + py);
      v(c1, rep, 0.0, px, py);
      v(c0, rep, rep, px, -sy + py);
      v(r0, 0.0, 0.0, sx + px, py);
      v(r1, 0.0, rep, sx + px, sy + py + 0.1);
      v(c0, rep, rep, px, sy + py + 0.1);
      v(r0, 0.0, 0.0, sx + px, py);
      v(c0, rep, rep, px, sy + py + 0.1);
      v(c1, rep, 0.0, px, py);
      v(c1, rep, 0.0, px, py);
      v(c0, rep, rep, px, sy + py + 0.1);
      v(r0, 0.0, rep, -sx + px, sy + py + 0.1);
      v(c1, rep, 0.0, px, py);
      v(r0, 0.0, rep, -sx + px, sy + py + 0.1);
      v(r2, 0.0, 0.0, -sx + px, py);
    } else {
      const b = f(-0.1);
      gl.color4f(c0[0] - b, c0[1] - b, c0[2] - b, c0[3]);
      const v = (s: number, t: number, x: number, y: number) => { gl.texCoord2f(s, t); gl.vertex3f(x, y, pz); };
      v(rep, rep, px, -sy + py);
      v(rep, 0.0, px, py);
      v(0.0, 0.0, -sx + px, py);
      v(rep, rep, px, -sy + py);
      v(0.0, 0.0, -sx + px, py);
      v(0.0, rep, -sx + px, -sy + py);
      v(0.0, rep, sx + px, -sy + py);
      v(0.0, 0.0, sx + px, py);
      v(rep, 0.0, px, py);
      v(0.0, rep, sx + px, -sy + py);
      v(rep, 0.0, px, py);
      v(rep, rep, px, -sy + py);
      v(0.0, 0.0, sx + px, py);
      v(0.0, rep, sx + px, sy + py);
      v(rep, rep, px, sy + py);
      v(0.0, 0.0, sx + px, py);
      v(rep, rep, px, sy + py);
      v(rep, 0.0, px, py);
      v(rep, 0.0, px, py);
      v(rep, rep, px, sy + py);
      v(0.0, rep, -sx + px, sy + py);
      v(rep, 0.0, px, py);
      v(0.0, rep, -sx + px, sy + py);
      v(0.0, 0.0, -sx + px, py);
    }
    gl.end();
  }
}

const Base = 0, Blip = 1;

export class GroundMetal {
  variation = 0;
  pos = new Float32Array(3);
  tex: (Texture | null)[] = [null, null];
  size = f(21.0);
  /** the segments after rootSeg */
  rootNext: GroundMetalSegment | null = null;
  private readonly rootSeg: GroundMetalSegment;
  readonly game: Global;

  constructor(game: Global) {
    this.game = game;
    this.loadTextures();
    const s = [this.size, this.size];
    this.rootSeg = new GroundMetalSegment(this.pos, s, this);
    this.pos[1] = this.size * 2.0;
    const seg = new GroundMetalSegment(this.pos, s, this);
    this.rootSeg.next = seg;
    this.pos[1] = 0.0;
    const tmp = new GroundMetalSegment(this.pos, s, this);
    seg.next = tmp;
    tmp.back = seg;
  }

  /** the segments, front to back */
  segments(): GroundMetalSegment[] {
    const out: GroundMetalSegment[] = [];
    for (let s = this.rootSeg.next; s; s = s.next) out.push(s);
    return out;
  }

  loadTextures(): void {
    const img = this.game.images;
    const file = ['gndMetalBase00.png', 'gndMetalBase01.png', 'gndMetalBase02.png'][this.variation] ?? 'gndMetalBase00.png';
    this.tex[Base] = img.load(file, IMG_NOMIPMAPS, IMG_ALPHA, GL_CLAMP_TO_EDGE, GL_LINEAR, GL_LINEAR);
    if (this.game.config.texBorder()) this.game.gl.texBorderColor(0.2, 0.2, 0.2, 1.0);
    this.tex[Blip] = img.load('gndMetalBlip.png', IMG_NOMIPMAPS, IMG_ALPHA, GL_REPEAT, GL_LINEAR, GL_LINEAR);
  }

  setVariation(index: number): void {
    this.variation = index % 3;
    this.loadTextures();
  }

  nextVariation(): void {
    this.setVariation(this.variation + 1);
  }

  drawGL(): void {
    const g = this.game;
    const gl = g.gl;
    const s2 = f(this.size * 2.0);
    let pulse = f(sin(g.gameFrame * 0.03));
    if (pulse < 0.0) pulse = 0.0;
    gl.clearColor(0.2 + pulse, 0.2, 0.25, 1.0);
    if (!g.gamePause || g.gameMode === Menu) {
      const step = f(g.scrollSpeed * g.speedAdj);
      for (let seg = this.rootSeg.next; seg; seg = seg.next) seg.pos[1] += step;
    }
    for (let seg = this.rootSeg.next; seg; seg = seg.next) {
      seg.drawGL();
      if (seg.pos[1] < -s2) {
        const pos1 = f(seg.pos[1] + s2 + s2);
        const p = [0.0, pos1, 0.0];
        seg.back!.next = null;
        const tmp = new GroundMetalSegment(p, [this.size, this.size], this);
        this.rootSeg.next!.back = tmp;
        tmp.next = this.rootSeg.next;
        tmp.back = this.rootSeg;
        this.rootSeg.next = tmp;
        break;
      }
    }
  }
}
