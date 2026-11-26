// Browser side of test/menu.test.ts: the original's application (src/app.ts) started as the page starts it, without a
// scenario, so that it opens its start menu; the player's files come from a stand-in of the site's storage (src/storage.ts
// over a Map the test hands in and gets back). The test drives the original's own GUI with the page's mouse and keys: it
// finds an element by what the original made it with (a button by its callback, a list item by its text) and clicks its
// middle, as a player would (SDL events into the original's HandleSDLEvent).
import { OriginalApp, USER_DATA, type ContentFile } from '../../src/app.ts';
import { UserFiles, type FileStore } from '../../src/storage.ts';
import { addFile, isDir, listDir, readFile, takeChanges } from '../../src/rt/fs.ts';
import { P, S } from '../../src/rt/ptr.ts';
import { OnlineGames } from '../../src/lobby.ts';
import { readOptions, packServerMsg, type TickControl } from '../../src/online.ts';
import { Msg } from '../../src/proto/openclonk.ts';
import { unpackGame, bytes, type RoundStart, type GameMessage } from '../../../../src/sdk/index.ts';

interface Boot {
  groups: string[]; width: number; height: number; noncommercial: boolean; files: string[];
  /** the storage's files (name -> bytes as arrays) */
  storage: Record<string, number[]>;
  /** further command line options; a scenario path below the user folder or the content */
  options?: string[]; scenario?: string; userScenario?: string;
  /** a new player file Clonk.ocp with this name on the command line (as src/app.ts makes one) */
  playerName?: string;
  /**
   * network games as the page has them (src/lobby.ts), with a stand-in of the site's lobby (it starts a round for one
   * seat with the options the page gives it) and of the rooms and the server module (each control comes back as the
   * tick's complete control, the seat's join in tick 0)
   */
  online?: boolean;
}


class MapStore implements FileStore {
  files = new Map<string, Uint8Array>();
  async get(name: string) { return this.files.get(name)?.slice() ?? null; }
  async put(name: string, data: Uint8Array) {
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(name) || data.length > 512 * 1024) throw new Error(`storage refuses ${name} (${data.length})`);
    this.files.set(name, data.slice());
  }
  async delete(name: string) { return this.files.delete(name); }
  async list(prefix = '') { return [...this.files].filter(([n]) => n.startsWith(prefix)).map(([name, d]) => ({ name, size: d.length })); }
}

const w = globalThis as any;
/** what the stand-in lobby was asked and what the stand-in module got */
const net = { lobby: null as null | { title?: string; options: ReturnType<typeof readOptions>; dropIn?: boolean }, controls: 0, packets: 0, checks: 0 };
w.ocMenuNet = () => net;

function onlineStandIns(signal: AbortSignal) {
  const handlers = new Map<string, Set<(v: any) => void>>();
  const emit = (k: string, v: unknown) => { for (const h of handlers.get(k) ?? []) h(v); };
  let seq = 0;
  const rooms = {
    on(k: string, h: (v: any) => void) {
      if (!handlers.has(k)) handlers.set(k, new Set());
      handlers.get(k)!.add(h);
      return () => handlers.get(k)!.delete(h);
    },
    send(data: Uint8Array) {
      // the module: a tick for each control of the one seat
      const m = unpackGame(Msg, data);
      if (m._isSyncCheck) { net.checks++; return; }
      if (!m._isControl) return;
      net.controls++;
      const ctrl = bytes(m.control.ctrl);
      if (ctrl.length) net.packets++;
      const tick: TickControl = { tick: m.control.tick, events: m.control.tick === 0 ? [{ seat: 0, kind: 'join' }] : [],
        controls: ctrl.length ? [{ seat: 0, tick: m.control.tick, ctrl }] : [] };
      const msg: GameMessage = { from: 255, seq: ++seq, data: packServerMsg({ t: 'tick', tick }), serverTime: 0 };
      setTimeout(() => emit('message', msg), 0);
    },
    leave() {},
  };
  const ctx = {
    signal, rooms, net: { rtt: 0 },
    lobby: async (_host: HTMLElement, o: { title?: string; options?: () => Uint8Array; dropIn?: boolean }) => {
      const options = o.options!();
      net.lobby = { title: o.title, options: readOptions(options), dropIn: o.dropIn };
      const round: RoundStart = { room: 1, round: 1, seed: 12345n, seats: [{ seat: 0, accountId: 1, name: 'Tester', ready: true, connected: true }],
        options, you: 0, serverTime: 0, rejoined: false };
      return round;
    },
  };
  return ctx;
}
let online: OnlineGames | null = null;
/** a class's name (the bundler writes some with a leading underscore) */
const cname = (o: any): string => String(o?.constructor?.name ?? '').replace(/^_/, '');
let app: OriginalApp;
let store: MapStore;
let user: UserFiles;
const log: string[] = [];
let error = '';
const cString = (p: any): string => {
  if (!p) return '';
  if (typeof p.getData === 'function') p = p.getData();
  if (!p || !p.a) return '';
  let s = '';
  for (let i = p.o; i < p.a.length && p.a[i]; i++) s += String.fromCharCode(p.a[i] & 0xff);
  try { return decodeURIComponent(escape(s)); } catch { return s; }
};

w.ocMenuBoot = async (b: Boot) => {
  const fetchBytes = async (url: string) => new Uint8Array(await (await fetch(url)).arrayBuffer());
  const groups = await Promise.all(b.groups.map(async (name) => ({ name, data: await fetchBytes('/assets/' + name) })));
  const files: ContentFile[] = await Promise.all(b.files.map(async (path) => ({ path, data: await fetchBytes('/assets/noncommercial/' + path) })));
  const canvas = document.createElement('canvas');
  canvas.width = b.width;
  canvas.height = b.height;
  canvas.style.cssText = `position:absolute;left:0;top:0;width:${b.width}px;height:${b.height}px`;
  document.body.append(canvas);
  store = new MapStore();
  for (const [n, d] of Object.entries(b.storage)) store.files.set(n, new Uint8Array(d));
  app = new OriginalApp({ canvas, audio: null, groups, files, noncommercial: b.noncommercial, options: b.options,
    scenario: b.scenario, playerName: b.playerName, log: (l) => { log.push(l); if (w.ocMenuEcho) console.log('[engine] ' + l); } });
  app.prepare();
  if (b.online) {
    const overlay = document.createElement('div');
    document.body.append(overlay);
    online = new OnlineGames(app, onlineStandIns(new AbortController().signal) as any, overlay, () => {});
  }
  user = new UserFiles(store, USER_DATA, { readFile, addFile, isDir, listDir, pack: (p) => app.packFolder(p) });
  const loaded = await user.load();
  if (b.userScenario) (app as any).args.push(USER_DATA + b.userScenario);
  takeChanges();
  try {
    if (!app.start()) throw new Error('C4Application::Init failed');
  } catch (e) {
    error = String((e as Error)?.stack ?? e);
  }
  return { loaded, error };
};

/** runs frames of the original's main loop (one per animation frame, as the page does) and writes back to the storage */
w.ocMenuRun = async (frames: number, until?: string) => {
  for (let i = 0; i < frames && !error; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    try {
      if (!online || online.before()) app.frame();
    } catch (e) {
      error = String((e as Error)?.stack ?? e).split('\n').slice(0, 14).join('\n');
      break;
    }
    const ch = takeChanges();
    if (ch.length) await user.sync(ch);
    if (until && w.ocMenuState().dialog === until) break;
    if (app.quit) break;
  }
  return w.ocMenuState();
};

/** what the original shows: the start menu's dialog, the dialogs on the GUI's screen, modal loops, the game */
w.ocMenuState = () => {
  const $ = app.engine as any;
  const startup = $.C4Startup?.Get?.();
  const screen = $.C4GUI$Screen?.GetScreenS?.() ?? $.Screen?.GetScreenS?.();
  const dialogs: string[] = [];
  for (let e = screen?.pFirst; e; e = e.pNext) if (e.fVisible !== false) dialogs.push(cname(e));
  const players: string[] = [];
  for (let p = $.Players?.First; p; p = p.Next) players.push(cString(p.Name));
  return {
    dialog: startup?.pCurrDlg ? cname(startup.pCurrDlg) : '', dialogs, modal: app.modal, appState: $.Application?.AppState,
    frame: app.frameCounter, players, quit: app.quit, error, log: log.slice(-30),
    participants: cString($.Config?.General?.Participants ? P($.Config.General.Participants, 0) : null),
    missionAccess: cString($.Config?.General?.MissionAccess ? P($.Config.General.MissionAccess, 0) : null),
    paper: startup ? { w: startup.Graphics.fctDlgPaper.Wdt, h: startup.Graphics.fctDlgPaper.Hgt } : null,
    storage: Object.fromEntries([...store.files].map(([n, d]) => [n, d.length])),
  };
};

/** the storage's files, for the next start */
w.ocMenuStorage = () => Object.fromEntries([...store.files].map(([n, d]) => [n, [...d]]));

/** the elements on the GUI's screen, depth first */
function* elements(): Generator<any> {
  const $ = app.engine as any;
  const screen = $.C4GUI$Screen?.GetScreenS?.() ?? $.Screen?.GetScreenS?.();
  const stack: any[] = [];
  for (let e = screen?.pLast; e; e = e.pPrev) stack.push(e);
  while (stack.length) {
    const e = stack.pop();
    if (e.fVisible === false) continue;
    yield e;
    for (let c = e.pLast; c; c = c.pPrev) stack.push(c);
  }
}

/** the middle of an element in the canvas's pixels (the GUI's coordinates times its zoom) */
function middle(e: any): [number, number] {
  const x = new Int32Array([Math.floor(e.rcBounds.Wdt / 2)]), y = new Int32Array([Math.floor(e.rcBounds.Hgt / 2)]);
  // ClientPos2ScreenPos of the element's own position: its parent's offsets, then its bounds
  x[0] = 0; y[0] = 0;
  e.ClientPos2ScreenPos(P(x, 0), P(y, 0));
  const zoom = (app.engine as any).C4GUI$GetZoom?.() ?? (app.engine as any).GetZoom?.() ?? 1;
  return [Math.round((x[0] + e.rcBounds.Wdt / 2) * zoom), Math.round((y[0] + e.rcBounds.Hgt / 2) * zoom)];
}

/** finds an element: a button by its callback's name, an element by its class, or by the text it shows */
w.ocMenuFind = (what: { callback?: string; cls?: string; text?: string }) => {
  for (const e of elements()) {
    if (what.callback && e.pCallbackFn !== what.callback) continue;
    if (what.cls && cname(e) !== what.cls) continue;
    if (what.text) {
      const t = cString(e.sText) || cString(e.sTitle);
      if (t !== what.text) continue;
    }
    return { cls: cname(e), at: middle(e) };
  }
  return null;
};

/** the texts of the labels and buttons on the screen (what a player reads) */
w.ocMenuTexts = () => {
  const out: string[] = [];
  for (const e of elements()) {
    const t = cString(e.sText);
    if (t) out.push(t);
  }
  return out;
};

const mouseAt = (x: number, y: number, button = 0, detail = 1) => ({ clientX: x, clientY: y, button, detail });
w.ocMenuClick = (x: number, y: number, double = false) => {
  app.mouseMove(new MouseEvent('mousemove', mouseAt(x, y)));
  app.mouseButton(new MouseEvent('mousedown', mouseAt(x, y)), true);
  app.mouseButton(new MouseEvent('mouseup', mouseAt(x, y)), false);
  if (double) {
    app.mouseButton(new MouseEvent('mousedown', mouseAt(x, y, 0, 2)), true);
    app.mouseButton(new MouseEvent('mouseup', mouseAt(x, y, 0, 2)), false);
  }
};
w.ocMenuKey = (code: string, key: string) => {
  app.key(new KeyboardEvent('keydown', { code, key }), true);
  app.key(new KeyboardEvent('keyup', { code, key }), false);
};
w.ocMenuType = (text: string) => {
  for (const ch of text) {
    const code = /[a-z]/i.test(ch) ? 'Key' + ch.toUpperCase() : /[0-9]/.test(ch) ? 'Digit' + ch : ch === ' ' ? 'Space' : '';
    if (code) w.ocMenuKey(code, ch);
  }
};

/** calls into the original (the in-game menu's command, a savegame's size) */
w.ocMenuEval = (src: string) => {
  const $ = app.engine as any;
  // eslint-disable-next-line no-new-func
  try {
    return new Function('$', 'S', 'P', 'readFile', 'listDir', 'USER', src)($, S, P, readFile, listDir, USER_DATA);
  } catch (e) {
    throw new Error(String((e as Error)?.stack ?? e).split('\n').slice(0, 14).join('\n'));
  }
};
