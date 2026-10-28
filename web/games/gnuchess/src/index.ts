// GNU Chess 6.3.0 on the website: the program at its prompt, as in a terminal. The page runs it with a
// command line (empty, as most people start it; the options of `gnuchess --help` can be typed there),
// the engine in a Web Worker, and the files it reads and writes (PGN and EPD files, game.log, the
// log.nnn/game.nnn of `name`, players.dat, book.bin) in the player's account storage. `quit` returns
// to the game page. Online: two people play each other in the program's manual mode (online.ts).
import { type GameContext, type GameMessage, type RoundStart, type StartGame } from '../../../src/sdk/index.ts';
import { GnuChess } from './main.ts';
import { WorkerEngine } from './worker-link.ts';
import { ChessTerminal } from './terminal.ts';
import { PKGDATADIR, realClock, type Files } from './host.ts';
import { OnlineGame } from './online.ts';
import bookUrl from '../assets/smallbook.bin?url';

/** what the server stores: [A-Za-z0-9._-]{1,64} */
export const storageName = (n: string): boolean => /^[A-Za-z0-9._-]{1,64}$/.test(n) && n !== '.' && n !== '..';

/** the home directory the program gets: its gnuchess.ini would be the storage file of that name */
const HOME = '/home/player';
const INI = `${HOME}/.config/gnuchess/gnuchess.ini`;
const MAX_FILES = 64;
const MAX_FILE = 512 * 1024;
const MAX_TOTAL = 4 * 1024 * 1024;

/**
 * The program's files: its working directory is the player's storage (loaded when the game starts,
 * every write saved back), PKGDATADIR has the book, ~/.config/gnuchess/gnuchess.ini is the storage
 * file gnuchess.ini. A name the storage cannot keep cannot be opened.
 */
class StorageFiles implements Files {
  readonly map = new Map<string, Uint8Array>();
  private readonly book: Uint8Array;
  private readonly ctx: GameContext;
  private dirty = new Set<string>();
  private flushing = false;
  onError: (msg: string) => void = () => {};
  onChange: () => void = () => {};

  constructor(ctx: GameContext, book: Uint8Array) {
    this.ctx = ctx;
    this.book = book;
  }

  async load(): Promise<void> {
    const list = await this.ctx.storage.list('');
    for (const f of list) {
      const data = await this.ctx.storage.get(f.name);
      if (data) this.map.set(f.name, data);
    }
  }

  private name(path: string): string | null {
    if (path === INI) return 'gnuchess.ini';
    return storageName(path) ? path : null;
  }

  read(path: string): Uint8Array | null {
    if (path === `${PKGDATADIR}/smallbook.bin`) return this.book;
    const n = this.name(path);
    return n ? (this.map.get(n) ?? null) : null;
  }

  exists(path: string): boolean {
    return this.read(path) !== null;
  }

  private total(except: string): number {
    let t = 0;
    for (const [k, v] of this.map) if (k !== except) t += v.length;
    return t;
  }

  write(path: string, data: Uint8Array): boolean {
    const n = this.name(path);
    if (!n) return false;
    if (!this.map.has(n) && this.map.size >= MAX_FILES) return false;
    if (data.length > MAX_FILE || this.total(n) + data.length > MAX_TOTAL) return false;
    this.map.set(n, data.slice());
    this.save(n);
    return true;
  }

  append(path: string, data: Uint8Array): boolean {
    const n = this.name(path);
    if (!n) return false;
    const old = this.map.get(n);
    if (!old) return this.write(path, data);
    const both = new Uint8Array(old.length + data.length);
    both.set(old);
    both.set(data, old.length);
    if (both.length > MAX_FILE || this.total(n) + both.length > MAX_TOTAL) return false;
    this.map.set(n, both);
    this.save(n);
    return true;
  }

  /** the program writes a file piece by piece (fprintf): it is saved once the program is done with it */
  private save(n: string): void {
    this.dirty.add(n);
    this.onChange();
    if (this.flushing) return;
    this.flushing = true;
    setTimeout(() => void this.flush(), 50);
  }

  private async flush(): Promise<void> {
    this.flushing = false;
    for (const n of [...this.dirty]) {
      this.dirty.delete(n);
      const data = this.map.get(n);
      if (!data) continue;
      try {
        await this.ctx.storage.put(n, data);
      } catch (e) {
        this.onError(`${n} could not be saved on the server: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  async remove(n: string): Promise<void> {
    this.map.delete(n);
    this.onChange();
    await this.ctx.storage.delete(n);
  }

  async add(n: string, data: Uint8Array): Promise<void> {
    this.map.set(n, data);
    this.onChange();
    await this.ctx.storage.put(n, data);
  }
}

const CSS = `
.gc { position: absolute; inset: 0; display: flex; flex-direction: column; background: #111; color: #ddd; font: 14px/1.35 system-ui, sans-serif; }
.gc button { font: inherit; padding: .2rem .7rem; border-radius: 5px; border: 1px solid #555; background: #2a2d31; color: #eee; cursor: pointer; }
.gc button:disabled { opacity: .45; cursor: default; }
.gc-bar { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; padding: .35rem .5rem; border-bottom: 1px solid #333; }
.gc-bar code { color: #9fd18b; font: 14px ui-monospace, monospace; }
.gc-args { flex: 1 1 8rem; min-width: 5rem; max-width: 22rem; padding: .2rem .4rem; font: 14px ui-monospace, monospace; background: #050505; color: #eee; border: 1px solid #444; border-radius: 4px; }
.gc-status { flex: 1 1 12rem; color: #c8c8a0; }
.gc-termhost { position: relative; flex: 1; min-height: 0; }
.gc-over { position: absolute; inset: 0; z-index: 5; overflow: auto; background: #000c; }
.gc-files { max-width: 34rem; margin: 2rem auto; padding: 1rem 1.3rem; background: #1f2226; border-radius: 10px; }
.gc-files h2 { margin: 0 0 .6rem; font-size: 1.15rem; }
.gc-files table { width: 100%; border-collapse: collapse; margin: .4rem 0 .8rem; }
.gc-files td { padding: .15rem .3rem; font: 13px ui-monospace, monospace; }
.gc-files td.n { text-align: right; color: #999; }
.gc-files a { color: #8cf; }
.gc-files p { color: #aaa; font-size: .9rem; }
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

export class ChessPage {
  readonly ctx: GameContext;
  readonly root: HTMLElement;
  readonly status: HTMLElement;
  terminal!: ChessTerminal;
  files!: StorageFiles;
  private book!: Uint8Array;
  private termHost: HTMLElement;
  private over: HTMLElement;
  private args: HTMLInputElement;
  private runBtn: HTMLButtonElement;
  private onlineBtn: HTMLButtonElement;
  private filesBtn: HTMLButtonElement;
  proc: GnuChess | null = null;
  private engine: WorkerEngine | null = null;
  /** cancels the read of the running program */
  private reading: AbortController | null = null;
  online: OnlineGame | null = null;
  /** the text typed before a read was cancelled */
  private partial = '';
  /** the room's messages since the lobby opened, for the game it starts (takeEarly) */
  private early: GameMessage[] | null = null;

  /** the messages that came before the online game listened */
  takeEarly(): GameMessage[] {
    const e = this.early ?? [];
    this.early = null;
    return e;
  }

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    host.append(el('style', { textContent: CSS }));
    this.args = el('input', { className: 'gc-args', value: '', spellcheck: false, title: 'Options of gnuchess (gnuchess --help); empty: as most people start it' });
    this.args.setAttribute('aria-label', 'Command line options');
    this.runBtn = el('button', { textContent: 'Restart', title: 'Start GNU Chess again with these options' });
    this.onlineBtn = el('button', { textContent: 'Play online', title: 'Two players, White and Black, in the manual mode' });
    this.filesBtn = el('button', { textContent: 'Files', title: 'Your saved games and positions' });
    this.status = el('span', { className: 'gc-status' });
    const bar = el('div', { className: 'gc-bar' }, el('code', { textContent: '$ gnuchess' }), this.args, this.runBtn, this.onlineBtn, this.filesBtn, this.status);
    this.termHost = el('div', { className: 'gc-termhost' });
    this.over = el('div', { className: 'gc-over', hidden: true });
    this.root = el('div', { className: 'gc' }, bar, this.termHost, this.over);
    host.append(this.root);
    const opt = { signal: ctx.signal };
    this.runBtn.addEventListener('click', () => this.restart(), opt);
    this.args.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.restart();
    }, opt);
    this.onlineBtn.addEventListener('click', () => void this.playOnline(), opt);
    this.filesBtn.addEventListener('click', () => this.showFiles(), opt);
  }

  async init(): Promise<void> {
    this.terminal = new ChessTerminal(this.termHost, { cols: 80, rows: 30 }, this.ctx.signal);
    const res = await fetch(bookUrl, { signal: this.ctx.signal });
    this.book = new Uint8Array(await res.arrayBuffer());
    this.files = new StorageFiles(this.ctx, this.book);
    this.files.onError = (m) => this.terminal.write(`\n[${m}]\n`);
    try {
      await this.files.load();
    } catch (e) {
      if (this.ctx.signal.aborted) return;
      this.terminal.write(`[The saved files could not be loaded: ${e instanceof Error ? e.message : String(e)}]\n`);
    }
    if (this.ctx.signal.aborted) return;
    this.run([]);
  }

  /** starts the program: a new process, with a new engine worker */
  run(argv: string[], o: { online?: OnlineGame } = {}): void {
    this.kill();
    this.online = o.online ?? null;
    const engine = (this.engine = new WorkerEngine(this.book));
    const proc = new GnuChess({
      stdout: (s) => this.terminal.writeBytes(s),
      stderr: (s) => this.terminal.writeBytes(s),
      readLine: () => this.readLine(proc),
      exit: (code) => this.exited(proc, code),
      files: this.files,
      clock: realClock,
      getenv: (name) => (name === 'HOME' ? HOME : undefined),
      engine,
    });
    this.proc = proc;
    proc.start(argv);
  }

  /** the program's input thread waits for a line */
  private readLine(proc: GnuChess): void {
    if (proc !== this.proc) return;
    // the online game may have a line to type (the opponent's move)
    const injected = this.online?.nextLine();
    if (injected) {
      queueMicrotask(() => {
        if (injected.echo) this.echo(injected.line);
        this.deliver(proc, injected.line);
      });
      return;
    }
    const ac = (this.reading = new AbortController());
    const initial = this.partial;
    this.partial = '';
    this.terminal.readLine({ maxLength: 126, initial, cancel: ac.signal }).then(
      (line) => {
        if (proc !== this.proc || this.reading !== ac) return;
        this.reading = null;
        if (this.online) this.online.typed(line, (l) => this.deliver(proc, l), () => this.readLine(proc));
        else this.deliver(proc, line);
      },
      (e: unknown) => {
        if (this.reading === ac) this.reading = null;
        const partial = (e as { partial?: string }).partial;
        if (partial !== undefined && proc === this.proc && !this.ctx.signal.aborted) {
          // the online game cancelled the read to type the opponent's move
          this.partial = partial;
          this.readLine(proc);
        }
      },
    );
  }

  /** a line goes to the program's input thread, as if typed */
  private deliver(proc: GnuChess, line: string): void {
    if (proc !== this.proc) return;
    proc.input(line + '\n');
  }

  /** the online game has a line to type now: the read in progress makes room for it */
  interrupt(): void {
    this.reading?.abort();
  }

  /** shows a line typed for the player (the opponent's move) after the prompt */
  echo(line: string): void {
    this.terminal.write(line + '\n');
  }

  private exited(proc: GnuChess, code: number): void {
    if (proc !== this.proc) return;
    this.proc = null;
    this.reading?.abort();
    this.reading = null;
    if (this.online) {
      this.online.programEnded(code);
      return;
    }
    if (code === 0) this.ctx.exit(); // quit: back to the game page
    else this.terminal.write(`\n[GNU Chess ended with status ${code}. Restart starts it again.]\n`);
  }

  private kill(): void {
    this.reading?.abort();
    this.reading = null;
    this.partial = '';
    this.engine?.stop();
    this.engine = null;
    this.proc = null;
  }

  restart(): void {
    if (this.online) return;
    this.terminal.write('\n');
    this.run(shellSplit(this.args.value));
    this.terminal.focus();
  }

  private async playOnline(): Promise<void> {
    if (this.online) return;
    this.onlineBtn.disabled = true;
    this.runBtn.disabled = true;
    let round: RoundStart | null = await this.lobby();
    while (round && !this.ctx.signal.aborted) {
      const game = new OnlineGame(this, round);
      const again = await game.play();
      if (this.ctx.signal.aborted) return;
      if (!again) break;
      round = await this.lobby();
    }
    if (this.ctx.signal.aborted) return;
    this.online = null;
    this.status.textContent = '';
    this.onlineBtn.disabled = false;
    this.runBtn.disabled = false;
    this.restart();
  }

  /** the shared lobby over the terminal; null when cancelled */
  async lobby(): Promise<RoundStart | null> {
    this.over.hidden = false;
    // what the server sends right after the round starts (the game so far, to a seat that rejoins) can
    // come before the game has subscribed: it is kept from here on
    this.early = [];
    const off = this.ctx.rooms.on('message', (m) => this.early?.push(m));
    try {
      return await this.ctx.lobby(this.over, {
        title: 'GNU Chess online',
        seats: { min: 2, max: 2 },
        seatNames: ['White', 'Black'],
      });
    } catch {
      this.early = null;
      return null;
    } finally {
      off();
      this.over.hidden = true;
      this.over.replaceChildren();
      this.terminal.focus();
    }
  }

  private showFiles(): void {
    if (!this.over.hidden) return;
    const box = el('div', { className: 'gc-files' });
    const render = (): void => {
      const names = [...this.files.map.keys()].sort();
      const table = el('table');
      for (const n of names) {
        const data = this.files.map.get(n)!;
        const a = el('a', { textContent: n, href: '#', title: 'Download' });
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const url = URL.createObjectURL(new Blob([new Uint8Array(data)], { type: 'application/octet-stream' }));
          const link = el('a', { href: url, download: n });
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        const del = el('button', { textContent: 'Delete' });
        del.addEventListener('click', () => void this.files.remove(n).then(render, render));
        table.append(el('tr', {}, el('td', {}, a), el('td', { className: 'n', textContent: `${data.length} bytes` }), el('td', {}, del)));
      }
      const up = el('input', { type: 'file' });
      up.addEventListener('change', async () => {
        const f = up.files?.[0];
        if (!f) return;
        const n = f.name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 64);
        await this.files.add(n, new Uint8Array(await f.arrayBuffer())).catch((e: unknown) => this.terminal.write(`[${n}: ${String(e)}]\n`));
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
        el('p', { textContent: "GNU Chess's working directory: pgnsave, save (epdsave), name and remove write here; pgnload, pgnreplay, load (epdload), solve and book add read from here." }),
        names.length ? table : el('p', { textContent: 'No files yet.' }),
        el('p', {}, 'Add a file (a PGN game, EPD positions): ', up),
        close,
      );
    };
    render();
    this.over.replaceChildren(box);
    this.over.hidden = false;
  }

  stop(): void {
    this.kill();
    this.online?.close();
  }
}

export const start: StartGame = (host, ctx) => {
  const page = new ChessPage(host, ctx);
  // for the end-to-end test (e2e.mjs): the terminal's text, and whether the program waits for a line
  Object.assign(window, {
    __gnuchess: {
      text: () => page.terminal?.buffer.text() ?? '',
      waiting: () => !!page.proc?.waitingForInput,
    },
  });
  ctx.signal.addEventListener('abort', () => Reflect.deleteProperty(window, '__gnuchess'), { once: true });
  void page.init().catch((e: unknown) => {
    if (!ctx.signal.aborted) throw e;
  });
  return { stop: () => page.stop() };
};
