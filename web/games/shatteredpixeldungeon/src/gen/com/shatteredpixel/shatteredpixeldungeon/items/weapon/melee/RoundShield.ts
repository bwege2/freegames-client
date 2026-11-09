// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/RoundShield.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Actor, Buff, Buff$buffType, Messages, ItemSpriteSheet, BuffIndicator;

export class RoundShield extends MeleeWeapon {
  _RoundShield(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.ROUND_SHIELD;
    this.hitSound_ = Assets$Sounds.HIT;
    this.hitSoundPitch = 1;
    this.tier_ = 3;
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(3 * ((this.tier_ + 1) | 0))) + Math.imul(lvl, ((this.tier_ - 1) | 0))) | 0;
  }
  defenseFactor(owner: Char): number {
    return this.DRMax$();
  }
  DRMax$(): number {
    return this.DRMax$int(this.buffedLvl());
  }
  DRMax$int(lvl: number): number {
    return (4 + lvl) | 0;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [(4 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [4]);
    }
  }
  duelistAbility(hero: Hero, target: number): void {
    RoundShield.guardAbility(hero, (5 + this.buffedLvl()) | 0, this);
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(5 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [5]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String((5 + level) | 0);
  }
  static guardAbility(hero: Hero, duration: number, wep: MeleeWeapon): void {
    wep.beforeAbilityUsed(hero, null);
    Buff.prolong(hero, $J.cls(RoundShield$GuardTracker), Math.fround(duration)).hasBlocked = false;
    hero.sprite_.operate$int(hero.pos);
    hero.spendAndNext(Actor.TICK);
    wep.afterAbilityUsed(hero);
  }
}

export class RoundShield$GuardTracker extends FlavourBuff {
  hasBlocked: boolean = false;
  static readonly BLOCKED: string = 'blocked';
  _RoundShield$GuardTracker(): this {
    this._FlavourBuff();
    this.announced = true;
    this.type_ = Buff$buffType.POSITIVE;
    this.hasBlocked = false;
    return this;
  }
  icon(): number {
    return BuffIndicator.DUEL_GUARD;
  }
  tintIcon(icon: Image): void {
    if (this.hasBlocked) {
      icon.tint$int$float(6627174, 0.5);
    } else {
      icon.resetColor();
    }
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(5 - this.visualcooldown())) / 5));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(RoundShield$GuardTracker.BLOCKED, this.hasBlocked);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.hasBlocked = bundle.getBoolean(RoundShield$GuardTracker.BLOCKED);
  }
}

$J.define(RoundShield, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RoundShield', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_RoundShield' }, meths: { 'DRMax(int)': 'DRMax$int', 'DRMax()': 'DRMax$', 'max(int)': 'max$int' } });
$J.define(RoundShield$GuardTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RoundShield$GuardTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_RoundShield$GuardTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
