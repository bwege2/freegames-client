// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SkullsRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type;

export class SkullsRoom extends StandardRoom {
  _SkullsRoom(): this {
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
    return [0, 3, 1];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fillEllipse$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      if (door.x === this.left_ || door.x === this.right_) {
        Painter.drawInside(level, this, door, $J.idiv(this.width(), 2), Terrain.EMPTY);
      } else {
        Painter.drawInside(level, this, door, $J.idiv(this.height(), 2), Terrain.EMPTY);
      }
    }
    Painter.fillEllipse$Level$Rect$int$int(level, this, 4, Terrain.STATUE);
    Painter.fillEllipse$Level$Rect$int$int(level, this, 6, Terrain.WALL);
  }
}

$J.define(SkullsRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SkullsRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_SkullsRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
