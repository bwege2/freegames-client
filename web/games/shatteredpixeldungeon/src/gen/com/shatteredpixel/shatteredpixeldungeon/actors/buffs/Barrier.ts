// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Barrier.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ShieldBuff } from './ShieldBuff.ts';

let Actor, Buff$buffType, HoldFast, Blocking$BlockBuff, Messages, CharSprite$State, BuffIndicator;

export class Barrier extends ShieldBuff {
  partialLostShield: number = 0;
  static readonly PARTIAL_LOST_SHIELD: string = 'partial_lost_shield';
  _Barrier(): this {
    this._ShieldBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  incShield$int(amt: number): void {
    super.incShield$int(amt);
    this.partialLostShield = 0;
  }
  setShield(shield: number): void {
    super.setShield(shield);
    if (this.shielding() === shield) {
      this.partialLostShield = 0;
    }
  }
  act(): boolean {
    this.partialLostShield = Math.fround(this.partialLostShield + Math.fround(Math.min(1, Math.fround(this.shielding() / 20)) * HoldFast.buffDecayFactor(this.target)));
    if (this.partialLostShield >= 1) {
      this.absorbDamage(1);
      this.partialLostShield = 0;
    }
    if (this.shielding() <= 0) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.SHIELDED);
    } else if (this.target.buff($J.cls(Blocking$BlockBuff)) == null) {
      this.target.sprite_.remove$State(CharSprite$State.SHIELDED);
    }
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0.5, 1, 2);
  }
  iconTextDisplay(): string {
    return String(this.shielding());
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.shielding()]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Barrier.PARTIAL_LOST_SHIELD, this.partialLostShield);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.partialLostShield = bundle.getFloat(Barrier.PARTIAL_LOST_SHIELD);
  }
}

$J.define(Barrier, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_Barrier' }, meths: { 'incShield(int)': 'incShield$int' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  HoldFast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast');
  Blocking$BlockBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking$BlockBuff');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
