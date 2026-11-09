// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/sewerboss/SewerBossEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { EntranceRoom } from '../standard/entrance/EntranceRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, Room$Door$Type;

export class SewerBossEntranceRoom extends EntranceRoom {
  _SewerBossEntranceRoom(): this {
    this._EntranceRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 7);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 7);
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, 1, Terrain.WALL_DECO);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 2) | 0, (this.width() - 2) | 0, 1, Terrain.WATER);
    let entrance: number;
    do {
      entrance = level.pointToCell(this.random$int(3));
    } while (level.findMob(entrance) != null);
    Painter.set$Level$int$int(level, entrance, Terrain.ENTRANCE);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      if (door.y === this.top_ || door.y === ((this.top_ + 1) | 0)) {
        Painter.drawInside(level, this, door, 1, Terrain.WATER);
      }
    }
  }
}

$J.define(SewerBossEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.EntranceRoom', ctors: { '': '_SewerBossEntranceRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
