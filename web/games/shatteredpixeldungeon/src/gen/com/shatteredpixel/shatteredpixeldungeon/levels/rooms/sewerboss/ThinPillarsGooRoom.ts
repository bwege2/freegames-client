// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/ThinPillarsGooRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Goo, Terrain, Painter, Room$Door$Type, PerimeterRoom;

export class ThinPillarsGooRoom extends GooBossRoom {
  _ThinPillarsGooRoom(): this {
    this._GooBossRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.WATER);
    let pillarW = ((this.width() === 14 ? 4 : 2) + this.width() % 2) | 0;
    let pillarH = ((this.height() === 14 ? 4 : 2) + this.height() % 2) | 0;
    if (this.height() < 12) {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + $J.idiv(((this.width() - pillarW) | 0), 2)) | 0, (this.top_ + 2) | 0, pillarW, 1, Terrain.WALL);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + $J.idiv(((this.width() - pillarW) | 0), 2)) | 0, (this.bottom_ - 2) | 0, pillarW, 1, Terrain.WALL);
    } else {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + $J.idiv(((this.width() - pillarW) | 0), 2)) | 0, (this.top_ + 3) | 0, pillarW, 1, Terrain.WALL);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + $J.idiv(((this.width() - pillarW) | 0), 2)) | 0, (this.bottom_ - 3) | 0, pillarW, 1, Terrain.WALL);
    }
    if (this.width() < 12) {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 2) | 0, (this.top_ + $J.idiv(((this.height() - pillarH) | 0), 2)) | 0, 1, pillarH, Terrain.WALL);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2) | 0, (this.top_ + $J.idiv(((this.height() - pillarH) | 0), 2)) | 0, 1, pillarH, Terrain.WALL);
    } else {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + $J.idiv(((this.height() - pillarH) | 0), 2)) | 0, 1, pillarH, Terrain.WALL);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 3) | 0, (this.top_ + $J.idiv(((this.height() - pillarH) | 0), 2)) | 0, 1, pillarH, Terrain.WALL);
    }
    PerimeterRoom.fillPerimiterPaths(level, this, Terrain.EMPTY_SP);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    this.setupGooNest(level);
    let boss = new Goo()._Goo();
    boss.pos = level.pointToCell(this.center());
    level.mobs.add(boss);
  }
}

$J.define(ThinPillarsGooRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.ThinPillarsGooRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.GooBossRoom', ctors: { '': '_ThinPillarsGooRoom' } });
$J.module(() => {
  Goo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Goo');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  PerimeterRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.PerimeterRoom');
});
