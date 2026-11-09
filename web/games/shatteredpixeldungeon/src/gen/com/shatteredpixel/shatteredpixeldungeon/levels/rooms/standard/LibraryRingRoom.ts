// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/LibraryRingRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { StandardRoom } from './StandardRoom.ts';

let Terrain, Painter, Room$Door$Type, StandardRoom$SizeCategory, Point;

export class LibraryRingRoom extends StandardRoom {
  _LibraryRingRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 9);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 9);
  }
  sizeCatProbs(): number[] {
    return [4, 2, 1];
  }
  resize(w: number, h: number): Rect {
    super.resize(w, h);
    if (this.sizeCat === StandardRoom$SizeCategory.GIANT) {
      if (this.width() % 2 === 1) {
        this.right_--;
      }
      if (this.height() % 2 === 1) {
        this.bottom_--;
      }
    }
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.BOOKSHELF);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 4, Terrain.BOOKSHELF);
    if (this.sizeCat === StandardRoom$SizeCategory.GIANT) {
      let c = new Point()._Point$int$int($J.idiv(((this.left_ + this.right_) | 0), 2), $J.idiv(((this.top_ + this.bottom_) | 0), 2));
      Painter.fill$Level$int$int$int$int$int(level, (c.x - 4) | 0, c.y, 10, 2, Terrain.EMPTY);
      Painter.fill$Level$int$int$int$int$int(level, c.x, (c.y - 4) | 0, 2, 10, Terrain.EMPTY);
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      Painter.drawInside(level, this, door, 2, Terrain.EMPTY);
    }
  }
}

$J.define(LibraryRingRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.LibraryRingRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_LibraryRingRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  Point = $J.load('com.watabou.utils.Point');
});
