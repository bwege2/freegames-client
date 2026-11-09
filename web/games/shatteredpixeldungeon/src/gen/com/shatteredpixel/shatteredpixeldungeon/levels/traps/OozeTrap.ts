// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/OozeTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff, Ooze, Mob, Splash, Trap$HazardAssistTracker, PathFinder;

export class OozeTrap extends Trap {
  _OozeTrap(): this {
    this._Trap();
    this.color_ = Trap.GREEN;
    this.shape = Trap.DOTS;
    return this;
  }
  activate(): void {
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.solid[(this.pos + i) | 0])) {
        Splash.at$int$int$int((this.pos + i) | 0, 0, 5);
        let ch = Actor.findChar((this.pos + i) | 0);
        if (ch != null && !ch.flying) {
          Buff.affect$Char$Class(ch, $J.cls(Ooze)).set(Ooze.DURATION);
          if (ch instanceof Mob) {
            Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
          }
        }
      }
    }
  }
}

$J.define(OozeTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.OozeTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_OozeTrap' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
