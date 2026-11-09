// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/CloakOfShadows.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Dungeon, Actor, Buff, Buff$buffType, MagicImmune, Preparation, Regeneration, Hero, HeroSubClass, Talent, Talent$ProtectiveShadowsTracker, Item, RingOfEnergy, Catalog, Messages, CharSprite$State, ItemSpriteSheet, BuffIndicator, GLog, Sample;

export class CloakOfShadows extends Artifact {
  static readonly AC_STEALTH: string = 'STEALTH';
  static readonly STEALTHED: string = 'stealthed';
  static readonly BUFF: string = 'buff';
  _CloakOfShadows(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_CLOAK;
    this.exp = 0;
    this.levelCap = 10;
    this.charge_ = Math.min((this.level$() + 3) | 0, 10);
    this.partialCharge = 0;
    this.chargeCap_ = Math.min((this.level$() + 3) | 0, 10);
    this.defaultAction_ = CloakOfShadows.AC_STEALTH;
    this.unique = true;
    this.bones = false;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if ((this.isEquipped(hero) || hero.hasTalent(Talent.LIGHT_CLOAK)) && !this.cursed && hero.buff($J.cls(MagicImmune)) == null && (this.charge_ > 0 || this.activeBuff_ != null)) {
      actions.add(CloakOfShadows.AC_STEALTH);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, CloakOfShadows.AC_STEALTH)) {
      if (this.activeBuff_ == null) {
        if (!this.isEquipped(hero) && !hero.hasTalent(Talent.LIGHT_CLOAK)) {
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
        } else if (this.cursed) {
          GLog.i(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
        } else if (this.charge_ <= 0) {
          GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
        } else {
          hero.spend(1);
          hero.busy();
          Sample.INSTANCE.play$Object(Assets$Sounds.MELD);
          this.activeBuff_ = this.activeBuff();
          this.activeBuff_.attachTo(hero);
          Talent.onArtifactUsed(Dungeon.hero);
          hero.sprite_.operate$int(hero.pos);
        }
      } else {
        this.activeBuff_.detach();
        this.activeBuff_ = null;
        if (hero.invisible <= 0 && hero.buff($J.cls(Preparation)) != null) {
          hero.buff($J.cls(Preparation)).detach();
        }
        hero.sprite_.operate$int(hero.pos);
      }
    }
  }
  activate(ch: Char): void {
    super.activate(ch);
    if (this.activeBuff_ != null && this.activeBuff_.target == null) {
      this.activeBuff_.attachTo(ch);
    }
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (!collect || !hero.hasTalent(Talent.LIGHT_CLOAK)) {
        if (this.activeBuff_ != null) {
          this.activeBuff_.detach();
          this.activeBuff_ = null;
        }
      } else {
        this.activate(hero);
      }
      return true;
    } else {
      return false;
    }
  }
  collect$Bag(container: Bag): boolean {
    if (super.collect$Bag(container)) {
      if (container.owner instanceof Hero && this.passiveBuff_ == null && (container.owner).hasTalent(Talent.LIGHT_CLOAK)) {
        this.activate(container.owner);
      }
      return true;
    } else {
      return false;
    }
  }
  onDetach(): void {
    if (this.passiveBuff_ != null) {
      this.passiveBuff_.detach();
      this.passiveBuff_ = null;
    }
    if (this.activeBuff_ != null && !this.isEquipped(this.activeBuff_.target)) {
      this.activeBuff_.detach();
      this.activeBuff_ = null;
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new CloakOfShadows$cloakRecharge().$o(this)._CloakOfShadows$cloakRecharge();
  }
  activeBuff(): Artifact$ArtifactBuff {
    return new CloakOfShadows$cloakStealth().$o(this)._CloakOfShadows$cloakStealth();
  }
  charge(target: Hero, amount: number): void {
    if (this.cursed || target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.charge_ < this.chargeCap_) {
      if (!this.isEquipped(target)) {
        amount = Math.fround(amount * Math.fround(Math.fround(0.75 * target.pointsInTalent(Talent.LIGHT_CLOAK)) / 3));
      }
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(0.25 * amount));
      while (this.partialCharge >= 1) {
        this.charge_++;
        this.partialCharge--;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.partialCharge = 0;
        this.charge_ = this.chargeCap_;
      }
      Item.updateQuickslot();
    }
  }
  directCharge(amount: number): void {
    this.charge_ = Math.min((this.charge_ + amount) | 0, this.chargeCap_);
    Item.updateQuickslot();
  }
  upgrade$(): Item {
    this.chargeCap_ = Math.min((this.chargeCap_ + 1) | 0, 10);
    return super.upgrade$();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.activeBuff_ != null) {
      bundle.put$String$Bundlable(CloakOfShadows.BUFF, this.activeBuff_);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(CloakOfShadows.BUFF)) {
      this.activeBuff_ = new CloakOfShadows$cloakStealth().$o(this)._CloakOfShadows$cloakStealth();
      this.activeBuff_.restoreFromBundle(bundle.getBundle(CloakOfShadows.BUFF));
    }
  }
  value(): number {
    return 0;
  }
}

export class CloakOfShadows$cloakRecharge extends Artifact$ArtifactBuff {
  _CloakOfShadows$cloakRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null) {
      if (this.$outer.activeBuff_ == null && Regeneration.regenOn()) {
        let missing = Math.fround(((this.$outer.chargeCap_ - this.$outer.charge_) | 0));
        if (this.$outer.level$() > 7) {
          missing = Math.fround(missing + Math.fround(Math.imul(5, ((this.$outer.level$() - 7) | 0)) / 3));
        }
        let turnsToCharge = (Math.fround(45 - missing));
        turnsToCharge = Math.fround(turnsToCharge / RingOfEnergy.artifactChargeMultiplier(this.target));
        let chargeToGain = (Math.fround(1 / turnsToCharge));
        if (!this.$outer.isEquipped(Dungeon.hero)) {
          chargeToGain = Math.fround(chargeToGain * Math.fround(Math.fround(0.75 * Dungeon.hero.pointsInTalent(Talent.LIGHT_CLOAK)) / 3));
        }
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeToGain);
      }
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.charge_++;
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge - 1);
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
        }
      }
    } else {
      this.$outer.partialCharge = 0;
    }
    if (this.$outer.cooldown_ > 0) {
      this.$outer.cooldown_--;
    }
    Item.updateQuickslot();
    this.spend(Actor.TICK);
    return true;
  }
}

export class CloakOfShadows$cloakStealth extends Artifact$ArtifactBuff {
  turnsToCost: number = 0;
  static readonly TURNSTOCOST: string = 'turnsToCost';
  static readonly BARRIER_INC: string = 'barrier_inc';
  _CloakOfShadows$cloakStealth(): this {
    this._Artifact$ArtifactBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.turnsToCost = 0;
    return this;
  }
  icon(): number {
    return BuffIndicator.INVISIBLE;
  }
  tintIcon(icon: Image): void {
    icon.brightness(Math.fround(0.6));
  }
  iconFadePercent(): number {
    return Math.fround((Math.fround(4 - this.turnsToCost)) / 4);
  }
  iconTextDisplay(): string {
    return String(this.turnsToCost);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.turnsToCost]);
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
  act(): boolean {
    this.turnsToCost--;
    if (this.turnsToCost <= 0) {
      this.$outer.charge_--;
      if (this.$outer.charge_ < 0) {
        this.$outer.charge_ = 0;
        this.detach();
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
        (this.target).interrupt();
      } else {
        let lvlDiffFromTarget = ((this.target).lvl - (1 + Math.imul(this.$outer.level$(), 2))) | 0;
        if (this.$outer.level$() >= 7) {
          lvlDiffFromTarget = (lvlDiffFromTarget - (this.$outer.level$() - 6)) | 0;
        }
        if (lvlDiffFromTarget >= 0) {
          this.$outer.exp = $J.l2i(BigInt.asIntN(64, BigInt(this.$outer.exp) + $J.lround(10 * $J.pow(Math.fround(1.1), lvlDiffFromTarget))));
        } else {
          this.$outer.exp = $J.l2i(BigInt.asIntN(64, BigInt(this.$outer.exp) + $J.lround(10 * $J.pow(0.75, -lvlDiffFromTarget))));
        }
        if (this.$outer.exp >= Math.imul(((this.$outer.level$() + 1) | 0), 50) && this.$outer.level$() < this.$outer.levelCap) {
          this.$outer.upgrade$();
          Catalog.countUse($J.cls(CloakOfShadows));
          this.$outer.exp = (this.$outer.exp - Math.imul(this.$outer.level$(), 50)) | 0;
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
        }
        this.turnsToCost = 4;
      }
      Item.updateQuickslot();
    }
    this.spend(Actor.TICK);
    return true;
  }
  dispel(): void {
    if (this.turnsToCost <= 0 && this.$outer.charge_ > 0) {
      this.$outer.charge_--;
    }
    Item.updateQuickslot();
    this.detach();
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.INVISIBLE);
    } else if (this.target.invisible === 0) {
      this.target.sprite_.remove$State(CharSprite$State.INVISIBLE);
    }
  }
  detach(): void {
    this.$outer.activeBuff_ = null;
    if (this.target.invisible > 0) {
      this.target.invisible--;
    }
    Item.updateQuickslot();
    super.detach();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(CloakOfShadows$cloakStealth.TURNSTOCOST, this.turnsToCost);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.turnsToCost = bundle.getInt(CloakOfShadows$cloakStealth.TURNSTOCOST);
  }
}

$J.define(CloakOfShadows, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_CloakOfShadows' }, meths: { 'upgrade()': 'upgrade$', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(CloakOfShadows$cloakRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows$cloakRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_CloakOfShadows$cloakRecharge' }, inner: true });
$J.define(CloakOfShadows$cloakStealth, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows$cloakStealth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_CloakOfShadows$cloakStealth' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Preparation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$ProtectiveShadowsTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$ProtectiveShadowsTracker');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
