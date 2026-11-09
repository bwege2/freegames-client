// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CellBlockRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, EmptyRoom, Random;

export class CellBlockRoom extends StandardRoom {
  _CellBlockRoom(): this {
    this._StandardRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 3, 1];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 3, Terrain.WALL);
    let internal = new EmptyRoom()._EmptyRoom();
    internal.set$int$int$int$int((this.left_ + 3) | 0, (this.top_ + 3) | 0, (this.right_ - 3) | 0, (this.bottom_ - 3) | 0);
    let rows = $J.idiv(((internal.width() - 1) | 0), 3);
    let cols = $J.idiv(((internal.height() - 1) | 0), 3);
    if (internal.height() === 11) {
      cols--;
    }
    if (internal.width() === 11) {
      rows--;
    }
    let w = $J.idiv(((internal.width() - 2 - (rows - 1)) | 0), rows);
    let h = $J.idiv(((internal.height() - 2 - (cols - 1)) | 0), cols);
    let Wspacing = ((Math.imul(rows, w) + (rows + 1)) | 0) === internal.width() ? 1 : 2;
    let Hspacing = ((Math.imul(cols, h) + (cols + 1)) | 0) === internal.height() ? 1 : 2;
    let topBottomDoors = rows > cols || (rows === cols && Random.Int$int(2) === 0);
    if (rows === 1 || cols === 1) {
      topBottomDoors = !topBottomDoors;
    }
    if (rows === 1 && cols === 1) {
      topBottomDoors = null;
    }
    let openRooms = Math.imul(rows, cols);
    if (openRooms === 9) {
      openRooms--;
    }
    let guaranteeOpenRoom = this.isEntrance() || this.isExit();
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        if (rows === 3 && cols === 3 && x === 1 && y === 1) {
          continue;
        }
        let left = (internal.left_ + 1 + (Math.imul(x, ((w + Wspacing) | 0)))) | 0;
        let top = (internal.top_ + 1 + (Math.imul(y, ((h + Hspacing) | 0)))) | 0;
        if (Random.Int$int(Math.imul(w, h)) === 0 && (!guaranteeOpenRoom || openRooms > 1)) {
          Painter.fill$Level$int$int$int$int$int(level, left, top, w, h, Terrain.REGION_DECO);
          openRooms--;
        } else {
          Painter.fill$Level$int$int$int$int$int(level, left, top, w, h, Terrain.EMPTY_SP);
        }
        if (topBottomDoors == null) {
          switch (Random.Int$int(4)) {
            case 0:
              Painter.set$Level$int$int$int(level, internal.left_, (internal.top_ + $J.idiv(internal.height(), 2)) | 0, Terrain.DOOR);
              break;
            case 1:
              Painter.set$Level$int$int$int(level, (internal.left_ + $J.idiv(internal.width(), 2)) | 0, internal.top_, Terrain.DOOR);
              break;
            case 2:
              Painter.set$Level$int$int$int(level, internal.right_, (internal.top_ + $J.idiv(internal.height(), 2)) | 0, Terrain.DOOR);
              break;
            case 3:
              Painter.set$Level$int$int$int(level, (internal.left_ + $J.idiv(internal.width(), 2)) | 0, internal.bottom_, Terrain.DOOR);
              break;
          }
        } else if (topBottomDoors) {
          if (y === 0) {
            Painter.set$Level$int$int$int(level, (left + $J.idiv(w, 2)) | 0, (top - 1) | 0, Terrain.DOOR);
          } else if (y === ((cols - 1) | 0)) {
            Painter.set$Level$int$int$int(level, (left + $J.idiv(w, 2) - 1) | 0, (top + h) | 0, Terrain.DOOR);
          } else if (x === 0) {
            Painter.set$Level$int$int$int(level, (left - 1) | 0, (top + $J.idiv(h, 2) - 1) | 0, Terrain.DOOR);
          } else if (x === ((rows - 1) | 0)) {
            Painter.set$Level$int$int$int(level, (left + w) | 0, (top + $J.idiv(h, 2)) | 0, Terrain.DOOR);
          }
        } else if (!topBottomDoors) {
          if (x === 0) {
            Painter.set$Level$int$int$int(level, (left - 1) | 0, (top + $J.idiv(h, 2) - 1) | 0, Terrain.DOOR);
          } else if (x === ((rows - 1) | 0)) {
            Painter.set$Level$int$int$int(level, (left + w) | 0, (top + $J.idiv(h, 2)) | 0, Terrain.DOOR);
          } else if (y === 0) {
            Painter.set$Level$int$int$int(level, (left + $J.idiv(w, 2)) | 0, (top - 1) | 0, Terrain.DOOR);
          } else if (y === ((cols - 1) | 0)) {
            Painter.set$Level$int$int$int(level, (left + $J.idiv(w, 2) - 1) | 0, (top + h) | 0, Terrain.DOOR);
          }
        }
      }
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
}

$J.define(CellBlockRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CellBlockRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_CellBlockRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  EmptyRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.EmptyRoom');
  Random = $J.load('com.watabou.utils.Random');
});
