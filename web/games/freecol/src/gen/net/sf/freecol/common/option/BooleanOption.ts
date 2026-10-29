// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/BooleanOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AbstractOption } from './AbstractOption.ts';

let FreeColObject;

/**
 * Represents an option that can be either <i>true</i>
 * or <i>false</i>.
 */
export class BooleanOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'booleanOption';
  /**
   * The value of this option.
   */
  value_: boolean = false;
  /**
   * Creates a new {@code BooleanOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _BooleanOption$Specification(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    return this;
  }
  /**
   * Creates a new {@code BooleanOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _BooleanOption$String$Specification(id: string, specification: Specification): this {
    this._AbstractOption$String$Specification(id, specification);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): BooleanOption {
    let result = new BooleanOption()._BooleanOption$String$Specification(this.getId(), this.getSpecification());
    result.setValues(this);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): boolean {
    return this.value_;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: boolean): void {
    let oldValue = this.value_;
    this.value_ = value;
    if (this.isDefined_ && value !== oldValue) {
      this.firePropertyChange$String$boolean$boolean(FreeColObject.VALUE_TAG, oldValue, value);
    }
    this.isDefined_ = true;
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    this.setValue$Object($J.parseBoolean((valueString != null) ? valueString : defaultValueString));
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute(FreeColObject.VALUE_TAG, String(this.value_));
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return BooleanOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' value=').append(String(this.value_)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    BooleanOption.logger = Logger.getLogger($J.cls(BooleanOption).getName());
  }
}

$J.define(BooleanOption, 'net.sf.freecol.common.option.BooleanOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_BooleanOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_BooleanOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getValue$': 'java.lang.Boolean' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(java.lang.Boolean)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
});
