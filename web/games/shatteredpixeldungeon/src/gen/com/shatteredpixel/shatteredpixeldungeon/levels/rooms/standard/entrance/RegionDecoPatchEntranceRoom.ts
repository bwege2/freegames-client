// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/entrance/RegionDecoPatchEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { RegionDecoPatchRoom } from '../RegionDecoPatchRoom.ts';

let Dungeon, Terrain, LevelTransition, LevelTransition$Type, Painter, EntranceRoom, PathFinder;

export class RegionDecoPatchEntranceRoom extends RegionDecoPatchRoom {
  _RegionDecoPatchEntranceRoom(): this {
    this._RegionDecoPatchRoom();
    return this;
  }
  minHeight(): number {
    return Math.max(7, super.minHeight());
  }
  minWidth(): number {
    return Math.max(7, super.minWidth());
  }
  isEntrance(): boolean {
    return true;
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    if (Dungeon.depth <= 2) {
      return false;
    } else {
      return super.canMerge(l, other, p, mergeTerrain);
    }
  }
  canPlaceTrap(p: Point): boolean {
    if (Dungeon.depth === 1) {
      return false;
    } else {
      return super.canPlaceTrap(p);
    }
  }
  paint(level: Level): void {
    super.paint(level);
    let entrance: number;
    let tries = 30;
    let valid: boolean;
    do {
      entrance = level.pointToCell(this.random$int(2));
      if (tries-- > 0) {
        valid = level.map_[entrance] !== Terrain.REGION_DECO && level.findMob(entrance) == null;
      } else {
        valid = false;
        for (let i of PathFinder.NEIGHBOURS4) {
          if ((level.map_[(entrance + i) | 0]) !== Terrain.REGION_DECO) {
            valid = true;
          }
        }
        valid = valid && level.findMob(entrance) == null;
      }
    } while (!valid);
    Painter.set$Level$int$int(level, entrance, Terrain.ENTRANCE);
    for (let i of PathFinder.NEIGHBOURS8) {
      Painter.set$Level$int$int(level, (entrance + i) | 0, Terrain.EMPTY);
    }
    if (Dungeon.depth === 1) {
      level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.SURFACE));
    } else {
      level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
    }
    EntranceRoom.placeEarlyGuidePages(level, this);
  }
}

$J.define(RegionDecoPatchEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.RegionDecoPatchEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RegionDecoPatchRoom', ctors: { '': '_RegionDecoPatchEntranceRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  EntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.EntranceRoom');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
