// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Recipe.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, JObject } from '../../../../../jre/index.ts';

let ArcaneResin$Recipe, EquipableItem, LiquidMetal$Recipe, Bomb$EnhanceBomb, Blandfruit$CookFruit, MeatPie$Recipe, StewedMeat$oneMeat, StewedMeat$threeMeat, StewedMeat$twoMeat, Potion$SeedToPotion, AquaBrew$Recipe, BlizzardBrew$Recipe, CausticBrew$Recipe, InfernalBrew$Recipe, ShockingBrew$Recipe, UnstableBrew$Recipe, ElixirOfAquaticRejuvenation$Recipe, ElixirOfArcaneArmor$Recipe, ElixirOfDragonsBlood$Recipe, ElixirOfFeatherFall$Recipe, ElixirOfHoneyedHealing$Recipe, ElixirOfIcyTouch$Recipe, ElixirOfMight$Recipe, ElixirOfToxicEssence$Recipe, ExoticPotion$PotionToExotic, Scroll$ScrollToStone, ExoticScroll$ScrollToExotic, Alchemize$Recipe, BeaconOfReturning$Recipe, CurseInfusion$Recipe, MagicalInfusion$Recipe, PhaseShift$Recipe, ReclaimTrap$Recipe, Recycle$Recipe, SummonElemental$Recipe, TelekineticGrab$Recipe, UnstableSpell$Recipe, WildEnergy$Recipe, Trinket$UpgradeTrinket, TrinketCatalyst$Recipe, Wand, MissileWeapon, Game, Reflection;

export class Recipe extends JObject {
  static variableRecipes: Recipe[] = null;
  static oneIngredientRecipes: Recipe[] = null;
  static twoIngredientRecipes: Recipe[] = null;
  static threeIngredientRecipes: Recipe[] = null;
  _Recipe(): this {
    return this;
  }
  static findRecipes(ingredients: ArrayList<Item>): ArrayList<Recipe> {
    let result = new ArrayList();
    for (let recipe of Recipe.variableRecipes) {
      if (recipe.testIngredients(ingredients)) {
        result.add(recipe);
      }
    }
    if (ingredients.size() === 1) {
      for (let recipe of Recipe.oneIngredientRecipes) {
        if (recipe.testIngredients(ingredients)) {
          result.add(recipe);
        }
      }
    } else if (ingredients.size() === 2) {
      for (let recipe of Recipe.twoIngredientRecipes) {
        if (recipe.testIngredients(ingredients)) {
          result.add(recipe);
        }
      }
    } else if (ingredients.size() === 3) {
      for (let recipe of Recipe.threeIngredientRecipes) {
        if (recipe.testIngredients(ingredients)) {
          result.add(recipe);
        }
      }
    }
    return result;
  }
  static usableInRecipe(item: Item): boolean {
    if (item instanceof EquipableItem) {
      return item.cursedKnown && !item.cursed && item instanceof MissileWeapon && item.isUpgradable();
    } else if (item instanceof Wand) {
      return item.cursedKnown && !item.cursed;
    } else {
      return !item.cursed;
    }
  }
  static $clinit() {
    Recipe.variableRecipes = [];
    Recipe.oneIngredientRecipes = [new Scroll$ScrollToStone()._Scroll$ScrollToStone(), new ExoticPotion$PotionToExotic()._ExoticPotion$PotionToExotic(), new ExoticScroll$ScrollToExotic()._ExoticScroll$ScrollToExotic(), new ArcaneResin$Recipe()._ArcaneResin$Recipe(), new LiquidMetal$Recipe()._LiquidMetal$Recipe(), new BlizzardBrew$Recipe()._BlizzardBrew$Recipe(), new InfernalBrew$Recipe()._InfernalBrew$Recipe(), new AquaBrew$Recipe()._AquaBrew$Recipe(), new ShockingBrew$Recipe()._ShockingBrew$Recipe(), new ElixirOfDragonsBlood$Recipe()._ElixirOfDragonsBlood$Recipe(), new ElixirOfIcyTouch$Recipe()._ElixirOfIcyTouch$Recipe(), new ElixirOfToxicEssence$Recipe()._ElixirOfToxicEssence$Recipe(), new ElixirOfMight$Recipe()._ElixirOfMight$Recipe(), new ElixirOfFeatherFall$Recipe()._ElixirOfFeatherFall$Recipe(), new MagicalInfusion$Recipe()._MagicalInfusion$Recipe(), new BeaconOfReturning$Recipe()._BeaconOfReturning$Recipe(), new PhaseShift$Recipe()._PhaseShift$Recipe(), new Recycle$Recipe()._Recycle$Recipe(), new TelekineticGrab$Recipe()._TelekineticGrab$Recipe(), new SummonElemental$Recipe()._SummonElemental$Recipe(), new StewedMeat$oneMeat()._StewedMeat$oneMeat(), new TrinketCatalyst$Recipe()._TrinketCatalyst$Recipe(), new Trinket$UpgradeTrinket()._Trinket$UpgradeTrinket()];
    Recipe.twoIngredientRecipes = [new Blandfruit$CookFruit()._Blandfruit$CookFruit(), new Bomb$EnhanceBomb()._Bomb$EnhanceBomb(), new UnstableBrew$Recipe()._UnstableBrew$Recipe(), new CausticBrew$Recipe()._CausticBrew$Recipe(), new ElixirOfArcaneArmor$Recipe()._ElixirOfArcaneArmor$Recipe(), new ElixirOfAquaticRejuvenation$Recipe()._ElixirOfAquaticRejuvenation$Recipe(), new ElixirOfHoneyedHealing$Recipe()._ElixirOfHoneyedHealing$Recipe(), new UnstableSpell$Recipe()._UnstableSpell$Recipe(), new Alchemize$Recipe()._Alchemize$Recipe(), new CurseInfusion$Recipe()._CurseInfusion$Recipe(), new ReclaimTrap$Recipe()._ReclaimTrap$Recipe(), new WildEnergy$Recipe()._WildEnergy$Recipe(), new StewedMeat$twoMeat()._StewedMeat$twoMeat()];
    Recipe.threeIngredientRecipes = [new Potion$SeedToPotion()._Potion$SeedToPotion(), new StewedMeat$threeMeat()._StewedMeat$threeMeat(), new MeatPie$Recipe()._MeatPie$Recipe()];
  }
}

export class Recipe$SimpleRecipe extends Recipe {
  inputs: JClass<Item>[] = null;
  inQuantity: number[] = null;
  cost_: number = 0;
  output: JClass<Item> = null;
  outQuantity: number = 0;
  _Recipe$SimpleRecipe(): this {
    this._Recipe();
    return this;
  }
  getIngredients(): ArrayList<Item> {
    let result = new ArrayList();
    for (let i = 0; i < this.inputs.length; i++) {
      let ingredient = Reflection.newInstance(this.inputs[i]);
      ingredient.quantity$int(this.inQuantity[i]);
      result.add(ingredient);
    }
    return result;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    let needed = this.inQuantity.slice();
    for (const $it0 = ingredients.iterator(); $it0.hasNext(); ) {
      let ingredient = $it0.next();
      if (!ingredient.isIdentified()) {
        return false;
      }
      for (let i = 0; i < this.inputs.length; i++) {
        if (ingredient.getClass() === this.inputs[i]) {
          needed[i] = (needed[i] - ingredient.quantity$()) | 0;
          break;
        }
      }
    }
    for (let i of needed) {
      if (i > 0) {
        return false;
      }
    }
    return true;
  }
  cost(ingredients: ArrayList<Item>): number {
    return this.cost_;
  }
  brew(ingredients: ArrayList<Item>): Item {
    if (!this.testIngredients(ingredients)) {
      return null;
    }
    let needed = this.inQuantity.slice();
    for (const $it1 = ingredients.iterator(); $it1.hasNext(); ) {
      let ingredient = $it1.next();
      for (let i = 0; i < this.inputs.length; i++) {
        if (ingredient.getClass() === this.inputs[i] && needed[i] > 0) {
          if (needed[i] <= ingredient.quantity$()) {
            ingredient.quantity$int((ingredient.quantity$() - needed[i]) | 0);
            needed[i] = 0;
          } else {
            needed[i] = (needed[i] - ingredient.quantity$()) | 0;
            ingredient.quantity$int(0);
          }
        }
      }
    }
    return this.sampleOutput(null);
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    try {
      let result = Reflection.newInstance(this.output);
      result.quantity$int(this.outQuantity);
      return result;
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
        Game.reportException(e);
        return null;
      } else {
        throw $e2;
      }
    }
  }
}

$J.define(Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Recipe' }, clinit: true, lazy: ['variableRecipes', 'oneIngredientRecipes', 'twoIngredientRecipes', 'threeIngredientRecipes'] });
$J.define(Recipe$SimpleRecipe, 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_Recipe$SimpleRecipe' } });
$J.module(() => {
  ArcaneResin$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin$Recipe');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  LiquidMetal$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal$Recipe');
  Bomb$EnhanceBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$EnhanceBomb');
  Blandfruit$CookFruit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit$CookFruit');
  MeatPie$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MeatPie$Recipe');
  StewedMeat$oneMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$oneMeat');
  StewedMeat$threeMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$threeMeat');
  StewedMeat$twoMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$twoMeat');
  Potion$SeedToPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$SeedToPotion');
  AquaBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.AquaBrew$Recipe');
  BlizzardBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.BlizzardBrew$Recipe');
  CausticBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.CausticBrew$Recipe');
  InfernalBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.InfernalBrew$Recipe');
  ShockingBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.ShockingBrew$Recipe');
  UnstableBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew$Recipe');
  ElixirOfAquaticRejuvenation$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfAquaticRejuvenation$Recipe');
  ElixirOfArcaneArmor$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfArcaneArmor$Recipe');
  ElixirOfDragonsBlood$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfDragonsBlood$Recipe');
  ElixirOfFeatherFall$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfFeatherFall$Recipe');
  ElixirOfHoneyedHealing$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfHoneyedHealing$Recipe');
  ElixirOfIcyTouch$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfIcyTouch$Recipe');
  ElixirOfMight$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight$Recipe');
  ElixirOfToxicEssence$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfToxicEssence$Recipe');
  ExoticPotion$PotionToExotic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion$PotionToExotic');
  Scroll$ScrollToStone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll$ScrollToStone');
  ExoticScroll$ScrollToExotic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll$ScrollToExotic');
  Alchemize$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$Recipe');
  BeaconOfReturning$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning$Recipe');
  CurseInfusion$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.CurseInfusion$Recipe');
  MagicalInfusion$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.MagicalInfusion$Recipe');
  PhaseShift$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.PhaseShift$Recipe');
  ReclaimTrap$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.ReclaimTrap$Recipe');
  Recycle$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Recycle$Recipe');
  SummonElemental$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.SummonElemental$Recipe');
  TelekineticGrab$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.TelekineticGrab$Recipe');
  UnstableSpell$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell$Recipe');
  WildEnergy$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.WildEnergy$Recipe');
  Trinket$UpgradeTrinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket$UpgradeTrinket');
  TrinketCatalyst$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst$Recipe');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Game = $J.load('com.watabou.noosa.Game');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
