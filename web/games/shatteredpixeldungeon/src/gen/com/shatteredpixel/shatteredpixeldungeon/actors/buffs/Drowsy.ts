// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Drowsy.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from './FlavourBuff.ts';

let Buff, Buff$buffType, MagicalSleep, Sleep, BuffIndicator;

export class Drowsy extends FlavourBuff {
  static readonly DURATION: number = 5;
  _Drowsy(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEUTRAL;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.DROWSY;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Drowsy.DURATION - this.visualcooldown())) / Drowsy.DURATION));
  }
  attachTo(target: Char): boolean {
    if (!target.isImmune($J.cls(Sleep)) && super.attachTo(target)) {
      return true;
    }
    return false;
  }
  act(): boolean {
    Buff.affect$Char$Class(this.target, $J.cls(MagicalSleep));
    return super.act();
  }
}

$J.define(Drowsy, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Drowsy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Drowsy' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  MagicalSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSleep');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
