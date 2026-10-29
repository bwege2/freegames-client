// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/PercentageOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { IntegerOption } from './IntegerOption.ts';

/**
 * Represents an option where the result is a value between 0 and 100.
 */
export class PercentageOption extends IntegerOption {
  static logger: Logger = null;
  static readonly TAG: string = 'percentageOption';
  /**
   * Creates a new {@code PercentageOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _PercentageOption$Specification(specification: Specification): this {
    this._IntegerOption$Specification(specification);
    this.setMinimumValue(0);
    this.setMaximumValue(100);
    return this;
  }
  /**
   * Creates a new {@code PercentageOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _PercentageOption$String$Specification(id: string, specification: Specification): this {
    this._IntegerOption$String$Specification(id, specification);
    this.setMinimumValue(0);
    this.setMaximumValue(100);
    return this;
  }
  getXMLTagName(): string {
    return PercentageOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.getValue$())).append('%]');
    return sb.toString();
  }
  static $clinit() {
    PercentageOption.logger = Logger.getLogger($J.cls(PercentageOption).getName());
  }
}

$J.define(PercentageOption, 'net.sf.freecol.common.option.PercentageOption', { kind: 'class', sup: 'net.sf.freecol.common.option.IntegerOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_PercentageOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_PercentageOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String' }, clinit: true, lazy: ['logger'] });
