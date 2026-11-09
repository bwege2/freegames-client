// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoBuff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Messages, PixelScene, BuffIcon, IconTitle;

export class WndInfoBuff extends Window {
  static readonly GAP: number = 2;
  static readonly WIDTH: number = 120;
  _WndInfoBuff(buff: Buff): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    let buffIcon = new BuffIcon()._BuffIcon$Buff$boolean(buff, true);
    titlebar.icon(buffIcon);
    titlebar.label$String$int(Messages.titleCase(buff.name()), Window.TITLE_COLOR);
    titlebar.setRect(0, 0, Math.fround(WndInfoBuff.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let txtInfo = PixelScene.renderTextBlock$String$int(buff.desc(), 6);
    txtInfo.maxWidth$int(WndInfoBuff.WIDTH);
    txtInfo.setPos(titlebar.left(), Math.fround(titlebar.bottom() + Math.fround(2 * WndInfoBuff.GAP)));
    this.add$Gizmo(txtInfo);
    this.resize(WndInfoBuff.WIDTH, ($J.d2i(txtInfo.bottom()) + 2) | 0);
    return this;
  }
}

$J.define(WndInfoBuff, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff': '_WndInfoBuff' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  BuffIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIcon');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
