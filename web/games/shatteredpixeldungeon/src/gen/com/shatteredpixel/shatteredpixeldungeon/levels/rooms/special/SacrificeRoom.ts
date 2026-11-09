// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/SacrificeRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Challenges, Dungeon, Blob, SacrificialFire, Generator, Gold, Weapon$Enchantment, Terrain, Painter, Room$Door$Type, Point, Random;

export class SacrificeRoom extends SpecialRoom {
  _SacrificeRoom(): this {
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
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CHASM);
    let c = this.center();
    let door = this.entrance();
    if (door.x === this.left_ || door.x === this.right_) {
      if (door.y === c.y) {
        c.y = (c.y + (Random.Int$int(2) === 0 ? -1 : +1)) | 0;
      }
      let p = Painter.drawInside(level, this, door, ((Math.abs((door.x - c.x) | 0)) - 2) | 0, Terrain.EMPTY_SP);
      for (; p.y !== c.y; p.y = (p.y + (p.y < c.y ? +1 : -1)) | 0) {
        Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
      }
    } else {
      if (door.x === c.x) {
        c.x = (c.x + (Random.Int$int(2) === 0 ? -1 : +1)) | 0;
      }
      let p = Painter.drawInside(level, this, door, ((Math.abs((door.y - c.y) | 0)) - 2) | 0, Terrain.EMPTY_SP);
      for (; p.x !== c.x; p.x = (p.x + (p.x < c.x ? +1 : -1)) | 0) {
        Painter.set$Level$Point$int(level, p, Terrain.EMPTY_SP);
      }
    }
    let statue = new Point()._Point$Point(c);
    statue.x = (statue.x - 2) | 0;
    if (statue.x > this.left_) {
      Painter.set$Level$Point$int(level, statue, Terrain.STATUE);
    }
    statue.x = (statue.x + 2) | 0;
    statue.y = (statue.y - 2) | 0;
    if (statue.y > this.top_) {
      Painter.set$Level$Point$int(level, statue, Terrain.STATUE);
    }
    statue.y = (statue.y + 2) | 0;
    statue.x = (statue.x + 2) | 0;
    if (statue.x < this.right_) {
      Painter.set$Level$Point$int(level, statue, Terrain.STATUE);
    }
    statue.x = (statue.x - 2) | 0;
    statue.y = (statue.y + 2) | 0;
    if (statue.y < this.bottom_) {
      Painter.set$Level$Point$int(level, statue, Terrain.STATUE);
    }
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 1) | 0, (c.y - 1) | 0, 3, 3, Terrain.EMBERS);
    Painter.set$Level$Point$int(level, c, Terrain.PEDESTAL);
    Blob.seed$int$int$Class$Level(level.pointToCell(c), (6 + Math.imul(Dungeon.depth, 4)) | 0, $J.cls(SacrificialFire), level).setPrize(SacrificeRoom.prize(level));
    door.set$Type(Room$Door$Type.EMPTY);
  }
  static prize(level: Level): Item {
    let prize = Generator.randomWeapon$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
    if (Challenges.isItemBlocked(prize)) {
      return new Gold()._Gold$().random();
    }
    let curse = Weapon$Enchantment.randomCurse([]);
    if (!prize.cursed) {
      prize.upgrade$();
      if (!prize.hasGoodEnchant()) {
        prize.enchant$Enchantment(curse);
      }
    }
    prize.cursed = prize.cursedKnown = true;
    return prize;
  }
}

$J.define(SacrificeRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SacrificeRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_SacrificeRoom' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  SacrificialFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
