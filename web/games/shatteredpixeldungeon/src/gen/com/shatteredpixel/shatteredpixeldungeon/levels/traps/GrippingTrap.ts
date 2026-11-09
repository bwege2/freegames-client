// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/GrippingTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Bleeding, Buff, Cripple, Mob, Wound, Trap$HazardAssistTracker;

export class GrippingTrap extends Trap {
  _GrippingTrap(): this {
    this._Trap();
    this.color_ = Trap.GREY;
    this.shape = Trap.DOTS;
    this.disarmedByActivation = false;
    this.avoidsClosedSpaces = true;
    return this;
  }
  activate(): void {
    let c = Actor.findChar(this.pos);
    if (c != null && !c.flying) {
      if (c instanceof Mob) {
        Buff.prolong(c, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
      let damage = Math.max(0, (2 + $J.idiv(this.scalingDepth(), 2) - $J.idiv(c.drRoll(), 2)) | 0);
      Buff.affect$Char$Class(c, $J.cls(Bleeding)).set$float(Math.fround(damage));
      Buff.prolong(c, $J.cls(Cripple), Cripple.DURATION);
      Wound.hit$Char(c);
    } else {
      Wound.hit$int(this.pos);
    }
  }
}

$J.define(GrippingTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrippingTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_GrippingTrap' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Wound = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Wound');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
});
