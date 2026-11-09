// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfShielding.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Challenges, Dungeon, Barrier, Buff, FloatingText, PotionOfHealing, CharSprite, ItemSpriteSheet$Icons;

export class PotionOfShielding extends ExoticPotion {
  _PotionOfShielding(): this {
    this._ExoticPotion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_SHIELDING;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    if (Dungeon.isChallenged(Challenges.NO_HEALING)) {
      PotionOfHealing.pharmacophobiaProc(hero);
    } else {
      Buff.affect$Char$Class(hero, $J.cls(Barrier)).setShield($J.d2i((Math.fround(Math.fround(Math.fround(0.6) * hero.HT) + 10))));
      hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.d2i((Math.fround(Math.fround(Math.fround(0.6) * hero.HT) + 10)))), FloatingText.SHIELDING, []);
    }
  }
}

$J.define(PotionOfShielding, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfShielding', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion', ctors: { '': '_PotionOfShielding' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
