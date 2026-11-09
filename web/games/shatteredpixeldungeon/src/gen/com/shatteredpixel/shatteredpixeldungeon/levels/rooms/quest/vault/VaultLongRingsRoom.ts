// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultLongRingsRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { VaultLongRoom } from './VaultLongRoom.ts';

let EquipableItem, Terrain, Painter, Room$Door$Type, VaultEntranceRoom;

export class VaultLongRingsRoom extends VaultLongRoom {
  _VaultLongRingsRoom(): this {
    this._VaultLongRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 4, Terrain.WALL);
    if (this.wide()) {
      Painter.fill$Level$Rect$int$int$int$int$int(level, this, 8, 4, 8, 4, Terrain.EMPTY);
    } else {
      Painter.fill$Level$Rect$int$int$int$int$int(level, this, 4, 8, 4, 8, Terrain.EMPTY);
    }
    let c = this.center();
    let i = level.findPrizeItem$Class($J.cls(EquipableItem));
    if (i != null) {
      level.drop(i, level.pointToCell(c));
    }
    for (let n = 0; n < 2; n++) {
      let enemy = level.createMob();
      let wanderPositions = $J.newArray(20, 0);
      wanderPositions[0] = this.randomWander(level, -1);
      for (let idx = 1; idx < wanderPositions.length; idx++) {
        wanderPositions[idx] = this.randomWander(level, wanderPositions[(idx - 1) | 0]);
      }
      enemy.pos = wanderPositions[0];
      enemy.setupStealthGameplayWanderPositions(wanderPositions, 0);
      enemy.state_ = enemy.WANDERING;
      level.mobs.add(enemy);
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
  randomWander(level: Level, previous: number): number {
    let pos: number;
    do {
      pos = level.pointToCell(this.random$int(1));
    } while (level.map_[pos] === Terrain.WALL || level.map_[pos] === Terrain.WALL_DECO || level.distance(pos, previous) < 6);
    return pos;
  }
  canConnect$Room(r: Room): boolean {
    return super.canConnect$Room(r) && !(r instanceof VaultEntranceRoom);
  }
}

$J.define(VaultLongRingsRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLongRingsRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLongRoom', ctors: { '': '_VaultLongRingsRoom' }, meths: { 'canConnect(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'canConnect$Room' } });
$J.module(() => {
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  VaultEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultEntranceRoom');
});
