// @ts-nocheck
// FloatArray.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, IllegalStateException, IndexOutOfBoundsException, JObject, StringBuilder } from '../../../../../jre/index.ts';

let NumberUtils;

/**
 * A resizable, ordered or unordered float array. Avoids the boxing that occurs with ArrayList<Float>. If unordered, this class
 * avoids a memory copy when removing elements (the last element is moved to the removed element's position).
 * @author Nathan Sweet
 */
export class FloatArray extends JObject {
  items_: number[] = null;
  size_: number = 0;
  ordered: boolean = false;
  /**
   * Creates an ordered array with a capacity of 16.
   */
  _FloatArray$(): this {
    this._FloatArray$boolean$int(true, 16);
    return this;
  }
  /**
   * @param ordered If false, methods that remove elements may change the order of other elements in the array, which avoids a
   *           memory copy.
   * @param capacity Any elements added beyond this will cause the backing array to be grown.
   */
  _FloatArray$boolean$int(ordered: boolean, capacity: number): this {
    this.ordered = ordered;
    this.items_ = $J.newArray(capacity, 0);
    return this;
  }
  add$float(value: number): void {
    let items = this.items_;
    if (this.size_ === items.length) {
      items = this.resize(Math.max(8, $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    items[this.size_++] = value;
  }
  addAll$FloatArray(array: FloatArray): void {
    this.addAll$floatArr$int$int(array.items_, 0, array.size_);
  }
  addAll$FloatArray$int$int(array: FloatArray, offset: number, length: number): void {
    if (((offset + length) | 0) > array.size_) {
      throw new IllegalArgumentException('offset + length must be <= size: ' + offset + ' + ' + length + ' <= ' + array.size_);
    }
    this.addAll$floatArr$int$int(array.items_, offset, length);
  }
  addAll$floatArr$int$int(array: number[], offset: number, length: number): void {
    let items = this.items_;
    let sizeNeeded = (this.size_ + length) | 0;
    if (sizeNeeded > items.length) {
      items = this.resize(Math.max(Math.max(8, sizeNeeded), $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    $J.system_arraycopy(array, offset, items, this.size_, length);
    this.size_ = (this.size_ + length) | 0;
  }
  get(index: number): number {
    if (index >= this.size_) {
      throw new IndexOutOfBoundsException('index can\'t be >= size: ' + index + ' >= ' + this.size_);
    }
    return this.items_[index];
  }
  /**
   * Removes the items between the specified indices, inclusive.
   */
  removeRange(start: number, end: number): void {
    let n = this.size_;
    if (end >= n) {
      throw new IndexOutOfBoundsException('end can\'t be >= size: ' + end + ' >= ' + this.size_);
    }
    if (start > end) {
      throw new IndexOutOfBoundsException('start can\'t be > end: ' + start + ' > ' + end);
    }
    let count = (end - start + 1) | 0;
    let lastIndex = (n - count) | 0;
    if (this.ordered) {
      $J.system_arraycopy(this.items_, (start + count) | 0, this.items_, start, (n - (start + count)) | 0);
    } else {
      let i = Math.max(lastIndex, (end + 1) | 0);
      $J.system_arraycopy(this.items_, i, this.items_, start, (n - i) | 0);
    }
    this.size_ = (n - count) | 0;
  }
  /**
   * Returns the first item.
   */
  first(): number {
    if (this.size_ === 0) {
      throw new IllegalStateException('Array is empty.');
    }
    return this.items_[0];
  }
  /**
   * Returns true if the array has one or more items.
   */
  notEmpty(): boolean {
    return this.size_ > 0;
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
  /**
   * Reduces the size of the array to the specified size. If the array is already smaller than the specified size, no action is
   * taken.
   */
  truncate(newSize: number): void {
    if (newSize < 0) {
      throw new IllegalArgumentException('newSize must be >= 0: ' + newSize);
    }
    if (this.size_ > newSize) {
      this.size_ = newSize;
    }
  }
  hashCode(): number {
    if (!this.ordered) {
      return super.hashCode();
    }
    let items = this.items_;
    let h = 1;
    for (let i = 0, n = this.size_; i < n; i++) {
      h = (Math.imul(h, 31) + NumberUtils.floatToRawIntBits(items[i])) | 0;
    }
    return h;
  }
  /**
   * Returns false if either array is unordered.
   */
  equals(object$: any): boolean {
    if (object$ === this) {
      return true;
    }
    if (!this.ordered) {
      return false;
    }
    if (!(object$ instanceof FloatArray)) {
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
    buffer.append($J.fstr(items[0]));
    for (let i = 1; i < this.size_; i++) {
      buffer.append(', ');
      buffer.append($J.fstr(items[i]));
    }
    buffer.append(String.fromCharCode(93 /* ']' */));
    return buffer.toString();
  }
}

$J.define(FloatArray, 'com.badlogic.gdx.utils.FloatArray', { kind: 'class', sup: 'java.lang.Object', ctors: { 'boolean,float[],int,int': '_FloatArray$boolean$floatArr$int$int', 'float[]': '_FloatArray$floatArr', 'com.badlogic.gdx.utils.FloatArray': '_FloatArray$FloatArray', 'boolean,int': '_FloatArray$boolean$int', 'int': '_FloatArray$int', '': '_FloatArray$' }, meths: { 'toString(java.lang.String)': 'toString$String', 'equals(java.lang.Object,float)': 'equals$Object$float', 'mul(float)': 'mul$float', 'mul(int,float)': 'mul$int$float', 'incr(float)': 'incr$float', 'incr(int,float)': 'incr$int$float', 'addAll(float[],int,int)': 'addAll$floatArr$int$int', 'addAll(float[])': 'addAll$floatArr', 'addAll(com.badlogic.gdx.utils.FloatArray,int,int)': 'addAll$FloatArray$int$int', 'addAll(com.badlogic.gdx.utils.FloatArray)': 'addAll$FloatArray', 'add(float,float,float,float)': 'add$float$float$float$float', 'add(float,float,float)': 'add$float$float$float', 'add(float,float)': 'add$float$float', 'add(float)': 'add$float' } });
$J.module(() => {
  NumberUtils = $J.load('com.badlogic.gdx.utils.NumberUtils');
});
