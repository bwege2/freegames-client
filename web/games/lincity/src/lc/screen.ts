// screen.c: drawing the main window (the map, or one of the mini map's views over it), the mini map,
// the month graph and sustainability bars, the status lines, the market and port panels, the OK and
// yes/no dialogs and the progress box.
import * as C from './consts.ts';
import { G, GR, MG_ARR, scr, mappointoldtype, progbox, market_cb_gbuf } from './g.ts';
import { MT, MG, MI, MPOL, P, IX, FLAGS, I1, I2, coalReserve } from './map.ts';
import { sprintf, toInt, idiv, f32 } from './c.ts';
import { icon_pixmap, update_pixmap } from './pixmap.ts';
import { Fgl_fillbox, Fgl_putbox, Fgl_getbox, Fgl_hline, Fgl_line, Fgl_setpixel, Fgl_write, Fgl_setfontcolors,
  Fgl_setfont, Fgl_enableclipping, Fgl_setclippingwindow, Fgl_disableclipping, HandleError, draw_border } from './lcx11.ts';
import { main_groups, main_types, get_group_of_type } from './lintypes.ts';
import { connect_transport } from './shrtypes.ts';
import { get_power } from './power.ts';
import { hide_mouse, redraw_mouse, mouse_register } from './mouse.ts';
import { mps_redraw, mps_update, mps_global_advance } from './mps.ts';
import { pbars_full_refresh, init_pbars, refresh_pbars, update_pbars_monthly, draw_pbar } from './pbar.ts';
import { dialog_box, dialog_refresh } from './dialbox.ts';
import { activate_help, refresh_help_page } from './lchelp.ts';
import { draw_modules, draw_selected_module_cost, set_selected_module, update_avail_modules } from './module_buttons.ts';
import { draw_menu, draw_help, draw_pause, draw_slow, draw_med, draw_fast, draw_results, draw_ms_button,
  draw_ms_text, draw_small_bezel, adjust_main_origin } from './geometry.ts';
import { current_month, current_year, commify } from './lclib.ts';
import { load_graphic, undosify_string } from './fileutil.ts';
import { fopen } from './stdio.ts';
import { PATHS } from './g.ts';
import { do_coal_survey } from './engine.ts';

export const main_font = new Uint8Array(2048);
export const start_font1 = new Uint8Array(2048);
export const start_font2 = new Uint8Array(4096);
export const start_font3 = new Uint8Array(4096);

export const update_scoreboard = { mps: 0, mini: 0, date: 0, money: 0, monthly: 0, yearly_1: 0, yearly_2: 0, message_area: 0 };

/** ints, like the other variables below that hold a real_time (a long) */
let monthgraph_style_timeout = 1;
let mps_global_style_timeout = 1;
/** a float */
let time_for_year = 0;

const W = C.WORLD_SIDE_LEN;

export function draw_background(): void {
  draw_border();
  Fgl_fillbox(0, 0, G.pixmap_width, G.pixmap_height, C.TEXT_BG_COLOUR);
}

export function connect_transport_main_screen(): void {
  const b = scr.main_win;
  connect_transport(G.main_screen_originx, G.main_screen_originy, idiv(b.w, 16), idiv(b.h, 16));
}

export function refresh_main_screen(): void {
  connect_transport_main_screen();
  update_main_screen(1);
  update_mini_screen();
  dialog_refresh();
}

function clip_main_window(): void {
  const b = scr.main_win;
  Fgl_enableclipping();
  Fgl_setclippingwindow(b.x, b.y, b.x + b.w - 1, b.y + b.h - 1);
}
const unclip_main_window = (): void => Fgl_disableclipping();

export function rotate_main_screen(): void {
  G.main_screen_flag = G.main_screen_flag === C.MAIN_SCREEN_NORMAL_FLAG ? C.MAIN_SCREEN_EQUALS_MINI : C.MAIN_SCREEN_NORMAL_FLAG;
  refresh_main_screen();
}

export function update_main_screen(full_refresh: number): void {
  if (G.main_screen_flag === C.MAIN_SCREEN_NORMAL_FLAG) update_main_screen_normal(full_refresh);
  else {
    switch (G.mini_screen_flags) {
      case C.MINI_SCREEN_NORMAL_FLAG: update_main_screen_normal(full_refresh); break;
      case C.MINI_SCREEN_POL_FLAG: update_main_screen_pollution(); break;
      case C.MINI_SCREEN_UB40_FLAG: update_main_screen_ub40(); break;
      case C.MINI_SCREEN_STARVE_FLAG: update_main_screen_starve(); break;
      case C.MINI_SCREEN_POWER_FLAG: update_main_screen_power(); break;
      case C.MINI_SCREEN_FIRE_COVER: update_main_screen_cover(C.FLAG_FIRE_COVER); break;
      case C.MINI_SCREEN_CRICKET_COVER: update_main_screen_cover(C.FLAG_CRICKET_COVER); break;
      case C.MINI_SCREEN_HEALTH_COVER: update_main_screen_cover(C.FLAG_HEALTH_COVER); break;
      case C.MINI_SCREEN_COAL_FLAG:
        if (G.coal_survey_done) update_main_screen_coal();
        else update_main_screen_normal(full_refresh);
        break;
    }
  }
  if (G.mouse_type === C.MOUSE_TYPE_SQUARE) redraw_mouse();
}

function update_main_screen_normal(full_refresh: number): void {
  const mw = scr.main_win;
  if (G.help_flag || G.load_flag || G.save_flag) return;
  let xm = G.main_screen_originx;
  if (xm > 3) xm = 3;
  let ym = G.main_screen_originy;
  if (ym > 3) ym = 3;
  if (G.mouse_type === C.MOUSE_TYPE_SQUARE) hide_mouse();
  clip_main_window();
  const ox = G.main_screen_originx, oy = G.main_screen_originy;
  const ww = idiv(mw.w, 16), wh = idiv(mw.h, 16);
  for (let y = oy - ym; y < oy + wh; y++) {
    for (let x = ox - xm; x < ox + ww; x++) {
      const typ = MT[P(x, y)];
      if (typ !== mappointoldtype[P(x, y)] || full_refresh) {
        mappointoldtype[P(x, y)] = typ;
        if (typ === C.CST_USED) continue;
        const grp = get_group_of_type(typ);
        if (icon_pixmap[typ] !== 0) {
          let x1 = 0, y1 = 0;
          if (x < ox) x1 = (ox - x) * 16;
          if (y < oy) y1 = (oy - y) * 16;
          let sx = main_groups[grp].size, sy = sx;
          if (sx + x > ox + ww) sx = ox + ww - x;
          if (sy + y > oy + wh) sy = oy + wh - y;
          sx = (sx << 4) - x1;
          sy = (sy << 4) - y1;
          const dx = mw.x + (x - ox) * 16 + x1;
          const dy = mw.y + (y - oy) * 16 + y1;
          if (sx > 0 && sy > 0) update_pixmap(x1, y1, sx, sy, dx, dy, main_groups[grp].size, main_types[typ].graphic);
        } else {
          Fgl_putbox(mw.x + (x - ox) * 16, mw.y + (y - oy) * 16, 16 * main_groups[grp].size,
            16 * main_groups[grp].size, main_types[typ].graphic);
        }
      }
    }
  }
  unclip_main_window();
}

function polColour(pol: number): number {
  if (pol < 4) return C.green(24);
  if (pol < 600) return C.green(23 - idiv(pol, 45));
  // (int) sqrt ((float) (pol - 600)) / 9
  let col = idiv(toInt(Math.sqrt(f32(pol - 600))), 9);
  if (col > 20) col = 20;
  return col + C.red(11);
}

function eachMainSquare(f: (x: number, y: number) => number): void {
  const mw = scr.main_win;
  const ox = G.main_screen_originx, oy = G.main_screen_originy;
  for (let y = oy; y < oy + idiv(mw.h, 16); y++) {
    for (let x = ox; x < ox + idiv(mw.w, 16); x++) {
      Fgl_fillbox(mw.x + (x - ox) * 16, mw.y + (y - oy) * 16, 16, 16, f(x, y));
    }
  }
}
/** the master square of a CST_USED square */
function master(x: number, y: number): [number, number] {
  if (MT[P(x, y)] === C.CST_USED) return [MI[IX(x, y) + I1], MI[IX(x, y) + I2]];
  return [x, y];
}

function update_main_screen_pollution(): void { eachMainSquare((x, y) => polColour(MPOL[P(x, y)])); }

function update_main_screen_ub40(): void {
  eachMainSquare((x, y) => {
    const [xx, yy] = master(x, y);
    if (C.GROUP_IS_RESIDENCE(MG[P(xx, yy)])) {
      const j = MI[IX(xx, yy) + I1];
      return j < -20 ? C.red(28) : j < 10 ? C.red(14) : C.green(20);
    }
    return C.green(14);
  });
}

function update_main_screen_starve(): void {
  eachMainSquare((x, y) => {
    const [xx, yy] = master(x, y);
    if (C.GROUP_IS_RESIDENCE(MG[P(xx, yy)])) {
      // (sic) the starve date of x,y, not of the residence's master square
      const d = G.total_time - MI[IX(x, y) + I2];
      return d < 20 ? C.red(28) : d < 100 ? C.red(14) : C.green(20);
    }
    return C.green(14);
  });
}

function update_main_screen_power(): void {
  eachMainSquare((x, y) => {
    const [xx, yy] = master(x, y);
    if (get_power(xx, yy, 1, 1) !== 0) return C.green(14);
    if (get_power(xx, yy, 1, 0) !== 0) return C.green(10);
    return C.green(20);
  });
}

function update_main_screen_cover(flag: number): void {
  eachMainSquare((x, y) => {
    const [xx, yy] = master(x, y);
    return (MI[IX(xx, yy) + FLAGS] & flag) === 0 ? C.green(20) : C.green(10);
  });
}

function coalColour(x: number, y: number, prev: number): number {
  const c = coalReserve(x, y);
  if (c === 0) return C.white(4);
  if (c >= idiv(C.COAL_RESERVE_SIZE, 2)) return C.white(18);
  if (c < idiv(C.COAL_RESERVE_SIZE, 2)) return C.white(28);
  return prev;
}
let coalCol = 0; // col is uninitialised in C when no branch matches (cannot happen)
function update_main_screen_coal(): void { eachMainSquare((x, y) => (coalCol = coalColour(x, y, coalCol))); }

/* ---- screen setup ---- */
export function screen_setup(): void {
  monthgraph_full_refresh();
  monthgraph_style_timeout = (G.real_time + 10000) | 0;
  mps_redraw();
  mps_global_style_timeout = (G.real_time + 10000) | 0;
  GR.up_pbar1_graphic = load_graphic('pbarup1.csi');
  GR.up_pbar2_graphic = load_graphic('pbarup2.csi');
  GR.down_pbar1_graphic = load_graphic('pbardown1.csi');
  GR.down_pbar2_graphic = load_graphic('pbardown2.csi');
  GR.pop_pbar_graphic = load_graphic('pbarpop.csi');
  GR.tech_pbar_graphic = load_graphic('pbartech.csi');
  GR.food_pbar_graphic = load_graphic('pbarfood.csi');
  GR.jobs_pbar_graphic = load_graphic('pbarjobs.csi');
  GR.coal_pbar_graphic = load_graphic('pbarcoal.csi');
  GR.goods_pbar_graphic = load_graphic('pbargoods.csi');
  GR.ore_pbar_graphic = load_graphic('pbarore.csi');
  GR.steel_pbar_graphic = load_graphic('pbarsteel.csi');
  GR.money_pbar_graphic = load_graphic('pbarmoney.csi');
  init_pbars();
  draw_main_window_box(C.green(8));
  GR.checked_box_graphic = load_graphic('checked_box.csi');
  GR.unchecked_box_graphic = load_graphic('unchecked_box.csi');
  GR.ms_normal_button_graphic = load_graphic('ms-normal-button.csi');
  GR.ms_pollution_button_graphic = load_graphic('ms-pollution-button.csi');
  GR.ms_fire_cover_button_graphic = load_graphic('ms-fire-cover-button.csi');
  GR.ms_health_cover_button_graphic = load_graphic('ms-health-cover-button.csi');
  GR.ms_cricket_cover_button_graphic = load_graphic('ms-cricket-cover-button.csi');
  GR.ms_ub40_button_graphic = load_graphic('ms-ub40-button.csi');
  GR.ms_coal_button_graphic = load_graphic('ms-coal-button.csi');
  GR.ms_starve_button_graphic = load_graphic('ms-starve-button.csi');
  GR.ms_power_button_graphic = load_graphic('ms-power-button.csi');
  GR.ms_ocost_button_graphic = load_graphic('ms-ocost-button.csi');
  GR.pause_button1_off = load_graphic('pause-offl.csi');
  GR.pause_button2_off = load_graphic('pause-offr.csi');
  GR.pause_button1_on = load_graphic('pause-onl.csi');
  GR.pause_button2_on = load_graphic('pause-onr.csi');
  draw_pause(0);
  GR.slow_button1_off = load_graphic('slow-offl.csi');
  GR.slow_button2_off = load_graphic('slow-offr.csi');
  GR.slow_button1_on = load_graphic('slow-onl.csi');
  GR.slow_button2_on = load_graphic('slow-onr.csi');
  draw_slow(0);
  GR.med_button1_off = load_graphic('norm-offl.csi');
  GR.med_button2_off = load_graphic('norm-offr.csi');
  GR.med_button1_on = load_graphic('norm-onl.csi');
  GR.med_button2_on = load_graphic('norm-onr.csi');
  draw_med(0);
  GR.fast_button1_off = load_graphic('fast-offl.csi');
  GR.fast_button2_off = load_graphic('fast-offr.csi');
  GR.fast_button1_on = load_graphic('fast-onl.csi');
  GR.fast_button2_on = load_graphic('fast-onr.csi');
  draw_fast(0);
  GR.results_button1 = load_graphic('results-l.csi');
  GR.results_button2 = load_graphic('results-r.csi');
  draw_results();
  draw_menu();
  draw_help();
  set_selected_module(C.CST_TRACK_LR);
}

export function screen_full_refresh(): void {
  G.screen_refreshing++;
  draw_background();
  monthgraph_full_refresh();
  mps_redraw();
  pbars_full_refresh();
  mini_full_refresh();
  if (G.selected_module_type === C.CST_GREEN) draw_main_window_box(C.red(8));
  else draw_main_window_box(C.green(8));
  draw_menu();
  draw_help();
  draw_pause(G.pause_flag);
  draw_slow(G.slow_flag & (G.pause_flag ? 0 : 1));
  draw_med(G.med_flag & (G.pause_flag ? 0 : 1));
  draw_fast(G.fast_flag & (G.pause_flag ? 0 : 1));
  draw_results();
  draw_modules();
  if (G.help_flag) refresh_help_page();
  refresh_main_screen();
  print_date();
  print_time_for_year();
  print_total_money();
  draw_selected_module_cost();
  refresh_pbars();
  redraw_mouse();
  G.screen_refreshing--;
}

export function draw_main_window_box(colour: number): void {
  const b = scr.main_win;
  for (let x = 0; x < 8; x++) {
    Fgl_hline(b.x - 1 - x, b.y - 1 - x, b.x + b.w + x, colour + x + x);
    Fgl_hline(b.x - 1 - x, b.y + b.h + x, b.x + b.w + x, colour + x + x);
    Fgl_line(b.x - 1 - x, b.y - x, b.x - 1 - x, b.y + b.h + x, colour + x + x);
    Fgl_line(b.x + b.w + x, b.y - x, b.x + b.w + x, b.y + b.h + x, colour + x + x);
  }
}

export function draw_small_yellow_bezel(x: number, y: number, h: number, w: number): void {
  for (let i = 1; i < 4; i++) {
    Fgl_hline(x - 1 - i, y - 1 - i, x + w + i, C.yellow(16));
    Fgl_line(x - 1 - i, y - 1 - i, x - 1 - i, y + h + i, C.yellow(14));
    Fgl_hline(x - 1 - i, y + h + i, x + w + i, C.yellow(22));
    Fgl_line(x + w + i, y - 1 - i, x + w + i, y + h + i, C.yellow(24));
  }
}

function readFont(path: string, into: Uint8Array, n: number, err: () => void): void {
  const inf = fopen(path, 'rb');
  if (!inf) { err(); return; }
  // fgetc() past the end gives EOF (-1), stored as 255
  for (let i = 0; i < n; i++) into[i] = inf.fgetc() & 0xff;
}

export function load_fonts(): void {
  readFont(PATHS.fontfile, main_font, 256 * 8, () => HandleError("Can't open the font file", C.FATAL));
  readFont(`${PATHS.opening_path}/8x8thin`, start_font1, 2048, () => do_error_('Can\'t open opening screen font 8x8thin'));
  readFont(`${PATHS.opening_path}/scrawl_w.fnt`, start_font2, 4096, () => do_error_("Can't open opening screen font scrawl_w.fnt"));
  readFont(`${PATHS.opening_path}/scrawl_s.fnt`, start_font3, 4096, () => do_error_("Can't open opening screen font scrawl_s.fnt"));
}
const do_error_ = (s: string): void => HandleError(s, C.FATAL);

export function init_fonts(): void {
  load_fonts();
  Fgl_setfont(8, 8, main_font);
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}

/* ---- mini screen ---- */
export function init_mini_map_mouse(): void {
  mouse_register(scr.mini_map, mini_map_handler);
  mouse_register(scr.mini_map_aux, mini_aux_handler);
}

function mini_map_handler(x: number, y: number, button: number): void {
  if (button === C.LC_MOUSE_RIGHTBUTTON) {
    mini_screen_help();
    return;
  }
  if (G.mini_screen_flags === C.MINI_SCREEN_COAL_FLAG && !G.coal_survey_done) {
    if (yn_dial_box('Coal survey', 'This will cost you 1 million', "After that it's is free to call again",
      'Do coal survey?') === 0) return;
    do_coal_survey();
    print_total_money();
    return;
  }
  adjust_main_origin(x - idiv(scr.main_win.w, 32), y - idiv(scr.main_win.h, 32), 1);
  if (G.mini_screen_flags === C.MINI_SCREEN_PORT_FLAG) draw_mini_screen();
}

function mini_aux_handler(_x: number, _y: number, button: number): void {
  if (button === C.LC_MOUSE_MIDDLEBUTTON) {
    rotate_main_screen();
    return;
  } else if (button === C.LC_MOUSE_RIGHTBUTTON) {
    mini_screen_help();
    return;
  }
  rotate_mini_screen();
}

export function rotate_mini_screen(): void {
  switch (G.mini_screen_flags) {
    case C.MINI_SCREEN_NORMAL_FLAG: G.mini_screen_flags = C.MINI_SCREEN_POL_FLAG; break;
    case C.MINI_SCREEN_POL_FLAG: G.mini_screen_flags = C.MINI_SCREEN_UB40_FLAG; break;
    case C.MINI_SCREEN_UB40_FLAG: G.mini_screen_flags = C.MINI_SCREEN_STARVE_FLAG; break;
    case C.MINI_SCREEN_STARVE_FLAG: G.mini_screen_flags = C.MINI_SCREEN_POWER_FLAG; break;
    case C.MINI_SCREEN_POWER_FLAG: G.mini_screen_flags = C.MINI_SCREEN_FIRE_COVER; break;
    case C.MINI_SCREEN_FIRE_COVER: G.mini_screen_flags = C.MINI_SCREEN_CRICKET_COVER; break;
    case C.MINI_SCREEN_CRICKET_COVER: G.mini_screen_flags = C.MINI_SCREEN_HEALTH_COVER; break;
    case C.MINI_SCREEN_HEALTH_COVER: G.mini_screen_flags = C.MINI_SCREEN_COAL_FLAG; break;
    case C.MINI_SCREEN_COAL_FLAG: G.mini_screen_flags = C.MINI_SCREEN_NORMAL_FLAG; break;
  }
  update_mini_screen();
  if (G.main_screen_flag === C.MAIN_SCREEN_EQUALS_MINI) refresh_main_screen();
}

export function update_mini_screen(): void {
  switch (G.mini_screen_flags) {
    case C.MINI_SCREEN_NORMAL_FLAG: draw_mini_screen(); break;
    case C.MINI_SCREEN_POL_FLAG: draw_mini_screen_pollution(); break;
    case C.MINI_SCREEN_UB40_FLAG: draw_mini_screen_ub40(); break;
    case C.MINI_SCREEN_STARVE_FLAG: draw_mini_screen_starve(); break;
    case C.MINI_SCREEN_POWER_FLAG: draw_mini_screen_power(); break;
    case C.MINI_SCREEN_FIRE_COVER: draw_mini_screen_cover(C.MINI_SCREEN_FIRE_COVER, 'Fire cover  ', GR.ms_fire_cover_button_graphic, C.FLAG_FIRE_COVER); break;
    case C.MINI_SCREEN_CRICKET_COVER: draw_mini_screen_cover(C.MINI_SCREEN_CRICKET_COVER, 'Crickt cover', GR.ms_cricket_cover_button_graphic, C.FLAG_CRICKET_COVER); break;
    case C.MINI_SCREEN_HEALTH_COVER: draw_mini_screen_cover(C.MINI_SCREEN_HEALTH_COVER, 'Health cover', GR.ms_health_cover_button_graphic, C.FLAG_HEALTH_COVER); break;
    case C.MINI_SCREEN_COAL_FLAG: draw_mini_screen_coal(); break;
  }
}

export function mini_screen_help(): void {
  const pages: Record<number, string> = {
    [C.MINI_SCREEN_NORMAL_FLAG]: 'msb-normal.hlp', [C.MINI_SCREEN_POL_FLAG]: 'msb-pol.hlp',
    [C.MINI_SCREEN_UB40_FLAG]: 'msb-ub40.hlp', [C.MINI_SCREEN_STARVE_FLAG]: 'msb-starve.hlp',
    [C.MINI_SCREEN_POWER_FLAG]: 'msb-power.hlp', [C.MINI_SCREEN_FIRE_COVER]: 'msb-fire.hlp',
    [C.MINI_SCREEN_CRICKET_COVER]: 'msb-cricket.hlp', [C.MINI_SCREEN_HEALTH_COVER]: 'msb-health.hlp',
    [C.MINI_SCREEN_COAL_FLAG]: 'msb-coal.hlp',
  };
  const p = pages[G.mini_screen_flags];
  if (p) activate_help(p);
}

function mini_full_refresh(): void {
  const mm = scr.mini_map, mmaux = scr.mini_map_aux, mmarea = scr.mini_map_area;
  draw_small_yellow_bezel(mmarea.x, mmarea.y, mmarea.h, mmarea.w);
  Fgl_hline(mmaux.x, mmaux.y + mmaux.h, mmaux.x + mmaux.w, C.yellow(16));
  Fgl_hline(mmaux.x, mmaux.y + mmaux.h + 1, mmaux.x + mmaux.w, C.yellow(16));
  Fgl_fillbox(mmarea.x, mm.y, mm.x - mmarea.x, mm.h, C.GRAPHS_B_COLOUR);
  Fgl_fillbox(mm.x + mm.w, mm.y, mmarea.x + mmarea.w - mm.x - mm.w, mm.h, C.GRAPHS_B_COLOUR);
  draw_mini_screen();
}

export function draw_mini_screen(): void {
  const mm = scr.mini_map;
  G.mini_screen_flags = C.MINI_SCREEN_NORMAL_FLAG;
  draw_ms_button(GR.ms_normal_button_graphic);
  draw_ms_text('Land Use    ');
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const [xx, yy] = master(x, y);
      Fgl_setpixel(mm.x + x, mm.y + y, main_groups[MG[P(xx, yy)]].colour);
    }
  }
  draw_mini_screen_cursor();
}

export function draw_big_mini_screen(): void {
  const b = scr.main_win;
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const [xx, yy] = master(x, y);
      Fgl_fillbox(b.x + x * 4, b.y + y * 4, 4, 4, main_groups[MG[P(xx, yy)]].colour);
    }
  }
}

function draw_mini_screen_pollution(): void {
  const mm = scr.mini_map;
  G.mini_screen_flags = C.MINI_SCREEN_POL_FLAG;
  draw_ms_text('Pollution   ');
  draw_ms_button(GR.ms_pollution_button_graphic);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) Fgl_setpixel(mm.x + x, mm.y + y, polColour(MPOL[P(x, y)]));
  draw_mini_screen_cursor();
}

function draw_mini_screen_cover(flags: number, text: string, button: Uint8Array, flag: number): void {
  const mm = scr.mini_map;
  G.mini_screen_flags = flags;
  draw_ms_text(text);
  draw_ms_button(button);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const [xx, yy] = master(x, y);
      const col = (MI[IX(xx, yy) + FLAGS] & flag) === 0 ? main_groups[MG[P(xx, yy)]].colour : C.green(10);
      Fgl_setpixel(mm.x + x, mm.y + y, col);
    }
  }
  draw_mini_screen_cursor();
}

function draw_mini_screen_ub40(): void {
  const mm = scr.mini_map;
  G.mini_screen_flags = C.MINI_SCREEN_UB40_FLAG;
  draw_ms_text('Unemployment');
  draw_ms_button(GR.ms_ub40_button_graphic);
  Fgl_fillbox(mm.x, mm.y, W, W, C.green(14));
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      if (C.GROUP_IS_RESIDENCE(MG[P(x, y)])) {
        const j = MI[IX(x, y) + I1];
        Fgl_fillbox(mm.x + x, mm.y + y, 3, 3, j < -20 ? C.red(28) : j < 10 ? C.red(14) : C.green(20));
      }
    }
  }
  draw_mini_screen_cursor();
}

function draw_mini_screen_starve(): void {
  const mm = scr.mini_map;
  G.mini_screen_flags = C.MINI_SCREEN_STARVE_FLAG;
  draw_ms_text('Starvation  ');
  draw_ms_button(GR.ms_starve_button_graphic);
  Fgl_fillbox(mm.x, mm.y, W, W, C.green(14));
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      if (C.GROUP_IS_RESIDENCE(MG[P(x, y)])) {
        const d = G.total_time - MI[IX(x, y) + I2];
        Fgl_fillbox(mm.x + x, mm.y + y, 3, 3, d < 20 ? C.red(28) : d < 100 ? C.red(14) : C.green(20));
      }
    }
  }
  draw_mini_screen_cursor();
}

function draw_mini_screen_coal(): void {
  const mm = scr.mini_map;
  G.mini_screen_flags = C.MINI_SCREEN_COAL_FLAG;
  draw_ms_text('Coal Reserve');
  draw_ms_button(GR.ms_coal_button_graphic);
  if (G.coal_survey_done) {
    let col = 0;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) Fgl_setpixel(mm.x + x, mm.y + y, (col = coalColour(x, y, col)));
    draw_mini_screen_cursor();
  } else {
    Fgl_setfontcolors(C.white(4), C.white(28));
    Fgl_fillbox(mm.x, mm.y, W, W, C.white(4));
    Fgl_write(mm.x + 4, mm.y + 20, 'Click here');
    Fgl_write(mm.x + 4, mm.y + 32, '   to do  ');
    Fgl_write(mm.x + 4, mm.y + 44, 'coal survey');
    Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  }
}

function draw_mini_screen_power(): void {
  const mm = scr.mini_map;
  let have_power = 0;
  G.mini_screen_flags = C.MINI_SCREEN_POWER_FLAG;
  draw_ms_button(GR.ms_power_button_graphic);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      let grp = MG[P(x, y)];
      let xx = x, yy = y;
      if (grp === C.GROUP_USED) {
        xx = MI[IX(x, y) + I1];
        yy = MI[IX(x, y) + I2];
        grp = MG[P(xx, yy)];
      }
      let col: number;
      if (get_power(xx, yy, 1, 1) !== 0) {
        have_power = 1;
        col = C.green(14);
      } else if (get_power(xx, yy, 1, 0) !== 0) {
        have_power = 1;
        col = C.green(10);
      } else col = main_groups[grp].colour;
      Fgl_setpixel(mm.x + x, mm.y + y, col);
    }
  }
  draw_ms_text(have_power ? 'Power       ' : 'Power (none)');
  draw_mini_screen_cursor();
}

function draw_mini_screen_cursor(): void {
  const mini = scr.mini_map, mw = scr.main_win;
  const ox = G.main_screen_originx, oy = G.main_screen_originy;
  Fgl_hline(mini.x + ox, mini.y + oy, mini.x + ox + idiv(mw.w, 16) - 1, 255);
  Fgl_hline(mini.x + ox, mini.y + oy + idiv(mw.h, 16) - 1, mini.x + ox + idiv(mw.w, 16) - 1, 255);
  Fgl_line(mini.x + ox, mini.y + oy, mini.x + ox, mini.y + oy + idiv(mw.h, 16) - 1, 255);
  Fgl_line(mini.x + ox + idiv(mw.w, 16) - 1, mini.y + oy, mini.x + ox + idiv(mw.w, 16) - 1, mini.y + oy + idiv(mw.h, 16) - 1, 255);
}

/* ---- statistics ---- */
let print_stats_flag = 0;
function initialize_print_stats(): void {
  hide_mouse();
  update_scoreboard.mps = 0;
  update_scoreboard.mini = 0;
  update_scoreboard.date = 0;
  update_scoreboard.money = 0;
  update_scoreboard.monthly = 0;
  update_scoreboard.yearly_1 = 0;
  update_scoreboard.yearly_2 = 0;
  update_scoreboard.message_area = 0;
  redraw_mouse();
}

export function advance_monthgraph_style(): void {
  G.monthgraph_style = (G.monthgraph_style % 2) + 1;
  monthgraph_style_timeout = (G.real_time + (G.monthgraph_style === C.MONTHGRAPH_STYLE_ECONOMY ? 10000 : 4000)) | 0;
}

export function refresh_monthgraph(): void { do_monthgraph(1); }

function monthgraph_full_refresh(): void {
  const mg = scr.monthgraph;
  draw_small_yellow_bezel(mg.x, mg.y, mg.h, mg.w);
  do_monthgraph(1);
}

export function print_stats(): void {
  let monthgraph_full_update = 0;
  if (print_stats_flag === 0) {
    initialize_print_stats();
    print_stats_flag = 1;
  }
  hide_mouse();
  if (G.total_time % C.NUMOF_DAYS_IN_MONTH === C.NUMOF_DAYS_IN_MONTH - 1) update_scoreboard.monthly = 1;
  if (G.total_time % C.NUMOF_DAYS_IN_YEAR === C.NUMOF_DAYS_IN_YEAR - 1) {
    update_scoreboard.yearly_1 = 1;
    update_scoreboard.money = 1;
  }
  if (G.total_time % C.NUMOF_DAYS_IN_YEAR === 0) update_scoreboard.yearly_2 = 1;
  if (G.real_time > G.mappoint_stats_time) {
    update_scoreboard.mps = 1;
    G.mappoint_stats_time = (G.real_time + 1000) | 0;
  }
  if (G.mini_screen_flags !== C.MINI_SCREEN_NORMAL_FLAG && G.real_time > G.mini_screen_time) {
    update_scoreboard.mini = 1;
    G.mini_screen_time = (G.real_time + 1000) | 0;
  }
  if (G.total_time % C.NUMOF_DAYS_IN_YEAR === 0) {
    calculate_time_for_year();
    print_time_for_year();
  }
  if (G.total_time % C.NUMOF_DAYS_IN_MONTH === 1) update_scoreboard.date = 1;
  if (update_scoreboard.mps) {
    update_scoreboard.mps = 0;
    if (G.help_flag || G.load_flag || G.save_flag || G.mappoint_stats_flag) mps_global_style_timeout = (G.real_time + 6000) | 0;
    if (G.real_time > mps_global_style_timeout) {
      if (G.time_multiplex_stats) mps_global_advance();
    }
    mps_update();
  }
  if (update_scoreboard.mini) {
    update_scoreboard.mini = 0;
    update_mini_screen();
  }
  if (update_scoreboard.date) {
    update_scoreboard.date = 0;
    print_date();
  }
  if (update_scoreboard.money) {
    update_scoreboard.money = 0;
    print_total_money();
  }
  if (update_scoreboard.monthly) {
    update_scoreboard.monthly = 0;
    if (G.help_flag || G.load_flag || G.save_flag) {
      monthgraph_style_timeout = (G.real_time + (G.monthgraph_style === C.MONTHGRAPH_STYLE_ECONOMY ? 10000 : 4000)) | 0;
    }
    if (G.real_time > monthgraph_style_timeout) {
      if (G.time_multiplex_stats) {
        monthgraph_full_update = 1;
        G.monthgraph_style = (G.monthgraph_style % 2) + 1;
      }
      monthgraph_style_timeout = (G.real_time + (G.monthgraph_style === C.MONTHGRAPH_STYLE_ECONOMY ? 10000 : 4000)) | 0;
    }
    do_monthgraph(monthgraph_full_update);
    update_pbars_monthly();
    refresh_pbars();
    redraw_mouse();
    update_avail_modules(1);
    hide_mouse();
  }
  if (update_scoreboard.yearly_1) update_scoreboard.yearly_1 = 0;
  if (update_scoreboard.message_area > 0 && G.real_time > update_scoreboard.message_area) reset_status_message();
  redraw_mouse();
}

export function print_total_money(): void {
  const b = scr.money;
  const size = idiv(C.MONEY_W, C.CHAR_WIDTH);
  let str = 'Money: ';
  let count = str.length;
  const [c, n] = commify(size - count, G.total_money);
  str += c;
  count += n;
  // snprintf (str + count, size - count, 44 spaces): the size wraps when count > size (does not happen)
  const pad = ' '.repeat(44);
  if (size - count > 0) str = str.slice(0, count) + pad.slice(0, size - count - 1);
  str = str.slice(0, size);
  if (G.total_money < 0) Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.red(30));
  Fgl_write(b.x + 32, b.y, str);
  if (G.total_money < 0) Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}

export function print_date(): void {
  const b = scr.date;
  Fgl_write(b.x, b.y, sprintf('Date %s %04d ', current_month(G.total_time), current_year(G.total_time)));
}

export function print_population(): void { draw_pbar(scr.pbar_pop, GR.pop_pbar_graphic); }

let time_last_year = 0;
function calculate_time_for_year(): void {
  time_for_year = f32(f32(G.real_time - time_last_year) / 1000.0);
  time_last_year = G.real_time | 0;
}

export function print_time_for_year(): void {
  const b = scr.time_for_year;
  let s: string;
  if (time_for_year > 3600.0) {
    s = sprintf('%s%5.1f MINS/year  V %s', G.cheat_flag ? 'TEST MODE' : '', time_for_year / 60.0, '1.13.1');
  } else {
    s = sprintf('%s%5.1f secs/year  V %s ', G.cheat_flag ? 'TEST MODE' : '', time_for_year, '1.13.1');
  }
  Fgl_write(b.x, b.y, s);
}

export function status_message_1(message: string | null): void {
  const b = scr.status_message_1;
  Fgl_fillbox(b.x, b.y, b.w, b.h, C.TEXT_BG_COLOUR);
  if (message === null) return;
  Fgl_write(b.x, b.y, message);
}

export function status_message_2(message: string | null): void {
  const b = scr.status_message_2;
  Fgl_fillbox(b.x, b.y, b.w, b.h, C.TEXT_BG_COLOUR);
  if (message === null) return;
  Fgl_write(b.x, b.y, message);
}

export function status_message(m1: string | null, m2: string | null): void {
  status_message_1(m1);
  status_message_2(m2);
  update_scoreboard.message_area = G.real_time + 10000;
}

export function reset_status_message(): void {
  status_message_1(null);
  status_message_2(null);
  update_scoreboard.message_area = 0;
}

function clear_monthgraph(): void {
  const mg = scr.monthgraph;
  Fgl_fillbox(mg.x, mg.y, mg.w + 1, mg.h + 1, C.GRAPHS_B_COLOUR);
}

function do_monthgraph(full_refresh: number): void {
  if (full_refresh) clear_monthgraph();
  do_history_linegraph(G.monthgraph_style === C.MONTHGRAPH_STYLE_ECONOMY ? 1 : 0);
  do_sust_barchart(G.monthgraph_style === C.MONTHGRAPH_STYLE_SUSTAIN ? 1 : 0);
}

export function initialize_monthgraph(): void {
  G.monthgraph_size = scr.monthgraph.w;
  MG_ARR.monthgraph_pop = new Int32Array(G.monthgraph_size);
  MG_ARR.monthgraph_starve = new Int32Array(G.monthgraph_size);
  MG_ARR.monthgraph_nojobs = new Int32Array(G.monthgraph_size);
  MG_ARR.monthgraph_ppool = new Int32Array(G.monthgraph_size);
}

function do_history_linegraph(draw: number): void {
  const mg = scr.monthgraph;
  const { monthgraph_pop: pop, monthgraph_starve: starve, monthgraph_nojobs: nojobs, monthgraph_ppool: ppool } = MG_ARR;
  for (let i = mg.w - 1; i > 0; i--) {
    if (draw) {
      Fgl_line(mg.x + mg.w - i, mg.y + mg.h - nojobs[i], mg.x + mg.w - i, mg.y + mg.h, C.GRAPHS_B_COLOUR);
      Fgl_line(mg.x + mg.w - i, mg.y + mg.h - nojobs[i - 1], mg.x + mg.w - i, mg.y + mg.h, C.yellow(24));
      Fgl_line(mg.x + mg.w - i, mg.y + mg.h - starve[i], mg.x + mg.w - i, mg.y + mg.h, C.GRAPHS_B_COLOUR);
      Fgl_line(mg.x + mg.w - i, mg.y + mg.h - starve[i - 1], mg.x + mg.w - i, mg.y + mg.h, C.red(24));
      Fgl_setpixel(mg.x + mg.w - i, mg.y + mg.h - pop[i], C.GRAPHS_B_COLOUR);
      Fgl_setpixel(mg.x + mg.w - i, mg.y + mg.h - pop[i - 1], 7);
      Fgl_setpixel(mg.x + mg.w - i, mg.y + mg.h - ppool[i], C.GRAPHS_B_COLOUR);
      Fgl_setpixel(mg.x + mg.w - i, mg.y + mg.h - ppool[i - 1], C.cyan(24));
    }
    pop[i] = pop[i - 1];
    ppool[i] = ppool[i - 1];
    nojobs[i] = nojobs[i - 1];
    starve[i] = starve[i - 1];
  }
  if (G.tpopulation > 0) {
    if (draw) {
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - pop[0], C.GRAPHS_B_COLOUR);
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - starve[0], C.GRAPHS_B_COLOUR);
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - nojobs[0], C.GRAPHS_B_COLOUR);
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - ppool[0], C.GRAPHS_B_COLOUR);
    }
    // ((int) (log ((tpopulation / NUMOF_DAYS_IN_MONTH) + 1) * mg->h / 15)) - 5
    pop[0] = toInt(Math.log(idiv(G.tpopulation, C.NUMOF_DAYS_IN_MONTH) + 1) * mg.h / 15) - 5;
    if (pop[0] < 0) pop[0] = 0;
    // ((float) t / ((float) tpopulation + 1.0)) * 100.0: the float is promoted, the double result stored as float
    let f = f32((f32(G.tstarving_population) / (f32(G.tpopulation) + 1.0)) * 100.0);
    if (G.tpopulation > 3000) f = f32(f + f);
    if (G.tpopulation > 6000) f = f32(f + f);
    starve[0] = toInt(f);
    if (starve[0] >= mg.h) starve[0] = mg.h - 1;
    f = f32((f32(G.tunemployed_population) / (f32(G.tpopulation) + 1.0)) * 100.0);
    if (G.tpopulation > 3000) f = f32(f + f);
    if (G.tpopulation > 6000) f = f32(f + f);
    nojobs[0] = toInt(f);
    if (nojobs[0] >= mg.h) nojobs[0] = mg.h - 1;
    // ((int) (sqrt (people_pool + 1) * mg->h) / 35)
    ppool[0] = idiv(toInt(Math.sqrt(G.people_pool + 1) * mg.h), 35);
    if (ppool[0] < 0) ppool[0] = 0;
    if (ppool[0] >= mg.h) ppool[0] = mg.h - 1;
    if (draw) {
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - pop[0], 7);
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - starve[0], C.red(24));
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - nojobs[0], C.yellow(24));
      Fgl_setpixel(mg.x + mg.w, mg.y + mg.h - ppool[0], C.cyan(24));
    }
  }
}

/* ---- the market and port panels ---- */
export function clicked_market_cb(x: number, y: number): void {
  G.market_cb_flag = 1;
  G.mcbx = x;
  G.mcby = y;
}

export function draw_cb_box(row: number, col: number, checked: number): void {
  const mcb = scr.market_cb;
  const y = mcb.y + 4 + 4 * 8 + row * C.CB_SPACE;
  const x = mcb.x + 12 + col * 12 * 8;
  Fgl_putbox(x, y, 16, 16, checked ? GR.checked_box_graphic : GR.unchecked_box_graphic);
}

function draw_cb_template(is_market_cb: number): void {
  const mcb = scr.market_cb;
  const x = G.mcbx, y = G.mcby;
  Fgl_getbox(mcb.x, mcb.y, mcb.w, mcb.h, market_cb_gbuf);
  Fgl_fillbox(mcb.x, mcb.y, mcb.w, mcb.h, 28);
  draw_small_bezel(mcb.x + 4, mcb.y + 4, mcb.w - 8, mcb.h - 8, C.blue(0));
  Fgl_setfontcolors(28, C.TEXT_FG_COLOUR);
  if (is_market_cb) Fgl_write(mcb.x + 1 * 8, mcb.y + 8, 'Market');
  else Fgl_write(mcb.x + 3 * 8, mcb.y + 8, 'Port');
  Fgl_write(mcb.x + 7 * 8, mcb.y + 8, sprintf('%3d,%3d', x, y));
  Fgl_hline(mcb.x + 2, mcb.y + 20, mcb.x + mcb.w - 2, C.TEXT_FG_COLOUR);
  Fgl_write(mcb.x + 1 * 8, mcb.y + 3 * 8, 'Buy');
  Fgl_write(mcb.x + 12 * 8 + 4, mcb.y + 3 * 8 + 1, 'Sell');
  if (is_market_cb) Fgl_write(mcb.x + 6 * 8 + 4, mcb.y + 40 + C.CB_SPACE * 0, 'JOBS');
  Fgl_write(mcb.x + 6 * 8 + 4, mcb.y + 40 + C.CB_SPACE * 1, 'FOOD');
  Fgl_write(mcb.x + 6 * 8 + 4, mcb.y + 40 + C.CB_SPACE * 2, 'COAL');
  Fgl_write(mcb.x + 7 * 8, mcb.y + 40 + C.CB_SPACE * 3, 'ORE');
  Fgl_write(mcb.x + 6 * 8, mcb.y + 40 + C.CB_SPACE * 4, 'GOODS');
  Fgl_write(mcb.x + 6 * 8, mcb.y + 40 + C.CB_SPACE * 5, 'STEEL');
  const f = MI[IX(G.mcbx, G.mcby) + FLAGS];
  if (is_market_cb) {
    draw_cb_box(0, 0, f & C.FLAG_MB_JOBS);
    draw_cb_box(0, 1, f & C.FLAG_MS_JOBS);
  }
  draw_cb_box(1, 0, f & C.FLAG_MB_FOOD);
  draw_cb_box(1, 1, f & C.FLAG_MS_FOOD);
  draw_cb_box(2, 0, f & C.FLAG_MB_COAL);
  draw_cb_box(2, 1, f & C.FLAG_MS_COAL);
  draw_cb_box(3, 0, f & C.FLAG_MB_ORE);
  draw_cb_box(3, 1, f & C.FLAG_MS_ORE);
  draw_cb_box(4, 0, f & C.FLAG_MB_GOODS);
  draw_cb_box(4, 1, f & C.FLAG_MS_GOODS);
  draw_cb_box(5, 0, f & C.FLAG_MB_STEEL);
  draw_cb_box(5, 1, f & C.FLAG_MS_STEEL);
}

export function draw_market_cb(): void {
  G.market_cb_drawn_flag = 1;
  draw_cb_template(1);
}

export function close_market_cb(): void {
  const mcb = scr.market_cb;
  G.market_cb_flag = 0;
  G.market_cb_drawn_flag = 0;
  Fgl_putbox(mcb.x, mcb.y, mcb.w, mcb.h, market_cb_gbuf);
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  G.cs_mouse_button = C.LC_MOUSE_LEFTBUTTON;
}

export function clicked_port_cb(x: number, y: number): void {
  G.port_cb_flag = 1;
  G.mcbx = x;
  G.mcby = y;
}

export function draw_port_cb(): void {
  G.port_cb_drawn_flag = 1;
  draw_cb_template(0);
}

export function close_port_cb(): void {
  const mcb = scr.market_cb;
  G.port_cb_flag = 0;
  G.port_cb_drawn_flag = 0;
  Fgl_putbox(mcb.x, mcb.y, mcb.w, mcb.h, market_cb_gbuf);
  G.cs_mouse_button = C.LC_MOUSE_LEFTBUTTON;
}

/* ---- dialogs ---- */
export function yn_dial_box(s1: string, s2: string, s3: string, s4: string): number {
  const result = dialog_box(C.red(10), 7, 0, 0, s1, 0, 0, '', 0, 0, s2, 0, 0, s3, 0, 0, s4, 1, 121, 'Yes', 1, 110, 'No');
  return result === 121 ? 1 : 0;
}

/** fn: a message file (or with RESULTS the full path of the results file); xs: an extra line or null */
export function ok_dial_box(fn: string, good_bad: number, xs: string | null): void {
  if (G.suppress_ok_buttons !== 0) return;
  let colour: number;
  if (good_bad === C.GOOD || good_bad === C.RESULTS) colour = C.green(14);
  else if (good_bad === C.BAD) colour = C.red(12);
  else colour = C.white(12);
  let s = good_bad === C.RESULTS ? fn : PATHS.message_path + fn;
  let inf = fopen(s, 'rb');
  if (!inf) {
    console.log(`Can't open message <${s}> for OK dialog box`);
    s = `${PATHS.message_path}error.mes`;
    inf = fopen(s, 'rb');
    if (!inf) return;
  }
  let ss = '';
  for (let i = 0; i < inf.data.length; i++) ss += String.fromCharCode(inf.data[i]);
  // a NUL in the file ends the string
  const nul = ss.indexOf('\0');
  if (nul >= 0) ss = ss.slice(0, nul);
  ss = undosify_string(ss);
  display_info_message(colour, ss, xs);
}

function format_status_message(num_char: number, ss: string, xs: string | null): [string, string] {
  let src = ss;
  let si = 0;
  let tgt = '';
  let sm1 = '';
  let did_xs = 0;
  let did_sm2 = 0;
  let chars_done = 0;
  for (;;) {
    const src_c = si < src.length ? src[si] : '\0';
    si++;
    let ch: string | null = null;
    if (src_c === '\0') {
      if (did_xs || xs === null) return did_sm2 ? [sm1, tgt] : [tgt, ''];
      src = xs;
      si = 0;
      did_xs = 1;
      ch = ' ';
    } else if (src_c === '\n') ch = ' ';
    else ch = src_c;
    tgt += ch;
    if (++chars_done === num_char) {
      if (did_sm2) return [sm1, tgt];
      sm1 = tgt;
      tgt = '';
      did_sm2 = 1;
      chars_done = 0;
    }
  }
}

export function display_info_message(colour: number, ss: string, xs: string | null): void {
  if (G.suppress_popups) {
    const b = scr.status_message_1;
    const num_char = idiv(b.w, 9) - 1;
    const [sm1, sm2] = format_status_message(num_char, ss, xs);
    status_message(sm1, sm2);
  } else if (xs !== null) dialog_box(colour, 3, 0, 0, ss, 0, 0, xs, 2, 32, 'OK');
  else dialog_box(colour, 2, 0, 0, ss, 2, 32, 'OK');
}

let prog_flag = 0, oldpercent = 0;
export function prog_box(title: string, percent: number): void {
  const X0 = C.PROGBOXX, Y0 = C.PROGBOXY, PW = C.PROGBOXW, PH = C.PROGBOXH;
  if (prog_flag === 0) {
    hide_mouse();
    Fgl_getbox(X0 - 8, Y0 - 8, PW + 16, PH + 16, progbox);
    Fgl_fillbox(X0, Y0, PW, PH, C.PROGBOX_BG_COLOUR);
    for (let i = 1; i < 8; i++) {
      Fgl_hline(X0 - i, Y0 - i, X0 + PW + i - 1, C.PROGBOX_BG_COLOUR + i + i);
      Fgl_hline(X0 - i, Y0 + PH + i - 1, X0 + PW + i - 1, C.PROGBOX_BG_COLOUR + i + i);
      Fgl_line(X0 - i, Y0 - i, X0 - i, Y0 + PH + i - 1, C.PROGBOX_BG_COLOUR + i + i);
      Fgl_line(X0 + PW + i - 1, Y0 - i, X0 + PW + i - 1, Y0 + PH + i - 1, C.PROGBOX_BG_COLOUR + i + i);
    }
    Fgl_setfontcolors(C.PROGBOX_BG_COLOUR, C.TEXT_FG_COLOUR);
    Fgl_write(X0 + idiv(PW, 2) - title.length * 4, Y0 + 8, title);
    Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
    prog_flag = 1;
  }
  if (percent !== oldpercent) {
    const done = idiv((PW - 40) * percent, 100);
    Fgl_fillbox(X0 + 20, Y0 + 60, done, 20, C.PROGBOX_DONE_COL);
    Fgl_fillbox(X0 + 20 + done, Y0 + 60, PW - 40 - done, 20, C.PROGBOX_NOTDONE_COL);
    oldpercent = percent;
    Fgl_fillbox(X0 + idiv(PW, 2) - 20, Y0 + 24, 40, 16, C.PROGBOX_BG_COLOUR);
    Fgl_setfontcolors(C.PROGBOX_BG_COLOUR, C.TEXT_FG_COLOUR);
    Fgl_write(X0 + idiv(PW, 2) - 20, Y0 + 24, sprintf('%3d%%', percent));
    Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  }
  if (percent < 100) return;
  Fgl_putbox(X0 - 8, Y0 - 8, PW + 16, PH + 16, progbox);
  redraw_mouse();
  prog_flag = 0;
}

const SUST_BAR_H = 5;
const SUST_BAR_GAP_Y = 5;
function do_sust_barchart(draw: number): void {
  const mg = scr.monthgraph;
  if (draw) {
    Fgl_fillbox(mg.x, mg.y, mg.w, mg.h, 0);
    Fgl_setfontcolors(0, C.TEXT_FG_COLOUR);
    const labels = ['MIN', 'PRT', 'MNY', 'POP', 'TEC', 'FIR'];
    for (let k = 0; k < 6; k++) Fgl_write(mg.x + 3, mg.y + SUST_BAR_GAP_Y + k * (SUST_BAR_H + SUST_BAR_GAP_Y) - 1, labels[k]);
    Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
    Fgl_line(mg.x + 38, mg.y, mg.x + 38, mg.y + mg.h, C.yellow(24));
    const cols = [C.SUST_ORE_COAL_COL, C.SUST_PORT_COL, C.SUST_MONEY_COL, C.SUST_POP_COL, C.SUST_TECH_COL, C.SUST_FIRE_COL];
    for (let k = 0; k < 6; k++) Fgl_fillbox(mg.x + 36, mg.y + SUST_BAR_GAP_Y + k * (SUST_BAR_H + SUST_BAR_GAP_Y), 3, SUST_BAR_H, cols[k]);
  }
  if (G.sust_dig_ore_coal_count >= C.SUST_ORE_COAL_YEARS_NEEDED && G.sust_port_count >= C.SUST_PORT_YEARS_NEEDED
    && G.sust_old_money_count >= C.SUST_MONEY_YEARS_NEEDED && G.sust_old_population_count >= C.SUST_POP_YEARS_NEEDED
    && G.sust_old_tech_count >= C.SUST_TECH_YEARS_NEEDED && G.sust_fire_count >= C.SUST_FIRE_YEARS_NEEDED) {
    if (G.sustain_flag === 0) ok_dial_box('sustain.mes', C.GOOD, null);
    G.sustain_flag = 1;
  } else G.sustain_flag = 0;
  if (draw) {
    const step = SUST_BAR_H + SUST_BAR_GAP_Y;
    draw_sustline(0, G.sust_dig_ore_coal_count, C.SUST_ORE_COAL_YEARS_NEEDED, C.SUST_ORE_COAL_COL);
    draw_sustline(step, G.sust_port_count, C.SUST_PORT_YEARS_NEEDED, C.SUST_PORT_COL);
    draw_sustline(2 * step, G.sust_old_money_count, C.SUST_MONEY_YEARS_NEEDED, C.SUST_MONEY_COL);
    draw_sustline(3 * step, G.sust_old_population_count, C.SUST_POP_YEARS_NEEDED, C.SUST_POP_COL);
    draw_sustline(4 * step, G.sust_old_tech_count, C.SUST_TECH_YEARS_NEEDED, C.SUST_TECH_COL);
    draw_sustline(5 * step, G.sust_fire_count, C.SUST_FIRE_YEARS_NEEDED, C.SUST_FIRE_COL);
  }
}

function draw_sustline(yoffset: number, count: number, max: number, col: number): void {
  const mg = scr.monthgraph;
  const split = count >= max ? 60 : idiv(60 * count, max);
  Fgl_fillbox(mg.x + 38, mg.y + SUST_BAR_GAP_Y + yoffset, split, SUST_BAR_H, col);
  if (split < 60) Fgl_fillbox(mg.x + 38 + split + 1, mg.y + SUST_BAR_GAP_Y + yoffset, 60 - split, SUST_BAR_H, 0);
}

export function ask_launch_rocket_click(_x: number, _y: number): number {
  return yn_dial_box('ROCKET LAUNCH', 'You can launch the rocket now or wait until later.',
    'If you wait, it costs you *only* money to keep the', 'rocket ready.    Launch?');
}

export function ask_launch_rocket_now(_x: number, _y: number): number {
  return yn_dial_box('Rocket ready to launch', 'You can launch it now or wait until later.',
    'If you wait it will continue costing you money.', 'Launch it later by clicking on the rocket area.');
}

export function display_rocket_result_dialog(result: number): void {
  switch (result) {
    case C.ROCKET_LAUNCH_BAD: ok_dial_box('launch-fail.mes', C.BAD, null); break;
    case C.ROCKET_LAUNCH_GOOD: ok_dial_box('launch-good.mes', C.GOOD, null); break;
    case C.ROCKET_LAUNCH_EVAC: ok_dial_box('launch-evac.mes', C.GOOD, null); break;
  }
}

export function Fgl_getrect(r: { x: number; y: number; w: number; h: number }, buffer: Uint8Array): void {
  Fgl_getbox(r.x, r.y, r.w, r.h, buffer);
}
export function Fgl_putrect(r: { x: number; y: number; w: number; h: number }, buffer: Uint8Array): void {
  Fgl_putbox(r.x, r.y, r.w, r.h, buffer);
}

