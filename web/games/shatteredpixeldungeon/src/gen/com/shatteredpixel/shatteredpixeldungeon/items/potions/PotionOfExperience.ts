// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfExperience.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Potion } from './Potion.ts';

let Flare, FloatingText, Item, CharSprite, ItemSpriteSheet$Icons;

export class PotionOfExperience extends Potion {
  _PotionOfExperience(): this {
    this._Potion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_EXP;
    this.bones = true;
    this.talentFactor = 2;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(hero.maxExp()), FloatingText.EXPERIENCE, []);
    hero.earnExp(hero.maxExp(), $J.getClass(this));
    new Flare()._Flare(6, 32).color$int$boolean(16776960, true).show$Visual$float(Item.curUser.sprite_, 2);
  }
  value(): number {
    return this.isKnown() ? Math.imul(50, this.quantity) : super.value();
  }
  energyVal(): number {
    return this.isKnown() ? Math.imul(10, this.quantity) : super.energyVal();
  }
}

$J.define(PotionOfExperience, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_PotionOfExperience' } });
$J.module(() => {
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
