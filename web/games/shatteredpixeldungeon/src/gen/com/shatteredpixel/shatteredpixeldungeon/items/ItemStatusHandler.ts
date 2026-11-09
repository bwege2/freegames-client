// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/ItemStatusHandler.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, JObject, LinkedHashMap, LinkedHashSet } from '../../../../../jre/index.ts';

let Random;

export class ItemStatusHandler<T> extends JObject {
  items_: JClass<T>[] = null;
  itemLabels: LinkedHashMap<JClass<T>, string> = null;
  labelImages: LinkedHashMap<string, number> = null;
  known_: LinkedHashSet<JClass<T>> = null;
  static readonly PFX_LABEL: string = '_label';
  static readonly PFX_KNOWN: string = '_known';
  _ItemStatusHandler$ClassArr$HashMap(items: JClass<T>[], labelImages: HashMap<string, number>): this {
    this.items_ = items;
    this.itemLabels = new LinkedHashMap();
    this.labelImages = new LinkedHashMap(labelImages);
    this.known_ = new LinkedHashSet();
    let labelsLeft = new ArrayList(labelImages.keySet());
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let index = Random.Int$int(labelsLeft.size());
      this.itemLabels.put(item, labelsLeft.get(index));
      labelsLeft.removeAt(index);
    }
    return this;
  }
  _ItemStatusHandler$ClassArr$HashMap$Bundle(items: JClass<T>[], labelImages: HashMap<string, number>, bundle: Bundle): this {
    this.items_ = items;
    this.itemLabels = new LinkedHashMap();
    this.labelImages = new LinkedHashMap(labelImages);
    this.known_ = new LinkedHashSet();
    let allLabels = new ArrayList(labelImages.keySet());
    this.restore(bundle, allLabels);
    return this;
  }
  save(bundle: Bundle): void {
    for (let i = 0; i < this.items_.length; i++) {
      let itemName = this.items_[i].getSimpleName();
      bundle.put$String$String(itemName + ItemStatusHandler.PFX_LABEL, this.itemLabels.get(this.items_[i]));
      bundle.put$String$boolean(itemName + ItemStatusHandler.PFX_KNOWN, this.known_.contains(this.items_[i]));
    }
  }
  saveSelectively(bundle: Bundle, itemsToSave: ArrayList<Item>): void {
    let items = Arrays.asList(...this.items_);
    for (const $it0 = itemsToSave.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      if (items.contains(item.getClass())) {
        let cls = items.get(items.indexOf(item.getClass()));
        let itemName = cls.getSimpleName();
        bundle.put$String$String(itemName + ItemStatusHandler.PFX_LABEL, this.itemLabels.get(cls));
        bundle.put$String$boolean(itemName + ItemStatusHandler.PFX_KNOWN, this.known_.contains(cls));
      }
    }
  }
  saveClassesSelectively(bundle: Bundle, clsToSave: ArrayList<JClass<Item>>): void {
    let items = Arrays.asList(...this.items_);
    for (const $it1 = clsToSave.iterator(); $it1.hasNext(); ) {
      let cls = $it1.next();
      if (items.contains(cls)) {
        let toSave = items.get(items.indexOf(cls));
        let itemName = toSave.getSimpleName();
        bundle.put$String$String(itemName + ItemStatusHandler.PFX_LABEL, this.itemLabels.get(toSave));
        bundle.put$String$boolean(itemName + ItemStatusHandler.PFX_KNOWN, this.known_.contains(toSave));
      }
    }
  }
  restore(bundle: Bundle, labelsLeft: ArrayList<string>): void {
    let unlabelled = new ArrayList();
    for (let i = 0; i < this.items_.length; i++) {
      let item = this.items_[i];
      let itemName = item.getSimpleName();
      if (bundle.contains(itemName + ItemStatusHandler.PFX_LABEL)) {
        let label = bundle.getString(itemName + ItemStatusHandler.PFX_LABEL);
        this.itemLabels.put(item, label);
        labelsLeft.remove(label);
        if (bundle.getBoolean(itemName + ItemStatusHandler.PFX_KNOWN)) {
          this.known_.add(item);
        }
      } else {
        unlabelled.add(this.items_[i]);
      }
    }
    for (const $it2 = unlabelled.iterator(); $it2.hasNext(); ) {
      let item = $it2.next();
      let itemName = item.getSimpleName();
      let index = Random.Int$int(labelsLeft.size());
      this.itemLabels.put(item, labelsLeft.get(index));
      labelsLeft.removeAt(index);
      if (bundle.contains(itemName + ItemStatusHandler.PFX_KNOWN) && bundle.getBoolean(itemName + ItemStatusHandler.PFX_KNOWN)) {
        this.known_.add(item);
      }
    }
  }
  contains$Item(item: T): boolean {
    for (let i of this.items_) {
      if ($J.equals($J.getClass(item), i)) {
        return true;
      }
    }
    return false;
  }
  contains$Class(itemCls: JClass<T>): boolean {
    for (let i of this.items_) {
      if ($J.equals(itemCls, i)) {
        return true;
      }
    }
    return false;
  }
  image$Item(item: T): number {
    return this.labelImages.get(this.label$Item(item));
  }
  image$Class(itemCls: JClass<T>): number {
    return this.labelImages.get(this.label$Class(itemCls));
  }
  label$Item(item: T): string {
    return this.itemLabels.get($J.getClass(item));
  }
  label$Class(itemCls: JClass<T>): string {
    return this.itemLabels.get(itemCls);
  }
  isKnown$Item(item: T): boolean {
    return this.known_.contains($J.getClass(item));
  }
  isKnown$Class(itemCls: JClass<T>): boolean {
    return this.known_.contains(itemCls);
  }
  know$Item(item: T): void {
    this.known_.add($J.getClass(item));
  }
  know$Class(itemCls: JClass<T>): void {
    this.known_.add(itemCls);
  }
  known(): HashSet<JClass<T>> {
    return this.known_;
  }
  unknown(): HashSet<JClass<T>> {
    let result = new LinkedHashSet();
    for (let i of this.items_) {
      if (!this.known_.contains(i)) {
        result.add(i);
      }
    }
    return result;
  }
}

$J.define(ItemStatusHandler, 'com.shatteredpixel.shatteredpixeldungeon.items.ItemStatusHandler', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Class[],java.util.HashMap,com.watabou.utils.Bundle': '_ItemStatusHandler$ClassArr$HashMap$Bundle', 'java.lang.Class[],java.util.HashMap': '_ItemStatusHandler$ClassArr$HashMap' }, meths: { 'know(java.lang.Class)': 'know$Class', 'know(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'know$Item', 'isKnown(java.lang.Class)': 'isKnown$Class', 'isKnown(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'isKnown$Item', 'label(java.lang.Class)': 'label$Class', 'label(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'label$Item', 'image(java.lang.Class)': 'image$Class', 'image(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'image$Item', 'contains(java.lang.Class)': 'contains$Class', 'contains(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'contains$Item' } });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
