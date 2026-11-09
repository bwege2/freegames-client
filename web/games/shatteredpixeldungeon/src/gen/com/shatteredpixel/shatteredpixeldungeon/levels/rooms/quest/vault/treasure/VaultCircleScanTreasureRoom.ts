// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultCircleScanTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let VaultSentry, Heap$Type, DwarfToken, Terrain, Painter, Room$Door$Type, Random, Rect;

export class VaultCircleScanTreasureRoom extends VaultTreasureRoom {
  _VaultCircleScanTreasureRoom(): this {
    this._VaultTreasureRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int$int$int$int(level, this, 4, 1, 4, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int$int$int$int(level, this, 1, 4, 1, 4, Terrain.EMPTY);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.REGULAR);
    Painter.drawInside(level, this, entrance, 3, Terrain.EMPTY);
    let c = this.center();
    let clockwise = true;
    Painter.set$Level$Point$int(level, c, Terrain.PEDESTAL);
    let treasure = null;
    if (entrance.x === this.left_) {
      Painter.set$Level$int$int$int(level, (c.x + 2) | 0, c.y, Terrain.WALL);
      Painter.set$Level$int$int$int(level, (c.x + 1) | 0, c.y, Terrain.STATUE);
      Painter.set$Level$int$int$int(level, (c.x - 1) | 0, c.y, Terrain.STATUE);
      treasure = new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, (c.y - 1) | 0, (c.x - 2) | 0, (c.y + 1) | 0);
      Painter.fill$Level$int$int$int$int$int(level, treasure.left_, treasure.top_, (treasure.width() + 1) | 0, (treasure.height() + 1) | 0, Terrain.WALL);
      treasure.right_--;
      if (entrance.y < c.y) {
        clockwise = false;
        treasure.top_++;
      } else {
        clockwise = true;
        treasure.bottom_--;
      }
    } else if (entrance.y === this.top_) {
      Painter.set$Level$int$int$int(level, c.x, (c.y + 2) | 0, Terrain.WALL);
      Painter.set$Level$int$int$int(level, c.x, (c.y + 1) | 0, Terrain.STATUE);
      Painter.set$Level$int$int$int(level, c.x, (c.y - 1) | 0, Terrain.STATUE);
      treasure = new Rect()._Rect$int$int$int$int((c.x - 1) | 0, (this.top_ + 1) | 0, (c.x + 1) | 0, (this.top_ + 3) | 0);
      Painter.fill$Level$int$int$int$int$int(level, treasure.left_, treasure.top_, (treasure.width() + 1) | 0, (treasure.height() + 1) | 0, Terrain.WALL);
      treasure.bottom_--;
      if (entrance.x < c.x) {
        clockwise = true;
        treasure.left_++;
      } else {
        clockwise = false;
        treasure.right_--;
      }
    } else if (entrance.x === this.right_) {
      Painter.set$Level$int$int$int(level, (c.x - 2) | 0, c.y, Terrain.WALL);
      Painter.set$Level$int$int$int(level, (c.x - 1) | 0, c.y, Terrain.STATUE);
      Painter.set$Level$int$int$int(level, (c.x + 1) | 0, c.y, Terrain.STATUE);
      treasure = new Rect()._Rect$int$int$int$int((this.right_ - 3) | 0, (c.y - 1) | 0, (this.right_ - 1) | 0, (c.y + 1) | 0);
      Painter.fill$Level$int$int$int$int$int(level, treasure.left_, treasure.top_, (treasure.width() + 1) | 0, (treasure.height() + 1) | 0, Terrain.WALL);
      treasure.left_++;
      if (entrance.y < c.y) {
        clockwise = true;
        treasure.top_++;
      } else {
        clockwise = false;
        treasure.bottom_--;
      }
    } else if (entrance.y === this.bottom_) {
      Painter.set$Level$int$int$int(level, c.x, (c.y - 2) | 0, Terrain.WALL);
      Painter.set$Level$int$int$int(level, c.x, (c.y - 1) | 0, Terrain.STATUE);
      Painter.set$Level$int$int$int(level, c.x, (c.y + 1) | 0, Terrain.STATUE);
      treasure = new Rect()._Rect$int$int$int$int((c.x - 1) | 0, (this.bottom_ - 3) | 0, (c.x + 1) | 0, (this.bottom_ - 1) | 0);
      Painter.fill$Level$int$int$int$int$int(level, treasure.left_, treasure.top_, (treasure.width() + 1) | 0, (treasure.height() + 1) | 0, Terrain.WALL);
      treasure.top_++;
      if (entrance.x < c.x) {
        clockwise = false;
        treasure.left_++;
      } else {
        clockwise = true;
        treasure.right_--;
      }
    }
    Painter.fill$Level$int$int$int$int$int(level, treasure.left_, treasure.top_, (treasure.width() + 1) | 0, (treasure.height() + 1) | 0, Terrain.EMPTY_SP);
    let sentry = new VaultSentry()._VaultSentry();
    sentry.pos = level.pointToCell(c);
    sentry.scanLength = Math.fround(4.49);
    let w = level.width();
    sentry.scanWidth = 45;
    sentry.scanDirs = [[(sentry.pos - 2) | 0], [(sentry.pos - 2 - w) | 0], [(sentry.pos - 2 - Math.imul(2, w)) | 0], [(sentry.pos - 1 - Math.imul(2, w)) | 0], [(sentry.pos - Math.imul(2, w)) | 0], [(sentry.pos + 1 - Math.imul(2, w)) | 0], [(sentry.pos + 2 - Math.imul(2, w)) | 0], [(sentry.pos + 2 - w) | 0], [(sentry.pos + 2) | 0], [(sentry.pos + 2 + w) | 0], [(sentry.pos + 2 + Math.imul(2, w)) | 0], [(sentry.pos + 1 + Math.imul(2, w)) | 0], [(sentry.pos + Math.imul(2, w)) | 0], [(sentry.pos - 1 + Math.imul(2, w)) | 0], [(sentry.pos - 2 + Math.imul(2, w)) | 0], [(sentry.pos - 2 + w) | 0]];
    if (!clockwise) {
      let reverse = $J.newArray(sentry.scanDirs.length, null);
      for (let i = 0; i < sentry.scanDirs.length; i++) {
        reverse[i] = sentry.scanDirs[(sentry.scanDirs.length - i - 1) | 0];
      }
      sentry.scanDirs = reverse;
    }
    level.mobs.add(sentry);
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
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canConnect$Point(p: Point): boolean {
    let c = this.center();
    return ((Math.abs((c.x - p.x) | 0)) > 1 && (Math.abs((c.y - p.y) | 0)) > 1) && super.canConnect$Point(p);
  }
}

$J.define(VaultCircleScanTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultCircleScanTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultCircleScanTreasureRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  VaultSentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultSentry');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
