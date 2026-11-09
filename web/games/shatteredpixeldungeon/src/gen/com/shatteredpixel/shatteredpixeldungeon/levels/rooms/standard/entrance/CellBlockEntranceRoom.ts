// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/CellBlockEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CellBlockRoom } from '../CellBlockRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter, PathFinder;

export class CellBlockEntranceRoom extends CellBlockRoom {
  _CellBlockEntranceRoom(): this {
    this._CellBlockRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 1, 0];
  }
  isEntrance(): boolean {
    return true;
  }
  paint(level: Level): void {
    super.paint(level);
    while (true) {
      let p = this.random$int(3);
      if (level.map_[level.pointToCell(p)] === Terrain.EMPTY_SP) {
        let valid = true;
        for (let i of PathFinder.NEIGHBOURS8) {
          if ((level.map_[(level.pointToCell(p) + i) | 0]) === Terrain.DOOR) {
            valid = false;
          }
        }
        if (valid) {
          let entrance = level.pointToCell(p);
          Painter.set$Level$int$int(level, entrance, Terrain.ENTRANCE_SP);
          level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
          return;
        }
      }
    }
  }
}

$J.define(CellBlockEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.CellBlockEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CellBlockRoom', ctors: { '': '_CellBlockEntranceRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
