// The program's thread: the translated Abuse runs here (a new worker for every game, so every global of
// the program starts fresh), with the system it expects (rt/platform.ts): the real clock, SDL's
// events as the page sends them, the window as frames sent to the page, the sound calls sent to the
// page's audio, the save directory written back to account storage.
import { setPlatform, type Platform, type SDLEvent, SDL_MOUSEMOTION, SDL_MOUSEBUTTONDOWN, SDL_MOUSEBUTTONUP } from './rt/platform.ts';
import { vfsLoadPack, vfsOnSave, vfsPut, SAVE_PREFIX } from './rt/vfs.ts';
import { S, songs_ended, type AudioOut } from './sdlport/sound.ts';
import { busy_hooks } from './director.ts';
import { state_line } from './rt/state.ts';
import { ExitProgram, AbuseError } from './imlib/dprint.ts';
import { abuse_main, main_hooks } from './game.ts';
import { net_worker_message, online_setup, set_net_post, net_dialog, type NetToWorker, type NetFromWorker, type OnlineConfig } from './online.ts';
import { net_dialog_hook } from './menu.ts';

export type ToWorker =
  | { t: 'start'; pack: Uint8Array; saves: [string, Uint8Array][]; args: string[]; login: string; audio: boolean; online: OnlineConfig | null }
  | { t: 'ev'; ev: SDLEvent; mods: number }
  | { t: 'songEnded'; id: number }
  | { t: 'net'; m: NetToWorker };

export type FromWorker =
  | { t: 'frame'; pixels: Uint8Array; pal: Uint8Array; state: string | null }
  | { t: 'audio'; op: keyof AudioOut; args: unknown[] }
  | { t: 'save'; name: string; data: Uint8Array }
  | { t: 'delete'; name: string }
  | { t: 'exit'; code: number }
  | { t: 'error'; message: string }
  | { t: 'net'; m: NetFromWorker };

const post = (m: FromWorker, transfer: Transferable[] = []): void => (self as unknown as Worker).postMessage(m, transfer);

const queue: SDLEvent[] = [];
let mx = 0, my = 0, buttons = 0, mods = 0;
let lastYield = performance.now();
/** online: time(NULL) is the round's seed (jrand_init), the same on every client */
let seed_time: number | null = null;

/** lets the worker take messages (input, network) when the program has not waited for a while */
async function yieldNow(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 0));
  lastYield = performance.now();
}
function maybeYield(): Promise<void> | null {
  return performance.now() - lastYield > 15 ? yieldNow() : null;
}

const now_us = (): number => Math.floor((performance.timeOrigin + performance.now()) * 1000);

const platform: Platform = {
  gettimeofday() {
    const t = now_us();
    return [Math.floor(t / 1000000), t % 1000000];
  },
  time() { return seed_time ?? Math.floor(Date.now() / 1000); },
  async usleep(us: number) {
    await new Promise<void>((r) => setTimeout(r, Math.max(0, us) / 1000));
    lastYield = performance.now();
  },
  hasEvent() { return queue.length > 0; },
  pollEvent() {
    const ev = queue.shift() ?? null;
    if (ev) {
      if (ev.type === SDL_MOUSEMOTION) {
        mx = ev.x!;
        my = ev.y!;
      } else if (ev.type === SDL_MOUSEBUTTONDOWN && ev.button! <= 3) buttons |= 1 << (ev.button! - 1);
      else if (ev.type === SDL_MOUSEBUTTONUP && ev.button! <= 3) buttons &= ~(1 << (ev.button! - 1));
    }
    return ev;
  },
  mouseState() { return [mx, my, buttons]; },
  modState() { return mods; },
  warpMouse(x: number, y: number) {
    mx = x;
    my = y;
  },
  present(pixels: Uint8Array, pal: Uint8Array) {
    // with the game state, for the end-to-end test (rt/state.ts)
    post({ t: 'frame', pixels: pixels.slice(), pal: pal.slice(), state: state_line() });
  },
};

const audioOut = new Proxy({} as AudioOut, {
  get: (_t, op: string) => (...args: unknown[]) => post({ t: 'audio', op: op as keyof AudioOut, args }),
});

async function run(m: Extract<ToWorker, { t: 'start' }>): Promise<void> {
  vfsLoadPack(m.pack);
  for (const [name, data] of m.saves) vfsPut(SAVE_PREFIX + name, data);
  vfsOnSave((name, data) => post({ t: 'save', name, data: data.slice() }), (name) => post({ t: 'delete', name }));
  setPlatform(platform);
  if (m.audio) S.out = audioOut;
  busy_hooks.spin = maybeYield;
  main_hooks.service = async () => {
    const y = maybeYield();
    if (y) await y;
  };
  const { login } = await import('./view.ts');
  login.name = m.login;
  set_net_post((n) => post({ t: 'net', m: n }));
  net_dialog_hook.run = net_dialog;
  let args = m.args;
  if (m.online) {
    seed_time = m.online.seed;
    args = [...online_setup(m.online), ...args];
  }
  try {
    await abuse_main(['abuse', ...args]);
    post({ t: 'exit', code: 0 });
  } catch (e) {
    if (e instanceof ExitProgram) post({ t: 'exit', code: e.code });
    else post({ t: 'error', message: e instanceof AbuseError ? e.message : String((e as Error)?.stack ?? e) });
  }
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  switch (m.t) {
    case 'start': void run(m); break;
    case 'ev':
      mods = m.mods;
      queue.push(m.ev);
      break;
    case 'songEnded': songs_ended.add(m.id); break;
    case 'net': net_worker_message(m.m); break;
  }
};
