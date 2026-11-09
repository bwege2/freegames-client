// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/WeakeningTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Char$Property, Buff, Weakness, Mob, CellEmitter, ShadowParticle, Trap$HazardAssistTracker;

export class WeakeningTrap extends Trap {
  _WeakeningTrap(): this {
    this._Trap();
    this.color_ = Trap.GREEN;
    this.shape = Trap.WAVES;
    return this;
  }
  activate(): void {
    if (Dungeon.level.heroFOV[this.pos]) {
      CellEmitter.get(this.pos).burst(ShadowParticle.UP, 5);
    }
    let ch = Actor.findChar(this.pos);
    if (ch != null) {
      if (ch.properties().contains(Char$Property.BOSS) || ch.properties().contains(Char$Property.MINIBOSS)) {
        Buff.prolong(ch, $J.cls(Weakness), Math.fround(Weakness.DURATION / 2));
      }
      Buff.prolong(ch, $J.cls(Weakness), Math.fround(Weakness.DURATION * 3));
      if (ch instanceof Mob) {
        Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
    }
  }
}

$J.define(WeakeningTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.WeakeningTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_WeakeningTrap' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
});
