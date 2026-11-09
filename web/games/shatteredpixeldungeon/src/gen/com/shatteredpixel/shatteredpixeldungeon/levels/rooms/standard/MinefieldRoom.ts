// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/MinefieldRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let TrapMechanism, Terrain, Painter, Room$Door$Type, StandardRoom$SizeCategory, ExplosiveTrap, PathFinder, Random;

export class MinefieldRoom extends StandardRoom {
  _MinefieldRoom(): this {
    this._StandardRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [4, 1, 0];
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    let cell = l.pointToCell(this.pointInside(p, 1));
    return l.map_[cell] === Terrain.EMPTY;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let mines = $J.l2i($J.lround(Math.sqrt(this.square())));
    switch (this.sizeCat) {
      case StandardRoom$SizeCategory.NORMAL:
        mines = (mines - 3) | 0;
        break;
      case StandardRoom$SizeCategory.LARGE:
        mines = (mines + 3) | 0;
        break;
      case StandardRoom$SizeCategory.GIANT:
        mines = (mines + 9) | 0;
        break;
    }
    let revealedChance = TrapMechanism.revealHiddenTrapChance$();
    let revealInc = 0;
    for (let i = 0; i < mines; i++) {
      let pos: number;
      do {
        pos = level.pointToCell(this.random$int(1));
      } while (level.traps.get(pos) != null);
      for (let j = 0; j < 8; j++) {
        let c = PathFinder.NEIGHBOURS8[Random.Int$int(8)];
        if (level.traps.get((pos + c) | 0) == null && (level.map_[(pos + c) | 0]) === Terrain.EMPTY) {
          Painter.set$Level$int$int(level, (pos + c) | 0, Terrain.EMBERS);
        }
      }
      revealInc = Math.fround(revealInc + revealedChance);
      if (revealInc >= Math.fround(1)) {
        Painter.set$Level$int$int(level, pos, Terrain.TRAP);
        level.setTrap(new ExplosiveTrap()._ExplosiveTrap().reveal(), pos);
        revealInc--;
      } else {
        Painter.set$Level$int$int(level, pos, Terrain.SECRET_TRAP);
        level.setTrap(new ExplosiveTrap()._ExplosiveTrap().hide(), pos);
      }
    }
  }
}

$J.define(MinefieldRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.MinefieldRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_MinefieldRoom' } });
$J.module(() => {
  TrapMechanism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrapMechanism');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  ExplosiveTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ExplosiveTrap');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
