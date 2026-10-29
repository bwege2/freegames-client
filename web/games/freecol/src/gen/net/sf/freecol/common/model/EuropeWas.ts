// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/EuropeWas.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { ObjectWas } from './ObjectWas.ts';

let Europe, CollectionUtils;

/**
 * Helper container to remember the Europe state prior to some
 * change, and fire off any consequent property changes.
 */
export class EuropeWas extends ObjectWas {
  static logger: Logger = null;
  /**
   * The Europe to remember.
   */
  europe: Europe = null;
  /**
   * The initial number of units in the Europe.
   */
  unitCount: number = 0;
  /**
   * Create a new wrapper to remember the state of Europe.
   *
   * @param europe The {@code Europe} to remember.
   */
  _EuropeWas(europe: Europe): this {
    this._ObjectWas();
    this.europe = europe;
    this.unitCount = europe.getUnitCount();
    return this;
  }
  /**
   * Gets a unit added to Europe since this EuropeWas was sampled.
   *
   * As long there is at least one new unit, pick the one with the
   * highest numeric id.
   *
   * @return The newest {@code Unit} or null if none has been added.
   */
  getNewUnit(): Unit {
    return (this.europe.getUnitCount() <= this.unitCount) ? null : CollectionUtils.maximize$Stream$Comparator(this.europe.getUnits(), CollectionUtils.cachingIntComparator(($p0) => $p0.getIdNumber()));
  }
  /**
   * {@inheritDoc}
   */
  fireChanges(): boolean {
    let newCount = this.europe.getUnitCount();
    if (newCount !== this.unitCount) {
      this.europe.firePropertyChange$String$int$int(Europe.UNIT_CHANGE, this.unitCount, newCount);
      return true;
    }
    return false;
  }
  static $clinit() {
    EuropeWas.logger = Logger.getLogger($J.cls(EuropeWas).getName());
  }
}

$J.define(EuropeWas, 'net.sf.freecol.common.model.EuropeWas', { kind: 'class', sup: 'net.sf.freecol.common.model.ObjectWas', ctors: { 'net.sf.freecol.common.model.Europe': '_EuropeWas' }, returns: { 'getNewUnit': 'net.sf.freecol.common.model.Unit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
