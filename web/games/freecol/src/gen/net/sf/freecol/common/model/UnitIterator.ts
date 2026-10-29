// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/UnitIterator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JFunction, JObject } from '../../../../../../jre/index.ts';

let Unit, CollectionUtils;

/**
 * An {@code Iterator} of {@link Unit}s that can be made active.
 */
export class UnitIterator extends JObject {
  /**
   * The player that owns the units.
   */
  owner: Player = null;
  /**
   * The admission predicate.
   */
  predicate: Predicate<Unit> = null;
  /**
   * The current cache of units.
   */
  units: List<Unit> = null;
  /**
   * Creates a new {@code UnitIterator}.
   *
   * @param owner The {@code Player} that needs an iterator
   *     of it's units.
   * @param predicate A {@code Predicate} for deciding
   *     whether a {@code Unit} should be included in the
   *     {@code Iterator} or not.
   */
  _UnitIterator(owner: Player, predicate: Predicate<Unit>): this {
    this.units = new ArrayList();
    this.owner = owner;
    this.predicate = predicate;
    this.update();
    return this;
  }
  /**
   * Update the internal units list with units that satisfy the
   * predicate.
   */
  update(): void {
    this.units.clear();
    this.units.addAll(CollectionUtils.transform$Stream$Predicate$Function$Comparator(this.owner.getUnits(), (u) => this.predicate(u), JFunction.identity(), Unit.locComparator));
  }
  /**
   * Set the next valid unit.
   *
   * @param unit The {@code Unit} to put at the front of the list.
   * @return True if the operation succeeds.
   */
  setNext(unit: Unit): boolean {
    if (this.predicate(unit)) {
      let sentinel = CollectionUtils.first$Collection(this.units);
      while (!this.units.isEmpty()) {
        if (this.units.get(0) === unit) {
          return true;
        }
        this.units.removeAt(0);
      }
      this.update();
      while (!this.units.isEmpty() && this.units.get(0) !== sentinel) {
        if (this.units.get(0) === unit) {
          return true;
        }
        this.units.removeAt(0);
      }
    }
    return false;
  }
  /**
   * Removes a specific unit from this unit iterator.
   *
   * @param u The {@code Unit} to remove.
   * @return True if the unit was removed.
   */
  remove$Unit(u: Unit): boolean {
    return this.units.remove(u);
  }
  /**
   * Reset the iterator.
   */
  reset(): void {
    this.update();
  }
  /**
   * {@inheritDoc}
   */
  hasNext(): boolean {
    while (!this.units.isEmpty()) {
      if (this.predicate(this.units.get(0))) {
        return true;
      }
      this.units.removeAt(0);
    }
    this.update();
    return !this.units.isEmpty();
  }
  /**
   * {@inheritDoc}
   */
  next(): Unit {
    return (this.hasNext()) ? this.units.removeAt(0) : null;
  }
  /**
   * {@inheritDoc}
   */
  remove(): void {
    this.next();
  }
}

$J.define(UnitIterator, 'net.sf.freecol.common.model.UnitIterator', { kind: 'class', ifaces: ['java.util.Iterator'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Player,java.util.function.Predicate': '_UnitIterator' }, returns: { 'hasNext': 'boolean' }, meths: { 'remove(net.sf.freecol.common.model.Unit)': 'remove$Unit' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
