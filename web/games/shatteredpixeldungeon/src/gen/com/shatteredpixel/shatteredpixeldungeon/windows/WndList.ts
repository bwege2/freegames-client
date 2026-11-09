// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndList.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let PixelScene;

export class WndList extends Window {
  static readonly WIDTH: number = 120;
  static readonly MARGIN: number = 4;
  static readonly GAP: number = 4;
  _WndList(items: string[]): this {
    this._Window$();
    let pos = Math.fround(WndList.MARGIN);
    let dotWidth = 0;
    let maxWidth = 0;
    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        pos = Math.fround(pos + WndList.GAP);
      }
      let item = PixelScene.renderTextBlock$String$int('-' + items[i], 6);
      item.setPos(Math.fround(WndList.MARGIN), pos);
      item.maxWidth$int((WndList.WIDTH - Math.imul(WndList.MARGIN, 2)) | 0);
      this.add$Gizmo(item);
      pos = Math.fround(pos + item.height());
      let w = item.width();
      if (w > maxWidth) {
        maxWidth = w;
      }
    }
    this.resize($J.d2i((Math.fround(Math.fround(maxWidth + dotWidth) + Math.imul(WndList.MARGIN, 2)))), $J.d2i((Math.fround(pos + WndList.MARGIN))));
    return this;
  }
}

$J.define(WndList, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndList', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'java.lang.String[]': '_WndList' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
});
