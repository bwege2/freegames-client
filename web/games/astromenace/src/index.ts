// AstroMenace 1.4.3 on the website (GPL-3.0-or-later; the game is Mikhail Kurinnoi's, Viewizard,
// LICENSE.md). The original's main.cpp: load the assets, the config and the pilot profiles, then one
// Loop_Proc per screen refresh, as the original's main loop runs once per rendered frame with SDL's
// millisecond clock. The renderer (render/gl.ts) draws in WebGL 2, the 2D layer is a canvas of the
// game's internal resolution, the sound plays with Web Audio, the files go to the account's storage.
import type { StartGame, GameContext } from '../../../src/sdk/index.ts';
import { clock, mouse, vw_InitText, vw_InitTimeThread, vw_SetKeyStatus, vw_ResetMouseButtons, vw_GetMouseLeftClick } from './engine/core.ts';
import { addTexture } from './engine/textures.ts';
import { decodePng } from './engine/png.ts';
import { screen2d, clearTextCache } from './engine/draw2d.ts';
import { loadModel3D, MODEL3D_ASSETS } from './core/model3d.ts';
import { initParticleSystems } from './core/particles.ts';
import { models } from './object3d/object3d.ts';
import { scriptFiles } from './game/script.ts';
import {
  Config, ConfigFileName, FirstStartSettings, GameConfig, LoadXMLConfigFile, ProfilesFileName, SavePilotProfiles, SaveXMLConfigFile,
  SDLK, configStore, syncObjectConfig,
} from './game/config.ts';
import { R, Renderer } from './render/gl.ts';
import { WebAudio, SOUND_FILES } from './render/audio.ts';
import { InitMenu, Loop_Proc, MenuStatus, MN, layer2D, screens } from './menu/menu.ts';
import { InitDialogBoxes, dialogHooks } from './menu/dialog.ts';
import { DeleteRecord } from './menu/menus.ts';
import { CursorInit, GetShowGameCursor, UI } from './ui/button.ts';
import { MusicTheme, audio } from './game/globals.ts';
import './game/game.ts';
import './menu/workshop.ts';
import { optionsHooks } from './menu/options.ts';

const pngUrls = import.meta.glob('../assets/**/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const vw3dUrls = import.meta.glob('../assets/models/**/*.vw3d', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const xmlUrls = import.meta.glob('../assets/script/*.xml', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const wavUrls = import.meta.glob(['../assets/sfx/*.wav', '../assets/lang/en/voice/*.wav'], { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const oggUrls = import.meta.glob('../assets/music/*.ogg', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const fontUrls = import.meta.glob('../assets/font/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const csvUrl = (import.meta.glob('../assets/lang/text.csv', { query: '?url', import: 'default', eager: true }) as Record<string, string>)['../assets/lang/text.csv'];

const FONTS = ['LinBiolinum_RB.otf', 'LinLibertine_RB.otf', 'LiberationMono-Bold.ttf', 'LiberationSans-Bold.ttf',
  'LiberationSerif-Bold.ttf', 'FreeMonoBold.otf', 'FreeSansBold.otf', 'FreeSerifBold.otf'];

/** KeyboardEvent.code to SDL 2 key codes */
function sdlKey(e: KeyboardEvent): number {
  const c = e.code;
  if (/^Key[A-Z]$/.test(c)) return c.charCodeAt(3) + 32;
  if (/^Digit[0-9]$/.test(c)) return c.charCodeAt(5);
  if (/^F([1-9]|1[0-2])$/.test(c)) return SDLK.F1 + Number(c.slice(1)) - 1;
  if (/^Numpad[1-9]$/.test(c)) return SDLK.KP_1 + Number(c.slice(6)) - 1;
  const map: Record<string, number> = {
    Enter: SDLK.RETURN, NumpadEnter: SDLK.KP_ENTER, Escape: SDLK.ESCAPE, Backspace: SDLK.BACKSPACE, Tab: SDLK.TAB, Space: SDLK.SPACE,
    ArrowRight: SDLK.RIGHT, ArrowLeft: SDLK.LEFT, ArrowDown: SDLK.DOWN, ArrowUp: SDLK.UP, ControlLeft: SDLK.LCTRL,
    ShiftLeft: SDLK.LSHIFT, AltLeft: SDLK.LALT, ControlRight: SDLK.RCTRL, ShiftRight: SDLK.RSHIFT, AltRight: SDLK.RALT,
    Pause: SDLK.PAUSE, Insert: SDLK.INSERT, Home: SDLK.HOME, PageUp: SDLK.PAGEUP, Delete: SDLK.DELETE, End: SDLK.END,
    PageDown: SDLK.PAGEDOWN, NumpadDivide: SDLK.KP_DIVIDE, NumpadMultiply: SDLK.KP_MULTIPLY, NumpadSubtract: SDLK.KP_MINUS,
    NumpadAdd: SDLK.KP_PLUS, Numpad0: SDLK.KP_0, NumpadDecimal: SDLK.KP_PERIOD, Minus: 45, Equal: 61, BracketLeft: 91,
    BracketRight: 93, Backslash: 92, Semicolon: 59, Quote: 39, Backquote: 96, Comma: 44, Period: 46, Slash: 47,
  };
  return map[c] ?? 0;
}

async function bytes(url: string, signal: AbortSignal): Promise<ArrayBuffer> {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`cannot load ${url}`);
  return r.arrayBuffer();
}

const assetName = (path: string): string => path.replace('../assets/', '');

class AstroMenaceApp {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly box: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private overlay!: HTMLCanvasElement;
  private sound: WebAudio | null = null;
  private start0 = 0;
  private done = false;
  private saved = new Map<string, string>();
  private lastSave = 0;
  private releases: (() => void)[] = [];
  private keyUps: number[] = [];

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.box = document.createElement('div');
    this.box.style.cssText = 'width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden';
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display:block;outline:none;cursor:none';
    this.canvas.tabIndex = 0;
    this.box.appendChild(this.canvas);
    host.appendChild(this.box);
  }

  async start(): Promise<void> {
    const { ctx } = this;
    const signal = ctx.signal;
    // the config and the pilot profiles (the original's files in the user's config folder)
    const get = async (n: string): Promise<string | null> => {
      try {
        const v = await Promise.race([ctx.storage.get(n), new Promise<null>((r) => setTimeout(() => r(null), 2500))]);
        return v ? new TextDecoder().decode(v) : null;
      } catch {
        return null;
      }
    };
    const [cfg, prof] = await Promise.all([get(ConfigFileName), get(ProfilesFileName)]);
    if (cfg) this.saved.set(ConfigFileName, cfg);
    if (prof) this.saved.set(ProfilesFileName, prof);
    const first = LoadXMLConfigFile(cfg, prof) || !cfg;
    if (first) FirstStartSettings();
    // the browser port renders with the first start's OpenGL 3.0 settings in any case (README.md)
    Config.UseGLSL120 = true;
    syncObjectConfig();
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    Config.InternalWidth = aspect > 1.24 && aspect < 1.4 ? 1024 : 1228;
    Config.InternalHeight = 768;
    configStore.save = (name, data) => this.save(name, data);
    screens.saveConfig = () => {
      this.save(ConfigFileName, SaveXMLConfigFile());
      this.save(ProfilesFileName, SavePilotProfiles());
    };
    vw_InitText(new Uint8Array(await bytes(csvUrl, signal)));
    // fonts
    await Promise.all(FONTS.map(async (f, i) => {
      const url = fontUrls[`../assets/font/${f}`];
      if (!url) return;
      try {
        const face = new FontFace(`AstroMenaceFont${i}`, await bytes(url, signal));
        await face.load();
        document.fonts.add(face);
      } catch { /* a missing font falls back to the browser's */ }
    }));
    screen2d.family = `AstroMenaceFont${GameConfig().FontNumber}`;
    // textures, models, scripts, sounds
    await Promise.all(Object.entries(pngUrls).map(async ([p, url]) => {
      const png = await decodePng(new Uint8Array(await bytes(url, signal)));
      addTexture(assetName(p).replace(/\.png$/, ''), png.width, png.height, png.channels, png.pixels);
    }));
    await Promise.all(Object.entries(vw3dUrls).map(async ([p, url]) => {
      const name = assetName(p);
      models.set(name, loadModel3D(await bytes(url, signal), name, MODEL3D_ASSETS[name] ?? -1));
    }));
    await Promise.all(Object.entries(xmlUrls).map(async ([p, url]) => {
      scriptFiles.set(assetName(p), new TextDecoder().decode(await bytes(url, signal)));
    }));
    const buffers = new Map<string, AudioBuffer>();
    await Promise.all(SOUND_FILES.map(async (f) => {
      const url = wavUrls[`../assets/${f}`];
      if (!url) return;
      try {
        buffers.set(f, await ctx.audio.decodeAudioData(await bytes(url, signal)));
      } catch { /* no sound */ }
    }));
    this.sound = new WebAudio(ctx.audio, buffers, async (f) => {
      const url = oggUrls[`../assets/${f}`];
      if (!url) return null;
      try {
        return await ctx.audio.decodeAudioData(await bytes(url, signal));
      } catch {
        return null;
      }
    });
    optionsHooks.volumeChanged = () => this.sound?.setMusicVolume();
    optionsHooks.brightnessChanged = () => this.brightness();
    screens.stopSounds = () => this.sound?.stopAllIfAllowed();
    this.brightness();
    // the screens
    const W = GameConfig().InternalWidth, H = GameConfig().InternalHeight;
    this.overlay = document.createElement('canvas');
    this.overlay.width = W;
    this.overlay.height = H;
    screen2d.ctx = this.overlay.getContext('2d');
    screen2d.width = W;
    screen2d.height = H;
    screen2d.makeCanvas = (w, h) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      return c;
    };
    clearTextCache();
    const gl = new Renderer(this.canvas);
    R.gl = gl;
    layer2D.flush = () => {
      if (!screen2d.ctx) return;
      gl.composite(this.overlay);
      screen2d.ctx.clearRect(0, 0, W, H);
    };
    dialogHooks.quit = () => this.quit();
    dialogHooks.deleteRecord = DeleteRecord;
    // main.cpp: the time threads, the particle quality, the cursor, the menu
    this.start0 = performance.now();
    clock.ticks = 0;
    vw_InitTimeThread(0);
    initParticleSystems(GameConfig().VisualEffectsQuality + 1);
    CursorInit();
    InitDialogBoxes();
    InitMenu(MenuStatus.MAIN_MENU);
    audio.playMusicTheme(MusicTheme.MENU, 2000, 2000);
    this.input(signal);
    new ResizeObserver(() => this.fit()).observe(this.host);
    this.fit();
    this.canvas.focus();
    ctx.frame(() => this.frame());
  }

  /** ApplyBrightness as a CSS filter on the picture */
  private brightness(): void {
    const b = GameConfig().Brightness;
    this.canvas.style.filter = b === 5 ? '' : `brightness(${1 + (b - 5) * 0.1})`;
  }

  private save(name: string, data: string): void {
    if (this.saved.get(name) === data) return;
    this.saved.set(name, data);
    void this.ctx.storage.put(name, new TextEncoder().encode(data)).catch(() => {});
  }

  private fit(): void {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    const aspect = GameConfig().InternalWidth / GameConfig().InternalHeight;
    const cw = Math.min(w, h * aspect);
    this.canvas.style.width = `${Math.floor(cw)}px`;
    this.canvas.style.height = `${Math.floor(cw / aspect)}px`;
  }

  private frame(): void {
    const gl = R.gl;
    if (!gl || this.done) return;
    clock.ticks = Math.floor(performance.now() - this.start0);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const ch = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    gl.beginFrame(cw, ch);
    Loop_Proc();
    for (const r of this.releases.splice(0)) r();
    for (const k of this.keyUps.splice(0)) vw_SetKeyStatus(k, false);
    // the pointer: free in the menus, captured while the ship flies (SDL_SetWindowGrab)
    const wantLock = MN.MenuStatus === MenuStatus.GAME && !GetShowGameCursor();
    if (!wantLock && document.pointerLockElement === this.canvas) document.exitPointerLock();
    // the config file as the original writes it, kept up to date (checked every two seconds)
    if (clock.ticks - this.lastSave > 2000) {
      this.lastSave = clock.ticks;
      screens.saveConfig();
    }
  }

  private quit(): void {
    this.done = true;
    screens.saveConfig();
    this.ctx.exit();
  }

  private input(signal: AbortSignal): void {
    const c = this.canvas;
    const opts = { signal };
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey && e.code !== 'AltLeft' && e.code !== 'AltRight') return;
      if (e.code === 'F11' || e.code === 'F12') return;
      const k = sdlKey(e);
      e.preventDefault();
      if (k) vw_SetKeyStatus(k, true);
      if (e.key.length === 1 && !e.repeat) mouse.typed.push(e.key);
    }, opts);
    window.addEventListener('keyup', (e) => {
      const k = sdlKey(e);
      if (k) this.keyUps.push(k);
    }, opts);
    window.addEventListener('blur', () => vw_ResetMouseButtons(), opts);
    const W = (): number => GameConfig().InternalWidth, H = (): number => GameConfig().InternalHeight;
    const pos = (e: MouseEvent): void => {
      if (document.pointerLockElement === c) {
        const r = c.getBoundingClientRect();
        mouse.x = Math.max(0, Math.min(W() - 1, mouse.x + (e.movementX * W()) / r.width));
        mouse.y = Math.max(0, Math.min(H() - 1, mouse.y + (e.movementY * H()) / r.height));
      } else {
        const r = c.getBoundingClientRect();
        mouse.x = Math.floor(((e.clientX - r.left) / r.width) * W());
        mouse.y = Math.floor(((e.clientY - r.top) / r.height) * H());
      }
    };
    c.addEventListener('mousedown', (e) => {
      e.preventDefault();
      c.focus();
      pos(e);
      const b = e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : e.button + 1;
      mouse.buttons.add(b);
      if (b === 1) {
        mouse.leftClick = true;
        if (e.detail === 2) mouse.leftDoubleClick = true;
      }
      if (b === 3) mouse.rightClick = true;
      if (MN.MenuStatus === MenuStatus.GAME && !GetShowGameCursor() && document.pointerLockElement !== c) {
        try { void Promise.resolve(c.requestPointerLock()).catch(() => {}); } catch { /* needs a click */ }
        vw_GetMouseLeftClick(true);
      }
    }, opts);
    window.addEventListener('mouseup', (e) => {
      const b = e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : e.button + 1;
      // released after the next frame has seen the press (a click inside one frame still counts)
      this.releases.push(() => {
        mouse.buttons.delete(b);
        if (b === 1) {
          mouse.leftClick = false;
          if (e.detail === 2) mouse.leftDoubleClick = false;
        }
        if (b === 3) mouse.rightClick = false;
      });
    }, opts);
    window.addEventListener('mousemove', (e) => {
      if (e.target !== c && document.pointerLockElement !== c) return;
      pos(e);
      UI.CurrentKeyboardSelectMenuElement = 0;
    }, opts);
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      mouse.wheel += e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    }, { signal, passive: false });
    c.addEventListener('contextmenu', (e) => e.preventDefault(), opts);
  }

  stop(): void {
    this.done = true;
    screens.saveConfig();
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    R.gl = null;
    screen2d.ctx = null;
    this.box.remove();
  }
}

export const start: StartGame = async (host, ctx) => {
  const app = new AstroMenaceApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
