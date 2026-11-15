// Brogue CE's SDL platform (src/platform/sdl2-platform.c and tiles.c) in the browser: the window is a
// canvas filling the page's game area, drawn from tiles.png as tiles.c draws it; the keyboard and the mouse
// become rogueEvents as sdl2-platform.c makes them; pauses and the wait for input take real time as SDL's
// do; the working directory is the player's account storage, and the high-score files are the server's
// score tables.
import { COLS, ROWS, TileSheet, createTextures, paintCells, type Cell, type Texture } from './tiles.ts';
import { commitDraws, refreshScreen, shuffleTerrainColors } from './game/IO.ts';
import { glyphToUnicode, isEnvironmentGlyph } from './game/platformdependent.ts';
import type { BrogueEvent, Platform } from './rt/platform.ts';

const KEYSTROKE = 0, MOUSE_UP = 1, MOUSE_DOWN = 2, RIGHT_MOUSE_DOWN = 3, RIGHT_MOUSE_UP = 4, MOUSE_ENTERED_CELL = 5;
const ESCAPE_KEY = 27, RETURN_KEY = 10, DELETE_KEY = 127, TAB_KEY = 9, PRINTSCREEN_KEY = 44;
const UP_ARROW = 63232, DOWN_ARROW = 63233, LEFT_ARROW = 63234, RIGHT_ARROW = 63235;
const NUMPAD_0 = 48;
const TEXT_GRAPHICS = 0, TILES_GRAPHICS = 1, HYBRID_GRAPHICS = 2;
const G_UP_ARROW = 128, G_DOWN_ARROW = 129;
/** sdl2-platform.c PAUSE_BETWEEN_EVENT_POLLING */
const PAUSE_BETWEEN_EVENT_POLLING = 36;

// platform.h's code points of the non-ASCII glyphs, and their sprites (sdl2-platform.c fontIndex)
const UNICODE_SPRITES: Record<number, number> = {
  0x00b7: 0x80, 0x2237: 0x81, 0x25c7: 0x82, 0x22cf: 0x83, 0x2648: 0x84, 0x00df: 0xdf, 0x2640: 0x85, 0x266a: 0x86,
  0x26aa: 0x87, 0x03df: 0x99, 0x25cf: 0x89, 0x26b2: 0x8a, 0x00da: 0xda, 0x00a4: 0xa4, 0x2191: 0x90, 0x2193: 0x91,
  0x2190: 0x92, 0x2192: 0x93, 0x03a9: 0x96, 0x29f2: 0x8c, 0x29f3: 0x8d, 0x1f780: 0x8e,
};

export interface HostOptions {
  /** a file of the working directory changed (null: removed) */
  fileChanged(path: string, data: Uint8Array | null): void;
  /** may the program create this file? */
  canCreate?(path: string): boolean;
  /** the page is left while the program waits for input or time (the window's close button: SDL_QUIT) */
  quit?(): void;
  /** the screenshot key: a PNG of the window */
  screenshot?(png: Blob): void;
}

/** a key as sdl2-platform.c eventFromKey() and its text input give it to Brogue, or null */
export function keyEvent(e: { key: string; code: string; shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }): number | null {
  switch (e.key) {
    case 'Escape': return ESCAPE_KEY;
    case 'ArrowUp': return UP_ARROW;
    case 'ArrowDown': return DOWN_ARROW;
    case 'ArrowRight': return RIGHT_ARROW;
    case 'ArrowLeft': return LEFT_ARROW;
    case 'Enter': return RETURN_KEY;
    case 'Backspace': return DELETE_KEY;
    case 'Tab': return TAB_KEY;
    case 'PrintScreen': return PRINTSCREEN_KEY;
  }
  // the keypad with a modifier held (SDL gives no text then): its digit
  if ((e.shiftKey || e.ctrlKey) && /^Numpad[0-9]$/.test(e.code)) return NUMPAD_0 + Number(e.code[6]);
  // text input: printable ASCII (SDL sends no text while Control or Alt is held)
  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    const c = e.key.charCodeAt(0);
    if (c >= 32 && c < 127) return c;
  }
  return null;
}

export class BrowserPlatform implements Platform {
  readonly localTime = true;
  readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly sheet: TileSheet;
  private readonly opts: HostOptions;
  private readonly signal: AbortSignal;
  private readonly cells: Cell[] = [];
  /** the glyphs as plotted (for screenText) */
  private readonly glyphs = new Int32Array(COLS * ROWS);
  private readonly dirty = new Set<number>();
  private image: ImageData | null = null;
  private tex: { baseTileWidth: number; baseTileHeight: number; textures: Texture[] } | null = null;
  private outW = 0;
  private outH = 0;
  private resized = true;
  private showGraphics = TEXT_GRAPHICS;
  private readonly queue: BrogueEvent[] = [];
  private lastEvent: BrogueEvent | null = null;
  private wake: (() => void) | null = null;
  private shift = false;
  private ctrl = false;
  private mx = 0;
  private my = 0;
  private lastDelayTime = 0;
  /** the program waits in the platform (where SDL would see SDL_QUIT) */
  private waiting = false;
  /** the page was left and opts.quit() ran (the game saved) */
  private left = false;

  constructor(host: HTMLElement, sheet: TileSheet, signal: AbortSignal, opts: HostOptions) {
    this.sheet = sheet;
    this.opts = opts;
    this.signal = signal;
    for (let i = 0; i < COLS * ROWS; i++) this.cells.push({ fr: 0, fg: 0, fb: 0, br: 0, bg: 0, bb: 0, charIndex: 32 });
    this.canvas = document.createElement('canvas');
    this.canvas.tabIndex = 0;
    Object.assign(this.canvas.style, { width: '100%', height: '100%', display: 'block', outline: 'none', background: '#000', cursor: 'default', touchAction: 'none' });
    host.appendChild(this.canvas);
    this.g = this.canvas.getContext('2d')!;
    const ro = new ResizeObserver(() => {
      this.resized = true;
      this.updateScreen();
    });
    ro.observe(host);
    signal.addEventListener('abort', () => {
      ro.disconnect();
      // waiting in the platform the game is in a state SDL_QUIT may end; otherwise the program is between
      // two of its own awaits and saves when it next comes to the platform (stopped())
      if (this.waiting) this.leave();
      this.wake?.();
    });
    const opt = { signal };
    // the keys of the page's game area only (the website's own fields and buttons keep theirs): the canvas
    // takes the focus at the start and on a click, and the player's game area is focusable
    host.addEventListener('keydown', (e) => this.onKey(e, true), opt);
    host.addEventListener('keyup', (e) => this.onKey(e, false), opt);
    const release = () => {
      this.shift = this.ctrl = false;
    };
    host.addEventListener('focusout', release, opt);
    window.addEventListener('blur', release, opt);
    this.canvas.addEventListener('mousemove', (e) => this.onMouse(e, MOUSE_ENTERED_CELL), opt);
    this.canvas.addEventListener('mousedown', (e) => {
      this.canvas.focus();
      if (e.button === 0) this.onMouse(e, MOUSE_DOWN);
      else if (e.button === 2) this.onMouse(e, RIGHT_MOUSE_DOWN);
    }, opt);
    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.onMouse(e, MOUSE_UP);
      else if (e.button === 2) this.onMouse(e, RIGHT_MOUSE_UP);
    }, opt);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault(), opt);
    this.canvas.focus();
  }

  /** the page was left: the game is saved as SDL_QUIT does (quitImmediately), once */
  private leave(): void {
    if (this.left) return;
    this.left = true;
    try {
      this.opts.quit?.();
    } catch (e) {
      console.warn('saving on leaving failed', e);
    }
  }

  /** the program came to the platform after the page was left: save (if not yet done), then end the program */
  private stopped(): Error {
    this.leave();
    return new Error('stopped');
  }

  // ---- input ----
  private push(ev: BrogueEvent): void {
    this.queue.push(ev);
    this.wake?.();
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    this.shift = e.shiftKey;
    this.ctrl = e.ctrlKey;
    if (!down) return;
    // the browser's own: reload, full screen, developer tools, copy and paste
    if (e.key === 'F5' || e.key === 'F11' || e.key === 'F12' || ((e.ctrlKey || e.metaKey) && /^[cvx]$/i.test(e.key))) return;
    // PageUp/PageDown resize the window in SDL: the page's game area has the size the browser gives it
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      return;
    }
    const k = keyEvent(e);
    if (k === null) return;
    e.preventDefault();
    this.push({ eventType: KEYSTROKE, param1: k, param2: 0, controlKey: e.ctrlKey ? 1 : 0, shiftKey: e.shiftKey ? 1 : 0 });
  }

  private cellAt(e: MouseEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    const x = Math.min(COLS - 1, Math.max(0, Math.floor((e.clientX - r.left) * COLS / r.width)));
    const y = Math.min(ROWS - 1, Math.max(0, Math.floor((e.clientY - r.top) * ROWS / r.height)));
    return [x, y];
  }

  private onMouse(e: MouseEvent, type: number): void {
    this.shift = e.shiftKey;
    this.ctrl = e.ctrlKey;
    const [x, y] = this.cellAt(e);
    if (type === MOUSE_ENTERED_CELL) {
      // only a change of cell counts, and only the last move waiting matters (pollBrogueEvent)
      if (x === this.mx && y === this.my) return;
      this.mx = x;
      this.my = y;
      const last = this.queue[this.queue.length - 1];
      if (last && last.eventType === MOUSE_ENTERED_CELL) this.queue.pop();
    }
    this.push({ eventType: type, param1: x, param2: y, controlKey: e.ctrlKey ? 1 : 0, shiftKey: e.shiftKey ? 1 : 0 });
  }

  private poll(): BrogueEvent | null {
    return this.queue.shift() ?? null;
  }

  private sleep(ms: number): Promise<void> {
    if (this.signal.aborted) return Promise.reject(this.stopped());
    return new Promise((resolve, reject) => {
      const done = () => {
        clearTimeout(t);
        this.wake = null;
        if (this.signal.aborted) reject(this.stopped());
        else resolve();
      };
      const t = setTimeout(done, ms);
      this.wake = done;
    });
  }

  /** _delayUpTo(): waits ms, less the time since the last delay */
  private async delayUpTo(ms: number): Promise<void> {
    const cur = performance.now();
    ms -= cur - this.lastDelayTime;
    if (ms > 0) await this.sleep(ms);
    else if (this.signal.aborted) throw this.stopped();
    else {
      await new Promise<void>((r) => setTimeout(r, 0));
      // left during the yield: saved by the abort (waiting) or here, and the program ends
      if (this.signal.aborted) throw this.stopped();
    }
    this.lastDelayTime = performance.now();
  }

  async pauseForMilliseconds(ms: number, interruptForMouseMove: boolean): Promise<boolean> {
    this.updateScreen();
    this.waiting = true;
    try {
      await this.delayUpTo(ms);
    } finally {
      this.waiting = false;
    }
    if (this.lastEvent && (this.lastEvent.eventType !== MOUSE_ENTERED_CELL || interruptForMouseMove)) return true;
    const ev = this.poll();
    if (ev) {
      this.lastEvent = ev;
      return ev.eventType !== MOUSE_ENTERED_CELL || interruptForMouseMove;
    }
    return false;
  }

  async nextKeyOrMouseEvent(out: BrogueEvent, _textInput: boolean, colorsDance: boolean): Promise<void> {
    this.updateScreen();
    if (this.lastEvent) {
      Object.assign(out, this.lastEvent);
      this.lastEvent = null;
      return;
    }
    for (;;) {
      if (colorsDance) {
        await shuffleTerrainColors(3, 1);
        commitDraws();
      }
      this.updateScreen();
      const ev = this.poll();
      if (ev) {
        Object.assign(out, ev);
        return;
      }
      this.waiting = true;
      try {
        if (colorsDance) await this.delayUpTo(PAUSE_BETWEEN_EVENT_POLLING);
        else await this.waitForInput(PAUSE_BETWEEN_EVENT_POLLING);
      } finally {
        this.waiting = false;
      }
    }
  }

  /** without dancing colours there is nothing to redraw: wait until an event comes (or the time passes) */
  private waitForInput(ms: number): Promise<void> {
    if (this.signal.aborted) return Promise.reject(this.stopped());
    if (this.queue.length) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const done = () => {
        clearTimeout(t);
        this.wake = null;
        this.lastDelayTime = performance.now();
        if (this.signal.aborted) reject(this.stopped());
        else resolve();
      };
      const t = setTimeout(done, ms * 10);
      this.wake = done;
    });
  }

  modifierHeld(m: number): boolean {
    return m === 0 ? this.shift : this.ctrl;
  }

  // ---- output ----
  /** sdl2-platform.c fontIndex(): the sprite of a glyph in the current graphics mode */
  private fontIndex(glyph: number): number {
    if (glyph === G_UP_ARROW) return 0x90;
    if (glyph === G_DOWN_ARROW) return 0x91;
    if (glyph < 128) return glyph;
    if (this.showGraphics === TILES_GRAPHICS || (this.showGraphics === HYBRID_GRAPHICS && isEnvironmentGlyph(glyph))) return glyph + 128 - 2;
    const code = glyphToUnicode(glyph);
    return UNICODE_SPRITES[code] ?? code;
  }

  plotChar(glyph: number, x: number, y: number, fr: number, fg: number, fb: number, br: number, bg: number, bb: number): void {
    const i = y * COLS + x;
    this.glyphs[i] = glyph;
    const c = this.cells[i];
    c.charIndex = this.fontIndex(glyph);
    c.fr = fr; c.fg = fg; c.fb = fb;
    c.br = br; c.bg = bg; c.bb = bb;
    this.dirty.add(i);
  }

  setGraphicsMode(mode: number): number {
    this.showGraphics = mode;
    refreshScreen();
    this.updateScreen();
    return mode;
  }

  /** tiles.c updateScreen(): the cells that changed, painted and shown */
  updateScreen(): void {
    if (this.signal.aborted) return;
    if (this.resized) {
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
      this.resized = false;
      if (w !== this.outW || h !== this.outH || !this.image) {
        this.outW = w;
        this.outH = h;
        this.canvas.width = w;
        this.canvas.height = h;
        const t = createTextures(this.sheet, w, h);
        if (!this.tex || t.baseTileWidth !== this.tex.baseTileWidth || t.baseTileHeight !== this.tex.baseTileHeight) this.tex = t;
        this.image = this.g.createImageData(w, h);
        paintCells(this.sheet, this.tex, this.cells, this.image.data, w, h, null);
        this.dirty.clear();
        this.g.putImageData(this.image, 0, 0);
        return;
      }
    }
    if (!this.dirty.size || !this.image || !this.tex) return;
    paintCells(this.sheet, this.tex, this.cells, this.image.data, this.outW, this.outH, this.dirty);
    let x0 = COLS, x1 = -1, y0 = ROWS, y1 = -1;
    for (const i of this.dirty) {
      const x = i % COLS, y = (i - x) / COLS;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    this.dirty.clear();
    const px0 = Math.floor(x0 * this.outW / COLS), px1 = Math.floor((x1 + 1) * this.outW / COLS);
    const py0 = Math.floor(y0 * this.outH / ROWS), py1 = Math.floor((y1 + 1) * this.outH / ROWS);
    this.g.putImageData(this.image, 0, 0, px0, py0, px1 - px0, py1 - py0);
  }

  /** the screen's characters, row by row (glyphs above 127 as '?'): for the screenshot script */
  screenText(): string {
    const rows: string[] = [];
    for (let y = 0; y < ROWS; y++) {
      let r = '';
      for (let x = 0; x < COLS; x++) {
        const g = this.glyphs[y * COLS + x];
        r += g >= 32 && g < 127 ? String.fromCharCode(g) : g === 0 ? ' ' : '?';
      }
      rows.push(r.trimEnd());
    }
    return rows.join('\n');
  }

  /** is the program waiting for input? */
  get idle(): boolean {
    return this.waiting && !this.queue.length;
  }

  takeScreenshot(): boolean {
    if (!this.opts.screenshot) return false;
    this.canvas.toBlob((b) => b && this.opts.screenshot!(b), 'image/png');
    return true;
  }

  time(): number {
    return Math.floor(Date.now() / 1000);
  }

  fileChanged(path: string, data: Uint8Array | null): void {
    this.opts.fileChanged(path, data);
  }

  canCreate(path: string): boolean {
    return this.opts.canCreate ? this.opts.canCreate(path) : true;
  }

  stderr(bytes: Uint8Array): void {
    console.warn(new TextDecoder('latin1').decode(bytes));
  }
}
