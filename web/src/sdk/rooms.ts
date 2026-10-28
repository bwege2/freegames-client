// Online rooms of one game: list, create, join, ready, start, relay, finish (protocol/freegames.capnp
// "rooms", docs/SERVER.md "Message flow of a round"). Reconnects transparently: after a dropped
// connection the room is joined again and the seat comes back (RoomStarted is delivered again).
import type * as $ from 'capnp-es';
import { bytes, setData, Which, type P } from './net/codec.ts';
import { Target } from './proto/freegames.ts';
import type { GameClient } from './net/client.ts';

export interface SeatInfo {
  seat: number;
  accountId: number;
  name: string;
  ready: boolean;
  /** false: dropped out of the running round and may come back */
  connected: boolean;
}

export interface RoomState {
  id: number;
  name: string;
  /** the host's seat */
  host: number;
  maxSeats: number;
  locked: boolean;
  started: boolean;
  round: number;
  seats: SeatInfo[];
  /** the game's room options (its own schema) */
  options: Uint8Array;
  /** this client's seat (-1 in a room list) */
  you: number;
}

export interface RoundStart {
  room: number;
  round: number;
  /** the same for every client of the round: seed the game's RNG with it */
  seed: bigint;
  seats: SeatInfo[];
  options: Uint8Array;
  you: number;
  serverTime: number;
  /** true when this is the seat coming back after a dropped connection */
  rejoined: boolean;
}

export interface GameMessage {
  /** the sender's seat; SERVER_SEAT = the game's server module */
  from: number;
  /** the server's order of everything relayed in the room */
  seq: number;
  data: Uint8Array;
  serverTime: number;
}

export const SERVER_SEAT = 255;

/** Where a game message goes: everyone else, everyone (sender included), one seat, or the server module. */
export type SendTo = 'others' | 'all' | 'server' | { seat: number };

export interface RoomEvents {
  /** the room changed (seats, ready flags, host, options, started) */
  update: RoomState;
  started: RoundStart;
  message: GameMessage;
  /** `stopped`: empty when the game ended the round; else why the server stopped it (too slow) */
  finished: { round: number; results: Uint8Array; stopped: string };
  /** a player took a seat in the running drop-in round */
  joined: SeatInfo;
  /** a player left the running drop-in round (or dropped out for good) */
  left: SeatInfo;
  /** we are out of the room (left, or removed) */
  closed: { id: number; reason: string };
}

type Handler<K extends keyof RoomEvents> = (v: RoomEvents[K]) => void;

function readSeats(l: $.List<P.Seat>): SeatInfo[] {
  const out: SeatInfo[] = [];
  for (let i = 0; i < l.length; i++) {
    const s = l.get(i);
    out.push({ seat: s.seat, accountId: s.accountId, name: s.name, ready: s.ready, connected: s.connected });
  }
  return out;
}

function readRoom(r: P.RoomInfo, you: number): RoomState {
  return {
    id: r.id, name: r.name, host: r.host, maxSeats: r.maxSeats, locked: r.locked, started: r.started,
    round: r.round, seats: readSeats(r.seats), options: bytes(r.options), you,
  };
}

export class Rooms {
  /** the room we are in, or null */
  room: RoomState | null = null;
  /** the running round, or null */
  round: RoundStart | null = null;
  private handlers = new Map<keyof RoomEvents, Set<(v: unknown) => void>>();
  private rejoin = false;
  /** the last room list, by id */
  private listed = new Map<number, RoomState>();
  /**
   * The running round's messages that came while no `message` handler listened: a game that awaits
   * something after `started` (assets, a worker) would lose the module's catch-up sent with RoomStarted.
   * The first handler gets them, in order.
   */
  private early: GameMessage[] = [];
  static readonly EARLY_MAX = 10000;
  readonly net: GameClient;

  constructor(net: GameClient) {
    this.net = net;
    net.on('message', (e) => this.handle(e));
    net.on('status', (s) => {
      if (s === 'replaced' && this.room) {
        // the seat went to this account's other tab
        const id = this.room.id;
        this.room = null;
        this.round = null;
        this.rejoin = false;
        this.early = [];
        this.emit('closed', { id, reason: 'opened in another tab' });
        return;
      }
      if (s === 'connecting' && this.room) this.rejoin = true;
      if (s === 'online' && this.rejoin && this.room) {
        const id = this.room.id;
        this.net.send((e) => { e._initJoinRoom().id = id; });
      }
    });
  }

  on<K extends keyof RoomEvents>(k: K, h: Handler<K>): () => void {
    let s = this.handlers.get(k);
    if (!s) this.handlers.set(k, (s = new Set()));
    s.add(h as (v: unknown) => void);
    if (k === 'message' && this.early.length) {
      // after on() returns, before any later message (those come in later tasks)
      const pending = this.early;
      this.early = [];
      queueMicrotask(() => {
        for (const m of pending) {
          try { (h as Handler<'message'>)(m); } catch (e) { console.error('rooms handler message', e); }
        }
      });
    }
    return () => s!.delete(h as (v: unknown) => void);
  }

  private emit<K extends keyof RoomEvents>(k: K, v: RoomEvents[K]): void {
    for (const h of [...(this.handlers.get(k) ?? [])]) {
      try { h(v); } catch (e) { console.error(`rooms handler ${k}`, e); }
    }
  }

  /** The game's rooms (open ones, and running ones with their seats). */
  async list(): Promise<RoomState[]> {
    await this.net.connect();
    const a = await this.net.request((e, req) => { e._initListRooms().req = req; });
    const l = a.roomList.rooms;
    const out: RoomState[] = [];
    for (let i = 0; i < l.length; i++) out.push(readRoom(l.get(i), -1));
    this.listed = new Map(out.map((r) => [r.id, r]));
    return out;
  }

  /**
   * A running room where this account holds a seat: it kept the seat after a page reload or a lost
   * connection, and joining it gets the round back (RoundStart.rejoined).
   */
  isMine(r: RoomState): boolean {
    return r.started && this.net.accountId > 0 && r.seats.some((s) => s.accountId === this.net.accountId);
  }

  /** Creates a room and sits in seat 0 as its host. `maxSeats` 0 = the game's maximum. */
  async create(o: { name: string; maxSeats?: number; password?: string; options?: Uint8Array }): Promise<RoomState> {
    await this.net.connect();
    await this.net.request((e, req) => {
      const c = e._initCreateRoom();
      c.req = req;
      c.name = o.name;
      c.maxSeats = o.maxSeats ?? 0;
      c.password = o.password ?? '';
      if (o.options) setData((n) => c._initOptions(n), o.options);
    }, (e) => e.which() === Which.ROOM_UPDATE);
    return this.room!;
  }

  /** Joins a room (a free seat, or `seat`). */
  async join(id: number, password = '', seat = -1): Promise<RoomState> {
    await this.net.connect();
    // back into a round this account is still seated in (a reloaded page): the game catches up
    const known = this.listed.get(id);
    this.rejoin = !!known && this.isMine(known);
    await this.net.request((e, req) => {
      const j = e._initJoinRoom();
      j.req = req;
      j.id = id;
      j.password = password;
      j.seat = seat;
    }, (e) => e.which() === Which.ROOM_UPDATE && e.roomUpdate.room.id === id);
    return this.room!;
  }

  leave(): void {
    if (!this.room) return;
    this.net.send((e) => { e._initLeaveRoom(); });
    this.room = null;
    this.round = null;
    this.rejoin = false;
    this.early = [];
  }

  ready(ready: boolean): void {
    this.net.send((e) => { e._initSetReady().ready = ready; });
  }

  /** Host: new room options (everyone has to be ready again). */
  setOptions(options: Uint8Array): void {
    this.net.send((e) => setData((n) => e._initSetRoomOptions()._initOptions(n), options));
  }

  /** Host: starts the round once everybody else is ready; resolves with the round. */
  async start(): Promise<RoundStart> {
    await this.net.request((e, req) => { e._initStartRoom().req = req; }, (e) => e.which() === Which.ROOM_STARTED);
    return this.round!;
  }

  /** Host: ends the round with the game's results (a module may refuse, or end rounds itself). */
  finish(results: Uint8Array = new Uint8Array(0)): void {
    this.net.send((e) => setData((n) => e._initFinishRoom()._initResults(n), results));
  }

  /** Sends a game message to the room (only while a round runs). */
  send(data: Uint8Array, to: SendTo = 'others', reliable = true): void {
    const fill = (e: P.Envelope) => {
      const r = e._initRelay();
      if (to === 'others') r.to = Target.OTHERS;
      else if (to === 'all') r.to = Target.ALL;
      else if (to === 'server') r.to = Target.SERVER;
      else {
        r.to = Target.SEAT;
        r.seat = to.seat;
      }
      r.reliable = reliable;
      setData((n) => r._initData(n), data);
    };
    if (reliable) this.net.send(fill);
    else this.net.sendUnreliable(fill);
  }

  private handle(e: P.Envelope): void {
    switch (e.which()) {
      case Which.ROOM_UPDATE: {
        const before = this.room;
        this.room = readRoom(e.roomUpdate.room, e.roomUpdate.you);
        if (this.round && before && before.id === this.room.id && this.round.room === this.room.id) {
          const now = new Map(this.room.seats.map((s) => [s.seat, s]));
          for (const s of this.room.seats) if (!before.seats.some((p) => p.seat === s.seat)) this.emit('joined', s);
          for (const s of before.seats) if (!now.has(s.seat)) this.emit('left', s);
        }
        this.emit('update', this.room);
        break;
      }
      case Which.ROOM_STARTED: {
        const s = e.roomStarted;
        this.round = {
          room: s.id, round: s.round, seed: s.seed, seats: readSeats(s.seats), options: bytes(s.options), you: s.you,
          serverTime: s.serverTime, rejoined: this.rejoin,
        };
        this.rejoin = false;
        this.early = [];
        this.emit('started', this.round);
        break;
      }
      case Which.RELAYED: {
        const r = e.relayed;
        const m = { from: r.from, seq: r.seq, data: bytes(r.data), serverTime: r.serverTime };
        if (this.round && !this.handlers.get('message')?.size) {
          if (this.early.length < Rooms.EARLY_MAX) this.early.push(m);
          break;
        }
        this.emit('message', m);
        break;
      }
      case Which.ROOM_FINISHED: {
        this.round = null;
        this.early = [];
        this.emit('finished', { round: e.roomFinished.round, results: bytes(e.roomFinished.results), stopped: e.roomFinished.stopped });
        break;
      }
      case Which.ROOM_CLOSED: {
        const c = e.roomClosed;
        if (this.room && this.room.id === c.id) {
          this.room = null;
          this.round = null;
          this.rejoin = false;
          this.early = [];
        }
        this.emit('closed', { id: c.id, reason: c.reason });
        break;
      }
      default:
    }
  }
}
