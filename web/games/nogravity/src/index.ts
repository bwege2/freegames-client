// No Gravity on the website (GPL-3.0-or-later for this browser code; the game is realtech VR's, code
// and data under the GPL, LICENSE.md). The original's C is translated in game/ (src/*.c) and v3x/
// (the parts of the rlx32 engine the game logic needs); screen.ts draws its frames with three.js,
// sys/ stands for SDL (keyboard, mouse, timer) and SDL_mixer (sound).
import type { StartGame, GameContext } from '../../../src/sdk/index.ts';
import { Screen } from './screen.ts';
import { files, host, clock, sKEY, sMOU, CODE_TO_SCAN, minFrameMs, g_cTimer, normPath } from './sys/sys.ts';
import { Mixer } from './sys/audio.ts';
import { audio } from './game/sound.ts';
import { assets } from './game/render.ts';
import { persist, loadPlayerFiles, PTS, HSC, INI } from './game/persist.ts';
import { NG_Init, NG_LoadGameData, NG_Run } from './game/main.ts';
import { g_SGGame } from './game/state.ts';

const urls = import.meta.glob('../assets/**/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
/** archive name -> URL */
const byName = new Map<string, string>();
for (const [k, v] of Object.entries(urls)) byName.set(normPath(k.replace('../assets/', '')), v);
/** loaded at start; music, the episodes and the demos come when needed (game.json lazyAssets) */
const lazy = (n: string): boolean => n.startsWith('music/') || n.startsWith('ep_') || /^menu\/record\d\.dem$/.test(n);

async function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p.catch(() => fallback), new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);
}

class NoGravity {
  private readonly box: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly screen: Screen;
  private stopped = false;
  private ro: ResizeObserver | null = null;

  private readonly hostEl: HTMLElement;
  private readonly ctx: GameContext;

  constructor(hostEl: HTMLElement, ctx: GameContext) {
    this.hostEl = hostEl;
    this.ctx = ctx;
    this.box = document.createElement('div');
    this.box.style.cssText = 'width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden';
    this.canvas = document.createElement('canvas');
    this.canvas.tabIndex = 0;
    this.canvas.style.cssText = 'display:block;outline:none;cursor:none';
    this.box.appendChild(this.canvas);
    hostEl.appendChild(this.box);
    this.screen = new Screen(this.canvas);
  }

  private layout(): void {
    const w = this.box.clientWidth, h = this.box.clientHeight;
    const k = Math.max(0.1, Math.min(w / 640, h / 480));
    const cw = Math.floor(640 * k), ch = Math.floor(480 * k);
    this.canvas.style.width = `${cw}px`;
    this.canvas.style.height = `${ch}px`;
    this.screen.resize(cw, ch, Math.min(2, window.devicePixelRatio || 1));
  }

  private async fetchFiles(names: string[]): Promise<void> {
    const todo = names.filter((n) => !files.has(n) && byName.has(n));
    await Promise.all(todo.map(async (n) => {
      const r = await fetch(byName.get(n)!, { signal: this.ctx.signal });
      if (!r.ok) throw new Error(`cannot load ${n}`);
      files.set(n, new Uint8Array(await r.arrayBuffer()));
    }));
  }

  private input(): void {
    const signal = this.ctx.signal;
    const target = window;
    target.addEventListener('keydown', (e) => {
      if (e.code === 'F5' || e.code === 'F11' || e.code === 'F12') return;
      const scan = CODE_TO_SCAN[e.code];
      if (scan === undefined) return;
      e.preventDefault();
      if (e.repeat) return;
      const ch = e.key.length === 1 && e.key.charCodeAt(0) < 128 ? e.key.charCodeAt(0) : e.key === 'Enter' ? 13 : e.key === 'Backspace' ? 8 : 0;
      sKEY.events.push({ down: true, scan, char: ch });
    }, { signal });
    target.addEventListener('keyup', (e) => {
      const scan = CODE_TO_SCAN[e.code];
      if (scan === undefined) return;
      e.preventDefault();
      sKEY.events.push({ down: false, scan, char: 0 });
    }, { signal });
    const toScreen = (e: MouseEvent): void => {
      const r = this.canvas.getBoundingClientRect();
      sMOU.live.x = ((e.clientX - r.left) * 640) / r.width;
      sMOU.live.y = ((e.clientY - r.top) * 480) / r.height;
      sMOU.live.dx += e.movementX; sMOU.live.dy += e.movementY;
    };
    window.addEventListener('pointermove', toScreen, { signal });
    this.canvas.addEventListener('pointerdown', (e) => { toScreen(e); this.canvas.focus(); if (e.button < 3) { const b = [0, 2, 1][e.button]; sMOU.live.buttons[b] = 1; sMOU.live.pressed[b] = 1; } e.preventDefault(); }, { signal });
    window.addEventListener('pointerup', (e) => { if (e.button < 3) sMOU.live.buttons[[0, 2, 1][e.button]] = 0; }, { signal });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    this.canvas.addEventListener('wheel', (e) => { sMOU.live.dz += e.deltaY < 0 ? 1 : -1; e.preventDefault(); }, { signal, passive: false });
    window.addEventListener('blur', () => { sKEY.events.length = 0; sKEY.live.fill(0); sMOU.live.buttons.fill(0); }, { signal });
  }

  async run(): Promise<void> {
    const ctx = this.ctx;
    this.layout();
    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(this.box);
    this.input();
    this.canvas.focus();
    // the files of the data archive the menus and the game need at once
    await this.fetchFiles([...byName.keys()].filter((n) => !lazy(n)));
    assets.loadDir = async (dir: string) => this.fetchFiles([...byName.keys()].filter((n) => n.startsWith(`${dir}/`)));
    // sound: SDL_mixer on Web Audio
    audio.mixer = new Mixer(ctx.audio);
    audio.enabled = true;
    const cache = new Map<string, Promise<AudioBuffer | null>>();
    audio.decode = (path: string) => {
      const n = normPath(path);
      let p = cache.get(n);
      if (!p) {
        p = (async () => {
          await this.fetchFiles([n]);
          const b = files.get(n);
          if (!b) return null;
          try { return await ctx.audio.decodeAudioData(b.slice().buffer); } catch { return null; }
        })();
        cache.set(n, p);
      }
      return p;
    };
    // the player's files
    persist.put = (name, data) => { void ctx.storage.put(name, data).catch(() => {}); };
    const [pts, hsc, ini] = await Promise.all([PTS, HSC, INI].map((n) => withTimeout(ctx.storage.get(n), 2500, null)));
    // the frame: draw, then wait until the next animation frame at least 1/70 s (iMinFrame) after the last
    const start = performance.now();
    host.flip = () => new Promise<void>((resolve) => {
      this.screen.setScene(g_SGGame.Scene);
      this.screen.present();
      const tick = (): void => {
        if (this.stopped) { host.quit = true; resolve(); return; }
        clock.ms = performance.now() - start;
        const passed = clock.ms - g_cTimer.tStart;
        if (passed * 1000 > minFrameMs() * 1000 || passed < 0) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    NG_Init();
    loadPlayerFiles({ pts, hsc, ini });
    await NG_LoadGameData();
    await NG_Run();
    if (!this.stopped) ctx.exit();
  }

  destroy(): void {
    this.stopped = true;
    host.quit = true;
    this.ro?.disconnect();
    audio.mixer.close();
    this.screen.dispose();
    this.box.remove();
    void this.hostEl;
  }
}

export const start: StartGame = (hostEl, ctx) => {
  host.quit = false;
  const game = new NoGravity(hostEl, ctx);
  game.run().catch((e) => { if (!ctx.signal.aborted) console.error(e); });
  return { stop: () => game.destroy() };
};
