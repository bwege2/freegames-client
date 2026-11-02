// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// The picture sheet (assets/sprites.png, drawn with pxl from art/bomberslop.px.js) and the letters on it.
import sheetUrl from '../assets/sprites.png?url';
import frames from '../assets/sprites.json';

export type Rect = [number, number, number, number];

export class Sprites {
  readonly sheet: HTMLImageElement;
  readonly frames: Record<string, Rect> = frames as unknown as Record<string, Rect>;
  /** the sheet with the letters recoloured, by colour */
  private tinted = new Map<string, HTMLCanvasElement>();

  private constructor(sheet: HTMLImageElement) {
    this.sheet = sheet;
  }

  static async load(): Promise<Sprites> {
    const img = new Image();
    img.src = sheetUrl;
    await img.decode();
    return new Sprites(img);
  }

  has(name: string): boolean {
    return name in this.frames;
  }

  size(name: string): [number, number] {
    const f = this.frames[name];
    return f ? [f[2], f[3]] : [0, 0];
  }

  /** draws a sprite with its top-left corner at x, y (whole pixels) */
  draw(g: CanvasRenderingContext2D, name: string, x: number, y: number, alpha = 1): void {
    const f = this.frames[name];
    if (!f) return;
    if (alpha < 1) g.globalAlpha = Math.max(0, alpha);
    g.drawImage(this.sheet, f[0], f[1], f[2], f[3], Math.round(x), Math.round(y), f[2], f[3]);
    if (alpha < 1) g.globalAlpha = 1;
  }

  /** draws a sprite scaled about the point (ax, ay) of the sprite, placed at (x, y) */
  drawScaled(g: CanvasRenderingContext2D, name: string, x: number, y: number, scale: number, ax: number, ay: number, alpha = 1): void {
    const f = this.frames[name];
    if (!f || scale <= 0) return;
    if (alpha < 1) g.globalAlpha = Math.max(0, alpha);
    const w = f[2] * scale, h = f[3] * scale;
    g.drawImage(this.sheet, f[0], f[1], f[2], f[3], Math.round(x - ax * scale), Math.round(y - ay * scale), Math.round(w), Math.round(h));
    if (alpha < 1) g.globalAlpha = 1;
  }

  private tint(color: string): HTMLCanvasElement {
    let c = this.tinted.get(color);
    if (!c) {
      c = document.createElement('canvas');
      c.width = this.sheet.width;
      c.height = this.sheet.height;
      const g = c.getContext('2d')!;
      g.drawImage(this.sheet, 0, 0);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = color;
      g.fillRect(0, 0, c.width, c.height);
      this.tinted.set(color, c);
    }
    return c;
  }

  /** text in the 5x7 letters (6 px a letter), with a dark shadow; align: 0 left, 0.5 centre, 1 right */
  text(g: CanvasRenderingContext2D, s: string, x: number, y: number, color = '#fbf7ef', align = 0, scale = 1, shadow = '#1a1423'): number {
    const str = s.toUpperCase();
    const w = textWidth(str) * scale;
    let cx = Math.round(x - w * align);
    const start = cx;
    for (const pass of shadow ? [shadow, color] : [color]) {
      const src = this.tint(pass);
      const d = pass === shadow && shadow ? scale : 0;
      cx = start;
      for (const ch of str) {
        const f = this.frames[`ch_${ch.charCodeAt(0)}`] ?? this.frames['ch_63'];
        if (ch !== ' ' && f) g.drawImage(src, f[0], f[1], f[2], f[3], cx + d, Math.round(y) + d, f[2] * scale, f[3] * scale);
        cx += 6 * scale;
      }
    }
    return w;
  }
}

export function textWidth(s: string): number {
  return s.length ? s.length * 6 - 1 : 0;
}
