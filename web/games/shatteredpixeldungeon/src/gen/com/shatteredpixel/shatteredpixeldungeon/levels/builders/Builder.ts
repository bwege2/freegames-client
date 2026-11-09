// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/builders/Builder.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../jre/index.ts';

let Room, GameMath, Point, PointF, Random, Rect;

export class Builder extends JObject {
  static readonly A: number = 57.29577951308232;
  _Builder(): this {
    return this;
  }
  static findNeighbours(rooms: ArrayList<Room>): void {
    let ra = $J.toArrayInto(rooms.toArray(), $J.newArray(0, null));
    for (let i = 0; i < ((ra.length - 1) | 0); i++) {
      for (let j = (i + 1) | 0; j < ra.length; j++) {
        ra[i].addNeigbour(ra[j]);
      }
    }
  }
  static findFreeSpace(start: Point, collision: ArrayList<Room>, maxSize: number): Rect {
    let space = new Rect()._Rect$int$int$int$int((start.x - maxSize) | 0, (start.y - maxSize) | 0, (start.x + maxSize) | 0, (start.y + maxSize) | 0);
    let colliding = new ArrayList(collision);
    do {
      let it = colliding.iterator();
      while (it.hasNext()) {
        let room = it.next();
        if (room.isEmpty() || Math.max(space.left_, room.left_) >= Math.min(space.right_, room.right_) || Math.max(space.top_, room.top_) >= Math.min(space.bottom_, room.bottom_)) {
          it.remove();
        }
      }
      let closestRoom = null;
      let closestDiff = Math.fround(2147483647);
      let inside: boolean;
      let curDiff = new Point()._Point$();
      for (const $it0 = colliding.iterator(); $it0.hasNext(); ) {
        let curRoom = $it0.next();
        curDiff.x = curDiff.y = 0;
        inside = true;
        if (start.x <= curRoom.left_) {
          inside = false;
          curDiff.x = (curRoom.left_ - start.x) | 0;
        } else if (start.x >= curRoom.right_) {
          inside = false;
          curDiff.x = (start.x - curRoom.right_) | 0;
        }
        if (start.y <= curRoom.top_) {
          inside = false;
          curDiff.y = (curRoom.top_ - start.y) | 0;
        } else if (start.y >= curRoom.bottom_) {
          inside = false;
          curDiff.y = (start.y - curRoom.bottom_) | 0;
        }
        if (inside) {
          space.set$int$int$int$int(start.x, start.y, start.x, start.y);
          return space;
        }
        if (curDiff.length() < closestDiff) {
          closestDiff = curDiff.length();
          closestRoom = curRoom;
        }
      }
      let wDiff: number;
      let hDiff: number;
      if (closestRoom != null) {
        wDiff = 2147483647;
        if (closestRoom.left_ >= start.x) {
          wDiff = Math.imul(((space.right_ - closestRoom.left_) | 0), ((space.height() + 1) | 0));
        } else if (closestRoom.right_ <= start.x) {
          wDiff = Math.imul(((closestRoom.right_ - space.left_) | 0), ((space.height() + 1) | 0));
        }
        hDiff = 2147483647;
        if (closestRoom.top_ >= start.y) {
          hDiff = Math.imul(((space.bottom_ - closestRoom.top_) | 0), ((space.width() + 1) | 0));
        } else if (closestRoom.bottom_ <= start.y) {
          hDiff = Math.imul(((closestRoom.bottom_ - space.top_) | 0), ((space.width() + 1) | 0));
        }
        if (wDiff < hDiff || wDiff === hDiff && Random.Int$int(2) === 0) {
          if (closestRoom.left_ >= start.x && closestRoom.left_ < space.right_) {
            space.right_ = closestRoom.left_;
          }
          if (closestRoom.right_ <= start.x && closestRoom.right_ > space.left_) {
            space.left_ = closestRoom.right_;
          }
        } else {
          if (closestRoom.top_ >= start.y && closestRoom.top_ < space.bottom_) {
            space.bottom_ = closestRoom.top_;
          }
          if (closestRoom.bottom_ <= start.y && closestRoom.bottom_ > space.top_) {
            space.top_ = closestRoom.bottom_;
          }
        }
        colliding.remove(closestRoom);
      } else {
        colliding.clear();
      }
    } while (!colliding.isEmpty());
    return space;
  }
  static angleBetweenRooms(from: Room, to: Room): number {
    let fromCenter = new PointF()._PointF$float$float(Math.fround(((from.left_ + from.right_) | 0) / 2), Math.fround(((from.top_ + from.bottom_) | 0) / 2));
    let toCenter = new PointF()._PointF$float$float(Math.fround(((to.left_ + to.right_) | 0) / 2), Math.fround(((to.top_ + to.bottom_) | 0) / 2));
    return Builder.angleBetweenPoints(fromCenter, toCenter);
  }
  static angleBetweenPoints(from: PointF, to: PointF): number {
    let m = Math.fround((Math.fround(to.y - from.y)) / (Math.fround(to.x - from.x)));
    let angle = Math.fround((Builder.A * (Math.atan(m) + 3.141592653589793 / 2)));
    if (from.x > to.x) {
      angle = Math.fround(angle - 180);
    }
    return angle;
  }
  static placeRoom(collision: ArrayList<Room>, prev: Room, next: Room, angle: number): number {
    angle = Math.fround(angle % 360);
    if (angle < Math.fround(0)) {
      angle = Math.fround(angle + 360);
    }
    let prevCenter = new PointF()._PointF$float$float(Math.fround(((prev.left_ + prev.right_) | 0) / 2), Math.fround(((prev.top_ + prev.bottom_) | 0) / 2));
    let m = Math.tan(angle / Builder.A + 3.141592653589793 / 2);
    let b = prevCenter.y - m * prevCenter.x;
    let start: Point;
    let direction: number;
    if (Math.abs(m) >= 1) {
      if (angle < Math.fround(90) || angle > Math.fround(270)) {
        direction = Room.TOP;
        start = new Point()._Point$int$int($J.l2i($J.lround((prev.top_ - b) / m)), prev.top_);
      } else {
        direction = Room.BOTTOM;
        start = new Point()._Point$int$int($J.l2i($J.lround((prev.bottom_ - b) / m)), prev.bottom_);
      }
    } else {
      if (angle < Math.fround(180)) {
        direction = Room.RIGHT;
        start = new Point()._Point$int$int(prev.right_, $J.l2i($J.lround(m * prev.right_ + b)));
      } else {
        direction = Room.LEFT;
        start = new Point()._Point$int$int(prev.left_, $J.l2i($J.lround(m * prev.left_ + b)));
      }
    }
    if (direction === Room.TOP || direction === Room.BOTTOM) {
      start.x = $J.d2i(GameMath.gate(Math.fround((prev.left_ + 1) | 0), Math.fround(start.x), Math.fround((prev.right_ - 1) | 0)));
    } else {
      start.y = $J.d2i(GameMath.gate(Math.fround((prev.top_ + 1) | 0), Math.fround(start.y), Math.fround((prev.bottom_ - 1) | 0)));
    }
    let space = Builder.findFreeSpace(start, collision, Math.max(next.maxWidth(), next.maxHeight()));
    if (!next.setSizeWithLimit((space.width() + 1) | 0, (space.height() + 1) | 0)) {
      return -1;
    }
    let targetCenter = new PointF()._PointF$();
    if (direction === Room.TOP) {
      targetCenter.y = Math.fround(prev.top_ - Math.fround(((next.height() - 1) | 0) / 2));
      targetCenter.x = Math.fround(((targetCenter.y - b) / m));
      next.setPos($J.roundf(Math.fround(targetCenter.x - Math.fround(((next.width() - 1) | 0) / 2))), (prev.top_ - (next.height() - 1)) | 0);
    } else if (direction === Room.BOTTOM) {
      targetCenter.y = Math.fround(prev.bottom_ + Math.fround(((next.height() - 1) | 0) / 2));
      targetCenter.x = Math.fround(((targetCenter.y - b) / m));
      next.setPos($J.roundf(Math.fround(targetCenter.x - Math.fround(((next.width() - 1) | 0) / 2))), prev.bottom_);
    } else if (direction === Room.RIGHT) {
      targetCenter.x = Math.fround(prev.right_ + Math.fround(((next.width() - 1) | 0) / 2));
      targetCenter.y = Math.fround((m * targetCenter.x + b));
      next.setPos(prev.right_, $J.roundf(Math.fround(targetCenter.y - Math.fround(((next.height() - 1) | 0) / 2))));
    } else if (direction === Room.LEFT) {
      targetCenter.x = Math.fround(prev.left_ - Math.fround(((next.width() - 1) | 0) / 2));
      targetCenter.y = Math.fround((m * targetCenter.x + b));
      next.setPos((prev.left_ - (next.width() - 1)) | 0, $J.roundf(Math.fround(targetCenter.y - Math.fround(((next.height() - 1) | 0) / 2))));
    }
    if (direction === Room.TOP || direction === Room.BOTTOM) {
      if (next.right_ < ((prev.left_ + 2) | 0)) {
        next.shift((prev.left_ + 2 - next.right_) | 0, 0);
      } else if (next.left_ > ((prev.right_ - 2) | 0)) {
        next.shift((prev.right_ - 2 - next.left_) | 0, 0);
      }
      if (next.right_ > space.right_) {
        next.shift((space.right_ - next.right_) | 0, 0);
      } else if (next.left_ < space.left_) {
        next.shift((space.left_ - next.left_) | 0, 0);
      }
    } else {
      if (next.bottom_ < ((prev.top_ + 2) | 0)) {
        next.shift(0, (prev.top_ + 2 - next.bottom_) | 0);
      } else if (next.top_ > ((prev.bottom_ - 2) | 0)) {
        next.shift(0, (prev.bottom_ - 2 - next.top_) | 0);
      }
      if (next.bottom_ > space.bottom_) {
        next.shift(0, (space.bottom_ - next.bottom_) | 0);
      } else if (next.top_ < space.top_) {
        next.shift(0, (space.top_ - next.top_) | 0);
      }
    }
    if (next.connect(prev)) {
      return Builder.angleBetweenRooms(prev, next);
    } else {
      return -1;
    }
  }
}

$J.define(Builder, 'com.shatteredpixel.shatteredpixeldungeon.levels.builders.Builder', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Builder' } });
$J.module(() => {
  Room = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
