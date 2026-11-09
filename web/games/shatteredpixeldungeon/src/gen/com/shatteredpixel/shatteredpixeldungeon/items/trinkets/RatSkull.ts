// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/RatSkull.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class RatSkull extends Trinket {
  _RatSkull(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.RAT_SKULL;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [$J.d2i((RatSkull.exoticChanceMultiplier$int(this.buffedLvl())))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [$J.d2i((RatSkull.exoticChanceMultiplier$int(0)))]);
    }
  }
  static exoticChanceMultiplier$(): number {
    return RatSkull.exoticChanceMultiplier$int(Trinket.trinketLevel($J.cls(RatSkull)));
  }
  static exoticChanceMultiplier$int(level: number): number {
    if (level === -1) {
      return 1;
    } else {
      return Math.fround(2 + Math.fround(1 * level));
    }
  }
}

$J.define(RatSkull, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_RatSkull' }, meths: { 'exoticChanceMultiplier(int)': 'exoticChanceMultiplier$int', 'exoticChanceMultiplier()': 'exoticChanceMultiplier$' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
