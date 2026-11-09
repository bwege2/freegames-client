// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/CounterBuff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from './Buff.ts';

export class CounterBuff extends Buff {
  count_: number = 0;
  static readonly COUNT: string = 'count';
  _CounterBuff(): this {
    this._Buff();
    this.count_ = 0;
    return this;
  }
  countUp(inc: number): void {
    this.count_ = Math.fround(this.count_ + inc);
  }
  countDown(inc: number): void {
    this.count_ = Math.fround(this.count_ - inc);
  }
  count(): number {
    return this.count_;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(CounterBuff.COUNT, this.count_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.count_ = bundle.getFloat(CounterBuff.COUNT);
  }
}

$J.define(CounterBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_CounterBuff' } });
