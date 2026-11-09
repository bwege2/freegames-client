// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/journal/Catalog.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, LinkedHashMap } from '../../../../../jre/index.ts';

let Badges, Amulet, Ankh, ArcaneResin, BrokenSeal, Dewdrop, EnergyCrystal, Generator$Category, Gold, Honeypot, KingsCrown, LiquidMetal, Stylus, TengusMask, Torch, Waterskin, Armor$Glyph, MagicalHolster, PotionBandolier, ScrollHolder, VelvetPouch, ArcaneBomb, Bomb, Firebomb, FlashBangBomb, FrostBomb, HolyBomb, Noisemaker, RegrowthBomb, ShrapnelBomb, SmokeBomb, WoollyBomb, Berry, Blandfruit, ChargrilledMeat, Food, FrozenCarpaccio, MeatPie, MysteryMeat, Pasty, PhantomMeat, SmallRation, StewedMeat, SupplyRation, CrystalKey, GoldenKey, IronKey, WornKey, AquaBrew, BlizzardBrew, CausticBrew, InfernalBrew, ShockingBrew, UnstableBrew, ElixirOfAquaticRejuvenation, ElixirOfArcaneArmor, ElixirOfDragonsBlood, ElixirOfFeatherFall, ElixirOfHoneyedHealing, ElixirOfIcyTouch, ElixirOfMight, ElixirOfToxicEssence, ExoticPotion, CeremonialCandle, CorpseDust, DarkGold, DwarfToken, Embers, EscapeCrystal, GooBlob, ImpStatue, MetalShard, VaultBeacon, BowFragment, BrokenHilt, BrokenStaff, CloakScrap, SealShard, TornPage, ExoticScroll, Alchemize, BeaconOfReturning, CurseInfusion, MagicalInfusion, PhaseShift, ReclaimTrap, Recycle, SummonElemental, TelekineticGrab, UnstableSpell, WildEnergy, TrinketCatalyst, SpiritBow, Weapon$Enchantment, TippedDart, Journal, Messages;

export class Catalog extends JEnum {
  seen: LinkedHashMap<JClass<any>, boolean> = null;
  useCount: LinkedHashMap<JClass<any>, number> = null;
  static equipmentCatalogs: ArrayList<Catalog> = null;
  static consumableCatalogs: ArrayList<Catalog> = null;
  static readonly CATALOG_CLASSES: string = 'catalog_classes';
  static readonly CATALOG_SEEN: string = 'catalog_seen';
  static readonly CATALOG_USES: string = 'catalog_uses';
  static MELEE_WEAPONS: Catalog = null;
  static ARMOR: Catalog = null;
  static ENCHANTMENTS: Catalog = null;
  static GLYPHS: Catalog = null;
  static THROWN_WEAPONS: Catalog = null;
  static WANDS: Catalog = null;
  static RINGS: Catalog = null;
  static ARTIFACTS: Catalog = null;
  static TRINKETS: Catalog = null;
  static MISC_EQUIPMENT: Catalog = null;
  static POTIONS: Catalog = null;
  static SEEDS: Catalog = null;
  static SCROLLS: Catalog = null;
  static STONES: Catalog = null;
  static FOOD: Catalog = null;
  static EXOTIC_POTIONS: Catalog = null;
  static EXOTIC_SCROLLS: Catalog = null;
  static BOMBS: Catalog = null;
  static TIPPED_DARTS: Catalog = null;
  static BREWS_ELIXIRS: Catalog = null;
  static SPELLS: Catalog = null;
  static MISC_CONSUMABLES: Catalog = null;
  static $VALUES: Catalog[] = null;
  _Catalog($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    this.seen = new LinkedHashMap();
    this.useCount = new LinkedHashMap();
    return this;
  }
  items(): Collection<JClass<any>> {
    return this.seen.keySet();
  }
  addItems(items: JClass<any>[]): void {
    for (let item of items) {
      this.seen.put(item, false);
      this.useCount.put(item, 0);
    }
  }
  title(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.title', []);
  }
  totalItems(): number {
    return this.seen.size();
  }
  totalSeen(): number {
    let seenTotal = 0;
    for (const $it0 = this.seen.values().iterator(); $it0.hasNext(); ) {
      let itemSeen = $it0.next();
      if (itemSeen) {
        seenTotal++;
      }
    }
    return seenTotal;
  }
  static isSeen(cls: JClass<any>): boolean {
    for (let cat of Catalog.values()) {
      if (cat.seen.containsKey(cls)) {
        return cat.seen.get(cls);
      }
    }
    return false;
  }
  static setSeen(cls: JClass<any>): void {
    for (let cat of Catalog.values()) {
      if (cat.seen.containsKey(cls) && !cat.seen.get(cls)) {
        cat.seen.put(cls, true);
        Journal.saveNeeded = true;
      }
    }
    Badges.validateCatalogBadges();
  }
  static useCount(cls: JClass<any>): number {
    for (let cat of Catalog.values()) {
      if (cat.useCount.containsKey(cls)) {
        return cat.useCount.get(cls);
      }
    }
    return 0;
  }
  static countUse(cls: JClass<any>): void {
    Catalog.countUses(cls, 1);
  }
  static countUses(cls: JClass<any>, uses: number): void {
    for (let cat of Catalog.values()) {
      if (cat.useCount.containsKey(cls) && cat.useCount.get(cls) !== 2147483647) {
        cat.useCount.put(cls, (cat.useCount.get(cls) + uses) | 0);
        if (cat.useCount.get(cls) < -1000000000) {
          cat.useCount.put(cls, 2147483647);
        }
        Journal.saveNeeded = true;
      }
    }
  }
  static store(bundle: Bundle): void {
    let classes = new ArrayList();
    let seen = new ArrayList();
    let uses = new ArrayList();
    for (let cat of Catalog.values()) {
      for (const $it1 = cat.items().iterator(); $it1.hasNext(); ) {
        let item = $it1.next();
        if (cat.seen.get(item) || cat.useCount.get(item) > 0) {
          classes.add(item);
          seen.add(cat.seen.get(item));
          uses.add(cat.useCount.get(item));
        }
      }
    }
    let storeCls = $J.newArray(classes.size(), null);
    let storeSeen = $J.newArray(seen.size(), false);
    let storeUses = $J.newArray(uses.size(), 0);
    for (let i = 0; i < storeCls.length; i++) {
      storeCls[i] = classes.get(i);
      storeSeen[i] = seen.get(i);
      storeUses[i] = uses.get(i);
    }
    bundle.put$String$ClassArr(Catalog.CATALOG_CLASSES, storeCls);
    bundle.put$String$booleanArr(Catalog.CATALOG_SEEN, storeSeen);
    bundle.put$String$intArr(Catalog.CATALOG_USES, storeUses);
  }
  static restore(bundle: Bundle): void {
    if (bundle.contains(Catalog.CATALOG_CLASSES)) {
      let classes = bundle.getClassArray(Catalog.CATALOG_CLASSES);
      let seen = bundle.getBooleanArray(Catalog.CATALOG_SEEN);
      let uses = bundle.getIntArray(Catalog.CATALOG_USES);
      for (let i = 0; i < classes.length; i++) {
        for (let cat of Catalog.values()) {
          if (cat.seen.containsKey(classes[i])) {
            cat.seen.put(classes[i], seen[i]);
            cat.useCount.put(classes[i], uses[i]);
          }
        }
      }
    }
  }
  static values(): Catalog[] { return Catalog.$VALUES.slice(); }
  static valueOf(name: string): Catalog { return $J.enumValueOf(Catalog, name); }
  static $clinit() {
    Catalog.MELEE_WEAPONS = new Catalog()._Catalog('MELEE_WEAPONS', 0);
    Catalog.ARMOR = new Catalog()._Catalog('ARMOR', 1);
    Catalog.ENCHANTMENTS = new Catalog()._Catalog('ENCHANTMENTS', 2);
    Catalog.GLYPHS = new Catalog()._Catalog('GLYPHS', 3);
    Catalog.THROWN_WEAPONS = new Catalog()._Catalog('THROWN_WEAPONS', 4);
    Catalog.WANDS = new Catalog()._Catalog('WANDS', 5);
    Catalog.RINGS = new Catalog()._Catalog('RINGS', 6);
    Catalog.ARTIFACTS = new Catalog()._Catalog('ARTIFACTS', 7);
    Catalog.TRINKETS = new Catalog()._Catalog('TRINKETS', 8);
    Catalog.MISC_EQUIPMENT = new Catalog()._Catalog('MISC_EQUIPMENT', 9);
    Catalog.POTIONS = new Catalog()._Catalog('POTIONS', 10);
    Catalog.SEEDS = new Catalog()._Catalog('SEEDS', 11);
    Catalog.SCROLLS = new Catalog()._Catalog('SCROLLS', 12);
    Catalog.STONES = new Catalog()._Catalog('STONES', 13);
    Catalog.FOOD = new Catalog()._Catalog('FOOD', 14);
    Catalog.EXOTIC_POTIONS = new Catalog()._Catalog('EXOTIC_POTIONS', 15);
    Catalog.EXOTIC_SCROLLS = new Catalog()._Catalog('EXOTIC_SCROLLS', 16);
    Catalog.BOMBS = new Catalog()._Catalog('BOMBS', 17);
    Catalog.TIPPED_DARTS = new Catalog()._Catalog('TIPPED_DARTS', 18);
    Catalog.BREWS_ELIXIRS = new Catalog()._Catalog('BREWS_ELIXIRS', 19);
    Catalog.SPELLS = new Catalog()._Catalog('SPELLS', 20);
    Catalog.MISC_CONSUMABLES = new Catalog()._Catalog('MISC_CONSUMABLES', 21);
    Catalog.$VALUES = [Catalog.MELEE_WEAPONS, Catalog.ARMOR, Catalog.ENCHANTMENTS, Catalog.GLYPHS, Catalog.THROWN_WEAPONS, Catalog.WANDS, Catalog.RINGS, Catalog.ARTIFACTS, Catalog.TRINKETS, Catalog.MISC_EQUIPMENT, Catalog.POTIONS, Catalog.SEEDS, Catalog.SCROLLS, Catalog.STONES, Catalog.FOOD, Catalog.EXOTIC_POTIONS, Catalog.EXOTIC_SCROLLS, Catalog.BOMBS, Catalog.TIPPED_DARTS, Catalog.BREWS_ELIXIRS, Catalog.SPELLS, Catalog.MISC_CONSUMABLES];
    Catalog.MELEE_WEAPONS.addItems(Generator$Category.WEP_T1.classes);
    Catalog.MELEE_WEAPONS.addItems(Generator$Category.WEP_T2.classes);
    Catalog.MELEE_WEAPONS.addItems(Generator$Category.WEP_T3.classes);
    Catalog.MELEE_WEAPONS.addItems(Generator$Category.WEP_T4.classes);
    Catalog.MELEE_WEAPONS.addItems(Generator$Category.WEP_T5.classes);
    Catalog.ARMOR.addItems(Generator$Category.ARMOR.classes);
    Catalog.THROWN_WEAPONS.addItems(Generator$Category.MIS_T1.classes);
    Catalog.THROWN_WEAPONS.addItems(Generator$Category.MIS_T2.classes);
    Catalog.THROWN_WEAPONS.addItems(Generator$Category.MIS_T3.classes);
    Catalog.THROWN_WEAPONS.addItems(Generator$Category.MIS_T4.classes);
    Catalog.THROWN_WEAPONS.addItems(Generator$Category.MIS_T5.classes);
    Catalog.ENCHANTMENTS.addItems(Weapon$Enchantment.common);
    Catalog.ENCHANTMENTS.addItems(Weapon$Enchantment.uncommon);
    Catalog.ENCHANTMENTS.addItems(Weapon$Enchantment.rare);
    Catalog.ENCHANTMENTS.addItems(Weapon$Enchantment.curses);
    Catalog.GLYPHS.addItems(Armor$Glyph.common);
    Catalog.GLYPHS.addItems(Armor$Glyph.uncommon);
    Catalog.GLYPHS.addItems(Armor$Glyph.rare);
    Catalog.GLYPHS.addItems(Armor$Glyph.curses);
    Catalog.WANDS.addItems(Generator$Category.WAND.classes);
    Catalog.RINGS.addItems(Generator$Category.RING.classes);
    Catalog.ARTIFACTS.addItems(Generator$Category.ARTIFACT.classes);
    Catalog.TRINKETS.addItems(Generator$Category.TRINKET.classes);
    Catalog.MISC_EQUIPMENT.addItems([$J.cls(BrokenSeal), $J.cls(SpiritBow), $J.cls(Waterskin), $J.cls(VelvetPouch), $J.cls(PotionBandolier), $J.cls(ScrollHolder), $J.cls(MagicalHolster), $J.cls(Amulet)]);
    Catalog.POTIONS.addItems(Generator$Category.POTION.classes);
    Catalog.SCROLLS.addItems(Generator$Category.SCROLL.classes);
    Catalog.SEEDS.addItems(Generator$Category.SEED.classes);
    Catalog.STONES.addItems(Generator$Category.STONE.classes);
    Catalog.FOOD.addItems([$J.cls(Food), $J.cls(Pasty), $J.cls(MysteryMeat), $J.cls(ChargrilledMeat), $J.cls(StewedMeat), $J.cls(FrozenCarpaccio), $J.cls(SmallRation), $J.cls(Berry), $J.cls(SupplyRation), $J.cls(Blandfruit), $J.cls(PhantomMeat), $J.cls(MeatPie)]);
    Catalog.EXOTIC_POTIONS.addItems($J.toArrayInto(ExoticPotion.exoToReg.keySet().toArray(), $J.newArray(0, null)));
    Catalog.EXOTIC_SCROLLS.addItems($J.toArrayInto(ExoticScroll.exoToReg.keySet().toArray(), $J.newArray(0, null)));
    Catalog.BOMBS.addItems([$J.cls(Bomb), $J.cls(FrostBomb), $J.cls(Firebomb), $J.cls(SmokeBomb), $J.cls(RegrowthBomb), $J.cls(WoollyBomb), $J.cls(Noisemaker), $J.cls(FlashBangBomb), $J.cls(HolyBomb), $J.cls(ArcaneBomb), $J.cls(ShrapnelBomb)]);
    Catalog.TIPPED_DARTS.addItems($J.toArrayInto(TippedDart.types.values().toArray(), $J.newArray(0, null)));
    Catalog.BREWS_ELIXIRS.addItems([$J.cls(UnstableBrew), $J.cls(InfernalBrew), $J.cls(BlizzardBrew), $J.cls(ShockingBrew), $J.cls(CausticBrew), $J.cls(AquaBrew), $J.cls(ElixirOfHoneyedHealing), $J.cls(ElixirOfAquaticRejuvenation), $J.cls(ElixirOfArcaneArmor), $J.cls(ElixirOfDragonsBlood), $J.cls(ElixirOfIcyTouch), $J.cls(ElixirOfToxicEssence), $J.cls(ElixirOfMight), $J.cls(ElixirOfFeatherFall)]);
    Catalog.SPELLS.addItems([$J.cls(UnstableSpell), $J.cls(WildEnergy), $J.cls(TelekineticGrab), $J.cls(PhaseShift), $J.cls(Alchemize), $J.cls(CurseInfusion), $J.cls(MagicalInfusion), $J.cls(Recycle), $J.cls(ReclaimTrap), $J.cls(SummonElemental), $J.cls(BeaconOfReturning)]);
    Catalog.MISC_CONSUMABLES.addItems([$J.cls(Gold), $J.cls(EnergyCrystal), $J.cls(Dewdrop), $J.cls(IronKey), $J.cls(GoldenKey), $J.cls(CrystalKey), $J.cls(WornKey), $J.cls(TrinketCatalyst), $J.cls(Stylus), $J.cls(Torch), $J.cls(Honeypot), $J.cls(Ankh), $J.cls(CorpseDust), $J.cls(Embers), $J.cls(CeremonialCandle), $J.cls(DarkGold), $J.cls(EscapeCrystal), $J.cls(VaultBeacon), $J.cls(DwarfToken), $J.cls(ImpStatue), $J.cls(GooBlob), $J.cls(TengusMask), $J.cls(MetalShard), $J.cls(KingsCrown), $J.cls(LiquidMetal), $J.cls(ArcaneResin), $J.cls(SealShard), $J.cls(BrokenStaff), $J.cls(CloakScrap), $J.cls(BowFragment), $J.cls(BrokenHilt), $J.cls(TornPage)]);
    Catalog.equipmentCatalogs = new ArrayList();
    Catalog.equipmentCatalogs.add(Catalog.MELEE_WEAPONS);
    Catalog.equipmentCatalogs.add(Catalog.ARMOR);
    Catalog.equipmentCatalogs.add(Catalog.ENCHANTMENTS);
    Catalog.equipmentCatalogs.add(Catalog.GLYPHS);
    Catalog.equipmentCatalogs.add(Catalog.THROWN_WEAPONS);
    Catalog.equipmentCatalogs.add(Catalog.WANDS);
    Catalog.equipmentCatalogs.add(Catalog.RINGS);
    Catalog.equipmentCatalogs.add(Catalog.ARTIFACTS);
    Catalog.equipmentCatalogs.add(Catalog.TRINKETS);
    Catalog.equipmentCatalogs.add(Catalog.MISC_EQUIPMENT);
    Catalog.consumableCatalogs = new ArrayList();
    Catalog.consumableCatalogs.add(Catalog.POTIONS);
    Catalog.consumableCatalogs.add(Catalog.SCROLLS);
    Catalog.consumableCatalogs.add(Catalog.SEEDS);
    Catalog.consumableCatalogs.add(Catalog.STONES);
    Catalog.consumableCatalogs.add(Catalog.FOOD);
    Catalog.consumableCatalogs.add(Catalog.EXOTIC_POTIONS);
    Catalog.consumableCatalogs.add(Catalog.EXOTIC_SCROLLS);
    Catalog.consumableCatalogs.add(Catalog.BOMBS);
    Catalog.consumableCatalogs.add(Catalog.TIPPED_DARTS);
    Catalog.consumableCatalogs.add(Catalog.BREWS_ELIXIRS);
    Catalog.consumableCatalogs.add(Catalog.SPELLS);
    Catalog.consumableCatalogs.add(Catalog.MISC_CONSUMABLES);
  }
}

$J.define(Catalog, 'com.shatteredpixel.shatteredpixeldungeon.journal.Catalog', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Catalog' }, clinit: true, lazy: ['$VALUES', 'MELEE_WEAPONS', 'ARMOR', 'ENCHANTMENTS', 'GLYPHS', 'THROWN_WEAPONS', 'WANDS', 'RINGS', 'ARTIFACTS', 'TRINKETS', 'MISC_EQUIPMENT', 'POTIONS', 'SEEDS', 'SCROLLS', 'STONES', 'FOOD', 'EXOTIC_POTIONS', 'EXOTIC_SCROLLS', 'BOMBS', 'TIPPED_DARTS', 'BREWS_ELIXIRS', 'SPELLS', 'MISC_CONSUMABLES', 'equipmentCatalogs', 'consumableCatalogs'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Amulet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Amulet');
  Ankh = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Ankh');
  ArcaneResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin');
  BrokenSeal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal');
  Dewdrop = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Dewdrop');
  EnergyCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EnergyCrystal');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  KingsCrown = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.KingsCrown');
  LiquidMetal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal');
  Stylus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Stylus');
  TengusMask = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.TengusMask');
  Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Torch');
  Waterskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Waterskin');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  PotionBandolier = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.PotionBandolier');
  ScrollHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.ScrollHolder');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  ArcaneBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.ArcaneBomb');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Firebomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Firebomb');
  FlashBangBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.FlashBangBomb');
  FrostBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.FrostBomb');
  HolyBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.HolyBomb');
  Noisemaker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Noisemaker');
  RegrowthBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.RegrowthBomb');
  ShrapnelBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.ShrapnelBomb');
  SmokeBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.SmokeBomb');
  WoollyBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.WoollyBomb');
  Berry = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Berry');
  Blandfruit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit');
  ChargrilledMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.ChargrilledMeat');
  Food = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Food');
  FrozenCarpaccio = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.FrozenCarpaccio');
  MeatPie = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MeatPie');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  Pasty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty');
  PhantomMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.PhantomMeat');
  SmallRation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.SmallRation');
  StewedMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat');
  SupplyRation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.SupplyRation');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  GoldenKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.GoldenKey');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  WornKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.WornKey');
  AquaBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.AquaBrew');
  BlizzardBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.BlizzardBrew');
  CausticBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.CausticBrew');
  InfernalBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.InfernalBrew');
  ShockingBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.ShockingBrew');
  UnstableBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew');
  ElixirOfAquaticRejuvenation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfAquaticRejuvenation');
  ElixirOfArcaneArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfArcaneArmor');
  ElixirOfDragonsBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfDragonsBlood');
  ElixirOfFeatherFall = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfFeatherFall');
  ElixirOfHoneyedHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfHoneyedHealing');
  ElixirOfIcyTouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfIcyTouch');
  ElixirOfMight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight');
  ElixirOfToxicEssence = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfToxicEssence');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  CeremonialCandle = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CeremonialCandle');
  CorpseDust = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust');
  DarkGold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DarkGold');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Embers = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Embers');
  EscapeCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal');
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  ImpStatue = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.ImpStatue');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  VaultBeacon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.VaultBeacon');
  BowFragment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.BowFragment');
  BrokenHilt = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.BrokenHilt');
  BrokenStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.BrokenStaff');
  CloakScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.CloakScrap');
  SealShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.SealShard');
  TornPage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.TornPage');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  Alchemize = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize');
  BeaconOfReturning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning');
  CurseInfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.CurseInfusion');
  MagicalInfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.MagicalInfusion');
  PhaseShift = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.PhaseShift');
  ReclaimTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.ReclaimTrap');
  Recycle = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Recycle');
  SummonElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.SummonElemental');
  TelekineticGrab = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.TelekineticGrab');
  UnstableSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell');
  WildEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.WildEnergy');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
