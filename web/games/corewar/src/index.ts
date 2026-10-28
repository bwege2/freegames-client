// Core War on the website: pMARS 0.9.5 as a program the player runs with a command line, as on the
// original's terminal. The page has the player's warrior files (account storage) and the examples,
// an editor, the command line (with a form that writes the options into it), the terminal pMARS
// prints to (stdout, stderr) and its X window (the core display; cdb in its text panel).
// Online battles: the shared lobby, then every seat enters a warrior, the server module sends all of
// them with the seed, every client runs the same battle and reports it, the module compares.
import { Teletype, packGame, unpackGame, SERVER_SEAT, type StartGame, type GameContext, type RoundStart, type KeyInput } from '../../../src/sdk/index.ts';
import { main } from './pmars.ts';
import { set_host, type Host } from './host.ts';
import { XWindow } from './xwindisp.ts';
import { g, STEP, RESET } from './global.ts';
import { bstr, fromText } from './libc.ts';
import { Msg, Options, Results } from './proto/corewar.ts';

const examples = import.meta.glob('../assets/warriors/*.red', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const configs = import.meta.glob('../assets/config/*', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** the files that come with the game, by the path pMARS opens them with */
export const bundled: Record<string, string> = {};
for (const [p, t] of Object.entries(examples)) bundled[`warriors/${p.split('/').pop()}`] = t;
for (const [p, t] of Object.entries(configs)) bundled[`config/${p.split('/').pop()}`] = t;

/** names the server stores */
export const storageName = (n: string): boolean => /^[A-Za-z0-9._-]{1,64}$/.test(n) && n !== '.' && n !== '..';

/** splits a command line as a shell does: blanks separate, "..." and '...' quote, \ escapes */
export function shellSplit(s: string): string[] {
  const out: string[] = [];
  let cur = '', inWord = false, q: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === q) q = null;
      else if (c === '\\' && q === '"' && i + 1 < s.length) cur += s[++i];
      else cur += c;
    } else if (c === '"' || c === "'") { q = c; inWord = true; }
    else if (c === '\\' && i + 1 < s.length) { cur += s[++i]; inWord = true; }
    else if (/\s/.test(c)) { if (inWord) out.push(cur); cur = ''; inWord = false; }
    else { cur += c; inWord = true; }
  }
  if (inWord) out.push(cur);
  return out;
}

const quote = (a: string): string => (/^[A-Za-z0-9._\-/@=:+,*%()<>]+$/.test(a) ? a : `'${a.replace(/'/g, `'\\''`)}'`);

/** the room options as pMARS options */
export function optionArgs(o: { rounds: number; coreSize: number; cycles: number; processes: number; maxLength: number; minDistance: number; icws88: boolean; readLimit: number; writeLimit: number; pSpaceSize: number }): string[] {
  const a = ['-r', `${o.rounds}`, '-s', `${o.coreSize}`, '-c', `${o.cycles}`, '-p', `${o.processes}`, '-l', `${o.maxLength}`];
  if (o.minDistance) a.push('-d', `${o.minDistance}`);
  if (o.readLimit) a.push('-R', `${o.readLimit}`);
  if (o.writeLimit) a.push('-W', `${o.writeLimit}`);
  if (o.pSpaceSize) a.push('-S', `${o.pSpaceSize}`);
  if (o.icws88) a.push('-8');
  return a;
}

const CSS = `
.cw { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(14rem, 21rem) 1fr; grid-template-rows: auto auto 1fr;
  background: #15171a; color: #dcdcdc; font: 14px/1.35 system-ui, sans-serif; }
.cw button, .cw select, .cw input { font: inherit; }
.cw button { padding: .25rem .7rem; border-radius: 5px; border: 1px solid #5a6270; background: #2a2f37; color: #eee; cursor: pointer; }
.cw button.cw-go { background: #2f6fdf; border-color: #2f6fdf; }
.cw button:disabled { opacity: .45; cursor: default; }
.cw-bar { grid-column: 1 / 3; display: flex; gap: .4rem; align-items: center; padding: .4rem .5rem; border-bottom: 1px solid #333; }
.cw-bar code { color: #9fd18b; font: 14px ui-monospace, monospace; }
.cw-cmd { flex: 1; min-width: 6rem; padding: .3rem .45rem; font: 14px ui-monospace, monospace !important; background: #0c0d0f; color: #e8e8e8;
  border: 1px solid #444; border-radius: 5px; }
.cw-opts { grid-column: 1 / 3; display: none; flex-wrap: wrap; gap: .3rem 1rem; padding: .4rem .6rem; border-bottom: 1px solid #333; background: #1b1e22; }
.cw-opts.cw-open { display: flex; }
.cw-opts label { display: flex; gap: .3rem; align-items: center; white-space: nowrap; }
.cw-opts input[type=number] { width: 6.5rem; background: #0c0d0f; color: #eee; border: 1px solid #444; border-radius: 4px; padding: .1rem .3rem; }
.cw-opts select { background: #0c0d0f; color: #eee; border: 1px solid #444; }
.cw-side { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid #333; }
.cw-files { flex: 1 1 40%; overflow: auto; padding: .3rem .5rem; min-height: 4rem; }
.cw-files h3 { margin: .5rem 0 .2rem; font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: #8a929c; }
.cw-files ul { list-style: none; margin: 0; padding: 0; }
.cw-files li { display: flex; gap: .35rem; align-items: center; padding: .05rem 0; }
.cw-files li span { cursor: pointer; font: 13px ui-monospace, monospace; }
.cw-files li span:hover, .cw-files li span.cw-sel { color: #fff; text-decoration: underline; }
.cw-muted { color: #8a929c; font-size: .85rem; }
.cw-edit { flex: 1 1 60%; display: flex; flex-direction: column; min-height: 0; padding: .3rem .5rem .5rem; border-top: 1px solid #333; gap: .3rem; }
.cw-edit-row { display: flex; gap: .3rem; align-items: center; }
.cw-edit-row input { flex: 1; min-width: 0; background: #0c0d0f; color: #eee; border: 1px solid #444; border-radius: 4px; padding: .15rem .35rem; font: 13px ui-monospace, monospace; }
.cw-edit textarea { flex: 1; min-height: 6rem; resize: none; background: #0c0d0f; color: #e8e8e8; border: 1px solid #444; border-radius: 5px;
  font: 13px/1.3 ui-monospace, "DejaVu Sans Mono", monospace; padding: .3rem; tab-size: 8; }
.cw-main { position: relative; display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.cw-xhost { position: relative; flex: 3 1 0; min-height: 0; display: none; place-items: center; background: #000; overflow: hidden; }
.cw-xhost.cw-open { display: grid; }
.cw-xwin { display: flex; flex-direction: column; background: #000; }
.cw-xwin-gfx { width: 100%; image-rendering: pixelated; display: block; }
.cw-xwin-panel { position: relative; width: 100%; }
.cw-term { position: relative; flex: 1 1 0; min-height: 6rem; }
.cw-overlay { position: absolute; inset: 0; overflow: auto; background: #15171a; z-index: 5; }
.cw-box { max-width: 36rem; margin: 2rem auto; padding: 1rem 1.3rem; background: #1f2328; border-radius: 10px; }
.cw-box h2 { margin: 0 0 .6rem; font-size: 1.2rem; }
.cw-box select { background: #0c0d0f; color: #eee; border: 1px solid #444; padding: .2rem; }
@media (max-width: 720px) { .cw { grid-template-columns: 1fr; grid-template-rows: auto auto minmax(12rem, 35%) 1fr; } .cw-bar, .cw-opts { grid-column: 1; } .cw-side { border-right: 0; border-bottom: 1px solid #333; } }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

type Field = { flag: string; label: string; kind: 'num' | 'bool' | 'text' | 'view'; value?: string; title?: string };
const FIELDS: Field[] = [
  { flag: '-r', label: 'rounds', kind: 'num', value: '3' },
  { flag: '-s', label: 'core size', kind: 'num' },
  { flag: '-c', label: 'cycles', kind: 'num' },
  { flag: '-p', label: 'processes', kind: 'num' },
  { flag: '-l', label: 'max. length', kind: 'num' },
  { flag: '-d', label: 'min. distance', kind: 'num' },
  { flag: '-S', label: 'P-space', kind: 'num' },
  { flag: '-R', label: 'read limit', kind: 'num' },
  { flag: '-W', label: 'write limit', kind: 'num' },
  { flag: '-F', label: 'position #2', kind: 'text' },
  { flag: '-v', label: 'display', kind: 'view' },
  { flag: '-8', label: "ICWS'88", kind: 'bool' },
  { flag: '-P', label: 'permutate', kind: 'bool' },
  { flag: '-f', label: 'fixed series', kind: 'bool' },
  { flag: '-e', label: 'debugger', kind: 'bool' },
  { flag: '-b', label: 'brief', kind: 'bool' },
  { flag: '-V', label: 'verbose', kind: 'bool' },
  { flag: '-k', label: 'KotH output', kind: 'bool' },
  { flag: '-o', label: 'sort', kind: 'bool' },
];
const VIEWS: [string, string][] = [['', 'default (103)'], ['4', 'every access, fastest'], ['104', 'every access'], ['3', 'no reads, fastest'],
  ['303', 'slower'], ['503', 'slow'], ['803', 'slowest'], ['1', 'executions only'], ['0', 'nothing'], ['113', '640x480'], ['123', '800x600'], ['133', '1024x768'], ['1103', 'grey scale']];

export const start: StartGame = (host, ctx) => new CorewarPage(host, ctx);

class CorewarPage {
  private ctx: GameContext;
  private root: HTMLElement;
  private tty: Teletype;
  private cmd: HTMLInputElement;
  private runBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private onlineBtn: HTMLButtonElement;
  private opts: HTMLElement;
  private xhost: HTMLElement;
  private filesBox: HTMLElement;
  private editName: HTMLInputElement;
  private editText: HTMLTextAreaElement;
  private status: HTMLElement;
  private inputs = new Map<string, HTMLInputElement | HTMLSelectElement>();
  private selected = new Set<string>(['warriors/sunset.red', 'warriors/excalibur.red']);
  private mine: string[] = [];
  private storageOk = true;
  private running: AbortController | null = null;
  /** files of an online battle (seat warriors), in front of everything else */
  private overlay: Record<string, string> = {};
  /** keys typed into the terminal go to whoever waits for them */
  private keyHandler: ((k: KeyInput) => void) | null = null;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    host.append(el('style', { textContent: CSS }));
    this.root = el('div', { className: 'cw' });
    host.append(this.root);
    // the command line
    this.cmd = el('input', { className: 'cw-cmd', spellcheck: false, ariaLabel: 'pmars command line' });
    this.cmd.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); void this.run(); } }, { signal: ctx.signal });
    this.runBtn = el('button', { className: 'cw-go', textContent: 'Run' });
    this.runBtn.onclick = () => void this.run();
    this.stopBtn = el('button', { textContent: 'Stop', disabled: true });
    this.stopBtn.onclick = () => this.running?.abort();
    const optBtn = el('button', { textContent: 'Options' });
    this.onlineBtn = el('button', { textContent: 'Online battle' });
    this.onlineBtn.onclick = () => void this.online();
    this.root.append(el('div', { className: 'cw-bar' }, el('code', { textContent: '$ pmars' }), this.cmd, this.runBtn, this.stopBtn, optBtn, this.onlineBtn));
    // the options form: it writes the command line
    this.opts = el('div', { className: 'cw-opts' });
    optBtn.onclick = () => this.opts.classList.toggle('cw-open');
    for (const f of FIELDS) {
      let input: HTMLInputElement | HTMLSelectElement;
      if (f.kind === 'bool') input = el('input', { type: 'checkbox' });
      else if (f.kind === 'view') {
        input = el('select');
        for (const [v, t] of VIEWS) input.append(el('option', { value: v, textContent: t }));
      } else input = el('input', { type: f.kind === 'num' ? 'number' : 'text', min: '0', value: f.value ?? '', placeholder: 'default' });
      input.addEventListener('change', () => this.writeCommand(), { signal: ctx.signal });
      this.inputs.set(f.flag, input);
      this.opts.append(el('label', { title: f.flag }, f.kind === 'bool' ? input : '', `${f.label} (${f.flag})`, f.kind === 'bool' ? '' : input));
    }
    this.root.append(this.opts);
    // files and the editor
    this.filesBox = el('div', { className: 'cw-files' });
    this.editName = el('input', { placeholder: 'file name', spellcheck: false });
    this.editText = el('textarea', { spellcheck: false });
    this.editText.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '\t'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); void this.save(); }
    }, { signal: ctx.signal });
    this.status = el('div', { className: 'cw-muted' });
    const save = el('button', { textContent: 'Save' });
    save.onclick = () => void this.save();
    const neu = el('button', { textContent: 'New' });
    neu.onclick = () => { this.editName.value = 'mywarrior.red'; this.editText.value = ';redcode-94\n;name My warrior\n;author\n;assert 1\n        mov.i   0, 1\n        end\n'; this.editName.focus(); };
    const del = el('button', { textContent: 'Delete' });
    del.onclick = () => void this.remove();
    this.root.append(el('div', { className: 'cw-side' }, this.filesBox,
      el('div', { className: 'cw-edit' }, el('div', { className: 'cw-edit-row' }, this.editName, save, neu, del), this.editText, this.status)));
    // the terminal and the X window
    this.xhost = el('div', { className: 'cw-xhost' });
    const termHost = el('div', { className: 'cw-term', tabIndex: 0 });
    this.root.append(el('div', { className: 'cw-main' }, this.xhost, termHost));
    this.tty = new Teletype(termHost, { cols: 80, rows: 12 }, ctx.signal);
    /* the terminal grows and shrinks with the X window: keep its last line in view */
    const ro = new ResizeObserver(() => this.tty.write(''));
    ro.observe(termHost);
    ctx.signal.addEventListener('abort', () => ro.disconnect(), { once: true });
    void this.keys();
    this.tty.write('pMARS 0.9.5 in the browser. Choose warriors on the left, then Run.\n' +
      'In the core window: 0-4 display level, < > speed, d debugger, c clear, q quit.\n\n');
    this.writeCommand();
    this.open('warriors/sunset.red');
    void this.listFiles();
  }

  stop(): void {
    this.running?.abort();
    this.root.remove();
  }

  /* ------------------------------------------------------------ files */

  private async readFile(name: string): Promise<string | null> {
    name = name.replace(/^(\.\/)+/, '');
    if (name in this.overlay) return fromText(this.overlay[name]);
    if (name in bundled) return fromText(bundled[name]);
    if (storageName(name)) {
      try {
        const b = await this.ctx.storage.get(name);
        if (b) return bstr(b);
      } catch { /* not reachable: the file cannot be opened */ }
    }
    if (name === 'pmars.mac') return fromText(bundled['config/pmars.mac']); /* the default macros, as if run in config/ */
    return null;
  }

  private async listFiles(): Promise<void> {
    try {
      this.mine = (await this.ctx.storage.list('')).map((f) => f.name).sort();
      this.storageOk = true;
    } catch {
      this.storageOk = false;
    }
    this.drawFiles();
  }

  private drawFiles(): void {
    const item = (name: string) => {
      const cb = el('input', { type: 'checkbox', checked: this.selected.has(name), title: 'in the battle' });
      cb.onchange = () => { if (cb.checked) this.selected.add(name); else this.selected.delete(name); this.writeCommand(); };
      const n = el('span', { textContent: name, className: this.editName.value === name ? 'cw-sel' : '' });
      n.onclick = () => this.open(name);
      return el('li', {}, cb, n);
    };
    const ex = Object.keys(bundled).filter((n) => n.startsWith('warriors/')).sort();
    const cf = Object.keys(bundled).filter((n) => n.startsWith('config/')).sort();
    this.filesBox.replaceChildren(
      el('h3', { textContent: 'Your files' }),
      this.mine.length ? el('ul', {}, ...this.mine.map(item))
        : el('div', { className: 'cw-muted', textContent: this.storageOk ? 'None yet: New, write, Save.' : 'The server cannot be reached: files cannot be kept.' }),
      el('h3', { textContent: 'Examples' }), el('ul', {}, ...ex.map(item)),
      el('h3', { textContent: 'Options and macros (-@ file, cdb macro)' }), el('ul', {}, ...cf.map(item)));
  }

  private async open(name: string): Promise<void> {
    const t = await this.readFile(name);
    if (t === null) return;
    this.editName.value = name;
    this.editText.value = new TextDecoder().decode(Uint8Array.from(t, (c) => c.charCodeAt(0)));
    this.status.textContent = name in bundled ? 'An example: Save keeps a copy in your files.' : '';
    this.drawFiles();
  }

  private async save(): Promise<void> {
    let name = this.editName.value.trim();
    if (name in bundled) name = name.split('/').pop()!;
    if (!storageName(name)) {
      this.status.textContent = 'File names: letters, digits, . _ - (at most 64).';
      return;
    }
    try {
      await this.ctx.storage.put(name, new TextEncoder().encode(this.editText.value));
      this.editName.value = name;
      this.status.textContent = `Saved ${name}.`;
      await this.listFiles();
    } catch (e) {
      this.status.textContent = `Not saved: ${e instanceof Error ? e.message : e}`;
    }
  }

  private async remove(): Promise<void> {
    const name = this.editName.value.trim();
    if (!this.mine.includes(name) || !window.confirm(`Delete ${name}?`)) return;
    try {
      await this.ctx.storage.delete(name);
      this.selected.delete(name);
      this.status.textContent = `Deleted ${name}.`;
      await this.listFiles();
      this.writeCommand();
    } catch (e) {
      this.status.textContent = `Not deleted: ${e instanceof Error ? e.message : e}`;
    }
  }

  /* ------------------------------------------------------------ the command line */

  private writeCommand(): void {
    const a: string[] = [];
    for (const f of FIELDS) {
      const i = this.inputs.get(f.flag)!;
      if (f.kind === 'bool') { if ((i as HTMLInputElement).checked) a.push(f.flag); }
      else if (i.value.trim()) a.push(f.flag, i.value.trim());
    }
    a.push(...[...this.selected].sort());
    this.cmd.value = a.map(quote).join(' ');
  }

  private optionValues() {
    const num = (f: string, d: number) => { const v = Number(this.inputs.get(f)!.value); return Number.isFinite(v) && v > 0 ? Math.trunc(v) : d; };
    return {
      rounds: Math.min(100, num('-r', 3)), coreSize: num('-s', 8000), cycles: num('-c', 80000), processes: num('-p', 8000),
      maxLength: num('-l', 100), minDistance: num('-d', 0), icws88: (this.inputs.get('-8') as HTMLInputElement).checked,
      readLimit: num('-R', 0), writeLimit: num('-W', 0), pSpaceSize: num('-S', 0),
    };
  }

  /** one key dispatcher for the terminal: stdin lines, Ctrl+C */
  private async keys(): Promise<void> {
    try {
      for (;;) {
        const k = await this.tty.readKey();
        if (this.keyHandler) this.keyHandler(k);
        else if (k.ctrl && k.key.toLowerCase() === 'c' && this.running) {
          /* SIGINT: pMARS's sighandler() enters the debugger */
          this.tty.write('^C\n');
          if (!g.server) { g.debugState = STEP; g.cmdMod = RESET; }
        }
      }
    } catch { /* stopped */ }
  }

  /** a line typed at the terminal (pMARS reading a warrior or options from "-"); Ctrl+D ends the input */
  private readStdin(): Promise<string | null> {
    return new Promise((resolve) => {
      let line = '';
      this.keyHandler = (k) => {
        if (k.ctrl && k.key.toLowerCase() === 'd' && !line) { this.keyHandler = null; resolve(null); }
        else if (k.key === 'Enter') { this.tty.write('\n'); this.keyHandler = null; resolve(`${line}\n`); }
        else if (k.key === 'Backspace') { if (line) { line = line.slice(0, -1); this.tty.write('\b \b'); } }
        else if (!k.ctrl && !k.alt && [...k.key].length === 1) { line += k.key; this.tty.write(k.key); }
      };
    });
  }

  private host(xw: XWindow, signal: AbortSignal): Host {
    return {
      stdout: (s) => this.tty.write(new TextDecoder().decode(Uint8Array.from(s, (c) => c.charCodeAt(0)))),
      stderr: (s) => this.tty.write(new TextDecoder().decode(Uint8Array.from(s, (c) => c.charCodeAt(0)))),
      readFile: (n) => this.readFile(n),
      appendFile: async (n, data) => {
        if (!storageName(n)) return false;
        try {
          const old = (await this.ctx.storage.get(n)) ?? new Uint8Array(0);
          const add = Uint8Array.from(data, (c) => c.charCodeAt(0));
          const b = new Uint8Array(old.length + add.length);
          b.set(old);
          b.set(add, old.length);
          await this.ctx.storage.put(n, b);
          return true;
        } catch {
          return false;
        }
      },
      readStdin: () => (signal.aborted ? Promise.resolve(null) : this.readStdin()),
      stdinIsTty: true,
      time: () => Math.floor(Date.now() / 1000),
      display: xw,
    };
  }

  /** runs pmars with these arguments (the command line); online: no debugger, a fixed time() */
  private async run(args?: string[], o: { online?: boolean; time?: number } = {}): Promise<number | null> {
    if (this.running) return null;
    const argv = args ?? shellSplit(this.cmd.value);
    const run = (this.running = new AbortController());
    const signal = AbortSignal.any([this.ctx.signal, run.signal]);
    this.runBtn.disabled = this.onlineBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.tty.write(`$ pmars ${argv.map(quote).join(' ')}\n`);
    const xw = new XWindow(this.xhost, {
      signal, frame: this.ctx.frame, noDebugger: o.online,
      onOpen: (r) => { this.xhost.classList.add('cw-open'); (r.querySelector('.fg-term-sink') as HTMLElement | null)?.focus(); },
      onClose: () => { this.xhost.classList.remove('cw-open'); this.tty.focus(); },
    });
    const h = this.host(xw, signal);
    if (o.time !== undefined) h.time = () => o.time!;
    set_host(h);
    let status: number | null = null;
    try {
      status = await main(argv, { server: o.online });
      if (status) this.tty.write(`[pmars exited with status ${status}]\n`);
    } catch (e) {
      if (signal.aborted) this.tty.write('[stopped]\n');
      else {
        console.error(e);
        this.tty.write(`[pmars failed: ${e instanceof Error ? e.message : e}]\n`);
      }
    } finally {
      run.abort();
      this.xhost.classList.remove('cw-open');
      this.xhost.replaceChildren();
      this.keyHandler = null;
      this.running = null;
      if (!this.ctx.signal.aborted) {
        this.runBtn.disabled = this.onlineBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.tty.write('\n');
      }
    }
    return status;
  }

  /* ------------------------------------------------------------ online battles */

  private async online(): Promise<void> {
    if (this.running) return;
    const layer = el('div', { className: 'cw-overlay' });
    this.root.querySelector('.cw-main')!.append(layer);
    const values = this.optionValues();
    let round: RoundStart;
    try {
      round = await this.ctx.lobby(layer, {
        title: 'Core War online',
        seats: { min: 2, max: 8, default: 2 },
        options: () => packGame(Options, (o) => Object.assign(o, values)),
      });
    } catch {
      layer.remove();
      return;
    }
    await this.battle(round, layer);
  }

  private async battle(round: RoundStart, layer: HTMLElement): Promise<void> {
    const ctx = this.ctx;
    let opts = { rounds: 3, coreSize: 8000, cycles: 80000, processes: 8000, maxLength: 100, minDistance: 0, icws88: false, readLimit: 0, writeLimit: 0, pSpaceSize: 0 };
    try {
      if (round.options.length) {
        const o = unpackGame(Options, round.options);
        opts = { rounds: o.rounds, coreSize: o.coreSize, cycles: o.cycles, processes: o.processes, maxLength: o.maxLength, minDistance: o.minDistance, icws88: o.icws88, readLimit: o.readLimit, writeLimit: o.writeLimit, pSpaceSize: o.pSpaceSize };
      }
    } catch { /* the module checked them */ }
    const names = new Map(round.seats.map((s) => [s.seat, s.name]));
    const sources = new Map<number, string>();
    const choose = el('select');
    for (const n of [...this.mine, ...Object.keys(bundled).filter((k) => k.startsWith('warriors/')).sort()]) choose.append(el('option', { value: n, textContent: n }));
    if (this.editName.value) choose.value = this.editName.value;
    const enter = el('button', { className: 'cw-go', textContent: 'Enter this warrior' });
    const leave = el('button', { textContent: 'Leave' });
    const note = el('p', { className: 'cw-muted' });
    const args = optionArgs(opts);
    layer.replaceChildren(el('div', { className: 'cw-box' },
      el('h2', { textContent: 'Core War online' }),
      el('p', { textContent: `Warriors: ${round.seats.map((s) => `${s.name}${s.seat === round.you ? ' (you)' : ''}`).join(', ')}` }),
      el('p', { className: 'cw-muted', textContent: `pmars ${args.join(' ')}` }),
      el('p', {}, choose, ' ', enter), note, el('p', {}, leave)));
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      offMsg();
      offFin();
      offClosed();
      layer.remove();
    };
    leave.onclick = () => { ctx.rooms.leave(); finish(); };
    enter.onclick = async () => {
      const t = await this.readFile(choose.value);
      if (t === null) return;
      const text = new TextDecoder().decode(Uint8Array.from(t, (c) => c.charCodeAt(0)));
      if (new TextEncoder().encode(text).length > 16 * 1024) { note.textContent = 'At most 16 KiB of source.'; return; }
      ctx.rooms.send(packGame(Msg, (m) => { m.warrior = text; }), 'server');
      enter.disabled = choose.disabled = true;
      note.textContent = 'Entered. Waiting for the other warriors (they stay secret until everyone has entered one).';
    };
    const offMsg = ctx.rooms.on('message', (msg) => {
      if (msg.from !== SERVER_SEAT) return;
      let m: Msg;
      try { m = unpackGame(Msg, msg.data); } catch { return; }
      if (m._isEntered) sources.set(m.entered.seat, m.entered.source);
      else if (m._isStart) {
        const order: number[] = [];
        for (let i = 0; i < m.start.seats.length; i++) order.push(m.start.seats.get(i));
        void this.fight(order, sources, names, args, m.start.time, layer);
      }
    });
    const offFin = ctx.rooms.on('finished', ({ results }) => {
      this.outcome(results, names);
      ctx.rooms.leave();
      finish();
    });
    const offClosed = ctx.rooms.on('closed', () => finish());
    ctx.signal.addEventListener('abort', finish, { once: true });
  }

  private async fight(order: number[], sources: Map<number, string>, names: Map<number, string>, opts: string[], time: number, layer: HTMLElement): Promise<void> {
    layer.style.display = 'none';
    this.overlay = {};
    const files: string[] = [];
    for (const s of order) {
      const f = `seat${s}.red`;
      this.overlay[f] = sources.get(s) ?? '';
      files.push(f);
    }
    this.tty.write(`Online battle: ${order.map((s, i) => `warrior ${i} = ${names.get(s) ?? `seat ${s}`}`).join(', ')}\n`);
    const view = this.inputs.get('-v')!.value;
    const status = await this.run([...opts, ...(view ? ['-v', view] : []), ...files], { online: true, time });
    this.overlay = {};
    layer.style.display = '';
    if (status === null) return;
    const n = order.length;
    const scores: number[] = [];
    if (status === 0) for (let i = 0; i < n; i++) for (let j = 0; j < 2 * n - 1; j++) scores.push(g.warrior[i].score[j]);
    this.ctx.rooms.send(packGame(Msg, (m) => {
      const r = m._initReport();
      r.status = status;
      const l = r._initScores(scores.length);
      scores.forEach((v, i) => l.set(i, v));
    }), 'server');
    layer.querySelector('.cw-muted:last-of-type')?.replaceChildren('Reported. Waiting for the others\' results.');
  }

  private outcome(data: Uint8Array, names: Map<number, string>): void {
    try {
      const r = unpackGame(Results, data);
      const seats: number[] = [];
      for (let i = 0; i < r.seats.length; i++) seats.push(r.seats.get(i));
      const who = (i: number) => names.get(seats[i]) ?? `warrior ${i}`;
      // seats without a report (they left, or did not report in time)
      const missing: string[] = [];
      for (let i = 0; i < r.missing.length; i++) missing.push(names.get(r.missing.get(i)) ?? `seat ${r.missing.get(i)}`);
      if (r._isAgreed) {
        const a = r.agreed, n = seats.length;
        const agree = r.unconfirmed ? 'Unconfirmed (only one client reported)' : missing.length ? 'The clients that reported agree' : 'Every client agrees';
        if (a.status !== 0) this.tty.write(`${agree}: pMARS stopped with status ${a.status}.\n\n`);
        else {
          let s = r.unconfirmed ? 'The result, unconfirmed (only one client reported it):\n' : `${agree} on the result:\n`;
          for (let i = 0; i < n; i++) {
            const row: number[] = [];
            for (let j = 0; j < 2 * n - 1; j++) row.push(a.scores.get(i * (2 * n - 1) + j));
            const plural = (k: number, w: string) => `${k} ${w}${k === 1 ? '' : 's'}`;
            s += `  ${who(i)}: ${n === 2 ? `${plural(row[0], 'win')}, ${plural(row[1], 'tie')}` : `results ${row.slice(0, n).join(' ')}`}\n`;
          }
          this.tty.write(`${s}\n`);
        }
      } else {
        this.tty.write('Dispute: the clients reported different results:\n');
        for (let i = 0; i < r.dispute.length; i++) {
          const d = r.dispute.get(i);
          const l: number[] = [];
          for (let j = 0; j < d.report.scores.length; j++) l.push(d.report.scores.get(j));
          this.tty.write(`  ${names.get(d.seat) ?? d.seat}: status ${d.report.status}, scores ${l.join(' ')}\n`);
        }
        this.tty.write('\n');
      }
      if (missing.length) this.tty.write(`No report from ${missing.join(', ')} (left, or not within 10 minutes of the first report).\n\n`);
    } catch {
      this.tty.write('The round ended.\n');
    }
  }
}
