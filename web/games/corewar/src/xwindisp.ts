// xwindisp.c: the X11 display of the reference build, in the browser. The window's graphics (warrior
// names, process meters, cycle meter, the core arena, the menu line) are drawn as X draws them, pixel
// for pixel at the window's size, into a canvas; the window's text panel below them, where cdb reads
// and writes (with its two panels for "switch" and "close"), is the SDK's TextScreen, one character
// cell per X character position. Keys and clicks are the X events: digits, < > d c r q Esc while
// the battle runs; in cdb, special keys and mouse buttons become macro commands (" m up", " m mousel").
import { TextScreen, BOLD, type KeyInput } from '../../../src/sdk/index.ts';
import { g, STEP, RESET, USERABORT, SPEEDLEVELS, loopDelayAr, keyDelayAr, MAXWARRIOR } from './global.ts';
import { Exit, errout } from './host.ts';
import type { XDisplay, Layout } from './display.ts';
import { layout, window_size, font_metrics } from './display.ts';
import * as S from './str_eng.ts';
import { CDB_PROMPT } from './cdb.ts';
import { sprintf } from './libc.ts';

/* X names of the colours (rgb.txt) */
const RGB: Record<string, number> = {
  black: 0x000000, blue3: 0x0000cd, green3: 0x00cd00, cyan3: 0x00cdcd, red3: 0xcd0000, magenta3: 0xcd00cd,
  yellow3: 0xcdcd00, 'light gray': 0xd3d3d3, gray: 0xbebebe, blue1: 0x0000ff, green1: 0x00ff00, cyan1: 0x00ffff,
  red1: 0xff0000, magenta1: 0xff00ff, yellow1: 0xffff00, white: 0xffffff, gray60: 0x999999, gray70: 0xb3b3b3,
  gray80: 0xcccccc, gray90: 0xe5e5e5,
};
/* ANSI 16-colour palette */
const xColorNames = ['black', 'blue3', 'green3', 'cyan3', 'red3', 'magenta3', 'yellow3', 'light gray',
  'gray', 'blue1', 'green1', 'cyan1', 'red1', 'magenta1', 'yellow1', 'white'];
/* grey scale displays (-v 1xxx) */
const xGrayScaleNames = ['black', 'gray60', 'white', 'white', 'gray60', 'gray90', 'gray70', 'white',
  'gray80', 'gray60', 'gray90', 'gray80', 'gray70', 'gray70', 'gray80', 'white'];
/* b&w only displays (-v 2xxx) */
const xBWColorNames = ['black', ...new Array<string>(15).fill('white')];
export const xColorRGB = (i: number, type = 0): number => RGB[(type === 1 ? xGrayScaleNames : type >= 2 ? xBWColorNames : xColorNames)[i]];

const BLACK = 0, WHITE = 15, GREEN = 2, RED = 4, LIGHTRED = 12, YELLOW = 14;

/* X keysyms of the keys pMARS looks at */
const XK: Record<string, number> = {
  Enter: 0xff0d, Backspace: 0xff08, Escape: 0xff1b, Tab: 0xff09, Delete: 0xffff, Insert: 0xff63, Home: 0xff50,
  ArrowLeft: 0xff51, ArrowUp: 0xff52, ArrowRight: 0xff53, ArrowDown: 0xff54, PageUp: 0xff55, PageDown: 0xff56,
  End: 0xff57, Clear: 0xff58, F1: 0xffbe, F2: 0xffbf, F3: 0xffc0, F4: 0xffc1, F5: 0xffc2, F6: 0xffc3, F7: 0xffc4,
  F8: 0xffc5, F9: 0xffc6, F10: 0xffc7, F11: 0xffc8, F12: 0xffc9,
};
const XK_Return = 0xff0d, XK_BackSpace = 0xff08, XK_Escape = 0xff1b;

/** conv_key(): the key as pMARS sees it (an ASCII char, else the keysym), and the modifiers */
export function conv_key(k: KeyInput): { key: number; ctrl: boolean; alt: boolean } {
  const ctrl = k.ctrl, alt = k.alt;
  if ([...k.key].length === 1) return { key: k.key.charCodeAt(0) <= 0xffff ? k.key.charCodeAt(0) : 0, ctrl, alt };
  return { key: XK[k.key] ?? 0, ctrl, alt };
}

/** special_keys(): the macro command a function, control or alt key stands for, or null */
export function special_keys(key: number, ctrl: boolean, alt: boolean): string | null {
  if (ctrl && key < 128) return sprintf(' m ctrl-%c\n', key);
  if (alt && key < 128) return sprintf(' m alt-%c\n', key);
  const names: Record<number, string> = {
    [XK.Tab]: 'ctrl-i', [XK.Insert]: 'ins', [XK.Delete]: 'del', [XK.ArrowUp]: 'up', [XK.ArrowDown]: 'down',
    [XK.ArrowLeft]: 'left', [XK.ArrowRight]: 'right', [XK.PageUp]: 'pgup', [XK.PageDown]: 'pgdn', [XK.Clear]: 'home',
    [XK.End]: 'end', [XK.F1]: 'f1', [XK.F2]: 'f2', [XK.F3]: 'f3', [XK.F4]: 'f4', [XK.F5]: 'f5', [XK.F6]: 'f6',
    [XK.F7]: 'f7', [XK.F8]: 'f8', [XK.F9]: 'f9', [XK.F10]: 'f10', [XK.F11]: 'f11', [XK.F12]: 'f12',
  };
  return names[key] ? ` m ${names[key]}\n` : null;
}

/** a bitmap font: glyphs rasterized once from the browser's monospace font at the X font's size */
class Font {
  readonly width: number;
  readonly ascent: number;
  readonly descent: number;
  private glyphs = new Map<string, Uint8Array>();
  private ctx: CanvasRenderingContext2D | null;
  constructor(m: { width: number; ascent: number; descent: number }) {
    this.width = m.width;
    this.ascent = m.ascent;
    this.descent = m.descent;
    const c = document.createElement('canvas');
    c.width = m.width * 2;
    c.height = m.ascent + m.descent;
    this.ctx = c.getContext('2d', { willReadFrequently: true });
  }
  glyph(ch: string): Uint8Array {
    let gl = this.glyphs.get(ch);
    if (gl) return gl;
    const w = this.width, h = this.ascent + this.descent;
    gl = new Uint8Array(w * h);
    const x = this.ctx;
    if (x) {
      x.clearRect(0, 0, w * 2, h);
      x.fillStyle = '#fff';
      x.textBaseline = 'alphabetic';
      x.font = `${h}px "DejaVu Sans Mono", "Liberation Mono", ui-monospace, monospace`;
      const mw = x.measureText('M').width;
      x.save();
      x.scale(w / mw, 1);
      x.fillText(ch, 0, this.ascent);
      x.restore();
      const d = x.getImageData(0, 0, w, h).data;
      for (let i = 0; i < w * h; i++) gl[i] = d[i * 4 + 3] > 110 ? 1 : 0;
    }
    this.glyphs.set(ch, gl);
    return gl;
  }
}

export interface XWindowOptions {
  signal: AbortSignal;
  /** the game's frame loop (ctx.frame) */
  frame: (cb: (time: number, dt: number) => void, signal?: AbortSignal) => void;
  /** the window opened (shown) and closed */
  onOpen?: (root: HTMLElement) => void;
  onClose?: () => void;
  /** online battles: no debugger (the battle must be the same for everyone) */
  noDebugger?: boolean;
}

/** The X window. One per run of pMARS: display_init() opens it, display_close() closes it. */
export class XWindow implements XDisplay {
  private host: HTMLElement;
  private o: XWindowOptions;
  private root: HTMLElement | null = null;
  private c2d: CanvasRenderingContext2D | null = null;
  private img: ImageData | null = null;
  private px = new Uint32Array(0);
  private dirty = false;
  private screen: TextScreen | null = null;
  private closed = new AbortController();
  private font!: Font;
  private xColors: number[] = [];
  private xDim = 640;
  private yDim = 480;
  private L!: Layout;
  private colors = new Array<number>(MAXWARRIOR).fill(0);
  private datcolors = new Array<number>(MAXWARRIOR).fill(0);
  private fg = 0xffffff;
  /* the text panel in character cells: current panel's first and last column, cursor, saved cursors */
  private cols = 70;
  private rows = 14;
  private c0 = 0;
  private c1 = 69;
  private posx = 0;
  private posy = 0;
  private pos1 = [0, 0];
  private pos2 = [0, 0];
  private point = 0;
  /* the battle's pace */
  private due = 0;
  private lastYield = 0;
  private sinceCheck = 0;
  private pendingKey: Promise<KeyInput> | null = null;
  private clicks: { button: number; x: number; y: number }[] = [];
  private clickWaiter: (() => void) | null = null;
  textLines = 14;

  constructor(host: HTMLElement, o: XWindowOptions) {
    this.host = host;
    this.o = o;
  }

  /* ---------------------------------------------------------------- drawing (Xlib on a pixel buffer) */

  private setcolor(c: number): void {
    this.fg = this.xColors[c];
  }
  private fill(x: number, y: number, w: number, h: number, rgb = this.fg): void {
    const W = this.xDim, H = this.yDim, p = this.px;
    const v = 0xff000000 | ((rgb & 0xff) << 16) | (rgb & 0xff00) | ((rgb >> 16) & 0xff);
    const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(W, x + w), y1 = Math.min(H, y + h);
    for (let yy = y0; yy < y1; yy++) p.fill(v, yy * W + x0, yy * W + x1);
    this.dirty = true;
  }
  private point_(x: number, y: number, rgb = this.fg): void {
    this.fill(x, y, 1, 1, rgb);
  }
  /** XDrawLine, horizontal (the only kind pMARS draws), both ends included */
  private hline(x1: number, x2: number, y: number, rgb = this.fg): void {
    if (x2 < x1) [x1, x2] = [x2, x1];
    this.fill(x1, y, x2 - x1 + 1, 1, rgb);
  }
  /** XDrawRectangle: the outline of a (w+1) x (h+1) box */
  private rect(x: number, y: number, w: number, h: number, rgb: number): void {
    this.fill(x, y, w + 1, 1, rgb);
    this.fill(x, y + h, w + 1, 1, rgb);
    this.fill(x, y, 1, h + 1, rgb);
    this.fill(x + w, y, 1, h + 1, rgb);
  }
  /** xWin_outtextxy(): XDrawString with the top-left corner at (x, y) */
  private text(x: number, y: number, s: string): void {
    const f = this.font, h = f.ascent + f.descent, W = this.xDim, p = this.px;
    const rgb = this.fg, v = 0xff000000 | ((rgb & 0xff) << 16) | (rgb & 0xff00) | ((rgb >> 16) & 0xff);
    for (const ch of s) {
      const gl = f.glyph(ch);
      for (let yy = 0; yy < h; yy++) {
        const py = y + yy;
        if (py < 0 || py >= this.yDim) continue;
        for (let xx = 0; xx < f.width; xx++) {
          const pxx = x + xx;
          if (gl[yy * f.width + xx] && pxx >= 0 && pxx < W) p[py * W + pxx] = v;
        }
      }
      x += f.width;
    }
    this.dirty = true;
  }
  /** xWin_cleartextxy(): a character cell filled with the GC's colour */
  private cleartext(x: number, y: number, rgb: number): void {
    this.fill(x, y, this.font.width + 1, this.font.ascent + this.font.descent + 1, rgb);
  }
  private present(): void {
    if (!this.dirty || !this.c2d || !this.img) return;
    this.dirty = false;
    this.c2d.putImageData(this.img, 0, 0, 0, 0, this.xDim, this.L.grwindy0);
  }

  private xkoord(addr: number): number {
    return this.L.leftUpperX + (addr % this.L.verticalSize) * (this.L.size + 1);
  }
  private ykoord(addr: number): number {
    return this.L.leftUpperY + Math.trunc(addr / this.L.verticalSize) * (this.L.size + 1);
  }

  /* ---------------------------------------------------------------- opening and closing */

  async open_graphics(): Promise<void> {
    let [xsize, ysize] = window_size(g.displayMode);
    const geometry = g.xStorage[1];
    if (geometry !== null) [xsize, ysize] = this.parse_geometry(geometry, xsize, ysize);
    this.xDim = xsize;
    this.yDim = ysize;
    this.font = new Font(font_metrics(xsize));
    this.alloc_colors();
    if (g.warriors <= 2) {
      this.colors[0] = GREEN;
      this.colors[1] = LIGHTRED;
      this.datcolors[0] = GREEN + 1;
      this.datcolors[1] = LIGHTRED + 1;
    } else for (let i = 0; i < MAXWARRIOR; i++) this.datcolors[i] = this.colors[i] = (i % 15) + 1;
    this.graphio_init();
    this.build();
    this.redraw();
    this.o.onOpen?.(this.root!);
    this.lastYield = performance.now();
    this.due = this.lastYield;
  }

  /** parse_geometry(): WxH[+-X+-Y]; the position cannot be chosen in a browser */
  private parse_geometry(geo: string, w: number, h: number): [number, number] {
    const bad = (): never => {
      errout(S.invalidGeom);
      throw new Exit(1);
    };
    if (geo[0] !== '+' && geo[0] !== '-') {
      const m = /^(\d+)x(\d+)([+-].*)?$/.exec(geo);
      if (!m) bad();
      w = Math.max(320, Number(m![1]));
      h = Math.max(200, Number(m![2]));
      geo = m![3] ?? '';
      if (!geo) return [w, h];
    }
    if (!/^[+-]\d+[+-]\d+$/.test(geo)) bad();
    return [w, h];
  }

  private alloc_colors(): void {
    /* a colour display; -v 1xxx asks for grey scale, 2xxx for black and white */
    this.xColors = xColorNames.map((_n, i) => xColorRGB(i, g.xDisplayType));
  }

  private graphio_init(): void {
    this.L = layout(this.xDim, this.yDim, this.font, g.warriors, g.coreSize, g.cycles, g.taskNum);
    this.textLines = this.L.textLines;
    const hs = this.font.width;
    /* the text panel: X positions grwindx0 + k*horizspace while not past grwindx1 - horizspace */
    this.cols = Math.trunc((this.xDim - hs - hs - 1) / hs) + 1;
    this.rows = Math.max(1, Math.trunc((this.L.grwindy1 - this.L.grwindy0) / (this.font.ascent + this.font.descent)) + 1);
  }

  /** the page elements: the canvas (window graphics) and the text panel under it, in the window's proportions */
  private build(): void {
    this.closed.abort();
    this.closed = new AbortController();
    this.root?.remove();
    const root = document.createElement('div');
    root.className = 'cw-xwin';
    const canvas = Object.assign(document.createElement('canvas'), { width: this.xDim, height: this.L.grwindy0 });
    canvas.className = 'cw-xwin-gfx';
    const panel = document.createElement('div');
    panel.className = 'cw-xwin-panel';
    root.append(canvas, panel);
    this.host.append(root);
    const fit = () => {
      const bw = this.host.clientWidth, bh = this.host.clientHeight;
      const scale = Math.max(0.1, Math.min(bw / this.xDim, bh / this.yDim));
      root.style.width = `${Math.floor(this.xDim * scale)}px`;
      root.style.height = `${Math.floor(this.yDim * scale)}px`;
      canvas.style.height = `${(this.L.grwindy0 / this.yDim) * 100}%`;
      panel.style.height = `${(1 - this.L.grwindy0 / this.yDim) * 100}%`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(this.host);
    fit();
    const signal = AbortSignal.any([this.o.signal, this.closed.signal]);
    signal.addEventListener('abort', () => { ro.disconnect(); root.remove(); }, { once: true });
    this.root = root;
    this.c2d = canvas.getContext('2d')!;
    this.img = this.c2d.createImageData(this.xDim, this.yDim);
    this.px = new Uint32Array(this.img.data.buffer);
    this.px.fill(0xff000000);
    this.screen = new TextScreen(panel, { cols: this.cols, rows: this.rows, background: '#000', foreground: '#fff' }, signal);
    this.screen.showCursor(false);
    this.pendingKey = null;
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * this.xDim), y = Math.floor(((e.clientY - r.top) / r.height) * this.L.grwindy0);
      /* X buttons: 1 left, 2 middle, 3 right */
      this.clicks.push({ button: e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : 0, x, y });
      this.clickWaiter?.();
      this.screen?.focus();
    }, { signal });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    this.o.frame(() => this.present(), signal);
  }

  private redraw(): void {
    this.px.fill(0xff000000);
    this.dirty = true;
    this.draw_border();
    this.setcolor(WHITE);
    this.write_menu();
    this.display_clear();
    g.curPanel = -1; /* one panel only */
    this.update(0);
    this.clear();
    this.write_names();
    if (g.inCdb) {
      this.point = 0;
      this.puts(CDB_PROMPT);
    }
  }

  private draw_border(): void {
    const L = this.L, bw = 3;
    const x = L.leftUpperX - bw, y = L.leftUpperY - bw;
    const w = this.xkoord(L.verticalSize - 1) + bw - x + L.size;
    const h = this.ykoord(g.coreSize) + bw - y + L.size;
    this.rect(x, y, w, h, this.xColors[WHITE]);
  }

  private write_names(): void {
    if (g.warriors <= 2) {
      this.setcolor(this.colors[0]);
      this.text(1, 0, g.warrior[0].name ?? '');
      if (g.warriors === 2) {
        this.setcolor(this.colors[1]);
        this.text(Math.trunc(this.xDim / 2), 0, g.warrior[1].name ?? '');
      }
    }
  }

  async display_close(wait: boolean): Promise<void> {
    if (!this.root) return;
    if (wait) {
      this.puts(S.pressAnyKey);
      this.screen?.showCursor(true);
      await this.getch();
    }
    this.present();
    this.closed.abort();
    this.root = null;
    this.o.onClose?.();
  }

  resize(): void {
    const [x, y] = window_size(g.displayMode);
    if (x === this.xDim && y === this.yDim) return;
    /* XResizeWindow, then the ConfigureNotify: graphio_init() and redraw() */
    this.xDim = x;
    this.yDim = y;
    this.font = new Font(font_metrics(this.xDim));
    this.graphio_init();
    this.build();
    this.redraw();
  }

  /* ---------------------------------------------------------------- the menu line */

  write_menu(): void {
    if (!this.root) return;
    const hs = this.font.width;
    const y = this.ykoord(g.coreSize) + 3 + this.L.size + 2;
    let i: number, j: number;
    this.setcolor(WHITE);
    this.text(0, y, '<');
    this.setcolor(RED);
    for (i = 0; i < SPEEDLEVELS - g.displaySpeed; i++) this.cleartext((i + 1) * (hs + 2), y, this.fg);
    this.setcolor(YELLOW);
    for (j = 0; j < g.displaySpeed; j++) this.cleartext((i + j + 1) * (hs + 2), y, this.fg);
    this.setcolor(WHITE);
    this.text((i + j + 1) * (hs + 2), y, '> ');
    for (i = 0; i < 5; i++) {
      this.setcolor(g.displayLevel === i ? RED : WHITE);
      this.cleartext((i + 15) * (hs + 2), y, this.xColors[BLACK]);
      this.text((i + 15) * (hs + 2), y, `${i} `);
    }
    this.setcolor(g.inCdb ? RED : WHITE);
    this.text((i + 18) * (hs + 2), y, '[D]ebug ');
    if (this.xDim > 400) {
      this.setcolor(g.inCdb ? BLACK : WHITE);
      /* X draws over what is there: in black it disappears only where white was */
      if (g.inCdb) this.fill((i + 26) * (hs + 2), y, 15 * hs, this.font.ascent + this.font.descent, this.xColors[BLACK]);
      else this.text((i + 26) * (hs + 2), y, '[C]lear  [Q]uit');
    }
    this.setcolor(WHITE);
  }

  /* ---------------------------------------------------------------- the core display */

  private clear_arena(): void {
    const L = this.L, bw = 3;
    const x = L.leftUpperX - bw + 1, y = L.leftUpperY - bw + 1;
    this.fill(x, y, this.xkoord(L.verticalSize - 1) + bw - x + L.size, this.ykoord(g.coreSize) + bw - y + L.size, this.xColors[BLACK]);
  }

  display_clear(): void {
    if (!this.root) return;
    const L = this.L;
    this.clear_arena();
    for (let i = 0; i < g.warriors; i++) {
      this.hline(0, this.xDim, L.splY[i], this.xColors[BLACK]);
      this.setcolor(this.colors[i]);
      this.point_(1 + Math.trunc(g.taskNum / L.processRatio), L.splY[i]);
      this.hline(1, Math.trunc(g.warrior[i].tasks / L.processRatio), L.splY[i]);
    }
    this.hline(1, this.xDim, L.cycleY, this.xColors[BLACK]);
    this.hline(1, Math.trunc(g.cycle / L.cycleRatio), L.cycleY, this.xColors[WHITE]);
  }

  display_cycle(): boolean {
    if (!this.root) return false;
    let need = false;
    if (!g.inputRedirection && this.screen?.keyWaiting()) need = true;
    if (!(g.cycle & g.keyDelay)) this.point_(Math.trunc(g.cycle / this.L.cycleRatio), this.L.cycleY, this.xColors[BLACK]);
    /* usleep(loopDelay) for the slower speeds; otherwise a frame now and then */
    if (g.loopDelay > 1) {
      this.due += g.loopDelay / 1000;
      if (this.due - performance.now() > 8) need = true;
    } else if (++this.sinceCheck >= 512) {
      this.sinceCheck = 0;
      const now = performance.now();
      if (now - this.lastYield > 14) need = true;
      this.due = now;
    }
    return need;
  }

  async pause(): Promise<void> {
    const signal = this.o.signal;
    if (signal.aborted) throw new Exit(USERABORT);
    /* a key pressed in the window (xWin_display_cycle) */
    while (!g.inputRedirection && this.screen?.keyWaiting()) {
      const k = conv_key(await this.screen.readKey());
      await this.cycle_key(k.key);
    }
    const now = performance.now();
    const wait = Math.max(0, this.due - now);
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => requestAnimationFrame(() => resolve()), wait);
      signal.addEventListener('abort', () => { clearTimeout(t); reject(new Exit(USERABORT)); }, { once: true });
    });
    this.lastYield = performance.now();
    if (g.loopDelay <= 1) this.due = this.lastYield;
  }

  private async cycle_key(ch: number): Promise<void> {
    switch (ch) {
      case 0x30: case 0x31: case 0x32: case 0x33: case 0x34:
        g.displayLevel = ch - 0x30;
        break;
      case 0x64: /* d */
        if (!this.o.noDebugger) { /* sighandler(0) */
          g.debugState = STEP;
          g.cmdMod = RESET;
        }
        break;
      case 0x3e: /* > */
        if (g.displaySpeed > 0) {
          --g.displaySpeed;
          g.loopDelay = loopDelayAr[g.displaySpeed];
          g.keyDelay = keyDelayAr[g.displaySpeed];
        }
        break;
      case 0x3c: /* < */
        if (g.displaySpeed < SPEEDLEVELS - 1) {
          ++g.displaySpeed;
          g.loopDelay = loopDelayAr[g.displaySpeed];
          g.keyDelay = keyDelayAr[g.displaySpeed];
        }
        break;
      case 0x20: case 0x63: case 0x72: /* space c r */
        this.clear_arena();
        break;
      case XK_Escape:
      case 0x71: /* q */
        await this.display_close(true);
        throw new Exit(USERABORT);
      default:
        if (ch < 128 && !this.o.noDebugger) g.debugState = STEP;
    }
    this.write_menu();
  }

  display_read(addr: number): void {
    if (!this.root) return;
    this.setcolor(this.colors[g.W]);
    const s = this.L.size;
    this.fill(this.xkoord(addr), this.ykoord(addr), s >> 1, s >> 1);
  }
  display_dec(addr: number): void {
    if (!this.root) return;
    this.setcolor(this.colors[g.W]);
    const s = this.L.size;
    this.fill(this.xkoord(addr), this.ykoord(addr), s, s >> 1);
  }
  display_inc(addr: number): void {
    if (!this.root) return;
    this.setcolor(this.colors[g.W]);
    const s = this.L.size;
    this.fill(this.xkoord(addr), this.ykoord(addr), s >> 1, s);
  }
  display_write(addr: number): void {
    if (!this.root) return;
    this.setcolor(this.colors[g.W]);
    const s = this.L.size, h = s >> 1, x = this.xkoord(addr), y = this.ykoord(addr);
    this.fill(x + h, y, h, h);
    this.fill(x, y + h, h, h);
  }
  display_exec(addr: number): void {
    if (!this.root) return;
    this.setcolor(this.colors[g.W]);
    const s = this.L.size;
    this.fill(this.xkoord(addr), this.ykoord(addr), s, s);
  }
  display_spl(warrior: number, tasks: number): void {
    if (!this.root) return;
    this.setcolor(this.colors[warrior]);
    this.point_(Math.trunc(tasks / this.L.processRatio), this.L.splY[warrior]);
  }
  display_dat(addr: number, warNum: number, tasks: number): void {
    if (!this.root) return;
    if (g.displayLevel > 0) {
      this.setcolor(this.datcolors[warNum]);
      const s = this.L.size;
      this.fill(this.xkoord(addr), this.ykoord(addr), s, s);
    }
    this.point_(Math.trunc(tasks / this.L.processRatio), this.L.splY[warNum], this.xColors[BLACK]);
  }

  /* ---------------------------------------------------------------- the text panel */

  private scrollUp(): void {
    const sc = this.screen!;
    const snap = sc.grid.snapshot();
    for (let r = 0; r < this.rows - 1; r++)
      for (let c = this.c0; c <= this.c1 && c < this.cols; c++) {
        snap.chars[r][c] = snap.chars[r + 1][c];
        snap.attrs[r][c] = snap.attrs[r + 1][c];
      }
    for (let c = this.c0; c <= this.c1 && c < this.cols; c++) {
      snap.chars[this.rows - 1][c] = ' ';
      snap.attrs[this.rows - 1][c] = 0;
    }
    sc.grid.restore(snap);
  }
  private newline(): void {
    this.posx = this.c0;
    if (++this.posy > this.rows - 1) {
      this.posy = this.rows - 1;
      this.scrollUp();
    }
  }
  private newchar(): void {
    if (++this.posx > this.c1) this.newline();
  }
  private cursor(on: boolean): void {
    const sc = this.screen;
    if (!sc) return;
    if (on) sc.moveTo(this.posy, Math.min(this.posx, this.cols - 1));
    sc.showCursor(on);
  }
  private delchar(): void {
    if (this.point) {
      if (--this.posx < this.c0) this.posx = this.c0;
      else --this.point;
      this.screen!.grid.attr = 0;
      this.screen!.writeAt(this.posy, this.posx, ' ');
      this.cursor(true);
    }
  }

  puts(s: string): void {
    if (!this.screen) return;
    /* printAttr: a warrior's colour (the line of its next instruction): bold here */
    this.screen.grid.attr = g.printAttr ? BOLD : 0;
    for (const ch of s) {
      if (ch === '\n') this.newline();
      else {
        this.screen.writeAt(this.posy, Math.min(this.posx, this.cols - 1), ch);
        this.newchar();
      }
    }
    this.screen.grid.attr = 0;
    this.screen.moveTo(this.posy, Math.min(this.posx, this.cols - 1));
  }

  clear(): void {
    if (!this.screen) return;
    this.posx = this.c0;
    this.posy = 0;
    const snap = this.screen.grid.snapshot();
    for (let r = 0; r < this.rows; r++)
      for (let c = this.c0; c <= this.c1 + 1 && c < this.cols; c++) {
        snap.chars[r][c] = ' ';
        snap.attrs[r][c] = 0;
      }
    this.screen.grid.restore(snap);
  }

  /** xWin_update(): one panel (0), or the left (1) or right (2) half */
  update(newcurPanel: number): void {
    if (g.curPanel === newcurPanel) return;
    const half = Math.trunc(this.cols / 2);
    const left = () => { this.c0 = 0; this.c1 = half - 2; };
    const right = () => { this.c0 = half; this.c1 = this.cols - 1; };
    if (g.curPanel === 0 && newcurPanel !== 0) {
      this.pos1 = [this.posx, this.posy];
      right();
      this.clear();
      this.pos2 = [this.posx, this.posy];
      g.curPanel = 2;
    }
    switch (newcurPanel) {
      case 0: /* only one panel */
        if (g.curPanel === 1) this.pos1 = [this.posx, this.posy];
        right();
        this.clear();
        this.c0 = 0;
        this.c1 = this.cols - 1;
        [this.posx, this.posy] = this.pos1;
        break;
      case 1: /* first panel */
        left();
        if (g.curPanel === 2) {
          this.pos2 = [this.posx, this.posy];
          [this.posx, this.posy] = this.pos1;
        }
        break;
      case 2: /* second panel */
        right();
        if (g.curPanel === 1) {
          this.pos1 = [this.posx, this.posy];
          [this.posx, this.posy] = this.pos2;
        } else if (g.curPanel === 0) {
          this.pos1 = [this.posx, this.posy];
          this.clear();
        }
        break;
    }
    g.curPanel = newcurPanel;
  }

  /* ---------------------------------------------------------------- input */

  private key(): Promise<KeyInput> {
    if (!this.pendingKey) this.pendingKey = this.screen!.readKey();
    return this.pendingKey;
  }

  /** xWin_getch(): the next key */
  private async getch(): Promise<number> {
    const k = await this.key();
    this.pendingKey = null;
    return conv_key(k).key;
  }

  /** mouse_or_key(): a click in the arena (then the command for its button) or a key */
  private async mouse_or_key(): Promise<{ mouse: string } | { key: number; ctrl: boolean; alt: boolean }> {
    for (;;) {
      const c = this.clicks.shift();
      if (c) {
        const L = this.L;
        const cmd = c.button === 1 ? ' m mousel\n' : c.button === 2 ? ' m mouser\n' : c.button === 3 ? ' m mousem\n' : null;
        if (!cmd) continue;
        const x = c.x - L.leftUpperX + Math.trunc(L.size / 2), y = c.y - L.leftUpperY + Math.trunc(L.size / 2);
        const mouseLoc = Math.trunc(x / (L.size + 1)) + Math.trunc(y / (L.size + 1)) * L.verticalSize;
        if (x >= 0 && y >= 0 && mouseLoc >= 0 && mouseLoc < g.coreSize) {
          g.curAddr = mouseLoc;
          return { mouse: cmd };
        }
        continue;
      }
      const click = new Promise<null>((resolve) => { this.clickWaiter = () => resolve(null); });
      const k = await Promise.race([this.key(), click]);
      this.clickWaiter = null;
      if (k === null) continue;
      this.pendingKey = null;
      return conv_key(k);
    }
  }

  async gets(maxchar: number): Promise<string | null> {
    if (!this.screen) return null;
    let result = '';
    this.point = 0;
    this.cursor(true);
    let lo = 0;
    do {
      const e = await this.mouse_or_key();
      if ('mouse' in e) {
        this.cursor(false);
        return e.mouse;
      }
      lo = e.key;
      if (lo) {
        const sp = special_keys(lo, e.ctrl, e.alt);
        if (sp !== null) {
          this.cursor(false);
          this.puts(sp);
          return sp;
        }
        switch (lo) {
          case XK_BackSpace:
            this.delchar();
            if (this.point < result.length) result = result.slice(0, this.point);
            break;
          case XK_Escape: {
            /* pMARS loops forever here when the line wrapped (delchar() stops at the panel's edge) */
            let before = -1;
            while (this.point && this.point !== before) { before = this.point; this.delchar(); }
            result = result.slice(0, this.point);
            break;
          }
          case XK_Return:
            this.cursor(false);
            this.newline();
            break;
          default:
            if (lo >= 32 && lo < 128) {
              result += String.fromCharCode(lo);
              this.point++;
              if (this.point > maxchar - 1) lo = XK_Return;
              this.puts(String.fromCharCode(lo === XK_Return ? result.charCodeAt(result.length - 1) : lo));
              if (lo === XK_Return) { this.cursor(false); this.newline(); }
              else this.cursor(true);
            }
        }
      }
    } while (lo !== XK_Return);
    return `${result}\n`;
  }
}
