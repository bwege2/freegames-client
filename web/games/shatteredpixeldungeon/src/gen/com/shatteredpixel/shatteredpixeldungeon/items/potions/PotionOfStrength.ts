// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfStrength.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, FloatingText, Messages, CharSprite, ItemSpriteSheet$Icons, GLog;

export class PotionOfStrength extends Potion {
  _PotionOfStrength(): this {
    this._Potion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_STRENGTH;
    this.unique = true;
    this.talentFactor = 2;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    hero.STR_++;
    hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '1', FloatingText.STRENGTH, []);
    GLog.p(Messages.get$Object$String$ObjectArr(this, 'msg', [hero.STR()]), []);
    Badges.validateStrengthAttained();
    Badges.validateDuelistUnlock();
  }
  value(): number {
    return this.isKnown() ? Math.imul(50, this.quantity) : super.value();
  }
  energyVal(): number {
    return this.isKnown() ? Math.imul(10, this.quantity) : super.energyVal();
  }
}

$J.define(PotionOfStrength, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_PotionOfStrength' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
