// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/secret/SecretHoardRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Gold, Terrain, Painter, Room$Door$Type, DisintegrationTrap, PoisonDartTrap, RockfallTrap, Random, Reflection;

export class SecretHoardRoom extends SecretRoom {
  _SecretHoardRoom(): this {
    this._SecretRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let trapClass: JClass<Trap>;
    if (Random.Int$int(2) === 0) {
      trapClass = $J.cls(RockfallTrap);
    } else if (Dungeon.depth >= 10) {
      trapClass = $J.cls(DisintegrationTrap);
    } else {
      trapClass = $J.cls(PoisonDartTrap);
    }
    let goldPos: number;
    let totalGold = $J.idiv((Math.imul(((this.width() - 2) | 0), ((this.height() - 2) | 0))), 2);
    let goldRatio = Math.fround(8 / Math.fround(totalGold));
    for (let i = 0; i < totalGold; i++) {
      do {
        goldPos = level.pointToCell(this.random$());
      } while (level.heaps.get(goldPos) != null);
      let gold = new Gold()._Gold$().random();
      gold.quantity$int($J.roundf(Math.fround(gold.quantity$() * goldRatio)));
      level.drop(gold, goldPos);
    }
    for (const $it0 = this.getPoints().iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      if (Random.Int$int(2) === 0 && level.map_[level.pointToCell(p)] === Terrain.EMPTY) {
        level.setTrap(Reflection.newInstance(trapClass).reveal(), level.pointToCell(p));
        Painter.set$Level$Point$int(level, p, Terrain.TRAP);
      }
    }
    this.entrance().set$Type(Room$Door$Type.HIDDEN);
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
}

$J.define(SecretHoardRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretHoardRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom', ctors: { '': '_SecretHoardRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  DisintegrationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap');
  PoisonDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PoisonDartTrap');
  RockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.RockfallTrap');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
