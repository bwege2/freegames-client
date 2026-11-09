// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultFlamesTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../../jre/index.ts';
import { VaultTreasureRoom } from './VaultTreasureRoom.ts';

let Heap$Type, PotionOfPurity, DwarfToken, Terrain, VaultLevel$VaultFlameTrap, Painter, Room$Door$Type, Random;

export class VaultFlamesTreasureRoom extends VaultTreasureRoom {
  _VaultFlamesTreasureRoom(): this {
    this._VaultTreasureRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fillEllipse$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    let c = this.center();
    let treasurePositions = [(level.pointToCell(c) - Math.imul(3, level.width())) | 0, (level.pointToCell(c) + 3) | 0, (level.pointToCell(c) + Math.imul(3, level.width())) | 0, (level.pointToCell(c) - 3) | 0, (level.pointToCell(c) - Math.imul(3, level.width())) | 0, (level.pointToCell(c) + 3) | 0];
    let treasureIdx: number;
    let consumablePos: number;
    if (this.entrance().x === this.left_) {
      treasureIdx = 1;
    } else if (this.entrance().y === this.top_) {
      treasureIdx = 2;
    } else if (this.entrance().x === this.right_) {
      treasureIdx = 3;
    } else {
      treasureIdx = 4;
    }
    Painter.set$Level$int$int(level, treasurePositions[(treasureIdx - 1) | 0], Terrain.PEDESTAL);
    Painter.set$Level$int$int(level, treasurePositions[treasureIdx], Terrain.PEDESTAL);
    Painter.set$Level$int$int(level, treasurePositions[(treasureIdx + 1) | 0], Terrain.PEDESTAL);
    let treasureItem = (level).createEquipment(2);
    level.drop(treasureItem, treasurePositions[treasureIdx]).type_ = Heap$Type.CHEST;
    for (let x = (this.left_ + 2) | 0; x <= ((this.right_ - 2) | 0); x++) {
      for (let y = (this.top_ + 2) | 0; y <= ((this.bottom_ - 2) | 0); y++) {
        let cell = (x + Math.imul(level.width(), y)) | 0;
        if (level.map_[cell] === Terrain.EMPTY) {
          VaultLevel$VaultFlameTrap.setupTrap(level, (x + Math.imul(level.width(), y)) | 0, 1, 1, 1);
        }
      }
    }
    if ((Math.abs((c.x - this.entrance().x) | 0)) <= 1 || (Math.abs((c.y - this.entrance().y) | 0)) <= 1) {
      Painter.drawInside(level, this, this.entrance(), 1, Terrain.EMPTY);
    } else {
      Painter.drawInside(level, this, this.entrance(), 2, Terrain.EMPTY);
    }
    treasureItem = (level).findT3SolveItem();
    if (treasureItem == null) {
      treasureItem = (level).createConsumabe(2);
    }
    if (Random.Int$int(2) === 0) {
      level.drop(treasureItem, treasurePositions[(treasureIdx - 1) | 0]);
      level.drop(new DwarfToken()._DwarfToken(), treasurePositions[(treasureIdx + 1) | 0]);
    } else {
      level.drop(new DwarfToken()._DwarfToken(), treasurePositions[(treasureIdx - 1) | 0]);
      level.drop(treasureItem, treasurePositions[(treasureIdx + 1) | 0]);
    }
    level.addItemToSpawn(new PotionOfPurity()._PotionOfPurity());
    this.entrance().set$Type(Room$Door$Type.REGULAR);
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canConnect$Point(p: Point): boolean {
    let c = this.center();
    return ((Math.abs((c.x - p.x) | 0)) <= 2 || (Math.abs((c.y - p.y) | 0)) <= 2) && super.canConnect$Point(p);
  }
}

$J.define(VaultFlamesTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultFlamesTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultFlamesTreasureRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfPurity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel$VaultFlameTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel$VaultFlameTrap');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
