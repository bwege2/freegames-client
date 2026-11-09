// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultHardLaserTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let VaultLaser, Heap$Type, DwarfToken, StoneOfBlink, Terrain, Painter, Room$Door$Type, GameMath, Random, Rect;

export class VaultHardLaserTreasureRoom extends VaultTreasureRoom {
  _VaultHardLaserTreasureRoom(): this {
    this._VaultTreasureRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.REGULAR);
    let itemPlace: Rect;
    if (entrance.x === this.left_ || entrance.x === this.right_) {
      let areaTop = $J.d2i(GameMath.gate(Math.fround((this.top_ + 1) | 0), Math.fround((entrance.y - 2) | 0), Math.fround((this.bottom_ - 5) | 0)));
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, areaTop, 9, 5, Terrain.EMPTY_SP);
      if (entrance.x === this.left_) {
        itemPlace = new Rect()._Rect$int$int$int$int((this.right_ - 1) | 0, areaTop, (this.right_ - 1) | 0, (areaTop + 4) | 0);
        for (let x = (this.right_ - 2) | 0; x > ((this.left_ + 1) | 0); x--) {
          let sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (x + Math.imul(level.width(), areaTop)) | 0;
          sentry.laserDirs = [(sentry.pos + level.width()) | 0];
          sentry.curCooldown = (this.right_ - x) | 0;
          sentry.afterShotCooldown = 2;
          sentry.shotsAfterCooldown = 6;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
          sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (x + Math.imul(level.width(), ((areaTop + 4) | 0))) | 0;
          sentry.laserDirs = [(sentry.pos - level.width()) | 0];
          sentry.curCooldown = 2147483647;
          sentry.afterShotCooldown = 2147483647;
          sentry.shotsAfterCooldown = 0;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
        }
      } else {
        itemPlace = new Rect()._Rect$int$int$int$int((this.left_ + 1) | 0, areaTop, (this.left_ + 1) | 0, (areaTop + 4) | 0);
        for (let x = (this.left_ + 2) | 0; x < ((this.right_ - 1) | 0); x++) {
          let sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (x + Math.imul(level.width(), areaTop)) | 0;
          sentry.laserDirs = [(sentry.pos + level.width()) | 0];
          sentry.curCooldown = (x - this.left_) | 0;
          sentry.afterShotCooldown = 2;
          sentry.shotsAfterCooldown = 6;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
          sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (x + Math.imul(level.width(), ((areaTop + 4) | 0))) | 0;
          sentry.laserDirs = [(sentry.pos - level.width()) | 0];
          sentry.curCooldown = 2147483647;
          sentry.afterShotCooldown = 2147483647;
          sentry.shotsAfterCooldown = 0;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
        }
      }
    } else {
      let areaLeft = $J.d2i(GameMath.gate(Math.fround((this.left_ + 1) | 0), Math.fround((entrance.x - 2) | 0), Math.fround((this.right_ - 5) | 0)));
      Painter.fill$Level$int$int$int$int$int(level, areaLeft, (this.top_ + 1) | 0, 5, 9, Terrain.EMPTY_SP);
      if (entrance.y === this.top_) {
        itemPlace = new Rect()._Rect$int$int$int$int(areaLeft, (this.bottom_ - 1) | 0, (areaLeft + 4) | 0, (this.bottom_ - 1) | 0);
        for (let y = (this.bottom_ - 2) | 0; y > ((this.top_ + 1) | 0); y--) {
          let sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (areaLeft + Math.imul(level.width(), (y))) | 0;
          sentry.laserDirs = [(sentry.pos + 1) | 0];
          sentry.curCooldown = (this.bottom_ - y) | 0;
          sentry.afterShotCooldown = 2;
          sentry.shotsAfterCooldown = 6;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
          sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (areaLeft + 4 + Math.imul(level.width(), (y))) | 0;
          sentry.laserDirs = [(sentry.pos - 1) | 0];
          sentry.curCooldown = 2147483647;
          sentry.afterShotCooldown = 2147483647;
          sentry.shotsAfterCooldown = 0;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
        }
      } else {
        itemPlace = new Rect()._Rect$int$int$int$int(areaLeft, (this.top_ + 1) | 0, (areaLeft + 4) | 0, (this.top_ + 1) | 0);
        for (let y = (this.top_ + 2) | 0; y < ((this.bottom_ - 1) | 0); y++) {
          let sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (areaLeft + Math.imul(level.width(), (y))) | 0;
          sentry.laserDirs = [(sentry.pos + 1) | 0];
          sentry.curCooldown = (y - this.top_) | 0;
          sentry.afterShotCooldown = 2;
          sentry.shotsAfterCooldown = 6;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
          sentry = new VaultLaser()._VaultLaser();
          sentry.pos = (areaLeft + 4 + Math.imul(level.width(), (y))) | 0;
          sentry.laserDirs = [(sentry.pos - 1) | 0];
          sentry.curCooldown = 2147483647;
          sentry.afterShotCooldown = 2147483647;
          sentry.shotsAfterCooldown = 0;
          sentry.giveWarning = false;
          Painter.set$Level$int$int(level, sentry.pos, Terrain.PEDESTAL);
          level.mobs.add(sentry);
        }
      }
    }
    Painter.fill$Level$int$int$int$int$int(level, itemPlace.left_, itemPlace.top_, (itemPlace.width() + 1) | 0, (itemPlace.height() + 1) | 0, Terrain.EMPTY_SP);
    let treasurePos = level.pointToCell(Random.element$Collection(itemPlace.getPoints()));
    let treasureItem = (level).createEquipment(3);
    level.drop(treasureItem, treasurePos).type_ = Heap$Type.CHEST;
    treasureItem = (level).createConsumabe(3);
    do {
      treasurePos = level.pointToCell(Random.element$Collection(itemPlace.getPoints()));
    } while (level.heaps.get(treasurePos) != null);
    level.drop(treasureItem, treasurePos);
    do {
      treasurePos = level.pointToCell(Random.element$Collection(itemPlace.getPoints()));
    } while (level.heaps.get(treasurePos) != null);
    level.drop(new DwarfToken()._DwarfToken(), treasurePos);
    level.addItemToSpawn(new StoneOfBlink()._StoneOfBlink());
  }
}

$J.define(VaultHardLaserTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultHardLaserTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultHardLaserTreasureRoom' } });
$J.module(() => {
  VaultLaser = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultLaser');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  StoneOfBlink = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlink');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
