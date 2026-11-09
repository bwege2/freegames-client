// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/WaterBridgeRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { StandardBridgeRoom } from './StandardBridgeRoom.ts';

let Terrain;

export class WaterBridgeRoom extends StandardBridgeRoom {
  _WaterBridgeRoom(): this {
    this._StandardBridgeRoom();
    return this;
  }
  maxBridgeWidth(roomDimension: number): number {
    return roomDimension >= 8 ? 3 : 2;
  }
  spaceTile(): number {
    return Terrain.WATER;
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
}

$J.define(WaterBridgeRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.WaterBridgeRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardBridgeRoom', ctors: { '': '_WaterBridgeRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
});
