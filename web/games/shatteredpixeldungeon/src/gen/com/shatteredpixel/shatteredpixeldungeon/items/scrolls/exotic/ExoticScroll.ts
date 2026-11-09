// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ExoticScroll.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Scroll } from '../Scroll.ts';
import { Recipe } from '../../Recipe.ts';

let Item, ScrollOfIdentify, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfMirrorImage, ScrollOfRage, ScrollOfRecharging, ScrollOfRemoveCurse, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfTerror, ScrollOfTransmutation, ScrollOfUpgrade, ScrollOfAntiMagic, ScrollOfChallenge, ScrollOfDivination, ScrollOfDread, ScrollOfEnchantment, ScrollOfForesight, ScrollOfMetamorphosis, ScrollOfMysticalEnergy, ScrollOfPassage, ScrollOfPrismaticImage, ScrollOfPsionicBlast, ScrollOfSirensSong, Reflection;

export class ExoticScroll extends Scroll {
  static regToExo: LinkedHashMap<JClass<Scroll>, JClass<ExoticScroll>> = null;
  static exoToReg: LinkedHashMap<JClass<ExoticScroll>, JClass<Scroll>> = null;
  _ExoticScroll(): this {
    this._Scroll();
    return this;
  }
  isKnown(): boolean {
    return this.anonymous || (Scroll.handler != null && Scroll.handler.isKnown$Class(ExoticScroll.exoToReg.get(this.getClass())));
  }
  setKnown(): void {
    if (!this.isKnown()) {
      Scroll.handler.know$Class(ExoticScroll.exoToReg.get(this.getClass()));
      Item.updateQuickslot();
    }
  }
  reset(): void {
    super.reset();
    if (Scroll.handler != null && Scroll.handler.contains$Class(ExoticScroll.exoToReg.get(this.getClass()))) {
      this.image_ = (Scroll.handler.image$Class(ExoticScroll.exoToReg.get(this.getClass())) + 16) | 0;
      this.rune = Scroll.handler.label$Class(ExoticScroll.exoToReg.get(this.getClass()));
    }
  }
  value(): number {
    return Math.imul(((Reflection.newInstance(ExoticScroll.exoToReg.get($J.getClass(this))).value() + 30) | 0), this.quantity);
  }
  energyVal(): number {
    return Math.imul(((Reflection.newInstance(ExoticScroll.exoToReg.get($J.getClass(this))).energyVal() + 6) | 0), this.quantity);
  }
  static $clinit() {
    ExoticScroll.regToExo = new LinkedHashMap();
    ExoticScroll.exoToReg = new LinkedHashMap();
    ExoticScroll.regToExo.put($J.cls(ScrollOfUpgrade), $J.cls(ScrollOfEnchantment));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfEnchantment), $J.cls(ScrollOfUpgrade));
    ExoticScroll.regToExo.put($J.cls(ScrollOfIdentify), $J.cls(ScrollOfDivination));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfDivination), $J.cls(ScrollOfIdentify));
    ExoticScroll.regToExo.put($J.cls(ScrollOfRemoveCurse), $J.cls(ScrollOfAntiMagic));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfAntiMagic), $J.cls(ScrollOfRemoveCurse));
    ExoticScroll.regToExo.put($J.cls(ScrollOfMirrorImage), $J.cls(ScrollOfPrismaticImage));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfPrismaticImage), $J.cls(ScrollOfMirrorImage));
    ExoticScroll.regToExo.put($J.cls(ScrollOfRecharging), $J.cls(ScrollOfMysticalEnergy));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfMysticalEnergy), $J.cls(ScrollOfRecharging));
    ExoticScroll.regToExo.put($J.cls(ScrollOfTeleportation), $J.cls(ScrollOfPassage));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfPassage), $J.cls(ScrollOfTeleportation));
    ExoticScroll.regToExo.put($J.cls(ScrollOfLullaby), $J.cls(ScrollOfSirensSong));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfSirensSong), $J.cls(ScrollOfLullaby));
    ExoticScroll.regToExo.put($J.cls(ScrollOfMagicMapping), $J.cls(ScrollOfForesight));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfForesight), $J.cls(ScrollOfMagicMapping));
    ExoticScroll.regToExo.put($J.cls(ScrollOfRage), $J.cls(ScrollOfChallenge));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfChallenge), $J.cls(ScrollOfRage));
    ExoticScroll.regToExo.put($J.cls(ScrollOfRetribution), $J.cls(ScrollOfPsionicBlast));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfPsionicBlast), $J.cls(ScrollOfRetribution));
    ExoticScroll.regToExo.put($J.cls(ScrollOfTerror), $J.cls(ScrollOfDread));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfDread), $J.cls(ScrollOfTerror));
    ExoticScroll.regToExo.put($J.cls(ScrollOfTransmutation), $J.cls(ScrollOfMetamorphosis));
    ExoticScroll.exoToReg.put($J.cls(ScrollOfMetamorphosis), $J.cls(ScrollOfTransmutation));
  }
}

export class ExoticScroll$ScrollToExotic extends Recipe {
  _ExoticScroll$ScrollToExotic(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    if (ingredients.size() === 1 && ExoticScroll.regToExo.containsKey(ingredients.get(0).getClass())) {
      return true;
    }
    return false;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 6;
  }
  brew(ingredients: ArrayList<Item>): Item {
    for (const $it0 = ingredients.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      i.quantity$int((i.quantity$() - 1) | 0);
    }
    return Reflection.newInstance(ExoticScroll.regToExo.get(ingredients.get(0).getClass()));
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return Reflection.newInstance(ExoticScroll.regToExo.get(ingredients.get(0).getClass()));
  }
}

$J.define(ExoticScroll, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_ExoticScroll' }, clinit: true, lazy: ['regToExo', 'exoToReg'] });
$J.define(ExoticScroll$ScrollToExotic, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll$ScrollToExotic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_ExoticScroll$ScrollToExotic' } });
$J.module(() => {
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfTerror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  ScrollOfAntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfAntiMagic');
  ScrollOfChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge');
  ScrollOfDivination = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfDivination');
  ScrollOfDread = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfDread');
  ScrollOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment');
  ScrollOfForesight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfForesight');
  ScrollOfMetamorphosis = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis');
  ScrollOfMysticalEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMysticalEnergy');
  ScrollOfPassage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPassage');
  ScrollOfPrismaticImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPrismaticImage');
  ScrollOfPsionicBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPsionicBlast');
  ScrollOfSirensSong = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfSirensSong');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
