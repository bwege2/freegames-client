// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/brews/AquaBrew.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Brew } from './Brew.ts';
import { Recipe$SimpleRecipe } from '../../Recipe.ts';

let Item, PotionOfStormClouds, GeyserTrap, Ballistica, ItemSpriteSheet;

export class AquaBrew extends Brew {
  _AquaBrew(): this {
    this._Brew();
    this.image_ = ItemSpriteSheet.BREW_AQUA;
    this.talentChance = Math.fround(1 / Math.fround(AquaBrew$Recipe.OUT_QUANTITY));
    return this;
  }
  shatter(cell: number): void {
    let geyser = new GeyserTrap()._GeyserTrap();
    geyser.pos = cell;
    geyser.source_ = this;
    let userPos = Item.curUser == null ? cell : Item.curUser.pos;
    if (userPos !== cell) {
      let aim = new Ballistica()._Ballistica(userPos, cell, Ballistica.STOP_TARGET);
      if (aim.path.size() > ((aim.dist + 1) | 0)) {
        geyser.centerKnockBackDirection = aim.path.get((aim.dist + 1) | 0);
      }
    }
    geyser.activate();
  }
  value(): number {
    return $J.d2i((Math.fround(60 * (Math.fround(this.quantity / Math.fround(AquaBrew$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(12 * (Math.fround(this.quantity / Math.fround(AquaBrew$Recipe.OUT_QUANTITY))))));
  }
}

export class AquaBrew$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 8;
  _AquaBrew$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfStormClouds)];
    this.inQuantity = [1];
    this.cost_ = 8;
    this.output = $J.cls(AquaBrew);
    this.outQuantity = AquaBrew$Recipe.OUT_QUANTITY;
    return this;
  }
}

$J.define(AquaBrew, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.AquaBrew', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew', ctors: { '': '_AquaBrew' } });
$J.define(AquaBrew$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.AquaBrew$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_AquaBrew$Recipe' } });
$J.module(() => {
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  PotionOfStormClouds = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfStormClouds');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
