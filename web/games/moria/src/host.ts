// What the browser gives the program besides its screen (index.ts): its working directory in the
// player's account storage, the score file as the server's score table, and the keys as a terminal sends
// them. Kept apart from index.ts so that node tests can use it (test/host.test.ts).
import { packGame, unpackGame, type GameContext, type KeyInput } from '../../../src/sdk/index.ts';
import type { FileSystem, ScoreFile } from './platform.ts';
import { Score } from './proto/moria.ts';
import { HighScore_t } from './structs.ts';

/** What the files and the scores use of the game's context. */
export type HostContext = Pick<GameContext, 'storage' | 'scores' | 'signal'>;

/** what the server stores: [A-Za-z0-9._-]{1,64} */
export const storageName = (n: string): boolean => /^[A-Za-z0-9._-]{1,64}$/.test(n) && n !== '.' && n !== '..';
const MAX_FILES = 64;
const MAX_FILE = 512 * 1024;
const MAX_TOTAL = 4 * 1024 * 1024;
/** the score file the program opens; its entries are the server's table (ServerScores) */
export const SCORE_FILE = 'scores.dat';

/**
 * The program's working directory: the player's account storage, loaded when the game starts, every
 * write saved back. A name the storage cannot keep cannot be written (the program says it cannot open
 * the file). scores.dat is there, empty, so that the program finds its score file.
 */
export class StorageFiles implements FileSystem {
  private readonly map = new Map<string, Uint8Array>();
  private readonly ctx: HostContext;
  private readonly dirty = new Set<string>();
  private readonly gone = new Set<string>();
  private flushing: Promise<void> | null = null;
  onError: (msg: string) => void = () => {};

  constructor(ctx: HostContext) {
    this.ctx = ctx;
  }

  async load(): Promise<void> {
    for (const f of await this.ctx.storage.list('')) {
      const data = await this.ctx.storage.get(f.name);
      if (data) this.map.set(f.name, data);
    }
  }

  read(name: string): Uint8Array | null {
    if (name === SCORE_FILE) return new Uint8Array(0);
    return this.map.get(name)?.slice() ?? null;
  }

  exists(name: string): boolean {
    return name === SCORE_FILE || this.map.has(name);
  }

  write(name: string, data: Uint8Array): boolean {
    if (name === SCORE_FILE) return true;
    if (!storageName(name)) return false;
    if (!this.map.has(name) && this.map.size >= MAX_FILES) return false;
    let total = 0;
    for (const [k, v] of this.map) if (k !== name) total += v.length;
    if (data.length > MAX_FILE || total + data.length > MAX_TOTAL) return false;
    this.map.set(name, data.slice());
    this.gone.delete(name);
    this.dirty.add(name);
    this.schedule();
    return true;
  }

  remove(name: string): boolean {
    if (!this.map.delete(name)) return false;
    this.dirty.delete(name);
    this.gone.add(name);
    this.schedule();
    return true;
  }

  /** The program writes a file piece by piece: it goes to the server once the program waits for a key. */
  private schedule(): void {
    if (this.flushing) return;
    this.flushing = new Promise((resolve) => setTimeout(resolve, 0)).then(() => this.flush());
  }

  private async flush(): Promise<void> {
    try {
      while (this.dirty.size || this.gone.size) {
        for (const n of [...this.gone]) {
          this.gone.delete(n);
          await this.ctx.storage.delete(n);
        }
        for (const n of [...this.dirty]) {
          this.dirty.delete(n);
          const data = this.map.get(n);
          if (data) await this.ctx.storage.put(n, data);
        }
      }
    } catch (e) {
      if (!this.ctx.signal.aborted) this.onError(`The server did not keep the file: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      this.flushing = null;
    }
  }

  /** Resolves when every write has reached the server (or failed). */
  async settled(): Promise<void> {
    while (this.flushing) await this.flushing;
  }
}

/** HighScore_t <-> the score table's entries (protocol/games/moria.capnp, Score). */
export function packScore(e: HighScore_t): Uint8Array {
  return packGame(Score, (s) => {
    s.points = e.points;
    s.birthDate = e.birth_date;
    s.uid = e.uid;
    s.maxHp = e.mhp;
    s.curHp = e.chp;
    s.dungeonDepth = e.dungeon_depth;
    s.level = e.level;
    s.deepestDepth = e.deepest_dungeon_depth;
    s.gender = e.gender;
    s.race = e.race;
    s.characterClass = e.character_class;
    s.name = e.name;
    s.diedFrom = e.died_from;
  });
}

export function unpackScore(detail: Uint8Array): HighScore_t | null {
  try {
    const s = unpackGame(Score, detail);
    const e = new HighScore_t();
    e.points = s.points;
    e.birth_date = s.birthDate;
    e.uid = s.uid;
    e.mhp = s.maxHp;
    e.chp = s.curHp;
    e.dungeon_depth = s.dungeonDepth;
    e.level = s.level;
    e.deepest_dungeon_depth = s.deepestDepth;
    e.gender = s.gender;
    e.race = s.race;
    e.character_class = s.characterClass;
    e.name = s.name;
    e.died_from = s.diedFrom;
    return e;
  } catch {
    return null;
  }
}

/** The score file as the server's table: entered and read as recordNewHighScore/showScoresScreen do. */
export class ServerScores implements ScoreFile {
  private readonly ctx: HostContext;

  constructor(ctx: HostContext) {
    this.ctx = ctx;
  }

  async record(entry: HighScore_t): Promise<string | null> {
    try {
      await this.ctx.scores.submit('scores', entry.points, entry.name, packScore(entry));
      return null;
    } catch {
      return `Error opening score file '${SCORE_FILE}'.`;
    }
  }

  async read(): Promise<HighScore_t[] | string> {
    try {
      const out: HighScore_t[] = [];
      for (const e of await this.ctx.scores.get('scores', 0)) {
        const s = unpackScore(e.detail);
        if (s) out.push(s);
      }
      return out;
    } catch {
      return `Error opening score file '${SCORE_FILE}'.`;
    }
  }
}

/** The bytes a key sends to the program, as a terminal sends them (the arrows move: see README.md). */
export function keyBytes(k: KeyInput, roguelike: boolean): number[] {
  const arrows: Record<string, [string, string]> = {
    ArrowUp: ['8', 'k'], ArrowDown: ['2', 'j'], ArrowLeft: ['4', 'h'], ArrowRight: ['6', 'l'],
    Home: ['7', 'y'], PageUp: ['9', 'u'], End: ['1', 'b'], PageDown: ['3', 'n'],
  };
  const a = arrows[k.key];
  if (a && !k.ctrl && !k.alt && !k.meta) {
    const [orig, rl] = a;
    // with Shift: run (the original's '.' and a direction, the roguelike capital letter)
    if (k.shift) return roguelike ? [rl.toUpperCase().charCodeAt(0)] : [46, orig.charCodeAt(0)];
    return [(roguelike ? rl : orig).charCodeAt(0)];
  }
  // other keys that send an escape sequence (F1-F12, Insert, Delete, Alt with a key) would reach the
  // original as ESC and then letters and digits that it takes for commands: they are not passed on
  if (k.seq.length > 1 && k.seq[0] === '\x1b') return [];
  const out: number[] = [];
  for (const ch of k.seq) {
    const c = ch.charCodeAt(0);
    if (c < 0x80) out.push(c);
  }
  return out;
}
