// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Corruption.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { AllyBuff } from './AllyBuff.ts';

let Actor, Buff$buffType, SoulMark, FloatingText, CharSprite, CharSprite$State, BuffIndicator;

export class Corruption extends AllyBuff {
  partialDamage: number = 0;
  static readonly PARTIAL_DAMAGE: string = 'partial_damage';
  _Corruption(): this {
    this._AllyBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    this.partialDamage = 0;
    return this;
  }
  static corruptionHeal(target: Char): void {
    target.HP = target.HT;
    target.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(target.HT), FloatingText.HEALING, []);
    for (const $it0 = target.buffs$().iterator(); $it0.hasNext(); ) {
      let buff = $it0.next();
      if (buff.type_ === Buff$buffType.NEGATIVE && !(buff instanceof SoulMark)) {
        buff.detach();
      }
    }
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.needsIncomingDOTUpdate = true;
      return true;
    }
    return false;
  }
  act(): boolean {
    this.partialDamage = Math.fround(this.partialDamage + Math.fround(this.target.HT / 100));
    let damage = $J.d2i(this.partialDamage);
    this.partialDamage = Math.fround(this.partialDamage - damage);
    if (damage > 0) {
      this.target.damage(damage, this);
    }
    this.spend(Actor.TICK);
    return true;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.DARKENED);
    } else if (this.target.invisible === 0) {
      this.target.sprite_.remove$State(CharSprite$State.DARKENED);
    }
  }
  icon(): number {
    return BuffIndicator.CORRUPT;
  }
  totalIncomingDMG(): number {
    return this.target.HT;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Corruption.PARTIAL_DAMAGE, this.partialDamage);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.partialDamage = Math.fround(bundle.getInt(Corruption.PARTIAL_DAMAGE));
  }
}

$J.define(Corruption, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff', ctors: { '': '_Corruption' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  SoulMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SoulMark');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
