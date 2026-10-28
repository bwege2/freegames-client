// gamma.cpp: the gamma (darkest grey) dialog at the first start and from the menu; the palette is
// recomputed with the chosen gamma
import type { image } from './imlib/image.ts';
import { palette } from './imlib/palette.ts';
import { button, info_field } from './imlib/input.ts';
import type { ifield } from './imlib/jwindow.ts';
import { spicker } from './imlib/scroller.ts';
import { event, EV_CLOSE_WINDOW, EV_KEY, EV_MESSAGE, EV_MOUSE_MOVE } from './imlib/event.ts';
import { JK_ESC } from './imlib/keys.ts';
import { bytesOf, get_save_filename_prefix } from './imlib/specs.ts';
import { dprintf } from './imlib/dprint.ts';
import {
  current_space, DEFINEDP, find_or_create, find_symbol, lnumber_value, lstring_value, PERM_SPACE, set_current_space, set_number,
} from './lisp/lisp.ts';
import { palette_load } from './sdlport/video.ts';
import { cache } from './cache.ts';
import { G } from './globals.ts';
import { open_FILE } from './game.ts';
import { LD } from './loader2.ts';
import { ID_GAMMA_OK, ID_GREEN_PICKER, ID_NULL } from './id.ts';

/** palette *old_pal: the palette before the gamma correction (game.cpp deletes it at the end) */
export const GM = { old_pal: null as palette | null };

class gray_picker extends spicker {
  sc: number;

  draw_item(screen: image, x: number, y: number, num: number, active: number): void {
    const x2 = x + this.item_width() - 1;
    const y2 = y + this.item_height() - 1;
    screen.bar(x, y, x2, y2, 0);
    screen.bar(x, y, x2 - 3, y2, this.sc + num);
    if (active) screen.rectangle(x, y, x2, y2, 255);
  }
  set_pos(x: number): void { this.cur_sel = x; }
  total(): number { return 32; }
  item_width(): number { return 12; }
  item_height(): number { return 20; }
  activate_on_mouse_move(): number { return 0; }

  constructor(X: number, Y: number, ID: number, start: number, current: number, Next: ifield | null) {
    super(X, Y, ID, 1, 20, 0, 0, Next);
    this.cur_sel = current;
    this.sc = start;
    this.reconfigure();
    this.cur_sel = current;
  }
}

function lang_string(symbol: string): string {
  const v = find_symbol(symbol);
  if (!v || !DEFINEDP(v.value)) return 'Language symbol missing!';
  return lstring_value(v.value);
}

/** C division of longs (truncates toward zero) */
const div = (a: number, b: number): number => Math.trunc(a / b);

/** gamma_correct(palette *&pal, int force_menu): returns the new pal (the caller stores it where
 *  the reference pointed, the global pal) */
export async function gamma_correct(pal: palette, force_menu = 0): Promise<palette> {
  let dg = 0, old_dg = 0;
  let abort = 0;

  // see if user has already done this routine
  const gs = find_symbol('darkest_gray');

  if (GM.old_pal) {
    // delete pal
    pal = GM.old_pal;
    GM.old_pal = null;
  }

  if (gs && DEFINEDP(gs.value) && !force_menu) {
    dg = lnumber_value(gs.value);
  } else {
    if (gs && DEFINEDP(gs.value)) {
      dg = old_dg = lnumber_value(gs.value);
    }
    // load in a fine gray palette they can chose from
    const gray_pal = pal.copy();
    let i = 0;
    const tc = 32;

    for (; i < tc; i++) gray_pal.set(i, i * 4, i * 4, i * 4);

    palette_load(gray_pal);

    const wm = G.wm;
    const wm_bc = wm.bright_color(), wm_mc = wm.medium_color(), wm_dc = wm.dark_color();

    let br_r = pal.red(wm_bc) + 20;
    if (br_r > 255) br_r = 255;
    let br_g = pal.green(wm_bc) + 20;
    if (br_g > 255) br_g = 255;
    let br_b = pal.blue(wm_bc) + 20;
    if (br_b > 255) br_b = 255;

    let md_r = pal.red(wm_mc) - 20;
    if (md_r < 0) md_r = 0;
    let md_g = pal.green(wm_mc) - 20;
    if (md_g < 0) md_g = 0;
    let md_b = pal.blue(wm_mc) - 20;
    if (md_b < 0) md_b = 0;

    let dr_r = pal.red(wm_dc) - 40;
    if (dr_r < 0) dr_r = 0;
    let dr_g = pal.green(wm_dc) - 40;
    if (dr_g < 0) dr_g = 0;
    let dr_b = pal.blue(wm_dc) - 40;
    if (dr_b < 0) dr_b = 0;

    // clang evaluates the arguments left to right
    const c_br = gray_pal.find_closest(br_r, br_g, br_b);
    const c_md = gray_pal.find_closest(md_r, md_g, md_b);
    const c_dr = gray_pal.find_closest(dr_r, dr_g, dr_b);
    wm.set_colors(c_br, c_md, c_dr);

    const sh = wm.font().height() + 35;
    const ok_img = cache.img(LD.ok_button);
    const but = new button(5, 5 + sh * 3, ID_GAMMA_OK, ok_img, new info_field(35, 10 + sh * 3, ID_NULL, lang_string('gamma_msg'), null));

    const gp = new gray_picker(2, 5 + sh, ID_GREEN_PICKER, 0, div(dg, 4), but);
    gp.set_pos(div(dg, 4));

    const gw = wm.new_window(((G.xres / 2) | 0) - 190, ((G.yres / 2) | 0) - 90, -1, -1, gp);

    const ev = new event();
    wm.flush_screen();
    do {
      do {
        await wm.get_event(ev);
      } while (ev.type === EV_MOUSE_MOVE && wm.event_waiting());
      wm.flush_screen();
      if (ev.type === EV_CLOSE_WINDOW) abort = 1;
      if (ev.type === EV_KEY && ev.key === JK_ESC) abort = 1;
    } while (!abort && (ev.type !== EV_MESSAGE || ev.message.id !== ID_GAMMA_OK));

    dg = (gw.inm.get(ID_GREEN_PICKER) as spicker).first_selected() * 4;

    wm.close_window(gw);
    wm.flush_screen();

    wm.set_colors(wm_bc, wm_mc, wm_dc);
    // delete gray_pal

    if (!abort) {
      const gammapath = `${get_save_filename_prefix()}gamma.lsp`;
      const fp = open_FILE(gammapath, 'wb');
      if (fp) {
        fp.write(bytesOf(`(setq darkest_gray ${dg})\n`));
        fp.close();
        const sp = current_space;
        set_current_space(PERM_SPACE);
        set_number(find_or_create('darkest_gray'), dg);

        set_current_space(sp);
      } else {
        dprintf('Unable to write to file gamma.lsp\n');
      }
    }
  }

  if (abort) dg = old_dg;

  if (dg < 1) dg = 1;
  else if (dg > 128) dg = 128;

  // the C library's log and pow (glibc's are correctly rounded; V8's agree but for rare last-bit
  // differences, which the truncation below hides unless a value lands exactly on an integer)
  const gamma = Math.log(dg / 255.0) / Math.log(16.0 / 255.0);

  GM.old_pal = pal;
  pal = new palette();
  const old_pal = GM.old_pal;
  for (let i = 0; i < 256; i++) {
    const [oldr, oldg, oldb] = old_pal.get(i);
    pal.set(i, Math.trunc(Math.pow(oldr / 255.0, gamma) * 255),
      Math.trunc(Math.pow(oldg / 255.0, gamma) * 255),
      Math.trunc(Math.pow(oldb / 255.0, gamma) * 255));
  }

  palette_load(pal);
  return pal;
}
