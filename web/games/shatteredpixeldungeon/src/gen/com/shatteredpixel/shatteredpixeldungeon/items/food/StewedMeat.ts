// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/StewedMeat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Recipe$SimpleRecipe } from '../Recipe.ts';

let Hunger, MysteryMeat, ItemSpriteSheet;

export class StewedMeat extends Food {
  _StewedMeat(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.STEWED;
    this.energy = Math.fround(Hunger.HUNGRY / 2);
    return this;
  }
  value(): number {
    return Math.imul(8, this.quantity);
  }
}

export class StewedMeat$oneMeat extends Recipe$SimpleRecipe {
  _StewedMeat$oneMeat(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(MysteryMeat)];
    this.inQuantity = [1];
    this.cost_ = 1;
    this.output = $J.cls(StewedMeat);
    this.outQuantity = 1;
    return this;
  }
}

export class StewedMeat$twoMeat extends Recipe$SimpleRecipe {
  _StewedMeat$twoMeat(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(MysteryMeat)];
    this.inQuantity = [2];
    this.cost_ = 2;
    this.output = $J.cls(StewedMeat);
    this.outQuantity = 2;
    return this;
  }
}

export class StewedMeat$threeMeat extends Recipe$SimpleRecipe {
  _StewedMeat$threeMeat(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(MysteryMeat)];
    this.inQuantity = [3];
    this.cost_ = 2;
    this.output = $J.cls(StewedMeat);
    this.outQuantity = 3;
    return this;
  }
}

$J.define(StewedMeat, 'com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_StewedMeat' } });
$J.define(StewedMeat$oneMeat, 'com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$oneMeat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_StewedMeat$oneMeat' } });
$J.define(StewedMeat$twoMeat, 'com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$twoMeat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_StewedMeat$twoMeat' } });
$J.define(StewedMeat$threeMeat, 'com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$threeMeat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_StewedMeat$threeMeat' } });
$J.module(() => {
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
