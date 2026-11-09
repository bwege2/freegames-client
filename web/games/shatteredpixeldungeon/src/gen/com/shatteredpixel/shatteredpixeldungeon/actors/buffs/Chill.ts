// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Chill.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Buff$buffType, Burning, Messages, CharSprite$State, BuffIndicator;

export class Chill extends FlavourBuff {
  static readonly DURATION: number = 10;
  _Chill(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  attachTo(target: Char): boolean {
    Buff.detach(target, $J.cls(Burning));
    return super.attachTo(target);
  }
  speedFactor(): number {
    return Math.max(0.5, Math.fround(1 - Math.fround(this.cooldown() * Math.fround(0.1))));
  }
  icon(): number {
    return BuffIndicator.FROST;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Chill.DURATION - this.visualcooldown())) / Chill.DURATION));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.CHILLED);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.CHILLED);
    }
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$(), Messages.decimalFormat('#.##', Math.fround((Math.fround(1 - this.speedFactor())) * 100))]);
  }
}

$J.define(Chill, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Chill' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
