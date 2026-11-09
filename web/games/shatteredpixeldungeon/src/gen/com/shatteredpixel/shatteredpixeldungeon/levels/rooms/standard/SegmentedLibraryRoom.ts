// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SegmentedLibraryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, Carpet, Point, Random, Rect;

export class SegmentedLibraryRoom extends StandardRoom {
  _SegmentedLibraryRoom(): this {
    this._StandardRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 3, 1];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.BOOKSHELF);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY_SP);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      Painter.drawInside(level, this, door, 2, Terrain.EMPTY_SP);
    }
    this.createWalls(level, new Rect()._Rect$int$int$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0, (this.right_ - 2) | 0, (this.bottom_ - 2) | 0));
    for (let x = (this.left_ + 1) | 0; x < ((this.right_ - 2) | 0); x++) {
      for (let y = (this.top_ + 1) | 0; y < ((this.bottom_ - 2) | 0); y++) {
        let cell = (x + Math.imul(y, level.width())) | 0;
        if (level.map_[cell] === Terrain.EMPTY_SP && ((level.map_[(cell - 1) | 0]) === Terrain.BOOKSHELF || (level.map_[(cell - 1 + level.width()) | 0]) === Terrain.BOOKSHELF)) {
          let width = 1;
          let height = 1;
          while ((level.map_[(cell + width) | 0]) === Terrain.EMPTY_SP && (level.map_[(cell + width + level.width()) | 0]) === Terrain.EMPTY_SP) {
            width++;
          }
          while ((level.map_[(cell + (Math.imul(height, level.width()))) | 0]) === Terrain.EMPTY_SP && (level.map_[(cell + (Math.imul(height, level.width())) + 1) | 0]) === Terrain.EMPTY_SP) {
            height++;
          }
          if (width > 1 && height > 1) {
            let carpet = new Carpet()._Carpet();
            carpet.setRect$int$int$int$int(x, y, width, height);
            y = (y + (height - 1)) | 0;
          }
        }
      }
    }
  }
  createWalls(level: Level, area: Rect): void {
    if ((Math.max((area.width() + 1) | 0, (area.height() + 1) | 0)) >= 4 && (Math.min((area.width() + 1) | 0, (area.height() + 1) | 0)) >= 3) {
      let tries = 10;
      if (area.width() > area.height() || (area.width() === area.height() && Random.Int$int(2) === 0)) {
        do {
          let splitX = Random.IntRange((area.left_ + 2) | 0, (area.right_ - 2) | 0);
          if ((level.map_[(splitX + Math.imul(level.width(), ((area.top_ - 1) | 0))) | 0]) === Terrain.BOOKSHELF && (level.map_[(splitX + Math.imul(level.width(), ((area.bottom_ + 1) | 0))) | 0]) === Terrain.BOOKSHELF) {
            Painter.drawLine(level, new Point()._Point$int$int(splitX, area.top_), new Point()._Point$int$int(splitX, area.bottom_), Terrain.BOOKSHELF);
            let spaceTop = Random.IntRange(area.top_, (area.bottom_ - 1) | 0);
            Painter.set$Level$int$int$int(level, splitX, spaceTop, Terrain.EMPTY_SP);
            this.createWalls(level, new Rect()._Rect$int$int$int$int(area.left_, area.top_, (splitX - 1) | 0, area.bottom_));
            this.createWalls(level, new Rect()._Rect$int$int$int$int((splitX + 1) | 0, area.top_, area.right_, area.bottom_));
            return;
          }
        } while (--tries > 0);
      } else {
        do {
          let splitY = Random.IntRange((area.top_ + 2) | 0, (area.bottom_ - 2) | 0);
          if ((level.map_[(area.left_ - 1 + Math.imul(level.width(), splitY)) | 0]) === Terrain.BOOKSHELF && (level.map_[(area.right_ + 1 + Math.imul(level.width(), splitY)) | 0]) === Terrain.BOOKSHELF) {
            Painter.drawLine(level, new Point()._Point$int$int(area.left_, splitY), new Point()._Point$int$int(area.right_, splitY), Terrain.BOOKSHELF);
            let spaceLeft = Random.IntRange(area.left_, (area.right_ - 1) | 0);
            Painter.set$Level$int$int$int(level, spaceLeft, splitY, Terrain.EMPTY_SP);
            this.createWalls(level, new Rect()._Rect$int$int$int$int(area.left_, area.top_, area.right_, (splitY - 1) | 0));
            this.createWalls(level, new Rect()._Rect$int$int$int$int(area.left_, (splitY + 1) | 0, area.right_, area.bottom_));
            return;
          }
        } while (--tries > 0);
      }
    }
    if (((area.width() + 1) | 0) >= 2 && ((area.height() + 1) | 0) >= 2) {
      let carpet = new Carpet()._Carpet();
      carpet.setRect$int$int$int$int(area.left_, area.top_, (area.width() + 1) | 0, (area.height() + 1) | 0);
      level.customTiles.add(carpet);
    }
  }
}

$J.define(SegmentedLibraryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SegmentedLibraryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_SegmentedLibraryRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
