// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultSingleEnemyTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Heap$Type, Terrain, VaultLevel, Painter, Room$Door$Type, PathFinder, Random, Reflection;

export class VaultSingleEnemyTreasureRoom extends VaultTreasureRoom {
  _VaultSingleEnemyTreasureRoom(): this {
    this._VaultTreasureRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.EMPTY);
    Painter.drawInside(level, this, this.entrance(), 3, Terrain.EMPTY);
    let enemy = Reflection.newInstance(Random.oneOf(VaultLevel.T2Mobs));
    enemy.pos = level.pointToCell(this.center());
    level.mobs.add(enemy);
    let treasurePos: number;
    if (this.entrance().x === this.left_) {
      treasurePos = (enemy.pos + 2) | 0;
      enemy.pos = (enemy.pos + 1) | 0;
    } else if (this.entrance().y === this.top_) {
      treasurePos = (enemy.pos + Math.imul(2, level.width())) | 0;
      enemy.pos = (enemy.pos + level.width()) | 0;
    } else if (this.entrance().x === this.right_) {
      treasurePos = (enemy.pos - 2) | 0;
      enemy.pos = (enemy.pos - 1) | 0;
    } else {
      treasurePos = (enemy.pos - Math.imul(2, level.width())) | 0;
      enemy.pos = (enemy.pos - level.width()) | 0;
    }
    let treasureItem = (level).createEquipment(2);
    level.drop(treasureItem, treasurePos).type_ = Heap$Type.CHEST;
    let i: number;
    do {
      i = PathFinder.NEIGHBOURS4[Random.Int$int(PathFinder.NEIGHBOURS4.length)];
    } while ((level.map_[(treasurePos + i) | 0]) === Terrain.WALL || ((treasurePos + i) | 0) === enemy.pos);
    treasureItem = (level).createConsumabe(2);
    level.drop(treasureItem, (treasurePos + i) | 0);
    this.entrance().set$Type(Room$Door$Type.REGULAR);
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canConnect$Point(p: Point): boolean {
    let c = this.center();
    return ((Math.abs((c.x - p.x) | 0)) <= 2 || (Math.abs((c.y - p.y) | 0)) <= 2) && super.canConnect$Point(p);
  }
}

$J.define(VaultSingleEnemyTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultSingleEnemyTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultSingleEnemyTreasureRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
