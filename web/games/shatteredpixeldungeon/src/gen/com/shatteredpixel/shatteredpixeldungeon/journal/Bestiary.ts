// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/journal/Bestiary.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, JEnum, LinkedHashMap } from '../../../../../jre/index.ts';

let Badges, PowerOfMany$LightAlly, SpiritHawk$HawkAlly, ShadowClone$ShadowAlly, SmokeBomb$NinjaLog, Acidic, Albino, ArmoredBrute, ArmoredStatue, Bandit, Bat, Bee, Brute, CausticSlime, Crab, CrystalGuardian, CrystalMimic, CrystalSpire, CrystalWisp, DM100, DM200, DM201, DM300, DemonSpawner, DwarfKing, DwarfKing$DKGhoul, DwarfKing$DKGolem, DwarfKing$DKMonk, DwarfKing$DKWarlock, EbonyMimic, Elemental$ChaosElemental, Elemental$FireElemental, Elemental$FrostElemental, Elemental$NewbornFireElemental, Elemental$ShockElemental, Eye, FetidRat, Ghoul, Gnoll, GnollExile, GnollGeomancer, GnollGuard, GnollSapper, GnollTrickster, GoldenMimic, Golem, Goo, GreatCrab, Guard, HermitCrab, Mimic, Monk, Necromancer, Necromancer$NecroSkeleton, PhantomPiranha, Piranha, Pylon, Rat, RipperDemon, RotHeart, RotLasher, Scorpio, Senior, Shaman$BlueShaman, Shaman$PurpleShaman, Shaman$RedShaman, Skeleton, Slime, Snake, SpectralNecromancer, Spinner, Statue, Succubus, Swarm, Tengu, Thief, TormentedSpirit, Warlock, Wraith, YogDzewa, YogDzewa$Larva, YogDzewa$YogEye, YogDzewa$YogRipper, YogDzewa$YogScorpio, YogFist$BrightFist, YogFist$BurningFist, YogFist$DarkFist, YogFist$RottingFist, YogFist$RustedFist, YogFist$SoiledFist, Blacksmith, Ghost, Imp, MirrorImage, PrismaticImage, RatKing, Sheep, Shopkeeper, VaultLaser, VaultSentry, Wandmaker, VaultBossElemental, VaultDM100, VaultDM200, VaultElemental$Fire, VaultElemental$Frost, VaultElemental$Shock, VaultGhoul, VaultGolem, VaultShaman, VaultSkeleton, DriedRose$GhostHero, CorpseDust$DustWraith, WandOfLivingEarth$EarthGuardian, WandOfRegrowth$Dewcatcher, WandOfRegrowth$Lotus, WandOfRegrowth$Seedpod, WandOfWarding$Ward, WandOfWarding$Ward$WardSentry, Journal, SentryRoom$Sentry, AlarmTrap, BlazingTrap, BurningTrap, ChillingTrap, ConfusionTrap, CorrosionTrap, CursingTrap, DisarmingTrap, DisintegrationTrap, DistortionTrap, ExplosiveTrap, FlashingTrap, FlockTrap, FrostTrap, GatewayTrap, GeyserTrap, GnollRockfallTrap, GrimTrap, GrippingTrap, GuardianTrap, GuardianTrap$Guardian, OozeTrap, PitfallTrap, PoisonDartTrap, RockfallTrap, ShockingTrap, StormTrap, SummoningTrap, TeleportationTrap, TenguDartTrap, ToxicTrap, WarpingTrap, WeakeningTrap, WornDartTrap, Messages, BlandfruitBush, Blindweed, Earthroot, Fadeleaf, Firebloom, Icecap, Mageroyal, Rotberry, Sorrowmoss, Starflower, Stormvine, Sungrass, Swiftthistle;

export class Bestiary extends JEnum {
  seen: LinkedHashMap<JClass<any>, boolean> = null;
  encounterCount: LinkedHashMap<JClass<any>, number> = null;
  static classConversions: HashMap<JClass<any>, JClass<any>> = null;
  static skipCountingEncounters: boolean = false;
  static readonly BESTIARY_CLASSES: string = 'bestiary_classes';
  static readonly BESTIARY_SEEN: string = 'bestiary_seen';
  static readonly BESTIARY_ENCOUNTERS: string = 'bestiary_encounters';
  static REGIONAL: Bestiary = null;
  static BOSSES: Bestiary = null;
  static UNIVERSAL: Bestiary = null;
  static RARE: Bestiary = null;
  static QUEST: Bestiary = null;
  static NEUTRAL: Bestiary = null;
  static ALLY: Bestiary = null;
  static TRAP: Bestiary = null;
  static PLANT: Bestiary = null;
  static $VALUES: Bestiary[] = null;
  _Bestiary($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    this.seen = new LinkedHashMap();
    this.encounterCount = new LinkedHashMap();
    return this;
  }
  addEntities(classes: JClass<any>[]): void {
    for (let cls of classes) {
      this.seen.put(cls, false);
      this.encounterCount.put(cls, 0);
    }
  }
  entities(): Collection<JClass<any>> {
    return this.seen.keySet();
  }
  title(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.title', []);
  }
  totalEntities(): number {
    return this.seen.size();
  }
  totalSeen(): number {
    let seenTotal = 0;
    for (const $it0 = this.seen.values().iterator(); $it0.hasNext(); ) {
      let entitySeen = $it0.next();
      if (entitySeen) {
        seenTotal++;
      }
    }
    return seenTotal;
  }
  static isSeen(cls: JClass<any>): boolean {
    for (let cat of Bestiary.values()) {
      if (cat.seen.containsKey(cls)) {
        return cat.seen.get(cls);
      }
    }
    return false;
  }
  static setSeen(cls: JClass<any>): void {
    if (Bestiary.classConversions.containsKey(cls)) {
      cls = Bestiary.classConversions.get(cls);
    }
    for (let cat of Bestiary.values()) {
      if (cat.seen.containsKey(cls) && !cat.seen.get(cls)) {
        cat.seen.put(cls, true);
        Journal.saveNeeded = true;
      }
    }
    Badges.validateCatalogBadges();
  }
  static encounterCount(cls: JClass<any>): number {
    for (let cat of Bestiary.values()) {
      if (cat.encounterCount.containsKey(cls)) {
        return cat.encounterCount.get(cls);
      }
    }
    return 0;
  }
  static countEncounter(cls: JClass<any>): void {
    Bestiary.countEncounters(cls, 1);
  }
  static countEncounters(cls: JClass<any>, encounters: number): void {
    if (Bestiary.skipCountingEncounters) {
      return;
    }
    if (Bestiary.classConversions.containsKey(cls)) {
      cls = Bestiary.classConversions.get(cls);
    }
    for (let cat of Bestiary.values()) {
      if (cat.encounterCount.containsKey(cls) && cat.encounterCount.get(cls) !== 2147483647) {
        cat.encounterCount.put(cls, (cat.encounterCount.get(cls) + encounters) | 0);
        if (cat.encounterCount.get(cls) < -1000000000) {
          cat.encounterCount.put(cls, 2147483647);
        }
        Journal.saveNeeded = true;
      }
    }
  }
  static store(bundle: Bundle): void {
    let classes = new ArrayList();
    let seen = new ArrayList();
    let encounters = new ArrayList();
    for (let cat of Bestiary.values()) {
      for (const $it1 = cat.entities().iterator(); $it1.hasNext(); ) {
        let entity = $it1.next();
        if (cat.seen.get(entity) || cat.encounterCount.get(entity) > 0) {
          classes.add(entity);
          seen.add(cat.seen.get(entity));
          encounters.add(cat.encounterCount.get(entity));
        }
      }
    }
    let storeCls = $J.newArray(classes.size(), null);
    let storeSeen = $J.newArray(seen.size(), false);
    let storeEncounters = $J.newArray(encounters.size(), 0);
    for (let i = 0; i < storeCls.length; i++) {
      storeCls[i] = classes.get(i);
      storeSeen[i] = seen.get(i);
      storeEncounters[i] = encounters.get(i);
    }
    bundle.put$String$ClassArr(Bestiary.BESTIARY_CLASSES, storeCls);
    bundle.put$String$booleanArr(Bestiary.BESTIARY_SEEN, storeSeen);
    bundle.put$String$intArr(Bestiary.BESTIARY_ENCOUNTERS, storeEncounters);
  }
  static restore(bundle: Bundle): void {
    if (bundle.contains(Bestiary.BESTIARY_CLASSES) && bundle.contains(Bestiary.BESTIARY_SEEN) && bundle.contains(Bestiary.BESTIARY_ENCOUNTERS)) {
      let classes = bundle.getClassArray(Bestiary.BESTIARY_CLASSES);
      let seen = bundle.getBooleanArray(Bestiary.BESTIARY_SEEN);
      let encounters = bundle.getIntArray(Bestiary.BESTIARY_ENCOUNTERS);
      for (let i = 0; i < classes.length; i++) {
        for (let cat of Bestiary.values()) {
          if (cat.seen.containsKey(classes[i])) {
            cat.seen.put(classes[i], seen[i]);
            cat.encounterCount.put(classes[i], encounters[i]);
          }
        }
      }
    }
  }
  static values(): Bestiary[] { return Bestiary.$VALUES.slice(); }
  static valueOf(name: string): Bestiary { return $J.enumValueOf(Bestiary, name); }
  static $clinit() {
    Bestiary.REGIONAL = new Bestiary()._Bestiary('REGIONAL', 0);
    Bestiary.BOSSES = new Bestiary()._Bestiary('BOSSES', 1);
    Bestiary.UNIVERSAL = new Bestiary()._Bestiary('UNIVERSAL', 2);
    Bestiary.RARE = new Bestiary()._Bestiary('RARE', 3);
    Bestiary.QUEST = new Bestiary()._Bestiary('QUEST', 4);
    Bestiary.NEUTRAL = new Bestiary()._Bestiary('NEUTRAL', 5);
    Bestiary.ALLY = new Bestiary()._Bestiary('ALLY', 6);
    Bestiary.TRAP = new Bestiary()._Bestiary('TRAP', 7);
    Bestiary.PLANT = new Bestiary()._Bestiary('PLANT', 8);
    Bestiary.$VALUES = [Bestiary.REGIONAL, Bestiary.BOSSES, Bestiary.UNIVERSAL, Bestiary.RARE, Bestiary.QUEST, Bestiary.NEUTRAL, Bestiary.ALLY, Bestiary.TRAP, Bestiary.PLANT];
    Bestiary.REGIONAL.addEntities([$J.cls(Rat), $J.cls(Snake), $J.cls(Gnoll), $J.cls(Swarm), $J.cls(Crab), $J.cls(Slime), $J.cls(Skeleton), $J.cls(Thief), $J.cls(DM100), $J.cls(Guard), $J.cls(Necromancer), $J.cls(Bat), $J.cls(Brute), $J.cls(Shaman$RedShaman), $J.cls(Shaman$BlueShaman), $J.cls(Shaman$PurpleShaman), $J.cls(Spinner), $J.cls(DM200), $J.cls(Ghoul), $J.cls(Elemental$FireElemental), $J.cls(Elemental$FrostElemental), $J.cls(Elemental$ShockElemental), $J.cls(Warlock), $J.cls(Monk), $J.cls(Golem), $J.cls(RipperDemon), $J.cls(DemonSpawner), $J.cls(Succubus), $J.cls(Eye), $J.cls(Scorpio)]);
    Bestiary.BOSSES.addEntities([$J.cls(Goo), $J.cls(Tengu), $J.cls(Pylon), $J.cls(DM300), $J.cls(DwarfKing), $J.cls(YogDzewa$Larva), $J.cls(YogFist$BurningFist), $J.cls(YogFist$SoiledFist), $J.cls(YogFist$RottingFist), $J.cls(YogFist$RustedFist), $J.cls(YogFist$BrightFist), $J.cls(YogFist$DarkFist), $J.cls(YogDzewa)]);
    Bestiary.UNIVERSAL.addEntities([$J.cls(Wraith), $J.cls(Piranha), $J.cls(Mimic), $J.cls(GoldenMimic), $J.cls(EbonyMimic), $J.cls(Statue), $J.cls(GuardianTrap$Guardian), $J.cls(SentryRoom$Sentry)]);
    Bestiary.RARE.addEntities([$J.cls(Albino), $J.cls(GnollExile), $J.cls(HermitCrab), $J.cls(CausticSlime), $J.cls(Bandit), $J.cls(SpectralNecromancer), $J.cls(ArmoredBrute), $J.cls(DM201), $J.cls(Elemental$ChaosElemental), $J.cls(Senior), $J.cls(Acidic), $J.cls(TormentedSpirit), $J.cls(PhantomPiranha), $J.cls(CrystalMimic), $J.cls(ArmoredStatue)]);
    Bestiary.QUEST.addEntities([$J.cls(FetidRat), $J.cls(GnollTrickster), $J.cls(GreatCrab), $J.cls(Elemental$NewbornFireElemental), $J.cls(RotLasher), $J.cls(RotHeart), $J.cls(CrystalWisp), $J.cls(CrystalGuardian), $J.cls(CrystalSpire), $J.cls(GnollGuard), $J.cls(GnollSapper), $J.cls(GnollGeomancer), $J.cls(VaultSkeleton), $J.cls(VaultDM100), $J.cls(VaultShaman), $J.cls(VaultDM200), $J.cls(VaultSentry), $J.cls(VaultLaser), $J.cls(VaultBossElemental)]);
    Bestiary.NEUTRAL.addEntities([$J.cls(Ghost), $J.cls(RatKing), $J.cls(Shopkeeper), $J.cls(Wandmaker), $J.cls(Blacksmith), $J.cls(Imp), $J.cls(Sheep), $J.cls(Bee)]);
    Bestiary.ALLY.addEntities([$J.cls(MirrorImage), $J.cls(PrismaticImage), $J.cls(DriedRose$GhostHero), $J.cls(WandOfWarding$Ward), $J.cls(WandOfWarding$Ward$WardSentry), $J.cls(WandOfLivingEarth$EarthGuardian), $J.cls(ShadowClone$ShadowAlly), $J.cls(SmokeBomb$NinjaLog), $J.cls(SpiritHawk$HawkAlly), $J.cls(PowerOfMany$LightAlly)]);
    Bestiary.TRAP.addEntities([$J.cls(WornDartTrap), $J.cls(PoisonDartTrap), $J.cls(DisintegrationTrap), $J.cls(GatewayTrap), $J.cls(ChillingTrap), $J.cls(BurningTrap), $J.cls(ShockingTrap), $J.cls(AlarmTrap), $J.cls(GrippingTrap), $J.cls(TeleportationTrap), $J.cls(OozeTrap), $J.cls(FrostTrap), $J.cls(BlazingTrap), $J.cls(StormTrap), $J.cls(GuardianTrap), $J.cls(FlashingTrap), $J.cls(WarpingTrap), $J.cls(ConfusionTrap), $J.cls(ToxicTrap), $J.cls(CorrosionTrap), $J.cls(FlockTrap), $J.cls(SummoningTrap), $J.cls(WeakeningTrap), $J.cls(CursingTrap), $J.cls(GeyserTrap), $J.cls(ExplosiveTrap), $J.cls(RockfallTrap), $J.cls(PitfallTrap), $J.cls(DistortionTrap), $J.cls(DisarmingTrap), $J.cls(GrimTrap)]);
    Bestiary.PLANT.addEntities([$J.cls(Rotberry), $J.cls(Sungrass), $J.cls(Fadeleaf), $J.cls(Icecap), $J.cls(Firebloom), $J.cls(Sorrowmoss), $J.cls(Swiftthistle), $J.cls(Blindweed), $J.cls(Stormvine), $J.cls(Earthroot), $J.cls(Mageroyal), $J.cls(Starflower), $J.cls(BlandfruitBush), $J.cls(WandOfRegrowth$Dewcatcher), $J.cls(WandOfRegrowth$Seedpod), $J.cls(WandOfRegrowth$Lotus)]);
    Bestiary.classConversions = new HashMap();
    Bestiary.classConversions.put($J.cls(CorpseDust$DustWraith), $J.cls(Wraith));
    Bestiary.classConversions.put($J.cls(Necromancer$NecroSkeleton), $J.cls(Skeleton));
    Bestiary.classConversions.put($J.cls(TenguDartTrap), $J.cls(PoisonDartTrap));
    Bestiary.classConversions.put($J.cls(GnollRockfallTrap), $J.cls(RockfallTrap));
    Bestiary.classConversions.put($J.cls(VaultGhoul), $J.cls(Ghoul));
    Bestiary.classConversions.put($J.cls(VaultElemental$Fire), $J.cls(Elemental$FireElemental));
    Bestiary.classConversions.put($J.cls(VaultElemental$Frost), $J.cls(Elemental$FrostElemental));
    Bestiary.classConversions.put($J.cls(VaultElemental$Shock), $J.cls(Elemental$ShockElemental));
    Bestiary.classConversions.put($J.cls(VaultGolem), $J.cls(Golem));
    Bestiary.classConversions.put($J.cls(DwarfKing$DKGhoul), $J.cls(Ghoul));
    Bestiary.classConversions.put($J.cls(DwarfKing$DKWarlock), $J.cls(Warlock));
    Bestiary.classConversions.put($J.cls(DwarfKing$DKMonk), $J.cls(Monk));
    Bestiary.classConversions.put($J.cls(DwarfKing$DKGolem), $J.cls(Golem));
    Bestiary.classConversions.put($J.cls(YogDzewa$YogRipper), $J.cls(RipperDemon));
    Bestiary.classConversions.put($J.cls(YogDzewa$YogEye), $J.cls(Eye));
    Bestiary.classConversions.put($J.cls(YogDzewa$YogScorpio), $J.cls(Scorpio));
    Bestiary.skipCountingEncounters = false;
  }
}

$J.define(Bestiary, 'com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Bestiary' }, clinit: true, lazy: ['$VALUES', 'REGIONAL', 'BOSSES', 'UNIVERSAL', 'RARE', 'QUEST', 'NEUTRAL', 'ALLY', 'TRAP', 'PLANT', 'classConversions', 'skipCountingEncounters'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  PowerOfMany$LightAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$LightAlly');
  SpiritHawk$HawkAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.SpiritHawk$HawkAlly');
  ShadowClone$ShadowAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone$ShadowAlly');
  SmokeBomb$NinjaLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.SmokeBomb$NinjaLog');
  Acidic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Acidic');
  Albino = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Albino');
  ArmoredBrute = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredBrute');
  ArmoredStatue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredStatue');
  Bandit = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bandit');
  Bat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bat');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  Brute = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute');
  CausticSlime = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CausticSlime');
  Crab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab');
  CrystalGuardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalGuardian');
  CrystalMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalMimic');
  CrystalSpire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire');
  CrystalWisp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalWisp');
  DM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM100');
  DM200 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200');
  DM201 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM201');
  DM300 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300');
  DemonSpawner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DemonSpawner');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  DwarfKing$DKGhoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKGhoul');
  DwarfKing$DKGolem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKGolem');
  DwarfKing$DKMonk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKMonk');
  DwarfKing$DKWarlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$DKWarlock');
  EbonyMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.EbonyMimic');
  Elemental$ChaosElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ChaosElemental');
  Elemental$FireElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FireElemental');
  Elemental$FrostElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FrostElemental');
  Elemental$NewbornFireElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$NewbornFireElemental');
  Elemental$ShockElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ShockElemental');
  Eye = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye');
  FetidRat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FetidRat');
  Ghoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul');
  Gnoll = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Gnoll');
  GnollExile = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollExile');
  GnollGeomancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer');
  GnollGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard');
  GnollSapper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollSapper');
  GnollTrickster = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollTrickster');
  GoldenMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GoldenMimic');
  Golem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem');
  Goo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Goo');
  GreatCrab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GreatCrab');
  Guard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard');
  HermitCrab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.HermitCrab');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Monk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk');
  Necromancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer');
  Necromancer$NecroSkeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer$NecroSkeleton');
  PhantomPiranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.PhantomPiranha');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  Pylon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Pylon');
  Rat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat');
  RipperDemon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon');
  RotHeart = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotHeart');
  RotLasher = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotLasher');
  Scorpio = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Scorpio');
  Senior = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Senior');
  Shaman$BlueShaman = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$BlueShaman');
  Shaman$PurpleShaman = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$PurpleShaman');
  Shaman$RedShaman = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$RedShaman');
  Skeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Skeleton');
  Slime = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Slime');
  Snake = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Snake');
  SpectralNecromancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.SpectralNecromancer');
  Spinner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Spinner');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  Succubus = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Succubus');
  Swarm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm');
  Tengu = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu');
  Thief = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief');
  TormentedSpirit = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.TormentedSpirit');
  Warlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Warlock');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  YogDzewa = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa');
  YogDzewa$Larva = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$Larva');
  YogDzewa$YogEye = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$YogEye');
  YogDzewa$YogRipper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$YogRipper');
  YogDzewa$YogScorpio = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$YogScorpio');
  YogFist$BrightFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BrightFist');
  YogFist$BurningFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BurningFist');
  YogFist$DarkFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$DarkFist');
  YogFist$RottingFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$RottingFist');
  YogFist$RustedFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$RustedFist');
  YogFist$SoiledFist = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$SoiledFist');
  Blacksmith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith');
  Ghost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost');
  Imp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp');
  MirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage');
  PrismaticImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage');
  RatKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.RatKing');
  Sheep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  VaultLaser = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultLaser');
  VaultSentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultSentry');
  Wandmaker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker');
  VaultBossElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental');
  VaultDM100 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM100');
  VaultDM200 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM200');
  VaultElemental$Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental$Fire');
  VaultElemental$Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental$Frost');
  VaultElemental$Shock = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental$Shock');
  VaultGhoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultGhoul');
  VaultGolem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultGolem');
  VaultShaman = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultShaman');
  VaultSkeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultSkeleton');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  CorpseDust$DustWraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust$DustWraith');
  WandOfLivingEarth$EarthGuardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$EarthGuardian');
  WandOfRegrowth$Dewcatcher = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Dewcatcher');
  WandOfRegrowth$Lotus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus');
  WandOfRegrowth$Seedpod = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Seedpod');
  WandOfWarding$Ward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward');
  WandOfWarding$Ward$WardSentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward$WardSentry');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  SentryRoom$Sentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SentryRoom$Sentry');
  AlarmTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.AlarmTrap');
  BlazingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BlazingTrap');
  BurningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BurningTrap');
  ChillingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ChillingTrap');
  ConfusionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ConfusionTrap');
  CorrosionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.CorrosionTrap');
  CursingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.CursingTrap');
  DisarmingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisarmingTrap');
  DisintegrationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap');
  DistortionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DistortionTrap');
  ExplosiveTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ExplosiveTrap');
  FlashingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlashingTrap');
  FlockTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlockTrap');
  FrostTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FrostTrap');
  GatewayTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GatewayTrap');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  GnollRockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GnollRockfallTrap');
  GrimTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap');
  GrippingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrippingTrap');
  GuardianTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap');
  GuardianTrap$Guardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap$Guardian');
  OozeTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.OozeTrap');
  PitfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap');
  PoisonDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PoisonDartTrap');
  RockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.RockfallTrap');
  ShockingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ShockingTrap');
  StormTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.StormTrap');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
  TeleportationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TeleportationTrap');
  TenguDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TenguDartTrap');
  ToxicTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ToxicTrap');
  WarpingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WarpingTrap');
  WeakeningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WeakeningTrap');
  WornDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WornDartTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BlandfruitBush = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.BlandfruitBush');
  Blindweed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed');
  Earthroot = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot');
  Fadeleaf = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf');
  Firebloom = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom');
  Icecap = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap');
  Mageroyal = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal');
  Rotberry = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry');
  Sorrowmoss = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss');
  Starflower = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower');
  Stormvine = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine');
  Sungrass = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass');
  Swiftthistle = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle');
});
