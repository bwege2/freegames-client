// @ts-nocheck
// DefaultPool.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Pool } from './Pool.ts';

/**
 * Default Pool implementation that creates a new instances of a type based on a supplier.
 */
export class DefaultPool<T> extends Pool {
  poolTypeSupplier: DefaultPool$PoolSupplier<T> = null;
  _DefaultPool$PoolSupplier(supplier: DefaultPool$PoolSupplier<T>): this {
    this._DefaultPool$PoolSupplier$int$int(supplier, 16, 2147483647);
    return this;
  }
  _DefaultPool$PoolSupplier$int$int(supplier: DefaultPool$PoolSupplier<T>, initialCapacity: number, max: number): this {
    this._Pool$int$int(initialCapacity, max);
    this.poolTypeSupplier = supplier;
    return this;
  }
  newObject(): T {
    return $J.fn(this.poolTypeSupplier, 'get')();
  }
}

/**
 * An interface that is used to create objects for the Pool. Even tho not annotated with "FunctionalInterface", it can act as
 * one. <br>
 * You can use a constructor reference or lambda as a PoolSupplier, such as with {@code MyClass::new} or
 * {@code () -> new MyClass()}.
 */
export class DefaultPool$PoolSupplier<T> {
}

$J.define(DefaultPool, 'com.badlogic.gdx.utils.DefaultPool', { kind: 'class', sup: 'com.badlogic.gdx.utils.Pool', ctors: { 'com.badlogic.gdx.utils.DefaultPool$PoolSupplier,int,int': '_DefaultPool$PoolSupplier$int$int', 'com.badlogic.gdx.utils.DefaultPool$PoolSupplier,int': '_DefaultPool$PoolSupplier$int', 'com.badlogic.gdx.utils.DefaultPool$PoolSupplier': '_DefaultPool$PoolSupplier' } });
$J.define(DefaultPool$PoolSupplier, 'com.badlogic.gdx.utils.DefaultPool$PoolSupplier', { kind: 'interface' });
