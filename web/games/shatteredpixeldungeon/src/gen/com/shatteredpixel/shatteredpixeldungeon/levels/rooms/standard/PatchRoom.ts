// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PatchRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { StandardRoom } from './StandardRoom.ts';

let Patch, BArray, PathFinder;

export class PatchRoom extends StandardRoom {
  patch: boolean[] = null;
  _PatchRoom(): this {
    this._StandardRoom();
    return this;
  }
  setupPatch(level: Level): void {
    let attempts = 0;
    if (this.ensurePath()) {
      let fill = this.fill();
      PathFinder.setMapSize((this.width() - 2) | 0, (this.height() - 2) | 0);
      let valid: boolean;
      do {
        this.patch = Patch.generate((this.width() - 2) | 0, (this.height() - 2) | 0, fill, this.clustering(), true);
        let startPoint = level.pointToCell(this.center());
        for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
          let door = $it0.next();
          if (door.x === this.left_) {
            startPoint = this.xyToPatchCoords((door.x + 1) | 0, door.y);
            this.patch[this.xyToPatchCoords((door.x + 1) | 0, door.y)] = false;
            this.patch[this.xyToPatchCoords((door.x + 2) | 0, door.y)] = false;
          } else if (door.x === this.right_) {
            startPoint = this.xyToPatchCoords((door.x - 1) | 0, door.y);
            this.patch[this.xyToPatchCoords((door.x - 1) | 0, door.y)] = false;
            this.patch[this.xyToPatchCoords((door.x - 2) | 0, door.y)] = false;
          } else if (door.y === this.top_) {
            startPoint = this.xyToPatchCoords(door.x, (door.y + 1) | 0);
            (this.patch[this.xyToPatchCoords(door.x, (door.y + 1) | 0)]) = false;
            (this.patch[this.xyToPatchCoords(door.x, (door.y + 2) | 0)]) = false;
          } else if (door.y === this.bottom_) {
            startPoint = this.xyToPatchCoords(door.x, (door.y - 1) | 0);
            (this.patch[this.xyToPatchCoords(door.x, (door.y - 1) | 0)]) = false;
            (this.patch[this.xyToPatchCoords(door.x, (door.y - 2) | 0)]) = false;
          }
        }
        PathFinder.buildDistanceMap$int$booleanArr(startPoint, BArray.not(this.patch, null));
        valid = true;
        for (let i = 0; i < this.patch.length; i++) {
          if (!this.patch[i] && PathFinder.distance[i] === 2147483647) {
            valid = false;
            break;
          }
        }
        attempts++;
        if (attempts > 100) {
          fill = Math.fround(fill - Math.fround(0.01));
          attempts = 0;
        }
      } while (!valid);
      PathFinder.setMapSize(level.width(), level.height());
    } else {
      this.patch = Patch.generate((this.width() - 2) | 0, (this.height() - 2) | 0, this.fill(), this.clustering(), true);
    }
    if (this.cleanEdges()) {
      this.cleanDiagonalEdges();
    }
  }
  fillPatch(level: Level, terrain: number): void {
    for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
      for (let j = (this.left_ + 1) | 0; j < this.right_; j++) {
        if (this.patch[this.xyToPatchCoords(j, i)]) {
          let cell = (Math.imul(i, level.width()) + j) | 0;
          level.map_[cell] = terrain;
        }
      }
    }
  }
  cleanDiagonalEdges(): void {
    if (this.patch == null) {
      return;
    }
    let pWidth = (this.width() - 2) | 0;
    for (let i = 0; i < ((this.patch.length - pWidth) | 0); i++) {
      if (!this.patch[i]) {
        continue;
      }
      if (i % pWidth !== 0) {
        if (this.patch[(i - 1 + pWidth) | 0] && !(this.patch[(i - 1) | 0] || this.patch[(i + pWidth) | 0])) {
          (this.patch[(i - 1 + pWidth) | 0]) = false;
        }
      }
      if (((i + 1) | 0) % pWidth !== 0) {
        if (this.patch[(i + 1 + pWidth) | 0] && !(this.patch[(i + 1) | 0] || this.patch[(i + pWidth) | 0])) {
          (this.patch[(i + 1 + pWidth) | 0]) = false;
        }
      }
    }
  }
  xyToPatchCoords(x: number, y: number): number {
    return (x - this.left_ - 1 + (Math.imul(((y - this.top_ - 1) | 0), ((this.width() - 2) | 0)))) | 0;
  }
}

$J.define(PatchRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PatchRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_PatchRoom' } });
$J.module(() => {
  Patch = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Patch');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
