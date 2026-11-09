// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Fury.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Buff$buffType, BuffIndicator;

export class Fury extends Buff {
  static LEVEL: number = 0;
  _Fury(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  act(): boolean {
    if (Math.fround(this.target.HP) > Math.fround(this.target.HT * Fury.LEVEL)) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  icon(): number {
    return BuffIndicator.FURY;
  }
  static $clinit() {
    Fury.LEVEL = 0.5;
  }
}

$J.define(Fury, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Fury', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Fury' }, clinit: true, lazy: ['LEVEL'] });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
