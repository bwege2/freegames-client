// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/PlunderType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let RandomRange;

/**
 * The plunder available from a settlement.
 */
export class PlunderType extends FreeColSpecObjectType {
  static readonly TAG: string = 'plunder';
  /**
   * The range of plunder amounts.
   */
  plunder: RandomRange = null;
  /**
   * Creates a new plunder type.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _PlunderType$String$Specification(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    return this;
  }
  /**
   * Creates a new plunder type.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there is problem reading the stream.
   */
  _PlunderType$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._FreeColSpecObjectType$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Gets the plunder range available for the supplied unit.
   *
   * @return The plunder range, or null if none applicable.
   */
  getPlunder(): RandomRange {
    return this.plunder;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(PlunderType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.plunder = o.getPlunder();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.plunder != null) {
      this.plunder.writeAttributes(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.plunder = new RandomRange()._RandomRange$FreeColXMLReader(xr);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return PlunderType.TAG;
  }
}

$J.define(PlunderType, 'net.sf.freecol.common.model.PlunderType', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_PlunderType$FreeColXMLReader$Specification', 'java.lang.String,net.sf.freecol.common.model.Specification': '_PlunderType$String$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getPlunder': 'net.sf.freecol.common.model.RandomRange' } });
$J.module(() => {
  RandomRange = $J.load('net.sf.freecol.common.model.RandomRange');
});
