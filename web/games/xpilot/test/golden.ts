// Readers for the XPilot NG 4.7.3 oracle goldens (re/xpilot/oracle/, README.md there has the formats).
// Server goldens (world, packets, raw stream, math) are in server/src/test/resources/xpilot/, the
// client's draw goldens in test/golden/ here. The ports' tests (FG-21/22/23) use these to compare:
// the world of a tick, the packets each player got (also as protocol/games/xpilot.capnp messages),
// the drawing calls of a frame.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { packGame, unpackGame } from '../../../src/sdk/index.ts';
import * as P from '../src/proto/xpilot.ts';

export const SERVER_GOLDENS = join(import.meta.dirname, '..', '..', '..', '..', 'server', 'src', 'test', 'resources', 'xpilot');
export const CLIENT_GOLDENS = join(import.meta.dirname, 'golden');

export function readGz(path: string): Buffer {
  return gunzipSync(readFileSync(path));
}

/** the lines of a text, each with its '\n' (as hashed) */
export function lines(buf: Buffer): Buffer[] {
  const out: Buffer[] = [];
  let start = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 10) {
      out.push(buf.subarray(start, i + 1));
      start = i + 1;
    }
  }
  if (start < buf.length) out.push(buf.subarray(start));
  return out;
}

// ---- FNV-1a 64, as two 32-bit halves (exact in doubles) ----

export type Fnv = { hi: number; lo: number };
export const fnvInit = (): Fnv => ({ hi: 0xcbf29ce4, lo: 0x84222325 });

export function fnvUpdate(h: Fnv, bytes: Uint8Array): Fnv {
  let { hi, lo } = h;
  for (let i = 0; i < bytes.length; i++) {
    lo = (lo ^ bytes[i]) >>> 0;
    // (hi:lo) * (2^40 + 0x1b3) mod 2^64
    const t = lo * 0x1b3;
    const carry = Math.floor(t / 4294967296);
    hi = (hi * 0x1b3 + carry + lo * 256) >>> 0;
    lo = t >>> 0;
  }
  return { hi, lo };
}

export const fnvHex = (h: Fnv): string => h.hi.toString(16).padStart(8, '0') + h.lo.toString(16).padStart(8, '0');
export const fnv64 = (bytes: Uint8Array): string => fnvHex(fnvUpdate(fnvInit(), bytes));

// ---- the goldens' text format of values (common/jbuf.h) ----

/** a double as the oracle writes it: the shortest of C's %.15g, %.16g, %.17g that reads back */
export function formatDouble(d: number): string {
  if (Number.isNaN(d)) return '"NaN"';
  if (!Number.isFinite(d)) return d > 0 ? '"Infinity"' : '"-Infinity"';
  if (Object.is(d, -0)) return '-0';
  if (d === 0) return '0';
  for (const p of [15, 16, 17]) {
    const s = formatG(d, p);
    if (Number(s) === d) return s;
  }
  return formatG(d, 17);
}

const EXP = /^(-?)(\d)(?:\.(\d+))?e([+-]\d+)$/;

/** is the decimal s (as toExponential writes it) exactly the double d? */
function exactly(s: string, d: number): boolean {
  const m = EXP.exec(s)!;
  const digits = m[2] + (m[3] ?? '');
  let lhs = BigInt(digits);
  const k = Number(m[4]) - (digits.length - 1);
  const b = Buffer.alloc(8);
  b.writeDoubleBE(Math.abs(d));
  const bits = b.readBigUInt64BE(0);
  const be = Number(bits >> 52n);
  let rhs = be === 0 ? bits & 0xfffffffffffffn : (bits & 0xfffffffffffffn) | (1n << 52n);
  const e = (be === 0 ? 1 : be) - 1075;
  if (k >= 0) lhs *= 10n ** BigInt(k);
  else rhs *= 10n ** BigInt(-k);
  if (e >= 0) rhs <<= BigInt(e);
  else lhs <<= BigInt(-e);
  return lhs === rhs;
}

/** d rounded to p significant digits, ties to even (as glibc's printf), in toExponential's form */
function roundDigits(d: number, p: number): string {
  const longer = d.toExponential(p);
  const m = EXP.exec(longer)!;
  if (!longer.includes('5e') || !exactly(longer, d)) return d.toExponential(p - 1);
  // an exact tie: toExponential would round it up, printf rounds to even
  const all = m[2] + (m[3] ?? '');
  let kept = all.slice(0, p);
  let x = Number(m[4]);
  if (Number(kept[p - 1]) % 2 === 1) {
    const up = (BigInt(kept) + 1n).toString();
    if (up.length > p) { kept = up.slice(0, p); x++; } else kept = up;
  }
  return `${m[1]}${kept[0]}${p > 1 ? '.' + kept.slice(1) : ''}e${x < 0 ? '-' : '+'}${Math.abs(x)}`;
}

/** C's printf("%.<p>g", d) for a finite non-zero d */
export function formatG(d: number, p: number): string {
  const e = roundDigits(d, p);
  const m = EXP.exec(e);
  if (!m) throw new Error(`cannot read ${e}`);
  const sign = m[1];
  const digits = m[2] + (m[3] ?? '');
  const x = Number(m[4]);
  if (x < -4 || x >= p) {
    let mant = digits.length > 1 ? `${digits[0]}.${digits.slice(1)}` : digits;
    if (mant.includes('.')) mant = mant.replace(/0+$/, '').replace(/\.$/, '');
    const ax = Math.abs(x);
    return `${sign}${mant}e${x < 0 ? '-' : '+'}${ax < 10 ? '0' : ''}${ax}`;
  }
  let s: string;
  if (x >= 0) {
    const int = digits.slice(0, x + 1).padEnd(x + 1, '0');
    const frac = digits.slice(x + 1);
    s = frac.length ? `${int}.${frac}` : int;
  } else {
    s = `0.${'0'.repeat(-x - 1)}${digits}`;
  }
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return sign + s;
}

/** a string as the oracle writes it: JSON with \u00XX for bytes < 0x20 and >= 0x7f (Latin-1) */
export function formatString(s: string): string {
  let out = '"';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0x22 || c === 0x5c) out += '\\' + s[i];
    else if (c < 0x20 || c >= 0x7f) out += '\\u' + c.toString(16).padStart(4, '0');
    else out += s[i];
  }
  return out + '"';
}

/** a value parsed from a golden line written back byte for byte (integers below 1e15 are integers) */
export function formatValue(v: unknown): string {
  if (typeof v === 'number') return Number.isInteger(v) && Math.abs(v) < 1e15 && !Object.is(v, -0) ? String(v) : formatDouble(v);
  if (typeof v === 'string') return formatString(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return '[' + v.map(formatValue).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.entries(v).map(([k, x]) => `"${k}":${formatValue(x)}`).join(',') + '}';
  throw new Error(`cannot write ${String(v)}`);
}

// ---- scenarios ----

export type Scenario = { name: string; frames: number; clients: string[]; drawing: string[]; text: string };

export function scenarioNames(): string[] {
  return readFileSync(join(SERVER_GOLDENS, 'goldens.txt'), 'utf8')
    .split('\n')
    .filter((l) => /^[a-z]+\/scenario\.scn /.test(l))
    .map((l) => l.split('/')[0]);
}

export function readScenario(name: string): Scenario {
  const text = readFileSync(join(SERVER_GOLDENS, name, 'scenario.scn'), 'utf8');
  const s: Scenario = { name, frames: 0, clients: [], drawing: [], text };
  for (const line of text.split('\n')) {
    const w = line.replace(/#.*/, '').trim().split(/\s+/);
    if (w[0] === 'frames') s.frames = Number(w[1]);
    if (w[0] === 'client') {
      s.clients.push(w[1]);
      if (w.includes('draw=1')) s.drawing.push(w[1]);
    }
  }
  return s;
}

// ---- server goldens ----

/** frames.txt: per tick the world hash (of the lines written), the hash with sparks and debris
 * in full, the object count, randomMT() calls so far, and per client the hash of its packet lines */
export type FrameIndex = { tick: number; world: string; worldFull: string; objCount: number; rng: number; clients: string[] };

export function readFrames(name: string): FrameIndex[] {
  return readGz(join(SERVER_GOLDENS, name, 'frames.txt.gz'))
    .toString('latin1')
    .trim()
    .split('\n')
    .map((l) => {
      const w = l.split(' ');
      return { tick: Number(w[0]), world: w[1], worldFull: w[2], objCount: Number(w[3]), rng: Number(w[4]), clients: w.slice(5) };
    });
}

export type WorldRecord = { t: number; k: string; [field: string]: unknown };

/** world.jsonl: the dumped ticks (all up to 250, then every 25th), each as its raw lines */
export function readWorld(name: string): Map<number, Buffer[]> {
  const ticks = new Map<number, Buffer[]>();
  for (const l of lines(readGz(join(SERVER_GOLDENS, name, 'world.jsonl.gz')))) {
    const t = Number(/^\{"t":(\d+),/.exec(l.toString('latin1'))![1]);
    if (!ticks.has(t)) ticks.set(t, []);
    ticks.get(t)!.push(l);
  }
  return ticks;
}

export const parseLine = (l: Buffer): WorldRecord => JSON.parse(l.toString('latin1'));

/** one decoded datagram (packets.jsonl) */
export type Pkt = { pkt: string; [field: string]: unknown };
export type Datagram = {
  t: number;
  dir: 's2c' | 'c2s' | 'meta';
  to?: string;
  from?: string;
  sock?: 'contact' | 'data';
  port: number;
  len: number;
  pkts?: Pkt[];
  rel?: Pkt[];
  text?: string;
};

export function readPackets(name: string): { raw: Buffer; d: Datagram }[] {
  return lines(readGz(join(SERVER_GOLDENS, name, 'packets.jsonl.gz'))).map((raw) => ({ raw, d: JSON.parse(raw.toString('latin1')) }));
}

/** stream.bin: "XPS1", then per datagram u32 tick, u8 dir (0 s2c, 1 c2s, 2 meta), u8 client (255 =
 * none), u8 contact socket, u8 0, u16 source port, u16 destination port, u32 length (little-endian),
 * the bytes */
export type RawDatagram = { tick: number; dir: number; client: number; contact: boolean; srcPort: number; dstPort: number; data: Buffer };

export function readStream(name: string): RawDatagram[] {
  const b = readGz(join(SERVER_GOLDENS, name, 'stream.bin.gz'));
  if (b.toString('latin1', 0, 4) !== 'XPS1') throw new Error('not a stream');
  const out: RawDatagram[] = [];
  let o = 4;
  while (o < b.length) {
    const len = b.readUInt32LE(o + 12);
    out.push({
      tick: b.readUInt32LE(o), dir: b[o + 4], client: b[o + 5], contact: b[o + 6] === 1,
      srcPort: b.readUInt16LE(o + 8), dstPort: b.readUInt16LE(o + 10), data: b.subarray(o + 16, o + 16 + len),
    });
    o += 16 + len;
  }
  return out;
}

// ---- the recorded packets as protocol/games/xpilot.capnp messages ----
//
// Every recorded packet is either transport (TRANSPORT: what the core's rooms and reliable relay
// replace) or lands in one place of a `Msg` (SCHEMA_MAP): a member (or a list member) of `Frame`, a
// member of the `Reliable` or `ClientPacket` union, or `Setup`; `fields` maps the recorded field
// names (netserver.c's) to the schema's, one by one. A few are converted, not renamed (CONVERTED):
// the key bitmap, the fast radar blips, debris and fast shot positions, and the setup's map data.

/** recorded packet -> its place in a Msg; `schema` lists the schema struct's fields it fills */
export type Mapping =
  | { to: 'frame'; member: string; list: boolean; struct: string; fields: Record<string, string>; schema: string[] }
  | { to: 'reliable' | 'client'; member: string; struct: string | null; fields: Record<string, string>; schema: string[] };

const same = (...names: string[]): Record<string, string> => Object.fromEntries(names.map((n) => [n, n]));
const frame1 = (member: string, struct: string, fields: Record<string, string>): Mapping =>
  ({ to: 'frame', member, list: false, struct, fields, schema: Object.values(fields) });
const frameN = (member: string, struct: string, fields: Record<string, string>, schema = Object.values(fields)): Mapping =>
  ({ to: 'frame', member, list: true, struct, fields, schema });
const rel = (member: string, struct: string, fields: Record<string, string>, schema = Object.values(fields)): Mapping =>
  ({ to: 'reliable', member, struct, fields, schema });
const cli = (member: string, struct: string | null, fields: Record<string, string>, schema = Object.values(fields)): Mapping =>
  ({ to: 'client', member, struct, fields, schema });

export const SCHEMA_MAP: Record<string, Mapping> = {
  // Frame (frame.c Frame_update): single packets
  PKT_START: frame1('start', 'Start', { frame_loops: 'frameLoops', last_key_change: 'lastKeyChange' }),
  PKT_TIME_LEFT: frame1('timeLeft', 'TimeLeft', same('sec')),
  PKT_DAMAGED: frame1('damaged', 'Damaged', same('damaged')),
  PKT_SELF: frame1('self', 'Self', {
    x: 'x', y: 'y', vx: 'vx', vy: 'vy', dir: 'dir', power: 'power', turnspeed: 'turnspeed', turnresistance: 'turnresistance',
    lock_id: 'lockId', lock_dist: 'lockDist', lock_dir: 'lockDir', check: 'check', fuel_current: 'fuelCurrent',
    fuel_sum: 'fuelSum', fuel_max: 'fuelMax', view_width: 'viewWidth', view_height: 'viewHeight',
    debris_colors: 'debrisColors', status: 'status', autopilotlight: 'autopilotlight',
  }),
  PKT_SELF_ITEMS: frame1('selfItems', 'SelfItems', { item_mask: 'itemMask', counts: 'counts' }),
  PKT_MODIFIERS: frame1('modifiers', 'Modifiers', same('mods')),
  PKT_THRUSTTIME: frame1('thrusttime', 'Thrusttime', same('count', 'max')),
  PKT_SHIELDTIME: frame1('shieldtime', 'Shieldtime', same('count', 'max')),
  PKT_DESTRUCT: frame1('destruct', 'Destruct', same('count')),
  PKT_PHASINGTIME: frame1('phasingtime', 'Phasingtime', same('count', 'max')),
  PKT_SHUTDOWN: frame1('shutdown', 'Shutdown', same('count', 'delay')),
  PKT_LOSEITEM: frame1('loseitem', 'Loseitem', { lose_item_index: 'loseItemIndex' }),
  PKT_EYES: frame1('eyes', 'Eyes', same('id')),
  PKT_ROUNDDELAY: frame1('rounddelay', 'Rounddelay', same('count', 'max')),
  PKT_END: frame1('end', 'End', { frame_loops: 'frameLoops' }),
  // Frame: lists, one element per packet (fastradar: per blip)
  PKT_TARGET: frameN('targets', 'Target', { num: 'num', dead_ticks: 'deadTicks', damage: 'damage' }),
  PKT_CANNON: frameN('cannons', 'Cannon', { num: 'num', dead_ticks: 'deadTicks' }),
  PKT_FUEL: frameN('fuels', 'Fuel', same('num', 'fuel')),
  PKT_POLYSTYLE: frameN('polystyles', 'Polystyle', same('polyind', 'newstyle')),
  PKT_WRECKAGE: frameN('wreckages', 'Wreckage', same('x', 'y', 'wrtype', 'size', 'rot')),
  PKT_ASTEROID: frameN('asteroids', 'Asteroid', { x: 'x', y: 'y', type_size: 'typeSize', rot: 'rot' }),
  PKT_MISSILE: frameN('missiles', 'Missile', same('x', 'y', 'len', 'dir')),
  PKT_BALL: frameN('balls', 'Ball', same('x', 'y', 'id', 'style')),
  PKT_MINE: frameN('mines', 'Mine', same('x', 'y', 'teammine', 'id')),
  PKT_ITEM: frameN('items', 'Item', same('x', 'y', 'type')),
  PKT_LASER: frameN('lasers', 'Laser', same('color', 'x', 'y', 'len', 'dir')),
  PKT_ECM: frameN('ecms', 'Ecm', same('x', 'y', 'size')),
  PKT_TRANS: frameN('trans', 'Trans', same('x1', 'y1', 'x2', 'y2')),
  PKT_CONNECTOR: frameN('connectors', 'Connector', same('x1', 'y1', 'x2', 'y2', 'tractor')),
  PKT_PAUSED: frameN('paused', 'Paused', same('x', 'y', 'count')),
  PKT_APPEARING: frameN('appearing', 'Appearing', same('x', 'y', 'id', 'count')),
  PKT_SHIP: frameN('ships', 'Ship', same('x', 'y', 'id', 'dir', 'flags')),
  PKT_REFUEL: frameN('refuels', 'Refuel', same('x1', 'y1', 'x2', 'y2')),
  PKT_RADAR: frameN('radar', 'Radar', same('x', 'y', 'size')),
  PKT_FASTRADAR: frameN('fastradar', 'Fastradar', { blips: 'x,y,size' }, ['x', 'y', 'size']),
  PKT_DEBRIS: frameN('debris', 'Debris', { type: 'type', xy: 'xy' }),
  PKT_FASTSHOT: frameN('fastshots', 'Fastshot', { type: 'type', xy: 'xy' }),
  PKT_AUDIO: frameN('audio', 'Audio', same('type', 'vol')),
  PKT_WORMHOLE: frameN('wormholes', 'Wormhole', same('x', 'y')),
  // Reliable (connp->c, netclient.c reliable_tbl)
  PKT_REPLY: rel('reply', 'Reply', same('replyto', 'result')),
  PKT_MESSAGE: rel('message', 'Message', same('msg')),
  PKT_PLAYER: rel('player', 'Player', same('id', 'team', 'mychar', 'name', 'username', 'hostname', 'shape', 'ext', 'himself')),
  PKT_TEAM: rel('team', 'Team', same('id', 'team')),
  PKT_SCORE: rel('score', 'Score', same('id', 'score', 'life', 'mychar', 'alliance')),
  PKT_TIMING: rel('timing', 'Timing', same('id', 'timing')),
  PKT_LEAVE: rel('leave', 'Leave', same('id')),
  PKT_BASE: rel('base', 'Base', same('id', 'num')),
  PKT_SCORE_OBJECT: rel('scoreObject', 'ScoreObject', same('score', 'x', 'y', 'string')),
  PKT_TALK_ACK: rel('talkAck', 'TalkAck', same('seq')),
  PKT_MOTD_DATA: rel('motd', 'Motd', same('off', 'data', 'size')),
  PKT_QUIT_REASON: rel('quit', 'Quit', same('reason')),
  PKT_TEAM_SCORE: rel('teamScore', 'TeamScore', same('team', 'score')),
  PKT_WAR: rel('war', 'War', { robot_id: 'robotId', killer_id: 'killerId' }),
  PKT_SEEK: rel('seek', 'Seek', { programmer_id: 'programmerId', robot_id: 'robotId', sought_id: 'soughtId' }),
  PKT_STRING: rel('string', 'StringPacket', same('type', 'arg1', 'arg2')),
  // ClientPacket (netclient.c Send_*; netserver.c Receive_*)
  PKT_VERIFY: cli('verify', 'Verify', same('user', 'nick', 'disp'), ['user', 'nick', 'disp', 'host', 'team']),
  PKT_PLAY: cli('play', null, {}),
  PKT_QUIT: cli('quit', null, {}),
  PKT_KEYBOARD: cli('keyboard', 'Keyboard', same('change', 'keyv')),
  PKT_POWER: cli('power', 'Power', same('value')),
  PKT_POWER_S: cli('powerS', 'Power', same('value')),
  PKT_TURNSPEED: cli('turnspeed', 'Power', same('value')),
  PKT_TURNSPEED_S: cli('turnspeedS', 'Power', same('value')),
  PKT_TURNRESISTANCE: cli('turnresistance', 'Power', same('value')),
  PKT_TURNRESISTANCE_S: cli('turnresistanceS', 'Power', same('value')),
  PKT_ACK_CANNON: cli('ackCannon', 'MapAck', { loops: 'loopsAck', num: 'num' }),
  PKT_ACK_FUEL: cli('ackFuel', 'MapAck', { loops: 'loopsAck', num: 'num' }),
  PKT_ACK_TARGET: cli('ackTarget', 'MapAck', { loops: 'loopsAck', num: 'num' }),
  PKT_ACK_POLYSTYLE: cli('ackPolystyle', 'MapAck', { loops: 'loopsAck', num: 'num' }),
  PKT_TALK: cli('talk', 'Talk', same('seq', 'str')),
  PKT_DISPLAY: cli('display', 'Display', { width: 'width', height: 'height', debris_colors: 'debrisColors', spark_rand: 'sparkRand' }),
  PKT_MODIFIERBANK: cli('modifierBank', 'ModifierBank', same('bank', 'str')),
  PKT_MOTD: cli('motd', 'MotdRequest', same('offset', 'nbytes')),
  PKT_SHAPE: cli('shape', 'Shape', same('shape', 'ext')),
  PKT_POINTER_MOVE: cli('pointerMove', 'PointerMove', same('movement')),
  PKT_REQUEST_AUDIO: cli('requestAudio', 'RequestAudio', same('on')),
  PKT_ASYNC_FPS: cli('asyncFps', 'AsyncFps', same('fps')),
};
// The server's PKT_MOTD and PKT_QUIT share their numbers with the client's: these keys tell them apart.
export const RELIABLE_ALIAS: Record<string, string> = { PKT_MOTD: 'PKT_MOTD_DATA', PKT_QUIT: 'PKT_QUIT_REASON' };

/** the setup header (netserver.c Handle_setup) -> Setup; its map_data is parsed (parseMapData) */
export const SETUP_FIELDS: Record<string, string> = {
  mode: 'mode', lives: 'lives', width: 'width', height: 'height', frames_per_second: 'framesPerSecond',
  name: 'name', author: 'author', data_url: 'dataUrl',
};
/** the Setup fields parseMapData fills from map_data */
export const MAP_DATA_FIELDS = ['pstyles', 'estyles', 'bstyles', 'polygons', 'bases', 'fuels', 'checks'];

/** recorded fields that only repeat what the schema has otherwise (list lengths, the key names) */
export const DERIVED: Record<string, string[]> = {
  PKT_KEYBOARD: ['keys'], PKT_FASTRADAR: ['n'], PKT_DEBRIS: ['n'], PKT_FASTSHOT: ['n'], PKT_MOTD_DATA: ['len'],
  SETUP: ['map_data_len'],
};

/** what the core replaces (the header of protocol/games/xpilot.capnp): not in the schema */
export const TRANSPORT: Record<string, string> = {
  PKT_RELIABLE: 'the reliable stream chunk (len, rel, rel_loops); the packets in it are Msg.reliable and Msg.setup',
  PKT_ACK: "the client's ack of the reliable stream (rel, rel_loops); the core's relay is reliable",
  PKT_MAGIC: "the connection's magic word after PKT_VERIFY",
  CONTACT_pack: 'the contact socket; rooms replace it',
  ENTER_QUEUE_pack: 'the contact socket and its queue; its host and team go into Verify',
  ENTER_GAME_pack: 'the contact socket: the login port',
  REPORT_STATUS_pack: 'the contact socket',
  contact_request: 'the contact socket',
  contact_reply: 'the contact socket',
  meta: 'the meta server reports (metaserver.c); the room list replaces them',
};

/** the converted fields: the recorded value -> the schema value */
export const CONVERTED = {
  keyv: (hex: string): boolean[] => {
    const b = Buffer.from(hex, 'hex');
    if (b.length !== 9) throw new Error(`keyv of ${b.length} bytes`);
    return Array.from({ length: 72 }, (_, k) => (b[k >> 3] & (1 << (k & 7))) !== 0); // bit.h BITV_SET
  },
  xy: (flat: number[]): Plain[] => Array.from({ length: flat.length / 2 }, (_, i) => ({ x: flat[2 * i], y: flat[2 * i + 1] })),
  blips: (flat: number[]): Plain[] =>
    Array.from({ length: flat.length / 3 }, (_, i) => ({ x: flat[3 * i], y: flat[3 * i + 1], size: flat[3 * i + 2] })),
};

export type Plain = { [field: string]: number | boolean | string | Plain | Plain[] | number[] | boolean[] };
/** a Msg as plain values: `client`/`reliable` are [member, struct or null for Void] in order;
 * `frame` is member -> struct or list (and packetSize) */
export type PlainMsg =
  | { which: 'client'; packets: [string, Plain | null][] }
  | { which: 'reliable'; packets: [string, Plain][] }
  | { which: 'frame'; frame: Plain }
  | { which: 'setup'; setup: Plain };

const take = (p: Pkt, fields: Record<string, string>, used: Set<string>): Plain => {
  const out: Plain = {};
  for (const [from, to] of Object.entries(fields)) {
    if (!(from in p)) throw new Error(`${p.pkt} has no recorded ${from}`);
    used.add(from);
    const v = p[from];
    out[to] = from === 'keyv' ? CONVERTED.keyv(v as string) : from === 'xy' ? CONVERTED.xy(v as number[]) : (v as Plain[string]);
  }
  return out;
};

function checkAllUsed(key: string, p: Pkt, used: Set<string>): void {
  for (const k of Object.keys(p)) {
    if (k === 'pkt' || used.has(k)) continue;
    if (!(DERIVED[key] ?? []).includes(k)) throw new Error(`${p.pkt}: recorded field ${k} is not mapped`);
  }
  if (key === 'PKT_FASTRADAR' && (p.n as number) * 3 !== (p.blips as number[]).length) throw new Error('fastradar n');
  if ((key === 'PKT_DEBRIS' || key === 'PKT_FASTSHOT') && (p.n as number) * 2 !== (p.xy as number[]).length) throw new Error(`${key} n`);
  if (key === 'PKT_MOTD_DATA' && p.len !== (p.data as string).length) throw new Error('motd len');
  if (key === 'PKT_KEYBOARD') {
    const keys = CONVERTED.keyv(p.keyv as string).filter((x) => x).length;
    if (keys !== (p.keys as string[]).length) throw new Error('keyboard keys');
  }
}

/** The setup's map data (walls.c Polys_to_client) as the schema's Setup fields; throws unless every
 * byte is used. */
export function parseMapData(hex: string): Plain {
  const b = Buffer.from(hex, 'hex');
  let o = 0;
  const u8 = () => b[o++];
  const i8 = () => (b[o++] << 24) >> 24;
  const u16 = () => (o += 2, b.readUInt16BE(o - 2));
  const i16 = () => (o += 2, b.readInt16BE(o - 2));
  const u32 = () => (o += 4, b.readUInt32BE(o - 4));
  const np = u8(), ne = u8(), nb = u8();
  const pstyles = Array.from({ length: np }, () => ({ color: u32(), textureId: u8(), defedgeId: u8(), flags: u8() }));
  const estyles = Array.from({ length: ne }, () => ({ width: i8(), color: u32(), style: u8() }));
  const bstyles = Array.from({ length: nb }, () => {
    const e = b.indexOf(0, o);
    const filename = b.toString('latin1', o, e);
    o = e + 1;
    return { filename, flags: u8() };
  });
  const polygons = Array.from({ length: u16() }, () => {
    const style = u8();
    const nech = u16();
    if (nech % 2) throw new Error('odd num_echanges');
    const ech = Array.from({ length: nech / 2 }, () => ({ point: u16(), style: u16() }));
    const npts = u16();
    const x = u16(), y = u16();
    const edges = Array.from({ length: npts - 1 }, () => ({ dx: i16(), dy: i16() }));
    return { style, x, y, edges, estyles: ech };
  });
  const bases = Array.from({ length: u8() }, () => ({ team: u8(), x: u16(), y: u16(), dir: u8() }));
  const fuels = Array.from({ length: u16() }, () => ({ x: u16(), y: u16() }));
  const checks = Array.from({ length: u8() }, () => ({ x: u16(), y: u16() }));
  if (o !== b.length) throw new Error(`map data: ${b.length - o} bytes left`);
  return { pstyles, estyles, bstyles, polygons, bases, fuels, checks } as unknown as Plain;
}

/** Setup's map fields written back as Polys_to_client writes them (to show parseMapData loses nothing) */
export function encodeMapData(s: Plain): string {
  const out: number[] = [];
  const u8 = (v: number) => out.push(v & 0xff);
  const u16 = (v: number) => out.push((v >> 8) & 0xff, v & 0xff);
  const u32 = (v: number) => out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
  const L = (k: string) => s[k] as Plain[];
  u8(L('pstyles').length); u8(L('estyles').length); u8(L('bstyles').length);
  for (const p of L('pstyles')) { u32(p.color as number); u8(p.textureId as number); u8(p.defedgeId as number); u8(p.flags as number); }
  for (const e of L('estyles')) { u8(e.width as number); u32(e.color as number); u8(e.style as number); }
  for (const t of L('bstyles')) { for (const c of Buffer.from(t.filename as string, 'latin1')) u8(c); u8(0); u8(t.flags as number); }
  u16(L('polygons').length);
  for (const p of L('polygons')) {
    const ech = p.estyles as Plain[], edges = p.edges as Plain[];
    u8(p.style as number); u16(ech.length * 2);
    for (const c of ech) { u16(c.point as number); u16(c.style as number); }
    u16(edges.length + 1); u16(p.x as number); u16(p.y as number);
    for (const e of edges) { u16(e.dx as number); u16(e.dy as number); }
  }
  u8(L('bases').length);
  for (const t of L('bases')) { u8(t.team as number); u16(t.x as number); u16(t.y as number); u8(t.dir as number); }
  u16(L('fuels').length);
  for (const f of L('fuels')) { u16(f.x as number); u16(f.y as number); }
  u8(L('checks').length);
  for (const c of L('checks')) { u16(c.x as number); u16(c.y as number); }
  return Buffer.from(out).toString('hex');
}

/** Turns one client's recorded datagrams into schema messages (it keeps what ENTER_QUEUE_pack told
 * the server for Verify). Every packet is mapped or is transport; anything else throws. */
export class SchemaMapper {
  private verify = new Map<string, { host: string; team: number }>();
  transport = new Map<string, number>();

  messages(d: Datagram): PlainMsg[] {
    const note = (name: string) => this.transport.set(name, (this.transport.get(name) ?? 0) + 1);
    if (d.dir === 'meta') { note('meta'); return []; }
    const nick = (d.dir === 's2c' ? d.to : d.from)!;
    if (d.sock === 'contact') {
      for (const p of d.pkts ?? []) {
        if (!(p.pkt in TRANSPORT)) throw new Error(`contact packet ${p.pkt}`);
        note(p.pkt);
        if (d.dir === 'c2s' && p.pkt === 'ENTER_QUEUE_pack') this.verify.set(nick, { host: p.host as string, team: p.team as number });
      }
      return [];
    }
    const out: PlainMsg[] = [];
    if (d.dir === 'c2s') {
      const packets: [string, Plain | null][] = [];
      for (const p of d.pkts ?? []) {
        if (p.pkt in TRANSPORT) { note(p.pkt); continue; }
        const m = SCHEMA_MAP[p.pkt];
        if (!m || m.to !== 'client') throw new Error(`client packet ${p.pkt} has no place in the schema`);
        const used = new Set<string>();
        let v: Plain | null = m.struct ? take(p, m.fields, used) : null;
        if (p.pkt === 'PKT_VERIFY') {
          const q = this.verify.get(nick);
          if (!q) throw new Error('PKT_VERIFY without ENTER_QUEUE_pack');
          v = { ...v!, host: q.host, team: q.team };
        }
        checkAllUsed(p.pkt, p, used);
        packets.push([m.member, v]);
      }
      if (packets.length) out.push({ which: 'client', packets });
      return out;
    }
    // server to client: a frame (its packets), then the reliable packets the datagram completed
    const pk = d.pkts ?? [];
    if (pk.length && pk[0].pkt === 'PKT_START') {
      const frame: Plain = {};
      for (const p of pk) {
        if (p.pkt === 'PKT_RELIABLE') { note(p.pkt); continue; }
        const m = SCHEMA_MAP[p.pkt];
        if (!m || m.to !== 'frame') throw new Error(`frame packet ${p.pkt} has no place in Frame`);
        const used = new Set<string>();
        if (p.pkt === 'PKT_FASTRADAR') {
          used.add('blips');
          ((frame[m.member] ??= []) as Plain[]).push(...CONVERTED.blips(p.blips as number[]));
        } else if (m.list) {
          ((frame[m.member] ??= []) as Plain[]).push(take(p, m.fields, used));
        } else {
          if (m.member in frame) throw new Error(`two ${p.pkt} in one frame`);
          frame[m.member] = take(p, m.fields, used);
        }
        checkAllUsed(p.pkt, p, used);
      }
      frame.packetSize = d.len;
      out.push({ which: 'frame', frame });
    } else {
      // outside a frame: the reliable chunk, or the PKT_QUIT Destroy_connection sends on its own
      for (const p of pk) {
        if (p.pkt === 'PKT_RELIABLE') { note(p.pkt); continue; }
        if (p.pkt !== 'PKT_QUIT') throw new Error(`a datagram of ${p.pkt} outside a frame`);
        const m = SCHEMA_MAP.PKT_QUIT_REASON;
        const used = new Set<string>();
        out.push({ which: 'reliable', packets: [[m.member, take(p, m.fields, used)]] });
        checkAllUsed('PKT_QUIT_REASON', p, used);
      }
    }
    let reliable: [string, Plain][] = [];
    for (const p of d.rel ?? []) {
      if (p.pkt === 'PKT_MAGIC') { note(p.pkt); continue; }
      if (p.pkt === 'SETUP') {
        if (reliable.length) out.push({ which: 'reliable', packets: reliable });
        reliable = [];
        const used = new Set<string>(['map_data']);
        const setup = { ...take(p, SETUP_FIELDS, used), ...parseMapData(p.map_data as string) };
        if ((p.map_data as string).length !== 2 * (p.map_data_len as number)) throw new Error('map_data_len');
        checkAllUsed('SETUP', p, used);
        out.push({ which: 'setup', setup });
        continue;
      }
      const key = RELIABLE_ALIAS[p.pkt] ?? p.pkt;
      const m = SCHEMA_MAP[key];
      if (!m || m.to !== 'reliable') throw new Error(`reliable packet ${p.pkt} has no place in Reliable`);
      const used = new Set<string>();
      reliable.push([m.member, take(p, m.fields, used)]);
      checkAllUsed(key, p, used);
    }
    if (reliable.length) out.push({ which: 'reliable', packets: reliable });
    return out;
  }
}

// ---- writing and reading the messages with the generated bindings (web/games/xpilot/src/proto) ----

export type SchemaField = { name: string; type: string };
let schemaCache: Map<string, SchemaField[]> | null = null;

/** protocol/games/xpilot.capnp's structs and their fields (union members included), in order */
export function readSchema(): Map<string, SchemaField[]> {
  if (schemaCache) return schemaCache;
  const text = readFileSync(join(import.meta.dirname, '..', '..', '..', '..', 'protocol', 'games', 'xpilot.capnp'), 'utf8');
  const structs = new Map<string, SchemaField[]>();
  let cur: SchemaField[] | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*/, '');
    const s = /^\s*struct\s+(\w+)\s*\{/.exec(line);
    if (s) { cur = []; structs.set(s[1], cur); continue; }
    const f = /^\s*(\w+)\s+@\d+\s*:\s*([\w()]+)\s*;/.exec(line);
    if (f && cur) cur.push({ name: f[1], type: f[2] });
  }
  schemaCache = structs;
  return structs;
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const which = (member: string) => member.replace(/([A-Z])/g, '_$1').toUpperCase();

type AnyObj = Record<string, unknown> & { [k: string]: any };

function hasSetter(o: object, k: string): boolean {
  for (let p = Object.getPrototypeOf(o); p; p = Object.getPrototypeOf(p)) {
    const d = Object.getOwnPropertyDescriptor(p, k);
    if (d) return typeof d.set === 'function';
  }
  return false;
}

/** writes plain values into a struct of the binding; a field the schema does not have throws */
function writeStruct(o: AnyObj, struct: string, v: Plain): void {
  const fields = readSchema().get(struct);
  if (!fields) throw new Error(`no struct ${struct}`);
  for (const [k, x] of Object.entries(v)) {
    const f = fields.find((g) => g.name === k);
    if (!f) throw new Error(`${struct} has no field ${k}`);
    const list = /^List\((\w+)\)$/.exec(f.type);
    if (list) {
      const arr = x as unknown[];
      const init = o[`_init${cap(k)}`];
      if (typeof init !== 'function') throw new Error(`${struct}.${k}: no list in the binding`);
      const l = init.call(o, arr.length);
      const elem = list[1];
      arr.forEach((e, i) => (readSchema().has(elem) ? writeStruct(l.get(i), elem, e as Plain) : l.set(i, e)));
    } else if (readSchema().has(f.type)) {
      writeStruct(o[`_init${cap(k)}`](), f.type, x as Plain);
    } else {
      if (!hasSetter(o, k)) throw new Error(`${struct}.${k}: no setter in the binding`);
      o[k] = x;
    }
  }
}

/** reads a struct of the binding back as plain values (every schema field) */
function readStruct(o: AnyObj, struct: string): Plain {
  const out: Plain = {};
  for (const f of readSchema().get(struct)!) {
    const list = /^List\((\w+)\)$/.exec(f.type);
    if (list) {
      const l = o[f.name];
      out[f.name] = readSchema().has(list[1]) ? [...l].map((e: AnyObj) => readStruct(e, list[1])) : [...l];
    } else if (readSchema().has(f.type)) {
      if (o[`_has${cap(f.name)}`]()) out[f.name] = readStruct(o[f.name], f.type);
    } else out[f.name] = o[f.name];
  }
  return out;
}

/** a plain Msg as a packed Cap'n Proto message, built with the generated bindings */
export function packMsg(m: PlainMsg): Uint8Array {
  return packGame(P.Msg, (root) => {
    const r = root as unknown as AnyObj;
    if (m.which === 'frame') writeStruct(r._initFrame(), 'Frame', m.frame);
    else if (m.which === 'setup') writeStruct(r._initSetup(), 'Setup', m.setup);
    else {
      const l = m.which === 'client' ? r._initClient(m.packets.length) : r._initReliable(m.packets.length);
      const union = m.which === 'client' ? 'ClientPacket' : 'Reliable';
      m.packets.forEach(([member, v], i) => {
        const e = l.get(i) as AnyObj;
        const f = readSchema().get(union)!.find((g) => g.name === member);
        if (!f) throw new Error(`${union} has no member ${member}`);
        if (f.type === 'Void') e[member] = true;
        else writeStruct(e[`_init${cap(member)}`](), f.type, v!);
      });
    }
  });
}

/** a packed Msg read back as plain values (frame members that are absent or empty are left out) */
export function unpackMsg(data: Uint8Array): PlainMsg {
  const r = unpackGame(P.Msg, data) as unknown as AnyObj;
  const w = r.which();
  if (w === P.Msg_Which.FRAME) {
    const f = r.frame as AnyObj;
    const frame: Plain = {};
    for (const g of readSchema().get('Frame')!) {
      const list = /^List\((\w+)\)$/.exec(g.type);
      if (list) {
        if (f[g.name].length) frame[g.name] = [...f[g.name]].map((e: AnyObj) => readStruct(e, list[1]));
      } else if (readSchema().has(g.type)) {
        if (f[`_has${cap(g.name)}`]()) frame[g.name] = readStruct(f[g.name], g.type);
      } else frame[g.name] = f[g.name];
    }
    return { which: 'frame', frame };
  }
  if (w === P.Msg_Which.SETUP) return { which: 'setup', setup: readStruct(r.setup, 'Setup') };
  const client = w === P.Msg_Which.CLIENT;
  const union = client ? 'ClientPacket' : 'Reliable';
  const whichOf = (client ? P.ClientPacket_Which : P.Reliable_Which) as Record<string, number>;
  const packets = [...(client ? r.client : r.reliable)].map((e: AnyObj) => {
    const f = readSchema().get(union)!.find((g) => whichOf[which(g.name)] === e.which())!;
    return [f.name, f.type === 'Void' ? null : readStruct(e[f.name], f.type)] as [string, Plain | null];
  });
  return client ? { which: 'client', packets } : { which: 'reliable', packets: packets as [string, Plain][] };
}

// ---- client goldens ----

/** <nick>.drawidx.txt: per section (a frame "F <loops>", or before the first frame a tick "T <tick>")
 * the calls made, their hash, and the hash of the section as committed ("-": not committed) */
export type DrawIndex = { section: string; calls: number; hash: string; committed: string | null };

export function readDrawIndex(name: string, nick: string): DrawIndex[] {
  return readGz(join(CLIENT_GOLDENS, name, `${nick}.drawidx.txt.gz`))
    .toString('latin1')
    .trim()
    .split('\n')
    .map((l) => {
      const w = l.split(' ');
      const n = w.length;
      return { section: w.slice(0, n - 3).join(' '), calls: Number(w[n - 3]), hash: w[n - 2], committed: w[n - 1] === '-' ? null : w[n - 1] };
    });
}

/** <nick>.draw.txt: "S <section>", then one line per call ("# " lines: input the client got) */
export function readDraw(name: string, nick: string): Map<string, Buffer[]> {
  const secs = new Map<string, Buffer[]>();
  let cur: Buffer[] | null = null;
  for (const l of lines(readGz(join(CLIENT_GOLDENS, name, `${nick}.draw.txt.gz`)))) {
    const s = l.toString('latin1');
    if (s.startsWith('S ')) {
      cur = [];
      secs.set(s.slice(2).trimEnd(), cur);
    } else if (cur) cur.push(l);
  }
  return secs;
}

// ---- randomMT (src/common/randommt.c) ----

export class RandomMT {
  private state = new Uint32Array(625);
  private next = 0;
  private left = -1;
  seed(seed: number) {
    let x = (seed | 1) >>> 0;
    this.state[0] = x;
    for (let j = 1; j < 624; j++) {
      x = Math.imul(x, 69069) >>> 0;
      this.state[j] = x;
    }
    this.left = 0;
  }
  private reload(): number {
    const s = this.state;
    if (this.left < -1) this.seed(4357);
    this.left = 623;
    this.next = 1;
    const mix = (u: number, v: number) => ((u & 0x80000000) | (v & 0x7fffffff)) >>> 0;
    const step = (a: number, b: number, c: number) => (a ^ (mix(b, c) >>> 1) ^ (c & 1 ? 0x9908b0df : 0)) >>> 0;
    let p0 = 0, p2 = 2, pM = 397, s0 = s[0], s1 = s[1];
    let j = 624 - 397 + 1;
    while (--j) {
      s[p0++] = step(s[pM++], s0, s1);
      s0 = s1;
      s1 = s[p2++];
    }
    pM = 0;
    j = 397;
    while (--j) {
      s[p0++] = step(s[pM++], s0, s1);
      s0 = s1;
      s1 = s[p2++];
    }
    s1 = s[0];
    s[p0] = step(s[pM], s0, s1);
    return temper(s1);
  }
  random(): number {
    if (--this.left < 0) return this.reload();
    return temper(this.state[this.next++]);
  }
  /** math.c rfrac() */
  rfrac(): number {
    return this.random() * 0.00000000023283064365386962890625;
  }
}

function temper(y: number): number {
  y ^= y >>> 11;
  y ^= (y << 7) & 0x9d2c5680;
  y ^= (y << 15) & 0xefc60000;
  return (y ^ (y >>> 18)) >>> 0;
}

// ---- math golden ----

export type MathLine = { fn: string; args: number[]; result: number; text: string };

export const bitsToDouble = (hex: string): number => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt('0x' + hex));
  return b.readDoubleBE(0);
};
export const doubleToBits = (d: number): string => {
  const b = Buffer.alloc(8);
  b.writeDoubleBE(d);
  return b.readBigUInt64BE(0).toString(16).padStart(16, '0');
};

export function readMath(): { mt: Map<string, Map<number, number>>; rfrac: number[]; tblSin: number[]; tblCos: number[]; fns: MathLine[] } {
  const mt = new Map<string, Map<number, number>>();
  const rfrac: number[] = [];
  const tblSin: number[] = [];
  const tblCos: number[] = [];
  const fns: MathLine[] = [];
  for (const l of readGz(join(SERVER_GOLDENS, 'math', 'math.txt.gz')).toString('latin1').trim().split('\n')) {
    const w = l.split(' ');
    if (w[0] === 'mt') {
      if (!mt.has(w[1])) mt.set(w[1], new Map());
      mt.get(w[1])!.set(Number(w[2]), Number(w[3]));
    } else if (w[0] === 'rfrac') rfrac[Number(w[1])] = bitsToDouble(w[2]);
    else if (w[0] === 'tbl_sin') tblSin[Number(w[1])] = bitsToDouble(w[2]);
    else if (w[0] === 'tbl_cos') tblCos[Number(w[1])] = bitsToDouble(w[2]);
    else fns.push({ fn: w[0], args: w.slice(1, -2).map(bitsToDouble), result: bitsToDouble(w[w.length - 2]), text: w[w.length - 1] });
  }
  return { mt, rfrac, tblSin, tblCos, fns };
}
