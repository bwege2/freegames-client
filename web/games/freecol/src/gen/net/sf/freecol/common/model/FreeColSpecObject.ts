// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/FreeColSpecObject.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColObject } from './FreeColObject.ts';

/**
 * A FreeColObject that also contains a Specification.
 */
export class FreeColSpecObject extends FreeColObject {
  /**
   * The {@code Specification} this object uses, which may be null.
   */
  specification: Specification = null;
  /**
   * Create a new specification-object.
   *
   * @param specification The {@code Specification} to use.
   */
  _FreeColSpecObject(specification: Specification): this {
    this._FreeColObject();
    this.specification = specification;
    return this;
  }
  /**
   * Get the specification.  It may be null.
   *
   * @return The {@code Specification} used by this object.
   */
  getSpecification(): Specification {
    return this.specification;
  }
  /**
   * Sets the specification for this object. 
   *
   * @param specification The {@code Specification} to use.
   */
  setSpecification(specification: Specification): void {
    this.specification = specification;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(FreeColSpecObject));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.specification = o.getSpecification();
    return true;
  }
}

$J.define(FreeColSpecObject, 'net.sf.freecol.common.model.FreeColSpecObject', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.model.Specification': '_FreeColSpecObject' }, returns: { 'getSpecification': 'net.sf.freecol.common.model.Specification' } });
