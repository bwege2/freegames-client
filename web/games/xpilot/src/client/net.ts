// common/net.c, the client's part: the write buffer (wbuf) and Packet_printf in the original's wire
// format, so every size decision of netclient.c (a full buffer, MAX_MAP_ACK_LEN, an empty buffer
// that is not flushed) is the original's. When the buffer is flushed its bytes are read back as
// the schema's ClientPackets (msg.ts); the transport packets the core replaces (PKT_ACK) are left out.
import { SOCKBUF_WRITE_SPARE, MAX_CHARS, MSG_LEN, PKT_VERIFY, PKT_PLAY, PKT_QUIT, PKT_KEYBOARD, PKT_POWER, PKT_POWER_S,
  PKT_TURNSPEED, PKT_TURNSPEED_S, PKT_TURNRESISTANCE, PKT_TURNRESISTANCE_S, PKT_ACK_CANNON, PKT_ACK_FUEL, PKT_ACK_TARGET,
  PKT_ACK_POLYSTYLE, PKT_TALK, PKT_DISPLAY, PKT_MODIFIERBANK, PKT_MOTD, PKT_SHAPE, PKT_POINTER_MOVE, PKT_REQUEST_AUDIO,
  PKT_ASYNC_FPS, PKT_ACK, KEYBOARD_SIZE } from './consts.ts';
import type { ClientMsg } from './msg.ts';

export interface sockbuf_t {
  /** null until Sockbuf_init (Packet_printf then fails, as on the original's zeroed globals) */
  buf: Uint8Array | null;
  size: number;
  len: number;
}

export const newSockbuf = (): sockbuf_t => ({ buf: null, size: 0, len: 0 });

export function Sockbuf_init(sb: sockbuf_t, size: number): void {
  sb.buf = new Uint8Array(size);
  sb.size = size;
  sb.len = 0;
}

export function Sockbuf_clear(sb: sockbuf_t): void {
  sb.len = 0;
}

/**
 * Packet_printf for the formats the client writes: %c %d %u %hd %hu %ld %lu %s %S. Returns the bytes
 * written, 0 when the datagram buffer is full (nothing is written), -1 before Sockbuf_init.
 */
export function Packet_printf(sb: sockbuf_t, fmt: string, ...args: (number | string)[]): number {
  if (!sb.buf) return -1;
  const end = sb.size - SOCKBUF_WRITE_SPARE;
  let p = sb.len;
  let a = 0;
  const b = sb.buf;
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== '%') return -1;
    const c = fmt[++i];
    if (c === 'c') {
      if (p + 1 >= end) return 0;
      b[p++] = Number(args[a++]) & 0xff;
    } else if (c === 'd' || c === 'u') {
      if (p + 4 >= end) return 0;
      const v = Number(args[a++]) | 0;
      b[p++] = (v >>> 24) & 0xff; b[p++] = (v >>> 16) & 0xff; b[p++] = (v >>> 8) & 0xff; b[p++] = v & 0xff;
    } else if (c === 'h') {
      if (p + 2 >= end) return 0;
      i++;
      const v = Number(args[a++]) | 0;
      b[p++] = (v >>> 8) & 0xff; b[p++] = v & 0xff;
    } else if (c === 'l') {
      if (p + 4 >= end) return 0;
      i++;
      const v = Number(args[a++]) | 0;
      b[p++] = (v >>> 24) & 0xff; b[p++] = (v >>> 16) & 0xff; b[p++] = (v >>> 8) & 0xff; b[p++] = v & 0xff;
    } else if (c === 's' || c === 'S') {
      const max = c === 'S' ? MSG_LEN : MAX_CHARS;
      const str = String(args[a++]);
      const stop = p + max >= end ? end : p + max;
      // the string with its NUL, cut at `stop` (then without the NUL, as the original)
      for (let k = 0; ; k++) {
        if (p >= stop) break;
        const ch = k < str.length ? str.charCodeAt(k) & 0xff : 0;
        b[p++] = ch;
        if (ch === 0) break;
      }
    } else return -1;
  }
  const count = p - sb.len;
  sb.len = p;
  return count;
}

/** raw bytes into the buffer (Send_keyboard's memcpy of the key vector) */
export function Sockbuf_append(sb: sockbuf_t, bytes: Uint8Array): void {
  if (!sb.buf) return;
  sb.buf.set(bytes, sb.len);
  sb.len += bytes.length;
}

// ---------------------------------------------------------------- reading the bytes back

/** the client packets in a flushed buffer, in order; PKT_ACK (the reliable stream's ack) is left out */
export function clientPackets(b: Uint8Array, len: number, verify: { host: string; team: number }): ClientMsg[] {
  const out: ClientMsg[] = [];
  let p = 0;
  const u8 = () => b[p++];
  const s16 = () => { const v = (b[p] << 8) | b[p + 1]; p += 2; return (v << 16) >> 16; };
  const u16 = () => { const v = (b[p] << 8) | b[p + 1]; p += 2; return v; };
  const s32 = () => { const v = (b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]; p += 4; return v | 0; };
  const str = (max: number) => {
    let s = '';
    const stop = Math.min(len, p + max);
    while (p < stop) {
      const c = b[p++];
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s;
  };
  while (p < len) {
    const type = u8();
    switch (type) {
      case PKT_VERIFY: {
        const user = str(MAX_CHARS), nick = str(MAX_CHARS), disp = str(MAX_CHARS);
        out.push(['verify', { user, nick, disp, host: verify.host, team: verify.team }]);
        break;
      }
      case PKT_PLAY: out.push(['play', null]); break;
      case PKT_QUIT: out.push(['quit', null]); break;
      case PKT_KEYBOARD: {
        const change = s32();
        const keyv: boolean[] = [];
        for (let k = 0; k < KEYBOARD_SIZE * 8; k++) keyv.push((b[p + (k >> 3)] & (1 << (k & 7))) !== 0);
        p += KEYBOARD_SIZE;
        out.push(['keyboard', { change, keyv }]);
        break;
      }
      case PKT_POWER: out.push(['power', { value: s16() }]); break;
      case PKT_POWER_S: out.push(['powerS', { value: s16() }]); break;
      case PKT_TURNSPEED: out.push(['turnspeed', { value: s16() }]); break;
      case PKT_TURNSPEED_S: out.push(['turnspeedS', { value: s16() }]); break;
      case PKT_TURNRESISTANCE: out.push(['turnresistance', { value: s16() }]); break;
      case PKT_TURNRESISTANCE_S: out.push(['turnresistanceS', { value: s16() }]); break;
      case PKT_ACK_CANNON: case PKT_ACK_FUEL: case PKT_ACK_TARGET: case PKT_ACK_POLYSTYLE: {
        const loopsAck = s32(), num = u16();
        const kind = type === PKT_ACK_CANNON ? 'ackCannon' : type === PKT_ACK_FUEL ? 'ackFuel' : type === PKT_ACK_TARGET ? 'ackTarget' : 'ackPolystyle';
        out.push([kind, { loopsAck, num }]);
        break;
      }
      case PKT_TALK: { const seq = s32(); out.push(['talk', { seq, str: str(MAX_CHARS) }]); break; }
      case PKT_DISPLAY: {
        const width = s16(), height = s16(), debrisColors = u8(), sparkRand = u8();
        out.push(['display', { width, height, debrisColors, sparkRand }]);
        break;
      }
      case PKT_MODIFIERBANK: { const bank = u8(); out.push(['modifierBank', { bank, str: str(MAX_CHARS) }]); break; }
      case PKT_MOTD: { const offset = s32(), nbytes = s32(); out.push(['motd', { offset, nbytes }]); break; }
      case PKT_SHAPE: { const shape = str(MSG_LEN), ext = str(MSG_LEN); out.push(['shape', { shape, ext }]); break; }
      case PKT_POINTER_MOVE: out.push(['pointerMove', { movement: s16() }]); break;
      case PKT_REQUEST_AUDIO: out.push(['requestAudio', { on: u8() }]); break;
      case PKT_ASYNC_FPS: out.push(['asyncFps', { fps: u8() }]); break;
      case PKT_ACK: p += 8; break;
      default:
        // not a packet the client writes: the rest cannot be read
        return out;
    }
  }
  return out;
}
