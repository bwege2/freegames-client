// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfWealth.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Ring } from './Ring.ts';
import { Ring$RingBuff } from './Ring.ts';
import { CounterBuff } from '../../actors/buffs/CounterBuff.ts';

let Challenges, Dungeon, Buff, Flare, Generator, Generator$Category, Gold, Honeypot, Bomb, Bomb$DoubleBomb, PotionOfExperience, UnstableBrew, ExoticPotion, PotionOfDivineInspiration, ScrollOfTransmutation, ExoticScroll, ScrollOfMetamorphosis, UnstableSpell, StoneOfEnchantment, ExoticCrystals, Messages, ItemSpriteSheet$Icons, Random, Reflection;

export class RingOfWealth extends Ring {
  triesToDrop: number = 0;
  dropsToRare: number = 0;
  static readonly TRIES_TO_DROP: string = 'tries_to_drop';
  static readonly DROPS_TO_RARE: string = 'drops_to_rare';
  static latestDropTier: number = 0;
  _RingOfWealth(): this {
    this._Ring();
    this.icon_ = ItemSpriteSheet$Icons.RING_WEALTH;
    this.buffClass = $J.cls(RingOfWealth$Wealth);
    this.triesToDrop = Math.fround(1.4E-45);
    this.dropsToRare = -2147483648;
    return this;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      let info = Messages.get$Object$String$ObjectArr(this, 'stats', [Messages.decimalFormat('#.##', 100 * ($J.pow(Math.fround(1.2), this.soloBuffedBonus()) - 1))]);
      if (this.isEquipped(Dungeon.hero) && this.soloBuffedBonus() !== this.combinedBuffedBonus(Dungeon.hero)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'combined_stats', [Messages.decimalFormat('#.##', 100 * ($J.pow(Math.fround(1.2), this.combinedBuffedBonus(Dungeon.hero)) - 1))]);
      }
      return info;
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats', [Messages.decimalFormat('#.##', 20)]);
    }
  }
  upgradeStat1(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    return Messages.decimalFormat('#.##', 100 * (($J.pow(Math.fround(1.2), (level + 1) | 0)) - 1)) + '%';
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(RingOfWealth.TRIES_TO_DROP, this.triesToDrop);
    bundle.put$String$int(RingOfWealth.DROPS_TO_RARE, this.dropsToRare);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.triesToDrop = bundle.getFloat(RingOfWealth.TRIES_TO_DROP);
    this.dropsToRare = bundle.getInt(RingOfWealth.DROPS_TO_RARE);
  }
  buff(): Ring$RingBuff {
    return new RingOfWealth$Wealth().$o(this)._RingOfWealth$Wealth();
  }
  static dropChanceMultiplier(target: Char): number {
    return Math.fround($J.pow(1.2, Ring.getBuffedBonus(target, $J.cls(RingOfWealth$Wealth))));
  }
  static tryForBonusDrop(target: Char, tries: number): ArrayList<Item> {
    let bonus = Ring.getBuffedBonus(target, $J.cls(RingOfWealth$Wealth));
    if (bonus <= 0) {
      return null;
    }
    let triesToDrop = target.buff($J.cls(RingOfWealth$TriesToDropTracker));
    if (triesToDrop == null) {
      triesToDrop = Buff.affect$Char$Class(target, $J.cls(RingOfWealth$TriesToDropTracker));
      triesToDrop.countUp(Math.fround(Random.NormalIntRange(0, 20)));
    }
    let dropsToEquip = target.buff($J.cls(RingOfWealth$DropsToEquipTracker));
    if (dropsToEquip == null) {
      dropsToEquip = Buff.affect$Char$Class(target, $J.cls(RingOfWealth$DropsToEquipTracker));
      dropsToEquip.countUp(Math.fround(Random.NormalIntRange(5, 10)));
    }
    let drops = new ArrayList();
    triesToDrop.countDown(Math.fround(tries));
    while (triesToDrop.count() <= Math.fround(0)) {
      if (dropsToEquip.count() <= Math.fround(0)) {
        let equipBonus = 0;
        for (const $it0 = target.buffs$Class($J.cls(RingOfWealth$Wealth)).iterator(); $it0.hasNext(); ) {
          let w = $it0.next();
          if (w.buffedLvl() > equipBonus) {
            equipBonus = (w.buffedLvl() + Math.min(equipBonus, 2)) | 0;
          } else {
            equipBonus = (equipBonus + Math.min(w.buffedLvl(), 2)) | 0;
          }
        }
        let i: Item;
        do {
          i = RingOfWealth.genEquipmentDrop((equipBonus - 1) | 0);
        } while (Challenges.isItemBlocked(i));
        drops.add(i);
        dropsToEquip.countUp(Math.fround(Random.NormalIntRange(5, 10)));
      } else {
        let i: Item;
        do {
          i = RingOfWealth.genConsumableDrop((bonus - 1) | 0);
        } while (Challenges.isItemBlocked(i));
        drops.add(i);
        dropsToEquip.countDown(1);
      }
      triesToDrop.countUp(Math.fround(Random.NormalIntRange(0, 20)));
    }
    return drops;
  }
  static showFlareForBonusDrop(vis: Visual): void {
    if (vis == null || vis.parent == null) {
      return;
    }
    switch (RingOfWealth.latestDropTier) {
      default:
        break;
      case 1:
        new Flare()._Flare(6, 20).color$int$boolean(65280, true).show$Visual$float(vis, 3);
        break;
      case 2:
        new Flare()._Flare(6, 24).color$int$boolean(43775, true).show$Visual$float(vis, Math.fround(3.33));
        break;
      case 3:
        new Flare()._Flare(6, 28).color$int$boolean(11141375, true).show$Visual$float(vis, Math.fround(3.67));
        break;
      case 4:
        new Flare()._Flare(6, 32).color$int$boolean(16755200, true).show$Visual$float(vis, 4);
        break;
    }
    RingOfWealth.latestDropTier = 0;
  }
  static genConsumableDrop(level: number): Item {
    let roll = Random.Float$();
    if (roll < (Math.fround(Math.fround(0.6) - Math.fround(Math.fround(0.04) * level)))) {
      RingOfWealth.latestDropTier = 1;
      return RingOfWealth.genLowValueConsumable();
    } else if (roll < (Math.fround(Math.fround(0.9) - Math.fround(Math.fround(0.02) * level)))) {
      RingOfWealth.latestDropTier = 2;
      return RingOfWealth.genMidValueConsumable();
    } else {
      RingOfWealth.latestDropTier = 3;
      return RingOfWealth.genHighValueConsumable();
    }
  }
  static genLowValueConsumable(): Item {
    {
      let i: Item;
      switch (Random.Int$int(4)) {
        case 0:
        default:
          i = new Gold()._Gold$().random();
          return i.quantity$int($J.idiv(i.quantity$(), 2));
        case 1:
          return Generator.randomUsingDefaults$Category(Generator$Category.STONE);
        case 2:
          return Generator.randomUsingDefaults$Category(Generator$Category.POTION);
        case 3:
          return Generator.randomUsingDefaults$Category(Generator$Category.SCROLL);
      }
    }
  }
  static genMidValueConsumable(): Item {
    {
      let i: Item;
      switch (Random.Int$int(6)) {
        case 0:
        default:
          i = RingOfWealth.genLowValueConsumable();
          return i.quantity$int(Math.imul(i.quantity$(), 2));
        case 1:
          i = Generator.randomUsingDefaults$Category(Generator$Category.POTION);
          if (!(i instanceof ExoticPotion)) {
            return Reflection.newInstance(ExoticPotion.regToExo.get(i.getClass()));
          } else {
            return Reflection.newInstance(i.getClass());
          }
        case 2:
          i = Generator.randomUsingDefaults$Category(Generator$Category.SCROLL);
          if (!(i instanceof ExoticScroll)) {
            return Reflection.newInstance(ExoticScroll.regToExo.get(i.getClass()));
          } else {
            return Reflection.newInstance(i.getClass());
          }
        case 3:
          return Random.Int$int(2) === 0 ? new UnstableBrew()._UnstableBrew() : new UnstableSpell()._UnstableSpell();
        case 4:
          return new Bomb()._Bomb();
        case 5:
          return new Honeypot()._Honeypot();
      }
    }
  }
  static genHighValueConsumable(): Item {
    {
      let i: Item;
      switch (Random.Int$int(4)) {
        case 0:
        default:
          i = RingOfWealth.genMidValueConsumable();
          if (i instanceof Bomb) {
            return new Bomb$DoubleBomb()._Bomb$DoubleBomb();
          } else {
            return i.quantity$int(Math.imul(i.quantity$(), 2));
          }
        case 1:
          return new StoneOfEnchantment()._StoneOfEnchantment();
        case 2:
          return Random.Float$() < ExoticCrystals.consumableExoticChance$() ? new PotionOfDivineInspiration()._PotionOfDivineInspiration() : new PotionOfExperience()._PotionOfExperience();
        case 3:
          return Random.Float$() < ExoticCrystals.consumableExoticChance$() ? new ScrollOfMetamorphosis()._ScrollOfMetamorphosis() : new ScrollOfTransmutation()._ScrollOfTransmutation();
      }
    }
  }
  static genEquipmentDrop(level: number): Item {
    let result: Item;
    let floorset = $J.idiv(((Dungeon.depth + level) | 0), 5);
    {
      let w: Weapon, a: Armor;
      switch (Random.Int$int(5)) {
        default:
        case 0:
        case 1:
          w = Generator.randomWeapon$int$boolean(floorset, true);
          if (!w.hasGoodEnchant() && Random.Int$int(10) < level) {
            w.enchant$();
          } else if (w.hasCurseEnchant()) {
            w.enchant$Enchantment(null);
          }
          result = w;
          break;
        case 2:
          a = Generator.randomArmor$int(floorset);
          if (!a.hasGoodGlyph() && Random.Int$int(10) < level) {
            a.inscribe$();
          } else if (a.hasCurseGlyph()) {
            a.inscribe$Glyph(null);
          }
          result = a;
          break;
        case 3:
          result = Generator.randomUsingDefaults$Category(Generator$Category.RING);
          break;
        case 4:
          result = Generator.random$Category(Generator$Category.ARTIFACT);
          break;
      }
    }
    if (result.isUpgradable()) {
      let minLevel = $J.idiv(((level + 1) | 0), 2);
      if (result.level$() < minLevel) {
        result.level$int(minLevel);
      }
    }
    result.cursed = false;
    result.cursedKnown = true;
    if (result.level$() >= 2) {
      RingOfWealth.latestDropTier = 4;
    } else {
      RingOfWealth.latestDropTier = 3;
    }
    return result;
  }
  static $clinit() {
    RingOfWealth.latestDropTier = 0;
  }
}

export class RingOfWealth$Wealth extends Ring$RingBuff {
  _RingOfWealth$Wealth(): this {
    this._Ring$RingBuff();
    return this;
  }
}

export class RingOfWealth$TriesToDropTracker extends CounterBuff {
  _RingOfWealth$TriesToDropTracker(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

export class RingOfWealth$DropsToEquipTracker extends CounterBuff {
  _RingOfWealth$DropsToEquipTracker(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

$J.define(RingOfWealth, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', ctors: { '': '_RingOfWealth' }, clinit: true, lazy: ['latestDropTier'] });
$J.define(RingOfWealth$Wealth, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth$Wealth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', ctors: { '': '_RingOfWealth$Wealth' }, inner: true });
$J.define(RingOfWealth$TriesToDropTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth$TriesToDropTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_RingOfWealth$TriesToDropTracker' } });
$J.define(RingOfWealth$DropsToEquipTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfWealth$DropsToEquipTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_RingOfWealth$DropsToEquipTracker' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Bomb$DoubleBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$DoubleBomb');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  UnstableBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  PotionOfDivineInspiration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfDivineInspiration');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  ScrollOfMetamorphosis = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis');
  UnstableSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  ExoticCrystals = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ExoticCrystals');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
