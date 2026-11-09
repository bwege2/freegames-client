// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/FissureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class FissureRoom extends StandardRoom {
  _FissureRoom(): this {
    this._StandardRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [6, 3, 1];
  }
  minHeight(): number {
    return Math.max(5, super.minHeight());
  }
  minWidth(): number {
    return Math.max(5, super.minWidth());
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    if (this.square() <= 25) {
      let p = this.center();
      Painter.set$Level$int$int$int(level, p.x, p.y, Terrain.CHASM);
    } else {
      let smallestDim = Math.min(this.width(), this.height());
      let floorW = $J.d2i(Math.sqrt(smallestDim));
      let edgeFloorChance = Math.fround(Math.fround(Math.sqrt(smallestDim)) % 1);
      edgeFloorChance = Math.fround((Math.fround(edgeFloorChance + Math.fround(((floorW - 1) | 0) * 0.5))) / Math.fround(floorW));
      for (let i = (this.top_ + 2) | 0; i <= ((this.bottom_ - 2) | 0); i++) {
        for (let j = (this.left_ + 2) | 0; j <= ((this.right_ - 2) | 0); j++) {
          let v = Math.min((i - this.top_) | 0, (this.bottom_ - i) | 0);
          let h = Math.min((j - this.left_) | 0, (this.right_ - j) | 0);
          if (Math.min(v, h) > floorW || (Math.min(v, h) === floorW && Random.Float$() > edgeFloorChance)) {
            Painter.set$Level$int$int$int(level, j, i, Terrain.CHASM);
          }
        }
      }
    }
  }
}

$J.define(FissureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.FissureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_FissureRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
