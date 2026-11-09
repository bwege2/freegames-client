// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultRingRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { VaultRoom } from './VaultRoom.ts';

let VaultDM100, VaultSkeleton, Terrain, Painter, Room$Door$Type, Point, Random;

export class VaultRingRoom extends VaultRoom {
  _VaultRingRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 4, Terrain.WALL);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let nextToEntry = false;
    for (const $it1 = this.connected_.keySet().iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      if (r.isEntrance()) {
        nextToEntry = true;
      }
    }
    let enemy: Mob;
    let valid: boolean;
    let toReturn = new ArrayList();
    do {
      valid = true;
      enemy = level.createMob();
      if (nextToEntry && !(enemy instanceof VaultSkeleton || enemy instanceof VaultDM100)) {
        valid = false;
      }
      if (!valid) {
        toReturn.add(enemy.getClass());
      }
    } while (!valid);
    let wanderPositions: number[];
    if (Random.Int$int(2) === 0) {
      wanderPositions = [level.pointToCell(new Point()._Point$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0)), level.pointToCell(new Point()._Point$int$int((this.right_ - 2) | 0, (this.top_ + 2) | 0)), level.pointToCell(new Point()._Point$int$int((this.right_ - 2) | 0, (this.bottom_ - 2) | 0)), level.pointToCell(new Point()._Point$int$int((this.left_ + 2) | 0, (this.bottom_ - 2) | 0))];
    } else {
      wanderPositions = [level.pointToCell(new Point()._Point$int$int((this.left_ + 2) | 0, (this.bottom_ - 2) | 0)), level.pointToCell(new Point()._Point$int$int((this.right_ - 2) | 0, (this.bottom_ - 2) | 0)), level.pointToCell(new Point()._Point$int$int((this.right_ - 2) | 0, (this.top_ + 2) | 0)), level.pointToCell(new Point()._Point$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0))];
    }
    let idx = Random.Int$int(4);
    enemy.pos = wanderPositions[idx];
    enemy.setupStealthGameplayWanderPositions(wanderPositions, idx);
    enemy.state_ = enemy.WANDERING;
    level.mobs.add(enemy);
    for (const $it2 = toReturn.iterator(); $it2.hasNext(); ) {
      let cls = $it2.next();
      (level).returnMob(cls);
    }
  }
}

$J.define(VaultRingRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRingRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultRingRoom' } });
$J.module(() => {
  VaultDM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM100');
  VaultSkeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultSkeleton');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
