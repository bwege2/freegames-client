// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bags/MagicalHolster.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Bag } from './Bag.ts';

let Bomb, Wand, MissileWeapon, ItemSpriteSheet;

export class MagicalHolster extends Bag {
  static readonly HOLSTER_SCALE_FACTOR: number = Math.fround(0.85);
  static readonly HOLSTER_DURABILITY_FACTOR: number = Math.fround(1.2);
  _MagicalHolster(): this {
    this._Bag();
    this.image_ = ItemSpriteSheet.HOLSTER;
    return this;
  }
  canHold(item: Item): boolean {
    if (item instanceof Wand || item instanceof MissileWeapon || item instanceof Bomb) {
      return super.canHold(item);
    } else {
      return false;
    }
  }
  capacity(): number {
    return 19;
  }
  collect$Bag(container: Bag): boolean {
    if (super.collect$Bag(container)) {
      if (this.owner != null) {
        for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
          let item = $it0.next();
          if (item instanceof Wand) {
            (item).charge$Char$float(this.owner, MagicalHolster.HOLSTER_SCALE_FACTOR);
          } else if (item instanceof MissileWeapon) {
            (item).holster = true;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }
  onDetach(): void {
    super.onDetach();
    for (const $it1 = this.items_.iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      if (item instanceof Wand) {
        (item).stopCharging();
      } else if (item instanceof MissileWeapon) {
        (item).holster = false;
      }
    }
  }
  value(): number {
    return 60;
  }
}

$J.define(MagicalHolster, 'com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag', ctors: { '': '_MagicalHolster' }, meths: { 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag' } });
$J.module(() => {
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
