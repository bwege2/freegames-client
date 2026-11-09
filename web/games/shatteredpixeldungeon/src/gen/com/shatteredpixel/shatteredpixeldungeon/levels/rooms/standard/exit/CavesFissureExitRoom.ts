// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/CavesFissureExitRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CavesFissureRoom } from '../CavesFissureRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, PathFinder;

export class CavesFissureExitRoom extends CavesFissureRoom {
  _CavesFissureExitRoom(): this {
    this._CavesFissureRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [3, 1, 0];
  }
  isExit(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    let exit: number;
    do {
      exit = level.pointToCell(this.random$int(2));
    } while (level.map_[exit] === Terrain.CHASM || level.map_[exit] === Terrain.EMPTY_SP || level.findMob(exit) != null);
    for (let i of PathFinder.NEIGHBOURS4) {
      if ((level.map_[(exit + i) | 0]) === Terrain.CHASM) {
        Painter.set$Level$int$int(level, (exit + i) | 0, Terrain.EMPTY);
      }
    }
    Painter.set$Level$int$int(level, exit, Terrain.EXIT);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, exit, LevelTransition$Type.REGULAR_EXIT));
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.pointToCell(p) !== l.exit();
  }
}

$J.define(CavesFissureExitRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.CavesFissureExitRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CavesFissureRoom', ctors: { '': '_CavesFissureExitRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
