// FreeCol on the page (re/freecol/NOTES.md, "The client"): two workers, the server with its AI players and
// the client with its Swing GUI, as the original runs a server and a client in one JVM. The page shows the
// client's screen (a frame at a time), sends it the mouse and the keyboard through shared memory (it reads
// them even while it waits for the server) and plays its sounds.
import type { StartGame } from '../../../src/sdk/index.ts';
import type { OnlineInit, Out } from './port/server/lockstep.ts';
import { lobby, onlineLaunch, type OnlineRequest } from './online.ts';

export type Ctx = Parameters<StartGame>[1];
import { Ring, json } from './port/ring.ts';
import { P_INPUT } from './port/protocol.ts';
import { vfsPath, type FileIndex } from './port/web/files.ts';
import { javaKeyCode, javaKeyLocation } from './port/web/keys.ts';
import { PageAudio } from './port/web/audio.ts';

// every file of the game's data, by its path in the virtual file system (loaded when first read)
const assetUrls = import.meta.glob('../assets/**/*', { query: '?url&no-inline', import: 'default', eager: true }) as Record<string, string>;

function fileIndex(): FileIndex {
  const index: FileIndex = {};
  for (const [k, url] of Object.entries(assetUrls)) index[vfsPath(k)] = new URL(url, location.href).href;
  return index;
}

/** FreeCol's locale for the browser's language (FreeCol falls back to English for what it lacks). */
function locale(): string {
  const l = navigator.language || 'en-US';
  const [lang, country] = l.split('-');
  return country ? lang + '_' + country.toUpperCase() : lang;
}

/** The player's files in the site's storage (port/web/userfiles.ts), as [name, bytes]. */
async function loadUserFiles(ctx: Ctx): Promise<[string, Uint8Array][]> {
  try {
    const out: [string, Uint8Array][] = [];
    for (const f of await ctx.storage.list('')) {
      const data = await ctx.storage.get(f.name);
      if (data) out.push([f.name, data]);
    }
    return out;
  } catch (e) {
    console.warn('FreeCol: the saved files could not be loaded: ' + e);
    return [];
  }
}

/** What the page wires up for online play (online.ts). */
export type OnlineLaunch = {
  server: OnlineInit;
  client: { port: number; name: string };
  /** what the server worker sends out (to the module) */
  out: (m: Out) => void;
  /** gets the function that hands the server worker the round's entries */
  attach: (post: (m: unknown) => void) => void;
  /** the player quit FreeCol */
  exit: () => void;
};

/** The two workers and the screen; online, with the round's game. */
export function launch(host: HTMLElement, ctx: Ctx, online: OnlineLaunch | null, ask: (req: OnlineRequest) => void) {
  const width = Math.max(800, Math.floor(host.clientWidth));
  const height = Math.max(600, Math.floor(host.clientHeight));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.tabIndex = 0;
  canvas.style.cssText = `display:block;width:${width}px;height:${height}px;outline:none;cursor:default`;
  host.style.overflow = 'auto';
  host.append(canvas);
  const view = canvas.getContext('bitmaprenderer')!;

  const files = fileIndex();
  const toClient = Ring.create();
  const fromPage = Ring.create(1 << 20);
  const bell = Ring.createBell();
  const toServer = Ring.create();
  const serverBell = Ring.createBell();
  const input = new Ring(fromPage, bell);
  const channel = new MessageChannel();
  const server = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module', name: 'freecol-server' });
  const client = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module', name: 'freecol-client' });
  const loc = locale();
  server.postMessage({ role: 'server', init: { files, locale: loc, toClient, bell, fromClient: toServer, serverBell, online: online?.server }, client: channel.port1 }, [channel.port1]);
  if (online) {
    server.onmessage = (e: MessageEvent) => {
      if (e.data.t === 'net') online.out(e.data.m);
    };
    online.attach((m) => server.postMessage(m));
  }
  // the client starts with the player's files (options, saved games) from the site's storage
  void loadUserFiles(ctx).then((userFiles) => {
    if (ctx.signal.aborted) return;
    client.postMessage({ role: 'client', init: { files, width, height, locale: loc, sound: true, fromServer: toClient, fromPage, bell, toServer, serverBell, userFiles, online: online?.client }, server: channel.port2 }, [channel.port2]);
  });
  let saving: Promise<unknown> = Promise.resolve();
  // the site keeps 64 files and 4 MiB per player: when a file does not fit, the oldest autosaves of past years
  // (the original keeps one per year, besides last turn's and the one before) make room
  const AUTOSAVES = 'd.save_2fautosave_2fAutosave-';
  const put = async (name: string, data: Uint8Array) => {
    for (let tries = 0; ; tries++) {
      try {
        return await ctx.storage.put(name, data);
      } catch (e) {
        const old = (await ctx.storage.list(AUTOSAVES))
          .filter((f) => f.name !== name && !/last-turn/.test(f.name))
          .sort((a, b) => (a.modified < b.modified ? -1 : 1));
        if (tries > 8 || !old.length) throw e;
        await ctx.storage.delete(old[0].name);
      }
    }
  };
  const store = (name: string, data: Uint8Array | null) => {
    saving = saving.then((): Promise<unknown> => (data ? put(name, data) : ctx.storage.delete(name)))
      .catch((e: unknown) => console.warn('FreeCol: could not store ' + name + ': ' + e));
  };

  const send = (e: any) => {
    if (!input.write(P_INPUT, json.encode(e))) console.warn('FreeCol: input dropped');
  };
  const audio = new PageAudio(ctx.audio, files, (player) => send({ kind: 'soundEnded', player }));
  const trees: ((t: string) => void)[] = [];
  client.onmessage = (e: MessageEvent) => {
    const m = e.data;
    switch (m.t) {
    case 'frame': view.transferFromImageBitmap(m.bitmap); break;
    case 'exit': void saving.then(() => (online ? online.exit() : ctx.exit())); break;
    case 'tree': trees.shift()?.(m.text); break;
    case 'sound': audio.play(m.player, m.path, m.volume); break;
    case 'soundStop': audio.stop(m.player); break;
    case 'soundVolume': audio.volume(m.player, m.volume); break;
    case 'store': store(m.name, m.data); break;
    case 'online': ask({ start: m.start, rules: m.rules, difficulty: m.difficulty }); break;
    }
  };
  const fail = (e: ErrorEvent) => console.error('FreeCol worker:', e.message);
  client.onerror = fail;
  server.onerror = fail;
  const signal = ctx.signal;
  const at = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: Math.floor((e.clientX - r.left) * (width / r.width)), y: Math.floor((e.clientY - r.top) * (height / r.height)) };
  };
  const mods = (e: MouseEvent | KeyboardEvent) => ({ shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey, time: Date.now() });
  const pointer = (kind: string) => (e: PointerEvent) => {
    if (kind === 'down') {
      canvas.focus();
      canvas.setPointerCapture(e.pointerId);
    }
    send({ kind, ...at(e), button: e.button, buttons: e.buttons, ...mods(e) });
  };
  canvas.addEventListener('pointermove', pointer('move'), { signal });
  canvas.addEventListener('pointerdown', pointer('down'), { signal });
  canvas.addEventListener('pointerup', pointer('up'), { signal });
  canvas.addEventListener('pointerleave', pointer('leave'), { signal });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    send({ kind: 'wheel', ...at(e), dy: e.deltaY, buttons: e.buttons, ...mods(e) });
  }, { signal, passive: false });
  const key = (type: 'down' | 'up') => (e: KeyboardEvent) => {
    if (e.code === 'F5' || e.code === 'F11' || e.code === 'F12') return; // the browser's
    e.preventDefault();
    const numLock = e.getModifierState('NumLock');
    send({ kind: 'key', type, code: javaKeyCode(e.code, numLock), location: javaKeyLocation(e.code),
      char: e.key.length === 1 ? e.key : e.key === 'Enter' ? '\n' : e.key === 'Backspace' ? '\b' : e.key === 'Tab' ? '\t' : e.key === 'Escape' ? '\x1b' : e.key === 'Delete' ? '\x7f' : '',
      buttons: 0, ...mods(e) });
  };
  canvas.addEventListener('keydown', key('down'), { signal });
  canvas.addEventListener('keyup', key('up'), { signal });
  canvas.focus();

  // for the end-to-end test (games/freecol/e2e.mjs): the client's component tree
  (window as any).freecolTree = () => new Promise<string>((resolve) => {
    trees.push(resolve);
    send({ kind: 'tree' });
  });

  return {
    canvas,
    stop: () => {
      client.terminate();
      server.terminate();
      canvas.remove();
      delete (window as any).freecolTree;
    },
  };
}


export const start: StartGame = (host, ctx) => {
  host.style.background = '#000';
  if (!crossOriginIsolated) {
    const p = document.createElement('p');
    p.textContent = 'FreeCol needs a cross-origin isolated page (shared memory between its workers), and this page is not. ' +
      'Reload the page; if that does not help, this browser cannot run it.';
    p.style.cssText = 'color:#eee;font:16px sans-serif;padding:24px;max-width:40em';
    host.append(p);
    return { stop: () => {} };
  }
  let running: { stop: () => void } | null = null;
  let asking = false;
  const alone = () => {
    running = launch(host, ctx, null, (req) => void online(req));
  };
  // FreeCol's "Start/Join multiplayer game" (online.ts): the site's lobby, then the round's game
  const online = async (req: OnlineRequest) => {
    if (asking) return;
    asking = true;
    const got = await lobby(host, ctx, req);
    asking = false;
    if (!got || ctx.signal.aborted) return;
    const play = (early: typeof got.early) => {
      running?.stop();
      const wiring = onlineLaunch(host, ctx, got.round, early, () => play([]));
      const game = launch(host, ctx, wiring, () => {});
      running = { stop: () => { wiring.stop(); game.stop(); } };
    };
    play(got.early);
  };
  alone();
  return { stop: () => running?.stop() };
};
