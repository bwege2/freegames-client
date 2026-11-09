// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultQuadrantsRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class VaultQuadrantsRoom extends VaultRoom {
  _VaultQuadrantsRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let c = this.center();
    Painter.drawInside(level, this, new Point()._Point$int$int(this.left_, c.y), 3, Terrain.WALL);
    Painter.drawInside(level, this, new Point()._Point$int$int(this.right_, c.y), 3, Terrain.WALL);
    Painter.drawInside(level, this, new Point()._Point$int$int(c.x, this.top_), 3, Terrain.WALL);
    Painter.drawInside(level, this, new Point()._Point$int$int(c.x, this.bottom_), 3, Terrain.WALL);
    Painter.set$Level$Point$int(level, c, Terrain.STATUE);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let spawnPositions = new ArrayList();
    spawnPositions.add(new Point()._Point$int$int((this.left_ + 2) | 0, (this.top_ + 2) | 0));
    spawnPositions.add(new Point()._Point$int$int((this.right_ - 2) | 0, (this.top_ + 2) | 0));
    spawnPositions.add(new Point()._Point$int$int((this.right_ - 2) | 0, (this.bottom_ - 2) | 0));
    spawnPositions.add(new Point()._Point$int$int((this.left_ + 2) | 0, (this.bottom_ - 2) | 0));
    for (let p of $J.toArrayInto(spawnPositions.toArray(), $J.newArray(0, null))) {
      for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
        let door = $it1.next();
        if (Point.distance(p, door) <= Math.fround(3)) {
          spawnPositions.remove(p);
        }
      }
    }
    if (!spawnPositions.isEmpty()) {
      let nextToEntry = false;
      for (const $it2 = this.connected_.keySet().iterator(); $it2.hasNext(); ) {
        let r = $it2.next();
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
      for (const $it3 = toReturn.iterator(); $it3.hasNext(); ) {
        let cls = $it3.next();
        (level).returnMob(cls);
      }
      let enemyCorner = Random.element$Collection(spawnPositions);
      enemy.pos = level.pointToCell(enemyCorner);
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
      let treasurePos = enemy.pos;
      if (enemyCorner.x < c.x) {
        treasurePos--;
      } else {
        treasurePos++;
      }
      if (enemyCorner.y < c.y) {
        treasurePos = (treasurePos - level.width()) | 0;
      } else {
        treasurePos = (treasurePos + level.width()) | 0;
      }
      level.drop(treasure, treasurePos).type_ = Heap$Type.CHEST;
    }
  }
  canConnect$Point(p: Point): boolean {
    let c = this.center();
    return c.x !== p.x && c.y !== p.y && super.canConnect$Point(p);
  }
}

$J.define(VaultQuadrantsRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultQuadrantsRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultQuadrantsRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
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
