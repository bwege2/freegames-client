// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StandardBridgeRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../../../../jre/index.ts';
import { StandardRoom } from './StandardRoom.ts';

let Terrain, Painter, Room$Door$Type, Point, Random, Rect;

export class StandardBridgeRoom extends StandardRoom {
  spaceRect: Rect = null;
  bridgeRect: Rect = null;
  _StandardBridgeRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(5, super.minWidth());
  }
  minHeight(): number {
    return Math.max(5, super.minHeight());
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    let cell = l.pointToCell(this.pointInside(p, 1));
    return l.map_[cell] !== this.spaceTile();
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return super.canPlaceItem(p, l) && (this.spaceRect == null || !this.spaceRect.inside$Point(p));
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && (this.spaceRect == null || !this.spaceRect.inside$Point(p));
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let doorsXY = 0;
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      if (door.x === this.left_ || door.x === this.right_) {
        doorsXY++;
      } else {
        doorsXY--;
      }
    }
    doorsXY = (doorsXY + $J.idiv(((this.width() - this.height()) | 0), 2)) | 0;
    if (doorsXY > 0 || (doorsXY === 0 && Random.Int$int(2) === 0)) {
      let spacePoints = new ArrayList();
      for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
        let door = $it1.next();
        if (door.y === this.top_ || door.y === this.bottom_) {
          spacePoints.add(door);
        }
      }
      spacePoints.add(new Point()._Point$int$int((this.left_ + 1) | 0, 0));
      spacePoints.add(new Point()._Point$int$int((this.right_ - 1) | 0, 0));
      Collections.sort(spacePoints, (d1, d2) => {
        return (d1.x - d2.x) | 0;
      });
      let spaceStart = -1;
      let spaceEnd = -1;
      for (let i = 0; i < ((spacePoints.size() - 1) | 0); i++) {
        if (((spaceEnd - spaceStart) | 0) < ((spacePoints.get((i + 1) | 0).x - spacePoints.get(i).x) | 0)) {
          spaceStart = spacePoints.get(i).x;
          spaceEnd = spacePoints.get((i + 1) | 0).x;
        }
      }
      while (((spaceEnd - spaceStart) | 0) > ((this.maxBridgeWidth(this.width()) + 1) | 0)) {
        if (Random.Int$int(2) === 0) {
          spaceStart++;
        } else {
          spaceEnd--;
        }
      }
      this.spaceRect = new Rect()._Rect$int$int$int$int((spaceStart + 1) | 0, (this.top_ + 1) | 0, spaceEnd, this.bottom_);
      let bridgeY = Random.NormalIntRange((this.spaceRect.top_ + 1) | 0, (this.spaceRect.bottom_ - 2) | 0);
      this.bridgeRect = new Rect()._Rect$int$int$int$int(this.spaceRect.left_, bridgeY, this.spaceRect.right_, (bridgeY + 1) | 0);
    } else {
      let spacePoints = new ArrayList();
      for (const $it2 = this.connected_.values().iterator(); $it2.hasNext(); ) {
        let door = $it2.next();
        if (door.x === this.left_ || door.x === this.right_) {
          spacePoints.add(door);
        }
      }
      spacePoints.add(new Point()._Point$int$int(0, (this.top_ + 1) | 0));
      spacePoints.add(new Point()._Point$int$int(0, (this.bottom_ - 1) | 0));
      Collections.sort(spacePoints, (d1, d2) => {
        return (d1.y - d2.y) | 0;
      });
      let spaceStart = -1;
      let spaceEnd = -1;
      for (let i = 0; i < ((spacePoints.size() - 1) | 0); i++) {
        if (((spaceEnd - spaceStart) | 0) < ((spacePoints.get((i + 1) | 0).y - spacePoints.get(i).y) | 0)) {
          spaceStart = spacePoints.get(i).y;
          spaceEnd = spacePoints.get((i + 1) | 0).y;
        }
      }
      while (((spaceEnd - spaceStart) | 0) > ((this.maxBridgeWidth(this.height()) + 1) | 0)) {
        if (Random.Int$int(2) === 0) {
          spaceStart++;
        } else {
          spaceEnd--;
        }
      }
      this.spaceRect = new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, (spaceStart + 1) | 0, this.right_, spaceEnd);
      let bridgeX = Random.NormalIntRange((this.spaceRect.left_ + 1) | 0, (this.spaceRect.right_ - 2) | 0);
      this.bridgeRect = new Rect()._Rect$int$int$int$int(bridgeX, this.spaceRect.top_, (bridgeX + 1) | 0, this.spaceRect.bottom_);
    }
    Painter.fill$Level$Rect$int(level, this.spaceRect, this.spaceTile());
    Painter.fill$Level$Rect$int(level, this.bridgeRect, this.bridgeTile());
  }
  bridgeTile(): number {
    return Terrain.EMPTY_SP;
  }
}

$J.define(StandardBridgeRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardBridgeRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_StandardBridgeRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
