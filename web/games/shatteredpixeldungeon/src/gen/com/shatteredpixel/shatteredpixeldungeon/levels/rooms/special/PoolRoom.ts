// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/PoolRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Piranha, Generator, Heap$Type, PotionOfInvisibility, Terrain, Painter, Room$Door$Type, Random;

export class PoolRoom extends SpecialRoom {
  static readonly NPIRANHAS: number = 3;
  _PoolRoom(): this {
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
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.WATER);
    let door = this.entrance();
    door.set$Type(Room$Door$Type.REGULAR);
    let x = -1;
    let y = -1;
    if (door.x === this.left_) {
      x = (this.right_ - 1) | 0;
      y = (this.top_ + $J.idiv(this.height(), 2)) | 0;
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.EMPTY_SP);
    } else if (door.x === this.right_) {
      x = (this.left_ + 1) | 0;
      y = (this.top_ + $J.idiv(this.height(), 2)) | 0;
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 1) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.EMPTY_SP);
    } else if (door.y === this.top_) {
      x = (this.left_ + $J.idiv(this.width(), 2)) | 0;
      y = (this.bottom_ - 1) | 0;
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, 1, Terrain.EMPTY_SP);
    } else if (door.y === this.bottom_) {
      x = (this.left_ + $J.idiv(this.width(), 2)) | 0;
      y = (this.top_ + 1) | 0;
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.bottom_ - 1) | 0, (this.width() - 2) | 0, 1, Terrain.EMPTY_SP);
    }
    let pos = (x + Math.imul(y, level.width())) | 0;
    level.drop(PoolRoom.prize(level), pos).type_ = Heap$Type.CHEST;
    Painter.set$Level$int$int(level, pos, Terrain.PEDESTAL);
    level.addItemToSpawn(new PotionOfInvisibility()._PotionOfInvisibility());
    for (let i = 0; i < PoolRoom.NPIRANHAS; i++) {
      let piranha = Piranha.random();
      do {
        piranha.pos = level.pointToCell(this.random$());
      } while (level.map_[piranha.pos] !== Terrain.WATER || level.findMob(piranha.pos) != null);
      level.mobs.add(piranha);
    }
  }
  static prize(level: Level): Item {
    let prize: Item;
    if (Random.Int$int(3) === 0) {
      prize = level.findPrizeItem$();
      if (prize != null) {
        return prize;
      }
    }
    switch (Random.Int$int(5)) {
      case 0:
      case 1:
      default:
        prize = Generator.randomWeapon$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
        if ((prize).hasCurseEnchant()) {
          (prize).enchant$Enchantment(null);
        }
        break;
      case 2:
        prize = Generator.randomMissile$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
        if ((prize).hasCurseEnchant()) {
          (prize).enchant$Enchantment(null);
        }
        break;
      case 3:
      case 4:
        prize = Generator.randomArmor$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
        if ((prize).hasCurseGlyph()) {
          (prize).inscribe$Glyph(null);
        }
        break;
    }
    prize.cursed = false;
    prize.cursedKnown = true;
    if (Random.Int$int(3) === 0) {
      prize.upgrade$();
    }
    return prize;
  }
}

$J.define(PoolRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.PoolRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_PoolRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
