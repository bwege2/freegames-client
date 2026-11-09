// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoTalent.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Dungeon, Messages, PixelScene, Icons, RedButton, TalentIcon, IconTitle;

export class WndInfoTalent extends Window {
  static readonly GAP: number = 2;
  static readonly WIDTH_MIN: number = 120;
  static readonly WIDTH_MAX: number = 220;
  _WndInfoTalent(talent: Talent, points: number, buttonCallback: WndInfoTalent$TalentButtonCallback): this {
    this._Window$();
    let width = WndInfoTalent.WIDTH_MIN;
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new TalentIcon()._TalentIcon$Talent(talent));
    let title = Messages.titleCase(talent.title());
    if (points > 0) {
      title += ' +' + points;
    }
    titlebar.label$String$int(title, Window.TITLE_COLOR);
    titlebar.setRect(0, 0, Math.fround(width), 0);
    this.add$Gizmo(titlebar);
    let metaDesc = (buttonCallback != null && buttonCallback.metamorphDesc()) || (Dungeon.hero != null && Dungeon.hero.metamorphedTalents.containsValue(talent));
    let txtInfo = PixelScene.renderTextBlock$String$int(talent.desc$boolean(metaDesc), 6);
    txtInfo.maxWidth$int(width);
    txtInfo.setPos(titlebar.left(), Math.fround(titlebar.bottom() + Math.fround(2 * WndInfoTalent.GAP)));
    this.add$Gizmo(txtInfo);
    while (PixelScene.landscape() && txtInfo.height() > Math.fround(120) && width < WndInfoTalent.WIDTH_MAX) {
      width = (width + 20) | 0;
      txtInfo.maxWidth$int(width);
    }
    titlebar.setRect(0, 0, Math.fround(width), 0);
    this.resize(width, $J.d2i((Math.fround(txtInfo.bottom() + WndInfoTalent.GAP))));
    if (buttonCallback != null) {
      let button = new (WndInfoTalent$1())().$o(this).$c(buttonCallback)._RedButton$String(buttonCallback.prompt());
      button.icon$Image(Icons.get$Icons(Icons.TALENT));
      button.setRect(0, Math.fround(txtInfo.bottom() + Math.fround(2 * WndInfoTalent.GAP)), Math.fround(width), 18);
      this.add$Gizmo(button);
      this.resize(width, ($J.d2i(button.bottom()) + 1) | 0);
    }
    return this;
  }
}

export class WndInfoTalent$TalentButtonCallback extends JObject {
  _WndInfoTalent$TalentButtonCallback(): this {
    return this;
  }
  metamorphDesc(): boolean {
    return false;
  }
}

let $WndInfoTalent$1: any = null;
/** An anonymous class (WndInfoTalent.java:76). */
function WndInfoTalent$1(): any {
  return $WndInfoTalent$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.hide();
      this.$cv_buttonCallback.call();
    }
    $c($buttonCallback): this {
      this.$cv_buttonCallback = $buttonCallback;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTalent$1', []);
}

$J.define(WndInfoTalent, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTalent', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent,int,com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTalent$TalentButtonCallback': '_WndInfoTalent' } });
$J.define(WndInfoTalent$TalentButtonCallback, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoTalent$TalentButtonCallback', { kind: 'class', ifaces: ['com.watabou.utils.Callback'], sup: 'java.lang.Object', ctors: { '': '_WndInfoTalent$TalentButtonCallback' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  TalentIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TalentIcon');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
