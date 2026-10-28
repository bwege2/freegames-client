// netclient.c: the client's side of the protocol. What the original reads from UDP datagrams it reads
// here from the game's messages (msg.ts): a frame (its packets in Frame's field order) is one
// datagram, the reliable stream (cbuf) is a queue of the reliable packets and the setup, in order.
// What it writes goes into the write buffer in the original's wire format (net.ts) and leaves as one
// message per flush. The reliable layer's own packets (PKT_RELIABLE, PKT_ACK, PKT_MAGIC) belong to
// the core's transport: an ack still takes its 9 bytes in the write buffer, as in the original, but
// is not sent.
import { G } from './G.ts';
import type { setup_t } from './G.ts';
import { sys } from './sys.ts';
import {
  PKT_VERIFY, PKT_PLAY, PKT_KEYBOARD, PKT_POWER, PKT_POWER_S, PKT_TURNSPEED, PKT_TURNSPEED_S, PKT_TURNRESISTANCE,
  PKT_TURNRESISTANCE_S, PKT_ACK_CANNON, PKT_ACK_FUEL, PKT_ACK_TARGET, PKT_ACK_POLYSTYLE, PKT_TALK, PKT_DISPLAY,
  PKT_MODIFIERBANK, PKT_MOTD, PKT_SHAPE, PKT_POINTER_MOVE, PKT_REQUEST_AUDIO, PKT_ASYNC_FPS, PKT_ACK, PKT_SUCCESS,
  PKT_QUIT, CLIENT_SEND_SIZE, KEYBOARD_SIZE, NUM_MODBANKS, MAX_SUPPORTED_FPS, PACKET_DRAW, PACKET_DROP, PACKET_LOSS,
  MAX_POINTER_MOVES, NUM_ITEMS, MIN_VIEW_SIZE, MAX_VIEW_SIZE, MAX_NAME_LEN, MAX_HOST_LEN, SETUP_MAP_UNCOMPRESSED,
} from './consts.ts';
import { LIMIT, onReset, strlcpy, toInt } from './cutil.ts';
import { newSockbuf, Packet_printf, Sockbuf_append, Sockbuf_clear, Sockbuf_init, clientPackets } from './net.ts';
import { decodeServerMsg, encodeClientMsg, type FrameMsg, type ReliableMsg, type SetupMsg } from './msg.ts';
import { Convert_shape_str, Convert_ship_2_string } from './shipshape.ts';
import {
  Handle_start, Handle_end, Handle_self, Handle_self_items, Handle_modifiers, Handle_refuel, Handle_connector,
  Handle_laser, Handle_missile, Handle_ball, Handle_ship, Handle_mine, Handle_item, Handle_destruct, Handle_shutdown,
  Handle_thrusttime, Handle_shieldtime, Handle_phasingtime, Handle_rounddelay, Handle_fastshot, Handle_debris,
  Handle_wreckage, Handle_asteroid, Handle_wormhole, Handle_polystyle, Handle_ecm, Handle_trans, Handle_paused,
  Handle_appearing, Handle_radar, Handle_fastradar, Handle_damaged, Handle_leave, Handle_player, Handle_team,
  Handle_score, Handle_score_object, Handle_team_score, Handle_timing, Handle_fuel, Handle_cannon, Handle_target,
  Handle_base, Handle_message, Handle_time_left, Handle_eyes,
} from './client.ts';
import { Handle_motd } from './about.ts';
import { Key_update } from './event.ts';
import { executeCommand } from './clientcommand.ts';
import { Handle_audio } from './caudio.ts';
import { warn } from './error.ts';
import { Check_view_dimensions } from './paint.ts';

const TALK_RETRY = 2;
const MAX_MAP_ACK_LEN = 500;
const KEYBOARD_STORE = 20;

/** one datagram: a frame with the reliable packets that came with it, or reliable data alone */
interface Unit {
  frame: FrameMsg | null;
  reliable: CItem[][];
}

/** an item of the reliable stream */
export type CItem = ReliableMsg | { kind: 'setup'; setup: SetupMsg };

interface frame_buf_t { loops: number; unit: Unit | null }

const S = {
  wbuf: newSockbuf(),
  /** the reliable stream not yet read */
  cbuf: [] as CItem[],
  /** the datagram being processed */
  rbuf: null as Unit | null,
  Frames: [] as frame_buf_t[],
  keyboard_delta: 0,
  last_send_anything: 0,
  last_keyboard_change: 0,
  last_keyboard_update: 0,
  reliable_offset: 0,
  talk_pending: 0,
  talk_sequence_num: 0,
  talk_last_send: 0,
  keyboard_change: new Int32Array(KEYBOARD_STORE),
  keyboard_update: new Int32Array(KEYBOARD_STORE),
  keyboard_acktime: new Int32Array(KEYBOARD_STORE),
  talk_str: '',
  initialized: false,
};

onReset(() => {
  Object.assign(S, {
    wbuf: newSockbuf(), cbuf: [], rbuf: null, Frames: [], keyboard_delta: 0, last_send_anything: 0, last_keyboard_change: 0,
    last_keyboard_update: 0, reliable_offset: 0, talk_pending: 0, talk_sequence_num: 0, talk_last_send: 0,
    keyboard_change: new Int32Array(KEYBOARD_STORE), keyboard_update: new Int32Array(KEYBOARD_STORE),
    keyboard_acktime: new Int32Array(KEYBOARD_STORE), talk_str: '', initialized: false,
  });
});

/** the bytes waiting in the write buffer (wbuf.len) */
export const wbufLen = (): number => S.wbuf.len;

// ---------------------------------------------------------------- reading datagrams

/** the next datagram from the server: a frame takes the reliable data queued right behind it */
function readUnit(): Unit | null {
  const data = sys.recv();
  if (!data) return null;
  const m = decodeServerMsg(data);
  const u: Unit = { frame: null, reliable: [] };
  if (m.which === 'frame') u.frame = m.frame;
  else if (m.which === 'reliable') u.reliable.push(m.packets);
  else if (m.which === 'setup') u.reliable.push([{ kind: 'setup', setup: m.setup }]);
  else return u;
  // the reliable data of the same datagram (the server sends it right after the frame)
  for (;;) {
    const next = sys.peek();
    if (!next) break;
    const n = decodeServerMsg(next);
    if (n.which === 'reliable') u.reliable.push(n.packets);
    else if (n.which === 'setup') u.reliable.push([{ kind: 'setup', setup: n.setup }]);
    else break;
    sys.recv();
  }
  return u;
}

/** Receive_reliable for one piece of the stream: into cbuf, and the ack (9 bytes, not sent) */
function Receive_reliable_piece(items: CItem[]): void {
  for (const it of items) S.cbuf.push(it);
  S.reliable_offset += items.length;
  Send_ack(G.last_loops);
}

function Send_ack(rel_loops: number): number {
  const n = Packet_printf(S.wbuf, '%c%ld%ld', PKT_ACK, S.reliable_offset, rel_loops);
  if (n <= 0) {
    if (n === 0) return 0;
    return -1;
  }
  return 1;
}

/** Sockbuf_flush(&wbuf): the buffer as one message (nothing when it held only acks) */
function Sockbuf_flush(): number {
  if (S.wbuf.len === 0 || !S.wbuf.buf) return 0;
  const packets = clientPackets(S.wbuf.buf, S.wbuf.len, { host: G.connectParam.host_name, team: G.connectParam.team });
  const n = S.wbuf.len;
  if (packets.length) sys.send(encodeClientMsg(packets));
  Sockbuf_clear(S.wbuf);
  return n;
}

// ---------------------------------------------------------------- setup and handshake

function setupFromMsg(m: SetupMsg): setup_t {
  // the map data as walls.c Polys_to_client wrote it (client.c init_polymap reads it)
  const out: number[] = [];
  const u8 = (v: number) => out.push(v & 0xff);
  const u16 = (v: number) => out.push((v >> 8) & 0xff, v & 0xff);
  const u32 = (v: number) => out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
  u8(m.pstyles.length); u8(m.estyles.length); u8(m.bstyles.length);
  for (const p of m.pstyles) { u32(p.color); u8(p.textureId); u8(p.defedgeId); u8(p.flags); }
  for (const e of m.estyles) { u8(e.width); u32(e.color); u8(e.style); }
  for (const t of m.bstyles) { for (let i = 0; i < t.filename.length; i++) u8(t.filename.charCodeAt(i)); u8(0); u8(t.flags); }
  u16(m.polygons.length);
  for (const p of m.polygons) {
    u8(p.style); u16(p.estyles.length * 2);
    for (const c of p.estyles) { u16(c.point); u16(c.style); }
    u16(p.edges.length + 1); u16(p.x); u16(p.y);
    for (const e of p.edges) { u16(e.dx); u16(e.dy); }
  }
  u8(m.bases.length);
  for (const t of m.bases) { u8(t.team); u16(t.x); u16(t.y); u8(t.dir); }
  u16(m.fuels.length);
  for (const f of m.fuels) { u16(f.x); u16(f.y); }
  u8(m.checks.length);
  for (const c of m.checks) { u16(c.x); u16(c.y); }
  return {
    map_data_len: out.length, mode: m.mode, lives: m.lives, x: 0, y: 0, width: m.width, height: m.height,
    frames_per_second: m.framesPerSecond, map_order: SETUP_MAP_UNCOMPRESSED, name: strlcpy(m.name, 80), author: strlcpy(m.author, 80),
    data_url: strlcpy(m.dataUrl, 256), map_data: new Uint8Array(out),
  };
}

/** a datagram's reliable pieces into cbuf; a frame before play is skipped (Net_start's "HACK") */
function takeReliable(u: Unit): void {
  for (const r of u.reliable) Receive_reliable_piece(r);
}

/**
 * Net_setup: the setup from the reliable stream. Returns 0, or -1 when the server quits or nothing
 * comes after 10 retries of 2 seconds.
 */
export async function Net_setup(): Promise<number> {
  for (let retries = 0; ;) {
    const i = S.cbuf.findIndex((c) => c.kind === 'setup');
    if (i >= 0) {
      const it = S.cbuf.splice(0, i + 1).pop() as { kind: 'setup'; setup: SetupMsg };
      G.Setup = setupFromMsg(it.setup);
      if (G.Setup.map_data_len <= 0 || G.Setup.width <= 0 || G.Setup.height <= 0) {
        warn(`Got bad map specs from server (${G.Setup.map_data_len},${G.Setup.width},${G.Setup.height})`);
        return -1;
      }
      return 0;
    }
    // wait for more of the reliable stream
    let got = false;
    for (;;) {
      if (retries >= 10) {
        warn(`Can't read setup after ${retries} retries`);
        return -1;
      }
      if (await sys.waitNet(2_000_000)) {
        const u = readUnit();
        if (u) {
          if (!u.frame && !u.reliable.length) continue;
          if (u.frame) {
            warn('Not a reliable packet in setup');
            return -1;
          }
          takeReliable(u);
          Sockbuf_flush();
          got = true;
          break;
        }
      } else retries++;
    }
    if (!got) return -1;
  }
}

/** Net_verify: PKT_VERIFY until the server replies (up to 5 times, every 3 s) */
export async function Net_verify(user_name: string, nick_name: string, disp: string): Promise<number> {
  let retries = 0;
  let last = 0;
  for (;;) {
    if (retries === 0 || sys.time() - last >= 3) {
      if (retries++ >= 5) {
        warn(`Can't connect to server after ${retries} retries`);
        return -1;
      }
      Sockbuf_clear(S.wbuf);
      const n = Packet_printf(S.wbuf, '%c%s%s%s', PKT_VERIFY, user_name, nick_name, disp);
      if (n <= 0 || Sockbuf_flush() <= 0) {
        warn("Can't send verify packet");
        return -1;
      }
      last = sys.time();
    }
    if (!(await sys.waitNet(1_000_000))) continue;
    const u = readUnit();
    if (!u) continue;
    if (u.frame) {
      warn('Bad packet type when verifying');
      return -1;
    }
    if (!u.reliable.length) continue;
    takeReliable(u);
    if (Sockbuf_flush() === -1) return -1;
    if (S.cbuf.length === 0) continue;
    const r = S.cbuf.shift()!;
    if (r.kind === 'quit') {
      warn('Server closed connection');
      return -1;
    }
    if (r.kind !== 'reply') {
      warn("Can't receive verify reply packet");
      return -1;
    }
    if (r.replyto !== PKT_VERIFY) {
      warn(`Verify wrong reply type (${r.replyto})`);
      return -1;
    }
    if (r.result !== PKT_SUCCESS) {
      warn(`Verification failed (${r.result})`);
      return -1;
    }
    // Receive_magic: the core's handshake has no magic word
    break;
  }
  return 0;
}

/** Net_init: the buffers (the core's connection is the socket) */
export function Net_init(): number {
  G.server_display.view_width = 0;
  G.server_display.view_height = 0;
  G.server_display.spark_rand = 0;
  G.server_display.num_spark_colors = 0;
  S.Frames = [];
  for (let i = 0; i < G.receive_window_size; i++) S.Frames.push({ loops: 0, unit: null });
  S.cbuf = [];
  Sockbuf_init(S.wbuf, CLIENT_SEND_SIZE);
  S.reliable_offset = 0;
  S.talk_sequence_num = 0;
  S.talk_pending = 0;
  S.initialized = true;
  return 0;
}

/** Net_cleanup: the quit packet (the original sends it three times on its lossy network) */
export function Net_cleanup(): void {
  if (S.initialized && S.wbuf.buf) sys.send(encodeClientMsg([['quit', null]]));
  S.initialized = false;
  S.Frames = [];
  S.cbuf = [];
  S.wbuf = newSockbuf();
  G.Setup = null;
}

export function Net_key_change(): void {
  S.last_keyboard_change++;
  Key_update();
}

export function Net_flush(): number {
  if (S.wbuf.len === 0) return 0;
  if (G.last_keyboard_ack !== S.last_keyboard_change && S.last_keyboard_update !== G.last_loops) return Key_update();
  Send_talk();
  if (Sockbuf_flush() === -1) return -1;
  Sockbuf_clear(S.wbuf);
  S.last_send_anything = sys.time();
  return 1;
}

/** Net_start: the start packets until the server replies to PKT_PLAY (every 2 s, 10 times) */
export async function Net_start(): Promise<number> {
  let retries = 0;
  let last = 0;
  for (;;) {
    if (retries === 0 || sys.time() - last > 1) {
      if (retries++ >= 10) {
        warn(`Can't start play after ${retries} retries`);
        return -1;
      }
      Sockbuf_clear(S.wbuf);
      if ((retries < 5 && Send_shape(G.shipShape) === -1)
        || Packet_printf(S.wbuf, '%c', PKT_PLAY) <= 0
        || Client_power() === -1
        || (sys.sound && Send_audio_request(1) === -1)
        || Client_fps_request() === -1
        || Sockbuf_flush() === -1) {
        warn("Can't send start play packet");
        return -1;
      }
      last = sys.time();
    }
    while (S.cbuf.length <= 0 && (await sys.waitNet(2_000_000))) {
      const u = readUnit();
      if (!u) continue;
      // a frame before the reply is skipped, its reliable data kept (netclient.c "abusing unexpected frame")
      if (!u.reliable.length) continue;
      takeReliable(u);
      if (Sockbuf_flush() === -1) return -1;
    }
    if (S.cbuf.length <= 0) continue;
    const r = S.cbuf[0];
    if (r.kind === 'quit') {
      warn('Server closed connection');
      return -1;
    }
    if (r.kind !== 'reply') {
      warn('Not a reply packet after play');
      return -1;
    }
    S.cbuf.shift();
    if (r.replyto !== PKT_PLAY) {
      warn("Can't receive reply packet after play");
      return -1;
    }
    if (r.result !== PKT_SUCCESS) {
      warn(`Start play not allowed (${r.result})`);
      return -1;
    }
    break;
  }
  G.packet_measure = null;
  G.packetMeasurement = true;
  Net_init_measurement();
  Net_init_lag_measurement();
  return 0;
}

export function Net_init_measurement(): void {
  G.packet_loss = 0;
  G.packet_drop = 0;
  G.packet_loop = 0;
  if (G.packetMeasurement) {
    if (G.packet_measure === null) G.packet_measure = new Uint8Array(MAX_SUPPORTED_FPS).fill(PACKET_DRAW);
  } else G.packet_measure = null;
}

export function Net_init_lag_measurement(): void {
  G.packet_lag = 0;
  S.keyboard_delta = 0;
  for (let i = 0; i < KEYBOARD_STORE; i++) {
    S.keyboard_change[i] = -1;
    S.keyboard_update[i] = -1;
    S.keyboard_acktime[i] = -1;
  }
}

// ---------------------------------------------------------------- frames

/** Net_packet: the frame's packets, then the reliable stream as far as it goes */
function Net_packet(): number {
  const u = S.rbuf!;
  if (u.frame) {
    const r = Receive_frame(u.frame);
    if (r === -1) return -1;
  }
  for (const piece of u.reliable) Receive_reliable_piece(piece);
  while (S.cbuf.length) {
    const it = S.cbuf.shift()!;
    if (it.kind === 'reply') {
      warn(`Got reply packet (${it.replyto},${it.result})`);
      continue;
    }
    if (it.kind === 'setup') continue;
    if (Receive_reliable_item(it) === -1) return -1;
  }
  return 0;
}

function Net_keyboard_track(): void {
  let ind = -1;
  let maxtime = 0;
  for (let i = 0; i < KEYBOARD_STORE; i++) if (S.keyboard_change[i] === S.last_keyboard_change) return;
  for (let i = 0; i < KEYBOARD_STORE; i++) {
    if (S.keyboard_change[i] === -1 || S.keyboard_acktime[i] !== -1) {
      ind = i;
      break;
    }
  }
  if (ind === -1) {
    for (let i = 0; i < KEYBOARD_STORE; i++) {
      if (S.keyboard_update[i] > maxtime) {
        ind = i;
        maxtime = S.keyboard_update[i];
      }
    }
  }
  if (ind === -1) return;
  S.keyboard_change[ind] = S.last_keyboard_change;
  S.keyboard_update[ind] = S.last_keyboard_update;
  S.keyboard_acktime[ind] = -1;
}

function FPS(): number {
  return G.Setup!.frames_per_second;
}

function Net_measurement(loop: number, status: number): void {
  const pm = G.packet_measure;
  if (pm === null) return;
  let delta = loop - G.packet_loop;
  if (delta < 0) return;
  if (delta >= FPS()) {
    if (G.packet_loop === 0) {
      G.packet_loop = loop - (loop % FPS());
      return;
    }
    G.packet_loop = loop - (loop % FPS());
    G.packet_loss = 0;
    G.packet_drop = 0;
    for (let i = 0; i < FPS(); i++) {
      switch (pm[i]) {
        case PACKET_LOSS:
          G.packet_loss++;
          continue;
        case PACKET_DROP:
          G.packet_drop++;
          break;
        default:
          break;
      }
      pm[i] = PACKET_LOSS;
    }
    delta = loop - G.packet_loop;
  }
  if (pm[delta] !== PACKET_DRAW) pm[delta] = status;
}

function Net_lag_measurement(key_ack: number): void {
  for (let i = 0; i < KEYBOARD_STORE; i++) {
    if (S.keyboard_change[i] === key_ack && S.keyboard_acktime[i] === -1) {
      S.keyboard_acktime[i] = G.last_loops - 1;
      break;
    }
  }
  let num = 0, sum = 0;
  for (let i = 0; i < KEYBOARD_STORE; i++) {
    if (S.keyboard_acktime[i] !== -1) {
      num++;
      sum += S.keyboard_acktime[i] - S.keyboard_update[i];
    }
  }
  if (num !== 0) G.packet_lag = Math.trunc(sum / num);
}

/** Net_read: a new frame (2), something else (1) or nothing (0); old and duplicate frames are dropped */
function Net_read(frame: frame_buf_t): number {
  frame.loops = 0;
  for (;;) {
    const u = readUnit();
    if (!u) {
      frame.unit = null;
      return 0;
    }
    frame.unit = u;
    if (!u.frame) return 1;
    const loop = u.frame.start.frameLoops;
    if (loop > G.last_loops) {
      frame.loops = loop;
      return 2;
    }
    // out of order: dropped (its reliable data goes on)
    takeReliable(u);
  }
}

function dropUnit(f: frame_buf_t): void {
  if (f.unit) takeReliable(f.unit);
  f.unit = null;
  f.loops = 0;
}

export function Net_input(): number {
  const Frames = S.Frames;
  const rws = G.receive_window_size;
  let oldest = 0;
  for (let i = 0; i < rws; i++) {
    const frame = Frames[i];
    if (frame.loops !== 0) {
      if (frame.loops < Frames[oldest].loops || Frames[oldest].loops === 0) oldest = i;
    } else if (frame.unit) {
      break;
    } else {
      const n = Net_read(frame);
      if (n <= 0) {
        if (n === 0) {
          if (i === 0) return 0;
          break;
        } else return n;
      } else if (n === 1) {
        break;
      } else {
        let j: number;
        for (j = i - 1; j >= 0; j--) if (frame.loops === Frames[j].loops) break;
        if (j >= 0) {
          Net_measurement(frame.loops, PACKET_DROP);
          dropUnit(frame);
          i--;
          continue;
        }
        if (frame.loops < Frames[oldest].loops) oldest = i;
      }
    }
    if (i === rws - 1 && i > 0) {
      if (Frames[oldest].loops < frame.loops) {
        const tmp = { ...Frames[oldest] };
        Object.assign(Frames[oldest], frame);
        Object.assign(frame, tmp);
      }
      Net_measurement(frame.loops, PACKET_DROP);
      dropUnit(frame);
      oldest = 0;
      i = -1;
      continue;
    }
  }
  let last = 0;
  oldest = 0;
  let num_buffered_packets = 1;
  for (let i = 1; i < rws; i++, last++) {
    const frame = Frames[i];
    if (frame.loops === 0) {
      if (frame.unit) {
        num_buffered_packets++;
        continue;
      } else break;
    } else {
      num_buffered_packets++;
      if (frame.loops < Frames[oldest].loops || Frames[oldest].loops === 0) oldest = i;
    }
  }
  if (!Frames[oldest].unit) {
    if (Frames[oldest].loops > 0) {
      warn('bug netclient.c');
      Frames[oldest].loops = 0;
    }
    return 0;
  }
  S.rbuf = Frames[oldest].unit;
  const n = Net_packet();
  if (last !== oldest) {
    const tmp = { ...Frames[oldest] };
    Object.assign(Frames[oldest], Frames[last]);
    Object.assign(Frames[last], tmp);
  }
  Frames[last].unit = null;
  Frames[last].loops = 0;
  S.rbuf = null;
  if (n === -1) return -1;
  const time_now = sys.time();
  if ((G.last_keyboard_ack !== S.last_keyboard_change && S.last_keyboard_update < G.last_loops) || time_now - S.last_send_anything > 5) {
    Key_update();
    S.last_send_anything = time_now;
  } else Net_flush();
  return num_buffered_packets;
}

/** the frame's packets in the order of the Frame struct (netclient.c receive_tbl, one handler each) */
function Receive_frame(f: FrameMsg): number {
  if (Receive_start(f) <= 0) return 0;
  if (f.timeLeft) Handle_time_left(f.timeLeft.sec);
  if (f.damaged) Handle_damaged(f.damaged.damaged);
  if (f.self) Receive_self(f, f.self);
  if (f.selfItems) {
    const num_items = new Uint8Array(NUM_ITEMS);
    let mask = f.selfItems.itemMask >>> 0;
    let k = 0;
    for (let i = 0; mask !== 0; i++) {
      if (mask & (1 << i)) {
        mask = (mask ^ (1 << i)) >>> 0;
        if (k < f.selfItems.counts.length) {
          if (i < NUM_ITEMS) num_items[i] = f.selfItems.counts[k];
          k++;
        }
      }
    }
    Handle_self_items(num_items);
  }
  if (f.modifiers) Handle_modifiers(strlcpy(f.modifiers.mods, 80));
  if (f.thrusttime) Handle_thrusttime(f.thrusttime.count, f.thrusttime.max);
  if (f.shieldtime) Handle_shieldtime(f.shieldtime.count, f.shieldtime.max);
  if (f.destruct) Handle_destruct(f.destruct.count);
  if (f.phasingtime) Handle_phasingtime(f.phasingtime.count, f.phasingtime.max);
  if (f.shutdown) Handle_shutdown(f.shutdown.count, f.shutdown.delay);
  for (const t of f.targets) {
    Handle_target(t.num, t.deadTicks, t.damage / 256.0);
    if (S.wbuf.len < MAX_MAP_ACK_LEN) Packet_printf(S.wbuf, '%c%ld%hu', PKT_ACK_TARGET, G.last_loops, t.num);
  }
  for (const c of f.cannons) {
    Handle_cannon(c.num, c.deadTicks);
    if (S.wbuf.len < MAX_MAP_ACK_LEN) Packet_printf(S.wbuf, '%c%ld%hu', PKT_ACK_CANNON, G.last_loops, c.num);
  }
  for (const c of f.fuels) {
    if (Handle_fuel(c.num, c.fuel) === -1) return -1;
    if (S.wbuf.len < MAX_MAP_ACK_LEN) Packet_printf(S.wbuf, '%c%ld%hu', PKT_ACK_FUEL, G.last_loops, c.num);
  }
  for (const p of f.polystyles) {
    Handle_polystyle(p.polyind, p.newstyle);
    if (S.wbuf.len < MAX_MAP_ACK_LEN) Packet_printf(S.wbuf, '%c%ld%hu', PKT_ACK_POLYSTYLE, G.last_loops, p.polyind);
  }
  for (const w of f.wreckages) Handle_wreckage(w.x, w.y, w.wrtype, w.size, w.rot);
  for (const a of f.asteroids) Handle_asteroid(a.x, a.y, (a.typeSize >> 4) & 0x0f, a.typeSize & 0x0f, a.rot);
  for (const m of f.missiles) Handle_missile(m.x, m.y, m.len, m.dir);
  for (const b of f.balls) Handle_ball(b.x, b.y, b.id, b.style);
  for (const m of f.mines) Handle_mine(m.x, m.y, m.teammine, m.id);
  for (const it of f.items) if (it.type < NUM_ITEMS) Handle_item(it.x, it.y, it.type);
  for (const l of f.lasers) Handle_laser(l.color, l.x, l.y, l.len, l.dir);
  for (const e of f.ecms) Handle_ecm(e.x, e.y, e.size);
  for (const t of f.trans) Handle_trans(t.x1, t.y1, t.x2, t.y2);
  for (const c of f.connectors) Handle_connector(c.x1, c.y1, c.x2, c.y2, c.tractor);
  for (const p of f.paused) Handle_paused(p.x, p.y, p.count);
  for (const a of f.appearing) Handle_appearing(a.x, a.y, a.id, a.count);
  for (const s of f.ships) {
    const fl = s.flags;
    Handle_ship(s.x, s.y, s.id, s.dir, (fl & 1) !== 0 ? 1 : 0, (fl & 2) !== 0 ? 1 : 0, (fl & 4) !== 0 ? 1 : 0, (fl & 8) !== 0 ? 1 : 0, (fl & 0x10) !== 0 ? 1 : 0);
  }
  for (const r of f.refuels) Handle_refuel(r.x1, r.y1, r.x2, r.y2);
  for (const r of f.radar) Handle_radar(r.x, r.y, r.size);
  for (const r of f.fastradar) Handle_fastradar(r.x, r.y, r.size);
  if (f.loseitem) G.lose_item = (f.loseitem.loseItemIndex << 24) >> 24;
  for (const d of f.debris) {
    if (d.xy.length <= 0) continue;
    Handle_debris(d.type, d.xy);
  }
  for (const d of f.fastshots) {
    if (d.xy.length <= 0) continue;
    Handle_fastshot(d.type, d.xy);
  }
  for (const a of f.audio) Handle_audio(a.type, a.vol);
  if (f.eyes) Handle_eyes(f.eyes.id);
  for (const w of f.wormholes) Handle_wormhole(w.x, w.y);
  if (f.rounddelay) Handle_rounddelay(f.rounddelay.count, f.rounddelay.max);
  Receive_end(f);
  return 1;
}

function Receive_start(f: FrameMsg): number {
  const loops_num = f.start.frameLoops;
  const key_ack = f.start.lastKeyChange;
  if (G.last_loops >= loops_num) {
    Net_measurement(loops_num, PACKET_DROP);
    return 0;
  }
  G.last_loops = loops_num;
  if (key_ack > G.last_keyboard_ack) {
    if (key_ack > S.last_keyboard_change) return 0;
    G.last_keyboard_ack = key_ack;
  }
  Net_lag_measurement(key_ack);
  if (Handle_start(loops_num) === -1) return -1;
  return 1;
}

function Receive_end(f: FrameMsg): number {
  Net_measurement(f.end.frameLoops, PACKET_DRAW);
  if (Handle_end(f.end.frameLoops) === -1) return -1;
  return 1;
}

function Receive_self(f: FrameMsg, s: NonNullable<FrameMsg['self']>): void {
  const num_items = new Uint8Array(NUM_ITEMS);
  G.server_display.view_width = s.viewWidth;
  G.server_display.view_height = s.viewHeight;
  G.server_display.view_width = LIMIT(G.server_display.view_width, MIN_VIEW_SIZE, MAX_VIEW_SIZE);
  if (s.viewWidth !== G.server_display.view_width) warn('unsupported view width from server');
  G.server_display.view_height = LIMIT(G.server_display.view_height, MIN_VIEW_SIZE, MAX_VIEW_SIZE);
  if (s.viewHeight !== G.server_display.view_height) warn('unsupported view height from server');
  G.server_display.num_spark_colors = s.debrisColors;
  Handle_self(s.x, s.y, s.vx, s.vy, s.dir, s.power, s.turnspeed, s.turnresistance / 255.0, s.lockId, s.lockDist, s.lockDir,
    s.check, s.autopilotlight, num_items, s.fuelCurrent, s.fuelSum, s.fuelMax, f.packetSize, s.status);
}

// ---------------------------------------------------------------- the reliable stream

function Receive_reliable_item(r: ReliableMsg): number {
  switch (r.kind) {
    case 'motd': Handle_motd(r.off, r.data, r.data.length, r.size); return 1;
    case 'message': return Handle_message(r.msg) === -1 ? -1 : 1;
    case 'teamScore': return Handle_team_score(r.team, r.score / 100) === -1 ? -1 : 1;
    case 'player':
      return Handle_player(r.id, r.team, r.mychar, strlcpy(r.name, MAX_NAME_LEN), strlcpy(r.username, MAX_NAME_LEN),
        strlcpy(r.hostname, MAX_HOST_LEN), r.shape + r.ext, r.himself) === -1 ? -1 : 1;
    case 'team': return Handle_team(r.id, r.team) === -1 ? -1 : 1;
    case 'score': return Handle_score(r.id, r.score / 100, r.life, r.mychar, r.alliance) === -1 ? -1 : 1;
    case 'timing': {
      const nc = G.num_checks;
      const check = nc ? r.timing % nc : 0;
      const round = nc ? Math.trunc(r.timing / nc) : 0;
      return Handle_timing(r.id, check, round, G.last_loops) === -1 ? -1 : 1;
    }
    case 'leave': return Handle_leave(r.id) === -1 ? -1 : 1;
    case 'war': case 'seek': case 'string': return 1;
    case 'base': return Handle_base(r.id, r.num) === -1 ? -1 : 1;
    case 'quit':
      warn(`Got quit packet: "${r.reason}"`);
      return -1;
    case 'scoreObject': return Handle_score_object(r.score / 100, r.x, r.y, strlcpy(r.string, 80)) === -1 ? -1 : 1;
    case 'talkAck':
      if (r.seq >= S.talk_pending) S.talk_pending = 0;
      return 1;
    case 'reply':
      return 1;
  }
}

// ---------------------------------------------------------------- sending

export function Net_ask_for_motd(offset: number, maxlen: number): number {
  if (offset < 0 || maxlen <= 0) {
    warn(`Bad motd request (${offset}, ${maxlen})`);
    return -1;
  }
  if (Packet_printf(S.wbuf, '%c%ld%ld', PKT_MOTD, offset, maxlen) <= 0) {
    warn("Can't ask motd");
    return -1;
  }
  return 0;
}

export function Send_keyboard(keyboard_vector: Uint8Array): number {
  const size = KEYBOARD_SIZE;
  if (S.wbuf.size - S.wbuf.len < size + 1 + 4) return 0;
  Packet_printf(S.wbuf, '%c%ld', PKT_KEYBOARD, S.last_keyboard_change);
  Sockbuf_append(S.wbuf, keyboard_vector.subarray(0, size));
  S.last_keyboard_update = G.last_loops;
  Net_keyboard_track();
  Send_talk();
  if (Sockbuf_flush() === -1) {
    warn("Can't send keyboard update");
    return -1;
  }
  return 0;
}

export function Send_shape(str: string | null): number {
  const w = Convert_shape_str(str);
  const [buf, ext] = Convert_ship_2_string(w, 0x3200);
  if (Packet_printf(S.wbuf, '%c%S', PKT_SHAPE, buf) <= 0) return -1;
  if (Packet_printf(S.wbuf, '%S', ext) <= 0) return -1;
  return 0;
}

const sendSetting = (pkt: number, v: number) => (Packet_printf(S.wbuf, '%c%hd', pkt, toInt(v * 256.0)) === -1 ? -1 : 0);
export const Send_power = (v: number): number => sendSetting(PKT_POWER, v);
export const Send_power_s = (v: number): number => sendSetting(PKT_POWER_S, v);
export const Send_turnspeed = (v: number): number => sendSetting(PKT_TURNSPEED, v);
export const Send_turnspeed_s = (v: number): number => sendSetting(PKT_TURNSPEED_S, v);
export const Send_turnresistance = (v: number): number => sendSetting(PKT_TURNRESISTANCE, v);
export const Send_turnresistance_s = (v: number): number => sendSetting(PKT_TURNRESISTANCE_S, v);

export function Net_talk(str: string): number {
  S.talk_str = strlcpy(str, 80);
  if (S.talk_str[0] === '\\') executeCommand(S.talk_str.slice(1));
  else {
    S.talk_pending = ++S.talk_sequence_num;
    S.talk_last_send = G.last_loops - TALK_RETRY;
    Send_talk();
  }
  return 0;
}

export function Send_talk(): number {
  if (S.talk_pending === 0) return 0;
  if (G.last_loops - S.talk_last_send < TALK_RETRY) return 0;
  if (Packet_printf(S.wbuf, '%c%ld%s', PKT_TALK, S.talk_pending, S.talk_str) === -1) return -1;
  S.talk_last_send = G.last_loops;
  return 0;
}

export function Send_display(width: number, height: number, sparks: number, spark_colors: number): number {
  if (width === G.server_display.view_width && height === G.server_display.view_height
    && spark_colors === G.server_display.num_spark_colors && sparks === G.server_display.spark_rand && G.last_loops !== 0) return 0;
  if (Packet_printf(S.wbuf, '%c%hd%hd%c%c', PKT_DISPLAY, width, height, spark_colors, sparks) === -1) return -1;
  G.server_display.spark_rand = sparks;
  return 0;
}

export function Send_modifier_bank(bank: number): number {
  if (bank < 0 || bank >= NUM_MODBANKS) return -1;
  if (Packet_printf(S.wbuf, '%c%c%s', PKT_MODIFIERBANK, bank, G.modBankStr[bank]) === -1) return -1;
  return 0;
}

let pointerTotal = 0;
onReset(() => { pointerTotal = 0; });

export function Send_pointer_move(movement: number): number {
  if (G.dirPrediction) {
    const pm = G.pointer_moves[G.pointer_move_next];
    pm.movement = movement;
    pm.turnspeed = G.turnspeed;
    pm.id = S.last_keyboard_change + 1;
    G.pointer_move_next++;
    if (G.pointer_move_next >= MAX_POINTER_MOVES) G.pointer_move_next = 0;
  }
  if (G.version >= 0x4f13) {
    pointerTotal += movement;
    movement = pointerTotal;
  }
  if (Packet_printf(S.wbuf, '%c%hd', PKT_POINTER_MOVE, movement) === -1) return -1;
  if (G.dirPrediction) Net_key_change();
  return 0;
}

export function Send_audio_request(on: number): number {
  if (Packet_printf(S.wbuf, '%c%c', PKT_REQUEST_AUDIO, on !== 0 ? 1 : 0) === -1) return -1;
  return 0;
}

export function Send_fps_request(fps: number): number {
  if (Packet_printf(S.wbuf, '%c%c', PKT_ASYNC_FPS, fps) === -1) return -1;
  return 0;
}

// client.c, here because they write the start packets

export function Client_fps_request(): number {
  G.maxFPS = LIMIT(G.maxFPS, 1, MAX_SUPPORTED_FPS);
  G.oldMaxFPS = G.maxFPS;
  return Send_fps_request(G.maxFPS);
}

export function Client_power(): number {
  if (Send_power(G.power) === -1 || Send_power_s(G.power_s) === -1 || Send_turnspeed(G.turnspeed) === -1
    || Send_turnspeed_s(G.turnspeed_s) === -1 || Send_turnresistance(G.turnresistance) === -1
    || Send_turnresistance_s(G.turnresistance_s) === -1) return -1;
  if (Check_view_dimensions() === -1) return -1;
  for (let i = 0; i < NUM_MODBANKS; i++) if (Send_modifier_bank(i) === -1) return -1;
  return 0;
}

export { PKT_QUIT };
