// al/mouse.ts: the mouse as Allegro 4.4 has it for Liquid War: mouse_x, mouse_y, mouse_b, position_mouse,
// the cursor sprite (shown by the page over the screen, as X11 shows Allegro's hardware cursor, so it is
// not part of the screen's pixels), and the GUI's hooks gui_mouse_x/y/z/b. Reading a held button from
// the GUI moves the clock 100 us (oracle.c), so its busy loops end.

import type { Bitmap } from './bitmap.ts';
import { sys } from './sys.ts';

export const mouse = { x: 0, y: 0, b: 0, z: 0 };
export let mouseSprite: Bitmap | null = null;
export let mouseShown = false;

export function position_mouse(x: number, y: number): void {
  mouse.x = x;
  mouse.y = y;
}

export function set_mouse_sprite(b: Bitmap | null): void {
  mouseSprite = b;
}

export function show_mouse(on: unknown): void {
  mouseShown = !!on;
}

export function gui_mouse_x(): number {
  return mouse.x;
}

export function gui_mouse_y(): number {
  return mouse.y;
}

export function gui_mouse_z(): number {
  return mouse.z;
}

export async function gui_mouse_b(): Promise<number> {
  if (mouse.b) await sys.advance(100);
  return mouse.b;
}
