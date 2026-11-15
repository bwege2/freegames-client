// C-Dogs SDL 2.5.0, translated: the menus' background, a tinted view of a map (grafx_bg.c).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { ColorTint, RAND_MAX, colorWhite, rand, type HSV, type Vec2 } from '../core/base.ts';
import { gMap } from '../core/map.ts';
import { gGfx } from './gfx.ts';
import { DrawBufferDraw, DrawBufferNew, DrawBufferSetFromMap, X_TILES, type DrawBuffer } from './draw.ts';

export function GrafxDrawBackground(buffer: DrawBuffer, tint: HSV, pos: Vec2): void {
  gGfx.withBackground(ColorTint(colorWhite, tint), () => {
    DrawBufferSetFromMap(buffer, gMap, pos, X_TILES());
    DrawBufferDraw(buffer, { x: 0, y: 0 }, { HUD: false, FocusActorUID: 0 });
  });
}
/** GrafxRedrawBackground: after a game, the last map with a random tint */
export function GrafxRedrawBackground(pos: Vec2): void {
  const h = (rand() * 360.0) / RAND_MAX;
  const s = (rand() * 1.0) / RAND_MAX;
  GrafxDrawBackground(DrawBufferNew(), { h, s, v: 0.5 }, pos);
}
