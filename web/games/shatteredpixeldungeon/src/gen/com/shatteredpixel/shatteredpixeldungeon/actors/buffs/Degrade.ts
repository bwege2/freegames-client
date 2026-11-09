// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Degrade.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from './FlavourBuff.ts';

let Dungeon, Buff$buffType, Item, BuffIndicator;

export class Degrade extends FlavourBuff {
  static readonly DURATION: number = 30;
  _Degrade(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      Item.updateQuickslot();
      if (target === Dungeon.hero) {
        (target).updateHT(false);
      }
      return true;
    }
    return false;
  }
  detach(): void {
    super.detach();
    if (this.target === Dungeon.hero) {
      (this.target).updateHT(false);
    }
    Item.updateQuickslot();
  }
  static reduceLevel(level: number): number {
    if (level <= 0) {
      return level;
    } else {
      return $J.l2i($J.lround(Math.sqrt(Math.imul(2, ((level - 1) | 0))) + 1));
    }
  }
  icon(): number {
    return BuffIndicator.DEGRADE;
  }
  iconFadePercent(): number {
    return Math.fround((Math.fround(Degrade.DURATION - this.visualcooldown())) / Degrade.DURATION);
  }
}

$J.define(Degrade, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Degrade' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
