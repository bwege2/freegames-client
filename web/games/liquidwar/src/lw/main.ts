// lw/main.ts: src/main.c and src/init.c: the program from start to exit: random seed, settings, Allegro's
// keyboard, the datafile and the custom files, the menus' video mode, the water sounds, the main menu.

import { install_keyboard } from '../al/keyboard.ts';
import { srandom } from '../glibc.ts';
import { check_config_range, load_config_options } from './config.ts';
import { type GameFiles, load_custom, load_dat, order_map } from './disk.ts';
import { my_exit } from './exit.ts';
import { set_resolution } from './gfxmode.ts';
import { lw6_advertise_menu, main_menu } from './menu.ts';
import { start_water } from './sound.ts';
import { G } from './state.ts';

export interface StartOptions {
  files: GameFiles;
  /** time(NULL) for srandom */
  time: number;
  /** the command line options the session asks for (startup.c) */
  silent?: boolean;
  nomusic?: boolean;
  nosfx?: boolean;
  nowater?: boolean;
}

export async function lw_main(o: StartOptions): Promise<never> {
  // init_all
  srandom(o.time);
  if (o.silent || o.nowater) G.STARTUP_WATER_STATE = 0;
  if (o.silent || o.nosfx) G.STARTUP_SFX_STATE = 0;
  if (o.silent || o.nomusic) G.STARTUP_MUSIC_STATE = 0;
  load_config_options();
  install_keyboard();
  // main
  if (!load_dat(o.files)) await my_exit(4);
  load_custom(o.files);
  order_map();
  check_config_range();
  set_resolution(G.CONFIG_GFX_MENU, 0, G.CONFIG_FULLSCREEN);
  start_water();
  if (G.CONFIG_LW6_ADVERTISING_DONE || G.CONFIG_LW6_ADVERTISING_SKIP) await main_menu(true);
  else {
    G.CONFIG_LW6_ADVERTISING_DONE = await lw6_advertise_menu(true);
    await main_menu(false);
  }
  return my_exit(0);
}
