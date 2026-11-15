// main.c: start-up, the main loop (events, keys, a day of the city when its time has come), the
// results (Stats) and quitting.
import * as C from './consts.ts';
import { G, PATHS, display } from './g.ts';
import { srand, f32, ExitProgram, idiv } from './c.ts';
import { platform } from './platform.ts';
import { fopen } from './stdio.ts';
import { initialize_pixmap, init_pixmaps } from './pixmap.ts';
import { setcustompalette, call_event, HandleError, WINWIDTH, WINHEIGHT, Fgl_setfont, Fgl_setfontcolors } from './lcx11.ts';
import { initialize_geometry, adjust_main_origin } from './geometry.ts';
import { init_fonts, initialize_monthgraph, init_mini_map_mouse, draw_background, prog_box, screen_setup,
  screen_full_refresh, update_main_screen, print_stats, draw_market_cb, draw_port_cb, yn_dial_box, ok_dial_box,
  print_time_for_year, refresh_main_screen, rotate_main_screen, main_font } from './screen.ts';
import { load_start_image } from './splash.ts';
import { init_mouse_registry, cs_mouse_handler } from './mouse.ts';
import { mps_init } from './mps.ts';
import { init_types } from './lintypes.ts';
import { init_modules, update_avail_modules } from './module_buttons.ts';
import { init_mappoint_array, do_random_fire, adjust_money } from './engine.ts';
import { initialize_tax_rates, do_time_step, count_all_groups } from './simulate.ts';
import { init_timer_buttons, reset_start_time, get_real_time, lc_usleep, select_medium, select_pause } from './timer.ts';
import { activate_help, draw_help_page } from './lchelp.ts';
import { do_prefs_screen, close_prefs_screen, do_load_city, do_save_city } from './ldsvgui.ts';
import { init_path_strings, verify_package, check_savedir, load_lincityrc } from './fileutil.ts';
import { current_month, current_year } from './lclib.ts';


export function do_error(s: string): void {
  HandleError(s, C.FATAL);
}

/** lincity_main: returns when the player quits (the original exits) */
export function lincity_main(): void {
  G.main_screen_originx = 1;
  G.main_screen_originy = 1;
  PATHS.given_scene = '';
  // quit_flag = network_flag = ... = shanty_bul_flag; (all 0, as globals)
  G.prefs_drawn_flag = 0;
  G.kmouse_val = 8;
  // parse_xargs(): no arguments; the window is WINWIDTH x WINHEIGHT unless the page asks for more
  G.borderx = 0;
  G.bordery = 0;
  display.winW = WINWIDTH + G.borderx * 2 + G.pix_double * WINWIDTH;
  display.winH = WINHEIGHT + G.bordery * 2 + G.pix_double * WINHEIGHT;
  init_path_strings();
  verify_package();
  check_savedir();
  load_lincityrc();
  srand(platform().time());
  // Create_Window(): the window is mapped (MapNotify)
  platform().mapWindow();
  initialize_pixmap();
  init_fonts();
  if (!G.skip_splash_screen) load_start_image();
  // Fgl_setfont (8, 8, main_font) and the text colours, done in init_fonts too
  init_fonts_colours();
  initialize_geometry();
  initialize_monthgraph();
  init_mouse_registry();
  init_mini_map_mouse();
  mps_init();
  G.x_key_value = 0;
  setcustompalette();
  draw_background();
  prog_box('Loading the game', 1);
  init_types();
  init_modules();
  init_mappoint_array();
  initialize_tax_rates();
  prog_box('', 95);
  G.mouse_hide_count = 0;
  G.suppress_ok_buttons = 0;
  prog_box('', 100);
  prog_box('Creating pixmaps', 1);
  init_pixmaps();
  prog_box('', 100);
  init_timer_buttons();
  G.mouse_initialized = 1;
  screen_setup();
  client_main_loop();
}

function init_fonts_colours(): void {
  Fgl_setfont(8, 8, main_font);
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}

function client_main_loop(): void {
  let quit = 0;
  reset_start_time();
  update_avail_modules(0);
  screen_full_refresh();
  if (G.no_init_help === 0) {
    G.block_help_exit = 1;
    G.help_flag = 1;
    activate_help('opening.hlp');
  }
  select_medium();
  do {
    get_real_time();
    call_event();
    const key = G.x_key_value;
    G.x_key_value = 0;
    if (key !== 0) process_keystrokes(key);
    quit = execute_timestep();
  } while (quit === 0);
}

export function process_keystrokes(key: number): void {
  switch (key) {
    case 0: return;
    case 32:
    case 10:
    case 13:
    case 127:
      if (key === 127) {
        cs_mouse_handler(C.LC_MOUSE_RIGHTBUTTON | C.LC_MOUSE_PRESS, 0, 0);
        cs_mouse_handler(C.LC_MOUSE_RIGHTBUTTON | C.LC_MOUSE_RELEASE, 0, 0);
      } else {
        cs_mouse_handler(C.LC_MOUSE_LEFTBUTTON | C.LC_MOUSE_PRESS, 0, 0);
        cs_mouse_handler(C.LC_MOUSE_LEFTBUTTON | C.LC_MOUSE_RELEASE, 0, 0);
      }
      if (G.help_flag) draw_help_page('return-2');
      if (G.prefs_flag) {
        close_prefs_screen();
        refresh_main_screen();
      }
      break;
    case 1:
      adjust_main_origin(G.main_screen_originx - (G.x_key_shifted ? C.RIGHT_MOUSE_MOVE_VAL : 1), G.main_screen_originy, C.TRUE);
      break;
    case 2:
      adjust_main_origin(G.main_screen_originx, G.main_screen_originy + (G.x_key_shifted ? C.RIGHT_MOUSE_MOVE_VAL : 1), C.TRUE);
      break;
    case 3:
      adjust_main_origin(G.main_screen_originx, G.main_screen_originy - (G.x_key_shifted ? C.RIGHT_MOUSE_MOVE_VAL : 1), C.TRUE);
      break;
    case 4:
      adjust_main_origin(G.main_screen_originx + (G.x_key_shifted ? C.RIGHT_MOUSE_MOVE_VAL : 1), G.main_screen_originy, C.TRUE);
      break;
    case 80: case 112: // P p
      select_pause();
      break;
    case 101: // e
      if (cheat() !== 0) G.people_pool += 100;
      break;
    case 100: // d
      if (cheat() !== 0) { /* dump_screen(): nothing on X11 */ }
      break;
    case 68: // D
      break;
    case 116: // t
      if (cheat() !== 0) G.tech_level += 1000;
      break;
    case 84: // T
      if (cheat() !== 0) G.tech_level += 10000;
      break;
    case 109: // m
      if (cheat() !== 0) adjust_money(1000000);
      break;
    case 102: // f
      do_random_fire(-1, -1, 1);
      break;
    case 76: case 108: // L l
      G.load_flag = 1;
      break;
    case 72: case 104: // H h
      activate_help('index.hlp');
      break;
    case 27: // Escape
      if (G.help_flag) draw_help_page('return-2');
      else if (G.prefs_flag) {
        close_prefs_screen();
        refresh_main_screen();
      } else activate_help('menu.hlp');
      break;
    case 83: case 115: // S s
      G.save_flag = 1;
      break;
    case 118: case 86: // v V
      rotate_main_screen();
      break;
    case 111: case 79: // o O
      G.prefs_flag = 1;
      break;
    case 114: // r
      window_results();
      break;
    case 113: case 81: // q Q
      G.quit_flag = 1;
      break;
  }
}

/** static int next_time_step: real_time (a long) is stored in an int */
let next_time_step = 0;
function execute_timestep(): number {
  let real_quit_flag = 0;
  if (G.market_cb_flag === 0 && G.help_flag === 0 && G.port_cb_flag === 0 && G.prefs_flag === 0) {
    if ((G.real_time < next_time_step || G.pause_flag || G.mt_flag) && G.save_flag === 0 && G.load_flag === 0) {
      if (G.let_one_through === 0 || G.mt_flag) {
        lc_usleep(1);
        return 0;
      }
      G.let_one_through = 0;
    }
    if (G.slow_flag) next_time_step = (G.real_time + idiv(C.SLOW_TIME_FOR_YEAR * 1000, C.NUMOF_DAYS_IN_YEAR)) | 0;
    else if (G.fast_flag) next_time_step = (G.real_time + idiv(C.FAST_TIME_FOR_YEAR * 1000, C.NUMOF_DAYS_IN_YEAR)) | 0;
    else if (G.med_flag) next_time_step = (G.real_time + idiv(C.MED_TIME_FOR_YEAR * 1000, C.NUMOF_DAYS_IN_YEAR)) | 0;
    do_time_step();
    update_main_screen(0);
    print_stats();
    if (G.market_cb_flag) draw_market_cb();
    else if (G.port_cb_flag) draw_port_cb();
  } else {
    if (G.market_cb_flag !== 0 && G.market_cb_drawn_flag === 0) draw_market_cb();
    if (G.port_cb_flag !== 0 && G.port_cb_drawn_flag === 0) draw_port_cb();
  }
  if (G.prefs_flag !== 0 && G.prefs_drawn_flag === 0) {
    do_prefs_screen();
    G.let_one_through = 1;
  }
  if (G.load_flag !== 0) {
    if (G.help_flag === 0) do_load_city();
    G.load_flag = 0;
    G.let_one_through = 1;
  } else if (G.save_flag !== 0) {
    if (G.help_flag === 0) do_save_city();
    G.save_flag = 0;
    G.let_one_through = 1;
  } else if (G.quit_flag !== 0) {
    if (yn_dial_box('Quit The Game?', 'Do you really want to quit?', 'If you want to save the game select NO.', '') !== 0) {
      real_quit_flag = 1;
    } else G.quit_flag = 0;
  }
  if (G.help_flag !== 0) lc_usleep(1);
  return real_quit_flag;
}

function cheat(): number {
  if (G.cheat_flag !== 0) return 1;
  if (yn_dial_box('TEST', 'You have pressed a test key', 'You will only see this message once',
    'Do you really want to play in test mode...') !== 0) {
    G.cheat_flag = 1;
    print_time_for_year();
    return 1;
  }
  return 0;
}

/** compile_results(): writes ~/.lincity/results */
function compile_results(): number {
  const s = `${PATHS.lc_save_dir}/results`;
  const group_count = count_all_groups();
  const outf = fopen(s, 'w');
  if (!outf) return 0;
  const gc = (g: number): number => group_count[g];
  if (G.cheat_flag) outf.fprintf('----- IN TEST MODE -------\n');
  outf.fprintf('Game statistics from LinCity Version %s\n', '1.13.1');
  if (PATHS.given_scene.length > 3) outf.fprintf('Initial loaded scene - %s\n', PATHS.given_scene);
  if (G.sustain_flag) outf.fprintf('Economy is sustainable\n');
  outf.fprintf('Population  %d  of which  %d  are not housed.\n', G.housed_population + G.people_pool, G.people_pool);
  outf.fprintf('Max population %d  Number evacuated %d Total births %d\n', G.max_pop_ever, G.total_evacuated, G.total_births);
  // (float) tech_level * 100.0 / MAX_TECH_LEVEL: double arithmetic on the float
  outf.fprintf(' Date  %s %04d   Money %8d   Tech-level %5.1f (%5.1f)\n', current_month(G.total_time),
    current_year(G.total_time), G.total_money, f32(G.tech_level) * 100.0 / C.MAX_TECH_LEVEL,
    f32(G.highest_tech_level) * 100.0 / C.MAX_TECH_LEVEL);
  outf.fprintf(' Deaths by starvation %7d   History %8.3f\n', G.total_starve_deaths, G.starve_deaths_history);
  outf.fprintf('Deaths from pollution %7d   History %8.3f\n', G.total_pollution_deaths, G.pollution_deaths_history);
  outf.fprintf('Years of unemployment %7d   History %8.3f\n', G.total_unemployed_years, G.unemployed_history);
  outf.fprintf('Rockets launched %2d  Successful launches %2d\n', G.rockets_launched, G.rockets_launched_success);
  outf.fprintf('\n');
  outf.fprintf('    Residences %4d         Markets %4d            Farms %4d\n',
    gc(C.GROUP_RESIDENCE_LL) + gc(C.GROUP_RESIDENCE_ML) + gc(C.GROUP_RESIDENCE_HL) + gc(C.GROUP_RESIDENCE_LH)
    + gc(C.GROUP_RESIDENCE_MH) + gc(C.GROUP_RESIDENCE_HH), gc(C.GROUP_MARKET), gc(C.GROUP_ORGANIC_FARM));
  outf.fprintf('        Tracks %4d           Roads %4d             Rail %4d\n', gc(C.GROUP_TRACK), gc(C.GROUP_ROAD), gc(C.GROUP_RAIL));
  outf.fprintf('     Potteries %4d     Blacksmiths %4d            Mills %4d\n', gc(C.GROUP_POTTERY), gc(C.GROUP_BLACKSMITH), gc(C.GROUP_MILL));
  outf.fprintf('     Monuments %4d         Schools %4d     Universities %4d\n', gc(C.GROUP_MONUMENT), gc(C.GROUP_SCHOOL), gc(C.GROUP_UNIVERSITY));
  outf.fprintf(' Fire stations %4d           Parks %4d     Cricket gnds %4d\n', gc(C.GROUP_FIRESTATION), gc(C.GROUP_PARKLAND), gc(C.GROUP_CRICKET));
  outf.fprintf('    Coal mines %4d       Ore mines %4d         Communes %4d\n', gc(C.GROUP_COALMINE), gc(C.GROUP_OREMINE), gc(C.GROUP_COMMUNE));
  outf.fprintf('     Windmills %4d     Coal powers %4d     Solar powers %4d\n', gc(C.GROUP_WINDMILL), gc(C.GROUP_COAL_POWER), gc(C.GROUP_SOLAR_POWER));
  outf.fprintf('   Substations %4d     Power lines %4d            Ports %4d\n', gc(C.GROUP_SUBSTATION), gc(C.GROUP_POWER_LINE), gc(C.GROUP_PORT));
  outf.fprintf('    Light inds %4d      Heavy inds %4d        Recyclers %4d\n', gc(C.GROUP_INDUSTRY_L), gc(C.GROUP_INDUSTRY_H), gc(C.GROUP_RECYCLE));
  outf.fprintf('Health centres %4d            Tips %4d         Shanties %4d\n', gc(C.GROUP_HEALTH), gc(C.GROUP_TIP), gc(C.GROUP_SHANTY));
  outf.fclose();
  return 1;
}

export function window_results(): void {
  if (compile_results() === 0) return;
  ok_dial_box(`${PATHS.lc_save_dir}/results`, C.RESULTS, null);
}

/** print_results() at exit: the results file (the original cats it to the terminal) */
export function results_text(): string {
  compile_results();
  const f = fopen(`${PATHS.lc_save_dir}/results`, 'r');
  if (!f) return '';
  let s = '';
  for (let i = 0; i < f.data.length; i++) s += String.fromCharCode(f.data[i]);
  return s;
}

/** runs the program; returns the exit status */
export function run(): number {
  try {
    lincity_main();
    // print_results (); exit (0);
    results_text();
    return 0;
  } catch (e) {
    if (e instanceof ExitProgram) return e.code;
    throw e;
  }
}

