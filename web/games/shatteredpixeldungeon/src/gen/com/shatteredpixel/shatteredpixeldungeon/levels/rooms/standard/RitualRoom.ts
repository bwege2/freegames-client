// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RitualRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Generator, Generator$Category, Terrain, Painter, Room$Door$Type, Random;

export class RitualRoom extends PatchRoom {
  _RitualRoom(): this {
    this._PatchRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 9);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 9);
  }
  sizeCatProbs(): number[] {
    return [6, 3, 1];
  }
  fill(): number {
    let scale = Math.min(Math.imul(this.width(), this.height()), Math.imul(18, 18));
    return Math.fround(Math.fround(0.3) + Math.fround(scale / 1024));
  }
  clustering(): number {
    return 0;
  }
  ensurePath(): boolean {
    return this.connected_.size() > 0;
  }
  cleanEdges(): boolean {
    return true;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let c = this.center();
    this.setupPatch(level);
    this.fillPatch(level, Terrain.REGION_DECO);
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 3) | 0, (c.y - 3) | 0, 7, 7, Terrain.EMPTY);
    Painter.set$Level$int$int$int(level, (c.x - 2) | 0, (c.y - 1) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (c.x - 1) | 0, (c.y - 2) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (c.x + 2) | 0, (c.y - 1) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (c.x + 1) | 0, (c.y - 2) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (c.x - 2) | 0, (c.y + 1) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (c.x - 1) | 0, (c.y + 2) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (c.x + 2) | 0, (c.y + 1) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (c.x + 1) | 0, (c.y + 2) | 0, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 1) | 0, (c.y - 1) | 0, 3, 3, Terrain.EMBERS);
    Painter.set$Level$Point$int(level, c, Terrain.PEDESTAL);
    this.placeloot(level, c);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
  placeloot(level: Level, p: Point): void {
    let prize = Random.Int$int(2) === 0 ? level.findPrizeItem$() : null;
    if (prize == null) {
      prize = Generator.random$Category(Random.oneOf([Generator$Category.POTION, Generator$Category.SCROLL]));
    }
    level.drop(prize, level.pointToCell(p));
  }
}

$J.define(RitualRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RitualRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PatchRoom', ctors: { '': '_RitualRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
