// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultCrossRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let VaultSentry, Terrain, Painter, Room$Door$Type;

export class VaultCrossRoom extends VaultRoom {
  _VaultCrossRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int$int$int$int(level, this, 4, 1, 4, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int$int$int$int(level, this, 1, 4, 1, 4, Terrain.EMPTY);
    Painter.set$Level$Point$int(level, this.center(), Terrain.PEDESTAL);
    let sentry = new VaultSentry()._VaultSentry();
    sentry.pos = level.pointToCell(this.center());
    sentry.scanLength = 4;
    sentry.scanWidth = 90;
    sentry.afterScanCooldown = 3;
    sentry.scanDirs = [[(sentry.pos - 1) | 0], [(sentry.pos - level.width()) | 0], [(sentry.pos + 1) | 0], [(sentry.pos + level.width()) | 0]];
    level.mobs.add(sentry);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
  canConnect$Point(p: Point): boolean {
    let c = this.center();
    return ((Math.abs((c.x - p.x) | 0)) <= 1 || (Math.abs((c.y - p.y) | 0)) <= 1) && super.canConnect$Point(p);
  }
}

$J.define(VaultCrossRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultCrossRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultCrossRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.module(() => {
  VaultSentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultSentry');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
