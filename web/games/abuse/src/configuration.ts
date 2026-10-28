// configuration.cpp: morph_detail and get_keycode (the key bindings themselves are in view.ts)
import { key_name, JK_MAX_KEY } from './imlib/keys.ts';
import { MEDIUM_DETAIL } from './light.ts';

export const morph = { morph_detail: MEDIUM_DETAIL };

/** get_keycode: the key code for a name ("a", "left_arrow"), -1 for none */
export function get_keycode(str: string): number {
  if (!str.length) return -1;
  if (str.length === 1) return str.charCodeAt(0);
  for (let j = 256; j < JK_MAX_KEY; j++) {
    let buf = '';
    for (const c of key_name(j)) buf += c === ' ' ? '_' : c.toLowerCase();
    if (str === buf) return j;
  }
  return -1;
}
