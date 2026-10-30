// The player's best score and the running game, which the original's LocalStorageManager kept in
// the browser's localStorage (keys "bestScore" and "gameState", the state as JSON). They are files
// in the player's account on the server here, in the original's own formats and under the same
// names; the game reads them once at the start and writes each change in the background, in order.
import type { GameState, StorageManager } from './game.ts';

/** The part of the SDK's Storage this uses (ctx.storage). */
export interface StorageFiles {
  get(name: string): Promise<Uint8Array | null>;
  put(name: string, data: Uint8Array): Promise<unknown>;
  delete(name: string): Promise<boolean>;
}

export const BEST_SCORE_KEY = 'bestScore';
export const GAME_STATE_KEY = 'gameState';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Loading the two files may wait for the server; the game itself must not. */
const LOAD_MS = 1500;

export class ServerStorage implements StorageManager {
  private bestScore = 0;
  private gameState: GameState | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly files: StorageFiles;

  private constructor(files: StorageFiles) {
    this.files = files;
  }

  /** Reads the player's two files; if the server does not answer, the game starts fresh. */
  static async load(files: StorageFiles, signal?: AbortSignal): Promise<ServerStorage> {
    const storage = new ServerStorage(files);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const nothing = (): [null, null] => [null, null];
    const timeout = new Promise<[Uint8Array | null, Uint8Array | null]>((resolve) => {
      timer = setTimeout(() => resolve(nothing()), LOAD_MS);
    });
    const aborted = new Promise<[Uint8Array | null, Uint8Array | null]>((resolve) => {
      if (signal?.aborted) resolve(nothing());
      else signal?.addEventListener('abort', () => resolve(nothing()), { once: true });
    });
    let best: Uint8Array | null = null;
    let state: Uint8Array | null = null;
    try {
      [best, state] = await Promise.race([
        Promise.all([files.get(BEST_SCORE_KEY), files.get(GAME_STATE_KEY)]),
        timeout,
        aborted,
      ]);
    } finally {
      clearTimeout(timer);
    }
    if (best) storage.bestScore = Number(decoder.decode(best)) || 0;
    if (state) {
      try {
        storage.gameState = JSON.parse(decoder.decode(state)) as GameState;
      } catch {
        storage.gameState = null; // not a state this game wrote: start a new game
      }
    }
    return storage;
  }

  getBestScore(): number {
    return this.bestScore;
  }

  setBestScore(score: number): void {
    this.bestScore = score;
    this.write(() => this.files.put(BEST_SCORE_KEY, encoder.encode(String(score))));
  }

  getGameState(): GameState | null {
    return this.gameState;
  }

  setGameState(gameState: GameState): void {
    this.gameState = gameState;
    const json = JSON.stringify(gameState);
    this.write(() => this.files.put(GAME_STATE_KEY, encoder.encode(json)));
  }

  clearGameState(): void {
    this.gameState = null;
    this.write(() => this.files.delete(GAME_STATE_KEY));
  }

  /** The writes run in the order the game made them; a failure must not stop the next one. */
  private write(op: () => Promise<unknown>): void {
    this.queue = this.queue.then(op).catch(() => { /* the server could not be reached: the game goes on */ });
  }

  /** Waits for the writes still in flight (leaving the game), but not forever. */
  async flush(ms: number): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<void>((resolve) => { timer = setTimeout(resolve, ms); });
    try {
      await Promise.race([this.queue, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
