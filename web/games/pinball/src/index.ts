// Pinball Construction Set in the browser: the original program (src/shell.ts BOOT: the construction
// set, its test play, the wiring kit, the disk menu, the game) on the port's Apple II, its hi-res
// screen drawn with the colour monitor's colours, its speaker played, its joystick and buttons and
// keyboard taken from the mouse and the keys, its disk files kept in the player's server storage.
import { PixelScreen, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import { pointer } from './cdraw.ts';
import { files } from './disk.ts';
import { renderHires } from './display.ts';
import { io, m, type Wait } from './machine.ts';
import { BOOT } from './shell.ts';
import { Speaker } from './sound.ts';
import { startOnline } from './online.ts';

/** 6502 cycles per millisecond (1.023 MHz) */
const CLOCK = 1023;

const CSS = `
.pb-ui { position: absolute; bottom: .4rem; left: .5rem; display: flex; gap: .4rem; z-index: 2; font: 13px system-ui, sans-serif; opacity: .8; }
.pb-ui:hover { opacity: 1; }
.pb-ui button { padding: .25rem .6rem; border-radius: 4px; border: 1px solid #555; background: #222; color: #eee; cursor: pointer; }
.pb-ui span { color: #ddd; align-self: center; text-shadow: 0 0 3px #000; }
.pb-lobby { position: absolute; inset: 0; z-index: 3; overflow: auto; background: rgb(0 0 0 / .55); }
.pb-choose, .pb-end { box-sizing: border-box; max-width: 30rem; margin: 2rem auto; padding: 1.1rem 1.4rem; border-radius: 10px; background: #fff; color: #1d2125; font: 15px/1.45 system-ui, sans-serif; }
.pb-choose h2 { margin: 0 0 .6rem; font-size: 1.2rem; }
.pb-choose select { display: block; margin: 0 0 .8rem; font: inherit; padding: .25rem .4rem; }
.pb-choose button, .pb-end button { font: inherit; margin-right: .5rem; padding: .3rem .8rem; border-radius: 6px; border: 1px solid #2f6fdf; background: #2f6fdf; color: #fff; cursor: pointer; }
.pb-err { color: #b3261e; min-height: 1.2em; }
.pb-end { position: absolute; left: 50%; bottom: 1rem; transform: translateX(-50%); margin: 0; z-index: 3; text-align: center; box-shadow: 0 2px 12px rgb(0 0 0 / .4); }
.pb-end p { margin: 0 0 .6rem; }
.pb-error { position: absolute; inset: 0; display: grid; place-items: center; color: #f88; background: rgb(0 0 0 / .8); z-index: 4; font: 14px monospace; white-space: pre-wrap; padding: 2rem; }
`;

/** the Apple II's key code ($C000, bit 7 set) for a browser key, or null */
export function appleKey(e: KeyboardEvent): number | null {
  switch (e.key) {
    case 'Enter': return 0x8d;
    case 'Escape': return 0x9b;
    case 'Backspace':
    case 'ArrowLeft': return 0x88;
    case 'ArrowRight': return 0x95;
    case 'ArrowUp': return 0x8b;
    case 'ArrowDown': return 0x8a;
    case 'Tab': return 0x89;
  }
  if (e.key.length !== 1 || e.altKey || e.metaKey) return null;
  const c = e.key.toUpperCase().charCodeAt(0);
  if (e.ctrlKey) return c >= 64 && c < 96 ? (c - 64) | 0x80 : null;
  return c >= 32 && c < 96 ? c | 0x80 : null;
}

/** runs the program's generators against the original's clock */
export class Runner {
  private gen: Wait;
  private waiting = false;
  private value: unknown = undefined;
  error: unknown = null;
  done = false;
  /** the 6502 cycle the program may run up to */
  target = 0;

  constructor(gen: Wait) {
    this.gen = gen;
    this.target = io.cycles;
  }

  /** runs until the clock reaches `target` (or the program waits for a file) */
  run(): void {
    let guard = 0;
    while (!this.done && !this.waiting && this.error === null && io.cycles < this.target) {
      let r: IteratorResult<unknown, void>;
      try {
        r = this.gen.next(this.value);
      } catch (e) {
        this.error = e;
        return;
      }
      this.value = undefined;
      if (r.done) {
        this.done = true;
        return;
      }
      if (r.value instanceof Promise) {
        this.waiting = true;
        r.value.then(
          (v) => {
            this.value = v;
            this.waiting = false;
          },
          (e) => {
            this.value = undefined;
            this.waiting = false;
            try {
              this.gen.throw(e);
            } catch (x) {
              this.error = x;
            }
          },
        );
        return;
      }
      // a loop that waits without time going on (the original's busy loops) still lets the page live
      if (++guard > 400_000) return;
    }
  }
}

export const start: StartGame = (host, ctx) => {
  const app = new Pinball(host, ctx);
  return { stop: () => app.stop() };
};

class Pinball {
  private readonly ctx: GameContext;
  private readonly screen: PixelScreen;
  private readonly image: ImageData;
  private readonly speaker: Speaker;
  private runner: Runner;
  private plunger: 'off' | 'pull' | 'fire' = 'off';
  private fireUntil = 0;
  private readonly keysDown = new Set<string>();
  private mouseButtons = 0;
  readonly ui: HTMLElement;
  readonly status: HTMLElement;
  /** the online round, when one runs (it drives the inputs and the clock) */
  online: { frame(dt: number): void; stop(): void } | null = null;
  private readonly onlineButton: HTMLButtonElement;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    const { signal } = ctx;
    this.screen = new PixelScreen(host, { width: 280, height: 192, pixelAspect: 4 / 3 / (280 / 192) }, signal);
    this.image = this.screen.ctx.createImageData(280, 192);
    this.speaker = new Speaker(ctx.audio);
    const style = document.createElement('style');
    style.textContent = CSS;
    this.ui = Object.assign(document.createElement('div'), { className: 'pb-ui' });
    this.status = document.createElement('span');
    const online = Object.assign(document.createElement('button'), { textContent: 'Play online', title: 'A game for 2 to 4 players, each at their own computer' });
    this.onlineButton = online;
    this.ui.append(online, this.status);
    host.append(style, this.ui);
    signal.addEventListener('abort', () => {
      style.remove();
      this.ui.remove();
    });
    online.onclick = () => void startOnline(this, host, ctx);

    // the disk is the player's storage
    files.store = {
      read: (name) => ctx.storage.get(name),
      write: async (name, data) => {
        await ctx.storage.put(name, data);
      },
    };
    pointer.x = null;
    pointer.y = null;
    this.runner = new Runner(BOOT());
    this.bindInput(host);
    (window as unknown as { __pinball: unknown }).__pinball = {
      ram: () => m,
      io,
      runner: () => this.runner,
      frames: 0,
    };
    ctx.frame((_t, dt) => this.frame(dt));
  }

  stop(): void {
    files.store = null;
    this.online?.stop();
  }

  /** the construction set's runner, swapped for another (null: kept) while the online game runs */
  swapRunner(next: Runner | null): Runner {
    const old = this.runner;
    if (next) {
      this.runner = next;
      next.target = io.cycles;
    }
    return old;
  }

  /** the speaker starts over (the clock went back or jumped) */
  resetSound(): void {
    this.speaker.reset();
  }

  private frame(dt: number): void {
    const d = Math.min(dt, 100);
    this.onlineButton.disabled = !!this.online;
    if (this.online) this.online.frame(d);
    else {
      this.inputs(d);
      this.runner.target += d * CLOCK;
      this.runner.run();
      if (this.runner.target - io.cycles > 200 * CLOCK) this.runner.target = io.cycles + 200 * CLOCK;
      if (io.cycles > this.runner.target + 200 * CLOCK) this.runner.target = io.cycles;
    }
    this.draw();
    const dbg = (window as unknown as { __pinball: { frames: number } }).__pinball;
    if (dbg) dbg.frames++;
  }

  draw(): void {
    renderHires(this.image.data);
    this.screen.ctx.putImageData(this.image, 0, 0);
    this.speaker.flush(io.cycles);
    if (this.runner.error !== null && !document.querySelector('.pb-error')) {
      const e = this.runner.error;
      const div = Object.assign(document.createElement('div'), { className: 'pb-error', textContent: `The program stopped:\n${e instanceof Error ? e.stack ?? e.message : String(e)}` });
      this.screen.canvas.parentElement?.append(div);
    }
  }

  /** the buttons, the paddles, from the keys and the mouse */
  inputs(dt: number): void {
    const k = this.keysDown;
    let b0 = this.mouseButtons & 1 || k.has('ShiftLeft') || k.has('ArrowLeft') ? 0x80 : 0;
    const b1 = this.mouseButtons & 2 || k.has('ShiftRight') || k.has('ArrowRight') ? 0x80 : 0;
    // the plunger: paddle 1 turned up while Down is held; let go, button 0 fires it (not Space: the
    // players' count before a game reads the space bar, and a button there starts the game)
    const now = performance.now();
    if (this.plunger === 'pull') io.pdl[1] = Math.min(255, io.pdl[1] + dt * 0.35);
    else if (this.plunger === 'fire') {
      b0 = 0x80;
      if (now >= this.fireUntil) {
        this.plunger = 'off';
        io.pdl[1] = 0;
      }
    }
    io.btn = [b0, b1];
    io.pdl[0] = 128;
    io.pdl[1] = Math.round(io.pdl[1]);
  }

  private bindInput(host: HTMLElement): void {
    const { signal } = this.ctx;
    const plungerKey = (code: string) => code === 'ArrowDown';
    window.addEventListener('keydown', (e) => {
      if (this.isTyping(e)) return;
      if (!e.repeat) {
        this.keysDown.add(e.code);
        if (plungerKey(e.code) && this.plunger === 'off') {
          this.plunger = 'pull';
          io.pdl[1] = 0;
        }
      }
      const a = appleKey(e);
      if (a !== null && !this.online) io.key = a;
      if (a !== null || plungerKey(e.code) || e.key.startsWith('Arrow') || e.key === 'Shift') e.preventDefault();
    }, { signal });
    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
      if (plungerKey(e.code) && this.plunger === 'pull') {
        this.plunger = 'fire';
        this.fireUntil = performance.now() + 150;
      }
    }, { signal });
    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.mouseButtons = 0;
    }, { signal });
    const at = (e: PointerEvent) => {
      const p = this.screen.toPixel(e.clientX, e.clientY);
      if (p) {
        pointer.x = p.x;
        pointer.y = p.y;
      }
    };
    host.addEventListener('pointermove', at, { signal });
    host.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('.pb-ui, .pb-lobby, .pb-end, .pb-error')) return;
      at(e);
      this.mouseButtons |= e.button === 2 ? 2 : 1;
      host.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    }, { signal });
    host.addEventListener('pointerup', (e) => {
      this.mouseButtons &= e.button === 2 ? ~2 : ~1;
    }, { signal });
    host.addEventListener('pointercancel', () => {
      this.mouseButtons = 0;
    }, { signal });
    host.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
  }

  /** keys meant for the page's own fields (the lobby) */
  private isTyping(e: KeyboardEvent): boolean {
    const t = e.target as HTMLElement | null;
    return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }

  get context(): GameContext {
    return this.ctx;
  }
}

export type { Pinball };
