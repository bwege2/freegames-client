// lchelp.c: the help system (and the menus, which are help pages): pages of text, icon and button lines
// drawn in the main window; "return" buttons end it and act on the page they came from.
import * as C from './consts.ts';
import { G, scr, PATHS, help_button_x, help_button_y, help_button_w, help_button_h, help_button_s,
  help_button_history, help_graphic, askdir_path } from './g.ts';
import { sscanf, isspace, idiv } from './c.ts';
import { Fgl_fillbox, Fgl_setfontcolors, Fgl_write, Fgl_putbox, Fgl_hline, Fgl_line } from './lcx11.ts';
import { mouse_in_rect, adjust_main_origin } from './geometry.ts';
import { refresh_main_screen, draw_big_mini_screen } from './screen.ts';
import { hide_mouse, redraw_mouse } from './mouse.ts';
import { set_selected_module } from './module_buttons.ts';
import { new_city } from './simulate.ts';
import { load_opening_city } from './ldsvgui.ts';
import { undosify_string } from './fileutil.ts';
import { fopen } from './stdio.ts';
import { do_error } from './main.ts';

export function activate_help(hp: string): void {
  G.help_flag = 1;
  G.help_history_count = 0;
  G.help_return_val = 0;
  Fgl_setfontcolors(C.HELPBACKGROUNDCOLOUR, C.TEXT_FG_COLOUR);
  draw_help_page(hp);
}

export function do_help_mouse(x: number, y: number, _mbutton: number): void {
  if (mouse_in_rect(scr.main_win, x, y)) {
    do_help_buttons(x, y);
    return;
  }
  if (G.block_help_exit) return;
  G.help_flag = 0;
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  refresh_main_screen();
}

function newCity(random: number): void {
  [G.main_screen_originx, G.main_screen_originy] = new_city(random);
  adjust_main_origin(G.main_screen_originx, G.main_screen_originy, 0);
}

export function draw_help_page(helppage: string): void {
  const mw = scr.main_win;
  if (helppage.startsWith('return')) {
    const v = sscanf(helppage.slice(6), '%d');
    if (v.length) G.help_return_val = v[0] as number;
    const from = G.help_history_count > 0 ? help_button_history[G.help_history_count - 1] : '';
    if (G.help_return_val === -1 && G.help_history_count > 1) {
      helppage = help_button_history[G.help_history_count - 2];
      G.help_history_count -= 2;
    } else {
      if (G.help_history_count > 0 && from === 'res.tmp') {
        switch (G.help_return_val) {
          case 1: set_selected_module(C.CST_RESIDENCE_LL); break;
          case 2: set_selected_module(C.CST_RESIDENCE_ML); break;
          case 3: set_selected_module(C.CST_RESIDENCE_HL); break;
          case 4: set_selected_module(C.CST_RESIDENCE_LH); break;
          case 5: set_selected_module(C.CST_RESIDENCE_MH); break;
          case 6: set_selected_module(C.CST_RESIDENCE_HH); break;
        }
      } else if (G.help_history_count > 0 && from === 'menu.hlp') {
        switch (G.help_return_val) {
          case 1: G.save_flag = 1; break;
          case 2: G.prefs_flag = 1; break;
          case 3: G.quit_flag = 1; break;
        }
      } else if (G.help_history_count > 0 && from === 'opening.hlp') {
        switch (G.help_return_val) {
          case -2: case -1: case 0: newCity(1); break;
          case 1: newCity(0); break;
          case 2: G.network_flag = 1; break;
        }
      } else if (G.help_history_count > 0 && from === 'newgame.hlp') {
        switch (G.help_return_val) {
          case 0: newCity(1); break;
          case 1: newCity(0); break;
          case 2: G.network_flag = 1; break;
        }
      } else if (G.help_history_count > 0 && from === 'openload.hlp') {
        switch (G.help_return_val) {
          case -2: case -1: case 0: newCity(1); break;
          case 1:
            redraw_mouse();
            load_opening_city('good_times.scn');
            adjust_main_origin(G.main_screen_originx, G.main_screen_originy, 0);
            hide_mouse();
            break;
          case 2:
            load_opening_city('bad_times.scn');
            adjust_main_origin(G.main_screen_originx, G.main_screen_originy, 0);
            break;
          case 9: G.load_flag = 1; break;
        }
      } else if (G.help_history_count > 0 && from === 'loadgame.hlp') {
        switch (G.help_return_val) {
          case 1:
            redraw_mouse();
            load_opening_city('good_times.scn');
            adjust_main_origin(G.main_screen_originx, G.main_screen_originy, 0);
            hide_mouse();
            break;
          case 2:
            load_opening_city('bad_times.scn');
            adjust_main_origin(G.main_screen_originx, G.main_screen_originy, 0);
            break;
          case 9: G.load_flag = 1; break;
        }
      }
      G.block_help_exit = 0;
      G.help_flag = 0;
      if (G.main_screen_flag === C.MAIN_SCREEN_EQUALS_MINI) G.main_screen_flag = C.MAIN_SCREEN_NORMAL_FLAG;
      Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
      refresh_main_screen();
      return;
    }
  }
  // continue_with_help:
  const helppage_short = helppage;
  if (helppage.startsWith('mini-screen.hlp')) draw_big_mini_screen();
  else if (helppage.startsWith('mini-in-main.hlp')) { /* nothing */ } else {
    let inf = fopen(`${PATHS.help_path}${helppage}`, 'r');
    if (!inf) {
      inf = fopen(`${PATHS.lc_save_dir}/${helppage}`, 'r');
      if (!inf) {
        inf = fopen(`${PATHS.help_path}${C.HELPERRORPAGE}`, 'r');
        if (!inf) { do_error('Help error'); return; }
      }
    }
    G.numof_help_buttons = 0;
    Fgl_fillbox(mw.x, mw.y, mw.w, mw.h, C.HELPBACKGROUNDCOLOUR);
    while (!inf.feof()) {
      const line = inf.fgets(C.MAX_HELP_LINE);
      if (line === null) break;
      parse_helpline(undosify_string(line));
    }
    if (helppage_short.startsWith('ask-dir.hlp')) {
      parse_helpline('tcolour 0 255');
      let y = 100;
      for (let i = 0; i < G.askdir_lines; i++) {
        parse_helpline(`text -1 ${y} ${askdir_path[i]}`);
        y += 14;
      }
    }
  }
  if (G.help_history_count > 0) {
    parse_helpline('tcolour 122 153');
    parse_helpline('tbutton 4 387 return-1 BACK');
  }
  parse_helpline('tcolour 188 153');
  parse_helpline('tbutton 370 387 return-2 OUT');
  parse_helpline('tcolour -1 -1');
  help_button_history[G.help_history_count] = helppage_short.slice(0, C.MAX_LENOF_HELP_FILENAME - 1);
  G.help_history_count++;
  if (G.help_history_count >= C.MAX_HELP_HISTORY) {
    for (let i = 0; i < C.MAX_HELP_HISTORY - 1; i++) help_button_history[i] = help_button_history[i + 1];
    G.help_history_count--;
  }
}

export function refresh_help_page(): void {
  G.help_history_count -= 1;
  draw_help_page(help_button_history[G.help_history_count]);
}

export function parse_helpline(s: string): void {
  if (s.startsWith('text')) parse_textline(s);
  else if (s.startsWith('icon')) parse_iconline(s);
  else if (s.startsWith('button')) parse_buttonline(s);
  else if (s.startsWith('tbutton')) parse_tbuttonline(s);
  else if (s.startsWith('tcolour')) parse_tcolourline(s);
}

function parse_tcolourline(st: string): void {
  const v = sscanf(st.slice(0, 99), 'tcolour %d %d');
  const f = v.length > 0 ? v[0] as number : 0;
  const b = v.length > 1 ? v[1] as number : 0;
  if (f < 0 || b < 0) Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  else Fgl_setfontcolors(b, f);
}

/** skip n words and the blanks after them; null if the line ends first */
function skipWords(st: string, n: number): string | null {
  let i = 0;
  for (let j = 0; j < n; j++) {
    while (i >= st.length || !isspace(st.charCodeAt(i))) {
      if (i >= st.length) return null;
      i++;
    }
    while (i < st.length && isspace(st.charCodeAt(i))) i++;
  }
  return st.slice(i);
}
const chomp = (st: string): string => (st.length > 0 && st.charCodeAt(st.length - 1) === 0xa ? st.slice(0, -1) : st);

function parse_textline(line: string): void {
  const mw = scr.main_win;
  const v = sscanf(line, 'text %d %d');
  let x = v.length > 0 ? v[0] as number : 0;
  const y = v.length > 1 ? v[1] as number : 0;
  let st = skipWords(line, 3);
  if (st === null) return;
  st = chomp(st);
  if (x < 0) {
    x = idiv(mw.w, 2) - st.length * 4;
    if (x < 0) return;
  } else x = x + idiv(mw.w - 440, 2);
  if (st.length * 8 > mw.w - x) return;
  Fgl_write(mw.x + x, mw.y + y, st);
}

function parse_iconline(line: string): void {
  const v = sscanf(line, 'icon %d %d');
  const x = v.length > 0 ? v[0] as number : 0;
  const y = v.length > 1 ? v[1] as number : 0;
  let st = skipWords(line, 3);
  if (st === null) return;
  st = chomp(st);
  draw_help_icon(x, y, st);
}

function draw_help_icon(x: number, y: number, icon: string): void {
  const mw = scr.main_win;
  const inf = fopen(PATHS.graphic_path + icon, 'rb');
  if (!inf) return;
  const l = inf.data.length;
  let w: number, h: number;
  if (l === 256) w = h = 16;
  else if (l === 1024) w = h = 32;
  else if (l === 2304) w = h = 48;
  else if (l === 4096) w = h = 64;
  else return;
  help_graphic.set(inf.data);
  x = x + idiv(mw.w - 440, 2);
  if (x > 0 && y > 0 && x + w < mw.w && y + h < mw.h) Fgl_putbox(mw.x + x, mw.y + y, w, h, help_graphic);
}

function parse_buttonline(line: string): void {
  const mw = scr.main_win;
  const v = sscanf(line, 'button %d %d %d %d');
  let x = v.length > 0 ? v[0] as number : 0;
  const y = v.length > 1 ? v[1] as number : 0;
  const w = v.length > 2 ? v[2] as number : 0;
  const h = v.length > 3 ? v[3] as number : 0;
  let st = skipWords(line, 5);
  if (st === null) return;
  st = chomp(st);
  if (x < 0) {
    x = idiv(mw.w, 2) - idiv(w, 2);
    if (x < 0) return;
  } else x = x + idiv(mw.w - 440, 2);
  if (x + w > mw.w) return;
  if (G.numof_help_buttons >= C.MAX_NUMOF_HELP_BUTTONS) return;
  const n = G.numof_help_buttons;
  help_button_x[n] = x + mw.x;
  help_button_y[n] = y + mw.y;
  help_button_w[n] = w;
  help_button_h[n] = h;
  if (st.length >= C.MAX_LENOF_HELP_FILENAME) return;
  help_button_s[n] = st;
  G.numof_help_buttons++;
  Fgl_hline(mw.x + x, mw.y + y, mw.x + x + w, C.HELPBUTTON_COLOUR);
  Fgl_hline(mw.x + x, mw.y + y + h, mw.x + x + w, C.HELPBUTTON_COLOUR);
  Fgl_line(mw.x + x, mw.y + y, mw.x + x, mw.y + y + h, C.HELPBUTTON_COLOUR);
  Fgl_line(mw.x + x + w, mw.y + y, mw.x + x + w, mw.y + y + h, C.HELPBUTTON_COLOUR);
}

function do_help_buttons(x: number, y: number): void {
  if (G.numof_help_buttons <= 0) return;
  for (let i = 0; i < G.numof_help_buttons; i++) {
    if (x > help_button_x[i] && x < help_button_x[i] + help_button_w[i]
      && y > help_button_y[i] && y < help_button_y[i] + help_button_h[i]) {
      hide_mouse();
      draw_help_page(help_button_s[i]);
      redraw_mouse();
      break;
    }
  }
}

function parse_tbuttonline(line: string): void {
  const v = sscanf(line.slice(0, 99), 'tbutton %d %d %s');
  let x = v.length > 0 ? v[0] as number : 0;
  const y = v.length > 1 ? v[1] as number : 0;
  const s = v.length > 2 ? v[2] as string : '';
  let st = skipWords(line, 4);
  if (st === null) return;
  st = chomp(st);
  if (x < 0) x -= 2;
  parse_textline(`text ${x + 2} ${y + 2} ${st}`);
  parse_buttonline(`button ${x} ${y} ${st.length * 8 + 4} 12 ${s}`);
}
