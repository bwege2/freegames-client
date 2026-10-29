// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TypeCountMap.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject, StringBuilder } from '../../../../../../jre/index.ts';

let CollectionUtils;

/**
 * A map that incorporates a count.
 *
 * FIXME: implement entire Map interface
 */
export class TypeCountMap<T> extends JObject {
  values_: JMap<T, number> = null;
  _TypeCountMap(): this {
    this.values_ = new HashMap();
    return this;
  }
  getValues(): JMap<T, number> {
    return this.values_;
  }
  getCount(key: T): number {
    let value = this.values_.get(key);
    return value == null ? 0 : value;
  }
  incrementCount(key: T, newCount: number): number {
    let oldValue = this.values_.get(key);
    if (oldValue == null) {
      return this.values_.put(key, newCount);
    } else if (oldValue === -newCount) {
      this.values_.remove(key);
      return null;
    } else {
      return this.values_.put(key, (oldValue + newCount) | 0);
    }
  }
  add(other: TypeCountMap<T>): void {
    CollectionUtils.forEachMapEntry$Map$Consumer(other.values_, (e) => this.incrementCount(e.getKey(), e.getValue()));
  }
  clear(): void {
    this.values_.clear();
  }
  keySet(): JSet<T> {
    return this.values_.keySet();
  }
  values(): Collection<number> {
    return this.values_.values();
  }
  containsKey(key: T): boolean {
    return this.values_.containsKey(key);
  }
  isEmpty(): boolean {
    return this.values_.isEmpty();
  }
  size(): number {
    return this.values_.size();
  }
  putAll(other: TypeCountMap<T>): void {
    this.values_.putAll(other.values_);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append($J.getClass(this).getName());
    CollectionUtils.forEachMapEntry$Map$Consumer(this.values_, (e) => sb.append(' [').append(String(e.getKey().getIndex())).append(String.fromCharCode(44 /* ',' */)).append($J.str(e.getValue())).append(String.fromCharCode(93 /* ']' */)));
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(TypeCountMap, 'net.sf.freecol.common.model.TypeCountMap', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_TypeCountMap' }, returns: { 'isEmpty': 'boolean', 'getValues': 'java.util.Map' } });
$J.module(() => {
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
