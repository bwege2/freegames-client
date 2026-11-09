// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/PhantomMeat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Barkskin, Buff, Hunger, Invisibility, FloatingText, PotionOfHealing, CharSprite, ItemSpriteSheet;

export class PhantomMeat extends Food {
  _PhantomMeat(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.PHANTOM_MEAT;
    this.energy = Hunger.STARVING;
    return this;
  }
  satisfy(hero: Hero): void {
    super.satisfy(hero);
    PhantomMeat.effect(hero);
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
  static effect(hero: Hero): void {
    Barkskin.conditionallyAppend(hero, $J.idiv(hero.HT, 4), 1);
    Buff.affect$Char$Class$float(hero, $J.cls(Invisibility), Invisibility.DURATION);
    hero.HP = Math.min((hero.HP + $J.idiv(hero.HT, 4)) | 0, hero.HT);
    hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.idiv(hero.HT, 4)), FloatingText.HEALING, []);
    PotionOfHealing.cure(hero);
  }
}

$J.define(PhantomMeat, 'com.shatteredpixel.shatteredpixeldungeon.items.food.PhantomMeat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_PhantomMeat' } });
$J.module(() => {
  Barkskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
