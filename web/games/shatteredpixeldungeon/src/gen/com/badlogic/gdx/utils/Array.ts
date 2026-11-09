// @ts-nocheck
// Array.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArraySupplier, Arrays, Collections, GdxRuntimeException, IllegalArgumentException, IllegalStateException, IndexOutOfBoundsException, JObject, JString, NoSuchElementException, StringBuilder } from '../../../../../jre/index.ts';

/**
 * A resizable, ordered or unordered array of objects. If unordered, this class avoids a memory copy when removing elements (the
 * last element is moved to the removed element's position).
 * @author Nathan Sweet
 */
export class Array_<T> extends JObject {
  /**
   * Provides direct access to the underlying array. If the Array's generic type is not Object, this field may only be accessed
   * if the {@link Array#Array(boolean, int, Class)} constructor was used.
   */
  items_: T[] = null;
  size_: number = 0;
  ordered: boolean = false;
  iterable: Array$ArrayIterable<T> = null;
  predicateIterable: Predicate_PredicateIterable<T> = null;
  /**
   * Creates an ordered array with a capacity of 16.
   */
  _Array$(): this {
    this._Array$boolean$int(true, 16);
    return this;
  }
  /**
   * Creates an ordered array with the specified capacity.
   */
  _Array$int(capacity: number): this {
    this._Array$boolean$int(true, capacity);
    return this;
  }
  /**
   * @param ordered If false, methods that remove elements may change the order of other elements in the array, which avoids a
   *           memory copy.
   * @param capacity Any elements added beyond this will cause the backing array to be grown.
   */
  _Array$boolean$int(ordered: boolean, capacity: number): this {
    this._Array$boolean$int$ArraySupplier(ordered, capacity, ArraySupplier.object());
    return this;
  }
  /**
   * Creates a new array with {@link #items} with the specified supplier.
   * @param ordered If false, methods that remove elements may change the order of other elements in the array, which avoids a
   *           memory copy.
   * @param capacity Any elements added beyond this will cause the backing array to be grown.
   */
  _Array$boolean$int$ArraySupplier(ordered: boolean, capacity: number, arraySupplier: ArraySupplier<T[]>): this {
    this.ordered = ordered;
    this.items_ = arraySupplier.get(capacity);
    return this;
  }
  add$Object(value: T): void {
    let items = this.items_;
    if (this.size_ === items.length) {
      items = this.resize(Math.max(8, $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    items[this.size_++] = value;
  }
  addAll$Array(array: Array_<T>): void {
    this.addAll$ObjectArr$int$int(array.items_, 0, array.size_);
  }
  addAll$Array$int$int(array: Array_<T>, start: number, count: number): void {
    if (((start + count) | 0) > array.size_) {
      throw new IllegalArgumentException('start + count must be <= size: ' + start + ' + ' + count + ' <= ' + array.size_);
    }
    this.addAll$ObjectArr$int$int(array.items_, start, count);
  }
  addAll$ObjectArr$int$int(array: T[], start: number, count: number): void {
    let items = this.items_;
    let sizeNeeded = (this.size_ + count) | 0;
    if (sizeNeeded > items.length) {
      items = this.resize(Math.max(Math.max(8, sizeNeeded), $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    $J.system_arraycopy(array, start, items, this.size_, count);
    this.size_ = sizeNeeded;
  }
  get(index: number): T {
    if (index >= this.size_) {
      throw new IndexOutOfBoundsException('index can\'t be >= size: ' + index + ' >= ' + this.size_);
    }
    return this.items_[index];
  }
  /**
   * Returns the index of first occurrence of value in the array, or -1 if no such value exists.
   * @param value May be null.
   * @param identity If true, == comparison will be used. If false, .equals() comparison will be used.
   * @return An index of first occurrence of value in array or -1 if no such value exists
   */
  indexOf(value: T, identity: boolean): number {
    let items = this.items_;
    if (identity || value == null) {
      for (let i = 0, n = this.size_; i < n; i++) {
        if (items[i] === value) {
          return i;
        }
      }
    } else {
      for (let i = 0, n = this.size_; i < n; i++) {
        if ($J.equals(value, items[i])) {
          return i;
        }
      }
    }
    return -1;
  }
  /**
   * Removes the first instance of the specified value in the array.
   * @param value May be null.
   * @param identity If true, == comparison will be used. If false, .equals() comparison will be used.
   * @return true if value was found and removed, false otherwise
   */
  removeValue(value: T, identity: boolean): boolean {
    let items = this.items_;
    if (identity || value == null) {
      for (let i = 0, n = this.size_; i < n; i++) {
        if (items[i] === value) {
          this.removeIndex(i);
          return true;
        }
      }
    } else {
      for (let i = 0, n = this.size_; i < n; i++) {
        if ($J.equals(value, items[i])) {
          this.removeIndex(i);
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Removes and returns the item at the specified index.
   */
  removeIndex(index: number): T {
    if (index >= this.size_) {
      throw new IndexOutOfBoundsException('index can\'t be >= size: ' + index + ' >= ' + this.size_);
    }
    let items = this.items_;
    let value = items[index];
    this.size_--;
    if (this.ordered) {
      $J.system_arraycopy(items, (index + 1) | 0, items, index, (this.size_ - index) | 0);
    } else {
      items[index] = items[this.size_];
    }
    items[this.size_] = null;
    return value;
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
    let items = this.items_;
    let count = (end - start + 1) | 0;
    let lastIndex = (n - count) | 0;
    if (this.ordered) {
      $J.system_arraycopy(items, (start + count) | 0, items, start, (n - (start + count)) | 0);
    } else {
      let i = Math.max(lastIndex, (end + 1) | 0);
      $J.system_arraycopy(items, i, items, start, (n - i) | 0);
    }
    for (let i = lastIndex; i < n; i++) {
      items[i] = null;
    }
    this.size_ = (n - count) | 0;
  }
  /**
   * Removes from this array the first instance of each element contained in the specified array.
   * @param identity True to use ==, false to use .equals().
   * @return true if this array was modified.
   */
  removeAll(array: Array_<T>, identity: boolean): boolean {
    let size = this.size_;
    let startSize = size;
    let items = this.items_;
    if (identity) {
      for (let i = 0, n = array.size_; i < n; i++) {
        let item = array.get(i);
        for (let ii = 0; ii < size; ii++) {
          if (item === items[ii]) {
            this.removeIndex(ii);
            size--;
            break;
          }
        }
      }
    } else {
      for (let i = 0, n = array.size_; i < n; i++) {
        let item = array.get(i);
        for (let ii = 0; ii < size; ii++) {
          if ($J.equals(item, items[ii])) {
            this.removeIndex(ii);
            size--;
            break;
          }
        }
      }
    }
    return size !== startSize;
  }
  /**
   * Removes and returns the last item.
   */
  pop(): T {
    if (this.size_ === 0) {
      throw new IllegalStateException('Array is empty.');
    }
    --this.size_;
    let item = this.items_[this.size_];
    this.items_[this.size_] = null;
    return item;
  }
  /**
   * Returns the last item.
   */
  peek(): T {
    if (this.size_ === 0) {
      throw new IllegalStateException('Array is empty.');
    }
    return this.items_[(this.size_ - 1) | 0];
  }
  /**
   * Returns the first item.
   */
  first(): T {
    if (this.size_ === 0) {
      throw new IllegalStateException('Array is empty.');
    }
    return this.items_[0];
  }
  /**
   * Returns true if the array is empty.
   */
  isEmpty(): boolean {
    return this.size_ === 0;
  }
  clear(): void {
    Arrays.fill(this.items_, 0, this.size_, null);
    this.size_ = 0;
  }
  /**
   * Increases the size of the backing array to accommodate the specified number of additional items. Useful before adding many
   * items to avoid multiple backing array resizes.
   * @return {@link #items}
   */
  ensureCapacity(additionalCapacity: number): T[] {
    if (additionalCapacity < 0) {
      throw new IllegalArgumentException('additionalCapacity must be >= 0: ' + additionalCapacity);
    }
    let sizeNeeded = (this.size_ + additionalCapacity) | 0;
    if (sizeNeeded > this.items_.length) {
      this.resize(Math.max(Math.max(8, sizeNeeded), $J.d2i((Math.fround(this.size_ * 1.75)))));
    }
    return this.items_;
  }
  /**
   * Creates a new backing array with the specified size containing the current items.
   */
  resize(newSize: number): T[] {
    this.items_ = Arrays.copyOf(this.items_, newSize);
    return this.items_;
  }
  /**
   * Returns an iterator for the items in the array. Remove is supported.
   * <p>
   * If {@link Collections#allocateIterators} is false, the same iterator instance is returned each time this method is called.
   * Use the {@link ArrayIterator} constructor for nested or multithreaded iteration.
   */
  iterator(): Array$ArrayIterator<T> {
    if (Collections.allocateIterators) {
      return new Array$ArrayIterator()._Array$ArrayIterator$Array$boolean(this, true);
    }
    if (this.iterable == null) {
      this.iterable = new Array$ArrayIterable()._Array$ArrayIterable$Array(this);
    }
    return this.iterable.iterator();
  }
  /**
   * Reduces the size of the array to the specified size. If the array is already smaller than the specified size, no action is
   * taken.
   */
  truncate(newSize: number): void {
    if (newSize < 0) {
      throw new IllegalArgumentException('newSize must be >= 0: ' + newSize);
    }
    if (this.size_ <= newSize) {
      return;
    }
    for (let i = newSize; i < this.size_; i++) {
      this.items_[i] = null;
    }
    this.size_ = newSize;
  }
  /**
   * Returns the items as an array. Note the array is typed, so the {@link #Array(Class)} constructor must have been used.
   * Otherwise use {@link #toArray(ArraySupplier)} to specify the array type.
   */
  toArray$(): T[] {
    return Arrays.copyOf(this.items_, this.size_);
  }
  hashCode(): number {
    if (!this.ordered) {
      return super.hashCode();
    }
    let items = this.items_;
    let h = 1;
    for (let i = 0, n = this.size_; i < n; i++) {
      h = Math.imul(h, 31);
      let item = items[i];
      if (item != null) {
        h = (h + $J.hashCode(item)) | 0;
      }
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
    if (!(object$ instanceof Array_)) {
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
      let o1 = items1[i];
      let o2 = items2[i];
      if (!(o1 == null ? o2 == null : $J.equals(o1, o2))) {
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
    buffer.append($J.str(items[0]));
    for (let i = 1; i < this.size_; i++) {
      buffer.append(', ');
      buffer.append($J.str(items[i]));
    }
    buffer.append(String.fromCharCode(93 /* ']' */));
    return buffer.toString();
  }
}

export class Array$ArrayIterator<T> extends JObject {
  array: Array_<T> = null;
  allowRemove: boolean = false;
  index: number = 0;
  valid_: boolean = false;
  $init_Array_ArrayIterator() {
    this.valid_ = true;
  }
  _Array$ArrayIterator$Array$boolean(array: Array_<T>, allowRemove: boolean): this {
    this.$init_Array_ArrayIterator();
    this.array = array;
    this.allowRemove = allowRemove;
    return this;
  }
  hasNext(): boolean {
    if (!this.valid_) {
      throw new GdxRuntimeException('#iterator() cannot be used nested.');
    }
    return this.index < this.array.size_;
  }
  next(): T {
    if (this.index >= this.array.size_) {
      throw new NoSuchElementException(String(this.index));
    }
    if (!this.valid_) {
      throw new GdxRuntimeException('#iterator() cannot be used nested.');
    }
    return this.array.items_[this.index++];
  }
  remove(): void {
    if (!this.allowRemove) {
      throw new GdxRuntimeException('Remove not allowed.');
    }
    this.index--;
    this.array.removeIndex(this.index);
  }
  iterator(): Array$ArrayIterator<T> {
    return this;
  }
}

export class Array$ArrayIterable<T> extends JObject {
  array: Array_<T> = null;
  allowRemove: boolean = false;
  iterator1: Array$ArrayIterator<T> = null;
  iterator2: Array$ArrayIterator<T> = null;
  _Array$ArrayIterable$Array(array: Array_<T>): this {
    this._Array$ArrayIterable$Array$boolean(array, true);
    return this;
  }
  _Array$ArrayIterable$Array$boolean(array: Array_<T>, allowRemove: boolean): this {
    this.array = array;
    this.allowRemove = allowRemove;
    return this;
  }
  /**
   * @see Collections#allocateIterators
   */
  iterator(): Array$ArrayIterator<T> {
    if (Collections.allocateIterators) {
      return new Array$ArrayIterator()._Array$ArrayIterator$Array$boolean(this.array, this.allowRemove);
    }
    if (this.iterator1 == null) {
      this.iterator1 = new Array$ArrayIterator()._Array$ArrayIterator$Array$boolean(this.array, this.allowRemove);
      this.iterator2 = new Array$ArrayIterator()._Array$ArrayIterator$Array$boolean(this.array, this.allowRemove);
    }
    if (!this.iterator1.valid_) {
      this.iterator1.index = 0;
      this.iterator1.valid_ = true;
      this.iterator2.valid_ = false;
      return this.iterator1;
    }
    this.iterator2.index = 0;
    this.iterator2.valid_ = true;
    this.iterator1.valid_ = false;
    return this.iterator2;
  }
}

$J.define(Array_, 'com.badlogic.gdx.utils.Array', { kind: 'class', ifaces: ['java.lang.Iterable'], sup: 'java.lang.Object', ctors: { 'boolean,java.lang.Object[],int,int': '_Array$boolean$ObjectArr$int$int', 'java.lang.Object[]': '_Array$ObjectArr', 'com.badlogic.gdx.utils.Array': '_Array$Array', 'java.lang.Class': '_Array$Class', 'boolean,int,java.lang.Class': '_Array$boolean$int$Class', 'com.badlogic.gdx.utils.ArraySupplier': '_Array$ArraySupplier', 'boolean,int,com.badlogic.gdx.utils.ArraySupplier': '_Array$boolean$int$ArraySupplier', 'boolean,int': '_Array$boolean$int', 'int': '_Array$int', '': '_Array$' }, meths: { 'of(boolean,int,java.lang.Class)': 'of$boolean$int$Class', 'of(java.lang.Class)': 'of$Class', 'of(boolean,int,com.badlogic.gdx.utils.ArraySupplier)': 'of$boolean$int$ArraySupplier', 'of(com.badlogic.gdx.utils.ArraySupplier)': 'of$ArraySupplier', 'toString(java.lang.String)': 'toString$String', 'toArray(java.lang.Class)': 'toArray$Class', 'toArray(com.badlogic.gdx.utils.ArraySupplier)': 'toArray$ArraySupplier', 'toArray()': 'toArray$', 'sort(java.util.Comparator)': 'sort$Comparator', 'sort()': 'sort$', 'addAll(java.lang.Object[],int,int)': 'addAll$ObjectArr$int$int', 'addAll(java.lang.Object[])': 'addAll$ObjectArr', 'addAll(com.badlogic.gdx.utils.Array,int,int)': 'addAll$Array$int$int', 'addAll(com.badlogic.gdx.utils.Array)': 'addAll$Array', 'add(java.lang.Object,java.lang.Object,java.lang.Object,java.lang.Object)': 'add$Object$Object$Object$Object', 'add(java.lang.Object,java.lang.Object,java.lang.Object)': 'add$Object$Object$Object', 'add(java.lang.Object,java.lang.Object)': 'add$Object$Object', 'add(java.lang.Object)': 'add$Object' } });
$J.define(Array$ArrayIterator, 'com.badlogic.gdx.utils.Array$ArrayIterator', { kind: 'class', ifaces: ['java.util.Iterator', 'java.lang.Iterable'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.utils.Array,boolean': '_Array$ArrayIterator$Array$boolean', 'com.badlogic.gdx.utils.Array': '_Array$ArrayIterator$Array' } });
$J.define(Array$ArrayIterable, 'com.badlogic.gdx.utils.Array$ArrayIterable', { kind: 'class', ifaces: ['java.lang.Iterable'], sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.utils.Array,boolean': '_Array$ArrayIterable$Array$boolean', 'com.badlogic.gdx.utils.Array': '_Array$ArrayIterable$Array' } });
