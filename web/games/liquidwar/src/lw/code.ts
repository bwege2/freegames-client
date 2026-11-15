// lw/code.ts: the keys and secret codes during a battle: src/watchdog.c (the keys typed since the last
// frame), src/code.c (F3 pause, F4 waves, F5-F8 speed figures, F9 capture, the codes "ufootspeed" and
// "ufootgradn0".."ufootgradn8") and src/profile.c (the time spent, on the 10 ms ticker).

import { KEY_F3, KEY_F4, KEY_F5, KEY_F6, KEY_F7, KEY_F8, KEY_F9, keypressed, readkey } from '../al/keyboard.ts';
import { sys } from '../al/sys.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { message_str, message_str_int } from './message.ts';
import { G } from './state.ts';

// ---- watchdog.c ----

const WATCHDOG_BUFFER_SIZE = 1024;
const WATCHDOG_MAX_WORD = 64;
const WATCHDOG_KEYWORD = 'ufoot';
const WATCHDOG_BUFFER = new Int32Array(WATCHDOG_BUFFER_SIZE);
let WATCHDOG_KEYS_IN_BUFFER = 0;

export async function watchdog_update(): Promise<void> {
  let old_pos = WATCHDOG_KEYS_IN_BUFFER;
  G.WATCHDOG_ASCII.fill(0);
  G.WATCHDOG_SCANCODE.fill(0);
  const n = WATCHDOG_KEYS_IN_BUFFER - WATCHDOG_MAX_WORD;
  if (n > WATCHDOG_MAX_WORD) {
    for (let i = n; i < WATCHDOG_KEYS_IN_BUFFER; ++i) WATCHDOG_BUFFER[i - n] = WATCHDOG_BUFFER[i]!;
    WATCHDOG_KEYS_IN_BUFFER -= n;
    old_pos -= n;
  }
  while ((await keypressed()) && WATCHDOG_KEYS_IN_BUFFER < WATCHDOG_BUFFER_SIZE) WATCHDOG_BUFFER[WATCHDOG_KEYS_IN_BUFFER++] = readkey();
  for (let i = old_pos; i < WATCHDOG_KEYS_IN_BUFFER; ++i) {
    G.WATCHDOG_ASCII[WATCHDOG_BUFFER[i]! & 0xff] = 1;
    G.WATCHDOG_SCANCODE[(WATCHDOG_BUFFER[i]! >> 8) & 0x7f] = 1;
  }
}

export async function watchdog_reset(): Promise<void> {
  WATCHDOG_KEYS_IN_BUFFER = 0;
  await watchdog_update();
}

function watchdog_is_keyword(keyword: string): boolean {
  const pattern = WATCHDOG_KEYWORD + keyword;
  const l = pattern.length;
  const n = WATCHDOG_KEYS_IN_BUFFER - l + 1;
  let found = false;
  let i;
  for (i = 0; i < n && !found; ++i) {
    let j = 0;
    while (j < l && pattern.charCodeAt(j) === (WATCHDOG_BUFFER[i + j]! & 0xff)) j++;
    found = j === l;
  }
  if (found) WATCHDOG_BUFFER[i] = WATCHDOG_BUFFER[i]! | 0xff;
  return found;
}

// ---- profile.c ----

export const GLOBAL_PROFILE = 0, SPREAD_PROFILE = 1, MOVE_PROFILE = 2, DISP_PROFILE = 3, FLIP_PROFILE = 4;
const PROFILE_LIMIT = 20;
const P_START = new Int32Array(8), P_NUMBER = new Int32Array(8), P_TOTAL = new Int32Array(8);
let DISPLAY_NUMBER = 0;
let LOGIC_NUMBER = 0;

export function reset_all_profile(): void {
  for (let i = 0; i < 5; ++i) {
    DISPLAY_NUMBER = LOGIC_NUMBER = 0;
    P_NUMBER[i] = P_TOTAL[i] = 0;
  }
}

export function start_profile(i: number): void {
  P_START[i] = sys.ticker();
}

export function stop_profile(i: number): void {
  P_NUMBER[i]!++;
  P_TOTAL[i] = P_TOTAL[i]! + sys.ticker() - P_START[i]!;
  if (P_NUMBER[i]! >= PROFILE_LIMIT) {
    P_NUMBER[i] = Math.trunc(P_NUMBER[i]! / 2);
    P_TOTAL[i] = Math.trunc(P_TOTAL[i]! / 2);
  }
}

function get_profile(i: number): number {
  return P_NUMBER[i]! > 0 ? Math.trunc(P_TOTAL[i]! / P_NUMBER[i]!) : 0;
}

export function update_logic_rate(n: number): void {
  DISPLAY_NUMBER++;
  LOGIC_NUMBER += n;
  if (DISPLAY_NUMBER > PROFILE_LIMIT) {
    DISPLAY_NUMBER = Math.trunc(DISPLAY_NUMBER / 2);
    LOGIC_NUMBER = Math.trunc(LOGIC_NUMBER / 2);
  }
}

function get_logic_rate(): number {
  return Math.trunc((get_profile(GLOBAL_PROFILE) * DISPLAY_NUMBER) / LOGIC_NUMBER);
}

// ---- code.c ----

export const capture = { mode: 0 };

function display_special_info(): void {
  let global;
  if (G.WATCHDOG_SCANCODE[KEY_F5]) {
    global = get_profile(GLOBAL_PROFILE);
    if (global <= 0) global = 1;
    message_str_int(lw_lang_string(L.CODE_FPS), Math.trunc(1000 / global));
  }
  if (G.WATCHDOG_SCANCODE[KEY_F6]) {
    global = get_logic_rate();
    if (global <= 0) global = 1;
    message_str_int(lw_lang_string(L.CODE_RPS), Math.trunc(1000 / global));
  }
  if (G.WATCHDOG_SCANCODE[KEY_F7]) {
    global = get_profile(GLOBAL_PROFILE);
    const spread = get_profile(SPREAD_PROFILE), move = get_profile(MOVE_PROFILE);
    if (global <= 0) global = 1;
    message_str_int(lw_lang_string(L.CODE_PERCENTCALC), Math.trunc((100 * (spread + move)) / global));
  }
  if (G.WATCHDOG_SCANCODE[KEY_F8]) {
    global = get_profile(GLOBAL_PROFILE);
    const disp = get_profile(DISP_PROFILE), flip = get_profile(FLIP_PROFILE);
    if (global <= 0) global = 1;
    message_str_int(lw_lang_string(L.CODE_PERCENTDISPLAY), Math.trunc((100 * (disp + flip)) / global));
  }
  if (watchdog_is_keyword('speed')) {
    global = get_profile(GLOBAL_PROFILE);
    const spread = get_profile(SPREAD_PROFILE), move = get_profile(MOVE_PROFILE);
    const disp = get_profile(DISP_PROFILE), flip = get_profile(FLIP_PROFILE);
    message_str_int(lw_lang_string(L.CODE_SPREADGRADTIME), spread);
    message_str_int(lw_lang_string(L.CODE_MOVEARMYTIME), move);
    message_str_int(lw_lang_string(L.CODE_DISPLAYTIME), disp);
    message_str_int(lw_lang_string(L.CODE_FLIPTIME), flip);
    message_str_int(lw_lang_string(L.CODE_OTHERCALCTIME), global - spread - move - disp - flip);
    message_str_int(lw_lang_string(L.CODE_GLOBALTIME), global);
  }
}

function check_grad_to_disp(): void {
  const old = G.GRAD_TO_DISP;
  for (let i = 0; i <= 8; ++i) if (watchdog_is_keyword(`grad${i}`)) G.GRAD_TO_DISP = i;
  if (G.GRAD_TO_DISP > 0 && G.GRAD_TO_DISP <= 6 && G.GRAD_TO_DISP > G.PLAYING_TEAMS) G.GRAD_TO_DISP = 0;
  if (old !== G.GRAD_TO_DISP) {
    const ids = [L.CODE_STANDARDDISPLAY, L.CODE_GRADIENT1, L.CODE_GRADIENT2, L.CODE_GRADIENT3, L.CODE_GRADIENT4,
      L.CODE_GRADIENT5, L.CODE_GRADIENT6, L.CODE_MESHSIZE, L.CODE_MESHSTRUCTURE];
    message_str(lw_lang_string(ids[G.GRAD_TO_DISP]!));
  }
}

function check_boolean_codes(): void {
  if (G.WATCHDOG_SCANCODE[KEY_F3] && !G.LW_NETWORK_ON) {
    if (G.PAUSE_ON) {
      G.PAUSE_ON = 0;
      message_str(lw_lang_string(L.CODE_PAUSEOFF));
    } else {
      G.PAUSE_ON = 1;
      message_str(lw_lang_string(L.CODE_PAUSEON));
    }
  }
  if (G.WATCHDOG_SCANCODE[KEY_F4]) {
    if (G.CONFIG_WAVE_ON) {
      G.CONFIG_WAVE_ON = 0;
      message_str(lw_lang_string(L.CODE_WAVEEFFECTSOFF));
    } else {
      G.CONFIG_WAVE_ON = 1;
      message_str(lw_lang_string(L.CODE_WAVEEFFECTSON));
    }
  }
  if (G.WATCHDOG_SCANCODE[KEY_F9]) {
    if (capture.mode) {
      capture.mode = 0;
      message_str(lw_lang_string(L.CODE_CAPTUREOFF));
    } else {
      capture.mode = 1;
      message_str(lw_lang_string(L.CODE_CAPTUREON));
    }
  }
}

export function reset_code(): void {
  G.GRAD_TO_DISP = 0;
  G.PAUSE_ON = 0;
}

export function check_code(): void {
  display_special_info();
  check_grad_to_disp();
  check_boolean_codes();
}
