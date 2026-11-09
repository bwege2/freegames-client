// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bags/VelvetPouch.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let GooBlob, MetalShard, Runestone, Plant$Seed, ItemSpriteSheet;

export class VelvetPouch extends Bag {
  _VelvetPouch(): this {
    this._Bag();
    this.image_ = ItemSpriteSheet.POUCH;
    return this;
  }
  canHold(item: Item): boolean {
    if (item instanceof Plant$Seed || item instanceof Runestone || item instanceof GooBlob || item instanceof MetalShard) {
      return super.canHold(item);
    } else {
      return false;
    }
  }
  capacity(): number {
    return 19;
  }
  value(): number {
    return 30;
  }
}

$J.define(VelvetPouch, 'com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag', ctors: { '': '_VelvetPouch' } });
$J.module(() => {
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
