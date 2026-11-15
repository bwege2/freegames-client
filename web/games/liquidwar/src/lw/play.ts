// lw/play.ts: src/play.c: a local game from "Get ready!" to the scores: palettes, the battle in the game's
// video mode, the music, then the scores in the menu's mode.

import { emptyDialog, shutdown_dialog } from '../al/gui.ts';
import { lw_config_set_current_rules_to_default } from './config.ts';
import { display_back_image } from './back.ts';
import { main_message, my_init_dialog, my_update_dialog } from './dialog.ts';
import { error_not_enough_big_data, error_not_enough_teams } from './error.ts';
import { blank_round, calc_playing_teams, free_game_memory, game, init_game } from './game.ts';
import { need_to_change_mode, set_resolution } from './gfxmode.ts';
import { lw_lang_string } from './lang.ts';
import { L } from './langids.ts';
import { lw_maptex_set_bg_palette, lw_maptex_set_fg_palette } from './maptex.ts';
import { lw_mouse_hide, lw_mouse_show } from './mouse.ts';
import { my_fade_in, my_fade_out, set_playing_teams_palette } from './palette.ts';
import { display_scores } from './score.ts';
import { start_music, stop_music } from './sound.ts';
import { G } from './state.ts';

export const playHooks = {
  /** a network game: closing the connection to the server (lw_sock_close(&LW_KEYEXCH_SOCK)) */
  closeNetwork: null as (() => void) | null,
};

export async function play_sequence(): Promise<number> {
  lw_config_set_current_rules_to_default();
  return play_sequence_ex();
}

export async function play_sequence_ex(): Promise<number> {
  let retour = 0;
  const d = [emptyDialog(), emptyDialog()];
  display_back_image();
  main_message(d[0]!, lw_lang_string(L.PLAY_GETREADY));
  const dp = await my_init_dialog(d, 0);
  await my_update_dialog(dp);
  await shutdown_dialog(dp);
  lw_maptex_set_fg_palette(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_FG, G.LW_NETWORK_ON, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
  lw_maptex_set_bg_palette(G.CONFIG_LEVEL_MAP, G.CONFIG_LEVEL_BG, G.LW_NETWORK_ON, G.LW_RANDOM_ON, G.CONFIG_USE_DEFAULT_TEXTURE);
  calc_playing_teams();
  set_playing_teams_palette();
  if (G.PLAYING_TEAMS < 2) {
    free_game_memory();
    await error_not_enough_teams();
  } else {
    const message = init_game();
    if (!message) {
      G.WATER_VOLUME = G.CONFIG_WATER_VOLUME_GAME;
      my_fade_out();
      if (need_to_change_mode(G.CONFIG_GFX_GAME, G.CONFIG_GFX_MENU, G.CONFIG_PAGE_FLIP)) {
        set_resolution(G.CONFIG_GFX_GAME, G.CONFIG_PAGE_FLIP, G.CONFIG_FULLSCREEN);
      }
      lw_mouse_hide();
      if (!blank_round()) {
        my_fade_in();
        start_music();
        await game();
        stop_music();
      }
      free_game_memory();
      playHooks.closeNetwork?.();
      G.WATER_VOLUME = G.CONFIG_WATER_VOLUME_MENU;
      my_fade_out();
      if (need_to_change_mode(G.CONFIG_GFX_GAME, G.CONFIG_GFX_MENU, 0)) {
        set_resolution(G.CONFIG_GFX_MENU, 0, G.CONFIG_FULLSCREEN);
      }
      lw_mouse_show();
      retour = await display_scores();
    } else {
      free_game_memory();
      playHooks.closeNetwork?.();
      await error_not_enough_big_data();
    }
  }
  return retour;
}
