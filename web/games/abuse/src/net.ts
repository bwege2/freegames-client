// innet.cpp and netface.h: the engine's side of the network. Every tick the local players' input goes
// into a packet (net_send); the packet the engine then processes (net_receive) is, without a network
// game, that same packet, and in an online game the packets of every player in the order the server
// relayed them (online.ts, the lockstep the original's game_server/game_client did over UDP).
export const PACKET_MAX_SIZE = 1024;
export const SCMD_DELETE_CLIENT = 0, SCMD_VIEW_RESIZE = 1, SCMD_SET_INPUT = 2, SCMD_WEAPON_CHANGE = 3,
  SCMD_END_OF_PACKET = 4, SCMD_RELOAD = 5, SCMD_KEYPRESS = 6, SCMD_KEYRELEASE = 7, SCMD_EXT_KEYPRESS = 8,
  SCMD_EXT_KEYRELEASE = 9, SCMD_CHAT_KEYPRESS = 10, SCMD_SYNC = 11;
export const INPUT_COLLECTING = 0, INPUT_PROCESSING = 1, INPUT_RELOAD = 2, INPUT_NET_DEAD = 3;

/** net_packet: 2 bytes size, 2 bytes checksum, 1 byte tick, then the data */
export class net_packet {
  data = new Uint8Array(PACKET_MAX_SIZE);
  packet_prefix_size(): number { return 5; }
  packet_size(): number { return this.data[0] | (this.data[1] << 8); }
  set_packet_size(x: number): void {
    this.data[0] = x & 0xff;
    this.data[1] = (x >> 8) & 0xff;
  }
  packet_data(): Uint8Array { return this.data.subarray(5, 5 + this.packet_size()); }
  packet_reset(): void { this.set_packet_size(0); }
  add_to_packet(buf: ArrayLike<number>, size: number): void {
    if (size && size + this.packet_size() + this.packet_prefix_size() < PACKET_MAX_SIZE) {
      const at = this.packet_size() + this.packet_prefix_size();
      for (let i = 0; i < size; i++) this.data[at + i] = buf[i] & 0xff;
      this.set_packet_size(this.packet_size() + size);
    }
  }
  write_uint8(x: number): void { this.add_to_packet([x], 1); }
  write_uint16(x: number): void { this.add_to_packet([x & 0xff, (x >> 8) & 0xff], 2); }
  write_uint32(x: number): void { this.add_to_packet([x & 0xff, (x >> 8) & 0xff, (x >> 16) & 0xff, (x >>> 24) & 0xff], 4); }
}

export interface join_struct { client_id: number; name: string; next: join_struct | null }

/** base_memory_struct */
export const base = {
  packet: new net_packet(),
  last_packet: new net_packet(),
  mem_lock: 0,
  input_state: INPUT_COLLECTING,
  current_tick: 0,
  join_list: null as join_struct | null,
};

/** the game handler: the single player one of the original (ghandler.h) or the online one */
export interface GameFace {
  /** add_engine_input: the local packet is complete */
  add_engine_input(): void;
  /** waits until the tick's input is here (get_inputs_from_server); returns the packet's bytes */
  wait_input(): Promise<Uint8Array>;
  /** the local player's number (client_number) */
  client_number(): number;
}

class single_face implements GameFace {
  add_engine_input(): void { base.input_state = INPUT_PROCESSING; }
  async wait_input(): Promise<Uint8Array> {
    const size = base.packet.packet_size();
    base.last_packet.data.set(base.packet.data.subarray(0, size + 5));
    const buf = base.packet.data.slice(5, 5 + size);
    base.packet.packet_reset();
    base.mem_lock = 0;
    return buf;
  }
  client_number(): number { return 0; }
}

export const NET = { face: new single_face() as GameFace };

export function net_reset(): void {
  NET.face = new single_face();
  base.packet = new net_packet();
  base.last_packet = new net_packet();
  base.mem_lock = 0;
  base.input_state = INPUT_COLLECTING;
  base.current_tick = 0;
  base.join_list = null;
}

export function client_number(): number { return NET.face.client_number(); }

export function send_local_request(tick: number | null): void {
  if (tick !== null) base.current_tick = tick & 0xff;
  NET.face.add_engine_input();
}

export async function get_inputs_from_server(): Promise<Uint8Array> {
  return NET.face.wait_input();
}

/** net_start(): is the game starting up off the net (-net hostname)? Never in the port. */
export function net_start(): number { return 0; }
