// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndSupportPrompt.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let SPDSettings, Languages, Messages, PixelScene, SupporterScene, Icons, RedButton, IconTitle, Game;

export class WndSupportPrompt extends Window {
  static readonly WIDTH_P: number = 120;
  static readonly WIDTH_L: number = 200;
  _WndSupportPrompt(): this {
    this._Window$();
    let width = PixelScene.landscape() ? WndSupportPrompt.WIDTH_L : WndSupportPrompt.WIDTH_P;
    let title = new IconTitle()._IconTitle$Image$String(Icons.get$Icons(Icons.SHPX), Messages.get$Class$String$ObjectArr($J.cls(WndSupportPrompt), 'title', []));
    title.setRect(0, 0, Math.fround(width), 0);
    this.add$Gizmo(title);
    let message = Messages.get$Class$String$ObjectArr($J.cls(WndSupportPrompt), 'intro', []);
    message += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(SupporterScene), 'patreon_msg', []);
    if (Messages.lang() !== Languages.ENGLISH) {
      message += '\n' + Messages.get$Class$String$ObjectArr($J.cls(SupporterScene), 'patreon_english', []);
    }
    message += '\n- Evan';
    let text = PixelScene.renderTextBlock$int(6);
    text.text$String$int(message, width);
    text.setPos(title.left(), Math.fround(title.bottom() + 4));
    this.add$Gizmo(text);
    let link = new (WndSupportPrompt$1())().$o(this)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(SupporterScene), 'supporter_link', []));
    link.setRect(0, Math.fround(text.bottom() + 4), Math.fround(width), 18);
    this.add$Gizmo(link);
    let close = new (WndSupportPrompt$2())().$o(this)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'close', []));
    close.setRect(0, Math.fround(link.bottom() + 2), Math.fround(width), 18);
    this.add$Gizmo(close);
    this.resize(width, $J.d2i(close.bottom()));
    return this;
  }
  hide(): void {
  }
}

let $WndSupportPrompt$1: any = null;
/** An anonymous class (WndSupportPrompt.java:60). */
function WndSupportPrompt$1(): any {
  return $WndSupportPrompt$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      let link = 'https://www.patreon.com/ShatteredPixel';
      link += '?utm_source=shatteredpd';
      link += '&utm_medium=supporter_prompt';
      link += '&utm_campaign=ingame_link';
      Game.platform.openURI(link);
      SPDSettings.supportNagged$boolean(true);
      super.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSupportPrompt$1', []);
}

let $WndSupportPrompt$2: any = null;
/** An anonymous class (WndSupportPrompt.java:77). */
function WndSupportPrompt$2(): any {
  return $WndSupportPrompt$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      SPDSettings.supportNagged$boolean(true);
      super.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSupportPrompt$2', []);
}

$J.define(WndSupportPrompt, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSupportPrompt', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_WndSupportPrompt' } });
$J.module(() => {
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  SupporterScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.SupporterScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Game = $J.load('com.watabou.noosa.Game');
});
