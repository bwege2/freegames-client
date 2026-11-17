// effect/Font.cpp with SDL_ttf: TTF_RenderUTF8_Shaded on the background colour (10,10,10) used as the
// colour key, then Outline (one black pixel around every glyph pixel). The browser draws the glyphs
// of the original's TrueType fonts (loaded as FontFaces); its rasterizer is not FreeType's.
import type { Pic } from './fb.ts';

export type FontName = 'menu' | 'subtitle' | 'console';

/** the game's strings are UTF-8 bytes in a JS string */
export function utf8(bytes: string): string {
  try {
    const a = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) a[i] = bytes.charCodeAt(i) & 255;
    return new TextDecoder('utf-8').decode(a);
  } catch {
    return bytes;
  }
}

export class TextRenderer {
  private canvas = new OffscreenCanvas(1, 1);
  private g = this.canvas.getContext('2d', { willReadFrequently: true })!;
  private cache = new Map<string, Pic>();
  private families: Record<FontName, string>;
  constructor(families: Record<FontName, string>) { this.families = families; }

  private font(name: FontName, size: number): string { return `${size}px "${this.families[name]}"`; }

  /** TTF_SizeUTF8: the width of the text */
  width(name: FontName, size: number, bytes: string): number {
    this.g.font = this.font(name, size);
    return Math.round(this.g.measureText(utf8(bytes)).width);
  }

  /** Font::renderTextOutlined(text, color): " text " with a black outline, background transparent */
  render(name: FontName, size: number, bytes: string, color: [number, number, number]): Pic {
    const key = `${name}|${size}|${color.join(',')}|${bytes}`;
    const hit = this.cache.get(key);
    if (hit) return hit;
    const text = ' ' + utf8(bytes === '' ? ' ' : bytes) + ' ';
    const g = this.g;
    g.font = this.font(name, size);
    const m = g.measureText(text);
    const ascent = Math.ceil(m.fontBoundingBoxAscent ?? size * 0.9);
    const descent = Math.ceil(m.fontBoundingBoxDescent ?? size * 0.25);
    const w = Math.max(1, Math.ceil(m.width)), h = Math.max(1, ascent + descent);
    this.canvas.width = w;
    this.canvas.height = h;
    g.font = this.font(name, size);
    g.fillStyle = 'rgb(10,10,10)';
    g.fillRect(0, 0, w, h);
    g.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
    g.textBaseline = 'alphabetic';
    g.fillText(text, 0, ascent);
    const d = g.getImageData(0, 0, w, h).data;
    const px = new Uint8ClampedArray(w * h * 4);
    const isBg = (i: number) => d[i] === 10 && d[i + 1] === 10 && d[i + 2] === 10;
    const glyph = new Uint8Array(w * h);
    for (let i = 0, p = 0; p < w * h; i += 4, p++) {
      if (!isBg(i)) {
        glyph[p] = 1;
        px[i] = d[i]; px[i + 1] = d[i + 1]; px[i + 2] = d[i + 2]; px[i + 3] = 255;
      }
    }
    // Outline: the background neighbours of every glyph pixel turn black
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!glyph[y * w + x]) continue;
        for (const [nx, ny] of [[x - 1, y], [x, y - 1], [x + 1, y], [x, y + 1]]) {
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && !glyph[ny * w + nx]) {
            const i = (ny * w + nx) * 4;
            px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 255;
          }
        }
      }
    }
    const pic = { w, h, px };
    if (this.cache.size > 400) this.cache.clear();
    this.cache.set(key, pic);
    return pic;
  }
}
