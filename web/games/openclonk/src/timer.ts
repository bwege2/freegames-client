// OpenClonk in the browser: the original's game timer, C4ApplicationGameTimer (game/C4Application.cpp) on its
// CStdMultimediaTimerProc (platform/StdScheduler.h, a timerfd on Linux), driven by the browser's display frames.
//
// The original: the timer expires every 26 ms (`CStdMultimediaTimerProc(26)`); every expiry the scheduler runs
// C4ApplicationGameTimer::Execute, which runs one game tick (C4Application::GameTick: Game.Execute, sound, music)
// and then draws (C4Application::Draw). Execute's condition `tNow >= tLastGameTick + iExtraGameTickDelay` is always
// true: tLastGameTick starts at C4TimeMilliseconds::NegativeInfinity and C4TimeMilliseconds' `+=` keeps an infinity
// (platform/C4TimeMilliseconds.h), so it never becomes finite. So the game runs at one tick per 26 ms, about 38.5
// frames a second, the "38" FnSetGameSpeed falls back to. SetGameSpeed(s) (C4GameScript.cpp) calls
// SetGameTickDelay(1000 / s): below Config.Graphics.MaxRefreshDelay (30) that becomes the timer's delay; above it the
// timer runs every 30 ms and iExtraGameTickDelay is set, which the condition above never sees.
//
// The browser wakes the page once per display frame, not per expiry. Every expiry since the last display frame
// runs now, one timer event each, in order; when the page was away longer than MAX_EVENTS expiries (a hidden tab),
// the rest are dropped, as the original's timerfd counts expirations it reads late as one.

/** CStdMultimediaTimerProc(26) in C4ApplicationGameTimer's constructor */
export const GAME_TIMER_DELAY = 26;
/** Config.Graphics.MaxRefreshDelay's default (config/C4Config.cpp) */
export const MAX_REFRESH_DELAY = 30;
/** the most timer events one display frame runs */
export const MAX_EVENTS = 4;

export class GameTimer {
  /** the timer's period (CStdMultimediaTimerProc::SetDelay) */
  delay = GAME_TIMER_DELAY;
  /** C4ApplicationGameTimer::iGameTickDelay, iExtraGameTickDelay (kept for SetGameTickDelay's bookkeeping) */
  gameTickDelay = 28;
  extraGameTickDelay = 0;
  /** the next expiry (ms, the clock of `frame`); null before the first frame */
  private next: number | null = null;

  /** C4ApplicationGameTimer::SetGameTickDelay */
  SetGameTickDelay(delay: number): void {
    this.gameTickDelay = delay >>> 0;
    if (this.gameTickDelay < MAX_REFRESH_DELAY) {
      this.setDelay(this.gameTickDelay);
      this.extraGameTickDelay = 0;
    } else {
      this.setDelay(MAX_REFRESH_DELAY);
      this.extraGameTickDelay = this.gameTickDelay;
    }
  }

  /** CStdMultimediaTimerProc::SetDelay: the timerfd starts its new period now */
  private setDelay(delay: number): void {
    this.delay = Math.max(1, delay);
    if (this.next !== null) this.next = this.now + this.delay;
  }

  private now = 0;

  /**
   * One display frame at time `now` (ms): runs `event` once per timer expiry since the last frame (at most
   * MAX_EVENTS). Returns how many ran.
   */
  frame(now: number, event: () => void): number {
    this.now = now;
    if (this.next === null) {
      // the timer is set when the game starts: its first expiry is one period later
      this.next = now + this.delay;
      return 0;
    }
    let ran = 0;
    while (now >= this.next && ran < MAX_EVENTS) {
      this.next += this.delay;
      event();
      ran++;
    }
    // expiries read late count as one (timerfd): the next one is on the period's grid after now
    if (now >= this.next) this.next += Math.floor((now - this.next) / this.delay + 1) * this.delay;
    return ran;
  }
}
