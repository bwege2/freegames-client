// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/ExplosiveTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trap } from './Trap.ts';

let Badges, Dungeon, Actor, Buff, Mob, Bomb, Trap$HazardAssistTracker, PathFinder;

export class ExplosiveTrap extends Trap {
  _ExplosiveTrap(): this {
    this._Trap();
    this.color_ = Trap.ORANGE;
    this.shape = Trap.DIAMOND;
    return this;
  }
  activate(): void {
    for (let i of PathFinder.NEIGHBOURS9) {
      if ((Actor.findChar((this.pos + i) | 0)) instanceof Mob) {
        Buff.prolong(Actor.findChar((this.pos + i) | 0), $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
    }
    new Bomb()._Bomb().explode(this.pos);
    if (this.reclaimed && !Dungeon.hero.isAlive()) {
      Badges.validateDeathFromFriendlyMagic();
    }
  }
}

$J.define(ExplosiveTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.ExplosiveTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_ExplosiveTrap' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
