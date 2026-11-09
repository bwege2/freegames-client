// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/WarpingTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { TeleportationTrap } from './TeleportationTrap.ts';

let Dungeon, Trap, GameScene, BArray;

export class WarpingTrap extends TeleportationTrap {
  _WarpingTrap(): this {
    this._TeleportationTrap();
    this.color_ = Trap.TEAL;
    this.shape = Trap.STARS;
    return this;
  }
  activate(): void {
    if (Dungeon.level.distance(Dungeon.hero.pos, this.pos) <= 1) {
      BArray.setFalse(Dungeon.level.visited);
      BArray.setFalse(Dungeon.level.mapped);
    }
    super.activate();
    GameScene.updateFog$();
    Dungeon.observe$();
  }
}

$J.define(WarpingTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.WarpingTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.TeleportationTrap', ctors: { '': '_WarpingTrap' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Trap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BArray = $J.load('com.watabou.utils.BArray');
});
