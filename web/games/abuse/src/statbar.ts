// statbar.cpp: the status bar (health, weapons, ammo) under the view; small_render (-2) is not ported
import { cache } from './cache.ts';
import type { image } from './imlib/image.ts';
import { SPEC_IMAGE } from './imlib/specs.ts';
import { dprintf } from './imlib/dprint.ts';
import { scale_put, scale_put_trans } from './scaleput.ts';
import { DEFINEDP, find_or_create, l_undefined, lstring_value, symbol_value } from './lisp/lisp.ts';
import { W } from './chars.ts';
import { G, EDIT_MODE } from './globals.ts';
import { L } from './lglobals.ts';
import type { view } from './view.ts';

export const TOTAL_WEAPONS = 8;

/** the mouse's last position and buttons as the demo and input code keep them (demo.cpp) */
export const DM = { last_demo_mx: 0, last_demo_my: 0, last_demo_mbut: 0 };
/** the mouse cursors (loader2.cpp) */
export const CUR = { c_mouse1: 0, c_mouse2: 0, c_normal: 0, c_target: 0 };

export class status_bar {
  v: view | null = null;
  need_rf = 1;
  changed_cursor = 0;
  icon_in_selection = -1;
  currently_selected_weapon = -1;
  bweap: number[] = [];
  dweap: number[] = [];
  sbar = 0;
  sbar_select = 0;
  sbar_numpad = 0;
  bnum: number[] = [];

  associate(V: view | null): void { this.v = V; }
  need_refresh(): void { this.need_rf = 1; }

  load(): void {
    const l_name = find_or_create('sbar_file');
    const sbname = symbol_value(l_name) !== l_undefined ? lstring_value(symbol_value(l_name)) : 'art/statbar.spe';
    for (let i = 0; i < TOTAL_WEAPONS; i++) {
      this.bweap[i] = cache.reg(sbname, `bweap${String(i + 1).padStart(4, '0')}.pcx`, SPEC_IMAGE);
      this.dweap[i] = cache.reg(sbname, `dweap${String(i + 1).padStart(4, '0')}.pcx`, SPEC_IMAGE);
    }
    for (let i = 0; i < 30; i++) this.bnum[i] = cache.reg(sbname, `bnum${String(i).padStart(2, '0')}`, SPEC_IMAGE);
    this.sbar = cache.reg(sbname, 'sbar', SPEC_IMAGE);
    this.sbar_select = cache.reg(sbname, 'sbar_select', SPEC_IMAGE);
    this.sbar_numpad = cache.reg(sbname, 'sbar_numpad', SPEC_IMAGE);
  }

  private draw_num(screen: image, x: number, y: number, num: number, offset: number): void {
    if (num < 0 || num > 999) {
      dprintf('bad number for statbar\n');
      return;
    }
    const im = cache.img(this.bnum[offset]);
    const dw = im.w, dh = im.h;
    let n = (num / 100) | 0;
    scale_put(cache.img(this.bnum[offset + n]), screen, x, y, dw, dh);
    num -= n * 100;
    x += dw;
    n = (num / 10) | 0;
    scale_put(cache.img(this.bnum[offset + n]), screen, x, y, dw, dh);
    num -= n * 10;
    x += dw;
    scale_put(cache.img(this.bnum[offset + num]), screen, x, y, dw, dh);
  }

  redraw(screen: image): void {
    this.need_rf = 0;
    const v = this.v;
    if (!v) return;
    if (W.total_weapons) {
      if (!G.the_game.playing_state(G.the_game.state)) return;
      const sb = cache.img(this.sbar);
      const sb_w = sb.w, sb_h = sb.h;
      const sx = ((G.xres / 2) | 0) - ((sb_w / 2) | 0), sy = G.yres - sb_h;
      const wx = 40, wa = 34;
      const ww = cache.img(this.bweap[0]).w, wh = cache.img(this.bweap[0]).h;
      const np_yo = 21;
      const np_w = cache.img(this.sbar_numpad).w, np_h = cache.img(this.sbar_numpad).h;
      const sel_w = cache.img(this.sbar_select).w, sel_h = cache.img(this.sbar_select).h;
      const sel_off = 4;
      scale_put(sb, screen, sx, sy, sb_w, sb_h);
      if (v.focus) this.draw_num(screen, sx + 17, sy + 11, v.focus.hp(), 0);
      let ammo_x = sx + 52;
      const ammo_y = sy + 25;
      let t = TOTAL_WEAPONS;
      if (t >= W.total_weapons) t = W.total_weapons;
      for (let i = 0, x_on = sx + wx; i < t; i++, x_on += wa, ammo_x += wa) {
        if (v.has_weapon(i)) {
          if (v.current_weapon === i) scale_put_trans(cache.img(this.bweap[i]), screen, x_on, sy, ww, wh);
          else scale_put_trans(cache.img(this.dweap[i]), screen, x_on, sy, ww, wh);
          scale_put_trans(cache.img(this.sbar_numpad), screen, x_on - 2, sy + np_yo, np_w, np_h);
          if (v.current_weapon === i) this.draw_num(screen, ammo_x, ammo_y, v.weapon_total(i), 20);
          else this.draw_num(screen, ammo_x, ammo_y, v.weapon_total(i), 10);
          if (i === this.icon_in_selection) scale_put_trans(cache.img(this.sbar_select), screen, x_on + sel_off, sy, sel_w, sel_h);
        }
      }
    }
  }

  private area(): [number, number, number, number] {
    if (this.sbar <= 0 || !W.total_weapons) return [G.xres, G.yres, G.xres, G.yres];
    const sb = cache.img(this.sbar);
    return [((G.xres / 2) | 0) - ((sb.w / 2) | 0), G.yres - sb.h, ((G.xres / 2) | 0) + ((sb.w / 2) | 0), G.yres];
  }

  draw_health(screen: image, amount: number): void {
    if (W.total_weapons) {
      const [x1, y1] = this.area();
      this.draw_num(screen, x1 + 17, y1 + 11, amount, 0);
    }
  }

  draw_ammo(screen: image, weapon_num: number, amount: number, light: number): void {
    if (W.total_weapons) {
      const [x1, y1] = this.area();
      this.draw_num(screen, x1 + 52 + weapon_num * 34, y1 + 25, amount, light ? 20 : 10);
    }
  }

  private mouse_in_area(): number {
    if (!this.v) return 0;
    const [x1, y1, x2, y2] = this.area();
    const mx = this.v.pointer_x, my = this.v.pointer_y;
    return mx >= x1 && my >= y1 && mx <= x2 && my <= y2 ? 1 : 0;
  }

  draw_update(): void {
    if (W.total_weapons && this.v) {
      const mcs = symbol_value(L.l_mouse_can_switch);
      if (DEFINEDP(mcs) && mcs && this.mouse_in_area()) {
        if ((G.current_level.tick_counter() & 4) === 0) G.wm.set_mouse_shape(cache.img(CUR.c_mouse1).copy(), 4, 4);
        else G.wm.set_mouse_shape(cache.img(CUR.c_mouse2).copy(), 4, 4);
        this.changed_cursor = 1;
      } else if (this.changed_cursor) {
        if (!(G.dev & EDIT_MODE)) G.wm.set_mouse_shape(cache.img(CUR.c_target).copy(), 8, 8);
        else G.wm.set_mouse_shape(cache.img(CUR.c_normal).copy(), 1, 1);
        this.changed_cursor = 0;
      }
      if (this.need_rf) this.redraw(G.screen);
    }
  }

  step(): void {
    const v = this.v;
    if (!v) return;
    const mcs = symbol_value(L.l_mouse_can_switch);
    if (!DEFINEDP(mcs) || !mcs) return;
    const [sx1, sy1, sx2, sy2] = this.area();
    const view_y2 = v.cy2;
    if (sy1 < view_y2) {
      v.suggest.send_view = 1;
      v.suggest.cx1 = v.cx1;
      v.suggest.cy1 = v.cy1;
      v.suggest.cx2 = v.cx2;
      v.suggest.cy2 = sy1 - 2;
    }
    if (this.sbar <= 0 || !W.total_weapons) return;
    let mx = DM.last_demo_mx;
    const my = DM.last_demo_my;
    if (mx > sx1 && my > sy1 && mx < sx2 && my < sy2) {
      let new_target: number;
      mx -= sx1;
      mx -= 47;
      if (mx < 0) new_target = 0;
      else {
        new_target = (mx / 33) | 0;
        if (new_target >= TOTAL_WEAPONS) new_target = TOTAL_WEAPONS - 1;
        if (new_target >= W.total_weapons) new_target = W.total_weapons - 1;
      }
      if (v.has_weapon(new_target) && new_target !== this.icon_in_selection) {
        this.icon_in_selection = new_target;
        this.need_refresh();
      }
      if (DM.last_demo_mbut === 2 && this.icon_in_selection !== v.current_weapon && this.icon_in_selection !== -1) {
        v.suggest.send_weapon_change = 1;
        v.suggest.new_weapon = this.icon_in_selection;
      }
    } else if (this.icon_in_selection !== -1) {
      this.icon_in_selection = -1;
      this.need_refresh();
    }
    if (this.currently_selected_weapon !== v.current_weapon) {
      this.currently_selected_weapon = v.current_weapon;
      this.need_refresh();
    }
  }
}

export const sbar = new status_bar();
