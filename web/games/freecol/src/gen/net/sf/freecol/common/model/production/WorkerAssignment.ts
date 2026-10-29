// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/production/WorkerAssignment.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';

export class WorkerAssignment extends JObject {
  unitType: UnitType = null;
  productionType: ProductionType = null;
  _WorkerAssignment(unitType: UnitType, productionType: ProductionType): this {
    this.unitType = unitType;
    this.productionType = productionType;
    return this;
  }
  getUnitType(): UnitType {
    return this.unitType;
  }
  getProductionType(): ProductionType {
    return this.productionType;
  }
}

$J.define(WorkerAssignment, 'net.sf.freecol.common.model.production.WorkerAssignment', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.ProductionType': '_WorkerAssignment' }, returns: { 'getProductionType': 'net.sf.freecol.common.model.ProductionType', 'getUnitType': 'net.sf.freecol.common.model.UnitType' } });
