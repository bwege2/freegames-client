// The online 1v1: two clients run the same World from the room's seed, apply the same turn packets in
// the server's order, and exchange state hashes. See protocol/games/0ad.capnp and
// server/.../games/zeroade/ZeroAdeModule.java.
//
// A turn is 0 A.D.'s 200 ms turn. Each client sends its commands for turn `applied + delay` and only
// advances when the server has relayed both seats' packets of the next turn, so neither simulation can
// outrun the other. A command issued while the simulation is at turn t is scheduled for t + delay, and
// the packet for that turn is sent when the simulation leaves t, so it has `delay` turns to arrive.
//
// A reloaded page rejoins its seat (the SDK's room connection does the rejoin); the module answers with
// Sync, the client replays every checked packet from turn 0 on a fresh World, and continues.
import { packGame, unpackGame, SERVER_SEAT, type GameMessage, type RoomState, type Rooms, type RoundStart } from '../../../../src/sdk/index.ts';
import { Msg, Options, Results } from '../proto/0ad.ts';
import type { World } from '../sim/world.ts';
import { applyCommand, readTurn, writeCommand, type PlayerCommand, type TurnCommands } from '../sim/commands.ts';
import { TURN_MS } from '../sim/types.ts';

/** How often a client tells the peer the state hash (turns; 4 s at 0 A.D.'s turn length). */
export const CHECK_EVERY = 20;
/** The server's protocol/0ad.capnp limits: at most this many commands in one turn. */
export const MAX_COMMANDS = 32;

export interface OnlineWorldOptions {
  seed: number;
  civs: [string, string];
  names: [string, string];
  resources: number;
}

export interface OnlineResults {
  winner: number;
  turns: number;
  reason: string;
}

export interface OnlineHooks {
  makeWorld(o: OnlineWorldOptions): World;
  /** a world built by a rejoin replay; the game rebuilds its scene and HUD around it */
  onWorld(world: World): void;
  onResults(r: OnlineResults): void;
  onChat(from: number, text: string): void;
  onStatus(text: string): void;
  /** the room closed under us (server stop, another tab took the seat) */
  onClosed(reason: string): void;
}

interface SyncPacket { seat: number; turn: TurnCommands }

export class OnlineMatch {
  readonly round: RoundStart;
  readonly seat: number;
  /** the player id this client commands: 1 for seat 0, 2 for seat 1 */
  readonly me: number;
  readonly delay: number;
  readonly civs: [string, string];
  world: World;

  private readonly rooms: Rooms;
  private readonly hooks: OnlineHooks;
  private readonly names: [string, string];
  private readonly resources: number;
  /** our commands waiting for their turn */
  private readonly outbox = new Map<number, PlayerCommand[]>();
  /** turns received from the server, by turn: [seat 0, seat 1] */
  private readonly packets = new Map<number, [TurnCommands | null, TurnCommands | null]>();
  /** state hashes we computed after each turn, for the peer's checks (recent turns only) */
  private readonly hashes = new Map<number, number>();
  private readonly peerChecks = new Map<number, number>();
  private applied = 0;
  private sentThrough = -1;
  private accumulator = 0;
  private finished = false;
  private reported = false;
  private desynced = false;
  private syncing: boolean;
  private syncTotal = -1;
  private readonly syncPackets = new Map<number, SyncPacket>();
  private syncAsked = false;
  private readonly offMessage: () => void;
  private readonly offFinished: () => void;
  private readonly offClosed: () => void;

  constructor(rooms: Rooms, round: RoundStart, hooks: OnlineHooks) {
    this.rooms = rooms;
    this.round = round;
    this.hooks = hooks;
    this.seat = round.you === 1 ? 1 : 0;
    this.me = this.seat + 1;
    let o: Options | null = null;
    try { o = round.options.length ? unpackGame(Options, round.options) : null; } catch { o = null; }
    const civs: [string, string] = [o?.civ0 || 'athen', o?.civ1 || 'athen'];
    this.civs = civs;
    const nameOf = (seat: number): string => round.seats.find((s) => s.seat === seat)?.name || `Player ${seat + 1}`;
    this.names = [nameOf(0), nameOf(1)];
    this.resources = Math.max(100, Math.min(50_000, o?.startingResources || 300));
    this.delay = Math.max(1, Math.min(10, o?.commandDelay || 3));
    this.syncing = round.rejoined;
    this.world = hooks.makeWorld({ seed: Number(round.seed), civs, names: this.names, resources: this.resources });
    this.offMessage = rooms.on('message', (m) => this.onMessage(m));
    this.offFinished = rooms.on('finished', (f) => this.onFinished(f.results));
    this.offClosed = rooms.on('closed', (c) => { if (!this.finished) this.hooks.onClosed(c.reason); });
    if (this.syncing) this.askSync();
    else this.sendAhead();
  }

  /** The simulation's turn number (the number of turns applied). */
  get turn(): number { return this.applied; }
  get synced(): boolean { return !this.syncing; }
  get over(): boolean { return this.finished || this.desynced; }
  /** true when our simulation reached its victory condition (the server still decides the round) */
  get ended(): boolean { return this.world.winner !== null; }
  get room(): RoomState | null { return this.rooms.room; }

  /**
   * Queues one command for the local seat, `delay` turns ahead. False when the round is over, the
   * client is still catching up, or the turn already holds the server's maximum number of commands.
   */
  issue(command: PlayerCommand): boolean {
    if (this.finished || this.desynced || this.syncing || this.reported) return false;
    const turn = this.applied + this.delay;
    const list = this.outbox.get(turn) ?? [];
    if (list.length >= MAX_COMMANDS) return false;
    list.push(command);
    this.outbox.set(turn, list);
    return true;
  }

  /** Drives the simulation from the animation loop; `dtMs` is the frame's time. */
  pump(dtMs: number): void {
    if (this.finished || this.desynced) return;
    if (this.syncing) {
      this.askSync();
      return;
    }
    this.accumulator = Math.min(2000, this.accumulator + dtMs);
    let ran = 0;
    while (this.accumulator >= TURN_MS && ran < 5) {
      const pair = this.packets.get(this.applied);
      if (!pair || !pair[0] || !pair[1]) break;
      this.packets.delete(this.applied);
      this.applyTurn(pair[0], pair[1]);
      this.accumulator -= TURN_MS;
      ran++;
    }
    this.sendAhead();
  }

  /** A state hash by turn, for tests and the debug handle. */
  hash(turn = this.applied): number | undefined { return this.hashes.get(turn); }

  dispose(): void {
    this.offMessage();
    this.offFinished();
    this.offClosed();
  }

  // ---------------------------------------------------------------- incoming

  private onMessage(msg: GameMessage): void {
    let m: Msg;
    try { m = unpackGame(Msg, msg.data); } catch { return; } // a peer may send garbage
    if (m._isChat) {
      this.hooks.onChat(msg.from, m.chat);
      return;
    }
    if (m._isCheck) {
      if (msg.from === 0 || msg.from === 1) this.onPeerCheck(msg.from, m.check.turn, m.check.hash);
      return;
    }
    if (msg.from !== SERVER_SEAT) return;
    if (m._isAppliedTurn) {
      const at = m.appliedTurn;
      const turn = at.turn.turn;
      if (at.seat > 1 || turn < this.applied) return;
      const pair = this.packets.get(turn) ?? [null, null];
      if (pair[at.seat]) return;
      pair[at.seat] = readTurn(at.turn);
      this.packets.set(turn, pair);
      if (this.syncing) this.replayIfComplete();
    } else if (m._isSync) {
      this.onSync(m.sync.start, m.sync.total, m.sync.turns.length, (i) => {
        const at = m.sync.turns.get(i);
        return { seat: at.seat, turn: readTurn(at.turn) };
      });
      this.replayIfComplete();
    }
  }

  private onSync(start: number, total: number, count: number, at: (i: number) => SyncPacket): void {
    if (!this.syncing) return;
    this.syncTotal = total;
    for (let i = 0; i < count; i++) {
      const idx = start + i;
      if (idx >= total) break;
      this.syncPackets.set(idx, at(i));
    }
  }

  private onPeerCheck(seat: number, turn: number, hash: number): void {
    if (turn > this.applied) {
      this.peerChecks.set(turn, hash);
      return;
    }
    const mine = this.hashes.get(turn);
    if (mine === undefined) return;
    if (mine !== hash) this.desync(`seat ${seat}'s state at turn ${turn} differs (${hash.toString(16)} vs ${mine.toString(16)})`);
  }

  private onFinished(data: Uint8Array): void {
    if (this.finished) return;
    this.finished = true;
    let results: Results | null = null;
    try { results = data.length ? unpackGame(Results, data) : null; } catch { results = null; }
    this.hooks.onResults({
      winner: results ? results.winner : 255,
      turns: results ? results.turns : this.applied,
      reason: results ? results.reason : '',
    });
  }

  // ---------------------------------------------------------------- the lockstep

  private sendAhead(): void {
    if (this.reported) return;
    while (this.sentThrough < this.applied + this.delay - 1) {
      const turn = ++this.sentThrough;
      const list = this.outbox.get(turn) ?? [];
      this.outbox.delete(turn);
      this.sendTurn(turn, list);
    }
  }

  private sendTurn(turn: number, commands: PlayerCommand[]): void {
    this.rooms.send(packGame(Msg, (m) => {
      const t = m._initTurn();
      t.turn = turn;
      const list = t._initCommands(commands.length);
      for (let i = 0; i < commands.length; i++) writeCommand(commands[i], list.get(i));
    }), 'server');
  }

  private sendCheck(): void {
    const hash = this.hashes.get(this.applied);
    if (hash === undefined) return;
    this.rooms.send(packGame(Msg, (m) => {
      const c = m._initCheck();
      c.turn = this.applied;
      c.hash = hash;
    }), 'others');
  }

  private applyTurn(a: TurnCommands, b: TurnCommands): void {
    for (const [seat, t] of [[0, a], [1, b]] as const) {
      for (const command of t.commands) applyCommand(this.world, seat + 1, command);
    }
    this.world.update();
    this.applied++;
    const hash = this.world.stateHash();
    this.hashes.set(this.applied, hash);
    for (const [turn] of this.hashes) if (turn < this.applied - 240) this.hashes.delete(turn);
    const peer = this.peerChecks.get(this.applied);
    if (peer !== undefined) {
      this.peerChecks.delete(this.applied);
      if (peer !== hash) this.desync(`the peer's state at turn ${this.applied} differs`);
    }
    for (const [turn] of this.peerChecks) if (turn < this.applied - 240) this.peerChecks.delete(turn);
    if (this.applied % CHECK_EVERY === 0) this.sendCheck();
    if (this.world.winner !== null && !this.reported) this.reportEnd();
  }

  private reportEnd(): void {
    this.reported = true;
    // the protocol names the winning seat (0 or 1), not the player id (1 or 2)
    const seat = this.world.winner! - 1;
    this.rooms.send(packGame(Msg, (m) => {
      const g = m._initGameOver();
      g.winner = seat;
      g.turns = this.applied;
    }), 'server');
    this.hooks.onStatus(seat === this.seat
      ? 'Your victory is reported; waiting for the other seat.'
      : 'Your defeat is reported; waiting for the other seat.');
  }

  private desync(detail: string): void {
    if (this.desynced || this.finished) return;
    this.desynced = true;
    console.error(`0 A.D. desync: ${detail}`);
    this.hooks.onStatus('Out of sync with the other seat; the round ends without a winner.');
    this.rooms.send(packGame(Msg, (m) => { m.desync = true; }), 'server');
  }

  private askSync(): void {
    if (this.syncAsked) return;
    this.syncAsked = true;
    this.rooms.send(packGame(Msg, (m) => { m.syncRequest = true; }), 'server');
  }

  // ---------------------------------------------------------------- rejoin

  private replayIfComplete(): void {
    if (!this.syncing || this.syncTotal < 0) return;
    if (this.syncTotal % 2 !== 0) return; // the server keeps pairs: one packet per seat per turn
    if (this.syncPackets.size < this.syncTotal) return;
    // every checked packet of the round, pairs in seat order: rebuild the world and replay them
    const world = this.hooks.makeWorld({ seed: Number(this.round.seed), civs: this.civs, names: this.names, resources: this.resources });
    this.hashes.clear();
    this.peerChecks.clear();
    let applied = 0;
    for (let turn = 0; turn < this.syncTotal / 2; turn++) {
      const a = this.syncPackets.get(turn * 2);
      const b = this.syncPackets.get(turn * 2 + 1);
      if (!a || !b) break; // a gap: wait for the missing chunk
      const seats: [TurnCommands | null, TurnCommands | null] = [null, null];
      seats[a.seat] = a.turn;
      seats[b.seat] = b.turn;
      if (!seats[0] || !seats[1]) break;
      for (const [seat, t] of [[0, seats[0]], [1, seats[1]]] as const) {
        for (const command of t.commands) applyCommand(world, seat + 1, command);
      }
      world.update();
      applied++;
      this.hashes.set(applied, world.stateHash());
    }
    if (applied < this.syncTotal / 2) return; // not all pairs are here yet
    this.syncPackets.clear();
    this.world = world;
    this.applied = applied;
    this.sentThrough = applied - 1;
    this.syncing = false;
    this.accumulator = 0;
    // turns that arrived while replaying are already in the rebuilt world if they are part of the sync
    for (const [turn] of this.packets) if (turn < this.applied) this.packets.delete(turn);
    this.hooks.onWorld(world);
    this.hooks.onStatus(`Caught up: replayed ${applied} turns (${Math.round(applied * TURN_MS / 1000)} s).`);
    this.sendAhead();
  }
}
