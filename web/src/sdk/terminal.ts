// Text terminals for the ports of terminal programs (docs/GAME-INTEGRATION.md "Text games"):
//  * Teletype: a scrolling log with line input, as a printing terminal or a line-oriented console
//    (Hunt the Wumpus, Colossal Cave Adventure, GNU Chess, pMARS's cdb).
//  * TextScreen: a fixed character grid with cursor addressing and raw keys, as curses programs use it
//    (Moria).
// Both scale their font so `cols` characters fill the host, read keys from a hidden textarea (so
// phones show their keyboard and paste works), never let game keys scroll the page or trigger browser
// shortcuts that can be stopped, and end with the AbortSignal they are given (pending reads reject).
// The buffer logic (TeletypeBuffer, TextGrid, keyInput) has no DOM and is tested headless.

// ---------------------------------------------------------------------------------------------- keys

/** One key press, with the bytes a VT100/xterm terminal would send for it (`seq`). */
export interface KeyInput {
  /** KeyboardEvent.key: "a", "A", "Enter", "ArrowUp", "Escape", … */
  key: string;
  code: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  /** what a terminal sends: "a", "\r" (Enter), "\x7f" (Backspace), "\x1b" (Esc), "\x12" (Ctrl+R), "\x1b[A" (Up) */
  seq: string;
}

const NAMED: Record<string, string> = {
  Enter: '\r', Backspace: '\x7f', Tab: '\t', Escape: '\x1b',
  ArrowUp: '\x1b[A', ArrowDown: '\x1b[B', ArrowRight: '\x1b[C', ArrowLeft: '\x1b[D',
  Home: '\x1b[H', End: '\x1b[F', Insert: '\x1b[2~', Delete: '\x1b[3~', PageUp: '\x1b[5~', PageDown: '\x1b[6~',
  F1: '\x1bOP', F2: '\x1bOQ', F3: '\x1bOR', F4: '\x1bOS', F6: '\x1b[17~', F7: '\x1b[18~', F8: '\x1b[19~',
  F9: '\x1b[20~', F10: '\x1b[21~',
};

type KeyLike = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'> & { getModifierState?: (k: string) => boolean };

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? '');

/**
 * The terminal's view of a keydown; null for keys a terminal does not see (modifiers alone, F5, F11,
 * F12). Characters typed with AltGr (Windows reports Ctrl+Alt) or macOS's Option are characters, not
 * control or meta keys.
 */
export function keyInput(e: KeyLike, o: { mac?: boolean } = {}): KeyInput | null {
  const mac = o.mac ?? isMac();
  const printable = e.key.length === 1 || [...e.key].length === 1;
  const altGr = !!e.getModifierState?.('AltGraph') || (e.ctrlKey && e.altKey && printable && !/^[a-z]$/i.test(e.key));
  const option = mac && e.altKey && !e.ctrlKey && printable;
  const ctrl = e.ctrlKey && !altGr, alt = e.altKey && !altGr && !option;
  const base = { key: e.key, code: e.code, ctrl, alt, shift: e.shiftKey, meta: e.metaKey };
  let seq: string | undefined;
  if (printable) {
    seq = e.key;
    if (ctrl) {
      const c = e.key.toUpperCase().charCodeAt(0);
      if (c >= 64 && c <= 95) seq = String.fromCharCode(c - 64); // Ctrl+A = 1 … Ctrl+[ = ESC, Ctrl+_ = 31
      else if (e.key === ' ' || e.key === '2') seq = '\0';
      else return null;
    }
  } else {
    seq = e.key === 'Tab' && e.shiftKey ? '\x1b[Z' : NAMED[e.key];
    if (seq === undefined) return null;
  }
  if (alt) seq = `\x1b${seq}`;
  return { ...base, seq };
}

/** Keys the page must keep (copy with a selection, paste, the browser's own F-keys); everything else is the game's. */
function browserKeeps(e: KeyboardEvent, hasSelection: boolean): boolean {
  if (e.metaKey) return true; // macOS shortcuts
  if (['F5', 'F11', 'F12'].includes(e.key)) return true;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey && k === 'v') || (e.shiftKey && e.key === 'Insert')) return true; // paste arrives as a paste event
  if (e.ctrlKey && k === 'c' && hasSelection) return true;
  return false;
}

// ---------------------------------------------------------------------------------------------- buffers

/** A printing terminal's paper: lines of at most `cols` characters, wrapped hard like a teletype. */
export class TeletypeBuffer {
  readonly cols: number;
  readonly maxLines: number;
  /** every line; the last one is where the carriage is */
  lines: string[] = [''];
  /** carriage position in the last line */
  col = 0;
  /** lines from this index on changed since the last takeDirty() (lines may also have been dropped at the top) */
  private firstDirty = 0;
  /** lines dropped from the top since the last takeDirty() */
  private dropped = 0;
  onBell: (() => void) | null = null;

  constructor(cols = 80, maxLines = 2000) {
    this.cols = cols;
    this.maxLines = maxLines;
  }

  write(s: string): void {
    for (const ch of s) {
      const last = this.lines.length - 1;
      if (ch === '\n') this.newline();
      else if (ch === '\r') this.col = 0; // the carriage returns; what follows prints over the line
      else if (ch === '\b') this.col = Math.max(0, this.col - 1);
      else if (ch === '\t') { do this.put(' '); while (this.col % 8 && this.col < this.cols); }
      else if (ch === '\x07') this.onBell?.();
      else if (ch >= ' ' && ch !== '\x7f') this.put(ch);
      this.mark(Math.min(last, this.lines.length - 1));
    }
  }

  private put(ch: string): void {
    if (this.col >= this.cols) this.newline();
    const i = this.lines.length - 1;
    const line = this.lines[i].padEnd(this.col);
    this.lines[i] = line.slice(0, this.col) + ch + line.slice(this.col + 1);
    this.col++;
  }

  private newline(): void {
    this.lines.push('');
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

  /** What changed since the last call: lines dropped at the top, and the first changed line. */
  takeDirty(): { dropped: number; from: number } {
    const d = { dropped: this.dropped, from: this.firstDirty };
    this.dropped = 0;
    this.firstDirty = this.lines.length; // nothing dirty until the next write marks a line
    return d;
  }

  /** The text of the paper (tests, copying). */
  text(): string {
    return this.lines.join('\n');
  }
}

/** Display attributes of a cell (bits). CURSOR marks the cursor cell in runs(). */
export const REVERSE = 1, BOLD = 2, UNDERLINE = 4, CURSOR = 8;

/** A fixed character grid with a cursor, as a curses screen (no DOM: TextScreen draws it). */
export class TextGrid {
  readonly cols: number;
  readonly rows: number;
  row = 0;
  col = 0;
  /** attributes for what is written next (REVERSE | BOLD | UNDERLINE) */
  attr = 0;
  private chars: string[][];
  private attrs: Uint8Array[];
  /** rows changed since the last takeDirty() */
  readonly dirty = new Set<number>();
  onBell: (() => void) | null = null;
  /** called after every change (TextScreen redraws on it) */
  onChange: (() => void) | null = null;
  /** scroll up when writing past the bottom (curses' scrollok); off: the cursor stays on the last row */
  readonly scroll: boolean;

  constructor(cols = 80, rows = 24, o: { scroll?: boolean } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.scroll = o.scroll ?? false;
    this.chars = Array.from({ length: rows }, () => new Array<string>(cols).fill(' '));
    this.attrs = Array.from({ length: rows }, () => new Uint8Array(cols));
    for (let r = 0; r < rows; r++) this.dirty.add(r);
  }

  moveTo(row: number, col: number): void {
    this.row = Math.max(0, Math.min(this.rows - 1, row));
    this.col = Math.max(0, Math.min(this.cols - 1, col));
    this.onChange?.();
  }

  /** Writes at the cursor: \n = next line, \r = column 0, \b = back, \t = next tab stop; wraps and scrolls. */
  write(s: string): void {
    for (const ch of s) {
      if (ch === '\n') { this.col = 0; this.lineFeed(); }
      else if (ch === '\r') this.col = 0;
      else if (ch === '\b') this.col = Math.max(0, this.col - 1);
      else if (ch === '\t') { do this.put(' '); while (this.col % 8 && this.col < this.cols && this.col !== 0); }
      else if (ch === '\x07') this.onBell?.();
      else if (ch >= ' ' && ch !== '\x7f') this.put(ch);
    }
    this.onChange?.();
  }

  /** Writes `s` at (row, col). */
  writeAt(row: number, col: number, s: string): void {
    this.moveTo(row, col);
    this.write(s);
  }

  private put(ch: string): void {
    this.chars[this.row][this.col] = ch;
    this.attrs[this.row][this.col] = this.attr;
    this.dirty.add(this.row);
    if (this.col < this.cols - 1) this.col++;
    else if (this.row < this.rows - 1 || this.scroll) {
      this.col = 0;
      this.lineFeed();
    }
    // the bottom-right cell without scrolling: the cursor stays there (curses)
  }

  private lineFeed(): void {
    if (this.row < this.rows - 1) {
      this.row++;
      return;
    }
    if (!this.scroll) return;
    this.chars.push(this.chars.shift()!.fill(' '));
    this.attrs.push(this.attrs.shift()!.fill(0));
    for (let r = 0; r < this.rows; r++) this.dirty.add(r);
  }

  clear(): void {
    for (let r = 0; r < this.rows; r++) this.clearRow(r, 0);
    this.row = this.col = 0;
    this.onChange?.();
  }

  clearToEol(): void {
    this.clearRow(this.row, this.col);
    this.onChange?.();
  }

  clearToBottom(): void {
    this.clearRow(this.row, this.col);
    for (let r = this.row + 1; r < this.rows; r++) this.clearRow(r, 0);
    this.onChange?.();
  }

  /** The whole screen and cursor (to put back after an overlay, as curses programs save the screen). */
  snapshot(): { chars: string[][]; attrs: Uint8Array[]; row: number; col: number; attr: number } {
    return { chars: this.chars.map((r) => [...r]), attrs: this.attrs.map((a) => a.slice()), row: this.row, col: this.col, attr: this.attr };
  }

  restore(s: ReturnType<TextGrid['snapshot']>): void {
    this.chars = s.chars.map((r) => [...r]);
    this.attrs = s.attrs.map((a) => a.slice());
    this.row = s.row;
    this.col = s.col;
    this.attr = s.attr;
    for (let r = 0; r < this.rows; r++) this.dirty.add(r);
    this.onChange?.();
  }

  private clearRow(r: number, from: number): void {
    this.chars[r].fill(' ', from);
    this.attrs[r].fill(0, from);
    this.dirty.add(r);
  }

  charAt(row: number, col: number): string {
    return this.chars[row][col];
  }

  attrAt(row: number, col: number): number {
    return this.attrs[row][col];
  }

  /** A row as text (tests, copying). */
  rowText(row: number): string {
    return this.chars[row].join('');
  }

  /** Runs of equal attributes in a row, for drawing; with `cursor`, the cursor cell is a run with CURSOR set. */
  runs(row: number, cursor = false): { text: string; attr: number }[] {
    const out: { text: string; attr: number }[] = [];
    const ch = this.chars[row];
    const at = (c: number) => this.attrs[row][c] | (cursor && row === this.row && c === this.col ? CURSOR : 0);
    let start = 0;
    for (let c = 1; c <= this.cols; c++) {
      if (c === this.cols || at(c) !== at(start)) {
        out.push({ text: ch.slice(start, c).join(''), attr: at(start) });
        start = c;
      }
    }
    return out;
  }
}

/** The editing of an input line (no DOM): printable characters append, Backspace deletes. */
export class LineEditor {
  text = '';
  readonly maxLength: number;
  private readonly transform: (s: string) => string;

  constructor(maxLength = 256, transform: (s: string) => string = (s) => s) {
    this.maxLength = maxLength;
    this.transform = transform;
  }

  /** Feeds one key; returns the finished line on Enter, else null. */
  key(k: KeyInput): string | null {
    if (k.seq === '\r') return this.text;
    if (k.seq === '\x7f' || k.seq === '\b') this.text = this.text.slice(0, -1);
    else if (k.seq === '\x15') this.text = ''; // Ctrl+U: kill the line
    else if (k.seq.length === 1 && k.seq >= ' ') this.type(k.seq);
    return null;
  }

  /** Typed or pasted text (control characters dropped). */
  type(s: string): void {
    const clean = this.transform(s.replace(/[\u0000-\u001f\u007f]/g, ''));
    this.text = (this.text + clean).slice(0, this.maxLength);
  }
}

// ---------------------------------------------------------------------------------------------- DOM

export interface TerminalOptions {
  /** characters per line (80; a teletype often had 72) */
  cols?: number;
  /** lines that should fit the host's height at least (24) */
  rows?: number;
  /** CSS font family (a monospace font) */
  font?: string;
  foreground?: string;
  background?: string;
  /** line height in units of the font size */
  lineHeight?: number;
  /** called for BEL (\x07) */
  onBell?: () => void;
}

const TERM_CSS = `
.fg-term { position: absolute; inset: 0; overflow: hidden; }
.fg-term-view { position: absolute; inset: 0; display: flex; justify-content: center; overflow: hidden; }
.fg-term-scroll { overflow-y: auto; overscroll-behavior: contain; }
.fg-term-page { white-space: pre; font-variant-ligatures: none; cursor: text; box-sizing: content-box; padding: .4em 1ch; }
.fg-term-line { min-height: 1lh; }
.fg-term-input { white-space: pre-wrap; word-break: break-all; }
.fg-term-block { animation: fg-term-fade 1s steps(1) infinite; }
@keyframes fg-term-fade { 50% { opacity: 0; } }
.fg-term-cursor { animation: fg-term-blink 1s steps(1) infinite; }
@keyframes fg-term-blink { 50% { background: transparent; color: var(--fg-term-fg); } }
.fg-term-sink { position: absolute; left: 0; top: 0; width: 1px; height: 1px; opacity: 0; border: 0; padding: 0; resize: none; overflow: hidden; }
.fg-term-r { background: var(--fg-term-fg); color: var(--fg-term-bg); }
.fg-term-b { font-weight: bold; }
.fg-term-u { text-decoration: underline; }
`;

/** Keys waiting to be read; generous so that a long paste arrives whole. */
const QUEUE_MAX = 4096;

class AbortError extends Error {
  constructor() {
    super('stopped');
    this.name = 'AbortError';
  }
}

/** What Teletype and TextScreen share: the element, scaling, the key input. */
abstract class TermBase {
  readonly el: HTMLElement;
  /** what scrolls (Teletype) or holds the page (TextScreen); the key field stays outside it */
  protected readonly view: HTMLElement;
  protected readonly page: HTMLElement;
  protected readonly cols: number;
  protected readonly rows: number;
  protected readonly signal: AbortSignal;
  private readonly sink: HTMLTextAreaElement;
  private queue: KeyInput[] = [];
  private waiters: { resolve: (k: KeyInput) => void; reject: (e: Error) => void }[] = [];
  private raf = 0;
  private lineHeight: number;
  private pointerDown = false;

  constructor(host: HTMLElement, o: TerminalOptions, signal: AbortSignal, scroll: boolean) {
    if (!document.getElementById('fg-term-css')) document.head.append(Object.assign(document.createElement('style'), { id: 'fg-term-css', textContent: TERM_CSS }));
    this.cols = o.cols ?? 80;
    this.rows = o.rows ?? 24;
    this.signal = signal;
    this.lineHeight = o.lineHeight ?? 1.2;
    this.el = document.createElement('div');
    this.el.className = 'fg-term';
    const fg = o.foreground ?? '#d8d8d8', bg = o.background ?? '#000';
    this.el.style.background = bg;
    this.view = document.createElement('div');
    this.view.className = `fg-term-view${scroll ? ' fg-term-scroll' : ''}`;
    this.page = document.createElement('div');
    this.page.className = 'fg-term-page';
    this.page.style.setProperty('--fg-term-fg', fg);
    this.page.style.setProperty('--fg-term-bg', bg);
    Object.assign(this.page.style, {
      color: fg,
      fontFamily: o.font ?? 'ui-monospace, "DejaVu Sans Mono", Menlo, Consolas, monospace',
      lineHeight: String(this.lineHeight),
    });
    // keys come through a hidden text field outside the scrolling view: phone keyboards, IMEs and paste
    // work, and text arriving in it never scrolls the view
    this.sink = Object.assign(document.createElement('textarea'), { className: 'fg-term-sink', autocapitalize: 'off', spellcheck: false });
    this.sink.setAttribute('autocomplete', 'off');
    this.sink.setAttribute('aria-label', 'Keyboard input');
    this.view.append(this.page);
    this.el.append(this.view, this.sink);
    host.append(this.el);

    const opt = { signal };
    this.sink.addEventListener('keydown', (e) => this.keydown(e), opt);
    this.sink.addEventListener('input', (e) => { if (!(e as InputEvent).isComposing) this.input(); }, opt);
    this.sink.addEventListener('compositionend', () => this.input(), opt);
    this.sink.addEventListener('paste', (e) => {
      e.preventDefault();
      this.paste(e.clipboardData?.getData('text') ?? '');
    }, opt);
    // selecting text with the pointer must keep the selection: the field takes the keyboard back only
    // after a click that selected nothing, or with the next key
    this.el.addEventListener('pointerdown', () => { this.pointerDown = true; }, opt);
    window.addEventListener('pointerup', () => { this.pointerDown = false; }, { signal, capture: true });
    this.el.addEventListener('pointerup', () => { if (!document.getSelection()?.toString()) this.focus(); }, opt);
    host.addEventListener('focus', () => { if (!this.pointerDown) this.focus(); }, opt);
    host.addEventListener('keydown', (e) => {
      if (e.target !== host) return;
      this.keydown(e);
      if (e.defaultPrevented) this.focus();
    }, opt);
    const ro = new ResizeObserver(() => this.fit());
    ro.observe(host);
    const end = () => {
      ro.disconnect();
      cancelAnimationFrame(this.raf);
      for (const w of this.waiters.splice(0)) w.reject(new AbortError());
      this.el.remove();
    };
    if (signal.aborted) {
      end();
      return;
    }
    signal.addEventListener('abort', end, { once: true });
    this.fit();
    this.focus();
  }

  focus(): void {
    this.sink.focus({ preventScroll: true });
  }

  /** Font size so that `cols` characters fill the width and at least `rows` lines fit the height. */
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
    // the page has a margin of 1ch left and right and .4em top and bottom
    const size = Math.max(6, Math.min(w / ((this.cols + 2) * ratio), h / (this.rows * this.lineHeight + 0.8)));
    this.page.style.fontSize = `${Math.floor(size * 10) / 10}px`;
    this.page.style.width = `${this.cols}ch`;
  }

  /** The next key press (raw: no echo). Rejects when the game stops. */
  readKey(): Promise<KeyInput> {
    if (this.signal.aborted) return Promise.reject(new AbortError());
    const k = this.queue.shift();
    if (k) return Promise.resolve(k);
    return new Promise((resolve, reject) => this.waiters.push({ resolve, reject }));
  }

  /** True if a key press is waiting (curses' nodelay check). */
  keyWaiting(): boolean {
    return this.queue.length > 0;
  }

  protected deliver(k: KeyInput): void {
    const w = this.waiters.shift();
    if (w) w.resolve(k);
    else if (this.queue.length < QUEUE_MAX) this.queue.push(k);
  }

  private keydown(e: KeyboardEvent): void {
    // a key that composes (IME, dead keys) arrives as text when the composition ends
    if (e.isComposing || e.key === 'Process' || e.key === 'Unidentified' || e.key === 'Dead') return;
    if (browserKeeps(e, !!document.getSelection()?.toString())) return;
    const k = keyInput(e);
    if (!k) return;
    e.preventDefault();
    e.stopPropagation();
    this.deliver(k);
  }

  /** Text typed into the field: phone keyboards, finished compositions. */
  private input(): void {
    const text = this.sink.value;
    this.sink.value = '';
    for (const ch of text) {
      const k = ch === '\n' ? 'Enter' : ch;
      this.deliver({ key: k, code: '', ctrl: false, alt: false, shift: false, meta: false, seq: ch === '\n' ? '\r' : ch });
    }
  }

  protected paste(text: string): void {
    for (const ch of text.replace(/\r\n?/g, '\n')) this.deliver({ key: ch === '\n' ? 'Enter' : ch, code: '', ctrl: false, alt: false, shift: false, meta: false, seq: ch === '\n' ? '\r' : ch });
  }

  /** Draws on the next frame (several writes, one redraw). */
  protected schedule(): void {
    if (this.raf || this.signal.aborted) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.draw();
    });
  }

  protected abstract draw(): void;
}

/**
 * A scrolling printing terminal: write() prints, readLine() reads a line with echo (shown as it is
 * typed, printed with the newline on Enter). The paper scrolls; earlier lines stay readable.
 */
export class Teletype extends TermBase {
  readonly buffer: TeletypeBuffer;
  private lineEls: HTMLElement[] = [];
  private editor: LineEditor | null = null;
  private echo = true;
  private inputEl: HTMLElement;
  private cursorEl: HTMLElement;

  constructor(host: HTMLElement, o: TerminalOptions & { scrollback?: number }, signal: AbortSignal) {
    super(host, o, signal, true);
    this.buffer = new TeletypeBuffer(this.cols, o.scrollback ?? 2000);
    this.buffer.onBell = o.onBell ?? null;
    this.inputEl = Object.assign(document.createElement('span'), { className: 'fg-term-input' });
    this.cursorEl = Object.assign(document.createElement('span'), { className: 'fg-term-block', textContent: '█' });
    this.draw();
  }

  write(s: string): void {
    this.buffer.write(s);
    this.schedule();
  }

  writeLine(s = ''): void {
    this.write(`${s}\n`);
  }

  /**
   * Reads one line (Enter ends it; Backspace and Ctrl+U edit). The echo is printed with the newline;
   * with `echo: false` nothing typed is shown. `transform` changes what is typed (e.g. upper case on
   * a teletype that had no lower case).
   */
  async readLine(o: { maxLength?: number; transform?: (s: string) => string; echo?: boolean } = {}): Promise<string> {
    const ed = (this.editor = new LineEditor(o.maxLength ?? 256, o.transform));
    this.echo = o.echo !== false;
    this.schedule();
    try {
      for (;;) {
        const line = ed.key(await this.readKey());
        this.schedule();
        if (line !== null) {
          this.editor = null;
          this.write(`${this.echo ? line : ''}\n`);
          return line;
        }
      }
    } finally {
      if (this.editor === ed) this.editor = null;
    }
  }

  protected override paste(text: string): void {
    if (this.editor) {
      const [first, ...rest] = text.replace(/\r\n?/g, '\n').split('\n');
      this.editor.type(first);
      this.schedule();
      if (rest.length) super.paste('\n' + rest.join('\n'));
      return;
    }
    super.paste(text);
  }

  protected draw(): void {
    const { dropped, from } = this.buffer.takeDirty();
    if (dropped) for (const e of this.lineEls.splice(0, dropped)) e.remove();
    const lines = this.buffer.lines;
    while (this.lineEls.length > lines.length) this.lineEls.pop()!.remove();
    for (let i = Math.min(from, this.lineEls.length); i < lines.length; i++) {
      let e = this.lineEls[i];
      if (!e) {
        e = Object.assign(document.createElement('div'), { className: 'fg-term-line' });
        this.page.append(e);
        this.lineEls.push(e);
      }
      e.textContent = lines[i];
    }
    // the line being typed and the cursor follow the last line
    const last = this.lineEls[this.lineEls.length - 1];
    this.inputEl.textContent = this.editor && this.echo ? this.editor.text : '';
    last.append(this.inputEl, this.cursorEl);
    this.cursorEl.style.visibility = this.editor ? 'visible' : 'hidden';
    this.view.scrollTop = this.view.scrollHeight;
  }
}

/**
 * A curses-style screen: a fixed grid (default 80×24) with cursor addressing, attributes and raw key
 * input. Write through `grid` or the shortcuts; the screen redraws on the next frame either way.
 * Like curses without scrollok, writing at the bottom right does not scroll (`scroll: true` does).
 */
export class TextScreen extends TermBase {
  readonly grid: TextGrid;
  private rowEls: HTMLElement[] = [];
  private cursorShown = true;

  constructor(host: HTMLElement, o: TerminalOptions & { scroll?: boolean }, signal: AbortSignal) {
    super(host, o, signal, false);
    this.grid = new TextGrid(this.cols, this.rows, { scroll: o.scroll });
    this.grid.onBell = o.onBell ?? null;
    this.grid.onChange = () => this.schedule();
    for (let r = 0; r < this.rows; r++) {
      const e = Object.assign(document.createElement('div'), { className: 'fg-term-line' });
      this.page.append(e);
      this.rowEls.push(e);
    }
    this.page.style.alignSelf = 'center';
    this.draw();
  }

  write(s: string): void { this.grid.write(s); }
  writeAt(row: number, col: number, s: string): void { this.grid.writeAt(row, col, s); }
  moveTo(row: number, col: number): void { this.grid.moveTo(row, col); }
  clear(): void { this.grid.clear(); }
  clearToEol(): void { this.grid.clearToEol(); }
  clearToBottom(): void { this.grid.clearToBottom(); }
  setAttr(attr: number): void { this.grid.attr = attr; }
  showCursor(on: boolean): void { this.cursorShown = on; this.grid.dirty.add(this.grid.row); this.schedule(); }

  /**
   * Reads a line at the cursor with echo, as curses' getstr (Enter ends it, Backspace edits). It stays
   * on its row: at most up to the column before the right edge.
   */
  async readLine(o: { maxLength?: number; transform?: (s: string) => string } = {}): Promise<string> {
    const row = this.grid.row, col = this.grid.col;
    const max = Math.max(0, Math.min(o.maxLength ?? 256, this.cols - col - 1));
    const ed = new LineEditor(max, o.transform);
    for (;;) {
      const line = ed.key(await this.readKey());
      this.grid.moveTo(row, col);
      this.grid.clearToEol();
      this.grid.write(ed.text);
      this.grid.moveTo(row, col + ed.text.length);
      if (line !== null) return line;
    }
  }

  protected draw(): void {
    const g = this.grid;
    const rows = [...g.dirty];
    g.dirty.clear();
    for (const r of rows) {
      const e = this.rowEls[r];
      e.replaceChildren();
      for (const run of g.runs(r, this.cursorShown)) {
        if (!run.attr) { e.append(run.text); continue; }
        // the cursor shows as a blinking inverted cell (inverted twice on a reverse cell)
        const reverse = !!(run.attr & REVERSE) !== !!(run.attr & CURSOR);
        const span = document.createElement('span');
        span.textContent = run.text;
        span.className = [reverse ? 'fg-term-r' : '', run.attr & BOLD ? 'fg-term-b' : '', run.attr & UNDERLINE ? 'fg-term-u' : '',
          run.attr & CURSOR ? 'fg-term-cursor' : ''].join(' ').trim();
        e.append(span);
      }
    }
    this.cursorRow = g.row;
  }

  private cursorRow = -1;

  protected override schedule(): void {
    // the cursor moved: its old and new rows need drawing
    if (this.cursorRow >= 0 && this.cursorRow !== this.grid.row) this.grid.dirty.add(this.cursorRow);
    this.grid.dirty.add(this.grid.row);
    super.schedule();
  }
}
