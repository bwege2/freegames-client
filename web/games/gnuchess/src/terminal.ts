// The terminal GNU Chess runs in: a scrolling printing terminal like the SDK's Teletype, but one that
// also understands what the program's "graphic" board writes: UTF-8 (the Unicode chess pieces) and
// the ANSI colour sequences ESC[7;37m, ESC[7;35m and ESC[0m (reverse video in white and in magenta, the
// squares of the board). The SDK's Teletype shows text only, so the port has its own (README).
// Keys come from a hidden text field (phone keyboards, IMEs, paste), as in the SDK; the line editing
// is the SDK's LineEditor. A read can be cancelled: the online game types the opponent's moves.
import { LineEditor, keyInput, type KeyInput } from '../../../src/sdk/index.ts';

/** a character cell's look: SGR attributes */
interface Style {
  reverse: boolean;
  bold: boolean;
  underline: boolean;
  fg: number; // -1 default, 0..7
  bg: number;
}
const PLAIN: Style = { reverse: false, bold: false, underline: false, fg: -1, bg: -1 };
const sameStyle = (a: Style, b: Style): boolean =>
  a.reverse === b.reverse && a.bold === b.bold && a.underline === b.underline && a.fg === b.fg && a.bg === b.bg;

/** the 8 ANSI colours as xterm shows them */
const PALETTE = ['#000000', '#cd0000', '#00cd00', '#cdcd00', '#4060ee', '#cd00cd', '#00cdcd', '#e5e5e5'];

interface Cell {
  ch: string;
  style: Style;
}

/** the paper: lines of cells, wrapped hard at `cols`, with an ANSI/UTF-8 decoder in front (no DOM) */
export class AnsiBuffer {
  readonly cols: number;
  readonly maxLines: number;
  lines: Cell[][] = [[]];
  col = 0;
  style: Style = { ...PLAIN };
  private esc: string | null = null;
  private readonly decoder = new TextDecoder('utf-8');
  /** lines from this index on changed since takeDirty(); lines dropped at the top since then */
  private firstDirty = 0;
  private dropped = 0;

  constructor(cols = 80, maxLines = 3000) {
    this.cols = cols;
    this.maxLines = maxLines;
  }

  /** bytes the program wrote (a byte string: one char per byte) */
  writeBytes(s: string): void {
    const b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 255;
    this.write(this.decoder.decode(b, { stream: true }));
  }

  /** text (already decoded) */
  write(s: string): void {
    for (const ch of s) {
      if (this.esc !== null) {
        this.esc += ch;
        if (this.esc.length === 1 && ch !== '[') this.esc = null; // not a CSI: drop the ESC
        else if (this.esc.length > 1 && ch >= '@' && ch <= '~') {
          if (ch === 'm') this.sgr(this.esc.slice(1, -1));
          this.esc = null;
        } else if (this.esc.length > 32) this.esc = null;
        continue;
      }
      if (ch === '\x1b') this.esc = '';
      else if (ch === '\n') this.newline();
      else if (ch === '\r') this.col = 0;
      else if (ch === '\b') this.col = Math.max(0, this.col - 1);
      else if (ch === '\t') {
        do this.put(' ');
        while (this.col % 8 && this.col < this.cols);
      } else if (ch >= ' ' && ch !== '\x7f') this.put(ch);
      this.mark(this.lines.length - 1);
    }
  }

  private sgr(params: string): void {
    const ps = params === '' ? [0] : params.split(';').map((p) => parseInt(p, 10) || 0);
    for (const p of ps) {
      if (p === 0) this.style = { ...PLAIN };
      else if (p === 1) this.style = { ...this.style, bold: true };
      else if (p === 4) this.style = { ...this.style, underline: true };
      else if (p === 7) this.style = { ...this.style, reverse: true };
      else if (p === 22) this.style = { ...this.style, bold: false };
      else if (p === 24) this.style = { ...this.style, underline: false };
      else if (p === 27) this.style = { ...this.style, reverse: false };
      else if (p >= 30 && p <= 37) this.style = { ...this.style, fg: p - 30 };
      else if (p === 39) this.style = { ...this.style, fg: -1 };
      else if (p >= 40 && p <= 47) this.style = { ...this.style, bg: p - 40 };
      else if (p === 49) this.style = { ...this.style, bg: -1 };
    }
  }

  private put(ch: string): void {
    if (this.col >= this.cols) this.newline();
    const line = this.lines[this.lines.length - 1];
    while (line.length < this.col) line.push({ ch: ' ', style: PLAIN });
    line[this.col] = { ch, style: this.style };
    this.col++;
  }

  private newline(): void {
    this.lines.push([]);
    this.col = 0;
    if (this.lines.length > this.maxLines) {
      const n = this.lines.length - this.maxLines;
      this.lines.splice(0, n);
      this.dropped += n;
      this.firstDirty = Math.max(0, this.firstDirty - n);
    }
    this.mark(this.lines.length - 2);
  }

  private mark(i: number): void {
    if (i < this.firstDirty) this.firstDirty = Math.max(0, i);
  }

  takeDirty(): { dropped: number; from: number } {
    const d = { dropped: this.dropped, from: this.firstDirty };
    this.dropped = 0;
    this.firstDirty = this.lines.length;
    return d;
  }

  /** the text of a line */
  lineText(i: number): string {
    return this.lines[i].map((c) => c.ch).join('');
  }

  /** all the text (tests, screenshots) */
  text(): string {
    return this.lines.map((_, i) => this.lineText(i)).join('\n');
  }
}

const CSS = `
.gc-term { position: absolute; inset: 0; overflow: hidden; }
.gc-term-view { position: absolute; inset: 0; display: flex; justify-content: center; overflow-y: auto; overscroll-behavior: contain; }
.gc-term-page { white-space: pre; font-variant-ligatures: none; cursor: text; box-sizing: content-box; padding: .4em 1ch; }
.gc-term-line { min-height: 1lh; }
.gc-term-cursor { animation: gc-term-blink 1s steps(1) infinite; }
@keyframes gc-term-blink { 50% { opacity: 0; } }
.gc-term-sink { position: absolute; left: 0; top: 0; width: 1px; height: 1px; opacity: 0; border: 0; padding: 0; resize: none; overflow: hidden; }
`;

class Cancelled extends Error {
  constructor() {
    super('cancelled');
    this.name = 'AbortError';
  }
}

export interface TerminalOptions {
  cols?: number;
  rows?: number;
  foreground?: string;
  background?: string;
  scrollback?: number;
}

/** The DOM terminal: write() prints (bytes or text), readLine() reads a line with echo. */
export class ChessTerminal {
  readonly el: HTMLElement;
  readonly buffer: AnsiBuffer;
  private readonly view: HTMLElement;
  private readonly page: HTMLElement;
  private readonly sink: HTMLTextAreaElement;
  private readonly cols: number;
  private readonly rows: number;
  private readonly fg: string;
  private readonly bg: string;
  private readonly signal: AbortSignal;
  private lineEls: HTMLElement[] = [];
  private editor: LineEditor | null = null;
  private readonly inputEl: HTMLElement;
  private readonly cursorEl: HTMLElement;
  private queue: KeyInput[] = [];
  private waiter: { resolve: (k: KeyInput) => void; reject: (e: Error) => void } | null = null;
  private raf = 0;
  private pointerDown = false;
  /** lines typed but not yet read (Enter pressed while no read was waiting: type-ahead) */
  private typed: string[] = [];

  constructor(host: HTMLElement, o: TerminalOptions, signal: AbortSignal) {
    if (!document.getElementById('gc-term-css')) document.head.append(Object.assign(document.createElement('style'), { id: 'gc-term-css', textContent: CSS }));
    this.cols = o.cols ?? 80;
    this.rows = o.rows ?? 24;
    this.fg = o.foreground ?? '#d8d8d8';
    this.bg = o.background ?? '#000';
    this.signal = signal;
    this.buffer = new AnsiBuffer(this.cols, o.scrollback ?? 3000);
    this.el = Object.assign(document.createElement('div'), { className: 'gc-term' });
    this.el.style.background = this.bg;
    this.view = Object.assign(document.createElement('div'), { className: 'gc-term-view' });
    // fg-term-page as well: the site's tools (scripts/e2e.mjs) find a terminal by the SDK's class, whose rules are the same
    this.page = Object.assign(document.createElement('div'), { className: 'gc-term-page fg-term-page' });
    Object.assign(this.page.style, {
      color: this.fg,
      fontFamily: 'ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, "Segoe UI Symbol", monospace',
      lineHeight: '1.2',
    });
    this.sink = Object.assign(document.createElement('textarea'), { className: 'gc-term-sink', autocapitalize: 'off', spellcheck: false });
    this.sink.setAttribute('autocomplete', 'off');
    this.sink.setAttribute('aria-label', 'Keyboard input');
    this.inputEl = document.createElement('span');
    this.cursorEl = Object.assign(document.createElement('span'), { className: 'gc-term-cursor', textContent: '█' });
    this.view.append(this.page);
    this.el.append(this.view, this.sink);
    host.append(this.el);

    const opt = { signal };
    this.sink.addEventListener('keydown', (e) => this.keydown(e), opt);
    this.sink.addEventListener('input', (e) => {
      if (!(e as InputEvent).isComposing) this.input();
    }, opt);
    this.sink.addEventListener('compositionend', () => this.input(), opt);
    this.sink.addEventListener('paste', (e) => {
      e.preventDefault();
      this.paste(e.clipboardData?.getData('text') ?? '');
    }, opt);
    this.el.addEventListener('pointerdown', () => {
      this.pointerDown = true;
    }, opt);
    window.addEventListener('pointerup', () => {
      this.pointerDown = false;
    }, { signal, capture: true });
    this.el.addEventListener('pointerup', () => {
      if (!document.getSelection()?.toString()) this.focus();
    }, opt);
    host.addEventListener('focus', () => {
      if (!this.pointerDown) this.focus();
    }, opt);
    const ro = new ResizeObserver(() => this.fit());
    ro.observe(host);
    const end = (): void => {
      ro.disconnect();
      cancelAnimationFrame(this.raf);
      this.waiter?.reject(new Cancelled());
      this.waiter = null;
      this.el.remove();
    };
    if (signal.aborted) end();
    else signal.addEventListener('abort', end, { once: true });
    this.fit();
    this.focus();
    this.draw();
  }

  focus(): void {
    this.sink.focus({ preventScroll: true });
  }

  /** bytes of the program's output (a byte string) */
  writeBytes(s: string): void {
    this.buffer.writeBytes(s);
    this.schedule();
  }

  /** text of the page's own (messages of the online game) */
  write(s: string): void {
    this.buffer.write(s);
    this.schedule();
  }

  /**
   * Reads one line (Enter ends it; Backspace and Ctrl+U edit), echoed with its newline. `initial` is
   * text already typed (a read that was cancelled); `cancel` aborts the read, which then rejects with
   * the text typed so far in the error's `partial`.
   */
  async readLine(o: { maxLength?: number; initial?: string; cancel?: AbortSignal } = {}): Promise<string> {
    const pending = this.typed.shift();
    if (pending !== undefined) {
      this.write(pending + '\n');
      return pending;
    }
    const ed = (this.editor = new LineEditor(o.maxLength ?? 256));
    if (o.initial) ed.type(o.initial);
    this.schedule();
    const onCancel = (): void => {
      if (this.waiter) {
        const w = this.waiter;
        this.waiter = null;
        w.reject(new Cancelled());
      }
    };
    o.cancel?.addEventListener('abort', onCancel, { once: true });
    try {
      for (;;) {
        if (o.cancel?.aborted) throw new Cancelled();
        const line = ed.key(await this.readKey());
        this.schedule();
        if (line !== null) {
          this.editor = null;
          this.write(line + '\n');
          return line;
        }
      }
    } catch (e) {
      if (e instanceof Cancelled) Object.assign(e, { partial: ed.text });
      throw e;
    } finally {
      o.cancel?.removeEventListener('abort', onCancel);
      if (this.editor === ed) this.editor = null;
      this.schedule();
    }
  }

  /** the text being typed (the online game keeps it when it cancels a read) */
  get editing(): string {
    return this.editor?.text ?? '';
  }

  private readKey(): Promise<KeyInput> {
    if (this.signal.aborted) return Promise.reject(new Cancelled());
    const k = this.queue.shift();
    if (k) return Promise.resolve(k);
    return new Promise((resolve, reject) => {
      this.waiter = { resolve, reject };
    });
  }

  private deliver(k: KeyInput): void {
    if (this.waiter) {
      const w = this.waiter;
      this.waiter = null;
      w.resolve(k);
    } else if (this.queue.length < 4096) this.queue.push(k);
  }

  private keydown(e: KeyboardEvent): void {
    if (e.isComposing || e.key === 'Process' || e.key === 'Unidentified' || e.key === 'Dead') return;
    if (e.metaKey || ['F5', 'F11', 'F12'].includes(e.key)) return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey && k === 'v') || (e.shiftKey && e.key === 'Insert')) return;
    if (e.ctrlKey && k === 'c' && document.getSelection()?.toString()) return;
    const ki = keyInput(e);
    if (!ki) return;
    e.preventDefault();
    e.stopPropagation();
    this.deliver(ki);
  }

  private input(): void {
    const text = this.sink.value;
    this.sink.value = '';
    for (const ch of text) {
      this.deliver({ key: ch === '\n' ? 'Enter' : ch, code: '', ctrl: false, alt: false, shift: false, meta: false, seq: ch === '\n' ? '\r' : ch });
    }
  }

  private paste(text: string): void {
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    if (this.editor) {
      this.editor.type(lines.shift() ?? '');
      this.schedule();
      if (lines.length) {
        this.deliver({ key: 'Enter', code: 'Enter', ctrl: false, alt: false, shift: false, meta: false, seq: '\r' });
        if (lines[lines.length - 1] === '') lines.pop();
        this.typed.push(...lines);
      }
      return;
    }
    if (lines[lines.length - 1] === '') lines.pop();
    this.typed.push(...lines);
  }

  private fit(): void {
    const host = this.el.parentElement;
    if (!host) return;
    const probe = document.createElement('span');
    probe.textContent = 'M'.repeat(100);
    probe.style.fontSize = '100px';
    this.page.append(probe);
    const ratio = probe.getBoundingClientRect().width / 100 / 100 || 0.6;
    probe.remove();
    const w = host.clientWidth, h = host.clientHeight;
    const size = Math.max(6, Math.min(w / ((this.cols + 2) * ratio), h / (this.rows * 1.2 + 0.8)));
    this.page.style.fontSize = `${Math.floor(size * 10) / 10}px`;
    this.page.style.width = `${this.cols}ch`;
  }

  private schedule(): void {
    if (this.raf || this.signal.aborted) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  /** a line's cells as spans of equal style; a character outside ASCII (the chess pieces) gets a cell of its own, one column wide, as a terminal shows it */
  private renderLine(e: HTMLElement, cells: Cell[]): void {
    e.textContent = '';
    let i = 0;
    const wide = (ch: string): boolean => ch.charCodeAt(0) > 0x7e;
    while (i < cells.length) {
      const st = cells[i].style;
      let text = '';
      let cols = 0;
      if (wide(cells[i].ch)) {
        // a piece and the space after it (one square of the graphic board): one box two columns wide,
        // so that a glyph wider than a column is not covered by the next cell
        text = cells[i++].ch;
        cols = 1;
        if (i < cells.length && cells[i].ch === ' ' && sameStyle(cells[i].style, st)) {
          i++;
          cols = 2;
        }
      } else while (i < cells.length && sameStyle(cells[i].style, st) && !wide(cells[i].ch)) text += cells[i++].ch;
      if (sameStyle(st, PLAIN) && !cols) e.append(text);
      else {
        const s = document.createElement('span');
        s.textContent = text;
        if (cols) Object.assign(s.style, { display: 'inline-block', width: `${cols}ch`, textAlign: 'center', verticalAlign: 'top', lineHeight: 'inherit' });
        let fg = st.fg < 0 ? this.fg : PALETTE[st.fg];
        let bg = st.bg < 0 ? this.bg : PALETTE[st.bg];
        if (st.reverse) [fg, bg] = [bg, fg];
        s.style.color = fg;
        if (st.reverse || st.bg >= 0) s.style.background = bg;
        if (st.bold) s.style.fontWeight = 'bold';
        if (st.underline) s.style.textDecoration = 'underline';
        e.append(s);
      }
    }
  }

  private draw(): void {
    const { dropped, from } = this.buffer.takeDirty();
    if (dropped) for (const e of this.lineEls.splice(0, dropped)) e.remove();
    const lines = this.buffer.lines;
    while (this.lineEls.length > lines.length) this.lineEls.pop()!.remove();
    for (let i = Math.min(from, this.lineEls.length); i < lines.length; i++) {
      let e = this.lineEls[i];
      if (!e) {
        e = Object.assign(document.createElement('div'), { className: 'gc-term-line' });
        this.page.append(e);
        this.lineEls.push(e);
      }
      this.renderLine(e, lines[i]);
    }
    const last = this.lineEls[this.lineEls.length - 1];
    this.inputEl.textContent = this.editor ? this.editor.text : '';
    last.append(this.inputEl, this.cursorEl);
    this.cursorEl.style.visibility = this.editor ? 'visible' : 'hidden';
    this.view.scrollTop = this.view.scrollHeight;
  }
}
