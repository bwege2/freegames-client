// The game's text: SDL_Pango 0.1.2 (with the Frozen-Bubble API patch) as fb_c_stuff uses it, with the
// font descriptions of the original ("sans 10", "sans 11 bold", ...) resolved to DejaVu Sans as
// fontconfig does on Linux. Layout sizes come from the metrics pango measures for DejaVu Sans
// (fonts.json, re/frozenbubble/oracle/pango-metrics.c): advances and pair adjustments in Pango units,
// which add up exactly to SDLPango_GetLayoutWidth. The surface and the rectangle its text is drawn in
// are SDL_Pango's (SetMinimumSize, alignment); the glyphs themselves are drawn by the page's canvas
// with the same font (`mode: 'canvas'`), or, in the tests, as the oracle's placeholder: the text's
// rectangle filled with the letter colour (`mode: 'placeholder'`), since FreeType's pixels cannot be
// reproduced in a browser.
import fontsJson from './fonts.json' with { type: 'json' };
import { createRGBSurface, fillRect, mapRGB, Rect, type Surface } from '../sdl/video.ts';
import type { TextEngine } from './game.ts';

interface FontMetrics { desc: string; lineHeight: number; emptyHeight: number; advance: Record<string, number>; pairs: Record<string, number> }
const FONTS = (fontsJson as unknown as { fonts: FontMetrics[] }).fonts;

/** the kinds of text (frozen-bubble's %pangocontext) */
const KINDS: Record<string, { desc: string; fg: 'white' | 'black'; bg: 'white' | 'black' }> = {
  netdialogs: { desc: 'sans 10', fg: 'white', bg: 'black' },
  netdialogs_servermsg: { desc: 'sans italic 10', fg: 'white', bg: 'black' },
  menu: { desc: 'sans 11', fg: 'white', bg: 'black' },
  bold_menu: { desc: 'sans 11 bold', fg: 'white', bg: 'black' },
  ingame: { desc: 'sans 14', fg: 'white', bg: 'black' },
  ingame_chat: { desc: 'sans 10', fg: 'black', bg: 'white' },
  ingame_small: { desc: 'sans 8', fg: 'white', bg: 'black' },
  ingame_small_chat: { desc: 'sans 8', fg: 'white', bg: 'black' },
};

const PANGO_PIXELS = (d: number): number => (d + 512) >> 10;

export interface TextTrace { line(s: string): void; ticks(): number }

export type GlyphPainter = (s: Surface, text: string, desc: string, color: 'white' | 'black', x: number, xs: number[], h: number) => void;

function hex(s: string): string {
  if (s === '') return '-';
  return Array.from(new TextEncoder().encode(s), (b) => b.toString(16).padStart(2, '0')).join('');
}

export class PangoText implements TextEngine {
  private readonly fonts = new Map<string, FontMetrics>();
  private readonly trace: TextTrace | null;
  private readonly painter: GlyphPainter | null;

  /** painter null: the oracle's placeholder (tests) */
  constructor(painter: GlyphPainter | null, trace: TextTrace | null = null) {
    for (const f of FONTS) this.fonts.set(f.desc, f);
    this.painter = painter;
    this.trace = trace;
  }

  /** the x position of each character and the line's logical width, in Pango units */
  layout(desc: string, text: string): { xs: number[]; width: number } {
    const f = this.fonts.get(desc)!;
    const cps = Array.from(text, (c) => c.codePointAt(0)!);
    const xs: number[] = [];
    let x = 0;
    for (let i = 0; i < cps.length; i++) {
      if (i > 0) x += f.pairs[`${cps[i - 1]},${cps[i]}`] ?? 0;
      xs.push(x);
      x += f.advance[String(cps[i])] ?? f.advance['63'];
    }
    return { xs, width: x };
  }

  size(kind: string, text: string, width: number): [number, number] {
    void width;
    const k = KINDS[kind];
    const f = this.fonts.get(k.desc)!;
    const w = PANGO_PIXELS(this.layout(k.desc, text).width);
    const h = text === '' ? f.emptyHeight : f.lineHeight;
    this.trace?.line(`PW ${this.trace.ticks()} ${hex(text)} ${w} ${h}`);
    return [w, h];
  }

  draw(kind: string, color: 'fg' | 'bg', text: string, width: number, align: string): Surface {
    width = Math.trunc(width) | 0; // the XS function's int parameter
    const k = KINDS[kind];
    const f = this.fonts.get(k.desc)!;
    const lay = this.layout(k.desc, text);
    const lineW = lay.width;
    const lh = text === '' ? f.emptyHeight : f.lineHeight;
    let lx = 0;
    if (width > 0) {
      const W = width * 1024;
      if (align === 'center') lx = Math.trunc((W - lineW) / 2);
      else if (align === 'right') lx = W - lineW;
    }
    const sw = Math.max(width > 0 ? width : PANGO_PIXELS(lineW), width);
    const sh = lh;
    const s = createRGBSurface(0, sw, sh, 32, 0xff000000, 0x00ff0000, 0x0000ff00, 0x000000ff);
    const c = color === 'fg' ? k.fg : k.bg;
    let x = PANGO_PIXELS(lx), w = PANGO_PIXELS(lineW), y = 0, h = lh;
    if (x < 0) { w += x; x = 0; }
    if (x + w > s.w) w = s.w - x;
    if (y + h > s.h) h = s.h - y;
    let rects = '';
    if (w > 0 && h > 0) {
      if (this.painter) this.painter(s, text, k.desc, c, PANGO_PIXELS(lx), lay.xs.map((v) => (lx + v) / 1024), lh);
      else {
        const v = c === 'white' ? 255 : 0;
        fillRect(s, new Rect(x, y, w, h), mapRGB(s.format, v, v, v) | 0xff);
      }
      rects = ` ${x},${y},${w},${h}`;
    }
    this.trace?.line(`P ${this.trace.ticks()} ${hex(text)} ${sw}x${sh}${rects}`);
    return s;
  }
}
