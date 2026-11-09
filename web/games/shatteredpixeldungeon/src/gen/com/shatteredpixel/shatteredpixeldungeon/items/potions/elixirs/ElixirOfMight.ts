// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfMight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../../../actors/buffs/Buff.ts';

let Badges, Dungeon, Buff$buffType, FloatingText, PotionOfStrength, Messages, CharSprite, ItemSpriteSheet, BuffIndicator, GLog;

export class ElixirOfMight extends Elixir {
  _ElixirOfMight(): this {
    this._Elixir();
    this.image_ = ItemSpriteSheet.ELIXIR_MIGHT;
    this.unique = true;
    this.talentFactor = 2;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    hero.STR_++;
    hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '1', FloatingText.STRENGTH, []);
    Buff.affect$Char$Class(hero, $J.cls(ElixirOfMight$HTBoost)).reset();
    let boost = Buff.affect$Char$Class(hero, $J.cls(ElixirOfMight$HTBoost));
    boost.reset();
    hero.updateHT(true);
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'msg', [hero.STR()]), []);
    Badges.validateStrengthAttained();
    Badges.validateDuelistUnlock();
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [ElixirOfMight$HTBoost.boost(Dungeon.hero != null ? Dungeon.hero.HT : 20)]);
  }
}

export class ElixirOfMight$Recipe extends Recipe$SimpleRecipe {
  _ElixirOfMight$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfStrength)];
    this.inQuantity = [1];
    this.cost_ = 16;
    this.output = $J.cls(ElixirOfMight);
    this.outQuantity = 1;
    return this;
  }
}

export class ElixirOfMight$HTBoost extends Buff {
  left_: number = 0;
  static LEFT: string = null;
  _ElixirOfMight$HTBoost(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  reset(): void {
    this.left_ = 5;
  }
  boost(): number {
    return $J.roundf(Math.fround(Math.imul(this.left_, ElixirOfMight$HTBoost.boost((15 + Math.imul(5, (this.target).lvl)) | 0)) / 5));
  }
  static boost(HT: number): number {
    return $J.roundf(Math.fround(4 + Math.fround(HT / 20)));
  }
  onLevelUp(): void {
    this.left_--;
    if (this.left_ <= 0) {
      this.detach();
    }
  }
  icon(): number {
    return BuffIndicator.HEALING;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0.5, 0);
  }
  iconFadePercent(): number {
    return Math.fround((Math.fround(5 - this.left_)) / 5);
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.boost(), this.left_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ElixirOfMight$HTBoost.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(ElixirOfMight$HTBoost.LEFT);
  }
  static $clinit() {
    ElixirOfMight$HTBoost.LEFT = 'left';
  }
}

$J.define(ElixirOfMight, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir', ctors: { '': '_ElixirOfMight' } });
$J.define(ElixirOfMight$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ElixirOfMight$Recipe' } });
$J.define(ElixirOfMight$HTBoost, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight$HTBoost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ElixirOfMight$HTBoost' }, clinit: true, lazy: ['LEFT'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
