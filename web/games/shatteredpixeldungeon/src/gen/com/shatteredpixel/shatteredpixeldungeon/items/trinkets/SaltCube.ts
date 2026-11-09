// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/SaltCube.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class SaltCube extends Trinket {
  _SaltCube(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.SALT_CUBE;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround((Math.fround(1 / SaltCube.hungerGainMultiplier$int(this.buffedLvl()))) - 1)))), Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround(1 - SaltCube.healthRegenMultiplier$int(this.buffedLvl())))))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround((Math.fround(1 / SaltCube.hungerGainMultiplier$int(0))) - 1)))), Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround(1 - SaltCube.healthRegenMultiplier$int(0)))))]);
    }
  }
  static hungerGainMultiplier$(): number {
    return SaltCube.hungerGainMultiplier$int(Trinket.trinketLevel($J.cls(SaltCube)));
  }
  static hungerGainMultiplier$int(level: number): number {
    if (level === -1) {
      return 1;
    } else {
      return Math.fround(1 / (Math.fround(1 + Math.fround(0.25 * ((level + 1) | 0)))));
    }
  }
  static healthRegenMultiplier$(): number {
    return SaltCube.healthRegenMultiplier$int(Trinket.trinketLevel($J.cls(SaltCube)));
  }
  static healthRegenMultiplier$int(level: number): number {
    switch (level) {
      case -1:
      default:
        return 1;
      case 0:
        return Math.fround(0.84);
      case 1:
        return Math.fround(0.73);
      case 2:
        return Math.fround(0.66);
      case 3:
        return Math.fround(0.6);
    }
  }
}

$J.define(SaltCube, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.SaltCube', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_SaltCube' }, meths: { 'healthRegenMultiplier(int)': 'healthRegenMultiplier$int', 'healthRegenMultiplier()': 'healthRegenMultiplier$', 'hungerGainMultiplier(int)': 'hungerGainMultiplier$int', 'hungerGainMultiplier()': 'hungerGainMultiplier$' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
