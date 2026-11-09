// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/MeatPie.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Recipe } from '../Recipe.ts';

let Buff, Hunger, WellFed, ChargrilledMeat, FrozenCarpaccio, MysteryMeat, Pasty, PhantomMeat, StewedMeat, ItemSpriteSheet;

export class MeatPie extends Food {
  _MeatPie(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.MEAT_PIE;
    this.energy = Math.fround(Hunger.STARVING * 2);
    return this;
  }
  satisfy(hero: Hero): void {
    super.satisfy(hero);
    Buff.affect$Char$Class(hero, $J.cls(WellFed)).reset();
  }
  value(): number {
    return Math.imul(40, this.quantity);
  }
}

export class MeatPie$Recipe extends Recipe {
  _MeatPie$Recipe(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    let pasty = false;
    let ration = false;
    let meat = false;
    for (const $it0 = ingredients.iterator(); $it0.hasNext(); ) {
      let ingredient = $it0.next();
      if (ingredient.quantity$() > 0) {
        if (ingredient instanceof Pasty || ingredient instanceof PhantomMeat) {
          pasty = true;
        } else if (ingredient.getClass() === $J.cls(Food)) {
          ration = true;
        } else if (ingredient instanceof MysteryMeat || ingredient instanceof StewedMeat || ingredient instanceof ChargrilledMeat || ingredient instanceof FrozenCarpaccio) {
          meat = true;
        }
      }
    }
    return pasty && ration && meat;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 6;
  }
  brew(ingredients: ArrayList<Item>): Item {
    if (!this.testIngredients(ingredients)) {
      return null;
    }
    for (const $it1 = ingredients.iterator(); $it1.hasNext(); ) {
      let ingredient = $it1.next();
      ingredient.quantity$int((ingredient.quantity$() - 1) | 0);
    }
    return this.sampleOutput(null);
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return new MeatPie()._MeatPie();
  }
}

$J.define(MeatPie, 'com.shatteredpixel.shatteredpixeldungeon.items.food.MeatPie', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_MeatPie' } });
$J.define(MeatPie$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.food.MeatPie$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_MeatPie$Recipe' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  WellFed = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.WellFed');
  ChargrilledMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.ChargrilledMeat');
  FrozenCarpaccio = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.FrozenCarpaccio');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  Pasty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty');
  PhantomMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.PhantomMeat');
  StewedMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
