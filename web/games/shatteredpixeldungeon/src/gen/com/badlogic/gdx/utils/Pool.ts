// @ts-nocheck
// Pool.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject } from '../../../../../jre/index.ts';

let Array_;

/**
 * A pool of objects that can be reused to avoid allocation.
 * @see PoolManager
 * @author Nathan Sweet
 */
export class Pool<T> extends JObject {
  /**
   * The maximum number of objects that will be pooled.
   */
  max: number = 0;
  /**
   * The highest number of free objects. Can be reset any time.
   */
  peak: number = 0;
  freeObjects: Array_<T> = null;
  /**
   * Creates a pool with an initial capacity of 16 and no maximum.
   */
  _Pool$(): this {
    this._Pool$int$int(16, 2147483647);
    return this;
  }
  /**
   * @param initialCapacity The initial size of the array supporting the pool. No objects are created/pre-allocated. Use
   *           {@link #fill(int)} after instantiation if needed.
   * @param max The maximum number of free objects to store in this pool.
   */
  _Pool$int$int(initialCapacity: number, max: number): this {
    this.freeObjects = new Array_()._Array$boolean$int(false, initialCapacity);
    this.max = max;
    return this;
  }
  /**
   * Returns an object from this pool. The object may be new (from {@link #newObject()}) or reused (previously
   * {@link #free(Object) freed}).
   */
  obtain(): T {
    return this.freeObjects.size_ === 0 ? this.newObject() : this.freeObjects.pop();
  }
  /**
   * Puts the specified object in the pool, making it eligible to be returned by {@link #obtain()}. If the pool already contains
   * {@link #max} free objects, the specified object is {@link #discard(Object) discarded}, it is not reset and not added to the
   * pool.
   * <p>
   * The pool does not check if an object is already freed, so the same object must not be freed multiple times.
   */
  free(object$: T): void {
    if (object$ == null) {
      throw new IllegalArgumentException('object cannot be null.');
    }
    if (this.freeObjects.size_ < this.max) {
      this.freeObjects.add$Object(object$);
      this.peak = Math.max(this.peak, this.freeObjects.size_);
      this.reset(object$);
    } else {
      this.discard(object$);
    }
  }
  /**
   * Called when an object is freed to clear the state of the object for possible later reuse. The default implementation calls
   * {@link Poolable#reset()} if the object is {@link Poolable}.
   */
  reset(object$: T): void {
    if ($J.isa(object$, Pool$Poolable)) {
      (object$).reset();
    }
  }
  /**
   * Called when an object is discarded. This is the case when an object is freed, but the maximum capacity of the pool is
   * reached, and when the pool is {@link #clear() cleared}
   */
  discard(object$: T): void {
    this.reset(object$);
  }
  /**
   * Puts the specified objects in the pool. Null objects within the array are silently ignored.
   * <p>
   * The pool does not check if an object is already freed, so the same object must not be freed multiple times.
   * @see #free(Object)
   */
  freeAll(objects: Array_<T>): void {
    if (objects == null) {
      throw new IllegalArgumentException('objects cannot be null.');
    }
    let freeObjects = this.freeObjects;
    let max = this.max;
    for (let i = 0, n = objects.size_; i < n; i++) {
      let object$ = objects.get(i);
      if (object$ == null) {
        continue;
      }
      if (freeObjects.size_ < max) {
        freeObjects.add$Object(object$);
        this.reset(object$);
      } else {
        this.discard(object$);
      }
    }
    this.peak = Math.max(this.peak, freeObjects.size_);
  }
}

/**
 * Objects implementing this interface will have {@link #reset()} called when passed to {@link Pool#free(Object)}.
 */
export class Pool$Poolable {
}

$J.define(Pool, 'com.badlogic.gdx.utils.Pool', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int': '_Pool$int$int', 'int': '_Pool$int', '': '_Pool$' } });
$J.define(Pool$Poolable, 'com.badlogic.gdx.utils.Pool$Poolable', { kind: 'interface' });
$J.module(() => {
  Array_ = $J.load('com.badlogic.gdx.utils.Array');
});
