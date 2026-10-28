// Online play's lockstep (src/online.ts Lockstep) with several clients in one process: each client's
// machine (RAM and I/O) is swapped in for its frames; the messages go through a stand-in for
// PinballModule (only the active seat's inputs, five balls each in seat order, the last Input sent
// by the module, the round's inputs replayed to a seat that comes back). Every client must end the
// game with the same RAM, each player having had five balls on their own inputs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tableFile } from '../src/disk.ts';
import { io, m } from '../src/machine.ts';
import { Lockstep } from '../src/online.ts';
import { Msg } from '../src/proto/pinball.ts';
import { unpackGame } from '../../../src/sdk/index.ts';
import { ramHash } from './scenario.ts';

/** the table the original saved in the disk session (test/golden/editor-disk.txt.gz) */
function savedTable(): Uint8Array {
  const lines = gunzipSync(readFileSync(join(import.meta.dirname, 'golden/editor-disk.txt.gz'))).toString('utf8').split('\n');
  const hex = lines.find((l) => l.startsWith('file TABLE_1.PB '))!.split(' ')[2];
  return Uint8Array.from(hex.match(/../g)!.map((h) => parseInt(h, 16)));
}

function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    return s / 2 ** 32;
  };
}

interface Client {
  seat: number;
  ram: Uint8Array;
  state: { btn: [number, number]; pdl: [number, number]; key: number; cycles: number; waits: number; polls: number };
  game: Lockstep;
  inbox: Uint8Array[];
  online: boolean;
  led: number;
}

function swapIn(c: Client): void {
  m.set(c.ram);
  Object.assign(io, { ...c.state, btn: [...c.state.btn], pdl: [...c.state.pdl] });
  io.clicks.length = 0;
  c.game.hook();
}

function swapOut(c: Client): void {
  c.ram.set(m);
  c.state = { btn: [...io.btn], pdl: [...io.pdl], key: io.key, cycles: io.cycles, waits: io.waits, polls: io.polls };
}

/** PinballModule's rules for the round, as a stand-in */
class Module {
  active = 0;
  next = 0;
  balls: number[];
  history: Uint8Array[] = [];
  over = false;
  ends = 0;
  readonly clients: Client[];
  constructor(clients: Client[]) {
    this.clients = clients;
    this.balls = clients.map(() => 5);
  }

  relay(from: Client, data: Uint8Array): void {
    if (this.over || from.seat !== this.active) return;
    const x = unpackGame(Msg, data);
    if (!x._isInput || x.input.fromStep !== this.next) return;
    this.next = x.input.toStep;
    this.history.push(data);
    if (x.input.endOfTurn) {
      this.ends++;
      from.led++;
      this.balls[from.seat]--;
      const n = this.balls.length;
      let to = -1;
      for (let i = 1; i <= n; i++) if (this.balls[(this.active + i) % n] > 0) { to = (this.active + i) % n; break; }
      if (to < 0) this.over = true;
      else this.active = to;
    }
    for (const c of this.clients) if (c.online) c.inbox.push(data);
  }
}

function play(players: number, dropOut?: { seat: number; at: number; back: number }): Client[] {
  const table = tableFile(savedTable());
  assert.ok(table, 'the saved table is one the game loads');
  const clients: Client[] = [];
  let mod: Module;
  for (let seat = 0; seat < players; seat++) {
    const r = rng(seat + 1);
    let held = 0;
    const c: Client = {
      seat,
      ram: new Uint8Array(0x10000),
      state: { btn: [0, 0], pdl: [0, 0], key: 0, cycles: 0, waits: 0, polls: 0 },
      inbox: [],
      online: true,
      led: 0,
      game: new Lockstep(table!, players, seat, (dt) => {
        // this player's flippers: now and then, for a moment
        if (held > 0) held -= dt;
        else if (r() < 0.04) held = 60 + r() * 120;
        const b = held > 0 ? 0x80 : 0;
        io.btn = r() < 0.5 ? [b, 0] : [0, b];
      }, (data) => mod.relay(c, data)),
    };
    clients.push(c);
  }
  mod = new Module(clients);
  for (const c of clients) {
    swapIn(c);
    c.game.restart();
    swapOut(c);
  }
  for (let frame = 0, t = 0; frame < 60_000; frame++, t += 16) {
    if (clients.every((c) => !c.game.running)) break;
    for (const c of clients) {
      if (dropOut && c.seat === dropOut.seat) {
        if (frame === dropOut.at) {
          c.online = false;
          c.inbox = [];
        }
        if (frame === dropOut.back) {
          // back: the program from its start, the round's inputs from the module
          c.online = true;
          swapIn(c);
          c.game.restart();
          swapOut(c);
          c.inbox = [...mod.history];
        }
        if (!c.online) continue;
      }
      for (const d of c.inbox.splice(0)) c.game.message(d);
      swapIn(c);
      c.game.frame(16, t);
      swapOut(c);
    }
  }
  return clients;
}

test('two players: the same game in both, five balls each', () => {
  const cs = play(2);
  for (const c of cs) {
    assert.equal(c.game.error, null);
    assert.ok(c.game.done, `seat ${c.seat}: the game is over`);
    assert.equal(c.led, 5, `seat ${c.seat}: five balls on its own inputs`);
  }
  assert.equal(ramHash(cs[0].ram), ramHash(cs[1].ram), 'the same RAM at the end');
});

test('three players, one drops out and comes back: the same game in all three', () => {
  const cs = play(3, { seat: 1, at: 400, back: 900 });
  for (const c of cs) {
    assert.equal(c.game.error, null);
    assert.ok(c.game.done, `seat ${c.seat}: the game is over`);
    assert.equal(c.led, 5, `seat ${c.seat}: five balls`);
  }
  assert.equal(ramHash(cs[1].ram), ramHash(cs[0].ram));
  assert.equal(ramHash(cs[2].ram), ramHash(cs[0].ram));
});

test('a table file is checked as PinballModule checks it', () => {
  const f = savedTable();
  const t = tableFile(f)!;
  assert.equal(t.length, 4 + (f[2] | (f[3] << 8)), 'the file without the rest of its last sector');
  const bad = (change: (b: Uint8Array) => Uint8Array) => tableFile(change(t.slice()));
  assert.equal(bad((b) => ((b[1] = 0x50), b)), null, 'loads elsewhere');
  assert.equal(bad((b) => b.subarray(0, b.length - 1)), null, 'shorter than its length');
  assert.equal(bad((b) => ((b[b.length - 1] = 0), b)), null, 'no end record');
  assert.equal(bad((b) => ((b[4 + 0x1c] = 200), b)), null, 'more parts than the file has');
  assert.equal(bad((b) => ((b[4 + 0x1d] = 0xff), b)), null, 'a part past the end');
});
