// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/LostInventory.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff$buffType, Hero, BuffIndicator;

export class LostInventory extends Buff {
  _LostInventory(): this {
    this._Buff();
    this.type_ = Buff$buffType.NEGATIVE;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      if (target instanceof Hero && (target).belongings != null) {
        (target).belongings.lostInventory$boolean(true);
      }
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    super.detach();
    if (this.target instanceof Hero && (this.target).belongings != null) {
      (this.target).belongings.lostInventory$boolean(false);
    }
  }
  icon(): number {
    return BuffIndicator.NOINV;
  }
}

$J.define(LostInventory, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_LostInventory' } });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
