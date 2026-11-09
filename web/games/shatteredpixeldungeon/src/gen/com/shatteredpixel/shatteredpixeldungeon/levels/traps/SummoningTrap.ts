// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/SummoningTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Trap } from './Trap.ts';

let Dungeon, Actor, Char, Char$Property, ScrollOfTeleportation, Bestiary, GameScene, PathFinder, Random;

export class SummoningTrap extends Trap {
  static readonly DELAY: number = 2;
  _SummoningTrap(): this {
    this._Trap();
    this.color_ = Trap.TEAL;
    this.shape = Trap.WAVES;
    return this;
  }
  activate(): void {
    let nMobs = 1;
    if (Random.Int$int(2) === 0) {
      nMobs++;
      if (Random.Int$int(2) === 0) {
        nMobs++;
      }
    }
    let candidates = new ArrayList();
    for (let i = 0; i < PathFinder.NEIGHBOURS8.length; i++) {
      let p = (this.pos + PathFinder.NEIGHBOURS8[i]) | 0;
      if (Actor.findChar(p) == null && (Dungeon.level.passable[p] || Dungeon.level.avoid[p])) {
        candidates.add(p);
      }
    }
    let respawnPoints = new ArrayList();
    while (nMobs > 0 && candidates.size() > 0) {
      let index = Random.index(candidates);
      respawnPoints.add(candidates.removeAt(index));
      nMobs--;
    }
    let mobs = new ArrayList();
    for (const $it0 = respawnPoints.iterator(); $it0.hasNext(); ) {
      let point = $it0.next();
      let mob = Dungeon.level.createMob();
      while (Char.hasProp(mob, Char$Property.LARGE) && !Dungeon.level.openSpace[point]) {
        mob = Dungeon.level.createMob();
      }
      if (mob != null) {
        if (mob.state_ !== mob.PASSIVE) {
          mob.state_ = mob.WANDERING;
        }
        mob.pos = point;
        GameScene.add$Mob$float(mob, SummoningTrap.DELAY);
        mobs.add(mob);
      }
    }
    let t: Trap;
    for (const $it1 = mobs.iterator(); $it1.hasNext(); ) {
      let mob = $it1.next();
      if ((t = Dungeon.level.traps.get(mob.pos)) != null && t.active) {
        if (t.disarmedByActivation) {
          t.disarm();
        }
        t.reveal();
        Bestiary.setSeen(t.getClass());
        Bestiary.countEncounter(t.getClass());
        t.activate();
      }
      ScrollOfTeleportation.appear(mob, mob.pos);
      Dungeon.level.occupyCell(mob);
    }
  }
}

$J.define(SummoningTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_SummoningTrap' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
