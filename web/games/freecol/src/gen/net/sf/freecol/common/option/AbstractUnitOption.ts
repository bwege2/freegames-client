// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/AbstractUnitOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collections, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let AbstractUnit, FreeColObject, NationType, IntegerOption, StringOption, UnitTypeOption, UnitTypeOption$TypeSelector;

/**
 * Represents an option where the valid choice is an AbstractUnit.
 */
export class AbstractUnitOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'unitOption';
  static DEFAULT_SELECTOR: UnitTypeOption$TypeSelector = null;
  /**
   * The value of this option.
   */
  value_: AbstractUnit = null;
  /**
   * An Option to determine the UnitType of the AbstractUnit.
   */
  unitTypeOption: UnitTypeOption = null;
  /**
   * An Option to determine the Role of the AbstractUnit.
   */
  roleOption: StringOption = null;
  /**
   * An Option to determine the number of the AbstractUnit.
   */
  numberOption: IntegerOption = null;
  /**
   * An optional nation type for the unit.
   */
  nationType: NationType = null;
  static readonly NATION_TYPE_TAG: string = 'nationType';
  static readonly NUMBER_TAG: string = 'number';
  static readonly ROLE_TAG: string = 'role';
  static readonly UNIT_TYPE_TAG: string = 'unitType';
  $init_AbstractUnitOption() {
    this.value_ = null;
    this.unitTypeOption = null;
    this.roleOption = null;
    this.numberOption = null;
    this.nationType = null;
  }
  /**
   * Creates a new {@code AbstractUnitOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _AbstractUnitOption$Specification(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.$init_AbstractUnitOption();
    return this;
  }
  /**
   * Creates a new {@code AbstractUnitOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _AbstractUnitOption$String$Specification(id: string, specification: Specification): this {
    this._AbstractOption$String$Specification(id, specification);
    this.$init_AbstractUnitOption();
    return this;
  }
  requireUnitTypeOption(): void {
    if (this.unitTypeOption == null) {
      this.unitTypeOption = new UnitTypeOption()._UnitTypeOption$String$Specification(this.getId() + '.unitType', this.getSpecification());
    }
  }
  requireRoleOption(): void {
    if (this.roleOption == null) {
      this.roleOption = new StringOption()._StringOption$String$Specification(this.getId() + '.role', this.getSpecification());
    }
  }
  requireNumberOption(): void {
    if (this.numberOption == null) {
      this.numberOption = new IntegerOption()._IntegerOption$String$Specification(this.getId() + '.number', this.getSpecification());
    }
  }
  /**
   * Get the unit type option.
   *
   * @return The {@code UnitTypeOption} containing the unit type.
   */
  getUnitType(): UnitTypeOption {
    return this.unitTypeOption;
  }
  /**
   * Get the role option.
   *
   * @return The {@code StringOption} containing the role.
   */
  getRole(): StringOption {
    return this.roleOption;
  }
  /**
   * Get the number option.
   *
   * @return The {@code IntegerOption} containing the number.
   */
  getNumber(): IntegerOption {
    return this.numberOption;
  }
  /**
   * Get the nation type.
   *
   * @return The optional {@code NationType}.
   */
  getNationType(): NationType {
    return this.nationType;
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): AbstractUnitOption {
    let spec = this.getSpecification();
    let result = new AbstractUnitOption()._AbstractUnitOption$String$Specification(this.getId(), spec);
    result.setValues(this);
    if (this.value_ != null) {
      let au = new AbstractUnit()._AbstractUnit$UnitType$String$int(this.value_.getType(spec), this.value_.getRoleId(), this.value_.getNumber());
      result.setValue$Object(au);
    }
    if (this.unitTypeOption != null) {
      result.unitTypeOption = this.unitTypeOption.cloneOption();
    }
    if (this.roleOption != null) {
      result.roleOption = this.roleOption.cloneOption();
    }
    if (this.numberOption != null) {
      result.numberOption = this.numberOption.cloneOption();
    }
    result.nationType = this.nationType;
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): AbstractUnit {
    return this.value_;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: AbstractUnit): void {
    let spec = this.getSpecification();
    let oldValue = this.value_;
    this.value_ = value;
    if (value == null) {
      this.unitTypeOption = null;
      this.roleOption = null;
      this.numberOption = null;
    } else {
      this.requireUnitTypeOption();
      this.unitTypeOption.setValue$Object(value.getType(spec));
      this.requireRoleOption();
      this.roleOption.setValue$Object(value.getRoleId());
      this.requireNumberOption();
      this.numberOption.setValue$Object(value.getNumber());
    }
    if (this.isDefined_ && (((this.value_ == null) !== (oldValue == null)) || (this.value_ != null && !this.value_.equals(oldValue)))) {
      this.firePropertyChange$String$Object$Object(FreeColObject.VALUE_TAG, oldValue, this.value_);
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
  generateChoices(): void {
    this.unitTypeOption.generateChoices();
    if (this.roleOption.getChoices().isEmpty() && this.roleOption.getValue$() != null) {
      let op = Collections.singletonList(this.roleOption.getValue$());
      this.roleOption.setChoices(op);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.nationType != null) {
      xw.writeAttribute$String$FreeColObject(AbstractUnitOption.NATION_TYPE_TAG, this.nationType);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    this.numberOption.toXML$FreeColXMLWriter$String(xw, AbstractUnitOption.NUMBER_TAG);
    this.roleOption.toXML$FreeColXMLWriter$String(xw, AbstractUnitOption.ROLE_TAG);
    this.unitTypeOption.toXML$FreeColXMLWriter$String(xw, AbstractUnitOption.UNIT_TYPE_TAG);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.nationType = xr.getType(spec, AbstractUnitOption.NATION_TYPE_TAG, $J.cls(NationType), null);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
    let au = null;
    if (this.unitTypeOption != null && this.roleOption != null && this.numberOption != null) {
      au = new AbstractUnit()._AbstractUnit$UnitType$String$int(this.unitTypeOption.getValue$(), this.roleOption.getValue$(), this.numberOption.getValue$());
    }
    this.setValue$Object(au);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if (tag != null) {
      switch (tag) {
        case AbstractUnitOption.NUMBER_TAG:
          this.requireNumberOption();
          this.numberOption.readFromXML(xr);
          break;
        case AbstractUnitOption.ROLE_TAG:
          this.requireRoleOption();
          this.roleOption.readFromXML(xr);
          break;
        case AbstractUnitOption.UNIT_TYPE_TAG:
          this.requireUnitTypeOption();
          this.unitTypeOption.readFromXML(xr);
          break;
        default:
          super.readChild(xr);
          break;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AbstractUnitOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.value_));
    if (this.unitTypeOption != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.unitTypeOption));
    }
    if (this.roleOption != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.roleOption));
    }
    if (this.numberOption != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.numberOption));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    AbstractUnitOption.logger = Logger.getLogger($J.cls(AbstractUnitOption).getName());
    AbstractUnitOption.DEFAULT_SELECTOR = UnitTypeOption$TypeSelector.UNITS;
  }
}

$J.define(AbstractUnitOption, 'net.sf.freecol.common.option.AbstractUnitOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_AbstractUnitOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_AbstractUnitOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'isNullValueOK': 'boolean', 'getValue$': 'net.sf.freecol.common.model.AbstractUnit', 'getNationType': 'net.sf.freecol.common.model.NationType', 'getNumber': 'net.sf.freecol.common.option.IntegerOption', 'getRole': 'net.sf.freecol.common.option.StringOption', 'getUnitType': 'net.sf.freecol.common.option.UnitTypeOption' }, meths: { 'setValue(net.sf.freecol.common.model.AbstractUnit)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger', 'DEFAULT_SELECTOR'] });
$J.module(() => {
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  NationType = $J.load('net.sf.freecol.common.model.NationType');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  StringOption = $J.load('net.sf.freecol.common.option.StringOption');
  UnitTypeOption = $J.load('net.sf.freecol.common.option.UnitTypeOption');
  UnitTypeOption$TypeSelector = $J.load('net.sf.freecol.common.option.UnitTypeOption$TypeSelector');
});
