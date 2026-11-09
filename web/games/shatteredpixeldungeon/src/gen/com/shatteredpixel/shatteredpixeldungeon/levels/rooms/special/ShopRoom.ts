// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/special/ShopRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, RuntimeException } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from './SpecialRoom.ts';

let Dungeon, Dungeon$LimitedDrops, Shopkeeper, Ankh, Generator, Generator$Category, Heap$Type, Honeypot, Stylus, Torch, LeatherArmor, MailArmor, PlateArmor, ScaleArmor, TimekeepersHourglass, TimekeepersHourglass$sandBag, MagicalHolster, PotionBandolier, ScrollHolder, VelvetPouch, Bomb, Bomb$DoubleBomb, SmallRation, PotionOfHealing, ScrollOfIdentify, ScrollOfMagicMapping, ScrollOfRemoveCurse, Alchemize, StoneOfAugmentation, TippedDart, Level, Terrain, Painter, Room$Door$Type, GameScene, Game, Point, Random;

export class ShopRoom extends SpecialRoom {
  itemsToSpawn: ArrayList<Item> = null;
  _ShopRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(7, $J.d2i((Math.sqrt(this.spacesNeeded()) + 3)));
  }
  minHeight(): number {
    return Math.max(7, $J.d2i((Math.sqrt(this.spacesNeeded()) + 3)));
  }
  spacesNeeded(): number {
    if (this.itemsToSpawn == null) {
      this.itemsToSpawn = ShopRoom.generateItems();
    }
    let spacesNeeded = this.itemsToSpawn.size();
    for (const $it0 = this.itemsToSpawn.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof TimekeepersHourglass$sandBag) {
        spacesNeeded--;
      }
    }
    spacesNeeded = (spacesNeeded + 4) | 0;
    spacesNeeded++;
    return spacesNeeded;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY_SP);
    this.placeShopkeeper(level);
    this.placeItems(level);
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let door = $it1.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
  }
  placeShopkeeper(level: Level): void {
    let pos = level.pointToCell(this.center());
    let shopkeeper = new Shopkeeper()._Shopkeeper();
    shopkeeper.pos = pos;
    level.mobs.add(shopkeeper);
  }
  placeItems(level: Level): void {
    if (this.itemsToSpawn == null) {
      this.itemsToSpawn = ShopRoom.generateItems();
    }
    let entryInset = new Point()._Point$Point(this.entrance());
    if (entryInset.y === this.top_) {
      entryInset.y++;
    } else if (entryInset.y === this.bottom_) {
      entryInset.y--;
    } else if (entryInset.x === this.left_) {
      entryInset.x++;
    } else {
      entryInset.x--;
    }
    let curItemPlace = entryInset.clone();
    let inset = 1;
    for (let item of $J.toArrayInto(this.itemsToSpawn.toArray(), $J.newArray(0, null))) {
      if (curItemPlace.x === ((this.left_ + inset) | 0) && curItemPlace.y !== ((this.top_ + inset) | 0)) {
        curItemPlace.y--;
      } else if (curItemPlace.y === ((this.top_ + inset) | 0) && curItemPlace.x !== ((this.right_ - inset) | 0)) {
        curItemPlace.x++;
      } else if (curItemPlace.x === ((this.right_ - inset) | 0) && curItemPlace.y !== ((this.bottom_ - inset) | 0)) {
        curItemPlace.y++;
      } else {
        curItemPlace.x--;
      }
      if (curItemPlace.equals(entryInset)) {
        if (entryInset.y === ((this.top_ + inset) | 0)) {
          entryInset.y++;
        } else if (entryInset.y === ((this.bottom_ - inset) | 0)) {
          entryInset.y--;
        }
        if (entryInset.x === ((this.left_ + inset) | 0)) {
          entryInset.x++;
        } else if (entryInset.x === ((this.right_ - inset) | 0)) {
          entryInset.x--;
        }
        inset++;
        if (inset > $J.idiv(((Math.min(this.width(), this.height()) - 3) | 0), 2)) {
          break;
        }
        curItemPlace = entryInset.clone();
        if (curItemPlace.x === ((this.left_ + inset) | 0) && curItemPlace.y !== ((this.top_ + inset) | 0)) {
          curItemPlace.y--;
        } else if (curItemPlace.y === ((this.top_ + inset) | 0) && curItemPlace.x !== ((this.right_ - inset) | 0)) {
          curItemPlace.x++;
        } else if (curItemPlace.x === ((this.right_ - inset) | 0) && curItemPlace.y !== ((this.bottom_ - inset) | 0)) {
          curItemPlace.y++;
        } else {
          curItemPlace.x--;
        }
      }
      let cell = level.pointToCell(curItemPlace);
      if (level.map_[cell] === Terrain.HIGH_GRASS) {
        Level.set$int$int$Level(cell, Terrain.GRASS, level);
        GameScene.updateMap$int(cell);
      }
      level.drop(item, cell).type_ = Heap$Type.FOR_SALE;
      this.itemsToSpawn.remove(item);
    }
    if (!this.itemsToSpawn.isEmpty()) {
      for (const $it2 = this.getPoints().iterator(); $it2.hasNext(); ) {
        let p = $it2.next();
        let cell = level.pointToCell(p);
        if ((level.map_[cell] === Terrain.EMPTY_SP || level.map_[cell] === Terrain.EMPTY) && level.heaps.get(cell) == null && level.findMob(cell) == null) {
          level.drop(this.itemsToSpawn.removeAt(0), level.pointToCell(p)).type_ = Heap$Type.FOR_SALE;
        }
        if (this.itemsToSpawn.isEmpty()) {
          break;
        }
      }
    }
    if (!this.itemsToSpawn.isEmpty()) {
      Game.reportException(new RuntimeException('failed to place all items in a shop!'));
    }
  }
  static generateItems(): ArrayList<Item> {
    let itemsToSpawn = new ArrayList();
    let w: MeleeWeapon;
    let m: MissileWeapon;
    switch (Dungeon.depth) {
      case 6:
      default:
        w = Generator.random$Category(Generator.wepTiers[1]);
        m = Generator.random$Category(Generator.misTiers[1]);
        itemsToSpawn.add(new LeatherArmor()._LeatherArmor().identify$boolean(false));
        break;
      case 11:
        w = Generator.random$Category(Generator.wepTiers[2]);
        m = Generator.random$Category(Generator.misTiers[2]);
        itemsToSpawn.add(new MailArmor()._MailArmor().identify$boolean(false));
        break;
      case 16:
        w = Generator.random$Category(Generator.wepTiers[3]);
        m = Generator.random$Category(Generator.misTiers[3]);
        itemsToSpawn.add(new ScaleArmor()._ScaleArmor().identify$boolean(false));
        break;
      case 20:
      case 21:
        w = Generator.random$Category(Generator.wepTiers[4]);
        m = Generator.random$Category(Generator.misTiers[4]);
        itemsToSpawn.add(new PlateArmor()._PlateArmor().identify$boolean(false));
        itemsToSpawn.add(new Torch()._Torch());
        itemsToSpawn.add(new Torch()._Torch());
        itemsToSpawn.add(new Torch()._Torch());
        break;
    }
    w.enchant$Enchantment(null);
    w.cursed = false;
    w.level$int(0);
    w.identify$boolean(false);
    itemsToSpawn.add(w);
    m.enchant$Enchantment(null);
    m.cursed = false;
    m.level$int(0);
    m.identify$boolean(false);
    itemsToSpawn.add(m);
    itemsToSpawn.add(TippedDart.randomTipped(2));
    itemsToSpawn.add(new Alchemize()._Alchemize().quantity$int(Random.IntRange(2, 3)));
    let bag = ShopRoom.ChooseBag(Dungeon.hero.belongings);
    if (bag != null) {
      itemsToSpawn.add(bag);
    }
    itemsToSpawn.add(new PotionOfHealing()._PotionOfHealing());
    itemsToSpawn.add(Generator.randomUsingDefaults$Category(Generator$Category.POTION));
    itemsToSpawn.add(Generator.randomUsingDefaults$Category(Generator$Category.POTION));
    itemsToSpawn.add(new ScrollOfIdentify()._ScrollOfIdentify());
    itemsToSpawn.add(new ScrollOfRemoveCurse()._ScrollOfRemoveCurse());
    itemsToSpawn.add(new ScrollOfMagicMapping()._ScrollOfMagicMapping());
    for (let i = 0; i < 2; i++) {
      itemsToSpawn.add(Random.Int$int(2) === 0 ? Generator.randomUsingDefaults$Category(Generator$Category.POTION) : Generator.randomUsingDefaults$Category(Generator$Category.SCROLL));
    }
    itemsToSpawn.add(new SmallRation()._SmallRation());
    itemsToSpawn.add(new SmallRation()._SmallRation());
    switch (Random.Int$int(4)) {
      case 0:
        itemsToSpawn.add(new Bomb()._Bomb());
        break;
      case 1:
      case 2:
        itemsToSpawn.add(new Bomb$DoubleBomb()._Bomb$DoubleBomb());
        break;
      case 3:
        itemsToSpawn.add(new Honeypot()._Honeypot());
        break;
    }
    itemsToSpawn.add(new Ankh()._Ankh());
    itemsToSpawn.add(new StoneOfAugmentation()._StoneOfAugmentation());
    let hourglass = Dungeon.hero.belongings.getItem($J.cls(TimekeepersHourglass));
    if (hourglass != null && hourglass.isIdentified() && !hourglass.cursed) {
      let bags = 0;
      switch (Dungeon.depth) {
        case 6:
          bags = $J.d2i(Math.ceil(Math.fround(((5 - hourglass.sandBags) | 0) * Math.fround(0.2))));
          break;
        case 11:
          bags = $J.d2i(Math.ceil(Math.fround(((5 - hourglass.sandBags) | 0) * 0.25)));
          break;
        case 16:
          bags = $J.d2i(Math.ceil(Math.fround(((5 - hourglass.sandBags) | 0) * 0.5)));
          break;
        case 20:
        case 21:
          bags = $J.d2i(Math.ceil(Math.fround(((5 - hourglass.sandBags) | 0) * Math.fround(0.8))));
          break;
      }
      for (let i = 1; i <= bags; i++) {
        itemsToSpawn.add(new TimekeepersHourglass$sandBag()._TimekeepersHourglass$sandBag());
        hourglass.sandBags++;
      }
    }
    let rare: Item;
    switch (Random.Int$int(10)) {
      case 0:
        rare = Generator.random$Category(Generator$Category.WAND);
        rare.level$int(0);
        break;
      case 1:
        rare = Generator.random$Category(Generator$Category.RING);
        rare.level$int(0);
        break;
      case 2:
        rare = Generator.random$Category(Generator$Category.ARTIFACT);
        break;
      default:
        rare = new Stylus()._Stylus();
    }
    rare.cursed = false;
    rare.cursedKnown = true;
    itemsToSpawn.add(rare);
    Random.pushGenerator$long(Random.Long$());
    Random.shuffle$List(itemsToSpawn);
    Random.popGenerator();
    return itemsToSpawn;
  }
  static ChooseBag(pack: Belongings): Bag {
    let bags = new HashMap();
    if (!Dungeon$LimitedDrops.VELVET_POUCH.dropped()) {
      bags.put(new VelvetPouch()._VelvetPouch(), 1);
    }
    if (!Dungeon$LimitedDrops.SCROLL_HOLDER.dropped()) {
      bags.put(new ScrollHolder()._ScrollHolder(), 0);
    }
    if (!Dungeon$LimitedDrops.POTION_BANDOLIER.dropped()) {
      bags.put(new PotionBandolier()._PotionBandolier(), 0);
    }
    if (!Dungeon$LimitedDrops.MAGICAL_HOLSTER.dropped()) {
      bags.put(new MagicalHolster()._MagicalHolster(), 0);
    }
    if (bags.isEmpty()) {
      return null;
    }
    for (const $it3 = pack.backpack.items_.iterator(); $it3.hasNext(); ) {
      let item = $it3.next();
      for (const $it4 = bags.keySet().iterator(); $it4.hasNext(); ) {
        let bag = $it4.next();
        if (bag.canHold(item)) {
          bags.put(bag, (bags.get(bag) + 1) | 0);
        }
      }
    }
    let bestBag = null;
    for (const $it5 = bags.keySet().iterator(); $it5.hasNext(); ) {
      let bag = $it5.next();
      if (bestBag == null) {
        bestBag = bag;
      } else if (bags.get(bag) > bags.get(bestBag)) {
        bestBag = bag;
      }
    }
    if (bestBag instanceof VelvetPouch) {
      Dungeon$LimitedDrops.VELVET_POUCH.drop();
    } else if (bestBag instanceof ScrollHolder) {
      Dungeon$LimitedDrops.SCROLL_HOLDER.drop();
    } else if (bestBag instanceof PotionBandolier) {
      Dungeon$LimitedDrops.POTION_BANDOLIER.drop();
    } else if (bestBag instanceof MagicalHolster) {
      Dungeon$LimitedDrops.MAGICAL_HOLSTER.drop();
    }
    return bestBag;
  }
}

$J.define(ShopRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ShopRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_ShopRoom' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Shopkeeper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper');
  Ankh = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Ankh');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  Stylus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Stylus');
  Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Torch');
  LeatherArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.LeatherArmor');
  MailArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.MailArmor');
  PlateArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.PlateArmor');
  ScaleArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ScaleArmor');
  TimekeepersHourglass = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass');
  TimekeepersHourglass$sandBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$sandBag');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  PotionBandolier = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.PotionBandolier');
  ScrollHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.ScrollHolder');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Bomb$DoubleBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$DoubleBomb');
  SmallRation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.SmallRation');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  Alchemize = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize');
  StoneOfAugmentation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation');
  TippedDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Game = $J.load('com.watabou.noosa.Game');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
