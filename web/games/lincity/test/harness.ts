// The port on a session, under the same rules as the oracle's fake Xlib (re/lincity/oracle/fakex.c): a
// virtual clock that select() advances by its timeout and an empty XPending() by 1 ms, the session's keys,
// buttons and pointer moves at their times, MotionNotify for moves with a button held, MapNotify after
// the window is mapped, and the state dumps (dump.ts) where the session asks for them.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setPlatform, type Platform, type XEv, KeyPress, ButtonPress, ButtonRelease, MotionNotify, MapNotify,
  ConfigureNotify, ShiftMask } from '../src/lc/platform.ts';
import { ExitProgram } from '../src/lc/c.ts';
import { vfsPut, LIBDIR } from '../src/lc/stdio.ts';
import { unpackData, installData } from '../src/data.ts';
import { XK_Left, XK_Right, XK_Up, XK_Down, XK_BackSpace, XK_Delete } from '../src/lc/lcx11.ts';

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = join(here, '..', '..', '..', '..');
export const ORIG = join(REPO, 're', 'lincity', 'orig', 'lincity-1.13.1');
export const ORACLE = join(REPO, 're', 'lincity', 'oracle', 'lincity-oracle');
export const haveOriginal = (): boolean => existsSync(join(ORIG, 'colour.pal'));
export const haveOracle = (): boolean => haveOriginal() && existsSync(ORACLE);

/** the game's shipped data pack (assets/lincity-data.bin: the original's files byte for byte, unit.test.ts) */
export const PACK = join(here, '..', 'assets', 'lincity-data.bin');

/**
 * the installed data: colour.pal, opening/, help/, messages/, icons/ of the original's tree when it is there
 * (re/lincity/fetch.sh), else the same files from the shipped data pack, so the port's sessions run on a
 * clean checkout too
 */
export function loadOriginalFiles(): void {
  if (!haveOriginal()) {
    installData(unpackData(readFileSync(PACK)));
    return;
  }
  vfsPut(`${LIBDIR}/colour.pal`, readFileSync(join(ORIG, 'colour.pal')));
  for (const d of ['opening', 'help', 'messages', 'icons']) {
    for (const f of readdirSync(join(ORIG, d))) {
      const p = join(ORIG, d, f);
      if (statSync(p).isFile()) vfsPut(`${LIBDIR}/${d}/${f}`, readFileSync(p));
    }
  }
}

interface Entry { t: number; op: string; a: string; x: number; y: number; shift: boolean }

export function parseScript(text: string): { seed: number; entries: Entry[] } {
  let seed = 1;
  const entries: Entry[] = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('#') || line.trim() === '') continue;
    const s = /^seed\s+(-?\d+)/.exec(line);
    if (s) { seed = parseInt(s[1], 10); continue; }
    const w = line.trim().split(/\s+/);
    if (w.length < 2) continue;
    const e: Entry = { t: parseInt(w[0], 10), op: w[1], a: w[2] ?? '', x: 0, y: 0, shift: false };
    if (e.op === 'move' || e.op === 'resize') { e.x = parseInt(w[2], 10); e.y = parseInt(w[3], 10); }
    if (w[3] === 'shift' || w[4] === 'shift') e.shift = true;
    entries.push(e);
  }
  return { seed, entries };
}

const KEYS: Record<string, [number, number]> = {
  Left: [XK_Left, 0], Right: [XK_Right, 0], Up: [XK_Up, 0], Down: [XK_Down, 0],
  BackSpace: [XK_BackSpace, 8], Delete: [XK_Delete, 127], Return: [0xff0d, 13], Escape: [0xff1b, 27], Space: [32, 32],
};

export class ScriptPlatform implements Platform {
  private now = 1000000000 * 1000000;
  private readonly start = this.now;
  private cur = 0;
  private ptrX = 0;
  private ptrY = 0;
  private pendingMap = false;
  private pendingMotion = 0;
  private buttonsDown = 0;
  palette = new Uint8Array(768);
  readonly seed: number;
  private readonly entries: Entry[];
  private readonly onDump: (name: string) => void;
  constructor(script: string, onDump: (name: string) => void) {
    const p = parseScript(script);
    this.seed = p.seed;
    this.entries = p.entries;
    this.onDump = onDump;
  }
  private nowMs(): number { return Math.trunc((this.now - this.start) / 1000); }
  private due(): Entry | null {
    while (this.cur < this.entries.length && this.entries[this.cur].t <= this.nowMs()) {
      const e = this.entries[this.cur];
      if (e.op === 'move') {
        this.ptrX = e.x;
        this.ptrY = e.y;
        this.cur++;
        if (this.buttonsDown) this.pendingMotion = this.buttonsDown;
        continue;
      }
      if (e.op === 'dump') {
        this.cur++;
        this.onDump(e.a);
        continue;
      }
      if (e.op === 'quit') throw new ExitProgram(0);
      return e;
    }
    if (this.cur >= this.entries.length) throw new ExitProgram(0);
    return null;
  }
  nowUs(): number { return this.now; }
  time(): number { return this.seed; }
  sleepUs(us: number): void { this.now += us; }
  pending(): boolean {
    if (this.pendingMap || this.pendingMotion) return true;
    if (this.due()) return true;
    this.now += 1000;
    return false;
  }
  nextEvent(): XEv {
    if (this.pendingMap) {
      this.pendingMap = false;
      return { type: MapNotify };
    }
    if (this.pendingMotion) {
      const state = this.pendingMotion;
      this.pendingMotion = 0;
      return { type: MotionNotify, state };
    }
    let e: Entry | null;
    while (!(e = this.due())) this.now += 1000;
    this.cur++;
    if (e.op === 'key') {
      const k = KEYS[e.a];
      const keysym = k ? k[0] : e.a.charCodeAt(0);
      const ch = k ? k[1] : e.a.charCodeAt(0);
      return { type: KeyPress, keysym, ch, state: e.shift ? ShiftMask : 0 };
    }
    if (e.op === 'press' || e.op === 'release') {
      const button = parseInt(e.a, 10);
      const ev: XEv = { type: e.op === 'press' ? ButtonPress : ButtonRelease, button, state: e.shift ? ShiftMask : 0 };
      if (button >= 1 && button <= 3) {
        if (ev.type === ButtonPress) this.buttonsDown |= (1 << 8) << (button - 1);
        else this.buttonsDown &= ~((1 << 8) << (button - 1));
      }
      return ev;
    }
    if (e.op === 'resize') return { type: ConfigureNotify, width: e.x, height: e.y };
    return { type: 0 };
  }
  pointer(): [number, number] {
    this.due();
    return [this.ptrX, this.ptrY];
  }
  mapWindow(): void { this.pendingMap = true; }
  setPalette(pal: Uint8Array): void { this.palette = pal.slice(); }
  setCursor(): void { /* no pointer here */ }
  dirty(): void { /* nothing to show */ }
  fileChanged(): void { /* the files stay in the file system */ }
}

export function installScript(script: string, onDump: (name: string) => void): ScriptPlatform {
  const p = new ScriptPlatform(script, onDump);
  setPlatform(p);
  return p;
}
