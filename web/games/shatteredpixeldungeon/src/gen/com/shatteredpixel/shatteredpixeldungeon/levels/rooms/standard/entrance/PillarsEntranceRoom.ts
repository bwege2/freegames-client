// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/PillarsEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PillarsRoom } from '../PillarsRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, PathFinder;

export class PillarsEntranceRoom extends PillarsRoom {
  _PillarsEntranceRoom(): this {
    this._PillarsRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [3, 1, 0];
  }
  isEntrance(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    let entrance: number;
    let valid: boolean;
    do {
      entrance = level.pointToCell(this.random$int(2));
      valid = true;
      for (let i of PathFinder.NEIGHBOURS4) {
        if (i === -level.width()) {
          continue;
        }
        if ((level.map_[(entrance + i) | 0]) === Terrain.WALL) {
          valid = false;
        }
      }
    } while (level.findMob(entrance) != null || level.map_[entrance] === Terrain.WALL || !valid);
    Painter.set$Level$int$int(level, entrance, Terrain.ENTRANCE);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
  }
}

$J.define(PillarsEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.PillarsEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PillarsRoom', ctors: { '': '_PillarsEntranceRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
