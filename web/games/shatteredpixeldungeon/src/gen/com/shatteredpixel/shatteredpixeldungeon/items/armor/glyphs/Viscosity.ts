// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Viscosity.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Armor$Glyph } from '../Armor.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Badges, Dungeon, Actor, Buff$buffType, Talent$WarriorFoodImmunity, Messages, CharSprite, ItemSprite$Glowing, BuffIndicator, GLog;

export class Viscosity extends Armor$Glyph {
  static PURPLE: ItemSprite$Glowing = null;
  _Viscosity(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    Buff.affect$Char$Class(defender, $J.cls(Viscosity$ViscosityTracker)).level_ = armor.buffedLvl();
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Viscosity.PURPLE;
  }
  static $clinit() {
    Viscosity.PURPLE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(8930508);
  }
}

export class Viscosity$ViscosityTracker extends Buff {
  level_: number = 0;
  _Viscosity$ViscosityTracker(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    this.level_ = 0;
    return this;
  }
  deferDamage(dmg: number): number {
    if (this.target.buff($J.cls(Talent$WarriorFoodImmunity)) != null) {
      return dmg;
    }
    let level = Math.max(0, this.level_);
    let percent = Math.fround(((level + 1) | 0) / Math.fround(((level + 6) | 0)));
    percent = Math.fround(percent * Armor$Glyph.genericProcChanceMultiplier(this.target));
    let amount: number;
    if (percent > 1) {
      dmg = $J.roundf(Math.fround(dmg / percent));
      amount = dmg;
    } else {
      amount = $J.d2i(Math.ceil(Math.fround(dmg * percent)));
    }
    if (amount > 0) {
      let deferred = Buff.affect$Char$Class(this.target, $J.cls(Viscosity$DeferedDamage));
      deferred.extend(Math.fround(amount));
      this.target.sprite_.showStatus(CharSprite.WARNING, Messages.get$Class$String$ObjectArr($J.cls(Viscosity), 'deferred', [amount]), []);
    }
    return (dmg - amount) | 0;
  }
  act(): boolean {
    this.detach();
    return true;
  }
}

export class Viscosity$DeferedDamage extends Buff {
  damage_: number = 0;
  static readonly DAMAGE: string = 'damage';
  _Viscosity$DeferedDamage(): this {
    this._Buff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.damage_ = 0;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Viscosity$DeferedDamage.DAMAGE, this.damage_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.damage_ = bundle.getInt(Viscosity$DeferedDamage.DAMAGE);
  }
  extend(damage: number): void {
    if (this.damage_ === 0) {
      this.postpone(Actor.TICK);
    }
    this.damage_ = $J.d2i(Math.fround(this.damage_ + damage));
    if (this.target != null) {
      this.target.needsIncomingDOTUpdate = true;
    }
  }
  icon(): number {
    return BuffIndicator.DEFERRED;
  }
  iconTextDisplay(): string {
    return String(this.damage_);
  }
  act(): boolean {
    if (this.target.isAlive()) {
      let damageThisTick = Math.max(1, $J.d2i((Math.fround(this.damage_ * Math.fround(0.1)))));
      this.target.damage(damageThisTick, this);
      if (this.target === Dungeon.hero && !this.target.isAlive()) {
        Badges.validateDeathFromFriendlyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
      }
      this.spend(Actor.TICK);
      this.damage_ = (this.damage_ - damageThisTick) | 0;
      if (this.damage_ <= 0) {
        this.detach();
      }
    } else {
      this.detach();
    }
    this.target.needsIncomingDOTUpdate = true;
    return true;
  }
  detach(): void {
    this.target.needsIncomingDOTUpdate = true;
    super.detach();
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.damage_]);
  }
  totalIncomingDMG(): number {
    return this.damage_;
  }
}

$J.define(Viscosity, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Viscosity' }, clinit: true, lazy: ['PURPLE'] });
$J.define(Viscosity$ViscosityTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$ViscosityTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Viscosity$ViscosityTracker' } });
$J.define(Viscosity$DeferedDamage, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$DeferedDamage', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Viscosity$DeferedDamage' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent$WarriorFoodImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$WarriorFoodImmunity');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
