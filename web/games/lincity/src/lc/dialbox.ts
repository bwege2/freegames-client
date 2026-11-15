// dialbox.c: the modal dialog box (lines of text and buttons with hot keys); it waits for a click or a
// key in its own event loop.
import * as C from './consts.ts';
import { G, scr, rect, type Rect } from './g.ts';
import { idiv } from './c.ts';
import { mouse_register, mouse_unregister, hide_mouse, redraw_mouse, type Mouse_Handle } from './mouse.ts';
import { mouse_in_rect, draw_bezel } from './geometry.ts';
import { Fgl_fillbox, Fgl_write, Fgl_setfontcolors, call_wait_event } from './lcx11.ts';
import { Fgl_getrect, Fgl_putrect } from './screen.ts';
import { ExitProgram } from './c.ts';

interface Entry { type: number; retval: number; text: string }
/** static Dialog_Box db_entry[MAX_DBOX_ENTRIES]: kept between dialogs (the key loop reads one entry past the last) */
const db_entry: Entry[] = Array.from({ length: C.MAX_DBOX_ENTRIES + 1 }, () => ({ type: 0, retval: 0, text: '' }));
const dialog_window = rect();
const text_window = rect();
const db_rect: Rect[] = Array.from({ length: C.MAX_DBOX_ENTRIES + 1 }, () => rect());
let main_handle: Mouse_Handle | null = null;
let text_handle: Mouse_Handle | null = null;
let dbn = 0, bn = 0, ln = 0;
let db_longest_button = 0, db_longest_line = 0;
let bs = 0, bse = 0;
let color = 0;
let db_up = 0;
let db_return_value = 0;
let db_screen_buffer = new Uint8Array(0);
let db_screen_fresh = 0;

function main_handler(): void { /* clicks on the border are ignored */ }

function text_handler(x: number, y: number): void {
  for (let i = 0; i < dbn; i++) {
    if (mouse_in_rect(db_rect[i], x, y) && db_entry[i].retval) dialog_close(db_entry[i].retval);
  }
}

/** dialog_box (colour, argc, type, retval, text, ...): returns the chosen button's retval */
export function dialog_box(arg_color: number, argc: number, ...args: (number | string)[]): number {
  if (db_up) {
    console.log('Already have a dialog box on screen!');
    throw new ExitProgram(-1);
  }
  db_up = 1;
  G.db_flag = 1;
  bn = 0; ln = 0; dbn = 0;
  db_longest_button = 0; db_longest_line = 0;
  bs = 0; bse = 0;
  color = arg_color;
  db_screen_fresh = 0;
  let ai = 0;
  for (let i = 0; i < argc; i++) {
    if (dbn >= C.MAX_DBOX_ENTRIES) {
      console.error('Too many buttons in dialog_box!\nTweak MAX_DBOX_ENTRIES');
      throw new ExitProgram(212);
    }
    const type = args[ai++] as number;
    const retval = args[ai++] as number;
    db_entry[dbn].type = type;
    db_entry[dbn].retval = retval;
    if (type === 0) {
      // chop a paragraph into lines
      let working: string | null = args[ai++] as string;
      do {
        const nl: number = working.indexOf('\n');
        if (nl >= 0) {
          db_entry[dbn].text = working.slice(0, nl);
          working = working.slice(nl + 1);
        } else {
          db_entry[dbn].text = working;
          working = null;
        }
        db_entry[dbn].type = 0;
        db_entry[dbn].retval = 0;
        db_rect[dbn].w = db_entry[dbn].text.length * C.CHAR_WIDTH;
        db_rect[dbn].h = C.CHAR_HEIGHT;
        if (db_rect[dbn].w > db_longest_line) db_longest_line = db_rect[dbn].w;
        ln++;
        dbn++;
      } while (working !== null && working.length >= 1);
    } else {
      db_entry[dbn].text = args[ai++] as string;
      db_rect[dbn].w = db_entry[dbn].text.length * C.CHAR_WIDTH + C.BUTTON_BORDER * 2;
      db_rect[dbn].h = C.CHAR_HEIGHT + C.BUTTON_BORDER * 2;
      db_longest_button += db_rect[dbn].w;
      bn++;
      dbn++;
    }
  }
  text_window.h = ln * (C.CHAR_HEIGHT + C.DB_V_SPACE) + C.BUTTON_HEIGHT + C.DB_V_SPACE;
  if (db_longest_button + bn * C.BUTTON_MIN_SPACING > db_longest_line + C.LINE_MIN_SPACING) {
    text_window.w = db_longest_button + bn * C.BUTTON_MIN_SPACING;
  } else text_window.w = db_longest_line + C.LINE_MIN_SPACING;
  bs = idiv(text_window.w - db_longest_button, bn);
  bse = idiv((text_window.w - db_longest_line) % bn, 2);
  let db_last_button = -1;
  for (let i = 0; i < dbn; i++) {
    if (db_entry[i].type) {
      if (db_last_button === -1) db_rect[i].x = idiv(bs + bse, 2) - C.BUTTON_BORDER;
      else db_rect[i].x = db_rect[db_last_button].x + db_rect[db_last_button].w + bs - C.BUTTON_BORDER;
      db_rect[i].y = ln * (C.CHAR_HEIGHT + C.DB_V_SPACE) + C.DB_V_SPACE - C.BUTTON_BORDER;
      db_last_button = i;
    } else {
      db_rect[i].x = idiv(text_window.w - db_rect[i].w, 2);
      db_rect[i].y = i * (C.CHAR_HEIGHT + C.DB_V_SPACE);
    }
  }
  dialog_window.w = text_window.w + C.BORDER_SIZE * 2;
  dialog_window.h = text_window.h + C.BORDER_SIZE * 2;
  main_handle = mouse_register(scr.client_win, main_handler);
  text_handle = mouse_register(text_window, text_handler);
  dialog_refresh();
  db_return_value = 0;
  while (!db_return_value) {
    call_wait_event();
    const key = G.x_key_value;
    G.x_key_value = 0;
    if (key === 0) continue;
    if (key === 10 || key === 13 || key === 32) {
      for (let i = 0; i <= dbn; i++) {
        if (db_entry[i].type === 2) {
          dialog_close(db_entry[i].retval);
          break;
        }
      }
    } else {
      for (let i = 0; i <= dbn; i++) {
        if (key === db_entry[i].retval) {
          dialog_close(key);
          break;
        }
      }
    }
  }
  return db_return_value;
}

export function dialog_refresh(): void {
  if (!db_up) return;
  dialog_window.x = idiv(scr.client_w, 2) - idiv(dialog_window.w, 2);
  dialog_window.y = idiv(scr.client_h, 2) - idiv(dialog_window.h, 2);
  text_window.x = dialog_window.x + C.BORDER_SIZE;
  text_window.y = dialog_window.y + C.BORDER_SIZE;
  hide_mouse();
  if (G.screen_refreshing && db_screen_fresh) db_screen_fresh = 0;
  if (!db_screen_fresh) {
    db_screen_buffer = new Uint8Array(dialog_window.w * dialog_window.h);
    Fgl_getrect(dialog_window, db_screen_buffer);
    db_screen_fresh = 1;
  }
  draw_bezel(dialog_window, C.BORDER_SIZE, color);
  Fgl_fillbox(text_window.x, text_window.y, text_window.w, text_window.h, color);
  Fgl_setfontcolors(color, C.TEXT_FG_COLOUR);
  for (let i = 0; i < dbn; i++) {
    if (db_entry[i].type) {
      Fgl_fillbox(db_rect[i].x + text_window.x, db_rect[i].y + text_window.y, db_rect[i].w, db_rect[i].h, C.white(0));
    }
    Fgl_write(db_rect[i].x + text_window.x + C.BUTTON_BORDER, db_rect[i].y + text_window.y + C.BUTTON_BORDER,
      db_entry[i].text);
  }
  Fgl_setfontcolors(C.TEXT_BG_COLOUR, C.TEXT_FG_COLOUR);
  redraw_mouse();
}

export function dialog_close(return_value: number): void {
  if (main_handle) mouse_unregister(main_handle);
  if (text_handle) mouse_unregister(text_handle);
  db_up = 0;
  db_return_value = return_value;
  if (db_screen_fresh) {
    Fgl_putrect(dialog_window, db_screen_buffer);
    db_screen_fresh = 0;
  }
  G.db_flag = 0;
}
