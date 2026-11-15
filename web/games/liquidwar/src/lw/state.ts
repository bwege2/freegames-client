// lw/state.ts: Liquid War's global variables (the C program's globals, spread over config.c, mesh.c,
// area.c, army.c, cursor.c, decal.c, lwtime.c, disk.c, palette.c, ...) and constants (base.h, the
// headers). One object, G, so that every module reads and writes the same values as the C code does.

import type { Bitmap } from '../al/bitmap.ts';
import type { Font, Midi, Sample } from '../al/datafile.ts';
import { newPalette } from '../al/palette.ts';

export const NB_TEAMS = 6;
export const NB_DIRS = 12;
export const DIR_NNE = 0, DIR_NE = 1, DIR_ENE = 2, DIR_ESE = 3, DIR_SE = 4, DIR_SSE = 5, DIR_SSW = 6,
  DIR_SW = 7, DIR_WSW = 8, DIR_WNW = 9, DIR_NW = 10, DIR_NNW = 11;
export const NAME_SIZE = 10;
export const PASSWORD_SIZE = 20;
export const LW_VERSION = '5.6.6';

export const CONFIG_CONTROL_TYPE_OFF = 0, CONFIG_CONTROL_TYPE_HUMAN = 1, CONFIG_CONTROL_TYPE_CPU = 2;
export const CONFIG_CPU_VS_HUMAN_ALWAYS = 0, CONFIG_CPU_VS_HUMAN_RANDOM = 1, CONFIG_CPU_VS_HUMAN_NEVER = 2;

export const AREA_START_GRADIENT = 2000000;
export const MAX_FIGHTER_HEALTH = 16384;
export const COMPUTER_PATH_MAX = 1024;
export const CURSOR_KEY_UP = 1, CURSOR_KEY_RIGHT = 2, CURSOR_KEY_DOWN = 4, CURSOR_KEY_LEFT = 8;

export const LW_MAP_SYSTEM_NAME_SIZE = 16;
export const LW_MAP_READABLE_NAME_SIZE = 32;
export const LW_TEXTURE_SYSTEM_NAME_SIZE = 16;
export const CHOOSE_COLOR_NUMBER = 128;
export const TEAM_FIRST_COLOR = 128;
export const FG_TEXTURE_FIRST_COLOR = 64;
export const BG_TEXTURE_FIRST_COLOR = 96;
export const TEXTURE_COLOR_NUMBER = 32;
export const MENU_BG = 16;
export const MENU_FG = 17;

export const MENU_TOP = -1, MENU_EXIT = -2, MENU_PLAY = -3, MENU_OK = -4;
export const MENU_QUICK_QUIT = 0, MENU_QUICK_PLAY = 1, MENU_QUICK_MAIN = 2, MENU_QUICK_BACK = 3;
export const MENU_VIRTUAL_W = 320, MENU_VIRTUAL_H = 240;
export const MENU_H_STANDARD = 15, MENU_H_QUICK = 15, MENU_H_SPACE = 3, MENU_H_LEVEL = 15, MENU_H_SAMPLE = 120,
  MENU_H_TEAM = 90, MENU_H_INTERNET_LIST = 175;
export const MENU_W_STANDARD = 100, MENU_W_QUICK = 60, MENU_W_SPACE = 3, MENU_W_LEVEL = 40, MENU_W_SAMPLE = 160,
  MENU_W_TEAM = 75, MENU_W_INTERNET_LIST = 150;

/** the mesh (mesh.h MESH), structure of arrays */
export interface Mesh {
  size: number;
  x: Int16Array;
  y: Int16Array;
  side: Int32Array;
  /** link[i * NB_DIRS + dir]: index of the neighbour, -1 for NULL */
  link: Int32Array;
  /** info[i * NB_TEAMS + team].state.grad (a 24-bit bitfield) */
  grad: Int32Array;
  /** state.dir (an 8-bit bitfield) */
  dir: Int8Array;
  /** update (a union: time, or cursor.x in the low and cursor.y in the high 16 bits) */
  update: Int32Array;
}

/** the fighters (area.h FIGHTER) */
export interface Army {
  size: number;
  x: Int16Array;
  y: Int16Array;
  health: Int16Array;
  team: Int8Array;
  last_dir: Int8Array;
}

/** a cursor (cursor.h CURSOR) */
export interface Cursor {
  val: number;
  x: number;
  y: number;
  active: number;
  team: number;
  loose_time: number;
  score_order: number;
  color_entry: number;
  key_state: number;
  control_type: number;
  from_network: number;
  name: string;
}

export function newCursor(): Cursor {
  return {
    val: 0, x: 0, y: 0, active: 0, team: 0, loose_time: 0, score_order: 0, color_entry: 0, key_state: 0,
    control_type: 0, from_network: 0, name: '',
  };
}

/** network.h LW_NETWORK_INFO: a team in a network game */
export interface NetworkInfo {
  active: number;
  network: number;
  control_type: number;
  part: number;
  server_id: number;
  color: number;
  name: string;
}

export interface Rules {
  cursor_increase_speed: number;
  fighter_attack: number;
  fighter_defense: number;
  fighter_new_health: number;
  number_influence: number;
  fighter_number: number;
  game_time: number;
  cpu_advantage: number;
  cpu_vs_human: number;
  asm_algorithm: number;
  min_map_res: number;
  allow_network_bots: number;
}

function arr<T>(n: number, f: () => T): T[] {
  const a: T[] = [];
  for (let i = 0; i < n; i++) a.push(f());
  return a;
}

export const G = {
  // config.c
  CONFIG_GFX_GAME: 2,
  CONFIG_GFX_MENU: 2,
  CONFIG_FULLSCREEN: 0,
  CONFIG_VIEWPORT_SIZE: 6,
  CONFIG_WAVE_NUMBER: [2, 2, 2, 2],
  CONFIG_WAVE_AMPLI: [8, 8, 8, 8],
  CONFIG_WAVE_SPEED: [6, 7, 8, 9],
  CONFIG_BRIGHTNESS: 8,
  CONFIG_CURSOR_INCREASE_SPEED: 0,
  CONFIG_FIGHTER_ATTACK: 8,
  CONFIG_FIGHTER_DEFENSE: 8,
  CONFIG_FIGHTER_NEW_HEALTH: 8,
  CONFIG_NUMBER_INFLUENCE: 8,
  CONFIG_SFX_VOLUME: 12,
  CONFIG_CLICK_VOLUME: 8,
  CONFIG_WATER_VOLUME_MENU: 6,
  CONFIG_WATER_VOLUME_GAME: 10,
  CONFIG_MUSIC_VOLUME: 12,
  CONFIG_LEVEL_MAP: 0,
  CONFIG_LEVEL_FG: 135,
  CONFIG_LEVEL_BG: 131,
  CONFIG_FIGHTER_NUMBER: 16,
  CONFIG_KEY_UP: [0, 0, 0, 0, 0, 0],
  CONFIG_KEY_LEFT: [0, 0, 0, 0, 0, 0],
  CONFIG_KEY_DOWN: [0, 0, 0, 0, 0, 0],
  CONFIG_KEY_RIGHT: [0, 0, 0, 0, 0, 0],
  CONFIG_TEAM_COLOR: [0, 0, 0, 0, 0, 0],
  CONFIG_CONTROL_TYPE: [0, 0, 0, 0, 0, 0],
  CONFIG_PLAYER_NAME: ['', '', '', '', '', ''],
  CONFIG_GAME_TIME: 8,
  CONFIG_INFO_BAR: 1,
  CONFIG_MOUSE_GAP: 4,
  CONFIG_JOYSTICK_ON: 1,
  CONFIG_CPU_ADVANTAGE: 0,
  CONFIG_CPU_VS_HUMAN: 1,
  CONFIG_PAGE_FLIP: 0,
  CONFIG_LANGUAGE: 0,
  CONFIG_WAVE_ON: 1,
  CONFIG_FRAMES_PER_SEC_LIMIT: 6,
  CONFIG_ROUNDS_PER_SEC_LIMIT: 4,
  CONFIG_SERVER_ADDRESS: '',
  CONFIG_SERVER_PORT: 8035,
  CONFIG_ASM_ALGORITHM: 1,
  CONFIG_PASSWORD: '',
  CONFIG_MIN_MAP_RES: 4,
  CONFIG_USE_DEFAULT_TEXTURE: 1,
  CONFIG_ALLOW_NETWORK_BOTS: 0,
  CONFIG_LW6_ADVERTISING_SKIP: 1,
  CONFIG_LW6_ADVERTISING_DONE: 0,
  LW_CONFIG_CURRENT_RULES: {
    cursor_increase_speed: 0, fighter_attack: 8, fighter_defense: 8, fighter_new_health: 8, number_influence: 8,
    fighter_number: 16, game_time: 8, cpu_advantage: 0, cpu_vs_human: 1, asm_algorithm: 1, min_map_res: 4,
    allow_network_bots: 0,
  } as Rules,

  // startup.c
  STARTUP_BACK_STATE: 1,
  STARTUP_TEXTURE_STATE: 1,
  STARTUP_WATER_STATE: 1,
  STARTUP_SFX_STATE: 1,
  STARTUP_MUSIC_STATE: 1,
  STARTUP_CUSTOM_STATE: 1,
  STARTUP_JOYSTICK_ON: 0,
  STARTUP_CHECK: 0,
  STARTUP_TOMBOLA: 0,

  // disk.c
  SAMPLE_WATER_NUMBER: 0,
  RAW_TEXTURE_NUMBER: 0,
  RAW_MAPTEX_NUMBER: 0,
  RAW_MAP_NUMBER: 0,
  MIDI_MUSIC_NUMBER: 0,
  LOADED_BACK: 0,
  LOADED_TEXTURE: 0,
  LOADED_MAPTEX: 0,
  LOADED_SFX: 0,
  LOADED_WATER: 0,
  LOADED_MUSIC: 0,
  SAMPLE_SFX_TIME: null as Sample | null,
  SAMPLE_SFX_WIN: null as Sample | null,
  SAMPLE_SFX_GO: null as Sample | null,
  SAMPLE_SFX_CLICK: null as Sample | null,
  SAMPLE_SFX_LOOSE: null as Sample | null,
  SAMPLE_SFX_CONNECT: null as Sample | null,
  SAMPLE_WATER: [] as Sample[],
  RAW_MAP: [] as Uint8Array[],
  RAW_MAP_ORDERED: [] as Uint8Array[],
  RAW_TEXTURE: [] as Uint8Array[],
  RAW_MAPTEX: [] as Uint8Array[],
  MIDI_MUSIC: [] as Midi[],
  BACK_IMAGE: null as Bitmap | null,
  BIG_FONT: null as Font | null,
  SMALL_FONT: null as Font | null,
  BIG_MOUSE_CURSOR: null as Bitmap | null,
  SMALL_MOUSE_CURSOR: null as Bitmap | null,
  INVISIBLE_MOUSE_CURSOR: null as Bitmap | null,

  // palette.c
  COLORS_PER_TEAM: 0,
  GLOBAL_PALETTE: newPalette(),

  // decal.c
  PLAYING_TEAMS: 0,
  ACTIVE_FIGHTERS: [0, 0, 0, 0, 0, 0],
  COLOR_FIRST_ENTRY: [0, 0, 0, 0, 0, 0],

  // mesh.c, area.c, army.c
  CURRENT_MESH: null as Mesh | null,
  CURRENT_MESH_SIZE: 0,
  CURRENT_AREA_W: 0,
  CURRENT_AREA_H: 0,
  CURRENT_AREA_DISP: null as Bitmap | null,
  CURRENT_AREA_BACK: null as Bitmap | null,
  /** PLACE: mesh index per pixel (-1: NULL) and fighter index (-1: NULL) */
  AREA_MESH: new Int32Array(0),
  AREA_FIGHTER: new Int32Array(0),
  CURRENT_ARMY: null as Army | null,
  CURRENT_ARMY_SIZE: 0,

  // cursor.c
  CURRENT_CURSOR: arr(NB_TEAMS, newCursor),

  // lwtime.c
  TIME_ELAPSED: 0,
  TIME_LEFT: 0,
  GLOBAL_TICKER: 0,
  GLOBAL_CLOCK: 0,

  // code.c
  GRAD_TO_DISP: 0,
  PAUSE_ON: 0,
  CHANGED_INFO_BAR: 0,

  // watchdog.c
  WATCHDOG_ASCII: new Uint8Array(256),
  WATCHDOG_SCANCODE: new Uint8Array(128),

  // network.c
  LW_NETWORK_ON: 0,
  LW_NETWORK_ERROR_DETECTED: 0,
  LW_NETWORK_INFO: arr(NB_TEAMS, (): NetworkInfo => ({
    active: 0, network: 0, control_type: 0, part: 0, server_id: 0, color: 0, name: '',
  })),
  LW_NETWORK_RAW_MAP: null as Uint8Array | null,

  // random.c
  LW_RANDOM_RAW_MAP: null as Uint8Array | null,
  LW_RANDOM_ON: 0,

  // game.c
  LW_GAME_RUNNING: 0,

  // sound.c, music.c
  WATER_VOLUME: 0,
};
