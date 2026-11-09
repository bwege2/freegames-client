// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/CrystalChoiceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Generator, Generator$Category, Heap$Type, CrystalKey, IronKey, Terrain, Painter, Room$Door$Type, EmptyRoom, Point, Random;

export class CrystalChoiceRoom extends SpecialRoom {
  _CrystalChoiceRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 7;
  }
  minHeight(): number {
    return 7;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let entrance = this.entrance();
    let entry = new EmptyRoom()._EmptyRoom();
    let room1 = new EmptyRoom()._EmptyRoom();
    let room2 = new EmptyRoom()._EmptyRoom();
    if (entrance.x === this.left_) {
      entry.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.left_ + 2) | 0, (this.bottom_ - 1) | 0);
      room1.set$int$int$int$int((entry.right_ + 2) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (this.center().y - 1) | 0);
      room2.set$int$int$int$int((entry.right_ + 2) | 0, (room1.bottom_ + 2) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((entry.right_ + 1) | 0, $J.idiv(((room1.top_ + room1.bottom_ + 1) | 0), 2)), Terrain.CRYSTAL_DOOR);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((entry.right_ + 1) | 0, $J.idiv(((room2.top_ + room2.bottom_) | 0), 2)), Terrain.CRYSTAL_DOOR);
    } else if (entrance.y === this.top_) {
      entry.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (this.top_ + 2) | 0);
      room1.set$int$int$int$int((this.left_ + 1) | 0, (entry.bottom_ + 2) | 0, (this.center().x - 1) | 0, (this.bottom_ - 1) | 0);
      room2.set$int$int$int$int((room1.right_ + 2) | 0, (entry.bottom_ + 2) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int($J.idiv(((room1.left_ + room1.right_ + 1) | 0), 2), (entry.bottom_ + 1) | 0), Terrain.CRYSTAL_DOOR);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int($J.idiv(((room2.left_ + room2.right_) | 0), 2), (entry.bottom_ + 1) | 0), Terrain.CRYSTAL_DOOR);
    } else if (entrance.x === this.right_) {
      entry.set$int$int$int$int((this.right_ - 2) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
      Painter.drawLine(level, new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 1) | 0), Terrain.EMPTY);
      room1.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (entry.left_ - 2) | 0, (this.center().y - 1) | 0);
      room2.set$int$int$int$int((this.left_ + 1) | 0, (room1.bottom_ + 2) | 0, (entry.left_ - 2) | 0, (this.bottom_ - 1) | 0);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((entry.left_ - 1) | 0, $J.idiv(((room1.top_ + room1.bottom_ + 1) | 0), 2)), Terrain.CRYSTAL_DOOR);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int((entry.left_ - 1) | 0, $J.idiv(((room2.top_ + room2.bottom_) | 0), 2)), Terrain.CRYSTAL_DOOR);
    } else if (entrance.y === this.bottom_) {
      entry.set$int$int$int$int((this.left_ + 1) | 0, (this.bottom_ - 2) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
      room1.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.center().x - 1) | 0, (entry.top_ - 2) | 0);
      room2.set$int$int$int$int((room1.right_ + 2) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (entry.top_ - 2) | 0);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int($J.idiv(((room1.left_ + room1.right_ + 1) | 0), 2), (entry.top_ - 1) | 0), Terrain.CRYSTAL_DOOR);
      Painter.set$Level$Point$int(level, new Point()._Point$int$int($J.idiv(((room2.left_ + room2.right_) | 0), 2), (entry.top_ - 1) | 0), Terrain.CRYSTAL_DOOR);
    }
    Painter.fill$Level$Rect$int(level, entry, Terrain.EMPTY);
    Painter.fill$Level$Rect$int(level, room1, Terrain.EMPTY_SP);
    Painter.fill$Level$Rect$int(level, room2, Terrain.EMPTY_SP);
    if (Random.Int$int(2) === 0) {
      let tmp = room1;
      room1 = room2;
      room2 = tmp;
    }
    let n = Random.NormalIntRange(3, 4);
    for (let i = 0; i < n; i++) {
      let reward = Generator.random$Category(Random.oneOf([Generator$Category.POTION, Generator$Category.SCROLL]));
      let pos: number;
      do {
        if (room1.square() >= 16) {
          pos = level.pointToCell(room1.random$int(1));
        } else {
          pos = level.pointToCell(room1.random$int(0));
        }
      } while (level.heaps.get(pos) != null);
      level.drop(reward, pos);
    }
    let hidden = Generator.random$Category(Random.oneOf([Generator$Category.WAND, Generator$Category.RING, Generator$Category.ARTIFACT]));
    let chest = level.drop(hidden, level.pointToCell(room2.center()));
    chest.type_ = Heap$Type.CHEST;
    chest.autoExplored = true;
    level.addItemToSpawn(new CrystalKey()._CrystalKey$int(Dungeon.depth));
    this.entrance().set$Type(Room$Door$Type.LOCKED);
    level.addItemToSpawn(new IronKey()._IronKey$int(Dungeon.depth));
  }
}

$J.define(CrystalChoiceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.CrystalChoiceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_CrystalChoiceRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  EmptyRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.EmptyRoom');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
