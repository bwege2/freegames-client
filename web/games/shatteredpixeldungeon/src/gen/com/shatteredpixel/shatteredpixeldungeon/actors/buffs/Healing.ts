// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Healing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Buff$buffType, Hero, FloatingText, VialOfBlood, Messages, CharSprite, CharSprite$State, BuffIndicator, GameMath;

export class Healing extends Buff {
  healingLeft: number = 0;
  percentHealPerTick: number = 0;
  flatHealPerTick: number = 0;
  bloodVialLimitingLevel: number = 0;
  static readonly LEFT: string = 'left';
  static readonly PERCENT: string = 'percent';
  static readonly FLAT: string = 'flat';
  static readonly VIAL_LEVEL: string = 'vial_level';
  _Healing(): this {
    this._Buff();
    this.bloodVialLimitingLevel = -1;
    this.actPriority = (Actor.HERO_PRIO - 1) | 0;
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  act(): boolean {
    if (this.target.HP < this.target.HT) {
      this.target.HP = Math.min(this.target.HT, (this.target.HP + this.healingThisTick()) | 0);
      if (this.target.HP === this.target.HT && this.target instanceof Hero) {
        (this.target).resting = false;
      }
    }
    this.target.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(this.healingThisTick()), FloatingText.HEALING, []);
    this.healingLeft = (this.healingLeft - this.healingThisTick()) | 0;
    if (this.healingLeft <= 0) {
      if (this.target instanceof Hero) {
        (this.target).resting = false;
      }
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  healingThisTick(): number {
    let heal = $J.d2i(GameMath.gate(1, Math.fround(($J.roundf(Math.fround(this.healingLeft * this.percentHealPerTick)) + this.flatHealPerTick) | 0), Math.fround(this.healingLeft)));
    if (this.bloodVialLimitingLevel !== -1 && heal > VialOfBlood.maxHealPerTurn$int(this.bloodVialLimitingLevel)) {
      heal = VialOfBlood.maxHealPerTurn$int(this.bloodVialLimitingLevel);
    }
    return heal;
  }
  setHeal$int$float$int(amount: number, percentPerTick: number, flatPerTick: number): void {
    this.setHeal$int$float$int$boolean(amount, percentPerTick, flatPerTick, false);
  }
  setHeal$int$float$int$boolean(amount: number, percentPerTick: number, flatPerTick: number, applyVialEffect: boolean): void {
    if (applyVialEffect && VialOfBlood.delayBurstHealing()) {
      amount = $J.roundf(Math.fround(amount * VialOfBlood.totalHealMultiplier$()));
      this.bloodVialLimitingLevel = VialOfBlood.bloodVialLevel();
    } else {
      this.bloodVialLimitingLevel = -1;
    }
    this.healingLeft = Math.max(this.healingLeft, amount);
    this.percentHealPerTick = Math.max(this.percentHealPerTick, percentPerTick);
    this.flatHealPerTick = Math.max(this.flatHealPerTick, flatPerTick);
  }
  increaseHeal(amount: number): void {
    this.healingLeft = (this.healingLeft + amount) | 0;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.HEALING);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.HEALING);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Healing.LEFT, this.healingLeft);
    bundle.put$String$float(Healing.PERCENT, this.percentHealPerTick);
    bundle.put$String$int(Healing.FLAT, this.flatHealPerTick);
    bundle.put$String$int(Healing.VIAL_LEVEL, this.bloodVialLimitingLevel);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.healingLeft = bundle.getInt(Healing.LEFT);
    this.percentHealPerTick = bundle.getFloat(Healing.PERCENT);
    this.flatHealPerTick = bundle.getInt(Healing.FLAT);
    if (bundle.contains(Healing.VIAL_LEVEL)) {
      this.bloodVialLimitingLevel = bundle.getInt(Healing.VIAL_LEVEL);
    }
  }
  icon(): number {
    return BuffIndicator.HEALING;
  }
  iconTextDisplay(): string {
    return String(this.healingLeft);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.healingThisTick(), this.healingLeft]);
  }
}

$J.define(Healing, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Healing' }, meths: { 'setHeal(int,float,int,boolean)': 'setHeal$int$float$int$boolean', 'setHeal(int,float,int)': 'setHeal$int$float$int' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  VialOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.VialOfBlood');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
