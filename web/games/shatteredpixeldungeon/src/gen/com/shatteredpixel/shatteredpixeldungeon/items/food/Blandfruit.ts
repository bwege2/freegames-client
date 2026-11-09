// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/Blandfruit.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Hunger, Potion, Potion$SeedToPotion, PotionOfExperience, PotionOfFrost, PotionOfHaste, PotionOfHealing, PotionOfInvisibility, PotionOfLevitation, PotionOfLiquidFlame, PotionOfMindVision, PotionOfParalyticGas, PotionOfPurity, PotionOfStrength, PotionOfToxicGas, Catalog, Terrain, Messages, Plant$Seed, GameScene, ItemSprite$Glowing, ItemSpriteSheet, GLog, WndUseItem, Reflection;

export class Blandfruit extends Food {
  potionAttrib: Potion = null;
  potionGlow: ItemSprite$Glowing = null;
  static readonly POTIONATTRIB: string = 'potionattrib';
  _Blandfruit(): this {
    this._Food();
    this.potionAttrib = null;
    this.potionGlow = null;
    this.stackable = true;
    this.image_ = ItemSpriteSheet.BLANDFRUIT;
    this.energy = Hunger.STARVING;
    this.bones = true;
    return this;
  }
  isSimilar(item: Item): boolean {
    if (super.isSimilar(item)) {
      let other = item;
      if (this.potionAttrib == null && other.potionAttrib == null) {
        return true;
      } else if (this.potionAttrib != null && other.potionAttrib != null && this.potionAttrib.isSimilar(other.potionAttrib)) {
        return true;
      }
    }
    return false;
  }
  defaultAction(): string {
    if (this.potionAttrib == null) {
      return null;
    } else if ($J.equals(this.potionAttrib.defaultAction(), Potion.AC_DRINK)) {
      return Food.AC_EAT;
    } else {
      return this.potionAttrib.defaultAction();
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    if ($J.equals(action, Potion.AC_CHOOSE)) {
      GameScene.show(new WndUseItem()._WndUseItem(null, this));
      return;
    }
    if ($J.equals(action, Food.AC_EAT) && this.potionAttrib == null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'raw', []), []);
      return;
    }
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Food.AC_EAT) && this.potionAttrib != null) {
      this.potionAttrib.apply(hero);
    }
  }
  name(): string {
    if (this.potionAttrib instanceof PotionOfHealing) {
      return Messages.get$Object$String$ObjectArr(this, 'sunfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfStrength) {
      return Messages.get$Object$String$ObjectArr(this, 'rotfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfParalyticGas) {
      return Messages.get$Object$String$ObjectArr(this, 'earthfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfInvisibility) {
      return Messages.get$Object$String$ObjectArr(this, 'blindfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfLiquidFlame) {
      return Messages.get$Object$String$ObjectArr(this, 'firefruit', []);
    }
    if (this.potionAttrib instanceof PotionOfFrost) {
      return Messages.get$Object$String$ObjectArr(this, 'icefruit', []);
    }
    if (this.potionAttrib instanceof PotionOfMindVision) {
      return Messages.get$Object$String$ObjectArr(this, 'fadefruit', []);
    }
    if (this.potionAttrib instanceof PotionOfToxicGas) {
      return Messages.get$Object$String$ObjectArr(this, 'sorrowfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfLevitation) {
      return Messages.get$Object$String$ObjectArr(this, 'stormfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfPurity) {
      return Messages.get$Object$String$ObjectArr(this, 'dreamfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfExperience) {
      return Messages.get$Object$String$ObjectArr(this, 'starfruit', []);
    }
    if (this.potionAttrib instanceof PotionOfHaste) {
      return Messages.get$Object$String$ObjectArr(this, 'swiftfruit', []);
    }
    return super.name();
  }
  desc(): string {
    if (this.potionAttrib == null) {
      return super.desc();
    } else {
      let desc = Messages.get$Object$String$ObjectArr(this, 'desc_cooked', []) + '\n\n';
      if (this.potionAttrib instanceof PotionOfFrost || this.potionAttrib instanceof PotionOfLiquidFlame || this.potionAttrib instanceof PotionOfToxicGas || this.potionAttrib instanceof PotionOfParalyticGas) {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_throw', []);
      } else {
        desc += Messages.get$Object$String$ObjectArr(this, 'desc_eat', []);
      }
      return desc;
    }
  }
  value(): number {
    return Math.imul(20, this.quantity);
  }
  cook(seed: Plant$Seed): Item {
    return this.imbuePotion(Reflection.newInstance(Potion$SeedToPotion.types.get(seed.getClass())));
  }
  imbuePotion(potion: Potion): Item {
    this.potionAttrib = potion;
    this.potionAttrib.anonymize();
    this.potionAttrib.image_ = ItemSpriteSheet.BLANDFRUIT;
    if (this.potionAttrib instanceof PotionOfHealing) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(3073582);
    }
    if (this.potionAttrib instanceof PotionOfStrength) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(13369378);
    }
    if (this.potionAttrib instanceof PotionOfParalyticGas) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(6772797);
    }
    if (this.potionAttrib instanceof PotionOfInvisibility) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(14277081);
    }
    if (this.potionAttrib instanceof PotionOfLiquidFlame) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16744192);
    }
    if (this.potionAttrib instanceof PotionOfFrost) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(6730751);
    }
    if (this.potionAttrib instanceof PotionOfMindVision) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(9542041);
    }
    if (this.potionAttrib instanceof PotionOfToxicGas) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(10575077);
    }
    if (this.potionAttrib instanceof PotionOfLevitation) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(1793913);
    }
    if (this.potionAttrib instanceof PotionOfPurity) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(12669610);
    }
    if (this.potionAttrib instanceof PotionOfExperience) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(4210752);
    }
    if (this.potionAttrib instanceof PotionOfHaste) {
      this.potionGlow = new ItemSprite$Glowing()._ItemSprite$Glowing$int(13417216);
    }
    return this;
  }
  onThrow(cell: number): void {
    if (Dungeon.level.map_[cell] === Terrain.WELL || Dungeon.level.pit[cell]) {
      super.onThrow(cell);
    } else if (this.potionAttrib instanceof PotionOfLiquidFlame || this.potionAttrib instanceof PotionOfToxicGas || this.potionAttrib instanceof PotionOfParalyticGas || this.potionAttrib instanceof PotionOfFrost || this.potionAttrib instanceof PotionOfLevitation || this.potionAttrib instanceof PotionOfPurity) {
      Catalog.countUse($J.getClass(this));
      this.potionAttrib.shatter(cell);
      Dungeon.level.drop(new Blandfruit$Chunks()._Blandfruit$Chunks(), cell).sprite_.drop$();
    } else {
      super.onThrow(cell);
    }
  }
  reset(): void {
    super.reset();
    if (this.potionAttrib != null) {
      this.imbuePotion(this.potionAttrib);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Blandfruit.POTIONATTRIB, this.potionAttrib);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Blandfruit.POTIONATTRIB)) {
      this.imbuePotion(bundle.get$String(Blandfruit.POTIONATTRIB));
    }
  }
  glowing(): ItemSprite$Glowing {
    return this.potionGlow;
  }
}

export class Blandfruit$CookFruit extends Recipe {
  _Blandfruit$CookFruit(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    if (ingredients.size() !== 2) {
      return false;
    }
    if (ingredients.get(0) instanceof Blandfruit) {
      if (!(ingredients.get(1) instanceof Plant$Seed)) {
        return false;
      }
    } else if (ingredients.get(0) instanceof Plant$Seed) {
      if (ingredients.get(1) instanceof Blandfruit) {
        let temp = ingredients.get(0);
        ingredients.set(0, ingredients.get(1));
        ingredients.set(1, temp);
      } else {
        return false;
      }
    } else {
      return false;
    }
    let fruit = ingredients.get(0);
    let seed = ingredients.get(1);
    if (fruit.quantity$() >= 1 && fruit.potionAttrib == null && seed.quantity$() >= 1) {
      return true;
    }
    return false;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 2;
  }
  brew(ingredients: ArrayList<Item>): Item {
    if (!this.testIngredients(ingredients)) {
      return null;
    }
    ingredients.get(0).quantity$int((ingredients.get(0).quantity$() - 1) | 0);
    ingredients.get(1).quantity$int((ingredients.get(1).quantity$() - 1) | 0);
    return new Blandfruit()._Blandfruit().cook(ingredients.get(1));
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    if (!this.testIngredients(ingredients)) {
      return null;
    }
    return new Blandfruit()._Blandfruit().cook(ingredients.get(1));
  }
}

export class Blandfruit$Chunks extends Food {
  _Blandfruit$Chunks(): this {
    this._Food();
    this.stackable = true;
    this.image_ = ItemSpriteSheet.BLAND_CHUNKS;
    this.energy = Hunger.STARVING;
    this.bones = true;
    return this;
  }
}

$J.define(Blandfruit, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_Blandfruit' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(Blandfruit$CookFruit, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit$CookFruit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_Blandfruit$CookFruit' } });
$J.define(Blandfruit$Chunks, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit$Chunks', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_Blandfruit$Chunks' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Potion$SeedToPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$SeedToPotion');
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
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  PotionOfToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfToxicGas');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
