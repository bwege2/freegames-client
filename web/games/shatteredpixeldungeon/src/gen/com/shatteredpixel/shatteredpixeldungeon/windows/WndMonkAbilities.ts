// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndMonkAbilities.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, MonkEnergy$MonkAbility, Messages, CellSelector$Listener, GameScene, PixelScene, RedButton;

export class WndMonkAbilities extends Window {
  static readonly WIDTH_P: number = 120;
  static readonly WIDTH_L: number = 180;
  static readonly MARGIN: number = 2;
  abilityBeingUsed: MonkEnergy$MonkAbility = null;
  listener: CellSelector$Listener = null;
  _WndMonkAbilities(energyBuff: MonkEnergy): this {
    this._Window$();
    this.listener = new (WndMonkAbilities$2())().$o(this)._CellSelector$Listener();
    let width = PixelScene.landscape() ? WndMonkAbilities.WIDTH_L : WndMonkAbilities.WIDTH_P;
    let pos = Math.fround(WndMonkAbilities.MARGIN);
    let title = PixelScene.renderTextBlock$String$int(Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'title', [])), 9);
    title.hardlight(Window.TITLE_COLOR);
    title.setPos(Math.fround((Math.fround(width - title.width())) / 2), pos);
    title.maxWidth$int((width - Math.imul(WndMonkAbilities.MARGIN, 2)) | 0);
    this.add$Gizmo(title);
    pos = Math.fround(title.bottom() + Math.imul(3, WndMonkAbilities.MARGIN));
    for (let abil of MonkEnergy$MonkAbility.abilities) {
      let text = '_' + Messages.titleCase(abil.name()) + ' ' + Messages.get$Object$String$ObjectArr(this, 'energycost', [abil.energyCost()]) + ':_ ' + abil.desc();
      let moveBtn = new (WndMonkAbilities$1())().$o(this).$c(abil)._RedButton$String$int(text, 6);
      moveBtn.leftJustify = true;
      moveBtn.multiline = true;
      moveBtn.setSize(Math.fround(width), moveBtn.reqHeight());
      moveBtn.setRect(0, pos, Math.fround(width), moveBtn.reqHeight());
      moveBtn.enable(abil.usable(energyBuff));
      this.add$Gizmo(moveBtn);
      pos = Math.fround(moveBtn.bottom() + WndMonkAbilities.MARGIN);
    }
    this.resize(width, $J.d2i(pos));
    return this;
  }
}

let $WndMonkAbilities$2: any = null;
/** An anonymous class (WndMonkAbilities.java:85). */
function WndMonkAbilities$2(): any {
  return $WndMonkAbilities$2 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      this.$outer.abilityBeingUsed.doAbility(Dungeon.hero, cell);
    }
    prompt(): string {
      return this.$outer.abilityBeingUsed.targetingPrompt();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndMonkAbilities$2', []);
}

let $WndMonkAbilities$1: any = null;
/** An anonymous class (WndMonkAbilities.java:57). */
function WndMonkAbilities$1(): any {
  return $WndMonkAbilities$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.hide();
      if (this.$cv_abil.targetingPrompt() != null) {
        this.$outer.abilityBeingUsed = this.$cv_abil;
        GameScene.selectCell(this.$outer.listener);
      } else {
        this.$cv_abil.doAbility(Dungeon.hero, null);
      }
    }
    $c($abil): this {
      this.$cv_abil = $abil;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndMonkAbilities$1', []);
}

$J.define(WndMonkAbilities, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndMonkAbilities', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy': '_WndMonkAbilities' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  MonkEnergy$MonkAbility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
});
