// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/MysteryMeat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Burning, Hunger, Poison, Roots, Slow, ChargrilledMeat, FrozenCarpaccio, StewedMeat, Messages, ItemSpriteSheet, GLog, Random;

export class MysteryMeat extends Food {
  _MysteryMeat(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.MEAT;
    this.energy = Math.fround(Hunger.HUNGRY / 2);
    return this;
  }
  satisfy(hero: Hero): void {
    super.satisfy(hero);
    MysteryMeat.effect(hero);
  }
  value(): number {
    return Math.imul(5, this.quantity);
  }
  static effect(hero: Hero): void {
    switch (Random.Int$int(5)) {
      case 0:
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MysteryMeat), 'hot', []), []);
        Buff.affect$Char$Class(hero, $J.cls(Burning)).reignite$Char(hero);
        break;
      case 1:
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MysteryMeat), 'legs', []), []);
        Buff.prolong(hero, $J.cls(Roots), Math.fround(Roots.DURATION * 2));
        break;
      case 2:
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MysteryMeat), 'not_well', []), []);
        Buff.affect$Char$Class(hero, $J.cls(Poison)).set(Math.fround($J.idiv(hero.HT, 5)));
        break;
      case 3:
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MysteryMeat), 'stuffed', []), []);
        Buff.prolong(hero, $J.cls(Slow), Slow.DURATION);
        break;
    }
  }
}

export class MysteryMeat$PlaceHolder extends MysteryMeat {
  _MysteryMeat$PlaceHolder(): this {
    this._MysteryMeat();
    this.image_ = ItemSpriteSheet.FOOD_HOLDER;
    return this;
  }
  isSimilar(item: Item): boolean {
    return item instanceof MysteryMeat || item instanceof StewedMeat || item instanceof ChargrilledMeat || item instanceof FrozenCarpaccio;
  }
  info(): string {
    return '';
  }
}

$J.define(MysteryMeat, 'com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_MysteryMeat' } });
$J.define(MysteryMeat$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat', ctors: { '': '_MysteryMeat$PlaceHolder' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Slow = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Slow');
  ChargrilledMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.ChargrilledMeat');
  FrozenCarpaccio = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.FrozenCarpaccio');
  StewedMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
