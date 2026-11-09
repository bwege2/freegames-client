// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/Wand.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Item } from '../Item.ts';
import { Buff } from '../../actors/buffs/Buff.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Char$Alignment, Barrier, Blindness, Buff$buffType, Degrade, Invisibility, LostInventory, MagicImmune, Recharging, Regeneration, ScrollEmpower, SoulMark, Hero, HeroClass, HeroSubClass, Talent, Talent$EmpoweredStrikeTracker, Talent$LingeringMagicTracker, Talent$SearingLightCooldown, WildMagic$WildMagicTracker, DivineSense$DivineSenseTracker, GuidingLight, GuidingLight$Illuminated, Flare, FloatingText, MagicMissile, TalismanOfForesight$CharAwareness, MagicalHolster, RingOfEnergy, ScrollOfRecharging, ShardOfOblivion, ShardOfOblivion$WandUseTracker, WondrousResin, CursedWand, WandOfMagicMissile$MagicCharge, Ballistica, Messages, CellSelector$Listener, GameScene, CharSprite, ItemSprite$Glowing, ItemSpriteSheet, QuickSlotButton, GLog, Sample, PointF, Random;

export class Wand extends Item {
  static readonly AC_ZAP: string = 'ZAP';
  static readonly TIME_TO_ZAP: number = 1;
  maxCharges: number = 0;
  curCharges: number = 0;
  partialCharge: number = 0;
  charger: Wand$Charger = null;
  curChargeKnown: boolean = false;
  curseInfusionBonus: boolean = false;
  resinBonus: number = 0;
  static readonly USES_TO_ID: number = 10;
  usesLeftToID: number = 0;
  availableUsesToID: number = 0;
  collisionProperties_: number = 0;
  static readonly USES_LEFT_TO_ID: string = 'uses_left_to_id';
  static readonly AVAILABLE_USES: string = 'available_uses';
  static readonly CUR_CHARGES: string = 'curCharges';
  static readonly CUR_CHARGE_KNOWN: string = 'curChargeKnown';
  static readonly PARTIALCHARGE: string = 'partialCharge';
  static readonly CURSE_INFUSION_BONUS: string = 'curse_infusion_bonus';
  static readonly RESIN_BONUS: string = 'resin_bonus';
  static zapper: CellSelector$Listener = null;
  _Wand(): this {
    this._Item();
    this.maxCharges = this.initialCharges();
    this.curCharges = this.maxCharges;
    this.partialCharge = 0;
    this.curChargeKnown = false;
    this.curseInfusionBonus = false;
    this.resinBonus = 0;
    this.usesLeftToID = Math.fround(Wand.USES_TO_ID);
    this.availableUsesToID = Math.fround(Wand.USES_TO_ID / 2);
    this.collisionProperties_ = Ballistica.MAGIC_BOLT;
    this.defaultAction_ = Wand.AC_ZAP;
    this.usesTargeting_ = true;
    this.bones = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.curCharges > 0 || !this.curChargeKnown) {
      actions.add(Wand.AC_ZAP);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Wand.AC_ZAP)) {
      Item.curUser = hero;
      Item.curItem = this;
      GameScene.selectCell(Wand.zapper);
    }
  }
  targetingPos(user: Hero, dst: number): number {
    if (this.cursed && this.cursedKnown) {
      return new Ballistica()._Ballistica(user.pos, dst, Ballistica.MAGIC_BOLT).collisionPos;
    } else {
      return new Ballistica()._Ballistica(user.pos, dst, this.collisionProperties_).collisionPos;
    }
  }
  static procChanceMultiplier(attacker: Char): number {
    if (attacker.buff($J.cls(Talent$EmpoweredStrikeTracker)) != null) {
      return Math.fround(1 + Math.fround((attacker).pointsInTalent(Talent.EMPOWERED_STRIKE) / 2));
    }
    return 1;
  }
  tryToZap(owner: Hero, target: number): boolean {
    if (owner.buff($J.cls(WildMagic$WildMagicTracker)) == null && owner.buff($J.cls(MagicImmune)) != null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_magic', []), []);
      return false;
    }
    if (owner.buff($J.cls(WildMagic$WildMagicTracker)) != null || this.curCharges >= this.chargesPerCast()) {
      return true;
    } else {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'fizzles', []), []);
      return false;
    }
  }
  collect$Bag(container: Bag): boolean {
    if (super.collect$Bag(container)) {
      if (container.owner != null) {
        if (container instanceof MagicalHolster) {
          this.charge$Char$float(container.owner, MagicalHolster.HOLSTER_SCALE_FACTOR);
        } else {
          this.charge$Char(container.owner);
        }
      }
      return true;
    } else {
      return false;
    }
  }
  gainCharge$float(amt: number): void {
    this.gainCharge$float$boolean(amt, false);
  }
  gainCharge$float$boolean(amt: number, overcharge: boolean): void {
    this.partialCharge = Math.fround(this.partialCharge + amt);
    while (this.partialCharge >= Math.fround(1)) {
      if (overcharge) {
        this.curCharges = Math.min((this.maxCharges + $J.d2i(amt)) | 0, (this.curCharges + 1) | 0);
      } else {
        this.curCharges = Math.min(this.maxCharges, (this.curCharges + 1) | 0);
      }
      this.partialCharge--;
      Item.updateQuickslot();
    }
  }
  charge$Char(owner: Char): void {
    if (this.charger == null) {
      this.charger = new Wand$Charger().$o(this)._Wand$Charger();
    }
    this.charger.attachTo(owner);
  }
  charge$Char$float(owner: Char, chargeScaleFactor: number): void {
    this.charge$Char(owner);
    this.charger.setScaleFactor(chargeScaleFactor);
  }
  wandProc(target: Char, chargesUsed: number): void {
    Wand.wandProc(target, this.buffedLvl(), chargesUsed);
  }
  static wandProc(target: Char, wandLevel: number, chargesUsed: number): void {
    if (Dungeon.hero.hasTalent(Talent.ARCANE_VISION)) {
      let dur = (5 + Math.imul(5, Dungeon.hero.pointsInTalent(Talent.ARCANE_VISION))) | 0;
      Buff.append$Char$Class$float(Dungeon.hero, $J.cls(TalismanOfForesight$CharAwareness), Math.fround(dur)).charID = target.id();
    }
    if (target !== Dungeon.hero && Dungeon.hero.subClass === HeroSubClass.WARLOCK && Random.Float$() > (($J.pow(Math.fround(0.92), ((Math.imul(wandLevel, chargesUsed)) + 1) | 0)) - Math.fround(0.07))) {
      Buff.prolong(target, $J.cls(SoulMark), Math.fround(SoulMark.DURATION + wandLevel));
    }
    if (Dungeon.hero.subClass === HeroSubClass.PRIEST && target.buff($J.cls(GuidingLight$Illuminated)) != null) {
      target.buff($J.cls(GuidingLight$Illuminated)).detach();
      target.damage((Dungeon.hero.lvl + 5) | 0, GuidingLight.INSTANCE);
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
  onDetach(): void {
    this.stopCharging();
  }
  stopCharging(): void {
    if (this.charger != null) {
      this.charger.detach();
      this.charger = null;
    }
  }
  level$int(value: number): Item {
    super.level$int(value);
    this.updateLevel();
    return this;
  }
  identify$boolean(byHero: boolean): Item {
    this.curChargeKnown = true;
    super.identify$boolean(byHero);
    Item.updateQuickslot();
    return this;
  }
  setIDReady(): void {
    this.usesLeftToID = -1;
  }
  readyToIdentify(): boolean {
    return !this.isIdentified() && this.usesLeftToID <= Math.fround(0);
  }
  onHeroGainExp(levelPercent: number, hero: Hero): void {
    levelPercent = Math.fround(levelPercent * Talent.itemIDSpeedFactor(hero, this));
    if (!this.isIdentified() && this.availableUsesToID <= Math.fround(Wand.USES_TO_ID / 2)) {
      this.availableUsesToID = Math.min(Math.fround(Wand.USES_TO_ID / 2), Math.fround(this.availableUsesToID + Math.fround(Math.fround(levelPercent * Wand.USES_TO_ID) / 2)));
    }
  }
  info(): string {
    let desc = super.info();
    desc += '\n\n' + this.statsDesc();
    if (this.resinBonus === 1) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Wand), 'resin_one', []);
    } else if (this.resinBonus > 1) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Wand), 'resin_many', [this.resinBonus]);
    }
    if (this.cursed && this.cursedKnown) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Wand), 'cursed', []);
    } else if (!this.isIdentified() && this.cursedKnown) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Wand), 'not_cursed', []);
    }
    if (Dungeon.hero != null && Dungeon.hero.subClass === HeroSubClass.BATTLEMAGE) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'bmage_desc', []);
    }
    return desc;
  }
  statsDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'stats_desc', []);
  }
  upgradeStat1(level: number): string {
    return null;
  }
  upgradeStat2(level: number): string {
    return null;
  }
  upgradeStat3(level: number): string {
    return null;
  }
  isIdentified(): boolean {
    return super.isIdentified() && this.curChargeKnown;
  }
  status(): string {
    if (this.levelKnown) {
      return $J.str((this.curChargeKnown ? this.curCharges : '?')) + '/' + this.maxCharges;
    } else {
      return null;
    }
  }
  level$(): number {
    if (!this.cursed && this.curseInfusionBonus) {
      this.curseInfusionBonus = false;
      this.updateLevel();
    }
    let level = super.level$();
    if (this.curseInfusionBonus) {
      level = (level + (1 + $J.idiv(level, 6))) | 0;
    }
    level = (level + this.resinBonus) | 0;
    return level;
  }
  upgrade$(): Item {
    super.upgrade$();
    if (Random.Int$int(3) === 0) {
      this.cursed = false;
    }
    if (this.resinBonus > 0) {
      this.resinBonus--;
    }
    this.updateLevel();
    this.curCharges = Math.min((this.curCharges + 1) | 0, this.maxCharges);
    Item.updateQuickslot();
    return this;
  }
  degrade$(): Item {
    super.degrade$();
    this.updateLevel();
    Item.updateQuickslot();
    return this;
  }
  buffedLvl(): number {
    let lvl = super.buffedLvl();
    if (this.charger != null && this.charger.target != null) {
      if (this.charger.target === Dungeon.hero && !Dungeon.hero.belongings.contains(this) && Dungeon.hero.buff($J.cls(Degrade)) != null) {
        lvl = Degrade.reduceLevel(lvl);
      }
      if (this.charger.target.buff($J.cls(ScrollEmpower)) != null) {
        lvl = (lvl + 2) | 0;
      }
      if (this.curCharges === 1 && this.charger.target instanceof Hero && (this.charger.target).hasTalent(Talent.DESPERATE_POWER)) {
        lvl = (lvl + (this.charger.target).pointsInTalent(Talent.DESPERATE_POWER)) | 0;
      }
      if (this.charger.target.buff($J.cls(WildMagic$WildMagicTracker)) != null) {
        let bonus = (4 + (this.charger.target).pointsInTalent(Talent.WILD_POWER)) | 0;
        if (Random.Int$int(2) === 0) {
          bonus++;
        }
        bonus = $J.idiv(bonus, 2);
        let maxBonusLevel = (3 + (this.charger.target).pointsInTalent(Talent.WILD_POWER)) | 0;
        if (lvl < maxBonusLevel) {
          lvl = Math.min((lvl + bonus) | 0, maxBonusLevel);
        }
      }
      let buff = this.charger.target.buff($J.cls(WandOfMagicMissile$MagicCharge));
      if (buff != null && buff.level() > lvl) {
        return buff.level();
      }
    }
    return lvl;
  }
  updateLevel(): void {
    this.maxCharges = Math.min((this.initialCharges() + this.level$()) | 0, 10);
    this.curCharges = Math.min(this.curCharges, this.maxCharges);
  }
  initialCharges(): number {
    return 2;
  }
  chargesPerCast(): number {
    return 1;
  }
  fx(bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(Item.curUser.sprite_.parent, MagicMissile.MAGIC_MISSILE, Item.curUser.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  staffFx(particle: MagesStaff$StaffParticle): void {
    particle.color$int(16777215);
    particle.am = Math.fround(0.3);
    particle.setLifespan(1);
    particle.speed_.polar(Random.Float$float(PointF.PI2), 2);
    particle.setSize(1, 2);
    particle.radiateXY(0.5);
  }
  wandUsed(): void {
    if (!this.isIdentified()) {
      let uses = Math.min(this.availableUsesToID, Talent.itemIDSpeedFactor(Dungeon.hero, this));
      this.availableUsesToID = Math.fround(this.availableUsesToID - uses);
      this.usesLeftToID = Math.fround(this.usesLeftToID - uses);
      if (this.usesLeftToID <= Math.fround(0) || Dungeon.hero.pointsInTalent(Talent.SCHOLARS_INTUITION) === 2) {
        if (ShardOfOblivion.passiveIDDisabled()) {
          if (this.usesLeftToID > Math.fround(-1)) {
            GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [this.name()]);
          }
          this.setIDReady();
        } else {
          this.identify$();
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'identify', []), []);
          Badges.validateItemLevelAquired(this);
        }
      }
      if (ShardOfOblivion.passiveIDDisabled()) {
        Buff.prolong(Item.curUser, $J.cls(ShardOfOblivion$WandUseTracker), 50);
      }
    }
    if (this.charger != null && this.charger.target === Dungeon.hero && !Dungeon.hero.belongings.contains(this)) {
      if (Dungeon.hero.hasTalent(Talent.EXCESS_CHARGE) && this.curCharges >= this.maxCharges) {
        let shieldToGive = $J.roundf(Math.fround(Math.fround(this.buffedLvl() * Math.fround(0.67)) * Dungeon.hero.pointsInTalent(Talent.EXCESS_CHARGE)));
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(Barrier)).setShield(shieldToGive);
        Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldToGive), FloatingText.SHIELDING, []);
      }
    }
    this.curCharges = (this.curCharges - (this.cursed ? 1 : this.chargesPerCast())) | 0;
    let buff = Item.curUser.buff($J.cls(WandOfMagicMissile$MagicCharge));
    if (buff != null && buff.wandJustApplied() !== this && buff.level() === this.buffedLvl() && this.buffedLvl() > super.buffedLvl()) {
      buff.detach();
    } else {
      let empower = Item.curUser.buff($J.cls(ScrollEmpower));
      if (empower != null) {
        empower.use();
      }
    }
    if (Dungeon.hero.hasTalent(Talent.EMPOWERED_STRIKE) && this.charger != null && this.charger.target === Dungeon.hero && !Dungeon.hero.belongings.contains(this)) {
      Buff.prolong(Dungeon.hero, $J.cls(Talent$EmpoweredStrikeTracker), 10);
    }
    if (Dungeon.hero.hasTalent(Talent.LINGERING_MAGIC) && this.charger != null && this.charger.target === Dungeon.hero) {
      Buff.prolong(Dungeon.hero, $J.cls(Talent$LingeringMagicTracker), 5);
    }
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.DIVINE_SENSE)) {
      Buff.prolong(Dungeon.hero, $J.cls(DivineSense$DivineSenseTracker), Math.fround(Dungeon.hero.cooldown() + 1));
    }
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.CLEANSE) && Random.Int$int(10) < Dungeon.hero.pointsInTalent(Talent.CLEANSE)) {
      let removed = false;
      for (const $it0 = Dungeon.hero.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        if (b.type_ === Buff$buffType.NEGATIVE && !(b instanceof LostInventory)) {
          b.detach();
          removed = true;
        }
      }
      if (removed) {
        new Flare()._Flare(6, 32).color$int$boolean(16731346, true).show$Visual$float(Dungeon.hero.sprite_, 2);
      }
    }
    Invisibility.dispel$();
    Item.updateQuickslot();
    Item.curUser.spendAndNext(Wand.TIME_TO_ZAP);
  }
  random(): Item {
    let n = 0;
    if (Random.Int$int(3) === 0) {
      n++;
      if (Random.Int$int(5) === 0) {
        n++;
      }
    }
    this.level$int(n);
    this.curCharges = (this.curCharges + n) | 0;
    if (Random.Float$() < Math.fround(0.3)) {
      this.cursed = true;
    }
    return this;
  }
  glowing(): ItemSprite$Glowing {
    if (this.resinBonus === 0) {
      return null;
    }
    return new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(16777215, Math.fround(1 / Math.fround(this.resinBonus)));
  }
  value(): number {
    let price = 75;
    if (this.cursed && this.cursedKnown) {
      price = $J.idiv(price, 2);
    }
    if (this.levelKnown) {
      if (this.level$() > 0) {
        price = Math.imul(price, ((this.level$() + 1) | 0));
      } else if (this.level$() < 0) {
        price = $J.idiv(price, ((1 - this.level$()) | 0));
      }
    }
    if (price < 1) {
      price = 1;
    }
    return price;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Wand.USES_LEFT_TO_ID, this.usesLeftToID);
    bundle.put$String$float(Wand.AVAILABLE_USES, this.availableUsesToID);
    bundle.put$String$int(Wand.CUR_CHARGES, this.curCharges);
    bundle.put$String$boolean(Wand.CUR_CHARGE_KNOWN, this.curChargeKnown);
    bundle.put$String$float(Wand.PARTIALCHARGE, this.partialCharge);
    bundle.put$String$boolean(Wand.CURSE_INFUSION_BONUS, this.curseInfusionBonus);
    bundle.put$String$int(Wand.RESIN_BONUS, this.resinBonus);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.usesLeftToID = Math.fround(bundle.getInt(Wand.USES_LEFT_TO_ID));
    this.availableUsesToID = Math.fround(bundle.getInt(Wand.AVAILABLE_USES));
    this.curseInfusionBonus = bundle.getBoolean(Wand.CURSE_INFUSION_BONUS);
    this.resinBonus = bundle.getInt(Wand.RESIN_BONUS);
    this.updateLevel();
    this.curCharges = bundle.getInt(Wand.CUR_CHARGES);
    this.curChargeKnown = bundle.getBoolean(Wand.CUR_CHARGE_KNOWN);
    this.partialCharge = bundle.getFloat(Wand.PARTIALCHARGE);
  }
  reset(): void {
    super.reset();
    this.usesLeftToID = Math.fround(Wand.USES_TO_ID);
    this.availableUsesToID = Math.fround(Wand.USES_TO_ID / 2);
  }
  collisionProperties(target: number): number {
    if (this.cursed) {
      return Ballistica.MAGIC_BOLT;
    } else {
      return this.collisionProperties_;
    }
  }
  static $clinit() {
    Wand.zapper = new (Wand$1())()._CellSelector$Listener();
  }
}

export class Wand$PlaceHolder extends Wand {
  _Wand$PlaceHolder(): this {
    this._Wand();
    this.image_ = ItemSpriteSheet.WAND_HOLDER;
    return this;
  }
  isSimilar(item: Item): boolean {
    return item instanceof Wand;
  }
  onZap(attack: Ballistica): void {
  }
  onHit(staff: MagesStaff, attacker: Char, defender: Char, damage: number): void {
  }
  info(): string {
    return '';
  }
}

export class Wand$Charger extends Buff {
  static readonly BASE_CHARGE_DELAY: number = 10;
  static readonly SCALING_CHARGE_ADDITION: number = 40;
  static readonly NORMAL_SCALE_FACTOR: number = 0.875;
  static readonly CHARGE_BUFF_BONUS: number = 0.25;
  scalingFactor: number = 0;
  _Wand$Charger(): this {
    this._Buff();
    this.scalingFactor = Wand$Charger.NORMAL_SCALE_FACTOR;
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
  act(): boolean {
    if (this.$outer.curCharges < this.$outer.maxCharges && this.target.buff($J.cls(MagicImmune)) == null) {
      this.recharge();
    }
    while (this.$outer.partialCharge >= Math.fround(1) && this.$outer.curCharges < this.$outer.maxCharges) {
      this.$outer.partialCharge--;
      this.$outer.curCharges++;
      Item.updateQuickslot();
    }
    if (this.$outer.curCharges === this.$outer.maxCharges) {
      this.$outer.partialCharge = 0;
    }
    this.spend(Actor.TICK);
    return true;
  }
  recharge(): void {
    let missingCharges = (this.$outer.maxCharges - this.$outer.curCharges) | 0;
    missingCharges = Math.max(0, missingCharges);
    let turnsToCharge = Math.fround((Wand$Charger.BASE_CHARGE_DELAY + (Wand$Charger.SCALING_CHARGE_ADDITION * $J.pow(this.scalingFactor, missingCharges))));
    if (Regeneration.regenOn()) {
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + Math.fround((Math.fround(1 / turnsToCharge)) * RingOfEnergy.wandChargeMultiplier(this.target)));
    }
    for (const $it2 = this.target.buffs$Class($J.cls(Recharging)).iterator(); $it2.hasNext(); ) {
      let bonus = $it2.next();
      if (bonus != null && bonus.remainder() > 0) {
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + Math.fround(Wand$Charger.CHARGE_BUFF_BONUS * bonus.remainder()));
      }
    }
  }
  wand(): Wand {
    return this.$outer;
  }
  gainCharge(charge: number): void {
    if (this.$outer.curCharges < this.$outer.maxCharges) {
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + charge);
      while (this.$outer.partialCharge >= 1) {
        this.$outer.curCharges++;
        this.$outer.partialCharge--;
      }
      if (this.$outer.curCharges >= this.$outer.maxCharges) {
        this.$outer.partialCharge = 0;
        this.$outer.curCharges = this.$outer.maxCharges;
      }
      Item.updateQuickslot();
    }
  }
  setScaleFactor(value: number): void {
    this.scalingFactor = value;
  }
}

let $Wand$1$1: any = null;
/** An anonymous class (Wand.java:760). */
function Wand$1$1(): any {
  return $Wand$1$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_curWand.wandUsed();
    }
    $c($curWand): this {
      this.$cv_curWand = $curWand;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$1$1', ['com.watabou.utils.Callback']);
}

let $Wand$1$2$1: any = null;
/** An anonymous class (Wand.java:774). */
function Wand$1$2$1(): any {
  return $Wand$1$2$1 ??= $J.local(class extends JObject {
    call(): void {
      WondrousResin.forcePositive = false;
      this.$cv_curWand.wandUsed();
    }
    $c($curWand): this {
      this.$cv_curWand = $curWand;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$1$2$1', ['com.watabou.utils.Callback']);
}

let $Wand$1$2: any = null;
/** An anonymous class (Wand.java:767). */
function Wand$1$2(): any {
  return $Wand$1$2 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_curWand.onZap(this.$cv_shot);
      if (Random.Float$() < WondrousResin.extraCurseEffectChance$()) {
        WondrousResin.forcePositive = true;
        CursedWand.cursedZap(this.$cv_curWand, Item.curUser, new Ballistica()._Ballistica(Item.curUser.pos, this.$cv_target, Ballistica.MAGIC_BOLT), new (Wand$1$2$1())().$o(this).$c(this.$cv_curWand));
      } else {
        this.$cv_curWand.wandUsed();
      }
    }
    $c($curWand, $shot, $target): this {
      this.$cv_curWand = $curWand; this.$cv_shot = $shot; this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$1$2', ['com.watabou.utils.Callback']);
}

let $Wand$1: any = null;
/** An anonymous class (Wand.java:663). */
function Wand$1(): any {
  return $Wand$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target != null) {
        let curWand: Wand;
        if (Item.curItem instanceof Wand) {
          curWand = Item.curItem;
        } else {
          return;
        }
        let shot = new Ballistica()._Ballistica(Item.curUser.pos, target, curWand.collisionProperties(target));
        let cell = shot.collisionPos;
        if (target === Item.curUser.pos || cell === Item.curUser.pos) {
          if (target === Item.curUser.pos && Item.curUser.hasTalent(Talent.SHIELD_BATTERY)) {
            if (Item.curUser.buff($J.cls(MagicImmune)) != null) {
              GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'no_magic', []), []);
              return;
            }
            if (curWand.curCharges === 0) {
              GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'fizzles', []), []);
              return;
            }
            let shield = Math.fround(Item.curUser.HT * (Math.fround(Math.fround(0.04) * curWand.curCharges)));
            if (Item.curUser.pointsInTalent(Talent.SHIELD_BATTERY) === 2) {
              shield = Math.fround(shield * 1.5);
            }
            Buff.affect$Char$Class(Item.curUser, $J.cls(Barrier)).setShield($J.roundf(shield));
            Item.curUser.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.roundf(shield)), FloatingText.SHIELDING, []);
            curWand.curCharges = 0;
            Item.curUser.sprite_.operate$int(Item.curUser.pos);
            Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
            ScrollOfRecharging.charge(Item.curUser);
            Item.updateQuickslot();
            Item.curUser.spendAndNext(Actor.TICK);
            return;
          }
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'self_target', []), []);
          return;
        }
        Item.curUser.sprite_.zap$int(cell);
        if (Actor.findChar(target) != null) {
          QuickSlotButton.target(Actor.findChar(target));
        } else {
          QuickSlotButton.target(Actor.findChar(cell));
        }
        if (curWand.tryToZap(Item.curUser, target)) {
          Item.curUser.busy();
          if (Item.curUser.hasTalent(Talent.BACKUP_BARRIER) && curWand.curCharges === curWand.chargesPerCast() && curWand.charger != null && curWand.charger.target === Item.curUser) {
            if (Item.curUser.heroClass === HeroClass.MAGE && !Item.curUser.belongings.contains(curWand)) {
              let shieldToGive = (1 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.BACKUP_BARRIER))) | 0;
              Buff.affect$Char$Class(Dungeon.hero, $J.cls(Barrier)).setShield(shieldToGive);
              Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldToGive), FloatingText.SHIELDING, []);
            } else if (Item.curUser.heroClass !== HeroClass.MAGE) {
              let highest = true;
              for (const $it1 = Item.curUser.belongings.getAllItems($J.cls(Wand)).iterator(); $it1.hasNext(); ) {
                let i = $it1.next();
                if (i.level$() > curWand.level$()) {
                  highest = false;
                }
              }
              if (highest) {
                let shieldToGive = (1 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.BACKUP_BARRIER))) | 0;
                Buff.affect$Char$Class(Dungeon.hero, $J.cls(Barrier)).setShield(shieldToGive);
                Dungeon.hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldToGive), FloatingText.SHIELDING, []);
              }
            }
          }
          if (curWand.cursed) {
            if (!curWand.cursedKnown) {
              GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Wand), 'curse_discover', [curWand.name()]), []);
            }
            CursedWand.cursedZap(curWand, Item.curUser, new Ballistica()._Ballistica(Item.curUser.pos, target, Ballistica.MAGIC_BOLT), new (Wand$1$1())().$o(this).$c(curWand));
          } else {
            curWand.fx(shot, new (Wand$1$2())().$o(this).$c(curWand, shot, target));
          }
          curWand.cursedKnown = true;
        }
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Wand), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$1', []);
}

$J.define(Wand, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Wand' }, meths: { 'degrade()': 'degrade$', 'upgrade()': 'upgrade$', 'level()': 'level$', 'identify(boolean)': 'identify$boolean', 'level(int)': 'level$int', 'charge(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float)': 'charge$Char$float', 'charge(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'charge$Char', 'gainCharge(float,boolean)': 'gainCharge$float$boolean', 'gainCharge(float)': 'gainCharge$float', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['zapper'] });
$J.define(Wand$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand', ctors: { '': '_Wand$PlaceHolder' } });
$J.define(Wand$Charger, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$Charger', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Wand$Charger' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  ScrollEmpower = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ScrollEmpower');
  SoulMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SoulMark');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$EmpoweredStrikeTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$EmpoweredStrikeTracker');
  Talent$LingeringMagicTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LingeringMagicTracker');
  Talent$SearingLightCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SearingLightCooldown');
  WildMagic$WildMagicTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic$WildMagicTracker');
  DivineSense$DivineSenseTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense$DivineSenseTracker');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  TalismanOfForesight$CharAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$CharAwareness');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  ShardOfOblivion$WandUseTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion$WandUseTracker');
  WondrousResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  WandOfMagicMissile$MagicCharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile$MagicCharge');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
