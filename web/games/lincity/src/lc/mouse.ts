// mouse.c: the mouse: clicks on the map and the buttons, the square cursor over the map, dragging
// transport ("multi-transport", mt_*), the market and port panels, bulldozing, the residence chooser,
// and the registry of mouse handlers.
import * as C from './consts.ts';
import { G, scr, under_square_mouse_pointer_top, under_square_mouse_pointer_left,
  under_square_mouse_pointer_right, under_square_mouse_pointer_bottom, PATHS, type Rect } from './g.ts';
import { MT, MG, MI, P, IX, FLAGS, I1, I2 } from './map.ts';
import { snprintf, idiv } from './c.ts';
import { Fgl_getbox, Fgl_putbox, Fgl_hline, Fgl_line } from './lcx11.ts';
import { main_groups, get_group_of_type, get_group_cost, get_type_cost, get_type_name } from './lintypes.ts';
import { mouse_in_rect, pixel_to_mappoint, pixel_to_winpoint, adjust_main_origin } from './geometry.ts';
import { refresh_main_screen, update_main_screen, connect_transport_main_screen, draw_main_window_box, status_message,
  print_total_money, yn_dial_box, ok_dial_box, close_market_cb, close_port_cb, clicked_market_cb, clicked_port_cb,
  draw_cb_box, ask_launch_rocket_click, advance_monthgraph_style, refresh_monthgraph, update_scoreboard } from './screen.ts';
import { place_item, bulldoze_item, do_bulldoze_area } from './engine.ts';
import { launch_rocket } from './modules.ts';
import { mps_set, mps_global_advance } from './mps.ts';
import { activate_help, do_help_mouse } from './lchelp.ts';
import { do_prefs_mouse } from './ldsvgui.ts';
import { pbar_mouse } from './pbar.ts';
import { window_results, do_error } from './main.ts';
import { fopen } from './stdio.ts';

interface MouseButton { mappoint_x: number; mappoint_y: number; x: number; y: number; r_mappoint_x: number;
  r_mappoint_y: number; r_x: number; r_y: number; pressed: number }
const buttons: MouseButton[] = Array.from({ length: C.NUM_BUTTONS }, () => ({
  mappoint_x: 0, mappoint_y: 0, x: 0, y: 0, r_mappoint_x: 0, r_mappoint_y: 0, r_x: 0, r_y: 0, pressed: 0,
}));
let mt_length = 0;
let mt_grp = 0;
let mt_name = '';
let mouse_buffer_fresh = 0;

export interface Mouse_Handle { r: Rect; handler: (x: number, y: number, b: number) => void; prev: Mouse_Handle | null; next: Mouse_Handle | null }
let mhandle_first: Mouse_Handle | null = null;
let mhandle_current: Mouse_Handle | null = null;

export function cs_mouse_handler(enc_button: number, dx: number, dy: number): void {
  let button = enc_button & ~C.LC_MOUSE_RELEASE & ~C.LC_MOUSE_PRESS;
  const button_pressed = enc_button & C.LC_MOUSE_PRESS;
  const button_released = enc_button & C.LC_MOUSE_RELEASE;
  const button_idx = button - 1;
  let x = G.cs_mouse_x;
  let y = G.cs_mouse_y;
  G.cs_mouse_x += dx;
  G.cs_mouse_y += dy;
  if (G.cs_mouse_x !== x || G.cs_mouse_y !== y) move_mouse(G.cs_mouse_x, G.cs_mouse_y);
  x = G.cs_mouse_x;
  y = G.cs_mouse_y;
  if (!G.mouse_initialized) return;
  if (button_pressed) {
    const b = buttons[button_idx];
    [, b.mappoint_x, b.mappoint_y] = pixel_to_mappoint(G.cs_mouse_x, G.cs_mouse_y);
    b.x = G.cs_mouse_x;
    b.y = G.cs_mouse_y;
    b.pressed = 1;
    if (!mouse_handle_click(x, y, button)) {
      switch (button) {
        case C.LC_MOUSE_LEFTBUTTON:
          if (G.market_cb_flag) { do_market_cb_mouse(x, y); break; }
          else if (G.port_cb_flag) { do_port_cb_mouse(x, y); break; }
          else if (G.help_flag) { do_help_mouse(x, y, button); break; }
          else if (G.prefs_flag) { do_prefs_mouse(x, y, button); break; }
          else if (G.load_flag || G.save_flag) return;
          if (mouse_in_rect(scr.main_win, x, y)) {
            do_mouse_main_win(x, y, button);
            refresh_main_screen();
            break;
          }
          if (G.main_screen_flag === C.MAIN_SCREEN_EQUALS_MINI) {
            G.main_screen_flag = C.MAIN_SCREEN_NORMAL_FLAG;
            refresh_main_screen();
          }
          do_mouse_other_buttons(x, y, button);
          break;
        case C.LC_MOUSE_RIGHTBUTTON:
        case C.LC_MOUSE_MIDDLEBUTTON:
          if (G.market_cb_flag) break;
          else if (G.port_cb_flag) break;
          else if (G.help_flag) break;
          else if (G.prefs_flag) break;
          else if (G.db_flag) break;
          else if (G.db_okflag) break;
          else if (G.load_flag || G.save_flag) return;
          if (G.main_screen_flag === C.MAIN_SCREEN_EQUALS_MINI) {
            G.main_screen_flag = C.MAIN_SCREEN_NORMAL_FLAG;
            refresh_main_screen();
          }
          if (mouse_in_rect(scr.main_win, x, y)) {
            do_mouse_main_win(x, y, button);
            refresh_main_screen();
            break;
          }
          do_mouse_other_buttons(x, y, button);
          break;
        default:
          console.log('Unknown mouse button in cs_mouse_handler');
      }
    }
  } else if (button_released) {
    button = enc_button - 16;
    const b = buttons[button_idx];
    [, b.r_mappoint_x, b.r_mappoint_y] = pixel_to_mappoint(G.cs_mouse_x, G.cs_mouse_y);
    b.r_x = G.cs_mouse_x;
    b.r_y = G.cs_mouse_y;
    b.pressed = 0;
    if (button === C.LC_MOUSE_LEFTBUTTON) mt_draw(G.cs_mouse_x, G.cs_mouse_y, C.MT_SUCCESS);
    button = 0;
  } else {
    if (buttons[C.LC_MOUSE_LEFTBUTTON - 1].pressed && C.GROUP_IS_TRANSPORT(G.selected_module_group)) {
      mt_draw(G.cs_mouse_x, G.cs_mouse_y, C.MT_CONTINUE);
    }
  }
  G.cs_mouse_button = button;
}

export function move_mouse(x: number, y: number): void {
  const mw = scr.main_win;
  const size = main_groups[G.selected_module_group].size * 16;
  if (mouse_in_rect(scr.main_win, x, y) && G.market_cb_flag === 0 && G.port_cb_flag === 0 && G.prefs_flag === 0
    && G.help_flag === 0 && G.db_flag === 0 && G.db_okflag === 0) {
    if (x > mw.x + mw.w - size) x = mw.x + mw.w - size;
    if (y > mw.y + mw.h - size) y = mw.y + mw.h - size;
    const mwoffset_x = mw.x % 16;
    const mwoffset_y = mw.y % 16;
    x -= mwoffset_x;
    y -= mwoffset_y;
    x &= 0xff0;
    y &= 0xff0;
    x += mwoffset_x;
    y += mwoffset_y;
    hide_mouse();
    G.mouse_hide_count--;
    draw_square_mouse(x, y, size);
  } else {
    hide_mouse();
    G.mouse_hide_count--;
    draw_normal_mouse(x, y);
    if (G.mappoint_stats_flag !== 0 && G.market_cb_flag === 0 && G.port_cb_flag === 0) {
      G.mappoint_stats_flag = 0;
      update_scoreboard.mps = 1;
    }
  }
}

export function hide_mouse(): void {
  G.mouse_hide_count++;
  if (G.mouse_hide_count === 1) {
    if (G.mouse_type === C.MOUSE_TYPE_SQUARE) hide_square_mouse();
    // hide_normal_mouse(): the X pointer is the server's
  }
}

export function redraw_mouse(): void {
  G.mouse_hide_count--;
  if (G.mouse_hide_count > 0) return;
  G.mouse_hide_count = 0;
  if (G.mouse_type === C.MOUSE_TYPE_SQUARE) redraw_square_mouse();
}

function squareOutline(x: number, y: number, size: number): void {
  Fgl_getbox(x - 2, y - 2, size + 4, 2, under_square_mouse_pointer_top);
  Fgl_getbox(x - 2, y, 2, size, under_square_mouse_pointer_left);
  Fgl_getbox(x + size, y, 2, size, under_square_mouse_pointer_right);
  Fgl_getbox(x - 2, y + size, size + 4, 2, under_square_mouse_pointer_bottom);
  mouse_buffer_fresh = 1;
  Fgl_hline(x - 2, y - 2, x + size + 1, C.yellow(31));
  Fgl_hline(x - 1, y - 1, x + size, C.blue(31));
  Fgl_hline(x - 2, y + size + 1, x + size + 1, C.yellow(31));
  Fgl_hline(x - 1, y + size, x + size, C.blue(31));
  Fgl_line(x - 2, y - 1, x - 2, y + size + 1, C.yellow(31));
  Fgl_line(x - 1, y, x - 1, y + size, C.blue(31));
  Fgl_line(x + size + 1, y - 1, x + size + 1, y + size + 1, C.yellow(31));
  Fgl_line(x + size, y, x + size, y + size, C.blue(31));
}

export function draw_square_mouse(x: number, y: number, size: number): void {
  if (G.mouse_type === C.MOUSE_TYPE_NORMAL) {
    G.mouse_type = C.MOUSE_TYPE_SQUARE;
    G.kmouse_val = 16;
  }
  G.omx = x;
  G.omy = y;
  squareOutline(x, y, size);
}

export function hide_square_mouse(): void {
  const size = main_groups[G.selected_module_group].size * 16;
  if (mouse_buffer_fresh) {
    Fgl_putbox(G.omx - 2, G.omy - 2, size + 4, 2, under_square_mouse_pointer_top);
    Fgl_putbox(G.omx - 2, G.omy, 2, size, under_square_mouse_pointer_left);
    Fgl_putbox(G.omx + size, G.omy, 2, size, under_square_mouse_pointer_right);
    Fgl_putbox(G.omx - 2, G.omy + size, size + 4, 2, under_square_mouse_pointer_bottom);
    mouse_buffer_fresh = 0;
  }
}

function redraw_square_mouse(): void {
  const size = main_groups[G.selected_module_group].size * 16;
  squareOutline(G.omx, G.omy, size);
}

export function draw_normal_mouse(x: number, y: number): void {
  if (G.mouse_type === C.MOUSE_TYPE_SQUARE) {
    hide_square_mouse();
    G.mouse_type = C.MOUSE_TYPE_NORMAL;
    G.kmouse_val = 8;
  }
  G.mox = x;
  G.moy = y;
}

export function do_mouse_main_win(px: number, py: number, button: number): void {
  const mw = scr.main_win;
  if (button === C.LC_MOUSE_MIDDLEBUTTON) return;
  let [, x, y] = pixel_to_mappoint(px, py);
  let mod_x: number, mod_y: number;
  if (MT[P(x, y)] === C.CST_USED) {
    mod_x = MI[IX(x, y) + I1];
    mod_y = MI[IX(x, y) + I2];
  } else {
    mod_x = x;
    mod_y = y;
  }
  if (button === C.LC_MOUSE_RIGHTBUTTON) {
    mps_set(mod_x, mod_y, C.MPS_ENV);
    return;
  }
  if (button === C.LC_MOUSE_LEFTBUTTON) {
    if (MT[P(mod_x, mod_y)] >= C.CST_ROCKET_5 && MT[P(mod_x, mod_y)] <= C.CST_ROCKET_7) {
      if (ask_launch_rocket_click(mod_x, mod_y)) launch_rocket(mod_x, mod_y);
    }
  }
  if (button === C.LC_MOUSE_LEFTBUTTON && C.GROUP_IS_TRANSPORT(G.selected_module_group)) {
    if (mt_draw(px, py, C.MT_START)) {
      mps_set(mod_x, mod_y, C.MPS_MAP);
      return;
    }
  }
  if (G.selected_module_type === C.CST_GREEN && button !== C.LC_MOUSE_RIGHTBUTTON) {
    check_bulldoze_area(x, y);
    return;
  }
  if (MT[P(x, y)] !== C.CST_GREEN) {
    const mps_result = mps_set(mod_x, mod_y, C.MPS_MAP);
    if (mps_result >= 1) {
      if (MG[P(mod_x, mod_y)] === C.GROUP_MARKET) {
        clicked_market_cb(mod_x, mod_y);
        return;
      } else if (MG[P(mod_x, mod_y)] === C.GROUP_PORT) {
        clicked_port_cb(mod_x, mod_y);
        return;
      }
    }
    return;
  }
  const size = main_groups[G.selected_module_group].size;
  if (px > mw.x + mw.w - size * 16) px = mw.x + mw.w - size * 16;
  if (py > mw.y + mw.h - size * 16) py = mw.y + mw.h - size * 16;
  [, x, y] = pixel_to_mappoint(px, py);
  const g = (a: number, b: number): boolean => MT[P(a, b)] !== C.CST_GREEN;
  if (size >= 2) {
    if (g(x + 1, y) || g(x, y + 1) || g(x + 1, y + 1)) return;
  }
  if (size >= 3) {
    if (g(x + 2, y) || g(x + 2, y + 1) || g(x + 2, y + 2) || g(x + 1, y + 2) || g(x, y + 2)) return;
  }
  if (size === 4) {
    if (g(x + 3, y) || g(x + 3, y + 1) || g(x + 3, y + 2) || g(x + 3, y + 3) || g(x + 2, y + 3) || g(x + 1, y + 3)
      || g(x, y + 3)) return;
  }
  switch (place_item(x, y, G.selected_module_type)) {
    case 0: break;
    case -1: no_credit_build_msg(G.selected_module_group); break;
    case -2:
      if (yn_dial_box('WARNING', 'Ports need to be', 'connected to rivers!', 'Want to make a cup of tea?') !== 0) {
        while (yn_dial_box('TEA BREAK', 'Boil->pour->wait->stir', 'stir->pour->stir->wait->drink...ahhh',
          'Have you finished yet?') === 0);
      }
      break;
  }
}

function do_mouse_other_buttons(x: number, y: number, button: number): void {
  const mw = scr.main_win;
  const R = button === C.LC_MOUSE_RIGHTBUTTON;
  if (x >= mw.x - 8 && x < mw.x + mw.w + 8 && y >= mw.y - 8 && y < mw.y) {
    adjust_main_origin(G.main_screen_originx, G.main_screen_originy - (R ? C.RIGHT_MOUSE_MOVE_VAL : 1), 1);
  } else if (x >= mw.x - 8 && x < mw.x + mw.w + 8 && y > mw.y + mw.h && y < mw.y + mw.h + 16) {
    adjust_main_origin(G.main_screen_originx, G.main_screen_originy + (R ? C.RIGHT_MOUSE_MOVE_VAL : 1), 1);
  } else if (x >= mw.x - 16 && x < mw.x && y >= mw.y - 8 && y < mw.y + mw.h + 8) {
    adjust_main_origin(G.main_screen_originx - (R ? C.RIGHT_MOUSE_MOVE_VAL : 1), G.main_screen_originy, 1);
  } else if (x > mw.x + mw.w && x < mw.x + mw.w + 8 && y > mw.y - 8 && y < mw.y + mw.w + 8) {
    // (sic) mw->w in the y test
    adjust_main_origin(G.main_screen_originx + (R ? C.RIGHT_MOUSE_MOVE_VAL : 1), G.main_screen_originy, 1);
  } else if (mouse_in_rect(scr.menu_button, x, y)) {
    activate_help('menu.hlp');
  } else if (mouse_in_rect(scr.help_button, x, y)) {
    activate_help('index.hlp');
  } else if (mouse_in_rect(scr.results_button, x, y)) {
    if (R) return;
    window_results();
  } else if (mouse_in_rect(scr.mappoint_stats, x, y)) {
    if (R) {
      switch (G.mps_global_style) {
        case C.MPS_GLOBAL_FINANCE: activate_help('finance.hlp'); break;
        case C.MPS_GLOBAL_OTHER_COSTS: activate_help('other-costs.hlp'); break;
        case C.MPS_GLOBAL_HOUSING: activate_help('housing.hlp'); break;
      }
      return;
    }
    mps_global_advance();
  } else if (mouse_in_rect(scr.monthgraph, x, y)) {
    if (R) {
      activate_help(G.monthgraph_style === C.MONTHGRAPH_STYLE_ECONOMY ? 'economy.hlp' : 'sustain.hlp');
      return;
    }
    advance_monthgraph_style();
    refresh_monthgraph();
  }
  if (mouse_in_rect(scr.pbar_area, x, y)) {
    pbar_mouse(x, y, button);
    return;
  }
}

function check_bulldoze_area(x: number, y: number): void {
  let xx: number, yy: number;
  if (MT[P(x, y)] === C.CST_USED) {
    xx = MI[IX(x, y) + I1];
    yy = MI[IX(x, y) + I2];
  } else {
    xx = x;
    yy = y;
  }
  const g = MG[P(xx, yy)];
  if (g === C.GROUP_MONUMENT && G.monument_bul_flag === 0) {
    if (yn_dial_box('WARNING', 'Bulldozing a monument costs', 'a lot of money.', 'Want to bulldoze?') === 0) return;
    G.monument_bul_flag = 1;
  } else if (g === C.GROUP_RIVER && G.river_bul_flag === 0) {
    if (yn_dial_box('WARNING', 'Bulldozing a section of river', 'costs a lot of money.', 'Want to bulldoze?') === 0) return;
    G.river_bul_flag = 1;
  } else if (g === C.GROUP_SHANTY && G.shanty_bul_flag === 0) {
    if (yn_dial_box('WARNING', 'Bulldozing a shanty town costs a', 'lot of money and may cause a fire.',
      'Want to bulldoze?') === 0) return;
    G.shanty_bul_flag = 1;
  } else if (g === C.GROUP_TIP) {
    ok_dial_box('nobull-tip.mes', C.BAD, null);
    return;
  }
  bulldoze_item(xx, yy);
}

export function fire_area(x: number, y: number): void {
  do_bulldoze_area(C.CST_FIRE_1, x, y);
  refresh_main_screen();
}

export function drag_screen(): void {
  const mid = buttons[C.LC_MOUSE_MIDDLEBUTTON - 1];
  if (mid.mappoint_x === 0) return;
  pixel_to_mappoint(G.cs_mouse_x, G.cs_mouse_y);
  const [, wx, wy] = pixel_to_winpoint(G.cs_mouse_x, G.cs_mouse_y);
  adjust_main_origin(mid.mappoint_x - wx, mid.mappoint_y - wy, 1);
}

function do_market_cb_template(x: number, y: number, is_market_cb: number): void {
  const mcb = scr.market_cb;
  let is_sell: number;
  hide_mouse();
  if (!mouse_in_rect(mcb, x, y)) {
    if (is_market_cb) close_market_cb();
    else close_port_cb();
    redraw_mouse();
    return;
  }
  if (x >= mcb.x + 8 && x <= mcb.x + 6 * 8) is_sell = 0;
  else if (x >= mcb.x + 10 * 8 && x <= mcb.x + mcb.w - 8) is_sell = 1;
  else {
    redraw_mouse();
    return;
  }
  const rows = [[C.FLAG_MB_JOBS, C.FLAG_MS_JOBS], [C.FLAG_MB_FOOD, C.FLAG_MS_FOOD], [C.FLAG_MB_COAL, C.FLAG_MS_COAL],
    [C.FLAG_MB_ORE, C.FLAG_MS_ORE], [C.FLAG_MB_GOODS, C.FLAG_MS_GOODS], [C.FLAG_MB_STEEL, C.FLAG_MS_STEEL]];
  for (let r = is_market_cb ? 0 : 1; r < 6; r++) {
    if (y >= mcb.y + 36 + C.CB_SPACE * r && y <= mcb.y + 52 + C.CB_SPACE * r) {
      const flag = rows[r][is_sell];
      const i = IX(G.mcbx, G.mcby) + FLAGS;
      MI[i] ^= flag;
      draw_cb_box(r, is_sell, MI[i] & flag);
      break;
    }
  }
  redraw_mouse();
}
export const do_market_cb_mouse = (x: number, y: number): void => do_market_cb_template(x, y, 1);
export const do_port_cb_mouse = (x: number, y: number): void => do_market_cb_template(x, y, 0);

export function no_credit_build_msg(selected_group: number): void {
  if (selected_group === C.GROUP_UNIVERSITY) ok_dial_box('no-credit-university.mes', C.BAD, null);
  else if (selected_group === C.GROUP_PARKLAND) ok_dial_box('no-credit-parkland.mes', C.BAD, null);
  else if (selected_group === C.GROUP_RECYCLE) ok_dial_box('no-credit-recycle.mes', C.BAD, null);
  else if (selected_group === C.GROUP_ROCKET) ok_dial_box('no-credit-rocket.mes', C.BAD, null);
}

export function choose_residence(): void {
  const tempfile = fopen(`${PATHS.lc_save_dir}/res.tmp`, 'w');
  if (!tempfile) { do_error("Can't write res.tmp"); return; }
  const p = (fmt: string, ...a: number[]): void => tempfile.fprintf(fmt, ...a);
  p('text -1 20 Choose the type of residence you want\n');
  p('text -1 30 =====================================\n');
  p('text -1 45 (LB=Low Birthrate HB=High Birthrate)\n');
  p('text -1 55 (LD=Low Deathrate HD=High Deathrate)\n');
  p('text -1 85 Low Tech\n');
  p('text 68 106 Cost %4d\n', get_group_cost(C.GROUP_RESIDENCE_LL));
  p('icon 85 120 reslowlow.csi\n');
  p('button 83 118 52 52 return1\n');
  p('tbutton 82 180 return1 pop 50\n');
  p('text 89 195 LB HD\n');
  p('text 155 106 Cost %4d\n', get_group_cost(C.GROUP_RESIDENCE_ML));
  p('icon 170 120 resmedlow.csi\n');
  p('button 168 118 52 52 return2\n');
  p('tbutton 164 180 return2 pop 100\n');
  p('text 175 195 HB LD\n');
  p('text 238 106 Cost %4d\n', get_group_cost(C.GROUP_RESIDENCE_HL));
  p('icon 255 120 reshilow.csi\n');
  p('button 253 118 52 52 return3\n');
  p('tbutton 250 180 return3 pop 200\n');
  p('text 261 195 HB HD\n');
  p('text -1 215 Click on one to select\n');
  p('text -1 225 ======================\n');
  if (idiv(Math.imul(G.tech_level, 10), C.MAX_TECH_LEVEL) > 2) {
    p('text -1 255 High Tech\n');
    p('text 68 276 Cost %4d\n', get_group_cost(C.GROUP_RESIDENCE_LH));
    p('icon 85 290 reslowhi.csi\n');
    p('button 83 288 52 52 return4\n');
    p('tbutton 78 350 return4 pop 100\n');
    p('text 89 365 LB HD\n');
    p('text 155 276 Cost %4d\n', get_group_cost(C.GROUP_RESIDENCE_MH));
    p('icon 170 290 resmedhi.csi\n');
    p('button 168 288 52 52 return5\n');
    p('tbutton 164 350 return5 pop 200\n');
    p('text 175 365 HB LD\n');
    p('text 238 276 Cost %4d\n', get_group_cost(C.GROUP_RESIDENCE_HH));
    p('icon 255 290 reshihi.csi\n');
    p('button 253 288 52 52 return6\n');
    p('tbutton 250 350 return6 pop 400\n');
    p('text 261 365 HB HD\n');
  }
  tempfile.fclose();
  G.block_help_exit = 1;
  activate_help('res.tmp');
}

/* ---- multi-transport ---- */
function mt_erase(x: number, y: number): number {
  if (x < 0 || y < 0 || x >= C.WORLD_SIDE_LEN || y >= C.WORLD_SIDE_LEN) return 1;
  const i = IX(x, y) + FLAGS;
  if (MI[i] & C.FLAG_MULTI_TRANSPORT) {
    if (MI[i] & C.FLAG_IS_TRANSPORT) {
      if (!(MI[i] & C.FLAG_MULTI_TRANS_PREV)) {
        if (mt_grp === C.GROUP_TRACK) { MT[P(x, y)] = C.CST_ROAD_LR; MG[P(x, y)] = C.GROUP_ROAD; }
        else { MT[P(x, y)] = C.CST_TRACK_LR; MG[P(x, y)] = C.GROUP_TRACK; }
      } else if (mt_grp === C.GROUP_RAIL) { MT[P(x, y)] = C.CST_ROAD_LR; MG[P(x, y)] = C.GROUP_ROAD; }
      else { MT[P(x, y)] = C.CST_RAIL_LR; MG[P(x, y)] = C.GROUP_RAIL; }
    } else {
      MT[P(x, y)] = C.CST_GREEN;
      MG[P(x, y)] = C.GROUP_BARE;
    }
    MI[i] &= ~C.FLAG_MULTI_TRANSPORT;
    return 1;
  } else if ((MI[i] & C.FLAG_IS_TRANSPORT) && mt_grp === MG[P(x, y)]) return 1;
  return 0;
}

function mt_temp(x: number, y: number): number {
  if (x < 0 || y < 0 || x >= C.WORLD_SIDE_LEN || y >= C.WORLD_SIDE_LEN) return 1;
  const i = IX(x, y) + FLAGS;
  if (MI[i] & C.FLAG_IS_TRANSPORT) {
    if (MG[P(x, y)] === mt_grp) return 1;
    else if (!G.overwrite_transport_flag) return 0;
    if (MG[P(x, y)] === C.GROUP_TRACK || (MG[P(x, y)] === C.GROUP_ROAD && mt_grp === C.GROUP_TRACK)) MI[i] &= ~C.FLAG_MULTI_TRANS_PREV;
    else MI[i] |= C.FLAG_MULTI_TRANS_PREV;
    mt_length++;
    MT[P(x, y)] = G.selected_module_type;
    MG[P(x, y)] = mt_grp;
    MI[i] |= C.FLAG_MULTI_TRANSPORT;
    return 1;
  } else if (MG[P(x, y)] === C.GROUP_BARE) {
    mt_length++;
    MT[P(x, y)] = G.selected_module_type;
    MG[P(x, y)] = mt_grp;
    MI[i] |= C.FLAG_MULTI_TRANSPORT;
    return 1;
  }
  return 0;
}

function mt_perm(x: number, y: number): number {
  if (x < 0 || y < 0 || x >= C.WORLD_SIDE_LEN || y >= C.WORLD_SIDE_LEN) return 1;
  if (MI[IX(x, y) + FLAGS] & C.FLAG_IS_TRANSPORT) {
    if (MG[P(x, y)] === mt_grp) return 1;
    else if (!G.overwrite_transport_flag) return 0;
    bulldoze_item(x, y);
    place_item(x, y, G.selected_module_type);
    return 1;
  } else if (MG[P(x, y)] === C.GROUP_BARE) {
    place_item(x, y, G.selected_module_type);
    return 1;
  }
  return 0;
}

function do_mt_draw(x1: number, x2: number, y1: number, y2: number, mode: (x: number, y: number) => number): number {
  let dir = 1;
  let horiz = 1;
  let vert = 2;
  const x_dir = cmp(x1, x2);
  const y_dir = cmp(y1, y2);
  let ix = x1;
  let iy = y1;
  mt_length = 0;
  if (!mode(ix, iy)) return 0;
  while ((ix !== x2 || iy !== y2) && dir) {
    if (dir === 1) {
      if (ix === x2) {
        horiz = 0;
        dir = vert;
      } else if (mode(ix + x_dir, iy)) {
        horiz = 1;
        vert = 2;
        ix += x_dir;
      } else {
        horiz = 0;
        dir = vert;
      }
    } else if (dir === 2) {
      if (iy === y2) {
        vert = 0;
        dir = horiz;
      } else if (mode(ix, iy + y_dir)) {
        horiz = 1;
        vert = 2;
        iy += y_dir;
      } else {
        vert = 0;
        dir = horiz;
      }
    }
  }
  return dir ? 1 : 0;
}

let mt_dx = 0, mt_dy = 0, mt_ox = 0, mt_oy = 0;
export function mt_draw(cxp: number, cyp: number, flag: number): number {
  let draw_ret: number;
  if (flag !== C.MT_START && !G.mt_flag) return 0;
  const [, cx, cy] = pixel_to_mappoint(cxp, cyp);
  switch (flag) {
    case C.MT_SUCCESS:
      if (mt_ox === 0) return 0;
      draw_ret = do_mt_draw(mt_ox, mt_dx, mt_oy, mt_dy, mt_erase);
      if (!draw_ret) {
        G.mt_flag = 0;
        draw_main_window_box(C.green(8));
        status_message(null, null);
      } else if ((draw_ret = do_mt_draw(mt_ox, cx, mt_oy, cy, mt_perm))) {
        print_total_money();
        G.mt_flag = 0;
        draw_main_window_box(C.green(8));
        status_message(null, null);
      } else {
        G.mt_flag = 0;
        status_message(null, null);
        draw_main_window_box(C.green(8));
      }
      mt_dx = 0; mt_dy = 0;
      mt_ox = 0; mt_oy = 0;
      break;
    case C.MT_FAIL:
      G.mt_flag = 0;
      draw_main_window_box(C.green(8));
      do_mt_draw(mt_ox, mt_dx, mt_oy, mt_dy, mt_erase);
      status_message(null, null);
      mt_dx = 0; mt_dy = 0;
      mt_ox = 0; mt_oy = 0;
      break;
    case C.MT_CONTINUE: {
      if ((mt_dx === cx && mt_dy === cy) || mt_ox === 0) return 0;
      do_mt_draw(mt_ox, mt_dx, mt_oy, mt_dy, mt_erase);
      draw_ret = do_mt_draw(mt_ox, cx, mt_oy, cy, mt_temp);
      let s: string;
      if (!draw_ret) {
        do_mt_draw(mt_ox, cx, mt_oy, cy, mt_erase);
        s = snprintf(79, "Can't build %s over that!", mt_name);
      } else {
        s = snprintf(79, '%d sections of %s will cost %3d to build', mt_length, mt_name,
          Math.imul(mt_length, get_type_cost(G.selected_module_type)));
      }
      status_message(null, s);
      mt_dx = cx; mt_dy = cy;
      break;
    }
    case C.MT_START:
      if ((mt_grp = get_group_of_type(G.selected_module_type)) < 0) return 0;
      mt_name = get_type_name(G.selected_module_type);
      mt_dx = mt_dy = 0;
      mt_ox = buttons[C.LC_MOUSE_LEFTBUTTON - 1].mappoint_x;
      mt_oy = buttons[C.LC_MOUSE_LEFTBUTTON - 1].mappoint_y;
      draw_ret = do_mt_draw(mt_ox, cx, mt_oy, cy, mt_temp);
      if (!draw_ret) {
        do_mt_draw(mt_ox, cx, mt_oy, cy, mt_erase);
        return 0;
      }
      mt_dx = cx;
      mt_dy = cy;
      G.mt_flag = 1;
      draw_main_window_box(C.cyan(20));
      break;
  }
  connect_transport_main_screen();
  update_main_screen(0);
  return 1;
}

export const cmp = (n1: number, n2: number): number => (n1 !== n2 ? (n1 < n2 ? 1 : -1) : 0);

/* ---- the registry ---- */
export function init_mouse_registry(): void {
  mhandle_first = null;
  mhandle_current = null;
}

export function mouse_register(r: Rect, handler: (x: number, y: number, b: number) => void): Mouse_Handle {
  const h: Mouse_Handle = { r, handler, prev: null, next: null };
  if (mhandle_first !== null) {
    h.next = mhandle_first;
    mhandle_first.prev = h;
  }
  mhandle_first = h;
  mhandle_current = h;
  return h;
}

export function mouse_unregister(mhandle: Mouse_Handle): void {
  if (mhandle.prev === null) {
    if (mhandle.next !== null) {
      mhandle_first = mhandle.next;
      mhandle_first.prev = null;
    } else mhandle_first = null;
  } else if (mhandle.next === null) mhandle.prev.next = null;
  else {
    mhandle.prev.next = mhandle.next;
    mhandle.next.prev = mhandle.prev;
  }
}

function mouse_handle_click(x: number, y: number, button: number): number {
  mhandle_current = mhandle_first;
  while (mhandle_current !== null) {
    if (mouse_in_rect(mhandle_current.r, x, y)) {
      mhandle_current.handler(x - mhandle_current.r.x, y - mhandle_current.r.y, button);
      return 1;
    }
    mhandle_current = mhandle_current.next;
  }
  return 0;
}

