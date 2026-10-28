// NetHack 3.6.7 in the browser: the translated program (re/nethack/tools/c2ts) on a VT100 drawn on the
// SDK's TextScreen, its installation (assets/), the player's save and bones files in account storage.
import { BOLD, REVERSE, TextScreen, UNDERLINE, playerName, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import nhdatUrl from '../assets/nhdat?url';
import licenseUrl from '../assets/license?url';
import symbolsUrl from '../assets/symbols?url';
import sysconfUrl from '../assets/sysconf?url';
import { G } from './globals.ts';
import { Painter, StorageFiles, finishedEntry, keyBytes, packEntry, recordFile } from './host.ts';
import { initGlobals } from './init.ts';
import { cstr } from './rt/cstring.ts';
import { fsRead, fsReset, termTake } from './rt/fs.ts';
import { Exit, setPlatform, type Platform } from './rt/platform.ts';
import { P } from './rt/ptr.ts';
import { resetRng } from './rt/rng.ts';
import { resetSys } from './rt/sys.ts';
import { main } from './unixmain.ts';
import { VT } from './vt.ts';

const ASSETS: Record<string, string> = { nhdat: nhdatUrl, license: licenseUrl, symbols: symbolsUrl, sysconf: sysconfUrl };

class BrowserPlatform implements Platform {
  readonly localTime = true;
  readonly vt = new VT();
  private readonly painter = new Painter({ bold: BOLD, reverse: REVERSE, underline: UNDERLINE });
  private readonly screen: TextScreen;
  private readonly ctx: GameContext;
  private readonly files: StorageFiles;
  private readonly queue: number[] = [];
  /** the entry of the record on its way to the server */
  submitting: Promise<unknown> = Promise.resolve();
  waiting = false;

  constructor(screen: TextScreen, ctx: GameContext, files: StorageFiles) {
    this.screen = screen;
    this.ctx = ctx;
    this.files = files;
  }

  show(terminal: number[]): void {
    this.vt.feed(terminal);
    this.painter.paint(this.vt, this.screen.grid);
  }

  async getKey(terminal: number[]): Promise<number> {
    this.show(terminal);
    if (!this.queue.length) {
      this.waiting = true;
      try {
        do this.queue.push(...keyBytes(await this.screen.readKey(), !!G.iflags?.num_pad));
        while (!this.queue.length);
      } finally {
        this.waiting = false;
      }
    }
    return this.queue.shift()!;
  }

  async delay(ms: number, terminal: number[]): Promise<void> {
    this.show(terminal);
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, ms);
      this.ctx.signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new Error('stopped'));
      }, { once: true });
    });
  }

  time(): number {
    return Math.floor(Date.now() / 1000);
  }

  login(): string {
    // the player's name on the site, as a login name can hold it (NetHack asks "Who are you?" when empty)
    return playerName().replace(/[^A-Za-z0-9 _-]/g, '').trim().slice(0, 30);
  }

  seed(): number {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return (a[0] & 0x1fffff) * 4294967296 + a[1];
  }

  fileChanged(path: string, data: Uint8Array | null): void {
    this.files.changed(path, data);
    if (path === 'xlogfile' && data) {
      // topten(): the game's entry is in the logfile now; the server's record decides its place
      const e = finishedEntry(data, fsRead('logfile') ?? new Uint8Array(0));
      if (e) {
        this.submitting = this.ctx.scores.submit('record', e.points, e.name.trim() || '_', packEntry(e))
          .catch((err) => console.warn('nethack: the record did not take the entry', err));
      }
    }
  }

  stderr(bytes: Uint8Array): void {
    console.warn('nethack:', String.fromCharCode(...bytes));
  }

  text(): string {
    return this.vt.text();
  }
}

declare global {
  interface Window {
    /** for the screenshots and the end-to-end test: the screen's text, and whether the program waits for a key */
    __nethack?: { text(): string; waiting(): boolean };
  }
}

async function installation(signal: AbortSignal): Promise<Map<string, Uint8Array>> {
  const m = new Map<string, Uint8Array>();
  await Promise.all(Object.entries(ASSETS).map(async ([name, url]) => {
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    m.set(name, new Uint8Array(await r.arrayBuffer()));
  }));
  for (const f of ['record', 'logfile', 'xlogfile', 'perm']) m.set(f, new Uint8Array(0));
  return m;
}

export const start: StartGame = (host, ctx) => {
  const screen = new TextScreen(host, { cols: 80, rows: 24 }, ctx.signal);
  screen.grid.writeAt(0, 0, 'Loading NetHack...');
  const files = new StorageFiles(ctx);
  files.onError = (msg) => console.warn(`nethack: ${msg}`);
  const platform = new BrowserPlatform(screen, ctx, files);
  window.__nethack = { text: () => platform.text(), waiting: () => platform.waiting };
  void (async () => {
    let fs: Map<string, Uint8Array>;
    try {
      fs = await installation(ctx.signal);
      for (const [k, v] of await files.load()) fs.set(k, v);
      // the record of high scores: the server's table
      try {
        const entries = await ctx.scores.get('record', 0);
        fs.set('record', recordFile(entries, ctx.net.accountId));
      } catch (e) {
        if (ctx.signal.aborted) return;
        console.warn('nethack: no record from the server', e);
      }
    } catch (e) {
      if (!ctx.signal.aborted) {
        console.error('nethack: the files could not be loaded', e);
        screen.grid.writeAt(1, 0, 'The game\'s files could not be loaded.');
      }
      return;
    }
    if (ctx.signal.aborted) return;
    setPlatform(platform);
    fsReset(fs);
    resetRng();
    resetSys();
    initGlobals();
    try {
      await main(1, P([cstr('nethack'), null]));
    } catch (e) {
      if (!(e instanceof Exit)) {
        if (!ctx.signal.aborted) console.error('nethack:', e);
        return;
      }
    }
    // the program ended (saved, quit, dead): what it wrote last (the score list, "Be seeing you...")
    // stays on the screen, as in the terminal it ended in, until a key; then back to the game page once
    // the files are on the server
    const rest = termTake();
    if (rest.length && !ctx.signal.aborted) {
      platform.show(rest);
      platform.waiting = true;
      try {
        await screen.readKey();
      } catch {
        return;
      } finally {
        platform.waiting = false;
      }
    }
    await files.settled();
    await platform.submitting;
    if (!ctx.signal.aborted) ctx.exit();
  })();
  return {
    // the screen, its keys and the waiting getKey() end with ctx.signal; the program's promise chain
    // is left with a rejected key and ends
    stop: () => {
      delete window.__nethack;
    },
  };
};
