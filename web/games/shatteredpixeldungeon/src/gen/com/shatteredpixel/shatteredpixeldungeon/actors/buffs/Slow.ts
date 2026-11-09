// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Slow.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff$buffType, BuffIndicator;

export class Slow extends FlavourBuff {
  static readonly DURATION: number = 10;
  _Slow(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, Math.fround(0.33), Math.fround(0.2));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Slow.DURATION - this.visualcooldown())) / Slow.DURATION));
  }
}

$J.define(Slow, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Slow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Slow' } });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
