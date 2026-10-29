// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ResourceType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let CollectionUtils;

/**
 * The types of resources (e.g. fish bonus) found on a tile.
 */
export class ResourceType extends FreeColSpecObjectType {
  static readonly TAG: string = 'resource-type';
  /**
   * Maximum and minimum values for this resource type.
   */
  maxValue: number = 0;
  /**
   * Maximum and minimum values for this resource type.
   */
  minValue: number = 0;
  static readonly MAXIMUM_VALUE_TAG: string = 'maximum-value';
  static readonly MINIMUM_VALUE_TAG: string = 'minimum-value';
  /**
   * Creates a new resource type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _ResourceType(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    return this;
  }
  /**
   * Gets the maximum value for this resource.
   *
   * @return The maximum value.
   */
  getMaxValue(): number {
    return this.maxValue;
  }
  /**
   * Gets the minimum value for this resource.
   *
   * @return The minimum value.
   */
  getMinValue(): number {
    return this.minValue;
  }
  /**
   * Get the best goods type to make with this resource type.
   *
   * @return The best {@code GoodsType}.
   */
  getBestGoodsType(): GoodsType {
    let spec = this.getSpecification();
    let comp = CollectionUtils.cachingDoubleComparator((m) => $J.boxD(spec.getInitialPrice(spec.getGoodsType(m.getId())) * m.applyTo$float(100)));
    let best = CollectionUtils.maximize$Stream$Comparator(this.getModifiers$(), comp);
    return (best == null) ? null : spec.getGoodsType(best.getId());
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ResourceType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.maxValue = o.getMaxValue();
    this.minValue = o.getMinValue();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.maxValue > -1) {
      xw.writeAttribute$String$int(ResourceType.MAXIMUM_VALUE_TAG, this.maxValue);
      xw.writeAttribute$String$int(ResourceType.MINIMUM_VALUE_TAG, this.minValue);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.maxValue = xr.getAttribute$String$int(ResourceType.MAXIMUM_VALUE_TAG, -1);
    this.minValue = xr.getAttribute$String$int(ResourceType.MINIMUM_VALUE_TAG, -1);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ResourceType.TAG;
  }
}

$J.define(ResourceType, 'net.sf.freecol.common.model.ResourceType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_ResourceType' }, returns: { 'getXMLTagName': 'java.lang.String', 'getBestGoodsType': 'net.sf.freecol.common.model.GoodsType', 'getMinValue': 'int', 'getMaxValue': 'int' } });
$J.module(() => {
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
