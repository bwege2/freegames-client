// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/MissileWeapon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, SecureRandom } from '../../../../../../../jre/index.ts';
import { Weapon } from '../Weapon.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, MagicImmune, Momentum, PinCushion, RevealedArea, Hero, HeroClass, Talent, Talent$SeerShotCooldown, VaultBossElemental, EquipableItem, Item, MagicalHolster, RingOfSharpshooting, ParchmentScrap, ShardOfOblivion, ShardOfOblivion$ThrownUseTracker, SpiritBow, SpiritBow$SpiritArrow, Weapon$Augment, Weapon$Enchantment, Explosive, Crystal, Crystal$CrystalRepair, Projecting, Dart, Messages, GameScene, ItemSprite, ItemSpriteSheet, InventoryPane, QuickSlotButton, GLog, WndOptions, Sample, Random;

export class MissileWeapon extends Weapon {
  setID: bigint = 0n;
  spawnedForEffect: boolean = false;
  sticky: boolean = false;
  static readonly MAX_DURABILITY: number = 100;
  durability: number = 0;
  baseUses: number = 0;
  holster: boolean = false;
  parent: MissileWeapon = null;
  tier_: number = 0;
  extraThrownLeft: boolean = false;
  useRoundingInDurabilityCalc: boolean = false;
  static readonly SET_ID: string = 'set_id';
  static readonly SPAWNED: string = 'spawned';
  static readonly DURABILITY: string = 'durability';
  static readonly EXTRA_LEFT: string = 'extra_left';
  static bundleRestoring: boolean = false;
  _MissileWeapon(): this {
    this._Weapon();
    this.stackable = true;
    this.quantity = this.defaultQuantity();
    this.bones = true;
    this.defaultAction_ = Item.AC_THROW;
    this.usesTargeting_ = true;
    this.setID = Random.oracle ? Random.oracleLong() : new SecureRandom().nextLong();
    this.spawnedForEffect = false;
    this.sticky = true;
    this.durability = MissileWeapon.MAX_DURABILITY;
    this.baseUses = 8;
    this.extraThrownLeft = false;
    this.useRoundingInDurabilityCalc = true;
    return this;
  }
  usesToID(): number {
    return 10;
  }
  min$(): number {
    if (Dungeon.hero != null) {
      return Math.max(0, this.min$int((this.buffedLvl() + RingOfSharpshooting.levelDamageBonus(Dungeon.hero)) | 0));
    } else {
      return Math.max(0, this.min$int(this.buffedLvl()));
    }
  }
  min$int(lvl: number): number {
    return (Math.imul(2, this.tier_) + lvl) | 0;
  }
  max$(): number {
    if (Dungeon.hero != null) {
      return Math.max(0, this.max$int((this.buffedLvl() + RingOfSharpshooting.levelDamageBonus(Dungeon.hero)) | 0));
    } else {
      return Math.max(0, this.max$int(this.buffedLvl()));
    }
  }
  max$int(lvl: number): number {
    return (Math.imul(5, this.tier_) + Math.imul(this.tier_, lvl)) | 0;
  }
  STRReq$int(lvl: number): number {
    let req = (Weapon.STRReq(this.tier_, lvl) - 1) | 0;
    if (this.masteryPotionBonus) {
      req = (req - 2) | 0;
    }
    return req;
  }
  buffedLvl(): number {
    if (this.parent != null) {
      return this.parent.buffedLvl();
    } else {
      return super.buffedLvl();
    }
  }
  upgrade$boolean(enchant: boolean): Item {
    if (!MissileWeapon.bundleRestoring) {
      this.durability = MissileWeapon.MAX_DURABILITY;
      this.extraThrownLeft = false;
      this.quantity = this.defaultQuantity();
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds.put(this.setID, (this.trueLevel() + 1) | 0);
    }
    let wasCursed = this.cursed;
    super.upgrade$boolean(enchant);
    if (wasCursed && this.hasCurseEnchant()) {
      this.cursed = wasCursed;
    }
    return this;
  }
  upgrade$(): Item {
    if (!MissileWeapon.bundleRestoring) {
      this.durability = MissileWeapon.MAX_DURABILITY;
      this.extraThrownLeft = false;
      this.quantity = this.defaultQuantity();
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds.put(this.setID, (this.trueLevel() + 1) | 0);
    }
    return super.upgrade$();
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.remove(EquipableItem.AC_EQUIP);
    return actions;
  }
  collect$Bag(container: Bag): boolean {
    if (container instanceof MagicalHolster) {
      this.holster = true;
    }
    return super.collect$Bag(container);
  }
  isSimilar(item: Item): boolean {
    return this.trueLevel() === item.trueLevel() && $J.getClass(this) === item.getClass() && this.setID === ((item).setID);
  }
  throwPos(user: Hero, dst: number): number {
    let projecting = 0;
    if (this.hasEnchant($J.cls(Projecting), user)) {
      projecting = (projecting + 4) | 0;
    }
    if (!(this instanceof SpiritBow$SpiritArrow) && Random.Int$int(3) < user.pointsInTalent(Talent.SHARED_ENCHANTMENT)) {
      let bow = Dungeon.hero.belongings.getItem($J.cls(SpiritBow));
      if (bow != null && bow.hasEnchant($J.cls(Projecting), user)) {
        projecting = (projecting + 4) | 0;
      }
    }
    if (projecting > 0 && (Dungeon.level.passable[dst] || Dungeon.level.avoid[dst] || Actor.findChar(dst) != null) && Dungeon.level.distance(user.pos, dst) <= $J.roundf(Math.fround(projecting * Weapon$Enchantment.genericProcChanceMultiplier(user)))) {
      return dst;
    } else {
      return super.throwPos(user, dst);
    }
  }
  accuracyFactor(owner: Char, target: Char): number {
    let accFactor = super.accuracyFactor(owner, target);
    accFactor = Math.fround(accFactor * this.adjacentAccFactor(owner, target));
    return accFactor;
  }
  adjacentAccFactor(owner: Char, target: Char): number {
    if (Dungeon.level.adjacent(owner.pos, target.pos)) {
      if (owner instanceof Hero) {
        return (Math.fround(0.5 + Math.fround(0.25 * (owner).pointsInTalent(Talent.POINT_BLANK))));
      } else {
        return 0.5;
      }
    } else {
      return 1.5;
    }
  }
  doThrow(hero: Hero): void {
    this.parent = null;
    if (((this.levelKnown && this.level$() > 0) || this.hasGoodEnchant() || this.masteryPotionBonus || this.enchantHardened) && !this.extraThrownLeft && this.quantity$() === 1 && this.durabilityLeft() <= this.durabilityPerUse$()) {
      GameScene.show(new (MissileWeapon$1())().$o(this).$c(hero)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.title()), Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'break_upgraded_warn_desc', []), [Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'break_upgraded_warn_yes', []), Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'break_upgraded_warn_no', [])]));
    } else {
      super.doThrow(hero);
    }
  }
  onThrow(cell: number): void {
    let enemy = Actor.findChar(cell);
    if (enemy == null || enemy === Item.curUser) {
      this.parent = null;
      if (Item.curUser.hasTalent(Talent.SEER_SHOT) && Item.curUser.heroClass !== HeroClass.HUNTRESS && Item.curUser.buff($J.cls(Talent$SeerShotCooldown)) == null) {
        if (Actor.findChar(cell) == null) {
          let a = Buff.affect$Char$Class$float(Item.curUser, $J.cls(RevealedArea), Math.fround(Math.imul(5, Item.curUser.pointsInTalent(Talent.SEER_SHOT))));
          a.depth_ = Dungeon.depth;
          a.pos = cell;
          Buff.affect$Char$Class$float(Item.curUser, $J.cls(Talent$SeerShotCooldown), 20);
        }
      }
      if (!this.spawnedForEffect) {
        super.onThrow(cell);
      }
    } else {
      if (!Item.curUser.shoot(enemy, this)) {
        this.rangedMiss(cell);
      } else {
        this.rangedHit(enemy, cell);
      }
    }
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (attacker === Dungeon.hero && Random.Int$int(3) < Dungeon.hero.pointsInTalent(Talent.SHARED_ENCHANTMENT)) {
      let bow = Dungeon.hero.belongings.getItem($J.cls(SpiritBow));
      if (bow != null && bow.enchantment != null && Dungeon.hero.buff($J.cls(MagicImmune)) == null) {
        if (bow.enchantment instanceof Crystal) {
          damage = bow.enchantment.proc(bow, attacker, defender, damage);
        } else {
          damage = bow.enchantment.proc(this, attacker, defender, damage);
        }
      }
    }
    if ((this.cursed || this.hasCurseEnchant()) && !this.cursedKnown) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'curse_discover', []), []);
    }
    this.cursedKnown = true;
    if (this.parent != null) {
      this.parent.cursedKnown = true;
    }
    if (attacker === Dungeon.hero && Dungeon.hero.pointsInTalent(Talent.SURVIVALISTS_INTUITION) === 2) {
      this.usesLeftToID = Math.min(this.usesLeftToID, 0);
      this.availableUsesToID = Math.max(this.usesLeftToID, 0);
    }
    let result = super.proc(attacker, defender, damage);
    if (this.parent != null && this.parent.usesLeftToID > this.usesLeftToID) {
      let diff = Math.fround(this.parent.usesLeftToID - this.usesLeftToID);
      this.parent.usesLeftToID = Math.fround(this.parent.usesLeftToID - diff);
      this.parent.availableUsesToID = Math.fround(this.parent.availableUsesToID - diff);
      if (this.usesLeftToID <= Math.fround(0)) {
        if (ShardOfOblivion.passiveIDDisabled()) {
          this.parent.setIDReady();
        } else {
          this.parent.identify$();
        }
      }
    } else if (this.parent != null && this.isIdentified() && !this.parent.isIdentified()) {
      this.parent.identify$();
    }
    if (attacker === Dungeon.hero && !this.isIdentified() && ShardOfOblivion.passiveIDDisabled()) {
      Buff.prolong(Dungeon.hero, $J.cls(ShardOfOblivion$ThrownUseTracker), 50);
    }
    return result;
  }
  virtual(): Item {
    let item = super.virtual();
    (item).setID = this.setID;
    return item;
  }
  defaultQuantity(): number {
    return 3;
  }
  random(): Item {
    let n = 0;
    if (Random.Int$int(4) === 0) {
      n++;
      if (Random.Int$int(5) === 0) {
        n++;
      }
    }
    this.level$int(n);
    Random.pushGenerator$long(Random.Long$());
    let effectRoll = Random.Float$();
    if (effectRoll < Math.fround(Math.fround(0.3) * ParchmentScrap.curseChanceMultiplier$())) {
      this.enchant$Enchantment(Weapon$Enchantment.randomCurse([]));
      this.cursed = true;
    } else if (effectRoll >= Math.fround(1 - (Math.fround(Math.fround(0.1) * ParchmentScrap.enchantChanceMultiplier$())))) {
      this.enchant$();
    }
    Random.popGenerator();
    return this;
  }
  status(): string {
    return String(this.quantity);
  }
  castDelay(user: Char, cell: number): number {
    if (Actor.findChar(cell) != null && Actor.findChar(cell) !== user) {
      return this.delayFactor(user);
    } else {
      return super.castDelay(user, cell);
    }
  }
  rangedHit(enemy: Char, cell: number): void {
    this.decrementDurability();
    if (this.durability > Math.fround(0) && !this.spawnedForEffect) {
      let doesStick = this.sticky || enemy instanceof VaultBossElemental;
      if (doesStick && enemy != null && enemy.isActive() && enemy.alignment !== Char$Alignment.ALLY) {
        let p = Buff.affect$Char$Class(enemy, $J.cls(PinCushion));
        if (p.target === enemy) {
          p.stick(this);
          return;
        }
      }
      Dungeon.level.drop(this, cell).sprite_.drop$();
    }
  }
  rangedMiss(cell: number): void {
    this.parent = null;
    if (!this.spawnedForEffect) {
      super.onThrow(cell);
    }
  }
  durabilityLeft(): number {
    return this.durability;
  }
  repair(amount: number): void {
    this.durability = Math.fround(this.durability + amount);
    this.durability = Math.min(this.durability, MissileWeapon.MAX_DURABILITY);
  }
  damage(amount: number): void {
    this.durability = Math.fround(this.durability - amount);
    this.durability = Math.max(this.durability, 1);
  }
  durabilityPerUse$(): number {
    return this.durabilityPerUse$int(this.level$());
  }
  durabilityPerUse$int(level: number): number {
    let usages = Math.fround(this.baseUses * Math.fround(($J.pow(1.5, level))));
    if (Dungeon.hero != null && Dungeon.hero.hasTalent(Talent.DURABLE_PROJECTILES)) {
      usages = Math.fround(usages * Math.fround(1.25 + (Math.fround(0.25 * Dungeon.hero.pointsInTalent(Talent.DURABLE_PROJECTILES)))));
    }
    if (this.holster) {
      usages = Math.fround(usages * MagicalHolster.HOLSTER_DURABILITY_FACTOR);
    }
    usages = Math.fround(usages / this.augment.delayFactor(1));
    if (Dungeon.hero != null) {
      usages = Math.fround(usages * RingOfSharpshooting.durabilityMultiplier(Dungeon.hero));
    }
    if (this.enchantment instanceof Crystal) {
      usages = Math.min(Math.fround(usages / 2), 30);
    }
    if (usages >= 100) {
      return 0;
    }
    if (this.useRoundingInDurabilityCalc) {
      usages = Math.fround($J.roundf(usages));
      return Math.fround((Math.fround(MissileWeapon.MAX_DURABILITY / usages)) + Math.fround(0.001));
    } else {
      return Math.fround(MissileWeapon.MAX_DURABILITY / usages);
    }
  }
  enchant$Enchantment(ench: Weapon$Enchantment): Weapon {
    if (ench instanceof Crystal) {
      (ench).setThrownWep();
      if (this.durability < MissileWeapon.MAX_DURABILITY) {
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(Crystal$CrystalRepair));
      }
    }
    if (ench == null) {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).appliedEnchants.remove(this.setID);
    } else {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).appliedEnchants.put(this.setID, ench.getClass());
    }
    return super.enchant$Enchantment(ench);
  }
  decrementDurability(): void {
    if (this.parent != null) {
      if (this.parent.durability <= this.parent.durabilityPerUse$()) {
        this.durability = 0;
        this.parent.durability = MissileWeapon.MAX_DURABILITY;
        this.parent.extraThrownLeft = false;
        if (this.parent.durabilityPerUse$() < 100) {
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'has_broken', []), []);
        }
      } else {
        this.parent.durability = Math.fround(this.parent.durability - this.parent.durabilityPerUse$());
        if (this.parent.durability > Math.fround(0) && this.parent.durability <= this.parent.durabilityPerUse$()) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'about_to_break', []), []);
        }
      }
      this.parent = null;
    } else {
      this.durability = Math.fround(this.durability - this.durabilityPerUse$());
      if (this.durability > Math.fround(0) && this.durability <= this.durabilityPerUse$()) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'about_to_break', []), []);
      } else if (this.durabilityPerUse$() < 100 && this.durability <= Math.fround(0)) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'has_broken', []), []);
      }
    }
  }
  damageRoll(owner: Char): number {
    let damage = this.augment.damageFactor$int(super.damageRoll(owner));
    if (owner instanceof Hero) {
      let exStr = ((owner).STR() - this.STRReq$()) | 0;
      if (exStr > 0) {
        damage = (damage + Hero.heroDamageIntRange(0, exStr)) | 0;
      }
      if (owner.buff($J.cls(Momentum)) != null && owner.buff($J.cls(Momentum)).freerunning()) {
        damage = $J.roundf(Math.fround(damage * (Math.fround(1 + Math.fround(Math.fround(0.15) * (owner).pointsInTalent(Talent.PROJECTILE_MOMENTUM))))));
      }
    }
    return damage;
  }
  reset(): void {
    super.reset();
    this.durability = MissileWeapon.MAX_DURABILITY;
  }
  merge(other: Item): Item {
    super.merge(other);
    if (this.isSimilar(other)) {
      this.extraThrownLeft = false;
      this.durability = Math.fround(this.durability + (other).durability);
      this.durability = Math.fround(this.durability - MissileWeapon.MAX_DURABILITY);
      while (this.durability <= Math.fround(0)) {
        this.quantity = (this.quantity - 1) | 0;
        this.durability = Math.fround(this.durability + MissileWeapon.MAX_DURABILITY);
      }
      if (this.quantity > this.defaultQuantity() && this.setID !== 0n && this.setID !== BigInt($J.hashCode($J.getClass(this).getSimpleName()))) {
        this.quantity = this.defaultQuantity();
        this.durability = MissileWeapon.MAX_DURABILITY;
      }
      this.levelKnown = this.levelKnown || other.levelKnown;
      this.cursedKnown = this.cursedKnown || other.cursedKnown;
      if ((other).readyToIdentify()) {
        this.setIDReady();
      }
      this.masteryPotionBonus = this.masteryPotionBonus || (other).masteryPotionBonus;
      this.enchantHardened = this.enchantHardened || (other).enchantHardened;
      if (!this.curseInfusionBonus && (other).curseInfusionBonus && (other).hasCurseEnchant()) {
        this.enchantment = (other).enchantment;
        this.curseInfusionBonus = true;
        this.cursed = this.cursed || other.cursed;
      } else if (!this.curseInfusionBonus && !this.hasGoodEnchant() && (other).hasGoodEnchant()) {
        this.enchantment = (other).enchantment;
        this.cursed = other.cursed;
      } else if (!this.curseInfusionBonus && this.hasCurseEnchant() && !(other).hasCurseEnchant()) {
        this.enchantment = (other).enchantment;
        this.cursed = other.cursed;
      }
      if ((other).enchantment instanceof Explosive && this.enchantment instanceof Explosive) {
        (this.enchantment).merge((other).enchantment);
      }
    }
    return this;
  }
  split(amount: number): Item {
    MissileWeapon.bundleRestoring = true;
    let split = super.split(amount);
    MissileWeapon.bundleRestoring = false;
    if (split != null) {
      let m = split;
      m.durability = MissileWeapon.MAX_DURABILITY;
      m.parent = this;
      this.extraThrownLeft = m.extraThrownLeft = true;
      if (m.enchantment instanceof Explosive) {
        (m.enchantment).clear();
      }
    }
    return split;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    this.parent = null;
    if (!MissileWeapon$UpgradedSetTracker.pickupValid(hero, this)) {
      Sample.INSTANCE.play$Object(Assets$Sounds.ITEM);
      hero.spendAndNext(this.pickupDelay());
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'dust', []), []);
      this.quantity$int(0);
      return true;
    } else {
      this.extraThrownLeft = false;
      MissileWeapon$UpgradedSetTracker.filterEnchantOnPickup(hero, this);
      return super.doPickUp$Hero$int(hero, pos);
    }
  }
  isIdentified(): boolean {
    return this.levelKnown && this.cursedKnown;
  }
  info(): string {
    let info = super.info();
    if (this.levelKnown) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'stats_known', [this.tier_, this.augment.damageFactor$int(this.min$()), this.augment.damageFactor$int(this.max$()), this.STRReq$()]);
      if (Dungeon.hero != null) {
        if (this.STRReq$() > Dungeon.hero.STR()) {
          info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'too_heavy', []);
        } else if (Dungeon.hero.STR() > this.STRReq$()) {
          info += ' ' + (Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'excess_str', [(Dungeon.hero.STR() - this.STRReq$()) | 0]));
        }
      }
    } else {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'stats_unknown', [this.tier_, this.min$int(0), this.max$int(0), this.STRReq$int(0)]);
      if (Dungeon.hero != null && this.STRReq$int(0) > Dungeon.hero.STR()) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'probably_too_heavy', []);
      }
    }
    if (this.enchantment != null && (this.cursedKnown || !this.enchantment.curse())) {
      info += '\n\n' + Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'enchanted', [this.enchantment.name$()]));
      if (this.enchantHardened) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'enchant_hardened', []);
      }
      info += ' ' + this.enchantment.desc();
    } else if (this.enchantHardened) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'hardened_no_enchant', []);
    }
    if (this.cursedKnown && this.cursed) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'cursed', []);
    } else if (!this.isIdentified() && this.cursedKnown) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'not_cursed', []);
    }
    info += '\n\n';
    let statsInfo = this.statsInfo();
    if (!$J.equals(statsInfo, '')) {
      info += statsInfo + ' ';
    }
    info += Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'distance', []);
    switch (this.augment) {
      case Weapon$Augment.SPEED:
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'faster', []);
        break;
      case Weapon$Augment.DAMAGE:
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'stronger', []);
        break;
      case Weapon$Augment.NONE:
    }
    if (this.levelKnown) {
      if (this.durabilityPerUse$() > Math.fround(0)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'uses_left', [$J.d2i(Math.ceil(Math.fround(this.durability / this.durabilityPerUse$()))), $J.d2i(Math.ceil(Math.fround(MissileWeapon.MAX_DURABILITY / this.durabilityPerUse$())))]);
      } else {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'unlimited_uses', []);
      }
    } else {
      if (this.durabilityPerUse$int(0) > Math.fround(0)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'unknown_uses', [$J.d2i(Math.ceil(Math.fround(MissileWeapon.MAX_DURABILITY / this.durabilityPerUse$int(0))))]);
      } else {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'unlimited_uses', []);
      }
    }
    return info;
  }
  statsInfo(): string {
    return Messages.get$Object$String$ObjectArr(this, 'stats_desc', []);
  }
  value(): number {
    let price = Math.imul(Math.imul(5, this.tier_), this.quantity);
    if (this.hasGoodEnchant()) {
      price = $J.d2i(price * 1.5);
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
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$long(MissileWeapon.SET_ID, this.setID);
    bundle.put$String$boolean(MissileWeapon.SPAWNED, this.spawnedForEffect);
    bundle.put$String$float(MissileWeapon.DURABILITY, this.durability);
    bundle.put$String$boolean(MissileWeapon.EXTRA_LEFT, this.extraThrownLeft);
  }
  restoreFromBundle(bundle: Bundle): void {
    MissileWeapon.bundleRestoring = true;
    super.restoreFromBundle(bundle);
    MissileWeapon.bundleRestoring = false;
    if (bundle.contains(MissileWeapon.SET_ID)) {
      this.setID = bundle.getLong(MissileWeapon.SET_ID);
    } else {
      if (this.level$() > 0) {
        this.quantity = this.defaultQuantity();
      } else if (!(this instanceof Dart)) {
        this.levelKnown = this.cursedKnown = true;
        this.setID = BigInt($J.hashCode($J.getClass(this).getSimpleName()));
      }
    }
    this.spawnedForEffect = bundle.getBoolean(MissileWeapon.SPAWNED);
    this.durability = bundle.getFloat(MissileWeapon.DURABILITY);
    this.extraThrownLeft = bundle.getBoolean(MissileWeapon.EXTRA_LEFT);
  }
  static $clinit() {
    MissileWeapon.bundleRestoring = false;
  }
}

export class MissileWeapon$PlaceHolder extends MissileWeapon {
  _MissileWeapon$PlaceHolder(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.MISSILE_HOLDER;
    return this;
  }
  isSimilar(item: Item): boolean {
    return item instanceof MissileWeapon && !(item instanceof Dart);
  }
  status(): string {
    return null;
  }
  info(): string {
    return '';
  }
}

export class MissileWeapon$UpgradedSetTracker extends Buff {
  levelThresholds: HashMap<bigint, number> = null;
  appliedEnchants: HashMap<bigint, JClass<Weapon$Enchantment>> = null;
  static readonly SET_IDS: string = 'set_ids';
  static readonly SET_LEVELS: string = 'set_levels';
  static readonly SET_IDS_ENCHANTS: string = 'set_ids_enchants';
  static readonly SET_ENCHANTS: string = 'set_enchants';
  _MissileWeapon$UpgradedSetTracker(): this {
    this._Buff();
    this.revivePersists = true;
    this.levelThresholds = new HashMap();
    this.appliedEnchants = new HashMap();
    return this;
  }
  static pickupValid(h: Hero, w: MissileWeapon): boolean {
    if (h.buff($J.cls(MissileWeapon$UpgradedSetTracker)) != null) {
      let levelThresholds = h.buff($J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds;
      if (levelThresholds.containsKey(w.setID)) {
        return w.trueLevel() >= levelThresholds.get(w.setID);
      }
      return true;
    }
    return true;
  }
  static filterEnchantOnPickup(h: Hero, w: MissileWeapon): void {
    if (h.buff($J.cls(MissileWeapon$UpgradedSetTracker)) != null) {
      let enchantCLS = h.buff($J.cls(MissileWeapon$UpgradedSetTracker)).appliedEnchants.get(w.setID);
      if (enchantCLS != null && w.enchantment != null && w.enchantment.getClass() !== enchantCLS) {
        w.enchantment = null;
        w.curseInfusionBonus = false;
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    let IDs = $J.newArray(this.levelThresholds.size(), 0n);
    let levels = $J.newArray(this.levelThresholds.size(), 0);
    let i = 0;
    for (const $it0 = this.levelThresholds.keySet().iterator(); $it0.hasNext(); ) {
      let ID = $it0.next();
      IDs[i] = ID;
      levels[i] = this.levelThresholds.get(ID);
      i++;
    }
    bundle.put$String$longArr(MissileWeapon$UpgradedSetTracker.SET_IDS, IDs);
    bundle.put$String$intArr(MissileWeapon$UpgradedSetTracker.SET_LEVELS, levels);
    IDs = $J.newArray(this.appliedEnchants.size(), 0n);
    let enchants = $J.newArray(this.appliedEnchants.size(), null);
    i = 0;
    for (const $it1 = this.appliedEnchants.keySet().iterator(); $it1.hasNext(); ) {
      let ID = $it1.next();
      IDs[i] = ID;
      enchants[i] = this.appliedEnchants.get(ID);
      i++;
    }
    bundle.put$String$longArr(MissileWeapon$UpgradedSetTracker.SET_IDS_ENCHANTS, IDs);
    bundle.put$String$ClassArr(MissileWeapon$UpgradedSetTracker.SET_ENCHANTS, enchants);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    let IDs = bundle.getLongArray(MissileWeapon$UpgradedSetTracker.SET_IDS);
    let levels = bundle.getIntArray(MissileWeapon$UpgradedSetTracker.SET_LEVELS);
    this.levelThresholds.clear();
    for (let i = 0; i < IDs.length; i++) {
      this.levelThresholds.put(IDs[i], levels[i]);
    }
    if (!bundle.contains(MissileWeapon$UpgradedSetTracker.SET_IDS_ENCHANTS)) {
      this.appliedEnchants = new HashMap();
    } else {
      IDs = bundle.getLongArray(MissileWeapon$UpgradedSetTracker.SET_IDS_ENCHANTS);
      let enchants = bundle.getClassArray(MissileWeapon$UpgradedSetTracker.SET_ENCHANTS);
      this.appliedEnchants.clear();
      for (let i = 0; i < IDs.length; i++) {
        this.appliedEnchants.put(IDs[i], enchants[i]);
      }
    }
  }
}

let $MissileWeapon$1: any = null;
/** An anonymous class (MissileWeapon.java:243). */
function MissileWeapon$1(): any {
  return $MissileWeapon$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        super.doThrow(this.$cv_hero);
      } else {
        QuickSlotButton.cancel();
        InventoryPane.cancelTargeting();
      }
    }
    onBackPressed(): void {
      super.onBackPressed();
      QuickSlotButton.cancel();
      InventoryPane.cancelTargeting();
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$1', []);
}

$J.define(MissileWeapon, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon', ctors: { '': '_MissileWeapon' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int', 'enchant(com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment)': 'enchant$Enchantment', 'durabilityPerUse(int)': 'durabilityPerUse$int', 'durabilityPerUse()': 'durabilityPerUse$', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'upgrade()': 'upgrade$', 'upgrade(boolean)': 'upgrade$boolean', 'STRReq(int)': 'STRReq$int', 'max(int)': 'max$int', 'max()': 'max$', 'min(int)': 'min$int', 'min()': 'min$' }, clinit: true, lazy: ['bundleRestoring'] });
$J.define(MissileWeapon$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_MissileWeapon$PlaceHolder' } });
$J.define(MissileWeapon$UpgradedSetTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$UpgradedSetTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_MissileWeapon$UpgradedSetTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Momentum = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Momentum');
  PinCushion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PinCushion');
  RevealedArea = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.RevealedArea');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$SeerShotCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SeerShotCooldown');
  VaultBossElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  RingOfSharpshooting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfSharpshooting');
  ParchmentScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ParchmentScrap');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  ShardOfOblivion$ThrownUseTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion$ThrownUseTracker');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  SpiritBow$SpiritArrow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow');
  Weapon$Augment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Explosive = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Explosive');
  Crystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal');
  Crystal$CrystalRepair = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal$CrystalRepair');
  Projecting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Projecting');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  InventoryPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
