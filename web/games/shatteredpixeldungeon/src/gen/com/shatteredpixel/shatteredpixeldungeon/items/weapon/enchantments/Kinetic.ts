// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Kinetic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Weapon$Enchantment } from '../Weapon.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Actor, Buff$buffType, Messages, ItemSprite$Glowing, BuffIndicator;

export class Kinetic extends Weapon$Enchantment {
  static YELLOW: ItemSprite$Glowing = null;
  _Kinetic(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let conservedDamage = 0;
    if (attacker.buff($J.cls(Kinetic$ConservedDamage)) != null) {
      conservedDamage = attacker.buff($J.cls(Kinetic$ConservedDamage)).damageBonus();
    }
    Buff.affect$Char$Class(attacker, $J.cls(Kinetic$KineticTracker)).conservedDamage = conservedDamage;
    return (damage + conservedDamage) | 0;
  }
  glowing(): ItemSprite$Glowing {
    return Kinetic.YELLOW;
  }
  static $clinit() {
    Kinetic.YELLOW = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16776960);
  }
}

export class Kinetic$KineticTracker extends Buff {
  conservedDamage: number = 0;
  _Kinetic$KineticTracker(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    return this;
  }
  act(): boolean {
    this.detach();
    return true;
  }
}

export class Kinetic$ConservedDamage extends Buff {
  preservedDamage: number = 0;
  static readonly PRESERVED_DAMAGE: string = 'preserve_damage';
  _Kinetic$ConservedDamage(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.WEAPON;
  }
  tintIcon(icon: Image): void {
    if (this.preservedDamage >= Math.fround(10)) {
      icon.hardlight$float$float$float(1, 0, 0);
    } else if (this.preservedDamage >= Math.fround(5)) {
      icon.hardlight$float$float$float(1, Math.fround(1 - Math.fround((Math.fround(this.preservedDamage - 5)) * Math.fround(0.2))), 0);
    } else {
      icon.hardlight$float$float$float(1, 1, Math.fround(1 - Math.fround(this.preservedDamage * Math.fround(0.2))));
    }
  }
  iconTextDisplay(): string {
    return String(this.damageBonus());
  }
  setBonus(bonus: number): void {
    this.preservedDamage = Math.fround(bonus);
  }
  damageBonus(): number {
    return $J.d2i(Math.ceil(this.preservedDamage));
  }
  act(): boolean {
    this.preservedDamage = Math.fround(this.preservedDamage - Math.max(Math.fround(this.preservedDamage * Math.fround(0.025)), Math.fround(0.1)));
    if (this.preservedDamage <= Math.fround(0)) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  delay(value: number): void {
    this.spend(value);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.damageBonus()]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Kinetic$ConservedDamage.PRESERVED_DAMAGE, this.preservedDamage);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Kinetic$ConservedDamage.PRESERVED_DAMAGE)) {
      this.preservedDamage = bundle.getFloat(Kinetic$ConservedDamage.PRESERVED_DAMAGE);
    } else {
      this.preservedDamage = Math.fround(this.cooldown() / 10);
      this.spend(this.cooldown());
    }
  }
}

$J.define(Kinetic, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Kinetic' }, clinit: true, lazy: ['YELLOW'] });
$J.define(Kinetic$KineticTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic$KineticTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Kinetic$KineticTracker' } });
$J.define(Kinetic$ConservedDamage, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic$ConservedDamage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Kinetic$ConservedDamage' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
