// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretMazeRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SecretRoom } from './SecretRoom.ts';

let Dungeon, Generator, Heap$Type, Terrain, Maze, Painter, Room$Door$Type, PathFinder, Point, Random;

export class SecretMazeRoom extends SecretRoom {
  _SecretMazeRoom(): this {
    this._SecretRoom();
    return this;
  }
  minWidth(): number {
    return 14;
  }
  minHeight(): number {
    return 14;
  }
  maxWidth(): number {
    return 18;
  }
  maxHeight(): number {
    return 18;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Maze.allowDiagonals = false;
    let maze = Maze.generate$Room(this);
    let passable = $J.newArray(Math.imul(this.width(), this.height()), false);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze[0].length; y++) {
        if (maze[x][y] === Maze.FILLED) {
          Painter.fill$Level$int$int$int$int$int(level, (x + this.left_) | 0, (y + this.top_) | 0, 1, 1, Terrain.WALL);
        }
        (passable[(x + Math.imul(this.width(), y)) | 0]) = maze[x][y] === Maze.EMPTY;
      }
    }
    PathFinder.setMapSize(this.width(), this.height());
    let entrance = this.entrance();
    let entrancePos = (entrance.x - this.left_ + Math.imul(this.width(), ((entrance.y - this.top_) | 0))) | 0;
    PathFinder.buildDistanceMap$int$booleanArr(entrancePos, passable);
    let bestDist = 0;
    let bestDistP = new Point()._Point$();
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] !== 2147483647 && PathFinder.distance[i] > bestDist) {
        bestDist = PathFinder.distance[i];
        bestDistP.x = ((i % this.width()) + this.left_) | 0;
        bestDistP.y = (($J.idiv(i, this.width())) + this.top_) | 0;
      }
    }
    let prize: Item;
    if (Random.Int$int(2) === 0) {
      prize = Generator.randomWeapon$int$boolean((($J.idiv(Dungeon.depth, 5)) + 1) | 0, true);
      if ((prize).hasCurseEnchant()) {
        (prize).enchant$Enchantment(null);
      }
    } else {
      prize = Generator.randomArmor$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
      if ((prize).hasCurseGlyph()) {
        (prize).inscribe$Glyph(null);
      }
    }
    prize.cursed = false;
    prize.cursedKnown = true;
    if (Random.Int$int(3) === 0) {
      prize.upgrade$();
    }
    level.drop(prize, level.pointToCell(bestDistP)).type_ = Heap$Type.CHEST;
    PathFinder.setMapSize(level.width(), level.height());
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
}

$J.define(SecretMazeRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretMazeRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretMazeRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Maze = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Maze');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
