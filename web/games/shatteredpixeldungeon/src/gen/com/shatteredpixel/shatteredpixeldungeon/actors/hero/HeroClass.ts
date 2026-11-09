// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/HeroClass.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../../jre/index.ts';

let Assets$Splashes, Assets$Sprites, Badges, Badges$Badge, Challenges, Dungeon, Dungeon$LimitedDrops, QuickSlot, SPDSettings, HeroSubClass, Talent, AscendedForm, PowerOfMany, Trinity, Challenge, ElementalStrike, Feint, NaturesPower, SpectralBlades, SpiritHawk, ElementalBlast, WarpBeacon, WildMagic, DeathMark, ShadowClone, SmokeBomb, Endure, HeroicLeap, Shockwave, BrokenSeal, Waterskin, ClothArmor, CloakOfShadows, HolyTome, VelvetPouch, Food, PotionOfHealing, PotionOfInvisibility, PotionOfLiquidFlame, PotionOfMindVision, PotionOfPurity, PotionOfStrength, ScrollOfIdentify, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfMirrorImage, ScrollOfRage, ScrollOfRemoveCurse, ScrollOfUpgrade, WandOfMagicMissile, SpiritBow, Cudgel, Dagger, Gloves, MagesStaff, Rapier, WornShortsword, ThrowingKnife, ThrowingSpike, ThrowingStone, Catalog, Messages, DeviceCompat;

export class HeroClass extends JEnum {
  subClasses_: HeroSubClass[] = null;
  static WARRIOR: HeroClass = null;
  static MAGE: HeroClass = null;
  static ROGUE: HeroClass = null;
  static HUNTRESS: HeroClass = null;
  static DUELIST: HeroClass = null;
  static CLERIC: HeroClass = null;
  static $VALUES: HeroClass[] = null;
  _HeroClass($name: string, $ordinal: number, subClasses: HeroSubClass[]): this {
    this._JEnum($name, $ordinal);
    this.subClasses_ = subClasses;
    return this;
  }
  initHero(hero: Hero): void {
    hero.heroClass = this;
    Talent.initClassTalents$Hero(hero);
    let i = new ClothArmor()._ClothArmor().identify$();
    if (!Challenges.isItemBlocked(i)) {
      hero.belongings.armor_ = i;
    }
    i = new Food()._Food();
    if (!Challenges.isItemBlocked(i)) {
      i.collect$();
    }
    new VelvetPouch()._VelvetPouch().collect$();
    Dungeon$LimitedDrops.VELVET_POUCH.drop();
    let waterskin = new Waterskin()._Waterskin();
    waterskin.collect$();
    new ScrollOfIdentify()._ScrollOfIdentify().identify$();
    switch (this) {
      case HeroClass.WARRIOR:
        HeroClass.initWarrior(hero);
        break;
      case HeroClass.MAGE:
        HeroClass.initMage(hero);
        break;
      case HeroClass.ROGUE:
        HeroClass.initRogue(hero);
        break;
      case HeroClass.HUNTRESS:
        HeroClass.initHuntress(hero);
        break;
      case HeroClass.DUELIST:
        HeroClass.initDuelist(hero);
        break;
      case HeroClass.CLERIC:
        HeroClass.initCleric(hero);
        break;
    }
    if (SPDSettings.quickslotWaterskin$()) {
      for (let s = 0; s < QuickSlot.SIZE; s++) {
        if (Dungeon.quickslot.getItem(s) == null) {
          Dungeon.quickslot.setSlot(s, waterskin);
          break;
        }
      }
    }
  }
  masteryBadge(): Badges$Badge {
    switch (this) {
      case HeroClass.WARRIOR:
        return Badges$Badge.MASTERY_WARRIOR;
      case HeroClass.MAGE:
        return Badges$Badge.MASTERY_MAGE;
      case HeroClass.ROGUE:
        return Badges$Badge.MASTERY_ROGUE;
      case HeroClass.HUNTRESS:
        return Badges$Badge.MASTERY_HUNTRESS;
      case HeroClass.DUELIST:
        return Badges$Badge.MASTERY_DUELIST;
      case HeroClass.CLERIC:
        return Badges$Badge.MASTERY_CLERIC;
    }
    return null;
  }
  static initWarrior(hero: Hero): void {
    (hero.belongings.weapon_ = new WornShortsword()._WornShortsword()).identify$();
    let stones = new ThrowingStone()._ThrowingStone();
    stones.identify$().collect$();
    Dungeon.quickslot.setSlot(0, stones);
    if (hero.belongings.armor_ != null) {
      hero.belongings.armor_.affixSeal(new BrokenSeal()._BrokenSeal());
      Catalog.setSeen($J.cls(BrokenSeal));
    }
    new PotionOfHealing()._PotionOfHealing().identify$();
    new ScrollOfRage()._ScrollOfRage().identify$();
  }
  static initMage(hero: Hero): void {
    let staff: MagesStaff;
    staff = new MagesStaff()._MagesStaff$Wand(new WandOfMagicMissile()._WandOfMagicMissile());
    (hero.belongings.weapon_ = staff).identify$();
    hero.belongings.weapon_.activate(hero);
    Dungeon.quickslot.setSlot(0, staff);
    new ScrollOfUpgrade()._ScrollOfUpgrade().identify$();
    new PotionOfLiquidFlame()._PotionOfLiquidFlame().identify$();
  }
  static initRogue(hero: Hero): void {
    (hero.belongings.weapon_ = new Dagger()._Dagger()).identify$();
    let cloak = new CloakOfShadows()._CloakOfShadows();
    (hero.belongings.artifact_ = cloak).identify$();
    hero.belongings.artifact_.activate(hero);
    let knives = new ThrowingKnife()._ThrowingKnife();
    knives.identify$().collect$();
    Dungeon.quickslot.setSlot(0, cloak);
    Dungeon.quickslot.setSlot(1, knives);
    new ScrollOfMagicMapping()._ScrollOfMagicMapping().identify$();
    new PotionOfInvisibility()._PotionOfInvisibility().identify$();
  }
  static initHuntress(hero: Hero): void {
    (hero.belongings.weapon_ = new Gloves()._Gloves()).identify$();
    let bow = new SpiritBow()._SpiritBow();
    bow.identify$().collect$();
    Dungeon.quickslot.setSlot(0, bow);
    new PotionOfMindVision()._PotionOfMindVision().identify$();
    new ScrollOfLullaby()._ScrollOfLullaby().identify$();
  }
  static initDuelist(hero: Hero): void {
    (hero.belongings.weapon_ = new Rapier()._Rapier()).identify$();
    hero.belongings.weapon_.activate(hero);
    let spikes = new ThrowingSpike()._ThrowingSpike();
    spikes.quantity$int(2).identify$().collect$();
    Dungeon.quickslot.setSlot(0, hero.belongings.weapon_);
    Dungeon.quickslot.setSlot(1, spikes);
    new PotionOfStrength()._PotionOfStrength().identify$();
    new ScrollOfMirrorImage()._ScrollOfMirrorImage().identify$();
  }
  static initCleric(hero: Hero): void {
    (hero.belongings.weapon_ = new Cudgel()._Cudgel()).identify$();
    hero.belongings.weapon_.activate(hero);
    let tome = new HolyTome()._HolyTome();
    (hero.belongings.artifact_ = tome).identify$();
    hero.belongings.artifact_.activate(hero);
    Dungeon.quickslot.setSlot(0, tome);
    new PotionOfPurity()._PotionOfPurity().identify$();
    new ScrollOfRemoveCurse()._ScrollOfRemoveCurse().identify$();
  }
  title(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(HeroClass), this.name(), []);
  }
  desc(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(HeroClass), this.name() + '_desc', []);
  }
  shortDesc(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(HeroClass), this.name() + '_desc_short', []);
  }
  subClasses(): HeroSubClass[] {
    return this.subClasses_;
  }
  armorAbilities(): ArmorAbility[] {
    switch (this) {
      case HeroClass.WARRIOR:
      default:
        return [new HeroicLeap()._HeroicLeap(), new Shockwave()._Shockwave(), new Endure()._Endure()];
      case HeroClass.MAGE:
        return [new ElementalBlast()._ElementalBlast(), new WildMagic()._WildMagic(), new WarpBeacon()._WarpBeacon()];
      case HeroClass.ROGUE:
        return [new SmokeBomb()._SmokeBomb(), new DeathMark()._DeathMark(), new ShadowClone()._ShadowClone()];
      case HeroClass.HUNTRESS:
        return [new SpectralBlades()._SpectralBlades(), new NaturesPower()._NaturesPower(), new SpiritHawk()._SpiritHawk()];
      case HeroClass.DUELIST:
        return [new Challenge()._Challenge(), new ElementalStrike()._ElementalStrike(), new Feint()._Feint()];
      case HeroClass.CLERIC:
        return [new AscendedForm()._AscendedForm(), new Trinity()._Trinity(), new PowerOfMany()._PowerOfMany()];
    }
  }
  spritesheet(): string {
    switch (this) {
      case HeroClass.WARRIOR:
      default:
        return Assets$Sprites.WARRIOR;
      case HeroClass.MAGE:
        return Assets$Sprites.MAGE;
      case HeroClass.ROGUE:
        return Assets$Sprites.ROGUE;
      case HeroClass.HUNTRESS:
        return Assets$Sprites.HUNTRESS;
      case HeroClass.DUELIST:
        return Assets$Sprites.DUELIST;
      case HeroClass.CLERIC:
        return Assets$Sprites.CLERIC;
    }
  }
  splashArt(): string {
    switch (this) {
      case HeroClass.WARRIOR:
      default:
        return Assets$Splashes.WARRIOR;
      case HeroClass.MAGE:
        return Assets$Splashes.MAGE;
      case HeroClass.ROGUE:
        return Assets$Splashes.ROGUE;
      case HeroClass.HUNTRESS:
        return Assets$Splashes.HUNTRESS;
      case HeroClass.DUELIST:
        return Assets$Splashes.DUELIST;
      case HeroClass.CLERIC:
        return Assets$Splashes.CLERIC;
    }
  }
  isUnlocked(): boolean {
    if (DeviceCompat.isDebug()) {
      return true;
    }
    switch (this) {
      case HeroClass.WARRIOR:
      default:
        return true;
      case HeroClass.MAGE:
        return Badges.isUnlocked(Badges$Badge.UNLOCK_MAGE);
      case HeroClass.ROGUE:
        return Badges.isUnlocked(Badges$Badge.UNLOCK_ROGUE);
      case HeroClass.HUNTRESS:
        return Badges.isUnlocked(Badges$Badge.UNLOCK_HUNTRESS);
      case HeroClass.DUELIST:
        return Badges.isUnlocked(Badges$Badge.UNLOCK_DUELIST);
      case HeroClass.CLERIC:
        return Badges.isUnlocked(Badges$Badge.UNLOCK_CLERIC);
    }
  }
  unlockMsg(): string {
    return this.shortDesc() + '\n\n' + (Messages.get$Class$String$ObjectArr($J.cls(HeroClass), this.name() + '_unlock', []));
  }
  static values(): HeroClass[] { return HeroClass.$VALUES.slice(); }
  static valueOf(name: string): HeroClass { return $J.enumValueOf(HeroClass, name); }
  static $clinit() {
    HeroClass.WARRIOR = new HeroClass()._HeroClass('WARRIOR', 0, [HeroSubClass.BERSERKER, HeroSubClass.GLADIATOR]);
    HeroClass.MAGE = new HeroClass()._HeroClass('MAGE', 1, [HeroSubClass.BATTLEMAGE, HeroSubClass.WARLOCK]);
    HeroClass.ROGUE = new HeroClass()._HeroClass('ROGUE', 2, [HeroSubClass.ASSASSIN, HeroSubClass.FREERUNNER]);
    HeroClass.HUNTRESS = new HeroClass()._HeroClass('HUNTRESS', 3, [HeroSubClass.SNIPER, HeroSubClass.WARDEN]);
    HeroClass.DUELIST = new HeroClass()._HeroClass('DUELIST', 4, [HeroSubClass.CHAMPION, HeroSubClass.MONK]);
    HeroClass.CLERIC = new HeroClass()._HeroClass('CLERIC', 5, [HeroSubClass.PRIEST, HeroSubClass.PALADIN]);
    HeroClass.$VALUES = [HeroClass.WARRIOR, HeroClass.MAGE, HeroClass.ROGUE, HeroClass.HUNTRESS, HeroClass.DUELIST, HeroClass.CLERIC];
  }
}

$J.define(HeroClass, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass[]': '_HeroClass' }, clinit: true, lazy: ['$VALUES', 'WARRIOR', 'MAGE', 'ROGUE', 'HUNTRESS', 'DUELIST', 'CLERIC'] });
$J.module(() => {
  Assets$Splashes = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Splashes');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  QuickSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.QuickSlot');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  AscendedForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  Trinity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity');
  Challenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge');
  ElementalStrike = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike');
  Feint = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Feint');
  NaturesPower = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.NaturesPower');
  SpectralBlades = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpectralBlades');
  SpiritHawk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk');
  ElementalBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.ElementalBlast');
  WarpBeacon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WarpBeacon');
  WildMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WildMagic');
  DeathMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.DeathMark');
  ShadowClone = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone');
  SmokeBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.SmokeBomb');
  Endure = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Endure');
  HeroicLeap = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.HeroicLeap');
  Shockwave = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Shockwave');
  BrokenSeal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal');
  Waterskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Waterskin');
  ClothArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClothArmor');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  Food = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Food');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  PotionOfMindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfMindVision');
  PotionOfPurity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity');
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  WandOfMagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  Cudgel = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Cudgel');
  Dagger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Dagger');
  Gloves = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Gloves');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Rapier = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Rapier');
  WornShortsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WornShortsword');
  ThrowingKnife = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingKnife');
  ThrowingSpike = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingSpike');
  ThrowingStone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingStone');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
