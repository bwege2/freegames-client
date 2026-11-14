// Chromium B.S.U. 0.9.16.1 on the website (GPL-3.0-or-later for this browser code; the game is
// Mark B. Allan's, Clarified Artistic License, LICENSE.md). The original's game code is ported in
// game/ and runs as MainSDL::run did: one frame every 20 ms (the 50 frames per second the game was
// made for); render/ draws its OpenGL calls with WebGL 2 and plays its OpenAL sounds with Web Audio.
import type { StartGame, GameContext } from '../../../src/sdk/index.ts';
import { playerName } from '../../../src/sdk/net/client.ts';
import { Global, CONFIG_FILE, CONFIG_SCORE_FILE, type Files } from './game/global.ts';
import { MainLoop, type InputEvent, type Key } from './game/loop.ts';
import { SOUND_FILES } from './game/audio.ts';
import { setTitleGeometry } from './game/title.ts';
import { WebGLRenderer } from './render/webgl.ts';
import { ImageLoader, decodePng, type Png } from './render/images.ts';
import { GlcText, GlyphFont } from './render/text.ts';
import { WebAudioBackend } from './render/sound.ts';
import titleUrl from '../assets/title.bin?url';
import fontUrl from '../assets/font/GOTHUB__.TTF?url';

const pngUrls = import.meta.glob('../assets/png/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const wavUrls = import.meta.glob('../assets/wav/*.wav', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

const KEYS: Record<string, Key> = {
  Enter: 'RETURN', NumpadEnter: 'KP_ENTER', Space: 'SPACE', Escape: 'ESCAPE', ArrowUp: 'UP', ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', NumpadAdd: 'KP_PLUS', Quote: 'QUOTE', Numpad1: 'KP1', Numpad2: 'KP2',
  Numpad3: 'KP3', Numpad4: 'KP4', Numpad5: 'KP5', Numpad6: 'KP6', Numpad7: 'KP7', Numpad8: 'KP8', Numpad9: 'KP9',
  Pause: 'PAUSE', KeyP: 'p', KeyQ: 'q', KeyN: 'n', KeyG: 'g', Digit0: '0', Digit9: '9',
};
/** keys the browser keeps for itself */
const BROWSER = new Set(['F5', 'F11', 'F12']);

async function bytes(url: string, signal: AbortSignal): Promise<ArrayBuffer> {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`cannot load ${url}`);
  return r.arrayBuffer();
}

async function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p.catch(() => fallback), new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);
}

class ChromiumApp {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly box: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private game: Global | null = null;
  private loop: MainLoop | null = null;
  private gl: WebGLRenderer | null = null;
  private events: InputEvent[] = [];
  private acc = 0;
  private store = new Map<string, string>();
  private savedConfig = '';
  private done = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.box = document.createElement('div');
    this.box.style.cssText = 'width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden';
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display:block;image-rendering:auto;outline:none';
    this.canvas.tabIndex = 0;
    this.box.appendChild(this.canvas);
    host.appendChild(this.box);
  }

  async start(): Promise<void> {
    const { ctx } = this;
    const signal = ctx.signal;
    // the player's files: ~/.chromium-bsu and ~/.chromium-bsu-score
    const [cfg, score] = await Promise.all([CONFIG_FILE, CONFIG_SCORE_FILE].map((n) => withTimeout(ctx.storage.get(n), 2500, null)));
    if (cfg) this.store.set(CONFIG_FILE, new TextDecoder().decode(cfg));
    if (score) this.store.set(CONFIG_SCORE_FILE, new TextDecoder().decode(score));
    const pngs = new Map<string, Png>();
    await Promise.all(Object.entries(pngUrls).map(async ([path, url]) => {
      pngs.set(path.split('/').pop()!, decodePng(new Uint8Array(await bytes(url, signal))));
    }));
    const sounds = await Promise.all(SOUND_FILES.map(async (name) => {
      const url = wavUrls[`../assets/wav/${name}`];
      try { return await ctx.audio.decodeAudioData(await bytes(url, signal)); } catch { return null; }
    }));
    setTitleGeometry(await bytes(titleUrl, signal));
    const face = new FontFace('Gothic Uralic CBSU', await bytes(fontUrl, signal), { weight: 'bold' });
    await face.load();
    document.fonts.add(face);

    const gl = new WebGLRenderer(this.canvas);
    this.gl = gl;
    const images = new ImageLoader(gl, pngs);
    const font = new GlyphFont(gl, 'Gothic Uralic CBSU');
    const files: Files = {
      read: (n) => this.store.get(n) ?? null,
      write: (n, t) => {
        this.store.set(n, t);
        void ctx.storage.put(n, new TextEncoder().encode(t)).catch(() => {});
      },
    };
    const user = (playerName() || 'player').replace(/\s+/g, '_').slice(0, 99);
    const game = new Global({
      gl, images, files, user,
      audio: new WebAudioBackend(ctx.audio, sounds),
      makeText: () => new GlcText(gl, font),
      now: () => Math.floor(Date.now() / 1000),
    }, Math.floor(Date.now() / 1000));
    this.game = game;
    this.loop = new MainLoop(game, {
      setVideoMode: () => this.setVideoMode(),
      grabMouse: (on) => this.grabMouse(on),
    });
    this.savedConfig = game.config.text();
    this.input(signal);
    new ResizeObserver(() => this.fit()).observe(this.host);
    this.fit();
    this.canvas.focus();
    ctx.frame((_t, dt) => this.frame(dt));
  }

  /** MainSDL::setVideoMode: the drawing buffer is the configured screen size; full screen is the browser's */
  private setVideoMode(): boolean {
    const g = this.game;
    if (!g) return true;
    this.canvas.width = g.config.screenW();
    this.canvas.height = g.config.screenH();
    const want = g.config.fullScreen();
    if (want && !document.fullscreenElement) void this.host.requestFullscreen?.().catch(() => {});
    if (!want && document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    this.fit();
    return true;
  }

  private grabMouse(on: boolean): void {
    if (on && document.pointerLockElement !== this.canvas) {
      try { void Promise.resolve(this.canvas.requestPointerLock()).catch(() => {}); } catch { /* needs a click */ }
    } else if (!on && document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  /** the 4:3 picture, as large as the window allows */
  private fit(): void {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    const g = this.game;
    const aspect = g ? g.config.screenW() / g.config.screenH() : 4 / 3;
    const cw = Math.min(w, h * aspect);
    this.canvas.style.width = `${Math.floor(cw)}px`;
    this.canvas.style.height = `${Math.floor(cw / aspect)}px`;
  }

  private frame(dt: number): void {
    const loop = this.loop, gl = this.gl, game = this.game;
    if (!loop || !gl || !game || this.done) return;
    this.acc += Math.min(dt, 250);
    let steps = Math.floor(this.acc / 20);
    if (steps > 10) { steps = 10; this.acc = 0; } else this.acc -= steps * 20;
    for (let i = 0; i < steps; i++) {
      gl.skip = i < steps - 1;
      loop.draw();
      const ev = this.events;
      this.events = [];
      if (loop.endFrame(ev)) { this.quit(); return; }
    }
    gl.skip = false;
    // the configuration file as the original writes it when it ends, kept up to date
    const cfg = game.config.text();
    if (cfg !== this.savedConfig) {
      this.savedConfig = cfg;
      game.config.saveFile();
    }
  }

  private quit(): void {
    this.done = true;
    this.game?.config.saveFile();
    this.ctx.exit();
  }

  private input(signal: AbortSignal): void {
    const c = this.canvas;
    const opts = { signal };
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || BROWSER.has(e.code)) return;
      const k: Key = KEYS[e.code] ?? 'other';
      e.preventDefault();
      if (this.loop) this.loop.held.add(k);
      this.events.push({ type: 'keydown', key: k });
    }, opts);
    window.addEventListener('keyup', (e) => {
      const k: Key = KEYS[e.code] ?? 'other';
      if (this.loop) this.loop.held.delete(k);
      if (KEYS[e.code]) e.preventDefault();
      this.events.push({ type: 'keyup', key: k });
    }, opts);
    window.addEventListener('blur', () => this.loop?.held.clear(), opts);
    const pos = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      const g = this.game!;
      return {
        x: Math.floor(((e.clientX - r.left) / r.width) * g.config.screenW()),
        y: Math.floor(((e.clientY - r.top) / r.height) * g.config.screenH()),
      };
    };
    c.addEventListener('mousedown', (e) => {
      e.preventDefault();
      c.focus();
      if (this.loop?.mouseToggle && document.pointerLockElement !== c) this.grabMouse(true);
      this.events.push({ type: 'buttondown', button: e.button + 1, ...pos(e) });
    }, opts);
    window.addEventListener('mouseup', (e) => {
      if (e.target !== c && document.pointerLockElement !== c) return;
      this.events.push({ type: 'buttonup', button: e.button + 1, ...pos(e) });
    }, opts);
    window.addEventListener('mousemove', (e) => {
      if (e.target !== c && document.pointerLockElement !== c) return;
      if (e.movementX || e.movementY) this.events.push({ type: 'motion', dx: e.movementX, dy: e.movementY });
    }, opts);
    c.addEventListener('contextmenu', (e) => e.preventDefault(), opts);
  }

  stop(): void {
    this.done = true;
    if (this.game) {
      const cfg = this.game.config.text();
      if (cfg !== this.savedConfig) this.game.config.saveFile();
    }
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.box.remove();
  }
}

export const start: StartGame = async (host, ctx) => {
  const app = new ChromiumApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
