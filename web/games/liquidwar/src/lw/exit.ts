// lw/exit.ts: src/exit.c: leaving the program (the menu's Quit, F10 in the menus). exit_all rests 10 ms,
// leaves the graphics mode, rests 10 ms again, saves the settings and stops the water sounds. In the port,
// leaving returns to the website.

import { key, KEY_F10 } from '../al/keyboard.ts';
import { GameExit, rest } from '../al/sys.ts';
import { screenRef } from '../al/screen.ts';
import { save_config_options } from './config.ts';
import { stop_water } from './sound.ts';
import { last_flip } from './viewport.ts';

export const exitHooks = {
  /** writes the config file to the player's storage */
  saveConfig: null as (() => Promise<void>) | null,
};

export async function my_exit(code: number): Promise<never> {
  await rest(10);
  last_flip();
  screenRef.textMode = true;
  await rest(10);
  save_config_options();
  stop_water();
  await exitHooks.saveConfig?.();
  throw new GameExit(code);
}

export async function my_exit_poll(): Promise<void> {
  if (key[KEY_F10]) await my_exit(0);
}
