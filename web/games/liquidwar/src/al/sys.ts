// al/sys.ts: the clock the port runs on, the same as the oracle's (re/liquidwar/oracle/oracle.c).
//
// Time (microseconds) moves only where the original sleeps or polls: usleep, rest, keypressed called from
// the game's own code (1 us) and a held mouse button read by the GUI (100 us). Each move first samples the
// screen once per 20 ms bucket (the trace's F lines, tests only), then runs the input events and the
// timers (install_int_ex: the 10 ms ticker and the water sounds) that fall in the step, in time order.
//
// In the browser the clock is held to real time: when it runs ahead, advance() waits; when the page falls
// behind (a hidden tab), the clock jumps forward as a slow machine's would. Input from the page is
// applied when it arrives, as Allegro's X11 thread applies it.

export interface SysEvent {
  t: number;
  apply: () => void;
}

interface Timer {
  proc: () => void;
  period: number;
  next: number;
}

export const SAMPLE_US = 20000;

class Sys {
  /** virtual time, microseconds */
  vt = 0;
  realtime = false;
  private t0 = 0;
  private lastBucket = -1;
  private events: SysEvent[] = [];
  private nextEvent = 0;
  private timers: Timer[] = [];
  private advancing = false;
  private lastYield = 0;
  /** called once per 20 ms bucket before the clock moves (the trace's screen sample) */
  onSample: (() => void) | null = null;
  /** set by stop(): every later advance() rejects, so the game's loops end */
  stopped: Error | null = null;
  /** an abort signal for real-time waits */
  signal: AbortSignal | null = null;

  reset(realtime: boolean): void {
    this.vt = 0;
    this.realtime = realtime;
    this.t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    this.lastBucket = -1;
    this.events = [];
    this.nextEvent = 0;
    this.timers = [];
    this.advancing = false;
    this.stopped = null;
  }

  /** scripted input (tests): events sorted by time, applied by advance() */
  setEvents(events: SysEvent[]): void {
    this.events = events.slice().sort((a, b) => a.t - b.t);
    this.nextEvent = 0;
  }

  installTimer(proc: () => void, periodUs: number): void {
    const old = this.timers.find((t) => t.proc === proc);
    if (old) {
      old.period = periodUs;
      old.next = this.vt + periodUs;
      return;
    }
    this.timers.push({ proc, period: periodUs, next: this.vt + periodUs });
  }

  removeTimer(proc: () => void): void {
    this.timers = this.timers.filter((t) => t.proc !== proc);
  }

  /** moves the clock by d microseconds; in real time, may wait */
  advance(d: number): Promise<void> | void {
    if (this.stopped) return Promise.reject(this.stopped);
    if (this.advancing) return;
    this.advancing = true;
    if (Math.floor(this.vt / SAMPLE_US) !== this.lastBucket) {
      this.onSample?.();
      this.lastBucket = Math.floor(this.vt / SAMPLE_US);
    }
    const target = this.vt + d;
    for (;;) {
      let best: Timer | null = null;
      for (const t of this.timers) if (t.next <= target && (!best || t.next < best.next)) best = t;
      const ev = this.nextEvent < this.events.length ? this.events[this.nextEvent]! : null;
      if (ev && ev.t <= target && (!best || ev.t <= best.next)) {
        if (ev.t > this.vt) this.vt = ev.t;
        this.nextEvent++;
        ev.apply();
        continue;
      }
      if (best) {
        if (best.next > this.vt) this.vt = best.next;
        best.next += best.period;
        best.proc();
        continue;
      }
      break;
    }
    this.vt = target;
    this.advancing = false;
    if (this.realtime) {
      const real = (performance.now() - this.t0) * 1000;
      if (this.vt > real + 4000) return this.wait((this.vt - real) / 1000);
      if (this.vt < real - 250000) this.vt = real - 250000;
      // a loop that polls without sleeping still lets the page run (input, drawing) every few ms
      if (performance.now() - this.lastYield > 12) return this.wait(0);
    }
  }

  private wait(ms: number): Promise<void> {
    this.lastYield = performance.now();
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        this.signal?.removeEventListener('abort', onAbort);
        if (this.stopped) reject(this.stopped);
        else resolve();
      }, ms);
      const onAbort = (): void => {
        clearTimeout(id);
        reject(this.stopped ?? new Error('stopped'));
      };
      this.signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  /** the time in ms the game sees (oracle: get_ticker) */
  ticker(): number {
    return Math.floor(this.vt / 10000) * 10;
  }

  stop(): void {
    this.stopped = new Error('stopped');
  }
}

export const sys = new Sys();

/** thrown out of the game's loops when the session or the page ends */
export class GameExit extends Error {
  readonly code: number;
  constructor(code: number) {
    super(`exit ${code}`);
    this.code = code;
  }
}

export function usleep(us: number): Promise<void> | void {
  return sys.advance(us);
}

export function rest(ms: number): Promise<void> | void {
  return sys.advance(ms * 1000);
}
