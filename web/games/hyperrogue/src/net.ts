// The online game (port only; ONLINE.md): the network side of the lockstep, through a website room
// (protocol/games/hyperrogue.capnp, server/.../games/hyperrogue/HyperrogueModule.java). Every browser runs the same
// game from the round's seed (src/online.ts); seat n plays player n. For each round every browser sends its seat's
// decision to everyone (Target.all, its own included) and applies a round once it has a decision from every seat
// still in the game, in the server's order. A seat whose player is off the board sends `none` by itself. Every 8th
// round the decision carries the hash of the game four rounds back; the server compares them. A browser that comes
// back (a dropped connection, a reload) starts the game again and replays every decision so far (History).
// Nothing here draws or touches the DOM; the game side is passed in (GameSide), so tests drive it headless.
import { packGame, unpackGame, type RoundStart, type SendTo } from '../../../src/sdk/index.ts';
import { Msg, Options, Kind, Reason, Results } from './proto/hyperrogue.ts';
import {
  online_start_game, online_apply_round, online_state_hash, online_game_over, online_stats, online_alive,
  DEFAULT_OPTIONS, K_NONE, type OnlineOptions, type OnlineDecision,
} from './online.ts';

/** the port's rules version: rooms only play between equal versions (Options.rulesVersion) */
export const RULES_VERSION = 1;
/** every HASH_EVERY-th round carries the hash of the game HASH_BACK rounds back */
export const HASH_EVERY = 8, HASH_BACK = 4;

export interface RoomOptions extends OnlineOptions {
  rulesVersion: number;
}

export function packOptions(o: OnlineOptions): Uint8Array {
  return packGame(Options, (x) => {
    x.land = o.land;
    x.hardcore = o.hardcore;
    x.orbStrategy = o.orbStrategy;
    x.turnTimeout = o.turnTimeout;
    x.rulesVersion = RULES_VERSION;
  });
}

export function readOptions(data: Uint8Array): RoomOptions {
  if (data.length === 0) return { ...DEFAULT_OPTIONS, rulesVersion: 0 };
  const o = unpackGame(Options, data);
  return { land: o.land, hardcore: o.hardcore, orbStrategy: o.orbStrategy, turnTimeout: o.turnTimeout, rulesVersion: o.rulesVersion };
}

/** a round seed as shrand()/srand() take it (32 bits) */
export function seedOf(seed: bigint): number {
  return Number(BigInt.asUintN(32, seed ^ (seed >> 32n)));
}

/** what the lockstep needs of the game (src/online.ts; tests may wrap it) */
export interface GameSide {
  start(seed: number, o: OnlineOptions, players: number): void;
  apply(decisions: OnlineDecision[], gone: number[], playerOf: (seat: number) => number): boolean;
  hash(): number;
  over(): boolean;
  stats(): { gold: number; seats: { treasures: number; kills: number; deaths: number }[] };
  alive(player: number): boolean;
}

export const GAME: GameSide = {
  start: online_start_game,
  apply: online_apply_round,
  hash: online_state_hash,
  over: online_game_over,
  stats: online_stats,
  alive: online_alive,
};

/** where messages go (ctx.rooms.send) */
export type Send = (data: Uint8Array, to: SendTo) => void;

export type EndReason = 'over' | 'disagreed' | 'desync' | 'left' | 'limit' | 'stopped' | 'version';

export interface OnlineEnd {
  reason: EndReason;
  rounds: number;
  gold: number;
  seats: { treasures: number; kills: number; deaths: number }[];
  /** the server's text when it stopped the round */
  text: string;
}

const KINDS = [Kind.MOVE, Kind.WAIT, Kind.DROP, Kind.ORB, Kind.LEAVE, Kind.NONE];

export class Online {
  readonly send: Send;
  readonly game: GameSide;
  /** the seats of the round, ascending: player i is seats[i] */
  seats: number[] = [];
  names: string[] = [];
  you = -1;
  options: RoomOptions = { ...DEFAULT_OPTIONS, rulesVersion: RULES_VERSION };
  /** the next round to apply (rounds applied: 0 .. round - 1) */
  round = 0;
  /** rounds played (not refused) */
  played = 0;
  /** round -> seat -> its decision, in the order they arrived (the server's) */
  private buf = new Map<number, Map<number, OnlineDecision>>();
  /** seat -> the round from which it is out of the game */
  private leftAt = new Map<number, number>();
  /** the last round we sent a decision for */
  private sentFor = -1;
  /** round -> the hash of the game after it */
  private hashes = new Map<number, number>();
  /** a seat that came back waits for the History before it plays */
  private waitingHistory = false;
  private reportedOver = false;
  end: OnlineEnd | null = null;
  /** the game is over here (Over sent); the results come from the server */
  over = false;
  /** (round, hash) of every round applied, for the tests and the e2e (the last 4096) */
  readonly log: { round: number; hash: number }[] = [];
  /** names of the players who left */
  leftNames: string[] = [];
  /** called after each round applied (the UI redraws its status) */
  onRound: ((played: boolean) => void) | null = null;

  constructor(send: Send, game: GameSide = GAME) {
    this.send = send;
    this.game = game;
  }

  playerOf = (seat: number): number => this.seats.indexOf(seat);

  /** the round starts (or starts again for a seat that came back): the game from the seed */
  start(r: RoundStart): void {
    const sorted = [...r.seats].sort((a, b) => a.seat - b.seat);
    this.seats = sorted.map((s) => s.seat);
    this.names = sorted.map((s) => s.name || `Player ${s.seat + 1}`);
    this.you = r.you;
    this.options = readOptions(r.options);
    this.round = 0;
    this.played = 0;
    this.buf = new Map();
    this.leftAt = new Map();
    this.sentFor = -1;
    this.hashes = new Map();
    this.reportedOver = false;
    this.over = false;
    this.end = null;
    this.log.length = 0;
    this.leftNames = [];
    this.waitingHistory = r.rejoined;
    if (this.options.rulesVersion !== RULES_VERSION) {
      this.end = { reason: 'version', rounds: 0, gold: 0, seats: [], text: 'The room was made by another version of the game; reload the page.' };
      return;
    }
    this.game.start(seedOf(r.seed), this.options, this.seats.length);
    this.hashes.set(-1, this.game.hash());
  }

  get waitingForHistory(): boolean {
    return this.waitingHistory;
  }

  /** the seats still to decide the current round (for the status line) */
  undecided(): number[] {
    const got = this.buf.get(this.round);
    return this.seats.filter((s) => this.expected(s, this.round) && !got?.has(s));
  }

  private expected(seat: number, round: number): boolean {
    const l = this.leftAt.get(seat);
    return l === undefined || round < l;
  }

  /** whether the local player may decide now */
  canDecide(): boolean {
    return !this.end && !this.over && !this.waitingHistory && this.sentFor < this.round && this.expected(this.you, this.round)
      && !this.buf.get(this.round)?.has(this.you);
  }

  /** the local player's decision for the current round (from the controls); false if it cannot be sent now */
  decide(d: OnlineDecision): boolean {
    if (!this.canDecide()) return false;
    const r = this.round;
    let hash = 0;
    if (r >= HASH_EVERY && r % HASH_EVERY === 0) hash = this.hashes.get(r - HASH_BACK) ?? 0;
    this.send(packGame(Msg, (m) => {
      const x = m._initDecision();
      x.round = r;
      x.seat = this.you;
      x.kind = KINDS[d.kind] ?? Kind.WAIT;
      x.dir = d.dir;
      x.subdir = d.subdir;
      x.target = d.target;
      x.hash = hash;
    }), 'all');
    this.sentFor = r;
    return true;
  }

  private add(from: number, d: { round: number; seat: number; kind: number; dir: number; subdir: number; target: number }): void {
    const round = d.round >>> 0;
    if (from !== 255 && from !== d.seat) return; // the server stamps the sender: a seat decides for itself
    if (round < this.round || !this.seats.includes(d.seat)) return;
    let m = this.buf.get(round);
    if (!m) this.buf.set(round, m = new Map());
    if (m.has(d.seat)) return;
    m.set(d.seat, { seat: d.seat, kind: KINDS.indexOf(d.kind as Kind), dir: d.dir, subdir: d.subdir, target: d.target });
  }

  private addLeft(seat: number, round: number): void {
    if (this.leftAt.has(seat) || !this.seats.includes(seat)) return;
    this.leftAt.set(seat, round >>> 0);
    const p = this.playerOf(seat);
    if (p >= 0) this.leftNames.push(this.names[p]);
  }

  /** a game message from the room */
  message(from: number, data: Uint8Array): void {
    let m: Msg;
    try {
      m = unpackGame(Msg, data);
    } catch {
      return; // not ours
    }
    try {
      if (m._isDecision) this.add(from, m.decision);
      else if (m._isLeft && from === 255) this.addLeft(m.left.seat, m.left.round);
      else if (m._isHistory && from === 255) {
        const h = m.history;
        for (let i = 0; i < h.decisions.length; i++) this.add(255, h.decisions.get(i));
        for (let i = 0; i < h.lefts.length; i++) this.addLeft(h.lefts.get(i).seat, h.lefts.get(i).round);
        if (h.last) {
          this.waitingHistory = false;
          // what we decided before we went is in the history; the current round we decide again
          const mine = [...this.buf.entries()].filter(([, s]) => s.has(this.you)).map(([r]) => r);
          this.sentFor = Math.max(-1, ...mine);
        }
      } else if (m._isStopped && from === 255) {
        this.end = { reason: 'desync', rounds: m.stopped.round, gold: 0, seats: [], text: `The games went apart in round ${m.stopped.round}.` };
      }
    } catch {
      // a malformed message: ignored
    }
  }

  /** the round ended (RoomFinished) */
  finished(results: Uint8Array, stopped: string): void {
    if (stopped) {
      this.end = { reason: 'stopped', rounds: this.round, gold: 0, seats: [], text: stopped };
      return;
    }
    if (this.end?.reason === 'desync') return;
    try {
      const r = unpackGame(Results, results);
      const reasons: Record<number, EndReason> = {
        [Reason.OVER]: 'over', [Reason.DISAGREED]: 'disagreed', [Reason.DESYNC]: 'desync', [Reason.LEFT]: 'left', [Reason.LIMIT]: 'limit',
      };
      const seats = [];
      for (let i = 0; i < r.seats.length; i++) {
        const s = r.seats.get(i);
        seats.push({ treasures: s.treasures, kills: s.kills, deaths: s.deaths });
      }
      this.end = { reason: reasons[r.reason] ?? 'over', rounds: r.rounds, gold: r.gold, seats, text: '' };
    } catch {
      this.end = { reason: 'over', rounds: this.round, gold: 0, seats: [], text: '' };
    }
  }

  /**
   * Applies every round whose decisions are all here (at most `max`), then decides `none` for a local player who is
   * off the board; returns the rounds applied.
   */
  pump(max = Infinity): number {
    if (this.end?.reason === 'version' || this.waitingHistory) return 0;
    let n = 0;
    while (n < max && !this.over) {
      const r = this.round;
      const got = this.buf.get(r);
      if (this.seats.some((s) => this.expected(s, r) && !got?.has(s))) break;
      const gone = this.seats.filter((s) => this.leftAt.get(s) === r).map(this.playerOf);
      const decisions = got ? [...got.values()] : [];
      const played = this.game.apply(decisions, gone, this.playerOf);
      if (played) this.played++;
      this.buf.delete(r);
      const h = this.game.hash();
      this.hashes.set(r, h);
      this.hashes.delete(r - 64);
      this.log.push({ round: r, hash: h });
      if (this.log.length > 4096) this.log.shift();
      this.round = r + 1;
      n++;
      this.onRound?.(played);
      if (this.game.over()) {
        this.over = true;
        if (!this.reportedOver && !this.end) {
          this.reportedOver = true;
          const st = this.game.stats();
          this.send(packGame(Msg, (m) => {
            const o = m._initOver();
            o.round = r;
            o.gold = st.gold;
            const l = o._initSeats(st.seats.length);
            st.seats.forEach((s, i) => {
              const x = l.get(i);
              x.treasures = s.treasures;
              x.kills = s.kills;
              x.deaths = s.deaths;
            });
          }), 'server');
        }
      }
    }
    // a player off the board (in the revival queue) has nothing to decide
    const p = this.playerOf(this.you);
    if (p >= 0 && !this.game.alive(p) && this.canDecide())
      this.decide({ seat: this.you, kind: K_NONE, dir: 0, subdir: 1, target: 0 });
    return n;
  }
}
