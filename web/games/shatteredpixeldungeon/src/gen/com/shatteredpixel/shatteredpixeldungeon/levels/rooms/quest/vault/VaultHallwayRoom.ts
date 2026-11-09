// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultHallwayRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { VaultLongRoom } from './VaultLongRoom.ts';

let VaultDM100, VaultSkeleton, EquipableItem, Terrain, Painter, Room$Door$Type, Point, Random;

export class VaultHallwayRoom extends VaultLongRoom {
  _VaultHallwayRoom(): this {
    this._VaultLongRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    if (this.wide()) {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 4) | 0, (this.width() - 2) | 0, 3, Terrain.EMPTY);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 6) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.EMPTY);
      Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 7) | 0, (this.top_ + 1) | 0, 1, (this.height() - 2) | 0, Terrain.EMPTY);
    } else {
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, (this.top_ + 1) | 0, 3, (this.height() - 2) | 0, Terrain.EMPTY);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 6) | 0, (this.width() - 2) | 0, 1, Terrain.EMPTY);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.bottom_ - 7) | 0, (this.width() - 2) | 0, 1, Terrain.EMPTY);
    }
    let c = this.center();
    let lootPositions = new ArrayList();
    if (this.wide()) {
      lootPositions.add((this.left_ + 2 + Math.imul(c.y, level.width())) | 0);
      lootPositions.add((this.right_ - 2 + Math.imul(c.y, level.width())) | 0);
    } else {
      lootPositions.add((c.x + Math.imul(((this.top_ + 2) | 0), level.width())) | 0);
      lootPositions.add((c.x + Math.imul(((this.bottom_ - 2) | 0), level.width())) | 0);
    }
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let d = $it0.next();
      for (let i of $J.toArrayInto(lootPositions.toArray(), $J.newArray(0, null))) {
        if (level.distance(i, level.pointToCell(d)) <= 6) {
          lootPositions.remove(i);
        }
      }
    }
    if (lootPositions.isEmpty()) {
      lootPositions.add(level.pointToCell(c));
    }
    let i = level.findPrizeItem$Class($J.cls(EquipableItem));
    if (i != null) {
      level.drop(i, lootPositions.get(0));
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
    if (this.wide()) {
      enemy.setupStealthGameplayWanderPositions([level.pointToCell(new Point()._Point$int$int((this.left_ + 2) | 0, c.y)), level.pointToCell(new Point()._Point$int$int((this.right_ - 2) | 0, c.y))], Random.Int$int(2));
    } else {
      enemy.setupStealthGameplayWanderPositions([level.pointToCell(new Point()._Point$int$int(c.x, (this.top_ + 2) | 0)), level.pointToCell(new Point()._Point$int$int(c.x, (this.bottom_ - 2) | 0))], Random.Int$int(2));
    }
    enemy.pos = level.pointToCell(c);
    enemy.state_ = enemy.WANDERING;
    level.mobs.add(enemy);
    for (const $it3 = this.connected_.values().iterator(); $it3.hasNext(); ) {
      let door = $it3.next();
      door.set$Type(Room$Door$Type.REGULAR);
      if (this.wide()) {
        if (door.x === this.left_) {
          Painter.drawLine(level, new Point()._Point$int$int((door.x + 1) | 0, door.y), new Point()._Point$int$int((this.left_ + 1) | 0, c.y), Terrain.EMPTY);
        } else if (door.x === this.right_) {
          Painter.drawLine(level, new Point()._Point$int$int((door.x - 1) | 0, door.y), new Point()._Point$int$int((this.right_ - 1) | 0, c.y), Terrain.EMPTY);
        } else if (door.x <= ((this.left_ + 3) | 0) || door.x >= ((this.right_ - 3) | 0)) {
          Painter.drawInside(level, this, door, 5, Terrain.EMPTY);
        } else {
          let closestX: number;
          if (door.x < c.x || (door.x === c.x && Random.Int$int(2) === 0)) {
            closestX = (this.left_ + 6) | 0;
          } else {
            closestX = (this.right_ - 7) | 0;
          }
          if (door.y === this.top_) {
            Painter.drawLine(level, new Point()._Point$int$int(door.x, (door.y + 1) | 0), new Point()._Point$int$int(closestX, (door.y + 1) | 0), Terrain.EMPTY);
          } else {
            Painter.drawLine(level, new Point()._Point$int$int(door.x, (door.y - 1) | 0), new Point()._Point$int$int(closestX, (door.y - 1) | 0), Terrain.EMPTY);
          }
        }
      } else {
        if (door.y === this.top_) {
          Painter.drawLine(level, new Point()._Point$int$int(door.x, (door.y + 1) | 0), new Point()._Point$int$int(c.x, (this.top_ + 1) | 0), Terrain.EMPTY);
        } else if (door.y === this.bottom_) {
          Painter.drawLine(level, new Point()._Point$int$int(door.x, (door.y - 1) | 0), new Point()._Point$int$int(c.x, (this.bottom_ - 1) | 0), Terrain.EMPTY);
        } else if (door.y <= ((this.top_ + 3) | 0) || door.y >= ((this.bottom_ - 3) | 0)) {
          Painter.drawInside(level, this, door, 5, Terrain.EMPTY);
        } else {
          let closestY: number;
          if (door.y < c.y || (door.y === c.y && Random.Int$int(2) === 0)) {
            closestY = (this.top_ + 6) | 0;
          } else {
            closestY = (this.bottom_ - 7) | 0;
          }
          if (door.x === this.left_) {
            Painter.drawLine(level, new Point()._Point$int$int((door.x + 1) | 0, door.y), new Point()._Point$int$int((door.x + 1) | 0, closestY), Terrain.EMPTY);
          } else {
            Painter.drawLine(level, new Point()._Point$int$int((door.x - 1) | 0, door.y), new Point()._Point$int$int((door.x - 1) | 0, closestY), Terrain.EMPTY);
          }
        }
      }
    }
  }
}

$J.define(VaultHallwayRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultHallwayRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLongRoom', ctors: { '': '_VaultHallwayRoom' } });
$J.module(() => {
  VaultDM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM100');
  VaultSkeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultSkeleton');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
