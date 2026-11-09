// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CircleWallEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { CircleWallRoom } from '../CircleWallRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, PathFinder, Random;

export class CircleWallEntranceRoom extends CircleWallRoom {
  _CircleWallEntranceRoom(): this {
    this._CircleWallRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 11);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 11);
  }
  sizeCatProbs(): number[] {
    return [0, 1, 0];
  }
  isEntrance(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    let p = this.center();
    let cell = level.pointToCell(p);
    for (let i of PathFinder.NEIGHBOURS8) {
      if ((level.map_[(cell + Math.imul(2, i)) | 0]) === Terrain.WALL) {
        Painter.set$Level$int$int(level, (cell + i) | 0, Terrain.EMPTY);
      }
    }
    Painter.set$Level$Point$int(level, p, Terrain.ENTRANCE);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, level.pointToCell(p), LevelTransition$Type.REGULAR_ENTRANCE));
    let xDir = 0;
    let yDir = 0;
    if (Random.Int$int(2) === 0) {
      xDir = Random.Int$int(2) === 0 ? 1 : -1;
    } else {
      yDir = Random.Int$int(2) === 0 ? 1 : -1;
    }
    p.x = (p.x + Math.imul(2, xDir)) | 0;
    p.y = (p.y + Math.imul(2, yDir)) | 0;
    while (level.map_[level.pointToCell(p)] === Terrain.WALL) {
      Painter.set$Level$Point$int(level, p, Terrain.EMPTY);
      p.x = (p.x + xDir) | 0;
      p.y = (p.y + yDir) | 0;
    }
  }
}

$J.define(CircleWallEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CircleWallEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CircleWallRoom', ctors: { '': '_CircleWallEntranceRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
