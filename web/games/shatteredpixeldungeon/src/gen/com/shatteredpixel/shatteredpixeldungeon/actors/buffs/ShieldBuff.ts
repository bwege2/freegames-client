// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ShieldBuff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Hunger, Hero, Talent, Talent$ProvokedAngerTracker;

export class ShieldBuff extends Buff {
  shielding_: number = 0;
  shieldUsePriority: number = 0;
  detachesAtZero: boolean = false;
  static readonly SHIELDING: string = 'shielding';
  _ShieldBuff(): this {
    this._Buff();
    this.shieldUsePriority = 0;
    this.detachesAtZero = true;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.needsShieldUpdate = true;
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    this.target.needsShieldUpdate = true;
    super.detach();
  }
  shielding(): number {
    return this.shielding_;
  }
  setShield(shield: number): void {
    if (this.shielding_ <= shield) {
      this.shielding_ = shield;
    }
    if (this.target != null) {
      this.target.needsShieldUpdate = true;
    }
  }
  incShield$(): void {
    this.incShield$int(1);
  }
  incShield$int(amt: number): void {
    this.shielding_ = (this.shielding_ + amt) | 0;
    if (this.target != null) {
      this.target.needsShieldUpdate = true;
    }
  }
  delay(value: number): void {
    this.spend(value);
  }
  decShield$(): void {
    this.decShield$int(1);
  }
  decShield$int(amt: number): void {
    this.shielding_ = (this.shielding_ - amt) | 0;
    if (this.target != null) {
      this.target.needsShieldUpdate = true;
    }
  }
  absorbDamage(dmg: number): number {
    if (this.shielding_ >= dmg) {
      this.shielding_ = (this.shielding_ - dmg) | 0;
      dmg = 0;
    } else {
      dmg = (dmg - this.shielding_) | 0;
      this.shielding_ = 0;
    }
    if (this.shielding_ <= 0 && this.detachesAtZero) {
      this.detach();
    }
    if (this.target != null) {
      this.target.needsShieldUpdate = true;
    }
    return dmg;
  }
  static processDamage(target: Char, damage: number, src: any): number {
    if (src instanceof Hunger) {
      return damage;
    }
    let buffs = new ArrayList(target.buffs$Class($J.cls(ShieldBuff)));
    if (!buffs.isEmpty()) {
      Collections.sort(buffs, (a, b) => {
        return (b.shieldUsePriority - a.shieldUsePriority) | 0;
      });
      for (const $it0 = buffs.iterator(); $it0.hasNext(); ) {
        let buff = $it0.next();
        if (buff.shielding() <= 0) {
          continue;
        }
        damage = buff.absorbDamage(damage);
        if (buff.shielding() <= 0) {
          if (target instanceof Hero && (target).hasTalent(Talent.PROVOKED_ANGER)) {
            Buff.affect$Char$Class$float(target, $J.cls(Talent$ProvokedAngerTracker), 5);
          }
        }
        if (damage === 0) {
          break;
        }
      }
    }
    return damage;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ShieldBuff.SHIELDING, this.shielding_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.shielding_ = bundle.getInt(ShieldBuff.SHIELDING);
  }
}

$J.define(ShieldBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ShieldBuff' }, meths: { 'decShield(int)': 'decShield$int', 'decShield()': 'decShield$', 'incShield(int)': 'incShield$int', 'incShield()': 'incShield$' } });
$J.module(() => {
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$ProvokedAngerTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$ProvokedAngerTracker');
});
