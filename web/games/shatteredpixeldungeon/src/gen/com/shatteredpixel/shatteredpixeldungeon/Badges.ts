// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Badges.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Exception, HashMap, HashSet, IOException, JEnum, JObject, JString, LinkedHashMap } from '../../../../jre/index.ts';

let Dungeon, Rankings, Statistics, AscensionChallenge, HeroClass, HeroSubClass, Artifact, MagicalHolster, PotionBandolier, ScrollHolder, VelvetPouch, Potion, Pickaxe, RemainsItem, Scroll, Explosive$ExplosiveCurseBomb, MeleeWeapon, Bestiary, Catalog, Document, Messages, PixelScene, GLog, Game, Bundle, FileUtils;

export class Badges extends JObject {
  static global: HashSet<Badges$Badge> = null;
  static local: HashSet<Badges$Badge> = null;
  static saveNeeded: boolean = false;
  static readonly BADGES_FILE: string = 'badges.dat';
  static readonly BADGES: string = 'badges';
  static removedBadges: HashSet<string> = null;
  static renamedBadges: HashMap<string, string> = null;
  static firstBossClassBadges: LinkedHashMap<HeroClass, Badges$Badge> = null;
  static victoryClassBadges: LinkedHashMap<HeroClass, Badges$Badge> = null;
  static thirdBossSubclassBadges: LinkedHashMap<HeroSubClass, Badges$Badge> = null;
  static tierBadgeReplacements: Badges$Badge[][] = null;
  static prerequisiteBadges: Badges$Badge[][] = null;
  static summaryBadgeReplacements: Badges$Badge[][] = null;
  _Badges(): this {
    return this;
  }
  static reset(): void {
    Badges.local.clear();
    Badges.loadGlobal();
  }
  static restore(bundle: Bundle): HashSet<Badges$Badge> {
    let badges = new HashSet();
    if (bundle == null) {
      return badges;
    }
    let names = bundle.getStringArray(Badges.BADGES);
    if (names == null) {
      return badges;
    }
    for (let i = 0; i < names.length; i++) {
      try {
        if (Badges.renamedBadges.containsKey(names[i])) {
          names[i] = Badges.renamedBadges.get(names[i]);
        }
        if (!Badges.removedBadges.contains(names[i])) {
          badges.add(Badges$Badge.valueOf(names[i]));
        }
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
          Game.reportException(e);
        } else {
          throw $e0;
        }
      }
    }
    Badges.addReplacedBadges(badges);
    return badges;
  }
  static store(bundle: Bundle, badges: HashSet<Badges$Badge>): void {
    Badges.addReplacedBadges(badges);
    let count = 0;
    let names = $J.newArray(badges.size(), null);
    for (const $it1 = badges.iterator(); $it1.hasNext(); ) {
      let badge = $it1.next();
      names[count++] = badge.name();
    }
    bundle.put$String$StringArr(Badges.BADGES, names);
  }
  static loadLocal(bundle: Bundle): void {
    Badges.local = Badges.restore(bundle);
  }
  static saveLocal(bundle: Bundle): void {
    Badges.store(bundle, Badges.local);
  }
  static loadGlobal(): void {
    if (Badges.global == null) {
      try {
        let bundle = FileUtils.bundleFromFile(Badges.BADGES_FILE);
        Badges.global = Badges.restore(bundle);
      } catch ($e2) {
        if ($J.isa($e2, IOException)) {
          let e = $J.exc($e2);
          Badges.global = new HashSet();
        } else {
          throw $e2;
        }
      }
    }
  }
  static saveGlobal$(): void {
    Badges.saveGlobal$boolean(false);
  }
  static saveGlobal$boolean(force: boolean): void {
    if (Badges.saveNeeded || force) {
      let bundle = new Bundle()._Bundle$();
      Badges.store(bundle, Badges.global);
      try {
        FileUtils.bundleToFile(Badges.BADGES_FILE, bundle);
        Badges.saveNeeded = false;
      } catch ($e3) {
        if ($J.isa($e3, IOException)) {
          let e = $J.exc($e3);
          Game.reportException(e);
        } else {
          throw $e3;
        }
      }
    }
  }
  static totalUnlocked(global: boolean): number {
    if (global) {
      return Badges.global.size();
    } else {
      return Badges.local.size();
    }
  }
  static validateMonstersSlain(): void {
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.MONSTERS_SLAIN_1) && Statistics.enemiesSlain >= 10) {
      badge = Badges$Badge.MONSTERS_SLAIN_1;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.MONSTERS_SLAIN_2) && Statistics.enemiesSlain >= 50) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.MONSTERS_SLAIN_2;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.MONSTERS_SLAIN_3) && Statistics.enemiesSlain >= 100) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.MONSTERS_SLAIN_3;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.MONSTERS_SLAIN_4) && Statistics.enemiesSlain >= 250) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.MONSTERS_SLAIN_4;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.MONSTERS_SLAIN_5) && Statistics.enemiesSlain >= 500) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.MONSTERS_SLAIN_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateGoldCollected(): void {
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.GOLD_COLLECTED_1) && Statistics.goldCollected >= 250) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.GOLD_COLLECTED_1;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.GOLD_COLLECTED_2) && Statistics.goldCollected >= 1000) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.GOLD_COLLECTED_2;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.GOLD_COLLECTED_3) && Statistics.goldCollected >= 2500) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.GOLD_COLLECTED_3;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.GOLD_COLLECTED_4) && Statistics.goldCollected >= 7500) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.GOLD_COLLECTED_4;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.GOLD_COLLECTED_5) && Statistics.goldCollected >= 15000) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.GOLD_COLLECTED_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateLevelReached(): void {
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.LEVEL_REACHED_1) && Dungeon.hero.lvl >= 6) {
      badge = Badges$Badge.LEVEL_REACHED_1;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.LEVEL_REACHED_2) && Dungeon.hero.lvl >= 12) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.LEVEL_REACHED_2;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.LEVEL_REACHED_3) && Dungeon.hero.lvl >= 18) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.LEVEL_REACHED_3;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.LEVEL_REACHED_4) && Dungeon.hero.lvl >= 24) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.LEVEL_REACHED_4;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.LEVEL_REACHED_5) && Dungeon.hero.lvl >= 30) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.LEVEL_REACHED_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateStrengthAttained(): void {
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.STRENGTH_ATTAINED_1) && Dungeon.hero.STR_ >= 12) {
      badge = Badges$Badge.STRENGTH_ATTAINED_1;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.STRENGTH_ATTAINED_2) && Dungeon.hero.STR_ >= 14) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.STRENGTH_ATTAINED_2;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.STRENGTH_ATTAINED_3) && Dungeon.hero.STR_ >= 16) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.STRENGTH_ATTAINED_3;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.STRENGTH_ATTAINED_4) && Dungeon.hero.STR_ >= 18) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.STRENGTH_ATTAINED_4;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.STRENGTH_ATTAINED_5) && Dungeon.hero.STR_ >= 20) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.STRENGTH_ATTAINED_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateFoodEaten(): void {
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.FOOD_EATEN_1) && Statistics.foodEaten >= 10) {
      badge = Badges$Badge.FOOD_EATEN_1;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.FOOD_EATEN_2) && Statistics.foodEaten >= 20) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.FOOD_EATEN_2;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.FOOD_EATEN_3) && Statistics.foodEaten >= 30) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.FOOD_EATEN_3;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.FOOD_EATEN_4) && Statistics.foodEaten >= 40) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.FOOD_EATEN_4;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.FOOD_EATEN_5) && Statistics.foodEaten >= 50) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.FOOD_EATEN_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateItemsCrafted(): void {
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.ITEMS_CRAFTED_1) && Statistics.itemsCrafted >= 3) {
      badge = Badges$Badge.ITEMS_CRAFTED_1;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEMS_CRAFTED_2) && Statistics.itemsCrafted >= 8) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEMS_CRAFTED_2;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEMS_CRAFTED_3) && Statistics.itemsCrafted >= 15) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEMS_CRAFTED_3;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEMS_CRAFTED_4) && Statistics.itemsCrafted >= 24) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEMS_CRAFTED_4;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEMS_CRAFTED_5) && Statistics.itemsCrafted >= 35) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEMS_CRAFTED_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateHazardAssists(): void {
    if (!Badges.local.contains(Badges$Badge.ENEMY_HAZARDS) && Statistics.hazardAssistedKills >= 10) {
      Badges.local.add(Badges$Badge.ENEMY_HAZARDS);
      Badges.displayBadge(Badges$Badge.ENEMY_HAZARDS);
    }
  }
  static validatePiranhasKilled(): void {
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.PIRANHAS) && Statistics.piranhasKilled >= 6) {
      badge = Badges$Badge.PIRANHAS;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateItemLevelAquired(item: Item): void {
    if (!item.levelKnown || item instanceof Artifact) {
      return;
    }
    if (item instanceof MeleeWeapon) {
      Badges.validateDuelistUnlock();
    }
    let badge = null;
    if (!Badges.local.contains(Badges$Badge.ITEM_LEVEL_1) && item.level$() >= 3) {
      badge = Badges$Badge.ITEM_LEVEL_1;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEM_LEVEL_2) && item.level$() >= 6) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEM_LEVEL_2;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEM_LEVEL_3) && item.level$() >= 9) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEM_LEVEL_3;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEM_LEVEL_4) && item.level$() >= 12) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEM_LEVEL_4;
      Badges.local.add(badge);
    }
    if (!Badges.local.contains(Badges$Badge.ITEM_LEVEL_5) && item.level$() >= 15) {
      if (badge != null) {
        Badges.unlock(badge);
      }
      badge = Badges$Badge.ITEM_LEVEL_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateAllBagsBought(bag: Item): void {
    let badge = null;
    if (bag instanceof VelvetPouch) {
      badge = Badges$Badge.BAG_BOUGHT_VELVET_POUCH;
    } else if (bag instanceof ScrollHolder) {
      badge = Badges$Badge.BAG_BOUGHT_SCROLL_HOLDER;
    } else if (bag instanceof PotionBandolier) {
      badge = Badges$Badge.BAG_BOUGHT_POTION_BANDOLIER;
    } else if (bag instanceof MagicalHolster) {
      badge = Badges$Badge.BAG_BOUGHT_MAGICAL_HOLSTER;
    }
    if (badge != null) {
      Badges.local.add(badge);
      if (!Badges.local.contains(Badges$Badge.ALL_BAGS_BOUGHT) && Badges.local.contains(Badges$Badge.BAG_BOUGHT_VELVET_POUCH) && Badges.local.contains(Badges$Badge.BAG_BOUGHT_SCROLL_HOLDER) && Badges.local.contains(Badges$Badge.BAG_BOUGHT_POTION_BANDOLIER) && Badges.local.contains(Badges$Badge.BAG_BOUGHT_MAGICAL_HOLSTER)) {
        badge = Badges$Badge.ALL_BAGS_BOUGHT;
        Badges.local.add(badge);
        Badges.displayBadge(badge);
      }
    }
  }
  static validateCatalogBadges(): void {
    let totalSeen = 0;
    let totalThings = 0;
    for (let cat of Catalog.values()) {
      totalSeen = (totalSeen + cat.totalSeen()) | 0;
      totalThings = (totalThings + cat.totalItems()) | 0;
    }
    for (let cat of Bestiary.values()) {
      totalSeen = (totalSeen + cat.totalSeen()) | 0;
      totalThings = (totalThings + cat.totalEntities()) | 0;
    }
    for (let doc of Document.values()) {
      if (!doc.isLoreDoc()) {
        for (const $it4 = doc.pageNames().iterator(); $it4.hasNext(); ) {
          let page = $it4.next();
          if (doc.isPageFound$String(page)) {
            totalSeen++;
          }
          totalThings++;
        }
      }
    }
    let badge = null;
    if (totalSeen >= 40) {
      badge = Badges$Badge.RESEARCHER_1;
    }
    if (totalSeen >= 80) {
      Badges.unlock(badge);
      badge = Badges$Badge.RESEARCHER_2;
    }
    if (totalSeen >= 160) {
      Badges.unlock(badge);
      badge = Badges$Badge.RESEARCHER_3;
    }
    if (totalSeen >= 320) {
      Badges.unlock(badge);
      badge = Badges$Badge.RESEARCHER_4;
    }
    if (totalSeen === totalThings) {
      Badges.unlock(badge);
      badge = Badges$Badge.RESEARCHER_5;
    }
    Badges.displayBadge(badge);
    let qualified = true;
    for (const $it5 = Catalog.equipmentCatalogs.iterator(); $it5.hasNext(); ) {
      let cat = $it5.next();
      if (cat !== Catalog.ENCHANTMENTS && cat !== Catalog.GLYPHS) {
        if (cat.totalSeen() === 0) {
          qualified = false;
          break;
        }
      }
    }
    if (qualified) {
      Badges.displayBadge(Badges$Badge.CATALOG_ONE_EQUIPMENT);
    }
    if (!Badges.local.contains(Badges$Badge.CATALOG_POTIONS_SCROLLS) && Potion.allKnown() && Scroll.allKnown() && Dungeon.hero != null && Dungeon.hero.isAlive()) {
      Badges.local.add(Badges$Badge.CATALOG_POTIONS_SCROLLS);
      Badges.displayBadge(Badges$Badge.CATALOG_POTIONS_SCROLLS);
    }
    if (Bestiary.RARE.totalSeen() >= 10) {
      Badges.displayBadge(Badges$Badge.ALL_RARE_ENEMIES);
    }
    if (Document.HALLS_KING.isPageRead$String(Document.KING_ATTRITION)) {
      Badges.displayBadge(Badges$Badge.RODNEY);
    }
  }
  static validateDeathFromFire(): void {
    let badge = Badges$Badge.DEATH_FROM_FIRE;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromPoison(): void {
    let badge = Badges$Badge.DEATH_FROM_POISON;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromGas(): void {
    let badge = Badges$Badge.DEATH_FROM_GAS;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromHunger(): void {
    let badge = Badges$Badge.DEATH_FROM_HUNGER;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromFalling(): void {
    let badge = Badges$Badge.DEATH_FROM_FALLING;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromEnemyMagic(): void {
    let badge = Badges$Badge.DEATH_FROM_ENEMY_MAGIC;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromFriendlyMagic(): void {
    let badge = Badges$Badge.DEATH_FROM_FRIENDLY_MAGIC;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromSacrifice(): void {
    let badge = Badges$Badge.DEATH_FROM_SACRIFICE;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromGrimOrDisintTrap(): void {
    let badge = Badges$Badge.DEATH_FROM_GRIM_TRAP;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    Badges.validateDeathFromAll();
  }
  static validateDeathFromAll(): void {
    if (Badges.isUnlocked(Badges$Badge.DEATH_FROM_FIRE) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_POISON) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_GAS) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_HUNGER) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_FALLING) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_ENEMY_MAGIC) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_FRIENDLY_MAGIC) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_SACRIFICE) && Badges.isUnlocked(Badges$Badge.DEATH_FROM_GRIM_TRAP)) {
      let badge = Badges$Badge.DEATH_FROM_ALL;
      if (!Badges.isUnlocked(badge)) {
        Badges.displayBadge(badge);
      }
    }
  }
  static validateBossSlain(): void {
    let badge = null;
    switch (Dungeon.depth) {
      case 5:
        badge = Badges$Badge.BOSS_SLAIN_1;
        break;
      case 10:
        badge = Badges$Badge.BOSS_SLAIN_2;
        break;
      case 15:
        badge = Badges$Badge.BOSS_SLAIN_3;
        break;
      case 20:
        badge = Badges$Badge.BOSS_SLAIN_4;
        break;
    }
    if (badge != null) {
      Badges.local.add(badge);
      Badges.displayBadge(badge);
      if (badge === Badges$Badge.BOSS_SLAIN_1) {
        badge = Badges.firstBossClassBadges.get(Dungeon.hero.heroClass);
        if (badge == null) {
          return;
        }
        Badges.local.add(badge);
        Badges.unlock(badge);
        let allUnlocked = true;
        for (const $it6 = Badges.firstBossClassBadges.values().iterator(); $it6.hasNext(); ) {
          let b = $it6.next();
          if (!Badges.isUnlocked(b)) {
            allUnlocked = false;
            break;
          }
        }
        if (allUnlocked) {
          badge = Badges$Badge.BOSS_SLAIN_1_ALL_CLASSES;
          if (!Badges.isUnlocked(badge)) {
            Badges.displayBadge(badge);
          }
        }
      } else if (badge === Badges$Badge.BOSS_SLAIN_3) {
        badge = Badges.thirdBossSubclassBadges.get(Dungeon.hero.subClass);
        if (badge == null) {
          return;
        }
        Badges.local.add(badge);
        Badges.unlock(badge);
        let allUnlocked = true;
        for (const $it7 = Badges.thirdBossSubclassBadges.values().iterator(); $it7.hasNext(); ) {
          let b = $it7.next();
          if (!Badges.isUnlocked(b)) {
            allUnlocked = false;
            break;
          }
        }
        if (allUnlocked) {
          badge = Badges$Badge.BOSS_SLAIN_3_ALL_SUBCLASSES;
          if (!Badges.isUnlocked(badge)) {
            Badges.displayBadge(badge);
          }
        }
      }
      if (Statistics.qualifiedForBossRemainsBadge && Dungeon.hero.belongings.getItem($J.cls(RemainsItem)) != null) {
        badge = Badges$Badge.BOSS_SLAIN_REMAINS;
        Badges.local.add(badge);
        Badges.displayBadge(badge);
      }
    }
  }
  static validateBossChallengeCompleted(): void {
    let badge = null;
    switch (Dungeon.depth) {
      case 5:
        badge = Badges$Badge.BOSS_CHALLENGE_1;
        break;
      case 10:
        badge = Badges$Badge.BOSS_CHALLENGE_2;
        break;
      case 15:
        badge = Badges$Badge.BOSS_CHALLENGE_3;
        break;
      case 20:
        badge = Badges$Badge.BOSS_CHALLENGE_4;
        break;
      case 25:
        badge = Badges$Badge.BOSS_CHALLENGE_5;
        break;
    }
    if (badge != null) {
      Badges.local.add(badge);
      Badges.displayBadge(badge);
    }
  }
  static validateMastery(): void {
    let badge = null;
    switch (Dungeon.hero.heroClass) {
      case HeroClass.WARRIOR:
        badge = Badges$Badge.MASTERY_WARRIOR;
        break;
      case HeroClass.MAGE:
        badge = Badges$Badge.MASTERY_MAGE;
        break;
      case HeroClass.ROGUE:
        badge = Badges$Badge.MASTERY_ROGUE;
        break;
      case HeroClass.HUNTRESS:
        badge = Badges$Badge.MASTERY_HUNTRESS;
        break;
      case HeroClass.DUELIST:
        badge = Badges$Badge.MASTERY_DUELIST;
        break;
      case HeroClass.CLERIC:
        badge = Badges$Badge.MASTERY_CLERIC;
        break;
    }
    Badges.unlock(badge);
  }
  static validateRatmogrify(): void {
    Badges.unlock(Badges$Badge.FOUND_RATMOGRIFY);
  }
  static validateMageUnlock(): void {
    if (Statistics.upgradesUsed >= 1 && !Badges.isUnlocked(Badges$Badge.UNLOCK_MAGE)) {
      Badges.displayBadge(Badges$Badge.UNLOCK_MAGE);
    }
  }
  static validateRogueUnlock(): void {
    if (Statistics.sneakAttacks >= 10 && !Badges.isUnlocked(Badges$Badge.UNLOCK_ROGUE)) {
      Badges.displayBadge(Badges$Badge.UNLOCK_ROGUE);
    }
  }
  static validateHuntressUnlock(): void {
    if (Statistics.thrownAttacks >= 10 && !Badges.isUnlocked(Badges$Badge.UNLOCK_HUNTRESS)) {
      Badges.displayBadge(Badges$Badge.UNLOCK_HUNTRESS);
    }
  }
  static validateDuelistUnlock(): void {
    if (!Badges.isUnlocked(Badges$Badge.UNLOCK_DUELIST) && Dungeon.hero != null && Dungeon.hero.belongings.weapon_ instanceof MeleeWeapon && (Dungeon.hero.belongings.weapon_).tier_ >= 2 && (Dungeon.hero.belongings.weapon_).STRReq$() <= Dungeon.hero.STR()) {
      if (Dungeon.hero.belongings.weapon_.isIdentified() && (Dungeon.hero.belongings.weapon_).STRReq$() <= Dungeon.hero.STR()) {
        Badges.displayBadge(Badges$Badge.UNLOCK_DUELIST);
      } else if (!Dungeon.hero.belongings.weapon_.isIdentified() && (Dungeon.hero.belongings.weapon_).STRReq$int(0) <= Dungeon.hero.STR()) {
        Badges.displayBadge(Badges$Badge.UNLOCK_DUELIST);
      }
    }
  }
  static validateClericUnlock(): void {
    if (!Badges.isUnlocked(Badges$Badge.UNLOCK_CLERIC)) {
      Badges.displayBadge(Badges$Badge.UNLOCK_CLERIC);
    }
  }
  static validateMasteryCombo(n: number): void {
    if (!Badges.local.contains(Badges$Badge.MASTERY_COMBO) && n === 10) {
      let badge = Badges$Badge.MASTERY_COMBO;
      Badges.local.add(badge);
      Badges.displayBadge(badge);
    }
  }
  static validateVictory(): void {
    let badge = Badges$Badge.VICTORY;
    Badges.local.add(badge);
    Badges.displayBadge(badge);
    if (Statistics.qualifiedForRandomVictoryBadge && Dungeon.hero.subClass != null && Dungeon.hero.armorAbility != null) {
      badge = Badges$Badge.VICTORY_RANDOM;
      Badges.local.add(badge);
      Badges.displayBadge(badge);
    }
    badge = Badges.victoryClassBadges.get(Dungeon.hero.heroClass);
    if (badge == null) {
      return;
    }
    Badges.local.add(badge);
    Badges.unlock(badge);
    let allUnlocked = true;
    for (const $it8 = Badges.victoryClassBadges.values().iterator(); $it8.hasNext(); ) {
      let b = $it8.next();
      if (!Badges.isUnlocked(b)) {
        allUnlocked = false;
        break;
      }
    }
    if (allUnlocked) {
      badge = Badges$Badge.VICTORY_ALL_CLASSES;
      Badges.displayBadge(badge);
    }
  }
  static validateTakingTheMick(cause: any): void {
    if ((cause === Dungeon.hero || cause instanceof Explosive$ExplosiveCurseBomb) && Dungeon.hero.belongings.attackingWeapon() instanceof Pickaxe && Dungeon.hero.belongings.attackingWeapon().level$() >= 20) {
      Badges.local.add(Badges$Badge.TAKING_THE_MICK);
      Badges.displayBadge(Badges$Badge.TAKING_THE_MICK);
    }
  }
  static validateNoKilling(): void {
    if (!Badges.local.contains(Badges$Badge.NO_MONSTERS_SLAIN) && Statistics.completedWithNoKilling) {
      let badge = Badges$Badge.NO_MONSTERS_SLAIN;
      Badges.local.add(badge);
      Badges.displayBadge(badge);
      Statistics.completedWithNoKilling = false;
    }
  }
  static validateGrimWeapon(): void {
    if (!Badges.local.contains(Badges$Badge.GRIM_WEAPON)) {
      let badge = Badges$Badge.GRIM_WEAPON;
      Badges.local.add(badge);
      Badges.displayBadge(badge);
    }
  }
  static validateManyBuffs(): void {
    if (!Badges.local.contains(Badges$Badge.MANY_BUFFS)) {
      let badge = Badges$Badge.MANY_BUFFS;
      Badges.local.add(badge);
      Badges.displayBadge(badge);
    }
  }
  static validateGamesPlayed(): void {
    let badge = null;
    if (Rankings.INSTANCE.totalNumber >= 10 || Rankings.INSTANCE.wonNumber >= 1) {
      badge = Badges$Badge.GAMES_PLAYED_1;
    }
    if (Rankings.INSTANCE.totalNumber >= 25 || Rankings.INSTANCE.wonNumber >= 3) {
      Badges.unlock(badge);
      badge = Badges$Badge.GAMES_PLAYED_2;
    }
    if (Rankings.INSTANCE.totalNumber >= 50 || Rankings.INSTANCE.wonNumber >= 5) {
      Badges.unlock(badge);
      badge = Badges$Badge.GAMES_PLAYED_3;
    }
    if (Rankings.INSTANCE.totalNumber >= 200 || Rankings.INSTANCE.wonNumber >= 10) {
      Badges.unlock(badge);
      badge = Badges$Badge.GAMES_PLAYED_4;
    }
    if (Rankings.INSTANCE.totalNumber >= 1000 || Rankings.INSTANCE.wonNumber >= 25) {
      Badges.unlock(badge);
      badge = Badges$Badge.GAMES_PLAYED_5;
    }
    Badges.displayBadge(badge);
  }
  static validateHighScore(score: number): void {
    let badge = null;
    if (score >= 5000) {
      badge = Badges$Badge.HIGH_SCORE_1;
      Badges.local.add(badge);
    }
    if (score >= 25000) {
      Badges.unlock(badge);
      badge = Badges$Badge.HIGH_SCORE_2;
      Badges.local.add(badge);
    }
    if (score >= 100000) {
      Badges.unlock(badge);
      badge = Badges$Badge.HIGH_SCORE_3;
      Badges.local.add(badge);
    }
    if (score >= 250000) {
      Badges.unlock(badge);
      badge = Badges$Badge.HIGH_SCORE_4;
      Badges.local.add(badge);
    }
    if (score >= 1000000) {
      Badges.unlock(badge);
      badge = Badges$Badge.HIGH_SCORE_5;
      Badges.local.add(badge);
    }
    Badges.displayBadge(badge);
  }
  static validateHappyEnd(): void {
    Badges.local.add(Badges$Badge.HAPPY_END);
    Badges.displayBadge(Badges$Badge.HAPPY_END);
    if (Dungeon.hero.belongings.getItem($J.cls(RemainsItem)) != null) {
      Badges.local.add(Badges$Badge.HAPPY_END_REMAINS);
      Badges.displayBadge(Badges$Badge.HAPPY_END_REMAINS);
    }
    if (AscensionChallenge.qualifiedForPacifist()) {
      Badges.local.add(Badges$Badge.PACIFIST_ASCENT);
      Badges.displayBadge(Badges$Badge.PACIFIST_ASCENT);
    }
  }
  static validateChampion(challenges: number): void {
    if (challenges === 0) {
      return;
    }
    let badge = null;
    if (challenges >= 1) {
      badge = Badges$Badge.CHAMPION_1;
    }
    if (challenges >= 3) {
      Badges.unlock(badge);
      badge = Badges$Badge.CHAMPION_2;
    }
    if (challenges >= 6) {
      Badges.unlock(badge);
      badge = Badges$Badge.CHAMPION_3;
    }
    Badges.local.add(badge);
    Badges.displayBadge(badge);
  }
  static displayBadge(badge: Badges$Badge): void {
    if (badge == null || (badge.type_ !== Badges$BadgeType.JOURNAL && !(Dungeon.customSeedText.length === 0))) {
      return;
    }
    if (Badges.isUnlocked(badge)) {
      if (badge.type_ === Badges$BadgeType.LOCAL) {
        GLog.h(Messages.get$Class$String$ObjectArr($J.cls(Badges), 'endorsed', [badge.title()]), []);
        GLog.newLine();
      }
    } else {
      Badges.unlock(badge);
      GLog.h(Messages.get$Class$String$ObjectArr($J.cls(Badges), 'new', [badge.title() + ' (' + badge.desc() + ')']), []);
      GLog.newLine();
      PixelScene.showBadge(badge);
    }
  }
  static isUnlocked(badge: Badges$Badge): boolean {
    return Badges.global.contains(badge);
  }
  static allUnlocked(): HashSet<Badges$Badge> {
    Badges.loadGlobal();
    return new HashSet(Badges.global);
  }
  static disown(badge: Badges$Badge): void {
    Badges.loadGlobal();
    Badges.global.remove(badge);
    Badges.saveNeeded = true;
  }
  static unlock(badge: Badges$Badge): void {
    if (!Badges.isUnlocked(badge) && (badge.type_ === Badges$BadgeType.JOURNAL || (Dungeon.customSeedText.length === 0))) {
      Badges.global.add(badge);
      Badges.saveNeeded = true;
    }
  }
  static filterReplacedBadges$boolean(global: boolean): List<Badges$Badge> {
    let badges = new ArrayList(global ? Badges.global : Badges.local);
    let iterator = badges.iterator();
    while (iterator.hasNext()) {
      let badge = iterator.next();
      if ((!global && badge.type_ !== Badges$BadgeType.LOCAL) || badge.type_ === Badges$BadgeType.HIDDEN) {
        iterator.remove();
      }
    }
    Collections.sort(badges);
    return Badges.filterReplacedBadges$List(badges);
  }
  static filterReplacedBadges$List(badges: List<Badges$Badge>): List<Badges$Badge> {
    for (let tierReplace of Badges.tierBadgeReplacements) {
      Badges.leaveBest(badges, tierReplace);
    }
    for (let metaReplace of Badges.summaryBadgeReplacements) {
      Badges.leaveBest(badges, metaReplace);
    }
    return badges;
  }
  static leaveBest(list: Collection<Badges$Badge>, badges: Badges$Badge[]): void {
    for (let i = (badges.length - 1) | 0; i > 0; i--) {
      if (list.contains(badges[i])) {
        for (let j = 0; j < i; j++) {
          list.remove(badges[j]);
        }
        break;
      }
    }
  }
  static filterBadgesWithoutPrerequisites(badges: List<Badges$Badge>): List<Badges$Badge> {
    for (let prereqReplace of Badges.prerequisiteBadges) {
      Badges.leaveWorst(badges, prereqReplace);
    }
    for (let tierReplace of Badges.tierBadgeReplacements) {
      Badges.leaveWorst(badges, tierReplace);
    }
    Collections.sort(badges);
    return badges;
  }
  static leaveWorst(list: Collection<Badges$Badge>, badges: Badges$Badge[]): void {
    for (let i = 0; i < badges.length; i++) {
      if (list.contains(badges[i])) {
        for (let j = (i + 1) | 0; j < badges.length; j++) {
          list.remove(badges[j]);
        }
        break;
      }
    }
  }
  static addReplacedBadges(badges: Collection<Badges$Badge>): Collection<Badges$Badge> {
    for (let tierReplace of Badges.tierBadgeReplacements) {
      Badges.addLower(badges, tierReplace);
    }
    for (let metaReplace of Badges.summaryBadgeReplacements) {
      Badges.addLower(badges, metaReplace);
    }
    return badges;
  }
  static addLower(list: Collection<Badges$Badge>, badges: Badges$Badge[]): void {
    for (let i = (badges.length - 1) | 0; i > 0; i--) {
      if (list.contains(badges[i])) {
        for (let j = 0; j < i; j++) {
          list.add(badges[j]);
        }
        break;
      }
    }
  }
  static showCompletionProgress(badge: Badges$Badge): string {
    if (Badges.isUnlocked(badge)) {
      return null;
    }
    let result = '\n';
    if (badge === Badges$Badge.BOSS_SLAIN_1_ALL_CLASSES) {
      for (let cls of HeroClass.values()) {
        result += '\n';
        if (Badges.isUnlocked(Badges.firstBossClassBadges.get(cls))) {
          result += '_' + Messages.titleCase(cls.title()) + '_';
        } else {
          result += Messages.titleCase(cls.title());
        }
      }
      return result;
    } else if (badge === Badges$Badge.VICTORY_ALL_CLASSES) {
      for (let cls of HeroClass.values()) {
        result += '\n';
        if (Badges.isUnlocked(Badges.victoryClassBadges.get(cls))) {
          result += '_' + Messages.titleCase(cls.title()) + '_';
        } else {
          result += Messages.titleCase(cls.title());
        }
      }
      return result;
    } else if (badge === Badges$Badge.BOSS_SLAIN_3_ALL_SUBCLASSES) {
      for (let cls of HeroSubClass.values()) {
        if (cls === HeroSubClass.NONE) {
          continue;
        }
        result += '\n';
        if (Badges.isUnlocked(Badges.thirdBossSubclassBadges.get(cls))) {
          result += '_' + Messages.titleCase(cls.title()) + '_';
        } else {
          result += Messages.titleCase(cls.title());
        }
      }
      return result;
    }
    return null;
  }
  static $clinit() {
    Badges.local = new HashSet();
    Badges.saveNeeded = false;
    Badges.removedBadges = new HashSet();
    Badges.removedBadges.add('ALL_WEAPONS_IDENTIFIED');
    Badges.removedBadges.add('ALL_ARMOR_IDENTIFIED');
    Badges.removedBadges.add('ALL_WANDS_IDENTIFIED');
    Badges.removedBadges.add('ALL_RINGS_IDENTIFIED');
    Badges.removedBadges.add('ALL_ARTIFACTS_IDENTIFIED');
    Badges.removedBadges.add('ALL_POTIONS_IDENTIFIED');
    Badges.removedBadges.add('ALL_SCROLLS_IDENTIFIED');
    Badges.removedBadges.add('ALL_ITEMS_IDENTIFIED');
    Badges.renamedBadges = new HashMap();
    Badges.firstBossClassBadges = new LinkedHashMap();
    Badges.firstBossClassBadges.put(HeroClass.WARRIOR, Badges$Badge.BOSS_SLAIN_1_WARRIOR);
    Badges.firstBossClassBadges.put(HeroClass.MAGE, Badges$Badge.BOSS_SLAIN_1_MAGE);
    Badges.firstBossClassBadges.put(HeroClass.ROGUE, Badges$Badge.BOSS_SLAIN_1_ROGUE);
    Badges.firstBossClassBadges.put(HeroClass.HUNTRESS, Badges$Badge.BOSS_SLAIN_1_HUNTRESS);
    Badges.firstBossClassBadges.put(HeroClass.DUELIST, Badges$Badge.BOSS_SLAIN_1_DUELIST);
    Badges.firstBossClassBadges.put(HeroClass.CLERIC, Badges$Badge.BOSS_SLAIN_1_CLERIC);
    Badges.victoryClassBadges = new LinkedHashMap();
    Badges.victoryClassBadges.put(HeroClass.WARRIOR, Badges$Badge.VICTORY_WARRIOR);
    Badges.victoryClassBadges.put(HeroClass.MAGE, Badges$Badge.VICTORY_MAGE);
    Badges.victoryClassBadges.put(HeroClass.ROGUE, Badges$Badge.VICTORY_ROGUE);
    Badges.victoryClassBadges.put(HeroClass.HUNTRESS, Badges$Badge.VICTORY_HUNTRESS);
    Badges.victoryClassBadges.put(HeroClass.DUELIST, Badges$Badge.VICTORY_DUELIST);
    Badges.victoryClassBadges.put(HeroClass.CLERIC, Badges$Badge.VICTORY_CLERIC);
    Badges.thirdBossSubclassBadges = new LinkedHashMap();
    Badges.thirdBossSubclassBadges.put(HeroSubClass.BERSERKER, Badges$Badge.BOSS_SLAIN_3_BERSERKER);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.GLADIATOR, Badges$Badge.BOSS_SLAIN_3_GLADIATOR);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.BATTLEMAGE, Badges$Badge.BOSS_SLAIN_3_BATTLEMAGE);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.WARLOCK, Badges$Badge.BOSS_SLAIN_3_WARLOCK);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.ASSASSIN, Badges$Badge.BOSS_SLAIN_3_ASSASSIN);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.FREERUNNER, Badges$Badge.BOSS_SLAIN_3_FREERUNNER);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.SNIPER, Badges$Badge.BOSS_SLAIN_3_SNIPER);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.WARDEN, Badges$Badge.BOSS_SLAIN_3_WARDEN);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.CHAMPION, Badges$Badge.BOSS_SLAIN_3_CHAMPION);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.MONK, Badges$Badge.BOSS_SLAIN_3_MONK);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.PRIEST, Badges$Badge.BOSS_SLAIN_3_PRIEST);
    Badges.thirdBossSubclassBadges.put(HeroSubClass.PALADIN, Badges$Badge.BOSS_SLAIN_3_PALADIN);
    Badges.tierBadgeReplacements = [[Badges$Badge.MONSTERS_SLAIN_1, Badges$Badge.MONSTERS_SLAIN_2, Badges$Badge.MONSTERS_SLAIN_3, Badges$Badge.MONSTERS_SLAIN_4, Badges$Badge.MONSTERS_SLAIN_5], [Badges$Badge.GOLD_COLLECTED_1, Badges$Badge.GOLD_COLLECTED_2, Badges$Badge.GOLD_COLLECTED_3, Badges$Badge.GOLD_COLLECTED_4, Badges$Badge.GOLD_COLLECTED_5], [Badges$Badge.ITEM_LEVEL_1, Badges$Badge.ITEM_LEVEL_2, Badges$Badge.ITEM_LEVEL_3, Badges$Badge.ITEM_LEVEL_4, Badges$Badge.ITEM_LEVEL_5], [Badges$Badge.LEVEL_REACHED_1, Badges$Badge.LEVEL_REACHED_2, Badges$Badge.LEVEL_REACHED_3, Badges$Badge.LEVEL_REACHED_4, Badges$Badge.LEVEL_REACHED_5], [Badges$Badge.STRENGTH_ATTAINED_1, Badges$Badge.STRENGTH_ATTAINED_2, Badges$Badge.STRENGTH_ATTAINED_3, Badges$Badge.STRENGTH_ATTAINED_4, Badges$Badge.STRENGTH_ATTAINED_5], [Badges$Badge.FOOD_EATEN_1, Badges$Badge.FOOD_EATEN_2, Badges$Badge.FOOD_EATEN_3, Badges$Badge.FOOD_EATEN_4, Badges$Badge.FOOD_EATEN_5], [Badges$Badge.ITEMS_CRAFTED_1, Badges$Badge.ITEMS_CRAFTED_2, Badges$Badge.ITEMS_CRAFTED_3, Badges$Badge.ITEMS_CRAFTED_4, Badges$Badge.ITEMS_CRAFTED_5], [Badges$Badge.BOSS_SLAIN_1, Badges$Badge.BOSS_SLAIN_2, Badges$Badge.BOSS_SLAIN_3, Badges$Badge.BOSS_SLAIN_4], [Badges$Badge.RESEARCHER_1, Badges$Badge.RESEARCHER_2, Badges$Badge.RESEARCHER_3, Badges$Badge.RESEARCHER_4, Badges$Badge.RESEARCHER_5], [Badges$Badge.HIGH_SCORE_1, Badges$Badge.HIGH_SCORE_2, Badges$Badge.HIGH_SCORE_3, Badges$Badge.HIGH_SCORE_4, Badges$Badge.HIGH_SCORE_5], [Badges$Badge.GAMES_PLAYED_1, Badges$Badge.GAMES_PLAYED_2, Badges$Badge.GAMES_PLAYED_3, Badges$Badge.GAMES_PLAYED_4, Badges$Badge.GAMES_PLAYED_5], [Badges$Badge.CHAMPION_1, Badges$Badge.CHAMPION_2, Badges$Badge.CHAMPION_3]];
    Badges.prerequisiteBadges = [[Badges$Badge.BOSS_SLAIN_1, Badges$Badge.BOSS_CHALLENGE_1], [Badges$Badge.BOSS_SLAIN_2, Badges$Badge.BOSS_CHALLENGE_2], [Badges$Badge.BOSS_SLAIN_3, Badges$Badge.BOSS_CHALLENGE_3], [Badges$Badge.BOSS_SLAIN_4, Badges$Badge.BOSS_CHALLENGE_4], [Badges$Badge.VICTORY, Badges$Badge.BOSS_CHALLENGE_5], [Badges$Badge.HAPPY_END, Badges$Badge.PACIFIST_ASCENT], [Badges$Badge.VICTORY, Badges$Badge.TAKING_THE_MICK]];
    Badges.summaryBadgeReplacements = [[Badges$Badge.DEATH_FROM_FIRE, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_GAS, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_HUNGER, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_POISON, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_FALLING, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_ENEMY_MAGIC, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_FRIENDLY_MAGIC, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_SACRIFICE, Badges$Badge.DEATH_FROM_ALL], [Badges$Badge.DEATH_FROM_GRIM_TRAP, Badges$Badge.DEATH_FROM_ALL]];
  }
}

export class Badges$BadgeType extends JEnum {
  static HIDDEN: Badges$BadgeType = null;
  static LOCAL: Badges$BadgeType = null;
  static GLOBAL: Badges$BadgeType = null;
  static JOURNAL: Badges$BadgeType = null;
  static $VALUES: Badges$BadgeType[] = null;
  _Badges$BadgeType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Badges$BadgeType[] { return Badges$BadgeType.$VALUES.slice(); }
  static valueOf(name: string): Badges$BadgeType { return $J.enumValueOf(Badges$BadgeType, name); }
  static $clinit() {
    Badges$BadgeType.HIDDEN = new Badges$BadgeType()._Badges$BadgeType('HIDDEN', 0);
    Badges$BadgeType.LOCAL = new Badges$BadgeType()._Badges$BadgeType('LOCAL', 1);
    Badges$BadgeType.GLOBAL = new Badges$BadgeType()._Badges$BadgeType('GLOBAL', 2);
    Badges$BadgeType.JOURNAL = new Badges$BadgeType()._Badges$BadgeType('JOURNAL', 3);
    Badges$BadgeType.$VALUES = [Badges$BadgeType.HIDDEN, Badges$BadgeType.LOCAL, Badges$BadgeType.GLOBAL, Badges$BadgeType.JOURNAL];
  }
}

export class Badges$Badge extends JEnum {
  meta: boolean = false;
  image_: number = 0;
  type_: Badges$BadgeType = null;
  static MASTERY_WARRIOR: Badges$Badge = null;
  static MASTERY_MAGE: Badges$Badge = null;
  static MASTERY_ROGUE: Badges$Badge = null;
  static MASTERY_HUNTRESS: Badges$Badge = null;
  static MASTERY_DUELIST: Badges$Badge = null;
  static MASTERY_CLERIC: Badges$Badge = null;
  static FOUND_RATMOGRIFY: Badges$Badge = null;
  static UNLOCK_MAGE: Badges$Badge = null;
  static UNLOCK_ROGUE: Badges$Badge = null;
  static UNLOCK_HUNTRESS: Badges$Badge = null;
  static UNLOCK_DUELIST: Badges$Badge = null;
  static UNLOCK_CLERIC: Badges$Badge = null;
  static MONSTERS_SLAIN_1: Badges$Badge = null;
  static MONSTERS_SLAIN_2: Badges$Badge = null;
  static GOLD_COLLECTED_1: Badges$Badge = null;
  static GOLD_COLLECTED_2: Badges$Badge = null;
  static ITEM_LEVEL_1: Badges$Badge = null;
  static LEVEL_REACHED_1: Badges$Badge = null;
  static STRENGTH_ATTAINED_1: Badges$Badge = null;
  static FOOD_EATEN_1: Badges$Badge = null;
  static ITEMS_CRAFTED_1: Badges$Badge = null;
  static BOSS_SLAIN_1: Badges$Badge = null;
  static CATALOG_ONE_EQUIPMENT: Badges$Badge = null;
  static DEATH_FROM_FIRE: Badges$Badge = null;
  static DEATH_FROM_POISON: Badges$Badge = null;
  static DEATH_FROM_GAS: Badges$Badge = null;
  static DEATH_FROM_HUNGER: Badges$Badge = null;
  static DEATH_FROM_FALLING: Badges$Badge = null;
  static RESEARCHER_1: Badges$Badge = null;
  static GAMES_PLAYED_1: Badges$Badge = null;
  static HIGH_SCORE_1: Badges$Badge = null;
  static NO_MONSTERS_SLAIN: Badges$Badge = null;
  static BOSS_SLAIN_REMAINS: Badges$Badge = null;
  static MONSTERS_SLAIN_3: Badges$Badge = null;
  static MONSTERS_SLAIN_4: Badges$Badge = null;
  static GOLD_COLLECTED_3: Badges$Badge = null;
  static GOLD_COLLECTED_4: Badges$Badge = null;
  static ITEM_LEVEL_2: Badges$Badge = null;
  static ITEM_LEVEL_3: Badges$Badge = null;
  static LEVEL_REACHED_2: Badges$Badge = null;
  static LEVEL_REACHED_3: Badges$Badge = null;
  static STRENGTH_ATTAINED_2: Badges$Badge = null;
  static STRENGTH_ATTAINED_3: Badges$Badge = null;
  static FOOD_EATEN_2: Badges$Badge = null;
  static FOOD_EATEN_3: Badges$Badge = null;
  static ITEMS_CRAFTED_2: Badges$Badge = null;
  static ITEMS_CRAFTED_3: Badges$Badge = null;
  static BOSS_SLAIN_2: Badges$Badge = null;
  static BOSS_SLAIN_3: Badges$Badge = null;
  static CATALOG_POTIONS_SCROLLS: Badges$Badge = null;
  static DEATH_FROM_ENEMY_MAGIC: Badges$Badge = null;
  static DEATH_FROM_FRIENDLY_MAGIC: Badges$Badge = null;
  static DEATH_FROM_SACRIFICE: Badges$Badge = null;
  static BOSS_SLAIN_1_WARRIOR: Badges$Badge = null;
  static BOSS_SLAIN_1_MAGE: Badges$Badge = null;
  static BOSS_SLAIN_1_ROGUE: Badges$Badge = null;
  static BOSS_SLAIN_1_HUNTRESS: Badges$Badge = null;
  static BOSS_SLAIN_1_DUELIST: Badges$Badge = null;
  static BOSS_SLAIN_1_CLERIC: Badges$Badge = null;
  static BOSS_SLAIN_1_ALL_CLASSES: Badges$Badge = null;
  static RESEARCHER_2: Badges$Badge = null;
  static GAMES_PLAYED_2: Badges$Badge = null;
  static HIGH_SCORE_2: Badges$Badge = null;
  static ENEMY_HAZARDS: Badges$Badge = null;
  static PIRANHAS: Badges$Badge = null;
  static GRIM_WEAPON: Badges$Badge = null;
  static BAG_BOUGHT_VELVET_POUCH: Badges$Badge = null;
  static BAG_BOUGHT_SCROLL_HOLDER: Badges$Badge = null;
  static BAG_BOUGHT_POTION_BANDOLIER: Badges$Badge = null;
  static BAG_BOUGHT_MAGICAL_HOLSTER: Badges$Badge = null;
  static ALL_BAGS_BOUGHT: Badges$Badge = null;
  static MASTERY_COMBO: Badges$Badge = null;
  static MONSTERS_SLAIN_5: Badges$Badge = null;
  static GOLD_COLLECTED_5: Badges$Badge = null;
  static ITEM_LEVEL_4: Badges$Badge = null;
  static LEVEL_REACHED_4: Badges$Badge = null;
  static STRENGTH_ATTAINED_4: Badges$Badge = null;
  static STRENGTH_ATTAINED_5: Badges$Badge = null;
  static FOOD_EATEN_4: Badges$Badge = null;
  static FOOD_EATEN_5: Badges$Badge = null;
  static ITEMS_CRAFTED_4: Badges$Badge = null;
  static ITEMS_CRAFTED_5: Badges$Badge = null;
  static BOSS_SLAIN_4: Badges$Badge = null;
  static ALL_RARE_ENEMIES: Badges$Badge = null;
  static DEATH_FROM_GRIM_TRAP: Badges$Badge = null;
  static VICTORY: Badges$Badge = null;
  static BOSS_CHALLENGE_1: Badges$Badge = null;
  static BOSS_CHALLENGE_2: Badges$Badge = null;
  static RESEARCHER_3: Badges$Badge = null;
  static GAMES_PLAYED_3: Badges$Badge = null;
  static HIGH_SCORE_3: Badges$Badge = null;
  static MANY_BUFFS: Badges$Badge = null;
  static ITEM_LEVEL_5: Badges$Badge = null;
  static LEVEL_REACHED_5: Badges$Badge = null;
  static HAPPY_END: Badges$Badge = null;
  static VICTORY_RANDOM: Badges$Badge = null;
  static HAPPY_END_REMAINS: Badges$Badge = null;
  static RODNEY: Badges$Badge = null;
  static VICTORY_WARRIOR: Badges$Badge = null;
  static VICTORY_MAGE: Badges$Badge = null;
  static VICTORY_ROGUE: Badges$Badge = null;
  static VICTORY_HUNTRESS: Badges$Badge = null;
  static VICTORY_DUELIST: Badges$Badge = null;
  static VICTORY_CLERIC: Badges$Badge = null;
  static VICTORY_ALL_CLASSES: Badges$Badge = null;
  static DEATH_FROM_ALL: Badges$Badge = null;
  static BOSS_SLAIN_3_GLADIATOR: Badges$Badge = null;
  static BOSS_SLAIN_3_BERSERKER: Badges$Badge = null;
  static BOSS_SLAIN_3_WARLOCK: Badges$Badge = null;
  static BOSS_SLAIN_3_BATTLEMAGE: Badges$Badge = null;
  static BOSS_SLAIN_3_FREERUNNER: Badges$Badge = null;
  static BOSS_SLAIN_3_ASSASSIN: Badges$Badge = null;
  static BOSS_SLAIN_3_SNIPER: Badges$Badge = null;
  static BOSS_SLAIN_3_WARDEN: Badges$Badge = null;
  static BOSS_SLAIN_3_CHAMPION: Badges$Badge = null;
  static BOSS_SLAIN_3_MONK: Badges$Badge = null;
  static BOSS_SLAIN_3_PRIEST: Badges$Badge = null;
  static BOSS_SLAIN_3_PALADIN: Badges$Badge = null;
  static BOSS_SLAIN_3_ALL_SUBCLASSES: Badges$Badge = null;
  static BOSS_CHALLENGE_3: Badges$Badge = null;
  static BOSS_CHALLENGE_4: Badges$Badge = null;
  static RESEARCHER_4: Badges$Badge = null;
  static GAMES_PLAYED_4: Badges$Badge = null;
  static HIGH_SCORE_4: Badges$Badge = null;
  static CHAMPION_1: Badges$Badge = null;
  static PACIFIST_ASCENT: Badges$Badge = null;
  static TAKING_THE_MICK: Badges$Badge = null;
  static BOSS_CHALLENGE_5: Badges$Badge = null;
  static RESEARCHER_5: Badges$Badge = null;
  static GAMES_PLAYED_5: Badges$Badge = null;
  static HIGH_SCORE_5: Badges$Badge = null;
  static CHAMPION_2: Badges$Badge = null;
  static CHAMPION_3: Badges$Badge = null;
  static $VALUES: Badges$Badge[] = null;
  _Badges$Badge$($name: string, $ordinal: number): this {
    this._Badges$Badge$int$BadgeType($name, $ordinal, -1, Badges$BadgeType.HIDDEN);
    return this;
  }
  _Badges$Badge$int($name: string, $ordinal: number, image: number): this {
    this._Badges$Badge$int$BadgeType($name, $ordinal, image, Badges$BadgeType.LOCAL);
    return this;
  }
  _Badges$Badge$int$BadgeType($name: string, $ordinal: number, image: number, type$: Badges$BadgeType): this {
    this._JEnum($name, $ordinal);
    this.image_ = image;
    this.type_ = type$;
    return this;
  }
  title(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.title', []);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', []);
  }
  static values(): Badges$Badge[] { return Badges$Badge.$VALUES.slice(); }
  static valueOf(name: string): Badges$Badge { return $J.enumValueOf(Badges$Badge, name); }
  static $clinit() {
    Badges$Badge.MASTERY_WARRIOR = new Badges$Badge()._Badges$Badge$('MASTERY_WARRIOR', 0);
    Badges$Badge.MASTERY_MAGE = new Badges$Badge()._Badges$Badge$('MASTERY_MAGE', 1);
    Badges$Badge.MASTERY_ROGUE = new Badges$Badge()._Badges$Badge$('MASTERY_ROGUE', 2);
    Badges$Badge.MASTERY_HUNTRESS = new Badges$Badge()._Badges$Badge$('MASTERY_HUNTRESS', 3);
    Badges$Badge.MASTERY_DUELIST = new Badges$Badge()._Badges$Badge$('MASTERY_DUELIST', 4);
    Badges$Badge.MASTERY_CLERIC = new Badges$Badge()._Badges$Badge$('MASTERY_CLERIC', 5);
    Badges$Badge.FOUND_RATMOGRIFY = new Badges$Badge()._Badges$Badge$('FOUND_RATMOGRIFY', 6);
    Badges$Badge.UNLOCK_MAGE = new Badges$Badge()._Badges$Badge$int('UNLOCK_MAGE', 7, 1);
    Badges$Badge.UNLOCK_ROGUE = new Badges$Badge()._Badges$Badge$int('UNLOCK_ROGUE', 8, 2);
    Badges$Badge.UNLOCK_HUNTRESS = new Badges$Badge()._Badges$Badge$int('UNLOCK_HUNTRESS', 9, 3);
    Badges$Badge.UNLOCK_DUELIST = new Badges$Badge()._Badges$Badge$int('UNLOCK_DUELIST', 10, 4);
    Badges$Badge.UNLOCK_CLERIC = new Badges$Badge()._Badges$Badge$int('UNLOCK_CLERIC', 11, 5);
    Badges$Badge.MONSTERS_SLAIN_1 = new Badges$Badge()._Badges$Badge$int('MONSTERS_SLAIN_1', 12, 6);
    Badges$Badge.MONSTERS_SLAIN_2 = new Badges$Badge()._Badges$Badge$int('MONSTERS_SLAIN_2', 13, 7);
    Badges$Badge.GOLD_COLLECTED_1 = new Badges$Badge()._Badges$Badge$int('GOLD_COLLECTED_1', 14, 8);
    Badges$Badge.GOLD_COLLECTED_2 = new Badges$Badge()._Badges$Badge$int('GOLD_COLLECTED_2', 15, 9);
    Badges$Badge.ITEM_LEVEL_1 = new Badges$Badge()._Badges$Badge$int('ITEM_LEVEL_1', 16, 10);
    Badges$Badge.LEVEL_REACHED_1 = new Badges$Badge()._Badges$Badge$int('LEVEL_REACHED_1', 17, 11);
    Badges$Badge.STRENGTH_ATTAINED_1 = new Badges$Badge()._Badges$Badge$int('STRENGTH_ATTAINED_1', 18, 12);
    Badges$Badge.FOOD_EATEN_1 = new Badges$Badge()._Badges$Badge$int('FOOD_EATEN_1', 19, 13);
    Badges$Badge.ITEMS_CRAFTED_1 = new Badges$Badge()._Badges$Badge$int('ITEMS_CRAFTED_1', 20, 14);
    Badges$Badge.BOSS_SLAIN_1 = new Badges$Badge()._Badges$Badge$int('BOSS_SLAIN_1', 21, 15);
    Badges$Badge.CATALOG_ONE_EQUIPMENT = new Badges$Badge()._Badges$Badge$int$BadgeType('CATALOG_ONE_EQUIPMENT', 22, 16, Badges$BadgeType.JOURNAL);
    Badges$Badge.DEATH_FROM_FIRE = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_FIRE', 23, 17);
    Badges$Badge.DEATH_FROM_POISON = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_POISON', 24, 18);
    Badges$Badge.DEATH_FROM_GAS = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_GAS', 25, 19);
    Badges$Badge.DEATH_FROM_HUNGER = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_HUNGER', 26, 20);
    Badges$Badge.DEATH_FROM_FALLING = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_FALLING', 27, 21);
    Badges$Badge.RESEARCHER_1 = new Badges$Badge()._Badges$Badge$int$BadgeType('RESEARCHER_1', 28, 22, Badges$BadgeType.JOURNAL);
    Badges$Badge.GAMES_PLAYED_1 = new Badges$Badge()._Badges$Badge$int$BadgeType('GAMES_PLAYED_1', 29, 23, Badges$BadgeType.GLOBAL);
    Badges$Badge.HIGH_SCORE_1 = new Badges$Badge()._Badges$Badge$int('HIGH_SCORE_1', 30, 24);
    Badges$Badge.NO_MONSTERS_SLAIN = new Badges$Badge()._Badges$Badge$int('NO_MONSTERS_SLAIN', 31, 32);
    Badges$Badge.BOSS_SLAIN_REMAINS = new Badges$Badge()._Badges$Badge$int('BOSS_SLAIN_REMAINS', 32, 33);
    Badges$Badge.MONSTERS_SLAIN_3 = new Badges$Badge()._Badges$Badge$int('MONSTERS_SLAIN_3', 33, 34);
    Badges$Badge.MONSTERS_SLAIN_4 = new Badges$Badge()._Badges$Badge$int('MONSTERS_SLAIN_4', 34, 35);
    Badges$Badge.GOLD_COLLECTED_3 = new Badges$Badge()._Badges$Badge$int('GOLD_COLLECTED_3', 35, 36);
    Badges$Badge.GOLD_COLLECTED_4 = new Badges$Badge()._Badges$Badge$int('GOLD_COLLECTED_4', 36, 37);
    Badges$Badge.ITEM_LEVEL_2 = new Badges$Badge()._Badges$Badge$int('ITEM_LEVEL_2', 37, 38);
    Badges$Badge.ITEM_LEVEL_3 = new Badges$Badge()._Badges$Badge$int('ITEM_LEVEL_3', 38, 39);
    Badges$Badge.LEVEL_REACHED_2 = new Badges$Badge()._Badges$Badge$int('LEVEL_REACHED_2', 39, 40);
    Badges$Badge.LEVEL_REACHED_3 = new Badges$Badge()._Badges$Badge$int('LEVEL_REACHED_3', 40, 41);
    Badges$Badge.STRENGTH_ATTAINED_2 = new Badges$Badge()._Badges$Badge$int('STRENGTH_ATTAINED_2', 41, 42);
    Badges$Badge.STRENGTH_ATTAINED_3 = new Badges$Badge()._Badges$Badge$int('STRENGTH_ATTAINED_3', 42, 43);
    Badges$Badge.FOOD_EATEN_2 = new Badges$Badge()._Badges$Badge$int('FOOD_EATEN_2', 43, 44);
    Badges$Badge.FOOD_EATEN_3 = new Badges$Badge()._Badges$Badge$int('FOOD_EATEN_3', 44, 45);
    Badges$Badge.ITEMS_CRAFTED_2 = new Badges$Badge()._Badges$Badge$int('ITEMS_CRAFTED_2', 45, 46);
    Badges$Badge.ITEMS_CRAFTED_3 = new Badges$Badge()._Badges$Badge$int('ITEMS_CRAFTED_3', 46, 47);
    Badges$Badge.BOSS_SLAIN_2 = new Badges$Badge()._Badges$Badge$int('BOSS_SLAIN_2', 47, 48);
    Badges$Badge.BOSS_SLAIN_3 = new Badges$Badge()._Badges$Badge$int('BOSS_SLAIN_3', 48, 49);
    Badges$Badge.CATALOG_POTIONS_SCROLLS = new Badges$Badge()._Badges$Badge$int('CATALOG_POTIONS_SCROLLS', 49, 50);
    Badges$Badge.DEATH_FROM_ENEMY_MAGIC = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_ENEMY_MAGIC', 50, 51);
    Badges$Badge.DEATH_FROM_FRIENDLY_MAGIC = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_FRIENDLY_MAGIC', 51, 52);
    Badges$Badge.DEATH_FROM_SACRIFICE = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_SACRIFICE', 52, 53);
    Badges$Badge.BOSS_SLAIN_1_WARRIOR = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_1_WARRIOR', 53);
    Badges$Badge.BOSS_SLAIN_1_MAGE = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_1_MAGE', 54);
    Badges$Badge.BOSS_SLAIN_1_ROGUE = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_1_ROGUE', 55);
    Badges$Badge.BOSS_SLAIN_1_HUNTRESS = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_1_HUNTRESS', 56);
    Badges$Badge.BOSS_SLAIN_1_DUELIST = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_1_DUELIST', 57);
    Badges$Badge.BOSS_SLAIN_1_CLERIC = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_1_CLERIC', 58);
    Badges$Badge.BOSS_SLAIN_1_ALL_CLASSES = new Badges$Badge()._Badges$Badge$int$BadgeType('BOSS_SLAIN_1_ALL_CLASSES', 59, 54, Badges$BadgeType.GLOBAL);
    Badges$Badge.RESEARCHER_2 = new Badges$Badge()._Badges$Badge$int$BadgeType('RESEARCHER_2', 60, 55, Badges$BadgeType.JOURNAL);
    Badges$Badge.GAMES_PLAYED_2 = new Badges$Badge()._Badges$Badge$int$BadgeType('GAMES_PLAYED_2', 61, 56, Badges$BadgeType.GLOBAL);
    Badges$Badge.HIGH_SCORE_2 = new Badges$Badge()._Badges$Badge$int('HIGH_SCORE_2', 62, 57);
    Badges$Badge.ENEMY_HAZARDS = new Badges$Badge()._Badges$Badge$int('ENEMY_HAZARDS', 63, 64);
    Badges$Badge.PIRANHAS = new Badges$Badge()._Badges$Badge$int('PIRANHAS', 64, 65);
    Badges$Badge.GRIM_WEAPON = new Badges$Badge()._Badges$Badge$int('GRIM_WEAPON', 65, 66);
    Badges$Badge.BAG_BOUGHT_VELVET_POUCH = new Badges$Badge()._Badges$Badge$('BAG_BOUGHT_VELVET_POUCH', 66);
    Badges$Badge.BAG_BOUGHT_SCROLL_HOLDER = new Badges$Badge()._Badges$Badge$('BAG_BOUGHT_SCROLL_HOLDER', 67);
    Badges$Badge.BAG_BOUGHT_POTION_BANDOLIER = new Badges$Badge()._Badges$Badge$('BAG_BOUGHT_POTION_BANDOLIER', 68);
    Badges$Badge.BAG_BOUGHT_MAGICAL_HOLSTER = new Badges$Badge()._Badges$Badge$('BAG_BOUGHT_MAGICAL_HOLSTER', 69);
    Badges$Badge.ALL_BAGS_BOUGHT = new Badges$Badge()._Badges$Badge$int('ALL_BAGS_BOUGHT', 70, 67);
    Badges$Badge.MASTERY_COMBO = new Badges$Badge()._Badges$Badge$int('MASTERY_COMBO', 71, 68);
    Badges$Badge.MONSTERS_SLAIN_5 = new Badges$Badge()._Badges$Badge$int('MONSTERS_SLAIN_5', 72, 69);
    Badges$Badge.GOLD_COLLECTED_5 = new Badges$Badge()._Badges$Badge$int('GOLD_COLLECTED_5', 73, 70);
    Badges$Badge.ITEM_LEVEL_4 = new Badges$Badge()._Badges$Badge$int('ITEM_LEVEL_4', 74, 71);
    Badges$Badge.LEVEL_REACHED_4 = new Badges$Badge()._Badges$Badge$int('LEVEL_REACHED_4', 75, 72);
    Badges$Badge.STRENGTH_ATTAINED_4 = new Badges$Badge()._Badges$Badge$int('STRENGTH_ATTAINED_4', 76, 73);
    Badges$Badge.STRENGTH_ATTAINED_5 = new Badges$Badge()._Badges$Badge$int('STRENGTH_ATTAINED_5', 77, 74);
    Badges$Badge.FOOD_EATEN_4 = new Badges$Badge()._Badges$Badge$int('FOOD_EATEN_4', 78, 75);
    Badges$Badge.FOOD_EATEN_5 = new Badges$Badge()._Badges$Badge$int('FOOD_EATEN_5', 79, 76);
    Badges$Badge.ITEMS_CRAFTED_4 = new Badges$Badge()._Badges$Badge$int('ITEMS_CRAFTED_4', 80, 77);
    Badges$Badge.ITEMS_CRAFTED_5 = new Badges$Badge()._Badges$Badge$int('ITEMS_CRAFTED_5', 81, 78);
    Badges$Badge.BOSS_SLAIN_4 = new Badges$Badge()._Badges$Badge$int('BOSS_SLAIN_4', 82, 79);
    Badges$Badge.ALL_RARE_ENEMIES = new Badges$Badge()._Badges$Badge$int$BadgeType('ALL_RARE_ENEMIES', 83, 80, Badges$BadgeType.JOURNAL);
    Badges$Badge.DEATH_FROM_GRIM_TRAP = new Badges$Badge()._Badges$Badge$int('DEATH_FROM_GRIM_TRAP', 84, 81);
    Badges$Badge.VICTORY = new Badges$Badge()._Badges$Badge$int('VICTORY', 85, 82);
    Badges$Badge.BOSS_CHALLENGE_1 = new Badges$Badge()._Badges$Badge$int('BOSS_CHALLENGE_1', 86, 83);
    Badges$Badge.BOSS_CHALLENGE_2 = new Badges$Badge()._Badges$Badge$int('BOSS_CHALLENGE_2', 87, 84);
    Badges$Badge.RESEARCHER_3 = new Badges$Badge()._Badges$Badge$int$BadgeType('RESEARCHER_3', 88, 85, Badges$BadgeType.JOURNAL);
    Badges$Badge.GAMES_PLAYED_3 = new Badges$Badge()._Badges$Badge$int$BadgeType('GAMES_PLAYED_3', 89, 86, Badges$BadgeType.GLOBAL);
    Badges$Badge.HIGH_SCORE_3 = new Badges$Badge()._Badges$Badge$int('HIGH_SCORE_3', 90, 87);
    Badges$Badge.MANY_BUFFS = new Badges$Badge()._Badges$Badge$int('MANY_BUFFS', 91, 96);
    Badges$Badge.ITEM_LEVEL_5 = new Badges$Badge()._Badges$Badge$int('ITEM_LEVEL_5', 92, 97);
    Badges$Badge.LEVEL_REACHED_5 = new Badges$Badge()._Badges$Badge$int('LEVEL_REACHED_5', 93, 98);
    Badges$Badge.HAPPY_END = new Badges$Badge()._Badges$Badge$int('HAPPY_END', 94, 99);
    Badges$Badge.VICTORY_RANDOM = new Badges$Badge()._Badges$Badge$int('VICTORY_RANDOM', 95, 100);
    Badges$Badge.HAPPY_END_REMAINS = new Badges$Badge()._Badges$Badge$int('HAPPY_END_REMAINS', 96, 101);
    Badges$Badge.RODNEY = new Badges$Badge()._Badges$Badge$int$BadgeType('RODNEY', 97, 102, Badges$BadgeType.JOURNAL);
    Badges$Badge.VICTORY_WARRIOR = new Badges$Badge()._Badges$Badge$('VICTORY_WARRIOR', 98);
    Badges$Badge.VICTORY_MAGE = new Badges$Badge()._Badges$Badge$('VICTORY_MAGE', 99);
    Badges$Badge.VICTORY_ROGUE = new Badges$Badge()._Badges$Badge$('VICTORY_ROGUE', 100);
    Badges$Badge.VICTORY_HUNTRESS = new Badges$Badge()._Badges$Badge$('VICTORY_HUNTRESS', 101);
    Badges$Badge.VICTORY_DUELIST = new Badges$Badge()._Badges$Badge$('VICTORY_DUELIST', 102);
    Badges$Badge.VICTORY_CLERIC = new Badges$Badge()._Badges$Badge$('VICTORY_CLERIC', 103);
    Badges$Badge.VICTORY_ALL_CLASSES = new Badges$Badge()._Badges$Badge$int$BadgeType('VICTORY_ALL_CLASSES', 104, 103, Badges$BadgeType.GLOBAL);
    Badges$Badge.DEATH_FROM_ALL = new Badges$Badge()._Badges$Badge$int$BadgeType('DEATH_FROM_ALL', 105, 104, Badges$BadgeType.GLOBAL);
    Badges$Badge.BOSS_SLAIN_3_GLADIATOR = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_GLADIATOR', 106);
    Badges$Badge.BOSS_SLAIN_3_BERSERKER = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_BERSERKER', 107);
    Badges$Badge.BOSS_SLAIN_3_WARLOCK = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_WARLOCK', 108);
    Badges$Badge.BOSS_SLAIN_3_BATTLEMAGE = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_BATTLEMAGE', 109);
    Badges$Badge.BOSS_SLAIN_3_FREERUNNER = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_FREERUNNER', 110);
    Badges$Badge.BOSS_SLAIN_3_ASSASSIN = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_ASSASSIN', 111);
    Badges$Badge.BOSS_SLAIN_3_SNIPER = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_SNIPER', 112);
    Badges$Badge.BOSS_SLAIN_3_WARDEN = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_WARDEN', 113);
    Badges$Badge.BOSS_SLAIN_3_CHAMPION = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_CHAMPION', 114);
    Badges$Badge.BOSS_SLAIN_3_MONK = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_MONK', 115);
    Badges$Badge.BOSS_SLAIN_3_PRIEST = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_PRIEST', 116);
    Badges$Badge.BOSS_SLAIN_3_PALADIN = new Badges$Badge()._Badges$Badge$('BOSS_SLAIN_3_PALADIN', 117);
    Badges$Badge.BOSS_SLAIN_3_ALL_SUBCLASSES = new Badges$Badge()._Badges$Badge$int$BadgeType('BOSS_SLAIN_3_ALL_SUBCLASSES', 118, 105, Badges$BadgeType.GLOBAL);
    Badges$Badge.BOSS_CHALLENGE_3 = new Badges$Badge()._Badges$Badge$int('BOSS_CHALLENGE_3', 119, 106);
    Badges$Badge.BOSS_CHALLENGE_4 = new Badges$Badge()._Badges$Badge$int('BOSS_CHALLENGE_4', 120, 107);
    Badges$Badge.RESEARCHER_4 = new Badges$Badge()._Badges$Badge$int$BadgeType('RESEARCHER_4', 121, 108, Badges$BadgeType.JOURNAL);
    Badges$Badge.GAMES_PLAYED_4 = new Badges$Badge()._Badges$Badge$int$BadgeType('GAMES_PLAYED_4', 122, 109, Badges$BadgeType.GLOBAL);
    Badges$Badge.HIGH_SCORE_4 = new Badges$Badge()._Badges$Badge$int('HIGH_SCORE_4', 123, 110);
    Badges$Badge.CHAMPION_1 = new Badges$Badge()._Badges$Badge$int('CHAMPION_1', 124, 111);
    Badges$Badge.PACIFIST_ASCENT = new Badges$Badge()._Badges$Badge$int('PACIFIST_ASCENT', 125, 120);
    Badges$Badge.TAKING_THE_MICK = new Badges$Badge()._Badges$Badge$int('TAKING_THE_MICK', 126, 121);
    Badges$Badge.BOSS_CHALLENGE_5 = new Badges$Badge()._Badges$Badge$int('BOSS_CHALLENGE_5', 127, 122);
    Badges$Badge.RESEARCHER_5 = new Badges$Badge()._Badges$Badge$int$BadgeType('RESEARCHER_5', 128, 123, Badges$BadgeType.JOURNAL);
    Badges$Badge.GAMES_PLAYED_5 = new Badges$Badge()._Badges$Badge$int$BadgeType('GAMES_PLAYED_5', 129, 124, Badges$BadgeType.GLOBAL);
    Badges$Badge.HIGH_SCORE_5 = new Badges$Badge()._Badges$Badge$int('HIGH_SCORE_5', 130, 125);
    Badges$Badge.CHAMPION_2 = new Badges$Badge()._Badges$Badge$int('CHAMPION_2', 131, 126);
    Badges$Badge.CHAMPION_3 = new Badges$Badge()._Badges$Badge$int('CHAMPION_3', 132, 127);
    Badges$Badge.$VALUES = [Badges$Badge.MASTERY_WARRIOR, Badges$Badge.MASTERY_MAGE, Badges$Badge.MASTERY_ROGUE, Badges$Badge.MASTERY_HUNTRESS, Badges$Badge.MASTERY_DUELIST, Badges$Badge.MASTERY_CLERIC, Badges$Badge.FOUND_RATMOGRIFY, Badges$Badge.UNLOCK_MAGE, Badges$Badge.UNLOCK_ROGUE, Badges$Badge.UNLOCK_HUNTRESS, Badges$Badge.UNLOCK_DUELIST, Badges$Badge.UNLOCK_CLERIC, Badges$Badge.MONSTERS_SLAIN_1, Badges$Badge.MONSTERS_SLAIN_2, Badges$Badge.GOLD_COLLECTED_1, Badges$Badge.GOLD_COLLECTED_2, Badges$Badge.ITEM_LEVEL_1, Badges$Badge.LEVEL_REACHED_1, Badges$Badge.STRENGTH_ATTAINED_1, Badges$Badge.FOOD_EATEN_1, Badges$Badge.ITEMS_CRAFTED_1, Badges$Badge.BOSS_SLAIN_1, Badges$Badge.CATALOG_ONE_EQUIPMENT, Badges$Badge.DEATH_FROM_FIRE, Badges$Badge.DEATH_FROM_POISON, Badges$Badge.DEATH_FROM_GAS, Badges$Badge.DEATH_FROM_HUNGER, Badges$Badge.DEATH_FROM_FALLING, Badges$Badge.RESEARCHER_1, Badges$Badge.GAMES_PLAYED_1, Badges$Badge.HIGH_SCORE_1, Badges$Badge.NO_MONSTERS_SLAIN, Badges$Badge.BOSS_SLAIN_REMAINS, Badges$Badge.MONSTERS_SLAIN_3, Badges$Badge.MONSTERS_SLAIN_4, Badges$Badge.GOLD_COLLECTED_3, Badges$Badge.GOLD_COLLECTED_4, Badges$Badge.ITEM_LEVEL_2, Badges$Badge.ITEM_LEVEL_3, Badges$Badge.LEVEL_REACHED_2, Badges$Badge.LEVEL_REACHED_3, Badges$Badge.STRENGTH_ATTAINED_2, Badges$Badge.STRENGTH_ATTAINED_3, Badges$Badge.FOOD_EATEN_2, Badges$Badge.FOOD_EATEN_3, Badges$Badge.ITEMS_CRAFTED_2, Badges$Badge.ITEMS_CRAFTED_3, Badges$Badge.BOSS_SLAIN_2, Badges$Badge.BOSS_SLAIN_3, Badges$Badge.CATALOG_POTIONS_SCROLLS, Badges$Badge.DEATH_FROM_ENEMY_MAGIC, Badges$Badge.DEATH_FROM_FRIENDLY_MAGIC, Badges$Badge.DEATH_FROM_SACRIFICE, Badges$Badge.BOSS_SLAIN_1_WARRIOR, Badges$Badge.BOSS_SLAIN_1_MAGE, Badges$Badge.BOSS_SLAIN_1_ROGUE, Badges$Badge.BOSS_SLAIN_1_HUNTRESS, Badges$Badge.BOSS_SLAIN_1_DUELIST, Badges$Badge.BOSS_SLAIN_1_CLERIC, Badges$Badge.BOSS_SLAIN_1_ALL_CLASSES, Badges$Badge.RESEARCHER_2, Badges$Badge.GAMES_PLAYED_2, Badges$Badge.HIGH_SCORE_2, Badges$Badge.ENEMY_HAZARDS, Badges$Badge.PIRANHAS, Badges$Badge.GRIM_WEAPON, Badges$Badge.BAG_BOUGHT_VELVET_POUCH, Badges$Badge.BAG_BOUGHT_SCROLL_HOLDER, Badges$Badge.BAG_BOUGHT_POTION_BANDOLIER, Badges$Badge.BAG_BOUGHT_MAGICAL_HOLSTER, Badges$Badge.ALL_BAGS_BOUGHT, Badges$Badge.MASTERY_COMBO, Badges$Badge.MONSTERS_SLAIN_5, Badges$Badge.GOLD_COLLECTED_5, Badges$Badge.ITEM_LEVEL_4, Badges$Badge.LEVEL_REACHED_4, Badges$Badge.STRENGTH_ATTAINED_4, Badges$Badge.STRENGTH_ATTAINED_5, Badges$Badge.FOOD_EATEN_4, Badges$Badge.FOOD_EATEN_5, Badges$Badge.ITEMS_CRAFTED_4, Badges$Badge.ITEMS_CRAFTED_5, Badges$Badge.BOSS_SLAIN_4, Badges$Badge.ALL_RARE_ENEMIES, Badges$Badge.DEATH_FROM_GRIM_TRAP, Badges$Badge.VICTORY, Badges$Badge.BOSS_CHALLENGE_1, Badges$Badge.BOSS_CHALLENGE_2, Badges$Badge.RESEARCHER_3, Badges$Badge.GAMES_PLAYED_3, Badges$Badge.HIGH_SCORE_3, Badges$Badge.MANY_BUFFS, Badges$Badge.ITEM_LEVEL_5, Badges$Badge.LEVEL_REACHED_5, Badges$Badge.HAPPY_END, Badges$Badge.VICTORY_RANDOM, Badges$Badge.HAPPY_END_REMAINS, Badges$Badge.RODNEY, Badges$Badge.VICTORY_WARRIOR, Badges$Badge.VICTORY_MAGE, Badges$Badge.VICTORY_ROGUE, Badges$Badge.VICTORY_HUNTRESS, Badges$Badge.VICTORY_DUELIST, Badges$Badge.VICTORY_CLERIC, Badges$Badge.VICTORY_ALL_CLASSES, Badges$Badge.DEATH_FROM_ALL, Badges$Badge.BOSS_SLAIN_3_GLADIATOR, Badges$Badge.BOSS_SLAIN_3_BERSERKER, Badges$Badge.BOSS_SLAIN_3_WARLOCK, Badges$Badge.BOSS_SLAIN_3_BATTLEMAGE, Badges$Badge.BOSS_SLAIN_3_FREERUNNER, Badges$Badge.BOSS_SLAIN_3_ASSASSIN, Badges$Badge.BOSS_SLAIN_3_SNIPER, Badges$Badge.BOSS_SLAIN_3_WARDEN, Badges$Badge.BOSS_SLAIN_3_CHAMPION, Badges$Badge.BOSS_SLAIN_3_MONK, Badges$Badge.BOSS_SLAIN_3_PRIEST, Badges$Badge.BOSS_SLAIN_3_PALADIN, Badges$Badge.BOSS_SLAIN_3_ALL_SUBCLASSES, Badges$Badge.BOSS_CHALLENGE_3, Badges$Badge.BOSS_CHALLENGE_4, Badges$Badge.RESEARCHER_4, Badges$Badge.GAMES_PLAYED_4, Badges$Badge.HIGH_SCORE_4, Badges$Badge.CHAMPION_1, Badges$Badge.PACIFIST_ASCENT, Badges$Badge.TAKING_THE_MICK, Badges$Badge.BOSS_CHALLENGE_5, Badges$Badge.RESEARCHER_5, Badges$Badge.GAMES_PLAYED_5, Badges$Badge.HIGH_SCORE_5, Badges$Badge.CHAMPION_2, Badges$Badge.CHAMPION_3];
  }
}

$J.define(Badges, 'com.shatteredpixel.shatteredpixeldungeon.Badges', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Badges' }, meths: { 'filterReplacedBadges(java.util.List)': 'filterReplacedBadges$List', 'filterReplacedBadges(boolean)': 'filterReplacedBadges$boolean', 'saveGlobal(boolean)': 'saveGlobal$boolean', 'saveGlobal()': 'saveGlobal$' }, clinit: true, lazy: ['global', 'local', 'saveNeeded', 'removedBadges', 'renamedBadges', 'firstBossClassBadges', 'victoryClassBadges', 'thirdBossSubclassBadges', 'tierBadgeReplacements', 'prerequisiteBadges', 'summaryBadgeReplacements'] });
$J.define(Badges$BadgeType, 'com.shatteredpixel.shatteredpixeldungeon.Badges$BadgeType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Badges$BadgeType' }, clinit: true, lazy: ['$VALUES', 'HIDDEN', 'LOCAL', 'GLOBAL', 'JOURNAL'] });
$J.define(Badges$Badge, 'com.shatteredpixel.shatteredpixeldungeon.Badges$Badge', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int,com.shatteredpixel.shatteredpixeldungeon.Badges$BadgeType': '_Badges$Badge$int$BadgeType', 'int': '_Badges$Badge$int', '': '_Badges$Badge$' }, clinit: true, lazy: ['$VALUES', 'MASTERY_WARRIOR', 'MASTERY_MAGE', 'MASTERY_ROGUE', 'MASTERY_HUNTRESS', 'MASTERY_DUELIST', 'MASTERY_CLERIC', 'FOUND_RATMOGRIFY', 'UNLOCK_MAGE', 'UNLOCK_ROGUE', 'UNLOCK_HUNTRESS', 'UNLOCK_DUELIST', 'UNLOCK_CLERIC', 'MONSTERS_SLAIN_1', 'MONSTERS_SLAIN_2', 'GOLD_COLLECTED_1', 'GOLD_COLLECTED_2', 'ITEM_LEVEL_1', 'LEVEL_REACHED_1', 'STRENGTH_ATTAINED_1', 'FOOD_EATEN_1', 'ITEMS_CRAFTED_1', 'BOSS_SLAIN_1', 'CATALOG_ONE_EQUIPMENT', 'DEATH_FROM_FIRE', 'DEATH_FROM_POISON', 'DEATH_FROM_GAS', 'DEATH_FROM_HUNGER', 'DEATH_FROM_FALLING', 'RESEARCHER_1', 'GAMES_PLAYED_1', 'HIGH_SCORE_1', 'NO_MONSTERS_SLAIN', 'BOSS_SLAIN_REMAINS', 'MONSTERS_SLAIN_3', 'MONSTERS_SLAIN_4', 'GOLD_COLLECTED_3', 'GOLD_COLLECTED_4', 'ITEM_LEVEL_2', 'ITEM_LEVEL_3', 'LEVEL_REACHED_2', 'LEVEL_REACHED_3', 'STRENGTH_ATTAINED_2', 'STRENGTH_ATTAINED_3', 'FOOD_EATEN_2', 'FOOD_EATEN_3', 'ITEMS_CRAFTED_2', 'ITEMS_CRAFTED_3', 'BOSS_SLAIN_2', 'BOSS_SLAIN_3', 'CATALOG_POTIONS_SCROLLS', 'DEATH_FROM_ENEMY_MAGIC', 'DEATH_FROM_FRIENDLY_MAGIC', 'DEATH_FROM_SACRIFICE', 'BOSS_SLAIN_1_WARRIOR', 'BOSS_SLAIN_1_MAGE', 'BOSS_SLAIN_1_ROGUE', 'BOSS_SLAIN_1_HUNTRESS', 'BOSS_SLAIN_1_DUELIST', 'BOSS_SLAIN_1_CLERIC', 'BOSS_SLAIN_1_ALL_CLASSES', 'RESEARCHER_2', 'GAMES_PLAYED_2', 'HIGH_SCORE_2', 'ENEMY_HAZARDS', 'PIRANHAS', 'GRIM_WEAPON', 'BAG_BOUGHT_VELVET_POUCH', 'BAG_BOUGHT_SCROLL_HOLDER', 'BAG_BOUGHT_POTION_BANDOLIER', 'BAG_BOUGHT_MAGICAL_HOLSTER', 'ALL_BAGS_BOUGHT', 'MASTERY_COMBO', 'MONSTERS_SLAIN_5', 'GOLD_COLLECTED_5', 'ITEM_LEVEL_4', 'LEVEL_REACHED_4', 'STRENGTH_ATTAINED_4', 'STRENGTH_ATTAINED_5', 'FOOD_EATEN_4', 'FOOD_EATEN_5', 'ITEMS_CRAFTED_4', 'ITEMS_CRAFTED_5', 'BOSS_SLAIN_4', 'ALL_RARE_ENEMIES', 'DEATH_FROM_GRIM_TRAP', 'VICTORY', 'BOSS_CHALLENGE_1', 'BOSS_CHALLENGE_2', 'RESEARCHER_3', 'GAMES_PLAYED_3', 'HIGH_SCORE_3', 'MANY_BUFFS', 'ITEM_LEVEL_5', 'LEVEL_REACHED_5', 'HAPPY_END', 'VICTORY_RANDOM', 'HAPPY_END_REMAINS', 'RODNEY', 'VICTORY_WARRIOR', 'VICTORY_MAGE', 'VICTORY_ROGUE', 'VICTORY_HUNTRESS', 'VICTORY_DUELIST', 'VICTORY_CLERIC', 'VICTORY_ALL_CLASSES', 'DEATH_FROM_ALL', 'BOSS_SLAIN_3_GLADIATOR', 'BOSS_SLAIN_3_BERSERKER', 'BOSS_SLAIN_3_WARLOCK', 'BOSS_SLAIN_3_BATTLEMAGE', 'BOSS_SLAIN_3_FREERUNNER', 'BOSS_SLAIN_3_ASSASSIN', 'BOSS_SLAIN_3_SNIPER', 'BOSS_SLAIN_3_WARDEN', 'BOSS_SLAIN_3_CHAMPION', 'BOSS_SLAIN_3_MONK', 'BOSS_SLAIN_3_PRIEST', 'BOSS_SLAIN_3_PALADIN', 'BOSS_SLAIN_3_ALL_SUBCLASSES', 'BOSS_CHALLENGE_3', 'BOSS_CHALLENGE_4', 'RESEARCHER_4', 'GAMES_PLAYED_4', 'HIGH_SCORE_4', 'CHAMPION_1', 'PACIFIST_ASCENT', 'TAKING_THE_MICK', 'BOSS_CHALLENGE_5', 'RESEARCHER_5', 'GAMES_PLAYED_5', 'HIGH_SCORE_5', 'CHAMPION_2', 'CHAMPION_3'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  PotionBandolier = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.PotionBandolier');
  ScrollHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.ScrollHolder');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  RemainsItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Explosive$ExplosiveCurseBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Explosive$ExplosiveCurseBomb');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
});
