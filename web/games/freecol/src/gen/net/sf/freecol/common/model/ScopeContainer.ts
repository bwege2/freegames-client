// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ScopeContainer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JObject, Stream } from '../../../../../../jre/index.ts';

let CollectionUtils;

/**
 * How scopes are handled.
 */
export class ScopeContainer extends JObject {
  /**
   * Cached empty scope stream.
   */
  static noStream: Stream<Scope> = null;
  /**
   * Cached empty scope list.
   */
  static noList: List<Scope> = null;
  /**
   * Cached standard scope comparator.
   */
  static scopeComparator: Comparator<Scope> = null;
  /**
   * The scopes.
   */
  scopes: List<Scope> = null;
  /**
   * Trivial constructor.
   */
  _ScopeContainer(): this {
    this.scopes = null;
    return this;
  }
  /**
   * Is this container empty?
   *
   * @return True if no scopes are present.
   */
  isEmpty(): boolean {
    return this.scopes == null || this.scopes.isEmpty();
  }
  /**
   * Get the scopes applicable to this effect.
   *
   * @return A list of {@code Scope}s.
   */
  getList(): List<Scope> {
    return (this.isEmpty()) ? ScopeContainer.noList : this.scopes;
  }
  /**
   * Get the scopes applicable to this effect as a stream.
   *
   * @return A stream of {@code Scope}s.
   */
  get(): Stream<Scope> {
    return (this.isEmpty()) ? ScopeContainer.noStream : this.scopes.stream();
  }
  /**
   * Set the scopes for this object.
   *
   * @param scopes A list of new {@code Scope}s.
   */
  set(scopes: List<Scope>): void {
    if (this.scopes == null || scopes == null) {
      this.scopes = scopes;
    } else {
      this.clear();
      this.addAll$Collection(scopes);
    }
  }
  /**
   * Clear the scopes.
   */
  clear(): void {
    if (this.scopes != null) {
      this.scopes.clear();
    }
  }
  /**
   * Add a scope.
   *
   * @param scope The {@code Scope} to add.
   */
  add(scope: Scope): void {
    if (scope == null) {
      return;
    }
    if (this.scopes == null) {
      this.scopes = new ArrayList();
    }
    this.scopes.add(scope);
  }
  /**
   * Add all ths scopes from a collection.
   *
   * @param c The {@code Collection} to add from.
   */
  addAll$Collection(c: Collection<Scope>): void {
    if (c == null || c.isEmpty()) {
      return;
    }
    if (this.scopes == null) {
      this.scopes = new ArrayList();
    }
    this.scopes.addAll(c);
  }
  /**
   * Add all the scopes in another scope container.
   *
   * @param other The other {@code ScopeContainer}.
   */
  addAll$ScopeContainer(other: ScopeContainer): void {
    if (other != null) {
      this.addAll$Collection(other.scopes);
    }
  }
  /**
   * Remove a scope.
   *
   * @param scope The {@code Scope} to remove.
   */
  remove(scope: Scope): void {
    if (this.scopes != null) {
      this.scopes.remove(scope);
    }
  }
  /**
   * Sort the scopes.
   *
   * @param comp The {@code Comparator} that defines the ordering.
   */
  sort(comp: Comparator<Scope>): void {
    if (this.scopes != null) {
      this.scopes.sort(comp);
    }
  }
  /**
   * Does this scope container apply to the given object?
   * Trivially true if there are no actual scopes present,
   * otherwise at least one of the scopes must apply directly.
   *
   * @param object The {@code FreeColObject} to check.
   * @return True if this effect applies.
   */
  appliesTo(object$: FreeColObject): boolean {
    return this.isEmpty() || (CollectionUtils.any$Collection$Predicate(this.scopes, (s) => s.appliesTo(object$)));
  }
  /**
   * Write the scopes to a stream.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there are any problems writing
   *      to the stream.
   */
  toXML(xw: FreeColXMLWriter): void {
    if (this.scopes == null) {
      return;
    }
    this.sort(ScopeContainer.scopeComparator);
    for (const $it0 = this.scopes.iterator(); $it0.hasNext(); ) {
      let scope = $it0.next();
      scope.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o === this) {
      return true;
    }
    if (o instanceof ScopeContainer) {
      let sc = o;
      if (this.isEmpty() !== sc.isEmpty()) {
        return false;
      }
      if (this.isEmpty()) {
        return true;
      }
      let sl1 = new ArrayList(this.scopes);
      let sl2 = new ArrayList(sc.scopes);
      sl1.sort(ScopeContainer.scopeComparator);
      sl2.sort(ScopeContainer.scopeComparator);
      while (!sl1.isEmpty()) {
        if (sl2.isEmpty()) {
          return false;
        }
        let s1 = sl1.removeAt(0);
        let s2 = sl2.removeAt(0);
        if (!s1.equals(s2)) {
          return false;
        }
      }
      return sl2.isEmpty();
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    for (const $it1 = this.getList().iterator(); $it1.hasNext(); ) {
      let s = $it1.next();
      hash = (hash + Math.imul(37, s.hashCode())) | 0;
    }
    return hash;
  }
  static isScopeContainerEmpty(sc: ScopeContainer): boolean {
    return sc == null || sc.isEmpty();
  }
  static getScopeList(sc: ScopeContainer): List<Scope> {
    return (sc == null) ? ScopeContainer.noList : sc.getList();
  }
  static getScopes(sc: ScopeContainer): Stream<Scope> {
    return (sc == null) ? ScopeContainer.noStream : sc.get();
  }
  static addScope(sc: ScopeContainer, scope: Scope): ScopeContainer {
    if (sc == null) {
      sc = new ScopeContainer()._ScopeContainer();
    }
    sc.add(scope);
    return sc;
  }
  static removeScope(sc: ScopeContainer, scope: Scope): void {
    if (sc != null) {
      sc.remove(scope);
    }
  }
  static setScopes(sc: ScopeContainer, c: Collection<Scope>): ScopeContainer {
    if (sc == null) {
      if (c == null || c.isEmpty()) {
        return null;
      }
      sc = new ScopeContainer()._ScopeContainer();
    } else {
      sc.clear();
    }
    sc.addAll$Collection(c);
    return sc;
  }
  static clearScopes(sc: ScopeContainer): void {
    if (sc != null) {
      sc.clear();
    }
  }
  static equalScopes(sc1: ScopeContainer, sc2: ScopeContainer): boolean {
    return (sc1 == null) ? sc2 == null : (sc2 == null) ? false : sc1.equals(sc2);
  }
  static scopeContainerAppliesTo(sc: ScopeContainer, fco: FreeColObject): boolean {
    return sc == null || sc.appliesTo(fco);
  }
  static scopeContainerToXML(sc: ScopeContainer, xw: FreeColXMLWriter): void {
    if (sc != null) {
      sc.toXML(xw);
    }
  }
  static $clinit() {
    ScopeContainer.noStream = Stream.empty();
    ScopeContainer.noList = Collections.emptyList();
    ScopeContainer.scopeComparator = (s1, s2) => {
      return $J.icmp(s1.hashCode(), s2.hashCode());
    };
  }
}

$J.define(ScopeContainer, 'net.sf.freecol.common.model.ScopeContainer', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ScopeContainer' }, returns: { 'hashCode': 'int', 'get': 'java.util.stream.Stream', 'getList': 'java.util.List', 'isEmpty': 'boolean' }, meths: { 'addAll(net.sf.freecol.common.model.ScopeContainer)': 'addAll$ScopeContainer', 'addAll(java.util.Collection)': 'addAll$Collection' }, clinit: true, lazy: ['noStream', 'noList', 'scopeComparator'] });
$J.module(() => {
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
