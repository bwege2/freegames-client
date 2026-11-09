// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/TimeStasis.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff, Buff$buffType, Hunger, CharSprite$State;

export class TimeStasis extends FlavourBuff {
  _TimeStasis(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.actPriority = (Actor.BUFF_PRIO - 3) | 0;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.invisible++;
      target.paralysed++;
      target.next();
      if (Dungeon.hero != null) {
        Dungeon.observe$();
      }
      return true;
    } else {
      return false;
    }
  }
  spend(time: number): void {
    super.spend(time);
    let hunger = Buff.affect$Char$Class(this.target, $J.cls(Hunger));
    if (hunger != null && !hunger.isStarving()) {
      hunger.affectHunger$float$boolean(this.cooldown(), true);
    }
  }
  detach(): void {
    if (this.target.invisible > 0) {
      this.target.invisible--;
    }
    if (this.target.paralysed > 0) {
      this.target.paralysed--;
    }
    super.detach();
    Dungeon.observe$();
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.PARALYSED);
    } else {
      if (this.target.paralysed === 0) {
        this.target.sprite_.remove$State(CharSprite$State.PARALYSED);
      }
      if (this.target.invisible === 0) {
        this.target.sprite_.remove$State(CharSprite$State.INVISIBLE);
      }
    }
  }
}

$J.define(TimeStasis, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.TimeStasis', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_TimeStasis' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
});
