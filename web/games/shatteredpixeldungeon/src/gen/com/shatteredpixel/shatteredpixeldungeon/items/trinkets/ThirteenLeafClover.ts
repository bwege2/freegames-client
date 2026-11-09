// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ThirteenLeafClover.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Messages, ItemSpriteSheet, Random;

export class ThirteenLeafClover extends Trinket {
  static MAX_CHANCE: number = 0;
  _ThirteenLeafClover(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.CLOVER;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [$J.roundf(Math.fround(Math.fround(ThirteenLeafClover.MAX_CHANCE * 100) * ThirteenLeafClover.alterHeroDamageChance$int(this.buffedLvl()))), $J.roundf(Math.fround(Math.fround((Math.fround(1 - ThirteenLeafClover.MAX_CHANCE)) * 100) * ThirteenLeafClover.alterHeroDamageChance$int(this.buffedLvl())))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [$J.roundf(Math.fround(Math.fround(ThirteenLeafClover.MAX_CHANCE * 100) * ThirteenLeafClover.alterHeroDamageChance$int(0))), $J.roundf(Math.fround(Math.fround((Math.fround(1 - ThirteenLeafClover.MAX_CHANCE)) * 100) * ThirteenLeafClover.alterHeroDamageChance$int(0)))]);
    }
  }
  static alterHeroDamageChance$(): number {
    return ThirteenLeafClover.alterHeroDamageChance$int(Trinket.trinketLevel($J.cls(ThirteenLeafClover)));
  }
  static alterHeroDamageChance$int(level: number): number {
    if (level <= -1) {
      return 0;
    } else {
      return Math.fround(0.25 + Math.fround(0.25 * level));
    }
  }
  static alterDamageRoll(min: number, max: number): number {
    if (Random.Float$() < ThirteenLeafClover.MAX_CHANCE) {
      return max;
    } else {
      return min;
    }
  }
  static $clinit() {
    ThirteenLeafClover.MAX_CHANCE = Math.fround(0.6);
  }
}

$J.define(ThirteenLeafClover, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ThirteenLeafClover', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_ThirteenLeafClover' }, meths: { 'alterHeroDamageChance(int)': 'alterHeroDamageChance$int', 'alterHeroDamageChance()': 'alterHeroDamageChance$' }, clinit: true, lazy: ['MAX_CHANCE'] });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Random = $J.load('com.watabou.utils.Random');
});
