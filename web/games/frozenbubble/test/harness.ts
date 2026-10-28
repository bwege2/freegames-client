// Runs the port headless under the oracle's rules (re/frozenbubble/oracle/run.sh and shim.c): a
// virtual clock (SDL_GetTicks/SDL_Delay/sleep/time), the session script's keys and mouse posted by the
// "video driver" when due, the mixer model, text drawn as the oracle's placeholder, and the same two
// traces: the frames, sounds, texts and window calls (F P PW S M V A W X), and the game's state
// (R G T, as re/frozenbubble/oracle/FBOracle.pm writes it).
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { App, type AppPlatform } from '../src/sdl/app.ts';
import { Events, KEYNAMES, PRESSED, RELEASED, SDLK } from '../src/sdl/events.ts';
import type { MixerSink } from '../src/sdl/mixer.ts';
import { rgbAt, type Surface } from '../src/sdl/video.ts';
import { FrozenBubble, type FbHost, type FbHome, type Bubble } from '../src/fb/game.ts';
import { FBLE } from '../src/fb/fble.ts';
import { PangoText } from '../src/fb/pango.ts';
import { PackData } from '../src/fb/pack.ts';
import { g17 } from '../src/fb/perl.ts';

const here = dirname(new URL(import.meta.url).pathname);
export const ASSETS = join(here, '..', 'assets');
export const ORACLE_DIR = join(here, '..', '..', '..', '..', 're', 'frozenbubble', 'oracle');
export const WORK_DIR = join(here, '..', '..', '..', '..', 're', 'frozenbubble', 'work');

interface ScriptEvent { t: number; seq: number; type: number; sym: number; unicode: number; x: number; y: number; button: number }

export interface Session {
  time: number;
  args: string[];
  program: string;
  home: [string, string][];
  events: ScriptEvent[];
  end: number;
}

const PLAIN = '`1234567890-=[]\\;\',./', SHIFTED = '~!@#$%^&*()_+{}|:"<>?';

export function parseSession(path: string): Session {
  const s: Session = { time: 1278000000, args: [], program: 'frozen-bubble', home: [], events: [], end: Infinity };
  const lines = readFileSync(path, 'utf8').split('\n');
  lines.forEach((raw, i) => {
    const line = raw.replace(/\r$/, '');
    const lineno = i + 1;
    if (!line.startsWith('#')) { parseLine(s, line, lineno, path); return; }
    {
      let m;
      if ((m = /^# time (-?\d+)/.exec(line))) s.time = Number(m[1]);
      else if ((m = /^# args (.*)$/.exec(line))) s.args = m[1].trim().split(/\s+/).filter(Boolean);
      else if ((m = /^# program (\S+)/.exec(line))) s.program = m[1];
      else if ((m = /^# home file (\S+) (.*)$/.exec(line))) s.home.push([m[1], join(dirname(path), m[2])]);
    }
  });
  s.events.sort((a, b) => a.t - b.t || a.seq - b.seq);
  return s;
}

/** one script line into the session's events */
export function parseLine(s: Session, line: string, lineno: number, path = ''): void {
  const key = (n: string): number => {
    const v = KEYNAMES[n];
    if (v === undefined) throw new Error(`unknown key name ${n}`);
    return v;
  };
  {
    const w = line.trim().split(/\s+/);
    if (w.length < 2 || !/^\d+$/.test(w[0])) return;
    const t = Number(w[0]);
    const ev = (type: number, sym: number, unicode: number, x: number, y: number, button: number, seq: number): void => {
      s.events.push({ t, seq, type, sym, unicode, x, y, button });
    };
    if (w[1] === 'end') s.end = Math.min(s.end, t);
    else if (w[1] === 'key') {
      if (w[2] === 'down') ev(1, key(w[3]), w[4] !== undefined ? Number(w[4]) : -1, 0, 0, 0, lineno * 4);
      else ev(2, key(w[3]), 0, 0, 0, 0, lineno * 4);
    } else if (w[1] === 'tap') {
      const hold = w[3] !== undefined ? Number(w[3]) : 40;
      const u = w[4] !== undefined ? Number(w[4]) : -1;
      s.events.push({ t, seq: lineno * 4, type: 1, sym: key(w[2]), unicode: u, x: 0, y: 0, button: 0 });
      s.events.push({ t: t + hold, seq: lineno * 4 + 1, type: 2, sym: key(w[2]), unicode: 0, x: 0, y: 0, button: 0 });
    } else if (w[1] === 'mouse') {
      const x = Number(w[3]), y = Number(w[4]);
      if (w[2] === 'move') ev(3, 0, 0, x, y, 0, lineno * 4);
      else if (w[2] === 'down') ev(4, 0, 0, x, y, Number(w[5]), lineno * 4);
      else ev(5, 0, 0, x, y, Number(w[5]), lineno * 4);
    } else throw new Error(`${path}:${lineno}: cannot parse ${line}`);
  }
}

class End extends Error {}

/** FNV-1a over the RGB bytes of the screen, as the shim's fbshim_update */
export function frameHash(s: Surface): string {
  let h = 0x811c9dc5;
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
    const [r, g, b] = rgbAt(s, x, y);
    h = Math.imul(h ^ r, 16777619) >>> 0;
    h = Math.imul(h ^ g, 16777619) >>> 0;
    h = Math.imul(h ^ b, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export class MemHome implements FbHome {
  readonly files = new Map<string, string>();
  read(p: string): string | null { return this.files.get(p) ?? null; }
  write(p: string, d: string): void { this.files.set(p, d); }
  append(p: string, d: string): void { this.files.set(p, (this.files.get(p) ?? '') + d); }
  remove(p: string): boolean { return this.files.delete(p); }
  exists(p: string): boolean { return this.files.has(p); }
  list(dir: string): string[] {
    const pre = `${dir}/`;
    return [...this.files.keys()].filter((k) => k.startsWith(pre) && !k.slice(pre.length).includes('/')).map((k) => k.slice(pre.length));
  }
}

export interface PortRun { trace: string[]; state: string[]; home: MemHome; game: FrozenBubble }

let pack: PackData | null = null;
export function loadPack(): PackData {
  pack ??= new PackData(new Uint8Array(readFileSync(join(ASSETS, 'fb-data.bin'))));
  return pack;
}

/** runs a session; `mutate` lets a test change the port (mutation check) */
export async function runPort(sessionPath: string, opts: {
  mutate?: (g: FrozenBubble) => void;
  /** run until this time instead of the session's end (bot.ts) */
  endAt?: number;
  /** called after every game frame; may add script lines (bot.ts) */
  bot?: (g: FrozenBubble, vt: number, add: (line: string) => void) => void;
} = {}): Promise<PortRun> {
  const s = parseSession(sessionPath);
  if (opts.endAt !== undefined) s.end = opts.endAt;
  let added = 1000000;
  const add = (line: string): void => {
    const before = s.events.length;
    parseLine(s, line, added++);
    const fresh = s.events.splice(before);
    for (const e of fresh) {
      let i = s.events.length;
      while (i > next && (s.events[i - 1].t > e.t || (s.events[i - 1].t === e.t && s.events[i - 1].seq > e.seq))) i--;
      s.events.splice(i, 0, e);
    }
  };
  const trace: string[] = [];
  const state: string[] = [];
  let vt = 0;
  let next = 0;
  let idle = 0;
  let shiftL = false, shiftR = false;
  const check = (): void => {
    if (vt >= s.end) { trace.push(`X ${vt} end`); throw new End(); }
  };
  const defaultUnicode = (sym: number): number => {
    const shift = shiftL || shiftR;
    if (sym >= 97 && sym <= 122) return shift ? sym - 32 : sym;
    if (sym >= 32 && sym <= 126) {
      const p = PLAIN.indexOf(String.fromCharCode(sym));
      if (shift && p >= 0) return SHIFTED.charCodeAt(p);
      return sym;
    }
    if (sym === SDLK.BACKSPACE || sym === SDLK.TAB || sym === SDLK.RETURN || sym === SDLK.ESCAPE || sym === SDLK.DELETE) return sym;
    if (sym === SDLK.KP_ENTER) return 13;
    return 0;
  };
  const sink: MixerSink = {
    playChannel: () => {}, playMusic: () => {}, fadeOutMusic: () => {}, haltMusic: () => {}, pauseMusic: () => {},
    resumeMusic: () => {}, musicVolume: () => {}, channelVolume: () => {},
  };
  const platform: AppPlatform = {
    ticks: () => vt,
    delay: async (ms) => {
      if (ms > 0) { vt += ms; idle = 0; check(); }
    },
    sleep: async (sec) => { if (sec > 0) { vt += sec * 1000; idle = 0; check(); } },
    time: () => s.time + Math.floor(vt / 1000),
    pump: (ev: Events) => {
      let posted = false;
      while (next < s.events.length && s.events[next].t <= vt) {
        const e = s.events[next++];
        posted = true;
        if (e.type === 1 || e.type === 2) {
          if (e.sym === SDLK.LSHIFT) shiftL = e.type === 1;
          if (e.sym === SDLK.RSHIFT) shiftR = e.type === 1;
          const u = e.type === 1 ? (e.unicode < 0 ? defaultUnicode(e.sym) : e.unicode) : 0;
          ev.privateKeyboard(e.type === 1 ? PRESSED : RELEASED, e.sym, u);
        } else if (e.type === 3) ev.privateMouseMotion(0, e.x, e.y);
        else {
          if (ev.mouseX !== e.x || ev.mouseY !== e.y) ev.privateMouseMotion(0, e.x, e.y);
          ev.privateMouseButton(e.type === 4 ? PRESSED : RELEASED, e.button, e.x, e.y);
        }
      }
      if (!posted && ++idle > 100000) { trace.push(`X ${vt} stall`); throw new End(); }
    },
    present: (screen) => { trace.push(`F ${vt} ${frameHash(screen)}`); },
    toggleFullscreen: () => { trace.push(`W ${vt} fullscreen`); },
    showCursor: (on) => { trace.push(`W ${vt} cursor ${on ? 1 : 0}`); },
    sink,
    log: (line) => trace.push(line),
  };
  const app = new App(platform);
  const home = new MemHome();
  for (const [name, path] of s.home) home.write(name.replace(/^levels\//, 'levels/'), readFileSync(path, 'utf8'));
  const text = new PangoText(null, { line: (l) => trace.push(l), ticks: () => vt });
  const data = loadPack();
  let game!: FrozenBubble;
  const host: FbHost = {
    app, text, home, data,
    user: 'player',
    args: s.args,
    exit: () => { trace.push(`X ${vt} exit 0`); throw new End(); },
    makeEditor: (g) => new FBLE(g),
    frameHook: (g) => { state.push(stateLine(g, vt)); opts.bot?.(g, vt, add); },
    textHook: (kind, surface, x, y, t, size, align) => {
      state.push(`T ${vt} ${kind} ${surface === app.screen && s.program === 'frozen-bubble' ? 'app' : surface === g0().background ? 'background' : 'other'} ${num(x)} ${num(y)} ${num(size)} ${align} ${hexs(t)}`);
    },
    srandHook: (seed) => state.push(`R ${vt} srand ${seed}`),
  };
  const g0 = (): FrozenBubble => game;
  game = new FrozenBubble(host);
  // PERL_RAND_SEED=1: the implicit first seed (no srand call in the trace)
  const hook = game.rand.onSrand;
  game.rand.onSrand = null;
  game.rand.srand(1);
  game.rand.onSrand = hook;
  opts.mutate?.(game);
  try {
    if (s.program === 'frozen-bubble-editor') await game.run_editor(); else await game.run();
  } catch (e) {
    if (!(e instanceof End)) {
      trace.push(`X ${vt} error ${String((e as Error).stack ?? e).split('\n').slice(0, 3).join(' / ')}`);
    }
  }
  return { trace, state, home, game };
}

function hexs(t: string): string {
  if (t === '') return '-';
  return Array.from(new TextEncoder().encode(t), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** a Perl number as Perl prints it */
function num(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return g15(v);
}
function g15(v: number): string {
  let s = v.toPrecision(15);
  if (s.includes('e')) return s;
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

function bubbleNum(g: FrozenBubble, b: Bubble | null | undefined): string {
  if (!b) return '-';
  const i = g.bubbles_images.indexOf(b.img);
  if (i >= 0) return String(i);
  return b.img === g.bubbles_anim.lose ? 'L' : '?';
}

export function stateLine(g: FrozenBubble, vt: number): string {
  const parts = [`G ${vt} ${g.frame} ${g.rand.count} ${g.gstate || '-'}`];
  for (const p of g.PLAYERS) {
    const pd = g.pdata[p];
    const st = [...(g.sticked_bubbles[p] ?? [])].map((b) => [b.cx, b.cy, bubbleNum(g, b)] as [number, number, string])
      .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const l = g.launched_bubble[p];
    parts.push([p,
      `st=${pd.state || '-'}`,
      `a=${g.angle[p] === undefined ? '-' : g17(g.angle[p])}`,
      `b=${st.map((x) => x.join(',')).join(';')}`,
      `l=${l ? `${g17(l.x)},${g17(l.y)},${g17(l.direction!)},${bubbleNum(g, l)}` : '-'}`,
      `t=${bubbleNum(g, g.tobe_launched[p])}`,
      `n=${bubbleNum(g, g.next_bubble[p])}`,
      `m=${pd.malus.length}`,
      `mb=${(g.malus_bubble[p] ?? []).map((b) => `${b.cx},${b.stick_y},${g17(b.y)}`).join(';')}`,
      `f=${(g.falling_bubble[p] ?? []).map((b) => `${g17(b.x)},${g17(b.y)}`).join(';')}`,
      `c=${(g.falling_bubble[p] ?? []).filter((b) => b.chaindestx !== undefined).length}`,
      `e=${(g.exploding_bubble[p] ?? []).map((b) => `${g17(b.x)},${g17(b.y)}`).join(';')}`,
      `sc=${String(pd.score)}`,
      `nr=${pd.newroot}`,
      `h=${pd.hurry}`,
      `pg=${pd.ping_right.state},${pd.ping_right.img}`,
    ].join(' '));
  }
  return parts.join(' | ');
}

export const haveOracle = (): boolean => existsSync(join(WORK_DIR, 'libfbshim.so'));
