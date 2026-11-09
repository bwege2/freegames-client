// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/StudyRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Generator, Generator$Category, Terrain, Painter, Room$Door$Type, StandardRoom$SizeCategory, Random;

export class StudyRoom extends StandardRoom {
  _StudyRoom(): this {
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
    return [2, 1, 0];
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.BOOKSHELF);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY_SP);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      Painter.drawInside(level, this, door, 2, Terrain.EMPTY_SP);
      door.set$Type(Room$Door$Type.REGULAR);
    }
    if (this.sizeCat === StandardRoom$SizeCategory.LARGE) {
      let pillarW = $J.idiv(((this.width() - 7) | 0), 2);
      let pillarH = $J.idiv(((this.height() - 7) | 0), 2);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 3) | 0, pillarW, 1, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 3) | 0, 1, pillarH, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.bottom_ - 2 - 1) | 0, pillarW, 1, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.bottom_ - 2 - pillarH) | 0, 1, pillarH, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2 - pillarW) | 0, (this.top_ + 3) | 0, pillarW, 1, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2 - 1) | 0, (this.top_ + 3) | 0, 1, pillarH, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2 - pillarW) | 0, (this.bottom_ - 2 - 1) | 0, pillarW, 1, Terrain.BOOKSHELF);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2 - 1) | 0, (this.bottom_ - 2 - pillarH) | 0, 1, pillarH, Terrain.BOOKSHELF);
    }
    let center = this.center();
    Painter.set$Level$Point$int(level, center, Terrain.PEDESTAL);
    let prize = (Random.Int$int(2) === 0) ? level.findPrizeItem$() : null;
    if (prize != null) {
      level.drop(prize, ((center.x + Math.imul(center.y, level.width())) | 0));
    } else {
      level.drop(Generator.random$Category(Random.oneOf([Generator$Category.POTION, Generator$Category.SCROLL])), ((center.x + Math.imul(center.y, level.width())) | 0));
    }
  }
}

$J.define(StudyRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StudyRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_StudyRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  StandardRoom$SizeCategory = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom$SizeCategory');
  Random = $J.load('com.watabou.utils.Random');
});
