// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultMultipleEnemyTreasureRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let VaultGhoul, Heap$Type, Terrain, Painter, Room$Door$Type, GameMath, PathFinder, Random;

export class VaultMultipleEnemyTreasureRoom extends VaultTreasureRoom {
  _VaultMultipleEnemyTreasureRoom(): this {
    this._VaultTreasureRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.REGULAR);
    let c = this.center();
    let treasurePos: number;
    if (entrance.x === this.left_ || entrance.x === this.right_) {
      let areaTop = $J.d2i(GameMath.gate(Math.fround((this.top_ + 1) | 0), Math.fround((entrance.y - 2) | 0), Math.fround((this.bottom_ - 5) | 0)));
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (areaTop + 1) | 0, 9, 3, Terrain.EMPTY_SP);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, areaTop, 3, 5, Terrain.EMPTY_SP);
      let ghoul = new VaultGhoul()._VaultGhoul();
      ghoul.maxLvl = 0;
      ghoul.pos = (c.x + Math.imul(areaTop, level.width())) | 0;
      level.mobs.add(ghoul);
      ghoul = new VaultGhoul()._VaultGhoul();
      ghoul.maxLvl = 0;
      ghoul.pos = (c.x + Math.imul(((areaTop + 4) | 0), level.width())) | 0;
      level.mobs.add(ghoul);
      ghoul = new VaultGhoul()._VaultGhoul();
      if (entrance.x === this.left_) {
        ghoul.pos = (c.x + 1 + Math.imul(((areaTop + 2) | 0), level.width())) | 0;
        treasurePos = (ghoul.pos + 2) | 0;
      } else {
        ghoul.pos = (c.x - 1 + Math.imul(((areaTop + 2) | 0), level.width())) | 0;
        treasurePos = (ghoul.pos - 2) | 0;
      }
      level.mobs.add(ghoul);
    } else {
      let areaLeft = $J.d2i(GameMath.gate(Math.fround((this.left_ + 1) | 0), Math.fround((entrance.x - 2) | 0), Math.fround((this.right_ - 5) | 0)));
      Painter.fill$Level$int$int$int$int$int(level, (areaLeft + 1) | 0, (this.top_ + 1) | 0, 3, 9, Terrain.EMPTY_SP);
      Painter.fill$Level$int$int$int$int$int(level, areaLeft, (this.top_ + 4) | 0, 5, 3, Terrain.EMPTY_SP);
      let ghoul = new VaultGhoul()._VaultGhoul();
      ghoul.maxLvl = 0;
      ghoul.pos = (areaLeft + Math.imul(c.y, level.width())) | 0;
      level.mobs.add(ghoul);
      ghoul = new VaultGhoul()._VaultGhoul();
      ghoul.maxLvl = 0;
      ghoul.pos = (areaLeft + 4 + Math.imul(c.y, level.width())) | 0;
      level.mobs.add(ghoul);
      ghoul = new VaultGhoul()._VaultGhoul();
      if (entrance.y === this.top_) {
        ghoul.pos = (areaLeft + 2 + Math.imul(((c.y + 1) | 0), level.width())) | 0;
        treasurePos = (ghoul.pos + Math.imul(2, level.width())) | 0;
      } else {
        ghoul.pos = (areaLeft + 2 + Math.imul(((c.y - 1) | 0), level.width())) | 0;
        treasurePos = (ghoul.pos - Math.imul(2, level.width())) | 0;
      }
      level.mobs.add(ghoul);
    }
    Painter.set$Level$int$int(level, treasurePos, Terrain.PEDESTAL);
    let treasureItem = (level).createEquipment(3);
    level.drop(treasureItem, treasurePos).type_ = Heap$Type.CHEST;
    let i: number;
    do {
      i = PathFinder.NEIGHBOURS8[Random.Int$int(PathFinder.NEIGHBOURS8.length)];
    } while ((level.map_[(treasurePos + i) | 0]) === Terrain.WALL);
    treasureItem = (level).createConsumabe(3);
    level.drop(treasureItem, (treasurePos + i) | 0);
  }
  canConnect$Point(p: Point): boolean {
    let c = this.center();
    return ((Math.abs((c.x - p.x) | 0)) <= 3 || (Math.abs((c.y - p.y) | 0)) <= 3) && super.canConnect$Point(p);
  }
}

$J.define(VaultMultipleEnemyTreasureRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultMultipleEnemyTreasureRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultMultipleEnemyTreasureRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  VaultGhoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultGhoul');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
