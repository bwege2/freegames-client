// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Terror.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Terror extends FlavourBuff {
  object: number = 0;
  static readonly OBJECT: string = 'object';
  static readonly DURATION: number = 20;
  ignoreNextHit: boolean = false;
  _Terror(): this {
    this._FlavourBuff();
    this.object = 0;
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    this.ignoreNextHit = false;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Terror.OBJECT, this.object);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(Terror.OBJECT);
  }
  icon(): number {
    return BuffIndicator.TERROR;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Terror.DURATION - this.visualcooldown())) / Terror.DURATION));
  }
  recover(): void {
    if (this.ignoreNextHit) {
      this.ignoreNextHit = false;
      return;
    }
    this.spend(Math.fround(-5));
    if (this.cooldown() <= Math.fround(0)) {
      this.detach();
    }
  }
}

$J.define(Terror, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Terror' } });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
