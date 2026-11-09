// Online play without a network (ONLINE.md 3.8): two to four browsers, each a worker thread with its own copy of the
// game (test/online-client.ts runs the port with src/net.ts as the page does), and a stand-in for the server in this
// thread that does what the room's relay and the server module do (HyperrogueModule.java: one decision per seat and
// round, everything to everyone in one order, Left, History, the hash comparison, the end). Each player chooses
// its decisions with the game's controls. Checked: all browsers' games stay identical round by round (the hash of
// every round's state), also when one draws frames between the rounds and one played a single-player game before;
// a player who leaves is out from the same round everywhere; a browser that comes back replays the game from the
// history and plays on equal; a browser whose game is changed is caught by the hashes. The lockstep's own logic
// (Over, `none`, the version check) is checked with a stand-in for the game.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { packGame, unpackGame, type RoundStart } from '../../../src/sdk/index.ts';
import { Msg, Kind, Options } from '../src/proto/hyperrogue.ts';
import { Online, packOptions, readOptions, seedOf, RULES_VERSION, type GameSide } from '../src/net.ts';
import { DEFAULT_OPTIONS, type OnlineOptions } from '../src/online.ts';

const SEED = 0x2f1e_8d3c_7b5a_4b69n;
const CLIENT = new URL('./online-client.ts', import.meta.url);

interface Info { round: number; played: number; log: number[]; hash: number; over: boolean; end: unknown; alive: boolean; waiting: boolean; players: number; turn: number; isolated: boolean }

class Client {
  readonly w: Worker;
  private id = 0;
  private waits = new Map<number, (r: { value: unknown; info: Info }) => void>();
  ready: Promise<void>;
  readonly seat: number;
  constructor(seat: number, srv: FakeServer) {
    this.seat = seat;
    this.w = new Worker(CLIENT, { workerData: { name: `seat${seat}` } });
    this.ready = new Promise((res) => {
      this.w.on('message', (m: { type: string; id: number; value: unknown; info: Info; data: Uint8Array; to: unknown }) => {
        if (m.type === 'ready') res();
        else if (m.type === 'send') srv.receive(this, m.data, m.to);
        else if (m.type === 'reply') { this.waits.get(m.id)!({ value: m.value, info: m.info }); this.waits.delete(m.id); }
      });
    });
    this.w.on('error', (e) => { throw e; });
  }
  call(type: string, data: Record<string, unknown> = {}): Promise<{ value: unknown; info: Info }> {
    const id = ++this.id;
    const p = new Promise<{ value: unknown; info: Info }>((res) => this.waits.set(id, res));
    this.w.postMessage({ type, id, ...data });
    return p;
  }
  async info(): Promise<Info> { return (await this.call('info')).info; }
  stop(): Promise<number> { return this.w.terminate(); }
}

/** the room's relay and the server module in one */
class FakeServer {
  clients: (Client | null)[] = [];
  seats: number[] = [];
  in: boolean[] = [];
  decided: boolean[] = [];
  round = 0;
  log: Uint8Array[] = [];
  lefts: { seat: number; round: number }[] = [];
  hash: number | null = null;
  stopped = -1;
  overs = new Map<number, Uint8Array>();
  pending: Promise<unknown>[] = [];

  broadcast(from: number, data: Uint8Array, only?: number): void {
    this.clients.forEach((c, s) => {
      if (c && (only === undefined || only === s)) this.pending.push(c.call('msg', { from, data }));
    });
  }

  receive(c: Client, data: Uint8Array, to: unknown): void {
    const s = c.seat;
    if (this.clients[s] !== c || !this.in[s]) return;
    const m = unpackGame(Msg, data);
    if (to === 'server') {
      if (m._isOver) this.overs.set(s, data);
      return;
    }
    if (!m._isDecision || to !== 'all') return;
    const d = m.decision;
    if (d.round !== this.round || d.seat !== s || this.decided[s]) return;
    if (this.round >= 8 && this.round % 8 === 0) {
      if (this.hash === null) this.hash = d.hash;
      else if (this.hash !== d.hash && this.stopped < 0) this.stopped = this.round;
    }
    this.decided[s] = true;
    this.log.push(data);
    this.broadcast(s, data);
    this.advance();
  }

  advance(): void {
    if (this.seats.some((s) => this.in[s] && !this.decided[s])) return;
    this.round++;
    this.decided.fill(false);
    this.hash = null;
  }

  left(seat: number): void {
    this.in[seat] = false;
    const at = this.decided[seat] ? this.round + 1 : this.round;
    this.lefts.push({ seat, round: at });
    const old = this.clients[seat];
    this.clients[seat] = null;
    void old?.stop();
    this.broadcast(255, packGame(Msg, (m) => { const l = m._initLeft(); l.seat = seat; l.round = at; }));
    this.advance();
  }

  /** a seat comes back: a new browser, the round started again for it, then everything so far */
  async rejoin(seat: number, n: number): Promise<Client> {
    void this.clients[seat]?.stop();
    const c = new Client(seat, this);
    await c.ready;
    this.clients[seat] = c;
    await c.call('start', { round: roundStart(n, seat, true) });
    const decisions = this.log.map((d) => unpackGame(Msg, d).decision);
    this.broadcast(255, packGame(Msg, (m) => {
      const h = m._initHistory();
      const l = h._initDecisions(decisions.length);
      decisions.forEach((d, i) => {
        const x = l.get(i);
        x.round = d.round; x.seat = d.seat; x.kind = d.kind; x.dir = d.dir; x.subdir = d.subdir; x.target = d.target;
      });
      const ls = h._initLefts(this.lefts.length);
      this.lefts.forEach((x, i) => { ls.get(i).seat = x.seat; ls.get(i).round = x.round; });
      h.last = true;
    }), seat);
    await this.settle();
    return c;
  }

  async settle(): Promise<void> {
    while (this.pending.length) {
      const p = this.pending.splice(0);
      await Promise.all(p);
    }
  }
}

function roundStart(n: number, you: number, rejoined = false, options: OnlineOptions = DEFAULT_OPTIONS): RoundStart & { seed: string } {
  return {
    room: 1, round: 1, seed: SEED.toString() as unknown as bigint & string, you, serverTime: 0, rejoined,
    options: packOptions(options),
    seats: Array.from({ length: n }, (_, s) => ({ seat: s, accountId: s + 1, name: `P${s}`, ready: true, connected: true })),
  } as RoundStart & { seed: string };
}

async function setup(n: number, opts: { local?: number; options?: OnlineOptions } = {}): Promise<FakeServer> {
  const srv = new FakeServer();
  srv.seats = Array.from({ length: n }, (_, s) => s);
  srv.in = Array(n).fill(true);
  srv.decided = Array(n).fill(false);
  srv.clients = srv.seats.map((s) => new Client(s, srv));
  await Promise.all(srv.clients.map((c) => c!.ready));
  // the last browser played a single-player game before it went online
  if (opts.local) await srv.clients[n - 1]!.call('local', { moves: opts.local, seed: 5 });
  await Promise.all(srv.clients.map((c, s) => c!.call('start', { round: roundStart(n, s, false, opts.options) })));
  await srv.settle();
  return srv;
}

/** every browser still in the room plays `rounds` rounds; `draw`: the seat that draws frames between them */
async function play(srv: FakeServer, rounds: number, draw = -1): Promise<void> {
  for (let k = 0; k < rounds && srv.stopped < 0; k++) {
    const r = srv.round;
    for (const c of srv.clients) if (c) srv.pending.push(c.call('play', { seed: r * 7919 + c.seat * 104729 + 1 }));
    await srv.settle();
    if (draw >= 0 && srv.clients[draw] && r % 3 === 0) await srv.clients[draw]!.call('draw');
    const infos = await Promise.all(srv.clients.filter((c) => c).map((c) => c!.info()));
    if (infos.every((i) => i.over)) break;
    assert.ok(srv.round > r || srv.stopped >= 0, `round ${r} completed`);
  }
}

async function infos(srv: FakeServer): Promise<Info[]> {
  return Promise.all(srv.clients.filter((c) => c).map((c) => c!.info()));
}

async function close(srv: FakeServer): Promise<void> {
  await Promise.all(srv.clients.map((c) => c?.stop()));
}

test('options pack and unpack; seeds', () => {
  const o = { land: 6, hardcore: true, orbStrategy: true, turnTimeout: 60 };
  assert.deepEqual(readOptions(packOptions(o)), { ...o, rulesVersion: RULES_VERSION });
  assert.deepEqual(readOptions(new Uint8Array(0)), { ...DEFAULT_OPTIONS, rulesVersion: 0 });
  assert.notEqual(seedOf(SEED), seedOf(SEED + 1n));
  assert.ok(seedOf(SEED) >= 0 && seedOf(SEED) < 2 ** 32);
});

test('three browsers play the same game, round by round, one drawing frames, one after a local game', async () => {
  const srv = await setup(3, { local: 25 });
  try {
    await play(srv, 60, 1);
    const [a, b, c] = await infos(srv);
    assert.equal(srv.stopped, -1, 'the hashes the browsers sent agree');
    assert.ok(a.round >= 40, `rounds: ${a.round}`);
    assert.ok(a.played > 10, `rounds played (not refused): ${a.played}`);
    assert.equal(a.players, 3);
    assert.ok(a.isolated && a.turn > 0);
    assert.deepEqual(b.log, a.log);
    assert.deepEqual(c.log, a.log);
    assert.equal(new Set(a.log).size > 10, true, 'the state changes');
  } finally { await close(srv); }
});

test('a player who leaves is out from the same round in every game', async () => {
  const srv = await setup(3);
  try {
    await play(srv, 12);
    srv.left(1);
    await srv.settle();
    await play(srv, 20);
    const [a, c] = await infos(srv);
    assert.equal(srv.stopped, -1);
    assert.ok(a.round >= 30, `rounds: ${a.round}`);
    assert.deepEqual(c.log, a.log);
  } finally { await close(srv); }
});

test('a browser that comes back replays the game from the history and plays on, equal', async () => {
  const srv = await setup(2);
  try {
    await play(srv, 20);
    const before = (await srv.clients[0]!.info()).log;
    const b = await srv.rejoin(1, 2);
    const back = await b.info();
    assert.equal(back.waiting, false);
    assert.equal(back.round, srv.round, 'caught up with the room');
    assert.deepEqual(back.log, before, 'the replay gives the same game');
    await play(srv, 20);
    const [x, y] = await infos(srv);
    assert.equal(srv.stopped, -1);
    assert.ok(x.round >= 35);
    assert.deepEqual(y.log, x.log);
  } finally { await close(srv); }
});

test('a browser whose game differs is caught by the hashes', async () => {
  const srv = await setup(2, { options: { land: 3, hardcore: false, orbStrategy: false, turnTimeout: 0 } });
  try {
    await play(srv, 5);
    await srv.clients[1]!.call('tamper');
    await play(srv, 20);
    assert.ok(srv.stopped === 8 || srv.stopped === 16, `stopped at round ${srv.stopped}`);
  } finally { await close(srv); }
});

// --- the lockstep's own logic, with a stand-in for the game ---

class FakeGame implements GameSide {
  applied: { decisions: number[]; gone: number[] }[] = [];
  dead = new Set<number>();
  overAfter = Infinity;
  start(): void { this.applied = []; }
  apply(decisions: { seat: number; kind: number }[], gone: number[]): boolean {
    this.applied.push({ decisions: decisions.map((d) => d.seat * 10 + d.kind), gone });
    return true;
  }
  hash(): number { return this.applied.length * 31; }
  over(): boolean { return this.applied.length >= this.overAfter; }
  stats() { return { gold: 7, seats: [{ treasures: 1, kills: 2, deaths: 3 }, { treasures: 4, kills: 5, deaths: 6 }] }; }
  alive(p: number): boolean { return !this.dead.has(p); }
}

function decisionMsg(round: number, seat: number, kind: number, hash = 0): Uint8Array {
  return packGame(Msg, (m) => { const d = m._initDecision(); d.round = round; d.seat = seat; d.kind = kind as Kind; d.hash = hash; });
}

test('lockstep: rounds apply in the server\'s order once every seat decided; hashes; none; Over once', () => {
  const sent: { m: Msg; to: unknown }[] = [];
  const g = new FakeGame();
  const o = new Online((data, to) => sent.push({ m: unpackGame(Msg, data), to }), g);
  o.start({ ...roundStart(2, 0), seed: SEED });
  assert.ok(o.decide({ seat: 0, kind: 1, dir: 0, subdir: 1, target: 0 }));
  assert.ok(!o.decide({ seat: 0, kind: 1, dir: 0, subdir: 1, target: 0 }), 'one decision a round');
  o.message(1, decisionMsg(0, 1, 0));
  o.message(0, decisionMsg(0, 0, 1));
  o.message(0, decisionMsg(0, 1, 2)); // seat 0 cannot decide for seat 1
  assert.equal(o.pump(), 1);
  assert.deepEqual(g.applied[0].decisions, [10, 1], 'in arrival order');
  for (let r = 1; r < 8; r++) {
    o.decide({ seat: 0, kind: 1, dir: 0, subdir: 1, target: 0 });
    o.message(0, decisionMsg(r, 0, 1));
    o.message(1, decisionMsg(r, 1, 1));
    o.pump();
  }
  o.decide({ seat: 0, kind: 1, dir: 0, subdir: 1, target: 0 });
  const h8 = sent.at(-1)!.m.decision;
  assert.equal(h8.round, 8);
  assert.equal(h8.hash, 5 * 31, 'round 8 carries the hash after round 4');
  assert.equal(sent[1].m.decision.hash, 0);
  // seat 0's player is off the board: it decides `none` by itself
  g.dead.add(0);
  o.message(0, decisionMsg(8, 0, 1));
  // the server decided "wait" for seat 1 (timeout)
  o.message(255, decisionMsg(8, 1, 1));
  o.pump();
  assert.equal(sent.at(-1)!.m.decision.kind, Kind.NONE);
  assert.equal(sent.at(-1)!.m.decision.round, 9);
  // a seat leaves; the game ends after round 10: Over to the server, once
  o.message(255, packGame(Msg, (m) => { const l = m._initLeft(); l.seat = 1; l.round = 10; }));
  o.message(0, decisionMsg(9, 0, 5));
  o.message(1, decisionMsg(9, 1, 1));
  g.overAfter = 11;
  o.pump();
  o.message(0, decisionMsg(10, 0, 5));
  assert.equal(o.pump(), 1, 'round 10 needs only seat 0');
  assert.deepEqual(g.applied[10].gone, [1]);
  assert.ok(o.over);
  const overs = sent.filter((s) => s.m._isOver);
  assert.equal(overs.length, 1);
  assert.equal(overs[0].to, 'server');
  assert.equal(overs[0].m.over.round, 10);
  assert.equal(overs[0].m.over.gold, 7);
  assert.equal(overs[0].m.over.seats.get(1).kills, 5);
  assert.equal(o.pump(), 0);
});

test('lockstep: a room of another version is not played', () => {
  const g = new FakeGame();
  let started = false;
  g.start = () => { started = true; };
  const o = new Online(() => { }, g);
  const r = roundStart(2, 0);
  o.start({ ...r, seed: SEED, options: packGame(Options, (x) => { x.rulesVersion = RULES_VERSION + 1; }) });
  assert.equal(o.end?.reason, 'version');
  assert.equal(started, false);
});
