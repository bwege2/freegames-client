// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SewerPipeRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { StandardRoom } from './StandardRoom.ts';

let Terrain, Painter, Room$Door$Type, StandardRoom$SizeCategory, GameMath, PathFinder, Point, PointF, Random, Rect;

export class SewerPipeRoom extends StandardRoom {
  corners: Point[] = null;
  _SewerPipeRoom(): this {
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
    return [3, 2, 1];
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    return false;
  }
  canConnect$Point(p: Point): boolean {
    return super.canConnect$Point(p) && ((p.x > ((this.left_ + 1) | 0) && p.x < ((this.right_ - 1) | 0)) || (p.y > ((this.top_ + 1) | 0) && p.y < ((this.bottom_ - 1) | 0)));
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let c = this.getConnectionSpace();
    if (this.connected_.size() === 1 || (this.connected_.size() === 2 && this.sizeCat === StandardRoom$SizeCategory.NORMAL)) {
      for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
        let door = $it0.next();
        let start: Point;
        let mid: Point;
        let end: Point;
        start = new Point()._Point$Point(door);
        if (start.x === this.left_) {
          start.x = (start.x + 2) | 0;
        } else if (start.y === this.top_) {
          start.y = (start.y + 2) | 0;
        } else if (start.x === this.right_) {
          start.x = (start.x - 2) | 0;
        } else if (start.y === this.bottom_) {
          start.y = (start.y - 2) | 0;
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
        Painter.drawLine(level, start, mid, Terrain.WATER);
        Painter.drawLine(level, mid, end, Terrain.WATER);
      }
    } else {
      let doorPoints = new ArrayList(this.connected_.values());
      if (doorPoints.size() === 2) {
        let p = new Point()._Point$();
        let valid: boolean;
        do {
          valid = true;
          if (Random.Int$int(2) === 0) {
            p.x = Random.Int$int(2) === 0 ? this.left_ : this.right_;
            p.y = Random.IntRange((this.top_ + 2) | 0, (this.bottom_ - 2) | 0);
          } else {
            p.x = Random.IntRange((this.left_ + 2) | 0, (this.right_ - 2) | 0);
            p.y = Random.Int$int(2) === 0 ? this.top_ : this.bottom_;
          }
          for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
            let door = $it1.next();
            if (door.x === p.x || door.y === p.y) {
              valid = false;
            }
          }
        } while (!valid);
        doorPoints.add(p);
      }
      let pointsToFill = new ArrayList();
      for (const $it2 = doorPoints.iterator(); $it2.hasNext(); ) {
        let door = $it2.next();
        let p = new Point()._Point$Point(door);
        if (p.y === this.top_) {
          p.y = (p.y + 2) | 0;
        } else if (p.y === this.bottom_) {
          p.y = (p.y - 2) | 0;
        } else if (p.x === this.left_) {
          p.x = (p.x + 2) | 0;
        } else {
          p.x = (p.x - 2) | 0;
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
        for (const $it3 = pointsFilled.iterator(); $it3.hasNext(); ) {
          let f = $it3.next();
          for (const $it4 = pointsToFill.iterator(); $it4.hasNext(); ) {
            let t = $it4.next();
            let dist = this.distanceBetweenPoints(f, t);
            if (dist < shortestDistance) {
              from = f;
              to = t;
              shortestDistance = dist;
            }
          }
        }
        this.fillBetweenPoints(level, from, to, Terrain.WATER);
        pointsFilled.add(to);
        pointsToFill.remove(to);
      }
    }
    for (const $it5 = this.getPoints().iterator(); $it5.hasNext(); ) {
      let p = $it5.next();
      let cell = level.pointToCell(p);
      if (level.map_[cell] === Terrain.WATER) {
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((level.map_[(cell + i) | 0]) === Terrain.WALL) {
            Painter.set$Level$int$int(level, (cell + i) | 0, Terrain.EMPTY);
          }
        }
      }
    }
    for (const $it6 = this.connected_.keySet().iterator(); $it6.hasNext(); ) {
      let r = $it6.next();
      if (r instanceof SewerPipeRoom) {
        let door = this.connected_.get(r);
        Painter.fill$Level$int$int$int$int$int(level, (door.x - 1) | 0, (door.y - 1) | 0, 3, 3, Terrain.EMPTY);
        if (door.x === this.left_ || door.x === this.right_) {
          Painter.fill$Level$int$int$int$int$int(level, (door.x - 1) | 0, door.y, 3, 1, Terrain.WATER);
        } else {
          Painter.fill$Level$int$int$int$int$int(level, door.x, (door.y - 1) | 0, 1, 3, Terrain.WATER);
        }
        this.connected_.get(r).set$Type(Room$Door$Type.WATER);
      } else {
        this.connected_.get(r).set$Type(Room$Door$Type.REGULAR);
      }
    }
  }
  getConnectionSpace(): Rect {
    let c = this.connected_.size() <= 1 ? this.center() : this.getDoorCenter();
    return new Rect()._Rect$int$int$int$int(c.x, c.y, c.x, c.y);
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
  getDoorCenter(): Point {
    let doorCenter = new PointF()._PointF$float$float(0, 0);
    for (const $it7 = this.connected_.values().iterator(); $it7.hasNext(); ) {
      let door = $it7.next();
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
    c.x = $J.d2i(GameMath.gate(Math.fround((this.left_ + 2) | 0), Math.fround(c.x), Math.fround((this.right_ - 2) | 0)));
    c.y = $J.d2i(GameMath.gate(Math.fround((this.top_ + 2) | 0), Math.fround(c.y), Math.fround((this.bottom_ - 2) | 0)));
    return c;
  }
  spaceBetween(a: number, b: number): number {
    return ((Math.abs((a - b) | 0)) - 1) | 0;
  }
  distanceBetweenPoints(a: Point, b: Point): number {
    if (((a.x === ((this.left_ + 2) | 0) || a.x === ((this.right_ - 2) | 0)) && a.y === b.y) || ((a.y === ((this.top_ + 2) | 0) || a.y === ((this.bottom_ - 2) | 0)) && a.x === b.x)) {
      return Math.max(this.spaceBetween(a.x, b.x), this.spaceBetween(a.y, b.y));
    }
    return ((Math.min((this.spaceBetween(this.left_, a.x) + this.spaceBetween(this.left_, b.x)) | 0, (this.spaceBetween(this.right_, a.x) + this.spaceBetween(this.right_, b.x)) | 0)) + (Math.min((this.spaceBetween(this.top_, a.y) + this.spaceBetween(this.top_, b.y)) | 0, (this.spaceBetween(this.bottom_, a.y) + this.spaceBetween(this.bottom_, b.y)) | 0)) - 1) | 0;
  }
  fillBetweenPoints(level: Level, from: Point, to: Point, floor: number): void {
    if (((from.x === ((this.left_ + 2) | 0) || from.x === ((this.right_ - 2) | 0)) && from.x === to.x) || ((from.y === ((this.top_ + 2) | 0) || from.y === ((this.bottom_ - 2) | 0)) && from.y === to.y)) {
      Painter.fill$Level$int$int$int$int$int(level, Math.min(from.x, to.x), Math.min(from.y, to.y), (this.spaceBetween(from.x, to.x) + 2) | 0, (this.spaceBetween(from.y, to.y) + 2) | 0, floor);
      return;
    }
    if (this.corners == null) {
      this.corners = $J.newArray(4, null);
      this.corners[0] = new Point()._Point$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0);
      this.corners[1] = new Point()._Point$int$int((this.right_ - 2) | 0, (this.top_ + 2) | 0);
      this.corners[2] = new Point()._Point$int$int((this.right_ - 2) | 0, (this.bottom_ - 2) | 0);
      this.corners[3] = new Point()._Point$int$int((this.left_ + 2) | 0, (this.bottom_ - 2) | 0);
    }
    for (let c of this.corners) {
      if ((c.x === from.x || c.y === from.y) && (c.x === to.x || c.y === to.y)) {
        Painter.drawLine(level, from, c, floor);
        Painter.drawLine(level, c, to, floor);
        return;
      }
    }
    let side: Point;
    if (from.y === ((this.top_ + 2) | 0) || from.y === ((this.bottom_ - 2) | 0)) {
      if (((this.spaceBetween(this.left_, from.x) + this.spaceBetween(this.left_, to.x)) | 0) <= ((this.spaceBetween(this.right_, from.x) + this.spaceBetween(this.right_, to.x)) | 0)) {
        side = new Point()._Point$int$int((this.left_ + 2) | 0, (this.top_ + $J.idiv(this.height(), 2)) | 0);
      } else {
        side = new Point()._Point$int$int((this.right_ - 2) | 0, (this.top_ + $J.idiv(this.height(), 2)) | 0);
      }
    } else {
      if (((this.spaceBetween(this.top_, from.y) + this.spaceBetween(this.top_, to.y)) | 0) <= ((this.spaceBetween(this.bottom_, from.y) + this.spaceBetween(this.bottom_, to.y)) | 0)) {
        side = new Point()._Point$int$int((this.left_ + $J.idiv(this.width(), 2)) | 0, (this.top_ + 2) | 0);
      } else {
        side = new Point()._Point$int$int((this.left_ + $J.idiv(this.width(), 2)) | 0, (this.bottom_ - 2) | 0);
      }
    }
    this.fillBetweenPoints(level, from, side, floor);
    this.fillBetweenPoints(level, side, to, floor);
  }
}

$J.define(SewerPipeRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SewerPipeRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_SewerPipeRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
