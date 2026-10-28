// Runs the port headless the way re/ballerburg/oracle runs the original: scripted events, virtual time,
// and per frame (every SDL_Delay and SDL_WaitEvent) the hash of the calls since the last frame, of the
// window surface, of the game state and of the sound chip's samples, printed in the oracle's format
// (oracle.c's header).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SDL_SetPlatform, setRecorder, makeEvent, windowSurface, type SDL_Event, type Platform,
  SDL_EVENT_MOUSE_MOTION, SDL_EVENT_MOUSE_BUTTON_DOWN, SDL_EVENT_MOUSE_BUTTON_UP, SDL_EVENT_KEY_DOWN, SDL_EVENT_KEY_UP,
  SDL_EVENT_TEXT_INPUT, SDL_EVENT_QUIT,
} from '../src/sdl.ts';
import { assets } from '../src/assets.ts';
import { g, tGew, vane, COMP_NUM } from '../src/baller1.ts';
import { randCount, srand } from '../src/random.ts';
import { resetProgram } from '../src/program.ts';
import { main } from '../src/baller1.ts';
import { Quit } from '../src/ballergui.ts';
import { setMoves, type Moves } from '../src/moves.ts';
import { surf } from '../src/screen.ts';
import { PsgChip, setPsgSink } from '../src/psg.ts';
import { GlibcRand } from '../src/glibcRand.ts';

const dir = join(import.meta.dirname, '..');
assets.dat = new Uint8Array(readFileSync(join(dir, 'assets', 'baller.dat')));
assets.mus = new Uint8Array(readFileSync(join(dir, 'assets', 'baller.mus')));
assets.font = new Uint8Array(readFileSync(join(dir, 'assets', 'font8x16.bin')));

export interface ScriptEvent { dt: number; what: string; a: number; b: number; c: number }

export function eventLine(e: ScriptEvent): string {
  const args = e.what === 'Q' ? [] : e.what === 'M' || e.what === 'KD' || e.what === 'KU' || e.what === 'T' ? (e.what === 'M' ? [e.a, e.b] : [e.a]) : [e.a, e.b, e.c];
  return ['E', e.dt, e.what, ...args].join(' ');
}

export function parseScript(text: string): { seed: number; events: ScriptEvent[]; frames: string[] } {
  let seed = 1;
  const events: ScriptEvent[] = [];
  const frames: string[] = [];
  for (const line of text.split('\n')) {
    if (!line) continue;
    if (line.startsWith('SEED ')) seed = Number(line.slice(5));
    else if (line.startsWith('E ')) {
      const [, dt, what, a = '0', b = '0', c = '0'] = line.split(' ');
      events.push({ dt: Number(dt), what, a: Number(a), b: Number(b), c: Number(c) });
    } else if (/^[WZD] |^END /.test(line)) frames.push(line);
  }
  return { seed, events, frames };
}

const FNV_OFFSET = 2166136261;

function fnv(h: number, s: string): number {
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ (s.charCodeAt(i) & 255), 16777619) >>> 0;
  return Math.imul(h ^ 10, 16777619) >>> 0;
}

const hex8 = (v: number) => (v >>> 0).toString(16).padStart(8, '0');

/** oracle.c's state_string() */
export function stateString(): string {
  const p: (number | string)[] = [g.n, g.zug, g.wnd, g.end, g.mod, g.mx, g.my, g.bt, g.f, g.max_rund, g.an_erl, g.au_kap,
    g.cw[0], g.cw[1], g.cx[0], g.cx[1]];
  for (let i = 0; i < 2; i++) p.push(g.ge[i], g.pu[i], g.ku[i], g.vo[i], g.st[i], g.kn[i], g.wx[i], g.wy[i], g.by[i], g.bx[i], g.bur[i]);
  for (let i = 0; i < 6; i++) p.push(g.prices[i]);
  for (let i = 0; i < 2; i++) for (const k of g.ka[i]) p.push(k.x, k.y, k.w, k.p);
  for (let i = 0; i < 2; i++) for (const t of g.ft[i]) p.push(t.x, t.y);
  let s = p.join(' ') + ` "${g.l_nam?.s ?? ''}" "${g.r_nam?.s ?? ''}" `;
  const v = vane();
  const t: number[] = [v.ws, v.wc];
  const tg = tGew();
  for (let i = 0; i < COMP_NUM; i++) for (let j = 0; j < COMP_NUM + 4; j++) t.push(tg[i]?.[j] ?? 0);
  s += t.join(' ');
  return s;
}

class ScriptEnd extends Error {}

export interface Bot {
  /** the program waits and the script has no more events: more events (dt from now), or null to end */
  next(now: number): ScriptEvent[] | null;
}

export interface RunResult { lines: string[]; events: ScriptEvent[]; frames: number }

function toSdl(e: ScriptEvent): SDL_Event {
  switch (e.what) {
    case 'M': return makeEvent(SDL_EVENT_MOUSE_MOTION, { x: e.a, y: e.b });
    case 'D': return makeEvent(SDL_EVENT_MOUSE_BUTTON_DOWN, { x: e.a, y: e.b, button: e.c });
    case 'U': return makeEvent(SDL_EVENT_MOUSE_BUTTON_UP, { x: e.a, y: e.b, button: e.c });
    case 'KD': return makeEvent(SDL_EVENT_KEY_DOWN, { key: e.a });
    case 'KU': return makeEvent(SDL_EVENT_KEY_UP, { key: e.a });
    case 'T': return makeEvent(SDL_EVENT_TEXT_INPUT, { text: e.a });
    default: return makeEvent(SDL_EVENT_QUIT);
  }
}

/** Runs the program on a script (and a bot that extends it); returns the oracle's output lines. */
/** the hash of the drawing surface (what loc() reads), or of the window surface (what is on the screen) */
export function surfaceHash(window = false): number {
  const px = (window ? windowSurface()! : surf).pixels as Uint32Array;
  let h = FNV_OFFSET;
  for (let i = 0; i < px.length; i++) h = Math.imul(h ^ px[i], 16777619) >>> 0;
  return h;
}

export interface RunOptions {
  bot?: Bot;
  trace?: string[];
  cap?: number;
  /** online play (moves.ts) instead of the original's local game */
  moves?: Moves;
  /** at the first frame of every turn: the game state and the drawing surface */
  onTurn?: (state: string, surface: number) => void;
}

export async function run(seed: number, script: ScriptEvent[], o: RunOptions = {}): Promise<RunResult> {
  const events = script.slice();
  const times: number[] = [];
  let t = 0;
  for (const e of events) times.push((t += e.dt));
  let next = 0, now = 0, frameNo = 0, callhash = FNV_OFFSET, windowHash = 0, windowDirty = true;
  let runFirst = 0, runCount = 0, runChain = 0, lastZug = -1, lastState = 0;
  const lines: string[] = [];
  const cap = o.cap ?? 2000000;

  const flush = () => {
    if (runCount) lines.push(`D ${runFirst} ${runCount} ${hex8(runChain)}`);
    runCount = 0;
  };
  const winHash = () => {
    const w = windowSurface();
    if (windowDirty && w) {
      const px = w.pixels as Uint32Array;
      let h = FNV_OFFSET;
      for (let i = 0; i < 640 * 480; i++) h = Math.imul(h ^ (px[i] & 0xffffff), 16777619) >>> 0;
      windowHash = h;
      windowDirty = false;
    }
    return windowHash;
  };
  const take = (): SDL_Event => toSdl(events[next++]);
  // the sound: what the audio callback would have played for the time that passed (oracle.c's audio_advance)
  const chip = new PsgChip(new GlibcRand(1));
  const buf = new Int16Array(65536);
  let samplesDone = 0, audioHash = FNV_OFFSET;
  const audio = (ms: number) => {
    const target = Math.floor(ms * 441 / 10);
    while (samplesDone < target) {
      const n = Math.min(65536, target - samplesDone);
      chip.createSamples(buf, n);
      for (let i = 0; i < n; i++) audioHash = Math.imul(audioHash ^ (buf[i] & 0xffff), 16777619) >>> 0;
      samplesDone += n;
    }
  };

  const platform: Platform = {
    poll: () => (next < events.length && times[next] <= now ? take() : null),
    wait: async () => {
      if (next >= events.length && o.bot) {
        const more = o.bot.next(now);
        if (more) {
          const last = times.length ? times[times.length - 1] : 0;
          let tt = last;
          more.forEach((e, i) => {
            if (i === 0) e.dt += Math.max(0, now - last); // the bot's times count from now
            tt += e.dt;
            events.push(e);
            times.push(tt);
          });
        }
      }
      if (next >= events.length) throw new ScriptEnd();
      if (times[next] > now) now = times[next];
      audio(now);
      return take();
    },
    delay: async (ms) => {
      now += ms;
      audio(now);
    },
    present: () => { windowDirty = true; },
    frame: (kind) => {
      const st = stateString();
      const sh = fnv(FNV_OFFSET, st);
      const line = `${kind} ${hex8(callhash)} ${hex8(winHash())} ${hex8(sh)} ${randCount()} ${hex8(audioHash)}`;
      audioHash = FNV_OFFSET;
      const fh = fnv(FNV_OFFSET, line);
      o.trace?.push(`FRAME ${frameNo} ${line} | ${st}`);
      if (g.zug !== lastZug) o.onTurn?.(st, surfaceHash());
      if (kind[0] === 'W' || g.zug !== lastZug) {
        flush();
        const head = `${kind[0] === 'W' ? 'W' : 'Z'} ${frameNo} ${hex8(fh)} ${randCount()}`;
        lines.push(sh !== lastState ? `${head} ${st}` : head);
        lastState = sh;
        lastZug = g.zug;
      } else {
        if (!runCount) {
          runFirst = frameNo;
          runChain = FNV_OFFSET;
        }
        runChain = fnv(runChain, hex8(fh));
        if (++runCount === 64) flush();
      }
      frameNo++;
      callhash = FNV_OFFSET;
      if (frameNo > cap) throw new ScriptEnd();
    },
  };

  resetProgram();
  srand(seed);
  if (o.moves) setMoves(o.moves);
  setPsgSink((w) => {
    if (w[0] === 'g') chip.giaccess(w[1], w[2]);
    else chip.dosound(w[1]);
  });
  SDL_SetPlatform(platform);
  setRecorder((l) => {
    callhash = fnv(callhash, l);
    o.trace?.push(l);
  });
  let why = 'main';
  try {
    await main();
  } catch (e) {
    if (e instanceof ScriptEnd) why = frameNo > cap ? 'cap' : 'script';
    else if (e instanceof Quit) why = 'exit';
    else throw e;
  } finally {
    setRecorder(null);
  }
  flush();
  lines.push(`END ${frameNo} ${why}`);
  return { lines, events, frames: frameNo };
}
