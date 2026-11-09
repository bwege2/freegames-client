// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/CityPainter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Terrain, DungeonTileSheet, Random;

export class CityPainter extends RegularPainter {
  _CityPainter(): this {
    this._RegularPainter();
    return this;
  }
  decorate(level: Level, rooms: ArrayList<Room>): void {
    let map = level.map_;
    let w = level.width();
    let l = level.length();
    for (let i = 0; i < ((l - w) | 0); i++) {
      if (map[i] === Terrain.EMPTY && Random.Int$int(10) === 0) {
        map[i] = Terrain.EMPTY_DECO;
      } else if (map[i] === Terrain.WALL && !(DungeonTileSheet.wallStitcheable(map[(i + w) | 0])) && (Random.Int$int((21 - Dungeon.depth) | 0)) === 0) {
        map[i] = Terrain.WALL_DECO;
      }
    }
  }
}

$J.define(CityPainter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.CityPainter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.RegularPainter', ctors: { '': '_CityPainter' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  Random = $J.load('com.watabou.utils.Random');
});
