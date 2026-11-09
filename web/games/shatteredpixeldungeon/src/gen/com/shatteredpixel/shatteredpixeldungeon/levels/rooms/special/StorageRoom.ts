// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/StorageRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SpecialRoom } from './SpecialRoom.ts';

let Generator, Generator$Category, Honeypot, PotionOfLiquidFlame, Terrain, Painter, Room$Door$Type, Random;

export class StorageRoom extends SpecialRoom {
  _StorageRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    let honeyPot = Random.Int$int(2) === 0;
    let n = Random.IntRange(3, 4);
    for (let i = 0; i < n; i++) {
      let pos: number;
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
      if (honeyPot) {
        level.drop(new Honeypot()._Honeypot(), pos);
        honeyPot = false;
      } else {
        level.drop(StorageRoom.prize(level), pos);
      }
    }
    this.entrance().set$Type(Room$Door$Type.BARRICADE);
    level.addItemToSpawn(new PotionOfLiquidFlame()._PotionOfLiquidFlame());
  }
  static prize(level: Level): Item {
    if (Random.Int$int(3) !== 0) {
      let prize = level.findPrizeItem$();
      if (prize != null) {
        return prize;
      }
    }
    return Generator.random$Category(Random.oneOf([Generator$Category.POTION, Generator$Category.SCROLL, Generator$Category.FOOD, Generator$Category.GOLD]));
  }
}

$J.define(StorageRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.StorageRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_StorageRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
