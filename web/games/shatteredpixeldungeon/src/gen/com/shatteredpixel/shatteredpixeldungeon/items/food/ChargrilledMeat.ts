// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/ChargrilledMeat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Food } from './Food.ts';

let Hunger, ItemSpriteSheet;

export class ChargrilledMeat extends Food {
  _ChargrilledMeat(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.STEAK;
    this.energy = Math.fround(Hunger.HUNGRY / 2);
    return this;
  }
  value(): number {
    return Math.imul(8, this.quantity);
  }
  static cook(quantity: number): Food {
    let result = new ChargrilledMeat()._ChargrilledMeat();
    result.quantity = quantity;
    return result;
  }
}

$J.define(ChargrilledMeat, 'com.shatteredpixel.shatteredpixeldungeon.items.food.ChargrilledMeat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_ChargrilledMeat' } });
$J.module(() => {
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
