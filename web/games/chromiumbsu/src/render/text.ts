// Chromium B.S.U. port (GPL-3.0-or-later, LICENSE.md): the text renderer, as src/TextGLC.cpp uses
// QuesoGLC: the font Gothic Uralic Bold (the Debian package's dependency, assets/font/GOTHUB__.TTF),
// glyphs as textured quads one em high, scaled by 24; Advance and LineHeight in the same units.
// The glyphs are drawn once into an atlas with the browser's font rasterizer.
import type { Text } from '../gl.ts';
import type { GLTexture, WebGLRenderer } from './webgl.ts';
import { GL_QUADS } from '../gl.ts';

const EM = 64; // atlas pixels per em
const FIRST = 32, LAST = 126;

interface Glyph { advance: number; u0: number; v0: number; u1: number; v1: number }

export class GlyphFont {
  readonly glyphs = new Map<number, Glyph>();
  readonly ascent: number;
  readonly descent: number;
  readonly atlas: GLTexture;

  constructor(gl: WebGLRenderer, family: string) {
    const canvas = document.createElement('canvas');
    const g0 = canvas.getContext('2d')!;
    g0.font = `bold ${EM}px "${family}"`;
    const m = g0.measureText('Mg');
    this.ascent = (m.fontBoundingBoxAscent || EM * 0.8) / EM;
    this.descent = (m.fontBoundingBoxDescent || EM * 0.2) / EM;
    const cellH = Math.ceil((this.ascent + this.descent) * EM) + 2;
    const cellW = Math.ceil(EM * 1.2) + 2;
    const cols = 16, rows = Math.ceil((LAST - FIRST + 1) / cols);
    canvas.width = cols * cellW;
    canvas.height = rows * cellH;
    const g = canvas.getContext('2d')!;
    g.font = `bold ${EM}px "${family}"`;
    g.fillStyle = '#fff';
    g.textBaseline = 'alphabetic';
    for (let c = FIRST; c <= LAST; c++) {
      const i = c - FIRST;
      const x = (i % cols) * cellW + 1, y = Math.floor(i / cols) * cellH + 1;
      const ch = String.fromCharCode(c);
      const adv = g.measureText(ch).width / EM;
      g.fillText(ch, x, y + this.ascent * EM);
      this.glyphs.set(c, {
        advance: adv,
        u0: x / canvas.width, v0: y / canvas.height,
        u1: (x + adv * EM) / canvas.width, v1: (y + (this.ascent + this.descent) * EM) / canvas.height,
      });
    }
    const px = g.getImageData(0, 0, canvas.width, canvas.height).data;
    // white glyphs with their coverage as alpha
    const rgba = new Uint8Array(px.length);
    for (let i = 0; i < px.length; i += 4) { rgba[i] = rgba[i + 1] = rgba[i + 2] = 255; rgba[i + 3] = px[i + 3]; }
    const w = gl.gl;
    this.atlas = gl.upload('font', rgba, canvas.width, canvas.height, true, w.CLAMP_TO_EDGE, w.LINEAR_MIPMAP_LINEAR, w.LINEAR);
  }

  glyph(c: number): Glyph {
    return this.glyphs.get(c) ?? this.glyphs.get(63)!;
  }
}

export class GlcText implements Text {
  private readonly gl: WebGLRenderer;
  private readonly font: GlyphFont;

  constructor(gl: WebGLRenderer, font: GlyphFont) {
    this.gl = gl;
    this.font = font;
  }

  private chars(s: string, len?: number): string {
    return len === undefined || len < 0 ? s : s.slice(0, len);
  }

  render(str: string, len?: number): void {
    const gl = this.gl;
    const f = this.font;
    gl.pushMatrix();
    gl.scalef(24, 24, 1);
    gl.bindTexture(f.atlas);
    gl.begin(GL_QUADS);
    let x = 0;
    for (const ch of this.chars(str, len)) {
      const g = f.glyph(ch.charCodeAt(0));
      if (ch !== ' ') {
        gl.texCoord2f(g.u0, g.v1); gl.vertex3f(x, -f.descent, 0);
        gl.texCoord2f(g.u1, g.v1); gl.vertex3f(x + g.advance, -f.descent, 0);
        gl.texCoord2f(g.u1, g.v0); gl.vertex3f(x + g.advance, f.ascent, 0);
        gl.texCoord2f(g.u0, g.v0); gl.vertex3f(x, f.ascent, 0);
      }
      x += g.advance;
    }
    gl.end();
    gl.popMatrix();
  }

  advance(str: string, len?: number): number {
    let x = 0;
    for (const ch of this.chars(str, len)) x += this.font.glyph(ch.charCodeAt(0)).advance;
    return Math.fround(x * 24);
  }

  lineHeight(): number {
    return Math.fround((this.font.ascent + this.font.descent) * 24);
  }
}
