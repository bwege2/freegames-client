// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/DangerIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Tag } from './Tag.ts';

let Dungeon, SPDAction, Messages, PixelScene, AttackIndicator, Icons, QuickSlotButton, WndKeyBindings, BitmapText, Camera;

export class DangerIndicator extends Tag {
  static readonly COLOR: number = 12597304;
  number: BitmapText = null;
  icon_: Image = null;
  enemyIndex: number = 0;
  lastNumber: number = 0;
  static HEIGHT: number = 0;
  _DangerIndicator(): this {
    this._Tag(DangerIndicator.COLOR);
    this.enemyIndex = 0;
    this.lastNumber = -1;
    this.setSize(Math.fround(Tag.SIZE), Math.fround(DangerIndicator.HEIGHT));
    this.visible_ = false;
    return this;
  }
  keyAction(): GameAction {
    return SPDAction.CYCLE;
  }
  createChildren(): void {
    super.createChildren();
    this.number = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.add$Gizmo(this.number);
    this.icon_ = Icons.SKULL.get();
    this.add$Gizmo(this.icon_);
  }
  layout(): void {
    super.layout();
    this.icon_.x = Math.fround(this.left() + 14);
    this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.icon_.height_)) / 2));
    this.placeNumber();
  }
  placeNumber(): void {
    this.number.x = Math.fround(Math.fround(this.left() + 13) - this.number.width());
    this.number.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.number.baseLine())) / 2));
    PixelScene.align$Visual(this.number);
  }
  update(): void {
    if (Dungeon.hero.isAlive()) {
      let v = Dungeon.hero.visibleEnemies();
      if (v !== this.lastNumber) {
        this.lastNumber = v;
        if (this.visible_ = this.lastNumber > 0) {
          this.number.text$String(String(this.lastNumber));
          this.number.measure();
          this.placeNumber();
          this.flash();
        }
      }
    } else {
      this.visible_ = false;
    }
    super.update();
  }
  onClick(): void {
    super.onClick();
    if (Dungeon.hero.visibleEnemies() > 0) {
      let target = Dungeon.hero.visibleEnemy(++this.enemyIndex);
      QuickSlotButton.target(target);
      if (Dungeon.hero.canAttack(target)) {
        AttackIndicator.target(target);
      }
      if (Dungeon.hero.curAction == null && target.sprite_ != null) {
        Camera.main.panFollow(target.sprite_, 5);
      }
    }
  }
  hoverText(): string {
    return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'tag_danger', []));
  }
  static $clinit() {
    DangerIndicator.HEIGHT = 16;
  }
}

$J.define(DangerIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.DangerIndicator', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Tag', ctors: { '': '_DangerIndicator' }, clinit: true, lazy: ['HEIGHT'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Camera = $J.load('com.watabou.noosa.Camera');
});
