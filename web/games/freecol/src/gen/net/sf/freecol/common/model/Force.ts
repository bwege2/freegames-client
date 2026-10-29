// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Force.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColSpecObject } from './FreeColSpecObject.ts';

let Ability, AbstractUnit, FreeColObject, Specification, CollectionUtils;

/**
 * A group of units with a common origin and purpose.
 */
export class Force extends FreeColSpecObject {
  static readonly TAG: string = 'force';
  /**
   * The number of land units in the REF.
   */
  landUnits: List<AbstractUnit> = null;
  /**
   * The number of naval units in the REF.
   */
  navalUnits: List<AbstractUnit> = null;
  /**
   * The space required to transport all land units.
   */
  spaceRequired: number = 0;
  /**
   * The current naval transport capacity.
   */
  capacity_: number = 0;
  static readonly LAND_UNITS_TAG: string = 'landUnits';
  static readonly NAVAL_UNITS_TAG: string = 'navalUnits';
  $init_Force() {
    this.landUnits = new ArrayList();
    this.navalUnits = new ArrayList();
  }
  /**
   * Basic constructor.
   *
   * @param specification The {@code Specification} for this object.
   */
  _Force$Specification(specification: Specification): this {
    this._FreeColSpecObject(specification);
    this.$init_Force();
    this.capacity_ = this.spaceRequired = 0;
    return this;
  }
  /**
   * Create a new Force.
   *
   * @param spec The {@code Specification} for this object.
   * @param units A list of {@code AbstractUnit}s defining the force.
   * @param ability An optional ability name required of the units
   *     in the force.
   */
  _Force$Specification$List$String(spec: Specification, units: List<AbstractUnit>, ability: string): this {
    this._Force$Specification(spec);
    for (const $it0 = units.iterator(); $it0.hasNext(); ) {
      let au = $it0.next();
      if (ability == null || au.getType(spec).hasAbility$String(ability)) {
        this.add(au);
      } else {
        FreeColObject.logger.warning('Found unit lacking required ability "' + ability + '": ' + $J.str(au));
      }
    }
    return this;
  }
  /**
   * Get the cargo space required for the land units of this force.
   *
   * @return The required cargo space.
   */
  getSpaceRequired(): number {
    return this.spaceRequired;
  }
  /**
   * Get the cargo space provided by the naval units of this force.
   *
   * @return The provided cargo space.
   */
  getCapacity(): number {
    return this.capacity_;
  }
  /**
   * Gets all units.
   *
   * @return A copy of the list of all units.
   */
  getUnitList(): List<AbstractUnit> {
    let result = new ArrayList();
    result.addAll(this.landUnits);
    result.addAll(this.navalUnits);
    return result;
  }
  /**
   * Clear the land unit list.
   */
  clearLandUnits(): void {
    this.landUnits.clear();
    this.spaceRequired = 0;
  }
  /**
   * Clear the naval unit list.
   */
  clearNavalUnits(): void {
    this.navalUnits.clear();
    this.capacity_ = 0;
  }
  /**
   * Gets the land units.
   *
   * @return A list of the  land units.
   */
  getLandUnitsList(): List<AbstractUnit> {
    return AbstractUnit.deepCopy(this.landUnits);
  }
  /**
   * Set the land unit list.
   *
   * @param landUnits Set the new land {@code AbstractUnit}s.
   */
  setLandUnitList(landUnits: List<AbstractUnit>): void {
    this.clearLandUnits();
    this.landUnits.addAll(landUnits);
  }
  /**
   * Gets the naval units.
   *
   * @return A copy of the list of the naval units.
   */
  getNavalUnitsList(): List<AbstractUnit> {
    return AbstractUnit.deepCopy(this.navalUnits);
  }
  /**
   * Set the naval unit list.
   *
   * @param navalUnits Set the new land {@code AbstractUnit}s.
   */
  setNavalUnitList(navalUnits: List<AbstractUnit>): void {
    this.clearNavalUnits();
    this.navalUnits.addAll(navalUnits);
  }
  /**
   * Is this Force empty?
   *
   * @return True if there are no land or naval units.
   */
  isEmpty(): boolean {
    return this.landUnits.isEmpty() && this.navalUnits.isEmpty();
  }
  /**
   * Add abstract units to this Force.
   *
   * @param au The addition to this {@code Force}.
   */
  add(au: AbstractUnit): void {
    let spec = this.getSpecification();
    let unitType = au.getType(spec);
    let n = au.getNumber();
    let matchPred = AbstractUnit.matcher$AbstractUnit(au);
    if (unitType.hasAbility$String(Ability.NAVAL_UNIT)) {
      let refUnit = CollectionUtils.find$Collection$Predicate(this.navalUnits, matchPred);
      if (refUnit != null) {
        refUnit.addToNumber(n);
      } else {
        this.navalUnits.add(au);
      }
      if (unitType.canCarryUnits()) {
        this.capacity_ = (this.capacity_ + Math.imul(unitType.getSpace(), n)) | 0;
      }
    } else {
      let refUnit = CollectionUtils.find$Collection$Predicate(this.landUnits, matchPred);
      if (refUnit != null) {
        refUnit.addToNumber(n);
      } else {
        this.landUnits.add(au);
      }
      this.spaceRequired = (this.spaceRequired + Math.imul(unitType.getSpaceTaken(), n)) | 0;
    }
  }
  /**
   * Calculate the approximate offence power of this force.
   *
   * @param naval If true, consider only naval units, otherwise
   *     consider the land units.
   * @return The approximate offence power.
   */
  calculateStrength(naval: boolean): number {
    return AbstractUnit.calculateStrength(this.getSpecification(), (naval) ? this.navalUnits : this.landUnits);
  }
  /**
   * Defend against underprovisioned navies.
   *
   * @param shipType Optional ship {@code UnitType} to create.
   * @return The amount of extra capacity.
   */
  prepareToBoard(shipType: UnitType): number {
    if (this.spaceRequired > this.capacity_) {
      if (shipType == null) {
        let spec = this.getSpecification();
        let ship0 = CollectionUtils.find$Collection$Predicate(this.navalUnits, (au) => au.getType(spec).getSpace() > 0);
        if (ship0 == null) {
          return (this.capacity_ - this.spaceRequired) | 0;
        }
        shipType = ship0.getType(spec);
      }
      let sp = shipType.getSpace();
      let more = ($J.idiv(((this.spaceRequired - this.capacity_) | 0), sp) + 1) | 0;
      if (more > 0) {
        this.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(shipType, Specification.DEFAULT_ROLE_ID, more));
      }
    }
    return (this.capacity_ - this.spaceRequired) | 0;
  }
  /**
   * Does another force match?
   *
   * @param other The other <code>Force</code> to test.
   * @return True if the other force contains the same units.
   */
  matchAll(other: Force): boolean {
    return AbstractUnit.matchUnits(this.landUnits, other.landUnits) && AbstractUnit.matchUnits(this.navalUnits, other.navalUnits);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Force));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.setLandUnitList(o.getLandUnitsList());
    this.setNavalUnitList(o.getNavalUnitsList());
    this.spaceRequired = o.getSpaceRequired();
    this.capacity_ = o.getCapacity();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  toXML$FreeColXMLWriter$String(xw: FreeColXMLWriter, tag: string): void {
    xw.writeStartElement(tag);
    xw.writeStartElement(Force.NAVAL_UNITS_TAG);
    for (const $it1 = this.navalUnits.iterator(); $it1.hasNext(); ) {
      let unit = $it1.next();
      unit.toXML$FreeColXMLWriter(xw);
    }
    xw.writeEndElement();
    xw.writeStartElement(Force.LAND_UNITS_TAG);
    for (const $it2 = this.landUnits.iterator(); $it2.hasNext(); ) {
      let unit = $it2.next();
      unit.toXML$FreeColXMLWriter(xw);
    }
    xw.writeEndElement();
    xw.writeEndElement();
  }
  /**
   * {@inheritDoc}
   */
  readFromXML(xr: FreeColXMLReader): void {
    this.clearLandUnits();
    this.clearNavalUnits();
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(Force.LAND_UNITS_TAG, tag)) {
        while (xr.moreTags()) {
          this.add(new AbstractUnit()._AbstractUnit$FreeColXMLReader(xr));
        }
      } else if ($J.equals(Force.NAVAL_UNITS_TAG, tag)) {
        while (xr.moreTags()) {
          this.add(new AbstractUnit()._AbstractUnit$FreeColXMLReader(xr));
        }
      } else {
        FreeColObject.logger.warning('Bogus Force tag: ' + tag);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Force.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append('<Force ').append(String(this.spaceRequired)).append(String.fromCharCode(47 /* \u002f */)).append(String(this.capacity_));
    for (const $it3 = this.landUnits.iterator(); $it3.hasNext(); ) {
      let au = $it3.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(au));
    }
    for (const $it4 = this.navalUnits.iterator(); $it4.hasNext(); ) {
      let au = $it4.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(au));
    }
    sb.append(String.fromCharCode(62 /* '>' */));
    return sb.toString();
  }
}

$J.define(Force, 'net.sf.freecol.common.model.Force', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObject', ctors: { 'net.sf.freecol.common.model.Specification,java.util.List,java.lang.String': '_Force$Specification$List$String', 'net.sf.freecol.common.model.Specification': '_Force$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'isEmpty': 'boolean', 'getNavalUnitsList': 'java.util.List', 'getLandUnitsList': 'java.util.List', 'getUnitList': 'java.util.List', 'getCapacity': 'int', 'getSpaceRequired': 'int' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter,java.lang.String)': 'toXML$FreeColXMLWriter$String' } });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
