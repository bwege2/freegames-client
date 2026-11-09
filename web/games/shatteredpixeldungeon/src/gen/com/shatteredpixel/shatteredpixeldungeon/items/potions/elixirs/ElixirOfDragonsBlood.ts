// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfDragonsBlood.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Buff, FireImbue, FlameParticle, PotionOfDragonsBreath, ItemSpriteSheet, Sample;

export class ElixirOfDragonsBlood extends Elixir {
  _ElixirOfDragonsBlood(): this {
    this._Elixir();
    this.image_ = ItemSpriteSheet.ELIXIR_DRAGON;
    return this;
  }
  apply(hero: Hero): void {
    Buff.affect$Char$Class(hero, $J.cls(FireImbue)).set(FireImbue.DURATION);
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    hero.sprite_.emitter().burst(FlameParticle.FACTORY, 10);
  }
}

export class ElixirOfDragonsBlood$Recipe extends Recipe$SimpleRecipe {
  _ElixirOfDragonsBlood$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfDragonsBreath)];
    this.inQuantity = [1];
    this.cost_ = 10;
    this.output = $J.cls(ElixirOfDragonsBlood);
    this.outQuantity = 1;
    return this;
  }
}

$J.define(ElixirOfDragonsBlood, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfDragonsBlood', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir', ctors: { '': '_ElixirOfDragonsBlood' } });
$J.define(ElixirOfDragonsBlood$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfDragonsBlood$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ElixirOfDragonsBlood$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  FireImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FireImbue');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  PotionOfDragonsBreath = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDragonsBreath');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
