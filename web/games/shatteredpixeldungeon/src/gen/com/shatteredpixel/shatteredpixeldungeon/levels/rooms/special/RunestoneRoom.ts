// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/RunestoneRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Generator, Generator$Category, IronKey, Runestone, TrinketCatalyst, Terrain, Painter, Room$Door$Type, Random;

export class RunestoneRoom extends SpecialRoom {
  _RunestoneRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 6;
  }
  minHeight(): number {
    return 6;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CHASM);
    Painter.drawInside(level, this, this.entrance(), 2, Terrain.EMPTY_SP);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    let n = Random.NormalIntRange(2, 3);
    let dropPos: number;
    for (let i = 0; i < n; i++) {
      do {
        dropPos = level.pointToCell(this.random$());
      } while (level.map_[dropPos] !== Terrain.EMPTY || level.heaps.get(dropPos) != null);
      level.drop(RunestoneRoom.prize(level), dropPos);
    }
    this.entrance().set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
  static prize(level: Level): Item {
    let prize = level.findPrizeItem$Class($J.cls(TrinketCatalyst));
    if (prize == null) {
      prize = level.findPrizeItem$Class($J.cls(Runestone));
      if (prize == null) {
        prize = Generator.random$Category(Generator$Category.STONE);
      }
    }
    return prize;
  }
}

$J.define(RunestoneRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.RunestoneRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_RunestoneRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
