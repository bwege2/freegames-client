// OpenClonk in the browser: the threads and their synchronization (platform/StdScheduler.h StdThread, StdSync.h
// CStdCSec and CStdEvent) for the translated code, on the page's one thread.
//
// The original starts two kinds of threads in the game: the particle calculation (C4ParticleSystem::CalculationThread,
// whose Execute waits for frameCounterAdvancedEvent, which C4Game::Execute sets once per frame through
// Particles.CalculateNextStep(), and then moves every particle by one frame) and the screenshot writer (CPNGSaveThread,
// which saves its PNG and stops). Here a thread runs when it would run in the original, at once and to the point where
// it would wait: Start runs Execute rounds until the thread stops or waits for an event that is not set (WaitFor throws
// `blocked`, which ends the round; nothing an Execute does before its wait has an effect then, in both of the
// original's threads the wait comes first); Set on that event runs the waiting thread's next round. The main thread
// therefore sees the particles of frame n moved before it draws frame n, as the original's mutex-guarded calculation
// usually does. A thread's first round runs after the code that started it (Start queues it as a microtask).
// Critical sections never block: there is no other thread to wait for.

const INFINITE = 0xffffffff;

class Blocked {
  event: CStdEvent;
  constructor(event: CStdEvent) { this.event = event; }
}

/** StdThread: Execute is one round of the thread's loop */
export class StdThread {
  fStarted = false;
  fStopSignaled = false;
  private running = false;
  waiting: CStdEvent | null = null;

  $clone(): this { return this; }
  $assign(_o: unknown): this { return this; }
  init(): this { return this; }
  init$v(): this { return this; }
  $dtor(): void { this.Stop(); }

  /**
   * the thread's loop, run as far as it gets once the code that started it is done (a microtask): the original's
   * threads start running while their starter goes on (the particle thread is started by C4ParticleSystem's
   * constructor, before ::Particles is set)
   */
  Start(): boolean {
    this.fStarted = true;
    this.fStopSignaled = false;
    queueMicrotask(() => this.run());
    return true;
  }
  /** rounds of Execute until the thread stops or waits */
  run(): void {
    if (this.running) return;
    this.running = true;
    try {
      for (let round = 0; this.fStarted && !this.fStopSignaled; round++) {
        if (round > 1000) throw new Error('a thread that neither waits nor stops');
        try {
          this.waiting = null;
          this.Execute();
        } catch (e) {
          if (!(e instanceof Blocked)) throw e;
          this.waiting = e.event;
          e.event.waiting.add(this);
          return;
        }
      }
      if (this.fStopSignaled) {
        this.fStarted = false;
        if (this.IsSelfDestruct()) this.$dtor();
      }
    } finally {
      this.running = false;
    }
  }
  SignalStop(): void { this.fStopSignaled = true; }
  Stop(): void {
    this.fStopSignaled = true;
    this.fStarted = false;
    if (this.waiting) this.waiting.waiting.delete(this);
    this.waiting = null;
  }
  IsStarted(): boolean { return this.fStarted; }
  IsStopSignaled(): boolean { return this.fStopSignaled; }
  IsSelfDestruct(): boolean { return false; }
  Execute(): void {}
}

/** CStdEvent: set or not; a thread waiting for it runs when it is set */
export class CStdEvent {
  fSet = false;
  readonly waiting = new Set<StdThread>();
  $clone(): this { return this; }
  $assign(_o: unknown): this { return this; }
  init(initialState = false): this { this.fSet = !!initialState; return this; }
  init$b(initialState = false): this { return this.init(initialState); }
  Set(): void {
    this.fSet = true;
    for (const t of [...this.waiting]) {
      this.waiting.delete(t);
      t.run();
    }
  }
  Pulse(): void { this.Set(); this.Reset(); }
  Reset(): void { this.fSet = false; }
  /** set: true at once; not set: the main thread does not wait (false, as after a timeout), a started thread waits */
  WaitFor(iMillis: number): boolean {
    if (this.fSet) return true;
    if (iMillis === INFINITE || iMillis < 0) {
      // only a thread waits forever (the main thread would hang the original too)
      throw new Blocked(this);
    }
    return false;
  }
}

/** CStdCSec: a critical section; with one thread it is always free */
export class CStdCSec {
  $clone(): this { return this; }
  $assign(_o: unknown): this { return this; }
  init(): this { return this; }
  init$v(): this { return this; }
  Enter(): void {}
  TryEnter(): boolean { return true; }
  Leave(): void {}
}
