// The original Diamond Trust bitmap fonts: 16x16 ASCII sheets where the red
// channel is the glyph alpha (the corner colour is transparent). Font.cpp uses
// the ink bounds for pseudo-kerning and equal-width numerals; this renderer
// keeps the same cell order and approximate spacing for canvas labels.
import { image } from './assets.ts';

interface Glyph { left: number; width: number; mask: Uint8Array }

export interface BitmapFont {
  cell: number;
  spacing: number;
  space: number;
  glyphs: Glyph[];
}

export async function loadBitmapFont(name: string, spacing: number, space: number): Promise<BitmapFont> {
  const img = await image(name);
  const cell = Math.floor(img.naturalWidth / 16);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error(`could not read ${name}`);
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const glyphs: Glyph[] = [];
  for (let code = 0; code < 128; code++) {
    const ox = (code % 16) * cell, oy = Math.floor(code / 16) * cell;
    const mask = new Uint8Array(cell * cell);
    let left = cell, right = -1;
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
      const alpha = data[((oy + y) * canvas.width + ox + x) * 4];
      if (alpha > 0) {
        mask[y * cell + x] = alpha;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
    if (right < left) { left = 0; right = cell - 1; }
    glyphs.push({ left, width: right - left + 1, mask });
  }
  return { cell, spacing, space, glyphs };
}

function glyphWidth(font: BitmapFont, ch: string): number {
  const g = font.glyphs[ch.charCodeAt(0)] ?? font.glyphs[63];
  return g ? g.width : font.space;
}

export function measureBitmapText(font: BitmapFont, text: string): number {
  let w = 0;
  for (const ch of text) w += (ch === ' ' ? font.space : glyphWidth(font, ch)) + font.spacing;
  return Math.max(0, w - font.spacing);
}

/** Draws the bitmap text; alignment defaults to left, like the original's API. */
export function drawBitmapText(ctx: CanvasRenderingContext2D, font: BitmapFont,
  text: string, x: number, y: number, color: string,
  align: CanvasTextAlign = 'left'): void {
  const width = measureBitmapText(font, text);
  let px = Math.round(align === 'center' ? x - width / 2 : align === 'right' ? x - width : x);
  ctx.save();
  ctx.fillStyle = color;
  for (const ch of text) {
    if (ch === ' ') { px += font.space + font.spacing; continue; }
    const g = font.glyphs[ch.charCodeAt(0)] ?? font.glyphs[63];
    if (!g) { px += font.space + font.spacing; continue; }
    for (let gy = 0; gy < font.cell; gy++) for (let gx = 0; gx < font.cell; gx++) {
      const a = g.mask[gy * font.cell + gx];
      if (!a) continue;
      ctx.globalAlpha = a / 255;
      ctx.fillRect(px + gx - g.left, Math.round(y) + gy, 1, 1);
    }
    px += g.width + font.spacing;
  }
  ctx.restore();
}
