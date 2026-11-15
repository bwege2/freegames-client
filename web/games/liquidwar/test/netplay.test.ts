// The client's side of the exchange of keys (page/netplay.ts) with a stand-in for the room: what it sends is
// what the module accepts (upto only goes forward, changes inside it and in order, at most 512 a message),
// the keys it applies are the frames', at the exchange they are for, and a lost room is a network error.
import test from 'node:test';
import assert from 'node:assert/strict';
import { packGame, unpackGame, type GameMessage } from '../../../src/sdk/index.ts';
import { Msg, Msg_Which } from '../src/proto/liquidwar.ts';
import { NetPlay, type Clock, type NetRooms } from '../src/page/netplay.ts';
import { G, NB_TEAMS } from '../src/lw/state.ts';

class FakeRooms implements NetRooms {
  sent: Msg[] = [];
  handlers = new Map<string, ((v: never) => void)[]>();
  left = false;
  send(data: Uint8Array): void { this.sent.push(unpackGame(Msg, data)); }
  on(ev: string, fn: (v: never) => void): () => void {
    const l = this.handlers.get(ev) ?? [];
    l.push(fn);
    this.handlers.set(ev, l);
    return () => l.splice(l.indexOf(fn), 1);
  }
  emit(ev: string, v: unknown): void { for (const f of this.handlers.get(ev) ?? []) f(v as never); }
  frame(upto: number, changes: [number, number][]): void {
    const data = packGame(Msg, (m) => {
      const f = m._initFrame();
      f.upto = upto;
      const cs = f._initChanges(changes.length);
      changes.forEach(([step, keys], i) => { cs.get(i).step = step; cs.get(i).keys = keys; });
    });
    this.emit('message', { from: 255, seq: 0, data, serverTime: 0 } satisfies GameMessage);
  }
  leave(): void { this.left = true; }
}

/** a clock whose time only moves when the test says so; timers fire when it passes them */
class FakeClock implements Clock {
  t = 0;
  timers: { at: number; fn: () => void }[] = [];
  now(): number { return this.t; }
  setTimeout(fn: () => void, ms: number): unknown { const x = { at: this.t + ms, fn }; this.timers.push(x); return x; }
  clearTimeout(x: unknown): void { this.timers = this.timers.filter((y) => y !== x); }
  advance(ms: number): void {
    this.t += ms;
    for (const x of this.timers.filter((y) => y.at <= this.t)) { this.clearTimeout(x); x.fn(); }
  }
}

function keysSent(r: FakeRooms): { upto: number; changes: [number, number][] }[] {
  return r.sent.filter((m) => m.which() === Msg_Which.KEYS).map((m) => {
    const k = m.keys;
    const changes: [number, number][] = [];
    for (let i = 0; i < k.changes.length; i++) changes.push([k.changes.get(i).step, k.changes.get(i).keys]);
    return { upto: k.upto, changes };
  });
}

function localCursors(): void {
  for (let i = 0; i < NB_TEAMS; i++) {
    const c = G.CURRENT_CURSOR[i]!;
    c.from_network = i === 0 ? 0 : 1;
    c.key_state = 0;
  }
}

test('keys go out for exchange n + lag, everyone\'s come back from the frames at their exchange', async () => {
  localCursors();
  const r = new FakeRooms(), clock = new FakeClock();
  const np = new NetPlay(r, clock);
  r.frame(20, [[3, 0x21], [10, 0x40]]);
  const applied: number[] = [];
  for (let n = 0; n < 20; n++) {
    G.CURRENT_CURSOR[0]!.key_state = n >= 5 && n < 9 ? 2 : 0;
    assert.equal(await np.keyexch(0), true);
    applied.push(G.CURRENT_CURSOR[0]!.key_state | (G.CURRENT_CURSOR[1]!.key_state << 4) | (G.CURRENT_CURSOR[2]!.key_state << 8));
    clock.advance(3);
  }
  // the frames' keys from their exchange on, the local team's included (keyexch.c recv_keys)
  assert.deepEqual(applied, [0, 0, 0, 0x21, 0x21, 0x21, 0x21, 0x21, 0x21, 0x21, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40]);
  np.flush();
  const sent = keysSent(r);
  const lag = np.lag;
  assert.ok(sent.length >= 2 && sent.length <= 20 / 3 + 2, `coalesced: ${sent.length} messages`);
  let upto = 0;
  const changes: [number, number][] = [];
  for (const k of sent) {
    assert.ok(k.upto >= upto);
    for (const [s] of k.changes) assert.ok(s >= upto && s < k.upto);
    upto = k.upto;
    changes.push(...k.changes);
  }
  assert.equal(upto, 19 + lag + 1);
  assert.deepEqual(changes, [[5 + lag, 2], [9 + lag, 0]]);
  np.close();
  assert.equal(r.sent[r.sent.length - 1]!.which(), Msg_Which.DONE);
  assert.ok(r.left);
});

test('many changes go out in messages of at most 512; a stall raises the lag; a lost room is a network error', async () => {
  localCursors();
  const r = new FakeRooms(), clock = new FakeClock();
  const np = new NetPlay(r, clock);
  r.frame(1200, []);
  for (let n = 0; n < 1200; n++) {
    G.CURRENT_CURSOR[0]!.key_state = n & 1 ? 1 : 4;
    await np.keyexch(0);
  }
  np.flush();
  const sent = keysSent(r);
  assert.ok(sent.every((k) => k.changes.length <= 512));
  // every exchange changes the keys; when the lag goes down (far ahead here) an exchange's keys are not sent,
  // as the original server skips one
  const n = sent.reduce((a, k) => a + k.changes.length, 0);
  assert.ok(n > 1100 && n <= 1200, `${n} changes`);
  assert.ok(np.lag < 8, 'the lag went down with the keys known far ahead');
  const lag = np.lag;
  const waiting = np.keyexch(0);
  assert.equal(np.lag, lag + 1, 'waiting for keys raises the lag');
  r.emit('closed', { id: 1, reason: 'left' });
  assert.equal(await waiting, false);
  assert.match(np.error, /room closed/);
});
