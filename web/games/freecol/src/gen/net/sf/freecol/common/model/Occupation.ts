// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Occupation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject, StringBuilder } from '../../../../../../jre/index.ts';

let CollectionUtils;

/**
 * Simple container to define where and what a unit is working on.
 */
export class Occupation extends JObject {
  workLocation: WorkLocation = null;
  productionType: ProductionType = null;
  workType: GoodsType = null;
  /**
   * Create an Occupation.
   *
   * @param workLocation The {@code WorkLocation} to work at.
   * @param productionType The {@code ProductionType} to
   *     use at the work location.
   * @param workType The {@code GoodsType} to produce at the
   *     work location with the production type.
   */
  _Occupation(workLocation: WorkLocation, productionType: ProductionType, workType: GoodsType): this {
    this.workLocation = workLocation;
    this.productionType = productionType;
    this.workType = workType;
    return this;
  }
  /**
   * Install a unit into this occupation.
   *
   * @param unit The {@code Unit} to establish.
   * @return True if the unit is installed.
   */
  install(unit: Unit): boolean {
    if (!unit.setLocation(this.workLocation)) {
      return false;
    }
    if (this.productionType !== this.workLocation.getProductionType()) {
      this.workLocation.setProductionType(this.productionType);
    }
    if (this.workType !== unit.getWorkType()) {
      unit.changeWorkType(this.workType);
    }
    return true;
  }
  /**
   * Improve this occupation to the best available production for the
   * given unit type.
   *
   * @param unitType The {@code UnitType} to produce the goods.
   * @param wl The {@code WorkLocation} to check.
   * @param bestAmount The best amount of goods produced found so far.
   * @param workTypes A collection of {@code GoodsType} to
   *     consider producing.
   * @param alone True if the unit is alone, and can set the
   *     production type.
   * @param lb A {@code LogBuilder} to log to.
   * @return The best amount of production found.
   */
  improve$UnitType$WorkLocation$int$Collection$boolean$LogBuilder$Occupation(unitType: UnitType, wl: WorkLocation, bestAmount: number, workTypes: Collection<GoodsType>, alone: boolean, lb: LogBuilder): number {
    lb.add([' alone=', alone]);
    let productionTypes = new ArrayList();
    if (alone) {
      productionTypes.addAll(wl.getAvailableProductionTypes(false));
    } else {
      productionTypes.add(wl.getProductionType());
    }
    let colony = wl.getColony();
    for (const $it0 = CollectionUtils.transform$Collection$Predicate(productionTypes, CollectionUtils.isNotNull$()).iterator(); $it0.hasNext(); ) {
      let pt = $it0.next();
      lb.add(['\n      try=', pt]);
      for (const $it1 = (CollectionUtils.transform$Collection$Predicate(workTypes, CollectionUtils.isNotNull$Function((g) => pt.getOutput(g)))).iterator(); $it1.hasNext(); ) {
        let gt = $it1.next();
        let minInput = CollectionUtils.min$Stream$ToIntFunction(pt.getInputs(), (ag) => Math.max(colony.getNetProductionOf(ag.getType()), colony.getGoodsCount(ag.getType())));
        let potential = wl.getPotentialProduction(gt, unitType);
        let amount = Math.min(minInput, potential);
        lb.add([' ', gt.getSuffix$(), '=', amount, '/', minInput, '/', potential, ((bestAmount < amount) ? '!' : '')]);
        if (bestAmount < amount) {
          bestAmount = amount;
          this.workLocation = wl;
          this.productionType = pt;
          this.workType = gt;
        }
      }
    }
    return bestAmount;
  }
  /**
   * Improve this occupation to the best available production for the
   * given unit.
   *
   * @param unit The {@code Unit} to produce the goods.
   * @param wl The {@code WorkLocation} to check.
   * @param bestAmount The best amount of goods produced found so far.
   * @param workTypes A collection of {@code GoodsType} to
   *     consider producing.
   * @param lb A {@code LogBuilder} to log to.
   * @return The best amount of production found.
   */
  improve$Unit$WorkLocation$int$Collection$LogBuilder(unit: Unit, wl: WorkLocation, bestAmount: number, workTypes: Collection<GoodsType>, lb: LogBuilder): number {
    let present = unit.getLocation() === wl;
    lb.add(['\n    ', wl, ((!present && !wl.canAdd(unit)) ? ' no-add' : '')]);
    if (!present && !wl.canAdd(unit)) {
      return bestAmount;
    }
    let alone = wl.getProductionType() == null || wl.isEmpty() || (present && wl.getUnitCount() === 1);
    return this.improve$UnitType$WorkLocation$int$Collection$boolean$LogBuilder$Occupation(unit.getType(), wl, bestAmount, workTypes, alone, lb);
  }
  /**
   * Improve this occupation to the best available production for the
   * given unit type.
   *
   * @param unitType The {@code UnitType} to produce the goods.
   * @param wl The {@code WorkLocation} to check.
   * @param bestAmount The best amount of goods produced found so far.
   * @param workTypes A collection of {@code GoodsType} to
   *     consider producing.
   * @param lb A {@code LogBuilder} to log to.
   * @return The best amount of production found.
   */
  improve$UnitType$WorkLocation$int$Collection$LogBuilder(unitType: UnitType, wl: WorkLocation, bestAmount: number, workTypes: Collection<GoodsType>, lb: LogBuilder): number {
    return this.improve$UnitType$WorkLocation$int$Collection$boolean$LogBuilder$Occupation(unitType, wl, bestAmount, workTypes, wl.isEmpty(), lb);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append('[Occupation ').append($J.str(this.workLocation));
    if (this.workType != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(this.workType.getSuffix$());
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(Occupation, 'net.sf.freecol.common.model.Occupation', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.WorkLocation,net.sf.freecol.common.model.ProductionType,net.sf.freecol.common.model.GoodsType': '_Occupation' }, meths: { 'improve(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.WorkLocation,int,java.util.Collection,net.sf.freecol.common.util.LogBuilder)': 'improve$UnitType$WorkLocation$int$Collection$LogBuilder', 'improve(net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.WorkLocation,int,java.util.Collection,net.sf.freecol.common.util.LogBuilder)': 'improve$Unit$WorkLocation$int$Collection$LogBuilder', 'improve(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.WorkLocation,int,java.util.Collection,boolean,net.sf.freecol.common.util.LogBuilder)': 'improve$UnitType$WorkLocation$int$Collection$boolean$LogBuilder$Occupation' } });
$J.module(() => {
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
