// The original's bitmap fonts (.stf + glyph/shadow PNG sheets), src/video/bitmap_font.cpp.
import { imageReady, loadImage, loadText } from './resources.ts';
import { parseSexp, child, children, atom, num, type Sexp } from './sexp.ts';

export class BitmapFont {
  readonly glyphs: string;
  readonly shadows: string;
  readonly chars: string[];
  readonly glyphWidth: number;
  readonly glyphHeight: number;
  readonly border: number;
  readonly cols: number;
  readonly advance: number;
  readonly imgW: number;
  readonly imgH: number;

  constructor(path: string, doc: Sexp[]) {
    void path;
    const gw = num(doc, 'glyph-width', 8);
    const gh = num(doc, 'glyph-height', 14);
    const border = num(doc, 'glyph-border', 1);
    const surface = children(doc, 'surface')[0];
    if (!surface) throw new Error('font without surface');
    this.glyphs = this.pathOf(atom(surface, 'glyphs'));
    this.shadows = this.pathOf(atom(surface, 'shadows'));
    const chars = child(surface, 'chars');
    this.chars = chars ? chars.slice(1).filter((x): x is string => typeof x === 'string') : [];
    this.glyphWidth = gw; this.glyphHeight = gh; this.border = border;
    this.cols = Math.max(1, Math.floor(144 / (gw + 2 * border))); // corrected after the image loads
    this.advance = gw + border;
    this.imgW = 0; this.imgH = 0;
  }

  private pathOf(name: string): string {
    return `images/engine/fonts/${name}`;
  }

  async ready(): Promise<void> {
    await loadImage(this.glyphs);
    await loadImage(this.shadows);
    const img = imageReady(this.glyphs);
    const cols = Math.max(1, Math.floor((img?.width ?? 144) / (this.glyphWidth + 2 * this.border)));
    // a readonly field with a computed value: the surface's own width decides how many glyphs a row has
    (this as { cols: number }).cols = cols;
  }

  measure(text: string, scale = 1): number {
    return text.length * this.advance * scale;
  }

  draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale = 1, shadow = true): void {
    const glyphs = imageReady(this.glyphs);
    const shadows = imageReady(this.shadows);
    let cx = x;
    for (const ch of text) {
      if (ch === '\n') { cx = x; y += this.glyphHeight * scale + 4; continue; }
      const code = ch.charCodeAt(0);
      // the .stf lists the characters row by row; look the character up in that order
      let index = -1, row = 0, col = 0;
      outer: for (let r = 0; r < this.chars.length; r++) {
        for (let c = 0; c < this.chars[r].length; c++) {
          if (this.chars[r].charCodeAt(c) === code) { index = r * this.cols + c; row = r; col = c; break outer; }
        }
      }
      if (index >= 0) {
        const sx = col * (this.glyphWidth + 2 * this.border) + this.border;
        const sy = row * (this.glyphHeight + 2 * this.border) + this.border;
        if (shadow && shadows) {
          ctx.drawImage(shadows, sx, sy, this.glyphWidth, this.glyphHeight,
            Math.round(cx + scale), Math.round(y + scale), this.glyphWidth * scale, this.glyphHeight * scale);
        }
        if (glyphs) {
          ctx.drawImage(glyphs, sx, sy, this.glyphWidth, this.glyphHeight,
            Math.round(cx), Math.round(y), this.glyphWidth * scale, this.glyphHeight * scale);
        }
      }
      cx += this.advance * scale;
    }
  }
}

const cache = new Map<string, Promise<BitmapFont>>();
export function loadFont(path: string): Promise<BitmapFont> {
  let p = cache.get(path);
  if (!p) {
    p = loadText(path).then(async (text) => {
      const doc = parseSexp(text) as Sexp[];
      const font = new BitmapFont(path, doc);
      await font.ready();
      return font;
    });
    cache.set(path, p);
  }
  return p;
}
