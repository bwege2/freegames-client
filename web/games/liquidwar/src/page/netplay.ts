// The network game's client side without the page: the original's netplay.c (connect_on_server_continue
// and _finish: teams, rules and map to the server, the WHO table, rules and map back) and keyexch.c
// (lw_keyexch_flush: every exchange of keys, the local teams' keys out, everyone's keys in), over the
// website's room and the module server/.../games/liquidwar/LiquidwarModule.java (protocol/games/liquidwar.capnp).
//
// The keys: the original server sends every client the merged keys of an exchange a few exchanges later
// (its lag, which it adapts when the clients ask: keyexch.c LW_KEYEXCH_LAG_LOWER_LIMIT/_UPPER_LIMIT,
// srvcont.c). Here a client sends the keys it reads at exchange n as the keys of exchange n + lag; the module
// merges them and tells every client, in frames, up to which exchange everyone's keys are known. A client
// applies at exchange n what it was told for n, so every client applies the same keys at the same exchange,
// local teams included, as in the original. The lag adapts by the original's rule (raised when fewer than 2
// exchanges are known ahead 10 times in a row, lowered when more than 5 are 20 times in a row), and is also
// raised by one whenever the game has to wait for the keys.
import { packGame, setData, unpackGame, bytes, SERVER_SEAT, type GameMessage, type RoundStart } from '../../../../src/sdk/index.ts';
import { lw_netconf_check } from '../lw/config.ts';
import { log_println_str } from '../lw/log.ts';
import { G, NB_TEAMS, CONFIG_CONTROL_TYPE_CPU, CONFIG_CONTROL_TYPE_HUMAN, NAME_SIZE, type Rules as LwRules } from '../lw/state.ts';
import { Msg, Msg_Which, type Setup, WhoKind } from '../proto/liquidwar.ts';

/** LW_PROGRAM and LW_VERSION (base.h) */
export const LW_PROGRAM = 'liquidwar';
export const LW_VERSION = '5.6.6';

/** keyexch.c */
export const LW_KEYEXCH_LAG_LOWER_LIMIT = 2;
export const LW_KEYEXCH_LAG_UPPER_LIMIT = 5;
/** srvcont.c: how many exchanges in a row must ask before the lag changes */
export const LW_SRVCONT_INCREASE_LAG_LIMIT = 10;
export const LW_SRVCONT_DECREASE_LAG_LIMIT = 20;
/** the lag a game starts with (exchanges) and its bounds; the module refuses keys more than 4096 ahead */
export const START_LAG = 8;
export const MAX_LAG = 1000;
/** at most this often a client sends its keys (ms): the server takes 200 messages a second */
export const SEND_MS = 10;
/** the most changes and checksums in one Keys message (LiquidwarModule.MAX_CHANGES, MAX_CHECKSUMS) */
const MAX_CHANGES = 512;
const MAX_CHECKSUMS = 64;
/** with no frame for this long the connection counts as lost (error_network_problem) */
export const TIMEOUT_MS = 30000;

/** the part of ctx.rooms this uses */
export interface NetRooms {
  send(data: Uint8Array, to: 'server', reliable?: boolean): void;
  on(ev: 'message', fn: (m: GameMessage) => void): () => void;
  on(ev: 'finished', fn: (f: { stopped: string }) => void): () => void;
  on(ev: 'closed', fn: (c: { reason: string }) => void): () => void;
  on(ev: 'started', fn: (r: RoundStart) => void): () => void;
  leave(): void;
}

export interface Clock {
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(t: unknown): void;
}

const realClock: Clock = {
  now: () => performance.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (t) => clearTimeout(t as ReturnType<typeof setTimeout>),
};

const RULE_KEYS: [keyof LwRules, string][] = [
  ['cursor_increase_speed', 'cursorIncreaseSpeed'], ['fighter_attack', 'fighterAttack'], ['fighter_defense', 'fighterDefense'],
  ['fighter_new_health', 'fighterNewHealth'], ['number_influence', 'numberInfluence'], ['fighter_number', 'fighterNumber'],
  ['game_time', 'gameTime'], ['cpu_advantage', 'cpuAdvantage'], ['cpu_vs_human', 'cpuVsHuman'], ['asm_algorithm', 'asmAlgorithm'],
  ['min_map_res', 'minMapRes'], ['allow_network_bots', 'allowNetworkBots'],
];

/** what the server answered to a client's teams, rules and map */
export interface SetupInfo {
  full: boolean;
  who: { kind: 'nobody' | 'local' | 'network'; serverId: number; controlType: number; name: string }[];
  rules: number[];
  map: Uint8Array;
}

function readSetup(s: Setup): SetupInfo {
  const who: SetupInfo['who'] = [];
  for (let i = 0; i < s.who.length; i++) {
    const w = s.who.get(i);
    who.push({
      kind: w.kind === WhoKind.LOCAL ? 'local' : w.kind === WhoKind.NETWORK ? 'network' : 'nobody',
      serverId: w.serverId, controlType: w.controlType, name: w.name,
    });
  }
  const r = s.rules;
  return { full: s.full, who, rules: RULE_KEYS.map(([, k]) => (r as unknown as Record<string, number>)[k]!), map: bytes(s.map) };
}

/** the teams this client brings (connect_on_server_continue: human teams, and computer ones with network bots) */
export function localTeams(): { slot: number; controlType: number; name: string }[] {
  const teams: { slot: number; controlType: number; name: string }[] = [];
  for (let i = 0; i < NB_TEAMS; ++i) {
    const ct = G.CONFIG_CONTROL_TYPE[i]!;
    if (ct === CONFIG_CONTROL_TYPE_HUMAN || (ct === CONFIG_CONTROL_TYPE_CPU && G.CONFIG_ALLOW_NETWORK_BOTS)) {
      teams.push({ slot: i, controlType: ct, name: G.CONFIG_PLAYER_NAME[i]!.slice(0, NAME_SIZE) });
    }
  }
  return teams;
}

/** the map this client offers (LW_RANDOM_ON ? LW_RANDOM_RAW_MAP : RAW_MAP_ORDERED[CONFIG_LEVEL_MAP]) */
export function localMap(): Uint8Array {
  return G.LW_RANDOM_ON && G.LW_RANDOM_RAW_MAP ? G.LW_RANDOM_RAW_MAP : G.RAW_MAP_ORDERED[G.CONFIG_LEVEL_MAP]!;
}

/**
 * lw_protocol_ask_who for every slot, lw_protocol_recv_config and _recv_map: the game's globals from the
 * server's answer. Returns 'config' when the rules are out of range (error_bad_config_range), 'map' when the
 * map is no map (error_cant_receive_map), else null.
 */
export function applySetup(s: SetupInfo): 'config' | 'map' | null {
  for (let i = 0; i < NB_TEAMS; ++i) {
    const ni = G.LW_NETWORK_INFO[i]!;
    const w = s.who[i];
    ni.active = 0;
    ni.network = 0;
    ni.server_id = -1;
    ni.name = '';
    if (w && w.kind !== 'nobody') {
      ni.network = w.kind === 'network' ? 1 : 0;
      ni.active = 1;
      ni.server_id = w.serverId;
      ni.control_type = w.controlType;
      ni.name = w.name.slice(0, NAME_SIZE);
    }
  }
  RULE_KEYS.forEach(([k], i) => { G.LW_CONFIG_CURRENT_RULES[k] = s.rules[i] ?? 0; });
  if (!lw_netconf_check(G.LW_CONFIG_CURRENT_RULES)) return 'config';
  if (mapSize(s.map) < 10) return 'map';
  G.LW_NETWORK_RAW_MAP = s.map;
  return null;
}

/** the map's size from its header (lw_serial_get_map_header); the original refuses one under 10 bytes */
export function mapSize(raw: Uint8Array): number {
  return raw.length >= 4 ? (raw[0]! | (raw[1]! << 8) | (raw[2]! << 16) | (raw[3]! << 24)) : 0;
}

/** one client's part in a round: Join, Setup, then the exchange of keys */
export class NetPlay {
  private readonly rooms: NetRooms;
  private readonly clock: Clock;
  private readonly off: (() => void)[] = [];
  private setupInfo: SetupInfo | null = null;
  private broken = '';
  private wake: (() => void) | null = null;

  /** the next exchange */
  step = 0;
  lag = START_LAG;
  /** this client's keys are known for every exchange < upto */
  private upto = 0;
  private lastKeys = 0;
  private changes: { step: number; keys: number }[] = [];
  private checksums: { step: number; value: number }[] = [];
  private sentUpto = 0;
  private lastSend = -Infinity;
  private timer: unknown = null;
  /** everyone's keys are known for every exchange < frameUpto */
  frameUpto = 0;
  private frameChanges: { step: number; keys: number }[] = [];
  private merged = 0;
  private increaseCounter = 0;
  private decreaseCounter = 0;
  /** exchanges this client waited for (statistics) */
  stalls = 0;
  badChecksums = 0;
  private closed = false;

  constructor(rooms: NetRooms, clock: Clock = realClock) {
    this.rooms = rooms;
    this.clock = clock;
    this.off.push(rooms.on('message', (m) => this.message(m)));
    this.off.push(rooms.on('finished', (f) => this.fail(f.stopped || 'the round is over')));
    this.off.push(rooms.on('closed', (c) => this.fail(`room closed: ${c.reason}`)));
    this.off.push(rooms.on('started', (r) => { if (r.rejoined) this.fail('reconnected in the middle of the game'); }));
  }

  /** why the connection is gone ('' while it works) */
  get error(): string {
    return this.broken;
  }

  private fail(why: string): void {
    if (!this.broken) this.broken = why;
    this.wake?.();
  }

  private message(m: GameMessage): void {
    if (m.from !== SERVER_SEAT) return;
    let msg: Msg;
    try {
      msg = unpackGame(Msg, m.data);
      switch (msg.which()) {
        case Msg_Which.SETUP:
          if (!this.setupInfo) this.setupInfo = readSetup(msg.setup);
          break;
        case Msg_Which.FRAME: {
          const f = msg.frame;
          if (f.upto <= this.frameUpto) return;
          for (let i = 0; i < f.changes.length; i++) {
            const c = f.changes.get(i);
            if (c.step >= this.frameUpto && c.step < f.upto) this.frameChanges.push({ step: c.step, keys: c.keys });
          }
          // keyexch.c recv_keys: a 0 checksum back means this client's game differs from the others'
          for (let i = 0; i < f.badChecksums.length; i++) {
            this.badChecksums++;
            log_println_str('Error: incorrect checksum, the game is broken, or someone is cheating');
          }
          this.frameUpto = f.upto;
          break;
        }
        default:
          return;
      }
    } catch {
      return; // the module never sends garbage, but a message that does not parse is dropped
    }
    this.wake?.();
  }

  private waitFor(cond: () => boolean, ms: number): Promise<boolean> {
    if (cond()) return Promise.resolve(true);
    return new Promise((resolve) => {
      const t = this.clock.setTimeout(() => {
        this.wake = null;
        resolve(cond());
      }, ms);
      this.wake = () => {
        if (cond() || this.broken) {
          this.clock.clearTimeout(t);
          this.wake = null;
          resolve(cond());
        }
      };
    });
  }

  /** connect_on_server_continue: this client's teams, rules (LW_CONFIG_CURRENT_RULES) and map */
  join(): void {
    const teams = localTeams();
    const map = localMap();
    this.rooms.send(packGame(Msg, (m) => {
      const j = m._initJoin();
      j.program = LW_PROGRAM;
      j.version = LW_VERSION;
      const ts = j._initTeams(teams.length);
      teams.forEach((t, i) => {
        const x = ts.get(i);
        x.slot = t.slot;
        x.controlType = t.controlType;
        x.name = t.name;
      });
      const r = j._initRules();
      for (const [lk, wk] of RULE_KEYS) (r as unknown as Record<string, number>)[wk] = G.LW_CONFIG_CURRENT_RULES[lk];
      setData((n) => j._initMap(n), map);
    }), 'server');
  }

  /** connect_on_server_finish: the server's answer, or null when the connection is gone */
  async setup(ms = TIMEOUT_MS): Promise<SetupInfo | null> {
    await this.waitFor(() => !!this.setupInfo, ms);
    return this.setupInfo;
  }

  /** the local teams' keys (keyexch.c send_keys: the cursors that are not network controlled), 4 bits a slot */
  static localKeys(): number {
    let keys = 0;
    for (let i = 0; i < NB_TEAMS; ++i) {
      const c = G.CURRENT_CURSOR[i]!;
      if (!c.from_network) keys |= (c.key_state & 15) << (4 * i);
    }
    return keys >>> 0;
  }

  /** lw_keyexch_flush: send this exchange's keys, then take everyone's; false on a network error */
  async keyexch(checksum: number): Promise<boolean> {
    if (this.broken || this.closed) return false;
    const n = this.step;
    const own = NetPlay.localKeys();
    const target = n + this.lag;
    if (target >= this.upto) {
      if (own !== this.lastKeys) {
        this.changes.push({ step: target, keys: own });
        this.lastKeys = own;
      }
      this.upto = target + 1;
    }
    if (checksum) this.checksums.push({ step: n, value: checksum >>> 0 });
    this.schedule();
    if (this.frameUpto <= n) {
      // waiting: the lag is too short for this connection
      this.stalls++;
      if (this.lag < MAX_LAG) this.lag++;
      this.flush();
      if (!(await this.waitFor(() => this.frameUpto > n, TIMEOUT_MS))) {
        this.fail(this.broken || 'no keys from the server');
        return false;
      }
    }
    // keyexch.c recv_keys: every cursor's keys from the server, local ones included
    this.frameChanges.sort((a, b) => a.step - b.step);
    while (this.frameChanges.length && this.frameChanges[0]!.step <= n) this.merged = this.frameChanges.shift()!.keys;
    for (let i = 0; i < NB_TEAMS; ++i) G.CURRENT_CURSOR[i]!.key_state = (this.merged >>> (4 * i)) & 15;
    this.adaptLag(this.frameUpto - n - 1);
    this.step = n + 1;
    return true;
  }

  /** send_keys's requests and the server's counters (srvcont.c lw_srvcont_replicate_keys), on this client's own lag */
  private adaptLag(buffered: number): void {
    if (buffered < LW_KEYEXCH_LAG_LOWER_LIMIT) this.increaseCounter++;
    else this.increaseCounter = 0;
    if (buffered > LW_KEYEXCH_LAG_UPPER_LIMIT) this.decreaseCounter++;
    else this.decreaseCounter = 0;
    if (this.increaseCounter >= LW_SRVCONT_INCREASE_LAG_LIMIT) {
      this.increaseCounter = 0;
      if (this.lag < MAX_LAG) this.lag++;
    }
    if (this.decreaseCounter >= LW_SRVCONT_DECREASE_LAG_LIMIT) {
      this.decreaseCounter = 0;
      if (this.lag > 1) this.lag--;
    }
  }

  private schedule(): void {
    if (this.timer !== null) return;
    const wait = this.lastSend + SEND_MS - this.clock.now();
    if (wait <= 0) {
      this.flush();
      return;
    }
    this.timer = this.clock.setTimeout(() => {
      this.timer = null;
      this.flush();
    }, wait);
  }

  /** sends what is pending: the keys up to upto, in messages of at most MAX_CHANGES changes */
  flush(): void {
    if (this.timer !== null) {
      this.clock.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.closed || (this.upto === this.sentUpto && !this.changes.length && !this.checksums.length)) return;
    do {
      const changes = this.changes.splice(0, MAX_CHANGES);
      const upto = this.changes.length ? this.changes[0]!.step : this.upto;
      const sums: { step: number; value: number }[] = [];
      while (this.checksums.length && sums.length < MAX_CHECKSUMS && this.checksums[0]!.step < upto) sums.push(this.checksums.shift()!);
      this.rooms.send(packGame(Msg, (m) => {
        const k = m._initKeys();
        k.upto = upto;
        const cs = k._initChanges(changes.length);
        changes.forEach((c, i) => {
          cs.get(i).step = c.step;
          cs.get(i).keys = c.keys;
        });
        const ck = k._initChecksums(sums.length);
        sums.forEach((c, i) => {
          ck.get(i).step = c.step;
          ck.get(i).value = c.value;
        });
      }), 'server');
      this.sentUpto = upto;
    } while (this.changes.length);
    this.checksums.length = 0;
    this.lastSend = this.clock.now();
  }

  /** the end of this client's game (lw_sock_close): the module stops waiting for it, the room is left */
  close(): void {
    if (this.closed) return;
    this.flush();
    this.closed = true;
    if (!this.broken) this.rooms.send(packGame(Msg, (m) => { m.done = true; }), 'server');
    for (const f of this.off.splice(0)) f();
    if (this.timer !== null) this.clock.clearTimeout(this.timer);
    this.wake = null;
    this.rooms.leave();
  }

  info(): string {
    return `step=${this.step} lag=${this.lag} known=${this.frameUpto} stalls=${this.stalls} bad=${this.badChecksums}${this.broken ? ` error=${this.broken}` : ''}`;
  }
}
