// The program's working directory in the browser: the player's account storage (saved games, recordings,
// the run history, in the original's formats), and the high-score files, which every user of a machine
// shared, as the server's score tables (protocol/games/brogue.capnp, BrogueModule.java).
import { packGame, playerName, unpackGame, type GameContext } from '../../../src/sdk/index.ts';
import { Score } from './proto/brogue.ts';

type HostContext = Pick<GameContext, 'storage' | 'scores' | 'signal'>;

/** the high-score files (platformdependent.c setHighScoresFilename()) and their tables */
export const SCORE_FILES: Record<string, string> = {
  'BrogueHighScores.txt': 'Brogue',
  'RapidBrogueHighScores.txt': 'RapidBrogue',
  'BulletBrogueHighScores.txt': 'BulletBrogue',
};
/** HIGH_SCORES_COUNT */
const LINES = 30;

/**
 * A file name of the game as a storage name ([A-Za-z0-9._-]{1,64}): letters, digits and '.' stay, every other
 * character is '-' and its code in two hex digits ("Saved #3.broguesave" is "Saved-20-233.broguesave"); null
 * when that is longer than storage allows.
 */
export function storageName(path: string): string | null {
  if (path.includes('/')) return null;
  let s = '';
  for (const ch of path) {
    const c = ch.charCodeAt(0);
    if (/[A-Za-z0-9.]/.test(ch)) s += ch;
    else if (c < 256) s += '-' + c.toString(16).padStart(2, '0');
    else return null;
  }
  return s.length >= 1 && s.length <= 64 ? s : null;
}

export function gamePath(name: string): string {
  return name.replace(/-([0-9a-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/** a high-score file in the original's format from a table: score, tab, date in seconds, tab, description */
export function scoreFileText(entries: { score: number; time: number; description: string }[]): string {
  const lines: string[] = [];
  for (const e of entries.slice(0, LINES)) lines.push(`${e.score}\t${Math.floor(e.time / 1000)}\t${e.description}\n`);
  while (lines.length < LINES) lines.push('0\t0\t(empty entry)\n');
  return lines.join('');
}

/** the lines of a high-score file: [score, date, description] */
export function scoreFileLines(text: string): [number, number, string][] {
  const out: [number, number, string][] = [];
  for (const line of text.split('\n')) {
    const m = /^(-?\d+)\t(-?\d+)\t(.*)$/.exec(line);
    if (m) out.push([Number(m[1]), Number(m[2]), m[3]]);
  }
  return out;
}

const latin1 = (b: Uint8Array) => {
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
  return s;
};

export class GameFiles {
  private readonly ctx: HostContext;
  private readonly pending = new Map<string, Uint8Array | null>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private flushing: Promise<void> | null = null;
  /** the lines of each high-score file as the server gave them or as last submitted */
  private readonly scoreLines = new Map<string, string[]>();
  onError: (msg: string) => void = () => {};

  constructor(ctx: HostContext) {
    this.ctx = ctx;
  }

  /** the working directory: the stored files, and the high-score files from the server's tables */
  async load(): Promise<Map<string, Uint8Array>> {
    const out = new Map<string, Uint8Array>();
    const list = await this.ctx.storage.list('');
    for (const f of list) {
      const data = await this.ctx.storage.get(f.name);
      if (data) out.set(gamePath(f.name), data);
    }
    for (const [file, table] of Object.entries(SCORE_FILES)) {
      let text = scoreFileText([]);
      try {
        const entries = await this.ctx.scores.get(table, LINES);
        text = scoreFileText(entries.map((e) => {
          let description = '';
          try {
            description = unpackGame(Score, e.detail).description;
          } catch {
            description = '?';
          }
          return { score: Number(e.score), time: e.time, description };
        }));
      } catch (e) {
        this.onError(`The server's high scores could not be read: ${e instanceof Error ? e.message : String(e)}`);
      }
      out.set(file, new TextEncoder().encode(text));
      this.scoreLines.set(file, text.split('\n'));
    }
    return out;
  }

  /** may the program create a file of this name? (only what storage can keep) */
  canCreate(path: string): boolean {
    return path in SCORE_FILES || storageName(path) !== null;
  }

  /** a file of the game changed (null: removed) */
  changed(path: string, data: Uint8Array | null): void {
    if (path in SCORE_FILES) {
      if (data) this.scoresChanged(path, data);
      return;
    }
    const n = storageName(path);
    if (!n) return;
    this.pending.set(n, data ? data.slice() : null);
    // the changes of one moment (a recording flushed, then renamed) go together
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        void this.flush();
      }, 0);
    }
  }

  /** saveHighScore() wrote the file: the lines that are new go to the server's table */
  private scoresChanged(file: string, data: Uint8Array): void {
    const old = this.scoreLines.get(file) ?? [];
    const text = latin1(data);
    const lines = text.split('\n');
    const remaining = [...old];
    for (const line of lines) {
      const k = remaining.indexOf(line);
      if (k >= 0) {
        remaining.splice(k, 1);
        continue;
      }
      const parsed = scoreFileLines(line)[0];
      if (!parsed || parsed[2] === '(empty entry)') continue;
      const [score, , description] = parsed;
      const detail = packGame(Score, (s) => {
        s.description = description;
      });
      this.ctx.scores.submit(SCORE_FILES[file], score, playerName() || 'Rogue', detail).catch((e) => {
        if (!this.ctx.signal.aborted) this.onError(`The server did not take the high score: ${e instanceof Error ? e.message : String(e)}`);
      });
    }
    this.scoreLines.set(file, lines);
  }

  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.flushing) {
      this.flushing = (async () => {
        try {
          // every file is tried: one the server refuses does not hold back the others; each failure is reported
          while (this.pending.size) {
            const [n, data] = this.pending.entries().next().value!;
            this.pending.delete(n);
            try {
              if (data) await this.ctx.storage.put(n, data);
              else await this.ctx.storage.delete(n);
            } catch (e) {
              if (!this.ctx.signal.aborted) this.onError(`The server did not keep ${gamePath(n)}: ${e instanceof Error ? e.message : String(e)}`);
            }
          }
        } finally {
          this.flushing = null;
        }
      })();
    }
    return this.flushing;
  }
}
