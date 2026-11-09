// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/GrassyGraveRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Generator, Gold, Heap$Type, Terrain, Painter, Room$Door$Type, PlantsRoom, Random;

export class GrassyGraveRoom extends StandardRoom {
  _GrassyGraveRoom(): this {
    this._StandardRoom();
    return this;
  }
  merge(l: Level, other: Room, merge: Rect, mergeTerrain: number): void {
    if (mergeTerrain === Terrain.EMPTY && (other instanceof GrassyGraveRoom || other instanceof PlantsRoom)) {
      super.merge(l, other, merge, Terrain.GRASS);
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
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.GRASS);
    let w = (this.width() - 2) | 0;
    let h = (this.height() - 2) | 0;
    let nGraves = $J.idiv(Math.max(w, h), 2);
    let index = Random.Int$int(nGraves);
    let shift = Random.Int$int(2);
    for (let i = 0; i < nGraves; i++) {
      let pos = w > h ? (this.left_ + 1 + shift + Math.imul(i, 2) + Math.imul(((this.top_ + 2 + (Random.Int$int((h - 2) | 0))) | 0), level.width())) | 0 : (this.left_ + 2 + (Random.Int$int((w - 2) | 0)) + Math.imul(((this.top_ + 1 + shift + Math.imul(i, 2)) | 0), level.width())) | 0;
      level.drop(i === index ? Generator.random$() : new Gold()._Gold$().random(), pos).type_ = Heap$Type.TOMB;
    }
  }
}

$J.define(GrassyGraveRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.GrassyGraveRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_GrassyGraveRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  PlantsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PlantsRoom');
  Random = $J.load('com.watabou.utils.Random');
});
