// Ballerburg online: one round of a room is one game, the left castle is seat 0 and the right castle
// seat 1 (protocol/games/ballerburg.capnp). Both clients run the same game from the round's seed; every
// decision of a turn is a Move (moves.ts), sent to everyone and carried out in the server's order. The
// server module lets only the castle on turn move, keeps the moves and gives them to a client that comes
// back (it then replays the round quickly), and ends the round when both games report the same end.
import { packGame, unpackGame, bytes, SERVER_SEAT, type GameContext, type RoundStart } from '../../../src/sdk/index.ts';
import { Msg, Msg_Which, Options, Results, Reason } from './proto/ballerburg.ts';
import { setMoves, TurnEnd, type Move, type MoveContext, type Moves } from './moves.ts';
import { event } from './ballergui.ts';
import { DlgAlert_Query } from './dlgAlert.ts';
import { g, neues, play } from './baller1.ts';
import { kingsForget } from './baller2.ts';
import { gfxReset } from './sdlgfx.ts';
import { scr_update } from './screen.ts';
import { srand } from './random.ts';
import type { BrowserPlatform } from './browser.ts';

export interface RoomRules { maxRounds: number; kingMayCapitulate: boolean; playersMayBuild: boolean; castleLeft: number; castleRight: number }

/** the local settings as the options of a new room */
export function rulesNow(): RoomRules {
  return { maxRounds: g.max_rund, kingMayCapitulate: !!g.au_kap, playersMayBuild: !!g.an_erl, castleLeft: g.bur[0], castleRight: g.bur[1] };
}

export function packRules(r: RoomRules): Uint8Array {
  return packGame(Options, (o) => {
    o.maxRounds = r.maxRounds;
    o.kingMayCapitulate = r.kingMayCapitulate;
    o.playersMayBuild = r.playersMayBuild;
    o.castleLeft = r.castleLeft;
    o.castleRight = r.castleRight;
  });
}

export function readRules(data: Uint8Array): RoomRules {
  const d: RoomRules = { maxRounds: 32767, kingMayCapitulate: true, playersMayBuild: true, castleLeft: 0, castleRight: 0 };
  if (!data.length) return d;
  try {
    const o = unpackGame(Options, data);
    return { maxRounds: o.maxRounds, kingMayCapitulate: o.kingMayCapitulate, playersMayBuild: o.playersMayBuild, castleLeft: o.castleLeft, castleRight: o.castleRight };
  } catch {
    return d;
  }
}

export function encodeMove(m: Move): Uint8Array {
  return packGame(Msg, (x) => {
    switch (m.kind) {
      case 'done': x.done = true; break;
      case 'king': x.king = true; break;
      case 'market': x.market = true; break;
      case 'bricksDone': x.bricksDone = true; break;
      case 'marketButton': x.marketButton = m.button; break;
      case 'brick': {
        const b = x._initBrick();
        b.x = m.x;
        b.y = m.y;
        break;
      }
      case 'cannon': {
        const c = x._initCannon();
        c.index = m.k;
        c.angle = m.w;
        c.powder = m.p;
        c.fire = m.fire;
        break;
      }
    }
  });
}

/** a move from a Msg (null: not a move, or not one the game can have) */
export function decodeMove(x: Msg): Move | null {
  switch (x.which()) {
    case Msg_Which.DONE: return { kind: 'done' };
    case Msg_Which.KING: return { kind: 'king' };
    case Msg_Which.MARKET: return { kind: 'market' };
    case Msg_Which.BRICKS_DONE: return { kind: 'bricksDone' };
    case Msg_Which.MARKET_BUTTON: return { kind: 'marketButton', button: x.marketButton };
    case Msg_Which.BRICK: return { kind: 'brick', x: x.brick.x, y: x.brick.y };
    case Msg_Which.CANNON: {
      const c = x.cannon;
      if (c.index > 9 || c.angle > 180 || c.powder < 5 || c.powder > 20) return null;
      return { kind: 'cannon', k: c.index, w: c.angle, p: c.powder, fire: c.fire };
    }
    default: return null;
  }
}

/**
 * Whether a move fits where the game waits: the move (it is carried out), null (it is dropped), or
 * TurnEnd thrown (a turn-ending move inside the market or while laying bricks: the server ended the turn
 * there, so the game ends it too).
 */
export function takeMove(ctx: MoveContext, m: Move): Move | null {
  if (ctx === 'turn') return m.kind === 'done' || m.kind === 'cannon' || m.kind === 'king' || m.kind === 'market' ? m : null;
  if (m.kind === 'done' || (m.kind === 'cannon' && m.fire)) throw new TurnEnd(m);
  if (ctx === 'market' && m.kind === 'marketButton') return m;
  if (ctx === 'bricks' && (m.kind === 'brick' || m.kind === 'bricksDone')) return m;
  return null;
}

/** the player left the online game (Esc) */
export class LeaveOnline extends Error {}
/** the server sent the round's moves: the game starts again and replays them */
export class Resync extends Error {}
/** the round ended before this client's game did (the other player left) */
export class RoundOver extends Error {
  readonly results: Uint8Array;
  constructor(results: Uint8Array) {
    super('round over');
    this.results = results;
  }
}

interface Queued { seat: number; move: Move; replay: boolean }

export type RoundEnd = { kind: 'over'; results: Uint8Array | null } | { kind: 'left' } | { kind: 'quit' };

/** one round: the moves of both castles, in the server's order */
export class OnlineRound implements Moves {
  private readonly queue: Queued[] = [];
  private arrived: (() => void) | null = null;
  private failed: ((e: Error) => void) | null = null;
  private aborted: Error | null = null;
  private history: Queued[] = [];
  private awaitingHistory = false;
  private results: Uint8Array | null = null;
  private reported = false;
  private readonly ctx: GameContext;
  private readonly round: RoundStart;
  private readonly platform: BrowserPlatform;
  private readonly off: (() => void)[] = [];
  /** shown next to the game: whose turn it is */
  onStatus: ((text: string) => void) | null = null;
  /** how often the round was replayed (after a reconnect) */
  replays = 0;

  constructor(ctx: GameContext, round: RoundStart, platform: BrowserPlatform) {
    this.ctx = ctx;
    this.round = round;
    this.platform = platform;
    this.off.push(ctx.rooms.on('message', (msg) => this.message(msg.from, msg.data)));
    this.off.push(ctx.rooms.on('started', (r) => {
      // back after a dropped connection: the server sends the round's moves (History); until then
      // nothing that arrives counts
      if (r.round === this.round.round && r.rejoined) this.awaitingHistory = true;
    }));
    this.off.push(ctx.rooms.on('finished', (f) => {
      this.results = f.results;
      if (!this.reported) this.abort(new RoundOver(f.results));
      else this.arrived?.();
    }));
    this.off.push(ctx.rooms.on('closed', () => this.abort(new RoundOver(new Uint8Array(0)))));
  }

  close(): void {
    for (const f of this.off.splice(0)) f();
  }

  private message(from: number, data: Uint8Array): void {
    let x: Msg;
    try {
      x = unpackGame(Msg, data);
    } catch {
      return; // not ours: dropped
    }
    if (from === SERVER_SEAT) {
      if (x.which() === Msg_Which.HISTORY) this.historyChunk(x);
      return;
    }
    if ((from !== 0 && from !== 1) || this.awaitingHistory) return;
    const move = decodeMove(x);
    if (!move) return;
    this.queue.push({ seat: from, move, replay: false });
    this.platform.wake();
    this.arrived?.();
  }

  private historyChunk(x: Msg): void {
    const h = x.history;
    if (h.start === 0) this.history = [];
    if (h.start !== this.history.length) return;
    const moves = h.moves, seats = h.seats;
    for (let i = 0; i < moves.length; i++) {
      let move: Move | null = null;
      try {
        move = decodeMove(unpackGame(Msg, bytes(moves.get(i))));
      } catch {
        move = null;
      }
      // a move the game would drop keeps its place: the server counted it
      this.history.push({ seat: seats.get(i), move: move ?? { kind: 'bricksDone' }, replay: true });
    }
    if (this.history.length < h.total) return;
    // everything from the start: the game starts again and replays it (moves after it follow live)
    this.awaitingHistory = false;
    this.queue.length = 0;
    this.queue.push(...this.history);
    this.history = [];
    this.abort(new Resync('replay'));
  }

  private abort(e: Error): void {
    this.aborted = e;
    this.failed?.(e);
    this.platform.interrupt(e);
  }

  // ---------------------------------------------------------------- the game's side (moves.ts)
  remote(n: number): boolean {
    this.status();
    return (this.queue.length > 0 && this.queue[0].replay) || n !== this.round.you;
  }

  async next(ctx: MoveContext): Promise<Move | null> {
    for (;;) {
      while (!this.queue.length) {
        if (await event(1, 1)) return null; // the player's own keys keep working; a move wakes it
      }
      const it = this.queue.shift()!;
      this.platform.fast = this.queue.some((q) => q.replay);
      if (it.seat !== (g.n & 1)) continue; // not the castle on turn
      const m = takeMove(ctx, it.move);
      if (m) return m;
    }
  }

  async commit(m: Move): Promise<void> {
    this.ctx.rooms.send(encodeMove(m), 'all');
    for (;;) {
      while (!this.queue.length) await this.arrival();
      const it = this.queue.shift()!;
      if (it.seat === this.round.you && !it.replay) return; // ours, back in the server's order
    }
  }

  private arrival(): Promise<void> {
    if (this.aborted) return Promise.reject(this.aborted);
    return new Promise((resolve, reject) => {
      this.arrived = () => {
        this.arrived = this.failed = null;
        resolve();
      };
      this.failed = (e) => {
        this.arrived = this.failed = null;
        reject(e);
      };
    });
  }

  gameOver(end: number): void {
    this.reported = true;
    this.ctx.rooms.send(packGame(Msg, (x) => { x.gameOver = end; }), 'server');
  }

  async escape(): Promise<number> {
    if (await DlgAlert_Query('Leave the online game?', 'Yes', 'No')) throw new LeaveOnline('left');
    return 0;
  }

  private lastStatus = '';

  private status(): void {
    const s = this.round.seats;
    const name = (seat: number) => s.find((x) => x.seat === seat)?.name ?? '?';
    const side = this.round.you === 0 ? 'left' : 'right';
    const text = g.end ? 'The game is over' : (g.n & 1) === this.round.you ? `Your turn: you are the ${side} castle` : `${name(g.n & 1)}'s turn: you are the ${side} castle`;
    if (text !== this.lastStatus) this.onStatus?.((this.lastStatus = text));
  }

  // ---------------------------------------------------------------- the round
  /** the game of this round, from its start (again after a Resync): until it ends */
  async play(): Promise<RoundEnd> {
    const rules = readRules(this.round.options);
    const name = (seat: number) => ({ s: (this.round.seats.find((x) => x.seat === seat)?.name ?? `Player ${seat + 1}`).slice(0, 22) });
    for (;;) {
      this.aborted = null;
      this.platform.resume();
      setMoves(this);
      // the round's game: its seed, the room's rules, the seats' names; nothing of an earlier game
      srand(Number(BigInt.asUintN(32, this.round.seed)));
      g.mod = 0;
      g.max_rund = rules.maxRounds;
      g.au_kap = rules.kingMayCapitulate ? 1 : 0;
      g.an_erl = rules.playersMayBuild ? 1 : 0;
      g.bur[0] = rules.castleLeft;
      g.bur[1] = rules.castleRight;
      g.l_nam = name(0);
      g.r_nam = name(1);
      g.bt = 0;
      kingsForget();
      gfxReset();
      this.reported = false;
      this.platform.fast = this.queue.some((q) => q.replay);
      neues();
      scr_update(0, 0, 0, 0);
      try {
        await play();
        this.platform.fast = false;
        this.platform.redraw();
        if (!g.end) return { kind: 'quit' };
        // the game is over (its end screen was clicked away): the round's results, once the server has them
        while (!this.results && !this.aborted) await this.arrival().catch(() => {});
        return { kind: 'over', results: this.results };
      } catch (e) {
        this.platform.fast = false;
        this.platform.redraw();
        if (e instanceof Resync) {
          this.replays++;
          continue;
        }
        if (e instanceof LeaveOnline) return { kind: 'left' };
        if (e instanceof RoundOver) return { kind: 'over', results: e.results };
        throw e;
      } finally {
        setMoves(null);
      }
    }
  }
}

/** a line about a finished round, for the lobby */
export function describeResults(results: Uint8Array | null, round: RoundStart): string {
  if (!results?.length) return 'The round is over.';
  try {
    const r = unpackGame(Results, results);
    const who = round.seats.find((s) => s.seat === r.winner)?.name;
    if (r.reason === Reason.LEFT) return `${who ?? 'The other player'} won: the other player left.`;
    if (r.reason === Reason.TIMEOUT) {
      return who ? `${who} won: the other player did not move for 5 minutes.` : 'The round is over: one game\'s end was not reported in time.';
    }
    if (r.reason === Reason.DISAGREED || !who) return 'The round is over (the two games did not agree).';
    return `${who} won.`;
  } catch {
    return 'The round is over.';
  }
}
