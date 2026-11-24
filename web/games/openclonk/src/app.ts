// OpenClonk in the browser: the original's application on the page. Everything the game does is the original's code
// as the translator wrote it (src/gen): C4Application::Init with a command line, as the installed game is started with a
// player file and a scenario (`openclonk Clonk.ocp Tutorials.ocf/Tutorial01.ocs`), its SDL window and OpenGL context
// on the page's canvas (rt/sdl.ts, rt/gl.ts), its sound on WebAudio (rt/al.ts), and its main loop
// (C4AbstractApp::Run: ScheduleProcs) one round per animation frame: the SDL events the page queued go to the
// original's HandleSDLEvent, and the game timer (CStdMultimediaTimerProc on a timerfd, rt/fs.ts) runs
// C4Application::GameTick and Draw when it has expired, at the original's rate.
import { initGlobals } from './gen/index.ts';
import { $ } from './rt/registry.ts';
import { P, S } from './rt/ptr.ts';
import { addFile, c$mkdir, listDir, readFile, removePath, resetFs, takeChangesOf } from './rt/fs.ts';
import { $io, ENVIRONMENT } from './rt/libc.ts';
import { C4Group, unpackGroupFile } from './rt/group.ts';
import { glMakeCurrent, glSetWindowCanvas } from './rt/gl.ts';
import {
  sdlPushEvent, sdlReset, sdlSetCanvas, sdlSetModState, sdlSetMouse, sdlPollGamepads, SCANCODES, SDL_KEYDOWN, SDL_KEYUP, SDL_TEXTINPUT,
  SDL_MOUSEMOTION, SDL_MOUSEBUTTONDOWN, SDL_MOUSEBUTTONUP, SDL_MOUSEWHEEL, SDL_WINDOWEVENT, SDL_WINDOWEVENT_SIZE_CHANGED,
  SDL_PRESSED, SDL_RELEASED, KMOD_LSHIFT, KMOD_RSHIFT, KMOD_LCTRL, KMOD_RCTRL, KMOD_LALT, KMOD_RALT, KMOD_LGUI, KMOD_RGUI,
} from './rt/sdl.ts';
import { alSetAudioContext, decodeOggVorbis, decodeOggVorbisStart } from './rt/al.ts';
import { $spawn, coroReset, coroResume, coroWaiting } from './rt/coro.ts';
import { crc32 } from './rt/StdBuf.ts';
import { zlibSync } from 'fflate';
import { NONCOMMERCIAL_FILES, NONCOMMERCIAL_PATHS } from './settings.ts';

/** where the original's Linux build looks for its content (config.h OC_SYSTEM_DATA_DIR, CMAKE_INSTALL_PREFIX /usr/local) */
export const GAME_DATA = '/usr/local/share/games/openclonk/';
/** the player's home folder (rt/libc ENVIRONMENT.HOME): the original keeps its config and player files in ~/.clonk/openclonk */
export const USER_DATA = `${ENVIRONMENT.HOME}/.clonk/openclonk/`;

/** one content group of the original's planet folder (packed by re/openclonk/tools/pack.sh) */
export interface ContentGroup { name: string; data: Uint8Array }
/** one file shipped outside its packed group (the non-commercial files, settings.ts) */
export interface ContentFile { path: string; data: Uint8Array }

/** unpacks a packed group (and the groups in it) into the in-memory file system; the engine reads them as folders */
export function mountGroup(path: string, data: Uint8Array, depth = 0): void {
  if (depth > 8) throw new Error(`group nesting too deep at ${path}`);
  const group = new C4Group(path, depth === 0 ? unpackGroupFile(data) : data);
  for (const e of group.entries) {
    if (e.deleted) continue;
    const entry = path + '/' + e.name;
    const bytes = group.LoadEntry(e.name);
    if (!bytes) continue;
    if (e.ChildGroup) mountGroup(entry, bytes, depth + 1);
    else addFile(entry, bytes);
  }
}

const mkdirs = (path: string) => {
  let at = '';
  for (const part of path.split('/').filter(Boolean)) {
    at += '/' + part;
    c$mkdir(S(at), 0);
  }
};

export interface AppOptions {
  /** the game's window; its WebGL2 context is made when the original asks SDL for one (rt/gl.ts) */
  canvas: HTMLCanvasElement;
  /** keep the picture after each frame (tests read it back) */
  preserveDrawingBuffer?: boolean;
  audio: AudioContext | null;
  groups: ContentGroup[];
  files?: ContentFile[];
  noncommercial?: boolean;
  /** the scenario below the content folder, e.g. "Tutorials.ocf/Tutorial01.ocs"; without one (and without a replay) the
   *  original opens its start menu, as when it is started without a scenario */
  scenario?: string;
  /** a record to replay (a packed scenario group with CtrlRec.ocb), put into ~/.clonk/openclonk/Records.ocf */
  replay?: { name: string; data: Uint8Array };
  /** the local player's name: a player file Clonk.ocp, as the original's player selection writes it */
  playerName?: string;
  /** more local players (local multiplayer, the Arena's melees): a player file each, all on the command line; a player
   *  may name its control set (PlayerControls.txt: "Gamepad_GamepadCon_IntQueue_" for a gamepad) */
  morePlayers?: (string | { name: string; controlSet: string })[];
  /** the original's config file (~/.clonk/openclonk/config) to start with, e.g. with the missions a player unlocked */
  config?: string;
  /** further command line options of the original (--record, --nonetwork, ...) */
  options?: string[];
  /** the original's log (stdout, where its Log goes on Linux) */
  log?: (line: string) => void;
}

/**
 * What the game calls of the parts of the original that are left out of the port (config.py OPAQUE: the network, the
 * script debugger, the editor): their answer in the game as the page starts it. The script debugger (script/C4AulDebug,
 * a TCP server for an external debugger) exists only when the original is started with --debug; without it
 * C4AulDebug::GetDebugger() is null. The editor's console (editor/C4Console) is not active in the game
 * (--fullscreen): its methods return at once (C4Console::Message, UpdateMenus, ... `if (!Active) return`), and the
 * Linux build without Qt has an empty C4ConsoleGUI::Out (C4Console.cpp), which C4Console::Out calls.
 */
function leftOut(): unknown {
  const $$ = $ as any;
  $$.C4AulDebug.GetDebugger = () => null;
  // the network (network/C4Network2, left out: the site's rooms replace it, milestone 4) in a game that is not a
  // network game: C4Game::Execute calls Network.Execute, which has nothing to do; no record streams
  const network = $$.Network;
  network.Execute$v = () => {};
  network.Clear$v = () => {};
  network.Start$v = () => true;
  network.FinishStreaming = () => {};
  // its network clients (C4Network2ClientList): none in a game that is not a network game
  network.Clients = new Proxy({}, { get: (_t, k) => (typeof k === 'string' && /^[A-Z]/.test(k) ? () => null : undefined) });
  // and its I/O (C4Network2IO): no traffic, the rates the statistics read (getProtIRate, ...) are 0
  network.NetIO = new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? () => 0 : undefined) });
  // and its resources (C4Network2ResList): none, so C4Player::Save finds no resource of the player file to update
  // (getRefRes answers an empty C4Network2Res::Ref)
  network.ResList = new Proxy({}, {
    get: (_t, k) => (typeof k !== 'string' ? undefined
      : k.startsWith('getRefRes') ? () => new $$.C4Network2Res$Ref().init$pC4Network2Res(null) : () => null),
  });
  // the rest of C4Network2 in a game that is not a network game: no lobby (GetLobby, which the game-over dialog's
  // player list asks), not active, not the host of a network: every other method answers null
  $$.Network = new Proxy(network, {
    get: (t, k) => (k in t ? t[k] : typeof k === 'string' && /^(Get|is|Is|Has|has)[A-Z]?/.test(k) ? () => null : undefined),
  });
  const offline = $$.Network;
  for (const n of ['C4NetIO$HostAddress', 'C4NetIO$EndpointAddress']) {
    const p = $$[n]?.prototype;
    if (p) p.Clear ??= function () {};
  }
  // network/C4NetIO's C4NetIOPacket: a StdCopyBuf with an address. A copy of a control packet goes through one
  // (C4IDPacket's copy constructor: unpack(pack())), the address stays empty
  const StdCopyBuf = $$.StdCopyBuf;
  $$.C4NetIOPacket = class extends StdCopyBuf {
    addr: unknown = null;
    init$v() { return this; }
    init$StdBuf$addr_t(buf: unknown, addr: unknown) { super.init$StdBuf$b(buf, true); this.addr = addr; return this; }
    getStatus() { const d = this.getMData(); return this.getSize() && d ? (d.a[d.o] << 24) >> 24 : 0; }
    getPBuf() { return this.getSize() ? this.getPart(1, this.getSize() - 1) : this.getRef(); }
  };
  // the editor's object list (C4ObjectListDlg.cpp: ObjectListChangeListener = Console.ObjectListDlg), whose
  // notifications do nothing in a build without Qt: the listener's own empty virtual methods
  $$.ObjectListChangeListener = new $$.C4ObjectListChangeListener();
  // every method of the inactive console does nothing (its edit cursor holds no object: ClearPointers has nothing to
  // clear); Message answers false
  const console = $$.Console;
  console.Active = false;
  console.Editing = false;
  console.Message = () => false;
  $$.Console = new Proxy(console, {
    get: (t, k) => (k in t ? t[k] : typeof k === 'string' && /^[A-Z]/.test(k) ? () => undefined : undefined),
  });
  return offline;
}

/**
 * With NONCOMMERCIAL_FILES off the start menu's two parchment images (Graphics.ocg/StartupDlgPaper.png, the scenario
 * selection's and the options' pages, and StartupPlrPropBG.png, the player properties' background) are not shipped,
 * and the original does not open its start menu without them (C4StartupGraphics::Init returns false, "IDS_ERR_NOGFXSYS",
 * and the application quits). The smallest deviation: the page puts plain images of the same sizes in their place, one
 * colour of its own choice (not taken from the parchment), so the original's code runs unchanged
 * (README "Deviations", LICENSE.md "Non-commercial files").
 */
export const PARCHMENT_STANDINS: readonly { path: string; width: number; height: number }[] = [
  { path: 'Graphics.ocg/StartupDlgPaper.png', width: 628, height: 483 },
  { path: 'Graphics.ocg/StartupPlrPropBG.png', width: 365, height: 400 },
];
/** the stand-ins' colour, RGBA: a light sand */
export const STANDIN_RGBA = [0xd8, 0xc8, 0xa4, 0xff] as const;

/** a PNG of one colour (RGBA, 8 bits each) */
export function plainPng(width: number, height: number, rgba: readonly number[]): Uint8Array {
  const row = 1 + width * 4;
  const raw = new Uint8Array(row * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) raw.set(rgba, y * row + 1 + x * 4);
  const chunk = (type: string, data: Uint8Array) => {
    const out = new Uint8Array(12 + data.length);
    const v = new DataView(out.buffer);
    v.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    v.setUint32(8 + data.length, crc32(0, out.subarray(4, 8 + data.length)) >>> 0);
    return out;
  };
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, width);
  new DataView(ihdr.buffer).setUint32(4, height);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const parts = [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr),
    chunk('IDAT', zlibSync(raw)), chunk('IEND', new Uint8Array(0))];
  const png = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { png.set(p, o); o += p.length; }
  return png;
}

/**
 * The start menu's button for what the site replaces: the mods (C4StartupModsDlg: downloads from the mod database). Its
 * dialog is not translated (config.py GAME_OPAQUE); the button tells so in the original's own message box
 * (C4GUI::Screen::ShowMessage) instead of switching to it. The network game's button (C4StartupNetDlg) leads to the
 * site's rooms (src/lobby.ts).
 */
function leftOutStartup(): void {
  const $$ = $ as any;
  // Ico_Notify (C4Gui.h Icons) is 1
  const tell = (caption: string, text: string) => $$.pGUI?.ShowMessage(S(text), S(caption), 1, null);
  const main = $$.C4StartupMainDlg?.prototype;
  if (!main) return;
  main.OnModsBtn = () => tell('Mods', 'Mods are not part of this browser port: it plays the original\'s own content.');
}

/** the C4Application of the original, running on the page */
export class OriginalApp {
  readonly engine: any = $;
  private opts: AppOptions;
  private logLine = '';

  constructor(opts: AppOptions) {
    this.opts = opts;
  }

  private args: string[] = [];

  /** the file system as an installed game has it, the command line, the page's window, sound and OpenGL context */
  prepare(): void {
    const o = this.opts;
    const log = o.log ?? (() => {});
    // the original's stdout (C4Log writes each line there on Linux)
    $io.out = (s: string) => {
      this.logLine += s;
      let i: number;
      while ((i = this.logLine.indexOf('\n')) >= 0) { log(this.logLine.slice(0, i)); this.logLine = this.logLine.slice(i + 1); }
    };
    $io.err = $io.out;
    sdlReset();
    sdlSetCanvas(o.canvas);
    glSetWindowCanvas(o.canvas, !!o.preserveDrawingBuffer);
    glMakeCurrent(null);
    alSetAudioContext(o.audio);
    initGlobals(true);
    this.offline = leftOut();
    leftOutStartup();
    coroReset();
    resetFs();
    mkdirs(GAME_DATA);
    for (const g of o.groups) mountGroup(GAME_DATA + g.name, g.data);
    const noncommercial = o.noncommercial ?? NONCOMMERCIAL_FILES;
    for (const f of o.files ?? []) {
      if (!noncommercial && NONCOMMERCIAL_PATHS.includes(f.path)) continue;
      addFile(GAME_DATA + f.path, f.data);
    }
    if (!noncommercial) {
      for (const s of PARCHMENT_STANDINS) addFile(GAME_DATA + s.path, plainPng(s.width, s.height, STANDIN_RGBA));
    }
    mkdirs(USER_DATA);
    mkdirs('/tmp');
    // --fullscreen: the game, not the editor (which the original opens for a scenario on its command line by default)
    const args = ['openclonk', '--fullscreen', ...(o.options ?? [])];
    if (o.config !== undefined) addFile(USER_DATA + 'config', new TextEncoder().encode(o.config));
    for (const [i, entry] of (o.playerName ? [o.playerName, ...(o.morePlayers ?? [])] : []).entries()) {
      const player = typeof entry === 'string' ? entry : entry.name;
      const controlSet = typeof entry === 'string' ? '' : `ControlSet="${entry.controlSet}"\n`; // a StdStrBuf: escaped, in quotes
      // a crew is a folder with Player.txt (C4PlayerInfoCore); the start menu's player selection writes one for a new
      // player (C4StartupPlrPropertiesDlg: C4P.Default, the new comment, colour PrefColor with its value of
      // GetPrefColorValue, OldPrefControlStyle 1, OldPrefAutoContextMenu 1, OldPrefControl 0; no control set, so
      // C4Player::InitControl takes the default set, the first of PlayerControls.txt: WASD, hotkeys, mouse)
      const name = player.replace(/[\\/:*?"<>|]/g, '_').slice(0, 30);
      const file = USER_DATA + (i === 0 ? 'Clonk.ocp' : `${name}.ocp`);
      const colors = [4278190312, 4294901760, 4278255360, 4294967040];
      mkdirs(file);
      addFile(file + '/Player.txt', new TextEncoder().encode(
        `[Player]\nName=${name}\nComment=I'm new.\n\n[Preferences]\nColor=${i}\nColorDw=${colors[i % 4]}\nControl=0\nAutoStopControl=1\nAutoContextMenu=1\n${controlSet}`));
      args.push(file);
    }
    if (o.replay) {
      mkdirs(USER_DATA + 'Records.ocf');
      mountGroup(USER_DATA + 'Records.ocf/' + o.replay.name, o.replay.data);
      args.push(USER_DATA + 'Records.ocf/' + o.replay.name);
    } else if (o.scenario) {
      args.push(GAME_DATA + o.scenario);
    }
    this.args = args;
  }

  /**
   * decodes every Ogg Vorbis sound of the content, and the first seconds of each piece of music: the original's loader
   * decodes a sound when the game loads it, synchronously, which the browser cannot; the music is decoded while it
   * plays (rt/al.ts decodeOggVorbisStart)
   */
  async decodeSounds(progress?: (done: number, total: number) => void): Promise<number> {
    const files: { path: string; music: boolean }[] = [];
    const walk = (dir: string, music: boolean) => {
      for (const name of listDir(dir) ?? []) {
        const path = dir + name;
        if (/\.ogg$/i.test(name)) files.push({ path, music });
        else if (listDir(path + '/')) walk(path + '/', music || name === 'Music.ocg');
      }
    };
    walk(GAME_DATA, false);
    let done = 0, ok = 0;
    const next = async (): Promise<void> => {
      for (let f = files.pop(); f; f = files.pop()) {
        const data = readFile(f.path);
        if (data && await (f.music ? decodeOggVorbisStart(data) : decodeOggVorbis(data))) ok++;
        progress?.(++done, done + files.length);
      }
    };
    await Promise.all([0, 1, 2, 3].map(next));
    return ok;
  }

  /** C4Network2 of a game that is not a network game (leftOut) */
  private offline: unknown = null;

  /**
   * C4Network2 (`::Network`): an online round's (src/net.ts, the site's rooms in its place), or null for the game without
   * the network; what the online one does not have answers as the latter
   */
  setNetwork(online: object | null): void {
    const offline = this.offline as Record<string | symbol, unknown>;
    ($ as any).Network = online
      ? new Proxy(online, { get: (t: any, k) => (k in t ? t[k] : offline[k]) })
      : offline;
  }

  /** C4Application::Init with the command line */
  start(): boolean {
    const argv = this.args.map((a) => S(a));
    return !!$spawn($.Application.Init$i32$ppi8(argv.length, P(argv, 0)));
  }

  /** prepare() and start() (without sounds) */
  init(): boolean {
    this.prepare();
    return this.start();
  }

  /**
   * one round of the original's main loop (C4AbstractApp::Run: ScheduleProcs, here without waiting); while a modal
   * dialog waits in its own loop (rt/coro.ts), one round of that loop instead, as the original's outer loop waits
   */
  frame(catchUpMs = 10): void {
    // the browser's gamepads as SDL's game controllers (platform/C4GamePadCon reads them as SDL events)
    sdlPollGamepads();
    if (coroWaiting()) {
      coroResume();
      return;
    }
    const game = ($ as any).Game;
    const end = performance.now() + catchUpMs;
    let frame = game?.FrameCounter ?? 0;
    $spawn($.Application.ScheduleProcs(0));
    // the original's main loop does not wait while the game short-circuits its timer (C4Game::Ticks: GameGo, set when the
    // network's complete control is ahead, C4GameControl::Ticks, or at full speed): more rounds within this animation frame
    // while each executed a frame
    while (game?.GameGo && game.IsRunning && game.FrameCounter > frame && !coroWaiting() && performance.now() < end) {
      frame = game.FrameCounter;
      $spawn($.Application.ScheduleProcs(0));
    }
  }

  /**
   * a group the original wrote as a folder (a savegame: a copy of its scenario, which the page's content has unpacked),
   * packed as the original packs a folder (C4Group_PackDirectoryTo), for the storage (src/storage.ts)
   */
  packFolder(path: string): Uint8Array | null {
    const tmp = `/tmp/storage-pack-${++this.packs}.ocg`;
    try {
      if (!$.C4Group_PackDirectoryTo(S(path), S(tmp))) return null;
      return readFile(tmp)?.slice() ?? null;
    } finally {
      removePath(tmp);
      takeChangesOf('/tmp/');
    }
  }
  private packs = 0;

  /** how many modal loops wait (rt/coro.ts) */
  get modal(): number { return coroWaiting(); }

  get frameCounter(): number { return $.Game?.FrameCounter ?? 0; }
  get quit(): boolean { return !!$.Application.fQuitMsgReceived; }

  // ---- the page's events as SDL's

  private mod(e: KeyboardEvent | MouseEvent): number {
    let m = 0;
    if (e.shiftKey) m |= KMOD_LSHIFT;
    if (e.ctrlKey) m |= KMOD_LCTRL;
    if (e.altKey) m |= KMOD_LALT;
    if (e.metaKey) m |= KMOD_LGUI;
    return m;
  }

  /** a key (KeyboardEvent.code is the key's place, SDL's scancode); SDL also sends the text of a printable key */
  key(e: KeyboardEvent, down: boolean): boolean {
    const scancode = SCANCODES[e.code];
    if (scancode === undefined) return false;
    let mod = this.mod(e);
    // the modifier key itself, as SDL reports it after the key event
    if (/^Shift/.test(e.code)) mod = down ? mod | (e.code.endsWith('Right') ? KMOD_RSHIFT : KMOD_LSHIFT) : mod & ~(KMOD_LSHIFT | KMOD_RSHIFT);
    if (/^Control/.test(e.code)) mod = down ? mod | (e.code.endsWith('Right') ? KMOD_RCTRL : KMOD_LCTRL) : mod & ~(KMOD_LCTRL | KMOD_RCTRL);
    if (/^Alt/.test(e.code)) mod = down ? mod | (e.code.endsWith('Right') ? KMOD_RALT : KMOD_LALT) : mod & ~(KMOD_LALT | KMOD_RALT);
    if (/^(Meta|OS)/.test(e.code)) mod = down ? mod | (e.code.endsWith('Right') ? KMOD_RGUI : KMOD_LGUI) : mod & ~(KMOD_LGUI | KMOD_RGUI);
    sdlSetModState(mod);
    sdlPushEvent({ type: down ? SDL_KEYDOWN : SDL_KEYUP, key: { keysym: { scancode, sym: 0, mod }, repeat: e.repeat ? 1 : 0, state: down ? SDL_PRESSED : SDL_RELEASED } });
    if (down && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const bytes = new TextEncoder().encode(e.key);
      const text = new Int8Array(32);
      text.set(new Int8Array(bytes.buffer, 0, Math.min(31, bytes.length)));
      sdlPushEvent({ type: SDL_TEXTINPUT, text: { text } });
    }
    return true;
  }

  private buttons = 0;
  /** the pointer in the canvas's pixels */
  private at(e: MouseEvent): [number, number] {
    const r = this.opts.canvas.getBoundingClientRect();
    const sx = this.opts.canvas.width / Math.max(1, r.width), sy = this.opts.canvas.height / Math.max(1, r.height);
    return [Math.floor((e.clientX - r.left) * sx), Math.floor((e.clientY - r.top) * sy)];
  }
  mouseMove(e: MouseEvent): void {
    const [x, y] = this.at(e);
    sdlSetMouse(x, y, this.buttons);
    sdlPushEvent({ type: SDL_MOUSEMOTION, motion: { x, y, state: this.buttons } });
  }
  /** SDL's buttons: 1 left, 2 middle, 3 right, 4 and 5 the side buttons; clicks 2 for a double click */
  mouseButton(e: MouseEvent, down: boolean): void {
    const [x, y] = this.at(e);
    const button = [1, 2, 3, 4, 5][e.button] ?? 1;
    if (down) this.buttons |= 1 << (button - 1); else this.buttons &= ~(1 << (button - 1));
    sdlSetMouse(x, y, this.buttons);
    sdlSetModState(this.mod(e));
    sdlPushEvent({ type: down ? SDL_MOUSEBUTTONDOWN : SDL_MOUSEBUTTONUP, button: { button, state: down ? SDL_PRESSED : SDL_RELEASED, clicks: down && e.detail >= 2 ? 2 : 1, x, y } });
  }
  wheel(e: WheelEvent): void {
    const [x, y] = this.at(e);
    sdlSetMouse(x, y, this.buttons);
    sdlSetModState(this.mod(e));
    sdlPushEvent({ type: SDL_MOUSEWHEEL, wheel: { x: 0, y: e.deltaY < 0 ? 1 : -1 } });
  }
  /** the canvas got another size: SDL's window event, which the original's C4Window handles */
  resized(w: number, h: number): void {
    sdlPushEvent({ type: SDL_WINDOWEVENT, window: { windowID: 1, event: SDL_WINDOWEVENT_SIZE_CHANGED, data1: w, data2: h } });
  }
}
