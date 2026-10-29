// The client worker's side of the pipes to the server worker (protocol.ts): sockets, requests to the
// server worker (calls), and taking in what arrived, for the scheduler's poll.
import { net, Pipe } from '../../jre/net.ts';
import { IOException } from '../../jre/index.ts';
import { Ring, json } from '../ring.ts';
import { S_DATA, S_CLOSE, S_REPLY, P_INPUT, P_REPLY, C_DATA, C_CLOSE, C_CALL, idOf, withId, u32 } from '../protocol.ts';
import { pumpReceivers } from '../receiving.ts';
import type { Scheduler } from './sched.ts';

export type ClientChannels = {
  /** Wakes the server worker when it is idle. */
  server: { postMessage: (m: any) => void };
  toServer: SharedArrayBuffer;
  serverBell: SharedArrayBuffer;
  fromServer: SharedArrayBuffer;
  fromPage: SharedArrayBuffer;
  bell: SharedArrayBuffer;
};

export class ClientNet {
  server: { postMessage: (m: any) => void };
  toServer: Ring;
  fromServer: Ring;
  fromPage: Ring;
  bell: Int32Array;
  pipes = new Map<number, Pipe>();
  nextPipe = 1;
  nextCall = 1;
  replies = new Map<number, any>();
  pageReplies = new Map<number, any>();
  onInput: (e: any) => void = () => {};
  sched: Scheduler;

  constructor(ch: ClientChannels, sched: Scheduler) {
    this.server = ch.server;
    this.toServer = new Ring(ch.toServer, ch.serverBell);
    this.fromServer = new Ring(ch.fromServer, ch.bell);
    this.fromPage = new Ring(ch.fromPage, ch.bell);
    this.bell = new Int32Array(ch.bell);
    this.sched = sched;
    net.connect = (host: string, port: number) => this.connect(host, port);
    net.waitInput = (p: Pipe) => sched.waitUntil(() => p.chunks.length > 0 || p.closed);
    sched.poll = () => this.poll();
    sched.idle = (ms: number) => {
      const v = Ring.bellValue(this.bell);
      if (this.pending()) return;
      Ring.waitBell(this.bell, v, ms);
    };
  }

  /** Writes to the server worker (waiting while its ring is full) and wakes it. */
  out(type: number, body: Uint8Array) {
    while (!this.toServer.write(type, body)) this.sched.waitUntil(() => false, 5);
    this.server.postMessage({ t: 'ping' });
  }

  pending(): boolean {
    return this.fromServer.used() > 0 || this.fromPage.used() > 0;
  }

  connect(host: string, port: number): Pipe | null {
    const id = this.nextPipe++;
    const ok = this.call('connect', { pipe: id, host, port });
    if (!ok) return null;
    const pipe = new Pipe(id, (bytes) => this.out(C_DATA, withId(id, bytes)));
    pipe.onClose = () => {
      this.out(C_CLOSE, u32(id));
      this.pipes.delete(id);
    };
    this.pipes.set(id, pipe);
    return pipe;
  }

  /** A request to the server worker, waiting for its answer (other threads run meanwhile). */
  call(op: string, args: any): any {
    const id = this.nextCall++;
    this.out(C_CALL, json.encode({ id, op, args }));
    this.sched.waitUntil(() => this.replies.has(id));
    const r = this.replies.get(id);
    this.replies.delete(id);
    if (!r.ok) throw new IOException(r.error);
    return r.value;
  }

  /** Takes in everything that arrived; true if anything did. */
  poll(): boolean {
    let any = false;
    for (let m = this.fromServer.read(); m; m = this.fromServer.read()) {
      any = true;
      if (m.type === S_DATA) {
        const p = this.pipes.get(idOf(m.body));
        if (p) p.receive(m.body.slice(4));
      } else if (m.type === S_CLOSE) {
        const p = this.pipes.get(idOf(m.body));
        if (p) {
          p.closed = true;
          this.pipes.delete(p.id);
        }
      } else if (m.type === S_REPLY) {
        const r = json.decode(m.body);
        this.replies.set(r.id, r);
      }
    }
    for (let m = this.fromPage.read(); m; m = this.fromPage.read()) {
      any = true;
      const r = json.decode(m.body);
      if (m.type === P_INPUT) this.onInput(r);
      else if (m.type === P_REPLY) this.pageReplies.set(r.id, r);
    }
    if (pumpReceivers(true)) any = true;
    return any;
  }
}
