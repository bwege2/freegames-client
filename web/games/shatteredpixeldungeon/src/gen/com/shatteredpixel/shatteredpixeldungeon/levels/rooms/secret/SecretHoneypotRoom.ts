// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretHoneypotRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { SecretRoom } from './SecretRoom.ts';

let Dungeon, Bee, Honeypot, Honeypot$ShatteredPot, Bomb, Terrain, Painter, Room$Door$Type;

export class SecretHoneypotRoom extends SecretRoom {
  _SecretHoneypotRoom(): this {
    this._SecretRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let brokenPotPos = this.center();
    brokenPotPos.x = $J.idiv(((brokenPotPos.x + this.entrance().x) | 0), 2);
    brokenPotPos.y = $J.idiv(((brokenPotPos.y + this.entrance().y) | 0), 2);
    let pot = new Honeypot$ShatteredPot()._Honeypot$ShatteredPot();
    level.drop(pot, level.pointToCell(brokenPotPos));
    let bee = new Bee()._Bee();
    bee.spawn(Dungeon.depth);
    bee.HP = bee.HT;
    bee.pos = level.pointToCell(brokenPotPos);
    level.mobs.add(bee);
    bee.setPotInfo(level.pointToCell(brokenPotPos), null);
    this.placeItem(new Honeypot()._Honeypot(), level);
    this.placeItem(new Bomb()._Bomb().random(), level);
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
  placeItem(item: Item, level: Level): void {
    let itemPos: number;
    do {
      itemPos = level.pointToCell(this.random$());
    } while (level.heaps.get(itemPos) != null);
    level.drop(item, itemPos);
  }
}

$J.define(SecretHoneypotRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretHoneypotRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretHoneypotRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  Honeypot$ShatteredPot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
});
