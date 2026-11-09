// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/standard/SuspiciousChestRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Mimic, Gold, Heap$Type, MimicTooth, Terrain, Painter, Room$Door$Type, Random;

export class SuspiciousChestRoom extends StandardRoom {
  _SuspiciousChestRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(5, super.minWidth());
  }
  minHeight(): number {
    return Math.max(5, super.minHeight());
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let i = level.findPrizeItem$();
    if (i == null) {
      i = new Gold()._Gold$().random();
    }
    let center = level.pointToCell(this.center());
    Painter.set$Level$int$int(level, center, Terrain.PEDESTAL);
    let mimicChance = Math.fround(Math.fround(1 / 3) * MimicTooth.mimicChanceMultiplier$());
    if (Random.Float$() < mimicChance) {
      level.mobs.add(Mimic.spawnAt$int$ItemArr(center, [i]));
    } else {
      level.drop(i, center).type_ = Heap$Type.CHEST;
    }
  }
}

$J.define(SuspiciousChestRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.SuspiciousChestRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_SuspiciousChestRoom' } });
$J.module(() => {
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
