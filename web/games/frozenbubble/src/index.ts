// Frozen Bubble 2.2.0 in the browser. The page side: the 640x480 window (a PixelScreen), the keyboard and
// mouse as SDL 1.2 events, the sounds and musics (audio/), ~/.frozen-bubble in account storage
// (page/home.ts), the text in DejaVu Sans, and online play (page/online.ts). The program itself is the
// port of the Perl original (fb/game.ts, fb/fble.ts) on an SDL 1.2 emulation (sdl/).
import { PixelScreen, playerName, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import packUrl from '../assets/fb-data.bin?url';
import fontRegular from '../assets/fonts/DejaVuSans.ttf?url';
import fontBold from '../assets/fonts/DejaVuSans-Bold.ttf?url';
import fontOblique from '../assets/fonts/DejaVuSans-Oblique.ttf?url';
import { App, type AppPlatform } from './sdl/app.ts';
import { Events, PRESSED, RELEASED, SDLK } from './sdl/events.ts';
import type { Rect, Surface } from './sdl/video.ts';
import { FrozenBubble, type FbHost } from './fb/game.ts';
import { FBLE } from './fb/fble.ts';
import { PangoText, type GlyphPainter } from './fb/pango.ts';
import { PackData } from './fb/pack.ts';
import { StorageHome } from './page/home.ts';
import { WebAudioSink } from './audio/audio.ts';
import { Online } from './page/online.ts';

const soundUrls = import.meta.glob('../assets/snd/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** KeyboardEvent.code -> SDL 1.2 key symbol (US layout, as SDL 1.2 reports keys) */
const CODES: Record<string, number> = {
  Backspace: SDLK.BACKSPACE, Tab: SDLK.TAB, Enter: SDLK.RETURN, NumpadEnter: SDLK.KP_ENTER, Escape: SDLK.ESCAPE,
  Space: SDLK.SPACE, Quote: 39, Comma: 44, Minus: 45, Period: 46, Slash: 47, Semicolon: 59, Equal: 61,
  BracketLeft: 91, Backslash: 92, BracketRight: 93, Backquote: 96, Delete: SDLK.DELETE, Pause: SDLK.PAUSE,
  Numpad0: SDLK.KP0, Numpad1: SDLK.KP1, Numpad2: SDLK.KP2, Numpad3: SDLK.KP3, Numpad4: SDLK.KP4, Numpad5: SDLK.KP5,
  Numpad6: SDLK.KP6, Numpad7: SDLK.KP7, Numpad8: SDLK.KP8, Numpad9: SDLK.KP9, NumpadAdd: SDLK.KP_PLUS,
  NumpadSubtract: SDLK.KP_MINUS, NumpadMultiply: SDLK.KP_MULTIPLY, NumpadDivide: SDLK.KP_DIVIDE, NumpadDecimal: SDLK.KP_PERIOD,
  ArrowUp: SDLK.UP, ArrowDown: SDLK.DOWN, ArrowRight: SDLK.RIGHT, ArrowLeft: SDLK.LEFT, Insert: SDLK.INSERT,
  Home: SDLK.HOME, End: SDLK.END, PageUp: SDLK.PAGEUP, PageDown: SDLK.PAGEDOWN, PrintScreen: SDLK.PRINT,
  F1: SDLK.F1, F2: SDLK.F2, F3: SDLK.F3, F4: SDLK.F4, F5: SDLK.F5, F6: SDLK.F6, F7: SDLK.F7, F8: SDLK.F8,
  F9: SDLK.F9, F10: SDLK.F10, F11: SDLK.F11, F12: SDLK.F12, NumLock: SDLK.NUMLOCK, CapsLock: SDLK.CAPSLOCK,
  ShiftRight: SDLK.RSHIFT, ShiftLeft: SDLK.LSHIFT, ControlRight: SDLK.RCTRL, ControlLeft: SDLK.LCTRL,
  AltRight: SDLK.RALT, AltLeft: SDLK.LALT,
};

function sdlKey(e: KeyboardEvent): number | null {
  const c = e.code;
  if (/^Key[A-Z]$/.test(c)) return c.charCodeAt(3) + 32;
  if (/^Digit\d$/.test(c)) return c.charCodeAt(5);
  return CODES[c] ?? null;
}

/** the character the key types (keysym.unicode), as X11 gives it */
function unicodeOf(e: KeyboardEvent, sym: number): number {
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) return e.key.codePointAt(0)! & 0xffff;
  if (sym === SDLK.BACKSPACE || sym === SDLK.TAB || sym === SDLK.RETURN || sym === SDLK.ESCAPE || sym === SDLK.DELETE) return sym;
  if (sym === SDLK.KP_ENTER) return 13;
  return 0;
}

class Stopped extends Error {}

/** the text's glyphs, drawn by the browser in DejaVu Sans at Pango's positions */
function glyphPainter(): GlyphPainter {
  const cv = document.createElement('canvas');
  const c2 = cv.getContext('2d', { willReadFrequently: true })!;
  return (s, text, desc, color, _x, xs, h) => {
    if (cv.width < s.w || cv.height < s.h) { cv.width = Math.max(cv.width, s.w); cv.height = Math.max(cv.height, s.h); }
    c2.clearRect(0, 0, cv.width, cv.height);
    const m = /^sans( italic)?\s+(\d+)( bold)?$/.exec(desc)!;
    const px = Number(m[2]) * 96 / 72;
    c2.font = `${m[1] ? 'italic ' : ''}${m[3] ? 'bold ' : ''}${px}px "FB DejaVu Sans"`;
    c2.fillStyle = '#fff';
    c2.textBaseline = 'alphabetic';
    const ascent = px * 0.928;
    const chars = Array.from(text);
    chars.forEach((ch, i) => c2.fillText(ch, xs[i], ascent));
    const img = c2.getImageData(0, 0, s.w, Math.min(s.h, h));
    const rgb = color === 'white' ? 0xffffff00 : 0;
    for (let i = 0; i < s.w * Math.min(s.h, h); i++) {
      const a = img.data[i * 4 + 3];
      if (a) s.u32[i] = (rgb | a) >>> 0;
    }
  };
}

class FrozenBubblePage {
  private readonly ctx: GameContext;
  private readonly screen: PixelScreen;
  private readonly image: ImageData;
  private readonly message: HTMLDivElement;
  private readonly queue: (() => void)[] = [];
  private dirty = false;
  private t0 = performance.now();
  private game: FrozenBubble | null = null;
  private home: StorageHome;
  private audio: WebAudioSink;
  readonly online: Online;
  frames = 0;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.screen = new PixelScreen(host, { width: 640, height: 480 }, ctx.signal);
    this.image = this.screen.ctx.createImageData(640, 480);
    this.message = document.createElement('div');
    this.message.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;'
      + 'color:#ddd;font:15px system-ui,sans-serif;text-align:center;white-space:pre-wrap;pointer-events:none';
    this.message.textContent = 'Loading Frozen Bubble…';
    host.style.position = 'relative';
    host.appendChild(this.message);
    this.home = new StorageHome(ctx.storage);
    this.home.onError = (path, e) => {
      if (!ctx.signal.aborted) this.say(`${path} was not saved on the server: ${e instanceof Error ? e.message : String(e)}`, 5000);
    };
    const urls: Record<string, string> = {};
    for (const [k, v] of Object.entries(soundUrls)) urls[k.replace(/.*\//, '')] = v;
    this.audio = new WebAudioSink(ctx.audio, urls);
    this.online = new Online(host, ctx, () => this.app?.ticks() ?? 0);
    this.input(host);
    ctx.frame(() => this.draw());
  }

  private app: App | null = null;
  private sayUntil = 0;

  say(text: string, ms: number): void {
    this.message.textContent = text;
    this.sayUntil = performance.now() + ms;
  }

  async start(): Promise<void> {
    const signal = this.ctx.signal;
    const fonts = [[fontRegular, 'normal', 'normal'], [fontBold, 'normal', 'bold'], [fontOblique, 'italic', 'normal']] as const;
    const fontLoads = fonts.map(async ([url, style, weight]) => {
      const f = new FontFace('FB DejaVu Sans', `url(${url})`, { style, weight });
      await f.load();
      document.fonts.add(f);
    });
    const r = await fetch(packUrl, { signal });
    if (!r.ok) throw new Error(`the game's data could not be loaded (${r.status})`);
    const pack = new PackData(new Uint8Array(await r.arrayBuffer()));
    try { await this.home.load(); } catch { /* no server: nothing is saved, as on a read-only disk */ }
    await Promise.all(fontLoads).catch(() => {});
    void this.audio.load(signal);
    if (signal.aborted) return;
    this.message.textContent = '';

    const platform: AppPlatform = {
      ticks: () => Math.floor(performance.now() - this.t0),
      delay: (ms) => new Promise<void>((resolve, reject) => {
        if (signal.aborted) { reject(new Stopped()); return; }
        const t = setTimeout(() => (signal.aborted ? reject(new Stopped()) : resolve()), Math.max(0, ms));
        signal.addEventListener('abort', () => { clearTimeout(t); reject(new Stopped()); }, { once: true });
      }),
      sleep: (s) => platform.delay(s * 1000),
      time: () => Math.floor(Date.now() / 1000),
      pump: () => { while (this.queue.length) this.queue.shift()!(); },
      present: (s, rects) => this.present(s, rects),
      toggleFullscreen: () => {
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
        else void this.screen.canvas.parentElement?.requestFullscreen?.().catch(() => {});
      },
      showCursor: (on) => { this.screen.canvas.style.cursor = on ? 'default' : 'none'; },
      sink: this.audio,
    };
    const app = this.app = new App(platform);
    const host: FbHost = {
      app,
      text: new PangoText(glyphPainter()),
      home: this.home,
      data: pack,
      user: playerName() || 'player',
      exit: () => { void this.home.flush().then(() => this.ctx.exit()); },
      makeEditor: (g) => new FBLE(g),
      online: this.online,
    };
    const game = this.game = new FrozenBubble(host);
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    game.rand.srand(seed);
    try {
      await game.run();
    } catch (e) {
      if (e instanceof Stopped || signal.aborted) return;
      console.error(e);
      this.message.textContent = `Frozen Bubble stopped:\n${e instanceof Error ? e.message : String(e)}`;
    }
  }

  /** a screen update: the changed part of the screen into the canvas' image */
  private present(s: Surface, rects: Rect[] | null): void {
    this.frames++;
    const d = this.image.data;
    const copy = (x0: number, y0: number, w: number, h: number): void => {
      for (let y = y0; y < y0 + h; y++) {
        let si = (y * s.pitch >> 2) + x0, di = (y * 640 + x0) * 4;
        for (let x = 0; x < w; x++, si++, di += 4) {
          const p = s.u32[si];
          d[di] = (p >>> 16) & 255; d[di + 1] = (p >>> 8) & 255; d[di + 2] = p & 255; d[di + 3] = 255;
        }
      }
    };
    if (rects === null) copy(0, 0, 640, 480);
    else {
      for (const r of rects) {
        let { x, y, w, h } = r;
        if (w === 0 && h === 0 && x === 0 && y === 0) { w = 640; h = 480; }
        const x1 = Math.max(0, x), y1 = Math.max(0, y), x2 = Math.min(640, x + w), y2 = Math.min(480, y + h);
        if (x2 > x1 && y2 > y1) copy(x1, y1, x2 - x1, y2 - y1);
      }
    }
    this.dirty = true;
  }

  private draw(): void {
    if (this.sayUntil && performance.now() > this.sayUntil) { this.sayUntil = 0; this.message.textContent = ''; }
    if (!this.dirty) return;
    this.dirty = false;
    this.screen.ctx.putImageData(this.image, 0, 0);
  }

  private post(f: (ev: Events) => void): void {
    const app = this.app;
    if (app) this.queue.push(() => f(app.events));
  }

  private input(host: HTMLElement): void {
    const signal = this.ctx.signal;
    const canvas = this.screen.canvas;
    host.tabIndex = 0;
    host.focus();
    const down = new Set<number>();
    host.addEventListener('keydown', (e) => {
      if (this.online.typing()) return;
      const sym = sdlKey(e);
      if (sym === null) return;
      e.preventDefault();
      if (e.repeat) return; // SDL 1.2 makes its own repeats (SDL_EnableKeyRepeat)
      down.add(sym);
      const u = unicodeOf(e, sym);
      this.post((ev) => ev.privateKeyboard(PRESSED, sym, u));
    }, { signal });
    host.addEventListener('keyup', (e) => {
      const sym = sdlKey(e);
      if (sym === null) return;
      e.preventDefault();
      down.delete(sym);
      this.post((ev) => ev.privateKeyboard(RELEASED, sym, 0));
    }, { signal });
    window.addEventListener('blur', () => {
      for (const sym of down) this.post((ev) => ev.privateKeyboard(RELEASED, sym, 0));
      down.clear();
    }, { signal });
    const pos = (e: PointerEvent): [number, number] => {
      const r = canvas.getBoundingClientRect();
      return [Math.max(0, Math.min(639, Math.floor((e.clientX - r.left) / r.width * 640))),
        Math.max(0, Math.min(479, Math.floor((e.clientY - r.top) / r.height * 480)))];
    };
    const sdlButton = (b: number): number => (b === 0 ? 1 : b === 1 ? 2 : b === 2 ? 3 : 0);
    canvas.addEventListener('pointermove', (e) => { const [x, y] = pos(e); this.post((ev) => ev.privateMouseMotion(0, x, y)); }, { signal });
    canvas.addEventListener('pointerdown', (e) => {
      host.focus();
      const [x, y] = pos(e);
      const b = sdlButton(e.button);
      if (!b) return;
      e.preventDefault();
      this.post((ev) => {
        if (ev.mouseX !== x || ev.mouseY !== y) ev.privateMouseMotion(0, x, y);
        ev.privateMouseButton(PRESSED, b, x, y);
      });
    }, { signal });
    window.addEventListener('pointerup', (e) => {
      const b = sdlButton(e.button);
      if (!b) return;
      const [x, y] = pos(e);
      this.post((ev) => ev.privateMouseButton(RELEASED, b, x, y));
    }, { signal });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
  }

  /** what the end-to-end test and the screenshots read */
  state(): string {
    const g = this.game;
    if (!g) return '';
    const p = g.PLAYERS.map((q) => `${q}:${g.pdata[q].state}:${String(g.pdata[q].score)}:${(g.sticked_bubbles[q] ?? []).length}`).join(' ');
    return `state=${g.gstate || '-'} level=${String(g.levels.current)} players=${p}`;
  }

  /** the players' nicks and victories in a network game, by nick */
  scores(): string {
    const g = this.game;
    if (!g) return '';
    return g.PLAYERS.map((q) => `${g.pdata[q].nick ?? q}:${String(g.pdata[q].score)}`).sort().join(',');
  }

  stop(): void { this.online.stop(); }
}

export const start: StartGame = (host, ctx) => {
  const page = new FrozenBubblePage(host, ctx);
  (window as unknown as { __fb: unknown }).__fb = {
    frames: () => page.frames,
    state: () => page.state(),
    online: () => page.online.info(),
    scores: () => page.scores(),
  };
  page.start().catch((e) => { if (!ctx.signal.aborted) console.error(e); });
  return { stop: () => page.stop() };
};
