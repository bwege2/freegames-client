// menu.cpp: the main menu (the icons on the right of the title screen), the volume window, the
// difficulty file, the credits screen
import { G } from './globals.ts';
import { L } from './lglobals.ts';
import { cache } from './cache.ts';
import { SPEC_EXTERN_SFX, SPEC_IMAGE, get_save_filename_prefix } from './imlib/specs.ts';
import { event, EV_CLOSE_WINDOW, EV_KEY, EV_MESSAGE, EV_MOUSE_MOVE, EV_SPURIOUS } from './imlib/event.ts';
import { JK_ESC } from './imlib/keys.ts';
import { InputManager, type ifield } from './imlib/jwindow.ts';
import { image } from './imlib/image.ts';
import { CAR, CDR, DEFINEDP, find_or_create, lstring_value, symbol_value, compile_string, PERM_SPACE,
  current_space, set_current_space, type LObj, type LSymbol } from './lisp/lisp.ts';
import { dprintf } from './imlib/dprint.ts';
import { Timer, time_marker } from './rt/platform.ts';
import { S, SFX_INITIALIZED } from './sdlport/sound.ts';
import { VolumeWindow } from './volumewindow.ts';
import { ico_button, ico_switch_button } from './gui.ts';
import { gamma_correct } from './gamma.ts';
import { load_game, show_load_icon } from './loadgame.ts';
import { symbol_str } from './clisp.ts';
import { demo_man, demo_manager } from './demo.ts';
import { confirm_quit } from './dev.ts';
import { main_net_cfg, net_game, NETP } from './netcfg.ts';
import { CUR } from './statbar.ts';
import { fade_in, fade_out, open_FILE, RUN_STATE } from './game.ts';
import * as ID from './id.ts';

let volume_window: VolumeWindow | null = null;
/** net_configuration::input(): set by online.ts (the website's room dialog takes its place) */
export const net_dialog_hook = { run: async (): Promise<void> => {} };
const net_dialog = (): Promise<void> => net_dialog_hook.run();
/** the list of demos still to play (menu.cpp current_demo) */
export const MN = { current_demo: null as LObj };

/** percent is 0..256 */
export function tint_area(x1: number, y1: number, x2: number, y2: number, r_to: number, g_to: number, b_to: number, percent: number): void {
  const screen = G.screen;
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  if (x1 < cx1) x1 = cx1;
  if (y1 < cy1) y1 = cy1;
  if (x2 > cx2 - 1) x2 = cx2 - 1;
  if (y2 > cy2 - 1) y2 = cy2 - 1;
  if (x2 < x1 || y2 < y1) return;
  percent = 256 - percent;
  const pal = G.pal.addr(), d = screen.m_data;
  for (let y = y1; y <= y2; y++) {
    let sl = screen.scan_line(y) + x1;
    for (let x = x1; x <= x2; x++, sl++) {
      const p = d[sl] * 3;
      const r = ((((pal[p] - r_to) * percent) / 256) | 0) + r_to & 0xff;
      const g = ((((pal[p + 1] - g_to) * percent) / 256) | 0) + g_to & 0xff;
      const b = ((((pal[p + 2] - b_to) * percent) / 256) | 0) + b_to & 0xff;
      d[sl] = G.color_table.Lookup(r >> 3, g >> 3, b >> 3);
    }
  }
  screen.AddDirty(x1, y1, x2 + 1, y2 + 1);
}

export function darken_area(x1: number, y1: number, x2: number, y2: number, amount: number): void {
  const screen = G.screen;
  const [cx1, cy1, cx2, cy2] = screen.GetClip();
  if (x1 < cx1) x1 = cx1;
  if (y1 < cy1) y1 = cy1;
  if (x2 > cx2 - 1) x2 = cx2 - 1;
  if (y2 > cy2 - 1) y2 = cy2 - 1;
  if (x2 < x1 || y2 < y1) return;
  const pal = G.pal.addr(), d = screen.m_data;
  for (let y = y1; y <= y2; y++) {
    let sl = screen.scan_line(y) + x1;
    for (let x = x1; x <= x2; x++, sl++) {
      const p = d[sl] * 3;
      const r = ((pal[p] * amount) / 256) & 0xff;
      const g = ((pal[p + 1] * amount) / 256) & 0xff;
      const b = ((pal[p + 2] * amount) / 256) & 0xff;
      d[sl] = G.color_table.Lookup(r >> 3, g >> 3, b >> 3);
    }
  }
  screen.AddDirty(x1, y1, x2 + 1, y2 + 1);
}

export function dark_widget(x1: number, y1: number, x2: number, y2: number, br: number, dr: number, amount: number): void {
  const screen = G.screen;
  screen.AddDirty(x1, y1, x2 + 1, y2 + 1);
  screen.line(x1, y1, x1, y2, br);
  screen.line(x1 + 1, y1, x2, y1, br);
  screen.line(x2, y1 + 1, x2, y2, dr);
  screen.line(x1 + 1, y2, x2, y2, dr);
  darken_area(x1 + 1, y1 + 1, x2 - 1, y2 - 1, amount);
}

async function create_volume_window(): Promise<void> {
  volume_window = VolumeWindow.create();
  volume_window.inm.allow_no_selections();
  volume_window.inm.clear_current();
  G.wm.show_window(volume_window);
  G.wm.grab_focus(volume_window);
  G.wm.flush_screen();
  while (volume_window) {
    const ev = new event();
    do await G.wm.get_event(ev);
    while (ev.type === EV_MOUSE_MOVE && G.wm.event_waiting());
    G.wm.flush_screen();
    if (ev.type === EV_CLOSE_WINDOW || (ev.type === EV_KEY && ev.key === JK_ESC)) {
      G.wm.close_window(volume_window);
      volume_window = null;
    }
    if (!volume_window) break;
    if (ev.type === EV_MESSAGE) {
      const s = 'sfx/ambtech1.wav';
      switch (ev.message.id) {
        case ID.ID_SFX_UP:
          S.sfx_volume += 16;
          if (S.sfx_volume > 127) S.sfx_volume = 127;
          volume_window.draw_sfx_vol();
          if (S.sound_avail & SFX_INITIALIZED) cache.sfx(cache.reg(s, s, SPEC_EXTERN_SFX, 1)).play(S.sfx_volume);
          break;
        case ID.ID_SFX_DOWN:
          S.sfx_volume -= 16;
          if (S.sfx_volume < 0) S.sfx_volume = 0;
          volume_window.draw_sfx_vol();
          if (S.sound_avail & SFX_INITIALIZED) cache.sfx(cache.reg(s, s, SPEC_EXTERN_SFX, 1)).play(S.sfx_volume);
          break;
        case ID.ID_MUSIC_UP:
          S.music_volume += 16;
          if (S.music_volume > 127) S.music_volume = 127;
          volume_window.draw_music_vol();
          if (G.current_song) G.current_song.set_volume(S.music_volume);
          break;
        case ID.ID_MUSIC_DOWN:
          S.music_volume -= 16;
          if (S.music_volume < 0) S.music_volume = 0;
          volume_window.draw_music_vol();
          if (G.current_song) G.current_song.set_volume(S.music_volume);
          break;
      }
    }
  }
  // wm->close_window(volume_window) with NULL: nothing
}

/** save_difficulty: hardness.lsp in the save directory */
export function save_difficulty(): void {
  const fp = open_FILE('hardness.lsp', 'wb');
  if (!fp) {
    dprintf('Unable to write to file hardness.lsp\n');
    return;
  }
  let text = "(setf difficulty '";
  const d = symbol_value(L.l_difficulty);
  if (DEFINEDP(d)) {
    if (d === L.l_extreme) text += 'extreme)\n';
    else if (d === L.l_hard) text += 'hard)\n';
    else if (d === L.l_easy) text += 'easy)\n';
    else text += 'medium)\n';
  } else text += 'medium)\n';
  fp.write(Array.from(text, (c) => c.charCodeAt(0)));
  fp.close();
}

export async function show_sell(abortable: number): Promise<void> {
  const ss = find_or_create('sell_screens');
  if (!DEFINEDP(ss.value)) {
    const sp = current_space;
    set_current_space(PERM_SPACE);
    ss.value = compile_string('(("art/fore/endgame.spe" . "credit"))');
    set_current_space(sp);
  }
  if (DEFINEDP(ss.value)) {
    const blank = new image(2, 2);
    blank.clear();
    G.wm.set_mouse_shape(blank.copy(), 0, 0);
    let tmp = ss.value;
    let quit = 0;
    while (tmp && !quit) {
      const im = cache.reg_object('art/help.spe', CAR(tmp), SPEC_IMAGE, 1);
      await fade_in(cache.img(im), 16);
      const ev = new event();
      do {
        G.wm.flush_screen();
        await G.wm.get_event(ev);
      } while (ev.type !== EV_KEY);
      if (ev.key === JK_ESC && abortable) quit = 1;
      await fade_out(16);
      tmp = CDR(tmp);
    }
    G.wm.set_mouse_shape(cache.img(CUR.c_normal).copy(), 1, 1);
  }
}

async function menu_handler(ev: event, inm: InputManager): Promise<void> {
  switch (ev.type) {
    case EV_MESSAGE:
      switch (ev.message.id) {
        case ID.ID_LIGHT_OFF:
          if (!volume_window) G.pal = await gamma_correct(G.pal, 1);
          break;
        case ID.ID_RETURN:
          if (!volume_window) G.the_game.set_state(RUN_STATE);
          break;
        case ID.ID_START_GAME:
          if (!volume_window) {
            G.the_game.load_level(G.level_file);
            G.the_game.set_state(RUN_STATE);
            for (let v = L.player_list; v; v = v.next) if (v.focus) v.reset_player();
          }
          break;
        case ID.ID_LOAD_PLAYER_GAME:
          if (!volume_window) {
            const got_level = await load_game(0, symbol_str('LOAD'));
            G.the_game.reset_keymap();
            if (got_level) {
              G.the_game.load_level(`${get_save_filename_prefix()}save${String(got_level).padStart(4, '0')}.spe`);
              G.the_game.set_state(RUN_STATE);
            }
          }
          break;
        case ID.ID_VOLUME:
          if (!volume_window) await create_volume_window();
          break;
        case ID.ID_MEDIUM:
          (L.l_difficulty as LSymbol).value = L.l_medium;
          save_difficulty();
          break;
        case ID.ID_HARD:
          (L.l_difficulty as LSymbol).value = L.l_hard;
          save_difficulty();
          break;
        case ID.ID_EXTREME:
          (L.l_difficulty as LSymbol).value = L.l_extreme;
          save_difficulty();
          break;
        case ID.ID_EASY:
          (L.l_difficulty as LSymbol).value = L.l_easy;
          save_difficulty();
          break;
        case ID.ID_NETWORKING:
          if (!volume_window) {
            await net_dialog();
            G.the_game.draw(0);
            inm.redraw();
          }
          break;
        case ID.ID_SHOW_SELL:
          if (!volume_window) {
            await show_sell(1);
            G.screen.clear();
            if (G.title_screen >= 0) {
              const tit = cache.img(G.title_screen);
              tit.put_image(G.screen, ((G.screen.Size().x / 2) | 0) - ((tit.Size().x / 2) | 0),
                ((G.screen.Size().y / 2) | 0) - ((tit.Size().y / 2) | 0));
            }
            inm.redraw();
            await fade_in(null, 8);
            G.wm.flush_screen();
          }
          break;
      }
      break;
    case EV_CLOSE_WINDOW:
      if (ev.window === volume_window) {
        G.wm.close_window(volume_window!);
        volume_window = null;
      }
      break;
  }
}

function load_icon(num: number, id: number, x: number, y: number, hh: { h: number }, next: ifield | null, key: string): ico_button {
  const base = 'newi';
  const nm = (n: number): string => `${base}${String(n).padStart(4, '0')}.pcx`;
  const a = cache.reg('art/icons.spe', nm(num * 3 + 1), SPEC_IMAGE, 1);
  const b = cache.reg('art/icons.spe', nm(num * 3 + 2), SPEC_IMAGE, 1);
  const c = cache.reg('art/icons.spe', nm(num * 3 + 3), SPEC_IMAGE, 1);
  hh.h = cache.img(a).Size().y;
  return new ico_button(x, y, id, b, b, a, c, next, -1, key);
}

function make_default_buttons(x: number, yy: { y: number }, append_list: ico_button | null): ico_button {
  const hh = { h: 0 };
  let diff_on: number;
  const d = symbol_value(L.l_difficulty);
  if (DEFINEDP(d)) {
    if (d === L.l_extreme) diff_on = 3;
    else if (d === L.l_hard) diff_on = 2;
    else if (d === L.l_easy) diff_on = 0;
    else diff_on = 1;
  } else diff_on = 3;

  const start = load_icon(0, ID.ID_START_GAME, x, yy.y, hh, null, 'ic_start');
  yy.y += hh.h;
  let set: ico_switch_button | null = null;
  if (!net_game()) {
    // the arguments of the nested calls are evaluated innermost first (clang: left to right, so the
    // outer load_icon's y is read before the inner ones run; all use the same y)
    const y = yy.y;
    const extreme = load_icon(10, ID.ID_EXTREME, x, y, hh, null, 'ic_extreme');
    const hard = load_icon(9, ID.ID_HARD, x, y, hh, extreme, 'ic_hard');
    const medium = load_icon(8, ID.ID_MEDIUM, x, y, hh, hard, 'ic_medium');
    const easy = load_icon(3, ID.ID_EASY, x, y, hh, medium, 'ic_easy');
    set = new ico_switch_button(x, y, ID.ID_NULL, diff_on, easy, null);
    yy.y += hh.h;
  }
  const color = load_icon(4, ID.ID_LIGHT_OFF, x, yy.y, hh, null, 'ic_gamma');
  yy.y += hh.h;
  const volume = load_icon(5, ID.ID_VOLUME, x, yy.y, hh, null, 'ic_volume');
  yy.y += hh.h;
  const sell = NETP.prot ? load_icon(11, ID.ID_NETWORKING, x, yy.y, hh, null, 'ic_networking')
    : load_icon(2, ID.ID_SHOW_SELL, x, yy.y, hh, null, 'ic_sell');
  yy.y += hh.h;
  const quit = load_icon(6, ID.ID_QUIT, x, yy.y, hh, null, 'ic_quit');
  yy.y += hh.h;

  if (set) {
    start.next = set;
    set.next = color;
  } else start.next = color;
  color.next = volume;
  volume.next = sell;
  sell.next = quit;

  let list: ico_button = start;
  if (append_list) {
    list = append_list;
    let a: ifield = append_list;
    while (a.next) a = a.next;
    a.next = start;
  }
  return list;
}

function make_conditional_buttons(x: number, yy: { y: number }): ico_button | null {
  let start_list: ico_button | null = null;
  const hh = { h: 0 };
  if (G.current_level) {
    start_list = load_icon(7, ID.ID_RETURN, x, yy.y, hh, null, 'ic_return');
    yy.y += hh.h;
  }
  let load: ico_button | null = null;
  if (show_load_icon()) {
    load = load_icon(1, ID.ID_LOAD_PLAYER_GAME, x, yy.y, hh, null, 'ic_load');
    yy.y += hh.h;
  }
  if (start_list) start_list.next = load;
  else start_list = load;
  return start_list;
}

export async function main_menu(): Promise<void> {
  const yy = { y: ((G.yres / 2) | 0) - 100 };
  let list = make_conditional_buttons(G.xres - 33, yy);
  list = make_default_buttons(G.xres - 33, yy, list);

  const inm = new InputManager(G.screen, list);
  inm.allow_no_selections();
  inm.clear_current();
  G.screen.AddDirty(0, 0, 320, 200);

  const ev = new event();
  let stop_menu = 0;
  const start = new time_marker();
  G.wm.flush_screen();
  do {
    const new_time = new time_marker();
    if (G.wm.event_waiting()) {
      do await G.wm.get_event(ev);
      while (ev.type === EV_MOUSE_MOVE && G.wm.event_waiting());
      inm.handle_event(ev, null);
      if (ev.type === EV_KEY && ev.key === JK_ESC) G.wm.push_event(event.msg(ID.ID_QUIT, null));
      await menu_handler(ev, inm);
      start.get_time();
      G.wm.flush_screen();
    } else await new Timer().WaitMs(30);

    if (new_time.diff_time(start) > 10) {
      if (volume_window) start.get_time();
      else {
        if (!MN.current_demo) {
          const d = find_or_create('demos');
          if (DEFINEDP(d.value)) MN.current_demo = d.value;
        }
        if (MN.current_demo) {
          demo_man.set_state(demo_manager.PLAYING, lstring_value(CAR(MN.current_demo)));
          stop_menu = 1;
          MN.current_demo = CDR(MN.current_demo);
        }
      }
    }

    if (volume_window) stop_menu = 0;
    else if (main_net_cfg && main_net_cfg.restart_state()) stop_menu = 1;
    else if (G.the_game.state === RUN_STATE) stop_menu = 1;
    else if (ev.type === EV_MESSAGE) {
      if (ev.message.id === ID.ID_START_GAME || ev.message.id === ID.ID_RETURN) stop_menu = 1;
      else if (ev.message.id === ID.ID_QUIT) {
        if (await confirm_quit()) stop_menu = 1;
        else {
          ev.type = EV_SPURIOUS;
          start.get_time();
        }
      }
    }
  } while (!stop_menu);

  if (ev.type === EV_MESSAGE && ev.message.id === ID.ID_QUIT) G.the_game.end_session();
}
