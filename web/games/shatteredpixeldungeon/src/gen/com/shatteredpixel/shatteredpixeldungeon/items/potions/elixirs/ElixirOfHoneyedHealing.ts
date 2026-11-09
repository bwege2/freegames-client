// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfHoneyedHealing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Hunger, Talent, Bee, Honeypot$ShatteredPot, Item, PotionOfHealing, ItemSpriteSheet, Sample;

export class ElixirOfHoneyedHealing extends Elixir {
  _ElixirOfHoneyedHealing(): this {
    this._Elixir();
    this.image_ = ItemSpriteSheet.ELIXIR_HONEY;
    return this;
  }
  apply(hero: Hero): void {
    PotionOfHealing.cure(hero);
    PotionOfHealing.heal(hero);
    Buff.affect$Char$Class(hero, $J.cls(Hunger)).satisfy(Math.fround(Hunger.HUNGRY / 2));
    Talent.onFoodEaten(hero, Math.fround(Hunger.HUNGRY / 2), this);
  }
  shatter(cell: number): void {
    this.splash(cell);
    if (Dungeon.level.heroFOV[cell]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
    }
    let ch = Actor.findChar(cell);
    if (ch != null) {
      PotionOfHealing.cure(ch);
      PotionOfHealing.heal(ch);
      if (ch instanceof Bee && ch.alignment !== Item.curUser.alignment) {
        ch.alignment = Char$Alignment.ALLY;
        (ch).setPotInfo(-1, null);
      }
    }
  }
  value(): number {
    return Math.imul(this.quantity, 40);
  }
  energyVal(): number {
    return Math.imul(this.quantity, 8);
  }
}

export class ElixirOfHoneyedHealing$Recipe extends Recipe$SimpleRecipe {
  _ElixirOfHoneyedHealing$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfHealing), $J.cls(Honeypot$ShatteredPot)];
    this.inQuantity = [1, 1];
    this.cost_ = 2;
    this.output = $J.cls(ElixirOfHoneyedHealing);
    this.outQuantity = 1;
    return this;
  }
}

$J.define(ElixirOfHoneyedHealing, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfHoneyedHealing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir', ctors: { '': '_ElixirOfHoneyedHealing' } });
$J.define(ElixirOfHoneyedHealing$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfHoneyedHealing$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ElixirOfHoneyedHealing$Recipe' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  Honeypot$ShatteredPot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
