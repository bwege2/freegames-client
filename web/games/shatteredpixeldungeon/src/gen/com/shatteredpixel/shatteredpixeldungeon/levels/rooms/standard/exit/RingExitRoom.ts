// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/exit/RingExitRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { RingRoom } from '../RingRoom.ts';

let Terrain, LevelTransition, LevelTransition$Type, Painter;

export class RingExitRoom extends RingRoom {
  _RingExitRoom(): this {
    this._RingRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 1, 0];
  }
  isExit(): boolean {
    return true;
  }
  centerDecoTiles(): number {
    return Terrain.EMPTY_SP;
  }
  placeCenterDetail(level: Level, pos: number): void {
    Painter.set$Level$int$int(level, pos, Terrain.EXIT);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(level, pos, LevelTransition$Type.REGULAR_EXIT));
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.pointToCell(p) !== l.exit();
  }
}

$J.define(RingExitRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.RingExitRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.RingRoom', ctors: { '': '_RingExitRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
});
