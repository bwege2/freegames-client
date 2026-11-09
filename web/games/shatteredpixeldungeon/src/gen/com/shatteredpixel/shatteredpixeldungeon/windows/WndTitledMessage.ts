// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndTitledMessage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let PixelScene, IconTitle;

export class WndTitledMessage extends Window {
  static readonly WIDTH_MIN: number = 120;
  static readonly WIDTH_MAX: number = 220;
  static readonly GAP: number = 2;
  _WndTitledMessage$Image$String$String(icon: Image, title: string, message: string): this {
    this._WndTitledMessage$Component$String(new IconTitle()._IconTitle$Image$String(icon, title), message);
    return this;
  }
  _WndTitledMessage$Component$String(titlebar: Component, message: string): this {
    this._Window$();
    let width = WndTitledMessage.WIDTH_MIN;
    titlebar.setRect(0, 0, Math.fround(width), 0);
    this.add$Gizmo(titlebar);
    let text = PixelScene.renderTextBlock$int(6);
    if (!this.useHighlighting()) {
      text.setHightlighting$boolean(false);
    }
    text.text$String$int(message, width);
    text.setPos(titlebar.left(), Math.fround(titlebar.bottom() + Math.imul(2, WndTitledMessage.GAP)));
    this.add$Gizmo(text);
    while (PixelScene.landscape() && text.bottom() > this.targetHeight() && width < WndTitledMessage.WIDTH_MAX) {
      width = (width + 20) | 0;
      titlebar.setRect(0, 0, Math.fround(width), 0);
      text.setPos(titlebar.left(), Math.fround(titlebar.bottom() + Math.imul(2, WndTitledMessage.GAP)));
      text.maxWidth$int(width);
    }
    this.bringToFront(titlebar);
    this.resize(width, ($J.d2i(text.bottom()) + 2) | 0);
    return this;
  }
  useHighlighting(): boolean {
    return true;
  }
  targetHeight(): number {
    return Math.fround(PixelScene.MIN_HEIGHT_L - 10);
  }
}

$J.define(WndTitledMessage, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.watabou.noosa.ui.Component,java.lang.String': '_WndTitledMessage$Component$String', 'com.watabou.noosa.Image,java.lang.String,java.lang.String': '_WndTitledMessage$Image$String$String' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
