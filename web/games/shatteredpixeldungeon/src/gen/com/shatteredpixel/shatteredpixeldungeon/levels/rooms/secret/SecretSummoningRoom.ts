// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretSummoningRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Generator, Heap$Type, TrapMechanism, Terrain, Painter, Room$Door$Type, SummoningTrap;

export class SecretSummoningRoom extends SecretRoom {
  _SecretSummoningRoom(): this {
    this._SecretRoom();
    return this;
  }
  maxWidth(): number {
    return 8;
  }
  maxHeight(): number {
    return 8;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.SECRET_TRAP);
    let center = this.center();
    level.drop(Generator.random$(), level.pointToCell(center)).setHauntedIfCursed().type_ = Heap$Type.SKELETON;
    let revealedChance = TrapMechanism.revealHiddenTrapChance$();
    let revealInc = 0;
    for (const $it0 = this.getPoints().iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      let cell = level.pointToCell(p);
      if (level.map_[cell] === Terrain.SECRET_TRAP) {
        revealInc = Math.fround(revealInc + revealedChance);
        if (revealInc >= Math.fround(1)) {
          level.setTrap(new SummoningTrap()._SummoningTrap().reveal(), cell);
          Painter.set$Level$int$int(level, cell, Terrain.TRAP);
          revealInc--;
        } else {
          level.setTrap(new SummoningTrap()._SummoningTrap().hide(), cell);
        }
      }
    }
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
}

$J.define(SecretSummoningRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretSummoningRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretSummoningRoom' } });
$J.module(() => {
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  TrapMechanism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrapMechanism');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
});
