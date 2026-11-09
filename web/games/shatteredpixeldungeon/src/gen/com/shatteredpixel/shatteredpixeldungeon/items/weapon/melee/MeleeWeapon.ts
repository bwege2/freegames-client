// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/MeleeWeapon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Weapon } from '../Weapon.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, ArtifactRecharge, Barrier, GreaterHaste, MonkEnergy, Recharging, Regeneration, Hero, HeroClass, HeroSubClass, Talent, Talent$CombinedEnergyAbilityTracker, Talent$CombinedLethalityAbilityTracker, Talent$CounterAbilityTacker, Talent$PreciseAssaultTracker, Talent$SwiftEquipCooldown, Talent$VariedChargeTracker, HolyWeapon, HolyWeapon$HolyWepBuff, FloatingText, EquipableItem, Item, RingOfForce$BrawlersStance, ScrollOfRecharging, Weapon$Augment, Weapon$Enchantment, Crystal, MagesStaff, Messages, CellSelector$Listener, GameScene, PixelScene, CharSprite, ItemSprite, ActionIndicator, AttackIndicator, HeroIcon, GLog, Sample;

export class MeleeWeapon extends Weapon {
  static AC_ABILITY: string = null;
  tier_: number = 0;
  static evaluatingTwinUpgrades: boolean = false;
  _MeleeWeapon(): this {
    this._Weapon();
    return this;
  }
  activate(ch: Char): void {
    super.activate(ch);
    if (ch instanceof Hero && (ch).heroClass === HeroClass.DUELIST) {
      Buff.affect$Char$Class(ch, $J.cls(MeleeWeapon$Charger));
    }
  }
  defaultAction(): string {
    if (Dungeon.hero != null && (Dungeon.hero.heroClass === HeroClass.DUELIST || Dungeon.hero.hasTalent(Talent.SWIFT_EQUIP))) {
      return MeleeWeapon.AC_ABILITY;
    } else {
      return super.defaultAction();
    }
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && hero.heroClass === HeroClass.DUELIST) {
      actions.add(MeleeWeapon.AC_ABILITY);
    }
    return actions;
  }
  actionName(action: string, hero: Hero): string {
    if ($J.equals(action, MeleeWeapon.AC_ABILITY)) {
      return Messages.upperCase(Messages.get$Object$String$ObjectArr(this, 'ability_name', []));
    } else {
      return super.actionName(action, hero);
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, MeleeWeapon.AC_ABILITY)) {
      this.usesTargeting_ = false;
      if (!this.isEquipped(hero)) {
        if (hero.hasTalent(Talent.SWIFT_EQUIP)) {
          if (hero.buff($J.cls(Talent$SwiftEquipCooldown)) == null || hero.buff($J.cls(Talent$SwiftEquipCooldown)).hasSecondUse()) {
            this.execute$Hero$String(hero, EquipableItem.AC_EQUIP);
          } else if (hero.heroClass === HeroClass.DUELIST) {
            GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_need_equip', []), []);
          }
        } else if (hero.heroClass === HeroClass.DUELIST) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_need_equip', []), []);
        }
      } else if (hero.heroClass !== HeroClass.DUELIST) {
      } else if (this.STRReq$() > hero.STR()) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_low_str', []), []);
      } else if ((Math.fround(Buff.affect$Char$Class(hero, $J.cls(MeleeWeapon$Charger)).charges + Buff.affect$Char$Class(hero, $J.cls(MeleeWeapon$Charger)).partialCharge)) < this.abilityChargeUse(hero, null)) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_no_charge', []), []);
      } else {
        if (this.targetingPrompt() == null) {
          this.duelistAbility(hero, hero.pos);
          Item.updateQuickslot();
        } else {
          this.usesTargeting_ = this.useTargeting();
          GameScene.selectCell(new (MeleeWeapon$1())().$o(this).$c(hero)._CellSelector$Listener());
        }
      }
    }
  }
  targetingPrompt(): string {
    return null;
  }
  useTargeting(): boolean {
    return this.targetingPrompt() != null;
  }
  targetingPos(user: Hero, dst: number): number {
    return dst;
  }
  duelistAbility(hero: Hero, target: number): void {
  }
  beforeAbilityUsed(hero: Hero, target: Char): void {
    hero.belongings.abilityWeapon = this;
    let charger = Buff.affect$Char$Class(hero, $J.cls(MeleeWeapon$Charger));
    charger.partialCharge = Math.fround(charger.partialCharge - this.abilityChargeUse(hero, target));
    while (charger.partialCharge < Math.fround(0) && charger.charges > 0) {
      charger.charges--;
      charger.partialCharge++;
    }
    if (hero.heroClass === HeroClass.DUELIST && hero.hasTalent(Talent.AGGRESSIVE_BARRIER) && (Math.fround(hero.HP / Math.fround(hero.HT))) <= 0.5) {
      let shieldAmt = (1 + Math.imul(2, hero.pointsInTalent(Talent.AGGRESSIVE_BARRIER))) | 0;
      Buff.affect$Char$Class(hero, $J.cls(Barrier)).setShield(shieldAmt);
      hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldAmt), FloatingText.SHIELDING, []);
    }
    Item.updateQuickslot();
  }
  afterAbilityUsed(hero: Hero): void {
    hero.belongings.abilityWeapon = null;
    if (hero.hasTalent(Talent.PRECISE_ASSAULT)) {
      Buff.prolong(hero, $J.cls(Talent$PreciseAssaultTracker), Math.fround(hero.cooldown() + 4));
    }
    if (hero.hasTalent(Talent.VARIED_CHARGE)) {
      let tracker = hero.buff($J.cls(Talent$VariedChargeTracker));
      if (tracker == null || tracker.weapon_ === $J.getClass(this) || tracker.weapon_ == null) {
        Buff.affect$Char$Class(hero, $J.cls(Talent$VariedChargeTracker)).weapon_ = $J.getClass(this);
      } else {
        tracker.detach();
        let charger = Buff.affect$Char$Class(hero, $J.cls(MeleeWeapon$Charger));
        charger.gainCharge(Math.fround(hero.pointsInTalent(Talent.VARIED_CHARGE) / 6));
        ScrollOfRecharging.charge(hero);
      }
    }
    if (hero.hasTalent(Talent.COMBINED_LETHALITY)) {
      let tracker = hero.buff($J.cls(Talent$CombinedLethalityAbilityTracker));
      if (tracker == null || tracker.weapon_ === this || tracker.weapon_ == null) {
        Buff.affect$Char$Class$float(hero, $J.cls(Talent$CombinedLethalityAbilityTracker), hero.cooldown()).weapon_ = this;
      } else {
        tracker.detach();
      }
    }
    if (hero.hasTalent(Talent.COMBINED_ENERGY)) {
      let tracker = hero.buff($J.cls(Talent$CombinedEnergyAbilityTracker));
      if (tracker == null || !tracker.monkAbilused) {
        Buff.prolong(hero, $J.cls(Talent$CombinedEnergyAbilityTracker), 5).wepAbilUsed = true;
      } else {
        tracker.wepAbilUsed = true;
        Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).processCombinedEnergy(tracker);
      }
    }
    if (hero.buff($J.cls(Talent$CounterAbilityTacker)) != null) {
      let charger = Buff.affect$Char$Class(hero, $J.cls(MeleeWeapon$Charger));
      charger.gainCharge(Math.fround(hero.pointsInTalent(Talent.COUNTER_ABILITY) * 0.375));
      hero.buff($J.cls(Talent$CounterAbilityTacker)).detach();
    }
  }
  static onAbilityKill(hero: Hero, killed: Char): void {
    if (killed.alignment === Char$Alignment.ENEMY && hero.hasTalent(Talent.LETHAL_HASTE)) {
      Buff.affect$Char$Class(hero, $J.cls(GreaterHaste)).set((2 + Math.imul(2, hero.pointsInTalent(Talent.LETHAL_HASTE))) | 0);
    }
  }
  baseChargeUse(hero: Hero, target: Char): number {
    return 1;
  }
  abilityChargeUse(hero: Hero, target: Char): number {
    return Math.fround(this.baseChargeUse(hero, target));
  }
  min$int(lvl: number): number {
    return (this.tier_ + lvl) | 0;
  }
  max$int(lvl: number): number {
    return (Math.imul(5, ((this.tier_ + 1) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  STRReq$int(lvl: number): number {
    let req = Weapon.STRReq(this.tier_, lvl);
    if (this.masteryPotionBonus) {
      req = (req - 2) | 0;
    }
    return req;
  }
  buffedLvl(): number {
    if (!MeleeWeapon.evaluatingTwinUpgrades && Dungeon.hero != null && this.isEquipped(Dungeon.hero) && Dungeon.hero.hasTalent(Talent.TWIN_UPGRADES)) {
      let other = null;
      if (Dungeon.hero.belongings.weapon() !== this) {
        other = Dungeon.hero.belongings.weapon();
      }
      if (Dungeon.hero.belongings.secondWep() !== this) {
        other = Dungeon.hero.belongings.secondWep();
      }
      if (other instanceof MeleeWeapon) {
        MeleeWeapon.evaluatingTwinUpgrades = true;
        let otherLevel = other.buffedLvl();
        MeleeWeapon.evaluatingTwinUpgrades = false;
        if (((this.tier_ + (3 - Dungeon.hero.pointsInTalent(Talent.TWIN_UPGRADES))) | 0) <= (other).tier_ && otherLevel > super.buffedLvl()) {
          return otherLevel;
        }
      }
    }
    return super.buffedLvl();
  }
  damageRoll(owner: Char): number {
    let damage = this.augment.damageFactor$int(super.damageRoll(owner));
    if (owner instanceof Hero) {
      let exStr = ((owner).STR() - this.STRReq$()) | 0;
      if (exStr > 0) {
        damage = (damage + Hero.heroDamageIntRange(0, exStr)) | 0;
      }
    }
    return damage;
  }
  info(): string {
    let info = super.info();
    if (this.levelKnown) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'stats_known', [this.tier_, this.augment.damageFactor$int(this.min$()), this.augment.damageFactor$int(this.max$()), this.STRReq$()]);
      if (Dungeon.hero != null) {
        if (this.STRReq$() > Dungeon.hero.STR()) {
          info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'too_heavy', []);
        } else if (Dungeon.hero.STR() > this.STRReq$()) {
          info += ' ' + (Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'excess_str', [(Dungeon.hero.STR() - this.STRReq$()) | 0]));
        }
      }
    } else {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'stats_unknown', [this.tier_, this.min$int(0), this.max$int(0), this.STRReq$int(0)]);
      if (Dungeon.hero != null && this.STRReq$int(0) > Dungeon.hero.STR()) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'probably_too_heavy', []);
      }
    }
    let statsInfo = this.statsInfo();
    if (!$J.equals(statsInfo, '')) {
      info += '\n\n' + statsInfo;
    }
    switch (this.augment) {
      case Weapon$Augment.SPEED:
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'faster', []);
        break;
      case Weapon$Augment.DAMAGE:
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'stronger', []);
        break;
      case Weapon$Augment.NONE:
    }
    if (this.isEquipped(Dungeon.hero) && !this.hasCurseEnchant() && Dungeon.hero.buff($J.cls(HolyWeapon$HolyWepBuff)) != null && (Dungeon.hero.subClass !== HeroSubClass.PALADIN || this.enchantment == null)) {
      info += '\n\n' + Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'enchanted', [Messages.get$Class$String$ObjectArr($J.cls(HolyWeapon), 'ench_name', [Messages.get$Class$String$ObjectArr($J.cls(Weapon$Enchantment), 'enchant', [])])]));
      info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(HolyWeapon), 'ench_desc', []);
    } else if (this.enchantment != null && (this.cursedKnown || !this.enchantment.curse())) {
      info += '\n\n' + Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'enchanted', [this.enchantment.name$()]));
      if (this.enchantHardened) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'enchant_hardened', []);
      }
      info += ' ' + this.enchantment.desc();
    } else if (this.enchantHardened) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'hardened_no_enchant', []);
    }
    if (this.cursed && this.isEquipped(Dungeon.hero)) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'cursed_worn', []);
    } else if (this.cursedKnown && this.cursed) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'cursed', []);
    } else if (!this.isIdentified() && this.cursedKnown) {
      if (this.enchantment != null && this.enchantment.curse()) {
        info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'weak_cursed', []);
      } else {
        info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'not_cursed', []);
      }
    }
    if (Dungeon.hero != null && Dungeon.hero.heroClass === HeroClass.DUELIST && !(this instanceof MagesStaff)) {
      info += '\n\n' + this.abilityInfo();
    }
    return info;
  }
  statsInfo(): string {
    return Messages.get$Object$String$ObjectArr(this, 'stats_desc', []);
  }
  abilityInfo(): string {
    return Messages.get$Object$String$ObjectArr(this, 'ability_desc', []);
  }
  upgradeAbilityStat(level: number): string {
    return null;
  }
  status(): string {
    if (this.isEquipped(Dungeon.hero) && Dungeon.hero.buff($J.cls(MeleeWeapon$Charger)) != null) {
      let buff = Dungeon.hero.buff($J.cls(MeleeWeapon$Charger));
      return buff.charges + '/' + buff.chargeCap();
    } else {
      return super.status();
    }
  }
  value(): number {
    let price = Math.imul(20, this.tier_);
    if (this.hasGoodEnchant()) {
      price = $J.d2i(Math.fround(price * 1.5));
      if (this.enchantment instanceof Crystal) {
        price = Math.imul(price, 3);
      }
    }
    if (this.cursedKnown && (this.cursed || this.hasCurseEnchant())) {
      price = $J.idiv(price, 2);
    }
    if (this.levelKnown && this.level$() > 0) {
      price = Math.imul(price, ((this.level$() + 1) | 0));
    }
    if (price < 1) {
      price = 1;
    }
    return price;
  }
  static $clinit() {
    MeleeWeapon.AC_ABILITY = 'ABILITY';
    MeleeWeapon.evaluatingTwinUpgrades = false;
  }
}

export class MeleeWeapon$Charger extends Buff {
  charges: number = 0;
  partialCharge: number = 0;
  static readonly CHARGES: string = 'charges';
  static readonly PARTIALCHARGE: string = 'partialCharge';
  _MeleeWeapon$Charger(): this {
    this._Buff();
    this.revivePersists = true;
    this.charges = 2;
    return this;
  }
  act(): boolean {
    if (this.charges < this.chargeCap()) {
      if (Regeneration.regenOn()) {
        let chargeToGain = Math.fround(1 / (Math.fround(60 - Math.fround(1.5 * ((this.chargeCap() - this.charges) | 0)))));
        if (Dungeon.hero.subClass === HeroSubClass.CHAMPION) {
          chargeToGain = Math.fround(chargeToGain * 1.5);
        }
        if (Dungeon.hero.buff($J.cls(RingOfForce$BrawlersStance)) != null) {
          chargeToGain = Math.fround(chargeToGain * 0.5);
        }
        this.partialCharge = Math.fround(this.partialCharge + chargeToGain);
      }
      let points = (this.target).pointsInTalent(Talent.WEAPON_RECHARGING);
      if (points > 0 && this.target.buff($J.cls(Recharging)) != null || this.target.buff($J.cls(ArtifactRecharge)) != null) {
        this.partialCharge = Math.fround(this.partialCharge + Math.fround(1 / (Math.fround(20 - Math.fround(5 * points)))));
      }
      if (this.partialCharge >= Math.fround(1)) {
        this.charges++;
        this.partialCharge--;
        Item.updateQuickslot();
      }
    } else {
      this.partialCharge = 0;
    }
    if (ActionIndicator.action !== this && Dungeon.hero.subClass === HeroSubClass.CHAMPION) {
      ActionIndicator.setAction(this);
    }
    this.spend(Actor.TICK);
    return true;
  }
  fx(on: boolean): void {
    if (on && Dungeon.hero.subClass === HeroSubClass.CHAMPION) {
      ActionIndicator.setAction(this);
    }
  }
  detach(): void {
    super.detach();
    ActionIndicator.clearAction$Action(this);
  }
  chargeCap(): number {
    if (Dungeon.hero.subClass === HeroSubClass.CHAMPION) {
      return Math.min(10, (4 + $J.idiv(((Dungeon.hero.lvl - 1) | 0), 3)) | 0);
    } else {
      return Math.min(8, (2 + $J.idiv(((Dungeon.hero.lvl - 1) | 0), 3)) | 0);
    }
  }
  gainCharge(charge: number): void {
    if (this.charges < this.chargeCap()) {
      this.partialCharge = Math.fround(this.partialCharge + charge);
      while (this.partialCharge >= 1) {
        this.charges++;
        this.partialCharge--;
      }
      if (this.charges >= this.chargeCap()) {
        this.partialCharge = 0;
        this.charges = this.chargeCap();
      }
      Item.updateQuickslot();
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(MeleeWeapon$Charger.CHARGES, this.charges);
    bundle.put$String$float(MeleeWeapon$Charger.PARTIALCHARGE, this.partialCharge);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.charges = bundle.getInt(MeleeWeapon$Charger.CHARGES);
    this.partialCharge = bundle.getFloat(MeleeWeapon$Charger.PARTIALCHARGE);
  }
  actionName(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'swap', []);
  }
  actionIcon(): number {
    return HeroIcon.WEAPON_SWAP;
  }
  primaryVisual(): Visual {
    let ico: Image;
    if (Dungeon.hero.belongings.weapon_ == null) {
      ico = new HeroIcon()._HeroIcon$Action(this);
    } else {
      ico = new ItemSprite()._ItemSprite$Item(Dungeon.hero.belongings.weapon_);
    }
    ico.width_ = Math.fround(ico.width_ + 4);
    return ico;
  }
  secondaryVisual(): Visual {
    let ico: Image;
    if (Dungeon.hero.belongings.secondWep_ == null) {
      ico = new HeroIcon()._HeroIcon$Action(this);
    } else {
      ico = new ItemSprite()._ItemSprite$Item(Dungeon.hero.belongings.secondWep_);
    }
    ico.scale_.set$float(PixelScene.align$float(Math.fround(0.51)));
    ico.brightness(Math.fround(0.6));
    return ico;
  }
  indicatorColor(): number {
    return 5570747;
  }
  doAction(): void {
    if (Dungeon.hero.subClass !== HeroSubClass.CHAMPION) {
      return;
    }
    if (Dungeon.hero.belongings.secondWep_ == null && Dungeon.hero.belongings.backpack.items_.size() >= Dungeon.hero.belongings.backpack.capacity()) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'swap_full', []), []);
      return;
    }
    let temp = Dungeon.hero.belongings.weapon_;
    Dungeon.hero.belongings.weapon_ = Dungeon.hero.belongings.secondWep_;
    Dungeon.hero.belongings.secondWep_ = temp;
    Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
    ActionIndicator.setAction(this);
    Item.updateQuickslot();
    AttackIndicator.updateState();
  }
}

let $MeleeWeapon$1: any = null;
/** An anonymous class (MeleeWeapon.java:133). */
function MeleeWeapon$1(): any {
  return $MeleeWeapon$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (cell != null) {
        this.$outer.duelistAbility(this.$cv_hero, cell);
        Item.updateQuickslot();
      }
    }
    prompt(): string {
      return this.$outer.targetingPrompt();
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$1', []);
}

$J.define(MeleeWeapon, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon', ctors: { '': '_MeleeWeapon' }, meths: { 'STRReq(int)': 'STRReq$int', 'max(int)': 'max$int', 'min(int)': 'min$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['AC_ABILITY', 'evaluatingTwinUpgrades'] });
$J.define(MeleeWeapon$Charger, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$Charger', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_MeleeWeapon$Charger' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  GreaterHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.GreaterHaste');
  MonkEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$CombinedEnergyAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CombinedEnergyAbilityTracker');
  Talent$CombinedLethalityAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CombinedLethalityAbilityTracker');
  Talent$CounterAbilityTacker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CounterAbilityTacker');
  Talent$PreciseAssaultTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$PreciseAssaultTracker');
  Talent$SwiftEquipCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SwiftEquipCooldown');
  Talent$VariedChargeTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$VariedChargeTracker');
  HolyWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon');
  HolyWeapon$HolyWepBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon$HolyWepBuff');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfForce$BrawlersStance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce$BrawlersStance');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  Weapon$Augment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Crystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
