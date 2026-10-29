// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/ModListOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ListOption } from './ListOption.ts';

/**
 * Represents an option where the valid choice is a list of
 * FreeColModFiles.
 */
export class ModListOption extends ListOption {
  static readonly TAG: string = 'modListOption';
  /**
   * Creates a new {@code ModListOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _ModListOption$Specification(specification: Specification): this {
    this._ListOption$Specification(specification);
    this.setAllowDuplicates(false);
    return this;
  }
  /**
   * Creates a new {@code ModListOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _ModListOption$String$Specification(id: string, specification: Specification): this {
    this._ListOption$String$Specification(id, specification);
    this.setAllowDuplicates(false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): ModListOption {
    let ret = new ModListOption()._ModListOption$String$Specification(this.getId(), this.getSpecification());
    ret.setValues(this);
    ret.setListValues(this);
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ModListOption.TAG;
  }
}

$J.define(ModListOption, 'net.sf.freecol.common.option.ModListOption', { kind: 'class', sup: 'net.sf.freecol.common.option.ListOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_ModListOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_ModListOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String' } });
