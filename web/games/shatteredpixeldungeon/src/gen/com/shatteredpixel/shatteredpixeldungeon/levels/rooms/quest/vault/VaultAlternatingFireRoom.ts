// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultAlternatingFireRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { VaultRoom } from './VaultRoom.ts';

let Terrain, VaultLevel$VaultFlameTrap, Painter, Room$Door$Type;

export class VaultAlternatingFireRoom extends VaultRoom {
  _VaultAlternatingFireRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    let c = this.center();
    Painter.set$Level$Point$int(level, c, Terrain.PEDESTAL);
    let i = (level).createEquipment(0);
    if (i != null) {
      level.drop(i, level.pointToCell(c));
    }
    let cell: number;
    let alternate = false;
    for (let x = (this.left_ + 2) | 0; x <= ((this.right_ - 2) | 0); x++) {
      for (let y = (this.top_ + 2) | 0; y <= ((this.bottom_ - 2) | 0); y++) {
        cell = (x + Math.imul(y, level.width())) | 0;
        if (level.map_[cell] !== Terrain.PEDESTAL) {
          VaultLevel$VaultFlameTrap.setupTrap(level, cell, alternate ? 1 : 0, 2, 1);
        }
        alternate = !alternate;
      }
    }
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return super.canPlaceItem(p, l) && p.x === ((this.left_ + 1) | 0) || p.y === ((this.top_ + 1) | 0) || p.x === ((this.right_ - 1) | 0) || p.y === ((this.bottom_ - 1) | 0);
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return false;
  }
}

$J.define(VaultAlternatingFireRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultAlternatingFireRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultAlternatingFireRoom' } });
$J.module(() => {
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel$VaultFlameTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel$VaultFlameTrap');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
