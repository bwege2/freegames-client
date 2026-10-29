// The client's threads (re/freecol/NOTES.md, "The client"). FreeCol's client runs many Java threads: the
// AWT event dispatch thread (EDT), a thread per message from the server, timers, painters, animations.
// Their work runs here on one JavaScript thread, in a worker, without stack switching:
// - a started thread is a task, run to its end when its turn comes;
// - a thread that blocks (sleep, wait, waiting for the server's reply, invokeAndWait, a modal loop) runs
//   other work while it waits ("a nested pump"), and blocks the worker (Atomics.wait) when there is none;
// - a lower frame of the JavaScript stack cannot resume before the frames above it end, so a nested pump
//   only runs work that cannot wait for a thread lower on the stack: AWT events only while the EDT is not
//   in the middle of handling one, and new threads only while the EDT is not blocked in a handler (such a
//   thread would typically wait for the EDT). That queues work the JVM would run at once, but never
//   reorders what one thread does.
import { $J, Thread } from '../../jre/index.ts';

type Frame = { thread: any; kind: 'run' | 'pump' | 'wait' };
type Timer = { at: number; seq: number; fn: () => void; cancelled?: boolean };

export class Scheduler {
  /** Started threads waiting for their turn. */
  ready: any[] = [];
  alive = new Set<any>();
  /** The threads on the JavaScript stack, innermost last, and what each frame does. */
  frames: Frame[] = [];
  /** The main thread (FreeCol.main) and the EDT. */
  main: any;
  edt: any;
  timers: Timer[] = [];
  seq = 0;
  notified = new Map<any, number>();
  // the platform layer fills these in
  /** Takes in what arrived (server messages, input): true if something was handled. */
  poll: () => boolean = () => false;
  /** Blocks up to ms for something to arrive (Atomics.wait on the doorbell). */
  idle: (ms: number) => void = () => {};
  /** Shows what was painted. */
  present: () => void = () => {};
  /** Dispatches one AWT event, if there is one: true if it did. */
  dispatchOne: () => boolean = () => false;
  /** An uncaught exception in a thread. */
  uncaught: (t: any, e: any) => void = (t, e) => console.error('uncaught in ' + t?.getName?.() + ': ' + (e?.toString?.() ?? e) + '\n' + (e?.$stack ?? e?.stack ?? ''));
  now: () => number = () => performance.now();
  /** After this long an unbounded wait is reported (stuck). */
  stuckMs = 10000;
  /** A harness's end: every wait unwinds after it. */
  stopAt = Infinity;
  /** When the current run of waits began (reset when the worker's loop is back at the top). */
  waitStart: number | null = null;
  stuck: (t: any, where: string) => void = (_t, where) => console.warn(where);

  constructor() {
    this.main = Thread.currentThread();
    this.edt = new Thread('AWT-EventQueue-0');
  }

  install() {
    $J.threads = this;
    $J.startThread = (t: any) => this.start(t);
  }

  start(t: any) {
    this.alive.add(t);
    this.ready.push(t);
  }

  isAlive(t: any) {
    return this.alive.has(t);
  }

  current() {
    return this.frames.length ? this.frames[this.frames.length - 1].thread : this.main;
  }

  /** Runs f as thread t (Thread.currentThread() is t meanwhile). */
  runAs<T>(t: any, kind: 'run' | 'pump', f: () => T): T {
    this.frames.push({ thread: t, kind });
    const prev = Thread.current;
    Thread.current = t;
    try {
      return f();
    } finally {
      this.frames.pop();
      Thread.current = prev;
    }
  }

  runThread(t: any) {
    try {
      this.runAs(t, 'run', () => t.run());
      this.alive.delete(t);
    } catch (e: any) {
      if (e?.$stop) throw e;
      if (e?.$parked) return; // waits for ever: alive, never runs again
      this.alive.delete(t);
      this.uncaught(t, e);
    }
  }

  /** What a thread throws when it would wait for something that never comes (it unwinds and stays parked). */
  parkForever() {
    return { $parked: true };
  }

  /** The EDT's innermost frame on the stack: none, a handler ('run' or 'wait'), or a modal loop ('pump'). */
  edtFrame(): Frame | null {
    for (let i = this.frames.length - 1; i >= 0; i--) if (this.frames[i].thread === this.edt) return this.frames[i];
    return null;
  }

  canDispatch() {
    const f = this.edtFrame();
    return f == null || f.kind === 'pump';
  }

  canRunThreads() {
    const f = this.edtFrame();
    return f == null || f.kind === 'pump';
  }

  isDispatchThread() {
    return this.current() === this.edt;
  }

  // ---- timers

  setTimer(ms: number, fn: () => void): Timer {
    if (!Number.isFinite(ms)) throw new Error("timer delay " + ms);
    const t = { at: this.now() + Math.max(0, ms), seq: this.seq++, fn };
    this.timers.push(t);
    this.timers.sort((a, b) => a.at - b.at || a.seq - b.seq);
    return t;
  }

  clearTimer(t: Timer) {
    if (t) t.cancelled = true;
  }

  nextTimerIn(): number {
    while (this.timers.length && this.timers[0].cancelled) this.timers.shift();
    return this.timers.length ? Math.max(0, this.timers[0].at - this.now()) : Infinity;
  }

  // ---- the pump

  /** One piece of work, if there is one that may run now. */
  step(): boolean {
    if (this.poll()) return true;
    if (this.nextTimerIn() === 0) {
      const t = this.timers.shift()!;
      t.fn();
      return true;
    }
    if (this.canDispatch() && this.dispatchOne()) return true;
    if (this.canRunThreads() && this.ready.length) {
      this.runThread(this.ready.shift());
      return true;
    }
    return false;
  }

  /**
   * Blocks the current thread until cond() holds or ms pass (a nested pump). kind 'pump' is the EDT's own
   * modal loop, which keeps dispatching events.
   */
  waitUntil(cond: () => boolean, ms?: number, kind: 'wait' | 'pump' = 'wait', idleOk = false): boolean {
    const start = this.now();
    const deadline = ms == null || ms <= 0 ? Infinity : start + ms;
    const t = this.current();
    this.frames.push({ thread: t, kind });
    let warned = false;
    try {
      for (;;) {
        if (cond()) return true;
        if (this.now() > this.stopAt) throw { $parked: true, $stop: true }; // the harness stops the client
        const left = deadline - this.now();
        if (left <= 0) return false;
        this.waitStart ??= start;
        if (!warned && !idleOk && kind === 'wait' && this.now() - this.waitStart > this.stuckMs) {
          // a thread waits a long time for something nothing provides: say where (development aid)
          warned = true;
          this.stuck(t, new Error('thread ' + t?.getName?.() + ' waits').stack ?? '');
        }
        if (this.step()) continue;
        this.present();
        this.idle(Math.min(left, this.nextTimerIn(), 1000));
      }
    } finally {
      this.frames.pop();
    }
  }

  sleep(ms: number) {
    this.waitUntil(() => false, Math.max(1, ms));
  }

  join(t: any, ms?: number) {
    this.waitUntil(() => !this.alive.has(t), ms);
  }

  permits = new Set<any>();
  /** LockSupport.park: until unparked (or ms). */
  park(ms?: number) {
    const t = this.current();
    this.waitUntil(() => this.permits.has(t), ms, 'wait', true);
    this.permits.delete(t);
  }
  unpark(t: any) {
    this.permits.add(t);
  }

  monitorWait(o: any, ms?: number) {
    const gen = this.notified.get(o) ?? 0;
    this.waitUntil(() => (this.notified.get(o) ?? 0) !== gen, ms);
  }

  monitorNotify(o: any, _all: boolean) {
    this.notified.set(o, (this.notified.get(o) ?? 0) + 1);
  }

  /** The worker's own loop: everything that can run now; the time until the next timer (or Infinity). */
  runUntilIdle(sliceMs = 50): number {
    this.waitStart = null;
    const end = this.now() + sliceMs;
    let busy = false;
    while ((busy = this.step()) && this.now() < end) {}
    this.present();
    return busy ? 0 : this.nextTimerIn();
  }
}
