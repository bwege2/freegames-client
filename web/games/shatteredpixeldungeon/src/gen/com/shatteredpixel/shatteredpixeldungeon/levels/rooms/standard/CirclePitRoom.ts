// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/CirclePitRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, StandardRoom$SizeCategory, Point, Random;

export class CirclePitRoom extends StandardRoom {
  _CirclePitRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(8, super.minWidth());
  }
  minHeight(): number {
    return Math.max(8, super.minHeight());
  }
  sizeCatProbs(): number[] {
    return [4, 2, 1];
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
    if (this.sizeCat !== StandardRoom$SizeCategory.NORMAL && (Random.Int$int((4 - this.sizeFactor()) | 0)) === 0) {
      while (true) {
        let center = this.center();
        center.x = (center.x + Random.IntRange(-1, 1)) | 0;
        center.y = (center.y + Random.IntRange(-1, 1)) | 0;
        let edge = new Point()._Point$Point(center);
        switch (Random.Int$int(4)) {
          case 0:
            edge.x = this.left_;
            break;
          case 1:
            edge.y = this.top_;
            break;
          case 2:
            edge.x = this.right_;
            break;
          case 3:
            edge.y = this.bottom_;
            break;
        }
        let valid = true;
        for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
          let door = $it1.next();
          if (door.equals(edge)) {
            valid = false;
          }
        }
        if (valid) {
          Painter.drawLine(level, edge, center, Terrain.REGION_DECO_ALT);
          Painter.drawInside(level, this, edge, 1, Terrain.EMPTY_SP);
          Painter.set$Level$Point$int(level, edge, Terrain.WALL);
        }
        break;
      }
    }
  }
}

$J.define(CirclePitRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CirclePitRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_CirclePitRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
