// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/FrozenCarpaccio.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Food } from './Food.ts';

let Barkskin, Buff, Hunger, Invisibility, FloatingText, PotionOfHealing, Messages, CharSprite, ItemSpriteSheet, GLog, Random;

export class FrozenCarpaccio extends Food {
  _FrozenCarpaccio(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.CARPACCIO;
    this.energy = Math.fround(Hunger.HUNGRY / 2);
    return this;
  }
  satisfy(hero: Hero): void {
    super.satisfy(hero);
    FrozenCarpaccio.effect(hero);
  }
  value(): number {
    return Math.imul(10, this.quantity);
  }
  static effect(hero: Hero): void {
    switch (Random.Int$int(5)) {
      case 0:
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(FrozenCarpaccio), 'invis', []), []);
        Buff.affect$Char$Class$float(hero, $J.cls(Invisibility), Invisibility.DURATION);
        break;
      case 1:
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(FrozenCarpaccio), 'hard', []), []);
        Barkskin.conditionallyAppend(hero, $J.idiv(hero.HT, 4), 1);
        break;
      case 2:
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(FrozenCarpaccio), 'refresh', []), []);
        PotionOfHealing.cure(hero);
        break;
      case 3:
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(FrozenCarpaccio), 'better', []), []);
        hero.HP = Math.min((hero.HP + $J.idiv(hero.HT, 4)) | 0, hero.HT);
        hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.idiv(hero.HT, 4)), FloatingText.HEALING, []);
        break;
    }
  }
  static cook(ingredient: MysteryMeat): Food {
    let result = new FrozenCarpaccio()._FrozenCarpaccio();
    result.quantity = ingredient.quantity$();
    return result;
  }
}

$J.define(FrozenCarpaccio, 'com.shatteredpixel.shatteredpixeldungeon.items.food.FrozenCarpaccio', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_FrozenCarpaccio' } });
$J.module(() => {
  Barkskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
