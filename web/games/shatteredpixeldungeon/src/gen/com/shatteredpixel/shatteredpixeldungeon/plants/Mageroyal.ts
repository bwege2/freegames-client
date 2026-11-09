// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/plants/Mageroyal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Plant } from './Plant.ts';
import { Plant$Seed } from './Plant.ts';

let BlobImmunity, Buff, Hero, HeroSubClass, PotionOfHealing, Messages, ItemSpriteSheet, GLog;

export class Mageroyal extends Plant {
  _Mageroyal(): this {
    this._Plant();
    this.image_ = 7;
    this.seedClass = $J.cls(Mageroyal$Seed);
    return this;
  }
  activate(ch: Char): void {
    if (ch != null) {
      PotionOfHealing.cure(ch);
      if (ch instanceof Hero) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'refreshed', []), []);
        if ((ch).subClass === HeroSubClass.WARDEN) {
          Buff.affect$Char$Class$float(ch, $J.cls(BlobImmunity), Math.fround(BlobImmunity.DURATION / 2));
        }
      }
    }
  }
}

export class Mageroyal$Seed extends Plant$Seed {
  _Mageroyal$Seed(): this {
    this._Plant$Seed();
    this.image_ = ItemSpriteSheet.SEED_MAGEROYAL;
    this.plantClass = $J.cls(Mageroyal);
    return this;
  }
}

$J.define(Mageroyal, 'com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant', ctors: { '': '_Mageroyal' } });
$J.define(Mageroyal$Seed, 'com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal$Seed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed', ctors: { '': '_Mageroyal$Seed' } });
$J.module(() => {
  BlobImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.BlobImmunity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
