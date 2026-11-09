// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays } from '../../../../../../../../../jre/index.ts';
import { VaultRoom } from '../VaultRoom.ts';

let VaultBookcaseTreasureRoom, VaultCircleScanTreasureRoom, VaultFlamePathRoom, VaultFlamesTreasureRoom, VaultHardLaserTreasureRoom, VaultLaserTreasureRoom, VaultManyScansRoom, VaultMultipleEnemyTreasureRoom, VaultSingleEnemyTreasureRoom, Random, Reflection;

export class VaultTreasureRoom extends VaultRoom {
  entrance_: Room$Door = null;
  static T1_ROOMS: ArrayList<JClass<VaultTreasureRoom>> = null;
  static T2_ROOMS: ArrayList<JClass<VaultTreasureRoom>> = null;
  static T3_ROOMS: ArrayList<JClass<VaultTreasureRoom>> = null;
  static treasuresToSpawn: ArrayList<JClass<VaultTreasureRoom>> = null;
  _VaultTreasureRoom(): this {
    this._VaultRoom();
    return this;
  }
  maxConnections(direction: number): number {
    return 1;
  }
  entrance(): Room$Door {
    if (this.entrance_ == null) {
      if (this.connected_.isEmpty()) {
        return null;
      } else {
        this.entrance_ = this.connected_.values().iterator().next();
      }
    }
    return this.entrance_;
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return false;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return false;
  }
  static generateRoomList(): void {
    let T1s = new ArrayList(VaultTreasureRoom.T1_ROOMS);
    Random.shuffle$List(T1s);
    let T2s = new ArrayList(VaultTreasureRoom.T2_ROOMS);
    Random.shuffle$List(T2s);
    let T3s = new ArrayList(VaultTreasureRoom.T3_ROOMS);
    Random.shuffle$List(T3s);
    let fullList = new ArrayList();
    fullList.add(T1s);
    fullList.add(T2s);
    fullList.add(T3s);
    VaultTreasureRoom.treasuresToSpawn = new ArrayList();
    while (!fullList.isEmpty()) {
      let current = fullList.removeAt(0);
      VaultTreasureRoom.treasuresToSpawn.add(current.removeAt(0));
      if (!current.isEmpty()) {
        fullList.add(current);
      }
    }
  }
  static nextRoom(): VaultTreasureRoom {
    return Reflection.newInstance(VaultTreasureRoom.treasuresToSpawn.removeAt(0));
  }
  static $clinit() {
    VaultTreasureRoom.T1_ROOMS = new ArrayList(Arrays.asList($J.cls(VaultFlamePathRoom), $J.cls(VaultLaserTreasureRoom), $J.cls(VaultCircleScanTreasureRoom)));
    VaultTreasureRoom.T2_ROOMS = new ArrayList(Arrays.asList($J.cls(VaultSingleEnemyTreasureRoom), $J.cls(VaultBookcaseTreasureRoom), $J.cls(VaultFlamesTreasureRoom)));
    VaultTreasureRoom.T3_ROOMS = new ArrayList(Arrays.asList($J.cls(VaultManyScansRoom), $J.cls(VaultMultipleEnemyTreasureRoom), $J.cls(VaultHardLaserTreasureRoom)));
    VaultTreasureRoom.treasuresToSpawn = new ArrayList();
  }
}

$J.define(VaultTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultTreasureRoom' }, clinit: true, lazy: ['T1_ROOMS', 'T2_ROOMS', 'T3_ROOMS', 'treasuresToSpawn'] });
$J.module(() => {
  VaultBookcaseTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultBookcaseTreasureRoom');
  VaultCircleScanTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultCircleScanTreasureRoom');
  VaultFlamePathRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultFlamePathRoom');
  VaultFlamesTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultFlamesTreasureRoom');
  VaultHardLaserTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultHardLaserTreasureRoom');
  VaultLaserTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultLaserTreasureRoom');
  VaultManyScansRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultManyScansRoom');
  VaultMultipleEnemyTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultMultipleEnemyTreasureRoom');
  VaultSingleEnemyTreasureRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultSingleEnemyTreasureRoom');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
