// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ColonyWas.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../jre/index.ts';
import { ObjectWas } from './ObjectWas.ts';

let Colony$ColonyChangeEvent;

/**
 * Helper container to remember a colony state prior to some
 * change, and fire off any consequent property changes.
 */
export class ColonyWas extends ObjectWas {
  static logger: Logger = null;
  colony: Colony = null;
  population: number = 0;
  productionBonus: number = 0;
  buildQueue: List<BuildableType> = null;
  /**
   * Record the state of a colony.
   *
   * @param colony The {@code Colony} to remember.
   */
  _ColonyWas(colony: Colony): this {
    this._ObjectWas();
    this.colony = colony;
    this.population = colony.getUnitCount();
    this.productionBonus = colony.getProductionBonus();
    this.buildQueue = new ArrayList(colony.getBuildQueue());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  fireChanges(): boolean {
    let ret = false;
    let newPopulation = this.colony.getUnitCount();
    if (newPopulation !== this.population) {
      let pc = Colony$ColonyChangeEvent.POPULATION_CHANGE.toString();
      this.colony.firePropertyChange$String$int$int(pc, this.population, newPopulation);
      ret = true;
    }
    let newProductionBonus = this.colony.getProductionBonus();
    if (newProductionBonus !== this.productionBonus) {
      let pc = Colony$ColonyChangeEvent.BONUS_CHANGE.toString();
      this.colony.firePropertyChange$String$int$int(pc, this.productionBonus, newProductionBonus);
      ret = true;
    }
    let newBuildQueue = this.colony.getBuildQueue();
    if (!newBuildQueue.equals(this.buildQueue)) {
      let pc = Colony$ColonyChangeEvent.BUILD_QUEUE_CHANGE.toString();
      this.colony.firePropertyChange$String$Object$Object(pc, this.buildQueue, newBuildQueue);
      ret = true;
    }
    if (this.colony.getGoodsContainer() != null) {
      ret = !!(ret | this.colony.getGoodsContainer().fireChanges());
    }
    return ret;
  }
  static $clinit() {
    ColonyWas.logger = Logger.getLogger($J.cls(ColonyWas).getName());
  }
}

$J.define(ColonyWas, 'net.sf.freecol.common.model.ColonyWas', { kind: 'class', sup: 'net.sf.freecol.common.model.ObjectWas', ctors: { 'net.sf.freecol.common.model.Colony': '_ColonyWas' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony$ColonyChangeEvent = $J.load('net.sf.freecol.common.model.Colony$ColonyChangeEvent');
});
