// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndChallenges.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Challenges, SPDSettings, Messages, PixelScene, CheckBox, IconButton, Icons, WndMessage, Game;

export class WndChallenges extends Window {
  static readonly WIDTH: number = 120;
  static readonly TTL_HEIGHT: number = 16;
  static readonly BTN_HEIGHT: number = 16;
  static readonly GAP: number = 1;
  editable: boolean = false;
  boxes: ArrayList<CheckBox> = null;
  _WndChallenges(checked: number, editable: boolean): this {
    this._Window$();
    this.editable = editable;
    let title = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 12);
    title.hardlight(Window.TITLE_COLOR);
    title.setPos(Math.fround((Math.fround(WndChallenges.WIDTH - title.width())) / 2), Math.fround((Math.fround(WndChallenges.TTL_HEIGHT - title.height())) / 2));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    this.boxes = new ArrayList();
    let pos = Math.fround(WndChallenges.TTL_HEIGHT);
    for (let i = 0; i < Challenges.NAME_IDS.length; i++) {
      let challenge = Challenges.NAME_IDS[i];
      let cb = new CheckBox()._CheckBox(Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Challenges), challenge, [])));
      cb.checked$boolean((checked & Challenges.MASKS[i]) !== 0);
      cb.active = editable;
      if (i > 0) {
        pos = Math.fround(pos + WndChallenges.GAP);
      }
      cb.setRect(0, pos, Math.fround((WndChallenges.WIDTH - 16) | 0), Math.fround(WndChallenges.BTN_HEIGHT));
      this.add$Gizmo(cb);
      this.boxes.add(cb);
      let info = new (WndChallenges$1())().$o(this).$c(challenge)._IconButton$Image(Icons.get$Icons(Icons.INFO));
      info.setRect(cb.right(), pos, 16, Math.fround(WndChallenges.BTN_HEIGHT));
      this.add$Gizmo(info);
      pos = cb.bottom();
    }
    this.resize(WndChallenges.WIDTH, $J.d2i(pos));
    return this;
  }
  onBackPressed(): void {
    if (this.editable) {
      let value = 0;
      for (let i = 0; i < this.boxes.size(); i++) {
        if (this.boxes.get(i).checked$()) {
          value |= Challenges.MASKS[i];
        }
      }
      SPDSettings.challenges$int(value);
    }
    super.onBackPressed();
  }
}

let $WndChallenges$1: any = null;
/** An anonymous class (WndChallenges.java:81). */
function WndChallenges$1(): any {
  return $WndChallenges$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      Game.scene().add$Gizmo(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(Challenges), this.$cv_challenge + '_desc', [])));
    }
    $c($challenge): this {
      this.$cv_challenge = $challenge;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChallenges$1', []);
}

$J.define(WndChallenges, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndChallenges', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'int,boolean': '_WndChallenges' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CheckBox = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CheckBox');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  Game = $J.load('com.watabou.noosa.Game');
});
