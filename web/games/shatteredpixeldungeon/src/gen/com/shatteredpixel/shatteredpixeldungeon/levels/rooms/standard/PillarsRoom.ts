// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/PillarsRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class PillarsRoom extends StandardRoom {
  _PillarsRoom(): this {
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
    return [9, 3, 1];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let minDim = Math.min(this.width(), this.height());
    if (minDim === 7 || (this.sizeCat === StandardRoom$SizeCategory.NORMAL && Random.Int$int(2) === 0)) {
      let pillarInset = minDim >= 11 ? 2 : 1;
      let pillarSize = (($J.idiv(((minDim - 3) | 0), 2)) - pillarInset) | 0;
      let pillarX: number;
      let pillarY: number;
      if (Random.Int$int(2) === 0) {
        pillarX = Random.IntRange((this.left_ + 1 + pillarInset) | 0, (this.right_ - pillarSize - pillarInset) | 0);
        pillarY = (this.top_ + 1 + pillarInset) | 0;
      } else {
        pillarX = (this.left_ + 1 + pillarInset) | 0;
        pillarY = Random.IntRange((this.top_ + 1 + pillarInset) | 0, (this.bottom_ - pillarSize - pillarInset) | 0);
      }
      Painter.fill$Level$int$int$int$int$int(level, pillarX, pillarY, pillarSize, pillarSize, Terrain.WALL);
      pillarX = (this.right_ - (pillarX - this.left_ + pillarSize - 1)) | 0;
      pillarY = (this.bottom_ - (pillarY - this.top_ + pillarSize - 1)) | 0;
      Painter.fill$Level$int$int$int$int$int(level, pillarX, pillarY, pillarSize, pillarSize, Terrain.WALL);
    } else {
      let pillarInset = minDim >= 12 ? 2 : 1;
      let pillarSize = $J.idiv(((minDim - 6) | 0), ((pillarInset + 1) | 0));
      let xSpaces = Math.fround((this.width() - Math.imul(2, pillarInset) - pillarSize - 2) | 0);
      let ySpaces = Math.fround((this.height() - Math.imul(2, pillarInset) - pillarSize - 2) | 0);
      let minSpaces = Math.min(xSpaces, ySpaces);
      let percentSkew = Math.fround($J.roundf(Math.fround(Random.Float$() * minSpaces)) / minSpaces);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1 + pillarInset + $J.roundf(Math.fround(percentSkew * xSpaces))) | 0, (this.top_ + 1 + pillarInset) | 0, pillarSize, pillarSize, Terrain.WALL);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - pillarSize - pillarInset) | 0, (this.top_ + 1 + pillarInset + $J.roundf(Math.fround(percentSkew * ySpaces))) | 0, pillarSize, pillarSize, Terrain.WALL);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - pillarSize - pillarInset - $J.roundf(Math.fround(percentSkew * xSpaces))) | 0, (this.bottom_ - pillarSize - pillarInset) | 0, pillarSize, pillarSize, Terrain.WALL);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1 + pillarInset) | 0, (this.bottom_ - pillarSize - pillarInset - $J.roundf(Math.fround(percentSkew * ySpaces))) | 0, pillarSize, pillarSize, Terrain.WALL);
    }
  }
}

$J.define(PillarsRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PillarsRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_PillarsRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  Random = $J.load('com.watabou.utils.Random');
});
