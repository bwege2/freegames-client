// Runs the port headless in node under the same rules as the oracle's hook.cpp
// (re/abuse/oracle/hook.cpp): a virtual clock (the seed's second, +1 us per reading, waits add
// exactly what is asked), input from a session file (events become visible after flush <n>), and one
// trace line per flush of the screen, with the same game state and the sound layer's lines.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { setPlatform, type Platform, type SDLEvent, SDL_KEYDOWN, SDL_KEYUP, SDL_MOUSEMOTION, SDL_MOUSEBUTTONDOWN,
  SDL_MOUSEBUTTONUP, KMOD_LSHIFT, KMOD_RSHIFT, KMOD_LCTRL, KMOD_RCTRL, KMOD_LALT, KMOD_RALT } from '../src/rt/platform.ts';
import { vfsReset, vfsPut, DATA_PREFIX, SAVE_PREFIX } from '../src/rt/vfs.ts';
import { SDLK } from '../src/sdlport/event.ts';
import { S } from '../src/sdlport/sound.ts';
import { fnv, hex, state_line } from '../src/rt/state.ts';
import { during } from '../src/rt/deferred.ts';
import { R } from '../src/imlib/jrand.ts';
import { ExitProgram } from '../src/imlib/dprint.ts';
import type { NetFromWorker, NetToWorker, OnlineConfig } from '../src/online.ts';

export const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '../../../..');
export const ORACLE_DIR = join(ROOT, 're/abuse/oracle');
export const DATA_DIR = join(ROOT, 're/abuse/work/data');

interface ScriptEvent { flush: number; ev: SDLEvent; end: boolean }

/** the program reached the session's end (the oracle's _exit(0) after "E <n>") */
export class SessionEnd extends Error {}
/** the oracle's X lines: the program waits for input that will not come, or runs away */
export class SessionStuck extends Error {}

const KEYS: Record<string, number> = {
  RETURN: SDLK.RETURN, ESCAPE: SDLK.ESCAPE, SPACE: 32, TAB: 9, BACKSPACE: 8, UP: SDLK.UP, DOWN: SDLK.DOWN,
  LEFT: SDLK.LEFT, RIGHT: SDLK.RIGHT, LSHIFT: SDLK.LSHIFT, RSHIFT: SDLK.RSHIFT, LCTRL: SDLK.LCTRL, RCTRL: SDLK.RCTRL,
  LALT: SDLK.LALT, RALT: SDLK.RALT, INSERT: SDLK.INSERT, HOME: SDLK.HOME, END: SDLK.END, PAGEUP: SDLK.PAGEUP,
  PAGEDOWN: SDLK.PAGEDOWN, F1: SDLK.F1, F2: SDLK.F2, F3: SDLK.F3, F4: SDLK.F4, F5: SDLK.F5, F6: SDLK.F6, F7: SDLK.F7,
  F8: SDLK.F8, F9: SDLK.F9, F10: SDLK.F10, DELETE: SDLK.DELETE, CAPSLOCK: SDLK.CAPSLOCK,
};

function key_by_name(name: string): number {
  if (/^\d/.test(name) && name.length > 1) return parseInt(name, 10);
  if (name.length === 1) return name.charCodeAt(0);
  const k = KEYS[name];
  if (k === undefined) throw new Error(`unknown key ${name}`);
  return k;
}

function mod_of(k: number): number {
  switch (k) {
    case SDLK.LSHIFT: return KMOD_LSHIFT;
    case SDLK.RSHIFT: return KMOD_RSHIFT;
    case SDLK.LCTRL: return KMOD_LCTRL;
    case SDLK.RCTRL: return KMOD_RCTRL;
    case SDLK.LALT: return KMOD_LALT;
    case SDLK.RALT: return KMOD_RALT;
  }
  return 0;
}

export interface Session {
  script: ScriptEvent[];
  gamma: number | null;
  files: [string, string][];
  args: string[];
}

export function parseSession(path: string): Session {
  const s: Session = { script: [], gamma: null, files: [], args: [] };
  for (const raw of readFileSync(path, 'latin1').split('\n')) {
    const line = raw.replace(/^[ \t]+/, '');
    if (line.startsWith('# home gamma ')) s.gamma = parseInt(line.slice(13), 10);
    else if (line.startsWith('# home file ')) {
      const [name, p] = line.slice(12).trim().split(/\s+/);
      s.files.push([name, join(dirname(path), p)]);
    } else if (line.startsWith('# args ')) s.args.push(...line.slice(7).trim().split(/\s+/));
    if (!line || line[0] === '#') continue;
    const f = line.trim().split(/\s+/);
    if (f.length < 2) continue;
    const ev: SDLEvent = { type: 0 };
    let end = false;
    if (f[1] === 'key') {
      ev.type = f[2] === 'down' ? SDL_KEYDOWN : SDL_KEYUP;
      ev.sym = key_by_name(f[3]);
    } else if (f[1] === 'mouse') {
      ev.type = SDL_MOUSEMOTION;
      ev.x = parseInt(f[2], 10);
      ev.y = parseInt(f[3], 10);
    } else if (f[1] === 'button') {
      ev.type = f[3] === 'down' ? SDL_MOUSEBUTTONDOWN : SDL_MOUSEBUTTONUP;
      ev.button = parseInt(f[2], 10);
    } else if (f[1] === 'end') end = true;
    else throw new Error(`bad line ${line}`);
    s.script.push({ flush: parseInt(f[0], 10), ev, end });
  }
  return s;
}

let dataCache: Map<string, Uint8Array> | null = null;
function loadData(): Map<string, Uint8Array> {
  if (dataCache) return dataCache;
  const m = new Map<string, Uint8Array>();
  const walk = (dir: string, rel: string): void => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      const r = rel ? `${rel}/${n}` : n;
      // sfx/ and music/ hold the oracle's silent stand-ins (build.sh), not the original sounds
      if (statSync(p).isDirectory()) {
        walk(p, r);
      } else m.set(r, new Uint8Array(readFileSync(p)));
    }
  };
  walk(DATA_DIR, '');
  dataCache = m;
  return m;
}

export const ABUSERC = `; Abuse-SDL Configuration file

; Startup fullscreen
fullscreen=0

; Use DoubleBuffering
doublebuf=0

; Use OpenGL
gl=0

; Location of the datafiles
datadir=${DATA_PREFIX}

; Use mono audio only
mono=0

; Grab the mouse to the window
grabmouse=0

; Set the scale factor
scale=2

; Use anti-aliasing (with gl=1 only)
antialias=1

; Disable the SDL parachute in the case of a crash
nosdlparachute=0

; Key mappings
left=LEFT
right=RIGHT
up=UP
down=DOWN
fire=SPACE
weapprev=CTRL_R
weapnext=INSERT
`;

export interface RunResult { lines: string[]; frames?: Uint8Array[] }

/** runs the port on a session; returns the trace lines (as the oracle writes them) */
export interface PortOptions {
  keepFrames?: number[];
  /** an online round (online.ts): the configuration, and the room as the test runs it */
  online?: { cfg: OnlineConfig; post: (m: NetFromWorker) => void; listen: (f: (m: NetToWorker) => void) => void };
}

export async function runPort(sessionPath: string, seed = 1, opts: PortOptions = {}): Promise<RunResult> {
  const session = parseSession(sessionPath);
  const lines: string[] = [];
  const frames: Uint8Array[] = [];
  vfsReset();
  for (const [k, v] of loadData()) vfsPut(DATA_PREFIX + k, v);
  vfsPut(`${SAVE_PREFIX}abuserc`, Uint8Array.from(ABUSERC, (c) => c.charCodeAt(0)));
  if (session.gamma !== null) vfsPut(`${SAVE_PREFIX}gamma.lsp`, Uint8Array.from(`(setq darkest_gray ${session.gamma})\n`, (c) => c.charCodeAt(0)));
  for (const [name, p] of session.files) vfsPut(SAVE_PREFIX + name, new Uint8Array(readFileSync(p)));

  let vclock = seed * 1000000;
  let flushes = 0, on = 0, idle = 0, mx = 0, my = 0, buttons = 0, mods = 0;
  const script = session.script;
  const avail = (): boolean => !(on >= script.length || script[on].flush > flushes || script[on].end);
  const stuck = (): void => {
    if (++idle < 2000000) return;
    lines.push(`X waiting for input after frame ${flushes}`);
    throw new SessionStuck();
  };
  const plat: Platform = {
    gettimeofday() {
      vclock += 1;
      return [Math.floor(vclock / 1000000), vclock % 1000000];
    },
    time() { return opts.online ? opts.online.cfg.seed : seed; },
    async usleep(us: number) { vclock += Math.max(0, Math.trunc(us)); },
    hasEvent() {
      if (!avail()) {
        stuck();
        return false;
      }
      idle = 0;
      return true;
    },
    pollEvent() {
      if (!avail()) {
        stuck();
        return null;
      }
      idle = 0;
      const ev = { ...script[on++].ev };
      switch (ev.type) {
        case SDL_KEYDOWN:
          mods |= mod_of(ev.sym!);
          ev.mod = mods;
          break;
        case SDL_KEYUP:
          mods &= ~mod_of(ev.sym!);
          ev.mod = mods;
          break;
        case SDL_MOUSEMOTION:
          mx = ev.x!;
          my = ev.y!;
          break;
        case SDL_MOUSEBUTTONDOWN:
          buttons |= 1 << (ev.button! - 1);
          ev.x = mx;
          ev.y = my;
          break;
        case SDL_MOUSEBUTTONUP:
          buttons &= ~(1 << (ev.button! - 1));
          ev.x = mx;
          ev.y = my;
          break;
      }
      return ev;
    },
    mouseState() { return [mx, my, buttons & 0xff]; },
    modState() { return mods; },
    warpMouse() { /* SDL_WarpMouse reaches neither the oracle's events nor its mouse state */ },
    present(pixels: Uint8Array, pal: Uint8Array, counted: boolean) {
      if (!counted) return;
      flushes++;
      lines.push(`F ${flushes} ${vclock - seed * 1000000} ${hex(fnv(pixels))} ${hex(fnv(pal))}${during.state ?? state_line()}`);
      idle = 0;
      if (process.env.ABUSE_FRAMES) {
        const f = new Uint8Array(pixels.length + 768);
        f.set(pixels);
        f.set(pal, pixels.length);
        writeFileSync(join(process.env.ABUSE_FRAMES, `${String(flushes).padStart(6, '0')}.raw`), f);
      }
      if (opts.keepFrames?.includes(flushes)) {
        const f = new Uint8Array(pixels.length + 768);
        f.set(pixels);
        f.set(pal, pixels.length);
        frames[flushes] = f;
      }
      if (on < script.length && script[on].end && script[on].flush <= flushes) {
        lines.push(`E ${flushes}`);
        throw new SessionEnd();
      }
      if (flushes > 200000) {
        lines.push('X too many frames');
        throw new SessionStuck();
      }
    },
  };
  setPlatform(plat);
  S.trace = (l: string) => lines.push(l);
  const { abuse_main } = await import('../src/game.ts');
  let args = ['abuse', '-scale', '1', ...session.args];
  if (opts.online) {
    const on = await import('../src/online.ts');
    on.set_net_post(opts.online.post);
    opts.online.listen(on.net_worker_message);
    args = [...args, ...on.online_setup(opts.online.cfg)];
  }
  if (process.env.ABUSE_MUTATE) {
    // the mutation check (oracle.test.ts): one flipped bit of the random table position after 10 ticks
    const { level } = await import('../src/level.ts');
    const tick = level.prototype.tick;
    level.prototype.tick = async function (this: InstanceType<typeof level>) {
      if (this.tick_counter() % 100 === 10) R.rand_on ^= 1;
      return tick.call(this);
    };
  }
  try {
    await abuse_main(args);
  } catch (e) {
    if (e instanceof SessionEnd || e instanceof SessionStuck) return { lines, frames };
    if (e instanceof ExitProgram) return { lines, frames }; // the oracle's trace just ends
    throw e;
  }
  return { lines, frames };
}
