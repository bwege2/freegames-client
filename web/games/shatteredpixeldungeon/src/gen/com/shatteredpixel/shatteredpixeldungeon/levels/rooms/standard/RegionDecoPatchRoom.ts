// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/RegionDecoPatchRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Terrain, Painter, Room$Door$Type;

export class RegionDecoPatchRoom extends PatchRoom {
  _RegionDecoPatchRoom(): this {
    this._PatchRoom();
    return this;
  }
  minHeight(): number {
    return Math.max(5, super.minHeight());
  }
  minWidth(): number {
    return Math.max(5, super.minWidth());
  }
  fill(): number {
    let scale = Math.min(Math.imul(this.width(), this.height()), Math.imul(10, 10));
    return Math.fround(Math.fround(0.2) + Math.fround(scale / 1024));
  }
  clustering(): number {
    return 1;
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
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    this.setupPatch(level);
    this.fillPatch(level, Terrain.REGION_DECO);
  }
}

$J.define(RegionDecoPatchRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RegionDecoPatchRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.PatchRoom', ctors: { '': '_RegionDecoPatchRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
