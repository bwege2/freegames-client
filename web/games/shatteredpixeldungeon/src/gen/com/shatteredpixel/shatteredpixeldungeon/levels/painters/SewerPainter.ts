// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/SewerPainter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Random;

export class SewerPainter extends RegularPainter {
  _SewerPainter(): this {
    this._RegularPainter();
    return this;
  }
  decorate(level: Level, rooms: ArrayList<Room>): void {
    let map = level.map_;
    let w = level.width();
    let l = level.length();
    for (let i = 0; i < w; i++) {
      if (map[i] === Terrain.WALL && (map[(i + w) | 0]) === Terrain.WATER && Random.Int$int(4) === 0) {
        map[i] = Terrain.WALL_DECO;
      }
    }
    for (let i = w; i < ((l - w) | 0); i++) {
      if (map[i] === Terrain.WALL && (map[(i - w) | 0]) === Terrain.WALL && (map[(i + w) | 0]) === Terrain.WATER && Random.Int$int(2) === 0) {
        map[i] = Terrain.WALL_DECO;
      }
    }
    for (let i = (w + 1) | 0; i < ((l - w - 1) | 0); i++) {
      if (map[i] === Terrain.EMPTY) {
        let count = (((map[(i + 1) | 0]) === Terrain.WALL ? 1 : 0) + ((map[(i - 1) | 0]) === Terrain.WALL ? 1 : 0) + ((map[(i + w) | 0]) === Terrain.WALL ? 1 : 0) + ((map[(i - w) | 0]) === Terrain.WALL ? 1 : 0)) | 0;
        if (Random.Int$int(16) < Math.imul(count, count)) {
          map[i] = Terrain.EMPTY_DECO;
        }
      }
    }
  }
}

$J.define(SewerPainter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.SewerPainter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.RegularPainter', ctors: { '': '_SewerPainter' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Random = $J.load('com.watabou.utils.Random');
});
