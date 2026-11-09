// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Invisibility.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff, Buff$buffType, Preparation, Hero, HeroSubClass, Talent, Talent$ProtectiveShadowsTracker, CloakOfShadows$cloakStealth, TimekeepersHourglass$timeFreeze, RoundShield$GuardTracker, Swiftthistle$TimeBubble, CharSprite$State, BuffIndicator;

export class Invisibility extends FlavourBuff {
  static readonly DURATION: number = 20;
  _Invisibility(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.invisible++;
      if (target instanceof Hero && (target).subClass === HeroSubClass.ASSASSIN) {
        Buff.affect$Char$Class(target, $J.cls(Preparation));
      }
      if (target instanceof Hero && (target).hasTalent(Talent.PROTECTIVE_SHADOWS)) {
        Buff.affect$Char$Class(target, $J.cls(Talent$ProtectiveShadowsTracker));
      }
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    if (this.target.invisible > 0) {
      this.target.invisible--;
    }
    super.detach();
  }
  icon(): number {
    return BuffIndicator.INVISIBLE;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Invisibility.DURATION - this.visualcooldown())) / Invisibility.DURATION));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.INVISIBLE);
    } else if (this.target.invisible === 0) {
      this.target.sprite_.remove$State(CharSprite$State.INVISIBLE);
    }
  }
  static dispel$(): void {
    if (Dungeon.hero == null) {
      return;
    }
    Invisibility.dispel$Char(Dungeon.hero);
  }
  static dispel$Char(ch: Char): void {
    for (const $it0 = ch.buffs$Class($J.cls(Invisibility)).iterator(); $it0.hasNext(); ) {
      let invis = $it0.next();
      invis.detach();
    }
    let cloakBuff = ch.buff($J.cls(CloakOfShadows$cloakStealth));
    if (cloakBuff != null) {
      cloakBuff.dispel();
    }
    let timeFreeze = ch.buff($J.cls(TimekeepersHourglass$timeFreeze));
    if (timeFreeze != null) {
      timeFreeze.detach();
    }
    let prep = ch.buff($J.cls(Preparation));
    if (prep != null) {
      prep.detach();
    }
    let bubble = ch.buff($J.cls(Swiftthistle$TimeBubble));
    if (bubble != null) {
      bubble.detach();
    }
    let guard = ch.buff($J.cls(RoundShield$GuardTracker));
    if (guard != null && guard.hasBlocked) {
      guard.detach();
    }
  }
}

$J.define(Invisibility, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Invisibility' }, meths: { 'dispel(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'dispel$Char', 'dispel()': 'dispel$' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Preparation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$ProtectiveShadowsTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$ProtectiveShadowsTracker');
  CloakOfShadows$cloakStealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows$cloakStealth');
  TimekeepersHourglass$timeFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze');
  RoundShield$GuardTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RoundShield$GuardTracker');
  Swiftthistle$TimeBubble = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
