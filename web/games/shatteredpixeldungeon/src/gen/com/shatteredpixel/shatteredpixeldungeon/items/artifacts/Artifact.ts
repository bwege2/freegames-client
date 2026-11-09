// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/Artifact.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { KindofMisc } from '../KindofMisc.ts';
import { Buff } from '../../actors/buffs/Buff.ts';

let Dungeon, Actor, Char$Alignment, Blindness, MagicImmune, Hero, HeroClass, HeroSubClass, Talent, Talent$SearingLightCooldown, GuidingLight, GuidingLight$Illuminated, Messages, GLog, Random;

export class Artifact extends KindofMisc {
  passiveBuff_: Buff = null;
  activeBuff_: Buff = null;
  exp: number = 0;
  levelCap: number = 0;
  charge_: number = 0;
  partialCharge: number = 0;
  chargeCap_: number = 0;
  cooldown_: number = 0;
  static readonly EXP: string = 'exp';
  static readonly CHARGE: string = 'charge';
  static readonly PARTIALCHARGE: string = 'partialcharge';
  _Artifact(): this {
    this._KindofMisc();
    this.exp = 0;
    this.levelCap = 0;
    this.charge_ = 0;
    this.partialCharge = 0;
    this.chargeCap_ = 0;
    this.cooldown_ = 0;
    return this;
  }
  doEquip(hero: Hero): boolean {
    if ((hero.belongings.artifact_ != null && hero.belongings.artifact_.getClass() === this.getClass()) || (hero.belongings.misc_ != null && hero.belongings.misc_.getClass() === this.getClass())) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'cannot_wear_two', []), []);
      return false;
    } else {
      if (super.doEquip(hero)) {
        this.identify$();
        return true;
      } else {
        return false;
      }
    }
  }
  activate(ch: Char): void {
    if (this.passiveBuff_ != null) {
      if (this.passiveBuff_.target != null) {
        this.passiveBuff_.detach();
      }
      this.passiveBuff_ = null;
    }
    this.passiveBuff_ = this.passiveBuff();
    this.passiveBuff_.attachTo(ch);
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (this.passiveBuff_ != null) {
        if (this.passiveBuff_.target != null) {
          this.passiveBuff_.detach();
        }
        this.passiveBuff_ = null;
      }
      return true;
    } else {
      return false;
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  visiblyUpgraded(): number {
    return this.levelKnown ? $J.roundf(Math.fround((Math.imul(this.level$(), 10)) / Math.fround(this.levelCap))) : 0;
  }
  buffedVisiblyUpgraded(): number {
    return this.visiblyUpgraded();
  }
  buffedLvl(): number {
    return this.level$();
  }
  transferUpgrade(transferLvl: number): void {
    this.upgrade$int($J.roundf(Math.fround((Math.imul(transferLvl, this.levelCap)) / 10)));
  }
  resetForTrinity(visibleLevel: number): void {
    this.level$int($J.roundf(Math.fround((Math.imul(visibleLevel, this.levelCap)) / 10)));
    this.exp = -2147483648;
    this.charge_ = this.chargeCap_;
    this.cooldown_ = 0;
  }
  static artifactProc(target: Char, artifLevel: number, chargesUsed: number): void {
    if (Dungeon.hero.subClass === HeroSubClass.PRIEST && target.buff($J.cls(GuidingLight$Illuminated)) != null) {
      target.buff($J.cls(GuidingLight$Illuminated)).detach();
      target.damage((5 + Dungeon.hero.lvl) | 0, GuidingLight.INSTANCE);
    }
    if (target.alignment !== Char$Alignment.ALLY && Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.SEARING_LIGHT) && Dungeon.hero.buff($J.cls(Talent$SearingLightCooldown)) == null) {
      Buff.affect$Char$Class(target, $J.cls(GuidingLight$Illuminated));
      Buff.affect$Char$Class$float(Dungeon.hero, $J.cls(Talent$SearingLightCooldown), 20);
    }
    if (target.alignment !== Char$Alignment.ALLY && Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.SUNRAY)) {
      if (Random.Int$int(20) < ((1 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.SUNRAY))) | 0)) {
        Buff.prolong(target, $J.cls(Blindness), 4);
      }
    }
  }
  info(): string {
    if (this.cursed && this.cursedKnown && !this.isEquipped(Dungeon.hero)) {
      return super.info() + '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'curse_known', []);
    } else if (!this.isIdentified() && this.cursedKnown && !this.isEquipped(Dungeon.hero)) {
      return super.info() + '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'not_cursed', []);
    } else {
      return super.info();
    }
  }
  status(): string {
    if (!this.isIdentified() || this.cursed) {
      return null;
    }
    if (this.cooldown_ !== 0) {
      return Messages.format('%d', [this.cooldown_]);
    }
    if (this.chargeCap_ === 100) {
      return Messages.format('%d%%', [this.charge_]);
    }
    if (this.chargeCap_ > 0) {
      return Messages.format('%d/%d', [this.charge_, this.chargeCap_]);
    }
    if (this.charge_ !== 0) {
      return Messages.format('%d', [this.charge_]);
    }
    return null;
  }
  random(): Item {
    if (Random.Float$() < Math.fround(0.3)) {
      this.cursed = true;
    }
    return this;
  }
  value(): number {
    let price = 100;
    if (this.level$() > 0) {
      price = (price + Math.imul(20, this.visiblyUpgraded())) | 0;
    }
    if (this.cursed && this.cursedKnown) {
      price = $J.idiv(price, 2);
    }
    if (price < 1) {
      price = 1;
    }
    return price;
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return null;
  }
  activeBuff(): Artifact$ArtifactBuff {
    return null;
  }
  charge(target: Hero, amount: number): void {
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Artifact.EXP, this.exp);
    bundle.put$String$int(Artifact.CHARGE, this.charge_);
    bundle.put$String$float(Artifact.PARTIALCHARGE, this.partialCharge);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.exp = bundle.getInt(Artifact.EXP);
    if (this.chargeCap_ > 0) {
      this.charge_ = Math.min(this.chargeCap_, bundle.getInt(Artifact.CHARGE));
    } else {
      this.charge_ = bundle.getInt(Artifact.CHARGE);
    }
    this.partialCharge = bundle.getFloat(Artifact.PARTIALCHARGE);
  }
}

export class Artifact$ArtifactBuff extends Buff {
  _Artifact$ArtifactBuff(): this {
    this._Buff();
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      if (target instanceof Hero && Dungeon.hero == null && this.cooldown() === Math.fround(0) && target.cooldown() > Math.fround(0)) {
        this.spend(Actor.TICK);
      }
      return true;
    }
    return false;
  }
  itemLevel(): number {
    return this.$outer.level$();
  }
  isCursed(): boolean {
    return this.target.buff($J.cls(MagicImmune)) == null && this.$outer.cursed;
  }
  charge$Hero$float(target: Hero, amount: number): void {
    this.$outer.charge(target, amount);
  }
}

$J.define(Artifact, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.KindofMisc', ctors: { '': '_Artifact' }, meths: { 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean' } });
$J.define(Artifact$ArtifactBuff, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Artifact$ArtifactBuff' }, meths: { 'charge(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,float)': 'charge$Hero$float' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$SearingLightCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SearingLightCooldown');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
