// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ProductionInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let AbstractGoods, WorkLocation, CollectionUtils;

/**
 * Container for information about production in a colony.
 */
export class ProductionInfo extends JObject {
  /**
   * The maximum production possible given unlimited input.
   */
  maximumProduction: List<AbstractGoods> = null;
  /**
   * The actual production.
   */
  production: List<AbstractGoods> = null;
  /**
   * The maximum consumption possible given unlimited input.
   */
  maximumConsumption: List<AbstractGoods> = null;
  /**
   * The actual consumption.
   */
  consumption: List<AbstractGoods> = null;
  _ProductionInfo(): this {
    this.maximumProduction = new ArrayList();
    this.production = new ArrayList();
    this.maximumConsumption = new ArrayList();
    this.consumption = new ArrayList();
    return this;
  }
  getConsumption(): List<AbstractGoods> {
    return this.consumption;
  }
  setConsumption(newConsumption: List<AbstractGoods>): void {
    this.consumption = newConsumption;
  }
  addConsumption(goods: AbstractGoods): void {
    this.consumption.add(goods);
  }
  getProduction(): List<AbstractGoods> {
    return this.production;
  }
  setProduction(newProduction: List<AbstractGoods>): void {
    this.production = newProduction;
  }
  addProduction$AbstractGoods(goods: AbstractGoods): void {
    this.production.add(goods);
  }
  addProduction$List(goods: List<AbstractGoods>): void {
    this.production.addAll(goods);
  }
  getMaximumProduction(): List<AbstractGoods> {
    return this.maximumProduction;
  }
  setMaximumProduction(newMaximumProduction: List<AbstractGoods>): void {
    this.maximumProduction = newMaximumProduction;
  }
  addMaximumProduction(goods: AbstractGoods): void {
    this.maximumProduction.add(goods);
  }
  /**
   * Get a list of the goods that are in production deficit, that is,
   * those which are produced at less than their maximum possible rate.
   *
   * @return A list of {@code AbstractGoods}.
   */
  getProductionDeficit(): List<AbstractGoods> {
    let mapper = (ag) => {
      let agMax = CollectionUtils.find$Collection$Predicate(this.maximumProduction, AbstractGoods.matches(ag.getType()));
      let amount = (agMax == null) ? 0 : (agMax.getAmount() - ag.getAmount()) | 0;
      return (amount <= 0) ? null : new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), amount);
    };
    return (this.maximumProduction.isEmpty()) ? WorkLocation.EMPTY_LIST : CollectionUtils.transform$Collection$Predicate$Function$Collector(this.production, CollectionUtils.alwaysTrue(), mapper, CollectionUtils.toListNoNulls());
  }
  /**
   * Get a list of the goods that are in consumption deficit, that is,
   * those which are consumed at less than their maximum possible rate.
   *
   * @return A list of {@code AbstractGoods}.
   */
  getConsumptionDeficit(): List<AbstractGoods> {
    let mapper = (ag) => {
      let agMax = CollectionUtils.find$Collection$Predicate(this.maximumConsumption, AbstractGoods.matches(ag.getType()));
      let amount = (agMax == null) ? 0 : (agMax.getAmount() - ag.getAmount()) | 0;
      return (amount === 0) ? null : new AbstractGoods()._AbstractGoods$GoodsType$int(ag.getType(), amount);
    };
    return (this.maximumConsumption.isEmpty()) ? WorkLocation.EMPTY_LIST : CollectionUtils.transform$Collection$Predicate$Function$Collector(this.consumption, CollectionUtils.alwaysTrue(), mapper, CollectionUtils.toListNoNulls());
  }
  /**
   * Does production equal maximum production?
   *
   * @return True if at maximum production.
   */
  atMaximumProduction(): boolean {
    if (this.maximumProduction.isEmpty()) {
      return true;
    }
    for (const $it0 = this.production.iterator(); $it0.hasNext(); ) {
      let ag = $it0.next();
      let agMax = CollectionUtils.find$Collection$Predicate(this.maximumConsumption, AbstractGoods.matches(ag.getType()));
      if (agMax != null && agMax.getAmount() > ag.getAmount()) {
        return false;
      }
    }
    return true;
  }
  getMaximumConsumption(): List<AbstractGoods> {
    return this.maximumConsumption;
  }
  setMaximumConsumption(newMaximumConsumption: List<AbstractGoods>): void {
    this.maximumConsumption = newMaximumConsumption;
  }
  addMaximumConsumption(goods: AbstractGoods): void {
    this.maximumConsumption.add(goods);
  }
  append(result: StringBuilder, key: string, list: List<AbstractGoods>): void {
    if (list.isEmpty()) {
      return;
    }
    result.append(key).append(': ');
    for (const $it1 = list.iterator(); $it1.hasNext(); ) {
      let goods = $it1.next();
      result.append($J.str(goods));
      if (goods.getType().getStoredAs() !== goods.getType()) {
        result.append(' [').append(goods.getType().getStoredAs().getId()).append(String.fromCharCode(93 /* ']' */));
      }
      result.append(', ');
    }
    let length = result.length();
    result.replace((length - 2) | 0, length, '\n');
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let result = new StringBuilder();
    this.append(result, 'Production', this.production);
    this.append(result, ' Consumption', this.consumption);
    this.append(result, ' Maximum Production', this.maximumProduction);
    this.append(result, ' Maximum Consumption', this.maximumConsumption);
    return result.toString();
  }
}

$J.define(ProductionInfo, 'net.sf.freecol.common.model.ProductionInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ProductionInfo' }, returns: { 'getMaximumConsumption': 'java.util.List', 'getConsumptionDeficit': 'java.util.List', 'getProductionDeficit': 'java.util.List', 'getMaximumProduction': 'java.util.List', 'getProduction': 'java.util.List', 'getConsumption': 'java.util.List' }, meths: { 'addProduction(java.util.List)': 'addProduction$List', 'addProduction(net.sf.freecol.common.model.AbstractGoods)': 'addProduction$AbstractGoods' } });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  WorkLocation = $J.load('net.sf.freecol.common.model.WorkLocation');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
