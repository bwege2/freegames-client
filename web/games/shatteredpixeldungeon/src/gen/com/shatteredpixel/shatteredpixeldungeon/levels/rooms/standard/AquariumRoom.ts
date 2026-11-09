// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/AquariumRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Piranha, Terrain, Painter, Room$Door$Type;

export class AquariumRoom extends StandardRoom {
  _AquariumRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 7);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 7);
  }
  sizeCatProbs(): number[] {
    return [3, 1, 0];
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return super.canPlaceItem(p, l) && l.map_[l.pointToCell(p)] !== Terrain.WATER;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.map_[l.pointToCell(p)] !== Terrain.WATER;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY_SP);
    Painter.fill$Level$Rect$int$int(level, this, 3, Terrain.WATER);
    let minDim = Math.min(this.width(), this.height());
    let numFish = $J.idiv(((minDim - 4) | 0), 3);
    for (let i = 0; i < numFish; i++) {
      let piranha = Piranha.random();
      do {
        piranha.pos = level.pointToCell(this.random$int(3));
      } while (level.map_[piranha.pos] !== Terrain.WATER || level.findMob(piranha.pos) != null);
      level.mobs.add(piranha);
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
}

$J.define(AquariumRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.AquariumRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_AquariumRoom' } });
$J.module(() => {
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
