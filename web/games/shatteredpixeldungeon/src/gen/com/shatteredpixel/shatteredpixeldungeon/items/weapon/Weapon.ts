// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/Weapon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, JEnum, JObject } from '../../../../../../jre/index.ts';
import { KindOfWeapon } from '../KindOfWeapon.ts';

let Badges, Dungeon, Statistics, Berserk, MagicImmune, Hero, HeroSubClass, Talent, Talent$SpiritBladesTracker, Talent$StrikingWaveTracker, AscendedForm$AscendBuff, ElementalStrike$DirectedPowerTracker, ShadowClone$ShadowAlly, BodyForm$BodyFormBuff, HolyWeapon, HolyWeapon$HolyWepBuff, Smite, Smite$SmiteTracker, MirrorImage, Item, RingOfArcana, RingOfForce, RingOfFuror, ParchmentScrap, ShardOfOblivion, Annoying, Dazzling, Displacing, Explosive, Friendly, Polarized, Pressurized, Sacrificial, Wayward, Wayward$WaywardBuff, Wondrous, Blazing, Blocking, Blooming, Chilling, Corrupting, Crystal, Elastic, Eldritch, Grim, Kinetic, Lucky, Projecting, Shocking, Unstable, Vampiric, Venomous, Vorpal, MeleeWeapon, RunicBlade$RunicSlashTracker, Scimitar$SwordDance, MissileWeapon, Catalog, Messages, ItemSprite$Glowing, GLog, Random, Reflection;

export class Weapon extends KindOfWeapon {
  ACC: number = 0;
  DLY: number = 0;
  RCH: number = 0;
  augment: Weapon$Augment = null;
  usesLeftToID: number = 0;
  availableUsesToID: number = 0;
  enchantment: Weapon$Enchantment = null;
  enchantHardened: boolean = false;
  curseInfusionBonus: boolean = false;
  masteryPotionBonus: boolean = false;
  static readonly USES_LEFT_TO_ID: string = 'uses_left_to_id';
  static readonly AVAILABLE_USES: string = 'available_uses';
  static readonly ENCHANTMENT: string = 'enchantment';
  static readonly ENCHANT_HARDENED: string = 'enchant_hardened';
  static readonly CURSE_INFUSION_BONUS: string = 'curse_infusion_bonus';
  static readonly MASTERY_POTION_BONUS: string = 'mastery_potion_bonus';
  static readonly AUGMENT: string = 'augment';
  static HOLY: ItemSprite$Glowing = null;
  _Weapon(): this {
    this._KindOfWeapon();
    this.ACC = 1;
    this.DLY = 1;
    this.RCH = 1;
    this.augment = Weapon$Augment.NONE;
    this.usesLeftToID = Math.fround(this.usesToID());
    this.availableUsesToID = Math.fround(this.usesToID() / 2);
    this.enchantHardened = false;
    this.curseInfusionBonus = false;
    this.masteryPotionBonus = false;
    return this;
  }
  usesToID(): number {
    return 20;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (attacker.buff($J.cls(MagicImmune)) == null) {
      let trinityEnchant = null;
      if (Dungeon.hero.buff($J.cls(BodyForm$BodyFormBuff)) != null && this instanceof MeleeWeapon && (attacker === Dungeon.hero || attacker instanceof MirrorImage || attacker instanceof ShadowClone$ShadowAlly)) {
        trinityEnchant = Dungeon.hero.buff($J.cls(BodyForm$BodyFormBuff)).enchant();
        if (this.enchantment != null && trinityEnchant != null && trinityEnchant.getClass() === this.enchantment.getClass()) {
          trinityEnchant = null;
        }
      }
      if (attacker instanceof Hero && this.isEquipped(attacker) && attacker.buff($J.cls(HolyWeapon$HolyWepBuff)) != null) {
        if (this.enchantment != null && ((attacker).subClass === HeroSubClass.PALADIN || this.hasCurseEnchant())) {
          damage = this.enchantment.proc(this, attacker, defender, damage);
        }
        if (defender.isAlive() && trinityEnchant != null) {
          damage = trinityEnchant.proc(this, attacker, defender, damage);
        }
        if (defender.isAlive()) {
          let dmg = (attacker).subClass === HeroSubClass.PALADIN ? 6 : 2;
          defender.damage($J.roundf(Math.fround(dmg * Weapon$Enchantment.genericProcChanceMultiplier(attacker))), HolyWeapon.INSTANCE);
        }
      } else {
        if (this.enchantment != null) {
          damage = this.enchantment.proc(this, attacker, defender, damage);
        }
        if (defender.isAlive() && trinityEnchant != null) {
          damage = trinityEnchant.proc(this, attacker, defender, damage);
        }
      }
      if (attacker instanceof Hero && this.isEquipped(attacker) && attacker.buff($J.cls(Smite$SmiteTracker)) != null && defender.isAlive()) {
        defender.damage(Smite.bonusDmg(attacker, defender), Smite.INSTANCE);
      }
    }
    if (this instanceof MissileWeapon && (this).durabilityLeft() <= (this).durabilityPerUse$() && (this).parent == null) {
      return damage;
    }
    if (!this.levelKnown && attacker === Dungeon.hero) {
      let uses = Math.min(this.availableUsesToID, Talent.itemIDSpeedFactor(Dungeon.hero, this));
      this.availableUsesToID = Math.fround(this.availableUsesToID - uses);
      this.usesLeftToID = Math.fround(this.usesLeftToID - uses);
      if (this.usesLeftToID <= Math.fround(0)) {
        if (ShardOfOblivion.passiveIDDisabled()) {
          if (this.usesLeftToID > Math.fround(-1)) {
            GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [this.name()]);
          }
          this.setIDReady();
        } else {
          this.identify$();
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'identify', []), []);
          Badges.validateItemLevelAquired(this);
        }
      }
    }
    return damage;
  }
  onHeroGainExp(levelPercent: number, hero: Hero): void {
    levelPercent = Math.fround(levelPercent * Talent.itemIDSpeedFactor(hero, this));
    if (!this.levelKnown && (this.isEquipped(hero) || this instanceof MissileWeapon) && this.availableUsesToID <= Math.fround(this.usesToID() / 2)) {
      this.availableUsesToID = Math.min(Math.fround(this.usesToID() / 2), Math.fround(this.availableUsesToID + Math.fround(levelPercent * this.usesToID())));
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Weapon.USES_LEFT_TO_ID, this.usesLeftToID);
    bundle.put$String$float(Weapon.AVAILABLE_USES, this.availableUsesToID);
    bundle.put$String$Bundlable(Weapon.ENCHANTMENT, this.enchantment);
    bundle.put$String$boolean(Weapon.ENCHANT_HARDENED, this.enchantHardened);
    bundle.put$String$boolean(Weapon.CURSE_INFUSION_BONUS, this.curseInfusionBonus);
    bundle.put$String$boolean(Weapon.MASTERY_POTION_BONUS, this.masteryPotionBonus);
    bundle.put$String$Enum(Weapon.AUGMENT, this.augment);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.usesLeftToID = bundle.getFloat(Weapon.USES_LEFT_TO_ID);
    this.availableUsesToID = bundle.getFloat(Weapon.AVAILABLE_USES);
    this.enchantment = bundle.get$String(Weapon.ENCHANTMENT);
    this.enchantHardened = bundle.getBoolean(Weapon.ENCHANT_HARDENED);
    this.curseInfusionBonus = bundle.getBoolean(Weapon.CURSE_INFUSION_BONUS);
    this.masteryPotionBonus = bundle.getBoolean(Weapon.MASTERY_POTION_BONUS);
    this.augment = bundle.getEnum(Weapon.AUGMENT, $J.cls(Weapon$Augment));
  }
  reset(): void {
    super.reset();
    this.usesLeftToID = Math.fround(this.usesToID());
    this.availableUsesToID = Math.fround(this.usesToID() / 2);
  }
  collect$Bag(container: Bag): boolean {
    if (super.collect$Bag(container)) {
      if (Dungeon.hero != null && Dungeon.hero.isAlive() && this.isIdentified() && this.enchantment != null) {
        Catalog.setSeen(this.enchantment.getClass());
        Statistics.itemTypesDiscovered.add(this.enchantment.getClass());
      }
      return true;
    } else {
      return false;
    }
  }
  identify$boolean(byHero: boolean): Item {
    if (this.enchantment != null && byHero && Dungeon.hero != null && Dungeon.hero.isAlive()) {
      Catalog.setSeen(this.enchantment.getClass());
      Statistics.itemTypesDiscovered.add(this.enchantment.getClass());
    }
    return super.identify$boolean(byHero);
  }
  setIDReady(): void {
    this.usesLeftToID = -1;
  }
  readyToIdentify(): boolean {
    return !this.isIdentified() && this.usesLeftToID <= Math.fround(0);
  }
  accuracyFactor(owner: Char, target: Char): number {
    let encumbrance = 0;
    if (owner instanceof Hero) {
      encumbrance = (this.STRReq$() - (owner).STR()) | 0;
    }
    let ACC = this.ACC;
    if (owner.buff($J.cls(Wayward$WaywardBuff)) != null && this.enchantment instanceof Wayward) {
      ACC = Math.fround(ACC / 5);
    }
    return encumbrance > 0 ? Math.fround((ACC / $J.pow(1.5, encumbrance))) : ACC;
  }
  delayFactor(owner: Char): number {
    return Math.fround(this.baseDelay(owner) * (Math.fround(1 / this.speedMultiplier(owner))));
  }
  baseDelay(owner: Char): number {
    let delay = this.augment.delayFactor(this.DLY);
    if (owner instanceof Hero) {
      let encumbrance = (this.STRReq$() - (owner).STR()) | 0;
      if (encumbrance > 0) {
        delay = Math.fround(delay * $J.pow(1.2, encumbrance));
      }
    }
    return delay;
  }
  speedMultiplier(owner: Char): number {
    let multi = RingOfFuror.attackSpeedMultiplier(owner);
    if (owner.buff($J.cls(Scimitar$SwordDance)) != null) {
      multi = Math.fround(multi + Math.fround(0.6));
    }
    return multi;
  }
  reachFactor(owner: Char): number {
    let reach = this.RCH;
    if (owner instanceof Hero && RingOfForce.fightingUnarmed(owner)) {
      reach = 1;
      if (!RingOfForce.unarmedGetsWeaponEnchantment(owner)) {
        return reach;
      }
    }
    if (owner instanceof Hero && owner.buff($J.cls(AscendedForm$AscendBuff)) != null) {
      reach = (reach + 2) | 0;
    }
    if (this.hasEnchant($J.cls(Projecting), owner)) {
      return (reach + $J.roundf(Weapon$Enchantment.genericProcChanceMultiplier(owner))) | 0;
    } else {
      return reach;
    }
  }
  STRReq$(): number {
    return this.STRReq$int(this.level$());
  }
  static STRReq(tier: number, lvl: number): number {
    lvl = Math.max(0, lvl);
    return (8 + Math.imul(tier, 2) - $J.idiv($J.d2i(((Math.sqrt((Math.imul(8, lvl) + 1) | 0)) - 1)), 2)) | 0;
  }
  level$(): number {
    let level = super.level$();
    if (this.curseInfusionBonus) {
      level = (level + (1 + $J.idiv(level, 6))) | 0;
    }
    return level;
  }
  upgrade$(): Item {
    return this.upgrade$boolean(false);
  }
  upgrade$boolean(enchant: boolean): Item {
    if (enchant) {
      if (this.enchantment == null) {
        this.enchant$Enchantment(Weapon$Enchantment.random([]));
      }
    } else if (this.enchantment != null) {
      if (this.enchantHardened) {
        if (this.level$() >= 6 && Random.Float$float(10) < ($J.pow(2, (this.level$() - 6) | 0))) {
          this.enchantHardened = false;
        }
      } else if (this.hasCurseEnchant()) {
        if (Random.Int$int(3) === 0) {
          this.enchant$Enchantment(null);
        }
      } else if (this.level$() >= 4 && Random.Float$float(10) < ($J.pow(2, (this.level$() - 4) | 0))) {
        this.enchant$Enchantment(null);
      }
      if (this.enchantment instanceof Crystal) {
        (this.enchantment).repair(this, false, 100);
      }
    }
    this.cursed = false;
    return super.upgrade$();
  }
  name(): string {
    if (this.isEquipped(Dungeon.hero) && !this.hasCurseEnchant() && Dungeon.hero.buff($J.cls(HolyWeapon$HolyWepBuff)) != null && (Dungeon.hero.subClass !== HeroSubClass.PALADIN || this.enchantment == null)) {
      return Messages.get$Class$String$ObjectArr($J.cls(HolyWeapon), 'ench_name', [super.name()]);
    } else {
      return this.enchantment != null && (this.cursedKnown || !this.enchantment.curse()) ? this.enchantment.name$String(super.name()) : super.name();
    }
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
  enchant$Enchantment(ench: Weapon$Enchantment): Weapon {
    if (ench == null || !ench.curse()) {
      this.curseInfusionBonus = false;
    }
    this.enchantment = ench;
    Item.updateQuickslot();
    if (ench != null && this.isIdentified() && Dungeon.hero != null && Dungeon.hero.isAlive() && Dungeon.hero.belongings.contains(this)) {
      Catalog.setSeen(ench.getClass());
      Statistics.itemTypesDiscovered.add(ench.getClass());
    }
    return this;
  }
  enchant$(): Weapon {
    let oldEnchantment = this.enchantment != null ? this.enchantment.getClass() : null;
    let ench = Weapon$Enchantment.random([oldEnchantment]);
    return this.enchant$Enchantment(ench);
  }
  hasEnchant(type$: JClass<Weapon$Enchantment>, owner: Char): boolean {
    if (owner.buff($J.cls(MagicImmune)) != null) {
      return false;
    } else if (this.enchantment != null && !this.enchantment.curse() && owner instanceof Hero && this.isEquipped(owner) && owner.buff($J.cls(HolyWeapon$HolyWepBuff)) != null && (owner).subClass !== HeroSubClass.PALADIN) {
      return false;
    } else if (owner.buff($J.cls(BodyForm$BodyFormBuff)) != null && owner.buff($J.cls(BodyForm$BodyFormBuff)).enchant() != null && $J.equals(owner.buff($J.cls(BodyForm$BodyFormBuff)).enchant().getClass(), type$)) {
      return true;
    } else if (this.enchantment != null) {
      return this.enchantment.getClass() === type$;
    } else {
      return false;
    }
  }
  hasGoodEnchant(): boolean {
    return this.enchantment != null && !this.enchantment.curse();
  }
  hasCurseEnchant(): boolean {
    return this.enchantment != null && this.enchantment.curse();
  }
  glowing(): ItemSprite$Glowing {
    if (this.isEquipped(Dungeon.hero) && !this.hasCurseEnchant() && Dungeon.hero.buff($J.cls(HolyWeapon$HolyWepBuff)) != null && (Dungeon.hero.subClass !== HeroSubClass.PALADIN || this.enchantment == null)) {
      return Weapon.HOLY;
    } else {
      return this.enchantment != null && (this.cursedKnown || !this.enchantment.curse()) ? this.enchantment.glowing() : null;
    }
  }
  static $clinit() {
    Weapon.HOLY = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16776960);
  }
}

export class Weapon$Augment extends JEnum {
  damageFactor_: number = 0;
  delayFactor_: number = 0;
  static SPEED: Weapon$Augment = null;
  static DAMAGE: Weapon$Augment = null;
  static NONE: Weapon$Augment = null;
  static $VALUES: Weapon$Augment[] = null;
  _Weapon$Augment($name: string, $ordinal: number, dmg: number, dly: number): this {
    this._JEnum($name, $ordinal);
    this.damageFactor_ = dmg;
    this.delayFactor_ = dly;
    return this;
  }
  damageFactor$int(dmg: number): number {
    return $J.roundf(Math.fround(dmg * this.damageFactor_));
  }
  damageFactor$float(dmg: number): number {
    return Math.fround(dmg * this.damageFactor_);
  }
  delayFactor(dly: number): number {
    return Math.fround(dly * this.delayFactor_);
  }
  static values(): Weapon$Augment[] { return Weapon$Augment.$VALUES.slice(); }
  static valueOf(name: string): Weapon$Augment { return $J.enumValueOf(Weapon$Augment, name); }
  static $clinit() {
    Weapon$Augment.SPEED = new Weapon$Augment()._Weapon$Augment('SPEED', 0, Math.fround(0.7), Math.fround(2 / 3));
    Weapon$Augment.DAMAGE = new Weapon$Augment()._Weapon$Augment('DAMAGE', 1, 1.5, Math.fround(5 / 3));
    Weapon$Augment.NONE = new Weapon$Augment()._Weapon$Augment('NONE', 2, 1, 1);
    Weapon$Augment.$VALUES = [Weapon$Augment.SPEED, Weapon$Augment.DAMAGE, Weapon$Augment.NONE];
  }
}

export class Weapon$Enchantment extends JObject {
  static common: JClass<any>[] = null;
  static uncommon: JClass<any>[] = null;
  static rare: JClass<any>[] = null;
  static typeChances: number[] = null;
  static curses: JClass<any>[] = null;
  _Weapon$Enchantment(): this {
    return this;
  }
  procChanceMultiplier(attacker: Char): number {
    return Weapon$Enchantment.genericProcChanceMultiplier(attacker);
  }
  static genericProcChanceMultiplier(attacker: Char): number {
    let multi = RingOfArcana.enchantPowerMultiplier(attacker);
    let rage = attacker.buff($J.cls(Berserk));
    if (rage != null) {
      multi = rage.enchantFactor(multi);
    }
    if (attacker.buff($J.cls(RunicBlade$RunicSlashTracker)) != null) {
      multi = Math.fround(multi + attacker.buff($J.cls(RunicBlade$RunicSlashTracker)).boost_);
      attacker.buff($J.cls(RunicBlade$RunicSlashTracker)).detach();
    }
    if (attacker.buff($J.cls(Smite$SmiteTracker)) != null) {
      multi = Math.fround(multi + 3);
    }
    if (attacker.buff($J.cls(ElementalStrike$DirectedPowerTracker)) != null) {
      multi = Math.fround(multi + attacker.buff($J.cls(ElementalStrike$DirectedPowerTracker)).enchBoost);
      attacker.buff($J.cls(ElementalStrike$DirectedPowerTracker)).detach();
    }
    if (attacker.buff($J.cls(Talent$SpiritBladesTracker)) != null && (attacker).pointsInTalent(Talent.SPIRIT_BLADES) === 4) {
      multi = Math.fround(multi + Math.fround(0.1));
    }
    if (attacker.buff($J.cls(Talent$StrikingWaveTracker)) != null && (attacker).pointsInTalent(Talent.STRIKING_WAVE) === 4) {
      multi = Math.fround(multi + Math.fround(0.2));
    }
    return multi;
  }
  name$(): string {
    if (!this.curse()) {
      return this.name$String(Messages.get$Object$String$ObjectArr(this, 'enchant', []));
    } else {
      return this.name$String(Messages.get$Class$String$ObjectArr($J.cls(Item), 'curse', []));
    }
  }
  name$String(weaponName: string): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', [weaponName]);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  curse(): boolean {
    return false;
  }
  restoreFromBundle(bundle: Bundle): void {
  }
  storeInBundle(bundle: Bundle): void {
  }
  static random(toIgnore: JClass<Weapon$Enchantment>[]): Weapon$Enchantment {
    switch (Random.chances$floatArr(Weapon$Enchantment.typeChances)) {
      case 0:
      default:
        return Weapon$Enchantment.randomCommon(toIgnore);
      case 1:
        return Weapon$Enchantment.randomUncommon(toIgnore);
      case 2:
        return Weapon$Enchantment.randomRare(toIgnore);
    }
  }
  static randomCommon(toIgnore: JClass<Weapon$Enchantment>[]): Weapon$Enchantment {
    let enchants = new ArrayList(Arrays.asList(...Weapon$Enchantment.common));
    enchants.removeAll(Arrays.asList(...toIgnore));
    if (enchants.isEmpty()) {
      return Weapon$Enchantment.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(enchants));
    }
  }
  static randomUncommon(toIgnore: JClass<Weapon$Enchantment>[]): Weapon$Enchantment {
    let enchants = new ArrayList(Arrays.asList(...Weapon$Enchantment.uncommon));
    enchants.removeAll(Arrays.asList(...toIgnore));
    if (enchants.isEmpty()) {
      return Weapon$Enchantment.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(enchants));
    }
  }
  static randomRare(toIgnore: JClass<Weapon$Enchantment>[]): Weapon$Enchantment {
    let enchants = new ArrayList(Arrays.asList(...Weapon$Enchantment.rare));
    enchants.removeAll(Arrays.asList(...toIgnore));
    if (enchants.isEmpty()) {
      return Weapon$Enchantment.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(enchants));
    }
  }
  static randomCurse(toIgnore: JClass<Weapon$Enchantment>[]): Weapon$Enchantment {
    let enchants = new ArrayList(Arrays.asList(...Weapon$Enchantment.curses));
    enchants.removeAll(Arrays.asList(...toIgnore));
    if (enchants.isEmpty()) {
      return Weapon$Enchantment.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(enchants));
    }
  }
  static $clinit() {
    Weapon$Enchantment.common = [$J.cls(Blazing), $J.cls(Chilling), $J.cls(Kinetic), $J.cls(Shocking), $J.cls(Venomous)];
    Weapon$Enchantment.uncommon = [$J.cls(Blocking), $J.cls(Blooming), $J.cls(Eldritch), $J.cls(Elastic), $J.cls(Lucky), $J.cls(Projecting), $J.cls(Unstable), $J.cls(Vorpal)];
    Weapon$Enchantment.rare = [$J.cls(Corrupting), $J.cls(Crystal), $J.cls(Grim), $J.cls(Vampiric)];
    Weapon$Enchantment.typeChances = [50, 40, 10];
    Weapon$Enchantment.curses = [$J.cls(Annoying), $J.cls(Displacing), $J.cls(Dazzling), $J.cls(Explosive), $J.cls(Friendly), $J.cls(Polarized), $J.cls(Pressurized), $J.cls(Sacrificial), $J.cls(Wayward), $J.cls(Wondrous)];
  }
}

$J.define(Weapon, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.KindOfWeapon', ctors: { '': '_Weapon' }, meths: { 'enchant()': 'enchant$', 'enchant(com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment)': 'enchant$Enchantment', 'upgrade(boolean)': 'upgrade$boolean', 'upgrade()': 'upgrade$', 'level()': 'level$', 'STRReq(int)': 'STRReq$int', 'STRReq()': 'STRReq$', 'identify(boolean)': 'identify$boolean', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag' }, clinit: true, lazy: ['HOLY'] });
$J.define(Weapon$Augment, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'float,float': '_Weapon$Augment' }, meths: { 'damageFactor(float)': 'damageFactor$float', 'damageFactor(int)': 'damageFactor$int' }, clinit: true, lazy: ['$VALUES', 'SPEED', 'DAMAGE', 'NONE'] });
$J.define(Weapon$Enchantment, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Weapon$Enchantment' }, meths: { 'name(java.lang.String)': 'name$String', 'name()': 'name$' }, clinit: true, lazy: ['common', 'uncommon', 'rare', 'typeChances', 'curses'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Berserk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Berserk');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$SpiritBladesTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SpiritBladesTracker');
  Talent$StrikingWaveTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$StrikingWaveTracker');
  AscendedForm$AscendBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff');
  ElementalStrike$DirectedPowerTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike$DirectedPowerTracker');
  ShadowClone$ShadowAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone$ShadowAlly');
  BodyForm$BodyFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm$BodyFormBuff');
  HolyWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon');
  HolyWeapon$HolyWepBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon$HolyWepBuff');
  Smite = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite');
  Smite$SmiteTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite$SmiteTracker');
  MirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfArcana = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfArcana');
  RingOfForce = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce');
  RingOfFuror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfFuror');
  ParchmentScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ParchmentScrap');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  Annoying = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Annoying');
  Dazzling = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Dazzling');
  Displacing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Displacing');
  Explosive = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Explosive');
  Friendly = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Friendly');
  Polarized = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Polarized');
  Pressurized = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Pressurized');
  Sacrificial = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Sacrificial');
  Wayward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wayward');
  Wayward$WaywardBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wayward$WaywardBuff');
  Wondrous = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wondrous');
  Blazing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blazing');
  Blocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking');
  Blooming = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blooming');
  Chilling = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Chilling');
  Corrupting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting');
  Crystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal');
  Elastic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Elastic');
  Eldritch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Eldritch');
  Grim = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim');
  Kinetic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic');
  Lucky = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky');
  Projecting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Projecting');
  Shocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking');
  Unstable = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Unstable');
  Vampiric = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vampiric');
  Venomous = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Venomous');
  Vorpal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  RunicBlade$RunicSlashTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RunicBlade$RunicSlashTracker');
  Scimitar$SwordDance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Scimitar$SwordDance');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
