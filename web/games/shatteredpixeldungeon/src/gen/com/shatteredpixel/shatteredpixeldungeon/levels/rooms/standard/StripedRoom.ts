// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StripedRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type, StandardRoom$SizeCategory, Random;

export class StripedRoom extends StandardRoom {
  _StripedRoom(): this {
    this._StandardRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [2, 1, 0];
  }
  merge(l: Level, other: Room, merge: Rect, mergeTerrain: number): void {
    if (other instanceof StripedRoom && mergeTerrain === Terrain.EMPTY) {
      super.merge(l, other, merge, Terrain.EMPTY_SP);
    } else {
      super.merge(l, other, merge, mergeTerrain);
    }
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    if (this.sizeCat === StandardRoom$SizeCategory.NORMAL) {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
      if (this.width() > this.height() || (this.width() === this.height() && Random.Int$int(2) === 0)) {
        for (let i = (this.left_ + 2) | 0; i < this.right_; i = (i + 2) | 0) {
          Painter.fill$Level$int$int$int$int$int(level, i, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.HIGH_GRASS);
        }
      } else {
        for (let i = (this.top_ + 2) | 0; i < this.bottom_; i = (i + 2) | 0) {
          Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, i, (this.width() - 2) | 0, 1, Terrain.HIGH_GRASS);
        }
      }
    } else if (this.sizeCat === StandardRoom$SizeCategory.LARGE) {
      let layers = $J.idiv(((Math.min(this.width(), this.height()) - 1) | 0), 2);
      for (let i = 1; i <= layers; i++) {
        Painter.fill$Level$Rect$int$int(level, this, i, (i % 2 === 1) ? Terrain.EMPTY_SP : Terrain.HIGH_GRASS);
      }
    }
  }
}

$J.define(StripedRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StripedRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_StripedRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  Random = $J.load('com.watabou.utils.Random');
});
