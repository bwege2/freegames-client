// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/HallwayRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, Carpet, GameMath, Point, PointF, Random, Rect;

export class HallwayRoom extends StandardRoom {
  _HallwayRoom(): this {
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
    return other instanceof HallwayRoom && super.canMerge(l, other, p, mergeTerrain);
  }
  merge(l: Level, other: Room, merge: Rect, mergeTerrain: number): void {
    super.merge(l, other, merge, mergeTerrain);
    Painter.set$Level$Point$int(l, this.connected_.get(other), Terrain.EMPTY_SP);
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
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
      Painter.drawLine(level, start, mid, Terrain.EMPTY_SP);
      Painter.drawLine(level, mid, end, Terrain.EMPTY_SP);
    }
    Painter.fill$Level$int$int$int$int$int(level, c.left_, c.top_, 3, 3, Terrain.EMPTY_SP);
    let carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int(c.left_, c.top_, 3, 3);
    if (this.isEntrance()) {
      Painter.fill$Level$int$int$int$int$int(level, (c.left_ + 1) | 0, (c.top_ + 1) | 0, 1, 1, Terrain.ENTRANCE_SP);
      carpet.overrideTile$int$int$int(1, 1, Carpet.CITY_ENTRANCE);
    } else if (this.isExit()) {
      Painter.fill$Level$int$int$int$int$int(level, (c.left_ + 1) | 0, (c.top_ + 1) | 0, 1, 1, Terrain.EXIT);
      carpet.overrideTile$int$int$int(1, 1, Carpet.SKIP);
    } else if (Random.Int$int(2) === 0) {
      Painter.fill$Level$int$int$int$int$int(level, (c.left_ + 1) | 0, (c.top_ + 1) | 0, 1, 1, Terrain.STATUE_SP);
      carpet.overrideTile$int$int$int(1, 1, Carpet.CITY_STATUE);
    } else {
      Painter.fill$Level$int$int$int$int$int(level, (c.left_ + 1) | 0, (c.top_ + 1) | 0, 1, 1, Terrain.REGION_DECO_ALT);
      carpet.overrideTile$int$int$int(1, 1, Carpet.CITY_PEDESTAL);
    }
    level.customTiles.add(carpet);
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
  getConnectionSpace(): Rect {
    let c = this.center();
    c.x = $J.d2i(GameMath.gate(Math.fround((this.left_ + 2) | 0), Math.fround(c.x), Math.fround((this.right_ - 2) | 0)));
    c.y = $J.d2i(GameMath.gate(Math.fround((this.top_ + 2) | 0), Math.fround(c.y), Math.fround((this.bottom_ - 2) | 0)));
    return new Rect()._Rect$int$int$int$int((c.x - 1) | 0, (c.y - 1) | 0, (c.x + 1) | 0, (c.y + 1) | 0);
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
    c.x = $J.d2i(GameMath.gate(Math.fround((this.left_ + 2) | 0), Math.fround(c.x), Math.fround((this.right_ - 2) | 0)));
    c.y = $J.d2i(GameMath.gate(Math.fround((this.top_ + 2) | 0), Math.fround(c.y), Math.fround((this.bottom_ - 2) | 0)));
    return c;
  }
}

$J.define(HallwayRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.HallwayRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_HallwayRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
