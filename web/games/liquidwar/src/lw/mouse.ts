// lw/mouse.ts: src/mouse.c: the mouse as a team's control (moves of MOUSE_CONTROL_GAP pixels become key
// presses), and the cursor's sprite (big or small with the font).

import { font } from '../al/font.ts';
import { mouse, position_mouse, set_mouse_sprite, show_mouse } from '../al/mouse.ts';
import { SCREEN_H, SCREEN_W } from '../al/screen.ts';
import { G } from './state.ts';

export const MC = { REF_X: 0, REF_Y: 0, UP: 0, RIGHT: 0, DOWN: 0, LEFT: 0 };
let MOUSE_CONTROL_GAP = 1000;
let MOUSE_ON = 1;

export function lw_mouse_update_control(): void {
  if (mouse.y <= MC.REF_Y - MOUSE_CONTROL_GAP) {
    MC.UP = 1;
    MC.REF_Y = mouse.y + MOUSE_CONTROL_GAP;
  } else MC.UP = 0;
  if (mouse.x >= MC.REF_X + MOUSE_CONTROL_GAP) {
    MC.RIGHT = 1;
    MC.REF_X = mouse.x - MOUSE_CONTROL_GAP;
  } else MC.RIGHT = 0;
  if (mouse.y >= MC.REF_Y + MOUSE_CONTROL_GAP) {
    MC.DOWN = 1;
    MC.REF_Y = mouse.y - MOUSE_CONTROL_GAP;
  } else MC.DOWN = 0;
  if (mouse.x <= MC.REF_X - MOUSE_CONTROL_GAP) {
    MC.LEFT = 1;
    MC.REF_X = mouse.x + MOUSE_CONTROL_GAP;
  } else MC.LEFT = 0;
}

export function lw_mouse_reset_control(): void {
  MC.REF_X = mouse.x;
  MC.REF_Y = mouse.y;
  MOUSE_CONTROL_GAP = 2 + (8 - G.CONFIG_MOUSE_GAP) * (8 - G.CONFIG_MOUSE_GAP);
  if (MC.REF_X < MOUSE_CONTROL_GAP) MC.REF_X = MOUSE_CONTROL_GAP;
  if (MC.REF_Y < MOUSE_CONTROL_GAP) MC.REF_Y = MOUSE_CONTROL_GAP;
  if (MC.REF_X > SCREEN_W() - MOUSE_CONTROL_GAP - 1) MC.REF_X = SCREEN_W() - MOUSE_CONTROL_GAP - 1;
  if (MC.REF_Y > SCREEN_H() - MOUSE_CONTROL_GAP - 1) MC.REF_Y = SCREEN_H() - MOUSE_CONTROL_GAP - 1;
  position_mouse(MC.REF_X, MC.REF_Y);
  lw_mouse_update_control();
}

export function lw_mouse_update_show_hide(): void {
  if (MOUSE_ON) {
    if (font === G.BIG_FONT) set_mouse_sprite(G.BIG_MOUSE_CURSOR);
    if (font === G.SMALL_FONT) set_mouse_sprite(G.SMALL_MOUSE_CURSOR);
    show_mouse(true);
  } else set_mouse_sprite(G.INVISIBLE_MOUSE_CURSOR);
}

export function lw_mouse_show(): void {
  MOUSE_ON = 1;
  lw_mouse_update_show_hide();
}

export function lw_mouse_hide(): void {
  MOUSE_ON = 0;
  lw_mouse_update_show_hide();
}
