// Liquid War 5.6.6 in the browser. The page side: the screen (an 8-bit bitmap of the video mode the game
// sets, drawn with the current palette into a PixelScreen of that size), the keyboard and mouse as
// Allegro's X11 driver passes them, the samples and MIDI music (al/audio.ts), the settings file in account
// storage, and online play (page/online.ts). The program itself is the port of the C original (lw/) on an
// Allegro 4.4 emulation (al/), running on the original's clock held to real time (al/sys.ts).
import { PixelScreen, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import datUrl from '../assets/lw.dat?url';
import { WebAudioSink } from './al/audio.ts';
import type { Bitmap } from './al/bitmap.ts';
import { load_datafile } from './al/datafile.ts';
import { _handle_key_press, _handle_key_release, keyFromDom } from './al/keyboard.ts';
import { mouse, mouseShown, mouseSprite } from './al/mouse.ts';
import { current_palette, type Palette, RGB_SCALE_6, setOnFade } from './al/palette.ts';
import { screenRef } from './al/screen.ts';
import { soundHooks } from './al/sound.ts';
import { GameExit, sys } from './al/sys.ts';
import { configFile, setConfigText } from './lw/config.ts';
import type { GameFiles } from './lw/disk.ts';
import { exitHooks } from './lw/exit.ts';
import { env } from './lw/lang.ts';
import { lw_main } from './lw/main.ts';
import { G } from './lw/state.ts';
import { Online } from './page/online.ts';

const customUrls = import.meta.glob('../assets/custom/*/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** the settings file (~/.lwrc in the original) in the player's storage */
const CONFIG_NAME = 'liquidwarrc';
/** how long the page shows a palette fade (the original's fade_in/fade_out at speed 32: 1 s / 32 steps * 64 / 32... about this) */
const FADE_MS = 200;

async function fetchBytes(url: string, signal: AbortSignal): Promise<Uint8Array> {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

async function loadFiles(signal: AbortSignal): Promise<GameFiles> {
  const entries = Object.entries(customUrls).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const [dat, ...custom] = await Promise.all([fetchBytes(datUrl, signal), ...entries.map(([, u]) => fetchBytes(u, signal))]);
  const files: GameFiles = { dat: load_datafile(dat!), map: [], texture: [], music: [] };
  entries.forEach(([path], i) => {
    const m = /custom\/(map|texture|music)\/([^/]+)$/.exec(path);
    if (m) files[m[1] as 'map' | 'texture' | 'music'].push([m[2]!, custom[i]!]);
  });
  return files;
}

class LiquidWarPage {
  private readonly ctx: GameContext;
  private readonly host: HTMLElement;
  private readonly message: HTMLDivElement;
  private screen: PixelScreen | null = null;
  private screenStop: AbortController | null = null;
  private image: ImageData | null = null;
  private serial = -1;
  private readonly lut = new Uint32Array(256);
  private fade: { from: Palette; to: Palette; t0: number } | null = null;
  private readonly audio: WebAudioSink;
  readonly online: Online;
  frames = 0;
  running = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.host = host;
    host.style.position = 'relative';
    this.message = document.createElement('div');
    this.message.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;'
      + 'color:#ddd;font:15px system-ui,sans-serif;text-align:center;white-space:pre-wrap;pointer-events:none';
    this.message.textContent = 'Loading Liquid War…';
    host.appendChild(this.message);
    this.audio = new WebAudioSink(ctx.audio);
    this.online = new Online(host, ctx, () => this.releaseAll());
    this.input();
    ctx.frame(() => this.draw());
  }

  async start(): Promise<void> {
    const signal = this.ctx.signal;
    const files = await loadFiles(signal);
    let cfg = '';
    try {
      const b = await this.ctx.storage.get(CONFIG_NAME);
      if (b) cfg = new TextDecoder('latin1').decode(b);
    } catch { /* no server: the defaults, and nothing is saved */ }
    if (signal.aborted) return;
    this.message.textContent = '';

    setConfigText(cfg);
    exitHooks.saveConfig = () => this.saveConfig();
    env.LANG = (navigator.language || 'C').replace('-', '_');
    soundHooks.sink = this.audio;
    soundHooks.trace = null;
    setOnFade((from, to) => {
      this.fade = { from: from.slice(), to: to.slice(), t0: performance.now() };
    });
    this.online.install();
    sys.reset(true);
    sys.signal = signal;
    screenRef.textMode = false;
    this.running = true;
    try {
      await lw_main({ files, time: Math.floor(Date.now() / 1000) });
    } catch (e) {
      if (signal.aborted || sys.stopped) return;
      if (e instanceof GameExit) {
        this.ctx.exit();
        return;
      }
      console.error(e);
      this.message.textContent = `Liquid War stopped:\n${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this.running = false;
    }
  }

  private async saveConfig(): Promise<void> {
    const text = configFile.toString();
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff;
    try {
      await this.ctx.storage.put(CONFIG_NAME, bytes);
    } catch { /* no server or not signed in: as a read-only home directory */ }
  }

  /** the screen bitmap, through the palette, into the canvas */
  private draw(): void {
    if (!this.running && this.serial < 0) return;
    const s = screenRef.screen;
    if (this.serial !== screenRef.serial || !this.screen) {
      this.serial = screenRef.serial;
      this.screenStop?.abort();
      this.screenStop = new AbortController();
      const sig = AbortSignal.any([this.ctx.signal, this.screenStop.signal]);
      this.screen = new PixelScreen(this.host, { width: s.w, height: s.h }, sig);
      this.screen.canvas.style.cursor = 'none';
      this.image = this.screen.ctx.createImageData(s.w, s.h);
    }
    if (screenRef.textMode) return;
    this.frames++;
    let pal: Palette = current_palette;
    if (this.fade) {
      const k = (performance.now() - this.fade.t0) / FADE_MS;
      if (k >= 1) this.fade = null;
      else {
        pal = new Uint8Array(768);
        for (let i = 0; i < 768; i++) pal[i] = Math.round(this.fade.from[i]! + (this.fade.to[i]! - this.fade.from[i]!) * k);
      }
    }
    const lut = this.lut;
    for (let i = 0; i < 256; i++) {
      lut[i] = (0xff000000 | (RGB_SCALE_6[pal[i * 3 + 2]!]! << 16) | (RGB_SCALE_6[pal[i * 3 + 1]!]! << 8) | RGB_SCALE_6[pal[i * 3]!]!) >>> 0;
    }
    const img = this.image!;
    const out = new Uint32Array(img.data.buffer);
    const w = s.w, h = s.h;
    for (let y = 0; y < h; y++) {
      let si = s.base + y * s.stride, di = y * w;
      for (let x = 0; x < w; x++) out[di++] = lut[s.data[si++]!]!;
    }
    if (mouseShown && mouseSprite) this.drawCursor(out, w, h, mouseSprite);
    this.screen!.ctx.putImageData(img, 0, 0);
  }

  /** Allegro's mouse pointer: the sprite with its focus (1, 1) on the mouse, colour 0 transparent */
  private drawCursor(out: Uint32Array, w: number, h: number, b: Bitmap): void {
    const x0 = mouse.x - 1, y0 = mouse.y - 1;
    for (let y = 0; y < b.h; y++) {
      const sy = y0 + y;
      if (sy < 0 || sy >= h) continue;
      for (let x = 0; x < b.w; x++) {
        const sx = x0 + x;
        if (sx < 0 || sx >= w) continue;
        const c = b.data[b.base + y * b.stride + x]!;
        if (c) out[sy * w + sx] = this.lut[c]!;
      }
    }
  }

  private input(): void {
    const signal = this.ctx.signal;
    const host = this.host;
    host.tabIndex = 0;
    host.focus();
    const down = this.down;
    host.addEventListener('keydown', (e) => {
      if (this.online.typing()) return;
      const k = keyFromDom(e);
      if (!k) return;
      e.preventDefault();
      down.add(k.scan);
      _handle_key_press(k.ascii, k.scan);
    }, { signal });
    host.addEventListener('keyup', (e) => {
      const k = keyFromDom(e);
      if (!k) return;
      e.preventDefault();
      down.delete(k.scan);
      _handle_key_release(k.scan);
    }, { signal });
    window.addEventListener('blur', () => this.releaseAll(), { signal });
    // The mouse moves by the pointer's movement, so the game can put it elsewhere (position_mouse) as
    // Allegro warps the X11 pointer; entering the screen puts it under the pointer.
    const clampTo = (x: number, y: number): void => {
      mouse.x = Math.max(0, Math.min(screenRef.screen.w - 1, Math.round(x)));
      mouse.y = Math.max(0, Math.min(screenRef.screen.h - 1, Math.round(y)));
    };
    const scale = (): number => {
      const c = this.screen?.canvas;
      if (!c) return 1;
      const r = c.getBoundingClientRect();
      return r.width ? c.width / r.width : 1;
    };
    const absolute = (e: PointerEvent): void => {
      const p = this.screen?.toPixel(e.clientX, e.clientY);
      if (p) clampTo(p.x, p.y);
    };
    host.addEventListener('pointerenter', absolute, { signal });
    host.addEventListener('pointermove', (e) => {
      if (document.pointerLockElement === host || this.screen?.toPixel(e.clientX, e.clientY)) {
        const k = scale();
        this.subX += e.movementX * k;
        this.subY += e.movementY * k;
        const dx = Math.trunc(this.subX), dy = Math.trunc(this.subY);
        this.subX -= dx;
        this.subY -= dy;
        if (dx || dy) clampTo(mouse.x + dx, mouse.y + dy);
      }
    }, { signal });
    const bit = (b: number): number => (b === 0 ? 1 : b === 2 ? 2 : b === 1 ? 4 : 0);
    host.addEventListener('pointerdown', (e) => {
      host.focus();
      const b = bit(e.button);
      if (!b) return;
      e.preventDefault();
      mouse.b |= b;
    }, { signal });
    window.addEventListener('pointerup', (e) => {
      mouse.b &= ~bit(e.button);
    }, { signal });
    host.addEventListener('wheel', (e) => {
      e.preventDefault();
      mouse.z += e.deltaY < 0 ? 1 : -1;
    }, { signal, passive: false });
    host.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
  }

  /** the keys held down (scancodes) */
  private readonly down = new Set<number>();

  /** lets go of every key and mouse button (the window lost the focus, the lobby opened or closed) */
  private releaseAll(): void {
    for (const scan of this.down) _handle_key_release(scan);
    this.down.clear();
    mouse.b = 0;
  }

  private subX = 0;
  private subY = 0;

  /** what the end-to-end test and the screenshots read */
  state(): string {
    return `w=${screenRef.screen.w} h=${screenRef.screen.h} game=${G.CURRENT_ARMY ? 1 : 0} clock=${G.GLOBAL_CLOCK} teams=${G.PLAYING_TEAMS}`;
  }

  stop(): void {
    sys.stop();
    this.audio.stop();
    this.online.stop();
    setOnFade(null);
    soundHooks.sink = null;
    exitHooks.saveConfig = null;
  }
}

export const start: StartGame = (host, ctx) => {
  const page = new LiquidWarPage(host, ctx);
  (window as unknown as { __lw: unknown }).__lw = {
    frames: () => page.frames,
    state: () => page.state(),
    online: () => page.online.info(),
  };
  page.start().catch((e) => {
    if (!ctx.signal.aborted) console.error(e);
  });
  return { stop: () => page.stop() };
};
