// Replays a client-oracle golden (re/netrek/golden/<scenario>/, re/netrek/oracle/coord/coord.c) on the
// translated COW: the coordinator's lockstep, with COW the only process that runs. Per frame (20 ms of
// the virtual clock from 2010-01-01 UTC): the scenario's input events of the frame go into the X
// connection; then the two settles of the coordinator (phase 1 before the server's frame, 2 after it),
// whose relayed pieces the golden lists in order ("rl": <phase>[+]<c|s|u|v><bytes>: c, s the TCP
// stream's bytes from COW and from the server, u, v a UDP datagram; "+" a client piece relayed with the
// one before). In a settle, COW runs whenever it is ready (X input written into its connection, server
// bytes in its socket, a datagram in its UDP socket, or its select()/sleep() deadline passed: the
// coordinator wakes the lowest process id first, and COW's is the lowest); what it wrote, on the stream
// and as datagrams, are the next pieces and must be the recorded c2s bytes and u2s datagrams; when it is
// not ready, the next server piece of the phase is delivered (the server's processes ran); when neither,
// the phase is over. Its Xlib calls go into a draw log written as the oracle's, section by section.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { join, relative } from 'node:path';
import { runCow } from '../src/process.ts';
import { XServer, ORACLE_T0 } from '../src/xlib/xlib.ts';
import type { Conn, Datagrams, Platform } from '../src/rt/platform.ts';
import { fdSpecial } from '../src/rt/fs.ts';

export const GOLDEN_ROOT = new URL('../../../../re/netrek/golden/', import.meta.url).pathname;
const PIXMAPS = new URL('../assets/pixmaps/', import.meta.url).pathname;

export interface Piece { phase: number; dir: 'c' | 's' | 'u' | 'v'; n: number; cont: boolean }
export interface Frame { c2s: Uint8Array; s2c: Uint8Array; u2s: Uint8Array[]; s2u: Uint8Array[]; rl: Piece[]; eof: boolean }

export interface Golden {
  frames: number;
  nick: string;
  start: number;
  input: Map<number, string[]>;
  packets: Map<number, Frame>;
  draw: string[];
  index: string[];
  /** the scenario's lines for the client's .netrekrc ("rc <nick> <line>") */
  rc: string[];
}

function gz(path: string): string {
  return gunzipSync(readFileSync(path)).toString('latin1');
}

function hex(s: string | undefined): Uint8Array {
  if (!s) return new Uint8Array(0);
  const b = new Uint8Array(s.length / 2);
  for (let i = 0; i < b.length; i++) b[i] = parseInt(s.substr(2 * i, 2), 16);
  return b;
}

/** the golden of a scenario with one COW client, or null if it is not there */
export function loadGolden(name: string): Golden | null {
  const dir = join(GOLDEN_ROOT, name);
  if (!existsSync(join(dir, 'scenario.scn'))) return null;
  const scn = readFileSync(join(dir, 'scenario.scn'), 'utf8');
  const frames = Number(scn.match(/^frames (\d+)/m)![1]);
  const cow = scn.match(/^at (\d+) (\S+) cow\b/m);
  if (!cow) return null;
  const nick = cow[2];
  if (!existsSync(join(dir, `${nick}.draw.txt.gz`))) return null;
  const input = new Map<number, string[]>();
  for (const l of gz(join(dir, `${nick}.input.txt.gz`)).split('\n')) {
    if (!l) continue;
    const sp = l.indexOf(' ');
    const t = Number(l.slice(0, sp));
    if (!input.has(t)) input.set(t, []);
    input.get(t)!.push(l.slice(sp + 1));
  }
  const packets = new Map<number, Frame>();
  for (const l of gz(join(dir, 'packets.jsonl.gz')).split('\n')) {
    if (!l) continue;
    const j = JSON.parse(l);
    if (j.c !== nick) continue;
    const rl: Piece[] = [];
    for (const p of (j.rl ?? '').split(',')) {
      if (!p) continue;
      const cont = p[1] === '+';
      const k = cont ? 2 : 1;
      rl.push({ phase: Number(p[0]), dir: p[k] as Piece['dir'], n: Number(p.slice(k + 1)), cont });
    }
    const list = (s: string | undefined) => (s ? s.split(',').map(hex) : []);
    packets.set(j.t, { c2s: hex(j.c2s), s2c: hex(j.s2c), u2s: list(j.u2s), s2u: list(j.s2u), rl, eof: !!j.eof });
  }
  const draw = gz(join(dir, `${nick}.draw.txt.gz`)).split('\n');
  if (draw[draw.length - 1] === '') draw.pop();
  const index = gz(join(dir, `${nick}.drawidx.txt.gz`)).split('\n').filter((l) => l);
  const rc: string[] = [];
  for (const m of scn.matchAll(new RegExp(`^rc ${nick} (.*)$`, 'gm'))) rc.push(m[1].trim());
  return { frames, nick, start: Number(cow[1]), input, packets, draw, index, rc };
}

/** the oracle's home directory of the client: its .netrekrc (oracle/build.sh) and COW's images */
export function oracleFiles(home: string, nick: string, extra: string[] = []): Map<string, Uint8Array> {
  const files = new Map<string, Uint8Array>();
  const rc = [
    "# the client oracle's COW configuration (re/netrek/oracle/build.sh); everything else is COW's default",
    'server: 127.0.0.1',
    `login: ${nick}`,
    ...(extra.some((l) => l.startsWith('tryUdp:')) ? [] : ['tryUdp: off']),
    'sounddir: nosounds',
    'pixmapDir: pixmaps',
    ...extra,
    '',
  ].join('\n');
  files.set(`${home}/.netrekrc`, Uint8Array.from(rc, (c) => c.charCodeAt(0)));
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else files.set(`${home}/pixmaps/${relative(PIXMAPS, p)}`, new Uint8Array(readFileSync(p)));
    }
  };
  walk(PIXMAPS);
  return files;
}

/** the X server of the last replay (its windows' pixels when it rendered) */
export let lastServer: XServer | null = null;

export interface Mismatch { what: string; frame: number; detail: string }

export interface ReplayResult {
  frames: number;
  sections: number;
  lines: number;
  c2sBytes: number;
  s2cBytes: number;
  /** datagrams COW sent, the server's it got */
  u2s: number;
  s2u: number;
  mismatch: Mismatch | null;
  stdout: string;
  stderr: string;
  draw: string[];
  index: string[];
}

/** replays the golden; stops at the first difference (bytes, relay order or draw log) */
export async function replay(g: Golden, opts: { frames?: number; onFrame?: (frame: number) => void; render?: boolean } = {}): Promise<ReplayResult> {
  const tickUs = 20000;
  const lastFrame = Math.min(opts.frames ?? g.frames, g.frames);
  let now = ORACLE_T0 * 1e6;
  const draw: string[] = [];
  const index: string[] = [];
  let stdout = '', stderr = '';
  const x = new XServer({ clock: () => now, tickUs, render: !!opts.render, fd: 3 });
  x.log = { full: (l) => draw.push(l), index: (l) => index.push(l) };

  // the connection: what the server sent and COW has not read, what COW wrote since the last relay
  let inbox: number[] = [];
  let serverClosed = false;
  let outbox: number[] = [];
  const conn: Conn = {
    read(max) {
      if (!inbox.length) return serverClosed ? null : new Uint8Array(0);
      const n = Math.min(max, inbox.length);
      const b = Uint8Array.from(inbox.slice(0, n));
      inbox = inbox.slice(n);
      return b;
    },
    readable: () => inbox.length > 0 || serverClosed,
    write(b) { for (const v of b) outbox.push(v); },
    close() {},
  };
  // the UDP socket's datagrams: from the server and not read yet, from COW since the last relay
  let dgIn: Uint8Array[] = [];
  let dgOut: Uint8Array[] = [];
  let dgOpen = false;
  const datagrams: Datagrams = {
    open() { dgOpen = true; },
    close() { dgOpen = false; dgIn = []; },
    send(d) { dgOut.push(d.slice()); },
    recv() { return dgIn.shift() ?? null; },
    readable: () => dgIn.length > 0,
  };

  // COW's wait: the descriptors it waits for and its deadline; wake() lets it run until it waits again
  let waiting: { fds: number[]; deadline: number; resume: () => void } | null = null;
  let stopped: (() => void) | null = null;
  let exited = false;
  let failure: unknown = null;
  const stop = () => new Promise<void>((res) => { stopped = res; });
  const platform: Platform = {
    nowUs: () => now,
    idle(fds, deadline) {
      return new Promise<void>((res) => {
        waiting = { fds, deadline, resume: res };
        const s = stopped;
        stopped = null;
        s?.();
      });
    },
    x,
    connect: () => conn,
    datagrams: () => datagrams,
    pid: 1001,
    login: g.nick,
    home: '/home/' + g.nick,
    fileChanged() {},
    stdout: (b) => { stdout += String.fromCharCode(...b); },
    stderr: (b) => { stderr += String.fromCharCode(...b); },
  };

  const ready = (): boolean => {
    if (!waiting) return false;
    for (const fd of waiting.fds) {
      if (fd === x.fd && x.inputPending()) return true;
      if (fd !== x.fd && fdSpecial(fd)?.readable()) return true;
    }
    return waiting.deadline >= 0 && now >= waiting.deadline;
  };
  const wake = async () => {
    const w = waiting!;
    waiting = null;
    const s = stop();
    w.resume();
    await s;
  };

  let mismatch: Mismatch | null = null;
  let checked = 0;
  let c2sBytes = 0, s2cBytes = 0, u2s = 0, s2u = 0;
  const done = (what: string, frame: number, detail: string) => { mismatch = { what, frame, detail }; };

  for (let frame = 1; frame <= lastFrame && !mismatch; frame++) {
    now += tickUs;
    opts.onFrame?.(frame);
    if (frame === g.start) {
      const s = stop();
      runCow(platform, ['netrek-client-cow'], oracleFiles('/home/' + g.nick, g.nick, g.rc)).then(
        () => { exited = true; const f = stopped; stopped = null; f?.(); },
        (e) => { failure = e; exited = true; const f = stopped; stopped = null; f?.(); },
      );
      await s;
    }
    for (const l of g.input.get(frame) ?? []) x.input(l);
    const pk = g.packets.get(frame) ?? { c2s: new Uint8Array(0), s2c: new Uint8Array(0), u2s: [], s2u: [], rl: [], eof: false };
    let ri = 0, co = 0, so = 0, uo = 0, vo = 0;
    const pieces = () => pk.rl.map((q) => q.phase + (q.cont ? '+' : '') + q.dir + q.n).join(',');
    for (const phase of [1, 2]) {
      for (;;) {
        if (failure) break;
        // what COW wrote since it was woken: one relay, the stream's bytes first, then its datagrams
        let first = true;
        if (outbox.length) {
          const p = pk.rl[ri];
          if (!p || p.phase !== phase || p.dir !== 'c' || p.n !== outbox.length || p.cont) {
            done('relay', frame, `COW wrote ${outbox.length} bytes in phase ${phase}; the oracle relayed ${p ? p.phase + p.dir + p.n : 'nothing'} (piece ${ri} of ${pieces()})\n  port:   ${hexs(outbox)}\n  oracle: ${p && p.dir === 'c' ? hexs(pk.c2s.subarray(co, co + p.n)) : ''}`);
            break;
          }
          const want = pk.c2s.subarray(co, co + p.n);
          for (let i = 0; i < p.n; i++) {
            if (want[i] !== outbox[i]) {
              done('c2s', frame, `byte ${co + i} of the frame: ${outbox[i]} instead of ${want[i]} (piece ${hexs(outbox)} vs ${hexs(want)})`);
              break;
            }
          }
          if (mismatch) break;
          c2sBytes += p.n;
          co += p.n;
          ri++;
          outbox = [];
          first = false;
        }
        for (const d of dgOut) {
          const p = pk.rl[ri];
          const want = pk.u2s[uo];
          if (!p || p.phase !== phase || p.dir !== 'u' || p.cont === first || !want || hexs(want) !== hexs(d)) {
            done('udp', frame, `COW sent a datagram in phase ${phase}: ${hexs(d)}; the oracle relayed ${p ? p.phase + (p.cont ? '+' : '') + p.dir + p.n : 'nothing'} (piece ${ri} of ${pieces()}), datagram ${want ? hexs(want) : 'none'}`);
            break;
          }
          u2s++;
          uo++;
          ri++;
          first = false;
        }
        dgOut = [];
        if (mismatch) break;
        // a server piece relayed with the one before it ("+") arrives before COW runs again
        const nx = pk.rl[ri];
        const more = !!nx && nx.phase === phase && nx.cont && (nx.dir === 's' || nx.dir === 'v');
        if (!more && !exited && ready()) {
          await wake();
          continue;
        }
        const p = pk.rl[ri];
        if (p && p.phase === phase && p.dir === 's') {
          for (const v of pk.s2c.subarray(so, so + p.n)) inbox.push(v);
          so += p.n;
          s2cBytes += p.n;
          ri++;
          continue;
        }
        if (p && p.phase === phase && p.dir === 'v') {
          // the server's datagram: COW's socket takes it if it has one (the coordinator routed it there)
          if (dgOpen) dgIn.push(pk.s2u[vo]);
          vo++;
          s2u++;
          ri++;
          continue;
        }
        break;
      }
      if (mismatch || failure) break;
      if (phase === 2 && pk.eof) serverClosed = true;
    }
    if (failure) {
      done('error', frame, String((failure as any)?.stack ?? failure));
      break;
    }
    // the draw log so far is the oracle's
    for (; !mismatch && checked < draw.length; checked++) {
      if (draw[checked] !== g.draw[checked]) done('draw', frame, `line ${checked + 1}:\n  port:   ${draw[checked]}\n  oracle: ${g.draw[checked]}`);
    }
    if (!mismatch && ri < pk.rl.length) done('relay', frame, `pieces left: ${pk.rl.slice(ri).map((q) => q.phase + (q.cont ? '+' : '') + q.dir + q.n).join(',')} (COW ${exited ? 'exited' : waiting ? `waits for ${(waiting as any).fds} until ${(waiting as any).deadline}` : 'runs'})`);
  }
  x.logClose();
  lastServer = x;
  return { frames: lastFrame, sections: index.length, lines: draw.length, c2sBytes, s2cBytes, u2s, s2u, mismatch, stdout, stderr, draw, index };
}

function hexs(b: ArrayLike<number>): string {
  return Array.from(b, (v) => v.toString(16).padStart(2, '0')).join('');
}
