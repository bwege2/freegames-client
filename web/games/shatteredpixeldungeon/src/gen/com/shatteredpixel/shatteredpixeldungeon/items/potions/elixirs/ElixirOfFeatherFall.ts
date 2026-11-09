// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfFeatherFall.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';
import { Recipe$SimpleRecipe } from '../../Recipe.ts';

let Buff, Buff$buffType, Speck, PotionOfLevitation, Messages, ItemSpriteSheet, BuffIndicator, GLog;

export class ElixirOfFeatherFall extends Elixir {
  _ElixirOfFeatherFall(): this {
    this._Elixir();
    this.image_ = ItemSpriteSheet.ELIXIR_FEATHER;
    this.talentChance = Math.fround(1 / Math.fround(ElixirOfFeatherFall$Recipe.OUT_QUANTITY));
    return this;
  }
  apply(hero: Hero): void {
    Buff.append$Char$Class$float(hero, $J.cls(ElixirOfFeatherFall$FeatherBuff), ElixirOfFeatherFall$FeatherBuff.DURATION);
    hero.sprite_.emitter().burst(Speck.factory$int(Speck.JET), 20);
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'light', []), []);
  }
}

export class ElixirOfFeatherFall$FeatherBuff extends FlavourBuff {
  static readonly DURATION: number = 50;
  _ElixirOfFeatherFall$FeatherBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  processFall(): void {
    this.spend(Math.fround(-10));
    if (this.cooldown() <= Math.fround(0)) {
      this.detach();
    }
  }
  icon(): number {
    return BuffIndicator.LEVITATION;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 2, 1.25);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(ElixirOfFeatherFall$FeatherBuff.DURATION - this.visualcooldown())) / ElixirOfFeatherFall$FeatherBuff.DURATION));
  }
}

export class ElixirOfFeatherFall$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 1;
  _ElixirOfFeatherFall$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfLevitation)];
    this.inQuantity = [1];
    this.cost_ = 10;
    this.output = $J.cls(ElixirOfFeatherFall);
    this.outQuantity = ElixirOfFeatherFall$Recipe.OUT_QUANTITY;
    return this;
  }
}

$J.define(ElixirOfFeatherFall, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfFeatherFall', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir', ctors: { '': '_ElixirOfFeatherFall' } });
$J.define(ElixirOfFeatherFall$FeatherBuff, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfFeatherFall$FeatherBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_ElixirOfFeatherFall$FeatherBuff' } });
$J.define(ElixirOfFeatherFall$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfFeatherFall$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ElixirOfFeatherFall$Recipe' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
