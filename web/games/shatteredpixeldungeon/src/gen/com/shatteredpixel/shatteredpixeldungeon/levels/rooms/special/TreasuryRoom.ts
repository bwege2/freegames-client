// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/TreasuryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SpecialRoom } from './SpecialRoom.ts';

let Dungeon, Mimic, Gold, Heap$Type, IronKey, MimicTooth, TrinketCatalyst, Terrain, Painter, Room$Door$Type, Random;

export class TreasuryRoom extends SpecialRoom {
  _TreasuryRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.set$Level$Point$int(level, this.center(), Terrain.STATUE);
    let heapType = Random.Int$int(2) === 0 ? Heap$Type.CHEST : Heap$Type.HEAP;
    let n = Random.IntRange(2, 3);
    let mimicChance = Math.fround(Math.fround(1 / 5) * MimicTooth.mimicChanceMultiplier$());
    for (let i = 0; i < n; i++) {
      let item = level.findPrizeItem$Class($J.cls(TrinketCatalyst));
      if (item == null) {
        item = new Gold()._Gold$().random();
      }
      let pos: number;
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY || level.heaps.get(pos) != null || level.findMob(pos) != null);
      if (heapType === Heap$Type.CHEST && Dungeon.depth > 1 && Random.Float$() < mimicChance) {
        level.mobs.add(Mimic.spawnAt$int$ItemArr(pos, [item]));
      } else {
        level.drop(item, pos).type_ = heapType;
      }
    }
    if (heapType === Heap$Type.HEAP) {
      for (let i = 0; i < 6; i++) {
        let pos: number;
        do {
          pos = level.pointToCell(this.random$());
        } while (level.map_[pos] !== Terrain.EMPTY);
        level.drop(new Gold()._Gold$int(Random.IntRange(5, 12)), pos);
      }
    }
    this.entrance().set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
}

$J.define(TreasuryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.TreasuryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_TreasuryRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
