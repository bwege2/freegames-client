// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/BurnedRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PatchRoom } from './PatchRoom.ts';

let TrapMechanism, Terrain, Painter, Room$Door$Type, BurningTrap, Random;

export class BurnedRoom extends PatchRoom {
  _BurnedRoom(): this {
    this._PatchRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [4, 1, 0];
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    let cell = l.pointToCell(this.pointInside(p, 1));
    return l.map_[cell] === Terrain.EMPTY;
  }
  fill(): number {
    return Math.min(1, Math.fround(Math.fround(1.48) - Math.fround(((this.width() + this.height()) | 0) * Math.fround(0.03))));
  }
  clustering(): number {
    return 2;
  }
  ensurePath(): boolean {
    return false;
  }
  cleanEdges(): boolean {
    return false;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    this.setupPatch(level);
    let revealedChance = TrapMechanism.revealHiddenTrapChance$();
    let revealInc = 0;
    for (let i = (this.top_ + 1) | 0; i < this.bottom_; i++) {
      for (let j = (this.left_ + 1) | 0; j < this.right_; j++) {
        if (!this.patch[this.xyToPatchCoords(j, i)]) {
          continue;
        }
        let cell = (Math.imul(i, level.width()) + j) | 0;
        let t: number;
        {
          let trap: BurningTrap;
          switch (Random.Int$int(5)) {
            case 0:
            default:
              t = Terrain.EMPTY;
              break;
            case 1:
              t = Terrain.EMBERS;
              break;
            case 2:
              t = Terrain.TRAP;
              level.setTrap(new BurningTrap()._BurningTrap().reveal(), cell);
              break;
            case 3:
              revealInc = Math.fround(revealInc + revealedChance);
              if (revealInc >= Math.fround(1)) {
                t = Terrain.TRAP;
                level.setTrap(new BurningTrap()._BurningTrap().reveal(), cell);
                revealInc--;
              } else {
                t = Terrain.SECRET_TRAP;
                level.setTrap(new BurningTrap()._BurningTrap().hide(), cell);
              }
              break;
            case 4:
              t = Terrain.INACTIVE_TRAP;
              trap = new BurningTrap()._BurningTrap();
              trap.reveal().active = false;
              level.setTrap(trap, cell);
              break;
          }
        }
        level.map_[cell] = t;
      }
    }
  }
  canPlaceWater(p: Point): boolean {
    return !this.inside$Point(p) || !this.patch[this.xyToPatchCoords(p.x, p.y)];
  }
  canPlaceGrass(p: Point): boolean {
    return !this.inside$Point(p) || !this.patch[this.xyToPatchCoords(p.x, p.y)];
  }
  canPlaceTrap(p: Point): boolean {
    return !this.inside$Point(p) || !this.patch[this.xyToPatchCoords(p.x, p.y)];
  }
}

$J.define(BurnedRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.BurnedRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PatchRoom', ctors: { '': '_BurnedRoom' } });
$J.module(() => {
  TrapMechanism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrapMechanism');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  BurningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BurningTrap');
  Random = $J.load('com.watabou.utils.Random');
});
