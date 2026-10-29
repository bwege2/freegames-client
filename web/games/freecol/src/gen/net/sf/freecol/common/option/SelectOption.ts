// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/SelectOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, LinkedHashMap, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { IntegerOption } from './IntegerOption.ts';

let Constants, FreeColObject, AbstractOption;

/**
 * Represents an option where the valid choice is an integer and the
 * choices are represented by strings.  In general, these strings are
 * localized by looking up the key of the choice, which consists of
 * the identifier of the AbstractObject followed by a "." followed by
 * the value of the option string.  The automatic localization can be
 * suppressed with the doNotLocalize parameter, however.  There are
 * two reasons to do this: either the option strings should not be
 * localized at all (because they are language names, for example), or
 * the option strings have already been localized (because they do not
 * use the default keys, for example).
 */
export class SelectOption extends IntegerOption {
  static logger: Logger = null;
  static readonly TAG: string = 'selectOption';
  /**
   * Use localized labels?
   */
  localizedLabels: boolean = false;
  /**
   * A map of the valid values.
   */
  itemValues: JMap<number, string> = null;
  static readonly LABEL_TAG: string = 'label';
  static readonly LOCALIZED_LABELS_TAG: string = 'localizedLabels';
  $init_SelectOption() {
    this.localizedLabels = false;
    this.itemValues = new LinkedHashMap();
  }
  /**
   * Creates a new {@code SelectOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _SelectOption$Specification(specification: Specification): this {
    this._IntegerOption$Specification(specification);
    this.$init_SelectOption();
    return this;
  }
  /**
   * Creates a new {@code SelectOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _SelectOption$String$Specification(id: string, specification: Specification): this {
    this._IntegerOption$String$Specification(id, specification);
    this.$init_SelectOption();
    return this;
  }
  /**
   * Get the name associated with the current value.
   *
   * @return The name.
   */
  getName(): string {
    return this.itemValues.get(this.getValue$());
  }
  /**
   * Gets the range values of this {@code RangeOption}.
   *
   * @return The value.
   */
  getItemValues(): JMap<number, string> {
    return this.itemValues;
  }
  /**
   * Add a new key,value pair to this option.
   *
   * @param key The key to add.
   * @param value The value to add.
   */
  addItemValue(key: number, value: string): void {
    this.itemValues.put(key, value);
  }
  /**
   * Add a new key,value pair to this option at the given index.
   *
   * @param index The index in the list of item values.
   * @param key The key to add.
   * @param value The value to add.
   */
  setItemValueAtIndex(index: number, key: number, value: string): void {
    let oldItemValues = new LinkedHashMap(this.itemValues);
    this.itemValues.clear();
    let currentIndex = 0;
    for (const $it0 = oldItemValues.entrySet().iterator(); $it0.hasNext(); ) {
      let entry = $it0.next();
      if (index === currentIndex) {
        this.itemValues.put(key, value);
      }
      this.itemValues.put(entry.getKey(), entry.getValue());
      currentIndex++;
    }
    if (index >= this.itemValues.size()) {
      this.itemValues.put(key, value);
    }
  }
  /**
   * Clear the item values for this option.
   *
   * Required by ClientOptions.fixClientOptions.
   */
  clearItemValues(): void {
    this.itemValues.clear();
  }
  /**
   * Whether the labels of this option need to be localized.  This is
   * not the case when the labels are just numeric values.
   *
   * @return True if localization is required.
   */
  localizeLabels(): boolean {
    return this.localizedLabels;
  }
  /**
   * Gets the tag name of the contained object.
   *
   * Should be overridden by subclasses to ensure read/writeChildren work.
   *
   * @return "selectValue".
   */
  getXMLItemElementTagName(): string {
    return 'selectValue';
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: number): void {
    let keys = this.getItemValues().keySet();
    if (keys.isEmpty()) {
      return;
    }
    let fallback = null;
    for (const $it1 = keys.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      if ($J.compareTo(i, value) === 0) {
        super.setValue$Object(value);
        return;
      }
      if (fallback == null) {
        fallback = i;
      }
    }
    SelectOption.logger.warning(SelectOption.TAG + '.setValue invalid value: ' + value + ', using fallback: ' + fallback);
    super.setValue$Object(fallback);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(SelectOption.LOCALIZED_LABELS_TAG, this.localizedLabels);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it2 = this.itemValues.entrySet().iterator(); $it2.hasNext(); ) {
      let entry = $it2.next();
      xw.writeStartElement(this.getXMLItemElementTagName());
      xw.writeAttribute$String$Object(FreeColObject.VALUE_TAG, entry.getKey());
      xw.writeAttribute(SelectOption.LABEL_TAG, entry.getValue());
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.localizedLabels = xr.getAttribute$String$boolean(SelectOption.LOCALIZED_LABELS_TAG, true);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let value = xr.getAttribute$String$String(FreeColObject.VALUE_TAG, null);
    let defaultValue = xr.getAttribute$String$String(AbstractOption.DEFAULT_VALUE_TAG, null);
    this.clearItemValues();
    super.readChildren(xr);
    this.setValue$String$String(value, defaultValue);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(this.getXMLItemElementTagName(), tag)) {
      this.addItemValue(xr.getAttribute$String$int(FreeColObject.VALUE_TAG, Constants.INFINITY), xr.getAttribute$String$String(SelectOption.LABEL_TAG, null));
      xr.closeTag$String(tag);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return SelectOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' value=').append($J.str(this.getValue$())).append(' localized=').append(String(this.localizedLabels)).append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    SelectOption.logger = Logger.getLogger($J.cls(SelectOption).getName());
  }
}

$J.define(SelectOption, 'net.sf.freecol.common.option.SelectOption', { kind: 'class', sup: 'net.sf.freecol.common.option.IntegerOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_SelectOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_SelectOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getXMLItemElementTagName': 'java.lang.String', 'getItemValues': 'java.util.Map', 'getName': 'java.lang.String' }, meths: { 'setValue(java.lang.Integer)': 'setValue$Object' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  AbstractOption = $J.load('net.sf.freecol.common.option.AbstractOption');
});
