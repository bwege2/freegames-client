// lw/game.ts: src/game.c (setting up a battle, the main loop: logic rounds at most every
// LOGIC_DELAY_MIN ms, a frame at most every DISPLAY_DELAY_MIN ms, until Escape, one team left or the time
// is up) and src/move.c's move_all_cursors (keys, computer players, the network's keys).

import { clear_keybuf, KEY_ESC } from '../al/keyboard.ts';
import { sys, usleep } from '../al/sys.ts';
import {
  apply_all_cursor, create_army, create_game_area, create_mesh, eliminate_team, get_computer_next_move,
  init_move_fighters, lw_checksum_calc, MIN_MAP_RES_H, MIN_MAP_RES_W, move_cursor, move_fighters, place_all_team,
  reset_all_cursor, reset_computer_path, reset_game_area, reset_mesh, spread_single_gradient,
} from './core.ts';
import {
  capture, check_code, DISP_PROFILE, FLIP_PROFILE, GLOBAL_PROFILE, MOVE_PROFILE, reset_all_profile, reset_code,
  SPREAD_PROFILE, start_profile, stop_profile, update_logic_rate, watchdog_reset, watchdog_update,
} from './code.ts';
import { DISPLAY_DELAY_MIN, LOGIC_DELAY_MIN } from './config.ts';
import { disp_all_cursors, display_area, display_gradient, display_mesh, init_disp_cursor, undisp_all_cursors } from './disp.ts';
import { init_distorsion_displayer } from './distor.ts';
import { my_exit_poll } from './exit.ts';
import { check_info_state, display_info, free_info_bar } from './info.ts';
import { is_touched_key } from './keyboard.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { start_play_time, update_play_time } from './lwtime.ts';
import { lw_maptex_create_map } from './maptex.ts';
import { clear_message, display_message } from './message.ts';
import { lw_mouse_reset_control, lw_mouse_update_control } from './mouse.ts';
import { play_go, play_loose } from './sound.ts';
import {
  CONFIG_CONTROL_TYPE_CPU, CONFIG_CONTROL_TYPE_OFF, CURSOR_KEY_DOWN, CURSOR_KEY_LEFT, CURSOR_KEY_RIGHT, CURSOR_KEY_UP, G,
  NB_TEAMS,
} from './state.ts';
import { display_back_image } from './back.ts';
import { last_flip, page_flip, rect_for_viewport } from './viewport.ts';

/** the hooks the oracle's trace and the online game use */
export const gameHooks = {
  /** after every logic round's move_fighters (the trace's R line) */
  afterMove: null as (() => void) | null,
  /** after init_game (the trace's G line) */
  afterInit: null as (() => void) | null,
  /** lw_keyexch_flush in a network game: exchange the cursors' keys, false on a network error */
  keyexch: null as ((checksum: number) => Promise<boolean>) | null,
};

export function calc_playing_teams(): void {
  G.PLAYING_TEAMS = 0;
  for (let i = 0; i < NB_TEAMS; ++i) {
    if (G.LW_NETWORK_ON) {
      if (G.LW_NETWORK_INFO[i]!.active) G.PLAYING_TEAMS++;
    } else if (G.CONFIG_CONTROL_TYPE[i] !== CONFIG_CONTROL_TYPE_OFF) G.PLAYING_TEAMS++;
  }
}

function init_cursor_control_method(): void {
  for (let i = 0; i < NB_TEAMS; ++i) {
    const c = G.CURRENT_CURSOR[i]!;
    if (G.LW_NETWORK_ON) {
      c.from_network = G.LW_NETWORK_INFO[i]!.network;
      c.control_type = G.LW_NETWORK_INFO[i]!.control_type;
    } else {
      c.from_network = 0;
      c.control_type = G.CONFIG_CONTROL_TYPE[i]!;
    }
  }
}

function check_loose_team(): number {
  let i = 0, lost = 0;
  while (i < G.PLAYING_TEAMS && !lost) {
    if (G.ACTIVE_FIGHTERS[i] === 0) {
      eliminate_team(i);
      lost = 1;
    } else ++i;
  }
  if (lost) {
    play_loose();
    free_info_bar();
  }
  return lost;
}

export function init_game(): string | null {
  const minW = MIN_MAP_RES_W[G.LW_CONFIG_CURRENT_RULES.min_map_res]!;
  const minH = MIN_MAP_RES_H[G.LW_CONFIG_CURRENT_RULES.min_map_res]!;
  let message: string | null = null;
  G.CURRENT_AREA_BACK = lw_maptex_create_map(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, G.LW_NETWORK_ON,
    G.LW_RANDOM_ON, minW, minH, G.CONFIG_USE_DEFAULT_TEXTURE);
  if (!G.CURRENT_AREA_BACK) message = lw_lang_string(L.GAME_BACKMEMFAIL);
  if (!message) {
    G.CURRENT_AREA_DISP = lw_maptex_create_map(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.CONFIG_LEVEL_BG, G.LW_NETWORK_ON,
      G.LW_RANDOM_ON, minW, minH, G.CONFIG_USE_DEFAULT_TEXTURE);
    if (!G.CURRENT_AREA_DISP) message = lw_lang_string(L.GAME_DISPMEMFAIL);
  }
  if (!message) {
    if (create_mesh()) message = lw_lang_string(L.GAME_MESHMEMFAIL);
    if (!message && create_game_area()) message = lw_lang_string(L.GAME_AREAMEMFAIL);
    if (!message && create_army()) message = lw_lang_string(L.GAME_ARMYMEMFAIL);
  }
  if (!message) {
    reset_mesh();
    reset_game_area();
    reset_all_cursor();
    init_cursor_control_method();
    place_all_team();
    init_move_fighters();
    init_disp_cursor();
  }
  G.LW_NETWORK_ERROR_DETECTED = 0;
  if (!message) gameHooks.afterInit?.();
  return message;
}

export function free_game_memory(): void {
  free_info_bar();
  G.CURRENT_AREA_DISP = null;
  G.CURRENT_AREA_BACK = null;
}

export function blank_round(): number {
  page_flip();
  init_distorsion_displayer();
  display_back_image();
  rect_for_viewport();
  disp_all_cursors();
  display_area();
  undisp_all_cursors();
  page_flip();
  display_back_image();
  rect_for_viewport();
  clear_message();
  return 0;
}

function fill_next_screen(): void {
  if (G.GRAD_TO_DISP === 0) {
    disp_all_cursors();
    display_area();
    undisp_all_cursors();
  }
  if (G.GRAD_TO_DISP >= 1 && G.GRAD_TO_DISP <= 6) display_gradient(G.GRAD_TO_DISP - 1);
  if (G.GRAD_TO_DISP >= 7 && G.GRAD_TO_DISP <= 8) display_mesh(G.GRAD_TO_DISP - 7);
}

function update_key_local_cursor(indice: number): void {
  const c = G.CURRENT_CURSOR[indice]!;
  c.key_state = is_touched_key(G.CONFIG_KEY_UP[indice]!) ? CURSOR_KEY_UP : 0;
  c.key_state += is_touched_key(G.CONFIG_KEY_RIGHT[indice]!) ? CURSOR_KEY_RIGHT : 0;
  c.key_state += is_touched_key(G.CONFIG_KEY_DOWN[indice]!) ? CURSOR_KEY_DOWN : 0;
  c.key_state += is_touched_key(G.CONFIG_KEY_LEFT[indice]!) ? CURSOR_KEY_LEFT : 0;
}

async function move_all_cursors(): Promise<void> {
  lw_mouse_update_control();
  for (let j = 0; j <= G.LW_CONFIG_CURRENT_RULES.cursor_increase_speed; ++j) {
    for (let i = 0; i < NB_TEAMS; ++i) {
      const c = G.CURRENT_CURSOR[i]!;
      if (c.active && !c.from_network) {
        if (c.control_type === CONFIG_CONTROL_TYPE_CPU) c.key_state = get_computer_next_move(i);
        else update_key_local_cursor(i);
      }
    }
    if (G.LW_NETWORK_ON) {
      const checksum = lw_checksum_calc();
      if (!gameHooks.keyexch || !(await gameHooks.keyexch(checksum))) G.LW_NETWORK_ERROR_DETECTED = 1;
    }
    for (let i = 0; i < NB_TEAMS; ++i) if (G.CURRENT_CURSOR[i]!.active) move_cursor(i);
  }
}

async function logic(): Promise<void> {
  if (!G.PAUSE_ON) {
    await move_all_cursors();
    apply_all_cursor();
  }
  start_profile(SPREAD_PROFILE);
  if (!G.PAUSE_ON) spread_single_gradient();
  stop_profile(SPREAD_PROFILE);
  start_profile(MOVE_PROFILE);
  if (!G.PAUSE_ON) {
    move_fighters();
    gameHooks.afterMove?.();
  }
  stop_profile(MOVE_PROFILE);
  if (!G.PAUSE_ON) check_loose_team();
  G.GLOBAL_CLOCK++;
}

async function display(): Promise<void> {
  await watchdog_update();
  check_code();
  start_profile(DISP_PROFILE);
  fill_next_screen();
  stop_profile(DISP_PROFILE);
  check_info_state();
  update_play_time();
  if (capture.mode) {
    display_info();
    display_message();
  } else {
    display_message();
    display_info();
  }
  start_profile(FLIP_PROFILE);
  page_flip();
  stop_profile(FLIP_PROFILE);
}

export async function game(): Promise<number> {
  let last_display_time = sys.ticker();
  let last_logic_time = sys.ticker();
  start_play_time();
  await watchdog_reset();
  reset_code();
  lw_mouse_reset_control();
  reset_computer_path();
  reset_all_profile();
  play_go();
  G.LW_GAME_RUNNING = 1;
  while (!G.WATCHDOG_SCANCODE[KEY_ESC] && G.PLAYING_TEAMS >= 2 && G.TIME_LEFT > 0 && !G.LW_NETWORK_ERROR_DETECTED) {
    start_profile(GLOBAL_PROFILE);
    let lr = 0;
    do {
      await logic();
      while (sys.ticker() < last_logic_time + LOGIC_DELAY_MIN[G.CONFIG_ROUNDS_PER_SEC_LIMIT]!) await usleep(1000);
      last_logic_time = sys.ticker();
      lr++;
    } while (G.CONFIG_FRAMES_PER_SEC_LIMIT && sys.ticker() < last_display_time + DISPLAY_DELAY_MIN[G.CONFIG_FRAMES_PER_SEC_LIMIT]!);
    update_logic_rate(lr);
    last_display_time = sys.ticker();
    await display();
    await my_exit_poll();
    stop_profile(GLOBAL_PROFILE);
  }
  G.LW_GAME_RUNNING = 0;
  last_flip();
  clear_keybuf();
  return 0;
}

