// The 80x24 terminal on the page: a canvas of coloured monospace cells. The original uses curses; this
// draws the same grid without a font file (the browser's monospace) and reads keys like a terminal.
import { keyInput } from '../../../src/sdk/index.ts';
import { colourOf } from './game/data.ts';
import { SCREEN_H, SCREEN_W } from './game/model.ts';

export interface Surface {
  clear(): void;
  put(x: number, y: number, text: string, fg?: string, bg?: string, bold?: boolean): void;
  flush(): void;
  readKey(): Promise<string>;
  text(): string;
  destroy(): void;
}

interface Cell { ch: string; fg: string; bg: string; bold: boolean }

export class CanvasSurface implements Surface {
  readonly canvas: HTMLCanvasElement;
  private readonly cells: Cell[][] = [];
  private readonly keyQueue: string[] = [];
  private waiter: ((k: string) => void) | null = null;
  private readonly input: HTMLTextAreaElement;
  private readonly observer: ResizeObserver;
  private cellW = 8;
  private cellH = 16;
  private dpr = 1;
  private readonly host: HTMLElement;
  private readonly signal: AbortSignal;

  constructor(host: HTMLElement, signal: AbortSignal) {
    this.host = host;
    this.signal = signal;
    host.replaceChildren();
    host.style.background = '#000';
    host.style.overflow = 'hidden';
    host.style.position = 'relative';
    host.tabIndex = 0;
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.outline = 'none';
    this.canvas.style.imageRendering = 'pixelated';
    host.append(this.canvas);
    this.input = document.createElement('textarea');
    this.input.setAttribute('autocapitalize', 'off');
    this.input.setAttribute('autocomplete', 'off');
    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('aria-label', 'Dungeon Crawl Stone Soup input');
    Object.assign(this.input.style, {
      position: 'absolute', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', border: '0',
      padding: '0', resize: 'none', overflow: 'hidden', zIndex: '2',
    });
    host.append(this.input);
    for (let y = 0; y < SCREEN_H; y++) {
      this.cells.push(Array.from({ length: SCREEN_W }, () => ({ ch: ' ', fg: '#bebebe', bg: '#000', bold: false })));
    }
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
    host.addEventListener('pointerdown', () => this.input.focus(), { signal });
    this.input.addEventListener('keydown', (e) => this.onKey(e), { signal });
    this.input.addEventListener('blur', () => { /* the page's fields may take focus; a click gives it back */ });
    signal.addEventListener('abort', () => this.destroy(), { once: true });
    this.input.focus();
    this.flush();
  }

  private resize(): void {
    const r = this.host.getBoundingClientRect();
    const w = Math.max(80, r.width), h = Math.max(24, r.height);
    const cw = Math.max(4, Math.floor(w / SCREEN_W));
    const ch = Math.max(6, Math.floor(h / SCREEN_H));
    this.cellW = cw;
    this.cellH = ch;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = cw * SCREEN_W * this.dpr;
    this.canvas.height = ch * SCREEN_H * this.dpr;
    this.canvas.style.width = `${cw * SCREEN_W}px`;
    this.canvas.style.height = `${ch * SCREEN_H}px`;
    this.flush();
  }

  clear(): void {
    for (const row of this.cells) for (const c of row) { c.ch = ' '; c.fg = '#bebebe'; c.bg = '#000'; c.bold = false; }
  }

  put(x: number, y: number, text: string, fg = 'LIGHTGREY', bg = 'BLACK', bold = false): void {
    if (y < 0 || y >= SCREEN_H) return;
    const f = colourOf(fg), b = colourOf(bg);
    let col = x;
    for (const ch of text) {
      if (col >= SCREEN_W) break;
      if (col >= 0) {
        const c = this.cells[y][col];
        c.ch = ch;
        c.fg = f;
        c.bg = b;
        c.bold = bold;
      }
      col++;
    }
  }

  flush(): void {
    const g = this.canvas.getContext('2d');
    if (!g) return;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.fillStyle = '#000';
    g.fillRect(0, 0, this.cellW * SCREEN_W, this.cellH * SCREEN_H);
    g.textBaseline = 'top';
    const fontPx = Math.max(6, Math.floor(this.cellH * 0.86));
    for (let y = 0; y < SCREEN_H; y++) {
      const row = this.cells[y];
      for (let x = 0; x < SCREEN_W; x++) {
        const c = row[x];
        if (c.bg !== '#000000') { g.fillStyle = c.bg; g.fillRect(x * this.cellW, y * this.cellH, this.cellW, this.cellH); }
        if (c.ch === ' ') continue;
        g.font = `${c.bold ? '700 ' : ''}${fontPx}px "DejaVu Sans Mono", "Liberation Mono", monospace`;
        g.fillStyle = c.fg;
        g.fillText(c.ch, x * this.cellW, y * this.cellH + Math.max(0, Math.floor((this.cellH - fontPx) / 2)) - 1);
      }
    }
  }

  text(): string {
    return this.cells.map((row) => row.map((c) => c.ch).join('')).join('\n');
  }

  private onKey(e: KeyboardEvent): void {
    if (e.metaKey) return;
    if (['F5', 'F11', 'F12'].includes(e.key)) return;
    const k = e.key.toLowerCase();
    const sel = window.getSelection();
    if ((e.ctrlKey && k === 'v') || (e.shiftKey && e.key === 'Insert')) return;
    if (e.ctrlKey && k === 'c' && sel && !sel.isCollapsed) return;
    const input = keyInput(e);
    if (!input) return;
    // keys the page would otherwise use (arrows, space, /) belong to the game
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown',
      'Space', 'Tab', '/'].includes(e.key) || e.ctrlKey || e.altKey === false) {
      e.preventDefault();
    }
    const seq = input.seq;
    if (this.waiter) { const w = this.waiter; this.waiter = null; w(seq); }
    else this.keyQueue.push(seq);
  }

  readKey(): Promise<string> {
    if (this.keyQueue.length) return Promise.resolve(this.keyQueue.shift()!);
    if (this.signal.aborted) return Promise.reject(new Error('stopped'));
    return new Promise((resolve, reject) => {
      this.waiter = resolve;
      this.signal.addEventListener('abort', () => reject(new Error('stopped')), { once: true });
    });
  }

  destroy(): void {
    this.observer.disconnect();
    this.canvas.remove();
    this.input.remove();
    this.waiter = null;
  }
}

/** A surface for the tests: keys are queued, every flush can be recorded. */
export class HeadlessSurface implements Surface {
  readonly grid: string[][] = [];
  readonly colours: string[][] = [];
  keys: string[] = [];
  frames = 0;
  private waiter: ((k: string) => void) | null = null;
  private queue: string[] = [];
  constructor() { this.clear(); }
  clear(): void {
    this.grid.length = 0;
    this.colours.length = 0;
    for (let y = 0; y < SCREEN_H; y++) {
      this.grid.push(new Array<string>(SCREEN_W).fill(' '));
      this.colours.push(new Array<string>(SCREEN_W).fill('LIGHTGREY'));
    }
  }
  put(x: number, y: number, text: string, fg = 'LIGHTGREY'): void {
    if (y < 0 || y >= SCREEN_H) return;
    let i = x;
    for (const ch of text) {
      if (i >= 0 && i < SCREEN_W) { this.grid[y][i] = ch; this.colours[y][i] = fg; }
      i++;
    }
  }
  flush(): void { this.frames++; }
  text(): string { return this.grid.map((r) => r.join('')).join('\n'); }
  readKey(): Promise<string> {
    if (this.queue.length) return Promise.resolve(this.queue.shift()!);
    return new Promise((resolve) => { this.waiter = resolve; });
  }
  /** queue keys for the game; returns when they are all taken */
  send(keys: string): void {
    for (const k of keys) {
      if (this.waiter) { const w = this.waiter; this.waiter = null; w(k); }
      else this.queue.push(k);
    }
  }
  destroy(): void { this.waiter = null; }
}
