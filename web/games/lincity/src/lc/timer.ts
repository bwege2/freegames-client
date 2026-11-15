// timer.c: the real-time clock and the game speed buttons.
import { G, scr } from './g.ts';
import { platform } from './platform.ts';
import { mouse_register, hide_mouse, redraw_mouse } from './mouse.ts';
import { activate_help } from './lchelp.ts';
import { draw_pause, draw_slow, draw_med, draw_fast } from './geometry.ts';
import { LC_MOUSE_RIGHTBUTTON } from './consts.ts';

let real_start_time = 0;

export function lc_usleep(t: number): void {
  platform().sleepUs(t);
}

export function reset_start_time(): void {
  real_start_time = Math.floor(platform().nowUs() / 1000000);
}

export function get_real_time(): void {
  const us = platform().nowUs();
  const sec = Math.floor(us / 1000000);
  const usec = us - sec * 1000000;
  // a long; the game stores it in ints
  G.real_time = (sec - real_start_time) * 1000 + Math.floor(usec / 1000);
}

export function init_timer_buttons(): void {
  mouse_register(scr.pause_button, pause_handler);
  mouse_register(scr.slow_button, slow_handler);
  mouse_register(scr.med_button, medium_handler);
  mouse_register(scr.fast_button, fast_handler);
}

function pause_handler(_x: number, _y: number, button: number): void {
  if (button === LC_MOUSE_RIGHTBUTTON) activate_help('pause.hlp');
  else select_pause();
}
function slow_handler(_x: number, _y: number, button: number): void {
  if (button === LC_MOUSE_RIGHTBUTTON) activate_help('slow.hlp');
  else select_slow();
}
function medium_handler(_x: number, _y: number, button: number): void {
  if (button === LC_MOUSE_RIGHTBUTTON) activate_help('medium.hlp');
  else select_medium();
}
function fast_handler(_x: number, _y: number, button: number): void {
  if (button === LC_MOUSE_RIGHTBUTTON) activate_help('fast.hlp');
  else select_fast();
}

function setSpeed(slow: number, med: number, fast: number): void {
  hide_mouse();
  G.pause_flag = 0;
  draw_pause(0);
  G.slow_flag = slow;
  draw_slow(slow);
  G.med_flag = med;
  draw_med(med);
  G.fast_flag = fast;
  draw_fast(fast);
  redraw_mouse();
}
export const select_fast = (): void => setSpeed(0, 0, 1);
export const select_medium = (): void => setSpeed(0, 1, 0);
export const select_slow = (): void => setSpeed(1, 0, 0);

export function select_pause(): void {
  if (G.pause_flag) {
    if (G.fast_flag) select_fast();
    else if (G.med_flag) select_medium();
    else if (G.slow_flag) select_slow();
    else select_medium();
  } else {
    hide_mouse();
    G.pause_flag = 1;
    draw_pause(1);
    draw_slow(0);
    draw_med(0);
    draw_fast(0);
    redraw_mouse();
  }
}
