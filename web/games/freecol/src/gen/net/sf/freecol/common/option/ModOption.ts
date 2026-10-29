// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/ModOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger, StringBuilder, XMLStreamException } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let FreeColModFile, FreeColObject, Utils;

/**
 * Represents an option that can be an arbitrary string.
 */
export class ModOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'modOption';
  /**
   * The value of this option.
   */
  value_: FreeColModFile = null;
  /**
   * Creates a new {@code ModOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _ModOption(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.value_ = null;
    return this;
  }
  /**
   * Get the choices available for this option.
   *
   * @return A list of {@code FreeColModFile}s.
   */
  getChoices(): List<FreeColModFile> {
    return new ArrayList(FreeColModFile.getModsList());
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): ModOption {
    let result = new ModOption()._ModOption(this.getSpecification());
    result.setId(this.getId());
    result.value_ = this.value_;
    return result;
  }
  /**
   * Gets the current value of this {@code ModOption}.
   *
   * @return The value.
   */
  getValue$(): FreeColModFile {
    return this.value_;
  }
  /**
   * Sets the current value of this option.
   *
   * @param value The new value.
   */
  setValue$Object(value: FreeColModFile): void {
    let oldValue = this.value_;
    this.value_ = value;
    this.setId(value.getId());
    if (this.isDefined_ && value !== oldValue) {
      this.firePropertyChange$String$Object$Object(FreeColObject.VALUE_TAG, oldValue, value);
    }
    this.isDefined_ = true;
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    let id = (valueString != null) ? valueString : defaultValueString;
    let fcmf = FreeColModFile.getFreeColModFile(id);
    if (fcmf == null) {
      throw new XMLStreamException('Could not find mod for: ' + id);
    }
    this.setValue$Object(fcmf);
  }
  /**
   * {@inheritDoc}
   */
  isNullValueOK(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.value_ != null) {
      xw.writeAttribute(FreeColObject.VALUE_TAG, this.value_.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ModOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof ModOption) {
      let other = o;
      return $J.equals(this.getId(), other.getId());
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(31, hash) + Utils.hashCode(this.getId())) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    ModOption.logger = Logger.getLogger($J.cls(ModOption).getName());
  }
}

$J.define(ModOption, 'net.sf.freecol.common.option.ModOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'net.sf.freecol.common.model.Specification': '_ModOption' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'isNullValueOK': 'boolean', 'getValue$': 'net.sf.freecol.common.io.FreeColModFile', 'getChoices': 'java.util.List' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(net.sf.freecol.common.io.FreeColModFile)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColModFile = $J.load('net.sf.freecol.common.io.FreeColModFile');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
