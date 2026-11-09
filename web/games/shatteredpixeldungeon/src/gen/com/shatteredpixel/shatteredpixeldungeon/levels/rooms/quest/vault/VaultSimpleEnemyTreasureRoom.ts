// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultSimpleEnemyTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Elemental, Heap$Type, Terrain, VaultLevel, Painter, Room$Door$Type, Point, Random;

export class VaultSimpleEnemyTreasureRoom extends VaultRoom {
  _VaultSimpleEnemyTreasureRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let enemyPos = 0;
    let treasurePos = 0;
    switch (Random.Int$int(4)) {
      case 0:
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 2) | 0, (this.top_ + 2) | 0, 6, 6, Terrain.WALL);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 3) | 0, 4, 4, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, (this.top_ + 7) | 0, 2, 1, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 7) | 0, (this.top_ + 4) | 0, 1, 2, Terrain.EMPTY_SP);
        enemyPos = level.pointToCell(new Point()._Point$int$int((this.left_ + 4) | 0, (this.top_ + 4) | 0));
        treasurePos = level.pointToCell(new Point()._Point$int$int((this.left_ + 3) | 0, (this.top_ + 3) | 0));
        break;
      case 1:
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 2) | 0, 6, 6, Terrain.WALL);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, (this.top_ + 3) | 0, 4, 4, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 5) | 0, (this.top_ + 7) | 0, 2, 1, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 4) | 0, 1, 2, Terrain.EMPTY_SP);
        enemyPos = level.pointToCell(new Point()._Point$int$int((this.right_ - 4) | 0, (this.top_ + 4) | 0));
        treasurePos = level.pointToCell(new Point()._Point$int$int((this.right_ - 3) | 0, (this.top_ + 3) | 0));
        break;
      case 2:
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 3) | 0, 6, 6, Terrain.WALL);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, (this.top_ + 4) | 0, 4, 4, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 5) | 0, (this.top_ + 3) | 0, 2, 1, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 5) | 0, 1, 2, Terrain.EMPTY_SP);
        enemyPos = level.pointToCell(new Point()._Point$int$int((this.right_ - 4) | 0, (this.bottom_ - 4) | 0));
        treasurePos = level.pointToCell(new Point()._Point$int$int((this.right_ - 3) | 0, (this.bottom_ - 3) | 0));
        break;
      case 3:
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 2) | 0, (this.top_ + 3) | 0, 6, 6, Terrain.WALL);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 4) | 0, 4, 4, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, (this.top_ + 3) | 0, 2, 1, Terrain.EMPTY_SP);
        Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 7) | 0, (this.top_ + 5) | 0, 1, 2, Terrain.EMPTY_SP);
        enemyPos = level.pointToCell(new Point()._Point$int$int((this.left_ + 4) | 0, (this.bottom_ - 4) | 0));
        treasurePos = level.pointToCell(new Point()._Point$int$int((this.left_ + 3) | 0, (this.bottom_ - 3) | 0));
        break;
    }
    let enemy: Mob;
    let toReturn = new ArrayList();
    let valid = true;
    do {
      enemy = level.createMob();
      valid = true;
      for (let cls of VaultLevel.T1Mobs) {
        if ($J.equals(cls, enemy.getClass())) {
          valid = false;
          toReturn.add(enemy.getClass());
        }
      }
    } while (!valid);
    for (const $it0 = toReturn.iterator(); $it0.hasNext(); ) {
      let cls = $it0.next();
      (level).returnMob(cls);
    }
    let tier = 2;
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
    level.drop(treasure, treasurePos).type_ = Heap$Type.CHEST;
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    enemy.pos = enemyPos;
    level.mobs.add(enemy);
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

$J.define(VaultSimpleEnemyTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultSimpleEnemyTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultSimpleEnemyTreasureRoom' } });
$J.module(() => {
  Elemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
