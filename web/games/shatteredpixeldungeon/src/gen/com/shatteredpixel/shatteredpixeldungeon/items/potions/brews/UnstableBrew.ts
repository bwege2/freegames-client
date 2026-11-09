// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/UnstableBrew.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../../../jre/index.ts';
import { Brew } from './Brew.ts';
import { Recipe } from '../../Recipe.ts';

let Challenges, Dungeon, Item, Potion, PotionOfExperience, PotionOfFrost, PotionOfHaste, PotionOfHealing, PotionOfInvisibility, PotionOfLevitation, PotionOfLiquidFlame, PotionOfMindVision, PotionOfParalyticGas, PotionOfPurity, PotionOfToxicGas, ExoticPotion, Plant$Seed, ItemSpriteSheet, Random, Reflection;

export class UnstableBrew extends Brew {
  static potionChances: HashMap<JClass<Potion>, number> = null;
  _UnstableBrew(): this {
    this._Brew();
    this.image_ = ItemSpriteSheet.BREW_UNSTABLE;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Potion.AC_DRINK);
    return actions;
  }
  defaultAction(): string {
    return Potion.AC_CHOOSE;
  }
  apply(hero: Hero): void {
    if (Dungeon.isChallenged(Challenges.NO_HEALING)) {
      $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfHealing), $J.boxF(0)));
    }
    let p = Reflection.newInstance(Random.chances$HashMap(UnstableBrew.potionChances));
    while (Potion.mustThrowPots.contains(p.getClass())) {
      p = Reflection.newInstance(Random.chances$HashMap(UnstableBrew.potionChances));
    }
    p.anonymize();
    p.apply(hero);
    if (Dungeon.isChallenged(Challenges.NO_HEALING)) {
      $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfHealing), $J.boxF(3)));
    }
  }
  shatter(cell: number): void {
    let p = Reflection.newInstance(Random.chances$HashMap(UnstableBrew.potionChances));
    while (!Potion.mustThrowPots.contains(p.getClass()) && !Potion.canThrowPots.contains(p.getClass())) {
      p = Reflection.newInstance(Random.chances$HashMap(UnstableBrew.potionChances));
    }
    p.anonymize();
    Item.curItem = p;
    p.shatter(cell);
  }
  isKnown(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(40, this.quantity);
  }
  energyVal(): number {
    return Math.imul(8, this.quantity);
  }
  static $clinit() {
    UnstableBrew.potionChances = new HashMap();
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfHealing), $J.boxF(3)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfMindVision), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfFrost), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfLiquidFlame), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfToxicGas), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfHaste), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfInvisibility), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfLevitation), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfParalyticGas), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfPurity), $J.boxF(2)));
    $J.boxF(UnstableBrew.potionChances.put($J.cls(PotionOfExperience), $J.boxF(1)));
  }
}

export class UnstableBrew$Recipe extends Recipe {
  _UnstableBrew$Recipe(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    let potion = false;
    let seed = false;
    for (const $it0 = ingredients.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof Plant$Seed) {
        seed = true;
      } else if (ExoticPotion.regToExo.containsKey(i.getClass()) || ExoticPotion.regToExo.containsValue(i.getClass())) {
        potion = true;
      }
    }
    return potion && seed;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 1;
  }
  brew(ingredients: ArrayList<Item>): Item {
    for (const $it1 = ingredients.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      i.quantity$int((i.quantity$() - 1) | 0);
    }
    return this.sampleOutput(null);
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return new UnstableBrew()._UnstableBrew();
  }
}

$J.define(UnstableBrew, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew', ctors: { '': '_UnstableBrew' }, clinit: true, lazy: ['potionChances'] });
$J.define(UnstableBrew$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_UnstableBrew$Recipe' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHaste');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  PotionOfMindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfMindVision');
  PotionOfParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfParalyticGas');
  PotionOfPurity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity');
  PotionOfToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfToxicGas');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
