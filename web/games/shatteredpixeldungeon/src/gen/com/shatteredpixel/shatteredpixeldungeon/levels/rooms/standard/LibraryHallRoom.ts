// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/LibraryHallRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, Point, Random;

export class LibraryHallRoom extends StandardRoom {
  _LibraryHallRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(7, super.minWidth());
  }
  minHeight(): number {
    return Math.max(7, super.minHeight());
  }
  sizeCatProbs(): number[] {
    return [2, 1, 0];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let topBottomBooks = 0;
    let leftRightBooks = 0;
    if (this.width() > this.height()) {
      topBottomBooks = Math.fround(topBottomBooks + ((this.width() - this.height()) | 0));
    } else if (this.height() > this.width()) {
      leftRightBooks = Math.fround(leftRightBooks + ((this.height() - this.width()) | 0));
    }
    if (this.width() % 2 === 0 && this.height() % 2 !== 0) {
      topBottomBooks = Math.fround(topBottomBooks + 2);
    } else if (this.width() % 2 !== 0 && this.height() % 2 === 0) {
      leftRightBooks = Math.fround(leftRightBooks + 2);
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      if (door.x === this.left_ || door.x === this.right_) {
        topBottomBooks = Math.fround(topBottomBooks + Math.fround(0.1));
      } else {
        leftRightBooks = Math.fround(leftRightBooks + Math.fround(0.1));
      }
    }
    let layingOutLeftToRight = topBottomBooks > leftRightBooks || (topBottomBooks === leftRightBooks && Random.Int$int(2) === 0);
    let majorDim = layingOutLeftToRight ? this.height() : this.width();
    let minorDim = layingOutLeftToRight ? this.width() : this.height();
    if (majorDim >= 11 || majorDim < 9) {
      if (layingOutLeftToRight) {
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 1) | 0), Terrain.BOOKSHELF);
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.bottom_ - 1) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 1) | 0), Terrain.BOOKSHELF);
      } else {
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.left_ + 1) | 0, (this.bottom_ - 1) | 0), Terrain.BOOKSHELF);
        Painter.drawLine(level, new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 1) | 0), Terrain.BOOKSHELF);
      }
    }
    let center = this.center();
    let lengthInset = 2;
    if (majorDim >= 9) {
      if (minorDim >= 13) {
        lengthInset++;
      }
      if (layingOutLeftToRight) {
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + lengthInset) | 0, (center.y - 2) | 0), new Point()._Point$int$int((this.right_ - lengthInset) | 0, (center.y - 2) | 0), Terrain.BOOKSHELF);
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + lengthInset) | 0, (center.y + 2) | 0), new Point()._Point$int$int((this.right_ - lengthInset) | 0, (center.y + 2) | 0), Terrain.BOOKSHELF);
      } else {
        Painter.drawLine(level, new Point()._Point$int$int((center.x - 2) | 0, (this.top_ + lengthInset) | 0), new Point()._Point$int$int((center.x - 2) | 0, (this.bottom_ - lengthInset) | 0), Terrain.BOOKSHELF);
        Painter.drawLine(level, new Point()._Point$int$int((center.x + 2) | 0, (this.top_ + lengthInset) | 0), new Point()._Point$int$int((center.x + 2) | 0, (this.bottom_ - lengthInset) | 0), Terrain.BOOKSHELF);
      }
    }
    if (minorDim % 2 === 1 && minorDim < 9) {
      Painter.set$Level$Point$int(level, center, Terrain.REGION_DECO);
    } else {
      let pedestalInset = 2;
      if (minorDim >= 10) {
        pedestalInset++;
        if (minorDim >= 13) {
          pedestalInset++;
        }
      }
      if (layingOutLeftToRight) {
        Painter.set$Level$int$int$int(level, (this.left_ + pedestalInset) | 0, center.y, Terrain.REGION_DECO);
        Painter.set$Level$int$int$int(level, (this.right_ - pedestalInset) | 0, center.y, Terrain.REGION_DECO);
      } else {
        Painter.set$Level$int$int$int(level, center.x, (this.top_ + pedestalInset) | 0, Terrain.REGION_DECO);
        Painter.set$Level$int$int$int(level, center.x, (this.bottom_ - pedestalInset) | 0, Terrain.REGION_DECO);
      }
    }
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      Painter.drawInside(level, this, door, 1, Terrain.EMPTY);
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
}

$J.define(LibraryHallRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.LibraryHallRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_LibraryHallRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
