// lw/menu.ts: the menus: src/menu.c (main menu, confirm quit), options.c, graphics.c, wave.c, volume.c,
// rules.c, advanced.c, speeds.c, controls.c, language.c, about.c, help.c, lw6.c. The map menu is in
// level.ts, the teams' menu in team.ts.

import {
  D_EXIT, D_HIDDEN, type Dialog, dialogArray, MSG_DRAW, shutdown_dialog,
} from '../al/gui.ts';
import { show_mouse } from '../al/mouse.ts';
import { CharBuf, my_button_proc, my_slider_proc, my_textbox_proc, refOf, type IntRef } from './alleg2.ts';
import { display_back_image } from './back.ts';
import { DISPLAY_DELAY_MIN, LOGIC_DELAY_MIN, load_default_options, load_default_rules } from './config.ts';
import { MIN_MAP_RES_H, MIN_MAP_RES_W } from './core.ts';
import {
  color_one_dialog, menu_real_coord, my_do_dialog, my_do_dialog_no_clear, my_init_dialog, my_update_dialog,
  quick_buttons, slider_int, standard_big_button, standard_button, standard_small_button,
} from './dialog.ts';
import { GFX_MODE_H, GFX_MODE_W, set_resolution } from './gfxmode.ts';
import { lw_lang_language, lw_lang_string, LW_LANG_LANGUAGE_AUTO, LW_LANG_NB_LANGUAGES } from './lang.ts';
import { L } from './langids.ts';
import { choose_map } from './level.ts';
import { start_play_time, write_time } from './lwtime.ts';
import { lw_mouse_reset_control } from './mouse.ts';
import { my_fade_in, my_fade_out, my_set_palette } from './palette.ts';
import { play_click } from './sound.ts';
import {
  CONFIG_CPU_VS_HUMAN_ALWAYS, CONFIG_CPU_VS_HUMAN_NEVER, G, MENU_EXIT, MENU_H_QUICK, MENU_H_SPACE, MENU_H_STANDARD,
  MENU_PLAY, MENU_QUICK_BACK, MENU_QUICK_MAIN, MENU_QUICK_PLAY, MENU_QUICK_QUIT, MENU_TOP, MENU_VIRTUAL_H, MENU_VIRTUAL_W,
  MENU_W_QUICK, MENU_W_SPACE,
} from './state.ts';
import { choose_teams } from './team.ts';

export const menuHooks = {
  /** the "Net game" entry (netgame.c's network_game in the original): the website's lobby */
  network_game: null as (() => Promise<number>) | null,
  /** the network game itself after Play in a connected game (netplay.c's netplay_sequence) */
  netplay_sequence: null as (() => Promise<number>) | null,
};

/** the end of every menu loop: Back, Main, Quit (with confirmation), Play */
async function quickChoice(choix: number, onQuitCancel?: () => void): Promise<number> {
  switch (choix) {
    case -1:
    case MENU_QUICK_BACK:
      return 1;
    case MENU_QUICK_MAIN:
      return MENU_TOP;
    case MENU_QUICK_QUIT:
      if (await confirm_quit()) return MENU_EXIT;
      onQuitCancel?.();
      return 0;
    case MENU_QUICK_PLAY:
      return MENU_PLAY;
  }
  return 0;
}

export async function confirm_quit(): Promise<boolean> {
  const d = dialogArray(3);
  d[2]!.proc = null;
  standard_button(d[0]!, 0, 0, 2, 1);
  standard_button(d[1]!, 1, 0, 2, 1);
  d[0]!.dp = lw_lang_string(L.MENU_EXITUNIX);
  d[1]!.dp = lw_lang_string(L.MENU_BACK);
  d[0]!.key = 0x71;
  d[1]!.key = 0x77;
  return (await my_do_dialog(d, 0)) === 0;
}

export async function main_menu(fade_in: boolean): Promise<void> {
  const d = dialogArray(11);
  let choix = 4, retour = 0;
  display_back_image();
  if (fade_in) my_fade_in();
  while (retour !== MENU_EXIT) {
    for (let i = 0; i < 6; ++i) standard_button(d[i + 4]!, 0, i, 1, 6);
    quick_buttons(d);
    d[MENU_QUICK_BACK]!.flags = D_HIDDEN;
    d[MENU_QUICK_MAIN]!.flags = D_HIDDEN;
    d[4]!.dp = lw_lang_string(L.MENU_PLAY);
    d[5]!.dp = lw_lang_string(L.MENU_NETGAME);
    d[6]!.dp = lw_lang_string(L.MENU_MAP);
    d[7]!.dp = lw_lang_string(L.MENU_TEAMS);
    d[8]!.dp = lw_lang_string(L.MENU_OPTIONS);
    d[9]!.dp = lw_lang_string(L.MENU_ABOUT);
    d[10]!.proc = null;
    choix = await my_do_dialog(d, choix);
    switch (choix) {
      case -1:
      case MENU_QUICK_QUIT:
        if (await confirm_quit()) retour = MENU_EXIT;
        break;
      case MENU_QUICK_PLAY:
        retour = MENU_PLAY;
        break;
      case 4: {
        G.LW_NETWORK_ON = 0;
        const { play_sequence } = await import('./play.ts');
        retour = await play_sequence();
        break;
      }
      case 5:
        retour = menuHooks.network_game ? await menuHooks.network_game() : 0;
        break;
      case 6:
        retour = await choose_map();
        break;
      case 7:
        retour = await choose_teams();
        break;
      case 8:
        retour = await options();
        break;
      case 9:
        retour = await lw_about();
        break;
    }
    if (retour === MENU_PLAY) {
      if (G.LW_NETWORK_ON && menuHooks.netplay_sequence) retour = await menuHooks.netplay_sequence();
      else {
        const { play_sequence } = await import('./play.ts');
        retour = await play_sequence();
      }
    }
  }
}

// ---- options.c ----

async function options(): Promise<number> {
  const d = dialogArray(12);
  let choix = 4, retour = 0;
  let gfxmode_change = 0;
  while (retour === 0) {
    for (let i = 0; i < 6; ++i) standard_button(d[i + 4]!, 0, i, 1, 8);
    standard_button(d[10]!, 0, 7, 1, 8);
    quick_buttons(d);
    d[4]!.dp = lw_lang_string(L.OPTIONS_GRAPHICS);
    d[5]!.dp = lw_lang_string(L.OPTIONS_SOUND);
    d[6]!.dp = lw_lang_string(L.OPTIONS_RULES);
    d[7]!.dp = lw_lang_string(L.OPTIONS_SPEEDS);
    d[8]!.dp = lw_lang_string(L.OPTIONS_CONTROLS);
    d[9]!.dp = lw_lang_string(L.OPTIONS_LANGUAGE);
    d[10]!.dp = lw_lang_string(L.OPTIONS_DEFAULT);
    d[11]!.proc = null;
    const old_gfx_menu = G.CONFIG_GFX_MENU;
    const old_fullscreen = G.CONFIG_FULLSCREEN;
    display_back_image();
    let dp;
    if (gfxmode_change) {
      gfxmode_change = 0;
      display_back_image();
      dp = await my_init_dialog(d, choix);
      my_fade_in();
    } else dp = await my_init_dialog(d, choix);
    show_mouse(true);
    while (await my_update_dialog(dp));
    choix = await shutdown_dialog(dp);
    play_click();
    switch (choix) {
      case -1:
      case MENU_QUICK_BACK:
      case MENU_QUICK_MAIN:
      case MENU_QUICK_QUIT:
      case MENU_QUICK_PLAY:
        retour = await quickChoice(choix, display_back_image);
        break;
      case 4:
        retour = await graphic_options();
        break;
      case 5:
        retour = await sound_options();
        break;
      case 6:
        retour = await rules_options();
        break;
      case 7:
        retour = await speeds_options();
        break;
      case 8:
        retour = await controls_options();
        break;
      case 9:
        retour = await language_options();
        break;
      case 10:
        load_default_options();
        G.WATER_VOLUME = G.CONFIG_WATER_VOLUME_MENU;
        if (old_gfx_menu !== G.CONFIG_GFX_MENU || old_fullscreen !== G.CONFIG_FULLSCREEN) {
          gfxmode_change = 1;
          set_resolution(G.CONFIG_GFX_MENU, 0, G.CONFIG_FULLSCREEN);
        }
        retour = 0;
        break;
    }
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- graphics.c ----

async function graphic_options(): Promise<number> {
  const ch = { menu: 0, game: 0 };
  let fullscreen_changed = 0;
  const d = dialogArray(20);
  let choix = 4, retour = 0;
  const y_pos = [0, 1, 3, 4, 5, 6, 8];
  const resStr = (label: number, r: number): string => `${lw_lang_string(label)}:${GFX_MODE_W[r]}x${GFX_MODE_H[r]}`.slice(0, 29);
  const onOff = (v: number): string => lw_lang_string(v ? L.GRAPHICS_ON : L.GRAPHICS_OFF);
  display_back_image();
  while (retour === 0) {
    for (let i = 0; i < 7; ++i) {
      standard_button(d[i + 4]!, 0, y_pos[i]!, 2, 10);
      d[i + 4]!.proc = my_textbox_proc;
    }
    for (let i = 0; i < 7; ++i) {
      standard_button(d[i + 11]!, 1, y_pos[i]!, 2, 10);
      d[i + 11]!.proc = my_slider_proc;
    }
    standard_button(d[18]!, 0, 9, 1, 10);
    d[18]!.dp = lw_lang_string(L.GRAPHICS_ADVANCED);
    quick_buttons(d);
    d[4]!.dp = lw_lang_string(L.GRAPHICS_VIDEOMODE);
    d[5]!.dp = lw_lang_string(L.GRAPHICS_BRIGHTNESS);
    d[6]!.dp = resStr(L.GRAPHICS_MENU, G.CONFIG_GFX_MENU);
    d[7]!.dp = resStr(L.GRAPHICS_GAME, G.CONFIG_GFX_GAME);
    d[8]!.dp = lw_lang_string(L.GRAPHICS_VIEWPORTSIZE);
    d[9]!.dp = lw_lang_string(L.GRAPHICS_PAGEFLIPPING);
    d[10]!.dp = lw_lang_string(L.GRAPHICS_WAVES);
    for (let i = 11; i <= 17; i++) d[i]!.dp = null;
    d[12]!.d1 = 18;
    d[13]!.d1 = d[14]!.d1 = 4;
    d[15]!.d1 = 8;
    d[16]!.d1 = 8;
    d[15]!.dp3 = refOf(G, 'CONFIG_VIEWPORT_SIZE');
    d[15]!.dp = null;
    d[15]!.dp2 = slider_int;
    d[15]!.d2 = G.CONFIG_VIEWPORT_SIZE;
    d[12]!.d2 = G.CONFIG_BRIGHTNESS;
    d[13]!.d2 = G.CONFIG_GFX_MENU;
    d[14]!.d2 = G.CONFIG_GFX_GAME;
    d[12]!.dp2 = (_dp3: unknown, d2: number) => {
      play_click();
      G.CONFIG_BRIGHTNESS = d2;
      my_set_palette();
      return 0;
    };
    d[13]!.dp2 = () => {
      play_click();
      ch.menu = 1;
      my_set_palette();
      return 0;
    };
    d[14]!.dp2 = () => {
      play_click();
      ch.game = 1;
      return 0;
    };
    d[11]!.proc = my_button_proc;
    d[11]!.dp = lw_lang_string(G.CONFIG_FULLSCREEN ? L.GRAPHICS_FULLSCREEN : L.GRAPHICS_WINDOWED);
    d[11]!.flags = D_EXIT;
    d[16]!.proc = my_button_proc;
    d[16]!.dp = onOff(G.CONFIG_PAGE_FLIP);
    d[16]!.flags = D_EXIT;
    d[17]!.proc = my_button_proc;
    d[17]!.dp = onOff(G.CONFIG_WAVE_ON);
    d[17]!.flags = D_EXIT;
    d[19]!.proc = null;
    ch.game = 0;
    let dp;
    if (ch.menu || fullscreen_changed) {
      ch.menu = 0;
      fullscreen_changed = 0;
      display_back_image();
      dp = await my_init_dialog(d, choix);
      my_fade_in();
    } else dp = await my_init_dialog(d, choix);
    show_mouse(true);
    while (ch.menu === 0 && ch.game === 0 && (await my_update_dialog(dp)));
    choix = await shutdown_dialog(dp);
    if (ch.menu) {
      if (d[13]!.d2 !== G.CONFIG_GFX_MENU) {
        my_fade_out();
        if (set_resolution(d[13]!.d2, 0, G.CONFIG_FULLSCREEN)) G.CONFIG_GFX_MENU = 0;
        else G.CONFIG_GFX_MENU = d[13]!.d2;
      }
      d[13]!.dp = resStr(L.GRAPHICS_MENU, G.CONFIG_GFX_MENU);
    } else if (ch.game) {
      G.CONFIG_GFX_GAME = d[14]!.d2;
      d[14]!.dp = resStr(L.GRAPHICS_GAME, G.CONFIG_GFX_GAME);
      retour = 0;
    } else {
      play_click();
      switch (choix) {
        case -1:
        case MENU_QUICK_BACK:
        case MENU_QUICK_MAIN:
        case MENU_QUICK_QUIT:
        case MENU_QUICK_PLAY:
          retour = await quickChoice(choix, display_back_image);
          break;
        case 11:
          G.CONFIG_FULLSCREEN = G.CONFIG_FULLSCREEN ? 0 : 1;
          d[11]!.dp = lw_lang_string(G.CONFIG_FULLSCREEN ? L.GRAPHICS_FULLSCREEN : L.GRAPHICS_WINDOWED);
          await my_button_proc(MSG_DRAW, d[11]!, 0);
          fullscreen_changed = 1;
          my_fade_out();
          set_resolution(d[13]!.d2, 0, G.CONFIG_FULLSCREEN);
          break;
        case 16:
          G.CONFIG_PAGE_FLIP = G.CONFIG_PAGE_FLIP ? 0 : 1;
          d[16]!.dp = onOff(G.CONFIG_PAGE_FLIP);
          await my_button_proc(MSG_DRAW, d[16]!, 0);
          break;
        case 17:
          G.CONFIG_WAVE_ON = G.CONFIG_WAVE_ON ? 0 : 1;
          d[17]!.dp = onOff(G.CONFIG_WAVE_ON);
          await my_button_proc(MSG_DRAW, d[17]!, 0);
          break;
        case 18:
          retour = await wave_options();
          display_back_image();
          break;
      }
    }
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- wave.c ----

async function wave_options(): Promise<number> {
  const d = dialogArray(24);
  let choix = 4, retour = 0;
  display_back_image();
  for (let i = 0; i < 5; ++i) {
    for (let j = 0; j < 4; ++j) {
      if (i > 0 || j > 0) {
        const k = i * 4 + j + 3;
        standard_small_button(d[k]!, j, i, 4, 5);
        if (i > 0 && j > 0) {
          d[k]!.proc = my_slider_proc;
          d[k]!.dp = null;
          d[k]!.dp2 = slider_int;
          let r: IntRef;
          if (j === 1) {
            d[k]!.d1 = 16;
            r = refOf(G.CONFIG_WAVE_AMPLI, i - 1);
          } else if (j === 2) {
            d[k]!.d1 = 4;
            r = refOf(G.CONFIG_WAVE_NUMBER, i - 1);
          } else {
            d[k]!.d1 = 16;
            r = refOf(G.CONFIG_WAVE_SPEED, i - 1);
          }
          d[k]!.dp3 = r;
          d[k]!.d2 = r.get();
        } else d[k]!.proc = my_textbox_proc;
      }
    }
  }
  d[23]!.proc = null;
  quick_buttons(d);
  d[4]!.dp = lw_lang_string(L.WAVE_AMPLI);
  d[5]!.dp = lw_lang_string(L.WAVE_NUMBER);
  d[6]!.dp = lw_lang_string(L.WAVE_SPEED);
  d[7]!.dp = lw_lang_string(L.WAVE_WX);
  d[11]!.dp = lw_lang_string(L.WAVE_HY);
  d[15]!.dp = lw_lang_string(L.WAVE_WY);
  d[19]!.dp = lw_lang_string(L.WAVE_HX);
  display_back_image();
  while (retour === 0) {
    const dp = await my_init_dialog(d, choix);
    while (await my_update_dialog(dp));
    choix = await shutdown_dialog(dp);
    retour = await quickChoice(choix, display_back_image);
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- volume.c ----

async function sound_options(): Promise<number> {
  const d = dialogArray(15);
  let choix = 4, retour = 0;
  const y_pos = [0, 2, 4, 5, 7];
  for (let i = 0; i < 5; ++i) {
    standard_button(d[i + 4]!, 0, y_pos[i]!, 2, 8);
    d[i + 4]!.proc = my_textbox_proc;
  }
  for (let i = 0; i < 5; ++i) {
    standard_button(d[i + 9]!, 1, y_pos[i]!, 2, 8);
    d[i + 9]!.proc = my_slider_proc;
  }
  quick_buttons(d);
  d[4]!.dp = lw_lang_string(L.VOLUME_SFX);
  d[5]!.dp = lw_lang_string(L.VOLUME_CLICK);
  d[6]!.dp = lw_lang_string(L.VOLUME_GAMEWATER);
  d[7]!.dp = lw_lang_string(L.VOLUME_MENUWATER);
  d[8]!.dp = lw_lang_string(L.VOLUME_MUSIC);
  d[9]!.dp3 = refOf(G, 'CONFIG_SFX_VOLUME');
  d[10]!.dp3 = refOf(G, 'CONFIG_CLICK_VOLUME');
  d[11]!.dp3 = refOf(G, 'CONFIG_WATER_VOLUME_GAME');
  d[12]!.dp3 = refOf(G, 'WATER_VOLUME');
  d[13]!.dp3 = refOf(G, 'CONFIG_MUSIC_VOLUME');
  for (let i = 9; i < 14; ++i) {
    d[i]!.d1 = 16;
    d[i]!.dp = null;
    d[i]!.dp2 = slider_int;
    d[i]!.d2 = (d[i]!.dp3 as IntRef).get();
  }
  d[14]!.proc = null;
  while (retour === 0) {
    choix = await my_do_dialog(d, choix);
    retour = await quickChoice(choix, display_back_image);
  }
  G.CONFIG_WATER_VOLUME_MENU = G.WATER_VOLUME;
  if (retour > 0) retour--;
  return retour;
}

// ---- rules.c ----

async function rules_options(): Promise<number> {
  const d = dialogArray(15);
  let choix = 4, retour = 0;
  // the C buffers: time_str is "%-8s00:00" in 14 bytes, the time written over it at offset 8
  let time_str = `${lw_lang_string(L.RULES_TIME).padEnd(8, ' ')}00:00`.slice(0, 13);
  const time_buf = new CharBuf(() => time_str, (s) => {
    time_str = s;
  });
  const cis_buf = CharBuf.of();
  const mmr_buf = CharBuf.of();
  for (let i = 0; i < 4; ++i) {
    standard_button(d[i + 4]!, 0, i, 2, 8);
    d[i + 4]!.proc = my_textbox_proc;
  }
  for (let i = 0; i < 4; ++i) {
    standard_button(d[i + 8]!, 1, i, 2, 8);
    d[i + 8]!.proc = my_slider_proc;
  }
  standard_button(d[12]!, 0, 5, 1, 8);
  d[12]!.dp = lw_lang_string(L.RULES_ADVANCED);
  standard_button(d[13]!, 0, 7, 1, 8);
  d[13]!.dp = lw_lang_string(L.RULES_DEFAULT);
  quick_buttons(d);
  d[4]!.dp = time_buf;
  d[5]!.dp = lw_lang_string(L.RULES_ARMYSIZE);
  d[6]!.dp = cis_buf;
  d[7]!.dp = mmr_buf;
  d[8]!.d1 = 16;
  d[9]!.d1 = 32;
  d[10]!.d1 = 2;
  d[11]!.d1 = 8;
  const write_time_setting = (): void => {
    start_play_time();
    const t = write_time(G.TIME_LEFT);
    // write_time writes 5 characters and a NUL at str + 8
    time_str = (time_str.padEnd(8, '\0').slice(0, 8) + t).replace(/\0.*$/, '');
  };
  const write_cis_setting = (): void => {
    cis_buf.s = `${lw_lang_string(L.RULES_CURSOR)} x${G.CONFIG_CURSOR_INCREASE_SPEED + 1}`.slice(0, 29);
  };
  const write_mmr_setting = (): void => {
    mmr_buf.s = `${lw_lang_string(L.RULES_MINMAPRES)}${MIN_MAP_RES_W[G.CONFIG_MIN_MAP_RES]}x${MIN_MAP_RES_H[G.CONFIG_MIN_MAP_RES]}`.slice(0, 49);
  };
  d[8]!.d2 = G.CONFIG_GAME_TIME;
  d[9]!.d2 = G.CONFIG_FIGHTER_NUMBER;
  d[10]!.d2 = G.CONFIG_CURSOR_INCREASE_SPEED;
  d[11]!.d2 = G.CONFIG_MIN_MAP_RES;
  for (let i = 8; i < 12; ++i) {
    d[i]!.dp = null;
    d[i]!.dp2 = slider_int;
  }
  d[9]!.dp3 = refOf(G, 'CONFIG_FIGHTER_NUMBER');
  d[8]!.dp2 = async (_dp3: unknown, d2: number) => {
    G.CONFIG_GAME_TIME = d2;
    G.LW_CONFIG_CURRENT_RULES.game_time = G.CONFIG_GAME_TIME;
    write_time_setting();
    await my_textbox_proc(MSG_DRAW, d[4]!, 0);
    play_click();
    return 0;
  };
  d[10]!.dp2 = async (_dp3: unknown, d2: number) => {
    G.CONFIG_CURSOR_INCREASE_SPEED = d2;
    write_cis_setting();
    await my_textbox_proc(MSG_DRAW, d[6]!, 0);
    play_click();
    return 0;
  };
  d[11]!.dp2 = async (_dp3: unknown, d2: number) => {
    G.CONFIG_MIN_MAP_RES = d2;
    write_mmr_setting();
    await my_textbox_proc(MSG_DRAW, d[7]!, 0);
    play_click();
    return 0;
  };
  write_time_setting();
  write_cis_setting();
  write_mmr_setting();
  d[14]!.proc = null;
  while (retour === 0) {
    choix = await my_do_dialog(d, choix);
    switch (choix) {
      case 12:
        retour = await advanced_options();
        break;
      case 13:
        load_default_rules();
        G.LW_CONFIG_CURRENT_RULES.game_time = G.CONFIG_GAME_TIME;
        d[8]!.d2 = G.CONFIG_GAME_TIME;
        d[9]!.d2 = G.CONFIG_FIGHTER_NUMBER;
        d[10]!.d2 = G.CONFIG_CURSOR_INCREASE_SPEED;
        d[11]!.d2 = G.CONFIG_MIN_MAP_RES;
        write_time_setting();
        write_cis_setting();
        write_mmr_setting();
        break;
      default:
        retour = await quickChoice(choix);
    }
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- advanced.c ----

async function advanced_options(): Promise<number> {
  const d = dialogArray(21);
  let choix = 4, retour = 0;
  const cpuVsHuman = (): string => {
    switch (G.CONFIG_CPU_VS_HUMAN) {
      case CONFIG_CPU_VS_HUMAN_ALWAYS:
        return lw_lang_string(L.ADVANCED_ALWAYS);
      case CONFIG_CPU_VS_HUMAN_NEVER:
        return lw_lang_string(L.ADVANCED_NEVER);
      default:
        return lw_lang_string(L.ADVANCED_RANDOM);
    }
  };
  const bots = (): string => lw_lang_string(G.CONFIG_ALLOW_NETWORK_BOTS ? L.ADVANCED_YES : L.ADVANCED_NO);
  const asm = (): string => lw_lang_string(G.CONFIG_ASM_ALGORITHM ? L.ADVANCED_ASSEMBLY : L.ADVANCED_STANDARDC);
  for (let i = 0; i < 8; ++i) {
    standard_button(d[i + 4]!, 0, i, 2, 8);
    d[i + 4]!.proc = my_textbox_proc;
  }
  for (let i = 0; i < 8; ++i) {
    standard_button(d[i + 12]!, 1, i, 2, 8);
    d[i + 12]!.proc = my_slider_proc;
  }
  d[17]!.proc = d[18]!.proc = d[19]!.proc = my_button_proc;
  quick_buttons(d);
  d[4]!.dp = lw_lang_string(L.ADVANCED_ATTACK);
  d[5]!.dp = lw_lang_string(L.ADVANCED_DEFENSE);
  d[6]!.dp = lw_lang_string(L.ADVANCED_BASEHEALTH);
  d[7]!.dp = lw_lang_string(L.ADVANCED_WINNERHELP);
  d[8]!.dp = lw_lang_string(L.ADVANCED_CPUSTRENGTH);
  d[9]!.dp = lw_lang_string(L.ADVANCED_CPUVSHUMAN);
  d[10]!.dp = lw_lang_string(L.ADVANCED_ALLOWNETWORKBOTS);
  d[11]!.dp = lw_lang_string(L.ADVANCED_ASMALGORITHM);
  d[12]!.d1 = d[13]!.d1 = d[14]!.d1 = d[15]!.d1 = 16;
  d[16]!.d1 = 4;
  d[12]!.dp3 = refOf(G, 'CONFIG_FIGHTER_ATTACK');
  d[13]!.dp3 = refOf(G, 'CONFIG_FIGHTER_DEFENSE');
  d[14]!.dp3 = refOf(G, 'CONFIG_FIGHTER_NEW_HEALTH');
  d[15]!.dp3 = refOf(G, 'CONFIG_NUMBER_INFLUENCE');
  d[16]!.dp3 = refOf(G, 'CONFIG_CPU_ADVANTAGE');
  d[17]!.dp = cpuVsHuman();
  d[18]!.dp = bots();
  d[19]!.dp = asm();
  for (let i = 12; i < 17; ++i) {
    d[i]!.dp = null;
    d[i]!.dp2 = slider_int;
    d[i]!.d2 = (d[i]!.dp3 as IntRef).get();
  }
  // no assembly on x86_64: the network bots line is hidden (#ifndef ASM)
  d[10]!.flags = D_HIDDEN;
  d[18]!.flags = D_HIDDEN;
  d[20]!.proc = null;
  while (retour === 0) {
    choix = await my_do_dialog(d, choix);
    switch (choix) {
      case 17:
        G.CONFIG_CPU_VS_HUMAN = (G.CONFIG_CPU_VS_HUMAN + 1) % 3;
        d[17]!.dp = cpuVsHuman();
        await my_button_proc(MSG_DRAW, d[17]!, 0);
        break;
      case 18:
        G.CONFIG_ALLOW_NETWORK_BOTS = G.CONFIG_ALLOW_NETWORK_BOTS ? 0 : 1;
        d[18]!.dp = bots();
        await my_button_proc(MSG_DRAW, d[18]!, 0);
        break;
      case 19:
        G.CONFIG_ASM_ALGORITHM = G.CONFIG_ASM_ALGORITHM ? 0 : 1;
        d[19]!.dp = asm();
        await my_button_proc(MSG_DRAW, d[19]!, 0);
        break;
      default:
        retour = await quickChoice(choix);
    }
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- speeds.c ----

async function speeds_options(): Promise<number> {
  const d = dialogArray(9);
  let choix = 4, retour = 0;
  const fps = CharBuf.of();
  const rps = CharBuf.of();
  for (let i = 0; i < 2; ++i) {
    standard_button(d[i + 4]!, 0, i, 2, 2);
    d[i + 4]!.proc = my_textbox_proc;
  }
  for (let i = 0; i < 2; ++i) {
    standard_button(d[i + 6]!, 1, i, 2, 2);
    d[i + 6]!.proc = my_slider_proc;
  }
  quick_buttons(d);
  d[4]!.dp = fps;
  d[5]!.dp = rps;
  d[6]!.d1 = 8;
  d[7]!.d1 = 8;
  const write_fps = (): void => {
    const v = DISPLAY_DELAY_MIN[G.CONFIG_FRAMES_PER_SEC_LIMIT]!;
    fps.s = (v !== 0 ? `${Math.trunc(1000 / v)} ${lw_lang_string(L.SPEEDS_FPS)}` : lw_lang_string(L.SPEEDS_NOFPSLIMIT)).slice(0, 32);
  };
  const write_rps = (): void => {
    const v = LOGIC_DELAY_MIN[G.CONFIG_ROUNDS_PER_SEC_LIMIT]!;
    rps.s = (v !== 0 ? `${Math.trunc(1000 / v)} ${lw_lang_string(L.SPEEDS_RPS)}` : lw_lang_string(L.SPEEDS_NORPSLIMIT)).slice(0, 32);
  };
  d[6]!.d2 = G.CONFIG_FRAMES_PER_SEC_LIMIT;
  d[7]!.d2 = G.CONFIG_ROUNDS_PER_SEC_LIMIT;
  d[6]!.dp = d[7]!.dp = null;
  d[6]!.dp2 = async (_dp3: unknown, d2: number) => {
    G.CONFIG_FRAMES_PER_SEC_LIMIT = d2;
    write_fps();
    await my_textbox_proc(MSG_DRAW, d[4]!, 0);
    play_click();
    return 0;
  };
  d[7]!.dp2 = async (_dp3: unknown, d2: number) => {
    G.CONFIG_ROUNDS_PER_SEC_LIMIT = d2;
    write_rps();
    await my_textbox_proc(MSG_DRAW, d[5]!, 0);
    play_click();
    return 0;
  };
  write_fps();
  write_rps();
  d[8]!.proc = null;
  while (retour === 0) {
    choix = await my_do_dialog(d, choix);
    retour = await quickChoice(choix);
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- controls.c ----

async function controls_options(): Promise<number> {
  const d = dialogArray(9);
  let choix = 4, retour = 0;
  while (retour === 0) {
    standard_button(d[4]!, 0, 0, 2, 4);
    standard_button(d[5]!, 1, 0, 2, 4);
    standard_big_button(d[6]!, 0, 2, 1, 4);
    standard_button(d[7]!, 0, 3, 1, 4);
    quick_buttons(d);
    d[4]!.proc = my_textbox_proc;
    d[4]!.dp = lw_lang_string(L.CONTROLS_JOYSTICK);
    switch (G.CONFIG_JOYSTICK_ON) {
      case 1:
        d[5]!.dp = lw_lang_string(L.CONTROLS_2JOYSTICKS);
        break;
      case 2:
        d[5]!.dp = lw_lang_string(L.CONTROLS_4BUTTONS);
        break;
      case 3:
        d[5]!.dp = lw_lang_string(L.CONTROLS_STANDARD);
        break;
      default:
        d[5]!.dp = lw_lang_string(L.CONTROLS_OFF);
    }
    d[6]!.proc = my_textbox_proc;
    d[6]!.dp = lw_lang_string(L.CONTROLS_MOUSESENSIB);
    d[7]!.proc = my_slider_proc;
    d[7]!.dp = null;
    d[7]!.d1 = 8;
    d[7]!.d2 = G.CONFIG_MOUSE_GAP;
    d[7]!.dp2 = (_dp3: unknown, d2: number) => {
      G.CONFIG_MOUSE_GAP = d2;
      lw_mouse_reset_control();
      play_click();
      return 0;
    };
    d[8]!.proc = null;
    choix = await my_do_dialog(d, choix);
    if (choix === 5) {
      G.CONFIG_JOYSTICK_ON++;
      if (G.CONFIG_JOYSTICK_ON > 3) G.CONFIG_JOYSTICK_ON = 0;
    } else retour = await quickChoice(choix, display_back_image);
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- language.c ----

async function language_options(): Promise<number> {
  const d = dialogArray(6 + LW_LANG_NB_LANGUAGES);
  let choix = 4, retour = 0;
  standard_button(d[4]!, 0, 0, 1, 2 + LW_LANG_NB_LANGUAGES);
  for (let i = 0; i < LW_LANG_NB_LANGUAGES; ++i) standard_button(d[i + 5]!, 0, 2 + i, 1, 2 + LW_LANG_NB_LANGUAGES);
  const update = (): void => {
    quick_buttons(d);
    d[4]!.dp = lw_lang_string(L.LANGUAGE_AUTO);
    for (let i = 0; i < LW_LANG_NB_LANGUAGES; ++i) d[i + 5]!.dp = lw_lang_language(i);
  };
  update();
  d[5 + LW_LANG_NB_LANGUAGES]!.proc = null;
  while (retour === 0) {
    choix = await my_do_dialog(d, choix);
    if (choix === 4) {
      G.CONFIG_LANGUAGE = LW_LANG_LANGUAGE_AUTO;
      update();
    } else if (choix >= 5 && choix < 5 + LW_LANG_NB_LANGUAGES) {
      G.CONFIG_LANGUAGE = choix - 5;
      update();
    } else retour = await quickChoice(choix);
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- about.c, help.c ----

async function lw_about(): Promise<number> {
  const d = dialogArray(9);
  let choix = 4, retour = 0;
  while (retour === 0) {
    for (let i = 0; i < 4; ++i) standard_button(d[i + 4]!, 0, i, 1, 4);
    quick_buttons(d);
    d[4]!.dp = lw_lang_string(L.ABOUT_CREDITS);
    d[5]!.dp = lw_lang_string(L.ABOUT_COPYRIGHT);
    d[6]!.dp = lw_lang_string(L.ABOUT_LICENSE);
    d[7]!.dp = lw_lang_string(L.ABOUT_VERSION);
    d[8]!.proc = null;
    choix = await my_do_dialog(d, choix);
    switch (choix) {
      case 4:
        retour = await display_help(lw_lang_string(L.HELP_CREDITS));
        break;
      case 5:
        retour = await display_help(lw_lang_string(L.HELP_COPYRIGHT));
        break;
      case 6:
        retour = await display_help(lw_lang_string(L.HELP_LICENSE));
        break;
      case 7:
        retour = await display_help(lw_lang_string(L.HELP_VERSION));
        break;
      default:
        retour = await quickChoice(choix, display_back_image);
    }
  }
  if (retour > 0) retour--;
  return retour;
}

async function display_help(s: string): Promise<number> {
  let retour = 0, choix = MENU_QUICK_BACK;
  const d = dialogArray(6);
  quick_buttons(d);
  color_one_dialog(d[4]!);
  d[4]!.proc = my_textbox_proc;
  d[4]!.d2 = 0;
  d[4]!.dp = s;
  d[4]!.key = 0;
  d[4]!.flags = 0;
  d[4]!.x = Math.trunc((MENU_W_SPACE * 3) / 2) + MENU_W_QUICK;
  d[4]!.y = Math.trunc((MENU_H_SPACE * 3) / 2) + MENU_H_QUICK;
  d[4]!.w = MENU_VIRTUAL_W - MENU_W_SPACE * 3 - MENU_W_QUICK * 2;
  d[4]!.h = MENU_VIRTUAL_H - MENU_H_SPACE * 3 - MENU_H_QUICK * 2;
  menu_real_coord(d[4]!);
  d[5]!.proc = null;
  display_back_image();
  while (retour === 0) {
    choix = await my_do_dialog_no_clear(d, choix);
    retour = await quickChoice(choix);
  }
  if (retour > 0) retour--;
  return retour;
}

// ---- lw6.c ----

export async function lw6_advertise_menu(fade_in: boolean): Promise<number> {
  const d = dialogArray(3);
  display_back_image();
  if (fade_in) my_fade_in();
  d[2]!.proc = null;
  standard_button(d[0]!, 0, 0, 1, 1);
  standard_button(d[1]!, 0, 9, 1, 10);
  d[0]!.proc = my_textbox_proc;
  d[0]!.d2 = 0;
  d[0]!.key = 0;
  d[0]!.flags = 0;
  d[0]!.x = Math.trunc(MENU_W_SPACE / 2);
  d[0]!.y = Math.trunc((MENU_H_SPACE * 3) / 2) + MENU_H_STANDARD * 2;
  d[0]!.w = MENU_VIRTUAL_W - MENU_W_SPACE;
  d[0]!.h = MENU_H_SPACE * 6 + MENU_H_STANDARD * 7;
  menu_real_coord(d[0]!);
  d[0]!.dp = lw_lang_string(L.LW6_INFO);
  d[1]!.dp = lw_lang_string(L.LW6_OK);
  return (await my_do_dialog(d, 0)) === 1 ? 1 : 0;
}

void ({} as Dialog);
