// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// Online play without a network: two to four Online clients (src/net.ts) and a stand-in for the server (it orders the
// turns as the room's relay does, and sends Left and History as the server module does). The browsers' games stay
// equal turn by turn, a player who leaves is out from the same turn in every game, a browser that comes back replays
// the match from the history and plays on equal, and a finished match is reported with everyone's points.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packGame, unpackGame, type GameContext, type RoundStart } from '../../../src/sdk/index.ts';
import { Brain } from '../src/ai.ts';
import { Online, packOptions, readOptions, seedOf } from '../src/net.ts';
import { packKeys, unpackKeys } from '../src/match.ts';
import { Msg } from '../src/proto/bomberslop.ts';
import type { Keys } from '../src/sim.ts';
import { loadMaps } from './trace.ts';

const SEED = 0x1234_5678_9abc_def0n;

/** the room's relay and the module, in one: every message to everyone, in one order */
class FakeServer {
  clients: (Online | null)[] = [];
  keys: number[][] = [];
  leftAt: number[] = [];
  queue: { from: number; data: Uint8Array; to: number | 'all' }[] = [];
  overs: { seat: number; data: Uint8Array }[] = [];

  ctx(seat: number): GameContext {
    const rooms = {
      send: (data: Uint8Array, to: 'all' | 'server') => {
        const m = unpackGame(Msg, data);
        if (to === 'server') {
          if (m._isOver) this.overs.push({ seat, data });
          return;
        }
        if (m._isTurn) {
          if (this.leftAt[seat] >= 0) return;
          if (m.turn.turn !== this.keys[seat].length) return;
          this.keys[seat].push(m.turn.keys);
        }
        this.queue.push({ from: seat, data, to: 'all' });
      },
    };
    return { rooms } as unknown as GameContext;
  }

  deliver(): void {
    while (this.queue.length) {
      const q = this.queue.shift()!;
      this.clients.forEach((c, i) => {
        if (c && (q.to === 'all' || q.to === i)) c.message(q.from, q.data);
      });
    }
  }

  left(seat: number): void {
    this.leftAt[seat] = this.keys[seat].length;
    this.clients[seat] = null;
    this.queue.push({ from: 255, to: 'all', data: packGame(Msg, (m) => {
      const l = m._initLeft();
      l.seat = seat;
      l.turn = this.leftAt[seat];
    }) });
  }

  history(to: number): void {
    this.keys.forEach((k, seat) => {
      this.queue.push({ from: 255, to, data: packGame(Msg, (m) => {
        const h = m._initHistory();
        h.seat = seat;
        h.start = 0;
        h._initKeys(k.length).copyBuffer(Uint8Array.from(k));
        h.leftAt = this.leftAt[seat] >= 0 ? this.leftAt[seat] : 0xffffffff;
      }) });
    });
  }
}

function round(n: number, you: number, rejoined = false): RoundStart {
  return {
    room: 1, round: 1, seed: SEED, you, serverTime: 0, rejoined,
    options: packOptions({ pointsToWin: 2, roundTime: 40, randomMapOrder: false, startMap: 2 }),
    seats: Array.from({ length: n }, (_, s) => ({ seat: s, accountId: s + 1, name: `P${s}`, ready: true, connected: true })),
  };
}

/** n clients, each played by a computer brain; returns them and the server */
function setup(n: number) {
  const srv = new FakeServer();
  const maps = loadMaps();
  srv.keys = Array.from({ length: n }, () => []);
  srv.leftAt = Array(n).fill(-1);
  for (let s = 0; s < n; s++) {
    const o = new Online(srv.ctx(s), maps);
    o.start(round(n, s));
    srv.clients.push(o);
  }
  const brains = Array.from({ length: n }, (_, s) => new Brain(s, 99 + s));
  const t0 = performance.now();
  return { srv, maps, brains, t0 };
}

function run(env: ReturnType<typeof setup>, fromTurn: number, toTurn: number): void {
  const { srv, brains, t0 } = env;
  for (let t = fromTurn; t < toTurn; t++) {
    const now = t0 + (t + 1) * 62.5;
    srv.clients.forEach((c, s) => {
      if (!c) return;
      c.tick(now, (): Keys => (c.match ? brains[s].think(c.match.game) : unpackKeys(0)));
    });
    srv.deliver();
  }
}

test('options and keys pack and unpack', () => {
  assert.deepEqual(readOptions(packOptions({ pointsToWin: 3, roundTime: 120, randomMapOrder: true, startMap: 4 })),
    { pointsToWin: 3, roundTime: 120, randomMapOrder: true, startMap: 4 });
  assert.deepEqual(readOptions(new Uint8Array(0)), { pointsToWin: 5, roundTime: 90, randomMapOrder: false, startMap: 0 });
  for (let b = 0; b < 32; b++) assert.equal(packKeys(unpackKeys(b)), b);
  assert.equal(seedOf(SEED), seedOf(SEED));
  assert.notEqual(seedOf(SEED), seedOf(SEED + 1n));
});

test('three browsers play the same match, turn by turn', () => {
  const env = setup(3);
  assert.equal(env.srv.clients[0]!.match!.game.map.current.name, 'Drain', 'the room options: the first map (2: Drain, by name)');
  run(env, 0, 600);
  const [a, b, c] = env.srv.clients as Online[];
  assert.ok(a.turn > 500, `turns played: ${a.turn}`);
  assert.equal(a.turn, b.turn);
  assert.equal(b.turn, c.turn);
  assert.equal(a.match!.hash(), b.match!.hash());
  assert.equal(a.match!.hash(), c.match!.hash());
  assert.deepEqual(a.log, b.log);
  assert.deepEqual(a.log, c.log);
});

test('a player who leaves is out from the same turn in every game', () => {
  const env = setup(3);
  run(env, 0, 200);
  env.srv.left(1);
  env.srv.deliver();
  run(env, 200, 400);
  const [a, , c] = env.srv.clients as Online[];
  assert.ok(a.match!.game.bomber_objects[1].gone && c.match!.game.bomber_objects[1].gone);
  assert.deepEqual(a.leftNames, ['P1']);
  assert.equal(a.match!.hash(), c.match!.hash());
  assert.ok(a.turn > 350);
});

test('a browser that comes back replays the match and plays on, equal', () => {
  const env = setup(2);
  run(env, 0, 300);
  // b reloads: a new client, the round started again for it (rejoined), the history from the server
  const old = env.srv.clients[1]!;
  const b = new Online(env.srv.ctx(1), env.maps);
  b.start(round(2, 1, true));
  env.srv.clients[1] = b;
  assert.equal(b.tick(env.t0 + 301 * 62.5, () => unpackKeys(0)), 0, 'nothing before the history');
  env.srv.history(1);
  env.srv.deliver();
  assert.equal(b.sent, old.sent, 'it sends on from its last turn');
  run(env, 300, 700);
  const a = env.srv.clients[0]!;
  assert.ok(b.turn > 600 && Math.abs(a.turn - b.turn) <= 1, `turns ${a.turn} / ${b.turn}`);
  const common = a.log.filter((e) => b.log.some((x) => x.turn === e.turn));
  assert.ok(common.length > 30);
  for (const e of common) assert.equal(b.log.find((x) => x.turn === e.turn)!.hash, e.hash, `turn ${e.turn}`);
});

test('the end of the match is reported with everyone\'s points', () => {
  const env = setup(2);
  for (let k = 0; k < 400 && env.srv.overs.length < 2; k++) run(env, k * 100, k * 100 + 100);
  assert.equal(env.srv.overs.length, 2, 'both report the end');
  const [o0, o1] = env.srv.overs.map((o) => unpackGame(Msg, o.data).over);
  assert.equal(o0.winner, o1.winner);
  assert.equal(o0.turn, o1.turn);
  const pts = (o: typeof o0) => Array.from({ length: o.points.length }, (_, i) => o.points.get(i));
  assert.deepEqual(pts(o0), pts(o1));
  assert.ok(pts(o0).includes(2), `someone has the two points to win: ${pts(o0)}`);
});
