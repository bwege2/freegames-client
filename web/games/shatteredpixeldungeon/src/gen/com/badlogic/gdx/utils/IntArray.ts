// @ts-nocheck
// IntArray.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, IllegalArgumentException, IndexOutOfBoundsException, JObject, StringBuilder } from '../../../../../jre/index.ts';

/**
 * A resizable, ordered or unordered int array. Avoids the boxing that occurs with ArrayList<Integer>. If unordered, this class
 * avoids a memory copy when removing elements (the last element is moved to the removed element's position).
 * @author Nathan Sweet
 */
export class IntArray extends JObject {
  items_: number[] = null;
  size_: number = 0;
  ordered: boolean = false;
  /**
   * Creates an ordered array with a capacity of 16.
   */
  _IntArray$(): this {
    this._IntArray$boolean$int(true, 16);
    return this;
  }
  /**
   * Creates an ordered array with the specified capacity.
   */
  _IntArray$int(capacity: number): this {
    this._IntArray$boolean$int(true, capacity);
    return this;
  }
  /**
   * @param ordered If false, methods that remove elements may change the order of other elements in the array, which avoids a
   *           memory copy.
   * @param capacity Any elements added beyond this will cause the backing array to be grown.
   */
  _IntArray$boolean$int(ordered: boolean, capacity: number): this {
    this.ordered = ordered;
    this.items_ = $J.newArray(capacity, 0);
    return this;
  }
  add$int(value: number): void {
    let items = this.items_;
    if (this.size_ === items.length) {
      items = this.resize(Math.max(8, $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    items[this.size_++] = value;
  }
  add$int$int(value1: number, value2: number): void {
    let items = this.items_;
    if (((this.size_ + 1) | 0) >= items.length) {
      items = this.resize(Math.max(8, $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    items[this.size_] = value1;
    (items[(this.size_ + 1) | 0]) = value2;
    this.size_ = (this.size_ + 2) | 0;
  }
  get(index: number): number {
    if (index >= this.size_) {
      throw new IndexOutOfBoundsException('index can\'t be >= size: ' + index + ' >= ' + this.size_);
    }
    return this.items_[index];
  }
  set(index: number, value: number): void {
    if (index >= this.size_) {
      throw new IndexOutOfBoundsException('index can\'t be >= size: ' + index + ' >= ' + this.size_);
    }
    this.items_[index] = value;
  }
  /**
   * Removes and returns the last item.
   */
  pop(): number {
    return this.items_[--this.size_];
  }
  /**
   * Returns the last item.
   */
  peek(): number {
    return this.items_[(this.size_ - 1) | 0];
  }
  clear(): void {
    this.size_ = 0;
  }
  /**
   * Increases the size of the backing array to accommodate the specified number of additional items. Useful before adding many
   * items to avoid multiple backing array resizes.
   * @return {@link #items}
   */
  ensureCapacity(additionalCapacity: number): number[] {
    if (additionalCapacity < 0) {
      throw new IllegalArgumentException('additionalCapacity must be >= 0: ' + additionalCapacity);
    }
    let sizeNeeded = (this.size_ + additionalCapacity) | 0;
    if (sizeNeeded > this.items_.length) {
      this.resize(Math.max(Math.max(8, sizeNeeded), $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    return this.items_;
  }
  resize(newSize: number): number[] {
    let newItems = $J.newArray(newSize, 0);
    let items = this.items_;
    $J.system_arraycopy(items, 0, newItems, 0, Math.min(this.size_, newItems.length));
    this.items_ = newItems;
    return newItems;
  }
  toArray(): number[] {
    let array = $J.newArray(this.size_, 0);
    $J.system_arraycopy(this.items_, 0, array, 0, this.size_);
    return array;
  }
  hashCode(): number {
    if (!this.ordered) {
      return super.hashCode();
    }
    let items = this.items_;
    let h = 1;
    for (let i = 0, n = this.size_; i < n; i++) {
      h = (Math.imul(h, 31) + items[i]) | 0;
    }
    return h;
  }
  equals(object$: any): boolean {
    if (object$ === this) {
      return true;
    }
    if (!this.ordered) {
      return false;
    }
    if (!(object$ instanceof IntArray)) {
      return false;
    }
    let array = object$;
    if (!array.ordered) {
      return false;
    }
    let n = this.size_;
    if (n !== array.size_) {
      return false;
    }
    let items1 = this.items_;
    let items2 = array.items_;
    for (let i = 0; i < n; i++) {
      if (items1[i] !== items2[i]) {
        return false;
      }
    }
    return true;
  }
  toString(): string {
    if (this.size_ === 0) {
      return '[]';
    }
    let items = this.items_;
    let buffer = new StringBuilder(32);
    buffer.append(String.fromCharCode(91 /* '[' */));
    buffer.append(String(items[0]));
    for (let i = 1; i < this.size_; i++) {
      buffer.append(', ');
      buffer.append(String(items[i]));
    }
    buffer.append(String.fromCharCode(93 /* ']' */));
    return buffer.toString();
  }
}

$J.define(IntArray, 'com.badlogic.gdx.utils.IntArray', { kind: 'class', sup: 'java.lang.Object', ctors: { 'boolean,int[],int,int': '_IntArray$boolean$intArr$int$int', 'int[]': '_IntArray$intArr', 'com.badlogic.gdx.utils.IntArray': '_IntArray$IntArray', 'boolean,int': '_IntArray$boolean$int', 'int': '_IntArray$int', '': '_IntArray$' }, meths: { 'toString(java.lang.String)': 'toString$String', 'mul(int)': 'mul$int', 'mul(int,int)': 'mul$int$int', 'incr(int)': 'incr$int', 'incr(int,int)': 'incr$int$int', 'addAll(int[],int,int)': 'addAll$intArr$int$int', 'addAll(int[])': 'addAll$intArr', 'addAll(com.badlogic.gdx.utils.IntArray,int,int)': 'addAll$IntArray$int$int', 'addAll(com.badlogic.gdx.utils.IntArray)': 'addAll$IntArray', 'add(int,int,int,int)': 'add$int$int$int$int', 'add(int,int,int)': 'add$int$int$int', 'add(int,int)': 'add$int$int', 'add(int)': 'add$int' } });
