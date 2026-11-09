// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Paralysis.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from './Buff.ts';

let Dungeon, Actor, Buff$buffType, Messages, CharSprite, CharSprite$State, BuffIndicator, Random;

export class Paralysis extends FlavourBuff {
  static readonly DURATION: number = 10;
  _Paralysis(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.paralysed++;
      return true;
    } else {
      return false;
    }
  }
  processDamage(damage: number): void {
    if (this.target == null) {
      return;
    }
    let resist = this.target.buff($J.cls(Paralysis$ParalysisResist));
    if (resist == null) {
      resist = Buff.affect$Char$Class(this.target, $J.cls(Paralysis$ParalysisResist));
    }
    resist.damage_ = (resist.damage_ + damage) | 0;
    if (Random.NormalIntRange(0, resist.damage_) >= Random.NormalIntRange(0, this.target.HP)) {
      if (Dungeon.level.heroFOV[this.target.pos]) {
        this.target.sprite_.showStatus(CharSprite.NEUTRAL, Messages.get$Object$String$ObjectArr(this, 'out', []), []);
      }
      this.detach();
    }
  }
  detach(): void {
    super.detach();
    if (this.target.paralysed > 0) {
      this.target.paralysed--;
    }
  }
  icon(): number {
    return BuffIndicator.PARALYSIS;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Paralysis.DURATION - this.visualcooldown())) / Paralysis.DURATION));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.PARALYSED);
    } else if (this.target.paralysed <= 1) {
      this.target.sprite_.remove$State(CharSprite$State.PARALYSED);
    }
  }
}

export class Paralysis$ParalysisResist extends Buff {
  damage_: number = 0;
  static readonly DAMAGE: string = 'damage';
  _Paralysis$ParalysisResist(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  act(): boolean {
    if (this.target.buff($J.cls(Paralysis)) == null) {
      this.damage_ = $J.d2i(this.damage_ - Math.ceil(Math.fround(this.damage_ / 10)));
      if (this.damage_ <= 0) {
        this.detach();
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Paralysis$ParalysisResist.DAMAGE, this.damage_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.damage_ = bundle.getInt(Paralysis$ParalysisResist.DAMAGE);
  }
}

$J.define(Paralysis, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Paralysis' } });
$J.define(Paralysis$ParalysisResist, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis$ParalysisResist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Paralysis$ParalysisResist' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Random = $J.load('com.watabou.utils.Random');
});
