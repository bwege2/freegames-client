// Netrek in the browser: the original client COW 3.3.3 (translated, cow/) on the X server emulation
// (xlib/), connected to the room's server (the original server's Java port in the game server) through
// ctx.rooms: the TCP stream in pieces (protocol/games/netrek.capnp Msg.tcp, Msg.bye), the UDP socket's
// datagrams as unreliable messages (Msg.udp). COW's command line
// is the client oracle's, but for the server's name; its rc file (.netrekrc) is the player's file in
// ctx.storage. A rejoined seat is a new connection on the server: COW starts again from the beginning.
import type { GameContext, GameInstance } from '../../../src/sdk/index.ts';
import { SERVER_SEAT, packGame, unpackGame, playerName } from '../../../src/sdk/index.ts';
import * as P from './proto/netrek.ts';
import { XServer } from './xlib/xlib.ts';
import { Screen } from './screen.ts';
import { runCow } from './process.ts';
import { G } from './cow/globals.ts';
import { setImageDecoder } from './rt/imlib.ts';
import type { Conn, Datagrams, Platform } from './rt/platform.ts';

/** COW's default pixmap directory (x11sprite.c GetPixmapDir) */
const PIXMAP_DIR = 'usr/share/pixmaps/netrek-client-cow';
const HOME = '/home/netrek';
const RC = '.netrekrc';

const pixmapUrls = import.meta.glob('../assets/pixmaps/**/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

class Stopped extends Error {}

/** what COW knows (for the end-to-end test, games/netrek/e2e.mjs): its own slot and the players it sees */
export interface Snapshot {
  me: number;
  /** pieces of the server's stream received (the server sends one per frame it has something to say) */
  received: number;
  /** UDP datagrams received from the server, sent to it */
  datagramsIn: number;
  datagramsOut: number;
  /** COW's connection is in UDP mode (commMode COMM_UDP) */
  udp: boolean;
  players: { no: number; status: number; team: number; name: string; x: number; y: number }[];
}
let received = 0, datagramsIn = 0, datagramsOut = 0;
/** a run of COW is on (G is its globals) */
let live: object | null = null;

function snapshot(): Snapshot | null {
  if (!live) return null;
  const ps = G.universe?.players as { p_no: number; p_status: number; p_team: number; p_name: number[]; p_x: number; p_y: number }[] | undefined;
  if (!ps) return null;
  const name = (a: number[]) => {
    let t = '';
    for (const c of a) {
      if (!c) break;
      t += String.fromCharCode(c & 255);
    }
    return t;
  };
  return {
    me: G.me && typeof G.me.p_no === 'number' ? G.me.p_no : -1,
    received,
    datagramsIn,
    datagramsOut,
    udp: G.commMode === 1,
    players: ps.filter((p) => p.p_status !== 0).map((p) => ({ no: p.p_no, status: p.p_status, team: p.p_team, name: name(p.p_name), x: p.p_x, y: p.p_y })),
  };
}

/** the stream of one connection: what the server sent and COW has not read, its end */
class Stream implements Conn {
  private chunks: Uint8Array[] = [];
  closed = false;
  out: Uint8Array[] = [];
  private send: (b: Uint8Array) => void;
  private wake: () => void;
  constructor(send: (b: Uint8Array) => void, wake: () => void) {
    this.send = send;
    this.wake = wake;
  }
  push(b: Uint8Array): void {
    if (b.length) this.chunks.push(b.slice());
    this.wake();
  }
  read(max: number): Uint8Array | null {
    if (!this.chunks.length) return this.closed ? null : new Uint8Array(0);
    const c = this.chunks[0];
    if (c.length <= max) {
      this.chunks.shift();
      return c;
    }
    this.chunks[0] = c.subarray(max);
    return c.subarray(0, max);
  }
  readable(): boolean {
    return this.chunks.length > 0 || this.closed;
  }
  write(b: Uint8Array): void {
    this.out.push(b.slice());
  }
  /** what COW wrote goes to the server, in one message */
  flush(): void {
    if (!this.out.length || this.closed) return;
    let n = 0;
    for (const b of this.out) n += b.length;
    const all = new Uint8Array(n);
    n = 0;
    for (const b of this.out) { all.set(b, n); n += b.length; }
    this.out = [];
    this.send(all);
  }
  close(): void {
    this.flush();
    this.closed = true;
  }
}

/** COW's UDP socket on the room: datagrams to the server go unreliably; the server's are kept while it is open */
class Dgrams implements Datagrams {
  private queue: Uint8Array[] = [];
  private isOpen = false;
  private sendFn: (d: Uint8Array) => void;
  private wake: () => void;
  constructor(send: (d: Uint8Array) => void, wake: () => void) {
    this.sendFn = send;
    this.wake = wake;
  }
  open(): void {
    this.isOpen = true;
    this.queue = [];
  }
  close(): void {
    this.isOpen = false;
    this.queue = [];
  }
  send(d: Uint8Array): void {
    this.sendFn(d);
  }
  recv(): Uint8Array | null {
    return this.queue.shift() ?? null;
  }
  readable(): boolean {
    return this.queue.length > 0;
  }
  /** a datagram from the server: lost if COW has no UDP socket, or too many are waiting (a full socket buffer) */
  arrive(d: Uint8Array): void {
    if (!this.isOpen || this.queue.length >= 256) return;
    this.queue.push(d.slice());
    this.wake();
  }
}

/** the rc file a player starts with: COW's defaults (so UDP, tryUdp on) and the site's name */
function defaultRc(): Uint8Array {
  const name = playerName().replace(/[^\x20-\x7e]/g, '').slice(0, 15);
  const text = `# Netrek (COW 3.3.3) options, read when the client starts. See the client's documentation.\n${name ? `name: ${name}\n` : ''}`;
  return Uint8Array.from(text, (c) => c.charCodeAt(0));
}

class NetrekGame implements GameInstance {
  private ctx: GameContext;
  private host: HTMLElement;
  private stream: Stream | null = null;
  private dgrams: Dgrams | null = null;
  private waiter: (() => void) | null = null;
  private waitTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;
  private run: Promise<void> | null = null;
  /** ends what a run of COW started (its screen's listeners and frame loop) */
  private runAbort: AbortController | null = null;
  private files = new Map<string, Uint8Array>();
  private images = new Map<string, { w: number; h: number; rgba: Uint8ClampedArray }>();

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    ctx.signal.addEventListener('abort', () => this.stop());
  }

  async begin(): Promise<void> {
    const ctx = this.ctx;
    const loading = document.createElement('div');
    loading.textContent = 'Loading Netrek…';
    loading.style.cssText = 'color:#ccc;font:16px system-ui,sans-serif;margin:2rem;text-align:center';
    this.host.replaceChildren(loading);
    await this.loadPixmaps();
    let rc: Uint8Array | null = null;
    try {
      rc = await ctx.storage.get(RC);
    } catch {
      rc = null;
    }
    this.files.set(`${HOME}/${RC}`, rc ?? defaultRc());
    if (this.stopped) return;
    const round = await ctx.lobby(this.host, {
      title: 'Netrek',
      dropIn: true,
      seats: { min: 1, max: 16, default: 16 },
      options: () => packGame(P.Options, (o) => { o._initSysdef(0); }),
    });
    if (this.stopped) return;
    this.newStream();
    ctx.rooms.on('message', (m) => {
      if (m.from !== SERVER_SEAT) return;
      let msg: P.Msg;
      try {
        msg = unpackGame(P.Msg, m.data);
      } catch {
        return;
      }
      if (!this.stream) return;
      if (msg._isTcp) {
        received++;
        this.stream.push(msg.tcp.toUint8Array());
      } else if (msg._isUdp) {
        datagramsIn++;
        this.dgrams?.arrive(msg.udp.toUint8Array());
      }
      else if (msg._isBye) {
        this.stream.closed = true;
        this.wake();
      }
    });
    ctx.rooms.on('finished', () => {
      if (this.stream) this.stream.closed = true;
      this.wake();
    });
    ctx.rooms.on('started', (r) => {
      // the seat came back: the server has a new connection for it, COW starts anew
      if (r.rejoined) void this.restart();
    });
    void round;
    this.start();
  }

  private async loadPixmaps(): Promise<void> {
    const entries = Object.entries(pixmapUrls);
    await Promise.all(entries.map(async ([path, url]) => {
      const rel = path.replace(/^\.\.\/assets\/pixmaps\//, '');
      const bytes = new Uint8Array(await (await fetch(url, { signal: this.ctx.signal })).arrayBuffer());
      this.files.set(`/${PIXMAP_DIR}/${rel}`, bytes);
      try {
        const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const g = c.getContext('2d')!;
        g.drawImage(bmp, 0, 0);
        this.images.set(`${PIXMAP_DIR}/${rel}`, { w: bmp.width, h: bmp.height, rgba: g.getImageData(0, 0, bmp.width, bmp.height).data });
        bmp.close();
      } catch {
        // an image the browser cannot decode is drawn blank
      }
    }));
  }

  private newStream(): void {
    const rooms = this.ctx.rooms;
    this.stream = new Stream((b) => {
      if (rooms.round) rooms.send(packGame(P.Msg, (m) => { m._initTcp(b.length).copyBuffer(b); }), 'server', true);
    }, () => this.wake());
    this.dgrams = new Dgrams((d) => {
      datagramsOut++;
      if (rooms.round) rooms.send(packGame(P.Msg, (m) => { m._initUdp(d.length).copyBuffer(d); }), 'server', false);
    }, () => this.wake());
  }

  private wake(): void {
    const w = this.waiter;
    this.waiter = null;
    if (this.waitTimer !== null) clearTimeout(this.waitTimer);
    this.waitTimer = null;
    w?.();
  }

  private platform(x: XServer, stream: Stream): Platform {
    const ctx = this.ctx;
    const decoder = new TextDecoder('latin1');
    return {
      nowUs: () => Math.round((performance.timeOrigin + performance.now()) * 1000),
      idle: (_fds, deadline) => {
        stream.flush();
        if (this.stopped) return Promise.reject(new Stopped());
        return new Promise<void>((resolve, reject) => {
          this.waiter = () => (this.stopped ? reject(new Stopped()) : resolve());
          if (deadline >= 0) {
            const ms = Math.max(0, (deadline - Math.round((performance.timeOrigin + performance.now()) * 1000)) / 1000);
            this.waitTimer = setTimeout(() => this.wake(), ms);
          }
        });
      },
      x,
      connect: () => stream,
      datagrams: () => this.dgrams!,
      pid: 1000 + (Math.random() * 30000 | 0),
      login: (playerName().replace(/[^A-Za-z0-9_.-]/g, '') || 'netrek').slice(0, 15),
      home: HOME,
      fileChanged: (path, data) => {
        if (data && (path.endsWith('/.netrekrc') || path.endsWith('/.xtrekrc'))) {
          this.files.set('/' + path, data);
          void ctx.storage.put(path.endsWith('/.xtrekrc') ? '.xtrekrc' : RC, data).catch(() => {});
        }
      },
      stdout: (b) => console.debug('[netrek]', decoder.decode(b)),
      stderr: (b) => console.debug('[netrek]', decoder.decode(b)),
    };
  }

  private start(): void {
    const x = new XServer({ clock: () => Math.round((performance.timeOrigin + performance.now()) * 1000), render: true, fd: 3 });
    setImageDecoder((path) => this.images.get(path) ?? null);
    const ac = new AbortController();
    this.runAbort = ac;
    this.ctx.signal.addEventListener('abort', () => ac.abort(), { signal: ac.signal });
    const screen = new Screen(this.host, x, (line) => {
      x.input(line);
      this.wake();
    }, ac.signal);
    this.ctx.frame(() => screen.paint(), ac.signal);
    const stream = this.stream!;
    const argv = ['netrek-client-cow', '-h', location.hostname || 'netrek'];
    const run = {};
    this.run = runCow(this.platform(x, stream), argv, this.files).then((status) => {
      if (live === run) live = null;
      stream.close();
      if (!this.stopped && status === 0) this.ctx.exit();
    }, (e) => {
      if (live === run) live = null;
      if (!(e instanceof Stopped) && !this.stopped) {
        console.error('netrek:', e);
        this.ctx.exit();
      }
    });
    live = run;
  }

  private async restart(): Promise<void> {
    const old = this.run;
    this.stopped = true;
    this.wake();
    await old;
    this.runAbort?.abort();
    if (this.ctx.signal.aborted) return;
    this.stopped = false;
    this.newStream();
    this.start();
  }

  stop(): void {
    live = null;
    this.stopped = true;
    this.wake();
    setImageDecoder(null);
    this.runAbort?.abort();
    if (this.ctx.rooms.room) this.ctx.rooms.leave();
  }
}

export async function startNetrek(host: HTMLElement, ctx: GameContext): Promise<GameInstance> {
  const game = new NetrekGame(host, ctx);
  const w = globalThis as unknown as { __netrek?: { snapshot: typeof snapshot } };
  received = datagramsIn = datagramsOut = 0;
  w.__netrek = { snapshot };
  ctx.signal.addEventListener('abort', () => { delete w.__netrek; });
  void game.begin().catch((e) => {
    if (!ctx.signal.aborted) {
      console.error('netrek:', e);
      ctx.exit();
    }
  });
  return game;
}
