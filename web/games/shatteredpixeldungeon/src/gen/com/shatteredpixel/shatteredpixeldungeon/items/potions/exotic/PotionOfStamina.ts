// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfStamina.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ExoticPotion } from './ExoticPotion.ts';

let Buff, Stamina, SpellSprite, ItemSpriteSheet$Icons;

export class PotionOfStamina extends ExoticPotion {
  _PotionOfStamina(): this {
    this._ExoticPotion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_STAMINA;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    Buff.prolong(hero, $J.cls(Stamina), Stamina.DURATION);
    SpellSprite.show$Char$int$float$float$float(hero, SpellSprite.HASTE, 0.5, 1, 0.5);
  }
}

$J.define(PotionOfStamina, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfStamina', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion', ctors: { '': '_PotionOfStamina' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Stamina = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Stamina');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
