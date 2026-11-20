// The original's Timer (src/supertux/timer.hpp): g_game_time based start/stop/check.
export class Timer {
  private startTime = 0;
  private period = 0;

  start(period: number): void { this.period = Math.max(0, period); this.startTime = now; }
  stop(): void { this.period = 0; }
  started(): boolean { return this.period > 0 && this.get_timeleft() > 0; }
  get_timeleft(): number { return this.period > 0 ? this.startTime + this.period - now : 0; }
  get_timegone(): number { return this.period > 0 ? now - this.startTime : 0; }
  get_period(): number { return this.period; }
  check(): boolean { return this.started() && this.get_timeleft() <= 0; }
}

/** the port's clock: the original's g_real_time/g_game_time at 15 ms steps */
export let now = 0;
export function advanceClock(dt: number): void { now += dt; }
export function setClock(t: number): void { now = t; }
