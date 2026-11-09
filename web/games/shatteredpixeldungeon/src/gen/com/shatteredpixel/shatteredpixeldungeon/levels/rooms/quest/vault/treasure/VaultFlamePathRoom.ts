// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultFlamePathRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../../jre/index.ts';
import { VaultTreasureRoom } from './VaultTreasureRoom.ts';

let Heap$Type, DwarfToken, Terrain, VaultLevel$VaultFlameTrap, Painter, Room$Door$Type, Random, Rect;

export class VaultFlamePathRoom extends VaultTreasureRoom {
  LEFT: number = 0;
  UP: number = 0;
  RIGHT: number = 0;
  DOWN: number = 0;
  _VaultFlamePathRoom(): this {
    this._VaultTreasureRoom();
    this.LEFT = 0;
    this.UP = 1;
    this.RIGHT = 2;
    this.DOWN = 3;
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.REGULAR);
    let c = this.center();
    let leftSide = new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.left_ + 3) | 0, (this.bottom_ - 1) | 0);
    let topSide = new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (this.top_ + 3) | 0);
    let rightSide = new Rect()._Rect$int$int$int$int((this.right_ - 3) | 0, (this.top_ + 1) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
    let bottomSide = new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, (this.bottom_ - 3) | 0, (this.right_ - 1) | 0, (this.bottom_ - 1) | 0);
    let treasure = null;
    if (entrance.x === this.left_) {
      if (entrance.y < c.y) {
        this.fillGroup(level, bottomSide, this.RIGHT);
        this.fillGroup(level, rightSide, this.UP);
        this.fillGroup(level, topSide, this.LEFT);
        Painter.set$Level$int$int(level, (this.left_ + 1 + Math.imul(level.width(), ((this.top_ + 6) | 0))) | 0, Terrain.EMPTY_SP);
      } else {
        this.fillGroup(level, topSide, this.RIGHT);
        this.fillGroup(level, rightSide, this.DOWN);
        this.fillGroup(level, bottomSide, this.LEFT);
        Painter.set$Level$int$int(level, (this.left_ + 1 + Math.imul(level.width(), ((this.top_ + 4) | 0))) | 0, Terrain.EMPTY_SP);
      }
      treasure = new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 5) | 0, (this.left_ + 5) | 0, (this.top_ + 5) | 0);
    } else if (entrance.y === this.top_) {
      if (entrance.x < c.x) {
        this.fillGroup(level, rightSide, this.DOWN);
        this.fillGroup(level, bottomSide, this.LEFT);
        this.fillGroup(level, leftSide, this.UP);
        Painter.set$Level$int$int(level, (this.left_ + 6 + Math.imul(level.width(), ((this.top_ + 1) | 0))) | 0, Terrain.EMPTY_SP);
      } else {
        this.fillGroup(level, leftSide, this.DOWN);
        this.fillGroup(level, bottomSide, this.RIGHT);
        this.fillGroup(level, rightSide, this.UP);
        Painter.set$Level$int$int(level, (this.left_ + 4 + Math.imul(level.width(), ((this.top_ + 1) | 0))) | 0, Terrain.EMPTY_SP);
      }
      treasure = new Rect()._Rect$int$int$int$int((this.left_ + 5) | 0, (this.top_ + 1) | 0, (this.left_ + 5) | 0, (this.top_ + 5) | 0);
    } else if (entrance.x === this.right_) {
      if (entrance.y < c.y) {
        this.fillGroup(level, bottomSide, this.LEFT);
        this.fillGroup(level, leftSide, this.UP);
        this.fillGroup(level, topSide, this.RIGHT);
        Painter.set$Level$int$int(level, (this.right_ - 1 + Math.imul(level.width(), ((this.top_ + 6) | 0))) | 0, Terrain.EMPTY_SP);
      } else {
        this.fillGroup(level, topSide, this.LEFT);
        this.fillGroup(level, leftSide, this.DOWN);
        this.fillGroup(level, bottomSide, this.RIGHT);
        Painter.set$Level$int$int(level, (this.right_ - 1 + Math.imul(level.width(), ((this.top_ + 4) | 0))) | 0, Terrain.EMPTY_SP);
      }
      treasure = new Rect()._Rect$int$int$int$int((this.right_ - 5) | 0, (this.top_ + 5) | 0, (this.right_ - 1) | 0, (this.top_ + 5) | 0);
    } else if (entrance.y === this.bottom_) {
      if (entrance.x < c.x) {
        this.fillGroup(level, rightSide, this.UP);
        this.fillGroup(level, topSide, this.LEFT);
        this.fillGroup(level, leftSide, this.DOWN);
        Painter.set$Level$int$int(level, (this.left_ + 6 + Math.imul(level.width(), ((this.bottom_ - 1) | 0))) | 0, Terrain.EMPTY_SP);
      } else {
        this.fillGroup(level, leftSide, this.UP);
        this.fillGroup(level, topSide, this.RIGHT);
        this.fillGroup(level, rightSide, this.DOWN);
        Painter.set$Level$int$int(level, (this.left_ + 4 + Math.imul(level.width(), ((this.bottom_ - 1) | 0))) | 0, Terrain.EMPTY_SP);
      }
      treasure = new Rect()._Rect$int$int$int$int((this.left_ + 5) | 0, (this.bottom_ - 5) | 0, (this.left_ + 5) | 0, (this.bottom_ - 1) | 0);
    }
    Painter.fill$Level$int$int$int$int$int(level, treasure.left_, treasure.top_, (treasure.width() + 1) | 0, (treasure.height() + 1) | 0, Terrain.EMPTY_SP);
    let treasurePos = level.pointToCell(Random.element$Collection(treasure.getPoints()));
    let treasureItem = (level).createEquipment(1);
    level.drop(treasureItem, treasurePos).type_ = Heap$Type.CHEST;
    treasureItem = (level).findT2SolveItem();
    if (treasureItem == null) {
      treasureItem = (level).createConsumabe(1);
    }
    do {
      treasurePos = level.pointToCell(Random.element$Collection(treasure.getPoints()));
    } while (level.heaps.get(treasurePos) != null);
    level.drop(treasureItem, treasurePos);
    do {
      treasurePos = level.pointToCell(Random.element$Collection(treasure.getPoints()));
    } while (level.heaps.get(treasurePos) != null);
    level.drop(new DwarfToken()._DwarfToken(), treasurePos);
  }
  fillGroup(level: Level, space: Rect, dir: number): void {
    let priorOffsets = new ArrayList();
    let ofs: number;
    let delay: number;
    if (dir === this.LEFT) {
      for (let y = space.top_; y <= space.bottom_; y++) {
        do {
          ofs = Random.Int$int(5);
        } while (priorOffsets.contains(ofs));
        delay = 0;
        for (let x = space.right_; x >= space.left_; x--) {
          VaultLevel$VaultFlameTrap.setupTrap(level, (x + Math.imul(level.width(), y)) | 0, (delay + ofs) | 0, 5, 2);
          delay++;
        }
        priorOffsets.add(ofs);
      }
    } else if (dir === this.RIGHT) {
      for (let y = space.top_; y <= space.bottom_; y++) {
        do {
          ofs = Random.Int$int(5);
        } while (priorOffsets.contains(ofs));
        delay = 0;
        for (let x = space.left_; x <= space.right_; x++) {
          VaultLevel$VaultFlameTrap.setupTrap(level, (x + Math.imul(level.width(), y)) | 0, (delay + ofs) | 0, 5, 2);
          delay++;
        }
        priorOffsets.add(ofs);
      }
    } else if (dir === this.UP) {
      for (let x = space.left_; x <= space.right_; x++) {
        do {
          ofs = Random.Int$int(5);
        } while (priorOffsets.contains(ofs));
        delay = 0;
        for (let y = space.bottom_; y >= space.top_; y--) {
          VaultLevel$VaultFlameTrap.setupTrap(level, (x + Math.imul(level.width(), y)) | 0, (delay + ofs) | 0, 5, 2);
          delay++;
        }
        priorOffsets.add(ofs);
      }
    } else if (dir === this.DOWN) {
      for (let x = space.left_; x <= space.right_; x++) {
        do {
          ofs = Random.Int$int(5);
        } while (priorOffsets.contains(ofs));
        delay = 0;
        for (let y = space.top_; y <= space.bottom_; y++) {
          VaultLevel$VaultFlameTrap.setupTrap(level, (x + Math.imul(level.width(), y)) | 0, (delay + ofs) | 0, 5, 2);
          delay++;
        }
        priorOffsets.add(ofs);
      }
    }
  }
  canConnect$Point(p: Point): boolean {
    let c = this.center();
    return ((Math.abs((c.x - p.x) | 0)) > 1 && (Math.abs((c.y - p.y) | 0)) > 1) && super.canConnect$Point(p);
  }
}

$J.define(VaultFlamePathRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultFlamePathRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultFlamePathRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel$VaultFlameTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel$VaultFlameTrap');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
