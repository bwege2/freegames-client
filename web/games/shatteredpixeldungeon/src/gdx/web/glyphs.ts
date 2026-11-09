// @ts-nocheck
// The pixels of FreeType's glyph bitmaps in the browser (src/gdx/freetype/ft.ts, setGlyphRasterizer): the port's
// FreeType loads a glyph's outline as FreeType's TrueType driver does without hinting (the game asks for
// Hinting.None, PlatformSupport.getFont), strokes it for a border, and computes the bitmap's size and place
// (FT_Glyph_To_Bitmap); this draws the outline into the bitmap with canvas 2D, as FreeType's smooth rasterizer
// (FT_RENDER_MODE_NORMAL) fills it: the non-zero winding rule, 8-bit coverage, one byte a pixel, rows from the
// top. The outline's contours are decomposed as FT_Outline_Decompose does (on-curve points, conic control
// points with implied on-curve midpoints, cubic control pairs). The pixel font's outlines lie on whole pixels at
// the game's sizes, so its glyphs come out sharp, as with FreeType.
//
// registerFont: a font file as a FontFace of the page, for the DOM text fields (scene2d.ts) to type in the
// game's font.
import type { Outline, Bitmap } from '../freetype/ft.ts';

let canvas: OffscreenCanvas | HTMLCanvasElement | null = null;
let g2d: any = null;

function context(w: number, h: number) {
  if (!canvas) {
    canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(64, 64) : document.createElement('canvas');
    g2d = canvas.getContext('2d', { willReadFrequently: true });
  }
  if (canvas.width < w || canvas.height < h) {
    canvas.width = Math.max(canvas.width, w);
    canvas.height = Math.max(canvas.height, h);
    g2d = canvas.getContext('2d', { willReadFrequently: true });
  }
  return g2d;
}

/** Adds the outline's contours to the context's path (FT_Outline_Decompose), in canvas pixels. */
function trace(g: any, o: Outline, left: number, top: number) {
  const X = (i: number) => o.x[i] / 64 - left;
  const Y = (i: number) => top - o.y[i] / 64;
  let first = 0;
  for (const last of o.contours) {
    const n = last - first + 1;
    if (n <= 0) { first = last + 1; continue; }
    const tag = (i: number) => o.tags[i] & 3;
    let sx: number, sy: number, start = first, end = last;
    if (tag(first) === 1) {
      sx = X(first); sy = Y(first); start = first + 1;
    } else if (tag(last) === 1) {
      sx = X(last); sy = Y(last); end = last - 1;
    } else {
      sx = (X(first) + X(last)) / 2; sy = (Y(first) + Y(last)) / 2;
    }
    g.moveTo(sx, sy);
    let i = start;
    while (i <= end) {
      const t = tag(i);
      if (t === 1) {
        g.lineTo(X(i), Y(i));
        i++;
      } else if (t === 0) {
        let cx = X(i), cy = Y(i);
        i++;
        for (;;) {
          if (i > end) { g.quadraticCurveTo(cx, cy, sx, sy); break; }
          const nt = tag(i);
          if (nt === 1) { g.quadraticCurveTo(cx, cy, X(i), Y(i)); i++; break; }
          if (nt !== 0) break;
          const mx = (cx + X(i)) / 2, my = (cy + Y(i)) / 2;
          g.quadraticCurveTo(cx, cy, mx, my);
          cx = X(i); cy = Y(i);
          i++;
        }
      } else {
        // cubic: two control points, then a point (or the start)
        const c1x = X(i), c1y = Y(i);
        const c2x = i + 1 <= end ? X(i + 1) : sx, c2y = i + 1 <= end ? Y(i + 1) : sy;
        if (i + 2 <= end) { g.bezierCurveTo(c1x, c1y, c2x, c2y, X(i + 2), Y(i + 2)); i += 3; }
        else { g.bezierCurveTo(c1x, c1y, c2x, c2y, sx, sy); i = end + 1; }
      }
    }
    g.closePath();
    first = last + 1;
  }
}

/** The GlyphRasterizer for the browser: fills `bitmap.buffer` with the outline's coverage. */
export function canvasRasterizer(o: Outline, b: Bitmap) {
  if (b.width <= 0 || b.rows <= 0) return;
  const g = context(b.width, b.rows);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, b.width, b.rows);
  g.fillStyle = '#fff';
  g.beginPath();
  trace(g, o, b.left, b.top);
  g.fill('nonzero');
  const img = g.getImageData(0, 0, b.width, b.rows).data;
  const out = b.buffer;
  for (let y = 0; y < b.rows; y++) {
    for (let x = 0; x < b.width; x++) out[y * b.pitch + x] = img[4 * (y * b.width + x) + 3];
  }
}

const families = new Map<Uint8Array, string>();

/** Loads a font file as a FontFace of the page; resolves with its CSS family name. */
export async function registerFont(bytes: Uint8Array): Promise<string> {
  const known = families.get(bytes);
  if (known) return known;
  const family = 'spd-font-' + families.size;
  const face = new FontFace(family, bytes.slice().buffer);
  await face.load();
  (document.fonts as any).add(face);
  families.set(bytes, family);
  return family;
}
