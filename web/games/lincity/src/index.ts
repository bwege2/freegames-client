// Lincity 1.13.1 in the browser. The page side: the window (a 640x480 PixelScreen showing the program's
// pixmap through its palette), keys and mouse as X events, the pirate cursor, and the files the program
// keeps in ~/.lincity and ~/.lincityrc as the account's storage. The program runs in a worker (worker.ts).
import { PixelScreen, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import packUrl from '../assets/lincity-data.bin?url';
import { makeShared, pushEvent, CTL, type Shared } from './shared.ts';
import type { FromWorker, ToWorker } from './worker.ts';
import { KeyPress, ButtonPress, ButtonRelease, MotionNotify, ShiftMask, ControlMask, Button2Mask } from './lc/platform.ts';
import { storageName, homePath } from './files.ts';
import { pirateCursor } from './cursor.ts';

const W = 640, H = 480;

/** the files the program had: ~/.lincityrc and the scenes of ~/.lincity */
async function loadFiles(ctx: GameContext): Promise<[string, Uint8Array][]> {
  const out: [string, Uint8Array][] = [];
  try {
    const list = await ctx.storage.list('');
    for (const f of list) {
      const d = await ctx.storage.get(f.name);
      const p = d && homePath(f.name, d);
      if (d && p) out.push([p, d]);
    }
  } catch {
    // no server: the game runs, and nothing is kept
  }
  return out;
}

async function loadPack(signal: AbortSignal): Promise<Uint8Array> {
  const r = await fetch(packUrl, { signal });
  if (!r.ok) throw new Error(`the game's data could not be loaded (${r.status})`);
  return new Uint8Array(await r.arrayBuffer());
}

class LincityPage {
  private readonly screen: PixelScreen;
  private readonly image: ImageData;
  private readonly shared: Shared;
  private readonly ctl: Int32Array;
  private readonly ev: Int32Array;
  private readonly pix: Uint8Array;
  private readonly pal: Uint8Array;
  private worker: Worker | null = null;
  private lastFrame = -1;
  private buttons = 0;
  private saving: Promise<unknown> = Promise.resolve();
  private readonly message: HTMLDivElement;
  private readonly ctx: GameContext;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.screen = new PixelScreen(host, { width: W, height: H }, ctx.signal);
    this.image = this.screen.ctx.createImageData(W, H);
    this.shared = makeShared();
    this.ctl = new Int32Array(this.shared.ctl);
    this.ev = new Int32Array(this.shared.events);
    this.pix = new Uint8Array(this.shared.pixels);
    this.pal = new Uint8Array(this.shared.palette);
    this.message = document.createElement('div');
    this.message.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;'
      + 'color:#ccc;font:14px monospace;text-align:center;white-space:pre-wrap;pointer-events:none';
    this.message.textContent = 'Loading Lincity…';
    host.style.position = 'relative';
    host.appendChild(this.message);
    this.input(host);
    ctx.frame(() => this.draw());
  }

  async start(): Promise<void> {
    if (!crossOriginIsolated) {
      this.message.textContent = 'Lincity needs a cross-origin isolated page (SharedArrayBuffer).';
      return;
    }
    const [pack, files] = await Promise.all([loadPack(this.ctx.signal), loadFiles(this.ctx)]);
    if (this.ctx.signal.aborted) return;
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module', name: 'lincity' });
    this.worker = w;
    w.onmessage = (e: MessageEvent<FromWorker>) => this.fromWorker(e.data);
    const m: ToWorker = { t: 'start', pack, files, shared: this.shared, now: Date.now() };
    w.postMessage(m);
  }

  fail(e: unknown): void {
    if (!this.ctx.signal.aborted) this.message.textContent = `Lincity could not start:\n${e instanceof Error ? e.message : String(e)}`;
  }

  stop(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  private fromWorker(m: FromWorker): void {
    switch (m.t) {
      case 'file': this.keep(m.path, m.data); break;
      case 'cursor': this.screen.canvas.style.cursor = m.pirate ? pirateCursor() : 'default'; break;
      case 'exit': void this.saving.then(() => this.ctx.exit()); break;
      case 'error': this.message.textContent = `Lincity stopped:\n${m.message}`; break;
    }
  }

  /** a file the program wrote (or removed) in the home directory goes to the account's storage */
  private keep(path: string, data: Uint8Array | null): void {
    const name = storageName(path);
    if (!name) return; // res.tmp, results, tmp-save: the program's scratch files
    const storage = this.ctx.storage;
    this.saving = this.saving.then(async (): Promise<void> => {
      if (data) await storage.put(name, data);
      else await storage.delete(name);
    }).catch((e: unknown) => {
      if (this.ctx.signal.aborted) return;
      this.message.textContent = `${path.slice(path.lastIndexOf('/') + 1)} was not saved on the server:\n${e instanceof Error ? e.message : String(e)}`;
      setTimeout(() => { this.message.textContent = ''; }, 5000);
    });
  }

  private draw(): void {
    const frame = Atomics.load(this.ctl, CTL.FRAME);
    if (frame === this.lastFrame) return;
    this.lastFrame = frame;
    const w = Atomics.load(this.ctl, CTL.W), h = Atomics.load(this.ctl, CTL.H);
    if (w <= 0 || h <= 0) return;
    if (this.message.textContent === 'Loading Lincity…') this.message.textContent = '';
    const d = this.image.data, p = this.pix, pal = this.pal;
    for (let y = 0; y < H && y < h; y++) {
      for (let x = 0; x < W && x < w; x++) {
        const c = p[y * w + x] * 3;
        const o = (y * W + x) * 4;
        // the palette's 6-bit values, as the X server shows them (v << 10 as a 16-bit colour)
        d[o] = pal[c] << 2;
        d[o + 1] = pal[c + 1] << 2;
        d[o + 2] = pal[c + 2] << 2;
        d[o + 3] = 255;
      }
    }
    this.screen.ctx.putImageData(this.image, 0, 0);
  }

  /** an event for the program; with the queue full (EV_CAP unread events) the newest is dropped (shared.ts) */
  private push(type: number, keysym: number, ch: number, state: number, button: number): void {
    pushEvent(this.ctl, this.ev, [type, keysym, ch, state, button]);
  }

  private input(host: HTMLElement): void {
    const signal = this.ctx.signal;
    const canvas = this.screen.canvas;
    host.tabIndex = 0;
    host.focus();
    const mods = (e: KeyboardEvent | MouseEvent): number => (e.shiftKey ? ShiftMask : 0) | (e.ctrlKey ? ControlMask : 0);
    host.addEventListener('keydown', (e) => {
      const k = keyOf(e);
      if (!k) return;
      e.preventDefault();
      this.push(KeyPress, k[0], k[1], mods(e) | this.buttonState(), 0);
    }, { signal });
    const move = (e: MouseEvent): void => {
      const r = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) / r.width * W);
      const y = Math.floor((e.clientY - r.top) / r.height * H);
      const moved = x !== Atomics.load(this.ctl, CTL.PX) || y !== Atomics.load(this.ctl, CTL.PY);
      Atomics.store(this.ctl, CTL.PX, x);
      Atomics.store(this.ctl, CTL.PY, y);
      if (moved && this.buttons) this.push(MotionNotify, 0, 0, this.buttonState(), 0);
      else Atomics.notify(this.ctl, CTL.WRITE);
    };
    canvas.addEventListener('pointermove', move, { signal });
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      host.focus();
      move(e);
      canvas.setPointerCapture(e.pointerId);
      const b = e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : 0;
      if (!b) return;
      this.push(ButtonPress, 0, 0, mods(e) | this.buttonState(), b);
      this.buttons |= 1 << (b - 1);
    }, { signal });
    canvas.addEventListener('pointerup', (e) => {
      move(e);
      const b = e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : 0;
      if (!b) return;
      this.push(ButtonRelease, 0, 0, mods(e) | this.buttonState(), b);
      this.buttons &= ~(1 << (b - 1));
    }, { signal });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    canvas.addEventListener('wheel', (e) => {
      // the X server's buttons 4 (up) and 5 (down), each a press and a release
      e.preventDefault();
      const b = e.deltaY < 0 ? 4 : 5;
      this.push(ButtonPress, 0, 0, mods(e), b);
      this.push(ButtonRelease, 0, 0, mods(e), b);
    }, { signal, passive: false });
  }

  /** Button1Mask.. for the held buttons */
  private buttonState(): number {
    return ((this.buttons & 1) ? 1 << 8 : 0) | ((this.buttons & 2) ? Button2Mask : 0) | ((this.buttons & 4) ? 1 << 10 : 0);
  }
}

/** a browser key as the X KeySym and the character XLookupString gives */
function keyOf(e: KeyboardEvent): [number, number] | null {
  switch (e.key) {
    case 'ArrowLeft': return [0xff51, 0];
    case 'ArrowUp': return [0xff52, 0];
    case 'ArrowRight': return [0xff53, 0];
    case 'ArrowDown': return [0xff54, 0];
    case 'Backspace': return [0xff08, 8];
    case 'Delete': return [0xffff, 127];
    case 'Enter': return [0xff0d, 13];
    case 'Escape': return [0xff1b, 27];
    case 'Tab': return [0xff09, 9];
  }
  if (e.key.length === 1 && !e.altKey && !e.metaKey) {
    let c = e.key.charCodeAt(0);
    if (c > 255) return null;
    if (e.ctrlKey && /[a-z]/i.test(e.key)) c = e.key.toUpperCase().charCodeAt(0) - 64;
    return [e.key.charCodeAt(0), c];
  }
  return null;
}

export const start: StartGame = async (host, ctx) => {
  const page = new LincityPage(host, ctx);
  await page.start().catch((e: unknown) => page.fail(e));
  return { stop: () => page.stop() };
};

