// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/Trinket.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../Item.ts';
import { Recipe } from '../Recipe.ts';

let Dungeon, Catalog, ItemSpriteSheet;

export class Trinket extends Item {
  _Trinket(): this {
    this._Item();
    this.levelKnown = true;
    this.unique = true;
    return this;
  }
  isUpgradable(): boolean {
    return false;
  }
  static trinketLevel(trinketType: JClass<Trinket>): number {
    if (Dungeon.hero == null || Dungeon.hero.belongings == null) {
      return -1;
    }
    let trinket = Dungeon.hero.belongings.getItem(trinketType);
    if (trinket != null) {
      return trinket.buffedLvl();
    } else {
      return -1;
    }
  }
  info(): string {
    let info = super.info();
    info += '\n\n' + this.statsDesc();
    return info;
  }
  energyVal(): number {
    return 5;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.levelKnown = this.cursedKnown = true;
  }
}

export class Trinket$PlaceHolder extends Trinket {
  _Trinket$PlaceHolder(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.TRINKET_HOLDER;
    return this;
  }
  upgradeEnergyCost(): number {
    return 0;
  }
  isSimilar(item: Item): boolean {
    return item instanceof Trinket;
  }
  info(): string {
    return '';
  }
  statsDesc(): string {
    return '';
  }
}

export class Trinket$UpgradeTrinket extends Recipe {
  _Trinket$UpgradeTrinket(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    return ingredients.size() === 1 && ingredients.get(0) instanceof Trinket && ingredients.get(0).level$() < 3;
  }
  cost(ingredients: ArrayList<Item>): number {
    return (ingredients.get(0)).upgradeEnergyCost();
  }
  brew(ingredients: ArrayList<Item>): Item {
    let result = ingredients.get(0).duplicate();
    ingredients.get(0).quantity$int(0);
    result.upgrade$();
    Catalog.countUse(result.getClass());
    return result;
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return ingredients.get(0).duplicate().upgrade$();
  }
}

$J.define(Trinket, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Trinket' } });
$J.define(Trinket$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_Trinket$PlaceHolder' } });
$J.define(Trinket$UpgradeTrinket, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket$UpgradeTrinket', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_Trinket$UpgradeTrinket' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
