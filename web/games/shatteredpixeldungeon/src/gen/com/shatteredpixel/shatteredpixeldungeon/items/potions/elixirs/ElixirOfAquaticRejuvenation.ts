// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/elixirs/ElixirOfAquaticRejuvenation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../../../actors/buffs/Buff.ts';
import { Recipe$SimpleRecipe } from '../../Recipe.ts';

let Challenges, Dungeon, Actor, Buff$buffType, Hero, FloatingText, PotionOfHealing, GooBlob, Catalog, Messages, CharSprite, ItemSpriteSheet, BuffIndicator, GameMath, Random;

export class ElixirOfAquaticRejuvenation extends Elixir {
  _ElixirOfAquaticRejuvenation(): this {
    this._Elixir();
    this.image_ = ItemSpriteSheet.ELIXIR_AQUA;
    return this;
  }
  apply(hero: Hero): void {
    if (Dungeon.isChallenged(Challenges.NO_HEALING)) {
      PotionOfHealing.pharmacophobiaProc(hero);
    } else {
      Buff.affect$Char$Class(hero, $J.cls(ElixirOfAquaticRejuvenation$AquaHealing)).set($J.roundf(Math.fround(hero.HT * 1.5)));
    }
  }
}

export class ElixirOfAquaticRejuvenation$AquaHealing extends Buff {
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _ElixirOfAquaticRejuvenation$AquaHealing(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  set(amount: number): void {
    if (amount > this.left_) {
      this.left_ = amount;
    }
  }
  extend(duration: number): void {
    this.left_ = $J.d2i(Math.fround(this.left_ + duration));
  }
  act(): boolean {
    if (!this.target.flying && Dungeon.level.water[this.target.pos] && this.target.HP < this.target.HT) {
      let healAmt = GameMath.gate(1, Math.fround(this.target.HT / 50), Math.fround(this.left_));
      healAmt = Math.min(healAmt, Math.fround((this.target.HT - this.target.HP) | 0));
      if (Random.Float$() < (Math.fround(healAmt % 1))) {
        healAmt = Math.fround(Math.ceil(healAmt));
      } else {
        healAmt = Math.fround(Math.floor(healAmt));
      }
      this.target.HP = (this.target.HP + $J.d2i(healAmt)) | 0;
      this.left_ = (this.left_ - $J.d2i(healAmt)) | 0;
      this.target.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.d2i(healAmt)), FloatingText.HEALING, []);
      if (this.target.HP >= this.target.HT) {
        this.target.HP = this.target.HT;
        if (this.target instanceof Hero) {
          (this.target).resting = false;
        }
      }
    }
    if (this.left_ <= 0) {
      this.detach();
      if (this.target instanceof Hero) {
        (this.target).resting = false;
      }
    } else {
      this.spend(Actor.TICK);
    }
    return true;
  }
  icon(): number {
    return BuffIndicator.HEALING;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 0.75, 0.75);
  }
  iconFadePercent(): number {
    let max = Math.fround($J.roundf(Math.fround(this.target.HT * 1.5)));
    return Math.max(0, Math.fround((Math.fround(max - this.left_)) / max));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.left_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ElixirOfAquaticRejuvenation$AquaHealing.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(ElixirOfAquaticRejuvenation$AquaHealing.LEFT);
  }
}

export class ElixirOfAquaticRejuvenation$Recipe extends Recipe$SimpleRecipe {
  _ElixirOfAquaticRejuvenation$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(PotionOfHealing), $J.cls(GooBlob)];
    this.inQuantity = [1, 1];
    this.cost_ = 6;
    this.output = $J.cls(ElixirOfAquaticRejuvenation);
    this.outQuantity = 1;
    return this;
  }
  brew(ingredients: ArrayList<Item>): Item {
    Catalog.countUse($J.cls(GooBlob));
    return super.brew(ingredients);
  }
}

$J.define(ElixirOfAquaticRejuvenation, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfAquaticRejuvenation', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir', ctors: { '': '_ElixirOfAquaticRejuvenation' } });
$J.define(ElixirOfAquaticRejuvenation$AquaHealing, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfAquaticRejuvenation$AquaHealing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ElixirOfAquaticRejuvenation$AquaHealing' } });
$J.define(ElixirOfAquaticRejuvenation$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfAquaticRejuvenation$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_ElixirOfAquaticRejuvenation$Recipe' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Random = $J.load('com.watabou.utils.Random');
});
