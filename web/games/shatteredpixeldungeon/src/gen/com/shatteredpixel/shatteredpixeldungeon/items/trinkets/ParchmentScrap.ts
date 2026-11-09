// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ParchmentScrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trinket } from './Trinket.ts';

let Messages, ItemSpriteSheet;

export class ParchmentScrap extends Trinket {
  _ParchmentScrap(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.PARCHMENT_SCRAP;
    return this;
  }
  upgradeEnergyCost(): number {
    return (10 + Math.imul(5, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [$J.d2i(ParchmentScrap.enchantChanceMultiplier$int(this.buffedLvl())), Messages.decimalFormat('#.##', ParchmentScrap.curseChanceMultiplier$int(this.buffedLvl()))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [$J.d2i(ParchmentScrap.enchantChanceMultiplier$int(0)), Messages.decimalFormat('#.##', ParchmentScrap.curseChanceMultiplier$int(0))]);
    }
  }
  static enchantChanceMultiplier$(): number {
    return ParchmentScrap.enchantChanceMultiplier$int(Trinket.trinketLevel($J.cls(ParchmentScrap)));
  }
  static enchantChanceMultiplier$int(level: number): number {
    switch (level) {
      default:
        return 1;
      case 0:
        return 2;
      case 1:
        return 4;
      case 2:
        return 7;
      case 3:
        return 10;
    }
  }
  static curseChanceMultiplier$(): number {
    return ParchmentScrap.curseChanceMultiplier$int(Trinket.trinketLevel($J.cls(ParchmentScrap)));
  }
  static curseChanceMultiplier$int(level: number): number {
    switch (level) {
      default:
        return 1;
      case 0:
        return 1.5;
      case 1:
        return 2;
      case 2:
        return 1;
      case 3:
        return 0;
    }
  }
}

$J.define(ParchmentScrap, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ParchmentScrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_ParchmentScrap' }, meths: { 'curseChanceMultiplier(int)': 'curseChanceMultiplier$int', 'curseChanceMultiplier()': 'curseChanceMultiplier$', 'enchantChanceMultiplier(int)': 'enchantChanceMultiplier$int', 'enchantChanceMultiplier()': 'enchantChanceMultiplier$' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
