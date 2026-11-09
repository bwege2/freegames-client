// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SegmentedRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, Point, Random, Rect;

export class SegmentedRoom extends StandardRoom {
  _SegmentedRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 7);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 7);
  }
  sizeCatProbs(): number[] {
    return [9, 3, 1];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      Painter.set$Level$Point$int(level, door, Terrain.EMPTY);
    }
    this.createWalls(level, new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0));
  }
  createWalls(level: Level, area: Rect): void {
    if ((Math.max((area.width() + 1) | 0, (area.height() + 1) | 0)) < 5 || (Math.min((area.width() + 1) | 0, (area.height() + 1) | 0)) < 3) {
      return;
    }
    let tries = 10;
    if (area.width() > area.height() || (area.width() === area.height() && Random.Int$int(2) === 0)) {
      do {
        let splitX = Random.IntRange((area.left_ + 2) | 0, (area.right_ - 2) | 0);
        if ((level.map_[(splitX + Math.imul(level.width(), ((area.top_ - 1) | 0))) | 0]) === Terrain.WALL && (level.map_[(splitX + Math.imul(level.width(), ((area.bottom_ + 1) | 0))) | 0]) === Terrain.WALL) {
          tries = 0;
          Painter.drawLine(level, new Point()._Point$int$int(splitX, area.top_), new Point()._Point$int$int(splitX, area.bottom_), Terrain.WALL);
          let spaceTop = Random.IntRange(area.top_, (area.bottom_ - 1) | 0);
          Painter.set$Level$int$int$int(level, splitX, spaceTop, Terrain.EMPTY);
          Painter.set$Level$int$int$int(level, splitX, (spaceTop + 1) | 0, Terrain.EMPTY);
          this.createWalls(level, new Rect()._Rect$int$int$int$int(area.left_, area.top_, (splitX - 1) | 0, area.bottom_));
          this.createWalls(level, new Rect()._Rect$int$int$int$int((splitX + 1) | 0, area.top_, area.right_, area.bottom_));
        }
      } while (--tries > 0);
    } else {
      do {
        let splitY = Random.IntRange((area.top_ + 2) | 0, (area.bottom_ - 2) | 0);
        if ((level.map_[(area.left_ - 1 + Math.imul(level.width(), splitY)) | 0]) === Terrain.WALL && (level.map_[(area.right_ + 1 + Math.imul(level.width(), splitY)) | 0]) === Terrain.WALL) {
          tries = 0;
          Painter.drawLine(level, new Point()._Point$int$int(area.left_, splitY), new Point()._Point$int$int(area.right_, splitY), Terrain.WALL);
          let spaceLeft = Random.IntRange(area.left_, (area.right_ - 1) | 0);
          Painter.set$Level$int$int$int(level, spaceLeft, splitY, Terrain.EMPTY);
          Painter.set$Level$int$int$int(level, (spaceLeft + 1) | 0, splitY, Terrain.EMPTY);
          this.createWalls(level, new Rect()._Rect$int$int$int$int(area.left_, area.top_, area.right_, (splitY - 1) | 0));
          this.createWalls(level, new Rect()._Rect$int$int$int$int(area.left_, (splitY + 1) | 0, area.right_, area.bottom_));
        }
      } while (--tries > 0);
    }
  }
}

$J.define(SegmentedRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SegmentedRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_SegmentedRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
