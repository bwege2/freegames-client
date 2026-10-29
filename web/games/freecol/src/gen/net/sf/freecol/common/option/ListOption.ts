// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/ListOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Level, Logger, RuntimeException, StringBuilder, XMLStreamException } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let FreeColObject, CollectionUtils;

/**
 * Represents a list of Options.
 */
export class ListOption<T> extends AbstractOption {
  static logger: Logger = null;
  /**
   * The AbstractOption used to generate new values.
   */
  template: AbstractOption<T> = null;
  /**
   * The maximum number of list entries. Defaults to Integer.MAX_VALUE.
   */
  maximumNumber: number = 0;
  /**
   * The list of options.
   */
  value_: List<AbstractOption<T>> = null;
  /**
   * Whether the list can include duplicates.  This was always true before
   * adding this variable so the default should remain == true.
   */
  allowDuplicates: boolean = false;
  static readonly MAXIMUM_NUMBER_TAG: string = 'maximumNumber';
  static readonly TEMPLATE_TAG: string = 'template';
  $init_ListOption() {
    this.maximumNumber = 2147483647;
    this.value_ = new ArrayList();
    this.allowDuplicates = true;
  }
  /**
   * Creates a new {@code ListOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _ListOption$Specification(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.$init_ListOption();
    return this;
  }
  /**
   * Creates a new {@code ListOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _ListOption$String$Specification(id: string, specification: Specification): this {
    this._AbstractOption$String$Specification(id, specification);
    this.$init_ListOption();
    return this;
  }
  /**
   * Gets the generating template.
   *
   * @return The template.
   */
  getTemplate(): AbstractOption<T> {
    return this.template;
  }
  /**
   * Sets the generating template.
   *
   * @param template The template to set.
   */
  setTemplate(template: AbstractOption<T>): void {
    this.template = template;
  }
  /**
   * Gets the maximum number of allowed values.
   *
   * @return The maximum number of allowed values for this option.
   */
  getMaximumNumber(): number {
    return this.maximumNumber;
  }
  /**
   * Sets the maximum number of allowed values.
   *
   * @param maximumNumber The new maximum number of allowed values.
   */
  setMaximumNumber(maximumNumber: number): void {
    this.maximumNumber = maximumNumber;
  }
  /**
   * Get the values of the current non-null options in the list.
   *
   * @return A list of option values.
   */
  getOptionValues(): List<T> {
    return CollectionUtils.transform$Collection$Predicate$Function(this.value_, CollectionUtils.isNotNull$(), ($p0) => $p0.getValue$());
  }
  /**
   * Add a member to the values list.
   *
   * @param ao The new {@code AbstractOption} member to add.
   */
  addMember(ao: AbstractOption<T>): void {
    if (this.canAdd(ao)) {
      this.value_.add(ao);
    }
  }
  /**
   * Does this list allow duplicates?
   *
   * @return True if duplicates are allowed.
   */
  getAllowDuplicates(): boolean {
    return this.allowDuplicates;
  }
  /**
   * Set the deduplicatation flag.
   *
   * @param allowDuplicates The new deduplication flag;
   */
  setAllowDuplicates(allowDuplicates: boolean): void {
    this.allowDuplicates = allowDuplicates;
  }
  /**
   * Can an option be added to this list?
   *
   * @param ao The option to check.
   * @return True if the option can be added.
   */
  canAdd(ao: AbstractOption<T>): boolean {
    return (this.allowDuplicates) ? true : CollectionUtils.none$Collection$Predicate(this.value_, CollectionUtils.matchKey$Object(ao));
  }
  /**
   * Set the list option values from another list option.
   *
   * @param lo The other {@code ListOption}.
   */
  setListValues(lo: ListOption<T>): void {
    this.setMaximumNumber(lo.getMaximumNumber());
    this.setTemplate(lo.getTemplate());
    this.setAllowDuplicates(lo.getAllowDuplicates());
  }
  /**
   * Gets the current value of this {@code ListOption}.
   *
   * @return The value.
   */
  getValue$(): List<AbstractOption<T>> {
    return this.value_;
  }
  /**
   * Sets the value of this {@code ListOption}.
   *
   * @param value The value to be set.
   */
  setValue$Object(value: List<AbstractOption<T>>): void {
    if (value == null) {
      throw new RuntimeException('Null ListOption: ' + $J.str(this));
    }
    let oldValue = new ArrayList(this.value_);
    this.value_.clear();
    for (const $it0 = value.iterator(); $it0.hasNext(); ) {
      let op = $it0.next();
      this.addMember(op);
    }
    if (this.isDefined_ && !value.equals(oldValue)) {
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
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(ListOption.MAXIMUM_NUMBER_TAG, this.maximumNumber);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    if (this.template != null) {
      xw.writeStartElement(ListOption.TEMPLATE_TAG);
      this.template.toXML$FreeColXMLWriter(xw);
      xw.writeEndElement();
    }
    for (const $it1 = this.value_.iterator(); $it1.hasNext(); ) {
      let option = $it1.next();
      option.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.maximumNumber = xr.getAttribute$String$int(ListOption.MAXIMUM_NUMBER_TAG, 1);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.value_.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    switch (tag) {
      case ListOption.TEMPLATE_TAG:
        xr.nextTag();
        this.template = this.readChildOption(xr);
        xr.closeTag$String(ListOption.TEMPLATE_TAG);
        break;
      default:
        try {
          let op = this.readChildOption(xr);
          if (op != null) {
            this.addMember(op);
          }
        } catch ($e2) {
          if ($J.isa($e2, XMLStreamException)) {
            let xse = $J.exc($e2);
            ListOption.logger.log(Level.WARNING, 'Invalid option at: ' + tag, xse);
            xr.closeTag$String(tag);
          } else {
            throw $e2;
          }
        }
        break;
    }
  }
  /**
   * Hack to suppress warning when reading a typed option.
   *
   * FIXME: Work out how to make this go away.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @return A child typed {@code AbstractOption}.
   * @exception XMLStreamException if the stream is corrupt.
   */
  readChildOption(xr: FreeColXMLReader): AbstractOption<T> {
    return this.readOption(xr);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId());
    if (this.value_ != null) {
      sb.append(' [');
      for (const $it3 = this.value_.iterator(); $it3.hasNext(); ) {
        let ao = $it3.next();
        sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(ao));
      }
      sb.append(' ]');
    }
    if (this.template != null) {
      sb.append(' template=').append($J.str(this.template));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    ListOption.logger = Logger.getLogger($J.cls(ListOption).getName());
  }
}

$J.define(ListOption, 'net.sf.freecol.common.option.ListOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_ListOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_ListOption$Specification' }, returns: { 'isNullValueOK': 'boolean', 'getValue$': 'java.util.List', 'getAllowDuplicates': 'boolean', 'getOptionValues': 'java.util.List', 'getMaximumNumber': 'int', 'getTemplate': 'net.sf.freecol.common.option.AbstractOption' }, meths: { 'setValue(java.util.List)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
