// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Blocking.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ShieldBuff } from '../../../actors/buffs/ShieldBuff.ts';

let Actor, Barrier, Buff, Buff$buffType, HoldFast, FloatingText, Speck, Messages, CharSprite, CharSprite$State, ItemSprite$Glowing, BuffIndicator, Random;

export class Blocking extends Weapon$Enchantment {
  static BLUE: ItemSprite$Glowing = null;
  _Blocking(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 4)) / (Math.fround(level + 40))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      let b = Buff.affect$Char$Class(attacker, $J.cls(Blocking$BlockBuff));
      let shield = $J.roundf(Math.fround(powerMulti * ((2 + weapon.buffedLvl()) | 0)));
      b.setShield(shield);
      attacker.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shield), FloatingText.SHIELDING, []);
      attacker.sprite_.emitter().burst(Speck.factory$int(Speck.LIGHT), 5);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Blocking.BLUE;
  }
  static $clinit() {
    Blocking.BLUE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(255);
  }
}

export class Blocking$BlockBuff extends ShieldBuff {
  left_: number = 0;
  static LEFT: string = null;
  _Blocking$BlockBuff(): this {
    this._ShieldBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.shieldUsePriority = 2;
    this.left_ = 5;
    return this;
  }
  act(): boolean {
    this.left_ = Math.fround(this.left_ - HoldFast.buffDecayFactor(this.target));
    if (this.left_ <= Math.fround(0)) {
      this.detach();
    } else {
      this.spend(Actor.TICK);
    }
    return true;
  }
  setShield(shield: number): void {
    super.setShield(shield);
    this.left_ = 5;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.SHIELDED);
    } else if (this.target.buff($J.cls(Barrier)) == null) {
      this.target.sprite_.remove$State(CharSprite$State.SHIELDED);
    }
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0.5, 1, 2);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(5 - this.left_)) / 5));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.left_));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.shielding(), this.dispTurns$float(this.left_)]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Blocking$BlockBuff.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(Blocking$BlockBuff.LEFT);
  }
  static $clinit() {
    Blocking$BlockBuff.LEFT = 'left';
  }
}

$J.define(Blocking, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Blocking' }, clinit: true, lazy: ['BLUE'] });
$J.define(Blocking$BlockBuff, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking$BlockBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff', ctors: { '': '_Blocking$BlockBuff' }, clinit: true, lazy: ['LEFT'] });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  HoldFast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Random = $J.load('com.watabou.utils.Random');
});
