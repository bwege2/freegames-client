// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bags/Bag.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../Item.ts';

let Badges, Dungeon, LostInventory, Hero, GameScene, WndQuickBag;

export class Bag extends Item {
  static readonly AC_OPEN: string = 'OPEN';
  owner: Char = null;
  items_: ArrayList<Item> = null;
  quickUseItem: Item = null;
  static readonly ITEMS: string = 'inventory';
  loading: boolean = false;
  _Bag(): this {
    this._Item();
    this.image_ = 11;
    this.defaultAction_ = Bag.AC_OPEN;
    this.unique = true;
    this.items_ = new ArrayList();
    return this;
  }
  capacity(): number {
    return 20;
  }
  targetingPos(user: Hero, dst: number): number {
    if (this.quickUseItem != null) {
      return this.quickUseItem.targetingPos(user, dst);
    } else {
      return super.targetingPos(user, dst);
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    this.quickUseItem = null;
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Bag.AC_OPEN) && !this.items_.isEmpty()) {
      GameScene.show(new WndQuickBag()._WndQuickBag(this));
    }
  }
  collect$Bag(container: Bag): boolean {
    this.grabItems$Bag(container);
    for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      Dungeon.quickslot.replacePlaceholder(item);
    }
    if (super.collect$Bag(container)) {
      this.owner = container.owner;
      Badges.validateAllBagsBought(this);
      return true;
    } else {
      return false;
    }
  }
  onDetach(): void {
    this.owner = null;
    for (const $it1 = this.items_.iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      Dungeon.quickslot.clearItem(item);
    }
    Item.updateQuickslot();
  }
  grabItems$(): void {
    if (this.owner != null && this.owner instanceof Hero && this !== (this.owner).belongings.backpack) {
      this.grabItems$Bag((this.owner).belongings.backpack);
    }
  }
  grabItems$Bag(container: Bag): void {
    for (let item of $J.toArrayInto(container.items_.toArray(), $J.newArray(0, null))) {
      if (this.canHold(item)) {
        let slot = Dungeon.quickslot.getSlot(item);
        item.detachAll(container);
        if (!item.collect$Bag(this)) {
          item.collect$Bag(container);
        }
        if (slot !== -1) {
          Dungeon.quickslot.setSlot(slot, item);
        }
      }
    }
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  clear(): void {
    this.items_.clear();
  }
  resurrect(): void {
    for (let item of $J.toArrayInto(this.items_.toArray(), $J.newArray(0, null))) {
      if (!item.unique) {
        this.items_.remove(item);
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Collection(Bag.ITEMS, this.items_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.loading = true;
    for (const $it2 = bundle.getCollection(Bag.ITEMS).iterator(); $it2.hasNext(); ) {
      let item = $it2.next();
      if (item != null) {
        if (!(item).collect$Bag(this)) {
          this.items_.add(item);
        }
      }
    }
    this.loading = false;
  }
  contains(item: Item): boolean {
    for (const $it3 = this.items_.iterator(); $it3.hasNext(); ) {
      let i = $it3.next();
      if (i === item) {
        return true;
      } else if (i instanceof Bag && (i).contains(item)) {
        return true;
      }
    }
    return false;
  }
  canHold(item: Item): boolean {
    if (!this.loading && this.owner != null && this.owner.buff($J.cls(LostInventory)) != null && !item.keptThroughLostInventory()) {
      return false;
    }
    if (this.items_.contains(item) || item instanceof Bag || this.items_.size() < this.capacity()) {
      return true;
    } else if (item.stackable) {
      for (const $it4 = this.items_.iterator(); $it4.hasNext(); ) {
        let i = $it4.next();
        if (item.isSimilar(i)) {
          return true;
        }
      }
    }
    return false;
  }
  iterator(): Iterator<Item> {
    return new Bag$ItemIterator().$o(this)._Bag$ItemIterator();
  }
}

export class Bag$ItemIterator extends JObject {
  index: number = 0;
  nested: Iterator<Item> = null;
  _Bag$ItemIterator(): this {
    this.index = 0;
    this.nested = null;
    return this;
  }
  hasNext(): boolean {
    if (this.nested != null) {
      return this.nested.hasNext() || this.index < this.$outer.items_.size();
    } else {
      return this.index < this.$outer.items_.size();
    }
  }
  next(): Item {
    if (this.nested != null && this.nested.hasNext()) {
      return this.nested.next();
    } else {
      this.nested = null;
      let item = this.$outer.items_.get(this.index++);
      if (item instanceof Bag) {
        this.nested = (item).iterator();
      }
      return item;
    }
  }
  remove(): void {
    if (this.nested != null) {
      this.nested.remove();
    } else {
      this.$outer.items_.removeAt(this.index);
    }
  }
}

$J.define(Bag, 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag', { kind: 'class', ifaces: ['java.lang.Iterable'], sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Bag' }, meths: { 'grabItems(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'grabItems$Bag', 'grabItems()': 'grabItems$', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(Bag$ItemIterator, 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag$ItemIterator', { kind: 'class', ifaces: ['java.util.Iterator'], sup: 'java.lang.Object', ctors: { '': '_Bag$ItemIterator' }, inner: true });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WndQuickBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndQuickBag');
});
