// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfIcyTouch.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, FrostImbue, SnowParticle, PotionOfSnapFreeze, ItemSpriteSheet;

export class ElixirOfIcyTouch extends Elixir {
  _ElixirOfIcyTouch(): this {
    this._Elixir();
    this.image_ = ItemSpriteSheet.ELIXIR_ICY;
    return this;
  }
  apply(hero: Hero): void {
    Buff.prolong(hero, $J.cls(FrostImbue), FrostImbue.DURATION);
    hero.sprite_.emitter().burst(SnowParticle.FACTORY, 5);
  }
}

export class ElixirOfIcyTouch$Recipe extends Recipe$SimpleRecipe {
  _ElixirOfIcyTouch$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfSnapFreeze)];
    this.inQuantity = [1];
    this.cost_ = 6;
    this.output = $J.cls(ElixirOfIcyTouch);
    this.outQuantity = 1;
    return this;
  }
}

$J.define(ElixirOfIcyTouch, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfIcyTouch', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir', ctors: { '': '_ElixirOfIcyTouch' } });
$J.define(ElixirOfIcyTouch$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfIcyTouch$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ElixirOfIcyTouch$Recipe' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  FrostImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FrostImbue');
  SnowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle');
  PotionOfSnapFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfSnapFreeze');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
