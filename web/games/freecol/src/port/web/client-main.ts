// The client worker (re/freecol/NOTES.md, "The client"): FreeCol's client with its Swing GUI, drawing into
// canvases of its own; it shows the screen on the page (frames), takes the page's input from shared memory
// and talks to the server worker through pipes. Its threads run on the scheduler (client/sched.ts): when
// nothing waits on the stack it returns to the worker's event loop between pieces of work; a thread that
// blocks (a modal dialog, a request to the server) blocks the worker on the doorbell (Atomics.wait).
import { java, jmethod, $J } from '../../freecol.ts';
import { vfs, fontFiles, canvases, awt, Logger } from '../../jre/index.ts';
import { installClient } from '../client/index.ts';
import { ClientNet } from '../client/net.ts';
import { installRemoteServer } from '../client/remote.ts';
import { startFreeColClient } from '../client/boot.ts';
import { screen, handleInput } from '../client/peers.ts';
import { fontFamilies } from '../client/graphics.ts';
import { sound, soundEnded } from '../client/sound.ts';
import { indexProvider, type FileIndex } from './files.ts';
import { storageName, storagePath } from './userfiles.ts';
import { dumpTree } from './tree.ts';

export type ClientInit = {
  files: FileIndex;
  width: number;
  height: number;
  locale: string;
  sound: boolean;
  fromServer: SharedArrayBuffer;
  fromPage: SharedArrayBuffer;
  bell: SharedArrayBuffer;
  toServer: SharedArrayBuffer;
  serverBell: SharedArrayBuffer;
  /** online play: the game's server in the server worker (its port) and the player's name */
  online?: { port: number; name: string };
  /** The player's files from the site's storage (userfiles.ts): storage name and bytes. */
  userFiles?: [string, Uint8Array][];
};

/** What the client worker gets from its host (the browser's worker, or a test's). */
export type ClientPlatform = {
  /** The channel to the server worker. */
  server: { postMessage: (m: any) => void };
  /** Messages to the page: frame (bitmap), exit, tree (text), sound (player, path, volume), soundStop, soundVolume, store (name, data or null). */
  post: (m: any, transfer?: any[]) => void;
  load: (url: string) => Uint8Array | null;
  /** A 2D canvas, or null (no drawing: tests). */
  canvas: (w: number, h: number) => { canvas: any; ctx: any } | null;
  /** Makes a font file usable for drawing; its CSS family name. */
  addFont: (name: string, bytes: Uint8Array) => string;
  /** Sends the screen to the page; false if it is too soon (frames are limited to the display's rate). */
  frame: (canvas: any) => boolean;
  /** Where log records go besides FreeCol's log file (tests). */
  log?: (record: any) => void;
};

export function runClient(init: ClientInit, platform: ClientPlatform) {
  vfs.provider = indexProvider(init.files, platform.load);
  // the player's files, back where the original keeps them; what the game writes there goes to the site's storage
  for (const [name, bytes] of init.userFiles ?? []) {
    const path = storagePath(name);
    if (path) vfs.write(path, bytes);
  }
  vfs.onWrite = (path: string, data: Uint8Array | null) => {
    const name = storageName(path);
    if (name) platform.post({ t: 'store', name, data });
  };
  if (platform.log) Logger.sink = platform.log;
  awt.screenWidth = init.width;
  awt.screenHeight = init.height;
  canvases.create = platform.canvas;
  fontFiles.onLoad = (name: string, bytes: Uint8Array, ttf: any) => fontFamilies.set(ttf, platform.addFont(name, bytes));
  $J.properties.set('java.awt.headless', 'false');
  $J.properties.set('user.name', 'player');

  const sched = installClient(java, jmethod);
  // threads may wait long while the player thinks (a dialog's thread, the minimap's painter): not a fault
  sched.stuck = () => {};
  const net = new ClientNet({ server: platform.server, toServer: init.toServer, serverBell: init.serverBell, fromServer: init.fromServer, fromPage: init.fromPage, bell: init.bell }, sched);
  installRemoteServer(java, jmethod, net);
  net.onInput = (e: any) => {
    if (e.kind === 'tree') {
      platform.post({ t: 'tree', text: screen.windows.map((p) => dumpTree(java, $J, p.target)).join('') });
    } else if (e.kind === 'focus') {
      // the keyboard's focus owner and focused window (for tests)
      const K = java('java.awt.KeyboardFocusManager').getCurrentKeyboardFocusManager$();
      const name = (c: any) => (c == null ? 'null' : $J.getClass(c).getName());
      platform.post({ t: 'tree', text: 'owner ' + name(K.getFocusOwner()) + '\nwindow ' + name(K.getFocusedWindow()) + '\n' });
    } else if (e.kind === 'soundEnded') {
      soundEnded(e.player);
    } else {
      handleInput(e);
    }
  };
  screen.show = (canvas: any) => platform.frame(canvas);
  sound.play = (player: number, path: string, volume: number) => platform.post({ t: 'sound', player, path, volume });
  sound.stop = (player: number) => platform.post({ t: 'soundStop', player });
  sound.volume = (player: number, volume: number) => platform.post({ t: 'soundVolume', player, volume });
  $J.system_exit = (code: number) => {
    platform.post({ t: 'exit', code });
    throw sched.parkForever();
  };

  const ConnectController = java('net.sf.freecol.client.control.ConnectController');
  if (!init.online) {
    // "Start multiplayer game" and "Join multiplayer game" (NewPanel) open the site's lobby: the page starts
    // the round's game, with the rules and difficulty chosen here when this player opens the room
    const ask = (start: boolean, spec: any) => {
      const level = String(spec?.getDifficultyLevel?.() ?? 'model.difficulty.medium');
      platform.post({ t: 'online', start, rules: String(java('net.sf.freecol.FreeCol').getRules()), difficulty: level.replace(/^model\.difficulty\./, '') });
      return false;
    };
    for (const k of Object.getOwnPropertyNames(ConnectController.prototype)) {
      if (k === 'startMultiplayerGame' || k.startsWith('startMultiplayerGame$')) ConnectController.prototype[k] = function (spec: any) { return ask(true, spec); };
      if (k === 'joinMultiplayerGame' || k.startsWith('joinMultiplayerGame$')) ConnectController.prototype[k] = function () { return ask(false, null); };
    }
  } else {
    // online: once the GUI is up, the client joins the round's game, as "Join multiplayer game" does
    const online = init.online;
    const FreeColClient = java('net.sf.freecol.client.FreeColClient');
    const first = FreeColClient.prototype.startFirstTaskInGui;
    FreeColClient.prototype.startFirstTaskInGui = function (this: any, ...a: any[]) {
      first.apply(this, a);
      const fcc = this;
      // in a thread of its own: it waits for the server's first message, which a thread handles (sched.ts runs
      // no new thread while the EDT waits in a handler)
      const Thread = java('java.lang.Thread');
      // joining a running game, the original's EDT adds the game's actions (invokeLater in login) while the
      // joining thread reads the reply; here that thread runs alone, so it gives the EDT its turn first
      const restore = FreeColClient.prototype.restoreGUI;
      FreeColClient.prototype.restoreGUI = function (this: any, ...a: any[]) {
        if (!sched.isDispatchThread()) sched.sleep(200);
        return restore.apply(this, a);
      };
      java('javax.swing.SwingUtilities').invokeLater(() => new Thread(() => fcc.getConnectController().joinMultiplayerGame('127.0.0.1', online.port), 'FreeColClient:join').start());
    };
  }
  try {
    if (init.online) java('net.sf.freecol.FreeCol').setName(init.online.name);
    sched.runAs(sched.main, 'run', () => startFreeColClient(java, { locale: init.locale, width: init.width, height: init.height, sound: init.sound }));
  } catch (e: any) {
    if (!e?.$parked) sched.uncaught(sched.main, e);
  }

  // the worker's loop: work while there is some (in slices), then back to the event loop until the doorbell
  // rings or the next timer is due
  const bell = new Int32Array(init.bell);
  const waitAsync = (Atomics as any).waitAsync as undefined | ((a: Int32Array, i: number, v: number, ms: number) => { async: boolean; value: any });
  const loop = () => {
    const end = performance.now() + 50;
    let next = 0;
    while ((next = sched.runUntilIdle(20)) === 0 && performance.now() < end) {}
    let ms = Math.min(next, screen.dirty ? 16 : 1000);
    if (net.pending() || ms <= 0) {
      setTimeout(loop, 0);
      return;
    }
    const v = Atomics.load(bell, 0);
    if (waitAsync) {
      const r = waitAsync(bell, 0, v, ms);
      if (r.async) r.value.then(loop);
      else setTimeout(loop, 0);
    } else {
      setTimeout(loop, Math.min(ms, 4));
    }
  };
  loop();
}
