// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { StandardRoom } from '../../standard/StandardRoom.ts';

let VaultAlternatingFireRoom, VaultCircleRoom, VaultCrossRoom, VaultEnemyCenterRoom, VaultHallwayRoom, VaultLasersRoom, VaultLongRingsRoom, VaultQuadrantsRoom, VaultRingRoom, VaultRingsRoom, Random, Reflection;

export class VaultRoom extends StandardRoom {
  static rooms: ArrayList<JClass<VaultRoom>> = null;
  static chances: number[] = null;
  _VaultRoom(): this {
    this._StandardRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 1, 0];
  }
  minHeight(): number {
    return 11;
  }
  maxHeight(): number {
    return 11;
  }
  minWidth(): number {
    return 11;
  }
  maxWidth(): number {
    return 11;
  }
  canMerge(l: Level, other: Room, p: Point, mergeTerrain: number): boolean {
    return false;
  }
  sizeFactor(): number {
    return 1;
  }
  static setupChances(): void {
    VaultRoom.chances = [2, 2, 2, 2, 2, 1, 1, 1, 1, 1];
  }
  static createRoom(): VaultRoom {
    let idx = Random.chances$floatArr(VaultRoom.chances);
    if (idx === -1) {
      VaultRoom.setupChances();
      idx = Random.chances$floatArr(VaultRoom.chances);
    }
    VaultRoom.chances[idx]--;
    return Reflection.newInstance(VaultRoom.rooms.get(idx));
  }
  static $clinit() {
    VaultRoom.rooms = new ArrayList();
    VaultRoom.rooms.add($J.cls(VaultRingRoom));
    VaultRoom.rooms.add($J.cls(VaultCrossRoom));
    VaultRoom.rooms.add($J.cls(VaultQuadrantsRoom));
    VaultRoom.rooms.add($J.cls(VaultRingsRoom));
    VaultRoom.rooms.add($J.cls(VaultEnemyCenterRoom));
    VaultRoom.rooms.add($J.cls(VaultHallwayRoom));
    VaultRoom.rooms.add($J.cls(VaultLongRingsRoom));
    VaultRoom.rooms.add($J.cls(VaultCircleRoom));
    VaultRoom.rooms.add($J.cls(VaultAlternatingFireRoom));
    VaultRoom.rooms.add($J.cls(VaultLasersRoom));
    VaultRoom.chances = $J.newArray(0, 0);
  }
}

$J.define(VaultRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_VaultRoom' }, clinit: true, lazy: ['rooms', 'chances'] });
$J.module(() => {
  VaultAlternatingFireRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultAlternatingFireRoom');
  VaultCircleRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultCircleRoom');
  VaultCrossRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultCrossRoom');
  VaultEnemyCenterRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultEnemyCenterRoom');
  VaultHallwayRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultHallwayRoom');
  VaultLasersRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLasersRoom');
  VaultLongRingsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLongRingsRoom');
  VaultQuadrantsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultQuadrantsRoom');
  VaultRingRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRingRoom');
  VaultRingsRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRingsRoom');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
