// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MagicalSleep.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Char$Alignment, Sleep, Hero, Mob, Messages, CharSprite$State, BuffIndicator, GLog;

export class MagicalSleep extends Buff {
  static readonly STEP: number = 1;
  _MagicalSleep(): this {
    this._Buff();
    return this;
  }
  attachTo(target: Char): boolean {
    if (!target.isImmune($J.cls(Sleep)) && super.attachTo(target)) {
      target.paralysed++;
      if (target.alignment === Char$Alignment.ALLY) {
        if (target.HP === target.HT) {
          if (target instanceof Hero) {
            GLog.i(Messages.get$Object$String$ObjectArr(this, 'toohealthy', []), []);
          }
          this.detach();
          return true;
        } else {
          if (target instanceof Hero) {
            GLog.i(Messages.get$Object$String$ObjectArr(this, 'fallasleep', []), []);
          }
        }
      }
      if (target instanceof Mob) {
        (target).state_ = (target).SLEEPING;
      }
      return true;
    } else {
      return false;
    }
  }
  act(): boolean {
    if (this.target instanceof Mob && (this.target).state_ !== (this.target).SLEEPING) {
      this.detach();
      return true;
    }
    if (this.target.alignment === Char$Alignment.ALLY) {
      this.target.HP = Math.min((this.target.HP + 1) | 0, this.target.HT);
      if (this.target instanceof Hero) {
        (this.target).resting = true;
      }
      if (this.target.HP === this.target.HT) {
        if (this.target instanceof Hero) {
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'wakeup', []), []);
        }
        this.detach();
      }
    }
    this.spend(MagicalSleep.STEP);
    return true;
  }
  detach(): void {
    if (this.target.paralysed > 0) {
      this.target.paralysed--;
    }
    if (this.target instanceof Hero) {
      (this.target).resting = false;
    } else if (this.target instanceof Mob && this.target.alignment === Char$Alignment.ALLY && (this.target).state_ === (this.target).SLEEPING) {
      (this.target).state_ = (this.target).WANDERING;
    }
    super.detach();
  }
  icon(): number {
    return BuffIndicator.MAGIC_SLEEP;
  }
  fx(on: boolean): void {
    if (!on && (this.target.paralysed <= 1)) {
      this.target.sprite_.remove$State(CharSprite$State.PARALYSED);
    }
  }
}

$J.define(MagicalSleep, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSleep', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_MagicalSleep' } });
$J.module(() => {
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
