// ldsvgui.c: the load and save screens (nine numbered scenes in ~/.lincity, named "N_comment"), the
// preferences screen and the line editor for the scene's comment.
import * as C from './consts.ts';
import { G, GR, scr, PATHS } from './g.ts';
import { sprintf, isalnum } from './c.ts';
import { Fgl_fillbox, Fgl_setfontcolors, Fgl_write, Fgl_putbox, Fgl_hline, Fgl_line, call_event } from './lcx11.ts';
import { mouse_in_rect } from './geometry.ts';
import { hide_mouse, redraw_mouse, cs_mouse_handler } from './mouse.ts';
import { refresh_main_screen, yn_dial_box } from './screen.ts';
import { refresh_pbars } from './pbar.ts';
import { update_avail_modules } from './module_buttons.ts';
import { save_lincityrc } from './fileutil.ts';
import { save_city, load_city, load_saved_city, remove_scene, verify_city } from './ldsvguts.ts';
import { vfsList, directoryExists } from './stdio.ts';
import { get_real_time } from './timer.ts';

/** char save_names[10][42] */
const save_names: string[] = new Array(10).fill('');

function draw_prefs_cb(): void {
  const mw = scr.main_win;
  const x = mw.x + 50;
  let y = mw.y + 30;
  Fgl_putbox(x, y, 16, 16, G.overwrite_transport_flag ? GR.checked_box_graphic : GR.unchecked_box_graphic);
  y += 16;
  Fgl_putbox(x, y, 16, 16, G.suppress_popups ? GR.unchecked_box_graphic : GR.checked_box_graphic);
  y += 16;
  Fgl_putbox(x, y, 16, 16, G.time_multiplex_stats ? GR.checked_box_graphic : GR.unchecked_box_graphic);
  y += 16;
  Fgl_putbox(x, y, 16, 16, G.confine_flag ? GR.checked_box_graphic : GR.unchecked_box_graphic);
}

function do_prefs_buttons(x: number, y: number): void {
  const mw = scr.main_win;
  if (x > mw.x + 50 && x < mw.x + 50 + 16) {
    if (y > mw.y + 30 && y < mw.y + 30 + 16) {
      hide_mouse();
      G.overwrite_transport_flag = G.overwrite_transport_flag ? 0 : 1;
      draw_prefs_cb();
      redraw_mouse();
    } else if (y > mw.y + 30 + 16 && y < mw.y + 30 + 2 * 16) {
      hide_mouse();
      G.suppress_popups = G.suppress_popups ? 0 : 1;
      draw_prefs_cb();
      redraw_mouse();
    } else if (y > mw.y + 30 + 2 * 16 && y < mw.y + 30 + 3 * 16) {
      hide_mouse();
      G.time_multiplex_stats = G.time_multiplex_stats ? 0 : 1;
      draw_prefs_cb();
      redraw_mouse();
    } else if (y > mw.y + 30 + 3 * 16 && y < mw.y + 30 + 4 * 16) {
      hide_mouse();
      // set_pointer_confinement(): the browser keeps the pointer where the user moves it
      G.confine_flag = G.confine_flag ? 0 : 1;
      draw_prefs_cb();
      redraw_mouse();
    }
  }
  const outx = 370, outy = 387, outh = 12, outw = 3 * 8 + 4;
  if (x > mw.x + outx && x < mw.x + outx + outw && y > mw.y + outy && y < mw.y + outy + outh) {
    close_prefs_screen();
    refresh_main_screen();
  }
}

export function do_prefs_mouse(x: number, y: number, _mbutton: number): void {
  if (mouse_in_rect(scr.main_win, x, y)) {
    do_prefs_buttons(x, y);
    return;
  }
  close_prefs_screen();
  refresh_main_screen();
}

export function do_prefs_screen(): void {
  const mw = scr.main_win;
  G.prefs_drawn_flag = 1;
  hide_mouse();
  Fgl_fillbox(mw.x, mw.y, mw.w, mw.h, C.LOAD_BG_COLOUR);
  Fgl_setfontcolors(C.LOAD_BG_COLOUR, C.TEXT_FG_COLOUR);
  Fgl_write(mw.x + 80, mw.y + 4 * 8, 'Transport overwrite');
  Fgl_write(mw.x + 80, mw.y + 6 * 8, 'Popup info to dialog boxes');
  Fgl_write(mw.x + 80, mw.y + 8 * 8, 'Time multiplexed stats windows');
  Fgl_write(mw.x + 80, mw.y + 10 * 8, 'Confine X pointer');
  const x = 370, y = 387, h = 12, w = 3 * 8 + 4;
  Fgl_hline(mw.x + x, mw.y + y, mw.x + x + w, C.HELPBUTTON_COLOUR);
  Fgl_hline(mw.x + x, mw.y + y + h, mw.x + x + w, C.HELPBUTTON_COLOUR);
  Fgl_line(mw.x + x, mw.y + y, mw.x + x, mw.y + y + h, C.HELPBUTTON_COLOUR);
  Fgl_line(mw.x + x + w, mw.y + y, mw.x + x + w, mw.y + y + h, C.HELPBUTTON_COLOUR);
  Fgl_write(mw.x + x + 2, mw.y + y + 2, 'OUT');
  draw_prefs_cb();
  redraw_mouse();
}

export function close_prefs_screen(): void {
  save_lincityrc();
  G.prefs_flag = 0;
  G.prefs_drawn_flag = 0;
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
}

/** the X version's wait for a key: call_event until x_key_value is set; a char */
function waitKey(): number {
  let c: number;
  do {
    call_event();
    c = (G.x_key_value << 24) >> 24;
  } while (c === 0);
  G.x_key_value = 0;
  return c;
}
const isDigit19 = (c: number): boolean => c > 48 && c <= 57;

export function do_save_city(): void {
  const mw = scr.main_win;
  hide_mouse();
  Fgl_fillbox(mw.x, mw.y, mw.w, mw.h, C.SAVE_BG_COLOUR);
  Fgl_setfontcolors(C.SAVE_BG_COLOUR, C.TEXT_FG_COLOUR);
  Fgl_write(mw.x + 100, mw.y + 15, 'Save a scene');
  Fgl_write(mw.x + 8, mw.y + 35, 'Choose the number of the scene you want to save');
  Fgl_write(mw.x + 110, mw.y + 210, 'Press space to cancel.');
  draw_save_dir(C.SAVE_BG_COLOUR);
  G.db_flag = 1;
  redraw_mouse();
  cs_mouse_handler(0, -1, 0);
  cs_mouse_handler(0, 1, 0);
  const c = waitKey();
  if (isDigit19(c)) {
    const n = c - 48;
    Fgl_write(mw.x + 40, mw.y + 300, 'Type comment for the saved scene');
    Fgl_write(mw.x + 16, mw.y + 310, 'The comment may be up to 40 characters');
    Fgl_write(mw.x + 40, mw.y + 320, 'and may contain spaces or % . - + ,');
    let s = save_names[n].slice(2);
    s = input_save_filename(s);
    remove_scene(save_names[n]);
    save_names[n] = `${n}_${s}`;
    Fgl_fillbox(mw.x + 5, mw.y + 300, 360, 30, C.SAVE_BG_COLOUR);
    Fgl_write(mw.x + 70, mw.y + 310, 'Saving city scene... please wait');
    save_city(save_names[n]);
  }
  G.db_flag = 0;
  cs_mouse_handler(0, -1, 0);
  cs_mouse_handler(0, 1, 0);
  hide_mouse();
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  G.save_flag = 0;
  refresh_main_screen();
  redraw_mouse();
}

export function load_opening_city(s: string): void {
  load_city(`${PATHS.opening_path}/${s}`);
  PATHS.given_scene = s;
  G.db_flag = 0;
  cs_mouse_handler(0, -1, 0);
  cs_mouse_handler(0, 1, 0);
  hide_mouse();
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  refresh_main_screen();
  G.suppress_ok_buttons = 1;
  update_avail_modules(0);
  G.suppress_ok_buttons = 0;
  redraw_mouse();
}

export function do_load_city(): void {
  const mw = scr.main_win;
  hide_mouse();
  Fgl_fillbox(mw.x, mw.y, mw.w, mw.h, C.LOAD_BG_COLOUR);
  Fgl_setfontcolors(C.LOAD_BG_COLOUR, C.TEXT_FG_COLOUR);
  Fgl_write(mw.x + 140, mw.y + 15, 'Load a file');
  Fgl_write(mw.x + 40, mw.y + 35, 'Choose the number of the scene you want');
  Fgl_write(mw.x + 40, mw.y + 50, 'Entries coloured red are either not there,');
  Fgl_write(mw.x + 44, mw.y + 60, 'or they are from an earlier version, they');
  Fgl_write(mw.x + 110, mw.y + 70, 'might not load properly.');
  Fgl_write(mw.x + 110, mw.y + 210, 'Press space to cancel.');
  draw_save_dir(C.LOAD_BG_COLOUR);
  G.db_flag = 1;
  let c: number;
  do {
    redraw_mouse();
    cs_mouse_handler(0, -1, 0);
    cs_mouse_handler(0, 1, 0);
    c = waitKey();
    if (isDigit19(c)) {
      if (save_names[c - 48].length < 1) {
        redraw_mouse();
        if (yn_dial_box('No scene.', 'There is no save scene with this number.', 'Do you want to', 'try again?') !== 0) c = 0;
        else c = 32;
        hide_mouse();
      }
    }
  } while (c === 0);
  redraw_mouse();
  if (isDigit19(c)) {
    if (yn_dial_box('Loading Scene', 'Do you want to load the scene', save_names[c - 48], 'and forget the current game?') !== 0) {
      Fgl_write(mw.x + 70, mw.y + 310, 'Loading scene...  please wait');
      load_saved_city(save_names[c - 48]);
      refresh_pbars();
    }
  }
  G.db_flag = 0;
  cs_mouse_handler(0, -1, 0);
  cs_mouse_handler(0, 1, 0);
  hide_mouse();
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  G.load_flag = 0;
  refresh_main_screen();
  G.suppress_ok_buttons = 1;
  update_avail_modules(0);
  G.suppress_ok_buttons = 0;
  redraw_mouse();
}

function draw_save_dir(bg_colour: number): void {
  const mw = scr.main_win;
  if (!directoryExists(PATHS.lc_save_dir)) return;
  // readdir() order: the order the files are in the directory; here, by name
  const entries = vfsList(PATHS.lc_save_dir).sort();
  for (let i = 1; i < 10; i++) {
    save_names[i] = '';
    let s2 = '';
    for (const name of entries) {
      if (name.charCodeAt(0) === i + 48 && name[1] === '_') {
        s2 = sprintf('%2d ', i);
        save_names[i] = name.slice(0, 40);
        if (save_names[i].length > 2) s2 += save_names[i].slice(2, 42);
        else s2 += '???';
      }
    }
    if (save_names[i].length < 1) s2 = sprintf(' %d .....', i);
    else s2 = s2.replace(/_/g, ' ');
    if (verify_city(save_names[i]) === 0) Fgl_setfontcolors(bg_colour, C.red(28));
    else Fgl_setfontcolors(bg_colour, C.green(28));
    Fgl_write(mw.x + 24, mw.y + 10 * (10 + i), s2);
  }
  Fgl_setfontcolors(bg_colour, C.TEXT_FG_COLOUR);
}

/** the line editor: returns the edited string (spaces as underscores) */
function edit_string(str: string, maxlen: number, xpos: number, ypos: number): string {
  let s = str.slice(0, maxlen + 1).replace(/_/g, ' ');
  let c = 0;
  while (c !== 0xd && c !== 0xa) {
    Fgl_write(xpos, ypos, s);
    Fgl_write(xpos + s.length * 8, ypos, '_');
    let on = 1;
    get_real_time();
    let t = G.real_time | 0;
    call_event();
    while ((c = (G.x_key_value << 24) >> 24) === 0) {
      call_event();
      get_real_time();
      if (G.real_time > t + 200) {
        if (on === 1) {
          Fgl_write(xpos + s.length * 8, ypos, ' ');
          on = 0;
        } else {
          Fgl_write(xpos + s.length * 8, ypos, '_');
          on = 1;
        }
        get_real_time();
        t = G.real_time | 0;
      }
    }
    G.x_key_value = 0;
    if ((isalnum(c) || c === 32 || c === 46 || c === 37 || c === 44 || c === 45 || c === 43) && s.length < maxlen) {
      s += String.fromCharCode(c & 0xff);
    } else if (c === 0x7f && s.length > 0) {
      Fgl_write(xpos + s.length * 8, ypos, ' ');
      s = s.slice(0, -1);
    }
  }
  return s.replace(/ /g, '_');
}

function input_save_filename(s: string): string {
  const mw = scr.main_win;
  return edit_string(s, 40, mw.x + 24, mw.y + 340);
}
