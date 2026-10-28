// Abuse 0.8 in the browser. The page side: the window (a 320x200 PixelScreen), keys and mouse as SDL
// 1.2 events, the sounds (rt/audio.ts), the save directory in account storage, the online rooms;
// the program itself runs in a worker (worker.ts).
import { PixelScreen, playerName, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import packUrl from '../assets/abuse-data.bin?url';
import { WebAudioOut } from './rt/audio.ts';
import { SDL_KEYDOWN, SDL_KEYUP, SDL_MOUSEBUTTONDOWN, SDL_MOUSEBUTTONUP, SDL_MOUSEMOTION, KMOD_LALT, KMOD_LCTRL,
  KMOD_LSHIFT, KMOD_RALT, KMOD_RCTRL, KMOD_RSHIFT, type SDLEvent } from './rt/platform.ts';
import { SDLK } from './sdlport/event.ts';
import type { FromWorker, ToWorker } from './worker.ts';
import { OnlinePage } from './online-page.ts';
import type { OnlineConfig } from './online.ts';

/** KeyboardEvent.code -> SDL 1.2 key symbol (US layout, as SDL 1.2 reports keys) */
const CODES: Record<string, number> = {
  Backspace: SDLK.BACKSPACE, Tab: SDLK.TAB, Enter: SDLK.RETURN, NumpadEnter: SDLK.RETURN, Escape: SDLK.ESCAPE,
  Space: SDLK.SPACE, Quote: 39, Comma: 44, Minus: 45, Period: 46, Slash: 47, Semicolon: 59, Equal: 61,
  BracketLeft: 91, Backslash: 92, BracketRight: 93, Backquote: 96, Delete: SDLK.DELETE,
  Numpad0: SDLK.KP0, Numpad2: SDLK.KP2, Numpad4: SDLK.KP4, Numpad6: SDLK.KP6, Numpad8: SDLK.KP8,
  ArrowUp: SDLK.UP, ArrowDown: SDLK.DOWN, ArrowRight: SDLK.RIGHT, ArrowLeft: SDLK.LEFT, Insert: SDLK.INSERT,
  Home: SDLK.HOME, End: SDLK.END, PageUp: SDLK.PAGEUP, PageDown: SDLK.PAGEDOWN,
  F1: SDLK.F1, F2: SDLK.F2, F3: SDLK.F3, F4: SDLK.F4, F5: SDLK.F5, F6: SDLK.F6, F7: SDLK.F7, F8: SDLK.F8,
  F9: SDLK.F9, F10: SDLK.F10, NumLock: SDLK.NUMLOCK, CapsLock: SDLK.CAPSLOCK, ShiftRight: SDLK.RSHIFT,
  ShiftLeft: SDLK.LSHIFT, ControlRight: SDLK.RCTRL, ControlLeft: SDLK.LCTRL, AltRight: SDLK.RALT, AltLeft: SDLK.LALT,
};
const MODS: Record<number, number> = {
  [SDLK.LSHIFT]: KMOD_LSHIFT, [SDLK.RSHIFT]: KMOD_RSHIFT, [SDLK.LCTRL]: KMOD_LCTRL, [SDLK.RCTRL]: KMOD_RCTRL,
  [SDLK.LALT]: KMOD_LALT, [SDLK.RALT]: KMOD_RALT,
};

function sdlKey(e: KeyboardEvent): number | null {
  const c = e.code;
  if (/^Key[A-Z]$/.test(c)) return c.charCodeAt(3) + 32;
  if (/^Digit\d$/.test(c)) return c.charCodeAt(5);
  return CODES[c] ?? null;
}

async function loadPack(signal: AbortSignal): Promise<Uint8Array> {
  const r = await fetch(packUrl, { signal });
  if (!r.ok) throw new Error(`the game's data could not be loaded (${r.status})`);
  const raw = new Uint8Array(await r.arrayBuffer());
  if (raw[0] !== 0x1f || raw[1] !== 0x8b) return raw; // already unpacked by the transport
  const ds = new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(ds).arrayBuffer());
}

async function loadSaves(ctx: GameContext): Promise<[string, Uint8Array][]> {
  const out: [string, Uint8Array][] = [];
  try {
    for (const f of await ctx.storage.list('')) {
      const d = await ctx.storage.get(f.name);
      if (d) out.push([f.name, d]);
    }
  } catch {
    // no server: the game runs, saving fails as on a read-only disk
  }
  return out;
}

class AbusePage {
  private readonly screen: PixelScreen;
  private worker: Worker | null = null;
  private pack: Uint8Array | null = null;
  private readonly ctx: GameContext;
  private readonly image: ImageData;
  private frame: { pixels: Uint8Array; pal: Uint8Array } | null = null;
  private mods = 0;
  /** frames the program showed (tests), and until when a message stays over them */
  frames = 0;
  /** the last game state the program reported (rt/state.ts) */
  state = '';
  private firstFrame = 0;
  private audio: WebAudioOut | null = null;
  private saving: Promise<unknown> = Promise.resolve();
  private readonly message: HTMLDivElement;
  readonly online: OnlinePage;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.screen = new PixelScreen(host, { width: 320, height: 200 }, ctx.signal);
    this.image = this.screen.ctx.createImageData(320, 200);
    this.screen.canvas.style.cursor = 'none'; // the game draws its own pointer
    this.message = document.createElement('div');
    this.message.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
      'color:#ccc;font:14px monospace;text-align:center;white-space:pre-wrap;pointer-events:none';
    this.message.textContent = 'Loading Abuse…';
    host.style.position = 'relative';
    host.appendChild(this.message);
    this.online = new OnlinePage(host, ctx, {
      send: (m) => this.send({ t: 'net', m }),
      relaunch: (online, message) => void this.launch(online, message),
    });
    this.input(host);
    ctx.frame(() => this.draw());
  }

  send(m: ToWorker): void { this.worker?.postMessage(m); }

  messageText(): string { return this.message.textContent ?? ''; }

  async start(): Promise<void> {
    this.pack = await loadPack(this.ctx.signal);
    await this.launch(null);
  }

  /** (re)starts the program: for one player, or online in a round (the original restarted its engine
   *  after the network dialog, and again when a network game ended) */
  async launch(online: OnlineConfig | null, message = ''): Promise<void> {
    this.worker?.terminate();
    this.worker = null;
    this.audio?.close();
    this.frame = null;
    this.message.textContent = message ? `${message}\n\nLoading Abuse…` : 'Loading Abuse…';
    // the save directory as the account has it now (writes of the last run first)
    await this.saving;
    const saves = await loadSaves(this.ctx);
    if (this.ctx.signal.aborted || !this.pack) return;
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module', name: 'abuse' });
    this.worker = w;
    w.onmessage = (e: MessageEvent<FromWorker>) => {
      if (this.worker === w) this.fromWorker(e.data);
    };
    this.audio = new WebAudioOut(this.ctx.audio, (id) => this.send({ t: 'songEnded', id }));
    this.send({ t: 'start', pack: this.pack, saves, args: [], login: playerName() || 'player', audio: true, online });
    this.firstFrame = message ? performance.now() + 2500 : 0;
  }

  private fromWorker(m: FromWorker): void {
    switch (m.t) {
      case 'frame':
        this.frame = m;
        this.frames++;
        if (m.state !== null) this.state = m.state;
        if (this.message.textContent && performance.now() >= this.firstFrame) this.message.textContent = '';
        break;
      case 'audio': (this.audio as unknown as Record<string, (...a: unknown[]) => void> | null)?.[m.op](...m.args); break;
      case 'save': {
        const { name, data } = m;
        // the original's disk never filled up; the server's storage can (4 MiB per account and game)
        this.saving = this.saving.then(() => this.ctx.storage.put(name, data)).catch((e: unknown) => {
          if (this.ctx.signal.aborted) return;
          console.warn(`abuse: ${name} was not saved`, e);
          this.message.textContent = `${name} was not saved on the server:\n${e instanceof Error ? e.message : String(e)}`;
          this.firstFrame = performance.now() + 5000;
        });
        break;
      }
      case 'delete': {
        const name = m.name;
        this.saving = this.saving.then(() => this.ctx.storage.delete(name)).catch(() => {});
        break;
      }
      case 'exit': void this.saving.then(() => this.ctx.exit()); break;
      case 'error': this.message.textContent = `Abuse stopped:\n${m.message}`; break;
      case 'net': this.online.fromWorker(m.m); break;
    }
  }

  private draw(): void {
    const f = this.frame;
    if (!f) return;
    this.frame = null;
    const d = this.image.data, p = f.pixels, pal = f.pal;
    for (let i = 0, o = 0; i < 64000; i++, o += 4) {
      const c = p[i] * 3;
      d[o] = pal[c];
      d[o + 1] = pal[c + 1];
      d[o + 2] = pal[c + 2];
      d[o + 3] = 255;
    }
    this.screen.ctx.putImageData(this.image, 0, 0);
  }

  private event(ev: SDLEvent): void { this.send({ t: 'ev', ev, mods: this.mods }); }

  private input(host: HTMLElement): void {
    const signal = this.ctx.signal;
    const canvas = this.screen.canvas;
    host.tabIndex = 0;
    host.focus();
    const key = (down: boolean) => (e: KeyboardEvent): void => {
      if (this.online.typing()) return;
      const sym = sdlKey(e);
      if (sym === null) return;
      e.preventDefault();
      if (down && e.repeat) return; // SDL 1.2 sends no repeats unless SDL_EnableKeyRepeat (the game does not)
      const m = MODS[sym] ?? 0;
      if (down) this.mods |= m;
      else this.mods &= ~m;
      this.event({ type: down ? SDL_KEYDOWN : SDL_KEYUP, sym, mod: this.mods });
    };
    host.addEventListener('keydown', key(true), { signal });
    host.addEventListener('keyup', key(false), { signal });
    let last = { x: -1, y: -1 };
    const move = (e: PointerEvent | MouseEvent): void => {
      const r = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(319, Math.floor((e.clientX - r.left) / r.width * 320)));
      const y = Math.max(0, Math.min(199, Math.floor((e.clientY - r.top) / r.height * 200)));
      if (x === last.x && y === last.y) return;
      last = { x, y };
      this.event({ type: SDL_MOUSEMOTION, x, y });
    };
    const sdlButton = (b: number): number => (b === 0 ? 1 : b === 1 ? 2 : b === 2 ? 3 : 0);
    host.addEventListener('pointermove', move, { signal });
    host.addEventListener('pointerdown', (e) => {
      host.focus();
      move(e);
      const b = sdlButton(e.button);
      if (b) {
        e.preventDefault();
        this.event({ type: SDL_MOUSEBUTTONDOWN, button: b });
      }
    }, { signal });
    window.addEventListener('pointerup', (e) => {
      const b = sdlButton(e.button);
      if (b) this.event({ type: SDL_MOUSEBUTTONUP, button: b });
    }, { signal });
    host.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    host.addEventListener('wheel', (e) => {
      e.preventDefault();
      const b = e.deltaY < 0 ? 4 : 5;
      this.event({ type: SDL_MOUSEBUTTONDOWN, button: b });
      this.event({ type: SDL_MOUSEBUTTONUP, button: b });
    }, { signal, passive: false });
    window.addEventListener('blur', () => {
      // keys held when the window loses focus would stay down for the program
      for (const [sym, m] of Object.entries(MODS)) if (this.mods & m) this.event({ type: SDL_KEYUP, sym: +sym, mod: 0 });
      this.mods = 0;
    }, { signal });
  }

  stop(): void {
    this.worker?.terminate();
    this.worker = null;
    this.audio?.close();
    this.online.stop();
  }
}

/** what the end-to-end test reads (games/abuse/e2e.mjs) */
interface AbuseTestHooks {
  frames(): number;
  /** the game state (rt/state.ts: st=<state> tick=<level tick> rand=... p<n>=x,y,hp,... objs=...) */
  state(): string;
  message(): string;
  online(): { seat: number; players: number; syncs: [number, number][] } | null;
  /** a new connection, as after a dropped one (the seat comes back and catches up) */
  reconnect(name: string): Promise<unknown>;
}

export const start: StartGame = async (host, ctx) => {
  const page = new AbusePage(host, ctx);
  (window as unknown as { __abuse: AbuseTestHooks }).__abuse = {
    frames: () => page.frames,
    state: () => page.state,
    message: () => page.messageText(),
    online: () => {
      const r = page.online.online();
      return r ? { seat: r.you, players: r.seats.length, syncs: [...page.online.syncs] } : null;
    },
    reconnect: (name) => ctx.net.rename(name),
  };
  page.start().catch((e) => {
    if (!ctx.signal.aborted) console.error(e);
  });
  return { stop: () => page.stop() };
};
