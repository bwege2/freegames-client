// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// A match: the original's game (sim.ts) with the score board between rounds. The original shows the board until a
// key is pressed (GameStatus::show); here it shows SCORE_FRAMES frames (a key may end it early in a local game), so
// that an online match, where every browser must play the same frames, needs no message for it. Everything here is
// deterministic: the same seed and keys give the same match in every browser.
import { FPS, Game, MapEntry, NO_KEYS, type Config, type GameEvent, type Keys } from './sim.ts';

/** the score board between rounds: 4 s */
export const SCORE_FRAMES = 4 * FPS;
/** frames of a turn online: the keys of a turn hold for its four frames */
export const TURN_FRAMES = 4;

export type RoundEnd = Extract<GameEvent, { kind: 'round' }>;

export class Match {
  readonly game: Game;
  /** frames left of the score board (0: playing) */
  board = 0;
  /** the round that ended last */
  lastRound: RoundEnd | null = null;
  /** frames played in all, the board's included */
  frames = 0;
  /** what happened in the last step */
  events: GameEvent[] = [];
  sounds: string[] = [];

  constructor(maps: MapEntry[], players: number, seed: number, config: Partial<Config>) {
    this.game = new Game(maps, players, seed, config);
  }

  get over(): boolean {
    return this.game.over;
  }

  /** one frame: the score board's, or the game's */
  step(keys: readonly Keys[]): void {
    this.frames++;
    this.events = [];
    this.sounds = [];
    if (this.board > 0) {
      this.board--;
      return;
    }
    if (this.game.over) return;
    this.game.frame(keys);
    this.events = this.game.events;
    this.sounds = this.game.sounds;
    for (const e of this.game.events) {
      if (e.kind === 'round') {
        this.lastRound = e;
        this.board = e.over ? 0 : SCORE_FRAMES;
      }
    }
  }

  /** a local game: a key ends the board early */
  skipBoard(): void {
    this.board = 0;
  }

  /** a hash of everything the game decides with, for comparing browsers */
  hash(): number {
    const g = this.game;
    let h = 2166136261 >>> 0;
    const mix = (v: number) => {
      h = Math.imul(h ^ (v | 0), 16777619) >>> 0;
    };
    const fb = new Float32Array(1);
    const ub = new Uint32Array(fb.buffer);
    const mixf = (v: number) => {
      fb[0] = v;
      mix(ub[0]);
    };
    mix(this.board);
    mix(this.frames);
    h = g.rand.hash(h);
    mixf(g.observer.round_time);
    mixf(g.observer.x);
    mixf(g.observer.y);
    for (const b of g.bomber_objects) {
      mixf(b.x);
      mixf(b.y);
      mix(b.cur_dir);
      mix((b.dead ? 1 : 0) | (b.falling ? 2 : 0) | (b.flying ? 4 : 0) | (b.gone ? 8 : 0));
      mix(b.points);
      mix(b.cur_bombs);
      mix(b.power);
      mix(b.speed);
      mix(b.disease ? b.disease.type : 0);
    }
    for (const o of g.objects) {
      mix(o.type);
      mixf(o.x);
      mixf(o.y);
      mix(o.flying ? 1 : 0);
    }
    for (const col of g.map.maptiles) for (const t of col) mix(t.type * 4 + (t.vanishing ? 1 : 0) + (t.destroyed ? 2 : 0));
    return h >>> 0;
  }
}

/** keys as a byte (protocol/games/bomberslop.capnp Turn.keys) */
export function packKeys(k: Keys): number {
  return (k.left ? 1 : 0) | (k.up ? 2 : 0) | (k.right ? 4 : 0) | (k.down ? 8 : 0) | (k.bomb ? 16 : 0);
}

export function unpackKeys(b: number): Keys {
  if (!b) return NO_KEYS;
  return { left: !!(b & 1), up: !!(b & 2), right: !!(b & 4), down: !!(b & 8), bomb: !!(b & 16) };
}
