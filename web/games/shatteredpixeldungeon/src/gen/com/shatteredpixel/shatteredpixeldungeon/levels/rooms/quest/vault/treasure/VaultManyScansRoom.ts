// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/treasure/VaultManyScansRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../../jre/index.ts';
import { VaultTreasureRoom } from './VaultTreasureRoom.ts';

let VaultSentry, Heap$Type, PotionOfInvisibility, DwarfToken, Terrain, Painter, Room$Door$Type, PathFinder, Random;

export class VaultManyScansRoom extends VaultTreasureRoom {
  _VaultManyScansRoom(): this {
    this._VaultTreasureRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    let corners = new ArrayList();
    let w = level.width();
    let c = this.center();
    corners.add((this.left_ + 1 + Math.imul(w, ((this.top_ + 1) | 0))) | 0);
    corners.add((c.x + Math.imul(w, ((this.top_ + 1) | 0))) | 0);
    corners.add((this.right_ - 1 + Math.imul(w, ((this.top_ + 1) | 0))) | 0);
    corners.add((this.left_ + 1 + Math.imul(w, (c.y))) | 0);
    corners.add((this.right_ - 1 + Math.imul(w, (c.y))) | 0);
    corners.add((this.left_ + 1 + Math.imul(w, ((this.bottom_ - 1) | 0))) | 0);
    corners.add((c.x + Math.imul(w, ((this.bottom_ - 1) | 0))) | 0);
    corners.add((this.right_ - 1 + Math.imul(w, ((this.bottom_ - 1) | 0))) | 0);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.REGULAR);
    for (const $it0 = corners.iterator(); $it0.hasNext(); ) {
      let cell = $it0.next();
      if (level.trueDistance(cell, level.pointToCell(entrance)) >= Math.fround(2)) {
        let sentry = new VaultSentry()._VaultSentry();
        sentry.pos = cell;
        sentry.scanLength = 7;
        sentry.scanWidth = 70;
        sentry.scanDirs = [[(c.x + Math.imul(w, c.y)) | 0]];
        level.mobs.add(sentry);
      }
    }
    Painter.set$Level$Point$int(level, c, Terrain.PEDESTAL);
    let treasureItem = (level).createEquipment(3);
    level.drop(treasureItem, (c.x + Math.imul(w, c.y)) | 0).type_ = Heap$Type.CHEST;
    treasureItem = (level).createConsumabe(3);
    level.drop(treasureItem, (c.x + Math.imul(w, c.y) + PathFinder.NEIGHBOURS8[Random.Int$int(PathFinder.NEIGHBOURS8.length)]) | 0);
    level.drop(new DwarfToken()._DwarfToken(), (c.x + Math.imul(w, c.y) + PathFinder.NEIGHBOURS8[Random.Int$int(PathFinder.NEIGHBOURS8.length)]) | 0);
    level.addItemToSpawn(new PotionOfInvisibility()._PotionOfInvisibility());
  }
}

$J.define(VaultManyScansRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultManyScansRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.treasure.VaultTreasureRoom', ctors: { '': '_VaultManyScansRoom' } });
$J.module(() => {
  VaultSentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultSentry');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
