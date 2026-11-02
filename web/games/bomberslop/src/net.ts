// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// Online: deterministic lockstep through a website room (protocol/games/bomberslop.capnp). Every browser plays the
// same Match from the round's seed. The game goes in turns of four frames; for each turn each browser sends its
// player's keys to everyone, a few turns ahead (INPUT_DELAY), and plays a turn once it has every seat's keys for
// it. On every 16th turn it adds the hash of its game eight turns back; the server compares them.
import { bytes, packGame, unpackGame, type GameContext, type RoundStart } from '../../../src/sdk/index.ts';
import { Match, TURN_FRAMES, packKeys, unpackKeys } from './match.ts';
import { MapEntry, type Config, type Keys } from './sim.ts';
import { Msg, Options, Reason, Results } from './proto/bomberslop.ts';

/** turns the keys are sent ahead: 125 ms */
export const INPUT_DELAY = 2;
/** a turn, ms */
export const TURN_MS = 1000 / 16;
/** how far our turns may run ahead of the slowest seat's (the server allows 16) */
const AHEAD = 14;

export interface RoomOptions {
  pointsToWin: number;
  roundTime: number;
  randomMapOrder: boolean;
  startMap: number;
}

export const DEFAULT_OPTIONS: RoomOptions = { pointsToWin: 5, roundTime: 90, randomMapOrder: false, startMap: 0 };

export function packOptions(o: RoomOptions): Uint8Array {
  return packGame(Options, (x) => {
    x.pointsToWin = o.pointsToWin;
    x.roundTime = o.roundTime;
    x.randomMapOrder = o.randomMapOrder;
    x.startMap = o.startMap;
  });
}

export function readOptions(data: Uint8Array): RoomOptions {
  if (data.length === 0) return { ...DEFAULT_OPTIONS };
  const o = unpackGame(Options, data);
  return { pointsToWin: o.pointsToWin, roundTime: o.roundTime, randomMapOrder: o.randomMapOrder, startMap: o.startMap };
}

export function configOf(o: RoomOptions): Partial<Config> {
  return { points_to_win: o.pointsToWin, round_time: o.roundTime, random_map_order: o.randomMapOrder ? 1 : 0, start_map: o.startMap };
}

export type EndReason = 'won' | 'disagreed' | 'desync' | 'left' | 'limit' | 'stopped';

export interface OnlineEnd {
  reason: EndReason;
  /** the player (index) who won, -1 none */
  winner: number;
  /** the server's message when it stopped the round */
  text: string;
}

/** a round seed as the game's srand() takes it */
export function seedOf(seed: bigint): number {
  return Number(BigInt.asUintN(32, seed ^ (seed >> 32n))) || 1;
}

export class Online {
  readonly ctx: GameContext;
  readonly maps: MapEntry[];
  /** the seats of the round, in order: player i is seats[i] */
  seats: number[] = [];
  names: string[] = [];
  you = -1;
  me = -1;
  options: RoomOptions = { ...DEFAULT_OPTIONS };
  match: Match | null = null;
  /** seat -> keys by turn */
  private keys = new Map<number, number[]>();
  /** seat -> the turn from which it is out */
  private leftAt = new Map<number, number>();
  private removed = new Set<number>();
  /** our turns sent */
  sent = 0;
  /** turns played */
  turn = 0;
  private t0 = 0;
  private hashes = new Map<number, number>();
  private waitingHistory = false;
  private reportedOver = false;
  /** a bomb press since the last turn was sampled */
  private pressed = false;
  end: OnlineEnd | null = null;
  /** for the e2e: the hash after each 16th turn played */
  readonly log: { turn: number; hash: number }[] = [];
  /** players who left, for the screen */
  leftNames: string[] = [];

  constructor(ctx: GameContext, maps: MapEntry[]) {
    this.ctx = ctx;
    this.maps = maps;
  }

  start(r: RoundStart): void {
    const sorted = [...r.seats].sort((a, b) => a.seat - b.seat);
    this.seats = sorted.map((s) => s.seat);
    this.names = sorted.map((s) => s.name || `Player ${s.seat + 1}`);
    this.you = r.you;
    this.me = this.seats.indexOf(r.you);
    this.options = readOptions(r.options);
    this.match = new Match(this.maps, this.seats.length, seedOf(r.seed), configOf(this.options));
    this.keys = new Map(this.seats.map((s) => [s, []]));
    this.leftAt = new Map();
    this.removed = new Set();
    this.hashes = new Map();
    this.sent = 0;
    this.turn = 0;
    this.t0 = performance.now();
    this.end = null;
    this.reportedOver = false;
    this.waitingHistory = r.rejoined;
    this.log.length = 0;
    this.leftNames = [];
  }

  /** a key went down since the last sample (a quick tap between two turns still lays a bomb) */
  bombPressed(): void {
    this.pressed = true;
  }

  message(from: number, data: Uint8Array): void {
    let m: Msg;
    try {
      m = unpackGame(Msg, data);
    } catch {
      return; // not ours
    }
    if (m._isTurn) {
      const t = m.turn;
      const k = this.keys.get(from);
      if (!k || t.turn >>> 0 !== k.length) return; // the server passes each seat's turns in order
      k.push(t.keys & 31);
    } else if (m._isLeft && from === 255) {
      const seat = m.left.seat;
      if (!this.leftAt.has(seat)) {
        this.leftAt.set(seat, m.left.turn >>> 0);
        const i = this.seats.indexOf(seat);
        if (i >= 0) this.leftNames.push(this.names[i]);
      }
    } else if (m._isHistory && from === 255) {
      const h = m.history;
      const k = this.keys.get(h.seat);
      if (!k) return;
      const got = bytes(h.keys);
      if (h.start >>> 0 > k.length) return; // a gap: the server sends them in order, so this is not one of its
      for (let i = k.length - (h.start >>> 0); i < got.length; i++) k.push(got[i] & 31);
      const out = h.leftAt >>> 0;
      if (out !== 0xffffffff && !this.leftAt.has(h.seat)) this.leftAt.set(h.seat, out);
      if (h.seat === this.you && this.waitingHistory) {
        this.waitingHistory = false;
        this.sent = k.length;
        // the clock goes on from where the match is
        const most = Math.max(...[...this.keys.values()].map((x) => x.length));
        this.t0 = performance.now() - most * TURN_MS;
      }
    } else if (m._isStopped && from === 255) {
      this.end = { reason: 'desync', winner: -1, text: `The games went apart at turn ${m.stopped.turn}.` };
    }
  }

  finished(results: Uint8Array, stopped: string): void {
    if (stopped) {
      this.end = { reason: 'stopped', winner: -1, text: stopped };
      return;
    }
    try {
      const r = unpackGame(Results, results);
      const reasons: Record<number, EndReason> = {
        [Reason.WON]: 'won', [Reason.DISAGREED]: 'disagreed', [Reason.DESYNC]: 'desync', [Reason.LEFT]: 'left', [Reason.LIMIT]: 'limit',
      };
      this.end = { reason: reasons[r.reason] ?? 'won', winner: r.winner === 255 ? -1 : this.seats.indexOf(r.winner), text: '' };
    } catch {
      this.end = { reason: 'won', winner: -1, text: '' };
    }
  }

  /** the turn the clock is at */
  clockTurn(now = performance.now()): number {
    return Math.floor((now - this.t0) / TURN_MS);
  }

  /** sends our keys as far as allowed, then plays the turns everyone's keys are here for; returns the frames played */
  tick(now: number, sample: () => Keys, maxTurns = 400): number {
    const match = this.match;
    if (!match || this.end || this.waitingHistory) return 0;
    const clock = this.clockTurn(now);
    // send
    let slowest = Infinity;
    for (const s of this.seats) if (s !== this.you && !this.leftAt.has(s)) slowest = Math.min(slowest, this.keys.get(s)!.length);
    if (slowest === Infinity) slowest = this.sent;
    while (this.sent <= clock + INPUT_DELAY && this.sent <= slowest + AHEAD && this.sent < this.turn + 8) {
      const n = this.sent;
      const k = sample();
      const byte = packKeys({ ...k, bomb: k.bomb || this.pressed });
      this.pressed = false;
      let hash = 0;
      if (n % 16 === 0 && n >= 16) hash = this.hashes.get(n - 8) ?? 0;
      this.ctx.rooms.send(packGame(Msg, (m) => {
        const t = m._initTurn();
        t.turn = n;
        t.keys = byte;
        t.hash = hash;
      }), 'all');
      this.sent++;
      // our own keys come back from the server in its order; we play them from there
    }
    // play
    let frames = 0;
    for (let n = 0; n < maxTurns && this.turn <= clock; n++) {
      const t = this.turn;
      const keys: Keys[] = [];
      let ready = true;
      for (let i = 0; i < this.seats.length; i++) {
        const s = this.seats[i];
        const out = this.leftAt.get(s);
        if (out !== undefined && t >= out) {
          keys.push(unpackKeys(0));
          continue;
        }
        const k = this.keys.get(s)![t];
        if (k === undefined) {
          ready = false;
          break;
        }
        keys.push(unpackKeys(k));
      }
      if (!ready) break;
      for (let i = 0; i < this.seats.length; i++) {
        const out = this.leftAt.get(this.seats[i]);
        if (out !== undefined && t >= out && !this.removed.has(i)) {
          this.removed.add(i);
          match.game.remove_player(i);
        }
      }
      for (let f = 0; f < TURN_FRAMES; f++) match.step(keys);
      frames += TURN_FRAMES;
      this.turn++;
      const h = match.hash();
      this.hashes.set(this.turn - 1, h);
      this.hashes.delete(this.turn - 1 - 64);
      if ((this.turn - 1) % 16 === 0) {
        this.log.push({ turn: this.turn - 1, hash: h });
        if (this.log.length > 2000) this.log.shift();
      }
      if (match.over && !this.reportedOver) {
        this.reportedOver = true;
        const g = match.game;
        const winner = g.bomber_objects.findIndex((b) => b.points === g.config.points_to_win);
        this.ctx.rooms.send(packGame(Msg, (m) => {
          const o = m._initOver();
          o.turn = t;
          o.winner = winner >= 0 ? this.seats[winner] : 255;
          const p = o._initPoints(g.bomber_objects.length);
          g.bomber_objects.forEach((b, i) => p.set(i, b.points));
        }), 'server');
      }
    }
    return frames;
  }

  /** how many turns we wait for others' keys (lag) */
  waiting(now = performance.now()): number {
    return Math.max(0, this.clockTurn(now) - this.turn);
  }

  get waitingForHistory(): boolean {
    return this.waitingHistory;
  }
}
