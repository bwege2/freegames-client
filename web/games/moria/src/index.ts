// Moria (Umoria 5.7.15) on the website: the program as it starts in a terminal (`umoria` with no options:
// it restores game.sav if there is one, or makes a new character), on an 80x24 screen. The files it
// writes in its working directory (game.sav, character records) are the player's account storage; the
// score file scores.dat is the server's score table "scores", shared by everyone who plays here
// (server/.../games/moria/MoriaModule.java). When the program ends (^X saved, ^K quit, a death) the page
// goes back to the game page, as the original went back to the shell.
import { playerName, TextScreen, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import { config } from './config.ts';
import type { Window as Screen } from './curses.ts';
import { main } from './main.ts';
import { keyBytes, ServerScores, StorageFiles } from './host.ts';
import type { Platform, Tm } from './platform.ts';
import { setPlatform } from './platform.ts';

const DATA = import.meta.glob('../assets/data/*.txt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

class BrowserPlatform implements Platform {
  readonly files: StorageFiles;
  readonly scores: ServerScores;
  private readonly screen: TextScreen;
  private readonly ctx: GameContext;
  private readonly bytes: number[] = [];
  private shown: string[] = [];
  private lastYield = performance.now();
  waiting = false;

  constructor(screen: TextScreen, ctx: GameContext, files: StorageFiles) {
    this.screen = screen;
    this.ctx = ctx;
    this.files = files;
    this.scores = new ServerScores(ctx);
  }

  /** Puts the program's screen on the page: the rows that changed, and the cursor. */
  show(w: Screen): void {
    const g = this.screen.grid;
    for (let y = 0; y < 24; y++) {
      const row = w.row(y);
      if (row !== this.shown[y]) {
        g.writeAt(y, 0, row);
        this.shown[y] = row;
      }
    }
    g.moveTo(w.cury, w.curx);
  }

  text(): string {
    return this.shown.join('\n');
  }

  async getch(w: Screen): Promise<number> {
    this.show(w);
    if (!this.bytes.length) {
      this.waiting = true;
      try {
        do this.bytes.push(...keyBytes(await this.screen.readKey(), config.options.use_roguelike_keys));
        while (!this.bytes.length);
      } finally {
        this.waiting = false;
      }
      this.lastYield = performance.now();
    }
    return this.bytes.shift()!;
  }

  /** checkForNonBlockingKeyPress(): a key that is waiting is taken (and dropped), as the original reads it. */
  keyWaiting(): boolean {
    if (this.bytes.length) {
      this.bytes.shift();
      return true;
    }
    if (this.screen.keyWaiting()) {
      // readKey() takes a waiting key from the queue at once
      void this.screen.readKey().catch(() => {});
      return true;
    }
    return false;
  }

  async refresh(w: Screen): Promise<void> {
    // a long rest or run draws now and then and lets keys in (which interrupt it, as in a terminal)
    if (performance.now() - this.lastYield > 40) {
      this.show(w);
      await new Promise((resolve) => setTimeout(resolve, 0));
      this.lastYield = performance.now();
      if (this.ctx.signal.aborted) throw new Error('stopped');
    }
  }

  endwin(w: Screen): void {
    this.show(w);
  }

  bell(): void {
    const a = this.ctx.audio;
    if (a.state !== 'running') return;
    const o = a.createOscillator(), v = a.createGain();
    o.frequency.value = 880;
    v.gain.value = 0.05;
    o.connect(v).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.06);
  }

  time(): number {
    return Math.floor(Date.now() / 1000);
  }

  localtime(t: number): Tm {
    const d = new Date(t * 1000);
    return {
      tm_sec: d.getSeconds(), tm_min: d.getMinutes(), tm_hour: d.getHours(), tm_mday: d.getDate(),
      tm_mon: d.getMonth(), tm_year: d.getFullYear() - 1900, tm_wday: d.getDay(),
    };
  }

  login(): string {
    // getlogin(): the player's name on the site, as far as a terminal's login name can hold it
    const n = playerName().replace(/[^ -~]/g, '').trim().slice(0, 23);
    return n || 'player';
  }

  data(path: string): string | null {
    return DATA[`../assets/${path}`] ?? null;
  }
}

declare global {
  interface Window {
    /** for the screenshots and the end-to-end test: the screen's text, and whether the program waits for a key */
    __moria?: { text(): string; waiting(): boolean };
  }
}

export const start: StartGame = (host, ctx) => {
  const screen = new TextScreen(host, { cols: 80, rows: 24 }, ctx.signal);
  screen.grid.writeAt(0, 0, 'Loading your files...');
  const files = new StorageFiles(ctx);
  const platform = new BrowserPlatform(screen, ctx, files);
  files.onError = (msg) => console.warn(`moria: ${msg}`);
  window.__moria = { text: () => platform.text(), waiting: () => platform.waiting };
  void (async () => {
    try {
      await files.load();
    } catch (e) {
      console.warn('moria: the files could not be loaded', e);
    }
    if (ctx.signal.aborted) return;
    setPlatform(platform);
    try {
      await main([]);
    } catch (e) {
      if (!ctx.signal.aborted) console.error('moria:', e);
      return;
    }
    // the program ended (saved, quit, dead): back to the game page once the files are on the server
    await files.settled();
    if (!ctx.signal.aborted) ctx.exit();
  })();
  return {
    // the screen, its keys and the waiting getch() end with ctx.signal; the program's promise chain is
    // left with a rejected key and ends
    stop: () => {
      delete window.__moria;
    },
  };
};
