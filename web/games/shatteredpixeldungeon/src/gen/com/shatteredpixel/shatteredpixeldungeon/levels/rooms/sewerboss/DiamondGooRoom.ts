// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/DiamondGooRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { GooBossRoom } from './GooBossRoom.ts';

let Goo, Terrain, Painter, Room$Door$Type, Point;

export class DiamondGooRoom extends GooBossRoom {
  _DiamondGooRoom(): this {
    this._GooBossRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fillDiamond$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      let dir: Point;
      if (door.x === this.left_) {
        dir = new Point()._Point$int$int(1, 0);
      } else if (door.y === this.top_) {
        dir = new Point()._Point$int$int(0, 1);
      } else if (door.x === this.right_) {
        dir = new Point()._Point$int$int(-1, 0);
      } else {
        dir = new Point()._Point$int$int(0, -1);
      }
      let curr = new Point()._Point$Point(door);
      do {
        Painter.set$Level$Point$int(level, curr, Terrain.EMPTY_SP);
        curr.x = (curr.x + dir.x) | 0;
        curr.y = (curr.y + dir.y) | 0;
      } while (level.map_[level.pointToCell(curr)] === Terrain.WALL);
    }
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + $J.idiv(this.width(), 2) - 1) | 0, (this.top_ + $J.idiv(this.height(), 2) - 2) | 0, (2 + this.width() % 2) | 0, (4 + this.height() % 2) | 0, Terrain.WATER);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + $J.idiv(this.width(), 2) - 2) | 0, (this.top_ + $J.idiv(this.height(), 2) - 1) | 0, (4 + this.width() % 2) | 0, (2 + this.height() % 2) | 0, Terrain.WATER);
    this.setupGooNest(level);
    let boss = new Goo()._Goo();
    boss.pos = level.pointToCell(this.center());
    level.mobs.add(boss);
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
}

$J.define(DiamondGooRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.DiamondGooRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.GooBossRoom', ctors: { '': '_DiamondGooRoom' } });
$J.module(() => {
  Goo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Goo');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
});
