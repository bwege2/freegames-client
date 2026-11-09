// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/LibraryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Generator, Generator$Category, IronKey, Scroll, ScrollOfIdentify, ScrollOfRemoveCurse, TrinketCatalyst, Terrain, Painter, Room$Door$Type, Random;

export class LibraryRoom extends SpecialRoom {
  _LibraryRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    let entrance = this.entrance();
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, 1, Terrain.BOOKSHELF);
    Painter.drawInside(level, this, entrance, 1, Terrain.EMPTY_SP);
    let n = Random.NormalIntRange(1, 3);
    for (let i = 0; i < n; i++) {
      let pos: number;
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY_SP || level.heaps.get(pos) != null);
      let item: Item;
      if (i === 0) {
        item = Random.Int$int(2) === 0 ? new ScrollOfIdentify()._ScrollOfIdentify() : new ScrollOfRemoveCurse()._ScrollOfRemoveCurse();
      } else {
        item = LibraryRoom.prize(level);
      }
      level.drop(item, pos);
    }
    entrance.set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
  static prize(level: Level): Item {
    let prize = level.findPrizeItem$Class($J.cls(TrinketCatalyst));
    if (prize == null) {
      prize = level.findPrizeItem$Class($J.cls(Scroll));
      if (prize == null) {
        prize = Generator.random$Category(Generator$Category.SCROLL);
      }
    }
    return prize;
  }
}

$J.define(LibraryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.LibraryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_LibraryRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
