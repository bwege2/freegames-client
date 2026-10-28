// game.cpp: the Game (views, drawing the map, input, the state machine), the title sequence, the
// fades, and main(): the loop net_receive -> get_input -> net_send -> step -> calc_speed -> draw.
import { G, EDIT_MODE, DRAW_FG_LAYER, DRAW_BG_LAYER, DRAW_PEOPLE_LAYER, DRAW_HELP_LAYER, DRAW_LIGHTS, DRAW_LINKS,
  MAP_MODE, PERFORMANCE_TEST_MODE, DRAW_FG_BOUND_LAYER } from './globals.ts';
import { L } from './lglobals.ts';
import { cache } from './cache.ts';
import { image } from './imlib/image.ts';
import { palette } from './imlib/palette.ts';
import { JCFont } from './imlib/fonts.ts';
import { WindowManager } from './imlib/jwindow.ts';
import { event, EV_KEY, EV_KEYRELEASE, EV_MESSAGE, EV_MOUSE_BUTTON, EV_MOUSE_MOVE, EV_REDRAW, EV_RESIZE,
  EV_SPURIOUS } from './imlib/event.ts';
import { JK_ALT_L, JK_ALT_R, JK_ENTER, JK_ESC, JK_F4, JK_SPACE, JK_TAB } from './imlib/keys.ts';
import { SPEC_PALETTE, jFILE, open_file, spec_directory, get_filename_prefix, get_save_filename_prefix,
  set_spec_main_file, type bFILE } from './imlib/specs.ts';
import { dprintf, set_dprinter, AbuseError, ExitProgram } from './imlib/dprint.ts';
import { DEFINEDP, NILP, find_or_create, lnumber_value, lstring_value, symbol_value, lisp_eval, lisp_init,
  lisp_uninit, clear_tmp, eval_function, type LSymbol } from './lisp/lisp.ts';
import { R, jrand_init, jrand } from './imlib/jrand.ts';
import { Timer, time_marker } from './rt/platform.ts';
import { vfsDelete } from './rt/vfs.ts';
import { run_deferred } from './rt/deferred.ts';
import { set_mode, palette_load } from './sdlport/video.ts';
import { S, SFX_INITIALIZED, MUSIC_INITIALIZED, song, sound_init, sound_uninit } from './sdlport/sound.ts';
import { setup } from './sdlport/setup.ts';
import { level, fgvalue, above_tile, level_status } from './level.ts';
import { stat_man } from './status.ts';
import { view, get_key_bindings, recalc_local_view_space, make_sync, process_packet_commands } from './view.ts';
import { W, object_names } from './chars.ts';
import { LG, calc_light_table, light_screen, delete_all_lights } from './light.ts';
import { draw_panims, free_pframes } from './particle.ts';
import { AUTOTILE_WIDTH, AUTOTILE_HEIGHT, type backtile, type foretile } from './items.ts';
import { sbar, DM, CUR } from './statbar.ts';
import { LD, load_data } from './loader2.ts';
import { CL, clisp_connect, symbol_str } from './clisp.ts';
import { compiled_uninit } from './compiled.ts';
import { chat_console } from './console.ts';
import { gamma_correct } from './gamma.ts';
import { draw_help, help_handle_event } from './help.ts';
import { AM } from './automap.ts';
import { scene_director, text_draw } from './director.ts';
import { main_menu } from './menu.ts';
import { show_end } from './endgame.ts';
import { demo_man, demo_manager, get_event, event_waiting } from './demo.ts';
import { DC, dev_controll, dev_init, confirm_quit, get_option } from './dev.ts';
import { base, INPUT_PROCESSING, SCMD_CHAT_KEYPRESS, SCMD_EXT_KEYPRESS, SCMD_EXT_KEYRELEASE, SCMD_KEYPRESS,
  SCMD_KEYRELEASE, SCMD_RELOAD, SCMD_SYNC, client_number, get_inputs_from_server, net_start, send_local_request,
  NET } from './net.ts';
import { main_net_cfg, net_configuration, set_main_net_cfg, NETP } from './netcfg.ts';
import { RAISE_SFX, LOWER_SFX, RAISE_MUSIC, LOWER_MUSIC, DO_VOLUME, CALB_JOY, TOP_MENU, DEV_QUIT } from './id.ts';

export const RUN_STATE = 0, PAUSE_STATE = 1, HELP_STATE = 2, INTRO_START_STATE = 3, INTRO_MORPH_STATE = 4,
  JOY_CALB_STATE = 5, MENU_STATE = 6, SCENE_STATE = 7, START_STATE = 8;
const BLACK = 0;
const f32 = Math.fround;

export const GM_ = {
  map_xoff: 0,
  map_yoff: 0,
  total_active: 0,
  need_delay: 1,
  morph_sel_frame_color: 0,
  chat: null as chat_console | null,
  external_print: 0,
};

/** open_FILE: the original puts the data directory and a space before relative names */
export function open_FILE(filename: string, mode: string): bFILE | null {
  const prefix = get_filename_prefix();
  const tmp_name = prefix && filename[0] !== '/' ? `${prefix} ${filename}` : filename;
  const fp = new jFILE(tmp_name, mode);
  if (fp.open_failure()) return null;
  return fp;
}

export function playing_state(state: number): boolean {
  return state === RUN_STATE || state === PAUSE_STATE;
}

function window_state(state: number): number {
  switch (state) {
    case RUN_STATE: case PAUSE_STATE: case JOY_CALB_STATE: return 1;
    case INTRO_START_STATE: case HELP_STATE: case INTRO_MORPH_STATE: case MENU_STATE: case SCENE_STATE: return 0;
  }
  return 1;
}

export function make_screen_size(w: number, h: number): void {
  for (let f = L.player_list; f; f = f.next) {
    if (!f.local_player()) continue;
    if (w >= G.xres - 1) w = G.xres - 2;
    if (h >= G.yres - 1) h = G.yres - 2;
    f.suggest.cx1 = (((G.xres + 1) / 2) | 0) - ((w / 2) | 0);
    f.suggest.cx2 = (((G.xres + 1) / 2) | 0) + ((w / 2) | 0);
    f.suggest.cy1 = (((G.yres - 31) / 2) | 0) + 5 - ((h / 2) | 0);
    f.suggest.cy2 = (((G.yres - 51) / 2) | 0) + 5 + ((h / 2) | 0);
    f.suggest.shift_down = f.shift_down;
    f.suggest.shift_right = f.shift_right;
    f.suggest.pan_x = f.pan_x;
    f.suggest.pan_y = f.pan_y;
    f.suggest.send_view = 1;
  }
}

function remap_area(screen: image, x1: number, y1: number, x2: number, y2: number, remap: Uint8Array): void {
  const d = screen.m_data;
  for (let y = y1; y <= y2; y++) {
    let sl = screen.scan_line(y) + x1;
    for (let x = x1; x <= x2; x++, sl++) d[sl] = remap[d[sl]];
  }
}

function post_render(): void {
  const s = L.l_post_render as LSymbol;
  if (DEFINEDP(s.function)) {
    G.screen.dirt_off();
    clear_tmp();
    eval_function(s, null);
    clear_tmp();
    G.screen.dirt_on();
  }
}

// calc_speed's statics
let avg_ms = f32(1000 / 15), possible_ms = f32(1000 / 15);
let frame_timer: Timer | null = null;
let calc_first = 1;
const MS15 = f32(f32(1000) / f32(15)), MS14 = f32(f32(1000) / f32(14)), MS10 = f32(f32(1000) / f32(10));

export class Game {
  fnt: JCFont | null = null;
  finished = false;
  bg_top = 0;
  fg_top = 0;
  bright_color = 0;
  med_color = 0;
  dark_color = 0;
  morph_bright_color = 0;
  morph_med_color = 0;
  morph_dark_color = 0;
  last_time = 0;
  fps = 0;
  help_text = '';
  refresh = 1;
  mousex = 0;
  mousey = 0;
  help_text_frames = 0;
  has_joystick = 0;
  no_delay = 0;
  top_menu: unknown = null;
  joy_win: unknown = null;
  last_input: unknown = null;
  game_font: JCFont | null = null;
  keymap = new Uint8Array(512 / 8);
  nplayers = 1;
  first_view: view | null = null;
  old_view: view | null = null;
  state = 0;
  zoom = 15;

  key_down(key: number): number { return this.keymap[key >> 3] & (1 << (key & 7)); }
  set_key_down(key: number, x: number): void {
    if (x) this.keymap[key >> 3] |= 1 << (key & 7);
    else this.keymap[key >> 3] &= ~(1 << (key & 7));
  }
  reset_keymap(): void { this.keymap.fill(0); }
  get_color(x: number): number { return x; }
  playing_state(state: number): boolean { return playing_state(state); }
  get morph_sel_frame_color(): number { return GM_.morph_sel_frame_color; }
  demo_state(): number { return demo_man.current_state(); }
  get_option(name: string): number { return get_option(name); }
  set_delay(on: number): void { this.no_delay = on ? 0 : 1; }
  chat_put_all(s: string): void { GM_.chat?.put_all(s); }

  get_bg(x: number): backtile {
    if (x < 0 || x >= G.nbacktiles || G.backtiles[x] < 0) return cache.backt(G.backtiles[BLACK]);
    return cache.backt(G.backtiles[x]);
  }
  get_fg(x: number): foretile {
    if (x < 0 || x >= G.nforetiles || G.foretiles[x] < 0) return cache.foret(G.foretiles[BLACK]);
    return cache.foret(G.foretiles[x]);
  }
  ftile_width(): number { return G.f_wid; }
  ftile_height(): number { return G.f_hi; }
  btile_width(): number { return G.b_wid; }
  btile_height(): number { return G.b_hi; }
  need_refresh(): void { this.refresh = 1; }
  current_palette(): palette { return G.pal; }

  play_sound(id: number, vol: number, x: number, y: number): void {
    if (!(S.sound_avail & SFX_INITIALIZED)) return;
    if (vol < 1) return;
    if (!L.player_list) return;
    let mindist = 500;
    let cd: view | null = null;
    for (let f: view | null = L.player_list; f; f = f.next) {
      if (!f.local_player()) continue;
      const cx = Math.abs(f.x_center() - x), cy = Math.abs(f.y_center() - y);
      const d = cx < cy ? cx + cy - (cx >> 1) : cx + cy - (cy >> 1);
      if (d < mindist) {
        cd = f;
        mindist = d;
      }
    }
    if (mindist >= 500) return;
    if (mindist < 100) mindist = 0;
    else mindist -= 100;
    let p = ((cd!.x_center() - x) / 2 | 0) + 128;
    if (p < 0) p = 0;
    if (p > 255) p = 255;
    const v = (((400 - mindist) * S.sfx_volume) / 400 | 0) - (127 - vol);
    if (v > 0) cache.sfx(id).play(v, 128, p);
  }

  grow_views(amount: number): void {
    for (let f = this.first_view; f; f = f.next) {
      if (!f.local_player()) continue;
      f.suggest.cx1 = f.cx1 - amount;
      f.suggest.cy1 = f.cy1 - ((amount / 2) | 0);
      f.suggest.cx2 = f.cx2 + amount;
      f.suggest.cy2 = f.cy2 + ((amount / 2) | 0);
      f.suggest.shift_down = f.shift_down;
      f.suggest.shift_right = f.shift_right;
      f.suggest.pan_x = f.pan_x;
      f.suggest.pan_y = f.pan_y;
      f.suggest.send_view = 1;
    }
    for (let f = this.first_view; f; f = f.next) {
      if (!f.local_player()) continue;
      if (f.suggest.cx2 - f.suggest.cx1 < 20 || f.suggest.cy2 - f.suggest.cy1 < 15 || f.suggest.cx1 < 0 || f.suggest.cy1 < 0)
        f.suggest.send_view = 0;
      if (f.next && f.next.local_player() && f.suggest.cy2 >= f.next.cy1) f.suggest.send_view = 0;
    }
  }

  pan(xv: number, yv: number): void {
    this.first_view!.pan_x += xv;
    this.first_view!.pan_y += yv;
  }

  view_in(mousex: number, mousey: number): view | null {
    for (let f = this.first_view; f; f = f.next)
      if (f.drawable() && mousex >= f.cx1 && mousey >= f.cy1 && mousex <= f.cx2 && mousey <= f.cy2) return f;
    return null;
  }

  ftile_on(screenx: number, screeny: number): [number, number] {
    const [x, y] = this.mouse_to_game(screenx, screeny, null);
    return [(x / this.ftile_width()) | 0, (y / this.ftile_height()) | 0];
  }

  btile_on(screenx: number, screeny: number): [number, number] {
    const f = this.view_in(screenx, screeny);
    if (f) {
      return [((screenx - f.cx1 + ((Math.imul(f.xoff(), G.bg_xmul) / G.bg_xdiv) | 0)) / G.b_wid) | 0,
        ((screeny - f.cy1 + ((Math.imul(f.yoff(), G.bg_ymul) / G.bg_ydiv) | 0)) / G.b_hi) | 0];
    }
    return [-1, -1];
  }

  /** mouse_to_game(x, y, gamex, gamey, view): the game position (unchanged gamex/gamey are returned as 0) */
  mouse_to_game(x: number, y: number, f: view | null = null): [number, number] {
    if (!f) f = this.view_in(x, y);
    if (!f) f = L.player_list;
    if (f) {
      if (G.dev & MAP_MODE) {
        return [(((x - f.cx1) * this.ftile_width()) / AUTOTILE_WIDTH | 0) + GM_.map_xoff * this.ftile_width(),
          (((y - f.cy1) * this.ftile_height()) / AUTOTILE_HEIGHT | 0) + GM_.map_yoff * this.ftile_height()];
      }
      return [x - f.cx1 + f.xoff(), y - f.cy1 + f.yoff()];
    }
    return [0, 0];
  }

  game_to_mouse(gamex: number, gamey: number, which: view): [number, number] {
    if (!(G.dev & MAP_MODE)) return [gamex - which.xoff() + which.cx1, gamey - which.yoff() + which.cy1];
    let x1: number, y1: number;
    if (G.dev & EDIT_MODE) {
      x1 = GM_.map_xoff;
      y1 = GM_.map_yoff;
    } else if (which.focus) {
      x1 = ((which.focus.x / this.ftile_width()) | 0) - ((((which.cx2 - which.cx1) / AUTOTILE_WIDTH) | 0) / 2 | 0);
      y1 = ((which.focus.y / this.ftile_height()) | 0) - ((((which.cy2 - which.cy1) / AUTOTILE_HEIGHT) | 0) / 2 | 0);
    } else x1 = y1 = 0;
    if (x1 < 0) x1 = 0;
    if (y1 < 0) y1 = 0;
    let x = ((gamex * AUTOTILE_WIDTH) / this.ftile_width() | 0) - x1 * AUTOTILE_WIDTH + which.cx1;
    if (x1 > 0) x -= (((which.focus!.x * AUTOTILE_WIDTH) / this.ftile_width()) | 0) % AUTOTILE_WIDTH;
    let y = ((gamey * AUTOTILE_HEIGHT) / this.ftile_height() | 0) - y1 * AUTOTILE_HEIGHT + which.cy1;
    if (y1 > 0) y -= (((which.focus!.y * AUTOTILE_HEIGHT) / this.ftile_height()) | 0) % AUTOTILE_HEIGHT;
    return [x, y];
  }

  set_state(new_state: number): void {
    let d = 0;
    this.reset_keymap();
    if (playing_state(new_state) && !playing_state(this.state)) {
      if (this.first_view && this.first_view !== L.player_list) {
        while (this.first_view) {
          const tmp: view = this.first_view;
          this.first_view = this.first_view.next;
          tmp.destroy();
        }
        this.first_view = this.old_view;
        this.old_view = null;
      }
      this.first_view = L.player_list;
      d = 1;
    } else if (!playing_state(new_state) && (playing_state(this.state) || this.state === START_STATE)) {
      if (L.player_list) {
        this.first_view = new view(L.player_list.focus, null, -1);
        this.first_view.pan_x = L.player_list.xoff();
        this.first_view.pan_y = L.player_list.yoff();
      } else this.first_view = new view(null, null, 0);
      const fv = this.first_view;
      fv.cx1 = (((G.xres + 1) / 2) | 0) - 155;
      fv.cy1 = (((G.yres + 1) / 2) | 0) - 95;
      fv.cx2 = (((G.xres + 1) / 2) | 0) + 155;
      if (W.total_weapons) fv.cy2 = (((G.yres + 1) / 2) | 0) + 68;
      else fv.cy2 = (((G.yres + 1) / 2) | 0) + 95;
      d = 1;
    }
    if (window_state(new_state) && !window_state(this.state)) G.wm.show_windows();
    else if (!window_state(new_state) && window_state(this.state)) G.wm.hide_windows();

    const old_state = this.state;
    this.state = new_state;
    palette_load(G.pal);
    if (playing_state(this.state) && !(G.dev & EDIT_MODE)) G.wm.set_mouse_shape(cache.img(CUR.c_target).copy(), 8, 8);
    else G.wm.set_mouse_shape(cache.img(CUR.c_normal).copy(), 1, 1);

    if (old_state === SCENE_STATE && new_state !== SCENE_STATE) {
      d = 1;
      scene_director.set_abort(0);
    } else if (new_state === SCENE_STATE && old_state !== SCENE_STATE) d = 1;
    if (d) this.draw(this.state === SCENE_STATE ? 1 : 0);
    DC.dev_cont?.set_state(new_state);
  }

  show_help(st: string): void {
    this.help_text = st.slice(0, 199);
    this.help_text_frames = 0;
    this.refresh = 1;
  }

  draw_value(screen: image, x: number, y: number, w: number, h: number, val: number, max: number): void {
    screen.bar(x, y, x + w - 1, y + h, G.wm.dark_color());
    screen.bar(x, y + 1, x + ((w * val) / max | 0), y + h - 1, G.wm.bright_color());
  }

  set_level(nl: level): void {
    if (G.current_level) G.current_level.destroy();
    G.current_level = nl;
  }

  load_level(name: string): void {
    if (G.current_level) G.current_level.destroy();
    const fp = open_file(name, 'rb');
    if (fp.open_failure()) {
      fp.close();
      G.current_level = level.blank(100, 100, name);
      this.show_help(symbol_str('no_file').replace('%s', name));
    } else {
      const sd = new spec_directory(fp);
      G.current_level = level.load(sd, fp, name);
      fp.close();
    }
    base.current_tick = G.current_level.tick_counter() & 0xff;
    G.current_level.level_loaded_notify();
    this.help_text_frames = 0;
  }

  done(): boolean {
    return this.finished || (main_net_cfg !== null && main_net_cfg.restart_state() !== 0);
  }

  end_session(): void {
    this.finished = true;
  }

  dev_scroll(): void {
    GM_.need_delay = 0;
    // the editor's scrolling (dev != 0) is not ported
  }

  draw_map(v: view, interpolate = 0): void {
    const screen = G.screen;
    const lv = G.current_level;
    const [cx1, cy1, cx2, cy2] = screen.GetClip();
    if (!lv || this.state === MENU_STATE) {
      if (G.title_screen >= 0) {
        if (this.state === SCENE_STATE) screen.SetClip(v.cx1, v.cy1, v.cx2 + 1, v.cy2 + 1);
        const tit = cache.img(G.title_screen);
        tit.put_image(screen, ((screen.Size().x / 2) | 0) - ((tit.Size().x / 2) | 0),
          ((screen.Size().y / 2) | 0) - ((tit.Size().y / 2) | 0));
        if (this.state === SCENE_STATE) screen.SetClip(cx1, cy1, cx2, cy2);
        G.wm.flush_screen();
      }
      return;
    }
    this.refresh = 0;
    screen.AddDirty(v.cx1, v.cy1, v.cx2 + 1, v.cy2 + 1);

    if (v.draw_solid !== -1) {
      const c = v.draw_solid;
      for (let y = v.cy1; y <= v.cy2; y++) {
        const o = screen.scan_line(y) + v.cx1;
        screen.m_data.fill(c & 0xff, o, o + v.cx2 - v.cx1 + 1);
      }
      v.draw_solid = -1;
      return;
    }
    screen.dirt_off();

    let xoff: number, yoff: number;
    if (interpolate) {
      xoff = v.interpolated_xoff();
      yoff = v.interpolated_yoff();
    } else {
      xoff = v.xoff();
      yoff = v.yoff();
    }
    L.current_vxadd = xoff - v.cx1;
    L.current_vyadd = yoff - v.cy1;
    screen.SetClip(v.cx1, v.cy1, v.cx2 + 1, v.cy2 + 1);

    const nxoff = (Math.imul(xoff, G.bg_xmul) / G.bg_xdiv) | 0;
    const nyoff = (Math.imul(yoff, G.bg_ymul) / G.bg_ydiv) | 0;
    const bw_ = this.btile_width(), bh_ = this.btile_height();
    let x1 = (nxoff / bw_) | 0, y1 = (nyoff / bh_) | 0;
    let x2 = x1 + (((v.cx2 - v.cx1 + bw_) / bw_) | 0);
    let y2 = y1 + (((v.cy2 - v.cy1 + bh_) / bh_) | 0);
    let xo = v.cx1 - (nxoff % bw_);
    let yo = v.cy1 - (nyoff % bh_);
    let xinc: number, yinc: number;
    let x: number, y: number, draw_x: number, draw_y: number;

    if (!(G.dev & MAP_MODE) && (G.dev & DRAW_BG_LAYER)) {
      xinc = bw_;
      yinc = bh_;
      const bh = lv.background_height(), bw = lv.background_width();
      for (draw_y = yo, y = y1; y <= y2; y++, draw_y += yinc) {
        let bl = y >= bh ? -1 : y * bw + x1;
        for (x = x1, draw_x = xo; x <= x2; x++, draw_x += xinc) {
          let bt: backtile;
          if (x < bw && y < bh) {
            bt = this.get_bg(lv.map_bg[bl]);
            bl++;
          } else bt = this.get_bg(0);
          bt.im.put_image(screen, draw_x, draw_y);
        }
      }
    }

    let rescan = 0;
    let fw: number, fh: number;
    if (G.dev & MAP_MODE) {
      fw = AUTOTILE_WIDTH;
      fh = AUTOTILE_HEIGHT;
      if (G.dev & EDIT_MODE) {
        x1 = GM_.map_xoff;
        y1 = GM_.map_yoff;
      } else if (v.focus) {
        x1 = ((v.focus.x / this.ftile_width()) | 0) - ((((v.cx2 - v.cx1) / fw) | 0) / 2 | 0);
        y1 = ((v.focus.y / this.ftile_height()) | 0) - ((((v.cy2 - v.cy1) / fh) | 0) / 2 | 0);
      } else x1 = y1 = 0;
      if (x1 > 0) xo = v.cx1 - ((((v.focus!.x * fw) / this.ftile_width()) | 0) % fw);
      else xo = v.cx1;
      if (y1 > 0) yo = v.cy1 - ((((v.focus!.y * fh) / this.ftile_height()) | 0) % fh);
      else yo = v.cy1;
    } else {
      fw = this.ftile_width();
      fh = this.ftile_height();
      x1 = (xoff / fw) | 0;
      y1 = (yoff / fh) | 0;
      xo = v.cx1 - (xoff % fw);
      yo = v.cy1 - (yoff % fh);
    }
    if (x1 < 0) x1 = 0;
    if (y1 < 0) y1 = 0;
    x2 = x1 + (((v.cx2 - v.cx1 + fw) / fw) | 0);
    y2 = y1 + (((v.cy2 - v.cy1 + fh) / fh) | 0);
    if (x2 >= lv.foreground_width()) x2 = lv.foreground_width() - 1;
    if (y2 >= lv.foreground_height()) y2 = lv.foreground_height() - 1;
    xinc = fw;
    yinc = fh;
    const fgw = lv.foreground_width();
    const mfg = lv.map_fg;

    if (G.dev & DRAW_FG_LAYER) {
      const [ncx1, ncy1, ncx2, ncy2] = screen.GetClip();
      const scr_w = screen.Size().x;
      if (G.dev & MAP_MODE) {
        if (G.dev & EDIT_MODE) screen.clear(G.wm.bright_color());
        else screen.clear(G.wm.black());
        for (y = y1, draw_y = yo; y <= y2; y++, draw_y += yinc) {
          if (!(draw_y < ncy1 || draw_y + yinc > ncy2)) {
            let cl = y * fgw + x1;
            let sl1 = screen.scan_line(draw_y) + xo;
            for (x = x1, draw_x = xo; x <= x2; x++, cl++, sl1 += xinc, draw_x += xinc) {
              if (!(draw_x < ncx1 || draw_x + xinc > ncx2)) {
                const mi = this.get_fg(fgvalue(mfg[cl])).micro_image.m_data;
                for (let r = 0; r < 3; r++)
                  screen.m_data.set(mi.subarray(r * AUTOTILE_WIDTH, (r + 1) * AUTOTILE_WIDTH), sl1 + r * scr_w);
              }
            }
          }
        }
        if (G.dev & EDIT_MODE) lv.draw_areas(v);
      } else {
        const fg_h = lv.foreground_height(), fg_w = fgw;
        for (y = y1, draw_y = yo; y <= y2; y++, draw_y += yinc) {
          let cl = y < fg_h ? y * fgw + x1 : -1;
          for (x = x1, draw_x = xo; x <= x2; x++, draw_x += xinc, cl++) {
            if (x < fg_w && y < fg_h) {
              if (above_tile(mfg[cl])) rescan = 1;
              else {
                const fort_num = fgvalue(mfg[cl]);
                if (fort_num !== BLACK) {
                  this.get_fg(fort_num).im.PutImage(screen, draw_x, draw_y);
                  if (!(G.dev & EDIT_MODE)) mfg[cl] |= 0x8000;
                }
              }
            }
          }
        }
      }
    }

    const ro = R.rand_on;
    if (G.dev & DRAW_PEOPLE_LAYER) {
      if (interpolate) lv.interpolate_draw_objects(v);
      else lv.draw_objects(v);
    }

    if (!(G.dev & MAP_MODE)) {
      draw_panims(v);
      if (G.dev & DRAW_FG_LAYER && rescan) {
        for (y = y1, draw_y = yo; y <= y2; y++, draw_y += yinc) {
          let cl = y * fgw + x1;
          for (x = x1, draw_x = xo; x <= x2; x++, draw_x += xinc, cl++) {
            if (above_tile(mfg[cl])) {
              const fort_num = fgvalue(mfg[cl]);
              if (fort_num !== BLACK) {
                if (G.dev & DRAW_BG_LAYER) this.get_fg(fort_num).im.PutImage(screen, draw_x, draw_y);
                else this.get_fg(fort_num).im.PutFilled(screen, draw_x, draw_y, 0);
                if (!(G.dev & EDIT_MODE)) lv.mark_seen(x, y);
                else {
                  screen.line(draw_x, draw_y, draw_x + xinc, draw_y + yinc, G.wm.bright_color());
                  screen.line(draw_x + xinc, draw_y, draw_x, draw_y + yinc, G.wm.bright_color());
                }
              }
            }
          }
        }
      }

      if (G.dev & DRAW_FG_BOUND_LAYER) {
        const b = G.wm.bright_color();
        const fg_h = lv.foreground_height(), fg_w = fgw;
        for (y = y1, draw_y = yo; y <= y2; y++, draw_y += yinc) {
          let cl = y < fg_h ? y * fgw + x1 : -1;
          for (x = x1, draw_x = xo; x <= x2; x++, draw_x += xinc, cl++) {
            if (x < fg_w && y < fg_h) {
              const fort_num = fgvalue(mfg[cl]);
              if (fort_num !== BLACK) {
                const p = this.get_fg(fort_num).points;
                const dd = p.data;
                if (p.tot) {
                  let di = 0;
                  for (let i = 1; i < p.tot; i++) {
                    di += 2;
                    screen.line(draw_x + dd[di - 2], draw_y + dd[di - 1], draw_x + dd[di], draw_y + dd[di + 1], b);
                  }
                  screen.line(draw_x + dd[di], draw_y + dd[di - 1], draw_x + dd[0], draw_y + dd[1], b);
                }
              }
            }
          }
        }
      }

      if (G.dev & DRAW_HELP_LAYER) {
        if (this.help_text_frames >= 0) {
          const color = this.help_text_frames < 10 ? 2 : 2 + (this.help_text_frames - 10);
          const hx1 = v.cx1, hy1 = v.cy1, hx2 = v.cx2, hy2 = v.cy1 + G.wm.font().height() + 10;
          remap_area(screen, hx1, hy1, hx2, hy2, LG.white_light.subarray(40 * 256));
          screen.bar(hx1, hy1, hx2, hy1, color);
          screen.bar(hx1, hy2, hx2, hy2, color);
          G.wm.font().put_string(screen, hx1 + 5, hy1 + 5, this.help_text, color);
          if (color > 30) this.help_text_frames = -1;
          else this.help_text_frames++;
        }
      }

      DC.dev_cont?.dev_draw(v);
      if (cache.in_use()) cache.img(LD.vmm_image).put_image(screen, v.cx1, v.cy2 - cache.img(LD.vmm_image).Size().y + 1);

      if (G.dev & DRAW_LIGHTS) {
        screen.dirt_on();
        if (G.xres * G.yres <= 64000) light_screen(screen, xoff, yoff, LG.white_light, v.ambient);
        else light_screen(screen, xoff, yoff, LG.white_light, 63);
      } else screen.dirt_on();
    } else screen.dirt_on();

    R.rand_on = ro;
    post_render();
    screen.SetClip(cx1, cy1, cx2 + 1, cy2 + 1);
    if (playing_state(this.state)) v.draw_character_damage();
    sbar.draw_update();
  }

  put_fg(x: number, y: number, type: number): void {
    if (G.current_level.get_fg(x, y) !== type) {
      G.current_level.put_fg(x, y, type);
      for (let f = this.first_view; f; f = f.next) if (f.drawable()) this.draw_map(f);
    }
  }

  put_bg(x: number, y: number, type: number): void {
    if (G.current_level.get_bg(x, y) !== type) {
      G.current_level.put_bg(x, y, type);
      for (let f = this.first_view; f; f = f.next) if (f.drawable()) this.draw_map(f);
    }
  }

  in_area(_ev: event, x1: number, y1: number, x2: number, y2: number): boolean {
    return DM.last_demo_mx >= x1 && DM.last_demo_mx <= x2 && DM.last_demo_my >= y1 && DM.last_demo_my <= y2;
  }

  request_level_load(name: string): void { G.req_name = name.slice(0, 99); }
  request_end(): void { G.req_end = 1; }

  toggle_delay(): void {
    this.no_delay = this.no_delay ? 0 : 1;
    this.show_help(symbol_str(this.no_delay ? 'delay_off' : 'delay_on'));
    avg_ms = possible_ms = MS15;
  }

  show_time(): void {
    if (!this.first_view || !G.fps_on) return;
    const fv = this.first_view;
    G.console_font.put_string(G.screen, fv.cx1, fv.cy1, String(Math.trunc(f32(f32(10000) / avg_ms))));
    G.console_font.put_string(G.screen, fv.cx1, fv.cy1 + 10, String(GM_.total_active));
  }

  update_screen(): void {
    if (this.state === HELP_STATE) draw_help();
    else if (G.current_level) {
      if (!(G.dev & EDIT_MODE) || this.refresh) {
        G.current_level.clear_active_list();
        for (let f = this.first_view; f; f = f.next) {
          if (f.focus) {
            const w = f.cx2 - f.cx1 + 1, h = f.cy2 - f.cy1 + 1;
            GM_.total_active += G.current_level.add_drawables(f.xoff() - ((w / 4) | 0), f.yoff() - ((h / 4) | 0),
              f.xoff() + w + ((w / 4) | 0), f.yoff() + h + ((h / 4) | 0));
          }
        }
        for (let f = this.first_view; f; f = f.next) if (f.drawable()) this.draw_map(f, 0);
        if (AM.current_automap) AM.current_automap.draw();
      }
      if (this.state === PAUSE_STATE) {
        for (let f = this.first_view; f; f = f.next) {
          const pi = cache.img(LD.pause_image);
          pi.put_image(G.screen, (((f.cx1 + f.cx2) / 2) | 0) - ((pi.Size().x / 2) | 0), f.cy1 + 5, 1);
        }
      }
      this.show_time();
    }
    if (this.state === RUN_STATE && cache.prof_is_on()) cache.prof_poll_end();
    G.wm.flush_screen();
  }

  async calc_speed(): Promise<number> {
    if (calc_first) {
      frame_timer = new Timer();
      calc_first = 0;
      return 0;
    }
    const ft = frame_timer!;
    const deltams = Math.max(f32(1), ft.PollMs());
    avg_ms = f32(f32(f32(0.9) * avg_ms) + f32(f32(0.1) * deltams));
    possible_ms = f32(f32(f32(0.9) * possible_ms) + f32(f32(0.1) * deltams));
    if (avg_ms < MS14) G.massive_frame_panic = Math.max(0, Math.min(20, G.massive_frame_panic - 1));
    let ret = 0;
    if (G.dev & EDIT_MODE) await ft.WaitMs(33);
    else if (avg_ms < MS15 && GM_.need_delay) {
      G.frame_panic = 0;
      if (!this.no_delay) {
        await ft.WaitMs(MS15);
        avg_ms = f32(avg_ms - f32(f32(0.1) * deltams));
        avg_ms = f32(avg_ms + f32(f32(f32(0.1) * f32(1000)) / f32(15)));
      }
    } else if (avg_ms > MS14) {
      if (avg_ms > MS10) G.massive_frame_panic++;
      G.frame_panic++;
      ret = 1;
    }
    ft.GetMs();
    return ret;
  }

  async get_input(): Promise<void> {
    const ev = new event();
    G.idle_ticks++;
    while (event_waiting()) {
      await get_event(ev);
      if (ev.type === EV_MOUSE_MOVE) this.last_input = ev.window;
      if (ev.type !== EV_KEY || !this.key_down(ev.key) || ev.window || (G.dev & EDIT_MODE)) {
        if (ev.type === EV_KEY) {
          this.set_key_down(ev.key, 1);
          if (playing_state(this.state)) {
            if (ev.key < 256) {
              if (GM_.chat && GM_.chat.chat_event(ev)) base.packet.write_uint8(SCMD_CHAT_KEYPRESS);
              else base.packet.write_uint8(SCMD_KEYPRESS);
            } else base.packet.write_uint8(SCMD_EXT_KEYPRESS);
            base.packet.write_uint8(client_number());
            if (ev.key > 256) base.packet.write_uint8(ev.key - 256);
            else base.packet.write_uint8(ev.key);
          }
        } else if (ev.type === EV_KEYRELEASE) {
          this.set_key_down(ev.key, 0);
          if (playing_state(this.state)) {
            if (ev.key < 256) base.packet.write_uint8(SCMD_KEYRELEASE);
            else base.packet.write_uint8(SCMD_EXT_KEYRELEASE);
            base.packet.write_uint8(client_number());
            if (ev.key > 255) base.packet.write_uint8(ev.key - 256);
            else base.packet.write_uint8(ev.key);
          }
        }

        if ((G.dev & EDIT_MODE) || G.start_edit || ev.type === EV_MESSAGE) DC.dev_cont!.handle_event(ev);

        for (let v = this.first_view; v; v = v.next) if (v.local_player() && v.handle_event(ev)) ev.type = EV_SPURIOUS;
        if (AM.current_automap) AM.current_automap.handle_event(ev);
        help_handle_event(ev);
        this.mousex = DM.last_demo_mx;
        this.mousey = DM.last_demo_my;

        if (ev.type === EV_MESSAGE) {
          switch (ev.message.id) {
            case CALB_JOY: // no joystick: falls through to TOP_MENU as in the original
            case TOP_MENU:
              break;
            case DEV_QUIT:
              this.finished = true;
              break;
          }
        }

        switch (this.state) {
          case JOY_CALB_STATE:
            break;
          case INTRO_START_STATE:
            if (G.dev & EDIT_MODE) this.set_state(RUN_STATE);
            else this.set_state(MENU_STATE);
            break;
          case PAUSE_STATE:
            if (ev.type === EV_KEY && (ev.key === JK_SPACE || ev.key === JK_ENTER)) this.set_state(RUN_STATE);
            break;
          case RUN_STATE:
            if (ev.window === null) {
              switch (ev.type) {
                case EV_KEY:
                  switch (ev.key) {
                    case 109: // 'm'
                      if (G.dev & MAP_MODE) G.dev -= MAP_MODE;
                      else if ((L.player_list && L.player_list.next) || G.dev & EDIT_MODE) G.dev |= MAP_MODE;
                      this.need_refresh();
                      break;
                    case 118: // 'v'
                      G.wm.push_event(event.msg(DO_VOLUME, null));
                      break;
                    case 112: // 'p'
                      if (!(G.dev & EDIT_MODE) && (!main_net_cfg || (main_net_cfg.state !== net_configuration.SERVER &&
                        main_net_cfg.state !== net_configuration.CLIENT))) this.set_state(PAUSE_STATE);
                      break;
                    case 83: // 'S'
                      break;
                    case JK_TAB:
                      this.need_refresh();
                      break;
                    case 99: case 67: // 'c', 'C'
                      if (CL.chatting_enabled && !(G.dev & EDIT_MODE) && GM_.chat) GM_.chat.toggle();
                      break;
                    case 57: // '9'
                      G.dev = G.dev ^ PERFORMANCE_TEST_MODE;
                      this.need_refresh();
                      break;
                  }
                  break;
                case EV_RESIZE:
                  for (let v = this.first_view; v; v = v.next) {
                    if (v.local_player()) {
                      const w = G.xres - 10, h = G.yres - 10;
                      v.suggest.send_view = 1;
                      v.suggest.cx1 = 5;
                      v.suggest.cx2 = 5 + w;
                      v.suggest.cy1 = 5;
                      v.suggest.cy2 = 5 + h;
                      v.suggest.pan_x = v.pan_x;
                      v.suggest.pan_y = v.pan_y;
                      v.suggest.shift_down = v.shift_down;
                      v.suggest.shift_right = v.shift_right;
                    }
                  }
                  this.draw();
                  break;
                case EV_REDRAW:
                  G.screen.AddDirty(ev.redraw.x1, ev.redraw.y1, ev.redraw.x2 + 1, ev.redraw.y2 + 1);
                  break;
                case EV_MESSAGE:
                  switch (ev.message.id) {
                    case RAISE_SFX: case LOWER_SFX: case RAISE_MUSIC: case LOWER_MUSIC:
                      if (ev.message.id === RAISE_SFX && S.sfx_volume !== 127) S.sfx_volume = Math.min(127, S.sfx_volume + 16);
                      if (ev.message.id === LOWER_SFX && S.sfx_volume !== 0) S.sfx_volume = Math.max(S.sfx_volume - 16, 0);
                      if (ev.message.id === RAISE_MUSIC && S.music_volume !== 126) {
                        S.music_volume = Math.min(S.music_volume + 16, 127);
                        if (G.current_song && (S.sound_avail & MUSIC_INITIALIZED)) G.current_song.set_volume(S.music_volume);
                      }
                      if (ev.message.id === LOWER_MUSIC && S.music_volume !== 0) {
                        S.music_volume = Math.max(S.music_volume - 16, 0);
                        if (G.current_song && (S.sound_avail & MUSIC_INITIALIZED)) G.current_song.set_volume(S.music_volume);
                      }
                      (ev.message.data as { push(): void }).push();
                      break;
                  }
                  break;
              }
            }
            break;
        }
      }
    }
  }

  async step(): Promise<void> {
    clear_tmp();
    const lv = G.current_level;
    if (lv) {
      lv.unactivate_all();
      GM_.total_active = 0;
      for (let f = this.first_view; f; f = f.next) {
        if (f.focus) {
          f.update_scroll();
          const w = f.cx2 - f.cx1 + 1, h = f.cy2 - f.cy1 + 1;
          GM_.total_active += lv.add_actives(f.xoff() - ((w / 4) | 0), f.yoff() - ((h / 4) | 0),
            f.xoff() + w + ((w / 4) | 0), f.yoff() + h + ((h / 4) | 0));
        }
      }
    }
    if (this.state === RUN_STATE) {
      if ((G.dev & EDIT_MODE) || (main_net_cfg && (main_net_cfg.state === net_configuration.CLIENT ||
        main_net_cfg.state === net_configuration.SERVER))) G.idle_ticks = 0;
      if (demo_man.current_state() === demo_manager.NORMAL && G.idle_ticks > 420 && G.demo_start) {
        G.idle_ticks = 0;
        this.set_state(MENU_STATE);
      } else if (!(G.dev & EDIT_MODE)) {
        if (this.key_down(JK_ESC)) {
          this.set_state(MENU_STATE);
          this.set_key_down(JK_ESC, 0);
        }
        LG.ambient_ramp = 0;
        for (let v = this.first_view; v; v = v.next) v.update_scroll();
        cache.prof_poll_start();
        await G.current_level.tick();
        sbar.step();
      } else this.dev_scroll();
    } else if (this.state === JOY_CALB_STATE) {
      // no joystick
    } else if (this.state === MENU_STATE) await main_menu();

    if ((this.key_down(120) || this.key_down(JK_F4)) && (this.key_down(JK_ALT_L) || this.key_down(JK_ALT_R)) &&
      (await confirm_quit())) this.finished = true;
  }

  draw(scene_mode = 0): void {
    const screen = G.screen;
    screen.AddDirty(0, 0, G.xres + 1, G.yres + 1);
    screen.clear();
    if (scene_mode) {
      const helpstr = 'ARROW KEYS CHANGE TEXT SPEED';
      const fnt = G.wm.font();
      const x = ((screen.Size().x / 2) | 0) - (((fnt.width() * helpstr.length) / 2) | 0);
      fnt.put_string(screen, x + 1, screen.Size().y - fnt.height() - 5 + 1, helpstr, G.wm.dark_color());
      fnt.put_string(screen, x, screen.Size().y - fnt.height() - 5, helpstr, G.wm.bright_color());
    }
    for (let f = this.first_view; f; f = f.next) this.draw_map(f, 0);
    sbar.redraw(screen);
  }

  /** Game::Game(argc, argv), up to the title */
  async init(argv: string[]): Promise<void> {
    G.req_name = '';
    G.bg_xmul = G.bg_ymul = 1;
    G.bg_xdiv = G.bg_ydiv = 8;
    this.last_input = null;
    AM.current_automap = null;
    G.current_level = null as never;
    this.refresh = 1;
    G.the_game = this;
    this.top_menu = this.joy_win = null;
    this.old_view = this.first_view = null;
    this.nplayers = 1;
    this.help_text_frames = 0;
    this.help_text = '';
    for (let i = 1; i < argv.length; i++) {
      if (argv[i] === '-no_delay') {
        this.no_delay = 1;
        dprintf('Frame delay off (-nodelay)\n');
      }
    }
    this.zoom = 15;
    this.no_delay = 0;
    this.has_joystick = 0;
    vfsDelete(`${get_save_filename_prefix()}fastload.dat`);

    load_data(argv);
    get_key_bindings();
    this.reset_keymap();
    this.finished = false;
    calc_light_table(G.pal);

    set_mode();
    palette_load(G.pal);
    recalc_local_view_space();

    const wc = cache.img(LD.window_colors);
    this.dark_color = this.get_color(wc.Pixel(2, 0));
    this.bright_color = this.get_color(wc.Pixel(0, 0));
    this.med_color = this.get_color(wc.Pixel(1, 0));
    this.morph_dark_color = this.get_color(wc.Pixel(2, 1));
    this.morph_bright_color = this.get_color(wc.Pixel(0, 1));
    this.morph_med_color = this.get_color(wc.Pixel(1, 1));
    GM_.morph_sel_frame_color = G.pal.find_closest(255, 255, 0);
    LD.light_connection_color = GM_.morph_sel_frame_color;

    if (NILP(symbol_value(L.l_default_font))) throw new AbuseError('No font defined, set symbol default-font to an image name');
    let font_pict: number;
    if (G.big_font_pict !== -1) {
      if (G.small_font_pict !== -1) font_pict = (G.xres / (G.start_doubled ? 2 : 1)) > 400 ? G.big_font_pict : G.small_font_pict;
      else font_pict = G.big_font_pict;
    } else font_pict = G.small_font_pict;
    if (G.console_font_pict === -1) G.console_font_pict = font_pict;
    this.game_font = new JCFont(cache.img(font_pict));
    G.console_font = new JCFont(cache.img(G.console_font_pict));
    G.wm = new WindowManager(G.screen, G.pal, this.bright_color, this.med_color, this.dark_color, this.game_font);
    stat_man.gui = true;
    stat_man.first = [];
    GM_.chat = new chat_console(G.console_font, 50, 6, 'chat');

    if (!G.wm.has_mouse()) throw new AbuseError('No mouse driver detected, please rectify.');
    G.pal = await gamma_correct(G.pal);

    if (main_net_cfg === null || (main_net_cfg.state !== net_configuration.SERVER && main_net_cfg.state !== net_configuration.CLIENT)) {
      if (!G.start_edit && !net_start()) await do_title();
    } else if (main_net_cfg && main_net_cfg.state === net_configuration.SERVER) {
      this.load_level(G.level_file);
      G.start_running = 1;
    }

    G.dev |= DRAW_FG_LAYER | DRAW_BG_LAYER | DRAW_PEOPLE_LAYER | DRAW_HELP_LAYER | DRAW_LIGHTS | DRAW_LINKS;
    this.state = START_STATE;
    if (G.start_running) this.set_state(RUN_STATE);
    else {
      G.screen.clear();
      if (G.title_screen >= 0) {
        const tit = cache.img(G.title_screen);
        tit.put_image(G.screen, ((G.screen.Size().x / 2) | 0) - ((tit.Size().x / 2) | 0),
          ((G.screen.Size().y / 2) | 0) - ((tit.Size().y / 2) | 0));
      }
      this.set_state(MENU_STATE);
    }
  }

  /** ~Game */
  destroy(): void {
    if (this.first_view === L.player_list) this.first_view = null;
    while (L.player_list) {
      const p: view = L.player_list;
      const o = p.focus;
      L.player_list = L.player_list.next;
      p.destroy();
      o?.set_controller(null);
      if (G.current_level && o) G.current_level.delete_object(o);
    }
    if (G.current_level) {
      G.current_level.destroy();
      G.current_level = null as never;
    }
    while (this.first_view) {
      const p: view = this.first_view;
      this.first_view = this.first_view.next;
      p.destroy();
    }
    L.player_list = null;
    this.old_view = null;
    free_pframes();
  }
}


async function Fade(N: number, im: image | null, steps: number): Promise<void> {
  const duration = f32(25);
  const old_pal = G.pal.copy();
  const screen = G.screen;
  if (im) {
    screen.clear();
    im.put_image(screen, (((G.xres + 1) / 2) | 0) - ((im.Size().x / 2) | 0), (((G.yres + 1) / 2) | 0) - ((im.Size().y / 2) | 0));
  }
  const limit = f32(duration * steps);
  for (const total = new Timer(); total.PollMs() < limit;) {
    const frame = new Timer();
    const sl1 = G.pal.addr(), sl2 = old_pal.addr();
    const i = Math.trunc(f32(total.PollMs() / duration));
    const v = (((N ? i + 1 : steps - i) * 256) / steps) | 0;
    for (let j = 0; j < 3 * 256; j++) sl1[j] = ((sl2[j] * v) / 256) | 0;
    palette_load(G.pal);
    G.wm.flush_screen();
    await frame.WaitMs(duration);
  }
  if (N === 0) {
    screen.clear();
    G.wm.flush_screen();
    palette_load(old_pal);
  }
  G.pal = old_pal;
}

export async function fade_in(im: image | null, steps: number): Promise<void> { await Fade(1, im, steps); }
export async function fade_out(steps: number): Promise<void> { await Fade(0, null, steps); }

export async function do_title(): Promise<void> {
  if (G.cdc_logo === -1) return;
  if (S.sound_avail & MUSIC_INITIALIZED) {
    if (G.current_song) {
      G.current_song.stop();
      G.current_song.destroy();
    }
    G.current_song = new song('music/intro.hmi');
    G.current_song.play(S.music_volume);
  }
  const logo_snd = find_or_create('LOGO_SND').value;
  if (DEFINEDP(logo_snd) && (S.sound_avail & SFX_INITIALIZED)) cache.sfx(lnumber_value(logo_snd)).play(S.sfx_volume);

  const blank = new image(2, 2);
  blank.clear();
  G.wm.set_mouse_shape(blank.copy(), 0, 0);
  await fade_in(cache.img(G.cdc_logo), 32);
  await new Timer().WaitMs(400);
  await fade_out(32);

  const space_snd = find_or_create('SPACE_SND').value;
  const str = lstring_value(lisp_eval(find_or_create('plot_start')));

  const fp = open_file('art/smoke.spe', 'rb');
  if (!fp.open_failure()) {
    const sd = new spec_directory(fp);
    const old_pal = G.pal;
    G.pal = palette.fromFile(fp, sd.find_type(SPEC_PALETTE));
    G.pal.shift(1);
    const gray = image.load(fp, sd.find('gray_pict'));
    const smoke: image[] = [];
    for (let i = 0; i < 5; i++) smoke[i] = image.load(fp, sd.find(`smoke${String(i + 1).padStart(4, '0')}.pcx`));
    const screen = G.screen;
    screen.clear();
    palette_load(G.pal);
    const dx = (((G.xres + 1) / 2) | 0) - ((gray.Size().x / 2) | 0), dy = (((G.yres + 1) / 2) | 0) - ((gray.Size().y / 2) | 0);
    gray.put_image(screen, dx, dy);
    smoke[0].put_image(screen, dx + 24, dy + 5);
    await fade_in(null, 16);
    const cmap = new Uint8Array(32);
    for (let i = 0; i < 32; i++) cmap[i] = G.pal.find_closest((i * 256 / 32) | 0, (i * 256 / 32) | 0, (i * 256 / 32) | 0);

    const ev = new event();
    ev.type = EV_SPURIOUS;
    const total = new Timer();
    while (ev.type !== EV_KEY && ev.type !== EV_MOUSE_BUTTON) {
      const frame = new Timer();
      const i = Math.trunc(f32(total.PollMs() / f32(120)));
      if (i >= 400) break;
      gray.put_image(screen, dx, dy);
      smoke[i % 5].put_image(screen, dx + 24, dy + 5);
      text_draw(205 - i, dx + 15, dy, dx + 320 - 15, dy + 199, str, G.wm.font(), cmap, G.wm.bright_color());
      G.wm.flush_screen();
      new time_marker();
      while (G.wm.event_waiting() && ev.type !== EV_KEY) await G.wm.get_event(ev);
      if (i % 5 === 0 && DEFINEDP(space_snd) && (S.sound_avail & SFX_INITIALIZED))
        cache.sfx(lnumber_value(space_snd)).play(((S.sfx_volume * 90) / 127) | 0);
      await frame.WaitMs(25);
      frame.GetMs();
    }
    G.the_game.reset_keymap();
    await fade_out(16);
    G.pal = old_pal;
  }
  fp.close();
  if (G.title_screen >= 0) await fade_in(cache.img(G.title_screen), 32);
}

export function net_send(force = 0): void {
  if (!(G.dev & EDIT_MODE) || force) {
    if (demo_man.state === demo_manager.PLAYING) base.input_state = INPUT_PROCESSING;
    else {
      if (!L.player_list!.focus) throw new AbuseError('Players have not been created\ncall create_players');
      for (let p = L.player_list; p; p = p.next) if (p.local_player()) p.get_input();
      base.packet.write_uint8(SCMD_SYNC);
      base.packet.write_uint16(make_sync());
      if (base.join_list) base.packet.write_uint8(SCMD_RELOAD);
      send_local_request(null);
    }
  }
}

export async function net_receive(): Promise<void> {
  if (!(G.dev & EDIT_MODE) && G.current_level) {
    let buf: Uint8Array;
    if (demo_man.state === demo_manager.PLAYING) {
      buf = demo_man.get_packet() ?? new Uint8Array(0);
      base.packet.packet_reset();
      base.mem_lock = 0;
    } else {
      buf = await get_inputs_from_server();
      if (demo_man.state === demo_manager.RECORDING) demo_man.save_packet(buf, buf.length);
    }
    process_packet_commands(buf, buf.length);
  }
}

export function music_check(): void {
  if (S.sound_avail & MUSIC_INITIALIZED) {
    if (G.current_song && !G.current_song.playing()) {
      G.current_song.play(S.music_volume);
      dprintf('song finished\n');
    }
    if (!G.current_song) {
      G.current_song = new song('music/intro.hmi');
      G.current_song.play(S.music_volume);
    }
  }
}

function start_sound(argv: string[]): void {
  S.sfx_volume = S.music_volume = 127;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '-sfx_volume') {
      const v = parseInt(argv[++i], 10) | 0;
      if (v >= 0 && v < 127) S.sfx_volume = v;
    } else if (argv[i] === '-music_volume') {
      const v = parseInt(argv[++i], 10) | 0;
      if (v >= 0 && v < 127) S.music_volume = v;
    }
  }
  S.sound_avail = sound_init();
}

/** hooks the rest of the program is given (the main loop's per-iteration work of an online game) */
export const main_hooks = {
  /** service_net_request / server_check: the online game's turn of the network */
  service: async (): Promise<void> => {},
  /** the console's printer (game_printer); the page may show it */
  printer: (_s: string): void => {},
};

/** main(argc, argv): runs the game until the player quits; ends with ExitProgram or returns */
export async function abuse_main(argv: string[]): Promise<void> {
  G.start_argv = argv;
  set_dprinter((s) => main_hooks.printer(s));
  setup(argv);
  dprintf('Abuse version 0.8\n');
  start_sound(argv);
  jrand_init();
  jrand();
  set_spec_main_file('abuse.spe');

  // game_net_init / net_init: the configuration exists from the start; a protocol is there unless -nonet
  if (!main_net_cfg) set_main_net_cfg(new net_configuration());
  NETP.prot = !argv.includes('-nonet');
  stat_man.gui = false;
  clisp_connect(stat_man);
  level_status.push = (s) => stat_man.push(s);
  level_status.update = (p) => stat_man.update(p);
  level_status.pop = () => stat_man.pop();
  lisp_init();
  dev_init(argv);
  const g = new Game();
  await g.init(argv);
  DC.dev_cont = new dev_controll();
  DC.dev_cont.load_stuff();
  await g.get_input();
  net_send(1);
  if (net_start()) {
    await g.step();
    await g.calc_speed();
    g.update_screen();
  }

  while (!g.done()) {
    music_check();
    if (G.req_end) {
      if (G.current_level) G.current_level.destroy();
      G.current_level = null as never;
      await show_end();
      G.the_game.set_state(MENU_STATE);
      G.req_end = 0;
    }
    if (demo_man.current_state() === demo_manager.NORMAL) await net_receive();
    if (G.req_name) {
      g.load_level(G.req_name);
      G.req_name = '';
      g.draw(g.state === SCENE_STATE ? 1 : 0);
    }
    await g.get_input();
    if (demo_man.current_state() === demo_manager.NORMAL) net_send();
    else demo_man.do_inputs();
    await main_hooks.service();
    await g.step();
    await run_deferred();
    await g.calc_speed();
    if (!G.req_name) g.update_screen();
  }

  await new Timer().WaitMs(500);
  if (G.current_song) G.current_song.stop();
  G.current_song = null;
  cache.empty();
  g.destroy();
  compiled_uninit();
  delete_all_lights();
  const end_msg = find_or_create('end_msg');
  if (DEFINEDP(end_msg.value)) dprintf(`${lstring_value(end_msg.value)}\n`);
  lisp_uninit();
  base.packet.packet_reset();
  sound_uninit();
  void NET;
  void object_names;
  throw new ExitProgram(0);
}
