// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ScrollEmpower.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Buff$buffType, Item, Messages, BuffIndicator;

export class ScrollEmpower extends Buff {
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _ScrollEmpower(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.left_ = 0;
    return this;
  }
  reset(left: number): void {
    this.left_ = Math.max(this.left_, left);
    Item.updateQuickslot();
  }
  use(): void {
    this.left_--;
    if (this.left_ <= 0) {
      this.detach();
    }
  }
  detach(): void {
    super.detach();
    Item.updateQuickslot();
  }
  icon(): number {
    return BuffIndicator.WAND;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.84), Math.fround(0.79), Math.fround(0.65));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(3 - this.left_)) / 3));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [2, this.left_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ScrollEmpower.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(ScrollEmpower.LEFT);
  }
}

$J.define(ScrollEmpower, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ScrollEmpower', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ScrollEmpower' } });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
