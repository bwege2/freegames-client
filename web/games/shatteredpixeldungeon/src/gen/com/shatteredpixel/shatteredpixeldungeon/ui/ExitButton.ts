// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ExitButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { IconButton } from './IconButton.ts';

let ShatteredPixelDungeon, Messages, PixelScene, TitleScene, Icons, WndKeyBindings, GameAction, Game, DeviceCompat;

export class ExitButton extends IconButton {
  _ExitButton(): this {
    this._IconButton$Image(Icons.EXIT.get());
    this.width_ = Math.fround((PixelScene.landscape() && !DeviceCompat.isDesktop()) ? 40 : 20);
    this.height_ = 20;
    return this;
  }
  onClick(): void {
    if (Game.scene() instanceof TitleScene) {
      Game.instance.finish();
    } else {
      ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
    }
  }
  keyAction(): GameAction {
    return GameAction.BACK;
  }
  hoverText(): string {
    return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'back', []));
  }
}

$J.define(ExitButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', ctors: { '': '_ExitButton' } });
$J.module(() => {
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  GameAction = $J.load('com.watabou.input.GameAction');
  Game = $J.load('com.watabou.noosa.Game');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
