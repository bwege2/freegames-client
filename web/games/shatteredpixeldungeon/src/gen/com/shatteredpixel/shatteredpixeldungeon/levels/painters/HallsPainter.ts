// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/HallsPainter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { RegularPainter } from './RegularPainter.ts';

let Terrain, PathFinder, Random;

export class HallsPainter extends RegularPainter {
  _HallsPainter(): this {
    this._RegularPainter();
    return this;
  }
  decorate(level: Level, rooms: ArrayList<Room>): void {
    let map = level.map_;
    let w = level.width();
    let l = level.length();
    for (let i = (w + 1) | 0; i < ((l - w - 1) | 0); i++) {
      if (map[i] === Terrain.EMPTY) {
        let count = 0;
        for (let j = 0; j < PathFinder.NEIGHBOURS8.length; j++) {
          if (((Terrain.flags[map[(i + PathFinder.NEIGHBOURS8[j]) | 0]]) & Terrain.PASSABLE) > 0) {
            count++;
          }
        }
        if (Random.Int$int(80) < count) {
          map[i] = Terrain.EMPTY_DECO;
        }
      } else if (map[i] === Terrain.WALL && (map[(i - 1) | 0]) !== Terrain.WALL_DECO && (map[(i - w) | 0]) !== Terrain.WALL_DECO && Random.Int$int(20) === 0) {
        map[i] = Terrain.WALL_DECO;
      } else if (map[i] === Terrain.REGION_DECO && Random.Int$int(2) === 0) {
        map[i] = Terrain.REGION_DECO_ALT;
      }
    }
    for (const $it0 = rooms.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      for (const $it1 = r.neigbours.iterator(); $it1.hasNext(); ) {
        let n = $it1.next();
        if (!r.connected_.containsKey(n)) {
          this.mergeRooms(level, r, n, null, Random.Int$int(3) === 0 ? Terrain.REGION_DECO : Terrain.CHASM);
        }
      }
    }
  }
}

$J.define(HallsPainter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.HallsPainter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.RegularPainter', ctors: { '': '_HallsPainter' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
