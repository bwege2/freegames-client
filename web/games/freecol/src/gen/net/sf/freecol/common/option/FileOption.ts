// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/FileOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, File, JString, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let FreeCol, FreeColObject;

/**
 * Represents an option for specifying a {@code File}.
 */
export class FileOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'fileOption';
  /**
   * The value of this option.
   */
  value_: File = null;
  /**
   * Extra optional qualifier for what the file is to be used for.
   */
  type: string = null;
  static readonly TYPE_TAG: string = 'type';
  /**
   * Creates a new {@code FileOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _FileOption(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.value_ = null;
    this.type = null;
    return this;
  }
  /**
   * Trivial type accessor.
   *
   * @return The type.
   */
  getType(): string {
    return this.type;
  }
  /**
   * Trivial type mutator.
   *
   * @param type The new type.
   */
  setType(type$: string): void {
    this.type = type$;
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): FileOption {
    let result = new FileOption()._FileOption(this.getSpecification());
    result.setValues(this);
    result.setType(this.getType());
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): File {
    return this.value_;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: File): void {
    let oldValue = this.value_;
    this.value_ = value;
    if (value !== oldValue) {
      this.firePropertyChange$String$Object$Object(FreeColObject.VALUE_TAG, oldValue, value);
    }
    this.isDefined_ = true;
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
  setValue$String$String(valueString: string, defaultValueString: string): void {
    if (valueString != null) {
      this.value_ = new File(valueString);
    } else if (defaultValueString != null) {
      this.value_ = new File(defaultValueString);
    } else {
      this.value_ = null;
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.value_ != null) {
      xw.writeAttribute(FreeColObject.VALUE_TAG, this.value_.getAbsolutePath());
    }
    if (this.type != null) {
      xw.writeAttribute(FileOption.TYPE_TAG, this.type);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.type = xr.getAttribute$String$String(FileOption.TYPE_TAG, null);
    if (this.type == null) {
      this.setType((this.value_ != null && this.value_.getPath().endsWith('.' + FreeCol.FREECOL_MAP_EXTENSION)) ? 'map' : 'save');
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return FileOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' value=').append((this.value_ == null) ? 'null' : this.value_.getName()).append(' type=').append((this.type == null) ? 'null' : this.type).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    FileOption.logger = Logger.getLogger($J.cls(FileOption).getName());
  }
}

$J.define(FileOption, 'net.sf.freecol.common.option.FileOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'net.sf.freecol.common.model.Specification': '_FileOption' }, returns: { 'getXMLTagName': 'java.lang.String', 'isNullValueOK': 'boolean', 'getValue$': 'java.io.File', 'getType': 'java.lang.String' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(java.io.File)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
});
