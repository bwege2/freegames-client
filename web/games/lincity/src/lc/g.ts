// The original's global variables: engglobs.c, cliglobs.c, shrglobs.c, stats.c, timer.c, fileutil.c,
// module_buttons.c, mps.c, screen.c, power.c, pixmap.c and lcx11's. Scalars live in G (same names as in C);
// arrays are exported as they are.
import { MAX_NUMOF_MARKETS, MAX_NUMOF_SUBSTATIONS, WORLD_SIDE_LEN, NUMOF_MODULES, MAX_NUMOF_HELP_BUTTONS,
  MAX_HELP_HISTORY, MINI_SCREEN_NORMAL_FLAG, MAIN_SCREEN_NORMAL_FLAG, MOUSE_TYPE_NORMAL, PROGBOXW, PROGBOXH,
  MARKET_CB_W, MARKET_CB_H, MAX_ICON_LEN, MONTHGRAPH_STYLE_MIN } from './consts.ts';

export interface Rect { x: number; y: number; w: number; h: number }
export const rect = (): Rect => ({ x: 0, y: 0, w: 0, h: 0 });

export const G = {
  /* engglobs.c */
  numof_shanties: 0, numof_communes: 0, last_built_x: 0, last_built_y: 0,
  main_screen_originx: 0, main_screen_originy: 0, pix_double: 0, cheat_flag: 0, modern_windmill_flag: 0,
  askdir_lines: 0, monthgraph_size: 0,
  sust_dig_ore_coal_tip_flag: 0, sust_port_flag: 0, sustain_flag: 0,
  sust_dig_ore_coal_count: 0, sust_port_count: 0, sust_old_money: 0,
  sust_old_money_count: 0, sust_old_population: 0, sust_old_population_count: 0,
  sust_old_tech: 0, sust_old_tech_count: 0, sust_fire_count: 0,
  total_time: 0, population: 0, starving_population: 0, housed_population: 0,
  unemployed_population: 0, people_pool: 0, numof_substations: 0, numof_markets: 0,
  numof_health_centres: 0, max_pop_ever: 0, total_evacuated: 0, total_births: 0,
  total_money: 0, income_tax_rate: 0, coal_tax_rate: 0, dole_rate: 0, transport_cost_rate: 0,
  goods_tax_rate: 0, export_tax_rate: 0, import_cost_rate: 0,
  tech_level: 0, highest_tech_level: 0, unnat_deaths: 0,
  total_pollution_deaths: 0, total_starve_deaths: 0, total_unemployed_days: 0, total_unemployed_years: 0,
  /** floats (kept as Math.fround values) */
  pollution_deaths_history: 0, starve_deaths_history: 0, unemployed_history: 0,
  university_intake_rate: 0, power_made: 0, power_used: 0, coal_made: 0, coal_used: 0,
  goods_made: 0, goods_used: 0, ore_made: 0, ore_used: 0,
  rockets_launched: 0, rockets_launched_success: 0, coal_survey_done: 0, selected_type_cost: 0,

  /* stats.c */
  food_in_markets: 0, jobs_in_markets: 0, coal_in_markets: 0, goods_in_markets: 0,
  ore_in_markets: 0, steel_in_markets: 0, waste_in_markets: 0,
  tfood_in_markets: 0, tjobs_in_markets: 0, tcoal_in_markets: 0, tgoods_in_markets: 0,
  tore_in_markets: 0, tsteel_in_markets: 0, twaste_in_markets: 0,
  tpopulation: 0, tstarving_population: 0, tunemployed_population: 0,
  income_tax: 0, coal_tax: 0, goods_tax: 0, export_tax: 0, import_cost: 0,
  unemployment_cost: 0, transport_cost: 0, windmill_cost: 0, university_cost: 0, recycle_cost: 0,
  deaths_cost: 0, health_cost: 0, rocket_pad_cost: 0, school_cost: 0, fire_cost: 0, cricket_cost: 0, other_cost: 0,
  ly_income_tax: 0, ly_coal_tax: 0, ly_goods_tax: 0, ly_export_tax: 0, ly_import_cost: 0, ly_other_cost: 0,
  ly_unemployment_cost: 0, ly_transport_cost: 0, ly_university_cost: 0, ly_recycle_cost: 0, ly_school_cost: 0,
  ly_deaths_cost: 0, ly_health_cost: 0, ly_rocket_pad_cost: 0, ly_interest: 0, ly_windmill_cost: 0,
  ly_cricket_cost: 0, ly_fire_cost: 0,
  data_last_month: 0,

  /* cliglobs.c */
  lc_mouse_type: 0,
  overwrite_transport_flag: 0, suppress_popups: 0, time_multiplex_stats: 0, no_init_help: 0, confine_flag: 0,
  skip_splash_screen: 0, suppress_firsttime_module_help: 0,
  main_screen_flag: MAIN_SCREEN_NORMAL_FLAG, mappoint_stats_flag: 0, mappoint_stats_time: 0,
  mini_screen_flags: MINI_SCREEN_NORMAL_FLAG, mini_screen_time: 0, mini_screen_port_x: 0, mini_screen_port_y: 0,
  gamma_correct_red: 0, gamma_correct_green: 0, gamma_correct_blue: 0,
  mouse_initialized: 0, cs_mouse_x: 0, cs_mouse_y: 0, cs_mouse_button: 0, cs_mouse_shifted: 0,
  cs_mouse_xmax: 0, cs_mouse_ymax: 0, omx: 0, omy: 0, mox: 10, moy: 10, mouse_hide_count: 0,
  kmousex: 0, kmousey: 0, kmouse_val: 0, reset_mouse_flag: 0, mt_flag: 0,
  mouse_type: MOUSE_TYPE_NORMAL,
  mt_start_posx: 0, mt_start_posy: 0, mt_current_posx: 0, mt_current_posy: 0,
  pause_flag: 0, slow_flag: 0, med_flag: 0, fast_flag: 0,
  market_cb_flag: 0, mcbx: 0, mcby: 0, market_cb_drawn_flag: 0, port_cb_flag: 0, port_cb_drawn_flag: 0,
  help_flag: 0, numof_help_buttons: 0, help_history_count: 0, help_return_val: 0, block_help_exit: 0,
  quit_flag: 0, network_flag: 0, load_flag: 0, save_flag: 0, prefs_flag: 0, prefs_drawn_flag: 0,
  monument_bul_flag: 0, river_bul_flag: 0, shanty_bul_flag: 0,
  must_release_button: 0, let_one_through: 0,
  db_yesbox_x1: 0, db_yesbox_x2: 0, db_yesbox_y1: 0, db_yesbox_y2: 0,
  db_nobox_x1: 0, db_nobox_x2: 0, db_nobox_y1: 0, db_nobox_y2: 0,
  db_flag: 0, db_yesbox_clicked: 0, db_nobox_clicked: 0,
  db_okbox_x1: 0, db_okbox_x2: 0, db_okbox_y1: 0, db_okbox_y2: 0, db_okflag: 0, db_okbox_clicked: 0,
  suppress_ok_buttons: 0,
  borderx: 0, bordery: 0, command_line_debug: 0,
  winX: 0, winY: 0, mouse_button: 0, verbose: 0, stay_in_front: 0,
  text_bg: 0, text_fg: 255, x_key_value: 0, x_key_shifted: 0,
  xclip_x1: 0, xclip_y1: 0, xclip_x2: 0, xclip_y2: 0, clipping_flag: 0,
  open_font_height: 0, suppress_next_expose: 0,

  /* timer.c */
  real_time: 0,

  /* module_buttons.c */
  selected_module: 0, selected_module_type: 0, selected_module_group: 0, selected_module_cost: 0,

  /* mps.c, screen.c */
  mps_global_style: 0, monthgraph_style: MONTHGRAPH_STYLE_MIN, screen_refreshing: 0,

  /* power.c */
  grid_num: 0, grid_inc: 0,

  /* fileutil.c */
  lc_save_dir_len: 0,

  /* pixmap.c */
  pixmap_height: 0, pixmap_width: 0,
};

/* engglobs.c arrays */
export const mappoint_array_x = new Int32Array(WORLD_SIDE_LEN);
export const mappoint_array_y = new Int32Array(WORLD_SIDE_LEN);
export const substationx = new Int32Array(MAX_NUMOF_SUBSTATIONS);
export const substationy = new Int32Array(MAX_NUMOF_SUBSTATIONS);
export const marketx = new Int32Array(MAX_NUMOF_MARKETS + 1);
export const markety = new Int32Array(MAX_NUMOF_MARKETS + 1);
export const ex_tax_dis = Int32Array.from([25000, 50000, 100000, 200000, 400000, 800000]);
/** the monthgraph arrays (malloc'd to monthgraph_size in screen.c) */
export const MG_ARR = {
  monthgraph_pop: new Int32Array(0), monthgraph_starve: new Int32Array(0),
  monthgraph_nojobs: new Int32Array(0), monthgraph_ppool: new Int32Array(0),
};

/* cliglobs.c arrays */
export const mappointoldtype = new Int16Array(WORLD_SIDE_LEN * WORLD_SIDE_LEN);
export const progbox = new Uint8Array((PROGBOXW + 16) * (PROGBOXH + 16));
export const under_square_mouse_pointer_top = new Uint8Array(20 * 2 * 4);
export const under_square_mouse_pointer_left = new Uint8Array(18 * 2 * 4);
export const under_square_mouse_pointer_right = new Uint8Array(18 * 2 * 4);
export const under_square_mouse_pointer_bottom = new Uint8Array(20 * 2 * 4);
export const market_cb_gbuf = new Uint8Array(MARKET_CB_W * MARKET_CB_H);
export const help_button_x = new Int32Array(MAX_NUMOF_HELP_BUTTONS);
export const help_button_y = new Int32Array(MAX_NUMOF_HELP_BUTTONS);
export const help_button_w = new Int32Array(MAX_NUMOF_HELP_BUTTONS);
export const help_button_h = new Int32Array(MAX_NUMOF_HELP_BUTTONS);
export const help_button_s: string[] = new Array(MAX_NUMOF_HELP_BUTTONS).fill('');
export const help_button_history: string[] = new Array(MAX_HELP_HISTORY).fill('');
export const help_graphic = new Uint8Array(MAX_ICON_LEN);
export const askdir_path: string[] = [];
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* module_buttons.c arrays */
export const sbut = new Int32Array(NUMOF_MODULES);
export const module_type = new Int32Array(NUMOF_MODULES);
export const module_tflag = new Int32Array(NUMOF_MODULES);
export const module_help_flag = new Int32Array(NUMOF_MODULES);
export const module_help: string[] = new Array(NUMOF_MODULES).fill('');

/** the graphics loaded with load_graphic() (cliglobs.c's char* graphic pointers) */
const empty: Uint8Array = new Uint8Array(0);
export const GR = {
  up_pbar1_graphic: empty, up_pbar2_graphic: empty, down_pbar1_graphic: empty, down_pbar2_graphic: empty,
  pop_pbar_graphic: empty, tech_pbar_graphic: empty, food_pbar_graphic: empty, jobs_pbar_graphic: empty,
  money_pbar_graphic: empty, coal_pbar_graphic: empty, goods_pbar_graphic: empty, ore_pbar_graphic: empty,
  steel_pbar_graphic: empty,
  pause_button1_off: empty, pause_button2_off: empty, pause_button1_on: empty, pause_button2_on: empty,
  fast_button1_off: empty, fast_button2_off: empty, fast_button1_on: empty, fast_button2_on: empty,
  med_button1_off: empty, med_button2_off: empty, med_button1_on: empty, med_button2_on: empty,
  slow_button1_off: empty, slow_button2_off: empty, slow_button1_on: empty, slow_button2_on: empty,
  results_button1: empty, results_button2: empty,
  ms_pollution_button_graphic: empty, ms_normal_button_graphic: empty, ms_fire_cover_button_graphic: empty,
  ms_health_cover_button_graphic: empty, ms_cricket_cover_button_graphic: empty, ms_ub40_button_graphic: empty,
  ms_coal_button_graphic: empty, ms_starve_button_graphic: empty, ms_ocost_button_graphic: empty,
  ms_power_button_graphic: empty, checked_box_graphic: empty, unchecked_box_graphic: empty,
};

/** geometry.h's Screen_Geometry scr */
export const scr = {
  border_x: 0, border_y: 0, client_w: 0, client_h: 0,
  client_win: rect(), main_win: rect(),
  pause_button: rect(), slow_button: rect(), med_button: rect(), fast_button: rect(),
  menu_button: rect(), load_button: rect(), save_button: rect(), quit_button: rect(), help_button: rect(),
  results_button: rect(), tover_button: rect(), confine_button: rect(), module_buttons: rect(),
  pbar_area: rect(), pbar_pop: rect(), pbar_tech: rect(), pbar_food: rect(), pbar_jobs: rect(),
  pbar_money: rect(), pbar_coal: rect(), pbar_goods: rect(), pbar_ore: rect(), pbar_steel: rect(),
  sust: rect(), select_message: rect(), date: rect(), time_for_year: rect(),
  status_message_1: rect(), status_message_2: rect(), money: rect(),
  mini_map: rect(), mini_map_aux: rect(), mini_map_area: rect(),
  monthgraph: rect(), mappoint_stats: rect(), market_cb: rect(),
};

/** lcx11.h's display (what the port uses of it) */
export const display = { winW: 0, winH: 0, pointer_confined: 0 };

/* fileutil.c strings */
export const PATHS = {
  LIBDIR: '', lc_save_dir: '', given_scene: '', colour_pal_file: '', opening_pic: '', graphic_path: '',
  fontfile: '', opening_path: '', help_path: '', message_path: '', lincityrc_file: '', lc_temp_filename: '',
};
