// The original's global variables that more than one file assigns (ES modules cannot assign an
// imported binding). Each is named as in the C++ source.
import type { image } from './imlib/image.ts';
import type { palette } from './imlib/palette.ts';
import type { WindowManager } from './imlib/jwindow.ts';
import type { ColorFilter } from './imlib/filter.ts';
import type { JCFont } from './imlib/fonts.ts';
import type { level } from './level.ts';
import type { Game } from './game.ts';
import type { song } from './sdlport/sound.ts';

// id.h
export const EDIT_MODE = 1, DRAW_FG_LAYER = 2, DRAW_BG_LAYER = 4, DRAW_PEOPLE_LAYER = 8, DRAW_HELP_LAYER = 16,
  PERFORMANCE_TEST_MODE = 32, DRAW_LIGHTS = 64, DRAW_FG_BOUND_LAYER = 128, SUSPEND_MODE = 256, MAP_MODE = 512,
  DRAW_LINKS = 1024;

export const G = {
  // sdlport/video.cpp
  xres: 320,
  yres: 200,
  screen: null as unknown as image,
  // loader2.cpp
  pal: null as unknown as palette,
  color_table: null as unknown as ColorFilter,
  foretiles: [] as number[],
  backtiles: [] as number[],
  nforetiles: 0,
  nbacktiles: 0,
  f_wid: 0,
  f_hi: 0,
  b_wid: 0,
  b_hi: 0,
  bg_xmul: 1,
  bg_xdiv: 8,
  bg_ymul: 1,
  bg_ydiv: 8,
  current_song: null as song | null,
  big_font: null as unknown as JCFont,
  console_font: null as unknown as JCFont,
  big_font_pict: -1,
  small_font_pict: -1,
  console_font_pict: -1,
  title_screen: -1,
  cdc_logo: -1,
  start_running: 0,
  // game.cpp
  wm: null as unknown as WindowManager,
  the_game: null as unknown as Game,
  current_level: null as unknown as level,
  dev: 0,
  frame_panic: 0,
  massive_frame_panic: 0,
  demo_start: 0,
  idle_ticks: 0,
  req_end: 0,
  req_name: '',
  // dev.cpp
  level_file: 'levels/level00.spe',
  start_edit: 0,
  start_doubled: 0,
  fg_reversed: 0,
  view_shift_disabled: 0,
  fps_on: 0,
  show_names: 0,
  raise_all: 0,
  mouse_scrolling: 0,
  palettes_locked: 1,
  // game.cpp: start_argv
  start_argv: ['abuse'] as string[],
};
