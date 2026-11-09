// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfArcaneArmor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Elixir } from './Elixir.ts';
import { Recipe$SimpleRecipe } from '../../Recipe.ts';

let ArcaneArmor, Buff, PotionOfEarthenArmor, GooBlob, Catalog, ItemSpriteSheet;

export class ElixirOfArcaneArmor extends Elixir {
  _ElixirOfArcaneArmor(): this {
    this._Elixir();
    this.image_ = ItemSpriteSheet.ELIXIR_ARCANE;
    return this;
  }
  apply(hero: Hero): void {
    Buff.affect$Char$Class(hero, $J.cls(ArcaneArmor)).set((5 + $J.idiv(hero.lvl, 2)) | 0, 80);
  }
}

export class ElixirOfArcaneArmor$Recipe extends Recipe$SimpleRecipe {
  _ElixirOfArcaneArmor$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfEarthenArmor), $J.cls(GooBlob)];
    this.inQuantity = [1, 1];
    this.cost_ = 8;
    this.output = $J.cls(ElixirOfArcaneArmor);
    this.outQuantity = 1;
    return this;
  }
  brew(ingredients: ArrayList<Item>): Item {
    Catalog.countUse($J.cls(GooBlob));
    return super.brew(ingredients);
  }
}

$J.define(ElixirOfArcaneArmor, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfArcaneArmor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir', ctors: { '': '_ElixirOfArcaneArmor' } });
$J.define(ElixirOfArcaneArmor$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfArcaneArmor$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ElixirOfArcaneArmor$Recipe' } });
$J.module(() => {
  ArcaneArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArcaneArmor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  PotionOfEarthenArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfEarthenArmor');
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
