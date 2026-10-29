// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/AbstractUnit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

let Messages, Specification, StringTemplate, CollectionUtils;

/**
 * Contains the information necessary to create a new unit.
 */
export class AbstractUnit extends FreeColObject {
  static readonly TAG: string = 'abstractUnit';
  /**
   * The role identifier of this AbstractUnit.
   */
  roleId: string = null;
  /**
   * The number of units.
   */
  number: number = 0;
  static readonly ROLE_TAG: string = 'role';
  static readonly NUMBER_TAG: string = 'number';
  $init_AbstractUnit() {
    this.roleId = Specification.DEFAULT_ROLE_ID;
    this.number = 1;
  }
  /**
   * Deliberately empty constructor, for Game.newInstance.
   */
  _AbstractUnit$(): this {
    this._FreeColObject();
    this.$init_AbstractUnit();
    return this;
  }
  /**
   * Create a new AbstractUnit.
   *
   * @param id The object identifier.
   * @param roleId The unit role identifier.
   * @param number A number of units.
   */
  _AbstractUnit$String$String$int(id: string, roleId: string, number$: number): this {
    this._FreeColObject();
    this.$init_AbstractUnit();
    this.setId(id);
    this.roleId = roleId;
    this.number = number$;
    return this;
  }
  /**
   * Create a new AbstractUnit.
   *
   * @param unitType The type of unit to create.
   * @param roleId The unit role identifier.
   * @param number The number of units.
   */
  _AbstractUnit$UnitType$String$int(unitType: UnitType, roleId: string, number$: number): this {
    this._AbstractUnit$String$String$int(unitType.getId(), roleId, number$);
    return this;
  }
  /**
   * Creates a new {@code AbstractUnit} instance.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if an error occurs
   */
  _AbstractUnit$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._FreeColObject();
    this.$init_AbstractUnit();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the role identifier.
   *
   * @return The role identifier.
   */
  getRoleId(): string {
    return this.roleId;
  }
  /**
   * Set the role identifier.
   *
   * @param roleId The new role identifier.
   */
  setRoleId(roleId: string): void {
    this.roleId = roleId;
  }
  /**
   * Get the number of units.
   *
   * @return The number of units.
   */
  getNumber(): number {
    return this.number;
  }
  /**
   * Set the number of units.
   *
   * @param newNumber The new number of units.
   */
  setNumber(newNumber: number): void {
    this.number = newNumber;
  }
  /**
   * Add to the number.
   *
   * @param diff The amount to add.
   */
  addToNumber(diff: number): void {
    this.number = (this.number + diff) | 0;
  }
  /**
   * Gets a template describing this abstract unit with a fixed count of 1.
   *
   * @return A {@code StringTemplate} describing the abstract unit.
   */
  getSingleLabel(): StringTemplate {
    return Messages.getUnitLabel(null, this.getId(), 1, null, this.getRoleId(), null);
  }
  /**
   * Gets a template describing this abstract unit.
   *
   * @return A {@code StringTemplate} describing the abstract unit.
   */
  getLabel(): StringTemplate {
    return AbstractUnit.getLabelInternal(this.getId(), this.getRoleId(), this.getNumber());
  }
  /**
   * Gets a template describing an arbitrary abstract unit.
   *
   * @param typeId The unit type identifier.
   * @param roleId The role identifier.
   * @param number The number of units.
   * @return A {@code StringTemplate} describing the abstract unit.
   */
  static getLabelInternal(typeId: string, roleId: string, number$: number): StringTemplate {
    let tmpl = Messages.getUnitLabel(null, typeId, number$, null, roleId, null);
    return StringTemplate.template$String('model.abstractUnit.label').addAmount('%number%', number$).addStringTemplate$String$StringTemplate('%unit%', tmpl);
  }
  /**
   * Get a description of this abstract unit.
   *
   * @return A {@code String} describing this abstract unit.
   */
  getDescription(): string {
    return Messages.message$StringTemplate(this.getLabel());
  }
  /**
   * Convenience accessor for the unit type.
   *
   * @param spec A {@code Specification} to look up the type in.
   * @return The {@code UnitType} of this abstract unit.
   */
  getType(spec: Specification): UnitType {
    return spec.getUnitType(this.getId());
  }
  /**
   * Convenience accessor for the role.
   *
   * @param spec A {@code Specification} to look up the role in.
   * @return The {@code Role} of this abstract unit.
   */
  getRole(spec: Specification): Role {
    return spec.getRole(this.getRoleId());
  }
  /**
   * Get the approximate offence power that an instantiated unit
   * corresponding to this abstract form would have.
   *
   * @param spec A {@code Specification} to look up.
   * @return The approximate offence power.
   */
  getOffence(spec: Specification): number {
    let n = this.getNumber();
    let role = this.getRole(spec);
    let type$ = spec.getUnitType(this.getId());
    return n * (type$.getOffence() + role.getOffence());
  }
  /**
   * Calculate the approximate offence power of a list of units.
   *
   * @param spec A {@code Specification} to look up the type in.
   * @param units A list of {@code AbstractUnit}s.
   * @return The approximate offence power.
   */
  static calculateStrength(spec: Specification, units: List<AbstractUnit>): number {
    return CollectionUtils.sumDouble$Collection$ToDoubleFunction(units, (au) => au.getOffence(spec));
  }
  /**
   * Get a deep copy of a list of abstract units.
   *
   * @param units The list of {@code AbstractUnit}s to copy.
   * @return A list of {@code AbstractUnit}s.
   */
  static deepCopy(units: List<AbstractUnit>): List<AbstractUnit> {
    return CollectionUtils.transform$Collection$Predicate$Function(units, CollectionUtils.alwaysTrue(), (au) => new AbstractUnit()._AbstractUnit$String$String$int(au.getId(), au.getRoleId(), au.getNumber()));
  }
  /**
   * Get a template for a list of abstract units.
   *
   * @param base The label template base.
   * @param units The list of {@code AbstractUnit}s to use.
   * @return A suitable {@code StringTemplate}.
   */
  static getListLabel(base: string, units: List<AbstractUnit>): StringTemplate {
    let template = StringTemplate.label(base);
    for (const $it0 = units.iterator(); $it0.hasNext(); ) {
      let au = $it0.next();
      template.addStringTemplate$StringTemplate(au.getLabel());
    }
    return template;
  }
  /**
   * Does another AbstractUnit match in all fields.
   *
   * @param other The other <code>AbstractUnit</code> to test.
   * @return True if all fields match.
   */
  matchAll(other: AbstractUnit): boolean {
    return $J.equals(this.getId(), other.getId()) && $J.equals(this.getRoleId(), other.getRoleId()) && this.getNumber() === other.getNumber();
  }
  /**
   * Create a predicate to match the type+role of an abstract unit.
   *
   * @param ut The {@code UnitType} to match.
   * @param roleId The role identifier to match.
   * @return A suitable {@code Predicate}.
   */
  static matcher$UnitType$String(ut: UnitType, roleId: string): Predicate<AbstractUnit> {
    return (a) => $J.equals(a.getId(), ut.getId()) && $J.equals(a.roleId, roleId);
  }
  /**
   * Create a predicate to match the type+role of an abstract unit.
   *
   * @param au The {@code AbstractUnit} to match.
   * @return A suitable {@code Predicate}.
   */
  static matcher$AbstractUnit(au: AbstractUnit): Predicate<AbstractUnit> {
    return (a) => $J.equals(a.getId(), au.getId()) && $J.equals(a.getRoleId(), au.getRoleId());
  }
  /**
   * Create a predicate to match the type+role of a unit.
   *
   * @param unit The {@code Unit} to match.
   * @return A suitable {@code Predicate}.
   */
  static matcher$Unit(unit: Unit): Predicate<AbstractUnit> {
    return AbstractUnit.matcher$UnitType$String(unit.getType(), unit.getRole().getId());
  }
  /**
   * Do two lists of abstract units match completely.
   *
   * @param l1 The first <code>AbstractUnit</code>.
   * @param l2 The first <code>AbstractUnit</code>.
   * @return True if the lists match.
   */
  static matchUnits(l1: List<AbstractUnit>, l2: List<AbstractUnit>): boolean {
    if (l1.size() !== l2.size()) {
      return false;
    }
    for (const $it1 = l1.iterator(); $it1.hasNext(); ) {
      let au = $it1.next();
      if (CollectionUtils.none$Collection$Predicate(l2, (a) => a.matchAll(au))) {
        return false;
      }
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(AbstractUnit));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.roleId = o.getRoleId();
    this.number = o.getNumber();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute(AbstractUnit.ROLE_TAG, this.roleId);
    xw.writeAttribute$String$int(AbstractUnit.NUMBER_TAG, this.number);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.roleId = xr.getAttribute$String$String(AbstractUnit.ROLE_TAG, Specification.DEFAULT_ROLE_ID);
    this.number = xr.getAttribute$String$int(AbstractUnit.NUMBER_TAG, 1);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AbstractUnit.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String(this.number)).append(String.fromCharCode(32 /* ' ' */)).append(this.getId()).append(' (').append(this.roleId).append(String.fromCharCode(41 /* ')' */));
    return sb.toString();
  }
}

$J.define(AbstractUnit, 'net.sf.freecol.common.model.AbstractUnit', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_AbstractUnit$FreeColXMLReader', 'net.sf.freecol.common.model.UnitType,java.lang.String,int': '_AbstractUnit$UnitType$String$int', 'java.lang.String,java.lang.String,int': '_AbstractUnit$String$String$int', '': '_AbstractUnit$' }, returns: { 'getXMLTagName': 'java.lang.String', 'getDescription': 'java.lang.String', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'getSingleLabel': 'net.sf.freecol.common.model.StringTemplate', 'getNumber': 'int', 'getRoleId': 'java.lang.String' }, meths: { 'matcher(net.sf.freecol.common.model.Unit)': 'matcher$Unit', 'matcher(net.sf.freecol.common.model.AbstractUnit)': 'matcher$AbstractUnit', 'matcher(net.sf.freecol.common.model.UnitType,java.lang.String)': 'matcher$UnitType$String' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
