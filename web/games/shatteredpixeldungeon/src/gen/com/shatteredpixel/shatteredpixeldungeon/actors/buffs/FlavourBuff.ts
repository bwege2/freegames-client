// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/FlavourBuff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Messages;

export class FlavourBuff extends Buff {
  _FlavourBuff(): this {
    this._Buff();
    return this;
  }
  act(): boolean {
    this.detach();
    return true;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$()]);
  }
  dispTurns$(): string {
    return this.dispTurns$float(this.visualcooldown());
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.visualcooldown()));
  }
}

$J.define(FlavourBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_FlavourBuff' }, meths: { 'dispTurns()': 'dispTurns$' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
