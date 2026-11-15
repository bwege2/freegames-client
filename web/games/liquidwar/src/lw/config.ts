// lw/config.ts: src/config.c: the settings, their defaults, reading and writing them in the config file
// (~/.liquidwarrc, Allegro's format; in the port the player's file "liquidwarrc" on the server), the
// range checks, and the rules of the current game. Also the speed tables (DISPLAY_DELAY_MIN,
// LOGIC_DELAY_MIN).

import { ConfigFile } from '../al/config.ts';
import {
  KEY_4_PAD, KEY_5_PAD, KEY_6_PAD, KEY_8_PAD, KEY_A, KEY_DOWN, KEY_I, KEY_J, KEY_K, KEY_L, KEY_LEFT, KEY_Q, KEY_RIGHT,
  KEY_UP, KEY_X, KEY_Z,
} from '../al/keyboard.ts';
import { LW_LANG_LANGUAGE_AUTO } from './lang.ts';
import {
  CHOOSE_COLOR_NUMBER, CONFIG_CONTROL_TYPE_CPU, CONFIG_CONTROL_TYPE_HUMAN, CONFIG_CONTROL_TYPE_OFF,
  CONFIG_CPU_VS_HUMAN_RANDOM, G, NAME_SIZE, type Rules,
} from './state.ts';

export const DISPLAY_DELAY_MIN = [0, 10, 15, 20, 25, 33, 40, 55, 100];
export const LOGIC_DELAY_MIN = [0, 1, 2, 5, 10, 15, 20, 33, 50];
const CHOOSE_COLOR_WHITE = 120;
const CHOOSE_COLOR_BLACK = 127;
const DUMMY_VALUE = 5003000;


/** the config file as the program has it (set_config_file) */
export let configFile = new ConfigFile();
export function setConfigText(text: string): void {
  configFile = new ConfigFile(text);
}

export function load_default_options(): void {
  G.CONFIG_GFX_GAME = 2;
  G.CONFIG_GFX_MENU = 2;
  G.CONFIG_FULLSCREEN = 0;
  G.CONFIG_VIEWPORT_SIZE = 6;
  G.CONFIG_WAVE_NUMBER = [2, 2, 2, 2];
  G.CONFIG_WAVE_AMPLI = [8, 8, 8, 8];
  G.CONFIG_WAVE_SPEED = [6, 7, 8, 9];
  G.CONFIG_BRIGHTNESS = 8;
  G.CONFIG_SFX_VOLUME = 12;
  G.CONFIG_CLICK_VOLUME = 8;
  G.CONFIG_WATER_VOLUME_MENU = 6;
  G.CONFIG_WATER_VOLUME_GAME = 10;
  G.CONFIG_MUSIC_VOLUME = 12;
  G.CONFIG_LEVEL_MAP = 0;
  G.CONFIG_LEVEL_FG = 135;
  G.CONFIG_LEVEL_BG = 131;
  const keys: [number, number, number, number, number, number, string][] = [
    [KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT, 0, CONFIG_CONTROL_TYPE_HUMAN, 'Napoleon'],
    [KEY_I, KEY_K, KEY_J, KEY_L, 4, CONFIG_CONTROL_TYPE_OFF, 'Clovis'],
    [KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT, 8, CONFIG_CONTROL_TYPE_OFF, 'Henri IV'],
    [KEY_Q, KEY_A, KEY_Z, KEY_X, 6, CONFIG_CONTROL_TYPE_OFF, 'Cesar'],
    [KEY_8_PAD, KEY_5_PAD, KEY_4_PAD, KEY_6_PAD, 10, CONFIG_CONTROL_TYPE_OFF, 'Geronimo'],
    [KEY_MOUSE.UP, KEY_MOUSE.DOWN, KEY_MOUSE.LEFT, KEY_MOUSE.RIGHT, 3, CONFIG_CONTROL_TYPE_CPU, 'Attila'],
  ];
  keys.forEach(([up, down, left, right, color, type, name], i) => {
    G.CONFIG_KEY_UP[i] = up;
    G.CONFIG_KEY_DOWN[i] = down;
    G.CONFIG_KEY_LEFT[i] = left;
    G.CONFIG_KEY_RIGHT[i] = right;
    G.CONFIG_TEAM_COLOR[i] = color;
    G.CONFIG_CONTROL_TYPE[i] = type;
    G.CONFIG_PLAYER_NAME[i] = name;
  });
  G.CONFIG_INFO_BAR = 1;
  G.CONFIG_MOUSE_GAP = 4;
  G.CONFIG_JOYSTICK_ON = 1;
  G.CONFIG_PAGE_FLIP = 0;
  G.CONFIG_LANGUAGE = LW_LANG_LANGUAGE_AUTO;
  G.CONFIG_WAVE_ON = 1;
  G.CONFIG_FRAMES_PER_SEC_LIMIT = 6;
  G.CONFIG_ROUNDS_PER_SEC_LIMIT = 4;
  G.CONFIG_SERVER_ADDRESS = '127.0.0.1';
  G.CONFIG_SERVER_PORT = 8035;
  G.CONFIG_PASSWORD = 'toto';
  G.CONFIG_USE_DEFAULT_TEXTURE = 1;
  G.CONFIG_LW6_ADVERTISING_SKIP = 1;
  G.CONFIG_LW6_ADVERTISING_DONE = 0;
  load_default_rules();
}

/** mouse.h: the mouse's pseudo keys (team.c lists them after the keyboard's) */
export const KEY_MOUSE = { UP: 124, RIGHT: 125, DOWN: 126, LEFT: 127 };

export function load_default_rules(): void {
  G.CONFIG_CURSOR_INCREASE_SPEED = 0;
  G.CONFIG_FIGHTER_ATTACK = 8;
  G.CONFIG_FIGHTER_DEFENSE = 8;
  G.CONFIG_FIGHTER_NEW_HEALTH = 8;
  G.CONFIG_NUMBER_INFLUENCE = 8;
  G.CONFIG_FIGHTER_NUMBER = 16;
  G.CONFIG_GAME_TIME = 8;
  G.CONFIG_CPU_ADVANTAGE = 0;
  G.CONFIG_CPU_VS_HUMAN = CONFIG_CPU_VS_HUMAN_RANDOM;
  G.CONFIG_ASM_ALGORITHM = 1;
  G.CONFIG_MIN_MAP_RES = 4;
  G.CONFIG_ALLOW_NETWORK_BOTS = 0;
}

const MAIN = 'MAIN';

function load_disk_options(): boolean {
  load_default_options();
  const c = configFile;
  if (c.getInt(MAIN, 'DUMMY', 0) !== DUMMY_VALUE) return false;
  const gi = (k: string, d: number): number => c.getInt(MAIN, k, d);
  G.CONFIG_GFX_GAME = gi('GFX_GAME', G.CONFIG_GFX_GAME);
  G.CONFIG_GFX_MENU = gi('GFX_MENU', G.CONFIG_GFX_MENU);
  G.CONFIG_FULLSCREEN = gi('FULLSCREEN', G.CONFIG_FULLSCREEN);
  G.CONFIG_VIEWPORT_SIZE = gi('VIEWPORT_SIZE', G.CONFIG_VIEWPORT_SIZE);
  for (let i = 0; i < 4; ++i) {
    const n = String(i);
    G.CONFIG_WAVE_NUMBER[i] = c.getInt('WAVE_NUMBER', n, G.CONFIG_WAVE_NUMBER[i]!);
    G.CONFIG_WAVE_AMPLI[i] = c.getInt('WAVE_AMPLI', n, G.CONFIG_WAVE_AMPLI[i]!);
    G.CONFIG_WAVE_SPEED[i] = c.getInt('WAVE_SPEED', n, G.CONFIG_WAVE_SPEED[i]!);
  }
  G.CONFIG_BRIGHTNESS = gi('BRIGHTNESS', G.CONFIG_BRIGHTNESS);
  G.CONFIG_CURSOR_INCREASE_SPEED = gi('CURSOR_INCREASE_SPEED', G.CONFIG_CURSOR_INCREASE_SPEED);
  G.CONFIG_FIGHTER_ATTACK = gi('FIGHTER_ATTACK', G.CONFIG_FIGHTER_ATTACK);
  G.CONFIG_FIGHTER_DEFENSE = gi('FIGHTER_DEFENSE', G.CONFIG_FIGHTER_DEFENSE);
  G.CONFIG_FIGHTER_NEW_HEALTH = gi('FIGHTER_NEW_HEALTH', G.CONFIG_FIGHTER_NEW_HEALTH);
  G.CONFIG_NUMBER_INFLUENCE = gi('NUMBER_INFLUENCE', G.CONFIG_NUMBER_INFLUENCE);
  G.CONFIG_SFX_VOLUME = gi('SFX_VOLUME', G.CONFIG_SFX_VOLUME);
  G.CONFIG_CLICK_VOLUME = gi('CLICK_VOLUME', G.CONFIG_CLICK_VOLUME);
  G.CONFIG_WATER_VOLUME_MENU = gi('WATER_VOLUME_MENU', G.CONFIG_WATER_VOLUME_MENU);
  G.CONFIG_WATER_VOLUME_GAME = gi('WATER_VOLUME_GAME', G.CONFIG_WATER_VOLUME_GAME);
  G.CONFIG_MUSIC_VOLUME = gi('MUSIC_VOLUME', G.CONFIG_MUSIC_VOLUME);
  G.CONFIG_LEVEL_MAP = gi('LEVEL_MAP', G.CONFIG_LEVEL_MAP);
  G.CONFIG_LEVEL_FG = gi('LEVEL_FG', G.CONFIG_LEVEL_FG);
  G.CONFIG_LEVEL_BG = gi('LEVEL_BG', G.CONFIG_LEVEL_BG);
  G.CONFIG_FIGHTER_NUMBER = gi('FIGHTER_NUMBER', G.CONFIG_FIGHTER_NUMBER);
  for (let i = 0; i < 6; ++i) {
    const n = String(i);
    G.CONFIG_KEY_UP[i] = c.getInt('KEY_UP', n, G.CONFIG_KEY_UP[i]!);
    G.CONFIG_KEY_LEFT[i] = c.getInt('KEY_LEFT', n, G.CONFIG_KEY_LEFT[i]!);
    G.CONFIG_KEY_DOWN[i] = c.getInt('KEY_DOWN', n, G.CONFIG_KEY_DOWN[i]!);
    G.CONFIG_KEY_RIGHT[i] = c.getInt('KEY_RIGHT', n, G.CONFIG_KEY_RIGHT[i]!);
    G.CONFIG_TEAM_COLOR[i] = c.getInt('TEAM_COLOR', n, G.CONFIG_TEAM_COLOR[i]!);
    G.CONFIG_CONTROL_TYPE[i] = c.getInt('CONTROL_TYPE', n, G.CONFIG_CONTROL_TYPE[i]!);
    G.CONFIG_PLAYER_NAME[i] = c.getString('PLAYER_NAME', n, G.CONFIG_PLAYER_NAME[i]!).slice(0, NAME_SIZE);
  }
  G.CONFIG_GAME_TIME = gi('GAME_TIME', G.CONFIG_GAME_TIME);
  G.CONFIG_INFO_BAR = gi('INFO_BAR', G.CONFIG_INFO_BAR);
  G.CONFIG_MOUSE_GAP = gi('MOUSE_GAP', G.CONFIG_MOUSE_GAP);
  G.CONFIG_JOYSTICK_ON = gi('JOYSTICK_ON', G.CONFIG_JOYSTICK_ON);
  G.CONFIG_CPU_ADVANTAGE = gi('CPU_ADVANTAGE', G.CONFIG_CPU_ADVANTAGE);
  G.CONFIG_CPU_VS_HUMAN = gi('CPU_VS_HUMAN', G.CONFIG_CPU_VS_HUMAN);
  G.CONFIG_PAGE_FLIP = gi('PAGE_FLIP', G.CONFIG_PAGE_FLIP);
  G.CONFIG_LANGUAGE = gi('LANGUAGE', G.CONFIG_LANGUAGE);
  G.CONFIG_WAVE_ON = gi('WAVE_ON', G.CONFIG_WAVE_ON);
  G.CONFIG_FRAMES_PER_SEC_LIMIT = gi('FRAMES_PER_SEC_LIMIT', G.CONFIG_FRAMES_PER_SEC_LIMIT);
  G.CONFIG_ROUNDS_PER_SEC_LIMIT = gi('ROUNDS_PER_SEC_LIMIT', G.CONFIG_ROUNDS_PER_SEC_LIMIT);
  G.CONFIG_SERVER_ADDRESS = c.getString(MAIN, 'SERVER_ADDRESS', G.CONFIG_SERVER_ADDRESS).slice(0, 50);
  G.CONFIG_SERVER_PORT = gi('SERVER_PORT', G.CONFIG_SERVER_PORT);
  G.CONFIG_ASM_ALGORITHM = gi('ASM_ALGORITHM', G.CONFIG_ASM_ALGORITHM);
  G.CONFIG_PASSWORD = c.getString(MAIN, 'PASSWORD', G.CONFIG_PASSWORD).slice(0, 20);
  G.CONFIG_MIN_MAP_RES = gi('MIN_MAP_RES', G.CONFIG_MIN_MAP_RES);
  G.CONFIG_USE_DEFAULT_TEXTURE = gi('USE_DEFAULT_TEXTURE', G.CONFIG_USE_DEFAULT_TEXTURE);
  G.CONFIG_ALLOW_NETWORK_BOTS = gi('ALLOW_NETWORK_BOTS', G.CONFIG_ALLOW_NETWORK_BOTS);
  G.CONFIG_LW6_ADVERTISING_SKIP = gi('LW6_ADVERTISING_SKIP', G.CONFIG_LW6_ADVERTISING_SKIP);
  G.CONFIG_LW6_ADVERTISING_DONE = gi('LW6_ADVERTISING_DONE', G.CONFIG_LW6_ADVERTISING_DONE);
  return true;
}

export function load_config_options(): boolean {
  const result = load_disk_options();
  lw_config_set_current_rules_to_default();
  return result;
}

export function save_config_options(): void {
  const c = configFile;
  const si = (k: string, v: number): void => c.setInt(MAIN, k, v);
  si('DUMMY', DUMMY_VALUE);
  si('GFX_GAME', G.CONFIG_GFX_GAME);
  si('GFX_MENU', G.CONFIG_GFX_MENU);
  si('FULLSCREEN', G.CONFIG_FULLSCREEN);
  si('VIEWPORT_SIZE', G.CONFIG_VIEWPORT_SIZE);
  for (let i = 0; i < 4; ++i) {
    const n = String(i);
    c.setInt('WAVE_NUMBER', n, G.CONFIG_WAVE_NUMBER[i]!);
    c.setInt('WAVE_AMPLI', n, G.CONFIG_WAVE_AMPLI[i]!);
    c.setInt('WAVE_SPEED', n, G.CONFIG_WAVE_SPEED[i]!);
  }
  si('BRIGHTNESS', G.CONFIG_BRIGHTNESS);
  si('CURSOR_INCREASE_SPEED', G.CONFIG_CURSOR_INCREASE_SPEED);
  si('FIGHTER_ATTACK', G.CONFIG_FIGHTER_ATTACK);
  si('FIGHTER_DEFENSE', G.CONFIG_FIGHTER_DEFENSE);
  si('FIGHTER_NEW_HEALTH', G.CONFIG_FIGHTER_NEW_HEALTH);
  si('NUMBER_INFLUENCE', G.CONFIG_NUMBER_INFLUENCE);
  si('SFX_VOLUME', G.CONFIG_SFX_VOLUME);
  si('CLICK_VOLUME', G.CONFIG_CLICK_VOLUME);
  si('WATER_VOLUME_MENU', G.CONFIG_WATER_VOLUME_MENU);
  si('WATER_VOLUME_GAME', G.CONFIG_WATER_VOLUME_GAME);
  si('MUSIC_VOLUME', G.CONFIG_MUSIC_VOLUME);
  si('LEVEL_MAP', G.CONFIG_LEVEL_MAP);
  si('LEVEL_FG', G.CONFIG_LEVEL_FG);
  si('LEVEL_BG', G.CONFIG_LEVEL_BG);
  si('FIGHTER_NUMBER', G.CONFIG_FIGHTER_NUMBER);
  for (let i = 0; i < 6; ++i) {
    const n = String(i);
    c.setInt('KEY_UP', n, G.CONFIG_KEY_UP[i]!);
    c.setInt('KEY_LEFT', n, G.CONFIG_KEY_LEFT[i]!);
    c.setInt('KEY_DOWN', n, G.CONFIG_KEY_DOWN[i]!);
    c.setInt('KEY_RIGHT', n, G.CONFIG_KEY_RIGHT[i]!);
    c.setInt('TEAM_COLOR', n, G.CONFIG_TEAM_COLOR[i]!);
    c.setInt('CONTROL_TYPE', n, G.CONFIG_CONTROL_TYPE[i]!);
    c.setString('PLAYER_NAME', n, G.CONFIG_PLAYER_NAME[i]!);
  }
  si('GAME_TIME', G.CONFIG_GAME_TIME);
  si('INFO_BAR', G.CONFIG_INFO_BAR);
  si('MOUSE_GAP', G.CONFIG_MOUSE_GAP);
  si('JOYSTICK_ON', G.CONFIG_JOYSTICK_ON);
  si('CPU_ADVANTAGE', G.CONFIG_CPU_ADVANTAGE);
  si('CPU_VS_HUMAN', G.CONFIG_CPU_VS_HUMAN);
  si('PAGE_FLIP', G.CONFIG_PAGE_FLIP);
  si('LANGUAGE', G.CONFIG_LANGUAGE);
  si('WAVE_ON', G.CONFIG_WAVE_ON);
  si('FRAMES_PER_SEC_LIMIT', G.CONFIG_FRAMES_PER_SEC_LIMIT);
  si('ROUNDS_PER_SEC_LIMIT', G.CONFIG_ROUNDS_PER_SEC_LIMIT);
  c.setString(MAIN, 'SERVER_ADDRESS', G.CONFIG_SERVER_ADDRESS);
  si('SERVER_PORT', G.CONFIG_SERVER_PORT);
  si('ASM_ALGORITHM', G.CONFIG_ASM_ALGORITHM);
  c.setString(MAIN, 'PASSWORD', G.CONFIG_PASSWORD);
  si('MIN_MAP_RES', G.CONFIG_MIN_MAP_RES);
  si('USE_DEFAULT_TEXTURE', G.CONFIG_USE_DEFAULT_TEXTURE);
  si('ALLOW_NETWORK_BOTS', G.CONFIG_ALLOW_NETWORK_BOTS);
  si('LW6_ADVERTISING_SKIP', G.CONFIG_LW6_ADVERTISING_SKIP);
  si('LW6_ADVERTISING_DONE', G.CONFIG_LW6_ADVERTISING_DONE);
}

export function lw_netconf_check(c: Rules): number {
  let result = 1;
  const check = (k: keyof Rules, max: number): void => {
    if (c[k] < 0) {
      result = 0;
      c[k] = 0;
    }
    if (c[k] > max) {
      result = 0;
      c[k] = max;
    }
  };
  check('cursor_increase_speed', 2);
  check('fighter_attack', 16);
  check('fighter_defense', 16);
  check('fighter_new_health', 16);
  check('number_influence', 16);
  check('fighter_number', 32);
  check('game_time', 16);
  check('cpu_advantage', 4);
  check('cpu_vs_human', 2);
  check('asm_algorithm', 1);
  check('min_map_res', 8);
  return result;
}

export function check_config_range(): void {
  if (G.CONFIG_LEVEL_MAP > G.RAW_MAP_NUMBER - 1) G.CONFIG_LEVEL_MAP = Math.trunc((G.RAW_MAP_NUMBER - 1) / 2);
  if (G.CONFIG_LEVEL_FG > G.RAW_TEXTURE_NUMBER + CHOOSE_COLOR_NUMBER - 1) G.CONFIG_LEVEL_FG = CHOOSE_COLOR_WHITE;
  if (G.CONFIG_LEVEL_BG > G.RAW_TEXTURE_NUMBER + CHOOSE_COLOR_NUMBER - 1) G.CONFIG_LEVEL_BG = CHOOSE_COLOR_BLACK;
  lw_netconf_check(G.LW_CONFIG_CURRENT_RULES);
}

/** STARTUP_ASM: the x86_64 build has no assembly; the flag itself stays 1 as in the original */
const STARTUP_ASM = 1;

export function lw_config_set_current_rules_to_default(): void {
  const r = G.LW_CONFIG_CURRENT_RULES;
  r.cursor_increase_speed = G.CONFIG_CURSOR_INCREASE_SPEED;
  r.fighter_attack = G.CONFIG_FIGHTER_ATTACK;
  r.fighter_defense = G.CONFIG_FIGHTER_DEFENSE;
  r.fighter_new_health = G.CONFIG_FIGHTER_NEW_HEALTH;
  r.number_influence = G.CONFIG_NUMBER_INFLUENCE;
  r.fighter_number = G.CONFIG_FIGHTER_NUMBER;
  r.game_time = G.CONFIG_GAME_TIME;
  r.cpu_advantage = G.CONFIG_CPU_ADVANTAGE;
  r.cpu_vs_human = G.CONFIG_CPU_VS_HUMAN;
  r.asm_algorithm = G.CONFIG_ASM_ALGORITHM && STARTUP_ASM ? 1 : 0;
  r.min_map_res = G.CONFIG_MIN_MAP_RES;
}
