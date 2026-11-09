// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultEnemyCenterRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Elemental, VaultDM100, VaultSkeleton, Heap$Type, Terrain, VaultLevel, Painter, Room$Door$Type, Point, Random;

export class VaultEnemyCenterRoom extends VaultRoom {
  _VaultEnemyCenterRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 3, Terrain.EMPTY);
    Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.top_ + 3) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.top_ + 3) | 0), Terrain.EMPTY);
    Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 1) | 0, (this.bottom_ - 3) | 0), new Point()._Point$int$int((this.right_ - 1) | 0, (this.bottom_ - 3) | 0), Terrain.EMPTY);
    Painter.drawLine(level, new Point()._Point$int$int((this.left_ + 3) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.left_ + 3) | 0, (this.bottom_ - 1) | 0), Terrain.EMPTY);
    Painter.drawLine(level, new Point()._Point$int$int((this.right_ - 3) | 0, (this.top_ + 1) | 0), new Point()._Point$int$int((this.right_ - 3) | 0, (this.bottom_ - 1) | 0), Terrain.EMPTY);
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
    for (const $it2 = toReturn.iterator(); $it2.hasNext(); ) {
      let cls = $it2.next();
      (level).returnMob(cls);
    }
    let wanderPositions: number[];
    let c = this.center();
    if (Random.Int$int(2) === 0) {
      wanderPositions = [level.pointToCell(new Point()._Point$int$int((c.x - 1) | 0, (c.y - 1) | 0)), level.pointToCell(new Point()._Point$int$int((c.x + 1) | 0, (c.y - 1) | 0)), level.pointToCell(new Point()._Point$int$int((c.x + 1) | 0, (c.y + 1) | 0)), level.pointToCell(new Point()._Point$int$int((c.x - 1) | 0, (c.y + 1) | 0))];
    } else {
      wanderPositions = [level.pointToCell(new Point()._Point$int$int((c.x - 1) | 0, (c.y - 1) | 0)), level.pointToCell(new Point()._Point$int$int((c.x - 1) | 0, (c.y + 1) | 0)), level.pointToCell(new Point()._Point$int$int((c.x + 1) | 0, (c.y + 1) | 0)), level.pointToCell(new Point()._Point$int$int((c.x + 1) | 0, (c.y - 1) | 0))];
    }
    let idx = Random.Int$int(4);
    enemy.pos = wanderPositions[idx];
    enemy.setupStealthGameplayWanderPositions(wanderPositions, idx);
    enemy.state_ = enemy.WANDERING;
    level.mobs.add(enemy);
    let tier = 1;
    for (let cls of VaultLevel.T1Mobs) {
      if ($J.equals(cls, enemy.getClass())) {
        tier = 1;
      }
    }
    for (let cls of VaultLevel.T2Mobs) {
      if ($J.equals(cls, enemy.getClass())) {
        tier = 2;
      }
    }
    for (let cls of VaultLevel.T3Mobs) {
      if ($J.equals(cls, enemy.getClass())) {
        tier = 3;
      }
    }
    if (enemy instanceof Elemental) {
      tier = 3;
    }
    let treasure = (level).createEquipment(tier);
    level.drop(treasure, level.pointToCell(c)).type_ = Heap$Type.CHEST;
  }
  canPlaceItem(p: Point, l: Level): boolean {
    let c = this.center();
    if ((Math.abs((c.x - p.x) | 0)) <= 2) {
      return false;
    }
    if ((Math.abs((c.y - p.y) | 0)) <= 2) {
      return false;
    }
    return super.canPlaceItem(p, l);
  }
}

$J.define(VaultEnemyCenterRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultEnemyCenterRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultEnemyCenterRoom' } });
$J.module(() => {
  Elemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental');
  VaultDM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM100');
  VaultSkeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultSkeleton');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
