// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/ArmoryRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Generator, Bomb, IronKey, TrinketCatalyst, Terrain, Painter, Room$Door$Type, Point, Random;

export class ArmoryRoom extends SpecialRoom {
  static prizeCats: number[] = null;
  _ArmoryRoom(): this {
    this._SpecialRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let entrance = this.entrance();
    let statue = null;
    if (entrance.x === this.left_) {
      statue = new Point()._Point$int$int((this.right_ - 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 1) | 0 : (this.bottom_ - 1) | 0);
    } else if (entrance.x === this.right_) {
      statue = new Point()._Point$int$int((this.left_ + 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 1) | 0 : (this.bottom_ - 1) | 0);
    } else if (entrance.y === this.top_) {
      statue = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
    } else if (entrance.y === this.bottom_) {
      statue = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.top_ + 1) | 0);
    }
    if (statue != null) {
      Painter.set$Level$Point$int(level, statue, Terrain.STATUE);
    }
    let n = Random.IntRange(2, 3);
    ArmoryRoom.prizeCats = [1, 1, 1, 1];
    for (let i = 0; i < n; i++) {
      let pos: number;
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY || level.heaps.get(pos) != null);
      level.drop(ArmoryRoom.prize(level), pos);
    }
    let cata = level.findPrizeItem$Class($J.cls(TrinketCatalyst));
    if (cata != null) {
      let pos: number;
      do {
        pos = level.pointToCell(this.random$());
      } while (level.map_[pos] !== Terrain.EMPTY || level.heaps.get(pos) != null);
      level.drop(cata, pos);
    }
    entrance.set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
  static prize(level: Level): Item {
    let index = Random.chances$floatArr(ArmoryRoom.prizeCats);
    ArmoryRoom.prizeCats[index] = 0;
    switch (index) {
      case 0:
        return new Bomb()._Bomb().random();
      case 1:
        return Generator.randomWeapon$();
      case 2:
        return Generator.randomArmor$();
      case 3:
      default:
        return Generator.randomMissile$();
    }
  }
}

$J.define(ArmoryRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ArmoryRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_ArmoryRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
