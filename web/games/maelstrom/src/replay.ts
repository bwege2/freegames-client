// Maelstrom replays. The original 4.0.2 stores a seed, game information and the
// per-frame input deltas; this browser format keeps the same information as a
// compact text file (`.mreplay`): one hex byte per player per 30 Hz frame.
import type { MaelstromGame } from './sim.ts';

export interface ReplayData {
  version: 1;
  seed: number;
  players: number;
  mode: 'coop' | 'deathmatch';
  wave: number;
  scores: number[];
  frags: number[];
  frames: number[][];
}

export class ReplayRecorder {
  readonly seed: number;
  readonly players: number;
  readonly mode: 'coop' | 'deathmatch';
  readonly frames: number[][] = [];

  constructor(seed: number, players: number, mode: 'coop' | 'deathmatch') {
    this.seed = seed >>> 0;
    this.players = Math.max(1, Math.min(3, players));
    this.mode = mode;
  }

  record(inputs: number[]): void {
    this.frames.push(inputs.slice(0, this.players).map((n) => n & 0x3f));
  }

  finish(game: MaelstromGame): ReplayData {
    return {
      version: 1, seed: this.seed, players: this.players, mode: this.mode,
      wave: game.wave,
      scores: game.players.map((p) => p.score),
      frags: game.players.map((p) => p.frags),
      frames: this.frames.map((f) => f.slice()),
    };
  }
}

export function encodeReplay(data: ReplayData): string {
  const frames = data.frames.map((f) => f.map((n) => (n & 0x3f).toString(16).padStart(2, '0')).join(''));
  return JSON.stringify({
    format: 'maelstrom-replay', version: 1, seed: data.seed, players: data.players,
    mode: data.mode, wave: data.wave, scores: data.scores, frags: data.frags, frames,
  });
}

export function parseReplay(text: string): ReplayData | null {
  try {
    const o = JSON.parse(text) as Record<string, unknown>;
    if (o.format !== 'maelstrom-replay' || o.version !== 1) return null;
    const players = Math.max(1, Math.min(3, Number(o.players) || 1));
    const frames: number[][] = [];
    for (const f of (o.frames as string[]) ?? []) {
      if (typeof f !== 'string' || f.length < players * 2) return null;
      const row: number[] = [];
      for (let i = 0; i < players; i++) row.push(parseInt(f.slice(i * 2, i * 2 + 2), 16) & 0x3f);
      frames.push(row);
    }
    return {
      version: 1, seed: Number(o.seed) >>> 0, players,
      mode: o.mode === 'deathmatch' ? 'deathmatch' : 'coop',
      wave: Number(o.wave) || 1,
      scores: Array.isArray(o.scores) ? o.scores.map(Number) : [],
      frags: Array.isArray(o.frags) ? o.frags.map(Number) : [],
      frames,
    };
  } catch {
    return null;
  }
}
