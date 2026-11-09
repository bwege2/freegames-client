// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/TrapsRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Generator, Heap$Type, PotionOfLevitation, Terrain, Painter, Room$Door$Type, DisintegrationTrap, ExplosiveTrap, FlashingTrap, FlockTrap, GrimTrap, GrippingTrap, PoisonDartTrap, TeleportationTrap, WarpingTrap, Random, Reflection;

export class TrapsRoom extends SpecialRoom {
  static levelTraps: JClass<Trap>[][] = null;
  _TrapsRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 6;
  }
  maxWidth(): number {
    return 8;
  }
  minHeight(): number {
    return 6;
  }
  maxHeight(): number {
    return 8;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let trapClass: JClass<Trap>;
    switch (Random.Int$int(4)) {
      case 0:
        trapClass = null;
        break;
      default:
        trapClass = Random.oneOf(TrapsRoom.levelTraps[$J.idiv(Dungeon.depth, 5)]);
        break;
    }
    if (trapClass == null) {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CHASM);
    } else {
      Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.TRAP);
    }
    let door = this.entrance();
    door.set$Type(Room$Door$Type.REGULAR);
    let lastRow = (level.map_[(this.left_ + 1 + Math.imul(((this.top_ + 1) | 0), level.width())) | 0]) === Terrain.CHASM ? Terrain.CHASM : Terrain.EMPTY;
    let x = -1;
    let y = -1;
    if (door.x === this.left_) {
      x = (this.right_ - 1) | 0;
      y = (this.top_ + $J.idiv(this.height(), 2)) | 0;
      Painter.fill$Level$int$int$int$int$int(level, x, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, lastRow);
    } else if (door.x === this.right_) {
      x = (this.left_ + 1) | 0;
      y = (this.top_ + $J.idiv(this.height(), 2)) | 0;
      Painter.fill$Level$int$int$int$int$int(level, x, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, lastRow);
    } else if (door.y === this.top_) {
      x = (this.left_ + $J.idiv(this.width(), 2)) | 0;
      y = (this.bottom_ - 1) | 0;
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, y, (this.width() - 2) | 0, 1, lastRow);
    } else if (door.y === this.bottom_) {
      x = (this.left_ + $J.idiv(this.width(), 2)) | 0;
      y = (this.top_ + 1) | 0;
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, y, (this.width() - 2) | 0, 1, lastRow);
    }
    for (const $it0 = this.getPoints().iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      let cell = level.pointToCell(p);
      if (level.map_[cell] === Terrain.TRAP) {
        level.setTrap(Reflection.newInstance(trapClass).reveal(), cell);
      }
    }
    let pos = (x + Math.imul(y, level.width())) | 0;
    if (Random.Int$int(3) === 0) {
      if (lastRow === Terrain.CHASM) {
        Painter.set$Level$int$int(level, pos, Terrain.EMPTY);
      }
      level.drop(TrapsRoom.prize(level), pos).type_ = Heap$Type.CHEST;
    } else {
      Painter.set$Level$int$int(level, pos, Terrain.PEDESTAL);
      level.drop(TrapsRoom.prize(level), pos).type_ = Heap$Type.CHEST;
    }
    level.addItemToSpawn(new PotionOfLevitation()._PotionOfLevitation());
  }
  static prize(level: Level): Item {
    let prize: Item;
    if (Random.Int$int(3) !== 0) {
      prize = level.findPrizeItem$();
      if (prize != null) {
        return prize;
      }
    }
    if (Random.Int$int(2) === 0) {
      prize = Generator.randomWeapon$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
      if ((prize).hasCurseEnchant()) {
        (prize).enchant$Enchantment(null);
      }
    } else {
      prize = Generator.randomArmor$int((($J.idiv(Dungeon.depth, 5)) + 1) | 0);
      if ((prize).hasCurseGlyph()) {
        (prize).inscribe$Glyph(null);
      }
    }
    prize.cursed = false;
    prize.cursedKnown = true;
    if (Random.Int$int(3) === 0) {
      prize.upgrade$();
    }
    return prize;
  }
  static $clinit() {
    TrapsRoom.levelTraps = [[$J.cls(GrippingTrap), $J.cls(TeleportationTrap), $J.cls(FlockTrap)], [$J.cls(PoisonDartTrap), $J.cls(GrippingTrap), $J.cls(ExplosiveTrap)], [$J.cls(PoisonDartTrap), $J.cls(FlashingTrap), $J.cls(ExplosiveTrap)], [$J.cls(WarpingTrap), $J.cls(FlashingTrap), $J.cls(DisintegrationTrap)], [$J.cls(GrimTrap)]];
  }
}

$J.define(TrapsRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.TrapsRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_TrapsRoom' }, clinit: true, lazy: ['levelTraps'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  DisintegrationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap');
  ExplosiveTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ExplosiveTrap');
  FlashingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlashingTrap');
  FlockTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlockTrap');
  GrimTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap');
  GrippingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrippingTrap');
  PoisonDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PoisonDartTrap');
  TeleportationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TeleportationTrap');
  WarpingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WarpingTrap');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
