// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/PetrifiedSeed.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class PetrifiedSeed extends Trinket {
  _PetrifiedSeed(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.PETRIFIED_SEED;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * PetrifiedSeed.stoneInsteadOfSeedChance$int(this.buffedLvl()))), Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround(PetrifiedSeed.grassLootMultiplier$int(this.buffedLvl()) - 1))))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * PetrifiedSeed.stoneInsteadOfSeedChance$int(0))), Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround(PetrifiedSeed.grassLootMultiplier$int(0) - 1))))]);
    }
  }
  static grassLootMultiplier$(): number {
    return PetrifiedSeed.grassLootMultiplier$int(Trinket.trinketLevel($J.cls(PetrifiedSeed)));
  }
  static grassLootMultiplier$int(level: number): number {
    if (level <= 0) {
      return 1;
    } else {
      return Math.fround(1 + Math.fround(Math.fround(0.25 * level) / 3));
    }
  }
  static stoneInsteadOfSeedChance$(): number {
    return PetrifiedSeed.stoneInsteadOfSeedChance$int(Trinket.trinketLevel($J.cls(PetrifiedSeed)));
  }
  static stoneInsteadOfSeedChance$int(level: number): number {
    switch (level) {
      default:
        return 0;
      case 0:
        return 0.25;
      case 1:
        return Math.fround(0.46);
      case 2:
        return Math.fround(0.65);
      case 3:
        return Math.fround(0.8);
    }
  }
}

$J.define(PetrifiedSeed, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.PetrifiedSeed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_PetrifiedSeed' }, meths: { 'stoneInsteadOfSeedChance(int)': 'stoneInsteadOfSeedChance$int', 'stoneInsteadOfSeedChance()': 'stoneInsteadOfSeedChance$', 'grassLootMultiplier(int)': 'grassLootMultiplier$int', 'grassLootMultiplier()': 'grassLootMultiplier$' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
