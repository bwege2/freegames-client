// Online play (not in the original, which played up to four players at one Apple): the disk menu's
// PLAY GAME on one table for two to four players, each at their own computer.
//
// Every client runs the same program (shell.ts ONLINE: the machine as after the boot, the room's
// table loaded as LOAD loads it, RUN2.S's game for the room's players) from the same RAM. The program
// runs in steps, the stretches between two of its waits (src/machine.ts: a WAIT, a turn of a polling
// loop); they are the same in every client. The player whose ball it is (RUN2.S MAIN4: PLAYER) runs
// the program on their own buttons and paddles and sends, every 50 ms, how many steps they ran and
// at which input reads (io.polls) the inputs changed: an input tape. Everybody else runs the program
// only as far as the tape goes, giving it the same values at the same reads, so all of them see the
// same game a moment later. When MAIN4 gives the next ball to another player, the tape goes on from
// that player's computer. PinballModule (server) passes only the inputs of the seat whose turn it is,
// five balls each in seat order, and replays the round's tape to a seat that comes back.
import { packGame, setData, unpackGame, bytes, type GameContext, type RoundStart } from '../../../src/sdk/index.ts';
import { tableFile } from './disk.ts';
import { io, m, type Wait } from './machine.ts';
import { Msg, Options } from './proto/pinball.ts';
import { ONLINE } from './shell.ts';
import type { Pinball, Runner } from './index.ts';

/** 6502 cycles per millisecond */
const CLOCK = 1023;
/** how often the player whose turn it is sends the tape */
const SEND_MS = 50;
/** a watcher this many steps behind the tape catches up as fast as it can (a seat coming back) */
const FAST = 3000;

interface State {
  buttons: number;
  p0: number;
  p1: number;
}
interface Event extends State {
  poll: number;
}

const NONE: State = { buttons: 0, p0: 0, p1: 0 };

/** "Play online": a saved table for a new room, the lobby, then the game */
export async function startOnline(app: Pinball, host: HTMLElement, ctx: GameContext): Promise<void> {
  if (app.online || host.querySelector('.pb-lobby')) return;
  const layer = Object.assign(document.createElement('div'), { className: 'pb-lobby' });
  host.append(layer);
  const box = Object.assign(document.createElement('div'), { className: 'pb-choose' });
  layer.append(box);
  const close = () => layer.remove();
  box.textContent = 'Looking for your tables…';
  let tables: string[] = [];
  try {
    tables = (await ctx.storage.list('')).map((f) => f.name).filter((n) => n.endsWith('.PB')).sort();
  } catch (e) {
    box.textContent = `No connection to the server: ${e instanceof Error ? e.message : String(e)}`;
    box.append(button('Close', close));
    return;
  }
  const h = document.createElement('h2');
  h.textContent = 'Pinball online';
  const p = document.createElement('p');
  p.textContent = 'Two to four players, each at their own computer, play one table as PLAY GAME in the disk menu does: five balls each, in turn.';
  const pick = document.createElement('select');
  for (const t of tables) pick.append(Object.assign(document.createElement('option'), { value: t, textContent: shown(t) }));
  const note = document.createElement('p');
  note.textContent = tables.length
    ? 'A room you open plays this table:'
    : 'To open a room, save a table first (the disk at the bottom of the tools, then SAVE). You can join a room now.';
  const err = Object.assign(document.createElement('p'), { className: 'pb-err' });
  const go = button('Go to the lobby', async () => {
    let table: Uint8Array | null = null;
    let name = '';
    if (tables.length) {
      name = pick.value;
      const f = await ctx.storage.get(name).catch(() => null);
      table = f && tableFile(f);
      if (!table) {
        err.textContent = `${shown(name)} is not a table the game can load.`;
        return;
      }
    }
    await lobby(app, host, ctx, layer, table, shown(name));
  });
  box.replaceChildren(h, p, note, ...(tables.length ? [pick] : []), go, button('Cancel', close), err);
}

/** a file's name as the disk menu shows it */
function shown(file: string): string {
  return file.replace(/_/g, ' ').replace(/\.PB$/, '');
}

function button(text: string, onclick: () => void): HTMLButtonElement {
  return Object.assign(document.createElement('button'), { textContent: text, onclick });
}

async function lobby(app: Pinball, host: HTMLElement, ctx: GameContext, layer: HTMLElement, table: Uint8Array | null, name: string): Promise<void> {
  let round: RoundStart;
  try {
    round = await ctx.lobby(layer, {
      title: 'Pinball online',
      seats: { min: 2, max: 4, default: 2 },
      options: () => packGame(Options, (o) => {
        if (table) setData((n) => o._initTable(n), table);
        o.name = name.slice(0, 30);
      }),
    });
  } catch {
    layer.remove();
    return;
  }
  layer.remove();
  let file: Uint8Array | null = null;
  try {
    file = tableFile(bytes(unpackGame(Options, round.options).table));
  } catch {
    file = null;
  }
  if (!file) {
    ctx.rooms.leave();
    app.status.textContent = 'The room\'s table cannot be loaded.';
    return;
  }
  new OnlineGame(app, host, ctx, round, file).begin();
}

/**
 * The program and its input tape, for one client (no page: the tests run several in one process).
 * `local` sets the buttons and paddles from this computer's controls; `send` hands a packed Msg to
 * everybody (Target.all).
 */
export class Lockstep {
  private readonly file: Uint8Array;
  private readonly players: number;
  /** my player number */
  readonly me: number;
  private readonly local: (dt: number) => void;
  private readonly sendAll: (data: Uint8Array) => void;
  private gen: Wait | null = null;
  step = 0;
  done = false;
  error: unknown = null;
  /** the player whose inputs the program reads (RUN2.S MAIN4) */
  current = 0;
  /** this step runs on my inputs */
  private leading = false;
  private tape: Event[] = [];
  private next = 0;
  /** the steps whose inputs are known */
  known = 0;
  /** the inputs as the tape has them now */
  private last: State = NONE;
  private pending: Event[] = [];
  private sentAt = -Infinity;
  private target = 0;
  /** the round is over on the server (a player left, or the last ball) */
  finished = false;
  turn: { seat: number; balls: number } | null = null;
  /** the clock jumped (a restart, catching up): no sound for it */
  quiet = false;

  constructor(file: Uint8Array, players: number, me: number, local: (dt: number) => void, send: (data: Uint8Array) => void) {
    this.file = file;
    this.players = players;
    this.me = me;
    this.local = local;
    this.sendAll = send;
  }

  /** the program from its start, the tape empty */
  restart(): void {
    io.key = 0;
    io.btn = [0, 0];
    io.pdl = [0, 0];
    io.cycles = 0;
    this.hook();
    this.gen = ONLINE(this.file, this.players);
    this.step = 0;
    this.done = false;
    this.error = null;
    this.current = 0;
    this.tape = [];
    this.next = 0;
    this.known = 0;
    this.last = NONE;
    this.pending = [];
    this.target = 0;
    this.quiet = true;
  }

  /** the machine's input reads and MAIN4 to this client */
  hook(): void {
    io.onPoll = () => this.poll();
    io.onBall = (p) => {
      this.current = p < this.players ? p : 0;
    };
  }

  /** an input read: mine to the tape, or the tape's to the program */
  private poll(): void {
    if (this.leading) {
      const s: State = {
        buttons: (io.btn[0] & 0x80 ? 1 : 0) | (io.btn[1] & 0x80 ? 2 : 0),
        p0: Math.round(io.pdl[0]) & 0xff,
        p1: Math.round(io.pdl[1]) & 0xff,
      };
      if (s.buttons !== this.last.buttons || s.p0 !== this.last.p0 || s.p1 !== this.last.p1) {
        this.pending.push({ poll: io.polls, ...s });
        this.last = s;
      }
      // the program reads what the tape says
      this.set(s);
      return;
    }
    while (this.next < this.tape.length && this.tape[this.next].poll <= io.polls) this.set(this.tape[this.next++]);
  }

  private set(s: State): void {
    io.btn = [s.buttons & 1 ? 0x80 : 0, s.buttons & 2 ? 0x80 : 0];
    io.pdl = [s.p0, s.p1];
    this.last = { buttons: s.buttons, p0: s.p0, p1: s.p1 };
  }

  private run1(): void {
    this.leading = this.current === this.me && this.step >= this.known;
    let r: IteratorResult<unknown, void>;
    try {
      r = this.gen!.next();
    } catch (e) {
      this.error = e;
      return;
    }
    this.step++;
    if (r.value instanceof Promise) this.error = new Error('the game waited for a file');
    if (r.done) this.done = true;
  }

  get running(): boolean {
    return !this.done && this.error === null;
  }

  /** waiting for the tape of the player whose turn it is */
  get waiting(): boolean {
    return (this.current !== this.me || this.finished) && this.step >= this.known;
  }

  /** a frame of `dt` ms: my ball on my inputs, anybody else's as far as the tape goes */
  frame(dt: number, now = performance.now()): void {
    if (!this.running) return;
    if (this.current === this.me && this.step >= this.known && !this.finished) this.lead(dt, now);
    else this.follow(dt);
  }

  private lead(dt: number, now: number): void {
    this.local(dt);
    this.target += dt * CLOCK;
    let guard = 0;
    while (this.running && this.current === this.me && io.cycles < this.target && ++guard < 400_000) this.run1();
    if (this.target - io.cycles > 200 * CLOCK) this.target = io.cycles + 200 * CLOCK;
    if (io.cycles > this.target + 200 * CLOCK) this.target = io.cycles;
    const over = this.done || this.current !== this.me;
    if (over || this.pending.length >= 200 || this.step - this.known >= 50_000 || (now - this.sentAt >= SEND_MS && this.step > this.known)) {
      this.send(over);
      this.sentAt = now;
    }
    // the next player's inputs go on from where mine end on the tape (not from my keys of this frame)
    if (over) this.set(this.last);
  }

  private send(end: boolean): void {
    const ev = this.pending;
    const from = this.known;
    const to = this.step;
    this.sendAll(packGame(Msg, (x) => {
      const i = x._initInput();
      i.fromStep = from;
      i.toStep = to;
      i.endOfTurn = end;
      const l = i._initEvents(ev.length);
      ev.forEach((e, k) => {
        const v = l.get(k);
        v.poll = e.poll;
        v.buttons = e.buttons;
        v.paddle0 = e.p0;
        v.paddle1 = e.p1;
      });
    }));
    this.known = to;
    this.pending = [];
  }

  private follow(dt: number): void {
    const behind = this.known - this.step;
    if (behind > FAST) {
      // catching up (a seat coming back): as fast as the page allows, without sound
      const until = performance.now() + 25;
      while (this.running && this.step < this.known && performance.now() < until) {
        for (let k = 0; k < 2000 && this.running && this.step < this.known; k++) this.run1();
      }
      this.target = io.cycles;
      this.quiet = true;
      return;
    }
    // a little faster than the original while behind, so the delay does not grow
    this.target += dt * CLOCK * (behind > 300 ? 1.5 : 1);
    let guard = 0;
    while (this.running && this.step < this.known && io.cycles < this.target && ++guard < 400_000) this.run1();
    if (this.target - io.cycles > 100 * CLOCK) this.target = io.cycles + 100 * CLOCK;
  }

  /** a game message (from a seat, or from the module) */
  message(data: Uint8Array): void {
    try {
      const x = unpackGame(Msg, data);
      if (x._isTurn) {
        this.turn = { seat: x.turn.seat, balls: x.turn.balls };
        return;
      }
      if (!x._isInput) return;
      const i = x.input;
      // what continues the tape (my own sends come back too, and are older); PinballModule passes
      // only the inputs of the seat whose turn it is, or sends them itself
      if (i.fromStep !== this.known || i.toStep < i.fromStep) return;
      const l = i.events;
      let last = this.tape.length ? this.tape[this.tape.length - 1].poll : -1;
      const add: Event[] = [];
      for (let k = 0; k < l.length; k++) {
        const e = l.get(k);
        if (e.poll <= last) return;
        last = e.poll;
        add.push({ poll: e.poll, buttons: e.buttons & 3, p0: e.paddle0, p1: e.paddle1 });
      }
      this.tape.push(...add);
      this.known = i.toStep;
    } catch {
      // a peer may send garbage
    }
  }
}

/** one online game on the page: the Lockstep, the room, the line above the screen, the way back */
export class OnlineGame {
  private readonly app: Pinball;
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly names: string[];
  private readonly game: Lockstep;
  private closed = false;
  private saved: { ram: Uint8Array; btn: [number, number]; pdl: [number, number]; key: number; cycles: number; waits: number; polls: number; runner: Runner } | null = null;
  private readonly off: (() => void)[] = [];
  private panel: HTMLElement | null = null;

  constructor(app: Pinball, host: HTMLElement, ctx: GameContext, round: RoundStart, file: Uint8Array) {
    this.app = app;
    this.host = host;
    this.ctx = ctx;
    const seats = [...round.seats].sort((a, b) => a.seat - b.seat);
    this.names = seats.map((s) => s.name || `Player ${s.seat + 1}`);
    const me = seats.findIndex((s) => s.seat === round.you);
    this.game = new Lockstep(file, seats.length, me, (dt) => app.inputs(dt), (data) => ctx.rooms.send(data, 'all'));
  }

  begin(): void {
    // the construction set as it was, to go back to
    this.saved = { ram: m.slice(), btn: [...io.btn], pdl: [...io.pdl], key: io.key, cycles: io.cycles, waits: io.waits, polls: io.polls, runner: this.app.swapRunner(null) };
    this.game.restart();
    const r = this.ctx.rooms;
    this.off.push(
      r.on('message', (g) => this.game.message(g.data)),
      r.on('started', (s) => {
        // back after a dropped connection: the module sends the round's tape again
        if (s.rejoined) this.game.restart();
      }),
      r.on('finished', () => {
        this.game.finished = true;
      }),
      r.on('closed', () => {
        this.closed = true;
        this.game.finished = true;
      }),
    );
    this.app.online = this;
    debug().online = this.game;
  }

  frame(dt: number): void {
    this.game.frame(dt);
    if (this.game.quiet) {
      this.game.quiet = false;
      io.clicks.length = 0;
      this.app.resetSound();
    }
    this.show();
  }

  /** the line above the screen; the end */
  private show(): void {
    const g = this.game;
    if (g.error !== null) {
      this.end(`The game stopped: ${g.error instanceof Error ? g.error.message : String(g.error)}`);
      return;
    }
    if (g.done) {
      this.end('Game over.');
      return;
    }
    if (g.finished && (g.waiting || g.current === g.me)) {
      this.end('The game ended: a player left.');
      return;
    }
    const t = g.turn;
    const ball = t ? `, ${t.balls === 1 ? 'last ball' : `${t.balls} balls left`}` : '';
    this.app.status.textContent = g.current === g.me
      ? `Online: your turn${ball}`
      : `Online: ${this.names[g.current] ?? '?'}'s turn${ball}${g.waiting && g.step > 0 ? ' (waiting)' : ''}`;
  }

  private end(text: string): void {
    if (this.panel) return;
    this.app.status.textContent = `Online: ${text}`;
    const panel = Object.assign(document.createElement('div'), { className: 'pb-end' });
    const p = document.createElement('p');
    p.textContent = text;
    panel.append(p, button('Back to the construction set', () => this.stop()));
    this.host.append(panel);
    this.panel = panel;
  }

  /** out of the room, the construction set back as it was */
  stop(): void {
    for (const f of this.off.splice(0)) f();
    io.onPoll = null;
    io.onBall = null;
    this.panel?.remove();
    this.panel = null;
    const s = this.saved;
    if (s) {
      m.set(s.ram);
      io.btn = s.btn;
      io.pdl = s.pdl;
      io.key = s.key;
      io.cycles = s.cycles;
      io.waits = s.waits;
      io.polls = s.polls;
      io.clicks.length = 0;
      this.app.swapRunner(s.runner);
      this.saved = null;
    }
    this.app.online = null;
    debug().online = null;
    this.app.status.textContent = '';
    this.app.resetSound();
    if (!this.closed) this.ctx.rooms.leave();
  }
}

/** window.__pinball (index.ts): the online game's state, for the browser tests */
function debug(): { online?: Lockstep | null } {
  const w = window as unknown as { __pinball?: { online?: Lockstep | null } };
  return w.__pinball ?? {};
}
