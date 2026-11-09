// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RingRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, Random;

export class RingRoom extends StandardRoom {
  _RingRoom(): this {
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
    let minDim = Math.min(this.width(), this.height());
    let passageWidth = $J.d2i(Math.floor(Math.fround(Math.fround(0.2) * ((minDim + 3) | 0))));
    Painter.fill$Level$Rect$int$int(level, this, (passageWidth + 1) | 0, Terrain.WALL);
    if (minDim >= 10) {
      Painter.fill$Level$Rect$int$int(level, this, (passageWidth + 2) | 0, this.centerDecoTiles());
      let center = this.center();
      let xDir = 0;
      let yDir = 0;
      if (Random.Int$int(2) === 0) {
        if (Math.fround(center.x) < Math.fround(((this.left_ + this.right_) | 0) / 2)) {
          xDir = 1;
        } else if (Math.fround(center.x) > Math.fround(((this.left_ + this.right_) | 0) / 2)) {
          xDir = -1;
        } else {
          xDir = Random.Int$int(2) === 0 ? 1 : -1;
        }
      } else {
        if (Math.fround(center.y) < Math.fround(((this.top_ + this.bottom_) | 0) / 2)) {
          yDir = 1;
        } else if (Math.fround(center.y) > Math.fround(((this.top_ + this.bottom_) | 0) / 2)) {
          yDir = -1;
        } else {
          yDir = Random.Int$int(2) === 0 ? 1 : -1;
        }
      }
      Painter.set$Level$Point$int(level, center, Terrain.EMPTY_SP);
      this.placeCenterDetail(level, level.pointToCell(center));
      center.x = (center.x + xDir) | 0;
      center.y = (center.y + yDir) | 0;
      while (level.map_[level.pointToCell(center)] !== Terrain.WALL) {
        Painter.set$Level$Point$int(level, center, Terrain.EMPTY_SP);
        center.x = (center.x + xDir) | 0;
        center.y = (center.y + yDir) | 0;
      }
      Painter.set$Level$Point$int(level, center, Terrain.DOOR);
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
  centerDecoTiles(): number {
    return Terrain.REGION_DECO_ALT;
  }
  placeCenterDetail(level: Level, pos: number): void {
    level.drop(level.findPrizeItem$(), pos);
  }
}

$J.define(RingRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RingRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_RingRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
