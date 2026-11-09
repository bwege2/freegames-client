// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/PrisonPainter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, SpecialRoom, ChasmBridgeRoom, FissureRoom, Random;

export class PrisonPainter extends RegularPainter {
  _PrisonPainter(): this {
    this._RegularPainter();
    return this;
  }
  decorate(level: Level, rooms: ArrayList<Room>): void {
    let w = level.width();
    let l = level.length();
    let map = level.map_;
    for (let i = (w + 1) | 0; i < ((l - w - 1) | 0); i++) {
      if (map[i] === Terrain.EMPTY) {
        let c = Math.fround(0.05);
        if ((map[(i + 1) | 0]) === Terrain.WALL && (map[(i + w) | 0]) === Terrain.WALL) {
          c = Math.fround(c + Math.fround(0.2));
        }
        if ((map[(i - 1) | 0]) === Terrain.WALL && (map[(i + w) | 0]) === Terrain.WALL) {
          c = Math.fround(c + Math.fround(0.2));
        }
        if ((map[(i + 1) | 0]) === Terrain.WALL && (map[(i - w) | 0]) === Terrain.WALL) {
          c = Math.fround(c + Math.fround(0.2));
        }
        if ((map[(i - 1) | 0]) === Terrain.WALL && (map[(i - w) | 0]) === Terrain.WALL) {
          c = Math.fround(c + Math.fround(0.2));
        }
        if (Random.Float$() < c) {
          map[i] = Terrain.EMPTY_DECO;
        }
      }
    }
    for (const $it0 = rooms.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      if (r instanceof SpecialRoom) {
        continue;
      }
      let chance = 15;
      if (r instanceof FissureRoom) {
        chance = 3;
      } else if (r instanceof ChasmBridgeRoom) {
        chance = 5;
      }
      let cell: number;
      for (let y = (r.bottom_ - 1) | 0; y > r.top_; y--) {
        cell = (r.left_ + 1 + Math.imul(level.width(), y)) | 0;
        for (let x = (r.left_ + 1) | 0; x < r.right_; x++) {
          if (level.map_[cell] === Terrain.CHASM && (level.map_[(cell - level.width()) | 0]) === Terrain.CHASM) {
            if (Random.Int$int(chance) === 0) {
              level.map_[cell] = Terrain.REGION_DECO_ALT;
            }
          }
          cell++;
        }
      }
    }
    for (let i = 0; i < w; i++) {
      if (map[i] === Terrain.WALL && ((map[(i + w) | 0]) === Terrain.EMPTY || (map[(i + w) | 0]) === Terrain.EMPTY_SP) && Random.Int$int(6) === 0) {
        map[i] = Terrain.WALL_DECO;
      }
    }
    for (let i = w; i < ((l - w) | 0); i++) {
      if (map[i] === Terrain.WALL && (map[(i - w) | 0]) === Terrain.WALL && ((map[(i + w) | 0]) === Terrain.EMPTY || (map[(i + w) | 0]) === Terrain.EMPTY_SP) && Random.Int$int(3) === 0) {
        map[i] = Terrain.WALL_DECO;
      }
    }
  }
}

$J.define(PrisonPainter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.PrisonPainter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.RegularPainter', ctors: { '': '_PrisonPainter' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  SpecialRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom');
  ChasmBridgeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.ChasmBridgeRoom');
  FissureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.FissureRoom');
  Random = $J.load('com.watabou.utils.Random');
});
