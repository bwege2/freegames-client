// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/CachingFunction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, HashMap, JObject } from '../../../../../../jre/index.ts';

/**
 * Wrapper for a Function that caches its results.
 */
export class CachingFunction<T, R> extends JObject {
  /**
   * The function to be wrapped.
   */
  wrapped: JFunction<T, R> = null;
  /**
   * A cache of the wrapped values.
   */
  cache: JMap<T, R> = null;
  /**
   * Create a new caching function.
   *
   * @param wrapped The {@code Function} to be wrapped.
   */
  _CachingFunction(wrapped: JFunction<T, R>): this {
    this.cache = new HashMap();
    this.wrapped = wrapped;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  apply(t: T): R {
    let result: R;
    if (this.cache.containsKey(t)) {
      result = this.cache.get(t);
    } else {
      this.cache.put(t, result = this.wrapped(t));
    }
    return result;
  }
}

$J.define(CachingFunction, 'net.sf.freecol.common.util.CachingFunction', { kind: 'class', ifaces: ['java.util.function.Function'], sup: 'java.lang.Object', ctors: { 'java.util.function.Function': '_CachingFunction' } });
