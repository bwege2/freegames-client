// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CavesFissureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, StandardRoom$SizeCategory, PathFinder, PointF, Random;

export class CavesFissureRoom extends StandardRoom {
  static readonly A: number = 57.29577951308232;
  _CavesFissureRoom(): this {
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
    return [9, 3, 1];
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    if (mergeTerrain === Terrain.CHASM) {
      return true;
    } else {
      let cell = l.pointToCell(this.pointInside(p, 1));
      return l.map_[cell] !== Terrain.CHASM;
    }
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return super.canPlaceItem(p, l) && l.map_[l.pointToCell(p)] !== Terrain.EMPTY_SP;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.map_[l.pointToCell(p)] !== Terrain.EMPTY_SP;
  }
  paint(level: Level): void {
    let pathable = true;
    PathFinder.setMapSize((this.width() - 2) | 0, (this.height() - 2) | 0);
    do {
      Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
      for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
        let door = $it0.next();
        door.set$Type(Room$Door$Type.REGULAR);
      }
      let center = new PointF()._PointF$Point(this.center());
      center.x = Math.fround(center.x + 0.5);
      center.y = Math.fround(center.y + 0.5);
      let doorAngles = new ArrayList();
      for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
        let d = $it1.next();
        let doorCenter = new PointF()._PointF$float$float(Math.fround(d.x + 0.5), Math.fround(d.y + 0.5));
        let doorAngle = CavesFissureRoom.angleBetweenPoints(center, doorCenter);
        if (doorAngle < Math.fround(0)) {
          doorAngle = Math.fround(doorAngle + 360);
        }
        doorAngles.add($J.boxF(doorAngle));
      }
      let lineAngles = new ArrayList();
      let numLines = (1 + this.sizeFactor()) | 0;
      for (let i = 0; i < numLines; i++) {
        let tries = 100;
        let valid: boolean;
        do {
          valid = true;
          let lineAngle = Random.Float$float$float(0, 360);
          for (const $it2 = doorAngles.iterator(); $it2.hasNext(); ) {
            let doorAngle = $it2.next();
            let angleDiff = Math.fround(Math.abs(Math.fround(lineAngle - doorAngle)));
            if (angleDiff > 180) {
              angleDiff = Math.fround(360 - angleDiff);
            }
            if (angleDiff <= (this.sizeCat === StandardRoom$SizeCategory.NORMAL ? 30 : 15)) {
              valid = false;
              break;
            }
          }
          for (const $it3 = lineAngles.iterator(); $it3.hasNext(); ) {
            let existingLineAngle = $it3.next();
            let angleDiff = Math.fround(Math.abs(Math.fround(lineAngle - existingLineAngle)));
            if (angleDiff > 180) {
              angleDiff = Math.fround(360 - angleDiff);
            }
            if (angleDiff <= (numLines === 2 ? 120 : 60)) {
              valid = false;
              break;
            }
          }
          if (valid) {
            lineAngles.add($J.boxF(lineAngle));
          }
        } while (!valid && --tries > 0);
      }
      if (lineAngles.size() < 2) {
        PathFinder.setMapSize(level.width(), level.height());
        return;
      }
      for (const $it4 = lineAngles.iterator(); $it4.hasNext(); ) {
        let lineAngle = $it4.next();
        let dX = Math.fround(Math.cos(lineAngle / CavesFissureRoom.A - 3.141592653589793 / 2));
        let dY = Math.fround(Math.sin(lineAngle / CavesFissureRoom.A - 3.141592653589793 / 2));
        let horizontal: boolean;
        if (Math.fround(Math.abs(dX)) >= Math.fround(Math.abs(dY))) {
          horizontal = true;
          dY = Math.fround(dY / Math.fround(Math.abs(dX)));
          dX = Math.fround(dX / Math.fround(Math.abs(dX)));
        } else {
          horizontal = false;
          dX = Math.fround(dX / Math.fround(Math.abs(dY)));
          dY = Math.fround(dY / Math.fround(Math.abs(dY)));
        }
        let curr = new PointF()._PointF$PointF(center);
        let cell = ($J.d2i(curr.x) + Math.imul(($J.d2i(curr.y)), level.width())) | 0;
        Painter.set$Level$int$int(level, cell, Terrain.CHASM);
        do {
          if (!horizontal) {
            if ((level.map_[(cell - 1) | 0]) === Terrain.EMPTY && ((Math.fround(curr.x % 1) <= 0.5) || this.sizeCat === StandardRoom$SizeCategory.GIANT)) {
              Painter.set$Level$int$int(level, (cell - 1) | 0, Terrain.CHASM);
            }
            if (level.map_[cell] === Terrain.EMPTY) {
              Painter.set$Level$int$int(level, cell, Terrain.CHASM);
            }
            if ((level.map_[(cell + 1) | 0]) === Terrain.EMPTY && ((Math.fround(curr.x % 1) > 0.5) || this.sizeCat === StandardRoom$SizeCategory.GIANT)) {
              Painter.set$Level$int$int(level, (cell + 1) | 0, Terrain.CHASM);
            }
          } else {
            if ((level.map_[(cell - level.width()) | 0]) === Terrain.EMPTY && ((Math.fround(curr.y % 1) <= 0.5) || this.sizeCat === StandardRoom$SizeCategory.GIANT)) {
              Painter.set$Level$int$int(level, (cell - level.width()) | 0, Terrain.CHASM);
            }
            if (level.map_[cell] === Terrain.EMPTY) {
              Painter.set$Level$int$int(level, cell, Terrain.CHASM);
            }
            if ((level.map_[(cell + level.width()) | 0]) === Terrain.EMPTY && ((Math.fround(curr.y % 1) > 0.5) || this.sizeCat === StandardRoom$SizeCategory.GIANT)) {
              Painter.set$Level$int$int(level, (cell + level.width()) | 0, Terrain.CHASM);
            }
          }
          curr.x = Math.fround(curr.x + dX);
          curr.y = Math.fround(curr.y + dY);
          cell = ($J.d2i(curr.x) + Math.imul(($J.d2i(curr.y)), level.width())) | 0;
        } while (level.map_[cell] === Terrain.EMPTY || level.map_[cell] === Terrain.CHASM);
      }
      if (lineAngles.size() >= 3) {
        if (this.sizeCat === StandardRoom$SizeCategory.GIANT) {
          Painter.fill$Level$int$int$int$int$int(level, ($J.d2i(center.x) - 2) | 0, ($J.d2i(center.y) - 2) | 0, 5, 5, Terrain.CHASM);
        } else {
          Painter.fill$Level$int$int$int$int$int(level, ($J.d2i(center.x) - 1) | 0, ($J.d2i(center.y) - 1) | 0, 3, 3, Terrain.CHASM);
        }
      }
      if (lineAngles.size() === 2) {
        this.buildBridge(level, +Random.element$Collection(lineAngles), center, 1);
      } else {
        for (const $it5 = lineAngles.iterator(); $it5.hasNext(); ) {
          let angle = $it5.next();
          this.buildBridge(level, angle, center, this.sizeFactor());
        }
      }
      let doorPoint = 0;
      for (const $it6 = this.connected_.values().iterator(); $it6.hasNext(); ) {
        let door = $it6.next();
        Painter.drawInside(level, this, door, 1, Terrain.EMPTY);
        if (door.x === this.left_) {
          doorPoint = this.xyToRoomCoords((door.x + 1) | 0, door.y);
        } else if (door.x === this.right_) {
          doorPoint = this.xyToRoomCoords((door.x - 1) | 0, door.y);
        } else if (door.y === this.top_) {
          doorPoint = this.xyToRoomCoords(door.x, (door.y + 1) | 0);
        } else if (door.y === this.bottom_) {
          doorPoint = this.xyToRoomCoords(door.x, (door.y - 1) | 0);
        }
      }
      pathable = true;
      let passable = $J.newArray(PathFinder.distance.length, false);
      for (const $it7 = this.shrink$().getPoints().iterator(); $it7.hasNext(); ) {
        let p = $it7.next();
        let i = this.xyToRoomCoords(p.x, p.y);
        passable[i] = level.map_[level.pointToCell(p)] !== Terrain.CHASM;
      }
      PathFinder.buildDistanceMap$int$booleanArr(doorPoint, passable);
      for (const $it8 = this.shrink$().getPoints().iterator(); $it8.hasNext(); ) {
        let p = $it8.next();
        let i = this.xyToRoomCoords(p.x, p.y);
        if (passable[i] && PathFinder.distance[i] === 2147483647) {
          pathable = false;
          break;
        }
      }
    } while (!pathable);
    PathFinder.setMapSize(level.width(), level.height());
  }
  buildBridge(level: Level, fisssureAngle: number, center: PointF, centerMargin: number): void {
    let dX = Math.fround(Math.cos(fisssureAngle / CavesFissureRoom.A - 3.141592653589793 / 2));
    let dY = Math.fround(Math.sin(fisssureAngle / CavesFissureRoom.A - 3.141592653589793 / 2));
    let edgemargin = 2;
    if (Math.fround(Math.abs(dY)) >= Math.fround(Math.abs(dX))) {
      let Y: number;
      if (dY > Math.fround(0)) {
        Y = Random.IntRange(($J.d2i(center.y) + centerMargin) | 0, (this.bottom_ - edgemargin) | 0);
      } else {
        Y = Random.IntRange((this.top_ + edgemargin) | 0, ($J.d2i(center.y) - centerMargin) | 0);
      }
      let foundChasm = false;
      if (dX <= Math.fround(0)) {
        for (let X = (this.left_ + 1) | 0; X <= ((this.right_ - 1) | 0); X++) {
          let cell = (X + Math.imul(Y, level.width())) | 0;
          if (level.map_[cell] === Terrain.CHASM) {
            foundChasm = true;
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_SP);
          } else if (foundChasm) {
            break;
          }
        }
      } else {
        for (let X = (this.right_ - 1) | 0; X >= ((this.left_ + 1) | 0); X--) {
          let cell = (X + Math.imul(Y, level.width())) | 0;
          if (level.map_[cell] === Terrain.CHASM) {
            foundChasm = true;
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_SP);
          } else if (foundChasm) {
            break;
          }
        }
      }
    } else {
      let X: number;
      if (dX > Math.fround(0)) {
        X = Random.IntRange(($J.d2i(center.x) + centerMargin) | 0, (this.right_ - edgemargin) | 0);
      } else {
        X = Random.IntRange((this.left_ + edgemargin) | 0, ($J.d2i(center.x) - centerMargin) | 0);
      }
      let foundChasm = false;
      if (dY <= Math.fround(0)) {
        for (let Y = (this.top_ + 1) | 0; Y <= ((this.bottom_ - 1) | 0); Y++) {
          let cell = (X + Math.imul(Y, level.width())) | 0;
          if (level.map_[cell] === Terrain.CHASM) {
            foundChasm = true;
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_SP);
          } else if (foundChasm) {
            break;
          }
        }
      } else {
        for (let Y = (this.bottom_ - 1) | 0; Y >= ((this.top_ + 1) | 0); Y--) {
          let cell = (X + Math.imul(Y, level.width())) | 0;
          if (level.map_[cell] === Terrain.CHASM) {
            foundChasm = true;
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_SP);
          } else if (foundChasm) {
            break;
          }
        }
      }
    }
  }
  static angleBetweenPoints(from: PointF, to: PointF): number {
    let m = Math.fround((Math.fround(to.y - from.y)) / (Math.fround(to.x - from.x)));
    let angle = Math.fround((CavesFissureRoom.A * (Math.atan(m) + 3.141592653589793 / 2)));
    if (from.x > to.x) {
      angle = Math.fround(angle - 180);
    }
    return angle;
  }
  xyToRoomCoords(x: number, y: number): number {
    return (x - this.left_ - 1 + (Math.imul(((y - this.top_ - 1) | 0), ((this.width() - 2) | 0)))) | 0;
  }
}

$J.define(CavesFissureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CavesFissureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_CavesFissureRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
