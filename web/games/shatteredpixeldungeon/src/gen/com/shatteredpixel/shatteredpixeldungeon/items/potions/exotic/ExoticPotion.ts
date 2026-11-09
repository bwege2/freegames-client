// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/ExoticPotion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, LinkedHashMap } from '../../../../../../../jre/index.ts';
import { Potion } from '../Potion.ts';
import { Recipe } from '../../Recipe.ts';

let Item, PotionOfExperience, PotionOfFrost, PotionOfHaste, PotionOfHealing, PotionOfInvisibility, PotionOfLevitation, PotionOfLiquidFlame, PotionOfMindVision, PotionOfParalyticGas, PotionOfPurity, PotionOfStrength, PotionOfToxicGas, PotionOfCleansing, PotionOfCorrosiveGas, PotionOfDivineInspiration, PotionOfDragonsBreath, PotionOfEarthenArmor, PotionOfMagicalSight, PotionOfMastery, PotionOfShielding, PotionOfShroudingFog, PotionOfSnapFreeze, PotionOfStamina, PotionOfStormClouds, Reflection;

export class ExoticPotion extends Potion {
  static regToExo: LinkedHashMap<JClass<Potion>, JClass<ExoticPotion>> = null;
  static exoToReg: LinkedHashMap<JClass<ExoticPotion>, JClass<Potion>> = null;
  _ExoticPotion(): this {
    this._Potion();
    return this;
  }
  isKnown(): boolean {
    return this.anonymous || (Potion.handler != null && Potion.handler.isKnown$Class(ExoticPotion.exoToReg.get(this.getClass())));
  }
  setKnown(): void {
    if (!this.isKnown()) {
      Potion.handler.know$Class(ExoticPotion.exoToReg.get(this.getClass()));
      Item.updateQuickslot();
    }
  }
  reset(): void {
    super.reset();
    if (Potion.handler != null && Potion.handler.contains$Class(ExoticPotion.exoToReg.get(this.getClass()))) {
      this.image_ = (Potion.handler.image$Class(ExoticPotion.exoToReg.get(this.getClass())) + 16) | 0;
      this.color_ = Potion.handler.label$Class(ExoticPotion.exoToReg.get(this.getClass()));
    }
  }
  value(): number {
    return Math.imul(((Reflection.newInstance(ExoticPotion.exoToReg.get($J.getClass(this))).value() + 20) | 0), this.quantity);
  }
  energyVal(): number {
    return Math.imul(((Reflection.newInstance(ExoticPotion.exoToReg.get($J.getClass(this))).energyVal() + 4) | 0), this.quantity);
  }
  static $clinit() {
    ExoticPotion.regToExo = new LinkedHashMap();
    ExoticPotion.exoToReg = new LinkedHashMap();
    ExoticPotion.regToExo.put($J.cls(PotionOfStrength), $J.cls(PotionOfMastery));
    ExoticPotion.exoToReg.put($J.cls(PotionOfMastery), $J.cls(PotionOfStrength));
    ExoticPotion.regToExo.put($J.cls(PotionOfHealing), $J.cls(PotionOfShielding));
    ExoticPotion.exoToReg.put($J.cls(PotionOfShielding), $J.cls(PotionOfHealing));
    ExoticPotion.regToExo.put($J.cls(PotionOfMindVision), $J.cls(PotionOfMagicalSight));
    ExoticPotion.exoToReg.put($J.cls(PotionOfMagicalSight), $J.cls(PotionOfMindVision));
    ExoticPotion.regToExo.put($J.cls(PotionOfFrost), $J.cls(PotionOfSnapFreeze));
    ExoticPotion.exoToReg.put($J.cls(PotionOfSnapFreeze), $J.cls(PotionOfFrost));
    ExoticPotion.regToExo.put($J.cls(PotionOfLiquidFlame), $J.cls(PotionOfDragonsBreath));
    ExoticPotion.exoToReg.put($J.cls(PotionOfDragonsBreath), $J.cls(PotionOfLiquidFlame));
    ExoticPotion.regToExo.put($J.cls(PotionOfToxicGas), $J.cls(PotionOfCorrosiveGas));
    ExoticPotion.exoToReg.put($J.cls(PotionOfCorrosiveGas), $J.cls(PotionOfToxicGas));
    ExoticPotion.regToExo.put($J.cls(PotionOfHaste), $J.cls(PotionOfStamina));
    ExoticPotion.exoToReg.put($J.cls(PotionOfStamina), $J.cls(PotionOfHaste));
    ExoticPotion.regToExo.put($J.cls(PotionOfInvisibility), $J.cls(PotionOfShroudingFog));
    ExoticPotion.exoToReg.put($J.cls(PotionOfShroudingFog), $J.cls(PotionOfInvisibility));
    ExoticPotion.regToExo.put($J.cls(PotionOfLevitation), $J.cls(PotionOfStormClouds));
    ExoticPotion.exoToReg.put($J.cls(PotionOfStormClouds), $J.cls(PotionOfLevitation));
    ExoticPotion.regToExo.put($J.cls(PotionOfParalyticGas), $J.cls(PotionOfEarthenArmor));
    ExoticPotion.exoToReg.put($J.cls(PotionOfEarthenArmor), $J.cls(PotionOfParalyticGas));
    ExoticPotion.regToExo.put($J.cls(PotionOfPurity), $J.cls(PotionOfCleansing));
    ExoticPotion.exoToReg.put($J.cls(PotionOfCleansing), $J.cls(PotionOfPurity));
    ExoticPotion.regToExo.put($J.cls(PotionOfExperience), $J.cls(PotionOfDivineInspiration));
    ExoticPotion.exoToReg.put($J.cls(PotionOfDivineInspiration), $J.cls(PotionOfExperience));
  }
}

export class ExoticPotion$PotionToExotic extends Recipe {
  _ExoticPotion$PotionToExotic(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    if (ingredients.size() === 1 && ExoticPotion.regToExo.containsKey(ingredients.get(0).getClass())) {
      return true;
    }
    return false;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 4;
  }
  brew(ingredients: ArrayList<Item>): Item {
    for (const $it0 = ingredients.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      i.quantity$int((i.quantity$() - 1) | 0);
    }
    return Reflection.newInstance(ExoticPotion.regToExo.get(ingredients.get(0).getClass()));
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return Reflection.newInstance(ExoticPotion.regToExo.get(ingredients.get(0).getClass()));
  }
}

$J.define(ExoticPotion, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_ExoticPotion' }, clinit: true, lazy: ['regToExo', 'exoToReg'] });
$J.define(ExoticPotion$PotionToExotic, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion$PotionToExotic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_ExoticPotion$PotionToExotic' } });
$J.module(() => {
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
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
  PotionOfCleansing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing');
  PotionOfCorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCorrosiveGas');
  PotionOfDivineInspiration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration');
  PotionOfDragonsBreath = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath');
  PotionOfEarthenArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfEarthenArmor');
  PotionOfMagicalSight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfMagicalSight');
  PotionOfMastery = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfMastery');
  PotionOfShielding = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfShielding');
  PotionOfShroudingFog = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfShroudingFog');
  PotionOfSnapFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfSnapFreeze');
  PotionOfStamina = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfStamina');
  PotionOfStormClouds = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfStormClouds');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
