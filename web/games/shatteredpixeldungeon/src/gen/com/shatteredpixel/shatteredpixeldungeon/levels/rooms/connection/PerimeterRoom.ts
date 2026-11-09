// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/PerimeterRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { ConnectionRoom } from './ConnectionRoom.ts';

let Painter, Room$Door$Type, Point;

export class PerimeterRoom extends ConnectionRoom {
  static corners: Point[] = null;
  _PerimeterRoom(): this {
    this._ConnectionRoom();
    return this;
  }
  paint(level: Level): void {
    let floor = level.tunnelTile();
    PerimeterRoom.fillPerimiterPaths(level, this, floor);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.TUNNEL);
    }
  }
  static fillPerimiterPaths(l: Level, r: Room, floor: number): void {
    PerimeterRoom.corners = null;
    let pointsToFill = new ArrayList();
    for (const $it1 = r.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      let p = new Point()._Point$Point(door);
      if (p.y === r.top_) {
        p.y++;
      } else if (p.y === r.bottom_) {
        p.y--;
      } else if (p.x === r.left_) {
        p.x++;
      } else {
        p.x--;
      }
      pointsToFill.add(p);
    }
    let pointsFilled = new ArrayList();
    pointsFilled.add(pointsToFill.removeAt(0));
    let from = null;
    let to = null;
    let shortestDistance: number;
    while (!pointsToFill.isEmpty()) {
      shortestDistance = 2147483647;
      for (const $it2 = pointsFilled.iterator(); $it2.hasNext(); ) {
        let f = $it2.next();
        for (const $it3 = pointsToFill.iterator(); $it3.hasNext(); ) {
          let t = $it3.next();
          let dist = PerimeterRoom.distanceBetweenPoints(r, f, t);
          if (dist < shortestDistance) {
            from = f;
            to = t;
            shortestDistance = dist;
          }
        }
      }
      PerimeterRoom.fillBetweenPoints(l, r, from, to, floor);
      pointsFilled.add(to);
      pointsToFill.remove(to);
    }
  }
  static spaceBetween(a: number, b: number): number {
    return ((Math.abs((a - b) | 0)) - 1) | 0;
  }
  static distanceBetweenPoints(r: Room, a: Point, b: Point): number {
    if (((a.x === ((r.left_ + 1) | 0) || a.x === ((r.right_ - 1) | 0)) && a.y === b.y) || ((a.y === ((r.top_ + 1) | 0) || a.y === ((r.bottom_ - 1) | 0)) && a.x === b.x)) {
      return Math.max(PerimeterRoom.spaceBetween(a.x, b.x), PerimeterRoom.spaceBetween(a.y, b.y));
    }
    return ((Math.min((PerimeterRoom.spaceBetween(r.left_, a.x) + PerimeterRoom.spaceBetween(r.left_, b.x)) | 0, (PerimeterRoom.spaceBetween(r.right_, a.x) + PerimeterRoom.spaceBetween(r.right_, b.x)) | 0)) + (Math.min((PerimeterRoom.spaceBetween(r.top_, a.y) + PerimeterRoom.spaceBetween(r.top_, b.y)) | 0, (PerimeterRoom.spaceBetween(r.bottom_, a.y) + PerimeterRoom.spaceBetween(r.bottom_, b.y)) | 0)) - 1) | 0;
  }
  static fillBetweenPoints(level: Level, r: Room, from: Point, to: Point, floor: number): void {
    if (((from.x === ((r.left_ + 1) | 0) || from.x === ((r.right_ - 1) | 0)) && from.x === to.x) || ((from.y === ((r.top_ + 1) | 0) || from.y === ((r.bottom_ - 1) | 0)) && from.y === to.y)) {
      Painter.fill$Level$int$int$int$int$int(level, Math.min(from.x, to.x), Math.min(from.y, to.y), (PerimeterRoom.spaceBetween(from.x, to.x) + 2) | 0, (PerimeterRoom.spaceBetween(from.y, to.y) + 2) | 0, floor);
      return;
    }
    if (PerimeterRoom.corners == null) {
      PerimeterRoom.corners = $J.newArray(4, null);
      PerimeterRoom.corners[0] = new Point()._Point$int$int((r.left_ + 1) | 0, (r.top_ + 1) | 0);
      PerimeterRoom.corners[1] = new Point()._Point$int$int((r.right_ - 1) | 0, (r.top_ + 1) | 0);
      PerimeterRoom.corners[2] = new Point()._Point$int$int((r.right_ - 1) | 0, (r.bottom_ - 1) | 0);
      PerimeterRoom.corners[3] = new Point()._Point$int$int((r.left_ + 1) | 0, (r.bottom_ - 1) | 0);
    }
    for (let c of PerimeterRoom.corners) {
      if ((c.x === from.x || c.y === from.y) && (c.x === to.x || c.y === to.y)) {
        Painter.drawLine(level, from, c, floor);
        Painter.drawLine(level, c, to, floor);
        return;
      }
    }
    let side: Point;
    if (from.y === ((r.top_ + 1) | 0) || from.y === ((r.bottom_ - 1) | 0)) {
      if (((PerimeterRoom.spaceBetween(r.left_, from.x) + PerimeterRoom.spaceBetween(r.left_, to.x)) | 0) <= ((PerimeterRoom.spaceBetween(r.right_, from.x) + PerimeterRoom.spaceBetween(r.right_, to.x)) | 0)) {
        side = new Point()._Point$int$int((r.left_ + 1) | 0, (r.top_ + $J.idiv(r.height(), 2)) | 0);
      } else {
        side = new Point()._Point$int$int((r.right_ - 1) | 0, (r.top_ + $J.idiv(r.height(), 2)) | 0);
      }
    } else {
      if (((PerimeterRoom.spaceBetween(r.top_, from.y) + PerimeterRoom.spaceBetween(r.top_, to.y)) | 0) <= ((PerimeterRoom.spaceBetween(r.bottom_, from.y) + PerimeterRoom.spaceBetween(r.bottom_, to.y)) | 0)) {
        side = new Point()._Point$int$int((r.left_ + $J.idiv(r.width(), 2)) | 0, (r.top_ + 1) | 0);
      } else {
        side = new Point()._Point$int$int((r.left_ + $J.idiv(r.width(), 2)) | 0, (r.bottom_ - 1) | 0);
      }
    }
    PerimeterRoom.fillBetweenPoints(level, r, from, side, floor);
    PerimeterRoom.fillBetweenPoints(level, r, side, to, floor);
  }
}

$J.define(PerimeterRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.PerimeterRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom', ctors: { '': '_PerimeterRoom' } });
$J.module(() => {
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
});
