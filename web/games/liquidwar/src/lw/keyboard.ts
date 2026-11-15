// lw/keyboard.ts: src/keyboard.c: whether a configured key (a scancode, a joystick or mouse direction) is
// held, and waiting for keys in the team menu. There is no joystick in the port: its directions are never
// held (README.md).

import { KB_EXTENDED, KB_NORMAL, key, keypressed } from '../al/keyboard.ts';
import { sys } from '../al/sys.ts';
import { MC, lw_mouse_reset_control, lw_mouse_update_control } from './mouse.ts';
import { G } from './state.ts';

const ALLOWED_KEYBOARD_KEY = new Uint8Array(128);
for (let i = 0; i < 106; i++) ALLOWED_KEYBOARD_KEY[i] = 1;

export function is_touched_key(i: number): number {
  let retval = 0;
  let found = 0;
  if (G.CONFIG_JOYSTICK_ON && i >= 110 && i <= 123) {
    found = 1;
    retval = 0;
  }
  if (!found) {
    switch (i) {
      case 124:
        retval = MC.UP;
        break;
      case 125:
        retval = MC.RIGHT;
        break;
      case 126:
        retval = MC.DOWN;
        break;
      case 127:
        retval = MC.LEFT;
        break;
      default:
        if (i >= 128) {
          i -= 128;
          retval = key[i]! & KB_EXTENDED && ALLOWED_KEYBOARD_KEY[i] ? 1 : 0;
        } else retval = key[i]! & KB_NORMAL && ALLOWED_KEYBOARD_KEY[i] ? 1 : 0;
    }
  }
  return retval ? 1 : 0;
}

export async function wait_no_key(): Promise<void> {
  const start_tick = sys.ticker();
  lw_mouse_reset_control();
  let touched;
  do {
    await keypressed();
    touched = 0;
    lw_mouse_update_control();
    for (let i = 0; i < 256; ++i) if (is_touched_key(i)) touched = 1;
  } while (touched && sys.ticker() < start_tick + 1000);
}

export async function wait_key_pressed(): Promise<number> {
  let touched = 0;
  let result = 0;
  const start_tick = sys.ticker();
  lw_mouse_reset_control();
  while (!touched && sys.ticker() < start_tick + 10000) {
    await keypressed();
    lw_mouse_update_control();
    for (let i = 0; i < 256 && !touched; ++i) {
      if (is_touched_key(i)) {
        touched = 1;
        result = i;
      }
    }
  }
  if (result >= 128) result -= 128;
  return result;
}
