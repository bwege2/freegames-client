// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TileTypeChange.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let AbstractGoods, GoodsType, TileType, Utils;

/**
 * A change in a tile type, including some bonus production when this occurs.
 */
export class TileTypeChange extends FreeColSpecObjectType {
  static readonly TAG: string = 'tile-type-change';
  /**
   * The original tile type.
   */
  from: TileType = null;
  /**
   * The destination tile type.
   */
  to: TileType = null;
  /**
   * The goods produced by the tile type change, e.g. lumber when
   * clearing a forest.
   */
  production: AbstractGoods = null;
  static readonly FROM_TAG: string = 'from';
  static readonly GOODS_TYPE_TAG: string = 'goods-type';
  static readonly PRODUCTION_TAG: string = 'production';
  static readonly TO_TAG: string = 'to';
  static readonly VALUE_TAG: string = 'value';
  /**
   * Create a new tile type change.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _TileTypeChange$Specification(specification: Specification): this {
    this._FreeColSpecObjectType$Specification(specification);
    return this;
  }
  /**
   * Creates a new {@code TileTypeChange} instance.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if an error occurs
   */
  _TileTypeChange$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._TileTypeChange$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Gets the original tile type.
   *
   * @return The original tile type.
   */
  getFrom(): TileType {
    return this.from;
  }
  /**
   * Gets the destination tile type.
   *
   * @return The destination tile type.
   */
  getTo(): TileType {
    return this.to;
  }
  /**
   * Gets the production consequent to the type change.
   *
   * @return The consequent production.
   */
  getProduction(): AbstractGoods {
    return this.production;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TileTypeChange));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.from = o.getFrom();
    this.to = o.getTo();
    this.production = o.getProduction();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    xw.writeAttribute$String$FreeColObject(TileTypeChange.FROM_TAG, this.from);
    xw.writeAttribute$String$FreeColObject(TileTypeChange.TO_TAG, this.to);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.production != null) {
      xw.writeStartElement(TileTypeChange.PRODUCTION_TAG);
      xw.writeAttribute$String$FreeColObject(TileTypeChange.GOODS_TYPE_TAG, this.production.getType());
      xw.writeAttribute$String$int(TileTypeChange.VALUE_TAG, this.production.getAmount());
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    this.from = xr.getType(spec, TileTypeChange.FROM_TAG, $J.cls(TileType), null);
    this.to = xr.getType(spec, TileTypeChange.TO_TAG, $J.cls(TileType), null);
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.production = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(TileTypeChange.PRODUCTION_TAG, tag)) {
        let type$ = xr.getType(spec, TileTypeChange.GOODS_TYPE_TAG, $J.cls(GoodsType), null);
        let amount = xr.getAttribute$String$int(TileTypeChange.VALUE_TAG, 0);
        this.production = new AbstractGoods()._AbstractGoods$GoodsType$int(type$, amount);
        xr.closeTag$String(TileTypeChange.PRODUCTION_TAG);
      } else {
        throw new XMLStreamException('Bogus TileTypeChange tag: ' + tag);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TileTypeChange.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(other: any): boolean {
    if (other instanceof TileTypeChange) {
      return this.compareTo(other) === 0 && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.from)) | 0;
    hash = (Math.imul(37, hash) + Utils.hashCode(this.to)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.production)) | 0;
  }
}

$J.define(TileTypeChange, 'net.sf.freecol.common.model.TileTypeChange', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_TileTypeChange$FreeColXMLReader$Specification', 'net.sf.freecol.common.model.Specification': '_TileTypeChange$Specification' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getProduction': 'net.sf.freecol.common.model.AbstractGoods', 'getTo': 'net.sf.freecol.common.model.TileType', 'getFrom': 'net.sf.freecol.common.model.TileType' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' } });
$J.module(() => {
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  TileType = $J.load('net.sf.freecol.common.model.TileType');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
