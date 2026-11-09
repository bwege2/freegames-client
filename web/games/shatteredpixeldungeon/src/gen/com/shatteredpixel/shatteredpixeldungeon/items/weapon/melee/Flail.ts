// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Flail.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MeleeWeapon } from './MeleeWeapon.ts';
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Buff$buffType, Hero, Messages, ItemSpriteSheet, BuffIndicator, GLog, Sample;

export class Flail extends MeleeWeapon {
  static spinBoost: number = 0;
  _Flail(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.FLAIL;
    this.hitSound_ = Assets$Sounds.HIT_CRUSH;
    this.hitSoundPitch = Math.fround(0.8);
    this.tier_ = 4;
    this.ACC = Math.fround(0.8);
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(Math.imul(7, ((this.tier_ + 1) | 0)))) + Math.imul(lvl, $J.roundf(Math.fround(Math.fround(1.6) * ((this.tier_ + 1) | 0))))) | 0;
  }
  damageRoll(owner: Char): number {
    let dmg = (super.damageRoll(owner) + Flail.spinBoost) | 0;
    if (Flail.spinBoost > 0) {
      Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
    }
    Flail.spinBoost = 0;
    return dmg;
  }
  accuracyFactor(owner: Char, target: Char): number {
    let spin = owner.buff($J.cls(Flail$SpinAbilityTracker));
    if (spin != null && Flail.spinBoost === 0) {
      Actor.add$Actor(new (Flail$1())().$o(this).$c(owner, target)._Actor().$init_anon());
      spin.detach();
      Flail.spinBoost = Math.imul(spin.spins, this.augment.damageFactor$int((8 + Math.imul(2, this.buffedLvl())) | 0));
      return Infinity;
    } else if (Flail.spinBoost !== 0) {
      return Infinity;
    } else {
      return super.accuracyFactor(owner, target);
    }
  }
  baseChargeUse(hero: Hero, target: Char): number {
    if (Dungeon.hero.buff($J.cls(Flail$SpinAbilityTracker)) != null) {
      return 0;
    } else {
      return 1;
    }
  }
  duelistAbility(hero: Hero, target: number): void {
    let spin = hero.buff($J.cls(Flail$SpinAbilityTracker));
    if (spin != null && spin.spins >= 3) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'spin_warn', []), []);
      return;
    }
    this.beforeAbilityUsed(hero, null);
    if (spin == null) {
      spin = Buff.affect$Char$Class$float(hero, $J.cls(Flail$SpinAbilityTracker), 3);
    }
    spin.spins++;
    Buff.prolong(hero, $J.cls(Flail$SpinAbilityTracker), 3);
    Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.CHAINS, 1, 1, Math.fround(Math.fround(0.9) + Math.fround(Math.fround(0.1) * spin.spins)));
    hero.sprite_.operate$int(hero.pos);
    hero.spendAndNext(Actor.TICK);
    BuffIndicator.refreshHero();
    this.afterAbilityUsed(hero);
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (8 + Math.imul(2, this.buffedLvl())) | 0 : 8;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int(dmgBoost)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [this.augment.damageFactor$int(dmgBoost)]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return '+' + this.augment.damageFactor$int((8 + Math.imul(2, level)) | 0);
  }
  static $clinit() {
    Flail.spinBoost = 0;
  }
}

export class Flail$SpinAbilityTracker extends FlavourBuff {
  spins: number = 0;
  static SPINS: string = null;
  _Flail$SpinAbilityTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.spins = 0;
    return this;
  }
  icon(): number {
    return BuffIndicator.DUEL_SPIN;
  }
  tintIcon(icon: Image): void {
    switch (this.spins) {
      case 1:
      default:
        icon.hardlight$float$float$float(0, 1, 0);
        break;
      case 2:
        icon.hardlight$float$float$float(1, 1, 0);
        break;
      case 3:
        icon.hardlight$float$float$float(1, 0, 0);
        break;
    }
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(3 - this.visualcooldown())) / 3));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [$J.roundf(Math.fround((Math.fround(this.spins / 3)) * 100)), this.dispTurns$()]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Flail$SpinAbilityTracker.SPINS, this.spins);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.spins = bundle.getInt(Flail$SpinAbilityTracker.SPINS);
  }
  static $clinit() {
    Flail$SpinAbilityTracker.SPINS = 'spins';
  }
}

let $Flail$1: any = null;
/** An anonymous class (Flail.java:71). */
function Flail$1(): any {
  return $Flail$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Flail.spinBoost = 0;
      if (this.$cv_owner instanceof Hero && !this.$cv_target.isAlive()) {
        MeleeWeapon.onAbilityKill(this.$cv_owner, this.$cv_target);
      }
      Actor.remove(this);
      return true;
    }
    $c($owner, $target): this {
      this.$cv_owner = $owner; this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail$1', []);
}

$J.define(Flail, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Flail' }, meths: { 'max(int)': 'max$int' }, clinit: true, lazy: ['spinBoost'] });
$J.define(Flail$SpinAbilityTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail$SpinAbilityTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Flail$SpinAbilityTracker' }, clinit: true, lazy: ['SPINS'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
