// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/Belongings.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../jre/index.ts';
import { Bag } from '../../items/bags/Bag.ts';

let Badges, Dungeon, LostInventory, EquipableItem, Item, ClassArmor, Ring, ScrollOfRemoveCurse, ShardOfOblivion, Wand, Wand$Charger, Weapon, Messages, ItemSpriteSheet, GLog, Random;

export class Belongings extends JObject {
  owner: Hero = null;
  backpack: Belongings$Backpack = null;
  weapon_: KindOfWeapon = null;
  armor_: Armor = null;
  artifact_: Artifact = null;
  misc_: KindofMisc = null;
  ring_: Ring = null;
  thrownWeapon: KindOfWeapon = null;
  abilityWeapon: KindOfWeapon = null;
  secondWep_: KindOfWeapon = null;
  lostInvent: boolean = false;
  static readonly WEAPON: string = 'weapon';
  static readonly ARMOR: string = 'armor';
  static readonly ARTIFACT: string = 'artifact';
  static readonly MISC: string = 'misc';
  static readonly RING: string = 'ring';
  static readonly SECOND_WEP: string = 'second_wep';
  static bundleRestoring: boolean = false;
  _Belongings(owner: Hero): this {
    this.weapon_ = null;
    this.armor_ = null;
    this.artifact_ = null;
    this.misc_ = null;
    this.ring_ = null;
    this.thrownWeapon = null;
    this.abilityWeapon = null;
    this.secondWep_ = null;
    this.owner = owner;
    this.backpack = new Belongings$Backpack()._Belongings$Backpack();
    this.backpack.owner = owner;
    return this;
  }
  attackingWeapon(): KindOfWeapon {
    if (this.thrownWeapon != null) {
      return this.thrownWeapon;
    }
    if (this.abilityWeapon != null) {
      return this.abilityWeapon;
    }
    return this.weapon();
  }
  lostInventory$boolean(val: boolean): void {
    this.lostInvent = val;
  }
  lostInventory$(): boolean {
    return this.lostInvent;
  }
  weapon(): KindOfWeapon {
    if (!this.lostInventory$() || (this.weapon_ != null && this.weapon_.keptThroughLostInventory())) {
      return this.weapon_;
    } else {
      return null;
    }
  }
  armor(): Armor {
    if (!this.lostInventory$() || (this.armor_ != null && this.armor_.keptThroughLostInventory())) {
      return this.armor_;
    } else {
      return null;
    }
  }
  artifact(): Artifact {
    if (!this.lostInventory$() || (this.artifact_ != null && this.artifact_.keptThroughLostInventory())) {
      return this.artifact_;
    } else {
      return null;
    }
  }
  misc(): KindofMisc {
    if (!this.lostInventory$() || (this.misc_ != null && this.misc_.keptThroughLostInventory())) {
      return this.misc_;
    } else {
      return null;
    }
  }
  ring(): Ring {
    if (!this.lostInventory$() || (this.ring_ != null && this.ring_.keptThroughLostInventory())) {
      return this.ring_;
    } else {
      return null;
    }
  }
  secondWep(): KindOfWeapon {
    if (!this.lostInventory$() || (this.secondWep_ != null && this.secondWep_.keptThroughLostInventory())) {
      return this.secondWep_;
    } else {
      return null;
    }
  }
  storeInBundle(bundle: Bundle): void {
    this.backpack.storeInBundle(bundle);
    bundle.put$String$Bundlable(Belongings.WEAPON, this.weapon_);
    bundle.put$String$Bundlable(Belongings.ARMOR, this.armor_);
    bundle.put$String$Bundlable(Belongings.ARTIFACT, this.artifact_);
    bundle.put$String$Bundlable(Belongings.MISC, this.misc_);
    bundle.put$String$Bundlable(Belongings.RING, this.ring_);
    bundle.put$String$Bundlable(Belongings.SECOND_WEP, this.secondWep_);
  }
  restoreFromBundle(bundle: Bundle): void {
    Belongings.bundleRestoring = true;
    this.backpack.clear();
    this.backpack.restoreFromBundle(bundle);
    this.weapon_ = bundle.get$String(Belongings.WEAPON);
    if (this.weapon() != null) {
      this.weapon().activate(this.owner);
    }
    this.armor_ = bundle.get$String(Belongings.ARMOR);
    if (this.armor() != null) {
      this.armor().activate(this.owner);
    }
    this.artifact_ = bundle.get$String(Belongings.ARTIFACT);
    if (this.artifact() != null) {
      this.artifact().activate(this.owner);
    }
    this.misc_ = bundle.get$String(Belongings.MISC);
    if (this.misc() != null) {
      this.misc().activate(this.owner);
    }
    this.ring_ = bundle.get$String(Belongings.RING);
    if (this.ring() != null) {
      this.ring().activate(this.owner);
    }
    this.secondWep_ = bundle.get$String(Belongings.SECOND_WEP);
    if (this.secondWep() != null) {
      this.secondWep().activate(this.owner);
    }
    Belongings.bundleRestoring = false;
  }
  clear(): void {
    this.backpack.clear();
    this.weapon_ = this.secondWep_ = null;
    this.armor_ = null;
    this.artifact_ = null;
    this.misc_ = null;
    this.ring_ = null;
  }
  static preview(info: GamesInProgress$Info, bundle: Bundle): void {
    if (bundle.contains(Belongings.ARMOR)) {
      let armor = (bundle.get$String(Belongings.ARMOR));
      if (armor instanceof ClassArmor) {
        info.armorTier = 6;
      } else {
        info.armorTier = armor.tier_;
      }
    } else {
      info.armorTier = 0;
    }
  }
  getBags(): ArrayList<Bag> {
    let result = new ArrayList();
    result.add(this.backpack);
    for (const $it0 = this.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof Bag) {
        result.add(i);
      }
    }
    return result;
  }
  getItem<T>(itemClass: JClass<T>): T {
    let lostInvent = this.lostInventory$();
    for (const $it1 = this.iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      if (itemClass.isInstance(item)) {
        if (!lostInvent || item.keptThroughLostInventory()) {
          return item;
        }
      }
    }
    return null;
  }
  getAllItems<T>(itemClass: JClass<T>): ArrayList<T> {
    let result = new ArrayList();
    let lostInvent = this.lostInventory$();
    for (const $it2 = this.iterator(); $it2.hasNext(); ) {
      let item = $it2.next();
      if (itemClass.isInstance(item)) {
        if (!lostInvent || item.keptThroughLostInventory()) {
          result.add(item);
        }
      }
    }
    return result;
  }
  contains(contains: Item): boolean {
    let lostInvent = this.lostInventory$();
    for (const $it3 = this.iterator(); $it3.hasNext(); ) {
      let item = $it3.next();
      if (contains === item) {
        if (!lostInvent || item.keptThroughLostInventory()) {
          return true;
        }
      }
    }
    return false;
  }
  getSimilar(similar: Item): Item {
    let lostInvent = this.lostInventory$();
    for (const $it4 = this.iterator(); $it4.hasNext(); ) {
      let item = $it4.next();
      if (similar !== item && similar.isSimilar(item)) {
        if (!lostInvent || item.keptThroughLostInventory()) {
          return item;
        }
      }
    }
    return null;
  }
  getAllSimilar(similar: Item): ArrayList<Item> {
    let result = new ArrayList();
    let lostInvent = this.lostInventory$();
    for (const $it5 = this.iterator(); $it5.hasNext(); ) {
      let item = $it5.next();
      if (item !== similar && similar.isSimilar(item)) {
        if (!lostInvent || item.keptThroughLostInventory()) {
          result.add(item);
        }
      }
    }
    return result;
  }
  identify(): void {
    for (const $it6 = this.iterator(); $it6.hasNext(); ) {
      let item = $it6.next();
      item.identify$boolean(false);
    }
  }
  observe(): void {
    if (this.weapon() != null) {
      if (ShardOfOblivion.passiveIDDisabled() && this.weapon() instanceof Weapon) {
        (this.weapon()).setIDReady();
      } else {
        this.weapon().identify$();
        Badges.validateItemLevelAquired(this.weapon());
      }
    }
    if (this.secondWep() != null) {
      if (ShardOfOblivion.passiveIDDisabled() && this.secondWep() instanceof Weapon) {
        (this.secondWep()).setIDReady();
      } else {
        this.secondWep().identify$();
        Badges.validateItemLevelAquired(this.secondWep());
      }
    }
    if (this.armor() != null) {
      if (ShardOfOblivion.passiveIDDisabled()) {
        this.armor().setIDReady();
      } else {
        this.armor().identify$();
        Badges.validateItemLevelAquired(this.armor());
      }
    }
    if (this.artifact() != null) {
      this.artifact().identify$();
      Badges.validateItemLevelAquired(this.artifact());
    }
    if (this.misc() != null) {
      if (ShardOfOblivion.passiveIDDisabled() && this.misc() instanceof Ring) {
        (this.misc()).setIDReady();
      } else {
        this.misc().identify$();
        Badges.validateItemLevelAquired(this.misc());
      }
    }
    if (this.ring() != null) {
      if (ShardOfOblivion.passiveIDDisabled()) {
        this.ring().setIDReady();
      } else {
        this.ring().identify$();
        Badges.validateItemLevelAquired(this.ring());
      }
    }
    if (ShardOfOblivion.passiveIDDisabled()) {
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready_worn', []), []);
    }
    for (const $it7 = this.backpack.iterator(); $it7.hasNext(); ) {
      let item = $it7.next();
      if (item instanceof EquipableItem || item instanceof Wand) {
        item.cursedKnown = true;
      }
    }
    Item.updateQuickslot();
  }
  uncurseEquipped(): void {
    ScrollOfRemoveCurse.uncurse(this.owner, [this.armor(), this.weapon(), this.artifact(), this.misc(), this.ring(), this.secondWep()]);
  }
  randomUnequipped(): Item {
    if (this.owner.buff($J.cls(LostInventory)) != null) {
      return null;
    }
    return Random.element$Collection(this.backpack.items_);
  }
  charge(charge: number): number {
    let count = 0;
    for (const $it8 = this.owner.buffs$Class($J.cls(Wand$Charger)).iterator(); $it8.hasNext(); ) {
      let charger = $it8.next();
      charger.gainCharge(charge);
      count++;
    }
    return count;
  }
  iterator(): Iterator<Item> {
    return new Belongings$ItemIterator().$o(this)._Belongings$ItemIterator();
  }
  static $clinit() {
    Belongings.bundleRestoring = false;
  }
}

export class Belongings$Backpack extends Bag {
  _Belongings$Backpack(): this {
    this._Bag();
    this.image_ = ItemSpriteSheet.BACKPACK;
    return this;
  }
  capacity(): number {
    let cap = super.capacity();
    for (const $it9 = this.items_.iterator(); $it9.hasNext(); ) {
      let item = $it9.next();
      if (item instanceof Bag) {
        cap++;
      }
    }
    if (Dungeon.hero != null && Dungeon.hero.belongings.secondWep_ != null) {
      cap--;
    }
    return cap;
  }
}

export class Belongings$ItemIterator extends JObject {
  index: number = 0;
  backpackIterator: Iterator<Item> = null;
  equipped: Item[] = null;
  backpackIndex: number = 0;
  _Belongings$ItemIterator(): this {
    this.index = 0;
    this.backpackIterator = this.$outer.backpack.iterator();
    this.equipped = [this.$outer.weapon_, this.$outer.armor_, this.$outer.artifact_, this.$outer.misc_, this.$outer.ring_, this.$outer.secondWep_];
    this.backpackIndex = this.equipped.length;
    return this;
  }
  hasNext(): boolean {
    for (let i = this.index; i < this.backpackIndex; i++) {
      if (this.equipped[i] != null) {
        return true;
      }
    }
    return this.backpackIterator.hasNext();
  }
  next(): Item {
    while (this.index < this.backpackIndex) {
      let item = this.equipped[this.index++];
      if (item != null) {
        return item;
      }
    }
    return this.backpackIterator.next();
  }
  remove(): void {
    switch (this.index) {
      case 0:
        this.equipped[0] = this.$outer.weapon_ = null;
        break;
      case 1:
        this.equipped[1] = this.$outer.armor_ = null;
        break;
      case 2:
        this.equipped[2] = this.$outer.artifact_ = null;
        break;
      case 3:
        this.equipped[3] = this.$outer.misc_ = null;
        break;
      case 4:
        this.equipped[4] = this.$outer.ring_ = null;
        break;
      case 5:
        this.equipped[5] = this.$outer.secondWep_ = null;
        break;
      default:
        this.backpackIterator.remove();
    }
  }
}

$J.define(Belongings, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings', { kind: 'class', ifaces: ['java.lang.Iterable'], sup: 'java.lang.Object', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero': '_Belongings' }, meths: { 'lostInventory()': 'lostInventory$', 'lostInventory(boolean)': 'lostInventory$boolean' }, clinit: true, lazy: ['bundleRestoring'] });
$J.define(Belongings$Backpack, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag', ctors: { '': '_Belongings$Backpack' } });
$J.define(Belongings$ItemIterator, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$ItemIterator', { kind: 'class', ifaces: ['java.util.Iterator'], sup: 'java.lang.Object', ctors: { '': '_Belongings$ItemIterator' }, inner: true });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ClassArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Wand$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$Charger');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
