// lw/lwtime.ts: src/lwtime.c: the game's clock (rounds: GLOBAL_CLOCK) and its time limit, counted on the
// 10 ms ticker, paused with the game; the bell 5 seconds before the end.

import { sys } from '../al/sys.ts';
import { G } from './state.ts';
import { play_time } from './sound.ts';

const TIME_TABLE = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480, 600, 900, 1200, 1800, 3600];
let TICKER_PAUSED = 0;
let TICKER_START = 0;
let TICKER_PAUSE_START = 0;
let BELL_RINGING = 0;

export function update_play_time(): void {
  const t = sys.ticker();
  G.GLOBAL_TICKER = t - TICKER_START;
  if (G.PAUSE_ON) {
    if (TICKER_PAUSE_START === 0) TICKER_PAUSE_START = t;
  } else if (TICKER_PAUSE_START !== 0) {
    TICKER_PAUSED += t - TICKER_PAUSE_START;
    TICKER_PAUSE_START = 0;
  } else G.TIME_ELAPSED = Math.trunc((t - TICKER_START - TICKER_PAUSED) / 1000);
  G.TIME_LEFT = TIME_TABLE[G.LW_CONFIG_CURRENT_RULES.game_time]! - G.TIME_ELAPSED;
  if (G.TIME_LEFT < 0) G.TIME_LEFT = 0;
  if (G.TIME_LEFT <= 5 && BELL_RINGING === 0) {
    BELL_RINGING = 1;
    play_time();
  }
}

export function start_play_time(): void {
  G.GLOBAL_CLOCK = 2;
  TICKER_START = sys.ticker();
  TICKER_PAUSED = 0;
  TICKER_PAUSE_START = 0;
  G.TIME_ELAPSED = 0;
  G.TIME_LEFT = TIME_TABLE[G.LW_CONFIG_CURRENT_RULES.game_time]! + 1;
  BELL_RINGING = 0;
  update_play_time();
}

export function write_time(time: number): string {
  const min = Math.trunc(time / 60), sec = time % 60;
  return String.fromCharCode(48 + Math.trunc(min / 10), 48 + (min % 10), 58, 48 + Math.trunc(sec / 10), 48 + (sec % 10));
}
