// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CaveExitRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CaveRoom } from '../CaveRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, PathFinder;

export class CaveExitRoom extends CaveRoom {
  _CaveExitRoom(): this {
    this._CaveRoom();
    return this;
  }
  minHeight(): number {
    return Math.max(7, super.minHeight());
  }
  minWidth(): number {
    return Math.max(7, super.minWidth());
  }
  sizeCatProbs(): number[] {
    return [2, 1, 0];
  }
  isExit(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    let exit: number;
    let tries = 30;
    let valid: boolean;
    do {
      exit = level.pointToCell(this.random$int(2));
      if (tries-- > 0) {
        valid = level.map_[exit] !== Terrain.WALL && level.findMob(exit) == null;
      } else {
        valid = false;
        for (let i of PathFinder.NEIGHBOURS4) {
          if ((level.map_[(exit + i) | 0]) !== Terrain.WALL) {
            valid = true;
          }
        }
        valid = valid && level.findMob(exit) == null;
      }
    } while (!valid);
    Painter.set$Level$int$int(level, exit, Terrain.EXIT);
    for (let i of PathFinder.NEIGHBOURS8) {
      Painter.set$Level$int$int(level, (exit + i) | 0, Terrain.EMPTY);
    }
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, exit, LevelTransition$Type.REGULAR_EXIT));
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.pointToCell(p) !== l.exit();
  }
}

$J.define(CaveExitRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CaveExitRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CaveRoom', ctors: { '': '_CaveExitRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
