// The client oracle's replay (re/xpilot/oracle/client/harness.c) for the port: the client runs its
// main() with the scenario's words on a virtual clock in lockstep with the recorded server stream.
// Whenever it waits (select, sock_readable, XNextEvent) and nothing is ready, the next tick comes:
// what it sent since the last tick is compared with what the server got from it at that tick, then
// the server's datagrams of the tick are delivered (as protocol/games/xpilot.capnp messages, golden.ts
// SchemaMapper) and the scenario's input of the tick becomes X input. The draw log is cut into the
// sections of the oracle ("T <tick>" before the first frame, "F <loops>" from each Handle_start).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Display, XKeysymToString } from '../src/xlib/xlib.ts';
import { setSys, ClientExit, type RoomService, type XpSys } from '../src/client/sys.ts';
import { xpilot_main } from '../src/client/main.ts';
import { xpilotShutdown } from '../src/client/join.ts';
import { O } from '../src/client/option.ts';
import { KEY_TALK } from '../src/client/consts.ts';
import { SchemaMapper, packMsg, readPackets, readScenario, unpackMsg, type PlainMsg } from './golden.ts';

const BASE_US = 1262304000 * 1_000_000;
const STEP_US = 20000;
const ASSETS = join(import.meta.dirname, '..', 'assets');

interface ScnClient { nick: string; join: number; draw: boolean; words: string[] }
interface ScnEvent { tick: number; client: number; what: string; arg1: string; arg2: string }
interface Scn { name: string; frames: number; clients: ScnClient[]; events: ScnEvent[] }

/** words split like a shell: "quoted words" stay one word */
function words(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    while (i < line.length && /\s/.test(line[i])) i++;
    if (i >= line.length) break;
    let w = '';
    while (i < line.length && !/\s/.test(line[i])) {
      if (line[i] === '"') {
        i++;
        while (i < line.length && line[i] !== '"') w += line[i++];
        if (line[i] === '"') i++;
      } else w += line[i++];
    }
    out.push(w);
  }
  return out;
}

export function parseScenario(name: string): Scn {
  const s: Scn = { name, frames: 0, clients: [], events: [] };
  for (const raw of readScenario(name).text.split('\n')) {
    const line = raw.trimStart().startsWith('#') ? '' : raw;
    const w = words(line);
    if (!w.length) continue;
    if (w[0] === 'frames') s.frames = Number(w[1]);
    else if (w[0] === 'client') {
      const c: ScnClient = { nick: w[1], join: 1, draw: false, words: [] };
      for (const x of w.slice(2)) {
        if (x.startsWith('join=')) c.join = Number(x.slice(5));
        else if (x.startsWith('draw=')) c.draw = x.slice(5) === '1';
        else c.words.push(x);
      }
      s.clients.push(c);
    } else if (w[0] === 'at') {
      const e: ScnEvent = { tick: Number(w[1]), client: s.clients.findIndex((c) => c.nick === w[2]), what: w[3], arg1: '', arg2: '' };
      if (e.what === 'key' || e.what === 'button' || e.what === 'move') {
        e.arg1 = w[4];
        e.arg2 = w[5];
      } else if (e.what === 'talk' || e.what === 'pointer') e.arg2 = w[4];
      s.events.push(e);
    }
  }
  return s;
}

// ---------------------------------------------------------------- the draw log

/** FNV-1a 64 of latin-1 text, as two 32-bit halves */
class Fnv {
  hi = 0xcbf29ce4;
  lo = 0x84222325;
  add(s: string): void {
    let hi = this.hi, lo = this.lo;
    for (let i = 0; i < s.length; i++) {
      lo = (lo ^ (s.charCodeAt(i) & 0xff)) >>> 0;
      const t = lo * 0x1b3;
      hi = (hi * 0x1b3 + Math.floor(t / 4294967296) + lo * 256) >>> 0;
      lo = t >>> 0;
    }
    this.hi = hi;
    this.lo = lo;
  }
  hex(): string {
    return this.hi.toString(16).padStart(8, '0') + this.lo.toString(16).padStart(8, '0');
  }
}

export interface Section {
  name: string;
  calls: number;
  hash: string;
  /** the calls and "# " notes, each with its '\n' (kept when `keep` asked for them) */
  lines: string[] | null;
}

class SectionLog {
  sections: Section[] = [];
  private name = 'T 0';
  private calls = 0;
  private hash = new Fnv();
  private written = false;
  private lines: string[] | null = null;
  private open = true;
  private keep: (name: string) => boolean;
  private onSection: ((s: Section) => void) | null;
  constructor(keep: (name: string) => boolean, onSection: ((s: Section) => void) | null) {
    this.keep = keep;
    this.onSection = onSection;
  }

  private end(): void {
    if (!this.open) return;
    if (this.calls > 0 || this.name[0] === 'F' || this.written) {
      const s = { name: this.name, calls: this.calls, hash: this.hash.hex(), lines: this.lines };
      this.sections.push(s);
      if (this.onSection) this.onSection(s);
    }
    this.open = false;
  }

  section(name: string): void {
    this.end();
    this.name = name;
    this.calls = 0;
    this.hash = new Fnv();
    this.written = false;
    this.lines = this.keep(name) ? [] : null;
    this.open = true;
  }

  call(line: string): void {
    const l = line + '\n';
    this.hash.add(l);
    this.calls++;
    this.written = true;
    if (this.lines) this.lines.push(l);
  }

  note(text: string): void {
    this.written = true;
    if (this.lines) this.lines.push(`# ${text}\n`);
  }

  close(): void {
    this.end();
  }
}

// ---------------------------------------------------------------- the run

class Done extends Error {}

export interface RunOptions {
  /** stop after this tick (default: the scenario's last) */
  lastTick?: number;
  /** keep the lines of these sections */
  keep?: (name: string) => boolean;
  /** told of each finished section; may throw to stop the run */
  onSection?: (s: Section) => void;
  /** rasterize too (the draw log does not need it) */
  render?: boolean;
  /** the room service the welcome screen lists (none: as the oracle, no meta server answers) */
  rooms?: RoomService;
  /** more input for this client, in the scenario's terms (`at <tick> <nick> ...` without the nick) */
  extraEvents?: { tick: number; what: string; arg1?: string; arg2?: string }[];
}

export interface RunResult {
  sections: Section[];
  /** client messages sent as recorded, and the first differences */
  c2sOk: number;
  c2sBad: string[];
  /** every message the client sent, with the tick the server got it */
  sent: { tick: number; msg: PlainMsg }[];
  log: string[];
  lastTick: number;
  exitStatus: number | null;
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export async function runClient(scnName: string, nick: string, opts: RunOptions = {}): Promise<RunResult> {
  const scn = parseScenario(scnName);
  const me = scn.clients.findIndex((c) => c.nick === nick);
  if (me < 0) throw new Error(`no client ${nick} in ${scnName}`);
  for (const e of opts.extraEvents ?? []) scn.events.push({ tick: e.tick, client: me, what: e.what, arg1: e.arg1 ?? '', arg2: e.arg2 ?? '' });
  const client = scn.clients[me];
  const lastTick = Math.min(opts.lastTick ?? scn.frames, scn.frames);

  // the recorded datagrams of this client as messages: s2c by tick, c2s in order
  const mapper = new SchemaMapper();
  const s2c = new Map<number, Uint8Array[][]>();
  const c2s: { tick: number; msg: PlainMsg }[] = [];
  let verifyTick = -1;
  for (const { d } of readPackets(scnName)) {
    if (d.dir === 'meta') {
      mapper.messages(d);
      continue;
    }
    const msgs = mapper.messages(d);
    const who = d.dir === 's2c' ? d.to : d.from;
    if (who !== nick || d.sock !== 'data') continue;
    if (d.dir === 'c2s') {
      if (verifyTick < 0) verifyTick = d.t;
      for (const m of msgs) c2s.push({ tick: d.t, msg: m });
      continue;
    }
    // one datagram: its messages; a reliable chunk that completed nothing still gets its ack
    const group = msgs.map(packMsg);
    const chunks = (d.pkts ?? []).filter((p) => p.pkt === 'PKT_RELIABLE').length;
    const pieces = msgs.filter((m) => m.which === 'reliable' || m.which === 'setup').length;
    if (chunks > 0 && pieces === 0) group.push(packMsg({ which: 'reliable', packets: [] }));
    if (!group.length) group.push(new Uint8Array(0));
    if (!s2c.has(d.t)) s2c.set(d.t, []);
    s2c.get(d.t)!.push(group);
  }

  // the virtual clock and the network
  let cur_tick = 0, now_us = BASE_US, next_us = BASE_US;
  let frame_seen = false, joined = false, quit_pending = false;
  const inbox: Uint8Array[][] = [];
  let cur: Uint8Array[] = [];
  let outbox: Uint8Array[] = [];
  let c2sAt = 0, c2sOk = 0;
  const c2sBad: string[] = [];
  const sent: { tick: number; msg: PlainMsg }[] = [];
  const log: string[] = [];
  const files = new Map<string, string>();
  const dpy = new Display();
  dpy.render = opts.render ?? false;
  const sections = new SectionLog(opts.keep ?? (() => false), opts.onSection ?? null);
  dpy.sink = sections;

  const type_text = (s: string) => {
    let talk = 0x6d;
    for (const k of O.keydefs) {
      if (k.key === KEY_TALK) {
        talk = k.keysym;
        break;
      }
    }
    const tn = XKeysymToString(talk)!;
    dpy.inputKey(true, tn);
    dpy.inputKey(false, tn);
    for (const ch of s) {
      const upper = ch >= 'A' && ch <= 'Z';
      const ks = XKeysymToString((upper ? ch.toLowerCase() : ch).charCodeAt(0));
      if (!ks) throw new Error(`cannot type '${ch}'`);
      if (upper) dpy.inputKey(true, 'Shift_L');
      dpy.inputKey(true, ks);
      dpy.inputKey(false, ks);
      if (upper) dpy.inputKey(false, 'Shift_L');
    }
    dpy.inputKey(true, 'Return');
    dpy.inputKey(false, 'Return');
  };

  const inject_events = () => {
    for (const e of scn.events) {
      if (e.client !== me || e.tick !== cur_tick) continue;
      if (e.what === 'key') dpy.inputKey(e.arg1 === 'press', e.arg2);
      else if (e.what === 'button') dpy.inputButton(e.arg1 === 'press', Number(e.arg2));
      else if (e.what === 'pointer') dpy.inputMotionRel(Number(e.arg2), 0);
      else if (e.what === 'move') dpy.inputMotionAbs(Number(e.arg1), Number(e.arg2));
      else if (e.what === 'talk') type_text(e.arg2);
      else if (e.what === 'quit') quit_pending = true;
    }
  };

  const replay_tick = () => {
    const next = cur_tick + 1;
    if (next <= scn.frames) {
      for (const data of outbox) {
        const got = unpackMsg(data);
        sent.push({ tick: next, msg: got });
        while (c2sAt < c2s.length && c2s[c2sAt].tick < next) {
          if (c2sBad.length < 20) c2sBad.push(`tick ${c2s[c2sAt].tick}: recorded, not sent: ${JSON.stringify(c2s[c2sAt].msg)}`);
          c2sAt++;
        }
        const want = c2sAt < c2s.length && c2s[c2sAt].tick === next ? unpackMsg(packMsg(c2s[c2sAt].msg)) : null;
        if (want && same(got, want)) {
          c2sOk++;
          c2sAt++;
        } else if (c2sBad.length < 20) c2sBad.push(`tick ${next}: sent ${JSON.stringify(got)}, recorded ${want ? JSON.stringify(want) : 'nothing'}`);
      }
    }
    outbox = [];
    if (next > lastTick) throw new Done();
    cur_tick = next;
    now_us = BASE_US + cur_tick * STEP_US;
    next_us = now_us + STEP_US;
    for (const g of s2c.get(cur_tick) ?? []) inbox.push(g.slice());
  };

  const sync_tick = () => {
    replay_tick();
    if (!frame_seen) sections.section(`T ${cur_tick}`);
    if (joined) inject_events();
  };

  const wait_until = (deadline: number, ready: () => boolean): boolean => {
    for (;;) {
      if (ready()) return true;
      if (deadline <= now_us) return false;
      if (deadline < next_us) {
        now_us = deadline;
        return ready();
      }
      sync_tick();
    }
  };

  const netReady = () => inbox.length > 0 || cur.length > 0;
  const xReady = () => dpy.pending() > 0;

  const sys: XpSys = {
    nowUs: () => now_us,
    time: () => Math.floor(now_us / 1_000_000),
    localtime: (t) => ({ hour: Math.floor((t % 86400) / 3600), min: Math.floor((t % 3600) / 60) }),
    select: async (x, net, timeoutUs) => {
      if (quit_pending) {
        quit_pending = false;
        dpy.note('quit');
        xpilotShutdown();
        throw new Done();
      }
      const deadline = timeoutUs === null ? Infinity : now_us + timeoutUs;
      let rx = false, rn = false;
      wait_until(deadline, () => {
        rx = x && xReady();
        rn = net && netReady();
        return rx || rn;
      });
      return { x: rx, net: rn };
    },
    waitNet: async (timeoutUs) => wait_until(now_us + timeoutUs, netReady),
    waitX: async () => sync_tick(),
    // recv() takes the next message (a datagram's first, or the rest of the one being read);
    // peek() sees only the rest of the datagram being read
    recv: () => {
      if (cur.length) return cur.shift()!;
      if (!inbox.length) return null;
      cur = inbox.shift()!;
      return cur.shift()!;
    },
    peek: () => (cur.length ? cur[0] : null),
    send: (data) => outbox.push(data),
    contact: async () => {
      // textinterface.c Contact_servers: the contact datagrams are transport; the verify that
      // follows was sent in the tick before the server got it
      if (verifyTick < 0) return false;
      while (cur_tick < verifyTick - 1) sync_tick();
      return true;
    },
    rooms: opts.rooms ?? null,
    readFile: async (name) => files.get(name) ?? null,
    writeFile: async (name, text) => {
      files.set(name, text);
      return true;
    },
    libFile: (path) => {
      try {
        return new Uint8Array(readFileSync(join(ASSETS, path)));
      } catch {
        return null;
      }
    },
    display: dpy,
    pid: 5000 + me,
    login: `pilot${me + 1}`,
    hostname: `pilot${me + 1}.oracle`,
    sound: false,
    playSound: () => {},
    setSoundGain: () => {},
    stopSound: () => {},
    exit: (status) => {
      throw new ClientExit(status);
    },
    log: (line) => {
      if (log.length < 2000) log.push(line);
    },
    onFrame: (loops) => {
      sections.section(`F ${loops}`);
      frame_seen = true;
    },
  };
  setSys(sys);

  let exitStatus: number | null = null;
  try {
    while (cur_tick < client.join) sync_tick();
    joined = true;
    inject_events();
    const argv = [...client.words];
    if (!argv.includes('-name')) argv.push('-name', nick);
    dpy.note(`client main() at tick ${cur_tick}: seedMT((unsigned)time(NULL) ^ Get_process_id()) = seedMT(${(Math.floor(now_us / 1e6) ^ (5000 + me)) >>> 0})`);
    exitStatus = await xpilot_main(argv);
    // after main() returns the oracle exits; the ticks that remain are not drawn
  } catch (e) {
    if (!(e instanceof Done)) throw e;
  }
  sections.close();
  for (; c2sAt < c2s.length && c2s[c2sAt].tick <= cur_tick; c2sAt++) {
    if (c2sBad.length < 20) c2sBad.push(`tick ${c2s[c2sAt].tick}: recorded, not sent: ${JSON.stringify(c2s[c2sAt].msg)}`);
  }
  return { sections: sections.sections, c2sOk, c2sBad, sent, log, lastTick: cur_tick, exitStatus };
}
