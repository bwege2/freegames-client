// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bags/ScrollHolder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let ArcaneResin, Stylus, Scroll, BeaconOfReturning, Spell, Notes, Notes$Landmark, ItemSpriteSheet;

export class ScrollHolder extends Bag {
  _ScrollHolder(): this {
    this._Bag();
    this.image_ = ItemSpriteSheet.HOLDER;
    return this;
  }
  canHold(item: Item): boolean {
    if (item instanceof Scroll || item instanceof Spell || item instanceof ArcaneResin || item instanceof Stylus) {
      return super.canHold(item);
    } else {
      return false;
    }
  }
  capacity(): number {
    return 19;
  }
  onDetach(): void {
    super.onDetach();
    for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      if (item instanceof BeaconOfReturning && (item).returnDepth !== -1) {
        Notes.remove$Landmark$int(Notes$Landmark.BEACON_LOCATION, (item).returnDepth);
        (item).returnDepth = -1;
      }
    }
  }
  value(): number {
    return 40;
  }
}

$J.define(ScrollHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.bags.ScrollHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag', ctors: { '': '_ScrollHolder' } });
$J.module(() => {
  ArcaneResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin');
  Stylus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Stylus');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  BeaconOfReturning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning');
  Spell = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
