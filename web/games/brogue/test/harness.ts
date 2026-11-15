// Runs the port headless as re/brogue/oracle/console.c runs the original: the same command line, the
// clock fixed at the same second (UTC), the events of a session given one at a time when the program asks
// for one (or when a pause has lasted their delay), and every frame recorded: the event's index, the
// virtual time and the FNV-1a hash of the screen as plotted.
import { bytesText, runBrogue, type RunResult } from '../src/program.ts';
import type { BrogueEvent, Platform } from '../src/rt/platform.ts';
import { setMul64Strict } from '../src/rt/ptr.ts';

export const TIME = 1704067200; // 2024-01-01 00:00 UTC, console.c's clock
const ROWS = 34, COLS = 100;
const KEYSTROKE = 0, MOUSE_ENTERED_CELL = 5;

export interface ScriptEvent {
  type: number;
  p1: number;
  p2: number;
  ctrl: boolean;
  shift: boolean;
  /** ms after the event before (default 1000); -1: only when the game waits */
  delay: number;
}

/** an events file of console.c */
export function parseEvents(text: string): ScriptEvent[] {
  const out: ScriptEvent[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const words = line.split(/\s+/);
    const e: ScriptEvent = { type: KEYSTROKE, p1: 0, p2: 0, ctrl: false, shift: false, delay: 1000 };
    let rest: string[];
    if (words[0] === 'k') {
      e.p1 = parseInt(words[1], 10);
      rest = words.slice(2);
    } else if (words[0] === 'm') {
      e.type = parseInt(words[1], 10);
      e.p1 = parseInt(words[2], 10);
      e.p2 = parseInt(words[3], 10);
      rest = words.slice(4);
    } else throw new Error(`bad event line: ${line}`);
    for (const w of rest) {
      for (let i = 0; i < w.length; i++) {
        if (w[i] === 'c') e.ctrl = true;
        else if (w[i] === 's') e.shift = true;
        else if (w[i] === '@') {
          e.delay = parseInt(w.slice(i + 1), 10);
          break;
        }
      }
    }
    out.push(e);
  }
  return out;
}

export interface Frame {
  index: number;
  vclock: number;
  hash: string;
}

export interface SessionRun extends RunResult {
  frames: Frame[];
  /** 'E' when the events were used up (exit 99), else 'X' */
  end: string;
  /** the screens of every frame, when asked for */
  screens?: Uint32Array[];
}

export class Screen {
  readonly cells = new Int32Array(COLS * ROWS * 7);
  plot(g: number, x: number, y: number, c: number[]): void {
    const o = (y * COLS + x) * 7;
    this.cells[o] = g;
    for (let i = 0; i < 6; i++) this.cells[o + 1 + i] = c[i];
  }
  /** console.c's screenHash: FNV-1a over glyph and colours of every cell, row by row, 4 bytes each */
  hash(): string {
    let h = 2166136261;
    const c = this.cells;
    for (let i = 0; i < c.length; i++) {
      const v = c[i];
      for (let b = 0; b < 4; b++) {
        h ^= (v >>> (8 * b)) & 0xff;
        h = Math.imul(h, 16777619) >>> 0;
      }
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }
  /** the characters of row y (glyphs above 127 as '?') */
  row(y: number): string {
    let s = '';
    for (let x = 0; x < COLS; x++) {
      const g = this.cells[(y * COLS + x) * 7];
      s += g >= 32 && g < 127 ? String.fromCharCode(g) : g === 0 ? ' ' : '?';
    }
    return s.trimEnd();
  }
  text(): string {
    const r: string[] = [];
    for (let y = 0; y < ROWS; y++) r.push(this.row(y));
    return r.join('\n');
  }
}

class EventsEnded extends Error {}

/** runs the program with these events (console.c's rules) */
export async function runSession(args: string[], events: ScriptEvent[], files = new Map<string, Uint8Array>(),
  opts: { keepScreens?: boolean; time?: number } = {}): Promise<SessionRun> {
  setMul64Strict(true);
  const screen = new Screen();
  const frames: Frame[] = [];
  const screens: Uint32Array[] = [];
  let next = 0, vclock = 0, lastTaken = 0, shift = false, ctrl = false;
  let end = 'X';
  const arrived = () => next < events.length && events[next].delay >= 0 && vclock >= lastTaken + events[next].delay;
  const platform: Platform = {
    async nextKeyOrMouseEvent(ev: BrogueEvent) {
      if (next >= events.length) {
        end = 'E';
        throw new EventsEnded();
      }
      const e = events[next];
      if (e.delay >= 0 && vclock < lastTaken + e.delay) vclock = lastTaken + e.delay;
      frames.push({ index: next, vclock, hash: screen.hash() });
      if (opts.keepScreens) screens.push(new Uint32Array(screen.cells));
      next++;
      lastTaken = vclock;
      ev.eventType = e.type;
      ev.param1 = e.p1;
      ev.param2 = e.p2;
      ev.controlKey = e.ctrl ? 1 : 0;
      ev.shiftKey = e.shift ? 1 : 0;
      ctrl = e.ctrl;
      shift = e.shift;
    },
    async pauseForMilliseconds(ms: number, interruptForMouseMove: boolean) {
      vclock += ms;
      if (!arrived()) return false;
      return events[next].type !== MOUSE_ENTERED_CELL || interruptForMouseMove;
    },
    plotChar(g, x, y, fr, fg, fb, br, bg, bb) {
      screen.plot(g, x, y, [fr, fg, fb, br, bg, bb]);
    },
    modifierHeld(m) {
      return m === 0 ? shift : ctrl;
    },
    time: () => opts.time ?? TIME,
    fileChanged() {},
    stderr() {},
  };
  let r: RunResult;
  try {
    r = await runBrogue(platform, args, files);
  } catch (e) {
    if (!(e instanceof EventsEnded)) throw e;
    // like console.c: exit 99 when the events are used up (the files as they are)
    const { fsFiles, termTake } = await import('../src/rt/fs.ts');
    r = { status: 99, files: fsFiles(), stdout: bytesText(termTake()) };
  }
  return { ...r, frames, end, screens: opts.keepScreens ? screens : undefined };
}
