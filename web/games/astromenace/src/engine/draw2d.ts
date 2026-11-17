// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later): the 2D drawing of
// src/core/graphics/gl_draw2d.cpp (vw_Draw2D) and the text of src/core/font/font.cpp (vw_DrawText,
// vw_TextWidth, FreeType at 96 dpi), drawn on a canvas of the game's internal resolution
// (1228x768 or 1024x768) that lies over the 3D view. The glyphs come from the browser's rendering of
// the original font files. Changed for the browser by the freegames project, 2026.
import { type Tex, getTexture } from './textures.ts';

export interface Rect { left: number; top: number; right: number; bottom: number }
export const rect = (left: number, top: number, right: number, bottom: number): Rect => ({ left, top, right, bottom });
export interface RGB { r: number; g: number; b: number }

export const RGB = {
  white: { r: 1, g: 1, b: 1 }, black: { r: 0, g: 0, b: 0 }, red: { r: 1, g: 0, b: 0 }, green: { r: 0, g: 1, b: 0 },
  blue: { r: 0, g: 0, b: 1 }, yellow: { r: 1, g: 1, b: 0 }, orange: { r: 1, g: 0.5, b: 0 }, grey: { r: 0.5, g: 0.5, b: 0.5 },
};

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export const screen2d = {
  ctx: null as Ctx2D | null,
  width: 1228,
  height: 768,
  /** the CSS font family of the current font file */
  family: 'AstroMenaceFont0',
  makeCanvas: (w: number, h: number): HTMLCanvasElement | OffscreenCanvas => new OffscreenCanvas(w, h),
};

function texCanvas(t: Tex): HTMLCanvasElement | OffscreenCanvas {
  if (!t.canvas) {
    const c = screen2d.makeCanvas(t.width, t.height);
    const x = c.getContext('2d') as Ctx2D;
    const img = x.createImageData(t.width, t.height);
    // the rows are in OpenGL's order (row 0 at the bottom); the 2D mode's texture coordinates count from the top
    const row = t.width * 4;
    for (let y = 0; y < t.height; y++) img.data.set(t.rgba.subarray((t.height - 1 - y) * row, (t.height - y) * row), y * row);
    if (!t.alpha) for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;
    x.putImageData(img, 0, 0);
    t.canvas = c;
  }
  return t.canvas as HTMLCanvasElement | OffscreenCanvas;
}

const tinted = new Map<string, HTMLCanvasElement | OffscreenCanvas>();

function tintedCanvas(t: Tex, c: RGB): HTMLCanvasElement | OffscreenCanvas {
  const key = `${t.name}|${c.r},${c.g},${c.b}`;
  let v = tinted.get(key);
  if (!v) {
    const src = texCanvas(t);
    v = screen2d.makeCanvas(t.width, t.height);
    const x = v.getContext('2d') as Ctx2D;
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'multiply';
    x.fillStyle = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
    x.fillRect(0, 0, t.width, t.height);
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(src, 0, 0);
    tinted.set(key, v);
  }
  return v;
}

/** vw_Draw2D: the source rectangle of the texture (pixels) into the destination rectangle */
export function vw_Draw2D(dst: Rect, src: Rect, texture: string | null, _alpha: boolean, transp = 1, rotate = 0, color: RGB = RGB.white): void {
  const ctx = screen2d.ctx;
  const t = getTexture(texture);
  if (!ctx || !t || transp <= 0) return;
  const img = color.r === 1 && color.g === 1 && color.b === 1 ? texCanvas(t) : tintedCanvas(t, color);
  ctx.save();
  ctx.globalAlpha = Math.min(1, transp);
  if (rotate) ctx.rotate(rotate * Math.PI / 180);
  let sx = src.left, sy = src.top, sw = src.right - src.left, sh = src.bottom - src.top;
  let dx = dst.left, dy = dst.top, dw = dst.right - dst.left, dh = dst.bottom - dst.top;
  // mirrored rectangles (left > right) draw the image flipped
  if (sw < 0 || dw < 0 || sh < 0 || dh < 0) {
    ctx.translate(dx + (dw < 0 ? dw : 0), dy + (dh < 0 ? dh : 0));
    const fx = Math.sign(sw) * Math.sign(dw) < 0, fy = Math.sign(sh) * Math.sign(dh) < 0;
    if (sw < 0) { sx += sw; sw = -sw; }
    if (sh < 0) { sy += sh; sh = -sh; }
    dw = Math.abs(dw); dh = Math.abs(dh);
    ctx.translate(fx ? dw : 0, fy ? dh : 0);
    ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
    dx = 0; dy = 0;
  }
  // texture coordinates outside the image repeat or clamp; canvas only clips
  if (sw > 0 && sh > 0 && dw > 0 && dh > 0) {
    if (sx >= 0 && sy >= 0 && sx + sw <= t.width && sy + sh <= t.height) {
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    } else {
      drawRepeated(ctx, img, t, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }
  ctx.restore();
}

/** a source rectangle larger than the texture (GL_REPEAT, the HUD lines and the menu line) */
function drawRepeated(ctx: Ctx2D, img: CanvasImageSource, t: Tex, sx: number, sy: number, sw: number, sh: number,
  dx: number, dy: number, dw: number, dh: number): void {
  const kx = dw / sw, ky = dh / sh;
  const y0 = Math.floor(sy / t.height) * t.height;
  for (let ty = y0; ty < sy + sh; ty += t.height) {
    const x0 = Math.floor(sx / t.width) * t.width;
    for (let tx = x0; tx < sx + sw; tx += t.width) {
      const a = Math.max(sx, tx), b = Math.min(sx + sw, tx + t.width);
      const c = Math.max(sy, ty), d = Math.min(sy + sh, ty + t.height);
      if (b <= a || d <= c) continue;
      ctx.drawImage(img, a - tx, c - ty, b - a, d - c, dx + (a - sx) * kx, dy + (c - sy) * ky, (b - a) * kx, (d - c) * ky);
    }
  }
}

/** a filled colour rectangle (glDraw of the colour arrays: the HUD bars, the checkbox, the brightness) */
export function vw_FillRect(r: Rect, color: RGB, transp: number): void {
  const ctx = screen2d.ctx;
  if (!ctx || transp <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, transp);
  ctx.fillStyle = `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`;
  ctx.fillRect(r.left, r.top, r.right - r.left, r.bottom - r.top);
  ctx.restore();
}

// ---- text

let fontSize = 16;
const advanceCache = new Map<string, number>();
/** a stand-in for headless tests: an average advance of 0.55 em */
export const textMeasure = {
  advance: (ch: string, size: number): number => {
    const ctx = screen2d.ctx;
    const px = size * 96 / 72;
    if (!ctx) return Math.round(px * 0.55);
    const key = `${screen2d.family}|${size}|${ch}`;
    let v = advanceCache.get(key);
    if (v === undefined) {
      ctx.save();
      ctx.font = `${px}px "${screen2d.family}"`;
      v = Math.round(ctx.measureText(ch).width);
      ctx.restore();
      advanceCache.set(key, v);
    }
    return v;
  },
};

export const vw_SetFontSize = (s: number): void => { fontSize = s; };
export const vw_GetFontSize = (): number => fontSize;
export const clearTextCache = (): void => { advanceCache.clear(); };

function spaceWidth(scale: number): number {
  let w = textMeasure.advance(' ', fontSize) * scale;
  if (w < fontSize * 0.65) w = fontSize * 0.65;
  return w;
}

/** vw_TextWidth */
export function vw_TextWidth(text: string): number {
  if (!text) return -1;
  const sw = spaceWidth(1);
  let w = 0;
  for (const ch of text) w += ch === ' ' ? sw : textMeasure.advance(ch, fontSize);
  return Math.trunc(w);
}

/**
 * vw_DrawText: X, Y is the top left; StrictWidth > 0 stretches the spaces to that width, < 0 squeezes
 * the text into -StrictWidth; ExpandWidth stops drawing at that width.
 */
export function vw_DrawText(X: number, Y: number, StrictWidth: number, ExpandWidth: number, FontScale: number,
  color: RGB, transp: number, text: string): number {
  if (!text) return -1;
  if (transp >= 1) transp = 1;
  if (Y + Math.trunc(fontSize * FontScale) < 0) return 0;
  let sw = spaceWidth(FontScale);
  let fw = 1;
  if (StrictWidth) {
    let l1 = 0, l2 = 0, spaces = 0;
    for (const ch of text) {
      if (ch === ' ') {
        if (StrictWidth > 0) spaces++;
        else l2 += sw;
      } else if (StrictWidth > 0) {
        l1 += textMeasure.advance(ch, fontSize);
      } else {
        l2 += textMeasure.advance(ch, fontSize);
      }
    }
    if (StrictWidth > 0) {
      if (StrictWidth > l1 && spaces) sw = (StrictWidth - l1) / spaces;
    } else if (-StrictWidth < l2) {
      fw = -StrictWidth / l2;
    }
  }
  const ctx = screen2d.ctx;
  const factor = FontScale * fw;
  let x = X;
  let lineWidth = 0;
  if (ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, transp);
    ctx.fillStyle = `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`;
    ctx.font = `${fontSize * 96 / 72 * FontScale}px "${screen2d.family}"`;
    ctx.textBaseline = 'alphabetic';
  }
  const baseline = Y + 2 + fontSize * FontScale;
  for (const ch of text) {
    if (ch !== ' ') {
      const adv = textMeasure.advance(ch, fontSize);
      if (ctx) {
        if (fw !== 1) {
          ctx.save();
          ctx.translate(x, baseline);
          ctx.scale(fw, 1);
          ctx.fillText(ch, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(ch, x, baseline);
        }
      }
      x += adv * factor;
      lineWidth += adv * factor;
    } else {
      // NOTE the original scales the space twice by FontScale (in the space width and in the factor)
      x += sw * factor;
      lineWidth += sw * factor;
    }
    if (ExpandWidth !== 0 && lineWidth >= ExpandWidth) break;
  }
  if (ctx) ctx.restore();
  return 0;
}
