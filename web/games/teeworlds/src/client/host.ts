// Teeworlds in the browser: the original client (Teeworlds 0.7.5, translated: engine/ and game/) connected to the
// room's server (the original server's Java port in the game server) through ctx.rooms. The client's UDP socket
// is the room: every datagram it writes goes to the server as protocol/games/teeworlds.capnp Msg.udp (unreliable),
// every Msg.udp from the server is a datagram from the server's address. What main() and CClient::Run do around
// the client is here: the data directory (the release's files, fetched before the start), the settings file
// (settings.cfg in the player's server storage), the window (a canvas filling the game's area) and the loop.
import type { GameContext, GameInstance, RoundStart } from '../../../../src/sdk/index.ts';
import { SERVER_SEAT, packGame, unpackGame, playerName } from '../../../../src/sdk/index.ts';
import * as TW from '../proto/teeworlds.ts';
import { utf8Encode, utf8Decode } from '../base/system.ts';
import { NETADDR, TIME_FREQ, type NetHost } from '../engine/shared/network.ts';
import { CFGFLAG_CLIENT, type CConfig, defaultConfig } from '../generated/config.ts';
import * as P from '../generated/protocol.ts';
import { CClient, STATE_ONLINE, STATE_OFFLINE } from './engine/client.ts';
import { CConsole } from './engine/console.ts';
import { CGraphics } from './engine/graphics.ts';
import { CTextRender, CCanvasRasterizer } from './engine/text.ts';
import { CSound } from './engine/sound.ts';
import { CInput, FLAG_PRESS, FLAG_RELEASE, FLAG_TEXT } from './engine/input.ts';
import { CStorage } from './engine/storage.ts';
import * as K from './engine/keys.ts';
import { CGameClient } from './game/gameclient.ts';
import { CFlagBot } from './testbot.ts';

const assetUrls = import.meta.glob('../../assets/**/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** the server's address as the client sees it (the room has no addresses: the seat's datagrams go to the server) */
const SERVER_ADDR = NETADDR.ipv4(10, 0, 0, 254, 8303);
const SERVER_ADDR_STR = '10.0.0.254:8303';
const SETTINGS_FILE = 'settings.cfg';
const FONT_FAMILY = 'TeeworldsDejaVuSans';
const MAPS = Object.keys(assetUrls).map((p) => /\/maps\/([^/]+)\.map$/.exec(p)?.[1]).filter((n): n is string => !!n).sort();

/** a saved skin's name as a storage file name (names are [A-Za-z0-9._-]); other bytes as _XX */
function skinFile(name: string): string {
  let s = '';
  for (const c of name) s += /[A-Za-z0-9.-]/.test(c) ? c : '_' + c.charCodeAt(0).toString(16).padStart(2, '0');
  return 'skin_' + s + '.json';
}
function skinName(file: string): string | null {
  const m = /^skin_(.*)\.json$/.exec(file);
  return m ? m[1].replace(/_([0-9a-f]{2})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16))) : null;
}

const latin1 = (b: Uint8Array): string => { let s = ''; for (const c of b) s += String.fromCharCode(c); return s; };
const bytesOf = (s: string): Uint8Array => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);

/** the room's settings (protocol/games/teeworlds.capnp Options): lines of the server's configuration */
interface RoomOptions { [key: string]: string }
const OPTION_DEFAULTS: RoomOptions = {
  sv_gametype: 'dm', sv_map: 'dm1', sv_scorelimit: '20', sv_timelimit: '0', sv_matches_per_map: '1', sv_teamdamage: '0',
  sv_warmup: '0', sv_powerups: '1', sv_player_slots: '8',
};

/** the options panel above the lobby (what the original's operator writes into autoexec.cfg) */
function optionsPanel(o: RoomOptions): HTMLElement {
  const box = document.createElement('div');
  box.className = 'fg-lobby';
  box.style.marginBottom = '0';
  const h = document.createElement('h3');
  h.textContent = 'Server settings for a new room';
  box.append(h);
  const row = (label: string, input: HTMLElement): void => {
    const l = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = label;
    span.style.minWidth = '10rem';
    l.append(span, input);
    box.append(l);
  };
  const select = (key: string, values: [string, string][]): HTMLSelectElement => {
    const s = document.createElement('select');
    for (const [v, t] of values) s.append(new Option(t, v, false, o[key] === v));
    s.addEventListener('change', () => { o[key] = s.value; });
    return s;
  };
  const num = (key: string, min: number, max: number): HTMLInputElement => {
    const i = document.createElement('input');
    i.type = 'number';
    i.min = String(min);
    i.max = String(max);
    i.value = o[key];
    i.addEventListener('change', () => {
      const n = Math.min(max, Math.max(min, Math.trunc(Number(i.value)) || 0));
      i.value = o[key] = String(n);
    });
    return i;
  };
  const check = (key: string): HTMLInputElement => {
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.checked = o[key] === '1';
    i.addEventListener('change', () => { o[key] = i.checked ? '1' : '0'; });
    return i;
  };
  row('Game type', select('sv_gametype', [['dm', 'Deathmatch (DM)'], ['tdm', 'Team deathmatch (TDM)'], ['ctf', 'Capture the flag (CTF)'], ['lms', 'Last man standing (LMS)'], ['lts', 'Last team standing (LTS)']]));
  row('Map', select('sv_map', MAPS.map((m) => [m, m])));
  row('Score limit', num('sv_scorelimit', 0, 9999));
  row('Time limit (minutes)', num('sv_timelimit', 0, 9999));
  row('Matches per map', num('sv_matches_per_map', 0, 999));
  row('Warmup (seconds)', num('sv_warmup', -1, 9999));
  row('Player slots', num('sv_player_slots', 0, 16));
  row('Team damage', check('sv_teamdamage'));
  row('Power-ups', check('sv_powerups'));
  return box;
}

function packOptions(o: RoomOptions): Uint8Array {
  return packGame(TW.Options, (m) => {
    const keys = Object.keys(o);
    const c = m._initConfig(keys.length);
    keys.forEach((k, i) => {
      c.get(i).key = k;
      c.get(i).value = o[k];
    });
    // the votes an operator would add: every official map
    const v = m._initVotes(MAPS.length);
    MAPS.forEach((name, i) => {
      v.get(i).description = 'Map ' + name;
      v.get(i).command = 'sv_map ' + name;
    });
  });
}

/** what the client knows, for the end-to-end test (games/teeworlds/e2e.mjs) */
export interface Snapshot {
  localId: number;
  /** CClient state: 0 offline, 1 connecting, 2 loading, 3 online */
  state: number;
  tick: number;
  predTick: number;
  /** snapshots received per second (over the last second) */
  snapsPerSecond: number;
  snapshots: number;
  datagramsIn: number;
  datagramsOut: number;
  bytesIn: number;
  bytesOut: number;
  map: string;
  gameType: string;
  menuActive: boolean;
  pointerLocked: boolean;
  /** CNetObj_GameData: game state flags (warmup, round over, ...), score limit, time limit */
  gameStateFlags: number;
  teamScores: [number, number] | null;
  /** CTF: the flags (team 0 red, 1 blue) where they are, and their carriers (CNetObj_GameDataFlag: a client id,
   *  or -2 at its stand, -1 taken, -3 missing) */
  flags: { team: number; x: number; y: number }[];
  flagCarriers: [number, number] | null;
  players: { id: number; name: string; clan: string; team: number; score: number; x: number; y: number; alive: boolean; weapon: number; health: number; armor: number }[];
  chat: { name: string; text: string; clientId: number; mode: number }[];
  /** draw calls of the last frame */
  draws: number;
  /** frames per second (over the last second) */
  fps: number;
  /** snapshot items the client dropped as invalid (CNetObjHandler), and the last reason */
  netobjFailures: number;
  netobjFailedOn: string;
  canvas: { width: number; height: number };
}

class TeeworldsGame implements GameInstance {
  private ctx: GameContext;
  private host: HTMLElement;
  private ac = new AbortController();
  private stopped = false;
  private config: CConfig = defaultConfig();
  private storage = new CStorage();
  private console = new CConsole(CFGFLAG_CLIENT, this.config);
  private client!: CClient;
  private gc!: CGameClient;
  private graphics: CGraphics | null = null;
  private sound: CSound | null = null;
  private input!: CInput;
  private canvas: HTMLCanvasElement | null = null;
  private font: FontFace | null = null;
  private incoming: Uint8Array[] = [];
  private unsub: (() => void)[] = [];
  private savedSettings = '';
  private savedSkins = new Map<string, string>();
  private lastEscape = -1e9;
  private chatLines: Snapshot['chat'] = [];
  stats = { datagramsIn: 0, datagramsOut: 0, bytesIn: 0, bytesOut: 0 };
  private snapTimes: number[] = [];
  private frameTimes: number[] = [];
  /** the end-to-end test's capture-the-flag bot (testbot.ts), when it plays */
  private flagBot: CFlagBot | null = null;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    ctx.signal.addEventListener('abort', () => void this.stop());
  }

  private time_get = (): number => Math.round(performance.now() * 1000);

  async begin(): Promise<void> {
    const ctx = this.ctx;
    const loading = document.createElement('div');
    loading.textContent = 'Loading Teeworlds…';
    loading.style.cssText = 'color:#ccc;font:16px system-ui,sans-serif;margin:2rem;text-align:center';
    this.host.replaceChildren(loading);
    const [settings, skins] = await Promise.all([this.loadSettings(), this.loadSavedSkins(), this.loadData()]);
    if (this.stopped) return;
    const opts = { ...OPTION_DEFAULTS };
    const lobbyBox = document.createElement('div');
    this.host.replaceChildren(optionsPanel(opts), lobbyBox);
    const round = await ctx.lobby(lobbyBox, {
      title: 'Teeworlds',
      dropIn: true,
      seats: { min: 1, max: 16, default: 8 },
      options: () => packOptions(opts),
    });
    if (this.stopped) return;
    this.start(settings, skins, round);
  }

  /** the data directory: every file of the release the client reads (PNGs decoded, maps opened) */
  private async loadData(): Promise<void> {
    const signal = this.ctx.signal;
    const fontUrl = Object.entries(assetUrls).find(([p]) => p.endsWith('/fonts/DejaVuSans.ttf'))?.[1];
    await Promise.all(Object.entries(assetUrls).map(async ([path, url]) => {
      const rel = path.replace(/^\.\.\/\.\.\/assets\//, '');
      const bytes = new Uint8Array(await (await fetch(url, { signal })).arrayBuffer());
      if (rel.startsWith('maps/') && rel.endsWith('.map')) this.pendingMaps.push([rel.slice(5, -4), bytes]);
      else await this.storage.add(rel, bytes);
    }));
    if (fontUrl) {
      const face = new FontFace(FONT_FAMILY, `url(${fontUrl})`);
      await face.load();
      document.fonts.add(face);
      this.font = face;
    }
  }
  private pendingMaps: [string, Uint8Array][] = [];

  private async loadSettings(): Promise<string | null> {
    try {
      const b = await this.ctx.storage.get(SETTINGS_FILE);
      return b ? latin1(b) : null;
    } catch {
      return null;
    }
  }

  private async loadSavedSkins(): Promise<Map<string, Uint8Array>> {
    const out = new Map<string, Uint8Array>();
    try {
      for (const f of await this.ctx.storage.list('skin_')) {
        const name = skinName(f.name);
        if (!name) continue;
        const b = await this.ctx.storage.get(f.name);
        if (b) out.set(name + '.json', b);
      }
    } catch {
      // no saved skins
    }
    return out;
  }

  private start(settings: string | null, skins: Map<string, Uint8Array>, round: RoundStart): void {
    const ctx = this.ctx, signal = this.ac.signal;
    // the window
    const canvas = document.createElement('canvas');
    canvas.tabIndex = 0;
    canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none;touch-action:none;background:#000';
    this.host.style.position ||= 'relative';
    this.host.replaceChildren(canvas);
    this.canvas = canvas;
    this.fitCanvas();
    // main(): the engine's parts, the console, the settings file
    const client = (this.client = new CClient(this.time_get));
    const input = (this.input = new CInput(this.config));
    const graphics = (this.graphics = new CGraphics(canvas, this.config, this.storage));
    const text = new CTextRender(graphics, this.time_get);
    text.LoadFont(new CCanvasRasterizer(`"${FONT_FAMILY}"`));
    const sound = (this.sound = new CSound(this.config, this.storage, ctx.audio, () => !document.hidden && document.hasFocus()));
    const gc = (this.gc = new CGameClient({ client, graphics, text, sound, input, storage: this.storage, console: this.console, config: this.config }));
    for (const [name, b] of skins) gc.m_SavedSkins.set(name, b);
    this.savedSkins = new Map([...skins].map(([n, b]) => [n, latin1(b)]));
    gc.onSkinsChanged = () => void this.saveSkins();
    for (const [name, bytes] of this.pendingMaps) void client.maps.add(name, bytes);
    this.pendingMaps = [];
    this.console.Init();
    gc.OnConsoleInit();
    if (settings !== null) this.console.ExecuteText(settings);
    // the first start (the original asks for the name in its first launch popup): the site's name
    const site = utf8Encode(playerName()).slice(0, 15);
    if (site && (settings === null || this.config.m_PlayerName === 'nameless tee' || !this.config.m_PlayerName)) this.config.m_PlayerName = site;
    this.savedSettings = this.settingsText();
    // CClient::Run
    sound.Init();
    input.Init(canvas, signal);
    input.MouseModeRelative();
    input.wantLock = () => !gc.m_pMenus.IsActive();
    input.onUnlock = () => {
      // the browser took the pointer back with Esc (which then does not reach the page): the client gets its Esc
      if (performance.now() - this.lastEscape > 250) input.Inject(K.KEY_ESCAPE, FLAG_PRESS | FLAG_RELEASE);
    };
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.lastEscape = performance.now(); }, { signal, capture: true });
    gc.m_pMenus.onQuit = () => ctx.exit();
    gc.m_pChat.onLine = (name, line, clientId, mode) => {
      this.chatLines.push({ name: utf8Decode(name), text: utf8Decode(line), clientId, mode });
      if (this.chatLines.length > 100) this.chatLines.shift();
    };
    client.onSnapshotDecoded = () => {
      const now = performance.now();
      this.snapTimes.push(now);
      while (this.snapTimes.length && this.snapTimes[0] < now - 1000) this.snapTimes.shift();
    };
    client.Init(this.netHost(), gc, this.config, this.console);
    gc.OnInit();
    // the room is the server
    this.unsub.push(ctx.rooms.on('message', (m) => {
      if (m.from !== SERVER_SEAT) return;
      let msg: TW.Msg;
      try {
        msg = unpackGame(TW.Msg, m.data);
      } catch {
        return;
      }
      if (!msg._hasUdp()) return;
      const d = msg.udp.toUint8Array().slice();
      this.stats.datagramsIn++;
      this.stats.bytesIn += d.length;
      if (this.incoming.length < 1024) this.incoming.push(d);
    }));
    this.unsub.push(ctx.rooms.on('started', (r) => {
      // the seat came back: the server has a new connection for it, the client connects again
      if (r.rejoined) this.connect();
    }));
    this.unsub.push(ctx.rooms.on('finished', () => client.Disconnect()));
    void round;
    this.connect();
    // the loop
    let lastSave = performance.now();
    ctx.frame(() => {
      if (this.stopped) return;
      const t = performance.now();
      this.frameTimes.push(t);
      while (this.frameTimes[0] < t - 1000) this.frameTimes.shift();
      this.fitCanvas();
      input.Update();
      this.flagBot?.Tick();
      sound.Update();
      client.Frame(true);
      graphics.Swap();
      const now = performance.now();
      if (now - lastSave > 5000) {
        lastSave = now;
        void this.saveSettings();
      }
    }, signal);
    // CClient::Run updates (the network, the time, the input it sends) on every pass of its loop, also when it
    // does not render: between the browser's frames (few on a slow machine, none in a hidden tab) the client
    // keeps its ticks and inputs going (CClient::Update without the input events, which a frame handles)
    const timer = setInterval(() => {
      if (this.stopped) return;
      this.flagBot?.Tick();
      client.UpdateTime();
      client.PumpNetwork();
    }, 5);
    signal.addEventListener('abort', () => clearInterval(timer));
  }

  private connect(): void {
    this.incoming = [];
    this.client.Connect(SERVER_ADDR, SERVER_ADDR_STR);
  }

  private netHost(): NetHost {
    const rooms = this.ctx.rooms;
    return {
      send: (_addr, data) => {
        this.stats.datagramsOut++;
        this.stats.bytesOut += data.length;
        if (rooms.round) rooms.send(packGame(TW.Msg, (m) => { m._initUdp(data.length).copyBuffer(data); }), 'server', false);
      },
      recv: () => {
        const d = this.incoming.shift();
        return d ? { addr: SERVER_ADDR.copy(), data: d } : null;
      },
      time_get: this.time_get,
      secure_random_fill: (b) => { crypto.getRandomValues(b); },
      random_int: () => Math.floor(Math.random() * 0x80000000),
    };
  }

  /** the canvas fills the game's area, in device pixels */
  private fitCanvas(): void {
    const c = this.canvas;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(c.clientWidth * dpr)), h = Math.max(1, Math.round(c.clientHeight * dpr));
    if (this.graphics) {
      if (w !== this.graphics.ScreenWidth() || h !== this.graphics.ScreenHeight()) this.graphics.Resize(w, h);
    } else {
      c.width = w;
      c.height = h;
    }
  }

  private settingsText(): string {
    const gc = this.gc;
    return this.console.SaveConfig((line) => {
      gc.m_pBinds.ConfigSave(line);
      gc.Friends().ConfigSave(line);
      gc.Blacklist().ConfigSave(line);
    });
  }

  /** CConfigManager::Save: settings.cfg when it changed */
  private async saveSettings(): Promise<void> {
    if (!this.gc) return;
    const t = this.settingsText();
    if (t === this.savedSettings) return;
    this.savedSettings = t;
    try {
      await this.ctx.storage.put(SETTINGS_FILE, bytesOf(t));
    } catch {
      // not saved (no connection): saved with the next change
      this.savedSettings = '';
    }
  }

  /** the skin files (skins/<name>.json of the save directory) */
  private async saveSkins(): Promise<void> {
    const now = new Map([...this.gc.m_SavedSkins].map(([n, b]) => [n, latin1(b)]));
    try {
      for (const [n, t] of now) if (this.savedSkins.get(n) !== t) await this.ctx.storage.put(skinFile(n.replace(/\.json$/, '')), bytesOf(t));
      for (const n of this.savedSkins.keys()) if (!now.has(n)) await this.ctx.storage.delete(skinFile(n.replace(/\.json$/, '')));
      this.savedSkins = now;
    } catch {
      // not saved
    }
  }

  snapshot(): Snapshot | null {
    const gc = this.gc, cl = this.client;
    if (!gc || !cl) return null;
    const S = gc.m_Snap;
    const players: Snapshot['players'] = [];
    for (let i = 0; i < gc.m_aClients.length; i++) {
      const c = gc.m_aClients[i];
      if (!c.m_Active) continue;
      const ch = S.m_aCharacters[i];
      const pi = S.m_paPlayerInfos[i];
      players.push({
        id: i, name: utf8Decode(c.m_aName), clan: utf8Decode(c.m_aClan), team: c.m_Team, score: pi ? pi.m_Score : 0,
        x: ch.m_Active ? ch.m_Cur.m_X : 0, y: ch.m_Active ? ch.m_Cur.m_Y : 0, alive: ch.m_Active,
        weapon: ch.m_Active ? ch.m_Cur.m_Weapon : -1, health: ch.m_Active ? ch.m_Cur.m_Health : 0, armor: ch.m_Active ? ch.m_Cur.m_Armor : 0,
      });
    }
    return {
      localId: gc.m_LocalClientID, state: cl.State(), tick: cl.GameTick(), predTick: cl.PredGameTick(),
      snapsPerSecond: this.snapTimes.length, snapshots: cl.stats.snapshots,
      ...this.stats,
      map: utf8Decode(cl.CurrentMap()), gameType: cl.GetServerInfo().m_aGameType,
      menuActive: gc.m_pMenus.IsActive(), pointerLocked: this.input.locked(),
      gameStateFlags: S.m_pGameData ? S.m_pGameData.m_GameStateFlags : 0,
      teamScores: S.m_pGameDataTeam ? [S.m_pGameDataTeam.m_TeamscoreRed, S.m_pGameDataTeam.m_TeamscoreBlue] : null,
      flags: S.m_paFlags.filter((x): x is P.CNetObj_Flag => !!x).map((x) => ({ team: x.m_Team, x: x.m_X, y: x.m_Y })),
      flagCarriers: S.m_pGameDataFlag ? [S.m_pGameDataFlag.m_FlagCarrierRed, S.m_pGameDataFlag.m_FlagCarrierBlue] : null,
      players, chat: this.chatLines.slice(),
      draws: this.graphics?.stats.lastDraws ?? 0,
      fps: this.frameTimes.length,
      netobjFailures: gc.NetobjNumFailures(), netobjFailedOn: gc.NetobjFailedOn(),
      canvas: { width: this.canvas?.width ?? 0, height: this.canvas?.height ?? 0 },
    };
  }

  /** test hooks: what a player does, without the browser's input events */
  say(text: string, team = false): void { this.gc?.m_pChat.Say(team ? P.CHAT_TEAM : P.CHAT_ALL, utf8Encode(text)); }
  command(line: string): void { this.console.ExecuteLine(utf8Encode(line)); }
  key(name: string, down: boolean): void {
    const k = K.g_aaKeyStrings.indexOf(name);
    if (k > 0) this.input?.Inject(k, down ? FLAG_PRESS : FLAG_RELEASE);
  }
  type(text: string): void { this.input?.Inject(0, FLAG_TEXT, utf8Encode(text)); }
  /** the aim, relative to the tee (CControls::m_MousePos) */
  aim(x: number, y: number): void {
    const c = this.gc?.m_pControls;
    if (c) c.m_MousePos = new (c.m_MousePos.constructor as new (x: number, y: number) => typeof c.m_MousePos)(x, y);
  }
  online(): boolean { return this.client?.State() === STATE_ONLINE; }
  /** the test's capture-the-flag bot plays this client (or stops); only on a local test server, never on the site */
  bot(on: boolean): void {
    const h = typeof location === 'undefined' ? '' : location.hostname;
    if (h !== 'localhost' && h !== '127.0.0.1' && h !== '[::1]') return;
    this.flagBot = on && this.gc ? new CFlagBot(this.gc) : null;
    if (!on && this.gc) {
      const c = this.gc.m_pControls;
      c.m_InputDirectionLeft = c.m_InputDirectionRight = 0;
      c.m_InputData.m_Jump = c.m_InputData.m_Hook = 0;
    }
  }

  async stop(): Promise<void> {
    if (this.stopped) return;
    this.stopped = true;
    // CClient::Run's end: the settings, the disconnect, the engine's parts
    try {
      if (this.client && this.client.State() !== STATE_OFFLINE) this.client.Disconnect();
      // let the close packet go out before the room is left
      this.client?.PumpNetwork();
    } catch {
      // the connection is gone already
    }
    void this.saveSettings();
    for (const u of this.unsub) u();
    this.unsub = [];
    this.ac.abort();
    this.sound?.Shutdown();
    this.graphics?.Shutdown();
    this.graphics = null;
    if (this.font) document.fonts.delete(this.font);
    if (this.ctx.rooms.room) this.ctx.rooms.leave();
  }
}

export async function startTeeworlds(host: HTMLElement, ctx: GameContext): Promise<GameInstance> {
  const game = new TeeworldsGame(host, ctx);
  const w = globalThis as unknown as { __teeworlds?: unknown };
  w.__teeworlds = {
    snapshot: () => game.snapshot(),
    say: (text: string, team?: boolean) => game.say(text, team),
    command: (line: string) => game.command(line),
    key: (name: string, down: boolean) => game.key(name, down),
    type: (text: string) => game.type(text),
    aim: (x: number, y: number) => game.aim(x, y),
    online: () => game.online(),
    bot: (on: boolean) => game.bot(on),
    TIME_FREQ,
  };
  ctx.signal.addEventListener('abort', () => { delete w.__teeworlds; });
  void game.begin().catch((e) => {
    if (!ctx.signal.aborted) {
      console.error('teeworlds:', e);
      ctx.exit();
    }
  });
  return game;
}
