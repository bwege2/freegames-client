// Score tables shared by every player of a game (the original's machine-wide score file), declared and
// checked by the game's server module (docs/SERVER.md).
import { bytes, setData, type P } from './net/codec.ts';
import type { GameClient } from './net/client.ts';

export interface ScoreEntry {
  rank: number;
  score: bigint;
  name: string;
  accountId: number;
  /** ms since the epoch */
  time: number;
  /** the rest of the original's record (the game's own schema) */
  detail: Uint8Array;
}

function read(t: P.ScoreTable): { rank: number; entries: ScoreEntry[] } {
  const entries: ScoreEntry[] = [];
  for (let i = 0; i < t.entries.length; i++) {
    const e = t.entries.get(i);
    entries.push({ rank: e.rank, score: e.score, name: e.name, accountId: e.accountId, time: e.time, detail: bytes(e.detail) });
  }
  return { rank: t.rank, entries };
}

export class Scores {
  private readonly net: GameClient;

  constructor(net: GameClient) {
    this.net = net;
  }

  /** Enters a score; `rank` is its place (1 = best) or 0 if it did not make the table. */
  async submit(table: string, score: number | bigint, name: string, detail?: Uint8Array): Promise<{ rank: number; entries: ScoreEntry[] }> {
    await this.net.connect();
    const a = await this.net.request((e, req) => {
      const s = e._initScoreSubmit();
      s.req = req;
      s.table = table;
      s.score = BigInt(score);
      s.name = name;
      if (detail) setData((n) => s._initDetail(n), detail);
    });
    return read(a.scoreTable);
  }

  /** The table, best first (`limit` 0 = all). */
  async get(table: string, limit = 0): Promise<ScoreEntry[]> {
    await this.net.connect();
    const a = await this.net.request((e, req) => {
      const s = e._initScoreRequest();
      s.req = req;
      s.table = table;
      s.limit = limit;
    });
    return read(a.scoreTable).entries;
  }
}
