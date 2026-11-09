// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/QuickSlot.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../jre/index.ts';

let Random;

export class QuickSlot extends JObject {
  /**
   * Slots contain objects which are also in a player's inventory. The one exception to this is when quantity is 0,
   * which can happen for a stackable item that has been 'used up', these are referred to as placeholders.
   */
  static SIZE: number = 0;
  slots: Item[] = null;
  PLACEHOLDERS: string = null;
  PLACEMENTS: string = null;
  _QuickSlot(): this {
    this.slots = $J.newArray(QuickSlot.SIZE, null);
    this.PLACEHOLDERS = 'placeholders';
    this.PLACEMENTS = 'placements';
    return this;
  }
  setSlot(slot: number, item: Item): void {
    this.clearItem(item);
    this.slots[slot] = item;
  }
  clearSlot(slot: number): void {
    this.slots[slot] = null;
  }
  reset(): void {
    this.slots = $J.newArray(QuickSlot.SIZE, null);
  }
  getItem(slot: number): Item {
    return this.slots[slot];
  }
  getSlot(item: Item): number {
    for (let i = 0; i < QuickSlot.SIZE; i++) {
      if (this.getItem(i) === item) {
        return i;
      }
    }
    return -1;
  }
  isPlaceholder(slot: number): boolean {
    return this.getItem(slot) != null && this.getItem(slot).quantity$() === 0;
  }
  isNonePlaceholder(slot: number): boolean {
    return this.getItem(slot) != null && this.getItem(slot).quantity$() > 0;
  }
  clearItem(item: Item): void {
    if (this.contains(item)) {
      this.clearSlot(this.getSlot(item));
    }
  }
  contains(item: Item): boolean {
    return this.getSlot(item) !== -1;
  }
  replacePlaceholder(item: Item): void {
    for (let i = 0; i < QuickSlot.SIZE; i++) {
      if (this.isPlaceholder(i) && item.isSimilar(this.getItem(i))) {
        this.setSlot(i, item);
      }
    }
  }
  convertToPlaceholder(item: Item): void {
    if (this.contains(item)) {
      let placeholder = item.virtual();
      if (placeholder == null) {
        return;
      }
      for (let i = 0; i < QuickSlot.SIZE; i++) {
        if (this.getItem(i) === item) {
          this.setSlot(i, placeholder);
        }
      }
    }
  }
  randomNonePlaceholder(): Item {
    let result = new ArrayList();
    for (let i = 0; i < QuickSlot.SIZE; i++) {
      if (this.getItem(i) != null && !this.isPlaceholder(i)) {
        result.add(this.getItem(i));
      }
    }
    return Random.element$Collection(result);
  }
  /**
   * Placements array is used as order is preserved while bundling, but exact index is not, so if we
   * bundle both the placeholders (which preserves their order) and an array telling us where the placeholders are,
   * we can reconstruct them perfectly.
   */
  storePlaceholders(bundle: Bundle): void {
    let placeholders = new ArrayList(QuickSlot.SIZE);
    let placements = $J.newArray(QuickSlot.SIZE, false);
    for (let i = 0; i < QuickSlot.SIZE; i++) {
      if (this.isPlaceholder(i)) {
        placeholders.add(this.getItem(i));
        placements[i] = true;
      }
    }
    bundle.put$String$Collection(this.PLACEHOLDERS, placeholders);
    bundle.put$String$booleanArr(this.PLACEMENTS, placements);
  }
  restorePlaceholders(bundle: Bundle): void {
    let placeholders = bundle.getCollection(this.PLACEHOLDERS);
    let placements = bundle.getBooleanArray(this.PLACEMENTS);
    let i = 0;
    for (const $it0 = placeholders.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      while (!placements[i]) {
        i++;
      }
      this.setSlot(i, item);
      i++;
    }
  }
  static $clinit() {
    QuickSlot.SIZE = 6;
  }
}

$J.define(QuickSlot, 'com.shatteredpixel.shatteredpixeldungeon.QuickSlot', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_QuickSlot' }, clinit: true, lazy: ['SIZE'] });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
