// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/TunnelRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ConnectionRoom } from './ConnectionRoom.ts';

let Painter, Room$Door$Type, GameMath, PathFinder, Point, PointF, Random, Rect;

export class TunnelRoom extends ConnectionRoom {
  _TunnelRoom(): this {
    this._ConnectionRoom();
    return this;
  }
  paint(level: Level): void {
    let floor = level.tunnelTile();
    let c = this.getConnectionSpace();
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      let start: Point;
      let mid: Point;
      let end: Point;
      start = new Point()._Point$Point(door);
      if (start.x === this.left_) {
        start.x++;
      } else if (start.y === this.top_) {
        start.y++;
      } else if (start.x === this.right_) {
        start.x--;
      } else if (start.y === this.bottom_) {
        start.y--;
      }
      let rightShift: number;
      let downShift: number;
      if (start.x < c.left_) {
        rightShift = (c.left_ - start.x) | 0;
      } else if (start.x > c.right_) {
        rightShift = (c.right_ - start.x) | 0;
      } else {
        rightShift = 0;
      }
      if (start.y < c.top_) {
        downShift = (c.top_ - start.y) | 0;
      } else if (start.y > c.bottom_) {
        downShift = (c.bottom_ - start.y) | 0;
      } else {
        downShift = 0;
      }
      if (door.x === this.left_ || door.x === this.right_) {
        mid = new Point()._Point$int$int((start.x + rightShift) | 0, start.y);
        end = new Point()._Point$int$int(mid.x, (mid.y + downShift) | 0);
      } else {
        mid = new Point()._Point$int$int(start.x, (start.y + downShift) | 0);
        end = new Point()._Point$int$int((mid.x + rightShift) | 0, mid.y);
      }
      Painter.drawLine(level, start, mid, floor);
      Painter.drawLine(level, mid, end, floor);
    }
    if (this.width() >= 7 && this.height() >= 7 && this.connected_.size() >= 4 && c.square() === 0) {
      let cell = level.pointToCell(new Point()._Point$int$int(c.left_, c.top_));
      let ofs = Math.imul(2, Random.Int$int(4));
      if ((level.map_[(cell + PathFinder.CIRCLE8[((ofs + 7) | 0) % 8]) | 0]) === floor && (level.map_[(cell + PathFinder.CIRCLE8[((ofs + 1) | 0) % 8]) | 0]) === floor) {
        Painter.set$Level$int$int(level, (cell + PathFinder.CIRCLE8[ofs]) | 0, floor);
      }
    }
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      door.set$Type(Room$Door$Type.TUNNEL);
    }
  }
  getConnectionSpace(): Rect {
    let c = this.getDoorCenter();
    return new Rect()._Rect$int$int$int$int(c.x, c.y, c.x, c.y);
  }
  getDoorCenter(): Point {
    let doorCenter = new PointF()._PointF$float$float(0, 0);
    for (const $it2 = this.connected_.values().iterator(); $it2.hasNext(); ) {
      let door = $it2.next();
      doorCenter.x = Math.fround(doorCenter.x + door.x);
      doorCenter.y = Math.fround(doorCenter.y + door.y);
    }
    let c = new Point()._Point$int$int($J.idiv($J.d2i(doorCenter.x), this.connected_.size()), $J.idiv($J.d2i(doorCenter.y), this.connected_.size()));
    if (Random.Float$() < Math.fround(doorCenter.x % 1)) {
      c.x++;
    }
    if (Random.Float$() < Math.fround(doorCenter.y % 1)) {
      c.y++;
    }
    c.x = $J.d2i(GameMath.gate(Math.fround((this.left_ + 1) | 0), Math.fround(c.x), Math.fround((this.right_ - 1) | 0)));
    c.y = $J.d2i(GameMath.gate(Math.fround((this.top_ + 1) | 0), Math.fround(c.y), Math.fround((this.bottom_ - 1) | 0)));
    return c;
  }
}

$J.define(TunnelRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.TunnelRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom', ctors: { '': '_TunnelRoom' } });
$J.module(() => {
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
