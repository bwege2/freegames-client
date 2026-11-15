// C-Dogs SDL 2.5.0, translated: the graphics device the game draws on (grafx.c, blit.c, texture.c, pic.c
// PicRender, cpic.c CPicDraw, draw/drawtools.c, font.c). The original draws with SDL_Renderer onto a texture at the
// game's resolution (320x200 with the DOS pixel aspect by default); the port draws the same operations in software
// onto a pixel buffer of that size: textures with a colour and alpha modulation, alpha blending (SDL_BLENDMODE_BLEND),
// rotation about the destination's centre, flips and scaling with nearest-neighbour sampling, as SDL's renderers do.
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { Vec2FromRadiansScaled, BresenhamLineDraw, colorWhite, svec2i, type Color, type Vec2, type Vec2i, type Rect2i } from '../core/base.ts';
import { colorToPixel, type Pic, type CPic, CPicGetPic } from '../core/pics.ts';
import { decodePNG } from '../platform/png.ts';

export const FLIP_NONE = 0;
export const FLIP_HORIZONTAL = 1;
export const FLIP_VERTICAL = 2;

/**
 * The window's textures (grafx.c GraphicsInitialize, window_context.c): every frame starts black, then the background
 * target texture (bkgTgt) is drawn with the background tint (bkgMask), then the static background texture (bkg: either
 * filled black by RunGameReset or cleared), then the frame's drawing, then the brightness overlay. The game's own
 * pixel buffer (g->buf, blit.c) is only ever cleared or filled black, so its textures (screen, hud) are transparent
 * and left out. buf is the current render target: the frame, or bkgTgt while the background is drawn.
 */
export class Gfx {
  w: number;
  h: number;
  buf: Uint32Array;
  frame: Uint32Array;
  bkgTgt: Uint32Array;
  bkgMask: Color = { r: 255, g: 255, b: 255, a: 255 };
  bkgBlack = false;
  brightness = 0;
  clip: { x: number; y: number; w: number; h: number } | null = null;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.frame = new Uint32Array(w * h);
    this.bkgTgt = new Uint32Array(w * h);
    this.buf = this.frame;
  }
  resize(w: number, h: number): void {
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.frame = new Uint32Array(w * h);
    this.bkgTgt = new Uint32Array(w * h);
    this.buf = this.frame;
  }
  /** WindowContextPreRender */
  preRender(): void {
    this.buf = this.frame;
    const f = this.frame;
    if (this.bkgBlack) {
      f.fill(0xff000000);
      return;
    }
    const { r: mr, g: mg, b: mb } = this.bkgMask;
    const t = this.bkgTgt;
    for (let i = 0; i < f.length; i++) {
      const p = t[i];
      const r = (((p & 255) * mr) / 255) | 0;
      const g = ((((p >>> 8) & 255) * mg) / 255) | 0;
      const b = ((((p >>> 16) & 255) * mb) / 255) | 0;
      f[i] = (r | (g << 8) | (b << 16) | 0xff000000) >>> 0;
    }
  }
  /** WindowContextPostRender: the brightness overlay (alpha |brightness| * 13, white or black) */
  postRender(): void {
    if (this.brightness === 0) return;
    const c = this.brightness > 0 ? 255 : 0;
    const a = Math.abs(this.brightness) * 13;
    const p = (c | (c << 8) | (c << 16) | 0xff000000) >>> 0;
    for (let i = 0; i < this.frame.length; i++) this.blend(i, p, 255, 255, 255, a);
  }
  /** draw into the background target texture (grafx_bg.c DrawBackgroundWithRenderer) */
  withBackground(mask: Color, draw: () => void): void {
    this.bkgMask = mask;
    this.buf = this.bkgTgt;
    try {
      draw();
    } finally {
      this.buf = this.frame;
    }
    // BlitUpdateFromBuf(g, bkg) of the cleared buffer
    this.bkgBlack = false;
  }
  clear(c: number = 0xff000000): void {
    this.buf.fill(c);
  }
  setClip(r: Rect2i | null): void {
    this.clip = r ? { x: r.Pos.x, y: r.Pos.y, w: r.Size.x, h: r.Size.y } : null;
  }
  private bounds(): [number, number, number, number] {
    if (!this.clip) return [0, 0, this.w, this.h];
    const c = this.clip;
    return [Math.max(0, c.x), Math.max(0, c.y), Math.min(this.w, c.x + c.w), Math.min(this.h, c.y + c.h)];
  }
  /** one source pixel (r | g << 8 | b << 16 | a << 24) blended onto the buffer with SDL_BLENDMODE_BLEND */
  private blend(i: number, p: number, mr: number, mg: number, mb: number, ma: number): void {
    let a = p >>> 24;
    if (a === 0) return;
    let r = p & 255;
    let g = (p >>> 8) & 255;
    let b = (p >>> 16) & 255;
    if (mr !== 255) r = (r * mr / 255) | 0;
    if (mg !== 255) g = (g * mg / 255) | 0;
    if (mb !== 255) b = (b * mb / 255) | 0;
    if (ma !== 255) a = (a * ma / 255) | 0;
    if (a === 255) {
      this.buf[i] = (r | (g << 8) | (b << 16) | 0xff000000) >>> 0;
      return;
    }
    const d = this.buf[i];
    const ia = 255 - a;
    const dr = ((r * a + (d & 255) * ia) / 255) | 0;
    const dg = ((g * a + ((d >>> 8) & 255) * ia) / 255) | 0;
    const db = ((b * a + ((d >>> 16) & 255) * ia) / 255) | 0;
    const da = (a + ((d >>> 24) * ia) / 255) | 0;
    this.buf[i] = (dr | (dg << 8) | (db << 16) | (da << 24)) >>> 0;
  }
  /**
   * SDL_RenderCopyEx of a picture: src (in picture pixels), dest rectangle, colour and alpha modulation, angle in
   * degrees clockwise about the destination's centre, flip
   */
  copy(pic: Pic, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number,
    mask: Color, angle: number, flip: number): void {
    if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
    const [cx0, cy0, cx1, cy1] = this.bounds();
    const data = pic.Data;
    const pw = pic.isHD ? pic.size.x * 2 : pic.size.x;
    const mr = mask.r;
    const mg = mask.g;
    const mb = mask.b;
    const ma = mask.a;
    if (angle === 0) {
      const x0 = Math.max(dx, cx0);
      const y0 = Math.max(dy, cy0);
      const x1 = Math.min(dx + dw, cx1);
      const y1 = Math.min(dy + dh, cy1);
      for (let y = y0; y < y1; y++) {
        let v = Math.floor(((y - dy) * sh) / dh);
        if (flip & FLIP_VERTICAL) v = sh - 1 - v;
        const row = (sy + v) * pw + sx;
        for (let x = x0; x < x1; x++) {
          let u = Math.floor(((x - dx) * sw) / dw);
          if (flip & FLIP_HORIZONTAL) u = sw - 1 - u;
          this.blend(y * this.w + x, data[row + u], mr, mg, mb, ma);
        }
      }
      return;
    }
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const ccx = dx + dw / 2;
    const ccy = dy + dh / 2;
    const ext = Math.ceil(Math.sqrt(dw * dw + dh * dh) / 2) + 1;
    const x0 = Math.max(Math.floor(ccx - ext), cx0);
    const y0 = Math.max(Math.floor(ccy - ext), cy0);
    const x1 = Math.min(Math.ceil(ccx + ext), cx1);
    const y1 = Math.min(Math.ceil(ccy + ext), cy1);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const px = x + 0.5 - ccx;
        const py = y + 0.5 - ccy;
        // rotate back
        const lx = px * cos + py * sin + dw / 2;
        const ly = -px * sin + py * cos + dh / 2;
        if (lx < 0 || ly < 0 || lx >= dw || ly >= dh) continue;
        let u = Math.floor((lx * sw) / dw);
        let v = Math.floor((ly * sh) / dh);
        if (flip & FLIP_HORIZONTAL) u = sw - 1 - u;
        if (flip & FLIP_VERTICAL) v = sh - 1 - v;
        this.blend(y * this.w + x, data[(sy + v) * pw + sx + u], mr, mg, mb, ma);
      }
    }
  }
  point(x: number, y: number, c: Color): void {
    const [cx0, cy0, cx1, cy1] = this.bounds();
    if (x < cx0 || y < cy0 || x >= cx1 || y >= cy1) return;
    this.blend(y * this.w + x, colorToPixel({ r: c.r, g: c.g, b: c.b, a: 255 }), 255, 255, 255, c.a);
  }
  fillRect(x: number, y: number, w: number, h: number, c: Color): void {
    const [cx0, cy0, cx1, cy1] = this.bounds();
    const p = colorToPixel({ r: c.r, g: c.g, b: c.b, a: 255 });
    for (let yy = Math.max(y, cy0); yy < Math.min(y + h, cy1); yy++) {
      for (let xx = Math.max(x, cx0); xx < Math.min(x + w, cx1); xx++) this.blend(yy * this.w + xx, p, 255, 255, 255, c.a);
    }
  }
  drawRect(x: number, y: number, w: number, h: number, c: Color): void {
    if (w <= 0 || h <= 0) return;
    for (let xx = x; xx < x + w; xx++) {
      this.point(xx, y, c);
      if (h > 1) this.point(xx, y + h - 1, c);
    }
    for (let yy = y + 1; yy < y + h - 1; yy++) {
      this.point(x, yy, c);
      if (w > 1) this.point(x + w - 1, yy, c);
    }
  }
  /** SDL_RenderDrawLine */
  line(x1: number, y1: number, x2: number, y2: number, c: Color): void {
    BresenhamLineDraw({ x: x1, y: y1 }, { x: x2, y: y2 }, (v) => this.point(v.x, v.y, c));
  }
}

export let gGfx = new Gfx(320, 200);
export function setGfx(g: Gfx): void {
  gGfx = g;
}

// --- pic.c / cpic.c ------------------------------------------------------------------------------------------------

const MROUND = (x: number): number => Math.round(x);
/** PicRender */
export function PicRender(p: Pic | null | undefined, pos: Vec2i, mask: Color, radians = 0, scale: Vec2 = { x: 1, y: 1 },
  flip = FLIP_NONE, srcRect: Rect2i | null = null): void {
  if (!p || !p.Data || p.size.x === 0) return;
  const srcSize = p.isHD ? svec2i(p.size.x * 2, p.size.y * 2) : p.size;
  const sPos = srcRect ? { x: Math.max(srcRect.Pos.x, 0), y: Math.max(srcRect.Pos.y, 0) } : { x: 0, y: 0 };
  const sSize = !srcRect || (srcRect.Size.x === 0 && srcRect.Size.y === 0)
    ? srcSize : { x: Math.min(srcRect.Size.x - sPos.x, srcSize.x), y: Math.min(srcRect.Size.y - sPos.y, srcSize.y) };
  const dest = { x: pos.x, y: pos.y, w: sSize.x, h: sSize.y };
  const unscaled = scale.x === 1 && scale.y === 1;
  const ds = { x: scale.x * (p.isHD ? 0.5 : 1), y: scale.y * (p.isHD ? 0.5 : 1) };
  if (!unscaled) {
    dest.x -= MROUND(((ds.x - 1) * sSize.x) / 2);
    dest.y -= MROUND(((ds.y - 1) * sSize.y) / 2);
    dest.w = MROUND(sSize.x * ds.x);
    dest.h = MROUND(sSize.y * ds.y);
  } else if (p.isHD) {
    dest.w = MROUND(sSize.x * ds.x);
    dest.h = MROUND(sSize.y * ds.y);
  }
  const angle = (radians * 180) / Math.PI;
  gGfx.copy(p, sPos.x, sPos.y, sSize.x, sSize.y, dest.x, dest.y, dest.w, dest.h, mask, angle, flip);
}
/** TextureRender of a whole or part of a picture into a destination rectangle */
export function TextureRender(p: Pic, src: Rect2i, dest: Rect2i, mask: Color, angle = 0, flip = FLIP_NONE): void {
  const s = src.Size.x === 0 && src.Size.y === 0 ? { x: 0, y: 0, w: p.size.x, h: p.size.y } : { x: src.Pos.x, y: src.Pos.y, w: src.Size.x, h: src.Size.y };
  gGfx.copy(p, s.x, s.y, s.w, s.h, dest.Pos.x, dest.Pos.y, dest.Size.x, dest.Size.y, mask, angle, flip);
}
export interface CPicDrawContext { Dir: number; Offset: Vec2i; Radians: number; Scale: Vec2; Mask: Color; Flip: number }
export function CPicDrawContextNew(): CPicDrawContext {
  return { Dir: 0, Offset: { x: 0, y: 0 }, Radians: 0, Scale: { x: 1, y: 1 }, Mask: { ...colorWhite }, Flip: FLIP_NONE };
}
const mult = (a: Color, b: Color): Color => ({
  r: ((a.r * b.r) / 255) | 0, g: ((a.g * b.g) / 255) | 0, b: ((a.b * b.b) / 255) | 0, a: ((a.a * b.a) / 255) | 0,
});
export function CPicDraw(p: CPic, pos: Vec2i, ctx: CPicDrawContext | null): void {
  const c = ctx ?? CPicDrawContextNew();
  const pic = CPicGetPic(p, c.Dir);
  if (pic == null) return;
  PicRender(pic, { x: pos.x + c.Offset.x, y: pos.y + c.Offset.y }, mult(p.Mask, c.Mask), c.Radians, c.Scale, c.Flip, null);
}

// --- draw/drawtools.c ------------------------------------------------------------------------------------------------

export function DrawPoint(pos: Vec2i, c: Color): void {
  gGfx.point(pos.x, pos.y, c);
}
export function DrawLine(from: Vec2i, to: Vec2i, c: Color): void {
  BresenhamLineDraw(from, to, (v) => gGfx.point(v.x, v.y, c));
}
export function Draw_Line(x1: number, y1: number, x2: number, y2: number, c: Color): void {
  if (x1 === x2 || y1 === y2) {
    if (x1 === x2) for (let i = Math.min(y1, y2); i <= Math.max(y1, y2); i++) gGfx.point(x1, i, c);
    else for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) gGfx.point(i, y1, c);
  } else if (Math.abs(x2 - x1) === Math.abs(y1 - y2)) {
    for (let i = Math.min(x1, x2); i < Math.max(x1, x2); i++) gGfx.point(i, i, c);
  }
}
export function DrawRectangle(pos: Vec2i, size: Vec2i, color: Color, filled: boolean): void {
  if (filled) gGfx.fillRect(pos.x, pos.y, size.x, size.y, color);
  else gGfx.drawRect(pos.x, pos.y, size.x, size.y, color);
}
export function DrawCross(pos: Vec2i, c: Color): void {
  gGfx.line(pos.x - 1, pos.y, pos.x + 1, pos.y, c);
  gGfx.line(pos.x, pos.y - 1, pos.x, pos.y + 1, c);
}
export function DrawLaserSightSingle(from: Vec2i, radians: number, range: number, color: Color): void {
  const v = Vec2FromRadiansScaled(radians);
  DrawLine(from, { x: from.x + Math.trunc(v.x * range), y: from.y + Math.trunc(v.y * range) }, color);
}

// --- font.c --------------------------------------------------------------------------------------------------------

export const ALIGN_START = 0;
export const ALIGN_CENTER = 1;
export const ALIGN_END = 2;
export interface FontOpts { HAlign: number; VAlign: number; Area: Vec2i; Pad: Vec2i; Mask: Color }
export function FontOptsNew(): FontOpts {
  return { HAlign: ALIGN_START, VAlign: ALIGN_START, Area: { x: 0, y: 0 }, Pad: { x: 0, y: 0 }, Mask: { ...colorWhite } };
}
export const gFont = { Size: { x: 0, y: 0 }, Gap: { x: 0, y: 0 }, Chars: [] as Pic[] };

/** FontLoadFromJSON + FontLoad */
export function FontLoad(png: Uint8Array, json: { Size: number[]; Stride: number; Padding?: number[]; Gap?: number[];
  Proportional?: boolean; SpaceSize?: number[] }, trim: (p: Pic, x: boolean, y: boolean) => void,
  shrink: (p: Pic, size: Vec2i, offset: Vec2i) => void, load: (size: Vec2i, offset: Vec2i, img: ReturnType<typeof decodePNG>) => Pic): void {
  const img = decodePNG(png);
  const size = { x: json.Size[0], y: json.Size[1] };
  const pad = json.Padding ?? [0, 0, 0, 0];
  gFont.Size = size;
  gFont.Gap = json.Gap ? { x: json.Gap[0], y: json.Gap[1] } : { x: 0, y: 0 };
  const spaceSize = json.SpaceSize ? { x: json.SpaceSize[0], y: json.SpaceSize[1] } : { ...size };
  const step = { x: size.x + pad[0] + pad[2], y: size.y + pad[1] + pad[3] };
  gFont.Chars = [];
  let chars = 0;
  for (let py = 0; py + step.y <= img.height && chars < 256; py += step.y) {
    for (let x = 0, px = 0; x < json.Stride && chars < 256; px += step.x, x++, chars++) {
      const p = load(size, { x: px + pad[0], y: py + pad[1] }, img);
      if (chars === 32) shrink(p, spaceSize, { x: 0, y: 0 });
      else if (json.Proportional) trim(p, true, false);
      gFont.Chars.push(p);
    }
  }
}
const enc = new TextEncoder();
/** the original's strings are bytes: UTF-8 text shows as its bytes' glyphs */
function bytes(s: string): Uint8Array {
  return enc.encode(s);
}
export function FontW(c: number): number {
  const p = gFont.Chars[c & 255];
  return (p ? p.size.x : 0) + gFont.Gap.x;
}
export function FontH(): number {
  return gFont.Size.y + gFont.Gap.y;
}
function substrW(b: Uint8Array, len: number): number {
  let maxWidth = 0;
  let w = 0;
  for (let i = 0; i < Math.min(len, b.length); i++) {
    if (b[i] === 10) {
      maxWidth = Math.max(maxWidth, w);
      w = 0;
    } else {
      w += FontW(b[i]);
    }
  }
  return Math.max(maxWidth, w);
}
export function FontStrW(s: string): number {
  const b = bytes(s);
  return substrW(b, b.length);
}
export function FontSubstrW(s: string, len: number): number {
  return substrW(bytes(s), len);
}
export function FontStrNumLines(s: string): number {
  return s.split('\n').length;
}
export function FontStrH(s: string): number {
  return FontStrNumLines(s) * FontH();
}
export function FontStrSize(s: string): Vec2i {
  const size = { x: 0, y: 0 };
  if (s.length === 0) return size;
  const lines = s.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  for (const l of lines) {
    size.y += FontH();
    size.x = Math.max(size.x, FontStrW(l));
  }
  return size;
}
export function FontChMask(c: number, pos: Vec2i, mask: Color): Vec2i {
  const pic = gFont.Chars[c & 255];
  if (!pic) return pos;
  PicRender(pic, pos, mask);
  return { x: pos.x + pic.size.x + gFont.Gap.x, y: pos.y };
}
export function FontCh(c: string, pos: Vec2i): Vec2i {
  return FontChMask(c.charCodeAt(0), pos, colorWhite);
}
export function FontStrMask(s: string | null, pos: Vec2i, mask: Color): Vec2i {
  if (s == null) return pos;
  const left = pos.x;
  let p = { ...pos };
  for (const c of bytes(s)) {
    if (c === 10) {
      p.x = left;
      p.y += FontH();
    } else {
      p = FontChMask(c, p, mask);
    }
  }
  return p;
}
export function FontStr(s: string | null, pos: Vec2i): Vec2i {
  return FontStrMask(s, pos, colorWhite);
}
function GetAlign(align: number, pos: number, pad: number, area: number, size: number): number {
  switch (align) {
    case ALIGN_START: return pos + pad;
    case ALIGN_CENTER: return pos + Math.trunc((area - size) / 2);
    case ALIGN_END: return pos + area - size - pad;
    default: return pos;
  }
}
export function FontStrOpt(s: string | null, pos: Vec2i, opts: FontOpts): void {
  if (s == null) return;
  const ts = FontStrSize(s);
  FontStrMask(s, { x: GetAlign(opts.HAlign, pos.x, opts.Pad.x, opts.Area.x, ts.x), y: GetAlign(opts.VAlign, pos.y, opts.Pad.y, opts.Area.y, ts.y) }, opts.Mask);
}
export function FontStrCenter(s: string): void {
  const o = FontOptsNew();
  o.HAlign = ALIGN_CENTER;
  o.VAlign = ALIGN_CENTER;
  o.Area = { x: gGfx.w, y: gGfx.h };
  FontStrOpt(s, { x: 0, y: 0 }, o);
}
/** FontSplitLines: word-wrap to width pixels (the original measures from the centred x, as here) */
export function FontSplitLines(text: string, width: number): string {
  if (width === 0) return text;
  const s = bytes(text);
  const out: number[] = [];
  const ix = Math.trunc((gGfx.w - width) / 2);
  let x = ix;
  let i = 0;
  while (i < s.length) {
    let ws = i;
    while (s[i] === 32 || s[i] === 10) {
      out.push(s[i]);
      if (s[i] === 10) {
        ws = i + 1;
        x = ix;
      }
      i++;
    }
    const word = i;
    while (i < s.length && s[i] !== 32 && s[i] !== 10) i++;
    let w = 0;
    for (let p = ws; p < i; p++) w += FontW(s[p]);
    if (x + w > width + ix && w < width) {
      x = ix;
      ws = word;
      out.push(10);
    }
    for (let p = ws; p < word; p++) x += FontW(s[p]);
    for (let p = word; p < i; p++) {
      out.push(s[p]);
      x += FontW(s[p]);
    }
  }
  return new TextDecoder('latin1').decode(new Uint8Array(out)).replace(/[\x80-\xff]/g, (c) => c);
}
export function FontStrMaskWrap(s: string, pos: Vec2i, mask: Color, width: number): Vec2i {
  return FontStrMaskBytes(FontSplitLinesBytes(s, width), pos, mask);
}
function FontSplitLinesBytes(s: string, width: number): Uint8Array {
  const t = FontSplitLines(s, width);
  const b = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i) & 255;
  return b;
}
function FontStrMaskBytes(b: Uint8Array, pos: Vec2i, mask: Color): Vec2i {
  const left = pos.x;
  let p = { ...pos };
  for (const c of b) {
    if (c === 10) {
      p.x = left;
      p.y += FontH();
    } else {
      p = FontChMask(c, p, mask);
    }
  }
  return p;
}
export function CPicDrawPic(p: CPic): Pic | null {
  return CPicGetPic(p, 0);
}
