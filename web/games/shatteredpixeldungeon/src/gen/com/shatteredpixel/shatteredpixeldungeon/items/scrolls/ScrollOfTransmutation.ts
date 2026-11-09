// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfTransmutation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { InventoryScroll } from './InventoryScroll.ts';

let Challenges, Dungeon, Statistics, Buff, Speck, Transmuting, Generator, Generator$Category, Item, KindOfWeapon, Artifact, DriedRose, Potion, Brew, Elixir, ExoticPotion, Pickaxe, Ring, Scroll, ExoticScroll, Runestone, Trinket, Wand, MagesStaff, MeleeWeapon, MissileWeapon, MissileWeapon$UpgradedSetTracker, Dart, TippedDart, Catalog, MiningLevel, Messages, Plant$Seed, ItemSpriteSheet$Icons, GLog, Reflection;

export class ScrollOfTransmutation extends InventoryScroll {
  _ScrollOfTransmutation(): this {
    this._InventoryScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_TRANSMUTE;
    this.bones = true;
    this.talentFactor = 2;
    return this;
  }
  usableOnItem(item: Item): boolean {
    if (item instanceof MeleeWeapon) {
      return !(item instanceof Pickaxe && Dungeon.level instanceof MiningLevel);
    } else if (item instanceof MissileWeapon) {
      return item.getClass() !== $J.cls(Dart);
    } else if (item instanceof Potion) {
      return !(item instanceof Elixir || item instanceof Brew);
    } else if (item instanceof Scroll) {
      return item !== this || item.quantity$() > 1 || InventoryScroll.identifiedByUse;
    } else if (item instanceof Artifact) {
      return !item.unique;
    } else {
      return item instanceof Ring || item instanceof Wand || item instanceof Trinket || item instanceof Plant$Seed || item instanceof Runestone;
    }
  }
  onItemSelected(item: Item): void {
    let result = ScrollOfTransmutation.changeItem(item);
    if (result == null) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'nothing', []), []);
      Item.curItem.collect$Bag(Item.curUser.belongings.backpack);
    } else {
      if (result !== item) {
        let slot = Dungeon.quickslot.getSlot(item);
        if (item.isEquipped(Dungeon.hero)) {
          item.cursed = false;
          if (item instanceof Artifact && result instanceof Ring) {
            (item).doUnequip$Hero$boolean(Dungeon.hero, false);
            if (!result.collect$()) {
              Dungeon.level.drop(result, Item.curUser.pos).sprite_.drop$();
            }
          } else if (item instanceof KindOfWeapon && Dungeon.hero.belongings.secondWep() === item) {
            (item).doUnequip$Hero$boolean(Dungeon.hero, false);
            (result).equipSecondary(Dungeon.hero);
          } else {
            (item).doUnequip$Hero$boolean(Dungeon.hero, false);
            (result).doEquip(Dungeon.hero);
          }
          Dungeon.hero.spend(Math.fround(-Dungeon.hero.cooldown()));
        } else {
          if (item instanceof MissileWeapon && !(item instanceof TippedDart)) {
            item.detachAll(Dungeon.hero.belongings.backpack);
          } else {
            item.detach(Dungeon.hero.belongings.backpack);
          }
          if (!result.collect$()) {
            Dungeon.level.drop(result, Item.curUser.pos).sprite_.drop$();
          } else if (result.stackable && Dungeon.hero.belongings.getSimilar(result) != null) {
            result = Dungeon.hero.belongings.getSimilar(result);
          }
        }
        if (slot !== -1 && result.defaultAction() != null && !Dungeon.quickslot.isNonePlaceholder(slot) && Dungeon.hero.belongings.contains(result)) {
          Dungeon.quickslot.setSlot(slot, result);
        }
      }
      if (result.isIdentified()) {
        Catalog.setSeen(result.getClass());
        Statistics.itemTypesDiscovered.add(result.getClass());
      }
      Transmuting.show$Char$Item$Item(Item.curUser, item, result);
      Item.curUser.sprite_.emitter().start(Speck.factory$int(Speck.CHANGE), Math.fround(0.2), 10);
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'morph', []), []);
    }
  }
  static changeItem(item: Item): Item {
    if (item instanceof MagesStaff) {
      return ScrollOfTransmutation.changeStaff(item);
    } else if (item instanceof TippedDart) {
      return ScrollOfTransmutation.changeTippedDart(item);
    } else if (item instanceof MeleeWeapon || item instanceof MissileWeapon) {
      return ScrollOfTransmutation.changeWeapon(item);
    } else if (item instanceof Scroll) {
      return ScrollOfTransmutation.changeScroll(item);
    } else if (item instanceof Potion) {
      return ScrollOfTransmutation.changePotion(item);
    } else if (item instanceof Ring) {
      return ScrollOfTransmutation.changeRing(item);
    } else if (item instanceof Wand) {
      return ScrollOfTransmutation.changeWand(item);
    } else if (item instanceof Plant$Seed) {
      return ScrollOfTransmutation.changeSeed(item);
    } else if (item instanceof Runestone) {
      return ScrollOfTransmutation.changeStone(item);
    } else if (item instanceof Artifact) {
      let a = ScrollOfTransmutation.changeArtifact(item);
      if (a == null) {
        let result = Generator.randomUsingDefaults$Category(Generator$Category.RING);
        result.levelKnown = item.levelKnown;
        result.cursed = item.cursed;
        result.cursedKnown = item.cursedKnown;
        if (item.visiblyUpgraded() === 10) {
          result.level$int(2);
        } else if (item.visiblyUpgraded() >= 5) {
          result.level$int(1);
        } else {
          result.level$int(0);
        }
        return result;
      } else {
        return a;
      }
    } else if (item instanceof Trinket) {
      return ScrollOfTransmutation.changeTrinket(item);
    } else {
      return null;
    }
  }
  static changeStaff(staff: MagesStaff): MagesStaff {
    let wandClass = staff.wandClass();
    if (wandClass == null) {
      return null;
    } else {
      let n: Wand;
      do {
        n = Generator.randomUsingDefaults$Category(Generator$Category.WAND);
      } while (Challenges.isItemBlocked(n) || n.getClass() === wandClass);
      n.cursed = false;
      n.level$int(0);
      n.identify$();
      staff.imbueWand(n, null);
    }
    return staff;
  }
  static changeTippedDart(dart: TippedDart): TippedDart {
    let n: TippedDart;
    do {
      n = TippedDart.randomTipped(1);
    } while (n.getClass() === dart.getClass());
    return n;
  }
  static changeWeapon(w: Weapon): Weapon {
    let n: Weapon;
    let c: Generator$Category;
    if (w instanceof MeleeWeapon) {
      c = Generator.wepTiers[((w).tier_ - 1) | 0];
    } else {
      c = Generator.misTiers[((w).tier_ - 1) | 0];
    }
    do {
      n = Generator.randomUsingDefaults$Category(c);
    } while (Challenges.isItemBlocked(n) || n.getClass() === w.getClass());
    n.level$int(0);
    n.quantity$int(w.quantity$());
    let level = w.trueLevel();
    if (level > 0) {
      n.upgrade$int(level);
    } else if (level < 0) {
      n.degrade$int(-level);
    }
    n.enchantment = w.enchantment;
    n.curseInfusionBonus = w.curseInfusionBonus;
    n.masteryPotionBonus = w.masteryPotionBonus;
    n.levelKnown = w.levelKnown;
    n.cursedKnown = w.cursedKnown;
    n.cursed = w.cursed;
    n.augment = w.augment;
    n.enchantHardened = w.enchantHardened;
    if (w instanceof MissileWeapon && w.isUpgradable()) {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(MissileWeapon$UpgradedSetTracker)).levelThresholds.put((w).setID, 2147483647);
      (n).damage(Math.fround(100 - (w).durabilityLeft()));
    }
    return n;
  }
  static changeRing(r: Ring): Ring {
    let n: Ring;
    do {
      n = Generator.randomUsingDefaults$Category(Generator$Category.RING);
    } while (Challenges.isItemBlocked(n) || n.getClass() === r.getClass());
    n.level$int(0);
    let level = r.level$();
    if (level > 0) {
      n.upgrade$int(level);
    } else if (level < 0) {
      n.degrade$int(-level);
    }
    n.levelKnown = r.levelKnown;
    n.cursedKnown = r.cursedKnown;
    n.cursed = r.cursed;
    return n;
  }
  static changeArtifact(a: Artifact): Artifact {
    let n: Artifact;
    do {
      n = Generator.randomArtifact();
    } while (n != null && (Challenges.isItemBlocked(n) || n.getClass() === a.getClass()));
    if (n != null) {
      if (a instanceof DriedRose) {
        if ((a).ghostWeapon() != null) {
          Dungeon.level.drop((a).ghostWeapon(), Dungeon.hero.pos);
        }
        if ((a).ghostArmor() != null) {
          Dungeon.level.drop((a).ghostArmor(), Dungeon.hero.pos);
        }
      }
      n.cursedKnown = a.cursedKnown;
      n.cursed = a.cursed;
      n.levelKnown = a.levelKnown;
      n.transferUpgrade(a.visiblyUpgraded());
      return n;
    }
    return null;
  }
  static changeTrinket(t: Trinket): Trinket {
    let n: Trinket;
    do {
      n = Generator.random$Category(Generator$Category.TRINKET);
    } while (Challenges.isItemBlocked(n) || n.getClass() === t.getClass());
    n.level$int(t.trueLevel());
    n.levelKnown = t.levelKnown;
    n.cursedKnown = t.cursedKnown;
    n.cursed = t.cursed;
    return n;
  }
  static changeWand(w: Wand): Wand {
    let n: Wand;
    do {
      n = Generator.randomUsingDefaults$Category(Generator$Category.WAND);
    } while (Challenges.isItemBlocked(n) || n.getClass() === w.getClass());
    n.level$int(0);
    let level = w.trueLevel();
    n.upgrade$int(level);
    n.levelKnown = w.levelKnown;
    n.curChargeKnown = w.curChargeKnown;
    n.cursedKnown = w.cursedKnown;
    n.cursed = w.cursed;
    n.curseInfusionBonus = w.curseInfusionBonus;
    n.resinBonus = w.resinBonus;
    n.curCharges = w.curCharges;
    n.updateLevel();
    return n;
  }
  static changeSeed(s: Plant$Seed): Plant$Seed {
    let n: Plant$Seed;
    do {
      n = Generator.randomUsingDefaults$Category(Generator$Category.SEED);
    } while (n.getClass() === s.getClass());
    return n;
  }
  static changeStone(r: Runestone): Runestone {
    let n: Runestone;
    do {
      n = Generator.randomUsingDefaults$Category(Generator$Category.STONE);
    } while (n.getClass() === r.getClass());
    return n;
  }
  static changeScroll(s: Scroll): Scroll {
    if (s instanceof ExoticScroll) {
      return Reflection.newInstance(ExoticScroll.exoToReg.get(s.getClass()));
    } else {
      return Reflection.newInstance(ExoticScroll.regToExo.get(s.getClass()));
    }
  }
  static changePotion(p: Potion): Potion {
    if (p instanceof ExoticPotion) {
      return Reflection.newInstance(ExoticPotion.exoToReg.get(p.getClass()));
    } else {
      return Reflection.newInstance(ExoticPotion.regToExo.get(p.getClass()));
    }
  }
  value(): number {
    return this.isKnown() ? Math.imul(50, this.quantity) : super.value();
  }
  energyVal(): number {
    return this.isKnown() ? Math.imul(10, this.quantity) : super.energyVal();
  }
}

$J.define(ScrollOfTransmutation, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll', ctors: { '': '_ScrollOfTransmutation' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Transmuting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Transmuting');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  KindOfWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.KindOfWeapon');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  DriedRose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Brew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew');
  Elixir = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.Elixir');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  MissileWeapon$UpgradedSetTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$UpgradedSetTracker');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
