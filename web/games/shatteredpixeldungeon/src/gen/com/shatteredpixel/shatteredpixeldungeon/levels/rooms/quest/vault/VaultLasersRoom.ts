// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultLasersRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { VaultRoom } from './VaultRoom.ts';

let VaultLaser, Terrain, Painter, Room$Door$Type, Random;

export class VaultLasersRoom extends VaultRoom {
  _VaultLasersRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      Painter.drawInside(level, this, door, 2, Terrain.EMPTY);
      door.set$Type(Room$Door$Type.REGULAR);
    }
    for (let x = (this.left_ + 2) | 0; x <= ((this.right_ - 2) | 0); x++) {
      if ((level.map_[(x + Math.imul(((this.top_ + 1) | 0), level.width())) | 0]) === Terrain.WALL && (level.map_[(x + Math.imul(((this.bottom_ - 1) | 0), level.width())) | 0]) === Terrain.WALL) {
        let laser = new VaultLaser()._VaultLaser();
        if (Random.Int$int(2) === 0) {
          let cell = (x + Math.imul(level.width(), ((this.top_ + 1) | 0))) | 0;
          Painter.set$Level$int$int(level, cell, Terrain.PEDESTAL);
          laser.laserDirs = [(cell + level.width()) | 0];
          laser.pos = cell;
        } else {
          let cell = (x + Math.imul(level.width(), ((this.bottom_ - 1) | 0))) | 0;
          Painter.set$Level$int$int(level, cell, Terrain.PEDESTAL);
          laser.laserDirs = [(cell - level.width()) | 0];
          laser.pos = cell;
        }
        laser.afterShotCooldown = Random.IntRange(7, 9);
        laser.curCooldown = Random.IntRange(1, laser.afterShotCooldown);
        level.mobs.add(laser);
      }
    }
    for (let y = (this.top_ + 2) | 0; y <= ((this.bottom_ - 2) | 0); y++) {
      if ((level.map_[(this.left_ + 1 + Math.imul((y), level.width())) | 0]) === Terrain.WALL && (level.map_[(this.right_ - 1 + Math.imul((y), level.width())) | 0]) === Terrain.WALL) {
        let laser = new VaultLaser()._VaultLaser();
        if (Random.Int$int(2) === 0) {
          let cell = (this.left_ + 1 + Math.imul(level.width(), y)) | 0;
          Painter.set$Level$int$int(level, cell, Terrain.PEDESTAL);
          laser.laserDirs = [(cell + 1) | 0];
          laser.pos = cell;
        } else {
          let cell = (this.right_ - 1 + Math.imul(level.width(), y)) | 0;
          Painter.set$Level$int$int(level, cell, Terrain.PEDESTAL);
          laser.laserDirs = [(cell - 1) | 0];
          laser.pos = cell;
        }
        laser.afterShotCooldown = Random.IntRange(7, 9);
        laser.curCooldown = Random.IntRange(1, laser.afterShotCooldown);
        level.mobs.add(laser);
      }
    }
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return false;
  }
}

$J.define(VaultLasersRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLasersRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultLasersRoom' } });
$J.module(() => {
  VaultLaser = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultLaser');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Random = $J.load('com.watabou.utils.Random');
});
