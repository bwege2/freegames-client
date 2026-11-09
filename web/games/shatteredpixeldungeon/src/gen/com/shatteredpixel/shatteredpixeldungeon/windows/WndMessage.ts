// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndMessage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class WndMessage extends Window {
  static readonly WIDTH_MIN: number = 120;
  static readonly WIDTH_MAX: number = 220;
  static readonly MARGIN: number = 4;
  _WndMessage(text: string): this {
    this._Window$();
    let width = WndMessage.WIDTH_MIN;
    let info = PixelScene.renderTextBlock$String$int(text, 6);
    info.maxWidth$int((width - Math.imul(WndMessage.MARGIN, 2)) | 0);
    info.setPos(Math.fround(WndMessage.MARGIN), Math.fround(WndMessage.MARGIN));
    this.add$Gizmo(info);
    while (PixelScene.landscape() && info.height() > Math.fround(120) && width < WndMessage.WIDTH_MAX) {
      width = (width + 20) | 0;
      info.maxWidth$int((width - Math.imul(WndMessage.MARGIN, 2)) | 0);
    }
    this.resize(($J.d2i(info.width()) + Math.imul(WndMessage.MARGIN, 2)) | 0, ($J.d2i(info.height()) + Math.imul(WndMessage.MARGIN, 2)) | 0);
    return this;
  }
}

$J.define(WndMessage, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'java.lang.String': '_WndMessage' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
});
