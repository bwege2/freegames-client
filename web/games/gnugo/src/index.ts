// GNU Go 3.8 on the website: the program in its ASCII mode (`gnugo --mode ascii`), at its prompt, as in a
// terminal. The page starts it with a command line (shown in the bar; the options of `gnugo --help`
// can be typed there), runs it in a Web Worker (worker.ts), and keeps the files it saves and loads (SGF
// games) in the player's account storage. `quit` returns to the game page.
//
// Two things the original does not have, both only typing for the player (README): a click on a point
// of the board printed last types its coordinate, and "Two players" types `force` before each move and
// pass, which is how two people play each other at one keyboard in the original.
import { Teletype, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import type { FromWorker, ToWorker } from './worker.ts';
import dbUrl from '../assets/mc_montegnu_classic.db?url';

export const DEFAULT_ARGS = '--boardsize 9';

/** what the server stores: [A-Za-z0-9._-]{1,64} */
const storageName = (n: string): boolean => /^[A-Za-z0-9._-]{1,64}$/.test(n) && n !== '.' && n !== '..';

/** a Teletype that can type for the player */
class GoTerminal extends Teletype {
  type(text: string): void {
    this.paste(text);
  }
}

const CSS = `
.gg { position: absolute; inset: 0; display: flex; flex-direction: column; background: #111; color: #ddd; font: 14px/1.35 system-ui, sans-serif; }
.gg button { font: inherit; padding: .2rem .7rem; border-radius: 5px; border: 1px solid #555; background: #2a2d31; color: #eee; cursor: pointer; }
.gg-bar { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; padding: .35rem .5rem; border-bottom: 1px solid #333; }
.gg-bar code { color: #9fd18b; font: 14px ui-monospace, monospace; }
.gg-bar label { display: flex; gap: .25rem; align-items: center; color: #ccc; }
.gg-args { flex: 1 1 8rem; min-width: 5rem; max-width: 22rem; padding: .2rem .4rem; font: 14px ui-monospace, monospace; background: #050505; color: #eee; border: 1px solid #444; border-radius: 4px; }
.gg-status { flex: 1 1 10rem; color: #c8c8a0; }
.gg-termhost { position: relative; flex: 1; min-height: 0; }
.gg-over { position: absolute; inset: 0; z-index: 5; overflow: auto; background: #000c; }
.gg-files { max-width: 34rem; margin: 2rem auto; padding: 1rem 1.3rem; background: #1f2226; border-radius: 10px; }
.gg-files h2 { margin: 0 0 .6rem; font-size: 1.15rem; }
.gg-files table { width: 100%; border-collapse: collapse; margin: .4rem 0 .8rem; }
.gg-files td { padding: .15rem .3rem; font: 13px ui-monospace, monospace; }
.gg-files td.n { text-align: right; color: #999; }
.gg-files a { color: #8cf; }
.gg-files p { color: #aaa; font-size: .9rem; }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

/** splits a command line as a shell does: blanks separate, quotes group */
export function shellSplit(s: string): string[] {
  const out: string[] = [];
  let cur = '', inWord = false, q: string | null = null;
  for (const c of s) {
    if (q) {
      if (c === q) q = null;
      else cur += c;
    } else if (c === '"' || c === "'") {
      q = c;
      inWord = true;
    } else if (/\s/.test(c)) {
      if (inWord) out.push(cur);
      cur = '';
      inWord = false;
    } else {
      cur += c;
      inWord = true;
    }
  }
  if (inWord) out.push(cur);
  return out;
}

/**
 * The coordinate of the point under (x, y) when it is on a row of a board GNU Go printed
 * (" 19 . . X O ... 19"; the last move is in parentheses), else null.
 */
export function boardPoint(line: string, col: number, size: number): string | null {
  const m = /^ ([ \d]\d)[ (]/.exec(line);
  if (!m) return null;
  const row = parseInt(m[1], 10);
  if (!(row >= 1 && row <= size)) return null;
  const j = Math.round((col - 4) / 2);
  if (j < 0 || j >= size) return null;
  const ch = line[4 + 2 * j];
  if (ch === undefined || !'.+XOxo'.includes(ch)) return null;
  return String.fromCharCode(65 + j + (j >= 8 ? 1 : 0)) + row;
}

class GoPage {
  readonly ctx: GameContext;
  terminal!: GoTerminal;
  private files = new Map<string, Uint8Array>();
  private db = '';
  private worker: Worker | null = null;
  private waiting = false;
  private typed: string[] = [];
  private termHost: HTMLElement;
  private over: HTMLElement;
  private args: HTMLInputElement;
  private two: HTMLInputElement;
  private status: HTMLElement;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    host.append(el('style', { textContent: CSS }));
    this.args = el('input', { className: 'gg-args', value: DEFAULT_ARGS, spellcheck: false, title: 'Options of gnugo (gnugo --help)' });
    this.args.setAttribute('aria-label', 'Command line options');
    const run = el('button', { textContent: 'Restart', title: 'Start GNU Go again with these options' });
    this.two = el('input', { type: 'checkbox', title: 'Two people at one keyboard: each move and pass is typed as "force <move>"' });
    const files = el('button', { textContent: 'Files', title: 'Your saved games (SGF)' });
    this.status = el('span', { className: 'gg-status' });
    const bar = el('div', { className: 'gg-bar' },
      el('code', { textContent: '$ gnugo --mode ascii' }), this.args, run,
      el('label', {}, this.two, 'Two players'), files, this.status);
    this.termHost = el('div', { className: 'gg-termhost' });
    this.over = el('div', { className: 'gg-over', hidden: true });
    host.append(el('div', { className: 'gg' }, bar, this.termHost, this.over));
    const opt = { signal: ctx.signal };
    run.addEventListener('click', () => this.restart(), opt);
    this.args.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.restart(); }, opt);
    files.addEventListener('click', () => this.showFiles(), opt);
    this.two.addEventListener('change', () => this.terminal.focus(), opt);
    this.termHost.addEventListener('click', (e) => this.click(e), opt);
  }

  async init(): Promise<void> {
    this.terminal = new GoTerminal(this.termHost, { cols: 80, rows: 30 }, this.ctx.signal);
    const res = await fetch(dbUrl, { signal: this.ctx.signal });
    this.db = await res.text();
    try {
      for (const f of await this.ctx.storage.list('')) {
        const data = await this.ctx.storage.get(f.name);
        if (data) this.files.set(f.name, data);
      }
    } catch (e) {
      if (this.ctx.signal.aborted) return;
      this.terminal.write(`[The saved files could not be loaded: ${e instanceof Error ? e.message : String(e)}]\n`);
    }
    if (this.ctx.signal.aborted) return;
    void this.readLoop();
    this.run(shellSplit(this.args.value));
  }

  /** the terminal reads lines all the time; a line goes to the program when it waits for one */
  private async readLoop(): Promise<void> {
    for (;;) {
      let line: string;
      try {
        line = await this.terminal.readLine({ maxLength: 200 });
      } catch {
        return;
      }
      if (this.two.checked && /^\s*([a-hj-z]\d|pass\b)/i.test(line)) line = 'force ' + line.trim();
      this.typed.push(line + '\n');
      this.deliver();
    }
  }

  private deliver(): void {
    if (!this.worker || !this.waiting || !this.typed.length) return;
    this.waiting = false;
    this.send({ type: 'line', line: this.typed.shift()! });
  }

  private send(m: ToWorker): void {
    this.worker?.postMessage(m);
  }

  run(argv: string[]): void {
    this.kill();
    const w = (this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module', name: 'gnugo' }));
    w.onmessage = (e: MessageEvent<FromWorker>) => {
      if (w !== this.worker) return;
      const m = e.data;
      switch (m.type) {
        case 'out':
        case 'err':
          this.status.textContent = '';
          this.terminal.write(m.s);
          break;
        case 'read':
          this.status.textContent = '';
          this.waiting = true;
          this.deliver();
          break;
        case 'write':
          this.files.set(m.name, m.data);
          this.ctx.storage.put(m.name, m.data).catch((err: unknown) =>
            this.terminal.write(`\n[${m.name} could not be saved on the server: ${err instanceof Error ? err.message : String(err)}]\n`));
          break;
        case 'progress':
          this.status.textContent = `GNU Go is thinking: ${Math.min(100, Math.round((100 * m.done) / m.total))}%`;
          break;
        case 'exit':
          this.kill();
          if (m.status === 0 && m.played) this.ctx.exit();
          else if (m.status === 0) this.terminal.write('\n[GNU Go ended. Restart starts it again.]\n');
          else this.terminal.write(`\n[GNU Go ended with status ${m.status}. Restart starts it again.]\n`);
          break;
      }
    };
    w.onerror = (e) => {
      this.terminal.write(`\n[GNU Go stopped: ${e.message}. Restart starts it again.]\n`);
      this.kill();
    };
    this.send({ type: 'start', argv, db: this.db, files: [...this.files], time: Math.floor(Date.now() / 1000) });
  }

  private click(e: MouseEvent): void {
    if (document.getSelection()?.toString()) return;
    const lineEl = (e.target as HTMLElement).closest('.fg-term-line');
    if (!lineEl) return;
    const doc = document as Document & { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null };
    let node: Node | null = null;
    let offset = 0;
    if (doc.caretPositionFromPoint) {
      const p = doc.caretPositionFromPoint(e.clientX, e.clientY);
      if (p) ({ offsetNode: node, offset } = p);
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (r) {
        node = r.startContainer;
        offset = r.startOffset;
      }
    }
    if (!node || !lineEl.contains(node) || node.parentElement !== lineEl) return;
    // the caret is between characters: take the character the pointer is over
    const text = node.textContent ?? '';
    const range = document.createRange();
    let col = offset;
    if (offset < text.length) {
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);
      const r = range.getBoundingClientRect();
      if (e.clientX < r.left && offset > 0) col = offset - 1;
    } else col = offset - 1;
    // the board's size: the letters above it ("    A B C ... ")
    let size = 0;
    for (let p = lineEl.previousElementSibling, k = 0; p && k < 25; p = p.previousElementSibling, k++) {
      const m = /^ {4}A((?: [B-HJ-T])*)/.exec(p.textContent ?? '');
      if (m) {
        size = 1 + m[1].length / 2;
        break;
      }
    }
    const point = boardPoint(text, col, size);
    if (point && this.waiting) this.terminal.type(point.toLowerCase() + '\n');
  }

  private kill(): void {
    this.worker?.terminate();
    this.worker = null;
    this.waiting = false;
    this.status.textContent = '';
  }

  restart(): void {
    this.terminal.write('\n');
    this.typed = [];
    this.run(shellSplit(this.args.value));
    this.terminal.focus();
  }

  private showFiles(): void {
    if (!this.over.hidden) return;
    const box = el('div', { className: 'gg-files' });
    const render = (): void => {
      const names = [...this.files.keys()].sort();
      const table = el('table');
      for (const n of names) {
        const data = this.files.get(n)!;
        const a = el('a', { textContent: n, href: '#', title: 'Download' });
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type: 'application/x-go-sgf' }));
          el('a', { href: url, download: n }).click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        const del = el('button', { textContent: 'Delete' });
        del.addEventListener('click', () => {
          this.files.delete(n);
          this.send({ type: 'file', name: n, data: null });
          void this.ctx.storage.delete(n).then(render, render);
          render();
        });
        table.append(el('tr', {}, el('td', {}, a), el('td', { className: 'n', textContent: `${data.length} bytes` }), el('td', {}, del)));
      }
      const up = el('input', { type: 'file', accept: '.sgf' });
      up.addEventListener('change', async () => {
        const f = up.files?.[0];
        if (!f) return;
        const n = f.name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 64);
        if (!storageName(n)) return;
        const data = new Uint8Array(await f.arrayBuffer());
        this.files.set(n, data);
        this.send({ type: 'file', name: n, data });
        await this.ctx.storage.put(n, data).catch((err: unknown) => this.terminal.write(`[${n}: ${String(err)}]\n`));
        render();
      });
      const close = el('button', { textContent: 'Close' });
      close.addEventListener('click', () => {
        this.over.hidden = true;
        this.over.replaceChildren();
        this.terminal.focus();
      });
      box.replaceChildren(
        el('h2', { textContent: 'Files' }),
        el('p', { textContent: "GNU Go's working directory: save <file> writes a game here (SGF), load <file> and the option -l <file> read one from here." }),
        names.length ? table : el('p', { textContent: 'No files yet.' }),
        el('p', {}, 'Add a file (an SGF game): ', up),
        close,
      );
    };
    render();
    this.over.replaceChildren(box);
    this.over.hidden = false;
  }

  stop(): void {
    this.kill();
  }
}

export const start: StartGame = (host, ctx) => {
  const page = new GoPage(host, ctx);
  // for the end-to-end test and the screenshots: the terminal's text
  Object.assign(window, { __gnugo: { text: () => page.terminal?.buffer.text() ?? '' } });
  ctx.signal.addEventListener('abort', () => Reflect.deleteProperty(window, '__gnugo'), { once: true });
  void page.init().catch((e: unknown) => {
    if (!ctx.signal.aborted) throw e;
  });
  return { stop: () => page.stop() };
};
