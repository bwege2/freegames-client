// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StatueLineRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class StatueLineRoom extends StandardRoom {
  static N: number = null;
  static E: number = null;
  static S: number = null;
  static W: number = null;
  _StatueLineRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(5, super.minWidth());
  }
  minHeight(): number {
    return Math.max(5, super.minHeight());
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let sidePreferences = [1, 1, 1, 1];
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      if (door.y === this.top_) {
        sidePreferences[StatueLineRoom.N] = Math.fround(sidePreferences[StatueLineRoom.N] - 2);
      }
      if (door.y === ((this.top_ + 1) | 0)) {
        sidePreferences[StatueLineRoom.N] = Math.fround(sidePreferences[StatueLineRoom.N] - 1);
      }
      if (door.y === this.bottom_) {
        sidePreferences[StatueLineRoom.S] = Math.fround(sidePreferences[StatueLineRoom.S] - 2);
      }
      if (door.y === ((this.bottom_ - 1) | 0)) {
        sidePreferences[StatueLineRoom.S] = Math.fround(sidePreferences[StatueLineRoom.S] - 1);
      }
      if (door.x === this.left_) {
        sidePreferences[StatueLineRoom.W] = Math.fround(sidePreferences[StatueLineRoom.W] - 2);
      }
      if (door.x === ((this.left_ + 1) | 0)) {
        sidePreferences[StatueLineRoom.W] = Math.fround(sidePreferences[StatueLineRoom.W] - 1);
      }
      if (door.x === this.right_) {
        sidePreferences[StatueLineRoom.E] = Math.fround(sidePreferences[StatueLineRoom.E] - 2);
      }
      if (door.x === ((this.right_ - 1) | 0)) {
        sidePreferences[StatueLineRoom.E] = Math.fround(sidePreferences[StatueLineRoom.E] - 1);
      }
    }
    let chosenSide = Random.chances$floatArr(sidePreferences);
    while (chosenSide === -1) {
      sidePreferences[StatueLineRoom.N]++;
      sidePreferences[StatueLineRoom.E]++;
      sidePreferences[StatueLineRoom.S]++;
      sidePreferences[StatueLineRoom.W]++;
      chosenSide = Random.chances$floatArr(sidePreferences);
    }
    this.fillAlongSide(chosenSide, level);
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      door.set$Type(Room$Door$Type.REGULAR);
      Painter.drawInside(level, this, door, 1, Terrain.EMPTY);
    }
  }
  decoTerrain(): number {
    return Terrain.STATUE;
  }
  fillAlongSide(side: number, level: Level): void {
    switch (side) {
      case 0:
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 1) | 0), this.decoTerrain());
        break;
      case 1:
        Painter.drawLine(level, new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 1) | 0), this.decoTerrain());
        break;
      case 2:
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.bottom_ - 1) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 1) | 0), this.decoTerrain());
        break;
      case 3:
        Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.left_ + 1) | 0, (this.bottom_ - 1) | 0), this.decoTerrain());
        break;
    }
  }
  static $clinit() {
    StatueLineRoom.N = 0;
    StatueLineRoom.E = 1;
    StatueLineRoom.S = 2;
    StatueLineRoom.W = 3;
  }
}

$J.define(StatueLineRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StatueLineRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_StatueLineRoom' }, clinit: true, lazy: ['N', 'E', 'S', 'W'] });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
