// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CircleBasinRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PatchRoom } from './PatchRoom.ts';

let Terrain, Painter, Room$Door$Type, Point;

export class CircleBasinRoom extends PatchRoom {
  _CircleBasinRoom(): this {
    this._PatchRoom();
    return this;
  }
  minWidth(): number {
    return (this.sizeCat.minDim + 1) | 0;
  }
  minHeight(): number {
    return (this.sizeCat.minDim + 1) | 0;
  }
  sizeCatProbs(): number[] {
    return [0, 3, 1];
  }
  resize(w: number, h: number): Rect {
    super.resize(w, h);
    if (this.width() % 2 === 0) {
      this.right_--;
    }
    if (this.height() % 2 === 0) {
      this.bottom_--;
    }
    return this;
  }
  fill(): number {
    return 0.5;
  }
  clustering(): number {
    return 5;
  }
  ensurePath(): boolean {
    return false;
  }
  cleanEdges(): boolean {
    return false;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fillEllipse$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      if (door.x === this.left_ || door.x === this.right_) {
        Painter.drawInside(level, this, door, $J.idiv(this.width(), 2), Terrain.EMPTY);
      } else {
        Painter.drawInside(level, this, door, $J.idiv(this.height(), 2), Terrain.EMPTY);
      }
    }
    Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.CHASM);
    let start = new Point()._Point$int$int((this.left_ + $J.idiv(this.width(), 2)) | 0, (this.top_ + 3) | 0);
    let end = new Point()._Point$int$int((this.left_ + $J.idiv(this.width(), 2)) | 0, (this.bottom_ - 3) | 0);
    Painter.drawLine(level, start, end, Terrain.EMPTY_SP);
    start.set$int$int((this.left_ + 3) | 0, (this.top_ + $J.idiv(this.height(), 2)) | 0);
    end.set$int$int((this.right_ - 3) | 0, (this.top_ + $J.idiv(this.height(), 2)) | 0);
    Painter.drawLine(level, start, end, Terrain.EMPTY_SP);
    if (this.width() > 11 || this.height() > 11) {
      let center = this.center();
      Painter.fill$Level$int$int$int$int$int(level, (center.x - 1) | 0, (center.y - 1) | 0, 3, 3, Terrain.EMPTY_SP);
      Painter.set$Level$Point$int(level, center, Terrain.WALL);
    }
    this.setupPatch(level);
    for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
      for (let j = (this.left_ + 1) | 0; j < this.right_; j++) {
        let cell = (Math.imul(i, level.width()) + j) | 0;
        if (level.map_[cell] === Terrain.EMPTY && this.patch[this.xyToPatchCoords(j, i)]) {
          level.map_[cell] = Terrain.WATER;
          if ((level.map_[(cell - level.width()) | 0]) === Terrain.WALL) {
            (level.map_[(cell - level.width()) | 0]) = Terrain.WALL_DECO;
          }
        }
      }
    }
  }
}

$J.define(CircleBasinRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CircleBasinRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PatchRoom', ctors: { '': '_CircleBasinRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
});
