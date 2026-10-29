// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/UnitTypeOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let FreeColObject, UnitType, CollectionUtils;

/**
 * Option wrapping a UnitType.
 */
export class UnitTypeOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'unitTypeOption';
  /**
   * The option value.
   */
  value_: UnitType = null;
  /**
   * Whether to add "none" to the list of choices to be generated.
   */
  addNone_: boolean = false;
  /**
   * Which choices to generate.
   */
  selector: UnitTypeOption$TypeSelector = null;
  /**
   * A list of choices to provide to the UI.
   */
  choices: List<UnitType> = null;
  static readonly ADD_NONE_TAG: string = 'addNone';
  static readonly CHOICE_TAG: string = 'choice';
  static readonly GENERATE_TAG: string = 'generate';
  $init_UnitTypeOption() {
    this.selector = UnitTypeOption$TypeSelector.UNITS;
    this.choices = new ArrayList();
  }
  /**
   * Creates a new {@code UnitTypeOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _UnitTypeOption$Specification(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.$init_UnitTypeOption();
    return this;
  }
  /**
   * Creates a new {@code UnitTypeOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _UnitTypeOption$String$Specification(id: string, specification: Specification): this {
    this._AbstractOption$String$Specification(id, specification);
    this.$init_UnitTypeOption();
    return this;
  }
  /**
   * Is "none" a valid choice for this option?
   *
   * @return True if "none" is a valid choice.
   */
  addNone(): boolean {
    return this.addNone_;
  }
  /**
   * Get the list of choices for this option.
   *
   * @return A list of {@code UnitType}s.
   */
  getChoices(): List<UnitType> {
    return this.choices;
  }
  /**
   * Get the type of choices to generate.
   *
   * @return The type of choices to generate.
   */
  getSelector(): UnitTypeOption$TypeSelector {
    return this.selector;
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): UnitTypeOption {
    let ret = new UnitTypeOption()._UnitTypeOption$String$Specification(this.getId(), this.getSpecification());
    ret.value_ = this.value_;
    ret.addNone_ = this.addNone_;
    ret.selector = this.selector;
    ret.choices.clear();
    ret.choices.addAll(this.choices);
    return ret;
  }
  /**
   * Gets the current value of this {@code UnitTypeOption}.
   *
   * @return The {@code UnitType} value.
   */
  getValue$(): UnitType {
    return this.value_;
  }
  /**
   * Sets the current value of this {@code UnitTypeOption}.
   *
   * @param value The new {@code UnitType} value.
   */
  setValue$Object(value: UnitType): void {
    let oldValue = this.value_;
    this.value_ = value;
    if (value !== oldValue && this.isDefined_) {
      this.firePropertyChange$String$Object$Object(FreeColObject.VALUE_TAG, oldValue, value);
    }
    this.isDefined_ = true;
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    if (valueString != null) {
      this.setValue$Object(this.getSpecification().getUnitType(valueString));
    } else if (defaultValueString != null) {
      this.setValue$Object(this.getSpecification().getUnitType(defaultValueString));
    } else {
      this.setValue$Object(null);
    }
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
  generateChoices(): void {
    if (this.selector == null) {
      let val = this.getValue$();
      if (val != null && this.choices.isEmpty()) {
        this.choices.add(val);
      }
    } else {
      let unitTypeList = this.getSpecification().getUnitTypeList();
      this.choices.clear();
      switch (this.selector) {
        case UnitTypeOption$TypeSelector.UNITS:
          this.choices.addAll(unitTypeList);
          break;
        case UnitTypeOption$TypeSelector.IMMIGRANTS:
          this.choices.addAll(CollectionUtils.transform$Collection$Predicate(unitTypeList, ($p0) => $p0.isRecruitable()));
          break;
        case UnitTypeOption$TypeSelector.NAVAL_UNITS:
          this.choices.addAll(CollectionUtils.transform$Collection$Predicate(unitTypeList, ($p0) => $p0.isNaval()));
          break;
        case UnitTypeOption$TypeSelector.LAND_UNITS:
          this.choices.addAll(CollectionUtils.transform$Collection$Predicate(unitTypeList, (ut) => !ut.isNaval()));
          break;
      }
      if (this.addNone_) {
        this.choices.add(0, null);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.value_ != null) {
      xw.writeAttribute$String$FreeColObject(FreeColObject.VALUE_TAG, this.value_);
    }
    if (this.selector != null) {
      xw.writeAttribute$String$Enum(UnitTypeOption.GENERATE_TAG, this.selector);
    }
    if (this.addNone_) {
      xw.writeAttribute$String$boolean(UnitTypeOption.ADD_NONE_TAG, this.addNone_);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.choices != null && !this.choices.isEmpty()) {
      for (const $it0 = this.choices.iterator(); $it0.hasNext(); ) {
        let choice = $it0.next();
        xw.writeStartElement(UnitTypeOption.CHOICE_TAG);
        xw.writeAttribute$String$FreeColObject(FreeColObject.VALUE_TAG, choice);
        xw.writeEndElement();
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.selector = xr.getAttribute$String$Class$Enum(UnitTypeOption.GENERATE_TAG, $J.cls(UnitTypeOption$TypeSelector), null);
    this.addNone_ = xr.getAttribute$String$boolean(UnitTypeOption.ADD_NONE_TAG, false);
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
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(UnitTypeOption.CHOICE_TAG, tag)) {
      this.choices.add(xr.getType(spec, FreeColObject.VALUE_TAG, $J.cls(UnitType), null));
      xr.closeTag$String(UnitTypeOption.CHOICE_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitTypeOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' value=').append($J.str(this.value_)).append(' addNone=').append(String(this.addNone_)).append(' selector=').append($J.str(this.selector)).append(' choices=[');
    for (const $it1 = this.choices.iterator(); $it1.hasNext(); ) {
      let choice = $it1.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(choice));
    }
    sb.append(' ]]');
    return sb.toString();
  }
  static $clinit() {
    UnitTypeOption.logger = Logger.getLogger($J.cls(UnitTypeOption).getName());
  }
}

/**
 * FIXME: replace with Predicates.
 */
export class UnitTypeOption$TypeSelector extends JEnum {
  static UNITS: UnitTypeOption$TypeSelector = null;
  static IMMIGRANTS: UnitTypeOption$TypeSelector = null;
  static LAND_UNITS: UnitTypeOption$TypeSelector = null;
  static NAVAL_UNITS: UnitTypeOption$TypeSelector = null;
  static $VALUES: UnitTypeOption$TypeSelector[] = null;
  _UnitTypeOption$TypeSelector($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): UnitTypeOption$TypeSelector[] { return UnitTypeOption$TypeSelector.$VALUES.slice(); }
  static valueOf(name: string): UnitTypeOption$TypeSelector { return $J.enumValueOf(UnitTypeOption$TypeSelector, name); }
  static $clinit() {
    UnitTypeOption$TypeSelector.UNITS = new UnitTypeOption$TypeSelector()._UnitTypeOption$TypeSelector('UNITS', 0);
    UnitTypeOption$TypeSelector.IMMIGRANTS = new UnitTypeOption$TypeSelector()._UnitTypeOption$TypeSelector('IMMIGRANTS', 1);
    UnitTypeOption$TypeSelector.LAND_UNITS = new UnitTypeOption$TypeSelector()._UnitTypeOption$TypeSelector('LAND_UNITS', 2);
    UnitTypeOption$TypeSelector.NAVAL_UNITS = new UnitTypeOption$TypeSelector()._UnitTypeOption$TypeSelector('NAVAL_UNITS', 3);
    UnitTypeOption$TypeSelector.$VALUES = [UnitTypeOption$TypeSelector.UNITS, UnitTypeOption$TypeSelector.IMMIGRANTS, UnitTypeOption$TypeSelector.LAND_UNITS, UnitTypeOption$TypeSelector.NAVAL_UNITS];
  }
}

$J.define(UnitTypeOption, 'net.sf.freecol.common.option.UnitTypeOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_UnitTypeOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_UnitTypeOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'isNullValueOK': 'boolean', 'getValue$': 'net.sf.freecol.common.model.UnitType', 'getSelector': 'net.sf.freecol.common.option.UnitTypeOption$TypeSelector', 'getChoices': 'java.util.List' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(net.sf.freecol.common.model.UnitType)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.define(UnitTypeOption$TypeSelector, 'net.sf.freecol.common.option.UnitTypeOption$TypeSelector', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_UnitTypeOption$TypeSelector' }, clinit: true, lazy: ['$VALUES', 'UNITS', 'IMMIGRANTS', 'LAND_UNITS', 'NAVAL_UNITS'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
