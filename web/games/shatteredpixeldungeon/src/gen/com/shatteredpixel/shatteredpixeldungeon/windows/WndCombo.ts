// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndCombo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Combo$ComboMove, Item, Messages, PixelScene, ItemSprite, ItemSpriteSheet, RedButton;

export class WndCombo extends Window {
  static readonly WIDTH_P: number = 120;
  static readonly WIDTH_L: number = 180;
  static readonly MARGIN: number = 2;
  _WndCombo(combo: Combo): this {
    this._Window$();
    let width = PixelScene.landscape() ? WndCombo.WIDTH_L : WndCombo.WIDTH_P;
    let pos = Math.fround(WndCombo.MARGIN);
    let title = PixelScene.renderTextBlock$String$int(Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'title', [])), 9);
    title.hardlight(Window.TITLE_COLOR);
    title.setPos(Math.fround((Math.fround(width - title.width())) / 2), pos);
    title.maxWidth$int((width - Math.imul(WndCombo.MARGIN, 2)) | 0);
    this.add$Gizmo(title);
    pos = Math.fround(title.bottom() + Math.imul(3, WndCombo.MARGIN));
    let icon: Image;
    if (Dungeon.hero.belongings.weapon() != null) {
      icon = new ItemSprite()._ItemSprite$int$Glowing(Dungeon.hero.belongings.weapon().image_, null);
    } else {
      icon = new ItemSprite()._ItemSprite$Item(new (WndCombo$1())().$o(this)._Item().$init_anon());
    }
    for (let move of Combo$ComboMove.values()) {
      let text = '_' + Messages.titleCase(move.title()) + ' ' + Messages.get$Object$String$ObjectArr(this, 'combo_req', [move.comboReq]) + ':_ ' + move.desc(combo.getComboCount());
      let moveBtn = new (WndCombo$2())().$o(this).$c(combo, move)._RedButton$String$int(text, 6);
      moveBtn.leftJustify = true;
      moveBtn.multiline = true;
      moveBtn.setSize(Math.fround(width), moveBtn.reqHeight());
      moveBtn.setRect(0, pos, Math.fround(width), moveBtn.reqHeight());
      moveBtn.enable(combo.canUseMove(move));
      this.add$Gizmo(moveBtn);
      pos = Math.fround(moveBtn.bottom() + WndCombo.MARGIN);
    }
    this.resize(width, $J.d2i(pos));
    return this;
  }
}

let $WndCombo$1: any = null;
/** An anonymous class (WndCombo.java:61). */
function WndCombo$1(): any {
  return $WndCombo$1 ??= $J.local(class extends Item {
    $init_anon() {
      this.image_ = ItemSpriteSheet.WEAPON_HOLDER;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndCombo$1', []);
}

let $WndCombo$2: any = null;
/** An anonymous class (WndCombo.java:67). */
function WndCombo$2(): any {
  return $WndCombo$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.hide();
      this.$cv_combo.useMove(this.$cv_move);
    }
    $c($combo, $move): this {
      this.$cv_combo = $combo; this.$cv_move = $move;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndCombo$2', []);
}

$J.define(WndCombo, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndCombo', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo': '_WndCombo' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Combo$ComboMove = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$ComboMove');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
});
