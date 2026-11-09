// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Generator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, HashMap, JEnum, JObject, JString, LinkedHashMap } from '../../../../../jre/index.ts';

let Dungeon, ArcaneResin, Gold, LiquidMetal, Waterskin, Armor, ClericArmor, ClothArmor, DuelistArmor, HuntressArmor, LeatherArmor, MageArmor, MailArmor, PlateArmor, RogueArmor, ScaleArmor, WarriorArmor, AlchemistsToolkit, Artifact, ChaliceOfBlood, CloakOfShadows, DriedRose, EtherealChains, HolyTome, HornOfPlenty, MasterThievesArmband, SandalsOfNature, SkeletonKey, TalismanOfForesight, TimekeepersHourglass, UnstableSpellbook, Bomb, Food, MysteryMeat, Pasty, Potion, PotionOfExperience, PotionOfFrost, PotionOfHaste, PotionOfHealing, PotionOfInvisibility, PotionOfLevitation, PotionOfLiquidFlame, PotionOfMindVision, PotionOfParalyticGas, PotionOfPurity, PotionOfStrength, PotionOfToxicGas, Brew, Elixir, ExoticPotion, Pickaxe, Ring, RingOfAccuracy, RingOfArcana, RingOfElements, RingOfEnergy, RingOfEvasion, RingOfForce, RingOfFuror, RingOfHaste, RingOfMight, RingOfSharpshooting, RingOfTenacity, RingOfWealth, Scroll, ScrollOfIdentify, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfMirrorImage, ScrollOfRage, ScrollOfRecharging, ScrollOfRemoveCurse, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfTerror, ScrollOfTransmutation, ScrollOfUpgrade, ExoticScroll, Spell, Runestone, StoneOfAggression, StoneOfAugmentation, StoneOfBlast, StoneOfBlink, StoneOfClairvoyance, StoneOfDeepSleep, StoneOfDetectMagic, StoneOfEnchantment, StoneOfFear, StoneOfFlock, StoneOfIntuition, StoneOfShock, ChaoticCenser, CrackedSpyglass, DimensionalSundial, ExoticCrystals, EyeOfNewt, FerretTuft, MimicTooth, MossyClump, ParchmentScrap, PetrifiedSeed, RatSkull, SaltCube, ShardOfOblivion, ThirteenLeafClover, TrapMechanism, Trinket, TrinketCatalyst, VialOfBlood, WondrousResin, Wand, WandOfBlastWave, WandOfCorrosion, WandOfCorruption, WandOfDisintegration, WandOfFireblast, WandOfFrost, WandOfLightning, WandOfLivingEarth, WandOfMagicMissile, WandOfPrismaticLight, WandOfRegrowth, WandOfTransfusion, WandOfWarding, AssassinsBlade, BattleAxe, Crossbow, Cudgel, Dagger, Dirk, Flail, Gauntlet, Glaive, Gloves, Greataxe, Greatshield, Greatsword, HandAxe, Katana, Longsword, Mace, MagesStaff, MeleeWeapon, Quarterstaff, Rapier, RoundShield, RunicBlade, Sai, Scimitar, Shortsword, Sickle, Spear, Sword, WarHammer, WarScythe, Whip, WornShortsword, Bolas, FishingSpear, ForceCube, HeavyBoomerang, Javelin, Kunai, MissileWeapon, Shuriken, ThrowingClub, ThrowingHammer, ThrowingKnife, ThrowingSpear, ThrowingSpike, ThrowingStone, Tomahawk, Trident, Dart, Blindweed$Seed, Earthroot$Seed, Fadeleaf$Seed, Firebloom$Seed, Icecap$Seed, Mageroyal$Seed, Plant$Seed, Rotberry$Seed, Sorrowmoss$Seed, Starflower$Seed, Stormvine$Seed, Sungrass$Seed, Swiftthistle$Seed, GameMath, Random, Reflection;

export class Generator extends JObject {
  static floorSetTierProbs: number[][] = null;
  static usingFirstDeck: boolean = false;
  static defaultCatProbs: HashMap<Generator$Category, number> = null;
  static categoryProbs: HashMap<Generator$Category, number> = null;
  static wepTiers: Generator$Category[] = null;
  static misTiers: Generator$Category[] = null;
  static readonly FIRST_DECK: string = 'first_deck';
  static readonly GENERAL_PROBS: string = 'general_probs';
  static readonly CATEGORY_PROBS: string = '_probs';
  static readonly CATEGORY_USING_PROBS2: string = '_using_probs2';
  static readonly CATEGORY_SEED: string = '_seed';
  static readonly CATEGORY_DROPPED: string = '_dropped';
  _Generator(): this {
    return this;
  }
  static fullReset(): void {
    Generator.usingFirstDeck = Random.Int$int(2) === 0;
    Generator.generalReset();
    for (let cat of Generator$Category.values()) {
      cat.using2ndProbs = cat.defaultProbs2 != null && Random.Int$int(2) === 0;
      Generator.reset(cat);
      if (cat.defaultProbs != null) {
        cat.seed_ = Random.Long$();
        cat.dropped_ = 0;
      }
    }
  }
  static generalReset(): void {
    for (let cat of Generator$Category.values()) {
      $J.boxF(Generator.categoryProbs.put(cat, $J.boxF(Generator.usingFirstDeck ? cat.firstProb : cat.secondProb)));
      $J.boxF(Generator.defaultCatProbs.put(cat, $J.boxF(Math.fround(cat.firstProb + cat.secondProb))));
    }
  }
  static reset(cat: Generator$Category): void {
    if (cat.defaultProbs != null) {
      if (cat.defaultProbs2 != null) {
        cat.using2ndProbs = !cat.using2ndProbs;
        cat.probs = cat.using2ndProbs ? cat.defaultProbs2.slice() : cat.defaultProbs.slice();
      } else {
        cat.probs = cat.defaultProbs.slice();
      }
    }
  }
  static undoDrop$Item(item: Item): void {
    Generator.undoDrop$Class(item.getClass());
  }
  static undoDrop$Class(cls: JClass): void {
    for (let cat of Generator$Category.values()) {
      if (cls.isAssignableFrom(cat.superClass)) {
        if (cat.defaultProbs == null) {
          continue;
        }
        for (let i = 0; i < cat.classes.length; i++) {
          if (cls === cat.classes[i]) {
            cat.probs[i]++;
          }
        }
      }
    }
  }
  static random$(): Item {
    let cat = Random.chances$HashMap(Generator.categoryProbs);
    if (cat == null) {
      Generator.usingFirstDeck = !Generator.usingFirstDeck;
      Generator.generalReset();
      cat = Random.chances$HashMap(Generator.categoryProbs);
    }
    $J.boxF(Generator.categoryProbs.put(cat, $J.boxF(Math.fround(+$J.boxF(Generator.categoryProbs.get(cat)) - 1))));
    if (cat === Generator$Category.SEED) {
      return Generator.randomUsingDefaults$Category(cat);
    } else {
      return Generator.random$Category(cat);
    }
  }
  static randomUsingDefaults$(): Item {
    return Generator.randomUsingDefaults$Category(Random.chances$HashMap(Generator.defaultCatProbs));
  }
  static random$Category(cat: Generator$Category): Item {
    {
      let item: Item, i: number, itemCls: JClass<any>;
      switch (cat) {
        case Generator$Category.ARMOR:
          return Generator.randomArmor$();
        case Generator$Category.WEAPON:
          return Generator.randomWeapon$();
        case Generator$Category.MISSILE:
          return Generator.randomMissile$();
        case Generator$Category.ARTIFACT:
          item = Generator.randomArtifact();
          return item != null ? item : Generator.randomUsingDefaults$Category(Generator$Category.RING);
        default:
          if (cat.defaultProbs != null && cat.seed_ != null) {
            Random.pushGenerator$long(cat.seed_);
            for (let i = 0; i < cat.dropped_; i++) {
              Random.Long$();
            }
          }
          i = Random.chances$floatArr(cat.probs);
          if (i === -1) {
            Generator.reset(cat);
            i = Random.chances$floatArr(cat.probs);
          }
          if (cat.defaultProbs != null) {
            cat.probs[i]--;
          }
          itemCls = cat.classes[i];
          if (cat.defaultProbs != null && cat.seed_ != null) {
            Random.popGenerator();
            cat.dropped_++;
          }
          if (ExoticPotion.regToExo.containsKey(itemCls)) {
            if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
              itemCls = ExoticPotion.regToExo.get(itemCls);
            }
          } else if (ExoticScroll.regToExo.containsKey(itemCls)) {
            if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
              itemCls = ExoticScroll.regToExo.get(itemCls);
            }
          }
          return (Reflection.newInstance(itemCls)).random();
      }
    }
  }
  static randomUsingDefaults$Category(cat: Generator$Category): Item {
    if (cat === Generator$Category.WEAPON) {
      return Generator.randomWeapon$boolean(true);
    } else if (cat === Generator$Category.MISSILE) {
      return Generator.randomMissile$boolean(true);
    } else if (cat.defaultProbs == null || cat === Generator$Category.ARTIFACT) {
      return Generator.random$Category(cat);
    } else if (cat.defaultProbsTotal != null) {
      return (Reflection.newInstance(cat.classes[Random.chances$floatArr(cat.defaultProbsTotal)])).random();
    } else {
      let itemCls = cat.classes[Random.chances$floatArr(cat.defaultProbs)];
      if (ExoticPotion.regToExo.containsKey(itemCls)) {
        if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
          itemCls = ExoticPotion.regToExo.get(itemCls);
        }
      } else if (ExoticScroll.regToExo.containsKey(itemCls)) {
        if (Random.Float$() < ExoticCrystals.consumableExoticChance$()) {
          itemCls = ExoticScroll.regToExo.get(itemCls);
        }
      }
      return (Reflection.newInstance(itemCls)).random();
    }
  }
  static random$Class(cl: JClass<Item>): Item {
    return Reflection.newInstance(cl).random();
  }
  static randomArmor$(): Armor {
    return Generator.randomArmor$int($J.idiv(Dungeon.depth, 5));
  }
  static randomArmor$int(floorSet: number): Armor {
    floorSet = $J.d2i(GameMath.gate(0, Math.fround(floorSet), Math.fround((Generator.floorSetTierProbs.length - 1) | 0)));
    let a = Reflection.newInstance(Generator$Category.ARMOR.classes[Random.chances$floatArr(Generator.floorSetTierProbs[floorSet])]);
    a.random();
    return a;
  }
  static randomWeapon$(): MeleeWeapon {
    return Generator.randomWeapon$int($J.idiv(Dungeon.depth, 5));
  }
  static randomWeapon$int(floorSet: number): MeleeWeapon {
    return Generator.randomWeapon$int$boolean(floorSet, false);
  }
  static randomWeapon$boolean(useDefaults: boolean): MeleeWeapon {
    return Generator.randomWeapon$int$boolean($J.idiv(Dungeon.depth, 5), useDefaults);
  }
  static randomWeapon$int$boolean(floorSet: number, useDefaults: boolean): MeleeWeapon {
    floorSet = $J.d2i(GameMath.gate(0, Math.fround(floorSet), Math.fround((Generator.floorSetTierProbs.length - 1) | 0)));
    let w: MeleeWeapon;
    if (useDefaults) {
      w = Generator.randomUsingDefaults$Category(Generator.wepTiers[Random.chances$floatArr(Generator.floorSetTierProbs[floorSet])]);
    } else {
      w = Generator.random$Category(Generator.wepTiers[Random.chances$floatArr(Generator.floorSetTierProbs[floorSet])]);
    }
    return w;
  }
  static randomMissile$(): MissileWeapon {
    return Generator.randomMissile$int($J.idiv(Dungeon.depth, 5));
  }
  static randomMissile$int(floorSet: number): MissileWeapon {
    return Generator.randomMissile$int$boolean(floorSet, false);
  }
  static randomMissile$boolean(useDefaults: boolean): MissileWeapon {
    return Generator.randomMissile$int$boolean($J.idiv(Dungeon.depth, 5), useDefaults);
  }
  static randomMissile$int$boolean(floorSet: number, useDefaults: boolean): MissileWeapon {
    floorSet = $J.d2i(GameMath.gate(0, Math.fround(floorSet), Math.fround((Generator.floorSetTierProbs.length - 1) | 0)));
    let w: MissileWeapon;
    if (useDefaults) {
      w = Generator.randomUsingDefaults$Category(Generator.misTiers[Random.chances$floatArr(Generator.floorSetTierProbs[floorSet])]);
    } else {
      w = Generator.random$Category(Generator.misTiers[Random.chances$floatArr(Generator.floorSetTierProbs[floorSet])]);
    }
    return w;
  }
  static randomArtifact(): Artifact {
    let cat = Generator$Category.ARTIFACT;
    if (cat.defaultProbs != null && cat.seed_ != null) {
      Random.pushGenerator$long(cat.seed_);
      for (let i = 0; i < cat.dropped_; i++) {
        Random.Long$();
      }
    }
    let i = Random.chances$floatArr(cat.probs);
    if (cat.defaultProbs != null && cat.seed_ != null) {
      Random.popGenerator();
      cat.dropped_++;
    }
    if (i === -1) {
      return null;
    }
    cat.probs[i]--;
    return Reflection.newInstance(cat.classes[i]).random();
  }
  static removeArtifact(artifact: JClass<Artifact>): boolean {
    let cat = Generator$Category.ARTIFACT;
    for (let i = 0; i < cat.classes.length; i++) {
      if ($J.equals(cat.classes[i], artifact) && cat.probs[i] > Math.fround(0)) {
        cat.probs[i] = 0;
        return true;
      }
    }
    return false;
  }
  static storeInBundle(bundle: Bundle): void {
    bundle.put$String$boolean(Generator.FIRST_DECK, Generator.usingFirstDeck);
    let genProbs = $J.toArrayInto(Generator.categoryProbs.values().toArray(), $J.newArray(0, null));
    let storeProbs = $J.newArray(genProbs.length, 0);
    for (let i = 0; i < storeProbs.length; i++) {
      storeProbs[i] = +genProbs[i];
    }
    bundle.put$String$floatArr(Generator.GENERAL_PROBS, storeProbs);
    for (let cat of Generator$Category.values()) {
      if (cat.defaultProbs == null) {
        continue;
      }
      bundle.put$String$floatArr(cat.name().toLowerCase() + Generator.CATEGORY_PROBS, cat.probs);
      if (cat.defaultProbs2 != null) {
        bundle.put$String$boolean(cat.name().toLowerCase() + Generator.CATEGORY_USING_PROBS2, cat.using2ndProbs);
      }
      if (cat.seed_ != null) {
        bundle.put$String$long(cat.name().toLowerCase() + Generator.CATEGORY_SEED, cat.seed_);
        bundle.put$String$int(cat.name().toLowerCase() + Generator.CATEGORY_DROPPED, cat.dropped_);
      }
    }
  }
  static restoreFromBundle(bundle: Bundle): void {
    Generator.fullReset();
    Generator.usingFirstDeck = bundle.getBoolean(Generator.FIRST_DECK);
    if (bundle.contains(Generator.GENERAL_PROBS)) {
      let probs = bundle.getFloatArray(Generator.GENERAL_PROBS);
      if (probs.length === Generator$Category.values().length) {
        for (let i = 0; i < probs.length; i++) {
          $J.boxF(Generator.categoryProbs.put(Generator$Category.values()[i], $J.boxF(probs[i])));
        }
      }
    }
    for (let cat of Generator$Category.values()) {
      if (bundle.contains(cat.name().toLowerCase() + Generator.CATEGORY_PROBS)) {
        let probs = bundle.getFloatArray(cat.name().toLowerCase() + Generator.CATEGORY_PROBS);
        if (cat.defaultProbs != null && probs.length === cat.defaultProbs.length) {
          cat.probs = probs;
        }
        if (bundle.contains(cat.name().toLowerCase() + Generator.CATEGORY_USING_PROBS2)) {
          cat.using2ndProbs = bundle.getBoolean(cat.name().toLowerCase() + Generator.CATEGORY_USING_PROBS2);
        } else {
          cat.using2ndProbs = false;
        }
        if (bundle.contains(cat.name().toLowerCase() + Generator.CATEGORY_SEED)) {
          cat.seed_ = bundle.getLong(cat.name().toLowerCase() + Generator.CATEGORY_SEED);
          cat.dropped_ = bundle.getInt(cat.name().toLowerCase() + Generator.CATEGORY_DROPPED);
        }
        if (cat === Generator$Category.ARTIFACT && probs.length !== cat.defaultProbs.length) {
          let keyIDX = 9;
          let j = 0;
          for (let i = 0; i < probs.length; i++) {
            if (j === keyIDX) {
              cat.probs[j] = 1;
              j++;
            }
            cat.probs[j] = probs[i];
            j++;
          }
        }
      }
    }
  }
  static $clinit() {
    Generator.floorSetTierProbs = [[0, 75, 20, 4, 1], [0, 25, 50, 20, 5], [0, 0, 40, 50, 10], [0, 0, 20, 40, 40], [0, 0, 0, 20, 80]];
    Generator.usingFirstDeck = false;
    Generator.defaultCatProbs = new LinkedHashMap();
    Generator.categoryProbs = new LinkedHashMap();
    Generator.wepTiers = [Generator$Category.WEP_T1, Generator$Category.WEP_T2, Generator$Category.WEP_T3, Generator$Category.WEP_T4, Generator$Category.WEP_T5];
    Generator.misTiers = [Generator$Category.MIS_T1, Generator$Category.MIS_T2, Generator$Category.MIS_T3, Generator$Category.MIS_T4, Generator$Category.MIS_T5];
  }
}

export class Generator$Category extends JEnum {
  classes: JClass<any>[] = null;
  probs: number[] = null;
  defaultProbs: number[] = null;
  defaultProbs2: number[] = null;
  using2ndProbs: boolean = false;
  defaultProbsTotal: number[] = null;
  seed_: bigint = null;
  dropped_: number = 0;
  firstProb: number = 0;
  secondProb: number = 0;
  superClass: JClass<Item> = null;
  static subOrderings: HashMap<JClass, ArrayList<JClass>> = null;
  static TRINKET: Generator$Category = null;
  static WEAPON: Generator$Category = null;
  static WEP_T1: Generator$Category = null;
  static WEP_T2: Generator$Category = null;
  static WEP_T3: Generator$Category = null;
  static WEP_T4: Generator$Category = null;
  static WEP_T5: Generator$Category = null;
  static ARMOR: Generator$Category = null;
  static MISSILE: Generator$Category = null;
  static MIS_T1: Generator$Category = null;
  static MIS_T2: Generator$Category = null;
  static MIS_T3: Generator$Category = null;
  static MIS_T4: Generator$Category = null;
  static MIS_T5: Generator$Category = null;
  static WAND: Generator$Category = null;
  static RING: Generator$Category = null;
  static ARTIFACT: Generator$Category = null;
  static FOOD: Generator$Category = null;
  static POTION: Generator$Category = null;
  static SEED: Generator$Category = null;
  static SCROLL: Generator$Category = null;
  static STONE: Generator$Category = null;
  static GOLD: Generator$Category = null;
  static $VALUES: Generator$Category[] = null;
  _Generator$Category($name: string, $ordinal: number, firstProb: number, secondProb: number, superClass: JClass<Item>): this {
    this._JEnum($name, $ordinal);
    this.defaultProbs = null;
    this.defaultProbs2 = null;
    this.using2ndProbs = false;
    this.defaultProbsTotal = null;
    this.seed_ = null;
    this.dropped_ = 0;
    this.firstProb = firstProb;
    this.secondProb = secondProb;
    this.superClass = superClass;
    return this;
  }
  static order(item: Item): number {
    let catResult = -1;
    let subResult = 0;
    for (let i = 0; i < Generator$Category.values().length; i++) {
      let subOrdering = Generator$Category.subOrderings.get(Generator$Category.values()[i].superClass);
      if (subOrdering != null) {
        for (let j = 0; j < subOrdering.size(); j++) {
          if (subOrdering.get(j).isInstance(item)) {
            catResult = i;
            subResult = j;
          }
        }
      } else {
        if (Generator$Category.values()[i].superClass.isInstance(item)) {
          catResult = i;
          subResult = 0;
        }
      }
    }
    if (catResult !== -1) {
      return (Math.imul(catResult, 100) + subResult) | 0;
    }
    return (32767 + item.image()) | 0;
  }
  static values(): Generator$Category[] { return Generator$Category.$VALUES.slice(); }
  static valueOf(name: string): Generator$Category { return $J.enumValueOf(Generator$Category, name); }
  static $clinit() {
    Generator$Category.TRINKET = new Generator$Category()._Generator$Category('TRINKET', 0, 0, 0, $J.cls(Trinket));
    Generator$Category.WEAPON = new Generator$Category()._Generator$Category('WEAPON', 1, 2, 2, $J.cls(MeleeWeapon));
    Generator$Category.WEP_T1 = new Generator$Category()._Generator$Category('WEP_T1', 2, 0, 0, $J.cls(MeleeWeapon));
    Generator$Category.WEP_T2 = new Generator$Category()._Generator$Category('WEP_T2', 3, 0, 0, $J.cls(MeleeWeapon));
    Generator$Category.WEP_T3 = new Generator$Category()._Generator$Category('WEP_T3', 4, 0, 0, $J.cls(MeleeWeapon));
    Generator$Category.WEP_T4 = new Generator$Category()._Generator$Category('WEP_T4', 5, 0, 0, $J.cls(MeleeWeapon));
    Generator$Category.WEP_T5 = new Generator$Category()._Generator$Category('WEP_T5', 6, 0, 0, $J.cls(MeleeWeapon));
    Generator$Category.ARMOR = new Generator$Category()._Generator$Category('ARMOR', 7, 2, 1, $J.cls(Armor));
    Generator$Category.MISSILE = new Generator$Category()._Generator$Category('MISSILE', 8, 1, 2, $J.cls(MissileWeapon));
    Generator$Category.MIS_T1 = new Generator$Category()._Generator$Category('MIS_T1', 9, 0, 0, $J.cls(MissileWeapon));
    Generator$Category.MIS_T2 = new Generator$Category()._Generator$Category('MIS_T2', 10, 0, 0, $J.cls(MissileWeapon));
    Generator$Category.MIS_T3 = new Generator$Category()._Generator$Category('MIS_T3', 11, 0, 0, $J.cls(MissileWeapon));
    Generator$Category.MIS_T4 = new Generator$Category()._Generator$Category('MIS_T4', 12, 0, 0, $J.cls(MissileWeapon));
    Generator$Category.MIS_T5 = new Generator$Category()._Generator$Category('MIS_T5', 13, 0, 0, $J.cls(MissileWeapon));
    Generator$Category.WAND = new Generator$Category()._Generator$Category('WAND', 14, 1, 1, $J.cls(Wand));
    Generator$Category.RING = new Generator$Category()._Generator$Category('RING', 15, 1, 0, $J.cls(Ring));
    Generator$Category.ARTIFACT = new Generator$Category()._Generator$Category('ARTIFACT', 16, 0, 1, $J.cls(Artifact));
    Generator$Category.FOOD = new Generator$Category()._Generator$Category('FOOD', 17, 0, 0, $J.cls(Food));
    Generator$Category.POTION = new Generator$Category()._Generator$Category('POTION', 18, 8, 8, $J.cls(Potion));
    Generator$Category.SEED = new Generator$Category()._Generator$Category('SEED', 19, 1, 1, $J.cls(Plant$Seed));
    Generator$Category.SCROLL = new Generator$Category()._Generator$Category('SCROLL', 20, 8, 8, $J.cls(Scroll));
    Generator$Category.STONE = new Generator$Category()._Generator$Category('STONE', 21, 1, 1, $J.cls(Runestone));
    Generator$Category.GOLD = new Generator$Category()._Generator$Category('GOLD', 22, 10, 10, $J.cls(Gold));
    Generator$Category.$VALUES = [Generator$Category.TRINKET, Generator$Category.WEAPON, Generator$Category.WEP_T1, Generator$Category.WEP_T2, Generator$Category.WEP_T3, Generator$Category.WEP_T4, Generator$Category.WEP_T5, Generator$Category.ARMOR, Generator$Category.MISSILE, Generator$Category.MIS_T1, Generator$Category.MIS_T2, Generator$Category.MIS_T3, Generator$Category.MIS_T4, Generator$Category.MIS_T5, Generator$Category.WAND, Generator$Category.RING, Generator$Category.ARTIFACT, Generator$Category.FOOD, Generator$Category.POTION, Generator$Category.SEED, Generator$Category.SCROLL, Generator$Category.STONE, Generator$Category.GOLD];
    Generator$Category.subOrderings = new HashMap();
    Generator$Category.subOrderings.put($J.cls(Trinket), new ArrayList(Arrays.asList($J.cls(Trinket), $J.cls(TrinketCatalyst))));
    Generator$Category.subOrderings.put($J.cls(MissileWeapon), new ArrayList(Arrays.asList($J.cls(MissileWeapon), $J.cls(Bomb))));
    Generator$Category.subOrderings.put($J.cls(Potion), new ArrayList(Arrays.asList($J.cls(Waterskin), $J.cls(Potion), $J.cls(ExoticPotion), $J.cls(Brew), $J.cls(Elixir), $J.cls(LiquidMetal))));
    Generator$Category.subOrderings.put($J.cls(Scroll), new ArrayList(Arrays.asList($J.cls(Scroll), $J.cls(ExoticScroll), $J.cls(Spell), $J.cls(ArcaneResin))));
    Generator$Category.GOLD.classes = [$J.cls(Gold)];
    Generator$Category.GOLD.probs = [1];
    Generator$Category.POTION.classes = [$J.cls(PotionOfStrength), $J.cls(PotionOfHealing), $J.cls(PotionOfMindVision), $J.cls(PotionOfFrost), $J.cls(PotionOfLiquidFlame), $J.cls(PotionOfToxicGas), $J.cls(PotionOfHaste), $J.cls(PotionOfInvisibility), $J.cls(PotionOfLevitation), $J.cls(PotionOfParalyticGas), $J.cls(PotionOfPurity), $J.cls(PotionOfExperience)];
    Generator$Category.POTION.defaultProbs = [0, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1];
    Generator$Category.POTION.defaultProbs2 = [0, 3, 2, 2, 1, 2, 1, 1, 1, 1, 1, 0];
    Generator$Category.POTION.probs = Generator$Category.POTION.defaultProbs.slice();
    Generator$Category.SEED.classes = [$J.cls(Rotberry$Seed), $J.cls(Sungrass$Seed), $J.cls(Fadeleaf$Seed), $J.cls(Icecap$Seed), $J.cls(Firebloom$Seed), $J.cls(Sorrowmoss$Seed), $J.cls(Swiftthistle$Seed), $J.cls(Blindweed$Seed), $J.cls(Stormvine$Seed), $J.cls(Earthroot$Seed), $J.cls(Mageroyal$Seed), $J.cls(Starflower$Seed)];
    Generator$Category.SEED.defaultProbs = [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1];
    Generator$Category.SEED.probs = Generator$Category.SEED.defaultProbs.slice();
    Generator$Category.SCROLL.classes = [$J.cls(ScrollOfUpgrade), $J.cls(ScrollOfIdentify), $J.cls(ScrollOfRemoveCurse), $J.cls(ScrollOfMirrorImage), $J.cls(ScrollOfRecharging), $J.cls(ScrollOfTeleportation), $J.cls(ScrollOfLullaby), $J.cls(ScrollOfMagicMapping), $J.cls(ScrollOfRage), $J.cls(ScrollOfRetribution), $J.cls(ScrollOfTerror), $J.cls(ScrollOfTransmutation)];
    Generator$Category.SCROLL.defaultProbs = [0, 3, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1];
    Generator$Category.SCROLL.defaultProbs2 = [0, 3, 2, 2, 1, 2, 1, 1, 1, 1, 1, 0];
    Generator$Category.SCROLL.probs = Generator$Category.SCROLL.defaultProbs.slice();
    Generator$Category.STONE.classes = [$J.cls(StoneOfEnchantment), $J.cls(StoneOfIntuition), $J.cls(StoneOfDetectMagic), $J.cls(StoneOfFlock), $J.cls(StoneOfShock), $J.cls(StoneOfBlink), $J.cls(StoneOfDeepSleep), $J.cls(StoneOfClairvoyance), $J.cls(StoneOfAggression), $J.cls(StoneOfBlast), $J.cls(StoneOfFear), $J.cls(StoneOfAugmentation)];
    Generator$Category.STONE.defaultProbs = [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0];
    Generator$Category.STONE.probs = Generator$Category.STONE.defaultProbs.slice();
    Generator$Category.WAND.classes = [$J.cls(WandOfMagicMissile), $J.cls(WandOfLightning), $J.cls(WandOfDisintegration), $J.cls(WandOfFireblast), $J.cls(WandOfCorrosion), $J.cls(WandOfBlastWave), $J.cls(WandOfLivingEarth), $J.cls(WandOfFrost), $J.cls(WandOfPrismaticLight), $J.cls(WandOfWarding), $J.cls(WandOfTransfusion), $J.cls(WandOfCorruption), $J.cls(WandOfRegrowth)];
    Generator$Category.WAND.defaultProbs = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    Generator$Category.WAND.probs = Generator$Category.WAND.defaultProbs.slice();
    Generator$Category.WEAPON.classes = [];
    Generator$Category.WEAPON.probs = [];
    Generator$Category.WEP_T1.classes = [$J.cls(WornShortsword), $J.cls(MagesStaff), $J.cls(Dagger), $J.cls(Gloves), $J.cls(Rapier), $J.cls(Cudgel)];
    Generator$Category.WEP_T1.defaultProbs = [2, 0, 2, 2, 2, 2];
    Generator$Category.WEP_T1.probs = Generator$Category.WEP_T1.defaultProbs.slice();
    Generator$Category.WEP_T2.classes = [$J.cls(Shortsword), $J.cls(HandAxe), $J.cls(Spear), $J.cls(Quarterstaff), $J.cls(Dirk), $J.cls(Sickle), $J.cls(Pickaxe)];
    Generator$Category.WEP_T2.defaultProbs = [2, 2, 2, 2, 2, 2, 0];
    Generator$Category.WEP_T2.probs = Generator$Category.WEP_T2.defaultProbs.slice();
    Generator$Category.WEP_T3.classes = [$J.cls(Sword), $J.cls(Mace), $J.cls(Scimitar), $J.cls(RoundShield), $J.cls(Sai), $J.cls(Whip)];
    Generator$Category.WEP_T3.defaultProbs = [2, 2, 2, 2, 2, 2];
    Generator$Category.WEP_T3.probs = Generator$Category.WEP_T3.defaultProbs.slice();
    Generator$Category.WEP_T4.classes = [$J.cls(Longsword), $J.cls(BattleAxe), $J.cls(Flail), $J.cls(RunicBlade), $J.cls(AssassinsBlade), $J.cls(Crossbow), $J.cls(Katana)];
    Generator$Category.WEP_T4.defaultProbs = [2, 2, 2, 2, 2, 2, 2];
    Generator$Category.WEP_T4.probs = Generator$Category.WEP_T4.defaultProbs.slice();
    Generator$Category.WEP_T5.classes = [$J.cls(Greatsword), $J.cls(WarHammer), $J.cls(Glaive), $J.cls(Greataxe), $J.cls(Greatshield), $J.cls(Gauntlet), $J.cls(WarScythe)];
    Generator$Category.WEP_T5.defaultProbs = [2, 2, 2, 2, 2, 2, 2];
    Generator$Category.WEP_T5.probs = Generator$Category.WEP_T5.defaultProbs.slice();
    Generator$Category.ARMOR.classes = [$J.cls(ClothArmor), $J.cls(LeatherArmor), $J.cls(MailArmor), $J.cls(ScaleArmor), $J.cls(PlateArmor), $J.cls(WarriorArmor), $J.cls(MageArmor), $J.cls(RogueArmor), $J.cls(HuntressArmor), $J.cls(DuelistArmor), $J.cls(ClericArmor)];
    Generator$Category.ARMOR.probs = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
    Generator$Category.MISSILE.classes = [];
    Generator$Category.MISSILE.probs = [];
    Generator$Category.MIS_T1.classes = [$J.cls(ThrowingStone), $J.cls(ThrowingKnife), $J.cls(ThrowingSpike), $J.cls(Dart)];
    Generator$Category.MIS_T1.defaultProbs = [3, 3, 3, 0];
    Generator$Category.MIS_T1.probs = Generator$Category.MIS_T1.defaultProbs.slice();
    Generator$Category.MIS_T2.classes = [$J.cls(FishingSpear), $J.cls(ThrowingClub), $J.cls(Shuriken)];
    Generator$Category.MIS_T2.defaultProbs = [3, 3, 3];
    Generator$Category.MIS_T2.probs = Generator$Category.MIS_T2.defaultProbs.slice();
    Generator$Category.MIS_T3.classes = [$J.cls(ThrowingSpear), $J.cls(Kunai), $J.cls(Bolas)];
    Generator$Category.MIS_T3.defaultProbs = [3, 3, 3];
    Generator$Category.MIS_T3.probs = Generator$Category.MIS_T3.defaultProbs.slice();
    Generator$Category.MIS_T4.classes = [$J.cls(Javelin), $J.cls(Tomahawk), $J.cls(HeavyBoomerang)];
    Generator$Category.MIS_T4.defaultProbs = [3, 3, 3];
    Generator$Category.MIS_T4.probs = Generator$Category.MIS_T4.defaultProbs.slice();
    Generator$Category.MIS_T5.classes = [$J.cls(Trident), $J.cls(ThrowingHammer), $J.cls(ForceCube)];
    Generator$Category.MIS_T5.defaultProbs = [3, 3, 3];
    Generator$Category.MIS_T5.probs = Generator$Category.MIS_T5.defaultProbs.slice();
    Generator$Category.FOOD.classes = [$J.cls(Food), $J.cls(Pasty), $J.cls(MysteryMeat)];
    Generator$Category.FOOD.defaultProbs = [4, 1, 0];
    Generator$Category.FOOD.probs = Generator$Category.FOOD.defaultProbs.slice();
    Generator$Category.RING.classes = [$J.cls(RingOfAccuracy), $J.cls(RingOfArcana), $J.cls(RingOfElements), $J.cls(RingOfEnergy), $J.cls(RingOfEvasion), $J.cls(RingOfForce), $J.cls(RingOfFuror), $J.cls(RingOfHaste), $J.cls(RingOfMight), $J.cls(RingOfSharpshooting), $J.cls(RingOfTenacity), $J.cls(RingOfWealth)];
    Generator$Category.RING.defaultProbs = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    Generator$Category.RING.probs = Generator$Category.RING.defaultProbs.slice();
    Generator$Category.ARTIFACT.classes = [$J.cls(AlchemistsToolkit), $J.cls(ChaliceOfBlood), $J.cls(CloakOfShadows), $J.cls(DriedRose), $J.cls(EtherealChains), $J.cls(HolyTome), $J.cls(HornOfPlenty), $J.cls(MasterThievesArmband), $J.cls(SandalsOfNature), $J.cls(SkeletonKey), $J.cls(TalismanOfForesight), $J.cls(TimekeepersHourglass), $J.cls(UnstableSpellbook)];
    Generator$Category.ARTIFACT.defaultProbs = [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1];
    Generator$Category.ARTIFACT.probs = Generator$Category.ARTIFACT.defaultProbs.slice();
    Generator$Category.TRINKET.classes = [$J.cls(RatSkull), $J.cls(ParchmentScrap), $J.cls(PetrifiedSeed), $J.cls(ExoticCrystals), $J.cls(MossyClump), $J.cls(DimensionalSundial), $J.cls(ThirteenLeafClover), $J.cls(TrapMechanism), $J.cls(MimicTooth), $J.cls(WondrousResin), $J.cls(EyeOfNewt), $J.cls(SaltCube), $J.cls(VialOfBlood), $J.cls(ShardOfOblivion), $J.cls(ChaoticCenser), $J.cls(FerretTuft), $J.cls(CrackedSpyglass)];
    Generator$Category.TRINKET.defaultProbs = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    Generator$Category.TRINKET.probs = Generator$Category.TRINKET.defaultProbs.slice();
    for (let cat of Generator$Category.values()) {
      if (cat.defaultProbs2 != null) {
        cat.defaultProbsTotal = $J.newArray(cat.defaultProbs.length, 0);
        for (let i = 0; i < cat.defaultProbs.length; i++) {
          cat.defaultProbsTotal[i] = Math.fround(cat.defaultProbs[i] + cat.defaultProbs2[i]);
        }
      }
    }
  }
}

$J.define(Generator, 'com.shatteredpixel.shatteredpixeldungeon.items.Generator', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Generator' }, meths: { 'randomMissile(int,boolean)': 'randomMissile$int$boolean', 'randomMissile(boolean)': 'randomMissile$boolean', 'randomMissile(int)': 'randomMissile$int', 'randomMissile()': 'randomMissile$', 'randomWeapon(int,boolean)': 'randomWeapon$int$boolean', 'randomWeapon(boolean)': 'randomWeapon$boolean', 'randomWeapon(int)': 'randomWeapon$int', 'randomWeapon()': 'randomWeapon$', 'randomArmor(int)': 'randomArmor$int', 'randomArmor()': 'randomArmor$', 'random(java.lang.Class)': 'random$Class', 'randomUsingDefaults(com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category)': 'randomUsingDefaults$Category', 'random(com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category)': 'random$Category', 'randomUsingDefaults()': 'randomUsingDefaults$', 'random()': 'random$', 'undoDrop(java.lang.Class)': 'undoDrop$Class', 'undoDrop(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'undoDrop$Item' }, clinit: true, lazy: ['floorSetTierProbs', 'usingFirstDeck', 'defaultCatProbs', 'categoryProbs', 'wepTiers', 'misTiers'] });
$J.define(Generator$Category, 'com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'float,float,java.lang.Class': '_Generator$Category' }, clinit: true, lazy: ['$VALUES', 'TRINKET', 'WEAPON', 'WEP_T1', 'WEP_T2', 'WEP_T3', 'WEP_T4', 'WEP_T5', 'ARMOR', 'MISSILE', 'MIS_T1', 'MIS_T2', 'MIS_T3', 'MIS_T4', 'MIS_T5', 'WAND', 'RING', 'ARTIFACT', 'FOOD', 'POTION', 'SEED', 'SCROLL', 'STONE', 'GOLD', 'subOrderings'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ArcaneResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  LiquidMetal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal');
  Waterskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Waterskin');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  ClericArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClericArmor');
  ClothArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClothArmor');
  DuelistArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.DuelistArmor');
  HuntressArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.HuntressArmor');
  LeatherArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.LeatherArmor');
  MageArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.MageArmor');
  MailArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.MailArmor');
  PlateArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.PlateArmor');
  RogueArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.RogueArmor');
  ScaleArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ScaleArmor');
  WarriorArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.WarriorArmor');
  AlchemistsToolkit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.AlchemistsToolkit');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  ChaliceOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  DriedRose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose');
  EtherealChains = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  HornOfPlenty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty');
  MasterThievesArmband = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.MasterThievesArmband');
  SandalsOfNature = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SandalsOfNature');
  SkeletonKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey');
  TalismanOfForesight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight');
  TimekeepersHourglass = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass');
  UnstableSpellbook = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Food = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Food');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  Pasty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHaste');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  PotionOfMindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfMindVision');
  PotionOfParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfParalyticGas');
  PotionOfPurity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity');
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  PotionOfToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfToxicGas');
  Brew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew');
  Elixir = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  RingOfAccuracy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfAccuracy');
  RingOfArcana = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfArcana');
  RingOfElements = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfElements');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  RingOfEvasion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion');
  RingOfForce = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce');
  RingOfFuror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfFuror');
  RingOfHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfHaste');
  RingOfMight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfMight');
  RingOfSharpshooting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfSharpshooting');
  RingOfTenacity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfTenacity');
  RingOfWealth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfTerror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  Spell = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  StoneOfAggression = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAggression');
  StoneOfAugmentation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation');
  StoneOfBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlast');
  StoneOfBlink = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlink');
  StoneOfClairvoyance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfClairvoyance');
  StoneOfDeepSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfDeepSleep');
  StoneOfDetectMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfDetectMagic');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  StoneOfFear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfFear');
  StoneOfFlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfFlock');
  StoneOfIntuition = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition');
  StoneOfShock = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfShock');
  ChaoticCenser = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser');
  CrackedSpyglass = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.CrackedSpyglass');
  DimensionalSundial = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.DimensionalSundial');
  ExoticCrystals = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ExoticCrystals');
  EyeOfNewt = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.EyeOfNewt');
  FerretTuft = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.FerretTuft');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  MossyClump = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MossyClump');
  ParchmentScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ParchmentScrap');
  PetrifiedSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.PetrifiedSeed');
  RatSkull = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull');
  SaltCube = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.SaltCube');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  ThirteenLeafClover = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ThirteenLeafClover');
  TrapMechanism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrapMechanism');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  VialOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.VialOfBlood');
  WondrousResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  WandOfCorrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorrosion');
  WandOfCorruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorruption');
  WandOfDisintegration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfDisintegration');
  WandOfFireblast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFireblast');
  WandOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFrost');
  WandOfLightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning');
  WandOfLivingEarth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth');
  WandOfMagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile');
  WandOfPrismaticLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfPrismaticLight');
  WandOfRegrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth');
  WandOfTransfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfTransfusion');
  WandOfWarding = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding');
  AssassinsBlade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.AssassinsBlade');
  BattleAxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.BattleAxe');
  Crossbow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow');
  Cudgel = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Cudgel');
  Dagger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Dagger');
  Dirk = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Dirk');
  Flail = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Flail');
  Gauntlet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Gauntlet');
  Glaive = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Glaive');
  Gloves = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Gloves');
  Greataxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greataxe');
  Greatshield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greatshield');
  Greatsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greatsword');
  HandAxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.HandAxe');
  Katana = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Katana');
  Longsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Longsword');
  Mace = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Mace');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  Quarterstaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Quarterstaff');
  Rapier = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Rapier');
  RoundShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RoundShield');
  RunicBlade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RunicBlade');
  Sai = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sai');
  Scimitar = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Scimitar');
  Shortsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Shortsword');
  Sickle = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle');
  Spear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Spear');
  Sword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sword');
  WarHammer = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WarHammer');
  WarScythe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WarScythe');
  Whip = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Whip');
  WornShortsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WornShortsword');
  Bolas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Bolas');
  FishingSpear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.FishingSpear');
  ForceCube = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ForceCube');
  HeavyBoomerang = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.HeavyBoomerang');
  Javelin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Javelin');
  Kunai = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Kunai');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Shuriken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Shuriken');
  ThrowingClub = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingClub');
  ThrowingHammer = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingHammer');
  ThrowingKnife = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingKnife');
  ThrowingSpear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingSpear');
  ThrowingSpike = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingSpike');
  ThrowingStone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.ThrowingStone');
  Tomahawk = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Tomahawk');
  Trident = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Trident');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  Blindweed$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed$Seed');
  Earthroot$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Seed');
  Fadeleaf$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf$Seed');
  Firebloom$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed');
  Icecap$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap$Seed');
  Mageroyal$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal$Seed');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  Sorrowmoss$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss$Seed');
  Starflower$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed');
  Stormvine$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine$Seed');
  Sungrass$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Seed');
  Swiftthistle$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$Seed');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
