// One online round of Worms? (protocol/games/worms.capnp), without the DOM: the messages, and the
// round's decisions in the server's order. Every client plays the same game (worms.ts) from the round's
// seed; when a person's worm meets a new situation the game asks `decider` here: the worm's owner
// chooses at the keyboard and sends the move to everyone, the others wait for it, and everyone takes it
// from what the server relayed, in the order of the decision's step. A player who left has the computer
// choose for their worm from the step the server named (takeover). The server module plays the same game
// and lets only the decision the game waits for through.

import { packGame, unpackGame, bytes, setData } from '../../../src/sdk/index.ts';
import { Msg, Msg_Which, Options, Results, type Start, type Worm } from './proto/worms.ts';
import type { Decider, Seats } from './worms.ts';
import { seed32 } from './raster.ts';

export const COMPUTER = 255;

/** the kinds a room may give the worms without a player */
export const OTHERS = [{ kind: 2, label: 'the computer (AUTO)' }, { kind: 3, label: 'WILD' }, { kind: 0, label: 'none' }] as const;

export interface WormSetup {
  kind: number;
  name: Uint8Array;
  moves: Uint8Array;
}

export interface RoundSetup {
  worms: WormSetup[];
  owners: number[];
}

export interface DecisionMsg {
  step: number;
  worm: number;
  situation: number;
  move: number;
}

export function packOptions(others: number): Uint8Array {
  return packGame(Options, (o) => { o.others = others; });
}

export function readOptions(data: Uint8Array): number {
  if (!data.length) return 2;
  try {
    const k = unpackGame(Options, data).others;
    return k === 0 || k === 3 ? k : 2;
  } catch {
    return 2;
  }
}

function writeWorm(w: Worm, s: WormSetup): void {
  w.kind = s.kind;
  setData((n) => w._initName(n), s.name);
  setData((n) => w._initMoves(n), s.moves);
}

function readWorm(w: Worm): WormSetup {
  return { kind: w.kind, name: bytes(w.name).slice(0, 4), moves: bytes(w.moves).slice(0, 64) };
}

function readStart(s: Start): RoundSetup | null {
  if (s.worms.length !== 4 || s.owners.length !== 4) return null;
  const worms: WormSetup[] = [];
  for (let i = 0; i < 4; i++) {
    const w = readWorm(s.worms.get(i));
    if (w.name.length !== 4 || w.moves.length !== 64) return null;
    worms.push(w);
  }
  return { worms, owners: [0, 1, 2, 3].map((i) => s.owners.get(i)) };
}

export function encodeWorm(s: WormSetup): Uint8Array {
  return packGame(Msg, (m) => writeWorm(m._initWorm(), s));
}

export function encodeDecision(d: DecisionMsg): Uint8Array {
  return packGame(Msg, (m) => {
    const x = m._initDecision();
    x.step = d.step;
    x.worm = d.worm;
    x.situation = d.situation;
    x.move = d.move;
  });
}

export function encodeStart(r: RoundSetup): Uint8Array {
  return packGame(Msg, (m) => {
    const s = m._initStart();
    const l = s._initWorms(4);
    r.worms.forEach((w, i) => writeWorm(l.get(i), w));
    const o = s._initOwners(4);
    r.owners.forEach((v, i) => o.set(i, v));
  });
}

export function readResults(data: Uint8Array): { scores: number[]; owners: number[] } | null {
  try {
    const r = unpackGame(Results, data);
    const scores: number[] = [];
    for (let i = 0; i < r.scores.length; i++) scores.push(r.scores.get(i));
    const owners: number[] = [];
    for (let i = 0; i < r.owners.length; i++) owners.push(r.owners.get(i));
    return { scores, owners };
  } catch {
    return null;
  }
}

/** the server sent the round again (this client came back): the game starts over and replays it */
export class Resync extends Error {
  constructor() {
    super('resync');
  }
}

export type Send = (data: Uint8Array, to: 'all' | 'server') => void;

/** what the program needs of a round */
export interface RoundRunner {
  setup: RoundSetup;
  seed: number;
  seats: Seats;
  /** the program finished the round's game */
  done(): void;
}

export class OnlineRound {
  readonly you: number;
  readonly seed: number;
  setup: RoundSetup | null = null;
  private decisions = new Map<number, DecisionMsg>();
  private takeovers = new Map<number, number>();
  /** decisions the program has asked for so far */
  step = 0;
  /** no server any more: this keyboard decides for its worm, the computer for the others' */
  offline = false;
  /** our decisions the server has not relayed yet (sent again when we come back on a new connection) */
  private unconfirmed = new Map<number, Uint8Array>();
  /** the decision the game waits for (for the page's status and the tests) */
  waiting: { worm: number; step: number; local: boolean } | null = null;
  private resync = false;
  private readonly send: Send;
  onStart: ((r: RoundSetup) => void) | null = null;

  constructor(you: number, seed: bigint, send: Send) {
    this.you = you;
    this.seed = seed32(seed);
    this.send = send;
  }

  /** a game message from the server (or a seat, relayed) */
  receive(from: number, data: Uint8Array): void {
    let m: Msg;
    try {
      m = unpackGame(Msg, data);
    } catch {
      return; // garbage
    }
    switch (m.which()) {
      case Msg_Which.START: {
        if (from !== 255) return;
        const s = readStart(m.start);
        if (s && !this.setup) {
          this.setup = s;
          this.onStart?.(s);
        }
        break;
      }
      case Msg_Which.DECISION: {
        const d = m.decision;
        if (d.move > 5 || d.worm > 3) return;
        if (!this.decisions.has(d.step)) this.decisions.set(d.step, { step: d.step, worm: d.worm, situation: d.situation, move: d.move });
        this.unconfirmed.delete(d.step);
        break;
      }
      case Msg_Which.TAKEOVER: {
        if (from !== 255) return;
        const t = m.takeover;
        if (t.worm < 4 && !this.takeovers.has(t.worm)) this.takeovers.set(t.worm, t.step);
        break;
      }
      case Msg_Which.HISTORY: {
        if (from !== 255) return;
        const h = m.history;
        const s = readStart(h.start);
        if (!s) return;
        // back after a dropped connection: what was relayed meanwhile is in the history. Only if it
        // contradicts what the game already used (it cannot, unless this is another round's) does
        // the game start over and replay it.
        const fresh = !this.setup;
        let conflict = false;
        const decisions = new Map<number, DecisionMsg>();
        for (let i = 0; i < h.decisions.length; i++) {
          const d = h.decisions.get(i);
          decisions.set(d.step, { step: d.step, worm: d.worm, situation: d.situation, move: d.move });
        }
        for (const [step, d] of this.decisions) {
          const n = decisions.get(step);
          if (step < this.step && (!n || n.move !== d.move || n.worm !== d.worm)) conflict = true;
        }
        this.setup = s;
        this.decisions = decisions;
        for (let i = 0; i < h.takeovers.length; i++) this.takeovers.set(h.takeovers.get(i).worm, h.takeovers.get(i).step);
        if (fresh) this.onStart?.(s);
        else if (conflict) this.resync = true;
        // a decision of ours that was lost with the connection goes again
        for (const [step, data] of this.unconfirmed) {
          if (this.decisions.has(step)) this.unconfirmed.delete(step);
          else if (!this.offline) this.send(data, 'all');
        }
        break;
      }
      default:
        break;
    }
  }

  /** the program starts the round's game (again): it counts decisions from 0 */
  begin(): void {
    this.step = 0;
    this.resync = false;
  }

  /** the decisions the server has relayed that the program has not reached yet */
  get ahead(): number {
    let n = 0;
    for (const s of this.decisions.keys()) if (s >= this.step) n++;
    return n;
  }

  private computerChooses(worm: number, step: number): boolean {
    const t = this.takeovers.get(worm);
    return (t !== undefined && t <= step) || (this.offline && this.setup!.owners[worm] !== this.you);
  }

  readonly seats: Seats = {
    decider: (worm: number, situation: number): Decider | 'ai' => {
      if (this.resync) throw new Resync();
      const owner = this.setup!.owners[worm];
      if (owner === COMPUTER) return 'ai';
      const step = this.step++;
      if (this.computerChooses(worm, step)) return 'ai';
      let sent: number | null = null;
      this.waiting = { worm, step, local: owner === this.you };
      return {
        local: owner === this.you,
        send: (move: number) => {
          sent = move;
          const data = encodeDecision({ step, worm, situation, move });
          this.unconfirmed.set(step, data);
          if (!this.offline) this.send(data, 'all');
        },
        poll: () => {
          if (this.resync) throw new Resync();
          const d = this.decisions.get(step);
          let v: number | null = null;
          if (d && d.worm === worm) v = d.move;
          else if (this.computerChooses(worm, step)) v = -1;
          else if (this.offline && sent !== null) v = sent;
          if (v !== null) this.waiting = null;
          return v;
        },
      };
    },
  };
}

/** the four worms a seat's client brings: kind NEW or SAME, name, table */
export function wormOf(kind: number, name: ArrayLike<number>, moves: ArrayLike<number>): WormSetup {
  return {
    kind: kind === 4 ? 4 : 1,
    name: Uint8Array.from({ length: 4 }, (_, i) => name[i] ?? 0x20),
    moves: Uint8Array.from({ length: 64 }, (_, i) => moves[i] ?? 0xf1),
  };
}
