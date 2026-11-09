// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/PitRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Challenges, Dungeon, Generator, Generator$Category, Heap$Type, CrystalKey, Terrain, Painter, Room$Door$Type, Point, Random;

export class PitRoom extends SpecialRoom {
  _PitRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 6;
  }
  minHeight(): number {
    return 6;
  }
  maxWidth(): number {
    return 9;
  }
  maxHeight(): number {
    return 9;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.CRYSTAL);
    let well = null;
    if (entrance.x === this.left_) {
      well = new Point()._Point$int$int((this.right_ - 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 1) | 0 : (this.bottom_ - 1) | 0);
    } else if (entrance.x === this.right_) {
      well = new Point()._Point$int$int((this.left_ + 1) | 0, Random.Int$int(2) === 0 ? (this.top_ + 1) | 0 : (this.bottom_ - 1) | 0);
    } else if (entrance.y === this.top_) {
      well = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
    } else if (entrance.y === this.bottom_) {
      well = new Point()._Point$int$int(Random.Int$int(2) === 0 ? (this.left_ + 1) | 0 : (this.right_ - 1) | 0, (this.top_ + 1) | 0);
    }
    Painter.set$Level$Point$int(level, well, Terrain.EMPTY_WELL);
    let remains = level.pointToCell(this.center());
    let mainLoot = null;
    do {
      switch (Random.Int$int(3)) {
        case 0:
          mainLoot = Generator.random$Category(Generator$Category.RING);
          break;
        case 1:
          mainLoot = Generator.random$Category(Generator$Category.ARTIFACT);
          break;
        case 2:
          mainLoot = Generator.random$Category(Random.oneOf([Generator$Category.WEAPON, Generator$Category.WEAPON, Generator$Category.MISSILE, Generator$Category.ARMOR, Generator$Category.ARMOR]));
          break;
      }
    } while (mainLoot == null || Challenges.isItemBlocked(mainLoot));
    level.drop(mainLoot, remains).setHauntedIfCursed().type_ = Heap$Type.SKELETON;
    let n = Random.IntRange(1, 2);
    for (let i = 0; i < n; i++) {
      level.drop(PitRoom.prize(level), remains).setHauntedIfCursed();
    }
    level.drop(new CrystalKey()._CrystalKey$int(Dungeon.depth), remains);
  }
  static prize(level: Level): Item {
    return Generator.random$Category(Random.oneOf([Generator$Category.POTION, Generator$Category.SCROLL, Generator$Category.FOOD, Generator$Category.GOLD]));
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
}

$J.define(PitRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.PitRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_PitRoom' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
