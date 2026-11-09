// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/connection/MazeConnectionRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ConnectionRoom } from './ConnectionRoom.ts';

let Terrain, Maze, Painter, Room$Door$Type;

export class MazeConnectionRoom extends ConnectionRoom {
  _MazeConnectionRoom(): this {
    this._ConnectionRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Maze.allowDiagonals = false;
    let maze = Maze.generate$Room(this);
    while (this.width() >= 5 && this.height() >= 5 && (this.width() <= 7 || this.height() <= 7) && maze[$J.idiv(this.width(), 2)][$J.idiv(this.height(), 2)] === Maze.EMPTY) {
      maze = Maze.generate$Room(this);
    }
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0].length; y++) {
        if (maze[x][y] === Maze.FILLED) {
          Painter.fill$Level$int$int$int$int$int(level, (x + this.left_) | 0, (y + this.top_) | 0, 1, 1, Terrain.WALL);
        }
      }
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.HIDDEN);
    }
  }
  maxConnections(direction: number): number {
    return 2;
  }
}

$J.define(MazeConnectionRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.MazeConnectionRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.connection.ConnectionRoom', ctors: { '': '_MazeConnectionRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Maze = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Maze');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
