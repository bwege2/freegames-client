// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/painters/CavesPainter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, BlacksmithRoom, StandardRoom, DungeonTileSheet, Random;

export class CavesPainter extends RegularPainter {
  _CavesPainter(): this {
    this._RegularPainter();
    return this;
  }
  decorate(level: Level, rooms: ArrayList<Room>): void {
    let w = level.width();
    let l = level.length();
    let map = level.map_;
    for (const $it0 = rooms.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      for (const $it1 = r.neigbours.iterator(); $it1.hasNext(); ) {
        let n = $it1.next();
        if (!r.connected_.containsKey(n)) {
          this.mergeRooms(level, r, n, null, Random.Int$int(3) === 0 ? Terrain.REGION_DECO : Terrain.CHASM);
        }
      }
    }
    for (const $it2 = rooms.iterator(); $it2.hasNext(); ) {
      let room = $it2.next();
      if (!(room instanceof StandardRoom) || room instanceof BlacksmithRoom) {
        continue;
      }
      if (room.width() <= 4 || room.height() <= 4) {
        continue;
      }
      let s = room.square();
      if (Random.Int$int(s) > 8) {
        let corner = (room.left_ + 1 + Math.imul(((room.top_ + 1) | 0), w)) | 0;
        if ((Terrain.flags[map[corner]] & Terrain.SOLID) === 0 && (map[(corner - 1) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner - 1) | 0)) && (map[(corner - w) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner - w) | 0)) && (map[(corner + 1) | 0]) !== Terrain.TRAP && (map[(corner + w) | 0]) !== Terrain.TRAP) {
          map[corner] = Terrain.WALL;
          level.traps.remove(corner);
        }
      }
      if (Random.Int$int(s) > 8) {
        let corner = (room.right_ - 1 + Math.imul(((room.top_ + 1) | 0), w)) | 0;
        if ((Terrain.flags[map[corner]] & Terrain.SOLID) === 0 && (map[(corner + 1) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner + 1) | 0)) && (map[(corner - w) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner - w) | 0)) && (map[(corner - 1) | 0]) !== Terrain.TRAP && (map[(corner + w) | 0]) !== Terrain.TRAP) {
          map[corner] = Terrain.WALL;
          level.traps.remove(corner);
        }
      }
      if (Random.Int$int(s) > 8) {
        let corner = (room.left_ + 1 + Math.imul(((room.bottom_ - 1) | 0), w)) | 0;
        if ((Terrain.flags[map[corner]] & Terrain.SOLID) === 0 && (map[(corner - 1) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner - 1) | 0)) && (map[(corner + w) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner + w) | 0)) && (map[(corner + 1) | 0]) !== Terrain.TRAP && (map[(corner - w) | 0]) !== Terrain.TRAP) {
          map[corner] = Terrain.WALL;
          level.traps.remove(corner);
        }
      }
      if (Random.Int$int(s) > 8) {
        let corner = (room.right_ - 1 + Math.imul(((room.bottom_ - 1) | 0), w)) | 0;
        if ((Terrain.flags[map[corner]] & Terrain.SOLID) === 0 && (map[(corner + 1) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner + 1) | 0)) && (map[(corner + w) | 0]) === Terrain.WALL && !room.connected_.containsValue(level.cellToPoint((corner + w) | 0)) && (map[(corner - 1) | 0]) !== Terrain.TRAP && (map[(corner - w) | 0]) !== Terrain.TRAP) {
          map[corner] = Terrain.WALL;
          level.traps.remove(corner);
        }
      }
    }
    for (let i = (w + 1) | 0; i < ((l - w) | 0); i++) {
      if (map[i] === Terrain.EMPTY) {
        let n = 0;
        if ((map[(i + 1) | 0]) === Terrain.WALL) {
          n++;
        }
        if ((map[(i - 1) | 0]) === Terrain.WALL) {
          n++;
        }
        if ((map[(i + w) | 0]) === Terrain.WALL) {
          n++;
        }
        if ((map[(i - w) | 0]) === Terrain.WALL) {
          n++;
        }
        if (Random.Int$int(6) <= n) {
          map[i] = Terrain.EMPTY_DECO;
        }
      }
    }
    this.generateGold(level, rooms);
  }
  generateGold(level: Level, rooms: ArrayList<Room>): void {
    let w = level.width();
    let l = level.length();
    let map = level.map_;
    for (let i = 0; i < ((l - w) | 0); i++) {
      if (map[i] === Terrain.WALL && DungeonTileSheet.floorTile(map[(i + w) | 0]) && Random.Int$int(4) === 0) {
        map[i] = Terrain.WALL_DECO;
      }
    }
  }
}

$J.define(CavesPainter, 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.CavesPainter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.painters.RegularPainter', ctors: { '': '_CavesPainter' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  BlacksmithRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.BlacksmithRoom');
  StandardRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  Random = $J.load('com.watabou.utils.Random');
});
