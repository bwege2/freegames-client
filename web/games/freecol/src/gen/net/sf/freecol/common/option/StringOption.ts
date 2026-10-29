// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/StringOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let FreeColObject, Utils;

/**
 * Represents an option that can be a string selected from a list of
 * possible values (choices).
 */
export class StringOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'stringOption';
  /**
   * The value of this option.
   */
  value_: string = null;
  /**
   * A list of choices to provide to the UI.
   */
  choices: List<string> = null;
  static readonly CHOICE_TAG: string = 'choice';
  $init_StringOption() {
    this.choices = new ArrayList();
  }
  /**
   * Creates a new {@code StringOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _StringOption$Specification(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.$init_StringOption();
    return this;
  }
  /**
   * Creates a new {@code StringOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _StringOption$String$Specification(id: string, specification: Specification): this {
    this._AbstractOption$String$Specification(id, specification);
    this.$init_StringOption();
    return this;
  }
  /**
   * Get the list of string choices.
   *
   * @return The list of choices.
   */
  getChoices(): List<string> {
    return this.choices;
  }
  /**
   * Set the choices.
   *
   * @param newChoices The new list of choices.
   */
  setChoices(newChoices: List<string>): void {
    this.choices.clear();
    this.choices.addAll(newChoices);
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): StringOption {
    let result = new StringOption()._StringOption$String$Specification(this.getId(), this.getSpecification());
    result.setValues(this);
    result.setChoices(this.choices);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): string {
    return this.value_;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: string): void {
    let oldValue = this.value_;
    this.value_ = value;
    if (this.isDefined_ && !Utils.equals(value, oldValue)) {
      this.firePropertyChange$String$Object$Object(FreeColObject.VALUE_TAG, oldValue, value);
    }
    this.isDefined_ = true;
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    this.setValue$Object((valueString != null) ? valueString : defaultValueString);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute(FreeColObject.VALUE_TAG, this.value_);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.choices.iterator(); $it0.hasNext(); ) {
      let choice = $it0.next();
      xw.writeStartElement(StringOption.CHOICE_TAG);
      xw.writeAttribute(FreeColObject.VALUE_TAG, choice);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.choices.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(StringOption.CHOICE_TAG, tag)) {
      this.choices.add(xr.getAttribute$String$String(FreeColObject.VALUE_TAG, null));
      xr.closeTag$String(StringOption.CHOICE_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return StringOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' value=').append(this.value_).append(' choices=[');
    if (this.choices != null) {
      for (const $it1 = this.choices.iterator(); $it1.hasNext(); ) {
        let choice = $it1.next();
        sb.append(String.fromCharCode(32 /* ' ' */)).append(choice);
      }
    }
    sb.append(']]');
    return sb.toString();
  }
  static $clinit() {
    StringOption.logger = Logger.getLogger($J.cls(StringOption).getName());
  }
}

$J.define(StringOption, 'net.sf.freecol.common.option.StringOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_StringOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_StringOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getValue$': 'java.lang.String', 'getChoices': 'java.util.List' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(java.lang.String)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
