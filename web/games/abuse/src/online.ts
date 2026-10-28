// Online play, the program's side (protocol/games/abuse.capnp). The original's network game had a
// server engine that collected every client's input packet of a tick over UDP, put them together and
// sent the result back (net/gserver.cpp, net/gclient.cpp); a player joining a running game made the
// server save the level with the new player in it and every client load that file (net_reload). The
// port plays the same game in lockstep through the website's rooms: every client runs the engine as
// the original's server did (from the same seed, so their games are equal), sends its player's commands
// of each tick to everyone, and processes a tick when it has every player's commands for it, in the
// room's order. The players of the round join at tick 0 as joiners joined the original's server
// (net_reload, the server's part, on every client: no file has to go round). Seat n is client n.
import * as P from './proto/abuse.ts';
import { packGame, unpackGame } from '../../../src/sdk/net/codec.ts';
import { G } from './globals.ts';
import { L } from './lglobals.ts';
import { base, NET, INPUT_COLLECTING, INPUT_PROCESSING, PACKET_MAX_SIZE, type GameFace, type join_struct,
  SCMD_DELETE_CLIENT, SCMD_VIEW_RESIZE, SCMD_SET_INPUT, SCMD_WEAPON_CHANGE, SCMD_RELOAD,
  SCMD_KEYPRESS, SCMD_KEYRELEASE, SCMD_EXT_KEYPRESS, SCMD_EXT_KEYRELEASE, SCMD_CHAT_KEYPRESS, SCMD_SYNC } from './net.ts';
import { view, view_hooks, set_login, make_sync } from './view.ts';
import { create } from './objects.ts';
import { main_net_cfg, net_configuration, set_main_net_cfg, NETP } from './netcfg.ts';
import { vfsPut, DATA_PREFIX } from './rt/vfs.ts';
import { dprintf } from './imlib/dprint.ts';

/** the page to the worker */
export type NetToWorker =
  | { t: 'msg'; from: number; data: Uint8Array }
  | { t: 'resume' }
  | { t: 'dialogDone' };

/** the worker to the page */
export type NetFromWorker =
  | { t: 'send'; data: Uint8Array; to: 'all' | 'server' }
  | { t: 'menu' }
  | { t: 'tick'; tick: number; sync: number };

export interface OnlineConfig {
  seat: number;
  /** every seat's player name, by seat (empty: no player in that seat) */
  names: string[];
  seed: number;
  levelSize: number;
  kills: number;
  gameName: string;
}

const net = {
  post: null as ((m: NetFromWorker) => void) | null,
  dialogWaiter: null as (() => void) | null,
};
export function set_net_post(post: (m: NetFromWorker) => void): void { net.post = post; }

/** the networking dialog of the main menu (menu.ts): the page shows the website's lobby */
export async function net_dialog(): Promise<void> {
  if (!net.post) return;
  await new Promise<void>((resolve) => {
    net.dialogWaiter = resolve;
    net.post!({ t: 'menu' });
  });
}

const u8 = (d: Uint8Array, i: number): number => d[i];
const u16 = (d: Uint8Array, i: number): number => d[i] | (d[i + 1] << 8);
const i32 = (d: Uint8Array, i: number): number => d[i] | (d[i + 1] << 8) | (d[i + 2] << 16) | (d[i + 3] << 24);

/** the engine's packet of the local player (net_send) as the schema's commands */
export function packet_to_tick(tick: number, data: Uint8Array): Uint8Array {
  type Cmd = (c: P.Command) => void;
  const cmds: Cmd[] = [];
  let i = 0;
  while (i < data.length) {
    const cmd = data[i++];
    switch (cmd) {
      case SCMD_VIEW_RESIZE: {
        const at = i + 1;
        const v = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => i32(data, at + k * 4));
        i += 1 + 32;
        cmds.push((c) => {
          const r = c._initViewResize();
          [r.cx1, r.cy1, r.cx2, r.cy2, r.panX, r.panY, r.shiftDown, r.shiftRight] = v;
        });
        break;
      }
      case SCMD_WEAPON_CHANGE: {
        const w = i32(data, i + 1) & 0xff;
        i += 5;
        cmds.push((c) => { c.weaponChange = w; });
        break;
      }
      case SCMD_SET_INPUT: {
        const flags = u8(data, i + 1), px = (u16(data, i + 2) << 16) >> 16, py = (u16(data, i + 4) << 16) >> 16;
        i += 6;
        cmds.push((c) => {
          const s = c._initSetInput();
          s.flags = flags;
          s.pointerX = px;
          s.pointerY = py;
        });
        break;
      }
      case SCMD_KEYPRESS: case SCMD_EXT_KEYPRESS: case SCMD_KEYRELEASE: case SCMD_EXT_KEYRELEASE: {
        const k = u8(data, i + 1) + (cmd === SCMD_EXT_KEYPRESS || cmd === SCMD_EXT_KEYRELEASE ? 256 : 0);
        i += 2;
        if (cmd === SCMD_KEYPRESS || cmd === SCMD_EXT_KEYPRESS) cmds.push((c) => { c.keyPress = k; });
        else cmds.push((c) => { c.keyRelease = k; });
        break;
      }
      case SCMD_CHAT_KEYPRESS: {
        const k = u8(data, i + 1);
        i += 2;
        cmds.push((c) => { c.chatKey = k; });
        break;
      }
      case SCMD_SYNC: {
        const s = u16(data, i);
        i += 2;
        cmds.push((c) => { c.sync = s; });
        break;
      }
      case SCMD_RELOAD:
        cmds.push((c) => { c.reload = true; });
        break;
      default:
        i = data.length; // the engine writes nothing else for its local player
    }
  }
  return packGame(P.Msg, (m) => {
    const t = m._initTick();
    t.tick = tick;
    const l = t._initCommands(cmds.length);
    cmds.forEach((f, k) => f(l.get(k)));
  });
}

/** a player's commands of a tick back as the engine's packet bytes, with the player's number */
export function tick_to_packet(seat: number, t: P.Tick, out: number[]): void {
  const w32 = (v: number): void => { out.push(v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff); };
  const w16 = (v: number): void => { out.push(v & 0xff, (v >> 8) & 0xff); };
  const cs = t.commands;
  for (let k = 0; k < cs.length; k++) {
    const c = cs.get(k);
    switch (c.which()) {
      case P.Command_Which.SET_INPUT: {
        const s = c.setInput;
        out.push(SCMD_SET_INPUT, seat, s.flags & 0xff);
        w16(s.pointerX);
        w16(s.pointerY);
        break;
      }
      case P.Command_Which.VIEW_RESIZE: {
        const r = c.viewResize;
        out.push(SCMD_VIEW_RESIZE, seat);
        for (const v of [r.cx1, r.cy1, r.cx2, r.cy2, r.panX, r.panY, r.shiftDown, r.shiftRight]) w32(v);
        break;
      }
      case P.Command_Which.WEAPON_CHANGE:
        out.push(SCMD_WEAPON_CHANGE, seat);
        w32(c.weaponChange & 0xff);
        break;
      case P.Command_Which.KEY_PRESS: {
        const k = c.keyPress & 0x1ff;
        out.push(k >= 256 ? SCMD_EXT_KEYPRESS : SCMD_KEYPRESS, seat, k & 0xff);
        break;
      }
      case P.Command_Which.KEY_RELEASE: {
        const k = c.keyRelease & 0x1ff;
        out.push(k >= 256 ? SCMD_EXT_KEYRELEASE : SCMD_KEYRELEASE, seat, k & 0xff);
        break;
      }
      case P.Command_Which.CHAT_KEY:
        out.push(SCMD_CHAT_KEYPRESS, seat, c.chatKey & 0xff);
        break;
      case P.Command_Which.SYNC:
        out.push(SCMD_SYNC);
        w16(c.sync);
        break;
      case P.Command_Which.RELOAD:
        out.push(SCMD_RELOAD);
        break;
    }
  }
}

interface Got { seat: number; tick: P.Tick }

/** the lockstep game handler (the original's game_server and game_client in one) */
class OnlineFace implements GameFace {
  readonly cfg: OnlineConfig;
  /** seats still in the game */
  private readonly active = new Set<number>();
  /** tick -> the commands received for it, in the room's order */
  private readonly ticks = new Map<number, Got[]>();
  /** tick -> seats deleted in it (Left) */
  private readonly lefts = new Map<number, number[]>();
  /** the tick the engine processes next (net_receive) and the one it sends next (net_send) */
  private recv = 0;
  private sent = 0;
  private waiter: (() => void) | null = null;
  /** our last ticks, sent again after a dropped connection (the server passes on only what it has not) */
  private readonly own: Uint8Array[] = [];

  constructor(cfg: OnlineConfig) {
    this.cfg = cfg;
    cfg.names.forEach((n, s) => { if (n) this.active.add(s); });
  }

  client_number(): number { return this.cfg.seat; }

  add_engine_input(): void {
    const data = base.packet.data.slice(5, 5 + base.packet.packet_size());
    const m = packet_to_tick(this.sent, data);
    net.post?.({ t: 'send', data: m, to: 'all' });
    this.own.push(m);
    if (this.own.length > 8) this.own.shift();
    this.sent++;
    base.input_state = INPUT_COLLECTING;
  }

  message(from: number, data: Uint8Array): void {
    let m: P.Msg;
    try {
      m = unpackGame(P.Msg, data);
      switch (m.which()) {
        case P.Msg_Which.TICK:
          if (from < 0 || from >= 8) return;
          this.got(from, m.tick);
          break;
        case P.Msg_Which.LEFT:
          if (from === 255) this.left(m.left.seat, m.left.tick);
          break;
        case P.Msg_Which.REPLAYED: {
          if (from !== 255) return;
          const r = m.replayed;
          if (r.which() === P.Replayed_Which.TICK) this.got(r.seat, r.tick);
          else this.left(r.left.seat, r.left.tick);
          break;
        }
      }
    } catch {
      return; // a peer may send garbage
    }
    this.wake();
  }

  private got(seat: number, t: P.Tick): void {
    const n = t.tick;
    if (n < this.recv) return;
    let l = this.ticks.get(n);
    if (!l) this.ticks.set(n, (l = []));
    if (l.some((g) => g.seat === seat)) return; // a replay of what we have
    l.push({ seat, tick: t });
  }

  private left(seat: number, tick: number): void {
    if (!this.active.has(seat)) return;
    let l = this.lefts.get(tick);
    if (!l) this.lefts.set(tick, (l = []));
    l.push(seat);
  }

  /** the seats whose commands tick n needs */
  private needed(n: number): number[] {
    const out: number[] = [];
    for (const s of this.active) {
      let gone = false;
      for (const [t, seats] of this.lefts) if (t <= n && seats.includes(s)) gone = true;
      if (!gone) out.push(s);
    }
    return out;
  }

  private complete(n: number): boolean {
    const have = this.ticks.get(n) ?? [];
    return this.needed(n).every((s) => have.some((g) => g.seat === s));
  }

  private wake(): void {
    if (this.waiter && this.complete(this.recv)) {
      const w = this.waiter;
      this.waiter = null;
      w();
    }
  }

  async wait_input(): Promise<Uint8Array> {
    const n = this.recv;
    // for the page's checks (the end-to-end test compares the clients): the state the tick starts from
    if (n % 15 === 0) net.post?.({ t: 'tick', tick: n, sync: make_sync() });
    if (!this.complete(n)) await new Promise<void>((r) => { this.waiter = r; });
    const need = new Set(this.needed(n));
    const out: number[] = [];
    for (const g of this.ticks.get(n) ?? []) if (need.has(g.seat)) tick_to_packet(g.seat, g.tick, out);
    for (const s of this.lefts.get(n) ?? []) {
      out.push(SCMD_DELETE_CLIENT, s);
      this.active.delete(s);
    }
    this.lefts.delete(n);
    this.ticks.delete(n);
    this.recv++;
    const size = Math.min(out.length, PACKET_MAX_SIZE - 5);
    base.last_packet.data.set(base.packet.data.subarray(0, base.packet.packet_size() + 5));
    base.packet.packet_reset();
    base.mem_lock = 0;
    base.input_state = INPUT_PROCESSING;
    return Uint8Array.from(out.slice(0, size));
  }

  /** after a dropped connection: our last ticks again (what we sent while offline was lost), and the
   *  others' from the first tick not yet complete (the server sends what it keeps on its own too) */
  resume(): void {
    for (const m of this.own) net.post?.({ t: 'send', data: m, to: 'all' });
    net.post?.({ t: 'send', data: packGame(P.Msg, (m) => { m.resume = this.recv; }), to: 'server' });
  }
}

let face: OnlineFace | null = null;
/** messages that came before the game handler exists */
const early: { from: number; data: Uint8Array }[] = [];

export function net_worker_message(m: NetToWorker): void {
  switch (m.t) {
    case 'msg':
      if (face) face.message(m.from, m.data);
      else early.push({ from: m.from, data: m.data });
      break;
    case 'resume': face?.resume(); break;
    case 'dialogDone': {
      const w = net.dialogWaiter;
      net.dialogWaiter = null;
      w?.();
      break;
    }
  }
}

const text = (s: string): Uint8Array => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
const lispString = (s: string): string => s.replace(/["\\]/g, '');

/**
 * Sets the program up as the original's network game setup (netcfg.cpp confirm_inputs) and restart
 * left it: the deathmatch add-on, the server's options, the player's name. Returns the arguments.
 * The add-on of 0.8 loads "config/levelset.lsp" and "config/username.lsp" where the setup writes them
 * under addon/deathmat/ (with no config/ directory the game stops at its first line that needs them):
 * the port writes both.
 */
export function online_setup(cfg: OnlineConfig): string[] {
  const c = new net_configuration();
  c.state = net_configuration.SERVER;
  c.kills = cfg.kills;
  c.min_players = cfg.names.filter((n) => n).length;
  c.name = lispString(cfg.names[0] ?? 'player');
  set_main_net_cfg(c);
  NETP.prot = true;
  const size = cfg.levelSize === 8 ? 'large' : cfg.levelSize === 4 ? 'medium' : 'small';
  const levelset = `(load "addon/deathmat/${size}.lsp")\n\0`;
  // the name of player 0, the original's server: every client's player 0 is the same player
  const username = `(setq username "${lispString(cfg.names[0] ?? 'player')}")\n\0`;
  for (const dir of ['addon/deathmat/', 'config/']) {
    vfsPut(`${DATA_PREFIX}${dir}levelset.lsp`, text(levelset));
    vfsPut(`${DATA_PREFIX}${dir}username.lsp`, text(username));
  }
  vfsPut(`${DATA_PREFIX}addon/deathmat/gamename.lsp`, text(`(setq gamename "${lispString(cfg.gameName)}")\n\0`));
  face = new OnlineFace(cfg);
  NET.face = face;
  for (const e of early.splice(0)) face.message(e.from, e.data);
  // the round's players join at the first tick (the server's join_list)
  let list: join_struct | null = null;
  for (let s = cfg.names.length - 1; s >= 1; s--) if (cfg.names[s]) list = { client_id: s, name: cfg.names[s].slice(0, 99), next: list };
  base.join_list = list;
  view_hooks.net_reload = net_reload;
  set_login(cfg.names[0] ?? 'player');
  return ['-lsf', 'addon/deathmat/deathmat.lsp'];
}

/**
 * net_reload, the server's part (innet.cpp): the joiners get a player each at a random start, view
 * 5,5-314,194, their name and tint. The server then saved the level for the clients and waited for them
 * to load it; here every client did the same, so nothing has to go round. View 0 (the server's player)
 * gets the place the server gave it on its screen (recalc_local_view_space with one local player), so
 * that it is the same on every client.
 */
function net_reload(): void {
  if (!G.current_level) return;
  let join = base.join_list;
  const v0 = L.player_list;
  if (v0 && join) {
    v0.cx1 = 2;
    v0.cy1 = 5;
    v0.cx2 = 318;
    v0.cy2 = 167;
  }
  while (join) {
    let f = L.player_list!;
    for (; f && f.next; f = f.next);
    const o = create(L.current_start_type, 0, 0);
    const start = G.current_level.get_random_start(320, null);
    if (start) {
      o.x = start.x;
      o.y = start.y;
    } else {
      o.x = 100;
      o.y = 100;
    }
    f.next = new view(o, null, join.client_id);
    f.next.name = join.name;
    o.set_controller(f.next);
    f.next.set_tint(f.next.player_number);
    if (start) G.current_level.add_object_after(o, start);
    else G.current_level.add_object(o);
    const v = f.next;
    v.cx1 = 5;
    v.cy1 = 5;
    v.cx2 = 319 - 5;
    v.cy2 = 199 - 5;
    join = join.next;
  }
  base.join_list = null;
  base.mem_lock = 0;
  G.the_game.reset_keymap();
  base.input_state = INPUT_COLLECTING;
  dprintf('players joined\n');
  void main_net_cfg;
}
