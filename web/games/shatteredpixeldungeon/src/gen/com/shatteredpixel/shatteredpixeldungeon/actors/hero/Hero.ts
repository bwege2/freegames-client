// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/Hero.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JObject, LinkedHashMap } from '../../../../../../jre/index.ts';
import { Char } from '../Char.ts';

let Assets$Sounds, Badges, Bones, Dungeon, GamesInProgress, SPDSettings, Statistics, Actor, Char$Alignment, Char$Property, SacrificialFire$Marked, AdrenalineSurge, ArtifactRecharge, AscensionChallenge, Awareness, Barrier, Berserk, Bless, Buff, Buff$buffType, Charm, Combo, Combo$ParryTracker, Combo$RiposteTracker, Drowsy, Foresight, GreaterHaste, HeroDisguise, HoldFast, Hunger, Invisibility, Invulnerability, Levitation, LostInventory, MindVision, Momentum, MonkEnergy$MonkAbility$Focus$FocusBuff, MonkEnergy$MonkAbility$Meditate$MeditateResistance, MonkEnergy$MonkAbility$UnarmedAbilityTracker, Paralysis, PhysicalEmpower, Recharging, Regeneration, SnipersMark, TimeStasis, Vertigo, Belongings, HeroAction$Alchemy, HeroAction$Attack, HeroAction$Buy, HeroAction$Interact, HeroAction$LvlTransition, HeroAction$Mine, HeroAction$Move, HeroAction$OpenChest, HeroAction$PickUp, HeroAction$Unlock, HeroClass, HeroSubClass, Talent, Talent$AggressiveBarrierCooldown, Talent$LethalMomentumTracker, Talent$LiquidAgilACCTracker, Talent$LiquidAgilEVATracker, Talent$PatientStrikeTracker, Talent$PreciseAssaultTracker, Talent$RejuvenatingStepsFurrow, Talent$WandPreservationCounter, Talent$WarriorFoodImmunity, AscendedForm$AscendBuff, Challenge$DuelParticipant, ElementalStrike$ElementalStrikeFurrowCounter, NaturesPower$naturesPowerTracker, Endure$EndureTracker, BodyForm$BodyFormBuff, HallowedGround$HallowedFurrowTracker, HolyWard$HolyArmBuff, HolyWeapon, HolyWeapon$HolyWepBuff, Smite, Smite$SmiteTracker, Mimic, Mob, Monk, Snake, Imp, Imp$Quest, CellEmitter, FloatingText, Speck, SpellSprite, Splash, Ankh, BrokenSeal$WarriorShield, Dewdrop, EquipableItem, Heap$Type, Item, Armor$Glyph, ClassArmor, ClothArmor, Stone, Viscosity$DeferedDamage, AlchemistsToolkit, AlchemistsToolkit$kitEnergy, CapeOfThorns$Thorns, CloakOfShadows, DriedRose$GhostHero, DriedRose$Petal, EtherealChains$chainsRecharge, HolyTome, HornOfPlenty$hornRecharge, MasterThievesArmband$Thievery, SkeletonKey, SkeletonKey$KeyReplacementTracker, SkeletonKey$keyRecharge, TalismanOfForesight$Foresight, TimekeepersHourglass$sandBag, TimekeepersHourglass$timeStasis, MagicalHolster, Guidebook, CrystalKey, GoldenKey, IronKey, Key, WornKey, Potion, PotionOfExperience, PotionOfHealing, ElixirOfMight$HTBoost, PotionOfDivineInspiration$DivineInspirationTracker, DarkGold, DwarfToken, EscapeCrystal, Pickaxe, Ring, RingOfAccuracy, RingOfEvasion, RingOfForce, RingOfForce$Force, RingOfFuror, RingOfHaste, RingOfMight, RingOfTenacity, Scroll, ScrollOfMagicMapping, ScrollOfChallenge$ChallengeArena, ThirteenLeafClover, Wand, WandOfLivingEarth$RockArmor, SpiritBow$SpiritArrow, Weapon, Weapon$Enchantment, Crossbow, Crossbow$ChargedShot, Flail, Flail$SpinAbilityTracker, MagesStaff, MeleeWeapon$Charger, Quarterstaff$DefensiveStance, RoundShield$GuardTracker, Sai$ComboStrikeTracker, Scimitar$SwordDance, WornShortsword, MissileWeapon, MissileWeapon$UpgradedSetTracker, Catalog, Document, Notes, Level, MiningLevel, Terrain, VaultLevel, Chasm, LevelTransition$Type, WeakFloorRoom$WellID, Ballistica, ShadowCaster, Messages, AlchemyScene, GameScene, PixelScene, WelcomeScene, CharSprite, ImpSprite, AttackIndicator, BuffIndicator, QuickSlotButton, StatusPane, GLog, WndHero, WndOptions, WndResurrect, WndTradeItem, Game, Sample, Delayer, BArray, GameMath, PathFinder, Random;

export class Hero extends Char {
  static readonly MAX_LEVEL: number = 30;
  static readonly STARTING_STR: number = 10;
  static readonly TIME_TO_REST: number = 1;
  static readonly TIME_TO_SEARCH: number = 2;
  static readonly HUNGER_FOR_SEARCH: number = 6;
  heroClass: HeroClass = null;
  subClass: HeroSubClass = null;
  armorAbility: ArmorAbility = null;
  talents_: ArrayList<LinkedHashMap<Talent, number>> = null;
  metamorphedTalents: LinkedHashMap<Talent, Talent> = null;
  attackSkill_: number = 0;
  defenseSkill_: number = 0;
  ready_: boolean = false;
  damageInterrupt: boolean = false;
  curAction: HeroAction = null;
  lastAction: HeroAction = null;
  attackTarget_: Char = null;
  resting: boolean = false;
  belongings: Belongings = null;
  STR_: number = 0;
  awareness: number = 0;
  lvl: number = 0;
  exp: number = 0;
  HTBoost: number = 0;
  visibleEnemies_: ArrayList<Mob> = null;
  mindVisionEnemies: ArrayList<Mob> = null;
  static readonly CLASS: string = 'class';
  static readonly SUBCLASS: string = 'subClass';
  static readonly ABILITY: string = 'armorAbility';
  static readonly ATTACK: string = 'attackSkill';
  static readonly DEFENSE: string = 'defenseSkill';
  static readonly STRENGTH: string = 'STR';
  static readonly LEVEL: string = 'lvl';
  static readonly EXPERIENCE: string = 'exp';
  static readonly HTBOOST: string = 'htboost';
  canSelfTrample_: boolean = false;
  waitOrPickup: boolean = false;
  walkingToVisibleTrapInFog: boolean = false;
  berserk: Berserk = null;
  _Hero(): this {
    this._Char();
    this.actPriority = Actor.HERO_PRIO;
    this.alignment = Char$Alignment.ALLY;
    this.heroClass = HeroClass.ROGUE;
    this.subClass = HeroSubClass.NONE;
    this.armorAbility = null;
    this.talents_ = new ArrayList();
    this.metamorphedTalents = new LinkedHashMap();
    this.attackSkill_ = 10;
    this.defenseSkill_ = 5;
    this.ready_ = false;
    this.damageInterrupt = true;
    this.curAction = null;
    this.lastAction = null;
    this.resting = false;
    this.lvl = 1;
    this.exp = 0;
    this.HTBoost = 0;
    this.mindVisionEnemies = new ArrayList();
    this.canSelfTrample_ = false;
    this.waitOrPickup = false;
    this.walkingToVisibleTrapInFog = false;
    this.HP = this.HT = 20;
    this.STR_ = Hero.STARTING_STR;
    this.belongings = new Belongings()._Belongings(this);
    this.visibleEnemies_ = new ArrayList();
    return this;
  }
  updateHT(boostHP: boolean): void {
    let curHT = this.HT;
    this.HT = (20 + Math.imul(5, ((this.lvl - 1) | 0)) + this.HTBoost) | 0;
    let multiplier = RingOfMight.HTMultiplier(this);
    this.HT = $J.roundf(Math.fround(multiplier * this.HT));
    if (this.buff($J.cls(ElixirOfMight$HTBoost)) != null) {
      this.HT = (this.HT + this.buff($J.cls(ElixirOfMight$HTBoost)).boost()) | 0;
    }
    if (boostHP) {
      this.HP = (this.HP + Math.max((this.HT - curHT) | 0, 0)) | 0;
    }
    this.HP = Math.min(this.HP, this.HT);
  }
  STR(): number {
    let strBonus = 0;
    strBonus = (strBonus + RingOfMight.strengthBonus(this)) | 0;
    let buff = this.buff($J.cls(AdrenalineSurge));
    if (buff != null) {
      strBonus = (strBonus + buff.boost()) | 0;
    }
    if (this.hasTalent(Talent.STRONGMAN)) {
      strBonus = (strBonus + $J.d2i(Math.floor(Math.fround(this.STR_ * (Math.fround(Math.fround(0.03) + Math.fround(Math.fround(0.05) * this.pointsInTalent(Talent.STRONGMAN)))))))) | 0;
    }
    return (this.STR_ + strBonus) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(Hero.CLASS, this.heroClass);
    bundle.put$String$Enum(Hero.SUBCLASS, this.subClass);
    bundle.put$String$Bundlable(Hero.ABILITY, this.armorAbility);
    Talent.storeTalentsInBundle(bundle, this);
    bundle.put$String$int(Hero.ATTACK, this.attackSkill_);
    bundle.put$String$int(Hero.DEFENSE, this.defenseSkill_);
    bundle.put$String$int(Hero.STRENGTH, this.STR_);
    bundle.put$String$int(Hero.LEVEL, this.lvl);
    bundle.put$String$int(Hero.EXPERIENCE, this.exp);
    bundle.put$String$int(Hero.HTBOOST, this.HTBoost);
    this.belongings.storeInBundle(bundle);
  }
  restoreFromBundle(bundle: Bundle): void {
    this.lvl = bundle.getInt(Hero.LEVEL);
    this.exp = bundle.getInt(Hero.EXPERIENCE);
    this.HTBoost = bundle.getInt(Hero.HTBOOST);
    super.restoreFromBundle(bundle);
    this.heroClass = bundle.getEnum(Hero.CLASS, $J.cls(HeroClass));
    this.subClass = bundle.getEnum(Hero.SUBCLASS, $J.cls(HeroSubClass));
    this.armorAbility = bundle.get$String(Hero.ABILITY);
    Talent.restoreTalentsFromBundle(bundle, this);
    this.attackSkill_ = bundle.getInt(Hero.ATTACK);
    this.defenseSkill_ = bundle.getInt(Hero.DEFENSE);
    this.STR_ = bundle.getInt(Hero.STRENGTH);
    this.belongings.restoreFromBundle(bundle);
  }
  static preview(info: GamesInProgress$Info, bundle: Bundle): void {
    info.level_ = bundle.getInt(Hero.LEVEL);
    info.str = bundle.getInt(Hero.STRENGTH);
    info.exp = bundle.getInt(Hero.EXPERIENCE);
    info.hp = bundle.getInt(Char.TAG_HP);
    info.ht = bundle.getInt(Char.TAG_HT);
    info.shld = bundle.getInt(Char.TAG_SHLD);
    info.heroClass = bundle.getEnum(Hero.CLASS, $J.cls(HeroClass));
    info.subClass = bundle.getEnum(Hero.SUBCLASS, $J.cls(HeroSubClass));
    Belongings.preview(info, bundle);
  }
  hasTalent(talent: Talent): boolean {
    return this.pointsInTalent(talent) > 0;
  }
  pointsInTalent(talent: Talent): number {
    for (const $it0 = this.talents_.iterator(); $it0.hasNext(); ) {
      let tier = $it0.next();
      for (const $it1 = tier.keySet().iterator(); $it1.hasNext(); ) {
        let f = $it1.next();
        if (f === talent) {
          return tier.get(f);
        }
      }
    }
    return 0;
  }
  upgradeTalent(talent: Talent): void {
    for (const $it2 = this.talents_.iterator(); $it2.hasNext(); ) {
      let tier = $it2.next();
      for (const $it3 = tier.keySet().iterator(); $it3.hasNext(); ) {
        let f = $it3.next();
        if (f === talent) {
          tier.put(talent, (tier.get(talent) + 1) | 0);
        }
      }
    }
    Talent.onTalentUpgraded(this, talent);
  }
  talentPointsSpent(tier: number): number {
    let total = 0;
    for (const $it4 = this.talents_.get((tier - 1) | 0).values().iterator(); $it4.hasNext(); ) {
      let i = $it4.next();
      total = (total + i) | 0;
    }
    return total;
  }
  talentPointsAvailable(tier: number): number {
    if (this.lvl < ((Talent.tierLevelThresholds[tier] - 1) | 0) || (tier === 3 && this.subClass === HeroSubClass.NONE) || (tier === 4 && this.armorAbility == null)) {
      return 0;
    } else if (this.lvl >= (Talent.tierLevelThresholds[(tier + 1) | 0])) {
      return ((Talent.tierLevelThresholds[(tier + 1) | 0]) - Talent.tierLevelThresholds[tier] - this.talentPointsSpent(tier) + this.bonusTalentPoints(tier)) | 0;
    } else {
      return (1 + this.lvl - Talent.tierLevelThresholds[tier] - this.talentPointsSpent(tier) + this.bonusTalentPoints(tier)) | 0;
    }
  }
  bonusTalentPoints(tier: number): number {
    if (this.lvl < ((Talent.tierLevelThresholds[tier] - 1) | 0) || (tier === 3 && this.subClass === HeroSubClass.NONE) || (tier === 4 && this.armorAbility == null)) {
      return 0;
    } else if (this.buff($J.cls(PotionOfDivineInspiration$DivineInspirationTracker)) != null && this.buff($J.cls(PotionOfDivineInspiration$DivineInspirationTracker)).isBoosted(tier)) {
      return 2;
    } else {
      return 0;
    }
  }
  className(): string {
    return this.subClass == null || this.subClass === HeroSubClass.NONE ? this.heroClass.title() : this.subClass.title();
  }
  name(): string {
    if (this.buff($J.cls(HeroDisguise)) != null) {
      return this.buff($J.cls(HeroDisguise)).getDisguise().title();
    } else {
      return this.className();
    }
  }
  hitSound(pitch: number): void {
    if (!RingOfForce.fightingUnarmed(this)) {
      this.belongings.attackingWeapon().hitSound(pitch);
    } else if (Ring.getBuffedBonus(this, $J.cls(RingOfForce$Force)) > 0) {
      super.hitSound(Math.fround(pitch * GameMath.gate(0.75, Math.fround(1.25 - Math.fround(Math.fround(0.025) * this.STR())), 1)));
    } else {
      super.hitSound(Math.fround(pitch * Math.fround(1.1)));
    }
  }
  blockSound(pitch: number): boolean {
    if (this.belongings.weapon() != null && this.belongings.weapon().defenseFactor(this) >= 4) {
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_PARRY, 1, pitch);
      return true;
    }
    return super.blockSound(pitch);
  }
  live(): void {
    for (const $it5 = this.buffs$().iterator(); $it5.hasNext(); ) {
      let b = $it5.next();
      if (!b.revivePersists) {
        b.detach();
      }
    }
    Buff.affect$Char$Class(this, $J.cls(Regeneration));
    Buff.affect$Char$Class(this, $J.cls(Hunger));
  }
  tier(): number {
    let armor = this.belongings.armor();
    if (armor instanceof ClassArmor) {
      return 6;
    } else if (armor != null) {
      return armor.tier_;
    } else {
      return 0;
    }
  }
  shoot(enemy: Char, wep: MissileWeapon): boolean {
    this.attackTarget_ = enemy;
    let wasEnemy = enemy.alignment === Char$Alignment.ENEMY || (enemy instanceof Mimic && enemy.alignment === Char$Alignment.NEUTRAL);
    this.belongings.thrownWeapon = wep;
    let hit = this.attack$Char(enemy);
    Invisibility.dispel$();
    this.belongings.thrownWeapon = null;
    if (hit && this.subClass === HeroSubClass.GLADIATOR && wasEnemy) {
      Buff.affect$Char$Class(this, $J.cls(Combo)).hit(enemy);
    }
    if (hit && this.heroClass === HeroClass.DUELIST && wasEnemy) {
      Buff.affect$Char$Class(this, $J.cls(Sai$ComboStrikeTracker)).addHit(this.attackTarget_);
    }
    this.attackTarget_ = null;
    return hit;
  }
  attack$Char$float$float$float(enemy: Char, dmgMulti: number, dmgBonus: number, accMulti: number): boolean {
    let result = super.attack$Char$float$float$float(enemy, dmgMulti, dmgBonus, accMulti);
    if (!(this.belongings.attackingWeapon() instanceof MissileWeapon)) {
      if (this.buff($J.cls(Talent$PreciseAssaultTracker)) != null) {
        this.buff($J.cls(Talent$PreciseAssaultTracker)).detach();
      } else if (this.buff($J.cls(Talent$LiquidAgilACCTracker)) != null && this.buff($J.cls(Talent$LiquidAgilACCTracker)).uses <= 0) {
        this.buff($J.cls(Talent$LiquidAgilACCTracker)).detach();
      }
    }
    return result;
  }
  attackSkill(target: Char): number {
    let wep = this.belongings.attackingWeapon();
    let accuracy = 1;
    accuracy = Math.fround(accuracy * RingOfAccuracy.accuracyMultiplier(this));
    if (!(wep instanceof MissileWeapon)) {
      if ((this.hasTalent(Talent.PRECISE_ASSAULT) || this.hasTalent(Talent.LIQUID_AGILITY)) && this.belongings.abilityWeapon !== wep && this.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) == null) {
        if (this.heroClass !== HeroClass.DUELIST) {
          accuracy = Math.fround(accuracy * Math.fround(1 + Math.fround(Math.fround(0.1) * this.pointsInTalent(Talent.PRECISE_ASSAULT))));
        }
        if (wep instanceof Flail && this.buff($J.cls(Flail$SpinAbilityTracker)) != null) {
        } else if (wep instanceof Crossbow && this.buff($J.cls(Crossbow$ChargedShot)) != null) {
        } else if (this.buff($J.cls(Talent$PreciseAssaultTracker)) != null) {
          switch (this.pointsInTalent(Talent.PRECISE_ASSAULT)) {
            default:
            case 1:
              accuracy = Math.fround(accuracy * 2);
              break;
            case 2:
              accuracy = Math.fround(accuracy * 5);
              break;
            case 3:
              accuracy = Math.fround(accuracy * Infinity);
              break;
          }
        } else if (this.buff($J.cls(Talent$LiquidAgilACCTracker)) != null) {
          accuracy = Math.fround(accuracy * (this.pointsInTalent(Talent.LIQUID_AGILITY) === 2 ? Infinity : 3));
          let buff = this.buff($J.cls(Talent$LiquidAgilACCTracker));
          buff.uses--;
        }
      }
    } else {
      if (this.buff($J.cls(Momentum)) != null && this.buff($J.cls(Momentum)).freerunning()) {
        accuracy = Math.fround(accuracy * Math.fround(1 + Math.fround(this.pointsInTalent(Talent.PROJECTILE_MOMENTUM) / 2)));
      }
    }
    if (this.buff($J.cls(Scimitar$SwordDance)) != null) {
      accuracy = Math.fround(accuracy * 1.5);
    }
    if (!RingOfForce.fightingUnarmed(this)) {
      return Math.max(1, $J.roundf(Math.fround(Math.fround(this.attackSkill_ * accuracy) * wep.accuracyFactor(this, target))));
    } else {
      return Math.max(1, $J.roundf(Math.fround(this.attackSkill_ * accuracy)));
    }
  }
  defenseSkill(enemy: Char): number {
    if (this.buff($J.cls(Combo$ParryTracker)) != null) {
      if (this.canAttack(enemy) && !this.isCharmedBy(enemy)) {
        Buff.affect$Char$Class(this, $J.cls(Combo$RiposteTracker)).enemy = enemy;
      }
      return Char.INFINITE_EVASION;
    }
    if (this.buff($J.cls(RoundShield$GuardTracker)) != null) {
      return Char.INFINITE_EVASION;
    }
    let evasion = Math.fround(this.defenseSkill_);
    evasion = Math.fround(evasion * RingOfEvasion.evasionMultiplier(this));
    if (this.buff($J.cls(Talent$LiquidAgilEVATracker)) != null) {
      if (this.pointsInTalent(Talent.LIQUID_AGILITY) === 1) {
        evasion = Math.fround(evasion * 3);
      } else if (this.pointsInTalent(Talent.LIQUID_AGILITY) === 2) {
        return Char.INFINITE_EVASION;
      }
    }
    if (this.buff($J.cls(Quarterstaff$DefensiveStance)) != null) {
      evasion = Math.fround(evasion * 3);
    }
    if (this.paralysed > 0) {
      evasion = Math.fround(evasion / 2);
    }
    if (this.belongings.armor() != null) {
      evasion = this.belongings.armor().evasionFactor(this, evasion);
      if (this.belongings.armor().hasGlyph($J.cls(Stone), this) && !Stone.testingEvasion()) {
        return 0;
      }
    }
    return Math.max(1, $J.roundf(evasion));
  }
  defenseVerb(): string {
    let parry = this.buff($J.cls(Combo$ParryTracker));
    if (parry != null) {
      parry.parried = true;
      if (this.buff($J.cls(Combo)) == null || this.buff($J.cls(Combo)).getComboCount() < 9 || this.pointsInTalent(Talent.ENHANCED_COMBO) < 2) {
        parry.detach();
      }
      return Messages.get$Class$String$ObjectArr($J.cls(Monk), 'parried', []);
    }
    if (this.buff($J.cls(RoundShield$GuardTracker)) != null) {
      this.buff($J.cls(RoundShield$GuardTracker)).hasBlocked = true;
      BuffIndicator.refreshHero();
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_PARRY, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
      return Messages.get$Class$String$ObjectArr($J.cls(RoundShield$GuardTracker), 'guarded', []);
    }
    if (this.buff($J.cls(MonkEnergy$MonkAbility$Focus$FocusBuff)) != null) {
      this.buff($J.cls(MonkEnergy$MonkAbility$Focus$FocusBuff)).detach();
      if (this.sprite_ != null && this.sprite_.visible_) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_PARRY, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
      }
      return Messages.get$Class$String$ObjectArr($J.cls(Monk), 'parried', []);
    }
    return super.defenseVerb();
  }
  drRoll(): number {
    let dr = super.drRoll();
    if (this.belongings.armor() != null) {
      let armDr = Random.NormalIntRange(this.belongings.armor().DRMin$(), this.belongings.armor().DRMax$());
      if (this.STR() < this.belongings.armor().STRReq$()) {
        armDr = (armDr - Math.imul(2, ((this.belongings.armor().STRReq$() - this.STR()) | 0))) | 0;
      }
      if (armDr > 0) {
        dr = (dr + armDr) | 0;
      }
    }
    if (this.belongings.weapon() != null && !RingOfForce.fightingUnarmed(this)) {
      let wepDr = Random.NormalIntRange(0, this.belongings.weapon().defenseFactor(this));
      if (this.STR() < (this.belongings.weapon()).STRReq$()) {
        wepDr = (wepDr - Math.imul(2, (((this.belongings.weapon()).STRReq$() - this.STR()) | 0))) | 0;
      }
      if (wepDr > 0) {
        dr = (dr + wepDr) | 0;
      }
    }
    if (this.buff($J.cls(HoldFast)) != null) {
      dr = (dr + this.buff($J.cls(HoldFast)).armorBonus()) | 0;
    }
    return dr;
  }
  damageRoll(): number {
    let wep = this.belongings.attackingWeapon();
    let dmg: number;
    if (!RingOfForce.fightingUnarmed(this)) {
      dmg = wep.damageRoll(this);
      if (!(wep instanceof MissileWeapon)) {
        dmg = (dmg + RingOfForce.armedDamageBonus(this)) | 0;
      }
    } else {
      dmg = RingOfForce.damageRoll(this);
      if (RingOfForce.unarmedGetsWeaponAugment(this)) {
        dmg = (this.belongings.attackingWeapon()).augment.damageFactor$int(dmg);
      }
    }
    let emp = this.buff($J.cls(PhysicalEmpower));
    if (emp != null) {
      dmg = (dmg + emp.dmgBoost) | 0;
      emp.left_--;
      if (emp.left_ <= 0) {
        emp.detach();
      }
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_STRONG, 0.75, Math.fround(1.2));
    }
    if (this.heroClass !== HeroClass.DUELIST && this.hasTalent(Talent.WEAPON_RECHARGING) && (this.buff($J.cls(Recharging)) != null || this.buff($J.cls(ArtifactRecharge)) != null)) {
      dmg = $J.roundf(Math.fround(dmg * (Math.fround(Math.fround(1.025) + Math.fround(Math.fround(0.025) * this.pointsInTalent(Talent.WEAPON_RECHARGING))))));
    }
    if (dmg < 0) {
      dmg = 0;
    }
    return dmg;
  }
  static heroDamageIntRange(min: number, max: number): number {
    if (Random.Float$() < ThirteenLeafClover.alterHeroDamageChance$()) {
      return ThirteenLeafClover.alterDamageRoll(min, max);
    } else {
      return Random.NormalIntRange(min, max);
    }
  }
  speed(): number {
    let speed = super.speed();
    speed = Math.fround(speed * RingOfHaste.speedMultiplier(this));
    if (this.belongings.armor() != null) {
      speed = this.belongings.armor().speedFactor(this, speed);
    }
    let momentum = this.buff($J.cls(Momentum));
    if (momentum != null) {
      (this.sprite_).sprint(momentum.freerunning() ? 1.5 : 1);
      speed = Math.fround(speed * momentum.speedMultiplier());
    } else {
      (this.sprite_).sprint(1);
    }
    let natStrength = this.buff($J.cls(NaturesPower$naturesPowerTracker));
    if (natStrength != null) {
      speed = Math.fround(speed * (Math.fround(2 + Math.fround(0.25 * this.pointsInTalent(Talent.GROWING_POWER)))));
    }
    speed = AscensionChallenge.modifyHeroSpeed(speed);
    return speed;
  }
  canSurpriseAttack(): boolean {
    let w = this.belongings.attackingWeapon();
    if (!(w instanceof Weapon)) {
      return true;
    }
    if (RingOfForce.fightingUnarmed(this)) {
      return true;
    }
    if (this.STR() < (w).STRReq$()) {
      return false;
    }
    if (w instanceof Flail) {
      return false;
    }
    return super.canSurpriseAttack();
  }
  canAttack(enemy: Char): boolean {
    if (enemy == null || this.pos === enemy.pos || !Actor.chars().contains(enemy)) {
      return false;
    }
    if (Dungeon.level.adjacent(this.pos, enemy.pos)) {
      return true;
    }
    let wep = Dungeon.hero.belongings.attackingWeapon();
    if (wep != null) {
      return wep.canReach(this, enemy.pos);
    } else if (this.buff($J.cls(AscendedForm$AscendBuff)) != null) {
      let passable = BArray.not(Dungeon.level.solid, null);
      for (const $it6 = Actor.chars().iterator(); $it6.hasNext(); ) {
        let ch = $it6.next();
        if (ch !== this) {
          passable[ch.pos] = false;
        }
      }
      PathFinder.buildDistanceMap$int$booleanArr$int(enemy.pos, passable, 3);
      return PathFinder.distance[this.pos] <= 3;
    } else {
      return false;
    }
  }
  attackDelay(): number {
    if (this.buff($J.cls(Talent$LethalMomentumTracker)) != null) {
      this.buff($J.cls(Talent$LethalMomentumTracker)).detach();
      return 0;
    }
    let delay = 1;
    if (!RingOfForce.fightingUnarmed(this)) {
      return Math.fround(delay * this.belongings.attackingWeapon().delayFactor(this));
    } else {
      let speed = RingOfFuror.attackSpeedMultiplier(this);
      if (this.buff($J.cls(Scimitar$SwordDance)) != null) {
        speed = Math.fround(speed + Math.fround(0.6));
      }
      if (RingOfForce.unarmedGetsWeaponAugment(this)) {
        delay = (this.belongings.weapon_).augment.delayFactor(delay);
      }
      return Math.fround(delay / speed);
    }
  }
  spend(time: number): void {
    super.spend(time);
  }
  spendConstant(time: number): void {
    super.spendConstant(time);
  }
  spendAndNextConstant(time: number): void {
    this.busy();
    this.spendConstant(time);
    this.next();
  }
  spendAndNext(time: number): void {
    this.busy();
    this.spend(time);
    this.next();
  }
  act(): boolean {
    this.fieldOfView = Dungeon.level.heroFOV;
    if (this.buff($J.cls(Endure$EndureTracker)) != null) {
      this.buff($J.cls(Endure$EndureTracker)).endEnduring();
    }
    if (!this.ready_) {
      if (!this.resting || this.buff($J.cls(MindVision)) != null || this.buff($J.cls(Awareness)) != null) {
        Dungeon.observe$();
      } else {
        Dungeon.level.updateFieldOfView(this, this.fieldOfView);
      }
    }
    this.checkVisibleMobs();
    BuffIndicator.refreshHero();
    BuffIndicator.refreshBoss();
    if (this.paralysed > 0) {
      this.curAction = null;
      this.spendAndNext(Actor.TICK);
      return false;
    }
    let actResult: boolean;
    if (this.curAction == null) {
      if (this.resting) {
        this.spendConstant(Hero.TIME_TO_REST);
        this.next();
      } else {
        this.ready();
      }
      if (Actor.now() === Math.fround(0)) {
        if (this.buff($J.cls(Foresight)) != null) {
          this.search(false);
        } else if (this.buff($J.cls(TalismanOfForesight$Foresight)) != null) {
          this.buff($J.cls(TalismanOfForesight$Foresight)).checkAwareness();
        }
      }
      actResult = false;
    } else {
      this.resting = false;
      this.ready_ = false;
      if (this.curAction instanceof HeroAction$Move) {
        actResult = this.actMove(this.curAction);
      } else if (this.curAction instanceof HeroAction$Interact) {
        actResult = this.actInteract(this.curAction);
      } else if (this.curAction instanceof HeroAction$Buy) {
        actResult = this.actBuy(this.curAction);
      } else if (this.curAction instanceof HeroAction$PickUp) {
        actResult = this.actPickUp(this.curAction);
      } else if (this.curAction instanceof HeroAction$OpenChest) {
        actResult = this.actOpenChest(this.curAction);
      } else if (this.curAction instanceof HeroAction$Unlock) {
        actResult = this.actUnlock(this.curAction);
      } else if (this.curAction instanceof HeroAction$Mine) {
        actResult = this.actMine(this.curAction);
      } else if (this.curAction instanceof HeroAction$LvlTransition) {
        actResult = this.actTransition(this.curAction);
      } else if (this.curAction instanceof HeroAction$Attack) {
        actResult = this.actAttack(this.curAction);
      } else if (this.curAction instanceof HeroAction$Alchemy) {
        actResult = this.actAlchemy(this.curAction);
      } else {
        actResult = false;
      }
    }
    return actResult;
  }
  busy(): void {
    this.ready_ = false;
  }
  ready(): void {
    if (this.sprite_.looping()) {
      this.sprite_.idle();
    }
    this.curAction = null;
    this.damageInterrupt = true;
    this.waitOrPickup = false;
    this.ready_ = true;
    this.canSelfTrample_ = true;
    AttackIndicator.updateState();
    GameScene.ready();
    if (Dungeon.level instanceof VaultLevel && Math.fround(this.HP) < Math.fround(this.HT * Math.fround(0.334)) && !Statistics.vaultInjureWarned && SPDSettings.vaultInjureWarns$() < 3) {
      SPDSettings.vaultInjureWarns$int((SPDSettings.vaultInjureWarns$() + 1) | 0);
      Statistics.vaultInjureWarned = true;
      Game.runOnRenderThread(new (Hero$1())().$o(this));
    }
  }
  interrupt(): void {
    if (this.isAlive() && this.curAction != null && ((this.curAction instanceof HeroAction$Move && this.curAction.dst !== this.pos) || (this.curAction instanceof HeroAction$LvlTransition))) {
      this.lastAction = this.curAction;
    }
    this.curAction = null;
    GameScene.resetKeyHold();
    this.resting = false;
  }
  resume(): void {
    this.curAction = this.lastAction;
    this.lastAction = null;
    this.damageInterrupt = false;
    this.next();
  }
  canSelfTrample(): boolean {
    return this.canSelfTrample_ && !this.rooted && !this.flying && (Dungeon.level.map_[this.pos] === Terrain.HIGH_GRASS || (this.heroClass !== HeroClass.HUNTRESS && Dungeon.level.map_[this.pos] === Terrain.FURROWED_GRASS) || Dungeon.level.plants.get(this.pos) != null);
  }
  actMove(action: HeroAction$Move): boolean {
    if (this.getCloser(action.dst)) {
      this.canSelfTrample_ = false;
      return true;
    } else if (this.pos === action.dst && this.canSelfTrample()) {
      this.canSelfTrample_ = false;
      Dungeon.level.pressCell$int(this.pos);
      this.spendAndNext(Math.fround(1 / this.speed()));
      return false;
    } else {
      this.ready();
      return false;
    }
  }
  actInteract(action: HeroAction$Interact): boolean {
    let ch = action.ch;
    if (ch.isAlive() && ch.canInteract(this)) {
      this.ready();
      this.sprite_.turnTo(this.pos, ch.pos);
      return ch.interact(this);
    } else {
      if ((this.fieldOfView[ch.pos] || Char.hasProp(ch, Char$Property.OBJECT)) && this.getCloser(ch.pos)) {
        return true;
      } else {
        this.ready();
        return false;
      }
    }
  }
  actBuy(action: HeroAction$Buy): boolean {
    let dst = action.dst;
    if (this.pos === dst) {
      this.ready();
      let heap = Dungeon.level.heaps.get(dst);
      if (heap != null && heap.type_ === Heap$Type.FOR_SALE && heap.size() === 1) {
        Game.runOnRenderThread(new (Hero$2())().$o(this).$c(heap));
      }
      return false;
    } else if (this.getCloser(dst)) {
      return true;
    } else {
      this.ready();
      return false;
    }
  }
  actAlchemy(action: HeroAction$Alchemy): boolean {
    let dst = action.dst;
    if (Dungeon.level.distance(dst, this.pos) <= 1) {
      this.ready();
      let kit = this.buff($J.cls(AlchemistsToolkit$kitEnergy));
      if (kit != null && kit.isCursed()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(AlchemistsToolkit), 'cursed', []), []);
        return false;
      }
      AlchemyScene.clearToolkit();
      Game.switchScene$Class($J.cls(AlchemyScene));
      return false;
    } else if (this.getCloser(dst)) {
      return true;
    } else {
      this.ready();
      return false;
    }
  }
  actPickUp(action: HeroAction$PickUp): boolean {
    let dst = action.dst;
    if (this.pos === dst) {
      let heap = Dungeon.level.heaps.get(this.pos);
      if (heap != null) {
        let item = heap.peek();
        if (item.doPickUp$Hero(this)) {
          heap.pickUp();
          if (item instanceof Dewdrop || (item instanceof DwarfToken && Imp$Quest.mirrorUsed) || item instanceof TimekeepersHourglass$sandBag || item instanceof DriedRose$Petal || item instanceof Key || item instanceof Guidebook || (item instanceof MissileWeapon && !MissileWeapon$UpgradedSetTracker.pickupValid(this, item))) {
          } else if (item instanceof DarkGold) {
            let existing = this.belongings.getItem($J.cls(DarkGold));
            if (existing != null) {
              if (existing.quantity$() >= 40) {
                GLog.p(Messages.get$Class$String$ObjectArr($J.cls(DarkGold), 'you_now_have', [existing.quantity$()]), []);
              } else {
                GLog.i(Messages.get$Class$String$ObjectArr($J.cls(DarkGold), 'you_now_have', [existing.quantity$()]), []);
              }
            }
          } else {
            let important = item.unique && item.isIdentified() && (item instanceof Scroll || item instanceof Potion);
            if (important) {
              GLog.p(Messages.capitalize(Messages.get$Object$String$ObjectArr(this, 'you_now_have', [item.name()])), []);
            } else {
              GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(this, 'you_now_have', [item.name()])), []);
            }
          }
          this.curAction = null;
        } else {
          if (this.waitOrPickup) {
            this.spendAndNextConstant(Hero.TIME_TO_REST);
          }
          if (Dungeon.level.getTransition$int(this.pos) != null) {
            this.throwItems();
          } else {
            heap.sprite_.drop$();
          }
          if (item instanceof Dewdrop || item instanceof TimekeepersHourglass$sandBag || item instanceof DriedRose$Petal || item instanceof Key) {
          } else {
            GLog.newLine();
            GLog.n(Messages.capitalize(Messages.get$Object$String$ObjectArr(this, 'you_cant_have', [item.name()])), []);
          }
          this.ready();
        }
      } else {
        this.ready();
      }
      return false;
    } else if (this.getCloser(dst)) {
      return true;
    } else {
      this.ready();
      return false;
    }
  }
  actOpenChest(action: HeroAction$OpenChest): boolean {
    let dst = action.dst;
    if (Dungeon.level.adjacent(this.pos, dst) || this.pos === dst) {
      this.path = null;
      let heap = Dungeon.level.heaps.get(dst);
      if (heap != null && (heap.type_ !== Heap$Type.HEAP && heap.type_ !== Heap$Type.FOR_SALE)) {
        let noKey = false;
        if (heap.type_ === Heap$Type.LOCKED_CHEST) {
          noKey = Dungeon.branch !== 0 || Notes.keyCount(new GoldenKey()._GoldenKey$int(Dungeon.depth)) < 1;
        } else if (heap.type_ === Heap$Type.CRYSTAL_CHEST) {
          noKey = Dungeon.branch !== 0 || Notes.keyCount(new CrystalKey()._CrystalKey$int(Dungeon.depth)) < 1;
        }
        if (noKey) {
          GLog.w(Messages.get$Object$String$ObjectArr(this, 'locked_chest', []), []);
          this.ready();
          return false;
        }
        switch (heap.type_) {
          case Heap$Type.TOMB:
            Sample.INSTANCE.play$Object(Assets$Sounds.TOMB);
            PixelScene.shake(1, 0.5);
            break;
          case Heap$Type.SKELETON:
          case Heap$Type.REMAINS:
            break;
          default:
            Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
        }
        this.sprite_.operate$int(dst);
      } else {
        this.ready();
      }
      return false;
    } else if (this.getCloser(dst)) {
      return true;
    } else {
      this.ready();
      return false;
    }
  }
  actUnlock(action: HeroAction$Unlock): boolean {
    let doorCell = action.dst;
    if (Dungeon.level.adjacent(this.pos, doorCell)) {
      this.path = null;
      let hasKey = false;
      let door = Dungeon.level.map_[doorCell];
      if (Dungeon.branch !== 0) {
        hasKey = false;
      } else if (door === Terrain.LOCKED_DOOR && Notes.keyCount(new IronKey()._IronKey$int(Dungeon.depth)) > 0) {
        hasKey = true;
      } else if (door === Terrain.HERO_LKD_DR) {
        if (this.belongings.getItem($J.cls(SkeletonKey)) != null && !this.belongings.getItem($J.cls(SkeletonKey)).cursed) {
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'locked_with_key', []), []);
          this.ready();
          return false;
        } else {
          hasKey = true;
        }
      } else if (door === Terrain.CRYSTAL_DOOR && Notes.keyCount(new CrystalKey()._CrystalKey$int(Dungeon.depth)) > 0) {
        hasKey = true;
      } else if (door === Terrain.LOCKED_EXIT && Notes.keyCount(new WornKey()._WornKey$int(Dungeon.depth)) > 0) {
        hasKey = true;
      }
      if (hasKey) {
        this.sprite_.operate$int(doorCell);
        Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
      } else {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'locked_door', []), []);
        this.ready();
      }
      return false;
    } else if (this.getCloser(doorCell)) {
      return true;
    } else {
      this.ready();
      return false;
    }
  }
  actMine(action: HeroAction$Mine): boolean {
    if (Dungeon.level.adjacent(this.pos, action.dst)) {
      this.path = null;
      if ((Dungeon.level.map_[action.dst] === Terrain.WALL || Dungeon.level.map_[action.dst] === Terrain.WALL_DECO || Dungeon.level.map_[action.dst] === Terrain.MINE_CRYSTAL || Dungeon.level.map_[action.dst] === Terrain.MINE_BOULDER) && Dungeon.level.insideMap(action.dst)) {
        this.sprite_.attack$int$Callback(action.dst, new (Hero$3())().$o(this).$c(action));
      } else {
        this.ready();
      }
      return false;
    } else if (this.getCloser(action.dst)) {
      return true;
    } else {
      this.ready();
      return false;
    }
  }
  actTransition(action: HeroAction$LvlTransition): boolean {
    let stairs = action.dst;
    let transition = Dungeon.level.getTransition$int(stairs);
    if (this.rooted) {
      PixelScene.shake(1, 1);
      this.ready();
      return false;
    } else if (!Dungeon.level.locked && transition != null && transition.inside$int(this.pos)) {
      if (Dungeon.level.activateTransition(this, transition)) {
        this.curAction = null;
      } else {
        this.ready();
      }
      return false;
    } else if (this.getCloser(stairs)) {
      return true;
    } else {
      this.ready();
      return false;
    }
  }
  actAttack(action: HeroAction$Attack): boolean {
    this.attackTarget_ = action.target;
    if (this.isCharmedBy(this.attackTarget_)) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Charm), 'cant_attack', []), []);
      this.ready();
      return false;
    }
    if (this.attackTarget_.isAlive() && this.canAttack(this.attackTarget_) && this.attackTarget_.invisible === 0) {
      if (this.heroClass !== HeroClass.DUELIST && this.hasTalent(Talent.AGGRESSIVE_BARRIER) && this.buff($J.cls(Talent$AggressiveBarrierCooldown)) == null && (Math.fround(this.HP / Math.fround(this.HT))) <= 0.5) {
        let shieldAmt = (1 + Math.imul(2, this.pointsInTalent(Talent.AGGRESSIVE_BARRIER))) | 0;
        Buff.affect$Char$Class(this, $J.cls(Barrier)).setShield(shieldAmt);
        this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldAmt), FloatingText.SHIELDING, []);
        Buff.affect$Char$Class$float(this, $J.cls(Talent$AggressiveBarrierCooldown), 50);
      }
      this.sprite_.attack$int(this.attackTarget_.pos);
      return false;
    } else {
      if (this.fieldOfView[this.attackTarget_.pos] && this.getCloser(this.attackTarget_.pos)) {
        this.attackTarget_ = null;
        return true;
      } else {
        this.ready();
        this.attackTarget_ = null;
        return false;
      }
    }
  }
  attackTarget(): Char {
    return this.attackTarget_;
  }
  rest(fullRest: boolean): void {
    this.spendAndNextConstant(Hero.TIME_TO_REST);
    if (this.hasTalent(Talent.HOLD_FAST)) {
      if (this.heroClass !== HeroClass.WARRIOR || this.buff($J.cls(BrokenSeal$WarriorShield)) != null) {
        Buff.affect$Char$Class(this, $J.cls(HoldFast)).pos = this.pos;
      }
    }
    if (this.hasTalent(Talent.PATIENT_STRIKE)) {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(Talent$PatientStrikeTracker)).pos = Dungeon.hero.pos;
    }
    if (!fullRest) {
      if (this.sprite_ != null) {
        this.sprite_.showStatus(CharSprite.DEFAULT, Messages.get$Object$String$ObjectArr(this, 'wait', []), []);
      }
    }
    this.resting = fullRest;
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    let wep: KindOfWeapon;
    if (RingOfForce.fightingUnarmed(this) && !RingOfForce.unarmedGetsWeaponEnchantment(this)) {
      wep = null;
    } else {
      wep = this.belongings.attackingWeapon();
    }
    damage = Talent.onAttackProc(this, enemy, damage);
    if (wep != null) {
      damage = wep.proc(this, enemy, damage);
    } else {
      if (this.buff($J.cls(BodyForm$BodyFormBuff)) != null && this.buff($J.cls(BodyForm$BodyFormBuff)).enchant() != null) {
        damage = this.buff($J.cls(BodyForm$BodyFormBuff)).enchant().proc(new WornShortsword()._WornShortsword(), this, enemy, damage);
      }
      if (enemy.isAlive() && this.buff($J.cls(HolyWeapon$HolyWepBuff)) != null) {
        let dmg = this.subClass === HeroSubClass.PALADIN ? 6 : 2;
        enemy.damage($J.roundf(Math.fround(dmg * Weapon$Enchantment.genericProcChanceMultiplier(this))), HolyWeapon.INSTANCE);
      }
      if (enemy.isAlive() && this.buff($J.cls(Smite$SmiteTracker)) != null) {
        enemy.damage(Smite.bonusDmg(this, enemy), Smite.INSTANCE);
      }
    }
    switch (this.subClass) {
      case HeroSubClass.SNIPER:
        if (wep instanceof MissileWeapon && !(wep instanceof SpiritBow$SpiritArrow) && enemy !== this) {
          Actor.add$Actor(new (Hero$4())().$o(this).$c(enemy, wep)._Actor().$init_anon());
        }
        break;
      default:
    }
    return damage;
  }
  defenseProc(enemy: Char, damage: number): number {
    if (damage > 0 && this.subClass === HeroSubClass.BERSERKER) {
      let berserk = Buff.affect$Char$Class(this, $J.cls(Berserk));
      berserk.damage(damage);
    }
    if (this.belongings.armor() != null) {
      damage = this.belongings.armor().proc(enemy, this, damage);
    } else {
      if (this.buff($J.cls(BodyForm$BodyFormBuff)) != null && this.buff($J.cls(BodyForm$BodyFormBuff)).glyph() != null) {
        damage = this.buff($J.cls(BodyForm$BodyFormBuff)).glyph().proc(new ClothArmor()._ClothArmor(), enemy, this, damage);
      }
      if (this.buff($J.cls(HolyWard$HolyArmBuff)) != null) {
        let blocking = this.subClass === HeroSubClass.PALADIN ? 3 : 1;
        damage = (damage - $J.roundf(Math.fround(blocking * Armor$Glyph.genericProcChanceMultiplier(enemy)))) | 0;
      }
    }
    let rockArmor = this.buff($J.cls(WandOfLivingEarth$RockArmor));
    if (rockArmor != null) {
      damage = rockArmor.absorb(damage);
    }
    return super.defenseProc(enemy, damage);
  }
  glyphLevel(cls: JClass<Armor$Glyph>): number {
    if (this.belongings.armor() != null && this.belongings.armor().hasGlyph(cls, this)) {
      return Math.max(super.glyphLevel(cls), this.belongings.armor_.buffedLvl());
    } else if (this.buff($J.cls(BodyForm$BodyFormBuff)) != null && this.buff($J.cls(BodyForm$BodyFormBuff)).glyph() != null && this.buff($J.cls(BodyForm$BodyFormBuff)).glyph().getClass() === cls) {
      return this.belongings.armor() != null ? this.belongings.armor_.buffedLvl() : 0;
    } else {
      return super.glyphLevel(cls);
    }
  }
  damage(dmg: number, src: any): void {
    if (this.buff($J.cls(TimekeepersHourglass$timeStasis)) != null || this.buff($J.cls(TimeStasis)) != null) {
      return;
    }
    if (!(src instanceof Hunger || src instanceof Viscosity$DeferedDamage) && this.damageInterrupt) {
      this.interrupt();
    }
    if (this.buff($J.cls(Drowsy)) != null) {
      Buff.detach(this, $J.cls(Drowsy));
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'pain_resist', []), []);
    }
    let damage = Math.fround(dmg);
    let endure = this.buff($J.cls(Endure$EndureTracker));
    if (!(src instanceof Char)) {
      if (endure != null) {
        damage = endure.adjustDamageTaken(Math.fround(dmg));
      }
      if (this.buff($J.cls(ScrollOfChallenge$ChallengeArena)) != null) {
        damage = Math.fround(damage * Math.fround(0.67));
      }
      if (this.buff($J.cls(MonkEnergy$MonkAbility$Meditate$MeditateResistance)) != null) {
        damage = Math.fround(damage * Math.fround(0.2));
      }
    }
    let thorns = this.buff($J.cls(CapeOfThorns$Thorns));
    if (thorns != null) {
      damage = Math.fround(thorns.proc($J.d2i(damage), (src instanceof Char ? src : null), this));
    }
    if (this.buff($J.cls(Talent$WarriorFoodImmunity)) != null) {
      if (this.pointsInTalent(Talent.IRON_STOMACH) === 1) {
        damage = Math.fround(damage / 4);
      } else if (this.pointsInTalent(Talent.IRON_STOMACH) === 2) {
        damage = 0;
      }
    }
    dmg = $J.roundf(damage);
    dmg = $J.d2i(Math.ceil(Math.fround(dmg * RingOfTenacity.damageMultiplier(this))));
    let preHP = (this.HP + this.shielding()) | 0;
    if (src instanceof Hunger) {
      preHP = (preHP - this.shielding()) | 0;
    }
    super.damage(dmg, src);
    let postHP = (this.HP + this.shielding()) | 0;
    if (src instanceof Hunger) {
      postHP = (postHP - this.shielding()) | 0;
    }
    let effectiveDamage = (preHP - postHP) | 0;
    if (effectiveDamage <= 0) {
      return;
    }
    if (this.buff($J.cls(Challenge$DuelParticipant)) != null) {
      this.buff($J.cls(Challenge$DuelParticipant)).addDamage(effectiveDamage);
    }
    let percentDMG = Math.fround(effectiveDamage / Math.fround(preHP));
    let percentHP = Math.fround(1 - (Math.fround(((this.HT - postHP) | 0) / Math.fround(this.HT))));
    let flashIntensity = Math.fround(Math.fround(0.25 * (Math.fround(percentDMG * percentDMG))) / percentHP);
    if (flashIntensity >= Math.fround(0.05)) {
      flashIntensity = Math.min(Math.fround(1 / 3), flashIntensity);
      GameScene.flash$int($J.d2i((Math.fround(255 * flashIntensity))) << 16);
      if (this.isAlive()) {
        if (flashIntensity >= Math.fround(1 / 6)) {
          Sample.INSTANCE.play$Object$float(Assets$Sounds.HEALTH_CRITICAL, Math.fround(Math.fround(1 / 3) + Math.fround(flashIntensity * 2)));
        } else {
          Sample.INSTANCE.play$Object$float(Assets$Sounds.HEALTH_WARN, Math.fround(Math.fround(1 / 3) + Math.fround(flashIntensity * 4)));
        }
        this.interrupt();
        this.damageInterrupt = true;
      }
    }
  }
  checkVisibleMobs(): void {
    let visible = new ArrayList();
    let newMob = false;
    let target = null;
    for (let m of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (this.fieldOfView[m.pos] && m.landmark() != null) {
        Notes.add$Landmark(m.landmark());
      }
      if (this.fieldOfView[m.pos] && m.alignment === Char$Alignment.ENEMY) {
        visible.add(m);
        if (!this.visibleEnemies_.contains(m)) {
          newMob = true;
        }
        if ((!this.mindVisionEnemies.contains(m) && QuickSlotButton.autoAim$Char(m) !== -1) || (this.mindVisionEnemies.contains(m) && new Ballistica()._Ballistica(this.pos, m.pos, Ballistica.PROJECTILE).collisionPos === m.pos)) {
          if (target == null) {
            target = m;
          } else if (this.distance(target) > this.distance(m)) {
            target = m;
          }
          if (m instanceof Snake && Dungeon.level.distance(m.pos, this.pos) <= 4 && !Document.ADVENTURERS_GUIDE.isPageRead$String(Document.GUIDE_EXAMINING)) {
            GameScene.flashForDocument(Document.ADVENTURERS_GUIDE, Document.GUIDE_EXAMINING);
            Document.ADVENTURERS_GUIDE.readPage$String(Document.GUIDE_EXAMINING);
          }
        }
      }
    }
    let lastTarget = QuickSlotButton.lastTarget;
    if (target != null && (lastTarget == null || !lastTarget.isAlive() || !lastTarget.isActive() || lastTarget.alignment === Char$Alignment.ALLY || !this.fieldOfView[lastTarget.pos])) {
      QuickSlotButton.target(target);
    }
    if (newMob) {
      if (this.resting) {
        Dungeon.observe$();
      }
      this.interrupt();
    }
    this.visibleEnemies_ = visible;
    for (let b of $J.toArrayInto(Dungeon.level.blobs.values().toArray(), $J.newArray(0, null))) {
      if (b.volume_ > 0 && b.landmark() != null && !Notes.contains$Landmark(b.landmark())) {
        let cell: number;
        let found = false;
        for (let i = b.area.top_; i < b.area.bottom_; i++) {
          for (let j = b.area.left_; j < b.area.right_; j++) {
            cell = (j + Math.imul(i, Dungeon.level.width())) | 0;
            if (this.fieldOfView[cell] && b.cur[cell] > 0) {
              Notes.add$Landmark(b.landmark());
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
        if (found && b instanceof WeakFloorRoom$WellID) {
          b.fullyClear();
        }
      }
    }
  }
  visibleEnemies(): number {
    return this.visibleEnemies_.size();
  }
  visibleEnemy(index: number): Mob {
    return this.visibleEnemies_.get(index % this.visibleEnemies_.size());
  }
  getVisibleEnemies(): ArrayList<Mob> {
    return new ArrayList(this.visibleEnemies_);
  }
  getCloser(target: number): boolean {
    if (target === this.pos) {
      return false;
    }
    if (this.rooted) {
      PixelScene.shake(1, 1);
      return false;
    }
    let step = -1;
    if (Dungeon.level.adjacent(this.pos, target)) {
      this.path = null;
      if (Actor.findChar(target) == null) {
        if (Dungeon.level.passable[target] || Dungeon.level.avoid[target]) {
          step = target;
        }
        if (this.walkingToVisibleTrapInFog && Dungeon.level.traps.get(target) != null && Dungeon.level.traps.get(target).visible_ && Dungeon.level.traps.get(target).active) {
          return false;
        }
      }
    } else {
      let newPath = false;
      if (this.path == null || this.path.isEmpty() || !Dungeon.level.adjacent(this.pos, this.path.getFirst())) {
        newPath = true;
      } else if (this.path.getLast() !== target) {
        newPath = true;
      } else {
        if (!Dungeon.level.passable[this.path.get(0)] || Actor.findChar(this.path.get(0)) != null) {
          newPath = true;
        }
      }
      if (newPath) {
        let len = Dungeon.level.length();
        let p = Dungeon.level.passable;
        let v = Dungeon.level.visited;
        let m = Dungeon.level.mapped;
        let passable = $J.newArray(len, false);
        for (let i = 0; i < len; i++) {
          passable[i] = p[i] && (v[i] || m[i]);
        }
        let newpath = Dungeon.findPath(this, target, passable, this.fieldOfView, true);
        if (newpath != null && this.path != null && newpath.size() > Math.imul(2, this.path.size())) {
          this.path = null;
        } else {
          this.path = newpath;
        }
      }
      if (this.path == null) {
        return false;
      }
      step = this.path.removeFirst();
    }
    if (step !== -1) {
      let delay = 1;
      if (this.buff($J.cls(GreaterHaste)) != null) {
        delay = 0;
      }
      if (Dungeon.level.pit[step] && !Dungeon.level.solid[step] && (!this.flying || this.buff($J.cls(Levitation)) != null && this.buff($J.cls(Levitation)).detachesWithinDelay(Math.fround(delay / this.speed())))) {
        if (!Chasm.jumpConfirmed) {
          Chasm.heroJump(this);
          this.interrupt();
        } else {
          this.flying = false;
          this.remove$Buff(this.buff($J.cls(Levitation)));
          Chasm.heroFall(target);
        }
        this.canSelfTrample_ = false;
        return false;
      }
      if (this.buff($J.cls(GreaterHaste)) != null) {
        this.buff($J.cls(GreaterHaste)).spendMove();
      }
      if (this.subClass === HeroSubClass.FREERUNNER) {
        Buff.affect$Char$Class(this, $J.cls(Momentum)).gainStack();
      }
      this.sprite_.move(this.pos, step);
      this.move$int(step);
      this.spend(Math.fround(delay / this.speed()));
      this.search(false);
      return true;
    } else {
      return false;
    }
  }
  handle(cell: number): boolean {
    if (cell === -1) {
      return false;
    }
    if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
      Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    }
    if (!Dungeon.level.visited[cell] && !Dungeon.level.mapped[cell] && Dungeon.level.traps.get(cell) != null && Dungeon.level.traps.get(cell).visible_ && Dungeon.level.traps.get(cell).active) {
      this.walkingToVisibleTrapInFog = true;
    } else {
      this.walkingToVisibleTrapInFog = false;
    }
    let ch = Actor.findChar(cell);
    let heap = Dungeon.level.heaps.get(cell);
    if (Dungeon.level.map_[cell] === Terrain.ALCHEMY && cell !== this.pos) {
      this.curAction = new HeroAction$Alchemy()._HeroAction$Alchemy(cell);
    } else if (ch instanceof Mob && (this.fieldOfView[cell] || Char.hasProp(ch, Char$Property.OBJECT))) {
      if ((ch).heroShouldInteract()) {
        this.curAction = new HeroAction$Interact()._HeroAction$Interact(ch);
      } else {
        this.curAction = new HeroAction$Attack()._HeroAction$Attack(ch);
      }
    } else if (Dungeon.level instanceof MiningLevel && this.belongings.getItem($J.cls(Pickaxe)) != null && (Dungeon.level.map_[cell] === Terrain.WALL || Dungeon.level.map_[cell] === Terrain.WALL_DECO || Dungeon.level.map_[cell] === Terrain.MINE_CRYSTAL || Dungeon.level.map_[cell] === Terrain.MINE_BOULDER)) {
      this.curAction = new HeroAction$Mine()._HeroAction$Mine(cell);
    } else if (heap != null && (this.visibleEnemies_.size() === 0 || cell === this.pos || (heap.type_ !== Heap$Type.HEAP && heap.type_ !== Heap$Type.FOR_SALE))) {
      switch (heap.type_) {
        case Heap$Type.HEAP:
          this.curAction = new HeroAction$PickUp()._HeroAction$PickUp(cell);
          break;
        case Heap$Type.FOR_SALE:
          this.curAction = heap.size() === 1 && heap.peek().value() > 0 ? new HeroAction$Buy()._HeroAction$Buy(cell) : new HeroAction$PickUp()._HeroAction$PickUp(cell);
          break;
        default:
          this.curAction = new HeroAction$OpenChest()._HeroAction$OpenChest(cell);
      }
    } else if (Dungeon.level.map_[cell] === Terrain.LOCKED_DOOR || Dungeon.level.map_[cell] === Terrain.HERO_LKD_DR || Dungeon.level.map_[cell] === Terrain.CRYSTAL_DOOR || Dungeon.level.map_[cell] === Terrain.LOCKED_EXIT) {
      this.curAction = new HeroAction$Unlock()._HeroAction$Unlock(cell);
    } else if (Dungeon.level.getTransition$int(cell) != null && (this.visibleEnemies_.size() === 0 || cell === this.pos) && !Dungeon.level.locked && !Dungeon.level.plants.containsKey(cell) && (Dungeon.depth < 26 || Dungeon.level.getTransition$int(cell).type_ === LevelTransition$Type.REGULAR_ENTRANCE)) {
      this.curAction = new HeroAction$LvlTransition()._HeroAction$LvlTransition(cell);
    } else {
      this.curAction = new HeroAction$Move()._HeroAction$Move(cell);
      this.lastAction = null;
    }
    return true;
  }
  earnExp(exp: number, source: JClass): void {
    if (source !== $J.cls(AscensionChallenge)) {
      this.exp = (this.exp + exp) | 0;
    }
    let percent = Math.fround(exp / Math.fround(this.maxExp()));
    let chains = this.buff($J.cls(EtherealChains$chainsRecharge));
    if (chains != null) {
      chains.gainExp(percent);
    }
    let horn = this.buff($J.cls(HornOfPlenty$hornRecharge));
    if (horn != null) {
      horn.gainCharge(percent);
    }
    let kit = this.buff($J.cls(AlchemistsToolkit$kitEnergy));
    if (kit != null) {
      kit.gainCharge(percent);
    }
    let armband = this.buff($J.cls(MasterThievesArmband$Thievery));
    if (armband != null) {
      armband.gainCharge(percent);
    }
    let berserk = this.buff($J.cls(Berserk));
    if (berserk != null) {
      berserk.recover(percent);
    }
    if (source !== $J.cls(PotionOfExperience)) {
      for (const $it7 = this.belongings.iterator(); $it7.hasNext(); ) {
        let i = $it7.next();
        i.onHeroGainExp(percent, this);
      }
      if (this.buff($J.cls(Talent$RejuvenatingStepsFurrow)) != null) {
        this.buff($J.cls(Talent$RejuvenatingStepsFurrow)).countDown(Math.fround(percent * 200));
        if (this.buff($J.cls(Talent$RejuvenatingStepsFurrow)).count() <= Math.fround(0)) {
          this.buff($J.cls(Talent$RejuvenatingStepsFurrow)).detach();
        }
      }
      if (this.buff($J.cls(ElementalStrike$ElementalStrikeFurrowCounter)) != null) {
        this.buff($J.cls(ElementalStrike$ElementalStrikeFurrowCounter)).countDown(Math.fround(percent * 20));
        if (this.buff($J.cls(ElementalStrike$ElementalStrikeFurrowCounter)).count() <= Math.fround(0)) {
          this.buff($J.cls(ElementalStrike$ElementalStrikeFurrowCounter)).detach();
        }
      }
      if (this.buff($J.cls(HallowedGround$HallowedFurrowTracker)) != null) {
        this.buff($J.cls(HallowedGround$HallowedFurrowTracker)).countDown(Math.fround(percent * 100));
        if (this.buff($J.cls(HallowedGround$HallowedFurrowTracker)).count() <= Math.fround(0)) {
          this.buff($J.cls(HallowedGround$HallowedFurrowTracker)).detach();
        }
      }
    }
    let levelUp = false;
    while (this.exp >= this.maxExp()) {
      this.exp = (this.exp - this.maxExp()) | 0;
      if (this.buff($J.cls(Talent$WandPreservationCounter)) != null && this.pointsInTalent(Talent.WAND_PRESERVATION) === 2) {
        this.buff($J.cls(Talent$WandPreservationCounter)).detach();
      }
      if (this.lvl < Hero.MAX_LEVEL) {
        this.lvl++;
        levelUp = true;
        if (this.buff($J.cls(ElixirOfMight$HTBoost)) != null) {
          this.buff($J.cls(ElixirOfMight$HTBoost)).onLevelUp();
        }
        this.updateHT(true);
        this.attackSkill_++;
        this.defenseSkill_++;
      } else {
        Buff.prolong(this, $J.cls(Bless), Bless.DURATION);
        this.exp = 0;
        GLog.newLine();
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'level_cap', []), []);
        Sample.INSTANCE.play$Object(Assets$Sounds.LEVELUP);
      }
    }
    if (levelUp) {
      if (this.sprite_ != null) {
        GLog.newLine();
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'new_level', []), []);
        this.sprite_.showStatus(CharSprite.POSITIVE, Messages.get$Class$String$ObjectArr($J.cls(Hero), 'level_up', []), []);
        Sample.INSTANCE.play$Object(Assets$Sounds.LEVELUP);
        if (this.lvl < (Talent.tierLevelThresholds[(Talent.MAX_TALENT_TIERS + 1) | 0])) {
          GLog.newLine();
          GLog.p(Messages.get$Object$String$ObjectArr(this, 'new_talent', []), []);
          StatusPane.talentBlink = 10;
          WndHero.lastIdx = 1;
        }
      }
      Item.updateQuickslot();
      Badges.validateLevelReached();
    }
  }
  maxExp(): number {
    return Hero.maxExp(this.lvl);
  }
  static maxExp(lvl: number): number {
    return (5 + Math.imul(lvl, 5)) | 0;
  }
  isStarving(): boolean {
    return Buff.affect$Char$Class(this, $J.cls(Hunger)).isStarving();
  }
  add(buff: Buff): boolean {
    if (buff.type_ === Buff$buffType.NEGATIVE && (this.buff($J.cls(TimekeepersHourglass$timeStasis)) != null || this.buff($J.cls(TimeStasis)) != null)) {
      return false;
    }
    let added = super.add(buff);
    if (this.sprite_ != null && added) {
      let msg = buff.heroMessage();
      if (msg != null) {
        GLog.w(msg, []);
      }
      if (buff instanceof Paralysis || buff instanceof Vertigo) {
        this.interrupt();
      }
    }
    BuffIndicator.refreshHero();
    return added;
  }
  remove$Buff(buff: Buff): boolean {
    if (super.remove$Buff(buff)) {
      BuffIndicator.refreshHero();
      return true;
    }
    return false;
  }
  onRemove(): void {
    for (const $it8 = this.buffs$().iterator(); $it8.hasNext(); ) {
      let buff = $it8.next();
      if (buff instanceof MeleeWeapon$Charger) {
        Actor.remove(buff);
      } else {
        buff.detach();
      }
    }
  }
  die(cause: any): void {
    this.curAction = null;
    let ankh = null;
    for (const $it9 = this.belongings.getAllItems($J.cls(Ankh)).iterator(); $it9.hasNext(); ) {
      let i = $it9.next();
      if (ankh == null || i.isBlessed()) {
        ankh = i;
      }
    }
    if (ankh != null) {
      this.interrupt();
      if (ankh.isBlessed()) {
        this.HP = $J.idiv(this.HT, 4);
        PotionOfHealing.cure(this);
        Buff.prolong(this, $J.cls(Invulnerability), Invulnerability.DURATION);
        SpellSprite.show$Char$int(this, SpellSprite.ANKH);
        GameScene.flash$int(-2130706624);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'revive', []), []);
        Statistics.ankhsUsed++;
        Catalog.countUse($J.cls(Ankh));
        ankh.detach(this.belongings.backpack);
        for (const $it10 = Actor.chars().iterator(); $it10.hasNext(); ) {
          let ch = $it10.next();
          if (ch instanceof DriedRose$GhostHero) {
            (ch).sayAnhk();
            return;
          }
        }
      } else {
        WndResurrect.instance = new JObject();
        let finalAnkh = ankh;
        Game.runOnRenderThread(new (Hero$5())().$o(this).$c(finalAnkh));
        if ($J.isa(cause, Hero$Doom)) {
          (cause).onDeath();
        }
        let sacMark = this.buff($J.cls(SacrificialFire$Marked));
        if (sacMark != null) {
          sacMark.detach();
        }
      }
      return;
    }
    Actor.fixTime();
    super.die(cause);
    Hero.reallyDie(cause);
  }
  static reallyDie(cause: any): void {
    let length = Dungeon.level.length();
    let map = Dungeon.level.map_;
    let visited = Dungeon.level.visited;
    let discoverable = Dungeon.level.discoverable;
    for (let i = 0; i < length; i++) {
      let terr = map[i];
      if (discoverable[i]) {
        visited[i] = true;
        if ((Terrain.flags[terr] & Terrain.SECRET) !== 0) {
          Dungeon.level.discover(i);
        }
      }
    }
    Bones.leave();
    Dungeon.observe$();
    GameScene.updateFog$();
    Dungeon.hero.belongings.identify();
    let pos = Dungeon.hero.pos;
    let passable = new ArrayList();
    for (let ofs of PathFinder.NEIGHBOURS8) {
      let cell = (pos + ofs) | 0;
      if ((Dungeon.level.passable[cell] || Dungeon.level.avoid[cell]) && Dungeon.level.heaps.get(cell) == null) {
        passable.add(cell);
      }
    }
    Collections.shuffle(passable);
    let items = new ArrayList(Dungeon.hero.belongings.backpack.items_);
    for (const $it11 = passable.iterator(); $it11.hasNext(); ) {
      let cell = $it11.next();
      if (items.isEmpty()) {
        break;
      }
      let item = Random.element$Collection(items);
      Dungeon.level.drop(item, cell).sprite_.drop$int(pos);
      items.remove(item);
    }
    for (const $it12 = Actor.chars().iterator(); $it12.hasNext(); ) {
      let c = $it12.next();
      if (c instanceof DriedRose$GhostHero) {
        (c).sayHeroKilled();
      }
    }
    Game.runOnRenderThread(new (Hero$6())());
    if ($J.isa(cause, Hero$Doom)) {
      (cause).onDeath();
    }
    Dungeon.deleteGame(GamesInProgress.curSlot, true);
  }
  isAlive(): boolean {
    if (this.HP <= 0) {
      if (this.berserk == null) {
        this.berserk = this.buff($J.cls(Berserk));
      }
      return this.berserk != null && this.berserk.berserking();
    } else {
      this.berserk = null;
      return super.isAlive();
    }
  }
  move$int$boolean(step: number, travelling: boolean): void {
    let wasHighGrass = Dungeon.level.map_[step] === Terrain.HIGH_GRASS;
    super.move$int$boolean(step, travelling);
    if (!this.flying && travelling) {
      if (Dungeon.level.water[this.pos]) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.WATER, 1, Random.Float$float$float(Math.fround(0.8), 1.25));
      } else if (Dungeon.level.map_[this.pos] === Terrain.EMPTY_SP) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.STURDY, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
      } else if (Dungeon.level.map_[this.pos] === Terrain.GRASS || Dungeon.level.map_[this.pos] === Terrain.EMBERS || Dungeon.level.map_[this.pos] === Terrain.FURROWED_GRASS) {
        if (step === this.pos && wasHighGrass) {
          Sample.INSTANCE.play$Object$float$float(Assets$Sounds.TRAMPLE, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
        } else {
          Sample.INSTANCE.play$Object$float$float(Assets$Sounds.GRASS, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
        }
      } else {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.STEP, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
      }
    }
  }
  onAttackComplete(): void {
    if (this.attackTarget_ == null) {
      this.curAction = null;
      super.onAttackComplete();
      return;
    }
    AttackIndicator.target(this.attackTarget_);
    let wasEnemy = this.attackTarget_.alignment === Char$Alignment.ENEMY || (this.attackTarget_ instanceof Mimic && this.attackTarget_.alignment === Char$Alignment.NEUTRAL);
    let hit = this.attack$Char(this.attackTarget_);
    Invisibility.dispel$();
    this.spend(this.attackDelay());
    if (hit && this.subClass === HeroSubClass.GLADIATOR && wasEnemy) {
      Buff.affect$Char$Class(this, $J.cls(Combo)).hit(this.attackTarget_);
    }
    if (hit && this.heroClass === HeroClass.DUELIST && wasEnemy) {
      Buff.affect$Char$Class(this, $J.cls(Sai$ComboStrikeTracker)).addHit(this.attackTarget_);
    }
    this.curAction = null;
    this.attackTarget_ = null;
    super.onAttackComplete();
  }
  onMotionComplete(): void {
    GameScene.checkKeyHold();
  }
  onOperateComplete(): void {
    if (this.curAction instanceof HeroAction$Unlock) {
      let doorCell = (this.curAction).dst;
      let door = Dungeon.level.map_[doorCell];
      let skele = this.buff($J.cls(SkeletonKey$keyRecharge));
      let keyUseTrack = this.buff($J.cls(SkeletonKey$KeyReplacementTracker));
      if (skele != null && skele.isCursed() && Random.Int$int(6) !== 0) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'key_distracted', []), []);
        this.spendAndNext(Math.fround(2 * Key.TIME_TO_UNLOCK));
        Buff.affect$Char$Class(this, $J.cls(Hunger)).affectHunger$float(-4);
      } else if (Dungeon.level.distance(this.pos, doorCell) <= 1) {
        let hasKey = true;
        if (Dungeon.branch !== 0) {
          hasKey = false;
        } else if (door === Terrain.LOCKED_DOOR) {
          hasKey = Notes.remove$Key(new IronKey()._IronKey$int(Dungeon.depth));
          if (hasKey) {
            if (keyUseTrack != null) {
              keyUseTrack.processIronLockOpened();
            }
            Level.set$int$int(doorCell, Terrain.DOOR);
          }
        } else if (door === Terrain.HERO_LKD_DR) {
          hasKey = true;
          Level.set$int$int(doorCell, Terrain.DOOR);
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'force_lock', []), []);
        } else if (door === Terrain.CRYSTAL_DOOR) {
          hasKey = Notes.remove$Key(new CrystalKey()._CrystalKey$int(Dungeon.depth));
          if (hasKey) {
            if (keyUseTrack != null) {
              keyUseTrack.processCrystalLockOpened();
            }
            Level.set$int$int(doorCell, Terrain.EMPTY);
            Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
            CellEmitter.get(doorCell).start(Speck.factory$int(Speck.DISCOVER), Math.fround(0.025), 20);
          }
        } else {
          hasKey = Notes.remove$Key(new WornKey()._WornKey$int(Dungeon.depth));
          if (hasKey) {
            Level.set$int$int(doorCell, Terrain.UNLOCKED_EXIT);
          }
        }
        if (hasKey) {
          GameScene.updateKeyDisplay();
          GameScene.updateMap$int(doorCell);
          this.spend(Key.TIME_TO_UNLOCK);
        }
      }
    } else if (this.curAction instanceof HeroAction$OpenChest) {
      let heap = Dungeon.level.heaps.get((this.curAction).dst);
      let skele = this.buff($J.cls(SkeletonKey$keyRecharge));
      let keyUseTrack = this.buff($J.cls(SkeletonKey$KeyReplacementTracker));
      if (skele != null && skele.isCursed() && (heap.type_ === Heap$Type.LOCKED_CHEST || heap.type_ === Heap$Type.CRYSTAL_CHEST) && Random.Int$int(6) !== 0) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'key_distracted', []), []);
        this.spend(Math.fround(2 * Key.TIME_TO_UNLOCK));
        Buff.affect$Char$Class(this, $J.cls(Hunger)).affectHunger$float(-4);
      } else if (Dungeon.level.distance(this.pos, heap.pos) <= 1) {
        let hasKey = true;
        if (heap.type_ === Heap$Type.SKELETON || heap.type_ === Heap$Type.REMAINS) {
          Sample.INSTANCE.play$Object(Assets$Sounds.BONES);
        } else if (heap.type_ === Heap$Type.LOCKED_CHEST) {
          hasKey = Dungeon.branch === 0 && Notes.remove$Key(new GoldenKey()._GoldenKey$int(Dungeon.depth));
          if (hasKey && keyUseTrack != null) {
            keyUseTrack.processGoldLockOpened();
          }
        } else if (heap.type_ === Heap$Type.CRYSTAL_CHEST) {
          hasKey = Dungeon.branch === 0 && Notes.remove$Key(new CrystalKey()._CrystalKey$int(Dungeon.depth));
          if (hasKey && keyUseTrack != null) {
            keyUseTrack.processCrystalLockOpened();
          }
        }
        if (hasKey) {
          GameScene.updateKeyDisplay();
          heap.open(this);
          this.spend(Key.TIME_TO_UNLOCK);
        }
      }
    }
    this.curAction = null;
    if (!this.ready_) {
      super.onOperateComplete();
    }
  }
  search(intentional: boolean): boolean {
    if (!this.isAlive()) {
      return false;
    }
    let smthFound = false;
    let circular = this.pointsInTalent(Talent.WIDE_SEARCH) === 1;
    let distance = this.heroClass === HeroClass.ROGUE ? 2 : 1;
    if (this.hasTalent(Talent.WIDE_SEARCH)) {
      distance++;
    }
    let foresight = this.buff($J.cls(Foresight)) != null;
    let foresightScan = foresight && !Dungeon.level.mapped[this.pos];
    if (foresightScan) {
      Dungeon.level.mapped[this.pos] = true;
    }
    if (foresight) {
      distance = Foresight.DISTANCE;
      circular = true;
    }
    let c = Dungeon.level.cellToPoint(this.pos);
    let talisman = this.buff($J.cls(TalismanOfForesight$Foresight));
    let cursed = talisman != null && talisman.isCursed();
    let rounding = ShadowCaster.rounding[distance];
    let left: number;
    let right: number;
    let curr: number;
    for (let y = Math.max(0, (c.y - distance) | 0); y <= (Math.min((Dungeon.level.height() - 1) | 0, (c.y + distance) | 0)); y++) {
      if (!circular) {
        left = (c.x - distance) | 0;
      } else if ((rounding[Math.abs((c.y - y) | 0)]) < (Math.abs((c.y - y) | 0))) {
        left = (c.x - (rounding[Math.abs((c.y - y) | 0)])) | 0;
      } else {
        left = distance;
        while (rounding[left] < (rounding[Math.abs((c.y - y) | 0)])) {
          left--;
        }
        left = (c.x - left) | 0;
      }
      right = Math.min((Dungeon.level.width() - 1) | 0, (c.x + c.x - left) | 0);
      left = Math.max(0, left);
      for (curr = (left + Math.imul(y, Dungeon.level.width())) | 0; curr <= ((right + Math.imul(y, Dungeon.level.width())) | 0); curr++) {
        if ((foresight || this.fieldOfView[curr]) && curr !== this.pos) {
          if (foresight && (!Dungeon.level.mapped[curr] || foresightScan)) {
            GameScene.checkedCell(curr, foresightScan ? this.pos : curr);
          } else if (intentional) {
            GameScene.checkedCell(curr, this.pos);
          }
          if (foresight) {
            Dungeon.level.mapped[curr] = true;
          }
          if (Dungeon.level.secret[curr]) {
            let trap = Dungeon.level.traps.get(curr);
            let chance: number;
            if (foresight) {
              chance = 1;
            } else if (trap != null && !trap.canBeSearched) {
              chance = 0;
            } else if (intentional) {
              chance = 1;
            } else if (cursed) {
              chance = 0;
            } else if (Dungeon.level.map_[curr] === Terrain.SECRET_TRAP) {
              chance = Math.fround(Math.fround(0.4) - (Math.fround(Dungeon.depth / 250)));
            } else {
              chance = Math.fround(Math.fround(0.2) - (Math.fround(Dungeon.depth / 100)));
            }
            if (SPDSettings.intro$()) {
              chance = 0;
            }
            if (Random.Float$() < chance) {
              let oldValue = Dungeon.level.map_[curr];
              GameScene.discoverTile(curr, oldValue);
              Dungeon.level.discover(curr);
              ScrollOfMagicMapping.discover(curr);
              if (this.fieldOfView[curr]) {
                smthFound = true;
              }
              if (talisman != null) {
                if (oldValue === Terrain.SECRET_TRAP) {
                  talisman.charge$int(2);
                } else if (oldValue === Terrain.SECRET_DOOR) {
                  talisman.charge$int(10);
                }
              }
            }
          }
        }
      }
    }
    if (intentional) {
      this.sprite_.showStatus(CharSprite.DEFAULT, Messages.get$Object$String$ObjectArr(this, 'search', []), []);
      this.sprite_.operate$int(this.pos);
      if (!Dungeon.level.locked) {
        if (cursed) {
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'search_distracted', []), []);
          Buff.affect$Char$Class(this, $J.cls(Hunger)).affectHunger$float(Math.fround(Hero.TIME_TO_SEARCH - (Math.fround(2 * Hero.HUNGER_FOR_SEARCH))));
        } else {
          Buff.affect$Char$Class(this, $J.cls(Hunger)).affectHunger$float(Math.fround(Hero.TIME_TO_SEARCH - Hero.HUNGER_FOR_SEARCH));
        }
      }
      this.spendAndNext(Hero.TIME_TO_SEARCH);
    }
    if (smthFound) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'noticed_smth', []), []);
      Sample.INSTANCE.play$Object(Assets$Sounds.SECRET);
      this.interrupt();
    }
    if (foresight) {
      GameScene.updateFog$int$int(this.pos, (Foresight.DISTANCE + 1) | 0);
    }
    if (talisman != null) {
      talisman.checkAwareness();
    }
    return smthFound;
  }
  resurrect(): void {
    this.HP = this.HT;
    this.live();
    let holster = this.belongings.getItem($J.cls(MagicalHolster));
    Buff.affect$Char$Class(this, $J.cls(LostInventory));
    Buff.affect$Char$Class$float(this, $J.cls(Invisibility), 3);
    for (const $it13 = this.belongings.iterator(); $it13.hasNext(); ) {
      let i = $it13.next();
      if (i instanceof EquipableItem && i.isEquipped(this)) {
        (i).activate(this);
      } else if (i instanceof CloakOfShadows && i.keptThroughLostInventory() && this.hasTalent(Talent.LIGHT_CLOAK)) {
        (i).activate(this);
      } else if (i instanceof HolyTome && i.keptThroughLostInventory() && this.hasTalent(Talent.LIGHT_READING)) {
        (i).activate(this);
      } else if (i instanceof Wand && i.keptThroughLostInventory()) {
        if (holster != null && holster.contains(i)) {
          (i).charge$Char$float(this, MagicalHolster.HOLSTER_SCALE_FACTOR);
        } else {
          (i).charge$Char(this);
        }
      } else if (i instanceof MagesStaff && i.keptThroughLostInventory()) {
        (i).applyWandChargeBuff(this);
      }
    }
    this.updateHT(false);
  }
  next(): void {
    if (this.isAlive()) {
      super.next();
    }
  }
}

export class Hero$Doom {
}

let $Hero$1$1: any = null;
/** An anonymous class (Hero.java:968). */
function Hero$1$1(): any {
  return $Hero$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
    }
    onBackPressed(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$1$1', []);
}

let $Hero$1: any = null;
/** An anonymous class (Hero.java:956). */
function Hero$1(): any {
  return $Hero$1 ??= $J.local(class extends JObject {
    call(): void {
      let text = Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'injure_warning_1', []);
      if (!Dungeon.level.locked) {
        text += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'injure_warning_2', []);
      }
      text += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(EscapeCrystal), 'injure_warning_3', []);
      GameScene.show(new (Hero$1$1())().$o(this)._WndOptions$Image$String$String$StringArr(new ImpSprite()._ImpSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Imp), 'name', [])), text, [Messages.get$Class$String$ObjectArr($J.cls(WelcomeScene), 'controller_okay', [])]));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$1', ['com.watabou.utils.Callback']);
}

let $Hero$2: any = null;
/** An anonymous class (Hero.java:1064). */
function Hero$2(): any {
  return $Hero$2 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndTradeItem()._WndTradeItem$Heap(this.$cv_heap));
    }
    $c($heap): this {
      this.$cv_heap = $heap;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$2', ['com.watabou.utils.Callback']);
}

let $Hero$3$1: any = null;
/** An anonymous class (Hero.java:1385). */
function Hero$3$1(): any {
  return $Hero$3$1 ??= $J.local(class extends Delayer {
    onComplete(): void {
      let broke = false;
      for (let i of PathFinder.NEIGHBOURS8) {
        if ((Dungeon.level.map_[(this.$cv_action.dst + i) | 0]) === Terrain.MINE_CRYSTAL) {
          Splash.at$int$int$int((this.$cv_action.dst + i) | 0, 16777215, 5);
          Level.set$int$int((this.$cv_action.dst + i) | 0, Terrain.EMPTY);
          broke = true;
        }
      }
      if (broke) {
        Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
      }
      for (let i of PathFinder.NEIGHBOURS9) {
        GameScene.updateMap$int((this.$cv_action.dst + i) | 0);
      }
      this.$outer.$outer.spendAndNext(Actor.TICK);
      this.$outer.$outer.ready();
    }
    $c($action): this {
      this.$cv_action = $action;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$3$1', []);
}

let $Hero$3: any = null;
/** An anonymous class (Hero.java:1320). */
function Hero$3(): any {
  return $Hero$3 ??= $J.local(class extends JObject {
    call(): void {
      let crystalAdjacent = false;
      for (let i of PathFinder.NEIGHBOURS8) {
        if ((Dungeon.level.map_[(this.$cv_action.dst + i) | 0]) === Terrain.MINE_CRYSTAL) {
          crystalAdjacent = true;
          break;
        }
      }
      if (Dungeon.level.map_[this.$cv_action.dst] === Terrain.WALL_DECO) {
        let gold = new DarkGold()._DarkGold();
        if (gold.doPickUp$Hero(Dungeon.hero)) {
          let existing = Dungeon.hero.belongings.getItem($J.cls(DarkGold));
          if (existing != null && existing.quantity$() % 5 === 0) {
            if (existing.quantity$() >= 40) {
              GLog.p(Messages.get$Class$String$ObjectArr($J.cls(DarkGold), 'you_now_have', [existing.quantity$()]), []);
            } else {
              GLog.i(Messages.get$Class$String$ObjectArr($J.cls(DarkGold), 'you_now_have', [existing.quantity$()]), []);
            }
          }
          this.$outer.spend(Math.fround(-Actor.TICK));
        } else {
          Dungeon.level.drop(gold, this.$outer.pos).sprite_.drop$();
        }
        PixelScene.shake(0.5, 0.5);
        CellEmitter.center(this.$cv_action.dst).burst(Speck.factory$int(Speck.STAR), 7);
        Sample.INSTANCE.play$Object(Assets$Sounds.EVOKE);
        Level.set$int$int(this.$cv_action.dst, Terrain.EMPTY_DECO);
        crystalAdjacent = false;
      } else if (Dungeon.level.map_[this.$cv_action.dst] === Terrain.WALL) {
        this.$outer.buff($J.cls(Hunger)).affectHunger$float(-3);
        PixelScene.shake(0.5, 0.5);
        CellEmitter.get(this.$cv_action.dst).burst(Speck.factory$int(Speck.ROCK), 2);
        Sample.INSTANCE.play$Object(Assets$Sounds.MINE);
        Level.set$int$int(this.$cv_action.dst, Terrain.EMPTY_DECO);
      } else if (Dungeon.level.map_[this.$cv_action.dst] === Terrain.MINE_CRYSTAL) {
        Splash.at$int$int$int(this.$cv_action.dst, 16777215, 5);
        Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
        Level.set$int$int(this.$cv_action.dst, Terrain.EMPTY);
      } else if (Dungeon.level.map_[this.$cv_action.dst] === Terrain.MINE_BOULDER) {
        Splash.at$int$int$int(this.$cv_action.dst, 5592405, 5);
        Sample.INSTANCE.play$Object$float(Assets$Sounds.MINE, Math.fround(0.6));
        Level.set$int$int(this.$cv_action.dst, Terrain.EMPTY_DECO);
      }
      for (let i of PathFinder.NEIGHBOURS9) {
        (Dungeon.level.discoverable[(this.$cv_action.dst + i) | 0]) = true;
      }
      for (let i of PathFinder.NEIGHBOURS9) {
        GameScene.updateMap$int((this.$cv_action.dst + i) | 0);
      }
      if (crystalAdjacent) {
        this.$outer.sprite_.parent.add$Gizmo(new (Hero$3$1())().$o(this).$c(this.$cv_action)._Delayer$float(Math.fround(0.2)));
      } else {
        this.$outer.spendAndNext(Actor.TICK);
        this.$outer.ready();
      }
      Dungeon.observe$();
    }
    $c($action): this {
      this.$cv_action = $action;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$3', ['com.watabou.utils.Callback']);
}

let $Hero$4: any = null;
/** An anonymous class (Hero.java:1555). */
function Hero$4(): any {
  return $Hero$4 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      if (this.$cv_enemy.isAlive()) {
        if (this.$outer.hasTalent(Talent.SHARED_UPGRADES)) {
          let levelBonus = Math.min(Math.imul(2, this.$outer.pointsInTalent(Talent.SHARED_UPGRADES)), this.$cv_wep.buffedLvl());
          let bonusDmg = Math.fround(levelBonus / 6);
          Buff.prolong(this.$outer, $J.cls(SnipersMark), Math.fround(SnipersMark.DURATION + levelBonus)).set(this.$cv_enemy.id(), bonusDmg);
        } else {
          Buff.prolong(this.$outer, $J.cls(SnipersMark), SnipersMark.DURATION).set(this.$cv_enemy.id(), 0);
        }
      }
      Actor.remove(this);
      return true;
    }
    $c($enemy, $wep): this {
      this.$cv_enemy = $enemy; this.$cv_wep = $wep;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$4', []);
}

let $Hero$5: any = null;
/** An anonymous class (Hero.java:2216). */
function Hero$5(): any {
  return $Hero$5 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndResurrect()._WndResurrect(this.$cv_finalAnkh));
    }
    $c($finalAnkh): this {
      this.$cv_finalAnkh = $finalAnkh;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$5', ['com.watabou.utils.Callback']);
}

let $Hero$6: any = null;
/** An anonymous class (Hero.java:2296). */
function Hero$6(): any {
  return $Hero$6 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.gameOver();
      Sample.INSTANCE.play$Object(Assets$Sounds.DEATH);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$6', ['com.watabou.utils.Callback']);
}

$J.define(Hero, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Char', ctors: { '': '_Hero' }, meths: { 'move(int,boolean)': 'move$int$boolean', 'remove(com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff)': 'remove$Buff', 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,float,float)': 'attack$Char$float$float$float' } });
$J.define(Hero$Doom, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$Doom', { kind: 'interface' });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  SacrificialFire$Marked = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire$Marked');
  AdrenalineSurge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AdrenalineSurge');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Awareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Awareness');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Berserk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Berserk');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Combo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo');
  Combo$ParryTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$ParryTracker');
  Combo$RiposteTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Combo$RiposteTracker');
  Drowsy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Drowsy');
  Foresight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Foresight');
  GreaterHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.GreaterHaste');
  HeroDisguise = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HeroDisguise');
  HoldFast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Invulnerability = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invulnerability');
  Levitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Levitation');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  MindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MindVision');
  Momentum = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Momentum');
  MonkEnergy$MonkAbility$Focus$FocusBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Focus$FocusBuff');
  MonkEnergy$MonkAbility$Meditate$MeditateResistance = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Meditate$MeditateResistance');
  MonkEnergy$MonkAbility$UnarmedAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$UnarmedAbilityTracker');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  PhysicalEmpower = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PhysicalEmpower');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  SnipersMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SnipersMark');
  TimeStasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.TimeStasis');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Belongings = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings');
  HeroAction$Alchemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Alchemy');
  HeroAction$Attack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Attack');
  HeroAction$Buy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Buy');
  HeroAction$Interact = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Interact');
  HeroAction$LvlTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$LvlTransition');
  HeroAction$Mine = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Mine');
  HeroAction$Move = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Move');
  HeroAction$OpenChest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$OpenChest');
  HeroAction$PickUp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$PickUp');
  HeroAction$Unlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroAction$Unlock');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$AggressiveBarrierCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$AggressiveBarrierCooldown');
  Talent$LethalMomentumTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LethalMomentumTracker');
  Talent$LiquidAgilACCTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LiquidAgilACCTracker');
  Talent$LiquidAgilEVATracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LiquidAgilEVATracker');
  Talent$PatientStrikeTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$PatientStrikeTracker');
  Talent$PreciseAssaultTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$PreciseAssaultTracker');
  Talent$RejuvenatingStepsFurrow = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$RejuvenatingStepsFurrow');
  Talent$WandPreservationCounter = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$WandPreservationCounter');
  Talent$WarriorFoodImmunity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$WarriorFoodImmunity');
  AscendedForm$AscendBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff');
  Challenge$DuelParticipant = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$DuelParticipant');
  ElementalStrike$ElementalStrikeFurrowCounter = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike$ElementalStrikeFurrowCounter');
  NaturesPower$naturesPowerTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.NaturesPower$naturesPowerTracker');
  Endure$EndureTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Endure$EndureTracker');
  BodyForm$BodyFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm$BodyFormBuff');
  HallowedGround$HallowedFurrowTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HallowedGround$HallowedFurrowTracker');
  HolyWard$HolyArmBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard$HolyArmBuff');
  HolyWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon');
  HolyWeapon$HolyWepBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon$HolyWepBuff');
  Smite = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite');
  Smite$SmiteTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite$SmiteTracker');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Monk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk');
  Snake = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake');
  Imp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Ankh = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Ankh');
  BrokenSeal$WarriorShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  ClassArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor');
  ClothArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClothArmor');
  Stone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Stone');
  Viscosity$DeferedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$DeferedDamage');
  AlchemistsToolkit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.AlchemistsToolkit');
  AlchemistsToolkit$kitEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.AlchemistsToolkit$kitEnergy');
  CapeOfThorns$Thorns = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CapeOfThorns$Thorns');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  DriedRose$Petal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$Petal');
  EtherealChains$chainsRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains$chainsRecharge');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  HornOfPlenty$hornRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty$hornRecharge');
  MasterThievesArmband$Thievery = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband$Thievery');
  SkeletonKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey');
  SkeletonKey$KeyReplacementTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$KeyReplacementTracker');
  SkeletonKey$keyRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$keyRecharge');
  TalismanOfForesight$Foresight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$Foresight');
  TimekeepersHourglass$sandBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$sandBag');
  TimekeepersHourglass$timeStasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeStasis');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  Guidebook = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.Guidebook');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  GoldenKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.GoldenKey');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  Key = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.Key');
  WornKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.WornKey');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  ElixirOfMight$HTBoost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight$HTBoost');
  PotionOfDivineInspiration$DivineInspirationTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration$DivineInspirationTracker');
  DarkGold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DarkGold');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  EscapeCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  RingOfAccuracy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfAccuracy');
  RingOfEvasion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion');
  RingOfForce = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce');
  RingOfForce$Force = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce$Force');
  RingOfFuror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfFuror');
  RingOfHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfHaste');
  RingOfMight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfMight');
  RingOfTenacity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfTenacity');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfChallenge$ChallengeArena = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge$ChallengeArena');
  ThirteenLeafClover = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ThirteenLeafClover');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  WandOfLivingEarth$RockArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$RockArmor');
  SpiritBow$SpiritArrow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Crossbow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow');
  Crossbow$ChargedShot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow$ChargedShot');
  Flail = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail');
  Flail$SpinAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail$SpinAbilityTracker');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  MeleeWeapon$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$Charger');
  Quarterstaff$DefensiveStance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Quarterstaff$DefensiveStance');
  RoundShield$GuardTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RoundShield$GuardTracker');
  Sai$ComboStrikeTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sai$ComboStrikeTracker');
  Scimitar$SwordDance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Scimitar$SwordDance');
  WornShortsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WornShortsword');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  MissileWeapon$UpgradedSetTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$UpgradedSetTracker');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  WeakFloorRoom$WellID = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.WeakFloorRoom$WellID');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  WelcomeScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ImpSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  StatusPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHero');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndResurrect = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect');
  WndTradeItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTradeItem');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Delayer = $J.load('com.watabou.noosa.tweeners.Delayer');
  BArray = $J.load('com.watabou.utils.BArray');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
